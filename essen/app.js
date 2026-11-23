'use strict';

/* ───────── Helpers ───────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const monday = d => { const x = startOfDay(d); return addDays(x, -((x.getDay() + 6) % 7)); };
const isoWeek = d => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
};
const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const DAYS_S = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDay = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
const MEALS = [
  { k: 'f', name: 'Frühstück', short: 'Früh' },
  { k: 'm', name: 'Mittagessen', short: 'Mittag' },
  { k: 'a', name: 'Abendessen', short: 'Abend' },
  { k: 's', name: 'Snack / Nachtisch', short: 'Snack' },
];
const meal = k => MEALS.find(m => m.k === k) || MEALS[2];
const VIEWS = ['plan', 'recipes', 'swipe', 'shop', 'home', 'todo', 'more'];
const TAB_ORDER = ['plan', 'recipes', 'shop', 'home', 'todo', 'more'];
const SORTS = ['name', 'time', 'kcal', 'protein', 'pp', 'ns', 'veg'];
const APP_VERSION = '6.0';
const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
const isStr = x => typeof x === 'string' && x !== '';
const isNum = x => typeof x === 'number' && isFinite(x);
const isWide = () => matchMedia('(min-width:700px)').matches;
const fmtStamp = t => new Date(t).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/* ───────── Fehler abfangen: ein Fehler darf nie die ganze App lahmlegen ───────── */
const KEY = 'essen.v1', BAK_KEY = 'essen.bak', BAD_KEY = 'essen.defekt', LOG_KEY = 'essen.log';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* egal */ } }
function errorLog() { try { const l = JSON.parse(lsGet(LOG_KEY)); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
function logError(e, where) {
  try {
    console.error(e);
    const txt = e && e.stack ? String(e.stack).split('\n').slice(0, 4).join(' | ') : String((e && e.message) || e);
    lsSet(LOG_KEY, JSON.stringify([...errorLog(), `${new Date().toISOString()} [${where || '?'}] ${txt}`.slice(0, 700)].slice(-15)));
  } catch (x) { /* Protokoll ist optional */ }
}
let lastOops = 0;
function oops(e, where) {
  if (e && /^(AbortError|NotAllowedError)$/.test(e.name)) return; // z. B. Teilen abgebrochen
  logError(e, where);
  if (Date.now() - lastOops < 4000) return;
  lastOops = Date.now();
  try { toast('Das hat leider nicht geklappt – bitte noch einmal versuchen'); } catch (x) { /* Seite noch nicht bereit */ }
}
window.addEventListener('error', e => { if (e.error) oops(e.error, 'window'); });
window.addEventListener('unhandledrejection', e => oops(e.reason, 'promise'));

const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
};

/* ───────── Ingredient parsing & units ───────── */
const UNIT_MAP = {
  g: 'g', gr: 'g', gramm: 'g', kg: 'kg', mg: 'mg', ml: 'ml', cl: 'cl', dl: 'dl', l: 'l', liter: 'l',
  el: 'EL', tl: 'TL', msp: 'Msp', prise: 'Prise', prisen: 'Prise',
  stk: 'Stk', 'stück': 'Stk', stueck: 'Stk', bund: 'Bund', dose: 'Dose', dosen: 'Dose',
  pck: 'Pck', pkg: 'Pck', packung: 'Pck', packungen: 'Pck', 'päckchen': 'Pck', zehe: 'Zehe', zehen: 'Zehe',
  becher: 'Becher', tasse: 'Tasse', tassen: 'Tasse', scheibe: 'Scheibe', scheiben: 'Scheibe',
  glas: 'Glas', 'gläser': 'Glas', handvoll: 'Handvoll', kopf: 'Kopf', 'köpfe': 'Kopf', knolle: 'Knolle', knollen: 'Knolle',
  stange: 'Stange', stangen: 'Stange', zweig: 'Zweig', zweige: 'Zweig', blatt: 'Blatt', 'blätter': 'Blatt',
  'würfel': 'Würfel', kugel: 'Kugel', kugeln: 'Kugel', beutel: 'Beutel', schuss: 'Schuss', spritzer: 'Spritzer', netz: 'Netz', schale: 'Schale',
};
const PLURAL = { Dose: 'Dosen', Zehe: 'Zehen', Tasse: 'Tassen', Scheibe: 'Scheiben', Prise: 'Prisen', Glas: 'Gläser', Kopf: 'Köpfe', Knolle: 'Knollen', Stange: 'Stangen', Zweig: 'Zweige', Blatt: 'Blätter', Schale: 'Schalen' };
const FRAC = { '½': .5, '¼': .25, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3 };
const unitRe = new RegExp('^(' + Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length).join('|') + ')\\.?(?=\\s|$)', 'i');

function parseAmount(s) {
  s = s.trim().replace(',', '.');
  if (FRAC[s] != null) return FRAC[s];
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + m[2] / m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return m[1] / m[2];
  m = s.match(/^(\d+)\s*([½¼¾⅓⅔])$/);
  if (m) return +m[1] + FRAC[m[2]];
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseIng(line) {
  let s = line.replace(/^[\s\-–•*·]+/, '').trim();
  if (!s) return null;
  let amount = null, unit = '';
  const am = s.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔])(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?\s*/);
  if (am) { amount = parseAmount(am[1]); s = s.slice(am[0].length); }
  const um = s.match(unitRe);
  if (um && (amount != null || s.length > um[0].length)) {
    unit = UNIT_MAP[um[1].toLowerCase()] || um[1];
    s = s.slice(um[0].length).trim();
  }
  if (!s) { s = unit; unit = ''; }
  return { amount, unit, name: s };
}

function toBase(amount, unit) {
  if (amount == null) return { amount, unit };
  switch (unit) {
    case 'kg': return { amount: amount * 1000, unit: 'g' };
    case 'mg': return { amount: amount / 1000, unit: 'g' };
    case 'l': return { amount: amount * 1000, unit: 'ml' };
    case 'cl': return { amount: amount * 10, unit: 'ml' };
    case 'dl': return { amount: amount * 100, unit: 'ml' };
    default: return { amount, unit };
  }
}

function fmtNum(n, metric) {
  if (n == null) return '';
  if (!metric) {
    const whole = Math.floor(n + 1e-9), rest = n - whole;
    const fr = [[.25, '¼'], [1 / 3, '⅓'], [.5, '½'], [2 / 3, '⅔'], [.75, '¾']].find(([v]) => Math.abs(rest - v) < .04);
    if (fr) return (whole ? whole : '') + fr[1];
    if (rest < .04) return String(whole);
    if (rest > .96) return String(whole + 1);
  }
  const r = n >= 100 ? Math.round(n / 5) * 5 : n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
  return String(r).replace('.', ',');
}

function fmtAmount(amount, unit) {
  if (amount == null) return unit || '';
  let a = amount, u = unit;
  if (u === 'g' && a >= 1000) { a /= 1000; u = 'kg'; }
  if (u === 'ml' && a >= 1000) { a /= 1000; u = 'l'; }
  const metric = ['g', 'kg', 'ml', 'l'].includes(u);
  const num = fmtNum(a, metric);
  if (u && a > 1 && PLURAL[u]) u = PLURAL[u];
  return u ? `${num} ${u}` : num;
}

const ingLine = i => [i.amount != null ? fmtNum(i.amount, ['g', 'kg', 'ml', 'l', 'cl', 'dl', 'mg'].includes(i.unit)) : '', i.amount > 1 && PLURAL[i.unit] ? PLURAL[i.unit] : i.unit, i.name].filter(Boolean).join(' ');
const nameKey = n => n.split(/[,(]/)[0].trim().toLowerCase();
const shortName = n => n.split(/[,(]/)[0].trim();

/* ───────── Kategorien (Einkauf) ───────── */
const CATS = [
  { k: 'obst', name: 'Obst & Gemüse', e: '🥦' },
  { k: 'brot', name: 'Brot & Gebäck', e: '🥖' },
  { k: 'kuehl', name: 'Milch, Käse & Kühlregal', e: '🧀' },
  { k: 'tofu', name: 'Tofu & Veggie', e: '🌱' },
  { k: 'getreide', name: 'Nudeln, Reis & Getreide', e: '🍝' },
  { k: 'vorrat', name: 'Vorrat & Backen', e: '🥫' },
  { k: 'gewuerz', name: 'Gewürze & Saucen', e: '🧂' },
  { k: 'tk', name: 'Tiefkühl', e: '🧊' },
  { k: 'snack', name: 'Snacks & Süßes', e: '🍫' },
  { k: 'getraenk', name: 'Getränke', e: '🥤' },
  { k: 'haushalt', name: 'Haushalt & Drogerie', e: '🧻' },
  { k: 'fleisch', name: 'Fleisch & Fisch', e: '🥩' },
  { k: 'sonst', name: 'Sonstiges', e: '🛒' },
];
const catOf = k => CATS.find(c => c.k === k) || CATS[CATS.length - 1];
function guessCat(name) {
  const f = matchFood(name);
  if (f) return f.cat;
  if (/hack|hähnchen|huhn|pute|rind|schwein|speck|schinken|wurst|salami|lachs|fisch|thunfisch|garnele|steak|schnitzel/i.test(name)) return 'fleisch';
  return 'sonst';
}
/* Abteilungen (depts.js): eigene Reihenfolge aus den Einstellungen, fehlende hinten angehängt */
function deptOrder() {
  const saved = Array.isArray(S.settings.depts) ? S.settings.depts.filter(k => DEPT_BY[k]) : [];
  return [...new Set([...saved, ...DEPTS.map(d => d.k)])].map(k => DEPT_BY[k]);
}
function guessDept(name) { const f = matchFood(name); return f ? f.dept : guessCat(name) === 'fleisch' ? 'fisch' : 'sonst'; }
// Abteilung eines Artikels: selbst gewählt > aus dem Katalog > aus der alten Kategorie
function deptOf(it) {
  if (it.dept && DEPT_BY[it.dept]) return it.dept;
  if (it.fid != null && FOODS[it.fid] && FOODS[it.fid].name === it.name) return FOODS[it.fid].dept;
  const f = matchFood(it.name); if (f) return f.dept;
  return OLD_TO_DEPT[it.cat] || 'sonst';
}
const showDish = () => S.settings.showDish !== false;
const COUNTABLE = ['', 'Stk', 'Dose', 'Pck', 'Bund', 'Becher', 'Glas', 'Kopf', 'Knolle', 'Stange', 'Netz', 'Beutel', 'Schale', 'Zehe', 'Scheibe', 'Kugel', 'Würfel'];
const LEVELS = ['', 'Einfach', 'Mittel', 'Anspruchsvoll'];

/* ───────── Eingebaute Rezepte ───────── */
const BUILTINS = builtinRecipes(parseIng);
const BUILTIN_BY_ID = new Map(BUILTINS.map(b => [b.id, b]));

/* ───────── State ───────── */
const boot = { notice: '', saveWarned: false, rebuilt: false };
const newSid = () => 's' + uid();
function fresh() {
  return {
    v: 2, sid: newSid(), recipes: [], over: {}, hidden: [], favs: [], plan: {}, shop: [], recent: [], votes: { Fee: {}, Flo: {} }, todos: [], routines: [],
    settings: { meals: ['m', 'a'], servings: 2, pantry: 'Salz\nPfeffer\nWasser\nÖl\nOlivenöl' },
    ui: { view: 'plan', hideHint: false, open: {}, sort: 'name' },
  };
}
// Alte Version (mit Fleisch-Beispielen) auf neue Struktur umstellen
const OLD_SAMPLES = {
  'Spaghetti Bolognese': 'Linsen-Bolognese', 'Chili con Carne': 'Chili sin Carne',
  'Gemüse-Curry mit Kichererbsen': 'Gemüse-Curry mit Kichererbsen', 'Ofengemüse mit Feta': 'Ofengemüse mit Feta',
  'Hähnchen-Reis-Pfanne': 'Asia-Gemüsepfanne mit Erdnusssauce', 'Rote Linsensuppe': 'Rote Linsensuppe',
  'Lachs mit Ofenkartoffeln & Brokkoli': 'Ofenkartoffeln mit Kräuterquark', 'Pfannkuchen': 'Pfannkuchen',
  'Overnight Oats': 'Overnight Oats', 'Griechischer Salat': 'Griechischer Salat', 'Shakshuka': 'Shakshuka',
};
function migrate(s) {
  const f = fresh();
  if (!s.v || s.v < 2) {
    const bid = n => (BUILTINS.find(b => b.name === n) || {}).id || null;
    const idMap = {}, keep = [], favs = [];
    for (const r of (Array.isArray(s.recipes) ? s.recipes : []).filter(isObj)) {
      if (r.name in OLD_SAMPLES) { const nid = bid(OLD_SAMPLES[r.name]); idMap[r.id] = nid; if (r.fav && nid) favs.push(nid); }
      else { if (r.fav) favs.push(r.id); delete r.fav; keep.push(r); }
    }
    const plan = {};
    for (const [d, day] of Object.entries(isObj(s.plan) ? s.plan : {})) for (const [m, e] of Object.entries(isObj(day) ? day : {})) {
      let ne = e;
      if (isObj(e) && e.r && e.r in idMap) ne = idMap[e.r] ? { ...e, r: idMap[e.r] } : null;
      if (ne) { plan[d] = plan[d] || {}; plan[d][m] = ne; }
    }
    const shop = [], recent = [];
    for (const i of (Array.isArray(s.shop) ? s.shop : []).filter(x => isObj(x) && isStr(x.name))) {
      if (i.q) { shop.push(i); continue; }
      const w = i.auto || null;
      const it = decorate({ id: i.id || uid(), name: i.name, cat: null, q: i.amount != null ? [{ a: i.amount, u: i.unit || '', w }] : [], note: '', src: i.src || [], w });
      if (i.done) recent.push({ name: it.name }); else shop.push(it);
    }
    s = { ...s, v: 2, recipes: keep, favs, plan, shop, recent, over: s.over || {}, hidden: s.hidden || [] };
  }
  return { ...f, ...s, settings: { ...f.settings, ...(isObj(s.settings) ? s.settings : {}) }, ui: { ...f.ui, ...(isObj(s.ui) ? s.ui : {}), open: { ...(isObj(s.ui) && isObj(s.ui.open) ? s.ui.open : {}) } } };
}

/* Daten prüfen und reparieren. Gültige Einträge bleiben exakt, wie sie sind (sonst würden sie unnötig
   neu hochgeladen). Unbrauchbares wird entfernt bzw. ergänzt, damit ein einzelner kaputter Eintrag –
   egal ob vom Gerät, aus einem Backup oder aus der Datenbank – nie die ganze App lahmlegt. */
function cleanIngs(list) {
  if (!Array.isArray(list)) return [];
  if (list.every(i => isObj(i) && isStr(i.name) && (i.amount == null || isNum(i.amount)) && typeof (i.unit == null ? '' : i.unit) === 'string')) return list;
  return list.filter(i => isObj(i) && isStr(i.name)).map(i => ({ amount: isNum(i.amount) ? i.amount : null, unit: typeof i.unit === 'string' ? i.unit : '', name: i.name }));
}
function cleanRecipe(r) {
  if (!isObj(r) || !isStr(r.name)) return null;
  const ok = Array.isArray(r.ingredients) && cleanIngs(r.ingredients) === r.ingredients
    && Array.isArray(r.steps) && r.steps.every(isStr)
    && (r.tags === undefined || (Array.isArray(r.tags) && r.tags.every(isStr)))
    && isNum(r.servings) && r.servings >= 1
    && (r.time === '' || r.time == null || (isNum(r.time) && r.time >= 0))
    && (r.emoji == null || typeof r.emoji === 'string') && (r.notes == null || typeof r.notes === 'string')
    && (r.photo == null || (typeof r.photo === 'string' && r.photo.startsWith('data:image/')))
    && (r.kind == null || ['main', 'breakfast', 'snack', 'dessert'].includes(r.kind));
  if (ok) return r;
  const time = r.time === '' || r.time == null ? NaN : +r.time, serv = +r.servings;
  return {
    ...r, ingredients: cleanIngs(r.ingredients), steps: Array.isArray(r.steps) ? r.steps.filter(isStr) : [],
    tags: Array.isArray(r.tags) ? r.tags.filter(isStr) : [], servings: isNum(serv) && serv >= 1 ? serv : 1,
    time: isNum(time) && time >= 0 ? time : '', emoji: typeof r.emoji === 'string' ? r.emoji : '🍽️', notes: typeof r.notes === 'string' ? r.notes : '',
    photo: typeof r.photo === 'string' && r.photo.startsWith('data:image/') ? r.photo : undefined,
    kind: ['main', 'breakfast', 'snack', 'dessert'].includes(r.kind) ? r.kind : undefined,
  };
}
function cleanItem(i) {
  if (!isObj(i) || !isStr(i.id) || !isStr(i.name)) return null;
  const qOk = q => isObj(q) && isNum(q.a) && typeof q.u === 'string';
  if (Array.isArray(i.q) && i.q.every(qOk) && typeof i.note === 'string' && Array.isArray(i.src) && i.src.every(isStr) && isStr(i.cat) && (i.emoji == null || typeof i.emoji === 'string')) return i;
  return decorate({ ...i, cat: isStr(i.cat) ? i.cat : null, q: Array.isArray(i.q) ? i.q.filter(qOk) : [], note: typeof i.note === 'string' ? i.note : '', src: Array.isArray(i.src) ? i.src.filter(isStr) : [] });
}
function cleanList(list, fn) { // gibt dieselbe Liste zurück, wenn alles in Ordnung ist
  if (!Array.isArray(list)) return [];
  const seen = new Set(), out = []; let same = true;
  for (const x of list) {
    const y = fn(x);
    if (!y || seen.has(y.id)) { same = false; continue; }
    seen.add(y.id); if (y !== x) same = false; out.push(y);
  }
  return same ? list : out;
}
function cleanPlan(plan) {
  if (!isObj(plan)) return {};
  const out = {};
  for (const [d, day] of Object.entries(plan)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !isObj(day)) continue;
    let o = day;
    for (const [m, e] of Object.entries(day)) {
      const usable = isObj(e) && (isStr(e.r) || isStr(e.t));
      const extrasOk = usable && (e.b === undefined || typeof e.b === 'boolean') && (e.sh === undefined || isNum(e.sh));
      if (usable && extrasOk && (e.s === undefined || (isNum(e.s) && e.s >= 1))) continue;
      if (o === day) o = { ...day };
      if (usable) { o[m] = { ...e }; if (!(isNum(e.s) && e.s >= 1)) delete o[m].s; if (typeof e.b !== 'boolean') delete o[m].b; if (!isNum(e.sh)) delete o[m].sh; } else delete o[m];
    }
    if (Object.keys(o).length) out[d] = o;
  }
  return out;
}
const uniqStrs = a => Array.isArray(a) ? [...new Set(a.filter(isStr))] : [];
const isDay = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
function cleanTodo(x) {
  if (!isObj(x) || !isStr(x.id) || !isStr(x.t)) return null;
  if (typeof x.done === 'boolean' && (x.d == null || isDay(x.d)) && (x.who === undefined || ['', 'Fee', 'Flo'].includes(x.who)) && (x.notes === undefined || typeof x.notes === 'string')) return x;
  return { ...x, done: !!x.done, d: isDay(x.d) ? x.d : null, who: ['Fee', 'Flo'].includes(x.who) ? x.who : undefined, notes: typeof x.notes === 'string' ? x.notes : undefined };
}
function cleanRoutine(r) {
  if (!isObj(r) || !isStr(r.id) || !isStr(r.n)) return null;
  const ok = isNum(r.every) && r.every >= 1 && ['d', 'w', 'm', 'y'].includes(r.unit) && isStr(r.a) && (r.last == null || isDay(r.last))
    && (r.snooze === undefined || isDay(r.snooze)) && (r.mins === undefined || isNum(r.mins)) && (r.who === undefined || ['', 'Fee', 'Flo'].includes(r.who))
    && (r.hist === undefined || (Array.isArray(r.hist) && r.hist.every(h => isObj(h) && isDay(h.d))));
  if (ok) return r;
  const o = { ...r, every: isNum(+r.every) && +r.every >= 1 ? Math.round(+r.every) : 1, unit: ['d', 'w', 'm', 'y'].includes(r.unit) ? r.unit : 'w', a: isStr(r.a) ? r.a : 'sonst',
    last: isDay(r.last) ? r.last : null, mins: isNum(+r.mins) ? +r.mins : 0, who: ['Fee', 'Flo'].includes(r.who) ? r.who : '',
    hist: Array.isArray(r.hist) ? r.hist.filter(h => isObj(h) && isDay(h.d)) : [] };
  if (!isDay(r.snooze)) delete o.snooze;
  return o;
}
function sanitize(s) {
  const f = fresh();
  if (!isObj(s)) return f;
  s.v = 2;
  if (!isStr(s.sid)) s.sid = f.sid;
  s.recipes = cleanList(s.recipes, r => { const c = cleanRecipe(r); return c && isStr(c.id) ? c : null; });
  s.shop = cleanList(s.shop, cleanItem);
  s.plan = cleanPlan(s.plan);
  s.todos = cleanList(s.todos, cleanTodo);
  s.routines = cleanList(s.routines, cleanRoutine);
  s.over = isObj(s.over) ? s.over : {};
  for (const id of Object.keys(s.over)) { const c = cleanRecipe(s.over[id]); if (c) s.over[id] = c; else delete s.over[id]; }
  s.hidden = uniqStrs(s.hidden); s.favs = uniqStrs(s.favs);
  s.recent = Array.isArray(s.recent) ? (s.recent.every(r => isObj(r) && isStr(r.name)) ? s.recent : s.recent.filter(r => isObj(r) && isStr(r.name))) : [];
  s.votes = isObj(s.votes) ? s.votes : {};
  for (const u of Object.keys(s.votes)) {
    if (!isObj(s.votes[u])) { s.votes[u] = {}; continue; }
    for (const id of Object.keys(s.votes[u])) if (![2, 1, -1, -2].includes(s.votes[u][id])) delete s.votes[u][id];
  }
  const st = isObj(s.settings) ? s.settings : {};
  const meals = Array.isArray(st.meals) ? MEALS.map(m => m.k).filter(k => st.meals.includes(k)) : [];
  const stOk = isObj(s.settings) && Array.isArray(st.meals) && meals.length > 0 && meals.length === st.meals.length && isNum(st.servings) && st.servings >= 1 && st.servings <= 20 && typeof st.pantry === 'string';
  if (!stOk) s.settings = { ...f.settings, ...st, meals: meals.length ? meals : f.settings.meals, servings: isNum(+st.servings) && st.servings != null ? Math.min(20, Math.max(1, Math.round(+st.servings))) : f.settings.servings, pantry: typeof st.pantry === 'string' ? st.pantry : f.settings.pantry };
  // Ziele & Ernährung sind optional – nur Ungültiges entfernen, Gültiges unangetastet lassen
  const ss = s.settings, drop = [], g = ss.goals;
  if ('goals' in ss && !(isObj(g) && Object.keys(g).every(k => (k === 'kcal' && isNum(g.kcal) && g.kcal >= 800 && g.kcal <= 6000) || (k === 'protein' && isNum(g.protein) && g.protein >= 10 && g.protein <= 400)))) drop.push('goals');
  if ('avoid' in ss && !(Array.isArray(ss.avoid) && ss.avoid.every(a => isStr(a) && ALLERGENS[a]))) drop.push('avoid');
  if ('diet' in ss && !['all', 'veggie', 'vegan'].includes(ss.diet)) drop.push('diet');
  if ('depts' in ss && !(Array.isArray(ss.depts) && ss.depts.every(d => isStr(d) && DEPT_BY[d]))) drop.push('depts');
  if ('showDish' in ss && typeof ss.showDish !== 'boolean') drop.push('showDish');
  if (drop.length) { s.settings = { ...ss }; drop.forEach(k => delete s.settings[k]); }
  const u = { ...f.ui, ...(isObj(s.ui) ? s.ui : {}) };
  if (!VIEWS.includes(u.view)) u.view = 'plan';
  if (!SORTS.includes(u.sort)) u.sort = 'name';
  if (!isObj(u.open)) u.open = {};
  s.ui = u;
  return s;
}
const hasContent = s => !!((s.todos || []).length || (s.routines || []).length || s.recipes.length || s.shop.length || Object.keys(s.plan).length || s.favs.length || s.hidden.length || Object.keys(s.over).length || Object.values(s.votes).some(v => Object.keys(v).length));

/* Sicherungen auf dem Gerät: einmal täglich automatisch und vor jedem großen Eingriff. */
function snapshots() {
  try { const a = JSON.parse(lsGet(BAK_KEY)); return Array.isArray(a) ? a.filter(x => isObj(x) && isObj(x.data) && isNum(x.t)) : []; }
  catch (e) { return []; }
}
function snapshot(why, auto) {
  try {
    if (!hasContent(S)) return false;
    const data = JSON.parse(JSON.stringify({ ...S, ui: undefined }));
    let list = snapshots();
    const same = x => JSON.stringify({ ...x.data, sid: 0 }) === JSON.stringify({ ...data, sid: 0 });
    if (list.length && same(list[0])) return false; // nichts Neues
    list.unshift({ t: Date.now(), why, auto: !!auto, data });
    list = [...list.filter(x => x.auto).slice(0, 3), ...list.filter(x => !x.auto).slice(0, 3)].sort((a, b) => b.t - a.t);
    while (list.length && !lsSet(BAK_KEY, JSON.stringify(list))) list.pop(); // Speicher knapp → älteste opfern
    return true;
  } catch (e) { logError(e, 'snapshot'); return false; }
}
function dailySnapshot() {
  const last = snapshots().find(x => x.auto);
  if (!last || dkey(new Date(last.t)) !== dkey(new Date())) snapshot('Automatisch', true);
}
function snapInfo(d) {
  const n = (x, one, many) => `${x} ${x === 1 ? one : many}`;
  const meals = Object.values(d.plan || {}).reduce((a, day) => a + Object.keys(day || {}).length, 0);
  const votes = Object.values(d.votes || {}).reduce((a, v) => a + Object.keys(v || {}).length, 0);
  return [n((d.recipes || []).length, 'eigenes Rezept', 'eigene Rezepte'), n(meals, 'geplantes Essen', 'geplante Essen'), n((d.shop || []).length, 'Artikel', 'Artikel'), votes ? n(votes, 'Bewertung', 'Bewertungen') : '', (d.todos || []).length ? n(d.todos.length, 'To-do', 'To-dos') : '', (d.routines || []).length ? n(d.routines.length, 'Routine', 'Routinen') : ''].filter(Boolean).join(' · ');
}

function load() {
  const raw = lsGet(KEY);
  if (raw) {
    try { const s = JSON.parse(raw); if (!isObj(s)) throw new Error('Kein gültiger Datenbestand'); return sanitize(migrate(s)); }
    catch (e) { lsSet(BAD_KEY, raw.slice(0, 2000000)); logError(e, 'load'); } // beschädigten Stand zur Seite legen
  }
  boot.rebuilt = true; // kein lesbarer Bestand: die Online-Datenbank ist jetzt die Wahrheit
  const snaps = snapshots();
  if (raw || snaps.length) { // beschädigt oder verschwunden → letzte Sicherung nehmen
    for (const sn of snaps) {
      try {
        const s = sanitize(migrate(sn.data)); s.sid = newSid(); // neue Kennung: Online-Datenbank gewinnt, nichts wird gelöscht
        boot.notice = `Die gespeicherten Daten auf diesem Gerät waren beschädigt. Die Sicherung vom ${fmtStamp(sn.t)} wurde wiederhergestellt.`;
        return s;
      } catch (e) { logError(e, 'load-snapshot'); }
    }
    if (raw) boot.notice = 'Die gespeicherten Daten auf diesem Gerät waren beschädigt und konnten nicht gelesen werden.';
  }
  return fresh();
}
let S = load();
dailySnapshot();
function persist() {
  const data = JSON.stringify(S);
  if (lsSet(KEY, data)) return true;
  lsDel(BAD_KEY); // Speicher voll? Erst Ballast, dann alte Sicherungen opfern
  if (lsSet(KEY, data)) return true;
  const list = snapshots();
  while (list.length > 1) { list.pop(); lsSet(BAK_KEY, JSON.stringify(list)); if (lsSet(KEY, data)) return true; }
  return false;
}
function save(fromServer) {
  _all = null;
  if (!persist() && !boot.saveWarned) {
    boot.saveWarned = true;
    toast('Speichern auf diesem Gerät nicht möglich – bitte ein Backup exportieren', { label: 'Backup', fn: () => exportData() });
  }
  updateBadge();
  if (!fromServer && window.Cloud) Cloud.soon(); // Änderung an die Online-Datenbank schicken
}
const saveUI = () => { persist(); }; // nur Ansichts-Zustand – kein Abgleich nötig
const bulkOk = () => { if (window.Cloud && Cloud.allowBulkDelete) Cloud.allowBulkDelete(); }; // gewollte Massenänderung
// Kompletter, gewollter Austausch des Datenbestands (Backup-Datei oder Sicherung)
function replaceState(data, msg) {
  const keep = { ui: S.ui, sid: S.sid };
  const d = JSON.parse(JSON.stringify(data)); delete d.app; delete d.exported; delete d.ui;
  S = sanitize(migrate(d)); S.ui = keep.ui; S.sid = keep.sid;
  bulkOk(); invalidate(); save(); render(); toast(msg);
}
if (lsGet(KEY) !== JSON.stringify(S)) persist(); // reparierten/ergänzten Stand gleich festhalten
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const ui = { q: '', tag: '', sq: '', showPast: false, ahead: 14, chipsAll: false, f: {}, strict: false, kind: '' };

/* ───────── Rezepte & Nährwerte ───────── */
let _all = null;
const nutCache = new Map();
function invalidate(id) { _all = null; if (id) nutCache.delete(id); else nutCache.clear(); }
function withOverride(b) { return S.over[b.id] ? { ...b, ...S.over[b.id], id: b.id, builtin: true, edited: true } : b; }
// Archivierte Varianten (curation.js) nur zeigen, wenn man sie nutzt: geplant, Favorit, bearbeitet – oder alle eingeblendet
const ARCHIVED = new Set(BUILTINS.filter(b => ARCHIVED_NAMES.includes(b.name)).map(b => b.id));
function inUse() {
  const u = new Set([...S.favs, ...Object.keys(S.over)]);
  for (const day of Object.values(S.plan)) for (const e of Object.values(day)) if (e && e.r) u.add(e.r);
  return u;
}
function allRecipes() {
  if (_all) return _all;
  const hidden = new Set(S.hidden), used = S.ui.archive ? null : inUse();
  _all = [...BUILTINS.filter(b => !hidden.has(b.id) && (!used || !ARCHIVED.has(b.id) || used.has(b.id))).map(withOverride), ...S.recipes];
  return _all;
}
const archivedCount = () => { const used = inUse(), hidden = new Set(S.hidden); return [...ARCHIVED].filter(id => !used.has(id) && !hidden.has(id)).length; };
// Art: Hauptgericht, Frühstück, Snack & Beilage, Dessert & Gebäck (eigene Angabe > Ausnahme-Liste > Kategorien)
const _kind = new WeakMap();
function kindOf(r) {
  if (!r) return 'main';
  if (KIND_LABELS[r.kind]) return r.kind;
  let k = _kind.get(r);
  if (!k) {
    const t = (r.tags || []).join(',');
    k = KIND_OVERRIDES[r.name] || (/Frühstück/.test(t) ? 'breakfast' : /Dessert|Süß/.test(t) ? 'dessert' : /Snack|Dip|Beilage|Getränk|Tapas/.test(t) ? 'snack' : 'main');
    _kind.set(r, k);
  }
  return k;
}
function recipeById(id) {
  const r = allRecipes().find(x => x.id === id);
  if (r) return r;
  const b = BUILTIN_BY_ID.get(id);
  return b ? withOverride(b) : null;
}
const isFav = id => S.favs.includes(id);
// Analyse eines Rezepts (Nährwerte, Nutri-Score, Gemüse, Allergene …) – siehe nutri.js
function nutr(r) {
  let n = nutCache.get(r.id);
  if (!n) { n = analyzeRecipe(r); nutCache.set(r.id, n); }
  return n;
}

/* ───────── Persönliche Ziele & Ernährung ───────── */
const DEFAULT_GOALS = { kcal: 2000, protein: 70 };
const DIETS = { all: 'Alles', veggie: 'Vegetarisch (ohne Fisch)', vegan: 'Vegan' };
const goals = () => ({ ...DEFAULT_GOALS, ...(isObj(S.settings.goals) ? S.settings.goals : {}) });
const avoidList = () => (Array.isArray(S.settings.avoid) ? S.settings.avoid.filter(a => ALLERGENS[a]) : []);
const dietOf = () => (DIETS[S.settings.diet] ? S.settings.diet : 'all');
const fitsDiet = r => { const d = dietOf(), n = nutr(r); return d === 'all' || (d === 'veggie' ? !n.fish : n.vegan); };
const badAllergens = r => { const av = avoidList(); return av.length ? nutr(r).allergens.filter(a => av.includes(a)) : []; };
const suits = r => fitsDiet(r) && !badAllergens(r).length; // für Vorschläge und „Auffüllen“

/* ───────── Fotos ───────── */
// Eigene Fotos stecken im Rezept (data:-URL), eingebaute liegen als Datei in img/ (Nachweis in photos.js)
function photoOf(r) {
  if (!r) return null;
  if (typeof r.photo === 'string' && r.photo.startsWith('data:image/')) return { src: r.photo, own: true };
  const c = typeof PHOTOS !== 'undefined' && r.builtin ? PHOTOS[r.id] : null;
  return c ? { src: 'img/' + r.id.slice(2) + '.webp', credit: c } : null;
}
const hueOf = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
// Vorschaubild mit Emoji als Ersatz (fehlendes Foto, kein Netz)
function thumbHTML(r, cls = 'thumb') {
  const p = photoOf(r), e = `<i>${esc((r && r.emoji) || '🍽️')}</i>`;
  return `<span class="${cls}${p ? '' : ' noimg'}" style="--h:${hueOf(r ? r.id : '')}">${p ? `<img src="${esc(p.src)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('noimg');this.remove()">` : ''}${e}</span>`;
}
const nsBadge = n => (n && n.ns ? `<span class="nsb ns-${n.ns.grade}" title="Nutri-Score ${n.ns.grade} (geschätzt)">${n.ns.grade}</span>` : '');
const SMART = {
  fav: { label: '♥ Favoriten', test: r => isFav(r.id) },
  veggie: { label: '🥕 Vegetarisch', test: r => !nutr(r).fish },
  vegan: { label: '🌱 Vegan', test: r => nutr(r).vegan },
  fish: { label: '🐟 Fisch', test: r => nutr(r).fish },
  fast: { label: '⏱ Bis 30 Min.', test: r => r.time && r.time <= 30 },
  healthy: { label: '🟢 Nutri-Score A/B', test: r => { const g = nutr(r).ns; return !!g && (g.grade === 'A' || g.grade === 'B'); } },
  greens: { label: '🥦 Viel Gemüse', test: r => nutr(r).vegPortions >= 2 },
  light: { label: '🔥 Unter 500 kcal', test: r => nutr(r).kcal < 500 },
  protein: { label: '💪 Proteinreich (ab 25 %)', test: r => nutr(r).pp >= 25 },
  lowcarb: { label: '🥑 Low Carb', test: r => nutr(r).c <= 30 },
};
const isMainDish = r => kindOf(r) === 'main';
const isBreakfast = r => kindOf(r) === 'breakfast';
const isSnackOrDessert = r => kindOf(r) === 'snack' || kindOf(r) === 'dessert';
// Welche Art passt zu welcher Mahlzeit im Plan
const KIND_FOR_MEAL = { f: 'breakfast', m: 'main', a: 'main', s: 'dessert' };

/* ───────── Toast ───────── */
let toastT;
const pending = {};
function toast(msg, action) {
  const t = $('#toast'); if (!t) return;
  msg = String(msg);
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button data-act="toastAct">${esc(action.label)}</button>` : '');
  pending.toast = action ? action.fn : null;
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 6000 : Math.min(5000, 1800 + msg.length * 35));
}

/* ───────── Sheets ───────── */
const sheetStack = [];
// cls: 'wide' (Rezept) oder 'full' (Kochmodus) – wirkt nur auf großen Bildschirmen.
// guard: ungespeicherte Eingaben nicht ohne Rückfrage verwerfen.
function openSheet({ title = '', left = '', right = '', body = '', onClose, cls = '', guard = false } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet' + (cls ? ' ' + cls : '');
  sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); if (title) sh.setAttribute('aria-label', title);
  sh.innerHTML = `<div class="sheet-head">${left || '<button class="lnk" data-act="closeSheet">Abbrechen</button>'}<b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  const entry = { ov, sh, onClose, t: Date.now(), guard, dirty: false };
  ov.addEventListener('click', () => { if (Date.now() - entry.t > 450) closeSheet(); });
  if (guard) sh.addEventListener('input', () => { entry.dirty = true; });
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  sheetStack.push(entry);
  addSwipeToClose(sh);
  return sh;
}
// force = ohne Rückfrage schließen (z. B. nach dem Speichern)
function closeSheet(force) {
  const top = sheetStack[sheetStack.length - 1]; if (!top) return;
  if (force !== true && top.guard && top.dirty) {
    confirmSheet('Deine Eingaben sind noch nicht gespeichert. Wirklich verwerfen?', 'Verwerfen', () => closeSheet(true));
    return;
  }
  const e = sheetStack.pop();
  e.ov.classList.remove('show'); e.sh.classList.remove('show');
  setTimeout(() => { e.ov.remove(); e.sh.remove(); }, 320);
  if (!sheetStack.length) document.body.classList.remove('locked');
  if (e.onClose) { try { e.onClose(); } catch (x) { logError(x, 'onClose'); } }
}
function closeAllSheets() { while (sheetStack.length) closeSheet(true); }
function topSheet() { return sheetStack.length ? sheetStack[sheetStack.length - 1].sh : null; }
function addSwipeToClose(sh) {
  const head = $('.sheet-head', sh); let y0 = null, dy = 0;
  head.addEventListener('touchstart', e => { if (isWide()) return; y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
  const end = () => { if (y0 == null) return; sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeSheet(); y0 = null; };
  head.addEventListener('touchend', end); head.addEventListener('touchcancel', end);
}
function confirmSheet(text, okLabel, onOk) {
  openSheet({
    title: 'Bist du sicher?', body: `<p style="text-align:center;font-size:16px;margin:6px 8px 18px">${esc(text)}</p><div class="stack">
      <button class="btn primary" data-act="confirmOk">${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`,
  });
  pending.confirm = onOk;
}

/* ───────── Rendering ───────── */
const TITLES = { home: 'Haushalt', todo: 'To-dos', plan: 'Essensplan', recipes: 'Rezepte', swipe: 'Essens-Tinder', shop: 'Einkaufsliste', more: 'Mehr' };
function render() {
  try { renderView(); }
  catch (e) { // eine Ansicht mit Fehler darf die App nicht leer lassen
    logError(e, 'render');
    $('#main').innerHTML = `<div class="empty"><div class="big">🛠️</div><b>Diese Ansicht konnte nicht angezeigt werden</b>Deine Daten sind weiterhin gespeichert.
      <div class="stack" style="max-width:320px;margin:18px auto 0"><button class="btn primary" data-act="reload">Neu laden</button><button class="btn" data-act="exportData">💾 Backup exportieren</button><button class="btn plain" data-act="tab" data-view="more">Zu „Mehr“</button></div>
      <p class="small muted" style="margin-top:14px">${esc((e && e.message) || e)}</p></div>`;
  }
}
function renderView() {
  const v = VIEWS.includes(S.ui.view) ? S.ui.view : (S.ui.view = 'plan');
  $('#title').textContent = TITLES[v];
  const tabV = v === 'swipe' ? 'recipes' : v; // Tindern gehört zu den Rezepten
  $$('#tabbar button[data-view]').forEach(b => {
    const on = b.dataset.view === tabV; b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (v === 'recipes' ? `<button class="hbtn" data-act="tab" data-view="swipe" aria-label="Essens-Tinder" title="Essens-Tinder: Rezepte bewerten">🔥</button><button class="hbtn" data-act="recipeNew" aria-label="Neues Rezept" title="Neues Rezept">${ICON.plus}</button>`
    : v === 'home' ? `<button class="hbtn" data-act="rtNew" aria-label="Neue Routine" title="Neue Routine">${ICON.plus}</button>`
    : v === 'swipe' ? `<button class="hbtn" data-act="tab" data-view="recipes" aria-label="Zu den Rezepten" title="Zu den Rezepten">📖</button><button class="hbtn" data-act="swSync" aria-label="Bewertungen übertragen" title="Bewertungen übertragen">⇄</button>`
    : v === 'shop' ? `<button class="hbtn" data-act="shopShare" aria-label="Liste teilen" title="Liste teilen">${ICON.share}</button>`
    : v === 'swipe' ? `<button class="hbtn" data-act="swSync" aria-label="Bewertungen übertragen" title="Bewertungen übertragen">⇄</button>` : '');
  const main = $('#main');
  if (v === 'plan') main.innerHTML = viewPlan();
  if (v === 'recipes') { main.innerHTML = viewRecipes(); renderRecipeList(); }
  if (v === 'shop') { main.innerHTML = viewShop(); renderShop(); }
  if (v === 'swipe') { main.innerHTML = viewSwipe(); renderSwipe(); }
  if (v === 'more') main.innerHTML = viewMore();
  if (v === 'home') main.innerHTML = viewHome();
  if (v === 'todo') { main.innerHTML = viewTodo(); loadBabyCloud(); }
  updateBadge();
}
function updateBadge() {
  const set = (id, n) => { const b = $(id); if (b) { b.hidden = !n; b.textContent = n; } };
  set('#shopBadge', S.shop.length);
  try { set('#homeBadge', homeDueCount()); set('#todoBadge', todoDueCount()); } catch (e) { /* Haushalt-Modul noch nicht geladen */ }
}

/* ── Plan ── */
function entryInfo(e) {
  if (e.r) {
    const r = recipeById(e.r);
    if (!r) return { emoji: '❓', name: 'Gelöschtes Rezept', meta: '', kcal: 0, p: 0, r: null };
    return { emoji: r.emoji || '🍽️', name: r.name, meta: `${e.s || r.servings} P.`, kcal: nutr(r).kcal, p: nutr(r).p, r };
  }
  return { emoji: '📝', name: e.t, meta: '', kcal: 0, p: 0, r: null };
}
const fmtInt = n => Math.round(n).toLocaleString('de-DE');

/* ── Plan: fortlaufende Liste ab heute ──
   Vergangene Tage sind ausgeblendet; die letzten 4 lassen sich ausgegraut einblenden. */
const PAST_MAX = 4;
const relLabel = i => i === 0 ? 'Heute' : i === 1 ? 'Morgen' : i === -1 ? 'Gestern' : i === -2 ? 'Vorgestern' : i < 0 ? `Vor ${-i} Tagen` : '';
const wdShort = d => DAYS_S[(d.getDay() + 6) % 7];
function upcomingKeys(n = 7) { const t = startOfDay(new Date()); return Array.from({ length: n }, (_, i) => dkey(addDays(t, i))); }
const weekKeys = () => upcomingKeys(7); // „nächste 7 Tage“ – für Auffüllen, Analyse, Leeren
const ICON_NOBUY = '<svg viewBox="0 0 24 24"><path d="M2.5 3.5h2.6l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7M21 7.5H9M3 3l18 18"/></svg>';
function slotHTML(k, m, e, past) {
  if (!e) return `<button class="slot empty" data-act="slotPick" data-d="${k}" data-m="${m.k}" aria-label="${m.name}: Gericht wählen"${past ? ' tabindex="-1"' : ''}><span class="slot-l">${m.short}</span><span class="slot-add">+ Gericht wählen</span></button>`;
  const x = entryInfo(e);
  const warn = x.r && badAllergens(x.r).length ? '<i class="slot-warn" title="Enthält gemiedene Allergene">⚠</i>' : '';
  const nobuy = x.r && e.b === false ? `<i class="slot-nobuy" title="Zutaten werden nicht eingekauft">${ICON_NOBUY}</i>` : '';
  return `<button class="slot filled" draggable="true" data-act="slotMenu" data-d="${k}" data-m="${m.k}"><span class="slot-l">${m.short}</span>${x.r ? thumbHTML(x.r, 'sthumb') : `<span class="sthumb noimg note"><i>${esc(x.emoji)}</i></span>`}<span class="slot-name">${esc(x.name)}</span><span class="slot-meta">${warn}${nobuy}${esc(x.meta)}</span></button>`;
}
function dayHTML(d, i, meals) {
  const k = dkey(d), day = S.plan[k] || {}, past = i < 0;
  let slots = '', kcal = 0, prot = 0;
  for (const m of meals) { const e = day[m.k]; if (e) { const x = entryInfo(e); kcal += x.kcal; prot += x.p; } slots += slotHTML(k, m, e, past); }
  // Gerichte aus abgewählten Mahlzeiten nicht verstecken
  for (const m of MEALS) if (!meals.includes(m) && day[m.k]) slots += slotHTML(k, m, day[m.k], past);
  if (past && !Object.keys(day).length) slots = '<p class="pastnone">Nichts geplant</p>';
  const rel = relLabel(i), monday = d.getDay() === 1 && i > 0;
  const gk = goals().kcal;
  return `<section class="card day${i === 0 ? ' today' : ''}${past ? ' past' : ''}" data-day="${k}">
    <div class="day-h"><span class="dn">${rel || DAYS[(d.getDay() + 6) % 7]}</span><small>${rel ? wdShort(d) + ', ' : ''}${fmtDay(d)}</small>${monday ? `<i class="kwchip">KW ${isoWeek(d)}</i>` : ''}${kcal ? `<em title="Geplante Mahlzeiten pro Person">${fmtInt(kcal)} kcal · ${fmtInt(prot)} g Eiweiß</em>` : ''}</div>
    ${kcal && !past ? `<div class="daybar" title="${fmtInt(kcal / gk * 100)} % von ${fmtInt(gk)} kcal"><i style="width:${Math.min(100, kcal / gk * 100)}%"></i></div>` : ''}${slots}</section>`;
}
function viewPlan() {
  const t = startOfDay(new Date());
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  let h = '';
  if (boot.notice) {
    h += `<div class="hint warn"><span style="font-size:24px">🛟</span><div><b>Daten wiederhergestellt</b>${esc(boot.notice)}${window.Cloud && Cloud.isOn() ? ' Neuere Änderungen werden aus der Online-Datenbank ergänzt.' : ''}</div><button class="x" data-act="hideNotice" aria-label="Ausblenden">×</button></div>`;
  }
  if (isIOS && !standalone && !S.ui.hideHint) {
    h += `<div class="hint"><span style="font-size:24px">📲</span><div><b>Als App installieren</b>Tippe in Safari auf <b style="display:inline">Teilen</b> und dann auf <b style="display:inline">„Zum Home-Bildschirm“</b>.</div><button class="x" data-act="hideHint" aria-label="Ausblenden">×</button></div>`;
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  // Übersicht über die nächsten 7 Tage
  const next = upcomingKeys(7);
  const planned = next.reduce((a, k) => a + meals.filter(m => S.plan[k] && S.plan[k][m.k]).length, 0), total = meals.length * 7;
  const missing = missingPlanEntries().length;
  h += `<section class="card plansum">
      <div class="ps-top"><div><b>Nächste 7 Tage</b><span>${planned} von ${total} Mahlzeiten geplant</span></div>
        <button class="btn soft ps-shop" data-act="tab" data-view="shop">🛒 ${S.shop.length} ${S.shop.length === 1 ? 'Artikel' : 'Artikel'}</button></div>
      <div class="progress"><i style="width:${total ? Math.round(planned / total * 100) : 0}%"></i></div>
      ${missing ? `<button class="btn primary ps-miss" data-act="planToShop">🛒 Zutaten für ${missing} ${missing === 1 ? 'Gericht' : 'Gerichte'} auf die Liste</button>` : ''}
      <div class="ps-acts">
        <button class="btn" data-act="weekRandom">🎲 Auffüllen</button>
        <button class="btn" data-act="weekAnalysis" ${planned ? '' : 'disabled'}>${ICON.chart}<span>Analyse</span></button>
        <button class="btn" data-act="weekClear" ${planned ? '' : 'disabled'}>🧹 Leeren</button>
      </div></section>`;
  const pastN = ui.showPast ? PAST_MAX : 0;
  h += `<button class="pastbtn" data-act="togglePast">${ui.showPast ? '▾ Vergangene Tage ausblenden' : `▸ Letzte ${PAST_MAX} Tage einblenden`}</button>`;
  let days = '';
  for (let i = -pastN; i < ui.ahead; i++) days += dayHTML(addDays(t, i), i, meals);
  h += `<div class="week">${days}</div>
    <button class="btn plain moredays" data-act="moreDays">＋ Weitere 7 Tage anzeigen</button>
    <p class="small muted" style="text-align:center;margin-top:10px">Angaben pro Person · Balken = Anteil am Tagesziel (${fmtInt(goals().kcal)} kcal) · Gerichte lassen sich durch Ziehen verschieben</p>`;
  return h;
}

/* ── Plan ↔ Einkaufsliste ──
   Jedes geplante Rezept bringt seine Zutaten automatisch auf die Liste (außer „nicht einkaufen“).
   Die Mengen merken sich ihren Platz im Plan (q.w = "Datum|Mahlzeit"); so lassen sie sich beim
   Entfernen, Verschieben oder Ändern der Portionen gezielt anpassen. Gekauftes bleibt gekauft. */
const slotKey = (d, m) => `${d}|${m}`;
function unlinkSlot(key) {
  S.shop = S.shop.filter(it => {
    const q = Array.isArray(it.q) ? it.q : [];
    if (!q.some(x => x.w === key) && it.w !== key) return true;
    const gone = q.filter(x => x.w === key).map(x => x.n).filter(Boolean);
    it.q = q.filter(x => x.w !== key);
    const left = new Set(it.q.map(x => x.n).filter(Boolean));
    it.src = (it.src || []).filter(n => !gone.includes(n) || left.has(n));
    if (it.w === key) { const other = it.q.find(x => x.w); if (!other && !it.q.length) return false; it.w = other ? other.w : null; }
    return !(it.w && !it.q.length);
  });
}
function linkSlot(d, m) {
  const key = slotKey(d, m); unlinkSlot(key);
  const e = S.plan[d] && S.plan[d][m];
  if (!e || !e.r || e.b === false || d < dkey(new Date())) return 0;
  const r = recipeById(e.r); if (!r) return 0;
  const items = recipeItems(r, e.s || r.servings);
  addToShop(items, key);
  e.sh = 1;
  return items.length;
}
// Verschieben: Mengen wandern mit, nichts wird neu eingekauft
function rekeySlots(a, b) {
  const sw = w => (w === a ? b : w === b ? a : w);
  for (const it of S.shop) { if (it.w) it.w = sw(it.w); for (const q of it.q || []) if (q.w) q.w = sw(q.w); }
}
function rescaleSlot(key, f) { for (const it of S.shop) for (const q of it.q || []) if (q.w === key) q.a *= f; }
// Geplante Gerichte ab heute, deren Zutaten noch nicht übernommen wurden
function missingPlanEntries() {
  const today = dkey(new Date()), out = [];
  for (const [d, day] of Object.entries(S.plan)) if (d >= today) for (const [m, e] of Object.entries(day)) if (e && e.r && e.b !== false && !e.sh && recipeById(e.r)) out.push([d, m]);
  return out;
}

/* ── Rezepte ── */
const SORT_LABELS = [['name', 'Name'], ['ns', 'Nutri-Score'], ['veg', 'Gemüse-Anteil'], ['time', 'Zubereitungszeit'], ['kcal', 'Kalorien'], ['protein', 'Eiweiß (g)'], ['pp', 'Protein-Anteil']];
// Zusatzfilter (nur für diese Sitzung); gemiedene Allergene und Ernährungsweise stehen in den Einstellungen
const FILTER_DEF = {
  time: { label: 'Zubereitungszeit', opts: [['', 'Egal'], ['15', 'bis 15 Min.'], ['30', 'bis 30 Min.'], ['45', 'bis 45 Min.']] },
  ns: { label: 'Nutri-Score (geschätzt)', opts: [['', 'Egal'], ['A', 'nur A'], ['B', 'A oder B'], ['C', 'A bis C']] },
  veg: { label: 'Gemüse & Obst pro Portion', opts: [['', 'Egal'], ['1', 'ab 1 Portion'], ['2', 'ab 2 Portionen'], ['3', 'ab 3 Portionen']] },
  kcal: { label: 'Kalorien pro Portion', opts: [['', 'Egal'], ['400', 'bis 400 kcal'], ['600', 'bis 600 kcal'], ['800', 'bis 800 kcal']] },
};
function filterTests() {
  const f = ui.f || {}, t = [];
  if (ui.kind) t.push(r => kindOf(r) === ui.kind);
  if (f.time) t.push(r => r.time && r.time <= +f.time);
  if (f.ns) t.push(r => { const n = nutr(r).ns; return !!n && n.grade <= f.ns; });
  if (f.veg) t.push(r => nutr(r).vegPortions >= +f.veg);
  if (f.kcal) t.push(r => nutr(r).kcal > 0 && nutr(r).kcal <= +f.kcal);
  if (ui.strict) t.push(suits);
  return t;
}
const activeFilters = () => Object.values(ui.f || {}).filter(Boolean).length + (ui.strict ? 1 : 0);
function viewRecipes() {
  const nf = activeFilters();
  return `<div class="rtools"><div class="search">${ICON.search}<input id="rq" type="search" placeholder="Rezept oder Zutat suchen" value="${esc(ui.q)}" autocomplete="off" aria-label="Rezepte oder Zutaten suchen"></div>
    <button class="btn filterbtn${nf ? ' on' : ''}" data-act="filterOpen" aria-label="Filter">${ICON.filter}<span>Filter</span>${nf ? `<i>${nf}</i>` : ''}</button></div>
    <div class="seg kindseg" id="rkind">${[['', 'Alle'], ['main', 'Hauptgerichte'], ['breakfast', 'Frühstück'], ['snack', 'Snacks'], ['dessert', 'Desserts']].map(([k, l]) => `<button type="button" data-act="kindTab" data-v="${k}" class="${ui.kind === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="chips${ui.chipsAll ? ' all' : ''}" id="rtags"></div>
    <div class="listbar"><span class="small muted"><span id="rcount"></span><button class="tlink chipmore" data-act="chipsToggle">${ui.chipsAll ? 'Weniger Kategorien' : 'Alle Kategorien'}</button></span>
      <label class="sortsel"><span>Sortieren:</span><select data-change="sort">
        ${SORT_LABELS.map(([k, l]) => `<option value="${k}" ${S.ui.sort === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select></label></div>
    <div class="list rgrid" id="rlist"></div>`;
}
function tagCounts() {
  const m = new Map();
  allRecipes().forEach(r => (r.tags || []).forEach(t => m.set(t, (m.get(t) || 0) + 1)));
  return [...m.entries()].filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}
// Suche: mehrere Wörter müssen alle vorkommen (Name, Kategorie oder Zutat) – „pasta tomate“ findet beides zusammen
const _hay = new WeakMap();
function searchText(r) {
  let h = _hay.get(r);
  if (!h) { h = [r.name, ...(r.tags || []), ...r.ingredients.map(i => i.name)].join(' · ').toLowerCase(); _hay.set(r, h); }
  return h;
}
function matcher(q) {
  const terms = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  return terms.length ? r => { const h = searchText(r); return terms.every(t => h.includes(t)); } : () => true;
}
const NS_RANK = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const RECIPE_SORTS = {
  name: (a, b) => a.name.localeCompare(b.name, 'de'),
  time: (a, b) => (a.time || 999) - (b.time || 999),
  kcal: (a, b) => nutr(a).kcal - nutr(b).kcal,
  protein: (a, b) => nutr(b).p - nutr(a).p,
  pp: (a, b) => nutr(b).pp - nutr(a).pp,
  ns: (a, b) => ((nutr(a).ns ? nutr(a).ns.score : 99) - (nutr(b).ns ? nutr(b).ns.score : 99)) || nutr(b).vegPortions - nutr(a).vegPortions,
  veg: (a, b) => nutr(b).vegPortions - nutr(a).vegPortions,
};
function filteredRecipes() {
  const match = matcher(ui.q), tag = ui.tag, tests = filterTests();
  const list = allRecipes().filter(r => {
    if (tag) {
      if (SMART[tag]) { if (!SMART[tag].test(r)) return false; }
      else if (!(r.tags || []).includes(tag)) return false;
    }
    return tests.every(t => t(r)) && match(r);
  });
  const sorter = RECIPE_SORTS[S.ui.sort] || RECIPE_SORTS.name;
  return list.sort((a, b) => (isFav(b.id) - isFav(a.id)) || sorter(a, b));
}
const fmtDec = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('de-DE');
function recipeMeta(r) {
  const n = nutr(r);
  return [r.time ? `⏱ ${esc(r.time)} Min.` : '', n.kcal ? `${fmtInt(n.kcal)} kcal` : '', n.kcal ? `${fmtInt(n.p)} g Eiweiß` : ''].filter(Boolean).join(' · ');
}
// Kleine Merkmale unter dem Namen: Nutri-Score, Ernährung, Gemüse, Warnung bei gemiedenen Allergenen
function recipeBadges(r) {
  const n = nutr(r), bad = badAllergens(r), out = [];
  if (n.ns) out.push(nsBadge(n));
  out.push(n.fish ? '<span class="tag">🐟 Fisch</span>' : n.vegan ? '<span class="tag ok">🌱 Vegan</span>' : '<span class="tag">🥕 Veggie</span>');
  if (n.vegPortions >= 1.5) out.push(`<span class="tag ok">🥦 ${fmtDec(n.vegPortions)} Port.</span>`);
  if (bad.length) out.push(`<span class="tag warn" title="Enthält gemiedene Allergene">⚠ ${bad.map(a => ALLERGENS[a].short).join(', ')}</span>`);
  return out.join('');
}
// Lange Listen stückweise aufbauen: sofort sichtbar, der Rest kommt beim Scrollen nach
function chunked(el, list, html, size = 48) {
  if (el._io) { el._io.disconnect(); el._io = null; }
  let n = 0;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) more(); }, { rootMargin: '800px' }) : null;
  el._io = io;
  function more() {
    const old = el.querySelector(':scope > .more-btn'); if (old) { if (io) io.unobserve(old); old.remove(); }
    const part = list.slice(n, n + size); n += part.length;
    el.insertAdjacentHTML('beforeend', part.map(html).join('') + (n < list.length ? `<button type="button" class="btn plain more-btn">Weitere anzeigen (${list.length - n})</button>` : ''));
    const btn = el.querySelector(':scope > .more-btn');
    if (btn) { btn.addEventListener('click', more); if (io) io.observe(btn); }
  }
  el.innerHTML = '';
  more();
}
const recipeCard = r => `<button class="card rcard" data-act="recipeOpen" data-id="${esc(r.id)}">
    ${thumbHTML(r, 'rthumb')}
    <span class="rbody"><b>${esc(r.name)}</b><small>${recipeMeta(r)}</small><span class="rtags">${recipeBadges(r)}</span></span>
    ${isFav(r.id) ? '<span class="fav" aria-label="Favorit">♥</span>' : ''}</button>`;
function filterSummary() {
  const out = [];
  for (const [k, d] of Object.entries(FILTER_DEF)) { const v = (ui.f || {})[k]; if (v) out.push([k, d.opts.find(o => o[0] === v)[1]]); }
  if (ui.strict) out.push(['strict', 'Passend zu meiner Ernährung']);
  return out;
}
function renderRecipeList() {
  const tags = tagCounts();
  if (ui.tag && !SMART[ui.tag] && !tags.includes(ui.tag)) ui.tag = '';
  const chips = [['', 'Alle'], ...Object.entries(SMART).map(([k, v]) => [k, v.label]), ...tags.map(t => [t, t])];
  if (ui.tag && !SMART[ui.tag]) { const i = chips.findIndex(c => c[0] === ui.tag); if (i > 0) chips.splice(1, 0, chips.splice(i, 1)[0]); } // gewählte Kategorie bleibt sichtbar
  const fs = filterSummary().map(([k, l]) => `<button class="chip fchip" data-act="filterClear" data-k="${k}" aria-label="Filter ${esc(l)} entfernen">${esc(l)} ✕</button>`).join('');
  $('#rtags').innerHTML = fs + chips.map(([k, l]) => `<button class="chip${ui.tag === k ? ' on' : ''}" data-act="tagFilter" data-tag="${esc(k)}">${esc(l)}</button>`).join('');
  const fb = $('.filterbtn'); if (fb) { const nf = activeFilters(); fb.classList.toggle('on', !!nf); fb.innerHTML = `${ICON.filter}<span>Filter</span>${nf ? `<i>${nf}</i>` : ''}`; }
  const list = filteredRecipes();
  $('#rcount').textContent = `${list.length} ${list.length === 1 ? 'Rezept' : 'Rezepte'}`;
  const el = $('#rlist');
  if (!list.length) {
    if (el._io) { el._io.disconnect(); el._io = null; }
    el.innerHTML = `<div class="empty"><div class="big">🔍</div><b>Nichts gefunden</b>Versuch einen anderen Suchbegriff oder Filter.${ui.q || ui.tag || activeFilters() ? '<br><button class="btn soft" data-act="recipeResetFilter" style="margin:14px auto 0">Suche & Filter zurücksetzen</button>' : ''}</div>`;
    return;
  }
  chunked(el, list, recipeCard);
}
function openFilters() {
  const f = ui.f || {}, av = avoidList();
  const sh = openSheet({
    title: 'Rezepte filtern', left: '<button class="lnk" data-act="filterReset">Zurücksetzen</button>',
    right: '<button class="lnk r" data-act="closeSheet">Fertig</button>',
    body: `${Object.entries(FILTER_DEF).map(([k, d]) => `<div class="field"><label>${d.label}</label><div class="seg wrap" data-filter="${k}">${d.opts.map(([v, l]) => `<button type="button" data-act="filterSet" data-k="${k}" data-v="${v}" class="${(f[k] || '') === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>`).join('')}
      <div class="section-t" style="margin-top:6px">Meine Ernährung</div>
      <div class="card">
        <label class="setting"><span><span class="lbl">Nur passende Rezepte</span><br><span class="sub">${esc(DIETS[dietOf()])}${av.length ? ' · ohne ' + av.map(a => ALLERGENS[a].short).join(', ') : ''}</span></span><span class="switch"><input type="checkbox" data-change="strict" ${ui.strict ? 'checked' : ''}><i></i></span></label>
      </div>
      <p class="small muted" style="margin:8px 4px 0">Ernährungsweise und gemiedene Allergene stellst du unter „Mehr → Ziele & Ernährung“ ein. Sie gelten auch für Vorschläge und „Auffüllen“.</p>
      <button class="btn soft" data-act="goalsOpen" style="width:100%;margin-top:12px">Ziele & Ernährung bearbeiten</button>
      <p class="small muted filter-count" style="text-align:center;margin-top:14px"></p>`,
    onClose: () => { if (S.ui.view === 'recipes') renderRecipeList(); },
  });
  drawFilterCount(sh);
}
function drawFilterCount(sh) { const el = sh && $('.filter-count', sh); if (el) { const n = filteredRecipes().length; el.textContent = `${n} ${n === 1 ? 'Rezept passt' : 'Rezepte passen'}`; } }

/* ── Einkaufsliste (Bring!-Stil) ── */
const stem = n => { const k = nameKey(n); return k === 'ei' ? 'eier' : k.replace(/(en|n|e|s)$/, ''); };
function decorate(it) {
  const f = matchFood(it.name);
  it.fid = f ? f.id : null;
  if (!it.cat) it.cat = f ? f.cat : guessCat(it.name);
  it.emoji = f ? f.emoji : DEPT_BY[deptOf(it)].e;
  return it;
}
function qtyText(it) {
  if (it.note) return it.note;
  const by = {};
  for (const q of it.q || []) by[q.u] = (by[q.u] || 0) + q.a;
  return Object.entries(by).map(([u, a]) => fmtAmount(COUNTABLE.includes(u) ? Math.max(1, Math.ceil(a - 0.01)) : a, u)).join(' + ');
}
function findItem(name, fid) {
  const s = stem(name);
  return S.shop.find(i => stem(i.name) === s) || (fid != null ? S.shop.find(i => i.fid === fid) : null);
}
function addQty(it, a, u, w, n) {
  if (a == null) return;
  const b = toBase(a, u), unit = b.unit || '';
  const q = it.q.find(x => x.u === unit && (x.w || null) === (w || null));
  if (q) q.a += b.amount; else it.q.push(n ? { a: b.amount, u: unit, w: w || null, n } : { a: b.amount, u: unit, w: w || null });
}
function addToShop(items, w = null) {
  let added = 0;
  for (const x of items) {
    let it = findItem(x.name);
    if (!it) {
      it = decorate({ id: uid(), name: x.display || shortName(x.name) || x.name, cat: null, q: [], note: '', src: [], w });
      S.shop.push(it); added++;
    } else if (!w) it.w = null;
    addQty(it, x.amount, x.unit, w, w && x.src ? x.src[0] : undefined);
    for (const s of x.src || []) if (!it.src.includes(s)) it.src.push(s);
  }
  return added;
}
function pushRecent(it) {
  const s = stem(it.name);
  S.recent = [{ name: it.name }, ...S.recent.filter(r => stem(r.name) !== s)].slice(0, 30);
}
function buyItem(it) {
  const idx = S.shop.indexOf(it); if (idx < 0) return;
  S.shop.splice(idx, 1); pushRecent(it); save();
  if (navigator.vibrate) navigator.vibrate(8);
  renderShop();
  toast(`${it.name} erledigt`, { label: 'Rückgängig', fn: () => { S.shop.splice(Math.min(idx, S.shop.length), 0, it); save(); renderShop(); } });
}
function pantrySet() { return new Set(S.settings.pantry.split('\n').map(s => s.trim().toLowerCase()).filter(Boolean)); }
// Vorrat („Immer zuhause“) auch über das Lebensmittel erkennen: „Wasser“ trifft „lauwarmes Wasser“, „Salz“ trifft „Meersalz“
function pantryFoods(set) { const ids = new Set(); for (const n of set) { const f = matchFood(n); if (f) ids.add(f.id); } return ids; }
function inPantry(name, set, ids) {
  if (set.has(nameKey(name)) || set.has(name.toLowerCase())) return true;
  const f = matchFood(name); return !!f && ids.has(f.id);
}
// Kurzname eines Gerichts für die Einkaufsliste („Gemüse-Curry mit Kichererbsen“ → „Gemüse-Curry“)
const shortDish = n => String(n).split(/ mit | in | auf | \(|,/)[0].trim() || n;
function recipeItems(r, servings, skipPantry = true) {
  const f = servings / (r.servings || 1), pantry = skipPantry ? pantrySet() : new Set(), ids = pantryFoods(pantry);
  return r.ingredients.filter(i => !inPantry(i.name, pantry, ids))
    .map(i => ({ name: i.name, amount: i.amount != null ? i.amount * f : null, unit: i.unit, src: [r.name] }));
}
function parseQuery(q) {
  q = q.trim();
  let p = parseIng(q) || { name: q, amount: null, unit: '' };
  if (p.amount == null) { // "Milch 2 l"
    const m = q.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜ]*)\.?$/);
    if (m && (!m[3] || UNIT_MAP[m[3].toLowerCase()])) p = { name: m[1], amount: parseAmount(m[2]), unit: m[3] ? UNIT_MAP[m[3].toLowerCase()] : '' };
  }
  p.name = p.name.charAt(0).toUpperCase() + p.name.slice(1);
  return p;
}
// buy = Artikel auf der Liste (zum Abhaken), on = im Katalog schon auf der Liste
function tileHTML({ emoji, name, spec, on, buy, dish, data }) {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  return `<button class="tile${buy ? ' buy' : on ? ' on' : ''}" data-act="tile" ${attrs}${on && !buy ? ' aria-label="' + esc(name) + ' – steht schon auf der Liste"' : ''}><span class="te">${esc(emoji)}</span><span class="tn">${esc(name)}</span>${spec ? `<span class="ts">${esc(spec)}</span>` : ''}${dish ? `<span class="td">${esc(dish)}</span>` : ''}</button>`;
}
function viewShop() {
  return `<div class="search">${ICON.search}<input id="sq" type="search" placeholder="Was brauchst du?" value="${esc(ui.sq)}" autocomplete="off" enterkeyhint="done" aria-label="Artikel suchen oder hinzufügen"></div><div id="shoparea"></div>`;
}
function renderShop() {
  const el = $('#shoparea'); if (!el) return;
  const onF = new Set(S.shop.map(i => i.fid).filter(x => x != null));
  const onS = new Set(S.shop.map(i => stem(i.name)));
  const isOn = (fid, name) => (fid != null && onF.has(fid)) || onS.has(stem(name));
  const q = ui.sq.trim();
  if (q) {
    const p = parseQuery(q), lq = p.name.toLowerCase();
    const spec = p.amount != null ? fmtAmount(toBase(p.amount, p.unit).amount, toBase(p.amount, p.unit).unit) : '';
    const hits = FOODS.filter(f => f.name.toLowerCase().includes(lq) || f.keys.some(k => k.includes(lq)))
      .sort((a, b) => (b.name.toLowerCase().startsWith(lq) - a.name.toLowerCase().startsWith(lq)) || a.name.localeCompare(b.name, 'de')).slice(0, 30);
    const exact = hits.some(f => f.name.toLowerCase() === lq);
    const qd = p.amount != null ? { a: p.amount, u: p.unit } : {};
    let h = '<div class="tiles">';
    if (!exact) h += tileHTML({ emoji: DEPT_BY[guessDept(p.name)].e, name: p.name, spec: spec || 'Neu', on: isOn(null, p.name), data: { n: p.name, ...qd } });
    h += hits.map(f => tileHTML({ emoji: f.emoji, name: f.name, spec, on: isOn(f.id, f.name), data: { f: f.id, ...qd } })).join('');
    el.innerHTML = h + '</div><p class="small muted" style="margin:10px 4px">Tipp: Menge mit eingeben, z. B. „2 l Milch“ oder „Äpfel 6“. Enter fügt den ersten Treffer hinzu.</p>';
    return;
  }
  // Links: was zu kaufen ist · Rechts (auf großen Bildschirmen daneben): zuletzt verwendet und Katalog
  let left = '', right = '';
  if (S.shop.length) {
    // Nach Abteilungen gruppiert – in der Reihenfolge des eigenen Supermarkts (einstellbar unter „Mehr“)
    left += `<div class="shead"><b>Zu kaufen</b><span>${S.shop.length} Artikel · <button class="tlink" data-act="shopClear">Liste leeren</button></span></div>`;
    const dish = showDish();
    for (const d of deptOrder()) {
      const items = S.shop.filter(i => deptOf(i) === d.k); if (!items.length) continue;
      items.sort((a, b) => a.name.localeCompare(b.name, 'de'));
      left += `<div class="catlbl"><span>${d.e}</span>${d.name}<i>${items.length}</i></div><div class="tiles">${items.map(i => tileHTML({ emoji: i.emoji || d.e, name: i.name, spec: qtyText(i), buy: true, dish: dish ? [...new Set((i.src || []).map(shortDish))].join(' · ') : '', data: { i: i.id } })).join('')}</div>`;
    }
    left += `<p class="small muted" style="margin:10px 4px 0">Tippen = gekauft · Gedrückt halten (oder Rechtsklick) = Menge, Abteilung & Details</p>`;
  } else {
    left += `<div class="sempty"><div class="big">🎉</div><b>Alles erledigt!</b><span>Tippe auf Artikel im Katalog oder suche oben, um sie hinzuzufügen.</span></div>`;
  }
  const miss = missingPlanEntries().length;
  if (miss) left += `<button class="btn soft" data-act="planToShop" style="width:100%;margin-top:14px">📅 Zutaten für ${miss} geplante${miss === 1 ? 's Gericht' : ' Gerichte'} holen</button>`;
  const recent = S.recent.filter(r => !isOn(null, r.name)).slice(0, 15);
  if (recent.length) {
    right += `<div class="shead"><b>Zuletzt verwendet</b></div><div class="tiles">`;
    right += recent.map(r => { const f = matchFood(r.name); return isOn(f && f.id, r.name) ? '' : tileHTML({ emoji: f ? f.emoji : DEPT_BY[guessDept(r.name)].e, name: r.name, data: { n: r.name } }); }).join('');
    right += '</div>';
  }
  right += `<div class="shead"><b>Katalog</b></div>`;
  for (const c of deptOrder()) {
    const foods = FOODS.filter(f => f.dept === c.k);
    if (!foods.length) continue;
    const open = !!S.ui.open[c.k];
    const n = foods.filter(f => isOn(f.id, f.name)).length;
    right += `<button class="cathead${open ? ' open' : ''}" data-act="catToggle" data-c="${c.k}" aria-expanded="${open}"><span>${c.e}</span><b>${c.name}</b>${n ? `<i>${n}</i>` : ''}<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`;
    if (open) right += '<div class="tiles cat">' + foods.map(f => tileHTML({ emoji: f.emoji, name: f.name, on: isOn(f.id, f.name), data: { f: f.id } })).join('') + '</div>';
  }
  el.innerHTML = `<div class="shopcols"><div class="shop-l">${left}</div><div class="shop-r">${right}</div></div>`;
}
function itemFromTile(t) {
  const { i, f, n } = t.dataset;
  if (i) return S.shop.find(x => x.id === i) || null;
  const fid = f != null && f !== '' ? +f : null;
  if (fid != null && !FOODS[fid]) return null;
  const name = fid != null ? FOODS[fid].name : n;
  return name ? findItem(name, fid) : null;
}
function addFromTile(t) {
  const { f, n, a, u } = t.dataset;
  const fid = f != null && f !== '' ? +f : null;
  const name = fid != null && FOODS[fid] ? FOODS[fid].name : n;
  if (!name) return null;
  addToShop([{ name, display: name, amount: a ? +a : null, unit: u || '' }]);
  return findItem(name, fid);
}
function openItemEdit(it) {
  const sh = openSheet({
    title: `${it.emoji || ''} ${it.name}`,
    right: `<button class="lnk r" data-act="itemSave">Sichern</button>`,
    body: `<form data-form="itemSave" autocomplete="off">
      <div class="field"><label for="e-name">Artikel</label><input id="e-name" value="${esc(it.name)}"></div>
      <div class="field"><label for="e-spec">Menge oder Beschreibung</label><input id="e-spec" value="${esc(qtyText(it))}" placeholder="z. B. 500 g, 2 Stk oder „bio“"></div>
      <div class="field"><label for="e-cat">Abteilung</label><select id="e-cat">${deptOrder().map(c => `<option value="${c.k}" ${c.k === deptOf(it) ? 'selected' : ''}>${c.e} ${c.name}</option>`).join('')}</select></div>
      ${(it.src || []).length ? `<p class="small muted" style="margin:0 4px 14px">Für: ${esc(it.src.join(', '))}</p>` : ''}
      <button class="btn primary" style="width:100%">Speichern</button>
      <div class="row" style="margin-top:8px"><button type="button" class="btn plain" data-act="itemBuy">✓ Gekauft</button><button type="button" class="btn danger" data-act="itemDelete">Entfernen</button></div></form>`,
  });
  sh.dataset.id = it.id;
}
function parseSpec(s) {
  s = s.trim();
  if (!s) return { q: [], note: '' };
  const parts = s.split('+').map(x => x.trim()).filter(Boolean);
  const q = [];
  for (const part of parts) {
    const m = part.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔])\s*(.*)$/);
    if (!m) return { q: [], note: s };
    const rest = m[2].trim().replace(/\.$/, '');
    const unit = rest ? (UNIT_MAP[rest.toLowerCase()] || PLURAL_REV[rest]) : '';
    if (rest && !unit) return { q: [], note: s };
    const b = toBase(parseAmount(m[1]), unit);
    q.push({ a: b.amount, u: b.unit || '', w: null });
  }
  return { q, note: '' };
}
const PLURAL_REV = Object.fromEntries(Object.entries(PLURAL).map(([a, b]) => [b, a]));

/* ── Mehr ── */
function viewMore() {
  const st = S.settings, snaps = snapshots(), online = window.Cloud && Cloud.isOn();
  return `<div class="morecols"><div>
  ${window.Cloud ? Cloud.section() : ''}
  <div class="section-t">Daten & Sicherheit</div>
  <div class="card menu">
    <button data-act="exportData"><span class="ico">💾</span>Backup-Datei exportieren</button>
    <button data-act="importData"><span class="ico">📂</span>Backup-Datei importieren</button>
    ${S.hidden.length ? `<button data-act="restoreHidden"><span class="ico">↩️</span>${S.hidden.length} ausgeblendete Rezepte zurückholen</button>` : ''}
    <button data-act="resetAll"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>
  <p class="small muted" style="margin:0 4px">${online ? 'Deine Daten liegen in der Online-Datenbank und zusätzlich auf diesem Gerät.' : 'Ohne Anmeldung (oben) liegen die Daten nur auf diesem Gerät.'} Eine Backup-Datei ab und zu (z. B. in iCloud Drive) schadet trotzdem nicht.</p>
  <div class="section-t">Sicherungen auf diesem Gerät</div>
  <div class="card menu snaps">
    ${snaps.map(x => `<button data-act="snapRestore" data-t="${x.t}"><span class="ico">🕘</span><span class="mtxt"><b>${fmtStamp(x.t)}</b><small>${esc(x.why || 'Sicherung')} · ${esc(snapInfo(x.data))}</small></span></button>`).join('')}
    <button data-act="snapNow"><span class="ico">➕</span>Jetzt sichern</button>
    ${lsGet(BAD_KEY) ? `<button data-act="retryBad"><span class="ico">🧩</span><span class="mtxt"><b>Beschädigten Datenstand erneut einlesen</b><small>Ein früherer Stand konnte nicht gelesen werden und wurde aufbewahrt.</small></span></button>` : ''}
  </div>
  <p class="small muted" style="margin:0 4px">Die App sichert automatisch einmal am Tag und vor jedem großen Eingriff (Import, Löschen). Antippen stellt den Stand wieder her.</p>
  </div><div>
  <div class="section-t" id="goals">Ziele & Ernährung</div>
  <div class="card">
    <div class="setting"><span><span class="lbl">Kalorien pro Tag</span><br><span class="sub">für Analyse & Tagesbalken im Plan</span></span>
      <span class="stepper"><button data-act="goalStep" data-k="kcal" data-n="-100" aria-label="Weniger">−</button><output>${fmtInt(goals().kcal)}</output><button data-act="goalStep" data-k="kcal" data-n="100" aria-label="Mehr">+</button></span></div>
    <div class="setting"><span><span class="lbl">Eiweiß pro Tag</span><br><span class="sub">Faustregel: 0,8–1,6 g je kg Körpergewicht</span></span>
      <span class="stepper"><button data-act="goalStep" data-k="protein" data-n="-5" aria-label="Weniger">−</button><output>${goals().protein} g</output><button data-act="goalStep" data-k="protein" data-n="5" aria-label="Mehr">+</button></span></div>
    <div class="setting col"><span class="lbl">Ernährungsweise</span>
      <div class="seg wrap">${Object.entries(DIETS).map(([k, l]) => `<button type="button" data-act="dietSet" data-v="${k}" class="${dietOf() === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <div class="setting col"><span><span class="lbl">Allergene & Unverträglichkeiten meiden</span><br><span class="sub">Rezepte damit werden markiert und nicht mehr vorgeschlagen</span></span>
      <div class="algpick">${ALLERGEN_KEYS.map(a => `<button type="button" class="chip${avoidList().includes(a) ? ' on' : ''}" data-act="avoidToggle" data-a="${a}">${ALLERGENS[a].e} ${ALLERGENS[a].short}</button>`).join('')}</div></div>
  </div>
  <div class="section-t">Wochenplan</div>
  <div class="card">
    ${MEALS.map(m => `<label class="setting"><span class="lbl">${m.name}</span><span class="switch"><input type="checkbox" data-change="mealToggle" data-m="${m.k}" ${st.meals.includes(m.k) ? 'checked' : ''}><i></i></span></label>`).join('')}
    <div class="setting"><span><span class="lbl">Standard-Portionen</span><br><span class="sub">für neue Einträge im Plan</span></span>
      <span class="stepper"><button data-act="defServ" data-n="-1" aria-label="Weniger">−</button><output>${st.servings}</output><button data-act="defServ" data-n="1" aria-label="Mehr">+</button></span></div>
  </div>
  <div class="section-t">Haushalt</div>
  <div class="card">
    <div class="setting col"><span><span class="lbl">Wer nutzt dieses Gerät?</span><br><span class="sub">Erledigte Routinen werden dieser Person zugerechnet (Übersicht „wer hat was gemacht“)</span></span>
      <div class="seg">${['', 'Fee', 'Flo'].map(w => `<button type="button" data-act="setMe" data-v="${w}" class="${(S.ui.who || '') === w ? 'on' : ''}">${w || 'Keine Angabe'}</button>`).join('')}</div></div>
    <button class="setting setbtn" data-act="rtCatalog"><span><span class="lbl">Routinen aus Vorschlägen wählen</span><br><span class="sub">${S.routines.length} Routinen aktiv · ${ROUTINE_TEMPLATES.length} Vorschläge</span></span><span class="chev">›</span></button>
  </div>
  <div class="section-t">Einkaufsliste</div>
  <div class="card">
    <label class="setting"><span><span class="lbl">Gericht unter der Zutat anzeigen</span><br><span class="sub">z. B. „Shakshuka · Linsensuppe“</span></span><span class="switch"><input type="checkbox" data-change="showDish" ${showDish() ? 'checked' : ''}><i></i></span></label>
    <button class="setting setbtn" data-act="deptOrder"><span><span class="lbl">Reihenfolge der Abteilungen</span><br><span class="sub">${deptOrder().slice(0, 4).map(d => d.e + ' ' + d.name.split(/[,:&]/)[0].trim()).join(' → ')} → …</span></span><span class="chev">›</span></button>
  </div>
  <div class="section-t">Rezepte</div>
  <div class="card">
    <label class="setting"><span><span class="lbl">Archivierte Varianten zeigen</span><br><span class="sub">${S.ui.archive ? 'Alle eingebauten Rezepte werden angezeigt' : `${archivedCount()} sehr ähnliche Rezepte sind ausgeblendet`}</span></span><span class="switch"><input type="checkbox" data-change="archive" ${S.ui.archive ? 'checked' : ''}><i></i></span></label>
  </div>
  <div class="section-t">Immer zuhause</div>
  <div class="card" style="padding:12px">
    <textarea id="pantry" data-change="pantry" rows="5" placeholder="Eine Zutat pro Zeile" aria-label="Zutaten, die immer zuhause sind">${esc(st.pantry)}</textarea>
    <p class="small muted" style="margin:8px 4px 0">Diese Zutaten werden beim Übernehmen aus dem Wochenplan übersprungen.</p>
  </div>
  <div class="section-t">Auf allen Geräten nutzen</div>
  <div class="card" style="padding:14px 16px;font-size:15px;line-height:1.55">
    <b>iPhone & iPad:</b> Seite in <b>Safari</b> öffnen → <b>Teilen</b> (□↑) → <b>„Zum Home-Bildschirm“</b>.<br>
    <b>Android & Computer:</b> im Browser-Menü <b>„App installieren“</b> bzw. <b>„Zum Startbildschirm“</b>.<br>
    <span class="muted small">Die App startet dann im Vollbild und funktioniert auch ohne Netz. Mit der Online-Datenbank ${online ? 'sind' : 'wären'} alle Geräte automatisch auf demselben Stand.</span>
  </div>
  </div></div>
  <p class="small muted" style="text-align:center;margin:24px 0 0">${allRecipes().length} Rezepte (${allRecipes().filter(isMainDish).length} Hauptgerichte) · ${allRecipes().filter(r => nutr(r).fish).length} mit Fisch · Essensplaner v${APP_VERSION} · <button class="tlink" data-act="diag">Diagnose</button> · <button class="tlink" data-act="credits">Bildnachweise</button><br>Nährwerte, Nutri-Score und Allergene sind automatisch aus den Zutaten geschätzt und ersetzen keine Packungsangaben.</p>`;
}

function openDeptOrder() {
  const sh = openSheet({
    title: 'Reihenfolge der Abteilungen', left: '<button class="lnk" data-act="deptReset">Standard</button>', right: '<button class="lnk r" data-act="closeSheet">Fertig</button>',
    body: `<p class="small muted" style="margin:0 4px 12px">So, wie du durch deinen Supermarkt gehst. In dieser Reihenfolge erscheint die Einkaufsliste.</p><div class="card deptlist"></div>`,
    onClose: () => { if (S.ui.view === 'shop' || S.ui.view === 'more') render(); },
  });
  drawDeptOrder(sh);
}
function drawDeptOrder(sh) {
  const el = sh && $('.deptlist', sh); if (!el) return;
  const list = deptOrder();
  el.innerHTML = list.map((d, i) => `<div class="deptrow"><span class="dnum">${i + 1}</span><span class="de">${d.e}</span><span class="dname">${esc(d.name)}</span>
    <button data-act="deptMove" data-k="${d.k}" data-n="-1" aria-label="${esc(d.name)} nach oben" ${i ? '' : 'disabled'}>▲</button><button data-act="deptMove" data-k="${d.k}" data-n="1" aria-label="${esc(d.name)} nach unten" ${i < list.length - 1 ? '' : 'disabled'}>▼</button></div>`).join('');
}

/* ───────── Plan-Aktionen ───────── */
// shop: Zutaten automatisch auf die Liste bringen bzw. von ihr nehmen (Standard). Gibt die Zahl der Zutaten zurück.
function setEntry(d, m, e, { shop = true } = {}) {
  S.plan[d] = S.plan[d] || {};
  if (e) S.plan[d][m] = e; else { delete S.plan[d][m]; if (!Object.keys(S.plan[d]).length) delete S.plan[d]; }
  const n = shop ? linkSlot(d, m) : 0;
  save();
  return n;
}
const plannedMsg = (n, base = 'Eingeplant') => n ? `${base} · ${n} ${n === 1 ? 'Zutat' : 'Zutaten'} auf der Einkaufsliste` : base;
// Zwei Plätze im Plan tauschen bzw. ein Gericht auf einen freien Platz schieben – die Einkaufsmengen wandern mit
function swapSlots(d, m, to, tm) {
  const a = S.plan[d]?.[m], b = S.plan[to]?.[tm];
  setEntry(to, tm, a || null, { shop: false }); setEntry(d, m, b || null, { shop: false });
  rekeySlots(slotKey(d, m), slotKey(to, tm)); save();
}
function moveEntry(d, m, to, tm) {
  if (d === to && m === tm) return false;
  const a = S.plan[d]?.[m], b = S.plan[to]?.[tm];
  if (!a) return false;
  swapSlots(d, m, to, tm);
  render();
  toast(b ? 'Getauscht' : 'Verschoben', { label: 'Rückgängig', fn: () => { swapSlots(d, m, to, tm); render(); } });
  return true;
}
function stepperHTML(id, val, label = 'Portionen') {
  return `<div class="setting card" style="margin-bottom:14px"><span class="lbl">${label}</span><span class="stepper" data-stepper="${id}"><button data-act="step" data-n="-1" aria-label="Weniger">−</button><output>${val}</output><button data-act="step" data-n="1" aria-label="Mehr">+</button></span></div>`;
}
const buySwitchHTML = (on = true) => `<div class="card" style="margin-bottom:14px"><label class="setting"><span><span class="lbl">🛒 Zutaten einkaufen</span><br><span class="sub">kommen automatisch auf die Einkaufsliste</span></span><span class="switch"><input type="checkbox" class="buysw" ${on ? 'checked' : ''}><i></i></span></label></div>`;
const buyChecked = sh => { const c = sh && $('.buysw', sh); return !c || c.checked; };
const PICK_KINDS = [['main', 'Hauptgerichte'], ['breakfast', 'Frühstück'], ['sd', 'Snacks & Desserts'], ['all', 'Alle']];
const pickKindTest = k => (k === 'all' ? () => true : k === 'sd' ? isSnackOrDessert : r => kindOf(r) === k);
function openRecipePicker(title, onPick, mealKey) {
  const def = mealKey === 'f' ? 'breakfast' : mealKey === 's' ? 'sd' : 'main';
  const sh = openSheet({
    title,
    body: `<div class="search">${ICON.search}<input id="pq" type="search" placeholder="Rezept oder Zutat suchen" autocomplete="off" aria-label="Rezept suchen"></div>
      <div class="seg wrap" id="pkind" style="margin-bottom:12px">${PICK_KINDS.map(([k, l]) => `<button type="button" data-act="pickKind" data-v="${k}" class="${k === def ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="pickopts">${stepperHTML('pickServ', S.settings.servings)}${buySwitchHTML(true)}</div>
      <form class="addbar" data-form="pickText" style="margin-bottom:14px"><input id="pt" placeholder="Oder eigener Eintrag, z. B. Reste" enterkeyhint="done" aria-label="Eigener Eintrag"><button class="btn soft" style="font-size:15px;width:auto;padding:0 14px">OK</button></form>
      <div class="card" style="padding:2px 12px" id="plist"></div>`,
  });
  pending.pick = onPick;
  sh.dataset.kind = def;
  sh._draw = () => {
    const match = matcher($('#pq', sh).value), q = $('#pq', sh).value.trim(), kt = pickKindTest(sh.dataset.kind);
    // Beim Suchen in allen Arten suchen, sonst nur in der gewählten
    const list = allRecipes().filter(r => (q || kt(r)) && match(r))
      .sort((a, b) => (suits(b) - suits(a)) || (isFav(b.id) - isFav(a.id)) || (kt(b) - kt(a)) || a.name.localeCompare(b.name, 'de'));
    const el = $('#plist', sh);
    if (!list.length) { el.innerHTML = `<p class="muted" style="padding:16px 4px">Keine Rezepte gefunden.</p>`; return; }
    chunked(el, list, r => `<button class="pick${suits(r) ? '' : ' unsuit'}" data-act="pickRecipe" data-id="${esc(r.id)}">${thumbHTML(r, 'pthumb')}<span class="rbody"><b>${esc(r.name)}</b><small>${recipeMeta(r)}</small><span class="rtags">${recipeBadges(r)}</span></span>${isFav(r.id) ? '<span class="fav">♥</span>' : ''}</button>`, 40);
  };
  $('#pq', sh).addEventListener('input', sh._draw);
  sh._draw();
}
function stepperVal(sh, id) { const o = sh && $(`[data-stepper="${id}"] output`, sh); return o ? +o.textContent || 1 : S.settings.servings; }

/* ───────── Rezept-Detail & Editor ───────── */
// Referenzmengen pro Tag (EU-Lebensmittelinformationsverordnung; Ballaststoffe nach DGE). Energie & Eiweiß aus den eigenen Zielen.
const RI = { f: 70, sfa: 20, c: 260, sug: 90, fib: 30, salt: 6 };
const NUT_ROWS = [
  ['kcal', 'Energie', 'kcal'], ['f', 'Fett', 'g'], ['sfa', 'davon gesättigte Fettsäuren', 'g', true], ['c', 'Kohlenhydrate', 'g'],
  ['sug', 'davon Zucker', 'g', true], ['fib', 'Ballaststoffe', 'g'], ['p', 'Eiweiß', 'g'], ['salt', 'Salz', 'g'],
];
const riOf = k => (k === 'kcal' ? goals().kcal : k === 'p' ? goals().protein : RI[k]);
const LVL_TXT = { good: 'niedrig', mid: 'mittel', bad: 'hoch' };
function nutTableHTML(n, basis) {
  const per = basis === '100' ? n.per100 : n;
  return `<table class="nutt"><thead><tr><th></th><th>${basis === '100' ? 'je 100 g' : 'pro Portion'}</th>${basis === '100' ? '<th>Ampel</th>' : '<th>% Tagesbedarf*</th>'}</tr></thead><tbody>
    ${NUT_ROWS.map(([k, l, u, sub]) => {
      const v = per[k] || 0;
      const val = k === 'kcal' ? `${fmtInt(v)} kcal <small>${fmtInt(v * 4.184)} kJ</small>` : `${k === 'salt' || v < 10 ? fmtDec(v) : fmtInt(v)} ${u}`;
      let extra = '';
      if (basis === '100') { const tk = { f: 'f', sfa: 'sfa', sug: 'sug', salt: 'salt' }[k]; extra = tk ? `<span class="amp ${trafficLevel(tk, v)}">${LVL_TXT[trafficLevel(tk, v)]}</span>` : ''; }
      else { const pct = v / riOf(k) * 100; extra = `<span class="ri"><i style="width:${Math.min(100, pct)}%" class="${(k === 'salt' || k === 'sfa' || k === 'sug') && pct > 40 ? 'hi' : ''}"></i></span><b>${fmtInt(pct)} %</b>`; }
      return `<tr class="${sub ? 'sub' : ''}"><td>${l}</td><td>${val}</td><td>${extra}</td></tr>`;
    }).join('')}</tbody></table>
    <p class="small muted" style="margin:8px 2px 0">${basis === '100' ? 'Ampel nach den Grenzwerten der Lebensmittel-Ampel (je 100 g).' : `*Referenzmenge für Erwachsene; Energie (${fmtInt(goals().kcal)} kcal) und Eiweiß (${goals().protein} g) nach deinen Zielen.`} Gewicht einer Portion ca. ${fmtInt(n.weight)} g (gegart).</p>`;
}
// Welche Zutaten tragen am meisten bei? (für Kalorien, Salz, gesättigte Fette, Zucker)
function contributors(r, key) {
  const rows = [];
  for (const ing of r.ingredients) {
    const fd = matchFood(ing.name); if (!fd) continue;
    if (ing.amount == null) { if (key === 'salt' && /^salz\b/i.test(ing.name)) rows.push({ name: 'Salz zum Abschmecken', v: SALT_PINCH * (r.servings || 1) }); continue; }
    const v = (fd[key] || 0) * ingGrams(ing, fd) / 100;
    if (v > 0) rows.push({ name: shortName(ing.name), v });
  }
  const total = rows.reduce((a, x) => a + x.v, 0) || 1;
  return rows.sort((a, b) => b.v - a.v).slice(0, 3).map(x => ({ ...x, share: x.v / total * 100 })).filter(x => x.share >= 8);
}
// Verständliche Hinweise aus den Zahlen
function insights(r, n) {
  const out = [], main = isMainDish(r), mealKcal = goals().kcal / Math.max(2, S.settings.meals.length), top = k => (contributors(r, k)[0] || {}).name;
  if (n.coverage < 0.9) out.push(['info', 'Einige Zutaten wurden nicht erkannt – die Werte sind daher eher zu niedrig.']);
  if (n.salt > 2.5) out.push(['warn', `Recht salzig: ${fmtDec(n.salt)} g pro Portion (${fmtInt(n.salt / 6 * 100)} % der Tagesmenge).${top('salt') ? ` Größte Quelle: ${top('salt')} – sparsam dosieren.` : ''}`]);
  if (n.sfa > 10) out.push(['warn', `Viel gesättigtes Fett (${fmtDec(n.sfa)} g).${top('sfa') ? ` Hauptquelle: ${top('sfa')} – z. B. teilweise durch Joghurt, Skyr oder Öl ersetzen.` : ''}`]);
  if (n.sug > 25) out.push(['warn', `Viel Zucker: ${fmtInt(n.sug)} g pro Portion.${top('sug') ? ` Hauptquelle: ${top('sug')}.` : ''}`]);
  if (main && n.vegPortions < 1) out.push(['info', 'Wenig Gemüse – ein Salat oder Rohkost dazu macht das Essen ausgewogener.']);
  if (n.vegPortions >= 2.5) out.push(['good', `Viel Gemüse & Obst: ${fmtDec(n.vegPortions)} von 5 Portionen für den Tag.`]);
  if (main && n.p < 15 && n.kcal > 250) out.push(['info', 'Eher wenig Eiweiß – mit Hülsenfrüchten, Tofu, Ei oder Skyr ergänzen.']);
  if (n.pp >= 25) out.push(['good', `Proteinreich: ${Math.round(n.pp)} % der Kalorien aus Eiweiß (${fmtInt(n.p)} g).`]);
  if (n.fib >= 8) out.push(['good', `Reich an Ballaststoffen (${fmtInt(n.fib)} g ≈ ${fmtInt(n.fib / 30 * 100)} % des Tagesbedarfs).`]);
  if (main && n.kcal) {
    const d = n.kcal / mealKcal;
    out.push([d > 1.35 ? 'warn' : 'info', `${fmtInt(n.kcal)} kcal ≈ ${fmtInt(n.kcal / goals().kcal * 100)} % deines Tagesziels${d > 1.35 ? ' – eher üppig für eine Mahlzeit' : d < 0.55 ? ' – eher leicht, ggf. Beilage ergänzen' : ''}.`]);
  }
  return out;
}
const NS_TXT = { A: 'sehr günstig', B: 'günstig', C: 'mittel', D: 'eher ungünstig', E: 'ungünstig' };
function nsScaleHTML(n) {
  return `<div class="nsscale" role="img" aria-label="Nutri-Score ${n.ns.grade}">${'ABCDE'.split('').map(g => `<span class="ns-${g}${g === n.ns.grade ? ' on' : ''}">${g}</span>`).join('')}</div>`;
}
function vegDotsHTML(v) {
  return `<span class="vdots">${[0, 1, 2, 3, 4].map(i => `<i style="--f:${Math.max(0, Math.min(1, v - i)) * 100}%"></i>`).join('')}</span>`;
}
function analysisHTML(r, n) {
  if (!n.kcal) return '';
  const dens = densityInfo(n.density), bad = badAllergens(r);
  const tips = insights(r, n);
  return `<div class="dhead"><h3>Analyse</h3><span class="small muted">pro Portion</span></div>
    <div class="card ana">
      ${n.ns ? `<div class="ana-row"><div class="ana-l"><b>Nutri-Score</b><span>${NS_TXT[n.ns.grade]} · geschätzt aus den Zutaten</span></div>${nsScaleHTML(n)}</div>` : ''}
      <div class="ana-row"><div class="ana-l"><b>Gemüse & Obst</b><span>${fmtDec(n.vegPortions)} von 5 Portionen am Tag</span></div>${vegDotsHTML(n.vegPortions)}</div>
      <div class="ana-row"><div class="ana-l"><b>Eiweiß</b><span>${fmtInt(n.p)} g · ${Math.round(n.pp)} % der Kalorien</span></div><span class="pbar"><i style="width:${Math.min(100, n.pp / 40 * 100)}%" class="${n.pp >= 20 ? 'good' : n.pp >= 12 ? 'mid' : 'bad'}"></i></span></div>
      ${dens ? `<div class="ana-row"><div class="ana-l"><b>Sättigung</b><span>${esc(dens.tip)}</span></div><span class="amp ${dens.lvl}">${dens.lbl}</span></div>` : ''}
      <div class="ana-row al"><div class="ana-l"><b>Allergene</b><span>${n.allergens.length ? 'erkannt aus den Zutaten – bitte Packungsangaben prüfen' : 'keine der Hauptallergene erkannt'}</span></div>
        <span class="alg">${n.allergens.map(a => `<span class="tag${bad.includes(a) ? ' warn' : ''}">${ALLERGENS[a].e} ${ALLERGENS[a].short}</span>`).join('') || '<span class="tag ok">✓</span>'}</span></div>
    </div>
    ${tips.length ? `<ul class="tips">${tips.map(([l, t]) => `<li class="${l}">${esc(t)}</li>`).join('')}</ul>` : ''}`;
}
function nutritionHTML(r, n) {
  if (!n.kcal) return '';
  const eP = n.p * 4, eC = n.c * 4, eF = n.f * 9, eT = (eP + eC + eF) || 1;
  const src = ['kcal', 'salt', 'sfa'].map(k => [k, contributors(r, k)]).filter(([, l]) => l.length);
  return `<div class="dhead"><h3>Nährwerte</h3><div class="seg mini" id="nutBasis"><button type="button" data-act="nutBasis" data-v="p" class="on">Portion</button><button type="button" data-act="nutBasis" data-v="100">100 g</button></div></div>
    <div class="card nutcard">
      <div class="macro"><i class="mp" style="width:${eP / eT * 100}%"></i><i class="mc" style="width:${eC / eT * 100}%"></i><i class="mf" style="width:${eF / eT * 100}%"></i></div>
      <div class="legend"><span><i class="mp"></i>Eiweiß ${Math.round(eP / eT * 100)} %</span><span><i class="mc"></i>Kohlenhydrate ${Math.round(eC / eT * 100)} %</span><span><i class="mf"></i>Fett ${Math.round(eF / eT * 100)} %</span></div>
      <div id="nutTable">${nutTableHTML(n, 'p')}</div>
      ${src.length ? `<details class="srcs"><summary>Woher kommen die Werte?</summary>${src.map(([k, l]) => `<div class="src"><b>${{ kcal: 'Kalorien', salt: 'Salz', sfa: 'Gesättigte Fette' }[k]}</b>${l.map(x => `<span>${esc(x.name)} <em>${fmtInt(x.share)} %</em></span>`).join('')}</div>`).join('')}</details>` : ''}
    </div>`;
}
// Ähnliche Rezepte: gemeinsame Hauptzutaten und Kategorien
const _feat = new WeakMap();
const COMMON_IDS = new Set(FOODS.filter(f => /^(Zwiebeln|Knoblauch|Salz|Pfeffer|Öl|Olivenöl|Wasser|Butter|Zucker|Gemüsebrühe|Zitronen|Zitronensaft|Petersilie|Mehl)$/.test(f.name) || f.cat === 'gewuerz').map(f => f.id));
function featOf(r) {
  let f = _feat.get(r);
  if (!f) { f = new Set(r.ingredients.map(i => matchFood(i.name)).filter(x => x && !COMMON_IDS.has(x.id)).map(x => x.id)); _feat.set(r, f); }
  return f;
}
function similarRecipes(r, k = 8) {
  const a = featOf(r), tags = new Set(r.tags || []), main = isMainDish(r);
  if (!a.size) return [];
  return allRecipes().filter(x => x.id !== r.id && isMainDish(x) === main).map(x => {
    const b = featOf(x); let inter = 0; for (const id of b) if (a.has(id)) inter++;
    const jac = inter / (a.size + b.size - inter || 1), tg = (x.tags || []).filter(t => tags.has(t)).length;
    return { x, s: jac + tg * 0.08 };
  }).filter(o => o.s > 0.18).sort((p, q) => q.s - p.s).slice(0, k).map(o => o.x);
}
function creditHTML(p) {
  if (!p || !p.credit) return '';
  const [artist, lic, file] = p.credit;
  return `<p class="credit">Symbolfoto: ${esc(artist || 'unbekannt')} · ${esc(lic)} · <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}" target="_blank" rel="noopener">Wikimedia Commons</a> (zugeschnitten)</p>`;
}
// servings: optional (z. B. die im Wochenplan eingetragenen Portionen)
function openRecipe(id, servings) {
  const r = recipeById(id); if (!r) { toast('Dieses Rezept gibt es nicht mehr'); return; }
  const n = nutr(r), p = photoOf(r);
  const rid = esc(r.id), serv = isNum(servings) && servings >= 1 ? servings : r.servings;
  const voted = typeof USERS !== 'undefined' && USERS.some(u => voteOf(u, r.id) !== undefined);
  const sim = similarRecipes(r);
  const sh = openSheet({
    title: '', cls: 'wide',
    left: `<button class="lnk" data-act="closeSheet">Schließen</button>`,
    right: `<button class="lnk r" data-act="recipeEdit" data-id="${rid}">Bearbeiten</button>`,
    body: `<div class="rd"><div class="rd-a">
      ${p ? `<div class="rphoto">${thumbHTML(r, 'rphoto-i')}</div>${creditHTML(p)}` : ''}
      <div class="hero${p ? ' withphoto' : ''}">${p ? '' : `<div class="e">${esc(r.emoji || '🍽️')}</div>`}<h2>${esc(r.name)}</h2>
      <div class="meta">${r.time ? `<span class="pill">⏱ ${esc(r.time)} Min.</span>` : ''}${LEVELS[r.level] ? `<span class="pill">📊 ${LEVELS[r.level]}</span>` : ''}<span class="pill">${n.fish ? '🐟 Fisch' : n.vegan ? '🌱 Vegan' : '🥕 Vegetarisch'}</span>${n.ns ? `<span class="pill nspill">Nutri-Score ${nsBadge(n)}</span>` : ''}${(r.tags || []).map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>${voted ? `<div class="meta">${USERS.map(u => `<span class="pill">${u} ${voteBadge(voteOf(u, r.id))}</span>`).join('')}</div>` : ''}</div>
      <div class="row">
        <button class="btn soft" data-act="recipeFav" data-id="${rid}">${isFav(r.id) ? '♥ Favorit' : '♡ Merken'}</button>
        <button class="btn soft" data-act="recipeToPlan" data-id="${rid}">📅 Planen</button>
        <button class="btn soft" data-act="recipeShare" data-id="${rid}" aria-label="Rezept teilen" style="flex:0 0 52px;padding:0">${ICON.share}</button>
      </div>
      ${n.kcal ? `<div class="kpis"><div><b>${fmtInt(n.kcal)}</b><span>kcal</span></div><div><b>${fmtInt(n.p)} g</b><span>Eiweiß</span></div><div><b>${fmtInt(n.c)} g</b><span>Kohlenh.</span></div><div><b>${fmtInt(n.f)} g</b><span>Fett</span></div><div><b>${fmtInt(n.fib)} g</b><span>Ballastst.</span></div></div>` : ''}
      ${analysisHTML(r, n)}
      ${nutritionHTML(r, n)}
      </div><div class="rd-b">
      <div class="dhead"><h3>Zutaten</h3><span class="stepper" data-stepper="detServ"><button data-act="step" data-n="-1" aria-label="Weniger Portionen">−</button><output>${serv}</output><button data-act="step" data-n="1" aria-label="Mehr Portionen">+</button></span></div>
      <ul class="card ing" id="ingList"></ul>
      <button class="btn" style="margin-top:10px;width:100%" data-act="recipeToShop" data-id="${rid}">🛒 Zutaten auf die Einkaufsliste</button>
      ${r.steps.length ? `<div class="dhead"><h3>Zubereitung</h3><span class="small muted">Antippen = erledigt</span></div><ol class="steps">${r.steps.map((s, i) => `<li class="card" data-act="stepDone">${stepHTML(s)}${timerChips(s, r.name + ' · Schritt ' + (i + 1))}</li>`).join('')}</ol><button class="btn primary" style="width:100%;margin-top:10px" data-act="cookStart" data-id="${rid}">👩‍🍳 Kochmodus: Schritt für Schritt</button>` : ''}
      ${r.notes ? `<div class="dhead"><h3>Notizen</h3></div><div class="card notes">${esc(r.notes)}</div>` : ''}
      ${'wakeLock' in navigator ? `<div class="card" style="margin-top:18px"><label class="setting"><span><span class="lbl">Bildschirm anlassen</span><br><span class="sub">praktisch beim Kochen</span></span><span class="switch"><input type="checkbox" data-change="wake"><i></i></span></label></div>` : ''}
      ${sim.length ? `<div class="dhead"><h3>Ähnliche Rezepte</h3></div><div class="hscroll">${sim.map(x => `<button class="mini" data-act="recipeSwap" data-id="${esc(x.id)}">${thumbHTML(x, 'mthumb')}<b>${esc(x.name)}</b><small>${nutr(x).kcal ? fmtInt(nutr(x).kcal) + ' kcal' : ''}${nutr(x).ns ? ' · ' + nsBadge(nutr(x)) : ''}</small></button>`).join('')}</div>` : ''}
      <button class="btn danger" style="width:100%;margin-top:14px" data-act="recipeDelete" data-id="${rid}">${r.builtin ? 'Rezept ausblenden' : 'Rezept löschen'}</button>
      </div></div>`,
    onClose: releaseWake,
  });
  sh.dataset.recipe = r.id;
  drawIngredients(sh);
}
// Zeiten & Temperaturen in Schritten fett hervorheben
const stepHTML = s => esc(s).replace(/(\d+(?:[,.]\d+)?(?:\s*[–-]\s*\d+(?:[,.]\d+)?)?\s*(?:Min\.|Minuten|Minute|Std\.|Stunden?|Sek\.|Sekunden|°C|Watt))/g, '<b>$1</b>');
// Zutaten auf die gewünschte Portionszahl umrechnen → [[Menge, Name], …]
function scaledIngs(r, servings) {
  const f = servings / (r.servings || 1);
  return r.ingredients.map(i => {
    let a = i.unit || '';
    if (i.amount != null) { const b = toBase(i.amount * f, i.unit); a = fmtAmount(b.amount, b.unit); }
    return [a, i.name];
  });
}
function openCook(id, servings) {
  const r = recipeById(id); if (!r || !r.steps.length) return;
  const serv = isNum(servings) && servings >= 1 ? servings : r.servings;
  const sh = openSheet({
    title: r.name, cls: 'full', left: '<button class="lnk" data-act="closeSheet">Beenden</button>',
    body: `<div class="cook"><div class="cook-main"><div class="cook-prog"><i></i></div><p class="cook-n"></p><p class="cook-t"></p><div class="cook-timers"></div>
      <div class="row"><button class="btn plain" data-act="cookMove" data-n="-1">← Zurück</button><button class="btn primary" data-act="cookMove" data-n="1">Weiter →</button></div></div>
      <details class="card cook-ing"${isWide() ? ' open' : ''}><summary>Zutaten für ${serv} ${serv === 1 ? 'Portion' : 'Portionen'}</summary><ul>${scaledIngs(r, serv).map(([a, n]) => `<li><b>${esc(a)}</b> ${esc(n)}</li>`).join('')}</ul></details></div>`,
    onClose: releaseWake,
  });
  sh.dataset.recipe = id; sh.dataset.i = 0; drawCook(sh);
  // Wischen: nach links = weiter, nach rechts = zurück
  const area = $('.cook-main', sh); let x0 = null, y0 = 0;
  area.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  area.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) cookMove(sh, dx < 0 ? 1 : -1);
  });
  if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLock = w; }).catch(() => {});
}
function cookMove(sh, step) {
  const r = recipeById(sh.dataset.recipe); if (!r) { closeSheet(true); return; }
  const i = +sh.dataset.i + step;
  if (i >= r.steps.length) { closeSheet(true); toast('Guten Appetit! 🍽️'); return; }
  sh.dataset.i = Math.max(0, i); drawCook(sh);
}
function drawCook(sh) {
  const r = recipeById(sh.dataset.recipe); if (!r) return;
  const n = r.steps.length, i = Math.min(+sh.dataset.i || 0, n - 1);
  $('.cook-prog i', sh).style.width = `${(i + 1) / n * 100}%`;
  $('.cook-n', sh).textContent = `Schritt ${i + 1} von ${n}`;
  $('.cook-t', sh).innerHTML = stepHTML(r.steps[i]);
  $('.cook-timers', sh).innerHTML = timerChips(r.steps[i], r.name + ' · Schritt ' + (i + 1), true);
  const [b, f] = $$('[data-act="cookMove"]', sh);
  b.disabled = i === 0; f.textContent = i === n - 1 ? '✓ Fertig' : 'Weiter →';
}
function drawIngredients(sh) {
  const r = recipeById(sh.dataset.recipe), el = $('#ingList', sh); if (!r || !el) return;
  el.innerHTML = r.ingredients.length ? scaledIngs(r, stepperVal(sh, 'detServ')).map(([a, n]) => `<li><span class="a">${esc(a)}</span><span>${esc(n)}</span></li>`).join('') : `<li class="muted">Keine Zutaten eingetragen.</li>`;
}
function recipeText(r, servings) {
  const n = nutr(r);
  return [`${r.emoji || '🍽️'} ${r.name}`, [r.time ? `${r.time} Min.` : '', `${servings} ${servings === 1 ? 'Portion' : 'Portionen'}`, n.kcal ? `${fmtInt(n.kcal)} kcal pro Portion` : '', n.ns ? `Nutri-Score ${n.ns.grade} (geschätzt)` : ''].filter(Boolean).join(' · '), '',
    'Zutaten', ...scaledIngs(r, servings).map(([a, name]) => `• ${[a, name].filter(Boolean).join(' ')}`), '',
    ...(r.steps.length ? ['Zubereitung', ...r.steps.map((s, i) => `${i + 1}. ${s}`)] : []), ...(r.notes ? ['', r.notes] : [])].join('\n');
}

let wakeLock = null;
async function setWake(on) {
  try {
    if (on) { wakeLock = await navigator.wakeLock.request('screen'); toast('Bildschirm bleibt an'); }
    else releaseWake();
  } catch (e) { toast('Auf diesem Gerät nicht verfügbar'); }
}
function releaseWake() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }

const EMOJIS = ['🍝', '🍛', '🍲', '🥘', '🥗', '🍕', '🍔', '🌮', '🌯', '🥙', '🍜', '🍣', '🍱', '🥟', '🧆', '🥚', '🍳', '🥞', '🧇', '🥐', '🥪', '🥣', '🥛', '🫑', '🥦', '🥕', '🍆', '🥔', '🍄', '🌶️', '🧀', '🌱', '🎃', '🍰', '🧁', '🍪', '🍎', '🍓', '🍌', '🥤'];
function openEditor(id) {
  const r = id ? recipeById(id) : null;
  if (id && !r) { toast('Dieses Rezept gibt es nicht mehr'); return; }
  const v = r || { name: '', emoji: '🍽️', servings: S.settings.servings, time: '', level: 1, tags: [], ingredients: [], steps: [], notes: '' };
  const sh = openSheet({
    title: r ? 'Rezept bearbeiten' : 'Neues Rezept', guard: true,
    right: `<button class="lnk r" data-act="recipeSave">Sichern</button>`,
    body: `<form data-form="recipeSave" autocomplete="off">
      <div class="field"><label for="f-name">Name</label><input id="f-name" required value="${esc(v.name)}" placeholder="z. B. Omas Gemüsesuppe"></div>
      <div class="field"><label>Foto</label>
        <div class="photo-edit"><div class="pe-prev">${thumbHTML(v, 'pe-img')}</div>
          <div class="pe-acts"><label class="btn soft pe-pick">${ICON.camera}<span>Foto wählen</span><input type="file" accept="image/*" data-change="photoPick" hidden></label>
          <button type="button" class="btn plain" data-act="photoRemove" ${typeof v.photo === 'string' ? '' : 'hidden'}>Eigenes Foto entfernen</button>
          <p class="help">${r && r.builtin && !v.photo && photoOf(r) ? 'Aktuell: Symbolfoto. Ein eigenes Foto ersetzt es.' : 'Wird verkleinert gespeichert und mit deinen Geräten abgeglichen.'}</p></div></div></div>
      <div class="field"><label for="f-emoji">Symbol</label>
        <div class="row" style="align-items:center"><input id="f-emoji" value="${esc(v.emoji)}" maxlength="8" style="max-width:72px;text-align:center;font-size:24px;padding:6px"><span class="small muted" style="flex:3">Eigenes Emoji eintippen oder unten wählen</span></div>
        <div class="emoji-row">${EMOJIS.map(e => `<button type="button" data-act="pickEmoji" data-e="${e}" class="${e === v.emoji ? 'on' : ''}">${e}</button>`).join('')}</div></div>
      <div class="row">
        <div class="field"><label for="f-serv">Portionen</label><input id="f-serv" type="number" inputmode="numeric" min="1" value="${esc(v.servings)}"></div>
        <div class="field"><label for="f-time">Zeit (Min.)</label><input id="f-time" type="number" inputmode="numeric" min="0" value="${esc(v.time)}"></div>
      </div>
      <div class="field"><label for="f-kind">Art</label><select id="f-kind">${Object.entries(KIND_SHORT).map(([k, l]) => `<option value="${k}" ${kindOf(v) === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="f-level">Schwierigkeit</label><select id="f-level">${[1, 2, 3].map(l => `<option value="${l}" ${+v.level === l ? 'selected' : ''}>${LEVELS[l]}</option>`).join('')}</select></div>
      <div class="field"><label for="f-tags">Kategorien</label><input id="f-tags" value="${esc((v.tags || []).join(', '))}" placeholder="z. B. Pasta, Italienisch"><p class="help">Mit Komma trennen</p></div>
      <div class="field"><label for="f-ing">Zutaten</label><textarea id="f-ing" rows="8" placeholder="200 g Mehl&#10;2 Eier&#10;1 Prise Salz">${esc(v.ingredients.map(ingLine).join('\n'))}</textarea><p class="help">Eine Zutat pro Zeile: Menge, Einheit, Zutat. Nährwerte werden daraus automatisch berechnet.</p></div>
      <div class="field"><label for="f-steps">Zubereitung</label><textarea id="f-steps" rows="8" placeholder="Ein Schritt pro Zeile">${esc(v.steps.join('\n'))}</textarea></div>
      <div class="field"><label for="f-notes">Notizen</label><textarea id="f-notes" rows="3" placeholder="Tipps, Quelle, Beilagen …">${esc(v.notes)}</textarea></div>
      <button class="btn primary" style="width:100%">Rezept speichern</button>
      ${r && r.edited ? `<button type="button" class="btn danger" style="width:100%;margin-top:6px" data-act="recipeRevert" data-id="${esc(r.id)}">Original wiederherstellen</button>` : ''}
      </form>`,
  });
  sh.dataset.edit = r ? r.id : '';
  sh._photo = typeof v.photo === 'string' ? v.photo : null; // eigenes Foto (data:-URL) oder keins
  if (!r) setTimeout(() => { const f = $('#f-name', sh); if (f) f.focus(); }, 350);
}
function saveEditor(sh) {
  if (!sh || !$('#f-name', sh)) return;
  const name = $('#f-name', sh).value.trim();
  if (!name) { toast('Bitte einen Namen eingeben'); $('#f-name', sh).focus(); return; }
  const data = {
    name,
    emoji: $('#f-emoji', sh).value.trim() || '🍽️',
    servings: Math.max(1, parseInt($('#f-serv', sh).value) || 1),
    time: Math.max(0, parseInt($('#f-time', sh).value) || 0) || '',
    level: +$('#f-level', sh).value || 1,
    kind: KIND_LABELS[$('#f-kind', sh).value] ? $('#f-kind', sh).value : 'main',
    tags: [...new Set($('#f-tags', sh).value.split(',').map(s => s.trim()).filter(Boolean))],
    ingredients: $('#f-ing', sh).value.split('\n').map(parseIng).filter(Boolean),
    steps: $('#f-steps', sh).value.split('\n').map(s => s.trim()).filter(Boolean),
    notes: $('#f-notes', sh).value.trim(),
  };
  if (sh._photo) data.photo = sh._photo;
  const id = sh.dataset.edit;
  if (id && BUILTIN_BY_ID.has(id)) S.over[id] = data;
  else if (id) {
    const own = S.recipes.find(x => x.id === id);
    if (own) { Object.assign(own, data); if (!data.photo) delete own.photo; } else S.recipes.push({ id, created: Date.now(), ...data }); // inzwischen woanders gelöscht → wieder anlegen
  } else S.recipes.push({ id: uid(), created: Date.now(), ...data });
  invalidate(id); save();
  closeSheet(true);
  if (id) { closeSheet(true); setTimeout(() => openRecipe(id), 330); }
  render();
  toast(id ? 'Rezept gespeichert' : 'Rezept angelegt');
}

function openPlanFor(recipe) {
  if (!recipe) return;
  const opts = [], t = startOfDay(new Date());
  for (let i = 0; i < 21; i++) {
    const d = addDays(t, i);
    opts.push(`<option value="${dkey(d)}">${i === 0 ? 'Heute' : i === 1 ? 'Morgen' : DAYS[(d.getDay() + 6) % 7]}, ${fmtDay(d)}</option>`);
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  const def = isBreakfast(recipe) && meals.find(m => m.k === 'f') ? 'f' : meals.find(m => m.k === 'a') ? 'a' : (meals[0] || MEALS[2]).k;
  const sh = openSheet({
    title: 'In Wochenplan eintragen',
    body: `<div class="field"><label for="pp-day">Tag</label><select id="pp-day">${opts.join('')}</select></div>
      <div class="field"><label>Mahlzeit</label><div class="seg" id="pp-meal">${(meals.length ? meals : MEALS).map(m => `<button type="button" data-act="seg" data-v="${m.k}" class="${m.k === def ? 'on' : ''}">${m.short}</button>`).join('')}</div></div>
      ${stepperHTML('ppServ', S.settings.servings)}
      ${buySwitchHTML(true)}
      <button class="btn primary" style="width:100%" data-act="planForSave">Eintragen</button>`,
  });
  sh.dataset.recipe = recipe.id;
}

/* ───────── Backup ───────── */
async function exportData() {
  const data = JSON.stringify({ app: 'essensplaner', exported: new Date().toISOString(), ...S, ui: undefined }, null, 1);
  const name = `essensplaner-backup-${dkey(new Date())}.json`;
  const file = new File([data], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Essensplaner Backup' }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function importData(file) {
  const rd = new FileReader();
  rd.onerror = () => toast('Datei konnte nicht gelesen werden');
  rd.onload = () => {
    let d;
    try {
      d = JSON.parse(rd.result);
      if (!isObj(d) || !Array.isArray(d.recipes)) throw new Error('bad');
    } catch (e) { toast('Datei ist kein gültiges Essensplaner-Backup'); return; }
    const when = d.exported ? ` vom ${fmtStamp(Date.parse(d.exported))}` : '';
    confirmSheet(`Backup${when} laden? Deine aktuellen Daten werden ersetzt${window.Cloud && Cloud.isOn() ? ' – auch online und auf allen verbundenen Geräten' : ''}. Der jetzige Stand wird vorher gesichert.`, 'Backup laden', () => {
      snapshot('Vor Backup-Import');
      replaceState(d, 'Backup geladen');
    });
  };
  rd.readAsText(file);
}

/* ───────── Aktionen ───────── */
const ACT = {
  tab(el) { closeAllSheets(); S.ui.view = el.dataset.view; saveUI(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(true); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },
  hideHint() { S.ui.hideHint = true; saveUI(); render(); },
  hideNotice() { boot.notice = ''; render(); },
  reload() { location.reload(); },
  showPast() { ui.showPast = true; render(); },
  togglePast() { ui.showPast = !ui.showPast; render(); },
  moreDays() { ui.ahead = Math.min(60, ui.ahead + 7); const y = window.scrollY; render(); window.scrollTo(0, y); },

  slotPick(el) {
    const { d, m } = el.dataset, dt = fromKey(d);
    openRecipePicker(`${DAYS[(dt.getDay() + 6) % 7]}, ${fmtDay(dt)} · ${meal(m).name}`, e => {
      const old = S.plan[d]?.[m];
      const n = setEntry(d, m, e); render();
      toast(plannedMsg(n), { label: 'Rückgängig', fn: () => { setEntry(d, m, old || null); render(); } });
    }, m);
  },
  pickRecipe(el) {
    const sh = topSheet(), cb = pending.pick, s = stepperVal(sh, 'pickServ'), buy = buyChecked(sh);
    closeSheet(true); cb && cb(buy ? { r: el.dataset.id, s } : { r: el.dataset.id, s, b: false });
  },
  pickKind(el) {
    const sh = topSheet(); if (!sh) return;
    sh.dataset.kind = el.dataset.v;
    $$('#pkind button', sh).forEach(b => b.classList.toggle('on', b === el));
    if (sh._draw) sh._draw();
  },
  slotMenu(el) {
    const { d, m } = el.dataset, e = S.plan[d]?.[m]; if (!e) return;
    const dt = fromKey(d), x = entryInfo(e), r = e.r && recipeById(e.r);
    const onList = S.shop.filter(it => (it.q || []).some(q => q.w === slotKey(d, m))).length;
    const sh = openSheet({
      title: `${DAYS[(dt.getDay() + 6) % 7]}, ${fmtDay(dt)} · ${meal(m).name}`,
      left: '<button class="lnk" data-act="closeSheet">Fertig</button>',
      body: `<div class="hero" style="padding-bottom:12px">${r ? `<div class="slothero">${thumbHTML(r, 'pthumb')}</div>` : `<div class="e" style="font-size:48px">${esc(x.emoji)}</div>`}<h2 style="font-size:20px">${esc(x.name)}</h2>${r ? `<p class="small muted" style="margin-top:6px">${recipeMeta(r)}</p>` : ''}</div>
        ${r ? stepperHTML('slotServ', e.s || r.servings) : ''}
        ${r ? `<div class="card" style="margin-bottom:14px"><label class="setting"><span><span class="lbl">🛒 Zutaten einkaufen</span><br><span class="sub slotbuy-sub">${e.b === false ? 'Aus – kommt nicht auf die Einkaufsliste' : onList ? `${onList} ${onList === 1 ? 'Zutat steht' : 'Zutaten stehen'} auf der Einkaufsliste` : 'Alles schon gekauft oder vorrätig'}</span></span><span class="switch"><input type="checkbox" data-change="slotBuy" ${e.b === false ? '' : 'checked'}><i></i></span></label></div>` : ''}
        <div class="card menu">
          ${r ? `<button data-act="slotView"><span class="ico">📖</span>Rezept ansehen</button>` : ''}
          ${r && r.steps.length ? `<button data-act="slotCook"><span class="ico">👩‍🍳</span>Jetzt kochen (Schritt für Schritt)</button>` : ''}
          <button data-act="slotReplace"><span class="ico">🔄</span>Anderes Gericht wählen</button>
          <button data-act="slotMove"><span class="ico">↔️</span>Auf anderen Tag verschieben</button>
          <button data-act="slotRemove"><span class="ico">🗑️</span><span class="red">Entfernen</span></button>
        </div>`,
      onClose: () => render(),
    });
    sh.dataset.d = d; sh.dataset.m = m;
  },
  slotView() { const sh = topSheet(); const e = S.plan[sh.dataset.d]?.[sh.dataset.m]; if (e?.r) openRecipe(e.r, e.s); },
  slotCook() { const sh = topSheet(); const e = S.plan[sh.dataset.d]?.[sh.dataset.m]; if (e?.r) openCook(e.r, e.s); },
  slotReplace() {
    const sh = topSheet(), { d, m } = sh.dataset; closeSheet(true);
    setTimeout(() => ACT.slotPick({ dataset: { d, m } }), 50);
  },
  slotRemove() {
    const sh = topSheet(), { d, m } = sh.dataset, old = S.plan[d]?.[m];
    setEntry(d, m, null); closeSheet(true);
    toast(old && old.r && old.b !== false ? 'Entfernt – Zutaten von der Liste genommen' : 'Entfernt', old ? { label: 'Rückgängig', fn: () => { setEntry(d, m, old); render(); } } : null);
  },
  slotMove() {
    const sh = topSheet(), { d, m } = sh.dataset;
    const t = startOfDay(new Date()), meals = MEALS.filter(x => S.settings.meals.includes(x.k) || x.k === m);
    const days = Array.from({ length: 14 }, (_, i) => addDays(t, i));
    const ms = openSheet({
      title: 'Verschieben nach …',
      body: `<div class="card menu">${days.flatMap((dt, i) => meals.map(mm => {
        const k = dkey(dt);
        if (k === d && mm.k === m) return '';
        const occ = S.plan[k]?.[mm.k];
        return `<button data-act="slotMoveTo" data-to="${k}" data-tm="${mm.k}"><span class="ico mvday">${relLabel(i) || wdShort(dt)}</span>${mm.short} <span class="muted small">${fmtDay(dt)}${occ ? ` · tauscht mit ${esc(entryInfo(occ).name)}` : ''}</span></button>`;
      })).join('')}</div>`,
    });
    ms.dataset.d = d; ms.dataset.m = m;
  },
  slotMoveTo(el) {
    const sh = topSheet(), { d, m } = sh.dataset, { to, tm } = el.dataset;
    closeAllSheets(); moveEntry(d, m, to, tm);
  },
  weekRandom() { /* wird in tinder.js ersetzt (nutzt die Bewertungen) */ },
  weekClear() {
    const keys = weekKeys(), old = keys.map(k => S.plan[k] && { ...S.plan[k] });
    if (!old.some(Boolean)) { toast('In den nächsten 7 Tagen ist nichts geplant'); return; }
    confirmSheet('Alle Gerichte der nächsten 7 Tage entfernen? Ihre Zutaten werden von der Einkaufsliste genommen.', 'Leeren', () => {
      keys.forEach(k => { for (const m of Object.keys(S.plan[k] || {})) unlinkSlot(slotKey(k, m)); delete S.plan[k]; });
      bulkOk(); save(); render();
      toast('Nächste 7 Tage geleert', { label: 'Rückgängig', fn: () => { keys.forEach((k, i) => { if (old[i]) { S.plan[k] = old[i]; for (const m of Object.keys(old[i])) linkSlot(k, m); } }); save(); render(); } });
    });
  },
  // Gerichte, deren Zutaten noch nicht auf der Liste sind (z. B. von früher oder „Einkaufen“ wieder eingeschaltet)
  planToShop() {
    const miss = missingPlanEntries();
    if (!miss.length) { toast('Alle geplanten Gerichte sind schon auf der Einkaufsliste'); return; }
    let n = 0; for (const [d, m] of miss) n += linkSlot(d, m) ? 1 : 0;
    save(); render();
    toast(`Zutaten für ${n} ${n === 1 ? 'Gericht' : 'Gerichte'} auf der Einkaufsliste`);
  },
  weekToShopFromList() { ACT.planToShop(); },
  tagFilter(el) { ui.tag = ui.tag === el.dataset.tag ? '' : el.dataset.tag; renderRecipeList(); },
  chipsToggle(el) { ui.chipsAll = !ui.chipsAll; $('#rtags').classList.toggle('all', ui.chipsAll); el.textContent = ui.chipsAll ? 'Weniger Kategorien' : 'Alle Kategorien'; },
  recipeResetFilter() { ui.q = ''; ui.tag = ''; ui.f = {}; ui.strict = false; ui.kind = ''; render(); },
  recipeOpen(el) { openRecipe(el.dataset.id); },
  recipeNew() { openEditor(null); },
  recipeEdit(el) { openEditor(el.dataset.id); },
  recipeSave() { saveEditor(topSheet()); },
  recipeRevert(el) {
    const id = el.dataset.id;
    confirmSheet('Deine Änderungen an diesem Rezept verwerfen?', 'Original wiederherstellen', () => {
      delete S.over[id]; invalidate(id); save(); closeAllSheets(); render(); setTimeout(() => openRecipe(id), 330);
    });
  },
  pickEmoji(el) {
    const sh = topSheet(); $('#f-emoji', sh).value = el.dataset.e;
    $$('.emoji-row button', sh).forEach(b => b.classList.toggle('on', b === el));
  },
  recipeFav(el) {
    const id = el.dataset.id;
    S.favs = isFav(id) ? S.favs.filter(x => x !== id) : [...S.favs, id]; save();
    el.textContent = isFav(id) ? '♥ Favorit' : '♡ Merken';
    if (S.ui.view === 'recipes') renderRecipeList();
  },
  recipeDelete(el) {
    const r = recipeById(el.dataset.id); if (!r) { closeAllSheets(); render(); return; }
    confirmSheet(r.builtin ? `„${r.name}“ ausblenden? Du kannst es unter „Mehr“ zurückholen.` : `„${r.name}“ löschen?`, r.builtin ? 'Ausblenden' : 'Löschen', () => {
      const own = S.recipes.find(x => x.id === r.id), wasFav = isFav(r.id), slots = [];
      if (r.builtin) { if (!S.hidden.includes(r.id)) S.hidden.push(r.id); }
      else S.recipes = S.recipes.filter(x => x.id !== r.id);
      S.favs = S.favs.filter(x => x !== r.id);
      for (const k of Object.keys(S.plan)) {
        for (const m of Object.keys(S.plan[k])) if (S.plan[k][m].r === r.id) { slots.push([k, m, S.plan[k][m]]); delete S.plan[k][m]; unlinkSlot(slotKey(k, m)); }
        if (!Object.keys(S.plan[k]).length) delete S.plan[k];
      }
      invalidate(r.id); save(); closeAllSheets(); render();
      toast(r.builtin ? 'Rezept ausgeblendet' : 'Rezept gelöscht', {
        label: 'Rückgängig', fn: () => {
          if (r.builtin) S.hidden = S.hidden.filter(x => x !== r.id);
          else if (own && !S.recipes.some(x => x.id === own.id)) S.recipes.push(own);
          if (wasFav && !isFav(r.id)) S.favs.push(r.id);
          for (const [k, m, e] of slots) { S.plan[k] = S.plan[k] || {}; if (!S.plan[k][m]) { S.plan[k][m] = e; linkSlot(k, m); } }
          invalidate(r.id); save(); render();
        },
      });
    });
  },
  recipeToShop(el) {
    const sh = topSheet(), r = recipeById(el.dataset.id); if (!r) return;
    const n = addToShop(recipeItems(r, stepperVal(sh, 'detServ')));
    save(); toast(n ? `${n} Artikel hinzugefügt` : 'Mengen auf der Liste ergänzt');
  },
  recipeToPlan(el) { openPlanFor(recipeById(el.dataset.id)); },
  async recipeShare(el) {
    const r = recipeById(el.dataset.id); if (!r) return;
    const text = recipeText(r, stepperVal(topSheet(), 'detServ'));
    if (navigator.share) { try { await navigator.share({ title: r.name, text }); } catch (e) { /* abgebrochen */ } return; }
    try { await navigator.clipboard.writeText(text); toast('Rezept kopiert'); } catch (e) { toast('Teilen nicht möglich'); }
  },
  planForSave() {
    const sh = topSheet();
    const d = $('#pp-day', sh).value, on = $('#pp-meal .on', sh), m = on ? on.dataset.v : 'a';
    const old = S.plan[d]?.[m], e = { r: sh.dataset.recipe, s: stepperVal(sh, 'ppServ') };
    if (!buyChecked(sh)) e.b = false;
    const n = setEntry(d, m, e); closeSheet(true);
    const dt = fromKey(d);
    toast(plannedMsg(n, `Eingetragen: ${DAYS[(dt.getDay() + 6) % 7]}, ${meal(m).short}`), { label: 'Rückgängig', fn: () => { setEntry(d, m, old || null); if (S.ui.view === 'plan') render(); } });
    if (S.ui.view === 'plan') render();
  },
  seg(el) { $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
  stepDone(el) { el.classList.toggle('done'); },
  cookStart(el) { openCook(el.dataset.id, stepperVal(topSheet(), 'detServ')); },
  cookMove(el) { cookMove(topSheet(), +el.dataset.n); },
  step(el) {
    const st = el.closest('[data-stepper]'), out = $('output', st);
    const v = Math.max(1, Math.min(50, (+out.textContent || 1) + +el.dataset.n));
    out.textContent = v;
    const sh = topSheet();
    if (st.dataset.stepper === 'detServ') drawIngredients(sh);
    if (st.dataset.stepper === 'slotServ') {
      const e = S.plan[sh.dataset.d]?.[sh.dataset.m], r = e && recipeById(e.r);
      if (e) { const old = e.s || (r ? r.servings : v); e.s = v; if (old) rescaleSlot(slotKey(sh.dataset.d, sh.dataset.m), v / old); save(); }
    }
  },

  tile(el) {
    if (lp.fired) { lp.fired = false; return; }
    const it = itemFromTile(el);
    if (it) { buyItem(it); return; }
    addFromTile(el); save();
    if (ui.sq) { ui.sq = ''; const inp = $('#sq'); if (inp) { inp.value = ''; inp.focus(); } }
    renderShop();
  },
  catToggle(el) { const c = el.dataset.c; S.ui.open[c] = !S.ui.open[c]; saveUI(); renderShop(); },
  itemSave() {
    const sh = topSheet(), it = S.shop.find(x => x.id === sh.dataset.id); if (!it) { closeSheet(true); renderShop(); return; }
    const name = $('#e-name', sh).value.trim(); if (!name) { toast('Name fehlt'); return; }
    const sp = parseSpec($('#e-spec', sh).value);
    const dept = DEPT_BY[$('#e-cat', sh).value] ? $('#e-cat', sh).value : 'sonst';
    // Mengen aus dem Plan behalten, wenn nur Name/Abteilung geändert wurden
    const same = sp.note === '' && qtyText({ q: sp.q }) === qtyText({ q: it.q });
    Object.assign(it, same ? { name } : { name, q: sp.q, note: sp.note, w: null });
    decorate(it); it.dept = dept; it.cat = DEPT_TO_OLD[dept]; if (!matchFood(name)) it.emoji = DEPT_BY[dept].e;
    save(); closeSheet(true); renderShop();
  },
  itemBuy() { const sh = topSheet(), it = S.shop.find(x => x.id === sh.dataset.id); closeSheet(true); if (it) buyItem(it); },
  itemDelete() {
    const sh = topSheet(), idx = S.shop.findIndex(x => x.id === sh.dataset.id), it = S.shop[idx];
    if (it) S.shop.splice(idx, 1);
    save(); closeSheet(true); renderShop();
    if (it) toast(`${it.name} entfernt`, { label: 'Rückgängig', fn: () => { S.shop.splice(Math.min(idx, S.shop.length), 0, it); save(); renderShop(); } });
  },
  shopClear() {
    const old = S.shop; if (!old.length) return;
    confirmSheet(`Alle ${old.length} Artikel von der Einkaufsliste entfernen?`, 'Liste leeren', () => {
      S.shop = []; save(); renderShop();
      toast('Liste geleert', { label: 'Rückgängig', fn: () => { S.shop = [...old, ...S.shop]; save(); renderShop(); } });
    });
  },
  async shopShare() {
    if (!S.shop.length) { toast('Die Liste ist leer'); return; }
    const text = 'Einkaufsliste\n' + deptOrder().map(c => {
      const it = S.shop.filter(i => deptOf(i) === c.k);
      return it.length ? `\n${c.e} ${c.name}\n` + it.map(i => { const q = qtyText(i); return `▢ ${i.name}${q ? ' – ' + q : ''}`; }).join('\n') : '';
    }).join('');
    if (navigator.share) { try { await navigator.share({ title: 'Einkaufsliste', text }); } catch (e) { /* abgebrochen */ } return; }
    try { await navigator.clipboard.writeText(text); toast('Liste kopiert'); } catch (e) { toast('Teilen nicht möglich'); }
  },

  deptOrder() { openDeptOrder(); },
  setMe(el) { S.ui.who = el.dataset.v; saveUI(); $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
  deptMove(el) {
    const order = deptOrder().map(d => d.k), i = order.indexOf(el.dataset.k), j = i + +el.dataset.n;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    S.settings = { ...S.settings, depts: order }; save(); drawDeptOrder(topSheet());
  },
  deptReset() { const st = { ...S.settings }; delete st.depts; S.settings = st; save(); drawDeptOrder(topSheet()); toast('Standard-Reihenfolge wiederhergestellt'); },
  kindTab(el) { ui.kind = el.dataset.v; $$('#rkind button').forEach(b => b.classList.toggle('on', b === el)); renderRecipeList(); },
  defServ(el) {
    S.settings.servings = Math.max(1, Math.min(20, S.settings.servings + +el.dataset.n)); save();
    el.parentElement.querySelector('output').textContent = S.settings.servings;
  },
  exportData() { exportData(); },
  importData() { $('#importFile').click(); },
  restoreHidden() { const n = S.hidden.length; S.hidden = []; bulkOk(); invalidate(); save(); render(); toast(`${n} Rezepte wieder da`); },
  resetAll() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Wirklich alle eigenen Rezepte, Pläne, Listen und Bewertungen löschen – auch online und auf allen verbundenen Geräten? Vorher wird eine Sicherung auf diesem Gerät angelegt.' : 'Wirklich alle eigenen Rezepte, Pläne, Listen und Bewertungen löschen? Vorher wird eine Sicherung auf diesem Gerät angelegt.', 'Alles löschen', () => {
      snapshot('Vor „Alle Daten löschen“');
      const keep = { sid: S.sid, view: S.ui.view };
      S = fresh(); S.sid = keep.sid; S.ui.view = keep.view;
      bulkOk(); invalidate(); save(); render(); toast('Alle Daten gelöscht – Sicherung liegt unter „Mehr“');
    });
  },
  snapNow() { toast(snapshot('Manuell') ? 'Sicherung angelegt' : hasContent(S) ? 'Der aktuelle Stand ist schon gesichert' : 'Noch keine Daten zum Sichern'); render(); },
  snapRestore(el) {
    const sn = snapshots().find(x => x.t === +el.dataset.t); if (!sn) { render(); return; }
    confirmSheet(`Stand vom ${fmtStamp(sn.t)} wiederherstellen (${snapInfo(sn.data)})? Die jetzigen Daten werden ersetzt${window.Cloud && Cloud.isOn() ? ' – auch online und auf allen verbundenen Geräten' : ''}. Der aktuelle Stand wird vorher gesichert.`, 'Wiederherstellen', () => {
      snapshot('Vor Wiederherstellung');
      replaceState(sn.data, 'Sicherung wiederhergestellt');
    });
  },
  // Ein früher nicht lesbarer Stand liegt noch auf dem Gerät – noch einmal versuchen (z. B. nach einem App-Update)
  retryBad() {
    let d = null;
    try { d = JSON.parse(lsGet(BAD_KEY)); } catch (e) { /* weiterhin unlesbar */ }
    if (!isObj(d) || !Array.isArray(d.recipes)) { toast('Der Stand ist leider weiterhin nicht lesbar'); return; }
    confirmSheet(`Aufbewahrten Stand einlesen (${snapInfo(d)})? Die jetzigen Daten werden ersetzt; der aktuelle Stand wird vorher gesichert.`, 'Einlesen', () => {
      snapshot('Vor Einlesen des alten Stands');
      replaceState(d, 'Alter Stand eingelesen'); lsDel(BAD_KEY); render();
    });
  },
  diag() {
    const st = window.Cloud ? (Cloud.isOn() ? Cloud.status().label : 'nicht angemeldet') : 'nicht geladen';
    const size = k => { const v = lsGet(k); return v ? Math.round(v.length / 1024) + ' kB' : '–'; };
    const lines = [`Essensplaner v${APP_VERSION}`, `Online-Datenbank: ${st}`, `Speicher: Daten ${size(KEY)} · Sicherungen ${size(BAK_KEY)} · Abgleich ${size('cloud.essen')}`,
      `Inhalt: ${snapInfo(S)}`, `Gerät: ${navigator.userAgent}`, `Fenster: ${innerWidth}×${innerHeight}`, '', 'Letzte Fehler:', ...(errorLog().length ? errorLog().slice().reverse() : ['keine'])];
    openSheet({
      title: 'Diagnose', left: '<button class="lnk" data-act="closeSheet">Schließen</button>',
      body: `<p class="small muted" style="margin:0 4px 10px">Falls etwas nicht funktioniert: Diesen Text kopieren und weitergeben. Er enthält keine Passwörter.</p>
        <textarea readonly rows="14" id="diagText" style="font:13px/1.45 ui-monospace,Menlo,monospace">${esc(lines.join('\n'))}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn soft" data-act="diagCopy">Kopieren</button><button class="btn plain" data-act="reload">App neu laden</button></div>`,
    });
  },
  async diagCopy() {
    const t = $('#diagText'); if (!t) return;
    try { await navigator.clipboard.writeText(t.value); toast('Kopiert'); } catch (e) { t.focus(); t.select(); toast('Text markiert – jetzt kopieren'); }
  },
};

const FORMS = {
  pickText(f) {
    const v = $('#pt', f).value.trim(); if (!v) return;
    const cb = pending.pick; closeSheet(true); cb && cb({ t: v });
  },
  recipeSave() { saveEditor(topSheet()); },
  itemSave() { ACT.itemSave(); },
};

const CHANGE = {
  showDish(el) { S.settings = { ...S.settings, showDish: el.checked }; save(); },
  archive(el) { S.ui.archive = el.checked; saveUI(); invalidate(); render(); },
  slotBuy(el) {
    const sh = topSheet(), { d, m } = sh.dataset, e = S.plan[d]?.[m]; if (!e) return;
    if (el.checked) { delete e.b; const n = linkSlot(d, m); save(); toast(n ? `${n} ${n === 1 ? 'Zutat' : 'Zutaten'} auf die Einkaufsliste` : 'Nichts zu kaufen – alles vorrätig'); }
    else { e.b = false; unlinkSlot(slotKey(d, m)); save(); toast('Zutaten von der Einkaufsliste genommen'); }
    const sub = $('.slotbuy-sub', sh); if (sub) sub.textContent = el.checked ? 'Auf der Einkaufsliste' : 'Aus – kommt nicht auf die Einkaufsliste';
  },
  mealToggle(el) {
    const m = el.dataset.m, set = new Set(S.settings.meals);
    el.checked ? set.add(m) : set.delete(m);
    if (!set.size) { el.checked = true; toast('Mindestens eine Mahlzeit'); return; }
    S.settings.meals = MEALS.map(x => x.k).filter(k => set.has(k)); save();
  },
  pantry(el) { S.settings.pantry = el.value; save(); },
  wake(el) { setWake(el.checked); },
  sort(el) { S.ui.sort = SORTS.includes(el.value) ? el.value : 'name'; saveUI(); renderRecipeList(); },
};

/* ───────── Gedrückt halten (Kacheln) ───────── */
const lp = { t: null, fired: false, x: 0, y: 0 };
function tileLongPress(t) {
  lp.fired = true;
  if (navigator.vibrate) navigator.vibrate(15);
  let it = itemFromTile(t);
  if (!it) { it = addFromTile(t); save(); renderShop(); }
  if (it) openItemEdit(it);
}
document.addEventListener('touchstart', e => {
  const t = e.target.closest('.tile'); if (!t) return;
  lp.fired = false; const p = e.touches[0]; lp.x = p.clientX; lp.y = p.clientY;
  clearTimeout(lp.t); lp.t = setTimeout(() => { lp.t = null; guard(() => tileLongPress(t), 'longpress'); }, 480);
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!lp.t) return; const p = e.touches[0];
  if (Math.abs(p.clientX - lp.x) > 10 || Math.abs(p.clientY - lp.y) > 10) { clearTimeout(lp.t); lp.t = null; }
}, { passive: true });
document.addEventListener('touchend', () => { clearTimeout(lp.t); lp.t = null; });
document.addEventListener('touchcancel', () => { clearTimeout(lp.t); lp.t = null; });
document.addEventListener('contextmenu', e => {
  const t = e.target.closest('.tile'); if (!t) return;
  e.preventDefault(); guard(() => tileLongPress(t), 'contextmenu'); setTimeout(() => { lp.fired = false; }, 600);
});

/* ───────── Gerichte im Wochenplan per Ziehen verschieben (Maus, Trackpad, iPad) ───────── */
let drag = null;
const clearDrop = () => $$('.slot.drop, .slot.dragging').forEach(x => x.classList.remove('drop', 'dragging'));
document.addEventListener('dragstart', e => {
  const s = e.target.closest ? e.target.closest('.slot.filled') : null; if (!s) return;
  drag = { d: s.dataset.d, m: s.dataset.m };
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', $('.slot-name', s).textContent); } catch (x) { /* nicht nötig */ }
  setTimeout(() => s.classList.add('dragging'), 0);
});
document.addEventListener('dragover', e => {
  if (!drag) return;
  const s = e.target.closest ? e.target.closest('.slot') : null; if (!s) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  if (!s.classList.contains('drop')) { $$('.slot.drop').forEach(x => x.classList.remove('drop')); s.classList.add('drop'); }
});
document.addEventListener('drop', e => {
  if (!drag) return;
  const s = e.target.closest ? e.target.closest('.slot') : null, from = drag;
  drag = null; clearDrop();
  if (!s) return;
  e.preventDefault();
  guard(() => moveEntry(from.d, from.m, s.dataset.d, s.dataset.m), 'drop');
});
document.addEventListener('dragend', () => { drag = null; clearDrop(); });

/* ───────── Events ───────── */
// Jede Aktion läuft abgesichert: Fehler werden protokolliert und gemeldet, die App läuft weiter.
function guard(fn, where) {
  try { const r = fn(); if (r && typeof r.catch === 'function') r.catch(e => oops(e, where)); return r; }
  catch (e) { oops(e, where); }
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  e.preventDefault(); guard(() => fn(a, e), 'act:' + a.dataset.act);
});
document.addEventListener('submit', e => {
  if (e.target.matches('[data-cloud-form]')) return; // Anmeldung gehört zu cloud.js
  e.preventDefault(); const fn = FORMS[e.target.dataset.form]; if (fn) guard(() => fn(e.target), 'form:' + e.target.dataset.form);
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (k && CHANGE[k]) guard(() => CHANGE[k](e.target), 'change:' + k);
  if (e.target.id === 'importFile' && e.target.files[0]) { guard(() => importData(e.target.files[0]), 'import'); e.target.value = ''; }
});
document.addEventListener('input', e => {
  if (e.target.id === 'rq') { ui.q = e.target.value; guard(renderRecipeList, 'search'); }
  if (e.target.id === 'sq') { ui.sq = e.target.value; guard(renderShop, 'shopsearch'); }
  if (e.target.dataset.change === 'pantry') CHANGE.pantry(e.target);
});
document.addEventListener('keydown', e => {
  const tag = e.target.tagName, typing = /INPUT|TEXTAREA|SELECT/.test(tag);
  if (e.target.id === 'sq' && e.key === 'Enter') { // Enter fügt den ersten Treffer hinzu
    e.preventDefault();
    const t = $('#shoparea .tile:not(.on)');
    if (t) guard(() => ACT.tile(t), 'enter'); else e.target.blur();
    return;
  }
  if (e.key === 'Escape') { // Esc: Suche leeren bzw. oberstes Fenster schließen
    if (sheetStack.length) { e.preventDefault(); guard(() => closeSheet(), 'esc'); }
    else if (typing) e.target.blur();
    return;
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  const top = topSheet();
  if (top && top.classList.contains('full') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ')) { // Kochmodus
    e.preventDefault(); guard(() => cookMove(top, e.key === 'ArrowLeft' ? -1 : 1), 'cookkey'); return;
  }
  if (top) return;
  if (e.key === '/') { const inp = $('#rq') || $('#sq'); if (inp) { e.preventDefault(); inp.focus(); } }
  else if (/^[1-6]$/.test(e.key)) { const b = $(`#tabbar button[data-view="${TAB_ORDER[+e.key - 1]}"]`); if (b) guard(() => ACT.tab(b), 'tabkey'); }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (wakeLock === null && $('[data-change="wake"]:checked')) setWake(true);
  dailySnapshot();
  // Die App lag über Mitternacht offen → „Heute“ im Plan nachziehen
  if (S.ui.view === 'plan' && !sheetStack.length && $('.day.today') && !$(`.day.today .slot[data-d="${dkey(new Date())}"]`)) render();
});
// Dieselbe App in einem zweiten Tab/Fenster geändert → Stand übernehmen statt überschreiben
window.addEventListener('storage', e => {
  if (e.key !== KEY || !e.newValue) return;
  guard(() => {
    const s = JSON.parse(e.newValue); if (!isObj(s)) return;
    const keepUi = S.ui;
    S = sanitize(migrate(s)); S.ui = keepUi; invalidate();
    const el = document.activeElement;
    if (!sheetStack.length && !(el && /INPUT|TEXTAREA|SELECT/.test(el.tagName))) { const y = window.scrollY; render(); window.scrollTo(0, y); } else updateBadge();
  }, 'storage');
});

document.addEventListener('DOMContentLoaded', () => {
  render();
  if (boot.notice) toast('Daten wurden aus einer Sicherung wiederhergestellt');
});

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
const CLOUD_LIST = { recipe: ['r:', 'recipes'], shop: ['s:', 'shop'], todo: ['t:', 'todos'], routine: ['u:', 'routines'] };
const CLOUD_SET = { hidden: ['h:', 'hidden'], fav: ['f:', 'favs'] };
if (window.Cloud) Cloud.init({
  app: 'essen',
  kinds: ['recipe', 'shop', 'todo', 'routine', 'hidden', 'fav', 'over', 'plan', 'vote', 'recent', 'settings'],
  protect: ['todo', 'routine'], // ältere App-Versionen kennen sie nicht – deren Löschungen nicht übernehmen
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(CLOUD_LIST)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    for (const [k, [p, arr]] of Object.entries(CLOUD_SET)) for (const id of S[arr]) m[p + id] = { kind: k, data: true };
    for (const [id, o] of Object.entries(S.over)) m['o:' + id] = { kind: 'over', data: o };
    for (const [d, day] of Object.entries(S.plan)) for (const [k, e] of Object.entries(day || {})) if (e) m[`p:${d}|${k}`] = { kind: 'plan', data: e };
    for (const [u, vs] of Object.entries(S.votes || {})) for (const [id, v] of Object.entries(vs)) m[`v:${u}|${id}`] = { kind: 'vote', data: v };
    m.recent = { kind: 'recent', data: S.recent, soft: !S.recent.length };
    m.settings = { kind: 'settings', data: S.settings, soft: JSON.stringify(S.settings) === JSON.stringify(fresh().settings) };
    return m;
  },
  apply(r) {
    const rid = r.id.slice(2), del = !!r.deleted;
    if (CLOUD_LIST[r.kind]) {
      if (!del && !(isObj(r.data) && r.data.id === rid)) return; // unbrauchbare Zeile nicht übernehmen
      const arr = S[CLOUD_LIST[r.kind][1]], i = arr.findIndex(x => x.id === rid);
      if (del) { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = r.data; else arr.push(r.data);
    } else if (CLOUD_SET[r.kind]) {
      const key = CLOUD_SET[r.kind][1];
      S[key] = S[key].filter(x => x !== rid); if (!del && rid) S[key].push(rid);
    } else if (r.kind === 'over') { if (del) delete S.over[rid]; else if (isObj(r.data)) S.over[rid] = r.data; }
    else if (r.kind === 'plan') {
      const [d, k] = rid.split('|'); if (!d || !k) return;
      if (del) { if (S.plan[d]) { delete S.plan[d][k]; if (!Object.keys(S.plan[d]).length) delete S.plan[d]; } }
      else if (isObj(r.data)) (S.plan[d] = S.plan[d] || {})[k] = r.data;
    } else if (r.kind === 'vote') {
      const [u, id] = rid.split('|'); if (!u || !id) return;
      S.votes = S.votes || {}; const vs = (S.votes[u] = S.votes[u] || {});
      if (del) delete vs[id]; else vs[id] = r.data;
    } else if (r.kind === 'recent') S.recent = del ? [] : Array.isArray(r.data) ? r.data : [];
    else if (r.kind === 'settings' && isObj(r.data)) S.settings = { ...S.settings, ...r.data };
  },
  persist() { S = sanitize(S); invalidate(); save(true); },
  refresh() { const y = window.scrollY; render(); window.scrollTo(0, y); },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  openSettings() { closeAllSheets(); S.ui.view = 'more'; saveUI(); render(); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
  // Kennung des lokalen Datenbestands: wurde er nach einem Defekt neu aufgebaut, gewinnt die Online-Datenbank
  storeId: () => S.sid, rebuilt: boot.rebuilt,
  // Sicherheitsnetz: verschwindet (ohne Einkaufsliste) mehr, als übrig bleibt, wird erst nachgefragt
  guardDeletes(dels) {
    const gone = dels.filter(d => d.kind !== 'shop').length;
    const left = S.recipes.length + S.favs.length + S.hidden.length + Object.keys(S.over).length + S.todos.length + S.routines.length
      + Object.values(S.plan).reduce((a, d) => a + Object.keys(d).length, 0) + Object.values(S.votes).reduce((a, v) => a + Object.keys(v).length, 0);
    return gone >= 25 && gone > left;
  },
  onStatus(st) {
    const el = $('#sideStatus'); if (!el) return;
    const on = Cloud.isOn();
    el.className = 'side-status ' + (on ? st.st : 'off'); el.querySelector('span').textContent = on ? st.label : 'Nur auf diesem Gerät gespeichert';
  },
});

/* ───────── Offline-Cache & Updates ───────── */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadSW = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(reg => {
    // Liegt die App lange offen (Home-Bildschirm), gelegentlich nach einer neuen Version sehen
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadSW) toast('Neue Version verfügbar', { label: 'Neu laden', fn: () => location.reload() });
  });
}
