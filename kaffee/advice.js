'use strict';
/* ───────── Auswertung & Vorschlag für den nächsten Shot (bewusst einfach) ─────────
   Hauptindikator ist der FLUSS: Out ÷ (Zeit − erster Tropfen) in g/s.
   Er bleibt gleich, egal ob du etwas mehr oder weniger in die Tasse laufen lässt,
   und zeigt deshalb direkt, ob der Mahlgrad passt.

   Mehr Kaffee (z. B. 20 g statt 18 g): Bei gleicher Ratio soll auch mehr in die Tasse –
   in ungefähr derselben Zeit. Der Fluss ist dann entsprechend höher. Deshalb wird jeder
   Fluss auf die Bezugsdosis umgerechnet („bezogen auf 18 g“): Fluss × 18 ÷ Dosis.
   So gilt für jede Dosis dasselbe Ziel, und nichts wird rot, nur weil du mehr nimmst.
   Ändert sich die Dosis, ändert sich aber der passende Mahlgrad (mehr Kaffee bremst
   stärker) – der Sweet Spot wird deshalb aus Shots mit ähnlicher Dosis berechnet.

   Vorschlag: Fluss zu hoch → feiner, zu niedrig → gröber (höchstens zwei Schritte,
   Schrittweite pro Sorte gelernt) · Fluss passt, Menge nicht → nur früher/später stoppen. */
(function () {
  const fmt = (x, d = 1) => (x == null || isNaN(x)) ? '–' : (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
  const fmtG = x => (x == null || x === '' || isNaN(x)) ? '–' : String(Math.round(x * 100) / 100).replace('.', ',');
  const snap = (x, step) => Math.round(x / step) * step;
  const r05 = x => Math.round(x * 2) / 2;
  const valid = s => !!s && s.din > 0 && s.dout > 0 && s.t > 0;
  const fdDef = T => T.fdDef || 10;
  const k = (din, T) => (din > 0 ? din : T.dose) / T.dose; // Faktor gegenüber der Bezugsdosis

  // Fluss ab erstem Tropfen. Ohne eingetragenen Tropfen werden 10 s angenommen (einstellbar).
  // v = gemessener Fluss, n = auf die Bezugsdosis umgerechnet (für Vergleich und Ziel)
  function flow(s, T) {
    if (!valid(s)) return null;
    const est = !(s.fd > 0 && s.fd < s.t);
    const c = s.t - (est ? fdDef(T) : s.fd);
    if (c <= 2) return null;
    const v = s.dout / c;
    return { v, n: v / k(s.din, T), est };
  }
  // Ziel-Out und Ziel-Fluss wachsen mit der Dosis (gleiche Ratio, ähnliche Zeit)
  const outRange = (din, T) => [T.outMin * k(din, T), T.outMax * k(din, T)];
  const flowRange = (din, T) => [T.fMin * k(din, T), T.fMax * k(din, T)];
  const cmp = (v, lo, hi) => (v == null || isNaN(v)) ? null : v < lo - 1e-9 ? 'lo' : v > hi + 1e-9 ? 'hi' : 'ok';

  // Pfeile: liegt jeder Wert im Ziel, darüber (hi) oder darunter (lo)? Die Dosis ist frei wählbar.
  function check(s, T) {
    const f = flow(s, T), o = outRange(s.din, T), fr = flowRange(s.din, T);
    return {
      dout: s.dout > 0 ? cmp(s.dout, o[0], o[1]) : null,
      t: s.t > 0 ? cmp(s.t, T.tMin, T.tMax) : null,
      fd: s.fd > 0 ? cmp(s.fd, T.fdMin, T.fdMax) : null,
      flow: f ? cmp(f.n, T.fMin, T.fMax) : null,
      f, o, fr,
    };
  }

  /* Sweet Spot je Sorte und Dosis: Mahlgrad → Fluss (bezogen auf die Bezugsdosis).
     Zuerst echte Treffer, sonst zwischen zwei Mahlgraden eingrenzen, erst zuletzt Trendlinie. */
  function sweet(shots, T, st, dose) {
    const step = st.step || 0.25, d0 = dose > 0 ? dose : T.dose;
    const pts = shots.filter(s => valid(s) && s.grind != null && s.grind !== '' && !isNaN(s.grind) && Math.abs(s.din - d0) <= 1)
      .slice(-20).map(s => ({ x: +s.grind, y: (flow(s, T) || {}).n, s })).filter(p => p.y != null);
    const res = { pts, n: pts.length, per: null, range: null, method: null, dose: d0 };
    if (!pts.length) return res;
    const xs = [...new Set(pts.map(p => p.x))];
    if (pts.length >= 3 && xs.length >= 2) {
      const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length, my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      let sxx = 0, sxy = 0;
      for (const p of pts) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my); }
      const b = sxy / sxx, per = st.coarserUp ? b : -b; // gröber → mehr Fluss
      if (sxx > 1e-6 && per >= 0.05 && per <= 5) Object.assign(res, { a: my - b * mx, b, per });
    }
    const g = {};
    for (const p of pts) { (g[p.x] = g[p.x] || { x: p.x, ys: [], ts: 0 }).ys.push(p.y); g[p.x].ts = Math.max(g[p.x].ts, p.s.ts || 0); }
    const gm = Object.values(g).map(o => ({ ...o, m: o.ys.reduce((a, b) => a + b, 0) / o.ys.length })).sort((a, b) => a.x - b.x);
    gm.forEach(o => { o.ok = o.m >= T.fMin && o.m <= T.fMax; });
    let sd = 0, df = 0;
    for (const o of gm) if (o.ys.length > 1) { sd += o.ys.reduce((a, y) => a + (y - o.m) ** 2, 0); df += o.ys.length - 1; }
    res.spread = df ? Math.sqrt(sd / df) : null;
    if (gm.some(o => o.ok)) {
      const newest = gm.filter(o => o.ok).reduce((a, o) => o.ts > a.ts ? o : a);
      let i = gm.indexOf(newest), j = i;
      while (i > 0 && gm[i - 1].ok) i--;
      while (j < gm.length - 1 && gm[j + 1].ok) j++;
      Object.assign(res, { method: 'data', range: [gm[i].x, gm[j].x], hits: gm.slice(i, j + 1).reduce((a, o) => a + o.ys.length, 0) });
    } else {
      const mid = (T.fMin + T.fMax) / 2;
      for (let i = 0; i < gm.length - 1; i++) {
        const a = gm[i], b = gm[i + 1];
        if ((a.m - mid) * (b.m - mid) < 0) {
          const at = f => snap(a.x + (b.x - a.x) * (f - a.m) / (b.m - a.m), step);
          Object.assign(res, { method: 'between', range: [at(T.fMin), at(T.fMax)].sort((p, q) => p - q) });
          break;
        }
      }
      if (!res.method && res.per) {
        const at = f => snap((f - res.a) / res.b, step);
        const r = [at(T.fMin), at(T.fMax)].sort((p, q) => p - q);
        const lo = Math.min(...xs), hi = Math.max(...xs);
        Object.assign(res, { method: 'trend', range: r, extrap: r[1] < lo - 2 * step || r[0] > hi + 2 * step });
      }
    }
    return res;
  }

  // Ein Satz für den nächsten Shot (mit derselben Dosis wie zuletzt)
  function next(s, shots, T, st) {
    const c = check(s, T), step = st.step || 0.25, dir = st.coarserUp ? 1 : -1;
    const din = s && s.din > 0 ? s.din : T.dose, o = outRange(din, T);
    const out = r05((o[0] + o[1]) / 2);
    const r = { status: 'good', title: '', sub: '', din, dout: out, grind: s && s.grind != null && s.grind !== '' ? +s.grind : null, c };
    if (!valid(s)) { r.status = 'none'; r.title = 'Werte unvollständig'; r.sub = 'Für einen Vorschlag brauche ich In, Out und Zeit.'; return r; }
    const est = c.f && c.f.est ? ` Erster Tropfen nicht eingetragen – ${fdDef(T)} s angenommen.` : '';
    const other = Math.abs(din - T.dose) >= 0.5 ? ` (bei ${fmt(din)} g: ${fmt(c.fr[0])}–${fmt(c.fr[1])} g/s)` : '';
    if (c.flow === 'hi' || c.flow === 'lo') {
      const sw = sweet(shots, T, st, din), mid = (T.fMin + T.fMax) / 2, dev = c.f.n - mid, finer = dev > 0;
      let units = sw.per ? Math.abs(dev) / sw.per : (Math.abs(dev) > (T.fMax - T.fMin) ? 2 * step : step);
      units = Math.max(snap(units, step), step);
      // höchstens zwei Schritte auf einmal – Trends aus wenigen Shots übertreiben oft
      const capped = units > 2 * step, trendG = r.grind != null ? +(r.grind + (finer ? -1 : 1) * dir * units).toFixed(2) : null;
      if (capped) units = 2 * step;
      if (r.grind != null) r.grind = +(r.grind + (finer ? -1 : 1) * dir * units).toFixed(2);
      r.status = Math.abs(dev) > (T.fMax - T.fMin) ? 'bad' : 'warn';
      r.title = `${finer ? 'Feiner' : 'Gröber'} mahlen${s.grind != null && s.grind !== '' ? `: ${fmtG(s.grind)} → ${fmtG(r.grind)}` : ''}`;
      r.sub = `Fluss ${fmt(c.f.v)} g/s ist zu ${finer ? 'hoch' : 'niedrig'}${other || ` (Ziel ${fmt(T.fMin)}–${fmt(T.fMax)} g/s)`}.` +
        (sw.per ? ` Bei dieser Sorte bringt eine Mahlgrad-Einheit ca. ${fmt(sw.per)} g/s.` : ' Schrittweite geschätzt – wird mit jedem Shot genauer.') +
        (capped && trendG != null ? ` Laut Trend wäre es eher ${fmtG(trendG)} – lieber in kleinen Schritten annähern.` : '') + est;
      return r;
    }
    if (c.dout && c.dout !== 'ok') {
      r.status = 'warn'; r.title = `Bei ${fmt(out)} g stoppen`;
      r.sub = `Der Fluss passt – nur die Menge: ${fmt(s.dout)} g ist zu ${c.dout === 'hi' ? 'viel' : 'wenig'} (Ziel bei ${fmt(din)} g: ${fmt(o[0], 0)}–${fmt(o[1], 0)} g). Mahlgrad so lassen.` + est;
      return r;
    }
    if (c.fd && c.fd !== 'ok') {
      r.status = 'warn'; r.title = 'Fast perfekt – auf den ersten Tropfen achten';
      r.sub = c.fd === 'lo' ? `Erster Tropfen schon nach ${fmt(s.fd, 0)} s. Oft ist der Kaffee ungleichmäßig verteilt (Channeling): gut verteilen und gerade tampen.`
        : `Erster Tropfen erst nach ${fmt(s.fd, 0)} s – eher zu fein oder zu viel im Sieb.`;
      return r;
    }
    r.title = 'Passt – so beibehalten';
    r.sub = `Fluss ${fmt(c.f.v)} g/s, ${fmt(s.dout)} g in ${fmt(s.t, 0)} s. Jetzt entscheidet dein Geschmack.` + est;
    return r;
  }

  window.Advice = { flow, check, sweet, next, outRange, flowRange, fmt, fmtG, snap, valid, r05 };
})();
