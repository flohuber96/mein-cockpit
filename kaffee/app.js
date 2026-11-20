'use strict';

/* ───────── Helfer ───────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const { fmt, fmtG } = Advice;
const hm = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dShort = ts => { const d = new Date(ts); return `${d.getDate()}.${d.getMonth() + 1}.`; };
const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const toLocalInput = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const parseNum = v => { if (v == null || v === '') return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const numStr = v => v == null || v === '' ? '' : String(v).replace('.', ',');
const gStr = v => v == null || v === '' ? '' : (+v).toFixed(1).replace('.', ','); // Gramm immer mit 0,1
// Hinweis vom Notizbuch-Import nicht in jeder Zeile wiederholen
const noteText = s => String(s.notes || '').replace(/^Aus dem Notizbuch übernommen – Datum unbekannt\.?\s*/, '').trim();
const vib = n => { if (navigator.vibrate) navigator.vibrate(n || 10); };

/* ───────── State ───────── */
const KEY = 'kaffee.v1';
// Empfohlene Ziele: aus deinen Notizen (18 g → 36–40 g in 25–30 s, erster Tropfen 9–10 s)
// und üblichen Richtwerten für E61-Maschinen. Alles unter „Einstellungen“ änderbar.
const DEFAULTS = { dose: 18, outMin: 36, outMax: 40, tMin: 25, tMax: 30, fdMin: 8, fdMax: 11, fMin: 1.8, fMax: 2.4, fdDef: 10, step: 0.25, coarserUp: true };
function fresh() {
  return {
    v: 2, shots: [], beans: [],
    settings: { theme: 'auto', machine: 'Lelit Mara X V2', grinder: 'Eureka Mignon Zero 65 AP', ...DEFAULTS },
    ui: { view: 'coffee', bean: '', chart: 'sweet' },
  };
}
function migrate(s) {
  const f = fresh(), st = { ...f.settings, ...s.settings };
  for (const k of Object.keys(DEFAULTS)) if (st[k] == null) st[k] = DEFAULTS[k]; // ältere Version (mit Ratio statt Out-Bereich)
  const view = s.ui && ['coffee', 'know', 'settings'].includes(s.ui.view) ? s.ui.view : 'coffee';
  return { ...f, ...s, shots: Array.isArray(s.shots) ? s.shots : [], beans: Array.isArray(s.beans) ? s.beans : [], settings: st, ui: { ...f.ui, ...s.ui, view } };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* kaputt → neu */ }
  return fresh();
}
let S = load();
function save(fromServer) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  if (!fromServer && window.Cloud) Cloud.soon();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#13100e' : '#f6f1ec';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ───────── Daten ───────── */
const T = () => S.settings;
const bean = id => S.beans.find(b => b.id === id);
const activeBeans = () => S.beans.filter(b => !b.archived);
function curBean() {
  if (S.ui.bean && bean(S.ui.bean) && !bean(S.ui.bean).archived) return bean(S.ui.bean);
  const last = [...S.shots].sort((a, b) => b.ts - a.ts).find(s => bean(s.bean) && !bean(s.bean).archived);
  return last ? bean(last.bean) : activeBeans()[0] || null;
}
const shotsOf = id => S.shots.filter(s => (s.bean || '') === (id || '')).sort((a, b) => a.ts - b.ts);
const lastValid = list => [...list].reverse().find(Advice.valid) || null;

/* ───────── Toast / Sheets ───────── */
let toastT;
const pending = {};
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button data-act="toastAct">${esc(action.label)}</button>` : '');
  pending.toast = action ? action.fn : null;
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2400);
}
const sheetStack = [];
let needRender = false;
function openSheet({ title = '', right = '', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head"><button class="lnk" data-act="closeSheet">Abbrechen</button><b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  const entry = { ov, sh, onClose, t: Date.now() };
  let ovOk = false;
  ov.addEventListener('pointerdown', () => { const a = document.activeElement; ovOk = !(a && sh.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName)); });
  ov.addEventListener('click', () => { if (ovOk && Date.now() - entry.t > 450) closeSheet(); ovOk = false; });
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  sheetStack.push(entry);
  return sh;
}
function closeSheet() {
  const e = sheetStack.pop(); if (!e) return;
  e.ov.classList.remove('show'); e.sh.classList.remove('show');
  setTimeout(() => { e.ov.remove(); e.sh.remove(); }, 320);
  if (!sheetStack.length) document.body.classList.remove('locked');
  if (e.onClose) e.onClose();
  if (!sheetStack.length && needRender) { needRender = false; syncDraft(); render(); }
}
function closeAllSheets() { while (sheetStack.length) closeSheet(); }
function confirmSheet(text, okLabel, onOk) {
  openSheet({
    title: 'Bist du sicher?', body: `<p style="text-align:center;font-size:16px;margin:6px 8px 18px">${esc(text)}</p><div class="stack">
      <button class="btn primary" data-act="confirmOk">${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`,
  });
  pending.confirm = onOk;
}

/* ───────── Render ───────── */
const TITLES = { coffee: 'Kaffee', know: 'Wissen', settings: 'Einstellungen' };
function render() {
  const v = S.ui.view, b = curBean();
  $('#title').textContent = v === 'coffee' && b ? b.name : TITLES[v];
  $('#sub').textContent = v === 'coffee' ? (b ? [b.roaster, `${shotsOf(b.id).length} Shots`].filter(Boolean).join(' · ') : 'Lege deine erste Sorte an') : v === 'know' ? 'Ziele, Stellschrauben, Tipps' : `${T().machine} · ${T().grinder}`;
  $('#hact').innerHTML = (window.Cloud ? Cloud.badge() : '') + (v === 'coffee' && b ? `<button class="hbtn" data-act="editBean" data-id="${b.id}" aria-label="Sorte bearbeiten"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/></svg></button>` : '');
  $$('#tabbar button').forEach(x => x.classList.toggle('on', x.dataset.view === v));
  $('#main').innerHTML = v === 'coffee' ? viewCoffee() : v === 'know' ? Wissen.html(T(), activeBeans().map(b => { const sw = Advice.sweet(shotsOf(b.id), T(), T()); return { name: b.name, range: sw.range && !sw.extrap ? sw.range : null }; })) : viewSettings();
  if (v === 'coffee') updateLive($('[data-form="new"]'));
}

/* Pfeil neben einem Wert: ▲ zu hoch, ▼ zu niedrig, nichts = im Ziel */
const arrow = st => st === 'hi' ? '<i class="ar hi" title="zu hoch">▲</i>' : st === 'lo' ? '<i class="ar lo" title="zu niedrig">▼</i>' : '';

function tipFor(s) {
  const f = Advice.flow(s, T());
  return `<b>${dShort(s.ts)} ${hm(s.ts)}</b><small>${fmt(s.din)} → ${s.dout ? fmt(s.dout) : '–'} g · ${s.t ? fmt(s.t, 0) : '–'} s${s.fd ? ' · 💧 ' + fmt(s.fd, 0) + ' s' : ''}</small><small>Fluss ${f ? (f.est ? '~' : '') + fmt(f.v) + ' g/s' + (Math.abs(s.din - T().dose) >= 0.5 ? ` (≙ ${fmt(f.n)} bei ${fmt(T().dose)} g)` : '') : '–'} · Mahlgrad ${fmtG(s.grind)}</small>${noteText(s) ? `<small>„${esc(noteText(s))}“</small>` : ''}`;
}

function beanBar(sel) {
  let h = `<div class="chiprow beanbar">`;
  for (const b of activeBeans()) h += `<button class="chip ${sel === b.id ? 'on' : ''}" data-act="pickBean" data-id="${b.id}">${esc(b.name)}</button>`;
  h += `<button class="chip add" data-act="newBean">+ Sorte</button>`;
  return h + '</div>';
}

/* Eingabefelder – gleich für „Neuer Shot“ und „Bearbeiten“ */
function stepper(k, label, v, step, unit) {
  return `<div class="step"><label>${label}</label><div class="sr">
    <button type="button" data-act="bump" data-k="${k}" data-d="-${step}" aria-label="${label} weniger">−</button>
    <input inputmode="decimal" data-f="${k}" value="${k === 'din' || k === 'dout' ? gStr(v) : numStr(v)}" placeholder="–" aria-label="${label} ${unit}" autocomplete="off">
    <button type="button" data-act="bump" data-k="${k}" data-d="${step}" aria-label="${label} mehr">+</button>
  </div><span class="hint" data-hint="${k}"></span></div>`;
}
function fields(d, timer) {
  return `<div class="fgrid">
      ${stepper('grind', 'Mahlgrad', d.grind, T().step, '')}
      <div class="step flowbox" data-flowbox><label>Fluss · Ergebnis</label><div class="fv" data-live="flow">–</div><span class="hint" data-hint="flow"></span></div>
      ${stepper('din', 'In (g)', d.din, 0.1, 'Gramm')}
      ${stepper('dout', 'Out (g)', d.dout, 0.1, 'Gramm')}
      ${stepper('t', 'Zeit (s)', d.t, 1, 'Sekunden')}
      ${stepper('fd', '1. Tropfen (s)', d.fd, 1, 'Sekunden')}
    </div>
    <div class="noterow ${timer ? 'with-timer' : ''}">
      <textarea data-f="notes" rows="2" placeholder="Kommentar (optional)">${esc(d.notes || '')}</textarea>
      ${timer ? `<div id="timerBox">${timerHTML()}</div>` : ''}
    </div>`;
}

/* Stoppuhr (ein Knopf): Start → 💧 erster Tropfen → Stop füllt Zeit und Tropfen */
const TM = { start: 0, fd: 0, raf: 0, lock: null };
function timerHTML() {
  if (!TM.start) return `<button type="button" class="timer idle" data-act="tStart"><b>⏱</b><span>Stoppuhr</span></button>`;
  return `<button type="button" class="timer run" data-act="${TM.fd ? 'tStop' : 'tDrop'}"><b id="clock">0,0</b><span>${TM.fd ? '■ Stop' : '💧 Tropfen'}</span></button>`;
}
function tick() {
  const c = $('#clock'); if (!c || !TM.start) return;
  c.textContent = fmt((performance.now() - TM.start) / 1000);
  TM.raf = requestAnimationFrame(tick);
}

let draft = null; // „Neuer Shot“ der aktuellen Sorte – bleibt beim Tippen und Umschalten erhalten
// Startwerte: Mahlgrad und Dosis aus dem letzten Shot mit diesem Kaffee, Out passend zur Dosis
function newDraft(b) {
  const list = shotsOf(b ? b.id : ''), last = lastValid(list), st = T();
  const din = last ? last.din : st.dose, o = Advice.outRange(din, st);
  return { bean: b ? b.id : '', din, dout: Advice.r05((o[0] + o[1]) / 2), t: null, fd: null, grind: last && last.grind !== '' ? last.grind : null, notes: '' };
}

function viewCoffee() {
  const b = curBean(), id = b ? b.id : '', st = T();
  const list = shotsOf(id), last = lastValid(list);
  if (!draft || draft.bean !== id) draft = newDraft(b);
  let h = beanBar(id);
  if (!S.shots.some(x => /^nb-/.test(x.id))) h += `<div class="card pad slim"><span><b>📓 Alte Notizen übernehmen</b><br><span class="small muted">34 Shots aus dem Notizbuch</span></span><button class="btn soft sm" data-act="importNotebook">Übernehmen</button></div>`;
  if (!b && !S.beans.length) h += `<div class="card empty"><div class="big">🫘</div><b>Lege deine erste Kaffeesorte an</b>Dann siehst du hier alle Shots dieser Sorte.<div style="margin-top:12px"><button class="btn soft" data-act="newBean" style="margin:0 auto">+ Sorte anlegen</button></div></div>`;

  // 1) Neuer Shot (mit einem Satz Vorschlag aus dem letzten Shot)
  const nx = last ? Advice.next(last, list, st, st) : null;
  h += `<div class="card newcard" data-form="new">
    <div class="nh"><b>Neuer Shot</b></div>
    ${nx ? `<div class="advice ${nx.status}"><b>${nx.status === 'good' ? '✓' : '→'} ${esc(nx.title)}</b><span>${esc(nx.sub)}</span>${nx.grind != null && (nx.grind !== draft.grind || Math.abs(nx.dout - (draft.dout || 0)) >= 0.5) ? `<button class="btn soft sm" data-act="applyAdvice" data-g="${nx.grind}" data-o="${nx.dout}">Vorschlag übernehmen</button>` : ''}</div>` : `<div class="advice"><b>Ziel: ${fmt(st.dose)} g → ${fmt(st.outMin, 0)}–${fmt(st.outMax, 0)} g in ${st.tMin}–${st.tMax} s</b><span>Fluss ${fmt(st.fMin)}–${fmt(st.fMax)} g/s ab dem ersten Tropfen.</span></div>`}
    ${fields(draft, true)}
    <button class="btn primary" data-act="saveNew" style="width:100%;margin-top:10px">Shot speichern</button>
  </div>`;

  if (!list.length) return h + (b ? `<div class="card empty"><div class="big">☕</div><b>Noch keine Shots mit ${esc(b.name)}</b>Trag oben deinen ersten Shot ein.</div>` : '');

  // 2) Diagramm: Verlauf oder Sweet Spot
  const dose = draft.din > 0 ? draft.din : (last ? last.din : st.dose);
  const sw = Advice.sweet(list, st, st, dose);
  const mixed = list.some(s => s.din > 0 && Math.abs(s.din - st.dose) >= 0.5);
  const flowLabel = mixed ? `Fluss (g/s, auf ${fmt(st.dose)} g bezogen)` : 'Fluss (g/s)';
  const rows = list.slice(-30).map(s => { const f = Advice.flow(s, st); return { flow: f ? f.n : null, t: s.t || null, grind: s.grind === '' ? null : s.grind, label: dShort(s.ts), tip: tipFor(s) }; });
  const chart = S.ui.chart === 'history' ? 'history' : 'sweet';
  h += `<div class="card chart">
    <div class="seg chseg"><button class="${chart === 'sweet' ? 'on' : ''}" data-act="chart" data-v="sweet">Sweet Spot</button><button class="${chart === 'history' ? 'on' : ''}" data-act="chart" data-v="history">Verlauf</button></div>`;
  if (chart === 'history') {
    h += Charts.history(rows, { flowBand: [st.fMin, st.fMax], flowAxis: [1, 2.5], flowLabel, timeBand: [st.tMin, st.tMax], grindBand: sw.range && !sw.extrap ? sw.range : null });
    h += `<p class="cap">Grün = Zielbereich, orange Punkte liegen daneben. Antippen zeigt alle Werte eines Shots.${sw.range && !sw.extrap ? ' Beim Mahlgrad ist der Sweet Spot dieser Sorte grün hinterlegt.' : ''}</p>`;
  } else if (sw.pts.length) {
    h += sweetText(sw, list);
    const center = sw.range && !sw.extrap ? (sw.range[0] + sw.range[1]) / 2 : sw.pts[sw.pts.length - 1].x;
    h += Charts.sweet(sw, st, { coarserUp: st.coarserUp, step: st.step, tip: tipFor, center: Advice.snap(center, st.step), yLabel: flowLabel, nextGrind: nx && nx.grind != null && last && nx.grind !== +last.grind ? nx.grind : null });
    h += `<p class="cap">Jeder Punkt ist ein Shot mit ca. ${fmt(sw.dose)} g. Grünes Band = Ziel-Fluss, grüner Streifen = Mahlgrad, bei dem diese Sorte im Ziel landet. Achsen sind bei allen Sorten gleich: Fluss 1–2,5 g/s, drei Mahlstufen breit.</p>`;
  } else h += `<p class="cap">Für den Sweet Spot brauche ich Shots mit ca. ${fmt(dose)} g Dosis und eingetragenem Mahlgrad.</p>`;
  h += `</div>`;

  // 3) Historie
  h += `<div class="section-t">Alle Shots${b ? ' · ' + esc(b.name) : ''}</div>
  <div class="card hist">
    <div class="hrow hh"><span>Datum</span><span>In</span><span>Out</span><span>Zeit</span><span>💧</span><span>Fluss</span><span>MG</span></div>`;
  for (const s of [...list].reverse()) {
    const c = Advice.check(s, st);
    h += `<button class="hrow" data-act="editShot" data-id="${s.id}">
      <span class="d">${dShort(s.ts)}<small>${hm(s.ts)}</small></span>
      <span>${fmt(s.din)}</span>
      <span>${s.dout ? fmt(s.dout) : '–'}${arrow(c.dout)}</span>
      <span>${s.t ? fmt(s.t, 0) : '–'}${arrow(c.t)}</span>
      <span>${s.fd ? fmt(s.fd, 0) : '–'}${arrow(c.fd)}</span>
      <span>${c.f ? (c.f.est ? '~' : '') + fmt(c.f.v) : '–'}${arrow(c.flow)}</span>
      <span class="mg ${c.flow === 'ok' ? 'ok' : ''}">${fmtG(s.grind)}</span>
      ${noteText(s) ? `<em class="note">${esc(noteText(s))}</em>` : ''}
    </button>`;
  }
  h += `</div><p class="small muted legend-line"><i class="ar hi">▲</i> zu hoch · <i class="ar lo">▼</i> zu niedrig · ohne Pfeil = im Ziel · <span class="mg ok">MG</span> grün = Fluss perfekt · ~ = Tropfen nicht eingetragen (${st.fdDef || 10} s angenommen) · antippen zum Bearbeiten</p>`;
  return h;
}

function sweetText(sw, list) {
  const st = T(), rTxt = r => fmtG(r[0]) + (r[1] !== r[0] ? '–' + fmtG(r[1]) : '');
  if (!sw.range) {
    // Für diese Dosis noch nichts – aber vielleicht für die Bezugsdosis?
    const ref = Math.abs(sw.dose - st.dose) >= 0.5 ? Advice.sweet(list, st, st, st.dose) : null;
    const alt = ref && ref.range && !ref.extrap ? ` Bei ${fmt(st.dose)} g lag er bei <b>${rTxt(ref.range)}</b> – mit ${fmt(sw.dose)} g bremst der Kaffee stärker, also eher etwas gröber.` : '';
    return `<p class="swt"><span><b>Noch kein Sweet Spot${Math.abs(sw.dose - st.dose) >= 0.5 ? ` für ${fmt(sw.dose)} g` : ''}.</b> ${sw.n < 3 ? 'Dafür brauche ich ein paar Shots mit verschiedenen Mahlgraden.' : 'Die Shots zeigen noch keinen klaren Trend – meist schwanken Dosis oder Verteilung.'}${alt}</span></p>`;
  }
  const r = fmtG(sw.range[0]) + (sw.range[1] !== sw.range[0] ? '–' + fmtG(sw.range[1]) : '');
  const how = sw.method === 'data' ? `Hier lag der Fluss bei ${sw.hits === 1 ? 'einem Shot' : sw.hits + ' Shots'} im Ziel.` : sw.method === 'between' ? 'Liegt zwischen zwei Mahlgraden, die links und rechts danebenlagen.' : sw.extrap ? 'Hochrechnung aus dem Trend – außerhalb deiner bisherigen Shots, vorsichtig annähern.' : 'Aus dem Trend deiner Shots geschätzt.';
  const noisy = sw.spread != null && sw.spread > 0.3 ? ` Bei gleichem Mahlgrad schwankt der Fluss um ±${fmt(sw.spread)} g/s – gleichmäßige Dosis und Verteilung machen den Wert verlässlicher.` : '';
  return `<p class="swt"><b class="big">${r}</b><span>Sweet Spot dieser Sorte. ${how}${noisy}</span></p>`;
}

/* Live-Anzeige im Formular: Fluss + Hinweise unter den Feldern */
function readForm(form) {
  const d = {};
  $$('[data-f]', form).forEach(el => { const k = el.dataset.f; d[k] = k === 'notes' ? el.value.trim() : k === 'ts' ? new Date(el.value).getTime() : parseNum(el.value); });
  return d;
}
function updateLive(form) {
  if (!form) return;
  const st = T(), d = readForm(form), c = Advice.check(d, st);
  const hint = (k, txt, cls) => { const el = $(`[data-hint="${k}"]`, form); if (el) { el.textContent = txt; el.className = 'hint ' + (cls || ''); } };
  const cls = s => s === 'ok' ? 'good' : s ? 'warn' : '';
  const word = s => s === 'hi' ? '▲ zu hoch' : '▼ zu niedrig';
  const show = (k, s, base) => hint(k, s && s !== 'ok' ? word(s) : base, cls(s));
  hint('din', d.din > 0 && Math.abs(d.din - st.dose) >= 0.5 ? 'Ziele angepasst' : `Bezug ${fmt(st.dose)}`, '');
  show('dout', c.dout, `Ziel ${fmt(c.o[0], 0)}–${fmt(c.o[1], 0)}`);
  show('t', c.t, `Ziel ${st.tMin}–${st.tMax}`);
  if (d.fd == null) hint('fd', `leer = ${st.fdDef || 10} s`, ''); else show('fd', c.fd, `sonst ${st.fdMin}–${st.fdMax}`);
  show('flow', c.flow, `Ziel ${fmt(c.fr[0])}–${fmt(c.fr[1])}`);
  const fv = $('[data-live="flow"]', form), box = $('[data-flowbox]', form);
  if (fv) fv.innerHTML = c.f ? `${c.f.est ? '~' : ''}${fmt(c.f.v)}<small> g/s</small>` : '–';
  if (box) box.className = 'step flowbox ' + (c.flow === 'ok' ? 'good' : c.flow ? 'warn' : '');
}
function syncDraft() { const f = $('[data-form="new"]'); if (f && draft) Object.assign(draft, readForm(f)); }

/* ───────── Einstellungen ───────── */
function setRow(label, key, sub, text) {
  const v = T()[key];
  return `<div class="setting"><span><span class="lbl">${label}</span>${sub ? `<br><span class="sub">${sub}</span>` : ''}</span><input ${text ? 'type="text" style="width:55%"' : 'inputmode="decimal"'} data-set="${key}" value="${esc(text ? v : numStr(v))}"></div>`;
}
function viewSettings() {
  const st = T(), fdMid = (st.fdMin + st.fdMax) / 2;
  const fLo = st.outMin / (st.tMax - fdMid), fHi = st.outMax / (st.tMin - fdMid);
  const arch = S.beans.filter(b => b.archived);
  return `<div class="section-t">Ziele</div><div class="card">
    ${setRow('Bezugs-Dosis (g)', 'dose', 'Out- und Fluss-Ziele gelten dafür und wachsen bei mehr Kaffee mit')}
    ${setRow('Out von (g)', 'outMin')}
    ${setRow('Out bis (g)', 'outMax')}
    ${setRow('Zeit von (s)', 'tMin', 'ab Hebel hoch, inkl. Pre-Infusion')}
    ${setRow('Zeit bis (s)', 'tMax')}
    ${setRow('1. Tropfen angenommen (s)', 'fdDef', 'wenn kein erster Tropfen eingetragen ist')}
    ${setRow('1. Tropfen von (s)', 'fdMin')}
    ${setRow('1. Tropfen bis (s)', 'fdMax')}
    ${setRow('Fluss von (g/s)', 'fMin', `aus Out, Zeit und Tropfen ergibt sich ca. ${fmt(fLo)}–${fmt(fHi)}`)}
    ${setRow('Fluss bis (g/s)', 'fMax')}
  </div>
  <button class="btn plain sm" data-act="resetTargets" style="margin:8px auto 0">Empfohlene Werte wiederherstellen</button>
  <div class="section-t">Mühle</div><div class="card">
    ${setRow('Modell', 'grinder', '', true)}
    <div class="setting"><span class="lbl">Höhere Zahl =</span><div class="seg"><button class="${st.coarserUp ? 'on' : ''}" data-act="setDir" data-v="1">gröber</button><button class="${!st.coarserUp ? 'on' : ''}" data-act="setDir" data-v="0">feiner</button></div></div>
    ${setRow('Schrittweite Mahlgrad', 'step')}
  </div>
  <div class="section-t">Maschine</div><div class="card">${setRow('Modell', 'machine', '', true)}</div>
  ${arch.length ? `<div class="section-t">Ausgeblendete Sorten</div><div class="card menu">${arch.map(b => `<button data-act="editBean" data-id="${b.id}"><span class="ico">🫙</span>${esc(b.name)}<span class="small muted" style="margin-left:auto">${shotsOf(b.id).length} Shots</span></button>`).join('')}</div>` : ''}
  <div class="section-t">Darstellung</div><div class="card"><div class="setting"><span class="lbl">Design</span><div class="seg">${[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, n]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="setTheme" data-v="${k}">${n}</button>`).join('')}</div></div></div>
  ${window.Cloud ? Cloud.section() : ''}
  <div class="section-t">Daten</div>
  <div class="card menu">
    ${!S.shots.some(x => /^nb-/.test(x.id)) ? '<button data-act="importNotebook"><span class="ico">📓</span>Notizbuch-Daten übernehmen</button>' : ''}
    <button data-act="exportCsv"><span class="ico">📄</span>Shots als CSV exportieren</button>
    <button data-act="exportJson"><span class="ico">💾</span>Sicherung herunterladen (JSON)</button>
    <button data-act="importJson"><span class="ico">📥</span>Sicherung einspielen</button>
    <button data-act="wipe" class="red"><span class="ico">🗑️</span><span class="red">Alles löschen</span></button>
  </div>
  <input type="file" id="importFile" accept="application/json,.json" hidden>`;
}

/* ───────── Sheets: Shot bearbeiten, Sorte bearbeiten ───────── */
function openShot(s) {
  const sh = openSheet({
    title: 'Shot bearbeiten', right: `<button class="lnk r" data-act="saveEdit" data-id="${s.id}">Sichern</button>`,
    body: `<div data-form="edit">${fields({ ...s, notes: noteText(s) })}
      <div class="field" style="margin-top:12px"><label>Datum & Uhrzeit</label><input type="datetime-local" data-f="ts" value="${toLocalInput(s.ts)}"></div>
      <div class="stack"><button class="btn primary" data-act="saveEdit" data-id="${s.id}">Speichern</button><button class="btn danger" data-act="delShot" data-id="${s.id}">Shot löschen</button></div></div>`,
  });
  updateLive($('[data-form="edit"]', sh));
}
let B = null;
function openBean(b, isNew) {
  B = { ...b, isNew };
  const n = isNew ? 0 : shotsOf(b.id).length;
  openSheet({
    title: isNew ? 'Neue Sorte' : 'Sorte bearbeiten', right: `<button class="lnk r" data-act="saveBean">Sichern</button>`, onClose: () => { B = null; },
    body: `<div class="field"><label>Name</label><input data-b="name" value="${esc(b.name || '')}" placeholder="z. B. Qaweh Decaf" autocomplete="off"></div>
      <div class="field"><label>Röster (optional)</label><input data-b="roaster" value="${esc(b.roaster || '')}" autocomplete="off"></div>
      <div class="field"><label>Notiz (optional)</label><textarea data-b="notes" rows="2">${esc(b.notes || '')}</textarea></div>
      <div class="stack"><button class="btn primary" data-act="saveBean">${isNew ? 'Sorte anlegen' : 'Speichern'}</button>
      ${isNew ? '' : `<button class="btn plain" data-act="archiveBean">${b.archived ? 'Wieder einblenden' : 'Packung leer (ausblenden)'}</button>
      <button class="btn danger" data-act="delBean">Sorte löschen${n ? ` (${n} Shots bleiben erhalten)` : ''}</button>`}</div>`,
  });
}

/* ───────── Export ───────── */
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ───────── Aktionen ───────── */
function validShot(d) { if (!(d.din > 0) || !(d.dout > 0) || !(d.t > 0)) { toast('Bitte In, Out und Zeit eintragen'); return false; } if (d.fd != null && d.fd >= d.t) d.fd = null; return true; }
async function lockScreen() { try { if (navigator.wakeLock) TM.lock = await navigator.wakeLock.request('screen'); } catch (e) { /* egal */ } }
function stopTimer() { cancelAnimationFrame(TM.raf); if (TM.lock) { TM.lock.release().catch(() => {}); TM.lock = null; } }

const ACT = {
  tab(el) { syncDraft(); S.ui.view = el.dataset.view; save(true); render(); window.scrollTo(0, 0); },
  pickBean(el) { syncDraft(); S.ui.bean = el.dataset.id; draft = null; save(true); render(); },
  chart(el) { syncDraft(); S.ui.chart = el.dataset.v; save(true); const y = scrollY; render(); scrollTo(0, y); },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },
  toastAct() { const fn = pending.toast; pending.toast = null; $('#toast').classList.remove('show'); fn && fn(); },

  bump(el) {
    const form = el.closest('[data-form]'), k = el.dataset.k, d = parseFloat(el.dataset.d), inp = $(`[data-f="${k}"]`, form), st = T();
    let v = parseNum(inp.value);
    if (v == null) v = { din: st.dose, dout: Advice.r05((st.outMin + st.outMax) / 2), t: Math.round((st.tMin + st.tMax) / 2), fd: Math.round((st.fdMin + st.fdMax) / 2), grind: 0 }[k];
    else v += d;
    v = Math.max(0, +v.toFixed(k === 'grind' ? 2 : 1));
    inp.value = k === 'din' || k === 'dout' ? gStr(v) : numStr(v);
    vib(6); updateLive(form); if (form.dataset.form === 'new') syncDraft();
  },
  tStart() { syncDraft(); TM.start = performance.now(); TM.fd = 0; vib(20); lockScreen(); $('#timerBox').innerHTML = timerHTML(); tick(); },
  applyAdvice(el) {
    const form = $('[data-form="new"]');
    $('[data-f="grind"]', form).value = numStr(+el.dataset.g); $('[data-f="dout"]', form).value = gStr(+el.dataset.o);
    updateLive(form); syncDraft(); el.remove(); vib(8); toast('Vorschlag übernommen');
  },
  tDrop() { TM.fd = performance.now(); vib(12); $('#timerBox').innerHTML = timerHTML(); tick(); },
  tStop() {
    const end = performance.now(), form = $('[data-form="new"]'); stopTimer(); vib([20, 40, 20]);
    $('[data-f="t"]', form).value = Math.round((end - TM.start) / 1000);
    if (TM.fd) $('[data-f="fd"]', form).value = Math.round((TM.fd - TM.start) / 1000);
    TM.start = TM.fd = 0; $('#timerBox').innerHTML = timerHTML();
    updateLive(form); syncDraft(); toast('Zeit übernommen – jetzt Out eintragen');
    const o = $('[data-f="dout"]', form); o.focus(); if (o.select) o.select();
  },
  saveNew() {
    const form = $('[data-form="new"]'), d = readForm(form), b = curBean();
    if (!validShot(d)) return;
    const s = { id: uid(), ts: Date.now(), bean: b ? b.id : '', din: d.din, dout: d.dout, t: d.t, fd: d.fd, grind: d.grind, notes: d.notes || '' };
    S.shots.push(s); save(); draft = null; render();
    const nx = Advice.next(s, shotsOf(s.bean), T(), T());
    toast(nx.status === 'good' ? 'Gespeichert ✓ ' + nx.title : 'Gespeichert – nächster Vorschlag steht oben');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  editShot(el) { const s = S.shots.find(x => x.id === el.dataset.id); if (s) openShot(s); },
  saveEdit(el) {
    const s = S.shots.find(x => x.id === el.dataset.id); if (!s) return;
    const d = readForm($('[data-form="edit"]', sheetStack[sheetStack.length - 1].sh));
    if (!validShot(d)) return;
    Object.assign(s, { din: d.din, dout: d.dout, t: d.t, fd: d.fd, grind: d.grind, notes: d.notes || '' });
    if (d.ts && !isNaN(d.ts)) s.ts = d.ts;
    save(); closeSheet(); draft = null; render(); toast('Gespeichert');
  },
  delShot(el) {
    const before = S.shots.slice();
    S.shots = S.shots.filter(x => x.id !== el.dataset.id); save(); closeSheet(); draft = null; render();
    toast('Shot gelöscht', { label: 'Rückgängig', fn: () => { S.shots = before; save(); draft = null; render(); } });
  },

  newBean() { syncDraft(); openBean({ id: uid(), created: Date.now() }, true); },
  editBean(el) { syncDraft(); const b = bean(el.dataset.id); if (b) openBean(b, false); },
  saveBean() {
    const sh = sheetStack[sheetStack.length - 1].sh, b = { ...B }, isNew = b.isNew; delete b.isNew;
    $$('[data-b]', sh).forEach(el => { b[el.dataset.b] = el.value.trim(); });
    if (!b.name) { toast('Bitte einen Namen eingeben'); return; }
    const i = S.beans.findIndex(x => x.id === b.id);
    if (i >= 0) S.beans[i] = { ...S.beans[i], ...b }; else { S.beans.push(b); S.ui.bean = b.id; S.ui.view = 'coffee'; draft = null; }
    save(); closeSheet(); render(); toast(isNew ? 'Sorte angelegt' : 'Gespeichert');
  },
  archiveBean() {
    const b = bean(B.id); if (!b) return;
    b.archived = !b.archived;
    if (b.archived && S.ui.bean === b.id) S.ui.bean = '';
    if (!b.archived) { S.ui.bean = b.id; S.ui.view = 'coffee'; }
    draft = null; save(); closeSheet(); render(); toast(b.archived ? 'Ausgeblendet – unter Einstellungen wieder einblendbar' : 'Wieder eingeblendet');
  },
  delBean() {
    const id = B.id;
    confirmSheet('Diese Sorte löschen? Die Shots bleiben erhalten (ohne Sorte).', 'Löschen', () => {
      S.beans = S.beans.filter(b => b.id !== id);
      S.shots.forEach(s => { if (s.bean === id) s.bean = ''; });
      if (S.ui.bean === id) S.ui.bean = '';
      draft = null; save(); closeAllSheets(); render();
    });
  },

  setDir(el) { S.settings.coarserUp = el.dataset.v === '1'; save(); render(); },
  setTheme(el) { S.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  resetTargets() { confirmSheet('Ziele auf die empfohlenen Werte zurücksetzen? (18 g → 36–40 g in 25–30 s, Tropfen 8–11 s, angenommen 10 s, Fluss 1,8–2,4 g/s)', 'Zurücksetzen', () => { Object.assign(S.settings, DEFAULTS); save(); render(); toast('Empfohlene Werte gesetzt'); }); },
  async importNotebook() {
    let j;
    try { const r = await fetch('notizbuch.json', { cache: 'no-cache' }); j = await r.json(); } catch (e) { toast('Notizbuch-Daten nicht erreichbar – Internet prüfen'); return; }
    const have = new Set(S.shots.map(s => s.id)), add = j.shots.filter(s => !have.has(s.id));
    if (!add.length) { toast('Notizbuch ist schon übernommen'); return; }
    confirmSheet(`${add.length} Shots aus dem Notizbuch übernehmen? Das Datum ist dort nicht notiert – die Reihenfolge bleibt erhalten, die Tage sind Platzhalter.`, 'Übernehmen', () => {
      for (const b of j.beans) if (!bean(b.id)) S.beans.push(b);
      for (const x of add) { const { d, ...s } = x; s.ts = new Date(d).getTime(); S.shots.push(s); }
      S.ui.bean = 'nb-greenlion'; draft = null;
      save(); render(); toast(`${add.length} Shots übernommen ✓`);
    });
  },
  exportCsv() {
    const head = ['Datum', 'Kaffee', 'In (g)', 'Out (g)', 'Zeit (s)', '1. Tropfen (s)', 'Fluss (g/s)', 'Mahlgrad', 'Kommentar'];
    const q = v => { const t = String(v ?? ''); return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const rows = [...S.shots].sort((a, b) => a.ts - b.ts).map(s => { const b = bean(s.bean), f = Advice.flow(s, T()); return [new Date(s.ts).toLocaleString('de-DE'), b ? b.name : '', fmt(s.din), s.dout ? fmt(s.dout) : '', s.t ? fmt(s.t, 0) : '', s.fd ? fmt(s.fd, 0) : '', f && !f.est ? fmt(f.v, 2) : '', fmtG(s.grind), s.notes || ''].map(q).join(';'); });
    download(`kaffee-shots-${dayKey(Date.now())}.csv`, '﻿' + [head.join(';'), ...rows].join('\n'), 'text/csv');
  },
  exportJson() { download(`kaffee-sicherung-${dayKey(Date.now())}.json`, JSON.stringify({ app: 'kaffee', v: 2, shots: S.shots, beans: S.beans, settings: S.settings }, null, 1), 'application/json'); },
  importJson() { $('#importFile').click(); },
  wipe() {
    confirmSheet(window.Cloud && Cloud.isOn() ? 'Alle Shots, Sorten und Einstellungen löschen – auch online und auf allen verbundenen Geräten?' : 'Alle Shots, Sorten und Einstellungen auf diesem Gerät löschen?', 'Alles löschen', () => {
      if (window.Cloud) Cloud.allowBulkDelete();
      S = fresh(); draft = null; save(); applyTheme(); render(); toast('Alles gelöscht');
    });
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault();
  try { const r = fn(el, e); if (r && r.catch) r.catch(err => console.error(err)); } catch (err) { console.error(err); toast('Das hat nicht geklappt'); }
});
document.addEventListener('input', e => {
  const form = e.target.closest && e.target.closest('[data-form]');
  if (form && e.target.matches('[data-f]')) { updateLive(form); if (form.dataset.form === 'new') syncDraft(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('[data-set]')) {
    const k = el.dataset.set;
    if (k === 'grinder' || k === 'machine') S.settings[k] = el.value.trim() || fresh().settings[k];
    else { const v = parseNum(el.value); if (v != null && v > 0) S.settings[k] = v; else el.value = numStr(S.settings[k]); }
    const st = S.settings;
    for (const [a, b] of [['outMin', 'outMax'], ['tMin', 'tMax'], ['fdMin', 'fdMax'], ['fMin', 'fMax']]) if (st[a] > st[b]) [st[a], st[b]] = [st[b], st[a]];
    draft = null; save(); toast('Gespeichert');
  }
  if (el.id === 'importFile' && el.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (!j || !Array.isArray(j.shots)) throw new Error('kein Kaffee-Backup');
        confirmSheet(`Sicherung mit ${j.shots.length} Shots und ${(j.beans || []).length} Sorten einspielen? Gleiche Einträge werden ersetzt.`, 'Einspielen', () => {
          const merge = (cur, add) => { const m = new Map(cur.map(x => [x.id, x])); for (const x of add || []) if (x && x.id) m.set(x.id, x); return [...m.values()]; };
          S = migrate({ ...S, shots: merge(S.shots, j.shots), beans: merge(S.beans, j.beans), settings: { ...S.settings, ...(j.settings || {}) } });
          draft = null; save(); applyTheme(); render(); toast('Sicherung eingespielt');
        });
      } catch (err) { toast('Datei konnte nicht gelesen werden'); }
      el.value = '';
    };
    r.readAsText(el.files[0]);
  }
});

/* ───────── Tooltips (Punkte) & Fadenkreuz (Verlauf) ───────── */
const tip = $('#tip');
function showTip(html, x, y) {
  tip.innerHTML = html; tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + 'px';
  tip.style.top = (y - h - 14 < 8 ? y + 18 : y - h - 14) + 'px';
}
const hideTip = () => { tip.hidden = true; $$('.xh').forEach(l => { l.style.visibility = 'hidden'; }); };
function onPoint(e) {
  const t = e.target;
  if (t.dataset && t.dataset.tip) { const r = t.getBoundingClientRect(); showTip(t.dataset.tip, r.left + r.width / 2, r.top + r.height / 2); return; }
  const svg = t.closest && t.closest('svg[data-xh]');
  if (svg) {
    const pts = JSON.parse(svg.dataset.xh), r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const x = (e.clientX - r.left) * vb.width / r.width;
    let best = pts[0]; for (const p of pts) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    const l = $('.xh', svg); l.setAttribute('x1', best.x); l.setAttribute('x2', best.x); l.style.visibility = 'visible';
    showTip(best.tip, r.left + best.x * r.width / vb.width, r.top + 10);
    return;
  }
  hideTip();
}
document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') onPoint(e); });
document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') onPoint(e); });
document.addEventListener('focusin', e => { if (e.target.dataset && e.target.dataset.tip) onPoint(e); });
window.addEventListener('scroll', hideTip, { passive: true });

render();

/* ───────── Online-Datenbank (../shared/cloud.js) ───────── */
const CLOUD_ARR = { shot: ['s:', 'shots'], bean: ['b:', 'beans'] };
const SYNC_SETTINGS = ['dose', 'outMin', 'outMax', 'tMin', 'tMax', 'fdMin', 'fdMax', 'fMin', 'fMax', 'fdDef', 'machine', 'grinder', 'coarserUp', 'step'];
if (window.Cloud) Cloud.init({
  app: 'kaffee',
  records() {
    const m = {};
    for (const [k, [p, arr]] of Object.entries(CLOUD_ARR)) for (const x of S[arr]) m[p + x.id] = { kind: k, data: x };
    const st = {}, def = fresh().settings;
    for (const k of SYNC_SETTINGS) st[k] = S.settings[k];
    m.settings = { kind: 'settings', data: st, soft: SYNC_SETTINGS.every(k => st[k] === def[k]) };
    return m;
  },
  apply(r) {
    if (CLOUD_ARR[r.kind]) {
      const rid = r.id.slice(2), arr = S[CLOUD_ARR[r.kind][1]], i = arr.findIndex(x => x.id === rid);
      if (r.deleted) { if (i >= 0) arr.splice(i, 1); } else if (r.data && typeof r.data === 'object') { if (i >= 0) arr[i] = r.data; else arr.push(r.data); }
    } else if (r.kind === 'settings' && r.data && !r.deleted) {
      Object.assign(S.settings, r.data);
      for (const k of Object.keys(DEFAULTS)) if (S.settings[k] == null) S.settings[k] = DEFAULTS[k]; // Daten aus der alten Version
    }
  },
  persist() { save(true); },
  refresh() { if (sheetStack.length || TM.start) { needRender = true; return; } syncDraft(); const y = window.scrollY; render(); window.scrollTo(0, y); },
  toast, confirm: confirmSheet, badgeHost: '#hact',
  openSettings() { closeAllSheets(); S.ui.view = 'settings'; save(true); render(); setTimeout(() => $('#cloudBox')?.scrollIntoView({ behavior: 'smooth' }), 50); },
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
