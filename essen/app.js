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
const meal = k => MEALS.find(m => m.k === k);

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
const KEY = 'essen.v1';
function fresh() {
  return {
    v: 2, recipes: [], over: {}, hidden: [], favs: [], plan: {}, shop: [], recent: [],
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
    for (const r of s.recipes || []) {
      if (r.name in OLD_SAMPLES) { const nid = bid(OLD_SAMPLES[r.name]); idMap[r.id] = nid; if (r.fav && nid) favs.push(nid); }
      else { if (r.fav) favs.push(r.id); delete r.fav; keep.push(r); }
    }
    const plan = {};
    for (const [d, day] of Object.entries(s.plan || {})) for (const [m, e] of Object.entries(day)) {
      let ne = e;
      if (e.r && e.r in idMap) ne = idMap[e.r] ? { ...e, r: idMap[e.r] } : null;
      if (ne) { plan[d] = plan[d] || {}; plan[d][m] = ne; }
    }
    const shop = [], recent = [];
    for (const i of s.shop || []) {
      if (i.q) { shop.push(i); continue; }
      const w = i.auto || null;
      const it = decorate({ id: i.id || uid(), name: i.name, cat: null, q: i.amount != null ? [{ a: i.amount, u: i.unit || '', w }] : [], note: '', src: i.src || [], w });
      if (i.done) recent.push({ name: it.name }); else shop.push(it);
    }
    s = { ...s, v: 2, recipes: keep, favs, plan, shop, recent, over: s.over || {}, hidden: s.hidden || [] };
  }
  return { ...f, ...s, settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui, open: { ...(s.ui && s.ui.open) } } };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* ignore */ }
  return fresh();
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  updateBadge();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const ui = { weekStart: monday(new Date()), q: '', tag: '', sq: '' };

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
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button data-act="toastAct">${esc(action.label)}</button>` : '');
  pending.toast = action ? action.fn : null;
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 4000 : 2200);
}

/* ───────── Sheets ───────── */
const sheetStack = [];
function openSheet({ title = '', left = '', right = '', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head">${left || '<button class="lnk" data-act="closeSheet">Abbrechen</button>'}<b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  const entry = { ov, sh, onClose, t: Date.now() };
  ov.addEventListener('click', () => { if (Date.now() - entry.t > 450) closeSheet(); });
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  sheetStack.push(entry);
  addSwipeToClose(sh);
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
function topSheet() { return sheetStack.length ? sheetStack[sheetStack.length - 1].sh : null; }
function addSwipeToClose(sh) {
  const head = $('.sheet-head', sh); let y0 = null, dy = 0;
  head.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
  head.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeSheet(); y0 = null; });
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
const TITLES = { plan: 'Wochenplan', recipes: 'Rezepte', shop: 'Einkaufsliste', more: 'Mehr' };
function render() {
  const v = S.ui.view;
  $('#title').textContent = TITLES[v];
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $('#hact').innerHTML = v === 'recipes' ? `<button class="hbtn" data-act="recipeNew" aria-label="Neues Rezept">${ICON.plus}</button>`
    : v === 'shop' ? `<button class="hbtn" data-act="shopShare" aria-label="Liste teilen">${ICON.share}</button>` : '';
  const main = $('#main');
  if (v === 'plan') main.innerHTML = viewPlan();
  if (v === 'recipes') { main.innerHTML = viewRecipes(); renderRecipeList(); }
  if (v === 'shop') { main.innerHTML = viewShop(); renderShop(); }
  if (v === 'more') main.innerHTML = viewMore();
  updateBadge();
}
function updateBadge() {
  const n = S.shop.length, b = $('#shopBadge');
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
  const range = ws.getMonth() === we.getMonth() ? `${ws.getDate()}.–${fmtDay(we)}` : `${fmtDay(ws)} – ${fmtDay(we)}`;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  let h = `<div class="weeknav">
    <button class="icon-btn" data-act="weekShift" data-n="-7" aria-label="Vorherige Woche">‹</button>
    <button class="weeklabel" data-act="weekToday"><b>KW ${isoWeek(ws)}</b><span>${range}</span></button>
    <button class="icon-btn" data-act="weekShift" data-n="7" aria-label="Nächste Woche">›</button></div>`;
  if (isIOS && !standalone && !S.ui.hideHint) {
    h += `<div class="hint"><span style="font-size:24px">📲</span><div><b>Als App installieren</b>Tippe unten auf <b style="display:inline">Teilen</b> und dann auf <b style="display:inline">„Zum Home-Bildschirm“</b>.</div><button class="x" data-act="hideHint" aria-label="Ausblenden">×</button></div>`;
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i), k = dkey(d), day = S.plan[k] || {};
    let slots = '', kcal = 0, prot = 0;
    for (const m of meals) {
      const e = day[m.k];
      if (e) {
        const x = entryInfo(e); kcal += x.kcal; prot += x.p;
        slots += `<button class="slot filled" data-act="slotMenu" data-d="${k}" data-m="${m.k}"><span class="slot-l">${m.short}</span><span class="slot-emoji">${x.emoji}</span><span class="slot-name">${esc(x.name)}</span><span class="slot-meta">${x.meta}</span></button>`;
      } else {
        slots += `<button class="slot empty" data-act="slotPick" data-d="${k}" data-m="${m.k}"><span class="slot-l">${m.short}</span><span class="slot-add">+ Gericht wählen</span></button>`;
      }
    }
    h += `<section class="card day${k === today ? ' today' : ''}${k < today ? ' past' : ''}"><div class="day-h"><span>${DAYS[i]}</span><small>${fmtDay(d)}</small>${kcal ? `<em>≈ ${fmtInt(kcal)} kcal · ${Math.round(prot * 400 / kcal)} % P</em>` : ''}</div>${slots}</section>`;
  }
  h += `<div class="stack" style="margin-top:18px">
    <button class="btn primary" data-act="weekToShop">🛒 Einkaufsliste für diese Woche</button>
    <div class="row"><button class="btn" data-act="weekRandom">🎲 Auffüllen</button><button class="btn" data-act="weekClear">🧹 Leeren</button></div></div>
    <p class="small muted" style="text-align:center;margin-top:12px">kcal-Angaben pro Person</p>`;
  return h;
}

/* ── Rezepte ── */
function viewRecipes() {
  return `<div class="search">${ICON.search}<input id="rq" type="search" placeholder="Rezepte oder Zutaten suchen" value="${esc(ui.q)}" autocomplete="off"></div>
    <div class="chips" id="rtags"></div>
    <div class="listbar"><span id="rcount" class="small muted"></span>
      <label class="sortsel"><span>Sortieren:</span><select data-change="sort">
        ${[['name', 'Name'], ['time', 'Zeit'], ['kcal', 'Kalorien'], ['protein', 'Eiweiß (g)'], ['pp', 'Protein-Anteil']].map(([k, l]) => `<option value="${k}" ${S.ui.sort === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select></label></div>
    <div class="list" id="rlist"></div>`;
}
function tagCounts() {
  const m = new Map();
  allRecipes().forEach(r => (r.tags || []).forEach(t => m.set(t, (m.get(t) || 0) + 1)));
  return [...m.entries()].filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}
function filteredRecipes() {
  const q = ui.q.trim().toLowerCase(), tag = ui.tag;
  const list = allRecipes().filter(r => {
    if (tag) {
      if (SMART[tag]) { if (!SMART[tag].test(r)) return false; }
      else if (!(r.tags || []).includes(tag)) return false;
    }
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || (r.tags || []).some(t => t.toLowerCase().includes(q)) || r.ingredients.some(i => i.name.toLowerCase().includes(q));
  });
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'de'),
    time: (a, b) => (a.time || 999) - (b.time || 999),
    kcal: (a, b) => nutr(a).kcal - nutr(b).kcal,
    protein: (a, b) => nutr(b).p - nutr(a).p,
    pp: (a, b) => nutr(b).pp - nutr(a).pp,
  };
  return list.sort((a, b) => (isFav(b.id) - isFav(a.id)) || sorters[S.ui.sort || 'name'](a, b));
}
function recipeMeta(r) {
  const n = nutr(r);
  return [r.time ? `⏱ ${r.time} Min.` : '', n.kcal ? `${fmtInt(n.kcal)} kcal` : '', n.kcal ? `💪 ${Math.round(n.pp)} % Protein` : '', n.fish ? '🐟 Fisch' : n.vegan ? '🌱 Vegan' : ''].filter(Boolean).join(' · ');
}
function renderRecipeList() {
  const tags = tagCounts();
  if (ui.tag && !SMART[ui.tag] && !tags.includes(ui.tag)) ui.tag = '';
  const chips = [['', 'Alle'], ...Object.entries(SMART).map(([k, v]) => [k, v.label]), ...tags.map(t => [t, t])];
  $('#rtags').innerHTML = chips.map(([k, l]) => `<button class="chip${ui.tag === k ? ' on' : ''}" data-act="tagFilter" data-tag="${esc(k)}">${esc(l)}</button>`).join('');
  const list = filteredRecipes();
  $('#rcount').textContent = `${list.length} ${list.length === 1 ? 'Rezept' : 'Rezepte'}`;
  const el = $('#rlist');
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="big">🔍</div><b>Nichts gefunden</b>Versuch einen anderen Suchbegriff oder Filter.</div>`;
    return;
  }
  el.innerHTML = list.map(r => `<button class="card rcard" data-act="recipeOpen" data-id="${r.id}">
    <span class="remoji">${esc(r.emoji || '🍽️')}</span>
    <span class="rbody"><b>${esc(r.name)}</b><small>${recipeMeta(r)}</small>${(r.tags || []).length ? `<small class="tl">${(r.tags || []).slice(0, 3).map(esc).join(' · ')}</small>` : ''}</span>
    ${isFav(r.id) ? '<span class="fav">♥</span>' : ''}</button>`).join('');
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
  return `<button class="tile${on ? ' on' : ''}" data-act="tile" ${attrs}><span class="te">${emoji}</span><span class="tn">${esc(name)}</span>${spec ? `<span class="ts">${esc(spec)}</span>` : ''}</button>`;
}
function viewShop() {
  return `<div class="search">${ICON.search}<input id="sq" type="search" placeholder="Was brauchst du?" value="${esc(ui.sq)}" autocomplete="off" enterkeyhint="done"></div><div id="shoparea"></div>`;
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
    el.innerHTML = h + '</div><p class="small muted" style="margin:10px 4px">Tipp: Menge mit eingeben, z. B. „2 l Milch“ oder „Äpfel 6“.</p>';
    return;
  }
  let h = '';
  if (S.shop.length) {
    const order = CATS.map(c => c.k);
    const items = [...S.shop].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
    h += `<div class="shead"><b>Zu kaufen</b><span>${S.shop.length} Artikel</span></div><div class="tiles">`;
    h += items.map(i => tileHTML({ emoji: i.emoji || catOf(i.cat).e, name: i.name, spec: qtyText(i), on: true, data: { i: i.id } })).join('');
    h += `</div><p class="small muted" style="margin:8px 4px 0">Tippen = gekauft · Gedrückt halten = Menge & Details</p>`;
  } else {
    h += `<div class="sempty"><div class="big">🎉</div><b>Alles erledigt!</b><span>Tippe unten auf Artikel oder suche oben, um sie hinzuzufügen.</span></div>`;
  }
  h += `<button class="btn soft" data-act="weekToShopFromList" style="width:100%;margin-top:14px">📅 Zutaten aus dem Wochenplan holen</button>`;
  const recent = S.recent.filter(r => !isOn(null, r.name)).slice(0, 15);
  if (recent.length) {
    h += `<div class="shead"><b>Zuletzt verwendet</b></div><div class="tiles">`;
    h += recent.map(r => { const f = matchFood(r.name); return isOn(f && f.id, r.name) ? '' : tileHTML({ emoji: f ? f.emoji : catOf(guessCat(r.name)).e, name: r.name, data: { n: r.name } }); }).join('');
    h += '</div>';
  }
  h += `<div class="shead"><b>Katalog</b></div>`;
  for (const c of CATS) {
    const foods = FOODS.filter(f => f.cat === c.k);
    if (!foods.length) continue;
    const open = !!S.ui.open[c.k];
    const n = foods.filter(f => isOn(f.id, f.name)).length;
    h += `<button class="cathead${open ? ' open' : ''}" data-act="catToggle" data-c="${c.k}"><span>${c.e}</span><b>${c.name}</b>${n ? `<i>${n}</i>` : ''}<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`;
    if (open) h += '<div class="tiles cat">' + foods.map(f => tileHTML({ emoji: f.emoji, name: f.name, on: isOn(f.id, f.name), data: { f: f.id } })).join('') + '</div>';
  }
  el.innerHTML = h;
}
function itemFromTile(t) {
  const { i, f, n } = t.dataset;
  if (i) return S.shop.find(x => x.id === i) || null;
  const fid = f != null && f !== '' ? +f : null;
  const name = fid != null ? FOODS[fid].name : n;
  return findItem(name, fid);
}
function addFromTile(t) {
  const { f, n, a, u } = t.dataset;
  const fid = f != null && f !== '' ? +f : null;
  const name = fid != null ? FOODS[fid].name : n;
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
  const st = S.settings;
  return `<div class="section-t">Wochenplan</div>
  <div class="card">
    ${MEALS.map(m => `<label class="setting"><span class="lbl">${m.name}</span><span class="switch"><input type="checkbox" data-change="mealToggle" data-m="${m.k}" ${st.meals.includes(m.k) ? 'checked' : ''}><i></i></span></label>`).join('')}
    <div class="setting"><span><span class="lbl">Standard-Portionen</span><br><span class="sub">für neue Einträge im Plan</span></span>
      <span class="stepper"><button data-act="defServ" data-n="-1">−</button><output>${st.servings}</output><button data-act="defServ" data-n="1">+</button></span></div>
  </div>
  <div class="section-t">Immer zuhause</div>
  <div class="card" style="padding:12px">
    <textarea id="pantry" data-change="pantry" rows="5" placeholder="Eine Zutat pro Zeile">${esc(st.pantry)}</textarea>
    <p class="small muted" style="margin:8px 4px 0">Diese Zutaten werden beim Übernehmen aus dem Wochenplan übersprungen.</p>
  </div>
  <div class="section-t">Daten & Backup</div>
  <div class="card menu">
    <button data-act="exportData"><span class="ico">💾</span>Backup exportieren</button>
    <button data-act="importData"><span class="ico">📂</span>Backup importieren</button>
    ${S.hidden.length ? `<button data-act="restoreHidden"><span class="ico">↩️</span>${S.hidden.length} ausgeblendete Rezepte zurückholen</button>` : ''}
    <button data-act="resetAll"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>
  <p class="small muted" style="margin:0 4px">Deine Daten werden nur auf diesem Gerät gespeichert – kein Konto, keine Cloud, keine Kosten. Exportiere ab und zu ein Backup, z. B. in die Dateien-App oder iCloud Drive.</p>
  <div class="section-t">Auf dem iPhone installieren</div>
  <div class="card" style="padding:14px 16px;font-size:15px;line-height:1.55">
    1. Diese Seite in <b>Safari</b> öffnen<br>2. Unten auf <b>Teilen</b> (□↑) tippen<br>3. <b>„Zum Home-Bildschirm“</b> wählen<br>
    <span class="muted small">Danach startet die App im Vollbild und funktioniert auch offline.</span>
  </div>
  <p class="small muted" style="text-align:center;margin:24px 0 0">${allRecipes().length} Rezepte · ${allRecipes().filter(r => nutr(r).fish).length} mit Fisch · Essensplaner v3.0<br>Nährwerte sind automatisch berechnete Ca.-Werte.</p>`;
}

/* ───────── Plan-Aktionen ───────── */
function setEntry(d, m, e) {
  S.plan[d] = S.plan[d] || {};
  if (e) S.plan[d][m] = e; else { delete S.plan[d][m]; if (!Object.keys(S.plan[d]).length) delete S.plan[d]; }
  save();
}
function stepperHTML(id, val, label = 'Portionen') {
  return `<div class="setting card" style="margin-bottom:14px"><span class="lbl">${label}</span><span class="stepper" data-stepper="${id}"><button data-act="step" data-n="-1">−</button><output>${val}</output><button data-act="step" data-n="1">+</button></span></div>`;
}
function openRecipePicker(title, onPick, mealKey) {
  const sh = openSheet({
    title,
    body: `<div class="search">${ICON.search}<input id="pq" type="search" placeholder="Rezept suchen" autocomplete="off"></div>
      ${stepperHTML('pickServ', S.settings.servings)}
      <form class="addbar" data-form="pickText" style="margin-bottom:14px"><input id="pt" placeholder="Oder eigener Eintrag, z. B. Reste" enterkeyhint="done"><button class="btn soft" style="font-size:15px;width:auto;padding:0 14px">OK</button></form>
      <div class="card" style="padding:2px 12px" id="plist"></div>`,
  });
  pending.pick = onPick;
  const draw = () => {
    const q = $('#pq', sh).value.trim().toLowerCase();
    const pref = mealKey === 'f' ? isBreakfast : isMainDish;
    const list = allRecipes().filter(r => !q || r.name.toLowerCase().includes(q) || (r.tags || []).some(t => t.toLowerCase().includes(q)) || r.ingredients.some(i => i.name.toLowerCase().includes(q)))
      .sort((a, b) => (isFav(b.id) - isFav(a.id)) || (pref(b) - pref(a)) || a.name.localeCompare(b.name, 'de'));
    $('#plist', sh).innerHTML = list.length ? list.map(r => `<button class="pick" data-act="pickRecipe" data-id="${r.id}"><span class="remoji">${esc(r.emoji || '🍽️')}</span><span class="rbody"><b>${esc(r.name)}</b><small>${recipeMeta(r)}</small></span>${isFav(r.id) ? '<span class="fav">♥</span>' : ''}</button>`).join('')
      : `<p class="muted" style="padding:16px 4px">Keine Rezepte gefunden.</p>`;
  };
  $('#pq', sh).addEventListener('input', draw);
  draw();
}
function stepperVal(sh, id) { return +$(`[data-stepper="${id}"] output`, sh).textContent; }
function weekKeys() { return Array.from({ length: 7 }, (_, i) => dkey(addDays(ui.weekStart, i))); }

/* ───────── Rezept-Detail & Editor ───────── */
function openRecipe(id) {
  const r = recipeById(id); if (!r) return;
  const n = nutr(r);
  const eP = n.p * 4, eC = n.c * 4, eF = n.f * 9, eT = (eP + eC + eF) || 1;
  const sh = openSheet({
    title: '',
    left: `<button class="lnk" data-act="closeSheet">Schließen</button>`,
    right: `<button class="lnk r" data-act="recipeEdit" data-id="${r.id}">Bearbeiten</button>`,
    body: `<div class="hero"><div class="e">${esc(r.emoji || '🍽️')}</div><h2>${esc(r.name)}</h2>
      <div class="meta">${r.time ? `<span class="pill">⏱ ${r.time} Min.</span>` : ''}${r.level ? `<span class="pill">📊 ${LEVELS[r.level]}</span>` : ''}<span class="pill">${n.fish ? '🐟 Fisch' : n.vegan ? '🌱 Vegan' : '🥕 Vegetarisch'}</span>${(r.tags || []).map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div></div>
      <div class="row">
        <button class="btn soft" data-act="recipeFav" data-id="${r.id}">${isFav(r.id) ? '♥ Favorit' : '♡ Merken'}</button>
        <button class="btn soft" data-act="recipeToPlan" data-id="${r.id}">📅 Planen</button>
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
      <div class="dhead"><h3>Zutaten</h3><span class="stepper" data-stepper="detServ"><button data-act="step" data-n="-1">−</button><output>${r.servings}</output><button data-act="step" data-n="1">+</button></span></div>
      <ul class="card ing" id="ingList"></ul>
      <button class="btn" style="margin-top:10px;width:100%" data-act="recipeToShop" data-id="${r.id}">🛒 Zutaten auf die Einkaufsliste</button>
      ${r.steps.length ? `<div class="dhead"><h3>Zubereitung</h3></div><ol class="steps">${r.steps.map(s => `<li class="card" data-act="stepDone">${stepHTML(s)}</li>`).join('')}</ol><button class="btn primary" style="width:100%;margin-top:10px" data-act="cookStart" data-id="${r.id}">👩‍🍳 Kochmodus: Schritt für Schritt</button>` : ''}
      ${r.notes ? `<div class="dhead"><h3>Notizen</h3></div><div class="card notes">${esc(r.notes)}</div>` : ''}
      ${'wakeLock' in navigator ? `<div class="card" style="margin-top:18px"><label class="setting"><span><span class="lbl">Kochmodus</span><br><span class="sub">Bildschirm bleibt an</span></span><span class="switch"><input type="checkbox" data-change="wake"><i></i></span></label></div>` : ''}
      <button class="btn danger" style="width:100%;margin-top:14px" data-act="recipeDelete" data-id="${r.id}">${r.builtin ? 'Rezept ausblenden' : 'Rezept löschen'}</button>`,
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
function openCook(id) {
  const r = recipeById(id); if (!r) return;
  const sh = openSheet({
    title: r.name, left: '<button class="lnk" data-act="closeSheet">Beenden</button>',
    body: `<div class="cook"><div class="cook-prog"><i></i></div><p class="cook-n"></p><p class="cook-t"></p>
      <div class="row"><button class="btn plain" data-act="cookMove" data-n="-1">← Zurück</button><button class="btn primary" data-act="cookMove" data-n="1">Weiter →</button></div>
      <details class="card cook-ing"><summary>Zutaten anzeigen</summary><ul>${r.ingredients.map(i => `<li>${esc(ingLine(i))}</li>`).join('')}</ul></details></div>`,
    onClose: releaseWake,
  });
  sh.dataset.recipe = id; sh.dataset.i = 0; drawCook(sh);
  if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLock = w; }).catch(() => {});
}
function drawCook(sh) {
  const r = recipeById(sh.dataset.recipe), i = +sh.dataset.i, n = r.steps.length;
  $('.cook-prog i', sh).style.width = `${(i + 1) / n * 100}%`;
  $('.cook-n', sh).textContent = `Schritt ${i + 1} von ${n}`;
  $('.cook-t', sh).innerHTML = stepHTML(r.steps[i]);
  const [b, f] = $$('[data-act="cookMove"]', sh);
  b.disabled = i === 0; f.textContent = i === n - 1 ? '✓ Fertig' : 'Weiter →';
}
function drawIngredients(sh) {
  const r = recipeById(sh.dataset.recipe); if (!r) return;
  const f = stepperVal(sh, 'detServ') / (r.servings || 1);
  $('#ingList', sh).innerHTML = r.ingredients.length ? r.ingredients.map(i => {
    let a = i.unit || '';
    if (i.amount != null) { const b = toBase(i.amount * f, i.unit); a = fmtAmount(b.amount, b.unit); }
    return `<li><span class="a">${esc(a)}</span><span>${esc(i.name)}</span></li>`;
  }).join('') : `<li class="muted">Keine Zutaten eingetragen.</li>`;
}

let wakeLock = null;
async function setWake(on) {
  try {
    if (on) { wakeLock = await navigator.wakeLock.request('screen'); toast('Kochmodus an – Bildschirm bleibt an'); }
    else releaseWake();
  } catch (e) { toast('Kochmodus nicht verfügbar'); }
}
function releaseWake() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }

const EMOJIS = ['🍝', '🍛', '🍲', '🥘', '🥗', '🍕', '🍔', '🌮', '🌯', '🥙', '🍜', '🍣', '🍱', '🥟', '🧆', '🥚', '🍳', '🥞', '🧇', '🥐', '🥪', '🥣', '🥛', '🫑', '🥦', '🥕', '🍆', '🥔', '🍄', '🌶️', '🧀', '🌱', '🎃', '🍰', '🧁', '🍪', '🍎', '🍓', '🍌', '🥤'];
function openEditor(id) {
  const r = id ? recipeById(id) : null;
  const v = r || { name: '', emoji: '🍽️', servings: S.settings.servings, time: '', level: 1, tags: [], ingredients: [], steps: [], notes: '' };
  const sh = openSheet({
    title: r ? 'Rezept bearbeiten' : 'Neues Rezept',
    right: `<button class="lnk r" data-act="recipeSave">Sichern</button>`,
    body: `<form data-form="recipeSave" autocomplete="off">
      <div class="field"><label for="f-name">Name</label><input id="f-name" required value="${esc(v.name)}" placeholder="z. B. Omas Gemüsesuppe"></div>
      <div class="field"><label>Symbol</label>
        <div class="row" style="align-items:center"><input id="f-emoji" value="${esc(v.emoji)}" maxlength="4" style="max-width:72px;text-align:center;font-size:24px;padding:6px"><span class="small muted" style="flex:3">Eigenes Emoji eintippen oder unten wählen</span></div>
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
      ${r && r.edited ? `<button type="button" class="btn danger" style="width:100%;margin-top:6px" data-act="recipeRevert" data-id="${r.id}">Original wiederherstellen</button>` : ''}
      </form>`,
  });
  sh.dataset.edit = r ? r.id : '';
  if (!r) setTimeout(() => $('#f-name', sh).focus(), 350);
}
function saveEditor(sh) {
  const name = $('#f-name', sh).value.trim();
  if (!name) { toast('Bitte einen Namen eingeben'); $('#f-name', sh).focus(); return; }
  const data = {
    name,
    emoji: $('#f-emoji', sh).value.trim() || '🍽️',
    servings: Math.max(1, parseInt($('#f-serv', sh).value) || 1),
    time: parseInt($('#f-time', sh).value) || '',
    level: +$('#f-level', sh).value || 1,
    tags: [...new Set($('#f-tags', sh).value.split(',').map(s => s.trim()).filter(Boolean))],
    ingredients: $('#f-ing', sh).value.split('\n').map(parseIng).filter(Boolean),
    steps: $('#f-steps', sh).value.split('\n').map(s => s.trim()).filter(Boolean),
    notes: $('#f-notes', sh).value.trim(),
  };
  const id = sh.dataset.edit;
  if (id && BUILTIN_BY_ID.has(id)) S.over[id] = data;
  else if (id) Object.assign(S.recipes.find(x => x.id === id), data);
  else S.recipes.push({ id: uid(), created: Date.now(), ...data });
  invalidate(id); save();
  closeSheet();
  if (id) { closeSheet(); setTimeout(() => openRecipe(id), 330); }
  render();
  toast(id ? 'Rezept gespeichert' : 'Rezept angelegt');
}

function openPlanFor(recipe) {
  const opts = [], t = startOfDay(new Date());
  for (let i = 0; i < 21; i++) {
    const d = addDays(t, i);
    opts.push(`<option value="${dkey(d)}">${i === 0 ? 'Heute' : i === 1 ? 'Morgen' : DAYS[(d.getDay() + 6) % 7]}, ${fmtDay(d)}</option>`);
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  const def = isBreakfast(recipe) && meals.find(m => m.k === 'f') ? 'f' : meals.find(m => m.k === 'a') ? 'a' : (meals[0] || MEALS[2]).k;
  const sh = openSheet({
    title: 'In Wochenplan eintragen',
    body: `<div class="field"><label>Tag</label><select id="pp-day">${opts.join('')}</select></div>
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
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!Array.isArray(d.recipes)) throw new Error('bad');
      confirmSheet('Backup laden? Deine aktuellen Daten auf diesem Gerät werden ersetzt.', 'Backup laden', () => {
        const uiKeep = S.ui;
        S = migrate(d); S.ui = uiKeep; invalidate(); save(); render(); toast('Backup geladen');
      });
    } catch (e) { toast('Datei ist kein gültiges Backup'); }
  };
  rd.readAsText(file);
}

/* ───────── Aktionen ───────── */
const ACT = {
  tab(el) { closeAllSheets(); S.ui.view = el.dataset.view; save(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },
  hideHint() { S.ui.hideHint = true; save(); render(); },

  weekShift(el) { ui.weekStart = addDays(ui.weekStart, +el.dataset.n); render(); },
  weekToday() { ui.weekStart = monday(new Date()); render(); },
  slotPick(el) {
    const { d, m } = el.dataset, dt = fromKey(d);
    openRecipePicker(`${DAYS[(dt.getDay() + 6) % 7]} · ${meal(m).name}`, e => { setEntry(d, m, e); render(); }, m);
  },
  pickRecipe(el) {
    const sh = topSheet(), cb = pending.pick, s = stepperVal(sh, 'pickServ');
    closeSheet(); cb && cb({ r: el.dataset.id, s });
  },
  slotMenu(el) {
    const { d, m } = el.dataset, e = S.plan[d]?.[m]; if (!e) return;
    const dt = fromKey(d), x = entryInfo(e), r = e.r && recipeById(e.r);
    const sh = openSheet({
      title: `${DAYS[(dt.getDay() + 6) % 7]} · ${meal(m).name}`,
      left: '<button class="lnk" data-act="closeSheet">Fertig</button>',
      body: `<div class="hero" style="padding-bottom:12px"><div class="e" style="font-size:48px">${x.emoji}</div><h2 style="font-size:20px">${esc(x.name)}</h2>${r ? `<p class="small muted" style="margin-top:6px">${recipeMeta(r)}</p>` : ''}</div>
        ${r ? stepperHTML('slotServ', e.s || r.servings) : ''}
        <div class="card menu">
          ${r ? `<button data-act="slotView"><span class="ico">📖</span>Rezept ansehen</button>` : ''}
          <button data-act="slotReplace"><span class="ico">🔄</span>Anderes Gericht wählen</button>
          <button data-act="slotMove"><span class="ico">↔️</span>Auf anderen Tag verschieben</button>
          <button data-act="slotRemove"><span class="ico">🗑️</span><span class="red">Entfernen</span></button>
        </div>`,
      onClose: () => render(),
    });
    sh.dataset.d = d; sh.dataset.m = m;
  },
  slotView() { const sh = topSheet(); const e = S.plan[sh.dataset.d]?.[sh.dataset.m]; if (e?.r) openRecipe(e.r); },
  slotReplace() {
    const sh = topSheet(), { d, m } = sh.dataset; closeSheet();
    setTimeout(() => ACT.slotPick({ dataset: { d, m } }), 50);
  },
  slotRemove() { const sh = topSheet(); setEntry(sh.dataset.d, sh.dataset.m, null); closeSheet(); toast('Entfernt'); },
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
    const a = S.plan[d]?.[m], b = S.plan[to]?.[tm];
    setEntry(to, tm, a); setEntry(d, m, b || null);
    closeSheet(); closeSheet(); toast('Verschoben');
  },
  weekRandom() {
    const all = allRecipes();
    if (!all.length) { toast('Lege zuerst Rezepte an'); return; }
    const used = new Set(weekKeys().flatMap(k => Object.values(S.plan[k] || {}).map(e => e.r)).filter(Boolean));
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const take = list => {
      if (!list.length) list = all;
      const unused = list.filter(r => !used.has(r.id));
      const src = unused.length ? unused : list;
      const favs = src.filter(r => isFav(r.id));
      const r = favs.length && Math.random() < .4 ? rnd(favs) : rnd(src);
      used.add(r.id); return r;
    };
    const mains = all.filter(isMainDish), breakfasts = all.filter(isBreakfast);
    let n = 0;
    for (const k of weekKeys()) {
      if (k < dkey(new Date())) continue;
      for (const m of S.settings.meals) {
        if (S.plan[k]?.[m]) continue;
        const r = take(m === 'f' ? breakfasts : mains);
        S.plan[k] = S.plan[k] || {}; S.plan[k][m] = { r: r.id, s: S.settings.servings }; n++;
      }
    }
    save(); render(); toast(n ? `${n} Gerichte eingeplant` : 'Keine freien Plätze');
  },
  weekClear() {
    confirmSheet('Alle Einträge dieser Woche entfernen?', 'Woche leeren', () => {
      weekKeys().forEach(k => delete S.plan[k]); save(); render(); toast('Woche geleert');
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
    const r = recipeById(el.dataset.id);
    confirmSheet(r.builtin ? `„${r.name}“ ausblenden? Du kannst es unter „Mehr“ zurückholen.` : `„${r.name}“ löschen?`, r.builtin ? 'Ausblenden' : 'Löschen', () => {
      if (r.builtin) S.hidden.push(r.id);
      else S.recipes = S.recipes.filter(x => x.id !== r.id);
      S.favs = S.favs.filter(x => x !== r.id);
      for (const k of Object.keys(S.plan)) for (const m of Object.keys(S.plan[k])) if (S.plan[k][m].r === r.id) delete S.plan[k][m];
      invalidate(r.id); save(); closeAllSheets(); render(); toast(r.builtin ? 'Rezept ausgeblendet' : 'Rezept gelöscht');
    });
  },
  recipeToShop(el) {
    const sh = topSheet(), r = recipeById(el.dataset.id);
    const n = addToShop(recipeItems(r, stepperVal(sh, 'detServ')));
    save(); toast(n ? `${n} Artikel hinzugefügt` : 'Mengen auf der Liste ergänzt');
  },
  recipeToPlan(el) { openPlanFor(recipeById(el.dataset.id)); },
  planForSave() {
    const sh = topSheet();
    const d = $('#pp-day', sh).value, m = $('#pp-meal .on', sh).dataset.v;
    setEntry(d, m, { r: sh.dataset.recipe, s: stepperVal(sh, 'ppServ') }); closeSheet();
    const dt = fromKey(d);
    toast(`Eingetragen: ${DAYS[(dt.getDay() + 6) % 7]}, ${meal(m).short}`);
    if (S.ui.view === 'plan') render();
  },
  seg(el) { $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
  stepDone(el) { el.classList.toggle('done'); },
  cookStart(el) { openCook(el.dataset.id); },
  cookMove(el) {
    const sh = topSheet(), r = recipeById(sh.dataset.recipe), i = +sh.dataset.i + +el.dataset.n;
    if (i >= r.steps.length) { closeSheet(); toast('Guten Appetit! 🍽️'); return; }
    sh.dataset.i = Math.max(0, i); drawCook(sh);
  },
  step(el) {
    const st = el.closest('[data-stepper]'), out = $('output', st);
    const v = Math.max(1, Math.min(50, +out.textContent + +el.dataset.n));
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
  catToggle(el) { const c = el.dataset.c; S.ui.open[c] = !S.ui.open[c]; save(); renderShop(); },
  itemSave() {
    const sh = topSheet(), it = S.shop.find(x => x.id === sh.dataset.id); if (!it) return;
    const name = $('#e-name', sh).value.trim(); if (!name) { toast('Name fehlt'); return; }
    const sp = parseSpec($('#e-spec', sh).value);
    const cat = $('#e-cat', sh).value;
    Object.assign(it, { name, q: sp.q, note: sp.note, w: null });
    decorate(it); it.cat = cat; if (!matchFood(name)) it.emoji = catOf(cat).e;
    save(); closeSheet(); renderShop();
  },
  itemBuy() { const sh = topSheet(), it = S.shop.find(x => x.id === sh.dataset.id); closeSheet(); if (it) buyItem(it); },
  itemDelete() {
    const sh = topSheet(); S.shop = S.shop.filter(x => x.id !== sh.dataset.id);
    save(); closeSheet(); renderShop();
  },
  async shopShare() {
    if (!S.shop.length) { toast('Die Liste ist leer'); return; }
    const text = 'Einkaufsliste\n' + CATS.map(c => {
      const it = S.shop.filter(i => i.cat === c.k);
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
  restoreHidden() { const n = S.hidden.length; S.hidden = []; invalidate(); save(); render(); toast(`${n} Rezepte wieder da`); },
  resetAll() {
    confirmSheet('Wirklich alle eigenen Rezepte, Pläne und Listen löschen?', 'Alles löschen', () => {
      S = fresh(); invalidate(); save(); render(); toast('Alle Daten gelöscht');
    });
  },
};

const FORMS = {
  pickText(f) {
    const v = $('#pt', f).value.trim(); if (!v) return;
    const cb = pending.pick; closeSheet(); cb && cb({ t: v });
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
  sort(el) { S.ui.sort = el.value; save(); renderRecipeList(); },
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
  clearTimeout(lp.t); lp.t = setTimeout(() => { lp.t = null; tileLongPress(t); }, 480);
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!lp.t) return; const p = e.touches[0];
  if (Math.abs(p.clientX - lp.x) > 10 || Math.abs(p.clientY - lp.y) > 10) { clearTimeout(lp.t); lp.t = null; }
}, { passive: true });
document.addEventListener('touchend', () => { clearTimeout(lp.t); lp.t = null; });
document.addEventListener('contextmenu', e => {
  const t = e.target.closest('.tile'); if (!t) return;
  e.preventDefault(); tileLongPress(t); setTimeout(() => { lp.fired = false; }, 600);
});

/* ───────── Events ───────── */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(a, e);
});
document.addEventListener('submit', e => {
  e.preventDefault(); const fn = FORMS[e.target.dataset.form]; fn && fn(e.target);
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (k && CHANGE[k]) CHANGE[k](e.target);
  if (e.target.id === 'importFile' && e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
});
document.addEventListener('input', e => {
  if (e.target.id === 'rq') { ui.q = e.target.value; renderRecipeList(); }
  if (e.target.id === 'sq') { ui.sq = e.target.value; renderShop(); }
  if (e.target.dataset.change === 'pantry') CHANGE.pantry(e.target);
});
document.addEventListener('keydown', e => {
  if (e.target.id === 'sq' && e.key === 'Enter') { // Enter fügt den ersten Treffer hinzu
    e.preventDefault();
    const t = $('#shoparea .tile:not(.on)');
    if (t) ACT.tile(t); else e.target.blur();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLock === null && $('[data-change="wake"]:checked')) setWake(true);
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
