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
];
const meal = k => MEALS.find(m => m.k === k) || MEALS[2];
const VIEWS = ['plan', 'recipes', 'swipe', 'shop', 'more'];
const SORTS = ['name', 'time', 'kcal', 'protein', 'pp'];
const APP_VERSION = '4.0';
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
    v: 2, sid: newSid(), recipes: [], over: {}, hidden: [], favs: [], plan: {}, shop: [], recent: [], votes: { Fee: {}, Flo: {} },
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
    && (r.emoji == null || typeof r.emoji === 'string') && (r.notes == null || typeof r.notes === 'string');
  if (ok) return r;
  const time = r.time === '' || r.time == null ? NaN : +r.time, serv = +r.servings;
  return {
    ...r, ingredients: cleanIngs(r.ingredients), steps: Array.isArray(r.steps) ? r.steps.filter(isStr) : [],
    tags: Array.isArray(r.tags) ? r.tags.filter(isStr) : [], servings: isNum(serv) && serv >= 1 ? serv : 1,
    time: isNum(time) && time >= 0 ? time : '', emoji: typeof r.emoji === 'string' ? r.emoji : '🍽️', notes: typeof r.notes === 'string' ? r.notes : '',
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
      if (usable && (e.s === undefined || (isNum(e.s) && e.s >= 1))) continue;
      if (o === day) o = { ...day };
      if (usable) { o[m] = { ...e }; delete o[m].s; } else delete o[m];
    }
    if (Object.keys(o).length) out[d] = o;
  }
  return out;
}
const uniqStrs = a => Array.isArray(a) ? [...new Set(a.filter(isStr))] : [];
function sanitize(s) {
  const f = fresh();
  if (!isObj(s)) return f;
  s.v = 2;
  if (!isStr(s.sid)) s.sid = f.sid;
  s.recipes = cleanList(s.recipes, r => { const c = cleanRecipe(r); return c && isStr(c.id) ? c : null; });
  s.shop = cleanList(s.shop, cleanItem);
  s.plan = cleanPlan(s.plan);
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
  const u = { ...f.ui, ...(isObj(s.ui) ? s.ui : {}) };
  if (!VIEWS.includes(u.view)) u.view = 'plan';
  if (!SORTS.includes(u.sort)) u.sort = 'name';
  if (!isObj(u.open)) u.open = {};
  s.ui = u;
  return s;
}
const hasContent = s => !!(s.recipes.length || s.shop.length || Object.keys(s.plan).length || s.favs.length || s.hidden.length || Object.keys(s.over).length || Object.values(s.votes).some(v => Object.keys(v).length));

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
  return [n((d.recipes || []).length, 'eigenes Rezept', 'eigene Rezepte'), n(meals, 'geplantes Essen', 'geplante Essen'), n((d.shop || []).length, 'Artikel', 'Artikel'), votes ? n(votes, 'Bewertung', 'Bewertungen') : ''].filter(Boolean).join(' · ');
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

const ui = { weekStart: monday(new Date()), q: '', tag: '', sq: '', showPast: false, chipsAll: false };

/* ───────── Rezepte & Nährwerte ───────── */
let _all = null;
const nutCache = new Map();
function invalidate(id) { _all = null; if (id) nutCache.delete(id); else nutCache.clear(); }
function withOverride(b) { return S.over[b.id] ? { ...b, ...S.over[b.id], id: b.id, builtin: true, edited: true } : b; }
function allRecipes() {
  if (_all) return _all;
  const hidden = new Set(S.hidden);
  _all = [...BUILTINS.filter(b => !hidden.has(b.id)).map(withOverride), ...S.recipes];
  return _all;
}
function recipeById(id) {
  const r = allRecipes().find(x => x.id === id);
  if (r) return r;
  const b = BUILTIN_BY_ID.get(id);
  return b ? withOverride(b) : null;
}
const isFav = id => S.favs.includes(id);
function nutr(r) {
  let n = nutCache.get(r.id);
  if (!n) {
    const t = calcNutrition(r.ingredients), s = r.servings || 1;
    n = { pp: t.kcal ? t.p * 4 / t.kcal * 100 : 0, kcal: t.kcal / s, p: t.p / s, c: t.c / s, f: t.f / s, fib: t.fib / s, vegan: t.vegan, fish: t.fish, coverage: t.coverage };
    nutCache.set(r.id, n);
  }
  return n;
}
const SMART = {
  fav: { label: '♥ Favoriten', test: r => isFav(r.id) },
  veggie: { label: '🥕 Vegetarisch', test: r => !nutr(r).fish },
  vegan: { label: '🌱 Vegan', test: r => nutr(r).vegan },
  fish: { label: '🐟 Fisch', test: r => nutr(r).fish },
  fast: { label: '⏱ Bis 30 Min.', test: r => r.time && r.time <= 30 },
  light: { label: '🔥 Unter 500 kcal', test: r => nutr(r).kcal < 500 },
  protein: { label: '💪 Proteinreich (ab 25 %)', test: r => nutr(r).pp >= 25 },
  lowcarb: { label: '🥑 Low Carb', test: r => nutr(r).c <= 30 },
};
const isMainDish = r => !(r.tags || []).some(t => /frühstück|snack|dip|dessert|süß|beilage/i.test(t));
const isBreakfast = r => (r.tags || []).some(t => /frühstück/i.test(t));

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
const TITLES = { plan: 'Wochenplan', recipes: 'Rezepte', swipe: 'Essens-Tinder', shop: 'Einkaufsliste', more: 'Mehr' };
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
  $$('#tabbar button[data-view]').forEach(b => {
    const on = b.dataset.view === v; b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (v === 'recipes' ? `<button class="hbtn" data-act="recipeNew" aria-label="Neues Rezept" title="Neues Rezept">${ICON.plus}</button>`
    : v === 'shop' ? `<button class="hbtn" data-act="shopShare" aria-label="Liste teilen" title="Liste teilen">${ICON.share}</button>`
    : v === 'swipe' ? `<button class="hbtn" data-act="swSync" aria-label="Bewertungen übertragen" title="Bewertungen übertragen">⇄</button>` : '');
  const main = $('#main');
  if (v === 'plan') main.innerHTML = viewPlan();
  if (v === 'recipes') { main.innerHTML = viewRecipes(); renderRecipeList(); }
  if (v === 'shop') { main.innerHTML = viewShop(); renderShop(); }
  if (v === 'swipe') { main.innerHTML = viewSwipe(); renderSwipe(); }
  if (v === 'more') main.innerHTML = viewMore();
  updateBadge();
}
function updateBadge() {
  const b = $('#shopBadge'); if (!b) return;
  const n = S.shop.length;
  b.hidden = !n; b.textContent = n;
}

/* ── Plan ── */
function entryInfo(e) {
  if (e.r) {
    const r = recipeById(e.r);
    if (!r) return { emoji: '❓', name: 'Gelöschtes Rezept', meta: '', kcal: 0, p: 0 };
    return { emoji: r.emoji || '🍽️', name: r.name, meta: `${e.s || r.servings} P.`, kcal: nutr(r).kcal, p: nutr(r).p };
  }
  return { emoji: '📝', name: e.t, meta: '', kcal: 0, p: 0 };
}
const fmtInt = n => Math.round(n).toLocaleString('de-DE');
function viewPlan() {
  const ws = ui.weekStart, we = addDays(ws, 6), today = dkey(new Date());
  const isCur = dkey(ws) === dkey(monday(new Date()));
  const range = ws.getMonth() === we.getMonth() ? `${ws.getDate()}.–${fmtDay(we)}` : `${fmtDay(ws)} – ${fmtDay(we)}`;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  let h = `<div class="weeknav">
    <button class="icon-btn" data-act="weekShift" data-n="-7" aria-label="Vorherige Woche">‹</button>
    <button class="weeklabel" data-act="weekToday" title="Zur aktuellen Woche"><b>KW ${isoWeek(ws)}</b><span>${range}</span>${isCur ? '' : '<i class="todaychip">Zurück zu heute</i>'}</button>
    <button class="icon-btn" data-act="weekShift" data-n="7" aria-label="Nächste Woche">›</button></div>`;
  if (boot.notice) {
    h += `<div class="hint warn"><span style="font-size:24px">🛟</span><div><b>Daten wiederhergestellt</b>${esc(boot.notice)}${window.Cloud && Cloud.isOn() ? ' Neuere Änderungen werden aus der Online-Datenbank ergänzt.' : ''}</div><button class="x" data-act="hideNotice" aria-label="Ausblenden">×</button></div>`;
  }
  if (isIOS && !standalone && !S.ui.hideHint) {
    h += `<div class="hint"><span style="font-size:24px">📲</span><div><b>Als App installieren</b>Tippe in Safari auf <b style="display:inline">Teilen</b> und dann auf <b style="display:inline">„Zum Home-Bildschirm“</b>.</div><button class="x" data-act="hideHint" aria-label="Ausblenden">×</button></div>`;
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  let days = '', planned = 0, pastN = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i), k = dkey(d), day = S.plan[k] || {};
    let slots = '', kcal = 0, prot = 0;
    for (const m of meals) {
      const e = day[m.k];
      if (e) {
        const x = entryInfo(e); kcal += x.kcal; prot += x.p; planned++;
        slots += `<button class="slot filled" draggable="true" data-act="slotMenu" data-d="${k}" data-m="${m.k}"><span class="slot-l">${m.short}</span><span class="slot-emoji">${esc(x.emoji)}</span><span class="slot-name">${esc(x.name)}</span><span class="slot-meta">${esc(x.meta)}</span></button>`;
      } else {
        slots += `<button class="slot empty" data-act="slotPick" data-d="${k}" data-m="${m.k}" aria-label="${DAYS[i]} ${m.name}: Gericht wählen"><span class="slot-l">${m.short}</span><span class="slot-add">+ Gericht wählen</span></button>`;
      }
    }
    if (k < today) pastN++;
    days += `<section class="card day${k === today ? ' today' : ''}${k < today ? ' past' : ''}"><div class="day-h"><span class="dn">${DAYS[i]}</span><small>${fmtDay(d)}</small>${k === today ? '<i class="tchip">Heute</i>' : ''}${kcal ? `<em>≈ ${fmtInt(kcal)} kcal · ${Math.round(prot * 400 / kcal)} % P</em>` : ''}</div>${slots}</section>`;
  }
  const total = meals.length * 7, hidePast = isCur && pastN > 0 && !ui.showPast;
  if (hidePast) h += `<button class="pastbtn" data-act="showPast">▸ ${pastN === 1 ? 'Gestern' : pastN + ' vergangene Tage'} anzeigen</button>`;
  h += `<div class="week${hidePast ? ' hide-past' : ''}">${days}
    <section class="card weeksum">
      <div class="ws-h"><b>${isCur ? 'Diese Woche' : 'KW ' + isoWeek(ws)}</b><span>${planned} von ${total} Mahlzeiten geplant</span></div>
      <div class="progress"><i style="width:${total ? Math.round(planned / total * 100) : 0}%"></i></div>
      <div class="ws-acts">
        <button class="btn primary" data-act="weekToShop">🛒 Zutaten auf die Einkaufsliste</button>
        <button class="btn" data-act="weekRandom">🎲 Auffüllen</button>
        <button class="btn" data-act="weekClear">🧹 Leeren</button>
      </div>
      <p class="small muted">kcal-Angaben pro Person · Gerichte lassen sich durch Ziehen verschieben</p>
    </section></div>`;
  return h;
}

/* ── Rezepte ── */
function viewRecipes() {
  return `<div class="search">${ICON.search}<input id="rq" type="search" placeholder="Rezepte oder Zutaten suchen" value="${esc(ui.q)}" autocomplete="off" aria-label="Rezepte oder Zutaten suchen"></div>
    <div class="chips${ui.chipsAll ? ' all' : ''}" id="rtags"></div>
    <div class="listbar"><span class="small muted"><span id="rcount"></span><button class="tlink chipmore" data-act="chipsToggle">${ui.chipsAll ? 'Weniger Kategorien' : 'Alle Kategorien'}</button></span>
      <label class="sortsel"><span>Sortieren:</span><select data-change="sort">
        ${[['name', 'Name'], ['time', 'Zeit'], ['kcal', 'Kalorien'], ['protein', 'Eiweiß (g)'], ['pp', 'Protein-Anteil']].map(([k, l]) => `<option value="${k}" ${S.ui.sort === k ? 'selected' : ''}>${l}</option>`).join('')}
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
function filteredRecipes() {
  const match = matcher(ui.q), tag = ui.tag;
  const list = allRecipes().filter(r => {
    if (tag) {
      if (SMART[tag]) { if (!SMART[tag].test(r)) return false; }
      else if (!(r.tags || []).includes(tag)) return false;
    }
    return match(r);
  });
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'de'),
    time: (a, b) => (a.time || 999) - (b.time || 999),
    kcal: (a, b) => nutr(a).kcal - nutr(b).kcal,
    protein: (a, b) => nutr(b).p - nutr(a).p,
    pp: (a, b) => nutr(b).pp - nutr(a).pp,
  };
  const sorter = sorters[S.ui.sort] || sorters.name;
  return list.sort((a, b) => (isFav(b.id) - isFav(a.id)) || sorter(a, b));
}
function recipeMeta(r) {
  const n = nutr(r);
  return [r.time ? `⏱ ${esc(r.time)} Min.` : '', n.kcal ? `${fmtInt(n.kcal)} kcal` : '', n.kcal ? `💪 ${Math.round(n.pp)} % Protein` : '', n.fish ? '🐟 Fisch' : n.vegan ? '🌱 Vegan' : ''].filter(Boolean).join(' · ');
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
    <span class="remoji">${esc(r.emoji || '🍽️')}</span>
    <span class="rbody"><b>${esc(r.name)}</b><small>${recipeMeta(r)}</small>${(r.tags || []).length ? `<small class="tl">${(r.tags || []).slice(0, 3).map(esc).join(' · ')}</small>` : ''}</span>
    ${isFav(r.id) ? '<span class="fav">♥</span>' : ''}</button>`;
function renderRecipeList() {
  const tags = tagCounts();
  if (ui.tag && !SMART[ui.tag] && !tags.includes(ui.tag)) ui.tag = '';
  const chips = [['', 'Alle'], ...Object.entries(SMART).map(([k, v]) => [k, v.label]), ...tags.map(t => [t, t])];
  if (ui.tag && !SMART[ui.tag]) { const i = chips.findIndex(c => c[0] === ui.tag); if (i > 0) chips.splice(1, 0, chips.splice(i, 1)[0]); } // gewählte Kategorie bleibt sichtbar
  $('#rtags').innerHTML = chips.map(([k, l]) => `<button class="chip${ui.tag === k ? ' on' : ''}" data-act="tagFilter" data-tag="${esc(k)}">${esc(l)}</button>`).join('');
  const list = filteredRecipes();
  $('#rcount').textContent = `${list.length} ${list.length === 1 ? 'Rezept' : 'Rezepte'}`;
  const el = $('#rlist');
  if (!list.length) {
    if (el._io) { el._io.disconnect(); el._io = null; }
    el.innerHTML = `<div class="empty"><div class="big">🔍</div><b>Nichts gefunden</b>Versuch einen anderen Suchbegriff oder Filter.${ui.q || ui.tag ? '<br><button class="btn soft" data-act="recipeResetFilter" style="margin:14px auto 0">Suche zurücksetzen</button>' : ''}</div>`;
    return;
  }
  chunked(el, list, recipeCard);
}

/* ── Einkaufsliste (Bring!-Stil) ── */
const stem = n => { const k = nameKey(n); return k === 'ei' ? 'eier' : k.replace(/(en|n|e|s)$/, ''); };
function decorate(it) {
  const f = matchFood(it.name);
  it.fid = f ? f.id : null;
  if (!it.cat) it.cat = f ? f.cat : guessCat(it.name);
  it.emoji = f ? f.emoji : catOf(it.cat).e;
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
function addQty(it, a, u, w) {
  if (a == null) return;
  const b = toBase(a, u), unit = b.unit || '';
  const q = it.q.find(x => x.u === unit && (x.w || null) === (w || null));
  if (q) q.a += b.amount; else it.q.push({ a: b.amount, u: unit, w: w || null });
}
function addToShop(items, w = null) {
  let added = 0;
  for (const x of items) {
    let it = findItem(x.name);
    if (!it) {
      it = decorate({ id: uid(), name: x.display || shortName(x.name) || x.name, cat: null, q: [], note: '', src: [], w });
      S.shop.push(it); added++;
    } else if (!w) it.w = null;
    addQty(it, x.amount, x.unit, w);
    for (const s of x.src || []) if (!it.src.includes(s)) it.src.push(s);
  }
  return added;
}
function removeWeek(wk) {
  S.shop = S.shop.filter(it => {
    it.q = (it.q || []).filter(q => q.w !== wk);
    return !(it.w === wk && !it.q.length);
  });
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
function recipeItems(r, servings, skipPantry = true) {
  const f = servings / (r.servings || 1), pantry = skipPantry ? pantrySet() : new Set();
  return r.ingredients.filter(i => !pantry.has(nameKey(i.name)) && !pantry.has(i.name.toLowerCase()))
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
function tileHTML({ emoji, name, spec, on, data }) {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  return `<button class="tile${on ? ' on' : ''}" data-act="tile" ${attrs}><span class="te">${esc(emoji)}</span><span class="tn">${esc(name)}</span>${spec ? `<span class="ts">${esc(spec)}</span>` : ''}</button>`;
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
    if (!exact) h += tileHTML({ emoji: catOf(guessCat(p.name)).e, name: p.name, spec: spec || 'Neu', on: isOn(null, p.name), data: { n: p.name, ...qd } });
    h += hits.map(f => tileHTML({ emoji: f.emoji, name: f.name, spec, on: isOn(f.id, f.name), data: { f: f.id, ...qd } })).join('');
    el.innerHTML = h + '</div><p class="small muted" style="margin:10px 4px">Tipp: Menge mit eingeben, z. B. „2 l Milch“ oder „Äpfel 6“. Enter fügt den ersten Treffer hinzu.</p>';
    return;
  }
  // Links: was zu kaufen ist · Rechts (auf großen Bildschirmen daneben): zuletzt verwendet und Katalog
  let left = '', right = '';
  if (S.shop.length) {
    const order = CATS.map(c => c.k);
    const items = [...S.shop].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
    left += `<div class="shead"><b>Zu kaufen</b><span>${S.shop.length} Artikel · <button class="tlink" data-act="shopClear">Liste leeren</button></span></div><div class="tiles">`;
    left += items.map(i => tileHTML({ emoji: i.emoji || catOf(i.cat).e, name: i.name, spec: qtyText(i), on: true, data: { i: i.id } })).join('');
    left += `</div><p class="small muted" style="margin:8px 4px 0">Tippen = gekauft · Gedrückt halten (oder Rechtsklick) = Menge & Details</p>`;
  } else {
    left += `<div class="sempty"><div class="big">🎉</div><b>Alles erledigt!</b><span>Tippe auf Artikel im Katalog oder suche oben, um sie hinzuzufügen.</span></div>`;
  }
  left += `<button class="btn soft" data-act="weekToShopFromList" style="width:100%;margin-top:14px">📅 Zutaten aus dem Wochenplan holen</button>`;
  const recent = S.recent.filter(r => !isOn(null, r.name)).slice(0, 15);
  if (recent.length) {
    right += `<div class="shead"><b>Zuletzt verwendet</b></div><div class="tiles">`;
    right += recent.map(r => { const f = matchFood(r.name); return isOn(f && f.id, r.name) ? '' : tileHTML({ emoji: f ? f.emoji : catOf(guessCat(r.name)).e, name: r.name, data: { n: r.name } }); }).join('');
    right += '</div>';
  }
  right += `<div class="shead"><b>Katalog</b></div>`;
  for (const c of CATS) {
    const foods = FOODS.filter(f => f.cat === c.k);
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
      <div class="field"><label for="e-cat">Kategorie</label><select id="e-cat">${CATS.map(c => `<option value="${c.k}" ${c.k === it.cat ? 'selected' : ''}>${c.e} ${c.name}</option>`).join('')}</select></div>
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
  <div class="section-t">Wochenplan</div>
  <div class="card">
    ${MEALS.map(m => `<label class="setting"><span class="lbl">${m.name}</span><span class="switch"><input type="checkbox" data-change="mealToggle" data-m="${m.k}" ${st.meals.includes(m.k) ? 'checked' : ''}><i></i></span></label>`).join('')}
    <div class="setting"><span><span class="lbl">Standard-Portionen</span><br><span class="sub">für neue Einträge im Plan</span></span>
      <span class="stepper"><button data-act="defServ" data-n="-1" aria-label="Weniger">−</button><output>${st.servings}</output><button data-act="defServ" data-n="1" aria-label="Mehr">+</button></span></div>
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
  <p class="small muted" style="text-align:center;margin:24px 0 0">${allRecipes().length} Rezepte · ${allRecipes().filter(r => nutr(r).fish).length} mit Fisch · Essensplaner v${APP_VERSION} · <button class="tlink" data-act="diag">Diagnose</button><br>Nährwerte sind automatisch berechnete Ca.-Werte.</p>`;
}

/* ───────── Plan-Aktionen ───────── */
function setEntry(d, m, e) {
  S.plan[d] = S.plan[d] || {};
  if (e) S.plan[d][m] = e; else { delete S.plan[d][m]; if (!Object.keys(S.plan[d]).length) delete S.plan[d]; }
  save();
}
// Zwei Plätze im Plan tauschen bzw. ein Gericht auf einen freien Platz schieben
function moveEntry(d, m, to, tm) {
  if (d === to && m === tm) return false;
  const a = S.plan[d]?.[m], b = S.plan[to]?.[tm];
  if (!a) return false;
  setEntry(to, tm, a); setEntry(d, m, b || null);
  render();
  toast(b ? 'Getauscht' : 'Verschoben', { label: 'Rückgängig', fn: () => { setEntry(d, m, a); setEntry(to, tm, b || null); render(); } });
  return true;
}
function stepperHTML(id, val, label = 'Portionen') {
  return `<div class="setting card" style="margin-bottom:14px"><span class="lbl">${label}</span><span class="stepper" data-stepper="${id}"><button data-act="step" data-n="-1" aria-label="Weniger">−</button><output>${val}</output><button data-act="step" data-n="1" aria-label="Mehr">+</button></span></div>`;
}
function openRecipePicker(title, onPick, mealKey) {
  const sh = openSheet({
    title,
    body: `<div class="search">${ICON.search}<input id="pq" type="search" placeholder="Rezept oder Zutat suchen" autocomplete="off" aria-label="Rezept suchen"></div>
      ${stepperHTML('pickServ', S.settings.servings)}
      <form class="addbar" data-form="pickText" style="margin-bottom:14px"><input id="pt" placeholder="Oder eigener Eintrag, z. B. Reste" enterkeyhint="done" aria-label="Eigener Eintrag"><button class="btn soft" style="font-size:15px;width:auto;padding:0 14px">OK</button></form>
      <div class="card" style="padding:2px 12px" id="plist"></div>`,
  });
  pending.pick = onPick;
  const pref = mealKey === 'f' ? isBreakfast : isMainDish;
  const draw = () => {
    const match = matcher($('#pq', sh).value);
    const list = allRecipes().filter(match)
      .sort((a, b) => (isFav(b.id) - isFav(a.id)) || (pref(b) - pref(a)) || a.name.localeCompare(b.name, 'de'));
    const el = $('#plist', sh);
    if (!list.length) { el.innerHTML = `<p class="muted" style="padding:16px 4px">Keine Rezepte gefunden.</p>`; return; }
    chunked(el, list, r => `<button class="pick" data-act="pickRecipe" data-id="${esc(r.id)}"><span class="remoji">${esc(r.emoji || '🍽️')}</span><span class="rbody"><b>${esc(r.name)}</b><small>${recipeMeta(r)}</small></span>${isFav(r.id) ? '<span class="fav">♥</span>' : ''}</button>`, 40);
  };
  $('#pq', sh).addEventListener('input', draw);
  draw();
}
function stepperVal(sh, id) { const o = sh && $(`[data-stepper="${id}"] output`, sh); return o ? +o.textContent || 1 : S.settings.servings; }
function weekKeys() { return Array.from({ length: 7 }, (_, i) => dkey(addDays(ui.weekStart, i))); }

/* ───────── Rezept-Detail & Editor ───────── */
// servings: optional (z. B. die im Wochenplan eingetragenen Portionen)
function openRecipe(id, servings) {
  const r = recipeById(id); if (!r) { toast('Dieses Rezept gibt es nicht mehr'); return; }
  const n = nutr(r);
  const eP = n.p * 4, eC = n.c * 4, eF = n.f * 9, eT = (eP + eC + eF) || 1;
  const rid = esc(r.id), serv = isNum(servings) && servings >= 1 ? servings : r.servings;
  const voted = typeof USERS !== 'undefined' && USERS.some(u => voteOf(u, r.id) !== undefined);
  const sh = openSheet({
    title: '', cls: 'wide',
    left: `<button class="lnk" data-act="closeSheet">Schließen</button>`,
    right: `<button class="lnk r" data-act="recipeEdit" data-id="${rid}">Bearbeiten</button>`,
    body: `<div class="rd"><div class="rd-a">
      <div class="hero"><div class="e">${esc(r.emoji || '🍽️')}</div><h2>${esc(r.name)}</h2>
      <div class="meta">${r.time ? `<span class="pill">⏱ ${esc(r.time)} Min.</span>` : ''}${LEVELS[r.level] ? `<span class="pill">📊 ${LEVELS[r.level]}</span>` : ''}<span class="pill">${n.fish ? '🐟 Fisch' : n.vegan ? '🌱 Vegan' : '🥕 Vegetarisch'}</span>${(r.tags || []).map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>${voted ? `<div class="meta">${USERS.map(u => `<span class="pill">${u} ${voteBadge(voteOf(u, r.id))}</span>`).join('')}</div>` : ''}</div>
      <div class="row">
        <button class="btn soft" data-act="recipeFav" data-id="${rid}">${isFav(r.id) ? '♥ Favorit' : '♡ Merken'}</button>
        <button class="btn soft" data-act="recipeToPlan" data-id="${rid}">📅 Planen</button>
        <button class="btn soft" data-act="recipeShare" data-id="${rid}" aria-label="Rezept teilen" style="flex:0 0 52px;padding:0">${ICON.share}</button>
      </div>
      ${n.kcal ? `<div class="dhead"><h3>Nährwerte</h3><span class="small muted">pro Portion</span></div>
      <div class="card nutcard">
        <div class="nut"><div class="kc"><b>${fmtInt(n.kcal)}</b><span>kcal</span></div>
        <div><b>${fmtInt(n.p)} g</b><span>Eiweiß</span></div><div><b>${fmtInt(n.c)} g</b><span>Kohlenh.</span></div><div><b>${fmtInt(n.f)} g</b><span>Fett</span></div><div><b>${fmtInt(n.fib)} g</b><span>Ballastst.</span></div></div>
        <div class="macro"><i class="mp" style="width:${eP / eT * 100}%"></i><i class="mc" style="width:${eC / eT * 100}%"></i><i class="mf" style="width:${eF / eT * 100}%"></i></div>
        <div class="legend"><span><i class="mp"></i>Eiweiß ${Math.round(eP / eT * 100)} %</span><span><i class="mc"></i>KH ${Math.round(eC / eT * 100)} %</span><span><i class="mf"></i>Fett ${Math.round(eF / eT * 100)} %</span></div>
        ${fitnessHTML(n)}
        <p class="small muted">Ca.-Werte, automatisch aus den Zutaten berechnet${n.coverage < 0.9 ? ' – einige Zutaten wurden nicht erkannt' : ''}.</p>
      </div>` : ''}
      </div><div class="rd-b">
      <div class="dhead"><h3>Zutaten</h3><span class="stepper" data-stepper="detServ"><button data-act="step" data-n="-1" aria-label="Weniger Portionen">−</button><output>${serv}</output><button data-act="step" data-n="1" aria-label="Mehr Portionen">+</button></span></div>
      <ul class="card ing" id="ingList"></ul>
      <button class="btn" style="margin-top:10px;width:100%" data-act="recipeToShop" data-id="${rid}">🛒 Zutaten auf die Einkaufsliste</button>
      ${r.steps.length ? `<div class="dhead"><h3>Zubereitung</h3></div><ol class="steps">${r.steps.map(s => `<li class="card" data-act="stepDone">${stepHTML(s)}</li>`).join('')}</ol><button class="btn primary" style="width:100%;margin-top:10px" data-act="cookStart" data-id="${rid}">👩‍🍳 Kochmodus: Schritt für Schritt</button>` : ''}
      ${r.notes ? `<div class="dhead"><h3>Notizen</h3></div><div class="card notes">${esc(r.notes)}</div>` : ''}
      ${'wakeLock' in navigator ? `<div class="card" style="margin-top:18px"><label class="setting"><span><span class="lbl">Bildschirm anlassen</span><br><span class="sub">praktisch beim Kochen</span></span><span class="switch"><input type="checkbox" data-change="wake"><i></i></span></label></div>` : ''}
      <button class="btn danger" style="width:100%;margin-top:14px" data-act="recipeDelete" data-id="${rid}">${r.builtin ? 'Rezept ausblenden' : 'Rezept löschen'}</button>
      </div></div>`,
    onClose: releaseWake,
  });
  sh.dataset.recipe = r.id;
  drawIngredients(sh);
}
function fitnessHTML(n) {
  const pp = Math.round(n.pp);
  const [lbl, col] = pp >= 30 ? ['Sehr proteinreich – top für Muskelaufbau', 'var(--ok)'] : pp >= 20 ? ['Proteinreich – gut für Fitness & Sättigung', 'var(--ok)'] : pp >= 12 ? ['Ausgewogen – normaler Proteinanteil', '#f2b33d'] : ['Wenig Protein – z. B. mit Skyr, Tofu oder Linsen ergänzen', 'var(--red-t)'];
  return `<div class="fit"><div class="fit-top"><b style="color:${col}">💪 ${pp} %</b><span>der Kalorien aus Protein</span></div>
    <div class="fit-bar"><i style="width:${Math.min(100, pp / 40 * 100)}%;background:${col}"></i><s style="left:30%"></s><s style="left:62.5%"></s></div>
    <div class="fit-scale"><span>0 %</span><span>12</span><span>25</span><span>40 %+</span></div>
    <p class="fit-lbl">${lbl}</p></div>`;
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
    body: `<div class="cook"><div class="cook-main"><div class="cook-prog"><i></i></div><p class="cook-n"></p><p class="cook-t"></p>
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
  const [b, f] = $$('[data-act="cookMove"]', sh);
  b.disabled = i === 0; f.textContent = i === n - 1 ? '✓ Fertig' : 'Weiter →';
}
function drawIngredients(sh) {
  const r = recipeById(sh.dataset.recipe), el = $('#ingList', sh); if (!r || !el) return;
  el.innerHTML = r.ingredients.length ? scaledIngs(r, stepperVal(sh, 'detServ')).map(([a, n]) => `<li><span class="a">${esc(a)}</span><span>${esc(n)}</span></li>`).join('') : `<li class="muted">Keine Zutaten eingetragen.</li>`;
}
function recipeText(r, servings) {
  const n = nutr(r);
  return [`${r.emoji || '🍽️'} ${r.name}`, [r.time ? `${r.time} Min.` : '', `${servings} ${servings === 1 ? 'Portion' : 'Portionen'}`, n.kcal ? `${fmtInt(n.kcal)} kcal pro Portion` : ''].filter(Boolean).join(' · '), '',
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
      <div class="field"><label for="f-emoji">Symbol</label>
        <div class="row" style="align-items:center"><input id="f-emoji" value="${esc(v.emoji)}" maxlength="8" style="max-width:72px;text-align:center;font-size:24px;padding:6px"><span class="small muted" style="flex:3">Eigenes Emoji eintippen oder unten wählen</span></div>
        <div class="emoji-row">${EMOJIS.map(e => `<button type="button" data-act="pickEmoji" data-e="${e}" class="${e === v.emoji ? 'on' : ''}">${e}</button>`).join('')}</div></div>
      <div class="row">
        <div class="field"><label for="f-serv">Portionen</label><input id="f-serv" type="number" inputmode="numeric" min="1" value="${esc(v.servings)}"></div>
        <div class="field"><label for="f-time">Zeit (Min.)</label><input id="f-time" type="number" inputmode="numeric" min="0" value="${esc(v.time)}"></div>
      </div>
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
    tags: [...new Set($('#f-tags', sh).value.split(',').map(s => s.trim()).filter(Boolean))],
    ingredients: $('#f-ing', sh).value.split('\n').map(parseIng).filter(Boolean),
    steps: $('#f-steps', sh).value.split('\n').map(s => s.trim()).filter(Boolean),
    notes: $('#f-notes', sh).value.trim(),
  };
  const id = sh.dataset.edit;
  if (id && BUILTIN_BY_ID.has(id)) S.over[id] = data;
  else if (id) {
    const own = S.recipes.find(x => x.id === id);
    if (own) Object.assign(own, data); else S.recipes.push({ id, created: Date.now(), ...data }); // inzwischen woanders gelöscht → wieder anlegen
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

  weekShift(el) { ui.weekStart = addDays(ui.weekStart, +el.dataset.n); render(); },
  weekToday() { ui.weekStart = monday(new Date()); render(); },
  slotPick(el) {
    const { d, m } = el.dataset, dt = fromKey(d);
    openRecipePicker(`${DAYS[(dt.getDay() + 6) % 7]} · ${meal(m).name}`, e => { setEntry(d, m, e); render(); }, m);
  },
  pickRecipe(el) {
    const sh = topSheet(), cb = pending.pick, s = stepperVal(sh, 'pickServ');
    closeSheet(true); cb && cb({ r: el.dataset.id, s });
  },
  slotMenu(el) {
    const { d, m } = el.dataset, e = S.plan[d]?.[m]; if (!e) return;
    const dt = fromKey(d), x = entryInfo(e), r = e.r && recipeById(e.r);
    const sh = openSheet({
      title: `${DAYS[(dt.getDay() + 6) % 7]} · ${meal(m).name}`,
      left: '<button class="lnk" data-act="closeSheet">Fertig</button>',
      body: `<div class="hero" style="padding-bottom:12px"><div class="e" style="font-size:48px">${esc(x.emoji)}</div><h2 style="font-size:20px">${esc(x.name)}</h2>${r ? `<p class="small muted" style="margin-top:6px">${recipeMeta(r)}</p>` : ''}</div>
        ${r ? stepperHTML('slotServ', e.s || r.servings) : ''}
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
    toast('Entfernt', old ? { label: 'Rückgängig', fn: () => { setEntry(d, m, old); render(); } } : null);
  },
  slotMove() {
    const sh = topSheet(), { d, m } = sh.dataset;
    const days = weekKeys(), meals = MEALS.filter(x => S.settings.meals.includes(x.k));
    const ms = openSheet({
      title: 'Verschieben nach …',
      body: `<div class="card menu">${days.flatMap((k, i) => meals.map(mm => {
        if (k === d && mm.k === m) return '';
        const occ = S.plan[k]?.[mm.k];
        return `<button data-act="slotMoveTo" data-to="${k}" data-tm="${mm.k}"><span class="ico">${DAYS_S[i]}</span>${mm.short}${occ ? ` <span class="muted small">· tauscht mit ${esc(entryInfo(occ).name)}</span>` : ''}</button>`;
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
    const keys = weekKeys(), old = keys.map(k => S.plan[k]);
    if (!old.some(Boolean)) { toast('Diese Woche ist schon leer'); return; }
    confirmSheet('Alle Einträge dieser Woche entfernen?', 'Woche leeren', () => {
      keys.forEach(k => delete S.plan[k]); bulkOk(); save(); render();
      toast('Woche geleert', { label: 'Rückgängig', fn: () => { keys.forEach((k, i) => { if (old[i]) S.plan[k] = old[i]; }); save(); render(); } });
    });
  },
  weekToShop() {
    const wk = weekKeys()[0], items = [];
    let meals = 0;
    for (const k of weekKeys()) for (const e of Object.values(S.plan[k] || {})) {
      const r = e.r && recipeById(e.r); if (!r) continue;
      items.push(...recipeItems(r, e.s || r.servings)); meals++;
    }
    if (!meals) { toast('In dieser Woche ist noch nichts geplant'); return; }
    removeWeek(wk);
    const n = addToShop(items, wk);
    S.ui.view = 'shop'; ui.sq = ''; save(); render(); window.scrollTo(0, 0);
    toast(`${n} Artikel aus ${meals} Gerichten`);
  },
  weekToShopFromList() { ui.weekStart = monday(new Date()); ACT.weekToShop(); },

  tagFilter(el) { ui.tag = ui.tag === el.dataset.tag ? '' : el.dataset.tag; renderRecipeList(); },
  chipsToggle(el) { ui.chipsAll = !ui.chipsAll; $('#rtags').classList.toggle('all', ui.chipsAll); el.textContent = ui.chipsAll ? 'Weniger Kategorien' : 'Alle Kategorien'; },
  recipeResetFilter() { ui.q = ''; ui.tag = ''; render(); },
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
        for (const m of Object.keys(S.plan[k])) if (S.plan[k][m].r === r.id) { slots.push([k, m, S.plan[k][m]]); delete S.plan[k][m]; }
        if (!Object.keys(S.plan[k]).length) delete S.plan[k];
      }
      invalidate(r.id); save(); closeAllSheets(); render();
      toast(r.builtin ? 'Rezept ausgeblendet' : 'Rezept gelöscht', {
        label: 'Rückgängig', fn: () => {
          if (r.builtin) S.hidden = S.hidden.filter(x => x !== r.id);
          else if (own && !S.recipes.some(x => x.id === own.id)) S.recipes.push(own);
          if (wasFav && !isFav(r.id)) S.favs.push(r.id);
          for (const [k, m, e] of slots) { S.plan[k] = S.plan[k] || {}; if (!S.plan[k][m]) S.plan[k][m] = e; }
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
    const old = S.plan[d]?.[m];
    setEntry(d, m, { r: sh.dataset.recipe, s: stepperVal(sh, 'ppServ') }); closeSheet(true);
    const dt = fromKey(d);
    toast(`Eingetragen: ${DAYS[(dt.getDay() + 6) % 7]}, ${meal(m).short}`, old ? { label: 'Rückgängig', fn: () => { setEntry(d, m, old); if (S.ui.view === 'plan') render(); } } : null);
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
    if (st.dataset.stepper === 'slotServ') { const e = S.plan[sh.dataset.d]?.[sh.dataset.m]; if (e) { e.s = v; save(); } }
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
    const cat = $('#e-cat', sh).value;
    Object.assign(it, { name, q: sp.q, note: sp.note, w: null });
    decorate(it); it.cat = cat; if (!matchFood(name)) it.emoji = catOf(cat).e;
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
    const text = 'Einkaufsliste\n' + CATS.map(c => {
      const it = S.shop.filter(i => catOf(i.cat).k === c.k);
      return it.length ? `\n${c.e} ${c.name}\n` + it.map(i => { const q = qtyText(i); return `▢ ${i.name}${q ? ' – ' + q : ''}`; }).join('\n') : '';
    }).join('');
    if (navigator.share) { try { await navigator.share({ title: 'Einkaufsliste', text }); } catch (e) { /* abgebrochen */ } return; }
    try { await navigator.clipboard.writeText(text); toast('Liste kopiert'); } catch (e) { toast('Teilen nicht möglich'); }
  },

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
  else if (/^[1-5]$/.test(e.key)) { const b = $(`#tabbar button[data-view="${VIEWS[+e.key - 1]}"]`); if (b) guard(() => ACT.tab(b), 'tabkey'); }
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
const CLOUD_LIST = { recipe: ['r:', 'recipes'], shop: ['s:', 'shop'] };
const CLOUD_SET = { hidden: ['h:', 'hidden'], fav: ['f:', 'favs'] };
if (window.Cloud) Cloud.init({
  app: 'essen',
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
    const left = S.recipes.length + S.favs.length + S.hidden.length + Object.keys(S.over).length
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
