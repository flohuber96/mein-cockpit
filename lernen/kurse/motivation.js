// Kurs: Motivation & Erfolg im Unternehmen
// Format siehe README.md im Ordner lernen/. IDs nicht mehr ändern – daran hängt der Lernfortschritt.
(window.COURSES = window.COURSES || []).push({
  id: 'motivation',
  title: 'Motivation & Erfolg im Unternehmen',
  emoji: '🚀',
  color: '#e8590c',
  short: 'Was Menschen antreibt – und wie daraus nachhaltiger Erfolg wird.',
  desc: 'Von den Grundlagen der Motivationspsychologie über Ziele, Kennzahlen und Anerkennung bis zu Unternehmenskultur und kontinuierlicher Verbesserung: Du lernst, ein Umfeld zu schaffen, in dem Menschen gern Leistung bringen – dauerhaft und ohne auszubrennen.',
  level: 'Einsteiger bis Fortgeschritten',
  duration: 'ca. 4 h',
  goals: [
    'Die wichtigsten Motivationstheorien verstehen und anwenden',
    'Intrinsische Motivation fördern statt zerstören',
    'Ziele, OKR und Kennzahlen sinnvoll einsetzen',
    'Engagement messen und Anerkennung wirksam geben',
    'Kultur und Sinn als Erfolgsfaktoren gestalten',
    'Leistung nachhaltig sichern – ohne Burnout',
  ],
  finalCount: 18,
  chapters: [
    /* ───────────── Kapitel 1 ───────────── */
    {
      id: 'k1',
      title: 'Grundlagen der Motivation',
      intro: 'Was bringt Menschen dazu, sich anzustrengen? Dieses Kapitel legt das Fundament: intrinsische und extrinsische Motivation sowie die beiden Klassiker Maslow und Herzberg.',
      lessons: [
        {
          id: 'k1a', title: 'Intrinsisch und extrinsisch', min: 7,
          text: `## Was ist Motivation?
Motivation ist die Summe der Beweggründe, die unser Verhalten **auslösen, ausrichten und aufrechterhalten**. Sie beantwortet die Fragen: Warum fange ich an? Wohin richte ich meine Energie? Und warum bleibe ich dran?

## Zwei Quellen
| | Intrinsische Motivation | Extrinsische Motivation |
|---|---|---|
| **Quelle** | Die Tätigkeit selbst | Folgen der Tätigkeit |
| **Beispiele** | Neugier, Freude am Tüfteln, Stolz auf gute Arbeit | Gehalt, Bonus, Lob, Beförderung, Vermeidung von Strafe |
| **Stärke** | Ausdauernd, kreativ, selbstgesteuert | Schnell wirksam, gut steuerbar |
| **Schwäche** | Nicht direkt „anordenbar“ | Wirkt oft nur, solange der Anreiz besteht |

## Kein Entweder-oder
Fast jede Arbeit hat beide Anteile. Eine Ingenieurin kann Freude an der Lösung eines Problems haben (intrinsisch) *und* sich über den Bonus freuen (extrinsisch). Extrinsische Ziele können auch **verinnerlicht** werden: Wer versteht, warum ein Prüfprotokoll wichtig ist, füllt es aus Überzeugung aus – nicht nur, weil es Pflicht ist.

## Kann man andere motivieren?
Streng genommen: nein. Motivation entsteht in der Person. Was Führung kann:
- **Demotivation vermeiden** (unfaire Behandlung, sinnlose Aufgaben, fehlende Information).
- **Bedingungen schaffen**, in denen Motivation entstehen kann (Sinn, Freiraum, Entwicklung, Anerkennung).
- **Passende Aufgaben** finden, die zu Stärken und Interessen passen.

MERKE: Du kannst Menschen nicht „motivieren“ wie eine Maschine einschalten – aber du kannst Bedingungen schaffen, in denen sie sich selbst motivieren, und Demotivation konsequent vermeiden.

REFLEXION: Welche Teile deiner Arbeit machst du, weil du sie gern machst – und welche nur wegen der Konsequenzen?`,
        },
        {
          id: 'k1b', title: 'Die Bedürfnispyramide nach Maslow', min: 6,
          text: `## Fünf Bedürfnisebenen
Abraham Maslow ordnete menschliche Bedürfnisse 1943 in einer Hierarchie an – heute meist als Pyramide dargestellt:

1. **Physiologische Bedürfnisse:** Essen, Schlaf, Wärme – im Job: existenzsicherndes Einkommen, Pausen.
2. **Sicherheit:** Schutz, Stabilität – im Job: sicherer Arbeitsplatz, Arbeitsschutz, verlässliche Regeln.
3. **Soziale Bedürfnisse:** Zugehörigkeit – im Job: gutes Team, Kollegialität, Teil von etwas sein.
4. **Wertschätzung (Individualbedürfnisse):** Anerkennung, Status, Respekt – im Job: Lob, Titel, Verantwortung.
5. **Selbstverwirklichung:** Potenzial entfalten – im Job: sinnvolle, herausfordernde Aufgaben, Gestaltungsspielraum.

Die unteren vier nannte Maslow **Defizitbedürfnisse** (ihr Fehlen erzeugt Mangel), die Selbstverwirklichung ein **Wachstumsbedürfnis** (es wird nie ganz „gestillt“).

## Was man daraus lernen kann
- Wer um seinen Arbeitsplatz fürchtet, lässt sich schwer mit Sinn und Selbstverwirklichung begeistern. **Grundlagen zuerst.**
- Menschen stehen an unterschiedlichen Punkten: Für den einen ist Sicherheit gerade zentral, für die andere Entwicklung.

## Kritik
Die strenge Stufenfolge ist empirisch **nicht belegt**: Menschen streben oft gleichzeitig nach mehreren Bedürfnissen, und die Gewichtung unterscheidet sich je nach Kultur und Person. Als **Denkmodell** ist die Pyramide trotzdem hilfreich, um zu fragen: Welches Bedürfnis ist bei dieser Person gerade unerfüllt?

MERKE: Maslow erinnert daran, dass grundlegende Bedürfnisse (Einkommen, Sicherheit, Zugehörigkeit) erfüllt sein müssen, bevor höhere Motive voll wirken. Die starre Hierarchie gilt aber als überholt.

REFLEXION: Welches Bedürfnis steht bei dir gerade im Vordergrund – und bei deinen Teammitgliedern?`,
        },
        {
          id: 'k1c', title: 'Herzbergs Zwei-Faktoren-Theorie', min: 8,
          text: `## Zufriedenheit und Unzufriedenheit sind keine Gegensätze
Frederick Herzberg befragte in den 1950ern Ingenieure und Buchhalter, wann sie sich bei der Arbeit besonders gut oder schlecht gefühlt hatten. Das Ergebnis: **Unterschiedliche Faktoren** verursachen Zufriedenheit und Unzufriedenheit.

| Hygienefaktoren | Motivatoren |
|---|---|
| Gehalt und Sozialleistungen | Leistung und Erfolgserlebnisse |
| Arbeitsbedingungen | Anerkennung |
| Unternehmenspolitik und Verwaltung | Die Arbeit selbst (Inhalt) |
| Beziehung zu Vorgesetzten und Kollegen | Verantwortung |
| Arbeitsplatzsicherheit | Aufstieg und Entwicklung |

## Die Kernaussage
- **Hygienefaktoren** verhindern Unzufriedenheit, wenn sie stimmen. Sie erzeugen aber **keine** echte Motivation. Fehlen sie, entsteht Unzufriedenheit.
- **Motivatoren** erzeugen Zufriedenheit und Engagement. Sie hängen vor allem mit dem **Arbeitsinhalt** zusammen.
- Das Gegenteil von Unzufriedenheit ist also nicht Zufriedenheit, sondern **Nicht-Unzufriedenheit**.

## Was heißt das für die Praxis?
1. **Hygiene sichern:** Faires Gehalt, funktionierende Werkzeuge, klare Regeln, respektvoller Umgang. Wenn hier etwas hakt, verpufft jede Motivationsmaßnahme.
2. **Dann Motivatoren stärken:** Verantwortung übertragen, Erfolge sichtbar machen, interessante Aufgaben, Entwicklungswege.
3. **Gehaltserhöhung ist kein Dauer-Motivator:** Sie beseitigt Unzufriedenheit, der Effekt auf Engagement verfliegt aber meist schnell.

BEISPIEL: Ein Prüftechniker arbeitet mit veralteter Messsoftware, die ständig abstürzt (Hygienefaktor). Ein Lob für seine Arbeit (Motivator) wird ihn kaum begeistern, solange der tägliche Ärger bleibt. Erst Software reparieren – dann wirkt Anerkennung.

MERKE: Hygienefaktoren verhindern Unzufriedenheit, Motivatoren erzeugen Engagement. Beides ist nötig – aber Motivation kommt vor allem aus Arbeitsinhalt, Verantwortung, Erfolg und Anerkennung.

REFLEXION: Welcher Hygienefaktor nervt in deinem Team gerade am meisten – und könntest du ihn beseitigen?`,
        },
      ],
      quiz: [
        { q: 'Was kennzeichnet intrinsische Motivation?', o: ['Sie kommt aus der Tätigkeit selbst', 'Sie entsteht durch Bonuszahlungen', 'Sie entsteht durch Angst vor Strafe', 'Sie wirkt nur kurzfristig'], a: 0, x: 'Intrinsisch motiviert ist, wer etwas um der Sache willen tut – aus Neugier, Freude oder Stolz auf gute Arbeit.' },
        { q: 'Was kann eine Führungskraft in Bezug auf Motivation realistisch tun?', o: ['Demotivation vermeiden', 'Bedingungen schaffen, in denen Motivation entstehen kann', 'Motivation direkt „anordnen“', 'Aufgaben finden, die zu Stärken und Interessen passen'], a: [0, 1, 3], x: 'Motivation entsteht in der Person. Führung kann Demotivation vermeiden, gute Bedingungen schaffen und passende Aufgaben finden – anordnen lässt sie sich nicht.' },
        { q: 'Welche Ebene steht an der Spitze von Maslows Bedürfnispyramide?', o: ['Sicherheit', 'Soziale Bedürfnisse', 'Wertschätzung', 'Selbstverwirklichung'], a: 3, x: 'Die Reihenfolge: physiologische Bedürfnisse, Sicherheit, soziale Bedürfnisse, Wertschätzung, Selbstverwirklichung.' },
        { q: 'Was ist der wichtigste Kritikpunkt an Maslows Modell?', o: ['Es berücksichtigt keine Bedürfnisse', 'Die strenge Stufenfolge ist empirisch nicht belegt', 'Es ist zu neu, um bewertet zu werden', 'Es gilt nur für Führungskräfte'], a: 1, x: 'Menschen streben oft gleichzeitig nach mehreren Bedürfnissen; die strikte Hierarchie wurde empirisch nicht bestätigt. Als Denkmodell bleibt es nützlich.' },
        { q: 'Welche Faktoren sind nach Herzberg Hygienefaktoren?', o: ['Gehalt', 'Arbeitsbedingungen', 'Verantwortung', 'Anerkennung'], a: [0, 1], x: 'Gehalt und Arbeitsbedingungen sind Hygienefaktoren. Verantwortung und Anerkennung gehören zu den Motivatoren.' },
        { q: 'Was passiert laut Herzberg, wenn die Hygienefaktoren gut erfüllt sind?', o: ['Mitarbeitende sind hoch motiviert', 'Es entsteht keine Unzufriedenheit – aber auch keine echte Motivation', 'Die Motivatoren werden überflüssig', 'Die Leistung steigt dauerhaft'], a: 1, x: 'Gute Hygienefaktoren führen zu „Nicht-Unzufriedenheit“. Echte Motivation entsteht durch Motivatoren wie Arbeitsinhalt, Verantwortung und Erfolg.' },
        { q: 'Eine Gehaltserhöhung ist nach Herzberg ein dauerhafter Motivator.', o: ['Richtig', 'Falsch'], a: 1, fix: true, x: 'Falsch. Gehalt ist ein Hygienefaktor: Es beseitigt Unzufriedenheit, der motivierende Effekt verfliegt aber meist schnell.' },
      ],
    },

    /* ───────────── Kapitel 2 ───────────── */
    {
      id: 'k2',
      title: 'Was Menschen wirklich antreibt',
      intro: 'Die moderne Motivationsforschung zeigt: Autonomie, Kompetenz und Zugehörigkeit sind zentrale Treiber. Und Belohnungen können Motivation sogar zerstören – wenn man sie falsch einsetzt.',
      lessons: [
        {
          id: 'k2a', title: 'Selbstbestimmungstheorie', min: 8,
          text: `## Drei psychologische Grundbedürfnisse
Die **Selbstbestimmungstheorie** von Edward Deci und Richard Ryan ist eine der am besten untersuchten Motivationstheorien. Sie besagt: Menschen sind dann motiviert, engagiert und gesund, wenn drei Grundbedürfnisse erfüllt sind.

| Bedürfnis | Bedeutung | Im Arbeitsalltag fördern |
|---|---|---|
| **Autonomie** | Selbst entscheiden, wie und wann ich etwas tue | Ergebnis vorgeben, Weg offenlassen; Mitsprache bei Planung |
| **Kompetenz** | Mich als fähig und wirksam erleben | Passende Herausforderungen, Weiterbildung, Feedback zu Fortschritten |
| **Soziale Eingebundenheit** | Mich zugehörig und verbunden fühlen | Teamgeist, Wertschätzung, echtes Interesse an der Person |

## Autonomie heißt nicht: allein lassen
Autonomie bedeutet **Wahlfreiheit und Mitbestimmung**, nicht fehlende Struktur. Ein klarer Rahmen („Bis Freitag brauchen wir eine Lösung für das Prüfmittelproblem, Budget X“) plus Freiheit im Weg ist ideal.

## Vom Müssen zum Wollen
Die Theorie unterscheidet mehrere Stufen extrinsischer Motivation – von „Ich muss, sonst gibt’s Ärger“ bis „Ich mache das, weil es mir wichtig ist“. Je mehr eine Aufgabe **verinnerlicht** ist, desto stabiler und qualitativ besser ist die Leistung. Verinnerlichung entsteht vor allem, wenn:
- der **Sinn** erklärt wird,
- die Person **mitreden** darf,
- ihre Gefühle (auch Unlust) **anerkannt** werden.

## „Drive“ – die populäre Version
Daniel Pink fasste die Forschung in seinem Buch „Drive“ zusammen: Für anspruchsvolle Wissensarbeit sind **Autonomie, Meisterschaft (Mastery) und Sinn (Purpose)** die stärksten Antriebe.

MERKE: Menschen sind motiviert, wenn sie Autonomie, Kompetenz und Zugehörigkeit erleben. Gib einen klaren Rahmen, erkläre den Sinn – und lass Freiraum im Weg.

REFLEXION: Welches der drei Grundbedürfnisse kommt in deinem Job (oder Team) aktuell zu kurz?`,
        },
        {
          id: 'k2b', title: 'Erwartung, Wert und Motive', min: 7,
          text: `## Die VIE-Theorie nach Vroom
Victor Vroom erklärte 1964 Motivation als Produkt aus drei Faktoren:

**Motivation = Valenz × Instrumentalität × Erwartung**

- **Erwartung:** Glaube ich, dass meine Anstrengung zu guter Leistung führt? („Kann ich das schaffen?“)
- **Instrumentalität:** Glaube ich, dass gute Leistung zu einem Ergebnis führt? („Wird meine Leistung überhaupt bemerkt und belohnt?“)
- **Valenz:** Wie wichtig ist mir dieses Ergebnis? („Will ich das überhaupt?“)

Weil die Faktoren **multipliziert** werden, gilt: Ist einer davon null, ist die Motivation null – egal wie hoch die anderen sind.

BEISPIEL: Ein Bonus für Null-Fehler-Lieferungen (hohe Valenz) motiviert nicht, wenn das Team glaubt, das Ziel wegen schlechter Zulieferteile ohnehin nicht erreichen zu können (Erwartung ≈ 0).

## Was Führung daraus ableiten kann
| Faktor | Hebel |
|---|---|
| Erwartung | Ziele erreichbar machen, Ressourcen und Training bereitstellen, Hindernisse beseitigen |
| Instrumentalität | Zusagen einhalten, Leistung sichtbar machen und fair honorieren |
| Valenz | Herausfinden, was der Person wichtig ist – nicht jedem ist das Gleiche wichtig |

## Die drei Motive nach McClelland
David McClelland beschrieb drei grundlegende Motive, die bei Menschen unterschiedlich stark ausgeprägt sind:
- **Leistungsmotiv:** Freude daran, Dinge besser zu machen, Herausforderungen zu meistern.
- **Machtmotiv:** Wunsch, Einfluss zu nehmen und andere zu bewegen.
- **Zugehörigkeitsmotiv:** Wunsch nach guten Beziehungen und Harmonie.

Wer weiß, welches Motiv bei einer Person dominiert, kann Aufgaben und Anerkennung besser zuschneiden: Die Leistungsorientierte freut sich über eine knifflige Aufgabe, der Zugehörigkeitsorientierte über ein Teamprojekt.

MERKE: Motivation braucht drei Dinge gleichzeitig: Ich kann es schaffen, es lohnt sich, und das Ergebnis ist mir wichtig. Fehlt eins, bricht die Motivation ein.

REFLEXION: Welches Motiv – Leistung, Macht oder Zugehörigkeit – treibt dich am stärksten an?`,
        },
        {
          id: 'k2c', title: 'Belohnungen richtig einsetzen', min: 8,
          text: `## Der Korrumpierungseffekt
In einem berühmten Experiment ließ Edward Deci (1971) Studierende knifflige Puzzles lösen. Eine Gruppe bekam Geld pro gelöstem Puzzle, die andere nicht. Als die Bezahlung wegfiel, beschäftigte sich die bezahlte Gruppe in der freien Zeit **weniger** mit den Puzzles als die unbezahlte.

Das ist der **Korrumpierungseffekt** (auch Überveranwortungseffekt): Erwartete, an Bedingungen geknüpfte Belohnungen können die **intrinsische Motivation** für eine eigentlich interessante Tätigkeit verdrängen. Aus „Ich mache es, weil es spannend ist“ wird „Ich mache es für das Geld“.

## Wann Belohnungen schaden – und wann nicht
| Eher schädlich | Eher unproblematisch oder hilfreich |
|---|---|
| „Wenn-dann“-Belohnungen für interessante, kreative Aufgaben | Belohnungen für Routinearbeiten ohne Eigenreiz |
| Belohnungen, die als Kontrolle erlebt werden | Unerwartete Anerkennung nach getaner Arbeit |
| Enge Kennzahlen-Boni für komplexe Arbeit | Konkretes, ehrliches verbales Feedback |
| Wettbewerb, bei dem Kollegen zu Gegnern werden | Faires Grundgehalt, das das Thema Geld „vom Tisch“ nimmt |

## Nebenwirkungen enger Anreizsysteme
- **Tunnelblick:** Es wird nur noch getan, was belohnt wird.
- **Kurzfristdenken:** Quartalsziel schlägt langfristige Qualität.
- **Manipulation:** Zahlen werden „passend gemacht“ statt Leistung verbessert.

BEISPIEL: Werden Prüfer nach der Anzahl geprüfter Teile pro Stunde bezahlt, steigt die Stückzahl – und die Gründlichkeit sinkt. Genau das Gegenteil dessen, was Qualitätsprüfung soll.

## Was stattdessen gut funktioniert
1. **Faire, marktgerechte Bezahlung**, damit Geld kein ständiges Thema ist.
2. **Anerkennung statt Anreiz:** Gute Arbeit im Nachhinein würdigen statt vorher Prämien auszuloben.
3. **Teamziele** statt Einzelwettbewerb, wenn Zusammenarbeit wichtig ist.
4. **Sinn und Autonomie** als Antrieb für komplexe Aufgaben.

ACHTUNG: Das heißt nicht, dass Geld unwichtig ist! Unfaire Bezahlung demotiviert massiv (Hygienefaktor). Es geht darum, wie variable Anreize gestaltet werden.

MERKE: Erwartete „Wenn-dann“-Belohnungen können intrinsische Motivation verdrängen – vor allem bei interessanten, komplexen Aufgaben. Besser: faire Grundvergütung, unerwartete Anerkennung, Sinn und Freiraum.

REFLEXION: Gibt es in deinem Unternehmen ein Anreizsystem, das unerwünschtes Verhalten fördert?`,
        },
      ],
      quiz: [
        { q: 'Welche drei Grundbedürfnisse nennt die Selbstbestimmungstheorie (Deci & Ryan)?', o: ['Autonomie, Kompetenz, soziale Eingebundenheit', 'Sicherheit, Geld, Status', 'Leistung, Macht, Zugehörigkeit', 'Sinn, Spaß, Freizeit'], a: 0, x: 'Autonomie, Kompetenz und soziale Eingebundenheit. Leistung, Macht und Zugehörigkeit sind die Motive nach McClelland.' },
        { q: 'Was bedeutet Autonomie im Sinne der Selbstbestimmungstheorie?', o: ['Keine Vorgaben und kein Rahmen', 'Wahlfreiheit und Mitbestimmung innerhalb eines klaren Rahmens', 'Alleine arbeiten ohne Team', 'Selbst das Gehalt bestimmen'], a: 1, x: 'Autonomie heißt Wahlfreiheit und Mitsprache – nicht Abwesenheit von Struktur. Ideal: klarer Rahmen und Ziel, Freiheit im Weg.' },
        { q: 'Nach Vroom gilt: Motivation = Valenz × Instrumentalität × Erwartung. Was folgt aus der Multiplikation?', o: ['Ein hoher Wert gleicht einen niedrigen aus', 'Ist ein Faktor null, ist die Motivation null', 'Die Erwartung ist der wichtigste Faktor', 'Valenz ist immer konstant'], a: 1, x: 'Durch die Multiplikation wird alles null, wenn ein Faktor null ist – z. B. wenn jemand glaubt, das Ziel ohnehin nicht erreichen zu können.' },
        { q: 'Ein Team glaubt, dass gute Leistung von der Geschäftsleitung ohnehin nicht bemerkt wird. Welcher VIE-Faktor ist niedrig?', o: ['Valenz', 'Instrumentalität', 'Erwartung', 'Keiner'], a: 1, x: 'Instrumentalität beschreibt den Zusammenhang zwischen Leistung und Ergebnis/Belohnung. Wenn Leistung „nichts bringt“, ist sie niedrig.' },
        { q: 'Was beschreibt der Korrumpierungseffekt?', o: ['Belohnungen erhöhen immer die Motivation', 'Erwartete Belohnungen können intrinsische Motivation für interessante Aufgaben verdrängen', 'Korrupte Führungskräfte demotivieren', 'Geld ist unwichtig für Motivation'], a: 1, x: 'Werden interessante Tätigkeiten an „Wenn-dann“-Belohnungen geknüpft, kann die intrinsische Motivation sinken – sie wird durch eine extrinsische ersetzt.' },
        { q: 'Welche Formen der Anerkennung gefährden die intrinsische Motivation in der Regel NICHT?', o: ['Unerwartete Anerkennung nach getaner Arbeit', 'Konkretes, ehrliches verbales Feedback', 'Enge Stückzahl-Boni für komplexe Prüfarbeit', 'Eine faire, marktgerechte Grundvergütung'], a: [0, 1, 3], x: 'Unerwartete Anerkennung, ehrliches Feedback und faire Grundvergütung sind unproblematisch. Enge Kennzahlen-Boni für komplexe Arbeit fördern Tunnelblick und Qualitätsverlust.' },
        { q: 'Welche Motive unterscheidet McClelland?', o: ['Leistung, Macht, Zugehörigkeit', 'Hunger, Durst, Schlaf', 'Autonomie, Kompetenz, Eingebundenheit', 'Sicherheit, Status, Geld'], a: 0, x: 'McClelland unterscheidet Leistungs-, Macht- und Zugehörigkeitsmotiv – unterschiedlich stark ausgeprägt bei verschiedenen Menschen.' },
      ],
    },

    /* ───────────── Kapitel 3 ───────────── */
    {
      id: 'k3',
      title: 'Ziele, OKR & Kennzahlen',
      intro: 'Ziele sind einer der stärksten Leistungshebel überhaupt – wenn sie richtig gesetzt werden. Hier lernst du die Forschung dahinter, die OKR-Methode und den klugen Umgang mit Kennzahlen.',
      lessons: [
        {
          id: 'k3a', title: 'Die Zielsetzungstheorie', min: 7,
          text: `## Konkrete, herausfordernde Ziele wirken
Edwin Locke und Gary Latham haben über Jahrzehnte Hunderte Studien ausgewertet. Ihr zentrales Ergebnis: **Spezifische und anspruchsvolle Ziele** führen zu deutlich höherer Leistung als vage Ziele wie „Gib dein Bestes“.

## Warum Ziele wirken
- Sie **lenken die Aufmerksamkeit** auf das Wesentliche.
- Sie **mobilisieren Anstrengung** – schwierigere Ziele, mehr Einsatz.
- Sie erhöhen die **Ausdauer**.
- Sie regen dazu an, **Strategien** zu entwickeln.

## Wann Ziele wirken – die Bedingungen
1. **Commitment:** Die Person muss hinter dem Ziel stehen. Beteiligung und das Erklären des Sinns helfen.
2. **Feedback:** Ohne Rückmeldung zum Fortschritt verlieren Ziele ihre Kraft.
3. **Fähigkeit:** Das Ziel muss mit den vorhandenen Fähigkeiten grundsätzlich erreichbar sein.
4. **Aufgabenkomplexität:** Bei sehr komplexen, neuen Aufgaben sind **Lernziele** („Finde drei Wege, um …“) oft besser als harte Ergebnisziele.

## Zu schwer ist auch falsch
Die Leistung steigt mit der Schwierigkeit – aber nur, solange das Ziel als **erreichbar** gilt. Unrealistische Ziele führen zu Resignation („Schaffen wir sowieso nicht“) oder zu Abkürzungen und Manipulation.

TIPP: Verbinde jedes größere Ziel mit regelmäßigen, kurzen Fortschritts-Checks (z. B. alle zwei Wochen fünf Minuten im 1:1). Feedback ist der Verstärker der Zielwirkung.

MERKE: Konkrete, herausfordernde und akzeptierte Ziele mit regelmäßigem Feedback steigern die Leistung. Bei neuen, komplexen Aufgaben helfen Lernziele mehr als starre Ergebnisziele.

REFLEXION: Welches deiner aktuellen Ziele ist eher ein „Gib dein Bestes“ – und wie würde eine konkrete Version lauten?`,
        },
        {
          id: 'k3b', title: 'OKR – Objectives & Key Results', min: 8,
          text: `## Herkunft
OKR wurde in den 1970ern von Andy Grove bei Intel entwickelt und später von John Doerr bei Google eingeführt. Heute nutzen viele Unternehmen OKR, um Fokus und Ausrichtung zu schaffen.

## Aufbau
- **Objective (Ziel):** Qualitativ, inspirierend, verständlich. *Wohin wollen wir?*
- **Key Results (Schlüsselergebnisse):** 2–5 messbare Ergebnisse. *Woran erkennen wir, dass wir dort angekommen sind?*

BEISPIEL: Objective: „Unsere Kunden vertrauen blind auf unsere Lieferqualität.“ Key Results: 1) Reklamationsquote sinkt von 120 auf 50 ppm. 2) Alle A-Lieferanten haben ein Prozessaudit mit mindestens 85 % bestanden. 3) Durchlaufzeit für 8D-Reports sinkt von 30 auf 15 Tage.

## Prinzipien
| Prinzip | Bedeutung |
|---|---|
| **Fokus** | Wenige OKR (meist 3–5 Objectives) pro Zeitraum |
| **Kurze Zyklen** | Typischerweise quartalsweise, mit regelmäßigen Check-ins |
| **Transparenz** | OKR sind für alle sichtbar – auch die der Geschäftsführung |
| **Ambition** | Bei ehrgeizigen OKR gilt eine Zielerreichung von etwa 70 % schon als Erfolg |
| **Bottom-up-Anteil** | Teams formulieren einen Teil ihrer OKR selbst |
| **Entkopplung vom Gehalt** | Damit Ziele ambitioniert statt „sicher“ gesetzt werden |

## Key Results sind Ergebnisse, keine Aufgaben
Ein häufiger Fehler: „Schulung durchführen“ ist eine **Aktivität**. Ein Key Result beschreibt ein **Ergebnis**: „Fehlerquote bei der Wareneingangsprüfung sinkt um 30 %.“ Die Schulung ist dann eine von mehreren möglichen Maßnahmen.

## Grenzen
OKR ersetzen nicht das Tagesgeschäft und eignen sich schlecht, um jede Routine zu steuern. Und: Ohne regelmäßige Check-ins werden sie zu einem weiteren Formular, das am Quartalsende ausgefüllt wird.

MERKE: OKR verbinden ein inspirierendes Ziel mit wenigen messbaren Ergebnissen, in kurzen Zyklen und transparent für alle. Key Results messen Wirkung, nicht Aktivität.

REFLEXION: Formuliere ein Objective für deinen Bereich für das nächste Quartal – und zwei Key Results, die echte Ergebnisse messen.`,
        },
        {
          id: 'k3c', title: 'Kennzahlen klug nutzen', min: 8,
          text: `## Was gemessen wird, wird gemacht
Kennzahlen (KPIs – Key Performance Indicators) machen Leistung sichtbar, ermöglichen Vergleiche und frühes Gegensteuern. Gleichzeitig verändern sie Verhalten – nicht immer so, wie gewünscht.

## Früh- und Spätindikatoren
| Spätindikatoren (lagging) | Frühindikatoren (leading) |
|---|---|
| Zeigen das Ergebnis im Nachhinein | Zeigen früh, wohin es geht |
| z. B. Kundenreklamationen, Umsatz, Unfallzahlen | z. B. Anteil erfüllter Audit-Maßnahmen, Schulungsquote, gemeldete Beinahe-Unfälle |
| Gut zur Erfolgskontrolle | Gut zur Steuerung |

Ein gutes Kennzahlensystem kombiniert beides.

## Die Balanced Scorecard
Robert Kaplan und David Norton schlugen vor, Unternehmen nicht nur über Finanzzahlen zu steuern, sondern über **vier Perspektiven**:
1. **Finanzen** – Wie sehen uns die Eigentümer?
2. **Kunden** – Wie sehen uns die Kunden?
3. **Interne Prozesse** – Wo müssen wir exzellent sein?
4. **Lernen und Entwicklung** – Wie bleiben wir zukunftsfähig?

## Goodharts Gesetz
„Wenn eine Kennzahl zum Ziel wird, hört sie auf, eine gute Kennzahl zu sein.“ Menschen optimieren die Zahl – nicht unbedingt die Sache dahinter.

BEISPIEL: Wird die Zahl offener Reklamationen streng bewertet, werden Reklamationen schneller „geschlossen“ – aber nicht unbedingt gelöst. Gegenmittel: zusätzlich die Wiederholrate messen.

## Regeln für gute Kennzahlen
- **Wenige und relevant:** Lieber 5 wichtige als 50 nebensächliche.
- **Beeinflussbar:** Teams sollten nur an Zahlen gemessen werden, die sie beeinflussen können.
- **Ausbalanciert:** Menge immer mit Qualität koppeln (Stückzahl *und* Fehlerquote).
- **Zum Lernen, nicht zum Bestrafen:** Zahlen sind Anlass für Gespräche, nicht für Schuldzuweisung.
- **Visualisiert und aktuell:** Ein Shopfloor-Board, das täglich gepflegt wird, wirkt mehr als ein Monatsbericht.

MERKE: Kombiniere Früh- und Spätindikatoren, koppele Menge an Qualität und nutze Kennzahlen zum Lernen. Jede Kennzahl, die zum Ziel wird, lädt zur Manipulation ein.

REFLEXION: Welche Kennzahl in deinem Umfeld wird „optimiert“, ohne dass sich die Sache wirklich verbessert?`,
        },
      ],
      quiz: [
        { q: 'Was ist das zentrale Ergebnis der Zielsetzungstheorie von Locke & Latham?', o: ['„Gib dein Bestes“ ist das wirksamste Ziel', 'Spezifische, herausfordernde Ziele führen zu höherer Leistung als vage Ziele', 'Ziele schaden der Motivation', 'Nur leichte Ziele motivieren'], a: 1, x: 'Spezifische und anspruchsvolle (aber erreichbare) Ziele steigern die Leistung deutlich gegenüber vagen „Gib dein Bestes“-Zielen.' },
        { q: 'Welche Bedingungen verstärken die Wirkung von Zielen?', o: ['Commitment zur Zielerreichung', 'Regelmäßiges Feedback zum Fortschritt', 'Möglichst viele Ziele gleichzeitig', 'Ausreichende Fähigkeiten'], a: [0, 1, 3], x: 'Commitment, Feedback und Fähigkeit sind zentrale Moderatoren. Viele gleichzeitige Ziele verwässern dagegen den Fokus.' },
        { q: 'Woraus besteht ein OKR?', o: ['Aus einem qualitativen Objective und 2–5 messbaren Key Results', 'Aus einer Aufgabenliste mit Terminen', 'Aus einem Budget und einem Projektplan', 'Aus einer Vision und einem Leitbild'], a: 0, x: 'Ein Objective beschreibt inspirierend, wohin es geht; Key Results messen, woran man das Erreichen erkennt.' },
        { q: 'Welches ist ein gut formuliertes Key Result?', o: ['„Schulung zur Fehlervermeidung durchführen“', '„Fehlerquote in der Wareneingangsprüfung sinkt von 2,1 % auf 1,2 %“', '„Mehr auf Qualität achten“', '„Meeting mit Lieferanten organisieren“'], a: 1, x: 'Key Results beschreiben messbare Ergebnisse, keine Aktivitäten. Schulung und Meetings sind mögliche Maßnahmen.' },
        { q: 'Warum werden OKR häufig vom Gehalt entkoppelt?', o: ['Damit Ziele ambitioniert statt „sicher“ gesetzt werden', 'Weil OKR rechtlich nicht vergütet werden dürfen', 'Weil OKR unwichtig sind', 'Damit niemand die Ziele ernst nimmt'], a: 0, x: 'Hängt Geld an der Zielerreichung, setzen Menschen lieber leicht erreichbare Ziele. Die Entkopplung erlaubt Ambition.' },
        { q: 'Was besagt Goodharts Gesetz?', o: ['Kennzahlen sind immer objektiv', 'Wenn eine Kennzahl zum Ziel wird, hört sie auf, eine gute Kennzahl zu sein', 'Je mehr Kennzahlen, desto besser', 'Nur Finanzkennzahlen sind relevant'], a: 1, x: 'Wird eine Zahl zum Ziel, optimieren Menschen die Zahl – nicht unbedingt die Sache dahinter.' },
        { q: 'Welche vier Perspektiven hat die Balanced Scorecard?', o: ['Finanzen, Kunden, interne Prozesse, Lernen & Entwicklung', 'Umsatz, Kosten, Gewinn, Liquidität', 'Planung, Durchführung, Kontrolle, Anpassung', 'Mitarbeiter, Lieferanten, Kunden, Banken'], a: 0, x: 'Kaplan und Norton ergänzten die Finanzperspektive um Kunden, interne Prozesse sowie Lernen und Entwicklung.' },
      ],
    },

    /* ───────────── Kapitel 4 ───────────── */
    {
      id: 'k4',
      title: 'Engagement, Anerkennung & Flow',
      intro: 'Engagierte Mitarbeitende sind produktiver, bleiben länger und machen weniger Fehler. Wie misst man Engagement – und wie fördert man es im Alltag?',
      lessons: [
        {
          id: 'k4a', title: 'Engagement verstehen und messen', min: 7,
          text: `## Was ist Engagement?
**Mitarbeiterengagement** beschreibt die emotionale Bindung an die Arbeit und das Unternehmen: Menschen, die engagiert sind, setzen sich freiwillig über das Nötige hinaus ein, identifizieren sich mit den Zielen und empfehlen ihren Arbeitgeber weiter.

## Der Gallup Engagement Index
Das Beratungsunternehmen Gallup befragt seit vielen Jahren Beschäftigte. In Deutschland zeigt sich regelmäßig ein ernüchterndes Bild: Nur ein kleiner Teil – oft um die **15 %** – hat eine hohe emotionale Bindung. Die große Mehrheit macht „Dienst nach Vorschrift“, ein weiterer Teil hat innerlich gekündigt.

Als wichtigster Einflussfaktor gilt dabei immer wieder: **die direkte Führungskraft**. „Menschen kommen wegen des Unternehmens und gehen wegen des Chefs.“

## Die Q12-Fragen
Gallup misst Engagement mit 12 Fragen. Einige davon:
- Weiß ich, was bei der Arbeit von mir erwartet wird?
- Habe ich die Materialien und Arbeitsmittel, um meine Arbeit richtig zu machen?
- Habe ich in den letzten sieben Tagen Anerkennung oder Lob für gute Arbeit erhalten?
- Interessiert sich mein Vorgesetzter oder jemand anderes bei der Arbeit für mich als Mensch?
- Gibt es jemanden bei der Arbeit, der meine Entwicklung fördert?
- Zählt meine Meinung bei der Arbeit?

Auffällig: Fast alle Fragen beschreiben Dinge, die die **direkte Führungskraft** beeinflussen kann.

## Der Employee Net Promoter Score (eNPS)
Eine einfache Kennzahl mit einer Frage: „Wie wahrscheinlich ist es, dass du unser Unternehmen als Arbeitgeber einem Freund empfiehlst?“ (0–10)
- **Promotoren:** 9–10
- **Passive:** 7–8
- **Kritiker:** 0–6

**eNPS = % Promotoren − % Kritiker** (Wertebereich −100 bis +100). Wichtiger als die Zahl ist die Nachfrage: „Was müsste passieren, damit du eine Stufe höher gehst?“

MERKE: Engagement entsteht vor allem durch die direkte Führung: klare Erwartungen, passende Arbeitsmittel, Anerkennung, echtes Interesse und Entwicklung. Messen lohnt sich nur, wenn danach Maßnahmen folgen.

REFLEXION: Wie würde dein Team die sechs Q12-Fragen oben für dich als Führungskraft beantworten?`,
        },
        {
          id: 'k4b', title: 'Anerkennung und Wertschätzung', min: 7,
          text: `## Unterschätzt und kostenlos
Anerkennung ist einer der stärksten Motivatoren – und einer der am seltensten eingesetzten. Viele Führungskräfte melden sich vor allem, wenn etwas schiefläuft. Das Ergebnis: Mitarbeitende hören den Chef nur bei Problemen.

## Anerkennung vs. Wertschätzung
- **Anerkennung** bezieht sich auf **Leistung**: „Dein Prüfbericht war so klar, dass der Kunde keine Rückfragen hatte.“
- **Wertschätzung** bezieht sich auf den **Menschen**: „Schön, dass du wieder da bist. Wie geht’s deinem Vater?“

Beides ist wichtig – Wertschätzung auch dann, wenn die Leistung gerade nicht stimmt.

## So wirkt Anerkennung
1. **Konkret:** „Gute Arbeit!“ ist nett, aber vergessen. Besser: Was genau war gut, und welche Wirkung hatte es?
2. **Zeitnah:** Je näher an der Leistung, desto stärker die Wirkung.
3. **Ehrlich:** Übertriebenes oder routinemäßiges Lob wird durchschaut.
4. **Angemessen:** Kleine Dinge klein würdigen, große Dinge groß.
5. **Individuell:** Manche freuen sich über Lob vor dem Team, andere fühlen sich dabei unwohl. Frag nach oder beobachte.

## Der Pygmalion-Effekt
Rosenthal und Jacobson zeigten 1968 in Schulen: Wenn Lehrer glaubten, bestimmte Kinder seien besonders begabt, entwickelten sich diese Kinder tatsächlich besser. Erwartungen wirken – über Verhalten, Zuwendung und Förderung. Auch in Unternehmen gilt: **Wer anderen etwas zutraut, bekommt oft mehr Leistung.** Das Gegenteil (niedrige Erwartungen senken Leistung) heißt Golem-Effekt.

TIPP: Nimm dir vor, jede Woche mindestens drei konkrete Anerkennungen auszusprechen. Notiere dir kurz, wem – damit niemand dauerhaft übersehen wird.

MERKE: Anerkennung wirkt, wenn sie konkret, zeitnah, ehrlich und individuell ist. Und: Deine Erwartungen an Menschen beeinflussen, was sie leisten.

REFLEXION: Wann hast du zuletzt jemandem konkret für eine Leistung gedankt? Wer aus deinem Umfeld wartet schon lange darauf?`,
        },
        {
          id: 'k4c', title: 'Flow, Stärken und Arbeitsgestaltung', min: 8,
          text: `## Flow – völlig in der Arbeit aufgehen
Der Psychologe Mihály Csíkszentmihályi beschrieb **Flow** als Zustand, in dem man ganz in einer Tätigkeit aufgeht, die Zeit vergisst und hochkonzentriert und produktiv ist. Flow entsteht, wenn:
- **Anforderung und Fähigkeit im Gleichgewicht** sind (beide auf hohem Niveau),
- das **Ziel klar** ist,
- es **unmittelbares Feedback** gibt,
- man **ungestört** arbeiten kann.

Ist die Aufgabe zu schwer → **Angst/Stress**. Ist sie zu leicht → **Langeweile**.

## Stärken stärken
Statt vor allem Schwächen auszubügeln, lohnt es sich, Menschen dort einzusetzen, wo ihre **Stärken** liegen. Wer seine Stärken täglich einsetzen kann, ist nach Gallup-Analysen deutlich häufiger engagiert. Schwächen sollten nur so weit entwickelt werden, dass sie nicht schaden.

## Arbeit motivierend gestalten
Das **Job-Characteristics-Modell** von Hackman und Oldham nennt fünf Merkmale motivierender Arbeit:
1. **Anforderungsvielfalt:** Unterschiedliche Fähigkeiten sind gefragt.
2. **Ganzheitlichkeit:** Man erstellt ein erkennbares Ganzes, nicht nur einen Bruchteil.
3. **Bedeutsamkeit:** Die Arbeit hat spürbare Auswirkungen auf andere.
4. **Autonomie:** Man kann selbst über Vorgehen und Zeit entscheiden.
5. **Rückmeldung:** Man erfährt, wie gut man ist.

## Werkzeuge der Arbeitsgestaltung
| Methode | Idee |
|---|---|
| **Job Enlargement** | Mehr gleichartige Aufgaben (horizontale Erweiterung) |
| **Job Enrichment** | Mehr Verantwortung und Entscheidungsbefugnis (vertikale Erweiterung) |
| **Job Rotation** | Planmäßiger Wechsel zwischen Arbeitsplätzen |

Am stärksten motivierend wirkt meist **Job Enrichment** – mehr Verantwortung, Planung und Kontrolle der eigenen Arbeit.

BEISPIEL: Statt nur Messungen durchzuführen, verantwortet ein Prüfer künftig „seinen“ Lieferanten komplett: Messung, Auswertung, Gespräch mit dem Lieferanten und Freigabe. Ganzheitlichkeit, Autonomie und Bedeutsamkeit steigen.

MERKE: Menschen sind am motiviertesten, wenn Anforderung und Können zusammenpassen, sie ihre Stärken einsetzen und ganzheitliche, bedeutsame Aufgaben mit Freiraum und Feedback haben.

REFLEXION: Bei welcher Tätigkeit vergisst du die Zeit? Wie könntest du davon mehr in deinen Arbeitsalltag holen?`,
        },
      ],
      quiz: [
        { q: 'Welcher Faktor hat laut Gallup den größten Einfluss auf das Engagement von Mitarbeitenden?', o: ['Die Höhe des Gehalts', 'Die direkte Führungskraft', 'Die Größe des Büros', 'Die Branche'], a: 1, x: 'Die direkte Führungskraft ist der wichtigste Einflussfaktor – fast alle Q12-Fragen beschreiben Dinge, die sie beeinflussen kann.' },
        { q: 'Wie berechnet sich der eNPS?', o: ['Durchschnitt aller Antworten', '% Promotoren (9–10) minus % Kritiker (0–6)', '% Promotoren plus % Passive', 'Anzahl der Antworten über 5'], a: 1, x: 'eNPS = Anteil Promotoren (9–10) minus Anteil Kritiker (0–6). Der Wert liegt zwischen −100 und +100.' },
        { q: 'Was unterscheidet Anerkennung von Wertschätzung?', o: ['Es gibt keinen Unterschied', 'Anerkennung bezieht sich auf Leistung, Wertschätzung auf den Menschen', 'Wertschätzung ist immer finanziell', 'Anerkennung gibt es nur im Jahresgespräch'], a: 1, x: 'Anerkennung würdigt eine konkrete Leistung, Wertschätzung zeigt Respekt und Interesse an der Person – unabhängig von Leistung.' },
        { q: 'Welche Merkmale machen Anerkennung wirksam?', o: ['Konkret', 'Zeitnah', 'Möglichst pauschal und routinemäßig', 'Ehrlich und individuell'], a: [0, 1, 3], x: 'Wirksam ist Anerkennung, die konkret, zeitnah, ehrlich, angemessen und individuell ist. Routinemäßiges Pauschallob verliert an Wert.' },
        { q: 'Was beschreibt der Pygmalion-Effekt?', o: ['Hohe Erwartungen an Menschen können ihre Leistung tatsächlich steigern', 'Lob macht Menschen faul', 'Strenge Kontrolle erhöht Leistung', 'Gutes Aussehen erhöht die Karrierechancen'], a: 0, x: 'Erwartungen wirken über Verhalten, Zuwendung und Förderung als sich selbst erfüllende Prophezeiung.' },
        { q: 'Wann entsteht nach Csíkszentmihályi Flow?', o: ['Wenn die Aufgabe deutlich unter den eigenen Fähigkeiten liegt', 'Wenn Anforderung und Fähigkeit auf hohem Niveau im Gleichgewicht sind', 'Wenn man unter extremem Zeitdruck steht', 'Wenn man mehrere Aufgaben gleichzeitig erledigt'], a: 1, x: 'Flow braucht ein Gleichgewicht von Herausforderung und Können, klare Ziele, unmittelbares Feedback und Konzentration. Zu leicht → Langeweile, zu schwer → Stress.' },
        { q: 'Welche Methode der Arbeitsgestaltung erweitert Verantwortung und Entscheidungsbefugnis?', o: ['Job Enlargement', 'Job Enrichment', 'Job Rotation', 'Job Sharing'], a: 1, x: 'Job Enrichment ist die vertikale Erweiterung: mehr Planung, Kontrolle und Verantwortung. Job Enlargement erweitert nur horizontal um gleichartige Aufgaben.' },
      ],
    },

    /* ───────────── Kapitel 5 ───────────── */
    {
      id: 'k5',
      title: 'Kultur, Sinn & Vertrauen',
      intro: '„Culture eats strategy for breakfast“ – die Kultur entscheidet, ob Strategien umgesetzt werden. In diesem Kapitel geht es um Unternehmenskultur, Sinn und Vertrauen als Erfolgsfaktoren.',
      lessons: [
        {
          id: 'k5a', title: 'Unternehmenskultur verstehen', min: 8,
          text: `## Was ist Kultur?
Unternehmenskultur ist die Summe der gemeinsamen Werte, Normen und Denkmuster, die das Verhalten im Unternehmen prägen – kurz: **„Wie man es bei uns macht.“** Sie zeigt sich besonders dann, wenn niemand hinschaut.

## Das Eisbergmodell nach Edgar Schein
Schein beschreibt Kultur in drei Ebenen:

| Ebene | Was dazugehört | Sichtbarkeit |
|---|---|---|
| **Artefakte** | Gebäude, Kleidung, Rituale, Sprache, Prozesse, Organigramme | Sichtbar, aber schwer zu deuten |
| **Bekundete Werte** | Leitbild, Unternehmenswerte, Strategien, offizielle Regeln | Teilweise bewusst |
| **Grundannahmen** | Unausgesprochene Überzeugungen: „Fehler sind gefährlich“, „Wer früh geht, ist faul“ | Unsichtbar, unbewusst – aber am wirkmächtigsten |

## Wenn Leitbild und Realität auseinanderfallen
Viele Unternehmen haben schöne Werte an der Wand („Wir leben eine offene Fehlerkultur“). Wenn die gelebte Grundannahme aber lautet „Wer Fehler meldet, bekommt Ärger“, gewinnt immer die Grundannahme. Mitarbeitende orientieren sich an dem, was **belohnt, toleriert und bestraft** wird – nicht an dem, was auf Plakaten steht.

## Wie Kultur geprägt wird
Schein nennt als stärkste Mechanismen, wie Führungskräfte Kultur formen:
- **Worauf sie achten**, was sie messen und kontrollieren.
- **Wie sie auf Krisen und Fehler reagieren.**
- **Wen sie belohnen, befördern – und wen nicht.**
- **Was sie vorleben.**

BEISPIEL: Eine Geschäftsführung betont „Qualität vor Termin“. Am Monatsende wird aber trotzdem ausgeliefert, obwohl die Freigabe fehlt – und der Qualitätsleiter, der Stopp sagt, gilt als Bremser. Die gelebte Kultur ist damit klar: Termin schlägt Qualität.

MERKE: Kultur entsteht nicht durch Leitbilder, sondern durch das tägliche Verhalten von Führungskräften: worauf sie achten, wie sie auf Fehler reagieren und wen sie belohnen.

REFLEXION: Welche unausgesprochene „Grundannahme“ prägt dein Unternehmen – und passt sie zu den offiziellen Werten?`,
        },
        {
          id: 'k5b', title: 'Sinn und Purpose', min: 7,
          text: `## Warum Sinn motiviert
Menschen wollen wissen, **wofür** ihre Arbeit gut ist. Sinn ist einer der stärksten Treiber für Engagement – das zeigen sowohl die Selbstbestimmungstheorie als auch Hackman und Oldhams Merkmal „Bedeutsamkeit“.

## Der Golden Circle nach Simon Sinek
Simon Sinek beschreibt, dass inspirierende Organisationen und Führungskräfte **von innen nach außen** kommunizieren:
1. **Why – Warum?** Wofür stehen wir? Was ist unser Antrieb?
2. **How – Wie?** Wie gehen wir vor, was macht uns besonders?
3. **What – Was?** Welche Produkte oder Leistungen bieten wir an?

Die meisten Unternehmen kommunizieren umgekehrt: „Wir stellen Bremssättel her (What), mit modernster Fertigung (How).“ Das Warum fehlt – dabei verbindet gerade das emotional: „Wir sorgen dafür, dass Menschen sicher ankommen.“

## Sinn im Alltag erlebbar machen
- **Den Kunden sichtbar machen:** Wer nutzt unser Produkt? Was passiert, wenn es versagt? Ein Kundenbesuch oder eine echte Kundengeschichte wirkt stärker als jede Präsentation.
- **Die Verbindung erklären:** Wie trägt die einzelne Aufgabe zum großen Ganzen bei? Gerade bei Routinetätigkeiten wie Dokumentation lohnt sich das.
- **Wirkung zurückmelden:** „Dank deiner Analyse hat der Kunde den Auftrag verlängert.“

## Sinn ist nicht nur das große Ganze
Sinn entsteht auch im Kleinen: Kollegen helfen, ein Problem endgültig lösen, etwas lernen, Verantwortung tragen. Nicht jede Tätigkeit rettet die Welt – aber fast jede ist für **jemanden** wichtig.

TIPP: Starte die nächste Aufgabenübergabe mit dem Warum: „Das ist wichtig, weil …“. Achte darauf, wie sich die Rückfragen verändern.

MERKE: Menschen engagieren sich für ein Warum, nicht für ein Was. Erkläre den Zweck, mache den Kunden und die Wirkung der Arbeit sichtbar.

REFLEXION: Wie lautet das „Warum“ deines Teams in einem Satz?`,
        },
        {
          id: 'k5c', title: 'Vertrauen als Erfolgsfaktor', min: 7,
          text: `## Vertrauen beschleunigt alles
In Teams mit hohem Vertrauen wird schneller entschieden, offener kommuniziert und weniger kontrolliert. Misstrauen dagegen kostet: zusätzliche Absicherung, Freigabeschleifen, CC-Mails, politisches Taktieren.

## Woraus Vertrauen entsteht
Vertrauen in eine Person speist sich vor allem aus drei Quellen:
- **Kompetenz:** Sie kann, was sie verspricht.
- **Integrität:** Sie ist ehrlich und handelt nach klaren Prinzipien – auch wenn es unbequem ist.
- **Wohlwollen:** Sie hat meine Interessen im Blick, nicht nur ihre eigenen.

## Vertrauen aufbauen – konkret
1. **Zusagen einhalten** – auch kleine. „Ich melde mich bis Donnerstag“ zählt.
2. **Konsistent handeln:** Gleiche Regeln für alle, Worte und Taten passen zusammen.
3. **Transparent informieren:** Auch Unangenehmes, so früh wie möglich.
4. **Fehler zugeben:** „Da lag ich falsch“ stärkt Vertrauen mehr als es schadet.
5. **Vertrauen vorschießen:** Verantwortung übertragen, bevor alles bewiesen ist.
6. **Loyal sein:** Nicht über Abwesende schlecht reden – und Mitarbeitende nach außen vertreten.

## Vertrauen und Kontrolle
„Vertrauen ist gut, Kontrolle ist besser“? Besser: **Vertrauen mit vereinbarten Prüfpunkten.** Kontrolle ist nicht per se misstrauisch – sie wird es, wenn sie unangekündigt, übermäßig oder als Machtinstrument eingesetzt wird. Vereinbarte Zwischenstände sind professionell; ständiges Über-die-Schulter-Schauen zerstört Vertrauen.

## Vertrauen ist schnell verloren
Vertrauen wächst langsam und kann durch einen einzigen Vertrauensbruch zerstört werden. Wer es verspielt hat, kann es meist nur durch offenes Eingestehen und **langfristig konsistentes Verhalten** zurückgewinnen.

MERKE: Vertrauen entsteht aus Kompetenz, Integrität und Wohlwollen – und wird durch eingehaltene Zusagen, Transparenz und Konsistenz aufgebaut. Vereinbarte Kontrolle ist professionell, Misstrauen nicht.

REFLEXION: Welche Zusage hast du zuletzt nicht eingehalten – und hast du das offen angesprochen?`,
        },
      ],
      quiz: [
        { q: 'Welche Ebene der Unternehmenskultur ist nach Schein am wirkmächtigsten?', o: ['Artefakte', 'Bekundete Werte', 'Grundannahmen', 'Organigramm'], a: 2, x: 'Die unbewussten Grundannahmen prägen das Verhalten am stärksten – stärker als Leitbilder oder sichtbare Artefakte.' },
        { q: 'Woran orientieren sich Mitarbeitende laut Kulturforschung vor allem?', o: ['An den Werten im Leitbild', 'An dem, was tatsächlich belohnt, toleriert und bestraft wird', 'An der Website des Unternehmens', 'An den Plakaten im Flur'], a: 1, x: 'Gelebtes Verhalten schlägt Leitbild: Entscheidend ist, was im Alltag belohnt, toleriert und bestraft wird.' },
        { q: 'Über welche Mechanismen prägen Führungskräfte die Kultur besonders stark?', o: ['Worauf sie achten und was sie messen', 'Wie sie auf Fehler und Krisen reagieren', 'Die Farbe des Firmenlogos', 'Wen sie belohnen und befördern'], a: [0, 1, 3], x: 'Laut Schein prägen Aufmerksamkeit, Reaktionen auf Krisen, Belohnung/Beförderung und Vorbildverhalten die Kultur am stärksten.' },
        { q: 'In welcher Reihenfolge kommunizieren inspirierende Organisationen laut Simon Sinek?', o: ['What – How – Why', 'Why – How – What', 'How – What – Why', 'What – Why – How'], a: 1, x: 'Von innen nach außen: erst das Warum (Zweck), dann das Wie, dann das Was.' },
        { q: 'Welche drei Quellen speisen das Vertrauen in eine Person vor allem?', o: ['Kompetenz, Integrität, Wohlwollen', 'Alter, Titel, Erfahrung', 'Humor, Charme, Aussehen', 'Macht, Geld, Netzwerk'], a: 0, x: 'Wir vertrauen Menschen, die können, was sie versprechen (Kompetenz), ehrlich sind (Integrität) und unsere Interessen im Blick haben (Wohlwollen).' },
        { q: 'Vereinbarte Zwischenstände und Prüfpunkte sind ein Zeichen von Misstrauen.', o: ['Richtig', 'Falsch'], a: 1, fix: true, x: 'Falsch. Vereinbarte Kontrolle ist professionell. Misstrauisch wirkt Kontrolle, wenn sie unangekündigt, übermäßig oder als Machtinstrument eingesetzt wird.' },
      ],
    },

    /* ───────────── Kapitel 6 ───────────── */
    {
      id: 'k6',
      title: 'Erfolg nachhaltig sichern',
      intro: 'Kurzfristige Erfolge sind leicht – dauerhafte Leistung ist die Kunst. Hier geht es um kontinuierliche Verbesserung, gesunde Leistung und darum, Gelerntes wirklich umzusetzen.',
      lessons: [
        {
          id: 'k6a', title: 'Kontinuierliche Verbesserung', min: 7,
          text: `## Kleine Schritte, große Wirkung
**Kaizen** (japanisch: „Veränderung zum Besseren“) bzw. der **KVP** (Kontinuierlicher Verbesserungsprozess) beruht auf einer einfachen Idee: Statt auf den großen Wurf zu warten, verbessern alle Mitarbeitenden ständig in kleinen Schritten. Über die Zeit summiert sich das zu einem enormen Vorsprung.

## Der PDCA-Zyklus
Das Grundmuster jeder Verbesserung (nach Shewhart und Deming):
1. **Plan:** Problem verstehen, Ursache analysieren, Maßnahme und Ziel festlegen.
2. **Do:** Maßnahme im kleinen Rahmen umsetzen bzw. testen.
3. **Check:** Wirkung prüfen – hat es funktioniert? Daten statt Gefühl.
4. **Act:** Bei Erfolg standardisieren, sonst anpassen und neu starten.

Der häufigste Fehler: Plan und Do werden gemacht, **Check und Act** vergessen. Dann weiß niemand, ob die Maßnahme gewirkt hat, und sie wird auch nicht zum neuen Standard.

## Was KVP erfolgreich macht
- **Die Menschen vor Ort einbeziehen:** Die besten Ideen kommen von denen, die die Arbeit täglich machen.
- **Schnell reagieren:** Vorschläge, auf die monatelang niemand antwortet, töten jede Verbesserungskultur.
- **Kleine Ideen ernst nehmen:** Nicht jede Idee muss Tausende Euro sparen. Auch Ergonomie, Ordnung und Zeitersparnis zählen.
- **Standards als Basis:** Ohne Standard keine Verbesserung – man muss wissen, wovon man ausgeht.
- **Fehler als Schatz:** Jeder Fehler zeigt eine Lücke im System.

## Verbindung zur Motivation
KVP erfüllt mehrere Grundbedürfnisse auf einmal: **Autonomie** (ich gestalte meinen Arbeitsplatz), **Kompetenz** (ich löse Probleme), **Bedeutsamkeit** (meine Idee wird umgesetzt).

TIPP: Führe ein kurzes wöchentliches „Verbesserungs-Standup“ ein (10 Minuten): Was hat uns diese Woche gestört? Was probieren wir als Nächstes? Wer kümmert sich?

MERKE: Dauerhafter Erfolg entsteht durch viele kleine Verbesserungen aller Mitarbeitenden. PDCA ist nur wirksam, wenn auch Check und Act konsequent gemacht werden.

REFLEXION: Welche kleine Verbesserung könntest du diese Woche ohne Budget und Genehmigung umsetzen?`,
        },
        {
          id: 'k6b', title: 'Leistung ohne Ausbrennen', min: 8,
          text: `## Mehr Druck = mehr Leistung?
Das **Yerkes-Dodson-Gesetz** beschreibt den Zusammenhang zwischen Anspannung und Leistung als umgekehrtes U: Zu wenig Anspannung führt zu Langeweile und geringer Leistung, ein **mittleres Aktivierungsniveau** zu optimaler Leistung – und zu viel Druck lässt die Leistung wieder sinken. Dauerhafter Druck führt zu Fehlern, Krankheit und Kündigungen.

## Burnout erkennen
Die Weltgesundheitsorganisation (WHO) beschreibt Burnout in der ICD-11 als **Syndrom aufgrund von chronischem Stress am Arbeitsplatz**, der nicht erfolgreich verarbeitet wird. Drei Kennzeichen:
1. **Erschöpfung** – Gefühl von Energieverlust.
2. **Distanz und Zynismus** gegenüber der eigenen Arbeit.
3. **Verringerte Leistungsfähigkeit.**

## Frühwarnsignale bei Mitarbeitenden
- Veränderte Stimmung: gereizt, zynisch, zurückgezogen.
- Dauerhaft lange Arbeitszeiten, keine Pausen, Urlaub wird verschoben.
- Häufigere Fehler, Konzentrationsprobleme.
- Häufige Kurzerkrankungen.

## Was Führungskräfte tun können
- **Ansprechen:** „Mir ist aufgefallen, dass … Wie geht es dir?“ – ohne Diagnose, mit echtem Interesse.
- **Arbeitslast realistisch planen:** Prioritäten setzen – „Was lassen wir weg?“ ist eine Führungsfrage.
- **Erholung schützen:** Keine Mails am Wochenende erwarten, Urlaub ermöglichen – und selbst vorleben.
- **Handlungsspielraum geben:** Stress wird besonders schädlich, wenn hohe Anforderungen auf wenig Einfluss treffen.
- **Unterstützung vermitteln:** Betriebsarzt, EAP-Angebote, Betriebliches Eingliederungsmanagement.

ACHTUNG: Du bist Führungskraft, nicht Therapeut. Deine Aufgabe ist, Signale wahrzunehmen, anzusprechen, die Arbeitsbedingungen zu verbessern und Hilfe zu vermitteln – nicht, Diagnosen zu stellen.

## Auf dich selbst achten
Führungskräfte sind besonders gefährdet: hohe Verantwortung, Druck von oben und unten. Wer selbst ausbrennt, kann niemanden mehr gut führen. Pausen, Schlaf, Bewegung und klare Grenzen sind keine Schwäche, sondern Teil professioneller Selbstführung.

MERKE: Optimale Leistung entsteht bei mittlerer Anspannung, nicht bei Dauerdruck. Signale früh ansprechen, Prioritäten setzen, Erholung schützen – und selbst ein gutes Vorbild sein.

REFLEXION: Wie ist dein eigenes Energielevel auf einer Skala von 1 bis 10 – und was würde es um einen Punkt erhöhen?`,
        },
        {
          id: 'k6c', title: 'Vom Wissen ins Handeln', min: 7,
          text: `## Die Umsetzungslücke
Wissen allein verändert nichts. Die meisten Seminarinhalte sind nach wenigen Wochen wieder vergessen, wenn sie nicht angewendet werden. Entscheidend ist der **Transfer in den Alltag**.

## Wenn-dann-Pläne
Der Psychologe Peter Gollwitzer hat gezeigt: Vorsätze werden deutlich häufiger umgesetzt, wenn man sie als **Wenn-dann-Plan** (Implementation Intention) formuliert:

> „**Wenn** Situation X eintritt, **dann** tue ich Y.“

BEISPIEL: Statt „Ich will mehr loben“: „Wenn ich freitags meinen Wochenrückblick mache, dann schreibe ich zwei Kollegen eine kurze, konkrete Dankesnachricht.“

## Gewohnheiten aufbauen
- **Klein anfangen:** Lieber eine Mini-Gewohnheit, die bleibt, als ein großer Vorsatz, der scheitert.
- **An Bestehendes koppeln:** Neue Gewohnheit direkt an eine bestehende Routine hängen (z. B. nach dem Morgenmeeting).
- **Sichtbar machen:** Erinnerung im Kalender, Checkliste, Post-it.
- **Fortschritt festhalten:** Eine Strichliste oder ein Lerntagebuch verstärkt die Motivation.

## Dein persönlicher Umsetzungsplan
Wähle aus diesem Kurs **maximal drei** Dinge, die du in den nächsten 30 Tagen umsetzt:
1. Was genau willst du anders machen?
2. Wann und in welcher Situation (Wenn-dann)?
3. Woran merkst du, dass es wirkt?
4. Wer kann dir Feedback geben?

Nach 30 Tagen: Bilanz ziehen, was beibehalten wird – und das Nächste angehen. Das ist PDCA für die eigene Entwicklung.

TIPP: Nutze die Notizfunktion dieser App für deinen Umsetzungsplan. Lege dir für jede Maßnahme eine Notiz an und trage nach 30 Tagen als „Antwort“ ein, was du gelernt hast.

MERKE: Lernen wird erst durch Anwenden wirksam. Wenige konkrete Wenn-dann-Pläne, klein angefangen und regelmäßig reflektiert, schlagen jeden großen Vorsatz.

REFLEXION: Welche drei Erkenntnisse aus diesem Kurs willst du in den nächsten 30 Tagen umsetzen? Formuliere sie als Wenn-dann-Pläne.`,
        },
      ],
      quiz: [
        { q: 'Wofür steht PDCA?', o: ['Plan – Do – Check – Act', 'Prepare – Deliver – Control – Adjust', 'Plan – Decide – Change – Approve', 'Problem – Data – Cause – Action'], a: 0, x: 'Plan – Do – Check – Act: planen, umsetzen, Wirkung prüfen, standardisieren oder anpassen.' },
        { q: 'Welcher Fehler passiert bei PDCA besonders häufig?', o: ['Es wird zu viel geplant', 'Check und Act werden vergessen', 'Es werden zu viele Mitarbeitende einbezogen', 'Die Maßnahmen sind zu klein'], a: 1, x: 'Oft wird geplant und umgesetzt, aber nicht geprüft, ob es gewirkt hat – und die Lösung wird nicht zum neuen Standard.' },
        { q: 'Was macht eine kontinuierliche Verbesserungskultur erfolgreich?', o: ['Schnelle Reaktion auf Vorschläge', 'Nur große, kostensparende Ideen berücksichtigen', 'Die Menschen vor Ort einbeziehen', 'Fehler als Lernchance behandeln'], a: [0, 2, 3], x: 'Schnelle Reaktion, Einbindung der Mitarbeitenden vor Ort und ein positiver Umgang mit Fehlern sind zentral. Auch kleine Ideen zählen.' },
        { q: 'Was beschreibt das Yerkes-Dodson-Gesetz?', o: ['Je mehr Druck, desto mehr Leistung', 'Optimale Leistung entsteht bei mittlerer Anspannung (umgekehrtes U)', 'Leistung ist unabhängig von Anspannung', 'Nur entspannte Menschen leisten viel'], a: 1, x: 'Zu wenig und zu viel Anspannung senken die Leistung; ein mittleres Aktivierungsniveau ist optimal.' },
        { q: 'Welche drei Kennzeichen beschreibt die WHO für Burnout?', o: ['Erschöpfung, Distanz/Zynismus, verringerte Leistungsfähigkeit', 'Fieber, Kopfschmerz, Schlaflosigkeit', 'Ehrgeiz, Perfektionismus, Ungeduld', 'Langeweile, Unterforderung, Desinteresse'], a: 0, x: 'Die ICD-11 beschreibt Burnout über Erschöpfung, mentale Distanz bzw. Zynismus gegenüber der Arbeit und verringerte Leistungsfähigkeit.' },
        { q: 'Welche Formulierung ist ein Wenn-dann-Plan nach Gollwitzer?', o: ['„Ich will gesünder leben.“', '„Wenn ich montags ins Büro komme, dann plane ich als Erstes 30 Minuten für meine Top-Priorität ein.“', '„Irgendwann mache ich mehr Sport.“', '„Ich versuche, öfter zu loben.“'], a: 1, x: 'Ein Wenn-dann-Plan verknüpft eine konkrete Situation mit einer konkreten Handlung – das erhöht die Umsetzungswahrscheinlichkeit deutlich.' },
      ],
    },
  ],
});
