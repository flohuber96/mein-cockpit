'use strict';
/* ───────── To-do: Wochenansicht, Verschieben per Ziehen, Filter ─────────
   Aufgabe: { id, t: Text, done, doneAt, d: 'JJJJ-MM-TT' oder null (= Irgendwann), o: Reihenfolge }
   Wird vor app.js geladen; app.js übernimmt TODO_ACT und TODO_FORMS. */

const TD = { week: null, target: undefined }; // angezeigte Woche (Montag), Ziel-Tag für neue Aufgaben
const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WD_L = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const wdIdx = d => (d.getDay() + 6) % 7;
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - wdIdx(x)); return x; }
function isoWeekNo(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
const tdSort = list => [...list].sort((a, b) => (a.o ?? 1e9) - (b.o ?? 1e9) || a.id.localeCompare(b.id));
const todosOf = day => tdSort(S.todos.filter(t => (t.d || '') === day));
function dayLabel(key) {
  if (!key) return 'Irgendwann';
  const today = dkey(new Date());
  if (key === today) return 'Heute';
  if (key === dkey(addDays(new Date(), 1))) return 'Morgen';
  if (key === dkey(addDays(new Date(), -1))) return 'Gestern';
  const d = fromKey(key); return `${WD[wdIdx(d)]}, ${d.getDate()}.${d.getMonth() + 1}.`;
}
// Fällig = offen und heute oder früher (für das Abzeichen in der Tab-Leiste)
const todoDueCount = () => { const today = dkey(new Date()); return S.todos.filter(t => !t.done && t.d && t.d <= today).length; };
const weekDays = () => { const ws = fromKey(TD.week); return [0, 1, 2, 3, 4, 5, 6].map(i => dkey(addDays(ws, i))); };

function todoItemHTML(t, showDate) {
  return `<div class="item ${t.done ? 'done' : ''}" data-id="${t.id}">
    <button class="check" data-act="todoToggle" data-id="${t.id}" aria-label="${t.done ? 'Wieder offen' : 'Erledigt'}"></button>
    <button class="txt" data-act="todoEdit" data-id="${t.id}">${esc(t.t)}${showDate ? `<small>${esc(dayLabel(t.d))}</small>` : ''}</button>
    <span class="grip" data-grip aria-label="Verschieben" role="button"><svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></span>
  </div>`;
}

function viewTodo() {
  const today = dkey(new Date());
  if (!TD.week) TD.week = dkey(mondayOf(new Date()));
  const days = weekDays(), isCur = days.includes(today);
  if (TD.target === undefined || (TD.target && !days.includes(TD.target))) TD.target = isCur ? today : '';
  const onlyOpen = S.ui.todoFilter === 'open';
  const vis = list => onlyOpen ? list.filter(t => !t.done) : list;
  const ws = fromKey(TD.week), we = addDays(ws, 6);
  const range = ws.getMonth() === we.getMonth() ? `${ws.getDate()}.–${fmtDate(we)}` : `${fmtDate(ws)} – ${fmtDate(we)}`;

  let h = `<div class="daynav" style="margin-top:2px">
    <button class="icon-btn" data-act="todoWeek" data-n="-1" aria-label="Vorherige Woche">‹</button>
    <button class="daylabel" data-act="todoWeekNow"><b>KW ${isoWeekNo(ws)}${isCur ? '' : ' <small class="tback">→ heute</small>'}</b><span>${range}</span></button>
    <button class="icon-btn" data-act="todoWeek" data-n="1" aria-label="Nächste Woche">›</button></div>`;

  // Neue Aufgabe + Ziel-Tag
  h += `<form class="addbar" data-form="todo"><input name="t" placeholder="Neue Aufgabe für ${esc(dayLabel(TD.target))} …" autocomplete="off" enterkeyhint="done"><button class="btn primary" aria-label="Hinzufügen">+</button></form>
  <div class="chiprow tgt"><span class="lbl">Für</span>
    ${days.map(k => `<button type="button" class="chip ${TD.target === k ? 'on' : ''} ${k === today ? 'today' : ''}" data-act="todoTarget" data-day="${k}">${WD[wdIdx(fromKey(k))]} ${fromKey(k).getDate()}.</button>`).join('')}
    <button type="button" class="chip ${TD.target === '' ? 'on' : ''}" data-act="todoTarget" data-day="">Irgendwann</button>
  </div>`;

  // Filter
  const doneWeek = [...days, ''].reduce((n, k) => n + todosOf(k).filter(t => t.done).length, 0);
  h += `<div class="tfilter"><div class="seg">
      <button data-act="todoFilter" data-v="all" class="${onlyOpen ? '' : 'on'}">Alle</button>
      <button data-act="todoFilter" data-v="open" class="${onlyOpen ? 'on' : ''}">Offen</button></div>
    <span>${onlyOpen && doneWeek ? `${doneWeek} erledigt ausgeblendet` : doneWeek ? `<button data-act="todoClearDone">Erledigte löschen</button>` : ''}</span></div>`;

  // Überfällig (nur in der aktuellen Woche)
  if (isCur) {
    const over = tdSort(S.todos.filter(t => !t.done && t.d && t.d < days[0])).sort((a, b) => a.d.localeCompare(b.d));
    if (over.length) h += `<div class="card tday over"><div class="tday-h"><b>⚠︎ Überfällig</b><em>${over.length}</em></div><div class="olist">${over.map(t => todoItemHTML(t, true)).join('')}</div></div>`;
  }

  // Wochentage + Irgendwann
  for (const k of [...days, '']) {
    const all = todosOf(k), list = vis(all), d = k ? fromKey(k) : null;
    const done = all.filter(t => t.done).length;
    const cls = !k ? 'some' : k === today ? 'today' : k < today ? 'past' : '';
    h += `<div class="card tday ${cls}">
      <div class="tday-h"><b>${k ? WD_L[wdIdx(d)] : '📌 Irgendwann'}</b>${k ? `<small>${fmtDate(d)}</small>` : ''}${k === today ? '<i>Heute</i>' : ''}
        ${all.length ? `<em class="${done === all.length ? 'full' : ''}">${done}/${all.length}</em>` : ''}
        <button class="tplus" data-act="todoAddTo" data-day="${k}" aria-label="Aufgabe für ${esc(dayLabel(k))}">+</button></div>
      <div class="tlist" data-day="${k}"><div class="tempty">${all.length ? 'Alles erledigt ✓' : 'Nichts geplant'}</div>${list.map(t => todoItemHTML(t)).join('')}</div>
    </div>`;
  }
  h += `<p class="small muted thint">Tippen = erledigt · Text antippen = bearbeiten · <b>⋮⋮</b> gedrückt halten und ziehen = verschieben</p>`;

  const have = new Set(S.todos.map(t => t.t));
  const sugg = TODO_SUGG.filter(s => !have.has(s));
  if (sugg.length) h += `<details class="tsugg" ${S.todos.length ? '' : 'open'}><summary>Vorschläge</summary><div class="sugg">${sugg.map(s => `<button class="chip" data-act="todoSugg" data-t="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div></details>`;
  return h;
}

/* ── Hilfen ── */
function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }
const snapshot = () => S.todos.map(t => ({ ...t }));
function undoTodos(msg, before) { toast(msg, { label: 'Rückgängig', fn: () => { S.todos = before; save(); keepScroll(render); } }); }
const nextOrder = day => todosOf(day).reduce((m, t) => Math.max(m, t.o ?? -1), -1) + 1;
function setTarget(day) {
  TD.target = day;
  $$('.tgt .chip').forEach(c => c.classList.toggle('on', c.dataset.day === day));
  const inp = $('.addbar input'); if (inp) inp.placeholder = `Neue Aufgabe für ${dayLabel(day)} …`;
}
function editBody(t) {
  const days = weekDays(), today = dkey(new Date()), tom = dkey(addDays(new Date(), 1));
  const opts = [['', 'Irgendwann'], [today, 'Heute'], [tom, 'Morgen'], ...days.filter(k => k !== today && k !== tom).map(k => [k, dayLabel(k)])];
  return `<form data-form="todoEdit" data-id="${t.id}">
    <div class="field"><input name="t" value="${esc(t.t)}" required enterkeyhint="done"></div>
    <div class="field"><label>Wann?</label><div class="chiprow wrap">${opts.map(([k, n]) => `<button type="button" class="chip ${(t.d || '') === k ? 'on' : ''}" data-act="todoPick" data-day="${k}">${esc(n)}</button>`).join('')}</div></div>
    <div class="field"><label>Anderes Datum</label><input type="date" name="d" value="${t.d || ''}" data-change="todoDate"></div>
    <div class="stack">
      <button class="btn primary">Speichern</button>
      <button type="button" class="btn plain" data-act="todoToggleSheet" data-id="${t.id}">${t.done ? '↩︎ Wieder offen' : '✓ Erledigt'}</button>
      <button type="button" class="btn danger" data-act="todoDel" data-id="${t.id}">Aufgabe löschen</button>
    </div></form>`;
}

const TODO_ACT = {
  todoWeek(el) { TD.week = dkey(addDays(fromKey(TD.week), 7 * el.dataset.n)); TD.target = undefined; render(); },
  todoWeekNow() { TD.week = null; TD.target = undefined; render(); },
  todoTarget(el) { setTarget(el.dataset.day); vib(); },
  todoAddTo(el) {
    setTarget(el.dataset.day);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => $('.addbar input')?.focus(), 250);
  },
  todoFilter(el) { S.ui.todoFilter = el.dataset.v; save(true); keepScroll(render); },
  todoToggle(el) {
    const t = S.todos.find(x => x.id === el.dataset.id); if (!t) return;
    t.done = !t.done; t.doneAt = t.done ? Date.now() : null;
    vib(); save(); keepScroll(render);
  },
  todoToggleSheet(el) { TODO_ACT.todoToggle(el); closeSheet(); },
  todoEdit(el) {
    const t = S.todos.find(x => x.id === el.dataset.id); if (!t) return;
    openSheet({ title: 'Aufgabe', body: editBody(t) });
  },
  todoPick(el) {
    const f = el.closest('form');
    $$('.chip', f).forEach(c => c.classList.toggle('on', c === el));
    f.d.value = el.dataset.day;
  },
  todoDel(el) {
    const before = snapshot();
    S.todos = S.todos.filter(t => t.id !== el.dataset.id); save();
    closeAllSheets(); keepScroll(render); undoTodos('Aufgabe gelöscht', before);
  },
  todoClearDone() {
    const before = snapshot(), keys = new Set([...weekDays(), '']);
    const n = S.todos.filter(t => t.done && keys.has(t.d || '')).length;
    S.todos = S.todos.filter(t => !(t.done && keys.has(t.d || ''))); save();
    keepScroll(render); undoTodos(`${n} erledigte gelöscht`, before);
  },
  todoSugg(el) {
    const d = TD.target || '';
    S.todos.push({ id: uid(), t: el.dataset.t, done: false, d: d || null, o: nextOrder(d) });
    vib(); save(); keepScroll(render); toast(`Hinzugefügt: ${dayLabel(d)}`);
  },
};

const TODO_FORMS = {
  todo(form) {
    const t = form.t.value.trim(); if (!t) return;
    const d = TD.target || '';
    S.todos.push({ id: uid(), t, done: false, d: d || null, o: nextOrder(d) });
    save(); keepScroll(render);
    setTimeout(() => $('.addbar input')?.focus(), 0);
  },
  todoEdit(form) {
    const t = S.todos.find(x => x.id === form.dataset.id), v = form.t.value.trim();
    if (t && v) {
      const nd = form.d.value || null;
      if ((t.d || '') !== (nd || '')) { t.d = nd; t.o = nextOrder(nd || ''); }
      t.t = v; save();
    }
    closeSheet(); keepScroll(render);
  },
};
// Datum im Bearbeiten-Fenster gewählt → passenden Chip markieren
document.addEventListener('change', e => {
  if (e.target.dataset.change !== 'todoDate') return;
  const f = e.target.closest('form');
  $$('[data-act=todoPick]', f).forEach(c => c.classList.toggle('on', c.dataset.day === e.target.value));
});

/* ── Ziehen & Ablegen (Griff ⋮⋮) ── */
const drag = { on: false };
document.addEventListener('pointerdown', e => {
  const g = e.target.closest('[data-grip]'); if (!g || drag.on) return;
  const item = g.closest('.item'); if (!item) return;
  e.preventDefault();
  const r = item.getBoundingClientRect();
  const ghost = item.cloneNode(true);
  ghost.classList.add('ghost');
  ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px`;
  document.body.appendChild(ghost);
  item.classList.add('ph');
  Object.assign(drag, { on: true, item, ghost, dy: e.clientY - r.top, x: e.clientX, y: e.clientY, pid: e.pointerId, moved: false, from: item.parentElement, next: item.nextSibling });
  document.body.classList.add('dragging');
  vib(12);
  requestAnimationFrame(autoScroll);
});
document.addEventListener('pointermove', e => {
  if (!drag.on || e.pointerId !== drag.pid) return;
  e.preventDefault();
  if (Math.abs(e.clientY - drag.y) > 3) drag.moved = true;
  drag.x = e.clientX; drag.y = e.clientY;
  drag.ghost.style.top = (e.clientY - drag.dy) + 'px';
  placeAt(drag.x, drag.y);
}, { passive: false });
function placeAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const list = el && el.closest('.tlist'); if (!list) return;
  let before = null;
  for (const it of list.querySelectorAll('.item:not(.ph)')) {
    const r = it.getBoundingClientRect();
    if (y < r.top + r.height / 2) { before = it; break; }
  }
  if (before) { if (drag.item.nextSibling !== before) list.insertBefore(drag.item, before); }
  else if (list.lastElementChild !== drag.item) list.appendChild(drag.item);
}
function autoScroll() {
  if (!drag.on) return;
  const top = 110, bottom = window.innerHeight - 140;
  if (drag.y < top) { window.scrollBy(0, -Math.ceil((top - drag.y) / 6)); placeAt(drag.x, drag.y); }
  else if (drag.y > bottom) { window.scrollBy(0, Math.ceil((drag.y - bottom) / 6)); placeAt(drag.x, drag.y); }
  requestAnimationFrame(autoScroll);
}
function dragEnd(e) {
  if (!drag.on || (e.pointerId !== undefined && e.pointerId !== drag.pid)) return;
  drag.on = false;
  document.body.classList.remove('dragging');
  drag.ghost.remove(); drag.item.classList.remove('ph');
  const list = drag.item.closest('.tlist');
  if (!drag.moved || !list || e.type === 'pointercancel') { drag.from.insertBefore(drag.item, drag.next); return; }
  const t = S.todos.find(x => x.id === drag.item.dataset.id); if (!t) return;
  const before = snapshot(), oldDay = t.d || '', day = list.dataset.day;
  t.d = day || null;
  // Neue Reihenfolge: sichtbare Aufgaben wie abgelegt, ausgeblendete (Filter) dahinter
  const ids = [...list.querySelectorAll('.item')].map(i => i.dataset.id);
  const hidden = todosOf(day).filter(x => !ids.includes(x.id)).map(x => x.id);
  [...ids, ...hidden].forEach((id, i) => { const x = S.todos.find(y => y.id === id); if (x) x.o = i; });
  vib(10); save(); keepScroll(render);
  if (oldDay !== day) undoTodos(`Verschoben: ${dayLabel(day)}`, before);
}
document.addEventListener('pointerup', dragEnd);
document.addEventListener('pointercancel', dragEnd);
