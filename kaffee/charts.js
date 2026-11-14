'use strict';
/* ───────── Grafiken (inline SVG, Farben über CSS-Variablen → hell/dunkel automatisch) ───────── */
(function () {
  const f = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
  const f0 = x => String(Math.round(x));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const niceStep = span => { const raw = span / 5, p = 10 ** Math.floor(Math.log10(raw)), n = raw / p; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p; };
  const tasteVar = t => t == null ? null : t < 0 ? 'var(--sour)' : t > 0 ? 'var(--bitter)' : 'var(--neutral)';
  const TASTE = { '-2': 'sehr sauer', '-1': 'sauer', 0: 'ausgewogen', 1: 'bitter', 2: 'sehr bitter' };

  /* Rezept als Bild: Sieb (In) → Ratio → Tasse (Out), darunter der Zeitstrahl des Shots */
  function recipe(s, T) {
    const W = 340, ratio = s.dout / s.din;
    const fill = Math.max(0.12, Math.min(1, s.dout / (s.din * 3)));
    const ratioOk = Math.abs(ratio - T.ratio) <= 0.12;
    // Tasse: Innenraum 236..300 × 22..74
    const cupTop = 24, cupBot = 74, lvl = cupBot - (cupBot - cupTop - 4) * fill;
    let h = `<svg class="fig" viewBox="0 0 ${W} 160" role="img" aria-label="Rezept: ${f(s.din)} g rein, ${f(s.dout)} g raus, ${f0(s.t)} Sekunden">
      <defs><clipPath id="cupclip"><path d="M232 ${cupTop}h76v26a26 26 0 0 1-26 26h-24a26 26 0 0 1-26-26z"/></clipPath></defs>
      <!-- Sieb / In -->
      <g>
        <rect x="14" y="30" width="80" height="34" rx="9" style="fill:var(--card2)"/>
        <rect x="94" y="41" width="30" height="12" rx="6" style="fill:var(--card2)"/>
        <ellipse cx="54" cy="36" rx="34" ry="7" style="fill:var(--acc)" opacity=".9"/>
        <text x="54" y="58" text-anchor="middle" style="fill:var(--t1);font-size:15px;font-weight:800">${f(s.din)} g</text>
        <text x="54" y="20" text-anchor="middle" style="fill:var(--t2);font-size:11px;font-weight:700;letter-spacing:.05em">IN</text>
      </g>
      <!-- Ratio-Pfeil -->
      <g>
        <line x1="134" y1="47" x2="212" y2="47" style="stroke:var(--axis);stroke-width:2"/>
        <path d="M206 41l8 6-8 6" style="fill:none;stroke:var(--axis);stroke-width:2;stroke-linecap:round;stroke-linejoin:round"/>
        <text x="173" y="38" text-anchor="middle" style="fill:var(--t1);font-size:17px;font-weight:800">1 : ${f(ratio)}</text>
        <text x="173" y="66" text-anchor="middle" style="fill:${ratioOk ? 'var(--ok)' : 'var(--t2)'};font-size:11px;font-weight:700">Ziel 1 : ${f(T.ratio)}${ratioOk ? ' ✓' : ''}</text>
      </g>
      <!-- Tasse / Out -->
      <g>
        <path d="M308 34h6a10 10 0 0 1 0 20h-6" style="fill:none;stroke:var(--t3);stroke-width:3"/>
        <g clip-path="url(#cupclip)">
          <rect x="226" y="${lvl}" width="90" height="${cupBot + 4 - lvl}" style="fill:var(--acc)"/>
          <rect x="226" y="${lvl}" width="90" height="4" style="fill:var(--crema)"/>
        </g>
        <path d="M232 ${cupTop}h76v26a26 26 0 0 1-26 26h-24a26 26 0 0 1-26-26z" style="fill:none;stroke:var(--t3);stroke-width:3"/>
        <text x="270" y="20" text-anchor="middle" style="fill:var(--t2);font-size:11px;font-weight:700;letter-spacing:.05em">OUT</text>
        <text x="270" y="96" text-anchor="middle" style="fill:var(--t1);font-size:15px;font-weight:800">${f(s.dout)} g</text>
      </g>`;
    // Zeitstrahl
    const x0 = 14, x1 = W - 14, tmax = Math.max(45, T.tMax + 8, s.t + 6);
    const X = t => x0 + (x1 - x0) * Math.min(t, tmax) / tmax;
    const y = 118, hh = 14;
    const fd = s.fd > 0 && s.fd < s.t ? s.fd : 0;
    const tOk = s.t >= T.tMin && s.t <= T.tMax;
    h += `<g>
      <rect x="${x0}" y="${y}" width="${x1 - x0}" height="${hh}" rx="7" style="fill:var(--card2)"/>
      <rect x="${X(T.tMin)}" y="${y - 5}" width="${X(T.tMax) - X(T.tMin)}" height="${hh + 10}" rx="4" style="fill:var(--ok-soft)"/>
      <text x="${(X(T.tMin) + X(T.tMax)) / 2}" y="${y - 9}" text-anchor="middle" style="fill:var(--ok);font-size:10.5px;font-weight:700">Ziel ${T.tMin}–${T.tMax} s</text>
      ${fd ? `<rect x="${X(T.fdMin)}" y="${y + hh + 1}" width="${X(T.fdMax) - X(T.fdMin)}" height="3" rx="1.5" style="fill:var(--crema)" opacity=".6"/>` : ''}
      ${fd ? `<rect x="${x0}" y="${y + 2}" width="${Math.max(0, X(fd) - x0)}" height="${hh - 4}" rx="5" style="fill:var(--crema)"/>` : ''}
      <rect x="${X(fd)}" y="${y + 2}" width="${Math.max(4, X(s.t) - X(fd))}" height="${hh - 4}" rx="5" style="fill:var(--acc)"/>
      <line x1="${X(s.t)}" y1="${y - 3}" x2="${X(s.t)}" y2="${y + hh + 3}" style="stroke:var(--t1);stroke-width:2"/>`;
    // Beschriftungen unten (kollisionsfrei)
    const lt = X(s.t), lf = X(fd);
    h += `<text x="${Math.min(x1, Math.max(x0 + 20, lt))}" y="${y + hh + 18}" text-anchor="middle" style="fill:${tOk ? 'var(--ok)' : 'var(--t1)'};font-size:13px;font-weight:800">${f0(s.t)} s</text>`;
    if (fd && lt - lf > 34) h += `<text x="${Math.max(x0 + 16, lf)}" y="${y + hh + 18}" text-anchor="middle" style="fill:var(--t2);font-size:12px;font-weight:700">💧 ${f0(fd)} s</text>`;
    h += `</g></svg>`;
    return h;
  }

  /* Dial-in-Kompass: Zeit (x) gegen Ratio (y), Zielfeld, Weg der letzten Shots */
  function compass(shots, T, opts = {}) {
    const W = 340, H = 246, L = 38, R = 12, Tp = 24, B = 34;
    const pts = shots.filter(s => s.din > 0 && s.dout > 0 && s.t > 0);
    const ts = pts.map(s => s.t), rs = pts.map(s => s.dout / s.din);
    const xMin = Math.floor(Math.min(T.tMin - 8, ...ts) / 5) * 5, xMax = Math.ceil(Math.max(T.tMax + 8, ...ts) / 5) * 5;
    const yMin = Math.max(0.5, Math.floor((Math.min(T.ratio - 0.5, ...rs)) * 4) / 4), yMax = Math.ceil((Math.max(T.ratio + 0.5, ...rs)) * 4) / 4;
    const X = v => L + (W - L - R) * (v - xMin) / (xMax - xMin);
    const Y = v => Tp + (H - Tp - B) * (1 - (v - yMin) / (yMax - yMin));
    let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dial-in-Kompass: Zeit gegen Ratio der letzten Shots">`;
    // Raster
    for (let v = xMin; v <= xMax + 1e-9; v += niceStep(xMax - xMin)) h += `<line x1="${X(v)}" y1="${Tp}" x2="${X(v)}" y2="${H - B}" style="stroke:var(--grid)"/><text x="${X(v)}" y="${H - B + 15}" text-anchor="middle" style="fill:var(--t2);font-size:11px">${f0(v)}</text>`;
    const ys = (yMax - yMin) > 2 ? 0.5 : 0.25;
    for (let v = yMin; v <= yMax + 1e-9; v += ys) h += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" style="stroke:var(--grid)"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" style="fill:var(--t2);font-size:11px">${f(v, ys < 0.5 ? 2 : 1)}</text>`;
    h += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" style="stroke:var(--axis)"/>`;
    h += `<text x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle" style="fill:var(--t2);font-size:11px;font-weight:700">Zeit (s)</text>`;
    h += `<text x="4" y="12" style="fill:var(--t2);font-size:11px;font-weight:700">Ratio 1 : x</text>`;
    // Zielfeld
    const zx = X(T.tMin), zy = Y(T.ratio + 0.12);
    h += `<rect x="${zx}" y="${zy}" width="${X(T.tMax) - zx}" height="${Y(T.ratio - 0.12) - zy}" rx="6" style="fill:var(--ok-soft);stroke:var(--ok);stroke-width:1.5;stroke-dasharray:4 3"/>`;
    h += `<text x="${zx + 3}" y="${zy - 5}" style="fill:var(--ok);font-size:11px;font-weight:800">Ziel</text>`;
    // Richtungshilfe
    h += `<text x="${L + 6}" y="${H - B - 6}" style="fill:var(--t3);font-size:10.5px;font-weight:700">◂ schneller</text><text x="${W - R - 6}" y="${H - B - 6}" text-anchor="end" style="fill:var(--t3);font-size:10.5px;font-weight:700">langsamer ▸</text>`;
    // Weg
    if (pts.length > 1) h += `<polyline points="${pts.map(s => X(s.t) + ',' + Y(s.dout / s.din)).join(' ')}" style="fill:none;stroke:var(--t3);stroke-width:1.5;stroke-dasharray:3 3"/>`;
    pts.forEach((s, i) => {
      const last = i === pts.length - 1, cx = X(s.t), cy = Y(s.dout / s.din), col = tasteVar(s.taste);
      const tip = opts.tip ? opts.tip(s) : '';
      if (last) h += `<circle cx="${cx}" cy="${cy}" r="11" style="fill:none;stroke:var(--acc);stroke-width:2"/>`;
      h += `<circle cx="${cx}" cy="${cy}" r="${last ? 7 : 5.5}" style="fill:${col || 'var(--card)'};stroke:${col ? 'var(--card)' : 'var(--neutral)'};stroke-width:2"/>`;
      h += `<circle cx="${cx}" cy="${cy}" r="14" fill="transparent" data-tip="${esc(tip)}" tabindex="0"/>`;
      if (last) h += `<text x="${cx}" y="${cy - 16 < Tp + 4 ? cy + 26 : cy - 16}" text-anchor="middle" style="fill:var(--t1);font-size:11px;font-weight:800">zuletzt</text>`;
    });
    if (opts.next) { // Erwarteter nächster Shot
      const nx = X(Math.min(xMax, Math.max(xMin, opts.next.t))), ny = Y(Math.min(yMax, Math.max(yMin, opts.next.ratio)));
      h += `<g><path d="M${nx - 6} ${ny}h12M${nx} ${ny - 6}v12" style="stroke:var(--acc);stroke-width:2.5;stroke-linecap:round"/><text x="${nx + 9}" y="${ny + 4}" style="fill:var(--acc-t);font-size:11px;font-weight:800">nächster</text></g>`;
    }
    return h + '</svg>';
  }
  function legendTaste() {
    return `<div class="legend"><span><i style="background:var(--sour)"></i>sauer</span><span><i style="background:var(--neutral)"></i>ausgewogen</span><span><i style="background:var(--bitter)"></i>bitter</span><span><i class="ring"></i>nicht bewertet</span></div>`;
  }

  /* Liniendiagramm mit Zielband und Fadenkreuz. pts: [{y, label, tip}] */
  function line(pts, o = {}) {
    const W = 340, H = o.h || 170, L = 34, R = 10, Tp = 12, B = 26;
    const vals = pts.map(p => p.y).filter(v => v != null && !isNaN(v));
    if (!vals.length) return '';
    let lo = Math.min(...vals, ...(o.band || [])), hi = Math.max(...vals, ...(o.band || []));
    if (hi - lo < (o.minSpan || 2)) { const m = (hi + lo) / 2; lo = m - (o.minSpan || 2) / 2; hi = m + (o.minSpan || 2) / 2; }
    const st = niceStep(hi - lo); lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st;
    const n = pts.length;
    const X = i => n === 1 ? (L + W - R) / 2 : L + (W - L - R) * i / (n - 1);
    const Y = v => Tp + (H - Tp - B) * (1 - (v - lo) / (hi - lo));
    const dec = st < 1 ? (st < 0.1 ? 2 : 1) : 0;
    let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || '')}" data-xh='${esc(JSON.stringify(pts.map((p, i) => ({ x: X(i), tip: p.tip }))))}'>`;
    for (let v = lo; v <= hi + 1e-9; v += st) h += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" style="stroke:var(--grid)"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" style="fill:var(--t2);font-size:11px">${f(v, dec)}</text>`;
    if (o.band) h += `<rect x="${L}" y="${Y(o.band[1])}" width="${W - L - R}" height="${Y(o.band[0]) - Y(o.band[1])}" style="fill:var(--ok-soft)"/><text x="${W - R - 4}" y="${Y(o.band[1]) + 12}" text-anchor="end" style="fill:var(--ok);font-size:10.5px;font-weight:700">Ziel</text>`;
    h += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" style="stroke:var(--axis)"/>`;
    // x-Beschriftung: höchstens 5 Daten
    const every = Math.max(1, Math.ceil(n / 5));
    pts.forEach((p, i) => { if ((i % every === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < every * 0.6)) h += `<text x="${X(i)}" y="${H - B + 15}" text-anchor="${n > 1 && i === n - 1 ? 'end' : n > 1 && i === 0 ? 'start' : 'middle'}" style="fill:var(--t2);font-size:10.5px">${esc(p.label)}</text>`; });
    let d = '', on = false;
    pts.forEach((p, i) => { if (p.y == null || isNaN(p.y)) { on = false; return; } d += (on ? 'L' : 'M') + X(i) + ' ' + Y(p.y); on = true; });
    h += `<path d="${d}" style="fill:none;stroke:var(--acc);stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/>`;
    pts.forEach((p, i) => { if (p.y != null && !isNaN(p.y)) h += `<circle cx="${X(i)}" cy="${Y(p.y)}" r="${n > 25 ? 2.5 : 4}" style="fill:${p.color || 'var(--acc)'};stroke:var(--card);stroke-width:${n > 25 ? 1 : 2}"/>`; });
    h += `<line class="xh" x1="0" y1="${Tp}" x2="0" y2="${H - B}" style="stroke:var(--t2);stroke-width:1;visibility:hidden"/>`;
    h += `<rect x="${L - 10}" y="0" width="${W - L - R + 20}" height="${H}" fill="transparent" class="xhit"/>`;
    return h + '</svg>';
  }

  window.Charts = { recipe, compass, line, legendTaste, tasteVar, TASTE };
})();
