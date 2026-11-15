'use strict';
/* ───────── Wissen: Dos & Don'ts und alle Rezept-Bausteine mit ihrer Wirkung ─────────
   html(ctx) bekommt die eigenen Werte (Ziele, Temperaturen, Sorten), damit die Erklärung
   nicht abstrakt bleibt. */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = x => String(x).replace('.', ',');

  // Extraktions-Skala: wohin dich welche Änderung schiebt
  function scale() {
    return `<svg class="fig" viewBox="0 0 340 118" role="img" aria-label="Extraktions-Skala von sauer über süß bis bitter">
      <defs><linearGradient id="exg" x1="0" x2="1">
        <stop offset="0" style="stop-color:var(--sour)"/><stop offset=".5" style="stop-color:var(--ok)"/><stop offset="1" style="stop-color:var(--bitter)"/>
      </linearGradient></defs>
      <rect x="14" y="34" width="312" height="14" rx="7" fill="url(#exg)"/>
      <rect x="128" y="28" width="84" height="26" rx="8" style="fill:none;stroke:var(--t1);stroke-width:2"/>
      <text x="14" y="22" style="fill:var(--t1);font-size:12.5px;font-weight:800">zu wenig extrahiert</text>
      <text x="326" y="22" text-anchor="end" style="fill:var(--t1);font-size:12.5px;font-weight:800">zu viel extrahiert</text>
      <text x="170" y="22" text-anchor="middle" style="fill:var(--ok);font-size:12.5px;font-weight:800">Ziel</text>
      <text x="14" y="66" style="fill:var(--t2);font-size:11.5px">sauer · dünn · salzig</text>
      <text x="170" y="66" text-anchor="middle" style="fill:var(--t2);font-size:11.5px">süß · rund</text>
      <text x="326" y="66" text-anchor="end" style="fill:var(--t2);font-size:11.5px">bitter · trocken</text>
      <text x="14" y="90" style="fill:var(--t1);font-size:12px;font-weight:700">◂ gröber · weniger Out · kühler</text>
      <text x="326" y="110" text-anchor="end" style="fill:var(--t1);font-size:12px;font-weight:700">feiner · mehr Out · heißer ▸</text>
    </svg>`;
  }

  // Ein Baustein: Was ist das, was macht mehr/weniger, wann drehe ich daran
  function part(icon, title, sub, o) {
    return `<details class="card know"><summary><span class="ki">${icon}</span><span><b>${title}</b><small>${sub}</small></span></summary>
      <div class="kb">
        <p>${o.what}</p>
        ${o.you ? `<div class="you"><b>Bei dir:</b> ${o.you}</div>` : ''}
        ${o.more || o.less ? `<div class="effect">
          ${o.more ? `<div><small>${o.moreL || 'Mehr / höher'}</small>${o.more}</div>` : ''}
          ${o.less ? `<div><small>${o.lessL || 'Weniger / niedriger'}</small>${o.less}</div>` : ''}
        </div>` : ''}
        ${o.when ? `<p><b>Wann daran drehen?</b> ${o.when}</p>` : ''}
        ${o.extra || ''}
      </div></details>`;
  }

  function html(c) {
    const T = c.targets, st = c.settings, TC = c.temps;
    const out = (T.dose * T.ratio).toFixed(0);
    const beanRows = c.beans.filter(b => b.range || b.n).map(b => `<tr><td>${esc(b.name)}</td><td>${b.range ? n(b.range[0]) + (b.range[1] !== b.range[0] ? '–' + n(b.range[1]) : '') : '–'}</td><td>${b.spu ? '~' + n(b.spu.toFixed(1)) + ' s' : '–'}</td><td>${b.n}</td></tr>`).join('');
    let h = `
    <div class="card pad intro">
      <b>Espresso in einem Satz</b>
      <p>Heißes Wasser löst unter Druck Stoffe aus dem Kaffeemehl. Wird zu wenig gelöst, schmeckt es <b style="color:var(--sour)">sauer</b>. Wird zu viel gelöst, schmeckt es <b style="color:var(--bitter)">bitter</b>. Dazwischen liegt der süße, runde Punkt, den du suchst.</p>
      ${scale()}
      <p class="small muted">Mit der Grafik liest du jede Änderung: Alles, was nach rechts schiebt, löst mehr; alles nach links löst weniger.</p>
    </div>

    <div class="section-t">Die Reihenfolge beim Einstellen</div>
    <div class="card pad steps">
      <ol>
        <li><b>Rezept festlegen:</b> Dosis und Ziel-Ausbeute – bei dir ${n(T.dose)} g → ca. ${out} g.</li>
        <li><b>Mahlgrad</b> so lange anpassen, bis die Zeit passt (${T.tMin}–${T.tMax} s).</li>
        <li><b>Probieren</b> und Geschmack eintragen. Jetzt zählt der Geschmack, nicht mehr die Uhr.</li>
        <li><b>Feintuning</b> in kleinen Schritten: Mahlgrad um ${n(st.step)}, oder die Ausbeute um 2–3 g.</li>
        <li><b>Temperatur</b> erst ganz zum Schluss.</li>
      </ol>
      <p class="small muted" style="margin:6px 0 0">Immer nur <b>eine</b> Sache pro Shot ändern – sonst weißt du nicht, was gewirkt hat.</p>
    </div>

    <div class="section-t">Dos &amp; Don'ts</div>
    <div class="dd">
      <div class="card pad do"><b>✓ Machen</b><ul>
        <li>Dosis jedes Mal wiegen (auf 0,1 g).</li>
        <li>Ausbeute in der Tasse wiegen – nicht nach Augenmaß.</li>
        <li>Maschine 20–25 Min. aufheizen, vor dem Shot kurz spülen.</li>
        <li>Kaffee im Sieb verteilen (WDT), gerade und immer gleich tampen.</li>
        <li>Siebträger sauber, trocken und warm (in der Brühgruppe lassen).</li>
        <li>Nach einem komischen Shot erst einen zweiten ziehen, dann umstellen.</li>
        <li>Neue Packung = kurz neu einstellen, auch bei gleicher Sorte.</li>
        <li>Bohnen luftdicht, dunkel und kühl lagern.</li>
      </ul></div>
      <div class="card pad dont"><b>✗ Lassen</b><ul>
        <li>Mehrere Dinge gleichzeitig ändern.</li>
        <li>Nur auf die Zeit schauen und den Geschmack ignorieren.</li>
        <li>Nach dem Tampen seitlich an den Siebträger klopfen – das reißt den Puck.</li>
        <li>Das Sieb überfüllen (Mehl berührt die Dusche).</li>
        <li>Ganz frische Bohnen (unter ca. 5–7 Tagen) endgültig beurteilen.</li>
        <li>Bohnen im Kühlschrank (Feuchtigkeit, Gerüche). Gefrierfach geht – portioniert und luftdicht.</li>
        <li>Große Sprünge Richtung fein bei stehender, voller Mühle – besser bei laufendem Motor.</li>
      </ul></div>
    </div>

    <div class="section-t">Alle Bausteine eines Rezepts</div>
    <p class="small muted" style="margin:-2px 4px 10px">Antippen zum Aufklappen. „Bei dir“ zeigt deine eigenen Werte aus der App.</p>
    <div class="stack">
    ${part('🥄', 'Dosis (In)', 'Gramm Kaffeemehl im Sieb', {
      what: 'Die Menge Kaffeemehl im Siebträger. Sie bestimmt, wie dicht der Puck ist und wie viel Kaffee überhaupt da ist, um gelöst zu werden. Jedes Sieb ist für eine Menge gebaut – meist ±1 g.',
      you: `Ziel ${n(T.dose)} g. Deine Notizen zeigen Werte von 17,5 bis 20 g – das allein erklärt schon mehrere Sekunden Unterschied.`,
      more: 'Dichterer Puck → läuft langsamer, kräftiger, mehr Körper. Zu viel: Mehl drückt an die Dusche, ungleichmäßig, dumpf.',
      less: 'Lockerer Puck → läuft schneller, dünner, heller im Geschmack. Zu wenig: nasser, matschiger Puck.',
      when: 'Selten. Erst festlegen, dann gleich lassen. Höchstens ±0,5 g als Feintuning für mehr oder weniger Körper.',
    })}
    ${part('⚖️', 'Ausbeute (Out) & Ratio', 'Gramm in der Tasse · Out ÷ In', {
      what: 'Die Ausbeute ist das Gewicht des fertigen Espressos. Die Ratio setzt sie ins Verhältnis zur Dosis: 18 g rein, 36 g raus = 1 : 2. Gewicht ist genauer als Volumen, weil Crema viel Platz braucht, aber kaum wiegt.',
      you: `Ziel 1 : ${n(T.ratio)} (${n(T.dose)} g → ca. ${out} g). Auf deinem Zettel: 36–40 g.`,
      moreL: 'Mehr Out (längere Ratio)', lessL: 'Weniger Out (kürzere Ratio)',
      more: 'Mehr gelöst → weniger sauer, leichter und klarer. Zu weit: wässrig, dann bitter.',
      less: 'Weniger gelöst → intensiver, sirupartiger. Zu kurz: sauer und scharf.',
      when: 'Wenn die Zeit passt, der Geschmack aber noch nicht ganz: sauer → 2–3 g mehr, bitter → 2–3 g weniger. Faustregel: helle Röstung 1 : 2,2–2,5, mittel 1 : 2, dunkel 1 : 1,7–2.',
    })}
    ${part('⏱️', 'Zeit', 'Sekunden ab Knopfdruck bis Stopp', {
      what: 'Gemessen ab Hebel hoch bis zum Stopp – inklusive Pre-Infusion. <b>Die Zeit ist kein Regler, sondern ein Ergebnis</b> von Mahlgrad, Dosis und Puck-Vorbereitung. Sie hilft dir, reproduzierbar zu werden.',
      you: `Zielfenster ${T.tMin}–${T.tMax} s. Die App rechnet die Zeit auf die Ziel-Ausbeute um, wenn du mehr oder weniger rausgelassen hast – sonst wären die Shots nicht vergleichbar.`,
      moreL: 'Länger', lessL: 'Kürzer',
      more: 'Mehr Kontaktzeit → mehr gelöst (weniger sauer, eher bitter).',
      less: 'Weniger Kontaktzeit → weniger gelöst (eher sauer, dünn).',
      when: 'Gar nicht direkt – du änderst den Mahlgrad. Ehrlich gesagt: Schmeckt dir ein Shot mit 33 s am besten, sind 33 s richtig.',
    })}
    ${part('💧', 'Erster Tropfen & Pre-Infusion', 'Frühwarnsystem für den Shot', {
      what: 'Die E61-Brühgruppe der Mara X befeuchtet den Puck zuerst mit wenig Druck (Pre-Infusion), dann baut sich der volle Druck auf. Wie lange es bis zum ersten Tropfen dauert, verrät schon früh, wohin der Shot läuft.',
      you: `Normal sind bei dir ${st.fdMin}–${st.fdMax} s (meist 9–10 s).`,
      moreL: 'Später als sonst', lessL: 'Früher als sonst',
      more: 'Eher zu fein oder zu viel Kaffee im Sieb.',
      less: 'Eher zu grob, zu wenig Kaffee – oder Channeling (Wasser findet einen Riss).',
      when: 'Du stellst ihn nicht ein, du liest ihn ab. Früher erster Tropfen, aber insgesamt langsamer Shot = typisch für Channeling.',
    })}
    ${part('⚙️', 'Mahlgrad', 'Dein wichtigster Regler', {
      what: `Bestimmt, wie fein das Mehl ist und damit, wie stark der Puck bremst. Bei deiner ${esc(st.grinder)} gilt: <b>höhere Zahl = ${st.coarserUp ? 'gröber' : 'feiner'}</b>. Die Mühle ist stufenlos – schon ${n(st.step)} macht einen spürbaren Unterschied.`,
      you: beanRows ? `Jede Sorte hat ihren eigenen Bereich – aus deinen Shots berechnet:<table class="ktbl"><tr><th>Sorte</th><th>Ziel-Mahlgrad</th><th>pro Einheit</th><th>Shots</th></tr>${beanRows}</table>` : 'Sobald du ein paar Shots mit verschiedenen Mahlgraden hast, steht hier pro Sorte der passende Bereich.',
      moreL: 'Feiner', lessL: 'Gröber',
      more: 'Mehr Widerstand → langsamer, mehr gelöst. Gegen sauer.',
      less: 'Weniger Widerstand → schneller, weniger gelöst. Gegen bitter.',
      when: 'Immer zuerst, wenn die Zeit nicht passt. Kleine Schritte, nach jedem Schritt ein Shot. Nach dem Verstellen kann der erste Shot noch etwas Mehl vom alten Mahlgrad enthalten.',
    })}
    ${part('🌡️', 'Temperatur', 'Mara X: Schalter 0 / I / II', {
      what: 'Heißeres Wasser löst mehr und schneller. Die Mara X regelt die Brühtemperatur selbst; du wählst nur die Stufe.',
      you: `Deine Messung: 0 = ${TC['0'].replace('ca. ', '')}, I = ${TC.I.replace('ca. ', '')}, II = ${TC.II.replace('ca. ', '')}. Standard in der App: Stufe ${esc(st.temp)}.`,
      moreL: 'Heißer', lessL: 'Kühler',
      more: 'Mehr gelöst → gegen sauer, gut für helle Röstungen. Zu heiß: bitter, verbrannt.',
      less: 'Weniger gelöst → gegen bitter, gut für dunkle Röstungen.',
      when: 'Zuletzt, wenn Mahlgrad und Ratio stimmen. Nach dem Umschalten ein paar Minuten warten, bis die Temperatur stabil ist.',
    })}
    ${part('🫘', 'Bohne: Röstgrad, Alter, Decaf', 'Warum jede Packung anders ist', {
      what: 'Helle Röstungen sind dichter und schwerer zu lösen, dunkle lösen sich leicht. Frisch geröstete Bohnen geben viel CO₂ ab – das stört die ersten Tage. Mit zunehmendem Alter laufen Shots meist schneller.',
      you: 'Deine Notizen zeigen es deutlich: Green Lion, Qaweh Decaf und Melitta brauchen völlig unterschiedliche Mahlgrade – und selbst Melitta Bella Crema Decaf lag in der zweiten Packung woanders als in der ersten.',
      moreL: 'Heller / frischer', lessL: 'Dunkler / älter',
      more: 'Hell: feiner, heißer, längere Ratio. Ganz frisch (unter 7 Tagen): Shots schwanken, Geduld.',
      less: 'Dunkel: gröber, kühler, kürzere Ratio. Älter (ab ca. 5–6 Wochen): nach und nach feiner nachstellen.',
      when: 'Bei jeder neuen Packung kurz neu einstellen. Ideal sind meist etwa 7–30 Tage nach Röstung. Decaf verhält sich oft anders als die normale Variante – eigener Mahlgrad.',
    })}
    ${part('🧹', 'Puck-Vorbereitung', 'Die häufigste Ursache für Schwankungen', {
      what: 'Wie gleichmäßig das Mehl im Sieb liegt. Wasser nimmt immer den Weg des geringsten Widerstands. Liegt das Mehl ungleich, schießt es durch dünne Stellen (Channeling): Ein Teil wird zu viel gelöst, ein Teil zu wenig – sauer <i>und</i> bitter zugleich.',
      you: c.noise ? `Deine Shots schwanken bei gleichem Mahlgrad um ca. ±${n(c.noise.toFixed(0))} s. Ab etwa ±5 s lohnt es sich, hier anzusetzen, bevor du am Mahlgrad drehst.` : '',
      more: '', less: '',
      when: 'Immer gleich machen: Mehl mit WDT-Nadeln auflockern, glatt verteilen, gerade tampen, nicht nachklopfen. Anzeichen für Channeling: Spritzer, Löcher im Puck, sehr früher erster Tropfen.',
    })}
    ${part('🚰', 'Wasser', 'Wird nicht erfasst – ist aber wichtig', {
      what: 'Espresso ist über 90 % Wasser. Sehr hartes Wasser verkalkt die Maschine und macht den Geschmack flach, sehr weiches kann sauer und dünn wirken.',
      you: 'Die App kennt dein Wasser nicht. Wenn alles andere stimmt und es trotzdem nicht schmeckt, kann es am Wasser liegen.',
      more: '', less: '',
      when: 'Gefiltertes, eher weiches bis mittleres Wasser verwenden und die Entkalkungs-Hinweise von Lelit beachten.',
    })}
    ${part('〰️', 'Fluss (g/s)', 'Berechnet: Out ÷ Zeit ab erstem Tropfen', {
      what: 'Wie schnell der Espresso in die Tasse läuft, sobald er läuft. Hilft, Shots zu vergleichen, die unterschiedlich lang gelaufen sind. Typisch sind etwa 1,5–2 g/s.',
      more: 'Schneller Fluss: eher grob, wenig Widerstand.', moreL: 'Hoher Fluss', lessL: 'Niedriger Fluss',
      less: 'Langsamer Fluss: eher fein, viel Widerstand.',
      when: 'Nur zum Ablesen. Ehrlich: grober Richtwert, weil die App den Druckverlauf nicht kennt.',
    })}
    </div>

    <div class="section-t">Geschmack lesen</div>
    <div class="card taste-t">
      <div class="tr"><i style="background:var(--sour)"></i><div><b>Sauer, scharf, salzig, dünn</b><small>zu wenig gelöst → feiner mahlen, mehr Out oder heißer</small></div></div>
      <div class="tr"><i style="background:var(--bitter)"></i><div><b>Bitter, trocken, verbrannt</b><small>zu viel gelöst → gröber, weniger Out oder kühler</small></div></div>
      <div class="tr"><i style="background:linear-gradient(90deg,var(--sour),var(--bitter))"></i><div><b>Sauer und bitter zugleich, pelzig</b><small>ungleichmäßig (Channeling) → Puck-Vorbereitung verbessern</small></div></div>
      <div class="tr"><i style="background:var(--neutral)"></i><div><b>Wässrig, wenig Körper</b><small>Dosis +0,5 g oder etwas weniger Out</small></div></div>
      <div class="tr"><i style="background:var(--ok)"></i><div><b>Süß, rund, langer Nachgeschmack</b><small>Ziel erreicht – Rezept mit 5 Sternen merken</small></div></div>
    </div>

    <div class="section-t">Ehrlich: Was die App kann – und was nicht</div>
    <div class="card pad honest"><ul>
      <li>Die Empfehlungen folgen bewährten Faustregeln und lernen aus <b>deinen</b> Shots. Sie ersetzen nicht deinen Geschmack.</li>
      <li>Bei jeder Empfehlung steht, wie sicher sie ist. Mit wenigen Shots ist der Ziel-Mahlgrad eine grobe Schätzung.</li>
      <li>Schwanken die Shots bei gleichem Mahlgrad stark, liegt es fast immer an Dosis oder Puck – nicht am Mahlgrad. Dann sagt die App das auch.</li>
      <li>Druck, Wasser, Sieb und die genaue Temperatur kennt die App nicht. Die Temperaturen der Stufen sind deine eigenen Messwerte.</li>
    </ul></div>`;
    return h;
  }

  window.Wissen = { html, scale };
})();
