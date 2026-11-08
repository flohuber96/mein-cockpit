'use strict';

/* ───────── Helpers ───────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const fmtDate = ts => { const d = new Date(ts); return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = ts => {
  const d = new Date(ts), today = dkey(new Date()), k = dkey(d);
  if (k === today) return `heute, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (k === dkey(addDays(new Date(), -1))) return 'gestern';
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
};
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M5 3.5h10l4 4V20a.5.5 0 0 1-.5.5h-13A.5.5 0 0 1 5 20z"/><path d="M12 10v6M9 13h6"/></svg>',
};

/* ───────── State ───────── */
const KEY = 'lernen.v1';
function fresh() {
  return {
    v: 1,
    done: {},        // "kurs:lektion" -> Zeitstempel
    attempts: [],    // Testergebnisse
    wrong: {},       // "kurs:kapitel:frage" -> { n, last } (Wiederholungs-Pool)
    notes: [],       // Notizen & Fragen
    days: {},        // "YYYY-MM-DD" -> Anzahl Lernaktionen
    unlocked: {},    // manuell freigeschaltete Kapitel
    completed: {},   // Kurs -> Zeitstempel Abschlusstest bestanden
    last: null,      // { c, ch, l } zuletzt geöffnete Lektion
    custom: [],      // importierte Kurse
    settings: { strict: true, pass: 70 },
    ui: { nType: 'all', nCourse: '' },
  };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw), f = fresh();
      return { ...f, ...s, settings: { ...f.settings, ...s.settings }, ui: { ...f.ui, ...s.ui } };
    }
  } catch (e) { /* ignore */ }
  return fresh();
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  updateBadge();
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

function logActivity() { const k = dkey(new Date()); S.days[k] = (S.days[k] || 0) + 1; }
function streak() {
  let d = new Date(), n = 0;
  if (!S.days[dkey(d)]) d = addDays(d, -1);
  while (S.days[dkey(d)]) { n++; d = addDays(d, -1); }
  return n;
}

/* ───────── Kurse ───────── */
const safeId = s => String(s).replace(/[^\w-]/g, '_');
function normCourse(c) {
  (c.chapters || []).forEach((ch, i) => {
    ch.id = safeId(ch.id || `k${i + 1}`);
    ch.lessons = ch.lessons || [];
    ch.quiz = ch.quiz || [];
    ch.lessons.forEach((l, j) => { l.id = safeId(l.id || `${ch.id}l${j + 1}`); });
  });
  c.color = c.color || '#4f46e5';
  c.emoji = c.emoji || '📘';
  return c;
}
function courses() { return [...(window.COURSES || []), ...S.custom].map(normCourse); }
const course = id => courses().find(c => c.id === id);
const chapter = (c, id) => c && c.chapters.find(ch => ch.id === id);
const lessonKey = (c, l) => `${c.id}:${l.id}`;
const isDone = (c, l) => !!S.done[lessonKey(c, l)];
const qid = (c, ch, i) => `${c.id}:${ch.id}:${i}`;
const passMark = () => S.settings.pass;

function bestOf(cId, chId) {
  let b = null;
  for (const a of S.attempts) if (a.c === cId && a.ch === chId && (b === null || a.pct > b)) b = a.pct;
  return b;
}
function chState(c, idx) {
  const ch = c.chapters[idx];
  const ld = ch.lessons.filter(l => isDone(c, l)).length;
  const best = bestOf(c.id, ch.id);
  const passed = !ch.quiz.length ? ld === ch.lessons.length : best !== null && best >= passMark();
  const prevOk = idx === 0 || chState(c, idx - 1).passed;
  const locked = S.settings.strict && !prevOk && !S.unlocked[`${c.id}:${ch.id}`];
  return { ch, ld, total: ch.lessons.length, best, passed, done: passed && ld === ch.lessons.length, locked };
}
function finalState(c) {
  const allPassed = c.chapters.every((ch, i) => chState(c, i).passed);
  const best = bestOf(c.id, 'final');
  return {
    best, passed: best !== null && best >= passMark(),
    locked: S.settings.strict && !allPassed && !S.unlocked[`${c.id}:final`],
    count: Math.min(c.finalCount || 15, c.chapters.reduce((n, ch) => n + ch.quiz.length, 0)),
  };
}
function courseProgress(c) {
  const lessons = c.chapters.reduce((n, ch) => n + ch.lessons.length, 0);
  const done = c.chapters.reduce((n, ch) => n + ch.lessons.filter(l => isDone(c, l)).length, 0);
  const tests = c.chapters.filter(ch => ch.quiz.length).length + 1;
  const passed = c.chapters.filter((ch, i) => ch.quiz.length && chState(c, i).passed).length + (finalState(c).passed ? 1 : 0);
  return { lessons, done, tests, passed, p: pct(done + passed, lessons + tests) };
}
// Nächster sinnvoller Schritt im Lernpfad
function nextStep(c) {
  for (let i = 0; i < c.chapters.length; i++) {
    const st = chState(c, i);
    if (st.locked) return null;
    const l = st.ch.lessons.find(x => !isDone(c, x));
    if (l) return { type: 'lesson', ch: st.ch, l, label: l.title, sub: `Kapitel ${i + 1} · ${st.ch.title}`, href: `#/lektion/${c.id}/${st.ch.id}/${l.id}` };
    if (!st.passed && st.ch.quiz.length) return { type: 'quiz', ch: st.ch, label: `Kapiteltest: ${st.ch.title}`, sub: `Kapitel ${i + 1} abschließen`, href: `#/test/${c.id}/${st.ch.id}` };
  }
  const f = finalState(c);
  if (!f.passed && !f.locked) return { type: 'final', label: 'Abschlusstest', sub: 'Alle Kapitel bestanden – jetzt den Kurs abschließen', href: `#/test/${c.id}/final` };
  return null;
}
function wrongIds(cId) { return Object.keys(S.wrong).filter(k => cId === 'all' || k.startsWith(cId + ':')); }
function questionById(id) {
  const [cId, chId, i] = id.split(':');
  const c = course(cId), ch = chapter(c, chId), q = ch && ch.quiz[+i];
  return q ? { c, ch, q, id } : null;
}

/* ───────── Mini-Markup für Lektionstexte ─────────
   ## Überschrift · - Liste · 1. Liste · | Tabelle | · **fett**
   Absätze, die mit MERKE: / TIPP: / ACHTUNG: / BEISPIEL: / REFLEXION: beginnen, werden zu Info-Boxen. */
const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>');
const CALLOUT = { MERKE: ['merke', 'Merke'], TIPP: ['tipp', 'Praxis-Tipp'], ACHTUNG: ['warnung', 'Achtung'], BEISPIEL: ['beispiel', 'Beispiel'], REFLEXION: ['reflex', 'Reflexion'] };
let reflections = [];
function renderLines(lines) {
  let h = '', i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('## ')) { h += `<h2>${inl(l.slice(3))}</h2>`; i++; continue; }
    if (/^[-•] /.test(l)) {
      h += '<ul>'; while (i < lines.length && /^[-•] /.test(lines[i])) h += `<li>${inl(lines[i++].slice(2))}</li>`; h += '</ul>'; continue;
    }
    if (l.startsWith('> ')) {
      const q = []; while (i < lines.length && lines[i].startsWith('> ')) q.push(lines[i++].slice(2));
      h += `<blockquote>${inl(q.join(' '))}</blockquote>`; continue;
    }
    if (/^\d+\. /.test(l)) {
      h += '<ol>'; while (i < lines.length && /^\d+\. /.test(lines[i])) h += `<li>${inl(lines[i++].replace(/^\d+\. /, ''))}</li>`; h += '</ol>'; continue;
    }
    if (l.startsWith('|')) {
      const rows = []; while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(x => x.trim());
      const body = rows.filter(r => !/^\|[\s\-:|]+\|$/.test(r));
      h += '<div class="tablewrap"><table><thead><tr>' + cells(body[0]).map(x => `<th>${inl(x)}</th>`).join('') + '</tr></thead><tbody>'
        + body.slice(1).map(r => '<tr>' + cells(r).map(x => `<td>${inl(x)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
      continue;
    }
    const p = []; while (i < lines.length && lines[i] && !/^(## |[-•] |\d+\. |\||> )/.test(lines[i])) p.push(lines[i++]);
    if (p.length) h += `<p>${inl(p.join(' '))}</p>`; else i++;
  }
  return h;
}
function md(src) {
  return String(src || '').replace(/\r/g, '').split(/\n\s*\n/).map(b => {
    const lines = b.split('\n').map(x => x.trim()).filter(Boolean);
    if (!lines.length) return '';
    const m = lines[0].match(/^(MERKE|TIPP|ACHTUNG|BEISPIEL|REFLEXION):\s*/);
    if (!m) return renderLines(lines);
    const [cls, lbl] = CALLOUT[m[1]];
    lines[0] = lines[0].slice(m[0].length);
    let extra = '';
    if (m[1] === 'REFLEXION') {
      reflections.push(lines.join(' '));
      extra = `<button data-act="reflect" data-i="${reflections.length - 1}">✍️ Antwort in Notizen festhalten</button>`;
    }
    return `<div class="callout ${cls}"><span class="lbl">${lbl}</span>${renderLines(lines)}${extra}</div>`;
  }).join('');
}

/* ───────── Toast & Sheets ───────── */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
const sheetStack = [];
const pending = {};
function openSheet({ title = '', left = '', right = '', body = '', onClose } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  const sh = document.createElement('div'); sh.className = 'sheet';
  sh.innerHTML = `<div class="sheet-head">${left || '<button class="lnk" data-act="closeSheet">Abbrechen</button>'}<b>${esc(title)}</b>${right || '<span class="lnk"></span>'}</div><div class="sheet-body">${body}</div>`;
  ov.addEventListener('click', () => closeSheet());
  $('#sheets').append(ov, sh);
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); }));
  sheetStack.push({ ov, sh, onClose });
  addSwipeToClose(sh);
  return sh;
}
function closeSheet() {
  const e = sheetStack.pop(); if (!e) return;
  e.ov.classList.remove('show'); e.sh.classList.remove('show');
  setTimeout(() => { e.ov.remove(); e.sh.remove(); }, 320);
  if (!sheetStack.length) document.body.classList.remove('locked');
  if (e.onClose) e.onClose();
}
function closeAllSheets() { while (sheetStack.length) closeSheet(); }
const topSheet = () => sheetStack.length ? sheetStack[sheetStack.length - 1].sh : null;
function addSwipeToClose(sh) {
  const head = $('.sheet-head', sh); let y0 = null, dy = 0;
  head.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
  head.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeSheet(); y0 = null; });
}
function confirmSheet(text, okLabel, onOk, danger = false) {
  openSheet({
    title: 'Bist du sicher?', body: `<p style="text-align:center;font-size:16px;margin:6px 8px 18px">${esc(text)}</p><div class="stack">
      <button class="btn ${danger ? 'danger' : 'primary'}" data-act="confirmOk" ${danger ? 'style="background:var(--red-soft)"' : ''}>${esc(okLabel)}</button>
      <button class="btn plain" data-act="closeSheet">Abbrechen</button></div>`,
  });
  pending.confirm = onOk;
}

/* ───────── Routing ───────── */
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent).filter(Boolean);
  return { view: p[0] || 'kurse', a: p[1], b: p[2], c: p[3] };
}
const go = h => { if (location.hash === h) render(); else location.hash = h; };
const TAB_OF = { kurse: 'kurse', kurs: 'kurse', kapitel: 'kurse', lektion: 'kurse', test: 'kurse', notizen: 'notizen', fortschritt: 'fortschritt', mehr: 'mehr' };

function setHeader(title, back, backLbl = 'Zurück', actions = '') {
  $('#title').textContent = title;
  $('.top').classList.toggle('sub', !!back);
  const b = $('#back'); b.hidden = !back; b.dataset.href = back || ''; $('#backLbl').textContent = backLbl;
  $('#hact').innerHTML = actions;
  document.title = back ? `${title} · Lernpfad` : 'Lernpfad';
}

let lastRouteKey = '';
function render() {
  const r = route();
  const key = location.hash;
  const main = $('#main');
  main.style.removeProperty('--c');
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === TAB_OF[r.view]));
  reflections = [];
  let html;
  switch (r.view) {
    case 'kurs': html = viewCourse(r.a); break;
    case 'kapitel': html = viewChapter(r.a, r.b); break;
    case 'lektion': html = viewLesson(r.a, r.b, r.c); break;
    case 'test': html = viewTest(r.a, r.b); break;
    case 'notizen': html = viewNotes(); break;
    case 'fortschritt': html = viewProgress(); break;
    case 'mehr': html = viewMore(); break;
    default: html = viewHome();
  }
  main.innerHTML = html;
  $('#tabbar').hidden = r.view === 'test' && !!Q && !Q.finished && Q.qs.length > 0;
  if (r.view === 'notizen') renderNoteList();
  if (key !== lastRouteKey) { window.scrollTo(0, 0); lastRouteKey = key; }
  updateBadge();
}
function updateBadge() {
  const n = S.notes.filter(x => x.type === 'question' && !x.resolved).length;
  const b = $('#qBadge'); b.hidden = !n; b.textContent = n;
}
function notFound(msg = 'Nicht gefunden') {
  setHeader(msg, '#/kurse', 'Kurse');
  return `<div class="empty"><div class="big">🔍</div><b>${esc(msg)}</b>Der Inhalt existiert nicht (mehr).</div>`;
}

/* ───────── Startseite ───────── */
function viewHome() {
  setHeader('Kurse', null);
  const h = new Date().getHours();
  const greet = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
  const all = courses();
  const lessonsDone = Object.keys(S.done).length;
  const passed = all.reduce((n, c) => n + c.chapters.filter((ch, i) => ch.quiz.length && chState(c, i).passed).length + (finalState(c).passed ? 1 : 0), 0);
  const st = streak();
  let out = `<p class="hello">${greet}! ${st ? `Du lernst seit <b>${st} ${st === 1 ? 'Tag' : 'Tagen'}</b> am Stück – weiter so. 🔥` : 'Schön, dass du da bist. Ein paar Minuten am Tag reichen.'}</p>
  <div class="statrow">
    <div class="card stat"><b>${st}</b><span>Tage Serie</span></div>
    <div class="card stat"><b>${lessonsDone}</b><span>Lektionen</span></div>
    <div class="card stat"><b>${passed}</b><span>Bestanden</span></div>
  </div>`;

  // Weiterlernen: zuletzt genutzter Kurs zuerst
  const lastC = S.last && course(S.last.c);
  const order = lastC ? [lastC, ...all.filter(c => c !== lastC)] : all;
  for (const c of order) {
    const n = nextStep(c);
    if (n && (lastC === c || Object.keys(S.done).some(k => k.startsWith(c.id + ':')))) {
      out += `<div class="section-t">Weiterlernen</div>
      <a class="resume tap" href="${n.href}" style="--c:${c.color};text-decoration:none">
        <span class="e">${c.emoji}</span><span><small>${esc(c.title)}</small><b>${esc(n.label)}</b><small style="text-transform:none;letter-spacing:0;font-weight:500;margin-top:2px">${esc(n.sub)}</small></span><span class="go">›</span></a>`;
      break;
    }
  }
  const wr = wrongIds('all').length;
  if (wr) out += `<a class="card lrow tap" href="#/test/all/review" style="margin-top:10px;text-decoration:none;color:inherit;border-radius:var(--r)">
    <span class="n" style="background:var(--warn-soft);color:var(--warn)">↻</span><span class="t"><b>Fehler wiederholen</b><small>${wr} ${wr === 1 ? 'Frage' : 'Fragen'} aus deinen Tests</small></span><span class="chev">›</span></a>`;

  out += `<div class="section-t">Meine Kurse <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:600">${all.length}</span></div>`;
  for (const c of all) {
    const p = courseProgress(c);
    const done = S.completed[c.id];
    out += `<a class="card ccard tap" href="#/kurs/${c.id}" style="--c:${c.color};text-decoration:none;color:inherit">
      <div class="h"><div class="cemoji">${c.emoji}</div><div style="min-width:0"><h3>${esc(c.title)}</h3><p>${esc(c.short || '')}</p></div></div>
      <div class="meta"><span class="pill">${c.chapters.length} Kapitel</span><span class="pill">${p.lessons} Lektionen</span>${c.duration ? `<span class="pill">⏱ ${esc(c.duration)}</span>` : ''}${c.level ? `<span class="pill">${esc(c.level)}</span>` : ''}${done ? '<span class="pill ok">🎓 Abgeschlossen</span>' : ''}</div>
      <div class="foot"><div class="bar" style="--c:${c.color}"><i style="width:${p.p}%"></i></div><span>${p.p} %</span></div></a>`;
  }
  out += `<p class="small muted" style="text-align:center;margin-top:18px">Eigene Kurse kannst du unter <a href="#/mehr" style="color:var(--acc-t)">Mehr → Kurs importieren</a> hinzufügen.</p>`;
  return out;
}

/* ───────── Kursseite / Lernpfad ───────── */
function viewCourse(cId) {
  const c = course(cId); if (!c) return notFound('Kurs nicht gefunden');
  setHeader(c.title, '#/kurse', 'Kurse');
  $('#main').style.setProperty('--c', c.color);
  const p = courseProgress(c), n = nextStep(c), f = finalState(c);
  const notes = S.notes.filter(x => x.c === c.id);
  const openQ = notes.filter(x => x.type === 'question' && !x.resolved).length;
  const wr = wrongIds(c.id).length;
  let out = `<div class="card chero">
    <div class="top2"><div class="cemoji">${c.emoji}</div><div><div class="pill acc">${esc(c.level || 'Kurs')}${c.duration ? ' · ' + esc(c.duration) : ''}</div></div></div>
    <p>${esc(c.desc || c.short || '')}</p>
    <div class="foot" style="display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--t2)"><div class="bar" style="flex:1"><i style="width:${p.p}%"></i></div><span>${p.done}/${p.lessons} Lektionen · ${p.passed}/${p.tests} Tests</span></div>
    ${S.completed[c.id] ? `<div class="pill ok" style="align-self:flex-start;font-size:14px;padding:6px 12px">🎓 Kurs abgeschlossen am ${fmtDate(S.completed[c.id])}</div>` : ''}
    ${n ? `<a class="btn primary" href="${n.href}" style="text-decoration:none">${n.type === 'lesson' ? (p.done ? 'Weiterlernen' : 'Kurs starten') : 'Zum Test'} › </a>` : ''}
    ${c.goals && c.goals.length ? `<details class="goalsbox"${p.done ? '' : ' open'}><summary>Das nimmst du mit</summary><ul class="goals">${c.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul></details>` : ''}
  </div>`;
  out += `<div class="row" style="margin-top:10px">
    <a class="btn sm tap" href="#/notizen" data-act="notesFor" data-c="${c.id}" style="text-decoration:none;color:inherit">📝 Notizen ${notes.length ? `<span class="pill">${notes.length}</span>` : ''}${openQ ? `<span class="pill warn">${openQ} offen</span>` : ''}</a>
    ${wr ? `<a class="btn sm tap" href="#/test/${c.id}/review" style="text-decoration:none;color:inherit">↻ Fehler <span class="pill warn">${wr}</span></a>` : ''}
  </div>`;
  out += `<div class="section-t">Lernpfad</div><div class="path">`;
  let curSet = false;
  c.chapters.forEach((ch, i) => {
    const st = chState(c, i);
    let cls = st.done ? 'done' : st.locked ? 'locked' : '';
    if (!st.done && !st.locked && !curSet) { cls = 'cur'; curSet = true; }
    const dot = st.done ? '✓' : st.locked ? '🔒' : i + 1;
    out += `<div class="chap ${cls}"><div class="rail"><div class="dot">${dot}</div><div class="line"></div></div>
      <button class="card box tap" data-act="openChapter" data-c="${c.id}" data-ch="${ch.id}">
        <small>Kapitel ${i + 1}</small><b>${esc(ch.title)}</b>
        <div class="meta"><span class="pill${st.ld === st.total ? ' ok' : ''}">📖 ${st.ld}/${st.total}</span>
        ${ch.quiz.length ? `<span class="pill${st.passed ? ' ok' : st.best !== null ? ' warn' : ''}">✎ ${st.best !== null ? `Test ${st.best} %` : `Test · ${ch.quiz.length} Fragen`}</span>` : ''}</div>
      </button></div>`;
  });
  const fcls = f.passed ? 'done' : f.locked ? 'locked' : (curSet ? '' : 'cur');
  out += `<div class="chap ${fcls}"><div class="rail"><div class="dot">${f.passed ? '🎓' : f.locked ? '🔒' : '🏁'}</div></div>
    <button class="card box tap" data-act="openFinal" data-c="${c.id}">
      <small>Abschluss</small><b>Abschlusstest</b>
      <div class="meta"><span class="pill${f.passed ? ' ok' : f.best !== null ? ' warn' : ''}">${f.best !== null ? `Bestwert ${f.best} %` : `${f.count} gemischte Fragen`}</span><span class="pill">Bestehen ab ${passMark()} %</span></div>
    </button></div></div>`;
  if (S.settings.strict) out += `<p class="small muted" style="margin:14px 4px 0">🔒 Kapitel werden freigeschaltet, sobald du den Test des vorherigen Kapitels bestanden hast (ab ${passMark()} %). Das lässt sich unter „Mehr“ ausschalten.</p>`;
  return out;
}

/* ───────── Kapitel ───────── */
function viewChapter(cId, chId) {
  const c = course(cId), ch = chapter(c, chId); if (!ch) return notFound('Kapitel nicht gefunden');
  const idx = c.chapters.indexOf(ch), st = chState(c, idx);
  setHeader(ch.title, `#/kurs/${c.id}`, c.title);
  $('#main').style.setProperty('--c', c.color);
  const nNotes = S.notes.filter(x => x.c === c.id && ch.lessons.some(l => l.id === x.l)).length;
  let out = `<div class="lmeta"><span class="pill acc">Kapitel ${idx + 1} von ${c.chapters.length}</span>${st.done ? '<span class="pill ok">✓ abgeschlossen</span>' : ''}${nNotes ? `<span class="pill">📝 ${nNotes} Notizen</span>` : ''}</div>`;
  if (ch.intro) out += `<div class="card lesson" style="padding:16px 18px;font-size:16px">${md(ch.intro)}</div>`;
  out += `<div class="section-t">Lektionen <span>${st.ld}/${st.total}</span></div><div class="card" style="overflow:hidden">`;
  ch.lessons.forEach((l, j) => {
    const d = isDone(c, l);
    out += `<a class="lrow tap${d ? ' done' : ''}" href="#/lektion/${c.id}/${ch.id}/${l.id}" style="text-decoration:none;color:inherit">
      <span class="n">${d ? '✓' : j + 1}</span><span class="t"><b>${esc(l.title)}</b><small>${l.min ? `ca. ${l.min} Min.` : 'Lektion'}${S.notes.some(x => x.c === c.id && x.l === l.id) ? ' · 📝' : ''}</small></span><span class="chev">›</span></a>`;
  });
  out += '</div>';
  if (ch.quiz.length) {
    const tries = S.attempts.filter(a => a.c === c.id && a.ch === ch.id).length;
    out += `<div class="section-t">Kapiteltest</div><div class="card quizbox">
      <div class="h"><span class="e">${st.passed ? '✅' : '✎'}</span><div><b>${ch.quiz.length} Fragen</b><small>${st.best !== null ? `Bestwert ${st.best} % · ${tries} ${tries === 1 ? 'Versuch' : 'Versuche'}` : `Bestehen ab ${passMark()} %`}</small></div></div>
      ${st.ld < st.total && st.best === null ? `<p class="small muted">Tipp: Lies zuerst alle Lektionen – dann klappt der Test leichter.</p>` : ''}
      <a class="btn ${st.ld === st.total && !st.passed ? 'primary' : 'soft'}" href="#/test/${c.id}/${ch.id}" style="text-decoration:none">${st.best !== null ? 'Test wiederholen' : 'Test starten'}</a></div>`;
  }
  return out;
}

/* ───────── Lektion ───────── */
function viewLesson(cId, chId, lId) {
  const c = course(cId), ch = chapter(c, chId), l = ch && ch.lessons.find(x => x.id === lId);
  if (!l) return notFound('Lektion nicht gefunden');
  const idx = c.chapters.indexOf(ch), j = ch.lessons.indexOf(l), done = isDone(c, l);
  S.last = { c: c.id, ch: ch.id, l: l.id }; save();
  setHeader(l.title, `#/kapitel/${c.id}/${ch.id}`, ch.title);
  $('#main').style.setProperty('--c', c.color);
  const notes = S.notes.filter(x => x.c === c.id && x.l === l.id).sort((a, b) => b.updated - a.updated);
  let out = `<div class="lmeta"><span class="pill acc">Kapitel ${idx + 1} · Lektion ${j + 1}/${ch.lessons.length}</span>${l.min ? `<span class="pill">⏱ ${l.min} Min.</span>` : ''}${done ? '<span class="pill ok">✓ gelesen</span>' : ''}</div>
  <article class="card lesson">${md(l.text)}</article>`;
  out += `<div class="section-t">Meine Notizen & Fragen <span>${notes.length || ''}</span></div>`;
  if (notes.length) out += `<div class="nlist">${notes.map(noteCard).join('')}</div>`;
  else out += `<p class="small muted" style="margin:0 4px">Halte fest, was du mitnimmst – oder welche Frage sich dir stellt. Offene Fragen sammelst du unter „Notizen“.</p>`;
  out += `<div class="addnote"><button class="btn sm" data-act="newNote" data-type="note" data-c="${c.id}" data-l="${l.id}">📝 Notiz</button><button class="btn sm" data-act="newNote" data-type="question" data-c="${c.id}" data-l="${l.id}">❓ Frage</button></div>`;
  const nextL = ch.lessons[j + 1];
  const nextHref = nextL ? `#/lektion/${c.id}/${ch.id}/${nextL.id}` : ch.quiz.length ? `#/test/${c.id}/${ch.id}` : `#/kurs/${c.id}`;
  const nextLbl = nextL ? 'Nächste Lektion' : ch.quiz.length ? 'Zum Kapiteltest' : 'Zum Kurs';
  out += `<div class="lnav">`;
  if (!done) out += `<button class="btn primary" data-act="lessonDone" data-c="${c.id}" data-l="${l.id}" data-next="${nextHref}">✓ Verstanden – ${nextLbl}</button>`;
  else out += `<button class="btn plain" data-act="lessonUndone" data-c="${c.id}" data-l="${l.id}" style="flex:0 0 auto">Ungelesen</button><a class="btn primary" href="${nextHref}" style="text-decoration:none">${nextLbl} ›</a>`;
  out += `</div>`;
  return out;
}

/* ───────── Tests ───────── */
let Q = null;
function buildQuiz(cId, key) {
  let pool = [];
  const add = (c, ch) => ch.quiz.forEach((q, i) => pool.push({ id: qid(c, ch, i), q, c, ch }));
  if (key === 'review') {
    pool = wrongIds(cId).map(questionById).filter(Boolean);
    pool = shuffle(pool).sort((a, b) => (S.wrong[b.id].n || 0) - (S.wrong[a.id].n || 0)).slice(0, 15);
    pool = shuffle(pool);
  } else {
    const c = course(cId);
    if (key === 'final') { c.chapters.forEach(ch => add(c, ch)); pool = shuffle(pool).slice(0, finalState(c).count); }
    else { add(c, chapter(c, key)); pool = shuffle(pool); }
  }
  const qs = pool.map(p => {
    const correct = new Set([].concat(p.q.a));
    const order = p.q.fix || p.q.o.length <= 2 ? p.q.o.map((_, i) => i) : shuffle(p.q.o.map((_, i) => i));
    return { ...p, order, correct, multi: Array.isArray(p.q.a) };
  });
  return { key: `${cId}/${key}`, cId, kind: key, qs, i: 0, sel: new Set(), checked: false, results: [], finished: false };
}
function viewTest(cId, key) {
  const c = cId === 'all' ? null : course(cId);
  if (cId !== 'all' && !c) return notFound('Test nicht gefunden');
  const ch = c && key !== 'final' && key !== 'review' ? chapter(c, key) : null;
  if (c && key !== 'final' && key !== 'review' && !ch) return notFound('Test nicht gefunden');
  const title = key === 'review' ? 'Fehler wiederholen' : key === 'final' ? 'Abschlusstest' : `Test: ${ch.title}`;
  const backHref = ch ? `#/kapitel/${c.id}/${ch.id}` : c ? `#/kurs/${c.id}` : '#/kurse';
  if (!Q || Q.key !== `${cId}/${key}`) Q = buildQuiz(cId, key);
  if (c) $('#main').style.setProperty('--c', c.color);
  if (!Q.qs.length) {
    setHeader(title, backHref, 'Zurück');
    return `<div class="empty"><div class="big">🎉</div><b>Nichts zu wiederholen</b>Alle Fragen sitzen. Neue Fehler aus Tests landen automatisch hier.</div>`;
  }
  if (Q.finished) { setHeader(title, backHref, c ? (ch ? ch.title : c.title) : 'Kurse'); return viewResult(c, ch); }
  setHeader(title, backHref, 'Abbrechen');
  const it = Q.qs[Q.i], q = it.q;
  const isRight = Q.checked && sameSet(Q.sel, it.correct);
  let out = `<div class="qprog"><span>Frage ${Q.i + 1}/${Q.qs.length}</span><div class="bar"><i style="width:${pct(Q.i + (Q.checked ? 1 : 0), Q.qs.length)}%"></i></div><span>${Q.results.filter(Boolean).length} ✓</span></div>
  <div class="card qcard">
    ${!c || key === 'final' ? `<div class="pill" style="margin-bottom:10px">${esc(!c ? it.c.title + ' · ' : '')}${esc(it.ch.title)}</div>` : ''}
    <div class="qt">${inl(q.q)}</div>
    <div class="qhint">${it.multi ? 'Mehrere Antworten richtig – wähle alle passenden.' : 'Eine Antwort ist richtig.'}</div>
    <div class="opts${it.multi ? ' multi' : ''}${Q.checked ? ' locked' : ''}">`;
  it.order.forEach(oi => {
    let cls = '';
    if (Q.checked) {
      if (it.correct.has(oi) && Q.sel.has(oi)) cls = 'right';
      else if (Q.sel.has(oi)) cls = 'wrong';
      else if (it.correct.has(oi)) cls = 'missed';
    } else if (Q.sel.has(oi)) cls = 'sel';
    out += `<button class="opt ${cls}" data-act="pickOpt" data-o="${oi}"><span class="mk"></span><span>${inl(q.o[oi])}</span></button>`;
  });
  out += `</div>`;
  if (Q.checked) out += `<div class="expl ${isRight ? 'ok' : 'bad'}"><b>${isRight ? '✓ Richtig!' : '✕ Leider nicht ganz.'}</b>${q.x ? inl(q.x) : ''}</div>`;
  out += `<div class="qfoot">${Q.checked
    ? `<button class="btn plain" data-act="qNote" style="flex:0 0 auto">❓</button><button class="btn primary" data-act="qNext">${Q.i + 1 < Q.qs.length ? 'Weiter' : 'Auswertung'}</button>`
    : `<button class="btn primary" data-act="qCheck" ${Q.sel.size ? '' : 'disabled'}>Antwort prüfen</button>`}</div></div>`;
  return out;
}
const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
function finishQuiz() {
  Q.finished = true;
  const right = Q.results.filter(Boolean).length, total = Q.qs.length, p = pct(right, total);
  const att = { id: uid(), c: Q.cId, ch: Q.kind, date: Date.now(), right, total, pct: p, wrong: Q.qs.filter((_, i) => !Q.results[i]).map(x => x.id) };
  const c = course(Q.cId);
  Q.prevBest = Q.kind !== 'review' ? bestOf(Q.cId, Q.kind) : null;
  S.attempts.push(att);
  logActivity();
  Q.att = att;
  if (c && Q.kind === 'final' && p >= passMark() && !S.completed[c.id]) S.completed[c.id] = Date.now();
  save();
}
function viewResult(c, ch) {
  const a = Q.att, passed = a.pct >= passMark();
  const isReview = Q.kind === 'review', isFinal = Q.kind === 'final';
  const firstPass = passed && (Q.prevBest === null || Q.prevBest < passMark());
  let head, sub;
  if (isReview) { head = a.pct === 100 ? 'Alles sitzt! 💪' : 'Gut wiederholt'; sub = `${a.right} von ${a.total} richtig. Richtig beantwortete Fragen verlassen den Wiederholungs-Pool.`; }
  else if (isFinal && passed) { head = '🎓 Kurs abgeschlossen!'; sub = `${a.right} von ${a.total} richtig – Glückwunsch, du hast „${c.title}“ erfolgreich abgeschlossen.`; }
  else if (passed) { head = firstPass ? 'Bestanden! 🎉' : 'Bestanden'; sub = `${a.right} von ${a.total} richtig.${firstPass && c.chapters.indexOf(ch) < c.chapters.length - 1 ? ' Das nächste Kapitel ist freigeschaltet.' : ''}`; }
  else { head = 'Noch nicht bestanden'; sub = `${a.right} von ${a.total} richtig – ab ${passMark()} % ist der Test bestanden. Schau dir die Erklärungen an und versuch es nochmal.`; }
  const color = isReview ? 'var(--acc)' : passed ? 'var(--ok)' : 'var(--warn)';
  let out = `<div class="card result"><div class="ring" style="--p:${a.pct};--c:${color}"><b>${a.pct}%</b></div><h2>${head}</h2><p>${sub}</p></div>`;
  const wrong = Q.qs.filter((_, i) => !Q.results[i]);
  if (wrong.length) {
    out += `<div class="section-t">Zum Nacharbeiten <span>${wrong.length}</span></div><div class="card">`;
    out += wrong.map(it => `<div class="rev"><b>${inl(it.q.q)}</b><div class="ans">✓ ${[...it.correct].map(i => inl(it.q.o[i])).join(' · ')}</div>${it.q.x ? `<div class="muted" style="margin-top:4px">${inl(it.q.x)}</div>` : ''}</div>`).join('');
    out += `</div><p class="small muted" style="margin:8px 4px 0">Falsch beantwortete Fragen landen automatisch unter „Fehler wiederholen“.</p>`;
  }
  out += `<div class="stack" style="margin-top:16px">`;
  if (c && ch && passed) {
    const nextCh = c.chapters[c.chapters.indexOf(ch) + 1];
    if (nextCh) out += `<a class="btn primary" href="#/kapitel/${c.id}/${nextCh.id}" style="text-decoration:none">Weiter zu Kapitel ${c.chapters.indexOf(nextCh) + 1} ›</a>`;
    else out += `<a class="btn primary" href="#/kurs/${c.id}" style="text-decoration:none">Zum Abschlusstest ›</a>`;
  }
  out += `<button class="btn ${passed || isReview ? 'plain' : 'primary'}" data-act="qRetry">${isReview ? 'Nochmal wiederholen' : 'Test wiederholen'}</button>`;
  if (c) out += `<a class="btn plain" href="#/kurs/${c.id}" style="text-decoration:none">Zum Kurs</a>`;
  else out += `<a class="btn plain" href="#/kurse" style="text-decoration:none">Zu den Kursen</a>`;
  return out + '</div>';
}

/* ───────── Notizen ───────── */
function noteCard(n) {
  const c = course(n.c);
  let lessonT = '';
  if (c && n.l) { for (const ch of c.chapters) { const l = ch.lessons.find(x => x.id === n.l); if (l) { lessonT = l.title; break; } } }
  const typ = n.type === 'question' ? (n.resolved ? '<span class="pill ok">✓ Frage geklärt</span>' : '<span class="pill warn">❓ Offene Frage</span>') : '<span class="pill acc">📝 Notiz</span>';
  return `<button class="card note tap" data-act="editNote" data-id="${n.id}">
    <div class="nh">${typ}${c ? `<span class="pill" style="background:color-mix(in srgb,${c.color} 14%,transparent);color:${c.color}">${c.emoji} ${esc(c.title)}</span>` : ''}<span class="nd">${fmtShort(n.updated)}</span></div>
    ${lessonT ? `<div class="small muted" style="margin-bottom:4px">↳ ${esc(lessonT)}</div>` : ''}
    ${n.ref ? `<div class="quote" style="margin:0 0 6px">${esc(n.ref)}</div>` : ''}
    <div class="nt">${esc(n.text)}</div>
    ${n.type === 'question' && n.answer ? `<div class="na">${esc(n.answer)}</div>` : ''}
  </button>`;
}
const noteUi = { q: '' };
function viewNotes() {
  setHeader('Notizen', null, '', `<button class="hbtn" data-act="newNote" data-type="note" aria-label="Neue Notiz">${ICON.plus}</button>`);
  const all = courses();
  const t = S.ui.nType;
  const openQ = S.notes.filter(x => x.type === 'question' && !x.resolved).length;
  return `<div class="seg">
      ${[['all', 'Alle'], ['note', 'Notizen'], ['open', `Offen${openQ ? ` (${openQ})` : ''}`], ['resolved', 'Geklärt']].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="nType" data-v="${k}">${l}</button>`).join('')}
    </div>
    <div class="chips"><button class="chip${!S.ui.nCourse ? ' on' : ''}" data-act="nCourse" data-v="">Alle Kurse</button>
      ${all.map(c => `<button class="chip${S.ui.nCourse === c.id ? ' on' : ''}" data-act="nCourse" data-v="${c.id}">${c.emoji} ${esc(c.title)}</button>`).join('')}
      <button class="chip${S.ui.nCourse === '-' ? ' on' : ''}" data-act="nCourse" data-v="-">Allgemein</button></div>
    <div class="search">${ICON.search}<input id="nq" type="search" placeholder="Notizen durchsuchen" value="${esc(noteUi.q)}" autocomplete="off"></div>
    <div id="nlist" class="nlist"></div>`;
}
function renderNoteList() {
  const el = $('#nlist'); if (!el) return;
  const t = S.ui.nType, cf = S.ui.nCourse, q = noteUi.q.trim().toLowerCase();
  let list = S.notes.filter(n =>
    (t === 'all' || (t === 'note' && n.type === 'note') || (t === 'open' && n.type === 'question' && !n.resolved) || (t === 'resolved' && n.type === 'question' && n.resolved))
    && (!cf || (cf === '-' ? !n.c : n.c === cf))
    && (!q || [n.text, n.answer, n.ref].join(' ').toLowerCase().includes(q)));
  list.sort((a, b) => b.updated - a.updated);
  if (!list.length) {
    el.innerHTML = S.notes.length
      ? `<div class="empty"><div class="big">🔎</div><b>Keine Treffer</b>Ändere Filter oder Suchbegriff.</div>`
      : `<div class="empty"><div class="big">📝</div><b>Noch keine Notizen</b>Notizen und Fragen legst du direkt in den Lektionen an – oder hier über das ＋ oben rechts.</div>`;
    return;
  }
  el.innerHTML = list.map(noteCard).join('');
}
function lessonOptions(cId, sel) {
  const c = course(cId); if (!c) return '';
  return `<option value="">– keine bestimmte Lektion –</option>` + c.chapters.map((ch, i) =>
    `<optgroup label="${i + 1}. ${esc(ch.title)}">${ch.lessons.map(l => `<option value="${l.id}"${l.id === sel ? ' selected' : ''}>${esc(l.title)}</option>`).join('')}</optgroup>`).join('');
}
function openNoteEditor(n, isNew) {
  const all = courses();
  const sh = openSheet({
    title: isNew ? (n.type === 'question' ? 'Neue Frage' : 'Neue Notiz') : 'Bearbeiten',
    right: '<button class="lnk r" data-act="saveNote">Sichern</button>',
    body: `<div class="seg" id="ntype">
        <button class="${n.type === 'note' ? 'on' : ''}" data-act="noteType" data-v="note">📝 Notiz</button>
        <button class="${n.type === 'question' ? 'on' : ''}" data-act="noteType" data-v="question">❓ Frage</button></div>
      ${n.ref ? `<div class="quote">${esc(n.ref)}</div>` : ''}
      <div class="field"><textarea id="ntext" placeholder="${n.type === 'question' ? 'Welche Frage hat sich dir gestellt?' : 'Was nimmst du mit? Was willst du ausprobieren?'}">${esc(n.text || '')}</textarea></div>
      <div id="qfields" ${n.type === 'question' ? '' : 'hidden'}>
        <div class="field"><label>Antwort / Erkenntnis</label><textarea id="nanswer" style="min-height:90px" placeholder="Sobald du die Antwort kennst – hier festhalten.">${esc(n.answer || '')}</textarea></div>
        <div class="card setting" style="margin-bottom:14px"><span>Frage ist geklärt</span><label class="switch"><input type="checkbox" id="nres" ${n.resolved ? 'checked' : ''}><i></i></label></div>
      </div>
      <div class="field"><label>Kurs</label><select id="ncourse"><option value="">Allgemein (kein Kurs)</option>${all.map(c => `<option value="${c.id}"${c.id === n.c ? ' selected' : ''}>${c.emoji} ${esc(c.title)}</option>`).join('')}</select></div>
      <div class="field" id="nlessonF" ${n.c ? '' : 'hidden'}><label>Lektion</label><select id="nlesson">${lessonOptions(n.c, n.l)}</select></div>
      ${!isNew && n.c && n.l ? `<button class="btn soft" data-act="gotoNoteLesson" style="width:100%;margin-bottom:10px">Zur Lektion springen</button>` : ''}
      ${!isNew ? `<button class="btn danger" data-act="deleteNote" style="width:100%">Löschen</button>
      <p class="small muted" style="text-align:center;margin-top:8px">Erstellt ${fmtDate(n.created)}</p>` : ''}`,
  });
  pending.note = { ...n, isNew };
  if (isNew) setTimeout(() => { const t = $('#ntext', sh); t && t.focus(); }, 350);
}
function newNote(type, c = '', l = '', ref = '') {
  openNoteEditor({ id: uid(), type, c, l, ref, text: '', answer: '', resolved: false, created: Date.now(), updated: Date.now() }, true);
}

/* ───────── Fortschritt ───────── */
function viewProgress() {
  setHeader('Fortschritt', null);
  const all = courses();
  const st = streak(), learnDays = Object.keys(S.days).length;
  const scored = S.attempts.filter(a => a.ch !== 'review');
  const avg = scored.length ? Math.round(scored.reduce((n, a) => n + a.pct, 0) / scored.length) : 0;
  const passedN = all.reduce((n, c) => n + c.chapters.filter((ch, i) => ch.quiz.length && chState(c, i).passed).length + (finalState(c).passed ? 1 : 0), 0);
  let out = `<div class="statrow" style="grid-template-columns:repeat(2,1fr)">
    <div class="card stat"><b>${st} 🔥</b><span>Tage Lernserie</span></div>
    <div class="card stat"><b>${learnDays}</b><span>Lerntage gesamt</span></div>
    <div class="card stat"><b>${scored.length ? avg + ' %' : '–'}</b><span>Ø Testergebnis</span></div>
    <div class="card stat"><b>${passedN}</b><span>Tests bestanden</span></div></div>`;

  // Aktivität der letzten 15 Wochen
  const today = new Date(), mon = addDays(today, -((today.getDay() + 6) % 7) - 7 * 14);
  let cells = '';
  for (let w = 0; w < 15; w++) for (let d = 0; d < 7; d++) {
    const day = addDays(mon, w * 7 + d), k = dkey(day), n = S.days[k] || 0;
    const lvl = n === 0 ? '' : n < 3 ? 'l1' : n < 6 ? 'l2' : 'l3';
    cells += day > today ? '<i style="visibility:hidden"></i>' : `<i class="${lvl}${k === dkey(today) ? ' today' : ''}" title="${k}: ${n}"></i>`;
  }
  out += `<div class="section-t">Aktivität <span class="muted small" style="text-transform:none;letter-spacing:0">15 Wochen</span></div>
    <div class="card heat" style="grid-template-rows:repeat(7,1fr);grid-auto-flow:column">${cells}</div>`;

  out += `<div class="section-t">Kurse</div><div class="stack">`;
  for (const c of all) {
    const p = courseProgress(c), f = finalState(c);
    out += `<div class="card pcourse" style="--c:${c.color}"><div class="h"><span style="font-size:22px">${c.emoji}</span><b>${esc(c.title)}</b><span>${p.p} %</span></div>
      <div class="bar"><i style="width:${p.p}%"></i></div>
      <table class="ptable">${c.chapters.map((ch, i) => {
        const s = chState(c, i);
        return `<tr><td>${i + 1}. ${esc(ch.title)}</td><td>${s.ld}/${s.total} 📖 · ${s.best !== null ? `<b style="color:${s.passed ? 'var(--ok)' : 'var(--warn)'}">${s.best} %</b>` : '<span class="muted">–</span>'}</td></tr>`;
      }).join('')}
      <tr><td><b>Abschlusstest</b></td><td>${f.best !== null ? `<b style="color:${f.passed ? 'var(--ok)' : 'var(--warn)'}">${f.best} %</b>${f.passed ? ' 🎓' : ''}` : '<span class="muted">–</span>'}</td></tr></table></div>`;
  }
  out += `</div>`;

  const hist = [...S.attempts].reverse().slice(0, 30);
  out += `<div class="section-t">Testverlauf <span>${S.attempts.length || ''}</span></div>`;
  if (!hist.length) out += `<p class="small muted" style="margin:0 4px">Noch keine Tests gemacht. Jedes Kapitel endet mit einem kurzen Test.</p>`;
  else out += `<div class="card">${hist.map(a => {
    const c = course(a.c), ch = c && chapter(c, a.ch);
    const name = a.ch === 'review' ? 'Fehler wiederholen' : a.ch === 'final' ? 'Abschlusstest' : ch ? ch.title : 'Test';
    const ok = a.pct >= passMark();
    return `<div class="hist"><span style="font-size:20px">${c ? c.emoji : '↻'}</span><div class="t"><b>${esc(name)}</b><small>${c ? esc(c.title) + ' · ' : ''}${fmtShort(a.date)} · ${a.right}/${a.total} richtig</small></div><span class="s" style="color:${a.ch === 'review' ? 'var(--t2)' : ok ? 'var(--ok)' : 'var(--warn)'}">${a.pct} %</span></div>`;
  }).join('')}</div>`;
  return out;
}

/* ───────── Mehr ───────── */
function viewMore() {
  setHeader('Mehr', null);
  const custom = S.custom;
  return `<div class="section-t">Lernpfad</div>
  <div class="card" style="margin-bottom:12px">
    <div class="setting"><div><div>Kapitel nacheinander freischalten</div><div class="small muted">Nächstes Kapitel erst nach bestandenem Test</div></div><label class="switch"><input type="checkbox" data-change="strict" ${S.settings.strict ? 'checked' : ''}><i></i></label></div>
    <div class="setting"><div><div>Bestehensgrenze</div><div class="small muted">Für Kapitel- und Abschlusstests</div></div>
      <select data-change="pass" style="width:auto;min-width:96px">${[50, 60, 70, 80, 90, 100].map(v => `<option value="${v}"${S.settings.pass === v ? ' selected' : ''}>${v} %</option>`).join('')}</select></div>
  </div>
  <div class="section-t">Kurse</div>
  <div class="card menu">
    <label><span class="ico">📥</span><span>Kurs importieren<small>Eigener Kurs als JSON-Datei</small></span><input type="file" id="courseFile" accept=".json,application/json"></label>
    <button data-act="courseTemplate"><span class="ico">📄</span><span>Vorlage für eigenen Kurs<small>JSON-Gerüst mit Erklärung herunterladen</small></span></button>
    ${custom.map(c => `<button data-act="removeCourse" data-id="${esc(c.id)}"><span class="ico">${esc(c.emoji || '📘')}</span><span style="flex:1">${esc(c.title)}<small>Importierter Kurs · tippen zum Entfernen</small></span><span class="red">✕</span></button>`).join('')}
  </div>
  <div class="section-t">Daten</div>
  <div class="card menu">
    <button data-act="exportNotes"><span class="ico">🗒️</span><span>Notizen exportieren<small>Alle Notizen & Fragen als Text teilen</small></span></button>
    <button data-act="exportData"><span class="ico">💾</span><span>Backup erstellen<small>Fortschritt, Testergebnisse & Notizen sichern</small></span></button>
    <label><span class="ico">♻️</span><span>Backup laden<small>Aus einer Backup-Datei wiederherstellen</small></span><input type="file" id="importFile" accept=".json,application/json"></label>
  </div>
  <div class="card menu">
    <button data-act="resetCourse"><span class="ico">↺</span><span>Kursfortschritt zurücksetzen<small>Notizen bleiben erhalten</small></span></button>
    <button data-act="resetAll"><span class="ico">🗑️</span><span class="red">Alle Daten löschen</span></button>
  </div>
  <p class="small muted" style="text-align:center;margin:18px 12px 0;line-height:1.5">Alle Daten liegen nur auf diesem Gerät (lokaler Speicher). Mach ab und zu ein Backup – besonders vor einem Gerätewechsel.<br>Tipp: Über „Teilen → Zum Home-Bildschirm“ wird daraus eine App.</p>`;
}

/* ───────── Export / Import ───────── */
async function shareFile(name, content, type, title) {
  const file = new File([content], name, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportData() {
  const data = JSON.stringify({ app: 'lernpfad', exported: new Date().toISOString(), ...S, ui: undefined }, null, 1);
  shareFile(`lernpfad-backup-${dkey(new Date())}.json`, data, 'application/json', 'Lernpfad Backup');
}
function exportNotes() {
  if (!S.notes.length) { toast('Noch keine Notizen vorhanden'); return; }
  const groups = {};
  for (const n of [...S.notes].sort((a, b) => a.created - b.created)) (groups[n.c || ''] = groups[n.c || ''] || []).push(n);
  let txt = `# Meine Lernnotizen\nStand: ${fmtDate(Date.now())}\n`;
  for (const [cId, list] of Object.entries(groups)) {
    const c = course(cId);
    txt += `\n## ${c ? c.title : 'Allgemein'}\n`;
    for (const n of list) {
      let lt = '';
      if (c && n.l) for (const ch of c.chapters) { const l = ch.lessons.find(x => x.id === n.l); if (l) lt = ` (${l.title})`; }
      txt += `\n- ${n.type === 'question' ? (n.resolved ? '✅ Frage' : '❓ Frage') : '📝'}${lt}: ${n.ref ? `„${n.ref}“ – ` : ''}${n.text.replace(/\n/g, '\n  ')}`;
      if (n.type === 'question' && n.answer) txt += `\n  → ${n.answer.replace(/\n/g, '\n    ')}`;
    }
    txt += '\n';
  }
  if (navigator.share) navigator.share({ title: 'Lernnotizen', text: txt }).catch(e => { if (e.name !== 'AbortError') shareFile('lernnotizen.md', txt, 'text/markdown', 'Lernnotizen'); });
  else shareFile('lernnotizen.md', txt, 'text/markdown', 'Lernnotizen');
}
function readJSON(file, cb) {
  const rd = new FileReader();
  rd.onload = () => { try { cb(JSON.parse(rd.result)); } catch (e) { toast('Datei ist kein gültiges JSON'); } };
  rd.readAsText(file);
}
function importData(file) {
  readJSON(file, d => {
    if (d.app !== 'lernpfad' || !d.done) { toast('Das ist kein Lernpfad-Backup'); return; }
    confirmSheet(`Backup vom ${fmtDate(d.exported)} laden? Der aktuelle Stand wird ersetzt.`, 'Backup laden', () => {
      const f = fresh();
      S = { ...f, ...d, app: undefined, exported: undefined, settings: { ...f.settings, ...d.settings }, ui: S.ui };
      save(); go('#/kurse'); toast('Backup geladen');
    });
  });
}
function validateCourse(c) {
  if (!c || typeof c !== 'object') return 'Keine Kursdaten gefunden.';
  if (!c.id || !/^[a-z0-9_-]+$/i.test(c.id)) return 'Feld „id“ fehlt oder enthält Sonderzeichen (erlaubt: a–z, 0–9, - und _).';
  if (!c.title) return 'Feld „title“ fehlt.';
  if (!Array.isArray(c.chapters) || !c.chapters.length) return 'Der Kurs braucht mindestens ein Kapitel („chapters“).';
  for (const [i, ch] of c.chapters.entries()) {
    if (!ch.title) return `Kapitel ${i + 1}: „title“ fehlt.`;
    if (!Array.isArray(ch.lessons) || !ch.lessons.length) return `Kapitel ${i + 1}: braucht mindestens eine Lektion („lessons“).`;
    for (const [j, l] of ch.lessons.entries()) if (!l.title || !l.text) return `Kapitel ${i + 1}, Lektion ${j + 1}: „title“ und „text“ sind Pflicht.`;
    for (const [j, q] of (ch.quiz || []).entries()) {
      if (!q.q || !Array.isArray(q.o) || q.o.length < 2) return `Kapitel ${i + 1}, Frage ${j + 1}: „q“ und mindestens zwei Antworten in „o“ nötig.`;
      const a = [].concat(q.a);
      if (!a.length || a.some(x => typeof x !== 'number' || x < 0 || x >= q.o.length)) return `Kapitel ${i + 1}, Frage ${j + 1}: „a“ muss die Nummer der richtigen Antwort sein (ab 0 gezählt).`;
    }
  }
  return null;
}
function importCourse(file) {
  readJSON(file, d => {
    const c = d.course || d;
    const err = validateCourse(c);
    if (err) { openSheet({ title: 'Import nicht möglich', left: '<span class="lnk"></span>', right: '<button class="lnk r" data-act="closeSheet">OK</button>', body: `<p style="font-size:16px;margin:8px 4px 16px">${esc(err)}</p><p class="small muted" style="margin:0 4px">Unter „Vorlage für eigenen Kurs“ findest du das richtige Format.</p>` }); return; }
    if ((window.COURSES || []).some(x => x.id === c.id)) { toast(`Die ID „${c.id}“ ist schon für einen eingebauten Kurs vergeben`); return; }
    const doIt = () => { S.custom = S.custom.filter(x => x.id !== c.id).concat(c); save(); go(`#/kurs/${c.id}`); toast(`Kurs „${c.title}“ hinzugefügt`); };
    if (S.custom.some(x => x.id === c.id)) confirmSheet(`Kurs „${c.title}“ gibt es schon. Durch die neue Version ersetzen? Dein Fortschritt bleibt erhalten.`, 'Ersetzen', doIt);
    else doIt();
  });
}
function courseTemplate() {
  const tpl = {
    hinweis: 'Vorlage für einen eigenen Kurs. Felder ohne Stern sind optional. Lektionstext: Absätze durch Leerzeile trennen. "## " = Zwischenüberschrift, "- " = Aufzählung, **fett**, Tabellen mit | Spalte | Spalte |. Absätze mit MERKE:, TIPP:, ACHTUNG:, BEISPIEL: oder REFLEXION: am Anfang werden zu farbigen Boxen. Quiz: "o" = Antwortmöglichkeiten, "a" = Nummer der richtigen Antwort (ab 0 gezählt) oder eine Liste wie [0,2] bei mehreren richtigen Antworten, "x" = Erklärung. IDs nicht mehr ändern, sobald du lernst – daran hängt dein Fortschritt.',
    id: 'mein-kurs*',
    title: 'Mein Kurs*',
    emoji: '📘',
    color: '#0ca678',
    short: 'Ein Satz, worum es geht',
    desc: 'Etwas längere Beschreibung des Kurses.',
    level: 'Einsteiger',
    duration: 'ca. 2 h',
    goals: ['Lernziel 1', 'Lernziel 2'],
    finalCount: 10,
    chapters: [{
      id: 'k1', title: 'Erstes Kapitel*', intro: 'Worum geht es in diesem Kapitel?',
      lessons: [{ id: 'k1a', title: 'Erste Lektion*', min: 5, text: '## Überschrift\n\nEin Absatz mit **fettem** Text.\n\n- Punkt eins\n- Punkt zwei\n\nMERKE: Das Wichtigste in einem Satz.\n\nREFLEXION: Eine Frage zum Nachdenken.' }],
      quiz: [
        { q: 'Beispielfrage mit einer richtigen Antwort?', o: ['Falsch', 'Richtig', 'Auch falsch'], a: 1, x: 'Erklärung, warum.' },
        { q: 'Beispielfrage mit mehreren richtigen Antworten?', o: ['Richtig', 'Falsch', 'Auch richtig'], a: [0, 2], x: 'Erklärung.' },
      ],
    }],
  };
  shareFile('kurs-vorlage.json', JSON.stringify(tpl, null, 2).replace(/\*"/g, '"'), 'application/json', 'Kursvorlage');
}

/* ───────── Aktionen ───────── */
const ACT = {
  tab(el) {
    closeAllSheets();
    const v = el.dataset.view;
    if (v === 'kurse' && Q && !Q.finished && route().view === 'test') Q = null;
    go(v === 'kurse' ? '#/kurse' : `#/${v}`);
  },
  back(el) {
    if (route().view === 'test') Q = null;
    go(el.dataset.href || '#/kurse');
  },
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = pending.confirm; pending.confirm = null; closeSheet(); fn && fn(); },

  openChapter(el) {
    const c = course(el.dataset.c), ch = chapter(c, el.dataset.ch), idx = c.chapters.indexOf(ch);
    if (chState(c, idx).locked) {
      confirmSheet(`Kapitel ${idx + 1} ist noch gesperrt. Der Lernpfad empfiehlt, zuerst den Test von Kapitel ${idx} zu bestehen. Trotzdem öffnen?`, 'Trotzdem öffnen', () => {
        S.unlocked[`${c.id}:${ch.id}`] = true; save(); go(`#/kapitel/${c.id}/${ch.id}`);
      });
      return;
    }
    go(`#/kapitel/${c.id}/${ch.id}`);
  },
  openFinal(el) {
    const c = course(el.dataset.c), f = finalState(c);
    if (f.locked) {
      confirmSheet('Der Abschlusstest wird freigeschaltet, wenn alle Kapiteltests bestanden sind. Trotzdem schon jetzt starten?', 'Trotzdem starten', () => {
        S.unlocked[`${c.id}:final`] = true; save(); Q = null; go(`#/test/${c.id}/final`);
      });
      return;
    }
    Q = null; go(`#/test/${c.id}/final`);
  },
  lessonDone(el) {
    const c = course(el.dataset.c);
    S.done[`${c.id}:${el.dataset.l}`] = Date.now(); logActivity(); save();
    if (el.dataset.next.startsWith('#/test/')) Q = null;
    go(el.dataset.next);
  },
  lessonUndone(el) { delete S.done[`${el.dataset.c}:${el.dataset.l}`]; save(); render(); },
  reflect(el) {
    const r = route();
    newNote('note', r.a, r.c, reflections[+el.dataset.i] || '');
  },

  pickOpt(el) {
    if (!Q || Q.checked) return;
    const o = +el.dataset.o, it = Q.qs[Q.i];
    if (it.multi) { Q.sel.has(o) ? Q.sel.delete(o) : Q.sel.add(o); }
    else Q.sel = new Set([o]);
    render();
  },
  qCheck() {
    if (!Q || !Q.sel.size) return;
    const it = Q.qs[Q.i], ok = sameSet(Q.sel, it.correct);
    Q.checked = true; Q.results[Q.i] = ok;
    const w = S.wrong[it.id];
    if (!ok) S.wrong[it.id] = { n: (w ? w.n : 0) + 1, last: Date.now() };
    else if (w) { if (Q.kind === 'review' || w.n <= 1) delete S.wrong[it.id]; else w.n--; }
    save(); render();
  },
  qNext() {
    if (!Q) return;
    if (Q.i + 1 < Q.qs.length) { Q.i++; Q.sel = new Set(); Q.checked = false; }
    else finishQuiz();
    render(); window.scrollTo(0, 0);
  },
  qRetry() { const { cId, kind } = Q; Q = buildQuiz(cId, kind); render(); window.scrollTo(0, 0); },
  qNote() {
    const it = Q.qs[Q.i];
    newNote('question', it.c.id, '', `Testfrage: ${it.q.q}`);
  },

  newNote(el) {
    const r = route();
    const c = el.dataset.c || (r.view === 'notizen' && S.ui.nCourse && S.ui.nCourse !== '-' ? S.ui.nCourse : '');
    newNote(el.dataset.type || 'note', c, el.dataset.l || '');
  },
  editNote(el) { const n = S.notes.find(x => x.id === el.dataset.id); if (n) openNoteEditor(n, false); },
  noteType(el) {
    const sh = topSheet(), v = el.dataset.v; pending.note.type = v;
    $$('#ntype button', sh).forEach(b => b.classList.toggle('on', b.dataset.v === v));
    $('#qfields', sh).hidden = v !== 'question';
    $('#ntext', sh).placeholder = v === 'question' ? 'Welche Frage hat sich dir gestellt?' : 'Was nimmst du mit? Was willst du ausprobieren?';
  },
  saveNote() {
    const sh = topSheet(), p = pending.note;
    const text = $('#ntext', sh).value.trim();
    if (!text) { toast('Bitte einen Text eingeben'); return; }
    const n = {
      id: p.id, type: p.type, c: $('#ncourse', sh).value, l: $('#ncourse', sh).value ? $('#nlesson', sh).value : '', ref: p.ref || '',
      text, answer: p.type === 'question' ? $('#nanswer', sh).value.trim() : '', resolved: p.type === 'question' && $('#nres', sh).checked,
      created: p.created, updated: Date.now(),
    };
    const i = S.notes.findIndex(x => x.id === n.id);
    if (i >= 0) S.notes[i] = n; else S.notes.push(n);
    save(); closeSheet(); render();
    toast(p.isNew ? (n.type === 'question' ? 'Frage notiert' : 'Notiz gespeichert') : 'Gespeichert');
  },
  deleteNote() {
    const id = pending.note.id;
    confirmSheet('Diesen Eintrag endgültig löschen?', 'Löschen', () => {
      S.notes = S.notes.filter(x => x.id !== id); save(); closeAllSheets(); render(); toast('Gelöscht');
    }, true);
  },
  gotoNoteLesson() {
    const p = pending.note, c = course(p.c);
    const ch = c && c.chapters.find(x => x.lessons.some(l => l.id === p.l));
    closeAllSheets();
    if (ch) go(`#/lektion/${c.id}/${ch.id}/${p.l}`);
  },
  nType(el) { S.ui.nType = el.dataset.v; save(); render(); },
  nCourse(el) { S.ui.nCourse = el.dataset.v; save(); render(); },
  notesFor(el, e) { e.preventDefault(); S.ui.nCourse = el.dataset.c; S.ui.nType = 'all'; save(); go('#/notizen'); },

  exportData() { exportData(); },
  exportNotes() { exportNotes(); },
  courseTemplate() { courseTemplate(); },
  removeCourse(el) {
    const c = S.custom.find(x => x.id === el.dataset.id); if (!c) return;
    confirmSheet(`Kurs „${c.title}“ entfernen? Fortschritt und Notizen bleiben im Speicher, falls du ihn später erneut importierst.`, 'Entfernen', () => {
      S.custom = S.custom.filter(x => x.id !== c.id); save(); render(); toast('Kurs entfernt');
    }, true);
  },
  resetCourse() {
    openSheet({
      title: 'Welcher Kurs?', body: `<div class="card menu">${courses().map(c => `<button data-act="resetCourseDo" data-id="${c.id}"><span class="ico">${c.emoji}</span><span>${esc(c.title)}</span></button>`).join('')}</div>`,
    });
  },
  resetCourseDo(el) {
    const c = course(el.dataset.id); closeSheet();
    confirmSheet(`Lektionen, Testergebnisse und Fehler-Pool von „${c.title}“ zurücksetzen? Deine Notizen bleiben.`, 'Zurücksetzen', () => {
      const pre = c.id + ':';
      for (const k of Object.keys(S.done)) if (k.startsWith(pre)) delete S.done[k];
      for (const k of Object.keys(S.wrong)) if (k.startsWith(pre)) delete S.wrong[k];
      for (const k of Object.keys(S.unlocked)) if (k.startsWith(pre)) delete S.unlocked[k];
      S.attempts = S.attempts.filter(a => a.c !== c.id);
      delete S.completed[c.id];
      if (S.last && S.last.c === c.id) S.last = null;
      save(); render(); toast('Kurs zurückgesetzt');
    }, true);
  },
  resetAll() {
    confirmSheet('Wirklich alles löschen – Fortschritt, Tests, Notizen und importierte Kurse? Das lässt sich nicht rückgängig machen.', 'Alles löschen', () => {
      S = fresh(); save(); go('#/kurse'); toast('Alle Daten gelöscht');
    }, true);
  },
};

const CHANGE = {
  strict(el) { S.settings.strict = el.checked; save(); toast(el.checked ? 'Lernpfad: Kapitel nacheinander' : 'Alle Kapitel frei zugänglich'); },
  pass(el) { S.settings.pass = +el.value; save(); toast(`Bestehen ab ${el.value} %`); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el, e);
});
document.addEventListener('change', e => {
  const k = e.target.dataset.change; if (k && CHANGE[k]) CHANGE[k](e.target);
  if (e.target.id === 'importFile' && e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
  if (e.target.id === 'courseFile' && e.target.files[0]) { importCourse(e.target.files[0]); e.target.value = ''; }
  if (e.target.id === 'ncourse') {
    const sh = topSheet(), v = e.target.value;
    $('#nlessonF', sh).hidden = !v; $('#nlesson', sh).innerHTML = lessonOptions(v, '');
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'nq') { noteUi.q = e.target.value; renderNoteList(); }
});
window.addEventListener('hashchange', () => {
  closeAllSheets();
  const r = route();
  if (r.view !== 'test') Q = Q && Q.finished ? null : Q;
  render();
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
