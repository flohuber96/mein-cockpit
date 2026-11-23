'use strict';
/* Haushalt: Bereiche, Vorschläge für Routinen (mit empfohlener Häufigkeit) und Wissensseiten.
   Häufigkeiten sind übliche Empfehlungen für einen Haushalt mit 2–3 Personen – jede Routine lässt sich anpassen. */
const AREAS = [
  { k: 'kueche', name: 'Küche', e: '🍳' },
  { k: 'bad', name: 'Bad & WC', e: '🛁' },
  { k: 'wohnen', name: 'Wohnen & Schlafen', e: '🛋️' },
  { k: 'boden', name: 'Böden & Fenster', e: '🧹' },
  { k: 'waesche', name: 'Wäsche', e: '👕' },
  { k: 'haus', name: 'Haus & Technik', e: '🔧' },
  { k: 'orga', name: 'Organisation', e: '🗂️' },
  { k: 'baby', name: 'Baby & Kind', e: '🧸' },
  { k: 'draussen', name: 'Balkon & Draußen', e: '🌿' },
  { k: 'sonst', name: 'Sonstiges', e: '📌' },
];
const AREA_BY = Object.fromEntries(AREAS.map(a => [a.k, a]));
const UNITS = { d: ['Tag', 'Tage'], w: ['Woche', 'Wochen'], m: ['Monat', 'Monate'], y: ['Jahr', 'Jahre'] };

/* Vorschläge: id | Bereich | Name | alle n | Einheit | Minuten | Grundausstattung (1) | Tipp */
const ROUTINE_DATA = `
k-aufraeumen|kueche|Küche aufräumen, Spülmaschine ein- und ausräumen|1|d|10|1|Abends kurz klar Schiff machen – morgens startet der Tag dann ohne Chaos.
k-flaechen|kueche|Arbeitsflächen und Herd abwischen|1|d|5|1|Mit warmem Wasser und etwas Spülmittel; Herdplatten gleich nach dem Kochen, solange Spritzer noch weich sind.
k-spuele|kueche|Spüle und Armatur reinigen|3|d|5|1|Kalkflecken mit Essig- oder Zitronensäure-Lösung, danach trocken reiben – dann bleibt sie länger glänzend.
k-muell|kueche|Müll rausbringen und Eimer prüfen|3|d|5|1|Biomüll im Sommer öfter leeren; Eimer bei Bedarf mit heißem Wasser und Spülmittel auswaschen.
k-tuecher|kueche|Spültücher, Schwämme und Geschirrtücher wechseln|3|d|2|1|Benutzte Tücher bei 60 °C waschen. Schwämme spätestens nach einer Woche ersetzen – sie sind Keimschleudern.
k-kuehl-check|kueche|Kühlschrank durchsehen: Reste und Abgelaufenes|1|w|5|1|Vor dem Wocheneinkauf: Was weg muss, kommt auf den Essensplan oder in den Müll.
k-mikrowelle|kueche|Mikrowelle reinigen|2|w|5|0|Schüssel Wasser mit Zitronensaft 5 Minuten erhitzen, kurz stehen lassen, dann lässt sich alles leicht auswischen.
k-kuehl|kueche|Kühlschrank auswischen|1|m|15|1|Mit Wasser und etwas Essig oder Spülmittel. Das Ablaufloch an der Rückwand freihalten (Wattestäbchen).
k-ofen|kueche|Backofen reinigen|1|m|20|0|Natron mit wenig Wasser zu einer Paste rühren, auftragen, über Nacht einwirken lassen und abwischen.
k-sieb|kueche|Spülmaschine: Sieb reinigen|2|w|5|1|Sieb herausdrehen und unter fließendem Wasser ausbürsten – verhindert Gerüche und schlechte Spülergebnisse.
k-spuelmaschine|kueche|Spülmaschine: Leerspülgang heiß, Salz und Klarspüler prüfen|1|m|5|1|Einmal im Monat leer mit dem heißesten Programm laufen lassen (ggf. mit Maschinenreiniger).
k-haube|kueche|Dunstabzugshaube: Fettfilter reinigen|1|m|10|1|Metallfilter passen meist in die Spülmaschine. Aktivkohlefilter je nach Hersteller alle 3–6 Monate tauschen.
k-wasserkocher|kueche|Wasserkocher entkalken|1|m|5|1|Zitronensäure oder Essig mit Wasser, nicht kochen lassen; danach einmal frisches Wasser aufkochen und wegschütten.
k-kaffee|kueche|Kaffeemaschine entkalken|2|m|10|1|Am besten mit dem Entkalker des Herstellers – Essig kann Dichtungen angreifen. Bei hartem Wasser öfter.
k-vorrat|kueche|Vorratsschrank prüfen und auswischen|3|m|20|0|Ältere Packungen nach vorn, Mottenbefall prüfen (Gespinste in Mehl, Nüssen, Müsli).
k-gefrier|kueche|Gefrierschrank abtauen|6|m|45|0|Spätestens ab einer Eisschicht von etwa 5 mm – das spart Strom. Am besten an einem kalten Tag, Gefriergut in Kühltaschen.

b-waschbecken|bad|Waschbecken und Armaturen abwischen|3|d|5|1|Ein Mikrofasertuch reicht oft. Gegen Kalk ab und zu Essig- oder Zitronensäurelösung, danach trocken reiben.
b-wc|bad|WC reinigen|1|w|10|1|WC-Reiniger unter den Rand, einwirken lassen, bürsten. Sitz, Deckel und Spülknopf nicht vergessen. Eigene Tücher nur fürs WC.
b-dusche|bad|Dusche bzw. Badewanne reinigen|1|w|15|1|Nach dem Duschen Wände mit dem Abzieher trocknen – das verhindert Kalk und Schimmel und spart Putzzeit.
b-spiegel|bad|Spiegel putzen|1|w|3|1|Mikrofasertuch, leicht angefeuchtet, danach trocken nachwischen – streifenfrei ohne Glasreiniger.
b-handtuch|bad|Handtücher wechseln|4|d|2|1|Handtücher nach etwa 3–4 Benutzungen waschen, gut trocknen lassen. Bei 60 °C waschen, ohne Weichspüler.
b-vorleger|bad|Badvorleger waschen|2|w|2|1|Bei 40–60 °C je nach Etikett.
b-abfluss|bad|Abflüsse von Haaren befreien|1|m|10|1|Haare mit einer Abflussspirale oder einem Haarstopp entfernen. Chemische Rohrreiniger nur im Notfall.
b-fugen|bad|Fugen und Silikon auf Schimmel prüfen|1|m|5|0|Kleine Stellen mit Schimmelentferner behandeln und gut lüften. Großflächiger Schimmel: Ursache klären (Feuchtigkeit).
b-perlator|bad|Duschkopf und Perlatoren entkalken|2|m|15|1|Über Nacht in Essig- oder Zitronensäurelösung legen, danach gründlich spülen.
b-zahnbuerste|bad|Zahnbürsten bzw. Aufsteckbürsten erneuern|3|m|2|1|Zahnärzte empfehlen alle 3 Monate – und nach einer Erkältung.
b-vorhang|bad|Duschvorhang waschen|2|m|5|0|Bei 30–40 °C in der Maschine, zusammen mit ein paar Handtüchern (die scheuern mit).

w-aufraeumen|wohnen|Aufräumrunde (10 Minuten)|1|d|10|1|Timer stellen, alles an seinen Platz bringen. Kleine tägliche Runden ersparen den großen Putztag.
w-staub|wohnen|Staub wischen|1|w|15|1|Von oben nach unten, mit leicht feuchtem Mikrofasertuch – trockenes Wischen wirbelt Staub nur auf.
w-bett|wohnen|Bettwäsche wechseln|2|w|15|1|Alle 1–2 Wochen; bei 60 °C waschen. Bei Hausstauballergie oder Krankheit öfter.
w-klinken|wohnen|Türklinken, Lichtschalter und Fernbedienungen abwischen|2|w|5|0|Besonders in der Erkältungszeit. Spülmittel-Wasser reicht – Desinfektion ist im Alltag nicht nötig.
w-pflanzen|wohnen|Zimmerpflanzen gießen|1|w|10|1|Fingerprobe: Erde 2 cm tief trocken → gießen. Im Winter meist weniger Wasser nötig.
w-heizkoerper|wohnen|Heizkörper entstauben|1|m|10|0|Staub auf Heizkörpern verschlechtert die Wärmeabgabe. Mit Heizkörperbürste oder Staubsauger-Fugendüse.
w-polster|wohnen|Sofa und Polster absaugen|1|m|10|0|Mit Polsterdüse, auch die Ritzen. Kissen ausklopfen.
w-matratze|wohnen|Matratze wenden bzw. drehen und lüften|3|m|10|1|Wenden (falls laut Hersteller möglich) und Kopf/Fußende tauschen – sie liegt sich gleichmäßiger.
w-kissen|wohnen|Kopfkissen und Bettdecken waschen|6|m|15|1|Etwa 2× im Jahr, nach Pflegeetikett. Daunen gut trocknen (Trockner mit Tennisbällen).
w-vorhaenge|wohnen|Vorhänge waschen|6|m|20|0|Schonwaschgang, nur leicht schleudern und feucht wieder aufhängen – das spart das Bügeln.
w-ausmisten|wohnen|Kleiderschrank ausmisten und Saisonwechsel|6|m|60|0|Was ein Jahr nicht getragen wurde, darf gehen: spenden, verkaufen, Altkleider.

f-saugen|boden|Staubsaugen|1|w|20|1|Bei Kleinkind, Haustieren oder Allergie gern 2× pro Woche. Saugroboter? Dann nur noch Ecken und Teppiche.
f-wischen|boden|Böden wischen|1|w|20|1|Erst saugen, dann nebelfeucht wischen. Holz und Laminat nie nass, Steinböden ohne Essig.
f-fussmatte|boden|Fußmatte ausschütteln bzw. absaugen|1|w|2|1|Eine gute Fußmatte hält einen Großteil des Schmutzes draußen.
f-fenster|boden|Fenster putzen|3|m|60|1|Nicht bei praller Sonne (Schlieren). Wasser mit einem Spritzer Spülmittel, Abzieher, Rahmen und Dichtungen mitwischen.
f-teppich|boden|Teppiche gründlich saugen (auch Unterseite)|3|m|20|0|Teppich umdrehen und die Rückseite saugen – dort sammelt sich feiner Sand.

l-waschen|waesche|Wäsche waschen|3|d|10|1|Nach Farben und Temperatur sortieren (siehe Wissen → Wäsche). Trommel bei Baumwolle gut gefüllt, aber eine Handbreit Platz lassen.
l-falten|waesche|Wäsche zusammenlegen und wegräumen|3|d|15|1|Direkt nach dem Trocknen falten – das spart Bügeln.
l-buegeln|waesche|Bügeln|1|w|30|0|Hemden noch leicht feucht bügeln. Viele Sachen glätten sich auch durch Aufhängen direkt nach dem Schleudern.
l-pflege|waesche|Waschmaschine: Pflegewaschgang 60–90 °C leer|1|m|5|1|Mit etwas Vollwaschmittel (Pulver). Danach Tür und Einspülkasten offen lassen, damit alles trocknet.
l-dichtung|waesche|Waschmaschine: Türdichtung und Einspülkasten reinigen|1|m|10|1|Dichtung mit Tuch auswischen (Haare, Flusen, Münzen), Einspülkasten herausnehmen und abspülen.
l-flusensieb|waesche|Waschmaschine: Flusensieb bzw. Fremdkörperfalle reinigen|3|m|10|0|Unten hinter der Klappe. Handtuch und flache Schale bereithalten – da kommt Wasser.
l-trockner|waesche|Trockner: Kondensator bzw. Wärmepumpen-Filter reinigen|1|m|10|0|Das Flusensieb nach jedem Trocknen leeren; den Filter laut Anleitung etwa monatlich.

h-rauchmelder|haus|Rauchmelder testen|1|m|3|1|Prüftaste drücken, bis es piept. Batterien wechseln, wenn er warnt (meist kurzes Piepen alle paar Minuten).
h-wasserfilter|haus|Wasserfilter-Kartusche wechseln|4|w|2|0|Etwa alle 4 Wochen – sonst können sich Keime in der Kartusche vermehren.
h-sauger|haus|Staubsauger: Beutel bzw. Filter wechseln oder Behälter auswaschen|2|m|5|0|Volle Beutel und verstopfte Filter lassen die Saugkraft deutlich sinken.
h-heizung|haus|Heizkörper entlüften|1|y|20|1|Zu Beginn der Heizperiode oder wenn ein Heizkörper gluckert bzw. oben kalt bleibt. Danach Wasserdruck der Heizung prüfen.
h-apotheke|haus|Hausapotheke prüfen (Verfallsdaten, Fehlendes)|6|m|15|1|Abgelaufenes zur Apotheke bzw. laut Kommune in den Restmüll. Fiebermittel und Pflaster nachkaufen.
h-tonnen|haus|Mülltonnen bzw. Mülleimer auswaschen|3|m|15|0|Mit heißem Wasser und etwas Spülmittel oder Natron. Eine Lage Zeitungspapier unten bindet Feuchtigkeit.
h-zaehler|haus|Zählerstände notieren (Strom, Gas, Wasser)|1|m|5|0|Monatlich notiert sieht man früh, ob der Verbrauch aus dem Ruder läuft – und hat Werte für die Abrechnung.

o-post|orga|Post und Papiere sortieren|1|w|15|1|Ein fester Platz für Eingang, Erledigen und Ablage. Unwichtiges sofort ins Altpapier.
o-essensplan|orga|Essen für die Woche planen und einkaufen|1|w|20|1|Im Plan Gerichte wählen – die Zutaten stehen dann automatisch auf der Einkaufsliste.
o-vorrat|orga|Haushaltsvorräte prüfen (Putzmittel, Klopapier, Waschmittel)|1|m|5|0|Was knapp wird, gleich in der Einkaufsliste antippen.
o-abos|orga|Verträge, Abos und Kontoauszüge durchsehen|3|m|30|0|Doppelte oder vergessene Abos kündigen, Preiserhöhungen prüfen.

k-baby-spielzeug|baby|Spielzeug abwaschen|2|w|10|0|Mit warmem Wasser und milder Seife; Badespielzeug regelmäßig auf Schimmel innen prüfen (lieber ohne Loch kaufen).
k-baby-wickel|baby|Wickelplatz reinigen und auffüllen|1|w|5|0|Auflage abwischen, Windeln, Feuchttücher und Creme nachfüllen.
k-baby-flaschen|baby|Fläschchen, Sauger und Schnuller prüfen bzw. ersetzen|1|m|5|0|Sauger und Schnuller regelmäßig auf Risse prüfen und spätestens alle 1–2 Monate ersetzen.
k-baby-wagen|baby|Kinderwagen bzw. Buggy reinigen|1|m|15|0|Bezüge nach Etikett waschen, Räder und Gestell abwischen.
k-baby-kleidung|baby|Kleidergröße durchsehen und Zu-Kleines aussortieren|2|m|20|0|Babys wachsen schnell: Zu kleine Sachen weitergeben oder für das nächste Kind einlagern.

d-balkon|draussen|Balkon bzw. Terrasse fegen|2|w|10|0|Abfluss freihalten, besonders im Herbst (Laub).
d-pflanzen|draussen|Balkonpflanzen gießen und düngen|3|d|10|0|Im Hochsommer morgens oder abends täglich gießen, alle 1–2 Wochen düngen.
d-moebel|draussen|Gartenmöbel reinigen bzw. einlagern|6|m|30|0|Im Frühjahr aufstellen und reinigen, im Herbst trocken einlagern oder abdecken.
`;
const ROUTINE_TEMPLATES = ROUTINE_DATA.trim().split('\n').filter(l => l.trim()).map(l => {
  const [id, a, n, every, unit, mins, basic, tip] = l.split('|');
  return { tid: id, a, n, every: +every, unit, mins: +mins, basic: basic === '1', tip };
});
const TEMPLATE_BY = Object.fromEntries(ROUTINE_TEMPLATES.map(t => [t.tid, t]));

/* ───────── Wissen ───────── */
// Pflegesymbole als kleine Zeichnungen
const CARE = (() => {
  const s = inner => `<svg viewBox="0 0 40 40" class="care" aria-hidden="true">${inner}</svg>`;
  const tub = '<path d="M6 14 l3 18 h22 l3-18"/><path d="M5 14 q3.75-4 7.5 0 t7.5 0 t7.5 0 t7.5 0"/>';
  const x = '<path d="M7 7 L33 33 M33 7 L7 33"/>';
  const iron = '<path d="M7 30 h27 v-4 c0-6-4-10-11-10 h-9 l-2 3 h11 c-6 0-13 4-16 11 z"/>';
  const dot = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="1.6" class="f"/>`;
  return {
    w30: s(tub + '<text x="20" y="28">30</text>'), w40: s(tub + '<text x="20" y="28">40</text>'), w60: s(tub + '<text x="20" y="28">60</text>'), w95: s(tub + '<text x="20" y="28">95</text>'),
    w40b: s(tub + '<text x="20" y="27">40</text><path d="M8 36 h24"/>'), w30bb: s(tub + '<text x="20" y="27">30</text><path d="M8 35 h24 M8 38 h24"/>'),
    hand: s(tub + '<path d="M15 30 v-7 q0-2 2-2 t2 2 v-3 q0-2 2-2 t2 2 v3 q0-2 2-2 t2 2 v5 q0 4-4 4 h-4 q-3 0-3-2"/>'), nowash: s(tub + x),
    bleach: s('<path d="M20 6 L35 32 H5 Z"/>'), oxy: s('<path d="M20 6 L35 32 H5 Z"/><path d="M15 30 L22 16 M20 30 L27 16"/>'), nobleach: s('<path d="M20 6 L35 32 H5 Z"/>' + x),
    dry1: s('<rect x="6" y="6" width="28" height="28" rx="2"/><circle cx="20" cy="20" r="10"/>' + dot(20, 20)),
    dry2: s('<rect x="6" y="6" width="28" height="28" rx="2"/><circle cx="20" cy="20" r="10"/>' + dot(16.5, 20) + dot(23.5, 20)),
    nodry: s('<rect x="6" y="6" width="28" height="28" rx="2"/><circle cx="20" cy="20" r="10"/>' + x),
    line: s('<rect x="6" y="6" width="28" height="28" rx="2"/><path d="M8 12 q12 8 24 0"/>'), drip: s('<rect x="6" y="6" width="28" height="28" rx="2"/><path d="M14 11 v18 M20 11 v18 M26 11 v18"/>'),
    flat: s('<rect x="6" y="6" width="28" height="28" rx="2"/><path d="M11 20 h18"/>'),
    iron1: s(iron + dot(20, 24)), iron2: s(iron + dot(17, 24) + dot(23, 24)), iron3: s(iron + dot(15, 24) + dot(20, 24) + dot(25, 24)), noiron: s(iron + x),
    P: s('<circle cx="20" cy="20" r="13"/><text x="20" y="25">P</text>'), F: s('<circle cx="20" cy="20" r="13"/><text x="20" y="25">F</text>'),
    W: s('<circle cx="20" cy="20" r="13"/><text x="20" y="25">W</text>'), nodc: s('<circle cx="20" cy="20" r="13"/>' + x),
  };
})();

/* Jede Wissensseite: id, Emoji, Titel, Untertitel, Abschnitte [Überschrift, Zeilen]
   Zeile: [Stichwort, Text] oder [Pflegesymbol-Schlüssel, Stichwort, Text] (Pflegesymbole) */
const KNOWLEDGE = [
  { id: 'symbole', e: '🏷️', t: 'Wäschesymbole', s: 'Was das Pflegeetikett bedeutet', care: true, sec: [
    ['Waschen', [
      ['w30', '30 / 40 / 60 / 95', 'Höchsttemperatur in °C. Statt Zahlen stehen manchmal Punkte: 1 Punkt = 30 °C, 2 = 40 °C, 4 = 60 °C, 6 = 95 °C.'],
      ['w40b', 'Ein Balken', 'Schonwaschgang (Pflegeleicht): weniger Bewegung, sanfter schleudern.'],
      ['w30bb', 'Zwei Balken', 'Spezialschonwaschgang für Wolle und Feines: sehr wenig Bewegung.'],
      ['hand', 'Hand im Bottich', 'Nur Handwäsche, höchstens 40 °C, nicht wringen. Viele Maschinen haben ein passendes Programm.'],
      ['nowash', 'Durchgestrichen', 'Nicht waschen – meist professionelle Reinigung.']]],
    ['Bleichen', [
      ['bleach', 'Leeres Dreieck', 'Jedes Bleichmittel erlaubt.'],
      ['oxy', 'Dreieck mit zwei Strichen', 'Nur Sauerstoffbleiche (z. B. in Vollwaschmittel, Fleckensalz) – keine Chlorbleiche.'],
      ['nobleach', 'Durchgestrichen', 'Nicht bleichen: Colorwaschmittel nehmen, kein Fleckensalz mit Bleiche.']]],
    ['Trocknen', [
      ['dry2', 'Kreis im Quadrat, 2 Punkte', 'Trockner mit normaler Temperatur.'],
      ['dry1', 'Kreis im Quadrat, 1 Punkt', 'Trockner nur mit reduzierter Temperatur (Schonprogramm).'],
      ['nodry', 'Durchgestrichen', 'Nicht in den Trockner – an der Luft trocknen.'],
      ['line', 'Bogen im Quadrat', 'Auf der Leine trocknen.'],
      ['drip', 'Senkrechte Striche', 'Tropfnass aufhängen, nicht schleudern.'],
      ['flat', 'Waagerechter Strich', 'Liegend trocknen (z. B. Wollpullover), damit nichts ausleiert.']]],
    ['Bügeln', [
      ['iron3', '3 Punkte', 'Heiß, bis 200 °C: Baumwolle, Leinen.'],
      ['iron2', '2 Punkte', 'Mittel, bis 150 °C: Wolle, Seide, Polyester, Viskose.'],
      ['iron1', '1 Punkt', 'Niedrig, bis 110 °C, ohne Dampf: Acryl, Polyamid, empfindliche Kunstfasern.'],
      ['noiron', 'Durchgestrichen', 'Nicht bügeln.']]],
    ['Professionelle Reinigung', [
      ['P', 'P oder F im Kreis', 'Chemische Reinigung möglich (Buchstabe sagt der Reinigung, welches Lösemittel).'],
      ['W', 'W im Kreis', 'Professionelle Nassreinigung möglich.'],
      ['nodc', 'Durchgestrichen', 'Keine chemische Reinigung.']]],
  ] },
  { id: 'waesche', e: '🧺', t: 'Wäsche sortieren & waschen', s: 'Temperatur, Waschmittel, Beladung', sec: [
    ['Sortieren', [
      ['Weiß & Kochfest', '60 °C mit Vollwaschmittel (enthält Bleiche): Bettwäsche, Handtücher, Unterwäsche, Geschirrtücher. 90–95 °C nur bei Krankheit oder starker Verschmutzung.'],
      ['Bunt', '30–40 °C mit Colorwaschmittel (ohne Bleiche – Farben bleiben länger frisch). Auf links drehen.'],
      ['Dunkel & Schwarz', '30 °C, auf links, gern mit Schwarzwaschmittel. Neue dunkle Teile anfangs separat waschen, sie färben aus.'],
      ['Fein & Synthetik', '30 °C, Feinwaschmittel, Schonwaschgang, nur halb voll beladen, wenig schleudern.'],
      ['Wolle & Seide', 'Wollprogramm oder Hand, kalt bis 30 °C, Wollwaschmittel, kaum schleudern, liegend trocknen.'],
      ['Sport & Funktion', '30–40 °C, kein Weichspüler (verklebt die Fasern), Reißverschlüsse schließen.'],
      ['Babykleidung', 'Neue Sachen vor dem ersten Tragen waschen. 40–60 °C, am besten parfümfreies Waschmittel und ohne Weichspüler.']]],
    ['Richtig waschen', [
      ['Beladung', 'Baumwolle: Trommel gut füllen, aber eine Handbreit Platz lassen. Fein- und Wollwäsche: höchstens halb voll.'],
      ['Dosierung', 'Nach Wasserhärte (beim Wasserversorger erfragen) und Verschmutzung dosieren. Zu viel Waschmittel hinterlässt Rückstände und reizt die Haut.'],
      ['Weichspüler', 'Nicht für Handtücher (saugen schlechter), Mikrofaser und Sportkleidung. Oft ganz verzichtbar.'],
      ['Vorbereiten', 'Taschen leeren, Reißverschlüsse und Knöpfe schließen, Kordeln binden. BHs und Feines ins Wäschenetz.'],
      ['Energie sparen', 'Eco-Programme dauern länger, brauchen aber deutlich weniger Strom. 30–40 °C reichen für normal verschmutzte Wäsche.']]],
    ['Wie oft waschen?', [
      ['Nach 1× Tragen', 'Unterwäsche, Socken, T-Shirts, Sportkleidung.'],
      ['Nach 3–4× Nutzung', 'Handtücher, Schlafanzug, BH, Hemden und Blusen (je nach Tag).'],
      ['Nach mehreren Malen', 'Jeans (5–10×), Pullover (3–5×), Jacken nach Bedarf.'],
      ['Regelmäßig', 'Bettwäsche alle 1–2 Wochen, Geschirr- und Spültücher alle 2–3 Tage, Badvorleger alle 1–2 Wochen.'],
      ['Selten', 'Kopfkissen und Bettdecken etwa 2× im Jahr, Vorhänge 1–2× im Jahr.']]],
  ] },
  { id: 'flecken', e: '🧽', t: 'Flecken-Ratgeber', s: 'Was hilft bei welchem Fleck', sec: [
    ['Grundregeln', [
      ['Schnell sein', 'Frische Flecken gehen viel leichter raus. Erst Überschüssiges abnehmen.'],
      ['Tupfen statt reiben', 'Von außen nach innen arbeiten, damit der Fleck nicht größer wird.'],
      ['Kalt bei Eiweiß', 'Blut, Milch, Ei und Brei immer zuerst kalt ausspülen – warmes Wasser lässt Eiweiß gerinnen.'],
      ['Testen', 'Mittel erst an einer unauffälligen Stelle ausprobieren. Pflegeetikett beachten.'],
      ['Gallseife', 'Der Alleskönner für die meisten Flecken: anfeuchten, einreiben, einwirken lassen, waschen.']]],
    ['Häufige Flecken', [
      ['Rotwein, Beeren, Saft', 'Sofort kalt ausspülen, Gallseife einwirken lassen. Bei Weißem hilft Sauerstoffbleiche (Fleckensalz).'],
      ['Kaffee, Tee', 'Kalt ausspülen, Gallseife; bei Weißem Fleckensalz.'],
      ['Blut', 'Nur kalt ausspülen, mit Gallseife oder Enzym-Fleckenmittel behandeln.'],
      ['Fett, Öl, Butter', 'Spülmittel einmassieren, 15 Minuten einwirken lassen, dann so warm wie erlaubt waschen.'],
      ['Gras', 'Gallseife; bei hellen, robusten Stoffen etwas Spiritus oder Zitronensaft.'],
      ['Kerzenwachs', 'Hart werden lassen (Gefrierfach), abkratzen, Reste zwischen zwei Lagen Küchenpapier ausbügeln.'],
      ['Kugelschreiber', 'Mit Spiritus oder Desinfektionsalkohol auf einem Wattepad abtupfen.'],
      ['Schokolade', 'Erst kalt (Eiweiß), dann Gallseife, danach warm waschen (Fett).'],
      ['Tomate, Curry, Karotte', 'Spülmittel gegen das Fett, danach in die Sonne legen – Licht bleicht die Farbstoffe aus.'],
      ['Deo- und Schweißflecken', 'Paste aus Natron und Wasser oder Zitronensäurelösung einwirken lassen, dann waschen.'],
      ['Rost', 'Zitronensaft oder Zitronensäure einwirken lassen, gut ausspülen.'],
      ['Muttermilch, Babybrei', 'Kalt ausspülen, Gallseife. Gelbe Reste verblassen in der Sonne.']]],
  ] },
  { id: 'putzmittel', e: '🧴', t: 'Putzmittel-Guide', s: 'Was wofür – und was nie mischen', sec: [
    ['Die Grundausstattung', [
      ['Spülmittel / Allzweckreiniger', 'Für fast alle Flächen: Küche, Möbel, Böden. Wenig reicht.'],
      ['Essig / Zitronensäure (sauer)', 'Gegen Kalk in Bad, Küche, Wasserkocher. Zitronensäure nur kalt bis lauwarm anwenden.'],
      ['Natron / Soda (basisch)', 'Gegen Fett, Eingebranntes (Backofen) und Gerüche. Soda ist kräftiger – Handschuhe tragen.'],
      ['Scheuermilch', 'Für hartnäckigen Schmutz auf unempfindlichen Flächen (Emaille, Keramik). Nicht auf Ceranfeld, Acryl oder Hochglanz.'],
      ['WC-Reiniger', 'Nur fürs WC (stark sauer).'],
      ['Mikrofasertücher', 'Reinigen oft schon mit Wasser. Bei 60 °C ohne Weichspüler waschen.']]],
    ['Vorsicht', [
      ['Nie mischen!', 'Chlorhaltige Reiniger nie mit sauren Mitteln (WC-Reiniger, Essig, Entkalker) – es entsteht giftiges Chlorgas.'],
      ['Säure meiden', 'Kein Essig und keine Zitronensäure auf Naturstein (Marmor, Kalkstein), Fliesenfugen-Zement nur kurz. Gummidichtungen nicht dauerhaft damit behandeln.'],
      ['Desinfektion', 'Im normalen Haushalt nicht nötig – gründliches Reinigen reicht. Ausnahme: ansteckende Krankheit.'],
      ['Holz und Laminat', 'Nur nebelfeucht wischen, nie nass.'],
      ['Aufbewahrung', 'Putzmittel in Originalflaschen, hoch oder mit Kindersicherung lagern – gerade mit Kleinkind.']]],
    ['Effizient putzen', [
      ['Reihenfolge', 'Von oben nach unten, von trocken nach nass, vom Saubersten zum Schmutzigsten – das WC kommt zuletzt.'],
      ['Farben für Tücher', 'Gängig: Rot fürs WC, Gelb fürs übrige Bad, Grün für die Küche, Blau für Möbel und Fenster.'],
      ['Einwirken lassen', 'Reiniger erst auftragen, dann anderes erledigen, dann wischen – spart Kraft.'],
      ['Kleine Routinen', 'Täglich 10–15 Minuten verhindern den großen Putztag. Die Routinen hier helfen dabei.']]],
  ] },
  { id: 'kuehlschrank', e: '🧊', t: 'Kühlschrank & Lagerung', s: 'Was wohin, was nicht in den Kühlschrank', sec: [
    ['Die Zonen', [
      ['Oben (ca. 8 °C)', 'Käse, Reste, Geräuchertes, angebrochene Gläser.'],
      ['Mitte (ca. 5 °C)', 'Milchprodukte: Joghurt, Quark, Sahne.'],
      ['Unten auf der Glasplatte (2–3 °C)', 'Am kältesten: Fleisch, Fisch, Wurst.'],
      ['Gemüsefach', 'Gemüse, Salat, kälteverträgliches Obst.'],
      ['Tür (ca. 10 °C)', 'Getränke, Butter, Eier, Senf, Ketchup, Dressings.'],
      ['Temperatur', 'In der Mitte 5 °C oder kälter. Ein Kühlschrankthermometer lohnt sich.']]],
    ['Nicht in den Kühlschrank', [
      ['Kälteempfindlich', 'Tomaten, Gurken, Zucchini, Auberginen, Paprika (verlieren Aroma oder werden matschig), Bananen, Avocados (bis reif), Zitrusfrüchte.'],
      ['Kühl und dunkel lagern', 'Kartoffeln, Zwiebeln, Knoblauch – aber getrennt voneinander.'],
      ['Weitere', 'Brot (wird schneller altbacken), Basilikum (ins Wasserglas), Honig, Öl.'],
      ['Äpfel', 'Geben Reifegas ab: getrennt lagern, sonst reift anderes Obst und Gemüse schneller.']]],
    ['Reste & Haltbarkeit', [
      ['Reste', 'Zügig abkühlen lassen (höchstens 2 Stunden bei Zimmertemperatur), abgedeckt kühlen und in 2–3 Tagen essen. Reis und Nudeln besonders schnell kühlen.'],
      ['MHD', 'Mindesthaltbarkeitsdatum: danach oft noch gut – ansehen, riechen, probieren.'],
      ['Verbrauchsdatum', '„Zu verbrauchen bis“ (Hackfleisch, frischer Fisch): danach nicht mehr essen.'],
      ['Gefrieren (−18 °C)', 'Etwa: Brot 3 Monate, Gemüse 6–12, Obst 8–12, gekochte Gerichte 2–3, magerer Fisch 6, fetter Fisch 3 Monate. Beschriften mit Datum!'],
      ['Auftauen', 'Im Kühlschrank auftauen, nicht bei Zimmertemperatur. Aufgetautes nicht wieder einfrieren (außer nach dem Kochen).']]],
  ] },
  { id: 'muell', e: '♻️', t: 'Mülltrennung', s: 'Was in welche Tonne (Deutschland)', sec: [
    ['Die Tonnen', [
      ['Gelber Sack / Gelbe Tonne', 'Verpackungen aus Kunststoff, Metall und Verbund: Joghurtbecher, Konservendosen, Getränkekartons, Folien, Alu. Löffelrein reicht, nicht ausspülen.'],
      ['Papier', 'Zeitungen, Kartons (flach falten), Papiertüten. Nicht: Küchenpapier, Taschentücher, Kassenbons (Restmüll).'],
      ['Bio', 'Obst- und Gemüsereste, Kaffeesatz, Teebeutel, Eierschalen, Pflanzenreste. „Kompostierbare“ Plastiktüten sind oft nicht erlaubt.'],
      ['Glas', 'Nach Farben: weiß, braun, grün (blaues und andere farbige Glas zu Grün). Nur Flaschen und Gläser – kein Trinkglas, Porzellan oder Fensterglas.'],
      ['Restmüll', 'Windeln, Hygieneartikel, Staubsaugerbeutel, Kehricht, Asche, Kassenbons, Zahnbürsten und Spielzeug (keine Verpackungen).']]],
    ['Sonderfälle', [
      ['Batterien & Akkus', 'Sammelboxen im Handel oder Wertstoffhof – nie in den Hausmüll.'],
      ['Elektrogeräte', 'Wertstoffhof oder Rückgabe im Handel (große Händler nehmen kleine Geräte kostenlos zurück).'],
      ['Leuchtmittel', 'Energiesparlampen und LEDs: Sammelstellen im Handel oder Wertstoffhof.'],
      ['Medikamente', 'In vielen Kommunen Restmüll, sonst Apotheke oder Schadstoffmobil fragen. Nie in die Toilette.'],
      ['Pfand', 'Einwegflaschen und Dosen mit Pfandlogo: 25 Cent. Mehrweg zurück zum Händler.'],
      ['Regional', 'Die Regeln unterscheiden sich je nach Stadt – im Zweifel im Abfallkalender oder bei der Abfall-App der Kommune nachsehen.']]],
  ] },
  { id: 'lueften', e: '🌬️', t: 'Lüften & Heizen', s: 'Gesundes Raumklima, kein Schimmel', sec: [
    ['Lüften', [
      ['Stoßlüften', '3–4× täglich Fenster weit öffnen: im Winter 5 Minuten, in der Übergangszeit 10–15, im Sommer 25–30. Querlüften geht am schnellsten.'],
      ['Kein Dauerkipp', 'Gekippte Fenster im Winter kühlen die Wände aus – Energieverlust und Schimmelgefahr.'],
      ['Nach Duschen und Kochen', 'Sofort lüften, Badtür dabei schließen.'],
      ['Luftfeuchte', '40–60 % sind ideal. Ein Hygrometer zeigt, wann gelüftet werden sollte.'],
      ['Möbel', 'Schränke etwa 5–10 cm von Außenwänden abrücken, damit Luft zirkulieren kann.']]],
    ['Heizen', [
      ['Wohnzimmer', 'Etwa 20 °C.'],
      ['Schlafzimmer', '16–18 °C. Für Babys empfehlen Kinderärzte ebenfalls 16–18 °C beim Schlafen.'],
      ['Küche', 'Etwa 18 °C.'],
      ['Bad', 'Etwa 22 °C.'],
      ['Thermostat', 'Stufe 3 entspricht meist etwa 20 °C. Jedes Grad weniger spart rund 6 % Heizenergie.'],
      ['Heizkörper', 'Nicht zustellen oder mit Vorhängen verdecken. Gluckert er oder bleibt oben kalt: entlüften.']]],
  ] },
  { id: 'geraete', e: '⚙️', t: 'Gerätepflege & Entkalken', s: 'Damit Geräte lange halten', sec: [
    ['Entkalken', [
      ['Wasserkocher', '2 EL Zitronensäure auf 0,5 l lauwarmes Wasser (oder verdünnten Essig), einwirken lassen, ausspülen, einmal frisches Wasser aufkochen und weggießen.'],
      ['Kaffeemaschine', 'Am besten mit dem Entkalker des Herstellers (Garantie, Dichtungen). Bei hartem Wasser etwa monatlich.'],
      ['Duschkopf, Perlator', 'Über Nacht in Essig- oder Zitronensäurelösung, danach gut spülen.'],
      ['Wasserhärte', 'Beim Wasserversorger erfragen. Ab „hart“ öfter entkalken und Waschmittel höher dosieren.']]],
    ['Küche', [
      ['Spülmaschine', 'Sieb alle 1–2 Wochen ausspülen, Salz und Klarspüler nachfüllen, monatlich leer heiß laufen lassen.'],
      ['Backofen', 'Natronpaste über Nacht einwirken lassen, dann abwischen. Pyrolyse-Öfen: Reinigungsprogramm nutzen.'],
      ['Mikrowelle', 'Wasser mit Zitronensaft 5 Minuten erhitzen, Dampf einwirken lassen, auswischen.'],
      ['Kühlschrank', 'Monatlich auswischen, Ablaufloch freihalten, Gefrierfach bei Eisschicht abtauen.']]],
    ['Wäsche', [
      ['Waschmaschine', 'Monatlich ein 60–90 °C Leerwaschgang mit Vollwaschmittel. Tür und Einspülkasten nach dem Waschen offen lassen.'],
      ['Flusensieb', 'Alle paar Monate die Fremdkörperfalle unten reinigen (Schale und Handtuch bereitlegen).'],
      ['Trockner', 'Flusensieb nach jedem Durchgang leeren, Wärmetauscher bzw. Filter laut Anleitung reinigen.']]],
  ] },
];
const KNOW_BY = Object.fromEntries(KNOWLEDGE.map(k => [k.id, k]));
