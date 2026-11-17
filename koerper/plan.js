'use strict';
/* ═══ WOCHENPLAN · KALENDER · WOCHENBERICHT · ERSTE SCHRITTE ═══ */

const PD = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], PDS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const planDays = () => { if (!S.plan || !Array.isArray(S.plan.days) || S.plan.days.length !== 7) S.plan = { days: [[], [], [], [], [], [], []] }; return S.plan.days; };
const planOn = () => planDays().some(d => d.length);
const todayIdx = () => (new Date().getDay() + 6) % 7;
function itemInfo(it) {
  if (it.k === 'kraft') { const t = getTemplate(it.id) || getTemplate('t_rad_a'); return { e: t.e || '🏋️', n: t.n, sub: `Kraft · ${tplMin(t)} min`, act: 'tpl', id: t.id, ico: '🏋️' }; }
  if (it.k === 'mob') { const r = getRoutine(it.id) || getRoutine('r_hip'); return { e: r.e || '🧘', n: r.n, sub: `Mobility · ${rtMin(r)} min`, act: 'rt', id: r.id, ico: '🧘' }; }
  if (it.k === 'ride') { const w = rwGet(it.id) || rwGet('z2'); return { e: w.e, n: w.n, sub: `Rad · ${w.main} · ${rwWatt(w)}`, act: 'rw', id: w.id, ico: '🚴' }; }
  return { e: '😴', n: 'Ruhetag', sub: 'Erholung ist Teil des Trainings', act: '', id: '', ico: '😴' };
}
function dayKinds(k) {
  const o = {}, a = fromKey(k).getTime(), b = a + DAY;
  S.sessions.forEach(s => { if (s.s >= a && s.s < b) o[s.k] = (o[s.k] || 0) + 1; });
  S.rides.forEach(r => { if (r.s >= a && r.s < b) o.ride = (o.ride || 0) + 1; });
  return o;
}
const itemDone = (it, kinds) => it.k === 'rest' ? false : !!kinds[it.k];

// Vorschlag: Kraft und harte Radtage getrennt, nach jeder Fahrt Ausgleich, mindestens ein ruhiger Tag
function planSuggest() {
  const d = [[], [], [], [], [], [], []], gK = S.settings.goalK, gM = S.settings.goalM, pr = planRoutine() ? 'r_plan' : null, pt = planTemplate() ? 't_plan' : null;
  const kDays = { 0: [], 1: [1], 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 4] }[Math.min(4, gK)] || [0, 1, 3, 4];
  const kT = pt ? [pt, 't_rad_a', 't_rad_b', pt] : ['t_rad_a', 't_rad_b', 't_rad_a', 't_rad_b'];
  kDays.forEach((x, i) => d[x].push({ k: 'kraft', id: kT[i % kT.length] }));
  const hard = gK >= 3 ? 3 : 2, n = nextRide(), key = n.w && !['rec', 'z2'].includes(n.w.id) ? n.w.id : 'ss';
  d[hard].push({ k: 'ride', id: key }); d[5].push({ k: 'ride', id: 'z2' }); d[6].push({ k: 'ride', id: 'z2s' });
  const mOrder = [[5, 'r_bike'], [hard, 'r_bike'], [0, pr || 'r_hip'], [6, 'r_bike'], [gK >= 3 ? 1 : 3, pr || 'r_shoulder'], [4, 'r_post'], [1, 'r_back'], [2, 'r_hip'], [3, 'r_desk']];
  const usedDay = {}; let m = 0;
  mOrder.forEach(([x, id]) => { if (m >= gM || usedDay[x]) return; usedDay[x] = 1; d[x].push({ k: 'mob', id }); m++; });
  d.forEach(x => { if (!x.length) x.push({ k: 'rest' }); });
  return d;
}

/* ── Startseite: heute geplant ── */
function todayPlanHTML() {
  const items = planDays()[todayIdx()], kinds = dayKinds(today()), rd = readiness(today());
  if (!items.length) return `<div class="section-t">Heute geplant<button data-act="plan">Wochenplan ›</button></div><div class="card pad"><b>Nichts geplant</b><p class="small muted">Freier Tag – oder spontan etwas aus der Empfehlung unten.</p></div>`;
  const tired = rd != null && rd < 45 && items.some(it => it.k === 'kraft' || (it.k === 'ride' && !['rec', 'z2'].includes(it.id)));
  const open = items.filter(it => it.k !== 'rest' && !itemDone(it, kinds)).length;
  return `<div class="section-t">Heute geplant<button data-act="plan">Wochenplan ›</button></div>
    ${tired ? `<div class="box warn" style="margin-bottom:8px">🌤️ Deine Tagesform ist niedrig (${rd}). Tausche die harte Einheit heute gegen locker Rollen oder Mobility – der Plan läuft nicht weg.</div>` : ''}
    <div class="card list">${items.map(it => { const i = itemInfo(it), dn = itemDone(it, kinds); return `<button class="li${dn ? ' dn' : ''}" ${i.act ? `data-act="${i.act}" data-id="${esc(i.id)}"` : ''}><span class="ic">${i.e}</span><span class="bd"><b>${esc(i.n)}</b><small class="clip">${esc(i.sub)}</small></span>${it.k === 'rest' ? '' : dn ? '<span class="tag grn">✓ erledigt</span>' : '<span class="tag acc">Start</span>'}</button>`; }).join('')}</div>
    ${!open && items.some(it => it.k !== 'rest') ? '<p class="small" style="margin:8px 4px 0;color:var(--ok);font-weight:700">Für heute alles erledigt ✅</p>' : ''}`;
}
function weekStripHTML() {
  const w0 = weekStart().getTime(), plan = planDays(), out = [];
  for (let i = 0; i < 7; i++) {
    const k = dkey(new Date(w0 + i * DAY + 12 * 36e5)), kinds = dayKinds(k), done = Object.keys(kinds).map(x => ACT_ICO[x] || '🏃');
    const todo = k >= today() ? plan[i].filter(it => it.k !== 'rest' && !itemDone(it, kinds)).map(it => itemInfo(it).ico) : [];
    out.push(`<div class="d${k === today() ? ' today' : ''}">${PDS[i]}<div class="dots">${done.join('')}${todo.length ? `<span style="opacity:.3">${[...new Set(todo)].join('')}</span>` : ''}${!done.length && !todo.length ? '<i></i>' : ''}</div></div>`);
  }
  return out.join('');
}

/* ── Wochenplan bearbeiten ── */
function planBody() {
  const d = planDays();
  return `<p class="p" style="margin:0 4px 12px">Der Plan gilt jede Woche. Die Startseite zeigt dir, was heute dran ist, und hakt ab, was du gemacht hast.</p>
    ${d.map((items, i) => `<div class="card pday${i === todayIdx() ? ' today' : ''}"><b>${PDS[i]}</b><div class="pitems">${items.map((it, n) => { const x = itemInfo(it); return `<span class="pchip">${x.e} ${esc(x.n)}<button data-act="planRm" data-d="${i}" data-n="${n}" aria-label="Entfernen">✕</button></span>`; }).join('') || '<span class="muted small">frei</span>'}</div><button class="hbtn" data-act="planAdd" data-d="${i}" aria-label="Hinzufügen">＋</button></div>`).join('')}
    <div class="stack" style="margin-top:14px"><button class="btn soft" data-act="planAuto">✨ Vorschlag erstellen</button>${planOn() ? '<button class="btn danger" data-act="planClear">Plan leeren</button>' : ''}</div>
    <p class="note">Der Vorschlag richtet sich nach deinen Wochenzielen (${S.settings.goalK}× Kraft, ${S.settings.goalM}× Mobility): Kraft und harte Radtage getrennt, nach jeder Fahrt Ausgleich. Passe ihn frei an.</p>`;
}
function planSheet() { openSheet({ title: 'Wochenplan', body: planBody(), onClose() { keepScroll(render); } }); }
let pa = null;
function planAddBody() {
  const sec = { kraft: X.TEMPLATES.concat(planTemplate() ? [planTemplate()] : [], S.templates).map(t => ({ id: t.id, e: t.e || '📋', n: t.n, s: `${tplMin(t)} min` })),
    mob: (planRoutine() ? [planRoutine()] : []).concat(X.ROUTINES, S.routines).map(r => ({ id: r.id, e: r.e || '🧘', n: r.n, s: `${rtMin(r)} min` })),
    ride: RW.map(w => ({ id: w.id, e: w.e, n: w.n, s: `${rwMin(w)} min` })) }[pa.k] || [];
  return `<div class="seg">${[['kraft', 'Kraft'], ['mob', 'Mobility'], ['ride', 'Rad'], ['rest', 'Ruhetag']].map(([k, n]) => `<button data-act="planK" data-v="${k}" class="${pa.k === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    ${pa.k === 'rest' ? '<button class="btn primary" data-act="planPick" data-id="">😴 Als Ruhetag eintragen</button>' : `<div class="card list">${sec.map(x => `<button class="li" data-act="planPick" data-id="${esc(x.id)}"><span class="ic">${x.e}</span><span class="bd"><b>${esc(x.n)}</b></span><span class="rt">${x.s}</span></button>`).join('')}</div>`}`;
}

/* ── Kalender ── */
function calBody() {
  const c = ui.cal, first = new Date(c.y, c.m, 1), off = (first.getDay() + 6) % 7, nDays = new Date(c.y, c.m + 1, 0).getDate();
  const a = first.getTime(), b = new Date(c.y, c.m + 1, 1).getTime(), st = periodStats(a, b), cells = [];
  for (let i = 0; i < off; i++) cells.push('<span></span>');
  for (let d = 1; d <= nDays; d++) {
    const k = dkey(new Date(c.y, c.m, d)), kinds = Object.keys(dayKinds(k)), rd = readiness(k);
    cells.push(`<button class="cd${k === today() ? ' today' : ''}${c.sel === k ? ' sel' : ''}${k > today() ? ' fut' : ''}" data-act="calDay" data-v="${k}"><b>${d}</b><span>${kinds.slice(0, 3).map(x => ACT_ICO[x] || '🏃').join('')}</span>${rd != null ? `<i style="background:${readyTxt(rd)[3]}"></i>` : ''}</button>`);
  }
  const sel = c.sel ? acts().filter(x => dkey(new Date(x.ts)) === c.sel) : [], w = c.sel ? wellOf(c.sel) : null;
  return `<div class="row" style="margin:0 4px 10px"><button class="hbtn" data-act="calNav" data-d="-1">‹</button><b style="font-size:17px">${['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][c.m]} ${c.y}</b><button class="hbtn" data-act="calNav" data-d="1">›</button></div>
    <div class="card pad"><div class="cal">${PDS.map(x => `<em>${x}</em>`).join('')}${cells.join('')}</div></div>
    <div class="stats k4" style="margin-top:10px"><div class="card stat"><small>Kraft</small><b>${st.kraft}</b></div><div class="card stat"><small>Mobility</small><b>${st.mob}</b></div><div class="card stat"><small>Rad</small><b>${num(st.rideMin / 60, 0)}<i>h</i></b></div><div class="card stat"><small>km</small><b>${num(st.km, 0)}</b></div></div>
    ${c.sel ? `<div class="section-t">${fmtDay(fromKey(c.sel).getTime() + 12 * 36e5)}${w ? `<span class="muted">Tagesform ${readiness(c.sel)}</span>` : ''}</div>${sel.length ? `<div class="card list">${sel.map(actRow).join('')}</div>` : '<div class="card empty" style="padding:16px">Keine Einheit an diesem Tag.</div>'}` : '<p class="note">Tippe auf einen Tag. Der farbige Punkt zeigt deine Tagesform.</p>'}`;
}
function calSheet() { const d = new Date(); ui.cal = { y: d.getFullYear(), m: d.getMonth(), sel: today() }; openSheet({ title: 'Kalender', body: calBody() }); }

/* ── Wochenbericht ── */
function isoWeek(d) { const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - n); return Math.ceil(((x - Date.UTC(x.getUTCFullYear(), 0, 1)) / DAY + 1) / 7); }
function weekData(a) {
  const b = a + 7 * DAY, st = periodStats(a, b), rides = sumRides(ridesIn(a, b));
  const kMin = S.sessions.filter(s => s.k === 'kraft' && s.s >= a && s.s < b).reduce((m, s) => m + ((s.e || s.s) - s.s) / 6e4, 0);
  const rds = [], sl = []; for (let i = 0; i < 7; i++) { const k = dkey(new Date(a + i * DAY + 12 * 36e5)), r = readiness(k), w = wellOf(k); if (r != null) rds.push(r); if (w && w.sh) sl.push(w.sh); }
  const avg = x => x.length ? x.reduce((p, c) => p + c, 0) / x.length : null;
  let planned = 0, pdone = 0;
  planDays().forEach((items, i) => { const k = dkey(new Date(a + i * DAY + 12 * 36e5)); if (k > today() || !S.plan.since || k < S.plan.since) return; const kinds = dayKinds(k); items.forEach(it => { if (it.k === 'rest') return; planned++; if (itemDone(it, kinds)) pdone++; }); });
  return { st, rides, kMin, rd: avg(rds), sleep: avg(sl), nWell: rds.length, planned, pdone };
}
function reportBody() {
  const a = weekStart().getTime() + ui.rep * 7 * DAY, b = a + 7 * DAY, W = weekData(a), V = weekData(a - 7 * DAY), cur = ui.rep === 0;
  const gK = S.settings.goalK, gM = S.settings.goalM, okK = W.st.kraft >= gK, okM = W.st.mob >= gM;
  const bal = muscleBal(a, b), P = pmc(), day = P.days.filter(d => d.ts < b).pop(), day7 = P.days.filter(d => d.ts < a).pop();
  const arrow = (x, y, inv) => y == null || x == null || Math.abs(x - y) < 0.01 * Math.max(1, Math.abs(y)) ? '' : ` <span style="font-size:12.5px;color:${(x > y) !== !!inv ? 'var(--ok)' : 'var(--c-pain)'}">${x > y ? '▲' : '▼'}</span>`;
  const row = (l, v, ar) => `<div class="row" style="padding:7px 0;font-size:15px"><span class="muted">${l}</span><b>${v}${ar || ''}</b></div>`;
  const pains = activePains().map(([id, p]) => { const lg = (S.painLog && S.painLog[id]) || [], before = lg.filter(x => x[0] < dkey(new Date(a))).pop(), inWeek = lg.filter(x => x[0] >= dkey(new Date(a)) && x[0] < dkey(new Date(b))).pop(); return { id, now: inWeek ? inWeek[1] : p.lvl, was: before ? before[1] : null }; });
  const steps = [];
  const worse = pains.filter(x => x.was != null && x.now > x.was);
  if (worse.length) steps.push(`<b>${esc(nm(worse[0].id))}</b> ist stärker geworden (${worse[0].was} → ${worse[0].now}). Belastung dort zurücknehmen, täglich die passende Routine – hält es an, abklären lassen.`);
  if (day && day.tsb < -25) steps.push(`Rad-Form ${Math.round(day.tsb)}: Plane eine <b>leichtere Woche</b> ein (Umfang rund 40 % senken).`);
  if (day && day7 && day.ctl - day7.ctl > 8) steps.push('Die Rad-Belastung steigt sehr schnell. Halte den Anstieg unter etwa 5–8 Fitness-Punkten pro Woche.');
  if (!okK && gK) steps.push(`Kraft: ${W.st.kraft} von ${gK}. Lege die Einheiten im <b>Wochenplan</b> auf feste Tage – 25 Minuten reichen.`);
  if (!okM && gM) steps.push(`Mobility: ${W.st.mob} von ${gM}. Am leichtesten direkt nach dem Radfahren (10 min).`);
  if (W.rides.min > 120 && W.st.mobMin < W.rides.min / 60 * 5) steps.push(`Bei ${hTxt(W.rides.min)} h im Sattel nur ${fmtMin(W.st.mobMin)} Ausgleich – Ziel sind 5–10 min pro Stunde Rad.`);
  if (bal.none.length && W.st.kraft > 0) steps.push(`Nicht trainiert: <b>${esc(bal.none.slice(0, 3).map(g => X.GROUPS[g].n).join(', '))}</b>. Nimm nächste Woche eine Einheit dafür dazu.`);
  if (W.rd != null && W.rd < 50) steps.push(`Tagesform im Schnitt ${Math.round(W.rd)} – <b>Schlaf und Erholung</b> haben nächste Woche Vorrang vor mehr Training.`);
  if (!W.nWell) steps.push('Mach den morgendlichen Kurz-Check – dann erkennt die App, wann du Erholung brauchst.');
  if (!steps.length) steps.push('Alles im Lot. Steigere <b>eine</b> Sache leicht: eine Wiederholung mehr, 5 Minuten länger dehnen oder 10 % mehr Rad-Umfang.');
  const score = (okK ? 1 : W.st.kraft / Math.max(1, gK)) + (okM ? 1 : W.st.mob / Math.max(1, gM)) + (W.rides.n ? 1 : 0), verdict = score >= 2.8 ? ['Starke Woche 💪', 'grn'] : score >= 1.8 ? ['Solide Woche 👍', 'acc'] : score >= 0.8 ? ['Ruhige Woche', ''] : ['Pause-Woche', ''];
  return `<div class="row" style="margin:0 4px 10px"><button class="hbtn" data-act="repNav" data-d="-1">‹</button><span style="text-align:center"><b style="font-size:17px">KW ${isoWeek(new Date(a + 3 * DAY))}</b><br><span class="small muted">${fmtDate(new Date(a))} – ${fmtDate(new Date(b - DAY))}${cur ? ' · läuft noch' : ''}</span></span><button class="hbtn" data-act="repNav" data-d="1"${cur ? ' disabled style="opacity:.3"' : ''}>›</button></div>
    <div class="card pad" style="margin-bottom:10px"><div class="row"><b style="font-size:19px">${verdict[0]}</b>${W.planned ? `<span class="tag ${W.pdone >= W.planned ? 'grn' : ''}">Plan ${W.pdone}/${W.planned}</span>` : ''}</div>
      <div class="row" style="gap:14px;align-items:flex-start;margin-top:12px">${[['🏋️ Kraft', W.st.kraft, gK], ['🧘 Mobility', W.st.mob, gM]].map(([l, v, g]) => `<div style="flex:1"><div class="row" style="font-size:13.5px"><b>${l}</b><span class="muted">${v} / ${g} ${v >= g ? '✓' : ''}</span></div><div class="meter" style="margin-top:5px"><i style="width:${g ? Math.min(100, v / g * 100) : 0}%"></i></div></div>`).join('')}</div></div>
    <div class="section-t" style="margin-top:6px">Nächste Schritte</div>
    <div class="card pad stack s6">${steps.slice(0, 4).map((t, i) => `<div class="note-row"><span>${i + 1}.</span><p>${t}</p></div>`).join('')}</div>
    <div class="section-t">Zahlen<span class="muted">Pfeil = zur Vorwoche</span></div>
    <div class="card pad">${row('🏋️ Krafttraining', `${W.st.kraft} × · ${fmtMin(W.kMin)}`, arrow(W.kMin, V.kMin))}${row('🧘 Mobility', `${W.st.mob} × · ${fmtMin(W.st.mobMin)}`, arrow(W.st.mobMin, V.st.mobMin))}
      ${row('🚴 Rad', `${hTxt(W.rides.min)} h · ${num(W.rides.km, 0)} km`, arrow(W.rides.min, V.rides.min))}${W.rides.n ? row('Rad-Belastung', Math.round(W.rides.tss), arrow(W.rides.tss, V.rides.tss)) : ''}${day ? row('Rad-Form am Wochenende', `${day.tsb > 0 ? '+' : ''}${Math.round(day.tsb)} · ${fzone(day.tsb)[2]}`) : ''}
      ${W.rd != null ? row('🌤️ Tagesform Ø', Math.round(W.rd), arrow(W.rd, V.rd)) : ''}${W.sleep != null ? row('🛏️ Schlaf Ø', num(W.sleep) + ' h', arrow(W.sleep, V.sleep)) : ''}</div>
    ${bal.tot ? `<div class="section-t">Muskel-Bilanz</div><div class="card pad">${balRows(bal)}</div>` : ''}
    ${pains.length ? `<div class="section-t">Beschwerden</div><div class="card list">${pains.map(x => `<button class="li" data-act="painEdit" data-id="${x.id}"><span class="lvl" style="background:${painCol(x.now)}">${x.now}</span><span class="bd"><b>${esc(nm(x.id))}</b><small>${x.was == null ? 'neu in dieser Woche' : x.now < x.was ? `besser: ${x.was} → ${x.now}` : x.now > x.was ? `schlechter: ${x.was} → ${x.now}` : 'unverändert'}</small></span></button>`).join('')}</div>` : ''}`;
}
function reportSheet() { ui.rep = new Date().getDay() === 1 ? -1 : 0; openSheet({ title: 'Wochenbericht', body: reportBody() }); }

/* ── Erste Schritte ── */
function introHTML() {
  if (S.settings.intro) return '';
  const st = [['🧰', 'Ausrüstung wählen', 'Damit nur passende Übungen erscheinen', 'gear', !!(S.gear && S.gear.t)],
    ['🌤️', 'Ersten Kurz-Check machen', 'Schlaf, Energie, Beine – 15 Sekunden', 'wellEdit', Object.keys(S.well).length > 0],
    ['📋', 'Körper-Check', 'Beschwerden markieren, Selbsttests machen', 'goCheck', Object.keys(S.tests).length >= 5 || activePains().length > 0],
    ['🚴', 'Fahrten importieren, FTP eintragen', 'FIT-Dateien oder ZIP aus intervals.icu', 'goRide', S.rides.length > 0 && !!S.settings.ftp],
    ['🗓️', 'Woche planen', 'Ein Vorschlag ist mit einem Tippen erstellt', 'plan', planOn()]];
  const done = st.filter(x => x[4]).length;
  if (done === st.length) return '';
  return `<div class="section-t">Erste Schritte<span class="muted">${done} von ${st.length}</span></div>
    <div class="card list">${st.map(x => `<button class="li${x[4] ? ' dn' : ''}" data-act="${x[3]}"><span class="ic">${x[4] ? '✅' : x[0]}</span><span class="bd"><b>${x[1]}</b><small>${x[2]}</small></span>${x[4] ? '' : '<span class="go">›</span>'}</button>`).join('')}</div>
    <button class="lnk" data-act="introOff" style="margin:8px 4px 0;font-size:13px;color:var(--t3)">Ausblenden</button>`;
}

Object.assign(ACT, {
  plan() { planSheet(); },
  planAuto() { const go = () => { S.plan = { days: planSuggest(), since: (S.plan && S.plan.since) || today() }; save(); sheetBody(planBody()); toast('Vorschlag erstellt – passe ihn frei an'); }; if (planOn()) confirmSheet('Den bestehenden Plan durch einen neuen Vorschlag ersetzen?', 'Ersetzen', go); else go(); },
  planClear() { confirmSheet('Wochenplan leeren?', 'Leeren', () => { S.plan = { days: [[], [], [], [], [], [], []] }; save(); sheetBody(planBody()); }); },
  planRm(el) { planDays()[+el.dataset.d].splice(+el.dataset.n, 1); save(); sheetBody(planBody()); },
  planAdd(el) { pa = { d: +el.dataset.d, k: 'kraft' }; openSheet({ title: PD[pa.d], left: 'Zurück', body: planAddBody(), onClose() { pa = null; } }); },
  planK(el) { pa.k = el.dataset.v; sheetBody(planAddBody()); },
  planPick(el) { const d = planDays()[pa.d], it = pa.k === 'rest' ? { k: 'rest' } : { k: pa.k, id: el.dataset.id }; if (pa.k === 'rest') d.length = 0; else { const i = d.findIndex(x => x.k === 'rest'); if (i >= 0) d.splice(i, 1); } d.push(it); if (!S.plan.since) S.plan.since = today(); save(); closeSheet(); sheetBody(planBody()); },
  cal() { calSheet(); },
  calNav(el) { const c = ui.cal, d = new Date(c.y, c.m + +el.dataset.d, 1); c.y = d.getFullYear(); c.m = d.getMonth(); c.sel = null; sheetBody(calBody()); },
  calDay(el) { ui.cal.sel = el.dataset.v; const y = $('.sheet-body', topSheet()).scrollTop; sheetBody(calBody()); $('.sheet-body', topSheet()).scrollTop = y; },
  report() { reportSheet(); },
  repNav(el) { ui.rep = Math.min(0, ui.rep + +el.dataset.d); sheetBody(reportBody()); },
  introOff() { S.settings.intro = 1; save(true); keepScroll(render); },
  goRide() { go('ride'); }
});
