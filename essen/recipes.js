'use strict';
/* Eingebaute Rezepte (alle vegetarisch). Nährwerte werden automatisch aus foods.js berechnet.
   Format je Rezept (durch Leerzeile getrennt):
   Name|Emoji|Minuten|Portionen|Schwierigkeit 1-3|Kategorien
   Zutat; Zutat; …
   Schritt | Schritt | … */
const RECIPE_TEXT = `
Overnight Oats|🥣|5|1|1|Frühstück,Meal Prep
50 g Haferflocken; 150 g Joghurt; 80 ml Milch; 1 TL Honig; 80 g Beeren; 1 EL Walnüsse
Haferflocken, Joghurt, Milch und Honig in einem Glas verrühren. | Abgedeckt über Nacht in den Kühlschrank stellen. | Morgens mit Beeren und gehackten Walnüssen toppen.

Apfel-Zimt-Porridge|🥣|10|2|1|Frühstück
100 g Haferflocken; 300 ml Milch; 200 ml Wasser; 1 Apfel; 1 TL Zimt; 1 EL Ahornsirup; 2 EL Mandeln; Salz
Haferflocken mit Milch, Wasser und einer Prise Salz aufkochen. | Bei kleiner Hitze 5 Minuten quellen lassen, dabei rühren. | Apfel reiben oder würfeln und mit Zimt unterrühren. | Mit Ahornsirup süßen und mit gehackten Mandeln servieren.

Shakshuka|🍳|25|2|1|Frühstück,Orientalisch
4 Eier; 1 Zwiebel; 1 rote Paprika; 2 Zehen Knoblauch; 400 g gehackte Tomaten (Dose); 1 TL Kreuzkümmel; 1 TL Paprikapulver; 1 EL Olivenöl; 50 g Feta; ½ Bund Petersilie; Salz; Pfeffer
Zwiebel, Paprika und Knoblauch würfeln und in Öl 5 Minuten weich dünsten. | Gewürze kurz mitrösten, Tomaten zugeben, salzen und 10 Minuten einköcheln lassen. | Vier Mulden formen, Eier hineingleiten lassen und zugedeckt 6–8 Minuten stocken lassen. | Mit Feta und Petersilie bestreuen.

Rührei mit Spinat & Tomaten|🍳|10|2|1|Frühstück
5 Eier; 100 g Babyspinat; 150 g Kirschtomaten; 1 EL Butter; 2 EL Milch; 2 Scheiben Vollkornbrot; Salz; Pfeffer
Eier mit Milch, Salz und Pfeffer verquirlen. | Butter in einer Pfanne schmelzen, halbierte Tomaten kurz anbraten und den Spinat zusammenfallen lassen. | Eier zugeben und bei mittlerer Hitze langsam stocken lassen. | Mit Brot servieren.

Avocado-Toast mit Ei|🥑|15|2|1|Frühstück
4 Scheiben Vollkornbrot; 1 Avocado; 2 Eier; ½ Zitrone; 1 Prise Chiliflocken; Salz; Pfeffer
Brot toasten. Eier 6–7 Minuten wachsweich kochen, abschrecken und pellen. | Avocado mit Zitronensaft, Salz und Pfeffer zerdrücken. | Auf das Brot streichen, Eier halbieren und darauflegen. | Mit Chiliflocken bestreuen.

Bircher Müsli|🍎|10|2|1|Frühstück,Meal Prep
100 g Haferflocken; 200 ml Milch; 150 g Joghurt; 1 Apfel; 1 EL Zitronensaft; 1 EL Honig; 2 EL Haselnüsse; 100 g Beeren
Haferflocken mit Milch mischen und mindestens 30 Minuten oder über Nacht quellen lassen. | Apfel grob reiben und sofort mit Zitronensaft mischen. | Apfel, Joghurt und Honig unterrühren. | Mit gehackten Haselnüssen und Beeren servieren.

Chia-Pudding mit Mango|🥭|10|2|1|Frühstück,Meal Prep
4 EL Chiasamen; 300 ml Hafermilch; 1 EL Ahornsirup; 1 Mango; 2 EL Kokosraspel
Chiasamen mit Hafermilch und Ahornsirup verrühren. | Nach 10 Minuten nochmals umrühren, dann mindestens 2 Stunden kühlen. | Mango schälen und würfeln oder pürieren. | Pudding mit Mango schichten und mit Kokosraspeln bestreuen.

Pfannkuchen|🥞|25|2|1|Frühstück,Süß,Klassiker
200 g Mehl; 3 Eier; 400 ml Milch; 1 EL Zucker; 1 Prise Salz; 2 EL Butter
Mehl, Eier, Milch, Zucker und Salz glatt verrühren und 10 Minuten ruhen lassen. | Etwas Butter in einer Pfanne erhitzen. | Eine Kelle Teig dünn verteilen und von beiden Seiten goldbraun backen. | Mit Apfelmus, Zimt und Zucker oder Marmelade servieren.

Bananen-Pancakes|🥞|20|2|1|Frühstück,Süß
2 Bananen; 2 Eier; 100 g Haferflocken; 100 ml Milch; 1 TL Backpulver; 1 EL Öl; 150 g Joghurt; 100 g Beeren
Bananen zerdrücken und mit Eiern, Haferflocken, Milch und Backpulver zu einem Teig mixen. | Öl in einer Pfanne erhitzen und kleine Pancakes von jeder Seite etwa 2 Minuten backen. | Mit Joghurt und Beeren servieren.

French Toast|🍞|20|2|1|Frühstück,Süß
4 Scheiben Toastbrot; 2 Eier; 150 ml Milch; 1 TL Zimt; 1 Pck Vanillezucker; 1 EL Butter; 1 EL Ahornsirup; 100 g Beeren
Eier, Milch, Zimt und Vanillezucker verquirlen. | Brotscheiben kurz darin einweichen. | In Butter von beiden Seiten goldbraun braten. | Mit Ahornsirup und Beeren servieren.

Smoothie Bowl|🫐|10|2|1|Frühstück
2 Bananen; 250 g TK-Beeren; 150 ml Hafermilch; 4 EL Granola; 1 EL Chiasamen; 1 Kiwi
Bananen in Stücke brechen und mit den gefrorenen Beeren und der Hafermilch cremig mixen. | In zwei Schalen füllen. | Mit Granola, Chiasamen und Kiwischeiben toppen.

Skyr-Bowl mit Granola|🥣|5|1|1|Frühstück
200 g Skyr; 40 g Granola; 1 Banane; 1 TL Honig; 1 EL Leinsamen
Skyr in eine Schale geben. | Banane in Scheiben schneiden und mit Granola und Leinsamen darauf verteilen. | Mit Honig beträufeln.

Gemüse-Frittata|🍳|30|4|1|Frühstück,Ofen,Meal Prep
8 Eier; 100 ml Milch; 1 Zucchini; 1 rote Paprika; 1 Zwiebel; 100 g Babyspinat; 100 g Feta; 1 EL Olivenöl; Salz; Pfeffer
Ofen auf 200 °C vorheizen und das Gemüse klein schneiden. | Zwiebel, Paprika und Zucchini in einer ofenfesten Pfanne in Öl 5 Minuten anbraten, Spinat zusammenfallen lassen. | Eier mit Milch, Salz und Pfeffer verquirlen, über das Gemüse gießen und Feta darüberbröseln. | Im Ofen etwa 15 Minuten stocken lassen.

Tofu-Rührei|🌱|15|2|1|Frühstück
200 g Tofu; 1 Frühlingszwiebel; 100 g Kirschtomaten; ½ TL Kurkuma; 1 EL Hefeflocken; 1 EL Öl; 2 Scheiben Vollkornbrot; Salz; Pfeffer
Tofu mit einer Gabel zerbröseln, Frühlingszwiebel in Ringe schneiden, Tomaten halbieren. | Öl erhitzen und den Tofu mit Kurkuma 5 Minuten braten. | Tomaten und Frühlingszwiebel zugeben, mit Hefeflocken, Salz und Pfeffer würzen. | Mit Brot servieren.

Quark-Bowl mit Beeren|🍓|5|1|1|Frühstück
250 g Magerquark; 50 ml Milch; 150 g Beeren; 1 TL Honig; 1 EL Walnüsse
Quark mit Milch cremig rühren. | Beeren waschen und darauf verteilen. | Mit Honig beträufeln und mit gehackten Walnüssen toppen.

Herzhafte Oats mit Spiegelei|🥣|15|2|1|Frühstück
100 g Haferflocken; 400 ml Gemüsebrühe; 100 g Babyspinat; 2 Eier; 30 g Parmesan; 1 Frühlingszwiebel; 1 TL Öl; Pfeffer
Haferflocken in der Brühe 5 Minuten köcheln lassen. | Spinat und Parmesan unterrühren. | Eier in Öl zu Spiegeleiern braten. | Oats mit Spiegelei, Frühlingszwiebelringen und Pfeffer servieren.

Bananenbrot|🍌|70|12|1|Frühstück,Backen,Süß,Meal Prep
3 Bananen; 2 Eier; 80 g Butter; 80 g Zucker; 250 g Mehl; 1 Pck Backpulver; 1 TL Zimt; 50 g Walnüsse
Ofen auf 175 °C vorheizen und eine Kastenform fetten. | Bananen zerdrücken und mit geschmolzener Butter, Eiern und Zucker verrühren. | Mehl, Backpulver und Zimt unterheben, gehackte Walnüsse zugeben. | Teig in die Form füllen und etwa 55 Minuten backen.

Shakshuka verde|🍳|25|2|1|Frühstück
4 Eier; 200 g Babyspinat; 1 Zucchini; 1 Lauch; 2 Zehen Knoblauch; 1 EL Olivenöl; 50 g Feta; 1 TL Kreuzkümmel; Salz; Pfeffer
Lauch in Ringe, Zucchini in Würfel schneiden und Knoblauch hacken. | In Öl 6 Minuten dünsten, Kreuzkümmel und Spinat zugeben und salzen. | Mulden formen, Eier hineingeben und zugedeckt 6–8 Minuten stocken lassen. | Mit Feta bestreuen.

Frühstücks-Wrap mit Ei & Bohnen|🌯|20|2|1|Frühstück,Mexikanisch
2 Tortilla-Wraps; 3 Eier; 150 g schwarze Bohnen (Dose); 1 Avocado; 1 Tomate; 50 g geriebener Käse; 1 TL Öl; Salz; Pfeffer
Bohnen abspülen und in einer Pfanne erwärmen. | Eier verquirlen, salzen und in Öl als Rührei stocken lassen. | Tomate und Avocado würfeln. | Wraps mit Ei, Bohnen, Avocado, Tomate und Käse füllen und einrollen.

Grießbrei mit Beeren|🥣|15|2|1|Frühstück,Süß,Dessert
500 ml Milch; 60 g Weichweizengrieß; 2 EL Zucker; 1 Pck Vanillezucker; 1 Prise Salz; 1 TL Zimt; 150 g Beeren
Milch mit Zucker, Vanillezucker und Salz aufkochen. | Grieß einrieseln lassen und unter Rühren 3 Minuten köcheln. | Mit Zimt und Beeren servieren.

Spaghetti Aglio e Olio|🍝|20|2|1|Pasta,Italienisch
250 g Spaghetti; 4 Zehen Knoblauch; 1 Chilischote; 5 EL Olivenöl; ½ Bund Petersilie; 30 g Parmesan; Salz
Spaghetti in reichlich Salzwasser al dente kochen. | Knoblauch in dünne Scheiben, Chili in Ringe schneiden. | Beides in Olivenöl bei mittlerer Hitze goldgelb werden lassen. | Nudeln mit etwas Kochwasser in der Pfanne schwenken und mit Petersilie und Parmesan servieren.

Pasta al Pomodoro|🍅|25|4|1|Pasta,Italienisch
400 g Spaghetti; 800 g geschälte Tomaten (Dose); 3 Zehen Knoblauch; 3 EL Olivenöl; 1 Bund Basilikum; 40 g Parmesan; 1 TL Zucker; Salz; Pfeffer
Knoblauch hacken und in Olivenöl kurz anschwitzen. | Tomaten zugeben, zerdrücken und mit Zucker, Salz und Pfeffer 15 Minuten köcheln. | Spaghetti al dente kochen. | Nudeln mit der Sauce mischen und mit Basilikum und Parmesan servieren.

Penne all'Arrabbiata|🌶️|25|4|1|Pasta,Italienisch,Scharf
400 g Penne; 800 g gehackte Tomaten (Dose); 3 Zehen Knoblauch; 2 Chilischoten; 3 EL Olivenöl; ½ Bund Petersilie; Salz
Knoblauch und Chili fein hacken und in Öl anbraten. | Tomaten zugeben, salzen und 15 Minuten einköcheln lassen. | Penne al dente kochen und unter die Sauce heben. | Mit Petersilie bestreuen.

Linsen-Bolognese|🍝|45|4|1|Pasta,Italienisch,Meal Prep
400 g Spaghetti; 180 g rote Linsen; 1 Zwiebel; 2 Karotten; 2 Stangen Staudensellerie; 2 Zehen Knoblauch; 2 EL Tomatenmark; 800 g passierte Tomaten; 300 ml Gemüsebrühe; 2 EL Olivenöl; 1 TL Oregano; Salz; Pfeffer
Zwiebel, Karotten, Sellerie und Knoblauch fein würfeln und in Öl 5 Minuten anbraten. | Tomatenmark kurz anrösten, dann Linsen, passierte Tomaten, Brühe und Oregano zugeben. | 20 Minuten köcheln lassen, bis die Linsen weich sind, und abschmecken. | Mit den al dente gekochten Spaghetti servieren.

Gemüse-Lasagne|🍝|75|6|2|Pasta,Italienisch,Ofen,Meal Prep
12 Lasagneplatten; 2 Zucchini; 1 Aubergine; 1 rote Paprika; 1 Zwiebel; 2 Zehen Knoblauch; 800 g passierte Tomaten; 2 EL Olivenöl; 50 g Butter; 50 g Mehl; 600 ml Milch; 150 g geriebener Käse; 1 TL Oregano; Muskat; Salz; Pfeffer
Gemüse würfeln und mit Zwiebel und Knoblauch in Öl 8 Minuten braten, passierte Tomaten und Oregano zugeben und würzen. | Für die Béchamel Butter schmelzen, Mehl anschwitzen, Milch einrühren, 5 Minuten köcheln und mit Muskat und Salz würzen. | Ofen auf 180 °C vorheizen und abwechselnd Gemüsesauce, Lasagneplatten und Béchamel in eine Form schichten. | Mit Käse bestreuen und 40 Minuten backen.

Spinat-Ricotta-Cannelloni|🥬|60|4|2|Pasta,Italienisch,Ofen
250 g Cannelloni; 450 g Blattspinat (TK); 250 g Ricotta; 1 Ei; 2 Zehen Knoblauch; 700 g passierte Tomaten; 125 g Mozzarella; 30 g Parmesan; Muskat; Salz; Pfeffer
Spinat auftauen, gut ausdrücken und hacken. | Mit Ricotta, Ei, gehacktem Knoblauch, Parmesan, Muskat, Salz und Pfeffer mischen. | Masse in die Cannelloni füllen und auf die gewürzten passierten Tomaten in eine Auflaufform legen. | Mit Mozzarella belegen und bei 180 °C 35 Minuten backen.

Linguine mit Basilikum-Pesto|🌿|20|4|1|Pasta,Italienisch
400 g Linguine; 2 Bund Basilikum; 40 g Pinienkerne; 50 g Parmesan; 1 Zehe Knoblauch; 100 ml Olivenöl; 200 g Kirschtomaten; Salz
Pinienkerne ohne Fett goldbraun rösten. | Basilikum, Pinienkerne, Parmesan, Knoblauch und Öl zu einem Pesto mixen und salzen. | Linguine al dente kochen und etwas Kochwasser auffangen. | Nudeln mit Pesto, etwas Kochwasser und halbierten Tomaten mischen.

Käsespätzle|🧀|30|4|1|Deutsch,Klassiker,Ofen
1 kg Spätzle (Kühlregal); 250 g geriebener Bergkäse; 3 Zwiebeln; 2 EL Butter; ½ Bund Schnittlauch; Pfeffer
Zwiebeln in Ringe schneiden und in Butter langsam goldbraun braten. | Ofen auf 200 °C vorheizen und die Spätzle schichtweise mit dem Käse in eine Auflaufform geben, pfeffern. | 10–15 Minuten backen, bis der Käse geschmolzen ist. | Mit Röstzwiebeln und Schnittlauch servieren.

Zucchini-Zitronen-Pasta|🍋|20|2|1|Pasta,Italienisch
250 g Spaghetti; 2 Zucchini; 1 Bio-Zitrone; 2 Zehen Knoblauch; 2 EL Olivenöl; 40 g Parmesan; 50 g Frischkäse; Salz; Pfeffer
Spaghetti kochen, Zucchini grob raspeln und Knoblauch hacken. | Knoblauch in Öl anschwitzen und die Zucchini 4 Minuten mitbraten. | Zitronenschale und -saft, Frischkäse und etwas Nudelwasser einrühren. | Nudeln untermischen und mit Parmesan, Salz und Pfeffer abschmecken.

Brokkoli-Walnuss-Pasta|🥦|25|4|1|Pasta
400 g Orecchiette; 1 Brokkoli; 60 g Walnüsse; 3 Zehen Knoblauch; 4 EL Olivenöl; 1 Prise Chiliflocken; 50 g Parmesan; ½ Zitrone; Salz
Brokkoli in kleine Röschen teilen und die letzten 4 Minuten mit den Nudeln kochen. | Walnüsse grob hacken und mit Knoblauch in Öl anrösten, Chiliflocken zugeben. | Nudeln und Brokkoli abgießen und in der Pfanne schwenken. | Mit Zitronensaft, Parmesan und Salz abschmecken.

Mac and Cheese|🧀|30|4|1|Pasta,Klassiker,Ofen
400 g Makkaroni; 40 g Butter; 40 g Mehl; 600 ml Milch; 200 g Cheddar; 1 TL Senf; 3 EL Paniermehl; Muskat; Salz
Makkaroni knapp al dente kochen. | Butter schmelzen, Mehl anschwitzen, Milch einrühren und 5 Minuten köcheln. | Käse und Senf darin schmelzen, mit Muskat und Salz würzen und die Nudeln untermischen. | In eine Form geben, mit Paniermehl bestreuen und bei 200 °C 15 Minuten überbacken.

Gnocchi mit Salbeibutter|🥔|15|2|1|Italienisch
500 g Gnocchi; 60 g Butter; 1 Bund Salbei; 40 g Parmesan; Pfeffer
Gnocchi nach Packungsangabe garen. | Butter aufschäumen und die Salbeiblätter darin knusprig braten. | Gnocchi in der Salbeibutter schwenken. | Mit Parmesan und Pfeffer servieren.

Ofen-Gnocchi mit Tomate & Mozzarella|🍅|30|3|1|Italienisch,Ofen
750 g Gnocchi; 400 g Kirschtomaten; 1 Zucchini; 2 Zehen Knoblauch; 2 EL Olivenöl; 250 g passierte Tomaten; 2 Kugeln Mozzarella; ½ Bund Basilikum; Salz; Pfeffer
Ofen auf 200 °C vorheizen. | Gnocchi, Tomaten, gewürfelte Zucchini, gehackten Knoblauch, Öl und passierte Tomaten in einer Form mischen und würzen. | 15 Minuten backen, dann Mozzarella darüberzupfen. | Weitere 10 Minuten backen und mit Basilikum servieren.

Kürbis-Salbei-Pasta|🎃|35|4|1|Pasta,Herbst
400 g Rigatoni; 600 g Hokkaido-Kürbis; 1 Zwiebel; 2 Zehen Knoblauch; 200 ml Gemüsebrühe; 100 ml Sahne; 2 EL Olivenöl; ½ Bund Salbei; 40 g Parmesan; Muskat; Salz
Kürbis entkernen und mit Schale würfeln, Zwiebel und Knoblauch hacken. | Alles in Öl anbraten, mit Brühe ablöschen und 15 Minuten weich köcheln. | Mit Sahne fein pürieren und mit Muskat und Salz würzen. | Rigatoni kochen, mit der Sauce mischen und mit gebratenem Salbei und Parmesan servieren.

Pilz-Rahm-Tagliatelle|🍄|25|4|1|Pasta
400 g Tagliatelle; 500 g Champignons; 2 Schalotten; 2 Zehen Knoblauch; 2 EL Butter; 200 ml Sahne; 100 ml Gemüsebrühe; ½ Bund Petersilie; 40 g Parmesan; Salz; Pfeffer
Pilze in Scheiben schneiden, Schalotten und Knoblauch fein hacken. | Pilze in Butter scharf anbraten, Schalotten und Knoblauch zugeben. | Mit Brühe und Sahne ablöschen und 5 Minuten einkochen lassen. | Mit den Tagliatelle mischen und mit Petersilie und Parmesan servieren.

Pasta e Fagioli|🫘|35|4|1|Pasta,Italienisch,Suppe
200 g kleine Nudeln (Ditalini); 2 Dosen weiße Bohnen; 1 Zwiebel; 1 Karotte; 1 Stange Staudensellerie; 2 Zehen Knoblauch; 400 g gehackte Tomaten (Dose); 1 l Gemüsebrühe; 3 EL Olivenöl; 1 Zweig Rosmarin; 30 g Parmesan; Salz; Pfeffer
Gemüse und Knoblauch würfeln und in Öl 5 Minuten anschwitzen. | Tomaten, Brühe, Rosmarin und abgespülte Bohnen zugeben und 10 Minuten köcheln. | Nudeln zugeben und darin gar ziehen lassen. | Abschmecken und mit Parmesan und einem Schuss Olivenöl servieren.

Orzo mit Spinat & Feta|🥬|25|3|1|Pasta,Griechisch
250 g Orzo; 1 Zwiebel; 2 Zehen Knoblauch; 600 ml Gemüsebrühe; 150 g Babyspinat; 150 g Feta; 1 Zitrone; 2 EL Olivenöl; Pfeffer
Zwiebel und Knoblauch hacken, in Öl anschwitzen und Orzo kurz mitrösten. | Brühe nach und nach zugießen und 10 Minuten unter Rühren garen. | Spinat unterheben, bis er zusammenfällt. | Mit Zitronensaft und -schale abschmecken und mit Feta bestreuen.

One-Pot-Pasta mit Tomate & Spinat|🍝|20|4|1|Pasta,One Pot
400 g Spaghetti; 250 g Kirschtomaten; 1 Zwiebel; 3 Zehen Knoblauch; 900 ml Gemüsebrühe; 150 g Babyspinat; 100 g Frischkäse; 2 EL Olivenöl; 40 g Parmesan; Salz; Pfeffer
Spaghetti, halbierte Tomaten, Zwiebelringe, Knoblauchscheiben, Öl und Brühe in einen großen Topf geben. | Aufkochen und 10–12 Minuten unter häufigem Rühren köcheln, bis die Nudeln gar sind. | Spinat und Frischkäse unterrühren. | Mit Parmesan, Salz und Pfeffer servieren.

Vegetarische Carbonara mit Zucchini|🍝|25|2|2|Pasta,Italienisch
250 g Spaghetti; 1 Zucchini; 3 Eigelb; 1 Ei; 50 g Parmesan; 1 EL Olivenöl; 1 Zehe Knoblauch; Salz; Pfeffer
Spaghetti kochen, Zucchini in feine Stifte schneiden und mit Knoblauch in Öl goldbraun braten. | Eigelbe, Ei und Parmesan verquirlen und kräftig pfeffern. | Abgegossene Nudeln mit etwas Kochwasser zur Zucchini geben und die Pfanne vom Herd nehmen. | Eimasse schnell unterrühren, bis eine cremige Sauce entsteht.

Tortellini in Spinat-Sahne|🥟|15|2|1|Pasta
400 g Tortellini (Käse); 200 g Babyspinat; 100 ml Sahne; 1 Zehe Knoblauch; 1 TL Butter; 30 g Parmesan; Muskat; Salz; Pfeffer
Tortellini nach Packungsangabe garen. | Knoblauch in Butter anschwitzen, Sahne zugeben und kurz aufkochen. | Spinat darin zusammenfallen lassen und mit Muskat, Salz und Pfeffer würzen. | Tortellini untermischen und mit Parmesan servieren.

Pasta Puttanesca|🫒|25|4|1|Pasta,Italienisch
400 g Spaghetti; 800 g gehackte Tomaten (Dose); 100 g schwarze Oliven; 2 EL Kapern; 3 Zehen Knoblauch; 1 Chilischote; 3 EL Olivenöl; ½ Bund Petersilie; Salz
Knoblauch und Chili hacken und in Öl anschwitzen. | Tomaten, halbierte Oliven und Kapern zugeben und 15 Minuten köcheln. | Spaghetti al dente kochen und mit der Sauce mischen. | Mit Petersilie bestreuen.

Pasta mit Ofentomaten & Burrata|🍅|35|4|1|Pasta,Italienisch,Ofen
400 g Penne; 600 g Kirschtomaten; 4 Zehen Knoblauch; 4 EL Olivenöl; 1 TL Zucker; 2 Burrata; 1 Bund Basilikum; Salz; Pfeffer
Ofen auf 200 °C vorheizen und die Tomaten mit Knoblauch, Öl, Zucker, Salz und Pfeffer in einer Form 25 Minuten rösten. | Penne al dente kochen. | Tomaten leicht zerdrücken und mit den Nudeln mischen. | Mit zerzupfter Burrata und Basilikum servieren.

Erdnuss-Nudeln mit Gurke|🥜|20|2|1|Asiatisch,Pasta
200 g Mie-Nudeln; 3 EL Erdnussbutter; 3 EL Sojasauce; 1 EL Reisessig; 1 EL Ahornsirup; 1 Zehe Knoblauch; 1 Stück Ingwer; 1 Gurke; 2 Frühlingszwiebeln; 2 EL Erdnüsse; 1 TL Sesamöl
Nudeln nach Packungsangabe garen und kalt abspülen. | Erdnussbutter, Sojasauce, Essig, Ahornsirup, geriebenen Knoblauch und Ingwer mit 4 EL warmem Wasser glatt rühren. | Gurke in Stifte, Frühlingszwiebeln in Ringe schneiden. | Nudeln mit Sauce und Gemüse mischen und mit gehackten Erdnüssen und Sesamöl servieren.

Cremige Cashew-Pasta mit Spinat|🥜|25|4|1|Pasta
400 g Fusilli; 100 g Cashews; 300 ml Hafermilch; 2 EL Hefeflocken; 1 Zehe Knoblauch; 1 EL Zitronensaft; 200 g Babyspinat; 150 g Kirschtomaten; Salz; Pfeffer
Cashews 10 Minuten in heißem Wasser einweichen und abgießen. | Mit Hafermilch, Hefeflocken, Knoblauch, Zitronensaft und Salz sehr fein mixen. | Fusilli kochen, den Spinat in den letzten Sekunden zugeben und abgießen. | Mit der Sauce und halbierten Tomaten mischen und pfeffern.

Pasta alla Norma|🍆|40|4|2|Pasta,Italienisch
400 g Rigatoni; 2 Auberginen; 4 EL Olivenöl; 2 Zehen Knoblauch; 800 g gehackte Tomaten (Dose); 1 Bund Basilikum; 100 g Ricotta; Salz; Pfeffer
Auberginen würfeln und in Öl portionsweise goldbraun braten, salzen. | Knoblauch kurz anbraten, Tomaten zugeben und 15 Minuten köcheln. | Auberginen und Basilikum unterheben. | Mit Rigatoni mischen und mit Ricotta-Klecksen servieren.

Rote Linsensuppe|🥣|30|4|1|Suppe,Orientalisch,Meal Prep
250 g rote Linsen; 1 Zwiebel; 2 Karotten; 2 Zehen Knoblauch; 1 EL Tomatenmark; 1 l Gemüsebrühe; 200 ml Kokosmilch; 1 TL Kreuzkümmel; 1 TL Kurkuma; 1 Zitrone; 1 EL Öl; Salz
Zwiebel, Karotten und Knoblauch würfeln und in Öl anschwitzen. | Tomatenmark und Gewürze kurz mitrösten. | Linsen und Brühe zugeben und 15 Minuten köcheln, bis die Linsen zerfallen. | Kokosmilch zugeben, pürieren und mit Zitronensaft und Salz abschmecken.

Kürbissuppe mit Ingwer|🎃|35|4|1|Suppe,Herbst,Meal Prep
1 Hokkaido-Kürbis (ca. 1 kg); 1 Zwiebel; 1 Stück Ingwer; 2 Kartoffeln; 1 l Gemüsebrühe; 200 ml Kokosmilch; 1 EL Öl; 2 EL Kürbiskerne; Muskat; Salz; Pfeffer
Kürbis entkernen und mit Schale würfeln, Zwiebel, Ingwer und Kartoffeln klein schneiden. | Alles in Öl anschwitzen, mit Brühe ablöschen und 20 Minuten köcheln. | Kokosmilch zugeben, fein pürieren und mit Muskat, Salz und Pfeffer abschmecken. | Mit gerösteten Kürbiskernen servieren.

Tomatensuppe|🍅|30|4|1|Suppe,Klassiker
800 g geschälte Tomaten (Dose); 1 Zwiebel; 2 Zehen Knoblauch; 2 EL Olivenöl; 1 EL Tomatenmark; 500 ml Gemüsebrühe; 1 TL Zucker; 100 ml Sahne; ½ Bund Basilikum; Salz; Pfeffer
Zwiebel und Knoblauch hacken, in Öl glasig dünsten und Tomatenmark kurz anrösten. | Tomaten, Brühe und Zucker zugeben und 15 Minuten köcheln. | Fein pürieren, Sahne einrühren und abschmecken. | Mit Basilikum servieren, dazu passt geröstetes Brot.

Minestrone|🥣|45|6|1|Suppe,Italienisch,Meal Prep
1 Zwiebel; 2 Karotten; 2 Stangen Staudensellerie; 1 Zucchini; 2 Kartoffeln; 150 g grüne Bohnen; 400 g gehackte Tomaten (Dose); 1 Dose weiße Bohnen; 1,5 l Gemüsebrühe; 100 g kleine Nudeln; 3 EL Olivenöl; 40 g Parmesan; Salz; Pfeffer
Gemüse würfeln und die grünen Bohnen in Stücke schneiden. | Zwiebel, Karotten und Sellerie in Öl 5 Minuten anschwitzen. | Restliches Gemüse, Tomaten und Brühe zugeben und 15 Minuten köcheln. | Nudeln und abgespülte Bohnen zugeben, 10 Minuten garen, abschmecken und mit Parmesan servieren.

Kartoffelsuppe|🥔|40|4|1|Suppe,Deutsch,Klassiker
1 kg Kartoffeln; 2 Karotten; 1 Lauch; 1 Zwiebel; ¼ Knollensellerie; 1,2 l Gemüsebrühe; 100 ml Sahne; 1 EL Butter; 1 TL Majoran; ½ Bund Petersilie; Salz; Pfeffer
Kartoffeln, Karotten, Sellerie und Zwiebel würfeln, Lauch in Ringe schneiden. | Zwiebel und Lauch in Butter anschwitzen, restliches Gemüse und Brühe zugeben. | 20 Minuten köcheln, dann etwa die Hälfte pürieren. | Sahne und Majoran zugeben, abschmecken und mit Petersilie servieren.

Brokkoli-Cremesuppe|🥦|25|4|1|Suppe
800 g Brokkoli; 1 Zwiebel; 1 Kartoffel; 800 ml Gemüsebrühe; 100 g Frischkäse; 1 EL Butter; Muskat; Salz; Pfeffer
Brokkoli in Röschen teilen, den Stiel schälen und würfeln, Zwiebel und Kartoffel würfeln. | Zwiebel in Butter anschwitzen, Gemüse und Brühe zugeben und 12 Minuten köcheln. | Frischkäse zugeben und fein pürieren. | Mit Muskat, Salz und Pfeffer abschmecken.

Erbsensuppe mit Minze|🫛|20|4|1|Suppe
750 g TK-Erbsen; 1 Zwiebel; 1 Kartoffel; 800 ml Gemüsebrühe; 100 ml Sahne; ½ Bund Minze; 1 EL Butter; ½ Zitrone; Salz; Pfeffer
Zwiebel und Kartoffel würfeln und in Butter anschwitzen. | Brühe zugeben, 10 Minuten köcheln und dann die Erbsen 5 Minuten mitgaren. | Mit Sahne und Minzblättern fein pürieren. | Mit Zitronensaft, Salz und Pfeffer abschmecken.

Karotten-Ingwer-Suppe|🥕|30|4|1|Suppe,Meal Prep
800 g Karotten; 1 Zwiebel; 1 Stück Ingwer; 1 l Gemüsebrühe; 200 ml Kokosmilch; 1 EL Öl; 1 Orange; 2 EL Kürbiskerne; Salz; Pfeffer
Karotten, Zwiebel und Ingwer klein schneiden und in Öl anschwitzen. | Mit Brühe ablöschen und 20 Minuten weich köcheln. | Kokosmilch und Orangensaft zugeben und fein pürieren. | Abschmecken und mit Kürbiskernen servieren.

Paprika-Kartoffel-Gulasch|🥘|50|4|1|Eintopf,Deutsch,Meal Prep
800 g Kartoffeln; 3 Paprika; 2 Zwiebeln; 2 Zehen Knoblauch; 2 EL Tomatenmark; 2 EL Paprikapulver; 1 TL Kümmel; 800 ml Gemüsebrühe; 2 EL Öl; 150 g Schmand; ½ Bund Petersilie; Salz; Pfeffer
Zwiebeln und Knoblauch würfeln und in Öl goldbraun braten. | Tomatenmark und Paprikapulver kurz mitrösten, Kartoffeln und Paprika in Würfeln zugeben. | Mit Brühe aufgießen, Kümmel zugeben und 30 Minuten köcheln. | Abschmecken und mit Schmand und Petersilie servieren.

Linseneintopf|🥣|50|4|1|Eintopf,Deutsch,Meal Prep
250 g Tellerlinsen; 500 g Kartoffeln; 2 Karotten; ¼ Knollensellerie; 1 Lauch; 1 Zwiebel; 1,2 l Gemüsebrühe; 2 EL Tomatenmark; 2 EL Essig; 1 EL Öl; 2 Lorbeerblätter; Salz; Pfeffer
Zwiebel in Öl anschwitzen und Tomatenmark kurz mitrösten. | Linsen, Lorbeer und Brühe zugeben und 15 Minuten köcheln. | Gemüse würfeln, zugeben und weitere 20 Minuten garen. | Mit Essig, Salz und Pfeffer abschmecken.

Chili sin Carne|🌶️|45|4|1|Eintopf,Mexikanisch,Meal Prep
150 g rote Linsen; 1 Dose Kidneybohnen; 1 Dose schwarze Bohnen; 1 Dose Mais; 800 g gehackte Tomaten (Dose); 2 Zwiebeln; 2 Zehen Knoblauch; 2 Paprika; 2 EL Tomatenmark; 2 TL Kreuzkümmel; 2 TL Paprikapulver; 1 TL Chiliflocken; 400 ml Gemüsebrühe; 2 EL Öl; Salz
Zwiebeln, Knoblauch und Paprika würfeln und in Öl anbraten. | Tomatenmark und Gewürze kurz mitrösten. | Linsen, Tomaten und Brühe zugeben und 15 Minuten köcheln. | Abgespülte Bohnen und Mais zugeben, 10 Minuten weiterköcheln und abschmecken.

Gazpacho|🍅|15|4|1|Suppe,Spanisch,Sommer
1 kg Tomaten; 1 Gurke; 1 rote Paprika; 1 Zwiebel; 1 Zehe Knoblauch; 1 Brötchen; 4 EL Olivenöl; 2 EL Essig; Salz; Pfeffer
Gemüse grob schneiden, das Brötchen einweichen und ausdrücken. | Alles mit Öl und Essig sehr fein pürieren. | Mit Salz und Pfeffer abschmecken und mindestens 1 Stunde kühlen. | Mit etwas fein gewürfelter Gurke und Paprika servieren.

Pilzrahmsuppe|🍄|30|4|1|Suppe
500 g Champignons; 1 Zwiebel; 1 Zehe Knoblauch; 2 EL Butter; 2 EL Mehl; 800 ml Gemüsebrühe; 150 ml Sahne; 1 TL Thymian; ½ Bund Petersilie; Salz; Pfeffer
Pilze in Scheiben schneiden, Zwiebel und Knoblauch würfeln. | In Butter anbraten, mit Mehl bestäuben und mit Brühe ablöschen. | Thymian zugeben, 15 Minuten köcheln und dann die Hälfte pürieren. | Sahne einrühren, abschmecken und mit Petersilie servieren.

Miso-Ramen mit Ei & Tofu|🍜|35|2|2|Suppe,Asiatisch,Japanisch
200 g Ramen-Nudeln; 2 Eier; 200 g Räuchertofu; 1 l Gemüsebrühe; 2 EL Miso-Paste; 2 EL Sojasauce; 1 Stück Ingwer; 1 Zehe Knoblauch; 1 Pak Choi; 100 g Champignons; 2 Frühlingszwiebeln; 1 TL Sesamöl
Eier 6,5 Minuten kochen, abschrecken und pellen, Tofu in Scheiben schneiden und in Sesamöl anbraten. | Brühe mit geriebenem Ingwer, Knoblauch und Sojasauce aufkochen und Pilze und Pak Choi 3 Minuten darin garen. | Topf vom Herd nehmen und Miso einrühren. | Nudeln garen, in Schalen verteilen und mit Brühe, Tofu, halbierten Eiern und Frühlingszwiebeln servieren.

Süßkartoffel-Erdnuss-Eintopf|🥜|40|4|1|Eintopf,Afrikanisch,Meal Prep
800 g Süßkartoffeln; 1 Zwiebel; 2 Zehen Knoblauch; 1 Stück Ingwer; 400 g gehackte Tomaten (Dose); 3 EL Erdnussbutter; 800 ml Gemüsebrühe; 1 Dose Kichererbsen; 150 g Babyspinat; 1 TL Kreuzkümmel; 1 EL Öl; 1 Limette; 2 EL Erdnüsse
Zwiebel, Knoblauch und Ingwer hacken, in Öl anschwitzen und Kreuzkümmel zugeben. | Süßkartoffeln würfeln und mit Tomaten und Brühe zugeben, 20 Minuten köcheln. | Erdnussbutter und Kichererbsen einrühren und den Spinat zusammenfallen lassen. | Mit Limettensaft abschmecken und mit gehackten Erdnüssen servieren.

Toskanischer Bohneneintopf|🫘|35|4|1|Eintopf,Italienisch,Meal Prep
2 Dosen weiße Bohnen; 1 Zwiebel; 2 Karotten; 2 Stangen Staudensellerie; 3 Zehen Knoblauch; 400 g gehackte Tomaten (Dose); 800 ml Gemüsebrühe; 150 g Grünkohl; 3 EL Olivenöl; 1 Zweig Rosmarin; 4 Scheiben Bauernbrot; Salz; Pfeffer
Gemüse würfeln und mit Knoblauch in Öl 8 Minuten anschwitzen. | Tomaten, Brühe, Rosmarin und Bohnen zugeben und 15 Minuten köcheln. | Grünkohl in Streifen schneiden und 5 Minuten mitgaren. | Abschmecken und mit geröstetem Brot servieren.

Blumenkohl-Curry-Suppe|🥦|30|4|1|Suppe
1 Blumenkohl; 1 Zwiebel; 1 EL Currypulver; 900 ml Gemüsebrühe; 200 ml Kokosmilch; 1 EL Öl; 2 EL Mandelblättchen; Salz
Blumenkohl in Röschen teilen und die Zwiebel würfeln. | Zwiebel in Öl anschwitzen und Curry kurz mitrösten. | Blumenkohl und Brühe zugeben und 15 Minuten köcheln. | Mit Kokosmilch pürieren, salzen und mit gerösteten Mandeln servieren.

Französische Zwiebelsuppe|🧅|60|4|2|Suppe,Französisch,Klassiker
1 kg Zwiebeln; 2 EL Butter; 1 EL Zucker; 1 EL Mehl; 200 ml Weißwein; 1 l Gemüsebrühe; 1 TL Thymian; 1 Baguette; 150 g geriebener Gruyère; Salz; Pfeffer
Zwiebeln in feine Ringe schneiden und in Butter mit Zucker 30 Minuten langsam karamellisieren. | Mit Mehl bestäuben, mit Wein ablöschen und Brühe und Thymian zugeben. | 15 Minuten köcheln und abschmecken. | Suppe in ofenfeste Schalen füllen, mit Baguettescheiben und Käse belegen und im Ofen gratinieren.

Spargelcremesuppe|🥬|35|4|1|Suppe,Frühling
500 g weißer Spargel; 1 Zwiebel; 2 EL Butter; 2 EL Mehl; 800 ml Gemüsebrühe; 150 ml Sahne; 1 Zitrone; ½ Bund Schnittlauch; Muskat; Salz
Spargel schälen, Spitzen beiseitelegen und den Rest in Stücke schneiden. | Zwiebel in Butter anschwitzen, Mehl darüberstäuben und mit Brühe ablöschen. | Spargelstücke 15 Minuten darin garen, pürieren und die Spitzen 5 Minuten mitgaren. | Mit Sahne, Zitronensaft, Muskat und Salz abschmecken und mit Schnittlauch servieren.

Thai-Kokossuppe mit Tofu|🥥|25|4|1|Suppe,Asiatisch,Thai
400 ml Kokosmilch; 600 ml Gemüsebrühe; 1 EL rote Currypaste; 1 Stück Ingwer; 200 g Champignons; 1 rote Paprika; 150 g Zuckerschoten; 200 g Tofu; 1 Limette; 2 EL Sojasauce; ½ Bund Koriander
Currypaste mit etwas Kokosmilch in einem Topf anrösten und geriebenen Ingwer zugeben. | Restliche Kokosmilch und Brühe zugießen und aufkochen. | Pilze, Paprika, Zuckerschoten und Tofu in Stücken 6 Minuten darin garen. | Mit Sojasauce und Limettensaft abschmecken und mit Koriander servieren.

Graupeneintopf|🥣|50|4|1|Eintopf,Deutsch,Meal Prep
150 g Graupen; 2 Karotten; 1 Lauch; 2 Kartoffeln; ¼ Knollensellerie; 1 Zwiebel; 1,5 l Gemüsebrühe; 1 EL Öl; 1 TL Majoran; ½ Bund Petersilie; Salz; Pfeffer
Zwiebel in Öl anschwitzen und die Graupen kurz mitrösten. | Brühe zugeben und 20 Minuten köcheln. | Gemüse würfeln, zugeben und weitere 20 Minuten garen. | Mit Majoran, Salz und Pfeffer abschmecken und mit Petersilie servieren.

Harira (marokkanische Suppe)|🥣|45|4|1|Suppe,Orientalisch
1 Dose Kichererbsen; 100 g rote Linsen; 1 Zwiebel; 2 Stangen Staudensellerie; 400 g gehackte Tomaten (Dose); 1,2 l Gemüsebrühe; 1 TL Kurkuma; 1 TL Zimt; 1 TL Kreuzkümmel; ½ Bund Koriander; ½ Bund Petersilie; 1 Zitrone; 1 EL Olivenöl; Salz
Zwiebel und Sellerie würfeln, in Öl anschwitzen und die Gewürze kurz mitrösten. | Linsen, Tomaten und Brühe zugeben und 20 Minuten köcheln. | Kichererbsen zugeben und weitere 10 Minuten garen. | Mit Kräutern, Zitronensaft und Salz abschmecken.

Gemüse-Curry mit Kichererbsen|🍛|30|4|1|Curry,Asiatisch
250 g Reis; 1 Zwiebel; 1 Stück Ingwer; 2 Zehen Knoblauch; 2 EL rote Currypaste; 400 ml Kokosmilch; 1 Dose Kichererbsen; 1 Brokkoli; 1 Paprika; 100 g Babyspinat; 1 Limette; 1 EL Öl; Salz
Reis nach Packungsangabe kochen. | Zwiebel, Ingwer und Knoblauch hacken und in Öl anschwitzen. | Currypaste 1 Minute mitrösten und mit Kokosmilch ablöschen. | Brokkoli und Paprika zugeben und 8 Minuten köcheln. | Kichererbsen und Spinat unterrühren und mit Limettensaft und Salz abschmecken.

Chana Masala|🍛|35|4|1|Curry,Indisch,Meal Prep
2 Dosen Kichererbsen; 2 Zwiebeln; 3 Zehen Knoblauch; 1 Stück Ingwer; 1 Chilischote; 400 g gehackte Tomaten (Dose); 2 TL Garam Masala; 1 TL Kreuzkümmel; 1 TL Kurkuma; 1 TL gemahlener Koriander; 2 EL Öl; ½ Bund Koriander; 250 g Basmatireis; Salz
Zwiebeln fein würfeln und in Öl goldbraun braten, dann Knoblauch, Ingwer und Chili zugeben. | Gewürze 1 Minute mitrösten, Tomaten zugeben und 10 Minuten köcheln. | Kichererbsen mit etwas Wasser zugeben und 15 Minuten sämig einkochen. | Mit Koriander und Basmatireis servieren.

Dal Tadka|🥣|35|4|1|Curry,Indisch,Meal Prep
250 g rote Linsen; 1 Zwiebel; 2 Tomaten; 3 Zehen Knoblauch; 1 Stück Ingwer; 1 TL Kurkuma; 1 TL Kreuzkümmel; 1 TL Garam Masala; 2 EL Butterschmalz; 1 Chilischote; ½ Bund Koriander; 250 g Basmatireis; Salz
Linsen mit 900 ml Wasser und Kurkuma 20 Minuten weich köcheln und salzen. | Zwiebel, Knoblauch, Ingwer und Chili hacken, Tomaten würfeln. | Kreuzkümmel in Butterschmalz anrösten, Zwiebel goldbraun braten und die restlichen Zutaten mit Garam Masala 5 Minuten mitbraten. | Über das Dal geben und mit Koriander und Reis servieren.

Palak Paneer|🥬|40|4|2|Curry,Indisch
450 g Blattspinat (TK); 250 g Paneer; 1 Zwiebel; 2 Zehen Knoblauch; 1 Stück Ingwer; 2 Tomaten; 1 TL Garam Masala; 1 TL Kreuzkümmel; ½ TL Kurkuma; 100 ml Sahne; 2 EL Butterschmalz; 250 g Basmatireis; Salz
Spinat auftauen und fein pürieren, Paneer würfeln und in 1 EL Butterschmalz goldbraun braten. | Zwiebel, Knoblauch und Ingwer im restlichen Fett anbraten, Gewürze und gewürfelte Tomaten zugeben. | Spinat und Sahne einrühren, 10 Minuten köcheln und salzen. | Paneer unterheben und mit Reis servieren.

Paneer Tikka Masala|🍛|40|4|2|Curry,Indisch
400 g Paneer; 150 g Joghurt; 2 TL Garam Masala; 1 Zwiebel; 3 Zehen Knoblauch; 1 Stück Ingwer; 400 g passierte Tomaten; 150 ml Sahne; 1 TL Paprikapulver; 1 TL Kurkuma; 2 EL Öl; ½ Bund Koriander; 4 Naan-Brote; Salz
Paneer würfeln und mit Joghurt und 1 TL Garam Masala 15 Minuten marinieren. | Paneer in einer heißen Pfanne in 1 EL Öl rundum anbraten und herausnehmen. | Zwiebel, Knoblauch und Ingwer im restlichen Öl anbraten, Gewürze zugeben und mit Tomaten und Sahne 10 Minuten köcheln. | Paneer zugeben, salzen und mit Koriander und Naan servieren.

Grünes Thai-Curry mit Tofu|🍛|30|4|1|Curry,Thai,Asiatisch
400 g Tofu; 2 EL grüne Currypaste; 400 ml Kokosmilch; 200 ml Gemüsebrühe; 1 Zucchini; 1 rote Paprika; 150 g Zuckerschoten; 1 Limette; 2 EL Sojasauce; 1 Bund Thai-Basilikum; 1 EL Öl; 250 g Jasminreis
Tofu würfeln, in Öl goldbraun braten und herausnehmen. | Currypaste kurz anrösten und mit Kokosmilch und Brühe ablöschen. | Gemüse in Stücken 6 Minuten darin garen. | Tofu zugeben, mit Sojasauce und Limettensaft abschmecken und mit Basilikum und Reis servieren.

Rotes Curry mit Süßkartoffel|🍠|35|4|1|Curry,Thai,Asiatisch,Meal Prep
2 Süßkartoffeln; 1 Brokkoli; 1 Zwiebel; 2 EL rote Currypaste; 400 ml Kokosmilch; 300 ml Gemüsebrühe; 1 Dose Kichererbsen; 1 Limette; 2 EL Sojasauce; 1 EL Öl; 250 g Jasminreis; ½ Bund Koriander
Süßkartoffeln würfeln, Brokkoli in Röschen teilen und die Zwiebel hacken. | Zwiebel in Öl anschwitzen, Currypaste anrösten und mit Kokosmilch und Brühe ablöschen. | Süßkartoffeln 10 Minuten köcheln, dann Brokkoli und Kichererbsen 6 Minuten mitgaren. | Mit Sojasauce und Limette abschmecken und mit Reis und Koriander servieren.

Massaman-Curry mit Kartoffeln|🥔|45|4|2|Curry,Thai,Asiatisch
600 g Kartoffeln; 1 Zwiebel; 2 Karotten; 3 EL Massaman-Currypaste; 400 ml Kokosmilch; 200 ml Gemüsebrühe; 2 EL Erdnussbutter; 300 g Tofu; 1 EL Sojasauce; 1 EL brauner Zucker; 1 Limette; 3 EL Erdnüsse; 1 EL Öl
Tofu würfeln und in Öl knusprig braten. | Currypaste anrösten, Kokosmilch, Brühe und Erdnussbutter einrühren. | Kartoffeln, Karotten und Zwiebel in Stücken zugeben und 25 Minuten köcheln. | Tofu, Sojasauce, Zucker und Limettensaft zugeben und mit Erdnüssen servieren.

Gebratener Reis mit Ei & Gemüse|🍚|20|2|1|Asiatisch,Resteverwertung
400 g gekochter Reis (vom Vortag); 3 Eier; 150 g TK-Erbsen; 1 Karotte; 3 Frühlingszwiebeln; 2 Zehen Knoblauch; 3 EL Sojasauce; 1 TL Sesamöl; 2 EL Öl
Karotte fein würfeln, Frühlingszwiebeln in Ringe schneiden und Knoblauch hacken. | Öl im Wok stark erhitzen und Karotte, Erbsen und Knoblauch 3 Minuten braten. | Gemüse zur Seite schieben, Eier hineinschlagen und unter Rühren stocken lassen. | Reis zugeben, scharf anbraten und mit Sojasauce, Sesamöl und Frühlingszwiebeln abschmecken.

Gebratene Nudeln mit Gemüse|🍜|25|2|1|Asiatisch
200 g Mie-Nudeln; 1 Karotte; 1 rote Paprika; 150 g Weißkohl; 100 g Sojasprossen; 2 Frühlingszwiebeln; 2 Zehen Knoblauch; 1 Stück Ingwer; 3 EL Sojasauce; 1 EL Ahornsirup; 2 EL Öl
Nudeln garen, abgießen und mit etwas Öl mischen. | Gemüse in feine Streifen schneiden. | Knoblauch und Ingwer im heißen Wok anbraten und das Gemüse 4 Minuten pfannenrühren. | Nudeln, Sprossen, Sojasauce und Ahornsirup zugeben und 2 Minuten mitbraten.

Pad Thai mit Tofu|🍜|30|2|2|Asiatisch,Thai
200 g Reisnudeln; 200 g Tofu; 2 Eier; 100 g Sojasprossen; 3 Frühlingszwiebeln; 2 Zehen Knoblauch; 3 EL Sojasauce; 1 EL brauner Zucker; 1 Limette; 2 EL Erdnüsse; 2 EL Öl; ½ Bund Koriander
Reisnudeln in heißem Wasser 8 Minuten einweichen und abgießen. | Tofu würfeln, in Öl knusprig braten und den Knoblauch zugeben. | Eier in den Wok geben und stocken lassen, dann Nudeln, Sojasauce, Zucker und Limettensaft zugeben und schwenken. | Sprossen und Frühlingszwiebeln unterheben und mit Erdnüssen und Koriander servieren.

Teriyaki-Tofu mit Reis|🍚|30|2|1|Asiatisch,Japanisch
400 g Tofu; 2 EL Speisestärke; 4 EL Sojasauce; 2 EL Ahornsirup; 1 EL Reisessig; 1 Zehe Knoblauch; 1 Stück Ingwer; 1 Brokkoli; 150 g Reis; 1 EL Sesam; 2 EL Öl
Reis kochen, Brokkoli in Röschen teilen und 4 Minuten dämpfen. | Tofu würfeln, in Stärke wenden und in Öl rundum knusprig braten. | Sojasauce, Ahornsirup, Essig, geriebenen Knoblauch und Ingwer mit 3 EL Wasser verrühren, zum Tofu geben und kurz einkochen lassen. | Mit Reis und Brokkoli anrichten und mit Sesam bestreuen.

Bibimbap|🍚|40|2|2|Asiatisch,Koreanisch,Bowl
150 g Reis; 2 Eier; 200 g Babyspinat; 2 Karotten; 150 g Champignons; 100 g Sojasprossen; 1 Zucchini; 2 EL Sojasauce; 1 EL Sesamöl; 1 EL Sriracha; 1 EL Sesam; 1 EL Öl
Reis kochen, Karotten und Zucchini in Stifte und Pilze in Scheiben schneiden. | Gemüse nacheinander kurz in Öl braten, den Spinat zusammenfallen lassen und alles mit etwas Sojasauce würzen. | Eier zu Spiegeleiern braten. | Reis in Schalen geben, Gemüse daneben anrichten und mit Ei, Sesamöl, Sriracha und Sesam servieren.

Sushi-Bowl mit Avocado & Edamame|🍣|30|2|1|Asiatisch,Japanisch,Bowl
150 g Sushireis; 2 EL Reisessig; 1 TL Zucker; 1 Avocado; ½ Gurke; 1 Karotte; 150 g Edamame; 2 EL Sojasauce; 1 EL Sesam; 1 Nori-Blatt
Sushireis waschen, kochen, mit Essig und Zucker würzen und abkühlen lassen. | Edamame 4 Minuten garen, Avocado, Gurke und Karotte in Scheiben bzw. Stifte schneiden. | Reis in Schalen verteilen und das Gemüse darauf anrichten. | Mit Sojasauce, Sesam und Nori-Streifen servieren.

Mapo Tofu mit Pilzen|🌶️|25|2|2|Asiatisch,Chinesisch,Scharf
400 g Seidentofu; 150 g Champignons; 2 Zehen Knoblauch; 1 Stück Ingwer; 1 EL Sambal Oelek; 2 EL Sojasauce; 250 ml Gemüsebrühe; 1 TL Speisestärke; 2 Frühlingszwiebeln; 1 EL Öl; 150 g Reis
Reis kochen, Pilze fein hacken und den Tofu in Würfel schneiden. | Pilze in Öl kräftig anbraten, Knoblauch, Ingwer und Sambal Oelek zugeben. | Mit Brühe und Sojasauce ablöschen, Tofu vorsichtig einlegen und 5 Minuten ziehen lassen. | Mit angerührter Stärke binden und mit Frühlingszwiebeln und Reis servieren.

Udon mit Pilzen & Pak Choi|🍜|20|2|1|Asiatisch,Japanisch
400 g Udon-Nudeln; 250 g Kräuterseitlinge; 2 Pak Choi; 2 Zehen Knoblauch; 3 EL Sojasauce; 1 EL Ahornsirup; 1 TL Sesamöl; 1 EL Öl; 1 EL Sesam
Pilze in Scheiben und Pak Choi in Streifen schneiden. | Pilze in Öl scharf anbraten, Knoblauch und Pak Choi zugeben. | Udon nach Packungsangabe lockern und in den Wok geben. | Sojasauce, Ahornsirup und Sesamöl zugeben, schwenken und mit Sesam bestreuen.

Aloo Gobi|🥔|40|4|1|Curry,Indisch
600 g Kartoffeln; 1 Blumenkohl; 1 Zwiebel; 2 Tomaten; 2 Zehen Knoblauch; 1 Stück Ingwer; 1 TL Kurkuma; 1 TL Kreuzkümmel; 1 TL Garam Masala; 3 EL Öl; ½ Bund Koriander; Salz
Kartoffeln würfeln und den Blumenkohl in kleine Röschen teilen. | Kreuzkümmel in Öl anrösten und Zwiebel, Knoblauch und Ingwer goldbraun braten. | Kartoffeln, Blumenkohl, Kurkuma und gewürfelte Tomaten zugeben, salzen und mit wenig Wasser zugedeckt 20 Minuten garen. | Garam Masala unterrühren und mit Koriander servieren.

Okonomiyaki (Kohl-Pfannkuchen)|🥞|30|2|2|Asiatisch,Japanisch
300 g Weißkohl; 2 Frühlingszwiebeln; 120 g Mehl; 3 Eier; 100 ml Gemüsebrühe; 2 EL Öl; 2 EL Mayonnaise; 2 EL Teriyaki-Sauce; 1 EL Sesam
Kohl in feine Streifen und Frühlingszwiebeln in Ringe schneiden. | Mehl, Eier und Brühe zu einem Teig verrühren und Kohl und Frühlingszwiebeln unterheben. | Zwei dicke Pfannkuchen in Öl bei mittlerer Hitze von jeder Seite 5 Minuten braten. | Mit Teriyaki-Sauce und Mayonnaise beträufeln und mit Sesam bestreuen.

Asia-Gemüsepfanne mit Erdnusssauce|🥜|25|2|1|Asiatisch,Pfanne
200 g Tofu; 1 Brokkoli; 1 rote Paprika; 1 Karotte; 150 g Zuckerschoten; 2 EL Erdnussbutter; 3 EL Sojasauce; 1 Limette; 1 TL Ahornsirup; 1 Stück Ingwer; 2 EL Öl; 150 g Basmatireis
Reis kochen, Tofu würfeln, in Öl knusprig braten und herausnehmen. | Gemüse in mundgerechte Stücke schneiden und mit geriebenem Ingwer im Wok 5 Minuten pfannenrühren. | Erdnussbutter, Sojasauce, Limettensaft, Ahornsirup und 4 EL Wasser verrühren. | Sauce und Tofu zum Gemüse geben, kurz schwenken und mit Reis servieren.

Ofen-Frühlingsrollen|🥢|45|4|2|Asiatisch,Snack,Ofen
12 Frühlingsrollenblätter; 150 g Weißkohl; 2 Karotten; 100 g Sojasprossen; 100 g Glasnudeln; 3 Frühlingszwiebeln; 3 EL Sojasauce; 1 Stück Ingwer; 3 EL Öl; 4 EL süße Chilisauce
Glasnudeln in heißem Wasser einweichen und klein schneiden, Gemüse in feine Streifen schneiden. | Gemüse mit Ingwer in 1 EL Öl 3 Minuten braten und mit Nudeln, Sprossen und Sojasauce mischen. | Füllung auf die Blätter verteilen, Seiten einschlagen und fest aufrollen. | Mit Öl bestreichen, bei 200 °C 20 Minuten goldbraun backen und mit Chilisauce servieren.

Blumenkohl-Korma mit Cashews|🍛|40|4|2|Curry,Indisch
1 Blumenkohl; 1 Dose Kichererbsen; 1 Zwiebel; 2 Zehen Knoblauch; 1 Stück Ingwer; 80 g Cashews; 200 ml Kokosmilch; 150 g Joghurt; 2 TL Garam Masala; 1 TL Kurkuma; 2 EL Öl; 250 g Basmatireis; Salz
Cashews mit 150 ml heißem Wasser fein pürieren. | Zwiebel, Knoblauch und Ingwer in Öl anschwitzen und die Gewürze kurz mitrösten. | Blumenkohlröschen, Kichererbsen, Kokosmilch und Cashewcreme zugeben und 15 Minuten köcheln. | Joghurt einrühren, salzen und mit Reis servieren.

Kung-Pao-Tofu|🌶️|25|2|2|Asiatisch,Chinesisch,Scharf
400 g Tofu; 2 EL Speisestärke; 1 rote Paprika; 1 Zucchini; 3 Frühlingszwiebeln; 50 g Erdnüsse; 2 Zehen Knoblauch; 1 Chilischote; 3 EL Sojasauce; 1 EL Reisessig; 1 EL Ahornsirup; 2 EL Öl; 150 g Reis
Reis kochen, Tofu würfeln, in Stärke wenden und in Öl knusprig braten. | Paprika und Zucchini würfeln und mit Knoblauch und Chili 4 Minuten im Wok braten. | Sojasauce, Essig, Ahornsirup und 3 EL Wasser verrühren und zugeben. | Tofu, Erdnüsse und Frühlingszwiebeln unterheben und mit Reis servieren.

Vietnamesische Sommerrollen|🥬|30|2|2|Asiatisch,Vietnamesisch,Snack,Sommer
8 Reispapierblätter; 100 g Reisnudeln; 1 Karotte; ½ Gurke; 1 Avocado; 200 g Tofu; ½ Bund Minze; ½ Bund Koriander; 3 EL Erdnussbutter; 2 EL Sojasauce; 1 Limette
Reisnudeln garen und abschrecken, Gemüse und Tofu in Streifen schneiden. | Reispapier kurz in warmes Wasser tauchen und auf ein feuchtes Brett legen. | Mit Nudeln, Gemüse, Tofu und Kräutern belegen, Seiten einschlagen und fest aufrollen. | Erdnussbutter mit Sojasauce, Limettensaft und etwas Wasser zu einem Dip verrühren.

Japanisches Gemüsecurry|🍛|40|4|1|Curry,Japanisch
500 g Kartoffeln; 2 Karotten; 2 Zwiebeln; 1 Apfel; 2 EL Currypulver; 2 EL Mehl; 2 EL Butter; 700 ml Gemüsebrühe; 2 EL Sojasauce; 1 EL Ketchup; 250 g Reis
Zwiebeln in Spalten schneiden und in Butter goldbraun braten. | Mehl und Currypulver darüberstäuben, kurz anschwitzen und mit Brühe ablöschen. | Kartoffeln und Karotten in Stücken sowie den geriebenen Apfel zugeben und 25 Minuten köcheln. | Mit Sojasauce und Ketchup abschmecken und mit Reis servieren.

Ofengemüse mit Feta|🫑|40|2|1|Ofen,Mediterran
600 g Kartoffeln; 1 Zucchini; 1 Paprika; 1 rote Zwiebel; 200 g Feta; 3 EL Olivenöl; 1 TL Rosmarin; Salz; Pfeffer
Ofen auf 200 °C Umluft vorheizen. | Kartoffeln vierteln und das restliche Gemüse grob schneiden. | Alles mit Öl, Rosmarin, Salz und Pfeffer auf einem Blech mischen. | 25 Minuten backen, dann Feta darüberbröseln und weitere 10 Minuten backen.

Kartoffelgratin|🥔|70|4|1|Ofen,Klassiker,Französisch
1 kg festkochende Kartoffeln; 200 ml Sahne; 200 ml Milch; 1 Zehe Knoblauch; 100 g geriebener Gruyère; 1 EL Butter; Muskat; Salz; Pfeffer
Ofen auf 180 °C vorheizen und eine Form mit Knoblauch ausreiben und buttern. | Kartoffeln schälen, in dünne Scheiben hobeln und dachziegelartig einschichten. | Sahne und Milch mit Muskat, Salz und Pfeffer verrühren und darübergießen. | Mit Käse bestreuen und 55 Minuten goldbraun backen.

Gefüllte Paprika mit Reis & Feta|🫑|60|4|1|Ofen,Mediterran
4 Paprika; 150 g Reis; 1 Zwiebel; 1 Zucchini; 150 g Feta; 400 g passierte Tomaten; 1 TL Oregano; 2 EL Olivenöl; 60 g geriebener Käse; Salz; Pfeffer
Reis kochen, Paprika halbieren und entkernen. | Zwiebel und Zucchini würfeln, in Öl anbraten und mit Reis, zerbröseltem Feta und Oregano mischen. | Passierte Tomaten würzen, in eine Form geben und die gefüllten Paprika daraufsetzen. | Mit Käse bestreuen und bei 180 °C 35 Minuten backen.

Gefüllte Zucchini mit Couscous|🥒|45|4|1|Ofen,Orientalisch
4 Zucchini; 150 g Couscous; 1 rote Paprika; 100 g Feta; 2 EL Pinienkerne; ½ Bund Minze; 1 Zitrone; 2 EL Olivenöl; 1 TL Kreuzkümmel; Salz; Pfeffer
Zucchini längs halbieren, aushöhlen und das Fruchtfleisch hacken. | Couscous mit 150 ml kochendem Wasser übergießen und 5 Minuten quellen lassen. | Zucchinifleisch und Paprika in Öl anbraten und mit Couscous, Feta, Pinienkernen, Minze, Zitronensaft und Gewürzen mischen. | In die Zucchini füllen und bei 200 °C 25 Minuten backen.

Linsen-Moussaka|🍆|80|6|2|Ofen,Griechisch,Meal Prep
2 Auberginen; 600 g Kartoffeln; 200 g braune Linsen; 1 Zwiebel; 2 Zehen Knoblauch; 400 g gehackte Tomaten (Dose); 1 TL Zimt; 1 TL Oregano; 4 EL Olivenöl; 40 g Butter; 40 g Mehl; 500 ml Milch; 1 Ei; 60 g Parmesan; Muskat; Salz
Linsen in Wasser 20 Minuten garen, Auberginen und Kartoffeln in Scheiben schneiden, mit Öl bepinseln und bei 200 °C 20 Minuten vorbacken. | Zwiebel und Knoblauch anbraten, Tomaten, Linsen, Zimt und Oregano zugeben und 10 Minuten köcheln. | Für die Béchamel Butter und Mehl anschwitzen, Milch einrühren, abkühlen lassen und Ei und Parmesan unterrühren. | Kartoffeln, Linsensauce, Auberginen und Béchamel schichten und bei 180 °C 40 Minuten backen.

Melanzane alla Parmigiana|🍆|70|4|2|Ofen,Italienisch
3 Auberginen; 4 EL Olivenöl; 700 g passierte Tomaten; 2 Zehen Knoblauch; 2 Kugeln Mozzarella; 60 g Parmesan; 1 Bund Basilikum; Salz; Pfeffer
Auberginen in 1 cm dicke Scheiben schneiden, mit Öl bepinseln und bei 220 °C 20 Minuten backen. | Knoblauch anbraten, passierte Tomaten zugeben, würzen und 10 Minuten köcheln. | Sauce, Auberginen, Mozzarella, Basilikum und Parmesan in eine Form schichten. | Bei 190 °C 30 Minuten backen.

Blumenkohl-Käse-Auflauf|🥦|50|4|1|Ofen,Klassiker
1 Blumenkohl; 30 g Butter; 30 g Mehl; 400 ml Milch; 150 g geriebener Gouda; 1 TL Senf; Muskat; Salz; Pfeffer
Blumenkohl in Röschen teilen und 6 Minuten in Salzwasser vorgaren. | Butter schmelzen, Mehl anschwitzen, Milch einrühren und 5 Minuten köcheln. | Zwei Drittel des Käses und den Senf einrühren und mit Muskat würzen. | Blumenkohl in eine Form geben, mit Sauce übergießen, restlichen Käse darüberstreuen und bei 200 °C 25 Minuten backen.

Brokkoli-Nudelauflauf|🥦|45|4|1|Ofen,Pasta,Klassiker
300 g Penne; 1 Brokkoli; 200 ml Sahne; 200 ml Milch; 2 Eier; 150 g geriebener Käse; Muskat; Salz; Pfeffer
Penne 2 Minuten kürzer als angegeben kochen und die Brokkoliröschen die letzten 3 Minuten mitgaren. | Sahne, Milch und Eier verquirlen und mit Muskat, Salz und Pfeffer würzen. | Nudeln und Brokkoli in eine Form geben und mit der Eiermilch übergießen. | Mit Käse bestreuen und bei 200 °C 25 Minuten backen.

Kartoffel-Spinat-Auflauf|🥔|60|4|1|Ofen
800 g Kartoffeln; 450 g Blattspinat (TK); 1 Zwiebel; 2 Zehen Knoblauch; 200 ml Sahne; 2 Eier; 150 g Feta; 100 g geriebener Käse; Muskat; Salz; Pfeffer
Kartoffeln in Scheiben schneiden und 8 Minuten vorkochen, Spinat auftauen und ausdrücken. | Zwiebel und Knoblauch anbraten, Spinat zugeben und würzen. | Kartoffeln und Spinat in eine Form schichten und Feta darüberbröseln. | Sahne mit Eiern verquirlen, darübergießen, mit Käse bestreuen und bei 190 °C 30 Minuten backen.

Ofen-Süßkartoffeln mit Kichererbsen|🍠|45|2|1|Ofen,Orientalisch,Bowl
2 Süßkartoffeln; 1 Dose Kichererbsen; 1 rote Zwiebel; 2 EL Olivenöl; 1 TL Paprikapulver; 1 TL Kreuzkümmel; 200 g Griechischer Joghurt; 1 Zehe Knoblauch; ½ Zitrone; ½ Bund Petersilie; Salz
Ofen auf 200 °C vorheizen, Süßkartoffeln längs halbieren, Kichererbsen abtropfen lassen und die Zwiebel in Spalten schneiden. | Alles mit Öl und Gewürzen auf einem Blech mischen und 30 Minuten backen. | Joghurt mit geriebenem Knoblauch, Zitronensaft und Salz verrühren. | Süßkartoffeln mit Kichererbsen, Joghurt und Petersilie servieren.

Gemüse-Quiche|🥧|75|6|2|Ofen,Französisch,Backen
200 g Mehl; 100 g kalte Butter; 4 Eier; 200 ml Sahne; 1 Lauch; 1 rote Paprika; 150 g Champignons; 150 g geriebener Käse; Muskat; Salz; Pfeffer
Mehl, Butter, 1 Ei, 1 Prise Salz und 2 EL kaltes Wasser zu einem Teig kneten und 30 Minuten kühlen. | Teig in eine gefettete Quicheform drücken, den Rand hochziehen und bei 200 °C 10 Minuten blind backen. | Gemüse klein schneiden, 5 Minuten anbraten und auf dem Boden verteilen. | Restliche Eier mit Sahne, Käse und Gewürzen verquirlen, darübergießen und bei 180 °C 35 Minuten backen.

Zwiebelkuchen|🧅|90|8|2|Ofen,Deutsch,Backen,Herbst
300 g Mehl; ½ Würfel Hefe; 150 ml lauwarme Milch; 3 EL Öl; 1 kg Zwiebeln; 2 EL Butter; 200 g Schmand; 3 Eier; 1 TL Kümmel; Salz; Pfeffer
Mehl, Hefe, Milch, Öl und 1 TL Salz zu einem glatten Teig kneten und 45 Minuten gehen lassen. | Zwiebeln in Ringe schneiden, in Butter 15 Minuten glasig dünsten und abkühlen lassen. | Schmand mit Eiern, Kümmel, Salz und Pfeffer verrühren und unter die Zwiebeln mischen. | Teig auf einem Blech ausrollen, die Zwiebelmasse darauf verteilen und bei 200 °C 35 Minuten backen.

Flammkuchen mit Zwiebeln & Champignons|🍕|30|2|1|Ofen,Französisch
1 Pck Flammkuchenteig; 200 g Crème fraîche; 1 rote Zwiebel; 150 g Champignons; 50 g geriebener Käse; ½ Bund Schnittlauch; Salz; Pfeffer
Ofen auf 220 °C vorheizen. | Teig ausrollen und mit gewürzter Crème fraîche bestreichen. | Mit Zwiebelringen, Pilzscheiben und Käse belegen. | 12–15 Minuten knusprig backen und mit Schnittlauch bestreuen.

Pizza Margherita|🍕|90|4|2|Ofen,Italienisch,Backen
500 g Mehl; 1 Pck Trockenhefe; 300 ml lauwarmes Wasser; 2 EL Olivenöl; 400 g passierte Tomaten; 1 TL Oregano; 2 Kugeln Mozzarella; 1 Bund Basilikum; Salz
Mehl, Hefe, Wasser, Öl und 1 TL Salz 10 Minuten zu einem glatten Teig kneten und 1 Stunde gehen lassen. | Ofen mit Blech auf höchster Stufe vorheizen. | Teig in 4 Portionen dünn ausrollen, mit gewürzten Tomaten bestreichen und mit Mozzarella belegen. | Nacheinander 8–10 Minuten backen und mit Basilikum belegen.

Pizza mit Grillgemüse|🍕|90|4|2|Ofen,Italienisch,Backen
500 g Mehl; 1 Pck Trockenhefe; 300 ml lauwarmes Wasser; 3 EL Olivenöl; 400 g passierte Tomaten; 1 Zucchini; 1 rote Paprika; 1 rote Zwiebel; 150 g Champignons; 50 g schwarze Oliven; 250 g Mozzarella; 1 TL Oregano; Salz
Mehl, Hefe, Wasser, 2 EL Öl und 1 TL Salz zu einem glatten Teig kneten und 1 Stunde gehen lassen. | Gemüse in dünne Scheiben schneiden. | Teig ausrollen, mit gewürzten Tomaten bestreichen und mit Gemüse, Oliven und Mozzarella belegen. | Bei höchster Stufe 10–12 Minuten backen.

Gefüllte Champignons|🍄|30|2|1|Ofen,Snack
12 große Champignons; 150 g Frischkäse; 1 Zehe Knoblauch; ½ Bund Petersilie; 30 g Parmesan; 1 EL Olivenöl; Pfeffer
Ofen auf 200 °C vorheizen, die Stiele aus den Pilzen drehen und fein hacken. | Stiele mit Frischkäse, Knoblauch, Petersilie und Pfeffer mischen. | Masse in die Pilzköpfe füllen, mit Parmesan bestreuen und mit Öl beträufeln. | 15–20 Minuten backen.

Bohnen-Enchiladas|🌯|50|4|2|Ofen,Mexikanisch
8 Tortilla-Wraps; 2 Dosen schwarze Bohnen; 1 Dose Mais; 1 Zwiebel; 1 rote Paprika; 2 TL Kreuzkümmel; 1 TL Paprikapulver; 500 g passierte Tomaten; 1 Chilischote; 150 g geriebener Cheddar; 150 g saure Sahne; 1 EL Öl; ½ Bund Koriander
Zwiebel und Paprika würfeln, in Öl anbraten, Bohnen, Mais und Gewürze zugeben und leicht zerdrücken. | Passierte Tomaten mit gehackter Chili würzen und ein Drittel davon in eine Form geben. | Füllung auf die Tortillas verteilen, aufrollen, in die Form legen und mit restlicher Sauce und Käse bedecken. | Bei 200 °C 20 Minuten backen und mit saurer Sahne und Koriander servieren.

Ofenkartoffeln mit Kräuterquark|🥔|60|4|1|Ofen,Deutsch,Klassiker
1 kg große Kartoffeln; 500 g Magerquark; 100 ml Milch; 1 Bund Schnittlauch; ½ Bund Petersilie; 1 Zehe Knoblauch; ½ Gurke; 1 EL Olivenöl; Salz; Pfeffer
Ofen auf 200 °C vorheizen, Kartoffeln waschen, mehrfach einstechen, mit Öl einreiben und 50 Minuten backen. | Quark mit Milch glatt rühren. | Kräuter hacken, Gurke fein würfeln und mit Knoblauch unter den Quark mischen und würzen. | Kartoffeln kreuzweise einschneiden, leicht aufdrücken und mit dem Quark füllen.

Gemüsestrudel mit Feta|🥐|60|4|2|Ofen,Backen
1 Pck Blätterteig; 1 Zucchini; 1 rote Paprika; 1 Lauch; 150 g Feta; 100 g Frischkäse; 1 Ei; 1 TL Thymian; 1 EL Olivenöl; Salz; Pfeffer
Gemüse würfeln, in Öl 5 Minuten anbraten und abkühlen lassen. | Mit Feta, Frischkäse und Thymian mischen und würzen. | Füllung auf den Blätterteig geben, einrollen und mit verquirltem Ei bestreichen. | Bei 200 °C 30 Minuten goldbraun backen.

Spinat-Feta-Börek|🥬|60|4|2|Ofen,Türkisch,Backen
1 Pck Yufka-Teig; 450 g Blattspinat (TK); 200 g Feta; 1 Zwiebel; 2 Eier; 150 g Joghurt; 100 ml Milch; 4 EL Olivenöl; 1 EL Sesam; Pfeffer
Spinat auftauen, ausdrücken und mit angebratener Zwiebel und zerbröseltem Feta mischen. | Eier, Joghurt, Milch und Öl verquirlen. | Yufkablätter in eine Form schichten, jede Lage mit Eiermilch bestreichen und die Füllung in der Mitte einschichten. | Mit Eiermilch und Sesam abschließen und bei 180 °C 35 Minuten backen.

Gemüsepfanne mit Halloumi|🧀|25|2|1|Pfanne
250 g Halloumi; 1 Zucchini; 1 rote Paprika; 200 g Kirschtomaten; 1 rote Zwiebel; 2 EL Olivenöl; 1 TL Oregano; ½ Zitrone; Pfeffer
Halloumi in Scheiben schneiden, in 1 EL Öl von beiden Seiten goldbraun braten und herausnehmen. | Gemüse in Stücke schneiden und im restlichen Öl 6–8 Minuten braten. | Mit Oregano, Zitronensaft und Pfeffer würzen. | Halloumi auf dem Gemüse anrichten.

Halloumi-Burger|🍔|25|4|1|Burger,Grillen
4 Burgerbrötchen; 250 g Halloumi; 1 Tomate; 1 rote Zwiebel; 100 g Blattsalat; 1 Avocado; 4 EL Mayonnaise; 1 EL Öl
Halloumi in 4 Scheiben schneiden und in Öl goldbraun braten. | Brötchen aufschneiden und kurz anrösten. | Tomate, Zwiebel und Avocado in Scheiben schneiden. | Brötchen mit Mayonnaise bestreichen und mit Salat, Halloumi, Tomate, Avocado und Zwiebel belegen.

Bohnen-Burger|🍔|40|4|2|Burger
1 Dose Kidneybohnen; 80 g Haferflocken; 1 Zwiebel; 1 Zehe Knoblauch; 1 Ei; 1 TL Kreuzkümmel; 1 TL Paprikapulver; 2 EL Öl; 4 Burgerbrötchen; 1 Tomate; 100 g Blattsalat; 4 EL Ketchup; 4 Scheiben Cheddar; Salz
Bohnen abspülen und mit einer Gabel grob zerdrücken. | Mit Haferflocken, fein gehackter Zwiebel, Knoblauch, Ei und Gewürzen zu einer formbaren Masse mischen und 10 Minuten ziehen lassen. | Vier Patties formen, in Öl von jeder Seite 4 Minuten braten und zum Schluss mit Käse belegen. | Brötchen mit Ketchup, Salat, Patty und Tomate belegen.

Falafel mit Hummus & Salat|🧆|40|4|2|Orientalisch
2 Dosen Kichererbsen; 1 Zwiebel; 2 Zehen Knoblauch; 1 Bund Petersilie; 2 TL Kreuzkümmel; 1 TL gemahlener Koriander; 3 EL Mehl; 1 TL Backpulver; 6 EL Öl; 4 Pita; 200 g Hummus; 2 Tomaten; ½ Gurke; Salz
Kichererbsen gut abtropfen lassen und trocken tupfen. | Mit Zwiebel, Knoblauch, Petersilie, Gewürzen, Mehl, Backpulver und Salz im Mixer grob pürieren. | Kleine Bällchen formen und im heißen Öl rundum 4–5 Minuten goldbraun braten. | Mit Pita, Hummus, Tomaten und Gurke servieren.

Kartoffelpuffer mit Apfelmus|🥔|40|4|1|Deutsch,Klassiker
1 kg Kartoffeln; 1 Zwiebel; 2 Eier; 3 EL Mehl; 6 EL Öl; 400 g Apfelmus; Muskat; Salz
Kartoffeln und Zwiebel schälen, fein reiben und in einem Tuch kräftig ausdrücken. | Mit Eiern, Mehl, Salz und Muskat vermengen. | Öl in einer Pfanne erhitzen und flache Puffer von jeder Seite 3–4 Minuten knusprig braten. | Auf Küchenpapier abtropfen lassen und mit Apfelmus servieren.

Bratkartoffeln mit Spiegelei|🍳|35|2|1|Deutsch,Klassiker
800 g festkochende Kartoffeln (vom Vortag); 1 Zwiebel; 4 Eier; 3 EL Öl; 1 EL Butter; ½ Bund Schnittlauch; 2 Gewürzgurken; Salz; Pfeffer
Gekochte Kartoffeln in Scheiben schneiden. | In Öl bei mittlerer Hitze 15 Minuten goldbraun braten und dabei nur selten wenden. | Zwiebelwürfel die letzten 5 Minuten mitbraten, salzen und pfeffern. | Eier in Butter zu Spiegeleiern braten und mit Schnittlauch und Gurken servieren.

Spinatknödel mit brauner Butter|🥬|50|4|2|Österreichisch,Klassiker
250 g Knödelbrot; 250 ml Milch; 300 g Blattspinat (TK); 1 Zwiebel; 2 Eier; 80 g Parmesan; 2 EL Mehl; 80 g Butter; Muskat; Salz
Knödelbrot mit warmer Milch übergießen und 15 Minuten ziehen lassen. | Spinat auftauen, ausdrücken und hacken, Zwiebel würfeln und in 1 EL Butter anschwitzen. | Alles mit Eiern, Mehl, der Hälfte des Parmesans, Muskat und Salz verkneten und 8 Knödel formen. | In siedendem Salzwasser 15 Minuten ziehen lassen und mit gebräunter Butter und restlichem Parmesan servieren.

Semmelknödel mit Pilzrahm|🍄|50|4|2|Deutsch,Klassiker
300 g Knödelbrot; 300 ml Milch; 1 Zwiebel; 2 Eier; ½ Bund Petersilie; 500 g Champignons; 1 Schalotte; 200 ml Sahne; 100 ml Gemüsebrühe; 2 EL Butter; Muskat; Salz; Pfeffer
Knödelbrot mit warmer Milch übergießen, gehackte Zwiebel in Butter anschwitzen und mit Eiern, Petersilie, Muskat und Salz zugeben. | Gut verkneten, 8 Knödel formen und in siedendem Salzwasser 20 Minuten ziehen lassen. | Pilze in Scheiben schneiden und mit der Schalotte in Butter scharf anbraten. | Mit Brühe und Sahne ablöschen, einkochen lassen, würzen und mit den Knödeln servieren.

Spargel mit Kartoffeln & Hollandaise|🥬|45|4|2|Deutsch,Klassiker,Frühling
2 kg weißer Spargel; 1 kg neue Kartoffeln; 3 Eigelb; 150 g Butter; 1 EL Zitronensaft; 1 EL Weißwein; 1 TL Zucker; ½ Bund Petersilie; Salz
Spargel schälen, holzige Enden abschneiden und die Kartoffeln in Salzwasser garen. | Spargel in Salzwasser mit Zucker 12–15 Minuten garen. | Für die Hollandaise Eigelbe mit Wein über einem heißen Wasserbad schaumig schlagen, geschmolzene Butter langsam einrühren und mit Zitrone und Salz würzen. | Spargel mit Kartoffeln, Sauce und Petersilie servieren.

Gemüse-Risotto mit Erbsen|🍚|40|4|2|Italienisch,Risotto
300 g Risottoreis; 1 Zwiebel; 1 Zucchini; 200 g TK-Erbsen; 100 ml Weißwein; 1 l Gemüsebrühe; 2 EL Butter; 1 EL Olivenöl; 60 g Parmesan; ½ Zitrone; Salz; Pfeffer
Zwiebel fein würfeln, in Öl glasig dünsten und den Reis glasig werden lassen. | Mit Wein ablöschen und nach und nach heiße Brühe unter Rühren zugießen, etwa 18 Minuten garen. | Nach 10 Minuten gewürfelte Zucchini und Erbsen zugeben. | Butter, Parmesan und Zitronenschale unterrühren und abschmecken.

Pilzrisotto|🍄|40|4|2|Italienisch,Risotto,Herbst
300 g Risottoreis; 400 g Champignons; 1 Zwiebel; 2 Zehen Knoblauch; 100 ml Weißwein; 1 l Gemüsebrühe; 3 EL Butter; 60 g Parmesan; ½ Bund Petersilie; 1 TL Thymian; Salz; Pfeffer
Pilze in Scheiben schneiden, in 1 EL Butter scharf anbraten und herausnehmen. | Zwiebel und Knoblauch in 1 EL Butter anschwitzen, Reis zugeben und mit Wein ablöschen. | Heiße Brühe nach und nach unter Rühren zugießen, 18 Minuten garen und Thymian zugeben. | Pilze, restliche Butter und Parmesan unterrühren und mit Petersilie servieren.

Kürbisrisotto|🎃|45|4|2|Italienisch,Risotto,Herbst
300 g Risottoreis; 500 g Hokkaido-Kürbis; 1 Zwiebel; 100 ml Weißwein; 1 l Gemüsebrühe; 2 EL Butter; 1 EL Olivenöl; 60 g Parmesan; 2 EL Kürbiskerne; ½ Bund Salbei; Muskat; Salz
Kürbis klein würfeln, Zwiebel hacken und beides in Öl anschwitzen. | Reis zugeben, mit Wein ablöschen und nach und nach Brühe zugießen, 18 Minuten unter Rühren garen. | Butter, Parmesan und Muskat unterrühren. | Mit gerösteten Kürbiskernen und gebratenem Salbei servieren.

Vegetarische Paella|🥘|50|4|2|Spanisch,One Pot
300 g Paellareis; 1 Zwiebel; 3 Zehen Knoblauch; 2 Paprika; 150 g grüne Bohnen; 200 g TK-Erbsen; 400 g gehackte Tomaten (Dose); 1 Dose Kichererbsen; 1 TL geräuchertes Paprikapulver; 1 Prise Safran; 900 ml Gemüsebrühe; 3 EL Olivenöl; 1 Zitrone; ½ Bund Petersilie; Salz
Zwiebel, Knoblauch und Paprika würfeln und in Öl in einer großen Pfanne anbraten. | Reis, Paprikapulver und Safran kurz mitrösten und Tomaten und Brühe zugeben. | Bohnen und Kichererbsen darauf verteilen und ohne Rühren 20 Minuten köcheln. | Erbsen die letzten 5 Minuten mitgaren und mit Zitronenspalten und Petersilie servieren.

Gemüse-Couscous-Pfanne|🌾|25|4|1|Orientalisch,Pfanne
250 g Couscous; 1 Zucchini; 1 rote Paprika; 1 Zwiebel; 1 Dose Kichererbsen; 1 TL Ras el Hanout; 300 ml Gemüsebrühe; 3 EL Olivenöl; 100 g Feta; ½ Bund Minze; 1 Zitrone
Couscous mit heißer Brühe übergießen und 5 Minuten quellen lassen. | Gemüse würfeln und mit der Zwiebel in Öl 6 Minuten braten. | Kichererbsen und Ras el Hanout zugeben und kurz mitbraten. | Couscous unterheben, mit Zitronensaft abschmecken und mit Feta und Minze servieren.

Ratatouille|🍆|50|4|1|Französisch,Meal Prep
1 Aubergine; 2 Zucchini; 2 Paprika; 1 Zwiebel; 3 Zehen Knoblauch; 400 g gehackte Tomaten (Dose); 4 EL Olivenöl; 1 TL Kräuter der Provence; ½ Bund Basilikum; 1 Baguette; Salz; Pfeffer
Gemüse in mundgerechte Würfel schneiden. | Aubergine in Öl anbraten, dann Zwiebel, Knoblauch, Paprika und Zucchini zugeben. | Tomaten und Kräuter zugeben und zugedeckt 25 Minuten schmoren. | Abschmecken, mit Basilikum bestreuen und mit Baguette servieren.

Gemüse-Fajitas|🌮|30|4|1|Mexikanisch
8 Tortilla-Wraps; 3 Paprika; 2 Zwiebeln; 1 Zucchini; 1 Dose schwarze Bohnen; 2 TL Paprikapulver; 1 TL Kreuzkümmel; 2 EL Öl; 1 Avocado; 1 Limette; 150 g saure Sahne; 100 g geriebener Cheddar
Paprika, Zwiebeln und Zucchini in Streifen schneiden. | In Öl bei hoher Hitze 6–8 Minuten braten und Bohnen und Gewürze zugeben. | Avocado mit Limettensaft und Salz zerdrücken. | Tortillas erwärmen und mit Gemüse, Avocado, saurer Sahne und Käse füllen.

Burrito Bowl|🥙|35|4|1|Mexikanisch,Bowl,Meal Prep
200 g Reis; 1 Dose schwarze Bohnen; 1 Dose Mais; 2 Tomaten; 1 rote Zwiebel; 1 Avocado; 1 Limette; 1 TL Kreuzkümmel; 1 TL Paprikapulver; 150 g Griechischer Joghurt; 100 g geriebener Cheddar; ½ Bund Koriander; Salz
Reis kochen und mit Limettensaft und Koriander mischen. | Bohnen mit den Gewürzen und etwas Wasser 5 Minuten erwärmen. | Tomaten, Zwiebel und Avocado würfeln. | Alles mit Mais, Käse und Joghurt in Schalen anrichten.

Bohnen-Tacos mit Mango-Salsa|🌮|30|4|1|Mexikanisch
8 kleine Tortillas; 2 Dosen schwarze Bohnen; 1 Zwiebel; 1 TL Kreuzkümmel; 1 TL Paprikapulver; 1 Mango; 1 Limette; 1 Chilischote; 150 g Rotkohl; 100 g Feta; ½ Bund Koriander; 1 EL Öl
Zwiebel würfeln, in Öl anbraten, Bohnen und Gewürze zugeben und leicht zerdrücken. | Mango, Chili und Koriander fein würfeln und mit Limettensaft mischen. | Rotkohl in feine Streifen schneiden. | Tortillas erwärmen und mit Bohnen, Rotkohl, Salsa und zerbröseltem Feta füllen.

Quesadillas mit Bohnen & Mais|🧀|20|2|1|Mexikanisch,Snack
4 Tortilla-Wraps; 200 g Kidneybohnen (Dose); 150 g Mais (Dose); 1 rote Paprika; 150 g geriebener Cheddar; 1 TL Kreuzkümmel; 100 g saure Sahne
Paprika fein würfeln und mit Bohnen, Mais und Kreuzkümmel mischen. | Füllung und Käse auf zwei Tortillas verteilen und mit den restlichen Tortillas belegen. | In einer Pfanne ohne Fett von jeder Seite 3 Minuten goldbraun braten. | In Stücke schneiden und mit saurer Sahne servieren.

Zucchini-Puffer mit Tzatziki|🥒|30|4|1|Griechisch
3 Zucchini; 2 Eier; 80 g Mehl; 100 g Feta; 1 Zehe Knoblauch; 4 EL Öl; 300 g Griechischer Joghurt; ½ Gurke; ½ Bund Dill; Salz; Pfeffer
Zucchini grob raspeln, salzen, 10 Minuten ziehen lassen und kräftig ausdrücken. | Mit Eiern, Mehl, zerbröseltem Feta und Pfeffer vermengen. | Kleine Puffer in Öl von jeder Seite 3 Minuten braten. | Für das Tzatziki Joghurt mit geriebener Gurke, Knoblauch, Dill und Salz verrühren.

Gemüse-Bratlinge mit Kräuterquark|🥕|40|4|2|Deutsch,Meal Prep
2 Karotten; 1 Zucchini; 100 g Haferflocken; 50 g geriebener Käse; 2 Eier; 1 Zwiebel; 1 TL Senf; 4 EL Öl; 250 g Magerquark; ½ Bund Schnittlauch; Salz; Pfeffer
Karotten und Zucchini fein raspeln und die Zwiebel fein würfeln. | Mit Haferflocken, Käse, Eiern, Senf, Salz und Pfeffer mischen und 10 Minuten quellen lassen. | 8 Bratlinge formen und in Öl von jeder Seite 4 Minuten braten. | Quark mit Schnittlauch und Salz verrühren und dazu servieren.

Tofu-Geschnetzeltes mit Reis|🌱|30|4|1|Pfanne
400 g Räuchertofu; 300 g Champignons; 1 Zwiebel; 200 ml Sahne; 150 ml Gemüsebrühe; 1 TL Paprikapulver; 2 EL Öl; ½ Bund Petersilie; 250 g Reis; Salz; Pfeffer
Reis kochen, Tofu in Streifen und Pilze in Scheiben schneiden, Zwiebel würfeln. | Tofu in Öl knusprig braten und herausnehmen. | Pilze und Zwiebel anbraten, mit Paprikapulver bestäuben und mit Brühe und Sahne ablöschen. | Tofu zurückgeben, kurz einkochen lassen, abschmecken und mit Reis und Petersilie servieren.

Pilz-Stroganoff|🍄|30|4|1|Pfanne
600 g Champignons; 2 Zwiebeln; 2 Zehen Knoblauch; 2 EL Butter; 1 EL Paprikapulver; 1 EL Senf; 300 ml Gemüsebrühe; 150 g saure Sahne; 2 Gewürzgurken; ½ Bund Petersilie; 400 g Bandnudeln; Salz; Pfeffer
Pilze vierteln und Zwiebeln in Streifen schneiden. | Pilze in Butter scharf anbraten und Zwiebeln und Knoblauch zugeben. | Paprikapulver, Senf und Brühe einrühren und 8 Minuten köcheln. | Saure Sahne und Gurkenwürfel unterrühren, abschmecken und mit Nudeln und Petersilie servieren.

Rahmspinat mit Kartoffeln & Spiegelei|🥬|30|4|1|Deutsch,Klassiker
1 kg Kartoffeln; 750 g Blattspinat (TK); 1 Zwiebel; 1 Zehe Knoblauch; 150 ml Sahne; 1 EL Butter; 4 Eier; Muskat; Salz; Pfeffer
Kartoffeln in Salzwasser garen. | Zwiebel und Knoblauch in Butter anschwitzen, Spinat zugeben und auftauen lassen. | Sahne zugeben, mit Muskat, Salz und Pfeffer würzen und einkochen lassen. | Eier zu Spiegeleiern braten und mit Kartoffeln und Spinat servieren.

Polenta mit Pilzragout|🌽|35|4|1|Italienisch
250 g Polenta; 1 l Gemüsebrühe; 50 g Parmesan; 2 EL Butter; 500 g Champignons; 2 Schalotten; 2 Zehen Knoblauch; 100 ml Weißwein; 100 ml Sahne; 1 TL Thymian; ½ Bund Petersilie; Salz; Pfeffer
Brühe aufkochen, Polenta einrühren, bei kleiner Hitze 10 Minuten quellen lassen und Parmesan und 1 EL Butter unterrühren. | Pilze in Scheiben schneiden, in Butter scharf anbraten und Schalotten und Knoblauch zugeben. | Mit Wein ablöschen, Sahne und Thymian zugeben und 5 Minuten einkochen. | Polenta mit Pilzragout und Petersilie servieren.

Kaiserschmarrn|🥞|30|2|2|Süß,Österreichisch,Klassiker
4 Eier; 125 g Mehl; 250 ml Milch; 2 EL Zucker; 1 Pck Vanillezucker; 30 g Rosinen; 2 EL Butter; 2 EL Puderzucker; 200 g Apfelmus
Eier trennen und die Eigelbe mit Mehl, Milch, Vanillezucker und einer Prise Salz glatt rühren. | Eiweiß mit Zucker steif schlagen und unterheben. | Teig in Butter in einer großen Pfanne stocken lassen, Rosinen darüberstreuen, wenden und mit zwei Gabeln zerreißen. | Kurz weiterbraten, mit Puderzucker bestäuben und mit Apfelmus servieren.

Gnocchi-Gemüse-Pfanne mit Pesto|🥔|20|2|1|Pfanne,Italienisch
500 g Gnocchi; 1 Zucchini; 200 g Kirschtomaten; 100 g Babyspinat; 2 Zehen Knoblauch; 2 EL Olivenöl; 2 EL Pesto; 30 g Parmesan
Gnocchi in 1 EL Öl goldbraun braten und herausnehmen. | Zucchini würfeln und mit Knoblauch im restlichen Öl 4 Minuten braten, dann die Tomaten zugeben. | Gnocchi und Spinat zugeben und schwenken, bis der Spinat zusammenfällt. | Pesto unterrühren und mit Parmesan servieren.

Griechischer Salat|🥗|15|2|1|Salat,Griechisch
1 Gurke; 4 Tomaten; 1 rote Zwiebel; 1 grüne Paprika; 200 g Feta; 50 g Oliven; 3 EL Olivenöl; 1 EL Essig; 1 TL Oregano; Salz
Gurke, Tomaten und Paprika in mundgerechte Stücke schneiden. | Zwiebel in feine Ringe schneiden. | Alles mit Oliven mischen und den Feta in Würfeln darauflegen. | Mit Öl, Essig, Oregano und Salz anmachen.

Caprese mit Ciabatta|🍅|10|2|1|Salat,Italienisch
4 Tomaten; 2 Kugeln Mozzarella; 1 Bund Basilikum; 3 EL Olivenöl; 1 EL Balsamico; ½ Ciabatta; Salz; Pfeffer
Tomaten und Mozzarella in Scheiben schneiden. | Abwechselnd auf einem Teller anrichten und Basilikumblätter dazwischenlegen. | Mit Öl und Balsamico beträufeln, salzen und pfeffern. | Mit Ciabatta servieren.

Couscous-Salat|🌾|20|4|1|Salat,Orientalisch,Meal Prep
200 g Couscous; 1 Gurke; 250 g Kirschtomaten; 1 rote Paprika; 3 Frühlingszwiebeln; 1 Bund Petersilie; ½ Bund Minze; 1 Zitrone; 4 EL Olivenöl; 100 g Feta; Salz; Pfeffer
Couscous mit 250 ml kochendem Salzwasser übergießen, 5 Minuten quellen lassen und auflockern. | Gemüse klein würfeln und die Kräuter hacken. | Zitronensaft, Öl, Salz und Pfeffer verrühren. | Alles mischen und mit Feta servieren.

Quinoa-Bowl mit Ofengemüse|🥗|40|2|1|Bowl,Meal Prep
120 g Quinoa; 1 Süßkartoffel; 200 g Kichererbsen (Dose); 150 g Brokkoli; 1 Avocado; 2 EL Olivenöl; 2 EL Tahin; 1 Zitrone; 1 TL Paprikapulver; 50 g Rucola; Salz
Ofen auf 200 °C vorheizen, Süßkartoffel würfeln, Brokkoli in Röschen teilen und mit Kichererbsen, Öl und Paprikapulver auf ein Blech geben. | 25 Minuten backen und währenddessen die Quinoa nach Packungsangabe kochen. | Tahin mit Zitronensaft, Salz und etwas Wasser zu einem Dressing verrühren. | Quinoa, Ofengemüse, Rucola und Avocado in Schalen anrichten und mit Dressing beträufeln.

Linsensalat mit Feta|🫘|35|4|1|Salat,Meal Prep
250 g Belugalinsen; 1 rote Paprika; ½ Gurke; 1 rote Zwiebel; 150 g Feta; 1 Bund Petersilie; 4 EL Olivenöl; 3 EL Balsamico; 1 TL Senf; Salz; Pfeffer
Linsen in Wasser 20 Minuten bissfest garen, abgießen und abkühlen lassen. | Gemüse würfeln und die Petersilie hacken. | Öl, Balsamico, Senf, Salz und Pfeffer verrühren. | Alles mischen und mit Feta bestreuen.

Schwäbischer Kartoffelsalat|🥔|40|4|1|Salat,Deutsch,Klassiker
1 kg festkochende Kartoffeln; 1 Zwiebel; 250 ml Gemüsebrühe; 4 EL Essig; 1 TL Senf; 4 EL Öl; ½ Bund Schnittlauch; ½ Gurke; Salz; Pfeffer
Kartoffeln kochen, pellen und noch warm in Scheiben schneiden. | Zwiebel fein würfeln, in der Brühe kurz aufkochen und Essig, Senf, Salz und Pfeffer zugeben. | Heiße Marinade über die Kartoffeln gießen, Öl zugeben und vorsichtig mischen. | 30 Minuten ziehen lassen und Gurkenscheiben und Schnittlauch unterheben.

Nudelsalat mit Pesto & Tomaten|🍝|25|4|1|Salat,Italienisch,Meal Prep,Grillen
400 g Fusilli; 250 g Kirschtomaten; 125 g Mozzarella (Mini); 4 EL Pesto; 50 g Rucola; 2 EL Pinienkerne; 2 EL Olivenöl; Salz; Pfeffer
Fusilli kochen, abschrecken und abtropfen lassen. | Pinienkerne ohne Fett rösten und die Tomaten halbieren. | Nudeln mit Pesto, Öl, Tomaten und Mozzarella mischen und würzen. | Kurz vor dem Servieren Rucola und Pinienkerne unterheben.

Taboulé|🌿|25|4|1|Salat,Orientalisch
150 g Bulgur; 2 Bund Petersilie; ½ Bund Minze; 4 Tomaten; ½ Gurke; 3 Frühlingszwiebeln; 2 Zitronen; 5 EL Olivenöl; Salz; Pfeffer
Bulgur mit 200 ml kochendem Wasser übergießen und 15 Minuten quellen lassen. | Kräuter fein hacken und Tomaten, Gurke und Frühlingszwiebeln klein würfeln. | Zitronensaft mit Öl, Salz und Pfeffer verrühren. | Alles mischen und 15 Minuten durchziehen lassen.

Buddha Bowl mit Tofu|🥗|35|2|1|Bowl
150 g Reis; 200 g Tofu; 1 Karotte; 1 Avocado; 100 g Rotkohl; 100 g Edamame; 2 EL Sojasauce; 2 EL Erdnussbutter; 1 Limette; 1 EL Ahornsirup; 1 EL Öl; 1 EL Sesam
Reis kochen, Tofu würfeln, in Öl knusprig braten und mit 1 EL Sojasauce ablöschen. | Karotte raspeln, Rotkohl fein hobeln, Avocado in Scheiben schneiden und Edamame garen. | Erdnussbutter, restliche Sojasauce, Limettensaft, Ahornsirup und etwas Wasser verrühren. | Alles in Schalen anrichten, mit Dressing beträufeln und mit Sesam bestreuen.

Rote-Bete-Salat mit Ziegenkäse|🟣|20|2|1|Salat
400 g Rote Bete (vorgegart); 100 g Feldsalat; 150 g Ziegenkäse; 40 g Walnüsse; 1 Apfel; 3 EL Olivenöl; 1 EL Balsamico; 1 TL Honig; Salz; Pfeffer
Rote Bete und Apfel in Spalten schneiden. | Walnüsse ohne Fett anrösten, Ziegenkäse in Scheiben schneiden und kurz im Ofen gratinieren. | Öl, Balsamico, Honig, Salz und Pfeffer verrühren. | Feldsalat mit Rote Bete, Apfel, Walnüssen und Ziegenkäse anrichten und mit Dressing beträufeln.

Caesar Salad mit Ei & Croûtons|🥬|25|2|1|Salat,Klassiker
1 Römersalat; 2 Scheiben Toastbrot; 2 EL Olivenöl; 40 g Parmesan; 2 Eier; 3 EL Mayonnaise; 1 EL Zitronensaft; 1 TL Senf; 1 Zehe Knoblauch; Pfeffer
Eier 8 Minuten hart kochen, pellen und vierteln. | Toast würfeln und in Öl knusprig rösten. | Mayonnaise mit Zitronensaft, Senf, geriebenem Knoblauch, der Hälfte des Parmesans und Pfeffer verrühren. | Salat zerpflücken, mit Dressing mischen und mit Croûtons, Eiern und restlichem Parmesan servieren.

Halloumi-Salat mit Granatapfel|🧀|20|2|1|Salat,Orientalisch
250 g Halloumi; 100 g Rucola; ½ Granatapfel; ½ Gurke; 2 EL Olivenöl; 1 EL Zitronensaft; 1 TL Honig; 2 EL Pinienkerne; ½ Bund Minze; Salz
Halloumi in Scheiben schneiden und in 1 EL Öl goldbraun braten. | Granatapfelkerne auslösen und die Gurke in Scheiben schneiden. | Restliches Öl mit Zitronensaft, Honig und Salz verrühren. | Rucola mit Gurke, Granatapfel, Minze und Pinienkernen anrichten, Halloumi darauflegen und beträufeln.

Panzanella|🍅|20|4|1|Salat,Italienisch,Sommer
300 g altbackenes Ciabatta; 600 g Tomaten; 1 Gurke; 1 rote Zwiebel; 1 Bund Basilikum; 5 EL Olivenöl; 2 EL Balsamico; 1 Zehe Knoblauch; Salz; Pfeffer
Brot in Würfel schneiden und in 2 EL Öl goldbraun rösten. | Tomaten und Gurke würfeln und die Zwiebel in feine Ringe schneiden. | Restliches Öl mit Balsamico, Knoblauch, Salz und Pfeffer verrühren. | Alles mit Basilikum mischen und 10 Minuten ziehen lassen.

Asiatischer Gurkensalat mit Tofu|🥒|20|2|1|Salat,Asiatisch
2 Gurken; 200 g Räuchertofu; 2 Zehen Knoblauch; 3 EL Sojasauce; 1 EL Reisessig; 1 TL Sesamöl; 1 TL Ahornsirup; 1 Prise Chiliflocken; 1 EL Sesam; 2 Frühlingszwiebeln
Gurken mit einem Messerrücken andrücken und in Stücke brechen. | Tofu würfeln und in einer Pfanne ohne Fett knusprig braten. | Knoblauch reiben und mit Sojasauce, Essig, Sesamöl, Ahornsirup und Chili verrühren. | Gurken, Tofu und Frühlingszwiebeln mit dem Dressing mischen und mit Sesam bestreuen.

Kichererbsensalat mit Paprika|🫘|15|2|1|Salat,Meal Prep
1 Dose Kichererbsen; 1 rote Paprika; ½ Gurke; 1 rote Zwiebel; 100 g Feta; ½ Bund Petersilie; 3 EL Olivenöl; 1 Zitrone; 1 TL Kreuzkümmel; Salz; Pfeffer
Kichererbsen abspülen und abtropfen lassen. | Paprika, Gurke und Zwiebel würfeln und die Petersilie hacken. | Öl, Zitronensaft, Kreuzkümmel, Salz und Pfeffer verrühren. | Alles mischen und mit Feta bestreuen.

Mango-Avocado-Salat|🥭|15|2|1|Salat,Sommer
1 Mango; 1 Avocado; 150 g Kirschtomaten; ½ rote Zwiebel; 1 Limette; ½ Bund Koriander; 2 EL Olivenöl; 100 g Feldsalat; 2 EL Cashews; Salz
Mango und Avocado schälen und würfeln, Tomaten halbieren und die Zwiebel fein würfeln. | Limettensaft mit Öl und Salz verrühren. | Alles mit Feldsalat und Koriander mischen. | Mit gerösteten Cashews servieren.

Poke Bowl mit mariniertem Tofu|🍣|35|2|1|Bowl,Asiatisch
150 g Sushireis; 200 g Tofu; 3 EL Sojasauce; 1 TL Sesamöl; 1 Avocado; 1 Mango; ½ Gurke; 100 g Edamame; 1 Karotte; 1 EL Sesam; 1 EL Reisessig; 1 TL Zucker
Sushireis kochen und mit Essig und Zucker würzen. | Tofu würfeln und in Sojasauce und Sesamöl 15 Minuten marinieren. | Avocado, Mango und Gurke würfeln, Karotte raspeln und Edamame garen. | Reis in Schalen geben, mit Tofu und Gemüse anrichten und mit Sesam bestreuen.

Glasnudelsalat|🥢|20|2|1|Salat,Asiatisch,Thai
150 g Glasnudeln; 1 Karotte; 1 rote Paprika; ½ Gurke; 2 Frühlingszwiebeln; ½ Bund Koriander; ½ Bund Minze; 3 EL Sojasauce; 2 EL Limettensaft; 1 TL Ahornsirup; 1 Chilischote; 2 EL Erdnüsse
Glasnudeln mit kochendem Wasser übergießen, 5 Minuten ziehen lassen, abgießen und kürzen. | Gemüse in feine Streifen schneiden und die Kräuter hacken. | Sojasauce, Limettensaft, Ahornsirup und gehackte Chili verrühren. | Alles mischen und mit gehackten Erdnüssen bestreuen.

Waldorfsalat|🍎|20|4|1|Salat,Klassiker
400 g Knollensellerie; 2 Äpfel; 80 g Walnüsse; 150 g Joghurt; 2 EL Mayonnaise; 1 EL Zitronensaft; 100 g Weintrauben; Salz; Pfeffer
Sellerie schälen und fein raspeln, Äpfel in Stifte schneiden und mit Zitronensaft mischen. | Joghurt mit Mayonnaise, Salz und Pfeffer verrühren. | Walnüsse grob hacken und die Trauben halbieren. | Alles vermengen und 15 Minuten ziehen lassen.

Bohnensalat mit roten Zwiebeln|🫛|25|4|1|Salat,Grillen
500 g grüne Bohnen; 1 Dose weiße Bohnen; 1 rote Zwiebel; 3 EL Olivenöl; 2 EL Essig; 1 TL Senf; ½ Bund Petersilie; Salz; Pfeffer
Grüne Bohnen putzen, 8 Minuten in Salzwasser garen und kalt abschrecken. | Weiße Bohnen abspülen und die Zwiebel in feine Ringe schneiden. | Öl, Essig, Senf, Salz und Pfeffer verrühren. | Alles mit Petersilie mischen und 20 Minuten ziehen lassen.

Spinatsalat mit Erdbeeren & Feta|🍓|15|2|1|Salat,Sommer
150 g Babyspinat; 250 g Erdbeeren; 100 g Feta; 30 g Mandeln; 3 EL Olivenöl; 1 EL Balsamico; 1 TL Honig; Salz; Pfeffer
Erdbeeren vierteln und die Mandeln grob hacken und rösten. | Öl, Balsamico, Honig, Salz und Pfeffer verrühren. | Spinat mit den Erdbeeren mischen. | Mit Feta und Mandeln bestreuen und mit dem Dressing beträufeln.

Hummus mit Gemüsesticks|🫘|15|4|1|Snack,Dip,Orientalisch
1 Dose Kichererbsen; 3 EL Tahin; 1 Zitrone; 1 Zehe Knoblauch; 3 EL Olivenöl; 1 TL Kreuzkümmel; 2 Karotten; 1 Gurke; 1 rote Paprika; 2 Pita; Salz
Kichererbsen abgießen und etwas Flüssigkeit auffangen. | Mit Tahin, Zitronensaft, Knoblauch, 2 EL Öl, Kreuzkümmel, Salz und 3 EL Flüssigkeit sehr cremig pürieren. | Gemüse in Sticks schneiden und Pita in Dreiecke schneiden und rösten. | Hummus mit restlichem Öl beträufeln und mit Gemüse und Pita servieren.

Guacamole mit Nachos|🥑|15|4|1|Snack,Dip,Mexikanisch
3 Avocados; 1 Limette; 1 Tomate; ½ rote Zwiebel; 1 Chilischote; ½ Bund Koriander; 200 g Tortilla-Chips; Salz
Avocados halbieren, entkernen und das Fruchtfleisch zerdrücken. | Tomate, Zwiebel, Chili und Koriander fein hacken und untermischen. | Mit Limettensaft und Salz abschmecken. | Mit Tortilla-Chips servieren.

Bruschetta|🍅|15|4|1|Snack,Italienisch
1 Baguette; 5 Tomaten; 2 Zehen Knoblauch; ½ Bund Basilikum; 4 EL Olivenöl; 1 TL Balsamico; Salz; Pfeffer
Tomaten entkernen, fein würfeln und mit gehacktem Basilikum, 2 EL Öl, Balsamico, Salz und Pfeffer mischen. | Baguette schräg in Scheiben schneiden, mit restlichem Öl beträufeln und im Ofen rösten. | Brotscheiben mit einer halbierten Knoblauchzehe einreiben. | Tomaten darauf verteilen und sofort servieren.

Ofen-Pommes mit Kräuterdip|🍟|45|2|1|Snack,Ofen,Beilage
800 g Kartoffeln; 2 EL Öl; 1 TL Paprikapulver; 150 g Griechischer Joghurt; ½ Bund Schnittlauch; 1 Zehe Knoblauch; Salz
Ofen auf 220 °C vorheizen, Kartoffeln in Stifte schneiden, 10 Minuten wässern und trocken tupfen. | Mit Öl, Paprikapulver und Salz mischen und auf einem Blech verteilen. | 30–35 Minuten backen und nach der Hälfte wenden. | Joghurt mit Schnittlauch, Knoblauch und Salz verrühren und dazu servieren.

Grilled Cheese Sandwich|🥪|15|2|1|Snack
4 Scheiben Sauerteigbrot; 150 g geriebener Cheddar; 2 EL Butter; 1 Tomate; 1 TL Senf
Brot außen mit Butter und innen dünn mit Senf bestreichen. | Zwei Scheiben mit Käse und Tomatenscheiben belegen und mit den übrigen Scheiben bedecken. | In einer Pfanne bei mittlerer Hitze von jeder Seite 3–4 Minuten goldbraun braten. | Halbieren und warm servieren.

Falafel-Wrap|🌯|20|2|1|Snack,Orientalisch
2 Tortilla-Wraps; 8 Falafel (fertig); 4 EL Hummus; 1 Tomate; 50 g Rotkohl; 50 g Blattsalat; 100 g Joghurt; ½ Zitrone; Salz
Falafel im Ofen oder in der Pfanne erwärmen. | Wraps mit Hummus bestreichen. | Mit Salat, Tomatenscheiben, Rotkohl und zerdrückten Falafel belegen. | Joghurt mit Zitronensaft und Salz verrühren, darüberträufeln und einrollen.

Ofen-Feta mit Tomaten|🧀|25|2|1|Snack,Ofen
200 g Feta; 300 g Kirschtomaten; 1 Zehe Knoblauch; 2 EL Olivenöl; 1 TL Oregano; ½ Baguette; ½ Bund Basilikum
Ofen auf 200 °C vorheizen. | Feta in eine kleine Form legen und Tomaten und Knoblauch drumherum verteilen. | Mit Öl beträufeln, mit Oregano bestreuen und 20 Minuten backen. | Mit Basilikum bestreuen und mit Baguette servieren.

Energy Balls|🟤|15|12|1|Snack,Süß,Meal Prep
150 g Datteln; 100 g Haferflocken; 50 g Mandeln; 2 EL Kakao; 2 EL Erdnussbutter; 2 EL Kokosraspel
Datteln entsteinen und mit Haferflocken, Mandeln, Kakao und Erdnussbutter im Mixer zu einer klebrigen Masse verarbeiten. | Mit feuchten Händen 12 Kugeln formen. | In Kokosraspeln wälzen. | Im Kühlschrank fest werden lassen.

Milchreis mit Kirschen|🍚|40|4|1|Süß,Dessert,Klassiker
250 g Milchreis; 1 l Milch; 3 EL Zucker; 1 Pck Vanillezucker; 1 Prise Salz; 1 TL Zimt; 350 g Kirschen (Glas)
Milch mit Zucker, Vanillezucker und Salz aufkochen. | Milchreis einrühren und bei kleinster Hitze 30 Minuten quellen lassen, dabei öfter umrühren. | Kirschen erwärmen. | Milchreis mit Zimt und Kirschen servieren.

Schokoladenmousse|🍫|20|4|2|Dessert,Süß
150 g Zartbitterschokolade; 3 Eier; 200 ml Sahne; 2 EL Zucker; 1 Prise Salz
Schokolade über einem Wasserbad schmelzen und leicht abkühlen lassen. | Eier trennen und die Eigelbe unter die Schokolade rühren. | Eiweiß mit Zucker und Salz steif schlagen und die Sahne ebenfalls steif schlagen. | Beides vorsichtig unter die Schokolade heben und mindestens 3 Stunden kühlen.

Apfel-Crumble|🍎|45|4|1|Dessert,Süß,Ofen,Herbst
4 Äpfel; 1 TL Zimt; 100 g Zucker; 100 g Mehl; 60 g Haferflocken; 80 g Butter; 150 g Griechischer Joghurt
Ofen auf 180 °C vorheizen, Äpfel würfeln und mit Zimt und 2 EL Zucker in eine Form geben. | Mehl, Haferflocken, kalte Butter und restlichen Zucker zu Streuseln verkneten. | Streusel über die Äpfel geben. | 30 Minuten goldbraun backen und mit Joghurt servieren.

Waffeln|🧇|30|4|1|Süß,Backen
125 g Butter; 75 g Zucker; 1 Pck Vanillezucker; 3 Eier; 250 g Mehl; 1 TL Backpulver; 250 ml Milch; 1 EL Öl; 200 g Beeren
Weiche Butter mit Zucker und Vanillezucker schaumig rühren und die Eier einzeln unterrühren. | Mehl mit Backpulver mischen und abwechselnd mit der Milch unterrühren. | Waffeleisen fetten und den Teig portionsweise goldbraun backen. | Mit Beeren servieren.

Erdbeer-Tiramisu ohne Ei|🍓|25|6|1|Dessert,Süß
200 g Löffelbiskuits; 500 g Erdbeeren; 250 g Mascarpone; 250 g Magerquark; 3 EL Zucker; 1 Pck Vanillezucker; 100 ml Orangensaft
Erdbeeren in Scheiben schneiden. | Mascarpone mit Quark, Zucker und Vanillezucker glatt rühren. | Löffelbiskuits in eine Form legen, mit Orangensaft beträufeln und die Hälfte der Creme und Erdbeeren darauf verteilen. | Vorgang wiederholen und mindestens 2 Stunden kühlen.

Schoko-Bananen-Eis|🍌|10|2|1|Dessert,Süß
3 gefrorene Bananen; 2 EL Kakao; 3 EL Hafermilch; 1 EL Erdnussbutter
Gefrorene Bananen in Stücken in einen leistungsstarken Mixer geben. | Mit Kakao, Hafermilch und Erdnussbutter cremig mixen. | Sofort servieren oder 30 Minuten anfrieren lassen.

Gemüse-Bulgur-Pfanne mit Joghurt|🌾|30|4|1|Orientalisch,Pfanne
200 g Bulgur; 1 Aubergine; 1 Zucchini; 1 Zwiebel; 2 Zehen Knoblauch; 2 EL Tomatenmark; 500 ml Gemüsebrühe; 3 EL Olivenöl; 1 TL Paprikapulver; 1 TL Kreuzkümmel; 200 g Griechischer Joghurt; ½ Bund Minze; Salz
Aubergine und Zucchini würfeln und mit Zwiebel und Knoblauch in Öl 8 Minuten braten. | Tomatenmark und Gewürze kurz mitrösten und den Bulgur unterrühren. | Brühe zugießen und zugedeckt 15 Minuten quellen lassen. | Mit Joghurt und Minze servieren.

Spinat-Linsen-Curry|🍛|35|4|1|Curry,Indisch,Meal Prep
200 g rote Linsen; 400 ml Kokosmilch; 400 g gehackte Tomaten (Dose); 300 g Babyspinat; 1 Zwiebel; 2 Zehen Knoblauch; 1 Stück Ingwer; 2 TL Currypulver; 1 TL Kurkuma; 1 EL Öl; 250 g Basmatireis; Salz
Zwiebel, Knoblauch und Ingwer hacken, in Öl anschwitzen und die Gewürze kurz mitrösten. | Linsen, Kokosmilch, Tomaten und 300 ml Wasser zugeben und 20 Minuten köcheln. | Spinat unterrühren, bis er zusammenfällt, und salzen. | Mit Basmatireis servieren.

Tomaten-Mozzarella-Quiche ohne Boden|🍅|45|4|1|Ofen
6 Eier; 200 ml Milch; 50 g Mehl; 250 g Kirschtomaten; 2 Kugeln Mozzarella; 50 g Parmesan; ½ Bund Basilikum; Salz; Pfeffer
Ofen auf 180 °C vorheizen und eine Form fetten. | Eier, Milch, Mehl, Parmesan, Salz und Pfeffer verquirlen. | Tomaten halbieren, Mozzarella zerzupfen und mit Basilikum in der Form verteilen. | Eiermasse darübergießen und 30 Minuten goldbraun backen.

Erbsen-Minz-Risotto|🫛|35|4|2|Italienisch,Risotto,Frühling
300 g Risottoreis; 1 Zwiebel; 100 ml Weißwein; 1 l Gemüsebrühe; 300 g TK-Erbsen; ½ Bund Minze; 2 EL Butter; 60 g Parmesan; 1 Zitrone; Salz; Pfeffer
Zwiebel fein hacken, in 1 EL Butter anschwitzen und den Reis glasig werden lassen. | Mit Wein ablöschen und nach und nach heiße Brühe unter Rühren zugießen. | Nach 12 Minuten die Erbsen zugeben und weitere 6 Minuten garen. | Restliche Butter, Parmesan, Zitronenschale und gehackte Minze unterrühren.

Linsen-Bällchen in Tomatensauce|🍝|50|4|2|Italienisch,Meal Prep
200 g rote Linsen; 60 g Paniermehl; 1 Ei; 50 g Parmesan; 1 Zwiebel; 2 Zehen Knoblauch; 1 TL Oregano; 700 g passierte Tomaten; 3 EL Olivenöl; 400 g Spaghetti; ½ Bund Basilikum; Salz; Pfeffer
Linsen in Wasser 12 Minuten weich kochen, gut abtropfen und abkühlen lassen. | Mit Paniermehl, Ei, Parmesan, der Hälfte der gehackten Zwiebel, Oregano, Salz und Pfeffer mischen und kleine Bällchen formen. | Bällchen in 2 EL Öl rundum braten, restliche Zwiebel und Knoblauch im übrigen Öl anschwitzen, Tomaten zugeben und Bällchen 10 Minuten darin ziehen lassen. | Mit Spaghetti und Basilikum servieren.

Kartoffel-Lauch-Gratin|🥔|60|4|1|Ofen
800 g Kartoffeln; 2 Stangen Lauch; 200 ml Sahne; 200 ml Gemüsebrühe; 150 g geriebener Käse; 1 EL Butter; Muskat; Salz; Pfeffer
Ofen auf 190 °C vorheizen und eine Form buttern. | Kartoffeln in dünne Scheiben und Lauch in Ringe schneiden und abwechselnd einschichten. | Sahne mit Brühe, Muskat, Salz und Pfeffer verrühren und darübergießen. | Mit Käse bestreuen und 45 Minuten backen.

Gemüse-Wok mit Erdnüssen & Reis|🥦|25|2|1|Asiatisch,Pfanne
150 g Jasminreis; 1 Brokkoli; 1 Karotte; 1 rote Paprika; 150 g Champignons; 2 Zehen Knoblauch; 1 Stück Ingwer; 3 EL Sojasauce; 2 EL süße Chilisauce; 2 EL Öl; 3 EL Erdnüsse
Reis kochen und das Gemüse in mundgerechte Stücke schneiden. | Knoblauch und Ingwer im heißen Wok in Öl anbraten. | Gemüse 5–6 Minuten bissfest pfannenrühren. | Mit Sojasauce und Chilisauce ablöschen und mit Erdnüssen und Reis servieren.

Tortilla-Pizza|🍕|15|2|1|Snack,Ofen
2 Tortilla-Wraps; 150 g passierte Tomaten; 1 TL Oregano; 125 g Mozzarella; 1 rote Paprika; 50 g Mais (Dose); 30 g Rucola
Ofen auf 220 °C vorheizen. | Tortillas mit gewürzten Tomaten bestreichen und mit Paprika, Mais und Mozzarella belegen. | Auf einem Blech 8–10 Minuten knusprig backen. | Mit Rucola belegen und servieren.

Chili-Käse-Ofenkartoffel|🥔|60|2|1|Ofen,Mexikanisch
2 große Süßkartoffeln; 200 g Kidneybohnen (Dose); 100 g Mais (Dose); 100 g passierte Tomaten; 1 TL Kreuzkümmel; 1 TL Paprikapulver; 80 g geriebener Cheddar; 100 g saure Sahne; 2 Frühlingszwiebeln
Süßkartoffeln einstechen und bei 200 °C 45 Minuten backen. | Bohnen, Mais, Tomaten und Gewürze 5 Minuten köcheln lassen. | Kartoffeln aufschneiden, mit dem Bohnen-Chili füllen und mit Käse bestreuen. | Kurz überbacken und mit saurer Sahne und Frühlingszwiebeln servieren.
`;

const QUICK_TAGS_DROP = new Set(['Schnell', 'High Protein', 'Low Carb', 'Vegan', 'Vegetarisch']);
const _slug = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function builtinRecipes(parseIng) {
  return RECIPE_TEXT.trim().split(/\n\s*\n/).map(block => {
    const [head, ings, steps] = block.trim().split('\n');
    const [name, emoji, time, servings, level, tags] = head.split('|');
    return {
      id: 'b-' + _slug(name), builtin: true, name, emoji,
      time: +time, servings: +servings, level: +level,
      tags: (tags || '').split(',').map(s => s.trim()).filter(t => t && !QUICK_TAGS_DROP.has(t)),
      ingredients: ings.split(';').map(s => parseIng(s)).filter(Boolean),
      steps: (steps || '').split(' | ').map(s => s.trim()).filter(Boolean),
      notes: '',
    };
  });
}
