'use strict';
/* ═══ RAD: Analyse über frei wählbaren Zeitraum
   Überblick · Belastung & Form (PMC) · Leistung (Kurve, CP, Profil, Zonen, Effizienz) · Fahrten
   Import von FIT-Dateien · Leistungsdaten · Ratgeber für Beschwerden am Rad ═══ */

const RANGES = [['7', '7 T'], ['28', '4 W'], ['90', '3 M'], ['182', '6 M'], ['365', '1 J'], ['all', 'Alle']];
const DUR = FIT.DUR;
const durLbl = d => d < 60 ? d + ' s' : d < 3600 ? (d / 60) + ' min' : (d / 3600) + ' h';
Object.assign(ui.ride, { range: '90', tab: 'over', chart: 'h', unit: 'w' }, ui.ride);

const ridesIn = (from, to) => S.rides.filter(r => r.s >= from && r.s < to);
const sumRides = rs => rs.reduce((a, r) => { a.km += r.km || 0; a.min += r.min || 0; a.hm += r.hm || 0; a.tss += rideTss(r).v; a.kj += r.kj || 0; a.n++; return a; }, { km: 0, min: 0, hm: 0, tss: 0, kj: 0, n: 0 });
const hTxt = min => `${Math.floor(min / 60)}:${pad(Math.round(min) % 60)}`;
const myFtp = () => S.settings.ftp || null;
const myKg = () => { const k = Object.keys(S.well).filter(d => S.well[d].kg).sort(); return k.length ? S.well[k[k.length - 1]].kg : (S.settings.kg || null); };
const pct = (a, b) => b ? Math.round((a - b) / b * 100) : null;
const dlt = (a, b, unit) => { const p = pct(a, b); return p == null ? '<span class="muted">–</span>' : `<span style="color:${p >= 0 ? 'var(--ok)' : 'var(--c-pain)'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p)} %</span>`; };

// Belastung einer Fahrt (TSS): mit FTP aus der Leistung, sonst Gerätewert, sonst über Puls (hrTSS), sonst grob über die Dauer
function rideTss(r) {
  const ftp = myFtp(), n = r.np || r.w, h = (r.min || 0) / 60;
  if (ftp && n) return { v: h * 3600 * n * (n / ftp) / (ftp * 3600) * 100, src: 'ftp', if: n / ftp };
  if (r.tssDev) return { v: r.tssDev, src: 'dev' };
  if (r.hr && S.settings.lthr) { const f = r.hr / S.settings.lthr; return { v: h * f * f * 100, src: 'hr', if: f }; }
  return { v: h * 45, src: 'est' };
}

/* ── Zeitraum ── */
function rng() {
  const end = fromKey(today()).getTime() + DAY, r = ui.ride.range;
  if (r === 'all') {
    const f = S.rides.length ? S.rides.reduce((m, x) => Math.min(m, x.s), Infinity) : end - 28 * DAY, from = fromKey(dkey(new Date(f))).getTime();
    return { from, to: end, days: Math.max(1, Math.round((end - from) / DAY)), prev: null, lbl: 'gesamt' };
  }
  const d = +r, from = end - d * DAY;
  return { from, to: end, days: d, prev: [from - d * DAY, from], lbl: { 7: 'letzte 7 Tage', 28: 'letzte 4 Wochen', 90: 'letzte 3 Monate', 182: 'letzte 6 Monate', 365: 'letzte 12 Monate' }[d] };
}

/* ── Belastung & Form (Fitness 42 Tage · Ermüdung 7 Tage · Form = Fitness − Ermüdung vom Vortag) ── */
let PMC = null, PMCK = '';
function pmc() {
  const key = [S.rides.length, S.settings.ftp, S.settings.lthr, today(), S.rides.reduce((a, r) => a + r.s, 0)].join(':');
  if (PMC && PMCK === key) return PMC;
  const by = {}; let est = 0;
  S.rides.forEach(r => { const t = rideTss(r), k = dkey(new Date(r.s)); by[k] = (by[k] || 0) + t.v; if (t.src === 'est') est++; });
  const days = [];
  if (S.rides.length) {
    const first = S.rides.reduce((m, r) => Math.min(m, r.s), Infinity);
    let d = fromKey(dkey(new Date(Math.max(first, Date.now() - 1100 * DAY)))); const end = fromKey(today());
    let ctl = 0, atl = 0;
    for (; d <= end; d = addDays(d, 1)) { const k = dkey(d), t = by[k] || 0, tsb = ctl - atl; ctl += (t - ctl) / 42; atl += (t - atl) / 7; days.push({ k, ts: d.getTime(), t, ctl, atl, tsb }); }
  }
  PMCK = key; PMC = { days, est: S.rides.length ? est / S.rides.length : 0 };
  return PMC;
}
const FZ = [[25, '#d9a400', 'Übergang', 'Sehr frisch – du verlierst gerade Fitness. Gut vor einem Event, sonst wieder mehr trainieren.'],
  [5, '#3b82f6', 'Frisch', 'Erholt und leistungsbereit – guter Moment für harte Einheiten oder ein Rennen.'],
  [-10, '#9aa5a2', 'Neutral', 'Belastung und Erholung halten sich die Waage – hier entsteht wenig neuer Reiz.'],
  [-30, '#2f9e44', 'Optimal', 'Produktiver Aufbau: du trainierst mehr als gewohnt und wirst fitter. Schlaf und Ernährung im Blick behalten.'],
  [-1e9, '#e5484d', 'Hohes Risiko', 'Sehr hohe Ermüdung. Plane 2–3 lockere Tage ein – das Risiko für Überlastung und Infekte steigt.']];
const fzone = v => FZ.find(z => v > z[0]);
function rampTxt(r) {
  if (r > 8) return ['red', 'zu schnell', 'Die Fitness steigt schneller, als Sehnen und Immunsystem mithalten. Halte den Anstieg unter etwa 5–8 pro Woche.'];
  if (r > 3) return ['grn', 'produktiv', 'Stetiger, gut verträglicher Aufbau.'];
  if (r > -1) return ['', 'stabil', 'Du hältst dein Niveau.'];
  return ['amb', 'Abbau / Erholung', 'Die Fitness sinkt – gewollt in Erholungswochen, sonst wieder Umfang aufbauen.'];
}
function monotony(days) {
  const l = days.slice(-7).map(d => d.t); if (l.length < 7) return null;
  const m = l.reduce((a, b) => a + b, 0) / 7, sd = Math.sqrt(l.reduce((a, b) => a + (b - m) * (b - m), 0) / 7);
  if (!m) return null;
  const mono = sd ? m / sd : 9;
  return { mono, strain: m * 7 * mono, load: m * 7 };
}

/* ── Leistung ── */
function curve(from, to) {
  const c = {};
  S.rides.forEach(r => { if (r.s < from || r.s >= to || !r.pb) return; for (const k in r.pb) { const w = r.pb[k]; if (!c[k] || w > c[k].w) c[k] = { w, s: r.s, id: r.id }; } });
  // Kurve muss mit der Dauer fallen (kürzer ≥ länger)
  let run = 0;
  DUR.slice().reverse().forEach(d => { if (!c[d]) return; if (c[d].w < run) c[d] = Object.assign({}, c[d], { w: run, inh: 1 }); run = Math.max(run, c[d].w); });
  return c;
}
function cpModel(c) {
  const pts = [180, 300, 480, 600, 900, 1200].filter(d => c[d] && !c[d].inh).map(d => [d, c[d].w * d]);
  if (pts.length < 3) return null;
  const n = pts.length, sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0), sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  const cp = (n * sxy - sx * sy) / (n * sxx - sx * sx), wp = (sy - cp * sx) / n;
  if (!(cp > 50 && cp < 600 && wp > 2000 && wp < 60000)) return null;
  return { cp: Math.round(cp), wp: Math.round(wp / 100) / 10 };
}
const PROF_LV = ['Einsteiger', 'Freizeit', 'Ambitioniert', 'Gut trainiert', 'Sehr gut', 'Exzellent', 'Weltklasse'];
const PROF = {
  m: { 5: [8.5, 11, 13.5, 16, 18.5, 21, 23.5], 60: [5.3, 6.3, 7.3, 8.3, 9.3, 10.2, 11.2], 300: [2.4, 3.2, 4, 4.8, 5.6, 6.4, 7.2], ftp: [1.9, 2.6, 3.3, 4, 4.7, 5.4, 6.1] },
  w: { 5: [7, 9, 11, 13, 15, 17, 19.2], 60: [4.4, 5.2, 6, 6.8, 7.6, 8.4, 9.2], 300: [2, 2.7, 3.4, 4.1, 4.8, 5.5, 6.2], ftp: [1.6, 2.2, 2.8, 3.4, 4, 4.6, 5.2] }
};
function level(v, th) { if (v < th[0]) return v / th[0]; for (let i = 0; i < th.length - 1; i++) if (v < th[i + 1]) return i + 1 + (v - th[i]) / (th[i + 1] - th[i]); return th.length; }
const ZN = ['Z1 Erholung', 'Z2 Grundlage', 'Z3 Tempo', 'Z4 Schwelle', 'Z5 VO₂max', 'Z6 Anaerob', 'Z7 Sprint'];
const ZC = ['#9aa5a2', '#3b82f6', '#2f9e44', '#d9a400', '#f08c00', '#e5484d', '#8b5cf6'];
const ZLIM = [0.55, 0.75, 0.9, 1.05, 1.2, 1.5];
// Zeit in Zonen (Sekunden) aus der Leistungsverteilung (20-W-Stufen); Rollphasen unter 20 W zählen nicht mit
function zonesOf(rides, ftp) {
  const z = [0, 0, 0, 0, 0, 0, 0];
  rides.forEach(r => (r.ph || []).forEach((sec, i) => { if (!sec || i === 0) return; const f = (i * 20 + 10) / ftp; let k = 0; while (k < 6 && f > ZLIM[k]) k++; z[k] += sec; }));
  return z;
}
const zoneBar = z => { const t = z.reduce((a, b) => a + b, 0) || 1; return `<div class="zbar">${z.map((v, i) => v ? `<i style="width:${v / t * 100}%;background:${ZC[i]}"></i>` : '').join('')}</div>`; };
const zoneLegend = z => { const t = z.reduce((a, b) => a + b, 0) || 1; return `<div class="legend" style="padding:8px 0 0">${z.map((v, i) => v / t >= 0.005 ? `<span><i style="background:${ZC[i]}"></i>${ZN[i].split(' ')[0]} ${Math.round(v / t * 100)} %</span>` : '').join('')}</div>`; };
function distType(z) {
  const t = z.reduce((a, b) => a + b, 0); if (t < 1800) return null;
  const f1 = (z[0] + z[1]) / t, f2 = (z[2] + z[3]) / t, f3 = (z[4] + z[5] + z[6]) / t;
  const pi = Math.log10(Math.max(f1, 0.001) / Math.max(f2, 0.001) * Math.max(f3, 0.001) * 100);
  let c;
  if (f1 >= 0.8 && f3 < 0.04) c = ['Grundlagenbetont', 'Fast alles locker. Gute Basis – für mehr Leistung 1–2 gezielte Intervall-Einheiten pro Woche ergänzen (z. B. 4–6 × 4 min hart).'];
  else if (f3 > f2 && pi > 2) c = ['Polarisiert', 'Viel locker, wenig mittel, gezielt hart – die Verteilung, mit der Profis im Ausdauersport am meisten Fortschritt erzielen.'];
  else if (f1 > f2 && f2 > f3) c = ['Pyramidal', 'Von locker zu hart abnehmend – bewährt und gut verträglich, besonders in Aufbauphasen.'];
  else if (f2 >= f1 * 0.6) c = ['Schwellenlastig', 'Viel Zeit im mittleren Bereich („graue Zone“): anstrengend, aber wenig erholsam. Lockere Fahrten lockerer, harte gezielt härter fahren.'];
  else c = ['Gemischt', 'Keine klare Struktur. Als Faustregel: rund 80 % locker (Z1–Z2), 20 % intensiv.'];
  return { f1, f2, f3, pi, c };
}
function linfit(pts) {
  const n = pts.length; if (n < 2) return null;
  const sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0), sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  const d = n * sxx - sx * sx; if (!d) return null;
  const m = (n * sxy - sx * sy) / d; return { m, b: (sy - m * sx) / n };
}

/* ── Diagramme (SVG) ── */
const tx = (x, y, s, a, c) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="ct"${a ? ` text-anchor="${a}"` : ''}${c ? ` style="fill:${c}"` : ''}>${s}</text>`;
const dshort = ts => { const d = new Date(ts); return d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
function pmcSVG(days) {
  const W = 340, top = 6, H1 = 118, z0 = 160, n = days.length;
  if (n < 2) return '';
  const max = Math.max(20, ...days.map(d => Math.max(d.ctl, d.atl))) * 1.1, tmax = Math.max(1, ...days.map(d => d.t));
  const x = i => 10 + i * (W - 20) / (n - 1), y = v => top + (1 - v / max) * (H1 - top);
  const ty = v => H1 - Math.min(1, v / Math.max(tmax, max)) * (H1 - top) * 0.9;
  const tsbMax = Math.max(30, ...days.map(d => Math.abs(d.tsb))), tyb = v => z0 - v / tsbMax * 22;
  const bw = Math.max(1, (W - 20) / n * 0.7);
  let s = `<svg viewBox="0 0 ${W} 200" class="chart">`;
  [0.25, 0.5, 0.75].forEach(f => { s += `<line class="cg" x1="10" x2="${W - 10}" y1="${y(max * f).toFixed(1)}" y2="${y(max * f).toFixed(1)}"/>`; s += tx(W - 8, y(max * f) - 2, Math.round(max * f), 'end'); });
  days.forEach((d, i) => { if (d.t) s += `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${ty(d.t).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H1 - ty(d.t)).toFixed(1)}" class="cb"/>`; });
  s += `<polyline class="cl" style="stroke:var(--c-ant)" points="${days.map((d, i) => x(i).toFixed(1) + ',' + y(d.atl).toFixed(1)).join(' ')}"/>`;
  s += `<polyline class="cl" style="stroke:var(--acc);stroke-width:3" points="${days.map((d, i) => x(i).toFixed(1) + ',' + y(d.ctl).toFixed(1)).join(' ')}"/>`;
  s += `<line class="cg" x1="10" x2="${W - 10}" y1="${z0}" y2="${z0}" style="stroke-dasharray:none"/>`;
  days.forEach((d, i) => { const yy = tyb(d.tsb); s += `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${Math.min(yy, z0).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0.6, Math.abs(yy - z0)).toFixed(1)}" style="fill:${fzone(d.tsb)[1]}"/>`; });
  s += tx(10, 196, dshort(days[0].ts)) + tx(W / 2, 196, dshort(days[Math.floor(n / 2)].ts), 'middle') + tx(W - 10, 196, 'heute', 'end');
  s += tx(10, 134, 'Form', null);
  return s + '</svg>';
}
function curveSVG(cA, cB, kg) {
  const W = 340, H = 170, ds = DUR.filter(d => cA[d] || (cB && cB[d])); if (ds.length < 2) return '';
  const v = (c, d) => c[d] ? (kg ? c[d].w / kg : c[d].w) : null;
  const max = Math.max(...ds.map(d => Math.max(v(cA, d) || 0, cB ? v(cB, d) || 0 : 0))) * 1.08;
  const lx0 = Math.log(ds[0]), lx1 = Math.log(ds[ds.length - 1]);
  const x = d => 28 + (Math.log(d) - lx0) / (lx1 - lx0 || 1) * (W - 38), y = w => 8 + (1 - w / max) * (H - 30);
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart">`;
  const step = kg ? (max > 12 ? 4 : max > 6 ? 2 : 1) : (max > 900 ? 200 : max > 400 ? 100 : 50);
  for (let g = step; g < max; g += step) s += `<line class="cg" x1="28" x2="${W - 10}" y1="${y(g).toFixed(1)}" y2="${y(g).toFixed(1)}"/>` + tx(24, y(g) + 3, g, 'end');
  [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '1 h']].forEach(([d, l]) => { if (d >= ds[0] && d <= ds[ds.length - 1]) s += `<line class="cg" x1="${x(d).toFixed(1)}" x2="${x(d).toFixed(1)}" y1="8" y2="${H - 22}"/>` + tx(x(d), H - 8, l, 'middle'); });
  const line = (c, cls) => { const p = ds.filter(d => c[d]).map(d => x(d).toFixed(1) + ',' + y(v(c, d)).toFixed(1)); return p.length > 1 ? `<polyline class="${cls}" points="${p.join(' ')}"/>` : ''; };
  if (cB) s += line(cB, 'cl cl2');
  s += line(cA, 'cl') + ds.filter(d => cA[d]).map(d => `<circle class="cdot" cx="${x(d).toFixed(1)}" cy="${y(v(cA, d)).toFixed(1)}" r="2.4"/>`).join('');
  return s + '</svg>';
}
function barsSVG(items, unit) {
  const W = 340, H = 130, n = items.length, max = Math.max(0.001, ...items.map(i => i.v)) * 1.1;
  const bw = (W - 20) / n, y = v => 6 + (1 - v / max) * (H - 30);
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart">`;
  items.forEach((it, i) => { const x = 10 + i * bw, h = H - 24 - y(it.v); s += `<rect x="${(x + bw * 0.15).toFixed(1)}" y="${y(it.v).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${Math.max(it.v ? 1.5 : 0.8, h).toFixed(1)}" rx="2" class="${it.now ? 'cbn' : it.v ? 'cba' : 'cb'}"/>`; if (it.l) s += tx(x + bw / 2, H - 9, it.l, 'middle'); });
  return s + tx(W - 10, 12, 'max ' + num(max / 1.1, unit === 'h' ? 1 : 0), 'end') + '</svg>';
}

/* ── Ansicht ── */
VIEWS.ride = {
  title: 'Rad',
  sub() { const w = weekStart().getTime(), s = sumRides(ridesIn(w, w + 7 * DAY)); return s.n ? `Diese Woche ${num(s.km, 0)} km · ${hTxt(s.min)} h · Belastung ${Math.round(s.tss)}` : 'Analyse, Belastung und Ausgleich'; },
  actions: () => '<button class="hbtn" data-act="perfEdit" aria-label="Leistungsdaten">⚙︎</button><button class="hbtn" data-act="fitPick" aria-label="Fahrten importieren">⬆︎</button>',
  render() {
    const r = ui.ride;
    if (!S.rides.length) return rEmpty();
    return `<div class="seg">${[['over', 'Überblick'], ['load', 'Form'], ['power', 'Leistung'], ['list', 'Fahrten']].map(([k, n]) => `<button data-act="rTab" data-v="${k}" class="${r.tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="chiprow rangebar">${RANGES.map(([k, n]) => `<button class="chip${r.range === k ? ' on' : ''}" data-act="rRange" data-v="${k}">${n}</button>`).join('')}</div>
      ${r.tab === 'over' ? rOver() : r.tab === 'load' ? rLoad() : r.tab === 'power' ? rPower() : rList()}
      <input type="file" id="fitFile" accept=".zip,.fit,.gz,application/zip,application/octet-stream" multiple hidden>`;
  }
};
function rEmpty() {
  return `<div class="card empty"><div class="big">🚴</div><b>Noch keine Fahrten</b>Importiere deine Fahrten als FIT-Dateien – einzeln oder als ZIP, z. B. aus dem Export von intervals.icu. Die Dateien bleiben auf deinem Gerät.
      <div class="stack" style="margin-top:14px"><button class="btn primary" data-act="fitPick">⬆︎ FIT-Dateien oder ZIP importieren</button><button class="btn plain" data-act="rideNew">＋ Fahrt von Hand eintragen</button></div></div>
    <input type="file" id="fitFile" accept=".zip,.fit,.gz,application/zip,application/octet-stream" multiple hidden>${guideHTML()}`;
}
function guideHTML() {
  return `<div class="section-t">Beschwerden am Rad</div>
    <div class="card list">${X.BIKEFIT.map((b, i) => `<button class="li" data-act="fit" data-i="${i}"><span class="ic">${b.e}</span><span class="bd"><b>${esc(b.n)}</b><small class="clip">${esc(b.cause[0])}</small></span><span class="go">›</span></button>`).join('')}</div>
    <button class="btn plain" data-act="topic" data-id="bike" style="margin-top:10px">🚴 Was Radfahren mit dem Körper macht</button>`;
}
const rinfo = (k, t) => `<button class="lnk" data-act="rInfo" data-v="${k}">${t || 'Was heißt das?'}</button>`;

function rOver() {
  const R = rng(), cur = ridesIn(R.from, R.to), A = sumRides(cur), B = R.prev ? sumRides(ridesIn(R.prev[0], R.prev[1])) : null;
  const P = pmc(), last = P.days[P.days.length - 1], wk = Math.max(1, R.days / 7);
  const c = ui.ride.chart, unit = { h: 'Stunden', km: 'Kilometer', hm: 'Höhenmeter', tss: 'Belastung' }[c];
  const val = s => c === 'km' ? s.km : c === 'hm' ? s.hm : c === 'tss' ? s.tss : s.min / 60;
  const items = [];
  if (R.days <= 28) for (let i = R.days - 1; i >= 0; i--) { const a = R.to - (i + 1) * DAY, d = new Date(a); items.push({ v: val(sumRides(ridesIn(a, a + DAY))), l: R.days <= 7 ? DAYS_S[d.getDay()] : (i % 7 === 0 ? dshort(a) : ''), now: i === 0 }); }
  else {
    const w0 = weekStart().getTime(), nW = Math.min(R.days > 400 ? 104 : 53, Math.ceil(R.days / 7));
    for (let i = nW - 1; i >= 0; i--) { const a = w0 - i * 7 * DAY; items.push({ v: val(sumRides(ridesIn(a, a + 7 * DAY))), l: i % Math.ceil(nW / 6) === 0 ? dshort(a) : '', now: i === 0 }); }
  }
  const tile = (l, v, u, b, sub) => `<div class="card stat"><small>${l}</small><b>${v}<i>${u}</i></b><span>${b != null ? dlt(b[0], b[1]) + ' vs. vorher' : sub || ''}</span></div>`;
  const ftp = myFtp(), z = ftp ? zonesOf(cur, ftp) : null, dt = z ? distType(z) : null;
  const cAll = curve(0, Infinity), cR = curve(R.from, R.to);
  const recs = [5, 60, 300, 1200, 3600].filter(d => cR[d] && cAll[d] && cR[d].id === cAll[d].id && !cR[d].inh);
  const mob = periodStats(R.from, R.to).mobMin, want = Math.round(A.min / 60 * 7);
  const notes = [];
  notes.push(['📅', `<b>${hTxt(A.min / wk)} h pro Woche</b> im Schnitt, ${num(A.n / wk, 1)} Fahrten/Woche${B && B.min ? ` (${dlt(A.min, B.min)} zum Vorzeitraum)` : ''}.`]);
  if (last) { const fz = fzone(last.tsb); notes.push(['⚖️', `<b>Form ${last.tsb > 0 ? '+' : ''}${Math.round(last.tsb)} – ${fz[2]}.</b> ${fz[3]}`]); }
  if (P.days.length > 7) { const rr = last.ctl - P.days[P.days.length - 8].ctl, rt = rampTxt(rr); notes.push(['📈', `<b>Fitness ${Math.round(last.ctl)}, ${rr >= 0 ? '+' : ''}${num(rr)} pro Woche – ${rt[1]}.</b> ${rt[2]}`]); }
  if (dt) notes.push(['🎯', `<b>Intensität: ${dt.c[0]}</b> (${Math.round(dt.f1 * 100)} % locker · ${Math.round(dt.f2 * 100)} % mittel · ${Math.round(dt.f3 * 100)} % hart). ${dt.c[1]}`]);
  else if (!ftp) notes.push(['🎯', `<b>Intensität unbekannt:</b> Trag deinen FTP ein, dann bewertet die App Zonen, Belastung und Leistungsprofil. ${rinfo('perf', 'Jetzt eintragen')}`]);
  if (recs.length) notes.push(['🏆', `<b>Neue Bestwerte:</b> ${recs.map(d => `${durLbl(d)} ${cR[d].w} W`).join(' · ')}`]);
  notes.push(['🧘', `<b>${fmtMin(mob)} Mobility</b> bei ${hTxt(A.min)} h im Sattel${want ? (mob >= want ? ' – gut ausgeglichen.' : ` – Ziel wären rund ${fmtMin(want)} (5–10 min pro Stunde Rad).`) : '.'}`]);
  return `
    <div class="stats k3">${tile('Fahrten', A.n, '', B ? [A.n, B.n] : null)}${tile('Distanz', num(A.km, 0), 'km', B ? [A.km, B.km] : null)}${tile('Zeit', hTxt(A.min), 'h', B ? [A.min, B.min] : null)}
      ${tile('Höhe', Math.round(A.hm).toLocaleString('de-DE'), 'hm', B ? [A.hm, B.hm] : null)}${tile('Belastung', Math.round(A.tss), '', B ? [A.tss, B.tss] : null)}${tile('Arbeit', A.kj ? Math.round(A.kj).toLocaleString('de-DE') : '–', A.kj ? 'kJ' : '', null, A.kj ? '≈ ' + Math.round(A.kj) + ' kcal' : 'braucht Leistung')}</div>
    <div class="section-t">Einordnung<span class="muted">${esc(R.lbl)}</span></div>
    <div class="card pad stack s6">${notes.map(([i, t]) => `<div class="note-row"><span>${i}</span><p>${t}</p></div>`).join('')}</div>
    <div class="section-t">${R.days <= 28 ? 'Pro Tag' : 'Pro Woche'} · ${unit}<div class="seg sm">${[['h', 'Zeit'], ['km', 'km'], ['hm', 'hm'], ['tss', 'Last']].map(([k, n]) => `<button data-act="rChart" data-v="${k}" class="${c === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="card pad">${barsSVG(items, c)}</div>
    ${R.days >= 28 && P.days.length > 14 ? `<div class="section-t">Fitness & Form${rinfo('pmc')}</div><div class="card pad" data-act="rTab" data-v="load" style="cursor:pointer">${pmcSVG(P.days.slice(-Math.min(R.days, 400)))}${pmcLegend()}</div>` : ''}
    <div class="section-t">Ausgleich</div>
    <div class="card pad"><div class="row"><span><b>${fmtMin(mob)} Mobility</b> <span class="muted">bei ${hTxt(A.min)} h Rad</span></span><span class="tag ${mob >= want ? 'grn' : 'amb'}">${mob >= want ? 'passt' : 'Ziel ~' + fmtMin(want)}</span></div>
      <div class="meter" style="margin:10px 0"><i style="width:${want ? Math.min(100, Math.round(mob / want * 100)) : mob ? 100 : 0}%"></i></div>
      <button class="btn soft sm" data-act="rt" data-id="r_bike" style="width:100%">🧘 „Nach dem Radfahren“ starten (${rtMin(getRoutine('r_bike'))} min)</button></div>
    ${guideHTML()}`;
}
const pmcLegend = () => `<div class="legend" style="padding:6px 0 0"><span><i style="background:var(--acc)"></i>Fitness</span><span><i style="background:var(--c-ant)"></i>Ermüdung</span><span><i style="background:var(--card2);box-shadow:inset 0 0 0 1px var(--t3)"></i>Tagesbelastung</span>${FZ.map(z => `<span><i style="background:${z[1]}"></i>${z[2]}</span>`).join('')}</div>`;

function rLoad() {
  const R = rng(), P = pmc(), days = P.days.slice(-Math.min(R.days, 1100)), last = P.days[P.days.length - 1];
  if (!last) return '';
  const fz = fzone(last.tsb), rr = P.days.length > 7 ? last.ctl - P.days[P.days.length - 8].ctl : 0, rt = rampTxt(rr), mo = monotony(P.days);
  const peak = days.reduce((m, d) => d.ctl > m.ctl ? d : m, days[0]);
  const wl = []; for (let i = 0; i < 8; i++) { const a = weekStart().getTime() - i * 7 * DAY; wl.push(sumRides(ridesIn(a, a + 7 * DAY)).tss); }
  const avg4 = (wl[1] + wl[2] + wl[3] + wl[4]) / 4, acwr = avg4 ? (P.days.slice(-7).reduce((a, d) => a + d.t, 0)) / avg4 : null;
  const rd = typeof readiness === 'function' ? readiness(today()) : null;
  return `
    <div class="stats k3"><div class="card stat"><small>Fitness</small><b style="color:var(--acc-t)">${Math.round(last.ctl)}</b><span>${rr >= 0 ? '▲ +' : '▼ '}${num(rr)} / Woche</span></div>
      <div class="card stat"><small>Ermüdung</small><b style="color:var(--c-ant)">${Math.round(last.atl)}</b><span>letzte 7 Tage</span></div>
      <div class="card stat"><small>Form</small><b style="color:${fz[1]}">${last.tsb > 0 ? '+' : ''}${Math.round(last.tsb)}</b><span>${fz[2]}</span></div></div>
    <div class="box" style="margin-top:10px;border-left-color:${fz[1]}"><b>${fz[2]}:</b> ${fz[3]}${rd != null && rd < 45 && last.tsb < -10 ? ' <b>Deine Tagesform ist ebenfalls niedrig – heute besser locker oder Pause.</b>' : ''}</div>
    <div class="section-t">Verlauf<span class="muted">${esc(R.lbl)}</span></div>
    <div class="card pad">${pmcSVG(days)}${pmcLegend()}
      <p class="small muted" style="margin-top:8px">Höchste Fitness im Zeitraum: <b style="color:var(--t1)">${Math.round(peak.ctl)}</b> am ${fmtDate(new Date(peak.ts))}${P.est > 0.3 ? ' · Viele Fahrten ohne Leistung/Puls – dort ist die Belastung nur geschätzt.' : ''}</p></div>
    <div class="section-t">Aufbau-Tempo${rinfo('ramp')}</div>
    <div class="card pad"><div class="row"><span><b>${rr >= 0 ? '+' : ''}${num(rr)} Fitness pro Woche</b><br><span class="small muted">${rt[2]}</span></span><span class="tag ${rt[0]}">${rt[1]}</span></div></div>
    <div class="section-t">Belastungssteuerung${rinfo('acwr')}</div>
    <div class="card pad stack">
      ${acwr != null ? `<div class="row"><span><b>Akut : chronisch ${num(acwr, 2)}</b><br><span class="small muted">Letzte 7 Tage im Verhältnis zum Schnitt der 4 Wochen davor</span></span><span class="tag ${acwr > 1.5 ? 'red' : acwr > 1.3 ? 'amb' : acwr >= 0.8 ? 'grn' : ''}">${acwr > 1.5 ? 'Sprung' : acwr > 1.3 ? 'erhöht' : acwr >= 0.8 ? 'im Rahmen' : 'wenig'}</span></div>` : ''}
      ${mo ? `<div class="row"><span><b>Monotonie ${num(Math.min(mo.mono, 9), 1)}</b><br><span class="small muted">Wie gleichförmig die Tage waren. Über 2 = kaum Abwechslung zwischen hart und locker</span></span><span class="tag ${mo.mono > 2 ? 'amb' : 'grn'}">${mo.mono > 2 ? 'einseitig' : 'abwechslungsreich'}</span></div>` : ''}
    </div>
    <div class="section-t">Wochenbelastung</div>
    <div class="card pad">${barsSVG(wl.slice().reverse().map((v, i) => ({ v, l: i === 7 ? 'jetzt' : i % 2 === 1 ? '−' + (7 - i) + ' W' : '', now: i === 7 })), 'tss')}
      <p class="small muted" style="margin-top:6px">Faustregel: Wochenbelastung um höchstens 10 % pro Woche steigern, alle 3–4 Wochen eine leichtere Woche einplanen.</p></div>`;
}

function rPower() {
  const R = rng(), ftp = myFtp(), kg = myKg(), wkg = ui.ride.unit === 'wkg' && kg;
  const cR = curve(R.from, R.to), cAll = curve(0, Infinity), cp = cpModel(cR);
  const has = Object.keys(cR).length;
  if (!has) return `<div class="card empty"><div class="big">⚡</div><b>Keine Leistungsdaten im Zeitraum</b>Leistungsanalyse braucht Fahrten mit Powermeter oder Rolle. Wähle einen längeren Zeitraum oder importiere solche Fahrten.</div>`;
  const e20 = cR[1200] ? Math.round(cR[1200].w * 0.95) : null, eftp = e20 || (cp ? Math.round(cp.cp * 0.97) : null);
  const keyd = [5, 60, 300, 1200, 3600].filter(d => cR[d]);
  const sex = S.settings.sex || 'm', th = PROF[sex], pf = kg ? [[5, '5 s', cR[5]], [60, '1 min', cR[60]], [300, '5 min', cR[300]], ['ftp', 'FTP', (ftp || eftp) ? { w: ftp || eftp } : null]].filter(x => x[2]).map(([k, l, c]) => ({ k, l, w: c.w, v: c.w / kg, lv: level(c.w / kg, th[k]) })) : [];
  let type = '';
  if (pf.length >= 3) {
    const mx = pf.reduce((a, b) => b.lv > a.lv ? b : a), mn = pf.reduce((a, b) => b.lv < a.lv ? b : a);
    type = mx.lv - mn.lv < 0.8 ? ['Allrounder', 'Ausgeglichenes Profil ohne klare Schwäche.'] : mx.k === 5 ? ['Sprinter', 'Deine Stärke ist die Spitzenleistung über Sekunden.'] : mx.k === 60 ? ['Puncheur', 'Stark bei kurzen, harten Anstiegen und Attacken.'] : mx.k === 300 ? ['Kletterer / Puncheur', 'Stark bei 3–8-minütigen Anstrengungen – typisch für Bergfahrer.'] : ['Zeitfahrer / Ausdauer-Typ', 'Deine Stärke ist die Dauerleistung an der Schwelle.'];
    type.push(mn.l);
  }
  const z = ftp ? zonesOf(ridesIn(R.from, R.to), ftp) : null, dt = z ? distType(z) : null;
  const efr = ridesIn(R.from, R.to).filter(r => r.ef && r.min >= 45 && (!ftp || (r.np || r.w) / ftp < 0.85)).sort((a, b) => a.s - b.s);
  const fit = efr.length >= 3 ? linfit(efr.map(r => [(r.s - R.from) / DAY, r.ef])) : null;
  const efChg = fit ? (fit.m * ((efr[efr.length - 1].s - efr[0].s) / DAY)) / (fit.m * ((efr[0].s - R.from) / DAY) + fit.b) * 100 : null;
  const dec = ridesIn(R.from, R.to).filter(r => r.dec != null && r.min >= 60).sort((a, b) => b.s - a.s).slice(0, 4);
  const u = wkg ? 'W/kg' : 'W', fv = w => wkg ? num(w / kg, 2) : Math.round(w);
  return `
    <div class="row" style="margin:2px 4px 8px"><span class="small muted">Leistungskurve · ${esc(R.lbl)}</span>${kg ? `<div class="seg sm"><button data-act="rUnit" data-v="w" class="${wkg ? '' : 'on'}">Watt</button><button data-act="rUnit" data-v="wkg" class="${wkg ? 'on' : ''}">W/kg</button></div>` : `<button class="lnk" data-act="perfEdit">Gewicht eintragen</button>`}</div>
    <div class="card pad">${curveSVG(cR, cAll, wkg ? kg : null)}<div class="legend" style="padding:6px 0 0"><span><i style="background:var(--acc)"></i>Zeitraum</span><span><i style="background:var(--t3)"></i>Bestwerte gesamt</span></div>
      <div class="pbt">${keyd.map(d => `<div><small>${durLbl(d)}</small><b>${fv(cR[d].w)}<i>${u}</i></b><span>${cAll[d] && cAll[d].id === cR[d].id && !cR[d].inh ? '🏆 Best' : cAll[d] ? Math.round(cR[d].w / cAll[d].w * 100) + ' %' : ''}</span></div>`).join('')}</div></div>
    <div class="section-t">Schwelle & Kapazität${rinfo('cp')}</div>
    <div class="card pad stack">
      <div class="row"><span><b>eFTP ${eftp ? eftp + ' W' : '–'}</b>${eftp && kg ? ` <span class="muted">· ${num(eftp / kg, 2)} W/kg</span>` : ''}<br><span class="small muted">${e20 ? '95 % deines 20-min-Bestwerts im Zeitraum' : cp ? 'aus dem CP-Modell' : 'braucht einen harten 20-min-Abschnitt'}</span></span>
        ${eftp && Math.abs(eftp - (ftp || 0)) >= 5 ? `<button class="btn soft sm" data-act="ftpSet" data-v="${eftp}">Als FTP</button>` : ''}</div>
      ${cp ? `<div class="row"><span><b>CP ${cp.cp} W · W′ ${num(cp.wp)} kJ</b><br><span class="small muted">Kritische Leistung (Dauerleistung) und anaerobe Reserve – aus deinen 3–20-min-Bestwerten</span></span></div>` : ''}
      <div class="row"><span><b>Eingestellter FTP ${ftp ? ftp + ' W' : '–'}</b><br><span class="small muted">${ftp && eftp ? (eftp > ftp + 5 ? 'Deine Werte deuten auf mehr hin – Zonen & Belastung werden sonst zu hoch bewertet.' : eftp < ftp - 10 ? 'Liegt über deinen aktuellen Werten – evtl. nur, weil im Zeitraum kein harter Test dabei war.' : 'Passt zu deinen aktuellen Werten.') : 'Grundlage für Zonen und Belastung.'}</span></span><button class="lnk" data-act="perfEdit">Ändern</button></div></div>
    ${pf.length ? `<div class="section-t">Leistungsprofil${rinfo('prof')}</div>
    <div class="card pad">${type ? `<div class="row" style="margin-bottom:10px"><span><b>Typ: ${type[0]}</b><br><span class="small muted">${type[1]} Ausbaupotenzial: ${type[2]}.</span></span></div>` : ''}
      ${pf.map(p => `<div class="prow"><span class="pl">${p.l}</span><div class="pm"><div class="pscale">${PROF_LV.map((_, i) => `<i style="opacity:${0.25 + i * 0.1}"></i>`).join('')}</div><span class="pmark" style="left:${Math.min(100, p.lv / 7 * 100)}%"></span></div><span class="pv"><b>${num(p.v, 1)}</b> W/kg<br><small>${PROF_LV[Math.max(0, Math.min(6, Math.floor(p.lv) - (p.lv >= 1 ? 1 : 0)))]}</small></span></div>`).join('')}
      <p class="small muted" style="margin-top:8px">Richtwerte nach Coggan (${sex === 'w' ? 'Frauen' : 'Männer'}), ${num(kg)} kg. Einordnung von Einsteiger bis Weltklasse.</p></div>` : `<div class="card pad" style="margin-top:10px"><b>Leistungsprofil</b><p class="small muted">Trag dein Gewicht ein (hier oder im Wohlbefinden-Check), dann ordnet die App deine Werte in W/kg ein – vom Einsteiger bis zur Weltklasse – und erkennt deinen Fahrertyp.</p><button class="btn soft sm" data-act="perfEdit" style="margin-top:8px;width:100%">Gewicht eintragen</button></div>`}
    ${z ? `<div class="section-t">Intensitätsverteilung${rinfo('dist')}</div>
    <div class="card pad">${zoneBar(z)}${zoneLegend(z)}
      ${dt ? `<div class="tri"><div style="flex:${dt.f1}"><b>${Math.round(dt.f1 * 100)} %</b><span>locker</span></div><div style="flex:${Math.max(dt.f2, 0.08)}"><b>${Math.round(dt.f2 * 100)} %</b><span>mittel</span></div><div style="flex:${Math.max(dt.f3, 0.08)}"><b>${Math.round(dt.f3 * 100)} %</b><span>hart</span></div></div>
      <p class="p" style="margin-top:8px"><b style="color:var(--t1)">${dt.c[0]}.</b> ${dt.c[1]}</p>` : ''}</div>` : ''}
    ${efr.length ? `<div class="section-t">Aerobe Effizienz${rinfo('ef')}</div>
    <div class="card pad">${efSVG(efr, fit, R.from)}
      <p class="p">${efChg == null ? 'Für einen Trend braucht es mindestens 3 lockere Fahrten über 45 min mit Leistung und Puls.' : Math.abs(efChg) < 2 ? 'Deine Effizienz ist stabil.' : efChg > 0 ? `<b style="color:var(--ok)">Deine Effizienz ist um ${Math.round(efChg)} % gestiegen</b> – du trittst bei gleichem Puls mehr Watt. Ein klares Zeichen wachsender Grundlagenausdauer.` : `<b style="color:var(--c-tight)">Deine Effizienz ist um ${Math.round(-efChg)} % gesunken.</b> Mögliche Gründe: Ermüdung, Hitze, Infekt oder weniger Grundlagentraining.`}</p></div>` : ''}
    ${dec.length ? `<div class="section-t">Entkopplung${rinfo('dec')}</div>
    <div class="card list">${dec.map(r => { const g = r.dec < 5 ? ['grn', 'stabil'] : r.dec < 8 ? ['amb', 'leichte Drift'] : ['red', 'starke Drift']; return `<button class="li" data-act="actOpen" data-k="ride" data-id="${esc(r.id)}"><span class="ic">🫀</span><span class="bd"><b>${num(r.dec, 1)} % · ${esc(r.n || 'Radfahrt')}</b><small>${fmtDay(r.s)} · ${hTxt(r.min)} h</small></span><span class="tag ${g[0]}">${g[1]}</span></button>`; }).join('')}</div>` : ''}`;
}
function efSVG(efr, fit, from) {
  const W = 340, H = 110, xs = efr.map(r => (r.s - from) / DAY), x0 = Math.min(...xs), x1 = Math.max(...xs, x0 + 1);
  const lo = Math.min(...efr.map(r => r.ef)) * 0.97, hi = Math.max(...efr.map(r => r.ef)) * 1.03;
  const x = v => 12 + (v - x0) / (x1 - x0) * (W - 24), y = v => 8 + (1 - (v - lo) / (hi - lo || 1)) * (H - 26);
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart">`;
  if (fit) s += `<line class="cl cl2" x1="${x(x0).toFixed(1)}" y1="${y(fit.m * x0 + fit.b).toFixed(1)}" x2="${x(x1).toFixed(1)}" y2="${y(fit.m * x1 + fit.b).toFixed(1)}"/>`;
  efr.forEach((r, i) => { s += `<circle class="cdot" cx="${x(xs[i]).toFixed(1)}" cy="${y(r.ef).toFixed(1)}" r="3"/>`; });
  return s + tx(12, H - 4, dshort(efr[0].s)) + tx(W - 12, H - 4, dshort(efr[efr.length - 1].s), 'end') + tx(W - 12, 14, 'EF ' + num(efr[efr.length - 1].ef, 2), 'end') + '</svg>';
}

function rList() {
  const R = rng(), list = ridesIn(R.from, R.to).sort((a, b) => b.s - a.s);
  const row = r => { const t = rideTss(r); return `<button class="li" data-act="actOpen" data-k="ride" data-id="${esc(r.id)}"><span class="ic">🚴</span><span class="bd"><b>${esc(r.n || 'Radfahrt')}</b><small class="clip">${[r.km ? num(r.km) + ' km' : '', r.min ? hTxt(r.min) + ' h' : '', r.np || r.w ? (r.np || r.w) + ' W' : r.hr ? r.hr + ' bpm' : '', 'Last ' + Math.round(t.v)].filter(Boolean).join(' · ')}</small></span><span class="rt">${fmtDay(r.s)}</span></button>`; };
  return `${list.length ? `<div class="card list">${list.slice(0, ui.ride.all ? 500 : 30).map(row).join('')}</div>${list.length > 30 && !ui.ride.all ? '<button class="btn plain sm" data-act="rAll" style="margin-top:8px;width:100%">Alle ' + list.length + ' anzeigen</button>' : ''}` : '<div class="card empty">Keine Fahrten in diesem Zeitraum.</div>'}
    <div class="section-t">Import</div>
    <div class="card menu"><button data-act="fitPick"><span class="ico">⬆︎</span>FIT-Dateien oder ZIP importieren</button><button data-act="rideNew"><span class="ico">＋</span>Fahrt von Hand eintragen</button></div>
    <p class="small muted" style="margin:-4px 4px 0">Exportiere deine Aktivitäten z. B. in intervals.icu als FIT-Dateien (ZIP) und wähle die ZIP hier aus. Schon importierte Fahrten werden erkannt; ältere Importe werden dabei um die neue Leistungsanalyse ergänzt.</p>`;
}

/* ── Einzelne Fahrt ── */
function rideSheet(id) {
  const r = S.rides.find(x => x.id === id); if (!r) return;
  const d = new Date(r.s), kmh = r.kmh || (r.km && r.min ? r.km / (r.min / 60) : 0), ftp = myFtp(), kg = myKg(), t = rideTss(r), n = r.np || r.w;
  const cell = (l, v, u) => v ? `<div class="card stat"><small>${l}</small><b>${v}<i>${u}</i></b></div>` : '';
  const z = ftp && r.ph ? zonesOf([r], ftp) : null;
  const c90 = curve(r.s - 90 * DAY, r.s + DAY), cr = r.pb ? curve(r.s, r.s + 1) : null;
  const vi = r.np && r.w ? r.np / r.w : null, IF = ftp && n ? n / ftp : t.if;
  const ifTxt = IF == null ? '' : IF < 0.75 ? 'locker / Grundlage' : IF < 0.85 ? 'moderat (Tempo)' : IF < 0.95 ? 'hart (Sweet Spot / Schwelle)' : IF < 1.05 ? 'sehr hart (Schwellenbereich)' : 'Rennen / maximale Belastung';
  const pts = [];
  if (IF != null) pts.push(`Intensität ${num(IF, 2)} – <b>${ifTxt}</b>.`);
  if (vi) pts.push(`Gleichmäßigkeit (VI) ${num(vi, 2)} – ${vi < 1.06 ? 'sehr gleichmäßig gefahren' : vi < 1.15 ? 'normal wellig' : 'sehr unrhythmisch (Gruppe, Intervalle, Stadt)'}.`);
  if (r.dec != null) pts.push(`Entkopplung ${num(r.dec, 1)} % – ${r.dec < 5 ? 'Puls blieb stabil, gute Ausdauer für diese Intensität' : r.dec < 8 ? 'leichte Drift gegen Ende' : 'deutliche Drift: Ermüdung, Hitze oder für deine Ausdauer zu intensiv'}.`);
  if (r.ef) pts.push(`Effizienz (EF) ${num(r.ef, 2)} W/bpm – Leistung im Verhältnis zum Puls; steigt mit besserer Grundlagenausdauer.`);
  openSheet({
    title: r.n || 'Radfahrt', body: `<p class="p" style="margin:0 4px 12px">${DAYS[d.getDay()]}, ${fmtDate(d)} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr</p>
      <div class="stats k3" style="margin-bottom:10px">${cell('Distanz', r.km ? num(r.km) : '', 'km')}${cell('Zeit', r.min ? hTxt(r.min) : '', 'h')}${cell('Höhe', r.hm ? Math.round(r.hm) : '', 'hm')}${cell('Tempo', kmh ? num(kmh) : '', 'km/h')}${cell('Ø Leistung', r.w || '', 'W')}${cell('NP', r.np || '', 'W')}${cell('Puls', r.hr || '', 'bpm')}${cell('Kadenz', r.cad || '', '/min')}${cell('Arbeit', r.kj || '', 'kJ')}${cell('Belastung', Math.round(t.v), '')}${cell('W/kg', n && kg ? num(n / kg, 2) : '', '')}${cell('Puls max', r.hrmax || '', 'bpm')}</div>
      ${pts.length ? `<div class="card pad stack s6" style="margin-bottom:10px">${pts.map(p => `<p class="p" style="color:var(--t1)">• ${p}</p>`).join('')}<p class="small muted">${t.src === 'ftp' ? 'Belastung mit deinem FTP von ' + ftp + ' W berechnet' : t.src === 'dev' ? 'Belastung vom Radcomputer' : t.src === 'hr' ? 'Belastung aus dem Puls (Schwellenpuls ' + S.settings.lthr + ')' : 'Belastung nur über die Dauer geschätzt'}</p></div>` : ''}
      ${cr && Object.keys(cr).length > 2 ? `<div class="card pad" style="margin-bottom:10px"><div class="sec">Leistungskurve dieser Fahrt</div>${curveSVG(cr, c90, null)}<div class="legend" style="padding:6px 0 0"><span><i style="background:var(--acc)"></i>diese Fahrt</span><span><i style="background:var(--t3)"></i>Bestwerte 90 Tage</span></div></div>` : ''}
      ${z ? `<div class="card pad" style="margin-bottom:10px"><div class="sec">Zonen</div>${zoneBar(z)}${zoneLegend(z)}</div>` : ''}
      <div class="stack"><button class="btn soft" data-act="rt" data-id="r_bike">🧘 Ausgleich: „Nach dem Radfahren“</button>
      <button class="btn plain" data-act="rideName" data-id="${esc(id)}">✏️ Umbenennen</button>
      <button class="btn danger" data-act="rideDel" data-id="${esc(id)}">Fahrt löschen</button></div>`
  });
}
function rideForm() {
  openSheet({
    title: 'Fahrt eintragen', left: 'Abbrechen', right: '<button class="lnk r" data-act="rideSave">Speichern</button>',
    body: `<div class="field"><label>Name</label><input type="text" id="rdN" placeholder="z. B. Feierabendrunde"></div>
      <div class="field"><label>Datum</label><input type="date" id="rdD" value="${today()}" max="${today()}"></div>
      <div class="btns"><div class="field"><label>Distanz (km)</label><input inputmode="decimal" id="rdKm" placeholder="60"></div><div class="field"><label>Dauer (Minuten)</label><input inputmode="numeric" id="rdMin" placeholder="130"></div></div>
      <div class="btns"><div class="field"><label>Höhenmeter</label><input inputmode="numeric" id="rdHm" placeholder="optional"></div><div class="field"><label>Ø Watt</label><input inputmode="numeric" id="rdW" placeholder="optional"></div></div>
      <div class="field"><label>Ø Puls</label><input inputmode="numeric" id="rdHr" placeholder="optional"></div>
      <button class="btn primary" data-act="rideSave">Speichern</button>`
  });
}
function fitSheet(i) {
  const b = X.BIKEFIT[i]; if (!b) return;
  openSheet({
    title: b.n, body: `<div class="box tight" style="margin-bottom:10px"><div class="sec" style="color:var(--c-tight)">Häufige Ursachen</div>${ul(b.cause, 'var(--c-tight)')}</div>
      <div class="box bike" style="margin-bottom:10px"><div class="sec" style="color:var(--acc-t)">Was hilft</div>${ul(b.fix, 'var(--acc)')}</div>
      ${b.ex.length ? `<div class="section-t">Übungen dazu</div><div class="card list">${b.ex.map(x => exRow(x)).join('')}</div>` : ''}
      <button class="btn plain" data-act="topic" data-id="${b.topic}" style="margin-top:14px">${D.TOPICS[b.topic].ico} Zusammenhänge: ${esc(D.TOPICS[b.topic].n)}</button>
      <p class="note">Sitzposition immer nur in kleinen Schritten ändern und ein paar Fahrten testen. Bei anhaltenden Beschwerden lohnt ein professionelles Bikefitting.</p>`
  });
}

/* ── Leistungsdaten: FTP, Gewicht, Schwellenpuls, Profil ── */
let pd = null;
function perfSheet() {
  const c = curve(Date.now() - 90 * DAY, Infinity), e = c[1200] ? Math.round(c[1200].w * 0.95) : null, wk = Object.keys(S.well).some(d => S.well[d].kg);
  pd = { ftp: myFtp() || e || 200, kg: S.settings.kg || myKg() || 75, lthr: S.settings.lthr || '', sex: S.settings.sex || 'm' };
  const body = () => `<p class="p" style="margin:0 4px 12px">Diese Werte machen Zonen, Belastung und Leistungsprofil genau.</p>
    <div class="field"><label>FTP – Leistung, die du etwa 1 Stunde halten kannst</label><div class="stepper"><button data-act="pdStep" data-k="ftp" data-d="-5">−</button><b>${pd.ftp}<small>Watt</small></b><button data-act="pdStep" data-k="ftp" data-d="5">＋</button></div>
      ${e ? `<button class="lnk" data-act="pdUse" style="margin:8px 4px 0">Schätzung übernehmen: ${e} W (95 % deines 20-min-Bestwerts)</button>` : ''}</div>
    <div class="field"><label>Gewicht${wk ? ' (wird sonst aus dem Wohlbefinden-Check genommen)' : ''}</label><div class="stepper"><button data-act="pdStep" data-k="kg" data-d="-0.5">−</button><b>${num(pd.kg)}<small>kg</small></b><button data-act="pdStep" data-k="kg" data-d="0.5">＋</button></div></div>
    <div class="field"><label>Schwellenpuls (optional) – für Fahrten ohne Leistungsmesser</label><input inputmode="numeric" id="pdLthr" value="${pd.lthr}" placeholder="z. B. 168"></div>
    <div class="field"><label>Leistungsprofil vergleichen mit</label><div class="seg"><button data-act="pdSex" data-v="m" class="${pd.sex === 'm' ? 'on' : ''}">Männern</button><button data-act="pdSex" data-v="w" class="${pd.sex === 'w' ? 'on' : ''}">Frauen</button></div></div>
    <button class="btn primary" data-act="pdSave">Speichern</button>`;
  pd.body = body;
  openSheet({ title: 'Leistungsdaten', left: 'Abbrechen', body: body() });
}

/* ── Import von FIT-Dateien / ZIP ── */
const fitName = n => /\.fit(\.gz)?$/i.test(n) && !/(^|\/)(\.|__MACOSX)/.test(n);
const RKEYS = ['ver', 'km', 'min', 'hm', 'kmh', 'hr', 'hrmax', 'cad', 'w', 'np', 'wmax', 'kj', 'pb', 'ph', 'ef', 'dec', 'tssDev', 'ftpDev'];
async function importFiles(fileList) {
  const files = [].slice.call(fileList); if (!files.length) return;
  const res = { rides: 0, upd: 0, other: 0, dup: 0, bad: 0, total: 0 }, known = new Set(S.rides.map(r => r.id).concat(S.sessions.map(s => s.id)));
  openSheet({ title: 'Import', body: '<div class="empty"><div class="big">⏳</div><b id="impT">Lese Dateien …</b><div class="meter" style="margin-top:14px"><i id="impB" style="width:0%"></i></div></div>' });
  const tick = () => new Promise(r => setTimeout(r, 0));
  const one = (name, bytes) => {
    try {
      const a = FIT.summarize(/\.gz$/i.test(name) ? FIT.gunzip(bytes) : bytes), id = 'f' + Math.round(a.start / 1000);
      if (known.has(id)) {
        const ex = a.ride && S.rides.find(r => r.id === id);
        if (ex && !ex.ver) { RKEYS.forEach(k => { if (a[k] != null) ex[k] = a[k]; }); if (!ex.nm) ex.n = a.name; res.upd++; } else res.dup++;
        return;
      }
      known.add(id);
      if (a.ride) {
        const r = { id, src: 'fit', s: a.start, n: a.name };
        RKEYS.forEach(k => { if (a[k] != null) r[k] = a[k]; });
        S.rides.push(r); res.rides++;
      } else if (a.min >= 1) { const s = { id, k: 'sport', src: 'fit', n: a.name, s: a.start, min: Math.round(a.min) }; if (a.km) s.note = num(a.km) + ' km'; S.sessions.push(s); res.other++; }
    } catch (e) { res.bad++; }
  };
  try {
    const jobs = [];
    for (const f of files) {
      const u8 = new Uint8Array(await f.arrayBuffer());
      if (u8[0] === 0x50 && u8[1] === 0x4b) FIT.unzip(u8).filter(e => fitName(e.name)).forEach(e => jobs.push({ name: e.name, get: () => e.data() }));
      else if (/\.fit(\.gz)?$/i.test(f.name) || u8[0] === 0x1f) jobs.push({ name: u8[0] === 0x1f ? f.name.replace(/(\.gz)?$/i, '.gz') : f.name, get: () => u8 });
      else res.bad++;
    }
    res.total = jobs.length;
    for (let i = 0; i < jobs.length; i++) {
      let bytes = null; try { bytes = jobs[i].get(); } catch (e) { res.bad++; }
      if (bytes) one(jobs[i].name, bytes);
      if (i % 3 === 0) { const t = $('#impT'), b = $('#impB'); if (t) { t.textContent = `${i + 1} von ${jobs.length} …`; b.style.width = Math.round((i + 1) / jobs.length * 100) + '%'; } await tick(); }
    }
  } catch (e) { res.err = e.message; }
  if (res.rides || res.other || res.upd) save();
  render();
  const line = (ico, txt) => `<div class="li"><span class="ic">${ico}</span><span class="bd"><b>${txt}</b></span></div>`;
  sheetBody(`${res.err ? `<div class="box red" style="margin-bottom:10px">${esc(res.err)}</div>` : ''}
    <div class="card list" style="margin-bottom:14px">${line('🚴', plural(res.rides, 'neue Fahrt', 'neue Fahrten'))}${res.upd ? line('✨', `${res.upd} um die Leistungsanalyse ergänzt`) : ''}${res.other ? line('🏃', plural(res.other, 'andere Aktivität', 'andere Aktivitäten')) : ''}${res.dup ? line('↩︎', `${res.dup} schon vorhanden – übersprungen`) : ''}${res.bad ? line('⚠️', `${res.bad} nicht lesbar`) : ''}</div>
    ${!res.total && !res.err ? '<p class="p" style="text-align:center;margin-bottom:14px">In der Auswahl waren keine FIT-Dateien. Unterstützt werden .fit, .fit.gz und ZIP-Archive mit solchen Dateien.</p>' : ''}
    ${(res.rides || res.upd) && !myFtp() ? '<button class="btn soft" data-act="perfEdit" style="margin-bottom:8px">FTP & Gewicht eintragen – für genaue Analyse</button>' : ''}
    <button class="btn primary" data-act="closeSheet">Fertig</button>`);
}
document.addEventListener('change', e => { if (e.target.id === 'fitFile' && e.target.files.length) importFiles(e.target.files); });

const RINFO = {
  pmc: ['Fitness, Ermüdung, Form', ['<b>Belastung</b> einer Fahrt = Dauer × Intensität. Eine Stunde voll an der Schwelle (FTP) ergibt 100 Punkte.', '<b>Fitness</b> (CTL) ist der Schnitt deiner Belastung über rund 6 Wochen – sie steigt langsam mit regelmäßigem Training.', '<b>Ermüdung</b> (ATL) ist der Schnitt der letzten 7 Tage – sie reagiert schnell auf harte Tage.', '<b>Form</b> (TSB) = Fitness − Ermüdung. Leicht negativ (−10 bis −30) ist ideal zum Aufbauen, positiv bedeutet frisch.']],
  ramp: ['Aufbau-Tempo', ['Wie stark deine Fitness in 7 Tagen gestiegen ist.', '3–8 Punkte pro Woche gelten als produktiv und verträglich.', 'Mehr als 8 über mehrere Wochen erhöht das Risiko für Überlastung.']],
  acwr: ['Belastungssteuerung', ['<b>Akut : chronisch</b> vergleicht die letzte Woche mit dem Schnitt der 4 Wochen davor. 0,8–1,3 gilt als sicherer Bereich, über 1,5 als riskanter Sprung.', '<b>Monotonie</b> misst, wie ähnlich die Tage waren. Werte über 2 bedeuten: kaum Wechsel zwischen harten und lockeren Tagen – das ermüdet mehr als nötig.']],
  cp: ['Schwelle & Kapazität', ['<b>FTP</b>: Leistung, die du etwa eine Stunde halten kannst. Grundlage für Zonen und Belastung.', '<b>eFTP</b>: Schätzung aus deinen Bestwerten (95 % des besten 20-min-Werts).', '<b>CP</b> (kritische Leistung): theoretische Dauerleistung aus deinen 3–20-min-Bestwerten.', '<b>W′</b>: anaerobe Reserve in kJ – wie viel Arbeit du über CP hinaus leisten kannst (Attacken, Sprints).']],
  prof: ['Leistungsprofil', ['Vergleicht deine Bestwerte pro kg Körpergewicht mit Richtwerten nach Andrew Coggan.', '5 s = Sprint · 1 min = anaerobe Kapazität · 5 min = VO₂max · FTP = Schwelle.', 'Wo du im Vergleich am stärksten bist, ergibt deinen Fahrertyp; wo am schwächsten, liegt das größte Potenzial.']],
  dist: ['Intensitätsverteilung', ['Zeit in den 7 Leistungszonen, Rollphasen ausgenommen.', 'Zusammengefasst: <b>locker</b> = Z1–Z2 (bis 75 % FTP), <b>mittel</b> = Z3–Z4 (76–105 %), <b>hart</b> = Z5+ (über 105 %).', '<b>Polarisiert</b> (viel locker, wenig mittel, etwas hart) und <b>pyramidal</b> gelten als besonders wirksam. Viel „mittel“ ist anstrengend, bringt aber vergleichsweise wenig.']],
  ef: ['Aerobe Effizienz (EF)', ['Normalisierte Leistung geteilt durch den Durchschnittspuls – also Watt pro Herzschlag.', 'Gewertet werden nur lockere Fahrten über 45 min, damit die Werte vergleichbar sind.', 'Steigt der EF, ist deine Grundlagenausdauer besser geworden.']],
  dec: ['Entkopplung (Pw:HR)', ['Vergleicht Leistung pro Puls in der ersten und zweiten Hälfte einer Fahrt.', 'Unter 5 %: der Puls blieb stabil – deine Ausdauer reicht für diese Intensität.', 'Über 8 %: der Puls lief davon – Ermüdung, Hitze, wenig Trinken oder die Fahrt war für deine aktuelle Ausdauer zu intensiv.']]
};

Object.assign(ACT, {
  rTab(el) { ui.ride.tab = el.dataset.v; render(); window.scrollTo(0, 0); },
  rRange(el) { ui.ride.range = el.dataset.v; ui.ride.all = false; keepScroll(render); },
  rChart(el) { ui.ride.chart = el.dataset.v; keepScroll(render); },
  rUnit(el) { ui.ride.unit = el.dataset.v; keepScroll(render); },
  rAll() { ui.ride.all = true; keepScroll(render); },
  rInfo(el) { const i = RINFO[el.dataset.v]; if (el.dataset.v === 'perf') { perfSheet(); return; } if (i) openSheet({ title: i[0], body: `<div class="card pad stack">${i[1].map(t => `<p class="p" style="color:var(--t1)">${t}</p>`).join('')}</div><p class="note">Orientierungswerte aus der Trainingswissenschaft – kein Messwert und keine medizinische Aussage.</p>` }); },
  rideNew() { rideForm(); },
  rideSave() {
    const km = numVal($('#rdKm').value), min = numVal($('#rdMin').value);
    if (!km && !min) { toast('Bitte Distanz oder Dauer eintragen'); return; }
    const dk = $('#rdD').value || today(), ts = dk === today() ? Date.now() : fromKey(dk).getTime() + 12 * 36e5;
    const r = { id: 'm' + uid(), src: 'manual', s: ts, n: $('#rdN').value.trim() || 'Radfahrt', km: km || 0, min: min || 0, hm: Math.round(numVal($('#rdHm').value) || 0) };
    const w = numVal($('#rdW').value); if (w) r.w = Math.round(w);
    const hr = numVal($('#rdHr').value); if (hr) r.hr = Math.round(hr);
    S.rides.push(r); save(); closeSheet(); render(); toast('Fahrt gespeichert', { label: 'Jetzt dehnen', fn: () => rtSheet('r_bike') });
  },
  rideDel(el) { confirmSheet('Diese Fahrt löschen?', 'Löschen', () => { S.rides = S.rides.filter(r => r.id !== el.dataset.id); save(); closeAllSheets(); keepScroll(render); }); },
  rideName(el) { const r = S.rides.find(x => x.id === el.dataset.id); if (!r) return; closeAllSheets(); askText('Fahrt umbenennen', 'Name', r.n || '', v => { r.n = v; r.nm = 1; save(); keepScroll(render); toast('Umbenannt'); }); },
  fit(el) { fitSheet(+el.dataset.i); },
  fitPick() { const f = $('#fitFile'); if (f) { f.value = ''; f.click(); } else { go('ride'); setTimeout(() => { const g = $('#fitFile'); if (g) g.click(); }, 50); } },
  perfEdit() { perfSheet(); },
  ftpEdit() { perfSheet(); },
  ftpSet(el) { S.settings.ftp = +el.dataset.v; save(); keepScroll(render); toast(`FTP ${S.settings.ftp} W übernommen`); },
  pdStep(el) { const k = el.dataset.k, d = +el.dataset.d; pd[k] = k === 'kg' ? Math.max(35, Math.min(160, Math.round((pd.kg + d) * 2) / 2)) : Math.max(80, Math.min(550, pd.ftp + d)); pd.lthr = $('#pdLthr').value; sheetBody(pd.body()); },
  pdUse() { const c = curve(Date.now() - 90 * DAY, Infinity); if (c[1200]) { pd.ftp = Math.round(c[1200].w * 0.95); pd.lthr = $('#pdLthr').value; sheetBody(pd.body()); } },
  pdSex(el) { pd.sex = el.dataset.v; pd.lthr = $('#pdLthr').value; sheetBody(pd.body()); },
  pdSave() {
    const l = numVal($('#pdLthr').value);
    Object.assign(S.settings, { ftp: pd.ftp, kg: pd.kg, lthr: l ? Math.round(l) : null, sex: pd.sex });
    save(); closeSheet(); keepScroll(render); toast('Leistungsdaten gespeichert');
  }
});
