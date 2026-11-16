'use strict';
/* ═══ AUSRÜSTUNG: Profile (Alles · Zuhause · Studio · Unterwegs · Ohne Geräte),
   Machbarkeit je Übung, gleichwertiger Ersatz in Vorlagen und Routinen ═══ */

const GP = {
  all: { n: 'Alles', e: '♾️', fixed: true, d: 'Kein Filter – alle Übungen werden angezeigt.' },
  home: { n: 'Zuhause', e: '🏠' },
  gym: { n: 'Studio', e: '🏢' },
  travel: { n: 'Unterwegs', e: '🧳' },
  none: { n: 'Ohne Geräte', e: '🙌', fixed: true, d: 'Nur Körpergewicht und Dinge, die überall da sind (Wand, Stuhl, Handtuch).' }
};
function gearState() {
  if (!S.gear || !S.gear.sets) S.gear = { p: 'all', sets: JSON.parse(JSON.stringify(X.GEAR_PRESETS)) };
  return S.gear;
}
// null = kein Filter
function gearHave() { const g = gearState(); return g.p === 'all' ? null : g.p === 'none' ? [] : (g.sets[g.p] || []); }
function missing(id) {
  const e = E[id], h = gearHave();
  if (!e || !e.req || !h) return [];
  return e.req.filter(grp => !grp.some(k => h.includes(k)));
}
const canDo = id => !missing(id).length;
const gearName = k => X.GEAR[k] ? X.GEAR[k].n.split(' (')[0] : k;
const missTxt = id => missing(id).map(g => g.map(gearName).join(' oder ')).join(' + ');
const gearOn = () => gearState().p !== 'all';
const doable = () => Object.keys(E).filter(canDo).length;

// Bester machbarer Ersatz: gleicher Hauptmuskel/gleiche Gruppe, gleiche Art, möglichst hohe Einstufung
function altFor(id, avoid) {
  const e = E[id]; if (!e) return null;
  const ord = 'SABCD', mob = e.t === 'mob';
  let best = null, bs = -1;
  Object.values(E).forEach(c => {
    if (c.id === id || (avoid && avoid.includes(c.id)) || !canDo(c.id) || 'CD'.includes(c.tier) || (c.t === 'mob') !== mob) return;
    let sc = 0;
    if (c.m[0] === e.m[0]) sc += 6;
    if (e.grp && c.tiers[e.grp]) sc += 4 + (4 - ord.indexOf(c.tiers[e.grp]));
    sc += c.m.filter(m => e.m.includes(m)).length * 1.5;
    if (c.t === e.t) sc += 2;
    if (c.tr === e.tr) sc += 1;
    sc += (4 - ord.indexOf(c.tier)) * 0.5;
    if (sc > bs && (c.m[0] === e.m[0] || (e.grp && c.tiers[e.grp]) || c.m.some(m => e.m.includes(m)))) { bs = sc; best = c.id; }
  });
  return best;
}
// Vorlagen ({x,…}) und Routinen ([x, s]) an die Ausrüstung anpassen
function resolveItems(items) {
  const used = items.map(it => Array.isArray(it) ? it[0] : it.x);
  return items.map(it => {
    const x = Array.isArray(it) ? it[0] : it.x;
    if (!E[x] || canDo(x)) return it;
    const a = altFor(x, used);
    if (a) used.push(a);
    if (Array.isArray(it)) return a ? Object.assign([a, it[1]], { orig: x }) : Object.assign(it.slice(), { na: 1 });
    if (!a) return Object.assign({}, it, { na: 1 });
    const n = Object.assign({}, it, { x: a, orig: x }), ea = E[a];
    if ((ea.tr === 't' || ea.tr === 'wt') && !n.sec) { n.sec = ea.hold; delete n.r; }
    if (ea.tr !== 't' && ea.tr !== 'wt' && n.sec) { delete n.sec; n.r = ea.dose.replace(/^\d+×\s*/, ''); }
    return n;
  });
}
const swapNote = (orig, it) => it.na ? `⚠️ nicht machbar – fehlt: ${missTxt(orig)}` : `↔ statt ${E[orig].n} (fehlt: ${missTxt(orig)})`;

/* ── Oberfläche ── */
function gearChip() {
  const g = gearState(), p = GP[g.p];
  return `<button class="chip gearchip${g.p !== 'all' ? ' on' : ''}" data-act="gear">🧰 ${esc(p.n)}${g.p !== 'all' ? ` · ${doable()}/${Object.keys(E).length}` : ''} ▾</button>`;
}
function gearBody() {
  const g = gearState(), p = GP[g.p], have = gearHave();
  const grid = !p.fixed ? `<div class="sec" style="margin:14px 4px 8px">Was hast du ${g.p === 'gym' ? 'im Studio' : g.p === 'travel' ? 'unterwegs dabei' : 'zu Hause'}?</div>
    <div class="gear">${Object.entries(X.GEAR).map(([k, v]) => `<button class="gi${have.includes(k) ? ' on' : ''}" data-act="gearTog" data-k="${k}"><span>${v.e}</span><b>${esc(v.n)}</b><i>${have.includes(k) ? '✓' : ''}</i></button>`).join('')}</div>
    <p class="small muted" style="margin:10px 4px 0">Wand, Türrahmen, Stuhl, Sofa, Bett, Handtuch und Besenstiel setzt die App immer voraus – z. B. Sofa statt Bank beim Hip Thrust.</p>` : `<p class="p" style="margin:14px 4px 0">${p.d}</p>`;
  const nE = Object.keys(E).length, nD = doable();
  return `<div class="seg" style="grid-auto-flow:row;grid-template-columns:repeat(3,1fr)">${Object.entries(GP).map(([k, v]) => `<button data-act="gearP" data-v="${k}" class="${g.p === k ? 'on' : ''}">${v.e} ${v.n}</button>`).join('')}</div>
    <div class="card pad"><div class="row"><span><b>${nD} von ${nE} Übungen machbar</b><br><span class="small muted">${g.p === 'all' ? 'Filter aus' : 'Listen, Plan und Empfehlungen zeigen nur Machbares. Vorlagen und Routinen tauschen fehlende Übungen automatisch gegen gleichwertige.'}</span></span></div>
      <div class="meter" style="margin-top:10px"><i style="width:${Math.round(nD / nE * 100)}%"></i></div></div>
    ${grid}
    <button class="btn primary" data-act="gearDone" style="margin-top:16px;width:100%">Fertig</button>`;
}
function gearSheet() { openSheet({ title: 'Meine Ausrüstung', body: gearBody(), onClose() { keepScroll(render); } }); }

Object.assign(ACT, {
  gear() { gearSheet(); },
  gearP(el) { gearState().p = el.dataset.v; save(); sheetBody(gearBody()); },
  gearTog(el) {
    const g = gearState(), k = el.dataset.k, a = g.sets[g.p] = g.sets[g.p] || [];
    const i = a.indexOf(k); if (i >= 0) a.splice(i, 1); else a.push(k);
    save(); const y = $('.sheet-body', topSheet()).scrollTop; sheetBody(gearBody()); $('.sheet-body', topSheet()).scrollTop = y;
  },
  gearDone() { closeSheet(); },
  gearShowNA() { ui.gearShow = !ui.gearShow; keepScroll(render); }
});
