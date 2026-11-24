'use strict';
/* ═══ Übernahme aus der früheren Training-App ═══
   Die Training-App ist im Körper-Coach aufgegangen. Ihre Daten werden einmalig übernommen:
   – aus diesem Gerät (localStorage „training.v1“, liegt auf derselben Domain)
   – aus der Online-Datenbank (app = 'training'), falls die Synchronisation an ist
   Zuordnung:
     Morgenwerte (Schlaf, wach, Ruhepuls, HRV, Gewicht, Gefühl) → Check-in (S.well)
     Rolle SST/KA/GA/frei, Draußen → Fahrten (S.rides, mit RPE für die Belastung)
     Kraft A/B → Krafteinheiten · Mobility → Mobility-Einheit · Fußballtennis → sonstige Aktivität
   Jede Einheit bekommt eine feste ID („tr_…“) – mehrfaches Übernehmen erzeugt keine Doppelungen.
   Die alten Daten bleiben unangetastet liegen. */

const TR_RAD = { sst: 'Rolle SST', ka: 'Rolle KA', ga: 'Rolle GA', frei: 'Rolle frei', out: 'Draußen' };
const TR_FLAG = 'koerper.trainingImport';

function trImport(days, units, settings) {
  const res = { days: 0, units: 0 };
  // Morgenwerte → Check-in: nur fehlende Felder ergänzen, eigene Einträge haben Vorrang
  Object.entries(days || {}).forEach(([k, d]) => {
    if (!/^\d{4}-\d\d-\d\d$/.test(k) || !d || typeof d !== 'object') return;
    const w = Object.assign({}, S.well[k] || {}), before = JSON.stringify(w);
    if (d.schlaf != null && w.sh == null) w.sh = d.schlaf;
    if (d.rhr != null && w.rhr == null) w.rhr = d.rhr;
    if (d.hrv != null && w.hrv == null) w.hrv = d.hrv;
    if (d.kg != null && w.kg == null) w.kg = d.kg;
    if (d.gefuehl && w.en == null) w.en = d.gefuehl; // Gefühl 1–5 entspricht der Energie-Skala
    if (d.wach != null && !(w.note || '').includes('wach')) w.note = [w.note, `${d.wach}× wach`].filter(Boolean).join(' · ');
    if (JSON.stringify(w) !== before) { S.well[k] = w; res.days++; }
  });
  // Einheiten
  const have = new Set([...S.rides.map(r => r.id), ...S.sessions.map(s => s.id)]);
  (units || []).forEach(u => {
    if (!u || !u.id || !u.typ || !u.d) return;
    const id = 'tr_' + u.id; if (have.has(id)) return;
    const ts = u.t && dkey(new Date(u.t)) === u.d ? u.t : fromKey(u.d).getTime() + 12 * 36e5;
    const min = Math.max(0, Math.round(u.min || 0)), note = [u.rpe ? 'RPE ' + u.rpe : '', u.note || ''].filter(Boolean).join(' · ');
    if (TR_RAD[u.typ]) {
      const r = { id, src: 'training', s: ts, n: TR_RAD[u.typ], km: 0, min, hm: 0 };
      if (u.w) r.w = Math.round(u.w);
      if (u.hf) r.hr = Math.round(u.hf);
      if (u.rpe) r.rpe = u.rpe;
      if (note) r.note = note;
      S.rides.push(r);
    } else if (u.typ === 'kA' || u.typ === 'kB') {
      const s = { id, k: 'kraft', s: ts, e: ts + min * 6e4, n: u.typ === 'kA' ? 'Kraft A' : 'Kraft B', ex: [], src: 'training' };
      if (u.rpe) s.rpe = u.rpe;
      if (note) s.note = note;
      S.sessions.push(s);
    } else if (u.typ === 'mob') {
      S.sessions.push({ id, k: 'mob', s: ts, e: ts + min * 6e4, n: 'Mobility', sec: min * 60, cnt: 0, xs: {}, src: 'training' });
    } else {
      S.sessions.push({ id, k: 'sport', s: ts, n: u.typ === 'ft' ? 'Fußballtennis' : String(u.typ), min, note, src: 'training' });
    }
    have.add(id); res.units++;
  });
  // Rad-Wochenziel (Boden in Stunden) übernehmen, wenn noch keins gesetzt ist
  if (settings && settings.boden && !S.settings.goalR) S.settings.goalR = settings.boden;
  return res;
}

function trDone(res, where) {
  if (!res.days && !res.units) return;
  save(); keepScroll(render);
  toast(`Aus der Training-App übernommen${where}: ${plural(res.days, 'Tag', 'Tage')} Morgenwerte, ${plural(res.units, 'Einheit', 'Einheiten')}`);
}

(function trMigrate() {
  let flag = {};
  try { flag = JSON.parse(localStorage.getItem(TR_FLAG) || '{}') || {}; } catch (e) { flag = {}; }
  const mark = k => { flag[k] = Date.now(); try { localStorage.setItem(TR_FLAG, JSON.stringify(flag)); } catch (e) { /* egal */ } };
  // 1) Dieses Gerät
  if (!flag.local) {
    try {
      const raw = localStorage.getItem('training.v1');
      if (raw) { const t = JSON.parse(raw); trDone(trImport(t.days, t.units, t.settings), ''); }
      mark('local');
    } catch (e) { /* beschädigt – beim nächsten Start erneut versuchen */ }
  }
  // 2) Online-Datenbank (nur wenn angemeldet; erst nach dem ersten Abgleich)
  if (!flag.cloud && window.Cloud && Cloud.peek) {
    setTimeout(async () => {
      if (!Cloud.isOn()) return;
      try {
        const [tage, einheiten, st] = await Promise.all([Cloud.peek('training', 'tag'), Cloud.peek('training', 'einheit'), Cloud.peek('training', 'settings')]);
        const days = {}; tage.forEach(d => { if (d && d.d) { const { d: k, ...rest } = d; days[k] = rest; } });
        trDone(trImport(days, einheiten, st[0]), ' (online)');
        mark('cloud');
      } catch (e) { /* offline – später erneut */ }
    }, 4000);
  }
})();
