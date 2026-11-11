'use strict';
/* Essens-Tinder: Rezepte bewerten (Fee & Flo), Ranking und Vorschläge „Demnächst kochen“. */

const USERS = ['Fee', 'Flo'];
// Bewertung → Punkte fürs Ranking
const VOTES = {
  2: { label: 'Super-Like', short: 'Super', icon: '⭐', w: 3 },
  1: { label: 'Like', short: 'Ja', icon: '♥', w: 1 },
  '-1': { label: 'Dislike', short: 'Nein', icon: '✕', w: -1 },
  '-2': { label: 'Super-Dislike', short: 'Nie', icon: '⛔', w: -3 },
};
const sw = { mode: 'swipe', deck: 'main', cur: null, last: [], sugFor: 'both', sugMeal: 'main', seed: Date.now() };

function votesOf(u) { S.votes = S.votes || {}; S.votes[u] = S.votes[u] || {}; return S.votes[u]; }
const voteOf = (u, id) => (S.votes && S.votes[u] ? S.votes[u][id] : undefined);
const voteBadge = v => v == null ? '<span class="vb none">–</span>' : `<span class="vb v${v}">${VOTES[v].icon}</span>`;

function deckList() {
  const all = allRecipes();
  const f = {
    all: () => true,
    main: isMainDish,
    breakfast: isBreakfast,
    sweet: r => (r.tags || []).some(t => /süß|dessert|snack|backen/i.test(t)),
    veggie: r => !nutr(r).fish,
    fish: r => nutr(r).fish,
  }[sw.deck] || (() => true);
  return all.filter(f);
}
function pickNext() {
  const u = S.ui.who; if (!u) return null;
  const mine = votesOf(u);
  const open = deckList().filter(r => mine[r.id] === undefined);
  if (!open.length) return null;
  // Öfter Rezepte zeigen, die der/die andere mag → mehr Matches
  const other = USERS.find(x => x !== u);
  const liked = open.filter(r => (voteOf(other, r.id) || 0) > 0);
  const src = liked.length && Math.random() < 0.4 ? liked : open;
  return src[Math.floor(Math.random() * src.length)];
}

/* ── Ansicht ── */
function viewSwipe() {
  const seg = [['swipe', '🔥 Swipen'], ['rank', '🏆 Ranking'], ['soon', '🍳 Demnächst']];
  return `<div class="seg swseg">${seg.map(([k, l]) => `<button data-act="swMode" data-m="${k}" class="${sw.mode === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="swarea"></div>`;
}
function renderSwipe() {
  const el = $('#swarea'); if (!el) return;
  if (sw.mode === 'rank') { el.innerHTML = rankHTML(); return; }
  if (sw.mode === 'soon') { el.innerHTML = soonHTML(); return; }
  const u = S.ui.who;
  let h = `<div class="who">${USERS.map(x => `<button class="who-b${u === x ? ' on' : ''}" data-act="swWho" data-u="${x}">${x === 'Fee' ? '👩' : '👨'} ${x}</button>`).join('')}</div>`;
  if (!u) { el.innerHTML = h + `<div class="empty"><div class="big">👆</div><b>Wer swipet?</b>Wähle oben deinen Namen, dann geht's los.</div>`; return; }
  const list = deckList(), mine = votesOf(u), done = list.filter(r => mine[r.id] !== undefined).length;
  h += `<div class="swbar"><select data-change="swDeck" aria-label="Stapel">${[['main', 'Hauptgerichte'], ['all', 'Alle Rezepte'], ['breakfast', 'Frühstück'], ['sweet', 'Süßes & Snacks'], ['veggie', 'Vegetarisch'], ['fish', 'Fisch']].map(([k, l]) => `<option value="${k}" ${sw.deck === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <span class="small muted">${done} / ${list.length} bewertet</span></div>`;
  if (!sw.cur || mine[sw.cur] !== undefined || !list.some(r => r.id === sw.cur)) sw.cur = (pickNext() || {}).id || null;
  const r = sw.cur && recipeById(sw.cur);
  if (!r) {
    el.innerHTML = h + `<div class="empty"><div class="big">🎉</div><b>Alles bewertet!</b>Wähle einen anderen Stapel oder schau dir das Ranking an.</div>
      <button class="btn soft" data-act="swMode" data-m="rank" style="width:100%">🏆 Zum Ranking</button>`;
    return;
  }
  const n = nutr(r), other = USERS.find(x => x !== u), ov = voteOf(other, r.id);
  const ings = r.ingredients.filter(i => i.amount != null).slice(0, 6).map(i => shortName(i.name)).join(', ');
  h += `<div class="deck">
    <div class="tcard" id="tcard">
      <div class="stamp s-like">JA ♥</div><div class="stamp s-dis">NEIN ✕</div><div class="stamp s-super">SUPER ⭐</div><div class="stamp s-never">NIE ⛔</div>
      <div class="tc-e">${esc(r.emoji || '🍽️')}</div>
      <h2>${esc(r.name)}</h2>
      <div class="meta">${r.time ? `<span class="pill">⏱ ${r.time} Min.</span>` : ''}${n.kcal ? `<span class="pill">${fmtInt(n.kcal)} kcal</span><span class="pill">💪 ${Math.round(n.pp)} %</span>` : ''}<span class="pill">${n.fish ? '🐟 Fisch' : n.vegan ? '🌱 Vegan' : '🥕 Vegetarisch'}</span></div>
      <p class="tc-ing">${esc(ings)}</p>
      ${ov !== undefined && ov > 0 ? `<p class="tc-hint">${esc(other)} mag das schon ${VOTES[ov].icon}</p>` : ''}
      <p class="tc-tap">Antippen für das ganze Rezept</p>
    </div></div>
    <div class="vbtns">
      <button class="vbtn never" data-act="swVote" data-v="-2" aria-label="Super-Dislike">⛔<small>Nie</small></button>
      <button class="vbtn dis" data-act="swVote" data-v="-1" aria-label="Dislike">✕<small>Nein</small></button>
      <button class="vbtn undo" data-act="swUndo" aria-label="Rückgängig" ${sw.last.length ? '' : 'disabled'}>↩<small>Zurück</small></button>
      <button class="vbtn like" data-act="swVote" data-v="1" aria-label="Like">♥<small>Ja</small></button>
      <button class="vbtn super" data-act="swVote" data-v="2" aria-label="Super-Like">⭐<small>Super</small></button>
    </div>
    <p class="small muted" style="text-align:center;margin-top:10px">Wischen: → Ja · ← Nein · ↑ Super · ↓ Nie</p>`;
  el.innerHTML = h;
  bindCard($('#tcard'));
}

/* ── Wischen ── */
function bindCard(card) {
  let st = null;
  const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : (dy < 0 ? 2 : -2);
  card.addEventListener('pointerdown', e => {
    st = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
    card.setPointerCapture(e.pointerId); card.style.transition = 'none';
  });
  card.addEventListener('pointermove', e => {
    if (!st) return;
    st.dx = e.clientX - st.x; st.dy = e.clientY - st.y;
    card.style.transform = `translate(${st.dx}px,${st.dy}px) rotate(${st.dx / 18}deg)`;
    const d = dirOf(st.dx, st.dy), strength = Math.min(1, Math.max(Math.abs(st.dx), Math.abs(st.dy)) / 100);
    $$('.stamp', card).forEach(s => { s.style.opacity = 0; });
    const map = { 1: '.s-like', '-1': '.s-dis', 2: '.s-super', '-2': '.s-never' };
    $(map[d], card).style.opacity = strength;
  });
  const end = () => {
    if (!st) return;
    const { dx, dy } = st; st = null;
    const dist = Math.max(Math.abs(dx), Math.abs(dy));
    if (dist < 6) { card.style.transition = ''; card.style.transform = ''; openRecipe(sw.cur); return; }
    if (dist > 90) { swVote(dirOf(dx, dy)); return; }
    card.style.transition = ''; card.style.transform = '';
    $$('.stamp', card).forEach(s => { s.style.opacity = 0; });
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}
function swVote(v) {
  const u = S.ui.who, id = sw.cur; if (!u || !id) return;
  const card = $('#tcard');
  const fly = { 1: 'translate(140%,0) rotate(20deg)', '-1': 'translate(-140%,0) rotate(-20deg)', 2: 'translate(0,-140%)', '-2': 'translate(0,140%)' }[v];
  const stamp = { 1: '.s-like', '-1': '.s-dis', 2: '.s-super', '-2': '.s-never' }[v];
  if (card) { card.style.transition = 'transform .28s ease-in, opacity .28s'; $(stamp, card).style.opacity = 1; card.style.transform = fly; card.style.opacity = 0; }
  const mine = votesOf(u);
  sw.last.push({ u, id, prev: mine[id] }); if (sw.last.length > 30) sw.last.shift();
  mine[id] = v; save();
  if (navigator.vibrate) navigator.vibrate(v === 2 || v === -2 ? 25 : 10);
  const other = USERS.find(x => x !== u), ov = voteOf(other, id);
  if (v > 0 && ov > 0) { const r = recipeById(id); toast(`💘 Match! Ihr beide mögt „${r.name}“`); }
  sw.cur = null;
  setTimeout(renderSwipe, card ? 260 : 0);
}

/* ── Ranking ── */
function scoreOf(id, users = USERS) {
  let s = 0, n = 0, veto = false;
  for (const u of users) { const v = voteOf(u, id); if (v === undefined) continue; s += VOTES[v].w; n++; if (v === -2) veto = true; }
  return { s, n, veto };
}
function rankHTML() {
  const rows = allRecipes().map(r => ({ r, ...scoreOf(r.id), vs: USERS.map(u => voteOf(u, r.id)) })).filter(x => x.n > 0);
  if (!rows.length) return `<div class="empty"><div class="big">🏆</div><b>Noch keine Bewertungen</b>Swipe ein paar Rezepte, dann entsteht hier eure Rangliste.</div><button class="btn primary" data-act="swMode" data-m="swipe" style="width:100%">🔥 Los swipen</button>`;
  rows.sort((a, b) => (b.s - a.s) || (b.n - a.n) || a.r.name.localeCompare(b.r.name, 'de'));
  const both = USERS.map(u => Object.keys(votesOf(u)).length);
  const matches = rows.filter(x => x.vs.every(v => v > 0));
  const nogo = rows.filter(x => x.veto);
  const ranked = rows.filter(x => !x.veto);
  const row = (x, i) => `<button class="card rrow" data-act="recipeOpen" data-id="${x.r.id}">
      <span class="rk">${i != null ? i + 1 : ''}</span><span class="remoji">${esc(x.r.emoji || '🍽️')}</span>
      <span class="rbody"><b>${esc(x.r.name)}</b><small>${USERS.map((u, j) => `${u} ${voteBadge(x.vs[j])}`).join(' &nbsp; ')}</small></span>
      <span class="rs ${x.s > 0 ? 'pos' : x.s < 0 ? 'neg' : ''}">${x.s > 0 ? '+' : ''}${x.s}</span></button>`;
  let h = `<div class="small muted" style="margin:4px 4px 12px">Bewertet: ${USERS.map((u, i) => `${u} ${both[i]}`).join(' · ')} · Punkte: ⭐ +3 · ♥ +1 · ✕ −1 · ⛔ −3</div>`;
  if (matches.length) h += `<div class="section-t">💘 Matches – beide mögen es (${matches.length})</div><div class="list">${matches.slice(0, 15).map(x => row(x, null)).join('')}</div>`;
  h += `<div class="section-t">🏆 Gesamt-Ranking</div><div class="list">${ranked.slice(0, 100).map((x, i) => row(x, i)).join('')}</div>`;
  if (ranked.length > 100) h += `<p class="small muted" style="text-align:center;margin-top:8px">Top 100 von ${ranked.length} angezeigt</p>`;
  if (nogo.length) h += `<details class="nogo"><summary class="section-t">⛔ No-Gos (${nogo.length})</summary><div class="list">${nogo.map(x => row(x, null)).join('')}</div></details>`;
  h += `<button class="btn plain" data-act="swSync" style="width:100%;margin-top:18px">⇄ Bewertungen zwischen Handys übertragen</button>`;
  return h;
}

/* ── Demnächst kochen ── */
const seededRand = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
function plannedDaysAgo(id) {
  // Abstand in Tagen zur nächsten Planung dieses Rezepts (−21 … +14), sonst null
  const today = startOfDay(new Date()); let best = null;
  for (const [k, day] of Object.entries(S.plan)) {
    if (!Object.values(day).some(e => e.r === id)) continue;
    const diff = Math.round((today - fromKey(k)) / 864e5);
    if (diff > 21 || diff < -14) continue;
    if (best === null || Math.abs(diff) < Math.abs(best)) best = diff;
  }
  return best;
}
function suggestions(opts = {}) {
  const users = opts.for && opts.for !== 'both' ? [opts.for] : USERS;
  const meal = opts.meal || 'main';
  const pool = allRecipes().filter(meal === 'breakfast' ? isBreakfast : meal === 'all' ? () => true : isMainDish);
  const seed = String(opts.seed != null ? opts.seed : sw.seed);
  return pool.map(r => {
    // Ein „Nie“ von irgendwem schließt das Gericht immer aus
    if (USERS.some(u => voteOf(u, r.id) === -2)) return null;
    const { s, n } = scoreOf(r.id, users);
    const vs = users.map(u => voteOf(u, r.id));
    if (n && vs.every(v => v === undefined || v < 0)) return null;
    let score = n ? s : 0.4; // unbewertete Rezepte bekommen eine kleine Chance
    const pd = plannedDaysAgo(r.id);
    if (pd !== null) score -= 4;
    if (isFav(r.id)) score += 0.5;
    score += seededRand(r.id + seed) * 1.6;
    const why = [];
    if (users.length > 1 && vs.every(v => v > 0)) why.push('💘 Match');
    users.forEach((u, i) => { if (vs[i] === 2) why.push(`⭐ ${u}`); else if (vs[i] === 1) why.push(`♥ ${u}`); });
    if (!n) why.push('✨ Neu entdecken');
    if (pd !== null) why.push(pd > 0 ? `zuletzt vor ${pd} Tagen` : pd === 0 ? 'heute geplant' : `geplant in ${-pd} Tagen`);
    return { r, score, why };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}
function soonHTML() {
  const list = suggestions({ for: sw.sugFor, meal: sw.sugMeal }).slice(0, 12);
  let h = `<div class="field"><div class="seg">${[['both', '👫 Beide'], ['Fee', '👩 Fee'], ['Flo', '👨 Flo']].map(([k, l]) => `<button data-act="swSugFor" data-v="${k}" class="${sw.sugFor === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <div class="field"><div class="seg">${[['main', 'Hauptgerichte'], ['breakfast', 'Frühstück'], ['all', 'Alles']].map(([k, l]) => `<button data-act="swSugMeal" data-v="${k}" class="${sw.sugMeal === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <div class="row" style="margin-bottom:14px"><button class="btn" data-act="swReshuffle">🎲 Neue Vorschläge</button><button class="btn primary" data-act="swFillWeek">📅 Woche füllen</button></div>`;
  if (!list.length) return h + `<div class="empty"><div class="big">🤷</div><b>Keine Vorschläge</b>Bewertet ein paar Rezepte positiv, dann klappt's.</div>`;
  h += `<div class="list">${list.map(x => `<div class="card sug">
      <button class="sug-main" data-act="recipeOpen" data-id="${x.r.id}"><span class="remoji">${esc(x.r.emoji || '🍽️')}</span>
        <span class="rbody"><b>${esc(x.r.name)}</b><small>${recipeMeta(x.r)}</small><small class="why">${x.why.map(esc).join(' · ')}</small></span></button>
      <button class="hbtn" data-act="recipeToPlan" data-id="${x.r.id}" aria-label="Planen">📅</button></div>`).join('')}</div>
    <p class="small muted" style="text-align:center;margin-top:10px">Basierend auf euren Bewertungen. „Nie“ wird nie vorgeschlagen, kürzlich Geplantes rutscht nach hinten.</p>`;
  return h;
}

/* ── Übertragen zwischen Handys ── */
const shortHash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
const VCODE = { 2: 'S', 1: 'L', '-1': 'D', '-2': 'N' }, VDECODE = { S: 2, L: 1, D: -1, N: -2 };
function exportVotes(u) {
  return `ESSENSTINDER|${u}|` + Object.entries(votesOf(u)).map(([id, v]) => shortHash(id) + VCODE[v]).join(',');
}
function importVotes(text) {
  const m = text.trim().match(/ESSENSTINDER\|(Fee|Flo)\|([0-9a-zSLDN,]*)/);
  if (!m) return null;
  const u = m[1], byHash = new Map();
  [...BUILTINS, ...S.recipes].forEach(r => byHash.set(shortHash(r.id), r.id));
  let n = 0; const mine = votesOf(u);
  for (const part of m[2].split(',').filter(Boolean)) {
    const id = byHash.get(part.slice(0, -1)), v = VDECODE[part.slice(-1)];
    if (id && v !== undefined) { mine[id] = v; n++; }
  }
  save(); return { u, n };
}
function openSync() {
  openSheet({
    title: 'Bewertungen übertragen',
    left: '<button class="lnk" data-act="closeSheet">Fertig</button>',
    body: `<p class="small muted" style="margin:0 4px 12px">Swipt ihr auf zwei Handys? Dann schickt euch eure Bewertungen als Code (z. B. per WhatsApp) und fügt ihn beim anderen ein.</p>
      <div class="section-t">1. Code senden</div>
      <div class="row">${USERS.map(u => `<button class="btn soft" data-act="swExport" data-u="${u}">📤 ${u} (${Object.keys(votesOf(u)).length})</button>`).join('')}</div>
      <div class="section-t">2. Code einfügen</div>
      <textarea id="swCode" rows="4" placeholder="ESSENSTINDER|Fee|…"></textarea>
      <button class="btn primary" data-act="swImport" style="width:100%;margin-top:10px">Bewertungen übernehmen</button>
      <div class="section-t">Zurücksetzen</div>
      <div class="row">${USERS.map(u => `<button class="btn danger" data-act="swReset" data-u="${u}">Alle von ${u} löschen</button>`).join('')}</div>`,
  });
}

/* ── Aktionen ── */
Object.assign(ACT, {
  swMode(el) { sw.mode = el.dataset.m; $$('.swseg button').forEach(b => b.classList.toggle('on', b.dataset.m === sw.mode)); renderSwipe(); window.scrollTo(0, 0); },
  swWho(el) { S.ui.who = el.dataset.u; sw.cur = null; sw.last = []; save(); renderSwipe(); },
  swVote(el) { swVote(+el.dataset.v); },
  swUndo() {
    const l = sw.last.pop(); if (!l) return;
    const mine = votesOf(l.u);
    if (l.prev === undefined) delete mine[l.id]; else mine[l.id] = l.prev;
    S.ui.who = l.u; sw.cur = l.id; save(); renderSwipe();
  },
  swSugFor(el) { sw.sugFor = el.dataset.v; renderSwipe(); },
  swSugMeal(el) { sw.sugMeal = el.dataset.v; renderSwipe(); },
  swReshuffle() { sw.seed = Date.now(); renderSwipe(); },
  swFillWeek() { ACT.weekRandom(); },
  swSync() { openSync(); },
  async swExport(el) {
    const u = el.dataset.u, text = exportVotes(u);
    if (!Object.keys(votesOf(u)).length) { toast(`${u} hat noch nichts bewertet`); return; }
    if (navigator.share) { try { await navigator.share({ title: `Essenstinder ${u}`, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(text); toast('Code kopiert'); } catch (e) { $('#swCode').value = text; toast('Code unten markieren und kopieren'); }
  },
  swImport() {
    const res = importVotes($('#swCode').value || '');
    if (!res) { toast('Kein gültiger Code'); return; }
    closeSheet(); renderSwipe(); toast(`${res.n} Bewertungen von ${res.u} übernommen`);
  },
  swReset(el) {
    const u = el.dataset.u;
    confirmSheet(`Alle Bewertungen von ${u} löschen?`, 'Löschen', () => { S.votes[u] = {}; save(); closeAllSheets(); renderSwipe(); toast('Gelöscht'); });
  },
});
CHANGE.swDeck = el => { sw.deck = el.value; sw.cur = null; renderSwipe(); };

/* „Auffüllen“ im Wochenplan nutzt jetzt eure Bewertungen */
ACT.weekRandom = function () {
  const all = allRecipes();
  if (!all.length) { toast('Lege zuerst Rezepte an'); return; }
  const used = new Set(weekKeys().flatMap(k => Object.values(S.plan[k] || {}).map(e => e.r)).filter(Boolean));
  const seed = Date.now();
  const lists = { main: suggestions({ meal: 'main', seed }), breakfast: suggestions({ meal: 'breakfast', seed }) };
  const take = kind => {
    const x = lists[kind].find(s => !used.has(s.r.id));
    if (!x) return null;
    used.add(x.r.id); return x.r;
  };
  let n = 0;
  for (const k of weekKeys()) {
    if (k < dkey(new Date())) continue;
    for (const m of S.settings.meals) {
      if (S.plan[k]?.[m]) continue;
      const r = take(m === 'f' ? 'breakfast' : 'main'); if (!r) continue;
      S.plan[k] = S.plan[k] || {}; S.plan[k][m] = { r: r.id, s: S.settings.servings }; n++;
    }
  }
  save(); render();
  toast(n ? `${n} Gerichte eingeplant – passend zu euren Bewertungen` : 'Keine freien Plätze');
};
