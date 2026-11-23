'use strict';
/* Haushalt (Routinen, Wissen) und To-dos.
   Routine: { id, n, a: Bereich, every, unit: d|w|m|y, mins, who: ''|Fee|Flo, last: Datum|null, snooze: Datum, hist: [{d, who}], tid, notes }
   To-do:   { id, t: Text, done: bool, doneAt: ms, d: Datum|null (= Irgendwann), who, notes, o }  – kompatibel mit dem Baby-Tagebuch */

const HH_WHO = ['', 'Fee', 'Flo'];
const daysFromToday = k => Math.round((fromKey(k) - startOfDay(new Date())) / 864e5);
function addInterval(k, every, unit) {
  const d = fromKey(k);
  if (unit === 'd') return addDays(d, every);
  if (unit === 'w') return addDays(d, 7 * every);
  const months = unit === 'y' ? 12 * every : every, t = new Date(d.getFullYear(), d.getMonth() + months, 1);
  t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
  return t;
}
const freqText = r => r.every === 1 ? { d: 'täglich', w: 'wöchentlich', m: 'monatlich', y: 'jährlich' }[r.unit] : r.unit === 'd' && r.every === 2 ? 'jeden 2. Tag' : `alle ${r.every} ${UNITS[r.unit][1]}`;
const dueOf = r => r.snooze || (r.last ? dkey(addInterval(r.last, r.every, r.unit)) : dkey(new Date()));
function dueText(k) {
  const n = daysFromToday(k);
  return n < -1 ? `seit ${-n} Tagen` : n === -1 ? 'seit gestern' : n === 0 ? 'heute' : n === 1 ? 'morgen' : n < 7 ? `in ${n} Tagen` : n < 60 ? `in ${Math.round(n / 7)} Wo.` : `in ${Math.round(n / 30)} Mon.`;
}
const meWho = () => (S.ui.who === 'Fee' || S.ui.who === 'Flo' ? S.ui.who : '');
const whoFilter = list => { const f = S.ui.hhWho; return f ? list.filter(x => !x.who || x.who === f) : list; };
const routineDue = () => whoFilter(S.routines).filter(r => daysFromToday(dueOf(r)) <= 0);
const homeDueCount = () => routineDue().length;
const todoDueCount = () => { const t = dkey(new Date()); return S.todos.filter(x => !x.done && x.d && x.d <= t).length; };

/* ───────── Haushalt: Ansicht ───────── */
function viewHome() {
  const tab = S.ui.hh || 'today';
  return `<div class="seg hhseg" style="margin-bottom:12px">${[['today', '✅ Heute'], ['all', '🔁 Routinen'], ['know', '📚 Wissen']].map(([k, l]) => `<button data-act="hhTab" data-v="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div id="hharea">${tab === 'all' ? homeAllHTML() : tab === 'know' ? homeKnowHTML() : homeTodayHTML()}</div>`;
}
const whoChips = () => `<div class="whoseg">${HH_WHO.map(w => `<button class="chip${(S.ui.hhWho || '') === w ? ' on' : ''}" data-act="hhWho" data-v="${w}">${w ? (w === 'Fee' ? '👩 ' : '👨 ') + w : '👫 Alle'}</button>`).join('')}</div>`;
function rtRow(r, opts = {}) {
  const a = AREA_BY[r.a] || AREA_BY.sonst, due = dueOf(r), n = daysFromToday(due);
  return `<div class="rt${n < 0 ? ' late' : ''}" data-id="${esc(r.id)}">
    <button class="check" data-act="rtDone" data-id="${esc(r.id)}" aria-label="${esc(r.n)} erledigt"></button>
    <button class="rt-main" data-act="rtOpen" data-id="${esc(r.id)}"><b>${esc(r.n)}</b>
      <small>${a.e} ${opts.noArea ? '' : esc(a.name) + ' · '}${freqText(r)}${r.mins ? ` · ${r.mins} Min.` : ''}${r.who ? ` · ${r.who === 'Fee' ? '👩' : '👨'} ${esc(r.who)}` : ''}</small></button>
    <span class="rt-due ${n < 0 ? 'late' : n === 0 ? 'now' : ''}">${dueText(due)}</span></div>`;
}
function homeTodayHTML() {
  if (!S.routines.length) return homeStartHTML();
  const list = whoFilter(S.routines).map(r => ({ r, n: daysFromToday(dueOf(r)) })).sort((x, y) => x.n - y.n || x.r.n.localeCompare(y.r.n, 'de'));
  const late = list.filter(x => x.n < 0), today = list.filter(x => x.n === 0), soon = list.filter(x => x.n > 0 && x.n <= 7);
  const mins = [...late, ...today].reduce((a, x) => a + (x.r.mins || 0), 0);
  const t = dkey(new Date()), todos = S.todos.filter(x => !x.done && x.d && x.d <= t);
  const wk = dkey(addDays(new Date(), -6)), stats = {};
  for (const r of S.routines) for (const h of r.hist || []) if (h.d >= wk) { const w = h.who || '–'; stats[w] = (stats[w] || 0) + 1; }
  const done = Object.values(stats).reduce((a, b) => a + b, 0);
  let h = `<section class="card hhsum"><div class="hs-top"><div><b>${late.length + today.length ? `${late.length + today.length} ${late.length + today.length === 1 ? 'Aufgabe' : 'Aufgaben'} fällig` : 'Alles erledigt 🎉'}</b>
      <span>${late.length + today.length ? `ca. ${mins} Minuten${late.length ? ` · ${late.length} überfällig` : ''}` : 'Für heute ist nichts mehr offen.'}</span></div>
      <span class="hs-done" title="In den letzten 7 Tagen erledigt">${done} ✓<small>7 Tage</small></span></div>
      ${stats.Fee || stats.Flo ? `<div class="hs-fair">${['Fee', 'Flo'].map(w => `<span>${w === 'Fee' ? '👩' : '👨'} ${w} <b>${stats[w] || 0}</b></span>`).join('')}</div>` : ''}
      ${whoChips()}</section>`;
  if (late.length) h += `<div class="section-t late">Überfällig</div><div class="card rtlist">${late.map(x => rtRow(x.r)).join('')}</div>`;
  if (today.length) h += `<div class="section-t">Heute</div><div class="card rtlist">${today.map(x => rtRow(x.r)).join('')}</div>`;
  if (todos.length) h += `<div class="section-t">To-dos für heute <button class="tlink" data-act="tab" data-view="todo">alle ansehen</button></div><div class="card rtlist">${todos.map(todoRow).join('')}</div>`;
  if (soon.length) h += `<details class="soon"${S.ui.hhSoon ? ' open' : ''}><summary class="section-t" data-act="hhSoon">Nächste 7 Tage (${soon.length})</summary><div class="card rtlist">${soon.map(x => rtRow(x.r)).join('')}</div></details>`;
  h += `<p class="small muted" style="text-align:center;margin-top:14px">Abhaken setzt die nächste Fälligkeit automatisch. Antippen zeigt Tipps, Häufigkeit und Verschieben.</p>`;
  return h;
}
function homeStartHTML() {
  const basic = ROUTINE_TEMPLATES.filter(t => t.basic);
  return `<div class="card hhstart"><div class="big">🏡</div><b>Haushalt im Griff – mit festen Routinen</b>
    <p>Wiederkehrende Aufgaben mit sinnvoller Häufigkeit: Die App zeigt jeden Tag, was dran ist. Abhaken plant automatisch das nächste Mal.</p>
    <button class="btn primary" data-act="rtStarter">Empfohlene Routinen übernehmen (${basic.length})</button>
    <button class="btn soft" data-act="rtCatalog">Selbst aus ${ROUTINE_TEMPLATES.length} Vorschlägen auswählen</button>
    <p class="small muted">Die Fälligkeiten werden verteilt, damit nicht alles am ersten Tag ansteht. Häufigkeit, Zuständigkeit und Namen kannst du jederzeit anpassen.</p></div>`;
}
function homeAllHTML() {
  let h = `<div class="row" style="margin-bottom:12px"><button class="btn soft" data-act="rtNew">＋ Eigene Routine</button><button class="btn soft" data-act="rtCatalog">💡 Vorschläge</button></div>`;
  if (!S.routines.length) return h + homeStartHTML();
  h += whoChips();
  const list = whoFilter(S.routines);
  for (const a of AREAS) {
    const rs = list.filter(r => (AREA_BY[r.a] ? r.a : 'sonst') === a.k).sort((x, y) => dueOf(x).localeCompare(dueOf(y)));
    if (!rs.length) continue;
    const mins = rs.reduce((s, r) => s + (r.mins || 0) * (r.unit === 'd' ? 7 / r.every : r.unit === 'w' ? 1 / r.every : r.unit === 'm' ? 0.23 / r.every : 0.02 / r.every), 0);
    h += `<div class="section-t">${a.e} ${a.name}<span class="sec-sub">≈ ${fmtInt(mins)} Min./Woche</span></div><div class="card rtlist">${rs.map(r => rtRow(r, { noArea: true })).join('')}</div>`;
  }
  const total = list.reduce((s, r) => s + (r.mins || 0) * (r.unit === 'd' ? 7 / r.every : r.unit === 'w' ? 1 / r.every : r.unit === 'm' ? 0.23 / r.every : 0.02 / r.every), 0);
  h += `<p class="small muted" style="text-align:center;margin-top:14px">${list.length} Routinen · zusammen etwa ${fmtDec(total / 60)} Stunden pro Woche</p>`;
  return h;
}
function knowRows(k, sec) {
  return sec[1].map(row => k.care
    ? `<div class="krow care-row">${CARE[row[0]] || ''}<div><b>${esc(row[1])}</b><span>${esc(row[2])}</span></div></div>`
    : `<div class="krow"><b>${esc(row[0])}</b><span>${esc(row[1])}</span></div>`).join('');
}
function homeKnowHTML() {
  const q = (ui.kq || '').trim().toLowerCase();
  let h = `<div class="search">${ICON.search}<input id="kq" type="search" placeholder="Wissen durchsuchen, z. B. Rotwein, Kalk, Wolle" value="${esc(ui.kq || '')}" autocomplete="off" aria-label="Wissen durchsuchen"></div><div id="karea">`;
  h += knowResults(q) + '</div>';
  return h;
}
function knowResults(q) {
  if (!q) return `<div class="kgrid">${KNOWLEDGE.map(k => `<button class="card kcard" data-act="knowOpen" data-id="${k.id}"><span class="ke">${k.e}</span><b>${esc(k.t)}</b><small>${esc(k.s)}</small></button>`).join('')}</div>`;
  const hits = [];
  for (const k of KNOWLEDGE) for (const sec of k.sec) for (const row of sec[1]) {
    const txt = (k.care ? row.slice(1) : row).join(' ').toLowerCase() + ' ' + sec[0].toLowerCase() + ' ' + k.t.toLowerCase();
    if (q.split(/\s+/).every(w => txt.includes(w))) hits.push([k, sec, row]);
  }
  if (!hits.length) return `<div class="empty"><div class="big">🔍</div><b>Nichts gefunden</b>Versuch ein anderes Stichwort.</div>`;
  return `<div class="card kres">${hits.slice(0, 40).map(([k, sec, row]) => `<button class="krow kr" data-act="knowOpen" data-id="${k.id}">${k.care ? CARE[row[0]] || '' : `<span class="ke">${k.e}</span>`}<div><b>${esc(k.care ? row[1] : row[0])}</b><span>${esc(k.care ? row[2] : row[1])}</span><small>${esc(k.t)} · ${esc(sec[0])}</small></div></button>`).join('')}</div>`;
}
function openKnow(id) {
  const k = KNOW_BY[id]; if (!k) return;
  openSheet({
    title: `${k.e} ${k.t}`, cls: 'wide', left: '<button class="lnk" data-act="closeSheet">Schließen</button>',
    body: `<p class="small muted" style="margin:0 4px 8px">${esc(k.s)}</p><div class="kpage">${k.sec.map(sec => `<div class="ksec"><div class="section-t">${esc(sec[0])}</div><div class="card klist">${knowRows(k, sec)}</div></div>`).join('')}</div>`,
  });
}

/* ───────── Routinen: anlegen, bearbeiten, erledigen ───────── */
// Neue Routinen gleichmäßig verteilen, damit nicht alles am ersten Tag fällig ist
function spreadLast(t) {
  const span = Math.max(1, Math.round((addInterval(dkey(new Date()), t.every, t.unit) - startOfDay(new Date())) / 864e5));
  const off = t.unit === 'd' && t.every === 1 ? span : 1 + Math.floor(Math.random() * span);
  return dkey(addDays(new Date(), off - span));
}
const routineFrom = t => ({ id: uid(), tid: t.tid, n: t.n, a: t.a, every: t.every, unit: t.unit, mins: t.mins, who: '', last: spreadLast(t), hist: [] });
function openCatalog() {
  const have = new Set(S.routines.map(r => r.tid).filter(Boolean));
  const sh = openSheet({
    title: 'Vorschläge für Routinen', cls: 'wide', left: '<button class="lnk" data-act="closeSheet">Fertig</button>',
    body: `<p class="small muted" style="margin:0 4px 10px">Tippen fügt hinzu bzw. entfernt. ⭐ = empfohlene Grundausstattung. Die Häufigkeit ist ein Vorschlag – du kannst sie später ändern.</p>
      ${AREAS.map(a => { const ts = ROUTINE_TEMPLATES.filter(t => t.a === a.k); return ts.length ? `<div class="section-t">${a.e} ${a.name}</div><div class="card catlist">${ts.map(t => `<button class="cat-item${have.has(t.tid) ? ' on' : ''}" data-act="rtToggleTpl" data-tid="${t.tid}"><span class="ci-check"></span><span class="ci-body"><b>${t.basic ? '⭐ ' : ''}${esc(t.n)}</b><small>${freqText(t)} · ${t.mins} Min.</small></span></button>`).join('')}</div>` : ''; }).join('')}`,
    onClose: () => render(),
  });
  return sh;
}
function openRoutine(id) {
  const r = id ? S.routines.find(x => x.id === id) : null;
  if (id && !r) return;
  const v = r || { n: '', a: 'kueche', every: 1, unit: 'w', mins: 10, who: '', last: null };
  const tpl = v.tid && TEMPLATE_BY[v.tid];
  const due = r ? dueOf(r) : null;
  const sh = openSheet({
    title: r ? 'Routine' : 'Neue Routine', guard: true,
    right: '<button class="lnk r" data-act="rtSave">Sichern</button>',
    body: `<form data-form="rtSave" autocomplete="off">
      ${r ? `<div class="rt-status ${daysFromToday(due) < 0 ? 'late' : ''}"><b>Nächstes Mal: ${esc(dueText(due))}</b><span>${fmtDay(fromKey(due))}${r.last ? ` · zuletzt ${esc(dueText(r.last).replace('seit ', 'vor ').replace('heute', 'heute'))}` : ''}</span></div>
      <div class="row" style="margin-bottom:12px"><button type="button" class="btn primary" data-act="rtDoneSheet">✓ Erledigt</button><button type="button" class="btn plain" data-act="rtSnooze" data-n="1">Morgen</button><button type="button" class="btn plain" data-act="rtSnooze" data-n="7">+1 Woche</button></div>` : ''}
      ${tpl && tpl.tip ? `<div class="tipbox">💡 ${esc(tpl.tip)}</div>` : ''}
      <div class="field"><label for="r-n">Aufgabe</label><input id="r-n" required value="${esc(v.n)}" placeholder="z. B. Pflanzen düngen"></div>
      <div class="field"><label>Wie oft?</label><div class="freq"><span>alle</span><span class="stepper" data-stepper="rEvery"><button type="button" data-act="step" data-n="-1" aria-label="Weniger">−</button><output>${v.every}</output><button type="button" data-act="step" data-n="1" aria-label="Mehr">+</button></span>
        <div class="seg" id="r-unit">${Object.entries(UNITS).map(([k, u]) => `<button type="button" data-act="seg" data-v="${k}" class="${v.unit === k ? 'on' : ''}">${u[1]}</button>`).join('')}</div></div></div>
      <div class="row"><div class="field"><label for="r-a">Bereich</label><select id="r-a">${AREAS.map(a => `<option value="${a.k}" ${v.a === a.k ? 'selected' : ''}>${a.e} ${a.name}</option>`).join('')}</select></div>
        <div class="field" style="flex:0 0 110px"><label for="r-m">Minuten</label><input id="r-m" type="number" inputmode="numeric" min="0" value="${esc(v.mins || '')}"></div></div>
      <div class="field"><label>Wer?</label><div class="seg" id="r-who">${HH_WHO.map(w => `<button type="button" data-act="seg" data-v="${w}" class="${(v.who || '') === w ? 'on' : ''}">${w || 'Beide'}</button>`).join('')}</div></div>
      <div class="field"><label for="r-last">Zuletzt erledigt</label><input id="r-last" type="date" value="${esc(v.last || '')}" max="${dkey(new Date())}"><p class="help">Leer = ab heute fällig</p></div>
      <div class="field"><label for="r-notes">Notizen</label><textarea id="r-notes" rows="2" placeholder="z. B. welches Mittel, wo es steht …">${esc(v.notes || '')}</textarea></div>
      ${r && (r.hist || []).length ? `<p class="small muted" style="margin:0 4px 12px">Zuletzt: ${(r.hist || []).slice(-6).reverse().map(x => fmtDay(fromKey(x.d)) + (x.who ? ` (${x.who})` : '')).join(' · ')}</p>` : ''}
      <button class="btn primary" style="width:100%">Speichern</button>
      ${r ? '<button type="button" class="btn danger" style="width:100%;margin-top:6px" data-act="rtDelete">Routine löschen</button>' : ''}
      </form>`,
  });
  sh.dataset.id = r ? r.id : '';
}
function saveRoutine(sh) {
  const n = $('#r-n', sh).value.trim(); if (!n) { toast('Bitte eine Aufgabe eingeben'); return; }
  const unitBtn = $('#r-unit .on', sh), whoBtn = $('#r-who .on', sh), last = $('#r-last', sh).value;
  const data = {
    n, a: AREA_BY[$('#r-a', sh).value] ? $('#r-a', sh).value : 'sonst',
    every: Math.max(1, Math.min(365, stepperVal(sh, 'rEvery'))), unit: unitBtn && UNITS[unitBtn.dataset.v] ? unitBtn.dataset.v : 'w',
    mins: Math.max(0, parseInt($('#r-m', sh).value) || 0), who: whoBtn ? whoBtn.dataset.v : '',
    last: /^\d{4}-\d{2}-\d{2}$/.test(last) && last <= dkey(new Date()) ? last : null, notes: $('#r-notes', sh).value.trim(),
  };
  const id = sh.dataset.id, r = id && S.routines.find(x => x.id === id);
  if (r) { const lastChanged = r.last !== data.last; Object.assign(r, data); if (lastChanged) delete r.snooze; if (!data.notes) delete r.notes; }
  else S.routines.push({ id: uid(), ...data, hist: [] });
  save(); closeSheet(true); render();
  toast(r ? 'Routine gespeichert' : 'Routine angelegt');
}
function doneRoutine(id, fromSheet) {
  const r = S.routines.find(x => x.id === id); if (!r) return;
  const prev = { last: r.last, snooze: r.snooze, hist: [...(r.hist || [])] };
  r.last = dkey(new Date()); delete r.snooze;
  r.hist = [...(r.hist || []), { d: r.last, who: meWho() }].slice(-12);
  save();
  if (navigator.vibrate) navigator.vibrate(10);
  if (fromSheet) closeSheet(true);
  const row = $(`.rt[data-id="${CSS.escape(id)}"]`);
  const finish = () => { render(); toast(`✓ ${r.n} – nächstes Mal ${dueText(dueOf(r))}`, { label: 'Rückgängig', fn: () => { Object.assign(r, prev); if (!prev.snooze) delete r.snooze; save(); render(); } }); };
  if (row && !fromSheet) { row.classList.add('done'); setTimeout(finish, 260); } else finish();
}

/* ───────── To-dos ───────── */
const TD_KEY = 'tdDate'; // gewählter Tag für neue Aufgaben (nur in dieser Sitzung)
function todoRow(x) {
  const late = x.d && !x.done && x.d < dkey(new Date());
  return `<div class="rt td${x.done ? ' done' : ''}${late ? ' late' : ''}" data-id="${esc(x.id)}">
    <button class="check" data-act="todoToggle" data-id="${esc(x.id)}" aria-label="${x.done ? 'Wieder offen' : 'Erledigt'}"></button>
    <button class="rt-main" data-act="todoEdit" data-id="${esc(x.id)}"><b>${esc(x.t)}</b>${x.who || x.notes || late ? `<small>${late ? `⏰ ${esc(dueText(x.d))}` : ''}${x.who ? `${late ? ' · ' : ''}${x.who === 'Fee' ? '👩' : '👨'} ${esc(x.who)}` : ''}${x.notes ? `${late || x.who ? ' · ' : ''}📝 ${esc(x.notes.slice(0, 60))}` : ''}</small>` : ''}</button></div>`;
}
function dateChips(sel, act) {
  const t = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i));
  return `${days.map((d, i) => { const k = dkey(d); return `<button type="button" class="chip${sel === k ? ' on' : ''}" data-act="${act}" data-d="${k}">${i === 0 ? 'Heute' : i === 1 ? 'Morgen' : wdShort(d) + ' ' + d.getDate() + '.'}</button>`; }).join('')}<button type="button" class="chip${sel === '' ? ' on' : ''}" data-act="${act}" data-d="">Irgendwann</button>`;
}
function babyTodosLocal() {
  try { const b = JSON.parse(lsGet('baby.v1')); return Array.isArray(b && b.todos) ? b.todos : []; } catch (e) { return []; }
}
function babyImportable() {
  const have = new Set(S.todos.map(x => x.id));
  return [...new Map([...babyTodosLocal(), ...(ui.babyCloud || [])].filter(x => isObj(x) && isStr(x.id) && isStr(x.t) && !x.done).map(x => [x.id, x])).values()].filter(x => !have.has(x.id));
}
function viewTodo() {
  if (ui[TD_KEY] === undefined) ui[TD_KEY] = dkey(new Date());
  const sel = ui[TD_KEY], today = dkey(new Date()), onlyOpen = S.ui.todoFilter !== 'all';
  const groups = [], add = (title, list, cls = '') => { if (list.length) groups.push(`<div class="section-t ${cls}">${title}<span class="sec-sub">${list.length}</span></div><div class="card rtlist">${list.map(todoRow).join('')}</div>`); };
  const open = S.todos.filter(x => !x.done), order = (a, b) => (a.o ?? 1e9) - (b.o ?? 1e9) || String(a.id).localeCompare(String(b.id));
  add('Überfällig', open.filter(x => x.d && x.d < today).sort((a, b) => a.d.localeCompare(b.d) || order(a, b)), 'late');
  for (let i = 0; i < 7; i++) {
    const d = addDays(new Date(), i), k = dkey(d);
    add(i === 0 ? 'Heute' : i === 1 ? 'Morgen' : `${DAYS[(d.getDay() + 6) % 7]}, ${fmtDay(d)}`, open.filter(x => x.d === k).sort(order));
  }
  const later = dkey(addDays(new Date(), 7));
  add('Später', open.filter(x => x.d && x.d >= later).sort((a, b) => a.d.localeCompare(b.d) || order(a, b)));
  add('Irgendwann', open.filter(x => !x.d).sort(order));
  const doneRecent = S.todos.filter(x => x.done && (x.doneAt || 0) > Date.now() - 14 * 864e5).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const imp = S.ui.babyHide ? [] : babyImportable();
  let h = `<form class="addbar" data-form="todo"><input id="tdText" placeholder="Neue Aufgabe …" autocomplete="off" enterkeyhint="done" aria-label="Neue Aufgabe"><button class="btn primary" aria-label="Hinzufügen" style="font-size:24px">+</button></form>
    <div class="chips tdchips">${dateChips(sel, 'todoDate')}</div>`;
  if (imp.length) h += `<div class="hint"><span style="font-size:22px">🍼</span><div><b>${imp.length} offene ${imp.length === 1 ? 'Aufgabe' : 'Aufgaben'} aus dem Baby-Tagebuch</b>Die To-do-Liste ist jetzt hier. Übernehmen kopiert sie – im Baby-Tagebuch wird nichts gelöscht.<div class="row" style="margin-top:8px"><button class="btn primary" data-act="babyImport">Übernehmen</button><button class="btn plain" data-act="babyHide">Nein danke</button></div></div></div>`;
  h += groups.join('') || `<div class="empty"><div class="big">📝</div><b>Keine offenen Aufgaben</b>Oben eintippen – mit Tag oder für „Irgendwann“.</div>`;
  if (doneRecent.length) h += `<details class="soon"${!onlyOpen ? ' open' : ''}><summary class="section-t" data-act="todoShowDone">Erledigt (letzte 14 Tage) <span class="sec-sub">${doneRecent.length}</span></summary><div class="card rtlist">${doneRecent.map(todoRow).join('')}</div></details>`;
  return h;
}
function openTodo(id) {
  const x = S.todos.find(t => t.id === id); if (!x) return;
  const sh = openSheet({
    title: 'Aufgabe', guard: true, right: '<button class="lnk r" data-act="todoSave">Sichern</button>',
    body: `<form data-form="todoSave" autocomplete="off">
      <div class="field"><label for="t-t">Aufgabe</label><input id="t-t" value="${esc(x.t)}" required></div>
      <div class="field"><label>Wann?</label><div class="chips wrapchips" id="t-d">${dateChips(x.d || '', 'todoPickDate')}</div>
        <input id="t-date" type="date" value="${esc(x.d || '')}" style="margin-top:8px" aria-label="Datum wählen"></div>
      <div class="field"><label>Wer?</label><div class="seg" id="t-who">${HH_WHO.map(w => `<button type="button" data-act="seg" data-v="${w}" class="${(x.who || '') === w ? 'on' : ''}">${w || 'Beide'}</button>`).join('')}</div></div>
      <div class="field"><label for="t-n">Notizen</label><textarea id="t-n" rows="3">${esc(x.notes || '')}</textarea></div>
      <button class="btn primary" style="width:100%">Speichern</button>
      <div class="row" style="margin-top:8px"><button type="button" class="btn plain" data-act="todoToRoutine">🔁 Regelmäßig wiederholen</button><button type="button" class="btn danger" data-act="todoDelete">Löschen</button></div>
      </form>`,
  });
  sh.dataset.id = id;
}

/* ───────── Aktionen ───────── */
Object.assign(ACT, {
  hhTab(el) { S.ui.hh = el.dataset.v; saveUI(); render(); window.scrollTo(0, 0); },
  hhWho(el) { S.ui.hhWho = el.dataset.v; saveUI(); render(); },
  hhSoon(el, e) { e.preventDefault(); const d = el.closest('details'); d.open = !d.open; S.ui.hhSoon = d.open; saveUI(); },
  rtStarter() {
    const add = ROUTINE_TEMPLATES.filter(t => t.basic && !S.routines.some(r => r.tid === t.tid)).map(routineFrom);
    S.routines.push(...add); save(); render();
    toast(`${add.length} Routinen übernommen – heute ${homeDueCount()} fällig`, { label: 'Rückgängig', fn: () => { const ids = new Set(add.map(r => r.id)); S.routines = S.routines.filter(r => !ids.has(r.id)); bulkOk(); save(); render(); } });
  },
  rtCatalog() { openCatalog(); },
  rtToggleTpl(el) {
    const t = TEMPLATE_BY[el.dataset.tid]; if (!t) return;
    const i = S.routines.findIndex(r => r.tid === t.tid);
    if (i >= 0) S.routines.splice(i, 1); else S.routines.push(routineFrom(t));
    save(); el.classList.toggle('on', i < 0);
  },
  rtNew() { openRoutine(null); },
  rtOpen(el) { openRoutine(el.dataset.id); },
  rtSave() { saveRoutine(topSheet()); },
  rtDone(el) { doneRoutine(el.dataset.id); },
  rtDoneSheet() { doneRoutine(topSheet().dataset.id, true); },
  rtSnooze(el) {
    const sh = topSheet(), r = S.routines.find(x => x.id === sh.dataset.id); if (!r) return;
    r.snooze = dkey(addDays(new Date(), +el.dataset.n)); save(); closeSheet(true); render();
    toast(`Verschoben auf ${dueText(r.snooze)}`);
  },
  rtDelete() {
    const sh = topSheet(), r = S.routines.find(x => x.id === sh.dataset.id); if (!r) return;
    confirmSheet(`Routine „${r.n}“ löschen?`, 'Löschen', () => {
      const i = S.routines.indexOf(r); S.routines.splice(i, 1); save(); closeAllSheets(); render();
      toast('Routine gelöscht', { label: 'Rückgängig', fn: () => { S.routines.splice(Math.min(i, S.routines.length), 0, r); save(); render(); } });
    });
  },
  knowOpen(el) { openKnow(el.dataset.id); },

  todoDate(el) { ui[TD_KEY] = el.dataset.d; $$('.tdchips .chip').forEach(b => b.classList.toggle('on', b === el)); const i = $('#tdText'); if (i) i.focus(); },
  todoPickDate(el) { const sh = topSheet(); $$('#t-d .chip', sh).forEach(b => b.classList.toggle('on', b === el)); $('#t-date', sh).value = el.dataset.d; },
  todoToggle(el) {
    const x = S.todos.find(t => t.id === el.dataset.id); if (!x) return;
    x.done = !x.done; if (x.done) x.doneAt = Date.now(); else delete x.doneAt;
    save();
    if (navigator.vibrate && x.done) navigator.vibrate(8);
    const row = el.closest('.rt'); if (row && x.done) row.classList.add('done');
    setTimeout(() => { const y = window.scrollY; render(); window.scrollTo(0, y); }, x.done ? 240 : 0);
    if (x.done) toast(`✓ ${x.t}`, { label: 'Rückgängig', fn: () => { x.done = false; delete x.doneAt; save(); render(); } });
  },
  todoEdit(el) { openTodo(el.dataset.id); },
  todoSave() {
    const sh = topSheet(), x = S.todos.find(t => t.id === sh.dataset.id); if (!x) { closeSheet(true); return; }
    const t = $('#t-t', sh).value.trim(); if (!t) { toast('Bitte einen Text eingeben'); return; }
    const d = $('#t-date', sh).value, w = $('#t-who .on', sh);
    x.t = t; x.d = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; x.who = w ? w.dataset.v : '';
    const n = $('#t-n', sh).value.trim(); if (n) x.notes = n; else delete x.notes;
    if (!x.who) delete x.who;
    save(); closeSheet(true); render();
  },
  todoDelete() {
    const sh = topSheet(), i = S.todos.findIndex(t => t.id === sh.dataset.id); if (i < 0) return;
    const x = S.todos[i]; S.todos.splice(i, 1); save(); closeSheet(true); render();
    toast('Aufgabe gelöscht', { label: 'Rückgängig', fn: () => { S.todos.splice(Math.min(i, S.todos.length), 0, x); save(); render(); } });
  },
  todoToRoutine() {
    const sh = topSheet(), x = S.todos.find(t => t.id === sh.dataset.id); if (!x) return;
    const r = { id: uid(), n: x.t, a: 'sonst', every: 1, unit: 'w', mins: 10, who: x.who || '', last: null, hist: [] };
    S.routines.push(r); S.todos = S.todos.filter(t => t !== x); save(); closeSheet(true);
    S.ui.view = 'home'; S.ui.hh = 'all'; saveUI(); render();
    setTimeout(() => openRoutine(r.id), 200);
    toast('Als Routine angelegt – jetzt Häufigkeit einstellen');
  },
  todoShowDone(el, e) { e.preventDefault(); const d = el.closest('details'); d.open = !d.open; S.ui.todoFilter = d.open ? 'all' : 'open'; saveUI(); },
  babyImport() {
    const imp = babyImportable(); if (!imp.length) return;
    S.todos.push(...imp.map(x => ({ id: x.id, t: x.t, done: false, d: /^\d{4}-\d{2}-\d{2}$/.test(x.d || '') ? x.d : null, ...(isNum(x.o) ? { o: x.o } : {}), src: 'baby' })));
    S.ui.babyHide = true; save(); render();
    toast(`${imp.length} Aufgaben übernommen`);
  },
  babyHide() { S.ui.babyHide = true; saveUI(); render(); },
});
FORMS.todo = f => {
  const inp = $('#tdText', f), t = inp.value.trim(); if (!t) return;
  const d = ui[TD_KEY] || null, o = Math.max(0, ...S.todos.map(x => x.o || 0)) + 1;
  S.todos.push({ id: uid(), t, done: false, d, o });
  save(); render();
  const i = $('#tdText'); if (i) i.focus();
  toast(`Hinzugefügt${d ? ' für ' + (d === dkey(new Date()) ? 'heute' : dueText(d)) : ''}`);
};
FORMS.rtSave = () => saveRoutine(topSheet());
FORMS.todoSave = () => ACT.todoSave();
document.addEventListener('input', e => {
  if (e.target.id === 'kq') { ui.kq = e.target.value; const a = $('#karea'); if (a) a.innerHTML = knowResults(ui.kq.trim().toLowerCase()); }
  if (e.target.id === 't-date') { const sh = topSheet(); $$('#t-d .chip', sh).forEach(b => b.classList.toggle('on', b.dataset.d === e.target.value)); }
});
// Offene Baby-Aufgaben auch aus der Online-Datenbank anbieten (andere Geräte, Home-Bildschirm-App)
function loadBabyCloud() {
  if (!window.Cloud || !Cloud.peek || !Cloud.isOn() || S.ui.babyHide || ui.babyCloud) return;
  ui.babyCloud = [];
  Cloud.peek('baby', 'todo').then(list => { ui.babyCloud = list; if (S.ui.view === 'todo' && babyImportable().length) render(); }).catch(() => { ui.babyCloud = null; });
}
