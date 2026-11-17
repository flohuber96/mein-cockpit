'use strict';
/* ═══ HEUTE (Überblick + Wohlbefinden) · Einstellungen · Online-Datenbank · Start ═══ */

const TOPIC_RT = { lowback: 'r_back', hip: 'r_hip', shoulder: 'r_shoulder', posterior: 'r_post', neck: 'r_neck', ankle: 'r_ankle' };

// Was heute am meisten bringt – höchstens drei Vorschläge
function recos() {
  const out = [], now = new Date(), t0 = fromKey(today()).getTime(), w0 = weekStart().getTime();
  const todayActs = acts().filter(a => a.ts >= t0), did = k => todayActs.some(a => a.k === k);
  const wk = periodStats(w0, w0 + 7 * DAY), pains = activePains(), rd = readiness(today()), tired = rd != null && rd < 45;
  const rt = (id, why) => { const r = getRoutine(id); if (r && !out.some(o => o.id === id)) out.push({ e: r.e, t: r.n, d: why, act: 'rt', id, btn: `▶ ${rtMin(r)} min` }); };
  if (S.active) out.push({ e: '🏋️', t: 'Workout läuft noch', d: S.active.n, act: 'wOpen', id: '', btn: 'Fortsetzen' });
  if (did('ride') && !did('mob')) rt('r_bike', 'Du bist heute gefahren – jetzt Hüftbeuger, Brust und BWS öffnen.');
  if (!did('mob')) {
    const strong = pains.find(([, p]) => p.lvl >= 4);
    const tp = strong ? painTopics(strong[0]).find(k => TOPIC_RT[k]) : null;
    if (tired) rt('r_evening', 'Deine Tagesform ist niedrig – heute nur sanft bewegen und früh schlafen.');
    else if (tp) rt(TOPIC_RT[tp], `Wegen deiner Beschwerde: ${nm(strong[0])} (${strong[1].lvl}/10).`);
    else if (planRoutine()) rt('r_plan', 'Deine persönliche Routine aus dem Körper-Check.');
    else rt(now.getHours() < 11 ? 'r_morning' : now.getHours() >= 20 ? 'r_evening' : 'r_hip', 'Ein paar Minuten täglich bringen mehr als eine lange Einheit pro Woche.');
  }
  const lastK = S.sessions.filter(s => s.k === 'kraft').reduce((m, s) => Math.max(m, s.s), 0);
  if (!S.active && !tired && !did('kraft') && wk.kraft < S.settings.goalK && (!lastK || now - lastK > 1.5 * DAY)) {
    const lastTpl = (S.sessions.filter(s => s.k === 'kraft').sort((a, b) => b.s - a.s)[0] || {}).tpl;
    const t = planTemplate() && lastTpl !== 't_plan' ? planTemplate() : getTemplate(lastTpl === 't_rad_a' ? 't_rad_b' : 't_rad_a');
    out.push({ e: t.e, t: t.n + (t.sub ? ' · ' + t.sub : ''), d: (rd != null && rd >= 75 ? 'Du bist in guter Form – ' : '') + `noch ${S.settings.goalK - wk.kraft} von ${S.settings.goalK} Krafteinheiten diese Woche.`, act: 'tpl', id: t.id, btn: `${tplMin(t)} min` });
  }
  if (scoreOf(S.tests) == null && !pains.length) out.push({ e: '📋', t: 'Körper-Check machen', d: 'Beschwerden markieren und Selbsttests – daraus entsteht dein persönlicher Plan.', act: 'goCheck', id: '', btn: 'Start' });
  return out.slice(0, 3);
}

VIEWS.home = {
  title: 'Heute',
  sub() { const d = new Date(); return `${DAYS[d.getDay()]}, ${fmtDate(d)}`; },
  actions: () => '<button class="hbtn" data-act="settings" aria-label="Einstellungen">⚙︎</button>',
  render() {
    const w0 = weekStart().getTime(), wk = periodStats(w0, w0 + 7 * DAY), sc = scoreOf(S.tests), pains = activePains(), P = buildPlan();
    const list = acts(), rec = recos(), empty = !list.length && sc == null && !pains.length;
    const byDay = {}; list.forEach(a => { const k = dkey(new Date(a.ts)); (byDay[k] = byDay[k] || []).push(a.k); });
    const days = []; for (let i = 0; i < 7; i++) { const d = new Date(w0 + i * DAY + 12 * 36e5), k = dkey(d), ks = [...new Set(byDay[k] || [])]; days.push(`<div class="d${k === today() ? ' today' : ''}">${DAYS_S[d.getDay()]}<div class="dots">${ks.length ? ks.map(x => ACT_ICO[x] || '🏃').join('') : '<i></i>'}</div></div>`); }
    const goal = (lbl, v, g, extra) => `<div style="flex:1;min-width:0"><b style="display:block;font-size:13.5px;white-space:nowrap">${lbl}</b><div class="meter" style="margin:5px 0 4px"><i style="width:${g ? Math.min(100, Math.round(v / g * 100)) : v ? 100 : 0}%"></i></div><span class="small muted">${v}${g ? ' von ' + g : ''}${extra || ''}</span></div>`;
    const top = Object.entries(P.f).filter(([id]) => info(id)).map(([id, v]) => ({ id, v, tot: v.tight + v.weak })).sort((a, b) => b.tot - a.tot).slice(0, 3);
    const seg = `<div class="seg">${[['over', 'Überblick'], ['well', 'Wohlbefinden']].map(([k, n]) => `<button data-act="hSub" data-v="${k}" class="${ui.home.sub === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    if (ui.home.sub === 'well') return seg + wellPage();
    return seg + `
      ${empty ? `<div class="card pad" style="margin-bottom:10px"><div class="h1">Willkommen 👋</div><p class="p" style="margin-top:6px">Fünf Bereiche, ein Ziel: verstehen, wie dein Körper zusammenhängt, Baustellen finden und gezielt dagegen trainieren – Kraft, Mobility, Körper, Rad und Wohlbefinden.</p></div>` : ''}
      ${wellCard()}
      ${introHTML()}
      ${planOn() ? todayPlanHTML() : ''}
      ${(() => { const pl = planOn(), ids = pl ? planDays()[todayIdx()].map(it => itemInfo(it).id) : [], r2 = pl ? rec.filter(r => r.act !== 'tpl' && !ids.includes(r.id)).slice(0, 2) : rec;
        return r2.length ? `<div class="section-t">${pl ? 'Außerdem sinnvoll' : 'Empfehlung für heute'}${pl ? '' : '<button data-act="plan">🗓️ Woche planen</button>'}</div><div class="card list">${r2.map(r => `<button class="li" data-act="${r.act}" data-id="${esc(r.id)}"><span class="ic">${r.e}</span><span class="bd"><b>${esc(r.t)}</b><small>${esc(r.d)}</small></span><span class="tag acc">${esc(r.btn)}</span></button>`).join('')}</div>` : pl ? '' : `<div class="card pad" style="margin:10px 0 0"><b>Für heute alles erledigt ✅</b><p class="small muted">Erholung gehört zum Training.</p></div>`; })()}
      <div class="section-t">Diese Woche<span class="muted">${streak() ? '🔥 ' + plural(streak(), 'Tag', 'Tage') + ' in Folge' : ''}</span></div>
      <div class="card pad"><div class="week" style="margin-bottom:12px">${weekStripHTML()}</div>
        <div class="row" style="gap:14px;align-items:flex-start">${goal('🏋️ Kraft', wk.kraft, S.settings.goalK)}${goal('🧘 Mobility', wk.mob, S.settings.goalM)}${goal('🚴 Rad', wk.rides ? num(wk.rideMin / 60) : 0, 0, wk.rides ? ' h' : '')}</div>
        <div class="tri3"><button data-act="plan">🗓️ Wochenplan</button><button data-act="cal">📅 Kalender</button><button data-act="report">📊 Bericht</button></div></div>
      <div class="section-t">Dein Körper<button data-act="goCheck">Zum Check ›</button></div>
      <div class="card pad"><div class="row" style="justify-content:flex-start;gap:14px">
        ${ring(64, 7, sc == null ? 0 : sc / 100, scoreCol(sc), `<span style="font-size:20px;color:${scoreCol(sc)}">${sc == null ? '–' : sc}</span>`)}
        <div style="flex:1;min-width:0">${sc == null && !pains.length ? '<b>Noch kein Check</b><p class="small muted">17 kurze Selbsttests zeigen, was verkürzt und was schwach ist.</p>' : `<b>${sc == null ? 'Score offen' : 'Körper-Score ' + sc}</b><p class="small muted">${plural(Object.keys(S.tests).length, 'Test', 'Tests')} · ${plural(pains.length, 'Beschwerde', 'Beschwerden')}</p>`}</div></div>
        ${pains.length || top.length ? `<div class="chips" style="margin-top:12px">${pains.slice(0, 3).map(([id]) => chip(id, 'pain')).join('')}${top.filter(x => !S.pains[x.id]).map(x => chip(x.id, x.v.tight >= x.v.weak ? 'tight' : 'weak')).join('')}</div>` : ''}</div>
      ${S.rides.length ? (() => { const P = pmc(), l = P.days[P.days.length - 1]; if (!l) return ''; const z = fzone(l.tsb), wk7 = sumRides(ridesIn(Date.now() - 7 * DAY, Date.now() + DAY)); return `<div class="section-t">Rad<button data-act="tab" data-view="ride">Analyse ›</button></div>
      <button class="card pad" data-act="tab" data-view="ride" style="display:block;width:100%"><div class="stats k3" style="gap:4px"><div class="stat" style="padding:0"><small>Fitness</small><b style="color:var(--acc-t)">${Math.round(l.ctl)}</b></div><div class="stat" style="padding:0"><small>Form</small><b style="color:${z[1]}">${l.tsb > 0 ? '+' : ''}${Math.round(l.tsb)}</b></div><div class="stat" style="padding:0"><small>7 Tage</small><b>${hTxt(wk7.min)}<i>h</i></b></div></div>
        <p class="small muted" style="margin-top:8px;text-align:left"><b style="color:var(--t1)">${z[2]}.</b> ${esc(z[3])}</p></button>`; })() : ''}
      ${list.length ? `<div class="section-t">Zuletzt<button data-act="cal">Kalender ›</button></div><div class="card list">${list.slice(0, 3).map(actRow).join('')}</div>` : ''}
      <p class="note">Allgemeines Trainingswissen, keine medizinische Diagnose.</p>`;
  }
};

/* ── Einstellungen ── */
function settingsBody() {
  const s = S.settings;
  const st = (k, lbl, v, unit, step) => `<div class="setting"><span class="lbl">${lbl}</span><div class="stepper" style="grid-template-columns:38px 64px 38px;min-height:40px"><button data-act="setStep" data-k="${k}" data-d="-${step}">−</button><b style="font-size:16px">${v}<small>${unit}</small></b><button data-act="setStep" data-k="${k}" data-d="${step}">＋</button></div></div>`;
  const tg = (k, lbl, off) => { const on = off ? s[k] === true : s[k] !== false; return `<div class="setting"><span class="lbl">${lbl}</span><div class="seg sm"><button data-act="setTog" data-k="${k}" data-v="1" class="${on ? 'on' : ''}">An</button><button data-act="setTog" data-k="${k}" data-v="0" class="${on ? '' : 'on'}">Aus</button></div></div>`; };
  return `<div class="section-t" style="margin-top:4px">Wochenziele</div><div class="card">${st('goalK', '🏋️ Krafteinheiten', s.goalK, '×', 1)}${st('goalM', '🧘 Mobility-Einheiten', s.goalM, '×', 1)}</div>
    <div class="section-t">Timer</div><div class="card">${st('rest', 'Satzpause', s.rest, 's', 15)}${st('prep', 'Vorlauf im Player', s.prep, 's', 1)}${tg('sound', 'Signalton')}${canSpeak() ? tg('voice', 'Ansage in Routinen', true) : ''}${tg('vib', 'Vibration')}</div>
    <div class="section-t">Training</div><div class="card menu"><button data-act="gear"><span class="ico">🧰</span>Meine Ausrüstung<span class="muted" style="margin-left:auto;font-size:14px">${esc(GP[gearState().p].n)} ›</span></button></div>
    <div class="section-t">Darstellung</div><div class="card"><div class="setting"><span class="lbl">Design</span><div class="seg sm">${[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button data-act="setTheme" data-v="${k}" class="${s.theme === k ? 'on' : ''}">${n}</button>`).join('')}</div></div></div>
    ${window.Cloud ? Cloud.section() : ''}
    <div class="section-t">Daten</div>
    <div class="card menu"><button data-act="dataExport"><span class="ico">⬇️</span>Sicherung herunterladen</button><button data-act="dataImport"><span class="ico">⬆️</span>Sicherung einspielen</button><button data-act="dataWipe" class="red"><span class="ico">🗑️</span>Alles löschen</button></div>
    <input type="file" id="impFile" accept=".json,application/json" hidden>
    <div class="card menu"><a href="../" style="display:flex;align-items:center;gap:12px;padding:15px 16px;color:inherit;text-decoration:none"><span class="ico">⚡</span>Zum Performance Cockpit</a></div>
    <p class="note">Körper-Coach · Inhalte sind allgemeines Trainingswissen und ersetzen keine ärztliche oder physiotherapeutische Untersuchung.</p>`;
}
function openSettings() { openSheet({ title: 'Einstellungen', body: settingsBody() }); }
function askText(title, label, value, onOk) {
  openSheet({ title, left: 'Abbrechen', body: `<div class="field"><label>${esc(label)}</label><input type="text" id="askIn" value="${esc(value)}"></div><button class="btn primary" data-act="askOk">Speichern</button>` });
  pending.ask = onOk;
}
const bulkOk = () => { if (window.Cloud && Cloud.allowBulkDelete) Cloud.allowBulkDelete(); }; // gewollte Massenlöschung ankündigen
const exportData = () => { const o = {}; ['v', 'sid', 'pains', 'painLog', 'tests', 'testv', 'snaps', 'sessions', 'routines', 'templates', 'rides', 'favs', 'well', 'gear', 'plan', 'settings'].forEach(k => { o[k] = S[k]; }); return o; };
document.addEventListener('change', e => {
  if (e.target.id !== 'impFile' || !e.target.files[0]) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const j = JSON.parse(String(fr.result));
      if (!j || typeof j !== 'object' || !Array.isArray(j.sessions)) throw new Error('x');
      confirmSheet('Sicherung einspielen? Die aktuellen Daten auf diesem Gerät werden ersetzt.', 'Einspielen', () => { bulkOk(); S = migrate(Object.assign({}, j, { active: null, ui: S.ui })); save(); applyTheme(); closeAllSheets(); render(); toast('Sicherung eingespielt'); });
    } catch (err) { toast('Das ist keine gültige Sicherungsdatei'); }
  };
  fr.readAsText(e.target.files[0]);
});

Object.assign(ACT, {
  settings() { openSettings(); },
  hSub(el) { ui.home.sub = el.dataset.v; render(); window.scrollTo(0, 0); },
  setStep(el) {
    const k = el.dataset.k, lim = { goalK: [0, 7], goalM: [0, 14], rest: [15, 600], prep: [0, 15] }[k];
    S.settings[k] = Math.max(lim[0], Math.min(lim[1], S.settings[k] + +el.dataset.d)); save(); sheetBody(settingsBody()); render();
  },
  setTog(el) { S.settings[el.dataset.k] = el.dataset.v === '1'; save(); sheetBody(settingsBody()); if (el.dataset.k === 'sound' && S.settings.sound) beep(880, 0.1); if (el.dataset.k === 'voice' && S.settings.voice) say('Ansage ist an.'); },
  setTheme(el) { S.settings.theme = el.dataset.v; save(true); applyTheme(); sheetBody(settingsBody()); },
  askOk() { const v = $('#askIn').value.trim(), fn = pending.ask; pending.ask = null; closeSheet(); if (v && fn) fn(v); },
  dataExport() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(exportData(), null, 1)], { type: 'application/json' }));
    a.download = `koerper-coach-${today()}.json`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  dataImport() { const f = $('#impFile'); if (f) { f.value = ''; f.click(); } },
  dataWipe() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Daten löschen – auch in der Online-Datenbank und auf allen verbundenen Geräten? Das kann nicht rückgängig gemacht werden.' : 'Alle Daten auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.', 'Alles löschen', () => {
      const keep = S.settings, sid = S.sid; bulkOk(); S = fresh(); S.settings = keep; S.sid = sid; save(); closeAllSheets(); closeFull(); restStop(); render(); toast('Alles gelöscht');
    });
  }
});

/* ───────── Start ───────── */
if (S.active) ui.fullMin = true; // laufendes Workout nach Neuladen als Leiste anzeigen
render();
let lastDay = today();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  clocks.forEach(tickClock);
  if (lastDay !== today() && !sheetStack.length && $('#full').hidden) { lastDay = today(); render(); }
});

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
const CLOUD_ARR = { session: ['w:', 'sessions'], ride: ['b:', 'rides'], snap: ['s:', 'snaps'], routine: ['r:', 'routines'], template: ['t:', 'templates'] };
const SYNC_SET = ['rest', 'prep', 'goalK', 'goalM', 'ftp', 'kg', 'lthr', 'sex'];
if (window.Cloud) Cloud.init({
  app: 'koerper',
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(CLOUD_ARR)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    for (const id of Object.keys(S.pains)) m['p:' + id] = { kind: 'pain', data: S.pains[id] };
    for (const d of Object.keys(S.well)) m['d:' + d] = { kind: 'well', data: S.well[d] };
    m.tests = { kind: 'tests', data: S.tests, soft: !Object.keys(S.tests).length };
    m.testv = { kind: 'testv', data: S.testv || {}, soft: !Object.keys(S.testv || {}).length };
    for (const id of Object.keys(S.painLog || {})) m['q:' + id] = { kind: 'plog', data: S.painLog[id] };
    m.favs = { kind: 'favs', data: S.favs, soft: !Object.keys(S.favs).length };
    m.plan = { kind: 'plan', data: { days: planDays(), since: S.plan.since || null }, soft: !planOn() };
    const g = gearState(); m.gear = { kind: 'gear', data: g, soft: g.p === 'all' && JSON.stringify(g.sets) === JSON.stringify(X.GEAR_PRESETS) };
    const st = {}, def = fresh().settings; SYNC_SET.forEach(k => { st[k] = S.settings[k]; });
    m.settings = { kind: 'settings', data: st, soft: SYNC_SET.every(k => st[k] === def[k]) };
    return m;
  },
  apply(r) {
    if (CLOUD_ARR[r.kind]) {
      const arr = S[CLOUD_ARR[r.kind][1]], rid = r.id.slice(2), i = arr.findIndex(x => String(x.id) === rid);
      if (r.deleted) { if (i >= 0) arr.splice(i, 1); } else if (r.data && typeof r.data === 'object') { if (i >= 0) arr[i] = r.data; else arr.push(r.data); }
    } else if (r.kind === 'pain') { if (r.deleted) delete S.pains[r.id.slice(2)]; else if (r.data) S.pains[r.id.slice(2)] = r.data; }
    else if (r.kind === 'well') { if (r.deleted) delete S.well[r.id.slice(2)]; else if (r.data) S.well[r.id.slice(2)] = r.data; }
    else if (r.kind === 'tests') S.tests = r.deleted ? {} : (r.data || {});
    else if (r.kind === 'testv') S.testv = r.deleted ? {} : (r.data || {});
    else if (r.kind === 'plog') { S.painLog = S.painLog || {}; if (r.deleted) delete S.painLog[r.id.slice(2)]; else if (Array.isArray(r.data)) S.painLog[r.id.slice(2)] = r.data; }
    else if (r.kind === 'favs') S.favs = r.deleted ? {} : (r.data || {});
    else if (r.kind === 'gear' && r.data && !r.deleted && r.data.sets) S.gear = r.data;
    else if (r.kind === 'plan' && r.data && !r.deleted && Array.isArray(r.data.days)) S.plan = r.data;
    else if (r.kind === 'settings' && r.data && !r.deleted) Object.assign(S.settings, r.data);
  },
  // Wurde der lokale Speicher neu aufgebaut (z. B. vom iPhone geleert), gewinnt die Online-Datenbank
  storeId: () => S.sid, rebuilt: boot.rebuilt,
  // Sicherheitsnetz: verschwindet mehr, als übrig bleibt, wird erst nachgefragt statt online zu löschen
  guardDeletes(dels) {
    const left = S.sessions.length + S.rides.length + S.snaps.length + S.routines.length + S.templates.length + Object.keys(S.pains).length + Object.keys(S.well).length;
    return dels.length >= 15 && dels.length > left;
  },
  persist() { save(true); },
  refresh() { if (!$('#full').hidden) return; keepScroll(render); },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  openSettings() { closeAllSheets(); if (!$('#full').hidden) return; openSettings(); setTimeout(() => { const b = $('#cloudBox'); if (b) b.scrollIntoView({ behavior: 'smooth' }); }, 400); }
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
