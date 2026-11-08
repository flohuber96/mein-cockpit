# Lernpfad – Lern-App

Web-App (PWA) zum Weiterbilden mit mehreren Kursen auf einer Plattform. Läuft komplett im Browser, offline-fähig, Daten bleiben auf dem Gerät.

**Start:** `lernen/index.html` öffnen (z. B. über GitHub Pages: `…/mein-cockpit/lernen/`). Auf dem iPhone in Safari „Teilen → Zum Home-Bildschirm“ – dann verhält sie sich wie eine App.

## Funktionen
- **Kurse mit Lernpfad:** Kapitel → Lektionen → Kapiteltest. Das nächste Kapitel wird nach bestandenem Test freigeschaltet (abschaltbar, Bestehensgrenze einstellbar).
- **Tests:** Einzel- und Mehrfachauswahl, sofortige Erklärung, Auswertung, Abschlusstest pro Kurs (gemischte Fragen aus allen Kapiteln).
- **Fehler wiederholen:** Falsch beantwortete Fragen landen automatisch in einem Wiederholungs-Pool.
- **Notizen & Fragen:** Direkt in jeder Lektion; offene Fragen lassen sich später beantworten und als „geklärt“ markieren. Reflexionsfragen in den Lektionen können per Tipp als Notiz beantwortet werden. Suche, Filter, Export als Text.
- **Fortschritt:** Lernserie, Aktivitätskalender, Bestwerte je Kapitel, Testverlauf.
- **Speichern:** Automatisch im Browser (localStorage), zusätzlich Backup-Export/-Import als JSON.

## Enthaltene Kurse
| Kurs | Kapitel | Lektionen | Testfragen |
|---|---|---|---|
| Mitarbeiterführung | 6 | 17 | 41 |
| Motivation & Erfolg im Unternehmen | 6 | 18 | 40 |
| Schweißtechnik | 6 | 18 | 46 |

## Neuen Kurs hinzufügen
**Variante A – ohne Code:** In der App unter *Mehr → Vorlage für eigenen Kurs* die JSON-Vorlage laden, ausfüllen und unter *Mehr → Kurs importieren* einlesen.

**Variante B – fest eingebaut:** Neue Datei `kurse/<id>.js` nach dem Muster der vorhandenen Kurse anlegen, in `index.html` per `<script>` einbinden und in `sw.js` zur Dateiliste hinzufügen (dabei `VERSION` erhöhen).

### Kursformat
```js
{
  id: 'mein-kurs',          // eindeutig, nur a–z, 0–9, - und _
  title: 'Mein Kurs',
  emoji: '📘', color: '#0ca678',
  short: 'Ein Satz', desc: 'Beschreibung', level: 'Einsteiger', duration: 'ca. 2 h',
  goals: ['Lernziel 1', 'Lernziel 2'],
  finalCount: 15,           // Fragen im Abschlusstest
  chapters: [{
    id: 'k1', title: 'Kapitel', intro: 'Worum geht es?',
    lessons: [{ id: 'k1a', title: 'Lektion', min: 6, text: '…' }],
    quiz: [{ q: 'Frage?', o: ['A', 'B', 'C'], a: 1, x: 'Erklärung' }],   // a: Index ab 0 oder [0, 2] bei mehreren
  }],
}
```
**Lektionstext:** Absätze durch Leerzeile trennen; `## ` Zwischenüberschrift, `- ` Liste, `1. ` nummerierte Liste, `| a | b |` Tabelle, `> ` Zitat, `**fett**`, `*kursiv*`. Absätze, die mit `MERKE:`, `TIPP:`, `ACHTUNG:`, `BEISPIEL:` oder `REFLEXION:` beginnen, werden zu farbigen Boxen.

**Wichtig:** Kurs-, Kapitel- und Lektions-IDs nicht mehr ändern, sobald gelernt wird – daran hängt der gespeicherte Fortschritt. Neue Testfragen immer hinten anhängen.
