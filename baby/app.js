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

/* ───────── State ───────── */
const KEY = 'baby.v1';
function fresh() {
  return {
    v: 1, sid: uid(), log: [], todos: [], growth: [], vitd: {},
    settings: { name: '', birth: '', theme: 'auto', vitd: true, feedInt: 180, feedFrom: 'start', nightOn: false, nightInt: 240, scoops: 3, water: 90, stufe: 7, how: 'auto' },
    ui: { view: 'today' },
  };
}
function migrate(s) {
  const f = fresh(), arr = v => Array.isArray(v) ? v : [];
  const m = { ...f, ...s, settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui } };
  // Timer gibt es nicht mehr: noch laufende alte Einträge gelten als normale Einträge
  m.log = arr(m.log).filter(x => x && x.id && x.s).map(x => ({ ...x, kinds: arr(x.kinds), side: arr(x.side), run: false }));
  m.todos = arr(m.todos); m.growth = arr(m.growth);
  if (!m.vitd || typeof m.vitd !== 'object') m.vitd = {};
  if (!m.sid) m.sid = uid();
  return m;
}
// boot.rebuilt: kein lesbarer Datenbestand beim Start → beim Abgleich gewinnt die Online-Datenbank,
// statt dass ein leerer Stand dort alles löscht
const boot = { rebuilt: false };
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { /* Speicher nicht lesbar */ }
  if (raw) {
    try { const s = JSON.parse(raw); if (s && typeof s === 'object') return migrate(s); } catch (e) { /* beschädigt */ }
    try { localStorage.setItem(KEY + '.kaputt', raw.slice(0, 2000000)); } catch (e) { /* egal */ }
    boot.rebuilt = true;
  } else {
    try { if (localStorage.getItem('cloud.baby')) boot.rebuilt = true; } catch (e) { /* egal */ }
  }
  return fresh();
}
let S = load();
function save(fromServer) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  if (!fromServer && window.Cloud) Cloud.soon(); // Änderung an die Online-Datenbank schicken
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const ui = { day: dkey(new Date()), statSel: {}, lastDay: dkey(new Date()) };

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#13150c' : '#eef4e7';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ───────── Auswertung ───────── */
// Neueste zuerst; bei gleicher Uhrzeit der zuletzt angelegte Eintrag (IDs beginnen mit dem Zeitstempel)
const sorted = () => [...S.log].sort((a, b) => b.s - a.s || (b.id > a.id ? 1 : b.id < a.id ? -1 : 0));
const endOf = x => x.e || (x.run ? Date.now() : x.s);
const lastWhere = fn => sorted().find(fn);

function nextSide() {
  const last = lastWhere(x => !isSleep(x) && x.side.length);
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
    if (!isSleep(x)) { if (x.side.includes('L')) st.L++; if (x.side.includes('R')) st.R++; }
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
  let ovOk = false;
  ov.addEventListener('pointerdown', () => { const a = document.activeElement; ovOk = !(a && sh.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName)); });
  ov.addEventListener('click', () => { if (ovOk && Date.now() - entry.t > 450) closeSheet(); ovOk = false; });
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
// F = Formular auf der Startseite, E = Formular im Bearbeiten-Fenster.
// Nur noch Fläschchen: ein Eintrag ist eine Mahlzeit (Schalter „Fläschchen“) und/oder eine Windel.
// Erfasst wird nur die Uhrzeit (kein Timer, keine Dauer).
function newDraft(day) {
  const main = !day, s = main ? nextSide() : null;
  return { id: null, day: day || dkey(new Date()), von: '', vonSet: !main, feed: true, side: s ? [s] : [], ml: 0,
    how: null, pu: null, wa: null, st: null, poo: false, pee: false, note: '', mix: false, e: null, old: [], pristine: main };
}
let F = newDraft(), E = null;
const formOf = fid => fid === 'edit' ? E : F;
// Zubereitung: „auto“ = Milchautomat (Stufe + Wasser), „hand“ = per Hand (Löffel + Wasser).
// Ältere Einträge ohne Angabe mit Löffeln gelten als „per Hand“.
const entryHow = x => x.how || (x.st ? 'auto' : x.pu ? 'hand' : 'auto');
// Vorgewählt ist die zuletzt genutzte Zubereitung (beim ersten Mal der Automat)
const lastHow = () => { const x = lastWhere(e => isFeed(e) && e.how); return x ? x.how : S.settings.how; };
// Rezept des Eintrags (ohne eigene Werte = Standard aus den Einstellungen)
const rec = f => ({ how: f.how ?? lastHow(), st: f.st ?? S.settings.stufe, pu: f.pu ?? S.settings.scoops, wa: f.wa ?? S.settings.water });
const recChanged = f => f.st != null || f.pu != null || f.wa != null;
const recText = r => r.how === 'hand' ? `${num(r.pu)} Löffel · ${r.wa} ml` : `Stufe ${num(r.st)} · ${r.wa} ml`;

function draftFromEntry(x) {
  return {
    id: x.id, day: dkey(new Date(x.s)), von: hm(x.s), vonSet: true, feed: isFeed(x), side: [...x.side], ml: x.ml || 0,
    how: isFeed(x) ? entryHow(x) : null, pu: x.pu ?? null, wa: x.wa ?? null, st: x.st ?? null, poo: !!x.poo, pee: !!x.pee, note: x.note || '',
    mix: false, e: x.e || null, old: [...x.kinds], pristine: false,
  };
}

// Mischverhältnis prüfen: der Standard (z. B. 3 Löffel : 90 ml) gibt das Verhältnis vor
function mixHint(f) {
  if (!f.feed || rec(f).how !== 'hand') return '';
  const { pu, wa } = rec(f), per = S.settings.water / S.settings.scoops;
  if (Math.abs(pu * per - wa) < per / 2) return '';
  return `<div class="mixhint">⚠︎ Verhältnis prüfen: für ${wa} ml üblich ${num(Math.round(wa / per * 2) / 2)} Löffel (1 Löffel je ${num(per)} ml)</div>`;
}
const miniStep = (lbl, k, v, unit, step) => `<div class="mini"><span>${lbl}</span><button type="button" data-act="rcStep" data-k="${k}" data-n="-${step}" aria-label="${lbl} weniger">−</button><b>${v}</b>${unit ? `<small>${unit}</small>` : ''}<button type="button" data-act="rcStep" data-k="${k}" data-n="${step}" aria-label="${lbl} mehr">+</button></div>`;

function formHTML(f, fid) {
  const main = fid === 'main';
  const von = main && !f.vonSet ? hm(Date.now()) : f.von;
  const sug = nextSide(), r = rec(f), ml = f.ml || '';
  const sideBtn = sd => `<button type="button" class="sd ${f.side.includes(sd) ? 'on' : ''} ${sug === sd && !f.side.length ? 'sug' : ''}" data-act="side" data-s="${sd}" aria-pressed="${f.side.includes(sd)}" aria-label="${sd === 'L' ? 'links' : 'rechts'}">${sd}</button>`;
  return `<div class="form ${main ? 'card' : ''}" data-fid="${fid}">
    <div class="form-h">${main ? '<b>Neuer Eintrag</b>' : `<input class="dpick" type="date" data-in="day" value="${f.day}" aria-label="Datum">`}
      <label class="tpill ${main && !f.vonSet ? 'live' : ''}"><input type="time" data-in="von" value="${von}" aria-label="Uhrzeit"><button type="button" data-act="vonNow">jetzt</button></label>
    </div>
    <div class="frow">
      <button type="button" class="feedtg ${f.feed ? 'on' : ''}" data-act="feedTg" aria-pressed="${f.feed}"><span class="e">🍼</span>Fläschchen<i class="ck"></i></button>
      ${f.feed ? `<div class="sides"><small>Seite</small>${sideBtn('L')}${sideBtn('R')}</div>` : ''}
    </div>
    ${f.feed ? `<div class="recipe ${f.mix ? 'open' : ''}">
      <button type="button" class="rc-head" data-act="mixTg" aria-expanded="${f.mix}"><span class="lbl">Rezept</span><b>${r.how === 'hand' ? '✋ Per Hand' : '🤖 Automat'}</b><span class="rc-sub">${recText(r)}</span><span class="rc-edit">${f.mix ? 'Fertig' : 'Anpassen'}</span></button>
      ${f.mix ? `<div class="rc-body">
        <div class="seg rc-how"><button type="button" data-act="howSet" data-v="auto" class="${r.how !== 'hand' ? 'on' : ''}">🤖 Milchautomat</button><button type="button" data-act="howSet" data-v="hand" class="${r.how === 'hand' ? 'on' : ''}">✋ Per Hand</button></div>
        ${r.how === 'hand' ? miniStep('Löffel', 'pu', num(r.pu), '', 1) : miniStep('Stufe', 'st', num(r.st), '', 1)}${miniStep('Wasser ml', 'wa', r.wa, '', 10)}
        ${recChanged(f) ? '<button type="button" class="rc-reset" data-act="mixReset">↺ Standard</button>' : ''}</div>` : ''}
    </div>
    ${mixHint(f)}
    <div class="amt"><span class="lbl">Getrunken</span>
      <div class="stepper"><button type="button" data-act="mlStep" data-n="-10" aria-label="10 ml weniger">−</button><label><input type="number" inputmode="numeric" min="0" max="999" placeholder="0" data-in="ml" value="${ml}"><span>ml</span></label><button type="button" data-act="mlStep" data-n="10" aria-label="10 ml mehr">+</button></div>
      <button type="button" class="chip all ${f.ml && f.ml === r.wa ? 'on' : ''}" data-act="mlAll">Ganze Flasche</button>
    </div>
    <div class="chiprow">${[30, 50, 60, 70, 80, 90, 100, 120, 150].map(n => `<button type="button" class="chip ${f.ml === n ? 'on' : ''}" data-act="mlSet" data-n="${n}">${n}</button>`).join('')}</div>` : ''}
    <div class="tgs k2">
      <button type="button" class="tg row ${f.poo ? 'on' : ''}" data-act="diaper" data-k="poo" aria-pressed="${f.poo}"><span class="e">💩</span>Groß</button>
      <button type="button" class="tg row ${f.pee ? 'on' : ''}" data-act="diaper" data-k="pee" aria-pressed="${f.pee}"><span class="e">💧</span>Klein</button>
    </div>
    <input class="note" type="text" data-in="note" value="${esc(f.note)}" placeholder="Notiz (optional) – z. B. gespuckt, Temperatur …" enterkeyhint="done">
    ${main ? `<button class="btn primary save" data-act="saveMain">✓ Eintragen</button>`
      : `<div class="stack" style="margin-top:4px"><button class="btn primary" data-act="saveEdit">Speichern</button>${f.id ? '<button class="btn danger" data-act="delEdit">Eintrag löschen</button>' : ''}</div>`}
  </div>`;
}
// Markierungen (Mengen-Chips) anpassen, ohne Eingabefelder neu aufzubauen –
// sonst schließt iOS das Zeitrad bzw. die Tastatur
function updateFormMarks(fid) {
  const fe = $(`[data-fid="${fid}"]`), f = formOf(fid); if (!fe || !f) return;
  $$('[data-act=mlSet]', fe).forEach(c => c.classList.toggle('on', +c.dataset.n === f.ml));
  $('[data-act=mlAll]', fe)?.classList.toggle('on', !!f.ml && f.ml === rec(f).wa);
}
function rerenderForm(fid) {
  const el = $(`[data-fid="${fid}"]`);
  if (el) el.outerHTML = formHTML(formOf(fid), fid);
}

function draftToEntry(f, main) {
  const now = Date.now();
  const von = main && !f.vonSet ? hm(now) : (f.von || hm(now));
  const d = fromKey(f.day), [h, m] = von.split(':').map(Number); d.setHours(h, m, 0, 0);
  let s = d.getTime();
  if (main && s > now + MIN) s -= DAY; // z. B. 23:40 eingetragen um 0:10 → gestern
  // Alte Einträge behalten ihre Art (z. B. Brust/Zusatz/Schlaf), neue Mahlzeiten sind „Flasche“
  const oldFeed = f.old.filter(k => FEED.includes(k)), other = f.old.filter(k => !FEED.includes(k));
  const kinds = f.feed ? [...(oldFeed.length ? oldFeed : ['flasche']), ...other] : other;
  const r = rec(f);
  return {
    id: f.id || uid(), s, e: f.e && f.e > s ? f.e : null, kinds: KINDS.map(k => k.k).filter(k => kinds.includes(k)),
    side: f.feed ? [...f.side] : [], ml: f.feed && f.ml > 0 ? f.ml : null, poo: f.poo, pee: f.pee, note: f.note.trim(), run: false,
    ...(f.feed ? (r.how === 'hand' ? { how: 'hand', pu: r.pu, wa: r.wa } : { how: 'auto', st: r.st, wa: r.wa }) : {}),
  };
}
const hasContent = x => x.kinds.length || x.poo || x.pee || x.ml || x.note;

/* ───────── Rendering ───────── */
const TITLES = { today: 'Heute', stats: 'Statistik', more: 'Einstellungen' };
function render() {
  if (!TITLES[S.ui.view]) S.ui.view = 'today'; // z. B. früher geöffnete To-do-Seite
  const v = S.ui.view;
  $('#title').textContent = v === 'today' && S.settings.name ? S.settings.name : TITLES[v];
  const age = fmtAge(S.settings.birth);
  $('#sub').textContent = v === 'today' ? [DAYS[new Date().getDay()] + ', ' + fmtDate(new Date()), age].filter(Boolean).join(' · ') : (S.settings.name ? S.settings.name + (age ? ' · ' + age : '') : '');
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === v)); $$('.gear-btn').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (v === 'today' ? `<button class="hbtn" data-act="shareDay" aria-label="Tag teilen"><svg viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></button>` : '');
  const main = $('#main');
  if (v === 'today') { main.innerHTML = viewToday(); updateFeedCard(Date.now()); }
  if (v === 'stats') main.innerHTML = viewStats();
  if (v === 'more') main.innerHTML = viewMore();
}

/* ── Heute ── */
function viewToday() {
  if (F.pristine) F = newDraft(); // frische Vorschläge, z. B. nächste Seite nach Einträgen vom anderen Handy
  return `<div class="today"><div class="colL">${statusHTML()}<div id="formWrap">${formHTML(F, 'main')}</div></div>
    <div class="colR" id="logWrap">${logHTML()}</div></div>`;
}
/* ── Zeit seit letzter Mahlzeit + Optimalzeit ── */
const fmtInt = m => { const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h}:${pad(r)} h` : `${h} h`) : `${r} min`; };
const isNight = ts => { const h = new Date(ts).getHours(); return h >= 22 || h < 6; };
function feedPlan(lf) {
  const st = S.settings, ref = lf.s, night = st.nightOn && isNight(ref);
  const int = night ? st.nightInt : st.feedInt;
  return { ref, int, target: ref + int * MIN, night };
}
function feedCardHTML(lf) {
  if (!lf) return `<button class="card feed" data-act="feedSettings"><div class="fh"><small>🍼 Seit letzter Mahlzeit</small><span>Ziel ${fmtInt(S.settings.feedInt)} ⚙︎</span></div>
    <b class="fclock">–</b><div class="fstate">Noch keine Mahlzeit eingetragen</div></button>`;
  const p = feedPlan(lf);
  return `<button class="card feed" id="feedCard" data-act="feedSettings" data-ref="${p.ref}" data-target="${p.target}" data-int="${p.int}">
    <div class="fh"><small>🍼 Seit letzter Mahlzeit</small><span>Ziel ${fmtInt(p.int)}${p.night ? ' 🌙' : ''} ⚙︎</span></div>
    <div class="fmain"><b class="fclock"></b><div class="fright"><div class="fstate"></div><div class="fnext"></div></div></div>
    <div class="fbar"><i></i></div>
    <div class="flast">Zuletzt ${hm(p.ref)} Uhr${lf.ml ? ' · ' + lf.ml + ' ml' : ''}${lf.side.length ? ' · Seite ' + lf.side.join('+') : ''}</div>
  </button>`;
}
function updateFeedCard(now) {
  const c = document.getElementById('feedCard'); if (!c) return;
  const ref = +c.dataset.ref, target = +c.dataset.target, int = +c.dataset.int * MIN;
  const passed = now - ref, left = target - now;
  const state = left > 15 * MIN ? 'ok' : left > 0 ? 'soon' : 'due';
  if (!c.classList.contains(state)) { c.classList.toggle('ok', state === 'ok'); c.classList.toggle('soon', state === 'soon'); c.classList.toggle('due', state === 'due'); }
  const sec = Math.floor(Math.max(0, passed) / 1000);
  $('.fclock', c).innerHTML = `${Math.floor(sec / 3600)}:${pad(Math.floor(sec / 60) % 60)}<small>:${pad(sec % 60)}</small>`;
  $('.fbar i', c).style.width = Math.min(100, Math.max(0, passed / int * 100)) + '%';
  $('.fstate', c).textContent = left > 0 ? `noch ${fmtDur(left)}` : left > -MIN ? 'Jetzt Zeit' : `fällig seit ${fmtDur(-left)}`;
  $('.fnext', c).textContent = left > 0 ? `nächste ca. ${hm(target)}` : `Ziel war ${hm(target)}`;
  // Hinweis, wenn die Optimalzeit erreicht wird, während die App offen ist
  if (left <= 0 && ui.feedAlert !== ref && document.visibilityState === 'visible') {
    ui.feedAlert = ref;
    if (left > -5 * MIN) { toast('🍼 Optimalzeit erreicht'); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
  }
}
function feedSheetBody() {
  const st = S.settings;
  const stepper = (k, v) => `<div class="fstep"><button type="button" data-act="feedStep" data-k="${k}" data-n="-15" aria-label="15 Minuten weniger">−</button><output>${fmtInt(v)}</output><button type="button" data-act="feedStep" data-k="${k}" data-n="15" aria-label="15 Minuten mehr">+</button></div>
    <div class="chiprow wrap">${[120, 150, 180, 210, 240, 300].map(m => `<button type="button" class="chip ${v === m ? 'on' : ''}" data-act="feedSet" data-k="${k}" data-v="${m}">${fmtInt(m)}</button>`).join('')}</div>`;
  return `<div id="feedSheet">
    <div class="field"><label>Optimaler Abstand zwischen den Mahlzeiten</label>${stepper('feedInt', st.feedInt)}
      <p class="small muted" style="margin:6px 4px 0">Gemessen von Mahlzeit zu Mahlzeit (Uhrzeit des Eintrags).</p></div>
    <div class="card" style="margin-bottom:12px"><label class="setting"><span><span class="lbl">🌙 Nachts anderer Abstand</span><br><span class="sub">für Mahlzeiten zwischen 22 und 6 Uhr</span></span><span class="switch"><input type="checkbox" data-change="nightOn" ${st.nightOn ? 'checked' : ''}><i></i></span></label></div>
    ${st.nightOn ? `<div class="field"><label>Abstand nachts</label>${stepper('nightInt', st.nightInt)}</div>` : ''}
    <p class="small muted" style="margin:0 4px 14px">Grün = alles gut, ab 15 min vorher orange, danach rot. Ist die App offen, kommt beim Erreichen ein Hinweis. Nur eine Orientierung – richtet euch nach eurem Baby und eurer Hebamme.</p>
    <button class="btn primary" style="width:100%" data-act="closeSheet">Fertig</button>
  </div>`;
}
function feedChanged() {
  save();
  const b = document.getElementById('feedSheet'); if (b) b.outerHTML = feedSheetBody();
  refreshToday(); if (S.ui.view === 'more') render();
}

// Oben nur das Wichtigste: Zeit seit letzter Mahlzeit, letzte Windel, Vitamin D
function statusHTML() {
  const now = Date.now(), lf = lastWhere(isFeed);
  const lpoo = lastWhere(x => x.poo), ld = lastWhere(x => x.poo || x.pee);
  const vitOn = !!S.vitd[dkey(new Date())];
  const what = ld ? (ld.poo ? `💩 Groß${ld.pee ? ' + 💧' : ''} · ${hm(ld.s)}` : `💧 Klein · ${hm(ld.s)}${lpoo ? ` · 💩 vor ${fmtDur(now - lpoo.s)}` : ''}`) : '';
  return `<div id="statusWrap">${feedCardHTML(lf)}
    <div class="keyrow">
      <div class="card kd"><small>🧷 Letzte Windel</small>${ld ? `<b><span data-ago="${ld.s}">${fmtDur(now - ld.s)}</span> her</b><span class="kd-sub">${what}</span>` : '<b>–</b><span class="kd-sub">noch keine eingetragen</span>'}</div>
      ${S.settings.vitd ? `<button class="card vitbtn ${vitOn ? 'on' : ''}" data-act="vitd" aria-pressed="${vitOn}"><i class="ck"></i><b>Vit. D</b><small>${vitOn ? 'gegeben' : 'abhaken'}</small></button>` : ''}
    </div>
  </div>`;
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
  // Tageszahlen: ruhig und gut lesbar
  h += `<div class="card daysum">
    <div><b>${st.feeds}</b><span>Mahlzeiten</span></div>
    <div><b>${st.ml}</b><span>ml getrunken</span></div>
    <div><b>${st.pee}</b><span>💧 Klein</span></div>
    <div><b>${st.poo}</b><span>💩 Groß</span></div>
  </div>
  ${S.vitd[ui.day] || st.sleepMs || st.breastMin ? `<div class="daysum-x">${[S.vitd[ui.day] ? '☀️ Vitamin D gegeben' : '', st.breastMin ? '🤱 ' + fmtDur(st.breastMin * MIN) : '', st.sleepMs ? '😴 ' + fmtDur(st.sleepMs) : ''].filter(Boolean).join(' · ')}</div>` : ''}`;
  if (!items.length) {
    h += `<div class="card empty"><div class="big">${isToday ? '🌙' : '📭'}</div><b>${isToday ? 'Noch keine Einträge heute' : 'Keine Einträge an diesem Tag'}</b>${isToday ? 'Oben ausfüllen und auf „Eintragen“ tippen.' : ''}</div>`;
  } else {
    h += `<div class="card log"><div class="lhead"><span>Zeit</span><span>Eintrag</span><span>Seite</span><span>Menge</span><span>Windel</span></div>
      ${items.map(rowHTML).join('')}</div>`;
  }
  if (!isToday) h += `<button class="btn soft" style="width:100%;margin-top:10px" data-act="addForDay">+ Eintrag für diesen Tag</button>`;
  return h;
}
function rowHTML(x) {
  const feed = isFeed(x);
  const how = entryHow(x);
  const custom = feed && (x.pu || x.st) && (how === 'hand' ? (x.pu !== S.settings.scoops || x.wa !== S.settings.water) : ((x.st ?? S.settings.stufe) !== S.settings.stufe || (x.wa ?? S.settings.water) !== S.settings.water));
  const icon = feed ? '🍼' : isSleep(x) ? '😴' : x.poo || x.pee ? '🧷' : '📝';
  // Fläschchen ist der Normalfall: nur das Symbol. Text nur bei Windel/Notiz und alten Arten (Brust, Zusatz, Schlaf)
  const label = feed ? (x.kinds.some(k => k !== 'flasche' && FEED.includes(k)) ? kindNames(x) : '') : isSleep(x) ? 'Schlaf' : x.poo || x.pee ? 'Windel' : 'Notiz';
  return `<button class="lrow" data-act="edit" data-id="${x.id}">
    <span class="lt">${hm(x.s)}</span>
    <span class="lk"><i>${icon}</i><span>${esc(label)}${feed && (x.pu || x.st) && (custom || how === 'hand') ? `<small class="mix ${custom ? '' : 'std'}">${how === 'hand' ? `Hand · ${num(x.pu)} Lö.` : `Stufe ${num(x.st ?? S.settings.stufe)}`} · ${x.wa ?? S.settings.water} ml</small>` : ''}</span></span>
    <span class="ls">${x.side.map(sd => `<i>${sd}</i>`).join('')}</span>
    <span class="lm">${x.ml ? `${x.ml}<small> ml</small>` : ''}</span>
    <span class="ld">${x.poo ? '💩' : ''}${x.pee ? '💧' : ''}</span>
    ${x.note ? `<span class="lnote">📝 ${esc(x.note)}</span>` : ''}
  </button>`;
}
function refreshToday() {
  if (S.ui.view !== 'today') return;
  const sw = $('#statusWrap'); if (sw) sw.outerHTML = statusHTML(); updateFeedCard(Date.now());
  const lw = $('#logWrap'); if (lw) lw.innerHTML = logHTML();
}

/* ── Statistik ── */
function lastDays(n) { const a = []; for (let i = n - 1; i >= 0; i--) a.push(dkey(addDays(new Date(), -i))); return a; }
function chartHTML(id, title, keys, vals, fmt, unit, avgFmt = fmt, small = false) {
  const max = Math.max(...vals, 0) || 1;
  const sel = ui.statSel[id] ?? keys.length - 1;
  const used = vals.filter(Boolean).length || 1, avg = vals.reduce((a, b) => a + b, 0) / used;
  const sd = fromKey(keys[sel]);
  return `<div class="card chart ${small ? 'sm' : ''}">
    <div class="ch-h"><b>${title}</b>${small ? '' : `<span>Ø ${avgFmt(avg)}${unit ? ' ' + unit : ''}</span>`}</div>
    <div class="ch-v">${fmt(vals[sel])}${unit ? `<small>${unit}</small>` : ''}<small>${sel === keys.length - 1 ? 'heute' : DAYS_S[sd.getDay()] + ' ' + sd.getDate() + '.'}</small></div>
    <div class="bars">${avg ? `<div class="avgline" style="bottom:${avg / max * 100}%"><span>Ø ${avgFmt(avg)}</span></div>` : ''}${vals.map((v, i) => `<button class="bar ${i === sel ? 'sel' : ''} ${v ? '' : 'zero'}" data-act="statSel" data-c="${id}" data-i="${i}" aria-label="${DAYS_S[fromKey(keys[i]).getDay()]}: ${fmt(v)} ${unit}"><i style="height:${Math.max(2, v / max * 100)}%"></i></button>`).join('')}</div>
    <div class="blbl">${keys.map((k, i) => `<span class="${i === sel ? 'sel' : ''}">${DAYS_S[fromKey(k).getDay()]}</span>`).join('')}</div>
  </div>`;
}
function viewStats() {
  const keys = lastDays(7), st = keys.map(dayStats), today = st[st.length - 1];
  const int = v => String(Math.round(v));
  // Durchschnitt nur über Tage mit Einträgen (sonst ziehen leere Tage vor Beginn den Wert nach unten)
  const days = st.filter(x => x.feeds).length || 1;
  const sum = fn => st.reduce((a, x) => a + fn(x), 0);
  const since = fromKey(keys[0]).getTime();
  const feeds = S.log.filter(x => isFeed(x) && x.s >= since).sort((a, b) => a.s - b.s);
  const gaps = []; for (let i = 1; i < feeds.length; i++) { const g = feeds[i].s - feeds[i - 1].s; if (g > 10 * MIN && g < 8 * HOUR) gaps.push(g); }
  const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const withMl = feeds.filter(x => x.ml), perMeal = withMl.length ? withMl.reduce((a, x) => a + x.ml, 0) / withMl.length : 0;
  const L = sum(x => x.L), R = sum(x => x.R);
  const kpi = (icon, label, val, unit, sub) => `<div class="card kpi"><small>${icon} ${label}</small><b>${val}<i>${unit}</i></b><span>${sub}</span></div>`;

  let h = `<div class="kpis">
    ${kpi('🍼', 'Mahlzeiten', feeds.length ? num(sum(x => x.feeds) / days) : '–', ' / Tag', `heute ${today.feeds}`)}
    ${kpi('🥛', 'Getrunken', feeds.length ? int(sum(x => x.ml) / days) : '–', ' ml / Tag', `heute ${today.ml} ml`)}
    ${kpi('⏱', 'Abstand', avgGap ? fmtDur(avgGap) : '–', '', 'zwischen Mahlzeiten')}
    ${kpi('📏', 'Pro Mahlzeit', perMeal ? int(perMeal) : '–', ' ml', 'im Schnitt')}
  </div>
  <p class="kpi-note">Durchschnitt der letzten 7 Tage</p>`;
  h += `<div class="charts">
    ${chartHTML('ml', 'Getrunken pro Tag', keys, st.map(x => x.ml), int, 'ml')}
    ${chartHTML('feeds', 'Mahlzeiten pro Tag', keys, st.map(x => x.feeds), int, '', num)}
  </div>
  <div class="charts two">
    ${chartHTML('pee', '💧 Klein', keys, st.map(x => x.pee), int, '', num, true)}
    ${chartHTML('poo', '💩 Groß', keys, st.map(x => x.poo), int, '', num, true)}
  </div>`;
  if (L + R) {
    h += `<div class="card chart"><div class="ch-h"><b>Seite beim Füttern</b><span>7 Tage</span></div>
      <div class="split"><i class="l" style="width:${L / (L + R) * 100}%"></i><i class="r" style="width:${R / (L + R) * 100}%"></i></div>
      <div class="kv"><span>Links <b>${L}×</b></span><span><b>${R}×</b> Rechts</span></div></div>`;
  }
  h += `<details class="tbl-wrap"><summary>Tabelle der letzten 7 Tage</summary><div class="card" style="padding:2px 6px;overflow-x:auto"><table class="tbl">
    <tr><th>Tag</th><th>🍼</th><th>ml</th><th>💧</th><th>💩</th></tr>
    ${keys.map((k, i) => { const x = st[i], d = fromKey(k); return `<tr><td>${DAYS_S[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.</td><td>${x.feeds}</td><td>${x.ml}</td><td>${x.pee}</td><td>${x.poo}</td></tr>`; }).reverse().join('')}
  </table></div></details>`;
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

/* (To-do-Seite entfernt; gespeicherte Aufgaben bleiben in S.todos erhalten) */

/* ── Mehr ── */
function viewMore() {
  const st = S.settings, th = st.theme;
  return `<div class="section-t">Baby</div>
  <div class="card">
    <label class="setting"><span class="lbl">Name</span><input type="text" data-change="name" value="${esc(st.name)}" placeholder="optional"></label>
    <label class="setting"><span class="lbl">Geburtstag</span><input type="date" data-change="birth" value="${st.birth}"></label>
  </div>
  <div class="section-t">Fläschchen-Rezept (Standard)</div>
  <div class="card">
    <div class="setting"><span><span class="lbl">🤖 Automat: Stufe</span></span><span class="mini"><button data-act="defStep" data-k="stufe" data-n="-1" aria-label="weniger">−</button><b>${num(st.stufe)}</b><small></small><button data-act="defStep" data-k="stufe" data-n="1" aria-label="mehr">+</button></span></div>
    <div class="setting"><span class="lbl">✋ Per Hand: Löffel</span><span class="mini"><button data-act="defStep" data-k="scoops" data-n="-1" aria-label="weniger">−</button><b>${num(st.scoops)}</b><small>Löffel</small><button data-act="defStep" data-k="scoops" data-n="1" aria-label="mehr">+</button></span></div>
    <div class="setting"><span><span class="lbl">Wasser</span><br><span class="sub">für Automat und per Hand</span></span><span class="mini"><button data-act="defStep" data-k="water" data-n="-10" aria-label="weniger">−</button><b>${st.water}</b><small>ml</small><button data-act="defStep" data-k="water" data-n="10" aria-label="mehr">+</button></span></div>
  </div>
  <div class="section-t">Anzeige</div>
  <div class="card">
    <div class="setting"><span class="lbl">Design</span><div class="seg">${[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button data-act="theme" data-v="${k}" class="${th === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <button class="setting" style="width:100%;text-align:left" data-act="feedSettings"><span><span class="lbl">Mahlzeiten-Timer</span><br><span class="sub">Optimaler Abstand ${fmtInt(st.feedInt)}${st.nightOn ? ' · nachts ' + fmtInt(st.nightInt) : ''}</span></span><span class="sub">›</span></button>
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
    • <b>Fläschchen</b> ist beim neuen Eintrag schon an, das Rezept steht auf dem Standard (oben änderbar). Nur eine Windel? Fläschchen antippen zum Ausschalten.<br>
    • <b>L/R</b> = wie das Baby beim Füttern liegt. Die andere Seite ist schon vorgewählt.<br>
    • <b>Rezept → Anpassen</b>: Milchautomat (Stufe) oder per Hand (Löffel) wählen und die Menge nur für diesen Eintrag ändern. Die zuletzt genutzte Zubereitung ist beim nächsten Mal vorgewählt.<br>
    • Eintrag antippen zum Bearbeiten oder Löschen.<br>
    • Uhrzeit nach Mitternacht? Eine spätere Uhrzeit als jetzt wird automatisch auf gestern gelegt.
  </div>
  <p class="small muted" style="text-align:center;margin:24px 0 0">${S.log.length} Einträge · Baby-Tagebuch v2.1</p>`;
}

/* ───────── Aktionen ───────── */
function commit() { save(); refreshToday(); }
const bulkOk = () => { if (window.Cloud && Cloud.allowBulkDelete) Cloud.allowBulkDelete(); }; // gewollte Massenänderung
// Merkt sich nur die genannten Einträge – Rückgängig lässt alles andere (z. B. Einträge vom
// anderen Handy, die inzwischen hereinkamen) unangetastet
function remember(ids) {
  const prev = new Map(ids.map(id => { const x = S.log.find(e => e.id === id); return [id, x ? JSON.parse(JSON.stringify(x)) : null]; }));
  return () => {
    for (const [id, p] of prev) {
      const i = S.log.findIndex(e => e.id === id);
      if (p) { if (i >= 0) S.log[i] = p; else S.log.push(p); } else if (i >= 0) S.log.splice(i, 1);
    }
  };
}
function undoable(msg, restore) {
  toast(msg, { label: 'Rückgängig', fn: () => { restore(); save(); render(); } });
}
function saveDraft(f, main) {
  const x = draftToEntry(f, main);
  if (!hasContent(x)) { toast('Bitte erst etwas auswählen'); return null; }
  const before = remember([x.id]);
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
  t += `🍼 ${st.feeds} Mahlzeiten${st.ml ? `, ${st.ml} ml` : ''}${st.breastMin ? `, ${fmtDur(st.breastMin * MIN)} gestillt` : ''}\n💧 ${st.pee} · 💩 ${st.poo}\n\n`;
  t += items.map(x => `${hm(x.s)}${x.e ? '–' + hm(x.e) : ''}  ${[kindNames(x), x.side.join('+'), x.ml ? x.ml + ' ml' : '', x.pu ? `${num(x.pu)} Lö./${x.wa} ml Wasser` : '', x.poo ? '💩' : '', x.pee ? '💧' : '', x.note].filter(Boolean).join(' · ')}`).join('\n');
  return t;
}

const ACT = {
  tab(el) { closeAllSheets(); S.ui.view = el.dataset.view; save(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },

  // Formular
  feedTg(el, f, fid) {
    f.feed = !f.feed;
    if (!f.feed) f.side = []; else if (!f.side.length && fid === 'main') { const sd = nextSide(); if (sd) f.side = [sd]; }
    vib(); rerenderForm(fid);
  },
  side(el, f, fid) { const sd = el.dataset.s; f.side = f.side.includes(sd) ? f.side.filter(x => x !== sd) : [...f.side, sd]; vib(); rerenderForm(fid); },
  mixTg(el, f, fid) { f.mix = !f.mix; rerenderForm(fid); },
  rcStep(el, f, fid) {
    const k = el.dataset.k, lim = { st: [1, 20], pu: [1, 12], wa: [10, 300] }[k];
    f[k] = Math.max(lim[0], Math.min(lim[1], rec(f)[k] + +el.dataset.n)); vib(); rerenderForm(fid);
  },
  howSet(el, f, fid) { f.how = el.dataset.v; vib(); rerenderForm(fid); },
  mixReset(el, f, fid) { f.st = f.pu = f.wa = null; vib(); rerenderForm(fid); },
  defStep(el) {
    const k = el.dataset.k, lim = { stufe: [1, 20], scoops: [1, 12], water: [10, 300] }[k];
    S.settings[k] = Math.max(lim[0], Math.min(lim[1], S.settings[k] + +el.dataset.n)); vib(); save(); render();
  },
  mlStep(el, f, fid) { f.ml = Math.max(0, Math.min(999, (f.ml || 0) + +el.dataset.n)); rerenderForm(fid); },
  mlAll(el, f, fid) { const w = rec(f).wa; f.ml = f.ml === w ? 0 : w; vib(); rerenderForm(fid); },
  mlSet(el, f, fid) { const n = +el.dataset.n; f.ml = f.ml === n ? 0 : n; vib(); rerenderForm(fid); },
  diaper(el, f, fid) { const k = el.dataset.k; f[k] = !f[k]; vib(); rerenderForm(fid); },
  vonNow(el, f, fid) { if (fid === 'main') { f.vonSet = false; f.von = ''; } else f.von = hm(Date.now()); rerenderForm(fid); },
  saveMain() {
    const r = saveDraft(F, true); if (!r) return;
    F = newDraft(); vib(15); render();
    undoable(`Eingetragen um ${hm(r.x.s)}`, r.before);
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
  delEdit() {
    const id = E.id, before = remember([E.id]);
    S.log = S.log.filter(e => e.id !== id); save(); closeSheet(); render();
    undoable('Eintrag gelöscht', before);
  },
  dayShift(el) {
    const d = dkey(addDays(fromKey(ui.day), +el.dataset.n));
    if (d > dkey(new Date())) return;
    ui.day = d; $('#logWrap').innerHTML = logHTML();
  },
  dayToday() { ui.day = dkey(new Date()); $('#logWrap').innerHTML = logHTML(); },
  feedSettings() { openSheet({ title: 'Mahlzeiten-Timer', body: feedSheetBody() }); },
  feedStep(el) { const k = el.dataset.k; S.settings[k] = Math.max(30, Math.min(480, S.settings[k] + +el.dataset.n)); vib(); feedChanged(); },
  feedSet(el) { S.settings[el.dataset.k] = +el.dataset.v; vib(); feedChanged(); },
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

  // Einstellungen
  theme(el) { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  exportData() {
    const data = JSON.stringify({ app: 'babytagebuch', exported: new Date().toISOString(), ...S, ui: undefined }, null, 1);
    exportFile(data, `baby-backup-${dkey(new Date())}.json`, 'application/json', 'Baby-Tagebuch Backup');
  },
  importData() { $('#importFile').click(); },
  exportCsv() {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Datum', 'Von', 'Bis', 'Dauer (min)', 'Art', 'Seite', 'Getrunken (ml)', 'Zubereitung', 'Stufe', 'Pulver (Löffel)', 'Wasser (ml)', 'Groß', 'Klein', 'Notiz']];
    for (const x of [...S.log].sort((a, b) => a.s - b.s)) {
      const d = new Date(x.s);
      rows.push([`${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`, hm(x.s), x.e ? hm(x.e) : '', x.e ? Math.round((x.e - x.s) / MIN) : '', kindNames(x), x.side.join('+'), x.ml || '', isFeed(x) && (x.pu || x.st) ? (entryHow(x) === 'hand' ? 'per Hand' : 'Automat') : '', x.st || '', x.pu || '', x.wa || '', x.poo ? 'x' : '', x.pee ? 'x' : '', x.note]);
    }
    const csv = '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n');
    exportFile(csv, `baby-protokoll-${dkey(new Date())}.csv`, 'text/csv', 'Baby-Protokoll');
  },
  resetAll() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Einträge und Einstellungen löschen – auch online und auf allen verbundenen Handys? Das kann nicht rückgängig gemacht werden.' : 'Alle Einträge und Einstellungen auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.', 'Alles löschen', () => {
      const sid = S.sid; S = fresh(); S.sid = sid; S.ui.view = 'more'; F = newDraft();
      bulkOk(); save(); applyTheme(); render(); toast('Alle Daten gelöscht');
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
        const keep = { ui: S.ui, sid: S.sid }; S = migrate(d); S.ui = keep.ui; S.sid = keep.sid;
        bulkOk(); save(); applyTheme(); render(); toast('Backup geladen');
      });
    } catch (e) { toast('Datei ist kein gültiges Backup'); }
  };
  rd.readAsText(file);
}

const FORMS = {
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
  nightOn(el) { S.settings.nightOn = el.checked; feedChanged(); },
};

/* ───────── Events ───────── */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  e.preventDefault();
  const fe = a.closest('[data-fid]'), fid = fe && fe.dataset.fid, f = fid ? formOf(fid) : null;
  if (f) f.pristine = false;
  fn(a, f, fid);
});
document.addEventListener('submit', e => {
  e.preventDefault(); const fn = FORMS[e.target.dataset.form]; fn && fn(e.target);
});
document.addEventListener('input', e => {
  const k = e.target.dataset.in; if (!k) return;
  const fe = e.target.closest('[data-fid]'); if (!fe) return;
  const f = formOf(fe.dataset.fid); if (!f) return;
  const v = e.target.value; f.pristine = false;
  if (k === 'von') { f.von = v; f.vonSet = true; fe.querySelector('.tpill.live')?.classList.remove('live'); }
  if (k === 'day') f.day = v || f.day;
  if (k === 'note') f.note = v;
  if (k === 'ml') f.ml = Math.max(0, Math.min(999, parseInt(v, 10) || 0));
  updateFormMarks(fe.dataset.fid);
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (k && CHANGE[k]) CHANGE[k](e.target);
  if (e.target.id === 'importFile' && e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
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
  updateFeedCard(now);
  if (now % 15000 < 1000) $$('[data-ago]').forEach(el => { el.textContent = fmtDur(now - +el.dataset.ago); });
  if (!F.vonSet) {
    const fm = $('[data-fid="main"]'), inp = fm && $('[data-in="von"]', fm);
    if (inp && !fm.contains(document.activeElement) && inp.value !== hm(now)) inp.value = hm(now);
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
// todos bleiben im Abgleich, damit alte Aufgaben online nicht gelöscht werden
const CLOUD_ARR = { log: ['l:', 'log'], todo: ['t:', 'todos'], growth: ['g:', 'growth'] };
if (window.Cloud) Cloud.init({
  app: 'baby',
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(CLOUD_ARR)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    for (const d of Object.keys(S.vitd)) if (S.vitd[d]) m['v:' + d] = { kind: 'vitd', data: true };
    const st = {}, def = fresh().settings;
    for (const k of ['name', 'birth', 'vitd', 'feedInt', 'nightOn', 'nightInt', 'scoops', 'water', 'stufe', 'how']) st[k] = S.settings[k];
    m.settings = { kind: 'settings', data: st, soft: Object.keys(st).every(k => st[k] === def[k]) };
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
  // Kennung des lokalen Bestands: wurde er nach einem Defekt neu aufgebaut, gewinnt die Online-Datenbank
  storeId: () => S.sid, rebuilt: boot.rebuilt,
  // Sicherheitsnetz: sollen auf einen Schlag viele Einträge verschwinden (mehr als übrig bleiben),
  // wird erst nachgefragt, bevor online gelöscht wird
  guardDeletes(dels) { const gone = dels.filter(d => d.kind === 'log' || d.kind === 'growth').length; return gone >= 10 && gone > S.log.length; },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  openSettings() { closeAllSheets(); S.ui.view = 'more'; save(true); render(); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
