'use strict';
/* ═══ KRAFT: Vorlagen · Workout-Tracking · Tier-Listen · Verlauf · Timer ═══ */

/* ── Vollbild-Helfer (Workout, Routine-Player) ── */
function openFull(html) { const f = $('#full'); f.innerHTML = html; f.hidden = false; document.body.classList.add('locked'); }
function closeFull() { const f = $('#full'); f.hidden = true; f.innerHTML = ''; if (!sheetStack.length) document.body.classList.remove('locked'); renderDock(); }

const getTemplate = id => id === 't_plan' ? planTemplate() : X.TEMPLATES.find(t => t.id === id) || S.templates.find(t => t.id === id) || null;
const tplMin = t => t.min || Math.round(t.items.reduce((a, it) => a + it.s * ((it.sec || 40) + (it.rest || 60)), 0) / 60);
const targetTxt = it => `${it.s} × ${it.sec ? it.sec + ' s' : it.r || '–'}`;

VIEWS.train = {
  title: 'Kraft',
  sub() { const w = weekStart(), st = periodStats(w.getTime(), w.getTime() + 7 * DAY); return `${st.kraft}/${S.settings.goalK} Krafteinheiten diese Woche`; },
  actions: () => '<button class="hbtn" data-act="timer" aria-label="Timer">⏱</button>',
  render() {
    const t = ui.train;
    return `<div class="seg">${[['start', 'Start'], ['lib', 'Übungen'], ['log', 'Verlauf']].map(([k, n]) => `<button data-act="tSub" data-v="${k}" class="${t.sub === k ? 'on' : ''}">${n}</button>`).join('')}</div>` +
      (t.sub === 'start' ? tStart() : t.sub === 'lib' ? tLib() : tLog());
  }
};

/* ── Start ── */
function tStart() {
  const plan = planTemplate();
  const row = t => `<button class="li" data-act="tpl" data-id="${esc(t.id)}"><span class="ic">${t.e || '📋'}</span><span class="bd"><b>${esc(t.n)}</b><small class="clip">${esc(t.sub || 'Eigene Vorlage')}</small></span><span class="rt">${tplMin(t)} min<br>${t.items.length} Üb.</span></button>`;
  return `
    ${S.active ? `<button class="btn primary" data-act="wOpen" style="margin-bottom:10px">▶ Laufendes Workout fortsetzen</button>` : ''}
    ${plan ? `<div class="section-t" style="margin-top:6px">Für dich</div><div class="card list">${row(plan)}</div>` : `<div class="card pad" style="margin-bottom:4px"><div class="row"><span style="font-size:28px">🎯</span><span style="flex:1"><b>Persönlicher Kraft-Plan</b><br><span class="small muted">Mach den Körper-Check – dann stellt die App dir ein Programm zusammen.</span></span></div><button class="btn soft sm" data-act="goCheck" style="margin-top:10px;width:100%">Zum Check</button></div>`}
    <div class="section-t">Vorlagen</div><div class="card list">${X.TEMPLATES.map(row).join('')}</div>
    ${S.templates.length ? `<div class="section-t">Eigene Vorlagen</div><div class="card list">${S.templates.map(row).join('')}</div>` : ''}
    <div class="stack" style="margin-top:14px">
      <button class="btn soft" data-act="wFree">＋ Freies Workout starten</button>
      <button class="btn plain" data-act="sportNew">🏃 Andere Aktivität eintragen</button>
      <button class="btn plain" data-act="timer">⏱ Timer (Pause · Intervall · Stoppuhr)</button>
    </div>`;
}
function tplSheet(id) {
  const t = getTemplate(id); if (!t) { toast('Mach zuerst den Körper-Check'); return; }
  const custom = S.templates.some(x => x.id === id);
  openSheet({
    title: t.n, body: `<p class="p" style="margin:0 4px 12px">${esc(t.d || 'Eigene Vorlage')}</p>
      <div class="card list">${t.items.map(it => exRow(it.x, { rt: targetTxt(it), sub: t.why && t.why[it.x] ? t.why[it.x] : `Pause ${it.rest || S.settings.rest} s` })).join('')}</div>
      <div class="stack" style="margin-top:14px"><button class="btn primary" data-act="wStart" data-id="${esc(id)}">▶ Workout starten</button>
      ${custom ? `<button class="btn danger" data-act="tplDel" data-id="${esc(id)}">Vorlage löschen</button>` : ''}</div>
      <p class="note">Vorher kurz aufwärmen: 5 Minuten Mobility („Aufwärmen vor dem Krafttraining“) reichen.</p>`
  });
}

/* ── Workout ── */
const numVal = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
function newSets(e, it) {
  const last = exHistory(e.id)[0], n = it.s || 3, out = [];
  const rDef = it.r ? parseInt(it.r, 10) || null : null;
  for (let i = 0; i < n; i++) {
    const p = last ? (last.sets[i] || last.sets[last.sets.length - 1]) : null;
    out.push({ w: p && p.w != null ? p.w : null, r: p && p.r != null ? p.r : rDef, t: e.tr === 't' || e.tr === 'wt' ? (it.sec || (p && p.t) || e.hold) : null, done: false });
  }
  return out;
}
function startWorkout(t) {
  const begin = () => {
    S.active = { id: uid(), n: t ? t.n : 'Freies Workout', tpl: t ? t.id : null, s: Date.now(),
      ex: (t ? t.items : []).filter(it => E[it.x]).map(it => ({ x: it.x, tg: targetTxt(it), rest: it.rest || S.settings.rest, sets: newSets(E[it.x], it) })) };
    ui.fullMin = false; save(true); closeAllSheets(); wake(true); renderWorkout();
    if (!t) openPicker({ title: 'Übung hinzufügen', act: 'wAddEx' });
  };
  if (S.active) confirmSheet('Es läuft bereits ein Workout. Verwerfen und neu starten?', 'Neu starten', begin); else begin();
}
function setRow(e, x, xi, s, si) {
  const f = (k, unit, mode) => `<label><input inputmode="${mode}" data-in="wSet" data-f="${k}" value="${s[k] == null ? '' : String(s[k]).replace('.', ',')}" placeholder="–"><span>${unit}</span></label>`;
  const two = e.tr === 'wr' || e.tr === 'wt', timed = e.tr === 't' || e.tr === 'wt';
  return `<div class="set${two ? '' : ' one'}${s.done ? ' done' : ''}" data-si="${si}"><span class="n">${si + 1}</span>
    ${two ? f('w', 'kg', 'decimal') : ''}${timed ? f('t', 's', 'numeric') : f('r', 'Wdh', 'numeric')}
    <button class="ck" data-act="wCheck">${s.done ? '✓' : timed ? '▶' : '✓'}</button></div>`;
}
function renderWorkout() {
  const a = S.active; if (!a) return;
  const old = $('#full .fbody'), y = old ? old.scrollTop : 0;
  openFull(`<div class="fhead"><button class="lnk" data-act="wMin">‹ Minimieren</button><div class="ft"><b>${esc(a.n)}</b><small data-live="wtime">${fmtClock((Date.now() - a.s) / 1000)}</small></div><button class="lnk r" data-act="wFinish">Beenden</button></div>
    <div class="fbody" style="padding-bottom:110px">
      ${a.ex.map((x, xi) => {
        const e = E[x.x], last = exHistory(x.x)[0];
        return `<div class="card wx" data-xi="${xi}"><div class="wh">${tierB(e.tier, true)}<button class="bd" data-act="ex" data-id="${x.x}"><b>${esc(e.n)}</b><small>${esc(x.tg || e.dose)} · Pause ${x.rest} s</small></button><button class="hbtn" data-act="wExMenu" aria-label="Optionen">⋯</button></div>
          ${last ? `<div class="last">Letztes Mal (${fmtDay(last.ts)}): ${esc(last.sets.map(s => setTxt(e, s).replace(' kg', '')).join(' · '))}</div>` : ''}
          ${x.sets.map((s, si) => setRow(e, x, xi, s, si)).join('')}
          <div class="wf"><button data-act="wAddSet">＋ Satz</button><button data-act="wDelSet">− Satz</button></div></div>`;
      }).join('') || '<div class="empty"><div class="big">🏋️</div><b>Noch keine Übung</b>Füge deine erste Übung hinzu.</div>'}
      <div class="stack"><button class="btn soft" data-act="wPick">＋ Übung hinzufügen</button><button class="btn primary" data-act="wFinish">Workout beenden</button><button class="btn danger" data-act="wDiscard">Workout verwerfen</button></div>
    </div><div id="fdock" class="dock"></div>`);
  $('#full .fbody').scrollTop = y;
  renderDock();
}
const wCtx = el => { const c = el.closest('.wx'), r = el.closest('.set'), xi = +c.dataset.xi; return { xi, x: S.active.ex[xi], si: r ? +r.dataset.si : null, row: r, card: c }; };
let holdClock = null;
function finishSet(xi, si) {
  const a = S.active, x = a.ex[xi], s = x.sets[si];
  s.done = true;
  const nx = x.sets[si + 1];
  if (nx && !nx.done) { if (nx.w == null && s.w != null) nx.w = s.w; if (nx.r == null && s.r != null) nx.r = s.r; }
  save(true); vib(12); renderWorkout();
  const more = a.ex.some(y => y.sets.some(z => !z.done));
  if (more) { const next = nx && !nx.done ? E[x.x].n + ' · Satz ' + (si + 2) : (a.ex[xi + 1] ? 'Als Nächstes: ' + E[a.ex[xi + 1].x].n : 'Pause'); restStart(x.rest, next); }
  else { restStop(); toast('Alle Sätze geschafft 💪 Workout beenden?', { label: 'Beenden', fn: () => ACT.wFinish() }); }
}
function finishWorkout() {
  const a = S.active; if (!a) return;
  const ex = a.ex.map(x => ({ x: x.x, sets: x.sets.filter(s => s.done).map(s => { const o = {}; ['w', 'r', 't'].forEach(k => { if (s[k] != null) o[k] = s[k]; }); return o; }) })).filter(x => x.sets.length);
  if (!ex.length) { ACT.wDiscard(); return; }
  const prs = [];
  ex.forEach(x => {
    const e = E[x.x], prev = exHistory(x.x).reduce((acc, h) => acc.concat(h.sets), []);
    const val = s => e.tr === 'wr' ? e1rm(s) : e.tr === 'wt' ? (s.w || 0) * 1000 + (s.t || 0) : e.tr === 't' ? (s.t || 0) : (s.r || 0);
    const pb = bestSet(e, prev), nb = bestSet(e, x.sets);
    if (pb && nb && val(nb) > val(pb)) prs.push(`${e.n}: ${setTxt(e, nb)}`);
  });
  const ses = { id: a.id, k: 'kraft', s: a.s, e: Date.now(), n: a.n, ex };
  if (a.tpl) ses.tpl = a.tpl;
  S.sessions.push(ses); S.active = null; save();
  if (holdClock) { holdClock.stop(); holdClock = null; }
  restStop(); wake(false); closeFull(); render();
  const sets = ex.reduce((n, x) => n + x.sets.length, 0), vol = ex.reduce((n, x) => n + x.sets.reduce((m, s) => m + (s.w || 0) * (s.r || 0), 0), 0);
  openSheet({
    title: 'Geschafft! 💪', body: `<div class="stats k3" style="margin-bottom:12px">
      <div class="card stat"><small>Dauer</small><b>${fmtMin((ses.e - ses.s) / 6e4)}</b></div><div class="card stat"><small>Sätze</small><b>${sets}</b></div><div class="card stat"><small>Volumen</small><b>${vol ? Math.round(vol) + '<i>kg</i>' : '–'}</b></div></div>
      ${prs.length ? `<div class="box ins" style="margin-bottom:12px"><div class="sec">🏆 Neue Bestwerte</div>${ul(prs, 'var(--acc)')}</div>` : ''}
      <div class="card list" style="margin-bottom:14px">${ex.map(x => exRow(x.x, { tier: false, sub: x.sets.map(s => setTxt(E[x.x], s).replace(' kg', '')).join(' · '), rt: x.sets.length + ' ×' })).join('')}</div>
      <div class="stack">${!a.tpl ? `<button class="btn soft" data-act="tplSave" data-id="${ses.id}">📋 Als Vorlage speichern</button>` : ''}
      <button class="btn plain" data-act="rt" data-id="r_post">🧘 Jetzt 9 min dehnen (Hintere Kette)</button><button class="btn primary" data-act="closeSheet">Fertig</button></div>`
  });
}

/* ── Übungs-Auswahl (auch für eigene Routinen) ── */
let pick = null;
function pickList() {
  const q = pick.q.trim().toLowerCase(), ord = 'SABCD';
  const xs = Object.values(E).filter(e => e.tier !== 'D' && (pick.types ? pick.types.includes(e.t) : true) && (q ? (e.n.toLowerCase().includes(q) || e.m.some(m => nm(m).toLowerCase().includes(q))) : (pick.grp === 'fav' ? S.favs[e.id] : e.tiers[pick.grp])))
    .sort((a, b) => ord.indexOf(q ? a.tier : a.tiers[pick.grp] || a.tier) - ord.indexOf(q ? b.tier : b.tiers[pick.grp] || b.tier) || a.n.localeCompare(b.n)).slice(0, 40);
  return xs.length ? `<div class="card list">${xs.map(e => exRow(e.id, { act: pick.act, tierOf: q || pick.grp === 'fav' ? null : pick.grp, rt: '＋' })).join('')}</div>` : '<div class="empty">Nichts gefunden.</div>';
}
function openPicker({ title, act, mob }) {
  const groups = mob ? X.MGROUPS : X.GROUPS;
  pick = { q: '', act, grp: Object.keys(groups)[0], types: mob ? null : ['kraft', 'akt'] };
  openSheet({
    title, onClose() { pick = null; }, body: `<div class="field"><input type="search" placeholder="🔍 Übung oder Muskel suchen" data-in="pickQ" autocomplete="off"></div>
      <div class="chiprow" id="pickGrps">${[['fav', { n: '★ Favoriten' }]].concat(Object.entries(groups)).map(([k, g]) => `<button class="chip${pick.grp === k ? ' on' : ''}" data-act="pickGrp" data-v="${k}">${g.e ? g.e + ' ' : ''}${esc(g.n)}</button>`).join('')}</div>
      <div id="pickList">${pickList()}</div>`
  });
}
IN.pickQ = el => { if (!pick) return; pick.q = el.value; $('#pickList').innerHTML = pickList(); };

/* ── Tier-Listen ── */
function tLib() {
  const t = ui.train, f = profile();
  const weak = Object.keys(f).filter(id => f[id].weak);
  const chips = [['you', { n: '🎯 Für dich' }], ['fav', { n: '★ Favoriten' }]].concat(Object.entries(X.GROUPS));
  let list;
  if (t.grp === 'you') {
    const ord = 'SABCD', xs = Object.values(E).filter(e => e.t !== 'mob' && 'SAB'.includes(e.tier) && e.m.some(m => weak.includes(m)) && (!t.home || !e.eq)).sort((a, b) => ord.indexOf(a.tier) - ord.indexOf(b.tier));
    list = xs.length ? `<p class="small muted" style="margin:0 4px 8px">Übungen für das, was in deinen Tests schwach war: ${esc(weak.map(nm).join(', '))}.</p><div class="card list">${xs.slice(0, 14).map(e => exRow(e.id, { sub: e.m.filter(m => weak.includes(m)).map(nm).join(', ') })).join('')}</div>`
      : '<div class="card empty"><div class="big">🎯</div><b>Noch keine Daten</b>Mach die Selbsttests im Körper-Check – dann erscheinen hier die Übungen, die dir am meisten bringen.<button class="btn soft sm" data-act="goCheck" style="margin:12px auto 0">Zum Check</button></div>';
  } else if (t.grp === 'fav') {
    const xs = Object.keys(S.favs).filter(id => E[id] && E[id].t !== 'mob');
    list = xs.length ? `<div class="card list">${xs.map(id => exRow(id)).join('')}</div>` : '<div class="card empty"><div class="big">☆</div>Noch keine Favoriten. Öffne eine Übung und tippe auf „Als Favorit merken“.</div>';
  } else list = tierList(t.grp, e => e.t !== 'mob' && (!t.home || !e.eq));
  return `<div class="chiprow">${chips.map(([k, g]) => `<button class="chip${t.grp === k ? ' on' : ''}" data-act="tGrp" data-v="${k}">${g.e ? g.e + ' ' : ''}${esc(g.n)}</button>`).join('')}</div>
    <div class="row" style="margin:0 4px 4px"><button class="chip${t.home ? ' on' : ''}" data-act="tHome">🏠 nur ohne Geräte</button><button class="lnk" data-act="rules" data-v="kraft">Wie lese ich das?</button></div>
    ${list}`;
}
function rulesSheet(k) {
  openSheet({
    title: 'Tier-Ranking', body: `<p class="p" style="margin:0 4px 12px">Jede Übung ist für ihren Zielbereich eingestuft – nach <b style="color:var(--t1)">Wirkung</b>, <b style="color:var(--t1)">Sicherheit</b>, <b style="color:var(--t1)">Steigerbarkeit</b> und Nutzen als Ausgleich zum Radfahren. Die Einstufung ist eine Orientierung, kein Gesetz: Die beste Übung ist die, die du regelmäßig und schmerzfrei machst.</p>
      <div class="card list" style="margin-bottom:14px">${Object.entries(X.TIERS).map(([t, v]) => `<div class="li">${tierB(t)}<span class="bd"><b>${v.t}</b><small>${v.d}</small></span></div>`).join('')}</div>
      <div class="card pad"><div class="sec">${k === 'mob' ? 'Grundregeln Dehnen & Mobility' : 'Grundregeln Krafttraining'}</div>${ul(X.RULES[k], 'var(--acc)')}</div>`
  });
}

/* ── Verlauf ── */
function tLog() {
  const w = weekStart().getTime(), st = periodStats(w, w + 7 * DAY), list = acts().filter(a => a.k !== 'ride');
  const best = {};
  S.sessions.forEach(s => { if (s.k === 'kraft') s.ex.forEach(x => { const e = E[x.x]; if (!e || e.tr !== 'wr') return; const b = bestSet(e, x.sets); if (b && b.w && (!best[x.x] || e1rm(b) > e1rm(best[x.x]))) best[x.x] = b; }); });
  const bl = Object.entries(best).sort((a, b) => e1rm(b[1]) - e1rm(a[1])).slice(0, 8);
  return `<div class="stats k3"><div class="card stat"><small>Kraft</small><b>${st.kraft}<i>/ ${S.settings.goalK}</i></b><span>diese Woche</span></div><div class="card stat"><small>Mobility</small><b>${st.mob}<i>/ ${S.settings.goalM}</i></b><span>${fmtMin(st.mobMin)}</span></div><div class="card stat"><small>Serie</small><b>${streak()}<i>Tage</i></b><span>in Folge aktiv</span></div></div>
    ${bl.length ? `<div class="section-t">Bestwerte</div><div class="card list">${bl.map(([id, b]) => exRow(id, { tier: false, sub: `geschätztes Maximum ${Math.round(e1rm(b))} kg`, rt: `${num(b.w)} × ${b.r}` })).join('')}</div>` : ''}
    <div class="section-t">Einheiten<span class="muted">${list.length}</span></div>
    ${list.length ? `<div class="card list">${list.slice(0, 60).map(actRow).join('')}</div>` : '<div class="card empty"><div class="big">📒</div><b>Noch nichts eingetragen</b>Starte ein Workout oder eine Mobility-Routine – hier siehst du dann deinen Fortschritt.</div>'}`;
}
function sessionSheet(id) {
  const s = S.sessions.find(x => x.id === id); if (!s) return;
  const d = new Date(s.s);
  let body = `<p class="p" style="margin:0 4px 12px">${DAYS[d.getDay()]}, ${fmtDate(d)} · ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr</p>`;
  if (s.k === 'kraft') body += `<div class="card list">${s.ex.map(x => E[x.x] ? exRow(x.x, { tier: false, sub: x.sets.map(z => setTxt(E[x.x], z).replace(' kg', '')).join(' · '), rt: x.sets.length + ' ×' }) : '').join('')}</div>
    <div class="stack" style="margin-top:14px"><button class="btn soft" data-act="wRepeat" data-id="${esc(id)}">↻ Nochmal so trainieren</button>`;
  else body += `<div class="card pad"><div class="row"><span class="muted">Dauer</span><b>${fmtMin(s.k === 'mob' ? (s.sec || 0) / 60 : s.min || 0)}</b></div>${s.cnt ? `<div class="row" style="margin-top:6px"><span class="muted">Übungen</span><b>${s.cnt}</b></div>` : ''}${s.note ? `<p class="p" style="margin-top:8px">${esc(s.note)}</p>` : ''}</div><div class="stack" style="margin-top:14px">`;
  openSheet({ title: s.n || 'Einheit', body: body + `<button class="btn danger" data-act="sesDel" data-id="${esc(id)}">Eintrag löschen</button></div>` });
}
const SPORTS = ['Laufen', 'Schwimmen', 'Wandern', 'Yoga', 'Klettern', 'Ballsport', 'Ski', 'Sonstiges'];
let sport = null;
function sportSheet() {
  sport = { n: SPORTS[0] };
  openSheet({
    title: 'Aktivität eintragen', left: 'Abbrechen', right: '<button class="lnk r" data-act="sportSave">Speichern</button>', onClose() { sport = null; },
    body: `<div class="field"><label>Was?</label><div class="chips">${SPORTS.map(n => `<button class="chip${n === sport.n ? ' on' : ''}" data-act="sportPick" data-v="${n}">${n}</button>`).join('')}</div></div>
      <div class="field"><label>Dauer (Minuten)</label><input inputmode="numeric" id="spMin" placeholder="z. B. 45"></div>
      <div class="field"><label>Datum</label><input type="date" id="spDate" value="${today()}" max="${today()}"></div>
      <div class="field"><label>Notiz</label><input type="text" id="spNote" placeholder="optional"></div>
      <button class="btn primary" data-act="sportSave">Speichern</button>`
  });
}

/* ── Timer: Pause · Intervall · Stoppuhr ── */
const tm = { mode: 'rest', work: 30, pause: 15, rounds: 8, iv: null, sw: { acc: 0, t0: null }, tick: null };
function timerBody() {
  const st = (k, lbl, v, unit, step) => `<div class="field"><label>${lbl}</label><div class="stepper"><button data-act="tmStep" data-k="${k}" data-d="-${step}">−</button><b>${v}<small>${unit}</small></b><button data-act="tmStep" data-k="${k}" data-d="${step}">＋</button></div></div>`;
  let h = `<div class="seg">${[['rest', 'Pause'], ['iv', 'Intervall'], ['sw', 'Stoppuhr']].map(([k, n]) => `<button data-act="tmMode" data-v="${k}" class="${tm.mode === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  if (tm.mode === 'rest') h += `${st('rest', 'Satzpause', S.settings.rest, 's', 15)}
    <div class="chips" style="margin-bottom:14px">${[30, 45, 60, 90, 120, 180].map(s => `<button class="chip${S.settings.rest === s ? ' on' : ''}" data-act="tmRest" data-v="${s}">${s < 60 ? s + ' s' : s / 60 + ' min'}</button>`).join('')}</div>
    <button class="btn primary" data-act="tmRestGo">▶ Pause starten</button>
    <p class="note">Der Countdown läuft unten weiter, auch wenn du dieses Fenster schließt. Die Dauer gilt als Standard für neue Workouts.</p>`;
  else if (tm.mode === 'iv') h += tm.iv ? `<div class="timer-ph ${tm.iv.ph}" id="ivPh"></div><div class="timer-big" id="ivT">0:00</div><p class="p" style="text-align:center;margin-bottom:14px" id="ivR"></p>
      <div class="btns"><button class="btn plain" data-act="ivPause" id="ivPauseB">Pause</button><button class="btn danger" data-act="ivStop">Stopp</button></div>`
    : `${st('work', 'Belastung', tm.work, 's', 5)}${st('pause', 'Erholung', tm.pause, 's', 5)}${st('rounds', 'Runden', tm.rounds, '×', 1)}
      <div class="chips" style="margin-bottom:14px">${[['Tabata 20/10 × 8', 20, 10, 8], ['30/30 × 10', 30, 30, 10], ['40/20 × 6', 40, 20, 6], ['Jede Minute × 10', 60, 0, 10]].map(([n, w, p, r]) => `<button class="chip" data-act="ivPreset" data-w="${w}" data-p="${p}" data-r="${r}">${n}</button>`).join('')}</div>
      <button class="btn primary" data-act="ivStart">▶ Start · ${fmtMin(tm.rounds * (tm.work + tm.pause) / 60)}</button>`;
  else h += `<div class="timer-big" id="swT">${fmtSw()}</div><div class="btns" style="margin-top:14px"><button class="btn primary" data-act="swToggle">${tm.sw.t0 ? 'Stopp' : 'Start'}</button><button class="btn plain" data-act="swReset">Zurücksetzen</button></div>`;
  return h;
}
const swMs = () => tm.sw.acc + (tm.sw.t0 ? Date.now() - tm.sw.t0 : 0);
const fmtSw = () => { const ms = swMs(); return fmtClock(Math.floor(ms / 1000)) + ',' + Math.floor((ms % 1000) / 100); };
function ivPaint(l) {
  const iv = tm.iv; if (!iv || !$('#ivT')) return;
  $('#ivT').textContent = fmtClock(l != null ? l : iv.c ? iv.c.left() : 0);
  const ph = $('#ivPh'); ph.className = 'timer-ph ' + (iv.ph === 'work' ? 'work' : 'rest');
  ph.textContent = iv.ph === 'prep' ? 'Bereit machen' : iv.ph === 'work' ? 'Belastung' : 'Erholung';
  $('#ivR').textContent = `Runde ${iv.round} von ${tm.rounds}`;
}
function ivNext() {
  const iv = tm.iv; if (!iv) return;
  if (iv.ph === 'prep' || iv.ph === 'rest') { if (iv.ph === 'rest') iv.round++; iv.ph = 'work'; iv.c = clock(tm.work, ivPaint, ivNext); }
  else if (iv.round >= tm.rounds) { tm.iv = null; wake(false); toast('Intervalle geschafft 🔥'); if (topSheet()) sheetBody(timerBody()); return; }
  else if (tm.pause > 0) { iv.ph = 'rest'; iv.c = clock(tm.pause, ivPaint, ivNext); }
  else { iv.round++; iv.c = clock(tm.work, ivPaint, ivNext); }
}
function timerStopAll() { if (tm.iv) { tm.iv.c.stop(); tm.iv = null; } clearInterval(tm.tick); tm.tick = null; if (!S.active && !rest) wake(false); }
function timerSheet() {
  openSheet({ title: 'Timer', body: timerBody(), onClose: timerStopAll });
  tm.tick = setInterval(() => { const n = $('#swT'); if (n && tm.sw.t0) n.textContent = fmtSw(); }, 100);
}

Object.assign(ACT, {
  tSub(el) { ui.train.sub = el.dataset.v; render(); window.scrollTo(0, 0); },
  tGrp(el) { ui.train.grp = el.dataset.v; keepScroll(render); },
  tHome() { ui.train.home = !ui.train.home; keepScroll(render); },
  rules(el) { rulesSheet(el.dataset.v); },
  goCheck() { go('body', { sub: 'check' }); },
  tpl(el) { tplSheet(el.dataset.id); },
  tplDel(el) { confirmSheet('Diese Vorlage löschen?', 'Löschen', () => { S.templates = S.templates.filter(t => t.id !== el.dataset.id); save(); closeAllSheets(); render(); }); },
  tplSave(el) {
    const s = S.sessions.find(x => x.id === el.dataset.id); if (!s) return;
    askText('Als Vorlage speichern', 'Name der Vorlage', s.n === 'Freies Workout' ? 'Mein Workout' : s.n, name => {
      S.templates.push({ id: 'c_' + uid(), n: name, e: '📋', items: s.ex.map(x => { const e = E[x.x], l = x.sets[x.sets.length - 1]; return e.tr === 't' || e.tr === 'wt' ? { x: x.x, s: x.sets.length, sec: l.t || e.hold, rest: 60 } : { x: x.x, s: x.sets.length, r: String(l.r || 10), rest: S.settings.rest }; }) });
      save(); toast('Vorlage gespeichert'); render();
    });
  },
  wStart(el) { const t = getTemplate(el.dataset.id); if (t) startWorkout(t); },
  wFree() { startWorkout(null); },
  wRepeat(el) {
    const s = S.sessions.find(x => x.id === el.dataset.id); if (!s) return;
    startWorkout({ id: s.tpl || null, n: s.n, items: s.ex.filter(x => E[x.x]).map(x => ({ x: x.x, s: x.sets.length, r: String(x.sets[0].r || ''), sec: x.sets[0].t || null })) });
  },
  wOpen() { ui.fullMin = false; closeAllSheets(); renderWorkout(); },
  wMin() { ui.fullMin = true; closeFull(); render(); },
  wPick() { openPicker({ title: 'Übung hinzufügen', act: 'wAddEx' }); },
  pickGrp(el) { if (!pick) return; pick.grp = el.dataset.v; pick.q = ''; const q = $('[data-in="pickQ"]'); if (q) q.value = ''; $$('#pickGrps .chip').forEach(b => b.classList.toggle('on', b === el)); $('#pickList').innerHTML = pickList(); },
  wAddEx(el) {
    const e = E[el.dataset.id]; if (!e || !S.active) return;
    S.active.ex.push({ x: e.id, tg: e.dose, rest: e.t === 'akt' ? 45 : S.settings.rest, sets: newSets(e, { s: parseInt(e.dose, 10) || 3 }) });
    save(true); closeAllSheets(); ui.fullMin = false; renderWorkout(); toast(e.n + ' hinzugefügt');
    const b = $('#full .fbody'); if (b) b.scrollTop = b.scrollHeight;
  },
  wAddSet(el) { const { x } = wCtx(el), l = x.sets[x.sets.length - 1] || {}; x.sets.push({ w: l.w == null ? null : l.w, r: l.r == null ? null : l.r, t: l.t == null ? null : l.t, done: false }); save(true); renderWorkout(); },
  wDelSet(el) { const { x } = wCtx(el); if (x.sets.length > 1) { x.sets.pop(); save(true); renderWorkout(); } },
  wCheck(el) {
    const { xi, x, si } = wCtx(el), s = x.sets[si], e = E[x.x];
    if (s.done) { s.done = false; save(true); renderWorkout(); return; }
    const timed = e.tr === 't' || e.tr === 'wt';
    if (timed && !holdClock && s.t) {
      el.textContent = s.t;
      holdClock = clock(s.t, l => { const b = $(`#full .wx[data-xi="${xi}"] .set[data-si="${si}"] .ck`); if (b) b.textContent = l; }, () => { holdClock = null; finishSet(xi, si); });
      return;
    }
    if (holdClock) { holdClock.stop(); holdClock = null; }
    finishSet(xi, si);
  },
  wExMenu(el) {
    const { xi, x } = wCtx(el);
    openSheet({
      title: E[x.x].n, body: `<div class="field"><label>Pause zwischen den Sätzen</label><div class="stepper"><button data-act="wRest" data-i="${xi}" data-d="-15">−</button><b id="wRestV">${x.rest}<small>s</small></b><button data-act="wRest" data-i="${xi}" data-d="15">＋</button></div></div>
        <div class="stack"><button class="btn plain" data-act="ex" data-id="${x.x}">ℹ️ Anleitung ansehen</button>
        ${xi > 0 ? `<button class="btn plain" data-act="wMove" data-i="${xi}" data-d="-1">↑ Nach oben</button>` : ''}${xi < S.active.ex.length - 1 ? `<button class="btn plain" data-act="wMove" data-i="${xi}" data-d="1">↓ Nach unten</button>` : ''}
        <button class="btn danger" data-act="wDelEx" data-i="${xi}">Übung entfernen</button></div>`
    });
  },
  wRest(el) { const x = S.active.ex[+el.dataset.i]; x.rest = Math.max(15, Math.min(300, x.rest + +el.dataset.d)); save(true); $('#wRestV').innerHTML = `${x.rest}<small>s</small>`; renderWorkout(); },
  wMove(el) { const i = +el.dataset.i, j = i + +el.dataset.d, a = S.active.ex; const t = a[i]; a[i] = a[j]; a[j] = t; save(true); closeSheet(); renderWorkout(); },
  wDelEx(el) { S.active.ex.splice(+el.dataset.i, 1); save(true); closeSheet(); renderWorkout(); },
  wFinish() {
    const a = S.active; if (!a) return;
    const open = a.ex.reduce((n, x) => n + x.sets.filter(s => !s.done).length, 0);
    if (open && a.ex.some(x => x.sets.some(s => s.done))) confirmSheet(`Noch ${plural(open, 'Satz', 'Sätze')} offen. Workout trotzdem beenden? Nur abgehakte Sätze werden gespeichert.`, 'Beenden', finishWorkout);
    else finishWorkout();
  },
  wDiscard() { confirmSheet('Workout verwerfen? Nichts wird gespeichert.', 'Verwerfen', () => { S.active = null; save(true); if (holdClock) { holdClock.stop(); holdClock = null; } restStop(); wake(false); closeFull(); render(); }); },
  actOpen(el) { if (el.dataset.k === 'ride') rideSheet(el.dataset.id); else sessionSheet(el.dataset.id); },
  sesDel(el) { confirmSheet('Diesen Eintrag löschen?', 'Löschen', () => { S.sessions = S.sessions.filter(x => x.id !== el.dataset.id); save(); closeAllSheets(); keepScroll(render); }); },
  sportNew() { sportSheet(); },
  sportPick(el) { sport.n = el.dataset.v; $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
  sportSave() {
    const min = numVal($('#spMin').value); if (!min || min <= 0) { toast('Bitte die Dauer eintragen'); return; }
    const dk = $('#spDate').value || today(), ts = dk === today() ? Date.now() : fromKey(dk).getTime() + 12 * 36e5;
    S.sessions.push({ id: uid(), k: 'sport', n: sport.n, s: ts, min: Math.round(min), note: $('#spNote').value.trim() });
    save(); closeSheet(); render(); toast('Aktivität gespeichert');
  },
  timer() { timerSheet(); },
  tmMode(el) { if (tm.iv) { tm.iv.c.stop(); tm.iv = null; } tm.mode = el.dataset.v; sheetBody(timerBody()); },
  tmStep(el) {
    const k = el.dataset.k, d = +el.dataset.d;
    if (k === 'rest') { S.settings.rest = Math.max(15, Math.min(600, S.settings.rest + d)); save(); }
    else tm[k] = Math.max(k === 'pause' ? 0 : k === 'rounds' ? 1 : 5, Math.min(k === 'rounds' ? 50 : 600, tm[k] + d));
    sheetBody(timerBody());
  },
  tmRest(el) { S.settings.rest = +el.dataset.v; save(); sheetBody(timerBody()); },
  tmRestGo() { closeSheet(); restStart(S.settings.rest, 'Timer'); },
  ivPreset(el) { tm.work = +el.dataset.w; tm.pause = +el.dataset.p; tm.rounds = +el.dataset.r; sheetBody(timerBody()); },
  ivStart() { tm.iv = { ph: 'prep', round: 1 }; wake(true); sheetBody(timerBody()); tm.iv.c = clock(5, ivPaint, ivNext); },
  ivPause() { const iv = tm.iv; if (!iv) return; if (iv.c.paused == null) { iv.c.pause(); $('#ivPauseB').textContent = 'Weiter'; } else { iv.c.resume(); $('#ivPauseB').textContent = 'Pause'; } },
  ivStop() { if (tm.iv) { tm.iv.c.stop(); tm.iv = null; } wake(false); sheetBody(timerBody()); },
  swToggle() { const s = tm.sw; if (s.t0) { s.acc += Date.now() - s.t0; s.t0 = null; } else s.t0 = Date.now(); sheetBody(timerBody()); },
  swReset() { tm.sw = { acc: 0, t0: null }; sheetBody(timerBody()); }
});
IN.wSet = el => {
  if (!S.active) return;
  const { x, si } = wCtx(el);
  x.sets[si][el.dataset.f] = numVal(el.value);
  save(true);
};
