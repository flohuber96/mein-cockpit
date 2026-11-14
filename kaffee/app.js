'use strict';

/* ───────── Helfer ───────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const DAY = 864e5;
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const { fmt, fmtG, TEMPS, TEMP_C } = Advice;
const hm = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dShort = ts => { const d = new Date(ts); return `${d.getDate()}.${d.getMonth() + 1}.`; };
const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
function dayLabel(ts) {
  const k = dayKey(ts), today = dayKey(Date.now()), yest = dayKey(Date.now() - DAY);
  const d = new Date(ts);
  if (k === today) return 'Heute';
  if (k === yest) return 'Gestern';
  return `${WD[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`;
}
const toLocalInput = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const parseNum = v => { if (v == null || v === '') return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const vib = n => { if (navigator.vibrate) navigator.vibrate(n || 10); };
const TAGS = ['Channeling', 'Spritzer', 'Wässrig', 'Adstringierend', 'Süß', 'Schokoladig', 'Fruchtig', 'Crema top'];
const DRINKS = ['Espresso', 'Cappuccino', 'Flat White', 'Latte', 'Americano'];
const ROASTS = [{ k: 'hell', c: '#c99a6b' }, { k: 'mittel', c: '#8a5a36' }, { k: 'dunkel', c: '#4a2c18' }];

/* ───────── State ───────── */
const KEY = 'kaffee.v1';
function fresh() {
  return {
    v: 1, shots: [], beans: [],
    settings: {
      theme: 'auto',
      dose: 18, ratio: 2.1, tMin: 25, tMax: 30, fdMin: 8, fdMax: 11,
      machine: 'Lelit Mara X V2', temp: 'I', pi: true,
      grinder: 'Eureka Mignon Zero 65 AP', coarserUp: true, step: 0.25, spu: 5,
    },
    ui: { view: 'shot', bean: '', logBean: 'all' },
  };
}
function migrate(s) {
  const f = fresh();
  return { ...f, ...s, shots: Array.isArray(s.shots) ? s.shots : [], beans: Array.isArray(s.beans) ? s.beans : [], settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui } };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* kaputt → neu */ }
  return fresh();
}
let S = load();
function save(fromServer) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  if (!fromServer && window.Cloud) Cloud.soon();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#13100e' : '#f6f1ec';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ───────── Auswertung ───────── */
const bean = id => S.beans.find(b => b.id === id);
const activeBeans = () => S.beans.filter(b => !b.archived);
function curBean() {
  if (S.ui.bean && bean(S.ui.bean)) return bean(S.ui.bean);
  const last = [...S.shots].sort((a, b) => b.ts - a.ts).find(s => bean(s.bean) && !bean(s.bean).archived);
  return last ? bean(last.bean) : activeBeans()[0] || null;
}
const shotsOf = id => S.shots.filter(s => id === 'all' || (s.bean || '') === (id || '')).sort((a, b) => a.ts - b.ts);
const complete = s => s.din > 0 && s.dout > 0 && s.t > 0;
const lastShot = id => { const l = shotsOf(id); return [...l].reverse().find(complete) || l[l.length - 1] || null; };
function targets(b) {
  const st = S.settings;
  return { ratio: (b && b.ratio) || st.ratio, dose: (b && b.dose) || st.dose, tMin: st.tMin, tMax: st.tMax, fdMin: st.fdMin, fdMax: st.fdMax };
}
const ageDays = (b, ts = Date.now()) => b && b.roastDate ? Math.floor((ts - new Date(b.roastDate + 'T12:00').getTime()) / DAY) : null;
function ctxFor(s) {
  const b = bean(s.bean), T = targets(b), st = S.settings;
  const hist = shotsOf(s.bean || '').filter(x => x.ts <= s.ts);
  const l = Advice.learn(hist, T.ratio, st.coarserUp);
  return { targets: T, coarserUp: st.coarserUp, step: st.step, spu: l ? l.spu : st.spu, learned: !!l, ageDays: ageDays(b, s.ts), roast: b && b.roast };
}
const analyze = s => Advice.analyze(s, ctxFor(s));
function shotState(s) {
  const T = targets(bean(s.bean));
  if (!(s.t > 0)) return null;
  return Advice.timeState(Advice.timeAtTarget(s, T.ratio), T);
}
const STATE_PILL = { ok: ['good', 'im Ziel'], fast: ['warn', 'zu schnell'], slow: ['warn', 'zu langsam'] };
const beanName = id => (bean(id) && bean(id).name) || 'Ohne Sorte';
function bestShot(id) {
  const l = shotsOf(id).filter(s => s.rating > 0);
  if (!l.length) return null;
  return l.reduce((a, s) => (s.rating > a.rating || (s.rating === a.rating && s.ts > a.ts)) ? s : a);
}

/* ───────── Toast / Sheets ───────── */
let toastT;
const pending = {};
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button data-act="toastAct">${esc(action.label)}</button>` : '');
  pending.toast = action ? action.fn : null;
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2400);
}
const sheetStack = [];
function openSheet({ title = '', right = '', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head"><button class="lnk" data-act="closeSheet">Abbrechen</button><b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  const entry = { ov, sh, onClose, t: Date.now() };
  let ovOk = false;
  ov.addEventListener('pointerdown', () => { const a = document.activeElement; ovOk = !(a && sh.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName)); });
  ov.addEventListener('click', () => { if (ovOk && Date.now() - entry.t > 450 && !timerRunning()) closeSheet(); ovOk = false; });
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  sheetStack.push(entry);
  const head = $('.sheet-head', sh); let y0 = null, dy = 0;
  head.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
  head.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (dy > 90 && !timerRunning()) closeSheet(); y0 = null; });
  return sh;
}
function closeSheet() {
  const e = sheetStack.pop(); if (!e) return;
  e.ov.classList.remove('show'); e.sh.classList.remove('show');
  setTimeout(() => { e.ov.remove(); e.sh.remove(); }, 320);
  if (!sheetStack.length) document.body.classList.remove('locked');
  if (e.onClose) e.onClose();
  if (!sheetStack.length && needRender) { needRender = false; render(); }
}
let needRender = false; // Server-Änderung kam, während ein Formular offen war
function closeAllSheets() { while (sheetStack.length) closeSheet(); }
function confirmSheet(text, okLabel, onOk) {
  openSheet({
    title: 'Bist du sicher?', body: `<p style="text-align:center;font-size:16px;margin:6px 8px 18px">${esc(text)}</p><div class="stack">
      <button class="btn primary" data-act="confirmOk">${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`,
  });
  pending.confirm = onOk;
}

/* ───────── Render ───────── */
const TITLES = { shot: 'Shot', log: 'Verlauf', beans: 'Bohnen', more: 'Mehr' };
function render() {
  const v = S.ui.view;
  $('#title').textContent = TITLES[v];
  const b = curBean();
  $('#sub').textContent = v === 'shot' ? (b ? `${b.name}${b.roaster ? ' · ' + b.roaster : ''}` : S.settings.machine) : v === 'log' ? `${S.shots.length} Shots` : v === 'beans' ? `${activeBeans().length} Sorten` : `${S.settings.machine} · ${S.settings.grinder}`;
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '');
  $$('#tabbar button').forEach(x => x.classList.toggle('on', x.dataset.view === v));
  const m = $('#main');
  m.innerHTML = v === 'shot' ? viewShot() : v === 'log' ? viewLog() : v === 'beans' ? viewBeans() : viewMore();
}

function beanBar(sel, withAll) {
  let h = `<div class="chiprow beanbar">`;
  if (withAll) h += `<button class="chip ${sel === 'all' ? 'on' : ''}" data-act="${withAll}" data-id="all">Alle</button>`;
  for (const b of activeBeans()) h += `<button class="chip ${sel === b.id ? 'on' : ''}" data-act="${withAll || 'pickBean'}" data-id="${b.id}">${esc(b.name)}</button>`;
  if (withAll && S.shots.some(s => !bean(s.bean))) h += `<button class="chip ${sel === '' ? 'on' : ''}" data-act="${withAll}" data-id="">Ohne Sorte</button>`;
  if (!withAll) h += `<button class="chip add" data-act="newBean">+ Bohne</button>`;
  return h + '</div>';
}

function tipFor(s) {
  const tasteTxt = s.taste == null ? 'nicht bewertet' : Charts.TASTE[s.taste];
  return `<b>${fmt(s.din)} → ${fmt(s.dout)} g · ${fmt(s.t, 0)} s</b><small>${dShort(s.ts)} ${hm(s.ts)} · Mahlgrad ${fmtG(s.grind)}${s.fd ? ' · 💧' + fmt(s.fd, 0) + ' s' : ''}</small><small>${esc(tasteTxt)}${s.rating ? ' · ' + '★'.repeat(s.rating) : ''}</small>`;
}

function recipeCard(s, title) {
  const b = bean(s.bean), T = targets(b), m = Advice.metrics(s, T.ratio), age = ageDays(b, s.ts);
  return `<div class="card recipe">
    <div class="rh"><b>${esc(title)}</b><small>${dayLabel(s.ts)}, ${hm(s.ts)}</small></div>
    ${Charts.recipe(s, T)}
    <div class="kv">
      <div><small>Mahlgrad</small><b>${fmtG(s.grind)}</b></div>
      <div><small>Temp.</small><b>${s.temp ? esc(s.temp) : '–'}</b></div>
      <div><small>Fluss</small><b>${m ? fmt(m.flow) : '–'}<i>g/s</i></b></div>
      <div><small>Röstalter</small><b>${age != null ? age : '–'}<i>${age != null ? 'T' : ''}</i></b></div>
    </div>
  </div>`;
}

function adviceCard(s, withBtn) {
  const a = analyze(s);
  const icon = { good: '✓', warn: '!', bad: '!!', none: '?' }[a.status];
  let h = `<div class="card advice ${a.status}">
    <div class="ah"><div class="ai">${icon}</div><div><div class="at">Empfehlung für den nächsten Shot</div><h3>${esc(a.title)}</h3>${a.text ? `<p>${a.text}</p>` : ''}</div></div>`;
  if (a.next) {
    const n = a.next, ch = k => a.changes.includes(k) ? 'ch' : '';
    const old = (k, v, f) => a.changes.includes(k) ? `<s>${f(v)}</s>` : '';
    h += `<div class="next">
      <div><small>In</small><b>${fmt(n.din)} g</b></div>
      <div class="${ch('dout')}"><small>Out</small><b>${fmt(n.dout)} g</b>${old('dout', s.dout, x => fmt(x))}</div>
      <div class="${ch('grind')}"><small>Mahlgrad</small><b>${fmtG(n.grind)}</b>${old('grind', s.grind, fmtG)}</div>
      ${n.temp ? `<div class="${ch('temp')}"><small>Temp.</small><b>${esc(n.temp)}</b>${old('temp', s.temp, x => x)}</div>` : ''}
    </div>`;
  }
  if (a.reasons.length) h += `<ul class="reasons">${a.reasons.map(r => `<li data-i="${r.i}">${r.t}</li>`).join('')}</ul>`;
  if (withBtn && a.next) h += `<button class="btn primary" data-act="newShot" data-from="advice">Nächsten Shot so starten</button>`;
  return h + '</div>';
}

function compassCard(list, T, s) {
  if (!list.length) return '';
  const a = s ? analyze(s) : null;
  let next = null;
  if (a && a.next && a.m) {
    const c = ctxFor(s), dir = c.coarserUp ? 1 : -1;
    const dg = (a.next.grind != null && s.grind != null) ? (a.next.grind - s.grind) * dir : 0;
    const fd = s.fd > 0 && s.fd < s.t ? s.fd : 0, base = a.m.tAdj - dg * c.spu; // Zeit bei Ziel-Ausbeute
    const tNext = fd + (base - fd) * a.next.dout / (T.ratio * a.next.din);
    if (a.changes.length) next = { t: tNext, ratio: a.next.dout / a.next.din };
  }
  return `<div class="card chart">
    <div class="chh"><b>Dial-in-Kompass</b><small>letzte ${list.length} Shots</small></div>
    ${Charts.compass(list, T, { tip: tipFor, next })}
    ${Charts.legendTaste()}
  </div>`;
}

function viewShot() {
  const b = curBean(), id = b ? b.id : '';
  const list = shotsOf(id), s = [...list].reverse().find(complete);
  let h = beanBar(id);
  const sug = s ? analyze(s).next : null;
  const st = S.settings, T = targets(b);
  const sugTxt = sug ? `Vorschlag: ${fmt(sug.din)} g → ${fmt(sug.dout)} g · Mahlgrad ${fmtG(sug.grind)}` : `Ziel: ${fmt(T.dose)} g → ${fmt(T.dose * T.ratio)} g in ${st.tMin}–${st.tMax} s`;
  h += `<div class="cols"><div>
    <button class="newshot" data-act="newShot"><span class="ni"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2.5h4"/></svg></span><span><b>Neuer Shot</b><small>${esc(sugTxt)}</small></span></button>`;
  if (!S.shots.some(x => /^nb-/.test(x.id))) h += `<div class="card pad"><b>📓 Alte Notizen übernehmen</b><div class="small muted" style="margin:4px 0 10px">34 Shots aus dem Notizbuch (Green Lion, Melitta Bella Crema Decaf, Qaweh Decaf) in die Datenbank aufnehmen.</div><button class="btn soft sm" data-act="importNotebook">Jetzt übernehmen</button></div>`;
  if (!S.beans.length) h += `<div class="card empty"><div class="big">🫘</div><b>Leg deine erste Bohne an</b>Dann merkt sich die App Rezept, Röstdatum und Mahlgrad pro Sorte.<div style="margin-top:12px"><button class="btn soft" data-act="newBean" style="margin:0 auto">+ Bohne anlegen</button></div></div>`;
  if (s) h += recipeCard(s, 'Aktuelle Rezeptur');
  else h += `<div class="card empty"><div class="big">☕</div><b>Noch kein Shot${b ? ' mit ' + esc(b.name) : ''}</b>Tippe auf „Neuer Shot“ – mit eingebauter Stoppuhr für Zeit und ersten Tropfen.</div>`;
  h += `</div><div>`;
  if (s) h += adviceCard(s, true);
  h += compassCard(list.slice(-10), T, s);
  if (s && b) {
    const best = bestShot(id);
    if (best && best.id !== s.id) h += `<div class="card pad"><div class="small muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.04em">Bestes Rezept mit ${esc(b.name)}</div><div style="font-size:17px;font-weight:800;margin-top:2px" class="num">${fmt(best.din)} → ${fmt(best.dout)} g · ${fmt(best.t, 0)} s · Mahlgrad ${fmtG(best.grind)}</div><div class="small muted">${'★'.repeat(best.rating)} · ${dayLabel(best.ts)}${best.temp ? ' · Temp. ' + esc(best.temp) : ''}</div><button class="btn soft sm" style="margin-top:10px" data-act="newShot" data-from="best" data-id="${best.id}">Damit starten</button></div>`;
  }
  return h + '</div></div>';
}

function viewLog() {
  const sel = S.ui.logBean;
  const list = shotsOf(sel === 'all' ? 'all' : sel);
  let h = beanBar(sel, 'logBean');
  if (!list.length) return h + `<div class="card empty"><div class="big">📈</div><b>Noch keine Shots</b>Sobald du Shots einträgst, siehst du hier Verlauf und Diagramme.</div>`;
  const okN = list.filter(s => shotState(s) === 'ok').length;
  const timed = list.filter(s => s.t > 0), avgT = timed.reduce((a, s) => a + s.t, 0) / (timed.length || 1);
  const rated = list.filter(s => s.rating > 0);
  h += `<div class="stats">
    <div><small>Shots</small><b>${list.length}</b></div>
    <div><small>Im Ziel</small><b>${Math.round(okN / list.length * 100)} %</b></div>
    <div><small>${rated.length ? 'Ø Bewertung' : 'Ø Zeit'}</small><b>${rated.length ? fmt(rated.reduce((a, s) => a + s.rating, 0) / rated.length) + '★' : fmt(avgT, 0) + ' s'}</b></div>
  </div>`;
  const recent = list.slice(-30), T = targets(sel !== 'all' ? bean(sel) : null);
  h += `<div class="cols"><div>
    <div class="card chart"><div class="chh"><b>Zeit pro Shot</b><small>Sekunden · letzte ${recent.length}</small></div>
      ${Charts.line(recent.map(s => ({ y: s.t, label: dShort(s.ts), tip: tipFor(s), color: Charts.tasteVar(s.taste) || 'var(--acc)' })), { band: [T.tMin, T.tMax], label: 'Zeit pro Shot', minSpan: 10 })}
      ${Charts.legendTaste()}
    </div></div><div>
    <div class="card chart"><div class="chh"><b>Mahlgrad</b><small>${sel === 'all' ? 'alle Sorten' : esc(beanName(sel))}</small></div>
      ${Charts.line(recent.map(s => ({ y: s.grind, label: dShort(s.ts), tip: tipFor(s) })), { label: 'Mahlgrad pro Shot', minSpan: 1 })}
      <details class="tbl"><summary>Als Tabelle</summary><table><tr><th>Datum</th><th>In</th><th>Out</th><th>Zeit</th><th>💧</th><th>Mahlgrad</th></tr>${recent.slice().reverse().map(s => `<tr><td>${dShort(s.ts)} ${hm(s.ts)}</td><td>${fmt(s.din)}</td><td>${fmt(s.dout)}</td><td>${fmt(s.t, 0)}</td><td>${s.fd ? fmt(s.fd, 0) : '–'}</td><td>${fmtG(s.grind)}</td></tr>`).join('')}</table></details>
    </div></div></div>`;
  // Liste nach Tagen
  let day = '';
  const rows = [...list].reverse();
  rows.forEach((s, i) => {
    const k = dayKey(s.ts);
    if (k !== day) { if (day) h += '</div>'; day = k; h += `<div class="day-h">${dayLabel(s.ts)}</div><div class="card slist">`; }
    const st = shotState(s), pill = st ? STATE_PILL[st] : null, col = Charts.tasteVar(s.taste);
    h += `<button class="srow" data-act="editShot" data-id="${s.id}">
      <span class="tm">${hm(s.ts)}</span>
      <span class="main"><b>${fmt(s.din)} → ${fmt(s.dout)} g · ${fmt(s.t, 0)} s</b><small>${sel === 'all' ? esc(beanName(s.bean)) + ' · ' : ''}Mahlgrad ${fmtG(s.grind)}${s.fd ? ' · 💧 ' + fmt(s.fd, 0) + ' s' : ''}${s.drink && s.drink !== 'Espresso' ? ' · ' + esc(s.drink) : ''}</small></span>
      <span class="rt">${pill ? `<span class="pill ${pill[0]}">${pill[1]}</span>` : ''}<br><small class="muted">${col ? `<i class="dot" style="background:${col}"></i>` : ''}${s.rating ? '★'.repeat(s.rating) : ''}</small></span>
    </button>`;
    if (i === rows.length - 1) h += '</div>';
  });
  return h;
}

function viewBeans() {
  const cur = curBean();
  let h = `<div style="margin:2px 0 12px"><button class="btn primary" data-act="newBean" style="width:100%">+ Neue Bohne</button></div>`;
  const list = [...S.beans].sort((a, b) => (a.archived ? 1 : 0) - (b.archived ? 1 : 0) || (b.created || 0) - (a.created || 0));
  if (!list.length) return h + `<div class="card empty"><div class="big">🫘</div><b>Noch keine Bohnen</b>Lege Sorte, Röster und Röstdatum an – die App berechnet das Röstalter und merkt sich das beste Rezept.</div>`;
  h += '<div class="blist">';
  for (const b of list) {
    const n = shotsOf(b.id).length, best = bestShot(b.id) || lastShot(b.id), age = ageDays(b);
    const rc = ROASTS.find(r => r.k === b.roast);
    h += `<button class="card bean ${cur && cur.id === b.id ? 'on' : ''}" data-act="editBean" data-id="${b.id}" ${b.archived ? 'style="opacity:.55"' : ''}>
      <div class="bh"><div><b>${esc(b.name)}</b><div class="sub">${esc([b.roaster, b.origin].filter(Boolean).join(' · ') || '–')}</div></div>
      ${cur && cur.id === b.id ? '<span class="tag">aktiv</span>' : b.archived ? '<span class="tag age">leer</span>' : age != null ? `<span class="tag age">${age} Tage</span>` : ''}</div>
      ${rc ? `<span class="roast" style="background:${rc.c}" title="${rc.k}"></span> <span class="small muted">${rc.k}</span>` : ''}
      <div class="small muted" style="margin-top:4px">${n} Shot${n === 1 ? '' : 's'} · Ziel 1 : ${fmt(targets(b).ratio)}${b.roastDate ? ' · geröstet ' + dShort(new Date(b.roastDate + 'T12:00')) : ''}</div>
      ${best ? `<div class="best"><span>${best.rating ? 'Bestes' : 'Letztes'} Rezept:</span> <b>${fmt(best.din)} → ${fmt(best.dout)} g · ${fmt(best.t, 0)} s · MG ${fmtG(best.grind)}</b></div>` : ''}
    </button>`;
  }
  return h + '</div>';
}

function setRow(label, key, o = {}) {
  const v = S.settings[key];
  return `<div class="setting"><span><span class="lbl">${label}</span>${o.sub ? `<br><span class="sub">${o.sub}</span>` : ''}</span><input type="${o.type || 'text'}" inputmode="${o.type === 'text' ? 'text' : 'decimal'}" data-set="${key}" value="${esc(o.type === 'text' ? v : String(v).replace('.', ','))}" ${o.type === 'text' ? 'style="width:55%"' : ''}></div>`;
}
function viewMore() {
  const st = S.settings, b = curBean();
  const l = b ? Advice.learn(shotsOf(b.id), targets(b).ratio, st.coarserUp) : null;
  let h = `<div class="section-t">Zielwerte (Standard)</div><div class="card">
    ${setRow('Dosis (In)', 'dose', { sub: 'Gramm im Siebträger' })}
    ${setRow('Ratio 1 :', 'ratio', { sub: 'Out ÷ In, pro Bohne änderbar' })}
    ${setRow('Zeit von (s)', 'tMin', { sub: 'ab Knopfdruck, inkl. Pre-Infusion' })}
    ${setRow('Zeit bis (s)', 'tMax')}
    ${setRow('1. Tropfen von (s)', 'fdMin', { sub: 'deine Mara X: meist 9–10 s' })}
    ${setRow('1. Tropfen bis (s)', 'fdMax')}
  </div>
  <div class="section-t">Mühle</div><div class="card">
    ${setRow('Modell', 'grinder', { type: 'text' })}
    <div class="setting"><span><span class="lbl">Skala</span><br><span class="sub">Was bedeutet eine höhere Zahl?</span></span><div class="seg"><button class="${st.coarserUp ? 'on' : ''}" data-act="setDir" data-v="1">gröber</button><button class="${!st.coarserUp ? 'on' : ''}" data-act="setDir" data-v="0">feiner</button></div></div>
    ${setRow('Schrittweite', 'step', { sub: 'kleinste Änderung, die du einstellst' })}
    ${setRow('Sek. pro Einheit', 'spu', { sub: l ? `Gelernt für ${esc(b.name)}: ${fmt(l.spu)} s (aus ${l.n} Shots) – wird automatisch benutzt` : 'Startwert – wird aus deinen Shots gelernt' })}
  </div>
  <div class="section-t">Maschine</div><div class="card">
    ${setRow('Modell', 'machine', { type: 'text' })}
    <div class="setting"><span><span class="lbl">Temperatur-Stufe</span><br><span class="sub">Standard für neue Shots</span></span><div class="seg">${TEMPS.map(t => `<button class="${st.temp === t ? 'on' : ''}" data-act="setTemp" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="setting"><span><span class="lbl">Pre-Infusion</span></span><div class="seg"><button class="${st.pi ? 'on' : ''}" data-act="setPi" data-v="1">an</button><button class="${!st.pi ? 'on' : ''}" data-act="setPi" data-v="0">aus</button></div></div>
  </div>
  <div class="card info" style="margin-top:10px">
    <b>So kommt die Empfehlung zustande</b><br>
    1. <b>Ratio</b> ist das Rezept – die Ausbeute wird immer aufs Ziel gesetzt (z. B. 18 g → 36 g).<br>
    2. Die <b>Zeit</b> steuerst du über den <b>Mahlgrad</b>. Hast du zu viel/zu wenig rausgelassen, rechnet die App die Zeit auf die Ziel-Ausbeute um.<br>
    3. Liegt die Zeit im Ziel, entscheidet der <b>Geschmack</b>: sauer → feiner / mehr Ratio / heißer, bitter → gröber / weniger Ratio / kühler.<br>
    4. Der <b>erste Tropfen</b> (bei dir sonst ${st.fdMin}–${st.fdMax} s) zeigt Channeling oder falsche Dosis.<br>
    Wie stark eine Mahlgrad-Einheit die Zeit verändert, lernt die App pro Bohne aus deinen Shots. Immer nur <b>eine</b> Sache auf einmal ändern.<br><br>
    <b>Mara X Temperatur-Stufen</b> (Schalter unten): 0 ${TEMP_C['0']}, I ${TEMP_C.I}, II ${TEMP_C.II}. Gut 20–25 Min. aufheizen lassen und vor dem Shot kurz spülen.
  </div>
  <div class="section-t">Darstellung</div><div class="card"><div class="setting"><span class="lbl">Design</span><div class="seg">${[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="setTheme" data-v="${k}">${n}</button>`).join('')}</div></div></div>
  ${window.Cloud ? Cloud.section() : ''}
  <div class="section-t">Daten</div>
  <div class="card menu">
    <button data-act="importNotebook"><span class="ico">📓</span>Notizbuch-Daten übernehmen</button>
    <button data-act="exportCsv"><span class="ico">📄</span>Shots als CSV exportieren</button>
    <button data-act="exportJson"><span class="ico">💾</span>Sicherung herunterladen (JSON)</button>
    <button data-act="importJson"><span class="ico">📥</span>Sicherung einspielen</button>
    <button data-act="wipe" class="red"><span class="ico">🗑️</span><span class="red">Alles löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>`;
  return h;
}

/* ───────── Shot-Formular mit Stoppuhr ───────── */
let F = null; // Formular-Zustand
const TM = { start: 0, fd: 0, end: 0, raf: 0, lock: null };
const timerRunning = () => !!(TM.start && !TM.end);

function stepper(key, label, val, step, unit) {
  return `<div class="step"><label>${label}</label><div class="sr">
    <button type="button" data-act="bump" data-k="${key}" data-d="-${step}" aria-label="${label} weniger">−</button>
    <input inputmode="decimal" data-f="${key}" value="${val == null ? '' : String(val).replace('.', ',')}" placeholder="–" aria-label="${label} ${unit}">
    <button type="button" data-act="bump" data-k="${key}" data-d="${step}" aria-label="${label} mehr">+</button>
  </div><span class="hint" data-hint="${key}"></span></div>`;
}
function shotForm(s, isNew) {
  const st = S.settings;
  const beanOpts = `<option value="">Ohne Sorte</option>` + S.beans.filter(b => !b.archived || b.id === s.bean).map(b => `<option value="${b.id}" ${b.id === s.bean ? 'selected' : ''}>${esc(b.name)}${b.roaster ? ' · ' + esc(b.roaster) : ''}</option>`).join('');
  let h = '';
  if (!isNew && s.din && s.dout && s.t) h += `<div style="margin-bottom:12px">${adviceCard(s, false).replace('Empfehlung für den nächsten Shot', 'Analyse dieses Shots')}</div>`;
  if (isNew) h += `<div class="card timer" id="timer">
      <div class="clock" id="clock">0,0<small> s</small></div>
      <div class="tstate" id="tstate">Siebträger rein, dann gleichzeitig Hebel hoch und Start</div>
      <div class="tbar" id="tbar"></div>
      <div class="tbtns" id="tbtns"></div>
    </div>`;
  h += `<div class="fgrid">
      ${stepper('din', 'In (g)', s.din, 0.1, 'Gramm')}
      ${stepper('dout', 'Out (g)', s.dout, 1, 'Gramm')}
      ${stepper('t', 'Zeit (s)', s.t, 1, 'Sekunden')}
      ${stepper('fd', '1. Tropfen (s)', s.fd, 1, 'Sekunden')}
      ${stepper('grind', 'Mahlgrad', s.grind, st.step, '')}
      <div class="step"><label>Temperatur</label><div class="seg" style="margin-top:6px">${TEMPS.map(t => `<button type="button" class="${s.temp === t ? 'on' : ''}" data-act="fSeg" data-k="temp" data-v="${t}">${t}</button>`).join('')}</div><span class="hint" data-hint="temp">${s.temp ? TEMP_C[s.temp] : ''}</span></div>
    </div>
    <div class="calc" id="calc"></div>
    <div class="field"><label class="flabel">Kaffeesorte</label><select data-f="bean">${beanOpts}</select></div>
    <div class="field"><div class="taste">
      <div class="tl"><span>Geschmack</span><b id="tasteLbl">${s.taste == null ? 'noch nicht bewertet' : Charts.TASTE[s.taste]}</b></div>
      <div class="tscale">${[-2, -1, 0, 1, 2].map(v => `<button type="button" data-act="fTaste" data-v="${v}" class="${s.taste === v ? 'on' : ''}">${['sehr<br>sauer', 'sauer', 'ausge&shy;wogen', 'bitter', 'sehr<br>bitter'][v + 2]}</button>`).join('')}</div>
      <div class="tl" style="margin:12px 2px 2px"><span>Bewertung</span></div>
      <div class="stars">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-act="fRate" data-v="${v}" class="${s.rating >= v ? 'on' : ''}" aria-label="${v} Sterne">★</button>`).join('')}</div>
    </div></div>
    <div class="field"><label class="flabel">Auffälligkeiten</label><div class="chiprow wrap">${TAGS.map(t => `<button type="button" class="chip ${(s.tags || []).includes(t) ? 'on' : ''}" data-act="fTag" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label class="flabel">Getränk</label><div class="chiprow wrap">${DRINKS.map(t => `<button type="button" class="chip ${s.drink === t ? 'on' : ''}" data-act="fSeg" data-k="drink" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label class="flabel">Pre-Infusion</label><div class="seg"><button type="button" class="${s.pi ? 'on' : ''}" data-act="fSeg" data-k="pi" data-v="1">an</button><button type="button" class="${!s.pi ? 'on' : ''}" data-act="fSeg" data-k="pi" data-v="0">aus</button></div></div>
    <div class="field"><label class="flabel">Notiz</label><textarea data-f="notes" rows="2" placeholder="z. B. neues Sieb, WDT, Puck-Screen …">${esc(s.notes || '')}</textarea></div>
    <div class="field"><label class="flabel">Datum & Uhrzeit (automatisch)</label><input type="datetime-local" data-f="ts" value="${toLocalInput(s.ts)}"></div>
    <div class="stack" style="margin-top:6px"><button class="btn primary" data-act="saveShot">Shot speichern</button>
    ${!isNew ? `<button class="btn danger" data-act="delShot">Shot löschen</button>` : ''}</div>`;
  return h;
}

function newShotDraft(from, fromId) {
  const st = S.settings, b = curBean(), T = targets(b);
  const last = lastShot(b ? b.id : '');
  const d = { id: uid(), ts: Date.now(), bean: b ? b.id : '', din: T.dose, dout: Advice.r05(T.dose * T.ratio), t: null, fd: null, grind: last ? last.grind : null, temp: last && last.temp ? last.temp : st.temp, pi: last ? last.pi !== false : st.pi, taste: null, rating: 0, tags: [], drink: 'Espresso', notes: '' };
  if (from === 'best') {
    const src = S.shots.find(x => x.id === fromId);
    if (src) Object.assign(d, { din: src.din, dout: src.dout, grind: src.grind, temp: src.temp, pi: src.pi, bean: src.bean });
  } else if (last) {
    const a = analyze(last);
    if (a.next) Object.assign(d, { din: a.next.din, dout: a.next.dout, grind: a.next.grind, temp: a.next.temp || d.temp });
  }
  return d;
}

function openShot(s, isNew) {
  F = { s: JSON.parse(JSON.stringify(s)), isNew, planned: { dout: s.dout } };
  TM.start = TM.fd = TM.end = 0;
  openSheet({
    title: isNew ? 'Neuer Shot' : 'Shot bearbeiten',
    right: `<button class="lnk r" data-act="saveShot">Sichern</button>`,
    body: shotForm(F.s, isNew),
    onClose: () => { stopTimer(true); F = null; },
  });
  if (isNew) drawTimer();
  updateForm();
}

function readForm() {
  const sh = sheetStack.length && sheetStack[sheetStack.length - 1].sh; if (!sh || !F) return;
  $$('[data-f]', sh).forEach(el => {
    const k = el.dataset.f;
    if (k === 'bean' || k === 'notes') F.s[k] = el.value;
    else if (k === 'ts') { const t = new Date(el.value).getTime(); if (!isNaN(t)) F.s.ts = t; }
    else F.s[k] = parseNum(el.value);
  });
}
function setField(k, v) {
  const el = $(`[data-f="${k}"]`, sheetStack[sheetStack.length - 1].sh);
  if (el) el.value = v == null ? '' : String(v).replace('.', ',');
  F.s[k] = v;
}
function updateForm() {
  if (!F) return;
  const sh = sheetStack[sheetStack.length - 1].sh, s = F.s, b = bean(s.bean), T = targets(b);
  const hint = (k, txt, cls) => { const el = $(`[data-hint="${k}"]`, sh); if (el) { el.textContent = txt; el.className = 'hint ' + (cls || ''); } };
  const tOut = s.din ? Advice.r05(s.din * T.ratio) : null;
  hint('din', `Ziel ${fmt(T.dose)} g`, s.din && Math.abs(s.din - T.dose) < 0.3 ? 'good' : '');
  hint('dout', tOut ? `Ziel ${fmt(tOut)} g` : '', s.dout && tOut && Math.abs(s.dout - tOut) <= 1 ? 'good' : s.dout ? 'warn' : '');
  hint('t', `Ziel ${T.tMin}–${T.tMax} s`, s.t ? (s.t >= T.tMin && s.t <= T.tMax ? 'good' : 'warn') : '');
  hint('fd', `sonst ${T.fdMin}–${T.fdMax} s`, s.fd ? (s.fd >= T.fdMin && s.fd <= T.fdMax ? 'good' : 'warn') : '');
  const last = lastShot(s.bean || '');
  hint('grind', last && F.isNew && last.grind != null ? (s.grind === last.grind ? 'wie zuletzt' : `zuletzt ${fmtG(last.grind)}`) : '', '');
  hint('temp', s.temp ? TEMP_C[s.temp] : '');
  const m = s.din && s.dout && s.t ? Advice.metrics(s, T.ratio) : null;
  const calc = $('#calc', sh);
  if (calc) calc.innerHTML = `<div>Ratio<b>${s.din && s.dout ? '1 : ' + fmt(s.dout / s.din) : '–'}</b></div><div>Fluss<b>${m ? fmt(m.flow) + ' g/s' : '–'}</b></div><div>Ab 1. Tropfen<b>${m && s.fd ? fmt(m.contact, 0) + ' s' : '–'}</b></div>`;
}

/* Stoppuhr */
function drawTimer() {
  const box = $('#tbtns'); if (!box) return;
  const run = timerRunning();
  $('#timer').classList.toggle('run', run);
  if (!TM.start) box.innerHTML = `<button class="btn primary wide" data-act="tStart">▶ Start</button>`;
  else if (run && !TM.fd) box.innerHTML = `<button class="btn soft" data-act="tDrop">💧 1. Tropfen</button><button class="btn primary" data-act="tStop">■ Stop</button>`;
  else if (run) box.innerHTML = `<button class="btn primary wide" data-act="tStop">■ Stop</button>`;
  else box.innerHTML = `<button class="btn plain wide" data-act="tReset">↺ Nochmal messen</button>`;
  tickTimer();
}
function tickTimer() {
  const c = $('#clock'); if (!c) return;
  const now = TM.end || (TM.start ? performance.now() : 0);
  const sec = TM.start ? (now - TM.start) / 1000 : 0;
  c.innerHTML = `${fmt(sec)}<small> s</small>`;
  const T = targets(bean(F && F.s.bean)), max = Math.max(45, T.tMax + 10), pct = v => Math.min(100, v / max * 100);
  const fd = TM.fd ? (TM.fd - TM.start) / 1000 : 0;
  $('#tbar').innerHTML = `<div class="zone" style="left:${pct(T.tMin)}%;width:${pct(T.tMax) - pct(T.tMin)}%"></div><div class="pi" style="width:${pct(fd || (TM.start && !TM.end ? sec : 0))}%"></div>${fd ? `<div class="ex" style="left:${pct(fd)}%;width:${Math.max(0, pct(sec) - pct(fd))}%"></div>` : ''}`;
  const stl = $('#tstate');
  if (!TM.start) stl.innerHTML = 'Siebträger rein, dann gleichzeitig Hebel hoch und <b>Start</b>';
  else if (!TM.end && !TM.fd) stl.innerHTML = sec < T.fdMin ? 'Pre-Infusion … beim <b>ersten Tropfen</b> tippen' : `Erster Tropfen? Sonst bei ${T.fdMin}–${T.fdMax} s`;
  else if (!TM.end) { const out = F && F.s.dout; stl.innerHTML = sec < T.tMin ? `Läuft … Ziel: <b>${out ? fmt(out) + ' g' : ''}</b> bei ${T.tMin}–${T.tMax} s` : sec <= T.tMax ? `<b>Im Zielfenster</b> – bei ${out ? fmt(out) + ' g' : 'Ziel'} stoppen` : 'Über dem Zielfenster – stoppen'; }
  else stl.innerHTML = `Gemessen: <b>${fmt(sec, 0)} s</b>${fd ? `, erster Tropfen <b>${fmt(fd, 0)} s</b>` : ''} – jetzt <b>Out</b> von der Waage eintragen`;
  if (timerRunning()) TM.raf = requestAnimationFrame(tickTimer);
}
async function lockScreen() { try { if (navigator.wakeLock) TM.lock = await navigator.wakeLock.request('screen'); } catch (e) { /* egal */ } }
function stopTimer(silent) {
  cancelAnimationFrame(TM.raf);
  if (TM.lock) { TM.lock.release().catch(() => {}); TM.lock = null; }
  if (silent) { TM.start = TM.fd = TM.end = 0; }
}

/* ───────── Bohnen-Formular ───────── */
function beanForm(b, isNew) {
  const st = S.settings;
  const n = isNew ? 0 : shotsOf(b.id).length;
  return `<div class="field"><label>Name / Sorte</label><input data-b="name" value="${esc(b.name || '')}" placeholder="z. B. Brasil Santos" autocomplete="off"></div>
    <div class="field"><label>Röster</label><input data-b="roaster" value="${esc(b.roaster || '')}" placeholder="z. B. Rösterei um die Ecke" autocomplete="off"></div>
    <div class="field"><label>Herkunft / Blend</label><input data-b="origin" value="${esc(b.origin || '')}" placeholder="z. B. 70 % Arabica, 30 % Robusta" autocomplete="off"></div>
    <div class="field"><label>Röstgrad</label><div class="seg">${ROASTS.map(r => `<button type="button" class="${b.roast === r.k ? 'on' : ''}" data-act="bSeg" data-v="${r.k}">${r.k}</button>`).join('')}</div></div>
    <div class="field"><label>Röstdatum</label><input type="date" data-b="roastDate" value="${esc(b.roastDate || '')}"></div>
    <div class="fgrid">
      <div class="field" style="margin:0"><label>Ziel-Dosis (g)</label><input inputmode="decimal" data-b="dose" value="${b.dose ? String(b.dose).replace('.', ',') : ''}" placeholder="${String(st.dose).replace('.', ',')}"></div>
      <div class="field" style="margin:0"><label>Ziel-Ratio 1 :</label><input inputmode="decimal" data-b="ratio" value="${b.ratio ? String(b.ratio).replace('.', ',') : ''}" placeholder="${String(st.ratio).replace('.', ',')}"></div>
    </div>
    <p class="small muted" style="margin:-4px 4px 12px">Faustregel: helle Röstung 1 : 2,2–2,5 · mittel 1 : 2 · dunkel 1 : 1,7–2.</p>
    <div class="field"><label>Notizen</label><textarea data-b="notes" rows="2" placeholder="Geschmack, Preis, wo gekauft …">${esc(b.notes || '')}</textarea></div>
    <div class="stack">
      <button class="btn primary" data-act="saveBean">${isNew ? 'Bohne anlegen' : 'Speichern'}</button>
      ${!isNew ? `<button class="btn soft" data-act="useBean">Als aktuelle Sorte wählen</button>
      <button class="btn plain" data-act="archiveBean">${b.archived ? 'Wieder aktivieren' : 'Tüte leer (archivieren)'}</button>
      <button class="btn danger" data-act="delBean">Löschen${n ? ` (${n} Shots bleiben erhalten)` : ''}</button>` : ''}
    </div>`;
}
let B = null;
function openBean(b, isNew) {
  B = { b: { ...b }, isNew };
  openSheet({ title: isNew ? 'Neue Bohne' : 'Bohne bearbeiten', right: `<button class="lnk r" data-act="saveBean">Sichern</button>`, body: beanForm(B.b, isNew), onClose: () => { B = null; } });
}

/* ───────── Export ───────── */
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ───────── Aktionen ───────── */
const ACT = {
  tab(el) { S.ui.view = el.dataset.view; save(true); render(); window.scrollTo(0, 0); },
  pickBean(el) { S.ui.bean = el.dataset.id; save(true); render(); },
  logBean(el) { S.ui.logBean = el.dataset.id; save(true); render(); },
  closeSheet() { if (timerRunning()) { toast('Erst die Stoppuhr anhalten'); return; } closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },

  newShot(el) { openShot(newShotDraft(el.dataset.from, el.dataset.id), true); },
  editShot(el) { const s = S.shots.find(x => x.id === el.dataset.id); if (s) openShot(s, false); },
  bump(el) {
    readForm();
    const k = el.dataset.k, d = parseFloat(el.dataset.d);
    let v = F.s[k];
    if (v == null) v = k === 'din' ? targets(bean(F.s.bean)).dose : k === 'dout' ? (F.s.din || 18) * 2 : k === 't' ? 28 : k === 'fd' ? 9 : 0;
    else v = v + d;
    const dec = k === 'din' ? 1 : k === 'grind' ? 2 : 1;
    setField(k, Math.max(0, +v.toFixed(dec))); vib(6); updateForm();
  },
  fSeg(el) {
    readForm(); const k = el.dataset.k;
    let v = el.dataset.v; if (k === 'pi') v = v === '1';
    F.s[k] = (k === 'drink' && F.s.drink === v) ? '' : v;
    $$(`[data-act="fSeg"][data-k="${k}"]`, el.closest('.sheet')).forEach(b => b.classList.toggle('on', k === 'pi' ? (b.dataset.v === '1') === F.s.pi : b.dataset.v === F.s[k]));
    updateForm();
  },
  fTaste(el) {
    readForm(); const v = +el.dataset.v; F.s.taste = F.s.taste === v ? null : v;
    $$('[data-act="fTaste"]', el.closest('.sheet')).forEach(b => b.classList.toggle('on', +b.dataset.v === F.s.taste));
    $('#tasteLbl').textContent = F.s.taste == null ? 'noch nicht bewertet' : Charts.TASTE[F.s.taste]; vib(6);
  },
  fRate(el) {
    const v = +el.dataset.v; F.s.rating = F.s.rating === v ? 0 : v;
    $$('[data-act="fRate"]', el.closest('.sheet')).forEach(b => b.classList.toggle('on', +b.dataset.v <= F.s.rating)); vib(6);
  },
  fTag(el) {
    const v = el.dataset.v, tags = F.s.tags = F.s.tags || [];
    const i = tags.indexOf(v); if (i >= 0) tags.splice(i, 1); else tags.push(v);
    el.classList.toggle('on', i < 0);
  },
  tStart() { TM.start = performance.now(); TM.fd = TM.end = 0; vib(20); lockScreen(); drawTimer(); },
  tDrop() { TM.fd = performance.now(); vib(12); drawTimer(); },
  tStop() {
    TM.end = performance.now(); vib([20, 40, 20]); stopTimer();
    setField('t', Math.round((TM.end - TM.start) / 1000));
    if (TM.fd) setField('fd', Math.round((TM.fd - TM.start) / 1000));
    drawTimer(); updateForm();
    const o = $('[data-f="dout"]'); if (o) { o.select?.(); }
  },
  tReset() { TM.start = TM.fd = TM.end = 0; drawTimer(); },
  saveShot() {
    if (timerRunning()) { toast('Erst die Stoppuhr anhalten'); return; }
    readForm(); const s = F.s;
    if (!(s.din > 0) || !(s.dout > 0) || !(s.t > 0)) { toast('Bitte In, Out und Zeit eintragen'); return; }
    if (s.fd != null && s.fd >= s.t) s.fd = null;
    const i = S.shots.findIndex(x => x.id === s.id);
    if (i >= 0) S.shots[i] = s; else S.shots.push(s);
    if (s.bean) S.ui.bean = s.bean;
    save(); const isNew = F.isNew; closeSheet();
    if (isNew) { S.ui.view = 'shot'; render(); window.scrollTo(0, 0); const a = analyze(s); toast(a.status === 'good' ? 'Gespeichert ✓ ' + a.title : 'Gespeichert – Empfehlung ist aktualisiert'); }
    else { render(); toast('Gespeichert'); }
  },
  delShot() {
    const s = F.s, before = S.shots.slice();
    S.shots = S.shots.filter(x => x.id !== s.id); save(); closeSheet(); render();
    toast('Shot gelöscht', { label: 'Rückgängig', fn: () => { S.shots = before; save(); render(); } });
  },

  newBean() { openBean({ id: uid(), roast: 'mittel', roastDate: '', created: Date.now() }, true); },
  editBean(el) { const b = bean(el.dataset.id); if (b) openBean(b, false); },
  bSeg(el) { B.b.roast = B.b.roast === el.dataset.v ? '' : el.dataset.v; $$('[data-act="bSeg"]', el.closest('.sheet')).forEach(x => x.classList.toggle('on', x.dataset.v === B.b.roast)); },
  saveBean() {
    const sh = sheetStack[sheetStack.length - 1].sh, b = B.b;
    $$('[data-b]', sh).forEach(el => { const k = el.dataset.b; b[k] = (k === 'dose' || k === 'ratio') ? parseNum(el.value) : el.value.trim(); });
    if (!b.name) { toast('Bitte einen Namen eingeben'); return; }
    const i = S.beans.findIndex(x => x.id === b.id);
    if (i >= 0) S.beans[i] = b; else { S.beans.push(b); S.ui.bean = b.id; }
    const wasNew = B.isNew; save(); closeSheet(); render(); toast(wasNew ? 'Bohne angelegt' : 'Gespeichert');
  },
  useBean() { S.ui.bean = B.b.id; if (B.b.archived) { const b = bean(B.b.id); if (b) b.archived = false; } save(); closeSheet(); S.ui.view = 'shot'; render(); },
  archiveBean() { const b = bean(B.b.id); if (!b) return; b.archived = !b.archived; if (b.archived && S.ui.bean === b.id) S.ui.bean = ''; save(); closeSheet(); render(); toast(b.archived ? 'Archiviert' : 'Wieder aktiv'); },
  delBean() {
    const id = B.b.id;
    confirmSheet('Diese Bohne löschen? Die Shots bleiben erhalten (als „Ohne Sorte“).', 'Löschen', () => {
      S.beans = S.beans.filter(b => b.id !== id);
      S.shots.forEach(s => { if (s.bean === id) s.bean = ''; });
      if (S.ui.bean === id) S.ui.bean = '';
      save(); closeAllSheets(); render();
    });
  },

  setDir(el) { S.settings.coarserUp = el.dataset.v === '1'; save(); render(); },
  setTemp(el) { S.settings.temp = el.dataset.v; save(); render(); },
  setPi(el) { S.settings.pi = el.dataset.v === '1'; save(); render(); },
  setTheme(el) { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  exportCsv() {
    const head = ['Datum', 'Kaffee', 'Röster', 'In (g)', 'Out (g)', 'Ratio', 'Zeit (s)', '1. Tropfen (s)', 'Mahlgrad', 'Temp', 'Pre-Infusion', 'Geschmack', 'Bewertung', 'Getränk', 'Auffälligkeiten', 'Notiz'];
    const q = v => { const t = String(v ?? ''); return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const rows = shotsOf('all').map(s => { const b = bean(s.bean); return [new Date(s.ts).toLocaleString('de-DE'), b ? b.name : '', b ? b.roaster : '', fmt(s.din), fmt(s.dout), s.dout && s.din ? fmt(s.dout / s.din, 2) : '', fmt(s.t, 0), s.fd ? fmt(s.fd, 0) : '', fmtG(s.grind), s.temp || '', s.pi ? 'an' : 'aus', s.taste == null ? '' : Charts.TASTE[s.taste], s.rating || '', s.drink || '', (s.tags || []).join(', '), s.notes || ''].map(q).join(';'); });
    download(`kaffee-shots-${dayKey(Date.now())}.csv`, '﻿' + [head.join(';'), ...rows].join('\n'), 'text/csv');
  },
  exportJson() { download(`kaffee-sicherung-${dayKey(Date.now())}.json`, JSON.stringify({ app: 'kaffee', v: 1, shots: S.shots, beans: S.beans, settings: S.settings }, null, 1), 'application/json'); },
  importJson() { $('#importFile').click(); },
  async importNotebook() {
    let j;
    try { const r = await fetch('notizbuch.json', { cache: 'no-cache' }); j = await r.json(); } catch (e) { toast('Notizbuch-Daten nicht erreichbar – Internet prüfen'); return; }
    const have = new Set(S.shots.map(s => s.id)), newShots = j.shots.filter(s => !have.has(s.id));
    if (!newShots.length) { toast('Notizbuch ist schon übernommen'); return; }
    confirmSheet(`${newShots.length} Shots aus dem Notizbuch übernehmen? Das Datum ist dort nicht notiert – die Reihenfolge bleibt erhalten, die Tage sind Platzhalter. Außerdem werden deine notierten Ziele gesetzt: 18 g → 36–40 g in 25–30 s.`, 'Übernehmen', () => {
      for (const b of j.beans) if (!bean(b.id)) S.beans.push(b);
      for (const x of newShots) { const { d, ...s } = x; s.ts = new Date(d).getTime(); S.shots.push(s); }
      Object.assign(S.settings, j.settings);
      S.ui.bean = 'nb-greenlion';
      save(); render(); toast(`${newShots.length} Shots übernommen ✓`);
    });
  },
  wipe() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Shots, Bohnen und Einstellungen löschen – auch online und auf allen verbundenen Geräten?' : 'Alle Shots, Bohnen und Einstellungen auf diesem Gerät löschen?', 'Alles löschen', () => {
      if (window.Cloud) Cloud.allowBulkDelete();
      S = fresh(); save(); applyTheme(); render(); toast('Alles gelöscht');
    });
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault();
  try { fn(el, e); } catch (err) { console.error(err); toast('Das hat nicht geklappt'); }
});
document.addEventListener('input', e => {
  if (e.target.matches('[data-f]') && F) { readForm(); updateForm(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('[data-f="bean"]') && F) { readForm(); updateForm(); }
  if (el.matches('[data-set]')) {
    const k = el.dataset.set;
    if (el.type === 'text' && (k === 'grinder' || k === 'machine')) S.settings[k] = el.value.trim() || fresh().settings[k];
    else { const v = parseNum(el.value); if (v != null && v > 0) S.settings[k] = v; else el.value = String(S.settings[k]).replace('.', ','); }
    if (S.settings.tMin >= S.settings.tMax) S.settings.tMax = S.settings.tMin + 1;
    if (S.settings.fdMin >= S.settings.fdMax) S.settings.fdMax = S.settings.fdMin + 1;
    save(); toast('Gespeichert');
  }
  if (el.id === 'importFile' && el.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (!j || !Array.isArray(j.shots)) throw new Error('kein Kaffee-Backup');
        confirmSheet(`Sicherung mit ${j.shots.length} Shots und ${(j.beans || []).length} Bohnen einspielen? Vorhandene Einträge mit gleicher Kennung werden ersetzt.`, 'Einspielen', () => {
          const merge = (cur, add) => { const m = new Map(cur.map(x => [x.id, x])); for (const x of add || []) if (x && x.id) m.set(x.id, x); return [...m.values()]; };
          S.shots = merge(S.shots, j.shots); S.beans = merge(S.beans, j.beans);
          if (j.settings) S.settings = { ...S.settings, ...j.settings };
          save(); applyTheme(); render(); toast('Sicherung eingespielt');
        });
      } catch (err) { toast('Datei konnte nicht gelesen werden'); }
      el.value = '';
    };
    r.readAsText(el.files[0]);
  }
});

/* ───────── Tooltips (Punkte) & Fadenkreuz (Linien) ───────── */
const tip = $('#tip');
function showTip(html, x, y) {
  tip.innerHTML = html; tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + 'px';
  tip.style.top = (y - h - 14 < 8 ? y + 18 : y - h - 14) + 'px';
}
const hideTip = () => { tip.hidden = true; $$('.xh').forEach(l => { l.style.visibility = 'hidden'; }); };
function onPoint(e) {
  const t = e.target;
  if (t.dataset && t.dataset.tip) { const r = t.getBoundingClientRect(); showTip(t.dataset.tip, r.left + r.width / 2, r.top + r.height / 2); return; }
  const svg = t.closest && t.closest('svg[data-xh]');
  if (svg) {
    const pts = JSON.parse(svg.dataset.xh), r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const x = (e.clientX - r.left) * vb.width / r.width;
    let best = pts[0]; for (const p of pts) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    const l = $('.xh', svg); l.setAttribute('x1', best.x); l.setAttribute('x2', best.x); l.style.visibility = 'visible';
    showTip(best.tip, r.left + best.x * r.width / vb.width, r.top + 20);
    return;
  }
  hideTip();
}
document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') onPoint(e); });
document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') onPoint(e); });
document.addEventListener('focusin', e => { if (e.target.dataset && e.target.dataset.tip) onPoint(e); });
window.addEventListener('scroll', hideTip, { passive: true });

render();

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
const CLOUD_ARR = { shot: ['s:', 'shots'], bean: ['b:', 'beans'] };
const SYNC_SETTINGS = ['dose', 'ratio', 'tMin', 'tMax', 'fdMin', 'fdMax', 'machine', 'temp', 'pi', 'grinder', 'coarserUp', 'step', 'spu'];
if (window.Cloud) Cloud.init({
  app: 'kaffee',
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(CLOUD_ARR)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    const st = {}, def = fresh().settings;
    for (const k of SYNC_SETTINGS) st[k] = S.settings[k];
    m.settings = { kind: 'settings', data: st, soft: SYNC_SETTINGS.every(k => st[k] === def[k]) };
    return m;
  },
  apply(r) {
    if (CLOUD_ARR[r.kind]) {
      const rid = r.id.slice(2), arr = S[CLOUD_ARR[r.kind][1]], i = arr.findIndex(x => x.id === rid);
      if (r.deleted) { if (i >= 0) arr.splice(i, 1); } else if (r.data && typeof r.data === 'object') { if (i >= 0) arr[i] = r.data; else arr.push(r.data); }
    } else if (r.kind === 'settings' && r.data && !r.deleted) Object.assign(S.settings, r.data);
  },
  persist() { save(true); },
  refresh() { if (F || B) { needRender = true; return; } const y = window.scrollY; render(); window.scrollTo(0, y); },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  openSettings() { closeAllSheets(); S.ui.view = 'more'; save(true); render(); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
