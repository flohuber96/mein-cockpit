'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   KÖRPER-COACH · Kern: Zustand, Speicherung, Sheets, Timer, Körperkarte,
   Auswertung und gemeinsame Bausteine. Die Bereiche liegen in body.js,
   train.js, mob.js, ride.js und home.js.
   ═══════════════════════════════════════════════════════════════════════════ */
const D = window.KPD, X = window.KPX, E = X.E;

/* ───────── Helfer ───────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => dkey(new Date());
const DAY = 864e5;
const DAYS_S = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
const fmtDay = ts => { const d = new Date(ts), k = dkey(d); return k === today() ? 'Heute' : k === dkey(addDays(new Date(), -1)) ? 'Gestern' : `${DAYS_S[d.getDay()]}, ${fmtDate(d)}`; };
const num = (n, dec = 1) => { const f = Math.pow(10, dec); return String(Math.round(n * f) / f).replace('.', ','); };
const fmtClock = sec => { sec = Math.max(0, Math.round(sec)); const h = Math.floor(sec / 3600); return (h ? h + ':' + pad(Math.floor(sec / 60) % 60) : Math.floor(sec / 60)) + ':' + pad(sec % 60); };
const fmtMin = min => { min = Math.round(min); return min < 60 ? `${min} min` : `${Math.floor(min / 60)}:${pad(min % 60)} h`; };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const vib = p => { if (S.settings.vib !== false && navigator.vibrate) navigator.vibrate(p || 8); };
const nm = id => (D.M[id] || D.J[id] || {}).n || id;
const info = id => D.M[id] ? Object.assign({ kind: 'm', id }, D.M[id]) : D.J[id] ? Object.assign({ kind: 'j', id }, D.J[id]) : null;
const ul = (arr, dot) => arr && arr.length ? `<ul class="ul"${dot ? ` style="--dot:${dot}"` : ''}>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
const painCol = l => l >= 7 ? '#e5484d' : l >= 4 ? '#d99a00' : '#2f9e44';

/* ───────── Zustand ───────── */
const KEY = 'koerper.v1';
function fresh() {
  return {
    v: 1, pains: {}, tests: {}, snaps: [], sessions: [], routines: [], templates: [], rides: [], favs: {}, well: {},
    settings: { theme: 'auto', rest: 90, sound: true, vib: true, prep: 5, goalK: 2, goalM: 4, ftp: null },
    active: null, ui: { view: 'home' }
  };
}
function migrate(s) {
  const f = fresh();
  return Object.assign({}, f, s, { settings: Object.assign({}, f.settings, s.settings), ui: Object.assign({}, f.ui, s.ui) });
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* ignore */ }
  const s = fresh();
  // Beim ersten Start: Bestandsaufnahme aus dem Körper-Tab des Cockpits übernehmen
  try {
    const old = JSON.parse(localStorage.getItem('kp_state_v1') || 'null');
    if (old) {
      s.pains = old.pains || {}; s.tests = old.tests || {};
      s.snaps = (old.history || []).map(h => ({ id: String(h.ts || uid()), d: h.d, ts: h.ts || Date.now(), tests: h.tests || {}, pains: h.pains || {}, score: h.score }));
    }
  } catch (e) { /* ignore */ }
  return s;
}
let S = load();
function save(fromServer) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  if (!fromServer && window.Cloud) Cloud.soon();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

// Ansichts-Zustand (nicht gespeichert)
const ui = {
  home: { sub: 'over' },
  body: { sub: 'map', sel: null, topic: null, view: 'both', deep: false },
  train: { sub: 'start', grp: 'glutes', home: false },
  mob: { sub: 'routines', grp: 'm_hipflex' },
  ride: { chart: 'h', all: false },
  fullMin: false
};

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#0e1211' : '#f3f6f5';
}
applyTheme();
{ const mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', applyTheme); }

/* ───────── Toast ───────── */
let toastT;
const pending = {};
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button data-act="toastAct">${esc(action.label)}</button>` : '');
  pending.toast = action ? action.fn : null;
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 4500 : 2400);
}

/* ───────── Sheets ───────── */
const sheetStack = [];
function openSheet({ title = '', right = '', left = 'Schließen', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head"><button class="lnk" data-act="closeSheet">${esc(left)}</button><b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
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
  if (!sheetStack.length && $('#full').hidden) document.body.classList.remove('locked');
  if (e.onClose) e.onClose();
}
function closeAllSheets() { while (sheetStack.length) closeSheet(); }
const topSheet = () => sheetStack.length ? sheetStack[sheetStack.length - 1].sh : null;
function sheetBody(html) { const sh = topSheet(); if (sh) $('.sheet-body', sh).innerHTML = html; }
function confirmSheet(text, okLabel, onOk) {
  openSheet({
    title: 'Bist du sicher?', left: 'Abbrechen', body: `<p style="text-align:center;font-size:16px;margin:6px 8px 18px">${esc(text)}</p><div class="stack">
      <button class="btn primary" data-act="confirmOk">${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`
  });
  pending.confirm = onOk;
}

/* ───────── Ton, Bildschirm wach halten ───────── */
let actx = null;
function audio() {
  try {
    if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); }
    if (actx && actx.state === 'suspended') actx.resume();
  } catch (e) { /* kein Ton */ }
  return actx;
}
function beep(freq = 880, dur = 0.12, when = 0) {
  if (!S.settings.sound) return;
  const a = audio(); if (!a) return;
  try {
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) { /* ignore */ }
}
const beepEnd = () => { beep(880, 0.14); beep(1175, 0.3, 0.16); vib([140, 70, 140]); };
let wl = null, wlWant = false;
async function wake(on) {
  wlWant = on;
  try {
    if (on && !wl && navigator.wakeLock) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); }
    if (!on && wl) { await wl.release(); wl = null; }
  } catch (e) { /* nicht unterstützt */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && wlWant) wake(true); });

/* ───────── Uhren (zeitbasiert – laufen auch nach Bildschirmsperre korrekt weiter) ───────── */
const clocks = new Set();
function clock(sec, onTick, onDone, quiet) {
  const c = {
    end: Date.now() + sec * 1000, total: sec, paused: null, last: null, quiet,
    left() { return Math.max(0, Math.ceil((c.paused != null ? c.paused : c.end - Date.now()) / 1000)); },
    pause() { if (c.paused == null) c.paused = Math.max(0, c.end - Date.now()); },
    resume() { if (c.paused != null) { c.end = Date.now() + c.paused; c.paused = null; } },
    add(s) { if (c.paused != null) c.paused = Math.max(0, c.paused + s * 1000); else c.end = Math.max(Date.now(), c.end + s * 1000); c.total = Math.max(1, c.total + s); c.last = null; tickClock(c); },
    stop() { clocks.delete(c); }
  };
  c.onTick = onTick; c.onDone = onDone;
  clocks.add(c); tickClock(c);
  return c;
}
function tickClock(c) {
  if (!clocks.has(c)) return;
  const l = c.left();
  if (l !== c.last) {
    c.last = l;
    if (c.paused == null && l > 0 && l <= 3 && !c.quiet) beep(660, 0.09);
    if (c.onTick) c.onTick(l, c);
  }
  if (l <= 0 && c.paused == null) { clocks.delete(c); if (!c.quiet) beepEnd(); if (c.onDone) c.onDone(); }
}
setInterval(() => clocks.forEach(tickClock), 200);

/* ───────── Satzpause (Dock über der Tab-Leiste) ───────── */
let rest = null;
function restStart(sec, label) {
  if (rest) rest.c.stop();
  const r = { label: label || 'Pause', end: false };
  r.c = clock(sec, () => { if (rest === r) renderDock(); }, () => { r.end = true; renderDock(); setTimeout(() => { if (rest === r) { rest = null; renderDock(); } }, 3500); });
  rest = r;
  wake(true);
  renderDock();
}
function restStop() { if (rest) { rest.c.stop(); rest = null; renderDock(); } }
function renderDock() {
  let h = '';
  if (S.active && ui.fullMin) h += `<button class="pill" data-act="wOpen"><span class="pl">🏋️ ${esc(S.active.n)}<small>Workout läuft – antippen zum Fortsetzen</small></span><span class="pt" data-live="wtime">${fmtClock((Date.now() - S.active.s) / 1000)}</span></button>`;
  if (rest) h += `<div class="pill rest${rest.end ? ' end' : ''}"><span class="pl">${rest.end ? 'Weiter geht’s!' : esc(rest.label)}<small>${rest.end ? 'Pause vorbei' : 'Pause'}</small></span><span class="pt">${fmtClock(rest.c.left())}</span>${rest.end ? '' : '<button data-act="restAdd" data-s="-15">−15</button><button data-act="restAdd" data-s="15">+15</button>'}<button data-act="restStop">✕</button></div>`;
  const inFull = $('#fdock');
  $('#dock').innerHTML = inFull ? '' : h;
  if (inFull) inFull.innerHTML = rest ? h.slice(h.indexOf('<div class="pill rest')) : '';
}
setInterval(() => { $$('[data-live="wtime"]').forEach(n => { if (S.active) n.textContent = fmtClock((Date.now() - S.active.s) / 1000); }); }, 1000);

/* ───────── Aktionen & Ansichten ───────── */
const ACT = {}, IN = {}, VIEWS = {};
document.addEventListener('click', e => {
  audio(); // Ton erst nach einer Berührung erlaubt (iOS)
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (fn) fn(el, e);
});
document.addEventListener('input', e => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetStack.length) closeSheet(); });

Object.assign(ACT, {
  closeSheet,
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); if (fn) fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); if (fn) fn(); },
  tab(el) { go(el.dataset.view); },
  restAdd(el) { if (rest) rest.c.add(+el.dataset.s); },
  restStop
});

function render() {
  const v = VIEWS[S.ui.view] ? S.ui.view : 'home', V = VIEWS[v];
  $('#title').textContent = V.title;
  $('#sub').textContent = V.sub ? V.sub() : '';
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (V.actions ? V.actions() : '');
  $('#main').innerHTML = V.render();
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  renderDock();
}
function go(view, patch) {
  closeAllSheets();
  S.ui.view = view;
  if (patch && ui[view]) Object.assign(ui[view], patch);
  save(true); render(); window.scrollTo(0, 0);
}
const keepScroll = fn => { const y = window.scrollY; fn(); window.scrollTo(0, y); };

/* ───────── Körperkarte ───────── */
const MIR = 'translate(200,0) scale(-1,1)';
function bodySVG(o) {
  o = o || {};
  const hl = o.hl || {}, view = o.view || 'both';
  const at = (id, side) => {
    const h = hl[id]; if (!h || !h.role) return '';
    if (h.side && h.side !== 'B' && side !== 'C' && side !== h.side) return '';
    return ` data-role="${h.role}"` + (h.o ? ` style="--o:${h.o}"` : '');
  };
  const fig = (v, ox) => {
    const sA = v === 'front' ? 'R' : 'L', sB = v === 'front' ? 'L' : 'R';
    const open = D.SIL.replace(' L100,217 Z', '');
    let s = `<g transform="translate(${ox},14)"><text class="vl" x="100" y="-2" text-anchor="middle">${v === 'front' ? 'Vorne' : 'Hinten'}</text>`;
    s += `<path class="sil" style="stroke:none" d="${D.SIL}"/><path class="sil" style="stroke:none" d="${D.SIL}" transform="${MIR}"/><path class="sil" style="fill:none" d="${open}"/><path class="sil" style="fill:none" d="${open}" transform="${MIR}"/>`;
    const draw = deep => D.SHAPES[v].filter(x => !!(x[2] && x[2].deep) === deep).forEach(([id, d]) => {
      const c = deep ? 'm deep' : 'm';
      s += `<path class="${c}" data-id="${id}" data-side="${sA}" d="${d}"${at(id, sA)}/><path class="${c}" data-id="${id}" data-side="${sB}" d="${d}" transform="${MIR}"${at(id, sB)}/>`;
    });
    draw(false);
    (D.DECO[v] || []).forEach(d => { s += `<path class="deco" d="${d}"/><path class="deco" d="${d}" transform="${MIR}"/>`; });
    draw(true);
    Object.entries(D.JPOS[v]).forEach(([id, [x, y]]) => {
      (x === 100 ? [[x, 'C']] : [[x, sA], [200 - x, sB]]).forEach(([px, side]) => {
        s += `<circle class="jhit" data-id="${id}" data-side="${side}" cx="${px}" cy="${y}" r="7"/><circle class="j" cx="${px}" cy="${y}" r="3.6"${at(id, side)}/>`;
      });
    });
    return s + `<text class="sl" x="40" y="410" text-anchor="middle">${sA}</text><text class="sl" x="160" y="410" text-anchor="middle">${sB}</text></g>`;
  };
  const cls = 'bmap' + (o.tap ? ' tap' : '') + (o.mini ? ' mini' : '') + (o.deep ? ' deepon' : '') + (Object.keys(hl).length ? ' hl' : '');
  return `<svg class="${cls}"${o.tap ? ` data-map="${o.tap}"` : ''} viewBox="${view === 'both' ? '22 0 366 430' : '22 0 156 430'}" xmlns="http://www.w3.org/2000/svg">${view === 'both' ? fig('front', 0) + fig('back', 210) : fig(view, 0)}</svg>`;
}
// Zielbereich einer Übung als Hervorhebung: Hauptziel kräftig, Rest heller
function targetHL(ids) {
  const hl = {};
  (ids || []).forEach((id, i) => { hl[id] = { role: i === 0 ? 'pain' : 'syn', o: i === 0 ? 0.85 : 0.55 }; });
  return hl;
}
const ROLE_COL = { sel: 'var(--c-sel)', syn: 'var(--c-syn)', ant: 'var(--c-ant)', pain: 'var(--c-pain)', tight: 'var(--c-tight)', weak: 'var(--c-weak)', inv: 'var(--c-syn)', mob: 'var(--c-mob)', stab: 'var(--c-weak)' };
const legend = (obj, cap) => `<div class="legend">${cap ? `<span class="cap">${cap}</span>` : ''}${Object.entries(obj).map(([r, l]) => `<span><i style="background:${ROLE_COL[r]}"></i>${esc(l)}</span>`).join('')}</div>`;
function chip(id, role) {
  const i = info(id); if (!i) return '';
  return `<button class="chip${i.deep ? ' deep' : ''}" data-act="st" data-id="${id}"${role ? ` data-role="${role}"` : ''}><i></i>${esc(i.n)}</button>`;
}

/* ───────── Auswertung der Bestandsaufnahme ───────── */
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
  const vals = Object.entries(tests || {}).map(([tid, oi]) => D.T[tid] && D.T[tid].opts[oi] ? D.T[tid].opts[oi].s : null).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round(100 * (1 - vals.reduce((a, b) => a + b, 0) / (2 * vals.length)));
}
const scoreCol = sc => sc == null ? 'var(--t3)' : sc >= 75 ? 'var(--ok)' : sc >= 50 ? 'var(--c-tight)' : 'var(--c-pain)';
function topicStatus(tid) {
  const t = D.TOPICS[tid]; if (!t) return null;
  const vals = t.tests.filter(x => S.tests[x] != null && D.T[x].opts[S.tests[x]]).map(x => D.T[x].opts[S.tests[x]].s);
  let lvl = null;
  if (vals.length) { const a = vals.reduce((p, c) => p + c, 0) / vals.length; lvl = a < 0.5 ? 0 : a < 1.2 ? 1 : 2; }
  if (t.grp === 'zone') Object.entries(t.roles).forEach(([id, r]) => {
    const p = S.pains[id]; if (!p || r !== 'pain') return;
    const pl = p.lvl >= 7 ? 2 : p.lvl >= 4 ? 1 : 0;
    lvl = lvl == null ? pl : Math.max(lvl, pl);
  });
  return lvl == null ? null : ['g', 'a', 'r'][lvl];
}
const painTopics = id => Object.entries(D.TOPICS).filter(([k, t]) => t.grp === 'zone' && k !== 'bike' && t.roles[id] === 'pain').map(([k]) => k);
const activePains = () => Object.entries(S.pains).filter(([id, p]) => p.lvl > 0 && info(id)).sort((a, b) => b[1].lvl - a[1].lvl);

// Persönlicher Plan: aus Testergebnissen und Beschwerden, gewichtet nach Tier
const TIER_W = { S: 1.35, A: 1.1, B: 0.85 };
function buildPlan() {
  const f = profile(), items = {};
  const add = (ex, sc, why) => {
    const e = E[ex]; if (!e || sc <= 0 || !TIER_W[e.tier]) return;
    const it = items[ex] = items[ex] || { sc: 0, why: [] };
    it.sc += sc * TIER_W[e.tier];
    if (why && !it.why.includes(why)) it.why.push(why);
  };
  Object.entries(f).forEach(([id, v]) => {
    const n = nm(id);
    Object.values(E).forEach(e => {
      if (!e.m.includes(id)) return;
      const prim = e.m[0] === id ? 2 : 1;
      if (v.tight && e.t === 'mob') add(e.id, v.tight * prim, `${n} eingeschränkt`);
      if (v.weak && e.t !== 'mob') add(e.id, v.weak * prim, `${n} schwach`);
    });
  });
  const focus = {};
  activePains().forEach(([id, p]) => {
    painTopics(id).forEach(tid => {
      focus[tid] = Math.max(focus[tid] || 0, p.lvl);
      const ex = D.TOPICS[tid].ex, w = p.lvl / 2.5, why = `Beschwerden: ${D.TOPICS[tid].n}`;
      (ex.mob || []).slice(0, 2).forEach(e => add(e, w, why));
      (ex.akt || []).slice(0, 2).forEach(e => add(e, w, why));
      (ex.kraft || []).slice(0, 1).forEach(e => add(e, w * 0.7, why));
    });
  });
  const hasData = Object.keys(items).length > 0;
  const pick = (t, n) => Object.entries(items).filter(([e]) => E[e].t === t).sort((a, b) => b[1].sc - a[1].sc).slice(0, n).map(([e, v]) => ({ id: e, why: v.why.slice(0, 2).join(' · ') }));
  return { mob: pick('mob', 6), akt: pick('akt', 4), kraft: pick('kraft', 5), focus, hasData, f };
}
function planRoutine() {
  const P = buildPlan(); if (!P.hasData || !(P.mob.length + P.akt.length)) return null;
  return { id: 'r_plan', n: 'Mein Plan', e: '🎯', plan: true, d: 'Aus deiner Bestandsaufnahme: erst beweglich machen, dann ansteuern.',
    items: P.mob.concat(P.akt.slice(0, 3)).map(x => [x.id, E[x.id].hold]), why: Object.fromEntries(P.mob.concat(P.akt).map(x => [x.id, x.why])) };
}
function planTemplate() {
  const P = buildPlan(); if (!P.hasData || !(P.akt.length + P.kraft.length)) return null;
  const item = x => { const e = E[x.id], s = parseInt(e.dose, 10) || 3; return e.tr === 't' || e.tr === 'wt' ? { x: x.id, s, sec: e.hold, rest: 45 } : { x: x.id, s, r: e.dose.replace(/^\d+×\s*/, ''), rest: e.t === 'akt' ? 30 : 90 }; };
  return { id: 't_plan', n: 'Mein Plan', sub: 'aus deiner Bestandsaufnahme', e: '🎯', plan: true, d: 'Aktiviert und kräftigt gezielt, was in deinen Tests schwach war.',
    items: P.akt.slice(0, 3).concat(P.kraft).map(item), why: Object.fromEntries(P.akt.concat(P.kraft).map(x => [x.id, x.why])) };
}

/* ───────── Aktivitäten ───────── */
const ACT_ICO = { kraft: '🏋️', mob: '🧘', ride: '🚴', sport: '🏃' };
const acts = () => S.sessions.map(x => ({ ts: x.s, k: x.k, x })).concat(S.rides.map(r => ({ ts: r.s, k: 'ride', x: r }))).sort((a, b) => b.ts - a.ts);
function weekStart(d) { const x = new Date(d || Date.now()); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function periodStats(from, to) {
  const st = { kraft: 0, mob: 0, mobMin: 0, sport: 0, rides: 0, km: 0, rideMin: 0, hm: 0 };
  S.sessions.forEach(x => {
    if (x.s < from || x.s >= to) return;
    if (x.k === 'kraft') st.kraft++; else if (x.k === 'mob') { st.mob++; st.mobMin += (x.sec || 0) / 60; } else st.sport++;
  });
  S.rides.forEach(r => { if (r.s < from || r.s >= to) return; st.rides++; st.km += r.km || 0; st.rideMin += r.min || 0; st.hm += r.hm || 0; });
  return st;
}
function streak() {
  const days = new Set(acts().map(a => dkey(new Date(a.ts))));
  let d = new Date(), n = 0;
  if (!days.has(dkey(d))) d = addDays(d, -1);
  while (days.has(dkey(d))) { n++; d = addDays(d, -1); }
  return n;
}
function actLine(a) {
  const x = a.x;
  if (a.k === 'ride') return { n: x.n || 'Radfahrt', s: [x.km ? num(x.km) + ' km' : '', x.min ? fmtMin(x.min) : '', x.hm ? Math.round(x.hm) + ' hm' : ''].filter(Boolean).join(' · ') };
  if (a.k === 'kraft') { const sets = x.ex.reduce((n, e) => n + e.sets.length, 0); return { n: x.n || 'Krafttraining', s: `${plural(x.ex.length, 'Übung', 'Übungen')} · ${plural(sets, 'Satz', 'Sätze')} · ${fmtMin(((x.e || x.s) - x.s) / 6e4)}` }; }
  if (a.k === 'mob') return { n: x.n || 'Mobility', s: `${plural(x.cnt || 0, 'Übung', 'Übungen')} · ${fmtMin((x.sec || 0) / 60)}` };
  return { n: x.n || 'Aktivität', s: [x.min ? fmtMin(x.min) : '', x.note || ''].filter(Boolean).join(' · ') };
}
const actRow = a => { const l = actLine(a); return `<button class="li" data-act="actOpen" data-k="${a.k}" data-id="${esc(a.x.id)}"><span class="ic">${ACT_ICO[a.k] || '🏃'}</span><span class="bd"><b>${esc(l.n)}</b><small class="clip">${esc(l.s)}</small></span><span class="rt">${fmtDay(a.ts)}</span></button>`; };

/* ───────── Gemeinsame Bausteine ───────── */
const tierB = (t, sm) => t ? `<span class="tier ${t}${sm ? ' sm' : ''}">${t}</span>` : '';
const EX_LBL = { mob: 'Mobilisieren', akt: 'Aktivieren', kraft: 'Kräftigen' };
const EX_ICO = { mob: '🧘', akt: '⚡', kraft: '🏋️' };
const grpName = g => (X.GROUPS[g] || X.MGROUPS[g] || {}).n || g;
function exRow(id, o) {
  o = o || {};
  const e = E[id]; if (!e) return '';
  const sub = o.sub != null ? o.sub : (e.eq ? e.eq : 'ohne Geräte');
  return `<button class="li" data-act="${o.act || 'ex'}" data-id="${id}"${o.attr || ''}>${o.tier === false ? `<span class="ic">${EX_ICO[e.t]}</span>` : tierB(o.tierOf ? e.tiers[o.tierOf] : e.tier)}<span class="bd"><b>${esc(e.n)}</b><small${o.wrap ? '' : ' class="clip"'}>${esc(sub)}</small></span>${o.rt ? `<span class="rt">${o.rt}</span>` : '<span class="go">›</span>'}</button>`;
}
function ring(size, sw, pct, color, inner) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct || 0));
  return `<div class="ringbox" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card2)" stroke-width="${sw}"/><circle class="rfg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color || 'var(--acc)'}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/></svg><div class="rv">${inner || ''}</div></div>`;
}
function setRing(root, pct) {
  const fg = $('.rfg', root); if (!fg) return;
  const c = parseFloat(fg.getAttribute('stroke-dasharray'));
  fg.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, Math.min(1, pct))));
}

// Bestwerte und Verlauf einer Übung aus den gespeicherten Trainings
function exHistory(id) {
  const out = [];
  S.sessions.forEach(s => { if (s.k !== 'kraft') return; s.ex.forEach(x => { if (x.x === id && x.sets.length) out.push({ ts: s.s, sets: x.sets }); }); });
  return out.sort((a, b) => b.ts - a.ts);
}
const e1rm = s => (s.w || 0) * (1 + (s.r || 0) / 30);
function setTxt(e, s) {
  if (e.tr === 'wr') return `${num(s.w || 0)} kg × ${s.r || 0}`;
  if (e.tr === 'wt') return `${num(s.w || 0)} kg × ${s.t || 0} s`;
  if (e.tr === 't') return `${s.t || 0} s`;
  return `${s.r || 0} Wdh.`;
}
function bestSet(e, sets) {
  const val = s => e.tr === 'wr' ? e1rm(s) : e.tr === 'wt' ? (s.w || 0) * 1000 + (s.t || 0) : e.tr === 't' ? (s.t || 0) : (s.r || 0);
  return sets.reduce((b, s) => !b || val(s) > val(b) ? s : b, null);
}

// Übungs-Details als Sheet
function exSheet(id) {
  const e = E[id]; if (!e) return;
  const hist = exHistory(id), tiers = Object.entries(e.tiers);
  const body = `
    <div class="tags" style="margin:0 0 10px"><span class="tag acc">${EX_ICO[e.t]} ${EX_LBL[e.t]}</span>${e.eq ? `<span class="tag">🧰 ${esc(e.eq)}</span>` : '<span class="tag grn">ohne Geräte</span>'}${e.dose && e.dose !== '–' ? `<span class="tag">${esc(e.dose)}</span>` : ''}</div>
    <div class="card mapcard">${bodySVG({ hl: targetHL(e.m), mini: true })}${legend({ pain: 'Hauptziel', syn: 'arbeitet mit' })}</div>
    <div class="sec">Zielbereich</div><div class="chips" style="margin-bottom:14px">${e.m.map((m, i) => chip(m, i === 0 ? 'pain' : 'syn')).join('')}</div>
    <div class="card pad" style="margin-bottom:10px"><div class="sec">So geht’s</div><ol class="ol">${e.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol></div>
    ${e.err ? `<div class="box warn" style="margin-bottom:10px">⚠️ ${esc(e.err)}</div>` : ''}
    <div class="card pad" style="margin-bottom:10px"><div class="sec">Einstufung</div>
      ${tiers.map(([g, t]) => `<div class="row" style="justify-content:flex-start;margin-bottom:8px">${tierB(t)}<span><b>${esc(X.TIERS[t].t)}</b> <span class="muted">für ${esc(grpName(g))}</span></span></div>`).join('')}
      <p class="p">${esc(e.why || '')}</p></div>
    ${hist.length ? `<div class="card pad" style="margin-bottom:10px"><div class="sec">Dein Verlauf</div>${hist.slice(0, 5).map(h => `<div class="row" style="padding:4px 0;font-size:15px"><span class="muted">${fmtDay(h.ts)}</span><b>${esc(h.sets.map(s => setTxt(e, s).replace(' kg', '')).join(' · '))}</b></div>`).join('')}
      <div class="row" style="padding-top:8px;margin-top:6px;border-top:1px solid var(--line)"><span class="muted">Bestwert</span><b>${esc(setTxt(e, bestSet(e, hist.reduce((a, h) => a.concat(h.sets), []))))}</b></div></div>` : ''}
    <div class="stack">
      ${S.active ? `<button class="btn primary" data-act="wAddEx" data-id="${id}">＋ Zum laufenden Workout</button>` : ''}
      ${e.tier !== 'D' && e.tier !== 'C' ? `<button class="btn ${S.active ? 'soft' : 'primary'}" data-act="exTimer" data-id="${id}">⏱ Mit Timer üben (${e.hold} s${e.sides ? ' je Seite' : ''})</button>` : ''}
      <button class="btn plain" data-act="fav" data-id="${id}">${S.favs[id] ? '★ Favorit entfernen' : '☆ Als Favorit merken'}</button>
    </div>`;
  openSheet({ title: e.n, body });
}
Object.assign(ACT, {
  ex(el) { exSheet(el.dataset.id); },
  fav(el) { const id = el.dataset.id; if (S.favs[id]) delete S.favs[id]; else S.favs[id] = 1; save(); el.textContent = S.favs[id] ? '★ Favorit entfernen' : '☆ Als Favorit merken'; toast(S.favs[id] ? 'Als Favorit gemerkt' : 'Favorit entfernt'); },
  st(el) { go('body', { sub: 'map', sel: el.dataset.id, deep: !!(D.M[el.dataset.id] && D.M[el.dataset.id].deep) }); },
  topic(el) { go('body', { sub: 'topics', topic: el.dataset.id }); },
  test(el) {
    go('body', { sub: 'check' });
    const d = $('#t-' + el.dataset.id);
    if (d) { d.open = true; d.classList.add('flash'); setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40); }
  }
});

// Tier-Liste einer Gruppe (Training und Mobility nutzen dieselbe Darstellung)
function tierList(grp, filter) {
  const list = Object.values(E).filter(e => e.tiers[grp] && (!filter || filter(e)));
  return ['S', 'A', 'B', 'C', 'D'].map(t => {
    const xs = list.filter(e => e.tiers[grp] === t).sort((a, b) => (a.t === b.t ? 0 : a.t === 'kraft' ? -1 : 1) || a.n.localeCompare(b.n));
    if (!xs.length) return '';
    return `<div class="tierh">${tierB(t)}<span><b>${X.TIERS[t].t}</b><br><small>${X.TIERS[t].d}</small></span></div>
      <div class="card list">${xs.map(e => exRow(e.id, { tierOf: grp, sub: e.why, wrap: true })).join('')}</div>`;
  }).join('') || '<div class="empty"><div class="big">🔍</div>Keine Übung mit diesem Filter.</div>';
}
