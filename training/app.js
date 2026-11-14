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
const DAY = 864e5;
const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DAYS_S = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
const shortDate = d => `${d.getDate()}.${d.getMonth() + 1}.`;
const num = (n, dec = 1) => n == null || isNaN(n) ? '–' : String(Math.round(n * 10 ** dec) / 10 ** dec).replace('.', ',');
const pnum = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? null : n; };
const fmtMin = m => { m = Math.round(m || 0); return m >= 60 ? `${Math.floor(m / 60)}:${pad(m % 60)} h` : `${m} min`; };
const vib = n => { if (navigator.vibrate) navigator.vibrate(n || 8); };
const weekStart = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; };
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 3 - (t.getUTCDay() + 6) % 7);
  const y1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((t - y1) / DAY - 3 + (y1.getUTCDay() + 6) % 7) / 7);
}
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

/* ───────── Einheiten-Arten ───────── */
// rad = zählt in Radstunden · q = Qualitätseinheit (SST/KA) · kraft = Krafteinheit mit Übungsliste
const TYPES = [
  { k: 'sst', n: 'Rolle SST', e: '🔥', rad: true, q: true },
  { k: 'ka', n: 'Rolle KA', e: '⛰️', rad: true, q: true },
  { k: 'ga', n: 'Rolle GA', e: '🚲', rad: true },
  { k: 'frei', n: 'Rolle frei', e: '🎮', rad: true },
  { k: 'out', n: 'Draußen', e: '🌄', rad: true },
  { k: 'kA', n: 'Kraft A', e: '🏋️', kraft: true },
  { k: 'kB', n: 'Kraft B', e: '🤸', kraft: true },
  { k: 'ft', n: 'Fußballtennis', e: '⚽' },
  { k: 'mob', n: 'Mobility', e: '🧘' },
];
const typ = k => TYPES.find(t => t.k === k) || { k, n: k, e: '•' };
const kindOf = k => typ(k).rad ? 'rad' : typ(k).kraft ? 'kraft' : 'other';
const isHard = u => (u.rpe || 0) >= 7; // Faustregel: ab RPE 7 zählt eine Einheit als hart
const EX_DEF = {
  kA: ['Ring Fallout', 'Hollow Body (s)', 'Klimmzug', 'Goblet Squat 3-1-1', 'RDL einbeinig (je Seite)', 'Ring Row', 'Ring-Liegestütz'],
  kB: ['Hollow Body (s)', 'Seitstütz (s)', 'Liegestütz-Stufe', 'Pike Push-up', 'Handtuch-Rudern', 'Glute Bridge einbeinig'],
};
const FEEL = ['', '😫', '😕', '😐', '🙂', '💪'];

/* ───────── State ───────── */
const KEY = 'training.v1';
function fresh() {
  return {
    v: 1, days: {}, units: [],
    settings: { theme: 'auto', boden: 2.5, decke: 6.5, kA: [...EX_DEF.kA], kB: [...EX_DEF.kB] },
    ui: { view: 'heute' },
  };
}
function migrate(s) {
  const f = fresh();
  return { ...f, ...s, days: s.days || {}, units: Array.isArray(s.units) ? s.units : [], settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui } };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* ignore */ }
  return fresh();
}
let S = load();
function save(fromServer) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  if (!fromServer && window.Cloud) Cloud.soon();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const ui = { week: 0, statSel: {}, lastDay: dkey(new Date()) };

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#0f1415' : '#f2f6f7';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ───────── Auswertung ───────── */
const unitsOn = key => S.units.filter(u => u.d === key).sort((a, b) => (a.t || 0) - (b.t || 0));
// Basiswert = Median der letzten 14 Tage vor dem Stichtag (mind. 4 Werte)
function base(field, key, n = 14) {
  const vals = [];
  for (let i = 1; i <= n; i++) { const d = S.days[dkey(addDays(fromKey(key), -i))]; if (d && d[field] != null) vals.push(d[field]); }
  return vals.length >= 4 ? median(vals) : null;
}
function ampel(key) {
  const d = S.days[key];
  if (!d) return { c: 'n', why: [] };
  const why = []; let lvl = 0;
  const up = (l, t) => { lvl = Math.max(lvl, l); why.push(t); };
  const rb = base('rhr', key), hb = base('hrv', key);
  if (d.schlaf != null) { if (d.schlaf < 5) up(2, `Schlaf ${num(d.schlaf)} h (unter 5 h)`); else if (d.schlaf < 6.5) up(1, `Schlaf ${num(d.schlaf)} h (unter 6,5 h)`); }
  if (d.wach != null && d.wach >= 3) up(1, `${d.wach}× aufgewacht`);
  if (d.rhr != null && rb != null) {
    const df = d.rhr - rb;
    if (df >= 7) up(2, `Ruhepuls ${d.rhr}, +${num(df, 0)} über Basis ${num(rb, 0)}`);
    else if (df >= 4) up(1, `Ruhepuls ${d.rhr}, +${num(df, 0)} über Basis ${num(rb, 0)}`);
  }
  if (d.hrv != null && hb != null && d.hrv < hb * 0.85) up(1, `HRV ${d.hrv}, ${Math.round((1 - d.hrv / hb) * 100)} % unter Basis ${num(hb, 0)}`);
  if (d.gefuehl != null) { if (d.gefuehl <= 1) up(2, 'Gefühl 1 von 5'); else if (d.gefuehl === 2) up(1, 'Gefühl 2 von 5'); }
  return { c: ['g', 'y', 'r'][lvl], why, rb, hb };
}
const AMP_TXT = {
  g: ['🟢', 'Harte Einheit passt', 'Steht SST oder KA an, dann heute.'],
  y: ['🟡', 'Nur mit Vorbehalt', 'Harte Einheit nur, wenn sich das Einfahren gut anfühlt – sonst einen Block weniger oder locker.'],
  r: ['🔴', 'Heute locker oder frei', 'Harte Einheit auf die nächste bessere Nacht schieben.'],
  n: ['⚪️', 'Morgenwerte fehlen', 'Schlaf und Ruhepuls eintragen, dann gibt es die Tagesampel.'],
};
// Langfristplan: Rückstufung auf Erhaltung, wenn der Ruhepuls 3 Tage in Folge > +7 über Basis liegt
function rhrStreak(key) {
  for (let i = 0; i < 3; i++) {
    const k = dkey(addDays(fromKey(key), -i)), d = S.days[k], b = base('rhr', k);
    if (!d || d.rhr == null || b == null || d.rhr - b < 7) return false;
  }
  return true;
}
function weekStats(ws) {
  const keys = [...Array(7)].map((_, i) => dkey(addDays(ws, i)));
  const us = S.units.filter(u => keys.includes(u.d));
  const dv = keys.map(k => S.days[k]).filter(Boolean);
  const av = f => avg(dv.map(d => d[f]).filter(x => x != null));
  return {
    keys, us,
    radMin: us.filter(u => typ(u.typ).rad).reduce((a, u) => a + (u.min || 0), 0),
    q: us.filter(u => typ(u.typ).q).length,
    kraft: us.filter(u => typ(u.typ).kraft).length,
    hard: us.filter(isHard).length,
    schlaf: av('schlaf'), rhr: av('rhr'), hrv: av('hrv'), kg: av('kg'),
  };
}
function lastSets(name, exceptId) {
  const us = S.units.filter(u => u.id !== exceptId && u.sets && u.sets[name]).sort((a, b) => b.d.localeCompare(a.d) || (b.t || 0) - (a.t || 0));
  return us[0] ? { v: us[0].sets[name], d: us[0].d } : null;
}

/* ───────── Toast & Sheets ───────── */
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

/* ───────── Ansichten ───────── */
const TITLES = { heute: 'Heute', woche: 'Woche', verlauf: 'Verlauf', mehr: 'Mehr' };
function render() {
  const v = S.ui.view, now = new Date();
  $('#title').textContent = TITLES[v];
  $('#sub').textContent = v === 'heute' ? `${DAYS[now.getDay()]}, ${fmtDate(now)} · KW ${isoWeek(now)}` : '';
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (v === 'heute' || v === 'woche' ? `<button class="hbtn" data-act="unitAdd" aria-label="Einheit eintragen"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>` : '');
  const main = $('#main');
  if (v === 'heute') main.innerHTML = viewHeute();
  if (v === 'woche') main.innerHTML = viewWoche();
  if (v === 'verlauf') main.innerHTML = viewVerlauf();
  if (v === 'mehr') main.innerHTML = viewMehr();
}

/* ── Heute ── */
function viewHeute() {
  const k = dkey(new Date()), d = S.days[k], a = ampel(k), t = AMP_TXT[a.c];
  let h = '';
  if (rhrStreak(k)) h += `<div class="warn">Ruhepuls seit 3 Tagen mindestens 7 Schläge über Basis – laut Plan auf Erhaltung zurückstufen.</div>`;
  h += `<button class="card amp ${a.c}" style="width:100%;text-align:left" data-act="dayEdit" data-d="${k}"><div class="dot">${t[0]}</div><div><b>${t[1]}</b><p>${t[2]}</p>${a.why.length ? `<ul>${a.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}</div></button>`;
  if (d) {
    h += `<div class="status">
      <button class="card st" data-act="dayEdit" data-d="${k}"><small>😴 Schlaf</small><b>${num(d.schlaf)} h</b><span>${d.wach != null ? d.wach + '× wach' : '&nbsp;'}</span></button>
      <button class="card st" data-act="dayEdit" data-d="${k}"><small>❤️ Ruhepuls</small><b>${d.rhr ?? '–'}</b><span>${a.rb != null ? 'Basis ' + num(a.rb, 0) : 'Basis ab 4 Tagen'}</span></button>
      <button class="card st" data-act="dayEdit" data-d="${k}"><small>〰️ HRV</small><b>${d.hrv ?? '–'}</b><span>${a.hb != null ? 'Basis ' + num(a.hb, 0) : '&nbsp;'}</span></button>
      <button class="card st" data-act="dayEdit" data-d="${k}"><small>Gefühl</small><b>${d.gefuehl ? FEEL[d.gefuehl] + ' ' + d.gefuehl + '/5' : '–'}</b><span>${d.kg != null ? num(d.kg) + ' kg' : '&nbsp;'}</span></button>
    </div>`;
  } else {
    h += `<button class="btn primary" style="width:100%;margin-bottom:10px" data-act="dayEdit" data-d="${k}">☀️ Morgenwerte eintragen</button>`;
  }
  h += weekCard(weekStats(weekStart(new Date())), true);
  h += `<div class="section-t">Einheiten heute<button data-act="unitAdd">+ Einheit</button></div>`;
  const us = unitsOn(k);
  h += us.length ? `<div class="card">${us.map(urowHTML).join('')}</div>`
    : `<div class="card empty"><div class="big">🚲</div><b>Noch keine Einheit</b>Nach dem Training kurz eintragen: Art, Dauer, RPE.</div>`;
  return h;
}
function weekCard(w, link) {
  const b = S.settings.boden, dk = S.settings.decke, max = Math.max(dk, w.radMin / 60, 0.1);
  return `<${link ? 'button data-act="tab" data-view="woche" style="width:100%;text-align:left;display:block"' : 'div'} class="card chart" ${link ? '' : ''}>
    <div class="ch-h"><b>Radstunden diese Woche</b><span>Boden ${num(b)} h · Decke ${num(dk)} h</span></div>
    <div class="ch-v">${num(w.radMin / 60)}<small>h</small></div>
    <div class="pbar"><i style="width:${Math.min(100, w.radMin / 60 / max * 100)}%;${w.radMin / 60 < b ? 'background:#f08c00' : ''}"></i><u style="left:${b / max * 100}%"></u></div>
    <div class="pkv"><span>Qualität <b>${w.q}/2</b></span><span>Kraft <b>${w.kraft}/2</b></span><span>Hart <b style="${w.hard > 2 ? 'color:var(--red-t)' : ''}">${w.hard}</b>${w.hard > 2 ? ' ⚠︎' : ''}</span></div>
  </${link ? 'button' : 'div'}>`;
}
function urowHTML(u) {
  const t = typ(u.typ);
  const bits = [u.rpe ? 'RPE ' + u.rpe : '', u.w ? u.w + ' W' : '', u.hf ? 'HF ' + u.hf : ''];
  if (u.sets) { const n = Object.keys(u.sets).filter(x => u.sets[x]).length; if (n) bits.push(n + (n === 1 ? ' Übung' : ' Übungen')); }
  if (u.note) bits.push(u.note);
  return `<button class="urow" data-act="unitEdit" data-id="${u.id}"><span class="e">${t.e}</span><span><b>${esc(t.n)}</b><small>${esc(bits.filter(Boolean).join(' · ')) || '&nbsp;'}</small></span><span class="m">${fmtMin(u.min)}</span></button>`;
}

/* ── Woche ── */
function viewWoche() {
  const ws = addDays(weekStart(new Date()), ui.week * 7), w = weekStats(ws), today = dkey(new Date());
  let h = `<div class="daynav"><button class="icon-btn" data-act="weekShift" data-n="-1">‹</button>
    <div class="daylabel"><b>KW ${isoWeek(ws)}</b><span>${shortDate(ws)} – ${shortDate(addDays(ws, 6))}${ui.week === 0 ? ' · diese Woche' : ''}</span></div>
    <button class="icon-btn" data-act="weekShift" data-n="1" ${ui.week >= 0 ? 'disabled' : ''}>›</button></div>`;
  h += weekCard(w, false);
  h += `<div class="sum" style="margin-top:10px"><span>Ø Schlaf <b>${num(w.schlaf)} h</b></span><span>Ø Ruhepuls <b>${num(w.rhr, 0)}</b></span><span>Ø HRV <b>${num(w.hrv, 0)}</b></span>${w.kg != null ? `<span>Ø <b>${num(w.kg)} kg</b></span>` : ''}</div>`;
  if (w.hard > 2) h += `<div class="warn">${w.hard} harte Einheiten (RPE ≥ 7) – Regel: zwei pro Woche, nie drei.</div>`;
  h += `<div class="card">${w.keys.map(k => {
    const d = S.days[k], dt = fromKey(k), us = unitsOn(k);
    const vals = d ? [d.schlaf != null ? num(d.schlaf) + ' h' : '', d.wach != null ? d.wach + '× wach' : '', d.rhr != null ? 'RHR ' + d.rhr : '', d.hrv != null ? 'HRV ' + d.hrv : '', d.gefuehl ? FEEL[d.gefuehl] : ''].filter(Boolean).join(' · ') : '<span style="color:var(--t3)">keine Morgenwerte</span>';
    return `<button class="drow ${k === today ? 'today' : ''}" data-act="dayOpen" data-d="${k}"><span class="dl"><b>${DAYS_S[dt.getDay()]}</b><small>${shortDate(dt)}</small></span>
      <span class="dv">${vals}${us.length ? `<span class="tags">${us.map(u => `<span class="tag ${typ(u.typ).q ? 'q' : ''}">${typ(u.typ).e} ${esc(typ(u.typ).n)} ${u.min ? Math.round(u.min) + '′' : ''}</span>`).join('')}</span>` : ''}</span></button>`;
  }).join('')}</div>`;
  return h;
}

/* ── Verlauf ── */
function barChart(id, title, labels, vals, { fmt = v => num(v), unit = '', goal = null, floor = 0, low = null, sub = '' } = {}) {
  const present = vals.filter(v => v != null);
  const top = Math.max(...present, goal || 0, floor + 1);
  const n = vals.length, sel = ui.statSel[id] ?? n - 1;
  const hgt = v => v == null ? 0 : Math.max(2, (v - floor) / (top - floor) * 100);
  const cls = n === 8 ? 'w8' : n === 14 ? 'd14' : '';
  return `<div class="card chart">
    <div class="ch-h"><b>${title}</b><span>${sub || (present.length ? 'Ø ' + fmt(avg(present)) + (unit ? ' ' + unit : '') : '')}</span></div>
    <div class="ch-v">${vals[sel] != null ? fmt(vals[sel]) : '–'}${unit ? `<small>${unit}</small>` : ''}<small>${esc(labels[sel])}</small></div>
    <div class="bars ${cls}">${goal != null ? `<span class="goal" style="bottom:${(goal - floor) / (top - floor) * 100}%"></span>` : ''}${vals.map((v, i) => `<button class="bar ${i === sel ? 'sel' : ''} ${v == null || v === 0 ? 'zero' : ''} ${low != null && v != null && v < low ? 'lo' : ''}" data-act="statSel" data-c="${id}" data-i="${i}"><i style="height:${hgt(v)}%"></i></button>`).join('')}</div>
    <div class="blbl ${cls}">${labels.map((l, i) => `<span class="${i === sel ? 'sel' : ''}">${n === 14 ? (i % 2 ? '' : esc(l.split(' ')[0])) : esc(l.split(' ')[0])}</span>`).join('')}</div>
  </div>`;
}
function viewVerlauf() {
  const now = new Date(), ws0 = weekStart(now);
  const wks = [...Array(8)].map((_, i) => addDays(ws0, (i - 7) * 7));
  const wst = wks.map(weekStats);
  const days = [...Array(14)].map((_, i) => dkey(addDays(now, i - 13)));
  const dl = days.map(k => { const d = fromKey(k); return `${DAYS_S[d.getDay()]} ${shortDate(d)}`; });
  const f = fld => days.map(k => S.days[k] && S.days[k][fld] != null ? S.days[k][fld] : null);
  const rhr = f('rhr'), rhrV = rhr.filter(v => v != null);
  let h = `<div class="charts">
    ${barChart('wk', 'Radstunden pro Woche', wks.map(w => 'KW' + isoWeek(w)), wst.map(w => w.radMin / 60), { unit: 'h', goal: S.settings.boden, low: S.settings.boden, sub: 'Linie = Boden ' + num(S.settings.boden) + ' h' })}
    ${barChart('q', 'Qualitätseinheiten pro Woche', wks.map(w => 'KW' + isoWeek(w)), wst.map(w => w.q), { fmt: v => num(v, 0), goal: 2, sub: 'Ziel 2' })}
    ${barChart('sl', 'Schlaf', dl, f('schlaf'), { unit: 'h', low: 6.5 })}
    ${barChart('rhr', 'Ruhepuls', dl, rhr, { fmt: v => num(v, 0), floor: rhrV.length ? Math.min(...rhrV) - 5 : 0 })}
  </div>`;
  h += kraftHTML('kA') + kraftHTML('kB');
  return h;
}
function kraftHTML(k) {
  const us = S.units.filter(u => u.typ === k && u.sets).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 4);
  let h = `<div class="section-t">${typ(k).e} ${typ(k).n} – letzte Einheiten</div>`;
  if (!us.length) return h + `<div class="card empty" style="padding:18px">Noch keine ${typ(k).n} mit Wiederholungen eingetragen.</div>`;
  return h + `<div class="card" style="padding:2px 6px;overflow-x:auto"><table class="tbl"><tr><th>Übung</th>${us.map(u => `<th>${shortDate(fromKey(u.d))}</th>`).join('')}</tr>
    ${S.settings[k].map(ex => `<tr><td>${esc(ex)}</td>${us.map(u => `<td>${esc(u.sets[ex] || '–')}</td>`).join('')}</tr>`).join('')}</table></div>`;
}

/* ── Mehr ── */
function viewMehr() {
  const st = S.settings, th = st.theme;
  return `<div class="section-t">Wochenziel Rad</div>
  <div class="card">
    <label class="setting"><span class="lbl">Boden (h/Woche)</span><input type="text" inputmode="decimal" data-change="boden" value="${num(st.boden)}"></label>
    <label class="setting"><span class="lbl">Decke (h/Woche)</span><input type="text" inputmode="decimal" data-change="decke" value="${num(st.decke)}"></label>
  </div>
  <div class="section-t">Kraft-Übungen</div>
  <div class="card" style="padding:12px 14px">
    <span class="flab">Kraft A – eine Übung pro Zeile</span>
    <textarea class="exed" data-change="exA">${esc(st.kA.join('\n'))}</textarea>
    <span class="flab" style="margin-top:12px">Kraft B – eine Übung pro Zeile</span>
    <textarea class="exed" data-change="exB">${esc(st.kB.join('\n'))}</textarea>
  </div>
  <div class="section-t">Anzeige</div>
  <div class="card"><div class="setting"><span class="lbl">Design</span><div class="seg">${[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button data-act="theme" data-v="${k}" class="${th === k ? 'on' : ''}">${n}</button>`).join('')}</div></div></div>
  ${window.Cloud ? Cloud.section() : ''}
  <div class="section-t">Für Claude & Daten</div>
  <div class="card menu">
    <button data-act="copyClaude"><span class="ico">🤖</span>Letzte 4 Wochen für Claude kopieren</button>
    <button data-act="exportCsv"><span class="ico">📊</span>Tabelle exportieren (CSV)</button>
    <button data-act="exportData"><span class="ico">💾</span>Backup exportieren (JSON)</button>
    <button data-act="importData"><span class="ico">📂</span>Backup importieren</button>
    <button data-act="resetAll"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>
  <p class="small muted" style="margin:0 4px">„Für Claude kopieren“ legt eine kompakte Text-Zusammenfassung in die Zwischenablage – einfach in den Chat einfügen.</p>
  <div class="section-t">Ampel – so wird gerechnet</div>
  <div class="card" style="padding:14px 16px;font-size:14px;line-height:1.55;color:var(--t2)">
    Basis = Median der letzten 14 Tage (ab 4 Werten).<br>
    🔴 Schlaf unter 5 h · Ruhepuls ≥ Basis +7 · Gefühl 1<br>
    🟡 Schlaf unter 6,5 h · 3× oder öfter wach · Ruhepuls ≥ Basis +4 · HRV 15 % unter Basis · Gefühl 2<br>
    Hart = RPE ≥ 7. Faustregel, keine Diagnose.
  </div>
  <div class="section-t">Auf dem iPhone installieren</div>
  <div class="card" style="padding:14px 16px;font-size:15px;line-height:1.55">
    1. Diese Seite in <b>Safari</b> öffnen<br>2. Unten auf <b>Teilen</b> (□↑) tippen<br>3. <b>„Zum Home-Bildschirm“</b> wählen
  </div>
  <p class="small muted" style="text-align:center;margin:24px 0 0">${Object.keys(S.days).length} Tage · ${S.units.length} Einheiten · Training v1.0</p>`;
}

/* ───────── Formulare ───────── */
const radios = (name, opts, cur, cls = '') => opts.map(([v, l]) => `<label class="chip ${cls}"><input type="radio" name="${name}" value="${v}" ${String(cur) === String(v) ? 'checked' : ''}>${l}</label>`).join('');
function dayFormHTML(k) {
  const d = S.days[k] || {};
  return `<form data-form="day" class="form">
    <div class="field"><label>Datum</label><input type="date" name="d" value="${k}" max="${dkey(new Date())}" required></div>
    <div class="row2">
      <div class="field"><label>Schlaf (h)</label><input type="text" inputmode="decimal" name="schlaf" value="${d.schlaf != null ? num(d.schlaf) : ''}" placeholder="z. B. 6,5"></div>
      <div class="field"><label>Gewicht (kg, optional)</label><input type="text" inputmode="decimal" name="kg" value="${d.kg != null ? num(d.kg) : ''}" placeholder="z. B. 85,4"></div>
    </div>
    <span class="flab">Wie oft aufgewacht</span>
    <div class="chips5" style="margin-bottom:12px">${radios('wach', [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5+']], d.wach)}</div>
    <div class="row2">
      <div class="field"><label>Ruhepuls</label><input type="number" inputmode="numeric" name="rhr" value="${d.rhr ?? ''}" placeholder="bpm"></div>
      <div class="field"><label>HRV (optional)</label><input type="number" inputmode="numeric" name="hrv" value="${d.hrv ?? ''}" placeholder="ms"></div>
    </div>
    <span class="flab">Gefühl</span>
    <div class="chips5 k5" style="margin-bottom:12px">${radios('gefuehl', [1, 2, 3, 4, 5].map(n => [n, FEEL[n] + ' ' + n]), d.gefuehl)}</div>
    <div class="field"><label>Notiz</label><input type="text" name="note" value="${esc(d.note || '')}" placeholder="z. B. krank, Reise, Kind unruhig"></div>
    <button class="btn primary" style="width:100%">Speichern</button>
    ${S.days[k] ? `<button type="button" class="btn danger" style="width:100%" data-act="dayDel" data-d="${k}">Morgenwerte löschen</button>` : ''}
  </form>`;
}
function unitFormHTML(u) {
  const t = u.typ || '', kind = t ? kindOf(t) : '';
  const exRows = k => S.settings[k].map((ex, i) => {
    const last = lastSets(ex, u.id);
    return `<label class="exl"><span>${esc(ex)}${last ? `<small>zuletzt ${esc(last.v)} (${shortDate(fromKey(last.d))})</small>` : ''}</span><input type="text" name="ex_${k}_${i}" value="${esc((u.sets && u.typ === k && u.sets[ex]) || '')}" placeholder="8/8/7" autocomplete="off"></label>`;
  }).join('');
  return `<form data-form="unit" class="form" data-kind="${kind}" data-typ="${esc(t)}">
    <input type="hidden" name="id" value="${esc(u.id || '')}">
    <div class="field"><label>Datum</label><input type="date" name="d" value="${u.d}" max="${dkey(new Date())}" required></div>
    <span class="flab">Art</span>
    <div class="tgs k3" style="margin-bottom:12px">${TYPES.map(x => `<label class="tg"><input type="radio" name="typ" value="${x.k}" ${t === x.k ? 'checked' : ''} data-change="typ"><span class="e">${x.e}</span>${esc(x.n)}</label>`).join('')}</div>
    <div class="field"><label>Dauer (min)</label><input type="number" inputmode="numeric" name="min" value="${u.min ?? ''}" placeholder="z. B. 50"></div>
    <div class="chiprow" style="margin:-4px 0 12px">${[30, 45, 50, 60, 90, 120].map(n => `<button type="button" class="chip" data-act="minSet" data-n="${n}">${n}′</button>`).join('')}</div>
    <span class="flab">RPE (1 = sehr leicht, 10 = maximal)</span>
    <div class="chips5 k5" style="margin-bottom:12px">${radios('rpe', [...Array(10)].map((_, i) => [i + 1, i + 1]), u.rpe)}</div>
    <div class="only-rad"><div class="row2">
      <div class="field"><label>Ø Watt (optional)</label><input type="number" inputmode="numeric" name="w" value="${u.w ?? ''}"></div>
      <div class="field"><label>Ø HF (optional)</label><input type="number" inputmode="numeric" name="hf" value="${u.hf ?? ''}"></div>
    </div></div>
    <div class="only-kraft"><span class="flab">Wiederholungen je Satz (z. B. 8/8/7, bei Halteübungen Sekunden)</span>
      <div class="ex-kA card" style="padding:4px 12px;margin-bottom:12px">${exRows('kA')}</div>
      <div class="ex-kB card" style="padding:4px 12px;margin-bottom:12px">${exRows('kB')}</div>
    </div>
    <div class="field"><label>Notiz</label><input type="text" name="note" value="${esc(u.note || '')}" placeholder="z. B. 3×10 @ 190 W, HF letzter Block 158"></div>
    <button class="btn primary" style="width:100%">Speichern</button>
    ${u.id ? `<button type="button" class="btn danger" style="width:100%" data-act="unitDel" data-id="${u.id}">Einheit löschen</button>` : ''}
  </form>`;
}

/* ───────── Export ───────── */
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
function claudeText(nDays = 28) {
  const now = new Date(), from = dkey(addDays(now, -(nDays - 1)));
  const keys = [...Array(nDays)].map((_, i) => dkey(addDays(now, i - nDays + 1)));
  const v = x => x == null || x === '' ? '-' : String(x).replace('.', ',');
  let t = `Training-Cockpit · Export ${shortDate(now)}${now.getFullYear()} · letzte ${nDays} Tage\n\n`;
  t += `MORGENWERTE (Datum | Schlaf h | wach | Ruhepuls | HRV | Gefühl 1-5 | kg | Ampel | Notiz)\n`;
  for (const k of keys) {
    const d = S.days[k]; if (!d) continue;
    t += `${k} | ${v(d.schlaf)} | ${v(d.wach)} | ${v(d.rhr)} | ${v(d.hrv)} | ${v(d.gefuehl)} | ${v(d.kg)} | ${ampel(k).c.toUpperCase()} | ${d.note || ''}\n`;
  }
  t += `\nEINHEITEN (Datum | Art | min | RPE | Ø W | Ø HF | Notiz | Sätze)\n`;
  for (const u of S.units.filter(u => u.d >= from).sort((a, b) => a.d.localeCompare(b.d) || (a.t || 0) - (b.t || 0))) {
    const sets = u.sets ? Object.entries(u.sets).filter(([, r]) => r).map(([ex, r]) => `${ex} ${r}`).join('; ') : '';
    t += `${u.d} | ${typ(u.typ).n} | ${v(u.min)} | ${v(u.rpe)} | ${v(u.w)} | ${v(u.hf)} | ${u.note || ''} | ${sets}\n`;
  }
  t += `\nWOCHEN (KW | Rad h | Qualität | Kraft | hart RPE≥7 | Ø Schlaf | Ø Ruhepuls)\n`;
  const ws0 = weekStart(now);
  for (let i = -3; i <= 0; i++) {
    const ws = addDays(ws0, i * 7), w = weekStats(ws);
    t += `KW${isoWeek(ws)} | ${num(w.radMin / 60)} | ${w.q} | ${w.kraft} | ${w.hard} | ${num(w.schlaf)} | ${num(w.rhr, 0)}\n`;
  }
  return t;
}

/* ───────── Aktionen ───────── */
const snapshot = () => ({ days: JSON.parse(JSON.stringify(S.days)), units: S.units.map(u => ({ ...u })) });
const restore = b => () => { S.days = b.days; S.units = b.units; save(); render(); };

const ACT = {
  tab(el) { closeAllSheets(); S.ui.view = el.dataset.view; if (S.ui.view === 'woche') ui.week = 0; save(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },

  dayEdit(el) { openSheet({ title: 'Morgenwerte', body: dayFormHTML(el.dataset.d || dkey(new Date())) }); },
  dayOpen(el) {
    const k = el.dataset.d, d = fromKey(k), us = unitsOn(k);
    openSheet({
      title: `${DAYS[d.getDay()]}, ${fmtDate(d)}`, body: `<div class="stack">
        <button class="btn soft" data-act="dayEdit" data-d="${k}">☀️ Morgenwerte ${S.days[k] ? 'bearbeiten' : 'eintragen'}</button>
        ${us.length ? `<div class="card">${us.map(urowHTML).join('')}</div>` : ''}
        <button class="btn primary" data-act="unitAdd" data-d="${k}">+ Einheit an diesem Tag</button></div>`,
    });
  },
  dayDel(el) {
    const b = snapshot(); delete S.days[el.dataset.d]; save(); closeAllSheets(); render();
    toast('Morgenwerte gelöscht', { label: 'Rückgängig', fn: restore(b) });
  },
  unitAdd(el) { openSheet({ title: 'Neue Einheit', body: unitFormHTML({ d: (el && el.dataset.d) || dkey(new Date()) }) }); },
  unitEdit(el) { const u = S.units.find(x => x.id === el.dataset.id); if (u) openSheet({ title: 'Einheit bearbeiten', body: unitFormHTML(u) }); },
  unitDel(el) {
    const b = snapshot(); S.units = S.units.filter(u => u.id !== el.dataset.id); save(); closeAllSheets(); render();
    toast('Einheit gelöscht', { label: 'Rückgängig', fn: restore(b) });
  },
  minSet(el) { const f = el.closest('form'); f.min.value = el.dataset.n; vib(); },
  weekShift(el) { ui.week = Math.min(0, ui.week + +el.dataset.n); render(); },
  statSel(el) { ui.statSel[el.dataset.c] = +el.dataset.i; const y = window.scrollY; render(); window.scrollTo(0, y); },
  theme(el) { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },

  async copyClaude() {
    const text = claudeText();
    try { await navigator.clipboard.writeText(text); toast('Kopiert – jetzt im Chat einfügen'); }
    catch (e) { exportFile(text, `training-${dkey(new Date())}.txt`, 'text/plain', 'Training für Claude'); }
  },
  exportData() {
    const data = JSON.stringify({ app: 'training', exported: new Date().toISOString(), ...S, ui: undefined }, null, 1);
    exportFile(data, `training-backup-${dkey(new Date())}.json`, 'application/json', 'Training Backup');
  },
  importData() { $('#importFile').click(); },
  exportCsv() {
    const q = x => `"${String(x ?? '').replace(/"/g, '""')}"`;
    const rows = [['Datum', 'Satzart', 'Art', 'Dauer (min)', 'RPE', 'Ø Watt', 'Ø HF', 'Schlaf (h)', 'Wach', 'Ruhepuls', 'HRV', 'Gefühl', 'kg', 'Notiz', 'Sätze']];
    const dec = x => x == null ? '' : String(x).replace('.', ',');
    for (const k of Object.keys(S.days).sort()) { const d = S.days[k]; rows.push([k, 'Morgen', '', '', '', '', '', dec(d.schlaf), d.wach ?? '', d.rhr ?? '', d.hrv ?? '', d.gefuehl ?? '', dec(d.kg), d.note || '', '']); }
    for (const u of [...S.units].sort((a, b) => a.d.localeCompare(b.d))) rows.push([u.d, 'Einheit', typ(u.typ).n, u.min ?? '', u.rpe ?? '', u.w ?? '', u.hf ?? '', '', '', '', '', '', '', u.note || '', u.sets ? Object.entries(u.sets).filter(([, r]) => r).map(([e, r]) => `${e} ${r}`).join('; ') : '']);
    const csv = '﻿' + rows.sort((a, b) => a[0] === 'Datum' ? -1 : b[0] === 'Datum' ? 1 : a[0].localeCompare(b[0])).map(r => r.map(q).join(';')).join('\r\n');
    exportFile(csv, `training-${dkey(new Date())}.csv`, 'text/csv', 'Training');
  },
  resetAll() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Trainingsdaten löschen – auch online und auf allen verbundenen Geräten?' : 'Alle Trainingsdaten auf diesem Gerät löschen?', 'Alles löschen', () => {
      if (window.Cloud && Cloud.allowBulkDelete) Cloud.allowBulkDelete();
      S = fresh(); S.ui.view = 'mehr'; save(); applyTheme(); render(); toast('Alle Daten gelöscht');
    });
  },
};

const FORMS = {
  day(form) {
    const k = form.d.value || dkey(new Date());
    const int = v => { const n = parseInt(v, 10); return isNaN(n) ? null : n; };
    const fd = new FormData(form);
    const d = {
      schlaf: pnum(form.schlaf.value), wach: int(fd.get('wach')), rhr: int(form.rhr.value), hrv: int(form.hrv.value),
      gefuehl: int(fd.get('gefuehl')), kg: pnum(form.kg.value), note: form.note.value.trim(),
    };
    for (const x in d) if (d[x] == null || d[x] === '') delete d[x];
    if (!Object.keys(d).length) { toast('Mindestens einen Wert eintragen'); return; }
    S.days[k] = d; save(); closeAllSheets(); vib(15); render(); toast('Gespeichert');
  },
  unit(form) {
    const fd = new FormData(form), t = fd.get('typ');
    if (!t) { toast('Bitte die Art wählen'); return; }
    const int = v => { const n = parseInt(v, 10); return isNaN(n) ? null : n; };
    const id = form.id.value || uid(), old = S.units.find(u => u.id === id);
    const u = { id, d: form.d.value || dkey(new Date()), t: old ? old.t : Date.now(), typ: t, min: int(form.min.value), rpe: int(fd.get('rpe')), note: form.note.value.trim() };
    if (typ(t).rad) { u.w = int(form.w.value); u.hf = int(form.hf.value); }
    if (typ(t).kraft) {
      const sets = {};
      S.settings[t].forEach((ex, i) => { const v = (form[`ex_${t}_${i}`]?.value || '').trim(); if (v) sets[ex] = v; });
      if (Object.keys(sets).length) u.sets = sets;
    }
    for (const x in u) if (u[x] == null || u[x] === '') delete u[x];
    S.units = S.units.filter(x => x.id !== id); S.units.push(u);
    save(); closeAllSheets(); vib(15); render(); toast(old ? 'Gespeichert' : `${typ(t).n} eingetragen`);
  },
};

const CHANGE = {
  typ(el) { const f = el.closest('form'); f.dataset.typ = el.value; f.dataset.kind = kindOf(el.value); },
  boden(el) { const n = pnum(el.value); if (n != null && n >= 0) { S.settings.boden = n; save(); } },
  decke(el) { const n = pnum(el.value); if (n != null && n > 0) { S.settings.decke = n; save(); } },
  exA(el) { S.settings.kA = el.value.split('\n').map(s => s.trim()).filter(Boolean); save(); },
  exB(el) { S.settings.kB = el.value.split('\n').map(s => s.trim()).filter(Boolean); save(); },
};

function importData(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!Array.isArray(d.units) || typeof d.days !== 'object') throw new Error('bad');
      confirmSheet('Backup laden? Die aktuellen Daten auf diesem Gerät werden ersetzt.', 'Backup laden', () => {
        const uiKeep = S.ui; S = migrate(d); S.ui = uiKeep; save(); applyTheme(); render(); toast('Backup geladen');
      });
    } catch (e) { toast('Datei ist kein gültiges Backup'); }
  };
  rd.readAsText(file);
}

/* ───────── Events ───────── */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(a);
});
document.addEventListener('submit', e => {
  e.preventDefault(); const fn = FORMS[e.target.dataset.form]; fn && fn(e.target);
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (k && CHANGE[k]) CHANGE[k](e.target);
  if (e.target.id === 'importFile' && e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
});
// Neuer Tag (App über Nacht offen) → neu zeichnen
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const k = dkey(new Date());
  if (k !== ui.lastDay) { ui.lastDay = k; if (!sheetStack.length) render(); }
});

render();

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
// Zeilen in app_items (app = 'training'):  d:<Datum> kind 'tag' · u:<id> kind 'einheit' · settings
if (window.Cloud) Cloud.init({
  app: 'training',
  records() {
    const m = {};
    for (const [k, d] of Object.entries(S.days)) m['d:' + k] = { kind: 'tag', data: { d: k, ...d } };
    for (const u of S.units) m['u:' + u.id] = { kind: 'einheit', data: u };
    const def = fresh().settings, st = {};
    for (const k of ['boden', 'decke', 'kA', 'kB']) st[k] = S.settings[k];
    m.settings = { kind: 'settings', data: st, soft: JSON.stringify(st) === JSON.stringify({ boden: def.boden, decke: def.decke, kA: def.kA, kB: def.kB }) };
    return m;
  },
  apply(r) {
    const rid = r.id.slice(2);
    if (r.kind === 'tag') {
      if (r.deleted) delete S.days[rid]; else { const { d, ...rest } = r.data || {}; S.days[rid] = rest; }
    } else if (r.kind === 'einheit') {
      const i = S.units.findIndex(u => u.id === rid);
      if (r.deleted) { if (i >= 0) S.units.splice(i, 1); } else if (i >= 0) S.units[i] = r.data; else S.units.push(r.data);
    } else if (r.kind === 'settings' && r.data) Object.assign(S.settings, r.data);
  },
  persist() { save(true); },
  refresh() { const y = window.scrollY; render(); window.scrollTo(0, y); },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  guardDeletes(list, known) { return list.length >= 5 && list.length > known / 3; },
  openSettings() { closeAllSheets(); S.ui.view = 'mehr'; save(true); render(); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
