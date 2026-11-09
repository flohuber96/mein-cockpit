'use strict';
/* ───────── Server-Sync über Supabase ─────────
   Alles bleibt zusätzlich lokal gespeichert (funktioniert offline).
   Änderungen gehen im Hintergrund an den Server, Änderungen vom anderen Handy
   kommen beim Öffnen und alle 20 Sekunden herein.
   Jeder Eintrag ist eine Zeile in der Tabelle baby_items (siehe supabase.sql). */

const SYNC_KEY = 'baby.sync';
const DEFAULT_URL = 'https://hnaxwfqgxcfgjpqvvdgf.supabase.co';
const SETUP_SQL = `create table if not exists public.baby_items (
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  kind text not null,
  data jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner, id)
);
create index if not exists baby_items_sync on public.baby_items (owner, updated_at);
alter table public.baby_items enable row level security;
drop policy if exists "baby_items_own" on public.baby_items;
create policy "baby_items_own" on public.baby_items
  for all using (owner = auth.uid()) with check (owner = auth.uid());
create or replace function public.baby_items_touch() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists baby_items_touch on public.baby_items;
create trigger baby_items_touch before insert or update on public.baby_items
  for each row execute function public.baby_items_touch();`;

// Y = Sync-Zustand (getrennt von den Baby-Daten, damit Backups keine Zugangsdaten enthalten)
let Y = (() => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } })();
Y.snap = Y.snap || {};
if (!Y.url) Y.url = localStorage.getItem('supabaseUrl') || DEFAULT_URL; // vom Cockpit übernehmen
if (!Y.key) Y.key = localStorage.getItem('supabaseKey') || '';
function saveSync() { try { localStorage.setItem(SYNC_KEY, JSON.stringify(Y)); } catch (e) { /* ignore */ } }
const syncIsOn = () => !!(Y.url && Y.key && Y.session);
const sy = { busy: false, again: false, timer: null, err: '', needRender: false };

/* ── Daten ↔ Zeilen ── */
const ARR = { log: 'log', todo: 'todos', growth: 'growth' };
const PREFIX = { log: 'l:', todo: 't:', growth: 'g:' };
function recMap() {
  const m = {};
  for (const k of Object.keys(ARR)) for (const x of S[ARR[k]]) m[PREFIX[k] + x.id] = { kind: k, data: x };
  for (const d of Object.keys(S.vitd)) if (S.vitd[d]) m['v:' + d] = { kind: 'vitd', data: true };
  const st = { name: S.settings.name, birth: S.settings.birth, vitd: S.settings.vitd };
  // Leere Standard-Einstellungen eines neuen Handys nicht über die vom Server schreiben
  if (st.name || st.birth || !st.vitd || 's' in Y.snap) m.s = { kind: 'settings', data: st };
  for (const k in m) m[k].j = JSON.stringify(m[k].data);
  return m;
}
function applyRow(r) {
  const rid = r.id.slice(2);
  if (ARR[r.kind]) {
    const arr = S[ARR[r.kind]], i = arr.findIndex(x => x.id === rid);
    if (r.deleted) { if (i >= 0) arr.splice(i, 1); }
    else if (i >= 0) arr[i] = r.data; else arr.push(r.data);
  } else if (r.kind === 'vitd') {
    if (r.deleted) delete S.vitd[rid]; else S.vitd[rid] = true;
  } else if (r.kind === 'settings' && !r.deleted && r.data) {
    Object.assign(S.settings, r.data);
  }
}

/* ── Supabase-Aufrufe ── */
async function authCall(path, body) {
  const res = await fetch(Y.url.replace(/\/$/, '') + '/auth/v1/' + path, {
    method: 'POST', headers: { apikey: Y.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(authMsg(j.error_description || j.msg || j.message || j.error || 'Fehler ' + res.status)); e.status = res.status; throw e; }
  return j;
}
function authMsg(m) {
  if (/invalid login credentials/i.test(m)) return 'E-Mail oder Passwort falsch';
  if (/email not confirmed/i.test(m)) return 'E-Mail noch nicht bestätigt – bitte Link in der Mail antippen';
  if (/already registered/i.test(m)) return 'Konto gibt es schon – bitte anmelden';
  if (/password should be/i.test(m)) return 'Passwort zu kurz (mind. 6 Zeichen)';
  if (/invalid api key/i.test(m)) return 'Anon Key stimmt nicht';
  return m;
}
function setSession(j) {
  Y.session = { at: j.access_token, rt: j.refresh_token, exp: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600), uid: j.user.id };
  if (j.user.email) Y.email = j.user.email;
  saveSync();
}
async function refreshToken() {
  try { setSession(await authCall('token?grant_type=refresh_token', { refresh_token: Y.session.rt })); }
  catch (e) {
    if (e.status >= 400 && e.status < 500) { Y.session = null; saveSync(); throw new Error('Anmeldung abgelaufen – bitte neu anmelden'); }
    throw e;
  }
}
async function rest(path, opts = {}, retry = true) {
  if (Y.session.exp - 60 < Date.now() / 1000) await refreshToken();
  const res = await fetch(Y.url.replace(/\/$/, '') + '/rest/v1/' + path, {
    ...opts, headers: { apikey: Y.key, Authorization: 'Bearer ' + Y.session.at, 'Content-Type': 'application/json', ...opts.headers },
  });
  if (res.status === 401 && retry) { await refreshToken(); return rest(path, opts, false); }
  const txt = await res.text();
  if (!res.ok) {
    let m = txt; try { const j = JSON.parse(txt); m = j.message || j.hint || txt; } catch (e) { /* Text */ }
    if (/baby_items/.test(m) && /does not exist|not find|schema cache/i.test(m)) m = 'Tabelle fehlt – bitte das SQL im Supabase-Dashboard ausführen';
    throw new Error(m || 'Serverfehler ' + res.status);
  }
  return txt ? JSON.parse(txt) : null;
}

/* ── Abgleich ── */
async function syncNow(manual) {
  if (!syncIsOn()) return;
  if (sy.busy) { sy.again = true; return; }
  if (!navigator.onLine) { sy.err = 'Offline – wird nachgeholt'; updateSyncBadge(); return; }
  sy.busy = true; updateSyncBadge();
  let changed = false;
  try {
    // 1) Neues vom Server holen (mit 2 Min. Überlappung, doppelt anwenden schadet nicht)
    const since = Y.cursor ? new Date(Date.parse(Y.cursor) - 120000).toISOString() : null;
    const cur0 = recMap();
    let cursor = Y.cursor ? Date.parse(Y.cursor) : 0, cursorStr = Y.cursor || null;
    for (let off = 0; ; off += 1000) {
      const rows = await rest(`baby_items?select=id,kind,data,deleted,updated_at&order=updated_at.asc,id.asc&limit=1000&offset=${off}` + (since ? `&updated_at=gte.${encodeURIComponent(since)}` : ''));
      for (const r of rows) {
        const t = Date.parse(r.updated_at); if (t > cursor) { cursor = t; cursorStr = r.updated_at; }
        const local = cur0[r.id] && cur0[r.id].j, snap = Y.snap[r.id];
        if (local !== snap) continue; // hier lokal geändert → wird gleich hochgeladen und gewinnt
        const remote = r.deleted ? undefined : JSON.stringify(r.data);
        if (remote !== local) { applyRow(r); changed = true; }
        if (r.deleted) delete Y.snap[r.id]; else Y.snap[r.id] = remote;
      }
      if (rows.length < 1000) break;
    }
    Y.cursor = cursorStr;
    if (changed) save(true);

    // 2) Eigene Änderungen hochladen
    const cur = recMap(), up = [];
    for (const k in cur) if (cur[k].j !== Y.snap[k]) up.push({ owner: Y.session.uid, id: k, kind: cur[k].kind, data: cur[k].data, deleted: false, _j: cur[k].j });
    for (const k in Y.snap) if (!(k in cur)) up.push({ owner: Y.session.uid, id: k, kind: kindOf(k), data: null, deleted: true });
    for (let i = 0; i < up.length; i += 500) {
      const part = up.slice(i, i + 500);
      await rest('baby_items?on_conflict=owner,id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(part.map(({ _j, ...r }) => r)),
      });
      for (const r of part) { if (r.deleted) delete Y.snap[r.id]; else Y.snap[r.id] = r._j; }
    }
    Y.last = Date.now(); sy.err = '';
    saveSync();
    if (manual) toast(up.length || changed ? 'Synchronisiert' : 'Alles aktuell');
  } catch (e) {
    sy.err = e.message === 'Failed to fetch' || e.name === 'TypeError' ? 'Server nicht erreichbar' : e.message;
    saveSync();
    if (manual) toast(sy.err);
  } finally {
    sy.busy = false;
    if (changed) rerenderAfterSync();
    updateSyncBadge();
    if (S.ui.view === 'more' && !document.activeElement?.closest?.('#syncBox')) { const b = document.getElementById('syncBox'); if (b) b.outerHTML = syncSectionHTML(); }
    if (sy.again) { sy.again = false; setTimeout(syncNow, 300); }
  }
}
const kindOf = k => ({ 'l:': 'log', 't:': 'todo', 'g:': 'growth', 'v:': 'vitd' }[k.slice(0, 2)] || 'settings');

function rerenderAfterSync() {
  const a = document.activeElement;
  const typing = a && /INPUT|TEXTAREA/.test(a.tagName);
  if (typing) { if (S.ui.view === 'today') refreshToday(); else sy.needRender = true; return; }
  const y = window.scrollY; render(); window.scrollTo(0, y);
}
document.addEventListener('focusout', () => {
  if (sy.needRender) setTimeout(() => { if (!document.activeElement || !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { sy.needRender = false; render(); } }, 200);
});

function syncSoon() {
  if (!syncIsOn()) return;
  clearTimeout(sy.timer); sy.timer = setTimeout(syncNow, 1200);
}
setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 20000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
window.addEventListener('online', () => syncNow());
window.addEventListener('offline', () => { sy.err = 'Offline – wird nachgeholt'; updateSyncBadge(); });

/* ── Oberfläche ── */
const CLOUD = '<svg viewBox="0 0 24 24"><path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.5 9.6 4.5 4.5 0 0 0 7 18.5z"/></svg>';
function syncBadge() {
  if (!syncIsOn() && !(Y.session === null && Y.email)) return '';
  const st = !syncIsOn() ? 'err' : sy.busy ? 'busy' : sy.err ? 'err' : 'ok';
  const label = !syncIsOn() ? 'Nicht angemeldet' : sy.busy ? 'Synchronisiere …' : sy.err || 'Synchronisiert';
  return `<button class="hbtn sync ${st}" id="syncBtn" data-act="syncTap" aria-label="${esc(label)}" title="${esc(label)}">${CLOUD}</button>`;
}
function updateSyncBadge() {
  const b = document.getElementById('syncBtn'), h = syncBadge();
  if (b) { if (h) b.outerHTML = h; else b.remove(); }
  else if (h) document.getElementById('hact').insertAdjacentHTML('afterbegin', h);
}
function syncSectionHTML() {
  let h = `<div class="section-t">Server-Sync</div><div id="syncBox">`;
  if (syncIsOn()) {
    const when = Y.last ? (Date.now() - Y.last < 60000 ? 'gerade eben' : 'vor ' + fmtDur(Date.now() - Y.last)) : 'noch nie';
    h += `<div class="card">
      <div class="setting"><span><span class="lbl">☁️ Verbunden</span><br><span class="sub">${esc(Y.email || '')}</span></span><span class="sync-st ${sy.err ? 'err' : 'ok'}">${sy.busy ? 'läuft …' : sy.err ? '⚠︎' : '✓'}</span></div>
      <div class="setting"><span class="sub">${sy.err ? esc(sy.err) : 'Zuletzt abgeglichen: ' + when}</span></div>
    </div>
    <div class="card menu" style="margin-top:10px">
      <button data-act="syncTap"><span class="ico">🔄</span>Jetzt synchronisieren</button>
      <button data-act="syncLogout"><span class="ico">🚪</span>Abmelden</button>
    </div>
    <p class="small muted" style="margin:0 4px">Beide Eltern melden sich mit <b>demselben Konto</b> an. Neue Einträge erscheinen auf dem anderen Handy beim Öffnen der App und alle 20 Sekunden. Ohne Netz wird lokal gespeichert und später hochgeladen.</p>`;
  } else {
    h += `<form class="card sync-form" data-form="syncLogin">
      ${Y.email && !Y.session ? `<p class="small" style="color:var(--red-t);margin:0 2px 10px">Bitte neu anmelden.</p>` : ''}
      <p class="small muted" style="margin:0 2px 12px">Einträge online speichern und auf mehreren Handys (z. B. beide Eltern) gleichzeitig nutzen.</p>
      <div class="field"><label>E-Mail</label><input type="email" name="email" autocomplete="username" value="${esc(Y.email || '')}" required></div>
      <div class="field"><label>Passwort</label><input type="password" name="pw" autocomplete="current-password" minlength="6" required></div>
      <details class="sync-adv" ${Y.key ? '' : 'open'}><summary>Server-Einstellungen</summary>
        <div class="field"><label>Supabase-Projekt-URL</label><input type="url" name="url" value="${esc(Y.url)}" required></div>
        <div class="field"><label>Anon Public Key</label><input type="text" name="key" value="${esc(Y.key)}" placeholder="eyJhbGci…" autocomplete="off" required></div>
      </details>
      <div class="acts" style="grid-template-columns:1fr 1fr;margin-top:6px">
        <button type="button" class="btn plain" data-act="syncSignup">Konto erstellen</button>
        <button class="btn primary">Anmelden</button>
      </div>
    </form>
    <details class="card sync-help"><summary>Einmalig einrichten (Supabase)</summary>
      <ol>
        <li>Auf <b>supabase.com</b> dein Projekt öffnen (oder ein kostenloses neues anlegen).</li>
        <li><b>SQL Editor</b> → <b>New query</b> → den Text unten einfügen → <b>Run</b>.</li>
        <li>Unter <b>Project Settings → API</b> die <b>Project URL</b> und den <b>anon public</b> Key kopieren und oben eintragen.</li>
        <li>Konto anlegen: hier „Konto erstellen“ tippen – oder im Dashboard unter <b>Authentication → Users → Add user</b> (mit „Auto Confirm“).</li>
        <li>Auf dem zweiten Handy mit derselben E-Mail und demselben Passwort anmelden.</li>
      </ol>
      <textarea readonly rows="8" id="sqlText">${esc(SETUP_SQL)}</textarea>
      <button type="button" class="btn soft" style="width:100%;margin-top:8px" data-act="syncCopySql">SQL kopieren</button>
    </details>`;
  }
  return h + '</div>';
}

async function login(form, signup) {
  const email = form.email.value.trim(), pw = form.pw.value;
  Y.url = form.url.value.trim().replace(/\/$/, ''); Y.key = form.key.value.trim();
  if (!email || !pw || !Y.url || !Y.key) { toast('Bitte alle Felder ausfüllen'); return; }
  const btns = $$('button', form); btns.forEach(b => { b.disabled = true; });
  try {
    const j = signup ? await authCall('signup', { email, password: pw }) : await authCall('token?grant_type=password', { email, password: pw });
    if (!j.access_token) { Y.email = email; saveSync(); toast('Bestätigungs-Mail verschickt – Link antippen, dann anmelden'); return; }
    Y.snap = {}; Y.cursor = null; setSession(j);
    toast('Angemeldet – gleiche Daten ab …');
    render();
    await syncNow();
    if (!sy.err) toast('Verbunden ✓ Daten sind online');
  } catch (e) {
    toast(e.message === 'Failed to fetch' || e.name === 'TypeError' ? 'Server nicht erreichbar – URL prüfen' : e.message);
  } finally { btns.forEach(b => { b.disabled = false; }); }
}

Object.assign(ACT, {
  syncTap() { if (syncIsOn()) syncNow(true); else { S.ui.view = 'more'; save(true); render(); setTimeout(() => document.getElementById('syncBox')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
  syncSignup(el) { const f = el.closest('form'); if (f.reportValidity()) login(f, true); },
  syncLogout() {
    confirmSheet('Abmelden? Die Daten bleiben auf diesem Handy, werden aber nicht mehr abgeglichen.', 'Abmelden', () => {
      Y.session = null; Y.snap = {}; Y.cursor = null; Y.email = ''; sy.err = ''; saveSync(); render(); toast('Abgemeldet');
    });
  },
  async syncCopySql() {
    try { await navigator.clipboard.writeText(SETUP_SQL); toast('SQL kopiert'); }
    catch (e) { const t = document.getElementById('sqlText'); t.focus(); t.select(); toast('Text markiert – jetzt kopieren'); }
  },
});
Object.assign(FORMS, { syncLogin(form) { login(form, false); } });

render();
syncNow();
