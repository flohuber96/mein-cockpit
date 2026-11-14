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
  const TEMP_C = { 0: 'ca. 90 °C', I: 'ca. 93 °C', II: 'ca. 95 °C' };
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

  // Sekunden pro Mahlgrad-Einheit aus eigenen Shots lernen
  function learn(shots, ratio, coarserUp) {
    const pts = shots.filter(s => valid(s) && s.grind != null && !isNaN(s.grind)).slice(-15)
      .map(s => ({ x: +s.grind, y: timeAtTarget(s, ratio) }));
    const xs = new Set(pts.map(p => p.x));
    if (pts.length < 3 || xs.size < 2) return null;
    const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length, my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    let sxx = 0, sxy = 0;
    for (const p of pts) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my); }
    if (sxx < 1e-6) return null;
    const b = sxy / sxx; // Sekunden je Einheit (Vorzeichen: Richtung)
    const spu = coarserUp ? -b : b; // gröber → schneller muss positiv herauskommen
    if (!(spu >= 0.5 && spu <= 25)) return null;
    return { spu, n: pts.length };
  }

  function timeState(t, T) { return t < T.tMin ? 'fast' : t > T.tMax ? 'slow' : 'ok'; }

  /* s = Shot, c = { targets:{ratio,tMin,tMax,fdMin,fdMax,dose}, coarserUp, step, spu, learned, ageDays, roast } */
  function analyze(s, c) {
    const T = c.targets, R = T.ratio, step = c.step || 0.25, dir = c.coarserUp ? 1 : -1;
    const res = { status: 'none', title: '', text: '', reasons: [], changes: [], next: null, m: null };
    if (!valid(s)) { res.title = 'Werte unvollständig'; res.text = 'Für eine Empfehlung brauche ich mindestens In, Out und Zeit.'; return res; }
    const m = res.m = metrics(s, R);
    const tMid = (T.tMin + T.tMax) / 2;
    const targetOut = r05(R * s.din);
    const next = res.next = { din: s.din, dout: targetOut, grind: s.grind, temp: s.temp || '' };
    const why = (i, t) => res.reasons.push({ i, t });
    const grindOk = s.grind != null && !isNaN(s.grind);
    const tState = timeState(m.tAdj, T);
    const taste = s.taste == null ? null : +s.taste;
    const tags = s.tags || [];
    let grindUnits = 0, main = '', explain = '';
    const tAdjTxt = Math.abs(m.tAdj - s.t) >= 0.5 ? `${fmt(m.tAdj, 0)} s (auf ${fmt(targetOut, 1)} g umgerechnet)` : `${fmt(s.t, 0)} s`;

    // 1) Ausbeute
    const ratioDev = m.ratio - R;
    if (Math.abs(ratioDev) > 0.12) {
      why('⚖️', `Ratio 1 : ${fmt(m.ratio)} statt 1 : ${fmt(R)} – nächstes Mal bei <b>${fmt(targetOut)} g</b> stoppen.`);
    }

    // 2) Zeit → Mahlgrad
    if (tState !== 'ok') {
      const dev = m.tAdj - tMid; // + = zu langsam → gröber
      grindUnits = dev / c.spu;
      if (Math.abs(grindUnits) < step) grindUnits = Math.sign(dev) * step;
      const cap = Math.max(1, step * 4);
      if (Math.abs(grindUnits) > cap) { grindUnits = Math.sign(grindUnits) * cap; why('🪜', 'Großer Sprung – lieber in zwei Schritten annähern und dazwischen einen Shot ziehen.'); }
      explain = `Lief ${tState === 'fast' ? 'zu schnell' : 'zu langsam'}: ${tAdjTxt} – Ziel ${T.tMin}–${T.tMax} s.`;
    }

    // 3) Geschmack (wenn die Zeit passt – sonst nur einordnen)
    let tempMove = 0, ratioMove = 0;
    if (taste != null && taste !== 0) {
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
        why('🤔', `Geschmack (${sour ? 'sauer' : 'bitter'}) passt nicht zur Zeit (${tState === 'fast' ? 'schnell' : 'langsam'}) – oft ein Zeichen für <b>Channeling</b>: Kaffee rauscht durch Risse, ein Teil wird über-, ein Teil unterextrahiert.`);
      }
    }
    if (ratioMove) next.dout = r05(s.din * (R + ratioMove));

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
    if (tags.includes('Channeling') || tags.includes('Spritzer')) why('🧹', 'Channeling/Spritzer: Kaffee gut verteilen (WDT-Tool), gerade tampen, Sieb trocken auswischen. Erst danach am Mahlgrad drehen.');
    if (tags.includes('Wässrig')) why('🫗', `Wässrig/dünn: Dosis +0,5 g (${fmt(s.din + 0.5)} g) oder etwas kürzere Ratio probieren.`);
    if (tags.includes('Adstringierend')) why('😖', 'Adstringierend/trocken = meist ungleichmäßige Extraktion: Puck-Vorbereitung prüfen, ggf. eine Stufe kühler.');

    // 6) Dosis & Bohnen
    if (T.dose && Math.abs(s.din - T.dose) >= 1.5) why('🥄', `Dosis ${fmt(s.din)} g weicht stark von ${fmt(T.dose)} g ab – das Sieb ist auf eine Menge ausgelegt, zu viel/wenig verändert den Fluss stark.`);
    if (c.ageDays != null) {
      if (c.ageDays < 5) why('🫘', `Bohnen erst ${c.ageDays} Tage nach Röstung – noch viel CO₂, Shots schwanken. Ab ca. Tag 7–10 stabiler.`);
      else if (c.ageDays > 42) why('🫘', `Bohnen ${c.ageDays} Tage nach Röstung – ältere Bohnen laufen schneller, mit der Zeit feiner nachstellen.`);
    }
    if (c.roast === 'dunkel' && s.temp === 'II') why('🌡️', 'Dunkle Röstung auf Stufe II wird schnell bitter – Stufe 0 oder I ist meist besser.');
    if (c.roast === 'hell' && s.temp === '0') why('🌡️', 'Helle Röstung braucht eher mehr Temperatur – Stufe II probieren, falls sauer.');

    // Titel & Status
    const gTxt = (a, b) => `${fmtG(a)} → ${fmtG(b)}`;
    const grindChanged = grindOk && next.grind !== +s.grind;
    if (grindChanged) {
      const finer = (next.grind - s.grind) * dir < 0;
      main = `${finer ? 'Feiner' : 'Gröber'} mahlen: ${gTxt(s.grind, next.grind)}`;
      res.changes.push('grind');
      const exp = m.tAdj - (next.grind - s.grind) * dir * c.spu;
      why('⏱️', `Erwartet beim nächsten Shot: ca. <b>${fmt(Math.max(10, exp), 0)} s</b>${c.learned ? ' (aus deinen Shots gelernt: ~' + fmt(c.spu, 1) + ' s pro Einheit)' : ' (Schätzung – wird mit jedem Shot genauer)'}.`);
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
    return res;
  }

  window.Advice = { analyze, learn, metrics, timeAtTarget, timeState, TEMPS, TEMP_C, fmt, fmtG, r05 };
})();
