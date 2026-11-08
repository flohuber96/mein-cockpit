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
  'würfel': 'Würfel', beutel: 'Beutel', schuss: 'Schuss', spritzer: 'Spritzer', netz: 'Netz', schale: 'Schale',
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
// Im Laden kauft man ganze Zwiebeln/Dosen: zählbare Mengen aufrunden
const COUNTABLE = ['', 'Stk', 'Dose', 'Pck', 'Bund', 'Becher', 'Glas', 'Kopf', 'Knolle', 'Stange', 'Netz', 'Beutel', 'Schale', 'Zehe', 'Scheibe'];
const shopAmt = i => fmtAmount(i.amount != null && COUNTABLE.includes(i.unit || '') ? Math.ceil(i.amount - 0.01) || 1 : i.amount, i.unit);
const nameKey = n => n.split(/[,(]/)[0].trim().toLowerCase();
const shortName = n => n.split(/[,(]/)[0].trim();

/* ───────── Categories ───────── */
const CATS = [
  { k: 'obst', name: 'Obst & Gemüse', e: '🥦' },
  { k: 'brot', name: 'Brot & Backwaren', e: '🥖' },
  { k: 'kuehl', name: 'Kühlregal', e: '🧀' },
  { k: 'fleisch', name: 'Fleisch & Fisch', e: '🥩' },
  { k: 'vorrat', name: 'Vorrat & Konserven', e: '🥫' },
  { k: 'gewuerz', name: 'Gewürze & Saucen', e: '🧂' },
  { k: 'tk', name: 'Tiefkühl', e: '🧊' },
  { k: 'getraenk', name: 'Getränke', e: '🥤' },
  { k: 'haushalt', name: 'Drogerie & Haushalt', e: '🧻' },
  { k: 'sonst', name: 'Sonstiges', e: '🛒' },
];
const CAT_RULES = [
  ['tk', 'tk-,tk ,tiefkühl,gefroren,eis,pommes'],
  ['haushalt', 'spülmittel,toilettenpapier,klopapier,küchenrolle,müllbeutel,zahnpasta,shampoo,duschgel,waschmittel,seife,taschentücher,schwamm,alufolie,frischhaltefolie,backpapier'],
  ['gewuerz', 'salz,pfeffer,paprikapulver,kreuzkümmel,kumin,curry,zimt,oregano,thymian getr,muskat,kurkuma,gewürz,chiliflocken,chilipulver,cayenne,lorbeer,senf,ketchup,mayonnaise,mayo,sojasauce,sojasoße,worcester,essig,balsamico,brühe,fond,sambal,sriracha,tabasco,vanille,backpulver,natron,hefe'],
  ['vorrat', 'nudel,spaghetti,penne,fusilli,pasta,lasagne,reis,couscous,bulgur,quinoa,mehl,zucker,linsen,bohnen,kichererbsen,mais,dose,tomatenmark,passiert,gehackte tomaten,stückige tomaten,kokosmilch,currypaste,öl,haferflocken,müsli,honig,ahornsirup,marmelade,nuss,nüsse,mandel,cashew,erdnuss,rosine,schokolade,kakao,tahin,erdnussbutter,oliven,kapern,paniermehl,semmelbrösel,stärke,speisestärke,gnocchi,tortilla-chips,cracker,knäckebrot'],
  ['fleisch', 'hack,hähnchen,huhn,hühn,pute,rind,schwein,kalb,lamm,speck,bacon,schinken,wurst,salami,chorizo,lachs,fisch,thunfisch,garnele,shrimps,kabeljau,forelle,steak,schnitzel,filet'],
  ['kuehl', 'milch,joghurt,jogurt,quark,käse,feta,mozzarella,parmesan,gouda,butter,sahne,ei,eier,schmand,frischkäse,crème,creme,ricotta,mascarpone,tofu,skyr,kefir,buttermilch,halloumi,hummus,blätterteig,pizzateig'],
  ['brot', 'brot,brötchen,toast,wrap,tortilla,baguette,croissant,fladenbrot,pita,burger-bun,buns'],
  ['getraenk', 'wasser,saft,bier,wein,kaffee,tee,limo,cola,sprudel,smoothie'],
  ['obst', 'tomate,gurke,paprika,zwiebel,knoblauch,kartoffel,karotte,möhre,salat,spinat,brokkoli,blumenkohl,zucchini,aubergine,pilz,champignon,apfel,äpfel,banane,zitrone,limette,beere,avocado,ingwer,petersilie,basilikum,koriander,schnittlauch,dill,minze,thymian,rosmarin,lauch,porree,sellerie,kürbis,süßkartoffel,frühlingszwiebel,radieschen,rucola,kohl,orange,birne,traube,mango,ananas,kiwi,pfirsich,chili,erbsen,rote bete,fenchel,spargel,mangold,kräuter,obst,gemüse,schalotte'],
];
function guessCat(name) {
  const n = ' ' + name.toLowerCase() + ' ';
  for (const [k, words] of CAT_RULES) {
    for (const w of words.split(',')) if (w && n.includes(w)) {
      if (w === 'ei' && !/(^|\s)eier?(\s|$)/.test(n)) continue;
      if (w === 'eis' && !/(^|\s)eis(\s|$)/.test(n)) continue;
      return k;
    }
  }
  return 'sonst';
}

/* ───────── Sample data ───────── */
function sample(name, emoji, servings, time, tags, ings, steps, notes = '') {
  return {
    id: uid(), name, emoji, servings, time, tags, fav: false, notes,
    ingredients: ings.trim().split('\n').map(parseIng).filter(Boolean),
    steps: steps.trim().split('\n').map(s => s.trim()).filter(Boolean),
    created: Date.now(),
  };
}
function sampleRecipes() {
  return [
    sample('Spaghetti Bolognese', '🍝', 4, 45, ['Pasta', 'Klassiker'], `
500 g Spaghetti
400 g Hackfleisch (Rind)
1 Zwiebel
2 Zehen Knoblauch
1 Karotte
2 EL Tomatenmark
800 g gehackte Tomaten (Dose)
100 ml Rotwein oder Brühe
2 EL Olivenöl
1 TL Oregano
Salz
Pfeffer
50 g Parmesan`, `
Zwiebel, Knoblauch und Karotte fein würfeln.
Öl in einem Topf erhitzen, Hackfleisch darin krümelig anbraten.
Gemüse dazugeben und 3 Minuten mitbraten, dann Tomatenmark kurz anrösten.
Mit Rotwein ablöschen, Tomaten und Oregano zugeben, 25 Minuten köcheln lassen.
Spaghetti nach Packungsangabe kochen.
Sauce mit Salz und Pfeffer abschmecken und mit Parmesan servieren.`),
    sample('Chili con Carne', '🌶️', 4, 50, ['Eintopf', 'Meal Prep'], `
500 g Hackfleisch
1 Zwiebel
2 Zehen Knoblauch
1 Paprika, rot
1 Dose Kidneybohnen
1 Dose Mais
800 g gehackte Tomaten (Dose)
2 EL Tomatenmark
1 TL Kreuzkümmel
1 TL Chiliflocken
1 TL Paprikapulver
2 EL Öl
Salz`, `
Zwiebel, Knoblauch und Paprika würfeln.
Hackfleisch in Öl scharf anbraten, Zwiebel und Knoblauch zugeben.
Tomatenmark und Gewürze kurz mitrösten.
Tomaten und Paprika zugeben, 20 Minuten köcheln.
Bohnen und Mais abspülen, zugeben und weitere 10 Minuten köcheln. Abschmecken.`, 'Schmeckt aufgewärmt am nächsten Tag noch besser. Dazu Reis oder Brot.'),
    sample('Gemüse-Curry mit Kichererbsen', '🍛', 4, 30, ['Vegetarisch', 'Schnell'], `
250 g Reis
1 Zwiebel
1 Stück Ingwer
2 Zehen Knoblauch
2 EL rote Currypaste
400 ml Kokosmilch
1 Dose Kichererbsen
1 Brokkoli
1 Paprika
100 g Spinat
1 Limette
1 EL Öl
Salz`, `
Reis nach Packungsangabe kochen.
Zwiebel, Ingwer und Knoblauch fein hacken und in Öl anschwitzen.
Currypaste 1 Minute mitrösten, mit Kokosmilch ablöschen.
Brokkoli in Röschen und Paprika in Streifen zugeben, 8 Minuten köcheln.
Kichererbsen und Spinat unterrühren, mit Limettensaft und Salz abschmecken.`),
    sample('Ofengemüse mit Feta', '🫑', 2, 40, ['Vegetarisch', 'Ofen'], `
600 g Kartoffeln
1 Zucchini
1 Paprika
1 rote Zwiebel
200 g Feta
3 EL Olivenöl
1 TL Rosmarin
Salz
Pfeffer`, `
Ofen auf 200 °C Umluft vorheizen.
Kartoffeln vierteln, restliches Gemüse grob schneiden.
Alles mit Öl, Rosmarin, Salz und Pfeffer auf einem Blech mischen.
25 Minuten backen, dann Feta darüberbröseln und weitere 10 Minuten backen.`),
    sample('Hähnchen-Reis-Pfanne', '🍗', 2, 30, ['Schnell', 'High Protein'], `
300 g Hähnchenbrust
150 g Reis
1 Paprika
1 Zucchini
1 Zwiebel
3 EL Sojasauce
1 TL Paprikapulver
1 EL Öl
Salz`, `
Reis kochen.
Hähnchen in Streifen schneiden, mit Paprikapulver und Salz würzen und in Öl goldbraun braten.
Gemüse in Würfel schneiden, zugeben und 5 Minuten mitbraten.
Reis unterheben, mit Sojasauce ablöschen und kurz durchschwenken.`),
    sample('Rote Linsensuppe', '🥣', 4, 30, ['Vegan', 'Suppe', 'Meal Prep'], `
250 g rote Linsen
1 Zwiebel
2 Karotten
2 Zehen Knoblauch
1 EL Tomatenmark
1 l Gemüsebrühe
200 ml Kokosmilch
1 TL Kreuzkümmel
1 TL Kurkuma
1 Zitrone
1 EL Öl
Salz`, `
Zwiebel, Karotten und Knoblauch würfeln und in Öl anschwitzen.
Tomatenmark und Gewürze kurz mitrösten.
Linsen und Brühe zugeben, 15 Minuten köcheln bis die Linsen zerfallen.
Kokosmilch zugeben, fein pürieren und mit Zitronensaft und Salz abschmecken.`),
    sample('Lachs mit Ofenkartoffeln & Brokkoli', '🐟', 2, 35, ['Fisch', 'Ofen'], `
2 Lachsfilets
500 g Kartoffeln
1 Brokkoli
1 Zitrone
2 EL Olivenöl
1 Zehe Knoblauch
Salz
Pfeffer`, `
Ofen auf 200 °C vorheizen. Kartoffeln halbieren, mit 1 EL Öl und Salz 15 Minuten backen.
Brokkoli in Röschen teilen und mit aufs Blech geben.
Lachs mit Knoblauch, Zitronenscheiben, Salz und Pfeffer belegen und dazulegen.
Weitere 12–15 Minuten backen, bis der Lachs gar ist.`),
    sample('Pfannkuchen', '🥞', 2, 20, ['Süß', 'Vegetarisch', 'Schnell'], `
200 g Mehl
3 Eier
400 ml Milch
1 Prise Salz
1 EL Zucker
2 EL Butter`, `
Mehl, Eier, Milch, Salz und Zucker zu einem glatten Teig verrühren, 10 Minuten ruhen lassen.
Etwas Butter in einer Pfanne erhitzen.
Eine Kelle Teig hineingeben, verteilen und von beiden Seiten goldbraun backen.
Mit Apfelmus, Zimt & Zucker oder Marmelade servieren.`),
    sample('Overnight Oats', '🥛', 1, 5, ['Frühstück', 'Vegetarisch', 'Schnell'], `
50 g Haferflocken
150 g Joghurt
50 ml Milch
1 TL Honig
1 Handvoll Beeren
1 EL Nüsse`, `
Haferflocken, Joghurt, Milch und Honig in einem Glas verrühren.
Über Nacht im Kühlschrank quellen lassen.
Morgens mit Beeren und Nüssen toppen.`),
    sample('Griechischer Salat', '🥗', 2, 15, ['Vegetarisch', 'Salat', 'Schnell'], `
1 Gurke
4 Tomaten
1 rote Zwiebel
1 Paprika, grün
200 g Feta
50 g Oliven
3 EL Olivenöl
1 EL Essig
1 TL Oregano
Salz`, `
Gurke, Tomaten und Paprika in mundgerechte Stücke schneiden.
Zwiebel in feine Ringe schneiden.
Alles mit Oliven mischen, Feta in Würfeln darauflegen.
Mit Öl, Essig, Oregano und Salz anmachen.`),
    sample('Shakshuka', '🍳', 2, 25, ['Vegetarisch', 'Frühstück'], `
4 Eier
1 Zwiebel
1 Paprika, rot
2 Zehen Knoblauch
400 g gehackte Tomaten (Dose)
1 TL Kreuzkümmel
1 TL Paprikapulver
1 EL Olivenöl
1 Bund Petersilie
Salz
1 Baguette`, `
Zwiebel, Paprika und Knoblauch würfeln und in Öl weich dünsten.
Gewürze zugeben, dann Tomaten und 10 Minuten einköcheln lassen.
Mit einem Löffel 4 Mulden formen, Eier hineingleiten lassen.
Deckel auflegen und 6–8 Minuten stocken lassen.
Mit Petersilie bestreuen und mit Baguette servieren.`),
  ];
}

/* ───────── State ───────── */
const KEY = 'essen.v1';
function fresh() {
  return {
    v: 1,
    recipes: sampleRecipes(),
    plan: {},
    shop: [],
    settings: { meals: ['m', 'a'], servings: 2, pantry: 'Salz\nPfeffer\nWasser\nÖl\nOlivenöl' },
    ui: { view: 'plan', hideHint: false },
  };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const f = fresh();
      return { ...f, ...s, settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui } };
    }
  } catch (e) { /* ignore */ }
  return fresh();
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  updateBadge();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const ui = { weekStart: monday(new Date()), q: '', tag: '' };
const recipeById = id => S.recipes.find(r => r.id === id);

/* ───────── Toast ───────── */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ───────── Sheets ───────── */
const sheetStack = [];
function openSheet({ title = '', left = '', right = '', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head">${left || '<button class="lnk" data-act="closeSheet">Abbrechen</button>'}<b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  ov.addEventListener('click', () => closeSheet());
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  const entry = { ov, sh, onClose };
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
const pending = {};

/* ───────── Rendering ───────── */
const TITLES = { plan: 'Wochenplan', recipes: 'Rezepte', shop: 'Einkaufsliste', more: 'Mehr' };
function render() {
  const v = S.ui.view;
  $('#title').textContent = TITLES[v];
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  const hact = $('#hact');
  hact.innerHTML = v === 'recipes' ? `<button class="hbtn" data-act="recipeNew" aria-label="Neues Rezept">${ICON.plus}</button>`
    : v === 'shop' ? `<button class="hbtn" data-act="shopShare" aria-label="Liste teilen">${ICON.share}</button>` : '';
  const main = $('#main');
  if (v === 'plan') main.innerHTML = viewPlan();
  if (v === 'recipes') { main.innerHTML = viewRecipes(); renderRecipeList(); }
  if (v === 'shop') { main.innerHTML = viewShop(); renderShopList(); }
  if (v === 'more') main.innerHTML = viewMore();
  updateBadge();
}
function updateBadge() {
  const n = S.shop.filter(i => !i.done).length;
  const b = $('#shopBadge'); b.hidden = !n; b.textContent = n;
}

/* ── Plan view ── */
function entryHTML(e) {
  if (e.r) {
    const r = recipeById(e.r);
    if (!r) return { emoji: '❓', name: 'Gelöschtes Rezept', meta: '' };
    return { emoji: r.emoji || '🍽️', name: r.name, meta: `${e.s || r.servings} P.` };
  }
  return { emoji: '📝', name: e.t, meta: '' };
}
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
    h += `<div class="hint"><span style="font-size:24px">📲</span><div><b>Als App installieren</b>Tippe unten auf <b style="display:inline">Teilen</b> und dann auf <b style="display:inline">„Zum Home-Bildschirm"</b>.</div><button class="x" data-act="hideHint" aria-label="Ausblenden">×</button></div>`;
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i), k = dkey(d), day = S.plan[k] || {};
    h += `<section class="card day${k === today ? ' today' : ''}${k < today ? ' past' : ''}"><div class="day-h"><span>${DAYS[i]}</span><small>${fmtDay(d)}</small></div>`;
    for (const m of meals) {
      const e = day[m.k];
      if (e) {
        const x = entryHTML(e);
        h += `<button class="slot filled" data-act="slotMenu" data-d="${k}" data-m="${m.k}"><span class="slot-l">${m.short}</span><span class="slot-emoji">${x.emoji}</span><span class="slot-name">${esc(x.name)}</span><span class="slot-meta">${x.meta}</span></button>`;
      } else {
        h += `<button class="slot empty" data-act="slotPick" data-d="${k}" data-m="${m.k}"><span class="slot-l">${m.short}</span><span class="slot-add">+ Gericht wählen</span></button>`;
      }
    }
    h += `</section>`;
  }
  h += `<div class="stack" style="margin-top:18px">
    <button class="btn primary" data-act="weekToShop">🛒 Einkaufsliste für diese Woche</button>
    <div class="row"><button class="btn" data-act="weekRandom">🎲 Auffüllen</button><button class="btn" data-act="weekClear">🧹 Leeren</button></div></div>`;
  return h;
}

/* ── Recipes view ── */
function viewRecipes() {
  return `<div class="search">${ICON.search}<input id="rq" type="search" placeholder="Rezepte oder Zutaten suchen" value="${esc(ui.q)}" autocomplete="off"></div>
    <div class="chips" id="rtags"></div><div class="list" id="rlist"></div>`;
}
function allTags() {
  const set = new Map();
  S.recipes.forEach(r => (r.tags || []).forEach(t => set.set(t, (set.get(t) || 0) + 1)));
  return [...set.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]);
}
function renderRecipeList() {
  const tags = allTags();
  if (ui.tag && ui.tag !== '♥' && !tags.includes(ui.tag)) ui.tag = '';
  $('#rtags').innerHTML = [['', 'Alle'], ['♥', '♥ Favoriten'], ...tags.map(t => [t, t])]
    .map(([k, l]) => `<button class="chip${ui.tag === k ? ' on' : ''}" data-act="tagFilter" data-tag="${esc(k)}">${esc(l)}</button>`).join('');
  const q = ui.q.trim().toLowerCase();
  let list = S.recipes.filter(r => {
    if (ui.tag === '♥' && !r.fav) return false;
    if (ui.tag && ui.tag !== '♥' && !(r.tags || []).includes(ui.tag)) return false;
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || (r.tags || []).some(t => t.toLowerCase().includes(q)) || r.ingredients.some(i => i.name.toLowerCase().includes(q));
  }).sort((a, b) => (b.fav - a.fav) || a.name.localeCompare(b.name, 'de'));
  const el = $('#rlist');
  if (!list.length) {
    el.innerHTML = S.recipes.length
      ? `<div class="empty"><div class="big">🔍</div><b>Nichts gefunden</b>Versuch einen anderen Suchbegriff.</div>`
      : `<div class="empty"><div class="big">📖</div><b>Noch keine Rezepte</b>Tippe oben auf + um dein erstes Rezept anzulegen.</div>`;
    return;
  }
  el.innerHTML = list.map(r => `<button class="card rcard" data-act="recipeOpen" data-id="${r.id}">
    <span class="remoji">${esc(r.emoji || '🍽️')}</span>
    <span class="rbody"><b>${esc(r.name)}</b><small>${[r.time ? `⏱ ${r.time} Min.` : '', `${r.servings} Port.`, ...(r.tags || [])].filter(Boolean).map(esc).join(' · ')}</small></span>
    ${r.fav ? '<span class="fav">♥</span>' : ''}</button>`).join('');
}

/* ── Shop view ── */
function viewShop() {
  return `<form class="addbar" data-form="shopAdd" autocomplete="off"><input id="sa" placeholder="z. B. 2 l Milch" enterkeyhint="done" aria-label="Artikel hinzufügen"><button class="btn primary" aria-label="Hinzufügen">+</button></form><div id="shoplist"></div>`;
}
function renderShopList() {
  const el = $('#shoplist'); if (!el) return;
  if (!S.shop.length) {
    el.innerHTML = `<div class="empty"><div class="big">🛒</div><b>Liste ist leer</b>Füge oben Artikel hinzu oder erstelle die Liste aus deinem Wochenplan.</div>
      <button class="btn soft" data-act="goPlanShop">📅 Aus Wochenplan erstellen</button>`;
    return;
  }
  const open = S.shop.filter(i => !i.done), done = S.shop.filter(i => i.done);
  const pct = Math.round(done.length / S.shop.length * 100);
  let h = `<div class="small muted" style="display:flex;justify-content:space-between;margin:8px 4px 0"><span>${done.length} von ${S.shop.length} erledigt</span><span>${pct}%</span></div><div class="progress"><i style="width:${pct}%"></i></div>`;
  for (const c of CATS) {
    const items = open.filter(i => (i.cat || 'sonst') === c.k);
    if (!items.length) continue;
    h += `<div class="card group"><h4>${c.e} ${c.name}</h4>${items.map(itemHTML).join('')}</div>`;
  }
  if (!open.length) h += `<div class="empty" style="padding:24px"><div class="big">🎉</div><b>Alles erledigt!</b></div>`;
  if (done.length) {
    h += `<div class="section-t">Im Wagen (${done.length})</div><div class="card group">${done.map(itemHTML).join('')}</div>
      <button class="btn plain" data-act="shopClearDone" style="margin-top:4px">Erledigte entfernen</button>`;
  }
  h += `<button class="btn danger" data-act="shopClearAll" style="margin-top:8px">Ganze Liste löschen</button>`;
  el.innerHTML = h;
}
function itemHTML(i) {
  const src = (i.src || []).length ? `<small class="isrc">${esc(i.src.join(', '))}</small>` : '';
  return `<div class="item${i.done ? ' done' : ''}"><button class="check" data-act="shopToggle" data-id="${i.id}" aria-label="Abhaken"></button>
    <button class="item-main" data-act="shopEdit" data-id="${i.id}"><span class="iname">${esc(i.name)}</span><span class="iamt">${esc(shopAmt(i))}</span>${src}</button></div>`;
}

/* ── More view ── */
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
    <p class="small muted" style="margin:8px 4px 0">Diese Zutaten werden beim Erstellen der Einkaufsliste aus dem Wochenplan übersprungen.</p>
  </div>
  <div class="section-t">Daten & Backup</div>
  <div class="card menu">
    <button data-act="exportData"><span class="ico">💾</span>Backup exportieren</button>
    <button data-act="importData"><span class="ico">📂</span>Backup importieren</button>
    <button data-act="addSamples"><span class="ico">✨</span>Beispielrezepte hinzufügen</button>
    <button data-act="resetAll" class="red"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>
  <p class="small muted" style="margin:0 4px">Deine Daten werden nur auf diesem Gerät gespeichert – kein Konto, keine Cloud, keine Kosten. Exportiere regelmäßig ein Backup, z. B. in die Dateien-App oder iCloud Drive.</p>
  <div class="section-t">Auf dem iPhone installieren</div>
  <div class="card" style="padding:14px 16px;font-size:15px;line-height:1.55">
    1. Diese Seite in <b>Safari</b> öffnen<br>2. Unten auf <b>Teilen</b> (□↑) tippen<br>3. <b>„Zum Home-Bildschirm"</b> wählen<br>
    <span class="muted small">Danach startet die App im Vollbild und funktioniert auch offline.</span>
  </div>
  <p class="small muted" style="text-align:center;margin:24px 0 0">${S.recipes.length} Rezepte · Essensplaner v1.0</p>`;
}

/* ───────── Plan actions ───────── */
function setEntry(d, m, e) {
  S.plan[d] = S.plan[d] || {};
  if (e) S.plan[d][m] = e; else { delete S.plan[d][m]; if (!Object.keys(S.plan[d]).length) delete S.plan[d]; }
  save();
}
function stepperHTML(id, val, label = 'Portionen') {
  return `<div class="setting card" style="margin-bottom:14px"><span class="lbl">${label}</span><span class="stepper" data-stepper="${id}"><button data-act="step" data-n="-1">−</button><output>${val}</output><button data-act="step" data-n="1">+</button></span></div>`;
}
function openRecipePicker(title, onPick) {
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
    const list = S.recipes.filter(r => !q || r.name.toLowerCase().includes(q) || (r.tags || []).some(t => t.toLowerCase().includes(q)))
      .sort((a, b) => (b.fav - a.fav) || a.name.localeCompare(b.name, 'de'));
    $('#plist', sh).innerHTML = list.length ? list.map(r => `<button class="pick" data-act="pickRecipe" data-id="${r.id}"><span class="remoji">${esc(r.emoji || '🍽️')}</span><span class="rbody"><b>${esc(r.name)}</b><small>${r.time ? r.time + ' Min. · ' : ''}${(r.tags || []).map(esc).join(' · ')}</small></span>${r.fav ? '<span class="fav">♥</span>' : ''}</button>`).join('')
      : `<p class="muted" style="padding:16px 4px">Keine Rezepte gefunden.</p>`;
  };
  $('#pq', sh).addEventListener('input', draw);
  draw();
}
function stepperVal(sh, id) { return +$(`[data-stepper="${id}"] output`, sh).textContent; }

function weekKeys() { return Array.from({ length: 7 }, (_, i) => dkey(addDays(ui.weekStart, i))); }

/* ───────── Shopping logic ───────── */
function pantrySet() { return new Set(S.settings.pantry.split('\n').map(s => s.trim().toLowerCase()).filter(Boolean)); }
function addToShop(items, auto = null) {
  let added = 0;
  for (const it of items) {
    const b = toBase(it.amount, it.unit);
    const key = nameKey(it.name);
    const ex = S.shop.find(x => !x.done && (x.auto || null) === auto && nameKey(x.name) === key && (x.unit || '') === (b.unit || ''));
    if (ex) {
      if (b.amount != null) ex.amount = (ex.amount || 0) + b.amount;
      for (const s of it.src || []) if (!ex.src.includes(s)) ex.src.push(s);
    } else {
      S.shop.push({ id: uid(), name: shortName(it.name) || it.name, amount: b.amount, unit: b.unit || '', cat: guessCat(it.name), done: false, src: [...(it.src || [])], auto });
      added++;
    }
  }
  return added;
}
function recipeItems(r, servings, skipPantry = true) {
  const f = servings / (r.servings || 1), pantry = skipPantry ? pantrySet() : new Set();
  return r.ingredients.filter(i => !pantry.has(nameKey(i.name)) && !pantry.has(i.name.toLowerCase()))
    .map(i => ({ name: i.name, amount: i.amount != null ? i.amount * f : null, unit: i.unit, src: [r.name] }));
}

/* ───────── Recipe detail & editor ───────── */
function openRecipe(id) {
  const r = recipeById(id); if (!r) return;
  const sh = openSheet({
    title: '',
    left: `<button class="lnk" data-act="closeSheet">Schließen</button>`,
    right: `<button class="lnk r" data-act="recipeEdit" data-id="${r.id}">Bearbeiten</button>`,
    body: `<div class="hero"><div class="e">${esc(r.emoji || '🍽️')}</div><h2>${esc(r.name)}</h2>
      <div class="meta">${r.time ? `<span class="pill">⏱ ${r.time} Min.</span>` : ''}${(r.tags || []).map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div></div>
      <div class="row">
        <button class="btn soft" data-act="recipeFav" data-id="${r.id}">${r.fav ? '♥ Favorit' : '♡ Merken'}</button>
        <button class="btn soft" data-act="recipeToPlan" data-id="${r.id}">📅 Planen</button>
      </div>
      <div class="dhead"><h3>Zutaten</h3><span class="stepper" data-stepper="detServ"><button data-act="step" data-n="-1">−</button><output>${r.servings}</output><button data-act="step" data-n="1">+</button></span></div>
      <ul class="card ing" id="ingList"></ul>
      <button class="btn" style="margin-top:10px;width:100%" data-act="recipeToShop" data-id="${r.id}">🛒 Zutaten auf die Einkaufsliste</button>
      ${r.steps.length ? `<div class="dhead"><h3>Zubereitung</h3></div><ol class="steps">${r.steps.map(s => `<li class="card" data-act="stepDone">${esc(s)}</li>`).join('')}</ol>` : ''}
      ${r.notes ? `<div class="dhead"><h3>Notizen</h3></div><div class="card notes">${esc(r.notes)}</div>` : ''}
      ${'wakeLock' in navigator ? `<div class="card" style="margin-top:18px"><label class="setting"><span><span class="lbl">Kochmodus</span><br><span class="sub">Bildschirm bleibt an</span></span><span class="switch"><input type="checkbox" data-change="wake"><i></i></span></label></div>` : ''}
      <button class="btn danger" style="width:100%;margin-top:14px" data-act="recipeDelete" data-id="${r.id}">Rezept löschen</button>`,
    onClose: releaseWake,
  });
  sh.dataset.recipe = r.id;
  drawIngredients(sh);
}
function drawIngredients(sh) {
  const r = recipeById(sh.dataset.recipe); if (!r) return;
  const f = stepperVal(sh, 'detServ') / (r.servings || 1);
  $('#ingList', sh).innerHTML = r.ingredients.length ? r.ingredients.map(i => {
    const a = i.amount != null ? fmtAmount(toBase(i.amount * f, i.unit).amount, toBase(i.amount * f, i.unit).unit) : (i.unit || '');
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

const EMOJIS = ['🍝', '🍛', '🍲', '🥘', '🥗', '🍕', '🍔', '🌮', '🌯', '🥙', '🍜', '🍣', '🍱', '🥟', '🍗', '🥩', '🐟', '🦐', '🥚', '🍳', '🥞', '🧇', '🥐', '🥪', '🥣', '🥛', '🫑', '🥦', '🥕', '🍆', '🥔', '🍄', '🌶️', '🧀', '🍰', '🧁', '🍪', '🍎', '🍓', '🥤'];
function openEditor(id) {
  const r = id ? recipeById(id) : null;
  const v = r || { name: '', emoji: '🍽️', servings: S.settings.servings, time: '', tags: [], ingredients: [], steps: [], notes: '' };
  const sh = openSheet({
    title: r ? 'Rezept bearbeiten' : 'Neues Rezept',
    right: `<button class="lnk r" data-act="recipeSave">Sichern</button>`,
    body: `<form data-form="recipeSave" autocomplete="off">
      <div class="field"><label for="f-name">Name</label><input id="f-name" required value="${esc(v.name)}" placeholder="z. B. Omas Gulasch"></div>
      <div class="field"><label>Symbol</label>
        <div class="row" style="align-items:center"><input id="f-emoji" value="${esc(v.emoji)}" maxlength="4" style="max-width:72px;text-align:center;font-size:24px;padding:6px"><span class="small muted" style="flex:3">Eigenes Emoji eintippen oder unten wählen</span></div>
        <div class="emoji-row">${EMOJIS.map(e => `<button type="button" data-act="pickEmoji" data-e="${e}" class="${e === v.emoji ? 'on' : ''}">${e}</button>`).join('')}</div></div>
      <div class="row">
        <div class="field"><label for="f-serv">Portionen</label><input id="f-serv" type="number" inputmode="numeric" min="1" value="${esc(v.servings)}"></div>
        <div class="field"><label for="f-time">Zeit (Min.)</label><input id="f-time" type="number" inputmode="numeric" min="0" value="${esc(v.time)}"></div>
      </div>
      <div class="field"><label for="f-tags">Kategorien</label><input id="f-tags" value="${esc((v.tags || []).join(', '))}" placeholder="z. B. Vegetarisch, Schnell"><p class="help">Mit Komma trennen</p></div>
      <div class="field"><label for="f-ing">Zutaten</label><textarea id="f-ing" rows="8" placeholder="200 g Mehl&#10;2 Eier&#10;1 Prise Salz">${esc(v.ingredients.map(ingLine).join('\n'))}</textarea><p class="help">Eine Zutat pro Zeile: Menge, Einheit, Zutat</p></div>
      <div class="field"><label for="f-steps">Zubereitung</label><textarea id="f-steps" rows="8" placeholder="Ein Schritt pro Zeile">${esc(v.steps.join('\n'))}</textarea></div>
      <div class="field"><label for="f-notes">Notizen</label><textarea id="f-notes" rows="3" placeholder="Tipps, Quelle, Beilagen …">${esc(v.notes)}</textarea></div>
      <button class="btn primary" style="width:100%">Rezept speichern</button></form>`,
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
    tags: [...new Set($('#f-tags', sh).value.split(',').map(s => s.trim()).filter(Boolean))],
    ingredients: $('#f-ing', sh).value.split('\n').map(parseIng).filter(Boolean),
    steps: $('#f-steps', sh).value.split('\n').map(s => s.trim()).filter(Boolean),
    notes: $('#f-notes', sh).value.trim(),
  };
  const id = sh.dataset.edit;
  if (id) Object.assign(recipeById(id), data);
  else S.recipes.push({ id: uid(), fav: false, created: Date.now(), ...data });
  save();
  closeSheet();
  if (id) { closeSheet(); setTimeout(() => openRecipe(id), 330); }
  render();
  toast(id ? 'Rezept gespeichert' : 'Rezept angelegt');
}

function openPlanFor(recipe) {
  const opts = [];
  const t = startOfDay(new Date());
  for (let i = 0; i < 21; i++) {
    const d = addDays(t, i);
    opts.push(`<option value="${dkey(d)}">${i === 0 ? 'Heute' : i === 1 ? 'Morgen' : DAYS[(d.getDay() + 6) % 7]}, ${fmtDay(d)}</option>`);
  }
  const meals = MEALS.filter(m => S.settings.meals.includes(m.k));
  const def = meals.find(m => m.k === 'a') ? 'a' : meals[0]?.k || 'a';
  const sh = openSheet({
    title: 'In Wochenplan eintragen',
    body: `<div class="field"><label>Tag</label><select id="pp-day">${opts.join('')}</select></div>
      <div class="field"><label>Mahlzeit</label><div class="seg" id="pp-meal">${(meals.length ? meals : MEALS).map(m => `<button type="button" data-act="seg" data-v="${m.k}" class="${m.k === def ? 'on' : ''}">${m.short}</button>`).join('')}</div></div>
      ${stepperHTML('ppServ', recipe.servings)}
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
      confirmSheet(`Backup mit ${d.recipes.length} Rezepten laden? Aktuelle Daten werden ersetzt.`, 'Backup laden', () => {
        const f = fresh();
        S = { v: 1, recipes: d.recipes, plan: d.plan || {}, shop: d.shop || [], settings: { ...f.settings, ...d.settings }, ui: S.ui };
        save(); render(); toast('Backup geladen');
      });
    } catch (e) { toast('Datei ist kein gültiges Backup'); }
  };
  rd.readAsText(file);
}

/* ───────── Actions ───────── */
const ACT = {
  tab(el) { closeAllSheets(); S.ui.view = el.dataset.view; save(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  hideHint() { S.ui.hideHint = true; save(); render(); },

  weekShift(el) { ui.weekStart = addDays(ui.weekStart, +el.dataset.n); render(); },
  weekToday() { ui.weekStart = monday(new Date()); render(); },
  slotPick(el) {
    const { d, m } = el.dataset, dt = fromKey(d);
    openRecipePicker(`${DAYS[(dt.getDay() + 6) % 7]} · ${meal(m).name}`, e => { setEntry(d, m, e); render(); });
  },
  pickRecipe(el) {
    const sh = topSheet(), cb = pending.pick;
    const s = stepperVal(sh, 'pickServ');
    closeSheet(); cb && cb({ r: el.dataset.id, s });
  },
  slotMenu(el) {
    const { d, m } = el.dataset, e = S.plan[d]?.[m]; if (!e) return;
    const dt = fromKey(d), x = entryHTML(e), r = e.r && recipeById(e.r);
    const sh = openSheet({
      title: `${DAYS[(dt.getDay() + 6) % 7]} · ${meal(m).name}`,
      left: '<button class="lnk" data-act="closeSheet">Fertig</button>',
      body: `<div class="hero" style="padding-bottom:12px"><div class="e" style="font-size:48px">${x.emoji}</div><h2 style="font-size:20px">${esc(x.name)}</h2></div>
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
    const days = weekKeys();
    const meals = MEALS.filter(x => S.settings.meals.includes(x.k));
    const ms = openSheet({
      title: 'Verschieben nach …',
      body: `<div class="card menu">${days.flatMap((k, i) => meals.map(mm => {
        if (k === d && mm.k === m) return '';
        const occ = S.plan[k]?.[mm.k];
        return `<button data-act="slotMoveTo" data-to="${k}" data-tm="${mm.k}"><span class="ico">${DAYS_S[i]}</span>${mm.short}${occ ? ` <span class="muted small">· tauscht mit ${esc(entryHTML(occ).name)}</span>` : ''}</button>`;
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
    const pool = S.recipes.filter(r => !(r.tags || []).some(t => /frühstück/i.test(t)));
    const breakfast = S.recipes.filter(r => (r.tags || []).some(t => /frühstück/i.test(t)));
    if (!S.recipes.length) { toast('Lege zuerst Rezepte an'); return; }
    const used = new Set(weekKeys().flatMap(k => Object.values(S.plan[k] || {}).map(e => e.r)).filter(Boolean));
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const take = list => {
      if (!list.length) list = S.recipes;
      const unused = list.filter(r => !used.has(r.id));
      const src = unused.length ? unused : list;
      const favs = src.filter(r => r.fav);
      const r = favs.length && Math.random() < .4 ? rnd(favs) : rnd(src);
      used.add(r.id); return r;
    };
    let n = 0;
    for (const k of weekKeys()) {
      if (k < dkey(new Date())) continue;
      for (const m of S.settings.meals) {
        if (S.plan[k]?.[m]) continue;
        const r = take(m === 'f' ? breakfast : pool);
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
    if (!meals) { toast('Diese Woche ist noch nichts geplant'); return; }
    S.shop = S.shop.filter(i => i.done || i.auto !== wk);
    const n = addToShop(items, wk);
    save(); S.ui.view = 'shop'; render(); window.scrollTo(0, 0);
    toast(`${n} Artikel aus ${meals} Gerichten`);
  },
  goPlanShop() { S.ui.view = 'plan'; render(); },

  tagFilter(el) { ui.tag = el.dataset.tag; renderRecipeList(); },
  recipeOpen(el) { openRecipe(el.dataset.id); },
  recipeNew() { openEditor(null); },
  recipeEdit(el) { openEditor(el.dataset.id); },
  recipeSave() { const sh = topSheet(); saveEditor(sh); },
  pickEmoji(el) {
    const sh = topSheet(); $('#f-emoji', sh).value = el.dataset.e;
    $$('.emoji-row button', sh).forEach(b => b.classList.toggle('on', b === el));
  },
  recipeFav(el) {
    const r = recipeById(el.dataset.id); r.fav = !r.fav; save();
    el.textContent = r.fav ? '♥ Favorit' : '♡ Merken';
    if (S.ui.view === 'recipes') renderRecipeList();
  },
  recipeDelete(el) {
    const r = recipeById(el.dataset.id);
    confirmSheet(`„${r.name}" löschen?`, 'Löschen', () => {
      S.recipes = S.recipes.filter(x => x.id !== r.id);
      for (const k of Object.keys(S.plan)) for (const m of Object.keys(S.plan[k])) if (S.plan[k][m].r === r.id) delete S.plan[k][m];
      save(); closeAllSheets(); render(); toast('Rezept gelöscht');
    });
  },
  recipeToShop(el) {
    const sh = topSheet(), r = recipeById(el.dataset.id);
    const n = addToShop(recipeItems(r, stepperVal(sh, 'detServ')));
    save(); toast(n ? `${n} Zutaten hinzugefügt` : 'Zutaten aktualisiert');
  },
  recipeToPlan(el) { openPlanFor(recipeById(el.dataset.id)); },
  planForSave() {
    const sh = topSheet();
    const d = $('#pp-day', sh).value, m = $('#pp-meal .on', sh).dataset.v;
    const e = { r: sh.dataset.recipe, s: stepperVal(sh, 'ppServ') };
    setEntry(d, m, e); closeSheet();
    const dt = fromKey(d);
    toast(`Eingetragen: ${DAYS[(dt.getDay() + 6) % 7]}, ${meal(m).short}`);
    if (S.ui.view === 'plan') render();
  },
  seg(el) { $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
  stepDone(el) { el.classList.toggle('done'); },
  step(el) {
    const st = el.closest('[data-stepper]'), out = $('output', st);
    const v = Math.max(1, Math.min(50, +out.textContent + +el.dataset.n));
    out.textContent = v;
    const sh = topSheet();
    if (st.dataset.stepper === 'detServ') drawIngredients(sh);
    if (st.dataset.stepper === 'slotServ') { const e = S.plan[sh.dataset.d]?.[sh.dataset.m]; if (e) { e.s = v; save(); } }
  },

  shopToggle(el) {
    const i = S.shop.find(x => x.id === el.dataset.id); if (!i) return;
    i.done = !i.done; save();
    if (navigator.vibrate) navigator.vibrate(8);
    renderShopList();
  },
  shopEdit(el) {
    const i = S.shop.find(x => x.id === el.dataset.id); if (!i) return;
    const disp = fmtAmount(i.amount, i.unit).split(' ');
    const sh = openSheet({
      title: 'Artikel bearbeiten',
      right: `<button class="lnk r" data-act="shopEditSave">Sichern</button>`,
      body: `<form data-form="shopEditSave">
        <div class="field"><label for="e-name">Artikel</label><input id="e-name" value="${esc(i.name)}"></div>
        <div class="row"><div class="field"><label for="e-amt">Menge</label><input id="e-amt" inputmode="decimal" value="${esc(i.amount != null ? disp[0] : '')}"></div>
        <div class="field"><label for="e-unit">Einheit</label><input id="e-unit" value="${esc(i.amount != null ? disp.slice(1).join(' ') : i.unit)}" placeholder="g, Stk, …"></div></div>
        <div class="field"><label for="e-cat">Kategorie</label><select id="e-cat">${CATS.map(c => `<option value="${c.k}" ${c.k === (i.cat || 'sonst') ? 'selected' : ''}>${c.e} ${c.name}</option>`).join('')}</select></div>
        ${(i.src || []).length ? `<p class="small muted" style="margin:0 4px 14px">Für: ${esc(i.src.join(', '))}</p>` : ''}
        <button class="btn primary" style="width:100%">Speichern</button>
        <button type="button" class="btn danger" style="width:100%;margin-top:6px" data-act="shopDelete">Artikel löschen</button></form>`,
    });
    sh.dataset.id = i.id;
  },
  shopEditSave() {
    const sh = topSheet(), i = S.shop.find(x => x.id === sh.dataset.id); if (!i) return;
    const name = $('#e-name', sh).value.trim(); if (!name) { toast('Name fehlt'); return; }
    const amt = parseAmount($('#e-amt', sh).value || '');
    let unit = $('#e-unit', sh).value.trim();
    unit = UNIT_MAP[unit.toLowerCase().replace(/\.$/, '')] || PLURAL_REV[unit] || unit;
    const b = toBase(amt, unit);
    Object.assign(i, { name, amount: b.amount, unit: b.unit, cat: $('#e-cat', sh).value });
    save(); closeSheet(); renderShopList();
  },
  shopDelete() {
    const sh = topSheet(); S.shop = S.shop.filter(x => x.id !== sh.dataset.id);
    save(); closeSheet(); renderShopList(); toast('Gelöscht');
  },
  shopClearDone() { S.shop = S.shop.filter(i => !i.done); save(); renderShopList(); toast('Erledigte entfernt'); },
  shopClearAll() { confirmSheet('Ganze Einkaufsliste löschen?', 'Alles löschen', () => { S.shop = []; save(); renderShopList(); }); },
  async shopShare() {
    const open = S.shop.filter(i => !i.done);
    if (!open.length) { toast('Keine offenen Artikel'); return; }
    const text = 'Einkaufsliste\n' + CATS.map(c => {
      const it = open.filter(i => (i.cat || 'sonst') === c.k);
      return it.length ? `\n${c.e} ${c.name}\n` + it.map(i => `▢ ${i.name}${i.amount != null || i.unit ? ' – ' + shopAmt(i) : ''}`).join('\n') : '';
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
  addSamples() {
    const names = new Set(S.recipes.map(r => r.name));
    const add = sampleRecipes().filter(r => !names.has(r.name));
    S.recipes.push(...add); save(); render();
    toast(add.length ? `${add.length} Rezepte hinzugefügt` : 'Beispiele sind schon da');
  },
  resetAll() {
    confirmSheet('Wirklich alle Rezepte, Pläne und Listen löschen?', 'Alles löschen', () => {
      S = fresh(); S.recipes = []; save(); render(); toast('Alle Daten gelöscht');
    });
  },
};
const PLURAL_REV = Object.fromEntries(Object.entries(PLURAL).map(([a, b]) => [b, a]));

const FORMS = {
  shopAdd(f) {
    const inp = $('#sa', f), v = inp.value.trim(); if (!v) return;
    const lines = v.split(/\s*[;\n]\s*/).map(parseIng).filter(Boolean);
    addToShop(lines.map(p => ({ ...p, src: [] })));
    save(); inp.value = ''; renderShopList(); inp.focus();
  },
  pickText(f) {
    const v = $('#pt', f).value.trim(); if (!v) return;
    const cb = pending.pick; closeSheet(); cb && cb({ t: v });
  },
  recipeSave() { saveEditor(topSheet()); },
  shopEditSave() { ACT.shopEditSave(); },
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
};

/* ───────── Event wiring ───────── */
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
  if (e.target.dataset.change === 'pantry') CHANGE.pantry(e.target);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLock === null && $('[data-change="wake"]:checked')) setWake(true);
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
