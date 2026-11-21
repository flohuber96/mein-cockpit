'use strict';
/* ───────── Wissen: kurz, mit deinen Zielen, deiner Maschine und deiner Mühle ───────── */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = (x, d) => (d == null ? String(x) : (+x).toFixed(d)).replace('.', ',');

  function html(st, beans = []) {
    const r1 = st.outMin / st.dose, r2 = st.outMax / st.dose;
    const spots = beans.filter(b => b.range).map(b => `<li><b>${esc(b.name)}:</b> ${n(b.range[0])}${b.range[1] !== b.range[0] ? '–' + n(b.range[1]) : ''}</li>`).join('');
    return `
    <div class="section-t">Deine Ziele</div>
    <div class="card goals">
      <div><small>Dosis</small><b>${n(st.dose, 1)} g</b></div>
      <div><small>Out</small><b>${n(st.outMin, 0)}–${n(st.outMax, 0)} g</b><em>Ratio 1 : ${n(r1, 1)}–${n(r2, 1)}</em></div>
      <div><small>Zeit</small><b>${st.tMin}–${st.tMax} s</b><em>ab Hebel hoch</em></div>
      <div><small>1. Tropfen</small><b>${st.fdMin}–${st.fdMax} s</b><em>Pre-Infusion</em></div>
      <div class="wide"><small>Fluss ab 1. Tropfen</small><b>${n(st.fMin, 1)}–${n(st.fMax, 1)} g/s</b><em>Out ÷ (Zeit − 1. Tropfen) · ohne Tropfen ${st.fdDef || 10} s angenommen</em></div>
    </div>
    <p class="small muted kp">Dosis, Out und Zeit stammen aus deinen Notizen und decken sich mit den üblichen Richtwerten für Espresso (1 : 2 bis 1 : 2,5, ca. 25–30 s). Für den Fluss gibt es keinen offiziellen Standard – üblich sind ca. 1,5–2,5 g/s, aus deinen Zielen folgen 1,8–2,4 g/s. Alles unter „Einstellungen“ anpassbar.</p>

    <div class="section-t">Warum der Fluss so nützlich ist</div>
    <div class="card pad kt">
      <p>Die Zeit hängt davon ab, wie viel du in die Tasse laufen lässt: Mit 42 g dauert ein Shot länger als mit 36 g – auch wenn der Mahlgrad gleich ist. Der <b>Fluss</b> (Gramm pro Sekunde, sobald es läuft) bleibt dagegen fast gleich. Er zeigt deshalb direkt, ob der <b>Mahlgrad</b> passt:</p>
      <ul><li><b>Fluss zu hoch</b> → feiner mahlen</li><li><b>Fluss zu niedrig</b> → gröber mahlen</li><li><b>Fluss passt, Menge nicht</b> → nur früher oder später stoppen</li></ul>
      <p><b>Mehr Kaffee, z. B. 20 g?</b> Kein Problem. Bei gleicher Ratio soll auch mehr in die Tasse (ca. ${n(st.outMin * 20 / st.dose, 0)}–${n(st.outMax * 20 / st.dose, 0)} g) – in ungefähr derselben Zeit. Der Fluss ist dann höher (ca. ${n(st.fMin * 20 / st.dose, 1)}–${n(st.fMax * 20 / st.dose, 1)} g/s). Die App passt die Ziele automatisch an und rechnet den Fluss im Diagramm auf ${n(st.dose, 0)} g um, damit alle Shots vergleichbar bleiben. Was sich ändert: Mehr Kaffee bremst stärker, der passende Mahlgrad liegt also meist etwas gröber. Der Sweet Spot wird deshalb aus Shots mit ähnlicher Dosis berechnet. Und: Das Sieb muss die Menge fassen – für 20 g+ lohnt ein größeres Sieb.</p>
    </div>

    <div class="section-t">So stellst du ein</div>
    <div class="card pad kt"><ol>
      <li>Dosis genau wiegen (${n(st.dose, 1)} g) – und gleich lassen.</li>
      <li>Shot ziehen, Zeit und ersten Tropfen mit der Stoppuhr messen, Out wiegen.</li>
      <li>Fluss daneben? Mahlgrad in kleinen Schritten ändern (${n(st.step)}).</li>
      <li>Fluss passt? Probieren. Sauer → etwas mehr Out, bitter → etwas weniger.</li>
      <li>Immer nur <b>eine</b> Sache pro Shot ändern.</li>
    </ol></div>

    <div class="section-t">Was bewirkt was</div>
    <div class="card ktab">
      <div class="kr kh"><span>Änderung</span><span>Fluss</span><span>Zeit</span><span>Geschmack</span></div>
      <div class="kr"><span><b>Feiner mahlen</b></span><span>▼</span><span>▲</span><span>weniger sauer, kräftiger – zu fein: bitter</span></div>
      <div class="kr"><span><b>Gröber mahlen</b></span><span>▲</span><span>▼</span><span>leichter – zu grob: sauer, dünn</span></div>
      <div class="kr"><span><b>Mehr Dosis</b></span><span>▼</span><span>▲</span><span>mehr Körper – zu viel: dumpf</span></div>
      <div class="kr"><span><b>Mehr Out</b></span><span>=</span><span>▲</span><span>weniger sauer, leichter – zu viel: wässrig</span></div>
      <div class="kr"><span><b>Heißer</b></span><span>≈</span><span>≈</span><span>weniger sauer – zu heiß: bitter</span></div>
    </div>

    <div class="section-t">Deine Maschine: Lelit Mara X V2</div>
    <div class="card pad kt"><ul>
      <li><b>Kaffee-Modus:</b> Bei der V2 liegt er auf Schalterstellung <b>0</b> (bei der V1 war es I). Manche V2 wurden mit der alten Anleitung ausgeliefert.</li>
      <li><b>Temperatur-Stufen:</b> Laut Lelit-Datenblatt 0 = 90 °C, I = 92 °C, II = 94 °C. Kaffeemacher nennt 90–91 / 91–92 / 93–95 °C – das passt zu deinen Notizen. Während des Bezugs steigt die Temperatur leicht an.</li>
      <li><b>Aufheizen:</b> ca. 20–30 Min. Nach einem Moduswechsel mindestens 15 Min. warten, bis die Maschine stabil ist. Vor dem Shot kurz spülen.</li>
      <li><b>Pre-Infusion:</b> Die E61-Brühgruppe befeuchtet den Puck zuerst mit wenig Druck. Deshalb kommt der erste Tropfen erst nach einigen Sekunden – bei dir meist 9–10 s.</li>
    </ul></div>

    <div class="section-t">Deine Mühle: ${esc(st.grinder)}</div>
    <div class="card pad kt"><ul>
      <li><b>Stufenlos:</b> Laut Anleitung im Uhrzeigersinn feiner. In der App: höhere Zahl = ${st.coarserUp ? 'gröber' : 'feiner'} (unter Einstellungen änderbar).</li>
      <li>Schon kleine Schritte (${n(st.step)}) verändern den Fluss deutlich. Große Sprünge Richtung fein besser bei laufendem Motor machen.</li>
      <li><b>Jede Sorte hat ihren eigenen Mahlgrad</b> – auch eine neue Packung derselben Sorte kann woanders liegen.${spots ? ' Aus deinen Shots:' : ''}</li>
    </ul>${spots ? `<ul class="spots">${spots}</ul>` : ''}</div>

    <div class="section-t">Dos &amp; Don'ts</div>
    <div class="dd">
      <div class="card pad do"><b>✓ Machen</b><ul>
        <li>Dosis und Out immer wiegen (0,1 g).</li>
        <li>Kaffee im Sieb verteilen, gerade tampen.</li>
        <li>Siebträger warm und trocken halten.</li>
        <li>Nach einem komischen Shot erst noch einen ziehen – die App erkennt Ausreißer und sagt es dir.</li>
        <li>Neue Packung in der App markieren (Sorte bearbeiten → 📦), dann lernt der Sweet Spot neu.</li>
      </ul></div>
      <div class="card pad dont"><b>✗ Lassen</b><ul>
        <li>Mehrere Dinge gleichzeitig ändern.</li>
        <li>Nach dem Tampen an den Siebträger klopfen.</li>
        <li>Das Sieb überfüllen.</li>
        <li>Bohnen im Kühlschrank lagern.</li>
      </ul></div>
    </div>

    <div class="card pad honest"><b>Ehrlich gesagt</b>
      <p>Die Ziele sind Richtwerte, keine Naturgesetze. Schmeckt dir ein Shot außerhalb der Ziele besser, ist er richtig – dann passe die Ziele an. Die App kennt weder Druck noch Wasser noch den Geschmack; sie wertet nur aus, was du einträgst.</p>
      <p class="small muted">Quellen: Lelit-Datenblatt Mara X PL62X V2, Kaffeemacher (Mara-X-Ratgeber), Eureka/Clive-Bedienungsanleitung der Mignon Zero 65.</p>
    </div>`;
  }

  window.Wissen = { html };
})();
