// ═══════════════════════════════════════════════════════════════════════════
// KÖRPER-ATLAS · Daten
// Muskeln, Gelenke, Themen, Selbsttests, Übungen
// Inhalte sind allgemeines Trainingswissen – keine medizinische Diagnose.
// ═══════════════════════════════════════════════════════════════════════════
window.KPD = (function () {

// ── MUSKELN ─────────────────────────────────────────────────────────────────
// n=Name lat=Latein r=Region v=Ansichten deep=tiefe Schicht
// fn=Funktion tight=wenn verkürzt/überaktiv weak=wenn schwach/gehemmt
// syn=arbeitet mit ant=Gegenspieler j=Gelenke pain=typische Beschwerden
// bike=Rennrad-Bezug tests ex=Übungen
const M = {
  scm: {
    n: 'Kopfwender', lat: 'M. sternocleidomastoideus', r: 'Nacken', v: ['front'],
    fn: ['Dreht den Kopf zur Gegenseite', 'Neigt den Kopf zur gleichen Seite', 'Schiebt den Kopf nach vorn'],
    tight: ['Kopf-vorn-Haltung verstärkt sich', 'Spannungskopfschmerz an Stirn und Schläfe', 'Obere HWS wird überlastet'],
    weak: [],
    syn: ['trap_upper', 'levator'], ant: ['dnf'], j: ['hws'],
    pain: ['Seitlicher Nackenschmerz', 'Kopfschmerz, teils Schwindel'],
    bike: 'In tiefer Position hält er zusammen mit den Nackenstreckern stundenlang den Kopf.',
    tests: ['dnf_test'], ex: ['chin_tuck', 'neck_stretch']
  },
  dnf: {
    n: 'Tiefe Halsbeuger', lat: 'Mm. longus colli & capitis', r: 'Nacken', v: ['front'], deep: true,
    fn: ['Stabilisieren die HWS Wirbel für Wirbel', 'Ziehen das Kinn leicht zurück („Doppelkinn“)', 'Halten den Kopf über dem Rumpf'],
    tight: [],
    weak: ['Kopf wandert nach vorn', 'Oberflächliche Muskeln (SCM, Trapezius) übernehmen → Verspannung', 'Nackenschmerz, Kopfschmerz'],
    syn: [], ant: ['scm', 'trap_upper', 'levator'], j: ['hws'],
    pain: ['Nackenschmerz bei Bildschirmarbeit', 'Kopfschmerz ab dem Hinterkopf'],
    bike: 'Werden im Sattel kaum genutzt, weil der Kopf überstreckt ist – gezielt trainieren.',
    tests: ['dnf_test'], ex: ['chin_tuck']
  },
  trap_upper: {
    n: 'Oberer Trapezius', lat: 'M. trapezius pars descendens', r: 'Nacken / Schulter', v: ['front', 'back'],
    fn: ['Hebt das Schulterblatt (Schulter hochziehen)', 'Dreht das Schulterblatt beim Armheben nach oben', 'Neigt den Kopf zur Seite'],
    tight: ['Schultern hochgezogen, Nacken „hart“', 'Kopfschmerz, Druck am Hinterkopf', 'Verdrängt den unteren Trapezius beim Armheben'],
    weak: ['Schulter hängt, Arm heben fällt schwer (selten)'],
    syn: ['levator', 'scm'], ant: ['trap_low', 'lats'], j: ['hws', 'scap'],
    pain: ['Nackenverspannung', 'Schmerz zwischen Nacken und Schulter'],
    bike: 'Stress + Lenkerhaltung → Schultern wandern Richtung Ohren. Bewusst locker lassen.',
    tests: ['wall_angel', 'dnf_test'], ex: ['neck_stretch', 'wall_slide', 'prone_ytw']
  },
  levator: {
    n: 'Schulterblattheber', lat: 'M. levator scapulae', r: 'Nacken', v: ['back'], deep: true,
    fn: ['Hebt den oberen Schulterblattwinkel', 'Dreht das Schulterblatt nach unten', 'Neigt und dreht die HWS'],
    tight: ['Punktueller Schmerz am oberen Schulterblattrand', 'Kopf drehen eingeschränkt („steifer Hals“)', 'Schulterblatt kippt nach unten'],
    weak: [],
    syn: ['trap_upper', 'rhomboids'], ant: ['trap_low', 'serratus'], j: ['hws', 'scap'],
    pain: ['„Steifer Hals“ nach dem Aufwachen', 'Schmerz innerer oberer Schulterblattrand'],
    bike: 'Hält beim Schulterblick und in der Aero-Position mit.',
    tests: ['dnf_test'], ex: ['neck_stretch', 'wall_slide']
  },
  trap_low: {
    n: 'Mittlerer & unterer Trapezius', lat: 'M. trapezius pars transversa & ascendens', r: 'Oberer Rücken', v: ['back'],
    fn: ['Zieht die Schulterblätter zusammen und nach unten', 'Dreht das Schulterblatt beim Überkopf-Heben nach oben', 'Richtet die BWS mit auf'],
    tight: [],
    weak: ['Schulterblatt rutscht nach vorn/oben', 'Oberer Trapezius übernimmt → Nackenverspannung', 'Enge unter dem Schulterdach (Impingement)', 'Rundrücken'],
    syn: ['rhomboids', 'serratus'], ant: ['trap_upper', 'pec'], j: ['scap', 'bws'],
    pain: ['Brennen zwischen den Schulterblättern', 'Schulterschmerz beim Armheben'],
    bike: 'Ist in der runden Lenkerhaltung permanent gedehnt und schwach – Hauptbaustelle bei Radfahrern.',
    tests: ['wall_angel'], ex: ['wall_slide', 'prone_ytw', 'band_pull_apart', 'face_pull', 'row']
  },
  rhomboids: {
    n: 'Rautenmuskeln', lat: 'Mm. rhomboidei', r: 'Oberer Rücken', v: ['back'], deep: true,
    fn: ['Ziehen die Schulterblätter zur Wirbelsäule', 'Fixieren das Schulterblatt am Brustkorb'],
    tight: [],
    weak: ['Schulterblätter stehen ab und wandern nach außen', 'Runde Schultern', 'Ziehen zwischen den Schulterblättern (ständig gedehnt)'],
    syn: ['trap_low', 'levator'], ant: ['serratus', 'pec'], j: ['scap'],
    pain: ['Ziehen/Brennen zwischen den Schulterblättern'],
    bike: 'Lange Ausfahrten → Schulterblätter weit auseinander. Rudern gleicht aus.',
    tests: ['wall_angel', 'pec_minor'], ex: ['band_pull_apart', 'row', 'prone_ytw']
  },
  serratus: {
    n: 'Vorderer Sägemuskel', lat: 'M. serratus anterior', r: 'Brustkorb seitlich', v: ['front'],
    fn: ['Hält das Schulterblatt flach am Brustkorb', 'Schiebt das Schulterblatt nach vorn (Boxerschlag)', 'Dreht das Schulterblatt beim Überkopf-Heben nach oben'],
    tight: [],
    weak: ['Schulterblatt steht ab („Scapula alata“)', 'Überkopf-Bewegungen eingeengt', 'Schulterschmerz beim Stützen und Drücken'],
    syn: ['trap_low', 'pec'], ant: ['rhomboids', 'levator'], j: ['scap', 'shoulder'],
    pain: ['Schulterschmerz bei Liegestütz / Überkopf'],
    bike: 'Stützt im Sattel das Gewicht auf den Händen – Ausdauer fehlt oft.',
    tests: ['wall_angel'], ex: ['scap_pushup', 'wall_slide', 'pushup_plus']
  },
  pec: {
    n: 'Brustmuskel', lat: 'M. pectoralis major & minor', r: 'Brust', v: ['front'],
    fn: ['Zieht den Arm vor den Körper (Drücken, Umarmen)', 'Dreht den Arm nach innen', 'Pec minor kippt das Schulterblatt nach vorn'],
    tight: ['Runde, nach vorn gezogene Schultern', 'Schulterblatt kippt nach vorn → Enge unter dem Schulterdach', 'Arme über Kopf eingeschränkt', 'Kribbeln in den Händen möglich (Pec minor drückt auf Nerven/Gefäße)'],
    weak: ['Weniger Druckkraft (selten das Problem)'],
    syn: ['deltoid', 'serratus'], ant: ['rhomboids', 'trap_low'], j: ['shoulder', 'scap'],
    pain: ['Vordere Schulterschmerzen', 'Ziehen in der Brust bei Haltung'],
    bike: 'Verkürzt in der Lenkerhaltung – Brust öffnen ist Pflichtausgleich.',
    tests: ['pec_minor', 'wall_angel', 'apley'], ex: ['doorway_pec', 'thoracic_ext', 'pushup_plus']
  },
  deltoid: {
    n: 'Deltamuskel', lat: 'M. deltoideus', r: 'Schulter', v: ['front', 'back'],
    fn: ['Vorderer Teil: Arm nach vorn heben', 'Mittlerer Teil: Arm seitlich heben', 'Hinterer Teil: Arm nach hinten ziehen, Außenrotation'],
    tight: ['Vorderer Anteil überaktiv bei runden Schultern'],
    weak: ['Hinterer Anteil schwach → Schulterkopf rutscht nach vorn'],
    syn: ['cuff', 'pec', 'trap_upper'], ant: ['lats'], j: ['shoulder'],
    pain: ['Schmerz außen am Oberarm (oft ausstrahlend von der Rotatorenmanschette)'],
    bike: '',
    tests: ['apley'], ex: ['face_pull', 'band_pull_apart', 'cross_body']
  },
  cuff: {
    n: 'Rotatorenmanschette', lat: 'Supra-, Infraspinatus, Teres minor, Subscapularis', r: 'Schulter', v: ['back'],
    fn: ['Zentriert den Oberarmkopf in der flachen Pfanne', 'Dreht den Arm nach außen/innen', 'Startet das seitliche Armheben (Supraspinatus)'],
    tight: ['Hintere Kapsel/Infraspinatus verkürzt → Innenrotation eingeschränkt'],
    weak: ['Oberarmkopf rutscht beim Heben nach oben → Sehnen werden eingeklemmt', 'Schulterschmerz bei Überkopf-Bewegung', 'Instabilitätsgefühl'],
    syn: ['deltoid', 'trap_low', 'serratus'], ant: ['pec', 'lats'], j: ['shoulder', 'scap'],
    pain: ['Schmerz seitlich am Oberarm, v. a. nachts beim Liegen auf der Seite', 'Schmerzhafter Bogen beim Armheben (60–120°)'],
    bike: 'Fängt Stöße über den Lenker ab. Wenig belastet → wird mit der Zeit schwach.',
    tests: ['apley', 'wall_angel'], ex: ['ext_rot', 'face_pull', 'cross_body', 'prone_ytw']
  },
  lats: {
    n: 'Breiter Rückenmuskel', lat: 'M. latissimus dorsi', r: 'Rücken', v: ['back'],
    fn: ['Zieht den Arm nach unten/hinten (Klimmzug, Rudern)', 'Dreht den Arm nach innen', 'Verbindet über die Rückenfaszie Schulter und gegenüberliegendes Gesäß'],
    tight: ['Arme über Kopf nur mit Hohlkreuz möglich', 'Zieht Schulter nach unten-vorn', 'Erhöht Spannung an der LWS'],
    weak: ['Schwächere Zugkraft, weniger Rumpfstabilität über die Faszie'],
    syn: ['trap_low', 'glute_max', 'triceps'], ant: ['deltoid', 'trap_upper'], j: ['shoulder', 'lws'],
    pain: ['Ziehen seitlich am Rücken', 'Mitbeteiligt bei Schulter- und LWS-Problemen'],
    bike: 'Hilft beim Ziehen am Lenker im Wiegetritt und Sprint.',
    tests: ['wall_angel'], ex: ['lat_stretch', 'dead_hang', 'pulldown', 'row']
  },
  biceps: {
    n: 'Bizeps', lat: 'M. biceps brachii', r: 'Oberarm', v: ['front'],
    fn: ['Beugt den Ellbogen', 'Dreht den Unterarm nach außen (Supination)', 'Hilft beim Armheben nach vorn'],
    tight: ['Ellbogen streckt nicht ganz', 'Lange Bizepssehne reizt vorn an der Schulter'],
    weak: [],
    syn: ['forearm'], ant: ['triceps'], j: ['elbow', 'shoulder'],
    pain: ['Vorderer Schulterschmerz (lange Bizepssehne)'],
    bike: '',
    tests: [], ex: ['row', 'pulldown']
  },
  triceps: {
    n: 'Trizeps', lat: 'M. triceps brachii', r: 'Oberarm', v: ['back'],
    fn: ['Streckt den Ellbogen', 'Langer Kopf zieht den Arm nach hinten'],
    tight: ['Arme über Kopf mit gebeugtem Ellbogen eingeschränkt'],
    weak: ['Ellbogen knickt beim Stützen ein'],
    syn: ['lats'], ant: ['biceps'], j: ['elbow', 'shoulder'],
    pain: [],
    bike: 'Hält im Sattel den Oberkörper – leicht gebeugte Ellbogen dämpfen Stöße.',
    tests: [], ex: ['pushup_plus']
  },
  forearm: {
    n: 'Unterarmmuskulatur', lat: 'Hand-/Fingerbeuger & -strecker', r: 'Unterarm', v: ['front', 'back'],
    fn: ['Greifen und Halten', 'Bewegen Handgelenk und Finger', 'Stabilisieren das Handgelenk'],
    tight: ['Tennis-/Golferellbogen (Sehnenansatz überlastet)', 'Handgelenk wenig beweglich'],
    weak: ['Griffkraft lässt nach'],
    syn: ['biceps'], ant: [], j: ['elbow', 'wrist'],
    pain: ['Schmerz am Ellbogen außen/innen', 'Kribbeln in den Fingern'],
    bike: 'Dauerhaftes Greifen + Abstützen → Unterarme verspannen, Hände schlafen ein (Nerv in der Handwurzel).',
    tests: [], ex: ['wrist_mob', 'suitcase_carry']
  },
  abs: {
    n: 'Gerader Bauchmuskel', lat: 'M. rectus abdominis', r: 'Bauch', v: ['front'],
    fn: ['Beugt den Rumpf', 'Kontrolliert die Beckenkippung (Gegenspieler zum Hohlkreuz)', 'Erhöht mit den anderen Bauchmuskeln den Rumpfdruck'],
    tight: ['Zieht Brustkorb runter → Rundrücken'],
    weak: ['Becken kippt nach vorn → Hohlkreuz', 'LWS wird bei Belastung überstreckt'],
    syn: ['obliques', 'tva'], ant: ['erector'], j: ['lws'],
    pain: [],
    bike: 'Stabilisiert das Becken für einen ruhigen, kraftvollen Tritt.',
    tests: ['flexor_end'], ex: ['mcgill_curl', 'dead_bug']
  },
  obliques: {
    n: 'Schräge Bauchmuskeln', lat: 'Mm. obliqui externus & internus', r: 'Bauch seitlich', v: ['front'],
    fn: ['Drehen und neigen den Rumpf', 'Verhindern ungewollte Rotation (Anti-Rotation)', 'Verbinden Brustkorb mit gegenüberliegender Hüfte (vordere Schlinge)'],
    tight: ['Rumpfdrehung eingeschränkt'],
    weak: ['Rumpf „wackelt“ bei einseitiger Belastung', 'Kraftverlust zwischen Bein und Oberkörper'],
    syn: ['tva', 'abs', 'ql'], ant: ['erector'], j: ['lws', 'bws'],
    pain: ['Seitlicher Bauch-/Flankenschmerz bei Überlastung'],
    bike: 'Halten den Oberkörper ruhig, wenn die Beine abwechselnd treten.',
    tests: ['side_plank_t'], ex: ['side_plank', 'pallof', 'open_book']
  },
  tva: {
    n: 'Querer Bauchmuskel', lat: 'M. transversus abdominis', r: 'Bauch (tief)', v: ['front'], deep: true,
    fn: ['Wirkt wie ein Korsett um den Bauch', 'Baut zusammen mit Zwerchfell und Beckenboden Rumpfdruck auf', 'Aktiviert sich idealerweise kurz vor jeder Bewegung'],
    tight: [],
    weak: ['LWS wird bei Belastung zu wenig stabilisiert', 'Rückenstrecker spannen kompensatorisch an'],
    syn: ['diaphragm', 'multifidus', 'obliques'], ant: [], j: ['lws', 'isg'],
    pain: ['Unspezifischer Kreuzschmerz bei Belastung'],
    bike: '',
    tests: ['flexor_end'], ex: ['breathing_9090', 'dead_bug', 'pallof']
  },
  diaphragm: {
    n: 'Zwerchfell', lat: 'Diaphragma', r: 'Brustkorb (tief)', v: ['front'], deep: true,
    fn: ['Hauptatemmuskel', 'Deckel der „Rumpfdose“ – erzeugt Druck zur Stabilisierung', 'Beeinflusst Haltung von Brustkorb und LWS'],
    tight: ['Brustatmung statt Bauchatmung → Nackenmuskeln atmen mit'],
    weak: ['Rumpfstabilität sinkt, Rippen stehen vorn hoch („Rippenbogen offen“)'],
    syn: ['tva', 'multifidus'], ant: [], j: ['bws', 'lws'],
    pain: [],
    bike: 'Tiefe Atmung in gebeugter Position braucht ein bewegliches Zwerchfell.',
    tests: [], ex: ['breathing_9090']
  },
  erector: {
    n: 'Rückenstrecker', lat: 'M. erector spinae', r: 'Rücken', v: ['back'],
    fn: ['Streckt und richtet die Wirbelsäule auf', 'Hält den Oberkörper bei Vorneigung (z. B. im Sattel)', 'Neigt den Rumpf zur Seite'],
    tight: ['Hohlkreuz verstärkt sich', 'Übernimmt Arbeit eines schwachen Gesäßes → Dauerspannung', 'Kreuzschmerz nach langem Stehen'],
    weak: ['Wenig Ausdauer beim Halten der Vorneigung', 'Rundrücken unter Last'],
    syn: ['multifidus', 'glute_max', 'hamstrings'], ant: ['abs'], j: ['lws', 'bws'],
    pain: ['Verspannter, schmerzender unterer Rücken', 'Muskelhartspann neben der Wirbelsäule'],
    bike: 'Hält stundenlang den Oberkörper – braucht vor allem Ausdauer.',
    tests: ['sorensen', 'toe_touch'], ex: ['cat_cow', 'bird_dog', 'back_ext', 'rdl']
  },
  multifidus: {
    n: 'Multifidus', lat: 'Mm. multifidi', r: 'Rücken (tief)', v: ['back'], deep: true,
    fn: ['Stabilisiert jeden einzelnen Wirbel', 'Feinsteuerung der Wirbelsäule', 'Mit dem queren Bauchmuskel Teil des inneren Stabilitätssystems'],
    tight: [],
    weak: ['Nach Rückenschmerz oft „abgeschaltet“ und geschrumpft', 'Segmentale Instabilität → wiederkehrender Kreuzschmerz'],
    syn: ['tva', 'erector', 'diaphragm'], ant: [], j: ['lws', 'isg'],
    pain: ['Wiederkehrender, tiefer Kreuzschmerz'],
    bike: '',
    tests: ['sorensen'], ex: ['bird_dog', 'cat_cow']
  },
  ql: {
    n: 'Quadratischer Lendenmuskel', lat: 'M. quadratus lumborum', r: 'Lende (tief)', v: ['back'], deep: true,
    fn: ['Neigt den Rumpf zur Seite', 'Hebt die Beckenseite an', 'Stabilisiert die LWS seitlich (z. B. beim Tragen)'],
    tight: ['Beckenschiefstand, ein Bein wirkt kürzer', 'Einseitiger Kreuzschmerz', 'Springt ein, wenn der Glute medius schwach ist'],
    weak: ['Seitliches Einknicken beim Tragen und Gehen'],
    syn: ['obliques', 'glute_med', 'erector'], ant: [], j: ['lws'],
    pain: ['Einseitiger tiefer Kreuzschmerz knapp über dem Becken', 'Schmerz beim Aufstehen und Umdrehen im Bett'],
    bike: 'Arbeitet bei Seitenneigung im Wiegetritt mit.',
    tests: ['side_plank_t'], ex: ['side_stretch', 'side_plank', 'suitcase_carry']
  },
  iliopsoas: {
    n: 'Hüftbeuger', lat: 'M. iliopsoas', r: 'Hüfte / Leiste (tief)', v: ['front'], deep: true,
    fn: ['Beugt die Hüfte (Knie hoch)', 'Zieht die LWS nach vorn-unten', 'Stabilisiert die LWS bei Bewegung'],
    tight: ['Becken kippt nach vorn → Hohlkreuz', 'Hüftstreckung fehlt → Gesäß wird gehemmt', 'Zug an der LWS → Kreuzschmerz im Stehen/Gehen'],
    weak: ['Knie hochziehen fällt schwer, Bein „schleift“'],
    syn: ['quads', 'tfl'], ant: ['glute_max', 'hamstrings'], j: ['hip', 'lws'],
    pain: ['Leistenschmerz', 'Kreuzschmerz nach langem Sitzen'],
    bike: 'Wird beim Radfahren nie gestreckt (Hüfte immer gebeugt) – Hauptbaustelle Nr. 1.',
    tests: ['thomas', 'aslr'], ex: ['hip_flexor_stretch', 'couch_stretch', 'split_squat']
  },
  tfl: {
    n: 'Schenkelbindenspanner', lat: 'M. tensor fasciae latae + IT-Band', r: 'Hüfte außen', v: ['front'],
    fn: ['Hilft Hüfte beugen, abspreizen und innen drehen', 'Spannt das IT-Band (Tractus iliotibialis)', 'Stabilisiert das Knie außen'],
    tight: ['Übernimmt die Arbeit eines schwachen Glute medius', 'Zieht Knie nach innen (Innenrotation)', 'IT-Band-Syndrom: Reibeschmerz außen am Knie'],
    weak: [],
    syn: ['glute_med', 'iliopsoas'], ant: ['adductors'], j: ['hip', 'knee'],
    pain: ['Schmerz außen an Hüfte oder Knie', 'Spannung entlang der Oberschenkel-Außenseite'],
    bike: 'Klassiker bei Radfahrern: IT-Band-Schmerz, oft wegen schwachem Gesäß oder falscher Cleat-Stellung.',
    tests: ['thomas', 'sl_squat'], ex: ['foam_tfl', 'clamshell', 'side_hip_abd']
  },
  glute_max: {
    n: 'Großer Gesäßmuskel', lat: 'M. gluteus maximus', r: 'Gesäß', v: ['back'],
    fn: ['Streckt die Hüfte (Aufstehen, Treppe, Sprinten)', 'Dreht den Oberschenkel nach außen', 'Richtet das Becken auf und entlastet die LWS'],
    tight: ['Hüftbeugung/-innenrotation eingeschränkt (selten)'],
    weak: ['Rückenstrecker und Hamstrings übernehmen → Überlastung', 'Becken kippt nach vorn', 'Knie fällt nach innen', 'Weniger Kraft am Rad'],
    syn: ['hamstrings', 'erector', 'lats'], ant: ['iliopsoas', 'quads'], j: ['hip', 'isg', 'lws'],
    pain: ['Gesäßschmerz bei Überlastung (oft eher Ansatzsehnen)'],
    bike: 'Der stärkste Muskel – am Rad aber oft „eingeschlafen“, weil die Hüfte nie ganz streckt. Kraftraining holt ihn zurück.',
    tests: ['glute_bridge_sl', 'thomas'], ex: ['glute_bridge', 'hip_thrust', 'rdl', 'split_squat', 'bird_dog']
  },
  glute_med: {
    n: 'Mittlerer Gesäßmuskel', lat: 'M. gluteus medius', r: 'Gesäß seitlich', v: ['back'],
    fn: ['Hält das Becken im Einbeinstand gerade', 'Spreizt das Bein ab', 'Verhindert, dass das Knie nach innen fällt'],
    tight: ['Druckschmerz seitlich an der Hüfte'],
    weak: ['Becken kippt beim Gehen zur Gegenseite (Trendelenburg)', 'Knie fällt nach innen (Valgus)', 'TFL & QL kompensieren', 'Knieschmerz, IT-Band-Probleme'],
    syn: ['tfl', 'ql', 'glute_max'], ant: ['adductors'], j: ['hip', 'knee'],
    pain: ['Seitlicher Hüftschmerz (Trochanter)', 'Knieschmerz als Folge'],
    bike: 'Hält das Knie in der Spur über dem Pedal – wichtig für saubere Kniebahn.',
    tests: ['sl_squat', 'side_plank_t', 'sl_stance', 'glute_bridge_sl'], ex: ['clamshell', 'side_hip_abd', 'single_leg_rdl', 'step_down', 'side_plank']
  },
  piriformis: {
    n: 'Tiefe Hüftrotatoren', lat: 'M. piriformis & Co.', r: 'Gesäß (tief)', v: ['back'], deep: true,
    fn: ['Drehen den Oberschenkel nach außen', 'Zentrieren den Hüftkopf in der Pfanne', 'Stabilisieren das ISG'],
    tight: ['Hüft-Innenrotation eingeschränkt', 'Kann den Ischiasnerv reizen → Ausstrahlung ins Bein („Piriformis-Syndrom“)', 'Tiefer Gesäßschmerz beim Sitzen'],
    weak: ['Hüftkopf weniger zentriert'],
    syn: ['glute_max'], ant: ['tfl', 'adductors'], j: ['hip', 'isg'],
    pain: ['Tiefer Gesäßschmerz, v. a. im Sitzen', 'Ausstrahlung ins hintere Bein'],
    bike: 'Viel Sitzen + Druck vom Sattel → häufig verspannt.',
    tests: ['hip_ir'], ex: ['n9090', 'clamshell']
  },
  adductors: {
    n: 'Adduktoren', lat: 'Mm. adductores', r: 'Oberschenkel innen', v: ['front', 'back'],
    fn: ['Ziehen das Bein zur Mitte', 'Stabilisieren Becken und Knie', 'Helfen bei Hüftbeugung und -streckung'],
    tight: ['Hocke und breite Stände eingeschränkt', 'Ziehen Knie nach innen', 'Leistenzerrungsrisiko'],
    weak: ['Becken und Knie weniger stabil', 'Leistenschmerz bei Belastung'],
    syn: ['iliopsoas', 'glute_max'], ant: ['glute_med', 'tfl'], j: ['hip', 'knee'],
    pain: ['Leistenschmerz', 'Ziehen innen am Oberschenkel'],
    bike: '',
    tests: ['deep_squat_t'], ex: ['adductor_rockback', 'copenhagen', 'goblet_squat']
  },
  quads: {
    n: 'Quadrizeps', lat: 'M. quadriceps femoris', r: 'Oberschenkel vorn', v: ['front'],
    fn: ['Streckt das Knie (Treten, Treppensteigen)', 'Rectus femoris beugt zusätzlich die Hüfte', 'Führt die Kniescheibe'],
    tight: ['Rectus femoris kippt das Becken nach vorn → Hohlkreuz', 'Druck auf die Kniescheibe → Schmerz vorn am Knie'],
    weak: ['Innerer Anteil (VMO) schwach → Kniescheibe läuft nach außen', 'Knie instabil bei Treppe/Abfahrt'],
    syn: ['iliopsoas', 'glute_max'], ant: ['hamstrings'], j: ['knee', 'hip'],
    pain: ['Schmerz vorn am Knie / unter der Kniescheibe', 'Patellasehnenschmerz'],
    bike: 'Hauptantrieb am Rad, wird stark und kurz. Dehnen + Gesäß stärken für Balance.',
    tests: ['thomas', 'sl_squat'], ex: ['couch_stretch', 'foam_tfl', 'split_squat', 'step_down', 'wall_sit', 'goblet_squat']
  },
  hamstrings: {
    n: 'Hintere Oberschenkel', lat: 'Ischiocrurale Muskulatur', r: 'Oberschenkel hinten', v: ['back'],
    fn: ['Beugen das Knie', 'Strecken die Hüfte (mit dem Gesäß)', 'Richten das Becken auf, bremsen das Bein beim Sprint'],
    tight: ['Becken kippt nach hinten → flacher Rücken, LWS rundet beim Bücken', 'Vorbeugen eingeschränkt', 'Zerrungsrisiko'],
    weak: ['Knie weniger stabil', 'Bei schwachem Gesäß krampfen sie, weil sie Hüftstreckung allein übernehmen'],
    syn: ['glute_max', 'calves', 'erector'], ant: ['quads', 'iliopsoas'], j: ['hip', 'knee'],
    pain: ['Ziehen hinten am Oberschenkel', 'Schmerz am Sitzbein (Ansatzsehne)'],
    bike: 'Arbeiten im Zug-Teil des Tritts, werden aber nie voll gestreckt.',
    tests: ['aslr', 'toe_touch', 'glute_bridge_sl'], ex: ['hamstring_floss', 'toe_touch_prog', 'rdl', 'nordic', 'single_leg_rdl']
  },
  calves: {
    n: 'Wadenmuskulatur', lat: 'M. gastrocnemius & soleus', r: 'Unterschenkel hinten', v: ['back', 'front'],
    fn: ['Streckt den Fuß (Zehenspitzen, Abdruck)', 'Gastrocnemius beugt zusätzlich das Knie', 'Bremst das Schienbein beim Gehen nach vorn'],
    tight: ['Sprunggelenk beugt zu wenig → Ferse hebt in der Hocke', 'Fuß knickt ein, Knie fällt nach innen', 'Achillessehne und Plantarfaszie überlastet'],
    weak: ['Wenig Abdruck, schnelle Ermüdung', 'Achillessehne weniger belastbar'],
    syn: ['hamstrings'], ant: ['tibialis'], j: ['ankle', 'knee', 'foot'],
    pain: ['Wadenkrämpfe', 'Achillessehnenschmerz', 'Fersenschmerz morgens (Plantarfaszie)'],
    bike: 'Tritt mit gestrecktem Fuß → Waden bleiben kurz. Regelmäßig dehnen.',
    tests: ['knee_to_wall', 'toe_touch', 'deep_squat_t'], ex: ['calf_stretch', 'ankle_mob', 'calf_raise']
  },
  tibialis: {
    n: 'Vorderer Schienbeinmuskel', lat: 'M. tibialis anterior', r: 'Unterschenkel vorn', v: ['front'],
    fn: ['Zieht den Fuß hoch (Dorsalflexion)', 'Stützt das Fußgewölbe von innen', 'Bremst den Fuß beim Aufsetzen'],
    tight: ['Schienbeinkantenschmerz bei Überlastung'],
    weak: ['Fuß „klatscht“ auf', 'Gewölbe sinkt ein', 'Schienbeinkantensyndrom beim Laufen'],
    syn: ['foot_int'], ant: ['calves'], j: ['ankle', 'foot'],
    pain: ['Schmerz an der Schienbeinkante'],
    bike: '',
    tests: ['knee_to_wall'], ex: ['tibialis_raise', 'ankle_mob']
  },
  foot_int: {
    n: 'Fußmuskulatur', lat: 'Kurze Fußmuskeln (intrinsisch)', r: 'Fuß', v: ['front'],
    fn: ['Halten das Längs- und Quergewölbe', 'Feinsteuerung der Balance', 'Verteilen den Druck beim Stehen und Treten'],
    tight: [],
    weak: ['Gewölbe sinkt (Knick-Senkfuß)', 'Knie und Hüfte drehen nach innen', 'Plantarfasziitis, Fußschmerz'],
    syn: ['tibialis'], ant: [], j: ['foot', 'ankle'],
    pain: ['Fußsohlenschmerz', 'Brennen/Taubheit im Vorfuß'],
    bike: 'Steife Radschuhe → Fußmuskeln arbeiten kaum. Barfuß-Training gleicht aus.',
    tests: ['sl_stance', 'sl_squat'], ex: ['short_foot', 'single_leg_balance']
  }
};

// ── GELENKE ─────────────────────────────────────────────────────────────────
// need: 'mob' braucht Mobilität · 'stab' braucht Stabilität (Joint-by-Joint)
const J = {
  hws: {
    n: 'Halswirbelsäule', lat: 'HWS (C1–C7)', need: 'stab', v: ['front', 'back'],
    needTxt: 'Untere HWS braucht Stabilität, obere HWS Beweglichkeit.',
    moves: ['Beugen/Strecken (Nicken)', 'Drehen', 'Seitneigen'],
    mus: ['dnf', 'scm', 'trap_upper', 'levator'],
    comp: ['Steife BWS → HWS muss mehr bewegen → Überlastung', 'Kopf vorne → Hebel auf den Nacken vervielfacht sich'],
    pain: ['Nackenschmerz, Kopfschmerz', 'Ausstrahlung in Schulter/Arm (bei Nervenreizung)'],
    bike: 'Im Sattel stark überstreckt, um nach vorn zu schauen.',
    tests: ['dnf_test', 'thor_rot'], ex: ['chin_tuck', 'thoracic_ext', 'neck_stretch']
  },
  bws: {
    n: 'Brustwirbelsäule', lat: 'BWS (Th1–Th12)', need: 'mob', v: ['back'],
    needTxt: 'Braucht Mobilität – vor allem Streckung und Rotation.',
    moves: ['Strecken (aufrichten)', 'Drehen', 'Seitneigen'],
    mus: ['erector', 'trap_low', 'rhomboids', 'obliques'],
    comp: ['Steife BWS → LWS und HWS müssen Rotation/Streckung übernehmen', 'Rundrücken → Schulterblatt kippt → Schulter eingeengt'],
    pain: ['Schmerz zwischen den Schulterblättern', 'Folgebeschwerden in Nacken, Schulter, LWS'],
    bike: 'Stundenlang gerundet, ohne Rotation – sie wird steif, wenn man nicht gegensteuert.',
    tests: ['thor_rot', 'wall_angel'], ex: ['open_book', 'thoracic_ext', 'cat_cow']
  },
  lws: {
    n: 'Lendenwirbelsäule', lat: 'LWS (L1–L5)', need: 'stab', v: ['back'],
    needTxt: 'Braucht Stabilität – sie ist für Rotation kaum gebaut (nur ~1–2° pro Segment).',
    moves: ['Beugen/Strecken', 'Seitneigen', 'kaum Rotation'],
    mus: ['erector', 'multifidus', 'ql', 'tva', 'abs', 'iliopsoas'],
    comp: ['Steife Hüfte → LWS beugt beim Bücken statt der Hüfte', 'Steife BWS → LWS dreht mit → Facettengelenke/Bandscheibe überlastet', 'Schwaches Gesäß/Rumpf → Rückenstrecker überlastet'],
    pain: ['Kreuzschmerz', 'Ausstrahlung ins Bein (Bandscheibe/Nerv) – ärztlich abklären'],
    bike: 'Rund im Sattel, gleichzeitig muss sie den Tritt-Druck übertragen – Rumpfstabilität entscheidend.',
    tests: ['sorensen', 'flexor_end', 'side_plank_t'], ex: ['cat_cow', 'dead_bug', 'bird_dog', 'side_plank']
  },
  isg: {
    n: 'Kreuz-Darmbein-Gelenk', lat: 'Iliosakralgelenk (ISG)', need: 'stab', v: ['back'],
    needTxt: 'Braucht Stabilität – minimale Beweglichkeit, wird über Muskeln & Bänder „zugeschnürt“.',
    moves: ['Nur wenige Millimeter Nutation/Gegennutation'],
    mus: ['glute_max', 'piriformis', 'multifidus', 'tva'],
    comp: ['Schwaches Gesäß/Rumpf → ISG weniger stabil', 'Beckenschiefstand durch einseitige Verspannung (QL, Hüftbeuger)'],
    pain: ['Einseitiger Schmerz am „Grübchen“ über dem Gesäß', 'Ausstrahlung ins Gesäß/Leiste'],
    bike: 'Asymmetrische Sattelposition oder Beinlängendifferenz kann es reizen.',
    tests: ['glute_bridge_sl', 'sl_stance'], ex: ['glute_bridge', 'bird_dog', 'dead_bug']
  },
  scap: {
    n: 'Schulterblatt', lat: 'Skapulothorakales Gleitlager', need: 'stab', v: ['back'],
    needTxt: 'Braucht Stabilität – stabile, aber gut gesteuerte Basis für den Arm.',
    moves: ['Heben/Senken', 'Vor/Zurück', 'Nach oben/unten drehen', 'Kippen'],
    mus: ['trap_upper', 'trap_low', 'rhomboids', 'serratus', 'levator', 'pec'],
    comp: ['Schlecht gesteuertes Schulterblatt → Schultergelenk eingeengt', 'Oberer Trapezius kompensiert → Nacken'],
    pain: ['Schmerz am Schulterblattrand', 'Schulter-Impingement als Folge'],
    bike: 'Trägt mit dem Arm das Oberkörpergewicht.',
    tests: ['wall_angel', 'pec_minor'], ex: ['wall_slide', 'scap_pushup', 'band_pull_apart', 'row']
  },
  shoulder: {
    n: 'Schultergelenk', lat: 'Glenohumeralgelenk', need: 'mob', v: ['front', 'back'],
    needTxt: 'Braucht Mobilität – das beweglichste Gelenk des Körpers, gesichert durch Muskeln.',
    moves: ['Heben vorn/seitlich', 'Innen-/Außenrotation', 'Nach hinten strecken'],
    mus: ['cuff', 'deltoid', 'pec', 'lats', 'biceps', 'triceps'],
    comp: ['Eingeschränkte Schulter → Hohlkreuz beim Überkopf', 'Fehlende Innenrotation → Kompensation über Schulterblatt'],
    pain: ['Impingement, Sehnenreizung', 'Nachtschmerz beim Seitliegen'],
    bike: 'Kaum Bewegung, viel statisches Halten.',
    tests: ['apley', 'wall_angel'], ex: ['cross_body', 'dead_hang', 'ext_rot', 'face_pull']
  },
  elbow: {
    n: 'Ellbogen', lat: 'Articulatio cubiti', need: 'stab', v: ['front', 'back'],
    needTxt: 'Braucht Stabilität.',
    moves: ['Beugen/Strecken', 'Unterarm drehen'],
    mus: ['biceps', 'triceps', 'forearm'],
    comp: ['Steifes Handgelenk/Schulter → Ellbogen überlastet (Tennisarm)'],
    pain: ['Schmerz außen (Tennisarm) oder innen (Golferarm)'],
    bike: 'Leicht gebeugt halten – nicht durchgestreckt, sonst gehen Stöße in Schulter/Nacken.',
    tests: [], ex: ['wrist_mob', 'suitcase_carry']
  },
  wrist: {
    n: 'Handgelenk', lat: 'Articulatio radiocarpalis', need: 'mob', v: ['front', 'back'],
    needTxt: 'Braucht Mobilität.',
    moves: ['Beugen/Strecken', 'Seitlich kippen'],
    mus: ['forearm'],
    comp: ['Steifes Handgelenk → Ellbogen und Schulter kompensieren'],
    pain: ['Taubheit Ring-/Kleinfinger (Ulnarisnerv)', 'Kribbeln Daumen–Mittelfinger (Karpaltunnel)'],
    bike: 'Druck auf die Handwurzel → eingeschlafene Finger. Griffposition wechseln, Lenkerband/Handschuhe prüfen.',
    tests: [], ex: ['wrist_mob']
  },
  hip: {
    n: 'Hüftgelenk', lat: 'Articulatio coxae', need: 'mob', v: ['front'],
    needTxt: 'Braucht Mobilität in alle Richtungen: Beugen, Strecken, Rotation, Abspreizen.',
    moves: ['Beugen/Strecken', 'Innen-/Außenrotation', 'Abspreizen/Heranziehen'],
    mus: ['iliopsoas', 'glute_max', 'glute_med', 'piriformis', 'adductors', 'tfl', 'quads', 'hamstrings'],
    comp: ['Steife Hüfte → LWS bewegt statt Hüfte → Kreuzschmerz', 'Fehlende Innenrotation → Knie dreht ein', 'Fehlende Streckung → Hohlkreuz beim Gehen/Laufen'],
    pain: ['Leistenschmerz (Gelenk)', 'Seitlicher Hüftschmerz (Sehnen/Schleimbeutel)'],
    bike: 'Arbeitet nur zwischen ca. 40° und 110° Beugung – Streckung und Rotation fehlen komplett.',
    tests: ['thomas', 'hip_ir', 'deep_squat_t'], ex: ['n9090', 'hip_flexor_stretch', 'adductor_rockback', 'deep_squat']
  },
  knee: {
    n: 'Kniegelenk', lat: 'Articulatio genus', need: 'stab', v: ['front', 'back'],
    needTxt: 'Braucht Stabilität – ein Scharnier zwischen zwei Mobilitätsgelenken (Hüfte & Sprunggelenk).',
    moves: ['Beugen/Strecken', 'Leichte Rotation in Beugung'],
    mus: ['quads', 'hamstrings', 'calves', 'tfl', 'adductors'],
    comp: ['Steifes Sprunggelenk → Knie weicht nach innen aus', 'Schwache Hüfte → Oberschenkel dreht ein → Knie-Valgus'],
    pain: ['Schmerz vorn (Kniescheibe/Patellasehne)', 'Schmerz außen (IT-Band)', 'Schmerz innen (Pes anserinus/Meniskus)'],
    bike: 'Sattelhöhe: zu tief → vorn, zu hoch → hinten. Cleats: Knie muss in der Spur laufen.',
    tests: ['sl_squat', 'knee_to_wall'], ex: ['step_down', 'split_squat', 'wall_sit', 'clamshell']
  },
  ankle: {
    n: 'Sprunggelenk', lat: 'Oberes Sprunggelenk (OSG)', need: 'mob', v: ['front', 'back'],
    needTxt: 'Braucht Mobilität – v. a. Dorsalflexion (Knie nach vorn über die Zehen).',
    moves: ['Fuß heben (Dorsalflexion)', 'Fuß senken (Plantarflexion)'],
    mus: ['calves', 'tibialis'],
    comp: ['Fehlende Dorsalflexion → Fuß knickt ein, Knie fällt nach innen', 'Ferse hebt in der Hocke → Rumpf kippt vor → LWS rund'],
    pain: ['Achillessehnenschmerz', 'Vorderer Gelenkschmerz bei Hocke'],
    bike: 'Tritt mit wenig Bewegungsumfang → wird steifer.',
    tests: ['knee_to_wall', 'deep_squat_t'], ex: ['ankle_mob', 'calf_stretch', 'deep_squat']
  },
  foot: {
    n: 'Fuß & Gewölbe', lat: 'Fußwurzel, Mittelfuß, Großzehe', need: 'stab', v: ['front'],
    needTxt: 'Braucht Stabilität – stabiles Gewölbe als Fundament (Großzehe zusätzlich beweglich).',
    moves: ['Gewölbe anspannen/entspannen', 'Großzehe strecken (Abrollen)'],
    mus: ['foot_int', 'tibialis', 'calves'],
    comp: ['Instabiler Fuß → Knie und Hüfte drehen nach innen', 'Steife Großzehe → Abrollen über die Außenseite'],
    pain: ['Fersen-/Fußsohlenschmerz', 'Vorfußschmerz, taube Zehen'],
    bike: 'Taube Zehen: Schuh zu eng, Cleats zu weit vorn oder fehlende Einlagen.',
    tests: ['sl_stance', 'sl_squat'], ex: ['short_foot', 'single_leg_balance']
  }
};

// ── ÜBUNGEN ─────────────────────────────────────────────────────────────────
// t: 'mob' Mobilisieren/Dehnen · 'akt' Aktivieren/Ansteuern · 'kraft' Kräftigen
const E = {
  // Mobilisieren
  cat_cow: { n: 'Katze-Kuh', t: 'mob', dose: '2× 8–10 langsam', m: ['erector', 'multifidus', 'lws', 'bws'],
    how: ['Vierfüßlerstand, Hände unter Schultern, Knie unter Hüfte.', 'Ausatmen: Rücken Wirbel für Wirbel rund machen, Kinn zur Brust.', 'Einatmen: Brust nach vorn schieben, Becken kippen, Blick leicht nach vorn.'],
    err: 'Bewegung über die ganze Wirbelsäule verteilen, nicht nur im Hohlkreuz/Nacken.' },
  open_book: { n: 'Open Book (BWS-Rotation)', t: 'mob', dose: '2× 8 je Seite', m: ['bws', 'obliques', 'pec'],
    how: ['Seitlage, Knie 90° gebeugt, ein Kissen unter dem Kopf.', 'Arme gestreckt vor der Brust übereinander.', 'Oberen Arm wie eine Buchseite nach hinten öffnen, Blick folgt der Hand.', '2 Atemzüge halten, zurück.'],
    err: 'Knie bleiben aufeinander liegen – sonst dreht die LWS statt der BWS.' },
  thoracic_ext: { n: 'BWS-Streckung auf der Rolle', t: 'mob', dose: '2× 6–8 je Höhe', m: ['bws', 'pec'],
    how: ['Faszienrolle quer unter die BWS (unterhalb der Schulterblätter).', 'Hände stützen den Kopf, Gesäß bleibt am Boden.', 'Über die Rolle nach hinten strecken, ausatmen.', 'Rolle eine Handbreit höher setzen und wiederholen.'],
    err: 'Nicht unter die LWS rollen; Rippen unten halten, kein Hohlkreuz.' },
  hip_flexor_stretch: { n: 'Kniender Hüftbeuger-Stretch', t: 'mob', dose: '2× 45–60 s je Seite', m: ['iliopsoas', 'quads', 'hip'],
    how: ['Halbkniestand, hinteres Knie auf ein Polster.', 'Gesäß der hinteren Seite fest anspannen, Becken aufrichten (Steißbein nach unten).', 'Hüfte langsam nach vorn schieben, bis es vorn in der Leiste zieht.', 'Mehr: Arm der hinteren Seite hoch und zur Gegenseite neigen.'],
    err: 'Nicht ins Hohlkreuz ausweichen – die Dehnung kommt vom Becken-Aufrichten.' },
  couch_stretch: { n: 'Couch Stretch', t: 'mob', dose: '2× 60 s je Seite', m: ['quads', 'iliopsoas'],
    how: ['Hinteres Knie nah an Wand oder Sofa, Schienbein an der Wand nach oben.', 'Vorderer Fuß aufgestellt.', 'Gesäß anspannen, Oberkörper langsam aufrichten.', 'Ruhig atmen, nicht reißen.'],
    err: 'Becken neutral halten. Ist es zu intensiv: Knie weiter weg von der Wand.' },
  n9090: { n: '90/90-Hüftrotation', t: 'mob', dose: '2× 8 Wechsel + 30 s halten je Seite', m: ['hip', 'piriformis', 'glute_max', 'glute_med'],
    how: ['Sitzen, vorderes und hinteres Bein jeweils 90° gebeugt.', 'Aufrecht sitzen, über das vordere Schienbein nach vorn lehnen (Außenrotation).', 'Dann zur hinteren Seite drehen (Innenrotation).', 'Knie langsam von einer Seite zur anderen wechseln.'],
    err: 'Aufrechte Wirbelsäule – die Bewegung kommt aus der Hüfte, nicht aus dem Rundrücken.' },
  adductor_rockback: { n: 'Adduktoren-Rockback', t: 'mob', dose: '2× 10 je Seite', m: ['adductors', 'hip'],
    how: ['Vierfüßlerstand, ein Bein gestreckt zur Seite, Fuß flach.', 'Rücken gerade, Gesäß langsam Richtung Ferse schieben.', 'Kurz halten, wieder nach vorn.'],
    err: 'Rücken bleibt lang, nicht rund werden.' },
  deep_squat: { n: 'Tiefe Hocke halten', t: 'mob', dose: '3× 30–60 s', m: ['hip', 'ankle', 'adductors', 'calves'],
    how: ['Füße etwas breiter als hüftbreit, Zehen leicht nach außen.', 'Tief in die Hocke sinken, Fersen am Boden.', 'Ellbogen drücken Knie sanft nach außen, Brust aufrichten.', 'Bei Bedarf an Türrahmen festhalten oder Fersen unterlegen.'],
    err: 'Fersen bleiben unten – sonst lieber Unterlage nutzen.' },
  hamstring_floss: { n: 'Hamstring-Gleiten (Nervengleiten)', t: 'mob', dose: '2× 12 je Seite', m: ['hamstrings'],
    how: ['Rückenlage, Oberschenkel senkrecht halten (Hände in der Kniekehle).', 'Knie strecken bis leichter Zug, dabei Fuß anziehen.', 'Knie beugen und Fuß strecken – fließend wechseln.'],
    err: 'Kein Halten in den Schmerz – rhythmisch bewegen. Kribbeln = zu weit.' },
  toe_touch_prog: { n: 'Toe-Touch-Progression', t: 'mob', dose: '2× 10', m: ['hamstrings', 'erector', 'calves'],
    how: ['Zehen auf eine Erhöhung (z. B. Buch), Block/Ball zwischen die Knie.', 'Ball drücken, Rücken rund nach unten zu den Zehen.', 'Hüfte nach hinten schieben, Gewicht auf den Fersen.', 'Wiederholen mit Fersen auf der Erhöhung.'],
    err: 'Langsam und kontrolliert, nicht wippen.' },
  calf_stretch: { n: 'Wadendehnung (gestreckt + gebeugt)', t: 'mob', dose: '2× 45 s je Variante/Seite', m: ['calves', 'ankle'],
    how: ['Schrittstellung vor der Wand, hinteres Bein gestreckt, Ferse am Boden.', 'Hüfte nach vorn schieben, bis die Wade zieht (Gastrocnemius).', 'Dann hinteres Knie beugen, Ferse bleibt unten (Soleus).'],
    err: 'Fuß zeigt gerade nach vorn, Gewölbe nicht einsinken lassen.' },
  ankle_mob: { n: 'Knie-zur-Wand-Mobilisation', t: 'mob', dose: '2× 15 je Seite', m: ['ankle', 'calves'],
    how: ['Halbkniestand vor der Wand, vorderer Fuß eine Handbreit entfernt.', 'Knie über den 2.–3. Zeh zur Wand schieben, Ferse bleibt unten.', 'Rhythmisch vor und zurück, Abstand langsam vergrößern.'],
    err: 'Knie nicht nach innen fallen lassen.' },
  doorway_pec: { n: 'Brustdehnung im Türrahmen', t: 'mob', dose: '2× 45 s je Höhe', m: ['pec'],
    how: ['Unterarm im Türrahmen, Ellbogen auf Schulterhöhe.', 'Mit kleinem Schritt nach vorn gehen, Brust öffnen.', 'Variieren: Ellbogen höher (Pec minor) und tiefer.'],
    err: 'Schulter nicht nach vorn schieben, Bauch fest, kein Hohlkreuz.' },
  lat_stretch: { n: 'Lat-Dehnung an der Bank', t: 'mob', dose: '2× 45 s', m: ['lats', 'shoulder'],
    how: ['Kniestand vor Bank/Stuhl, Ellbogen auf die Kante, Hände zusammen.', 'Gesäß nach hinten schieben, Brust zum Boden sinken lassen.', 'Ruhig in den Rücken atmen.'],
    err: 'Rippen nicht nach vorn schieben – leicht rund bleiben.' },
  neck_stretch: { n: 'Nacken-Dehnung (Trapezius/Levator)', t: 'mob', dose: '2× 30 s je Seite', m: ['trap_upper', 'levator', 'scm'],
    how: ['Aufrecht sitzen, eine Hand unter das Gesäß klemmen (Schulter unten).', 'Trapezius: Ohr zur Gegenschulter neigen.', 'Levator: Nase Richtung Gegen-Achsel drehen und nicken.', 'Andere Hand legt sich nur locker auf den Kopf.'],
    err: 'Nicht ziehen – das Gewicht der Hand reicht.' },
  side_stretch: { n: 'Seitliche Rumpfdehnung', t: 'mob', dose: '2× 30–45 s je Seite', m: ['ql', 'obliques', 'lats'],
    how: ['Stand, Beine überkreuzt (gedehnte Seite hinten).', 'Arm der gedehnten Seite über den Kopf.', 'Hüfte zur Seite schieben, Oberkörper zur Gegenseite neigen.'],
    err: 'Nicht nach vorn kippen – in einer Ebene bleiben.' },
  foam_tfl: { n: 'Faszienrolle Quads/TFL', t: 'mob', dose: '60–90 s je Seite', m: ['tfl', 'quads'],
    how: ['Bauchlage, Rolle unter dem Oberschenkel.', 'Langsam von Hüfte bis kurz über das Knie rollen.', 'Für den TFL leicht zur Seite drehen (vorn-außen an der Hüfte).', 'Auf druckempfindlichen Stellen 20–30 s verweilen.'],
    err: 'Nicht direkt auf dem IT-Band schrubben – vorn/hinten davon arbeiten.' },
  cross_body: { n: 'Cross-Body-Dehnung', t: 'mob', dose: '2× 30 s je Seite', m: ['cuff', 'deltoid', 'shoulder'],
    how: ['Seitlich auf die zu dehnende Schulter legen oder stehen.', 'Arm quer vor die Brust ziehen.', 'Schulterblatt mit der Wand/dem Boden fixieren.'],
    err: 'Schulter nicht zum Ohr ziehen.' },
  dead_hang: { n: 'Passives Hängen', t: 'mob', dose: '3× 20–40 s', m: ['lats', 'shoulder', 'forearm'],
    how: ['An einer Stange hängen, Füße ggf. am Boden zur Entlastung.', 'Schultern locker nach oben gleiten lassen.', 'Ruhig atmen.'],
    err: 'Bei Schulterschmerz Füße am Boden lassen und Gewicht dosieren.' },
  wrist_mob: { n: 'Handgelenk-Mobilisation', t: 'mob', dose: '2× 10 je Richtung', m: ['wrist', 'forearm'],
    how: ['Vierfüßlerstand, Handflächen am Boden.', 'Langsam vor/zurück und im Kreis über die Hände verlagern.', 'Dann Handrücken auf den Boden, sanft dehnen.'],
    err: 'Schmerzfrei bleiben, Gewicht dosieren.' },

  // Aktivieren
  breathing_9090: { n: '90/90-Atmung', t: 'akt', dose: '5 Atemzüge × 3', m: ['diaphragm', 'tva'],
    how: ['Rückenlage, Füße an der Wand, Hüfte und Knie 90°.', 'Fersen leicht in die Wand drücken, Becken minimal einrollen.', 'Durch die Nase 360° in Bauch und Flanken atmen.', 'Lang ausatmen, Rippen sinken nach unten.'],
    err: 'Schultern und Nacken bleiben ruhig.' },
  chin_tuck: { n: 'Chin Tucks', t: 'akt', dose: '3× 10 × 5 s halten', m: ['dnf'],
    how: ['Rückenlage oder aufrecht an der Wand.', 'Kinn waagerecht nach hinten schieben („Doppelkinn“).', 'Hinterkopf wird lang, 5 s halten.', 'Steigerung: in Rückenlage Kopf 1 cm abheben.'],
    err: 'Nicht nicken – horizontal schieben. Kein Druck im Hals.' },
  dead_bug: { n: 'Dead Bug', t: 'akt', dose: '3× 6–8 je Seite', m: ['tva', 'abs', 'lws'],
    how: ['Rückenlage, Arme nach oben, Hüfte und Knie 90°.', 'LWS sanft in den Boden drücken.', 'Gegenarm und -bein langsam strecken, ausatmen.', 'Zurück und Seite wechseln.'],
    err: 'Rücken darf nicht abheben – lieber kleinerer Bewegungsumfang.' },
  bird_dog: { n: 'Bird Dog', t: 'akt', dose: '3× 6–8 je Seite (5 s halten)', m: ['multifidus', 'erector', 'glute_max', 'lws'],
    how: ['Vierfüßlerstand, Rücken neutral.', 'Gegenarm und -bein lang strecken, als würdest du in beide Richtungen gezogen.', '5 s halten, kontrolliert zurück.'],
    err: 'Becken bleibt waagerecht – stell dir ein Glas Wasser auf dem Rücken vor.' },
  glute_bridge: { n: 'Glute Bridge', t: 'akt', dose: '3× 12 (2 s halten)', m: ['glute_max', 'hamstrings'],
    how: ['Rückenlage, Füße hüftbreit nah am Gesäß.', 'Becken leicht einrollen, Gesäß anspannen.', 'Hüfte heben bis Knie–Hüfte–Schulter eine Linie bilden.', 'Oben 2 s fest anspannen.'],
    err: 'Spürst du es nur hinten im Oberschenkel? Füße näher ans Gesäß, Fußspitzen anheben.' },
  clamshell: { n: 'Clamshell (Muschel)', t: 'akt', dose: '3× 15 je Seite', m: ['glute_med', 'piriformis'],
    how: ['Seitlage, Hüfte 45°, Knie 90° gebeugt, Füße aufeinander.', 'Becken leicht nach vorn kippen.', 'Oberes Knie öffnen, ohne das Becken nach hinten zu drehen.', 'Mit Miniband steigern.'],
    err: 'Becken bleibt stehen – kleine, saubere Bewegung.' },
  wall_slide: { n: 'Wall Slides', t: 'akt', dose: '3× 10', m: ['trap_low', 'serratus', 'scap'],
    how: ['Unterarme an die Wand, Ellbogen auf Schulterhöhe.', 'Unterarme leicht in die Wand drücken.', 'Arme nach oben gleiten lassen, Schulterblätter drehen mit.', 'Oben kurz von der Wand lösen, zurück.'],
    err: 'Schultern nicht zu den Ohren ziehen, kein Hohlkreuz.' },
  scap_pushup: { n: 'Scapula Push-ups', t: 'akt', dose: '3× 12', m: ['serratus', 'scap'],
    how: ['Liegestützposition (oder Knie/Wand).', 'Arme bleiben gestreckt.', 'Schulterblätter zusammenfallen lassen, dann aktiv auseinander drücken.', 'Oben kurz halten.'],
    err: 'Nur die Schulterblätter bewegen, Ellbogen bleiben gestreckt.' },
  band_pull_apart: { n: 'Band Pull-Apart', t: 'akt', dose: '3× 15', m: ['rhomboids', 'trap_low', 'deltoid'],
    how: ['Band schulterbreit vor der Brust, Arme gestreckt.', 'Band auseinanderziehen bis zur Brust, Schulterblätter zusammen.', 'Kontrolliert zurück.'],
    err: 'Schultern unten, Rippen nicht nach vorn schieben.' },
  prone_ytw: { n: 'Prone Y-T-W', t: 'akt', dose: '2× 8 je Buchstabe', m: ['trap_low', 'rhomboids', 'cuff'],
    how: ['Bauchlage, Stirn auf einem Handtuch.', 'Arme in Y-, T- und W-Form leicht abheben, Daumen zeigen nach oben.', 'Schulterblätter nach unten-innen ziehen.', '2 s halten.'],
    err: 'Nicht über den Nacken hochziehen – klein und präzise.' },
  short_foot: { n: 'Short Foot', t: 'akt', dose: '3× 10 × 5 s je Fuß', m: ['foot_int', 'foot'],
    how: ['Barfuß sitzen oder stehen.', 'Großzehenballen und Ferse annähern, ohne die Zehen zu krallen.', 'Das Längsgewölbe hebt sich, 5 s halten.'],
    err: 'Zehen bleiben lang und entspannt.' },
  tibialis_raise: { n: 'Tibialis Raises', t: 'akt', dose: '3× 15–20', m: ['tibialis', 'ankle'],
    how: ['Rücken an die Wand lehnen, Füße eine Fußlänge davor.', 'Fußspitzen so weit wie möglich hochziehen.', 'Langsam absenken.'],
    err: 'Langsam ablassen, Gesäß bleibt an der Wand.' },
  mcgill_curl: { n: 'McGill Curl-up', t: 'akt', dose: '3× 6 × 8 s halten', m: ['abs', 'tva'],
    how: ['Rückenlage, ein Bein gestreckt, eines aufgestellt.', 'Hände unter die LWS (Hohlraum erhalten).', 'Kopf und Schultern minimal abheben – Nacken bleibt steif.', '8 s halten, Bauch fest, weiter atmen.'],
    err: 'Kein Aufrollen, kein Kinn zur Brust – es ist ein Halten, kein Crunch.' },
  single_leg_balance: { n: 'Einbeinstand (mit Steigerung)', t: 'akt', dose: '3× 30 s je Seite', m: ['foot_int', 'glute_med', 'ankle', 'foot'],
    how: ['Barfuß auf einem Bein, Knie leicht gebeugt.', 'Gewölbe aktiv, Becken waagerecht.', 'Steigern: Augen zu, weicher Untergrund, Kopf drehen.'],
    err: 'Knie bleibt über dem Fuß, nicht nach innen.' },

  // Kräftigen
  side_plank: { n: 'Seitstütz', t: 'kraft', dose: '3× 20–45 s je Seite', m: ['ql', 'obliques', 'glute_med'],
    how: ['Seitlage, Ellbogen unter der Schulter.', 'Hüfte heben bis Kopf–Becken–Füße eine Linie bilden.', 'Leichter: Knie gebeugt; schwerer: oberes Bein anheben.'],
    err: 'Becken nicht nach hinten kippen oder durchhängen.' },
  pallof: { n: 'Pallof Press', t: 'kraft', dose: '3× 10 je Seite (2 s halten)', m: ['obliques', 'tva'],
    how: ['Seitlich zu einem Band/Kabel, Griff vor der Brust.', 'Arme nach vorn strecken, ohne dass der Rumpf mitdreht.', '2 s halten, zurück.'],
    err: 'Hüfte und Schultern bleiben frontal.' },
  suitcase_carry: { n: 'Suitcase Carry', t: 'kraft', dose: '3× 30–40 m je Seite', m: ['ql', 'obliques', 'forearm', 'glute_med'],
    how: ['Eine schwere Kurzhantel/Kettlebell in einer Hand.', 'Aufrecht gehen, ohne zur Seite zu kippen.', 'Seite wechseln.'],
    err: 'Schultern auf gleicher Höhe, langsam gehen.' },
  hip_thrust: { n: 'Hip Thrust', t: 'kraft', dose: '3× 8–12', m: ['glute_max', 'hamstrings'],
    how: ['Schulterblätter an eine Bank, Füße hüftbreit.', 'Gewicht/Band auf der Hüfte.', 'Kinn leicht zur Brust, Becken einrollen, Hüfte strecken.', 'Oben 1–2 s Gesäß maximal anspannen.'],
    err: 'Nicht ins Hohlkreuz strecken – Rippen bleiben unten.' },
  rdl: { n: 'Rumänisches Kreuzheben', t: 'kraft', dose: '3× 8–10', m: ['hamstrings', 'glute_max', 'erector'],
    how: ['Hüftbreiter Stand, Hantel vor den Oberschenkeln, Knie leicht gebeugt.', 'Hüfte nach hinten schieben, Hantel am Bein entlang absenken.', 'Rücken bleibt neutral, bis die Hamstrings ziehen.', 'Mit dem Gesäß nach vorn kommen.'],
    err: 'Es ist ein Hüft-Scharnier, keine Kniebeuge. Kein Rundrücken.' },
  single_leg_rdl: { n: 'Einbeiniges Kreuzheben', t: 'kraft', dose: '3× 8 je Seite', m: ['hamstrings', 'glute_med', 'glute_max', 'foot_int'],
    how: ['Einbeinstand, Standknie leicht gebeugt.', 'Oberkörper nach vorn, freies Bein streckt nach hinten (eine Linie).', 'Becken bleibt waagerecht.', 'Kontrolliert aufrichten.'],
    err: 'Hüfte des freien Beins nicht aufdrehen.' },
  back_ext: { n: 'Rückenstrecker (Hyperextension)', t: 'kraft', dose: '3× 10–15', m: ['erector', 'glute_max', 'hamstrings'],
    how: ['Im Gerät oder bäuchlings über einen Ball.', 'Oberkörper kontrolliert absenken.', 'Bis zur geraden Linie aufrichten – nicht weiter.'],
    err: 'Nicht überstrecken; Gesäß anspannen.' },
  nordic: { n: 'Nordic Hamstring Curl', t: 'kraft', dose: '3× 4–6 (exzentrisch)', m: ['hamstrings'],
    how: ['Kniestand, Fersen fixiert (Partner, Sofa).', 'Körper gerade, langsam nach vorn sinken lassen.', 'So lange wie möglich bremsen, mit den Händen abfangen.', 'Mit Händen zurückdrücken.'],
    err: 'Hüfte bleibt gestreckt, nicht abknicken. Langsam steigern – Muskelkater!' },
  split_squat: { n: 'Bulgarian Split Squat', t: 'kraft', dose: '3× 8 je Seite', m: ['quads', 'glute_max', 'adductors', 'iliopsoas'],
    how: ['Hinterer Fuß auf einer Bank, vorderer Fuß weit genug vorn.', 'Senkrecht nach unten sinken, bis das hintere Knie fast den Boden berührt.', 'Über die ganze vordere Fußsohle hochdrücken.'],
    err: 'Vorderes Knie in Linie mit dem Fuß, nicht nach innen.' },
  step_down: { n: 'Step-Down (exzentrisch)', t: 'kraft', dose: '3× 10 je Seite', m: ['quads', 'glute_med', 'knee'],
    how: ['Seitlich auf eine Stufe stellen.', 'Freies Bein langsam (3 s) nach unten tippen.', 'Hüfte nach hinten, Knie über dem 2. Zeh.'],
    err: 'Becken bleibt waagerecht, Knie fällt nicht nach innen.' },
  wall_sit: { n: 'Wandsitzen (isometrisch)', t: 'kraft', dose: '5× 30–45 s', m: ['quads', 'knee'],
    how: ['Rücken an der Wand, Knie ca. 60–90° gebeugt.', 'Gewicht auf den Fersen, Knie über den Füßen.', 'Halten, ruhig atmen.'],
    err: 'Bei Kniescheibenschmerz weniger tief – schmerzarm bleiben (max. 3/10).' },
  goblet_squat: { n: 'Goblet Squat', t: 'kraft', dose: '3× 10', m: ['quads', 'glute_max', 'adductors'],
    how: ['Kettlebell/Hantel vor der Brust.', 'Hüftbreit bis etwas breiter, Zehen leicht außen.', 'Zwischen die Fersen sinken, Brust aufrecht, Knie nach außen.', 'Kraftvoll hochdrücken.'],
    err: 'Fersen bleiben am Boden, Knie folgt den Zehen.' },
  side_hip_abd: { n: 'Seitliches Beinheben', t: 'kraft', dose: '3× 12–15 je Seite', m: ['glute_med'],
    how: ['Seitlage, unteres Bein gebeugt, oberes gestreckt.', 'Oberes Bein leicht nach hinten und Fußspitze leicht nach unten.', 'Bein heben, 1 s halten, langsam senken.'],
    err: 'Nicht nach vorn kippen – sonst arbeitet der TFL statt des Gesäßes.' },
  copenhagen: { n: 'Copenhagen Plank', t: 'kraft', dose: '3× 15–30 s je Seite', m: ['adductors', 'obliques'],
    how: ['Seitstütz, oberes Bein (Knie oder Fuß) auf einer Bank.', 'Unteres Bein frei oder am Boden.', 'Hüfte heben, Linie halten.'],
    err: 'Start mit Knie auf der Bank – das ist deutlich leichter.' },
  row: { n: 'Rudern (Kabel/Band/Hantel)', t: 'kraft', dose: '3× 10–12', m: ['rhomboids', 'lats', 'trap_low', 'biceps'],
    how: ['Aufrecht, Brust raus, Arme gestreckt.', 'Erst Schulterblätter zurück, dann Ellbogen nah am Körper nach hinten.', 'Kurz halten, langsam zurück.'],
    err: 'Schultern bleiben unten, nicht mit dem Oberkörper schwingen.' },
  face_pull: { n: 'Face Pulls', t: 'kraft', dose: '3× 12–15', m: ['cuff', 'deltoid', 'trap_low', 'rhomboids'],
    how: ['Band/Kabel auf Kopfhöhe, Seilgriff von oben.', 'Zum Gesicht ziehen, Ellbogen hoch und außen.', 'Am Ende Hände nach hinten drehen (Außenrotation).'],
    err: 'Kein Hohlkreuz, Bewegung aus den Schultern.' },
  ext_rot: { n: 'Außenrotation mit Band', t: 'kraft', dose: '3× 15 je Seite', m: ['cuff'],
    how: ['Ellbogen 90° am Körper (Handtuch einklemmen).', 'Band nach außen drehen, Ellbogen bleibt am Körper.', 'Langsam zurück.'],
    err: 'Kein Ausweichen über den Rumpf, leichtes Band.' },
  pushup_plus: { n: 'Liegestütz Plus', t: 'kraft', dose: '3× 8–12', m: ['pec', 'serratus', 'triceps'],
    how: ['Normaler Liegestütz (Knie oder Bank als Erleichterung).', 'Oben angekommen zusätzlich Schulterblätter auseinander drücken („Plus“).', 'Ellbogen ca. 45° zum Körper.'],
    err: 'Körperspannung halten, kein Durchhängen.' },
  pulldown: { n: 'Latzug / Klimmzug', t: 'kraft', dose: '3× 8–10', m: ['lats', 'biceps'],
    how: ['Schulterbreit greifen.', 'Schulterblätter zuerst nach unten ziehen.', 'Stange zur oberen Brust ziehen, Ellbogen Richtung Hosentasche.'],
    err: 'Nicht in den Nacken ziehen, kein Schwung.' },
  calf_raise: { n: 'Wadenheben (langsam)', t: 'kraft', dose: '3× 12–15 gestreckt + gebeugt', m: ['calves', 'ankle'],
    how: ['Vorfuß auf einer Stufe.', 'Hoch auf die Zehenspitzen (1 s), 3 s langsam tief absenken.', 'Variante mit gebeugtem Knie für den Soleus.', 'Steigern: einbeinig, Zusatzgewicht.'],
    err: 'Druck über den Großzehenballen, nicht nach außen kippen.' }
};

// ── SELBSTTESTS ────────────────────────────────────────────────────────────
// s: 0 gut · 1 ausbaufähig · 2 Defizit · f: Muskel-/Gelenk-Flags
const T = {
  sorensen: { n: 'Biering-Sørensen-Test', g: 'Rumpf & Rücken', what: 'Ausdauer der Rückenstrecker', m: ['erector', 'multifidus', 'glute_max'],
    how: ['Bauchlage auf Bank/Bett, Oberkörper ab Beckenkamm frei in der Luft.', 'Beine fixieren (Partner/Gurt).', 'Arme vor der Brust verschränken, Oberkörper waagerecht halten.', 'Zeit stoppen bis du absinkst.'],
    opts: [{ l: '≥ 90 Sekunden', s: 0 }, { l: '45–90 Sekunden', s: 1, f: { erector: 'weak' } }, { l: '< 45 Sekunden', s: 2, f: { erector: 'weak', multifidus: 'weak' } }] },
  flexor_end: { n: 'Rumpfbeuger-Ausdauer (McGill)', g: 'Rumpf & Rücken', what: 'Ausdauer der Bauchmuskulatur', m: ['abs', 'tva'],
    how: ['Sitzend, Knie gebeugt, Füße fixiert.', 'Oberkörper im 60°-Winkel an eine Stütze lehnen, Arme vor der Brust.', 'Stütze 10 cm zurückziehen – Position halten.', 'Zeit stoppen bis du nach hinten sinkst.'],
    opts: [{ l: '≥ 90 Sekunden', s: 0 }, { l: '45–90 Sekunden', s: 1, f: { abs: 'weak' } }, { l: '< 45 Sekunden', s: 2, f: { abs: 'weak', tva: 'weak' } }] },
  side_plank_t: { n: 'Seitstütz halten', g: 'Rumpf & Rücken', what: 'Seitliche Rumpfstabilität', m: ['ql', 'obliques', 'glute_med'],
    how: ['Seitstütz auf dem Unterarm, Beine gestreckt.', 'Körper in einer Linie halten.', 'Beide Seiten testen, schlechteren Wert werten.'],
    opts: [{ l: '≥ 60 s, beide Seiten ähnlich', s: 0 }, { l: '30–60 s oder deutlicher Seitenunterschied', s: 1, f: { obliques: 'weak', ql: 'weak' } }, { l: '< 30 Sekunden', s: 2, f: { obliques: 'weak', ql: 'weak', glute_med: 'weak' } }] },
  thomas: { n: 'Thomas-Test', g: 'Hüfte & Gesäß', what: 'Länge von Hüftbeuger und Rectus femoris', m: ['iliopsoas', 'quads'],
    how: ['Ans Ende eines Tisches/Betts setzen.', 'Ein Knie fest zur Brust ziehen und nach hinten abrollen.', 'Anderes Bein locker hängen lassen.', 'Liegt der Oberschenkel auf? Hängt der Unterschenkel senkrecht?'],
    opts: [{ l: 'Oberschenkel liegt auf, Unterschenkel hängt senkrecht', s: 0 }, { l: 'Oberschenkel liegt auf, Knie streckt sich nach vorn', s: 1, f: { quads: 'tight' } }, { l: 'Oberschenkel hebt ab', s: 2, f: { iliopsoas: 'tight' } }, { l: 'Oberschenkel hebt ab und Knie streckt sich', s: 2, f: { iliopsoas: 'tight', quads: 'tight' } }] },
  hip_ir: { n: 'Hüft-Innenrotation', g: 'Hüfte & Gesäß', what: 'Rotationsbeweglichkeit des Hüftgelenks', m: ['hip', 'piriformis', 'glute_max'],
    how: ['Auf einer hohen Kante sitzen, Knie 90°, Oberschenkel parallel.', 'Unterschenkel nach außen schwingen lassen (= Innenrotation der Hüfte).', 'Oberschenkel bleibt ruhig, Becken bleibt flach.', 'Winkel schätzen (45° = halber rechter Winkel).'],
    opts: [{ l: '≥ 35°', s: 0 }, { l: '20–35°', s: 1, f: { hip: 'tight', piriformis: 'tight' } }, { l: '< 20° oder Leistenschmerz', s: 2, f: { hip: 'tight', piriformis: 'tight', glute_max: 'tight' } }] },
  glute_bridge_sl: { n: 'Einbeinige Brücke', g: 'Hüfte & Gesäß', what: 'Kraft und Ansteuerung des Gesäßes', m: ['glute_max', 'hamstrings', 'glute_med'],
    how: ['Rückenlage, ein Fuß aufgestellt, anderes Knie zur Brust ziehen.', 'Hüfte heben und 30 s halten.', 'Wo spürst du es? Bleibt das Becken waagerecht?'],
    opts: [{ l: '30 s sauber, Gesäß brennt, Becken stabil', s: 0 }, { l: 'Spüre es vor allem hinten im Oberschenkel / Krampf', s: 1, f: { glute_max: 'weak', hamstrings: 'tight' } }, { l: 'Becken kippt ab oder < 15 s', s: 2, f: { glute_max: 'weak', glute_med: 'weak' } }] },
  deep_squat_t: { n: 'Tiefe Hocke', g: 'Hüfte & Gesäß', what: 'Gesamtbeweglichkeit Sprunggelenk, Hüfte, BWS', m: ['ankle', 'hip', 'calves', 'adductors', 'bws'],
    how: ['Füße schulterbreit, Arme gestreckt nach vorn.', 'So tief wie möglich in die Hocke.', 'Bleiben die Fersen unten? Bleibt der Rücken aufrecht?'],
    opts: [{ l: 'Tief, Fersen unten, Rücken aufrecht', s: 0 }, { l: 'Tief, aber Rücken rundet stark oder Knie fallen nach innen', s: 1, f: { hip: 'tight', adductors: 'tight' } }, { l: 'Fersen heben ab / kippe nach hinten', s: 2, f: { ankle: 'tight', calves: 'tight', hip: 'tight' } }] },
  aslr: { n: 'Aktives Beinheben (ASLR)', g: 'Hintere Kette', what: 'Hamstring-Länge + aktive Hüftbeugung bei stabilem Becken', m: ['hamstrings', 'iliopsoas', 'tva'],
    how: ['Rückenlage, beide Beine gestreckt, Fußspitzen hoch.', 'Ein Bein gestreckt so hoch wie möglich heben – das andere bleibt am Boden.', 'Winkel schätzen: 90° = senkrecht.'],
    opts: [{ l: '≥ 70° (Knöchel über Mitte Oberschenkel)', s: 0 }, { l: '50–70° (Knöchel auf Kniehöhe)', s: 1, f: { hamstrings: 'tight' } }, { l: '< 50° oder anderes Bein hebt ab', s: 2, f: { hamstrings: 'tight', iliopsoas: 'tight', tva: 'weak' } }] },
  toe_touch: { n: 'Stehende Rumpfbeuge', g: 'Hintere Kette', what: 'Beweglichkeit der gesamten hinteren Kette', m: ['hamstrings', 'erector', 'calves'],
    how: ['Füße geschlossen, Knie gestreckt.', 'Langsam nach vorn beugen, Arme hängen lassen.', 'Wie weit kommen die Hände?'],
    opts: [{ l: 'Handflächen oder Fingerspitzen am Boden', s: 0 }, { l: 'Bis zum Schienbein / Knöchel', s: 1, f: { hamstrings: 'tight' } }, { l: 'Nur bis Knie oder darüber', s: 2, f: { hamstrings: 'tight', calves: 'tight', erector: 'tight' } }] },
  knee_to_wall: { n: 'Knie-zur-Wand-Test', g: 'Knie & Fuß', what: 'Dorsalflexion des Sprunggelenks', m: ['ankle', 'calves'],
    how: ['Barfuß vor die Wand, Fuß gerade.', 'Knie zur Wand schieben, Ferse bleibt am Boden.', 'Fuß so weit zurücksetzen, wie es gerade noch geht.', 'Abstand Großzeh–Wand messen, schlechtere Seite werten.'],
    opts: [{ l: '≥ 10 cm', s: 0 }, { l: '5–10 cm', s: 1, f: { ankle: 'tight', calves: 'tight' } }, { l: '< 5 cm', s: 2, f: { ankle: 'tight', calves: 'tight' } }] },
  sl_squat: { n: 'Einbeinige Kniebeuge', g: 'Knie & Fuß', what: 'Beinachse & Hüftkontrolle', m: ['glute_med', 'foot_int', 'knee', 'quads'],
    how: ['Vor einem Spiegel auf ein Bein stellen.', 'Langsam ca. 45–60° in die Knie gehen, 5 Wiederholungen.', 'Bleibt das Knie über dem Fuß? Bleibt das Becken gerade?'],
    opts: [{ l: 'Knie bleibt über dem Fuß, Becken gerade', s: 0 }, { l: 'Knie wandert leicht nach innen', s: 1, f: { glute_med: 'weak' } }, { l: 'Knie fällt deutlich nach innen / Becken kippt / Fuß knickt ein', s: 2, f: { glute_med: 'weak', foot_int: 'weak', tfl: 'tight' } }] },
  sl_stance: { n: 'Einbeinstand Augen zu', g: 'Knie & Fuß', what: 'Gleichgewicht & Fußstabilität', m: ['foot_int', 'glute_med', 'foot', 'ankle'],
    how: ['Barfuß auf ein Bein stellen, Hände in die Hüfte.', 'Augen schließen, Zeit stoppen.', 'Ende: Fuß setzt ab, Hände lösen sich oder Standfuß verrutscht.'],
    opts: [{ l: '≥ 20 Sekunden', s: 0 }, { l: '10–20 Sekunden', s: 1, f: { foot_int: 'weak' } }, { l: '< 10 Sekunden', s: 2, f: { foot_int: 'weak', glute_med: 'weak' } }] },
  thor_rot: { n: 'BWS-Rotation im Sitzen', g: 'Schulter & Nacken', what: 'Drehfähigkeit der Brustwirbelsäule', m: ['bws', 'obliques'],
    how: ['Auf einem Stuhl sitzen, Ball/Kissen zwischen den Knien.', 'Stab oder Besenstiel vorn an die Brust legen.', 'So weit wie möglich drehen – Becken bleibt still.', 'Winkel zur Ausgangsposition schätzen.'],
    opts: [{ l: '≥ 45° je Seite', s: 0 }, { l: '30–45° oder Seitenunterschied', s: 1, f: { bws: 'tight' } }, { l: '< 30°', s: 2, f: { bws: 'tight', obliques: 'tight' } }] },
  wall_angel: { n: 'Arme an der Wand heben', g: 'Schulter & Nacken', what: 'Überkopf-Beweglichkeit & Schulterblattkontrolle', m: ['lats', 'pec', 'trap_low', 'bws', 'shoulder'],
    how: ['Rücken an die Wand, Füße eine Fußlänge davor.', 'LWS leicht an die Wand drücken (kein Hohlkreuz).', 'Gestreckte Arme vor dem Körper nach oben führen.', 'Erreichen die Daumen die Wand ohne Hohlkreuz?'],
    opts: [{ l: 'Daumen an der Wand, Rücken bleibt flach', s: 0 }, { l: 'Nur mit Hohlkreuz oder gebeugten Ellbogen', s: 1, f: { lats: 'tight', bws: 'tight' } }, { l: 'Arme erreichen die Wand nicht / Schmerz', s: 2, f: { lats: 'tight', pec: 'tight', trap_low: 'weak', bws: 'tight' } }] },
  apley: { n: 'Hand-hinter-den-Rücken-Test', g: 'Schulter & Nacken', what: 'Rotationsbeweglichkeit der Schulter', m: ['cuff', 'pec', 'shoulder'],
    how: ['Eine Hand von oben über die Schulter, die andere von unten hinter den Rücken.', 'Versuchen, die Finger zu berühren.', 'Beide Seiten testen, schlechtere werten.'],
    opts: [{ l: 'Finger berühren sich oder < 1 Faust Abstand', s: 0 }, { l: '1–2 Fäuste Abstand', s: 1, f: { cuff: 'tight', shoulder: 'tight' } }, { l: '> 2 Fäuste oder Schmerz', s: 2, f: { cuff: 'tight', pec: 'tight', shoulder: 'tight' } }] },
  pec_minor: { n: 'Schulter-Boden-Abstand', g: 'Schulter & Nacken', what: 'Länge des kleinen Brustmuskels', m: ['pec', 'rhomboids'],
    how: ['Entspannt auf den Rücken legen, Arme neben dem Körper.', 'Jemand schaut seitlich: Wie hoch liegt die Schulter-Rückseite über dem Boden?'],
    opts: [{ l: 'Schulter liegt (fast) flach auf', s: 0 }, { l: 'Ca. 1–2,5 cm Abstand', s: 1, f: { pec: 'tight' } }, { l: '> 2,5 cm Abstand', s: 2, f: { pec: 'tight', rhomboids: 'weak' } }] },
  dnf_test: { n: 'Halsbeuger-Ausdauer', g: 'Schulter & Nacken', what: 'Ausdauer der tiefen Halsbeuger', m: ['dnf', 'scm'],
    how: ['Rückenlage, Knie aufgestellt.', 'Kinn einziehen (Doppelkinn) und Kopf 2–3 cm abheben.', 'Halten, bis das Kinn nach vorn rutscht oder der Kopf absinkt.'],
    opts: [{ l: '≥ 30 Sekunden', s: 0 }, { l: '15–30 Sekunden', s: 1, f: { dnf: 'weak' } }, { l: '< 15 s oder Kinn schiebt sofort nach vorn', s: 2, f: { dnf: 'weak', scm: 'tight', trap_upper: 'tight' } }] }
};

const TEST_GROUPS = ['Rumpf & Rücken', 'Hüfte & Gesäß', 'Hintere Kette', 'Knie & Fuß', 'Schulter & Nacken'];

// ── THEMEN ─────────────────────────────────────────────────────────────────
// roles: Strukturen → Rolle (pain/tight/weak/inv/mob/stab/ant)
const TOPICS = {
  lowback: {
    n: 'Unterer Rücken', ico: '🔻', grp: 'zone',
    sum: 'Der häufigste Schmerzort – aber selten die Ursache. Die LWS soll stabil sein und wird oft zum Ersatz für fehlende Bewegung in Hüfte und BWS.',
    insight: 'Der untere Rücken ist meist das Opfer, nicht der Täter.',
    roles: { lws: 'pain', isg: 'pain', erector: 'pain', ql: 'pain', iliopsoas: 'tight', hamstrings: 'tight', lats: 'tight', glute_max: 'weak', glute_med: 'weak', tva: 'weak', multifidus: 'weak', abs: 'weak', hip: 'mob', bws: 'mob' },
    chain: [
      'Viel Sitzen (Büro + Rennrad): Hüfte ist stundenlang gebeugt',
      'Hüftbeuger verkürzen, Gesäß wird „stumm“ (der Gegenspieler hemmt es)',
      'Becken kippt nach vorn → mehr Hohlkreuz; bei schwachem Rumpf rundet die LWS unter Last',
      'Steife Hüfte & BWS: Bücken und Drehen landen in der LWS',
      'Rückenstrecker & QL übernehmen die Arbeit des Gesäßes → Dauerspannung, Schmerz'
    ],
    tests: ['thomas', 'aslr', 'glute_bridge_sl', 'side_plank_t', 'sorensen', 'flexor_end', 'hip_ir', 'thor_rot'],
    ex: { mob: ['cat_cow', 'hip_flexor_stretch', 'n9090', 'open_book'], akt: ['breathing_9090', 'dead_bug', 'bird_dog', 'glute_bridge'], kraft: ['side_plank', 'hip_thrust', 'rdl', 'suitcase_carry'] },
    red: ['Taubheit/Kribbeln im Bein oder im Reithosen-Bereich', 'Probleme beim Wasserlassen oder Stuhlgang', 'Kraftverlust im Bein (Fuß/Zehen heben)', 'Nächtlicher Ruheschmerz, Fieber, ungewollter Gewichtsverlust', 'Schmerz nach Sturz oder Unfall']
  },
  hip: {
    n: 'Hüfte', ico: '🦴', grp: 'zone',
    sum: 'Die Hüfte braucht Bewegung in alle Richtungen. Fehlt sie, zahlen LWS und Knie die Rechnung.',
    insight: 'Steife Hüfte → Rücken und Knie kompensieren.',
    roles: { hip: 'pain', tfl: 'tight', iliopsoas: 'tight', adductors: 'tight', piriformis: 'tight', quads: 'tight', glute_max: 'weak', glute_med: 'weak', lws: 'stab', knee: 'stab' },
    chain: [
      'Das Hüftgelenk ist ein Kugelgelenk – gebaut für Beugen, Strecken und Rotation',
      'Am Rad nur 40–110° Beugung, keine Streckung, keine Rotation → Kapsel und Muskeln passen sich an',
      'Fehlende Streckung/Innenrotation → Becken und LWS bewegen sich stattdessen',
      'Schwacher Glute medius → TFL übernimmt → IT-Band unter Spannung, Knie dreht nach innen',
      'Ergebnis: Leisten-, seitlicher Hüft-, Knie- oder Kreuzschmerz'
    ],
    tests: ['thomas', 'hip_ir', 'deep_squat_t', 'glute_bridge_sl', 'sl_squat'],
    ex: { mob: ['hip_flexor_stretch', 'n9090', 'adductor_rockback', 'deep_squat'], akt: ['clamshell', 'glute_bridge'], kraft: ['side_hip_abd', 'split_squat', 'hip_thrust', 'copenhagen', 'single_leg_rdl'] },
    red: ['Leistenschmerz mit Hinken oder nachts', 'Plötzlicher Schmerz nach Sturz', 'Fieber mit Gelenkschmerz']
  },
  shoulder: {
    n: 'Schultern', ico: '💪', grp: 'zone',
    sum: 'Die Schulter ist das beweglichste Gelenk – und darum auf eine stabile Basis angewiesen: Schulterblatt und BWS.',
    insight: 'Schulterschmerz beginnt oft an BWS und Schulterblatt.',
    roles: { shoulder: 'pain', cuff: 'pain', deltoid: 'pain', pec: 'tight', lats: 'tight', trap_upper: 'tight', levator: 'tight', trap_low: 'weak', serratus: 'weak', rhomboids: 'weak', scap: 'stab', bws: 'mob' },
    chain: [
      'Rundrücken durch Sitzen und Lenkerhaltung (BWS steif)',
      'Schulterblatt kippt nach vorn, Brustmuskel verkürzt',
      'Unterer Trapezius & Serratus schwach → Schulterblatt dreht beim Armheben zu wenig nach oben',
      'Raum unter dem Schulterdach wird eng → Sehnen der Rotatorenmanschette werden eingeklemmt',
      'Oberer Trapezius kompensiert → zusätzlich Nackenverspannung'
    ],
    tests: ['wall_angel', 'apley', 'pec_minor', 'thor_rot'],
    ex: { mob: ['thoracic_ext', 'doorway_pec', 'lat_stretch', 'cross_body'], akt: ['wall_slide', 'scap_pushup', 'band_pull_apart'], kraft: ['face_pull', 'ext_rot', 'row', 'pushup_plus'] },
    red: ['Arm kann nach Sturz nicht mehr gehoben werden', 'Schmerz mit Ausstrahlung in den Arm + Kribbeln/Kraftverlust', 'Linksseitiger Schulter-/Armschmerz mit Brustdruck oder Atemnot → sofort Notruf']
  },
  posterior: {
    n: 'Hintere Kette', ico: '⛓️', grp: 'zone',
    sum: 'Von der Fußsohle bis zum Hinterkopf zieht eine durchgehende Muskel-Faszien-Linie. Spannung an einer Stelle wirkt entlang der ganzen Kette.',
    insight: 'Verkürzte Waden können die Rumpfbeuge genauso begrenzen wie die Hamstrings.',
    roles: { calves: 'tight', hamstrings: 'tight', erector: 'tight', glute_max: 'weak', multifidus: 'inv', lats: 'inv', trap_upper: 'inv', ankle: 'mob', hip: 'mob', lws: 'stab' },
    chain: [
      'Fußsohle → Wade → Hamstrings → Gesäß → Rückenstrecker → Nacken (oberflächliche Rückenlinie)',
      'Spannung an einer Stelle wirkt entlang der Kette – z. B. Waden begrenzen die Vorbeuge',
      'Lat und gegenüberliegendes Gesäß sind über die Rückenfaszie verbunden (hintere Schlinge)',
      'Schwaches Gesäß → Hamstrings und Rückenstrecker übernehmen Hüftstreckung → Krampf, Zerrung, Kreuzschmerz',
      'Lösung: Kette mobil halten UND das Gesäß als Motor stärken'
    ],
    tests: ['toe_touch', 'aslr', 'knee_to_wall', 'glute_bridge_sl', 'sorensen'],
    ex: { mob: ['hamstring_floss', 'toe_touch_prog', 'calf_stretch'], akt: ['glute_bridge', 'bird_dog'], kraft: ['rdl', 'nordic', 'hip_thrust', 'back_ext', 'calf_raise'] },
    red: ['Ausstrahlender Schmerz bis unter das Knie mit Kribbeln', 'Plötzlicher Stich in der Wade/Achillessehne (Riss?)']
  },
  neck: {
    n: 'Nacken & BWS', ico: '🧠', grp: 'zone',
    sum: 'Kopf vorn, Schultern rund, BWS steif: Der Nacken trägt die Last einer Haltung, die er nicht verursacht hat.',
    insight: 'Jeder Zentimeter Kopf-vorn erhöht die Last auf den Nacken deutlich.',
    roles: { hws: 'pain', trap_upper: 'tight', levator: 'tight', scm: 'tight', pec: 'tight', dnf: 'weak', trap_low: 'weak', rhomboids: 'weak', bws: 'mob' },
    chain: [
      'Kopf wandert nach vorn (Bildschirm, Handy, Lenkerhaltung)',
      'Der Hebel wächst → Nackenstrecker müssen dauerhaft halten',
      'Tiefe Halsbeuger schalten ab, SCM und Levator übernehmen',
      'Steife BWS → HWS muss zusätzlich Streckung liefern (am Rad: Kopf hoch zum Schauen)',
      'Folgen: Verspannung, Spannungskopfschmerz, Ziehen zwischen den Schulterblättern'
    ],
    tests: ['dnf_test', 'thor_rot', 'wall_angel', 'pec_minor'],
    ex: { mob: ['thoracic_ext', 'open_book', 'neck_stretch', 'doorway_pec'], akt: ['chin_tuck', 'wall_slide', 'band_pull_apart'], kraft: ['row', 'face_pull', 'prone_ytw'] },
    red: ['Taubheit oder Kraftverlust in Arm/Hand', 'Schwindel, Seh- oder Sprechstörungen', 'Neuer, heftiger Kopfschmerz („wie nie zuvor“)', 'Nach Unfall/Sturz']
  },
  knee: {
    n: 'Knie', ico: '🦵', grp: 'zone',
    sum: 'Das Knie sitzt zwischen zwei Mobilitätsgelenken. Meist entsteht der Knieschmerz durch Hüfte oder Sprunggelenk.',
    insight: 'Das Knie ist der Bote – der Absender sitzt oft in Hüfte oder Fuß.',
    roles: { knee: 'pain', quads: 'tight', tfl: 'tight', calves: 'tight', glute_med: 'weak', glute_max: 'weak', foot_int: 'weak', hip: 'mob', ankle: 'mob' },
    chain: [
      'Das Knie ist ein Scharnier – es braucht Stabilität, keine Rotation',
      'Steifes Sprunggelenk → das Knie weicht nach innen aus',
      'Schwacher Glute medius → Oberschenkel dreht ein (Knie-Valgus)',
      'Kniescheibe läuft ungünstig, IT-Band reibt → Schmerz vorn oder außen',
      'Am Rad zusätzlich: Sattelhöhe und Cleat-Stellung prüfen'
    ],
    tests: ['sl_squat', 'knee_to_wall', 'thomas', 'sl_stance'],
    ex: { mob: ['calf_stretch', 'foam_tfl', 'couch_stretch'], akt: ['clamshell', 'short_foot'], kraft: ['step_down', 'split_squat', 'wall_sit', 'side_hip_abd', 'goblet_squat'] },
    red: ['Starke Schwellung, Knie kann nicht belastet werden', 'Blockade oder „Wegknicken“ nach Verdrehtrauma', 'Rötung, Überwärmung, Fieber']
  },
  ankle: {
    n: 'Sprunggelenk & Fuß', ico: '🦶', grp: 'zone',
    sum: 'Der Fuß ist das Fundament. Ein steifes Sprunggelenk oder schwaches Gewölbe zieht sich durch die ganze Beinachse.',
    insight: 'Fehlt die Dorsalflexion, sucht sich der Körper die Bewegung woanders.',
    roles: { ankle: 'pain', foot: 'pain', calves: 'tight', tibialis: 'weak', foot_int: 'weak', glute_med: 'weak', knee: 'stab' },
    chain: [
      'Der Fuß braucht ein stabiles Gewölbe, das Sprunggelenk Beweglichkeit',
      'Für Hocke, Treppe, Laufen muss das Knie über die Zehen kommen (Dorsalflexion)',
      'Verkürzte Waden (Treten mit Spitzfuß) begrenzen diese Bewegung',
      'Kompensation: Fuß knickt ein, Knie fällt nach innen, Ferse hebt in der Hocke',
      'Folgen: Achillessehne, Plantarfaszie und Knie werden überlastet'
    ],
    tests: ['knee_to_wall', 'sl_stance', 'deep_squat_t'],
    ex: { mob: ['calf_stretch', 'ankle_mob', 'deep_squat'], akt: ['short_foot', 'tibialis_raise', 'single_leg_balance'], kraft: ['calf_raise', 'single_leg_rdl'] },
    red: ['Nach Umknicken kein Auftreten möglich', 'Plötzlicher Schlag in der Achillessehne', 'Einseitig geschwollene, warme Wade (Thrombose?)']
  },
  bike: {
    n: 'Rennrad-Profil', ico: '🚴', grp: 'zone',
    sum: 'Radfahren ist gelenkschonend, formt den Körper aber einseitig: Hüfte gebeugt, Rücken rund, Kopf überstreckt – ohne Rotation und Stoßbelastung.',
    insight: 'Je mehr du fährst, desto wichtiger wird der Ausgleich.',
    roles: { iliopsoas: 'tight', quads: 'tight', hamstrings: 'tight', calves: 'tight', pec: 'tight', trap_upper: 'tight', glute_max: 'weak', trap_low: 'weak', dnf: 'weak', tva: 'weak', obliques: 'weak', lws: 'pain', hws: 'pain', knee: 'pain', wrist: 'pain' },
    chain: [
      'Stundenlang Hüfte gebeugt – nie ganz gestreckt',
      'Quadrizeps-dominanter Tritt, das Gesäß arbeitet wenig',
      'BWS rund, HWS überstreckt, Gewicht auf Händen und Schultern',
      'Keine Rotation, kaum Seitbewegung, keine Stoßbelastung (Knochendichte!)',
      'Ausgleich: Hüftstreckung, BWS-Streckung/-Rotation, Gesäß, Rumpf, schweres Krafttraining'
    ],
    tests: ['thomas', 'thor_rot', 'glute_bridge_sl', 'dnf_test', 'toe_touch'],
    ex: { mob: ['couch_stretch', 'thoracic_ext', 'open_book', 'doorway_pec'], akt: ['glute_bridge', 'chin_tuck', 'dead_bug'], kraft: ['hip_thrust', 'rdl', 'side_plank', 'row', 'split_squat'] },
    red: ['Dauerhaft taube Finger oder Zehen', 'Taubheit im Genitalbereich (Sattel prüfen!)']
  },

  // Zusammenhänge verstehen
  jbj: {
    n: 'Joint-by-Joint-Prinzip', ico: '🔗', grp: 'concept',
    sum: 'Gelenke wechseln sich von unten nach oben ab: Eines braucht vor allem Mobilität, das nächste vor allem Stabilität.',
    insight: 'Schmerz sitzt oft im Stabilitäts-Gelenk – die Ursache im steifen Mobilitäts-Gelenk daneben.',
    legend: { mob: 'braucht Mobilität', stab: 'braucht Stabilität' },
    roles: { foot: 'stab', ankle: 'mob', knee: 'stab', hip: 'mob', lws: 'stab', isg: 'stab', bws: 'mob', scap: 'stab', shoulder: 'mob', elbow: 'stab', wrist: 'mob', hws: 'stab' },
    chain: [
      'Fuß – stabil · Sprunggelenk – mobil',
      'Knie – stabil · Hüfte – mobil',
      'LWS – stabil · BWS – mobil',
      'Schulterblatt – stabil · Schultergelenk – mobil',
      'Wird ein mobiles Gelenk steif, „leiht“ sich der Körper Bewegung vom stabilen Nachbarn → dort entsteht der Schmerz'
    ],
    examples: [['Knieschmerz', 'Hüfte oder Sprunggelenk steif?'], ['Kreuzschmerz', 'Hüfte oder BWS steif?'], ['Nacken-/Schulterschmerz', 'BWS steif?']],
    tests: ['knee_to_wall', 'hip_ir', 'thor_rot', 'apley'],
    ex: { mob: ['ankle_mob', 'n9090', 'open_book', 'cross_body'], akt: ['short_foot', 'dead_bug', 'wall_slide'], kraft: ['step_down', 'side_plank', 'row'] },
    red: []
  },
  lcs: {
    n: 'Unteres gekreuztes Syndrom', ico: '✖️', grp: 'concept',
    sum: 'Muster nach Janda: Verkürzte Hüftbeuger und Rückenstrecker kreuzen sich mit schwachem Bauch und Gesäß. Das Becken kippt nach vorn.',
    insight: 'Was verkürzt ist, hemmt seinen Gegenspieler.',
    legend: { tight: 'verkürzt/überaktiv', weak: 'schwach/gehemmt' },
    roles: { iliopsoas: 'tight', quads: 'tight', erector: 'tight', abs: 'weak', tva: 'weak', glute_max: 'weak', glute_med: 'weak', lws: 'pain' },
    chain: [
      'Vorn unten verkürzt: Hüftbeuger (+ Rectus femoris)',
      'Hinten oben verkürzt: Rückenstrecker der LWS',
      'Vorn oben schwach: Bauchmuskulatur',
      'Hinten unten schwach: Gesäß',
      'Becken kippt nach vorn → Hohlkreuz, Druck auf die LWS-Gelenke'
    ],
    tests: ['thomas', 'flexor_end', 'glute_bridge_sl', 'sorensen'],
    ex: { mob: ['hip_flexor_stretch', 'couch_stretch', 'cat_cow'], akt: ['dead_bug', 'glute_bridge'], kraft: ['hip_thrust', 'mcgill_curl'] },
    red: []
  },
  ucs: {
    n: 'Oberes gekreuztes Syndrom', ico: '✖️', grp: 'concept',
    sum: 'Muster nach Janda: Verkürzte Brust- und Nackenmuskeln kreuzen sich mit schwachen tiefen Halsbeugern und unterem Trapezius. Kopf vorn, Schultern rund.',
    insight: 'Brust dehnen allein reicht nicht – der Rücken muss die Haltung auch halten können.',
    legend: { tight: 'verkürzt/überaktiv', weak: 'schwach/gehemmt' },
    roles: { pec: 'tight', trap_upper: 'tight', levator: 'tight', scm: 'tight', dnf: 'weak', trap_low: 'weak', serratus: 'weak', rhomboids: 'weak', hws: 'pain' },
    chain: [
      'Vorn verkürzt: Brustmuskel',
      'Hinten oben verkürzt: oberer Trapezius, Schulterblattheber',
      'Vorn oben schwach: tiefe Halsbeuger',
      'Hinten unten schwach: unterer Trapezius, Serratus, Rautenmuskeln',
      'Kopf vorn, Rundrücken, Schultern nach vorn – Nacken und Schulter überlastet'
    ],
    tests: ['dnf_test', 'pec_minor', 'wall_angel'],
    ex: { mob: ['doorway_pec', 'neck_stretch', 'thoracic_ext'], akt: ['chin_tuck', 'wall_slide'], kraft: ['row', 'face_pull', 'prone_ytw'] },
    red: []
  },
  slings: {
    n: 'Muskelschlingen', ico: '🕸️', grp: 'concept',
    sum: 'Muskeln arbeiten nicht einzeln, sondern in diagonalen und seitlichen Schlingen über Faszien verbunden. So wird Kraft vom Bein in den Arm übertragen.',
    insight: 'Ein schwaches Glied in der Schlinge wird von den anderen kompensiert.',
    legend: { inv: 'Hintere Schlinge (Lat ↔ Gesäß)', ant: 'Vordere Schlinge (Bauch ↔ Adduktoren)', tight: 'Seitliche Schlinge' },
    roles: { lats: 'inv', glute_max: 'inv', erector: 'inv', obliques: 'ant', adductors: 'ant', pec: 'ant', glute_med: 'tight', tfl: 'tight', ql: 'tight' },
    chain: [
      'Hintere schräge Schlinge: Lat einer Seite ↔ Rückenfaszie ↔ Gesäß der Gegenseite (Gehen, Laufen, Ziehen)',
      'Vordere schräge Schlinge: Schräge Bauchmuskeln ↔ Adduktoren der Gegenseite (Drehen, Sprinten, Werfen)',
      'Seitliche Schlinge: Glute medius & TFL ↔ QL der Gegenseite (Einbeinstand, Becken stabil)',
      'Ist ein Glied schwach, überlasten die anderen – z. B. schwaches Gesäß → Lat/LWS verspannt'
    ],
    tests: ['side_plank_t', 'glute_bridge_sl', 'sl_squat'],
    ex: { mob: ['side_stretch', 'lat_stretch'], akt: ['bird_dog', 'clamshell'], kraft: ['single_leg_rdl', 'pallof', 'copenhagen', 'suitcase_carry'] },
    red: []
  }
};

// ── SCHMERZ-ERFASSUNG ─────────────────────────────────────────────────────
const PAIN_TYPES = ['Schmerz', 'Steifheit / Verspannung', 'Schwäche / Instabilität', 'Kribbeln / Taubheit'];
const PAIN_WHEN = ['bei Belastung', 'in Ruhe', 'morgens', 'nach langem Sitzen', 'beim / nach Radfahren', 'nachts'];

// ── KARTE ─────────────────────────────────────────────────────────────────
// Pfade für die linke Bildhälfte (x < 100), werden gespiegelt. c=true: mittig, nicht spiegeln
const SIL = 'M100,10 C90,10 83,18 83,31 C83,42 87,50 91,54 L91,62 C84,68 72,72 62,75 C53,78 48,86 47,98 C46,108 47,114 47,118 C45,132 43,146 42,158 C40,176 37,200 35,222 C32,230 29,240 30,248 C31,254 37,256 39,252 C40,246 41,238 42,228 C45,206 49,184 52,164 L54,152 C56,138 58,124 60,112 L63,108 C65,128 67,150 70,165 C68,175 65,186 64,198 C63,225 65,258 70,288 C71,298 70,306 69,316 C68,335 72,356 77,374 C76,382 72,388 73,394 C75,399 88,399 92,397 C93,390 91,383 90,376 C90,358 93,335 92,315 C91,305 90,298 91,290 C95,265 98,240 99,218 L100,217 Z';

const ARM_UP = 'M49,117 C46,130 45,143 46,152 C48,157 52,157 54,152 C56,140 58,126 59,112 C56,108 52,110 49,117 Z';
const FOREARM = 'M43,160 C40,180 37,202 36,220 L42,222 C45,204 49,184 52,163 C49,159 46,159 43,160 Z';
const DELT = 'M62,76 C53,79 48,87 47,99 C47,107 48,112 49,116 C54,110 57,102 59,95 C61,88 64,82 67,79 Z';

const SHAPES = {
  front: [
    ['trap_upper', 'M91,60 C84,66 74,71 63,75 L67,79 C77,77 86,75 93,72 Z'],
    ['scm', 'M88,50 C91,58 94,64 98,72 L94,74 C90,66 87,58 86,52 Z'],
    ['deltoid', DELT],
    ['pec', 'M67,80 C78,77 90,76 99,78 L99,113 C90,117 80,117 73,113 C66,109 62,103 59,96 C61,89 64,84 67,80 Z'],
    ['biceps', ARM_UP],
    ['forearm', FOREARM],
    ['serratus', 'M63,111 L72,115 L67,121 L72,126 L67,131 L72,136 L67,142 C65,132 64,121 63,111 Z'],
    ['obliques', 'M73,117 L87,119 C86,145 87,172 89,196 C80,192 73,184 70,172 C70,160 70,150 68,142 L73,136 L68,131 L73,126 L68,121 Z'],
    ['abs', 'M88,117 L99,117 L99,203 C95,203 92,200 90,196 C88,170 87,140 88,117 Z'],
    ['tfl', 'M65,186 C63,196 63,206 65,214 L71,213 C71,204 71,196 71,190 Z'],
    ['quads', 'M66,216 C64,238 66,262 71,284 C76,291 84,291 89,284 C91,266 91,248 89,232 C85,224 80,218 72,214 Z'],
    ['adductors', 'M85,214 C92,216 96,218 99,219 C98,240 95,260 91,280 C91,262 91,246 89,232 C88,226 87,220 85,214 Z'],
    ['tibialis', 'M72,302 C71,326 74,350 78,370 L82,369 C81,346 80,324 79,302 Z'],
    ['calves', 'M84,300 C90,316 91,336 89,352 L86,352 C85,334 83,316 82,302 Z'],
    ['foot_int', 'M77,384 C74,390 74,395 77,397 L90,397 C91,391 90,386 89,382 Z'],
    // tiefe Schicht
    ['dnf', 'M93,56 L99,56 L99,72 L95,72 Z', { deep: 1 }],
    ['diaphragm', 'M70,118 C78,110 90,106 99,106 L99,114 C90,114 80,118 72,124 Z', { deep: 1 }],
    ['tva', 'M71,160 C80,165 90,168 99,168 L99,190 C90,190 80,188 74,182 Z', { deep: 1 }],
    ['iliopsoas', 'M93,150 C90,170 86,192 84,214 L90,216 C92,195 95,172 98,152 Z', { deep: 1 }]
  ],
  back: [
    ['trap_upper', 'M92,46 L99,46 L99,84 C88,80 76,79 66,79 C63,78 62,76 63,75 C74,71 85,64 91,56 Z'],
    ['deltoid', DELT],
    ['cuff', 'M66,80 C74,88 80,100 84,112 C80,116 74,117 70,115 C64,110 60,102 59,95 C61,88 63,83 66,80 Z'],
    ['trap_low', 'M99,84 L99,152 C95,140 89,126 84,112 C80,100 74,88 66,80 C78,80 89,81 99,84 Z'],
    ['lats', 'M70,116 C74,117 80,116 84,112 C89,126 95,140 99,152 L99,176 C90,176 80,172 71,166 C69,150 67,134 65,120 Z'],
    ['erector', 'M92,118 C89,145 89,175 91,200 L99,202 L99,118 Z'],
    ['triceps', ARM_UP],
    ['forearm', FOREARM],
    ['glute_med', 'M65,186 C70,178 80,175 89,177 C88,184 84,189 78,192 C72,194 68,197 64,200 Z'],
    ['glute_max', 'M66,200 C72,194 82,189 92,190 C97,192 99,196 99,202 L99,222 C90,228 78,228 70,222 C66,216 65,208 66,200 Z'],
    ['hamstrings', 'M70,224 C66,246 67,268 72,288 L89,288 C92,268 93,248 91,228 C84,230 76,228 70,224 Z'],
    ['adductors', 'M91,228 C95,226 98,224 99,222 C98,244 95,262 91,280 C92,262 93,246 91,228 Z'],
    ['calves', 'M71,300 C66,318 68,338 74,350 C78,352 80,346 81,334 C82,346 85,352 88,350 C93,336 93,316 90,300 C84,296 77,296 71,300 Z'],
    // tiefe Schicht
    ['levator', 'M89,50 C87,60 84,70 78,80 L82,82 C88,72 91,62 93,52 Z', { deep: 1 }],
    ['rhomboids', 'M98,86 L98,122 C92,116 87,110 84,104 C83,96 82,90 82,86 Z', { deep: 1 }],
    ['ql', 'M78,164 L90,166 L91,192 L76,186 Z', { deep: 1 }],
    ['multifidus', 'M94,160 L99,160 L99,206 L94,206 Z', { deep: 1 }],
    ['piriformis', 'M72,198 L96,196 L96,202 L73,205 Z', { deep: 1 }]
  ]
};
// Dekorlinien (nicht klickbar)
const DECO = {
  front: ['M88,136 L99,136', 'M88,154 L99,154', 'M89,172 L99,172', 'M80,250 C82,262 83,274 82,284'],
  back: ['M80,300 L80,334', 'M80,352 L81,372', 'M78,232 C79,250 80,268 80,286']
};
// Gelenkpositionen (x=100 → mittig)
const JPOS = {
  front: { hws: [100, 66], shoulder: [57, 85], elbow: [47, 158], wrist: [39, 224], hip: [80, 209], knee: [80, 293], ankle: [83, 378], foot: [83, 391] },
  back: { hws: [100, 62], bws: [100, 104], lws: [100, 180], isg: [94, 207], scap: [76, 98], shoulder: [57, 85], elbow: [47, 158], knee: [80, 294], ankle: [83, 378] }
};

return { M, J, E, T, TEST_GROUPS, TOPICS, PAIN_TYPES, PAIN_WHEN, SIL, SHAPES, DECO, JPOS };
})();
