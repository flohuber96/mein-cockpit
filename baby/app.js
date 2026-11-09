'use strict';

/* ───────── Helfer ───────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const hm = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const MIN = 6e4, HOUR = 36e5, DAY = 864e5;
const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DAYS_S = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
const num = n => String(Math.round(n * 10) / 10).replace('.', ',');

function fmtDur(ms) {
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 1) return '< 1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${pad(r)}` : `${h} h`;
}
const fmtClock = ms => {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600);
  return (h ? h + ':' + pad(Math.floor(s / 60) % 60) : Math.floor(s / 60)) + ':' + pad(s % 60);
};
function fmtAge(birth) {
  if (!birth) return '';
  const b = fromKey(birth), now = new Date();
  const days = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - b) / DAY);
  if (days < 0) return '';
  if (days < 14) return days === 1 ? '1 Tag' : `${days} Tage`;
  if (days < 7 * 9) { const w = Math.floor(days / 7), d = days % 7; return `${w} Wo.` + (d ? ` ${d} T.` : ''); }
  let months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth();
  if (now.getDate() < b.getDate()) months--;
  const rest = Math.floor((now - new Date(b.getFullYear(), b.getMonth() + months, b.getDate())) / DAY / 7);
  if (months < 24) return `${months} Mon.` + (rest ? ` ${rest} Wo.` : '');
  return `${Math.floor(months / 12)} J. ${months % 12} Mon.`;
}
const vib = n => { if (navigator.vibrate) navigator.vibrate(n || 8); };

/* ───────── Arten ───────── */
const KINDS = [
  { k: 'brust', name: 'Brust', e: '🤱' },
  { k: 'flasche', name: 'Flasche', e: '🍼' },
  { k: 'zusatz', name: 'Zusatz', e: '🥄' },
  { k: 'schlaf', name: 'Schlaf', e: '😴' },
];
const kind = k => KINDS.find(x => x.k === k);
const FEED = ['brust', 'flasche', 'zusatz'];
const isFeed = x => x.kinds.some(k => FEED.includes(k));
const isSleep = x => x.kinds.includes('schlaf');
const isBreast = x => x.kinds.includes('brust');
const kindNames = x => x.kinds.map(k => kind(k).name).join(' + ');
const TODO_SUGG = ['Geburtsurkunde beantragen', 'Bei der Krankenkasse anmelden', 'Kindergeld beantragen', 'Elterngeld beantragen', 'U-Untersuchung vereinbaren', 'Hebamme anrufen', 'Windeln kaufen', 'Pre-Nahrung kaufen', 'Vitamin D nachkaufen', 'Fotos an Familie schicken'];

/* ───────── State ───────── */
const KEY = 'baby.v1';
function fresh() {
  return {
    v: 1, log: [], todos: [], growth: [], vitd: {},
    settings: { name: '', birth: '', theme: 'auto', vitd: true },
    ui: { view: 'today' },
  };
}
function migrate(s) {
  const f = fresh();
  return { ...f, ...s, settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui } };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* ignore */ }
  return fresh();
}
let S = load();
function save(fromServer) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  updateBadge();
  if (!fromServer && window.Cloud) Cloud.soon(); // Änderung an die Online-Datenbank schicken
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const ui = { day: dkey(new Date()), statSel: {}, lastDay: dkey(new Date()) };

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#111014' : '#f5f3fa';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ───────── Auswertung ───────── */
const sorted = () => [...S.log].sort((a, b) => b.s - a.s);
const running = () => S.log.filter(x => x.run && !x.e).sort((a, b) => a.s - b.s);
const endOf = x => x.e || (x.run ? Date.now() : x.s);
const lastWhere = fn => sorted().find(fn);

function nextSide() {
  const last = lastWhere(x => isBreast(x) && x.side.length);
  if (!last) return null;
  const s = last.side;
  // Nur eine Seite → nächstes Mal die andere. Beide → mit der zuletzt gegebenen anfangen.
  return s.length === 1 ? (s[0] === 'L' ? 'R' : 'L') : s[s.length - 1];
}

function dayStats(key) {
  const d0 = fromKey(key).getTime(), d1 = addDays(fromKey(key), 1).getTime();
  const st = { feeds: 0, ml: 0, breastMin: 0, sleepMs: 0, pee: 0, poo: 0, L: 0, R: 0 };
  for (const x of S.log) {
    const inDay = x.s >= d0 && x.s < d1;
    if (isSleep(x)) { const a = Math.max(x.s, d0), b = Math.min(endOf(x), d1); if (b > a) st.sleepMs += b - a; }
    if (!inDay) continue;
    if (isFeed(x)) st.feeds++;
    if (x.ml) st.ml += x.ml;
    if (isBreast(x) && (x.e || x.run)) st.breastMin += (endOf(x) - x.s) / MIN;
    if (isBreast(x)) { if (x.side.includes('L')) st.L++; if (x.side.includes('R')) st.R++; }
    if (x.pee) st.pee++;
    if (x.poo) st.poo++;
  }
  return st;
}

/* ───────── Toast ───────── */
let toastT;
const pending = {};
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button data-act="toastAct">${esc(action.label)}</button>` : '');
  pending.toast = action ? action.fn : null;
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 4500 : 2200);
}

/* ───────── Sheets ───────── */
const sheetStack = [];
function openSheet({ title = '', right = '', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head"><button class="lnk" data-act="closeSheet">Abbrechen</button><b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  const entry = { ov, sh, onClose, t: Date.now() };
  ov.addEventListener('click', () => { if (Date.now() - entry.t > 450) closeSheet(); });
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  sheetStack.push(entry);
  const head = $('.sheet-head', sh); let y0 = null, dy = 0;
  head.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
  head.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeSheet(); y0 = null; });
  return sh;
}
function closeSheet() {
  const e = sheetStack.pop(); if (!e) return;
  e.ov.classList.remove('show'); e.sh.classList.remove('show');
  setTimeout(() => { e.ov.remove(); e.sh.remove(); }, 320);
  if (!sheetStack.length) document.body.classList.remove('locked');
  if (e.onClose) e.onClose();
}
function closeAllSheets() { while (sheetStack.length) closeSheet(); }
function confirmSheet(text, okLabel, onOk) {
  openSheet({
    title: 'Bist du sicher?', body: `<p style="text-align:center;font-size:16px;margin:6px 8px 18px">${esc(text)}</p><div class="stack">
      <button class="btn primary" data-act="confirmOk">${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`,
  });
  pending.confirm = onOk;
}

/* ───────── Eingabe-Formular ───────── */
// F = Formular auf der Startseite, E = Formular im Bearbeiten-Fenster
function newDraft(day) {
  return { id: null, day: day || dkey(new Date()), von: '', bis: '', vonSet: !!day, kinds: [], side: [], ml: 0, poo: false, pee: false, note: '' };
}
let F = newDraft(), E = null;
const formOf = fid => fid === 'edit' ? E : F;

function draftFromEntry(x) {
  return {
    id: x.id, day: dkey(new Date(x.s)), von: hm(x.s), bis: x.e ? hm(x.e) : '', vonSet: true,
    kinds: [...x.kinds], side: [...x.side], ml: x.ml || 0, poo: !!x.poo, pee: !!x.pee, note: x.note || '', run: !!(x.run && !x.e),
  };
}

function formHTML(f, fid) {
  const main = fid === 'main';
  const von = main && !f.vonSet ? hm(Date.now()) : f.von;
  const sug = nextSide();
  const ml = f.ml || '';
  return `<div class="form ${main ? 'card' : ''}" data-fid="${fid}">
    ${main ? `<div class="form-h"><b>Neuer Eintrag</b>${isDirty(f) ? '<button data-act="formReset">Zurücksetzen</button>' : ''}</div>` : ''}
    ${!main ? `<label class="tbox date"><small><span>Datum</span></small><input type="date" data-in="day" value="${f.day}"></label>` : ''}
    <div class="times">
      <label class="tbox ${main && !f.vonSet ? 'live' : ''}"><small><span>von</span><button type="button" data-act="vonNow">jetzt</button></small><input type="time" data-in="von" value="${von}"></label>
      <span class="dash">–</span>
      <label class="tbox"><small><span>bis</span>${f.bis ? '<button type="button" data-act="bisClr">leeren</button>' : '<button type="button" data-act="bisNow">jetzt</button>'}</small><input type="time" data-in="bis" value="${f.bis}"></label>
    </div>
    <div class="chiprow"><span class="lbl">Dauer</span>${[5, 10, 15, 20, 30, 45, 60].map(n => `<button type="button" class="chip ${durOf(f, von) === n ? 'on' : ''}" data-act="dur" data-n="${n}">${n}′</button>`).join('')}</div>
    <div class="tgs k4">${KINDS.map(k => `<button type="button" class="tg ${f.kinds.includes(k.k) ? 'on' : ''}" data-act="kind" data-k="${k.k}" aria-pressed="${f.kinds.includes(k.k)}"><span class="e">${k.e}</span>${k.name}</button>`).join('')}</div>
    <div class="mlrow">
      ${['L', 'R'].map(s => `<button type="button" class="tg side ${f.side.includes(s) ? 'on' : ''} ${sug === s && !f.side.length && main ? 'sug' : ''}" data-act="side" data-s="${s}" aria-pressed="${f.side.includes(s)}">${s}<small>${s === 'L' ? 'links' : 'rechts'}</small></button>`).join('')}
      <div class="stepper"><button type="button" data-act="mlStep" data-n="-10" aria-label="10 ml weniger">−</button><label><input type="number" inputmode="numeric" min="0" max="999" placeholder="0" data-in="ml" value="${ml}"><span>ml</span></label><button type="button" data-act="mlStep" data-n="10" aria-label="10 ml mehr">+</button></div>
    </div>
    <div class="chiprow"><span class="lbl">Menge</span>${[20, 30, 50, 60, 80, 90, 100, 120, 150].map(n => `<button type="button" class="chip ${f.ml === n ? 'on' : ''}" data-act="mlSet" data-n="${n}">${n}</button>`).join('')}</div>
    <div class="tgs k2">
      <button type="button" class="tg row ${f.poo ? 'on' : ''}" data-act="diaper" data-k="poo" aria-pressed="${f.poo}"><span class="e">💩</span>Groß</button>
      <button type="button" class="tg row ${f.pee ? 'on' : ''}" data-act="diaper" data-k="pee" aria-pressed="${f.pee}"><span class="e">💧</span>Klein</button>
    </div>
    <input class="note" type="text" data-in="note" value="${esc(f.note)}" placeholder="Notiz (optional) – z. B. gespuckt, Temperatur …" enterkeyhint="done">
    ${main ? `<div class="acts"><button class="btn run" data-act="timerStart">▶ Timer</button><button class="btn primary" data-act="saveMain">✓ Eintragen</button></div>`
      : `<div class="stack" style="margin-top:4px">${f.run ? '<button class="btn run" data-act="stopEdit">■ Jetzt beenden</button>' : ''}<button class="btn primary" data-act="saveEdit">Speichern</button>${f.id ? '<button class="btn danger" data-act="delEdit">Eintrag löschen</button>' : ''}</div>`}
  </div>`;
}
const isDirty = f => f.vonSet || f.bis || f.kinds.length || f.side.length || f.ml || f.poo || f.pee || f.note;
function durOf(f, von) {
  if (!von || !f.bis) return 0;
  const [a, b] = [von, f.bis].map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; });
  return (b - a + 1440) % 1440;
}
function rerenderForm(fid) {
  const el = $(`[data-fid="${fid}"]`);
  if (el) el.outerHTML = formHTML(formOf(fid), fid);
}
function addMin(t, n) {
  const [h, m] = t.split(':').map(Number), x = (h * 60 + m + n + 1440) % 1440;
  return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`;
}

function draftToEntry(f, main) {
  const now = Date.now();
  const von = main && !f.vonSet ? hm(now) : (f.von || hm(now));
  const at = t => { const [h, m] = t.split(':').map(Number); const d = fromKey(f.day); d.setHours(h, m, 0, 0); return d.getTime(); };
  let s = at(von);
  if (main && s > now + MIN) s -= DAY; // z. B. 23:40 eingetragen um 0:10 → gestern
  let e = f.bis ? at(f.bis) : null;
  if (e != null && e < s) e += DAY;
  return {
    id: f.id || uid(), s, e, kinds: KINDS.map(k => k.k).filter(k => f.kinds.includes(k)), side: [...f.side],
    ml: f.ml > 0 ? f.ml : null, poo: f.poo, pee: f.pee, note: f.note.trim(), run: false,
  };
}
const hasContent = x => x.kinds.length || x.poo || x.pee || x.ml || x.note;

/* ───────── Rendering ───────── */
const TITLES = { today: 'Heute', stats: 'Statistik', todo: 'To-do', more: 'Mehr' };
function render() {
  const v = S.ui.view;
  $('#title').textContent = v === 'today' && S.settings.name ? S.settings.name : TITLES[v];
  const age = fmtAge(S.settings.birth);
  $('#sub').textContent = v === 'today' ? [DAYS[new Date().getDay()] + ', ' + fmtDate(new Date()), age].filter(Boolean).join(' · ') : (S.settings.name ? S.settings.name + (age ? ' · ' + age : '') : '');
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (v === 'today' ? `<button class="hbtn" data-act="shareDay" aria-label="Tag teilen"><svg viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></button>` : '');
  const main = $('#main');
  if (v === 'today') main.innerHTML = viewToday();
  if (v === 'stats') main.innerHTML = viewStats();
  if (v === 'todo') main.innerHTML = viewTodo();
  if (v === 'more') main.innerHTML = viewMore();
  updateBadge();
}
function updateBadge() {
  const n = S.todos.filter(t => !t.done).length, b = $('#todoBadge');
  b.hidden = !n; b.textContent = n;
}

/* ── Heute ── */
function viewToday() {
  return `<div class="today"><div class="colL">${statusHTML()}<div id="formWrap">${formHTML(F, 'main')}</div></div>
    <div class="colR" id="logWrap">${logHTML()}</div></div>`;
}
function statusHTML() {
  const now = Date.now();
  let h = running().map(x => {
    const k = isSleep(x) ? kind('schlaf') : kind(x.kinds.find(k => FEED.includes(k)) || 'brust');
    return `<div class="running">
      <span class="re">${k.e}</span>
      <div class="ri"><small>${isSleep(x) ? 'Schläft' : k.name} · ab ${hm(x.s)}</small><b data-clock="${x.s}">${fmtClock(now - x.s)}</b></div>
      ${isBreast(x) ? `<div class="rs">${['L', 'R'].map(s => `<button class="tg side ${x.side.includes(s) ? 'on' : ''}" data-act="runSide" data-id="${x.id}" data-s="${s}">${s}</button>`).join('')}</div>` : ''}
      <button class="btn stop" data-act="stop" data-id="${x.id}">■ Stopp</button>
    </div>`;
  }).join('');

  const lf = lastWhere(isFeed), sug = nextSide();
  const ls = lastWhere(x => isSleep(x));
  const lpee = lastWhere(x => x.pee), lpoo = lastWhere(x => x.poo);
  const lastDiaper = [lpee, lpoo].filter(Boolean).sort((a, b) => b.s - a.s)[0];
  const sleeping = running().find(isSleep);
  const lastBreast = lastWhere(x => isBreast(x) && x.side.length);
  h += `<div class="status">
    <div class="card st"><small>🍼 Letzte Mahlzeit</small>${lf ? `<b data-ago="${lf.s}">${fmtDur(now - lf.s)}</b><span>${hm(lf.s)} · ${esc(kindNames(lf))}${lf.side.length ? ' ' + lf.side.join('+') : ''}${lf.ml ? ' · ' + lf.ml + ' ml' : ''}</span>` : '<b>–</b><span>noch nichts eingetragen</span>'}</div>
    <div class="card st"><small>🤱 Nächste Seite</small>${sug ? `<b><span class="side">${sug}</span>${sug === 'L' ? 'links' : 'rechts'}</b><span>zuletzt ${lastBreast.side.join(' → ')} um ${hm(lastBreast.s)}</span>` : '<b>–</b><span>nach dem ersten Stillen</span>'}</div>
    <div class="card st"><small>😴 Schlaf</small>${sleeping ? `<b data-ago="${sleeping.s}">${fmtDur(now - sleeping.s)}</b><span>schläft seit ${hm(sleeping.s)}</span>`
      : ls && ls.e ? `<b data-ago="${ls.e}">${fmtDur(now - ls.e)}</b><span>wach seit ${hm(ls.e)}</span>` : '<b>–</b><span>Schlaf per Timer starten</span>'}</div>
    <div class="card st"><small>🧷 Letzte Windel</small>${lastDiaper ? `<b data-ago="${lastDiaper.s}">${fmtDur(now - lastDiaper.s)}</b><span>${lpoo ? '💩 vor ' + fmtDur(now - lpoo.s) : '💩 –'}</span>` : '<b>–</b><span>noch keine</span>'}</div>
  </div>`;
  if (S.settings.vitd) {
    const on = !!S.vitd[dkey(new Date())];
    h += `<button class="card vitd ${on ? 'on' : ''}" data-act="vitd"><span style="font-size:20px">☀️</span>Vitamin D ${on ? 'gegeben' : 'heute geben'}<span class="ck"></span></button>`;
  }
  return `<div id="statusWrap">${h}</div>`;
}
function logHTML() {
  const today = dkey(new Date()), isToday = ui.day === today;
  const d = fromKey(ui.day), yest = dkey(addDays(new Date(), -1));
  const label = isToday ? 'Heute' : ui.day === yest ? 'Gestern' : DAYS[d.getDay()];
  const d0 = d.getTime(), d1 = addDays(d, 1).getTime();
  const items = sorted().filter(x => x.s >= d0 && x.s < d1);
  const st = dayStats(ui.day);
  let h = `<div class="daynav">
    <button class="icon-btn" data-act="dayShift" data-n="-1" aria-label="Vorheriger Tag">‹</button>
    <button class="daylabel" data-act="dayToday"><b>${label}</b><span>${fmtDate(d)} ${d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() : ''}</span></button>
    <button class="icon-btn" data-act="dayShift" data-n="1" aria-label="Nächster Tag" ${isToday ? 'disabled' : ''}>›</button></div>`;
  h += `<div class="sum">
    <span>🍼 <b>${st.feeds}×</b></span>
    ${st.ml ? `<span><b>${st.ml}</b> ml</span>` : ''}
    ${st.breastMin ? `<span>🤱 <b>${fmtDur(st.breastMin * MIN)}</b></span>` : ''}
    <span>😴 <b>${st.sleepMs ? fmtDur(st.sleepMs) : '0'}</b></span>
    <span>💧 <b>${st.pee}</b></span><span>💩 <b>${st.poo}</b></span>
    ${S.vitd[ui.day] ? '<span>☀️ <b>Vit. D</b></span>' : ''}
  </div>`;
  if (!items.length) {
    h += `<div class="card empty"><div class="big">${isToday ? '🌙' : '📭'}</div><b>${isToday ? 'Noch keine Einträge heute' : 'Keine Einträge an diesem Tag'}</b>${isToday ? 'Oben auswählen und auf „Eintragen“ tippen.' : ''}</div>`;
  } else {
    h += `<div class="card log"><div class="lhead"><span>Zeit</span><span>Art</span><span>Seite</span><span>Menge</span><span>Windel</span></div>
      ${items.map(rowHTML).join('')}</div>`;
  }
  if (!isToday) h += `<button class="btn soft" style="width:100%;margin-top:10px" data-act="addForDay">+ Eintrag für diesen Tag</button>`;
  return h;
}
function rowHTML(x) {
  const run = x.run && !x.e;
  const dur = x.e ? fmtDur(x.e - x.s) : run ? 'läuft' : '';
  return `<button class="lrow ${run ? 'isrun' : ''}" data-act="edit" data-id="${x.id}">
    <span class="lt"><b>${hm(x.s)}</b>${x.e ? `<small>bis ${hm(x.e)}</small>` : ''}${dur ? `<small>${dur}</small>` : ''}</span>
    <span class="lk">${x.kinds.map(k => kind(k).e).join('') || (x.poo || x.pee ? '🧷' : '📝')}<small>${esc(kindNames(x) || (x.poo || x.pee ? 'Windel' : 'Notiz'))}</small></span>
    <span class="ls">${x.side.map(s => `<i>${s}</i>`).join('')}</span>
    <span class="lm">${x.ml ? `${x.ml}<small> ml</small>` : ''}</span>
    <span class="ld">${x.poo ? '💩' : ''}${x.pee ? '💧' : ''}</span>
    ${x.note ? `<span class="lnote">📝 ${esc(x.note)}</span>` : ''}
  </button>`;
}
function refreshToday() {
  if (S.ui.view !== 'today') return;
  const sw = $('#statusWrap'); if (sw) sw.outerHTML = statusHTML();
  const lw = $('#logWrap'); if (lw) lw.innerHTML = logHTML();
}

/* ── Statistik ── */
function lastDays(n) { const a = []; for (let i = n - 1; i >= 0; i--) a.push(dkey(addDays(new Date(), -i))); return a; }
function chartHTML(id, title, keys, vals, fmt, unit, avgFmt = fmt) {
  const max = Math.max(...vals, 0) || 1;
  const sel = ui.statSel[id] ?? keys.length - 1;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = fromKey(keys[sel]);
  return `<div class="card chart">
    <div class="ch-h"><b>${title}</b><span>Ø ${avgFmt(avg)}${unit ? ' ' + unit : ''} / Tag</span></div>
    <div class="ch-v">${fmt(vals[sel])}${unit ? `<small>${unit}</small>` : ''}<small>${sel === keys.length - 1 ? 'heute' : DAYS_S[sd.getDay()] + ', ' + fmtDate(sd)}</small></div>
    <div class="bars">${vals.map((v, i) => `<button class="bar ${i === sel ? 'sel' : ''} ${v ? '' : 'zero'}" data-act="statSel" data-c="${id}" data-i="${i}" aria-label="${DAYS_S[fromKey(keys[i]).getDay()]}: ${fmt(v)} ${unit}"><i style="height:${Math.max(2, v / max * 100)}%"></i></button>`).join('')}</div>
    <div class="blbl">${keys.map((k, i) => `<span class="${i === sel ? 'sel' : ''}">${DAYS_S[fromKey(k).getDay()]}</span>`).join('')}</div>
  </div>`;
}
function viewStats() {
  const keys = lastDays(7), st = keys.map(dayStats);
  const int = v => String(Math.round(v));
  const hrs = v => num(v / HOUR);
  // Durchschnittlicher Abstand zwischen Mahlzeiten (7 Tage, Lücken > 8 h ignoriert)
  const since = fromKey(keys[0]).getTime();
  const feeds = S.log.filter(x => isFeed(x) && x.s >= since).sort((a, b) => a.s - b.s);
  const gaps = []; for (let i = 1; i < feeds.length; i++) { const g = feeds[i].s - feeds[i - 1].s; if (g > 10 * MIN && g < 8 * HOUR) gaps.push(g); }
  const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const L = st.reduce((a, s) => a + s.L, 0), R = st.reduce((a, s) => a + s.R, 0);
  const sleeps = S.log.filter(x => isSleep(x) && x.e && x.s >= since);
  const longest = sleeps.reduce((m, x) => Math.max(m, x.e - x.s), 0);

  let h = `<div class="status" style="margin-top:4px">
    <div class="card st"><small>⏱ Ø Abstand</small><b>${avgGap ? fmtDur(avgGap) : '–'}</b><span>zwischen Mahlzeiten</span></div>
    <div class="card st"><small>🌙 Längster Schlaf</small><b>${longest ? fmtDur(longest) : '–'}</b><span>letzte 7 Tage</span></div>
  </div>`;
  if (L + R) {
    h += `<div class="card chart" style="margin-bottom:10px"><div class="ch-h"><b>Seitenverteilung</b><span>letzte 7 Tage</span></div>
      <div class="split"><i class="l" style="width:${L / (L + R) * 100}%"></i><i class="r" style="width:${R / (L + R) * 100}%"></i></div>
      <div class="kv"><span>Links <b>${L}×</b></span><span><b>${R}×</b> Rechts</span></div></div>`;
  }
  h += `<div class="charts">
    ${chartHTML('feeds', 'Mahlzeiten', keys, st.map(s => s.feeds), int, '', num)}
    ${chartHTML('ml', 'Flasche & Zusatz', keys, st.map(s => s.ml), int, 'ml')}
    ${chartHTML('sleep', 'Schlaf', keys, st.map(s => s.sleepMs), hrs, 'h')}
    ${chartHTML('breast', 'Stillzeit', keys, st.map(s => s.breastMin), int, 'min')}
    ${chartHTML('pee', 'Nasse Windeln 💧', keys, st.map(s => s.pee), int, '', num)}
    ${chartHTML('poo', 'Stuhlgang 💩', keys, st.map(s => s.poo), int, '', num)}
  </div>`;
  h += `<div class="section-t">Tabelle</div><div class="card" style="padding:2px 6px;overflow-x:auto"><table class="tbl">
    <tr><th>Tag</th><th>🍼</th><th>ml</th><th>🤱 min</th><th>😴 h</th><th>💧</th><th>💩</th></tr>
    ${keys.map((k, i) => { const s = st[i], d = fromKey(k); return `<tr><td>${DAYS_S[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.</td><td>${s.feeds}</td><td>${s.ml}</td><td>${Math.round(s.breastMin)}</td><td>${hrs(s.sleepMs)}</td><td>${s.pee}</td><td>${s.poo}</td></tr>`; }).reverse().join('')}
  </table></div>`;
  h += growthHTML();
  return h;
}
function growthHTML() {
  const g = [...S.growth].sort((a, b) => b.d.localeCompare(a.d));
  let h = `<div class="section-t">Wachstum<button data-act="growthAdd">+ Messung</button></div>`;
  if (!g.length) return h + `<div class="card empty"><div class="big">⚖️</div><b>Noch keine Messung</b>Gewicht und Größe, z. B. von der Hebamme oder U-Untersuchung.</div>`;
  h += `<div class="card">${g.map((x, i) => {
    const prev = g.slice(i + 1).find(p => p.g);
    const diff = x.g && prev ? x.g - prev.g : null;
    const days = prev ? Math.round((fromKey(x.d) - fromKey(prev.d)) / DAY) : 0;
    return `<div class="grow"><span><b>${fmtDate(fromKey(x.d))} ${fromKey(x.d).getFullYear()}</b>${diff != null ? `<small>${diff >= 0 ? '+' : ''}${diff} g in ${days} T.${days ? ` (${diff >= 0 ? '+' : ''}${Math.round(diff / days * 7)} g/Woche)` : ''}</small>` : ''}</span>
      <span>${x.g ? `<b>${x.g.toLocaleString('de-DE')}</b> g` : ''}</span><span>${x.cm ? `${num(x.cm)} cm` : ''}</span>
      <button class="del" data-act="growthDel" data-id="${x.id}" aria-label="Löschen">×</button></div>`;
  }).join('')}</div>`;
  return h;
}

/* ── To-do ── */
function viewTodo() {
  const open = S.todos.filter(t => !t.done), done = S.todos.filter(t => t.done);
  const item = t => `<div class="item ${t.done ? 'done' : ''}"><button class="check" data-act="todoToggle" data-id="${t.id}" aria-label="Erledigt"></button>
    <button class="txt" data-act="todoEdit" data-id="${t.id}">${esc(t.t)}</button>
    <button class="del" data-act="todoDel" data-id="${t.id}" aria-label="Löschen">×</button></div>`;
  let h = `<form class="addbar" data-form="todo"><input name="t" placeholder="Neue Aufgabe …" autocomplete="off" enterkeyhint="done"><button class="btn primary" aria-label="Hinzufügen">+</button></form>`;
  if (open.length) h += `<div class="card todo">${open.map(item).join('')}</div>`;
  else h += `<div class="card empty"><div class="big">✅</div><b>Alles erledigt</b>${S.todos.length ? 'Gut gemacht!' : 'Tippe oben eine Aufgabe ein.'}</div>`;
  if (done.length) h += `<div class="section-t">Erledigt (${done.length})<button data-act="todoClear">Löschen</button></div><div class="card todo">${done.map(item).join('')}</div>`;
  const have = new Set(S.todos.map(t => t.t));
  const sugg = TODO_SUGG.filter(s => !have.has(s));
  if (sugg.length) h += `<div class="section-t">Vorschläge</div><div class="sugg">${sugg.map(s => `<button class="chip" data-act="todoSugg" data-t="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>`;
  return h;
}

/* ── Mehr ── */
function viewMore() {
  const st = S.settings, th = st.theme;
  return `<div class="section-t">Baby</div>
  <div class="card">
    <label class="setting"><span class="lbl">Name</span><input type="text" data-change="name" value="${esc(st.name)}" placeholder="optional"></label>
    <label class="setting"><span class="lbl">Geburtstag</span><input type="date" data-change="birth" value="${st.birth}"></label>
  </div>
  <div class="section-t">Anzeige</div>
  <div class="card">
    <div class="setting"><span class="lbl">Design</span><div class="seg">${[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button data-act="theme" data-v="${k}" class="${th === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <label class="setting"><span><span class="lbl">Vitamin-D-Erinnerung</span><br><span class="sub">Abhaken auf der Startseite</span></span><span class="switch"><input type="checkbox" data-change="vitdOn" ${st.vitd ? 'checked' : ''}><i></i></span></label>
  </div>
  ${window.Cloud ? Cloud.section() : ''}
  <div class="section-t">Teilen & Daten</div>
  <div class="card menu">
    <button data-act="shareDay"><span class="ico">📤</span>Tagesübersicht teilen</button>
    <button data-act="exportCsv"><span class="ico">📊</span>Tabelle exportieren (CSV, z. B. für Hebamme)</button>
    <button data-act="exportData"><span class="ico">💾</span>Backup exportieren</button>
    <button data-act="importData"><span class="ico">📂</span>Backup importieren</button>
    <button data-act="resetAll"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>
  <p class="small muted" style="margin:0 4px">Alle Daten liegen zusätzlich auf diesem Gerät, die App funktioniert also auch ohne Netz. Ein Backup ab und zu (z. B. in iCloud Drive) schadet trotzdem nicht.</p>
  <div class="section-t">Auf dem iPhone installieren</div>
  <div class="card" style="padding:14px 16px;font-size:15px;line-height:1.55">
    1. Diese Seite in <b>Safari</b> öffnen<br>2. Unten auf <b>Teilen</b> (□↑) tippen<br>3. <b>„Zum Home-Bildschirm“</b> wählen<br>
    <span class="muted small">Danach startet die App im Vollbild und funktioniert auch offline.</span>
  </div>
  <div class="section-t">Tipps</div>
  <div class="card" style="padding:14px 16px;font-size:14px;line-height:1.55;color:var(--t2)">
    • <b>Timer</b>: Brust oder Schlaf wählen und „▶ Timer“ tippen – läuft weiter, auch wenn die App zu ist.<br>
    • Beim Stillen kannst du im laufenden Timer die Seite wechseln (L/R).<br>
    • „<b>Nächste Seite</b>“: nach einer Seite die andere, nach beiden die zuletzt gegebene.<br>
    • Eintrag antippen zum Bearbeiten oder Löschen.<br>
    • Uhrzeit nach Mitternacht? Eine spätere Uhrzeit als jetzt wird automatisch auf gestern gelegt.
  </div>
  <p class="small muted" style="text-align:center;margin:24px 0 0">${S.log.length} Einträge · Baby-Tagebuch v1.1</p>`;
}

/* ───────── Aktionen ───────── */
function commit() { save(); refreshToday(); }
function undoable(msg, before) {
  toast(msg, { label: 'Rückgängig', fn: () => { S.log = before; save(); render(); } });
}
function saveDraft(f, main) {
  const x = draftToEntry(f, main);
  if (!hasContent(x)) { toast('Bitte erst etwas auswählen'); return null; }
  const before = S.log.map(e => ({ ...e }));
  const i = S.log.findIndex(e => e.id === x.id);
  if (i >= 0) { x.run = S.log[i].run && !x.e; S.log[i] = x; } else S.log.push(x);
  save();
  return { x, before };
}
function exportFile(data, name, type, title) {
  const file = new File([data], name, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file], title }).catch(e => { if (e.name !== 'AbortError') download(file, name); });
  }
  download(file, name);
}
function download(file, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function dayText(key) {
  const d0 = fromKey(key).getTime(), d1 = d0 + DAY, st = dayStats(key), d = fromKey(key);
  const items = S.log.filter(x => x.s >= d0 && x.s < d1).sort((a, b) => a.s - b.s);
  let t = `${S.settings.name ? S.settings.name + ' – ' : ''}${DAYS[d.getDay()]}, ${fmtDate(d)}\n`;
  t += `🍼 ${st.feeds} Mahlzeiten${st.ml ? `, ${st.ml} ml` : ''}${st.breastMin ? `, ${fmtDur(st.breastMin * MIN)} gestillt` : ''}\n😴 ${fmtDur(st.sleepMs)} Schlaf · 💧 ${st.pee} · 💩 ${st.poo}\n\n`;
  t += items.map(x => `${hm(x.s)}${x.e ? '–' + hm(x.e) : ''}  ${[kindNames(x), x.side.join('+'), x.ml ? x.ml + ' ml' : '', x.poo ? '💩' : '', x.pee ? '💧' : '', x.note].filter(Boolean).join(' · ')}`).join('\n');
  return t;
}

const ACT = {
  tab(el) { closeAllSheets(); S.ui.view = el.dataset.view; save(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },

  // Formular
  kind(el, f, fid) {
    const k = el.dataset.k, on = !f.kinds.includes(k);
    f.kinds = on ? [...f.kinds, k] : f.kinds.filter(x => x !== k);
    if (k === 'brust' && on && !f.side.length && fid === 'main') { const s = nextSide(); if (s) f.side = [s]; }
    if (k === 'brust' && !on) f.side = [];
    vib(); rerenderForm(fid);
  },
  side(el, f, fid) {
    const s = el.dataset.s;
    f.side = f.side.includes(s) ? f.side.filter(x => x !== s) : [...f.side, s];
    if (f.side.length && !f.kinds.includes('brust')) f.kinds = ['brust', ...f.kinds];
    vib(); rerenderForm(fid);
  },
  mlStep(el, f, fid) { f.ml = Math.max(0, Math.min(999, (f.ml || 0) + +el.dataset.n)); rerenderForm(fid); },
  mlSet(el, f, fid) { const n = +el.dataset.n; f.ml = f.ml === n ? 0 : n; vib(); rerenderForm(fid); },
  diaper(el, f, fid) { const k = el.dataset.k; f[k] = !f[k]; vib(); rerenderForm(fid); },
  dur(el, f, fid) {
    const von = fid === 'main' && !f.vonSet ? hm(Date.now()) : (f.von || hm(Date.now()));
    const n = +el.dataset.n;
    if (fid === 'main' && !f.vonSet) { f.von = addMin(von, -n); f.vonSet = true; f.bis = von; } // gerade fertig geworden
    else { f.von = von; f.vonSet = true; f.bis = addMin(von, n); }
    rerenderForm(fid);
  },
  vonNow(el, f, fid) { if (fid === 'main') { f.vonSet = false; f.von = ''; } else f.von = hm(Date.now()); rerenderForm(fid); },
  bisNow(el, f, fid) { f.bis = hm(Date.now()); if (fid === 'main' && !f.vonSet) { f.von = hm(Date.now()); f.vonSet = true; } rerenderForm(fid); },
  bisClr(el, f, fid) { f.bis = ''; rerenderForm(fid); },
  formReset() { F = newDraft(); rerenderForm('main'); },
  saveMain() {
    const r = saveDraft(F, true); if (!r) return;
    F = newDraft(); vib(15); render();
    undoable(`Eingetragen um ${hm(r.x.s)}`, r.before);
  },
  timerStart() {
    if (!F.kinds.length) { toast('Erst Brust, Flasche oder Schlaf wählen'); return; }
    const x = draftToEntry({ ...F, bis: '' }, true);
    x.run = true;
    const before = S.log.map(e => ({ ...e }));
    // Ein neuer Timer derselben Art beendet einen alten
    for (const r of running()) if (isSleep(r) === isSleep(x)) r.e = Math.max(r.s, x.s);
    S.log.push(x); save();
    F = newDraft(); vib(15); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    undoable(isSleep(x) ? 'Schlaf-Timer läuft' : 'Timer läuft', before);
  },
  stop(el) {
    const x = S.log.find(e => e.id === el.dataset.id); if (!x) return;
    const before = S.log.map(e => ({ ...e }));
    x.e = Date.now(); x.run = false; vib(15); commit();
    if (S.ui.view === 'today') rerenderForm('main');
    undoable(`Beendet · ${fmtDur(x.e - x.s)}`, before);
  },
  runSide(el) {
    const x = S.log.find(e => e.id === el.dataset.id); if (!x) return;
    const s = el.dataset.s;
    x.side = x.side.includes(s) ? x.side.filter(v => v !== s) : [...x.side, s];
    vib(); commit();
  },
  edit(el) {
    const x = S.log.find(e => e.id === el.dataset.id); if (!x) return;
    E = draftFromEntry(x);
    openSheet({ title: 'Eintrag bearbeiten', body: formHTML(E, 'edit'), onClose: () => { E = null; } });
  },
  addForDay() {
    E = newDraft(ui.day); E.von = '12:00';
    openSheet({ title: 'Neuer Eintrag', body: formHTML(E, 'edit'), onClose: () => { E = null; } });
  },
  saveEdit() {
    const r = saveDraft(E, false); if (!r) return;
    closeSheet(); render(); undoable('Gespeichert', r.before);
  },
  stopEdit() { E.bis = hm(Date.now()); ACT.saveEdit(); },
  delEdit() {
    const id = E.id, before = S.log.map(e => ({ ...e }));
    S.log = S.log.filter(e => e.id !== id); save(); closeSheet(); render();
    undoable('Eintrag gelöscht', before);
  },
  dayShift(el) {
    const d = dkey(addDays(fromKey(ui.day), +el.dataset.n));
    if (d > dkey(new Date())) return;
    ui.day = d; $('#logWrap').innerHTML = logHTML();
  },
  dayToday() { ui.day = dkey(new Date()); $('#logWrap').innerHTML = logHTML(); },
  vitd() { const k = dkey(new Date()); if (S.vitd[k]) delete S.vitd[k]; else S.vitd[k] = true; vib(); commit(); },
  async shareDay() {
    const text = dayText(S.ui.view === 'today' ? ui.day : dkey(new Date()));
    if (navigator.share) { try { await navigator.share({ text }); } catch (e) { /* abgebrochen */ } return; }
    try { await navigator.clipboard.writeText(text); toast('Tagesübersicht kopiert'); } catch (e) { toast('Teilen nicht möglich'); }
  },

  // Statistik
  statSel(el) { ui.statSel[el.dataset.c] = +el.dataset.i; const y = window.scrollY; render(); window.scrollTo(0, y); },
  growthAdd() {
    openSheet({
      title: 'Messung', body: `<form data-form="growth">
        <div class="field"><label>Datum</label><input type="date" name="d" value="${dkey(new Date())}" required></div>
        <div class="field"><label>Gewicht in Gramm</label><input type="number" name="g" inputmode="numeric" placeholder="z. B. 3850"></div>
        <div class="field"><label>Größe in cm</label><input type="text" name="cm" inputmode="decimal" placeholder="z. B. 54,5"></div>
        <button class="btn primary" style="width:100%">Speichern</button></form>`,
    });
  },
  growthDel(el) {
    const before = S.growth.map(g => ({ ...g }));
    S.growth = S.growth.filter(g => g.id !== el.dataset.id); save(); render();
    toast('Messung gelöscht', { label: 'Rückgängig', fn: () => { S.growth = before; save(); render(); } });
  },

  // To-do
  todoToggle(el) { const t = S.todos.find(x => x.id === el.dataset.id); if (t) { t.done = !t.done; vib(); save(); render(); } },
  todoDel(el) {
    const before = S.todos.map(t => ({ ...t }));
    S.todos = S.todos.filter(t => t.id !== el.dataset.id); save(); render();
    toast('Gelöscht', { label: 'Rückgängig', fn: () => { S.todos = before; save(); render(); } });
  },
  todoClear() {
    const before = S.todos.map(t => ({ ...t }));
    S.todos = S.todos.filter(t => !t.done); save(); render();
    toast('Erledigte gelöscht', { label: 'Rückgängig', fn: () => { S.todos = before; save(); render(); } });
  },
  todoSugg(el) { S.todos.push({ id: uid(), t: el.dataset.t, done: false }); vib(); save(); render(); },
  todoEdit(el) {
    const t = S.todos.find(x => x.id === el.dataset.id); if (!t) return;
    openSheet({ title: 'Aufgabe', body: `<form data-form="todoEdit" data-id="${t.id}"><div class="field"><input name="t" value="${esc(t.t)}" required></div><button class="btn primary" style="width:100%">Speichern</button></form>` });
  },

  // Einstellungen
  theme(el) { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  exportData() {
    const data = JSON.stringify({ app: 'babytagebuch', exported: new Date().toISOString(), ...S, ui: undefined }, null, 1);
    exportFile(data, `baby-backup-${dkey(new Date())}.json`, 'application/json', 'Baby-Tagebuch Backup');
  },
  importData() { $('#importFile').click(); },
  exportCsv() {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Datum', 'Von', 'Bis', 'Dauer (min)', 'Art', 'Seite', 'Menge (ml)', 'Groß', 'Klein', 'Notiz']];
    for (const x of [...S.log].sort((a, b) => a.s - b.s)) {
      const d = new Date(x.s);
      rows.push([`${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`, hm(x.s), x.e ? hm(x.e) : '', x.e ? Math.round((x.e - x.s) / MIN) : '', kindNames(x), x.side.join('+'), x.ml || '', x.poo ? 'x' : '', x.pee ? 'x' : '', x.note]);
    }
    const csv = '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n');
    exportFile(csv, `baby-protokoll-${dkey(new Date())}.csv`, 'text/csv', 'Baby-Protokoll');
  },
  resetAll() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Einträge, To-dos und Einstellungen löschen – auch auf dem Server und auf allen verbundenen Handys? Das kann nicht rückgängig gemacht werden.' : 'Alle Einträge, To-dos und Einstellungen auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.', 'Alles löschen', () => {
      S = fresh(); S.ui.view = 'more'; F = newDraft(); save(); applyTheme(); render(); toast('Alle Daten gelöscht');
    });
  },
};

function importData(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!Array.isArray(d.log)) throw new Error('bad');
      confirmSheet('Backup laden? Die aktuellen Daten auf diesem Gerät werden ersetzt.', 'Backup laden', () => {
        const uiKeep = S.ui; S = migrate(d); S.ui = uiKeep; save(); applyTheme(); render(); toast('Backup geladen');
      });
    } catch (e) { toast('Datei ist kein gültiges Backup'); }
  };
  rd.readAsText(file);
}

const FORMS = {
  todo(form) {
    const t = form.t.value.trim(); if (!t) return;
    S.todos.push({ id: uid(), t, done: false }); save(); render();
    setTimeout(() => $('.addbar input')?.focus(), 0);
  },
  todoEdit(form) {
    const t = S.todos.find(x => x.id === form.dataset.id), v = form.t.value.trim();
    if (t && v) { t.t = v; save(); }
    closeSheet(); render();
  },
  growth(form) {
    const g = parseInt(form.g.value, 10) || null, cm = parseFloat(form.cm.value.replace(',', '.')) || null;
    if (!g && !cm) { toast('Gewicht oder Größe eingeben'); return; }
    S.growth.push({ id: uid(), d: form.d.value || dkey(new Date()), g, cm }); save(); closeSheet(); render();
  },
};

const CHANGE = {
  name(el) { S.settings.name = el.value.trim(); save(); render(); },
  birth(el) { S.settings.birth = el.value; save(); render(); },
  vitdOn(el) { S.settings.vitd = el.checked; save(); },
};

/* ───────── Events ───────── */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  e.preventDefault();
  const fe = a.closest('[data-fid]'), fid = fe && fe.dataset.fid;
  fn(a, fid ? formOf(fid) : null, fid);
});
document.addEventListener('submit', e => {
  e.preventDefault(); const fn = FORMS[e.target.dataset.form]; fn && fn(e.target);
});
document.addEventListener('input', e => {
  const k = e.target.dataset.in; if (!k) return;
  const fe = e.target.closest('[data-fid]'); if (!fe) return;
  const f = formOf(fe.dataset.fid); if (!f) return;
  const v = e.target.value;
  if (k === 'von') { f.von = v; f.vonSet = true; fe.querySelector('.tbox.live')?.classList.remove('live'); }
  if (k === 'bis') f.bis = v;
  if (k === 'day') f.day = v || f.day;
  if (k === 'note') f.note = v;
  if (k === 'ml') f.ml = Math.max(0, Math.min(999, parseInt(v, 10) || 0));
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (k && CHANGE[k]) CHANGE[k](e.target);
  if (e.target.id === 'importFile' && e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
  // Dauer-/Mengen-Chips nach Tippen aktualisieren
  const din = e.target.dataset.in, fe = e.target.closest('[data-fid]');
  if (fe && ['von', 'bis', 'ml'].includes(din)) rerenderForm(fe.dataset.fid);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset.in === 'note') e.target.blur();
});

/* ───────── Live-Uhr ───────── */
function tick() {
  const now = Date.now();
  if (dkey(new Date()) !== ui.lastDay) { // Mitternacht
    if (ui.day === ui.lastDay) ui.day = dkey(new Date());
    ui.lastDay = dkey(new Date()); if (!F.vonSet) F.day = ui.lastDay;
    if (!sheetStack.length) render();
    return;
  }
  $$('[data-clock]').forEach(el => { el.textContent = fmtClock(now - +el.dataset.clock); });
  if (now % 15000 < 1000) $$('[data-ago]').forEach(el => { el.textContent = fmtDur(now - +el.dataset.ago); });
  if (!F.vonSet) {
    const inp = $('[data-fid="main"] [data-in="von"]');
    if (inp && document.activeElement !== inp && inp.value !== hm(now)) inp.value = hm(now);
  }
}
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !sheetStack.length) {
    const active = document.activeElement;
    if (!active || !active.closest || !active.closest('[data-fid]')) { if (S.ui.view === 'today') refreshToday(); tick(); }
  }
});

render();

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
const CLOUD_ARR = { log: ['l:', 'log'], todo: ['t:', 'todos'], growth: ['g:', 'growth'] };
if (window.Cloud) Cloud.init({
  app: 'baby',
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(CLOUD_ARR)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    for (const d of Object.keys(S.vitd)) if (S.vitd[d]) m['v:' + d] = { kind: 'vitd', data: true };
    const st = { name: S.settings.name, birth: S.settings.birth, vitd: S.settings.vitd };
    m.settings = { kind: 'settings', data: st, soft: !st.name && !st.birth && st.vitd };
    return m;
  },
  apply(r) {
    const rid = r.id.slice(2);
    if (CLOUD_ARR[r.kind]) {
      const arr = S[CLOUD_ARR[r.kind][1]], i = arr.findIndex(x => x.id === rid);
      if (r.deleted) { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = r.data; else arr.push(r.data);
    } else if (r.kind === 'vitd') { if (r.deleted) delete S.vitd[rid]; else S.vitd[rid] = true; }
    else if (r.kind === 'settings' && r.data) Object.assign(S.settings, r.data);
  },
  persist() { save(true); },
  refresh() { const y = window.scrollY; render(); window.scrollTo(0, y); },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  openSettings() { closeAllSheets(); S.ui.view = 'more'; save(true); render(); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
