// Kurs: Mitarbeiterführung
// Format siehe README.md im Ordner lernen/. IDs nicht mehr ändern – daran hängt der Lernfortschritt.
(window.COURSES = window.COURSES || []).push({
  id: 'fuehrung',
  title: 'Mitarbeiterführung',
  emoji: '🧭',
  color: '#4f46e5',
  short: 'Menschen wirksam führen – von der Rolle bis zum Change.',
  desc: 'Ein praxisnaher Lernpfad für Führungskräfte: Du klärst deine Rolle, lernst passende Führungsstile, führst wirksame Gespräche, delegierst sauber, entwickelst Teams, löst Konflikte und begleitest Veränderungen.',
  level: 'Einsteiger bis Fortgeschritten',
  duration: 'ca. 4 h',
  goals: [
    'Die eigene Führungsrolle klar definieren und vertreten',
    'Führungsstil an Person und Situation anpassen',
    'Feedback und Mitarbeitergespräche strukturiert führen',
    'Ziele vereinbaren und wirksam delegieren',
    'Teams entwickeln und Konflikte früh lösen',
    'Veränderungen so führen, dass Menschen mitgehen',
  ],
  finalCount: 18,
  chapters: [
    /* ───────────── Kapitel 1 ───────────── */
    {
      id: 'k1',
      title: 'Die Führungsrolle verstehen',
      intro: 'Bevor es um Methoden geht, geht es um dich: Was bedeutet Führung eigentlich, was erwarten andere von dir – und wie führst du dich selbst?',
      lessons: [
        {
          id: 'k1a', title: 'Was Führung eigentlich ist', min: 7,
          text: `## Führung = Wirkung über andere
Führung heißt, das Verhalten anderer Menschen so zu beeinflussen, dass gemeinsame Ziele erreicht werden. Entscheidend ist dabei nicht die Position im Organigramm, sondern die **Wirkung**: Folgen dir Menschen, weil sie müssen – oder weil sie wollen?

## Management und Führung
Beides gehört zum Job, ist aber nicht dasselbe:

| Management | Führung |
|---|---|
| Planen, organisieren, kontrollieren | Orientierung geben, überzeugen, entwickeln |
| Sachen und Prozesse | Menschen und Beziehungen |
| Stabilität und Effizienz | Veränderung und Engagement |
| „Die Dinge richtig tun“ | „Die richtigen Dinge tun“ |

Gute Führungskräfte können beides – und wissen, wann was gefragt ist.

## Die drei Kernaufgaben
- **Ergebnisse sichern:** Ziele klären, Prioritäten setzen, Ressourcen steuern.
- **Menschen entwickeln:** Stärken erkennen, fördern, fordern, Feedback geben.
- **Zusammenarbeit gestalten:** Rahmen, Regeln und Klima schaffen, in dem ein Team gut arbeiten kann.

## Macht und Autorität
Positionsmacht (Weisungsbefugnis, Belohnung, Sanktion) hast du mit der Stelle bekommen. Nachhaltig wirkt aber vor allem **persönliche Autorität**: Fachkompetenz, Glaubwürdigkeit, Fairness und Vorbildverhalten. Wer nur mit Positionsmacht führt, bekommt Gehorsam – aber selten Engagement.

MERKE: Führung zeigt sich nicht im Titel, sondern darin, ob Menschen dir freiwillig folgen. Persönliche Autorität entsteht durch Kompetenz, Verlässlichkeit und Fairness.

REFLEXION: Denk an die beste Führungskraft, die du selbst hattest. Was genau hat sie anders gemacht – und was davon willst du übernehmen?`,
        },
        {
          id: 'k1b', title: 'Vom Kollegen zur Führungskraft', min: 8,
          text: `## Ein Rollenwechsel, kein Titelwechsel
Wer aus dem eigenen Team heraus befördert wird, steht vor einer besonderen Herausforderung: Gestern noch Kollege, heute Vorgesetzter. Die Beziehungen bleiben – aber ihre Spielregeln ändern sich.

## Typische Stolpersteine
- **Weiterhin der beste Sachbearbeiter sein wollen** – und dabei keine Zeit für Führung haben.
- **Es allen recht machen wollen** – unangenehme Entscheidungen werden vertagt.
- **Überkompensieren** – plötzlich streng und distanziert wirken, um Autorität zu beweisen.
- **Alte Seilschaften** – ehemalige Freunde im Team bevorzugen (oder aus Angst vor diesem Vorwurf benachteiligen).

## Was hilft
1. **Den Wechsel offen ansprechen.** Ein Teammeeting zum Start: „Meine Rolle hat sich geändert. Das bedeutet für uns …“. Was bleibt gleich, was ändert sich?
2. **Einzelgespräche führen.** Mit jeder Person: Erwartungen, Stärken, Anliegen, Wünsche an dich.
3. **Klare Grenzen bei Freundschaften.** Private Nähe ist erlaubt, Bevorzugung nicht. Sprich das bei engen Kollegen ausdrücklich an.
4. **Loslassen.** Fachliche Aufgaben bewusst abgeben – deine wichtigste Arbeit ist jetzt, andere erfolgreich zu machen.
5. **Früh sichtbar entscheiden.** Kleine, faire Entscheidungen in den ersten Wochen schaffen Vertrauen in deine Rolle.

## Erwartungen von allen Seiten
Als Führungskraft stehst du in einem **Erwartungsdreieck**: Dein Vorgesetzter erwartet Ergebnisse und Loyalität, dein Team erwartet Schutz, Orientierung und Fairness, Kollegen auf deiner Ebene erwarten Kooperation. Mach diese Erwartungen explizit – am besten in Gesprächen statt durch Vermutungen.

TIPP: Erstelle in den ersten 30 Tagen eine einfache Rollenklärung: Was erwarten Vorgesetzter, Team und Schnittstellen von mir? Was erwarte ich von ihnen? Ein Abgleich mit dem eigenen Chef verhindert spätere Missverständnisse.

REFLEXION: Welche Aufgabe fällt dir am schwersten loszulassen – und wem im Team könntest du sie zutrauen?`,
        },
        {
          id: 'k1c', title: 'Selbstführung als Fundament', min: 7,
          text: `## Wer andere führen will, muss sich selbst führen
Deine Mitarbeitenden beobachten genau, was du tust – nicht nur, was du sagst. Selbstführung ist deshalb keine Privatsache, sondern Führungsaufgabe.

## Die vier Felder der Selbstführung
- **Werte und Haltung:** Wofür stehst du? Welche Prinzipien gelten für dich auch unter Druck?
- **Prioritäten und Zeit:** Arbeitest du an dem, was wichtig ist – oder nur an dem, was laut ist?
- **Emotionen:** Erkennst du deinen Ärger, deinen Stress – und reagierst du bewusst statt reflexhaft?
- **Energie:** Schlaf, Bewegung, Pausen. Eine erschöpfte Führungskraft trifft schlechtere Entscheidungen.

## Eisenhower-Prinzip
Ordne Aufgaben nach **wichtig** und **dringend**:

| | Dringend | Nicht dringend |
|---|---|---|
| **Wichtig** | Sofort selbst erledigen | Terminieren – hier liegt Führungsarbeit! |
| **Nicht wichtig** | Delegieren | Weglassen |

Führungsaufgaben wie Mitarbeiterentwicklung, Strategie oder Beziehungsarbeit sind fast immer *wichtig, aber nicht dringend* – und werden deshalb gern verdrängt. Blocke dafür feste Zeiten im Kalender.

## Emotionale Selbstregulation
Zwischen Reiz und Reaktion liegt ein Raum. Hilfreich in angespannten Situationen:
1. **Stopp:** Kurz innehalten, durchatmen.
2. **Benennen:** „Ich merke, dass ich gerade verärgert bin.“
3. **Entscheiden:** Was ist jetzt die hilfreichste Reaktion – für das Ziel und die Beziehung?

MERKE: Du bist immer Vorbild – auch an schlechten Tagen. Wer seine Prioritäten, Emotionen und Energie steuert, führt glaubwürdiger.

REFLEXION: Wie viele Stunden pro Woche verbringst du aktuell wirklich mit Führungsarbeit (Gespräche, Entwicklung, Team) – und wie viele wären angemessen?`,
        },
      ],
      quiz: [
        { q: 'Was beschreibt den Unterschied zwischen Management und Führung am besten?', o: ['Management richtet sich auf Prozesse und Stabilität, Führung auf Menschen, Orientierung und Veränderung', 'Management ist Aufgabe der Geschäftsleitung, Führung die des Teamleiters', 'Führung ist ein veralteter Begriff für Management', 'Management ist freiwillig, Führung ist Pflicht'], a: 0, x: 'Management sorgt für Planung, Organisation und Kontrolle („Dinge richtig tun“), Führung für Orientierung und Engagement („die richtigen Dinge tun“). Führungskräfte brauchen beides.' },
        { q: 'Worauf beruht nachhaltige persönliche Autorität vor allem?', o: ['Weisungsbefugnis', 'Kompetenz und Glaubwürdigkeit', 'Möglichkeit zu Sanktionen', 'Fairness und Vorbildverhalten'], a: [1, 3], x: 'Positionsmacht (Weisung, Sanktion) erzeugt Gehorsam. Persönliche Autorität entsteht durch Kompetenz, Glaubwürdigkeit, Fairness und Vorbildverhalten – sie erzeugt Engagement.' },
        { q: 'Du wirst aus deinem Team heraus zur Teamleitung befördert. Was ist der sinnvollste erste Schritt?', o: ['Den Rollenwechsel offen im Team ansprechen und Einzelgespräche führen', 'Erst einmal abwarten und alles so lassen wie bisher', 'Sofort Distanz aufbauen, damit niemand die Autorität infrage stellt', 'Weiterhin die meisten Fachaufgaben selbst erledigen, um Kompetenz zu zeigen'], a: 0, x: 'Offenheit schafft Klarheit: Was bleibt, was ändert sich? Einzelgespräche klären Erwartungen. Abwarten, Überkompensieren und Festhalten an Fachaufgaben sind typische Stolpersteine.' },
        { q: 'In welches Feld der Eisenhower-Matrix fallen typische Führungsaufgaben wie Mitarbeiterentwicklung?', o: ['Wichtig und dringend', 'Wichtig, aber nicht dringend', 'Dringend, aber nicht wichtig', 'Weder wichtig noch dringend'], a: 1, x: 'Entwicklung, Strategie und Beziehungsarbeit sind wichtig, aber selten dringend – deshalb werden sie oft verdrängt. Feste Kalenderblöcke helfen.' },
        { q: 'Aufgaben, die dringend, aber nicht wichtig sind, sollten laut Eisenhower-Prinzip …', o: ['sofort selbst erledigt werden', 'delegiert werden', 'gestrichen werden', 'auf später terminiert werden'], a: 1, x: 'Dringend, aber nicht wichtig → delegieren. Wichtig und dringend → selbst sofort. Wichtig, nicht dringend → terminieren. Weder noch → weglassen.' },
        { q: 'Welche Reihenfolge hilft bei emotionaler Selbstregulation in einer angespannten Situation?', o: ['Reagieren – erklären – entschuldigen', 'Stopp – Emotion benennen – bewusst entscheiden', 'Ignorieren – vertagen – vergessen', 'Benennen – reagieren – stoppen'], a: 1, x: 'Innehalten, die eigene Emotion wahrnehmen und benennen, dann bewusst die hilfreichste Reaktion wählen – so nutzt du den Raum zwischen Reiz und Reaktion.' },
        { q: 'Welche Gruppen bilden das „Erwartungsdreieck“ einer Führungskraft?', o: ['Eigener Vorgesetzter, eigenes Team, Kollegen/Schnittstellen', 'Kunden, Lieferanten, Wettbewerber', 'Betriebsrat, Personalabteilung, Geschäftsführung', 'Familie, Freunde, Kollegen'], a: 0, x: 'Führungskräfte stehen zwischen den Erwartungen des eigenen Chefs, des Teams und der Kollegen auf gleicher Ebene. Diese Erwartungen sollten aktiv geklärt werden.' },
      ],
    },

    /* ───────────── Kapitel 2 ───────────── */
    {
      id: 'k2',
      title: 'Führungsstile & situatives Führen',
      intro: 'Es gibt nicht „den“ richtigen Führungsstil. Hier lernst du die wichtigsten Modelle kennen – und wie du deinen Stil an Person und Situation anpasst.',
      lessons: [
        {
          id: 'k2a', title: 'Klassische Führungsstile', min: 6,
          text: `## Die drei Stile nach Kurt Lewin
Der Psychologe Kurt Lewin untersuchte Ende der 1930er-Jahre, wie unterschiedliche Führung auf Gruppen wirkt:

| Stil | Merkmale | Wirkung |
|---|---|---|
| **Autoritär** | Führung entscheidet allein, gibt genaue Anweisungen | Schnell, klar – aber wenig Eigeninitiative, Abhängigkeit, Spannungen |
| **Kooperativ (demokratisch)** | Team wird beteiligt, Entscheidungen werden erklärt | Höhere Motivation und Qualität, braucht mehr Zeit |
| **Laissez-faire** | Kaum Vorgaben, Führung hält sich heraus | Meist schlechteste Ergebnisse, Orientierungslosigkeit |

## Das Kontinuum nach Tannenbaum & Schmidt
Statt drei Schubladen beschreibt dieses Modell eine **Skala**: von „Führung entscheidet und ordnet an“ über „Führung entscheidet und erklärt“, „Führung schlägt vor, Team diskutiert“ bis hin zu „Team entscheidet innerhalb eines Rahmens“. Je weiter rechts, desto mehr Entscheidungsspielraum hat das Team.

## Was heißt das für die Praxis?
- In einer **Krise** (z. B. Sicherheitsproblem, Lieferstopp) ist ein direktiver Stil oft richtig: schnell, klar, eindeutig.
- Bei **komplexen Problemen** mit Expertenwissen im Team ist Beteiligung meist überlegen.
- **Laissez-faire** ist kein Vertrauensbeweis, sondern Abwesenheit von Führung. Vertrauen heißt: klarer Rahmen + Freiraum + Ansprechbarkeit.

MERKE: Kein Stil ist immer richtig. Gute Führung wählt bewusst, wie viel Entscheidungsspielraum ein Team in einer Situation bekommt – und macht das transparent.

REFLEXION: Welcher Stil ist dein „Standardmodus“, wenn du unter Zeitdruck stehst? Und wie erlebt dein Team das?`,
        },
        {
          id: 'k2b', title: 'Situatives Führen (Hersey & Blanchard)', min: 9,
          text: `## Die Grundidee
Das Modell des **situativen Führens** von Paul Hersey und Ken Blanchard sagt: Der richtige Führungsstil hängt vom **Reifegrad** der Person bezogen auf eine **konkrete Aufgabe** ab. Reifegrad meint dabei zwei Dinge:
- **Kompetenz:** Kann die Person die Aufgabe? (Wissen, Erfahrung, Fähigkeiten)
- **Engagement:** Will sie und traut sie es sich zu? (Motivation, Selbstvertrauen)

Wichtig: Der Reifegrad gilt **pro Aufgabe**. Eine erfahrene Prüferin kann bei einer neuen Software wieder Anfängerin sein.

## Vier Stile für vier Situationen
| Situation der Person | Passender Stil | Was du tust |
|---|---|---|
| **R1** – wenig Kompetenz, unsicher oder unmotiviert | **S1 Anweisen** | Genau erklären, was, wie, bis wann. Eng begleiten. |
| **R2** – wenig Kompetenz, aber motiviert | **S2 Überzeugen / Trainieren** | Erklären *und* begründen, Fragen zulassen, ermutigen. |
| **R3** – kompetent, aber unsicher oder zurückhaltend | **S3 Unterstützen / Beteiligen** | Zutrauen zeigen, gemeinsam überlegen, zuhören, bestärken. |
| **R4** – kompetent und engagiert | **S4 Delegieren** | Ergebnis vereinbaren, Verantwortung übergeben, Freiraum lassen. |

Von S1 nach S4 nimmt die **aufgabenbezogene Lenkung** ab. Die **Beziehungsorientierung** (Unterstützung, Ermutigung) ist bei S2 und S3 am höchsten.

## Typische Fehler
- **Über-Führen:** Erfahrene Profis mit Detailanweisungen gängeln (S1 bei R4) → Frust, Kündigungsgedanken.
- **Unter-Führen:** Neue Mitarbeitende „einfach mal machen lassen“ (S4 bei R1) → Überforderung, Fehler, Rückzug.

BEISPIEL: Ein neuer Kollege soll erstmals einen 8D-Report schreiben. Er ist motiviert, hat es aber nie gemacht (R2). Passend ist S2: Vorgehen erklären, Beispiel zeigen, den ersten Entwurf gemeinsam durchgehen. Beim fünften Report (R3/R4) reicht ein kurzer Check des Ergebnisses.

MERKE: Führe nicht alle gleich, sondern jeden passend – je Aufgabe. Ziel ist, Menschen Schritt für Schritt Richtung R4 zu entwickeln und dann loszulassen.

REFLEXION: Nimm zwei Personen aus deinem Team und eine typische Aufgabe: Auf welcher Stufe stehen sie – und führst du sie aktuell passend?`,
        },
        {
          id: 'k2c', title: 'Transformationale Führung', min: 7,
          text: `## Transaktional vs. transformational
**Transaktionale Führung** funktioniert wie ein Tauschgeschäft: Leistung gegen Belohnung, Fehler gegen Korrektur. Das ist nicht falsch – klare Absprachen und faire Gegenleistungen sind die Basis.

**Transformationale Führung** (nach Bernard Bass) geht darüber hinaus: Sie verändert Einstellungen und Werte, sodass Menschen sich mit dem Ziel identifizieren und **mehr leisten, als vereinbart war**. Studien zeigen Zusammenhänge mit höherer Zufriedenheit, Leistung und Bindung.

## Die „4 I“
1. **Idealized Influence – Vorbild sein:** Die Führungskraft lebt vor, was sie erwartet, handelt integer und wird dadurch respektiert.
2. **Inspirational Motivation – begeistern:** Eine sinnstiftende Vision vermitteln, Zuversicht ausstrahlen, hohe Erwartungen formulieren.
3. **Intellectual Stimulation – zum Denken anregen:** Bestehendes hinterfragen, neue Lösungen fördern, Fehler als Lernchance behandeln.
4. **Individualized Consideration – individuell fördern:** Jede Person als Individuum sehen, coachen, Entwicklung unterstützen.

## So setzt du es im Alltag um
- Erkläre bei Aufgaben das **Warum**: Wofür ist das wichtig – für Kunden, für das Team, für das Unternehmen?
- Frag öfter „Wie würdest du das lösen?“, statt sofort die Lösung vorzugeben.
- Plane regelmäßige **Entwicklungsgespräche** – nicht nur Statusmeetings.
- Halte Zusagen ein. Glaubwürdigkeit ist die Währung transformationaler Führung.

MERKE: Transaktionale Führung sorgt für verlässliche Leistung, transformationale Führung für Engagement über das Vereinbarte hinaus. Die Kombination ist am wirksamsten.

REFLEXION: Welches der „4 I“ ist deine Stärke – und welches möchtest du in den nächsten Wochen bewusst trainieren?`,
        },
      ],
      quiz: [
        { q: 'Welcher Führungsstil führte in Lewins Untersuchungen meist zu den schlechtesten Ergebnissen?', o: ['Autoritär', 'Kooperativ', 'Laissez-faire', 'Situativ'], a: 2, x: 'Laissez-faire – also das Fehlen von Führung – führte zu Orientierungslosigkeit und den schwächsten Ergebnissen.' },
        { q: 'In welcher Situation ist ein eher direktiver (autoritärer) Stil am ehesten angemessen?', o: ['Bei einer akuten Sicherheitskrise, die schnelle klare Entscheidungen erfordert', 'Bei einem erfahrenen Expertenteam, das ein komplexes Problem lösen soll', 'Bei der langfristigen Strategieentwicklung', 'Bei der Planung der Teamevent-Location'], a: 0, x: 'In Krisen zählt Geschwindigkeit und Klarheit. Bei komplexen Fragen mit Expertenwissen im Team ist Beteiligung meist überlegen.' },
        { q: 'Woraus setzt sich der „Reifegrad“ im situativen Führen zusammen?', o: ['Alter und Betriebszugehörigkeit', 'Kompetenz und Engagement bezogen auf eine konkrete Aufgabe', 'Ausbildung und Gehaltsstufe', 'Persönlichkeit und Charakter'], a: 1, x: 'Reifegrad = Können (Kompetenz) + Wollen/Zutrauen (Engagement) – und zwar immer bezogen auf eine bestimmte Aufgabe.' },
        { q: 'Eine Mitarbeiterin ist motiviert, hat die Aufgabe aber noch nie gemacht. Welcher Stil passt?', o: ['S1 – Anweisen ohne Erklärung', 'S2 – Überzeugen/Trainieren: erklären, begründen, ermutigen', 'S3 – Unterstützen: nur zuhören und bestärken', 'S4 – Delegieren: Ergebnis vereinbaren und loslassen'], a: 1, x: 'Motiviert, aber wenig Kompetenz entspricht R2. Passend ist S2: viel Anleitung plus Begründung und Ermutigung.' },
        { q: 'Was passiert typischerweise, wenn ein erfahrener, engagierter Profi mit Detailanweisungen geführt wird?', o: ['Er fühlt sich wertgeschätzt', 'Frust und Demotivation durch „Über-Führen“', 'Seine Leistung steigt deutlich', 'Er wird kompetenter'], a: 1, x: 'S1 bei R4 ist „Über-Führen“. Das signalisiert Misstrauen und führt zu Frust bis hin zu Kündigungsgedanken.' },
        { q: 'Welche der folgenden gehören zu den „4 I“ der transformationalen Führung?', o: ['Inspirational Motivation (begeistern)', 'Individualized Consideration (individuell fördern)', 'Instruction Control (Anweisungskontrolle)', 'Intellectual Stimulation (zum Denken anregen)'], a: [0, 1, 3], x: 'Die 4 I sind: Idealized Influence, Inspirational Motivation, Intellectual Stimulation und Individualized Consideration. „Instruction Control“ gehört nicht dazu.' },
        { q: 'Transaktionale Führung ist grundsätzlich schlecht und sollte vermieden werden.', o: ['Richtig', 'Falsch'], a: 1, fix: true, x: 'Falsch. Klare Absprachen und faire Gegenleistungen sind die Basis. Transformationale Führung ergänzt sie – die Kombination wirkt am besten.' },
      ],
    },

    /* ───────────── Kapitel 3 ───────────── */
    {
      id: 'k3',
      title: 'Kommunikation & Feedback',
      intro: 'Führung findet zum größten Teil in Gesprächen statt. In diesem Kapitel lernst du, Missverständnisse zu verstehen, wirklich zuzuhören und Feedback so zu geben, dass es ankommt.',
      lessons: [
        {
          id: 'k3a', title: 'Das Vier-Ohren-Modell', min: 7,
          text: `## Jede Nachricht hat vier Seiten
Der Kommunikationspsychologe Friedemann Schulz von Thun beschreibt: Jede Äußerung enthält gleichzeitig vier Botschaften – und der Empfänger kann mit jedem der „vier Ohren“ hören.

| Seite | Frage | Beispiel: „Der Bericht ist noch nicht fertig?“ |
|---|---|---|
| **Sachinhalt** | Worüber informiere ich? | Der Bericht liegt noch nicht vor. |
| **Selbstkundgabe** | Was gebe ich von mir preis? | Ich bin unter Druck, ich brauche ihn. |
| **Beziehung** | Was halte ich von dir, wie stehen wir zueinander? | Ich zweifle an deiner Zuverlässigkeit. |
| **Appell** | Wozu will ich dich bringen? | Mach ihn bitte jetzt fertig! |

## Warum das für Führung wichtig ist
Aus deinem Mund wiegt jede Äußerung schwerer – Mitarbeitende hören bei Vorgesetzten besonders oft mit dem **Beziehungsohr**. Eine sachlich gemeinte Frage kann als Vorwurf ankommen.

## Was hilft
- **Klar senden:** Sag, was du meinst – inklusive Appell. „Ich brauche den Bericht bis 14 Uhr für das Kundengespräch. Klappt das?“
- **Selbstkundgabe nutzen:** „Ich bin gerade gestresst wegen des Audits“ erklärt deinen Ton, bevor er falsch gedeutet wird.
- **Nachfragen statt deuten:** „Wie hast du das gemeint?“ klärt mehr als jede Vermutung.

## Man kann nicht nicht kommunizieren
Paul Watzlawick ergänzt: Auch Schweigen, eine verschobene Antwort oder ein Blick aufs Handy im Gespräch senden Botschaften – vor allem auf der Beziehungsebene. Und: Ist die Beziehungsebene gestört, kommt die Sachebene kaum noch an.

MERKE: Was du sagst, ist nicht automatisch das, was ankommt. Sende klar (inkl. Appell) und frag nach, bevor du deutest.

REFLEXION: Erinnere dich an ein Missverständnis aus letzter Zeit. Auf welchem „Ohr“ hat die andere Person gehört – und auf welchem hattest du gesendet?`,
        },
        {
          id: 'k3b', title: 'Aktiv zuhören und gute Fragen stellen', min: 7,
          text: `## Zuhören ist eine aktive Tätigkeit
Viele hören zu, um zu antworten – nicht, um zu verstehen. **Aktives Zuhören** (nach Carl Rogers) bedeutet, die Sichtweise des anderen wirklich erfassen zu wollen und das auch zu zeigen.

## Die drei Stufen
1. **Aufmerksam sein:** Blickkontakt, zugewandte Haltung, Handy weg, nicht unterbrechen.
2. **Paraphrasieren:** Inhalt in eigenen Worten wiedergeben. „Du meinst also, die Prüfvorgabe ist unklar formuliert?“
3. **Gefühle verbalisieren:** „Das klingt, als hätte dich das ziemlich geärgert.“

So fühlt sich dein Gegenüber verstanden – und du prüfst, ob du richtig verstanden hast.

## Fragetypen
| Typ | Beispiel | Wann nützlich |
|---|---|---|
| **Offene Fragen** (W-Fragen) | „Wie siehst du das?“ „Was brauchst du?“ | Gespräch öffnen, Sichtweisen erfahren |
| **Geschlossene Fragen** | „Schaffst du das bis Freitag?“ | Etwas klären, Entscheidung festhalten |
| **Skalierungsfragen** | „Auf einer Skala von 1 bis 10 – wie sicher bist du?“ | Einschätzungen greifbar machen |
| **Lösungsorientierte Fragen** | „Was wäre ein erster kleiner Schritt?“ | Vom Problem zur Lösung kommen |

Vorsicht mit **„Warum“-Fragen**: Sie klingen schnell nach Rechtfertigungsdruck („Warum hast du das nicht gemacht?“). Besser: „Was hat dich daran gehindert?“

## Die 80/20-Regel im Mitarbeitergespräch
In Gesprächen mit Mitarbeitenden sollte die Führungskraft eher **wenig** sprechen. Wer viel fragt und zuhört, erfährt mehr – und die Lösungen, die das Gegenüber selbst findet, werden eher umgesetzt.

TIPP: Probier im nächsten Gespräch, auf die erste Antwort mit „Und was noch?“ zu reagieren. Oft kommt erst danach der eigentliche Punkt.

REFLEXION: Wie hoch schätzt du deinen eigenen Redeanteil in deinen letzten Mitarbeitergesprächen?`,
        },
        {
          id: 'k3c', title: 'Feedback geben und nehmen', min: 9,
          text: `## Warum Feedback so wichtig ist
Feedback ist der schnellste Weg zu Entwicklung. Das **Johari-Fenster** zeigt: Jeder Mensch hat einen „blinden Fleck“ – Verhalten, das andere sehen, man selbst aber nicht. Feedback verkleinert diesen blinden Fleck.

## Das SBI-Modell
Ein einfaches, bewährtes Schema (Situation – Behavior – Impact):
1. **Situation:** Wann und wo? „Im Lieferantenmeeting gestern …“
2. **Verhalten:** Was genau hast du beobachtet – beschreibend, nicht wertend? „… hast du den Lieferanten zweimal unterbrochen, als er die Ursachen erklären wollte.“
3. **Wirkung:** Was hat das ausgelöst? „Er hat danach kaum noch etwas gesagt, und wir haben wichtige Infos nicht bekommen.“

Danach: **Dialog öffnen und Wunsch formulieren.** „Wie hast du die Situation erlebt?“ – „Ich wünsche mir, dass wir die Ursachenanalyse erst ganz anhören.“

## Regeln für gutes Feedback
- **Zeitnah** – nicht erst im Jahresgespräch.
- **Konkret** – beobachtbares Verhalten statt Eigenschaften („unterbrochen“ statt „unhöflich“).
- **Ich-Botschaften** – „Mir ist aufgefallen …“ statt „Du bist immer …“.
- **Veränderbar** – nur Verhalten ansprechen, das die Person beeinflussen kann.
- **Kritik unter vier Augen**, Lob gern auch vor anderen (wenn die Person das mag).
- **Positives Feedback nicht vergessen** – und genauso konkret wie Kritik.

## Die „Sandwich-Methode“?
Kritik zwischen zwei Lobpassagen zu verstecken, wird oft empfohlen – ist aber umstritten: Die Kritik geht unter, und das Lob verliert an Wert, weil alle auf das „Aber“ warten. Besser: Positives und Kritisches **getrennt und ehrlich** ansprechen.

## Feedback annehmen
- Zuhören, ausreden lassen, **nicht rechtfertigen**.
- Nachfragen, um zu verstehen: „Kannst du ein Beispiel nennen?“
- **Danken** – Feedback zu geben kostet Mut.
- Selbst entscheiden, was man daraus macht.

Bitte als Führungskraft aktiv um Feedback. So zeigst du, dass es erwünscht ist – und lebst die Kultur vor.

MERKE: Gutes Feedback beschreibt konkretes Verhalten und seine Wirkung, kommt zeitnah und öffnet einen Dialog. Wer selbst um Feedback bittet, macht es im Team normal.

REFLEXION: Wem in deinem Team schuldest du gerade ein ehrliches Feedback – positiv oder kritisch? Formuliere es nach SBI.`,
        },
      ],
      quiz: [
        { q: 'Welche vier Seiten einer Nachricht unterscheidet Schulz von Thun?', o: ['Sachinhalt, Selbstkundgabe, Beziehung, Appell', 'Inhalt, Form, Ton, Ziel', 'Sender, Empfänger, Kanal, Code', 'Fakten, Gefühle, Wünsche, Bitten'], a: 0, x: 'Jede Nachricht enthält Sachinhalt, Selbstkundgabe (Selbstoffenbarung), Beziehungshinweis und Appell.' },
        { q: 'Dein Mitarbeiter reagiert gekränkt auf deine Frage „Ist das schon erledigt?“. Auf welchem Ohr hat er vermutlich gehört?', o: ['Sachohr', 'Selbstkundgabe-Ohr', 'Beziehungsohr', 'Appellohr'], a: 2, x: 'Gekränkt sein deutet auf das Beziehungsohr: Er hat herausgehört „Du traust mir nicht zu, dass ich das schaffe“.' },
        { q: 'Was bedeutet „Paraphrasieren“ beim aktiven Zuhören?', o: ['Dem Gegenüber einen Rat geben', 'Das Gehörte in eigenen Worten wiedergeben', 'Eine eigene ähnliche Geschichte erzählen', 'Das Gespräch zusammenfassen und beenden'], a: 1, x: 'Paraphrasieren heißt, den Inhalt in eigenen Worten wiederzugeben. So zeigst du Verständnis und prüfst, ob du richtig verstanden hast.' },
        { q: 'Warum sind „Warum“-Fragen in kritischen Gesprächen oft ungünstig?', o: ['Sie sind grammatikalisch falsch', 'Sie erzeugen leicht Rechtfertigungsdruck', 'Sie sind geschlossene Fragen', 'Sie führen immer zu Ja/Nein-Antworten'], a: 1, x: '„Warum hast du …?“ klingt schnell nach Vorwurf. Besser: „Was hat dich daran gehindert?“ oder „Wie kam es dazu?“' },
        { q: 'Wofür stehen die drei Schritte des SBI-Feedbackmodells?', o: ['Situation – Verhalten – Wirkung', 'Stärken – Bewertung – Initiative', 'Sachlage – Begründung – Idee', 'Sympathie – Beziehung – Information'], a: 0, x: 'SBI = Situation, Behavior (beobachtbares Verhalten), Impact (Wirkung). Danach folgen Dialog und Wunsch.' },
        { q: 'Welche Aussagen entsprechen guten Feedbackregeln?', o: ['„Mir ist aufgefallen, dass der Bericht zweimal zu spät kam.“', '„Du bist einfach unzuverlässig.“', '„Im Meeting heute hast du die Zahlen sehr klar präsentiert – das hat die Entscheidung beschleunigt.“', '„Alle finden, dass du zu laut bist.“'], a: [0, 2], x: 'Gutes Feedback ist konkret, beschreibend, als Ich-Botschaft formuliert und benennt Wirkung. Eigenschaften („unzuverlässig“) und anonyme Mehrheiten („alle finden“) sind ungünstig.' },
        { q: 'Was ist die beste Reaktion, wenn du selbst kritisches Feedback bekommst?', o: ['Sofort erklären, warum es so gekommen ist', 'Zuhören, nachfragen, danken – und dann entscheiden, was du daraus machst', 'Das Feedback zurückweisen, wenn es nicht stimmt', 'Gegenfeedback geben'], a: 1, x: 'Zuhören ohne Rechtfertigung, Verständnisfragen stellen und danken. Was du umsetzt, entscheidest du danach in Ruhe.' },
      ],
    },

    /* ───────────── Kapitel 4 ───────────── */
    {
      id: 'k4',
      title: 'Ziele, Delegation & Mitarbeitergespräche',
      intro: 'Klare Ziele, sauber übergebene Verantwortung und gut geführte Gespräche sind das Handwerkszeug für Führung im Alltag.',
      lessons: [
        {
          id: 'k4a', title: 'Ziele vereinbaren mit SMART', min: 7,
          text: `## Warum Ziele?
Ziele geben Orientierung, machen Leistung sichtbar und ermöglichen Feedback. Unklare Ziele („Bitte die Qualität verbessern“) führen dagegen zu Missverständnissen und Frust auf beiden Seiten.

## Die SMART-Formel
| Buchstabe | Bedeutung | Prüffrage |
|---|---|---|
| **S** | Spezifisch | Ist eindeutig, was erreicht werden soll? |
| **M** | Messbar | Woran erkennen wir, dass es erreicht ist? |
| **A** | Attraktiv / akzeptiert | Ist das Ziel für die Person sinnvoll, steht sie dahinter? |
| **R** | Realistisch | Ist es mit den vorhandenen Mitteln erreichbar – aber fordernd? |
| **T** | Terminiert | Bis wann? |

BEISPIEL: Unklar: „Reklamationen reduzieren.“ SMART: „Die Anzahl der Kundenreklamationen für Produktlinie A sinkt bis 30.06. von 12 auf maximal 6 pro Quartal.“

## Vereinbaren statt vorgeben
Ziele wirken stärker, wenn die Person an ihrer Formulierung beteiligt ist. Ein guter Ablauf:
1. Übergeordnetes Ziel erklären (Warum ist das wichtig?).
2. Mitarbeitende einen Vorschlag machen lassen.
3. Gemeinsam schärfen: messbar, realistisch, terminiert.
4. Unterstützung klären: Was brauchst du dafür von mir?
5. Zwischenstände vereinbaren – nicht erst am Ende schauen.

## Nicht übertreiben
3–5 Ziele pro Person und Zeitraum reichen. Zu viele Ziele verwässern den Fokus. Und: Nicht alles Wichtige lässt sich in Zahlen fassen – auch Verhaltensziele („Ich übernehme die Moderation der Schichtübergabe“) sind legitim.

MERKE: Ein gutes Ziel ist spezifisch, messbar, akzeptiert, realistisch und terminiert – und wird gemeinsam erarbeitet, nicht nur verkündet.

REFLEXION: Nimm ein aktuelles Ziel aus deinem Bereich. Ist es wirklich SMART – oder nur eine Absichtserklärung?`,
        },
        {
          id: 'k4b', title: 'Richtig delegieren', min: 8,
          text: `## Warum Delegation scheitert
„Bis ich das erklärt habe, mache ich es lieber selbst.“ – Dieser Satz ist der häufigste Grund, warum Führungskräfte überlastet sind und Teams sich nicht entwickeln. Kurzfristig mag es stimmen, langfristig ist es eine Falle.

## Das Kongruenzprinzip (AKV)
Wer eine **Aufgabe** übernimmt, braucht auch die passende **Kompetenz** (Befugnisse, Entscheidungsrechte, Ressourcen) und trägt dann die **Verantwortung** für die Ausführung. Aufgabe ohne Befugnis frustriert; Verantwortung ohne Befugnis ist unfair.

Wichtig: Die **Führungsverantwortung** (Auswahl der richtigen Person, Information, Kontrolle) bleibt immer bei dir.

## Delegation in 5 Schritten
1. **Was?** Aufgabe und gewünschtes Ergebnis klar beschreiben.
2. **Warum?** Sinn und Zusammenhang erklären.
3. **Wer?** Passende Person wählen (Reifegrad beachten!).
4. **Wie viel Freiraum?** Entscheidungsrahmen und Befugnisse klären: Muss die Person vorher fragen, nur informieren oder entscheidet sie allein?
5. **Bis wann und wie kontrollieren?** Termin, Zwischenstände, Form der Rückmeldung vereinbaren.

## Stufen der Delegation
Delegation ist kein Schalter, sondern eine Skala:
- „Prüfe und berichte mir, ich entscheide.“
- „Mach einen Vorschlag, wir entscheiden gemeinsam.“
- „Entscheide und informiere mich danach.“
- „Entscheide selbst – ich muss es nicht wissen.“

## Vorsicht vor Rückdelegation
Ein Mitarbeiter kommt mit einem Problem – und geht ohne. Plötzlich liegt die Aufgabe („der Affe“) wieder auf deinem Schreibtisch. Gegenmittel: „Was schlägst du vor?“ – und die nächste Aktion bleibt bei ihm.

TIPP: Beende jedes Delegationsgespräch mit einer kurzen Zusammenfassung durch den Mitarbeitenden: „Fass bitte kurz zusammen, was du jetzt machst und bis wann.“ So erkennst du Missverständnisse sofort.

REFLEXION: Welche drei Aufgaben auf deinem Tisch könnte jemand anderes zu 80 % so gut erledigen wie du?`,
        },
        {
          id: 'k4c', title: 'Mitarbeitergespräche führen', min: 9,
          text: `## Die wichtigsten Gesprächsarten
- **Regelmäßiges 1:1** (z. B. alle 2–4 Wochen): Stand, Hindernisse, Befinden, Unterstützung.
- **Jahres- bzw. Entwicklungsgespräch:** Rückblick, Ziele, Zusammenarbeit, Entwicklung.
- **Kritik- bzw. Korrekturgespräch:** Wenn Verhalten oder Leistung nicht passt.
- **Anerkennungsgespräch:** Bewusst und konkret würdigen – wird meist vergessen.

## Das Jahresgespräch – ein bewährter Ablauf
1. **Einstieg:** Rahmen und Ablauf klären, angenehme Atmosphäre.
2. **Rückblick:** Wie lief das Jahr aus Sicht des Mitarbeitenden? Dann deine Sicht.
3. **Zielerreichung:** Was wurde erreicht, was nicht, woran lag es?
4. **Zusammenarbeit:** Feedback in **beide Richtungen** – auch an dich.
5. **Entwicklung:** Stärken, Wünsche, Weiterbildung, Perspektiven.
6. **Neue Ziele & Vereinbarungen:** schriftlich festhalten.

Wichtig: Beide bereiten sich vor. Gib dem Mitarbeitenden die Leitfragen vorab.

## Das Kritikgespräch
Kritikgespräche werden oft zu lange aufgeschoben – bis aus einem kleinen Problem ein großes geworden ist. Struktur:
1. **Direkt zum Punkt:** Anlass kurz und sachlich benennen (kein langer Small Talk).
2. **Fakten schildern:** Konkretes, beobachtetes Verhalten und Wirkung (SBI).
3. **Sichtweise erfragen:** „Wie siehst du das?“ – wirklich zuhören.
4. **Erwartung klar formulieren:** Was soll sich ändern?
5. **Lösung gemeinsam erarbeiten:** Was tut der Mitarbeitende, was tust du?
6. **Vereinbarung und Folgetermin:** Schriftlich festhalten, nachhalten.

## Wenn es ernst wird
Ändert sich trotz klarer Gespräche nichts, folgen formale Schritte. Im deutschen Arbeitsrecht ist bei verhaltensbedingten Problemen in der Regel eine **Abmahnung** Voraussetzung für weitere Konsequenzen. Sie dokumentiert das Fehlverhalten, fordert zur Änderung auf und warnt vor Folgen. Hol hier frühzeitig die Personalabteilung (und ggf. den Betriebsrat) ins Boot.

ACHTUNG: Kritik nie zwischen Tür und Angel, nie vor anderen und nie im Affekt. Wenn du verärgert bist: erst abkühlen, dann vorbereiten, dann sprechen.

MERKE: Regelmäßige 1:1-Gespräche verhindern Überraschungen im Jahresgespräch. Kritik früh, konkret und unter vier Augen ansprechen – mit klarer Vereinbarung und Nachverfolgung.

REFLEXION: Gibt es ein Gespräch, das du gerade vor dir herschiebst? Was wäre der erste Satz?`,
        },
      ],
      quiz: [
        { q: 'Wofür steht das „A“ in SMART?', o: ['Aktuell', 'Attraktiv bzw. akzeptiert', 'Ausführlich', 'Allgemein'], a: 1, x: 'SMART = Spezifisch, Messbar, Attraktiv/Akzeptiert, Realistisch, Terminiert.' },
        { q: 'Welches Ziel ist SMART formuliert?', o: ['„Wir wollen besser werden.“', '„Die Durchlaufzeit von Erstmusterprüfungen sinkt bis 31.03. von 10 auf 7 Arbeitstage.“', '„Möglichst schnell weniger Fehler machen.“', '„Die Kundenzufriedenheit soll steigen.“'], a: 1, x: 'Nur das zweite Ziel ist spezifisch, messbar und terminiert. Die anderen sind Absichtserklärungen.' },
        { q: 'Was besagt das Kongruenzprinzip (AKV) bei der Delegation?', o: ['Aufgabe, Kompetenz und Verantwortung müssen zusammenpassen', 'Alle Aufgaben werden gleich verteilt', 'Die Führungskraft behält alle Kompetenzen', 'Verantwortung kann vollständig delegiert werden, Aufgaben nicht'], a: 0, x: 'Wer eine Aufgabe übernimmt, braucht passende Befugnisse und trägt dann die Handlungsverantwortung. Die Führungsverantwortung bleibt bei der Führungskraft.' },
        { q: 'Was bleibt bei der Delegation immer bei der Führungskraft?', o: ['Die Ausführung der Aufgabe', 'Die Führungsverantwortung (richtige Auswahl, Information, Kontrolle)', 'Alle Detailentscheidungen', 'Nichts – alles geht über'], a: 1, x: 'Die Handlungsverantwortung geht an den Mitarbeitenden, die Führungsverantwortung bleibt bei dir.' },
        { q: 'Ein Mitarbeiter kommt mit einem Problem zu dir. Wie vermeidest du Rückdelegation?', o: ['Das Problem sofort selbst lösen', '„Was schlägst du vor?“ – und die nächste Aktion bleibt beim Mitarbeiter', 'Ihn bitten, später wiederzukommen', 'Die Aufgabe an jemand anderen geben'], a: 1, x: 'Mit der Frage nach seinem Vorschlag bleibt die Verantwortung beim Mitarbeiter, und du förderst eigenständiges Denken.' },
        { q: 'Welche Elemente gehören zu einem guten Kritikgespräch?', o: ['Konkretes Verhalten und Wirkung benennen', 'Sichtweise des Mitarbeitenden erfragen', 'Ausführlicher Small Talk, um die Stimmung aufzulockern', 'Vereinbarung und Folgetermin festhalten'], a: [0, 1, 3], x: 'Fakten, Sichtweise, klare Erwartung, gemeinsame Lösung, Vereinbarung und Nachverfolgung. Langer Small Talk wirkt bei Kritik eher unehrlich – lieber direkt zum Punkt.' },
        { q: 'Im Jahresgespräch sollte Feedback nur von der Führungskraft an den Mitarbeitenden gehen.', o: ['Richtig', 'Falsch'], a: 1, fix: true, x: 'Falsch. Feedback zur Zusammenarbeit gehört in beide Richtungen – auch die Führungskraft sollte um Rückmeldung bitten.' },
      ],
    },

    /* ───────────── Kapitel 5 ───────────── */
    {
      id: 'k5',
      title: 'Teams entwickeln & Konflikte lösen',
      intro: 'Ein Team ist mehr als eine Gruppe von Menschen. Hier lernst du, wie Teams sich entwickeln, was sie wirklich leistungsfähig macht – und wie du Konflikte früh erkennst und löst.',
      lessons: [
        {
          id: 'k5a', title: 'Teamphasen nach Tuckman', min: 7,
          text: `## Teams durchlaufen Phasen
Bruce Tuckman beschrieb 1965, dass Teams typische Entwicklungsphasen durchlaufen. Später kam eine fünfte Phase hinzu.

| Phase | Was passiert | Deine Aufgabe als Führungskraft |
|---|---|---|
| **Forming** (Orientierung) | Höflich, abwartend, unsicher. Wer ist wer? | Orientierung geben: Ziele, Rollen, Spielregeln klären |
| **Storming** (Konflikt) | Positionskämpfe, Reibung, Widerstand | Konflikte zulassen und moderieren, nicht unterdrücken |
| **Norming** (Regeln) | Regeln und Zusammenarbeit bilden sich | Vereinbarungen festhalten, Verantwortung übergeben |
| **Performing** (Leistung) | Eingespielt, selbstorganisiert, produktiv | Freiraum lassen, Hindernisse beseitigen, delegieren |
| **Adjourning** (Auflösung) | Projektende, Abschied | Erfolge würdigen, Lessons Learned sichern |

## Wichtig zu wissen
- **Storming ist normal und nötig.** Teams, die Konflikte überspringen, bleiben oft in künstlicher Harmonie stecken – und erreichen nie echte Leistung.
- **Rückfälle sind möglich.** Neue Teammitglieder, ein neuer Chef oder veränderte Ziele können ein Team in frühere Phasen zurückwerfen.
- **Der Führungsstil wandert mit:** Anfangs eher lenkend, später zunehmend delegierend – ähnlich wie beim situativen Führen.

TIPP: Bei einem neuen Team oder Projekt lohnt sich ein Kick-off mit drei Fragen: Was ist unser Ziel? Wer macht was? Wie wollen wir zusammenarbeiten (Meetings, Erreichbarkeit, Entscheidungen, Umgang mit Fehlern)?

MERKE: Jedes Team durchläuft Phasen – auch die konfliktreiche. Passe deine Führung an die Phase an, statt Konflikte vorschnell zu glätten.

REFLEXION: In welcher Phase steht dein Team gerade? Woran machst du das fest?`,
        },
        {
          id: 'k5b', title: 'Psychologische Sicherheit', min: 7,
          text: `## Was Teams wirklich erfolgreich macht
Google untersuchte im „Projekt Aristoteles“ Hunderte Teams, um herauszufinden, was die besten ausmacht. Überraschung: Nicht die Zusammensetzung (wer im Team ist) war entscheidend, sondern **wie** die Menschen zusammenarbeiten. Der wichtigste Faktor: **psychologische Sicherheit**.

## Was ist psychologische Sicherheit?
Der Begriff stammt von Harvard-Professorin Amy Edmondson. Er beschreibt die gemeinsame Überzeugung im Team, dass man **zwischenmenschliche Risiken eingehen kann**, ohne bestraft oder bloßgestellt zu werden:
- eine „dumme“ Frage stellen
- einen Fehler zugeben
- Bedenken äußern – auch gegenüber dem Chef
- eine ungewöhnliche Idee einbringen

Psychologische Sicherheit heißt **nicht**, dass alle nett zueinander sind oder Leistung egal ist. Sie ist die Voraussetzung dafür, dass hohe Ansprüche nicht zu Angst und Vertuschung führen.

## Warum das besonders in der Qualität zählt
Wo Fehler bestraft werden, werden sie versteckt. Probleme kommen erst ans Licht, wenn sie beim Kunden landen. Wo Fehler früh gemeldet werden dürfen, kann man sie günstig abstellen.

## Was Führungskräfte konkret tun können
1. **Eigene Fehlbarkeit zeigen:** „Ich kann mich irren – was übersehe ich?“
2. **Aktiv nach Meinungen fragen:** Gerade die Stillen zuerst.
3. **Auf schlechte Nachrichten konstruktiv reagieren:** „Danke, dass du das früh sagst.“ – Die erste Reaktion entscheidet, ob jemand wieder etwas meldet.
4. **Fehler als Lernquelle behandeln:** Ursachen statt Schuldige suchen.
5. **Respektlosigkeit unterbinden:** Abwertende Kommentare sofort ansprechen.

MERKE: Psychologische Sicherheit ist die Basis für Lernen, Qualität und Innovation. Sie entsteht durch das Verhalten der Führungskraft – vor allem durch die Reaktion auf Fehler und schlechte Nachrichten.

REFLEXION: Wann hat dir zuletzt jemand aus dem Team eine schlechte Nachricht überbracht – und wie hast du reagiert?`,
        },
        {
          id: 'k5c', title: 'Konflikte erkennen und lösen', min: 10,
          text: `## Konflikte sind normal
Wo Menschen zusammenarbeiten, gibt es unterschiedliche Interessen, Ziele und Werte. Konflikte sind nicht das Problem – **ungelöste** Konflikte sind es. Je früher du eingreifst, desto einfacher ist die Lösung.

## Die Eskalationsstufen nach Friedrich Glasl
Glasl beschreibt neun Stufen in drei Ebenen:

| Ebene | Stufen | Merkmale |
|---|---|---|
| **Win-win** | 1. Verhärtung · 2. Debatte · 3. Taten statt Worte | Sachliche Lösung noch möglich, beide können gewinnen |
| **Win-lose** | 4. Koalitionen · 5. Gesichtsverlust · 6. Drohstrategien | Es geht ums Gewinnen; Lager bilden sich, Angriffe auf die Person |
| **Lose-lose** | 7. Begrenzte Vernichtung · 8. Zersplitterung · 9. Gemeinsam in den Abgrund | Schaden des anderen wichtiger als eigener Nutzen |

Auf den Stufen 1–3 können die Beteiligten den Konflikt meist selbst lösen – mit Unterstützung der Führungskraft. Ab Stufe 4–6 braucht es eine Moderation oder Mediation, später oft Machteingriffe.

## Frühwarnzeichen
- Informationen werden zurückgehalten, E-Mails statt Gespräche, auffällig viele Leute in Kopie.
- Grüppchenbildung, Lästern, Schweigen in Meetings.
- Sachfragen werden plötzlich zu Grundsatzfragen.

## Das Harvard-Konzept als Lösungsweg
Roger Fisher und William Ury entwickelten an der Harvard University vier Prinzipien für sachgerechtes Verhandeln:
1. **Menschen und Probleme getrennt behandeln:** Hart in der Sache, respektvoll zur Person.
2. **Interessen statt Positionen:** Hinter der Position („Ich will die Frühschicht!“) steckt ein Interesse („Ich muss mein Kind von der Kita abholen“). Interessen lassen sich oft vereinbaren, Positionen nicht.
3. **Optionen zum beiderseitigen Vorteil entwickeln:** Erst Ideen sammeln, dann bewerten.
4. **Objektive Kriterien nutzen:** Faire Maßstäbe statt Machtkampf (Regeln, Daten, Normen).

## Ein Konfliktgespräch moderieren
1. Beide Seiten einzeln anhören.
2. Gemeinsames Gespräch: Regeln vereinbaren (ausreden lassen, respektvoll).
3. Jede Seite schildert ihre Sicht, die andere paraphrasiert.
4. Interessen herausarbeiten: „Was ist dir dabei wichtig?“
5. Lösungen gemeinsam entwickeln und konkret vereinbaren.
6. Folgetermin zur Überprüfung.

MERKE: Konflikte früh ansprechen, solange beide noch gewinnen können (Glasl 1–3). Lösungen entstehen über Interessen, nicht über Positionen.

REFLEXION: Gibt es in deinem Umfeld einen schwelenden Konflikt? Auf welcher Glasl-Stufe würdest du ihn verorten?`,
        },
      ],
      quiz: [
        { q: 'In welcher Reihenfolge verlaufen die Teamphasen nach Tuckman?', o: ['Forming – Storming – Norming – Performing', 'Norming – Forming – Performing – Storming', 'Storming – Forming – Norming – Performing', 'Forming – Norming – Storming – Performing'], a: 0, x: 'Forming (Orientierung), Storming (Konflikt), Norming (Regeln), Performing (Leistung) – später ergänzt um Adjourning (Auflösung).' },
        { q: 'Was ist in der Storming-Phase die wichtigste Aufgabe der Führungskraft?', o: ['Konflikte sofort unterdrücken, um Harmonie herzustellen', 'Konflikte zulassen und konstruktiv moderieren', 'Sich komplett heraushalten', 'Das Team neu zusammensetzen'], a: 1, x: 'Storming ist normal und notwendig. Konflikte sollten moderiert, nicht unterdrückt werden – sonst entsteht künstliche Harmonie ohne echte Leistung.' },
        { q: 'Was war laut Googles „Projekt Aristoteles“ der wichtigste Faktor für erfolgreiche Teams?', o: ['Hoher IQ der Teammitglieder', 'Psychologische Sicherheit', 'Möglichst ähnliche Persönlichkeiten', 'Großzügige Boni'], a: 1, x: 'Psychologische Sicherheit – die Überzeugung, zwischenmenschliche Risiken eingehen zu können – war der wichtigste Faktor.' },
        { q: 'Psychologische Sicherheit bedeutet, dass im Team keine hohen Leistungsansprüche gestellt werden.', o: ['Richtig', 'Falsch'], a: 1, fix: true, x: 'Falsch. Psychologische Sicherheit und hohe Ansprüche gehören zusammen. Sie sorgt dafür, dass hohe Ansprüche nicht zu Angst und Vertuschung führen.' },
        { q: 'Was fördert psychologische Sicherheit im Team?', o: ['Konstruktiv auf schlechte Nachrichten reagieren', 'Fehler öffentlich dem Verursacher zuordnen', 'Eigene Fehlbarkeit zeigen und aktiv nach Meinungen fragen', 'Bei Fehlern nach Ursachen statt nach Schuldigen suchen'], a: [0, 2, 3], x: 'Konstruktive Reaktionen, eigene Fehlbarkeit, aktives Fragen und Ursachenorientierung fördern Sicherheit. Öffentliches Schuldzuweisen zerstört sie.' },
        { q: 'Auf welcher Ebene der Glasl-Eskalationsstufen ist eine Win-win-Lösung noch gut möglich?', o: ['Stufen 1–3', 'Stufen 4–6', 'Stufen 7–9', 'Auf keiner Stufe'], a: 0, x: 'Auf den Stufen 1–3 (Verhärtung, Debatte, Taten statt Worte) können meist noch beide Seiten gewinnen. Danach geht es ums Gewinnen bzw. Schaden.' },
        { q: 'Zwei Mitarbeitende streiten: Beide bestehen auf der Frühschicht. Was empfiehlt das Harvard-Konzept?', o: ['Per Los entscheiden', 'Die Interessen hinter den Positionen herausarbeiten', 'Dem Dienstälteren recht geben', 'Beiden die Spätschicht geben'], a: 1, x: 'Interessen statt Positionen: Vielleicht braucht einer Zeit für die Kita, der andere hat einen Arzttermin. Interessen lassen sich oft vereinbaren, Positionen nicht.' },
      ],
    },

    /* ───────────── Kapitel 6 ───────────── */
    {
      id: 'k6',
      title: 'Veränderungen führen',
      intro: 'Neue Software, Umstrukturierung, neue Prozesse: Veränderung ist Dauerzustand. Hier lernst du, was in Menschen bei Veränderungen vorgeht – und wie du Change wirksam führst.',
      lessons: [
        {
          id: 'k6a', title: 'Die Veränderungskurve & Widerstand', min: 8,
          text: `## Menschen reagieren auf Veränderung in Phasen
Veränderungen lösen – selbst wenn sie sinnvoll sind – emotionale Reaktionen aus. Die **Veränderungskurve** (angelehnt an Kübler-Ross, im Change Management z. B. von Richard Streich beschrieben) zeigt typische Phasen:

1. **Schock / Überraschung:** „Das kann nicht sein.“
2. **Verneinung:** „Das betrifft uns nicht, das geht vorbei.“ – kurzfristig sogar gefühlte Kompetenz.
3. **Rationale Einsicht:** „Ja, es muss sich etwas ändern … aber nicht so.“
4. **Emotionale Akzeptanz:** Der Tiefpunkt. Loslassen vom Alten – Frust, Trauer, Unsicherheit.
5. **Ausprobieren:** Erste Schritte im Neuen, Erfolge und Rückschläge.
6. **Erkenntnis:** „Es funktioniert ja.“ – Kompetenz wächst.
7. **Integration:** Das Neue ist selbstverständlich geworden.

Menschen durchlaufen diese Phasen **unterschiedlich schnell**. Und: Führungskräfte sind meist früher informiert und schon weiter auf der Kurve – deshalb wirkt das Team auf sie oft „langsam“ oder „widerständig“.

## Widerstand verstehen
Widerstand ist keine Bosheit, sondern ein **Signal**. Dahinter stecken oft:
- **Nicht-Wissen:** Ich verstehe nicht, warum und was sich ändert.
- **Nicht-Können:** Ich traue mir das Neue nicht zu.
- **Nicht-Wollen:** Ich verliere etwas (Status, Gewohnheit, Sicherheit).

| Ursache | Was hilft |
|---|---|
| Nicht-Wissen | Informieren: Warum, was, wann, was bedeutet es für mich? |
| Nicht-Können | Befähigen: Schulung, Zeit, Begleitung, Ausprobieren dürfen |
| Nicht-Wollen | Beteiligen: Mitgestalten lassen, Verluste anerkennen, Nutzen zeigen |

## Was du in jeder Phase tun kannst
- **Früh und ehrlich informieren** – auch wenn noch nicht alles klar ist. Gerüchte füllen jede Informationslücke.
- **Emotionen zulassen:** „Ich verstehe, dass das ärgerlich ist.“
- **Im Tal begleiten:** Kleine Erfolge sichtbar machen, Fehler beim Ausprobieren erlauben.

MERKE: Widerstand ist ein Signal, keine Störung. Frag nach der Ursache – Nicht-Wissen, Nicht-Können oder Nicht-Wollen – und reagiere passend mit Information, Befähigung oder Beteiligung.

REFLEXION: Denk an eine laufende Veränderung: Wo auf der Kurve stehst du – und wo stehen die Menschen in deinem Team?`,
        },
        {
          id: 'k6b', title: 'Change gestalten: Kotter & Lewin', min: 8,
          text: `## Lewins Drei-Phasen-Modell
Kurt Lewin beschrieb Veränderung schon in den 1940ern in drei Schritten:
1. **Unfreeze (Auftauen):** Bereitschaft schaffen – das Bestehende infrage stellen, Notwendigkeit zeigen.
2. **Change (Verändern):** Neue Abläufe einführen, ausprobieren, lernen.
3. **Refreeze (Einfrieren):** Das Neue stabilisieren und verankern, damit es nicht in alte Muster zurückfällt.

## Die 8 Stufen nach John Kotter
Harvard-Professor John Kotter hat untersucht, warum viele Veränderungsvorhaben scheitern, und daraus acht Stufen abgeleitet:

1. **Gefühl der Dringlichkeit erzeugen:** Warum müssen wir uns jetzt ändern? Daten, Kundenstimmen, Risiken zeigen.
2. **Eine Führungskoalition aufbauen:** Einflussreiche Unterstützer aus verschiedenen Bereichen gewinnen.
3. **Vision und Strategie entwickeln:** Ein klares, verständliches Zielbild.
4. **Die Vision kommunizieren:** Oft, auf allen Kanälen – und vorleben.
5. **Hindernisse beseitigen, Mitarbeitende befähigen:** Strukturen, Systeme und Personen, die bremsen, angehen.
6. **Kurzfristige Erfolge sichtbar machen:** Quick Wins planen und feiern – sie geben Energie und überzeugen Skeptiker.
7. **Erfolge konsolidieren, weitere Veränderungen anstoßen:** Nicht zu früh den Sieg erklären.
8. **Neue Ansätze in der Kultur verankern:** Verbindung zwischen neuem Verhalten und Erfolg deutlich machen.

## Typische Fehler (laut Kotter)
- Zu wenig Dringlichkeit – „Warum eigentlich?“ bleibt unbeantwortet.
- Die Vision wird einmal per Rundmail verkündet und dann nie wieder erwähnt.
- Zu früh den Erfolg erklären – und das Alte kehrt zurück.

## Deine Rolle als Führungskraft im mittleren Management
Oft entscheidest du die Veränderung nicht selbst, musst sie aber umsetzen. Dann gilt:
- Kläre für dich selbst das **Warum** – frag nach, bis du es erklären kannst.
- Sei **ehrlich**: Du kannst Verständnis für Kritik zeigen und trotzdem loyal umsetzen.
- **Übersetze** die Veränderung: Was bedeutet sie konkret für dein Team?
- Gib Feedback aus dem Team **nach oben** weiter.

TIPP: Plane bei jeder Veränderung bewusst einen ersten sichtbaren Erfolg nach wenigen Wochen ein – und kommuniziere ihn.

MERKE: Veränderung braucht Dringlichkeit, eine klare Vision, ständige Kommunikation, sichtbare Erfolge und Verankerung. Wer zu früh aufhört, erlebt den Rückfall ins Alte.

REFLEXION: Welche der acht Kotter-Stufen wurde bei der letzten Veränderung in deinem Unternehmen übersprungen – und mit welcher Folge?`,
        },
      ],
      quiz: [
        { q: 'Warum wirkt ein Team für Führungskräfte bei Veränderungen oft „widerständig“?', o: ['Weil Mitarbeitende grundsätzlich gegen Neues sind', 'Weil Führungskräfte meist früher informiert sind und auf der Veränderungskurve schon weiter sind', 'Weil Teams die Kurve gar nicht durchlaufen', 'Weil Widerstand immer ein Zeichen von Faulheit ist'], a: 1, x: 'Führungskräfte hatten meist mehr Zeit, sich mit der Veränderung auseinanderzusetzen. Das Team steht dadurch oft noch in früheren Phasen.' },
        { q: 'Welche Phase der Veränderungskurve ist typischerweise der emotionale Tiefpunkt?', o: ['Schock', 'Verneinung', 'Emotionale Akzeptanz (Loslassen)', 'Integration'], a: 2, x: 'In der Phase der emotionalen Akzeptanz wird das Alte losgelassen. Hier sind Frust und Unsicherheit am größten – und Begleitung am wichtigsten.' },
        { q: 'Ein Mitarbeiter wehrt sich gegen ein neues System, weil er sich die Bedienung nicht zutraut. Was hilft am ehesten?', o: ['Informieren über die Strategie', 'Befähigen: Schulung, Zeit und Begleitung', 'Druck erhöhen', 'Ihn von der Veränderung ausnehmen'], a: 1, x: 'Das ist Nicht-Können. Hier helfen Schulung, Zeit zum Üben und Begleitung – Information allein reicht nicht.' },
        { q: 'Wie heißen die drei Phasen in Lewins Veränderungsmodell?', o: ['Plan – Do – Check', 'Unfreeze – Change – Refreeze', 'Forming – Storming – Norming', 'Schock – Ablehnung – Akzeptanz'], a: 1, x: 'Auftauen (Bereitschaft schaffen), Verändern, Einfrieren (stabilisieren und verankern).' },
        { q: 'Was ist laut Kotter die erste Stufe erfolgreicher Veränderung?', o: ['Eine Vision entwickeln', 'Ein Gefühl der Dringlichkeit erzeugen', 'Quick Wins feiern', 'Eine Schulung planen'], a: 1, x: 'Ohne Dringlichkeit fehlt die Energie für Veränderung. Erst danach folgen Koalition, Vision, Kommunikation usw.' },
        { q: 'Welche Fehler führen laut Kotter häufig zum Scheitern von Veränderungen?', o: ['Die Vision nur einmal kommunizieren', 'Zu früh den Erfolg erklären', 'Kurzfristige Erfolge sichtbar machen', 'Zu wenig Dringlichkeit erzeugen'], a: [0, 1, 3], x: 'Mangelnde Dringlichkeit, zu wenig Kommunikation und zu frühes Siegerklären sind klassische Fehler. Quick Wins sichtbar zu machen ist dagegen Stufe 6 – ein Erfolgsfaktor.' },
      ],
    },
  ],
});
