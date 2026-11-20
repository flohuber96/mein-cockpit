'use strict';
/* ───────── Diagramme (inline SVG, Farben über CSS-Variablen → hell/dunkel automatisch) ───────── */
(function () {
  const f = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
  const fg = x => String(Math.round(x * 100) / 100).replace('.', ',');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const niceStep = (span, n = 4) => { const raw = span / n, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; };
  const C = { ok: 'var(--acc)', off: 'var(--warn)' };

  /* Verlauf: Fluss, Zeit und Mahlgrad untereinander, gemeinsame x-Achse, ein Fadenkreuz für alle */
  function history(rows, o) {
    const n = rows.length; if (!n) return '';
    const W = 340, L = 40, R = 12, rowH = 74, gap = 22, top = 8;
    const panels = [
      { key: 'flow', label: o.flowLabel || 'Fluss (g/s)', band: o.flowBand, dec: 1, fixed: o.flowAxis },
      { key: 't', label: 'Zeit (s)', band: o.timeBand, dec: 0 },
      { key: 'grind', label: 'Mahlgrad', band: o.grindBand, dec: 2, step: true },
    ];
    const H = top + panels.length * (rowH + gap) + 8;
    const X = i => n === 1 ? (L + W - R) / 2 : L + (W - L - R) * i / (n - 1);
    let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Verlauf von Fluss, Zeit und Mahlgrad" data-xh='${esc(JSON.stringify(rows.map((r, i) => ({ x: X(i), tip: r.tip }))))}'>`;
    panels.forEach((p, k) => {
      const y0 = top + k * (rowH + gap) + 14, y1 = y0 + rowH - 14;
      const vals = rows.map(r => r[p.key]).filter(v => v != null && !isNaN(v));
      h += `<text x="4" y="${y0 - 4}" style="fill:var(--t1);font-size:11.5px;font-weight:800">${p.label}</text>`;
      if (!vals.length) { h += `<text x="${(L + W) / 2}" y="${(y0 + y1) / 2}" text-anchor="middle" style="fill:var(--t3);font-size:11px">keine Werte</text>`; return; }
      let lo, hi;
      if (p.fixed) [lo, hi] = p.fixed;
      else {
        lo = Math.min(...vals, ...(p.band || [])); hi = Math.max(...vals, ...(p.band || []));
        const minSpan = p.key === 't' ? 8 : 0.5;
        if (hi - lo < minSpan) { const m = (hi + lo) / 2; lo = m - minSpan / 2; hi = m + minSpan / 2; }
        const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
      }
      const Y = v => y1 - (y1 - y0) * (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo);
      const st = p.fixed ? 0.5 : niceStep(hi - lo, 3);
      for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) h += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" style="stroke:var(--grid)"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" style="fill:var(--t2);font-size:10.5px">${f(v, st < 1 ? (st < 0.1 ? 2 : 1) : 0)}</text>`;
      if (p.band) h += `<rect x="${L}" y="${Y(p.band[1])}" width="${W - L - R}" height="${Math.max(2, Y(p.band[0]) - Y(p.band[1]))}" style="fill:var(--ok-soft)"/>`;
      // Linie (Mahlgrad als Treppe)
      let d = '', on = false, py = 0;
      rows.forEach((r, i) => {
        const v = r[p.key]; if (v == null || isNaN(v)) { on = false; return; }
        if (!on) d += `M${X(i)} ${Y(v)}`; else d += p.step ? `H${X(i)}V${Y(v)}` : `L${X(i)} ${Y(v)}`;
        on = true; py = Y(v);
      });
      h += `<path d="${d}" style="fill:none;stroke:var(--t3);stroke-width:1.5;stroke-linejoin:round"/>`;
      rows.forEach((r, i) => {
        const v = r[p.key]; if (v == null || isNaN(v)) return;
        const off = p.band && (v < p.band[0] - 1e-9 || v > p.band[1] + 1e-9), last = i === n - 1;
        const col = p.band ? (off ? C.off : 'var(--ok)') : C.ok;
        if (last) h += `<circle cx="${X(i)}" cy="${Y(v)}" r="8" style="fill:none;stroke:var(--acc);stroke-width:1.5"/>`;
        if (p.fixed && (v > hi || v < lo)) h += `<path d="M${X(i) - 4.5} ${Y(v) + (v > hi ? 4 : -4)}l4.5 ${v > hi ? -8 : 8}l4.5 ${v > hi ? 8 : -8}z" style="fill:${col}"/>`;
        else h += `<circle cx="${X(i)}" cy="${Y(v)}" r="${n > 30 ? 2.8 : 4}" style="fill:${col};stroke:var(--card);stroke-width:1.5"/>`;
      });
      if (k === panels.length - 1) {
        // höchstens ca. 5 Datums-Beschriftungen, ohne Überlappung (der letzte Shot hat Vorrang)
        const every = Math.max(1, Math.ceil(n / 5)), idx = [];
        for (let i = 0; i < n; i += every) idx.push(i);
        if (idx[idx.length - 1] !== n - 1) { if (X(n - 1) - X(idx[idx.length - 1]) < 44) idx.pop(); idx.push(n - 1); }
        idx.forEach(i => { h += `<text x="${X(i)}" y="${y1 + 15}" text-anchor="${n > 1 && i === n - 1 ? 'end' : n > 1 && i === 0 ? 'start' : 'middle'}" style="fill:var(--t2);font-size:10.5px">${esc(rows[i].label)}</text>`; });
      }
    });
    h += `<line class="xh" x1="0" y1="${top}" x2="0" y2="${H - 26}" style="stroke:var(--t2);stroke-width:1;visibility:hidden"/>`;
    h += `<rect x="${L - 10}" y="0" width="${W - L - R + 20}" height="${H}" fill="transparent"/>`;
    return h + '</svg>';
  }

  /* Sweet Spot: Mahlgrad (x) gegen Fluss (y). Grünes Band = Ziel-Fluss, grüner Streifen = Ziel-Mahlgrad */
  function sweet(sw, T, o) {
    const pts = sw.pts; if (!pts.length) return '';
    const W = 340, H = 250, L = 38, R = 12, Tp = 34, B = 42, step = o.step || 0.25;
    // Feste Achsen für alle Sorten: Fluss 1–2,5 g/s, Mahlgrad 3 Stufen breit, Sweet Spot in der Mitte
    const center = o.center != null ? o.center : pts[pts.length - 1].x;
    const x0 = center - 1.5, x1 = center + 1.5, y0 = o.yAxis ? o.yAxis[0] : 1, y1 = o.yAxis ? o.yAxis[1] : 2.5;
    const X = v => L + (W - L - R) * (v - x0) / (x1 - x0);
    const Y = v => Tp + (H - Tp - B) * (1 - (Math.min(Math.max(v, y0), y1) - y0) / (y1 - y0));
    let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mahlgrad gegen Fluss mit Ziel-Mahlgrad">`;
    for (let v = y0; v <= y1 + 1e-9; v += 0.25) h += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" style="stroke:var(--grid);stroke-dasharray:${Math.abs(v * 2 - Math.round(v * 2)) < 1e-9 ? '0' : '2 3'}"/>`;
    for (let v = y0; v <= y1 + 1e-9; v += 0.5) h += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" style="stroke:var(--grid)"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" style="fill:var(--t2);font-size:11px">${f(v, 1)}</text>`;
    for (let v = Math.ceil(x0 / step) * step; v <= x1 + 1e-9; v += step) h += `<line x1="${X(v)}" y1="${Tp}" x2="${X(v)}" y2="${H - B}" style="stroke:var(--grid);stroke-dasharray:2 3"/>`;
    for (let v = Math.ceil(x0 / 0.5) * 0.5; v <= x1 + 1e-9; v += 0.5) h += `<line x1="${X(v)}" y1="${Tp}" x2="${X(v)}" y2="${H - B}" style="stroke:var(--grid)"/><text x="${X(v)}" y="${H - B + 15}" text-anchor="middle" style="fill:var(--t2);font-size:11px">${fg(v)}</text>`;
    h += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" style="stroke:var(--axis)"/>`;
    h += `<text x="4" y="13" style="fill:var(--t2);font-size:11px;font-weight:700">${esc(o.yLabel || 'Fluss (g/s)')}</text>`;
    const left = o.coarserUp ? 'feiner' : 'gröber', right = o.coarserUp ? 'gröber' : 'feiner';
    h += `<text x="${L}" y="${H - 6}" style="fill:var(--t2);font-size:11px;font-weight:700">◂ ${left}</text><text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle" style="fill:var(--t2);font-size:11px;font-weight:700">Mahlgrad</text><text x="${W - R}" y="${H - 6}" text-anchor="end" style="fill:var(--t2);font-size:11px;font-weight:700">${right} ▸</text>`;
    h += `<rect x="${L}" y="${Y(T.fMax)}" width="${W - L - R}" height="${Y(T.fMin) - Y(T.fMax)}" style="fill:var(--ok-soft)"/>`;
    h += `<text x="${L + 4}" y="${Y(T.fMax) + 12}" style="fill:var(--ok);font-size:10.5px;font-weight:700">Ziel ${f(T.fMin)}–${f(T.fMax)} g/s</text>`;
    if (sw.range) {
      const a = Math.max(x0, sw.range[0] - step / 2), b = Math.min(x1, sw.range[1] + step / 2);
      if (b > a) {
        h += `<rect x="${X(a)}" y="${Tp}" width="${X(b) - X(a)}" height="${H - B - Tp}" style="fill:var(--ok-soft);stroke:var(--ok);stroke-width:1.5;stroke-dasharray:4 3"/>`;
        const lbl = fg(sw.range[0]) + (sw.range[1] !== sw.range[0] ? '–' + fg(sw.range[1]) : '');
        const mid = (X(a) + X(b)) / 2, nearR = mid > W - R - 80, nearL = mid < L + 80;
        h += `<text x="${nearR ? W - R : nearL ? L : mid}" y="${Tp - 8}" text-anchor="${nearR ? 'end' : nearL ? 'start' : 'middle'}" style="fill:var(--ok);font-size:12px;font-weight:800">${sw.method === 'trend' && sw.extrap ? 'Hochrechnung ' : 'Sweet Spot '}${lbl}</text>`;
      }
    }
    if (sw.per) {
      const xa = Math.max(x0, Math.min((y0 - sw.a) / sw.b, (y1 - sw.a) / sw.b)), xb = Math.min(x1, Math.max((y0 - sw.a) / sw.b, (y1 - sw.a) / sw.b));
      if (xb > xa) h += `<line x1="${X(xa)}" y1="${Y(sw.a + sw.b * xa)}" x2="${X(xb)}" y2="${Y(sw.a + sw.b * xb)}" style="stroke:var(--t3);stroke-width:1.5;stroke-dasharray:5 4"/>`;
    }
    if (o.nextGrind != null && o.nextGrind >= x0 && o.nextGrind <= x1) {
      const nr = X(o.nextGrind) > W - R - 60;
      h += `<line x1="${X(o.nextGrind)}" y1="${Tp}" x2="${X(o.nextGrind)}" y2="${H - B}" style="stroke:var(--acc);stroke-width:2"/>`;
      h += `<text x="${X(o.nextGrind) + (nr ? -4 : 4)}" y="${Tp + 12}" text-anchor="${nr ? 'end' : 'start'}" style="fill:var(--acc-t);font-size:11px;font-weight:800">nächster</text>`;
    }
    let outL = 0, outR = 0;
    pts.forEach((p, i) => {
      if (p.x < x0 - 1e-9) { outL++; return; }
      if (p.x > x1 + 1e-9) { outR++; return; }
      const last = i === pts.length - 1, cx = X(p.x), cy = Y(p.y), off = p.y < T.fMin || p.y > T.fMax, col = off ? C.off : 'var(--ok)';
      if (last) h += `<circle cx="${cx}" cy="${cy}" r="10" style="fill:none;stroke:var(--acc);stroke-width:2"/>`;
      if (p.y > y1 || p.y < y0) h += `<path d="M${cx - 5} ${cy + (p.y > y1 ? 5 : -5)}l5 ${p.y > y1 ? -9 : 9}l5 ${p.y > y1 ? 9 : -9}z" style="fill:${col}"/>`;
      else h += `<circle cx="${cx}" cy="${cy}" r="${last ? 6 : 5}" style="fill:${col};stroke:var(--card);stroke-width:2"/>`;
      h += `<circle cx="${cx}" cy="${cy}" r="14" fill="transparent" data-tip="${esc(o.tip ? o.tip(p.s) : '')}" tabindex="0"/>`;
      if (last) h += `<text x="${cx}" y="${cy - 14 < Tp + 4 ? cy + 24 : cy - 14}" text-anchor="middle" style="fill:var(--t1);font-size:11px;font-weight:800">zuletzt</text>`;
    });
    if (outL) h += `<text x="${L + 3}" y="${H - B - 6}" style="fill:var(--t3);font-size:10.5px;font-weight:700">◂ ${outL} weitere</text>`;
    if (outR) h += `<text x="${W - R - 3}" y="${H - B - 6}" text-anchor="end" style="fill:var(--t3);font-size:10.5px;font-weight:700">${outR} weitere ▸</text>`;
    return h + '</svg>';
  }

  window.Charts = { history, sweet };
})();
