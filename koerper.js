// ═══════════════════════════════════════════════════════════════════════════
// KÖRPER-ATLAS · interaktive Anatomie, Bestandsaufnahme & Trainingsplan
// Speichert lokal im Browser (localStorage, Schlüssel kp_state_v1)
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const D = window.KPD;
  const KEY = 'kp_state_v1';
  const MIR = 'translate(200,0) scale(-1,1)';
  const NARROW = () => window.matchMedia('(max-width:900px)').matches;

  const ROLE_LBL = {
    sel: 'Ausgewählt', syn: 'Arbeitet mit', ant: 'Gegenspieler', pain: 'typischer Schmerzort',
    tight: 'oft verkürzt / überaktiv', weak: 'oft schwach / gehemmt', inv: 'beteiligt',
    mob: 'Gelenk braucht Mobilität', stab: 'Gelenk braucht Stabilität'
  };
  const ROLE_COL = {
    sel: 'var(--kp-sel)', syn: 'var(--kp-syn)', ant: 'var(--kp-ant)', pain: 'var(--kp-pain)',
    tight: 'var(--kp-tight)', weak: 'var(--kp-weak)', inv: 'var(--kp-inv)', mob: 'var(--kp-mob)', stab: 'var(--kp-stab)'
  };
  const ROLE_ORDER = ['sel', 'pain', 'tight', 'weak', 'syn', 'inv', 'ant', 'mob', 'stab'];
  const EX_ICO = { mob: '🧘', akt: '⚡', kraft: '🏋️' };
  const EX_LBL = { mob: 'Mobilisieren', akt: 'Aktivieren', kraft: 'Kräftigen' };
  const EX_SUB = { mob: 'Beweglichkeit zurückholen', akt: 'Muskeln „aufwecken“, Ansteuerung', kraft: 'Belastbarkeit aufbauen' };
  const SIDE_LBL = { L: 'links', R: 'rechts', B: 'beidseitig' };

  const M_GROUPS = [
    ['Nacken & Schultergürtel', ['scm', 'dnf', 'trap_upper', 'levator', 'trap_low', 'rhomboids', 'serratus', 'pec', 'deltoid', 'cuff']],
    ['Arme', ['biceps', 'triceps', 'forearm']],
    ['Rumpf', ['abs', 'obliques', 'tva', 'diaphragm', 'erector', 'multifidus', 'ql', 'lats']],
    ['Hüfte & Gesäß', ['iliopsoas', 'tfl', 'glute_max', 'glute_med', 'piriformis', 'adductors']],
    ['Beine & Füße', ['quads', 'hamstrings', 'calves', 'tibialis', 'foot_int']]
  ];
  const J_ORDER = ['hws', 'scap', 'shoulder', 'elbow', 'wrist', 'bws', 'lws', 'isg', 'hip', 'knee', 'ankle', 'foot'];
  const J_NEIGH = {
    foot: ['ankle'], ankle: ['foot', 'knee'], knee: ['ankle', 'hip'], hip: ['knee', 'lws'], lws: ['hip', 'bws'],
    isg: ['hip', 'lws'], bws: ['lws', 'hws', 'scap'], scap: ['bws', 'shoulder'], shoulder: ['scap', 'elbow'],
    elbow: ['shoulder', 'wrist'], wrist: ['elbow'], hws: ['bws', 'scap']
  };

  // ── STATE ─────────────────────────────────────────────────────────────────
  const def = () => ({ pains: {}, tests: {}, history: [], done: { d: '', ids: [] }, log: {} });
  let S = load();
  const U = { sub: 'explore', sel: null, topic: null, view: 'both', deep: false, inited: false, pe: null };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) return Object.assign(def(), s); } catch (e) { }
    return def();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = id => document.getElementById(id);
  const info = id => D.M[id] ? Object.assign({ kind: 'm', id }, D.M[id]) : D.J[id] ? Object.assign({ kind: 'j', id }, D.J[id]) : null;
  const nm = id => { const i = info(id); return i ? i.n : id; };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const fmtD = iso => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y.slice(2)}`; };
  const note = (msg, type) => { if (typeof window.toast === 'function') window.toast(msg, type || 'ok'); };
  const ul = (arr, dot) => arr && arr.length ? `<ul class="kp-ul" ${dot ? `style="--kp-dot:${dot}"` : ''}>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  const painCol = l => l >= 7 ? '#f85149' : l >= 4 ? '#e3b341' : '#3fb950';

  function chip(id, role) {
    const i = info(id); if (!i) return '';
    return `<button class="kp-chip${i.deep ? ' deep' : ''}" data-go="s:${id}"${role ? ` data-role="${role}"` : ''}><i></i>${esc(i.n)}</button>`;
  }
  function needRole(id) { const j = D.J[id]; return j ? j.need : null; }

  // ── AUSWERTUNG ────────────────────────────────────────────────────────────
  function profile() {
    const f = {};
    Object.entries(S.tests).forEach(([tid, oi]) => {
      const t = D.T[tid]; if (!t) return;
      const o = t.opts[oi]; if (!o || !o.f) return;
      Object.entries(o.f).forEach(([id, typ]) => {
        f[id] = f[id] || { tight: 0, weak: 0, src: [] };
        f[id][typ] += Math.max(1, o.s);
        if (!f[id].src.includes(t.n)) f[id].src.push(t.n);
      });
    });
    return f;
  }
  function scoreOf(tests) {
    const vals = Object.entries(tests).map(([tid, oi]) => D.T[tid] && D.T[tid].opts[oi] ? D.T[tid].opts[oi].s : null).filter(v => v != null);
    if (!vals.length) return null;
    return Math.round(100 * (1 - vals.reduce((a, b) => a + b, 0) / (2 * vals.length)));
  }
  function topicStatus(tid) {
    const t = D.TOPICS[tid]; if (!t) return null;
    const vals = t.tests.filter(x => S.tests[x] != null).map(x => D.T[x].opts[S.tests[x]].s);
    let lvl = null;
    if (vals.length) { const a = vals.reduce((p, c) => p + c, 0) / vals.length; lvl = a < 0.5 ? 0 : a < 1.2 ? 1 : 2; }
    if (t.grp === 'zone') {
      Object.entries(t.roles).forEach(([id, r]) => {
        const p = S.pains[id]; if (!p || r !== 'pain') return;
        const pl = p.lvl >= 7 ? 2 : p.lvl >= 4 ? 1 : 0;
        lvl = lvl == null ? pl : Math.max(lvl, pl);
      });
    }
    return lvl == null ? null : ['g', 'a', 'r'][lvl];
  }
  function painTopics(id) {
    return Object.entries(D.TOPICS).filter(([k, t]) => t.grp === 'zone' && k !== 'bike' && t.roles[id] === 'pain').map(([k]) => k);
  }

  function buildPlan() {
    const f = profile();
    const items = {};
    const add = (ex, sc, why) => {
      if (!D.E[ex] || sc <= 0) return;
      const it = items[ex] = items[ex] || { sc: 0, why: [] };
      it.sc += sc;
      if (why && !it.why.includes(why)) it.why.push(why);
    };
    Object.entries(f).forEach(([id, v]) => {
      const n = nm(id);
      Object.entries(D.E).forEach(([eid, e]) => {
        if (!e.m.includes(id)) return;
        const prim = e.m[0] === id ? 2 : 1;
        if (v.tight && e.t === 'mob') add(eid, v.tight * prim, `${n} eingeschränkt`);
        if (v.weak && e.t !== 'mob') add(eid, v.weak * prim, `${n} schwach`);
      });
    });
    const focus = {};
    Object.entries(S.pains).forEach(([id, p]) => {
      if (!p.lvl) return;
      painTopics(id).forEach(tid => {
        focus[tid] = Math.max(focus[tid] || 0, p.lvl);
        const ex = D.TOPICS[tid].ex;
        const w = p.lvl / 2.5, why = `Beschwerden: ${D.TOPICS[tid].n}`;
        (ex.mob || []).slice(0, 2).forEach(e => add(e, w, why));
        (ex.akt || []).slice(0, 2).forEach(e => add(e, w, why));
        (ex.kraft || []).slice(0, 1).forEach(e => add(e, w * 0.7, why));
      });
    });
    const hasData = Object.keys(items).length > 0;
    if (!hasData) {
      const ex = D.TOPICS.bike.ex;
      ['mob', 'akt', 'kraft'].forEach(t => (ex[t] || []).forEach((e, i) => add(e, 5 - i, 'Basis-Ausgleich fürs Rennrad')));
    }
    const pick = (t, n) => Object.entries(items).filter(([e]) => D.E[e].t === t).sort((a, b) => b[1].sc - a[1].sc).slice(0, n).map(([e, v]) => ({ id: e, why: v.why.slice(0, 2).join(' · ') }));
    return { mob: pick('mob', 5), akt: pick('akt', 4), kraft: pick('kraft', 5), focus, hasData, f };
  }

  // ── KARTE ─────────────────────────────────────────────────────────────────
  function figure(view, ox) {
    const sA = view === 'front' ? 'R' : 'L', sB = view === 'front' ? 'L' : 'R';
    const open = D.SIL.replace(' L100,217 Z', '');
    let s = `<g transform="translate(${ox},14)">`;
    s += `<text class="vlabel" x="100" y="-2" text-anchor="middle">${view === 'front' ? 'Vorne' : 'Hinten'}</text>`;
    s += `<path class="sil" style="stroke:none" d="${D.SIL}"/><path class="sil" style="stroke:none" d="${D.SIL}" transform="${MIR}"/>`;
    s += `<path class="sil" style="fill:none" d="${open}"/><path class="sil" style="fill:none" d="${open}" transform="${MIR}"/>`;
    const shapes = D.SHAPES[view];
    const draw = (deep) => shapes.filter(x => !!(x[2] && x[2].deep) === deep).forEach(([id, d]) => {
      const c = deep ? 'm deep' : 'm';
      s += `<path class="${c}" data-id="${id}" data-side="${sA}" d="${d}"/>`;
      s += `<path class="${c}" data-id="${id}" data-side="${sB}" d="${d}" transform="${MIR}"/>`;
    });
    draw(false);
    (D.DECO[view] || []).forEach(d => { s += `<path class="deco" d="${d}"/><path class="deco" d="${d}" transform="${MIR}"/>`; });
    draw(true);
    Object.entries(D.JPOS[view]).forEach(([id, [x, y]]) => {
      const pts = x === 100 ? [[x, 'C']] : [[x, sA], [200 - x, sB]];
      pts.forEach(([px, side]) => {
        s += `<circle class="jhit" data-id="${id}" data-side="${side}" cx="${px}" cy="${y}" r="6.5"/>`;
        s += `<circle class="j" data-id="${id}" data-side="${side}" cx="${px}" cy="${y}" r="3.6"/>`;
      });
    });
    s += `<text class="slabel" x="40" y="410" text-anchor="middle">${sA}</text><text class="slabel" x="160" y="410" text-anchor="middle">${sB}</text>`;
    return s + '</g>';
  }
  function drawMap() {
    const svg = el('kp-svg');
    if (U.view === 'both') {
      svg.setAttribute('viewBox', '22 0 366 430');
      svg.innerHTML = figure('front', 0) + figure('back', 210);
    } else {
      svg.setAttribute('viewBox', '22 0 156 430');
      svg.innerHTML = figure(U.view, 0);
    }
    svg.classList.toggle('deepon', U.deep);
    el('kp-view').querySelectorAll('button').forEach(b => b.classList.toggle('act', b.dataset.view === U.view));
    el('kp-layer').querySelectorAll('button').forEach(b => b.classList.toggle('act', (b.dataset.layer === '1') === U.deep));
  }

  function computeHL() {
    const map = {}; let legend = {}; let caption = '';
    const set = (id, role, extra) => { if (!map[id]) map[id] = Object.assign({ role }, extra || {}); };
    if (U.sub === 'explore' && U.sel) {
      const i = info(U.sel);
      if (i) {
        set(U.sel, 'sel');
        if (i.kind === 'm') {
          (i.syn || []).forEach(x => set(x, 'syn'));
          (i.ant || []).forEach(x => set(x, 'ant'));
          (i.j || []).forEach(x => set(x, needRole(x)));
          legend = { sel: 'Ausgewählt', syn: 'Arbeitet mit', ant: 'Gegenspieler', mob: 'Gelenk: Mobilität', stab: 'Gelenk: Stabilität' };
        } else {
          (i.mus || []).forEach(x => set(x, 'inv'));
          (J_NEIGH[U.sel] || []).forEach(x => set(x, needRole(x)));
          legend = { sel: 'Ausgewählt', inv: 'Umliegende Muskeln', mob: 'Nachbar: Mobilität', stab: 'Nachbar: Stabilität' };
        }
        caption = `<b style="color:var(--t1)">${esc(i.n)}</b>${NARROW() ? ' · Details unten ↓' : ''}`;
      }
    } else if (U.sub === 'themes' && U.topic) {
      const t = D.TOPICS[U.topic];
      Object.entries(t.roles).forEach(([id, r]) => set(id, r));
      const used = new Set(Object.values(t.roles));
      ROLE_ORDER.forEach(r => { if (used.has(r)) legend[r] = (t.legend && t.legend[r]) || ROLE_LBL[r]; });
    } else if (U.sub === 'assess' || U.sub === 'plan') {
      Object.entries(S.pains).forEach(([id, p]) => { if (p.lvl > 0) set(id, 'pain', { side: p.side, o: (0.3 + 0.065 * p.lvl).toFixed(2) }); });
      const f = profile();
      Object.entries(f).forEach(([id, v]) => {
        const r = v.tight >= v.weak ? 'tight' : 'weak';
        set(id, r, { o: Math.min(0.85, 0.3 + 0.13 * Math.max(v.tight, v.weak)).toFixed(2) });
      });
      const used = new Set(Object.values(map).map(x => x.role));
      if (used.has('pain')) legend.pain = 'Deine Beschwerden';
      if (used.has('tight')) legend.tight = 'Test: eingeschränkt / verkürzt';
      if (used.has('weak')) legend.weak = 'Test: schwach';
      if (!used.size) caption = U.sub === 'assess' ? '👆 Tippe auf die Stelle, die schmerzt oder sich steif anfühlt' : 'Noch keine Daten – starte die Bestandsaufnahme';
      else if (U.sub === 'assess') caption = 'Tippe auf eine Stelle, um Beschwerden einzutragen';
    }
    if (!Object.keys(map).length && !caption) caption = U.sub === 'themes' ? 'Wähle ein Thema – die Karte zeigt die Zusammenhänge' : 'Tippe auf einen Muskel oder ein Gelenk ●';
    return { map, legend, caption };
  }

  function applyHL() {
    const { map, legend, caption } = computeHL();
    const svg = el('kp-svg');
    svg.classList.toggle('hl', Object.keys(map).length > 0);
    svg.querySelectorAll('[data-id]').forEach(n => {
      const h = map[n.dataset.id];
      let ok = !!h && !!h.role;
      if (ok && h.side && h.side !== 'B' && n.dataset.side !== 'C' && n.dataset.side !== h.side) ok = false;
      if (ok) {
        n.setAttribute('data-role', h.role);
        if (h.o != null) n.style.setProperty('--o', h.o); else n.style.removeProperty('--o');
      } else { n.removeAttribute('data-role'); n.style.removeProperty('--o'); }
    });
    let lg = Object.entries(legend).map(([r, l]) => `<span><i style="background:${ROLE_COL[r]}"></i>${esc(l)}</span>`).join('');
    if (caption) lg = `<span class="kp-hint" style="width:100%">${caption}</span>` + lg;
    el('kp-legend').innerHTML = lg;
  }

  // ── LAYOUT ────────────────────────────────────────────────────────────────
  function build(root) {
    root.innerHTML = `
      <div class="kp-top">
        <div class="kp-sub" id="kp-sub">
          <button data-sub="explore">🗺️ Körperkarte</button>
          <button data-sub="themes">🧩 Themen</button>
          <button data-sub="assess">📋 Bestandsaufnahme</button>
          <button data-sub="plan">🏋️ Mein Plan</button>
        </div>
        <div class="kp-score" id="kp-score"></div>
      </div>
      <div class="kp-grid">
        <div class="card kp-mapcard" id="kp-mapcard">
          <div class="kp-mapbar">
            <div class="kp-seg" id="kp-view"><button data-view="both">Beide</button><button data-view="front">Vorne</button><button data-view="back">Hinten</button></div>
            <div class="kp-seg" id="kp-layer"><button data-layer="0">Oberfläche</button><button data-layer="1">Tief</button></div>
          </div>
          <div class="kp-mapwrap"><div class="kp-hover" id="kp-hover"></div><svg id="kp-svg" class="kp-svg" xmlns="http://www.w3.org/2000/svg"></svg></div>
          <div class="kp-legend" id="kp-legend"></div>
        </div>
        <div class="kp-panel" id="kp-panel"></div>
      </div>
      <div class="kp-ov" id="kp-ov"><div class="mc" id="kp-ovc"></div></div>`;

    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    const svg = el('kp-svg');
    svg.addEventListener('click', e => {
      const n = e.target.closest('[data-id]'); if (!n) return;
      mapTap(n.dataset.id, n.dataset.side);
    });
    svg.addEventListener('pointerover', e => {
      if (e.pointerType !== 'mouse') return;
      const n = e.target.closest('[data-id]'); const h = el('kp-hover');
      if (n) { h.textContent = nm(n.dataset.id); h.classList.add('on'); } else h.classList.remove('on');
    });
    svg.addEventListener('pointerleave', () => el('kp-hover').classList.remove('on'));
    el('kp-ov').addEventListener('click', e => { if (e.target.id === 'kp-ov') closePain(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && U.pe) closePain(); });
  }

  function render(opts) {
    el('kp-sub').querySelectorAll('button').forEach(b => b.classList.toggle('act', b.dataset.sub === U.sub));
    renderScore();
    const p = el('kp-panel');
    p.innerHTML = U.sub === 'explore' ? pExplore() : U.sub === 'themes' ? pThemes() : U.sub === 'assess' ? pAssess() : pPlan();
    applyHL();
    if (opts && opts.top) {
      const target = NARROW() && opts.map ? el('kp-mapcard') : el('tp-koerper');
      const y = target.getBoundingClientRect().top + window.scrollY - 115;
      if (window.scrollY > y + 10 || (NARROW() && opts.map)) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }

  function renderScore() {
    const sc = scoreOf(S.tests);
    const np = Object.values(S.pains).filter(p => p.lvl > 0).length;
    el('kp-score').innerHTML = sc == null
      ? `<span>📋 Bestandsaufnahme starten</span><span style="color:var(--acc)">→</span>`
      : `<span>Körper-Score</span><b style="color:${sc >= 75 ? 'var(--grn)' : sc >= 50 ? 'var(--amb)' : 'var(--red)'}">${sc}</b>${np ? `<span>· ${np} Beschwerde${np > 1 ? 'n' : ''}</span>` : ''}`;
    el('kp-score').dataset.go = sc == null ? 'sub:assess' : 'sub:plan';
  }

  // ── PANEL: KÖRPERKARTE ────────────────────────────────────────────────────
  function pExplore() {
    if (U.sel && info(U.sel)) return info(U.sel).kind === 'm' ? pMuscle(U.sel) : pJoint(U.sel);
    const f = profile();
    const grp = M_GROUPS.map(([g, ids]) => `<div><div class="kp-sec">${g}</div><div class="kp-chips">${ids.map(id => {
      const v = f[id]; const p = S.pains[id];
      return chip(id, p && p.lvl ? 'pain' : v ? (v.tight >= v.weak ? 'tight' : 'weak') : null);
    }).join('')}</div></div>`).join('');
    return `
      <div class="card"><div class="cb">
        <div class="kp-h1">Dein Körper-Atlas</div>
        <p class="kp-p" style="margin-top:0.4rem">Tippe auf einen <b style="color:var(--t1)">Muskel</b> oder ein <b style="color:var(--t1)">Gelenk ●</b>. Du siehst sofort, mit wem er zusammenarbeitet, wer sein Gegenspieler ist und welche Gelenke er beeinflusst. Mit <b style="color:var(--t1)">„Tief“</b> blendest du die stabilisierende Tiefenmuskulatur ein (gestrichelt).</p>
        <div class="kp-chips" style="margin-top:0.8rem">
          <span class="kp-chip" style="cursor:default"><i style="background:var(--kp-sel)"></i>Ausgewählt</span>
          <span class="kp-chip" style="cursor:default"><i style="background:var(--kp-syn)"></i>Arbeitet mit</span>
          <span class="kp-chip" style="cursor:default"><i style="background:var(--kp-ant)"></i>Gegenspieler</span>
        </div>
      </div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico g">💪</div> Muskeln</div><span class="scnt">${Object.keys(D.M).length}</span></div>
        <div class="cb" style="display:flex;flex-direction:column;gap:0.85rem">${grp}</div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico b">⚙️</div> Gelenke</div>
        <span class="kp-hint"><span style="color:var(--kp-mob)">●</span> Mobilität · <span style="color:var(--kp-stab)">●</span> Stabilität</span></div>
        <div class="cb"><div class="kp-chips">${J_ORDER.map(id => chip(id, D.J[id].need)).join('')}</div></div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico a">🧩</div> Direkt zu einem Thema</div></div>
        <div class="cb"><div class="kp-chips">${Object.entries(D.TOPICS).map(([k, t]) => `<button class="kp-chip" data-go="t:${k}">${t.ico} ${esc(t.n)}</button>`).join('')}</div></div></div>
      <div class="kp-disc">Allgemeines Trainingswissen, keine medizinische Diagnose. Bei starken, anhaltenden oder ausstrahlenden Beschwerden ärztlich/physiotherapeutisch abklären.</div>`;
  }

  function statusTags(id) {
    const v = profile()[id]; const p = S.pains[id]; let s = '';
    if (p && p.lvl) s += `<span class="badge bgr">Beschwerde ${p.lvl}/10${p.side && p.side !== 'B' ? ' · ' + SIDE_LBL[p.side] : ''}</span>`;
    if (v && v.tight) s += `<span class="badge bga" title="${esc(v.src.join(', '))}">Bei dir: eingeschränkt</span>`;
    if (v && v.weak) s += `<span class="badge bgb" title="${esc(v.src.join(', '))}">Bei dir: schwach</span>`;
    return s;
  }
  function topicsWith(id) {
    return Object.entries(D.TOPICS).filter(([, t]) => t.roles[id]).map(([k, t]) => `<button class="kp-chip" data-go="t:${k}" data-role="${t.roles[id]}"><i></i>${t.ico} ${esc(t.n)}</button>`).join('');
  }
  function exList(ids, opts) {
    const by = { mob: [], akt: [], kraft: [] };
    (ids || []).forEach(id => { if (D.E[id]) by[D.E[id].t].push(id); });
    return ['mob', 'akt', 'kraft'].filter(t => by[t].length).map(t => `
      <div class="kp-phase"><b>${EX_ICO[t]} ${EX_LBL[t]}</b><span>${EX_SUB[t]}</span></div>
      <div class="kp-exl" style="margin-bottom:0.7rem">${by[t].map(id => exCard(id, opts)).join('')}</div>`).join('');
  }
  function exCard(id, opts) {
    opts = opts || {};
    const e = D.E[id]; if (!e) return '';
    const done = opts.check && S.done.d === today() && S.done.ids.includes(id);
    const card = `<details class="kp-ex${done ? ' done' : ''}" style="flex:1;min-width:0">
      <summary><span class="kp-ex-ico ${e.t}">${EX_ICO[e.t]}</span>
        <span class="kp-ex-n">${esc(e.n)}<small class="kp-ex-dm">${esc(e.dose)}</small>${opts.why ? `<small>${esc(opts.why)}</small>` : ''}</span>
        <span class="kp-ex-d">${esc(e.dose)}</span></summary>
      <div class="kp-ex-b"><ol>${e.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol>
        ${e.err ? `<div class="kp-ex-err">⚠️ ${esc(e.err)}</div>` : ''}
        <div class="kp-sec">Wirkt auf</div><div class="kp-chips">${e.m.map(m => chip(m, D.J[m] ? D.J[m].need : null)).join('')}</div></div></details>`;
    if (!opts.check) return card;
    return `<div style="display:flex;gap:0.5rem;align-items:flex-start"><label style="padding-top:0.7rem;cursor:pointer"><input type="checkbox" data-done="${id}" ${done ? 'checked' : ''}></label>${card}</div>`;
  }
  function testChips(ids) {
    return (ids || []).map(t => {
      const r = S.tests[t]; const s = r != null ? D.T[t].opts[r].s : null;
      const col = s == null ? '' : ['var(--grn)', 'var(--amb)', 'var(--red)'][s];
      return `<button class="kp-chip" data-go="test:${t}"><i style="${col ? 'background:' + col : ''}"></i>🧪 ${esc(D.T[t].n)}</button>`;
    }).join('');
  }

  function pMuscle(id) {
    const i = info(id);
    const tp = topicsWith(id);
    return `
      <div class="card"><div class="cb">
        <button class="kp-link" data-go="home" style="font-size:0.72rem;margin-bottom:0.6rem">← Übersicht</button>
        <div class="kp-h1">${esc(i.n)}</div><div class="kp-lat">${esc(i.lat)}</div>
        <div class="kp-tags"><span class="badge bgb">${esc(i.r)}</span>${i.deep ? '<span class="badge bgp">Tiefe Schicht</span>' : ''}${statusTags(id)}</div>
        <div style="margin-top:0.9rem"><div class="kp-sec">Was er macht</div>${ul(i.fn, 'var(--kp-sel)')}</div>
      </div></div>
      ${i.tight.length || i.weak.length ? `<div class="kp-two">
        ${i.tight.length ? `<div class="kp-box tight"><div class="kp-sec" style="color:var(--amb)">Wenn verkürzt / überaktiv</div>${ul(i.tight, 'var(--amb)')}</div>` : ''}
        ${i.weak.length ? `<div class="kp-box weak"><div class="kp-sec" style="color:var(--blu)">Wenn schwach / gehemmt</div>${ul(i.weak, 'var(--blu)')}</div>` : ''}
      </div>` : ''}
      <div class="card"><div class="ch"><div class="ct"><div class="cico b">🔗</div> Wechselwirkungen</div></div><div class="cb" style="display:flex;flex-direction:column;gap:0.8rem">
        ${i.syn.length ? `<div><div class="kp-sec">Arbeitet mit (Synergisten)</div><div class="kp-chips">${i.syn.map(x => chip(x, 'syn')).join('')}</div></div>` : ''}
        ${i.ant.length ? `<div><div class="kp-sec">Gegenspieler (Antagonisten)</div><div class="kp-chips">${i.ant.map(x => chip(x, 'ant')).join('')}</div>
          <p class="kp-p" style="font-size:0.72rem;margin-top:0.4rem">Ist ein Muskel dauerhaft verkürzt, wird sein Gegenspieler reflektorisch gehemmt – deshalb immer beide Seiten trainieren.</p></div>` : ''}
        ${i.j.length ? `<div><div class="kp-sec">Bewegt / beeinflusst</div><div class="kp-chips">${i.j.map(x => chip(x, needRole(x))).join('')}</div></div>` : ''}
        ${tp ? `<div><div class="kp-sec">Spielt eine Rolle bei</div><div class="kp-chips">${tp}</div></div>` : ''}
      </div></div>
      ${i.pain.length ? `<div class="kp-box"><div class="kp-sec">Typische Beschwerden</div>${ul(i.pain, 'var(--red)')}</div>` : ''}
      ${i.bike ? `<div class="kp-box bike"><div class="kp-sec" style="color:var(--acc)">🚴 Rennrad-Bezug</div><p class="kp-p" style="color:var(--t1)">${esc(i.bike)}</p></div>` : ''}
      ${i.tests.length ? `<div class="card"><div class="ch"><div class="ct"><div class="cico a">🧪</div> Selbsttest</div></div><div class="cb"><div class="kp-chips">${testChips(i.tests)}</div></div></div>` : ''}
      ${i.ex.length ? `<div class="card"><div class="ch"><div class="ct"><div class="cico g">🏋️</div> Übungen</div></div><div class="cb">${exList(i.ex)}</div></div>` : ''}`;
  }

  function pJoint(id) {
    const i = info(id);
    const nb = J_NEIGH[id] || [];
    const mobN = nb.filter(x => D.J[x].need === 'mob').map(nm);
    const hint = i.need === 'stab'
      ? (mobN.length ? `Schmerzt es hier, prüfe auch die beweglichen Nachbarn: <b style="color:var(--t1)">${esc(mobN.join(' & '))}</b>. Fehlt dort Bewegung, holt sie sich der Körper hier.` : '')
      : `Wird dieses Gelenk steif, müssen die stabilen Nachbarn (<b style="color:var(--t1)">${esc(nb.filter(x => D.J[x].need === 'stab').map(nm).join(' & ') || '–')}</b>) Bewegung liefern, für die sie nicht gebaut sind.`;
    return `
      <div class="card"><div class="cb">
        <button class="kp-link" data-go="home" style="font-size:0.72rem;margin-bottom:0.6rem">← Übersicht</button>
        <div class="kp-h1">${esc(i.n)}</div><div class="kp-lat">${esc(i.lat)}</div>
        <div class="kp-tags">${i.need === 'mob' ? '<span class="badge bgg">braucht Mobilität</span>' : '<span class="badge bgb">braucht Stabilität</span>'}${statusTags(id)}</div>
        <p class="kp-p" style="margin-top:0.7rem">${esc(i.needTxt)}</p>
        <div style="margin-top:0.8rem"><div class="kp-sec">Bewegungen</div>${ul(i.moves, 'var(--kp-sel)')}</div>
      </div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico b">🔗</div> Wechselwirkungen</div></div><div class="cb" style="display:flex;flex-direction:column;gap:0.8rem">
        <div><div class="kp-sec">Umliegende Muskeln</div><div class="kp-chips">${i.mus.map(x => chip(x, 'inv')).join('')}</div></div>
        <div><div class="kp-sec">Nachbargelenke (Joint-by-Joint)</div><div class="kp-chips">${nb.map(x => chip(x, needRole(x))).join('')}</div>
          ${hint ? `<p class="kp-p" style="font-size:0.75rem;margin-top:0.5rem">${hint}</p>` : ''}</div>
        ${topicsWith(id) ? `<div><div class="kp-sec">Spielt eine Rolle bei</div><div class="kp-chips">${topicsWith(id)}</div></div>` : ''}
      </div></div>
      <div class="kp-box tight"><div class="kp-sec" style="color:var(--amb)">Wenn hier etwas fehlt → Kompensation</div>${ul(i.comp, 'var(--amb)')}</div>
      ${i.pain.length ? `<div class="kp-box"><div class="kp-sec">Typische Beschwerden</div>${ul(i.pain, 'var(--red)')}</div>` : ''}
      ${i.bike ? `<div class="kp-box bike"><div class="kp-sec" style="color:var(--acc)">🚴 Rennrad-Bezug</div><p class="kp-p" style="color:var(--t1)">${esc(i.bike)}</p></div>` : ''}
      ${i.tests.length ? `<div class="card"><div class="ch"><div class="ct"><div class="cico a">🧪</div> Selbsttest</div></div><div class="cb"><div class="kp-chips">${testChips(i.tests)}</div></div></div>` : ''}
      ${i.ex.length ? `<div class="card"><div class="ch"><div class="ct"><div class="cico g">🏋️</div> Übungen</div></div><div class="cb">${exList(i.ex)}</div></div>` : ''}`;
  }

  // ── PANEL: THEMEN ─────────────────────────────────────────────────────────
  function pThemes() {
    if (U.topic && D.TOPICS[U.topic]) return pTopic(U.topic);
    const card = ([k, t]) => {
      const st = topicStatus(k);
      return `<button class="kp-tc" data-go="t:${k}"><div class="kp-tc-h"><span class="kp-tc-n">${t.ico} ${esc(t.n)}</span>${st ? `<span class="kp-amp ${st}" title="Dein Status"></span>` : ''}</div><span class="kp-tc-s">${esc(t.sum)}</span></button>`;
    };
    const all = Object.entries(D.TOPICS);
    return `
      <div class="card"><div class="ch"><div class="ct"><div class="cico a">🔻</div> Problemzonen</div><span class="kp-hint">Punkt = dein Status</span></div>
        <div class="cb"><div class="kp-tgrid">${all.filter(([, t]) => t.grp === 'zone').map(card).join('')}</div></div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico p">🧠</div> Zusammenhänge verstehen</div></div>
        <div class="cb"><div class="kp-tgrid">${all.filter(([, t]) => t.grp === 'concept').map(card).join('')}</div></div></div>`;
  }

  function pTopic(k) {
    const t = D.TOPICS[k];
    const st = topicStatus(k);
    const byRole = {};
    Object.entries(t.roles).forEach(([id, r]) => { (byRole[r] = byRole[r] || []).push(id); });
    const roles = ROLE_ORDER.filter(r => byRole[r]).map(r => `<div><div class="kp-sec">${esc((t.legend && t.legend[r]) || ROLE_LBL[r])}</div><div class="kp-chips">${byRole[r].map(id => chip(id, r)).join('')}</div></div>`).join('');
    const done = t.tests.filter(x => S.tests[x] != null).length;
    const stTxt = st ? { g: ['bgg', 'Gut aufgestellt'], a: ['bga', 'Ausbaufähig'], r: ['bgr', 'Defizit / Beschwerden'] }[st] : null;
    const allEx = [].concat(t.ex.mob || [], t.ex.akt || [], t.ex.kraft || []);
    return `
      <div class="card"><div class="cb">
        <button class="kp-link" data-go="home" style="font-size:0.72rem;margin-bottom:0.6rem">← Alle Themen</button>
        <div class="kp-h1">${t.ico} ${esc(t.n)}</div>
        <div class="kp-tags">${stTxt ? `<span class="badge ${stTxt[0]}">Dein Status: ${stTxt[1]}</span>` : ''}<span class="badge bgb">${done}/${t.tests.length} Tests gemacht</span></div>
        <p class="kp-p" style="margin-top:0.7rem">${esc(t.sum)}</p>
      </div></div>
      <div class="kp-box ins">💡 ${esc(t.insight)}</div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico b">🔗</div> Wie hängt das zusammen?</div></div><div class="cb">
        <div class="kp-flow">${t.chain.map((c, n) => `${n ? '<div class="kp-arrow">↓</div>' : ''}<div class="kp-step"><b>${n + 1}</b><span>${esc(c)}</span></div>`).join('')}</div>
        ${t.examples ? `<div style="margin-top:0.9rem"><div class="kp-sec">Schnell-Check</div>${t.examples.map(([a, b]) => `<div class="kp-step" style="margin-bottom:0.35rem;border-color:var(--bd)"><span style="flex:1"><b style="all:unset;font-weight:700">${esc(a)}</b> → ${esc(b)}</span></div>`).join('')}</div>` : ''}
      </div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico g">🧬</div> Beteiligte Strukturen</div><span class="kp-hint">antippen für Details</span></div>
        <div class="cb" style="display:flex;flex-direction:column;gap:0.8rem">${roles}</div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico a">🧪</div> Selbsttests</div>
        <button class="kp-link" data-go="sub:assess" style="font-size:0.72rem">Zur Bestandsaufnahme →</button></div>
        <div class="cb"><div class="kp-chips">${testChips(t.tests)}</div></div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico g">🏋️</div> Übungsprogramm</div></div><div class="cb">${exList(allEx)}</div></div>
      ${t.red && t.red.length ? `<div class="kp-box red"><div class="kp-sec" style="color:var(--red)">🚩 Wann zum Arzt?</div>${ul(t.red, 'var(--red)')}</div>` : ''}`;
  }

  // ── PANEL: BESTANDSAUFNAHME ───────────────────────────────────────────────
  function lastSnap() {
    const h = S.history.filter(x => x.d !== today());
    return h.length ? h[h.length - 1] : null;
  }
  function pAssess() {
    const nT = Object.keys(D.T).length;
    const done = Object.keys(S.tests).filter(k => D.T[k]).length;
    const pains = Object.entries(S.pains).filter(([, p]) => p.lvl > 0).sort((a, b) => b[1].lvl - a[1].lvl);
    const prev = lastSnap();
    const groups = D.TEST_GROUPS.map(g => {
      const tests = Object.entries(D.T).filter(([, t]) => t.g === g);
      return `<div><div class="kp-sec" style="margin-top:0.3rem">${g}</div><div class="kp-exl">${tests.map(([k, t]) => testCard(k, t, prev)).join('')}</div></div>`;
    }).join('');
    const hist = S.history.slice().reverse();
    return `
      <div class="card"><div class="cb">
        <div class="kp-h1">Bestandsaufnahme</div>
        <p class="kp-p" style="margin-top:0.4rem">In 2 Schritten zu deinem Profil: <b style="color:var(--t1)">① Beschwerden</b> auf der Karte markieren, <b style="color:var(--t1)">② Selbsttests</b> machen. Daraus entsteht dein Plan. Wiederhole die Tests alle 4–6 Wochen und speichere einen Stand, um Fortschritte zu sehen.</p>
        <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--t2);margin-top:0.8rem"><span>${done}/${nT} Tests · ${pains.length} Beschwerden</span><span>${scoreOf(S.tests) != null ? 'Score ' + scoreOf(S.tests) : ''}</span></div>
        <div class="kp-prog"><div style="width:${Math.round(100 * done / nT)}%"></div></div>
        <div style="display:flex;gap:0.5rem;margin-top:0.9rem;flex-wrap:wrap">
          <button class="btn bp" data-act="snap" style="flex:1">💾 Stand speichern</button>
          <button class="btn bg2" data-go="sub:plan">Zum Plan →</button>
        </div>
      </div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico" style="background:var(--redbg)">📍</div> ① Beschwerden</div><span class="scnt">${pains.length}</span></div>
        <div class="cb">
          <p class="kp-p" style="font-size:0.75rem;margin-bottom:0.7rem">Tippe auf der Karte auf die Stelle (Muskel oder Gelenk ●). Die Seite (L/R) wird automatisch erkannt. Für tiefe Muskeln oben auf „Tief“ schalten.</p>
          <div class="kp-exl">${pains.length ? pains.map(([id, p]) => `
            <div class="kp-pain" data-act="pain:${id}">
              <div class="kp-pain-lvl" style="background:${painCol(p.lvl)}">${p.lvl}</div>
              <div class="kp-pain-b"><div class="kp-pain-n">${esc(nm(id))} <span style="color:var(--t3);font-weight:400">· ${SIDE_LBL[p.side] || ''}</span></div>
              <div class="kp-pain-m">${esc([p.type].concat(p.when || []).filter(Boolean).join(' · '))}${p.note ? ' — ' + esc(p.note) : ''}</div></div>
              <span style="color:var(--t3)">›</span></div>`).join('') : '<div class="kp-empty" style="padding:0.8rem"><div class="e">👆</div>Noch nichts markiert – super, oder einfach auf die Karte tippen.</div>'}
          </div>
          ${pains.length ? `<div style="margin-top:0.7rem"><div class="kp-sec">Passende Themen</div><div class="kp-chips">${[...new Set(pains.flatMap(([id]) => painTopics(id)))].map(k => `<button class="kp-chip" data-go="t:${k}">${D.TOPICS[k].ico} ${esc(D.TOPICS[k].n)}</button>`).join('') || '<span class="kp-hint">–</span>'}</div></div>` : ''}
        </div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico a">🧪</div> ② Selbsttests</div><span class="scnt">${done}/${nT}</span></div>
        <div class="cb" style="display:flex;flex-direction:column;gap:0.6rem">
          <p class="kp-p" style="font-size:0.75rem">Aufwärmen, langsam testen, nichts erzwingen. Bei Schmerz abbrechen und „Defizit“ wählen. Ergebnisse speichern automatisch.</p>
          ${groups}
          ${done ? '<button class="kp-link" data-act="reset-tests" style="font-size:0.72rem;align-self:flex-start;color:var(--t3);margin-top:0.3rem">Alle Testergebnisse zurücksetzen</button>' : ''}
        </div></div>
      <div class="card"><div class="ch"><div class="ct"><div class="cico b">📈</div> Verlauf</div><span class="scnt">${S.history.length}</span></div>
        <div class="cb">${hist.length ? `
          <div class="kp-hist">${S.history.slice(-12).map(h => `<div style="height:${Math.max(4, h.score || 0)}%" title="${fmtD(h.d)}: ${h.score ?? '–'}"></div>`).join('')}</div>
          <div class="kp-exl" style="margin-top:0.8rem">${hist.map((h, n) => {
            const older = hist[n + 1]; const dlt = older && h.score != null && older.score != null ? h.score - older.score : null;
            const np = Object.values(h.pains || {}).filter(p => p.lvl > 0).length;
            return `<div class="kp-pain" style="cursor:default"><div class="kp-pain-lvl" style="background:var(--s3);color:var(--t1);width:auto;padding:0 0.45rem">${h.score ?? '–'}</div>
              <div class="kp-pain-b"><div class="kp-pain-n">${fmtD(h.d)}${dlt != null ? ` <span style="color:${dlt >= 0 ? 'var(--grn)' : 'var(--red)'};font-size:0.72rem">${dlt >= 0 ? '▲ +' : '▼ '}${dlt}</span>` : ''}</div>
              <div class="kp-pain-m">${Object.keys(h.tests || {}).length} Tests · ${np} Beschwerden</div></div>
              <button class="bicon" data-act="delsnap:${h.ts}" title="Löschen">✕</button></div>`;
          }).join('')}</div>` : '<div class="kp-empty" style="padding:0.8rem">Noch kein Stand gespeichert. Nach den Tests oben auf „Stand speichern“ tippen.</div>'}
        </div></div>`;
  }

  function testCard(k, t, prev) {
    const cur = S.tests[k];
    const s = cur != null && t.opts[cur] ? t.opts[cur].s : null;
    const dot = s == null ? 'var(--s3)' : ['var(--grn)', 'var(--amb)', 'var(--red)'][s];
    const pv = prev && prev.tests && prev.tests[k] != null && t.opts[prev.tests[k]] ? t.opts[prev.tests[k]] : null;
    return `<details class="kp-test" id="kp-t-${k}">
      <summary><span class="kp-amp" data-dot="${k}" style="background:${dot}"></span>
        <span class="kp-test-n">${esc(t.n)}<small>${esc(t.what)}</small></span><span style="color:var(--t3);font-size:0.8rem">▾</span></summary>
      <div class="kp-test-b">
        <ol>${t.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol>
        <div class="kp-sec">Dein Ergebnis</div>
        <div class="kp-opts">${t.opts.map((o, n) => `<button class="kp-opt s${o.s}${cur === n ? ' act' : ''}" data-opt="${k}:${n}"><i></i><span>${esc(o.l)}</span></button>`).join('')}</div>
        ${pv ? `<div class="kp-prev">Letztes Mal (${fmtD(prev.d)}): ${esc(pv.l)}</div>` : ''}
        <div style="margin-top:0.6rem"><div class="kp-sec">Betrifft</div><div class="kp-chips">${t.m.map(m => chip(m)).join('')}</div></div>
      </div></details>`;
  }

  // ── PANEL: PLAN ───────────────────────────────────────────────────────────
  function pPlan() {
    const P = buildPlan();
    const sc = scoreOf(S.tests);
    const nT = Object.keys(D.T).length, done = Object.keys(S.tests).filter(k => D.T[k]).length;
    const def = Object.entries(P.f).map(([id, v]) => ({ id, v, tot: v.tight + v.weak })).sort((a, b) => b.tot - a.tot).slice(0, 8);
    const maxT = def.length ? def[0].tot : 1;
    const zones = Object.entries(D.TOPICS).filter(([, t]) => t.grp === 'zone').map(([k, t]) => ({ k, t, st: topicStatus(k) })).filter(x => x.st);
    const isToday = S.done.d === today();
    const doneN = isToday ? S.done.ids.length : 0;
    const totalN = P.mob.length + P.akt.length + P.kraft.length;
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      week.push(`<span><i class="${S.log[iso] ? 'on' : ''}"></i>${['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]}</span>`);
    }
    const phase = (t, list) => list.length ? `<div class="kp-phase" style="margin-top:0.4rem"><b>${EX_ICO[t]} ${EX_LBL[t]}</b><span>${EX_SUB[t]}</span></div>
      <div class="kp-exl" style="margin-bottom:0.6rem">${list.map(x => exCard(x.id, { check: true, why: x.why })).join('')}</div>` : '';
    return `
      ${!P.hasData ? `<div class="card"><div class="cb"><div class="kp-empty"><div class="e">📋</div>
        <b style="color:var(--t1)">Noch keine Bestandsaufnahme.</b><br>Unten siehst du ein Basis-Ausgleichsprogramm fürs Rennrad.<br>Für einen persönlichen Plan: Beschwerden markieren und Selbsttests machen.<br><br>
        <button class="btn bp" data-go="sub:assess">Bestandsaufnahme starten</button></div></div></div>` : `
      <div class="card"><div class="cb">
        <div style="display:flex;align-items:center;gap:1rem">
          <div style="text-align:center;min-width:72px"><div style="font-size:2.2rem;font-weight:800;font-family:'JetBrains Mono',monospace;line-height:1;color:${sc == null ? 'var(--t3)' : sc >= 75 ? 'var(--grn)' : sc >= 50 ? 'var(--amb)' : 'var(--red)'}">${sc ?? '–'}</div><div class="kp-hint">Körper-Score</div></div>
          <div style="flex:1;min-width:0"><div class="kp-h1" style="font-size:1rem">Dein Profil</div>
            <p class="kp-p" style="font-size:0.74rem">${done}/${nT} Tests · ${Object.values(S.pains).filter(p => p.lvl > 0).length} Beschwerden${done < nT ? ` · <button class="kp-link" data-go="sub:assess">weitere Tests machen</button>` : ''}</p></div>
        </div>
        ${zones.length ? `<div style="margin-top:0.9rem"><div class="kp-sec">Regionen</div><div class="kp-chips">${zones.map(z => `<button class="kp-chip" data-go="t:${z.k}"><span class="kp-amp ${z.st}"></span>${z.t.ico} ${esc(z.t.n)}</button>`).join('')}</div></div>` : ''}
      </div></div>
      ${def.length ? `<div class="card"><div class="ch"><div class="ct"><div class="cico a">🎯</div> Deine Baustellen</div><span class="kp-hint"><span style="color:var(--amb)">■</span> eingeschränkt <span style="color:var(--blu)">■</span> schwach</span></div><div class="cb">
        ${def.map(x => {
          const tight = x.v.tight >= x.v.weak;
          return `<div class="kp-bar" data-go="s:${x.id}"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nm(x.id))} <span class="kp-hint">· ${tight ? 'eingeschränkt' : 'schwach'}</span></span>
            <div class="kp-bar-t"><div style="width:${Math.round(100 * x.tot / maxT)}%;background:${tight ? 'var(--amb)' : 'var(--blu)'}"></div></div><em>${x.tot}</em></div>`;
        }).join('')}
      </div></div>` : ''}`}
      <div class="card"><div class="ch"><div class="ct"><div class="cico g">🏋️</div> ${P.hasData ? 'Dein Programm' : 'Basis-Programm Rennrad'}</div><span class="scnt">${doneN}/${totalN} heute</span></div>
        <div class="cb">
          <div class="kp-box" style="margin-bottom:0.9rem;font-size:0.75rem;color:var(--t2);line-height:1.6">
            <b style="color:var(--t1)">So setzt du es um:</b><br>
            🧘 + ⚡ <b style="color:var(--t1)">täglich ~10–15 min</b> (z. B. morgens oder nach dem Radfahren)<br>
            🏋️ <b style="color:var(--t1)">2–3× pro Woche</b>, vorher kurz mobilisieren & aktivieren<br>
            Reihenfolge: erst beweglich machen → dann ansteuern → dann belasten.
          </div>
          ${phase('mob', P.mob)}${phase('akt', P.akt)}${phase('kraft', P.kraft)}
          <div class="kp-sec" style="margin-top:0.6rem">Letzte 7 Tage</div><div class="kp-week">${week.join('')}</div>
        </div></div>
      <div class="kp-disc">Der Plan wird automatisch aus deinen Testergebnissen und Beschwerden erstellt. Schmerz während einer Übung max. 3/10 und am Folgetag nicht schlimmer – sonst Umfang reduzieren.</div>`;
  }

  // ── SCHMERZ-EDITOR ────────────────────────────────────────────────────────
  function openPain(id, side) {
    const ex = S.pains[id];
    const tapSide = side === 'C' ? 'B' : side;
    const p = ex ? Object.assign({}, ex, { when: (ex.when || []).slice() }) : { lvl: 5, type: D.PAIN_TYPES[0], side: tapSide || 'B', when: [], note: '' };
    if (ex && tapSide && ex.side !== 'B' && ex.side !== tapSide) p.side = 'B';
    U.pe = { id, p, isNew: !ex };
    const i = info(id);
    el('kp-ovc').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.9rem">
        <div><h2 style="font-size:1.05rem">${esc(i.n)}</h2><div class="kp-lat">${esc(i.lat)}</div></div>
        <button class="bicon" data-act="pclose">✕</button></div>
      <label class="fl">Intensität</label>
      <div class="kp-range"><input type="range" min="0" max="10" step="1" value="${p.lvl}" id="kp-plvl"><b id="kp-plvlv" style="color:${painCol(p.lvl)}">${p.lvl}</b></div>
      <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:var(--t3);margin-top:0.2rem"><span>kaum</span><span>stark</span></div>
      <label class="fl">Art</label><div class="kp-pick" data-pp="type">${D.PAIN_TYPES.map(t => `<button data-pv="${esc(t)}" class="${p.type === t ? 'act' : ''}">${esc(t)}</button>`).join('')}</div>
      <label class="fl">Seite</label><div class="kp-pick" data-pp="side">${['L', 'R', 'B'].map(s => `<button data-pv="${s}" class="${p.side === s ? 'act' : ''}">${SIDE_LBL[s]}</button>`).join('')}</div>
      <label class="fl">Wann? (mehrere möglich)</label><div class="kp-pick" data-pp="when">${D.PAIN_WHEN.map(t => `<button data-pv="${esc(t)}" class="${p.when.includes(t) ? 'act' : ''}">${esc(t)}</button>`).join('')}</div>
      <label class="fl">Notiz</label><textarea id="kp-pnote" rows="2" placeholder="z. B. seit 2 Wochen, nach langer Ausfahrt schlimmer">${esc(p.note)}</textarea>
      <div class="kp-warn" id="kp-pwarn">🚩 Kribbeln/Taubheit oder nächtliche Schmerzen können auf eine Nervenbeteiligung oder andere Ursachen hinweisen. Bitte ärztlich abklären lassen, besonders wenn es zunimmt oder mit Kraftverlust einhergeht.</div>
      <div style="display:flex;gap:0.5rem;margin-top:1.1rem">
        <button class="btn bp" style="flex:1" data-act="psave">Speichern</button>
        ${ex ? '<button class="btn bg2" data-act="pdel" style="color:var(--red)">Entfernen</button>' : ''}
      </div>
      <button class="kp-link" data-act="pinfo" style="font-size:0.74rem;margin-top:0.9rem">ℹ️ Was macht ${esc(i.n)}? Zusammenhänge ansehen →</button>`;
    painWarn();
    el('kp-ov').classList.add('on');
  }
  function painWarn() {
    const p = U.pe.p;
    el('kp-pwarn').classList.toggle('on', p.type === 'Kribbeln / Taubheit' || p.when.includes('nachts'));
  }
  function closePain() { el('kp-ov').classList.remove('on'); U.pe = null; }

  // ── EVENTS ────────────────────────────────────────────────────────────────
  function go(t) {
    const [k, v] = t.split(':');
    if (k === 's') { U.sel = v; U.sub = 'explore'; autoView(v); render({ top: true, map: true }); }
    else if (k === 't') { U.topic = v; U.sub = 'themes'; render({ top: true, map: true }); }
    else if (k === 'sub') { U.sub = v; render({ top: true }); }
    else if (k === 'home') { if (U.sub === 'explore') U.sel = null; else U.topic = null; render({ top: true }); }
    else if (k === 'test') {
      U.sub = 'assess'; render();
      const d = el('kp-t-' + v);
      if (d) { d.open = true; d.classList.add('flash'); setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); setTimeout(() => d.classList.remove('flash'), 1500); }
    }
  }
  function autoView(id) {
    const i = info(id); if (!i) return;
    if (i.deep && !U.deep) { U.deep = true; drawMap(); }
    if (U.view !== 'both' && i.v && !i.v.includes(U.view)) { U.view = i.v[0]; drawMap(); }
  }
  function mapTap(id, side) {
    if (U.sub === 'assess') { openPain(id, side); return; }
    U.sel = id; U.sub = 'explore'; render({ top: !NARROW() });
  }

  function onInput(e) {
    if (e.target.id === 'kp-plvl' && U.pe) {
      U.pe.p.lvl = +e.target.value;
      const b = el('kp-plvlv'); b.textContent = e.target.value; b.style.color = painCol(+e.target.value);
    }
  }

  function onClick(e) {
    const t = e.target;
    const dn = t.closest('[data-done]');
    if (dn) {
      const id = dn.dataset.done, d = today();
      if (S.done.d !== d) S.done = { d, ids: [] };
      if (dn.checked) { if (!S.done.ids.includes(id)) S.done.ids.push(id); } else S.done.ids = S.done.ids.filter(x => x !== id);
      S.log[d] = S.done.ids.length; if (!S.log[d]) delete S.log[d];
      save();
      const det = dn.closest('div').querySelector('.kp-ex'); if (det) det.classList.toggle('done', dn.checked);
      const cnt = el('kp-panel').querySelector('.scnt'); const P = buildPlan();
      if (cnt) cnt.textContent = `${S.done.ids.length}/${P.mob.length + P.akt.length + P.kraft.length} heute`;
      const wk = el('kp-panel').querySelector('.kp-week span:last-child i'); if (wk) wk.classList.toggle('on', S.done.ids.length > 0);
      return;
    }
    const g = t.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const sb = t.closest('[data-sub]'); if (sb) { U.sub = sb.dataset.sub; render(); return; }
    const vw = t.closest('[data-view]'); if (vw) { U.view = vw.dataset.view; drawMap(); applyHL(); return; }
    const ly = t.closest('[data-layer]'); if (ly) { U.deep = ly.dataset.layer === '1'; drawMap(); applyHL(); return; }
    const op = t.closest('[data-opt]');
    if (op) {
      const [k, n] = op.dataset.opt.split(':');
      if (S.tests[k] === +n) delete S.tests[k]; else S.tests[k] = +n;
      save();
      op.parentElement.querySelectorAll('.kp-opt').forEach((b, i) => b.classList.toggle('act', S.tests[k] === i));
      const dot = el('kp-panel').querySelector(`[data-dot="${k}"]`);
      if (dot) dot.style.background = S.tests[k] == null ? 'var(--s3)' : ['var(--grn)', 'var(--amb)', 'var(--red)'][D.T[k].opts[S.tests[k]].s];
      const nT = Object.keys(D.T).length, done = Object.keys(S.tests).filter(x => D.T[x]).length;
      const pg = el('kp-panel').querySelector('.kp-prog div'); if (pg) pg.style.width = Math.round(100 * done / nT) + '%';
      renderScore(); applyHL();
      return;
    }
    const pp = t.closest('[data-pv]');
    if (pp && U.pe) {
      const kind = pp.parentElement.dataset.pp, v = pp.dataset.pv, p = U.pe.p;
      if (kind === 'when') { p.when = p.when.includes(v) ? p.when.filter(x => x !== v) : p.when.concat(v); pp.classList.toggle('act'); }
      else { p[kind] = v; pp.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('act', b === pp)); }
      painWarn();
      return;
    }
    const a = t.closest('[data-act]'); if (!a) return;
    const [act, arg] = a.dataset.act.split(':');
    if (act === 'pain') { openPain(arg); }
    else if (act === 'pclose') closePain();
    else if (act === 'psave') {
      const { id, p } = U.pe;
      p.note = el('kp-pnote').value.trim();
      if (p.lvl > 0) { S.pains[id] = Object.assign({}, p, { d: today() }); note('Beschwerde gespeichert'); }
      else { delete S.pains[id]; note('Ohne Intensität – entfernt', 'inf'); }
      save(); closePain(); render();
    }
    else if (act === 'pdel') { delete S.pains[U.pe.id]; save(); closePain(); render(); note('Beschwerde entfernt', 'inf'); }
    else if (act === 'pinfo') { const id = U.pe.id; closePain(); go('s:' + id); }
    else if (act === 'snap') {
      if (!Object.keys(S.tests).length && !Object.keys(S.pains).length) { note('Erst Tests machen oder Beschwerden markieren', 'inf'); return; }
      const snap = { d: today(), ts: Date.now(), tests: Object.assign({}, S.tests), pains: JSON.parse(JSON.stringify(S.pains)), score: scoreOf(S.tests) };
      if (S.history.length && S.history[S.history.length - 1].d === snap.d) S.history[S.history.length - 1] = snap; else S.history.push(snap);
      save(); render(); note('Stand gespeichert');
    }
    else if (act === 'delsnap') {
      if (!confirm('Diesen Stand löschen?')) return;
      S.history = S.history.filter(h => String(h.ts) !== arg); save(); render();
    }
    else if (act === 'reset-tests') {
      if (!confirm('Alle aktuellen Testergebnisse zurücksetzen? Gespeicherte Stände bleiben erhalten.')) return;
      S.tests = {}; save(); render();
    }
  }

  // ── PUBLIC ────────────────────────────────────────────────────────────────
  window.KP = {
    init() {
      const root = el('tp-koerper'); if (!root || !D) return;
      if (!U.inited) { build(root); drawMap(); U.inited = true; }
      render();
    },
    data: () => JSON.parse(JSON.stringify(S))
  };
})();
