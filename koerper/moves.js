'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   BEWEGUNGS-ANIMATIONEN
   Strichfigur mit Gelenkwinkeln, Posen werden weich ineinander überblendet.
   Läuft ohne Bilder/GIFs: winzig, offline, scharf auf jedem Display, passt
   sich hell/dunkel an. Daten: MOVES_DATA (moves-data.js).

   Winkel absolut in Grad: 0 = nach unten, 90 = nach rechts (vorn),
   180 = nach oben, 270 = nach links (hinten). Seitenansicht: Blick nach rechts.
   Wert [winkel, faktor]: faktor < 1 verkürzt (zeigt zur Kamera/von ihr weg),
   negativ = in die Gegenrichtung (für Drehungen durch die Bildebene).
   ═══════════════════════════════════════════════════════════════════════════ */
const Moves = (function () {
  const LEN = { t: 46, n: 7, hd: 8.5, ua: 25, fa: 23, th: 38, sh: 36, ft: 11, shw: 12, hpw: 8 };
  const GY = 130, R = Math.PI / 180;
  const vec = (a, l) => [Math.sin(a * R) * l, Math.cos(a * R) * l];
  const sg = (v, d) => v == null ? (d == null ? null : sg(d)) : Array.isArray(v) ? [v[0], v[1] == null ? 1 : v[1]] : [v, 1];
  const step = (p, a, l) => { const d = vec(a[0], l * a[1]); return [p[0] + d[0], p[1] + d[1]]; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = k => 0.5 - Math.cos(Math.PI * k) / 2;

  /* ── Pose normalisieren: alle Werte als [winkel, faktor] ── */
  function norm(p, v) {
    const a1 = p.a1 || [0, 0], a2 = p.a2 || a1, l1 = p.l1 || [0, 0, 90], l2 = p.l2 || l1;
    return {
      v: p.v || v || 'side', at: (p.at || ['A1', 100, 126]).slice(),
      t: sg(p.t, 180), h: sg(p.h == null ? p.t : p.h, 180), tc: p.tc || 0, se: p.se || 0,
      sw: p.sw == null ? 1 : p.sw, hw: p.hw == null ? 1 : p.hw,
      a1: [sg(a1[0]), sg(a1[1])], a2: [sg(a2[0]), sg(a2[1])],
      l1: [sg(l1[0]), sg(l1[1]), sg(l1[2], 90)], l2: [sg(l2[0]), sg(l2[1]), sg(l2[2], 90)],
      hd: p.hd, mv: p.mv
    };
  }
  /* ── Vorwärtskinematik ── */
  function fk(p) {
    const J = {}, u = vec(p.t[0], 1);
    J.H = [0, 0];
    J.S = step(J.H, p.t, LEN.t);
    J.N = step(J.S, p.h, LEN.n); J.C = step(J.N, p.h, LEN.hd);
    if (p.v === 'front') {
      const pp = [u[1], -u[0]], sw = p.sw * LEN.shw, hw = p.hw * LEN.hpw;
      J.S1 = [J.S[0] + pp[0] * sw, J.S[1] + pp[1] * sw]; J.S2 = [J.S[0] - pp[0] * sw, J.S[1] - pp[1] * sw];
      J.H1 = [pp[0] * hw, pp[1] * hw]; J.H2 = [-pp[0] * hw, -pp[1] * hw];
    } else { J.S1 = J.S.slice(); J.S2 = J.S.slice(); J.H1 = [0, 0]; J.H2 = [0, 0]; }
    if (p.se) { const d = [u[0] * p.se, u[1] * p.se]; ['S1', 'S2'].forEach(k => { J[k] = [J[k][0] + d[0], J[k][1] + d[1]]; }); }
    J.E1 = step(J.S1, p.a1[0], LEN.ua); J.W1 = step(J.E1, p.a1[1], LEN.fa);
    J.E2 = step(J.S2, p.a2[0], LEN.ua); J.W2 = step(J.E2, p.a2[1], LEN.fa);
    J.K1 = step(J.H1, p.l1[0], LEN.th); J.A1 = step(J.K1, p.l1[1], LEN.sh); J.T1 = step(J.A1, p.l1[2], LEN.ft);
    J.K2 = step(J.H2, p.l2[0], LEN.th); J.A2 = step(J.K2, p.l2[1], LEN.sh); J.T2 = step(J.A2, p.l2[2], LEN.ft);
    // Rumpfkrümmung: Kontrollpunkt seitlich der Rumpflinie (positiv = Rücken rund)
    const back = [u[1], -u[0]];
    J.Q = [(J.H[0] + J.S[0]) / 2 + back[0] * p.tc, (J.H[1] + J.S[1]) / 2 + back[1] * p.tc];
    J.B = back; J.U = u;
    const a = J[p.at[0]] || J.A1, dx = p.at[1] - a[0], dy = p.at[2] - a[1];
    for (const k in J) if (k !== 'B' && k !== 'U') { J[k][0] += dx; J[k][1] += dy; }
    return J;
  }
  function mix(a, b, k) {
    const s = (x, y) => [lerp(x[0], y[0], k), lerp(x[1], y[1], k)];
    return {
      v: a.v, at: [a.at[0], lerp(a.at[1], b.at[1], k), lerp(a.at[2], b.at[2], k)],
      t: s(a.t, b.t), h: s(a.h, b.h), tc: lerp(a.tc, b.tc, k), se: lerp(a.se, b.se, k), sw: lerp(a.sw, b.sw, k), hw: lerp(a.hw, b.hw, k),
      a1: [s(a.a1[0], b.a1[0]), s(a.a1[1], b.a1[1])], a2: [s(a.a2[0], b.a2[0]), s(a.a2[1], b.a2[1])],
      l1: [s(a.l1[0], b.l1[0]), s(a.l1[1], b.l1[1]), s(a.l1[2], b.l1[2])], l2: [s(a.l2[0], b.l2[0]), s(a.l2[1], b.l2[1]), s(a.l2[2], b.l2[2])]
    };
  }
  // Zwei-Glieder-Kinematik: Arm/Bein so beugen, dass Hand bzw. Knöchel ein Ziel erreicht.
  // ik: [[glied, ziel, beugung]] · glied 'a1'|'a2'|'l1'|'l2' · ziel [x, y] absolut oder
  // ['K2', dx, dy] (Gelenk derselben Pose) · beugung: mittleres Gelenk 'f' vorn, 'b' hinten, 'u' oben, 'd' unten
  const ROOT = { a1: ['S1', 'ua', 'fa'], a2: ['S2', 'ua', 'fa'], l1: ['H1', 'th', 'sh'], l2: ['H2', 'th', 'sh'] };
  const deg = (dx, dy) => Math.atan2(dx, dy) / R;
  const near = (a, ref) => { while (a - ref > 180) a -= 360; while (ref - a > 180) a += 360; return a; };
  function applyIK(p, list) {
    (list || []).forEach(([lb, tg, bend]) => {
      const J = fk(p), [rk, k1, k2] = ROOT[lb], r = J[rk], L1 = LEN[k1], L2 = LEN[k2];
      const t = typeof tg[0] === 'string' ? [J[tg[0]][0] + (tg[1] || 0), J[tg[0]][1] + (tg[2] || 0)] : tg;
      const dx = t[0] - r[0], dy = t[1] - r[1], d = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.01, Math.hypot(dx, dy)));
      const base = deg(dx, dy), al = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)) / R;
      const cand = [base + al, base - al].map(a1 => { const m = [r[0] + Math.sin(a1 * R) * L1, r[1] + Math.cos(a1 * R) * L1]; return { a1, m, a2: deg(t[0] - m[0], t[1] - m[1]) }; });
      const score = c => bend === 'f' ? c.m[0] : bend === 'b' ? -c.m[0] : bend === 'u' ? -c.m[1] : c.m[1];
      const c = score(cand[0]) >= score(cand[1]) ? cand[0] : cand[1];
      p[lb][0] = [near(c.a1, p[lb][0][0]), 1]; p[lb][1] = [near(c.a2, p[lb][1][0]), 1];
    });
    return p;
  }
  // Pose mit Zwangsbedingung: Parameter so wählen, dass ein Gelenk eine Höhe/Position erreicht
  function solve(fr, v) {
    if (!fr.fn) return fr.ik ? applyIK(norm(fr, v), fr.ik) : norm(fr, v);
    const [j, ax, val, lo, hi] = fr.fit, i = ax === 'x' ? 0 : 1;
    const g = x => fk(norm(fr.fn(x), v))[j][i] - val;
    let a = lo, b = hi, ga = g(a), gb = g(b), x;
    if (ga * gb > 0) x = Math.abs(ga) < Math.abs(gb) ? a : b;
    else { for (let n = 0; n < 40; n++) { const m = (a + b) / 2, gm = g(m); if (ga * gm <= 0) { b = m; gb = gm; } else { a = m; ga = gm; } } x = (a + b) / 2; }
    const p = norm(fr.fn(x), v);
    if (fr.hd != null) p.hd = fr.hd; if (fr.mv != null) p.mv = fr.mv;
    return fr.ik ? applyIK(p, fr.ik) : p;
  }

  /* ── Ablauf ── */
  const cache = {};
  function prep(id) {
    if (cache[id]) return cache[id];
    let spec = MOVES_DATA[id];
    if (typeof spec === 'string') spec = MOVES_DATA[spec];
    if (!spec) return null;
    const F = spec.f.map(f => solve(f, spec.v));
    const n = F.length, seq = spec.seq || (spec.cyc ? F.map((_, i) => i) : n === 1 ? [0] : F.map((_, i) => i).concat(F.map((_, i) => i).slice(1, -1).reverse()));
    const steps = []; let T = 0;
    seq.forEach((fi, si) => {
      const prev = seq[(si - 1 + seq.length) % seq.length], f = F[fi];
      const mv = f.mv != null ? f.mv : spec.mv != null ? spec.mv : 1;
      const hd = f.hd != null ? f.hd : spec.hd != null ? spec.hd : 0.35;
      steps.push({ a: prev, b: fi, t0: T, mv, hd }); T += mv + hd;
    });
    const key = spec.key != null ? spec.key : n - 1;
    const c = { spec, F, steps, T: Math.max(T, 0.01), key };
    c.props = (spec.pr || []).map(pr => resolveProp(pr, F));
    c.box = bbox(c);
    cache[id] = c;
    return c;
  }
  function poseAt(c, t) {
    t = t % c.T;
    for (const s of c.steps) {
      if (t < s.t0 + s.mv) return s.mv <= 0.002 ? c.F[s.b] : mix(c.F[s.a], c.F[s.b], ease(Math.max(0, (t - s.t0) / s.mv)));
      if (t < s.t0 + s.mv + s.hd) return c.F[s.b];
    }
    return c.F[c.steps[c.steps.length - 1].b];
  }
  // Statische Requisiten dürfen Gelenke eines Frames referenzieren: 'W1@0+3'
  function resolveProp(pr, F) {
    const o = Object.assign({}, pr);
    ['x', 'y', 'x2', 'y2'].forEach(k => {
      if (typeof o[k] !== 'string') return;
      const m = o[k].match(/^([A-Z]\d?)@(\d+)([+-]\d+(?:\.\d+)?)?$/);
      if (!m) { o[k] = +o[k] || 0; return; }
      const J = fk(F[+m[2]]), ax = k[0] === 'x' ? 0 : 1;
      o[k] = J[m[1]][ax] + (m[3] ? +m[3] : 0);
    });
    if (Array.isArray(o.p)) o.p = o.p.slice();
    return o;
  }

  /* ── Zeichnen ── */
  const P = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const torsoPath = J => `M${J.H[0].toFixed(1)},${J.H[1].toFixed(1)} Q${J.Q[0].toFixed(1)},${J.Q[1].toFixed(1)} ${J.S[0].toFixed(1)},${J.S[1].toFixed(1)}`;
  function partSeg(J, a, b, f0, f1) {
    if (a === 'H' && b === 'S') { // auf der Rumpfkurve
      const q = (t) => { const u = 1 - t; return [u * u * J.H[0] + 2 * u * t * J.Q[0] + t * t * J.S[0], u * u * J.H[1] + 2 * u * t * J.Q[1] + t * t * J.S[1]]; };
      const pts = []; for (let i = 0; i <= 6; i++) pts.push(q(f0 + (f1 - f0) * i / 6));
      return pts;
    }
    const A = J[a], B = J[b];
    return [[lerp(A[0], B[0], f0), lerp(A[1], B[1], f0)], [lerp(A[0], B[0], f1), lerp(A[1], B[1], f1)]];
  }
  const HL = {
    torso: ['H', 'S', 0, 1], abs: ['H', 'S', 0.1, 0.6], chest: ['H', 'S', 0.55, 1], lowback: ['H', 'S', 0, 0.5], upback: ['H', 'S', 0.5, 1],
    neck: ['S', 'C', 0, 0.75], ua1: ['S1', 'E1', 0, 1], fa1: ['E1', 'W1', 0, 1], ua2: ['S2', 'E2', 0, 1], fa2: ['E2', 'W2', 0, 1],
    th1: ['H1', 'K1', 0, 1], sh1: ['K1', 'A1', 0, 1], ft1: ['A1', 'T1', 0, 1], th2: ['H2', 'K2', 0, 1], sh2: ['K2', 'A2', 0, 1], ft2: ['A2', 'T2', 0, 1],
    calf1: ['K1', 'A1', 0.1, 0.7], calf2: ['K2', 'A2', 0.1, 0.7], ham1: ['H1', 'K1', 0.1, 0.9], ham2: ['H2', 'K2', 0.1, 0.9]
  };
  function hlShapes(J, list) {
    const out = [];
    (list || []).forEach(k => {
      if (k === 'glute' || k === 'glute2') { const H = k === 'glute' ? J.H1 : J.H2; out.push({ c: [H[0] + J.B[0] * 3.5 - J.U[0] * 2, H[1] + J.B[1] * 3.5 - J.U[1] * 2], r: 6.5 }); return; }
      if (k === 'hip' || k === 'hip2') { const H = k === 'hip' ? J.H1 : J.H2; out.push({ c: H, r: 6 }); return; }
      if (k === 'shoulder' || k === 'shoulder2') { const S = k === 'shoulder' ? J.S1 : J.S2; out.push({ c: S, r: 6 }); return; }
      if (k === 'foot' || k === 'foot2') { const a = k === 'foot' ? J.A1 : J.A2, t = k === 'foot' ? J.T1 : J.T2; out.push({ p: [a, t] }); return; }
      const d = HL[k]; if (d) out.push({ p: partSeg(J, d[0], d[1], d[2], d[3]) });
    });
    return out;
  }
  function staticProp(pr) {
    const k = pr.k;
    if (k === 'bench' || k === 'table') {
      const h = pr.h || 5, x = pr.x, y = pr.y, w = pr.w || 50;
      return `<rect class="pf" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/><path class="ps" d="M${x + 4},${y + h} V${GY} M${x + w - 4},${y + h} V${GY}"/>`;
    }
    if (k === 'box') return `<rect class="pf" x="${pr.x}" y="${pr.y}" width="${pr.w || 40}" height="${GY - pr.y}" rx="2"/>`;
    if (k === 'wall') return `<rect class="pf" x="${pr.x - (pr.side === 'r' ? 0 : 5)}" y="${pr.y == null ? -60 : pr.y}" width="5" height="${GY - (pr.y == null ? -60 : pr.y)}"/>`;
    if (k === 'bar') return `<line class="ps" x1="${pr.x - 9}" y1="${pr.y}" x2="${pr.x + 9}" y2="${pr.y}"/><circle class="pk" cx="${pr.x}" cy="${pr.y}" r="2.6"/>`;
    if (k === 'rail') return `<line class="ps" style="stroke-width:3.5" x1="${pr.x - (pr.w || 22)}" y1="${pr.y}" x2="${pr.x + (pr.w || 22)}" y2="${pr.y}"/><line class="ps" x1="${pr.x - (pr.w || 22) + 3}" y1="${pr.y}" x2="${pr.x - (pr.w || 22) + 3}" y2="${GY}"/>`;
    if (k === 'post') return `<line class="ps" x1="${pr.x}" y1="${pr.y - 6}" x2="${pr.x}" y2="${GY}"/><circle class="pk" cx="${pr.x}" cy="${pr.y}" r="2.6"/>`;
    if (k === 'roller' || k === 'ball') return `<circle class="pf" cx="${pr.x}" cy="${pr.y == null ? GY - (pr.r || 7) : pr.y}" r="${pr.r || 7}"/>`;
    if (k === 'wedge') return `<path class="pf" d="M${pr.x},${GY} L${pr.x + (pr.w || 16)},${GY} L${pr.x + (pr.w || 16)},${GY - (pr.h || 6)} Z"/>`;
    if (k === 'pad') return `<rect class="pf" x="${pr.x - 4}" y="${pr.y - 4}" width="8" height="${pr.h || 8}" rx="2"/>`;
    if (k === 'line') return `<path class="ps" d="${pr.d}"/>`;
    if (k === 'seg') return `<line class="ps" style="stroke-width:5" x1="${pr.x}" y1="${pr.y}" x2="${pr.x2}" y2="${pr.y2}"/>`;
    if (k === 'seat') return `<path class="ps" style="stroke-width:4" d="M${pr.x},${pr.y} L${pr.x2},${pr.y2}"/>`;
    return '';
  }
  // Bewegte Requisiten (hängen an Gelenken)
  function dynProp(pr, J) {
    const g = n => J[n] || [0, 0], dx = pr.dx || 0, dy = pr.dy || 0;
    if (pr.k === 'db') { const w = g(pr.j); return `<rect class="pk" x="${(w[0] + dx - 5).toFixed(1)}" y="${(w[1] + dy - 2.5).toFixed(1)}" width="10" height="5" rx="2"/>`; }
    if (pr.k === 'plate') { const w = g(pr.j); return `<circle class="pp" cx="${(w[0] + dx).toFixed(1)}" cy="${(w[1] + dy).toFixed(1)}" r="${pr.r || 10}"/><circle class="pk" cx="${(w[0] + dx).toFixed(1)}" cy="${(w[1] + dy).toFixed(1)}" r="2"/>`; }
    if (pr.k === 'kb') { const w = g(pr.j); return `<circle class="pk" cx="${(w[0] + dx).toFixed(1)}" cy="${(w[1] + dy + 6).toFixed(1)}" r="5.5"/>`; }
    if (pr.k === 'wheel') { const w = g(pr.j); return `<circle class="pp" cx="${(w[0] + dx).toFixed(1)}" cy="${(w[1] + dy).toFixed(1)}" r="${pr.r || 6}"/>`; }
    if (pr.k === 'band') { const w = g(pr.j), p = pr.p || g(pr.j2); return `<line class="pb" x1="${p[0]}" y1="${p[1]}" x2="${(w[0] + dx).toFixed(1)}" y2="${(w[1] + dy).toFixed(1)}"/>`; }
    if (pr.k === 'stick') { const a = g(pr.j), b = g(pr.j2), e = pr.e || 0, v = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(v[0], v[1]) || 1, n = [v[0] / l * e, v[1] / l * e]; return `<line class="ps" style="stroke-width:3" x1="${(a[0] - n[0]).toFixed(1)}" y1="${(a[1] - n[1]).toFixed(1)}" x2="${(b[0] + n[0]).toFixed(1)}" y2="${(b[1] + n[1]).toFixed(1)}"/>`; }
    if (pr.k === 'dot') { const w = g(pr.j); return `<circle class="pk" cx="${(w[0] + dx).toFixed(1)}" cy="${(w[1] + dy).toFixed(1)}" r="${pr.r || 2.6}"/>`; }
    if (pr.k === 'groundball') { const a = g(pr.j), b = g(pr.j2 || pr.j), r = pr.r || 5; return `<circle class="pf" cx="${((a[0] + b[0]) / 2).toFixed(1)}" cy="${GY - r}" r="${r}"/>`; }
    if (pr.k === 'roll') { const a = g(pr.a), b = g(pr.b), f = pr.f || 0.5, r = pr.r || 7; return `<circle class="pf" cx="${lerp(a[0], b[0], f).toFixed(1)}" cy="${GY - r}" r="${r}"/>`; }
    if (pr.k === 'plat') { const a = g(pr.j), b = g(pr.j2), v = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(v[0], v[1]) || 1, e = pr.e || 9; return `<line class="ps" style="stroke-width:4" x1="${(a[0] - v[0] / l * e).toFixed(1)}" y1="${(a[1] - v[1] / l * e).toFixed(1)}" x2="${(b[0] + v[0] / l * e).toFixed(1)}" y2="${(b[1] + v[1] / l * e).toFixed(1)}"/>`; }
    return '';
  }
  function figSVG(J, v, cls) {
    const far = v === 'front' ? '' : ' far';
    let s = `<g class="${cls}">`;
    s += `<polyline class="lb${far}" points="${P([J.S2, J.E2, J.W2])}"/>`;
    s += `<polyline class="lb${far}" points="${P([J.H2, J.K2, J.A2, J.T2])}"/>`;
    if (v === 'front') s += `<polyline class="lb" points="${P([J.H1, J.H2])}"/><polyline class="lb" points="${P([J.S1, J.S2])}"/>`;
    s += `<path class="tr" d="${torsoPath(J)}"/><polyline class="lb" points="${P([J.S, J.N])}"/>`;
    s += `<polyline class="lb" points="${P([J.H1, J.K1, J.A1, J.T1])}"/>`;
    s += `<polyline class="lb" points="${P([J.S1, J.E1, J.W1])}"/>`;
    s += `<circle class="hd" cx="${J.C[0].toFixed(1)}" cy="${J.C[1].toFixed(1)}" r="${LEN.hd}"/>`;
    return s + '</g>';
  }
  function bbox(c) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const add = (x, y, r) => { r = r || 0; x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
    for (let i = 0; i <= 30; i++) {
      const J = fk(poseAt(c, c.T * i / 30)), up = c.spec.crop === 'up';
      for (const k in J) if (k !== 'B' && k !== 'U' && k !== 'Q' && (!up || /^(S|S1|S2|N|C|E1|E2|W1|W2)$/.test(k)) && (c.spec.crop !== 'mid' || !/^(A2|T2)$/.test(k))) add(J[k][0], J[k][1], k === 'C' ? LEN.hd + 1 : 3.5);
      if (up) add(J.H[0], J.H[1] + 6);
      c.spec.pr && c.spec.pr.forEach(pr => { if (pr.j && J[pr.j]) add(J[pr.j][0] + (pr.dx || 0), J[pr.j][1] + (pr.dy || 0), pr.r || 7); });
    }
    if (c.spec.crop !== 'up') c.props.forEach(pr => {
      if (pr.k === 'bench' || pr.k === 'table') { add(pr.x, pr.y); add(pr.x + (pr.w || 50), GY); }
      else if (pr.k === 'box') { add(pr.x, pr.y); add(pr.x + (pr.w || 40), GY); }
      else if (pr.k === 'wall') add(pr.x, y0);
      else if (pr.k === 'roller' || pr.k === 'ball') add(pr.x, pr.y == null ? GY - (pr.r || 7) : pr.y, pr.r || 7);
      else if (pr.k === 'bar' || pr.k === 'post' || pr.k === 'pad') add(pr.x, pr.y, 6);
      else if (pr.k === 'rail') { add(pr.x - (pr.w || 22), pr.y); add(pr.x + (pr.w || 22), GY); }
      else if (pr.k === 'band' && pr.p) add(pr.p[0], pr.p[1], 3);
    });
    if (!c.spec.ng && c.spec.crop !== 'up') y1 = Math.max(y1, GY + 2);
    const pad = 7; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    let w = x1 - x0, h = y1 - y0;
    const minW = Math.max(w, h * 1.15, 96), minH = Math.max(h, w / 1.9, 72);
    x0 -= (minW - w) / 2; y0 -= (minH - h) * 0.7; w = minW; h = minH;
    return [x0, y0, w, h];
  }
  function frameSVG(c, J, extra) {
    const b = c.box, sp = c.spec;
    let s = '';
    if (!sp.ng) s += `<line class="gd" x1="${(b[0] - 5).toFixed(1)}" y1="${GY + 1.5}" x2="${(b[0] + b[2] + 5).toFixed(1)}" y2="${GY + 1.5}"/>`;
    s += c.props.map(staticProp).join('');
    s += extra || '';
    s += `<g class="hl">${hlShapes(J, sp.hl).map(h => h.c ? `<circle cx="${h.c[0].toFixed(1)}" cy="${h.c[1].toFixed(1)}" r="${h.r}"/>` : `<polyline points="${P(h.p)}"/>`).join('')}</g>`;
    s += `<g class="dp">${(sp.pr || []).filter(pr => pr.j || pr.a).map(pr => dynProp(pr, J)).join('')}</g>`;
    s += figSVG(J, c.F[0].v, 'fg');
    return s;
  }

  /* ── Öffentliche Funktionen ── */
  function has(id) { return !!MOVES_DATA[id]; }
  const thumbs = {};
  function thumb(id) {
    if (thumbs[id] != null) return thumbs[id];
    const c = prep(id); if (!c) return (thumbs[id] = '');
    const Jk = fk(c.F[c.key]), J0 = fk(c.F[0]), diff = c.key !== 0;
    const ghost = diff ? figSVG(J0, c.F[0].v, 'gh') : '';
    return (thumbs[id] = `<svg class="mvs" viewBox="${c.box.map(n => n.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${frameSVG(c, Jk, ghost)}</svg>`);
  }
  const live = new Set();
  let raf = 0;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.target._mv) e.target._mv.vis = e.isIntersecting; }), { rootMargin: '60px' }) : null;
  function mount(el) {
    const id = el.dataset.mv, c = prep(id);
    el.dataset.mvok = '1';
    if (!c) { el.hidden = true; return; }
    const ghost = c.key !== 0 ? figSVG(fk(c.F[0]), c.F[0].v, 'gh') : '';
    el.innerHTML = `<svg class="mva" viewBox="${c.box.map(n => n.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Bewegungsablauf"><g class="gh0">${ghost}</g><g class="fr">${frameSVG(c, fk(c.F[0]))}</g></svg>${c.spec.lbl ? `<span class="mvl">${c.spec.lbl}</span>` : ''}<span class="mvp" aria-hidden="true">❚❚</span>`;
    const it = { el, c, g: el.querySelector('.fr'), t0: performance.now(), vis: true, paused: reduce, last: -1 };
    el._mv = it;
    el.classList.toggle('paused', it.paused);
    if (it.paused) it.g.innerHTML = frameSVG(c, fk(c.F[c.key]));
    el.addEventListener('click', e => { e.stopPropagation(); it.paused = !it.paused; el.classList.toggle('paused', it.paused); if (!it.paused) it.t0 = performance.now() - (it.pt || 0); });
    if (io) io.observe(el);
    live.add(it);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function loop(now) {
    raf = 0;
    live.forEach(it => {
      if (!it.el.isConnected) { live.delete(it); if (io) io.unobserve(it.el); return; }
      if (it.paused || !it.vis || document.hidden) return;
      const t = (now - it.t0) / 1000; it.pt = now - it.t0;
      const fr = Math.floor(t * 30); if (fr === it.last) return; it.last = fr;
      it.g.innerHTML = frameSVG(it.c, fk(poseAt(it.c, t)));
    });
    if (live.size) raf = requestAnimationFrame(loop);
  }
  function scan(root) {
    (root || document).querySelectorAll('[data-mv]:not([data-mvok])').forEach(mount);
    (root || document).querySelectorAll('[data-mvs]:not([data-mvok])').forEach(el => { el.dataset.mvok = '1'; el.innerHTML = thumb(el.dataset.mvs); });
  }
  let pend = false;
  if ('MutationObserver' in window) new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; scan(document); }); }).observe(document.documentElement, { childList: true, subtree: true });
  return { has, thumb, scan, prep, fk, poseAt, _cache: cache, _frame: frameSVG };
})();
if (typeof module !== 'undefined') module.exports = Moves;
