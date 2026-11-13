'use strict';
/* ───────── Gemeinsame Online-Datenbank (Supabase) für alle Apps ─────────
   - Ein Login für alle Apps auf dieser Seite (Essen, Baby, …)
   - Jede App speichert weiter lokal (funktioniert offline) und gleicht im
     Hintergrund ab: beim Öffnen, nach Änderungen und alle 20 Sekunden.
   - Jeder Datensatz ist eine Zeile in der Tabelle app_items (siehe supabase.sql).

   Einbinden:  Cloud.init({ app, records, apply, persist, refresh, toast, confirm, openSettings })
     records()  → { id: { kind, data, soft } }   alle Datensätze der App (soft = Standardwert,
                                                  wird nur hochgeladen, wenn er schon mal synchron war)
     apply(row) → Zeile vom Server übernehmen ({ id, kind, data, deleted })
     persist()  → lokal speichern (ohne neuen Sync auszulösen)
     refresh()  → Ansicht neu zeichnen
   Optional:
     storeId()            → Kennung des lokalen Datenbestands. Ändert sie sich (Speicher wurde neu
                            aufgebaut, z. B. nach einem Defekt), wird alles neu vom Server geholt –
                            der Server gewinnt, es wird nichts gelöscht.
     rebuilt              → true, wenn die App beim Start keinen lesbaren Datenbestand vorfand
                            (gleiche Wirkung wie eine geänderte Kennung).
     guardDeletes(l, n)   → true = diese Löschungen (l = [{id, kind}], n = Anzahl bekannter Zeilen)
                            sind verdächtig. Sie werden erst nach Rückfrage hochgeladen.
                            Gewollte Massenlöschungen vorher mit Cloud.allowBulkDelete() ankündigen.
*/
(function () {
  const AUTH_KEY = 'cloud.auth';
  const DEFAULT_URL = 'https://hnaxwfqgxcfgjpqvvdgf.supabase.co';
  const SQL = `create table if not exists public.app_items (
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  app text not null,
  id text not null,
  kind text not null,
  data jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner, app, id)
);
create index if not exists app_items_sync on public.app_items (owner, app, updated_at);
grant select, insert, update, delete on public.app_items to authenticated;
alter table public.app_items enable row level security;
drop policy if exists "app_items_own" on public.app_items;
create policy "app_items_own" on public.app_items
  for all using (owner = auth.uid()) with check (owner = auth.uid());
create or replace function public.app_items_touch() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists app_items_touch on public.app_items;
create trigger app_items_touch before insert or update on public.app_items
  for each row execute function public.app_items_touch();`;

  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; /* voll */ } };
  // Einheitliche JSON-Form (Schlüssel sortiert) – die Datenbank liefert Schlüssel in anderer Reihenfolge zurück
  const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x)
    ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Login immer frisch lesen – eine andere App (anderer Tab) kann ihn erneuert haben
  function auth() {
    const a = read(AUTH_KEY) || {};
    if (!a.url) a.url = localStorage.getItem('supabaseUrl') || DEFAULT_URL; // vom Cockpit übernehmen
    if (!a.key) a.key = localStorage.getItem('supabaseKey') || '';
    return a;
  }
  const saveAuth = a => write(AUTH_KEY, a);
  const base = a => a.url.replace(/\/$/, '');
  const isOn = () => { const a = auth(); return !!(a.url && a.key && a.session); };

  let C = null, P = null; // C = Einstellungen der App, P = Sync-Stand dieser App
  const sy = { busy: false, again: false, timer: null, err: '', deferred: false, hold: 0, since: 0 };
  let diskRev; // Stand, den dieser Tab zuletzt gelesen/geschrieben hat
  function state(uid) {
    if (!P) { P = read('cloud.' + C.app) || {}; diskRev = P.rev; }
    if (uid && P.uid !== uid) P = { uid, snap: {}, cursor: null, canon: 1 }; // anderes Konto → von vorn
    P.snap = P.snap || {};
    if (!P.canon) { // ältere Stände auf die einheitliche JSON-Form bringen
      for (const id in P.snap) { try { P.snap[id].j = canon(JSON.parse(P.snap[id].j)); } catch (e) { delete P.snap[id]; } }
      P.canon = 1;
    }
    if (C.storeId) {
      const sid = C.storeId();
      if (sid && P.sid && P.sid !== sid) { P.snap = {}; P.cursor = null; P.adopt = true; delete P.allow; } // lokaler Bestand neu → Server gewinnt
      if (sid) P.sid = sid;
    }
    return P;
  }
  function saveState() { if (!P) return; const rev = Math.random().toString(36).slice(2); const old = P.rev; P.rev = rev; if (write('cloud.' + C.app, P)) diskRev = rev; else P.rev = old; }
  // Hat ein anderer Tab inzwischen abgeglichen? Dann dessen Stand übernehmen.
  function reloadState() { const d = read('cloud.' + C.app); if (d && d.rev !== diskRev) { P = d; diskRev = d.rev; } }

  /* ── Supabase ── */
  const netErr = e => e.name === 'TypeError' || e.name === 'AbortError' || /fetch|network|load failed/i.test(e.message);
  // fetch mit Zeitlimit – ein hängendes Mobilfunknetz darf den Abgleich nicht für immer blockieren
  async function fetchT(url, opts = {}, ms = 25000) {
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ac && setTimeout(() => ac.abort(), ms);
    try { const res = await fetch(url, ac ? { ...opts, signal: ac.signal } : opts); const txt = await res.text(); return { ok: res.ok, status: res.status, txt }; }
    finally { clearTimeout(t); }
  }
  function msg(m) {
    if (/invalid login credentials/i.test(m)) return 'E-Mail oder Passwort falsch';
    if (/email not confirmed/i.test(m)) return 'E-Mail noch nicht bestätigt – bitte Link in der Mail antippen';
    if (/already registered/i.test(m)) return 'Konto gibt es schon – bitte anmelden';
    if (/password should be/i.test(m)) return 'Passwort zu kurz (mind. 6 Zeichen)';
    if (/invalid api key|no api key/i.test(m)) return 'API-Key stimmt nicht';
    if (/app_items/.test(m) && /does not exist|not find|schema cache/i.test(m)) return 'Tabelle fehlt – bitte das SQL im Supabase-Dashboard ausführen';
    if (/permission denied|row-level security/i.test(m)) return 'Keine Berechtigung – bitte das SQL (neueste Version) im Supabase-Dashboard erneut ausführen';
    if (/jwt expired/i.test(m)) return 'Anmeldung abgelaufen – bitte neu anmelden';
    return m;
  }
  async function authCall(a, path, body) {
    const res = await fetchT(base(a) + '/auth/v1/' + path, { method: 'POST', headers: { apikey: a.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let j = {}; try { j = JSON.parse(res.txt) || {}; } catch (e) { /* kein JSON */ }
    if (!res.ok) { const e = new Error(msg(j.error_description || j.msg || j.message || j.error || 'Fehler ' + res.status)); e.status = res.status; throw e; }
    return j;
  }
  function setSession(a, j) {
    const life = j.expires_in || 3600;
    a.session = { at: j.access_token, rt: j.refresh_token, exp: j.expires_at || Math.floor(Date.now() / 1000) + life, life, uid: j.user.id };
    if (j.user.email) a.email = j.user.email;
    saveAuth(a);
  }
  const expiring = s => s.exp - Math.min(60, (s.life || 3600) / 4) < Date.now() / 1000;
  // Login erneuern. Immer nur eine App gleichzeitig (Sperre über alle Tabs), denn Supabase
  // akzeptiert jeden Refresh-Token nur einmal. Die andere App übernimmt dann den neuen Login.
  function refresh(a, stale) {
    const run = async () => {
      const cur = auth();
      if (cur.session && cur.session.at !== stale) { a.session = cur.session; return; } // andere App war schneller
      if (!cur.session) { a.session = null; throw new Error('Anmeldung abgelaufen – bitte neu anmelden'); }
      try { setSession(a, await authCall(a, 'token?grant_type=refresh_token', { refresh_token: cur.session.rt })); }
      catch (e) {
        const again = auth();
        if (again.session && again.session.at !== stale) { a.session = again.session; return; }
        if (e.status >= 400 && e.status < 500) { a.session = null; saveAuth(a); throw new Error('Anmeldung abgelaufen – bitte neu anmelden'); }
        throw e;
      }
    };
    return navigator.locks ? navigator.locks.request('cloud-auth', run) : run();
  }
  async function rest(a, path, opts = {}, retry = true) {
    if (expiring(a.session)) await refresh(a, a.session.at);
    const res = await fetchT(base(a) + '/rest/v1/' + path, {
      ...opts, headers: { apikey: a.key, Authorization: 'Bearer ' + a.session.at, 'Content-Type': 'application/json', ...opts.headers },
    });
    if (res.status === 401 && retry) { await refresh(a, a.session.at); return rest(a, path, opts, false); }
    const txt = res.txt;
    if (!res.ok) {
      let m = txt; try { const j = JSON.parse(txt); m = j.message || j.hint || txt; } catch (e) { /* Text */ }
      throw new Error(msg(m || 'Serverfehler ' + res.status));
    }
    return txt ? JSON.parse(txt) : null;
  }

  /* ── Abgleich ── */
  function current(snap) {
    const m = C.records(), out = {};
    for (const id in m) {
      if (m[id].soft && !(id in snap)) continue; // Standardwert eines neuen Geräts nicht hochladen
      out[id] = { k: m[id].kind, d: m[id].data, j: canon(m[id].data) };
    }
    return out;
  }
  async function syncNow(manual) {
    if (!C || !isOn()) return;
    if (sy.busy) { sy.again = true; return; }
    clearTimeout(sy.timer); sy.timer = null;
    if (!navigator.onLine) { sy.err = 'Offline – wird nachgeholt'; ui(); return; }
    sy.busy = true; ui();
    let changed = false, pushed = 0, failed = false;
    reloadState();
    const a = auth(), p = state(a.session.uid);
    try {
      // 1) Neues vom Server holen (2 Min. Überlappung – doppelt anwenden schadet nicht)
      const since = p.cursor ? new Date(Date.parse(p.cursor) - 120000).toISOString() : null;
      const cur0 = current(p.snap);
      let top = p.cursor ? Date.parse(p.cursor) : 0, topStr = p.cursor || null;
      for (let off = 0; ; off += 1000) {
        const rows = await rest(a, `app_items?select=id,kind,data,deleted,updated_at&app=eq.${encodeURIComponent(C.app)}&order=updated_at.asc,id.asc&limit=1000&offset=${off}` + (since ? `&updated_at=gte.${encodeURIComponent(since)}` : ''));
        if (!Array.isArray(rows)) throw new Error('Unerwartete Antwort vom Server');
        for (const r of rows) {
          if (!r || typeof r.id !== 'string') continue;
          const t = Date.parse(r.updated_at); if (t > top) { top = t; topStr = r.updated_at; }
          const local = cur0[r.id] && cur0[r.id].j, snap = p.snap[r.id] && p.snap[r.id].j;
          if (!p.adopt && local !== snap) continue; // hier geändert → wird gleich hochgeladen und gewinnt
          const remote = r.deleted ? undefined : canon(r.data);
          if (remote !== local) {
            try { C.apply(r); changed = true; }
            catch (e) { console.error('Cloud: Zeile übersprungen', r.id, e); continue; } // eine kaputte Zeile darf nicht alles blockieren
          }
          if (r.deleted) delete p.snap[r.id]; else p.snap[r.id] = { k: r.kind, j: remote };
        }
        if (rows.length < 1000) break;
      }
      p.cursor = topStr; delete p.adopt;
      if (changed) C.persist();

      // 2) Eigene Änderungen hochladen
      const cur = current(p.snap), up = [], dels = [];
      for (const id in cur) if (cur[id].j !== (p.snap[id] && p.snap[id].j)) up.push({ id, kind: cur[id].k, data: cur[id].d, deleted: false, _j: cur[id].j });
      for (const id in p.snap) if (!(id in cur)) dels.push({ id, kind: p.snap[id].k, data: null, deleted: true });
      // Verdächtig viele Löschungen? Erst nachfragen, statt die Datenbank leerzuräumen.
      let hold = 0;
      if (dels.length && C.guardDeletes && !p.allow && C.guardDeletes(dels.map(d => ({ id: d.id, kind: d.kind })), Object.keys(p.snap).length)) hold = dels.length;
      else up.push(...dels);
      for (let i = 0; i < up.length; i += 500) {
        const part = up.slice(i, i + 500);
        await rest(a, 'app_items?on_conflict=owner,app,id', {
          method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(part.map(r => ({ owner: a.session.uid, app: C.app, id: r.id, kind: r.kind, data: r.data, deleted: r.deleted }))),
        });
        for (const r of part) { if (r.deleted) delete p.snap[r.id]; else p.snap[r.id] = { k: r.kind, j: r._j }; }
        pushed += part.length;
      }
      if (!hold) delete p.allow;
      if (hold && !sy.hold && C.toast) C.toast('Abgleich angehalten – bitte unter „Mehr“ prüfen');
      sy.hold = hold;
      p.last = Date.now(); sy.err = ''; sy.since = 0;
      if (manual) C.toast(hold ? 'Abgleich angehalten – bitte prüfen' : pushed || changed ? 'Synchronisiert' : 'Alles aktuell');
    } catch (e) {
      sy.err = netErr(e) ? 'Server nicht erreichbar – wird nachgeholt' : (e && e.message) || 'Unbekannter Fehler';
      failed = true;
      if (!sy.since) sy.since = Date.now();
      if (manual) C.toast(sy.err);
    } finally {
      saveState();
      sy.busy = false;
      if (changed) refreshView();
      ui();
      if (sy.again) { sy.again = false; setTimeout(syncNow, failed ? 6000 : 300); } // nach einem Fehler nicht sofort wieder anrennen
    }
  }
  const typing = () => { const el = document.activeElement; return !!el && /INPUT|TEXTAREA|SELECT/.test(el.tagName); };
  function refreshView() { if (typing()) sy.deferred = true; else C.refresh(); }
  document.addEventListener('focusout', () => setTimeout(() => { if (sy.deferred && !typing()) { sy.deferred = false; C.refresh(); } }, 250));

  function soon() { if (!C || !isOn()) return; clearTimeout(sy.timer); sy.timer = setTimeout(syncNow, 1200); }
  setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 20000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncNow();
    else if (sy.timer) syncNow(); // App wird weggelegt → offene Änderung sofort noch abschicken
  });
  window.addEventListener('pagehide', () => { if (sy.timer) syncNow(); });
  window.addEventListener('online', () => syncNow());
  window.addEventListener('offline', () => { sy.err = 'Offline – wird nachgeholt'; ui(); });

  /* ── Weiteres Gerät verbinden (Link/Code mit Server-Adresse, ohne Passwort) ── */
  const b64e = t => btoa(unescape(encodeURIComponent(t))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = t => decodeURIComponent(escape(atob(t.replace(/-/g, '+').replace(/_/g, '/'))));
  const hostOf = u => { try { return new URL(u).host; } catch (e) { return ''; } };
  function linkCode() { const a = auth(); return 'MC1.' + b64e(JSON.stringify({ u: a.url, k: a.key, e: a.email || '' })); }
  const linkUrl = () => location.origin + location.pathname + '#verbinden=' + linkCode();
  function readCode(text) {
    const m = String(text || '').match(/MC1\.([A-Za-z0-9_-]+)/); if (!m) return null;
    try { const j = JSON.parse(b64d(m[1])); return j && /^(https:\/\/[^\s/]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$))/.test(j.u) && typeof j.k === 'string' && j.k ? j : null; } catch (e) { return null; }
  }
  function applyCode(text, open) {
    const j = readCode(text);
    if (!j) { C.toast('Verbindungscode ungültig'); return; }
    if (isOn()) { C.toast('Dieses Gerät ist schon verbunden'); return; }
    const a = auth();
    const done = () => {
      a.url = j.u.replace(/\/$/, ''); a.key = j.k; if (j.e) a.email = String(j.e); saveAuth(a);
      if (open && C.openSettings) C.openSettings();
      const box = document.getElementById('cloudBox'); if (box) box.outerHTML = section();
      C.toast('Server-Daten übernommen – jetzt nur noch das Passwort eingeben');
    };
    // Schutz vor untergeschobenen Links: fremde Server nur nach Rückfrage
    if (hostOf(j.u) === hostOf(a.url) || hostOf(j.u) === hostOf(DEFAULT_URL)) done();
    else C.confirm(`Mit dem Server „${hostOf(j.u)}“ verbinden? Nur bestätigen, wenn der Code von dir selbst stammt.`, 'Verbinden', done);
  }
  function takeLink() {
    const m = location.hash.match(/verbinden=(MC1\.[A-Za-z0-9_-]+)/); if (!m) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* egal */ }
    applyCode(m[1], true);
  }

  /* ── Oberfläche ── */
  const CLOUD = '<svg viewBox="0 0 24 24"><path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.5 9.6 4.5 4.5 0 0 0 7 18.5z"/></svg>';
  function status() {
    const on = isOn();
    if (!on) return { st: 'err', label: 'Nicht angemeldet' };
    if (sy.busy) return { st: 'busy', label: 'Synchronisiere …' };
    if (sy.hold) return { st: 'err', label: 'Abgleich angehalten – bitte prüfen' };
    if (sy.err) return { st: /offline|nicht erreichbar/i.test(sy.err) ? 'off' : 'err', label: sy.err };
    return { st: 'ok', label: 'Online gespeichert' };
  }
  function badge() {
    const a = auth(), on = isOn();
    if (!on && !a.email) return '';
    const { st, label } = status();
    return `<button class="hbtn cloud-btn ${st}" id="cloudBtn" data-cloud="tap" aria-label="${esc(label)}" title="${esc(label)}">${CLOUD}</button>`;
  }
  function ui() {
    const b = document.getElementById('cloudBtn'), h = badge();
    if (b) { if (h) b.outerHTML = h; else b.remove(); }
    else if (h && C && C.badgeHost) { const host = document.querySelector(C.badgeHost); if (host) host.insertAdjacentHTML('afterbegin', h); }
    const box = document.getElementById('cloudBox');
    if (box && !box.contains(document.activeElement) && !box.querySelector('details.cloud-help[open]')) box.outerHTML = section();
    if (C && C.onStatus) { try { C.onStatus(status()); } catch (e) { /* Anzeige ist optional */ } }
  }
  function section() {
    const a = auth(), p = C ? state() : {};
    let h = `<div id="cloudBox"><div class="section-t">Online-Datenbank</div>`;
    if (isOn()) {
      const when = !p.last ? 'noch nie' : Date.now() - p.last < 60000 ? 'gerade eben' : Date.now() - p.last < 5400000 ? 'vor ' + Math.round((Date.now() - p.last) / 60000) + ' min' : new Date(p.last).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      const bad = sy.err || sy.hold;
      h += `<div class="card">
        <div class="setting"><span><span class="lbl">☁️ Verbunden</span><br><span class="sub">${esc(a.email || '')}</span></span><span class="cloud-st ${bad ? 'err' : 'ok'}">${sy.busy ? '…' : bad ? '⚠︎' : '✓'}</span></div>
        <div class="setting"><span class="sub">${sy.err ? esc(sy.err) + (p.last ? ' · zuletzt abgeglichen: ' + when : '') : 'Zuletzt abgeglichen: ' + when}</span></div>
      </div>`;
      if (sy.hold) h += `<div class="card cloud-hold">
        <b>⚠️ Abgleich angehalten</b>
        <p>Auf diesem Gerät fehlen <b>${sy.hold} Einträge</b>, die online gespeichert sind. Damit nichts versehentlich verloren geht, wurde online noch nichts gelöscht.</p>
        <div class="cloud-acts"><button type="button" class="btn primary" data-cloud="holdRestore">Von online zurückholen</button><button type="button" class="btn plain" data-cloud="holdDelete">Auch online löschen</button></div>
      </div>`;
      h += `<div class="card menu" style="margin-top:10px">
        <button data-cloud="tap"><span class="ico">🔄</span>Jetzt synchronisieren</button>
        <button data-cloud="logout"><span class="ico">🚪</span>Abmelden</button>
      </div>
      <details class="card cloud-help cloud-link"><summary>📱 Weiteres Gerät verbinden</summary>
        <ol>
          <li>Unten auf <b>Link senden</b> tippen und den Link an das andere Gerät schicken (z. B. per AirDrop oder Nachricht an dich selbst).</li>
          <li>Dort den Link öffnen – die Server-Daten sind dann schon eingetragen.</li>
          <li>Mit derselben E-Mail und demselben Passwort anmelden. Fertig.</li>
        </ol>
        <p class="small muted" style="margin:0 0 10px">Als App auf dem Home-Bildschirm: stattdessen in der App unter „Mehr → Online-Datenbank“ den Link in das Feld „Verbindungscode“ einfügen. Der Link enthält kein Passwort.</p>
        <div class="cloud-acts"><button type="button" class="btn primary" data-cloud="linkShare">Link senden</button><button type="button" class="btn plain" data-cloud="linkCopy">Link kopieren</button></div>
      </details>
      <p class="small muted" style="margin:10px 4px 0">Deine Daten liegen online und zusätzlich auf diesem Gerät. Änderungen erscheinen auf allen angemeldeten Geräten beim Öffnen und alle 20 Sekunden – ohne Netz wird später automatisch nachgeholt.</p>`;
    } else {
      const known = !!(a.url && a.key);
      h += `<form class="card cloud-form" data-cloud-form>
        ${a.email ? `<p class="small" style="color:var(--red-t);margin:0 2px 10px">Bitte (neu) anmelden.</p>` : ''}
        <p class="small muted" style="margin:0 2px 12px">Daten online speichern – sicher vor Geräte-Verlust und auf iPhone, iPad und Computer gleichzeitig nutzbar. Ein Konto für alle Apps (Essen, Baby, …).</p>
        <div class="field"><label>E-Mail</label><input type="email" name="email" autocomplete="username" autocapitalize="off" value="${esc(a.email || '')}" required></div>
        <div class="field"><label>Passwort</label><input type="password" name="pw" autocomplete="current-password" minlength="6" required></div>
        <details class="cloud-adv" ${known ? '' : 'open'}><summary>Server-Einstellungen${known ? ' ✓' : ''}</summary>
          <div class="field"><label>Verbindungscode von einem anderen Gerät (optional)</label><input type="text" name="code" data-cloud-code placeholder="Link oder Code hier einfügen" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
          <div class="field"><label>Supabase-Projekt-URL</label><input type="url" name="url" value="${esc(a.url)}" required></div>
          <div class="field"><label>API-Key (anon public oder publishable)</label><input type="text" name="key" value="${esc(a.key)}" placeholder="eyJhbGci… oder sb_publishable_…" autocomplete="off" autocapitalize="off" spellcheck="false" required></div>
        </details>
        <div class="cloud-acts">
          <button type="button" class="btn plain" data-cloud="signup">Konto erstellen</button>
          <button class="btn primary">Anmelden</button>
        </div>
      </form>
      <details class="card cloud-help"><summary>Einmalig einrichten (Supabase)</summary>
        <ol>
          <li>Auf <b>supabase.com</b> dein Projekt öffnen (oder ein kostenloses neues anlegen).</li>
          <li><b>SQL Editor</b> → <b>New query</b> → den Text unten einfügen → <b>Run</b>.</li>
          <li>Unter <b>Project Settings → API Keys</b> den Key <b>anon public</b> (beginnt mit eyJ…) oder den <b>Publishable key</b> (beginnt mit sb_publishable_) kopieren. Die <b>Project URL</b> steht unter <b>Project Settings → Data API</b> (bzw. <b>API</b>). Beides oben eintragen.</li>
          <li>Konto anlegen: hier „Konto erstellen“ und den Link in der Bestätigungs-Mail antippen (zeigt der Link eine Fehlerseite, ist die Mail trotzdem bestätigt). Einfacher: im Dashboard unter <b>Authentication → Users → Add user</b> mit „Auto Confirm User“.</li>
          <li>Weitere Geräte: auf einem angemeldeten Gerät „Weiteres Gerät verbinden“ antippen – dann braucht das neue Gerät nur noch E-Mail und Passwort.</li>
        </ol>
        <textarea readonly rows="8" id="cloudSql">${esc(SQL)}</textarea>
        <button type="button" class="btn soft" style="width:100%;margin-top:8px" data-cloud="copy">SQL kopieren</button>
      </details>`;
    }
    return h + '</div>';
  }

  async function login(form, signup) {
    const a = auth(), email = form.email.value.trim(), pw = form.pw.value;
    a.url = form.url.value.trim().replace(/\/$/, ''); a.key = form.key.value.trim();
    if (!email || !pw || !a.url || !a.key) { C.toast('Bitte alle Felder ausfüllen'); return; }
    const btns = [...form.querySelectorAll('button')]; btns.forEach(b => { b.disabled = true; });
    try {
      const j = await authCall(a, signup ? 'signup' : 'token?grant_type=password', { email, password: pw });
      if (!j.access_token || !j.user) { a.email = email; saveAuth(a); C.toast('Bestätigungs-Mail verschickt – Link antippen, dann anmelden'); return; }
      setSession(a, j); state(a.session.uid); saveState();
      C.refresh();
      await syncNow();
      C.toast(sy.err || 'Verbunden ✓ Daten sind online');
    } catch (e) {
      saveAuth(a);
      C.toast(netErr(e) ? 'Server nicht erreichbar – URL und Internet prüfen' : e.message);
    } finally { btns.forEach(b => { b.disabled = false; }); }
  }
  async function copyText(text, okMsg) {
    try { await navigator.clipboard.writeText(text); C.toast(okMsg); return true; } catch (e) { return false; }
  }

  const ACTIONS = {
    tap() { if (!isOn() || sy.hold) { if (C.openSettings) C.openSettings(); if (isOn()) syncNow(); } else syncNow(true); },
    signup(el) { const f = el.closest('form'); if (f.reportValidity()) login(f, true); },
    logout() {
      C.confirm('Abmelden? Die Daten bleiben auf diesem Gerät, werden aber nicht mehr online abgeglichen. Gilt für alle Apps.', 'Abmelden', () => {
        const a = auth(); a.session = null; a.email = ''; saveAuth(a); sy.err = ''; sy.hold = 0; C.refresh(); C.toast('Abgemeldet');
      });
    },
    async copy() {
      if (!(await copyText(SQL, 'SQL kopiert'))) { const t = document.getElementById('cloudSql'); t.focus(); t.select(); C.toast('Text markiert – jetzt kopieren'); }
    },
    async linkShare() {
      const url = linkUrl();
      if (navigator.share) { try { await navigator.share({ title: 'Gerät verbinden', text: 'Mit diesem Link meldest du ein weiteres Gerät an (enthält kein Passwort):', url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
      ACTIONS.linkCopy();
    },
    async linkCopy() { if (!(await copyText(linkUrl(), 'Link kopiert'))) window.prompt('Link kopieren:', linkUrl()); },
    // Angehaltene Löschungen: alles vom Server zurückholen …
    holdRestore() { const p = state(); p.snap = {}; p.cursor = null; p.adopt = true; delete p.allow; sy.hold = 0; saveState(); syncNow(true); },
    // … oder die Löschungen bewusst auch online ausführen
    holdDelete() {
      C.confirm(`${sy.hold} Einträge wirklich auch online und auf allen Geräten löschen?`, 'Online löschen', () => { allowBulkDelete(); sy.hold = 0; syncNow(true); });
    },
  };
  function allowBulkDelete() { if (!C) return; state().allow = Date.now(); saveState(); }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-cloud]'); if (!el || !C) return;
    e.preventDefault();
    try { const r = ACTIONS[el.dataset.cloud](el); if (r && r.catch) r.catch(err => console.error(err)); } catch (err) { console.error(err); C.toast('Das hat nicht geklappt'); }
  });
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-cloud-form]') || !C) return;
    e.preventDefault(); login(e.target, false);
  }, true);
  document.addEventListener('input', e => {
    if (!C || !e.target.matches || !e.target.matches('[data-cloud-code]')) return;
    if (readCode(e.target.value)) { e.target.blur(); applyCode(e.target.value, false); }
  });
  // Login/Logout in einer anderen App (anderer Tab) übernehmen
  window.addEventListener('storage', e => { if (e.key === AUTH_KEY && C) { ui(); if (isOn()) syncNow(); } });

  const css = document.createElement('style');
  css.textContent = `
.cloud-btn{background:var(--card2)!important;color:var(--t3)!important}
.cloud-btn.ok{color:var(--ok)!important}
.cloud-btn.off{color:var(--t2)!important}
.cloud-btn.err{color:#e8590c!important;background:rgba(232,89,12,.13)!important}
.cloud-btn.busy svg{animation:cloudPulse 1s ease-in-out infinite}
@keyframes cloudPulse{50%{opacity:.35}}
.cloud-st{font-weight:800;font-size:18px}.cloud-st.ok{color:var(--ok)}.cloud-st.err{color:#e8590c}
.cloud-form{padding:14px}.cloud-form button:disabled{opacity:.5}
.cloud-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
.cloud-adv{margin:0 0 6px}
.cloud-adv summary,.cloud-help summary{cursor:pointer;font-size:14px;font-weight:700;color:var(--acc-t);padding:4px 2px 10px}
.cloud-help{padding:12px 14px;margin-top:10px}.cloud-help summary{padding:2px}
.cloud-help ol{margin:10px 0 10px 20px;font-size:14px;line-height:1.55;color:var(--t2)}.cloud-help ol b{color:var(--t1)}
.cloud-help textarea{font:16px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical;min-height:0}
.cloud-hold{padding:14px;margin-top:10px;border:2px solid #e8590c}.cloud-hold p{font-size:14px;line-height:1.5;color:var(--t2);margin:6px 0 10px}`;
  document.head.appendChild(css);

  window.Cloud = {
    init(cfg) {
      C = cfg; P = null;
      // Lokaler Datenbestand wurde neu aufgebaut (Defekt, Speicher gelöscht): alles neu holen, Server gewinnt
      if (cfg.rebuilt) { const p = state(); if (Object.keys(p.snap).length || p.cursor) { p.snap = {}; p.cursor = null; p.adopt = true; delete p.allow; saveState(); } }
      ui(); syncNow(); setTimeout(takeLink, 60);
    },
    soon, now: syncNow, isOn, badge, section, status, allowBulkDelete,
  };
})();
