'use strict';
/* Erweiterungen: Koch-Timer, Wochen-Analyse, eigene Fotos, Filter, Ziele, Bildnachweise. */

/* ───────── Koch-Timer ─────────
   Zeitangaben in Schritten („10 Minuten“, „1 Std.“) werden zu Timer-Knöpfen. Laufende Timer stehen
   in einer Leiste über allem, überstehen Neuladen (gespeichert als Endzeitpunkt) und melden sich
   mit Ton, Vibration und Hinweis. */
const TIMER_KEY = 'essen.timers';
let timers = (() => { try { const t = JSON.parse(lsGet(TIMER_KEY)); return Array.isArray(t) ? t.filter(x => isObj(x) && isNum(x.end) && isNum(x.total)) : []; } catch (e) { return []; } })();
const saveTimers = () => lsSet(TIMER_KEY, JSON.stringify(timers));
const DUR_RE = /(\d+(?:[,.]\d+)?)(?:\s*[–-]\s*(\d+(?:[,.]\d+)?))?\s*(Std\.|Stunden?|Min\.|Minuten?|Sek\.|Sekunden)/g;
function parseDurations(text) {
  const out = [], seen = new Set();
  for (const m of String(text).matchAll(DUR_RE)) {
    const v = parseFloat(m[1].replace(',', '.')), u = m[3];
    const mult = /^Std|^Stunde/.test(u) ? 3600 : /^Sek/.test(u) ? 1 : 60;
    const sec = Math.round(v * mult);
    if (sec < 20 || sec > 6 * 3600 || seen.has(sec)) continue;
    seen.add(sec);
    out.push({ sec, label: mult === 3600 ? `${fmtDec(v)} Std.` : mult === 1 ? `${fmtInt(v)} Sek.` : `${fmtDec(v)} Min.` });
  }
  return out;
}
function timerChips(text, label, big) {
  const d = parseDurations(text);
  return d.length ? `<span class="tchips${big ? ' big' : ''}">${d.map(x => `<button type="button" class="tchip-btn" data-act="timerStart" data-sec="${x.sec}" data-label="${esc(label)}">${ICON.timer}${x.label}</button>`).join('')}</span>` : '';
}
const fmtClock = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + pad(m) : m) + ':' + pad(x); };
let audio = null;
function unlockAudio() { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; } }
function beep() {
  if (!audio) return;
  try {
    const t0 = audio.currentTime;
    for (let i = 0; i < 3; i++) {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, t0 + i * 0.35); g.gain.exponentialRampToValueAtTime(0.4, t0 + i * 0.35 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.35 + 0.25);
      o.start(t0 + i * 0.35); o.stop(t0 + i * 0.35 + 0.3);
    }
  } catch (e) { /* Ton ist optional */ }
}
function timerBar() {
  let el = $('#timerbar');
  if (!el) { el = document.createElement('div'); el.id = 'timerbar'; el.className = 'timerbar'; el.setAttribute('aria-live', 'polite'); document.body.append(el); }
  const now = Date.now();
  el.hidden = !timers.length;
  el.innerHTML = timers.map(t => {
    const left = (t.end - now) / 1000, done = left <= 0;
    return `<div class="tpill${done ? ' done' : ''}">${ICON.timer}<b>${done ? 'Fertig!' : fmtClock(left)}</b><span>${esc(t.label)}</span>${done ? `<button data-act="timerDismiss" data-id="${t.id}">OK</button>` : `<button data-act="timerCancel" data-id="${t.id}" aria-label="Timer abbrechen">✕</button>`}</div>`;
  }).join('');
}
let timerTick = null;
function runTimers() {
  clearInterval(timerTick);
  if (!timers.length) { timerBar(); return; }
  const tick = () => {
    const now = Date.now();
    for (const t of timers) {
      if (t.end <= now && (!t.rung || (t.rung < 6 && now - t.last > 10000))) {
        t.rung = (t.rung || 0) + 1; t.last = now; saveTimers();
        beep(); if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 600]);
        if (t.rung === 1) toast(`⏰ Zeit ist um: ${t.label}`, { label: 'OK', fn: () => dismissTimer(t.id) });
      }
    }
    timerBar();
  };
  tick(); timerTick = setInterval(tick, 1000);
}
function dismissTimer(id) { timers = timers.filter(t => t.id !== id); saveTimers(); runTimers(); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && timers.length) runTimers(); });

/* ───────── Wochen-Analyse ───────── */
const HERBS = /^(Petersilie|Basilikum|Koriander|Schnittlauch|Dill|Minze|Salbei|Zitronen|Limetten|Knoblauch|Ingwer|Chilischoten)$/;
function weekStats() {
  const keys = weekKeys(), days = [], foods = new Map(), ns = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let meals = 0, fishMeals = 0, legMeals = 0; const warn = [];
  keys.forEach((k, i) => {
    const d = { k, i, kcal: 0, p: 0, fib: 0, salt: 0, veg: 0, n: 0 };
    for (const [m, e] of Object.entries(S.plan[k] || {})) {
      const r = e.r && recipeById(e.r); if (!r) continue;
      const n = nutr(r); if (!n.kcal) continue;
      d.kcal += n.kcal; d.p += n.p; d.fib += n.fib; d.salt += n.salt; d.veg += n.vegPortions; d.n++; meals++;
      if (n.ns) ns[n.ns.grade]++;
      if (n.fish) fishMeals++;
      if (r.ingredients.some(x => { const f = matchFood(x.name); return f && f.grp === 'l'; })) legMeals++;
      if (badAllergens(r).length) warn.push(`${relLabel(i) || wdShort(fromKey(k))} ${meal(m).short}: ${r.name} (${badAllergens(r).map(a => ALLERGENS[a].short).join(', ')})`);
      for (const x of r.ingredients) { const f = matchFood(x.name); if (f && (f.grp === 'v' || f.grp === 'l') && !HERBS.test(f.name)) foods.set(f.id, f); }
    }
    days.push(d);
  });
  const act = days.filter(d => d.n), avg = k => act.length ? act.reduce((a, d) => a + d[k], 0) / act.length : 0;
  return { days, act, meals, fishMeals, legMeals, ns, foods: [...foods.values()], warn, avg: { kcal: avg('kcal'), p: avg('p'), fib: avg('fib'), salt: avg('salt'), veg: avg('veg') } };
}
function openWeekAnalysis() {
  const st = weekStats(), g = goals();
  if (!st.meals) { toast('In den nächsten 7 Tagen sind noch keine Rezepte geplant'); return; }
  const kpi = (lbl, val, goal, unit, lvl) => `<div class="wkpi ${lvl}"><span>${lbl}</span><b>${val}</b><small>${goal}</small></div>`;
  const lvl = (v, lo, hi) => v >= hi ? 'good' : v >= lo ? 'mid' : 'bad';
  const nsT = Object.values(st.ns).reduce((a, b) => a + b, 0) || 1;
  const tips = [];
  const lowVeg = st.act.filter(d => d.veg < 2).length;
  if (lowVeg) tips.push(['info', `An ${lowVeg} von ${st.act.length} geplanten Tagen weniger als 2 Portionen Gemüse – Salat oder Rohkost ergänzen.`]);
  if (st.avg.p < g.protein * 0.6) tips.push(['info', `Ø ${fmtInt(st.avg.p)} g Eiweiß aus den geplanten Mahlzeiten – für dein Ziel (${g.protein} g) fehlen noch Eiweißquellen, z. B. Skyr zum Frühstück oder Hülsenfrüchte.`]);
  if (st.avg.salt > 4) tips.push(['warn', `Recht salzig: Ø ${fmtDec(st.avg.salt)} g Salz pro Tag nur aus diesen Mahlzeiten (empfohlen: max. 6 g insgesamt).`]);
  if (st.legMeals < 2) tips.push(['info', 'Hülsenfrüchte (Linsen, Bohnen, Kichererbsen) 2–3× pro Woche liefern Eiweiß und Ballaststoffe.']);
  if (dietOf() === 'all' && st.fishMeals === 0 && st.meals >= 7) tips.push(['info', 'Die DGE empfiehlt 1–2 Fischmahlzeiten pro Woche – falls du Fisch isst.']);
  if (st.foods.length >= 15) tips.push(['good', `Große Vielfalt: ${st.foods.length} verschiedene Gemüse, Früchte und Hülsenfrüchte.`]);
  if ((st.ns.A + st.ns.B) / nsT >= 0.6) tips.push(['good', `${fmtInt((st.ns.A + st.ns.B) / nsT * 100)} % der Gerichte mit Nutri-Score A oder B.`]);
  openSheet({
    title: 'Analyse · nächste 7 Tage', cls: 'wide', left: '<button class="lnk" data-act="closeSheet">Schließen</button>',
    body: `<p class="small muted" style="margin:0 4px 12px">Durchschnitt pro Person an ${st.act.length} geplanten Tagen (${st.meals} Mahlzeiten). Nicht geplante Mahlzeiten und Snacks fehlen.</p>
      <div class="wkpis">
        ${kpi('Kalorien', fmtInt(st.avg.kcal), `von ${fmtInt(g.kcal)} kcal`, '', lvl(st.avg.kcal / g.kcal, 0.5, 0.75))}
        ${kpi('Eiweiß', fmtInt(st.avg.p) + ' g', `von ${g.protein} g`, '', lvl(st.avg.p / g.protein, 0.5, 0.75))}
        ${kpi('Gemüse & Obst', fmtDec(st.avg.veg), 'von 5 Portionen', '', lvl(st.avg.veg, 2, 3.5))}
        ${kpi('Ballaststoffe', fmtInt(st.avg.fib) + ' g', 'von 30 g', '', lvl(st.avg.fib, 15, 22))}
        ${kpi('Salz', fmtDec(st.avg.salt) + ' g', 'max. 6 g', '', st.avg.salt > 5 ? 'bad' : st.avg.salt > 3.5 ? 'mid' : 'good')}
      </div>
      <div class="wk-grid"><div>
      <div class="section-t">Tag für Tag</div>
      <div class="card wdays">${st.days.map(d => `<div class="wday${d.n ? '' : ' none'}"><b>${relLabel(d.i) || wdShort(fromKey(d.k))}</b>${d.n ? `<span class="wbar" title="${fmtInt(d.kcal)} kcal"><i style="width:${Math.min(100, d.kcal / g.kcal * 100)}%"></i></span><span class="wv">${fmtInt(d.kcal)} kcal</span><span class="wv">${fmtInt(d.p)} g E.</span>${vegDotsHTML(d.veg)}` : '<span class="wv muted">nichts geplant</span>'}</div>`).join('')}</div>
      <div class="section-t">Nutri-Score der Gerichte</div>
      <div class="card" style="padding:14px"><div class="nsdist">${'ABCDE'.split('').filter(k => st.ns[k]).map(k => `<i class="ns-${k}" style="flex:${st.ns[k]}">${k} · ${st.ns[k]}</i>`).join('')}</div></div>
      </div><div>
      ${tips.length ? `<div class="section-t">Hinweise</div><ul class="tips">${tips.map(([l, t]) => `<li class="${l}">${esc(t)}</li>`).join('')}</ul>` : ''}
      ${st.warn.length ? `<div class="section-t">⚠ Gemiedene Allergene</div><div class="card" style="padding:12px 14px;font-size:14px;line-height:1.6">${st.warn.map(esc).join('<br>')}</div>` : ''}
      <div class="section-t">Vielfalt: ${st.foods.length} Gemüse, Früchte & Hülsenfrüchte</div>
      <div class="card vfoods">${st.foods.sort((a, b) => a.name.localeCompare(b.name, 'de')).map(f => `<span>${f.emoji} ${esc(f.name)}</span>`).join('') || '<span class="muted">–</span>'}</div>
      </div></div>`,
  });
}

/* ───────── Eigene Fotos ───────── */
function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Bild konnte nicht gelesen werden')); };
    img.src = url;
  });
}
// Auf 4:3 zuschneiden und verkleinern, damit es klein genug für Speicher und Abgleich bleibt
async function photoData(file) {
  const img = await loadImage(file), W = 640, H = 480;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * sc, h = img.naturalHeight * sc;
  c.getContext('2d').drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  let q = 0.78, d = c.toDataURL('image/jpeg', q);
  while (d.length > 160000 && q > 0.4) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
  return d;
}
CHANGE.photoPick = async el => {
  const sh = el.closest('.sheet'), f = el.files && el.files[0]; el.value = '';
  if (!sh || !f) return;
  if (!/^image\//.test(f.type)) { toast('Bitte eine Bilddatei wählen'); return; }
  try {
    sh._photo = await photoData(f);
    $('.pe-prev', sh).innerHTML = `<span class="pe-img"><img src="${sh._photo}" alt=""></span>`;
    const rm = $('[data-act="photoRemove"]', sh); if (rm) rm.hidden = false;
    const entry = sheetStack.find(x => x.sh === sh); if (entry) entry.dirty = true;
  } catch (e) { toast('Das Foto konnte nicht geladen werden'); }
};
CHANGE.strict = el => { ui.strict = el.checked; drawFilterCount(topSheet()); };

/* ───────── Bildnachweise ───────── */
function openCredits() {
  const list = BUILTINS.filter(r => typeof PHOTOS !== 'undefined' && PHOTOS[r.id]).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  const sh = openSheet({
    title: 'Bildnachweise', left: '<button class="lnk" data-act="closeSheet">Schließen</button>',
    body: `<p class="small muted" style="margin:0 4px 12px">Die Fotos der eingebauten Rezepte sind Symbolbilder von Wikimedia Commons unter freien Lizenzen (Creative Commons bzw. gemeinfrei). Sie wurden zugeschnitten und verkleinert. Sie zeigen ein ähnliches Gericht, nicht genau dieses Rezept. ${list.length} Fotos.</p>
      <div class="card credits" id="creditList"></div>`,
  });
  const el = $('#creditList', sh);
  if (!list.length) { el.innerHTML = '<p class="muted" style="padding:14px">Keine Fotos vorhanden.</p>'; return; }
  chunked(el, list, r => { const [a, l, f] = PHOTOS[r.id]; return `<div class="cred">${thumbHTML(r, 'pthumb')}<span><b>${esc(r.name)}</b><small>${esc(a || 'unbekannt')} · ${esc(l)} · <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(f)}" target="_blank" rel="noopener">Quelle</a></small></span></div>`; }, 60);
}

/* ───────── Aktionen ───────── */
Object.assign(ACT, {
  timerStart(el) {
    unlockAudio();
    const sec = +el.dataset.sec; if (!sec) return;
    timers.push({ id: uid(), label: el.dataset.label || 'Timer', total: sec, end: Date.now() + sec * 1000 });
    saveTimers(); runTimers();
    toast(`Timer gestartet: ${fmtClock(sec)}`);
  },
  timerCancel(el) { dismissTimer(el.dataset.id); },
  timerDismiss(el) { dismissTimer(el.dataset.id); },
  weekAnalysis() { openWeekAnalysis(); },
  credits() { openCredits(); },
  photoRemove(el) {
    const sh = el.closest('.sheet'); if (!sh) return;
    sh._photo = null; el.hidden = true;
    const r = sh.dataset.edit ? recipeById(sh.dataset.edit) : null;
    $('.pe-prev', sh).innerHTML = thumbHTML(r ? { ...r, photo: undefined } : { emoji: $('#f-emoji', sh).value, id: '' }, 'pe-img');
    const entry = sheetStack.find(x => x.sh === sh); if (entry) entry.dirty = true;
  },
  nutBasis(el) {
    const sh = topSheet(), r = sh && recipeById(sh.dataset.recipe); if (!r) return;
    $$('#nutBasis button', sh).forEach(b => b.classList.toggle('on', b === el));
    $('#nutTable', sh).innerHTML = nutTableHTML(nutr(r), el.dataset.v);
  },
  recipeSwap(el) { const id = el.dataset.id; closeSheet(true); setTimeout(() => openRecipe(id), 220); },
  filterOpen() { openFilters(); },
  filterSet(el) {
    const { k, v } = el.dataset; ui.f = { ...(ui.f || {}) };
    if (v) ui.f[k] = v; else delete ui.f[k];
    $$(`[data-filter="${k}"] button`, topSheet()).forEach(b => b.classList.toggle('on', b === el));
    drawFilterCount(topSheet());
  },
  filterReset() {
    ui.f = {}; ui.strict = false;
    const sh = topSheet(); if (!sh) return;
    $$('[data-filter]', sh).forEach(g => $$('button', g).forEach(b => b.classList.toggle('on', b.dataset.v === '')));
    const c = $('[data-change="strict"]', sh); if (c) c.checked = false;
    drawFilterCount(sh);
  },
  filterClear(el) { const k = el.dataset.k; if (k === 'strict') ui.strict = false; else { ui.f = { ...(ui.f || {}) }; delete ui.f[k]; } renderRecipeList(); },
  goalsOpen() { closeAllSheets(); S.ui.view = 'more'; saveUI(); render(); setTimeout(() => { const g = $('#goals'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); },
  goalStep(el) {
    const k = el.dataset.k, g = goals(), lim = k === 'kcal' ? [1000, 4500] : [20, 250];
    const v = Math.max(lim[0], Math.min(lim[1], g[k] + +el.dataset.n));
    S.settings = { ...S.settings, goals: { ...(isObj(S.settings.goals) ? S.settings.goals : {}), [k]: v } }; save();
    el.parentElement.querySelector('output').textContent = k === 'kcal' ? fmtInt(v) : v + ' g';
  },
  dietSet(el) {
    S.settings = { ...S.settings, diet: el.dataset.v }; save();
    $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el));
  },
  avoidToggle(el) {
    const a = el.dataset.a, cur = avoidList();
    S.settings = { ...S.settings, avoid: cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a] }; save();
    el.classList.toggle('on', avoidList().includes(a));
  },
});

document.addEventListener('DOMContentLoaded', runTimers);
