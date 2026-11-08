// Kurs: Schweißtechnik
// Format siehe README.md im Ordner lernen/. IDs nicht mehr ändern – daran hängt der Lernfortschritt.
// Hinweis: Normenangaben beziehen sich auf die gängigen DIN-EN-ISO-Ausgaben; im Zweifel immer die aktuell gültige Norm heranziehen.
(window.COURSES = window.COURSES || []).push({
  id: 'schweissen',
  title: 'Schweißtechnik',
  emoji: '🔥',
  color: '#0b7285',
  short: 'Verfahren, Werkstoffe, Fehler, Prüfung und Qualität – kompakt erklärt.',
  desc: 'Ein Grundlagenkurs für alle, die Schweißverbindungen verstehen, beurteilen und beim Lieferanten auditieren wollen: von Arbeitssicherheit und den wichtigsten Verfahren über Werkstoffe, Nahtarten und Zeichnungsangaben bis zu Schweißfehlern, Prüfverfahren und den zentralen Qualitätsnormen.',
  level: 'Grundlagen',
  duration: 'ca. 4,5 h',
  goals: [
    'Die wichtigsten Schweißverfahren und ihre Einsatzgebiete kennen',
    'Gefahren beim Schweißen erkennen und Schutzmaßnahmen benennen',
    'Schweißeignung von Stahl, Edelstahl und Aluminium einschätzen',
    'Nahtarten, Positionen und Zeichnungssymbole lesen',
    'Schweißfehler, Ursachen und Prüfverfahren zuordnen',
    'WPS, Schweißerprüfung und ISO 3834 im Audit bewerten',
  ],
  finalCount: 20,
  chapters: [
    /* ───────────── Kapitel 1 ───────────── */
    {
      id: 'k1',
      title: 'Grundlagen & Arbeitssicherheit',
      intro: 'Was passiert beim Schweißen, welche Verfahren gibt es – und wie schützt man sich vor Strahlung, Rauch, Strom, Brand und Gasen?',
      lessons: [
        {
          id: 'k1a', title: 'Was ist Schweißen? Verfahren im Überblick', min: 8,
          text: `## Definition
Schweißen ist das **unlösbare Verbinden** von Bauteilen unter Anwendung von Wärme und/oder Druck, mit oder ohne Zusatzwerkstoff. Im Unterschied zum Löten wird beim Schmelzschweißen der **Grundwerkstoff selbst aufgeschmolzen**. Es entsteht eine stoffschlüssige Verbindung, die im Idealfall so belastbar ist wie der Grundwerkstoff.

## Zwei große Gruppen
- **Schmelzschweißen:** Die Fügezone wird örtlich aufgeschmolzen, meist mit Zusatzwerkstoff (Lichtbogen, Gasflamme, Laser, Elektronenstrahl).
- **Pressschweißen:** Verbindung durch Druck, oft mit örtlicher Erwärmung (Widerstandspunktschweißen, Reibschweißen, Bolzenschweißen).

## Prozessnummern nach ISO 4063
In Zeichnungen, Schweißanweisungen und Zertifikaten werden Verfahren über **Nummern** angegeben. Die wichtigsten:

| Nr. | Verfahren | Typischer Einsatz |
|---|---|---|
| **111** | Lichtbogenhandschweißen (E-Hand) | Montage, Baustelle, Reparatur |
| **121** | Unterpulverschweißen (UP) mit Massivdraht | Dicke Bleche, lange Nähte, Behälterbau |
| **131** | MIG-Schweißen mit Massivdraht | Aluminium, Kupferwerkstoffe |
| **135** | MAG-Schweißen mit Massivdraht | Stahl – das häufigste Industrieverfahren |
| **136** | MAG-Schweißen mit Fülldraht | Stahl, hohe Abschmelzleistung, Zwangslagen |
| **141** | WIG-Schweißen | Dünnbleche, Edelstahl, Aluminium, Wurzellagen, Rohre |
| **15** | Plasmaschweißen | Präzisionsnähte, Rohre, Edelstahl |
| **21** | Widerstandspunktschweißen | Karosseriebau, Dünnbleche |
| **311** | Gasschweißen (Sauerstoff-Acetylen) | Reparatur, Installation, Ausbildung |
| **52** | Laserstrahlschweißen | Automatisierte Präzisionsnähte, Automotive |

## Der Lichtbogen
Bei den Lichtbogenverfahren brennt zwischen Elektrode und Werkstück ein elektrischer Lichtbogen mit Temperaturen von mehreren Tausend Grad Celsius. Er schmilzt Grundwerkstoff und Zusatzwerkstoff auf. Das flüssige Schweißbad muss vor der Umgebungsluft (Sauerstoff, Stickstoff) geschützt werden – durch **Schutzgas**, **Schlacke** oder **Pulver**.

## Schweißgut, WEZ und Grundwerkstoff
- **Schweißgut:** Aufgeschmolzener und wieder erstarrter Werkstoff.
- **Wärmeeinflusszone (WEZ):** Grundwerkstoff neben der Naht, der nicht geschmolzen, aber durch die Wärme im Gefüge verändert wurde. Hier entstehen oft Härte- und Rissprobleme.
- **Grundwerkstoff:** Unbeeinflusster Werkstoff.

MERKE: Schweißen verbindet Bauteile unlösbar durch Aufschmelzen (oder Druck). Verfahren werden über ISO-4063-Nummern bezeichnet – 111, 135 und 141 sollte man sicher kennen.

REFLEXION: Welche Schweißverfahren kommen bei deinen Produkten oder Lieferanten zum Einsatz – und kennst du die zugehörigen Prozessnummern?`,
        },
        {
          id: 'k1b', title: 'Arbeitssicherheit beim Schweißen', min: 9,
          text: `## Die fünf großen Gefahren
Schweißen ist eine Tätigkeit mit erheblichen Gefährdungen. Rechtliche Grundlage in Deutschland sind u. a. das Arbeitsschutzgesetz, die Gefahrstoffverordnung mit der **TRGS 528 „Schweißtechnische Arbeiten“** sowie die DGUV-Regeln. Die wichtigsten Gefahren:

## 1. Optische Strahlung
Der Lichtbogen sendet intensive **UV-, sichtbare und Infrarotstrahlung** aus.
- UV-Strahlung verursacht schon nach kurzer Zeit eine schmerzhafte Entzündung von Horn- und Bindehaut – das **„Verblitzen“**. Die Symptome treten typischerweise erst einige Stunden später auf.
- Ungeschützte Haut bekommt Verbrennungen ähnlich einem Sonnenbrand.
- Schutz: **Schweißschirm oder -helm mit passender Schutzstufe** (Filter nach EN 169, automatische Schweißerschutzfilter nach EN 379), schwer entflammbare Schutzkleidung ohne freie Hautstellen, Abschirmung (Vorhänge, Stellwände) für andere Personen.

## 2. Schweißrauch und Gase
Schweißrauch besteht aus feinsten Partikeln, die tief in die Lunge gelangen. Die Internationale Agentur für Krebsforschung (IARC) hat **Schweißrauch 2017 als krebserzeugend für den Menschen** eingestuft.
- Besonders kritisch: Schweißen von **hochlegiertem Stahl** (Chrom(VI)-, Nickelverbindungen), beschichteten Blechen (Zink), sowie **Ozon**, das durch UV-Strahlung entsteht (besonders beim MIG/WIG-Schweißen von Aluminium).
- Schutz nach **STOP-Prinzip:** Substitution (rauchärmeres Verfahren, z. B. WIG statt E-Hand bei CrNi), **Technik** (Absaugung im Entstehungsbereich, z. B. brennerintegrierte Absaugung), Organisation (Arbeitsplatzgestaltung, Unterweisung), **Persönlich** (gebläseunterstützter Atemschutz).

## 3. Elektrischer Strom
Schweißstromquellen arbeiten mit Leerlaufspannungen, die in feuchter Umgebung oder bei Kontakt mit leitfähigen Teilen gefährlich werden können.
- **Erhöhte elektrische Gefährdung** (enge Räume, Kessel, Nässe, Sitzen auf Metall): nur Stromquellen mit **S-Kennzeichnung** verwenden.
- Isolierende Unterlagen, trockene Handschuhe, intakte Kabel und Brennerschläuche, Werkstückklemme nah an der Schweißstelle.

## 4. Brand und Explosion
Schweißspritzer und glühende Partikel fliegen mehrere Meter weit und können noch lange nachglimmen.
- In brandgefährdeten Bereichen nur mit **schriftlicher Schweißerlaubnis** arbeiten.
- Brennbares entfernen oder abdecken, Löschmittel bereitstellen, **Brandwache** während und **Nachkontrolle** nach den Arbeiten (über mehrere Stunden).
- Niemals an Behältern schweißen, die brennbare Stoffe enthalten haben, ohne sie fachgerecht zu reinigen und zu inertisieren.

## 5. Lärm, Hitze, Ergonomie
Lärm (z. B. beim Fugenhobeln, Schleifen), Hitze und Zwangshaltungen über Kopf belasten zusätzlich.

ACHTUNG: Schweißrauch ist krebserzeugend. Eine wirksame Absaugung direkt an der Entstehungsstelle hat Vorrang vor allen persönlichen Schutzmaßnahmen.

MERKE: Die Hauptgefahren sind Strahlung, Rauch, Strom, Brand und Lärm. Schutzmaßnahmen folgen dem STOP-Prinzip: Substitution vor Technik vor Organisation vor persönlicher Schutzausrüstung.

REFLEXION: Wenn du das nächste Mal durch eine Schweißerei gehst: Ist die Absaugung wirklich an der Entstehungsstelle – oder nur eine Hallenlüftung?`,
        },
        {
          id: 'k1c', title: 'Gase und Gasflaschen', min: 7,
          text: `## Welche Gase werden verwendet?
- **Schutzgase** schützen das Schweißbad vor der Atmosphäre: Argon, Helium, CO₂ und Mischungen.
- **Brenngase** liefern beim Gasschweißen und Brennschneiden die Wärme: vor allem Acetylen, zusammen mit Sauerstoff.

## Schutzgase nach ISO 14175
Schutzgase werden nach ISO 14175 in Gruppen eingeteilt. Wichtige Beispiele:

| Bezeichnung | Zusammensetzung | Typische Anwendung |
|---|---|---|
| **I1** | 100 % Argon | WIG allgemein, MIG Aluminium |
| **I3** | Argon + Helium | WIG/MIG bei dickem Aluminium/Kupfer (mehr Einbrand) |
| **M21** | Argon + 15–25 % CO₂ | MAG an unlegiertem Stahl (Standard) |
| **M12 / M13** | Argon + geringer CO₂- bzw. O₂-Anteil | MAG an hochlegiertem Stahl |
| **C1** | 100 % CO₂ | MAG an Stahl (günstig, mehr Spritzer) |

**Inerte** Gase (Argon, Helium) reagieren nicht mit dem Schweißbad. **Aktive** Gase (CO₂, O₂) beeinflussen Einbrand, Tropfenübergang und Spritzerbildung – daher „MAG“ (Metall-Aktivgas) im Gegensatz zu „MIG“ (Metall-Inertgas).

## Kennzeichnung von Gasflaschen
Gasflaschen sind nach EN 1089-3 an der **Flaschenschulter** farblich gekennzeichnet. Entscheidend für die Identifikation ist aber immer das **Gefahrgutetikett**. Beispiele für Schulterfarben: Sauerstoff **weiß**, Acetylen **kastanienbraun**, Argon **dunkelgrün**, Kohlendioxid **grau**.

## Sicherer Umgang
- Flaschen **gegen Umfallen sichern** (Kette, Halterung) – eine abgerissene Flasche kann wie ein Geschoss wirken.
- Transport nur mit **Schutzkappe** und geschlossenem Ventil.
- **Acetylenflaschen** stehend verwenden; Flammenrückschlagsicherungen bei Brenngasanlagen einsetzen.
- **Sauerstoff:** Armaturen absolut **öl- und fettfrei** halten – Öl und Fett können sich in reinem Sauerstoff selbst entzünden.
- Flaschen vor Erwärmung schützen, nicht in Treppenhäusern oder Fluren lagern.

## Erstickungsgefahr
Argon und CO₂ sind schwerer als Luft, farb- und geruchlos. In Gruben, Behältern oder engen Räumen können sie sich ansammeln und den Sauerstoff verdrängen – **Erstickungsgefahr ohne Vorwarnung**. Vor dem Einstieg lüften und ggf. messen.

MERKE: Argon ist inert (MIG/WIG), Mischgase mit CO₂ sind aktiv (MAG). Flaschen immer sichern, Sauerstoff öl- und fettfrei halten, und an die Erstickungsgefahr durch schwere Schutzgase in engen Räumen denken.

REFLEXION: Werden die Gasflaschen in deinem Betrieb oder bei deinen Lieferanten korrekt gesichert und gelagert?`,
        },
      ],
      quiz: [
        { q: 'Welche Prozessnummer nach ISO 4063 steht für das MAG-Schweißen mit Massivdrahtelektrode?', o: ['111', '131', '135', '141'], a: 2, x: '135 = MAG mit Massivdraht. 111 = E-Hand, 131 = MIG mit Massivdraht, 141 = WIG.' },
        { q: 'Was unterscheidet Schmelzschweißen grundsätzlich vom Löten?', o: ['Beim Schmelzschweißen wird der Grundwerkstoff selbst aufgeschmolzen', 'Beim Löten wird immer höher erhitzt', 'Schweißen ist immer lösbar', 'Beim Schweißen wird nie Zusatzwerkstoff verwendet'], a: 0, x: 'Beim Schmelzschweißen schmilzt der Grundwerkstoff auf. Beim Löten schmilzt nur das Lot, der Grundwerkstoff bleibt fest.' },
        { q: 'Was ist die Wärmeeinflusszone (WEZ)?', o: ['Der Bereich der Halle, in dem geschweißt wird', 'Grundwerkstoff neben der Naht, dessen Gefüge durch Wärme verändert wurde, ohne zu schmelzen', 'Das aufgeschmolzene Schweißgut', 'Die Zone, in der der Schweißer steht'], a: 1, x: 'Die WEZ wurde nicht aufgeschmolzen, aber durch den Temperaturzyklus im Gefüge verändert – hier treten häufig Aufhärtung und Risse auf.' },
        { q: 'Was ist das „Verblitzen“?', o: ['Ein Kurzschluss im Schweißgerät', 'Eine Entzündung von Horn- und Bindehaut durch UV-Strahlung', 'Ein Schweißfehler', 'Das Zünden des Lichtbogens'], a: 1, x: 'Verblitzen ist eine schmerzhafte Entzündung der Augen durch UV-Strahlung des Lichtbogens. Die Symptome treten oft erst Stunden später auf.' },
        { q: 'Welche Maßnahmen entsprechen dem STOP-Prinzip in der richtigen Rangfolge?', o: ['Atemschutz – Absaugung – Unterweisung – Verfahrenswechsel', 'Substitution – technische Maßnahmen – organisatorische Maßnahmen – persönliche Schutzausrüstung', 'Persönliche Schutzausrüstung zuerst, weil sie am schnellsten wirkt', 'Organisation – Substitution – Technik – Persönlich'], a: 1, x: 'STOP: Substitution vor Technik vor Organisation vor Persönlicher Schutzausrüstung. Die Absaugung an der Entstehungsstelle (Technik) hat Vorrang vor Atemschutz.' },
        { q: 'Welche Aussagen zu Gasen beim Schweißen sind richtig?', o: ['Argon ist ein inertes Schutzgas', 'M21 ist ein Argon-CO₂-Mischgas für das MAG-Schweißen von Stahl', 'Sauerstoffarmaturen sollten gut eingefettet werden', 'Argon und CO₂ können sich in Gruben ansammeln und zum Ersticken führen'], a: [0, 1, 3], x: 'Sauerstoffarmaturen müssen öl- und fettfrei sein – Öl und Fett können sich in reinem Sauerstoff entzünden. Die anderen Aussagen sind richtig.' },
        { q: 'Welche Schulterfarbe hat eine Acetylenflasche nach EN 1089-3?', o: ['Weiß', 'Kastanienbraun', 'Dunkelgrün', 'Grau'], a: 1, x: 'Acetylen: kastanienbraun. Sauerstoff: weiß, Argon: dunkelgrün, CO₂: grau. Maßgeblich ist aber immer das Gefahrgutetikett.' },
      ],
    },

    /* ───────────── Kapitel 2 ───────────── */
    {
      id: 'k2',
      title: 'Lichtbogenschweißverfahren',
      intro: 'E-Hand, MIG/MAG und WIG decken den Großteil der industriellen Schweißarbeiten ab. Hier lernst du, wie sie funktionieren, was sie können – und wo ihre Grenzen liegen.',
      lessons: [
        {
          id: 'k2a', title: 'Lichtbogenhandschweißen (E-Hand, 111)', min: 8,
          text: `## Funktionsprinzip
Beim Lichtbogenhandschweißen brennt der Lichtbogen zwischen einer **umhüllten Stabelektrode** und dem Werkstück. Der Kernstab schmilzt ab und bildet den Zusatzwerkstoff. Die **Umhüllung** erfüllt mehrere Aufgaben:
- Sie erzeugt beim Abbrennen **Schutzgas** und **Schlacke**, die das Schweißbad schützen.
- Sie stabilisiert den Lichtbogen.
- Sie kann **Legierungselemente** zuführen.
- Die Schlacke verlangsamt die Abkühlung und formt die Naht.

## Die wichtigsten Umhüllungstypen
| Typ | Eigenschaften | Typischer Einsatz |
|---|---|---|
| **Rutil (R)** | Leicht zu zünden, ruhiger Lichtbogen, feinschuppige Naht, Schlacke gut löslich | Allgemeiner Stahlbau, Schlosserei, Ausbildung |
| **Basisch (B)** | Hohe Zähigkeit, geringer Wasserstoffgehalt, rissunempfindlich; schwieriger zu verschweißen | Dickwandige, hochbeanspruchte Bauteile, rissanfällige Stähle |
| **Zellulose (C)** | Starker Einbrand, für Fallnähte geeignet | Rohrleitungsbau (Pipeline) |

**Basische Elektroden** nehmen Feuchtigkeit aus der Luft auf. Weil Feuchtigkeit Wasserstoff ins Schweißgut bringt (Gefahr von Kaltrissen), müssen sie nach Herstellerangabe **rückgetrocknet** und warm gelagert werden (Elektrodenköcher).

## Vor- und Nachteile
| Vorteile | Nachteile |
|---|---|
| Einfache, mobile Ausrüstung, kein Gas nötig | Geringe Abschmelzleistung, Elektrodenwechsel |
| Unempfindlich gegen Wind – gut für Baustellen | Schlacke muss nach jeder Lage entfernt werden |
| Für viele Werkstoffe und alle Positionen | Relativ viel Schweißrauch |
| Geringe Investitionskosten | Stark von der Handfertigkeit des Schweißers abhängig |

## Blaswirkung
Beim Schweißen mit Gleichstrom kann das Magnetfeld den Lichtbogen ablenken („Blaswirkung“) – besonders an Blechenden und bei magnetisierten Teilen. Abhilfe: Elektrode neigen, Lage der Werkstückklemme ändern, kürzerer Lichtbogen oder Wechselstrom (wenn die Elektrode dafür geeignet ist).

TIPP: Im Lieferantenaudit lohnt ein Blick auf den Umgang mit basischen Elektroden: Gibt es einen Trockenofen, Köcher am Arbeitsplatz und eine Regel, wie lange Elektroden offen liegen dürfen?

MERKE: E-Hand ist robust, mobil und windunempfindlich, aber wenig produktiv. Rutil-Elektroden sind einfach zu verschweißen, basische liefern die beste Zähigkeit, müssen aber trocken gehalten werden.

REFLEXION: Wo setzen deine Lieferanten noch E-Hand ein – und ist das dort das passende Verfahren?`,
        },
        {
          id: 'k2b', title: 'MIG/MAG-Schweißen (131/135)', min: 9,
          text: `## Funktionsprinzip
Beim **Metall-Schutzgasschweißen (MSG)** wird eine Drahtelektrode von einer Rolle kontinuierlich durch das Schlauchpaket zum Brenner gefördert. Sie ist gleichzeitig Lichtbogenträger und Zusatzwerkstoff. Ein Schutzgas strömt aus der Gasdüse und schützt das Schweißbad.
- **MIG** (Metall-Inertgas, 131): mit inertem Gas (Argon, Helium) – für **Aluminium**, Kupfer und andere NE-Metalle.
- **MAG** (Metall-Aktivgas, 135): mit aktiven Mischgasen (Argon + CO₂ oder O₂) oder reinem CO₂ – für **un- und niedriglegierte Stähle** und mit speziellen Gasen für hochlegierte Stähle.
- **Fülldraht (136/138):** Statt Massivdraht ein Röhrchendraht mit Pulverfüllung – höhere Abschmelzleistung, gute Positionsschweißeignung.

## Die Lichtbogenarten
Je nach Stromstärke, Spannung und Gas stellt sich ein anderer **Werkstoffübergang** ein:

| Lichtbogenart | Leistung | Eigenschaften | Einsatz |
|---|---|---|---|
| **Kurzlichtbogen** | Niedrig | Tropfen gehen im Kurzschluss über, geringe Wärme | Dünnbleche, Wurzellagen, Zwangslagen |
| **Übergangslichtbogen** | Mittel | Unregelmäßig, viele Spritzer | Möglichst vermeiden |
| **Sprühlichtbogen** | Hoch | Feine Tropfen, kaum Spritzer, tiefer Einbrand; braucht argonreiches Gas | Dicke Bleche, Wannen- und Horizontallage |
| **Impulslichtbogen** | Gesteuert | Strompulse lösen je einen Tropfen ab – spritzerarm, gute Kontrolle | Aluminium, Edelstahl, Zwangslagen |

## Vor- und Nachteile
| Vorteile | Nachteile |
|---|---|
| Hohe Abschmelzleistung und Schweißgeschwindigkeit | Schutzgas ist windempfindlich (Baustelle schwierig) |
| Gut mechanisierbar und robotergeeignet | Gefahr von **Bindefehlern** bei falschen Parametern |
| Kaum Nacharbeit, keine Schlacke (bei Massivdraht) | Aufwendigere Ausrüstung als E-Hand |
| Für viele Werkstoffe und Dicken | Sorgfältige Wartung von Drahtförderung und Brenner nötig |

## Typische Fehlerquellen in der Praxis
- **Zu geringer Gasschutz** (Zugluft, verschmutzte Gasdüse, falscher Durchfluss) → Poren.
- **Zu „kalte“ Parameter** bei dicken Blechen (Kurzlichtbogen) → Bindefehler, die man von außen oft **nicht sieht**.
- **Probleme bei der Drahtförderung** (verschlissene Kontaktrohre, falsche Rollen) → instabiler Lichtbogen.

ACHTUNG: Bindefehler beim MAG-Schweißen sind tückisch: Die Naht kann äußerlich perfekt aussehen, während sie innen nicht mit dem Grundwerkstoff verbunden ist. Deshalb sind qualifizierte Schweißanweisungen und Verfahrensprüfungen so wichtig.

MERKE: MIG mit inertem Gas für Aluminium & Co., MAG mit aktivem Gas für Stahl. MSG ist produktiv und automatisierbar – die Parameterwahl entscheidet über Poren und Bindefehler.

REFLEXION: Wie werden bei deinen Lieferanten die MAG-Parameter festgelegt und überwacht – frei nach Gefühl oder nach qualifizierter WPS?`,
        },
        {
          id: 'k2c', title: 'WIG-Schweißen (141)', min: 8,
          text: `## Funktionsprinzip
Beim **Wolfram-Inertgasschweißen** brennt der Lichtbogen zwischen einer **nicht abschmelzenden Wolframelektrode** und dem Werkstück. Zusatzwerkstoff wird – falls nötig – als Stab von Hand zugeführt (oder als Kaltdraht mechanisiert). Als Schutzgas dient meist **Argon**, für mehr Einbrand auch Argon-Helium-Gemische.

Weil Wärmeeintrag und Zusatzwerkstoff **getrennt** geregelt werden, ist WIG das Verfahren mit der besten Kontrolle über das Schweißbad.

## Stromart und Polung
| Stromart | Werkstoffe | Warum |
|---|---|---|
| **Gleichstrom, Elektrode am Minuspol** | Stahl, Edelstahl, Kupfer, Titan, Nickel | Elektrode bleibt kühl, Wärme konzentriert sich im Werkstück |
| **Wechselstrom** | Aluminium, Magnesium | Die Plus-Halbwelle bricht die zähe **Oxidschicht** auf (Reinigungswirkung), die Minus-Halbwelle kühlt die Elektrode |

## Wolframelektroden
Wolframelektroden werden nach ISO 6848 farblich gekennzeichnet, z. B. **WP** (reines Wolfram, grün), **WC20** (Cer, grau), **WL15** (Lanthan, gold) oder **WT20** (Thorium, rot). Thoriumhaltige Elektroden sind **schwach radioaktiv** – beim Anschleifen entsteht strahlender Staub. Sie werden deshalb zunehmend durch Cer- oder Lanthan-Elektroden ersetzt.

## Vor- und Nachteile
| Vorteile | Nachteile |
|---|---|
| Höchste Nahtqualität, keine Spritzer, keine Schlacke | Geringe Schweißgeschwindigkeit und Abschmelzleistung |
| Hervorragend für Dünnbleche, Wurzellagen und Rohre | Hohe Anforderungen an die Handfertigkeit |
| Nahezu alle schweißbaren Metalle | Windempfindlich, saubere Oberflächen nötig |
| Wenig Rauch | Teurer pro Meter Naht |

## Wurzelschutz
Bei Edelstahl und Titan muss auch die **Nahtrückseite** vor Sauerstoff geschützt werden, sonst oxidiert die Wurzel stark und verliert ihre Korrosionsbeständigkeit. Dafür wird die Rückseite mit **Formiergas** (z. B. Stickstoff-Wasserstoff-Gemisch oder Argon) gespült.

BEISPIEL: Eine typische Kombination im Rohrleitungsbau: Wurzellage mit WIG (141) für eine saubere, durchgeschweißte Wurzel, Füll- und Decklagen mit E-Hand (111) oder MAG (135) für höhere Produktivität – in Zeichnungen und WPS z. B. als „141/111“ angegeben.

MERKE: WIG bietet die beste Kontrolle und Nahtqualität, ist aber langsam. Stahl und Edelstahl mit Gleichstrom (Elektrode minus), Aluminium mit Wechselstrom wegen der Oxidschicht.

REFLEXION: Für welche Bauteile in deinem Umfeld wäre WIG die richtige Wahl – und wo wäre es unnötig teuer?`,
        },
      ],
      quiz: [
        { q: 'Welche Aufgaben erfüllt die Umhüllung einer Stabelektrode?', o: ['Erzeugt Schutzgas und Schlacke', 'Stabilisiert den Lichtbogen', 'Kühlt das Werkstück ab', 'Kann Legierungselemente zuführen'], a: [0, 1, 3], x: 'Die Umhüllung liefert Schutzgas und Schlacke, stabilisiert den Lichtbogen und kann legieren. Kühlen gehört nicht zu ihren Aufgaben – die Schlacke verlangsamt eher die Abkühlung.' },
        { q: 'Warum müssen basische Elektroden rückgetrocknet und trocken gelagert werden?', o: ['Damit sie leichter zünden', 'Feuchtigkeit bringt Wasserstoff ins Schweißgut und erhöht die Kaltrissgefahr', 'Damit die Naht glänzender wird', 'Weil sie sonst rosten'], a: 1, x: 'Basische Umhüllungen nehmen Feuchtigkeit auf. Diese zerfällt im Lichtbogen und bringt Wasserstoff ein – eine Hauptursache für wasserstoffinduzierte Kaltrisse.' },
        { q: 'Welches Verfahren eignet sich am ehesten für Montageschweißungen auf einer windigen Baustelle?', o: ['MIG-Schweißen (131)', 'WIG-Schweißen (141)', 'Lichtbogenhandschweißen (111)', 'Laserstrahlschweißen (52)'], a: 2, x: 'E-Hand ist windunempfindlich, da kein externes Schutzgas verwendet wird, und die Ausrüstung ist mobil.' },
        { q: 'Was unterscheidet MIG von MAG?', o: ['MIG verwendet inertes Schutzgas, MAG aktives Schutzgas', 'MIG ist manuell, MAG ist automatisiert', 'MIG nutzt eine Wolframelektrode', 'MAG ist nur für Aluminium geeignet'], a: 0, x: 'MIG = Metall-Inertgas (Argon, Helium) z. B. für Aluminium; MAG = Metall-Aktivgas (mit CO₂/O₂) für Stähle.' },
        { q: 'Welche Lichtbogenart eignet sich besonders für Dünnbleche und Zwangslagen beim MAG-Schweißen?', o: ['Sprühlichtbogen', 'Kurzlichtbogen', 'Übergangslichtbogen', 'Langlichtbogen'], a: 1, x: 'Der Kurzlichtbogen bringt wenig Wärme ein und ist gut kontrollierbar – ideal für dünne Bleche, Wurzeln und Zwangslagen.' },
        { q: 'Warum wird Aluminium beim WIG-Schweißen meist mit Wechselstrom geschweißt?', o: ['Weil Gleichstrom bei Aluminium nicht zündet', 'Die Plus-Halbwelle bricht die zähe Oxidschicht auf', 'Weil Wechselstrom billiger ist', 'Damit die Elektrode schneller abschmilzt'], a: 1, x: 'Aluminiumoxid schmilzt erst bei rund 2050 °C. Die Plus-Halbwelle des Wechselstroms hat eine Reinigungswirkung und bricht die Oxidschicht auf.' },
        { q: 'Welches Problem ist beim MAG-Schweißen besonders tückisch, weil es von außen oft nicht sichtbar ist?', o: ['Spritzer', 'Bindefehler', 'Anlauffarben', 'Nahtüberhöhung'], a: 1, x: 'Bindefehler entstehen u. a. bei zu „kalten“ Parametern. Die Oberfläche kann einwandfrei aussehen, obwohl keine Verbindung zum Grundwerkstoff besteht.' },
      ],
    },

    /* ───────────── Kapitel 3 ───────────── */
    {
      id: 'k3',
      title: 'Werkstoffe & Schweißeignung',
      intro: 'Nicht jeder Werkstoff lässt sich gleich gut schweißen. Hier lernst du, worauf es bei Baustahl, Edelstahl und Aluminium ankommt – und wie Wärme und Verzug zusammenhängen.',
      lessons: [
        {
          id: 'k3a', title: 'Stähle, Kohlenstoffäquivalent & Vorwärmen', min: 9,
          text: `## Schweißbarkeit ist ein Zusammenspiel
Ob ein Bauteil sicher geschweißt werden kann, hängt von drei Dingen ab:
- **Schweißeignung** des Werkstoffs (Chemie, Gefüge),
- **Schweißsicherheit** der Konstruktion (Dicke, Steifigkeit, Spannungen),
- **Schweißmöglichkeit** in der Fertigung (Verfahren, Vorbereitung, Personal).

## Kohlenstoff ist der wichtigste Faktor
Je mehr **Kohlenstoff** (und bestimmte Legierungselemente) ein Stahl enthält, desto stärker **härtet** die WEZ beim schnellen Abkühlen auf. Hartes, sprödes Gefüge (Martensit) ist anfällig für Risse.

Um den Einfluss aller Elemente zusammenzufassen, nutzt man das **Kohlenstoffäquivalent (CE)**, z. B. nach IIW:

**CE = C + Mn/6 + (Cr + Mo + V)/5 + (Ni + Cu)/15** (Gehalte in %)

Als grobe Orientierung:
- **CE bis ca. 0,40:** in der Regel gut schweißbar ohne besondere Maßnahmen.
- **CE darüber (etwa ab 0,45):** zunehmende Aufhärtungs- und Kaltrissgefahr – **Vorwärmen** und kontrollierte Bedingungen werden nötig.

Unlegierte Baustähle wie S235 oder S355 sind in üblichen Dicken gut schweißbar. Bei höherfesten Feinkornbaustählen, Vergütungsstählen und großen Wanddicken steigen die Anforderungen.

## Kaltrisse (wasserstoffinduzierte Risse)
Kaltrisse entstehen, wenn **drei Faktoren** zusammenkommen:
1. **Aufgehärtetes Gefüge** (hoher CE, schnelle Abkühlung, dicke Bleche)
2. **Wasserstoff** im Schweißgut (feuchte Elektroden, Rost, Öl, Kondenswasser)
3. **Zugeigenspannungen** (steife Konstruktion, Schrumpfung)

Kaltrisse können **verzögert** auftreten – Stunden bis Tage nach dem Schweißen. Deshalb werden bei rissgefährdeten Stählen Prüfungen erst nach einer **Wartezeit** durchgeführt.

## Warum Vorwärmen hilft
- Es verlangsamt die **Abkühlung** → weniger Aufhärtung.
- Wasserstoff kann besser **ausdiffundieren**.
- Es entfernt Feuchtigkeit von der Oberfläche.

Die notwendige Vorwärmtemperatur hängt von CE, Blechdicke, Wasserstoffgehalt und Wärmeeinbringung ab (Berechnung z. B. nach EN 1011-2). Wichtig sind auch die maximale **Zwischenlagentemperatur** und die **Abkühlzeit t8/5** (Zeit zwischen 800 und 500 °C), die das Gefüge bestimmt.

TIPP: Fragt ein Lieferant nach „Vorwärmen ja oder nein?“, ist das ein gutes Zeichen. Gefährlicher sind Betriebe, die bei dicken, höherfesten Stählen gar nicht darüber nachdenken – prüfe, ob die WPS eine Vorwärm- und Zwischenlagentemperatur festlegt und wie sie gemessen wird.

MERKE: Je höher das Kohlenstoffäquivalent und die Wanddicke, desto größer die Kaltrissgefahr. Kaltrisse brauchen Aufhärtung, Wasserstoff und Spannung – Vorwärmen und trockene Zusatzwerkstoffe wirken dagegen.

REFLEXION: Welche Stahlsorten und Wanddicken werden bei deinen Produkten geschweißt – und wäre dort Vorwärmen ein Thema?`,
        },
        {
          id: 'k3b', title: 'Edelstahl und Aluminium', min: 9,
          text: `## Austenitischer Edelstahl (z. B. 1.4301, 1.4404)
Nichtrostende Stähle erhalten ihre Korrosionsbeständigkeit durch eine dünne **Chromoxid-Passivschicht** (mind. ca. 10,5 % Chrom). Beim Schweißen gilt es, diese Eigenschaft zu erhalten.

**Besonderheiten:**
- **Wärmeausdehnung** etwa 1,5-mal so groß wie bei Baustahl, **Wärmeleitfähigkeit** deutlich geringer → **mehr Verzug**. Wärmeeinbringung gering halten.
- **Anlauffarben** (gelb, blau, braun) sind Oxidschichten mit Chromverarmung darunter – sie **verringern die Korrosionsbeständigkeit**. Sie müssen je nach Anforderung durch **Beizen**, Bürsten oder Schleifen entfernt werden.
- **Fremdeisen vermeiden:** Werkzeuge, Bürsten und Schleifscheiben, die für Baustahl benutzt wurden, verschleppen Eisenpartikel → Rostflecken (Flugrost). Getrennte Werkzeuge und Fertigungsbereiche!
- **Sensibilisierung:** Bei längerem Aufenthalt im Bereich von etwa 450–850 °C bilden sich Chromkarbide an den Korngrenzen → interkristalline Korrosion. Abhilfe: Stähle mit niedrigem Kohlenstoffgehalt („L“-Qualitäten wie 1.4307/1.4404) oder titanstabilisierte Stähle.
- **Heißrissgefahr:** Zusatzwerkstoffe mit einem gewissen **Deltaferrit-Anteil** verringern sie.
- **Wurzelschutz** mit Formiergas, damit auch die Rückseite nicht oxidiert.

## Aluminium und Aluminiumlegierungen
**Besonderheiten:**
- **Oxidschicht:** Aluminium schmilzt bei rund 660 °C, seine Oxidschicht aber erst bei ca. 2050 °C. Die Oxidschicht muss kurz vor dem Schweißen entfernt (Edelstahlbürste, Beizen) bzw. im Lichtbogen aufgebrochen werden.
- **Hohe Wärmeleitfähigkeit:** Die Wärme fließt schnell ab – bei dickeren Teilen ist **Vorwärmen** oder ein Ar-He-Gemisch hilfreich.
- **Keine Farbänderung:** Aluminium zeigt vor dem Schmelzen keine Glühfarbe – das macht das Schweißen anspruchsvoll.
- **Porenanfälligkeit:** Flüssiges Aluminium löst viel Wasserstoff, der beim Erstarren als Poren zurückbleibt. Ursache sind Feuchtigkeit, Öl, Fett und Oxide → **Sauberkeit ist das A und O**.
- **Festigkeitsverlust in der WEZ:** Bei aushärtbaren Legierungen (z. B. 6xxx-Reihe wie EN AW-6082) sinkt die Festigkeit neben der Naht deutlich. Das muss in der Konstruktion berücksichtigt werden.
- Verfahren: **MIG (131)** mit Impulslichtbogen oder **WIG (141)** mit Wechselstrom; Schutzgas Argon oder Argon-Helium.

ACHTUNG: Bei Aluminium kommen die meisten Poren aus mangelnder Sauberkeit: Oxidschicht, Feuchtigkeit, Öl und Fett. Reinigung kurz vor dem Schweißen ist Pflicht – nicht am Vortag.

MERKE: Edelstahl: Wärme begrenzen, Anlauffarben entfernen, Fremdeisen vermeiden. Aluminium: Oxidschicht entfernen, sauber arbeiten, Wärmeabfuhr und Festigkeitsverlust in der WEZ beachten.

REFLEXION: Wie werden Edelstahl- und Baustahlfertigung bei deinen Lieferanten getrennt – räumlich, bei Werkzeugen und bei der Lagerung?`,
        },
        {
          id: 'k3c', title: 'Wärmeeinbringung und Verzug', min: 8,
          text: `## Wärmeeinbringung berechnen
Die **Streckenenergie** bzw. **Wärmeeinbringung Q** beschreibt, wie viel Energie pro Millimeter Naht eingebracht wird:

**Q = k × (U × I) / v**

- **U** = Lichtbogenspannung in Volt
- **I** = Schweißstrom in Ampere
- **v** = Schweißgeschwindigkeit
- **k** = thermischer Wirkungsgrad des Verfahrens (nach EN 1011-1 z. B. 0,8 für 111 und 135, 0,6 für 141, 1,0 für 121)

Die Wärmeeinbringung beeinflusst Gefüge, Zähigkeit, Härte und Verzug. Viele Schweißanweisungen legen dafür einen **zulässigen Bereich** fest.

BEISPIEL: MAG (135), 25 V, 220 A, 300 mm/min = 5 mm/s. Q = 0,8 × 25 × 220 / 5 = 880 J/mm = **0,88 kJ/mm**.

## Wie Verzug entsteht
Das Schweißgut dehnt sich beim Erwärmen aus und **schrumpft** beim Abkühlen. Weil der kalte Werkstoff ringsum diese Schrumpfung behindert, entstehen **Eigenspannungen** – und wo das Bauteil nachgeben kann, **Verzug**.

Typische Verzugsarten:
- **Längsschrumpfung** entlang der Naht
- **Querschrumpfung** quer zur Naht
- **Winkelverzug** – die Bleche klappen zur Nahtseite hoch (besonders bei einseitigen V-Nähten und Kehlnähten)

## Verzug minimieren
1. **Nahtvolumen klein halten:** Kein überdimensioniertes a-Maß, optimale Fugenform (z. B. X- statt V-Naht bei dicken Blechen).
2. **Wärmeeinbringung begrenzen:** Passende Parameter, ggf. Verfahren mit konzentrierter Wärme (z. B. Laser).
3. **Symmetrisch schweißen:** Nähte wechselseitig und um die Schwerachse verteilt legen.
4. **Schweißfolge planen:** Von der Mitte nach außen, von steif nach frei; **Pilgerschrittverfahren** bei langen Nähten.
5. **Vorhalten:** Teile vorab in entgegengesetzter Richtung verbiegen/anstellen, sodass sie sich „gerade ziehen“.
6. **Spannen und Heften:** Vorrichtungen, ausreichende Heftstellen – aber Achtung: Starres Einspannen erhöht die Eigenspannungen.
7. **Richten** als letzte Möglichkeit (mechanisch oder Flammrichten) – kostet Zeit und kann Werkstoffeigenschaften verändern.

MERKE: Wärmeeinbringung = k × U × I / v. Verzug entsteht durch behinderte Schrumpfung. Weniger Nahtvolumen, weniger Wärme, symmetrische Schweißfolge und Vorhalten sind die wirksamsten Gegenmittel.

REFLEXION: Gibt es Bauteile in deinem Umfeld, bei denen Verzug ein Dauerproblem ist? Welche der sieben Maßnahmen wurde schon versucht?`,
        },
      ],
      quiz: [
        { q: 'Welches Element hat den größten Einfluss auf die Aufhärtung von Stahl beim Schweißen?', o: ['Kohlenstoff', 'Kupfer', 'Aluminium', 'Silizium'], a: 0, x: 'Kohlenstoff ist der wichtigste Faktor für die Aufhärtung. Andere Elemente werden über das Kohlenstoffäquivalent gewichtet einbezogen.' },
        { q: 'Welche drei Faktoren müssen für die Entstehung von Kaltrissen zusammenkommen?', o: ['Aufgehärtetes Gefüge, Wasserstoff, Zugeigenspannungen', 'Hohe Temperatur, Sauerstoff, Druck', 'Schwefel, Phosphor, Stickstoff', 'Feuchtigkeit, Wind, Kälte'], a: 0, x: 'Kaltrisse entstehen durch das Zusammenwirken von hartem Gefüge, Wasserstoff im Schweißgut und Zugspannungen.' },
        { q: 'Warum hilft Vorwärmen gegen Kaltrisse?', o: ['Es verlangsamt die Abkühlung', 'Es lässt Wasserstoff besser ausdiffundieren', 'Es erhöht den Kohlenstoffgehalt', 'Es entfernt Feuchtigkeit von der Oberfläche'], a: [0, 1, 3], x: 'Vorwärmen verlangsamt die Abkühlung (weniger Aufhärtung), fördert die Wasserstoffeffusion und trocknet die Oberfläche. Den Kohlenstoffgehalt ändert es nicht.' },
        { q: 'Warum verzieht sich austenitischer Edelstahl beim Schweißen stärker als Baustahl?', o: ['Höhere Wärmeausdehnung und geringere Wärmeleitfähigkeit', 'Er ist weicher', 'Er schmilzt bei viel niedrigerer Temperatur', 'Wegen der Chromoxidschicht'], a: 0, x: 'Die Wärmeausdehnung ist rund 1,5-mal so groß, die Wärmeleitfähigkeit deutlich geringer – die Wärme bleibt lokal und dehnt stärker aus.' },
        { q: 'Warum müssen Anlauffarben an Edelstahlnähten oft entfernt werden?', o: ['Rein aus optischen Gründen', 'Sie verringern die Korrosionsbeständigkeit', 'Sie erhöhen das Gewicht', 'Sie leiten Strom'], a: 1, x: 'Unter den Anlauffarben ist der Werkstoff an Chrom verarmt – die Korrosionsbeständigkeit sinkt. Entfernung z. B. durch Beizen.' },
        { q: 'Was ist die häufigste Ursache für Poren beim Schweißen von Aluminium?', o: ['Zu niedrige Hallentemperatur', 'Wasserstoff aus Feuchtigkeit, Öl, Fett und Oxiden', 'Zu viel Argon', 'Zu dicker Zusatzdraht'], a: 1, x: 'Flüssiges Aluminium löst viel Wasserstoff, der beim Erstarren als Poren zurückbleibt. Gründliche Reinigung kurz vor dem Schweißen ist entscheidend.' },
        { q: 'MAG-Schweißen (k = 0,8) mit 24 V, 200 A und 4 mm/s. Wie groß ist die Wärmeeinbringung?', o: ['0,96 kJ/mm', '1,2 kJ/mm', '0,6 kJ/mm', '9,6 kJ/mm'], a: 0, x: 'Q = 0,8 × 24 × 200 / 4 = 960 J/mm = 0,96 kJ/mm.' },
        { q: 'Welche Maßnahme verringert Verzug NICHT?', o: ['Symmetrische Schweißfolge', 'Überdimensioniertes a-Maß „zur Sicherheit“', 'Vorhalten der Bauteile', 'X-Naht statt V-Naht bei dicken Blechen'], a: 1, x: 'Ein größeres a-Maß bedeutet mehr Nahtvolumen, mehr Wärme und mehr Schrumpfung – also mehr Verzug.' },
      ],
    },

    /* ───────────── Kapitel 4 ───────────── */
    {
      id: 'k4',
      title: 'Nahtarten, Positionen & Zeichnungen',
      intro: 'Wer Schweißkonstruktionen beurteilen will, muss die „Sprache“ der Schweißtechnik lesen können: Stoßarten, Nahtformen, Schweißpositionen und die symbolische Darstellung in Zeichnungen.',
      lessons: [
        {
          id: 'k4a', title: 'Stoßarten, Nahtformen und Nahtvorbereitung', min: 8,
          text: `## Stoßarten
Der **Stoß** beschreibt, wie die Bauteile zueinander angeordnet sind:
- **Stumpfstoß:** Teile liegen in einer Ebene und stoßen stirnseitig aneinander.
- **T-Stoß:** Ein Teil steht senkrecht auf dem anderen.
- **Eckstoß:** Zwei Teile treffen sich an ihren Kanten unter einem Winkel.
- **Überlappstoß:** Teile liegen überlappend aufeinander.
- **Kreuzstoß:** Zwei Teile stoßen von beiden Seiten auf ein durchgehendes Teil.

## Nahtformen
Die **Naht** ist die Art, wie der Stoß verschweißt wird. Die zwei Grundtypen:

**Stumpfnähte** (meist am Stumpfstoß):
| Naht | Beschreibung | Typischer Einsatz |
|---|---|---|
| **I-Naht** | Keine Fugenvorbereitung, Kanten gerade | Dünne Bleche |
| **V-Naht** | Kanten V-förmig angeschrägt (meist ca. 60° Öffnungswinkel) | Mittlere Dicken, einseitig zugänglich |
| **X-Naht (DV)** | Beidseitige V-Fuge | Dicke Bleche, beidseitig zugänglich – weniger Volumen, weniger Winkelverzug |
| **Y-, U-, HV-Naht** | Varianten mit Steg, U-Form oder einseitiger Anschrägung | Je nach Dicke, Zugänglichkeit, Stoßart |

**Kehlnähte** (an T-, Eck- und Überlappstößen): Die Naht liegt in der Ecke zwischen den Teilen, ihr Querschnitt ist annähernd dreieckig. Kehlnähte sind die **häufigste Nahtart** im Stahlbau.

## Durchgeschweißt oder nicht?
- **Voll durchgeschweißte Nähte** verbinden den gesamten Querschnitt – sie sind für hoch beanspruchte Stumpfstöße üblich.
- **Nicht durchgeschweißte Nähte** sind wirtschaftlicher, müssen aber bewusst so ausgelegt sein. Eine ungewollt nicht durchgeschweißte Naht ist ein **Fehler**.

## Nahtvorbereitung (ISO 9692-1)
Die Norm ISO 9692-1 gibt empfohlene Fugenformen für Stahl abhängig von Verfahren und Dicke an – z. B. Öffnungswinkel, Stegabstand (Spalt) und Steghöhe. Eine saubere, maßhaltige Fugenvorbereitung ist Voraussetzung für fehlerfreie Nähte:
- **Zu kleiner Spalt / Winkel** → ungenügende Durchschweißung, Bindefehler.
- **Zu großer Spalt** → Durchfallen, mehr Volumen, mehr Verzug.
- **Kantenversatz** → Kerbwirkung, Wurzelfehler.
- **Verunreinigte Fugenflanken** (Rost, Zunder, Öl, Farbe) → Poren und Bindefehler.

MERKE: Stoßart = Anordnung der Teile, Nahtart = Art der Verbindung. Stumpfnähte (I, V, X …) und Kehlnähte sind die Grundtypen. Eine maßhaltige, saubere Fugenvorbereitung entscheidet über die Nahtqualität.

REFLEXION: Welche Nahtformen siehst du am häufigsten auf den Zeichnungen deiner Produkte?`,
        },
        {
          id: 'k4b', title: 'Schweißpositionen nach ISO 6947', min: 6,
          text: `## Warum Positionen wichtig sind
Die Lage der Naht im Raum beeinflusst massiv, wie schwierig das Schweißen ist: Das flüssige Schweißbad folgt der Schwerkraft. Schweißpositionen sind deshalb Teil jeder **Schweißanweisung (WPS)** und jeder **Schweißerprüfung** – ein Schweißer ist nur für die Positionen qualifiziert, die er geprüft hat (und die davon abgedeckt sind).

## Die Hauptpositionen
| Kurzzeichen | Bezeichnung | Beschreibung |
|---|---|---|
| **PA** | Wannenposition | Von oben, Naht liegt horizontal – die einfachste Position |
| **PB** | Horizontal-Vertikalposition | Kehlnaht an T-Stoß, von oben schräg |
| **PC** | Querposition | Naht verläuft horizontal an einer senkrechten Wand |
| **PD** | Horizontal-Überkopfposition | Kehlnaht über Kopf, schräg von unten |
| **PE** | Überkopfposition | Von unten, Naht horizontal über Kopf |
| **PF** | Steigposition | Senkrecht, von unten nach oben geschweißt |
| **PG** | Fallposition | Senkrecht, von oben nach unten geschweißt |

Für Rohre gibt es zusätzlich z. B. **PH** (steigend am feststehenden Rohr) und **PJ** (fallend) sowie Positionen am geneigten Rohr (z. B. H-L045).

## Praxisrelevanz
- **PA und PB** sind am produktivsten – Bauteile werden daher wenn möglich mit **Positionierern** oder Drehvorrichtungen in diese Lagen gebracht.
- **PF** (steigend) liefert guten Einbrand, erfordert aber Geschick und kleinere Parameter.
- **PG** (fallend) ist schnell, birgt aber eine erhöhte **Bindefehlergefahr**, weil das Schweißbad vorlaufen kann.
- **PE** (Überkopf) ist körperlich anstrengend und anspruchsvoll.

TIPP: Im Audit lohnt der Abgleich: Werden Nähte in der Fertigung in Positionen geschweißt, für die die Schweißer und die WPS gar nicht qualifiziert sind (z. B. Fallnaht PG, obwohl nur PF geprüft wurde)?

MERKE: PA (Wanne) ist die einfachste Position, PE (Überkopf) eine der schwierigsten. PF ist steigend, PG fallend. Schweißer und WPS müssen für die tatsächlich geschweißten Positionen qualifiziert sein.

REFLEXION: In welchen Positionen werden die kritischen Nähte deiner Bauteile tatsächlich geschweißt?`,
        },
        {
          id: 'k4c', title: 'Schweißsymbole und a-Maß (ISO 2553)', min: 9,
          text: `## Aufbau einer Schweißangabe
Nach ISO 2553 werden Schweißnähte in Zeichnungen symbolisch dargestellt. Eine Angabe besteht aus:
1. **Pfeillinie:** zeigt auf den Stoß.
2. **Bezugslinie:** Vollinie, im häufig genutzten System A zusätzlich mit einer **gestrichelten Linie** (Identifikationslinie).
3. **Grundsymbol:** zeigt die Nahtart, z. B. Dreieck für Kehlnaht, „V“ für V-Naht, zwei parallele Striche für I-Naht.
4. **Maße:** vor dem Symbol die Nahtdicke (z. B. a5), dahinter die Länge.
5. **Gabel** am Ende: optionale Zusatzangaben wie **Prozessnummer** (z. B. 135), Bewertungsgruppe oder Schweißposition.

## Pfeilseite und Gegenseite
- Symbol auf der **Volllinie** → Naht auf der **Pfeilseite** (dort, wo der Pfeil hinzeigt).
- Symbol auf der **gestrichelten Linie** → Naht auf der **Gegenseite**.
- Symbole auf beiden Seiten → beidseitige Naht (z. B. Doppelkehlnaht).

## Zusatzsymbole
- **Kreis** am Knick zwischen Pfeil- und Bezugslinie → Naht **ringsum** verlaufend.
- **Fähnchen** → **Baustellennaht** (wird erst bei der Montage geschweißt).
- Weitere Symbole beschreiben z. B. eine flache, gewölbte oder hohle Nahtoberfläche oder eine Wurzelunterlage.

## Das a-Maß bei Kehlnähten
Das **a-Maß** ist die **Nahtdicke** einer Kehlnaht: die Höhe des größten gleichschenkligen Dreiecks, das sich in den Nahtquerschnitt einzeichnen lässt. Es ist das maßgebliche Maß für die **Tragfähigkeit**.

Alternativ kann die **Schenkellänge z** angegeben werden. Bei einer gleichschenkligen 90°-Kehlnaht gilt näherungsweise: **z ≈ 1,4 × a** (genauer z = a × √2).

## Faustregeln für das a-Maß (Stahl)
- Mindestens **3 mm** (übliche Anforderung im Stahlbau).
- Höchstens etwa **0,7 × kleinste Blechdicke** – mehr bringt kaum Tragfähigkeit, aber viel Verzug und Kosten.
- Das Nahtvolumen wächst mit dem **Quadrat** des a-Maßes: Aus a4 wird a6 → mehr als doppelt so viel Schweißgut.

BEISPIEL: Angabe „a5 ▷ 4×50 (100)“ an einer Kehlnaht: Kehlnaht mit a-Maß 5 mm, unterbrochen geschweißt mit 4 Einzelnähten à 50 mm Länge bei 100 mm Teilung. Steht in der Gabel „135“, ist MAG-Schweißen vorgeschrieben.

ACHTUNG: „Zu dick“ ist nicht „sicherer“. Überdimensionierte Kehlnähte erhöhen Verzug, Eigenspannungen und Kosten – und können auf Konstruktionsfehler oder fehlende Vorgaben hinweisen.

MERKE: Symbol auf der Volllinie = Pfeilseite, auf der Strichlinie = Gegenseite. Das a-Maß ist die Höhe des eingeschriebenen gleichschenkligen Dreiecks und bestimmt die Tragfähigkeit einer Kehlnaht; z ≈ 1,4 × a.

REFLEXION: Schau dir eine Schweißzeichnung aus deinem Umfeld an: Kannst du alle Angaben (Symbol, Seite, Maß, Prozess, Bewertungsgruppe) sicher lesen?`,
        },
      ],
      quiz: [
        { q: 'Welche Nahtart ist im Stahlbau die häufigste?', o: ['I-Naht', 'V-Naht', 'Kehlnaht', 'U-Naht'], a: 2, x: 'Kehlnähte an T-, Eck- und Überlappstößen sind die häufigste Nahtart im Stahlbau.' },
        { q: 'Welchen Vorteil hat eine X-Naht gegenüber einer V-Naht bei dicken Blechen?', o: ['Weniger Nahtvolumen und weniger Winkelverzug', 'Sie ist nur von einer Seite zu schweißen', 'Sie braucht keine Fugenvorbereitung', 'Sie ist immer nicht durchgeschweißt'], a: 0, x: 'Die beidseitige Fuge reduziert das Nahtvolumen und gleicht den Winkelverzug durch wechselseitiges Schweißen aus – setzt aber beidseitige Zugänglichkeit voraus.' },
        { q: 'Was bezeichnet die Schweißposition PF?', o: ['Wannenposition', 'Überkopfposition', 'Steigposition (senkrecht, von unten nach oben)', 'Fallposition (senkrecht, von oben nach unten)'], a: 2, x: 'PF = Steigposition. PG = Fallposition, PA = Wannenposition, PE = Überkopfposition.' },
        { q: 'Welche Schweißposition ist die einfachste?', o: ['PA', 'PC', 'PE', 'PG'], a: 0, x: 'In der Wannenposition PA liegt das Schweißbad horizontal und wird von oben geschweißt – die günstigste und produktivste Lage.' },
        { q: 'In einer Zeichnung (ISO 2553, System A) steht das Kehlnahtsymbol auf der gestrichelten Linie. Wo liegt die Naht?', o: ['Auf der Pfeilseite', 'Auf der Gegenseite', 'Ringsum', 'Es handelt sich um eine Baustellennaht'], a: 1, x: 'Symbol auf der Volllinie = Pfeilseite; Symbol auf der gestrichelten Linie = Gegenseite.' },
        { q: 'Was bedeutet ein Fähnchen am Knick der Pfeillinie?', o: ['Naht ringsum', 'Baustellennaht', 'Naht muss geprüft werden', 'Naht ist besonders wichtig'], a: 1, x: 'Das Fähnchen kennzeichnet eine Baustellennaht, die erst bei der Montage geschweißt wird. Ein Kreis bedeutet „ringsum“.' },
        { q: 'Eine gleichschenklige 90°-Kehlnaht hat das a-Maß 5 mm. Wie groß ist die Schenkellänge z ungefähr?', o: ['3,5 mm', '5 mm', '7 mm', '10 mm'], a: 2, x: 'z ≈ a × √2 ≈ 5 × 1,41 ≈ 7 mm.' },
        { q: 'Welche Aussagen zum a-Maß sind richtig?', o: ['Es ist die Höhe des größten eingeschriebenen gleichschenkligen Dreiecks', 'Es bestimmt maßgeblich die Tragfähigkeit der Kehlnaht', 'Je größer, desto besser – ohne Nachteile', 'Das Nahtvolumen wächst etwa mit dem Quadrat des a-Maßes'], a: [0, 1, 3], x: 'Ein überdimensioniertes a-Maß bringt kaum Zusatznutzen, aber deutlich mehr Schweißgut, Verzug, Eigenspannungen und Kosten.' },
      ],
    },

    /* ───────────── Kapitel 5 ───────────── */
    {
      id: 'k5',
      title: 'Schweißfehler & Prüfverfahren',
      intro: 'Was kann bei einer Schweißnaht schiefgehen, warum passiert es – und mit welchen Verfahren findet man die Fehler? Dieses Kapitel ist besonders für Qualitätsverantwortliche zentral.',
      lessons: [
        {
          id: 'k5a', title: 'Unregelmäßigkeiten und ihre Ursachen', min: 10,
          text: `## Einteilung nach ISO 6520-1
Die Norm unterscheidet sechs Gruppen von Unregelmäßigkeiten:
1. **Risse** (100er-Nummern)
2. **Hohlräume** – vor allem Poren (200er)
3. **Feste Einschlüsse** – z. B. Schlacke (300er)
4. **Bindefehler und ungenügende Durchschweißung** (400er)
5. **Form- und Maßabweichungen** – z. B. Einbrandkerben, Überhöhung, Kantenversatz (500er)
6. **Sonstige** – z. B. Zündstellen, Spritzer (600er)

Ob eine Unregelmäßigkeit ein **Fehler** (also unzulässig) ist, entscheidet erst die Bewertung nach der geforderten **Bewertungsgruppe** (z. B. ISO 5817).

## Die wichtigsten Unregelmäßigkeiten
| Unregelmäßigkeit | Typische Ursachen | Abhilfe |
|---|---|---|
| **Poren** | Unzureichender Gasschutz (Zugluft, verstopfte Düse, falscher Durchfluss), Feuchtigkeit, Rost, Öl, Farbe, feuchte Elektroden | Gasschutz sicherstellen, Oberflächen reinigen, Zusatzwerkstoffe trocken lagern |
| **Bindefehler** | Zu geringe Wärmeeinbringung, zu hohe Geschwindigkeit, falscher Brennerwinkel, vorlaufendes Schweißbad, zu enge Fuge | Parameter erhöhen, Brennerführung korrigieren, Fugengeometrie prüfen |
| **Ungenügende Durchschweißung** | Zu kleiner Spalt, zu große Steghöhe, zu geringer Strom | Fugenvorbereitung nach WPS, Parameter anpassen |
| **Einbrandkerben** | Zu hoher Strom bzw. zu hohe Spannung, zu hohe Geschwindigkeit, falscher Anstellwinkel | Parameter reduzieren, Brennerwinkel korrigieren |
| **Schlackeneinschlüsse** | Ungenügendes Entfernen der Schlacke zwischen den Lagen, ungünstige Lagenfolge | Gründliche Zwischenlagenreinigung |
| **Heißrisse** (Erstarrungsrisse) | Ungünstige Nahtform (tief und schmal), Verunreinigungen (S, P), Werkstoffkombination | Nahtform anpassen, geeigneten Zusatzwerkstoff wählen |
| **Kaltrisse** | Aufhärtung + Wasserstoff + Spannung | Vorwärmen, trockene Zusatzwerkstoffe, wasserstoffarme Verfahren |
| **Endkraterrisse** | Lichtbogen am Nahtende abrupt abgerissen | Endkrater füllen (Kraterfüllprogramm) |

## Gefährlichkeit
Nicht alle Unregelmäßigkeiten sind gleich kritisch:
- **Flächige Fehler** (Risse, Bindefehler) sind besonders gefährlich: Sie wirken wie scharfe Kerben, an denen unter (Wechsel-)Last Risse wachsen.
- **Volumenhafte Fehler** (Poren, Schlacke) sind meist weniger kritisch, solange sie klein und vereinzelt sind.
- **Risse** sind in praktisch allen Bewertungsgruppen **unzulässig**.

TIPP: Bei wiederkehrenden Schweißfehlern beim Lieferanten nicht nur die Nacharbeit prüfen, sondern nach der **Systemursache** fragen: Sind die Parameter in der WPS festgelegt? Wird der Gasdurchfluss geprüft? Wie werden Zusatzwerkstoffe gelagert? Ist der Schweißer für die Position qualifiziert?

MERKE: Flächige Fehler (Risse, Bindefehler) sind am gefährlichsten. Poren entstehen meist durch schlechten Gasschutz oder Verunreinigungen, Bindefehler durch zu „kalte“ Parameter oder falsche Brennerführung.

REFLEXION: Welche Schweißfehler tauchen in Reklamationen oder Prüfberichten in deinem Umfeld am häufigsten auf?`,
        },
        {
          id: 'k5b', title: 'Bewertungsgruppen nach ISO 5817', min: 7,
          text: `## Wozu Bewertungsgruppen?
Keine Schweißnaht ist perfekt. Die Frage ist, **welche Unregelmäßigkeiten in welchem Umfang zulässig** sind. Dafür definiert ISO 5817 (für Stahl, Nickel, Titan und deren Legierungen) **drei Bewertungsgruppen**:

| Gruppe | Anforderung | Typische Verwendung |
|---|---|---|
| **B** | Hoch (strengste Grenzwerte) | Hoch beanspruchte, sicherheitsrelevante oder schwingend belastete Bauteile |
| **C** | Mittel | Übliche Anforderung im Stahl- und Maschinenbau |
| **D** | Niedrig (großzügigste Grenzwerte) | Gering beanspruchte, untergeordnete Bauteile |

Für Aluminium gilt die entsprechende Norm **ISO 10042**.

## Wie die Norm funktioniert
Für jede Unregelmäßigkeit (z. B. Poren, Einbrandkerben, Nahtüberhöhung, a-Maß-Unterschreitung) legt die Norm **Grenzwerte** je Bewertungsgruppe fest – meist abhängig von der Blechdicke oder dem a-Maß. Beispiele:
- **Risse:** in allen Gruppen nicht zulässig.
- **Einbrandkerben:** in B nur sehr gering, in D deutlich mehr zulässig.
- **Zu kleines a-Maß:** in B nicht zulässig, in C und D örtlich in engen Grenzen.

Für **ermüdungsbeanspruchte** Bauteile enthält die Norm im Anhang zusätzliche Anforderungen (z. B. „B 125“), da hier schon kleine Kerben die Lebensdauer stark verkürzen.

## Wer legt die Bewertungsgruppe fest?
Die Bewertungsgruppe ist eine **Konstruktionsvorgabe**: Sie gehört in die Zeichnung oder Spezifikation, z. B. in die Gabel des Schweißsymbols oder als allgemeine Angabe („Schweißnähte nach ISO 5817-C“). Fehlt sie, gibt es Streit über die Abnahme.

## Wichtig in der Praxis
- Bewertungsgruppe und Prüfumfang (welche Nähte, wie viel Prozent, welches Verfahren) müssen **vor Fertigungsbeginn** mit dem Lieferanten vereinbart sein.
- Höhere Gruppe = höherer Aufwand: B kostet deutlich mehr als C. Nicht pauschal „B für alles“ fordern, sondern **beanspruchungsgerecht** festlegen.

MERKE: ISO 5817 legt Grenzwerte für Unregelmäßigkeiten in drei Gruppen fest: B (hoch), C (mittel), D (niedrig). Die Gruppe gehört in die Zeichnung und muss vor Fertigungsbeginn klar sein.

REFLEXION: Ist auf den Schweißzeichnungen deiner Produkte eine Bewertungsgruppe angegeben – und passt sie zur Beanspruchung?`,
        },
        {
          id: 'k5c', title: 'Zerstörungsfreie Prüfverfahren', min: 10,
          text: `## Überblick
Zerstörungsfreie Prüfverfahren (ZfP, englisch NDT) finden Unregelmäßigkeiten, ohne das Bauteil zu beschädigen. Man unterscheidet **Oberflächenverfahren** und **Volumenverfahren**.

| Kürzel | Verfahren | Findet | Grenzen |
|---|---|---|---|
| **VT** | Sichtprüfung (ISO 17637) | Oberflächenfehler, Formfehler, Maße | Nur sichtbare Oberfläche |
| **PT** | Eindringprüfung (ISO 3452) | Zur Oberfläche offene Risse und Poren | Nur offene Fehler, saubere Oberfläche nötig |
| **MT** | Magnetpulverprüfung (ISO 17638) | Oberflächen- und oberflächennahe Risse | **Nur ferromagnetische Werkstoffe** (nicht Austenit, nicht Aluminium) |
| **UT** | Ultraschallprüfung (ISO 17640) | Innere Fehler, besonders **flächige** (Risse, Bindefehler) | Erfahrene Prüfer nötig, Mindestdicke, schwierig bei grobkörnigen Werkstoffen |
| **RT** | Durchstrahlungsprüfung (ISO 17636) | Innere Fehler, besonders **volumenhafte** (Poren, Schlacke) | Strahlenschutz, flächige Fehler je nach Lage schwer erkennbar |

## Sichtprüfung zuerst
Die **Sichtprüfung (VT)** steht immer am Anfang – sie ist einfach, günstig und findet einen Großteil der Formfehler (Einbrandkerben, Überhöhung, Spritzer, a-Maß-Abweichungen, offene Poren). Weitere Verfahren machen erst Sinn, wenn die Naht die Sichtprüfung bestanden hat.

## Welches Verfahren für welchen Fall?
- **Oberflächenrisse an Baustahl:** MT (empfindlich und schnell).
- **Oberflächenrisse an Edelstahl oder Aluminium:** PT (MT funktioniert nicht).
- **Innere Bindefehler an dickwandigen Stumpfnähten:** UT.
- **Poren und Schlacke, Dokumentation als Bild gewünscht:** RT (heute oft digital).

Moderne Varianten wie **Phased-Array-Ultraschall (PAUT)** oder **TOFD** liefern Bilder und eine bessere Dokumentation.

## Prüfer und Prüfzeitpunkt
- ZfP-Personal muss nach **ISO 9712** qualifiziert und zertifiziert sein (Stufen 1–3).
- Bei kaltrissgefährdeten Stählen ist eine **Wartezeit** vor der Prüfung einzuhalten (je nach Regelwerk bis zu 48 Stunden oder mehr), weil Kaltrisse verzögert entstehen.

## Zerstörende Prüfungen
Bei **Verfahrens- und Schweißerprüfungen** kommen zusätzlich zerstörende Prüfungen zum Einsatz: Zugversuch, Biegeversuch, Kerbschlagbiegeversuch, Härteprüfung, Makroschliff, Bruchprüfung. In der Serie sind z. B. regelmäßige **Makroschliffe** bei automatisierten Prozessen üblich, um Einbrand und a-Maß zu prüfen.

TIPP: Bei Lieferanten mit Roboterschweißen sind regelmäßige Makroschliffe (z. B. zu Schichtbeginn oder nach Parameteränderung) ein starkes Indiz für Prozessbeherrschung – frag nach den Aufzeichnungen.

MERKE: VT immer zuerst. Oberfläche: MT (nur ferromagnetisch) oder PT. Inneres: UT (gut für flächige Fehler wie Risse und Bindefehler) oder RT (gut für Poren und Schlacke). Prüfer müssen nach ISO 9712 zertifiziert sein.

REFLEXION: Welche Prüfverfahren werden bei deinen Lieferanten eingesetzt – und passen sie zu den kritischen Fehlerarten der Bauteile?`,
        },
      ],
      quiz: [
        { q: 'Welche Arten von Unregelmäßigkeiten gelten als besonders gefährlich?', o: ['Flächige Fehler wie Risse und Bindefehler', 'Einzelne kleine Poren', 'Leichte Spritzer', 'Geringe Nahtüberhöhung'], a: 0, x: 'Flächige Fehler wirken wie scharfe Kerben, an denen unter Last – besonders schwingender – Risse wachsen.' },
        { q: 'Welche Ursachen führen typischerweise zu Poren?', o: ['Unzureichender Gasschutz durch Zugluft', 'Rost, Öl oder Farbe auf den Fugenflanken', 'Feuchte Elektroden', 'Zu großer Abstand zwischen zwei Schweißern'], a: [0, 1, 2], x: 'Poren entstehen durch Gase im Schweißbad – aus mangelndem Gasschutz, Verunreinigungen oder Feuchtigkeit.' },
        { q: 'Was ist eine typische Ursache für Einbrandkerben?', o: ['Zu geringer Strom', 'Zu hoher Strom bzw. zu hohe Spannung und falscher Anstellwinkel', 'Zu viel Schutzgas', 'Zu langsames Schweißen in Wannenposition'], a: 1, x: 'Einbrandkerben entstehen durch zu viel Energie am Nahtrand, zu hohe Geschwindigkeit oder einen ungünstigen Brennerwinkel.' },
        { q: 'Welche Bewertungsgruppe nach ISO 5817 stellt die höchsten Anforderungen?', o: ['A', 'B', 'C', 'D'], a: 1, x: 'B = hohe Anforderungen, C = mittel, D = niedrig. Eine Gruppe A gibt es in ISO 5817 nicht.' },
        { q: 'Wer sollte die Bewertungsgruppe einer Schweißnaht festlegen – und wann?', o: ['Der Schweißer nach dem Schweißen', 'Der Prüfer bei der Abnahme', 'Die Konstruktion bzw. der Auftraggeber in Zeichnung/Spezifikation vor Fertigungsbeginn', 'Das ist nicht nötig'], a: 2, x: 'Die Bewertungsgruppe ist eine Konstruktionsvorgabe und gehört in Zeichnung oder Spezifikation – vor Fertigungsbeginn mit dem Lieferanten vereinbart.' },
        { q: 'Welches Prüfverfahren eignet sich NICHT zur Rissprüfung an austenitischem Edelstahl?', o: ['Eindringprüfung (PT)', 'Magnetpulverprüfung (MT)', 'Sichtprüfung (VT)', 'Ultraschallprüfung (UT) mit geeigneter Technik'], a: 1, x: 'MT funktioniert nur bei ferromagnetischen Werkstoffen. Austenitischer Edelstahl und Aluminium sind nicht ferromagnetisch – hier nimmt man PT.' },
        { q: 'Welches Volumenverfahren eignet sich besonders gut zum Auffinden flächiger Fehler wie Bindefehler?', o: ['Durchstrahlungsprüfung (RT)', 'Ultraschallprüfung (UT)', 'Eindringprüfung (PT)', 'Sichtprüfung (VT)'], a: 1, x: 'UT erkennt flächige Fehler wie Risse und Bindefehler gut. RT ist stärker bei volumenhaften Fehlern wie Poren und Schlacke.' },
        { q: 'Welches Prüfverfahren steht immer am Anfang?', o: ['Ultraschallprüfung', 'Durchstrahlungsprüfung', 'Sichtprüfung', 'Zugversuch'], a: 2, x: 'Die Sichtprüfung (VT) ist einfach und günstig und findet viele Formfehler. Weitere Verfahren folgen erst nach bestandener Sichtprüfung.' },
      ],
    },

    /* ───────────── Kapitel 6 ───────────── */
    {
      id: 'k6',
      title: 'Qualität, Normen & Lieferantenaudit',
      intro: 'Schweißen ist ein „spezieller Prozess“: Die Qualität lässt sich am fertigen Teil nicht vollständig prüfen. Deshalb muss sie im Prozess sichergestellt werden – mit qualifizierten Verfahren, Personal und Aufsicht.',
      lessons: [
        {
          id: 'k6a', title: 'Schweißen als spezieller Prozess & ISO 3834', min: 8,
          text: `## Warum Schweißen besonders ist
In Qualitätsmanagementsystemen (z. B. ISO 9001, IATF 16949) gilt Schweißen als **spezieller Prozess**: Das Ergebnis kann durch nachträgliche Prüfung **nicht vollständig** verifiziert werden – zerstörungsfreie Prüfungen finden nicht jeden Fehler, und Eigenschaften wie Zähigkeit lassen sich nur zerstörend prüfen. Die Qualität muss daher durch **beherrschte Prozesse** sichergestellt werden: qualifizierte Verfahren, qualifiziertes Personal, geeignete Ausrüstung und Überwachung.

## ISO 3834 – Qualitätsanforderungen für das Schmelzschweißen
Die Normenreihe ISO 3834 beschreibt, welche schweißtechnischen Elemente ein Hersteller beherrschen muss. Sie ist kein QM-System, sondern ergänzt es für das Schweißen. Es gibt drei Stufen:

| Teil | Stufe | Typisch für |
|---|---|---|
| **ISO 3834-2** | Umfassende Qualitätsanforderungen | Sicherheitsrelevante Bauteile, Druckgeräte, Schienenfahrzeuge, anspruchsvoller Stahlbau |
| **ISO 3834-3** | Standard-Qualitätsanforderungen | Allgemeiner Stahl- und Maschinenbau |
| **ISO 3834-4** | Elementare Qualitätsanforderungen | Gering beanspruchte Produkte |

## Was ISO 3834 u. a. fordert
- **Überprüfung der Anforderungen** und der technischen Machbarkeit (Vertrags- und Konstruktionsprüfung)
- Bewertung von **Unterlieferanten** (z. B. Lohnschweißer, Prüfdienstleister)
- Qualifiziertes **Schweißpersonal** (Schweißer, Bediener) und **Schweißaufsicht**
- Qualifiziertes **Prüfpersonal**
- Geeignete **Fertigungs- und Prüfeinrichtungen**, inkl. Wartung
- **Schweißanweisungen (WPS)** und deren Qualifizierung
- Umgang mit **Schweißzusätzen** (Lagerung, Trocknung, Rückverfolgbarkeit)
- **Wärmebehandlung** nach dem Schweißen, falls erforderlich
- Prüfungen **vor, während und nach** dem Schweißen
- Umgang mit **Nichtkonformitäten** und Korrekturmaßnahmen
- **Kalibrierung/Validierung** von Mess- und Prüfmitteln (z. B. Schweißstrom-Messgeräte)
- **Identifikation und Rückverfolgbarkeit**
- **Qualitätsberichte** (Dokumentation)

## Die Schweißaufsicht (ISO 14731)
Die **Schweißaufsichtsperson** (Welding Coordinator) ist verantwortlich für die schweißtechnische Qualität: WPS erstellen und freigeben, Personal einsetzen und überwachen, Zusatzwerkstoffe festlegen, Fehler bewerten. Je nach Anforderung braucht sie umfassende, spezielle oder Basis-Kenntnisse. Übliche Qualifikationen sind die international anerkannten Abschlüsse **IWE** (Schweißfachingenieur), **IWT** (Schweißtechniker) und **IWS** (Schweißfachmann).

## Automotive: CQI-15
In der Automobilindustrie gibt es mit **AIAG CQI-15 „Welding System Assessment“** einen speziellen Fragenkatalog zur Bewertung von Schweißprozessen. Viele OEMs fordern von ihren Lieferanten eine jährliche Selbstbewertung danach – ähnlich wie CQI-9 für Wärmebehandlung oder CQI-11 für Galvanik.

MERKE: Schweißen ist ein spezieller Prozess – Qualität muss im Prozess entstehen, nicht erst durch Prüfung. ISO 3834 definiert die schweißtechnischen Qualitätsanforderungen in drei Stufen; die Schweißaufsicht nach ISO 14731 trägt die technische Verantwortung.

REFLEXION: Welche deiner Lieferanten mit Schweißprozessen sind nach ISO 3834 zertifiziert – und welche Stufe passt eigentlich zu deinen Bauteilen?`,
        },
        {
          id: 'k6b', title: 'WPS, Verfahrens- und Schweißerprüfung', min: 9,
          text: `## Die Schweißanweisung (WPS)
Die **WPS** (Welding Procedure Specification, nach ISO 15609) ist das „Rezept“ für eine Schweißnaht. Sie enthält alle relevanten Parameter, z. B.:
- Grundwerkstoff(e) und Dickenbereich
- Schweißprozess (z. B. 135) und Zusatzwerkstoff
- Schutzgas und Durchflussmenge
- Fugenform, Schweißposition, Lagenaufbau
- Strom, Spannung, Drahtvorschub, Geschwindigkeit, Wärmeeinbringung
- Vorwärm- und Zwischenlagentemperatur, ggf. Wärmebehandlung

Die WPS muss **am Arbeitsplatz verfügbar** sein – und der Schweißer muss danach arbeiten.

## Wie wird eine WPS qualifiziert?
Eine vorläufige WPS (**pWPS**) wird durch einen Nachweis abgesichert. Die gängigen Wege:
- **Verfahrensprüfung nach ISO 15614-1** (Stahl): Ein Prüfstück wird unter Aufsicht geschweißt und zerstörungsfrei sowie zerstörend geprüft. Das Ergebnis ist der **WPQR** (Welding Procedure Qualification Record) mit einem festgelegten **Geltungsbereich**.
- Alternativ, je nach Regelwerk: geprüfte Schweißzusätze (ISO 15610), vorliegende Erfahrung (ISO 15611), Standardschweißverfahren (ISO 15612) oder Vorfertigungsprüfung (ISO 15613).

Wichtig ist der **Geltungsbereich**: Ein WPQR gilt nur für bestimmte Dickenbereiche, Werkstoffgruppen, Positionen usw. Außerhalb davon ist die WPS nicht qualifiziert.

## Die Schweißerprüfung (ISO 9606)
Nicht nur das Verfahren, auch der **Mensch** muss qualifiziert sein. Schweißer weisen ihre Fertigkeit mit einer Prüfung nach **ISO 9606-1** (Stahl) bzw. **ISO 9606-2** (Aluminium) nach. Die Prüfbescheinigung gilt für einen bestimmten Bereich: Prozess, Werkstoffgruppe, Nahtart, Dicke, Durchmesser, Position.

**Gültigkeit:** Die Schweißaufsicht (oder Prüfstelle) muss **alle 6 Monate** bestätigen, dass der Schweißer im Geltungsbereich tätig war. Die Verlängerung erfolgt – je nach gewählter Methode – durch erneute Prüfung oder durch regelmäßig dokumentierte Prüfungen von Produktionsnähten.

Für **mechanisierte und automatische** Schweißungen (z. B. Roboter) werden die Bediener nach **ISO 14732** qualifiziert.

## Typische Auditfeststellungen
- WPS liegt nicht am Arbeitsplatz oder passt nicht zur tatsächlichen Fertigung (andere Position, andere Parameter, anderes Gas).
- WPS ist durch keinen WPQR abgedeckt oder liegt außerhalb des Geltungsbereichs.
- Schweißerzertifikate abgelaufen, 6-Monats-Bestätigung fehlt.
- Schweißer schweißt in einer Position oder Dicke, für die er nicht geprüft ist.
- Parameteränderungen am Roboter ohne Freigabe der Schweißaufsicht.

TIPP: Im Audit stichprobenartig an einem Arbeitsplatz starten: Welche Naht wird gerade geschweißt? → Welche WPS gilt? → Welcher WPQR deckt sie ab? → Ist der Schweißer dafür qualifiziert und bestätigt? → Stimmen die Ist-Parameter am Gerät mit der WPS überein? Dieser „Rückwärts-Trace“ zeigt schnell, ob das System lebt.

MERKE: WPS = verbindliches Schweißrezept, WPQR = Nachweis, dass es funktioniert, ISO 9606 = Nachweis, dass der Schweißer es kann. Alles hat einen Geltungsbereich – und die Fertigung muss sich darin bewegen.

REFLEXION: Wann hast du zuletzt bei einem Lieferanten den Weg von der Naht über die WPS zum WPQR und zur Schweißerqualifikation nachverfolgt?`,
        },
        {
          id: 'k6c', title: 'Schweißprozesse beim Lieferanten bewerten', min: 8,
          text: `## Weitere wichtige Regelwerke
Je nach Branche kommen spezifische Normen hinzu:
- **EN 1090** – Stahl- und Aluminiumtragwerke: Teil 1 regelt die CE-Kennzeichnung und die werkseigene Produktionskontrolle, Teil 2 (Stahl) und Teil 3 (Aluminium) die technischen Anforderungen. Bauteile werden in **Ausführungsklassen EXC1 bis EXC4** eingeteilt; je höher die Klasse, desto höher die Anforderungen (z. B. an ISO-3834-Stufe, Schweißaufsicht, Prüfumfang und Bewertungsgruppe).
- **EN 15085** – Schweißen von Schienenfahrzeugen.
- **Druckgeräterichtlinie / AD 2000 / EN 13445** – Druckbehälter.
- **AIAG CQI-15** – Schweißsystembewertung in der Automobilindustrie.
- **DVS-Merkblätter** – praxisnahe technische Regeln des Deutschen Verbands für Schweißen und verwandte Verfahren.

## Checkliste für das Lieferantenaudit
**System & Organisation**
- ISO-3834-Zertifikat passend zur geforderten Stufe? Geltungsbereich?
- Benannte Schweißaufsicht mit passender Qualifikation – und tatsächlich vor Ort präsent?
- Werden Kundenanforderungen (Bewertungsgruppe, Prüfumfang, Normen) bei Auftragsannahme geprüft?

**Verfahren & Personal**
- WPS für alle Nähte vorhanden, durch WPQR abgedeckt, am Arbeitsplatz verfügbar?
- Schweißerqualifikationen gültig und passend (Prozess, Werkstoff, Position, Dicke)?
- Qualifikationsmatrix gepflegt?

**Material & Ausrüstung**
- Zusatzwerkstoffe richtig gelagert (trocken, Elektrodentrockner, Rückverfolgbarkeit)?
- Schutzgas: richtige Sorte, Durchfluss geprüft?
- Schweißstromquellen gewartet und **validiert/kalibriert** (z. B. nach EN IEC 60974-14)?
- Edelstahl- und Baustahlbereiche getrennt?

**Fertigung & Prüfung**
- Fugenvorbereitung, Heften, Vorwärmen nach WPS – und wird die Temperatur gemessen?
- Sichtprüfung durch qualifiziertes Personal, ZfP durch zertifizierte Prüfer (ISO 9712)?
- Bei Robotern: Parameterschutz, Änderungsfreigabe, Makroschliffe, Prozessüberwachung?
- Umgang mit fehlerhaften Nähten: Reparatur-WPS, Dokumentation, Ursachenanalyse?

## Rote Flaggen
- „Unsere Schweißer wissen, was sie tun“ – aber keine WPS.
- Schweißaufsicht nur auf dem Papier (z. B. extern, nie vor Ort).
- Parameter werden „nach Gehör“ eingestellt.
- Basische Elektroden liegen offen herum, Draht ohne Schutz in staubiger Umgebung.
- Wiederholte Reklamationen mit gleicher Fehlerart ohne systematische Ursachenanalyse.

## Die Brücke zur Führung und Motivation
Am Ende schweißen **Menschen**. Ein gutes System nützt wenig, wenn Schweißer unter Zeitdruck Parameter verstellen, Fehler aus Angst nicht melden oder keine Weiterbildung bekommen. Eine offene Fehlerkultur, wertgeschätzte Fachkräfte und eine präsente Schweißaufsicht sind genauso Qualitätsfaktoren wie Normen und Zertifikate.

MERKE: Bewerte Schweißlieferanten über System (ISO 3834, Schweißaufsicht), Verfahren (WPS/WPQR), Personal (ISO 9606), Material und Ausrüstung sowie Fertigung und Prüfung. Und vergiss nicht die Kultur: Qualität entsteht durch Menschen.

REFLEXION: Welche drei Punkte aus der Checkliste würdest du bei deinem nächsten Lieferantenbesuch gezielt prüfen?`,
        },
      ],
      quiz: [
        { q: 'Warum gilt Schweißen als „spezieller Prozess“?', o: ['Weil es besonders teuer ist', 'Weil das Ergebnis durch nachträgliche Prüfung nicht vollständig verifiziert werden kann', 'Weil nur Ingenieure schweißen dürfen', 'Weil es nur in speziellen Branchen vorkommt'], a: 1, x: 'Viele Eigenschaften (z. B. Bindung, Zähigkeit) lassen sich am fertigen Teil nicht vollständig zerstörungsfrei prüfen. Daher muss die Qualität im Prozess sichergestellt werden.' },
        { q: 'Welcher Teil der ISO 3834 beschreibt die umfassenden Qualitätsanforderungen?', o: ['ISO 3834-2', 'ISO 3834-3', 'ISO 3834-4', 'ISO 3834-5'], a: 0, x: 'Teil 2 = umfassend, Teil 3 = Standard, Teil 4 = elementar. Teil 5 enthält Verweise auf mitgeltende Normen.' },
        { q: 'Welche Norm beschreibt Aufgaben und Verantwortung der Schweißaufsicht?', o: ['ISO 9606-1', 'ISO 14731', 'ISO 5817', 'ISO 6947'], a: 1, x: 'ISO 14731 regelt Aufgaben und Verantwortung der Schweißaufsicht. ISO 9606-1 = Schweißerprüfung, ISO 5817 = Bewertungsgruppen, ISO 6947 = Schweißpositionen.' },
        { q: 'Was ist ein WPQR?', o: ['Die Prüfbescheinigung eines Schweißers', 'Der Bericht über die Qualifizierung eines Schweißverfahrens, z. B. nach ISO 15614-1', 'Ein Schweißgerät', 'Eine Zeichnungsangabe'], a: 1, x: 'Der WPQR (Welding Procedure Qualification Record) dokumentiert die erfolgreiche Verfahrensqualifizierung und legt den Geltungsbereich der WPS fest.' },
        { q: 'Wie oft muss die Gültigkeit einer Schweißerqualifikation nach ISO 9606-1 bestätigt werden?', o: ['Alle 6 Monate', 'Alle 5 Jahre', 'Nur einmalig', 'Jeden Monat'], a: 0, x: 'Die Schweißaufsicht bzw. Prüfstelle bestätigt alle 6 Monate, dass der Schweißer im Geltungsbereich tätig war. Die Verlängerung erfolgt je nach Methode durch erneute Prüfung oder dokumentierte Produktionsprüfungen.' },
        { q: 'Welche Feststellungen sind im Schweiß-Audit typische Abweichungen?', o: ['WPS passt nicht zur tatsächlichen Schweißposition', 'Schweißerzertifikat ohne 6-Monats-Bestätigung', 'Basische Elektroden liegen offen herum', 'Schweißaufsicht ist benannt, qualifiziert und vor Ort präsent'], a: [0, 1, 2], x: 'Eine qualifizierte, präsente Schweißaufsicht ist positiv. Die anderen drei sind klassische Abweichungen.' },
        { q: 'Welche Norm regelt Ausführungsklassen (EXC1–EXC4) für Stahltragwerke?', o: ['EN 1090', 'EN 15085', 'ISO 9712', 'ISO 4063'], a: 0, x: 'EN 1090 regelt Ausführung und CE-Kennzeichnung von Stahl- und Aluminiumtragwerken mit den Ausführungsklassen EXC1 bis EXC4.' },
        { q: 'Welcher AIAG-Standard dient in der Automobilindustrie zur Bewertung von Schweißprozessen?', o: ['CQI-9', 'CQI-11', 'CQI-15', 'CQI-27'], a: 2, x: 'CQI-15 = Welding System Assessment. CQI-9 betrifft Wärmebehandlung, CQI-11 Galvanik, CQI-27 Gießen.' },
      ],
    },
  ],
});
