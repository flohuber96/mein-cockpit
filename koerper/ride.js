'use strict';
/* ═══ RAD: Fahrten · FIT-Import · Belastung & Form · Leistung · Ausgleich · Ratgeber ═══ */

const ridesIn = (from, to) => S.rides.filter(r => r.s >= from && r.s < to);
const sumRides = rs => rs.reduce((a, r) => { a.km += r.km || 0; a.min += r.min || 0; a.hm += r.hm || 0; a.tss += rideTss(r).v; a.n++; return a; }, { km: 0, min: 0, hm: 0, tss: 0, n: 0 });
const hTxt = min => `${Math.floor(min / 60)}:${pad(Math.round(min) % 60)}`;
const myFtp = () => S.settings.ftp || null;
const myKg = () => { const k = Object.keys(S.well).filter(d => S.well[d].kg).sort(); return k.length ? S.well[k[k.length - 1]].kg : null; };

// Belastung einer Fahrt (TSS). Mit eigenem FTP berechnet; sonst Gerätewert; sonst grob über die Dauer geschätzt.
function rideTss(r) {
  const ftp = myFtp(), n = r.np || r.w;
  if (ftp && n) return { v: r.min * 60 * n * (n / ftp) / (ftp * 3600) * 100, src: 'ftp' };
  if (r.tssDev) return { v: r.tssDev, src: 'dev' };
  return { v: (r.min || 0) / 60 * 45, src: 'est' };
}
const ZN = ['Z1 Erholung', 'Z2 Grundlage', 'Z3 Tempo', 'Z4 Schwelle', 'Z5 VO₂max', 'Z6 Anaerob', 'Z7 Sprint'];
const ZC = ['#9aa5a2', '#3b82f6', '#2f9e44', '#d9a400', '#f08c00', '#e5484d', '#8b5cf6'];
const ZLIM = [0.55, 0.75, 0.9, 1.05, 1.2, 1.5];
// Zeit in Zonen (Sekunden) aus der gespeicherten Leistungsverteilung (20-W-Stufen)
function zonesOf(rides, ftp) {
  const z = [0, 0, 0, 0, 0, 0, 0];
  rides.forEach(r => (r.ph || []).forEach((sec, i) => { if (!sec) return; const f = (i * 20 + 10) / ftp; let k = 0; while (k < 6 && f > ZLIM[k]) k++; z[k] += sec; }));
  return z;
}
const zoneBar = z => { const t = z.reduce((a, b) => a + b, 0) || 1; return `<div style="display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--card2)">${z.map((v, i) => v ? `<i style="width:${v / t * 100}%;background:${ZC[i]}"></i>` : '').join('')}</div>`; };
const zoneLegend = z => { const t = z.reduce((a, b) => a + b, 0) || 1; return `<div class="legend" style="padding:8px 0 0">${z.map((v, i) => v / t >= 0.005 ? `<span><i style="background:${ZC[i]}"></i>${ZN[i].split(' ')[0]} ${Math.round(v / t * 100)} %</span>` : '').join('')}</div>`; };

// Fitness (42 Tage), Ermüdung (7 Tage), Form – das übliche Belastungsmodell
function loadModel() {
  if (!S.rides.length) return null;
  const by = {}; let est = 0;
  S.rides.forEach(r => { const t = rideTss(r), k = dkey(new Date(r.s)); by[k] = (by[k] || 0) + t.v; if (t.src === 'est') est++; });
  const first = S.rides.reduce((m, r) => Math.min(m, r.s), Infinity), start = new Date(Math.max(first, Date.now() - 400 * DAY)); start.setHours(12, 0, 0, 0);
  let ctl = 0, atl = 0, form = 0, ctl7 = 0; const end = new Date(); end.setHours(12, 0, 0, 0); const days = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) { form = ctl - atl; const t = by[dkey(d)] || 0; ctl += (t - ctl) / 42; atl += (t - atl) / 7; days.push(ctl); }
  ctl7 = days.length > 7 ? days[days.length - 8] : 0;
  return { ctl, atl, form, ramp: ctl - ctl7, est: est / S.rides.length };
}
function formTxt(f) {
  if (f > 15) return ['grn', 'Sehr frisch', 'Gut erholt – ideal für harte Einheiten oder ein Event. Hält das länger an, sinkt die Fitness.'];
  if (f > 5) return ['grn', 'Frisch', 'Erholt und belastbar.'];
  if (f > -10) return ['', 'Ausgeglichen', 'Belastung und Erholung halten sich die Waage.'];
  if (f > -30) return ['amb', 'Aufbau', 'Du trainierst mehr, als du gewohnt bist – so wird man fitter. Auf Schlaf und Ausgleich achten.'];
  return ['red', 'Stark ermüdet', 'Sehr hohe Belastung der letzten Tage. Plane Erholung ein – das Verletzungsrisiko steigt.'];
}
function bestsIn(from) {
  const b = {};
  S.rides.forEach(r => { if (r.s < from || !r.pb) return; Object.keys(r.pb).forEach(k => { if (!b[k] || r.pb[k] > b[k]) b[k] = r.pb[k]; }); });
  return b;
}

VIEWS.ride = {
  title: 'Rad',
  sub() { const w = weekStart().getTime(), s = sumRides(ridesIn(w, w + 7 * DAY)); return s.n ? `Diese Woche ${num(s.km, 0)} km · ${hTxt(s.min)} h` : 'Fahrten, Belastung und Ausgleich'; },
  actions: () => '<button class="hbtn" data-act="fitPick" aria-label="Fahrten importieren">⬆︎</button><button class="hbtn" data-act="rideNew" aria-label="Fahrt eintragen">＋</button>',
  render: rRide
};

function rRide() {
  const now = Date.now(), w0 = weekStart().getTime(), c = ui.ride.chart;
  const wk = sumRides(ridesIn(w0, w0 + 7 * DAY)), pw = sumRides(ridesIn(w0 - 7 * DAY, w0)), m4 = sumRides(ridesIn(now - 28 * DAY, now + DAY));
  const y0 = new Date(new Date().getFullYear(), 0, 1).getTime(), yr = sumRides(ridesIn(y0, now + DAY));
  const weeks = []; for (let i = 11; i >= 0; i--) { const a = w0 - i * 7 * DAY, s = sumRides(ridesIn(a, a + 7 * DAY)); weeks.push({ a, v: c === 'km' ? s.km : c === 'hm' ? s.hm : c === 'tss' ? s.tss : s.min / 60 }); }
  const max = Math.max.apply(null, weeks.map(x => x.v).concat([0.001]));
  const prev4 = sumRides(ridesIn(w0 - 28 * DAY, w0)).min / 4, jump = prev4 > 120 && wk.min > prev4 * 1.3;
  const mobMin = periodStats(w0, w0 + 7 * DAY).mobMin, want = Math.round(wk.min / 60 * 7);
  const list = S.rides.slice().sort((a, b) => b.s - a.s), ftp = myFtp(), kg = myKg();
  const diff = (a, b) => b ? `${a >= b ? '▲' : '▼'} ${Math.round(Math.abs(a - b) / b * 100)} % zur Vorwoche` : 'Vorwoche: –';
  const unit = { h: 'Stunden', km: 'Kilometer', hm: 'Höhenmeter', tss: 'Belastung' }[c];
  const M = loadModel(), ft = M ? formTxt(M.form) : null;
  const b90 = bestsIn(now - 90 * DAY), ball = bestsIn(0), est = b90[1200] ? Math.round(b90[1200] * 0.95) : null;
  const z28 = ftp ? zonesOf(ridesIn(now - 28 * DAY, now + DAY), ftp) : null, zt = z28 ? z28.reduce((a, b) => a + b, 0) : 0;
  const pbRow = (k, l) => ball[k] ? `<div class="row" style="padding:7px 0;font-size:15px"><span class="muted" style="width:64px">${l}</span><b style="flex:1">${b90[k] ? b90[k] + ' W' : '–'}${b90[k] && kg ? ` <span class="muted" style="font-weight:500;font-size:13px">${num(b90[k] / kg)} W/kg</span>` : ''}</b><span class="muted" style="font-size:13.5px">gesamt ${ball[k]} W</span></div>` : '';
  return `
    ${!list.length ? `<div class="card empty"><div class="big">🚴</div><b>Noch keine Fahrten</b>Importiere deine Fahrten als FIT-Dateien – einzeln oder als ZIP, zum Beispiel aus dem Export von intervals.icu. Die Dateien bleiben auf deinem Gerät.
      <div class="stack" style="margin-top:14px"><button class="btn primary" data-act="fitPick">⬆︎ FIT-Dateien oder ZIP importieren</button><button class="btn plain" data-act="rideNew">＋ Fahrt von Hand eintragen</button></div></div>` : `
    <div class="stats"><div class="card stat"><small>Diese Woche</small><b>${num(wk.km, 0)}<i>km</i></b><span>${diff(wk.km, pw.km)}</span></div>
      <div class="card stat"><small>Zeit im Sattel</small><b>${hTxt(wk.min)}<i>h</i></b><span>${plural(wk.n, 'Fahrt', 'Fahrten')} · ${Math.round(wk.hm)} hm</span></div>
      <div class="card stat"><small>Letzte 4 Wochen</small><b>${num(m4.km, 0)}<i>km</i></b><span>${hTxt(m4.min)} h · ${Math.round(m4.hm)} hm</span></div>
      <div class="card stat"><small>Jahr ${new Date().getFullYear()}</small><b>${num(yr.km, 0)}<i>km</i></b><span>${plural(yr.n, 'Fahrt', 'Fahrten')} · ${hTxt(yr.min)} h</span></div></div>
    <div class="section-t">12 Wochen · ${unit}<div class="seg sm">${[['h', 'Zeit'], ['km', 'km'], ['hm', 'hm'], ['tss', 'Last']].map(([k, n]) => `<button data-act="rChart" data-v="${k}" class="${c === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="card pad"><div class="bars">${weeks.map((x, i) => `<div class="b${i === 11 ? ' now' : ''}${x.v ? '' : ' zero'}"><i style="height:${Math.max(2, x.v / max * 100)}%"></i></div>`).join('')}</div>
      <div class="blbl">${weeks.map((x, i) => { const d = new Date(x.a); return `<span>${i % 3 === 2 ? d.getDate() + '.' + (d.getMonth() + 1) + '.' : ''}</span>`; }).join('')}</div>
      <p class="small muted" style="margin-top:8px">Diese Woche ${num(weeks[11].v, c === 'h' ? 1 : 0)} · Höchstwert ${num(max, c === 'h' ? 1 : 0)}</p></div>
    ${jump ? `<div class="box warn" style="margin-top:10px">⚠️ <b>Deutlich mehr als zuletzt:</b> diese Woche ${hTxt(wk.min)} h, im Schnitt der letzten 4 Wochen ${hTxt(prev4)} h. Sprünge über etwa 30 % erhöhen das Risiko für Überlastung an Knie, Achillessehne und Rücken.</div>` : ''}
    <div class="section-t">Belastung & Form<button data-act="loadInfo">Was heißt das?</button></div>
    <div class="card pad"><div class="stats k3" style="margin-bottom:10px">
        <div><div class="stat" style="padding:0"><small>Fitness</small><b>${Math.round(M.ctl)}</b><span>${M.ramp >= 0 ? '▲ +' : '▼ '}${num(M.ramp)} in 7 Tagen</span></div></div>
        <div><div class="stat" style="padding:0"><small>Ermüdung</small><b>${Math.round(M.atl)}</b><span>letzte 7 Tage</span></div></div>
        <div><div class="stat" style="padding:0"><small>Form</small><b style="color:${M.form > 5 ? 'var(--ok)' : M.form > -10 ? 'var(--t1)' : M.form > -30 ? 'var(--c-tight)' : 'var(--c-pain)'}">${M.form > 0 ? '+' : ''}${Math.round(M.form)}</b><span>${ft[1]}</span></div></div></div>
      <p class="small muted">${ft[2]}</p>
      ${M.est > 0.3 ? `<p class="small" style="margin-top:8px;color:var(--c-tight)">Viele Fahrten haben keine Leistungsdaten${ftp ? '' : ' oder dein FTP fehlt'} – die Belastung ist dort nur über die Dauer geschätzt.</p>` : ''}</div>
    ${Object.keys(ball).length ? `<div class="section-t">Leistung<span class="muted">Bestwerte 90 Tage</span></div>
    <div class="card pad">${pbRow(5, '5 s')}${pbRow(60, '1 min')}${pbRow(300, '5 min')}${pbRow(1200, '20 min')}
      <div class="row" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)"><span><b>FTP ${ftp ? ftp + ' W' : 'nicht gesetzt'}</b>${ftp && kg ? ` <span class="muted">· ${num(ftp / kg)} W/kg</span>` : ''}<br><span class="small muted">${est ? `Schätzung aus deinem 20-Minuten-Bestwert: ${est} W` : 'Schwellenleistung – Grundlage für Zonen und Belastung'}</span></span><button class="btn soft sm" data-act="ftpEdit">${ftp ? 'Ändern' : 'Setzen'}</button></div></div>` : `<div class="card pad" style="margin-top:10px"><div class="row"><span><b>FTP ${ftp ? ftp + ' W' : 'nicht gesetzt'}</b><br><span class="small muted">Mit deinem FTP wird die Belastung genauer berechnet.</span></span><button class="btn soft sm" data-act="ftpEdit">${ftp ? 'Ändern' : 'Setzen'}</button></div></div>`}
    ${z28 && zt > 600 ? `<div class="section-t">Zonen<span class="muted">letzte 4 Wochen</span></div>
    <div class="card pad">${zoneBar(z28)}${zoneLegend(z28)}<p class="small muted" style="margin-top:8px">${(z28[0] + z28[1]) / zt >= 0.7 ? 'Überwiegend locker – eine gute Basis. Ein bis zwei gezielt harte Einheiten pro Woche reichen.' : (z28[2] + z28[3]) / zt >= 0.4 ? 'Viel Zeit im mittleren Bereich (Z3–Z4): anstrengend, aber wenig erholsam. Lockere Fahrten wirklich locker fahren, harte dafür richtig hart.' : 'Gemischte Verteilung. Als Faustregel gelten rund 80 % locker (Z1–Z2) und 20 % intensiv.'}</p></div>` : ''}
    <div class="section-t">Ausgleich</div>
    <div class="card pad"><div class="row"><span><b>${fmtMin(mobMin)} Mobility</b> <span class="muted">bei ${hTxt(wk.min)} h im Sattel</span></span><span class="tag ${mobMin >= want ? 'grn' : 'amb'}">${mobMin >= want ? 'passt' : 'Ziel ~' + want + ' min'}</span></div>
      <div class="meter" style="margin:10px 0"><i style="width:${want ? Math.min(100, Math.round(mobMin / want * 100)) : mobMin ? 100 : 0}%"></i></div>
      <p class="small muted">Faustregel: pro Stunde auf dem Rad etwa 5–10 Minuten Ausgleich für Hüftbeuger, Brustwirbelsäule und Brust.</p>
      <button class="btn soft sm" data-act="rt" data-id="r_bike" style="margin-top:10px;width:100%">🧘 „Nach dem Radfahren“ starten (${rtMin(getRoutine('r_bike'))} min)</button></div>
    <div class="section-t">Fahrten<span class="muted">${list.length}</span></div>
    <div class="card list">${list.slice(0, ui.ride.all ? 400 : 6).map(r => actRow({ ts: r.s, k: 'ride', x: r })).join('')}</div>
    ${list.length > 6 && !ui.ride.all ? '<button class="btn plain sm" data-act="rAll" style="margin-top:8px;width:100%">Alle anzeigen</button>' : ''}
    <div class="section-t">Import</div>
    <div class="card menu"><button data-act="fitPick"><span class="ico">⬆︎</span>FIT-Dateien oder ZIP importieren</button><button data-act="rideNew"><span class="ico">＋</span>Fahrt von Hand eintragen</button></div>
    <p class="small muted" style="margin:-4px 4px 0">Exportiere deine Aktivitäten z. B. in intervals.icu als FIT-Dateien (ZIP) und wähle die ZIP hier aus. Schon importierte Fahrten werden erkannt und übersprungen.</p>`}
    <input type="file" id="fitFile" accept=".zip,.fit,.gz,application/zip,application/octet-stream" multiple hidden>
    <div class="section-t">Beschwerden am Rad</div>
    <div class="card list">${X.BIKEFIT.map((b, i) => `<button class="li" data-act="fit" data-i="${i}"><span class="ic">${b.e}</span><span class="bd"><b>${esc(b.n)}</b><small class="clip">${esc(b.cause[0])}</small></span><span class="go">›</span></button>`).join('')}</div>
    <button class="btn plain" data-act="topic" data-id="bike" style="margin-top:10px">🚴 Was Radfahren mit dem Körper macht</button>`;
}

function rideSheet(id) {
  const r = S.rides.find(x => x.id === id); if (!r) return;
  const d = new Date(r.s), kmh = r.kmh || (r.km && r.min ? r.km / (r.min / 60) : 0), ftp = myFtp(), t = rideTss(r), n = r.np || r.w;
  const cell = (l, v, u) => v ? `<div class="card stat"><small>${l}</small><b>${v}<i>${u}</i></b></div>` : '';
  const z = ftp && r.ph ? zonesOf([r], ftp) : null;
  openSheet({
    title: r.n || 'Radfahrt', body: `<p class="p" style="margin:0 4px 12px">${DAYS[d.getDay()]}, ${fmtDate(d)} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr</p>
      <div class="stats k3" style="margin-bottom:10px">${cell('Distanz', r.km ? num(r.km) : '', 'km')}${cell('Zeit', r.min ? hTxt(r.min) : '', 'h')}${cell('Höhe', r.hm ? Math.round(r.hm) : '', 'hm')}${cell('Tempo', kmh ? num(kmh) : '', 'km/h')}${cell('Ø Leistung', r.w || '', 'W')}${cell('Normalisiert', r.np || '', 'W')}${cell('Puls', r.hr || '', 'bpm')}${cell('Kadenz', r.cad || '', '/min')}${cell('Arbeit', r.kj || '', 'kJ')}</div>
      <div class="card pad" style="margin-bottom:10px"><div class="row"><span><b>Belastung ${Math.round(t.v)}</b>${ftp && n ? ` <span class="muted">· Intensität ${num(n / ftp, 2)}</span>` : ''}<br><span class="small muted">${t.src === 'ftp' ? 'berechnet mit deinem FTP von ' + ftp + ' W' : t.src === 'dev' ? 'Wert vom Radcomputer' : 'grob über die Dauer geschätzt'}</span></span></div>
        ${z ? `<div style="margin-top:12px">${zoneBar(z)}${zoneLegend(z)}</div>` : ''}
        ${r.pb ? `<div class="chips" style="margin-top:12px">${[[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min']].filter(([k]) => r.pb[k]).map(([k, l]) => `<span class="chip static">${l}: <b>${r.pb[k]} W</b></span>`).join('')}</div>` : ''}</div>
      <div class="stack"><button class="btn soft" data-act="rt" data-id="r_bike">🧘 Ausgleich: „Nach dem Radfahren“</button>
      <button class="btn plain" data-act="rideName" data-id="${esc(id)}">✏️ Umbenennen</button>
      <button class="btn danger" data-act="rideDel" data-id="${esc(id)}">Fahrt löschen</button></div>`
  });
}
function rideForm() {
  openSheet({
    title: 'Fahrt eintragen', left: 'Abbrechen', right: '<button class="lnk r" data-act="rideSave">Speichern</button>',
    body: `<div class="field"><label>Name</label><input type="text" id="rdN" placeholder="z. B. Feierabendrunde"></div>
      <div class="field"><label>Datum</label><input type="date" id="rdD" value="${today()}" max="${today()}"></div>
      <div class="btns"><div class="field"><label>Distanz (km)</label><input inputmode="decimal" id="rdKm" placeholder="60"></div><div class="field"><label>Dauer (Minuten)</label><input inputmode="numeric" id="rdMin" placeholder="130"></div></div>
      <div class="btns"><div class="field"><label>Höhenmeter</label><input inputmode="numeric" id="rdHm" placeholder="optional"></div><div class="field"><label>Ø Watt</label><input inputmode="numeric" id="rdW" placeholder="optional"></div></div>
      <button class="btn primary" data-act="rideSave">Speichern</button>`
  });
}
function fitSheet(i) {
  const b = X.BIKEFIT[i]; if (!b) return;
  openSheet({
    title: b.n, body: `<div class="box tight" style="margin-bottom:10px"><div class="sec" style="color:var(--c-tight)">Häufige Ursachen</div>${ul(b.cause, 'var(--c-tight)')}</div>
      <div class="box bike" style="margin-bottom:10px"><div class="sec" style="color:var(--acc-t)">Was hilft</div>${ul(b.fix, 'var(--acc)')}</div>
      ${b.ex.length ? `<div class="section-t">Übungen dazu</div><div class="card list">${b.ex.map(x => exRow(x)).join('')}</div>` : ''}
      <button class="btn plain" data-act="topic" data-id="${b.topic}" style="margin-top:14px">${D.TOPICS[b.topic].ico} Zusammenhänge: ${esc(D.TOPICS[b.topic].n)}</button>
      <p class="note">Sitzposition immer nur in kleinen Schritten ändern und ein paar Fahrten testen. Bei anhaltenden Beschwerden lohnt ein professionelles Bikefitting.</p>`
  });
}
function ftpSheet() {
  const b = bestsIn(Date.now() - 90 * DAY), est = b[1200] ? Math.round(b[1200] * 0.95) : null;
  ui.ride.ftpDraft = myFtp() || est || 200;
  const body = () => `<p class="p" style="margin:0 4px 12px">Der FTP ist die Leistung, die du etwa eine Stunde lang halten kannst. Daraus ergeben sich deine Trainingszonen und die Belastung jeder Fahrt.</p>
    <div class="field"><div class="stepper"><button data-act="ftpStep" data-d="-5">−</button><b id="ftpV">${ui.ride.ftpDraft}<small>Watt</small></b><button data-act="ftpStep" data-d="5">＋</button></div></div>
    ${est ? `<button class="btn plain" data-act="ftpUse" data-v="${est}" style="margin-bottom:8px">Schätzung übernehmen: ${est} W</button><p class="small muted" style="margin:0 4px 12px">95 % deines besten 20-Minuten-Werts der letzten 90 Tage (${b[1200]} W). Das passt nur, wenn du in der Zeit einmal 20 Minuten voll gefahren bist.</p>` : ''}
    <div class="stack"><button class="btn primary" data-act="ftpSave">Speichern</button>${myFtp() ? '<button class="btn danger" data-act="ftpClear">FTP entfernen</button>' : ''}</div>`;
  ui.ride.ftpBody = body;
  openSheet({ title: 'FTP', left: 'Abbrechen', body: body() });
}

/* ── Import von FIT-Dateien / ZIP ── */
const fitName = n => /\.fit(\.gz)?$/i.test(n) && !/(^|\/)(\.|__MACOSX)/.test(n);
async function importFiles(fileList) {
  const files = [].slice.call(fileList); if (!files.length) return;
  const res = { rides: 0, other: 0, dup: 0, bad: 0, total: 0 }, known = new Set(S.rides.map(r => r.id).concat(S.sessions.map(s => s.id)));
  openSheet({ title: 'Import', body: '<div class="empty"><div class="big">⏳</div><b id="impT">Lese Dateien …</b><div class="meter" style="margin-top:14px"><i id="impB" style="width:0%"></i></div></div>' });
  const tick = () => new Promise(r => setTimeout(r, 0));
  const one = (name, bytes) => {
    try {
      const a = FIT.summarize(/\.gz$/i.test(name) ? FIT.gunzip(bytes) : bytes), id = 'f' + Math.round(a.start / 1000);
      if (known.has(id)) { res.dup++; return; }
      known.add(id);
      if (a.ride) {
        const r = { id, src: 'fit', s: a.start, n: a.name };
        ['km', 'min', 'hm', 'kmh', 'hr', 'hrmax', 'cad', 'w', 'np', 'wmax', 'kj', 'pb', 'ph', 'tssDev', 'ftpDev'].forEach(k => { if (a[k] != null) r[k] = a[k]; });
        S.rides.push(r); res.rides++;
      } else if (a.min >= 1) { const s = { id, k: 'sport', src: 'fit', n: a.name, s: a.start, min: Math.round(a.min) }; if (a.km) s.note = num(a.km) + ' km'; S.sessions.push(s); res.other++; }
    } catch (e) { res.bad++; }
  };
  try {
    const jobs = [];
    for (const f of files) {
      const u8 = new Uint8Array(await f.arrayBuffer());
      if (u8[0] === 0x50 && u8[1] === 0x4b) FIT.unzip(u8).filter(e => fitName(e.name)).forEach(e => jobs.push({ name: e.name, get: () => e.data() }));
      else if (/\.fit(\.gz)?$/i.test(f.name) || u8[0] === 0x1f) jobs.push({ name: u8[0] === 0x1f ? f.name.replace(/(\.gz)?$/i, '.gz') : f.name, get: () => u8 });
      else res.bad++;
    }
    res.total = jobs.length;
    for (let i = 0; i < jobs.length; i++) {
      let bytes = null; try { bytes = jobs[i].get(); } catch (e) { res.bad++; }
      if (bytes) one(jobs[i].name, bytes);
      if (i % 3 === 0) { const t = $('#impT'), b = $('#impB'); if (t) { t.textContent = `${i + 1} von ${jobs.length} …`; b.style.width = Math.round((i + 1) / jobs.length * 100) + '%'; } await tick(); }
    }
  } catch (e) { res.err = e.message; }
  if (res.rides || res.other) save();
  render();
  const line = (ico, txt) => `<div class="li"><span class="ic">${ico}</span><span class="bd"><b>${txt}</b></span></div>`;
  sheetBody(`${res.err ? `<div class="box red" style="margin-bottom:10px">${esc(res.err)}</div>` : ''}
    <div class="card list" style="margin-bottom:14px">${line('🚴', plural(res.rides, 'neue Fahrt', 'neue Fahrten'))}${res.other ? line('🏃', plural(res.other, 'andere Aktivität', 'andere Aktivitäten')) : ''}${res.dup ? line('↩︎', `${res.dup} schon vorhanden – übersprungen`) : ''}${res.bad ? line('⚠️', `${res.bad} nicht lesbar`) : ''}</div>
    ${!res.total && !res.err ? '<p class="p" style="text-align:center;margin-bottom:14px">In der Auswahl waren keine FIT-Dateien. Unterstützt werden .fit, .fit.gz und ZIP-Archive mit solchen Dateien.</p>' : ''}
    ${res.rides && !myFtp() ? '<p class="small muted" style="margin:0 4px 14px">Tipp: Trag deinen FTP ein, dann berechnet die App Zonen und Belastung genau.</p>' : ''}
    <button class="btn primary" data-act="closeSheet">Fertig</button>`);
}
document.addEventListener('change', e => { if (e.target.id === 'fitFile' && e.target.files.length) importFiles(e.target.files); });

Object.assign(ACT, {
  rChart(el) { ui.ride.chart = el.dataset.v; keepScroll(render); },
  rAll() { ui.ride.all = true; keepScroll(render); },
  rideNew() { rideForm(); },
  rideSave() {
    const km = numVal($('#rdKm').value), min = numVal($('#rdMin').value);
    if (!km && !min) { toast('Bitte Distanz oder Dauer eintragen'); return; }
    const dk = $('#rdD').value || today(), ts = dk === today() ? Date.now() : fromKey(dk).getTime() + 12 * 36e5;
    const r = { id: 'm' + uid(), src: 'manual', s: ts, n: $('#rdN').value.trim() || 'Radfahrt', km: km || 0, min: min || 0, hm: Math.round(numVal($('#rdHm').value) || 0) };
    const w = numVal($('#rdW').value); if (w) r.w = Math.round(w);
    S.rides.push(r); save(); closeSheet(); render(); toast('Fahrt gespeichert', { label: 'Jetzt dehnen', fn: () => rtSheet('r_bike') });
  },
  rideDel(el) { confirmSheet('Diese Fahrt löschen?', 'Löschen', () => { S.rides = S.rides.filter(r => r.id !== el.dataset.id); save(); closeAllSheets(); keepScroll(render); }); },
  rideName(el) { const r = S.rides.find(x => x.id === el.dataset.id); if (!r) return; closeAllSheets(); askText('Fahrt umbenennen', 'Name', r.n || '', v => { r.n = v; save(); keepScroll(render); toast('Umbenannt'); }); },
  fit(el) { fitSheet(+el.dataset.i); },
  fitPick() { const f = $('#fitFile'); if (f) { f.value = ''; f.click(); } else { go('ride'); setTimeout(() => { const g = $('#fitFile'); if (g) g.click(); }, 50); } },
  ftpEdit() { ftpSheet(); },
  ftpStep(el) { ui.ride.ftpDraft = Math.max(80, Math.min(500, ui.ride.ftpDraft + +el.dataset.d)); $('#ftpV').innerHTML = `${ui.ride.ftpDraft}<small>Watt</small>`; },
  ftpUse(el) { ui.ride.ftpDraft = +el.dataset.v; sheetBody(ui.ride.ftpBody()); },
  ftpSave() { S.settings.ftp = ui.ride.ftpDraft; save(); closeSheet(); keepScroll(render); toast(`FTP ${S.settings.ftp} W gespeichert`); },
  ftpClear() { S.settings.ftp = null; save(); closeSheet(); keepScroll(render); },
  loadInfo() {
    openSheet({ title: 'Belastung & Form', body: `<div class="card pad stack">
      <div><b>Belastung einer Fahrt</b><p class="p">Dauer mal Intensität. Eine Stunde an der Schwelle (FTP) ergibt 100 Punkte, zwei lockere Stunden etwa 80–100.</p></div>
      <div><b>Fitness</b><p class="p">Durchschnittliche Belastung der letzten rund 6 Wochen. Steigt langsam mit regelmäßigem Training.</p></div>
      <div><b>Ermüdung</b><p class="p">Durchschnittliche Belastung der letzten 7 Tage. Reagiert schnell auf harte Wochen.</p></div>
      <div><b>Form</b><p class="p">Fitness minus Ermüdung. Leicht negativ ist beim Aufbau normal; stark negativ heißt: Erholung einplanen. Deutlich positiv bedeutet frisch.</p></div></div>
      <p class="note">Das Modell kennt nur das Radfahren – Schlaf, Stress und Krafttraining siehst du im Bereich Wohlbefinden. Die Zahlen sind eine Orientierung, kein Messwert.</p>` });
  }
});
