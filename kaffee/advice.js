'use strict';
/* ───────── Empfehlungs-Logik fürs Einstellen (Dial-in) ─────────
   Grundregeln (klassisches Espresso-Dial-in):
   1. Ratio (Out : In) ist das Rezept – die Ausbeute wird immer aufs Ziel gesetzt.
   2. Die Zeit wird über den Mahlgrad gesteuert. Weicht die Ausbeute ab, wird die Zeit
      erst auf die Ziel-Ausbeute umgerechnet (Fluss nach dem ersten Tropfen ≈ konstant).
   3. Liegt die Zeit im Ziel, entscheidet der Geschmack:
      sauer → mehr Extraktion (feiner, längere Ratio, heißer)
      bitter → weniger Extraktion (gröber, kürzere Ratio, kühler)
   4. Immer nur eine Stellschraube auf einmal ändern.
   Wie viele Sekunden eine Mahlgrad-Einheit ausmacht, lernt die App aus den eigenen Shots
   derselben Bohne (lineare Regression); bis dahin gilt der Wert aus den Einstellungen. */
(function () {
  const TEMPS = ['0', 'I', 'II'];
  const TEMP_C = { 0: 'ca. 90–91 °C', I: 'ca. 91–93 °C', II: 'ca. 93–95 °C' }; // eigene Messung
  const r05 = x => Math.round(x * 2) / 2;
  const fmt = (x, d = 1) => (x == null || isNaN(x)) ? '–' : (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
  const fmtG = x => {
    if (x == null || isNaN(x)) return '–';
    return String(Math.round(x * 100) / 100).replace('.', ',');
  };
  const snap = (x, step) => Math.round(x / step) * step;
  const valid = s => s && s.din > 0 && s.dout > 0 && s.t > 0;
  const hasFd = s => s.fd > 0 && s.fd < s.t;

  // Zeit, die der Shot bei Ziel-Ausbeute gebraucht hätte
  function timeAtTarget(s, ratio) {
    const out = ratio * s.din;
    if (!valid(s) || Math.abs(s.dout - out) / out < 0.04) return s.t;
    return hasFd(s) ? s.fd + (s.t - s.fd) * out / s.dout : s.t * out / s.dout;
  }
  function metrics(s, ratio) {
    if (!valid(s)) return null;
    const contact = hasFd(s) ? s.t - s.fd : s.t;
    return { ratio: s.dout / s.din, flow: s.dout / contact, contact, tAdj: timeAtTarget(s, ratio) };
  }

  /* Modell pro Bohne: Zeit (bei Ziel-Ausbeute) = a + b · Mahlgrad, aus den letzten 15 Shots.
     Liefert außerdem die Streuung bei gleichem Mahlgrad (wie reproduzierbar sind die Shots?)
     und den Mahlgrad-Bereich, in dem die Zeit im Ziel landen sollte. */
  function fit(shots, ratio, coarserUp, T, step = 0.25) {
    let use = shots.filter(s => valid(s) && s.grind != null && !isNaN(s.grind));
    // Eine andere Dosis verändert die Zeit stark – deshalb nur Shots mit etwa der Ziel-Dosis (±0,75 g)
    let doseOnly = false;
    if (T && T.dose) { const near = use.filter(s => Math.abs(s.din - T.dose) <= 0.75); if (near.length >= 3) { doseOnly = near.length < use.length; use = near; } }
    const pts = use.slice(-15).map(s => ({ x: +s.grind, y: timeAtTarget(s, ratio), s }));
    const res = { pts, n: pts.length, ok: false, sd: null, rsd: null, conf: 'gering', doseOnly };
    // Streuung bei gleichem Mahlgrad (gepoolte Standardabweichung)
    const groups = {}, lastTs = {};
    for (const p of pts) { (groups[p.x] = groups[p.x] || []).push(p.y); lastTs[p.x] = Math.max(lastTs[p.x] || 0, p.s.ts || 0); }
    let ss = 0, df = 0;
    for (const g of Object.values(groups)) if (g.length > 1) { const m = g.reduce((a, b) => a + b, 0) / g.length; ss += g.reduce((a, y) => a + (y - m) ** 2, 0); df += g.length - 1; }
    if (df) res.sd = Math.sqrt(ss / df);
    const xs = new Set(pts.map(p => p.x));
    if (pts.length >= 3 && xs.size >= 2) {
      const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length, my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      let sxx = 0, sxy = 0;
      for (const p of pts) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my); }
      const b = sxy / sxx, a = my - b * mx, spu = coarserUp ? -b : b; // gröber → schneller muss positiv sein
      if (sxx > 1e-6 && spu >= 0.5 && spu <= 40) {
        Object.assign(res, { ok: true, a, b, spu });
        if (pts.length > 2) res.rsd = Math.sqrt(pts.reduce((acc, p) => acc + (p.y - (a + b * p.x)) ** 2, 0) / (pts.length - 2));
        if (T) {
          const g = t => snap((t - a) / b, step);
          const lo = Math.min(g(T.tMin), g(T.tMax)), hi = Math.max(g(T.tMin), g(T.tMax));
          const xmin = Math.min(...xs), xmax = Math.max(...xs);
          res.range = [lo, hi];
          res.extrap = hi < xmin - step || lo > xmax + step;
        }
      }
    }
    const noise = res.sd != null ? res.sd : res.rsd;
    res.noise = noise;
    // Ziel-Mahlgrad: zuerst echte Treffer, dann Eingrenzung zwischen zwei Mahlgraden, zuletzt Trendlinie
    if (T) {
      const mid = (T.tMin + T.tMax) / 2;
      const gm = Object.entries(groups).map(([x, ys]) => ({ x: +x, k: ys.length, ts: lastTs[x], m: ys.reduce((a, b) => a + b, 0) / ys.length, ok: false })).sort((a, b) => a.x - b.x);
      gm.forEach(g => { g.ok = g.m >= T.tMin && g.m <= T.tMax; });
      if (gm.some(g => g.ok)) {
        // zusammenhängender Trefferbereich um den neuesten Treffer (ein langsamer Mahlgrad dazwischen trennt)
        const newest = gm.filter(g => g.ok).reduce((a, g) => g.ts > a.ts ? g : a);
        let i = gm.indexOf(newest), j = i;
        while (i > 0 && gm[i - 1].ok) i--;
        while (j < gm.length - 1 && gm[j + 1].ok) j++;
        const run = gm.slice(i, j + 1);
        Object.assign(res, { method: 'data', range: [run[0].x, run[run.length - 1].x], extrap: false, hits: run.reduce((a, g) => a + g.k, 0) });
      } else {
        for (let i = 0; i < gm.length - 1; i++) {
          const a = gm[i], b = gm[i + 1];
          if ((a.m - mid) * (b.m - mid) < 0) {
            const at = t => snap(a.x + (b.x - a.x) * (t - a.m) / (b.m - a.m), step);
            const r = [at(T.tMin), at(T.tMax)].sort((p, q) => p - q);
            Object.assign(res, { method: 'between', range: r, extrap: false, between: [a.x, b.x] });
            break;
          }
        }
      }
      if (!res.method && res.ok && res.range) res.method = 'trend';
      if (!res.method) res.range = null;
    }
    if (res.method === 'data') res.conf = res.hits >= 3 && (noise == null || noise <= 3.5) ? 'hoch' : res.hits >= 2 ? 'mittel' : 'gering';
    else if (res.method === 'between') res.conf = noise == null || noise <= 5 ? 'mittel' : 'gering';
    else if (res.ok) res.conf = res.n >= 6 && noise != null && noise <= 3.5 ? 'hoch' : res.n >= 4 && (noise == null || noise <= 6) ? 'mittel' : 'gering';
    if (noise != null && noise > 6) res.conf = 'gering'; // große Streuung: ehrlich bleiben
    return res;
  }
  function learn(shots, ratio, coarserUp) { const f = fit(shots, ratio, coarserUp); return f.ok ? { spu: f.spu, n: f.n } : null; }

  function timeState(t, T) { return t < T.tMin ? 'fast' : t > T.tMax ? 'slow' : 'ok'; }

  /* s = Shot, c = { targets:{ratio,tMin,tMax,fdMin,fdMax,dose}, coarserUp, step, spu, learned, ageDays, roast } */
  function analyze(s, c) {
    const T = c.targets, R = T.ratio, step = c.step || 0.25, dir = c.coarserUp ? 1 : -1;
    const res = { status: 'none', title: '', text: '', reasons: [], changes: [], next: null, m: null };
    if (!valid(s)) { res.title = 'Werte unvollständig'; res.text = 'Für eine Empfehlung brauche ich mindestens In, Out und Zeit.'; return res; }
    const m = res.m = metrics(s, R);
    const tMid = (T.tMin + T.tMax) / 2;
    const targetOut = r05(R * s.din);
    // Die Dosis ist Teil des Rezepts: der nächste Shot startet immer mit der Ziel-Dosis
    const dose0 = T.dose || s.din;
    const next = res.next = { din: dose0, dout: r05(R * dose0), grind: s.grind, temp: s.temp || '' };
    const why = (i, t, p = 5) => res.reasons.push({ i, t, p });
    const grindOk = s.grind != null && !isNaN(s.grind);
    const tState = timeState(m.tAdj, T);
    const taste = s.taste == null ? null : +s.taste;
    const tags = s.tags || [];
    let grindUnits = 0, main = '', explain = '';
    const tAdjTxt = Math.abs(m.tAdj - s.t) >= 0.5 ? `${fmt(m.tAdj, 0)} s (auf ${fmt(targetOut, 1)} g umgerechnet)` : `${fmt(s.t, 0)} s`;

    // 1) Ausbeute
    const ratioDev = m.ratio - R;
    if (Math.abs(ratioDev) > 0.12 && !(T.dose && Math.abs(s.din - T.dose) >= 1.5)) {
      why('⚖️', `Ratio 1 : ${fmt(m.ratio)} statt 1 : ${fmt(R)} – nächstes Mal bei <b>${fmt(r05(R * dose0))} g</b> stoppen.`, 4);
    }

    // 2) Dosis stark daneben? Dann zuerst nur die Dosis zurückstellen (eine Änderung zur Zeit)
    const doseBack = !!(T.dose && Math.abs(s.din - T.dose) >= 1.5);
    if (doseBack) {
      next.din = T.dose; next.dout = r05(R * T.dose);
      explain = `Mit ${fmt(s.din)} g ist das Sieb ${s.din > T.dose ? 'überfüllt' : 'zu leer'} – das verändert den Fluss stark (${tAdjTxt}). Erst die Dosis zurück auf ${fmt(T.dose)} g, dann den Mahlgrad beurteilen.`;
    }
    // 3) Zeit → Mahlgrad
    if (tState !== 'ok' && !doseBack) {
      const dev = m.tAdj - tMid; // + = zu langsam → gröber
      grindUnits = dev / c.spu;
      if (Math.abs(grindUnits) < step) grindUnits = Math.sign(dev) * step;
      const cap = Math.max(1, step * 4);
      if (Math.abs(grindUnits) > cap) { grindUnits = Math.sign(grindUnits) * cap; why('🪜', 'Großer Sprung – lieber in zwei Schritten annähern und dazwischen einen Shot ziehen.'); }
      explain = `Lief ${tState === 'fast' ? 'zu schnell' : 'zu langsam'}: ${tAdjTxt} – Ziel ${T.tMin}–${T.tMax} s.`;
    }

    // 3) Geschmack (wenn die Zeit passt – sonst nur einordnen)
    let tempMove = 0, ratioMove = 0;
    if (taste != null && taste !== 0 && !doseBack) {
      const sour = taste < 0, strong = Math.abs(taste) >= 2;
      if (tState === 'ok') {
        if (sour) {
          if (m.tAdj < T.tMax - 1 && grindOk) { grindUnits = -step * (strong ? 2 : 1); explain = `Zeit passt (${tAdjTxt}), schmeckt aber sauer → etwas mehr Extraktion.`; }
          else if (ratioDev < 0.25) { ratioMove = 0.2; explain = `Zeit ist schon am oberen Ende, schmeckt sauer → länger laufen lassen.`; }
          else { tempMove = 1; explain = 'Zeit und Ratio ausgereizt, schmeckt sauer → heißer brühen.'; }
        } else {
          if (m.tAdj > T.tMin + 1 && grindOk) { grindUnits = step * (strong ? 2 : 1); explain = `Zeit passt (${tAdjTxt}), schmeckt aber bitter → etwas weniger Extraktion.`; }
          else if (ratioDev > -0.25) { ratioMove = -0.2; explain = 'Zeit ist schon am unteren Ende, schmeckt bitter → früher stoppen.'; }
          else { tempMove = -1; explain = 'Zeit und Ratio ausgereizt, schmeckt bitter → kühler brühen.'; }
        }
      } else if ((tState === 'fast' && !sour) || (tState === 'slow' && sour)) {
        why('🤔', `Geschmack (${sour ? 'sauer' : 'bitter'}) passt nicht zur Zeit (${tState === 'fast' ? 'schnell' : 'langsam'}) – oft ein Zeichen für <b>Channeling</b>: Kaffee rauscht durch Risse, ein Teil wird über-, ein Teil unterextrahiert.`, 2);
      }
    }
    if (ratioMove) next.dout = r05(next.din * (R + ratioMove));

    // Temperatur (Mara X: Stufe 0 / I / II) – nur, wenn sonst nichts geändert wird
    if (tempMove && s.temp && TEMPS.includes(s.temp)) {
      const i = TEMPS.indexOf(s.temp) + tempMove;
      if (i >= 0 && i < TEMPS.length) next.temp = TEMPS[i];
      else { why('🌡️', `Temperatur ist schon auf Stufe ${s.temp}. ${tempMove > 0 ? 'Feiner mahlen und dafür etwas mehr Ratio probieren.' : 'Gröber mahlen und kürzere Ratio probieren.'}`); }
    }

    if (grindUnits && grindOk) next.grind = +(snap(+s.grind + dir * grindUnits, step)).toFixed(2);

    // 4) Erster Tropfen (Pre-Infusion der Mara X)
    if (hasFd(s)) {
      if (s.fd < T.fdMin) why('💧', `Erster Tropfen schon nach ${fmt(s.fd, 0)} s (sonst ${T.fdMin}–${T.fdMax} s). Spricht für zu grob${tState === 'ok' ? ' oder ein ungleichmäßiges Puck (Channeling)' : ''} – Verteilung (WDT) und gerades Tampen prüfen.`);
      else if (s.fd > T.fdMax) why('💧', `Erster Tropfen erst nach ${fmt(s.fd, 0)} s (sonst ${T.fdMin}–${T.fdMax} s). Eher zu fein oder zu viel Kaffee im Sieb.`);
      else why('💧', `Erster Tropfen nach ${fmt(s.fd, 0)} s – genau im gewohnten Bereich.`);
      if (s.fd < T.fdMin && tState === 'slow') why('🔍', 'Früher erster Tropfen, aber insgesamt langsam: typisch für Channeling am Rand – Puck auf Löcher prüfen.');
    }

    // 5) Tags
    if (tags.includes('Channeling') || tags.includes('Spritzer')) why('🧹', 'Channeling/Spritzer: Kaffee gut verteilen (WDT-Tool), gerade tampen, Sieb trocken auswischen. Erst danach am Mahlgrad drehen.', 3);
    if (tags.includes('Wässrig')) why('🫗', `Wässrig/dünn: Dosis +0,5 g (${fmt(s.din + 0.5)} g) oder etwas kürzere Ratio probieren.`);
    if (tags.includes('Adstringierend')) why('😖', 'Adstringierend/trocken = meist ungleichmäßige Extraktion: Puck-Vorbereitung prüfen, ggf. eine Stufe kühler.');

    // 6) Dosis & Bohnen
    if (T.dose && !doseBack && Math.abs(s.din - T.dose) >= 0.3) { res.changes.push('din'); why('🥄', `Dosis wieder genau auf <b>${fmt(T.dose)} g</b> wiegen (zuletzt ${fmt(s.din)} g) – schon 0,5 g verändern die Zeit um mehrere Sekunden.`, 3); }
    if (c.ageDays != null) {
      if (c.ageDays < 5) why('🫘', `Bohnen erst ${c.ageDays} Tage nach Röstung – noch viel CO₂, Shots schwanken. Ab ca. Tag 7–10 stabiler.`);
      else if (c.ageDays > 42) why('🫘', `Bohnen ${c.ageDays} Tage nach Röstung – ältere Bohnen laufen schneller, mit der Zeit feiner nachstellen.`);
    }
    if (c.roast === 'dunkel' && s.temp === 'II') why('🌡️', 'Dunkle Röstung auf Stufe II wird schnell bitter – Stufe 0 oder I ist meist besser.');
    if (c.roast === 'hell' && s.temp === '0') why('🌡️', 'Helle Röstung braucht eher mehr Temperatur – Stufe II probieren, falls sauer.');

    // 7) Ehrlichkeit: wie reproduzierbar sind die Shots dieser Bohne?
    const F = c.fit;
    if (F && F.noise != null && F.noise > 5 && F.n >= 4) why('🎯', `Bei gleichem Mahlgrad schwanken deine Shots um <b>±${fmt(F.noise, 0)} s</b>. Solange das so ist, ist jede Mahlgrad-Empfehlung ein Stück Glück – zuerst Dosis (auf 0,1 g), Verteilung und Tampen gleich halten.`, 1);
    res.conf = F && F.ok ? F.conf : 'gering';
    res.confTxt = F && F.ok ? `aus ${F.n} Shots dieser Bohne${F.noise != null ? ', Streuung ±' + fmt(F.noise, 0) + ' s' : ''}` : 'Faustregel – noch zu wenige Shots mit verschiedenen Mahlgraden';

    // Titel & Status
    const gTxt = (a, b) => `${fmtG(a)} → ${fmtG(b)}`;
    const grindChanged = grindOk && next.grind !== +s.grind;
    if (doseBack) { main = `Zurück auf ${fmt(T.dose)} g Dosis`; res.changes.push('din'); }
    else if (grindChanged) {
      const finer = (next.grind - s.grind) * dir < 0;
      main = `${finer ? 'Feiner' : 'Gröber'} mahlen: ${gTxt(s.grind, next.grind)}`;
      res.changes.push('grind');
      const exp = m.tAdj - (next.grind - s.grind) * dir * c.spu;
      why('⏱️', `Erwartet beim nächsten Shot: ca. <b>${fmt(Math.max(10, exp), 0)} s</b>${c.learned ? ' (aus deinen Shots gelernt: ~' + fmt(c.spu, 1) + ' s pro Einheit)' : ' (Faustregel – wird mit jedem Shot dieser Bohne genauer)'}.`, 2);
    } else if (tState !== 'ok' && !grindOk) {
      main = tState === 'fast' ? 'Feiner mahlen' : 'Gröber mahlen';
    }
    if (next.temp !== (s.temp || '')) { res.changes.push('temp'); if (!main) main = `Temperatur ${tempMove > 0 ? 'hoch' : 'runter'}: Stufe ${s.temp} → ${next.temp} (${TEMP_C[next.temp]})`; }
    if (Math.abs(next.dout - s.dout) >= 1) { res.changes.push('dout'); if (!main) main = `Bei ${fmt(next.dout)} g stoppen (statt ${fmt(s.dout)} g)`; }

    const fdBad = hasFd(s) && (s.fd < T.fdMin - 1 || s.fd > T.fdMax + 1);
    if (!main) {
      res.status = 'good';
      if (taste === 0) { main = 'Perfekt – Rezept so beibehalten'; explain = `Zeit ${tAdjTxt}, Ratio 1 : ${fmt(m.ratio)} und ausgewogener Geschmack.`; }
      else if (taste == null) { main = 'Im Zielbereich'; explain = `Zeit ${tAdjTxt}, Ratio 1 : ${fmt(m.ratio)}. Bewerte den Geschmack (sauer ↔ bitter), dann gibt’s Feintuning.`; }
      else { main = 'So beibehalten'; }
      if (fdBad || tags.includes('Channeling')) res.status = 'warn';
    } else {
      const far = Math.abs(m.tAdj - tMid) > (T.tMax - T.tMin) / 2 + 6 || Math.abs(ratioDev) > 0.5;
      res.status = far ? 'bad' : 'warn';
    }
    res.title = main;
    res.text = explain || (Math.abs(ratioDev) > 0.12 ? `Zeit ${tAdjTxt} passt – nur die Ausbeute anpassen.` : '');
    res.tState = tState;
    res.reasons.sort((x, y) => x.p - y.p);
    return res;
  }

  window.Advice = { analyze, learn, fit, snap, valid, metrics, timeAtTarget, timeState, TEMPS, TEMP_C, fmt, fmtG, r05 };
})();
