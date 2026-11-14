'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   KÖRPER-COACH · Inhalte
   Baut auf ../koerper-data.js (Muskeln, Gelenke, Themen, Selbsttests, Basis-
   Übungen) auf und ergänzt: Tier-Ranking, weitere Übungen, Dehnroutinen,
   Trainingsvorlagen, Anatomie-Details, Rad-Ratgeber.
   Allgemeines Trainingswissen – keine medizinische Diagnose.
   ═══════════════════════════════════════════════════════════════════════════ */
window.KPX = (function () {
const D = window.KPD;

/* ── Tier-Stufen ─────────────────────────────────────────────────────────── */
const TIERS = {
  S: { t: 'Pflichtprogramm', d: 'Größte Wirkung auf den Zielbereich, sicher, gut steigerbar.' },
  A: { t: 'Sehr gut', d: 'Starke Wahl – etwas spezieller oder mit mehr Aufwand.' },
  B: { t: 'Solide', d: 'Sinnvoll als Ergänzung oder in bestimmten Situationen.' },
  C: { t: 'Wenig Nutzen', d: 'Geht besser – es gibt wirksamere oder schonendere Alternativen.' },
  D: { t: 'Lieber lassen', d: 'Schlechtes Verhältnis von Nutzen zu Risiko.' }
};

/* ── Gruppen ─────────────────────────────────────────────────────────────── */
// Training (Kraft & Aktivierung)
const GROUPS = {
  glutes: { n: 'Gesäß', e: '🍑' }, post: { n: 'Hintere Kette', e: '⛓️' }, quads: { n: 'Beine vorn', e: '🦵' },
  hipstab: { n: 'Hüftstabilität', e: '🧭' }, calves: { n: 'Waden & Fuß', e: '🦶' }, core: { n: 'Rumpf', e: '🧱' },
  back: { n: 'Rücken & Zug', e: '🚣' }, chest: { n: 'Brust & Drücken', e: '💥' }, shoulder: { n: 'Schulter & Haltung', e: '🪽' },
  arms: { n: 'Arme', e: '💪' }, neck: { n: 'Nacken', e: '🧠' }
};
// Mobility (Dehnen & Mobilisieren)
const MGROUPS = {
  m_hipflex: { n: 'Hüftbeuger & Oberschenkel vorn', e: '🔥' }, m_hiprot: { n: 'Hüftrotation & Gesäß', e: '🔄' },
  m_add: { n: 'Adduktoren & Hocke', e: '🐸' }, m_post: { n: 'Hintere Kette', e: '⛓️' }, m_ankle: { n: 'Waden & Sprunggelenk', e: '🦶' },
  m_lowback: { n: 'Unterer Rücken', e: '🔻' }, m_tspine: { n: 'Brustwirbelsäule', e: '🌀' }, m_shoulder: { n: 'Schulter, Brust & Lat', e: '🪽' },
  m_neck: { n: 'Nacken', e: '🧠' }, m_wrist: { n: 'Hand & Unterarm', e: '✋' }
};

/* ── Ergänzungen zu den Basis-Übungen ────────────────────────────────────── */
// tiers: {gruppe: stufe} (erste = Hauptgruppe) · eq: Geräte ('' = keine)
// tr: Erfassung 'wr' kg×Wdh · 'r' Wdh · 't' Sekunden · 'wt' kg×Sekunden
// hold: Sekunden im Routine-Player · sides: je Seite · why: Begründung der Einstufung
const META = {
  // Mobilisieren
  cat_cow: { tiers: { m_lowback: 'A' }, eq: '', hold: 60, why: 'Sanft und schmerzarm, bewegt jedes Segment – ideales Aufwärmen. Bringt aber wenig zusätzliche Reichweite.' },
  open_book: { tiers: { m_tspine: 'S' }, eq: '', hold: 45, sides: 1, why: 'Isoliert die BWS-Rotation, während die LWS geschützt bleibt – genau die Bewegung, die im Sattel fehlt.' },
  thoracic_ext: { tiers: { m_tspine: 'S' }, eq: 'Faszienrolle', hold: 90, why: 'Direkte Gegenbewegung zur Lenker- und Schreibtischhaltung, Wirkung sofort spürbar.' },
  hip_flexor_stretch: { tiers: { m_hipflex: 'S' }, eq: '', hold: 60, sides: 1, why: 'Trifft den Iliopsoas gezielt, überall machbar und fein dosierbar. Der Schlüssel ist das aufgerichtete Becken.' },
  couch_stretch: { tiers: { m_hipflex: 'S' }, eq: 'Wand oder Sofa', hold: 60, sides: 1, why: 'Intensivste Dehnung für Rectus femoris und Hüftbeuger zusammen – für Radfahrer kaum zu ersetzen.' },
  n9090: { tiers: { m_hiprot: 'S' }, eq: '', hold: 60, sides: 1, why: 'Trainiert Innen- und Außenrotation aktiv – beides kommt am Rad nie vor. Verbessert Kontrolle, nicht nur Länge.' },
  adductor_rockback: { tiers: { m_add: 'A' }, eq: '', hold: 45, sides: 1, why: 'Dehnt die Adduktoren dynamisch bei geradem Rücken, sehr gut dosierbar.' },
  deep_squat: { tiers: { m_add: 'S', m_ankle: 'A' }, eq: '', hold: 60, why: 'Sprunggelenk, Hüfte, Adduktoren und Rücken in einer Position – die natürliche Ruhehaltung des Menschen.' },
  hamstring_floss: { tiers: { m_post: 'A' }, eq: '', hold: 45, sides: 1, why: 'Schonend, verbessert die Gleitfähigkeit von Nerv und Muskel. Bringt weniger Längengewinn als belastetes Dehnen.' },
  toe_touch_prog: { tiers: { m_post: 'A' }, eq: 'Buch oder Keil', hold: 60, why: 'Bringt dem Nervensystem bei, die Vorbeuge freizugeben – oft sofort mehr Reichweite.' },
  calf_stretch: { tiers: { m_ankle: 'A' }, eq: 'Wand', hold: 60, sides: 1, why: 'Erreicht beide Wadenmuskeln (gestreckt + gebeugt). Wirkt nur bei Regelmäßigkeit.' },
  ankle_mob: { tiers: { m_ankle: 'S' }, eq: 'Wand', hold: 45, sides: 1, why: 'Verbessert die Dorsalflexion direkt und messbar (Knie-zur-Wand-Test).' },
  doorway_pec: { tiers: { m_shoulder: 'S' }, eq: 'Türrahmen', hold: 45, sides: 1, why: 'Öffnet die Brust in mehreren Winkeln – Gegenmittel zu runden Schultern.' },
  lat_stretch: { tiers: { m_shoulder: 'A' }, eq: 'Bank oder Stuhl', hold: 60, why: 'Verlängert den Lat und streckt zugleich die BWS – macht Überkopf-Bewegungen frei.' },
  neck_stretch: { tiers: { m_neck: 'A' }, eq: '', hold: 30, sides: 1, why: 'Lindert Verspannung schnell. Dauerhaft hilft nur, die Gegenspieler zu kräftigen (Chin Tucks, Rudern).' },
  side_stretch: { tiers: { m_lowback: 'B' }, eq: '', hold: 40, sides: 1, why: 'Angenehm für QL und Flanke, aber wenig spezifisch.' },
  foam_tfl: { tiers: { m_hipflex: 'B' }, eq: 'Faszienrolle', hold: 60, sides: 1, why: 'Senkt die Spannung kurzfristig, verändert aber keine Länge – gut als Vorbereitung vor dem Dehnen.' },
  cross_body: { tiers: { m_shoulder: 'B' }, eq: '', hold: 30, sides: 1, why: 'Dehnt die hintere Schulter schonend; nötig vor allem bei eingeschränkter Innenrotation.' },
  dead_hang: { tiers: { m_shoulder: 'A' }, eq: 'Klimmzugstange', hold: 30, why: 'Entlastet Schulter und Wirbelsäule und baut nebenbei Griffkraft auf.' },
  wrist_mob: { tiers: { m_wrist: 'A' }, eq: '', hold: 60, why: 'Hält die Handgelenke belastbar – wichtig bei Lenkerdruck und Liegestütz.' },
  // Aktivieren
  breathing_9090: { tiers: { core: 'A' }, eq: 'Wand', tr: 'r', hold: 90, why: 'Grundlage für Rumpfdruck und entspannten Nacken – unspektakulär, aber oft der fehlende Baustein.' },
  chin_tuck: { tiers: { neck: 'S' }, eq: '', tr: 'r', hold: 60, why: 'Die Übung gegen die Kopf-vorn-Haltung: gezielt, überall machbar, in Studien gut belegt.' },
  dead_bug: { tiers: { core: 'S' }, eq: '', tr: 'r', hold: 75, why: 'Rumpfstabilität ohne Druck auf die LWS, perfekt dosierbar vom Einsteiger bis zum Profi.' },
  bird_dog: { tiers: { core: 'S', glutes: 'B' }, eq: '', tr: 'r', hold: 75, why: 'Teil der „McGill Big 3“: Rückenstrecker und Gesäß bei minimaler Wirbelsäulenlast.' },
  glute_bridge: { tiers: { glutes: 'A' }, eq: '', tr: 'r', hold: 60, why: 'Bester Einstieg zum Ansteuern. Wird schnell zu leicht – dann einbeinig oder Hip Thrust.' },
  clamshell: { tiers: { hipstab: 'B' }, eq: 'Miniband (optional)', tr: 'r', hold: 45, sides: 1, why: 'Gut, um den Glute medius zu spüren; der Kraftreiz ist klein – bald durch Standübungen ersetzen.' },
  wall_slide: { tiers: { shoulder: 'A' }, eq: 'Wand', tr: 'r', hold: 60, why: 'Schult die Aufwärtsdrehung des Schulterblatts – Voraussetzung für schmerzfreies Überkopf-Heben.' },
  scap_pushup: { tiers: { shoulder: 'A' }, eq: '', tr: 'r', hold: 45, why: 'Isoliert den Serratus, der das Schulterblatt am Brustkorb hält.' },
  band_pull_apart: { tiers: { shoulder: 'A' }, eq: 'Band', tr: 'r', hold: 45, why: 'Einfachstes Mittel gegen runde Schultern – täglich machbar.' },
  prone_ytw: { tiers: { shoulder: 'A' }, eq: '', tr: 'r', hold: 75, why: 'Trifft den unteren Trapezius sehr gezielt; schon ohne Gewicht fordernd.' },
  short_foot: { tiers: { calves: 'A' }, eq: '', tr: 'r', hold: 45, sides: 1, why: 'Weckt die Fußmuskeln, die in steifen Radschuhen verkümmern.' },
  tibialis_raise: { tiers: { calves: 'A' }, eq: 'Wand', tr: 'r', hold: 45, why: 'Stärkt den Gegenspieler der Wade – schützt Schienbein und Knie.' },
  mcgill_curl: { tiers: { core: 'S' }, eq: '', tr: 'r', hold: 75, why: 'Bauchspannung ohne Wirbelsäulenbeugung – „McGill Big 3“.' },
  single_leg_balance: { tiers: { calves: 'A', hipstab: 'B' }, eq: '', tr: 't', hold: 30, sides: 1, why: 'Trainiert Fuß, Sprunggelenk und Hüfte als Einheit; nebenbei beim Zähneputzen machbar.' },
  // Kräftigen
  side_plank: { tiers: { core: 'S', hipstab: 'A' }, eq: '', tr: 't', hold: 30, sides: 1, why: '„McGill Big 3“: seitliche Stabilität, QL und Glute medius – bei wenig Last auf der Wirbelsäule.' },
  pallof: { tiers: { core: 'A' }, eq: 'Band oder Kabel', tr: 'wr', why: 'Trainiert, Rotation zu verhindern – das ist die eigentliche Aufgabe der schrägen Bauchmuskeln.' },
  suitcase_carry: { tiers: { core: 'S' }, eq: 'Kurzhantel oder Kettlebell', tr: 'wt', why: 'Einseitiges Tragen fordert QL, schräge Bauchmuskeln und Griff – alltagsnah und sehr sicher.' },
  hip_thrust: { tiers: { glutes: 'S' }, eq: 'Langhantel, Bank', tr: 'wr', why: 'Höchste Gesäß-Aktivierung in voller Hüftstreckung, schwer ladbar und rückenschonend.' },
  rdl: { tiers: { post: 'S', glutes: 'S' }, eq: 'Lang- oder Kurzhantel', tr: 'wr', why: 'Belastet Hamstrings und Gesäß in gedehnter Position – stärkster Wachstums- und Beweglichkeitsreiz. Lehrt das Hüftscharnier.' },
  single_leg_rdl: { tiers: { post: 'A', hipstab: 'A' }, eq: 'Kurzhantel (optional)', tr: 'wr', why: 'Deckt Seitenunterschiede auf und trainiert die Balance gleich mit.' },
  back_ext: { tiers: { post: 'A' }, eq: 'Hyperextension-Bank oder Ball', tr: 'wr', why: 'Baut Ausdauer der Rückenstrecker auf – wichtig für lange Stunden im Sattel.' },
  nordic: { tiers: { post: 'S' }, eq: 'Fersen fixieren', tr: 'r', why: 'Stärkster exzentrischer Hamstring-Reiz; senkt das Zerrungsrisiko in Studien deutlich.' },
  split_squat: { tiers: { quads: 'S', glutes: 'S' }, eq: 'Bank, Kurzhanteln (optional)', tr: 'wr', why: 'Einbeinig, großer Bewegungsumfang – und dehnt nebenbei den Hüftbeuger des hinteren Beins. Für Radfahrer ideal.' },
  step_down: { tiers: { quads: 'A', hipstab: 'A' }, eq: 'Stufe', tr: 'r', why: 'Trainiert die Beinachse exzentrisch – erste Wahl bei Knieproblemen.' },
  wall_sit: { tiers: { quads: 'B' }, eq: 'Wand', tr: 't', hold: 40, why: 'Isometrie kann Sehnenschmerz lindern; der Kraftaufbau ist begrenzt.' },
  goblet_squat: { tiers: { quads: 'A', glutes: 'B' }, eq: 'Kettlebell oder Kurzhantel', tr: 'wr', why: 'Das Gewicht vorn hält dich aufrecht – die einfachste Art, eine saubere Kniebeuge zu lernen.' },
  side_hip_abd: { tiers: { hipstab: 'A' }, eq: '', tr: 'r', why: 'Hohe Glute-medius-Aktivierung ohne Geräte, wenn die Technik stimmt.' },
  copenhagen: { tiers: { hipstab: 'S' }, eq: 'Bank', tr: 't', hold: 20, sides: 1, why: 'Bester Adduktoren-Reiz; beugt Leistenproblemen nachweislich vor.' },
  row: { tiers: { back: 'S', shoulder: 'A' }, eq: 'Kabel, Band oder Hantel', tr: 'wr', why: 'Stärkt alles, was die Schultern zurückhält – das direkte Gegengewicht zur Lenkerhaltung.' },
  face_pull: { tiers: { shoulder: 'S' }, eq: 'Band oder Kabel', tr: 'wr', why: 'Hintere Schulter, Außenrotatoren und unterer Trapezius in einer Bewegung – der Haltungs-Allrounder.' },
  ext_rot: { tiers: { shoulder: 'A' }, eq: 'Band', tr: 'wr', why: 'Isoliert die Rotatorenmanschette – wichtig, aber kleine Gewichte und Geduld nötig.' },
  pushup_plus: { tiers: { chest: 'A', shoulder: 'B' }, eq: '', tr: 'r', why: 'Liegestütz mit eingebautem Serratus-Training; überall machbar.' },
  pulldown: { tiers: { back: 'S' }, eq: 'Latzug oder Klimmzugstange', tr: 'wr', why: 'Größter Zugmuskel in vollem Bewegungsumfang; Klimmzüge sind der Maßstab für Zugkraft.' },
  calf_raise: { tiers: { calves: 'S' }, eq: 'Stufe', tr: 'wr', why: 'Langsam und tief ausgeführt stärkt es Wade und Achillessehne – beste Vorbeugung gegen Sehnenprobleme.' }
};

/* ── Zusätzliche Übungen ─────────────────────────────────────────────────── */
const NEW = {
  // Mobility
  worlds_greatest: { n: 'World’s Greatest Stretch', t: 'mob', dose: '5 je Seite', m: ['iliopsoas', 'bws', 'adductors', 'hamstrings', 'hip'], tiers: { m_hipflex: 'S', m_tspine: 'A' }, eq: '', hold: 45, sides: 1,
    how: ['Großer Ausfallschritt, hinteres Bein gestreckt, beide Hände innen neben den vorderen Fuß.', 'Ellbogen der Innenseite Richtung Boden sinken lassen.', 'Dann den Arm zur Decke aufdrehen, Blick folgt.', 'Hüfte zurückschieben und vorderes Bein kurz strecken.'],
    err: 'Hinteres Knie gestreckt und Gesäß angespannt lassen.', why: 'Hüftbeuger, Adduktoren, Hamstrings und BWS-Rotation in einem Fluss – das beste Aufwärmen überhaupt.' },
  pigeon: { n: 'Taube', t: 'mob', dose: '2× 60 s je Seite', m: ['glute_max', 'piriformis', 'hip'], tiers: { m_hiprot: 'A' }, eq: '', hold: 60, sides: 1,
    how: ['Aus dem Vierfüßlerstand ein Knie nach vorn zur gleichseitigen Hand bringen.', 'Schienbein schräg ablegen, hinteres Bein lang nach hinten.', 'Becken gerade halten, Oberkörper langsam nach vorn senken.'],
    err: 'Zieht es im Knie statt im Gesäß: Fuß näher zur Hüfte oder auf die Liegende Vier wechseln.', why: 'Sehr wirksam für Gesäß und Außenrotatoren, aber das Knie verzeiht hier wenig.' },
  figure4: { n: 'Liegende Vier', t: 'mob', dose: '2× 45 s je Seite', m: ['piriformis', 'glute_max', 'hip'], tiers: { m_hiprot: 'A' }, eq: '', hold: 45, sides: 1,
    how: ['Rückenlage, einen Knöchel auf das andere Knie legen.', 'Durch die Lücke greifen und das untere Bein zur Brust ziehen.', 'Das Knie des oberen Beins sanft wegdrücken.'],
    err: 'Kopf und Schultern bleiben am Boden.', why: 'Knieschonende Alternative zur Taube; ideal bei tiefem Gesäßschmerz nach langem Sitzen.' },
  hip_cars: { n: 'Hüftkreise (CARs)', t: 'mob', dose: '5 langsam je Richtung/Seite', m: ['hip', 'glute_med', 'iliopsoas'], tiers: { m_hiprot: 'A' }, eq: '', hold: 45, sides: 1,
    how: ['Vierfüßlerstand oder Stand mit Halt.', 'Knie zur Brust, weit nach außen, nach hinten und zurück – der größtmögliche Kreis.', 'Rumpf bleibt absolut ruhig.'],
    err: 'Langsam – der Wert liegt in der Kontrolle am Rand des Bewegungsumfangs.', why: 'Pflegt das ganze Gelenk aktiv und zeigt, wo die Hüfte klemmt.' },
  glute_roll: { n: 'Gesäß ausrollen (Ball)', t: 'mob', dose: '60–90 s je Seite', m: ['piriformis', 'glute_max', 'glute_med'], tiers: { m_hiprot: 'B' }, eq: 'Faszien- oder Tennisball', hold: 60, sides: 1,
    how: ['Auf den Ball setzen, Fuß derselben Seite über das andere Knie legen.', 'Langsam über das Gesäß rollen.', 'Auf empfindlichen Punkten 20–30 s bleiben und atmen.'],
    err: 'Nicht direkt auf den Sitzbeinhöcker oder bei Kribbeln ins Bein.', why: 'Löst Spannung kurzfristig – gute Vorbereitung für 90/90 oder Taube.' },
  frog: { n: 'Frosch', t: 'mob', dose: '2× 60 s', m: ['adductors', 'hip'], tiers: { m_add: 'A' }, eq: 'weiche Unterlage', hold: 60,
    how: ['Vierfüßlerstand, Knie weit auseinander, Unterschenkel zeigen nach außen.', 'Auf die Unterarme, Gesäß langsam nach hinten schieben.', 'Sanft vor- und zurückwippen oder halten.'],
    err: 'Rücken neutral, kein Hohlkreuz.', why: 'Intensivste Adduktoren-Dehnung in Hüftbeugung – macht die Hocke frei.' },
  butterfly: { n: 'Schmetterling', t: 'mob', dose: '2× 45 s', m: ['adductors', 'hip'], tiers: { m_add: 'B' }, eq: '', hold: 45,
    how: ['Sitzen, Fußsohlen aneinander, Fersen Richtung Becken.', 'Aufrecht sitzen, Knie sinken lassen.', 'Mit geradem Rücken leicht nach vorn lehnen.'],
    err: 'Nicht auf die Knie drücken und nicht rund werden.', why: 'Einfach und überall machbar; weniger Wirkung als Frosch oder Rockback.' },
  cossack: { n: 'Cossack Squat', t: 'mob', dose: '2× 6 je Seite', m: ['adductors', 'hip', 'ankle', 'glute_med'], tiers: { m_add: 'A' }, eq: '', hold: 60,
    how: ['Sehr breiter Stand.', 'Gewicht auf ein Bein, tief in die seitliche Hocke, das andere Bein bleibt gestreckt (Zehen hoch).', 'Hochdrücken und zur anderen Seite wechseln.'],
    err: 'Ferse des gebeugten Beins bleibt am Boden; anfangs irgendwo festhalten.', why: 'Beweglichkeit und Kraft zugleich – Seitbewegung, die Radfahrern komplett fehlt.' },
  happy_baby: { n: 'Happy Baby', t: 'mob', dose: '2× 45 s', m: ['adductors', 'lws', 'hip'], tiers: { m_add: 'B', m_lowback: 'B' }, eq: '', hold: 45,
    how: ['Rückenlage, Knie zur Brust, Fußaußenkanten greifen.', 'Knie Richtung Achseln ziehen, Fußsohlen zeigen zur Decke.', 'Leicht hin- und herschaukeln.'],
    err: 'Steißbein bleibt möglichst am Boden.', why: 'Entspannt unteren Rücken und Leiste – gut zum Runterkommen.' },
  standing_quad: { n: 'Oberschenkeldehnung im Stand', t: 'mob', dose: '2× 30 s je Seite', m: ['quads', 'iliopsoas'], tiers: { m_hipflex: 'B' }, eq: '', hold: 30, sides: 1,
    how: ['Auf einem Bein stehen, Ferse des anderen zum Gesäß ziehen.', 'Becken aufrichten, Knie zeigt nach unten.', 'Hüfte leicht nach vorn schieben.'],
    err: 'Kein Hohlkreuz – sonst geht die Dehnung verloren.', why: 'Praktisch direkt nach der Ausfahrt; deutlich schwächer als der Couch Stretch.' },
  supine_ham: { n: 'Hamstring-Dehnung liegend', t: 'mob', dose: '2× 45 s je Seite', m: ['hamstrings', 'calves'], tiers: { m_post: 'A' }, eq: 'Band oder Handtuch', hold: 45, sides: 1,
    how: ['Rückenlage, Band um den Fuß, Bein gestreckt nach oben führen.', 'Das andere Bein bleibt lang am Boden.', 'Halten; für mehr Wirkung 5 s gegen das Band drücken, dann weiter dehnen.'],
    err: 'Becken bleibt flach am Boden.', why: 'Rücken liegt entlastet, die Dehnung landet sicher in den Hamstrings.' },
  down_dog: { n: 'Herabschauender Hund', t: 'mob', dose: '3× 30 s', m: ['calves', 'hamstrings', 'lats', 'shoulder'], tiers: { m_post: 'A', m_ankle: 'B' }, eq: '', hold: 45,
    how: ['Aus dem Vierfüßlerstand Gesäß nach oben-hinten schieben.', 'Hände drücken den Boden weg, Rücken lang.', 'Fersen abwechselnd Richtung Boden treten.'],
    err: 'Lieber Knie beugen als den Rücken runden.', why: 'Dehnt die ganze Rückenlinie von der Wade bis zum Lat.' },
  jefferson: { n: 'Jefferson Curl', t: 'mob', dose: '2× 6 sehr langsam', m: ['hamstrings', 'erector', 'multifidus'], tiers: { m_post: 'B' }, eq: 'leichtes Gewicht, Erhöhung', hold: 60,
    how: ['Auf einer Erhöhung stehen, leichtes Gewicht in den Händen.', 'Kinn zur Brust, Wirbel für Wirbel nach unten abrollen.', 'Unten kurz hängen, genauso langsam aufrollen.'],
    err: 'Nur schmerzfrei und mit sehr wenig Gewicht. Nichts bei akuten Rückenbeschwerden.', why: 'Sehr wirksam für die hintere Kette unter Last – aber nur für Fortgeschrittene mit gesundem Rücken.' },
  hurdler: { n: 'Hürdensitz', t: 'mob', dose: '–', m: ['hamstrings', 'knee'], tiers: { m_post: 'D' }, eq: '', hold: 30, sides: 1,
    how: ['Sitzen, ein Bein gestreckt, das andere nach hinten-außen abgewinkelt.', 'Zum gestreckten Bein vorbeugen.'],
    err: 'Das abgewinkelte Knie wird verdreht.', why: 'Verdreht das gebeugte Knie unter Zug. Die liegende Hamstring-Dehnung leistet dasselbe ohne Kniestress.' },
  bounce_touch: { n: 'Wippen zu den Zehen', t: 'mob', dose: '–', m: ['hamstrings', 'erector'], tiers: { m_post: 'D' }, eq: '', hold: 30,
    how: ['Im Stand mit gestreckten Knien federnd zu den Zehen wippen.'],
    err: 'Der Dehnreflex spannt den Muskel genau dann an, wenn du ihn dehnen willst.', why: 'Ruckartiges Wippen löst den Dehnreflex aus – kein Längengewinn, dafür Zerrungsrisiko.' },
  child_pose: { n: 'Kindhaltung', t: 'mob', dose: '2× 60 s', m: ['erector', 'lats', 'lws'], tiers: { m_lowback: 'A' }, eq: '', hold: 60,
    how: ['Kniestand, Gesäß auf die Fersen, Knie etwas auseinander.', 'Oberkörper ablegen, Arme lang nach vorn.', 'Tief in den unteren Rücken atmen.'],
    err: 'Bei Kniebeschwerden ein Kissen zwischen Gesäß und Fersen.', why: 'Entlastet den unteren Rücken und beruhigt – gut nach Belastung.' },
  cobra: { n: 'Sphinx / Kobra', t: 'mob', dose: '2× 45 s oder 10 langsam', m: ['abs', 'iliopsoas', 'lws'], tiers: { m_lowback: 'A', m_hipflex: 'B' }, eq: '', hold: 45,
    how: ['Bauchlage, Unterarme aufstützen (Sphinx).', 'Brust nach vorn-oben schieben, Becken bleibt am Boden.', 'Steigerung: Arme strecken (Kobra).'],
    err: 'Gesäß locker lassen. Sticht es im Kreuz: weniger hoch oder weglassen.', why: 'Gegenbewegung zum stundenlangen Rundrücken im Sattel; wird bei Bandscheibenreizung oft als lindernd empfunden.' },
  supine_twist: { n: 'Liegende Drehdehnung', t: 'mob', dose: '2× 45 s je Seite', m: ['obliques', 'ql', 'glute_max', 'lws'], tiers: { m_lowback: 'B' }, eq: '', hold: 45, sides: 1,
    how: ['Rückenlage, Arme seitlich ausgebreitet.', 'Ein Knie anziehen und zur Gegenseite sinken lassen.', 'Beide Schultern bleiben am Boden, Blick zur anderen Seite.'],
    err: 'Sanft bleiben – die Drehung kommt hier vor allem aus der LWS.', why: 'Angenehm zum Entspannen, aber wenig gezielt.' },
  thread_needle: { n: 'Nadel einfädeln', t: 'mob', dose: '2× 8 je Seite', m: ['bws', 'rhomboids', 'cuff'], tiers: { m_tspine: 'A' }, eq: '', hold: 45, sides: 1,
    how: ['Vierfüßlerstand.', 'Einen Arm unter dem Körper durchschieben, Schulter und Kopf ablegen.', 'Zurück und denselben Arm weit zur Decke aufdrehen.'],
    err: 'Hüfte bleibt über den Knien.', why: 'BWS-Rotation plus Dehnung zwischen den Schulterblättern.' },
  quad_rot: { n: 'BWS-Rotation im Vierfüßlerstand', t: 'mob', dose: '2× 8 je Seite', m: ['bws', 'obliques'], tiers: { m_tspine: 'A' }, eq: '', hold: 45, sides: 1,
    how: ['Vierfüßlerstand, Gesäß leicht Richtung Fersen (sperrt die LWS).', 'Eine Hand an den Hinterkopf.', 'Ellbogen zum Stützarm führen, dann weit zur Decke aufdrehen.'],
    err: 'Bewegung kommt aus dem Brustkorb, nicht aus dem Arm.', why: 'Aktive Rotation – baut die Beweglichkeit auf, die Open Book freilegt.' },
  seated_twist: { n: 'Drehsitz auf dem Stuhl', t: 'mob', dose: '2× 30 s je Seite', m: ['bws', 'obliques'], tiers: { m_tspine: 'B' }, eq: 'Stuhl', hold: 30, sides: 1,
    how: ['Aufrecht auf dem Stuhl sitzen, Füße fest am Boden.', 'Eine Hand an die Lehne, die andere außen ans Knie.', 'Beim Ausatmen aus dem Brustkorb weiterdrehen.'],
    err: 'Becken bleibt gerade auf dem Stuhl.', why: 'Die Büro-Variante: weniger isoliert, dafür jederzeit machbar.' },
  pass_through: { n: 'Schulter-Durchzüge mit Stab', t: 'mob', dose: '2× 10', m: ['pec', 'shoulder', 'cuff'], tiers: { m_shoulder: 'A' }, eq: 'Stab oder Band', hold: 45,
    how: ['Stab oder Band sehr breit greifen.', 'Mit gestreckten Armen über den Kopf bis hinter den Rücken führen.', 'Genauso zurück; Griff nach und nach enger.'],
    err: 'Kein Hohlkreuz, Rippen bleiben unten.', why: 'Mobilisiert die Schulter aktiv durch den ganzen Bogen.' },
  shoulder_cars: { n: 'Schulterkreise (CARs)', t: 'mob', dose: '5 je Richtung/Seite', m: ['shoulder', 'cuff', 'scap'], tiers: { m_shoulder: 'A' }, eq: '', hold: 40, sides: 1,
    how: ['Aufrecht stehen, Rumpf anspannen.', 'Gestreckten Arm nach vorn-oben führen, hinter dem Ohr die Handfläche nach außen drehen und hinten herunter.', 'Den größtmöglichen Kreis sehr langsam zeichnen.'],
    err: 'Rumpf darf nicht mitdrehen oder ins Hohlkreuz gehen.', why: 'Tägliche Gelenkpflege und Frühwarnsystem für Einschränkungen.' },
  sleeper: { n: 'Sleeper Stretch', t: 'mob', dose: '–', m: ['cuff', 'shoulder'], tiers: { m_shoulder: 'C' }, eq: '', hold: 30, sides: 1,
    how: ['Seitlage auf der Schulter, Arm 90° nach vorn, Ellbogen 90°.', 'Unterarm mit der anderen Hand Richtung Boden drücken.'],
    err: 'Kann vorn in der Schulter einklemmen.', why: 'Drückt den Oberarmkopf leicht nach vorn-oben in die enge Stelle. Die Cross-Body-Dehnung erreicht dasselbe schonender.' },
  neck_cars: { n: 'Nackenkreise (kontrolliert)', t: 'mob', dose: '3 langsam je Richtung', m: ['hws', 'scm', 'trap_upper', 'levator'], tiers: { m_neck: 'A' }, eq: '', hold: 45,
    how: ['Aufrecht sitzen, Schultern unten.', 'Kinn zur Brust, Ohr zur Schulter, Blick zur Decke, andere Schulter – ein langsamer Kreis.', 'Nur im schmerzfreien Bereich.'],
    err: 'Bei Schwindel sofort abbrechen; nicht in den Nacken „fallen“ lassen.', why: 'Hält die HWS in allen Richtungen beweglich, ohne zu ziehen.' },
  subocc: { n: 'Hinterkopf-Massage mit Ball', t: 'mob', dose: '60–90 s', m: ['hws', 'trap_upper'], tiers: { m_neck: 'B' }, eq: 'zwei Tennisbälle', hold: 75,
    how: ['Rückenlage, zwei Bälle unter den Schädelrand legen.', 'Kopf schwer werden lassen.', 'Kleine Nick- und Drehbewegungen.'],
    err: 'Druck angenehm halten.', why: 'Entspannt die kurzen Nackenmuskeln, die im Sattel dauernd arbeiten – gut gegen Spannungskopfschmerz.' },
  forearm_stretch: { n: 'Unterarm-Dehnung', t: 'mob', dose: '2× 30 s je Seite/Richtung', m: ['forearm', 'wrist'], tiers: { m_wrist: 'A' }, eq: '', hold: 40, sides: 1,
    how: ['Arm gestreckt nach vorn, Handfläche nach oben.', 'Finger mit der anderen Hand nach unten-hinten ziehen (Beuger).', 'Dann Handfläche nach unten, Handrücken heranziehen (Strecker).'],
    err: 'Ellbogen bleibt gestreckt.', why: 'Entlastet die Sehnenansätze am Ellbogen und hilft bei eingeschlafenen Händen.' },
  plantar_roll: { n: 'Fußsohle ausrollen', t: 'mob', dose: '60 s je Fuß', m: ['foot_int', 'foot', 'calves'], tiers: { m_ankle: 'B' }, eq: 'Ball', hold: 60, sides: 1,
    how: ['Im Stand einen Ball unter die Fußsohle legen.', 'Langsam von der Ferse bis zum Ballen rollen.', 'Auf festen Stellen kurz verweilen.'],
    err: 'Druck dosieren – wohltuend, nicht stechend.', why: 'Lockert die Plantarfaszie; macht oft sofort die ganze hintere Kette beweglicher.' },
  toe_sit: { n: 'Zehensitz', t: 'mob', dose: '2× 30–45 s', m: ['foot', 'foot_int'], tiers: { m_ankle: 'B' }, eq: '', hold: 40,
    how: ['Kniestand, Zehen aufstellen.', 'Gesäß langsam auf die Fersen setzen.', 'Aufrichten und atmen.'],
    err: 'Sehr intensiv – anfangs Hände am Boden lassen.', why: 'Dehnt Zehen und Fußsohle – die Großzehe braucht Streckung zum Abrollen.' },

  // Kraft & Aktivierung
  squat: { n: 'Kniebeuge', t: 'kraft', dose: '3× 5–8', m: ['quads', 'glute_max', 'adductors', 'erector'], tiers: { quads: 'S', glutes: 'A' }, eq: 'Langhantel, Rack', tr: 'wr',
    how: ['Hantel auf dem oberen Rücken, Stand etwas breiter als schulterbreit.', 'Einatmen, Rumpf fest, zwischen die Fersen absinken.', 'Mindestens bis die Oberschenkel waagerecht sind.', 'Über den ganzen Fuß hochdrücken.'],
    err: 'Knie folgen den Zehen, Fersen bleiben unten, Rücken neutral.', why: 'Die Grundübung für Beine und Rumpf, hoch ladbar. Braucht Beweglichkeit in Sprunggelenk und Hüfte.' },
  deadlift: { n: 'Kreuzheben', t: 'kraft', dose: '3× 3–6', m: ['hamstrings', 'glute_max', 'erector', 'lats', 'forearm'], tiers: { post: 'S', glutes: 'A', back: 'B' }, eq: 'Langhantel', tr: 'wr',
    how: ['Hantel über dem Mittelfuß, hüftbreiter Stand.', 'Hüfte zurück, Stange greifen, Brust raus, Lat anspannen.', 'Boden wegdrücken, Stange am Körper nach oben.', 'Oben Gesäß fest, kontrolliert ablassen.'],
    err: 'Kein Rundrücken, kein Ruck. Technik vor Gewicht.', why: 'Baut Ganzkörperspannung, Rückenstrecker und Griff wie keine andere Übung.' },
  leg_curl: { n: 'Beinbeuger (Gerät)', t: 'kraft', dose: '3× 10–12', m: ['hamstrings', 'calves'], tiers: { post: 'A' }, eq: 'Gerät', tr: 'wr',
    how: ['Polster knapp über der Ferse.', 'Fersen kontrolliert zum Gesäß ziehen.', '3 Sekunden ablassen.'],
    err: 'Hüfte bleibt auf dem Polster.', why: 'Trainiert die Kniebeuge-Funktion der Hamstrings – die decken RDL und Kreuzheben nicht ab.' },
  kb_swing: { n: 'Kettlebell Swing', t: 'kraft', dose: '4× 12–15', m: ['glute_max', 'hamstrings', 'erector'], tiers: { post: 'A', glutes: 'A' }, eq: 'Kettlebell', tr: 'wr',
    how: ['Kettlebell eine Fußlänge vor dir, Hüfte nach hinten.', 'Zwischen die Beine schwingen, dann die Hüfte explosiv strecken.', 'Arme sind nur Seile, die Kugel schwebt bis Brusthöhe.'],
    err: 'Hüftscharnier, keine Kniebeuge; oben kein Hohlkreuz.', why: 'Explosive Hüftstreckung – das Gegenprogramm zu Sattel und Bürostuhl.' },
  good_morning: { n: 'Good Morning', t: 'kraft', dose: '3× 8–10', m: ['hamstrings', 'erector', 'glute_max'], tiers: { post: 'B' }, eq: 'Langhantel oder Band', tr: 'wr',
    how: ['Hantel auf dem oberen Rücken, Knie leicht gebeugt.', 'Hüfte nach hinten schieben, Oberkörper mit geradem Rücken vorneigen.', 'Über das Gesäß aufrichten.'],
    err: 'Leicht beginnen – der lange Hebel belastet die LWS.', why: 'Ähnlich dem RDL, aber mit ungünstigerem Hebel für den Rücken.' },
  sl_hip_thrust: { n: 'Einbeiniger Hip Thrust', t: 'kraft', dose: '3× 8–12 je Seite', m: ['glute_max', 'glute_med', 'hamstrings'], tiers: { glutes: 'A' }, eq: 'Bank', tr: 'wr',
    how: ['Schulterblätter an der Bank, ein Fuß aufgestellt, das andere Knie angezogen.', 'Becken einrollen und Hüfte strecken.', 'Oben 2 s halten, Becken bleibt waagerecht.'],
    err: 'Krampft der Oberschenkel hinten: Fuß näher ans Gesäß.', why: 'Ohne Hantel fordernd und zeigt Seitenunterschiede.' },
  lunge: { n: 'Ausfallschritte gehend', t: 'kraft', dose: '3× 10 je Seite', m: ['quads', 'glute_max', 'adductors'], tiers: { quads: 'A', glutes: 'A' }, eq: 'Kurzhanteln (optional)', tr: 'wr',
    how: ['Großer Schritt nach vorn, hinteres Knie Richtung Boden.', 'Über das vordere Bein hochdrücken und direkt in den nächsten Schritt.'],
    err: 'Oberkörper aufrecht, vorderes Knie in Linie mit dem Fuß.', why: 'Einbeinige Kraft mit Hüftstreckung und Balance; lange Schritte treffen das Gesäß stärker.' },
  step_up: { n: 'Step-up', t: 'kraft', dose: '3× 8–10 je Seite', m: ['quads', 'glute_max', 'glute_med'], tiers: { quads: 'A', glutes: 'A' }, eq: 'Bank oder Kasten', tr: 'wr',
    how: ['Einen Fuß ganz auf die Erhöhung stellen.', 'Nur aus dem oberen Bein hochdrücken – nicht unten abstoßen.', 'Langsam (3 s) wieder absenken.'],
    err: 'Knie bleibt über dem Fuß, Becken waagerecht.', why: 'Sehr alltagsnah und knieschonend steigerbar.' },
  leg_press: { n: 'Beinpresse', t: 'kraft', dose: '3× 8–12', m: ['quads', 'glute_max'], tiers: { quads: 'A' }, eq: 'Gerät', tr: 'wr',
    how: ['Füße schulterbreit auf die Platte.', 'Kontrolliert tief absenken, ohne dass sich das Becken einrollt.', 'Hochdrücken, Knie nicht einrasten.'],
    err: 'Gesäß bleibt im Sitz.', why: 'Schwer ladbar ohne Rückenlast – aber ohne Rumpf- und Balance-Anteil.' },
  leg_ext: { n: 'Beinstrecker', t: 'kraft', dose: '3× 12–15', m: ['quads', 'knee'], tiers: { quads: 'B' }, eq: 'Gerät', tr: 'wr',
    how: ['Polster knapp über dem Sprunggelenk.', 'Knie strecken, oben 1 s halten.', 'Langsam ablassen.'],
    err: 'Bei Schmerz hinter der Kniescheibe den Bewegungsbereich verkleinern.', why: 'Isoliert den Quadrizeps – der ist bei Radfahrern meist schon stark. Sinnvoll in der Knie-Reha.' },
  lateral_walk: { n: 'Seitwärtsgehen mit Miniband', t: 'kraft', dose: '3× 12 Schritte je Richtung', m: ['glute_med', 'tfl'], tiers: { hipstab: 'A' }, eq: 'Miniband', tr: 'r',
    how: ['Miniband um die Füße oder Knöchel.', 'Leichte Kniebeuge, Spannung halten.', 'Kleine Seitschritte, Füße bleiben parallel.'],
    err: 'Nicht schaukeln, Knie nicht nach innen.', why: 'Glute medius im Stand – direkter Übertrag auf die Beinachse.' },
  psoas_march: { n: 'Hüftbeuger-Kräftigung (Psoas March)', t: 'kraft', dose: '3× 8 je Seite', m: ['iliopsoas', 'tva', 'abs'], tiers: { hipstab: 'A', core: 'B' }, eq: 'Miniband', tr: 'r',
    how: ['Rückenlage, Miniband um beide Füße, Hüfte und Knie 90°.', 'LWS leicht in den Boden drücken.', 'Ein Bein langsam strecken, das andere hält gegen das Band.'],
    err: 'Rücken bleibt flach am Boden.', why: 'Ein verkürzter Hüftbeuger ist oft auch schwach. Kraft in der Endposition verbessert die Kontrolle mehr als Dehnen allein.' },
  hip_abd_machine: { n: 'Abduktoren-Maschine', t: 'kraft', dose: '3× 12–15', m: ['glute_med', 'tfl'], tiers: { hipstab: 'B' }, eq: 'Gerät', tr: 'wr',
    how: ['Aufrecht oder leicht vorgeneigt sitzen.', 'Knie gegen die Polster nach außen drücken.', 'Langsam zurück.'],
    err: 'Kein Schwung.', why: 'Leicht zu steigern, aber im Sitzen ohne Stabilitätsanteil.' },
  seated_calf: { n: 'Wadenheben sitzend', t: 'kraft', dose: '3× 12–15', m: ['calves', 'ankle'], tiers: { calves: 'A' }, eq: 'Gerät oder Hantel auf den Knien', tr: 'wr',
    how: ['Sitzen, Vorfuß auf einer Erhöhung, Gewicht auf den Knien.', 'Fersen tief absenken.', 'Hoch auf die Zehen, 1 s halten.'],
    err: 'Voller Bewegungsumfang, kein Wippen.', why: 'Mit gebeugtem Knie arbeitet der Soleus – wichtig für Achillessehne und Ausdauer.' },
  pogo: { n: 'Sprünge (Pogo / Seilspringen)', t: 'kraft', dose: '3× 20–30 Kontakte', m: ['calves', 'foot_int', 'ankle'], tiers: { calves: 'A' }, eq: 'Seil (optional)', tr: 'r',
    how: ['Aufrecht stehen, kleine federnde Sprünge aus dem Sprunggelenk.', 'Knie fast gestreckt, kurze Bodenkontakte.', 'Leise landen.'],
    err: 'Langsam steigern – Sehnen brauchen Wochen zur Anpassung.', why: 'Stoßbelastung für Knochen und Sehnen – genau der Reiz, den Radfahren nicht liefert.' },
  plank: { n: 'Unterarmstütz', t: 'kraft', dose: '3× 30–60 s', m: ['abs', 'tva', 'obliques'], tiers: { core: 'B' }, eq: '', tr: 't', hold: 40,
    how: ['Unterarme unter den Schultern, Körper in einer Linie.', 'Gesäß und Bauch fest, Becken leicht einrollen.', 'Ruhig weiteratmen.'],
    err: 'Nicht durchhängen, nicht das Gesäß hochschieben.', why: 'Gute Basis, wird aber schnell zu leicht – dann lieber Ab Wheel, Dead Bug oder Tragen.' },
  ab_wheel: { n: 'Ab Wheel Rollout', t: 'kraft', dose: '3× 6–10', m: ['abs', 'tva', 'lats'], tiers: { core: 'S' }, eq: 'Ab Wheel', tr: 'r',
    how: ['Kniestand, Rad unter den Schultern, Becken einrollen.', 'Langsam nach vorn rollen, so weit der Rücken flach bleibt.', 'Mit Bauchspannung zurückziehen.'],
    err: 'Sobald das Kreuz durchhängt, ist die Wiederholung zu weit.', why: 'Sehr hoher Reiz gegen das Hohlkreuz. Nur mit sauberer Rumpfspannung – sonst zurück zum Dead Bug.' },
  hanging_raise: { n: 'Hängendes Knie-/Beinheben', t: 'kraft', dose: '3× 8–12', m: ['abs', 'iliopsoas', 'forearm'], tiers: { core: 'A' }, eq: 'Klimmzugstange', tr: 'r',
    how: ['An der Stange hängen, Schultern aktiv.', 'Becken einrollen und Knie zur Brust ziehen.', 'Langsam ablassen, nicht schwingen.'],
    err: 'Ohne Becken-Einrollen arbeitet nur der Hüftbeuger.', why: 'Bauch plus Griff und Schulter – das Einrollen des Beckens macht den Unterschied.' },
  hollow_hold: { n: 'Hollow Hold', t: 'kraft', dose: '3× 20–40 s', m: ['abs', 'tva'], tiers: { core: 'A' }, eq: '', tr: 't', hold: 30,
    how: ['Rückenlage, LWS in den Boden drücken.', 'Schultern und Beine leicht abheben, Arme nach hinten.', 'Position halten; leichter mit angezogenen Knien.'],
    err: 'Hebt der Rücken ab: Beine höher.', why: 'Lehrt die Ganzkörperspannung, die jede schwere Übung braucht.' },
  farmer_walk: { n: 'Farmer’s Walk', t: 'kraft', dose: '3× 30–40 m', m: ['forearm', 'trap_upper', 'obliques', 'glute_med'], tiers: { core: 'A' }, eq: 'zwei Kurzhanteln', tr: 'wt',
    how: ['Zwei schwere Hanteln greifen, aufrecht stehen.', 'Mit kurzen, ruhigen Schritten gehen.', 'Schultern unten und hinten.'],
    err: 'Nicht nach vorn kippen.', why: 'Griff, Rumpf und Haltung unter Last; beidseitig ist es etwas weniger fordernd für den Rumpf als einseitig.' },
  situp: { n: 'Sit-ups', t: 'kraft', dose: '–', m: ['abs', 'iliopsoas'], tiers: { core: 'C' }, eq: '', tr: 'r',
    how: ['Rückenlage, Füße fixiert, Oberkörper ganz aufrichten.'],
    err: 'Viel Zug über den Hüftbeuger an der LWS.', why: 'Trainiert vor allem den Hüftbeuger und beugt die LWS wiederholt – für Radfahrer mit kurzem Hüftbeuger die falsche Richtung.' },
  russian_twist: { n: 'Russian Twist', t: 'kraft', dose: '–', m: ['obliques', 'lws'], tiers: { core: 'C' }, eq: '', tr: 'r',
    how: ['Sitzend zurückgelehnt, Gewicht von Seite zu Seite drehen.'],
    err: 'Drehung bei gebeugter LWS.', why: 'Rotation unter Beugung ist die ungünstigste Last für die Bandscheibe. Pallof Press trainiert dieselben Muskeln sicherer.' },
  superman: { n: 'Superman', t: 'kraft', dose: '–', m: ['erector', 'glute_max'], tiers: { core: 'C' }, eq: '', tr: 'r',
    how: ['Bauchlage, Arme und Beine gleichzeitig abheben.'],
    err: 'Starke Kompression in der überstreckten LWS.', why: 'Hoher Druck auf die Lendenwirbel. Der Bird Dog bringt denselben Reiz mit einem Bruchteil der Last.' },
  bench: { n: 'Bankdrücken', t: 'kraft', dose: '3× 5–8', m: ['pec', 'triceps', 'deltoid'], tiers: { chest: 'S' }, eq: 'Lang- oder Kurzhanteln, Bank', tr: 'wr',
    how: ['Schulterblätter zusammen und nach unten, Füße fest am Boden.', 'Hantel kontrolliert zur unteren Brust senken.', 'Hochdrücken, Ellbogen etwa 45–60° zum Körper.'],
    err: 'Schultern bleiben hinten – nicht nach vorn rollen.', why: 'Hoch ladbare Grundübung fürs Drücken. Immer mit mindestens gleich viel Zugtraining ausgleichen.' },
  ohp: { n: 'Schulterdrücken', t: 'kraft', dose: '3× 6–10', m: ['deltoid', 'triceps', 'trap_upper', 'serratus'], tiers: { chest: 'A' }, eq: 'Kurzhanteln oder Langhantel', tr: 'wr',
    how: ['Aufrecht stehen, Hanteln auf Schulterhöhe.', 'Rumpf und Gesäß fest, senkrecht nach oben drücken.', 'Oben Arme neben den Ohren.'],
    err: 'Kein Hohlkreuz – fehlt die Beweglichkeit, zuerst BWS und Lat mobilisieren.', why: 'Überkopf-Kraft mit Rumpfanteil; setzt freie Schultern und BWS voraus.' },
  dips: { n: 'Dips', t: 'kraft', dose: '3× 6–10', m: ['pec', 'triceps', 'deltoid'], tiers: { chest: 'B' }, eq: 'Barren', tr: 'wr',
    how: ['Am Barren stützen, Schultern unten.', 'Leicht vorgeneigt absenken, bis die Oberarme etwa waagerecht sind.', 'Hochdrücken.'],
    err: 'Nicht tiefer als schmerzfrei möglich.', why: 'Stark für Brust und Trizeps, aber die tiefe Position stresst die vordere Schulter.' },
  db_row: { n: 'Einarmiges Kurzhantelrudern', t: 'kraft', dose: '3× 8–12 je Seite', m: ['lats', 'rhomboids', 'trap_low', 'biceps'], tiers: { back: 'A' }, eq: 'Kurzhantel, Bank', tr: 'wr',
    how: ['Eine Hand und ein Knie auf der Bank, Rücken waagerecht.', 'Hantel zur Hüfte ziehen, Ellbogen nah am Körper.', 'Unten das Schulterblatt lang werden lassen.'],
    err: 'Rumpf dreht nicht mit.', why: 'Großer Bewegungsumfang und gleicht Seitenunterschiede aus.' },
  inverted_row: { n: 'Ring- oder Tischrudern', t: 'kraft', dose: '3× 8–12', m: ['rhomboids', 'trap_low', 'lats', 'biceps'], tiers: { back: 'A', shoulder: 'B' }, eq: 'Ringe, Stange oder stabiler Tisch', tr: 'r',
    how: ['Unter die Stange hängen, Körper gestreckt.', 'Brust zur Stange ziehen, Schulterblätter zusammen.', 'Langsam ablassen.'],
    err: 'Hüfte nicht durchhängen lassen.', why: 'Rudern mit dem eigenen Körper plus Rumpfspannung – ideal für zu Hause.' },
  reverse_fly: { n: 'Reverse Fly', t: 'kraft', dose: '3× 12–15', m: ['deltoid', 'rhomboids', 'trap_low'], tiers: { shoulder: 'A' }, eq: 'Kurzhanteln oder Band', tr: 'wr',
    how: ['Vorgebeugt mit geradem Rücken, Arme hängen.', 'Arme mit leicht gebeugtem Ellbogen seitlich anheben.', 'Oben kurz halten, langsam senken.'],
    err: 'Leichte Gewichte, kein Schwung.', why: 'Isoliert die hintere Schulter – bei den meisten das schwächste Glied.' },
  lateral_raise: { n: 'Seitheben', t: 'kraft', dose: '3× 12–15', m: ['deltoid', 'trap_upper'], tiers: { shoulder: 'B' }, eq: 'Kurzhanteln', tr: 'wr',
    how: ['Hanteln seitlich, Ellbogen leicht gebeugt.', 'Bis Schulterhöhe anheben, leicht vor dem Körper.', 'Langsam senken.'],
    err: 'Schultern nicht hochziehen.', why: 'Formt die Schulter, hilft der Haltung aber kaum.' },
  shrug: { n: 'Schulterheben (Shrugs)', t: 'kraft', dose: '–', m: ['trap_upper', 'levator'], tiers: { shoulder: 'C' }, eq: 'Hanteln', tr: 'wr',
    how: ['Mit Hanteln in den Händen die Schultern zu den Ohren ziehen.'],
    err: 'Verstärkt meist vorhandene Nackenspannung.', why: 'Der obere Trapezius ist bei den meisten schon überaktiv – mehr davon verschiebt das Gleichgewicht weiter.' },
  upright_row: { n: 'Aufrechtes Rudern', t: 'kraft', dose: '–', m: ['deltoid', 'trap_upper', 'shoulder'], tiers: { shoulder: 'D' }, eq: 'Langhantel', tr: 'wr',
    how: ['Hantel eng gegriffen am Körper entlang zum Kinn ziehen.'],
    err: 'Innenrotation plus Abheben unter Last.', why: 'Bringt die Schulter genau in die Position, in der die Sehnen eingeklemmt werden. Seitheben und Face Pulls ersetzen es vollständig.' },
  behind_neck: { n: 'Latzug / Drücken hinter den Kopf', t: 'kraft', dose: '–', m: ['lats', 'shoulder', 'hws'], tiers: { back: 'D', shoulder: 'D' }, eq: 'Gerät oder Langhantel', tr: 'wr',
    how: ['Stange hinter dem Kopf in den Nacken ziehen bzw. von dort drücken.'],
    err: 'Endgradige Außenrotation unter Last, Kopf wird nach vorn geschoben.', why: 'Kein Zusatznutzen gegenüber der Variante vor dem Kopf – aber deutlich mehr Stress für Schulter und HWS.' },
  curl: { n: 'Bizeps-Curl', t: 'kraft', dose: '3× 10–12', m: ['biceps', 'forearm'], tiers: { arms: 'A' }, eq: 'Kurzhanteln oder Band', tr: 'wr',
    how: ['Ellbogen am Körper, Handflächen nach vorn.', 'Hanteln zur Schulter beugen.', 'Langsam (3 s) ablassen.'],
    err: 'Kein Schwung aus dem Rücken.', why: 'Einfach und wirksam; bei viel Zugtraining meist schon abgedeckt.' },
  pushdown: { n: 'Trizepsdrücken', t: 'kraft', dose: '3× 10–15', m: ['triceps'], tiers: { arms: 'A' }, eq: 'Kabel oder Band', tr: 'wr',
    how: ['Ellbogen am Körper fixieren.', 'Unterarme nach unten strecken.', 'Kontrolliert zurück bis 90°.'],
    err: 'Schultern bleiben hinten.', why: 'Gelenkschonend für den Trizeps – er hält dich stundenlang am Lenker.' },
  neck_iso: { n: 'Nacken-Isometrie', t: 'akt', dose: '3× 10 s je Richtung', m: ['dnf', 'scm', 'trap_upper', 'hws'], tiers: { neck: 'A' }, eq: '', tr: 'r', hold: 60,
    how: ['Aufrecht sitzen, Kinn leicht einziehen.', 'Hand an Stirn, Hinterkopf oder Schläfe legen.', 'Kopf 10 s mit etwa halber Kraft dagegen drücken – ohne Bewegung.'],
    err: 'Nicht pressen, weiteratmen.', why: 'Baut Nackenkraft in neutraler Position auf – gut gegen Ermüdung auf langen Fahrten.' }
};

/* ── Zusammenführen ──────────────────────────────────────────────────────── */
const E = {};
Object.keys(D.E).forEach(id => { E[id] = Object.assign({ id }, D.E[id], META[id] || {}); });
Object.keys(NEW).forEach(id => { E[id] = Object.assign({ id }, NEW[id]); });
Object.values(E).forEach(e => {
  if (!e.tiers) e.tiers = {};
  if (!e.tr) e.tr = e.t === 'mob' ? 't' : 'r';
  if (!e.hold) e.hold = e.t === 'mob' ? 45 : 60;
  e.grp = Object.keys(e.tiers)[0] || null;
  e.tier = e.grp ? e.tiers[e.grp] : null;
});

/* ── Dehn- und Mobility-Routinen ─────────────────────────────────────────── */
// items: [Übung, Sekunden (je Seite bei seitigen Übungen)]
const ROUTINES = [
  { id: 'r_bike', n: 'Nach dem Radfahren', e: '🚴', min: 10, d: 'Öffnet alles, was im Sattel kurz wird: Hüftbeuger, Oberschenkel, Brust, BWS.',
    items: [['couch_stretch', 60], ['hip_flexor_stretch', 45], ['figure4', 45], ['supine_ham', 40], ['calf_stretch', 40], ['thoracic_ext', 75], ['doorway_pec', 40], ['neck_stretch', 25]] },
  { id: 'r_morning', n: 'Morgen-Mobility', e: '🌅', min: 7, d: 'Einmal alle Gelenke durchbewegen – wach und geschmeidig in den Tag.',
    items: [['cat_cow', 50], ['worlds_greatest', 40], ['quad_rot', 30], ['deep_squat', 50], ['down_dog', 40], ['shoulder_cars', 25], ['neck_cars', 40]] },
  { id: 'r_hip', n: 'Hüfte öffnen', e: '🔓', min: 12, d: 'Beugung, Streckung und Rotation – für eine Hüfte, die mehr kann als treten.',
    items: [['hip_cars', 35], ['n9090', 60], ['hip_flexor_stretch', 60], ['adductor_rockback', 40], ['frog', 60], ['pigeon', 60], ['deep_squat', 60]] },
  { id: 'r_back', n: 'Unterer Rücken entlasten', e: '🔻', min: 9, d: 'Sanft bewegen, Hüfte freimachen, Rumpf anschalten. Auch an Tagen mit Beschwerden geeignet.',
    items: [['breathing_9090', 75], ['cat_cow', 50], ['child_pose', 50], ['cobra', 40], ['figure4', 40], ['hip_flexor_stretch', 45], ['open_book', 35], ['dead_bug', 60]] },
  { id: 'r_shoulder', n: 'Schulter & BWS', e: '🪽', min: 9, d: 'Brust auf, Brustwirbelsäule beweglich, Schulterblätter aktiv.',
    items: [['thoracic_ext', 75], ['open_book', 40], ['thread_needle', 35], ['doorway_pec', 45], ['lat_stretch', 50], ['pass_through', 40], ['wall_slide', 50]] },
  { id: 'r_post', n: 'Hintere Kette', e: '⛓️', min: 9, d: 'Von der Fußsohle bis zum Rücken – für eine freie Vorbeuge.',
    items: [['plantar_roll', 40], ['calf_stretch', 45], ['hamstring_floss', 40], ['supine_ham', 45], ['down_dog', 45], ['toe_touch_prog', 60], ['child_pose', 45]] },
  { id: 'r_desk', n: 'Schreibtisch-Pause', e: '💻', min: 5, d: 'Fünf Minuten im Büro, ohne Matte: Nacken, Brust, BWS, Hüfte.',
    items: [['chin_tuck', 40], ['neck_stretch', 25], ['seated_twist', 25], ['doorway_pec', 30], ['standing_quad', 25], ['shoulder_cars', 20]] },
  { id: 'r_evening', n: 'Abends runterkommen', e: '🌙', min: 9, d: 'Lange, ruhige Positionen und tiefe Atmung – bereitet auf den Schlaf vor.',
    items: [['breathing_9090', 90], ['child_pose', 60], ['figure4', 50], ['supine_twist', 45], ['happy_baby', 50], ['subocc', 60]] },
  { id: 'r_warmup', n: 'Aufwärmen vor dem Krafttraining', e: '🔥', min: 6, d: 'Beweglich machen und die wichtigsten Muskeln aufwecken.',
    items: [['cat_cow', 40], ['worlds_greatest', 35], ['deep_squat', 40], ['glute_bridge', 45], ['band_pull_apart', 35], ['dead_bug', 45]] },
  { id: 'r_ankle', n: 'Sprunggelenk & Fuß', e: '🦶', min: 7, d: 'Mehr Dorsalflexion und ein waches Fußgewölbe.',
    items: [['plantar_roll', 40], ['ankle_mob', 45], ['calf_stretch', 45], ['toe_sit', 35], ['short_foot', 35], ['tibialis_raise', 40]] },
  { id: 'r_neck', n: 'Nacken & Kopf frei', e: '🧠', min: 6, d: 'Gegen Verspannung nach Bildschirm oder langer Ausfahrt.',
    items: [['subocc', 60], ['neck_cars', 40], ['neck_stretch', 30], ['chin_tuck', 45], ['doorway_pec', 35], ['thoracic_ext', 60]] }
];

/* ── Trainingsvorlagen ───────────────────────────────────────────────────── */
// items: {x Übung, s Sätze, r Wiederholungen | sec Sekunden, rest Pause in s}
const TEMPLATES = [
  { id: 't_rad_a', n: 'Radfahrer-Kraft A', sub: 'Beine & Rumpf', e: '🦵', min: 45, d: 'Gesäß und hintere Kette aufbauen, Rumpf stabilisieren – der wichtigste Ausgleich zum Sattel.',
    items: [{ x: 'goblet_squat', s: 3, r: '8–10', rest: 90 }, { x: 'rdl', s: 3, r: '8–10', rest: 120 }, { x: 'split_squat', s: 3, r: '8 je Seite', rest: 90 }, { x: 'hip_thrust', s: 3, r: '10–12', rest: 90 }, { x: 'calf_raise', s: 3, r: '12–15', rest: 60 }, { x: 'side_plank', s: 3, sec: 30, rest: 30 }, { x: 'dead_bug', s: 3, r: '8 je Seite', rest: 45 }] },
  { id: 't_rad_b', n: 'Radfahrer-Kraft B', sub: 'Oberkörper & Haltung', e: '🪽', min: 40, d: 'Mehr Ziehen als Drücken: richtet auf, entlastet Nacken und Hände am Lenker.',
    items: [{ x: 'row', s: 3, r: '10–12', rest: 90 }, { x: 'pushup_plus', s: 3, r: '8–12', rest: 90 }, { x: 'pulldown', s: 3, r: '8–10', rest: 90 }, { x: 'face_pull', s: 3, r: '12–15', rest: 60 }, { x: 'ohp', s: 2, r: '8–10', rest: 90 }, { x: 'pallof', s: 3, r: '10 je Seite', rest: 45 }, { x: 'suitcase_carry', s: 3, sec: 40, rest: 60 }] },
  { id: 't_home', n: 'Zuhause ohne Geräte', sub: 'Ganzkörper', e: '🏠', min: 25, d: 'Nur Körpergewicht – für Reisetage oder den Einstieg.',
    items: [{ x: 'split_squat', s: 3, r: '10 je Seite', rest: 60 }, { x: 'sl_hip_thrust', s: 3, r: '10 je Seite', rest: 60 }, { x: 'pushup_plus', s: 3, r: '8–12', rest: 60 }, { x: 'prone_ytw', s: 2, r: '8 je Form', rest: 45 }, { x: 'side_plank', s: 3, sec: 30, rest: 30 }, { x: 'bird_dog', s: 3, r: '6 je Seite', rest: 30 }, { x: 'calf_raise', s: 3, r: '15', rest: 45 }] },
  { id: 't_big3', n: 'Rücken-Basis', sub: 'McGill Big 3', e: '🧱', min: 12, d: 'Drei Übungen für einen stabilen Rumpf bei minimaler Wirbelsäulenlast. Auch täglich möglich.',
    items: [{ x: 'mcgill_curl', s: 3, r: '6 × 8 s', rest: 30 }, { x: 'side_plank', s: 3, sec: 20, rest: 30 }, { x: 'bird_dog', s: 3, r: '6 je Seite', rest: 30 }, { x: 'glute_bridge', s: 2, r: '12', rest: 30 }] },
  { id: 't_glute', n: 'Gesäß & Hüftstabilität', sub: 'Beinachse', e: '🍑', min: 30, d: 'Weckt den stärksten Muskel und stabilisiert Becken und Knie.',
    items: [{ x: 'glute_bridge', s: 2, r: '12', rest: 30 }, { x: 'hip_thrust', s: 4, r: '8–12', rest: 90 }, { x: 'single_leg_rdl', s: 3, r: '8 je Seite', rest: 60 }, { x: 'lateral_walk', s: 3, r: '12 je Richtung', rest: 45 }, { x: 'copenhagen', s: 3, sec: 20, rest: 45 }, { x: 'side_hip_abd', s: 2, r: '15 je Seite', rest: 30 }] },
  { id: 't_posture', n: 'Schulter & Haltung', sub: 'mit Band, 15 min', e: '🎗️', min: 15, d: 'Kleines Programm gegen runde Schultern – passt in jede Pause.',
    items: [{ x: 'band_pull_apart', s: 3, r: '15', rest: 30 }, { x: 'face_pull', s: 3, r: '15', rest: 45 }, { x: 'ext_rot', s: 2, r: '15 je Seite', rest: 30 }, { x: 'wall_slide', s: 2, r: '10', rest: 30 }, { x: 'prone_ytw', s: 2, r: '8 je Form', rest: 30 }, { x: 'chin_tuck', s: 2, r: '10 × 5 s', rest: 30 }] },
  { id: 't_knee', n: 'Knie stabil', sub: 'Beinachse & Sehnen', e: '🦿', min: 25, d: 'Hüfte und Fuß führen das Knie – plus langsame Belastung für die Sehnen.',
    items: [{ x: 'short_foot', s: 2, r: '10 je Fuß', rest: 20 }, { x: 'step_down', s: 3, r: '10 je Seite', rest: 60 }, { x: 'split_squat', s: 3, r: '8 je Seite', rest: 90 }, { x: 'wall_sit', s: 4, sec: 40, rest: 45 }, { x: 'side_hip_abd', s: 3, r: '15 je Seite', rest: 30 }, { x: 'calf_raise', s: 3, r: '12', rest: 60 }] }
];

/* ── Anatomie im Detail: Ursprung · Ansatz · Nerv ────────────────────────── */
const ANAT = {
  scm: ['Brustbein und inneres Schlüsselbein', 'Warzenfortsatz hinter dem Ohr', 'N. accessorius (XI)'],
  dnf: ['Wirbelkörper und Querfortsätze C3–Th3', 'Obere Halswirbel und Hinterhauptbein', 'Äste des Halsgeflechts (C1–C6)'],
  trap_upper: ['Hinterhaupt und Nackenband', 'Äußeres Schlüsselbein, Schulterhöhe', 'N. accessorius (XI)'],
  levator: ['Querfortsätze C1–C4', 'Oberer innerer Schulterblattwinkel', 'N. dorsalis scapulae (C3–C5)'],
  trap_low: ['Dornfortsätze C7–Th12', 'Schulterblattgräte und Schulterhöhe', 'N. accessorius (XI)'],
  rhomboids: ['Dornfortsätze C6–Th4', 'Innerer Schulterblattrand', 'N. dorsalis scapulae (C4–C5)'],
  serratus: ['Rippen 1–9 (seitlich)', 'Innerer Schulterblattrand, Vorderseite', 'N. thoracicus longus (C5–C7)'],
  pec: ['Schlüsselbein, Brustbein, Rippenknorpel (minor: Rippen 3–5)', 'Oberarmknochen vorn (minor: Rabenschnabelfortsatz)', 'Nn. pectorales (C5–Th1)'],
  deltoid: ['Schlüsselbein, Schulterhöhe, Schulterblattgräte', 'Außenseite des Oberarms', 'N. axillaris (C5–C6)'],
  cuff: ['Vorder- und Rückfläche des Schulterblatts', 'Großer und kleiner Höcker am Oberarmkopf', 'N. suprascapularis, N. axillaris, Nn. subscapulares'],
  lats: ['Dornfortsätze Th7–L5, Rückenfaszie, Beckenkamm, untere Rippen', 'Oberarmknochen vorn', 'N. thoracodorsalis (C6–C8)'],
  biceps: ['Schulterblatt (über der Pfanne, Rabenschnabelfortsatz)', 'Speiche', 'N. musculocutaneus (C5–C6)'],
  triceps: ['Schulterblatt (unter der Pfanne), Rückseite des Oberarms', 'Ellenhaken', 'N. radialis (C6–C8)'],
  forearm: ['Innerer (Beuger) und äußerer (Strecker) Oberarmknorren', 'Handwurzel und Finger', 'N. medianus, N. ulnaris, N. radialis'],
  abs: ['Rippenknorpel 5–7, Schwertfortsatz', 'Schambein', 'Zwischenrippennerven Th7–Th12'],
  obliques: ['Rippen 5–12 (äußerer) · Beckenkamm, Rückenfaszie (innerer)', 'Beckenkamm, Linea alba, untere Rippen', 'Zwischenrippennerven Th7–L1'],
  tva: ['Innenseite der unteren Rippen, Rückenfaszie, Beckenkamm', 'Linea alba (Sehnenplatte in der Bauchmitte)', 'Zwischenrippennerven Th7–L1'],
  diaphragm: ['Brustbein, Rippen 7–12, Lendenwirbel 1–3', 'Zentrale Sehnenplatte', 'N. phrenicus (C3–C5)'],
  erector: ['Kreuzbein, Beckenkamm, Dornfortsätze der LWS', 'Rippen, Quer- und Dornfortsätze bis zum Hinterhaupt', 'Hintere Äste der Spinalnerven'],
  multifidus: ['Kreuzbein und Querfortsätze', 'Dornfortsätze 2–4 Wirbel höher', 'Hintere Äste der Spinalnerven'],
  ql: ['Hinterer Beckenkamm', '12. Rippe und Querfortsätze L1–L4', 'Th12–L3'],
  iliopsoas: ['Lendenwirbel Th12–L5 (Psoas) · Innenseite der Beckenschaufel (Iliacus)', 'Kleiner Rollhügel am Oberschenkel innen', 'Lendengeflecht, N. femoralis (L1–L3)'],
  tfl: ['Vorderer oberer Darmbeinstachel', 'Über das IT-Band außen am Schienbeinkopf', 'N. gluteus superior (L4–S1)'],
  glute_max: ['Kreuzbein, Steißbein, hinterer Beckenkamm, Rückenfaszie', 'IT-Band und Oberschenkel-Rückseite', 'N. gluteus inferior (L5–S2)'],
  glute_med: ['Außenfläche der Beckenschaufel', 'Großer Rollhügel', 'N. gluteus superior (L4–S1)'],
  piriformis: ['Vorderfläche des Kreuzbeins', 'Spitze des großen Rollhügels', 'Kreuzbeingeflecht (S1–S2)'],
  adductors: ['Schambein und Sitzbein', 'Innenseite des Oberschenkels bis zum Schienbein', 'N. obturatorius (L2–L4)'],
  quads: ['Vorderer unterer Darmbeinstachel (Rectus) · Oberschenkelschaft (Vasti)', 'Über Kniescheibe und Patellasehne am Schienbeinhöcker', 'N. femoralis (L2–L4)'],
  hamstrings: ['Sitzbeinhöcker', 'Schienbein innen und Wadenbeinköpfchen', 'N. ischiadicus (L5–S2)'],
  calves: ['Oberschenkelknorren hinten (Gastrocnemius) · Schien- und Wadenbein (Soleus)', 'Über die Achillessehne am Fersenbein', 'N. tibialis (S1–S2)'],
  tibialis: ['Außenfläche des Schienbeins', 'Inneres Keilbein und 1. Mittelfußknochen', 'N. fibularis profundus (L4–L5)'],
  foot_int: ['Fersenbein und Plantarfaszie', 'Zehen', 'Nn. plantares (S1–S3)']
};

/* ── Rad: Beschwerden-Ratgeber ───────────────────────────────────────────── */
const BIKEFIT = [
  { n: 'Knie vorn', e: '🦵', topic: 'knee', cause: ['Sattel zu tief oder zu weit vorn', 'Zu dicke Gänge, niedrige Trittfrequenz', 'Verkürzter Quadrizeps drückt die Kniescheibe an'],
    fix: ['Sattel in kleinen Schritten (2–3 mm) höher', 'Trittfrequenz Richtung 85–95 U/min', 'Couch Stretch, Gesäß kräftigen'], ex: ['couch_stretch', 'step_down', 'hip_thrust'] },
  { n: 'Knie hinten', e: '🦵', topic: 'knee', cause: ['Sattel zu hoch oder zu weit hinten', 'Hüfte kippelt auf dem Sattel', 'Verkürzte Hamstrings'],
    fix: ['Sattel 2–3 mm tiefer', 'Hamstrings mobilisieren und exzentrisch kräftigen'], ex: ['supine_ham', 'rdl', 'nordic'] },
  { n: 'Knie außen', e: '🦵', topic: 'knee', cause: ['Cleats zu stark eingedreht, zu wenig Bewegungsfreiheit', 'Schwacher Glute medius, TFL/IT-Band unter Spannung', 'Sattel zu hoch'],
    fix: ['Cleat-Stellung prüfen (Ferse muss frei drehen können)', 'Hüftstabilität trainieren'], ex: ['foam_tfl', 'side_hip_abd', 'lateral_walk'] },
  { n: 'Unterer Rücken', e: '🔻', topic: 'lowback', cause: ['Zu gestreckte oder zu tiefe Position', 'Hüftbeuger kurz, Hamstrings kurz → Becken kann nicht kippen', 'Rumpf ermüdet, Rücken übernimmt'],
    fix: ['Vorbau kürzer oder höher testen', 'Hüfte mobilisieren, Rumpf-Ausdauer aufbauen'], ex: ['hip_flexor_stretch', 'side_plank', 'bird_dog', 'back_ext'] },
  { n: 'Nacken & Schultern', e: '🧠', topic: 'neck', cause: ['Lenker zu tief oder zu weit weg', 'Steife BWS – der Nacken muss die Streckung allein leisten', 'Durchgestreckte Ellbogen leiten Stöße weiter'],
    fix: ['Lenker höher / Vorbau kürzer', 'Ellbogen locker gebeugt, Schultern weg von den Ohren', 'BWS mobilisieren, Nacken kräftigen'], ex: ['thoracic_ext', 'chin_tuck', 'row'] },
  { n: 'Taube Hände', e: '✋', topic: 'bike', cause: ['Zu viel Gewicht auf den Händen (Sattel nach vorn geneigt, Lenker zu tief)', 'Handgelenk abgeknickt, Druck auf den Ulnarisnerv', 'Schwacher Rumpf – die Arme tragen den Oberkörper'],
    fix: ['Sattel waagerecht stellen', 'Griffposition oft wechseln, Handgelenk gerade', 'Rumpf kräftigen, dickeres Lenkerband'], ex: ['dead_bug', 'wrist_mob', 'forearm_stretch'] },
  { n: 'Taube Zehen / brennende Füße', e: '🦶', topic: 'ankle', cause: ['Schuhe zu eng oder zu fest geschlossen', 'Cleats zu weit vorn', 'Fußgewölbe sinkt unter Druck ein'],
    fix: ['Schuhe im Vorfuß lockern, ggf. breiterer Leisten', 'Cleats 2–5 mm nach hinten', 'Einlegesohlen mit Gewölbestütze'], ex: ['short_foot', 'plantar_roll'] },
  { n: 'Achillessehne', e: '🦶', topic: 'ankle', cause: ['Sattel zu hoch – Fuß muss sich strecken', 'Cleats zu weit vorn', 'Zu schnell gesteigerte Umfänge'],
    fix: ['Sattelhöhe prüfen, Cleats nach hinten', 'Langsames Wadenheben (exzentrisch)'], ex: ['calf_raise', 'calf_stretch'] },
  { n: 'Hüfte / Leiste', e: '🦴', topic: 'hip', cause: ['Sehr tiefe Position bei eingeschränkter Hüftbeugung', 'Zu lange Kurbeln', 'Verkürzter Hüftbeuger'],
    fix: ['Position etwas aufrechter', 'Kürzere Kurbeln erwägen', 'Hüfte in alle Richtungen mobilisieren'], ex: ['n9090', 'hip_flexor_stretch', 'psoas_march'] },
  { n: 'Sitzbeschwerden / Taubheit im Schritt', e: '💺', topic: 'bike', cause: ['Sattel passt nicht zur Sitzknochenbreite', 'Sattelnase zeigt nach oben', 'Sattel zu hoch → Becken kippelt'],
    fix: ['Sitzknochen vermessen lassen, Sattel mit Aussparung testen', 'Sattel waagerecht bis minimal nach vorn geneigt', 'Regelmäßig aus dem Sattel gehen. Anhaltende Taubheit ärztlich abklären.'], ex: [] }
];

/* ── Grundregeln (Kurzwissen) ────────────────────────────────────────────── */
const RULES = {
  kraft: ['2–3 Einheiten pro Woche reichen – entscheidend ist, über Monate dranzubleiben.', 'Wähle ein Gewicht, bei dem am Satzende noch 1–3 saubere Wiederholungen möglich wären.', 'Steigere langsam: erst Wiederholungen, dann Gewicht.', 'Voller Bewegungsumfang schlägt mehr Gewicht – Kraft in gedehnter Position macht auch beweglicher.', 'Schmerz bis 3/10 ist meist in Ordnung, wenn er am nächsten Tag nicht schlimmer ist.'],
  mob: ['Für mehr Beweglichkeit: 30–60 s halten, 2–3 Durchgänge, an mindestens 5 Tagen pro Woche.', 'Dehnen soll deutlich ziehen, aber du musst ruhig weiteratmen können.', 'Nach dem Dehnen die neue Reichweite aktiv nutzen (z. B. Hocke nach der Hüftdehnung).', 'Vor dem Sport lieber dynamisch bewegen, lange Haltedehnungen danach oder abends.', 'Was dauerhaft „zu“ ist, ist oft auch schwach – Kräftigen gehört dazu.']
};

return { TIERS, GROUPS, MGROUPS, E, ROUTINES, TEMPLATES, ANAT, BIKEFIT, RULES };
})();
