'use strict';
/* Abteilungen im Supermarkt für die Einkaufsliste. Die Reihenfolge ist in den Einstellungen änderbar.
   Jedes Lebensmittel aus foods.js bekommt eine Abteilung (f.dept); Unbekanntes landet unter „Sonstiges“. */
const DEPTS = [
  { k: 'obst', name: 'Obst', e: '🍎' },
  { k: 'gemuese', name: 'Gemüse, Salat & Kräuter', e: '🥦' },
  { k: 'brot', name: 'Brot & Backwaren', e: '🥖' },
  { k: 'milch', name: 'Milch, Joghurt & Butter', e: '🥛' },
  { k: 'kaese', name: 'Käse', e: '🧀' },
  { k: 'kuehl', name: 'Kühlregal: Eier, Teig & Frisches', e: '🥚' },
  { k: 'tofu', name: 'Tofu, Veggie & Pflanzendrinks', e: '🌱' },
  { k: 'fisch', name: 'Fleisch & Fisch', e: '🐟' },
  { k: 'nudeln', name: 'Nudeln, Reis & Getreide', e: '🍝' },
  { k: 'konserven', name: 'Konserven, Hülsenfrüchte & Internationales', e: '🥫' },
  { k: 'backen', name: 'Backen, Müsli & Aufstriche', e: '🌾' },
  { k: 'nuesse', name: 'Nüsse, Kerne & Trockenobst', e: '🥜' },
  { k: 'gewuerz', name: 'Gewürze, Öl & Saucen', e: '🧂' },
  { k: 'snack', name: 'Süßes & Snacks', e: '🍫' },
  { k: 'getraenk', name: 'Getränke', e: '🥤' },
  { k: 'tk', name: 'Tiefkühl', e: '🧊' },
  { k: 'haushalt', name: 'Drogerie & Haushalt', e: '🧻' },
  { k: 'sonst', name: 'Sonstiges', e: '🛒' },
];
const DEPT_BY = Object.fromEntries(DEPTS.map(d => [d.k, d]));
// Alte Kategorien (bis v4) → Abteilung, und zurück (damit ältere App-Versionen weiter etwas Sinnvolles anzeigen)
const OLD_TO_DEPT = { obst: 'gemuese', brot: 'brot', kuehl: 'kuehl', tofu: 'tofu', getreide: 'nudeln', vorrat: 'konserven', gewuerz: 'gewuerz', tk: 'tk', snack: 'snack', getraenk: 'getraenk', haushalt: 'haushalt', fleisch: 'fisch', sonst: 'sonst' };
const DEPT_TO_OLD = { obst: 'obst', gemuese: 'obst', brot: 'brot', milch: 'kuehl', kaese: 'kuehl', kuehl: 'kuehl', tofu: 'tofu', fisch: 'fleisch', nudeln: 'getreide', konserven: 'vorrat', backen: 'vorrat', nuesse: 'vorrat', gewuerz: 'gewuerz', snack: 'snack', getraenk: 'getraenk', tk: 'tk', haushalt: 'haushalt', sonst: 'sonst' };
const FOOD_DEPT = {
  obst: 'Zitronen,Limetten,Äpfel,Bananen,Beeren,Erdbeeren,Kirschen,Orangen,Mango,Birnen,Weintrauben,Ananas,Kiwi,Granatapfel,Avocado,Pfirsiche,Aprikosen,Pflaumen,Rhabarber,Melone,Feigen',
  milch: 'Milch,Butter,Sahne,Saure Sahne,Schmand,Crème fraîche,Joghurt,Griechischer Joghurt,Skyr,Magerquark,Buttermilch,Butterschmalz,Kefir,Hüttenkäse',
  kaese: 'Frischkäse,Mozzarella,Feta,Halloumi,Paneer,Parmesan,Käse (gerieben),Ziegenkäse,Ricotta,Mascarpone,Gorgonzola,Camembert,Ziegenfrischkäse',
  kuehl: 'Eier,Eigelb,Eiweiß,Spätzle,Gnocchi,Tortellini,Blätterteig,Pizzateig,Flammkuchenteig,Yufka-Teig,Udon-Nudeln,Kimchi,Schupfnudeln,Hefe',
  konserven: 'Kichererbsen,Bohnen (Dose),Mais,Gehackte Tomaten,Passierte Tomaten,Tomatenmark,Getrocknete Tomaten,Kokosmilch,Gewürzgurken,Oliven,Kapern,Apfelmus,Artischocken,Sauerkraut,Maronen,Ajvar,Rote Getrocknete Erbsen,Linsen,Nori,Reispapier,Taco-Schalen,Pesto,Jackfruit',
  backen: 'Mehl,Grieß,Paniermehl,Speisestärke,Zucker,Vanillezucker,Backpulver,Trockenhefe,Kakao,Puddingpulver,Agar-Agar,Kichererbsenmehl,Haferflocken,Granola,Cornflakes,Haferkleie,Kokosraspel,Honig,Ahornsirup,Marmelade,Nuss-Nougat-Creme,Erdnussbutter,Mandelmus,Löffelbiskuits',
  nuesse: 'Mandeln,Walnüsse,Cashews,Erdnüsse,Haselnüsse,Pinienkerne,Kerne & Saaten,Sesam,Chiasamen,Leinsamen,Pistazien,Getrocknete Aprikosen,Datteln,Rosinen,Cranberries',
  gewuerz: 'Olivenöl,Öl,Sesamöl,Kokosöl,Tahin',
};
(function () {
  const map = {};
  for (const [d, list] of Object.entries(FOOD_DEPT)) for (const n of list.split(',')) map[n] = d;
  for (const f of FOODS) f.dept = map[f.name] || OLD_TO_DEPT[f.cat] || 'sonst';
})();
