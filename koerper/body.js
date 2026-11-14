'use strict';
/* ═══ KÖRPER: Karte · Themen · Check (Beschwerden, Selbsttests, Verlauf) ═══ */

const ROLE_LBL = {
  sel: 'Ausgewählt', syn: 'Arbeitet mit', ant: 'Gegenspieler', pain: 'typischer Schmerzort', tight: 'oft verkürzt / überaktiv',
  weak: 'oft schwach / gehemmt', inv: 'beteiligt', mob: 'Gelenk braucht Mobilität', stab: 'Gelenk braucht Stabilität'
};
const ROLE_ORDER = ['sel', 'pain', 'tight', 'weak', 'syn', 'inv', 'ant', 'mob', 'stab'];
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
  foot: ['ankle'], ankle: ['foot', 'knee'], knee: ['ankle', 'hip'], hip: ['knee', 'lws'], lws: ['hip', 'bws'], isg: ['hip', 'lws'],
  bws: ['lws', 'hws', 'scap'], scap: ['bws', 'shoulder'], shoulder: ['scap', 'elbow'], elbow: ['shoulder', 'wrist'], wrist: ['elbow'], hws: ['bws', 'scap']
};
const needRole = id => D.J[id] ? D.J[id].need : null;

// Eigener Status als Hervorhebung: Beschwerden + Testergebnisse
function statusHL() {
  const hl = {};
  activePains().forEach(([id, p]) => { hl[id] = { role: 'pain', side: p.side, o: (0.35 + 0.06 * p.lvl).toFixed(2) }; });
  Object.entries(profile()).forEach(([id, v]) => { if (!hl[id]) hl[id] = { role: v.tight >= v.weak ? 'tight' : 'weak', o: Math.min(0.9, 0.35 + 0.13 * Math.max(v.tight, v.weak)).toFixed(2) }; });
  return hl;
}
function statusLegend(hl) {
  const used = new Set(Object.values(hl).map(x => x.role)), l = {};
  if (used.has('pain')) l.pain = 'deine Beschwerden';
  if (used.has('tight')) l.tight = 'Test: eingeschränkt';
  if (used.has('weak')) l.weak = 'Test: schwach';
  return l;
}

VIEWS.body = {
  title: 'Körper',
  sub() { const sc = scoreOf(S.tests), n = activePains().length; return sc == null && !n ? 'Verstehen, was zusammenhängt' : [sc != null ? 'Körper-Score ' + sc : '', n ? plural(n, 'Beschwerde', 'Beschwerden') : ''].filter(Boolean).join(' · '); },
  render() {
    const b = ui.body;
    return `<div class="seg">${[['map', 'Karte'], ['topics', 'Themen'], ['check', 'Check']].map(([k, n]) => `<button data-act="bSub" data-v="${k}" class="${b.sub === k ? 'on' : ''}">${n}</button>`).join('')}</div>` +
      (b.sub === 'map' ? bMap() : b.sub === 'topics' ? (b.topic && D.TOPICS[b.topic] ? bTopic(b.topic) : bTopics()) : bCheck());
  }
};

/* ── Karte ── */
function mapControls() {
  const b = ui.body;
  return `<div class="mapbar">
    <div class="seg sm">${[['both', 'Beide'], ['front', 'Vorne'], ['back', 'Hinten']].map(([k, n]) => `<button data-act="bView" data-v="${k}" class="${b.view === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div class="seg sm"><button data-act="bDeep" data-v="0" class="${b.deep ? '' : 'on'}">Oberfläche</button><button data-act="bDeep" data-v="1" class="${b.deep ? 'on' : ''}">Tief</button></div>
  </div>`;
}
function bMap() {
  const b = ui.body, i = b.sel ? info(b.sel) : null;
  let hl = {}, lg = {}, cap = '';
  if (i) {
    hl[b.sel] = { role: 'sel' };
    const set = (id, r) => { if (r && !hl[id]) hl[id] = { role: r }; };
    if (i.kind === 'm') {
      i.syn.forEach(x => set(x, 'syn')); i.ant.forEach(x => set(x, 'ant')); i.j.forEach(x => set(x, needRole(x)));
      lg = { sel: i.n, syn: 'arbeitet mit', ant: 'Gegenspieler', mob: 'Gelenk: Mobilität', stab: 'Gelenk: Stabilität' };
    } else {
      i.mus.forEach(x => set(x, 'inv')); (J_NEIGH[b.sel] || []).forEach(x => set(x, needRole(x)));
      lg = { sel: i.n, inv: 'umliegende Muskeln', mob: 'Nachbar: Mobilität', stab: 'Nachbar: Stabilität' };
    }
  } else {
    hl = statusHL(); lg = statusLegend(hl);
    cap = Object.keys(hl).length ? 'Dein aktueller Stand. Tippe auf einen Muskel oder ein Gelenk ●' : 'Tippe auf einen Muskel oder ein Gelenk ●';
  }
  return `<div class="card mapcard" id="bmapcard">${mapControls()}${bodySVG({ view: b.view, hl, deep: b.deep, tap: 'body' })}${legend(lg, cap)}</div>` +
    (i ? structHTML(b.sel) : bOverview());
}
function bOverview() {
  const f = profile();
  const st = id => S.pains[id] && S.pains[id].lvl ? 'pain' : f[id] ? (f[id].tight >= f[id].weak ? 'tight' : 'weak') : null;
  return `<div class="card pad"><p class="p">Die Karte zeigt, <b style="color:var(--t1)">mit wem ein Muskel zusammenarbeitet</b>, wer sein <b style="color:var(--t1)">Gegenspieler</b> ist und welche Gelenke er bewegt. Mit „Tief“ blendest du die stabilisierende Tiefenmuskulatur ein.</p></div>
    <div class="section-t">Muskeln<span class="muted">${Object.keys(D.M).length}</span></div>
    <div class="card pad stack">${M_GROUPS.map(([g, ids]) => `<div><div class="sec">${g}</div><div class="chips">${ids.map(id => chip(id, st(id))).join('')}</div></div>`).join('')}</div>
    <div class="section-t">Gelenke<span class="muted"><span style="color:var(--c-mob)">●</span> Mobilität · <span style="color:var(--c-weak)">●</span> Stabilität</span></div>
    <div class="card pad"><div class="chips">${J_ORDER.map(id => chip(id, D.J[id].need)).join('')}</div></div>
    <p class="note">Allgemeines Trainingswissen, keine medizinische Diagnose. Starke, anhaltende oder ausstrahlende Beschwerden bitte ärztlich oder physiotherapeutisch abklären.</p>`;
}

function statusTags(id) {
  const v = profile()[id], p = S.pains[id]; let s = '';
  if (p && p.lvl) s += `<span class="tag red">Beschwerde ${p.lvl}/10${p.side && p.side !== 'B' ? ' · ' + SIDE_LBL[p.side] : ''}</span>`;
  if (v && v.tight) s += '<span class="tag amb">Bei dir: eingeschränkt</span>';
  if (v && v.weak) s += '<span class="tag blu">Bei dir: schwach</span>';
  return s;
}
const topicsWith = id => Object.entries(D.TOPICS).filter(([, t]) => t.roles[id]).map(([k, t]) => `<button class="chip" data-act="topic" data-id="${k}" data-role="${t.roles[id]}"><i></i>${t.ico} ${esc(t.n)}</button>`).join('');
function testChips(ids) {
  return (ids || []).filter(t => D.T[t]).map(t => {
    const r = S.tests[t], s = r != null && D.T[t].opts[r] ? D.T[t].opts[r].s : null;
    return `<button class="chip" data-act="test" data-id="${t}"><i style="${s == null ? '' : 'background:' + ['var(--ok)', 'var(--c-tight)', 'var(--c-pain)'][s]}"></i>🧪 ${esc(D.T[t].n)}</button>`;
  }).join('');
}
// Übungen zu einer Struktur: kuratierte Liste zuerst, dann weitere mit diesem Hauptziel; nach Tier sortiert
function structEx(id, base) {
  const ids = (base || []).slice();
  Object.values(E).forEach(e => { if (e.m[0] === id && !ids.includes(e.id)) ids.push(e.id); });
  const ord = 'SABCD', by = { mob: [], akt: [], kraft: [] };
  ids.filter(x => E[x] && E[x].tier !== 'C' && E[x].tier !== 'D').forEach(x => by[E[x].t].push(x));
  return ['mob', 'akt', 'kraft'].filter(t => by[t].length).map(t =>
    `<div class="section-t">${EX_ICO[t]} ${EX_LBL[t]}</div><div class="card list">${by[t].sort((a, b) => ord.indexOf(E[a].tier) - ord.indexOf(E[b].tier)).slice(0, 5).map(x => exRow(x)).join('')}</div>`).join('');
}
const back = lbl => `<button class="lnk" data-act="bBack" style="margin:2px 4px 10px">‹ ${lbl}</button>`;

function structHTML(id) {
  const i = info(id), an = X.ANAT[id], tp = topicsWith(id);
  const head = `${back('Übersicht')}<div class="card pad" style="margin-bottom:10px"><div class="h1">${esc(i.n)}</div><div class="lat">${esc(i.lat)}</div>`;
  const tail = `
    ${i.pain && i.pain.length ? `<div class="box" style="margin-bottom:10px"><div class="sec">Typische Beschwerden</div>${ul(i.pain, 'var(--c-pain)')}</div>` : ''}
    ${i.bike ? `<div class="box bike" style="margin-bottom:10px"><div class="sec" style="color:var(--acc-t)">🚴 Am Rad</div><p class="p" style="color:var(--t1)">${esc(i.bike)}</p></div>` : ''}
    ${i.tests && i.tests.length ? `<div class="section-t">Selbsttest</div><div class="card pad"><div class="chips">${testChips(i.tests)}</div></div>` : ''}
    ${structEx(id, i.ex)}
    <button class="btn soft" data-act="painNew" data-id="${id}" style="margin-top:14px">📍 Beschwerde hier eintragen</button>`;
  if (i.kind === 'm') return head + `
      <div class="tags"><span class="tag blu">${esc(i.r)}</span>${i.deep ? '<span class="tag">Tiefe Schicht</span>' : ''}${statusTags(id)}</div>
      <div style="margin-top:14px"><div class="sec">Was er macht</div>${ul(i.fn, 'var(--acc)')}</div>
      ${an ? `<details style="margin-top:12px"><summary class="lnk">Anatomie im Detail ▾</summary><dl class="kv" style="margin-top:8px"><dt>Ursprung</dt><dd>${esc(an[0])}</dd><dt>Ansatz</dt><dd>${esc(an[1])}</dd><dt>Nerv</dt><dd>${esc(an[2])}</dd></dl></details>` : ''}
    </div>
    <div class="stack" style="margin-bottom:10px">
      ${i.tight.length ? `<div class="box tight"><div class="sec" style="color:var(--c-tight)">Wenn verkürzt / überaktiv</div>${ul(i.tight, 'var(--c-tight)')}</div>` : ''}
      ${i.weak.length ? `<div class="box weak"><div class="sec" style="color:var(--c-weak)">Wenn schwach / gehemmt</div>${ul(i.weak, 'var(--c-weak)')}</div>` : ''}
    </div>
    <div class="section-t">Wechselwirkungen</div>
    <div class="card pad stack" style="margin-bottom:10px">
      ${i.syn.length ? `<div><div class="sec">Arbeitet mit</div><div class="chips">${i.syn.map(x => chip(x, 'syn')).join('')}</div></div>` : ''}
      ${i.ant.length ? `<div><div class="sec">Gegenspieler</div><div class="chips">${i.ant.map(x => chip(x, 'ant')).join('')}</div><p class="small muted" style="margin-top:6px">Ist ein Muskel dauerhaft verkürzt, wird sein Gegenspieler gehemmt – deshalb immer beide Seiten angehen: das eine dehnen, das andere kräftigen.</p></div>` : ''}
      ${i.j.length ? `<div><div class="sec">Bewegt / beeinflusst</div><div class="chips">${i.j.map(x => chip(x, needRole(x))).join('')}</div></div>` : ''}
      ${tp ? `<div><div class="sec">Spielt eine Rolle bei</div><div class="chips">${tp}</div></div>` : ''}
    </div>` + tail;
  const nb = J_NEIGH[id] || [], mobN = nb.filter(x => D.J[x].need === 'mob').map(nm), stabN = nb.filter(x => D.J[x].need === 'stab').map(nm);
  const hint = i.need === 'stab'
    ? (mobN.length ? `Schmerzt es hier, prüfe auch die beweglichen Nachbarn (<b style="color:var(--t1)">${esc(mobN.join(' & '))}</b>). Fehlt dort Bewegung, holt sie sich der Körper hier.` : '')
    : `Wird dieses Gelenk steif, müssen die stabilen Nachbarn (<b style="color:var(--t1)">${esc(stabN.join(' & ') || '–')}</b>) Bewegung liefern, für die sie nicht gebaut sind.`;
  return head + `
      <div class="tags">${i.need === 'mob' ? '<span class="tag grn">braucht Mobilität</span>' : '<span class="tag blu">braucht Stabilität</span>'}${statusTags(id)}</div>
      <p class="p" style="margin-top:10px">${esc(i.needTxt)}</p>
      <div style="margin-top:12px"><div class="sec">Bewegungen</div>${ul(i.moves, 'var(--acc)')}</div>
    </div>
    <div class="box tight" style="margin-bottom:10px"><div class="sec" style="color:var(--c-tight)">Wenn hier etwas fehlt → Kompensation</div>${ul(i.comp, 'var(--c-tight)')}</div>
    <div class="section-t">Wechselwirkungen</div>
    <div class="card pad stack" style="margin-bottom:10px">
      <div><div class="sec">Umliegende Muskeln</div><div class="chips">${i.mus.map(x => chip(x, 'inv')).join('')}</div></div>
      <div><div class="sec">Nachbargelenke</div><div class="chips">${nb.map(x => chip(x, needRole(x))).join('')}</div>${hint ? `<p class="small muted" style="margin-top:6px">${hint}</p>` : ''}</div>
      ${tp ? `<div><div class="sec">Spielt eine Rolle bei</div><div class="chips">${tp}</div></div>` : ''}
    </div>` + tail;
}

/* ── Themen ── */
function bTopics() {
  const tile = ([k, t]) => { const st = topicStatus(k); return `<button class="tile" data-act="topic" data-id="${k}"><span class="hd"><span class="te">${t.ico}</span>${st ? `<span class="amp ${st}"></span>` : ''}</span><b>${esc(t.n)}</b><small>${esc(t.insight)}</small></button>`; };
  const all = Object.entries(D.TOPICS);
  return `<div class="section-t" style="margin-top:6px">Problemzonen<span class="muted">Punkt = dein Stand</span></div><div class="tiles">${all.filter(([, t]) => t.grp === 'zone').map(tile).join('')}</div>
    <div class="section-t">Zusammenhänge verstehen</div><div class="tiles">${all.filter(([, t]) => t.grp === 'concept').map(tile).join('')}</div>`;
}
function bTopic(k) {
  const t = D.TOPICS[k], st = topicStatus(k), hl = {}, lg = {}, byRole = {};
  Object.entries(t.roles).forEach(([id, r]) => { hl[id] = { role: r }; (byRole[r] = byRole[r] || []).push(id); });
  ROLE_ORDER.forEach(r => { if (byRole[r]) lg[r] = (t.legend && t.legend[r]) || ROLE_LBL[r]; });
  const done = t.tests.filter(x => S.tests[x] != null).length;
  const stTxt = st ? { g: ['grn', 'Gut aufgestellt'], a: ['amb', 'Ausbaufähig'], r: ['red', 'Baustelle'] }[st] : null;
  const exs = ['mob', 'akt', 'kraft'].filter(p => (t.ex[p] || []).length).map(p => `<div class="section-t">${EX_ICO[p]} ${EX_LBL[p]}</div><div class="card list">${t.ex[p].map(x => exRow(x)).join('')}</div>`).join('');
  return `${back('Alle Themen')}
    <div class="card pad" style="margin-bottom:10px"><div class="h1">${t.ico} ${esc(t.n)}</div>
      <div class="tags">${stTxt ? `<span class="tag ${stTxt[0]}">Dein Stand: ${stTxt[1]}</span>` : ''}<span class="tag">${done}/${t.tests.length} Tests gemacht</span></div>
      <p class="p" style="margin-top:10px">${esc(t.sum)}</p></div>
    <div class="box ins" style="margin-bottom:10px">💡 ${esc(t.insight)}</div>
    <div class="card mapcard">${bodySVG({ hl, tap: 'body', deep: false })}${legend(lg)}</div>
    <div class="section-t">Wie hängt das zusammen?</div>
    <div class="card pad"><div class="flow">${t.chain.map((c, n) => `${n ? '<div class="arrow">↓</div>' : ''}<div class="step${n === t.chain.length - 1 ? ' last' : ''}"><b>${n + 1}</b><span>${esc(c)}</span></div>`).join('')}</div>
      ${t.examples ? `<div class="sec" style="margin-top:14px">Schnell-Check</div><div class="stack s6">${t.examples.map(([a, b]) => `<div class="step"><span><b style="all:unset;font-weight:700">${esc(a)}</b> → ${esc(b)}</span></div>`).join('')}</div>` : ''}</div>
    <div class="section-t">Beteiligte Strukturen<span class="muted">antippen</span></div>
    <div class="card pad stack">${ROLE_ORDER.filter(r => byRole[r]).map(r => `<div><div class="sec">${esc(lg[r])}</div><div class="chips">${byRole[r].map(id => chip(id, r)).join('')}</div></div>`).join('')}</div>
    <div class="section-t">Selbsttests</div><div class="card pad"><div class="chips">${testChips(t.tests)}</div></div>
    ${exs}
    ${k === 'bike' ? '<button class="btn soft" data-act="tab" data-view="ride" style="margin-top:14px">🚴 Beschwerden am Rad: Ratgeber öffnen</button>' : ''}
    ${t.red && t.red.length ? `<div class="box red" style="margin-top:14px"><div class="sec" style="color:var(--red-t)">🚩 Wann zum Arzt?</div>${ul(t.red, 'var(--c-pain)')}</div>` : ''}`;
}

/* ── Check: Bestandsaufnahme ── */
const lastSnap = () => { const h = S.snaps.filter(x => x.d !== today()).sort((a, b) => a.ts - b.ts); return h.length ? h[h.length - 1] : null; };
function bCheck() {
  const nT = Object.keys(D.T).length, done = Object.keys(S.tests).filter(k => D.T[k]).length, sc = scoreOf(S.tests);
  const pains = activePains(), prev = lastSnap(), P = buildPlan();
  const def = Object.entries(P.f).filter(([id]) => info(id)).map(([id, v]) => ({ id, v, tot: v.tight + v.weak })).sort((a, b) => b.tot - a.tot).slice(0, 6);
  const maxT = def.length ? def[0].tot : 1;
  const hl = {}; pains.forEach(([id, p]) => { hl[id] = { role: 'pain', side: p.side, o: (0.35 + 0.06 * p.lvl).toFixed(2) }; });
  const snaps = S.snaps.slice().sort((a, b) => b.ts - a.ts);
  return `
    <div class="card pad" style="margin-bottom:10px"><div class="row" style="justify-content:flex-start;gap:14px">
      ${ring(76, 8, sc == null ? 0 : sc / 100, scoreCol(sc), `<span style="font-size:24px;color:${scoreCol(sc)}">${sc == null ? '–' : sc}</span>`)}
      <div style="flex:1;min-width:0"><b style="font-size:17px">Dein Körper-Score</b>
        <p class="small muted">${done}/${nT} Tests · ${plural(pains.length, 'Beschwerde', 'Beschwerden')}</p>
        <div class="meter" style="margin-top:8px"><i style="width:${Math.round(100 * done / nT)}%"></i></div></div></div>
      <p class="small muted" style="margin-top:10px">① Beschwerden markieren ② Selbsttests machen → daraus entsteht dein Plan. Alle 4–6 Wochen wiederholen und den Stand speichern.</p>
      <button class="btn soft sm" data-act="snap" style="margin-top:10px;width:100%">💾 Stand speichern</button></div>
    ${def.length || Object.keys(P.focus).length ? `<div class="section-t">Deine Baustellen<span class="muted"><span style="color:var(--c-tight)">■</span> eingeschränkt <span style="color:var(--c-weak)">■</span> schwach</span></div>
    <div class="card pad">${def.map(x => { const tight = x.v.tight >= x.v.weak; return `<button class="bl" data-act="st" data-id="${x.id}"><span>${esc(nm(x.id))} <small>· ${tight ? 'eingeschränkt' : 'schwach'}</small></span><span class="meter"><i style="width:${Math.round(100 * x.tot / maxT)}%;background:${tight ? 'var(--c-tight)' : 'var(--c-weak)'}"></i></span><em>${x.tot}</em></button>`; }).join('')}
      <div class="btns" style="margin-top:10px"><button class="btn primary sm" data-act="rt" data-id="r_plan">🧘 Mobility-Plan</button><button class="btn primary sm" data-act="tpl" data-id="t_plan">🏋️ Kraft-Plan</button></div></div>` : ''}
    <div class="section-t">① Beschwerden<span class="muted">${pains.length}</span></div>
    <div class="card mapcard"><div class="mapbar" style="justify-content:flex-end"><div class="seg sm"><button data-act="bDeep" data-v="0" class="${ui.body.deep ? '' : 'on'}">Oberfläche</button><button data-act="bDeep" data-v="1" class="${ui.body.deep ? 'on' : ''}">Tief</button></div></div>${bodySVG({ hl, tap: 'pain', deep: ui.body.deep })}
      <div class="legend"><span class="cap">👆 Tippe auf die Stelle, die schmerzt oder sich steif anfühlt. Die Seite wird erkannt.</span></div></div>
    ${pains.length ? `<div class="card list">${pains.map(([id, p]) => `<button class="li" data-act="painEdit" data-id="${id}"><span class="lvl" style="background:${painCol(p.lvl)}">${p.lvl}</span><span class="bd"><b>${esc(nm(id))} <span class="muted" style="font-weight:500">· ${SIDE_LBL[p.side] || ''}</span></b><small class="clip">${esc([p.type].concat(p.when || []).filter(Boolean).join(' · '))}${p.note ? ' — ' + esc(p.note) : ''}</small></span><span class="go">›</span></button>`).join('')}</div>
      <div class="chips" style="margin-top:8px">${[...new Set(pains.reduce((a, [id]) => a.concat(painTopics(id)), []))].map(k => `<button class="chip" data-act="topic" data-id="${k}">${D.TOPICS[k].ico} ${esc(D.TOPICS[k].n)} ›</button>`).join('')}</div>` : ''}
    <div class="section-t">② Selbsttests<span class="muted">${done}/${nT}</span></div>
    <p class="small muted" style="margin:0 4px 8px">Kurz aufwärmen, langsam testen, nichts erzwingen. Bei Schmerz abbrechen und die rote Antwort wählen.</p>
    ${D.TEST_GROUPS.map(g => `<div class="sec" style="margin:12px 4px 6px">${g}</div><div class="stack s6">${Object.entries(D.T).filter(([, t]) => t.g === g).map(([k, t]) => testCard(k, t, prev)).join('')}</div>`).join('')}
    ${done ? '<button class="btn danger sm" data-act="testsReset" style="margin-top:10px">Aktuelle Testergebnisse zurücksetzen</button>' : ''}
    <div class="section-t">Verlauf<span class="muted">${snaps.length}</span></div>
    ${snaps.length ? `<div class="card pad" style="margin-bottom:8px"><div class="bars" style="height:70px">${snaps.slice(0, 12).reverse().map((h, n, a) => `<div class="b${n === a.length - 1 ? ' now' : ''}"><i style="height:${Math.max(4, h.score || 0)}%"></i></div>`).join('')}</div></div>
      <div class="card list">${snaps.map((h, n) => { const o = snaps[n + 1], dl = o && h.score != null && o.score != null ? h.score - o.score : null; return `<div class="li"><span class="lvl" style="background:var(--card2);color:var(--t1)">${h.score == null ? '–' : h.score}</span><span class="bd"><b>${fmtDate(fromKey(h.d))}${dl != null ? ` <span style="font-size:13px;color:${dl >= 0 ? 'var(--ok)' : 'var(--c-pain)'}">${dl >= 0 ? '▲ +' : '▼ '}${dl}</span>` : ''}</b><small>${Object.keys(h.tests || {}).length} Tests · ${plural(Object.values(h.pains || {}).filter(p => p.lvl > 0).length, 'Beschwerde', 'Beschwerden')}</small></span><button class="lnk" data-act="snapDel" data-id="${esc(h.id)}">Löschen</button></div>`; }).join('')}</div>`
      : '<div class="card empty">Noch kein Stand gespeichert.</div>'}`;
}
function testCard(k, t, prev) {
  const cur = S.tests[k], s = cur != null && t.opts[cur] ? t.opts[cur].s : null;
  const pv = prev && prev.tests && prev.tests[k] != null && t.opts[prev.tests[k]] ? t.opts[prev.tests[k]] : null;
  return `<details class="test" id="t-${k}"><summary><span class="amp${s == null ? '' : ' ' + 'gar'[s]}"></span><span style="flex:1;min-width:0"><b>${esc(t.n)}</b><small>${esc(t.what)}</small></span><span class="muted">▾</span></summary>
    <div class="tb"><ol class="ol">${t.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol>
      <div class="sec">Dein Ergebnis</div><div class="opts">${t.opts.map((o, n) => `<button class="opt s${o.s}${cur === n ? ' on' : ''}" data-act="testOpt" data-t="${k}" data-n="${n}"><i></i><span>${esc(o.l)}</span></button>`).join('')}</div>
      ${pv ? `<p class="small muted" style="margin-top:8px">Letztes Mal (${fmtDate(fromKey(prev.d))}): ${esc(pv.l)}</p>` : ''}
      <div class="sec" style="margin-top:12px">Betrifft</div><div class="chips">${t.m.map(m => chip(m)).join('')}</div></div></details>`;
}

/* ── Beschwerde eintragen ── */
let pe = null;
function openPain(id, side) {
  const i = info(id); if (!i) return;
  const ex = S.pains[id], tap = side === 'C' ? 'B' : side;
  const p = ex ? Object.assign({}, ex, { when: (ex.when || []).slice() }) : { lvl: 5, type: D.PAIN_TYPES[0], side: tap || 'B', when: [], note: '' };
  if (ex && tap && ex.side !== 'B' && ex.side !== tap) p.side = 'B';
  pe = { id, p };
  const pick = (k, list, lbl) => `<div class="chips" data-pk="${k}">${list.map(v => `<button class="chip${(k === 'when' ? p.when.includes(v) : p[k] === v) ? ' on' : ''}" data-act="painPick" data-v="${esc(v)}">${esc(lbl ? lbl[v] : v)}</button>`).join('')}</div>`;
  openSheet({
    title: i.n, left: 'Abbrechen', right: '<button class="lnk r" data-act="painSave">Speichern</button>', onClose() { pe = null; },
    body: `<div class="field"><label>Wie stark? (0 = nichts, 10 = sehr stark)</label><div class="card pad"><div class="range"><input type="range" min="0" max="10" step="1" value="${p.lvl}" data-in="painLvl"><b id="painLvl" style="color:${painCol(p.lvl)}">${p.lvl}</b></div></div></div>
      <div class="field"><label>Art</label>${pick('type', D.PAIN_TYPES)}</div>
      <div class="field"><label>Seite</label>${pick('side', ['L', 'R', 'B'], SIDE_LBL)}</div>
      <div class="field"><label>Wann? (mehrere möglich)</label>${pick('when', D.PAIN_WHEN)}</div>
      <div class="field"><label>Notiz</label><textarea id="painNote" rows="2" placeholder="z. B. seit 2 Wochen, nach langer Ausfahrt schlimmer">${esc(p.note)}</textarea></div>
      <div class="box red" id="painWarn" hidden style="margin-bottom:12px;font-size:14px">🚩 Kribbeln, Taubheit oder nächtliche Schmerzen können auf eine Nervenbeteiligung hinweisen. Bitte ärztlich abklären lassen – besonders, wenn es zunimmt oder Kraft fehlt.</div>
      <div class="stack"><button class="btn primary" data-act="painSave">Speichern</button>
        ${ex ? '<button class="btn danger" data-act="painDel">Beschwerde entfernen</button>' : ''}
        <button class="btn plain" data-act="st" data-id="${id}">ℹ️ Mehr über ${esc(i.n)}</button></div>`
  });
  painWarn();
}
function painWarn() { const w = $('#painWarn'); if (w && pe) w.hidden = !(pe.p.type === 'Kribbeln / Taubheit' || pe.p.when.includes('nachts')); }
IN.painLvl = el => { if (!pe) return; pe.p.lvl = +el.value; const b = $('#painLvl'); b.textContent = el.value; b.style.color = painCol(+el.value); };

const MAPTAP = {
  body(id) { const b = ui.body; b.sel = id; b.sub = 'map'; S.ui.view = 'body'; render(); const c = $('#bmapcard'); if (c) window.scrollTo({ top: Math.max(0, c.getBoundingClientRect().top + window.scrollY - 150), behavior: 'smooth' }); },
  pain(id, side) { openPain(id, side); }
};
document.addEventListener('click', e => {
  const n = e.target.closest('.bmap.tap [data-id]'); if (!n) return;
  const fn = MAPTAP[n.closest('.bmap').dataset.map]; if (fn) fn(n.dataset.id, n.dataset.side);
});
function rerenderCheck() {
  const open = $$('details.test[open]').map(d => d.id);
  keepScroll(render);
  open.forEach(id => { const d = document.getElementById(id); if (d) d.open = true; });
}

Object.assign(ACT, {
  bSub(el) { ui.body.sub = el.dataset.v; if (el.dataset.v === 'check') ui.body.deep = false; render(); window.scrollTo(0, 0); },
  bView(el) { ui.body.view = el.dataset.v; keepScroll(render); },
  bDeep(el) { ui.body.deep = el.dataset.v === '1'; if (ui.body.sub === 'check') rerenderCheck(); else keepScroll(render); },
  bBack() { if (ui.body.sub === 'map') ui.body.sel = null; else ui.body.topic = null; render(); window.scrollTo(0, 0); },
  painNew(el) { openPain(el.dataset.id); },
  painEdit(el) { openPain(el.dataset.id); },
  painPick(el) {
    if (!pe) return;
    const k = el.parentElement.dataset.pk, v = el.dataset.v, p = pe.p;
    if (k === 'when') { p.when = p.when.includes(v) ? p.when.filter(x => x !== v) : p.when.concat(v); el.classList.toggle('on'); }
    else { p[k] = v; $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); }
    painWarn();
  },
  painSave() {
    if (!pe) return;
    const { id, p } = pe; p.note = $('#painNote').value.trim();
    if (p.lvl > 0) { S.pains[id] = Object.assign({}, p, { d: today() }); toast('Beschwerde gespeichert'); } else { delete S.pains[id]; toast('Ohne Intensität – entfernt'); }
    save(); closeSheet(); rerenderCheck();
  },
  painDel() { if (!pe) return; delete S.pains[pe.id]; save(); closeSheet(); rerenderCheck(); toast('Beschwerde entfernt'); },
  testOpt(el) {
    const k = el.dataset.t, n = +el.dataset.n;
    if (S.tests[k] === n) delete S.tests[k]; else S.tests[k] = n;
    save(); rerenderCheck();
  },
  testsReset() { confirmSheet('Alle aktuellen Testergebnisse zurücksetzen? Gespeicherte Stände bleiben erhalten.', 'Zurücksetzen', () => { S.tests = {}; save(); render(); }); },
  snap() {
    if (!Object.keys(S.tests).length && !activePains().length) { toast('Erst Tests machen oder Beschwerden markieren'); return; }
    const snap = { id: uid(), d: today(), ts: Date.now(), tests: Object.assign({}, S.tests), pains: JSON.parse(JSON.stringify(S.pains)), score: scoreOf(S.tests) };
    const i = S.snaps.findIndex(x => x.d === snap.d);
    if (i >= 0) { snap.id = S.snaps[i].id; S.snaps[i] = snap; } else S.snaps.push(snap);
    save(); rerenderCheck(); toast('Stand gespeichert');
  },
  snapDel(el) { confirmSheet('Diesen gespeicherten Stand löschen?', 'Löschen', () => { S.snaps = S.snaps.filter(x => x.id !== el.dataset.id); save(); keepScroll(render); }); }
});
