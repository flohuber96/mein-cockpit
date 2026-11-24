'use strict';
/* ═══════════ Hunde-Coach – Training, Wissen, Gassi, Gamification ═══════════ */
const H = window.HUND;
const EX = Object.fromEntries(H.ex.map(e => [e.id, e]));
const CAT = Object.fromEntries(H.cats.map(c => [c.id, c]));
const ART = Object.fromEntries(H.wissen.map(a => [a.id, a]));

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
const tkey = ts => dkey(new Date(ts));
const MIN = 6e4, DAY = 864e5;
const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DAYS_S = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
const num = n => String(Math.round(n * 10) / 10).replace('.', ',');
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const vib = n => { if (navigator.vibrate) navigator.vibrate(n || 8); };
const todayKey = () => dkey(new Date());
function fmtDur(ms) {
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${pad(r)}` : `${h} h`;
}
const fmtClock = ms => {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600);
  return (h ? h + ':' + pad(Math.floor(s / 60) % 60) : Math.floor(s / 60)) + ':' + pad(s % 60);
};
function dayLabel(k) {
  const now = new Date();
  if (k === dkey(now)) return 'Heute';
  if (k === dkey(addDays(now, -1))) return 'Gestern';
  const d = fromKey(k); return `${DAYS[d.getDay()]}, ${fmtDate(d)}`;
}
function fmtAge(birth) {
  if (!birth) return '';
  const b = fromKey(birth), now = new Date();
  let m = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth();
  if (now.getDate() < b.getDate()) m--;
  if (m < 0) return '';
  if (m < 24) return `${m} Monate`;
  const y = Math.floor(m / 12), r = m % 12;
  return r ? `${y} J. ${r} Mon.` : `${y} Jahre`;
}
const toLocalInput = ts => { const d = new Date(ts); return `${dkey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromLocalInput = v => { const t = Date.parse(v); return isNaN(t) ? Date.now() : t; };
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffled(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const fmtVal = v => (v !== '' && v != null && !isNaN(+v)) ? num(+v) : String(v ?? '');
const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

/* ───────── State ───────── */
const KEY = 'hund.v1', WALK_KEY = 'hund.walk', LOCAL_KEY = 'hund.local';
const DEF_DOG = { name: '', birth: '', breed: 'Dackel-Bracke-Mix', sex: '', neutered: '', vet: '', vetPhone: '', clinic: '', chip: '', notes: '' };
const defBasics = () => H.basics.filter(b => b.on).map(b => b.id);
const defRoutines = () => H.routines.filter(r => r.on).map(r => r.id);
const DEF_FAM = { baby: false, kids: false };
function fresh() {
  return {
    v: 2, dog: { ...DEF_DOG }, settings: { theme: 'auto', routines: defRoutines(), fam: { ...DEF_FAM } },
    skills: {}, sessions: [], walks: [], incidents: [], health: [], days: {}, checks: {}, comments: [],
    lex: null, rew: null, trig: [], read: {}, quiz: {}, seen: {},
    ui: { view: 'heute', tseg: 'cats', rev: 30 },
  };
}
function migrate(s) {
  const f = fresh(), st = s.settings || {};
  const o = { ...f, ...s, dog: { ...f.dog, ...s.dog }, settings: { ...f.settings, ...st, fam: { ...DEF_FAM, ...(st.fam || {}) } }, ui: { ...f.ui, ...s.ui } };
  for (const k of ['sessions', 'walks', 'incidents', 'health', 'trig', 'comments']) if (!Array.isArray(o[k])) o[k] = [];
  for (const k of ['skills', 'days', 'read', 'quiz', 'seen', 'checks']) if (!o[k] || typeof o[k] !== 'object') o[k] = {};
  // Version 1 → 2: Basics werden zu „Immer“-Routinen, Tages-Häkchen zu einzelnen Checks (konfliktfrei auf mehreren Handys)
  if (!Array.isArray(st.routines)) {
    const keep = new Set(Array.isArray(st.basics) ? st.basics : defBasics());
    o.settings.routines = H.routines.filter(r => H.basics.some(b => b.id === r.id) ? keep.has(r.id) : r.on).map(r => r.id);
  }
  delete o.settings.basics;
  for (const [k, d] of Object.entries(o.days)) {
    if (!d || (!d.b && !d.done)) continue;
    const c = o.checks[k] = { ...(o.checks[k] || {}) };
    for (const id of Object.keys(d.b || {})) if (d.b[id] && !c['r:' + id]) c['r:' + id] = { t: fromKey(k).getTime() + 12 * 36e5 };
    for (const id of d.done || []) if (!c['ch:' + id]) c['ch:' + id] = { t: fromKey(k).getTime() + 12 * 36e5 };
    const { b, done, ...rest } = d;
    if (Object.keys(rest).length) o.days[k] = rest; else delete o.days[k];
  }
  o.v = 2;
  return o;
}
let rebuilt = false;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { rebuilt = true; }
  return fresh();
}
let S = load();
let _calc = null;
function save(fromServer) {
  _calc = null;
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  if (!fromServer && window.Cloud) Cloud.soon();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

let LOCAL = (() => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch (e) { return {}; } })(); // nur dieses Gerät
const saveLocal = () => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(LOCAL)); } catch (e) { /* voll */ } };
const me = () => String(LOCAL.me || '').trim();
let WALK = (() => { try { return JSON.parse(localStorage.getItem(WALK_KEY)); } catch (e) { return null; } })();
const saveWalk = () => { try { if (WALK) localStorage.setItem(WALK_KEY, JSON.stringify(WALK)); else localStorage.removeItem(WALK_KEY); } catch (e) { /* voll */ } };

const nav = { view: S.ui.view || 'heute', cat: null, ex: null, page: null, q: '' };
const scrollMem = {};

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#13150c' : '#eef4e7';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ───────── Datenzugriff ───────── */
const sk = id => S.skills[id] || { stage: 0, status: 'neu' };
function setSkill(id, patch) { S.skills[id] = { ...sk(id), ...patch, u: Date.now() }; }
const sessOf = id => S.sessions.filter(s => s.ex === id).sort((a, b) => b.ts - a.ts);
const lexList = () => S.lex || H.lexDefault;
const rewList = () => S.rew || H.rewDefault;
const dayRec = k => S.days[k] || {};
function setDay(k, patch) {
  const d = { ...dayRec(k), ...patch };
  const empty = !(d.rr && Object.keys(d.rr).length) && !d.ex;
  if (empty) delete S.days[k]; else S.days[k] = d;
}
const chk = k => S.checks[k] || {};
function setCheck(k, key, on) {
  const c = { ...chk(k) };
  if (on) { c[key] = { t: Date.now() }; if (me()) c[key].by = me(); } else delete c[key];
  if (Object.keys(c).length) S.checks[k] = c; else delete S.checks[k];
}
const famOn = f => !f || !!(S.settings.fam && S.settings.fam[f]);
const routineOn = (r, wd) => (S.settings.routines || []).includes(r.id) && famOn(r.fam) && (!r.wd || r.wd.includes(wd));
const commentsOf = (t, id, day) => S.comments.filter(c => c.ref && c.ref.t === t && (id == null || c.ref.id === id) && (!day || c.day === day)).sort((a, b) => b.ts - a.ts);
const STATUS = { neu: 'Neu', arbeit: 'In Arbeit', sitzt: 'Sitzt', gen: 'Generalisiert' };
function exProg(e) {
  const k = sk(e.id);
  if (k.status === 'gen') return 1;
  if (k.status === 'sitzt') return 0.85;
  if (k.status === 'arbeit' || k.stage > 0) return 0.1 + 0.6 * (k.stage / Math.max(1, e.st.length - 1));
  return 0;
}
const catEx = id => H.ex.filter(e => e.c === id);
const catProg = id => { const l = catEx(id); return l.length ? l.reduce((a, e) => a + exProg(e), 0) / l.length : 0; };
const isDone = e => ['sitzt', 'gen'].includes(sk(e.id).status);
function currentPhase() {
  for (let i = 0; i < H.path.length; i++) {
    if (H.path[i].fam) continue; // Extra-Phasen zählen nicht zum Hauptpfad
    const ph = H.path[i], list = ph.ex.map(id => EX[id]).filter(Boolean);
    if (list.filter(isDone).length / list.length < 0.7) return i;
  }
  return -1;
}
const walkDur = w => Math.max(0, (w.e || Date.now()) - w.s);
const WCNT = [
  { k: 'rk_ok', e: '📣', n: 'Rückruf geklappt', cls: 'ok' },
  { k: 'rk_no', e: '📣', n: 'Rückruf nicht', cls: 'no' },
  { k: 'ori', e: '👀', n: 'Check-in' },
  { k: 'leash', e: '🪢', n: 'Lockere Leine belohnt' },
  { k: 'enc_ok', e: '🐕', n: 'Begegnung entspannt', cls: 'ok' },
  { k: 'enc_no', e: '🐕', n: 'Begegnung schwierig', cls: 'no' },
  { k: 'wild_ok', e: '🦌', n: 'Wild: ansprechbar', cls: 'ok' },
  { k: 'wild_no', e: '🦌', n: 'Wild: nicht ansprechbar', cls: 'no' },
  { k: 'sniff', e: '🌿', n: 'Schnüffelpause' },
];
const cnt = (w, k) => (w.cnt && w.cnt[k]) || 0;
const walkXp = w => 15 + Math.min(15, cnt(w, 'rk_ok') + cnt(w, 'wild_ok') * 2 + Math.floor(cnt(w, 'ori') / 3));
const sessXp = s => 10 + Math.min(15, s.ok || 0);

/* ───────── Abzeichen ───────── */
const BADGES = [
  { id: 'first', e: '🎉', n: 'Erste Einheit', d: 'Erste Trainingseinheit eingetragen', f: s => s.nSess >= 1 },
  { id: 's10', e: '🎯', n: 'Dranbleiber', d: '10 Trainingseinheiten', f: s => s.nSess >= 10 },
  { id: 's50', e: '🏹', n: 'Trainingsprofi', d: '50 Trainingseinheiten', f: s => s.nSess >= 50 },
  { id: 's150', e: '🏆', n: 'Trainings-Legende', d: '150 Trainingseinheiten', f: s => s.nSess >= 150 },
  { id: 'w1', e: '🦮', n: 'Erste Runde', d: 'Erster Spaziergang im Gassi-Modus', f: s => s.nWalks >= 1 },
  { id: 'w25', e: '🥾', n: 'Wandervogel', d: '25 Spaziergänge eingetragen', f: s => s.nWalks >= 25 },
  { id: 'w100', e: '🗺️', n: 'Kilometerfresser', d: '100 Spaziergänge eingetragen', f: s => s.nWalks >= 100 },
  { id: 'c1', e: '⚡', n: 'Challenge angenommen', d: 'Erste Tages-Challenge geschafft', f: s => s.chTotal >= 1 },
  { id: 'c25', e: '🔥', n: 'Challenge-Jäger', d: '25 Tages-Challenges', f: s => s.chTotal >= 25 },
  { id: 'c100', e: '💎', n: 'Challenge-Meister', d: '100 Tages-Challenges', f: s => s.chTotal >= 100 },
  { id: 'p1', e: '🌟', n: 'Perfekter Tag', d: 'Alle 3 Challenges an einem Tag', f: s => s.perfect >= 1 },
  { id: 'p10', e: '✨', n: 'Perfektionist', d: '10 perfekte Tage', f: s => s.perfect >= 10 },
  { id: 'st3', e: '📅', n: '3-Tage-Serie', d: '3 Tage in Folge aktiv', f: s => s.best >= 3 },
  { id: 'st7', e: '🗓️', n: 'Wochen-Serie', d: '7 Tage in Folge aktiv', f: s => s.best >= 7 },
  { id: 'st30', e: '🏅', n: 'Monats-Serie', d: '30 Tage in Folge aktiv', f: s => s.best >= 30 },
  { id: 'st100', e: '👑', n: '100 Tage am Stück', d: '100 Tage in Folge aktiv', f: s => s.best >= 100 },
  { id: 'rk10', e: '📣', n: 'Kommt doch!', d: '10 erfolgreiche Rückrufe draußen', f: s => s.rkOk >= 10 },
  { id: 'rk50', e: '🎺', n: 'Rückruf-Ass', d: '50 erfolgreiche Rückrufe draußen', f: s => s.rkOk >= 50 },
  { id: 'rk200', e: '🪃', n: 'Bumerang', d: '200 erfolgreiche Rückrufe draußen', f: s => s.rkOk >= 200 },
  { id: 'wild10', e: '🌲', n: 'Ansprechbar', d: '10× bei Wild ansprechbar geblieben', f: s => s.wildOk >= 10 },
  { id: 'sk1', e: '✅', n: 'Sitzt!', d: 'Erste Übung auf „sitzt“', f: s => s.sitzt >= 1 },
  { id: 'sk5', e: '🧩', n: 'Werkzeugkiste', d: '5 Übungen sitzen', f: s => s.sitzt >= 5 },
  { id: 'sk15', e: '🧰', n: 'Allrounder', d: '15 Übungen sitzen', f: s => s.sitzt >= 15 },
  { id: 'gen1', e: '🌍', n: 'Überall', d: 'Erste Übung generalisiert', f: s => s.gen >= 1 },
  { id: 'gen5', e: '🛰️', n: 'Generalist', d: '5 Übungen generalisiert', f: s => s.gen >= 5 },
  { id: 'cats', e: '🧭', n: 'Entdecker', d: `In allen ${H.cats.length} Bereichen trainiert`, f: s => s.cats >= H.cats.length },
  { id: 'nase', e: '👃', n: 'Super-Spürnase', d: '15 Einheiten Nasenarbeit', f: s => (s.byCat.nase || 0) >= 15 },
  { id: 'jagd', e: '🦌', n: 'Jagd-Manager', d: '15 Einheiten Jagdverhalten', f: s => (s.byCat.jagd || 0) >= 15 },
  { id: 'ruhe', e: '😌', n: 'Zen-Hund', d: '15 Einheiten Ruhe & Entspannung', f: s => (s.byCat.ruhe || 0) >= 15 },
  { id: 'hand', e: '🖐️', n: 'Kooperativ', d: '10 Einheiten Akzeptanz & Pflege', f: s => (s.byCat.handling || 0) >= 10 },
  { id: 'mensch', e: '🧑‍🏫', n: 'Selbstreflexion', d: '5 Einheiten „Dein Verhalten“', f: s => (s.byCat.mensch || 0) >= 5 },
  { id: 'al30', e: '🏠', n: 'Kurz allein', d: '30 Min entspannt allein', f: s => s.alleinMax >= 30 },
  { id: 'al120', e: '🛋️', n: 'Allein-Profi', d: '2 Stunden entspannt allein', f: s => s.alleinMax >= 120 },
  { id: 'leash', e: '🪢', n: 'Lockere Leine', d: '5 Spaziergänge mit Leinen-Note ab 4', f: s => s.leashGood >= 5 },
  { id: 'basics7', e: '🧱', n: 'Fundament-Woche', d: 'An 7 Tagen alle 24/7-Routinen erfüllt', f: s => s.basicsPerfect >= 7 },
  { id: 'slot10', e: '🗓️', n: 'Routinen-Profi', d: '10 Tageszeiten komplett abgehakt', f: s => s.slotsFull >= 10 },
  { id: 'dayfull', e: '🌈', n: 'Voller Tag', d: 'Alle Routinen und alle 3 Challenges an einem Tag', f: s => s.daysFull >= 1 },
  { id: 'com1', e: '💬', n: 'Erster Kommentar', d: 'Ersten Kommentar geschrieben', f: s => s.com >= 1 },
  { id: 'com30', e: '📓', n: 'Tagebuchschreiber', d: '30 Kommentare geschrieben', f: s => s.com >= 30 },
  { id: 'review', e: '📊', n: 'Rückblick', d: 'Monatsauswertung angesehen', f: s => s.review },
  { id: 'fam5', e: '👶', n: 'Familien-Team', d: '5 Einheiten Baby, Kinder & Besuch', f: s => (s.byCat.familie || 0) >= 5 },
  { id: 'read5', e: '📖', n: 'Wissbegierig', d: '5 Artikel gelesen', f: s => s.read >= 5 },
  { id: 'readall', e: '📚', n: 'Bücherwurm', d: 'Alle Artikel gelesen', f: s => s.read >= H.wissen.length },
  { id: 'q10', e: '🧠', n: 'Quiz-Kopf', d: '10 Quizfragen richtig', f: s => s.quizOk >= 10 },
  { id: 'qall', e: '🎓', n: 'Hundeprofessor', d: 'Alle Quizfragen richtig beantwortet', f: s => s.quizOk >= H.quiz.length },
  { id: 'diary', e: '🔍', n: 'Detektiv', d: '10 Einträge im Verhaltens-Tagebuch', f: s => s.inc >= 10 },
  { id: 'profile', e: '🐶', n: 'Steckbrief', d: 'Name und Geburtstag im Profil', f: s => s.profile },
  { id: 'early', e: '🌅', n: 'Frühaufsteher', d: 'Training oder Gassi vor 7 Uhr', f: s => s.early },
  { id: 'path1', e: '🚩', n: 'Phase 1 geschafft', d: 'Lernpfad-Phase 1 zu 70 % „sitzt“', f: s => s.phase === -1 || s.phase >= 1 },
  { id: 'path4', e: '🏁', n: 'Lernpfad komplett', d: 'Alle 4 Phasen des Lernpfads geschafft', f: s => s.phase === -1 },
];
const LVL_NEED = L => 75 * (L - 1) * L;
const lvlOf = xp => { let L = 1; while (xp >= LVL_NEED(L + 1)) L++; return L; };
const lvlTitle = L => H.titles[Math.min(L, H.titles.length) - 1] + (L > H.titles.length ? ' ★' + (L - H.titles.length) : '');

/* ───────── Auswertung (zwischengespeichert bis zur nächsten Änderung) ───────── */
function C() { return _calc || (_calc = compute()); }
function compute() {
  const act = new Set(), mins = {};
  const addMin = (k, ms) => { mins[k] = (mins[k] || 0) + ms; };
  let early = false;
  for (const s of S.sessions) { const k = tkey(s.ts); act.add(k); addMin(k, s.dur || 0); if (new Date(s.ts).getHours() < 7) early = true; }
  for (const w of S.walks) { const k = tkey(w.s); act.add(k); addMin(k, walkDur(w)); if (new Date(w.s).getHours() < 7) early = true; }
  let chTotal = 0, perfect = 0, rCnt = 0, basicsPerfect = 0, chXp = 0, slotsFull = 0, daysFull = 0;
  for (const [k, c] of Object.entries(S.checks)) {
    const keys = Object.keys(c), chDone = keys.filter(x => x.startsWith('ch:')).length, rDone = keys.filter(x => x.startsWith('r:')).length;
    if (chDone || rDone >= 3 || keys.some(x => x.startsWith('ex:'))) act.add(k);
    chTotal += chDone; if (chDone >= 3) perfect++;
    chXp += chDone * 20 + (chDone >= 3 ? 30 : 0);
    rCnt += rDone;
    const wd = fromKey(k).getDay(); let all = true;
    for (const sl of H.slots) {
      const rs = H.routines.filter(r => r.s === sl.id && routineOn(r, wd));
      const full = rs.length > 0 && rs.every(r => c['r:' + r.id]);
      if (full) { slotsFull++; if (sl.id === 'immer') basicsPerfect++; }
      if (rs.length && !full) all = false;
    }
    if (all && chDone >= 3) daysFull++;
  }
  const comDays = {};
  for (const m of S.comments) { act.add(m.day); comDays[m.day] = (comDays[m.day] || 0) + 1; }
  const comXp = Object.values(comDays).reduce((a, n) => a + Math.min(5, n) * 2, 0);
  // Serie
  const t = new Date(); let d = act.has(dkey(t)) ? t : addDays(t, -1), cur = 0;
  while (act.has(dkey(d))) { cur++; d = addDays(d, -1); }
  let best = 0, run = 0, prev = null;
  for (const k of [...act].sort()) { run = prev && dkey(addDays(fromKey(prev), 1)) === k ? run + 1 : 1; best = Math.max(best, run); prev = k; }
  // Kennzahlen
  const byCat = {}, catsSet = new Set(); let alleinMax = 0, nonMetaSess = 0;
  for (const s of S.sessions) { const e = EX[s.ex]; if (!e) continue; byCat[e.c] = (byCat[e.c] || 0) + 1; catsSet.add(e.c); if (s.ex === 'al-aufbau' && s.ok && +s.val > alleinMax) alleinMax = +s.val; nonMetaSess++; }
  let sitzt = 0, gen = 0, skillXp = 0;
  for (const [id, k] of Object.entries(S.skills)) {
    if (!EX[id]) continue;
    if (k.status === 'sitzt' || k.status === 'gen') sitzt++;
    if (k.status === 'gen') gen++;
    skillXp += (k.stage || 0) * 15 + (k.status === 'sitzt' ? 40 : k.status === 'gen' ? 120 : 0);
  }
  let rkOk = 0, wildOk = 0, leashGood = 0;
  for (const w of S.walks) { rkOk += cnt(w, 'rk_ok'); wildOk += cnt(w, 'wild_ok'); if (w.leash >= 4) leashGood++; }
  const read = Object.keys(S.read).filter(id => ART[id]).length;
  const quizOk = H.quiz.filter(q => S.quiz[q.id] && S.quiz[q.id].ok).length;
  const st = {
    nSess: nonMetaSess, nWalks: S.walks.length, chTotal, perfect, cur, best, rkOk, wildOk, sitzt, gen, cats: catsSet.size, byCat,
    alleinMax, leashGood, basicsPerfect, read, quizOk, inc: S.incidents.length, profile: !!(S.dog.name && S.dog.birth), early, phase: currentPhase(),
    slotsFull, daysFull, com: S.comments.length, review: !!S.seen._review,
  };
  const badges = BADGES.filter(b => { try { return b.f(st); } catch (e) { return false; } });
  const xp = {
    train: S.sessions.reduce((a, s) => a + sessXp(s), 0),
    walk: S.walks.reduce((a, w) => a + walkXp(w), 0),
    ch: chXp, basics: rCnt * 3 + slotsFull * 10, skill: skillXp,
    know: read * 10 + quizOk * 10, diary: S.incidents.length * 3 + comXp, badge: badges.length * 25,
  };
  const total = Object.values(xp).reduce((a, b) => a + b, 0);
  const level = lvlOf(total);
  return { act, mins, st, badges, xp, total, level };
}

/* ───────── Tages-Challenges ───────── */
const SLOT = [
  { n: 'Gassi', e: '🦮', plan: 'gassi', pool: c => c.c === 'gassi' },
  { n: 'Training', e: '🎯', plan: 'tag', pool: c => c.c === 'training' },
  { n: 'Alltag & Du', e: '❤️', plan: 'abend', pool: c => c.c === 'alltag' || c.c === 'mensch' },
];
function tierFor(k) { // Erfahrung = aktive Tage VOR diesem Tag (stabil innerhalb eines Tages)
  let n = 0; for (const x of C().act) if (x < k) n++;
  return n >= 30 ? 3 : n >= 10 ? 2 : 1;
}
function challengesFor(k) {
  const d = dayRec(k), tier = tierFor(k), used = new Set();
  return SLOT.map((slot, i) => {
    const pool = H.challenges.filter(c => slot.pool(c) && c.l <= tier && famOn(c.fam));
    const list = shuffled(pool, hash(k + '|' + i + '|' + ((d.rr && d.rr[i]) || 0)));
    const pick = list.find(c => !used.has(c.id)) || list[0];
    used.add(pick.id);
    return { ...pick, slot: i };
  });
}

/* ───────── Empfehlungen ───────── */
function recommend(n = 3) {
  const t = todayKey();
  const today = new Set(S.sessions.filter(s => tkey(s.ts) === t).map(s => s.ex));
  const last = id => (sessOf(id)[0] || {}).ts || 0;
  const prog = H.ex.filter(e => sk(e.id).status === 'arbeit' && !today.has(e.id)).sort((a, b) => last(a.id) - last(b.id));
  const pi = currentPhase();
  const fam = H.path.filter(p => p.fam && famOn(p.fam)).flatMap(p => p.ex);
  const path = [...(pi >= 0 ? H.path[pi].ex : []), ...fam].map(id => EX[id]).filter(e => e && sk(e.id).status === 'neu');
  const out = [];
  for (const e of prog) { if (out.length >= 2) break; out.push(e); }
  for (const e of path) { if (out.length >= n) break; if (!out.includes(e)) out.push(e); }
  for (const e of prog) { if (out.length >= n) break; if (!out.includes(e)) out.push(e); }
  return out;
}
function stageAdvice(id) {
  const e = EX[id], k = sk(id);
  const ss = S.sessions.filter(s => s.ex === id && s.stage === k.stage && s.reps > 0).sort((a, b) => b.ts - a.ts).slice(0, 2);
  if (!ss.length) return null;
  const last = ss[0];
  if (last.reps >= 4 && last.ok / last.reps < 0.5) return 'down';
  if (ss.length === 2 && ss.every(s => s.reps >= 5 && s.ok / s.reps >= 0.8)) {
    if (k.stage < e.st.length - 1) return 'up';
    if (k.status === 'arbeit' || k.status === 'neu') return 'sitzt';
  }
  return null;
}

/* ───────── Gesundheit: Fälligkeiten ───────── */
function dueHealth() {
  const out = [], lim = dkey(addDays(new Date(), 7)), t = todayKey();
  for (const ty of H.healthTypes) {
    const last = S.health.filter(h => h.type === ty.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (last && last.next && last.next <= lim) out.push({ ty, h: last, over: last.next < t });
  }
  return out;
}

/* ───────── Toast, Konfetti, Sheets ───────── */
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
function confetti() {
  const box = document.createElement('div'); box.className = 'confetti';
  const em = ['🐾', '⭐', '🦴', '🎉', '✨', '🏅'];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span'); s.textContent = em[i % em.length];
    s.style.left = (5 + Math.random() * 90) + '%'; s.style.animationDelay = (Math.random() * 0.4) + 's'; s.style.fontSize = (18 + Math.random() * 16) + 'px';
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2200);
}
const sheetStack = [];
function openSheet({ title = '', right = '', body = '', onClose, cls = '' } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet ' + cls;
  sh.innerHTML = `<div class="sheet-head"><button class="lnk" data-act="closeSheet">Schließen</button><b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
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
const topSheet = () => sheetStack.length ? sheetStack[sheetStack.length - 1].sh : null;
function confirmSheet(text, okLabel, onOk) {
  openSheet({
    title: 'Bist du sicher?', body: `<p class="confirm-t">${esc(text)}</p><div class="stack">
      <button class="btn primary" data-act="confirmOk">${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`,
  });
  pending.confirm = onOk;
}

/* ───────── Belohnung für Aktionen ───────── */
function quietSeen() { // neue Abzeichen/Level ohne Feier merken (z. B. nach Abgleich)
  const c = C(); let ch = false;
  for (const b of c.badges) if (!S.seen[b.id]) { S.seen[b.id] = Date.now(); ch = true; }
  if (!S.seen._lvl || S.seen._lvl < c.level) { S.seen._lvl = c.level; ch = true; }
  return ch;
}
function celebrate(xpMsg) {
  const c = C(); const nb = c.badges.filter(b => !S.seen[b.id]);
  let msg = xpMsg || '', party = false;
  if (nb.length) { nb.forEach(b => { S.seen[b.id] = Date.now(); }); msg = nb.length === 1 ? `🏅 Abzeichen: ${nb[0].n}` : `🏅 ${nb.length} neue Abzeichen`; party = true; }
  if (c.level > (S.seen._lvl || 1)) { S.seen._lvl = c.level; msg = `⬆️ Level ${c.level}: ${lvlTitle(c.level)}`; party = true; }
  if (party) { save(); confetti(); vib([10, 40, 10]); }
  if (msg) toast(msg);
}

/* ───────── Mini-Markup für Wissen ───────── */
function md(lines) {
  let h = '', ul = false;
  const close = () => { if (ul) { h += '</ul>'; ul = false; } };
  for (const l of lines) {
    if (l.startsWith('- ')) { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${inl(l.slice(2))}</li>`; continue; }
    close();
    if (l.startsWith('## ')) h += `<h3>${inl(l.slice(3))}</h3>`;
    else if (l.startsWith('! ')) h += `<div class="callout">💡 ${inl(l.slice(2))}</div>`;
    else if (l.startsWith('> ')) h += `<div class="callout breed">🐕 ${inl(l.slice(2))}</div>`;
    else h += `<p>${inl(l)}</p>`;
  }
  close(); return h;
}

/* ───────── Bausteine ───────── */
const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
};
const bar = (p, cls = '') => `<div class="pbar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></i></div>`;
const lvlDots = l => `<span class="lvl l${l}" title="${['', 'Basis', 'Aufbau', 'Profi'][l]}">${'●'.repeat(l)}${'○'.repeat(3 - l)}</span>`;
const stChip = st => `<span class="schip s-${st}">${STATUS[st]}</span>`;
function exRow(e, extra = '') {
  const k = sk(e.id), n = e.st.length;
  return `<button class="exrow" data-act="openEx" data-id="${e.id}">
    <span class="exe">${CAT[e.c].e}</span>
    <span class="exm"><b>${esc(e.n)}</b><small>${lvlDots(e.l)} ${k.status !== 'neu' ? `Stufe ${k.stage + 1}/${n}` : esc(e.d)}${extra}</small>${k.status !== 'neu' ? bar(exProg(e), 'thin') : ''}</span>
    ${stChip(k.status)}</button>`;
}
function chartBars(vals, labels, { sel = -1, fmt = v => v, h = 92 } = {}) {
  const max = Math.max(1, ...vals);
  return `<div class="bars" style="grid-template-columns:repeat(${vals.length},minmax(0,1fr));height:${h}px">${vals.map((v, i) => `<div class="bar ${v ? '' : 'zero'} ${i === sel ? 'sel' : ''}" title="${esc(fmt(v))}"><i style="height:${Math.max(2, v / max * 100)}%"></i></div>`).join('')}</div>
    <div class="blbl" style="grid-template-columns:repeat(${vals.length},minmax(0,1fr))">${labels.map((l, i) => `<span class="${i === sel ? 'sel' : ''}">${esc(l)}</span>`).join('')}</div>`;
}

/* ═══════════ Ansichten ═══════════ */
function render() {
  S.ui.view = nav.view;
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === nav.view && !nav.page));
  let title = '', sub = '', html = '';
  if (nav.ex && EX[nav.ex]) { const e = EX[nav.ex]; title = e.n; sub = CAT[e.c].e + ' ' + CAT[e.c].n; html = viewEx(e); }
  else if (nav.view === 'heute') { title = S.dog.name ? `Hallo ${S.dog.name}` : 'Heute'; const d = new Date(); sub = `${DAYS[d.getDay()]}, ${fmtDate(d)}`; html = viewToday(); }
  else if (nav.view === 'training') {
    if (nav.cat) { const c = CAT[nav.cat]; title = c.n; sub = `${catEx(c.id).length} Übungen · ${Math.round(catProg(c.id) * 100)} %`; html = viewCat(c); }
    else { title = 'Training'; sub = `${H.ex.length} Übungen in ${H.cats.length} Bereichen`; html = viewTraining(); }
  }
  else if (nav.view === 'gassi') { title = 'Gassi'; sub = WALK ? 'Spaziergang läuft' : 'Challenges & Protokoll'; html = viewGassi(); }
  else if (nav.view === 'wissen') { title = 'Wissen'; sub = 'Lernen, Verhalten, Gesundheit, Alltag'; html = viewWissen(); }
  else if (nav.view === 'erfolge') { nav.view = 'mehr'; nav.page = 'erfolge'; return render(); } // Erfolge liegen jetzt unter Einstellungen
  else if (nav.view === 'mehr') { const p = PAGES[nav.page]; title = p ? p.t : 'Einstellungen'; sub = p ? p.sub() : 'Profil, Erfolge, Werkzeuge, Daten'; html = p ? p.v() : viewMore(); }
  $('#title').textContent = title;
  $('#sub').textContent = sub;
  const nested = nav.ex || nav.cat || nav.page;
  $('#back').hidden = !nested;
  document.body.classList.toggle('nested', !!nested);
  $('#hact').innerHTML = window.Cloud ? Cloud.badge() : '';
  $$('.gear-btn').forEach(b => b.classList.toggle('on', nav.view === 'mehr' && !nav.page));
  $('#main').innerHTML = html;
  tick();
}

/* ───────── Tagesplan (Routinen + Challenges + Fokus-Übungen nach Tageszeit) ───────── */
const SLOTS = Object.fromEntries(H.slots.map(s => [s.id, s]));
const TYPE_N = { r: 'Routine', ch: 'Challenge', ex: 'Übung' };
function curSlot() { const h = new Date().getHours(); return h < 10 ? 'morgen' : h < 17 ? 'tag' : 'abend'; }
function walkPick(exclude) {
  const ok = e => e && e.w && !exclude.includes(e.id);
  const prog = H.ex.filter(e => ok(e) && sk(e.id).status === 'arbeit');
  if (prog.length) return prog[hash(todayKey()) % prog.length].id;
  const pi = currentPhase(), path = pi >= 0 ? H.path[pi].ex.map(id => EX[id]).filter(e => ok(e) && sk(e.id).status !== 'sitzt' && sk(e.id).status !== 'gen') : [];
  return (path[0] || EX['g-name']).id;
}
function dayEx(k) { const x = dayRec(k).ex; return x && Array.isArray(x.tag) ? { tag: x.tag.filter(id => EX[id]), gassi: (x.gassi || []).filter(id => EX[id]) } : null; }
function ensureDayPlan(k) { // Fokus-Übungen einmal pro Tag festlegen – stabil und auf allen Handys gleich
  if (dayEx(k)) return false;
  const tag = recommend(2).map(e => e.id);
  setDay(k, { ex: { tag, gassi: [walkPick(tag)] } });
  return true;
}
function planFor(k) {
  const wd = fromKey(k).getDay(), c = chk(k), dx = dayEx(k) || { tag: [], gassi: [] };
  const trained = new Set(S.sessions.filter(s => tkey(s.ts) === k).map(s => s.ex));
  const exItem = id => { const e = EX[id], st = sk(id); return { key: 'ex:' + id, type: 'ex', id, e: CAT[e.c].e, n: e.n, t: `Stufe ${st.stage + 1}/${e.st.length}: ${e.st[st.stage]}` }; };
  const chs = challengesFor(k);
  return H.slots.map(sl => {
    const items = [];
    if (sl.id === 'gassi') dx.gassi.forEach(id => items.push(exItem(id)));
    if (sl.id === 'tag') dx.tag.forEach(id => items.push(exItem(id)));
    chs.filter(x => SLOT[x.slot].plan === sl.id).forEach(x => items.push({ key: 'ch:' + x.id, type: 'ch', id: x.id, ch: x, e: '⚡', n: x.n, t: x.t }));
    H.routines.filter(r => r.s === sl.id && routineOn(r, wd)).forEach(r => items.push({ key: 'r:' + r.id, type: 'r', id: r.id, e: r.e, n: r.n, t: r.t }));
    items.forEach(it => { it.slot = sl.id; it.done = !!c[it.key] || (it.type === 'ex' && trained.has(it.id)); it.by = c[it.key] && c[it.key].by; });
    return { ...sl, items };
  });
}
const planStats = plan => { const all = plan.flatMap(s => s.items); return { all, done: all.filter(i => i.done).length, total: all.length }; };
const slotOpen = {};
function itemRow(it, k) {
  const nCom = commentsOf(it.type, it.id, k).length, d = dayRec(k);
  const rr = it.type === 'ch' && !it.done && !((d.rr && d.rr[it.ch.slot]) || 0);
  return `<div class="pitem ${it.done ? 'done' : ''}">
    <button class="pck" data-act="planCheck" data-key="${esc(it.key)}" aria-label="${it.done ? 'Nicht erledigt' : 'Erledigt'}"><i></i></button>
    <button class="pmain" data-act="planOpen" data-key="${esc(it.key)}"><small><span class="pt t-${it.type}">${TYPE_N[it.type]}</span>${it.by && it.done ? ` · ✓ ${esc(it.by)}` : ''}</small><b>${it.e} ${esc(it.n)}</b><span class="pd">${esc(it.t)}</span></button>
    <span class="pacts">${it.type === 'ex' ? `<button data-act="startTrainer" data-id="${it.id}" aria-label="Mit Zähler trainieren">▶</button>` : ''}${rr ? `<button data-act="chReroll" data-slot="${it.ch.slot}" aria-label="Andere Challenge">↻</button>` : ''}${it.type === 'ex' && !it.done ? `<button data-act="exSwap" data-id="${it.id}" aria-label="Andere Übung">↻</button>` : ''}<button data-act="comAdd" data-t="${it.type}" data-id="${esc(it.id)}" aria-label="Kommentar" class="${nCom ? 'has' : ''}">💬${nCom ? `<em>${nCom}</em>` : ''}</button></span></div>`;
}
function planHtml(k) {
  const plan = planFor(k), cur = curSlot();
  return plan.filter(sl => sl.items.length).map(sl => {
    const n = sl.items.filter(i => i.done).length, open = slotOpen[sl.id] ?? (sl.id === cur || (sl.id === 'gassi' && !!WALK));
    return `<div class="card pslot ${open ? 'open' : ''} ${n === sl.items.length ? 'full' : ''}">
      <button class="psh" data-act="slotToggle" data-id="${sl.id}"><span class="pse">${sl.e}</span><b>${esc(sl.n)}${sl.id === cur ? ' <em>jetzt</em>' : ''}</b><span class="psc">${n}/${sl.items.length}</span><i class="chev">›</i></button>
      ${bar(n / sl.items.length, 'thin')}
      ${open ? `<div class="pitems">${sl.items.map(it => itemRow(it, k)).join('')}</div>` : ''}</div>`;
  }).join('');
}
function findItem(key, k = todayKey()) { return planFor(k).flatMap(s => s.items).find(i => i.key === key); }
function togglePlan(key, on) {
  const k = todayKey(), it = findItem(key);
  if (!it) return;
  const now = on == null ? !it.done : on;
  if (it.type === 'ex' && !now && S.sessions.some(s => s.ex === it.id && tkey(s.ts) === k)) { toast('Heute schon trainiert – Einheit im Verlauf löschen, um das zu ändern'); return; }
  setCheck(k, key, now); save();
  if (now) {
    vib(10);
    const xp = it.type === 'ch' ? 20 : it.type === 'r' ? 3 : 0, sl = planFor(k).find(s => s.id === it.slot);
    const slotFull = sl && sl.items.every(i => i.done), ps = planStats(planFor(k));
    if (ps.done === ps.total) { confetti(); celebrate('🌈 Tagesplan komplett erledigt!'); }
    else celebrate(slotFull ? `${SLOTS[it.slot].e} ${SLOTS[it.slot].n} komplett!` : xp ? `Erledigt · +${xp} XP` : 'Erledigt');
  }
}

/* ── HEUTE ── */
function viewToday() {
  const c = C(), t = todayKey();
  if (ensureDayPlan(t)) save();
  const L = c.level, need0 = LVL_NEED(L), need1 = LVL_NEED(L + 1);
  let h = '';
  if (!S.dog.name) h += `<button class="card setup" data-act="profile"><span>🐶</span><span><b>Steckbrief anlegen</b><small>Name, Geburtstag und Tierarzt deines Hundes – für persönliche Tipps.</small></span></button>`;
  const baby = babyHint();
  if (baby) h += `<div class="card setup"><span>👶</span><span><b>Baby im Haushalt?</b><small>Im Baby-Tagebuch ist ein Baby eingetragen. Sollen Baby-Themen (Vorbereitung, Aufsicht, Routinen) in deinen Plan?</small><span class="row2"><button class="btn primary sm" data-act="famOn" data-v="baby">Ja, aktivieren</button><button class="btn plain sm" data-act="famNo">Nein danke</button></span></span></div>`;
  h += `<div class="card hero">
    <div class="hero-top"><div class="avatar">🐕</div><div class="hero-m"><b>${esc(S.dog.name || 'Dein Hund')}</b><small>${esc([S.dog.breed, fmtAge(S.dog.birth)].filter(Boolean).join(' · '))}</small></div>
      <div class="streak ${c.st.cur ? 'on' : ''}"><span>🔥</span><b>${c.st.cur}</b><small>${c.st.cur === 1 ? 'Tag' : 'Tage'}</small></div></div>
    <div class="hero-lvl"><span class="lv">Lv ${L}</span><span class="lt">${esc(lvlTitle(L))}</span><span class="lx">${c.total - need0} / ${need1 - need0} XP</span></div>
    ${bar((c.total - need0) / (need1 - need0), 'xp')}</div>`;
  if (WALK) h += `<button class="card running" data-act="tab" data-view="gassi"><span class="re">🦮</span><span class="ri"><small>Gassi läuft</small><b data-clock="walk">${fmtClock(Date.now() - WALK.s)}</b></span><span class="go">Öffnen ›</span></button>`;
  for (const x of dueHealth()) h += `<button class="card due ${x.over ? 'over' : ''}" data-act="openPage" data-id="health"><span>${x.ty.e}</span><span><b>${esc(x.ty.n)} ${x.over ? 'überfällig' : 'bald fällig'}</b><small>geplant: ${fmtDate(fromKey(x.h.next))}</small></span></button>`;
  if (reviewDue()) h += `<button class="card due review" data-act="openPage" data-id="review"><span>📊</span><span><b>Deine Monatsauswertung ist bereit</b><small>Was hat sich in 30 Tagen verändert? Kommentare, Erfolge und Tipps.</small></span></button>`;
  // Tagesplan
  const ps = planStats(planFor(t));
  h += `<div class="card modecard"><div class="mc-top"><div class="ring" style="--p:${ps.total ? ps.done / ps.total : 0}"><b>${ps.done}</b><small>/${ps.total}</small></div>
      <div><b>Tagesplan</b><small>${ps.done === ps.total ? 'Alles erledigt – stark! 🌈' : `Noch ${ps.total - ps.done} Aufgaben: Routinen, Challenges und Fokus-Übungen`}</small></div></div>
    <button class="btn primary" data-act="modeStart">▶ Übungsmodus starten</button></div>`;
  h += `<div class="section-t">Heute nach Tageszeit <button data-act="openPage" data-id="routines">Anpassen</button></div>${planHtml(t)}`;
  // Tageskommentar
  const dc = commentsOf('day', t, t);
  h += `<div class="section-t">Kommentar zum Tag</div><div class="card daycom">${dc.length ? dc.map(comRow).join('') : '<p class="small muted">Was lief heute gut, was war schwierig? Deine Kommentare landen in der Datenbank und werden in der Monatsauswertung zusammengefasst.</p>'}
    <button class="btn soft" data-act="comAdd" data-t="day" data-id="${t}">💬 ${dc.length ? 'Weiteren Kommentar' : 'Kommentar schreiben'}</button></div>`;
  h += quizOfDay();
  const tips = [...H.rules.map(r => ({ e: r.e, n: r.n, t: r.t })), ...H.dd.flatMap(a => a.do.map(x => ({ e: a.e, n: a.n + ': Do', t: x })))];
  const tip = tips[hash(t) % tips.length];
  h += `<div class="section-t">Tipp des Tages</div><div class="card tip"><span>${tip.e}</span><div><b>${esc(tip.n)}</b><p>${esc(tip.t)}</p></div></div>`;
  h += `<div class="section-t">Schnell eintragen</div><div class="quick">
    <button class="card" data-act="pickEx"><span>🎯</span>Einheit</button>
    <button class="card" data-act="incAdd"><span>📝</span>Verhalten</button>
    <button class="card" data-act="${WALK ? 'tab" data-view="gassi' : 'walkStart'}"><span>🦮</span>${WALK ? 'Gassi läuft' : 'Gassi'}</button></div>`;
  return h;
}
function babyHint() {
  if (S.settings.fam.baby || S.seen._babyAsk) return false;
  try { const b = JSON.parse(localStorage.getItem('baby.v1') || 'null'); return !!(b && b.settings && b.settings.birth); } catch (e) { return false; }
}
function firstActive() { let f = null; for (const k of C().act) if (!f || k < f) f = k; return f; }
function reviewDue() {
  const f = firstActive(); if (!f) return false;
  const since = k => Math.round((fromKey(todayKey()) - fromKey(k)) / DAY);
  return since(f) >= 30 && (!S.seen._review || since(S.seen._review) >= 30);
}

/* ── Übungsmodus: Aufgabe für Aufgabe ── */
let M = null;
function modeQueue() {
  const k = todayKey(), plan = planFor(k), cur = curSlot();
  const order = [cur, 'gassi', ...['morgen', 'tag', 'abend'].filter(x => x !== cur), 'immer'];
  const slots = M.filter === 'alle' ? order : [M.filter];
  const items = slots.flatMap(id => (plan.find(s => s.id === id) || { items: [] }).items);
  return { items, open: items.filter(i => !i.done && !M.skip.has(i.key)), done: items.filter(i => i.done).length };
}
function modeBody() {
  const q = modeQueue(), it = q.open[0];
  let h = `<div class="mode"><div class="chiprow wrap mfilter">${[['alle', 'Alle'], ...H.slots.map(s => [s.id, s.e + ' ' + s.n.replace('Bei jedem ', '')])].map(([v, n]) => `<button class="chip ${M.filter === v ? 'on' : ''}" data-act="modeFilter" data-v="${v}">${esc(n)}</button>`).join('')}</div>
    <div class="mprog"><span>${q.done} von ${q.items.length} erledigt</span>${M.skip.size ? `<button class="lnk" data-act="modeUnskip">${M.skip.size} übersprungen – zurückholen</button>` : ''}</div>${bar(q.items.length ? q.done / q.items.length : 1)}`;
  if (!it) {
    const all = planStats(planFor(todayKey()));
    return h + `<div class="mdone"><div class="big">${all.done === all.total ? '🌈' : '✅'}</div><b>${all.done === all.total ? 'Tagesplan komplett!' : q.items.length ? 'Hier ist alles erledigt' : 'Keine Aufgaben in diesem Abschnitt'}</b>
      <p class="small muted">${all.done === all.total ? 'Großartige Arbeit für euch beide. Gönn deinem Hund jetzt Ruhe – Gelerntes festigt sich im Schlaf.' : `Insgesamt ${all.done} von ${all.total} erledigt. Wähle oben einen anderen Abschnitt.`}</p>
      <div class="stack"><button class="btn soft" data-act="comAdd" data-t="day" data-id="${todayKey()}">💬 Kommentar zum Tag</button><button class="btn plain" data-act="closeSheet">Fertig</button></div></div></div>`;
  }
  const sl = SLOTS[it.slot];
  h += `<div class="mcard"><div class="mk">${sl.e} ${esc(sl.n)} · <span class="pt t-${it.type}">${TYPE_N[it.type]}</span></div><h2>${it.e} ${esc(it.n)}</h2>`;
  if (it.type === 'ex') {
    const e = EX[it.id], st = sk(it.id);
    h += `<p class="goal">${esc(e.g)}</p><div class="mstage"><small>Stufe ${st.stage + 1} von ${e.st.length}</small><b>${esc(e.st[st.stage])}</b></div>
      <details class="tr-help"><summary>Anleitung (${e.s.length} Schritte)</summary><ol>${e.s.map(x => `<li>${inl(x)}</li>`).join('')}</ol><p class="small muted">🎯 ${esc(e.k)}</p></details>
      ${e.r ? `<div class="callout breed">🐕 ${esc(e.r)}</div>` : ''}
      <button class="btn soft" style="width:100%;margin-top:10px" data-act="startTrainer" data-id="${e.id}">▶ Mit Zähler trainieren</button>`;
  } else {
    h += `<p class="goal">${esc(it.t)}</p>`;
    if (it.type === 'ch' && it.ch.c === 'gassi' && !WALK) h += `<button class="btn soft" style="width:100%" data-act="walkStart">🦮 Gassi starten</button>`;
  }
  h += `<div class="mcom"><label>Wie lief es? (optional)</label>
      <div class="chiprow">${MOODS.map((m, i) => `<button class="chip mood ${M.mood === i + 1 ? 'on' : ''}" data-act="modeMood" data-v="${i + 1}">${m}</button>`).join('')}</div>
      <div class="chiprow wrap tagrow">${H.tags.map(tg => `<button class="chip sm ${M.tags.includes(tg) ? 'on' : ''}" data-act="modeTag" data-v="${esc(tg)}">${esc(tg)}</button>`).join('')}</div>
      <textarea rows="2" data-mode="text" placeholder="Kommentar – landet in deiner Auswertung">${esc(M.text)}</textarea></div>
    </div><div class="mbtns"><button class="btn plain" data-act="modeSkip">Später</button><button class="btn primary" data-act="modeDone">✓ Erledigt</button></div></div>`;
  return h;
}
function openMode(filter) {
  M = { filter: filter || 'alle', skip: new Set(), mood: 0, tags: [], text: '' };
  openSheet({ title: 'Übungsmodus', cls: 'tall', body: modeBody(), onClose: () => { M = null; render(); } });
}
function refreshMode() {
  if (!M) return;
  const sh = sheetStack.find(e => $('.mode', e.sh)); if (!sh) return;
  const b = $('.sheet-body', sh.sh); b.innerHTML = modeBody(); b.scrollTop = 0;
}
function modeDone() {
  const it = modeQueue().open[0]; if (!it) return;
  const text = M.text.trim();
  if (text || M.mood || M.tags.length) addComment({ t: it.type, id: it.id }, text, M.mood, M.tags);
  M.mood = 0; M.tags = []; M.text = '';
  togglePlan(it.key, true);
  refreshMode();
}

/* ── Kommentare ── */
const MOODS = ['😣', '😕', '😐', '🙂', '😄'];
function addComment(ref, text, mood, tags, ts) {
  const c = { id: uid(), ts: ts || Date.now(), day: tkey(ts || Date.now()), ref, text: text || '', mood: mood || 0, tags: tags || [] };
  if (me()) c.by = me();
  S.comments.push(c); save();
  return c;
}
function refTitle(ref) {
  if (!ref) return 'Kommentar';
  if (ref.t === 'day') return 'Tag: ' + dayLabel(ref.id);
  if (ref.t === 'ex') return EX[ref.id] ? CAT[EX[ref.id].c].e + ' ' + EX[ref.id].n : 'Übung';
  if (ref.t === 'ch') { const c = H.challenges.find(x => x.id === ref.id); return '⚡ ' + (c ? c.n : 'Challenge'); }
  if (ref.t === 'r') { const r = H.routines.find(x => x.id === ref.id); return r ? r.e + ' ' + r.n : 'Routine'; }
  return 'Allgemein';
}
function comRow(c, withRef) {
  return `<button class="comrow" data-act="comEdit" data-id="${c.id}"><span class="cm">${c.mood ? MOODS[c.mood - 1] : '💬'}</span><span class="ct">${withRef ? `<small class="cref">${esc(refTitle(c.ref))}</small>` : ''}${c.text ? `<span>${esc(c.text)}</span>` : ''}${c.tags && c.tags.length ? `<span class="ctags">${c.tags.map(t => `<i>${esc(t)}</i>`).join('')}</span>` : ''}<small>${esc(dayLabel(c.day))}, ${hm(c.ts)}${c.by ? ' · ' + esc(c.by) : ''}</small></span></button>`;
}
function commentSheet(ref, edit) {
  const c = edit || { mood: 0, tags: [], text: '' };
  const prev = commentsOf(ref.t, ref.id).filter(x => !edit || x.id !== edit.id).slice(0, 15);
  openSheet({ title: edit ? 'Kommentar bearbeiten' : 'Kommentar', body: `<form data-form="comment" data-id="${edit ? edit.id : ''}" data-t="${esc(ref.t)}" data-ref="${esc(ref.id)}" class="stack">
    <p class="small muted cfor">${esc(refTitle(ref))}</p>
    <div class="field"><label>Wie lief es?</label><div class="chiprow">${MOODS.map((m, i) => `<label class="chip rad mood"><input type="radio" name="mood" value="${i + 1}" ${c.mood === i + 1 ? 'checked' : ''}><span>${m}</span></label>`).join('')}</div></div>
    <div class="field"><label>Schlagworte</label><div class="chiprow wrap">${H.tags.map(t => `<label class="chip rad sm"><input type="checkbox" name="tags" value="${esc(t)}" ${c.tags && c.tags.includes(t) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div></div>
    <div class="field"><label>Kommentar</label><textarea name="text" rows="4" placeholder="Was ist passiert? Was hat geholfen? Was willst du ändern?">${esc(c.text)}</textarea></div>
    <button class="btn primary">Speichern</button>
    ${edit ? `<button type="button" class="btn danger" data-act="comDel" data-id="${edit.id}">Kommentar löschen</button>` : ''}
    ${prev.length ? `<div class="section-t">Frühere Kommentare</div><div class="card list">${prev.map(x => comRow(x)).join('')}</div>` : ''}</form>` });
}

/* ── Auswertung ── */
const STOP = new Set('und oder aber der die das den dem des ein eine einen einem einer eines nicht ist war waren hat hatte haben mit auf bei beim sich sie er es ich wir ihr ihm ihn zu zum zur im in an am als auch noch sehr dann wenn wie was so nur schon mal heute gut gar kein keine keinen mehr weil dass da hier vom von für nach vor über unter aus um bis durch ohne gegen wieder immer etwas viel wurde wird sind kann konnte ganz bisschen gleich doch jetzt erst mich mir uns euch dich dir man hund bruno lief geht ging gehen'.split(' '));
function reviewData(days) {
  const now = new Date(), endK = todayKey(), startK = dkey(addDays(now, -(days - 1))), pStartK = dkey(addDays(now, -(2 * days - 1)));
  const inP = k => k >= startK && k <= endK, inPrev = k => k >= pStartK && k < startK;
  const R = { days, startK };
  const sess = S.sessions.filter(s => inP(tkey(s.ts))), sessP = S.sessions.filter(s => inPrev(tkey(s.ts)));
  const walks = S.walks.filter(w => inP(tkey(w.s))), walksP = S.walks.filter(w => inPrev(tkey(w.s)));
  const coms = S.comments.filter(c => inP(c.day)).sort((a, b) => b.ts - a.ts), comsP = S.comments.filter(c => inPrev(c.day));
  const rate = l => { const r = l.reduce((a, s) => a + (s.reps || 0), 0); return r ? l.reduce((a, s) => a + (s.ok || 0), 0) / r : null; };
  const wsum = (l, k) => l.reduce((a, w) => a + cnt(w, k), 0);
  const q = (o, n) => o + n ? o / (o + n) : null;
  R.active = [...C().act].filter(inP).length;
  R.sess = sess.length; R.sessP = sessP.length; R.min = sess.reduce((a, s) => a + (s.dur || 0), 0); R.rate = rate(sess); R.rateP = rate(sessP);
  R.walks = walks.length; R.walksP = walksP.length;
  R.rk = q(wsum(walks, 'rk_ok'), wsum(walks, 'rk_no')); R.rkP = q(wsum(walksP, 'rk_ok'), wsum(walksP, 'rk_no'));
  R.wild = q(wsum(walks, 'wild_ok'), wsum(walks, 'wild_no')); R.enc = q(wsum(walks, 'enc_ok'), wsum(walks, 'enc_no'));
  const ls = walks.filter(w => w.leash), lsP = walksP.filter(w => w.leash);
  R.leash = ls.length ? ls.reduce((a, w) => a + w.leash, 0) / ls.length : null; R.leashP = lsP.length ? lsP.reduce((a, w) => a + w.leash, 0) / lsP.length : null;
  R.inc = S.incidents.filter(i => inP(tkey(i.ts)) && i.type !== 'gut').length; R.incP = S.incidents.filter(i => inPrev(tkey(i.ts)) && i.type !== 'gut').length;
  R.good = S.incidents.filter(i => inP(tkey(i.ts)) && i.type === 'gut').length;
  // Routinen je Tageszeit (geplant = aktive Routinen; erledigt = Häkchen)
  R.slots = H.slots.map(sl => ({ ...sl, plan: 0, done: 0 }));
  let chDone = 0;
  for (let i = 0; i < days; i++) {
    const k = dkey(addDays(now, -i)), wd = fromKey(k).getDay(), c = chk(k);
    if (k < (firstActive() || endK)) continue;
    R.slots.forEach(x => { H.routines.filter(r => r.s === x.id && routineOn(r, wd)).forEach(r => { x.plan++; if (c['r:' + r.id]) x.done++; }); });
    chDone += Object.keys(c).filter(x => x.startsWith('ch:')).length;
  }
  R.chDone = chDone;
  // Bereiche & Übungen
  const byCat = {};
  sess.forEach(s => { const e = EX[s.ex]; if (!e) return; const b = byCat[e.c] = byCat[e.c] || { n: 0, ok: 0, reps: 0 }; b.n++; b.ok += s.ok || 0; b.reps += s.reps || 0; });
  R.cats = Object.entries(byCat).sort((a, b) => b[1].n - a[1].n);
  const byEx = {};
  sess.filter(s => s.reps).forEach(s => (byEx[s.ex] = byEx[s.ex] || []).push(s));
  R.better = []; R.hard = [];
  for (const [id, l] of Object.entries(byEx)) {
    if (!EX[id]) continue;
    l.sort((a, b) => a.ts - b.ts);
    const avg = rate(l);
    if (l.length >= 2) { const h1 = rate(l.slice(0, Math.floor(l.length / 2))), h2 = rate(l.slice(Math.floor(l.length / 2))); if (h1 != null && h2 != null && h2 - h1 >= 0.1) R.better.push({ id, from: h1, to: h2 }); }
    if (avg != null && avg < 0.5 && l.length >= 2) R.hard.push({ id, avg });
  }
  R.better.sort((a, b) => (b.to - b.from) - (a.to - a.from));
  // Kommentare
  R.coms = coms; R.comsP = comsP.length;
  const moods = coms.filter(c => c.mood).map(c => c.mood).concat(walks.filter(w => w.mood).map(w => w.mood));
  const moodsP = comsP.filter(c => c.mood).map(c => c.mood).concat(walksP.filter(w => w.mood).map(w => w.mood));
  R.mood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null; R.moodP = moodsP.length ? moodsP.reduce((a, b) => a + b, 0) / moodsP.length : null;
  const weeks = Math.max(1, Math.ceil(days / 7)); R.moodW = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const a = dkey(addDays(now, -(w * 7 + 6))), b = dkey(addDays(now, -w * 7));
    const m = coms.filter(c => c.mood && c.day >= a && c.day <= b).map(c => c.mood);
    R.moodW.push({ l: fmtDate(fromKey(a)).replace(/\.\s.*$/, '.'), v: m.length ? m.reduce((x, y) => x + y, 0) / m.length : 0 });
  }
  const tags = {}; coms.forEach(c => (c.tags || []).forEach(t => { tags[t] = (tags[t] || 0) + 1; }));
  R.tags = Object.entries(tags).sort((a, b) => b[1] - a[1]);
  const words = {};
  coms.concat(sess.filter(s => s.note).map(s => ({ text: s.note }))).forEach(c => String(c.text || '').toLowerCase().split(/[^a-zäöüß]+/).forEach(w => { if (w.length > 3 && !STOP.has(w)) words[w] = (words[w] || 0) + 1; }));
  R.words = Object.entries(words).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 12);
  // Erkenntnisse
  const I = [], pc = x => Math.round(x * 100) + ' %';
  const sl = R.slots.filter(x => x.plan);
  if (sl.length) {
    const best = [...sl].sort((a, b) => b.done / b.plan - a.done / a.plan)[0], worst = [...sl].sort((a, b) => a.done / a.plan - b.done / b.plan)[0];
    if (best && best.done / best.plan >= 0.5) I.push(`✅ Am verlässlichsten klappen die Routinen „${best.n}“ (${pc(best.done / best.plan)}).`);
    if (worst && worst !== best && worst.done / worst.plan < 0.6) I.push(`🎯 Ausbaufähig: „${worst.n}“ mit ${pc(worst.done / worst.plan)} – vielleicht weniger, dafür feste Routinen wählen (Mehr → Routinen anpassen).`);
  }
  if (R.rate != null && R.rateP != null) I.push(R.rate >= R.rateP ? `📈 Die Erfolgsquote im Training stieg von ${pc(R.rateP)} auf ${pc(R.rate)}.` : `📉 Die Erfolgsquote im Training sank von ${pc(R.rateP)} auf ${pc(R.rate)} – Stufen evtl. zu schnell gesteigert?`);
  if (R.rk != null && R.rkP != null) I.push(`📣 Rückrufquote draußen: ${pc(R.rkP)} → ${pc(R.rk)}.`);
  else if (R.rk != null) I.push(`📣 Rückrufquote draußen: ${pc(R.rk)}.`);
  if (R.better.length) I.push(`🚀 Größter Fortschritt: ${R.better.slice(0, 2).map(b => `${EX[b.id].n} (${pc(b.from)} → ${pc(b.to)})`).join(', ')}.`);
  if (R.hard.length) I.push(`🪜 Noch schwierig: ${R.hard.slice(0, 2).map(b => `${EX[b.id].n} (Ø ${pc(b.avg)})`).join(', ')} – eine Stufe zurück und Belohnung erhöhen.`);
  const prog = new Set(H.ex.filter(e => sk(e.id).status === 'arbeit').map(e => e.c)), neg = [...prog].filter(c => !byCat[c]);
  if (neg.length) I.push(`💤 In Arbeit, aber nicht geübt: ${neg.map(c => CAT[c].n).join(', ')}.`);
  if (R.inc > R.incP && R.inc >= 3) I.push(`⚠️ Mehr schwierige Situationen als im Zeitraum davor (${R.incP} → ${R.inc}) – Stress, Schlaf und Management prüfen.`);
  else if (R.incP > R.inc) I.push(`👍 Weniger schwierige Situationen als davor (${R.incP} → ${R.inc}).`);
  if (R.tags.length) I.push(`🏷️ Häufigstes Schlagwort in deinen Kommentaren: „${R.tags[0][0]}“ (${R.tags[0][1]}×).`);
  if (R.mood != null && R.moodP != null && Math.abs(R.mood - R.moodP) >= 0.3) I.push(R.mood > R.moodP ? `😊 Die Stimmung in deinen Kommentaren wurde besser (${num(R.moodP)} → ${num(R.mood)} von 5).` : `😕 Die Stimmung in deinen Kommentaren sank (${num(R.moodP)} → ${num(R.mood)} von 5). Rückschritte sind normal – kleinere Schritte helfen.`);
  if (!coms.length) I.push('💬 Noch keine Kommentare in diesem Zeitraum. Ein Satz pro Tag reicht – nach einem Monat siehst du hier Muster.');
  R.insights = I;
  return R;
}
function viewReview() {
  const days = S.ui.rev || 30, R = reviewData(days), pc = x => x == null ? '–' : Math.round(x * 100) + ' %';
  const tr = (a, b, hi = true) => a == null || b == null || a === b ? '' : `<i class="${(a > b) === hi ? 'up' : 'dn'}">${a > b ? '▲' : '▼'}</i>`;
  let h = `<div class="seg">${[[7, '7 Tage'], [30, '30 Tage'], [90, '90 Tage'], [365, '1 Jahr']].map(([v, n]) => `<button class="${days === v ? 'on' : ''}" data-act="revDays" data-v="${v}">${n}</button>`).join('')}</div>
    <p class="small muted intro">Zeitraum: ab ${fmtDate(fromKey(R.startK))} – die Pfeile vergleichen mit den ${days} Tagen davor.</p>`;
  h += `<div class="section-t">Erkenntnisse</div><div class="card pad"><ul class="rtips ins">${R.insights.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  h += `<div class="stats">
    <div class="card st"><small>Aktive Tage</small><b>${R.active}</b><span>von ${days}</span></div>
    <div class="card st"><small>Einheiten</small><b>${R.sess} ${tr(R.sess, R.sessP)}</b><span>${fmtDur(R.min)}</span></div>
    <div class="card st"><small>Erfolgsquote</small><b>${pc(R.rate)} ${tr(R.rate, R.rateP)}</b><span>vorher ${pc(R.rateP)}</span></div>
    <div class="card st"><small>Rückruf draußen</small><b>${pc(R.rk)} ${tr(R.rk, R.rkP)}</b><span>vorher ${pc(R.rkP)}</span></div>
    <div class="card st"><small>Spaziergänge</small><b>${R.walks} ${tr(R.walks, R.walksP)}</b><span>Ø Leine ${R.leash != null ? num(R.leash) + ' ★' : '–'}</span></div>
    <div class="card st"><small>Challenges</small><b>${R.chDone}</b><span>erledigt</span></div>
    <div class="card st"><small>Schwierige Momente</small><b>${R.inc} ${tr(R.inc, R.incP, false)}</b><span>${R.good} Erfolgsmomente</span></div>
    <div class="card st"><small>Stimmung</small><b>${R.mood != null ? MOODS[Math.round(R.mood) - 1] + ' ' + num(R.mood) : '–'}</b><span>${R.coms.length} Kommentare</span></div></div>`;
  const sl = R.slots.filter(x => x.plan);
  if (sl.length) h += `<div class="section-t">Routinen je Tageszeit</div><div class="card pad">${sl.map(x => `<div class="hbar"><span>${x.e} ${esc(x.n)}</span><i style="width:${x.done / x.plan * 100}%" class="good"></i><b>${Math.round(x.done / x.plan * 100)}%</b></div>`).join('')}</div>`;
  if (R.moodW.some(w => w.v)) h += `<div class="section-t">Stimmung pro Woche</div><div class="card chart">${chartBars(R.moodW.map(w => Math.round(w.v * 10) / 10), R.moodW.map(w => w.l), { fmt: v => v + ' / 5', h: 70 })}</div>`;
  if (R.cats.length) h += `<div class="section-t">Training nach Bereich</div><div class="card list">${R.cats.map(([c, b]) => `<button class="cprow" data-act="goCat" data-id="${c}"><span>${CAT[c].e}</span><span class="cpm"><b>${esc(CAT[c].n)}</b>${bar(b.reps ? b.ok / b.reps : 0)}</span><span class="cpv">${b.n}× ${b.reps ? Math.round(b.ok / b.reps * 100) + '%' : ''}</span></button>`).join('')}</div>`;
  if (R.tags.length || R.words.length) h += `<div class="section-t">Schlagworte & häufige Begriffe</div><div class="card pad"><div class="tags cloud">${R.tags.map(([t, n]) => `<span class="tg">🏷️ ${esc(t)} <b>${n}</b></span>`).join('')}${R.words.map(([w, n]) => `<span>${esc(w)} <b>${n}</b></span>`).join('')}</div></div>`;
  h += `<div class="section-t">Alle Kommentare <span class="cnt">${R.coms.length}</span></div>`;
  h += R.coms.length ? `<div class="card list">${R.coms.slice(0, 300).map(c => comRow(c, true)).join('')}</div>` : `<div class="empty"><div class="big">💬</div><b>Noch keine Kommentare</b>Kommentiere Aufgaben im Tagesplan, im Übungsmodus oder bei Übungen.</div>`;
  h += `<div class="section-t">Export</div><div class="stack"><button class="btn soft" data-act="revShare">📄 Bericht als Text teilen</button><button class="btn soft" data-act="revCsv">📊 Alle Daten als CSV (Tabelle)</button></div>
    <p class="small muted" style="margin:10px 4px 0">Der Text-Bericht eignet sich, um ihn deiner Hundetrainerin oder deinem Hundetrainer zu schicken.</p>`;
  return h;
}
function reviewText(days) {
  const R = reviewData(days), pc = x => x == null ? '–' : Math.round(x * 100) + ' %';
  const L = [`Hunde-Coach – Auswertung ${S.dog.name || ''}`.trim(), `Zeitraum: ${fmtDate(fromKey(R.startK))} bis heute (${days} Tage)`, '',
    'KENNZAHLEN', `Aktive Tage: ${R.active}/${days}`, `Trainingseinheiten: ${R.sess} (${fmtDur(R.min)}), Erfolgsquote ${pc(R.rate)} (davor ${pc(R.rateP)})`,
    `Spaziergänge: ${R.walks}, Rückrufquote ${pc(R.rk)} (davor ${pc(R.rkP)}), Ø Leine ${R.leash != null ? num(R.leash) : '–'}/5`,
    `Schwierige Situationen: ${R.inc} (davor ${R.incP}), Erfolgsmomente: ${R.good}`, `Stimmung Ø: ${R.mood != null ? num(R.mood) + '/5' : '–'}`, '',
    'ROUTINEN', ...R.slots.filter(x => x.plan).map(x => `${x.n}: ${Math.round(x.done / x.plan * 100)} %`), '',
    'ERKENNTNISSE', ...R.insights.map(x => '- ' + x), '',
    'TRAINING NACH BEREICH', ...R.cats.map(([c, b]) => `${CAT[c].n}: ${b.n} Einheiten${b.reps ? ', ' + Math.round(b.ok / b.reps * 100) + ' % Erfolg' : ''}`), '',
    `KOMMENTARE (${R.coms.length})`, ...R.coms.slice().reverse().map(c => `${dayLabel(c.day)} ${hm(c.ts)} | ${refTitle(c.ref)}${c.mood ? ' | ' + MOODS[c.mood - 1] : ''}${c.tags && c.tags.length ? ' | ' + c.tags.join(', ') : ''}${c.by ? ' | ' + c.by : ''}${c.text ? '\n  ' + c.text : ''}`)];
  return L.join('\n');
}
function exportCsv() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`, d = ts => { const x = new Date(ts); return `${pad(x.getDate())}.${pad(x.getMonth() + 1)}.${x.getFullYear()}`; };
  const rows = [['Art', 'Datum', 'Uhrzeit', 'Bezug', 'Stimmung (1-5)', 'Schlagworte', 'Wert', 'Erfolg', 'Text', 'Person']];
  for (const c of [...S.comments].sort((a, b) => a.ts - b.ts)) rows.push(['Kommentar', d(c.ts), hm(c.ts), refTitle(c.ref), c.mood || '', (c.tags || []).join(', '), '', '', c.text, c.by || '']);
  for (const s of [...S.sessions].sort((a, b) => a.ts - b.ts)) rows.push(['Einheit', d(s.ts), hm(s.ts), EX[s.ex] ? EX[s.ex].n : s.ex, '', '', 'Stufe ' + ((s.stage || 0) + 1) + (s.val ? ' / ' + s.val : ''), s.reps ? `${s.ok}/${s.reps}` : '', s.note || '', s.by || '']);
  for (const w of [...S.walks].sort((a, b) => a.s - b.s)) rows.push(['Gassi', d(w.s), hm(w.s), w.place || '', w.mood || '', '', Math.round(walkDur(w) / MIN) + ' min', `Rückruf ${cnt(w, 'rk_ok')}/${cnt(w, 'rk_ok') + cnt(w, 'rk_no')}`, w.note || '', w.by || '']);
  for (const i of [...S.incidents].sort((a, b) => a.ts - b.ts)) { const ty = H.incTypes.find(x => x.id === i.type); rows.push(['Verhalten', d(i.ts), hm(i.ts), ty ? ty.n : i.type, '', '', i.dist ? i.dist + ' m' : '', i.int ? i.int + '/5' : '', [i.trig, i.note].filter(Boolean).join(' – '), i.by || '']); }
  for (const [k, c] of Object.entries(S.checks).sort()) for (const [key, v] of Object.entries(c)) {
    const [t, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    rows.push(['Erledigt', d(fromKey(k).getTime()), v.t ? hm(v.t) : '', refTitle({ t, id }), '', '', '', '', '', v.by || '']);
  }
  const csv = '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n');
  shareFile(csv, `hunde-coach-daten-${todayKey()}.csv`, 'text/csv');
}
function shareFile(data, name, type) {
  const blob = new Blob([data], { type });
  const file = typeof File === 'function' ? new File([blob], name, { type }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function quizOfDay() {
  const t = todayKey(), open = H.quiz.filter(q => !S.quiz[q.id]);
  const answeredToday = H.quiz.find(q => S.quiz[q.id] && tkey(S.quiz[q.id].ts) === t);
  const q = answeredToday || (open.length ? open[hash(t + 'q') % open.length] : null);
  if (!q) return `<div class="section-t">Frage des Tages</div><div class="card pad small muted">🎓 Alle ${H.quiz.length} Fragen beantwortet! Im Wissensteil kannst du das Quiz wiederholen.</div>`;
  const a = S.quiz[q.id];
  const order = shuffled(q.o.map((o, i) => i), hash(q.id));
  return `<div class="section-t">Frage des Tages <span class="cnt">+10 XP</span></div><div class="card quiz">
    <b>${esc(q.q)}</b><div class="qopts">${order.map(i => `<button class="qo ${a ? (i === q.a ? 'right' : (a.a === i ? 'wrong' : '')) : ''}" ${a ? 'disabled' : ''} data-act="dailyAns" data-q="${q.id}" data-i="${i}">${esc(q.o[i])}</button>`).join('')}</div>
    ${a ? `<p class="qx">${a.ok ? '✅ Richtig! ' : '❌ Leider falsch. '}${esc(q.x)}</p>` : ''}</div>`;
}

/* ── TRAINING ── */
function viewTraining() {
  const seg = S.ui.tseg || 'cats';
  let h = `<div class="search"><input type="search" placeholder="Übung suchen … (z. B. Rückruf, Krallen)" data-search="ex" value="${esc(nav.q)}" autocomplete="off"></div>
    <div id="searchRes"></div>
    <div id="segWrap"><div class="seg wide">${[['cats', 'Bereiche'], ['path', 'Lernpfad'], ['fav', 'Merkliste'], ['log', 'Verlauf']].map(([k, n]) => `<button class="${seg === k ? 'on' : ''}" data-act="tseg" data-seg="${k}">${n}</button>`).join('')}</div>`;
  if (seg === 'cats') {
    h += `<div class="cats">${H.cats.map(c => {
      const l = catEx(c.id), p = catProg(c.id), w = l.filter(e => sk(e.id).status === 'arbeit').length, ok = l.filter(isDone).length;
      return `<button class="card cat" data-act="openCat" data-id="${c.id}"><span class="ce">${c.e}</span><b>${esc(c.n)}</b><small>${ok}/${l.length} sitzen${w ? ` · ${w} in Arbeit` : ''}</small>${bar(p)}</button>`;
    }).join('')}</div>`;
  } else if (seg === 'path') {
    const cur = currentPhase();
    h += `<p class="small muted intro">Empfohlene Reihenfolge für einen 1,5-jährigen Dackel-Bracke-Mix. Eine Phase gilt als geschafft, wenn 70 % ihrer Übungen „sitzen“. Du kannst jederzeit auch andere Übungen machen.</p>`;
    H.path.forEach((ph, i) => {
      if (ph.fam && !famOn(ph.fam)) return;
      const list = ph.ex.map(id => EX[id]).filter(Boolean), ok = list.filter(isDone).length;
      const state = ph.fam ? (ok / list.length >= 0.7 ? 'done' : 'cur') : cur === -1 || i < cur ? 'done' : i === cur ? 'cur' : 'next';
      h += `<div class="card phase ${state}"><div class="ph-h"><span class="ph-n">${state === 'done' ? '✓' : i + 1}</span><div><b>${esc(ph.n)}</b><small>${esc(ph.w)} · ${ok}/${list.length} sitzen</small></div></div>
        <p class="small muted">${esc(ph.d)}</p>${bar(list.reduce((a, e) => a + exProg(e), 0) / list.length)}
        <div class="list">${list.map(e => exRow(e)).join('')}</div></div>`;
    });
  } else if (seg === 'fav') {
    const fav = H.ex.filter(e => sk(e.id).fav);
    const prog = H.ex.filter(e => sk(e.id).status === 'arbeit' && !sk(e.id).fav);
    h += fav.length ? `<div class="section-t">Gemerkt</div><div class="card list">${fav.map(e => exRow(e)).join('')}</div>` : `<div class="empty"><div class="big">⭐</div><b>Noch nichts gemerkt</b>Tippe in einer Übung auf den Stern, um sie hier zu sammeln.</div>`;
    if (prog.length) h += `<div class="section-t">In Arbeit</div><div class="card list">${prog.map(e => exRow(e)).join('')}</div>`;
  } else {
    h += viewLog();
  }
  return h + '</div>';
}
function searchEx(q) {
  q = q.trim().toLowerCase(); if (q.length < 2) return '';
  const hits = H.ex.filter(e => (e.n + ' ' + e.g + ' ' + CAT[e.c].n + ' ' + e.s.join(' ')).toLowerCase().includes(q))
    .sort((a, b) => (b.n.toLowerCase().includes(q) - a.n.toLowerCase().includes(q)));
  return hits.length ? `<div class="card list">${hits.slice(0, 30).map(e => exRow(e)).join('')}</div>` : `<div class="empty small">Keine Übung gefunden.</div>`;
}
function viewLog() {
  const list = [...S.sessions].sort((a, b) => b.ts - a.ts).slice(0, 150);
  if (!list.length) return `<div class="empty"><div class="big">📒</div><b>Noch keine Einheiten</b>Starte eine Übung mit ▶ oder trage eine Einheit nach.</div>`;
  let h = '', day = '';
  for (const s of list) {
    const k = tkey(s.ts), e = EX[s.ex];
    if (k !== day) { if (day) h += '</div>'; day = k; const n = list.filter(x => tkey(x.ts) === k); h += `<div class="section-t">${esc(dayLabel(k))} <span class="cnt">${n.length} · ${fmtDur(n.reduce((a, x) => a + (x.dur || 0), 0))}</span></div><div class="card list">`; }
    h += `<button class="lrow" data-act="sessEdit" data-id="${s.id}"><span class="lt">${hm(s.ts)}</span><span class="lm"><b>${esc(e ? e.n : s.ex)}</b><small>${e ? CAT[e.c].e + ' Stufe ' + ((s.stage || 0) + 1) : ''}${s.val ? ` · ${esc(fmtVal(s.val))} ${e && e.mt ? esc(e.mt[1]) : ''}` : ''}${s.note ? ' · ' + esc(s.note) : ''}</small></span><span class="lr">${s.reps ? `<b class="${s.ok / s.reps >= 0.8 ? 'good' : s.ok / s.reps < 0.5 ? 'bad' : ''}">${pct(s.ok, s.reps)} %</b><small>${s.ok}/${s.reps}</small>` : '<small>–</small>'}</span></button>`;
  }
  return h + '</div>';
}
function viewCat(c) {
  const l = catEx(c.id);
  let h = `<div class="card pad catintro"><span class="ce">${c.e}</span><p>${esc(c.d)}</p>${bar(catProg(c.id))}</div>`;
  if (c.id === 'jagd' || c.id === 'rueckruf') h += `<div class="callout breed">🐕 Für deinen Dackel-Bracke-Mix ist dieser Bereich besonders wichtig. Arbeite immer mit Schleppleine am Geschirr, bis das Training sicher trägt.</div>`;
  if (c.id === 'sozial' && S.trig.length) h += `<div class="callout">📏 Deine Wohlfühlabstände: ${S.trig.map(t => esc(t.n) + ' ' + esc(t.d) + ' m').join(' · ')}</div>`;
  for (const lv of [1, 2, 3]) {
    const g = l.filter(e => e.l === lv); if (!g.length) continue;
    h += `<div class="section-t">${['', 'Basis', 'Aufbau', 'Profi'][lv]}</div><div class="card list">${g.map(e => exRow(e)).join('')}</div>`;
  }
  const art = { leine: 'w-ausruestung', rueckruf: 'w-jagd', jagd: 'w-jagd', sozial: 'w-emotion', ruhe: 'w-beduerfnisse', handling: 'w-pflege', problem: 'w-strafe', mensch: 'w-planung', allein: 'w-stress', nase: 'w-rasse', grundlagen: 'w-marker', impuls: 'w-stress', umwelt: 'w-emotion', spiel: 'w-spiel' }[c.id];
  if (art && ART[art]) h += `<div class="section-t">Hintergrund</div><div class="card list"><button class="arow" data-act="art" data-id="${art}"><span>${ART[art].e}</span><span><b>${esc(ART[art].n)}</b><small>${esc(ART[art].sum)}</small></span><span class="chev">›</span></button></div>`;
  return h;
}

/* ── ÜBUNG ── */
function viewEx(e) {
  const k = sk(e.id), ss = sessOf(e.id), adv = stageAdvice(e.id);
  const tot = ss.reduce((a, s) => a + (s.dur || 0), 0);
  let h = `<div class="card pad exhead">
    <div class="exmeta">${lvlDots(e.l)} <span>${['', 'Basis', 'Aufbau', 'Profi'][e.l]}</span><span>⏱ ${esc(e.d)}</span>${e.w && !/Gassi/.test(e.d) ? '<span>🦮 Gassi</span>' : ''}<button class="fav ${k.fav ? 'on' : ''}" data-act="exFav" aria-label="Merken">${ICON.star}</button></div>
    <p class="goal">${esc(e.g)}</p>
    <div class="seg st4">${Object.entries(STATUS).map(([v, n]) => `<button class="${k.status === v ? 'on' : ''}" data-act="exStatus" data-v="${v}">${n}</button>`).join('')}</div>
    <div class="exbtns"><button class="btn primary" data-act="startTrainer" data-id="${e.id}">▶ Training starten</button><button class="btn soft" data-act="startTrainer" data-id="${e.id}" data-manual="1">Nachtragen</button></div></div>`;
  if (adv === 'up') h += `<div class="card advice up"><span>🚀</span><div><b>Bereit für Stufe ${k.stage + 2}!</b><small>Die letzten zwei Einheiten lagen bei mindestens 80 %.</small></div><button class="btn primary sm" data-act="exStage" data-i="${k.stage + 1}">Hoch</button></div>`;
  if (adv === 'sitzt') h += `<div class="card advice up"><span>✅</span><div><b>Letzte Stufe gemeistert!</b><small>Markiere die Übung als „sitzt“ – und übe sie dann an vielen Orten (Generalisierung).</small></div><button class="btn primary sm" data-act="exStatus" data-v="sitzt">Sitzt</button></div>`;
  if (adv === 'down') h += `<div class="card advice down"><span>🪜</span><div><b>Mach es etwas leichter</b><small>Unter 50 % Erfolg: mehr Abstand, weniger Ablenkung, bessere Belohnung oder eine Stufe zurück.</small></div>${k.stage > 0 ? `<button class="btn soft sm" data-act="exStage" data-i="${k.stage - 1}">Zurück</button>` : ''}</div>`;
  if (e.m && e.m.length) h += `<div class="section-t">Material</div><div class="tags">${e.m.map(x => `<span>${esc(x)}</span>`).join('')}</div>`;
  h += `<div class="section-t">Anleitung</div><div class="card pad steps"><ol>${e.s.map(x => `<li>${inl(x)}</li>`).join('')}</ol></div>`;
  h += `<div class="section-t">Stufen <span class="cnt">antippen zum Wechseln</span></div><div class="card list stages">${e.st.map((x, i) => `<button class="stg ${i === k.stage ? 'cur' : ''} ${i < k.stage || isDone(e) ? 'past' : ''}" data-act="exStage" data-i="${i}"><span class="sn">${i < k.stage || isDone(e) ? '✓' : i + 1}</span><span>${esc(x)}</span></button>`).join('')}</div>
    <p class="small muted crit">🎯 <b>Weiter, wenn:</b> ${esc(e.k)}</p>`;
  if (e.f && e.f.length) h += `<div class="section-t">Häufige Fehler</div><div class="card pad lst bad"><ul>${e.f.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  if (e.t && e.t.length) h += `<div class="section-t">Tipps</div><div class="card pad lst tipl"><ul>${e.t.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  if (e.r) h += `<div class="callout breed">🐕 <b>Dackel × Bracke:</b> ${esc(e.r)}</div>`;
  // Kommentare
  const coms = commentsOf('ex', e.id);
  h += `<div class="section-t">Kommentare <button data-act="comAdd" data-t="ex" data-id="${e.id}">＋ Kommentar</button></div>`;
  h += coms.length ? `<div class="card list">${coms.slice(0, 10).map(c => comRow(c)).join('')}</div>` : `<div class="card pad small muted">Halte fest, was dir auffällt – z. B. „klappt nur ohne andere Hunde“. Kommentare fließen in die Monatsauswertung.</div>`;
  // Verlauf
  h += `<div class="section-t">Verlauf <span class="cnt">${ss.length} Einheiten · ${fmtDur(tot)}</span></div>`;
  if (!ss.length) h += `<div class="card pad small muted">Noch keine Einheit. Starte mit „Training starten“ – zähle dabei jede gelungene und nicht gelungene Wiederholung.</div>`;
  else {
    const last = ss.slice(0, 12).reverse();
    const rated = last.filter(s => s.reps);
    if (rated.length) h += `<div class="card chart"><div class="ch-h"><b>Erfolgsquote</b><span>letzte ${rated.length}</span></div>${chartBars(rated.map(s => pct(s.ok, s.reps)), rated.map(s => { const d = new Date(s.ts); return d.getDate() + '.'; }), { fmt: v => v + ' %', h: 70 })}</div>`;
    if (e.mt) { const mv = last.filter(s => s.val !== '' && s.val != null && !isNaN(+s.val)); if (mv.length) h += `<div class="card chart"><div class="ch-h"><b>${esc(e.mt[0])}</b><span>Bestwert ${num(Math.max(...mv.map(s => +s.val)))} ${esc(e.mt[1])}</span></div>${chartBars(mv.map(s => +s.val), mv.map(s => new Date(s.ts).getDate() + '.'), { fmt: v => v + ' ' + e.mt[1], h: 70 })}</div>`; }
    h += `<div class="card list">${ss.slice(0, 8).map(s => `<button class="lrow" data-act="sessEdit" data-id="${s.id}"><span class="lt">${esc(dayLabel(tkey(s.ts)).replace(/^\w+, /, ''))}<small>${hm(s.ts)}</small></span><span class="lm"><b>Stufe ${(s.stage || 0) + 1}</b><small>${s.dist ? 'Ablenkung ' + s.dist + '/5' : ''}${s.place ? ' · ' + esc(s.place) : ''}${s.val ? ` · ${esc(fmtVal(s.val))} ${e.mt ? esc(e.mt[1]) : ''}` : ''}${s.note ? ' · ' + esc(s.note) : ''}</small></span><span class="lr">${s.reps ? `<b>${pct(s.ok, s.reps)} %</b><small>${s.ok}/${s.reps}</small>` : ''}</span></button>`).join('')}</div>`;
  }
  return h;
}

/* ── TRAINER (Live-Zählung) ── */
let T = null;
const PLACES = ['Zuhause', 'Garten', 'Straße', 'Feld', 'Wald', 'Park', 'Stadt', 'Neu'];
function startTrainer(id, manual) {
  const e = EX[id]; if (!e) return;
  const k = sk(id), last = sessOf(id)[0];
  T = { ex: id, stage: k.stage, ok: 0, no: 0, fails: 0, t0: Date.now(), acc: 0, run: !manual, manual: !!manual, dist: last ? last.dist || 1 : 1, place: last ? last.place || 'Zuhause' : 'Zuhause', val: '', note: '', date: toLocalInput(Date.now()), dmin: 5 };
  openTrainer();
}
function openTrainer() {
  openSheet({
    title: EX[T.ex].n, cls: 'trainer', body: trainerBody(), right: `<button class="lnk r" data-act="trSave">Speichern</button>`,
    onClose: () => { // versehentlich geschlossen? Zähler nicht einfach verlieren
      const keep = T; T = null;
      if (keep && keep.ok + keep.no > 0) toast('Einheit nicht gespeichert', { label: 'Zurück', fn: () => { T = keep; openTrainer(); } });
    },
  });
}
function trainerBody() {
  const e = EX[T.ex];
  return `<div class="tr">
    <div class="tr-stage"><small>Stufe ${T.stage + 1} von ${e.st.length}</small><b data-ref="stgT">${esc(e.st[T.stage])}</b>
      <div class="chiprow">${e.st.map((x, i) => `<button class="chip ${i === T.stage ? 'on' : ''}" data-act="trStage" data-i="${i}">${i + 1}</button>`).join('')}</div></div>
    ${T.manual ? `<div class="field"><label>Zeitpunkt</label><input type="datetime-local" data-tr="date" value="${T.date}"></div>
      <div class="field"><label>Dauer (Minuten)</label><input type="number" inputmode="numeric" min="0" data-tr="dmin" value="${T.dmin}"></div>`
    : `<div class="tr-clock"><b data-clock="tr">${fmtClock(T.acc + (T.run ? Date.now() - T.t0 : 0))}</b><button class="chip" data-act="trPause">${T.run ? '⏸ Pause' : '▶ Weiter'}</button></div>`}
    <div class="tr-cnt"><button class="tbig ok" data-act="trOk"><span>✓</span><b data-ref="ok">${T.ok}</b><small>Gelungen</small></button><button class="tbig no" data-act="trNo"><span>✗</span><b data-ref="no">${T.no}</b><small>Nicht gelungen</small></button></div>
    <div class="tr-sum"><span data-ref="rate">${T.ok + T.no ? pct(T.ok, T.ok + T.no) + ' % Erfolg' : 'Tippe nach jeder Wiederholung'}</span><button class="lnk" data-act="trUndo">Rückgängig</button></div>
    <div class="tr-hint" data-ref="hint">${trHint()}</div>
    <div class="field"><label>Ablenkung</label><div class="chiprow">${[1, 2, 3, 4, 5].map(v => `<button class="chip ${T.dist === v ? 'on' : ''}" data-act="trDist" data-v="${v}">${v}</button>`).join('')}<span class="small muted">&nbsp;1 = keine · 5 = sehr hoch</span></div></div>
    <div class="field"><label>Ort</label><div class="chiprow wrap">${PLACES.map(p => `<button class="chip ${T.place === p ? 'on' : ''}" data-act="trPlace" data-v="${p}">${p}</button>`).join('')}</div></div>
    ${e.mt ? `<div class="field"><label>${esc(e.mt[0])} (${esc(e.mt[1])})</label><input type="number" inputmode="decimal" step="any" data-tr="val" value="${esc(T.val)}" placeholder="z. B. ${e.mt[1] === 'm' ? '20' : e.mt[1] === 's' ? '30' : '10'}"></div>` : ''}
    <div class="field"><label>Notiz</label><input type="text" data-tr="note" value="${esc(T.note)}" placeholder="Was lief gut? Was war schwierig?"></div>
    <details class="tr-help"><summary>Anleitung dieser Stufe</summary><ol>${e.s.map(x => `<li>${inl(x)}</li>`).join('')}</ol><p class="small muted">🎯 ${esc(e.k)}</p></details>
    <button class="btn primary" style="width:100%;margin-top:10px" data-act="trSave">Einheit speichern</button>
  </div>`;
}
function trHint() {
  if (!T) return '';
  const el = T.acc + (T.run ? Date.now() - T.t0 : 0), n = T.ok + T.no;
  if (T.fails >= 3) return '🪜 3× nacheinander nicht geklappt: Mach es leichter (Abstand, Ablenkung, Belohnung) und beende mit einem Erfolg.';
  if (!T.manual && el > 6 * MIN) return '⏱ Schon über 5 Minuten – kurze Einheiten wirken besser. Mit einem Erfolg aufhören und Pause machen.';
  if (n >= 15) return '✋ 15 Wiederholungen – Zeit für eine Pause. Gelerntes festigt sich in der Ruhe.';
  if (n >= 5 && T.ok / n >= 0.8) return '🚀 Läuft super (≥ 80 %)! Bleib noch ein paar Wiederholungen dabei – bei der nächsten Einheit vielleicht Stufe hoch.';
  return '';
}
function refreshTrainer() {
  const sh = topSheet(); if (!sh || !T) return;
  const set = (r, v) => { const el = $(`[data-ref="${r}"]`, sh); if (el) el.textContent = v; };
  set('ok', T.ok); set('no', T.no);
  set('rate', T.ok + T.no ? pct(T.ok, T.ok + T.no) + ' % Erfolg' : 'Tippe nach jeder Wiederholung');
  set('hint', trHint());
}
function rerenderTrainer() { const sh = topSheet(); if (sh && T) { const y = $('.sheet-body', sh).scrollTop; $('.sheet-body', sh).innerHTML = trainerBody(); $('.sheet-body', sh).scrollTop = y; } }
function saveTrainer() {
  if (!T) return;
  const e = EX[T.ex], reps = T.ok + T.no;
  const ts = T.manual ? fromLocalInput(T.date) : T.t0;
  const dur = T.manual ? Math.max(0, +T.dmin || 0) * MIN : T.acc + (T.run ? Date.now() - T.t0 : 0);
  if (!reps && !T.val && !T.note && dur < 20000) { toast('Zähle mindestens eine Wiederholung oder schreib eine Notiz'); return; }
  const s = { id: uid(), ts, ex: T.ex, stage: T.stage, reps, ok: T.ok, dur, dist: T.dist, place: T.place, val: T.val === '' ? '' : T.val, note: T.note.trim() };
  if (me()) s.by = me();
  S.sessions.push(s);
  const k = sk(T.ex);
  setSkill(T.ex, { status: k.status === 'neu' ? 'arbeit' : k.status, stage: T.stage });
  T = null; save(); closeSheet(); render(); refreshMode();
  const adv = stageAdvice(e.id);
  celebrate(`Einheit gespeichert · +${sessXp(s)} XP`);
  if (adv === 'up') setTimeout(() => toast(`🚀 Bereit für Stufe ${sk(e.id).stage + 2}?`, { label: 'Stufe hoch', fn: () => { setSkill(e.id, { stage: sk(e.id).stage + 1 }); save(); render(); celebrate('+15 XP · neue Stufe'); } }), 2600);
  else if (adv === 'down') setTimeout(() => toast('🪜 Tipp: Diese Stufe etwas leichter machen'), 2600);
}

/* ── GASSI ── */
function viewGassi() {
  let h = '';
  const t = todayKey(), done = new Set(Object.keys(chk(t)).filter(x => x.startsWith('ch:')).map(x => x.slice(3)));
  const gch = challengesFor(t).filter(x => x.c === 'gassi');
  if (WALK) {
    h += `<div class="card walk-live"><small>Spaziergang läuft seit ${hm(WALK.s)}</small><b data-clock="walk">${fmtClock(Date.now() - WALK.s)}</b>
      <div class="wl-a"><button class="btn plain sm" data-act="walkDiscard">Verwerfen</button><button class="btn primary" data-act="walkEnd">Beenden & speichern</button></div></div>
      <div class="wgrid">${WCNT.map(c => `<div class="wc ${c.cls || ''}"><button class="wc-b" data-act="walkCnt" data-k="${c.k}"><span>${c.e}</span><b>${cnt(WALK, c.k)}</b><small>${esc(c.n)}</small></button>${cnt(WALK, c.k) ? `<button class="wc-m" data-act="walkDec" data-k="${c.k}" aria-label="Eins weniger">−</button>` : ''}</div>`).join('')}</div>`;
    const rk = cnt(WALK, 'rk_ok') + cnt(WALK, 'rk_no');
    if (rk) h += `<p class="small muted center">Rückrufquote heute: <b>${pct(cnt(WALK, 'rk_ok'), rk)} %</b></p>`;
    const gs = planFor(t).find(x => x.id === 'gassi');
    if (gs && gs.items.length) h += `<div class="section-t">Gassi-Routine <span class="cnt">${gs.items.filter(i => i.done).length}/${gs.items.length}</span></div><div class="card pslot open"><div class="pitems">${gs.items.map(it => itemRow(it, t)).join('')}</div></div>`;
  } else {
    h += `<button class="card walk-start" data-act="walkStart"><span>🦮</span><b>Gassi starten</b><small>Zeit läuft mit, Rückrufe, Check-ins, Begegnungen und Wild per Fingertipp zählen</small></button>`;
  }
  // Gassi-Challenge
  h += `<div class="section-t">Gassi-Challenge heute</div>`;
  for (const x of gch) { const ok = done.has(x.id); h += `<div class="card ch ${ok ? 'done' : ''}"><b>${esc(x.n)}</b><p>${esc(x.t)}</p><div class="ch-a"><button class="btn ${ok ? 'plain' : 'primary'} sm" data-act="chToggle" data-id="${x.id}">${ok ? '✓ Geschafft' : 'Geschafft · +20 XP'}</button></div></div>`; }
  // Übungen fürs Gassi
  const wex = H.ex.filter(e => e.w && sk(e.id).status === 'arbeit');
  const wsug = wex.length ? wex : H.ex.filter(e => e.w && e.l === 1).slice(0, 5);
  h += `<div class="section-t">${wex.length ? 'Deine Gassi-Übungen' : 'Gute Übungen fürs Gassi'}</div><div class="card list">${wsug.slice(0, 8).map(e => `<div class="recrow">${exRow(e)}<button class="play" data-act="startTrainer" data-id="${e.id}" aria-label="Zählen">▶</button></div>`).join('')}</div>`;
  // Statistik
  const since = Date.now() - 30 * DAY, last30 = S.walks.filter(w => w.s >= since);
  const wk = S.walks.filter(w => w.s >= Date.now() - 7 * DAY);
  const rkO = last30.reduce((a, w) => a + cnt(w, 'rk_ok'), 0), rkN = last30.reduce((a, w) => a + cnt(w, 'rk_no'), 0);
  const enO = last30.reduce((a, w) => a + cnt(w, 'enc_ok'), 0), enN = last30.reduce((a, w) => a + cnt(w, 'enc_no'), 0);
  const wiO = last30.reduce((a, w) => a + cnt(w, 'wild_ok'), 0), wiN = last30.reduce((a, w) => a + cnt(w, 'wild_no'), 0);
  const ls = last30.filter(w => w.leash);
  h += `<div class="section-t">Letzte 30 Tage</div><div class="stats">
    <div class="card st"><small>Gassi (7 Tage)</small><b>${wk.length}</b><span>${fmtDur(wk.reduce((a, w) => a + walkDur(w), 0))}</span></div>
    <div class="card st"><small>Rückrufquote</small><b>${rkO + rkN ? pct(rkO, rkO + rkN) + ' %' : '–'}</b><span>${rkO} von ${rkO + rkN}</span></div>
    <div class="card st"><small>Ø Leine</small><b>${ls.length ? num(ls.reduce((a, w) => a + w.leash, 0) / ls.length) + ' / 5' : '–'}</b><span>${ls.length} bewertet</span></div>
    <div class="card st"><small>Begegnungen gut</small><b>${enO + enN ? pct(enO, enO + enN) + ' %' : '–'}</b><span>${enO} von ${enO + enN}</span></div>
    <div class="card st"><small>Wild ansprechbar</small><b>${wiO + wiN ? pct(wiO, wiO + wiN) + ' %' : '–'}</b><span>${wiO} von ${wiO + wiN}</span></div>
    <div class="card st"><small>Check-ins / Gassi</small><b>${last30.length ? num(last30.reduce((a, w) => a + cnt(w, 'ori'), 0) / last30.length) : '–'}</b><span>freiwillige Blicke</span></div></div>`;
  // Protokoll
  h += `<div class="section-t">Spaziergänge <button data-act="walkAdd">＋ Nachtragen</button></div>`;
  const list = [...S.walks].sort((a, b) => b.s - a.s).slice(0, 40);
  if (!list.length) h += `<div class="empty"><div class="big">🌳</div><b>Noch keine Spaziergänge</b>Starte den Gassi-Modus beim nächsten Rausgehen.</div>`;
  else h += `<div class="card list">${list.map(w => `<button class="lrow" data-act="walkEdit" data-id="${w.id}"><span class="lt">${esc(dayLabel(tkey(w.s)).replace(/^\w+, /, ''))}<small>${hm(w.s)}</small></span><span class="lm"><b>${fmtDur(walkDur(w))}${w.place ? ' · ' + esc(w.place) : ''}</b><small>${[cnt(w, 'rk_ok') + cnt(w, 'rk_no') ? `📣 ${cnt(w, 'rk_ok')}/${cnt(w, 'rk_ok') + cnt(w, 'rk_no')}` : '', cnt(w, 'ori') ? `👀 ${cnt(w, 'ori')}` : '', cnt(w, 'enc_ok') + cnt(w, 'enc_no') ? `🐕 ${cnt(w, 'enc_ok')}/${cnt(w, 'enc_ok') + cnt(w, 'enc_no')}` : '', cnt(w, 'wild_ok') + cnt(w, 'wild_no') ? `🦌 ${cnt(w, 'wild_ok')}/${cnt(w, 'wild_ok') + cnt(w, 'wild_no')}` : '', w.note ? esc(w.note) : ''].filter(Boolean).join(' · ') || '–'}</small></span><span class="lr">${w.leash ? `<b class="stars-t">${'★'.repeat(w.leash)}</b><small>Leine</small>` : ''}</span></button>`).join('')}</div>`;
  h += `<div class="section-t">Regeln draußen</div><div class="card list">${['gassi', 'freilauf', 'begegnung'].map(id => { const a = H.dd.find(x => x.id === id); return `<button class="arow" data-act="dd" data-id="${id}"><span>${a.e}</span><span><b>${esc(a.n)}</b><small>Do’s & Don’ts</small></span><span class="chev">›</span></button>`; }).join('')}</div>`;
  return h;
}
function walkForm(w, isNew) {
  const stars = (name, v) => `<div class="stars">${[5, 4, 3, 2, 1].map(i => `<label><input type="radio" name="${name}" value="${i}" ${v === i ? 'checked' : ''}><span>★</span></label>`).join('')}</div>`;
  return `<form data-form="walk" data-id="${w.id || ''}" class="stack">
    ${isNew === 'manual' || !isNew ? `<div class="field"><label>Start</label><input type="datetime-local" name="s" value="${toLocalInput(w.s)}"></div><div class="field"><label>Dauer (Minuten)</label><input type="number" name="dmin" inputmode="numeric" min="1" value="${Math.round(walkDur(w) / MIN) || 30}"></div>` : `<p class="center"><b class="big-t">${fmtDur(walkDur(w))}</b></p>`}
    <div class="field"><label>Lockere Leine – wie lief es?</label>${stars('leash', w.leash || 0)}</div>
    <div class="field"><label>Gesamteindruck</label><div class="chiprow">${['😣', '😕', '😐', '🙂', '😄'].map((m, i) => `<label class="chip rad"><input type="radio" name="mood" value="${i + 1}" ${w.mood === i + 1 ? 'checked' : ''}><span>${m}</span></label>`).join('')}</div></div>
    <div class="field"><label>Gegend</label><div class="chiprow wrap">${['Wohngebiet', 'Feld', 'Wald', 'Park', 'Stadt', 'Hundewiese', 'Neu'].map(p => `<label class="chip rad"><input type="radio" name="place" value="${p}" ${w.place === p ? 'checked' : ''}><span>${p}</span></label>`).join('')}</div></div>
    ${isNew === 'manual' || !isNew ? `<div class="field"><label>Zähler</label><div class="mgrid">${WCNT.map(c => `<label class="mini"><span>${c.e} ${esc(c.n)}</span><input type="number" min="0" inputmode="numeric" name="c_${c.k}" value="${cnt(w, c.k)}"></label>`).join('')}</div></div>` : ''}
    <div class="field"><label>Notiz</label><input type="text" name="note" value="${esc(w.note || '')}" placeholder="Besonderheiten, Wild, Begegnungen …"></div>
    <button class="btn primary">Speichern</button>
    ${!isNew ? `<button type="button" class="btn danger" data-act="walkDel" data-id="${w.id}">Spaziergang löschen</button>` : ''}
  </form>`;
}

/* ── WISSEN ── */
function viewWissen() {
  let h = `<div class="search"><input type="search" placeholder="Wissen durchsuchen … (z. B. Rücken, Zecken, Strafe)" data-search="w" value="${esc(nav.q)}" autocomplete="off"></div><div id="searchRes"></div><div id="segWrap">`;
  const nRead = Object.keys(S.read).filter(id => ART[id]).length, qOk = H.quiz.filter(q => S.quiz[q.id] && S.quiz[q.id].ok).length;
  h += `<div class="wtop"><button class="card wt" data-act="rules"><span>⭐</span><b>Goldene Regeln</b><small>${H.rules.length} Grundsätze, die immer gelten</small></button>
    <button class="card wt" data-act="quizStart"><span>🧠</span><b>Wissens-Quiz</b><small>${qOk}/${H.quiz.length} richtig</small>${bar(qOk / H.quiz.length)}</button></div>`;
  h += `<div class="section-t">Do’s & Don’ts nach Lebensbereich</div><div class="ddgrid">${H.dd.map(a => `<button class="card dd" data-act="dd" data-id="${a.id}"><span>${a.e}</span><b>${esc(a.n)}</b></button>`).join('')}</div>`;
  h += `<div class="section-t">Artikel <span class="cnt">${nRead}/${H.wissen.length} gelesen</span></div>`;
  for (const g of H.wgroups) {
    const list = H.wissen.filter(a => a.g === g.id);
    h += `<div class="wg-t">${g.e} ${esc(g.n)}</div><div class="card list">${list.map(artRow).join('')}</div>`;
  }
  h += `<div class="section-t">Übungen nach Bereich</div><div class="card list">${H.cats.map(c => `<button class="arow" data-act="goCat" data-id="${c.id}"><span>${c.e}</span><span><b>${esc(c.n)}</b><small>${esc(c.d)}</small></span><span class="chev">›</span></button>`).join('')}</div>`;
  h += `<p class="small muted disclaimer">Die Inhalte beruhen auf aktueller Lerntheorie und Verhaltensforschung sowie Empfehlungen von Fachgremien (u. a. StIKo Vet, ESCCAP, Tierschutz-Hundeverordnung). Sie ersetzen keine tierärztliche Untersuchung und bei ernsten Verhaltensproblemen keine persönliche Begleitung durch qualifizierte Trainer oder Verhaltensmediziner.</p>`;
  return h + '</div>';
}
const artRow = a => `<button class="arow" data-act="art" data-id="${a.id}"><span>${a.e}</span><span><b>${esc(a.n)}</b><small>${esc(a.sum)}</small></span><span class="rd">${S.read[a.id] ? '✓' : a.min + ' min'}</span></button>`;
function searchW(q) {
  q = q.trim().toLowerCase(); if (q.length < 2) return '';
  const arts = H.wissen.filter(a => (a.n + ' ' + a.sum + ' ' + a.b.join(' ')).toLowerCase().includes(q));
  const dds = H.dd.filter(a => (a.n + ' ' + a.do.join(' ') + ' ' + a.dont.join(' ')).toLowerCase().includes(q));
  const exs = H.ex.filter(e => (e.n + ' ' + e.g).toLowerCase().includes(q)).slice(0, 8);
  if (!arts.length && !dds.length && !exs.length) return `<div class="empty small">Nichts gefunden.</div>`;
  return (arts.length ? `<div class="section-t">Artikel</div><div class="card list">${arts.map(artRow).join('')}</div>` : '') +
    (dds.length ? `<div class="section-t">Do’s & Don’ts</div><div class="card list">${dds.map(a => `<button class="arow" data-act="dd" data-id="${a.id}"><span>${a.e}</span><span><b>${esc(a.n)}</b></span><span class="chev">›</span></button>`).join('')}</div>` : '') +
    (exs.length ? `<div class="section-t">Übungen</div><div class="card list">${exs.map(e => exRow(e)).join('')}</div>` : '');
}
function openArt(id) {
  const a = ART[id]; if (!a) return;
  openSheet({ title: a.n, cls: 'tall', body: `<div class="art"><p class="art-sum">${esc(a.sum)}</p>${md(a.b)}
    <div class="art-f">${S.read[id] ? `<p class="center muted">✓ Gelesen</p>` : `<button class="btn primary" style="width:100%" data-act="artRead" data-id="${id}">Gelesen · +10 XP</button>`}</div></div>` });
}
function openDD(id) {
  const a = H.dd.find(x => x.id === id); if (!a) return;
  openSheet({ title: a.e + ' ' + a.n, cls: 'tall', body: `<div class="ddv"><h3 class="good">✓ Do’s</h3><ul class="do">${a.do.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3 class="bad">✗ Don’ts</h3><ul class="dont">${a.dont.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` });
}
let Q = null;
function quizSheet() {
  const q = H.quiz[Q.i], a = Q.ans;
  const order = shuffled(q.o.map((o, i) => i), hash(q.id));
  return `<div class="quiz qs"><small class="muted">Frage ${Q.i + 1} von ${H.quiz.length}${a == null && S.quiz[q.id] && S.quiz[q.id].ok ? ' · schon richtig beantwortet' : ''}</small>${bar((Q.i + 1) / H.quiz.length, 'thin')}
    <b>${esc(q.q)}</b><div class="qopts">${order.map(i => `<button class="qo ${a != null ? (i === q.a ? 'right' : (a === i ? 'wrong' : '')) : ''}" ${a != null ? 'disabled' : ''} data-act="quizAns" data-i="${i}">${esc(q.o[i])}</button>`).join('')}</div>
    ${a != null ? `<p class="qx">${a === q.a ? '✅ Richtig! ' : '❌ Leider falsch. '}${esc(q.x)}</p><button class="btn primary" style="width:100%" data-act="quizNext">${Q.i < H.quiz.length - 1 ? 'Nächste Frage' : 'Fertig'}</button>` : ''}
    <p class="small muted center" style="margin-top:12px">Diese Runde: ${Q.right} richtig von ${Q.n}</p></div>`;
}
function answerQuiz(qid, i) {
  const q = H.quiz.find(x => x.id === qid), ok = i === q.a, prev = S.quiz[qid];
  if (!prev || !prev.ok) S.quiz[qid] = { ok, a: i, ts: Date.now() };
  save(); return ok && !(prev && prev.ok);
}

/* ── ERFOLGE ── */
function viewErfolge() {
  const c = C(), L = c.level, n0 = LVL_NEED(L), n1 = LVL_NEED(L + 1);
  let h = `<div class="card hero lvlcard"><div class="lvl-big"><span>Level</span><b>${L}</b></div><div class="hero-m"><b>${esc(lvlTitle(L))}</b><small>${c.total} XP gesamt · noch ${n1 - c.total} bis Level ${L + 1}</small>${bar((c.total - n0) / (n1 - n0), 'xp')}</div></div>`;
  const names = { train: '🎯 Training', walk: '🦮 Gassi', ch: '⚡ Challenges', basics: '🗓️ Routinen', skill: '📈 Stufen & Status', know: '📖 Wissen & Quiz', diary: '💬 Tagebuch & Kommentare', badge: '🏅 Abzeichen' };
  h += `<details class="card xpd"><summary>Woher kommen deine XP?</summary>${Object.entries(c.xp).map(([k, v]) => `<div class="kv"><span>${names[k]}</span><b>${v}</b></div>`).join('')}
    <p class="small muted">Einheit 10 XP (+1 je Erfolg, max. +15) · Gassi 15 XP (+ Rückrufe, Wild, Check-ins) · Challenge 20 XP (+30 für alle drei) · Routine 3 XP (+10 je komplette Tageszeit) · Kommentar 2 XP (max. 10 pro Tag) · neue Stufe 15 XP · „sitzt“ 40 XP · „generalisiert“ 120 XP · Artikel/Quizfrage 10 XP · Abzeichen 25 XP</p></details>`;
  // Serie + 14 Tage
  const days = [...Array(14)].map((_, i) => addDays(new Date(), i - 13));
  h += `<div class="section-t">Serie</div><div class="card pad streakc"><div class="sc-n"><div><b>🔥 ${c.st.cur}</b><small>aktuell</small></div><div><b>🏆 ${c.st.best}</b><small>Rekord</small></div></div>
    <div class="dots">${days.map(d => { const k = dkey(d); return `<span class="${c.act.has(k) ? 'on' : ''} ${k === todayKey() ? 'tod' : ''}"><i></i><small>${DAYS_S[d.getDay()]}</small></span>`; }).join('')}</div>
    <p class="small muted">Ein Tag zählt, wenn du trainierst, Gassi einträgst, eine Challenge schaffst oder mindestens 3 Basics erfüllst.</p></div>`;
  // Kennzahlen
  const totMin = S.sessions.reduce((a, s) => a + (s.dur || 0), 0);
  h += `<div class="stats">
    <div class="card st"><small>Einheiten</small><b>${S.sessions.length}</b><span>${fmtDur(totMin)} Training</span></div>
    <div class="card st"><small>Spaziergänge</small><b>${S.walks.length}</b><span>${fmtDur(S.walks.reduce((a, w) => a + walkDur(w), 0))}</span></div>
    <div class="card st"><small>Challenges</small><b>${c.st.chTotal}</b><span>${c.st.perfect} perfekte Tage</span></div>
    <div class="card st"><small>Übungen sitzen</small><b>${c.st.sitzt}</b><span>${c.st.gen} generalisiert</span></div>
    <div class="card st"><small>Rückrufe ✓</small><b>${c.st.rkOk}</b><span>draußen gezählt</span></div>
    <div class="card st"><small>Abzeichen</small><b>${c.badges.length}/${BADGES.length}</b><span>gesammelt</span></div></div>`;
  h += `<button class="card due review" data-act="openPage" data-id="review"><span>📊</span><span><b>Auswertung & Kommentare</b><small>7, 30 oder 90 Tage: Fortschritt, Routinen, Stimmung, Erkenntnisse – und Export für deine Trainerin.</small></span></button>`;
  h += weekReview();
  // Diagramme
  const mins = days.map(d => Math.round((c.mins[dkey(d)] || 0) / MIN));
  h += `<div class="section-t">Diagramme</div><div class="charts">
    <div class="card chart"><div class="ch-h"><b>Aktive Minuten</b><span>14 Tage</span></div><div class="ch-v">${mins.reduce((a, b) => a + b, 0)}<small>min</small></div>${chartBars(mins, days.map(d => DAYS_S[d.getDay()][0]), { sel: 13, fmt: v => v + ' min' })}</div>`;
  const weeks = [...Array(8)].map((_, i) => { const end = Date.now() - (7 - i) * 7 * DAY; return { s: end - 7 * DAY, e: end + (i === 7 ? DAY : 0) }; });
  const wkW = weeks.map(w => S.walks.filter(x => x.s >= w.s && x.s < w.e));
  const rk = wkW.map(l => { const o = l.reduce((a, x) => a + cnt(x, 'rk_ok'), 0), n = l.reduce((a, x) => a + cnt(x, 'rk_no'), 0); return o + n ? pct(o, o + n) : 0; });
  const lsh = wkW.map(l => { const r = l.filter(x => x.leash); return r.length ? Math.round(r.reduce((a, x) => a + x.leash, 0) / r.length * 20) : 0; });
  const wl = weeks.map((w, i) => i === 7 ? 'jetzt' : 'KW-' + (7 - i));
  h += `<div class="card chart"><div class="ch-h"><b>Rückrufquote draußen</b><span>8 Wochen</span></div>${chartBars(rk, wl.map((x, i) => i === 7 ? '●' : ''), { sel: 7, fmt: v => v + ' %' })}</div>
    <div class="card chart"><div class="ch-h"><b>Lockere Leine (Ø Sterne)</b><span>8 Wochen</span></div>${chartBars(lsh, wl.map((x, i) => i === 7 ? '●' : ''), { sel: 7, fmt: v => num(v / 20) + ' ★' })}</div></div>`;
  // Bereiche
  h += `<div class="section-t">Fortschritt je Bereich</div><div class="card list">${H.cats.map(ct => `<button class="cprow" data-act="goCat" data-id="${ct.id}"><span>${ct.e}</span><span class="cpm"><b>${esc(ct.n)}</b>${bar(catProg(ct.id))}</span><span class="cpv">${Math.round(catProg(ct.id) * 100)} %</span></button>`).join('')}</div>`;
  // Abzeichen
  const got = new Set(c.badges.map(b => b.id));
  h += `<div class="section-t">Abzeichen <span class="cnt">${got.size}/${BADGES.length}</span></div><div class="badges">${BADGES.map(b => `<div class="badge ${got.has(b.id) ? 'on' : ''}"><span>${b.e}</span><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`).join('')}</div>`;
  return h;
}
function weekReview() {
  const now = Date.now(), a0 = now - 7 * DAY, b0 = now - 14 * DAY;
  const sA = S.sessions.filter(s => s.ts >= a0), sB = S.sessions.filter(s => s.ts >= b0 && s.ts < a0);
  const wA = S.walks.filter(w => w.s >= a0), wB = S.walks.filter(w => w.s >= b0 && w.s < a0);
  const mA = sA.reduce((a, s) => a + (s.dur || 0), 0), mB = sB.reduce((a, s) => a + (s.dur || 0), 0);
  const trend = (x, y) => x > y ? '<i class="up">▲</i>' : x < y ? '<i class="dn">▼</i>' : '<i>＝</i>';
  const byCat = {}; sA.forEach(s => { const e = EX[s.ex]; if (e) byCat[e.c] = (byCat[e.c] || 0) + 1; });
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const prog = new Set(H.ex.filter(e => sk(e.id).status === 'arbeit').map(e => e.c));
  const neglected = [...prog].filter(c => !byCat[c]);
  const incA = S.incidents.filter(i => i.ts >= a0 && i.type !== 'gut').length, incB = S.incidents.filter(i => i.ts >= b0 && i.ts < a0 && i.type !== 'gut').length;
  const good = S.incidents.filter(i => i.ts >= a0 && i.type === 'gut').length;
  let tips = [];
  if (!sA.length) tips.push('Diese Woche noch keine Einheit – starte mit 3 Minuten aus „Heute üben“.');
  if (neglected.length) tips.push(`Zuletzt nicht geübt: ${neglected.map(c => CAT[c].n).join(', ')}.`);
  if (sA.length > 25) tips.push('Sehr viel Training! Denk an genug Ruhe – Gelerntes festigt sich im Schlaf.');
  if (!wA.length) tips.push('Nutze den Gassi-Modus, um Rückrufe und Leine messbar zu machen.');
  if (incA > incB && incA >= 3) tips.push('Mehr Vorfälle als letzte Woche – prüfe Stress, Schlaf und Management (Trigger-Stacking?).');
  return `<div class="section-t">Wochenrückblick <span class="cnt">7 Tage vs. davor</span></div><div class="card pad review">
    <div class="kv"><span>Einheiten</span><b>${sA.length} ${trend(sA.length, sB.length)}</b></div>
    <div class="kv"><span>Trainingszeit</span><b>${fmtDur(mA)} ${trend(mA, mB)}</b></div>
    <div class="kv"><span>Spaziergänge</span><b>${wA.length} ${trend(wA.length, wB.length)}</b></div>
    <div class="kv"><span>Schwierige Momente</span><b>${incA} ${incA < incB ? '<i class="up">▼</i>' : incA > incB ? '<i class="dn">▲</i>' : '<i>＝</i>'}</b></div>
    ${good ? `<div class="kv"><span>Erfolgsmomente 🌟</span><b>${good}</b></div>` : ''}
    ${top.length ? `<p class="small"><b>Schwerpunkte:</b> ${top.map(([c, n]) => `${CAT[c].e} ${esc(CAT[c].n)} (${n})`).join(', ')}</p>` : ''}
    ${tips.length ? `<ul class="rtips">${tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : `<p class="small good">Starke Woche – weiter so! 💪</p>`}</div>`;
}

/* ── MEHR ── */
function viewMore() {
  const d = S.dog;
  let h = `<button class="card prof" data-act="profile"><span class="avatar">🐕</span><span><b>${esc(d.name || 'Steckbrief anlegen')}</b><small>${esc([d.breed, fmtAge(d.birth), d.sex, d.neutered].filter(Boolean).join(' · ') || 'Name, Geburtstag, Tierarzt …')}</small></span><span class="chev">›</span></button>`;
  if (d.vetPhone || d.clinic) h += `<div class="card list">${d.vetPhone ? `<a class="arow" href="tel:${esc(d.vetPhone.replace(/[^\d+]/g, ''))}"><span>🩺</span><span><b>${esc(d.vet || 'Tierarzt')}</b><small>${esc(d.vetPhone)}</small></span><span class="chev">📞</span></a>` : ''}${d.clinic ? `<a class="arow" href="tel:${esc(d.clinic.replace(/[^\d+]/g, ''))}"><span>🚨</span><span><b>Tierklinik / Notdienst</b><small>${esc(d.clinic)}</small></span><span class="chev">📞</span></a>` : ''}</div>`;
  const fam = S.settings.fam;
  h += `<div class="section-t">Familie & Gerät</div><div class="card">
    <label class="setting"><span><span class="lbl">👶 Baby/Kleinkind im Haushalt</span><br><span class="sub">Baby-Routinen, Übungen und Challenges im Plan</span></span><span class="switch"><input type="checkbox" data-fam="baby" ${fam.baby ? 'checked' : ''}><i></i></span></label>
    <label class="setting"><span><span class="lbl">🧒 Oft Kinder zu Besuch</span><br><span class="sub">Kinder-Regeln und passende Challenges</span></span><span class="switch"><input type="checkbox" data-fam="kids" ${fam.kids ? 'checked' : ''}><i></i></span></label>
    <label class="setting"><span><span class="lbl">📱 Wer nutzt dieses Handy?</span><br><span class="sub">Name erscheint bei Häkchen und Kommentaren</span></span><input type="text" data-local="me" value="${esc(me())}" placeholder="z. B. Flo" maxlength="30" autocomplete="off"></label></div>`;
  h += `<div class="section-t">Werkzeuge</div><div class="card menu">
    ${Object.entries(PAGES).map(([id, p]) => `<button data-act="openPage" data-id="${id}"><span class="ico">${p.e}</span><span class="mt">${esc(p.t)}<small>${esc(p.sub())}</small></span><span class="chev">›</span></button>`).join('')}</div>`;
  h += `<div class="section-t">Darstellung</div><div class="card pad"><div class="seg">${[['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([v, n]) => `<button class="${S.settings.theme === v ? 'on' : ''}" data-act="theme" data-v="${v}">${n}</button>`).join('')}</div></div>`;
  h += window.Cloud ? Cloud.section() : '';
  h += `<div class="section-t">Daten</div><div class="card menu">
    <button data-act="exportData"><span class="ico">💾</span>Backup speichern (JSON)</button>
    <button data-act="importData"><span class="ico">📂</span>Backup laden</button>
    <button data-act="resetAll"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button></div>
    <input type="file" id="importFile" accept=".json,application/json" hidden>
    <div class="section-t">Über diese App</div><div class="card pad small muted about">
    <p><b>Hunde-Coach</b> – Erziehung und Training für euren Dackel-Bracke-Mix: ${H.ex.length} Übungen in ${H.cats.length} Bereichen, ${H.wissen.length} Wissensartikel, ${H.dd.length} Lebensbereiche mit Do’s & Don’ts, ${H.challenges.length} Challenges, ${H.quiz.length} Quizfragen und ${BADGES.length} Abzeichen.</p>
    <p>Methodik: belohnungsbasiert, kleinschrittig und nach dem LIMA-Prinzip, auf Grundlage von Lerntheorie und aktueller Verhaltensforschung. Medizinische Angaben folgen StIKo Vet und ESCCAP. Rechtliche Hinweise sind ein Überblick ohne Gewähr – Regeln unterscheiden sich je Bundesland und Gemeinde.</p>
    <p>Die App ersetzt weder Tierärztin bzw. Tierarzt noch bei ernsthaften Problemen (Aggression, Angst, Trennungsstress) die persönliche Begleitung durch qualifizierte Fachleute.</p></div>`;
  return h;
}
const PAGES = {
  erfolge: { e: '🏆', t: 'Erfolge', sub: () => { const c = C(); return `Level ${c.level} · ${lvlTitle(c.level)} · Serie & Statistik`; }, v: viewErfolge },
  review: { e: '📊', t: 'Auswertung', sub: () => `${pl(S.comments.length, 'Kommentar', 'Kommentare')} · Monatsrückblick & Export`, v: viewReview },
  routines: { e: '🗓️', t: 'Routinen anpassen', sub: () => `${(S.settings.routines || []).length} von ${H.routines.length} aktiv`, v: viewRoutinesCfg },
  sync: { e: '📲', t: 'Auf mehreren Handys nutzen', sub: () => window.Cloud && Cloud.isOn() ? 'Online-Abgleich ist aktiv ✓' : 'Einrichten in 3 Schritten', v: viewSync },
  diary: { e: '📝', t: 'Verhaltens-Tagebuch', sub: () => pl(S.incidents.length, 'Eintrag', 'Einträge'), v: viewDiary },
  health: { e: '🩺', t: 'Gesundheit', sub: () => { const w = S.health.filter(h => h.type === 'gewicht').sort((a, b) => b.date.localeCompare(a.date))[0]; return (w ? `${num(+w.value)} kg · ` : '') + pl(S.health.length, 'Eintrag', 'Einträge'); }, v: viewHealth },
  lex: { e: '🗣️', t: 'Signal-Lexikon', sub: () => `${lexList().length} Signale – für alle im Haushalt`, v: viewLex },
  rew: { e: '🍖', t: 'Belohnungs-Hitliste', sub: () => `${rewList().length} Belohnungen`, v: viewRew },
  trig: { e: '📏', t: 'Auslöser & Abstände', sub: () => pl(S.trig.length, 'Auslöser', 'Auslöser'), v: viewTrig },
};
function viewDiary() {
  const since = Date.now() - 30 * DAY, l30 = S.incidents.filter(i => i.ts >= since), by = {};
  l30.forEach(i => { by[i.type] = (by[i.type] || 0) + 1; });
  const max = Math.max(1, ...Object.values(by));
  let h = `<p class="small muted intro">Notiere schwierige Situationen – und Erfolgsmomente. Mit Auslöser, Abstand und Intensität erkennst du Muster (Tageszeit, Orte, Trigger-Stacking) und siehst echte Fortschritte.</p>
    <button class="btn primary" style="width:100%" data-act="incAdd">＋ Eintrag</button>`;
  if (l30.length) h += `<div class="section-t">Letzte 30 Tage</div><div class="card pad">${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([t, n]) => { const ty = H.incTypes.find(x => x.id === t) || H.incTypes[H.incTypes.length - 1]; return `<div class="hbar"><span>${ty.e} ${esc(ty.n)}</span><i style="width:${n / max * 100}%" class="${t === 'gut' ? 'good' : ''}"></i><b>${n}</b></div>`; }).join('')}</div>`;
  const list = [...S.incidents].sort((a, b) => b.ts - a.ts);
  if (!list.length) return h + `<div class="empty"><div class="big">🔍</div><b>Noch keine Einträge</b>Tipp: Auch Erfolgsmomente eintragen – das motiviert!</div>`;
  let day = '';
  for (const i of list.slice(0, 200)) {
    const k = tkey(i.ts), ty = H.incTypes.find(x => x.id === i.type) || H.incTypes[H.incTypes.length - 1];
    if (k !== day) { if (day) h += '</div>'; day = k; h += `<div class="section-t">${esc(dayLabel(k))}</div><div class="card list">`; }
    h += `<button class="lrow" data-act="incEdit" data-id="${i.id}"><span class="lt">${hm(i.ts)}</span><span class="lm"><b>${ty.e} ${esc(ty.n)}${i.trig ? ' · ' + esc(i.trig) : ''}</b><small>${[i.dist ? i.dist + ' m' : '', i.note ? esc(i.note) : ''].filter(Boolean).join(' · ') || '–'}</small></span><span class="lr">${i.type !== 'gut' && i.int ? `<b class="int i${i.int}">${i.int}/5</b>` : ''}</span></button>`;
  }
  return h + '</div>';
}
function incForm(i, isNew) {
  const trigs = S.trig.map(t => t.n);
  return `<form data-form="inc" data-id="${i.id || ''}" class="stack">
    <div class="field"><label>Was ist passiert?</label><div class="tgrid">${H.incTypes.map(t => `<label class="tchip"><input type="radio" name="type" value="${t.id}" ${i.type === t.id ? 'checked' : ''} required><span><em>${t.e}</em>${esc(t.n)}</span></label>`).join('')}</div></div>
    <div class="field"><label>Zeitpunkt</label><input type="datetime-local" name="ts" value="${toLocalInput(i.ts || Date.now())}"></div>
    <div class="field"><label>Intensität (1 = leicht, 5 = heftig)</label><div class="chiprow">${[1, 2, 3, 4, 5].map(v => `<label class="chip rad"><input type="radio" name="int" value="${v}" ${i.int === v ? 'checked' : ''}><span>${v}</span></label>`).join('')}</div></div>
    <div class="field"><label>Auslöser</label><input type="text" name="trig" list="trigList" value="${esc(i.trig || '')}" placeholder="z. B. Rüde an der Leine, Reh, Radfahrer"><datalist id="trigList">${trigs.map(t => `<option value="${esc(t)}">`).join('')}</datalist></div>
    <div class="field"><label>Abstand (Meter)</label><input type="number" name="dist" inputmode="numeric" min="0" value="${esc(i.dist || '')}"></div>
    <div class="field"><label>Was hast du gemacht? / Notiz</label><textarea name="note" rows="3" placeholder="Reaktion, was geholfen hat, was du nächstes Mal anders machst">${esc(i.note || '')}</textarea></div>
    <button class="btn primary">Speichern</button>
    ${!isNew ? `<button type="button" class="btn danger" data-act="incDel" data-id="${i.id}">Eintrag löschen</button>` : ''}</form>`;
}
function viewHealth() {
  let h = `<button class="btn primary" style="width:100%" data-act="healthAdd">＋ Eintrag</button>`;
  const due = dueHealth();
  if (due.length) h += `<div class="section-t">Fällig</div><div class="card list">${due.map(x => `<div class="lrow"><span class="lt">${x.ty.e}</span><span class="lm"><b>${esc(x.ty.n)}</b><small>${x.over ? 'überfällig seit' : 'geplant'} ${fmtDate(fromKey(x.h.next))}</small></span></div>`).join('')}</div>`;
  const w = S.health.filter(x => x.type === 'gewicht' && x.value).sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
  if (w.length) h += `<div class="section-t">Gewicht</div><div class="card chart"><div class="ch-h"><b>${num(+w[w.length - 1].value)} kg</b><span>${w.length > 1 ? (w[w.length - 1].value - w[0].value >= 0 ? '+' : '') + num(w[w.length - 1].value - w[0].value) + ' kg seit ' + fmtDate(fromKey(w[0].date)) : ''}</span></div>${chartBars(w.map(x => +x.value), w.map(x => fromKey(x.date).getDate() + '.'), { fmt: v => num(v) + ' kg', h: 70 })}
    <p class="small muted">Für den Dackel-Rücken ist Normalgewicht entscheidend: Rippen fühlbar, aber nicht sichtbar, Taille erkennbar.</p></div>`;
  const list = [...S.health].sort((a, b) => b.date.localeCompare(a.date));
  h += `<div class="section-t">Einträge</div>`;
  if (!list.length) return h + `<div class="empty"><div class="big">🩺</div><b>Noch nichts eingetragen</b>Gewicht, Impfungen, Entwurmung, Zeckenschutz, Krallen – mit Erinnerung an den nächsten Termin.</div>`;
  return h + `<div class="card list">${list.map(x => { const ty = H.healthTypes.find(t => t.id === x.type) || H.healthTypes[H.healthTypes.length - 1]; return `<button class="lrow" data-act="healthEdit" data-id="${x.id}"><span class="lt">${fromKey(x.date).getDate()}.${fromKey(x.date).getMonth() + 1}.<small>${fromKey(x.date).getFullYear()}</small></span><span class="lm"><b>${ty.e} ${esc(ty.n)}${x.value ? ' · ' + esc(fmtVal(x.value)) + (ty.unit ? ' ' + ty.unit : '') : ''}</b><small>${[x.note ? esc(x.note) : '', x.next ? 'nächster: ' + fmtDate(fromKey(x.next)) : ''].filter(Boolean).join(' · ') || '–'}</small></span></button>`; }).join('')}</div>`;
}
function healthForm(x, isNew) {
  return `<form data-form="health" data-id="${x.id || ''}" class="stack">
    <div class="field"><label>Art</label><div class="tgrid">${H.healthTypes.map(t => `<label class="tchip"><input type="radio" name="type" value="${t.id}" data-interval="${t.interval || ''}" ${x.type === t.id ? 'checked' : ''} required><span><em>${t.e}</em>${esc(t.n)}</span></label>`).join('')}</div></div>
    <div class="field"><label>Datum</label><input type="date" name="date" value="${x.date || todayKey()}" required></div>
    <div class="field"><label>Wert (z. B. Gewicht in kg, Präparat)</label><input type="text" name="value" value="${esc(x.value || '')}" inputmode="text"></div>
    <div class="field"><label>Nächster Termin (Erinnerung)</label><input type="date" name="next" value="${x.next || ''}"><small class="hint">Wird beim Wählen der Art vorgeschlagen.</small></div>
    <div class="field"><label>Notiz</label><input type="text" name="note" value="${esc(x.note || '')}"></div>
    <button class="btn primary">Speichern</button>
    ${!isNew ? `<button type="button" class="btn danger" data-act="healthDel" data-id="${x.id}">Eintrag löschen</button>` : ''}</form>`;
}
function viewLex() {
  return `<p class="small muted intro">Alle im Haushalt nutzen dieselben Wörter – das ist einer der größten Hebel für schnelles Lernen. Zeig die Liste auch Hundesittern und Besuch.</p>
    <div class="card list">${lexList().map((x, i) => `<button class="lrow lex" data-act="lexEdit" data-i="${i}"><span class="lm"><b>${esc(x.w)}</b><small>${esc(x.m)}${x.h ? ' · ✋ ' + esc(x.h) : ''}</small></span><span class="chev">›</span></button>`).join('')}</div>
    <div class="stack" style="margin-top:12px"><button class="btn soft" data-act="lexEdit" data-i="-1">＋ Signal hinzufügen</button><button class="btn soft" data-act="shareLex">Liste teilen</button>${S.lex ? '<button class="btn danger" data-act="lexReset">Auf Vorschlag zurücksetzen</button>' : ''}</div>`;
}
function viewRew() {
  const l = rewList().map((x, i) => ({ ...x, i })).sort((a, b) => b.v - a.v);
  return `<p class="small muted intro">Was ist deinem Hund wie viel wert? Mach den Wahltest (zwei Sorten in zwei Händen) und passe die Sterne an. Leichte Aufgaben → einfache Belohnung, schwere Aufgaben draußen → Top-Belohnung.</p>
    <div class="card list">${l.map(x => `<button class="lrow" data-act="rewEdit" data-i="${x.i}"><span class="lm"><b>${esc(x.n)}</b><small>${esc(x.t || '')}</small></span><span class="lr"><b class="stars-t">${'★'.repeat(x.v)}<span>${'★'.repeat(5 - x.v)}</span></b></span></button>`).join('')}</div>
    <div class="stack" style="margin-top:12px"><button class="btn soft" data-act="rewEdit" data-i="-1">＋ Belohnung hinzufügen</button>${S.rew ? '<button class="btn danger" data-act="rewReset">Auf Vorschlag zurücksetzen</button>' : ''}</div>`;
}
function viewTrig() {
  return `<p class="small muted intro">Auslöser, auf die dein Hund reagiert, mit dem Abstand, bei dem er noch entspannt ist (Wohlfühlabstand). Trainiere immer an oder über dieser Grenze – und freu dich, wenn sie mit der Zeit kleiner wird.</p>
    ${S.trig.length ? `<div class="card list">${S.trig.map((x, i) => `<button class="lrow" data-act="trigEdit" data-i="${i}"><span class="lm"><b>${esc(x.n)}</b><small>${esc(x.note || '')}</small></span><span class="lr"><b>${esc(x.d)} m</b><small>entspannt</small></span></button>`).join('')}</div>` : `<div class="empty"><div class="big">📏</div><b>Noch keine Auslöser</b>Zum Beispiel: Rüden, Jogger, Rehe, Katzen, Kinder auf Rollern.</div>`}
    <button class="btn soft" style="width:100%;margin-top:12px" data-act="trigEdit" data-i="-1">＋ Auslöser hinzufügen</button>
    <div class="card list" style="margin-top:12px">${['so-lat', 'so-bogen', 'pr-reaktiv'].map(id => exRow(EX[id])).join('')}</div>`;
}
function viewRoutinesCfg() {
  const on = new Set(S.settings.routines || []), WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  return `<p class="small muted intro">Wähle, welche Routinen in deinem Tagesplan erscheinen. Weniger, dafür verlässlich, ist besser als alles halbherzig. Wöchentliche Routinen erscheinen nur am angegebenen Tag.</p>` +
    H.slots.map(sl => `<div class="section-t">${sl.e} ${esc(sl.n)}</div><div class="card">${H.routines.filter(r => r.s === sl.id).map(r => `<label class="setting ${famOn(r.fam) ? '' : 'off'}"><span><span class="lbl">${r.e} ${esc(r.n)}${r.wd ? ` <em class="wd">${r.wd.map(d => WD[d]).join(', ')}</em>` : ''}${r.fam ? ` <em class="wd">${r.fam === 'baby' ? 'mit Baby' : 'mit Kindern'}</em>` : ''}</span><br><span class="sub">${esc(r.t)}</span></span><span class="switch"><input type="checkbox" data-routinecfg="${r.id}" ${on.has(r.id) ? 'checked' : ''}><i></i></span></label>`).join('')}</div>`).join('') +
    `<button class="btn plain" style="width:100%;margin-top:14px" data-act="routinesReset">Auf Empfehlung zurücksetzen</button>`;
}
function viewSync() {
  const on = window.Cloud && Cloud.isOn();
  return `<div class="card pad sync"><p><b>${on ? '✓ Dieses Handy ist mit der Online-Datenbank verbunden.' : 'So nutzt ihr die App auf mehreren iPhones (z. B. iPhone 15 und 16) mit denselben Daten:'}</b></p>
    <ol>
      <li><b>Online-Datenbank einrichten:</b> unten anmelden bzw. Konto erstellen. Es ist dasselbe Konto wie bei euren anderen Apps (Baby, Essen …).</li>
      <li><b>Zweites iPhone:</b> diese Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm“. Dann in der App unter Einstellungen (Zahnrad) mit <b>demselben Konto</b> anmelden – oder unten „Weiteres Gerät verbinden“ nutzen und den Link aufs andere Handy schicken.</li>
      <li><b>Fertig:</b> Übungen, Häkchen, Gassi, Kommentare und Einstellungen gleichen sich beim Öffnen und alle 20 Sekunden ab. Ohne Netz wird gespeichert und später nachgeholt.</li>
    </ol>
    <p class="small muted">Tipp: Tragt unter „Einstellungen → Wer nutzt dieses Handy?“ euren Namen ein – dann seht ihr bei Häkchen und Kommentaren, wer was gemacht hat. Häkchen werden einzeln gespeichert, deshalb könnt ihr gleichzeitig abhaken, ohne euch zu überschreiben.</p>
    <p class="small muted">Wichtig: Beide Handys müssen mit demselben Konto angemeldet sein. Mit zwei verschiedenen Konten hat jeder seine eigenen Daten.</p></div>
    ${window.Cloud ? Cloud.section() : ''}`;
}

function editSheet(title, fields, onSave, onDel) {
  openSheet({ title, body: `<form data-form="generic" class="stack">${fields.map(f => `<div class="field"><label>${esc(f.l)}</label>${f.type === 'stars' ? `<div class="stars">${[5, 4, 3, 2, 1].map(i => `<label><input type="radio" name="${f.k}" value="${i}" ${+f.v === i ? 'checked' : ''}><span>★</span></label>`).join('')}</div>` : `<input type="${f.type || 'text'}" name="${f.k}" value="${esc(f.v ?? '')}" ${f.req ? 'required' : ''} ${f.type === 'number' ? 'inputmode="decimal" step="any"' : ''} placeholder="${esc(f.ph || '')}">`}</div>`).join('')}
    <button class="btn primary">Speichern</button>${onDel ? '<button type="button" class="btn danger" data-act="genDel">Löschen</button>' : ''}</form>` });
  pending.gen = onSave; pending.genDel = onDel;
}
function profileSheet() {
  const d = S.dog;
  const seg = (name, opts, v) => `<div class="chiprow wrap">${opts.map(o => `<label class="chip rad"><input type="radio" name="${name}" value="${o}" ${v === o ? 'checked' : ''}><span>${o}</span></label>`).join('')}</div>`;
  openSheet({ title: 'Steckbrief', body: `<form data-form="profile" class="stack">
    <div class="field"><label>Name</label><input type="text" name="name" value="${esc(d.name)}" placeholder="z. B. Bruno" autocapitalize="words"></div>
    <div class="field"><label>Geburtstag (ungefähr reicht)</label><input type="date" name="birth" value="${esc(d.birth)}"></div>
    <div class="field"><label>Rasse / Mix</label><input type="text" name="breed" value="${esc(d.breed)}"></div>
    <div class="field"><label>Geschlecht</label>${seg('sex', ['Rüde', 'Hündin'], d.sex)}</div>
    <div class="field"><label>Kastriert</label>${seg('neutered', ['kastriert', 'unkastriert'], d.neutered)}</div>
    <div class="field"><label>Tierarzt / Praxis</label><input type="text" name="vet" value="${esc(d.vet)}"></div>
    <div class="field"><label>Telefon Praxis</label><input type="tel" name="vetPhone" value="${esc(d.vetPhone)}"></div>
    <div class="field"><label>Tierklinik / Notdienst (Telefon)</label><input type="tel" name="clinic" value="${esc(d.clinic)}"></div>
    <div class="field"><label>Chip-Nummer</label><input type="text" name="chip" value="${esc(d.chip)}" inputmode="numeric"></div>
    <div class="field"><label>Notizen (Allergien, Besonderheiten)</label><textarea name="notes" rows="3">${esc(d.notes)}</textarea></div>
    <button class="btn primary">Speichern</button></form>` });
}

/* ═══════════ Aktionen ═══════════ */
function go(view) {
  scrollMem[nav.view + (nav.cat || '') + (nav.page || '')] = window.scrollY;
  nav.view = view; nav.cat = null; nav.ex = null; nav.page = null; nav.q = '';
  save(true); render(); window.scrollTo(0, 0);
}
function back() {
  if (nav.ex) nav.ex = null; else if (nav.cat) nav.cat = null; else if (nav.page) nav.page = null;
  render(); window.scrollTo(0, scrollMem[nav.view + (nav.cat || '') + (nav.page || '')] || 0);
}
function openEx(id) { scrollMem[nav.view + (nav.cat || '') + (nav.page || '')] = window.scrollY; nav.ex = id; closeAllSheets(); render(); window.scrollTo(0, 0); }
function toggleCh(id) { togglePlan('ch:' + id); render(); }
function walkStart() { if (WALK) { go('gassi'); return; } WALK = { s: Date.now(), cnt: {} }; saveWalk(); vib(15); go('gassi'); toast('Gassi läuft – viel Spaß! 🦮'); }
function walkFinish() {
  if (!WALK) return;
  const w = { id: uid(), s: WALK.s, e: Date.now(), cnt: { ...WALK.cnt } };
  openSheet({ title: 'Spaziergang speichern', body: walkForm(w, true) });
  pending.walkNew = w;
}

const ACT = {
  tab: el => { closeAllSheets(); go(el.dataset.view); },
  back,
  openCat: el => { scrollMem[nav.view] = window.scrollY; nav.cat = el.dataset.id; render(); window.scrollTo(0, 0); },
  goCat: el => { closeAllSheets(); nav.view = 'training'; nav.ex = null; nav.page = null; nav.cat = el.dataset.id; render(); window.scrollTo(0, 0); },
  openEx: el => openEx(el.dataset.id),
  openPage: el => {
    closeAllSheets(); scrollMem.mehr = window.scrollY; nav.view = 'mehr'; nav.ex = null; nav.cat = null; nav.page = el.dataset.id;
    if (nav.page === 'review' && S.seen._review !== todayKey()) { S.seen._review = todayKey(); save(); }
    render(); window.scrollTo(0, 0); if (nav.page === 'review') celebrate();
  },
  tseg: el => { S.ui.tseg = el.dataset.seg; save(true); render(); },
  chToggle: el => toggleCh(el.dataset.id),
  chReroll: el => { const t = todayKey(), d = dayRec(t), rr = { ...(d.rr || {}) }; rr[el.dataset.slot] = (rr[el.dataset.slot] || 0) + 1; setDay(t, { rr }); save(); render(); },
  planCheck: el => { togglePlan(el.dataset.key); render(); },
  planOpen: el => {
    const it = findItem(el.dataset.key); if (!it) return;
    if (it.type === 'ex') { openEx(it.id); return; }
    const sl = SLOTS[it.slot], coms = commentsOf(it.type, it.id).slice(0, 10);
    openSheet({ title: TYPE_N[it.type], body: `<div class="mcard flat"><div class="mk">${sl.e} ${esc(sl.n)}</div><h2>${it.e} ${esc(it.n)}</h2><p class="goal">${esc(it.t)}</p>
      <div class="stack">${it.type === 'ch' && it.ch.c === 'gassi' && !WALK ? '<button class="btn soft" data-act="walkStart">🦮 Gassi starten</button>' : ''}
      <button class="btn ${it.done ? 'plain' : 'primary'}" data-act="planCheckClose" data-key="${esc(it.key)}">${it.done ? 'Als nicht erledigt markieren' : '✓ Erledigt'}</button>
      <button class="btn soft" data-act="comAdd" data-t="${it.type}" data-id="${esc(it.id)}">💬 Kommentar</button></div>
      ${coms.length ? `<div class="section-t">Kommentare</div><div class="card list">${coms.map(c => comRow(c)).join('')}</div>` : ''}</div>` });
  },
  planCheckClose: el => { closeSheet(); togglePlan(el.dataset.key); render(); },
  slotToggle: el => { const id = el.dataset.id, now = el.closest('.pslot').classList.contains('open'); slotOpen[id] = !now; render(); },
  exSwap: el => {
    const k = todayKey(), dx = dayEx(k) || { tag: [], gassi: [] }, id = el.dataset.id, inTag = dx.tag.includes(id);
    const used = [...dx.tag, ...dx.gassi, ...((dayRec(k).exSeen) || [])];
    let next;
    if (inTag) next = recommend(12).map(e => e.id).find(x => !used.includes(x)) || H.ex.filter(e => sk(e.id).status === 'neu' && e.l === 1 && !used.includes(e.id)).map(e => e.id)[0];
    else next = walkPick(used) !== id ? walkPick(used) : H.ex.filter(e => e.w && !used.includes(e.id)).map(e => e.id)[0];
    if (!next) { toast('Keine weitere passende Übung gefunden'); return; }
    const nx = { tag: dx.tag.map(x => x === id ? next : x), gassi: dx.gassi.map(x => x === id ? next : x) };
    setDay(k, { ex: nx, exSeen: [...new Set([...(dayRec(k).exSeen || []), id])] }); save(); render(); toast('Neue Übung: ' + EX[next].n);
  },
  comAdd: el => commentSheet({ t: el.dataset.t, id: el.dataset.id }),
  comEdit: el => { const c = S.comments.find(x => x.id === el.dataset.id); if (c) commentSheet(c.ref || { t: 'gen', id: '' }, c); },
  comDel: el => confirmSheet('Diesen Kommentar löschen?', 'Löschen', () => { S.comments = S.comments.filter(x => x.id !== el.dataset.id); save(); closeAllSheets(); render(); refreshMode(); }),
  modeStart: () => openMode(),
  modeFilter: el => { M.filter = el.dataset.v; refreshMode(); },
  modeUnskip: () => { M.skip.clear(); refreshMode(); },
  modeMood: el => { const v = +el.dataset.v; M.mood = M.mood === v ? 0 : v; refreshMode(); },
  modeTag: el => { const v = el.dataset.v; M.tags = M.tags.includes(v) ? M.tags.filter(x => x !== v) : [...M.tags, v]; refreshMode(); },
  modeSkip: () => { const it = modeQueue().open[0]; if (it) M.skip.add(it.key); M.mood = 0; M.tags = []; M.text = ''; refreshMode(); },
  modeDone,
  famOn: el => { S.settings.fam[el.dataset.v] = true; S.seen._babyAsk = Date.now(); const k = todayKey(); const d = { ...dayRec(k) }; delete d.ex; S.days[k] = d; setDay(k, {}); save(); render(); toast('Baby-Themen sind jetzt in deinem Plan'); },
  famNo: () => { S.seen._babyAsk = Date.now(); save(); render(); },
  revDays: el => { S.ui.rev = +el.dataset.v; save(true); render(); },
  revShare: () => {
    const txt = reviewText(S.ui.rev || 30);
    if (navigator.share) navigator.share({ title: 'Hunde-Coach Auswertung', text: txt }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Bericht in die Zwischenablage kopiert'), () => shareFile(txt, `hunde-coach-bericht-${todayKey()}.txt`, 'text/plain'));
    else shareFile(txt, `hunde-coach-bericht-${todayKey()}.txt`, 'text/plain');
  },
  revCsv: exportCsv,
  startTrainer: el => startTrainer(el.dataset.id, !!el.dataset.manual),
  trOk: () => { T.ok++; T.fails = 0; T.last = 'ok'; vib(10); refreshTrainer(); },
  trNo: () => { T.no++; T.fails++; T.last = 'no'; vib([5, 30, 5]); refreshTrainer(); },
  trUndo: () => { if (T.last === 'no' && T.no) T.no--; else if (T.ok) T.ok--; else if (T.no) T.no--; T.fails = 0; refreshTrainer(); },
  trStage: el => { T.stage = +el.dataset.i; rerenderTrainer(); },
  trDist: el => { T.dist = +el.dataset.v; rerenderTrainer(); },
  trPlace: el => { T.place = el.dataset.v; rerenderTrainer(); },
  trPause: () => { if (T.run) { T.acc += Date.now() - T.t0; T.run = false; } else { T.t0 = Date.now(); T.run = true; } rerenderTrainer(); },
  trSave: saveTrainer,
  exStage: el => { const id = nav.ex, i = +el.dataset.i, k = sk(id); setSkill(id, { stage: i, status: k.status === 'neu' ? 'arbeit' : k.status }); save(); render(); if (i > k.stage) celebrate(`Stufe ${i + 1} · +15 XP`); },
  exStatus: el => { const id = nav.ex, v = el.dataset.v, k = sk(id); const patch = { status: v }; if ((v === 'sitzt' || v === 'gen') && k.stage < EX[id].st.length - 1) patch.stage = EX[id].st.length - 1; setSkill(id, patch); save(); render(); if (v === 'sitzt' || v === 'gen') celebrate(v === 'gen' ? '🌍 Generalisiert! +120 XP' : '✅ Sitzt! +40 XP'); },
  exFav: () => { const id = nav.ex; setSkill(id, { fav: !sk(id).fav }); save(); render(); toast(sk(id).fav ? 'Auf die Merkliste gesetzt' : 'Von der Merkliste entfernt'); },
  pickEx: () => {
    const rec = recommend(5), prog = H.ex.filter(e => sk(e.id).status === 'arbeit');
    const list = [...new Set([...prog, ...rec])];
    openSheet({ title: 'Welche Übung?', cls: 'tall', body: `<div class="search"><input type="search" placeholder="Übung suchen …" data-search="pick" autocomplete="off"></div><div id="pickRes"><div class="card list">${list.map(e => `<button class="exrow" data-act="pickGo" data-id="${e.id}"><span class="exe">${CAT[e.c].e}</span><span class="exm"><b>${esc(e.n)}</b><small>${esc(CAT[e.c].n)}</small></span></button>`).join('') || '<p class="pad small muted">Suche eine Übung.</p>'}</div></div>` });
  },
  pickGo: el => { closeSheet(); setTimeout(() => startTrainer(el.dataset.id, true), 340); },
  sessEdit: el => {
    const s = S.sessions.find(x => x.id === el.dataset.id); if (!s) return; const e = EX[s.ex];
    openSheet({ title: e ? e.n : 'Einheit', body: `<form data-form="sess" data-id="${s.id}" class="stack">
      <div class="field"><label>Zeitpunkt</label><input type="datetime-local" name="ts" value="${toLocalInput(s.ts)}"></div>
      <div class="field"><label>Stufe</label><select name="stage">${(e ? e.st : ['–']).map((x, i) => `<option value="${i}" ${i === s.stage ? 'selected' : ''}>${i + 1}: ${esc(x)}</option>`).join('')}</select></div>
      <div class="mgrid"><label class="mini"><span>✓ Gelungen</span><input type="number" min="0" name="ok" value="${s.ok}"></label><label class="mini"><span>✗ Nicht</span><input type="number" min="0" name="no" value="${s.reps - s.ok}"></label><label class="mini"><span>⏱ Minuten</span><input type="number" min="0" name="dmin" value="${Math.round((s.dur || 0) / MIN)}"></label>${e && e.mt ? `<label class="mini"><span>${esc(e.mt[0])} (${esc(e.mt[1])})</span><input type="number" step="any" name="val" value="${esc(s.val)}"></label>` : ''}</div>
      <div class="field"><label>Notiz</label><input type="text" name="note" value="${esc(s.note || '')}"></div>
      <button class="btn primary">Speichern</button><button type="button" class="btn danger" data-act="sessDel" data-id="${s.id}">Einheit löschen</button></form>` });
  },
  sessDel: el => { confirmSheet('Diese Einheit löschen?', 'Löschen', () => { S.sessions = S.sessions.filter(x => x.id !== el.dataset.id); save(); closeAllSheets(); render(); toast('Einheit gelöscht'); }); },
  walkStart, walkEnd: walkFinish,
  walkCnt: el => { const k = el.dataset.k; WALK.cnt[k] = (WALK.cnt[k] || 0) + 1; saveWalk(); vib(k.endsWith('_no') ? [5, 30, 5] : 10); render(); },
  walkDec: el => { const k = el.dataset.k; if (WALK.cnt[k]) WALK.cnt[k]--; saveWalk(); render(); },
  walkDiscard: () => confirmSheet('Diesen Spaziergang verwerfen? Die Zähler gehen verloren.', 'Verwerfen', () => { WALK = null; saveWalk(); render(); }),
  walkAdd: () => { const w = { id: uid(), s: Date.now() - 45 * MIN, e: Date.now(), cnt: {} }; openSheet({ title: 'Spaziergang nachtragen', body: walkForm(w, 'manual') }); pending.walkNew = w; },
  walkEdit: el => { const w = S.walks.find(x => x.id === el.dataset.id); if (w) { pending.walkNew = null; openSheet({ title: 'Spaziergang', body: walkForm(w, false) }); } },
  walkDel: el => confirmSheet('Diesen Spaziergang löschen?', 'Löschen', () => { S.walks = S.walks.filter(x => x.id !== el.dataset.id); save(); closeAllSheets(); render(); }),
  art: el => openArt(el.dataset.id),
  artRead: el => { S.read[el.dataset.id] = Date.now(); save(); closeSheet(); render(); celebrate('📖 Gelesen · +10 XP'); },
  dd: el => openDD(el.dataset.id),
  rules: () => openSheet({ title: 'Goldene Regeln', cls: 'tall', body: `<div class="rules">${H.rules.map(r => `<div class="rule"><span>${r.e}</span><div><b>${esc(r.n)}</b><p>${esc(r.t)}</p></div></div>`).join('')}</div>` }),
  quizStart: () => { const first = H.quiz.findIndex(q => !(S.quiz[q.id] && S.quiz[q.id].ok)); Q = { i: first < 0 ? 0 : first, ans: null, right: 0, n: 0 }; openSheet({ title: 'Wissens-Quiz', cls: 'tall', body: quizSheet(), onClose: () => { Q = null; render(); } }); },
  quizAns: el => { if (!Q || Q.ans != null) return; const i = +el.dataset.i, q = H.quiz[Q.i]; Q.ans = i; Q.n++; if (i === q.a) Q.right++; const gain = answerQuiz(q.id, i); vib(i === q.a ? 12 : [5, 30, 5]); $('.sheet-body', topSheet()).innerHTML = quizSheet(); if (gain) celebrate('🧠 Richtig · +10 XP'); },
  quizNext: () => { if (!Q) return; if (Q.i >= H.quiz.length - 1) { closeSheet(); return; } Q.i++; Q.ans = null; const b = $('.sheet-body', topSheet()); b.innerHTML = quizSheet(); b.scrollTop = 0; },
  dailyAns: el => { const gain = answerQuiz(el.dataset.q, +el.dataset.i); render(); vib(gain ? 12 : [5, 30, 5]); if (gain) celebrate('🧠 Richtig · +10 XP'); },
  profile: profileSheet,
  theme: el => { S.settings.theme = el.dataset.v; save(true); applyTheme(); render(); },
  incAdd: () => openSheet({ title: 'Verhalten notieren', body: incForm({ ts: Date.now() }, true) }),
  incEdit: el => { const i = S.incidents.find(x => x.id === el.dataset.id); if (i) openSheet({ title: 'Eintrag', body: incForm(i, false) }); },
  incDel: el => confirmSheet('Eintrag löschen?', 'Löschen', () => { S.incidents = S.incidents.filter(x => x.id !== el.dataset.id); save(); closeAllSheets(); render(); }),
  healthAdd: () => openSheet({ title: 'Gesundheit', body: healthForm({}, true) }),
  healthEdit: el => { const x = S.health.find(h => h.id === el.dataset.id); if (x) openSheet({ title: 'Gesundheit', body: healthForm(x, false) }); },
  healthDel: el => confirmSheet('Eintrag löschen?', 'Löschen', () => { S.health = S.health.filter(x => x.id !== el.dataset.id); save(); closeAllSheets(); render(); }),
  lexEdit: el => {
    const i = +el.dataset.i, x = i >= 0 ? lexList()[i] : { w: '', m: '', h: '' };
    editSheet(i >= 0 ? 'Signal' : 'Neues Signal', [{ k: 'w', l: 'Wort / Signal', v: x.w, req: 1 }, { k: 'm', l: 'Bedeutung', v: x.m }, { k: 'h', l: 'Handzeichen (optional)', v: x.h }],
      f => { const l = lexList().slice(); const it = { w: f.w.trim(), m: f.m.trim(), h: f.h.trim() }; if (i >= 0) l[i] = it; else l.push(it); S.lex = l; },
      i >= 0 ? () => { const l = lexList().slice(); l.splice(i, 1); S.lex = l; } : null);
  },
  lexReset: () => confirmSheet('Signal-Lexikon auf den Vorschlag zurücksetzen?', 'Zurücksetzen', () => { S.lex = null; save(); render(); }),
  shareLex: () => {
    const txt = `Signal-Lexikon${S.dog.name ? ' für ' + S.dog.name : ''}\n\n` + lexList().map(x => `• ${x.w} – ${x.m}${x.h ? ' (Hand: ' + x.h + ')' : ''}`).join('\n');
    if (navigator.share) navigator.share({ title: 'Signal-Lexikon', text: txt }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('In die Zwischenablage kopiert'), () => toast('Kopieren nicht möglich'));
  },
  rewEdit: el => {
    const i = +el.dataset.i, x = i >= 0 ? rewList()[i] : { n: '', v: 3, t: '' };
    editSheet(i >= 0 ? 'Belohnung' : 'Neue Belohnung', [{ k: 'n', l: 'Belohnung', v: x.n, req: 1 }, { k: 'v', l: 'Wert für deinen Hund', v: x.v, type: 'stars' }, { k: 't', l: 'Gut für …', v: x.t, ph: 'z. B. Rückruf, draußen' }],
      f => { const l = rewList().slice(); const it = { n: f.n.trim(), v: Math.max(1, +f.v || 3), t: f.t.trim() }; if (i >= 0) l[i] = it; else l.push(it); S.rew = l; },
      i >= 0 ? () => { const l = rewList().slice(); l.splice(i, 1); S.rew = l; } : null);
  },
  routinesReset: () => confirmSheet('Routinen auf die Empfehlung zurücksetzen?', 'Zurücksetzen', () => { S.settings.routines = defRoutines(); save(); render(); }),
  rewReset: () => confirmSheet('Belohnungsliste auf den Vorschlag zurücksetzen?', 'Zurücksetzen', () => { S.rew = null; save(); render(); }),
  trigEdit: el => {
    const i = +el.dataset.i, x = i >= 0 ? S.trig[i] : { n: '', d: '', note: '' };
    editSheet(i >= 0 ? 'Auslöser' : 'Neuer Auslöser', [{ k: 'n', l: 'Auslöser', v: x.n, req: 1, ph: 'z. B. Rüden an der Leine' }, { k: 'd', l: 'Wohlfühlabstand (m)', v: x.d, type: 'number', req: 1 }, { k: 'note', l: 'Notiz', v: x.note }],
      f => { const it = { n: f.n.trim(), d: String(f.d).replace(',', '.'), note: f.note.trim() }; if (i >= 0) S.trig[i] = it; else S.trig.push(it); },
      i >= 0 ? () => { S.trig.splice(i, 1); } : null);
  },
  genDel: () => { const fn = pending.genDel; confirmSheet('Wirklich löschen?', 'Löschen', () => { fn && fn(); save(); closeAllSheets(); render(); }); },
  exportData: () => {
    const data = JSON.stringify({ ...S, ui: undefined, exported: new Date().toISOString() }, null, 1);
    const name = `hunde-coach-${todayKey()}.json`, blob = new Blob([data], { type: 'application/json' });
    const file = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Hunde-Coach Backup' }).catch(() => {}); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  importData: () => $('#importFile').click(),
  resetAll: () => confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Daten löschen – auch online und auf allen verbundenen Geräten? Das kann nicht rückgängig gemacht werden.' : 'Alle Daten auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.', 'Alles löschen', () => {
    if (window.Cloud) Cloud.allowBulkDelete();
    const theme = S.settings.theme; S = fresh(); S.settings.theme = theme; S.ui.view = 'mehr'; WALK = null; saveWalk(); save(); applyTheme(); nav.page = null; render(); toast('Alle Daten gelöscht');
  }),
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },
};

const FORMS = {
  profile: f => {
    const d = Object.fromEntries(new FormData(f));
    for (const k of Object.keys(DEF_DOG)) if (k in d || ['sex', 'neutered'].includes(k)) S.dog[k] = String(d[k] ?? S.dog[k] ?? '').trim();
    save(); closeSheet(); render(); celebrate('Steckbrief gespeichert');
  },
  walk: f => {
    const d = Object.fromEntries(new FormData(f)), id = f.dataset.id;
    let w = S.walks.find(x => x.id === id);
    const isNew = !w;
    if (isNew) w = { ...(pending.walkNew || { id: uid(), s: Date.now(), e: Date.now(), cnt: {} }) };
    if (d.s) { const s = fromLocalInput(d.s), dm = Math.max(1, +d.dmin || 1); w.s = s; w.e = s + dm * MIN; }
    if (Object.keys(d).some(k => k.startsWith('c_'))) { w.cnt = {}; for (const c of WCNT) { const v = Math.max(0, parseInt(d['c_' + c.k], 10) || 0); if (v) w.cnt[c.k] = v; } }
    w.leash = +d.leash || 0; w.mood = +d.mood || 0; w.place = d.place || ''; w.note = (d.note || '').trim();
    if (isNew && me()) w.by = me();
    if (isNew) { S.walks.push(w); if (WALK && pending.walkNew && pending.walkNew.s === WALK.s) { WALK = null; saveWalk(); } }
    pending.walkNew = null;
    save(); closeAllSheets(); render();
    celebrate(isNew ? `Spaziergang gespeichert · +${walkXp(w)} XP` : 'Gespeichert');
  },
  sess: f => {
    const d = Object.fromEntries(new FormData(f)), s = S.sessions.find(x => x.id === f.dataset.id); if (!s) return;
    const ok = Math.max(0, parseInt(d.ok, 10) || 0), no = Math.max(0, parseInt(d.no, 10) || 0);
    Object.assign(s, { ts: fromLocalInput(d.ts), stage: +d.stage || 0, ok, reps: ok + no, dur: Math.max(0, +d.dmin || 0) * MIN, note: (d.note || '').trim() });
    if ('val' in d) s.val = d.val;
    save(); closeSheet(); render(); toast('Gespeichert');
  },
  inc: f => {
    const d = Object.fromEntries(new FormData(f)), id = f.dataset.id;
    const it = { id: id || uid(), type: d.type, ts: fromLocalInput(d.ts), int: +d.int || 0, trig: (d.trig || '').trim(), dist: d.dist ? +d.dist : '', note: (d.note || '').trim() };
    const old = S.incidents.find(x => x.id === id); if (old && old.by) it.by = old.by; else if (!old && me()) it.by = me();
    const i = S.incidents.findIndex(x => x.id === id);
    if (i >= 0) S.incidents[i] = it; else S.incidents.push(it);
    save(); closeSheet(); render(); celebrate(i >= 0 ? 'Gespeichert' : (it.type === 'gut' ? '🌟 Erfolgsmoment notiert · +3 XP' : 'Notiert · +3 XP'));
  },
  health: f => {
    const d = Object.fromEntries(new FormData(f)), id = f.dataset.id;
    const it = { id: id || uid(), type: d.type, date: d.date || todayKey(), value: (d.value || '').trim().replace(',', '.'), next: d.next || '', note: (d.note || '').trim() };
    const i = S.health.findIndex(x => x.id === id);
    if (i >= 0) S.health[i] = it; else S.health.push(it);
    save(); closeSheet(); render(); toast('Gespeichert');
  },
  comment: f => {
    const fd = new FormData(f), text = String(fd.get('text') || '').trim(), mood = +fd.get('mood') || 0, tags = fd.getAll('tags').map(String);
    if (!text && !mood && !tags.length) { toast('Schreib etwas oder wähle eine Stimmung'); return; }
    const id = f.dataset.id;
    if (id) { const c = S.comments.find(x => x.id === id); if (c) Object.assign(c, { text, mood, tags }); save(); }
    else addComment({ t: f.dataset.t, id: f.dataset.ref }, text, mood, tags);
    closeSheet(); render(); refreshMode(); celebrate(id ? 'Gespeichert' : '💬 Kommentar gespeichert');
  },
  generic: f => { const d = Object.fromEntries(new FormData(f)); pending.gen && pending.gen(d); save(); closeSheet(); render(); },
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  e.preventDefault();
  try { fn(a); } catch (err) { console.error(err); toast('Das hat nicht geklappt'); }
});
document.addEventListener('submit', e => {
  const fn = FORMS[e.target.dataset.form]; if (!fn) return;
  e.preventDefault();
  try { fn(e.target); } catch (err) { console.error(err); toast('Speichern fehlgeschlagen'); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.tr && T) { T[el.dataset.tr] = el.value; return; }
  if (el.dataset.mode === 'text' && M) { M.text = el.value; return; }
  if (el.dataset.local === 'me') { LOCAL.me = el.value.slice(0, 30); saveLocal(); return; }
  if (el.dataset.search) {
    const v = el.value; nav.q = el.dataset.search === 'pick' ? nav.q : v;
    if (el.dataset.search === 'pick') {
      const q = v.trim().toLowerCase(), box = $('#pickRes', topSheet());
      const hits = H.ex.filter(x => q.length < 2 || (x.n + ' ' + CAT[x.c].n + ' ' + x.g).toLowerCase().includes(q)).slice(0, 40);
      box.innerHTML = `<div class="card list">${hits.map(x => `<button class="exrow" data-act="pickGo" data-id="${x.id}"><span class="exe">${CAT[x.c].e}</span><span class="exm"><b>${esc(x.n)}</b><small>${esc(CAT[x.c].n)}</small></span></button>`).join('')}</div>`;
      return;
    }
    const res = $('#searchRes'), wrap = $('#segWrap');
    const html = el.dataset.search === 'ex' ? searchEx(v) : searchW(v);
    res.innerHTML = html; wrap.hidden = !!html;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.routinecfg) {
    const on = new Set(S.settings.routines || []); if (el.checked) on.add(el.dataset.routinecfg); else on.delete(el.dataset.routinecfg);
    S.settings.routines = H.routines.map(r => r.id).filter(id => on.has(id)); save();
    return;
  }
  if (el.dataset.fam) {
    S.settings.fam = { ...S.settings.fam, [el.dataset.fam]: el.checked }; S.seen._babyAsk = S.seen._babyAsk || Date.now();
    const k = todayKey(), d = { ...dayRec(k) }; delete d.ex; delete d.exSeen; S.days[k] = d; setDay(k, {}); // Plan für heute neu zusammenstellen
    save(); toast(el.checked ? 'Familien-Themen sind jetzt im Plan' : 'Familien-Themen ausgeblendet');
    return;
  }
  if (el.name === 'type' && el.dataset.interval !== undefined) { // Gesundheit: nächsten Termin vorschlagen
    const f = el.form, iv = +el.dataset.interval;
    if (iv && f.date.value) f.next.value = dkey(addDays(fromKey(f.date.value), iv));
    else if (!iv) f.next.value = '';
  }
  if (el.id === 'importFile' && el.files && el.files[0]) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result); if (!Array.isArray(d.sessions)) throw new Error('bad');
        confirmSheet('Backup laden? Die aktuellen Daten auf diesem Gerät werden ersetzt.', 'Backup laden', () => { const ui = S.ui; S = migrate(d); S.ui = ui; quietSeen(); save(); applyTheme(); render(); toast('Backup geladen'); });
      } catch (err) { toast('Datei ist kein gültiges Backup'); }
      el.value = '';
    };
    rd.readAsText(el.files[0]);
  }
});
$('#back').addEventListener('click', back);

/* Uhr: Trainer- und Gassi-Zeit */
function tick() {
  $$('[data-clock="walk"]').forEach(el => { if (WALK) el.textContent = fmtClock(Date.now() - WALK.s); });
  if (T && !T.manual) {
    const el = $('[data-clock="tr"]'); if (el) el.textContent = fmtClock(T.acc + (T.run ? Date.now() - T.t0 : 0));
    const hEl = $('[data-ref="hint"]', topSheet() || document); if (hEl) { const h = trHint(); if (hEl.textContent !== h) hEl.textContent = h; }
  }
}
setInterval(tick, 1000);
let lastDay = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { if (todayKey() !== lastDay) { lastDay = todayKey(); _calc = null; if (!sheetStack.length) render(); } tick(); }
});

/* Start */
quietSeen() && save(true);
render();

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
const ARR = { sess: ['s:', 'sessions'], walk: ['w:', 'walks'], inc: ['i:', 'incidents'], health: ['h:', 'health'], comment: ['m:', 'comments'] };
if (window.Cloud) Cloud.init({
  app: 'hund',
  rebuilt,
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(ARR)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    for (const [id, x] of Object.entries(S.skills)) m['k:' + id] = { kind: 'skill', data: x };
    for (const [k, x] of Object.entries(S.days)) m['d:' + k] = { kind: 'day', data: x };
    for (const [k, c] of Object.entries(S.checks)) for (const [key, v] of Object.entries(c)) m['c:' + k + '|' + key] = { kind: 'check', data: v }; // jedes Häkchen einzeln → kein Überschreiben zwischen Handys
    m.dog = { kind: 'dog', data: S.dog, soft: Object.keys(DEF_DOG).every(k => (S.dog[k] || '') === DEF_DOG[k]) };
    const rt = S.settings.routines || [], fam = S.settings.fam || DEF_FAM;
    m.settings = { kind: 'settings', data: { routines: rt, fam }, soft: rt.join() === defRoutines().join() && !fam.baby && !fam.kids };
    if (S.lex) m.lex = { kind: 'lex', data: { items: S.lex } };
    if (S.rew) m.rew = { kind: 'rew', data: { items: S.rew } };
    m.trig = { kind: 'trig', data: { items: S.trig }, soft: !S.trig.length };
    m.read = { kind: 'read', data: S.read, soft: !Object.keys(S.read).length };
    m.quiz = { kind: 'quiz', data: S.quiz, soft: !Object.keys(S.quiz).length };
    m.seen = { kind: 'seen', data: S.seen, soft: !Object.keys(S.seen).length };
    return m;
  },
  apply(r) {
    const rid = r.id.slice(2), del = r.deleted, d = r.data;
    if (ARR[r.kind]) {
      const arr = S[ARR[r.kind][1]], i = arr.findIndex(x => x.id === rid);
      if (del) { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = d; else arr.push(d);
    } else if (r.kind === 'skill') { if (del) delete S.skills[rid]; else S.skills[rid] = d; }
    else if (r.kind === 'day') { if (del) delete S.days[rid]; else { const { b, done, ...rest } = d || {}; S.days[rid] = rest; } }
    else if (r.kind === 'check') {
      const i = rid.indexOf('|'), k = rid.slice(0, i), key = rid.slice(i + 1), c = { ...chk(k) };
      if (del) delete c[key]; else c[key] = d || { t: Date.now() };
      if (Object.keys(c).length) S.checks[k] = c; else delete S.checks[k];
    }
    else if (r.kind === 'dog') { if (!del && d) S.dog = { ...DEF_DOG, ...d }; }
    else if (r.kind === 'settings') {
      if (!del && d && Array.isArray(d.routines)) S.settings.routines = d.routines;
      if (!del && d && d.fam) S.settings.fam = { ...DEF_FAM, ...d.fam };
    }
    else if (r.kind === 'lex') S.lex = del || !d ? null : d.items;
    else if (r.kind === 'rew') S.rew = del || !d ? null : d.items;
    else if (r.kind === 'trig') S.trig = del || !d ? [] : (d.items || []);
    else if (r.kind === 'read' || r.kind === 'quiz' || r.kind === 'seen') S[r.kind] = del || !d ? {} : d;
  },
  persist() { save(true); },
  refresh() {
    _calc = null; if (quietSeen()) save(true);
    if (sheetStack.length) return; // offenes Fenster nicht zerstören
    const y = window.scrollY; render(); window.scrollTo(0, y);
  },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  guardDeletes(list, known) { return list.length >= 5 && list.length > known / 3; },
  openSettings() { closeAllSheets(); go('mehr'); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
