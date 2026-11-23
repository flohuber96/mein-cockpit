'use strict';
/* ───────── Schwerpunkte (Trainingswege mit klarer Reihenfolge), Winseln & Frust, Regelkarten ───────── */
window.HUND = window.HUND || {};

/* ── Neue Übungen: Winseln aus Frust ── */
HUND.ex = HUND.ex.concat([
{ id: 'fr-ursache', c: 'problem', n: 'Winseln verstehen: Ursachen-Check', l: 1, d: '1 Woche beobachten',
  g: 'Du weißt, WARUM dein Hund winselt. Winseln ist Kommunikation – je nach Ursache ist die richtige Reaktion völlig verschieden.',
  m: ['Verhaltens-Tagebuch (Typ „Winseln“)'],
  s: ['Mögliche Ursachen: 1) Bedürfnis (muss sich lösen, Durst, friert), 2) Schmerz oder Unwohlsein, 3) Angst oder Stress (z. B. allein), 4) Frust und Erwartung („Ich will da hin / das haben – jetzt!“), 5) gelerntes Fordern (Winseln hat schon oft etwas gebracht).',
    'Notiere eine Woche lang jedes Winseln mit einem Tipp im Tagebuch: Wann? Was war direkt davor (Auslöser)? Was ist danach passiert (Konsequenz)? Fachleute nennen das ABC-Analyse.',
    'Prüfe zuerst die Bedürfnisse: Ist die letzte Löserunde lange her? Wasser da? Genug Bewegung, Schnüffeln und Ruhe gehabt?',
    'Tritt Winseln plötzlich neu auf, beim Hochheben, Aufstehen oder Hinlegen: an Schmerzen denken (bei Dackeln besonders an den Rücken) → Tierarzt.',
    'Winselt er, wenn du gehst oder die Tür schließt? Das deutet auf Stress beim Alleinsein → Schwerpunkt „Alleinbleiben“.',
    'Winselt er, wenn er etwas will und nicht bekommt (Futter wird zubereitet, Spiel endet, Tür zu, anderer Hund in Sicht)? Das ist Frust → Übungen „Stille belohnen“ und „Typische Frustmomente“.'],
  st: ['3 Tage beobachtet', '1 Woche beobachtet', 'Hauptauslöser erkannt', 'Plan je Auslöser steht'],
  k: 'Du kennst die 2–3 häufigsten Auslöser und weißt, ob es Frust, Bedürfnis oder Stress ist.',
  f: ['Jedes Winseln gleich behandeln', 'Schimpfen („Ruhe!“) – auch das ist Aufmerksamkeit', 'Echte Not (Lösen, Schmerz, Angst) ignorieren'],
  t: ['Bei Frust-Winseln gilt: Winseln darf sich nie lohnen – Stille immer.', 'Nachmittags vor der Löserunde winseln? Vielleicht ist es einfach Zeit – dann ist das berechtigt.'],
  r: 'Bracken sind „laut“ gezüchtet, Dackel melden gern. Lautäußerungen liegen deinem Mix im Blut – umso wichtiger ist, dass Ruhe sich mehr lohnt als Lärm.' },

{ id: 'fr-stille', c: 'impuls', n: 'Stille belohnen – bevor Winseln beginnt', l: 1, d: '3–5 Min', mt: ['Ruhig gewartet', 's'],
  g: 'Dein Hund lernt: Ruhig warten bringt mich ans Ziel, Winseln nicht. Fachbegriff: differenzielle Verstärkung – das Alternativverhalten (Ruhe) wird belohnt, das Problemverhalten (Winseln) läuft ins Leere.',
  m: ['Leckerli aus der Tagesration', 'ruhiger Marker („Schöön“)', 'Decke'],
  s: ['Wähle eine Situation, in der er typischerweise winselt (z. B. du bereitest das Futter vor).',
    'Belohne Ruhe, BEVOR er anfängt: Anfangs nach 2–3 Sekunden ruhigem Warten Marker und Leckerli (auf die Decke oder zwischen die Pfoten). Dann 5, 10, 20 Sekunden – mit Abwechslung.',
    'Winselt er doch: nicht ansprechen, nicht anschauen, nicht schimpfen – einfach neutral warten oder kurz innehalten.',
    'Sobald er 2 Sekunden still ist: ruhiger Marker, Belohnung – oder das, was er wollte (z. B. Napf runter).',
    'Mach die nächste Wiederholung leichter (kürzer), wenn er gewinselt hat. Ziel: Er soll möglichst oft Erfolg haben.',
    'Trage als Messwert die längste ruhige Wartezeit ein.'],
  st: ['3 Sekunden ruhig', '10 Sekunden', '30 Sekunden', '1 Minute', '3 Minuten', 'Im Alltag ohne Leckerli-Abstände'],
  k: '8 von 10 Durchgängen auf der aktuellen Dauer ganz ohne Winseln.',
  f: ['Nachgeben, wenn das Winseln lauter wird (dann lernt er: lauter lohnt sich)', 'Zu lange warten lassen – dann winselt er, bevor du belohnen kannst', 'Mit Aufregung belohnen'],
  t: ['Achtung „Extinktionsausbruch“: Wenn Winseln plötzlich nichts mehr bringt, wird es oft erst lauter und länger. Wer jetzt durchhält, hat gewonnen.', 'Ein Ankündigungssignal hilft: „Gleich“ = es kommt, aber erst nach Ruhe.'],
  r: '' },

{ id: 'fr-alltag', c: 'impuls', n: 'Typische Frustmomente üben', l: 2, d: '3–5 Min',
  g: 'Die Situationen, in denen dein Hund im Alltag winselt, werden gezielt und in kleinen Schritten geübt – bis sie keine Aufregung mehr auslösen.',
  m: ['Decke', 'Kauartikel', 'Leckerli'],
  s: ['Liste die 3–5 Frustmomente aus deinem Tagebuch auf. Typisch: Futter wird zubereitet, Tür zu / du im anderen Raum, Spielende, Warten vor dem Gassi, Besuch redet mit dir statt mit ihm.',
    'Mach jede Situation vorhersehbar: ein festes Signal für „Gleich“ (es kommt, aber erst nach Ruhe) und eins für „Fertig“ (jetzt ist Schluss).',
    'Biete eine Alternative an: Decke mit Kauartikel – Kauen hilft beim Aushalten.',
    'Übe die Situation absichtlich, ganz kurz: Futterdose anfassen – Ruhe belohnen – weglegen. Steigere Schritt für Schritt (Dose öffnen, Napf füllen …).',
    'Erst wenn eine Situation ruhig klappt, kommt die nächste dran.'],
  st: ['Futter zubereiten', 'Tür zu, du im Nachbarraum', 'Spielende mit „Fertig“', 'Warten vor dem Gassi', 'Du telefonierst / hast Besuch'],
  k: 'Er bleibt in der aktuellen Situation 4 von 5 Mal ruhig.',
  f: ['Mehrere Situationen gleichzeitig üben', 'Die „Gleich“-Ansage ohne Folge benutzen'],
  t: ['Frusttoleranz wächst durch viele kleine Erfolge – nicht durch große Enttäuschungen.'],
  r: '' },
]);

/* ── Tagebuch: Winseln als eigener Typ (für den Fortschritt) ── */
HUND.incTypes.splice(1, 0, { id: 'winseln', e: '🥺', n: 'Winseln / Fordern' });

/* ── Schwerpunkte: feste Reihenfolge = klarer Fortschritt ── */
HUND.programs = [
  { id: 'allein', e: '🏠', n: 'Alleinbleiben', goal: 'Entspannt bis zu 3–4 Stunden allein', slot: 'mittag', art: 'w-stress',
    ex: ['al-check', 'al-folgen', 'al-rituale', 'al-aufbau'], metric: { ex: 'al-aufbau', n: 'Längste Zeit entspannt allein', u: 'min', goal: 180 },
    tips: ['Nie länger allein lassen, als er schon kann – sonst Betreuung organisieren.', 'Bester Zeitpunkt: nach der Morgenrunde oder dem Mittags-Suchspiel – müde und satt.', 'Per Kamera zuschauen und zurückkommen, BEVOR er unruhig wird.', 'Gehen und Kommen ganz unaufgeregt. Kein Schimpfen nach dem Heimkommen.'] },
  { id: 'impuls', e: '⏸️', n: 'Impulskontrolle', goal: 'Wartet an Napf, Tür und Spielzeug – und lässt Dinge liegen', slot: 'morgen', art: 'w-stress',
    ex: ['im-napf', 'im-tuer', 'g-lassen', 'im-spielzeug', 'im-wechsel', 'g-bleib'],
    tips: ['Drei Mahlzeiten = drei Übungschancen: Napf nur bei Ruhe absenken.', 'Jede Tür ist eine Übung: erst Ruhe, dann Freigabe.', 'Impulskontrolle ist situationsbezogen – übe genau dort, wo du sie brauchst.', 'Kurz und leicht starten, dann steigern. Erfolg vor Schwierigkeit.'] },
  { id: 'frust', e: '🤫', n: 'Winseln & Frust', goal: 'Hält kleine Enttäuschungen ruhig aus, statt zu winseln', slot: 'nachmittag', art: 'w-winseln',
    ex: ['fr-ursache', 'fr-stille', 'im-frust', 'fr-alltag', 'ru-decke'], metric: { inc: 'winseln', n: 'Winsel-Momente pro Woche', u: '' },
    tips: ['Erst Ursache prüfen: Lösen? Durst? Schmerz? Angst?', 'Frust-Winseln nie belohnen – auch kein Anschauen oder „Pssst“.', 'Nach 2 Sekunden Stille: ruhiger Marker und Belohnung.', 'Ruhe belohnen, BEVOR er anfängt.'] },
  { id: 'leine', e: '🦮', n: 'Leinenführigkeit', goal: 'Lockere Leine auch mit Ablenkung', slot: 'gassi', art: 'w-ausruestung',
    ex: ['le-position', 'le-stopgo', 'le-schnueffel', 'le-richtung', 'le-ablenkung'], tips: ['Zug = stehen bleiben, lockere Leine = weiter.', 'Belohnung an der Hosennaht.', 'Schnüffeln als Belohnung nutzen.'] },
  { id: 'rueckruf', e: '📣', n: 'Rückruf', goal: 'Kommt zuverlässig – auch bei Ablenkung', slot: 'gassi', art: 'w-jagd',
    ex: ['rk-pfiff', 'rk-umorient', 'rk-hier', 'rk-griff', 'rk-checkin', 'rk-stopp'], tips: ['Nur rufen, wenn er sicher kommt.', 'Immer feiern – nie Ärger nach dem Kommen.', 'Schleppleine sichert, bis es trägt.'] },
  { id: 'jagd', e: '🦌', n: 'Jagdverhalten', goal: 'Bleibt bei Wild ansprechbar', slot: 'gassi', art: 'w-jagd',
    ex: ['ja-management', 'ja-sequenz', 'ja-anzeigen', 'ja-futterbeutel', 'ja-umorient'], tips: ['Management zuerst: Schleppleine am Geschirr.', 'Innehalten und Schauen groß belohnen.', 'Jagdersatz: Futterbeutel, Spuren lesen.'] },
  { id: 'begegnung', e: '🐕', n: 'Hundebegegnungen', goal: 'Entspannt an anderen Hunden vorbei', slot: 'gassi', art: 'w-emotion',
    ex: ['so-bogen', 'so-uturn', 'so-lat', 'so-kontakt', 'so-parallel'], tips: ['Früh ausweichen, Bogen laufen.', 'Kontakt nur kurz und nach Absprache.', 'Danach schnüffeln lassen.'] },
  { id: 'ruhe', e: '😌', n: 'Ruhe & Entspannung', goal: 'Kommt schnell zur Ruhe – zuhause und unterwegs', slot: 'abend', art: 'w-beduerfnisse',
    ex: ['ru-schlaf', 'ru-capturing', 'ru-decke', 'ru-runter', 'ru-draussen'], tips: ['Ruhe einfangen und belohnen.', 'Nach Action ein festes Runterfahr-Ritual.', 'Genug Schlaf ist die Basis.'] },
];

/* ── Challenges zu den Schwerpunkten (f = Schwerpunkt) ── */
HUND.challenges = HUND.challenges.concat([
  { id: 'fa1', c: 'training', l: 1, f: 'allein', n: '5 × Raumwechsel', t: 'Geh 5× kurz in einen anderen Raum und komm zurück, bevor er dir folgt oder unruhig wird. Ruhiges Liegenbleiben belohnen.' },
  { id: 'fa2', c: 'training', l: 1, f: 'allein', n: 'Kamera-Check', t: 'Eine Allein-Einheit auf deiner aktuellen Stufe – live per Kamera beobachten und Dauer eintragen.' },
  { id: 'fa3', c: 'training', l: 1, f: 'allein', n: 'Unaufgeregt gehen & kommen', t: 'Heute jedes Gehen und Heimkommen ganz neutral: kein Abschied, Begrüßung erst, wenn er ruhig ist.' },
  { id: 'fa4', c: 'training', l: 2, f: 'allein', n: 'Schlüssel ohne Folgen', t: '10× Schlüssel oder Jacke nehmen, ohne zu gehen. Er bleibt liegen? Super.' },
  { id: 'fi1', c: 'training', l: 1, f: 'impuls', n: 'Drei Mahlzeiten, drei Übungen', t: 'Bei allen 3 Mahlzeiten: Napf nur bei Ruhe absenken, Freigabe-Wort, dann fressen.' },
  { id: 'fi2', c: 'training', l: 1, f: 'impuls', n: 'Tür-Training', t: '5× an der Haus- oder Gartentür: Tür öffnet sich nur bei Ruhe, dann Freigabe.' },
  { id: 'fi3', c: 'training', l: 1, f: 'impuls', n: '„Deine Wahl“-Spiel', t: '3 Minuten: Leckerli in offener Hand – Abstand halten öffnet die Hand, Drängeln schließt sie.' },
  { id: 'fi4', c: 'training', l: 2, f: 'impuls', n: 'Lass-es-Parcours im Garten', t: 'Lege beim Mittags-Suchspiel 3 „verbotene“ Leckerli unter eine Schale – „Lass es“, Belohnung kommt von dir.' },
  { id: 'fi5', c: 'training', l: 2, f: 'impuls', n: 'Spielzeug-Wurf mit Warten', t: '5 Würfe – er wartet auf die Freigabe. Mal darf er hin, mal holst du es.' },
  { id: 'ff1', c: 'training', l: 1, f: 'frust', n: 'Winsel-Zähler', t: 'Trage heute jedes Winseln mit einem Tipp ein (Heute → Baustelle „Winseln & Frust“). Nur beobachten.' },
  { id: 'ff2', c: 'training', l: 1, f: 'frust', n: 'Stille-Jagd', t: '10× heute: Belohne ruhiges Warten in einem Moment, in dem er sonst winselt – BEVOR er anfängt.' },
  { id: 'ff3', c: 'training', l: 1, f: 'frust', n: 'Futter zubereiten in Ruhe', t: 'Bei jeder Mahlzeit: Er liegt auf der Decke, während du das Futter vorbereitest. Ruhe zwischendurch belohnen.' },
  { id: 'ff4', c: 'training', l: 2, f: 'frust', n: '„Fertig“ heißt fertig', t: 'Beende heute jedes Spiel mit „Fertig“ und leeren Händen – Winseln danach bringt nichts, Ruhe bringt einen Kauartikel.' },
  { id: 'ff5', c: 'training', l: 2, f: 'frust', n: 'Durchhalten', t: 'Wenn er heute fordernd winselt: nicht reagieren, auf 2 Sekunden Stille warten, dann freundlich zuwenden. Notiere, wie lange es dauerte.' },
]);

/* ── Regelkarten: kurz, klar, immer anwendbar ── */
HUND.cheats = [
  { id: 'hundekontakt', e: '🐕', n: 'Hundekontakt',
    yes: ['Erst den anderen Halter fragen – Kontakt nur, wenn beide Hunde locker wirken.', 'An der Leine höchstens 3 Sekunden schnuppern, dann „Weiter“ und Leckerli.', 'Leine locker lassen und nicht verheddern.', 'Unsicher? Bogen laufen oder Kehrtwende – „Nein danke, wir trainieren“ ist okay.', 'Danach kurz schnüffeln lassen (Stressabbau).'],
    no: ['Frontal aufeinander zulaufen lassen', 'Leine kurz und straff nehmen', 'Kontakt erzwingen oder „die regeln das schon“'] },
  { id: 'besuch', e: '🚪', n: 'Besuch',
    yes: ['Vorher: Gitter oder Leine bereit, Decke mit Kauartikel hingelegt.', 'Besuch ignoriert den Hund zuerst – kein Ansprechen, kein Anschauen.', 'Begrüßung erst, wenn er ruhig ist – vier Pfoten am Boden.', 'Danach: Decke mit Kauartikel, Ruhe belohnen.', 'Winseln oder Fordern beim Besuch nicht beachten.'],
    no: ['Aufgeregte Begrüßung an der Tür', 'Anspringen belohnen („Er freut sich doch“)', 'Hund zum Kontakt drängen'] },
  { id: 'gassi', e: '🦮', n: 'Gassi gehen',
    yes: ['Ruhiger Start: an der Tür warten bis zur Freigabe.', 'Lockere Leine = weiter, Zug = stehen bleiben.', 'Jeder freiwillige Blick zu dir wird belohnt.', 'Schnüffeln als Belohnung und als Grundrecht.', 'Wildgebiet: Schleppleine am Geschirr. Rückruf nur, wenn er sicher kommt.'],
    no: ['Leinenruck', 'Rufen, wenn er schon hetzt', 'Den ganzen Weg „Fuß“ verlangen'] },
  { id: 'allein', e: '🏠', n: 'Alleinbleiben',
    yes: ['Nie länger allein, als er schon entspannt kann – sonst Betreuung.', 'Gehen und Kommen ganz unaufgeregt.', 'Kurze Trainingsschritte, per Kamera beobachtet.', 'Am besten nach Spaziergang oder Suchspiel trainieren.', 'Rückschritt? Zwei Schritte zurück, wieder aufbauen.'],
    no: ['Schimpfen nach dem Heimkommen', 'Plötzlich stundenlang allein', 'Kauknochen, um Stress zu überdecken'] },
  { id: 'winseln', e: '🤫', n: 'Winseln & Fordern',
    yes: ['Erst Ursache prüfen: Muss er raus? Durst? Schmerzen? Angst?', 'Ist es Frust: nicht reagieren – kein Ansprechen, Anschauen, Schimpfen.', 'Nach 2 Sekunden Stille: ruhiger Marker und Belohnung.', 'Ruhe belohnen, BEVOR er anfängt.', 'Durchhalten: Erst wird es lauter, dann besser.'],
    no: ['Nachgeben, wenn es lauter wird', '„Ruhe!“ rufen – auch das ist Aufmerksamkeit', 'Echte Not ignorieren'] },
  { id: 'impuls', e: '⏸️', n: 'Warten & Impulskontrolle',
    yes: ['Napf nur bei Ruhe absenken, dann Freigabe.', 'Türen öffnen sich nur bei Ruhe.', 'Spiel mit Start- und Ende-Signal.', '„Lass es“: Belohnung kommt immer von dir.', 'Kurz und leicht starten – Erfolg vor Schwierigkeit.'],
    no: ['Ewig warten lassen', 'Signale wiederholen oder lauter werden'] },
  { id: 'futter', e: '🥣', n: 'Fütterung', dyn: true,
    yes: ['Futter abwiegen: {meals} Mahlzeiten à {g} g = {day} g pro Tag.', 'Trainings-Leckerli aus der Tagesration nehmen (z. B. 10–15 g abzweigen).', 'Mittags als Suchspiel, abends als Schleck- oder Futterspiel.', 'In Ruhe fressen lassen – Napf nie wegnehmen.'],
    no: ['Vom Tisch füttern', 'Leckerli zusätzlich zur Ration (Gewicht = Rücken!)'] },
  { id: 'garten', e: '🌳', n: 'Garten',
    yes: ['Suchspiele statt Toben.', 'Buddelecke erlauben.', 'Nicht unbeaufsichtigt bellen lassen (Zaun).', 'Giftpflanzen und Schneckenkorn entfernen.'],
    no: ['Zaunrennen mit Nachbarhunden', 'Stundenlang allein im Garten'] },
];

/* ── Wissen: Winseln ── */
HUND.wissen.push({ id: 'w-winseln', g: 'verhalten', e: '🤫', n: 'Winseln: Ursachen & was wirklich hilft', min: 4, sum: 'Bedürfnis, Schmerz, Angst oder Frust? Wie du die Ursache erkennst – und warum Durchhalten so wichtig ist.',
  b: ['Winseln ist eine Form der Kommunikation. Bevor du trainierst, finde heraus, was dein Hund dir sagen will.',
  '## Die fünf häufigsten Ursachen',
  '- **Bedürfnis:** muss sich lösen, hat Durst, friert, langweilt sich – dann ist Winseln berechtigt.',
  '- **Schmerz:** plötzlich neues Winseln, beim Hochheben oder Hinlegen – bei Dackeln an den Rücken denken. Tierarzt.',
  '- **Angst und Stress:** z. B. beim Alleinsein, bei Geräuschen. Hier hilft kein Ignorieren, sondern Training der Emotion.',
  '- **Frust und Erwartung:** Er will etwas und bekommt es nicht sofort (Futter, Spiel, Tür, anderer Hund).',
  '- **Gelerntes Fordern:** Winseln hat früher manchmal etwas gebracht – gelegentliche Belohnung macht es besonders hartnäckig.',
  '## Was bei Frust-Winseln hilft',
  '- **Bedürfnisse decken:** genug Schnüffeln, Bewegung, Ruhe und Kauen – ein ausgeglichener Hund winselt weniger.',
  '- **Winseln läuft ins Leere:** kein Ansprechen, Anschauen oder Schimpfen.',
  '- **Stille wird belohnt:** nach 2 Sekunden Ruhe – und schon vorher, bevor er anfängt (differenzielle Verstärkung).',
  '- **Vorhersehbarkeit:** feste Signale für „Gleich“ und „Fertig“, feste Abläufe.',
  '- **Frustmomente gezielt üben:** kurz, leicht, Schritt für Schritt.',
  '! Extinktionsausbruch: Wenn Winseln plötzlich nichts mehr bringt, wird es oft erst lauter und länger. Genau dann nicht nachgeben – sonst lernt er, dass sich lautes, langes Winseln lohnt.',
  '## Fortschritt messen',
  'Tippe jedes Winseln im Tagebuch an (Heute → Baustelle „Winseln & Frust“ → „Winseln notieren“). Nach 2–4 Wochen siehst du in der Auswertung, ob es weniger wird.',
  '> Bracken geben bei der Jagd Laut, Dackel melden gern – dein Mix ist von Natur aus „gesprächig“. Realistisches Ziel: deutlich weniger Fordern, kurze Meldungen sind okay.'] });

HUND.quiz.push(
  { id: 'q44', q: 'Dein Hund winselt fordernd, weil du sein Futter vorbereitest. Was hilft am meisten?', o: ['Nicht reagieren und nach 2 Sekunden Stille belohnen bzw. weitermachen', 'Sofort füttern, damit er aufhört', '„Ruhe!“ rufen'], a: 0, x: 'So lohnt sich Stille statt Winseln. Wer bei lautem Winseln nachgibt, belohnt genau das.' },
  { id: 'q45', q: 'Was ist ein „Extinktionsausbruch“ beim Winseln?', o: ['Das Winseln wird kurz lauter, wenn es plötzlich nichts mehr bringt', 'Der Hund hört sofort auf', 'Ein medizinischer Notfall'], a: 0, x: 'Ein gutes Zeichen, dass das Training wirkt – jetzt durchhalten.' },
);

/* ── Baustelle: Pferdemist & Aufnehmen unterwegs ── */
HUND.ex.push({ id: 'pf-plan', c: 'problem', n: 'Pferdeäpfel: Management & Ersatz', l: 1, d: 'beim Gassi', w: 1,
  g: 'Dein Hund frisst keinen Pferdemist mehr – weil er an Reitwegen gut gesichert ist, früh umgelenkt wird und sein „Finden“ an erlaubter Stelle ausleben darf.',
  m: ['kurze Leine an Reitwegen', 'Top-Leckerli', 'ggf. gut sitzender Korbmaulkorb'],
  s: ['Warum überhaupt? Kot von Pflanzenfressern zu fressen ist für viele Hunde normal und lecker – leider nicht harmlos: Pferdeäpfel können Parasiten enthalten, und kurz nach einer Entwurmung des Pferdes Rückstände von Wurmmitteln (z. B. Ivermectin), die für manche Hunde (MDR1-Defekt) gefährlich sind.',
    'Management zuerst: Auf Reitwegen und an Koppeln Leine kurz (2 m), auf der Seite der Äpfel gehst du. Jeder gefressene Apfel ist eine starke Belohnung und macht das Training schwerer.',
    'Früh umlenken: Siehst du einen Haufen voraus, BEVOR er ihn bemerkt oder fixiert: Umorientierungssignal, Futterspur in die andere Richtung oder Richtungswechsel.',
    'Lass es auf Pferdeäpfel übertragen: an der Leine mit Abstand vorbeigehen, Blick zu dir = Jackpot. Abstand Schritt für Schritt verringern.',
    'Erlaubtes Finden anbieten: Nach dem Vorbeigehen eine kleine Futtersuche im Gras – er darf ja suchen und fressen, nur das Richtige.',
    'Frisst er ständig alles auf: Korbmaulkorb (vorher positiv geübt) als sichere Übergangslösung. Kotprobe beim Tierarzt untersuchen lassen bzw. Entwurmungsrhythmus anpassen.'],
  st: ['Reitwege: Management steht', 'Vorbeigehen auf 5 m', 'Vorbeigehen auf 2 m', 'Lässt Haufen auf Signal liegen', 'An lockerer Leine entspannt vorbei'],
  k: '4 von 5 Haufen auf der aktuellen Stufe ohne Zugreifen.',
  f: ['Hinterherrennen oder ins Maul greifen (er schluckt schneller)', 'Schimpfen, wenn er schon frisst', 'Ohne Management üben'],
  t: ['Notiere jeden „Erfolg“ des Hundes im Tagebuch (Typ Pferdemist) – so siehst du, ob es weniger wird.', 'Vorbeugend: regelmäßige Kotproben bzw. Entwurmung nach Risiko (ESCCAP) – Mistfresser haben ein höheres Wurmrisiko.'],
  r: 'Dackel und Bracken sind echte Staubsauger. Bei deinem Mix ist Management an Reitwegen oft dauerhaft sinnvoll.' });
HUND.incTypes.splice(2, 0, { id: 'mist', e: '🐴', n: 'Pferdemist / Kot gefressen' });
(function () {
  HUND.programs.splice(3, 0, { id: 'mist', e: '🐴', n: 'Pferdemist & Aufnehmen', goal: 'Lässt Pferdeäpfel und Funde auf Signal liegen', slot: 'gassi', art: 'w-notfall',
    ex: ['pf-plan', 'rk-umorient', 'g-lassen', 'g-tausch', 'pr-kot', 'ha-maulkorb'], metric: { inc: 'mist', n: 'Mal gefressen pro Woche', u: '' },
    tips: ['Reitwege: Leine kurz, du gehst auf der Seite der Äpfel.', 'Umlenken, BEVOR er den Haufen fixiert.', 'Vorbeigehen = Jackpot, danach erlaubte Futtersuche.', 'Nie hinterherrennen – lieber Futterregen in die andere Richtung.'] });
  const l = HUND.programs.find(p => p.id === 'leine');
  l.metric = { walk: 'leash', n: 'Lockere Leine (Ø Sterne, 7 Tage)', u: '★' };
  l.goal = 'Lockere Leine – auch mit Ablenkung';
  l.tips = ['Zug = sofort stehen bleiben, lockere Leine = weiter. Jedes Mal.', 'Belohnung an der Hosennaht, anfangs alle paar Schritte.', 'Schnüffeln als Belohnung: „Geh schnüffeln“ nur bei lockerer Leine.', 'Geschirr statt Halsband, 2–3-m-Leine, keine Flexi.', 'Kein Training möglich (Eile)? Dann Schleppleine und Schnüffelrunde statt Ziehen-Üben.'];
  l.ex = ['le-position', 'le-stopgo', 'le-richtung', 'le-schnueffel', 'le-modi', 'le-ablenkung'];
})();
HUND.challenges.push(
  { id: 'fl1', c: 'gassi', l: 1, f: 'leine', n: 'Konsequent stehen bleiben', t: 'Heute die ganze Morgenrunde: Bei jedem Zug sofort stehen bleiben, bei lockerer Leine weiter. Zähle, wie oft du stoppen musstest.' },
  { id: 'fl2', c: 'gassi', l: 1, f: 'leine', n: '50 lockere Schritte', t: 'Belohne an der Hosennaht – Ziel: 50 Schritte am Stück mit lockerer Leine.' },
  { id: 'fl3', c: 'gassi', l: 1, f: 'leine', n: 'Schnüffeln verdienen', t: 'Jede Schnüffelstelle gibt es heute nur bei lockerer Leine („Geh schnüffeln“).' },
  { id: 'fl4', c: 'gassi', l: 2, f: 'leine', n: 'Richtungswechsel-Spiel', t: '10 Richtungswechsel mit „Hier lang“ – jeder lockere Wechsel wird belohnt.' },
  { id: 'fm1', c: 'gassi', l: 1, f: 'mist', n: 'Reitweg-Management', t: 'Auf Reitwegen heute: kurze Leine, du gehst auf der Seite der Äpfel, früh umlenken.' },
  { id: 'fm2', c: 'gassi', l: 1, f: 'mist', n: 'Vorbeigehen = Jackpot', t: '3× an einem Pferdeapfel mit Abstand vorbeigehen – Blick zu dir gibt einen Jackpot, danach eine kleine Futtersuche.' },
  { id: 'fm3', c: 'training', l: 1, f: 'mist', n: '„Lass es“ auffrischen', t: '10 Wiederholungen „Lass es“ auf deiner aktuellen Stufe – im Garten mit ausgelegtem Futter.' },
);
HUND.cheats.splice(3, 0, { id: 'mist', e: '🐴', n: 'Pferdemist & Funde',
  yes: ['Reitwege: Leine kurz, du gehst auf der Seite der Äpfel.', 'Früh umlenken – bevor er den Haufen fixiert.', '„Lass es“ – Belohnung kommt immer von dir, gern als Jackpot.', 'Danach erlaubte Futtersuche im Gras.', 'Viel Mist auf der Strecke? Korbmaulkorb als Übergang.'],
  no: ['Hinterherrennen oder ins Maul greifen', 'Schimpfen, wenn er schon frisst', 'Freilauf an Koppeln und Reitwegen'] });
HUND.cheats.find(c => c.id === 'gassi').yes.splice(1, 1, 'Leine: Zug = sofort stehen bleiben, lockere Leine = weiter. Jedes Mal, ohne Ausnahme.');
