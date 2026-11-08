'use strict';
/* Lebensmittel-Datenbank: Einkaufskatalog + Nährwerte.
   Zeile: Name | Emoji | Kategorie | kcal,Eiweiß,Kohlenhydrate,Fett,Ballaststoffe (je 100 g) | Optionen | Suchbegriffe
   Optionen (Gramm): p=Stück, d=Dose, el=Esslöffel, tl=Teelöffel, b=Bund, sc=Scheibe, pck=Packung,
   bec=Becher, gla=Glas, kn=Knolle, st=Stange, ko=Kopf · a = tierisch (nicht vegan) · x = kein Lebensmittel */
const FOOD_DATA = `
Kartoffeln|🥔|obst|72,2,15.4,0.1,2.1|p=150|kartoffel
Süßkartoffeln|🍠|obst|86,1.6,20,0.1,3|p=300|süßkartoffel
Zwiebeln|🧅|obst|40,1.1,9,0.1,1.7|p=100|zwiebel
Rote Zwiebeln|🧅|obst|40,1.1,9,0.1,1.7|p=100|rote zwiebel
Frühlingszwiebeln|🧅|obst|32,1.8,7,0.2,2.6|p=15,b=100|frühlingszwiebel,lauchzwiebel
Schalotten|🧅|obst|72,2.5,17,0.1,3|p=25|schalotte
Knoblauch|🧄|obst|149,6.4,33,0.5,2.1|p=4,kn=50|knoblauch
Ingwer|🫚|obst|80,1.8,18,0.8,2|p=20|ingwer
Karotten|🥕|obst|41,0.9,10,0.2,2.8|p=80|karotte,möhre
Tomaten|🍅|obst|18,0.9,3.9,0.2,1.2|p=100|tomate
Kirschtomaten|🍅|obst|18,0.9,3.9,0.2,1.2|p=15|kirschtomate,cherrytomate,cocktailtomate,datteltomate
Gurke|🥒|obst|15,0.7,3.6,0.1,0.5|p=400|gurke,salatgurke
Paprika|🫑|obst|31,1,6,0.3,2.1|p=160|paprika
Zucchini|🥒|obst|17,1.2,3.1,0.3,1|p=250|zucchini
Aubergine|🍆|obst|25,1,6,0.2,3|p=300|aubergine
Brokkoli|🥦|obst|34,2.8,7,0.4,2.6|p=400|brokkoli
Blumenkohl|🥦|obst|25,1.9,5,0.3,2|p=700,ko=700|blumenkohl
Spinat|🥬|obst|23,2.9,3.6,0.4,2.2||spinat,blattspinat,babyspinat
Champignons|🍄|obst|22,3.1,3.3,0.3,1|p=25|champignon,pilze,kräuterseitling,egerling,shiitake,austernpilz,pfifferling,steinpilz
Lauch|🥬|obst|61,1.5,14,0.3,1.8|p=250,st=250|lauch,porree
Staudensellerie|🥬|obst|16,0.7,3,0.2,1.6|p=50,st=50|staudensellerie,stangensellerie
Knollensellerie|🥔|obst|42,1.5,9,0.3,1.8|p=600,kn=600|knollensellerie,sellerie
Kürbis|🎃|obst|40,1.7,8,0.2,2.5|p=1000|kürbis,hokkaido,butternut
Rote Bete|🟣|obst|43,1.6,10,0.2,2.8|p=150|rote bete,rote beete
Fenchel|🌿|obst|31,1.2,7,0.2,3.1|p=250,kn=250|fenchel
Grüne Bohnen|🫛|obst|31,1.8,7,0.2,2.7||grüne bohnen,brechbohnen,prinzessbohnen,zuckerschote
Spargel|🥬|obst|20,2.2,3.9,0.1,2.1|p=20|spargel
Avocado|🥑|obst|160,2,8.5,14.7,6.7|p=150|avocado
Zitronen|🍋|obst|29,1.1,9,0.3,2.8|p=100|zitrone
Limetten|🍋|obst|30,0.7,10,0.2,2.8|p=60|limette
Äpfel|🍎|obst|52,0.3,14,0.2,2.4|p=180|apfel,äpfel
Bananen|🍌|obst|89,1.1,23,0.3,2.6|p=120|banane
Beeren|🫐|obst|45,0.8,10,0.4,4||beeren,heidelbeere,himbeere,blaubeere,tk-beeren
Erdbeeren|🍓|obst|32,0.7,7.7,0.3,2|sch=250|erdbeere
Kirschen|🍒|obst|63,1,16,0.3,2|gla=350|kirsche
Orangen|🍊|obst|47,0.9,12,0.1,2.4|p=150|orange,mandarine,clementine
Mango|🥭|obst|60,0.8,15,0.4,1.6|p=220|mango
Birnen|🍐|obst|57,0.4,15,0.1,3.1|p=180|birne
Weintrauben|🍇|obst|69,0.7,18,0.2,0.9||weintraube,traube
Ananas|🍍|obst|50,0.5,13,0.1,1.4|p=900|ananas
Kiwi|🥝|obst|61,1.1,15,0.5,3|p=75|kiwi
Granatapfel|🔴|obst|83,1.7,19,1.2,4|p=170|granatapfel
Getrocknete Aprikosen|🍑|vorrat|240,3.4,55,0.5,7||getrocknete aprikose,trockenaprikose
Datteln|🟤|vorrat|280,2.5,65,0.4,8|p=8|dattel
Rucola|🥬|obst|25,2.6,3.7,0.7,1.6||rucola,rauke
Blattsalat|🥬|obst|14,1.2,2.2,0.2,1.4|p=300,ko=300|salat,kopfsalat,blattsalat,feldsalat,eisbergsalat,lollo,endivie
Römersalat|🥬|obst|17,1.2,3.3,0.3,2.1|p=300,ko=300|römersalat,romanasalat
Rotkohl|🥬|obst|29,1.4,7,0.2,2.5|p=1000,ko=1000|rotkohl,blaukraut
Weißkohl|🥬|obst|25,1.3,6,0.1,2.5|p=1000,ko=1000|weißkohl,spitzkohl,kohl,chinakohl,wirsing
Pak Choi|🥬|obst|13,1.5,2.2,0.2,1|p=250|pak choi
Radieschen|🔴|obst|16,0.7,3.4,0.1,1.6|p=10,b=150|radieschen
Sprossen|🌱|obst|30,3,4,0.2,1.8||sprossen
Chilischoten|🌶️|obst|40,1.9,9,0.4,1.5|p=10|chilischote,chili,peperoni,jalapeño
Petersilie|🌿|obst|36,3,6,0.8,3.3|b=40|petersilie
Basilikum|🌿|obst|23,3.2,2.7,0.6,1.6|b=30|basilikum
Koriander|🌿|obst|23,2.1,3.7,0.5,2.8|b=30|koriander
Schnittlauch|🌿|obst|30,3.3,4.4,0.7,2.5|b=30|schnittlauch
Dill|🌿|obst|43,3.5,7,1.1,2.1|b=30|dill
Minze|🌿|obst|70,3.8,15,0.9,8|b=20|minze
Salbei|🌿|obst|60,3,10,1.5,5|b=20,tl=1|salbei
Brot|🍞|brot|220,7,41,1.5,7|sc=45,p=750|brot,vollkornbrot,bauernbrot,sauerteigbrot,weißbrot
Toastbrot|🍞|brot|260,8,48,3.5,3|sc=25,p=25|toast
Brötchen|🥖|brot|260,9,50,2,3|p=60|brötchen,semmel,knödelbrot
Baguette|🥖|brot|260,9,52,1.5,2.5|p=250|baguette,ciabatta
Tortilla-Wraps|🌯|brot|300,8,50,7,3|p=60|tortilla,wrap
Pita|🫓|brot|275,9,55,1.2,2.2|p=80|pita,fladenbrot
Naan|🫓|brot|290,9,50,6,2|p=90,a|naan,naan-brot,naanbrot
Burgerbrötchen|🍔|brot|270,9,48,4.5,2.5|p=70|burgerbrötchen,burger-bun,buns
Croissants|🥐|brot|406,8,45,21,2.5|p=60,a|croissant
Knäckebrot|🍘|brot|360,10,66,2,15|sc=10|knäckebrot
Milch|🥛|kuehl|64,3.4,4.8,3.5,0|a|milch,vollmilch
Butter|🧈|kuehl|741,0.7,0.6,83,0|el=12,a|butter
Sahne|🥛|kuehl|300,2.4,3.3,30,0|bec=200,a|sahne,schlagsahne,kochsahne
Saure Sahne|🥛|kuehl|120,2.8,3.8,10,0|bec=200,a|saure sahne
Schmand|🥛|kuehl|240,2.5,3.5,24,0|bec=200,a|schmand
Crème fraîche|🥛|kuehl|290,2.5,2.6,30,0|bec=150,a|crème fraîche,creme fraiche,crème fraiche
Joghurt|🥣|kuehl|61,3.5,4.7,3.3,0|bec=500,a|joghurt,jogurt
Griechischer Joghurt|🥣|kuehl|120,5,4,10,0|bec=500,a|griechischer joghurt
Skyr|🥣|kuehl|63,11,4,0.2,0|bec=450,a|skyr
Magerquark|🥣|kuehl|67,12,4,0.3,0|bec=250,a|quark,magerquark
Frischkäse|🧀|kuehl|250,5.5,3.5,24,0|pck=200,a|frischkäse
Mozzarella|🧀|kuehl|250,18,1,19,0|p=125,pck=125,a|mozzarella,burrata
Feta|🧀|kuehl|265,14,1,22,0|pck=200,a|feta,hirtenkäse,schafskäse
Halloumi|🧀|kuehl|320,22,2,25,0|pck=225,a|halloumi,grillkäse
Paneer|🧀|kuehl|290,19,3,22,0|pck=250,a|paneer
Parmesan|🧀|kuehl|392,35,0,28,0|el=6,a|parmesan,hartkäse,pecorino,grana padano
Käse (gerieben)|🧀|kuehl|356,25,0,28,0|sc=20,a|käse,gouda,emmentaler,bergkäse,reibekäse,cheddar,gruyère,raclettekäse
Ziegenkäse|🧀|kuehl|300,19,1,24,0|p=150,a|ziegenkäse
Ricotta|🧀|kuehl|150,9,3,11,0|pck=250,a|ricotta
Mascarpone|🧀|kuehl|450,4.5,3.5,47,0|pck=250,a|mascarpone
Eier|🥚|kuehl|155,13,1.1,11,0|p=60,a|ei,eier
Eigelb|🥚|kuehl|330,16,0.6,29,0|p=18,a|eigelb
Buttermilch|🥛|kuehl|37,3.4,4,0.5,0|a|buttermilch
Butterschmalz|🧈|kuehl|900,0,0,99.8,0|el=12,a|butterschmalz,ghee
Spätzle|🍝|kuehl|220,8,38,3.5,2|pck=500,a|spätzle
Gnocchi|🥔|kuehl|150,3.5,33,0.3,1.5|pck=500|gnocchi
Tortellini|🥟|kuehl|250,10,40,6,2.5|pck=250,a|tortellini,ravioli,tortelloni
Blätterteig|🥐|kuehl|390,6,36,24,1.5|pck=275|blätterteig
Pizzateig|🍕|kuehl|250,7,48,3,2|pck=400|pizzateig
Flammkuchenteig|🍕|kuehl|270,7,45,6,2|pck=260|flammkuchenteig
Yufka-Teig|🫓|kuehl|300,9,62,2,2|pck=400,p=25|yufka,filoteig,strudelteig
Pesto|🌿|kuehl|450,5,6,45,2|el=15,gla=190,a|pesto
Tofu|🌱|tofu|125,13,2,7.5,1|pck=200,p=200|tofu
Räuchertofu|🌱|tofu|160,16,2,9.5,1|pck=200|räuchertofu
Seidentofu|🌱|tofu|55,5,1.5,3,0.3|pck=400|seidentofu
Tempeh|🌱|tofu|190,19,9,11,4|pck=200|tempeh
Hafermilch|🥛|tofu|45,0.6,7,1.5,0.6||hafermilch,haferdrink
Sojamilch|🥛|tofu|40,3.3,1.5,2,0.6||sojamilch,sojadrink
Mandelmilch|🥛|tofu|22,0.5,2,1.2,0.3||mandelmilch,mandeldrink
Sojajoghurt|🥣|tofu|50,4,2,2.5,1|bec=500|sojajoghurt
Hafersahne|🥛|tofu|150,1,6,13,0.5|bec=200|hafersahne,sojasahne,pflanzensahne,kochcreme
Hummus|🫘|tofu|240,7,14,17,6|el=20,pck=200|hummus
Falafel|🧆|tofu|330,13,32,18,5|p=20|falafel
Hefeflocken|🌱|tofu|360,50,30,5,20|el=5|hefeflocken
Margarine|🧈|tofu|700,0,0.5,78,0|el=12|margarine,vegane butter
Nudeln|🍝|getreide|355,13,70,1.5,3|pck=500|nudel,spaghetti,penne,fusilli,pasta,tagliatelle,linguine,rigatoni,farfalle,makkaroni,maccheroni,orecchiette,conchiglie,cannelloni,ditalini
Vollkornnudeln|🍝|getreide|340,14,62,2.5,8|pck=500|vollkornnudel,vollkornspaghetti
Lasagneplatten|🍝|getreide|355,13,70,1.5,3|p=20,pck=250|lasagneplatte
Orzo|🍝|getreide|355,13,72,1.5,3||orzo,kritharaki
Mie-Nudeln|🍜|getreide|360,12,70,2,3|pck=250|mie,ramen,asianudel,eiernudel
Reisnudeln|🍜|getreide|360,6,80,0.5,1.5|pck=250|reisnudel
Glasnudeln|🍜|getreide|350,0.2,86,0.1,0.5|pck=100|glasnudel
Udon-Nudeln|🍜|kuehl|130,3.5,27,0.5,1|pck=200|udon,udon-nudel,udonnudel
Reis|🍚|getreide|350,7,78,0.6,1.4|tas=180|reis,basmati,jasmin,langkornreis,sushireis,wildreis
Gekochte Nudeln|🍝|getreide|150,5.5,30,0.9,1.5||gekochte nudeln,gekochte spaghetti,gekochte pasta
Gekochter Reis|🍚|getreide|130,2.7,28,0.3,0.4||gekochter reis
Risottoreis|🍚|getreide|350,7,78,0.6,1.4||risottoreis,arborio,paellareis
Milchreis|🍚|getreide|350,7,78,0.6,1.4|pck=250|milchreis
Vollkornreis|🍚|getreide|350,7.5,72,2.5,3.5||vollkornreis,naturreis
Couscous|🌾|getreide|360,12,72,1.5,5||couscous
Bulgur|🌾|getreide|345,12,70,1.5,8||bulgur
Quinoa|🌾|getreide|368,14,64,6,7||quinoa
Graupen|🌾|getreide|350,10,72,1.4,10||graupen
Polenta|🌽|getreide|360,8,77,1.2,4||polenta,maisgrieß
Haferflocken|🥣|getreide|370,13.5,58,7,10|el=10,tas=90|haferflocken,hafer
Granola|🥣|getreide|440,9,62,16,7|el=10|granola,müsli,knuspermüsli
Mehl|🌾|vorrat|345,10,72,1,4|el=10,tas=125|mehl,weizenmehl,dinkelmehl
Grieß|🌾|vorrat|340,11,70,1,4|el=12|grieß
Paniermehl|🍞|vorrat|360,12,72,2,4|el=8|paniermehl,semmelbrösel
Speisestärke|🌾|vorrat|350,0.4,86,0.1,0.9|el=10,tl=3|stärke,speisestärke
Rote Getrocknete Erbsen|🫛|vorrat|340,22,50,1.5,15||getrocknete erbsen,schälerbsen,trockenerbsen
Linsen|🫘|vorrat|340,24,50,1.5,11|el=12|rote linsen,gelbe linsen
Linsen|🫘|vorrat|330,24,48,1.5,15||linsen,belugalinsen,berglinsen,tellerlinsen,braune linsen
Kichererbsen|🫘|vorrat|125,7,16,2.5,6|d=240|kichererbse
Bohnen (Dose)|🫘|vorrat|110,7,15,0.6,7|d=250|bohnen,kidneybohne,schwarze bohne,weiße bohne,cannellini,borlotti
Mais|🌽|vorrat|86,3.2,19,1.2,2|d=285|mais
Gehackte Tomaten|🥫|vorrat|22,1.2,3.5,0.2,1|d=400|gehackte tomaten,stückige tomaten,geschälte tomaten,dosentomaten
Passierte Tomaten|🥫|vorrat|30,1.4,5,0.2,1.2|pck=500|passierte tomaten,passata
Tomatenmark|🥫|vorrat|90,4.5,15,0.5,4|el=15,tl=5|tomatenmark
Getrocknete Tomaten|🍅|vorrat|210,4,15,14,6|gla=280|getrocknete tomate
Kokosmilch|🥥|vorrat|200,2,3,20,0|d=400|kokosmilch
Gewürzgurken|🥒|vorrat|20,0.5,3,0.2,1|p=40,gla=670|gewürzgurke,essiggurke
Oliven|🫒|vorrat|145,1,4,15,3|el=10,gla=160|oliven
Kapern|🫙|vorrat|25,2,5,0.9,3|el=10|kapern
Apfelmus|🍎|vorrat|75,0.3,18,0.1,1.5|gla=360|apfelmus
Olivenöl|🫒|vorrat|884,0,0,100,0|el=10,tl=4|olivenöl
Öl|🌻|vorrat|884,0,0,100,0|el=10,tl=4|öl,rapsöl,sonnenblumenöl,pflanzenöl,erdnussöl,bratöl,leinöl,walnussöl,kürbiskernöl
Sesamöl|🫙|vorrat|884,0,0,100,0|el=10,tl=4|sesamöl
Kokosöl|🥥|vorrat|870,0,0,99,0|el=10,tl=4|kokosöl
Erdnussbutter|🥜|vorrat|590,25,16,50,6|el=16,tl=5|erdnussbutter,erdnussmus
Tahin|🥜|vorrat|600,18,20,52,9|el=15,tl=5|tahin,tahini,sesammus
Zucker|🍬|vorrat|400,0,100,0,0|el=12,tl=4|zucker,rohrzucker,puderzucker,brauner zucker
Vanillezucker|🍬|vorrat|400,0,100,0,0|pck=8|vanillezucker
Backpulver|🧁|vorrat|50,0,12,0,0|pck=15,tl=4|backpulver,natron
Hefe|🟫|vorrat|100,11,9,1.5,6|p=42|hefe
Trockenhefe|🟫|vorrat|330,40,40,5,25|pck=7|trockenhefe
Kakao|🍫|vorrat|350,20,11,21,30|el=8|kakao
Honig|🍯|vorrat|304,0.3,82,0,0|el=20,tl=7,a|honig
Ahornsirup|🍁|vorrat|260,0,67,0,0|el=20,tl=7|ahornsirup,agavendicksaft
Marmelade|🍓|vorrat|250,0.3,60,0,1|el=20|marmelade,konfitüre
Rosinen|🍇|vorrat|300,3,70,0.5,4|el=12|rosinen
Mandeln|🌰|vorrat|600,21,6,52,12|el=8|mandel
Walnüsse|🌰|vorrat|680,15,11,65,6|el=8|walnuss,walnüsse,nüsse,pekan
Cashews|🌰|vorrat|580,18,30,44,3|el=10|cashew
Erdnüsse|🥜|vorrat|600,26,11,49,8|el=10|erdnüsse,erdnuss
Haselnüsse|🌰|vorrat|640,15,10,61,8|el=8|haselnuss,haselnüsse
Pinienkerne|🌰|vorrat|680,14,13,68,4|el=8|pinienkern
Kerne & Saaten|🌻|vorrat|570,25,11,49,9|el=10|kürbiskern,sonnenblumenkern,hanfsamen
Sesam|🌰|vorrat|580,18,10,50,12|el=8|sesam
Chiasamen|🌱|vorrat|490,17,8,31,34|el=12|chia
Leinsamen|🌱|vorrat|530,18,2,42,27|el=10|leinsamen
Kokosraspel|🥥|vorrat|650,6,7,62,15|el=6|kokosraspel
Nori|🍙|vorrat|300,40,40,3,35|p=3|nori
Reispapier|🫓|vorrat|330,0.5,80,0.5,1|p=9|reispapier
Frühlingsrollenblätter|🥢|tk|300,8,62,2,2|p=15|frühlingsrollenblatt,frühlingsrollenblätter,wan-tan,wantan,gyoza,dim-sum
Löffelbiskuits|🍪|snack|390,8,80,4,1|p=6,a|löffelbiskuit
Gemüsebrühe|🍲|gewuerz|5,0.3,0.6,0.2,0||brühe,gemüsebrühe,gemüsefond
Salz|🧂|gewuerz|0,0,0,0,0||salz,meersalz,kala namak
Pfeffer|⚫|gewuerz|250,10,64,3,25|tl=2|pfeffer
Paprikapulver|🌶️|gewuerz|280,14,54,13,35|tl=2.5,el=7|paprikapulver,paprika edelsüß,paprika rosenscharf
Currypulver|🟡|gewuerz|300,13,56,14,33|tl=2.5,el=7|currypulver,curry
Kreuzkümmel|🟤|gewuerz|375,18,44,22,10|tl=2.5|kreuzkümmel,kumin,cumin
Kümmel|🟤|gewuerz|375,20,50,15,38|tl=2.5|kümmel
Kurkuma|🟠|gewuerz|310,10,65,3,21|tl=2.5|kurkuma
Zimt|🟤|gewuerz|250,4,80,1.2,53|tl=2.5,p=2|zimt
Garam Masala|🟤|gewuerz|330,12,50,15,25|tl=2.5|garam masala
Ras el Hanout|🟤|gewuerz|330,12,50,15,25|tl=2.5|ras el hanout
Gemahlener Koriander|🟤|gewuerz|300,12,55,18,42|tl=2|gemahlener koriander,korianderpulver
Chiliflocken|🌶️|gewuerz|300,12,50,14,30|tl=1.5|chiliflocken,chilipulver,cayenne,chipotle
Muskat|🟤|gewuerz|525,6,49,36,21|tl=2|muskat,muskatnuss
Oregano|🌿|gewuerz|265,9,69,4,42|tl=1,el=3|oregano
Thymian|🌿|gewuerz|276,9,64,7,37|tl=1,el=3|thymian
Rosmarin|🌿|gewuerz|331,5,64,15,43|tl=1,el=3|rosmarin
Majoran|🌿|gewuerz|271,13,61,7,40|tl=1,el=3|majoran
Kräuter der Provence|🌿|gewuerz|270,9,64,5,40|tl=1,el=3|kräuter der provence,italienische kräuter,kräutermischung
Lorbeerblätter|🍃|gewuerz|0,0,0,0,0|p=0.2|lorbeer
Safran|🟠|gewuerz|0,0,0,0,0||safran
Vanille|🍦|gewuerz|0,0,0,0,0|p=2|vanilleschote,vanilleextrakt
Essig|🍶|gewuerz|20,0,0.6,0,0|el=15,tl=5|essig,weißweinessig,apfelessig,reisessig
Balsamico|🍶|gewuerz|110,0.5,22,0,0|el=15,tl=5|balsamico
Sojasauce|🍶|gewuerz|60,8,6,0.1,0.8|el=16,tl=5|sojasauce,sojasoße,shoyu,tamari
Teriyaki-Sauce|🍶|gewuerz|90,6,16,0,0|el=18|teriyaki
Süße Chilisauce|🌶️|gewuerz|230,0.5,55,0.3,1|el=18|chilisauce,sweet chili
Sriracha|🌶️|gewuerz|100,2,20,1,2|el=15,tl=5|sriracha,sambal,gochujang
Senf|🟡|gewuerz|80,5,5,4.5,3|el=15,tl=5|senf,dijonsenf
Ketchup|🍅|gewuerz|100,1.2,23,0.2,0.4|el=17|ketchup
Mayonnaise|🥚|gewuerz|680,1,3,75,0|el=15,a|mayonnaise,mayo
Miso-Paste|🍶|gewuerz|200,12,26,6,5|el=18|miso
Currypaste|🌶️|gewuerz|120,2.5,12,7,4|el=15|currypaste
Zitronensaft|🍋|gewuerz|22,0.4,7,0.2,0.3|el=15,tl=5|zitronensaft,limettensaft
Erbsen (TK)|🫛|tk|81,5.4,14,0.4,5.7||erbsen
Edamame (TK)|🫛|tk|120,11,9,5,5||edamame
Gemüsemischung (TK)|🥦|tk|40,2.5,6,0.4,3||tk-gemüse,gemüsemischung
Pommes (TK)|🍟|tk|150,2.5,23,5,2.5||pommes
Pizza (TK)|🍕|tk|240,9,28,10,2|p=350,a|tk-pizza,tiefkühlpizza
Eiscreme|🍨|tk|200,3.5,24,10,0.5|a|eiscreme,speiseeis,vanilleeis
Zartbitterschokolade|🍫|snack|540,7,46,35,9|p=100|zartbitterschokolade,schokolade,schoko,vollmilchschokolade
Chips|🥔|snack|530,6,50,33,4|pck=175|chips
Tortilla-Chips|🌽|snack|490,7,62,23,5|pck=200|tortilla-chips,tortillachips,nachos
Kekse|🍪|snack|480,6,68,20,2|a|kekse,cookies
Gummibärchen|🐻|snack|340,7,77,0.2,0|a|gummibär
Popcorn|🍿|snack|380,12,60,10,14||popcorn
Müsliriegel|🍫|snack|420,7,62,16,6|p=25|müsliriegel
Reiswaffeln|🍘|snack|390,8,82,3,4|p=8|reiswaffel
Wasser|💧|getraenk|0,0,0,0,0||wasser,mineralwasser,sprudel
Orangensaft|🧃|getraenk|45,0.7,10,0.2,0.2||orangensaft,o-saft
Apfelsaft|🧃|getraenk|46,0.1,11,0.1,0.2||apfelsaft,saft
Wein|🍷|getraenk|85,0.1,2.6,0,0|el=15|wein,rotwein,weißwein
Bier|🍺|getraenk|43,0.5,3.6,0,0||bier
Kaffee|☕|getraenk|2,0.1,0,0,0||kaffee,espresso
Tee|🍵|getraenk|1,0,0.2,0,0||tee
Limonade|🥤|getraenk|42,0,10.6,0,0||cola,limo
Grünkohl|🥬|obst|49,4.3,9,0.9,4||grünkohl
Pastinaken|🥕|obst|75,1.2,18,0.3,4.9|p=150|pastinake
Kohlrabi|🥬|obst|27,1.7,6,0.1,3.6|p=300|kohlrabi
Rosenkohl|🥬|obst|43,3.4,9,0.3,3.8|p=15|rosenkohl
Mangold|🥬|obst|19,1.8,3.7,0.2,1.6|b=300|mangold
Chicorée|🥬|obst|17,1.3,2.4,0.2,3|p=150|chicorée,chicoree
Radicchio|🥬|obst|23,1.4,4.5,0.3,0.9|p=200|radicchio
Okra|🌿|obst|33,1.9,7,0.2,3.2||okra
Pfirsiche|🍑|obst|41,0.8,9.5,0.1,1.5|p=150|pfirsich,nektarine
Aprikosen|🍑|obst|43,0.9,10,0.1,1.5|p=50|aprikose
Pflaumen|🟣|obst|47,0.6,11,0.2,1.6|p=40|pflaume,zwetschge
Rhabarber|🌿|obst|20,0.6,4,0.1,3|p=150,st=150|rhabarber
Melone|🍉|obst|30,0.6,8,0.2,0.4|p=1500|melone
Feigen|🟣|obst|74,0.8,19,0.3,3|p=50|feige
Artischocken|🌿|vorrat|40,2,6,1,4|gla=280,p=40|artischocke
Sauerkraut|🥬|vorrat|20,1.5,3,0.3,2.1|d=500,pck=500|sauerkraut
Maronen|🌰|vorrat|200,3,44,1.9,8|pck=200|marone,esskastanie
Jackfruit|🌱|tofu|95,1.7,23,0.6,1.5|d=280|jackfruit
Seitan|🌱|tofu|140,25,6,2,0.6|pck=200|seitan
Sojaschnetzel|🌱|tofu|330,48,16,1.5,18||sojaschnetzel,sojagranulat
Kokosjoghurt|🥥|tofu|120,1,6,10,0.5|bec=400|kokosjoghurt
Proteinpulver|💪|tofu|380,78,8,6,1|el=10,a|proteinpulver,whey
Veganes Proteinpulver|💪|tofu|380,75,8,7,4|el=10|veganes proteinpulver
Hüttenkäse|🧀|kuehl|98,12,3,4.3,0|bec=200,a|hüttenkäse,körniger frischkäse
Gorgonzola|🧀|kuehl|356,19,0,31,0|a|gorgonzola,blauschimmel
Camembert|🧀|kuehl|300,20,0.5,24,0|p=125,a|camembert,brie
Ziegenfrischkäse|🧀|kuehl|220,12,2,18,0|pck=150,a|ziegenfrischkäse
Kefir|🥛|kuehl|60,3.3,4,3.5,0|a|kefir
Eiweiß|🥚|kuehl|48,11,0.7,0.2,0|p=35,a|eiweiß,eiklar
Kimchi|🌶️|kuehl|30,1.5,4.5,0.5,1.6|gla=300|kimchi
Schupfnudeln|🥔|kuehl|170,4,36,1,2|pck=500|schupfnudel
Kichererbsenmehl|🌾|vorrat|360,22,50,6,10|el=10|kichererbsenmehl
Hirse|🌾|getreide|360,11,69,4,3.8||hirse
Buchweizen|🌾|getreide|343,13,72,3.4,10||buchweizen
Grünkern|🌾|getreide|360,11,63,2.7,9||grünkern
Dinkel|🌾|getreide|340,13,64,2.5,9||dinkelkörner,dinkelreis,ebly,weizenkörner
Amaranth|🌾|getreide|371,14,65,7,7||amaranth
Haferkleie|🥣|getreide|370,17,49,7,15|el=8|haferkleie
Cornflakes|🥣|getreide|380,7,84,0.9,3||cornflakes
Soba-Nudeln|🍜|getreide|340,14,70,1,4|pck=250|soba
Linsennudeln|🍝|getreide|340,25,48,2,9|pck=250|linsennudel,kichererbsennudel,erbsennudel,proteinnudel
Taco-Schalen|🌮|brot|480,6,60,22,5|p=12|taco-schale,tacoschale
Bagels|🥯|brot|260,10,50,1.5,2.5|p=90|bagel
Laugenbrezeln|🥨|brot|270,8,55,1.5,2|p=90|brezel,laugen
Mandelmus|🥜|vorrat|620,22,7,55,10|el=16,tl=5|mandelmus,cashewmus
Pistazien|🌰|vorrat|570,20,28,45,10|el=8|pistazie
Cranberries|🔴|vorrat|330,0.1,82,1.4,6|el=10|cranberr
Puddingpulver|🍮|vorrat|350,0.3,86,0.1,0|pck=37|puddingpulver
Agar-Agar|🌿|vorrat|0,0,0,0,0|tl=2|agar
Nuss-Nougat-Creme|🍫|vorrat|540,6,57,31,3|el=15,tl=5,a|nuss-nougat
Ajvar|🫑|vorrat|70,1.5,9,3,2|el=15,gla=350|ajvar
Hoisin-Sauce|🍶|gewuerz|220,3,44,3,2|el=18|hoisin
Harissa|🌶️|gewuerz|180,4,15,12,6|el=15,tl=5|harissa
Meerrettich|🌿|gewuerz|70,2.5,11,0.6,8|el=15,tl=5|meerrettich
Gewürzmischung|🟤|gewuerz|300,10,50,10,25|tl=2.5|gewürzmischung,gyros-gewürz,taco-gewürz,cajun,fajita-gewürz,five spice,fünf-gewürze,lebkuchengewürz,shawarma-gewürz,berbere,za'atar,zaatar,sumach,pul biber
Ganze Gewürze|🟤|gewuerz|300,10,55,10,30|tl=2,p=0.5|kardamom,nelke,sternanis,fenchelsamen,fenchelsaat,bockshornklee,asafoetida,piment,wacholder,senfsaat,senfkörner,koriandersamen
Toilettenpapier|🧻|haushalt|0,0,0,0,0|x|toilettenpapier,klopapier
Küchenrolle|🧻|haushalt|0,0,0,0,0|x|küchenrolle,küchenpapier
Spülmittel|🧴|haushalt|0,0,0,0,0|x|spülmittel
Spülmaschinentabs|🫧|haushalt|0,0,0,0,0|x|spülmaschinentabs,tabs
Waschmittel|🧺|haushalt|0,0,0,0,0|x|waschmittel
Müllbeutel|🗑️|haushalt|0,0,0,0,0|x|müllbeutel,müllsäcke
Zahnpasta|🪥|haushalt|0,0,0,0,0|x|zahnpasta,zahncreme
Duschgel|🧴|haushalt|0,0,0,0,0|x|duschgel
Shampoo|🧴|haushalt|0,0,0,0,0|x|shampoo
Deo|🧴|haushalt|0,0,0,0,0|x|deo
Seife|🧼|haushalt|0,0,0,0,0|x|seife
Taschentücher|🤧|haushalt|0,0,0,0,0|x|taschentücher
Backpapier|📜|haushalt|0,0,0,0,0|x|backpapier
Alufolie|🥡|haushalt|0,0,0,0,0|x|alufolie
Frischhaltefolie|🥡|haushalt|0,0,0,0,0|x|frischhaltefolie
Schwämme|🧽|haushalt|0,0,0,0,0|x|schwamm,schwämme
Batterien|🔋|haushalt|0,0,0,0,0|x|batterie
Kerzen|🕯️|haushalt|0,0,0,0,0|x|kerze
`;

const FOODS = FOOD_DATA.trim().split('\n').map((line, i) => {
  const [name, emoji, cat, nut, opts, keys] = line.split('|');
  const [kcal, p, c, f, fib] = nut.split(',').map(Number);
  const o = {};
  (opts || '').split(',').filter(Boolean).forEach(x => { const [k, v] = x.split('='); o[k] = v === undefined ? true : +v; });
  const base = name.replace(/\s*\(.*?\)/g, '').toLowerCase();
  const kl = [...new Set([base, ...(keys || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)])];
  return { id: i, name, emoji, cat, kcal, p, c, f, fib, o, keys: kl, animal: !!o.a, nonfood: !!o.x };
});

// Längster passender Suchbegriff gewinnt ("Kokosmilch" vor "Milch", "Tomatenmark" vor "Tomate").
const _foodCache = new Map();
function matchFood(name) {
  const n = ' ' + String(name || '').toLowerCase() + ' ';
  if (_foodCache.has(n)) return _foodCache.get(n);
  let best = null, bestLen = 0;
  for (const fd of FOODS) for (const k of fd.keys) {
    if (k.length <= bestLen) continue;
    const i = n.indexOf(k);
    if (i < 0) continue;
    if (k.length < 4) { // kurze Begriffe nur als ganzes Wort
      const before = n[i - 1], after = n[i + k.length];
      if (/[a-zäöüß]/.test(before) || /[a-zäöüß]/.test(after)) continue;
    }
    best = fd; bestLen = k.length;
  }
  _foodCache.set(n, best);
  return best;
}

// Menge in Gramm umrechnen (Schätzung für Stück, Löffel usw.)
function ingGrams(ing, fd) {
  const a = ing.amount; if (a == null) return 0;
  const o = fd.o;
  switch (ing.unit) {
    case 'g': return a;
    case 'kg': return a * 1000;
    case 'mg': return a / 1000;
    case 'ml': return a;
    case 'l': return a * 1000;
    case 'cl': return a * 10;
    case 'dl': return a * 100;
    case 'EL': return a * (o.el || 15);
    case 'TL': return a * (o.tl || (o.el ? o.el / 3 : 5));
    case 'Prise': return a * 0.5;
    case 'Msp': return a * 0.3;
    case 'Schuss': return a * 10;
    case 'Spritzer': return a * 2;
    case 'Handvoll': return a * 30;
    case 'Zehe': return a * 4;
    case 'Bund': return a * (o.b || 50);
    case 'Scheibe': return a * (o.sc || 30);
    case 'Dose': return a * (o.d || 400);
    case 'Tasse': return a * (o.tas || 150);
    case 'Pck': return a * (o.pck || o.p || 200);
    case 'Becher': return a * (o.bec || 200);
    case 'Glas': return a * (o.gla || 350);
    case 'Schale': return a * (o.sch || 250);
    case 'Kopf': return a * (o.ko || o.p || 500);
    case 'Knolle': return a * (o.kn || o.p || 400);
    case 'Stange': return a * (o.st || o.p || 100);
    case 'Würfel': return a * (o.p || 10);
    case 'Kugel': return a * (o.p || 125);
    case 'Zweig': return a * 1;
    case 'Blatt': return a * (o.p || 1);
    case 'Beutel': return a * (o.pck || 100);
    case 'Netz': return a * 1000;
    default: return a * (o.p || 100);
  }
}

// Nährwerte für ein Rezept (gesamt), plus Info ob vegan und wie viel erkannt wurde
function calcNutrition(ingredients) {
  const t = { kcal: 0, p: 0, c: 0, f: 0, fib: 0 };
  let vegan = true, known = 0, counted = 0;
  for (const ing of ingredients) {
    const fd = matchFood(ing.name);
    if (fd && fd.animal) vegan = false;
    if (!fd) { if (/\b(ei|eier|käse|milch|butter|sahne|joghurt|quark|honig)\b/i.test(ing.name)) vegan = false; }
    if (ing.amount == null) continue;
    counted++;
    if (!fd) continue;
    known++;
    const g = ingGrams(ing, fd) / 100;
    t.kcal += fd.kcal * g; t.p += fd.p * g; t.c += fd.c * g; t.f += fd.f * g; t.fib += fd.fib * g;
  }
  return { ...t, vegan, coverage: counted ? known / counted : 1 };
}
