'use strict';
/* ═══ MOBILITY: Routinen · geführter Player · Tier-Listen · eigene Routinen ═══ */

const getRoutine = id => id === 'r_plan' ? planRoutine() : X.ROUTINES.find(r => r.id === id) || S.routines.find(r => r.id === id) || null;
const rtSec = r => r.items.reduce((a, [x, sec]) => a + (E[x] ? sec * (E[x].sides ? 2 : 1) + S.settings.prep : 0), 0);
const rtMin = r => Math.max(1, Math.round(rtSec(r) / 60));
const holdTxt = (x, sec) => `${sec} s${E[x] && E[x].sides ? ' je Seite' : ''}`;

VIEWS.mob = {
  title: 'Mobility',
  sub() { const w = weekStart().getTime(), st = periodStats(w, w + 7 * DAY); return `${st.mob}/${S.settings.goalM} Einheiten diese Woche · ${fmtMin(st.mobMin)}`; },
  actions: () => '<button class="hbtn" data-act="timer" aria-label="Timer">⏱</button>',
  render() {
    const m = ui.mob;
    return `<div class="seg">${[['routines', 'Routinen'], ['lib', 'Dehnübungen']].map(([k, n]) => `<button data-act="mSub" data-v="${k}" class="${m.sub === k ? 'on' : ''}">${n}</button>`).join('')}</div>` + (m.sub === 'routines' ? mRoutines() : mLib());
  }
};

function mRoutines() {
  const plan = planRoutine();
  const row = r => `<button class="li" data-act="rt" data-id="${esc(r.id)}"><span class="ic">${r.e || '🧘'}</span><span class="bd"><b>${esc(r.n)}</b><small class="clip">${esc(r.d || plural(r.items.length, 'Übung', 'Übungen'))}</small></span><span class="rt">${rtMin(r)} min</span></button>`;
  const rode = S.rides.some(r => dkey(new Date(r.s)) === today());
  return `
    ${plan ? `<div class="section-t" style="margin-top:6px">Für dich</div><div class="card list">${row(plan)}</div>` : `<div class="card pad" style="margin-bottom:4px"><div class="row"><span style="font-size:28px">🎯</span><span style="flex:1"><b>Persönliche Routine</b><br><span class="small muted">Nach dem Körper-Check stellt die App dir die passenden Übungen zusammen.</span></span></div><button class="btn soft sm" data-act="goCheck" style="margin-top:10px;width:100%">Zum Check</button></div>`}
    ${rode ? `<div class="section-t">Heute gefahren</div><div class="card list">${row(getRoutine('r_bike'))}</div>` : ''}
    <div class="section-t">Routinen</div><div class="card list">${X.ROUTINES.map(row).join('')}</div>
    <div class="section-t">Eigene Routinen<button data-act="rbNew">＋ Neu</button></div>
    ${S.routines.length ? `<div class="card list">${S.routines.map(row).join('')}</div>` : '<div class="card empty">Stell dir aus allen Dehnübungen deine eigene Routine zusammen.<button class="btn soft sm" data-act="rbNew" style="margin:12px auto 0">＋ Eigene Routine</button></div>'}`;
}
function rtSheet(id) {
  const r = getRoutine(id); if (!r) { toast('Mach zuerst den Körper-Check'); return; }
  const custom = S.routines.some(x => x.id === id);
  openSheet({
    title: r.n, body: `<p class="p" style="margin:0 4px 12px">${esc(r.d || 'Eigene Routine')} <b style="color:var(--t1)">· ca. ${rtMin(r)} min</b></p>
      <button class="btn primary" data-act="rtStart" data-id="${esc(id)}" style="margin-bottom:12px">▶ Routine starten</button>
      <div class="card list">${r.items.filter(([x]) => E[x]).map(([x, sec]) => exRow(x, { rt: holdTxt(x, sec), sub: r.why && r.why[x] ? r.why[x] : E[x].m.slice(0, 3).map(nm).join(', ') })).join('')}</div>
      ${custom ? `<div class="stack" style="margin-top:14px"><button class="btn plain" data-act="rbEdit" data-id="${esc(id)}">✏️ Bearbeiten</button><button class="btn danger" data-act="rbDel" data-id="${esc(id)}">Routine löschen</button></div>` : ''}
      <p class="note">Der Player führt dich Übung für Übung mit Countdown und Signalton durch die Routine.</p>`
  });
}

/* ── Dehnübungen (Tier-Listen nach Zielbereich) ── */
function mLib() {
  const m = ui.mob, f = profile(), tight = Object.keys(f).filter(id => f[id].tight);
  const chips = [['you', { n: '🎯 Für dich' }], ['fav', { n: '★ Favoriten' }]].concat(Object.entries(X.MGROUPS));
  let list;
  if (m.grp === 'you') {
    const ord = 'SABCD', xs = Object.values(E).filter(e => e.t === 'mob' && 'SAB'.includes(e.tier) && e.m.some(x => tight.includes(x))).sort((a, b) => ord.indexOf(a.tier) - ord.indexOf(b.tier));
    list = xs.length ? `<p class="small muted" style="margin:0 4px 8px">Dehnübungen für das, was in deinen Tests eingeschränkt war: ${esc(tight.map(nm).join(', '))}.</p><div class="card list">${xs.slice(0, 14).map(e => exRow(e.id, { sub: e.m.filter(x => tight.includes(x)).map(nm).join(', ') })).join('')}</div>`
      : '<div class="card empty"><div class="big">🎯</div><b>Noch keine Daten</b>Mach die Selbsttests im Körper-Check – dann siehst du hier, was du dehnen solltest.<button class="btn soft sm" data-act="goCheck" style="margin:12px auto 0">Zum Check</button></div>';
  } else if (m.grp === 'fav') {
    const xs = Object.keys(S.favs).filter(id => E[id] && E[id].t === 'mob');
    list = xs.length ? `<div class="card list">${xs.map(id => exRow(id)).join('')}</div>` : '<div class="card empty"><div class="big">☆</div>Noch keine Favoriten. Öffne eine Übung und tippe auf „Als Favorit merken“.</div>';
  } else list = tierList(m.grp, e => e.t === 'mob');
  return `<div class="chiprow">${chips.map(([k, g]) => `<button class="chip${m.grp === k ? ' on' : ''}" data-act="mGrp" data-v="${k}">${g.e ? g.e + ' ' : ''}${esc(g.n)}</button>`).join('')}</div>
    <div class="row" style="margin:0 4px 4px;justify-content:flex-end"><button class="lnk" data-act="rules" data-v="mob">Wie lese ich das?</button></div>${list}`;
}

/* ── Player ── */
let pl = null;
function startPlayer(r) {
  const steps = [];
  r.items.forEach(([x, sec]) => { if (!E[x]) return; if (E[x].sides) { steps.push({ x, sec, side: 'Links' }); steps.push({ x, sec, side: 'Rechts', second: true }); } else steps.push({ x, sec }); });
  if (!steps.length) return;
  pl = { r, steps, i: 0, ph: 'prep', c: null, t0: Date.now(), done: 0, seen: {} };
  closeAllSheets(); wake(true); plStep(0);
}
function plStep(i) {
  if (pl.c) pl.c.stop();
  if (i >= pl.steps.length) { plFinish(); return; }
  pl.i = Math.max(0, i);
  const st = pl.steps[pl.i], prep = st.second ? Math.min(3, S.settings.prep) : S.settings.prep;
  pl.ph = prep > 0 ? 'prep' : 'hold';
  renderPlayer();
  if (prep > 0) pl.c = clock(prep, plTick, plHold); else plHold();
}
function plHold() {
  const st = pl.steps[pl.i];
  pl.ph = 'hold'; pl.seen[st.x] = 1; pl.holdStart = Date.now();
  renderPlayer();
  pl.c = clock(st.sec, plTick, () => { pl.done += st.sec; plStep(pl.i + 1); });
}
function plTick(l, c) {
  const t = $('#plT'); if (!t) return;
  t.textContent = l;
  setRing($('#full'), c ? l / c.total : 0);
}
function renderPlayer() {
  const st = pl.steps[pl.i], e = E[st.x], nx = pl.steps[pl.i + 1], prep = pl.ph === 'prep';
  openFull(`<div class="fhead"><button class="lnk" data-act="plClose">✕ Beenden</button><div class="ft"><b>${esc(pl.r.n)}</b><small>${pl.i + 1} von ${pl.steps.length}</small></div><button class="lnk r" data-act="plSound">${S.settings.sound ? '🔔 Ton an' : '🔕 Ton aus'}</button></div>
    <div class="fbody"><div class="player${prep ? ' prep' : ''}">
      <div class="pprog">${pl.steps.map((s, n) => `<i class="${n < pl.i || (n === pl.i && !prep) ? 'on' : ''}"></i>`).join('')}</div>
      <div class="ps">${prep ? (st.second ? 'Seite wechseln' : 'Bereit machen') : st.side ? st.side + 'e Seite' : 'Halten / bewegen'}</div>
      <div class="pn">${esc(e.n)}${st.side ? ` <span class="muted" style="font-size:17px">· ${st.side.toLowerCase()}</span>` : ''}</div>
      ${ring(210, 12, 1, prep ? 'var(--run)' : 'var(--acc)', `<div><b id="plT"></b><small>${prep ? 'gleich geht’s los' : 'Sekunden'}</small></div>`)}
      <div class="pctl"><button data-act="plPrev" aria-label="Zurück">⏮</button><button class="main" data-act="plPause" id="plPauseB" aria-label="Pause">⏸</button><button data-act="plAdd" aria-label="15 Sekunden länger">+15</button><button data-act="plNext" aria-label="Weiter">⏭</button></div>
      <p class="small muted" style="min-height:18px">${nx ? 'Danach: ' + esc(E[nx.x].n) + (nx.side ? ' · ' + nx.side.toLowerCase() : '') : 'Letzte Übung 🎉'}</p>
      <div class="card pad" style="width:100%;text-align:left"><div class="sec">So geht’s</div><ol class="ol">${e.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol>${e.err ? `<p class="small" style="margin-top:10px;color:var(--c-tight)">⚠️ ${esc(e.err)}</p>` : ''}</div>
      <div class="card mapcard" style="width:100%">${bodySVG({ hl: targetHL(e.m), mini: true })}<div class="legend" style="justify-content:center"><span><i style="background:var(--c-pain)"></i>${esc(nm(e.m[0]))}</span>${e.m.slice(1, 3).map(m => `<span><i style="background:var(--c-syn)"></i>${esc(nm(m))}</span>`).join('')}</div></div>
    </div></div>`);
}
function plFinish(partial) {
  const p = pl; if (!p) return;
  if (p.c) p.c.stop();
  pl = null; wake(false); closeFull();
  const cnt = Object.keys(p.seen).length;
  if (p.done >= 20) {
    S.sessions.push({ id: uid(), k: 'mob', s: p.t0, e: Date.now(), n: p.r.n, rt: p.r.id || null, sec: p.done, cnt });
    save();
  }
  render();
  if (p.done < 20) return;
  const w = weekStart().getTime(), st = periodStats(w, w + 7 * DAY);
  openSheet({
    title: partial ? 'Gespeichert' : 'Geschafft! 🧘', body: `<div class="stats k3" style="margin-bottom:14px"><div class="card stat"><small>Dauer</small><b>${fmtMin(Math.max(1, p.done / 60))}</b></div><div class="card stat"><small>Übungen</small><b>${cnt}</b></div><div class="card stat"><small>Diese Woche</small><b>${st.mob}<i>/ ${S.settings.goalM}</i></b></div></div>
      <p class="p" style="text-align:center;margin-bottom:14px">Beweglichkeit kommt durch Regelmäßigkeit – ein paar Minuten an den meisten Tagen bringen mehr als eine lange Einheit pro Woche.</p>
      <button class="btn primary" data-act="closeSheet">Fertig</button>`
  });
}

/* ── Eigene Routine bauen ── */
let rb = null;
function rbBody() {
  return `<div class="field"><label>Name</label><input type="text" data-in="rbName" value="${esc(rb.n)}" placeholder="z. B. Meine Abendroutine"></div>
    <div class="section-t" style="margin-top:6px">Übungen<span class="muted">ca. ${rtMin(rb)} min</span></div>
    ${rb.items.length ? `<div class="card list">${rb.items.map(([x, sec], i) => `<div class="li"><span class="bd"><b>${esc(E[x].n)}</b><small>${E[x].sides ? 'je Seite' : 'gesamt'}</small></span>
      <div class="stepper" style="grid-template-columns:36px 58px 36px;min-height:40px"><button data-act="rbSec" data-i="${i}" data-d="-15">−</button><b style="font-size:15px">${sec}<small>s</small></b><button data-act="rbSec" data-i="${i}" data-d="15">＋</button></div>
      <button class="lnk" data-act="rbRm" data-i="${i}" aria-label="Entfernen">✕</button></div>`).join('')}</div>` : '<div class="card empty">Noch keine Übung.</div>'}
    <div class="stack" style="margin-top:12px"><button class="btn soft" data-act="rbPick">＋ Übung hinzufügen</button><button class="btn primary" data-act="rbSave">Routine speichern</button></div>`;
}
function rbOpen(r) {
  rb = r ? { id: r.id, n: r.n, items: r.items.map(i => i.slice()) } : { id: null, n: '', items: [] };
  openSheet({ title: r ? 'Routine bearbeiten' : 'Neue Routine', left: 'Abbrechen', body: rbBody(), onClose() { if (!pick) rb = null; } });
}
IN.rbName = el => { if (rb) rb.n = el.value; };

Object.assign(ACT, {
  mSub(el) { ui.mob.sub = el.dataset.v; render(); window.scrollTo(0, 0); },
  mGrp(el) { ui.mob.grp = el.dataset.v; keepScroll(render); },
  rt(el) { rtSheet(el.dataset.id); },
  rtStart(el) { const r = getRoutine(el.dataset.id); if (r) startPlayer(r); },
  exTimer(el) { const e = E[el.dataset.id]; if (e) startPlayer({ id: null, n: e.n, items: [[e.id, e.hold]] }); },
  plPause() { if (!pl || !pl.c) return; const b = $('#plPauseB'); if (pl.c.paused == null) { pl.c.pause(); b.textContent = '▶'; } else { pl.c.resume(); b.textContent = '⏸'; } },
  plAdd() { if (pl && pl.c) pl.c.add(15); },
  plNext() { if (!pl) return; if (pl.ph === 'hold') pl.done += Math.min(pl.steps[pl.i].sec, Math.round((Date.now() - pl.holdStart) / 1000)); plStep(pl.i + 1); },
  plPrev() { if (pl) plStep(pl.ph === 'prep' && pl.i > 0 ? pl.i - 1 : pl.i); },
  plSound() { S.settings.sound = !S.settings.sound; save(); const b = $('[data-act="plSound"]'); if (b) b.textContent = S.settings.sound ? '🔔 Ton an' : '🔕 Ton aus'; if (S.settings.sound) beep(880, 0.1); },
  plClose() {
    if (!pl) return;
    if (pl.ph === 'hold') pl.done += Math.min(pl.steps[pl.i].sec, Math.round((Date.now() - pl.holdStart) / 1000));
    pl.c.pause();
    if (pl.done >= 60) plFinish(true); else { const p = pl; p.done = 0; plFinish(true); }
  },
  rbNew() { rbOpen(null); },
  rbEdit(el) { const r = S.routines.find(x => x.id === el.dataset.id); closeAllSheets(); if (r) rbOpen(r); },
  rbDel(el) { confirmSheet('Diese Routine löschen?', 'Löschen', () => { S.routines = S.routines.filter(r => r.id !== el.dataset.id); save(); closeAllSheets(); render(); }); },
  rbPick() { openPicker({ title: 'Übung hinzufügen', act: 'rbAdd', mob: true }); },
  rbAdd(el) { const e = E[el.dataset.id]; if (!rb || !e) return; rb.items.push([e.id, e.hold]); closeSheet(); sheetBody(rbBody()); toast(e.n + ' hinzugefügt'); },
  rbSec(el) { const it = rb.items[+el.dataset.i]; it[1] = Math.max(15, Math.min(300, it[1] + +el.dataset.d)); sheetBody(rbBody()); },
  rbRm(el) { rb.items.splice(+el.dataset.i, 1); sheetBody(rbBody()); },
  rbSave() {
    if (!rb.items.length) { toast('Füge mindestens eine Übung hinzu'); return; }
    const r = { id: rb.id || 'c_' + uid(), n: rb.n.trim() || 'Meine Routine', e: '⭐', items: rb.items };
    const i = S.routines.findIndex(x => x.id === r.id);
    if (i >= 0) S.routines[i] = r; else S.routines.push(r);
    save(); closeAllSheets(); render(); toast('Routine gespeichert');
  }
});
