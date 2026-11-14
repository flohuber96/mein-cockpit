'use strict';
/* ═══ WOHLBEFINDEN: täglicher Kurz-Check · Tagesform · Trends · Zusammenhänge ═══ */

// Alle Skalen 1–5, 5 = gut. So lässt sich alles gleich lesen und vergleichen.
const WELL = [
  { k: 'sq', n: 'Schlaf', lo: 'schlecht', hi: 'sehr gut', e: '😴', w: 0.2 },
  { k: 'en', n: 'Energie', lo: 'leer', hi: 'voller Energie', e: '⚡', w: 0.25 },
  { k: 'so', n: 'Beine & Muskeln', lo: 'schwer, Muskelkater', hi: 'frisch', e: '🦵', w: 0.2 },
  { k: 'st', n: 'Stress', lo: 'sehr gestresst', hi: 'entspannt', e: '🧘', w: 0.15 },
  { k: 'mo', n: 'Stimmung', lo: 'mies', hi: 'richtig gut', e: '🙂', w: 0.1 }
];
const FACES = ['😣', '😕', '😐', '🙂', '😄'];
const wellOf = k => S.well[k] || null;
const wellKeys = () => Object.keys(S.well).sort();

// Tagesform 0–100 aus dem Check-in; Ruhepuls und HRV verschieben sie leicht, wenn sie vom eigenen Schnitt abweichen
function readiness(k) {
  const w = wellOf(k); if (!w) return null;
  let sum = 0, tot = 0;
  WELL.forEach(m => { if (w[m.k]) { sum += (w[m.k] - 1) / 4 * m.w; tot += m.w; } });
  if (w.sh) { sum += Math.max(0, Math.min(1, (w.sh - 5) / 3)) * 0.1; tot += 0.1; }
  if (!tot) return null;
  let v = sum / tot * 100;
  const prev = wellKeys().filter(d => d < k).slice(-21).map(wellOf);
  const base = f => { const xs = prev.filter(x => x[f]).map(x => x[f]); return xs.length >= 5 ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
  const br = base('rhr'), bh = base('hrv');
  if (w.rhr && br && w.rhr - br >= 5) v -= 7;
  if (w.hrv && bh && w.hrv <= bh * 0.85) v -= 7;
  return Math.max(0, Math.min(100, Math.round(v)));
}
function readyTxt(v) {
  if (v == null) return ['', 'Noch offen', 'Mach den Kurz-Check – dauert 15 Sekunden.', 'var(--t3)'];
  if (v >= 75) return ['grn', 'Bereit', 'Guter Tag für eine fordernde Einheit.', 'var(--ok)'];
  if (v >= 55) return ['', 'Normal', 'Training wie geplant; hör auf dein Gefühl.', 'var(--acc)'];
  if (v >= 40) return ['amb', 'Gedämpft', 'Lieber locker: Grundlage, Mobility oder Technik.', 'var(--c-tight)'];
  return ['red', 'Erholung', 'Heute Pause oder nur sanft bewegen. Schlaf geht vor.', 'var(--c-pain)'];
}

function wellCard() {
  const k = today(), w = wellOf(k), v = readiness(k), t = readyTxt(v);
  if (!w) return `<div class="card pad"><div class="row" style="justify-content:flex-start;gap:14px"><span style="font-size:34px">🌤️</span><div style="flex:1"><b style="font-size:17px">Wie geht’s dir heute?</b><p class="small muted">Schlaf, Energie, Beine, Stress – daraus ergibt sich deine Tagesform.</p></div></div><button class="btn primary" data-act="wellEdit" style="margin-top:12px">Kurz-Check machen</button></div>`;
  return `<button class="card pad" data-act="wellEdit" style="display:block;width:100%"><div class="row" style="justify-content:flex-start;gap:14px">
    ${ring(64, 7, v / 100, t[3], `<span style="font-size:20px;color:${t[3]}">${v}</span>`)}
    <div style="flex:1;min-width:0"><b style="font-size:17px">Tagesform: ${t[1]}</b><p class="small muted">${t[2]}</p></div><span class="muted" style="font-size:20px">›</span></div>
    <div class="chips" style="margin-top:10px">${WELL.filter(m => w[m.k]).map(m => `<span class="chip static">${m.e} ${FACES[w[m.k] - 1]}</span>`).join('')}${w.sh ? `<span class="chip static">🛏️ ${num(w.sh)} h</span>` : ''}</div></button>`;
}

function wellInsights() {
  const out = [], keys = wellKeys();
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const a = keys.map(wellOf).filter(w => w.sh && w.en), lo = a.filter(w => w.sh < 7).map(w => w.en), hi = a.filter(w => w.sh >= 7).map(w => w.en);
  if (lo.length >= 4 && hi.length >= 4 && Math.abs(mean(hi) - mean(lo)) >= 0.4) out.push(`Nach mindestens 7 Stunden Schlaf liegt deine Energie im Schnitt bei ${num(mean(hi))} – nach weniger bei ${num(mean(lo))}.`);
  const tssDay = {}; S.rides.forEach(r => { const d = dkey(new Date(r.s)); tssDay[d] = (tssDay[d] || 0) + rideTss(r).v; });
  const hard = [], easy = [];
  keys.forEach(d => { const w = wellOf(d); if (!w.so) return; const y = dkey(addDays(fromKey(d), -1)), t = tssDay[y] || 0; if (t >= 80) hard.push(w.so); else if (t < 20) easy.push(w.so); });
  if (hard.length >= 3 && easy.length >= 3 && Math.abs(mean(easy) - mean(hard)) >= 0.4) out.push(`Am Tag nach einer harten Radeinheit fühlen sich deine Beine im Schnitt nach ${num(mean(hard))} von 5 an – nach Ruhetagen nach ${num(mean(easy))}.`);
  const kDay = new Set(S.sessions.filter(s => s.k === 'kraft').map(s => dkey(new Date(s.s)))), ks = [], nk = [];
  keys.forEach(d => { const w = wellOf(d); if (!w.so) return; (kDay.has(dkey(addDays(fromKey(d), -1))) ? ks : nk).push(w.so); });
  if (ks.length >= 3 && nk.length >= 3 && mean(nk) - mean(ks) >= 0.4) out.push(`Nach Krafttraining sind die Muskeln am Folgetag spürbar schwerer (${num(mean(ks))} statt ${num(mean(nk))}) – harte Radeinheiten besser nicht direkt danach.`);
  const mDay = new Set(S.sessions.filter(s => s.k === 'mob').map(s => dkey(new Date(s.s)))), ms = [], nm2 = [];
  keys.forEach(d => { const w = wellOf(d); if (!w.st) return; (mDay.has(dkey(addDays(fromKey(d), -1))) ? ms : nm2).push(w.st); });
  if (ms.length >= 4 && nm2.length >= 4 && mean(ms) - mean(nm2) >= 0.4) out.push(`An Tagen nach einer Mobility-Einheit bist du entspannter (${num(mean(ms))} statt ${num(mean(nm2))}).`);
  return out;
}

function wellPage() {
  const keys = wellKeys(), days = [];
  for (let i = 13; i >= 0; i--) { const d = addDays(new Date(), -i), k = dkey(d); days.push({ d, k, v: readiness(k) }); }
  const rng = (from, to) => keys.filter(k => k >= dkey(addDays(new Date(), -from)) && k <= dkey(addDays(new Date(), -to))).map(wellOf);
  const avg = (ws, f) => { const xs = ws.filter(w => w[f]).map(w => w[f]); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
  const now7 = rng(6, 0), old7 = rng(13, 7);
  const trend = (lbl, e, f, unit, dec, inv) => { const a = avg(now7, f), b = avg(old7, f); if (a == null) return ''; const dl = b == null ? null : a - b, good = dl == null || Math.abs(dl) < 0.05 ? '' : (dl > 0) !== !!inv ? 'var(--ok)' : 'var(--c-pain)'; return `<div class="row" style="padding:8px 0;font-size:15px"><span>${e} ${lbl}</span><span><b>${num(a, dec)}${unit}</b>${dl == null || Math.abs(dl) < 0.05 ? '' : ` <span style="font-size:13px;color:${good}">${dl > 0 ? '▲' : '▼'} ${num(Math.abs(dl), dec)}</span>`}</span></div>`; };
  const ins = wellInsights(), body = keys.filter(k => wellOf(k).rhr || wellOf(k).hrv || wellOf(k).kg);
  const lastOf = f => { const k = keys.filter(x => wellOf(x)[f]); return k.length ? wellOf(k[k.length - 1])[f] : null; };
  return `${wellCard()}
    <div class="section-t">Tagesform · 14 Tage</div>
    <div class="card pad"><div class="bars" style="height:90px">${days.map(x => `<div class="b${x.k === today() ? ' now' : ''}${x.v == null ? ' zero' : ''}"><i style="height:${x.v == null ? 2 : Math.max(4, x.v)}%;background:${x.v == null ? '' : readyTxt(x.v)[3]}"></i></div>`).join('')}</div>
      <div class="blbl">${days.map(x => `<span>${DAYS_S[x.d.getDay()]}</span>`).join('')}</div></div>
    ${now7.length ? `<div class="section-t">Ø letzte 7 Tage<span class="muted">Pfeil = zur Vorwoche</span></div>
    <div class="card pad">${WELL.map(m => trend(m.n, m.e, m.k, ' / 5', 1)).join('')}${trend('Schlafdauer', '🛏️', 'sh', ' h', 1)}${trend('Ruhepuls', '❤️', 'rhr', '', 0, true)}${trend('HRV', '📈', 'hrv', '', 0)}</div>` : ''}
    ${ins.length ? `<div class="section-t">Was dir auffallen sollte</div><div class="stack">${ins.map(t => `<div class="box ins" style="font-weight:500;font-size:15px">💡 ${esc(t)}</div>`).join('')}</div>` : keys.length ? `<p class="note">Zusammenhänge (z. B. Schlaf ↔ Energie, harte Fahrt ↔ Beine) erscheinen, sobald genug Tage eingetragen sind.</p>` : ''}
    ${body.length ? `<div class="section-t">Körperwerte</div><div class="stats k3">${[['rhr', 'Ruhepuls', 'bpm'], ['hrv', 'HRV', 'ms'], ['kg', 'Gewicht', 'kg']].map(([f, l, u]) => { const v = lastOf(f); return v ? `<div class="card stat"><small>${l}</small><b>${num(v)}<i>${u}</i></b><span>zuletzt</span></div>` : ''; }).join('')}</div>` : ''}
    <div class="section-t">Verlauf<span class="muted">${keys.length}</span></div>
    ${keys.length ? `<div class="card list">${keys.slice(-21).reverse().map(k => { const w = wellOf(k), v = readiness(k), t = readyTxt(v); return `<button class="li" data-act="wellEdit" data-id="${k}"><span class="lvl" style="background:${t[3]}">${v == null ? '–' : v}</span><span class="bd"><b>${fmtDay(fromKey(k).getTime() + 12 * 36e5)}</b><small class="clip">${WELL.filter(m => w[m.k]).map(m => m.e + FACES[w[m.k] - 1]).join(' ')}${w.sh ? ' · ' + num(w.sh) + ' h' : ''}${w.note ? ' · ' + esc(w.note) : ''}</small></span><span class="go">›</span></button>`; }).join('')}</div>` : '<div class="card empty"><div class="big">🌤️</div><b>Noch kein Eintrag</b>Ein kurzer Check am Morgen zeigt dir nach ein paar Tagen, was dir guttut und wann du Erholung brauchst.</div>'}
    <div class="section-t">Gut zu wissen</div>
    <div class="card pad">${ul(['Die Tagesform ist ein Hinweis, kein Urteil – ein schlechter Tag macht keinen Trend.', 'Schlaf ist der stärkste Hebel: 7–9 Stunden, möglichst regelmäßige Zeiten.', 'Bleibt die Form mehrere Tage niedrig, obwohl du wenig trainierst: Stress, Infekt oder zu wenig Essen prüfen.', 'Ein erhöhter Ruhepuls am Morgen (5 Schläge über deinem Schnitt) ist oft ein frühes Warnzeichen.', 'Lockere Bewegung und Mobility helfen an müden Tagen meist mehr als komplette Ruhe.'], 'var(--acc)')}</div>`;
}

/* ── Check-in ── */
let we = null;
function wellSheet(k) {
  k = k || today();
  const old = wellOf(k);
  we = { k, w: Object.assign({ sh: 7.5 }, old || {}), isNew: !old };
  const d = fromKey(k);
  const body = () => `<div class="chiprow" style="margin-bottom:6px">${[0, 1, 2].map(i => { const kk = dkey(addDays(new Date(), -i)); return `<button class="chip${kk === we.k ? ' on' : ''}" data-act="wellDay" data-v="${kk}">${['Heute', 'Gestern', 'Vorgestern'][i]}</button>`; }).join('')}</div>
    ${WELL.map(m => `<div class="field"><label>${m.e} ${m.n}</label><div class="card pad" style="padding:8px"><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">${FACES.map((f, i) => `<button class="tgl${we.w[m.k] === i + 1 ? ' on' : ''}" data-act="wellSet" data-k="${m.k}" data-v="${i + 1}">${f}</button>`).join('')}</div>
      <div class="row" style="font-size:11.5px;color:var(--t3);margin-top:4px;padding:0 4px"><span>${m.lo}</span><span>${m.hi}</span></div></div></div>`).join('')}
    <div class="field"><label>🛏️ Schlafdauer</label><div class="stepper"><button data-act="wellSh" data-d="-0.5">−</button><b>${num(we.w.sh)}<small>Stunden</small></b><button data-act="wellSh" data-d="0.5">＋</button></div></div>
    <details${we.w.rhr || we.w.hrv || we.w.kg || we.w.note ? ' open' : ''} style="margin-bottom:12px"><summary class="lnk" style="padding:4px">Mehr eintragen: Ruhepuls, HRV, Gewicht, Notiz ▾</summary>
      <div class="btns" style="grid-template-columns:1fr 1fr 1fr;margin-top:8px"><div class="field"><label>Ruhepuls</label><input inputmode="numeric" data-in="wellNum" data-k="rhr" value="${we.w.rhr || ''}" placeholder="bpm"></div><div class="field"><label>HRV</label><input inputmode="numeric" data-in="wellNum" data-k="hrv" value="${we.w.hrv || ''}" placeholder="ms"></div><div class="field"><label>Gewicht</label><input inputmode="decimal" data-in="wellNum" data-k="kg" value="${we.w.kg ? String(we.w.kg).replace('.', ',') : ''}" placeholder="kg"></div></div>
      <div class="field"><label>Notiz</label><input type="text" data-in="wellNote" value="${esc(we.w.note || '')}" placeholder="z. B. spät gegessen, viel Arbeit"></div></details>
    <div class="stack"><button class="btn primary" data-act="wellSave">Speichern</button>${old ? '<button class="btn danger" data-act="wellDel">Eintrag löschen</button>' : ''}</div>`;
  we.body = body;
  openSheet({ title: k === today() ? 'Wie geht’s dir heute?' : `${DAYS[d.getDay()]}, ${fmtDate(d)}`, left: 'Abbrechen', right: '<button class="lnk r" data-act="wellSave">Speichern</button>', body: body(), onClose() { we = null; } });
}
IN.wellNum = el => { if (we) { const v = numVal(el.value); if (v) we.w[el.dataset.k] = v; else delete we.w[el.dataset.k]; } };
IN.wellNote = el => { if (we) we.w.note = el.value; };

Object.assign(ACT, {
  wellEdit(el) { wellSheet(el.dataset.id || today()); },
  wellDay(el) { const k = el.dataset.v; closeSheet(); wellSheet(k); },
  wellSet(el) { if (!we) return; const k = el.dataset.k, v = +el.dataset.v; if (we.w[k] === v) delete we.w[k]; else we.w[k] = v; $$('.tgl', el.parentElement).forEach(b => b.classList.toggle('on', b === el && we.w[k] === v)); },
  wellSh(el) { if (!we) return; we.w.sh = Math.max(0, Math.min(14, (we.w.sh || 7.5) + +el.dataset.d)); const y = $('.sheet-body', topSheet()).scrollTop; sheetBody(we.body()); $('.sheet-body', topSheet()).scrollTop = y; },
  wellSave() {
    if (!we) return;
    const w = we.w; if (!WELL.some(m => w[m.k])) { toast('Bitte mindestens einen Wert antippen'); return; }
    if (w.note != null) { w.note = w.note.trim(); if (!w.note) delete w.note; }
    S.well[we.k] = w; const k = we.k; save(); closeSheet(); keepScroll(render);
    const v = readiness(k); toast(`Tagesform ${v} · ${readyTxt(v)[1]}`);
  },
  wellDel() { if (!we) return; delete S.well[we.k]; save(); closeSheet(); keepScroll(render); toast('Eintrag gelöscht'); }
});
