'use strict';
/* Erweiterte Lebensmittel-Daten und Rezept-Analyse (ergänzt foods.js).
   Zeile: Name (wie in foods.js) | Zucker, gesättigte Fettsäuren, Salz (g je 100 g) | Merkmale
   Merkmale: v = Gemüse/Obst, l = Hülsenfrüchte, n = Nüsse/Samen, k = Kartoffeln/Knollen,
             y=2.4 = Ausbeute beim Garen (trockene Nudeln, Reis, Getreide, Hülsenfrüchte nehmen Wasser auf),
             A:… = Allergene (G Gluten, M Milch, E Ei, F Fisch, K Krebstiere, W Weichtiere, P Erdnuss,
             N Schalenfrüchte/Nüsse, S Soja, Sa Sesam, C Sellerie, Se Senf)
   Alle Werte sind Durchschnittswerte (Bundeslebensmittelschlüssel/Herstellerangaben, gerundet). */
const NUTRI_DATA = `
Kartoffeln|0.8,0,0|k
Süßkartoffeln|4.2,0,0.1|k
Zwiebeln|4.7,0,0|v
Rote Zwiebeln|4.7,0,0|v
Frühlingszwiebeln|2.3,0,0|v
Schalotten|7.9,0,0|v
Knoblauch|1,0.1,0|v
Ingwer|1.7,0.2,0|v
Karotten|4.7,0,0.1|v
Tomaten|2.6,0,0|v
Kirschtomaten|2.6,0,0|v
Gurke|1.7,0,0|v
Paprika|4.2,0,0|v
Zucchini|2.5,0.1,0|v
Aubergine|3.5,0,0|v
Brokkoli|1.7,0.1,0.1|v
Blumenkohl|1.9,0.1,0.1|v
Spinat|0.4,0.1,0.2|v
Champignons|2,0,0|v
Lauch|3.9,0,0|v
Staudensellerie|1.3,0,0.2|v,A:C
Knollensellerie|1.6,0.1,0.2|v,A:C
Kürbis|2.8,0,0|v
Rote Bete|6.8,0,0.2|v
Fenchel|3.9,0,0.1|v
Grüne Bohnen|3.3,0,0|v
Spargel|1.9,0,0|v
Avocado|0.7,2.1,0|v
Zitronen|2.5,0,0|v
Limetten|1.7,0,0|v
Äpfel|10.4,0,0|v
Bananen|12.2,0.1,0|v
Beeren|5,0,0|v
Erdbeeren|4.9,0,0|v
Kirschen|12.8,0,0|v
Orangen|9.4,0,0|v
Mango|13.7,0.1,0|v
Birnen|9.8,0,0|v
Weintrauben|16,0,0|v
Ananas|9.9,0,0|v
Kiwi|9,0,0|v
Granatapfel|13.7,0.1,0|v
Getrocknete Aprikosen|43,0,0|v
Datteln|63,0,0|v
Rucola|2,0.1,0|v
Blattsalat|1.2,0,0|v
Römersalat|1.2,0,0|v
Rotkohl|3.8,0,0|v
Weißkohl|3.2,0,0|v
Pak Choi|1.2,0,0.2|v
Radieschen|1.9,0,0.1|v
Sprossen|4,0,0|v
Chilischoten|5,0,0|v
Petersilie|0.9,0.1,0.1|v
Basilikum|0.3,0,0|v
Koriander|0.9,0,0.1|v
Schnittlauch|1.9,0.1,0|v
Dill|0,0.1,0.2|v
Minze|0,0.2,0.1|v
Salbei|1.7,0.8,0|v
Brot|2.5,0.3,1.2|A:G
Toastbrot|5,0.8,1.2|A:G
Brötchen|2,0.4,1.3|A:G
Baguette|2.8,0.3,1.4|A:G
Tortilla-Wraps|3,2.5,1.3|A:G
Pita|2,0.2,1.1|A:G
Naan|3.5,2,1.2|A:GM
Burgerbrötchen|5,1.2,1.1|A:GSa
Croissants|10,12,1|A:GME
Knäckebrot|1.5,0.3,1.2|A:G
Milch|4.8,2.3,0.1|A:M
Butter|0.6,52,0|A:M
Sahne|3.3,19,0.1|A:M
Saure Sahne|3.8,6.5,0.1|A:M
Schmand|3.5,15,0.1|A:M
Crème fraîche|2.6,20,0.1|A:M
Joghurt|4.7,2.1,0.1|A:M
Griechischer Joghurt|4,6.5,0.1|A:M
Skyr|4,0.1,0.1|A:M
Magerquark|4,0.2,0.1|A:M
Frischkäse|3.5,15,0.8|A:M
Mozzarella|1,13,0.5|A:M
Feta|1,15,2.5|A:M
Halloumi|2,17,2.7|A:M
Paneer|3,14,0.1|A:M
Parmesan|0,19,1.6|A:M
Käse (gerieben)|0,18,1.6|A:M
Ziegenkäse|1,16,1.2|A:M
Ricotta|3,7,0.3|A:M
Mascarpone|3.5,30,0.1|A:M
Eier|0.4,3.1,0.4|A:E
Eigelb|0.6,9.5,0.1|A:E
Buttermilch|4,0.3,0.1|A:M
Butterschmalz|0,61,0|A:M
Spätzle|1,1,0.1|A:GE
Gnocchi|1,0.1,1|A:G
Tortellini|2,3,1.3|A:GME
Blätterteig|1.5,11,1|A:G
Pizzateig|2,0.5,1.3|A:G
Flammkuchenteig|2,1,1.3|A:G
Yufka-Teig|1,0.3,1|A:G
Pesto|1.5,7,2.5|A:M
Tofu|0.5,1.2,0|l,A:S
Räuchertofu|0.5,1.5,1.3|l,A:S
Seidentofu|0.5,0.5,0|l,A:S
Tempeh|0.5,2.2,0|l,A:S
Hafermilch|4,0.2,0.1|A:G
Sojamilch|1,0.3,0.1|A:S
Mandelmilch|2,0.1,0.1|A:N
Sojajoghurt|1,0.4,0.1|A:S
Hafersahne|2,1.2,0.1|A:G
Hummus|0.5,2.2,1|l,A:Sa
Falafel|1,2.3,1|l
Hefeflocken|0,0.7,0.1|
Margarine|0.5,25,0.2|
Nudeln|3,0.3,0|y=2.4,A:G
Vollkornnudeln|3,0.4,0|y=2.4,A:G
Lasagneplatten|3,0.3,0|y=1.6,A:G
Orzo|3,0.3,0|y=2.4,A:G
Mie-Nudeln|1.5,0.6,0.3|y=2.6,A:GE
Reisnudeln|0,0.1,0|y=2.5
Glasnudeln|0,0,0|y=3
Udon-Nudeln|0.5,0.1,0.3|A:G
Reis|0.2,0.2,0|y=2.7
Gekochte Nudeln|0.6,0.2,0|A:G
Gekochter Reis|0.1,0.1,0|
Risottoreis|0.2,0.2,0|y=2.4
Milchreis|0.2,0.2,0|
Vollkornreis|0.7,0.5,0|y=2.5
Couscous|1.5,0.3,0|y=2.6,A:G
Bulgur|0.5,0.3,0|y=2.6,A:G
Quinoa|3,0.7,0|y=2.8
Graupen|0.8,0.3,0|y=2.8,A:G
Polenta|0.6,0.2,0|y=4
Haferflocken|1,1.3,0|A:G
Granola|20,4,0.1|A:GN
Mehl|0.7,0.2,0|A:G
Grieß|0.5,0.2,0|A:G
Paniermehl|4,0.5,1.2|A:G
Speisestärke|0,0,0|
Rote Getrocknete Erbsen|3,0.2,0|l,y=2.3
Linsen|2,0.2,0|l,y=2.4
Kichererbsen|0.3,0.3,0.6|l
Bohnen (Dose)|0.5,0.1,0.6|l
Mais|4.5,0.2,0.5|v
Gehackte Tomaten|3.5,0,0.1|v
Passierte Tomaten|4,0,0.2|v
Tomatenmark|11,0.1,0.1|v
Getrocknete Tomaten|20,2,2.5|v
Kokosmilch|2.5,17,0|
Gewürzgurken|2.5,0,2|v
Oliven|0,2,3|v
Kapern|0.4,0.2,6|v
Apfelmus|16,0,0|v
Olivenöl|0,14,0|
Öl|0,7,0|
Sesamöl|0,14,0|A:Sa
Kokosöl|0,87,0|
Erdnussbutter|6,9,0.4|n,A:P
Tahin|0.5,7.5,0.1|n,A:Sa
Zucker|100,0,0|
Vanillezucker|100,0,0|
Backpulver|0,0,25|
Hefe|0,0.2,0.1|
Trockenhefe|0,0.6,0.1|
Kakao|0.5,13,0|
Honig|82,0,0|
Ahornsirup|60,0,0|
Marmelade|55,0,0|v
Rosinen|59,0.1,0|v
Mandeln|4.4,4,0|n,A:N
Walnüsse|2.6,6,0|n,A:N
Cashews|6,8,0|n,A:N
Erdnüsse|4,7,0|n,A:P
Haselnüsse|4.3,4.5,0|n,A:N
Pinienkerne|3.6,4.9,0|n
Kerne & Saaten|2,5,0|n
Sesam|0.3,7,0|n,A:Sa
Chiasamen|0,3.3,0|n
Leinsamen|1.6,3.7,0|n
Kokosraspel|7,55,0|
Nori|0.5,0.5,1.5|
Reispapier|0,0,0.5|
Frühlingsrollenblätter|1,0.5,1|A:G
Löffelbiskuits|38,1.3,0.3|A:GE
Gemüsebrühe|0.3,0.1,0.9|A:C
Salz|0,0,100|
Pfeffer|0.6,1,0|
Paprikapulver|10,2,0.1|
Currypulver|3,1.5,0.1|
Kreuzkümmel|2.3,1.5,0.4|
Kümmel|0.6,0.6,0|
Kurkuma|3,1.8,0|
Zimt|2.2,0.3,0|
Garam Masala|3,1.5,0.2|
Ras el Hanout|3,1.5,0.2|
Gemahlener Koriander|0,1,0.1|
Chiliflocken|10,2,0.2|
Muskat|28,26,0|
Oregano|4,1.6,0|
Thymian|1.7,2.7,0.1|
Rosmarin|0,7.4,0.1|
Majoran|4,0.5,0.2|
Kräuter der Provence|3,1.5,0.1|
Lorbeerblätter|0,0,0|
Safran|0,0,0|
Vanille|0,0,0|
Essig|0.4,0,0|
Balsamico|15,0,0|
Sojasauce|1,0,15|A:SG
Teriyaki-Sauce|14,0,9|A:SG
Süße Chilisauce|50,0,2.5|
Sriracha|15,0.2,5.5|
Senf|3,0.3,4|A:Se
Ketchup|22,0,1.8|
Mayonnaise|2,6,1.3|A:ESe
Miso-Paste|6,1,12|A:S
Currypaste|6,2,6|
Zitronensaft|2.4,0,0|
Erbsen (TK)|5,0.1,0|l
Edamame (TK)|2,0.6,0|l,A:S
Gemüsemischung (TK)|3,0,0.1|v
Pommes (TK)|0.5,0.6,0.5|k
Pizza (TK)|3.5,4.5,1.3|A:GM
Eiscreme|21,6.5,0.2|A:M
Zartbitterschokolade|30,21,0|
Chips|1,3,1.4|
Tortilla-Chips|1.5,2.5,1.3|
Kekse|28,10,0.6|A:GME
Gummibärchen|46,0,0|
Popcorn|1,1.5,1.5|
Müsliriegel|25,5,0.3|A:GN
Reiswaffeln|0.5,0.6,0.1|
Wasser|0,0,0|
Orangensaft|8.5,0,0|v
Apfelsaft|10,0,0|v
Wein|0.6,0,0|
Bier|0,0,0|A:G
Kaffee|0,0,0|
Tee|0,0,0|
Limonade|10.6,0,0|
Grünkohl|1.6,0.1,0.1|v
Pastinaken|4.8,0,0|v
Kohlrabi|3.9,0,0|v
Rosenkohl|3,0.1,0.1|v
Mangold|1.1,0,0.5|v
Chicorée|1.2,0,0|v
Radicchio|0.6,0,0.1|v
Okra|1.5,0,0|v
Pfirsiche|8.4,0,0|v
Aprikosen|9.2,0,0|v
Pflaumen|10,0,0|v
Rhabarber|1.1,0,0|v
Melone|8,0,0|v
Feigen|16,0,0|v
Artischocken|1,0.2,0.8|v
Sauerkraut|0.5,0.1,1.2|v
Maronen|11,0.4,0|n
Jackfruit|19,0.2,0.1|v
Seitan|0.5,0.3,0.8|A:G
Sojaschnetzel|7,0.2,0|l,y=2.8,A:S
Kokosjoghurt|3,9,0.1|
Proteinpulver|5,3,0.5|A:M
Veganes Proteinpulver|2,1.5,1|
Hüttenkäse|2.7,2.8,0.9|A:M
Gorgonzola|0,20,2.5|A:M
Camembert|0.5,15,1.7|A:M
Ziegenfrischkäse|2,12,1.3|A:M
Kefir|4,2.2,0.1|A:M
Eiweiß|0.7,0,0.4|A:E
Kimchi|2,0.1,2|v
Schupfnudeln|1,0.3,1|A:GE
Kichererbsenmehl|10,0.6,0.1|l
Hirse|1.7,0.7,0|y=2.8
Buchweizen|0.9,0.7,0|y=2.5
Grünkern|1,0.5,0|y=2.6,A:G
Dinkel|1,0.4,0|y=2.6,A:G
Amaranth|1.7,1.5,0|y=2.8
Haferkleie|1.5,1.3,0|A:G
Cornflakes|8,0.2,1.7|A:G
Soba-Nudeln|1,0.2,0.5|y=2.4,A:G
Linsennudeln|1.5,0.3,0|l,y=2.3
Taco-Schalen|1,3,1.2|
Bagels|6,0.5,1.1|A:G
Laugenbrezeln|2,0.4,2.5|A:G
Mandelmus|4,4.5,0|n,A:N
Pistazien|7.7,5.6,0|n,A:N
Cranberries|65,0.1,0|v
Puddingpulver|0,0,0.4|
Agar-Agar|0,0,0|
Nuss-Nougat-Creme|56,10,0.1|A:MN
Ajvar|6,0.4,1.5|v
Hoisin-Sauce|35,0.5,4|A:SG
Harissa|5,1.5,3|v
Meerrettich|8,0.1,0.8|v
Gewürzmischung|5,1.5,1|
Ganze Gewürze|2,2,0|
Lachs|0,3,0.1|A:F
Räucherlachs|0,2,3|A:F
Thunfisch (Dose)|0,0.3,0.9|A:F
Kabeljau|0,0.1,0.2|A:F
Seelachs|0,0.2,0.2|A:F
Garnelen|0,0.3,0.6|A:K
Forelle|0,0.6,0.1|A:F
Makrele|0,3.7,0.2|A:F
Dorade|0,0.5,0.2|A:F
Zander|0,0.2,0.1|A:F
Matjes|0,5,5|A:F
Sardinen (Dose)|0,3,0.8|A:F
Tintenfisch|0,0.3,0.6|A:W
Miesmuscheln|0,0.4,0.7|A:W
Fischstäbchen|1.5,1,0.9|A:FG
Fischsauce|4,0,23|A:F
`;

const ALLERGENS = {
  G: { name: 'Gluten', short: 'Gluten', e: '🌾' }, M: { name: 'Milch (Laktose)', short: 'Milch', e: '🥛' },
  E: { name: 'Ei', short: 'Ei', e: '🥚' }, F: { name: 'Fisch', short: 'Fisch', e: '🐟' },
  K: { name: 'Krebstiere', short: 'Krebstiere', e: '🦐' }, W: { name: 'Weichtiere', short: 'Weichtiere', e: '🦑' },
  P: { name: 'Erdnüsse', short: 'Erdnuss', e: '🥜' }, N: { name: 'Schalenfrüchte (Nüsse)', short: 'Nüsse', e: '🌰' },
  S: { name: 'Soja', short: 'Soja', e: '🫘' }, Sa: { name: 'Sesam', short: 'Sesam', e: '⚪' },
  C: { name: 'Sellerie', short: 'Sellerie', e: '🥬' }, Se: { name: 'Senf', short: 'Senf', e: '🟡' },
};
const ALLERGEN_KEYS = Object.keys(ALLERGENS);

// Merkmale an die Lebensmittel aus foods.js hängen
(function () {
  for (const line of NUTRI_DATA.trim().split('\n')) {
    const [name, vals, flags] = line.split('|');
    const [sug, sfa, salt] = vals.split(',').map(Number);
    const ex = { sug, sfa, salt, grp: '', yld: 1, al: [] };
    for (const t of (flags || '').split(',').filter(Boolean)) {
      if (/^[vlnk]$/.test(t)) ex.grp = t;
      else if (t.startsWith('y=')) ex.yld = +t.slice(2);
      else if (t.startsWith('A:')) ex.al = t.slice(2).match(/Sa|Se|[A-Z]/g) || [];
    }
    for (const f of FOODS) if (f.name === name) Object.assign(f, ex, { al: [...ex.al] }); // Namen können doppelt vorkommen
  }
  for (const f of FOODS) if (f.sug == null) Object.assign(f, { sug: 0, sfa: f.f * 0.3, salt: 0, grp: '', yld: 1, al: [] });
})();

// Zutaten, die nicht im Katalog stehen, trotzdem auf Allergene prüfen
const ALLERGEN_WORDS = [
  ['G', /weizen|dinkel|roggen|gerste|hafer|mehl|nudel|pasta|brot|brötchen|semmel|teig|croûton|crouton|paniermehl|seitan|couscous|bulgur|grünkern|spätzle|gnocchi|knödel|bier/i],
  ['M', /milch|käse|sahne|butter|joghurt|quark|rahm|mozzarella|parmesan|feta|ricotta|mascarpone|burrata|halloumi|paneer|ghee|molke|skyr|kefir|schmand|crème/i],
  ['E', /\bei\b|eier|eigelb|eiweiß|mayonnaise|aioli|hollandaise/i],
  ['F', /lachs|thunfisch|kabeljau|seelachs|forelle|makrele|dorade|zander|matjes|sardine|sardelle|anchovi|fisch/i],
  ['K', /garnele|krabbe|shrimp|gamba|hummer|scampi/i],
  ['W', /muschel|tintenfisch|calamar|oktopus/i],
  ['P', /erdnuss/i],
  ['N', /mandel|walnuss|haselnuss|cashew|pistazie|pekan|macadamia|paranuss/i],
  ['S', /\bsoja|tofu|tempeh|edamame|miso/i],
  ['Sa', /sesam|tahin|hummus/i],
  ['C', /sellerie/i],
  ['Se', /\bsenf/i],
];
const _vegan = /pflanzlich|vegan|soja|hafer|mandel|kokos|reis(drink|milch)/i;

/* ── Nutri-Score (Berechnung nach dem Algorithmus 2023 für allgemeine Lebensmittel, je 100 g) ── */
const NS_ENERGY = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const NS_SUGAR = [3.4, 6.8, 10, 14, 17, 20, 24, 27, 31, 34, 37, 41, 44, 48, 51];
const NS_SFA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const NS_SALT = Array.from({ length: 20 }, (_, i) => +((i + 1) * 0.2).toFixed(1));
const NS_FIBER = [3.0, 4.1, 5.2, 6.3, 7.4];
const NS_PROT = [2.4, 4.8, 7.2, 9.6, 12, 14, 17];
const pts = (v, steps) => steps.filter(s => v > s).length;
function nutriScore(per100, fvlPct) {
  const neg = pts(per100.kcal * 4.184, NS_ENERGY) + pts(per100.sug, NS_SUGAR) + pts(per100.sfa, NS_SFA) + pts(per100.salt, NS_SALT);
  const fvl = fvlPct > 80 ? 5 : fvlPct > 60 ? 2 : fvlPct > 40 ? 1 : 0;
  const prot = neg >= 11 && fvl < 5 ? 0 : pts(per100.p, NS_PROT);
  const score = neg - (prot + pts(per100.fib, NS_FIBER) + fvl);
  const grade = score <= 0 ? 'A' : score <= 2 ? 'B' : score <= 10 ? 'C' : score <= 18 ? 'D' : 'E';
  return { score, grade, neg, pos: score - neg };
}

/* ── Vollständige Analyse eines Rezepts (Ergebnis pro Portion, wo nicht anders angegeben) ── */
const SALT_PINCH = 1.0; // „Salz“ ohne Mengenangabe: ca. 1 g pro Portion zum Abschmecken
function analyzeRecipe(r) {
  const serv = r.servings || 1;
  const t = { kcal: 0, p: 0, c: 0, f: 0, fib: 0, sug: 0, sfa: 0, salt: 0, g: 0, gCooked: 0, veg: 0, leg: 0, nuts: 0 };
  const al = new Set();
  let vegan = true, fish = false, known = 0, counted = 0, saltToTaste = false;
  for (const ing of r.ingredients) {
    const fd = matchFood(ing.name);
    if (fd) { fd.al.forEach(a => al.add(a)); if (fd.animal) vegan = false; if (fd.fish) fish = true; }
    else {
      for (const [k, re] of ALLERGEN_WORDS) if (re.test(ing.name) && !(k === 'M' && _vegan.test(ing.name))) al.add(k);
      if (/\b(ei|eier|käse|milch|butter|sahne|joghurt|quark|honig)\b/i.test(ing.name) && !_vegan.test(ing.name)) vegan = false;
    }
    if (/^salz\b/i.test(ing.name) && ing.amount == null) saltToTaste = true;
    if (ing.amount == null) continue;
    counted++;
    if (!fd) continue;
    known++;
    const g = ingGrams(ing, fd), k = g / 100;
    t.kcal += fd.kcal * k; t.p += fd.p * k; t.c += fd.c * k; t.f += fd.f * k; t.fib += fd.fib * k;
    t.sug += fd.sug * k; t.sfa += fd.sfa * k; t.salt += fd.salt * k;
    t.g += g; t.gCooked += g * (fd.yld || 1);
    if (!fd.nonfood && !/gewuerz/.test(fd.cat)) {
      if (fd.grp === 'v') t.veg += g; else if (fd.grp === 'l') t.leg += g * (fd.yld || 1); else if (fd.grp === 'n') t.nuts += g;
    }
  }
  if (saltToTaste) { t.salt += SALT_PINCH * serv; t.g += SALT_PINCH * serv; t.gCooked += SALT_PINCH * serv; }
  const pp = {}; for (const k of ['kcal', 'p', 'c', 'f', 'fib', 'sug', 'sfa', 'salt']) pp[k] = t[k] / serv;
  const weight = t.gCooked / serv;
  const per100 = {}; for (const k of ['kcal', 'p', 'c', 'f', 'fib', 'sug', 'sfa', 'salt']) per100[k] = t.gCooked ? t[k] / t.gCooked * 100 : 0;
  const fvlPct = t.gCooked ? (t.veg + t.leg) / t.gCooked * 100 : 0;
  const ns = t.kcal > 0 && t.gCooked > 0 ? nutriScore(per100, fvlPct) : null;
  const vegPortions = (t.veg + t.leg) / serv / 80; // 1 Portion Gemüse/Obst ≈ 80 g („5 am Tag“)
  const density = t.gCooked ? t.kcal / t.gCooked : 0; // kcal pro g
  return {
    ...pp, weight, per100, fvlPct, ns, vegPortions, density, saltToTaste,
    pp: t.kcal ? t.p * 4 / t.kcal * 100 : 0,
    allergens: ALLERGEN_KEYS.filter(k => al.has(k)), vegan, fish,
    coverage: counted ? known / counted : 1,
  };
}

// Kurze, verständliche Einordnung einzelner Werte
function densityInfo(d) {
  return d <= 0 ? null : d < 1.0 ? { lbl: 'sehr sättigend', tip: 'Wenig Kalorien pro Bissen – macht satt, ohne viel Energie.', lvl: 'good' }
    : d < 1.6 ? { lbl: 'gut sättigend', tip: 'Ausgewogene Energiedichte.', lvl: 'good' }
      : d < 2.4 ? { lbl: 'mittel', tip: 'Mittlere Energiedichte – auf die Portionsgröße achten.', lvl: 'mid' }
        : { lbl: 'energiereich', tip: 'Viele Kalorien pro Bissen – kleine Portion genügt.', lvl: 'bad' };
}
// Ampel je 100 g (Grenzwerte der britischen Lebensmittel-Ampel, die auch Verbraucherzentralen nutzen)
const TRAFFIC = { f: [3, 17.5], sfa: [1.5, 5], sug: [5, 22.5], salt: [0.3, 1.5] };
const trafficLevel = (k, v) => v <= TRAFFIC[k][0] ? 'good' : v <= TRAFFIC[k][1] ? 'mid' : 'bad';
