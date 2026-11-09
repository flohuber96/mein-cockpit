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
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* voll */ } };
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
  const sy = { busy: false, again: false, timer: null, err: '', deferred: false };
  function state(uid) {
    if (!P) P = read('cloud.' + C.app) || {};
    if (uid && P.uid !== uid) P = { uid, snap: {}, cursor: null }; // anderes Konto → von vorn
    P.snap = P.snap || {};
    return P;
  }
  const saveState = () => write('cloud.' + C.app, P);

  /* ── Supabase ── */
  const netErr = e => e.name === 'TypeError' || /fetch|network|load failed/i.test(e.message);
  function msg(m) {
    if (/invalid login credentials/i.test(m)) return 'E-Mail oder Passwort falsch';
    if (/email not confirmed/i.test(m)) return 'E-Mail noch nicht bestätigt – bitte Link in der Mail antippen';
    if (/already registered/i.test(m)) return 'Konto gibt es schon – bitte anmelden';
    if (/password should be/i.test(m)) return 'Passwort zu kurz (mind. 6 Zeichen)';
    if (/invalid api key/i.test(m)) return 'Anon Key stimmt nicht';
    if (/app_items/.test(m) && /does not exist|not find|schema cache/i.test(m)) return 'Tabelle fehlt – bitte das SQL im Supabase-Dashboard ausführen';
    return m;
  }
  async function authCall(a, path, body) {
    const res = await fetch(base(a) + '/auth/v1/' + path, { method: 'POST', headers: { apikey: a.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(msg(j.error_description || j.msg || j.message || j.error || 'Fehler ' + res.status)); e.status = res.status; throw e; }
    return j;
  }
  function setSession(a, j) {
    a.session = { at: j.access_token, rt: j.refresh_token, exp: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600), uid: j.user.id };
    if (j.user.email) a.email = j.user.email;
    saveAuth(a);
  }
  async function refresh(a) {
    const now = auth(); // evtl. hat eine andere App schon erneuert
    if (now.session && now.session.at !== a.session.at) { a.session = now.session; return; }
    try { setSession(a, await authCall(a, 'token?grant_type=refresh_token', { refresh_token: a.session.rt })); }
    catch (e) {
      if (e.status >= 400 && e.status < 500) { a.session = null; saveAuth(a); throw new Error('Anmeldung abgelaufen – bitte neu anmelden'); }
      throw e;
    }
  }
  async function rest(a, path, opts = {}, retry = true) {
    if (a.session.exp - 60 < Date.now() / 1000) await refresh(a);
    const res = await fetch(base(a) + '/rest/v1/' + path, {
      ...opts, headers: { apikey: a.key, Authorization: 'Bearer ' + a.session.at, 'Content-Type': 'application/json', ...opts.headers },
    });
    if (res.status === 401 && retry) { await refresh(a); return rest(a, path, opts, false); }
    const txt = await res.text();
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
      out[id] = { k: m[id].kind, d: m[id].data, j: JSON.stringify(m[id].data) };
    }
    return out;
  }
  async function syncNow(manual) {
    if (!C || !isOn()) return;
    if (sy.busy) { sy.again = true; return; }
    if (!navigator.onLine) { sy.err = 'Offline – wird nachgeholt'; ui(); return; }
    sy.busy = true; ui();
    let changed = false, pushed = 0;
    const a = auth(), p = state(a.session.uid);
    try {
      // 1) Neues vom Server holen (2 Min. Überlappung – doppelt anwenden schadet nicht)
      const since = p.cursor ? new Date(Date.parse(p.cursor) - 120000).toISOString() : null;
      const cur0 = current(p.snap);
      let top = p.cursor ? Date.parse(p.cursor) : 0, topStr = p.cursor || null;
      for (let off = 0; ; off += 1000) {
        const rows = await rest(a, `app_items?select=id,kind,data,deleted,updated_at&app=eq.${encodeURIComponent(C.app)}&order=updated_at.asc,id.asc&limit=1000&offset=${off}` + (since ? `&updated_at=gte.${encodeURIComponent(since)}` : ''));
        for (const r of rows) {
          const t = Date.parse(r.updated_at); if (t > top) { top = t; topStr = r.updated_at; }
          const local = cur0[r.id] && cur0[r.id].j, snap = p.snap[r.id] && p.snap[r.id].j;
          if (local !== snap) continue; // hier geändert → wird gleich hochgeladen und gewinnt
          const remote = r.deleted ? undefined : JSON.stringify(r.data);
          if (remote !== local) { C.apply(r); changed = true; }
          if (r.deleted) delete p.snap[r.id]; else p.snap[r.id] = { k: r.kind, j: remote };
        }
        if (rows.length < 1000) break;
      }
      p.cursor = topStr;
      if (changed) C.persist();

      // 2) Eigene Änderungen hochladen
      const cur = current(p.snap), up = [];
      for (const id in cur) if (cur[id].j !== (p.snap[id] && p.snap[id].j)) up.push({ id, kind: cur[id].k, data: cur[id].d, deleted: false, _j: cur[id].j });
      for (const id in p.snap) if (!(id in cur)) up.push({ id, kind: p.snap[id].k, data: null, deleted: true });
      for (let i = 0; i < up.length; i += 500) {
        const part = up.slice(i, i + 500);
        await rest(a, 'app_items?on_conflict=owner,app,id', {
          method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(part.map(r => ({ owner: a.session.uid, app: C.app, id: r.id, kind: r.kind, data: r.data, deleted: r.deleted }))),
        });
        for (const r of part) { if (r.deleted) delete p.snap[r.id]; else p.snap[r.id] = { k: r.kind, j: r._j }; }
        pushed += part.length;
      }
      p.last = Date.now(); sy.err = '';
      if (manual) C.toast(pushed || changed ? 'Synchronisiert' : 'Alles aktuell');
    } catch (e) {
      sy.err = netErr(e) ? 'Server nicht erreichbar' : e.message;
      if (manual) C.toast(sy.err);
    } finally {
      saveState();
      sy.busy = false;
      if (changed) refreshView();
      ui();
      if (sy.again) { sy.again = false; setTimeout(syncNow, 300); }
    }
  }
  const typing = () => { const el = document.activeElement; return !!el && /INPUT|TEXTAREA|SELECT/.test(el.tagName); };
  function refreshView() { if (typing()) sy.deferred = true; else C.refresh(); }
  document.addEventListener('focusout', () => setTimeout(() => { if (sy.deferred && !typing()) { sy.deferred = false; C.refresh(); } }, 250));

  function soon() { if (!C || !isOn()) return; clearTimeout(sy.timer); sy.timer = setTimeout(syncNow, 1200); }
  setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 20000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  window.addEventListener('online', () => syncNow());
  window.addEventListener('offline', () => { sy.err = 'Offline – wird nachgeholt'; ui(); });

  /* ── Oberfläche ── */
  const CLOUD = '<svg viewBox="0 0 24 24"><path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.5 9.6 4.5 4.5 0 0 0 7 18.5z"/></svg>';
  function badge() {
    const a = auth(), on = isOn();
    if (!on && !a.email) return '';
    const st = !on ? 'err' : sy.busy ? 'busy' : sy.err ? 'err' : 'ok';
    const label = !on ? 'Nicht angemeldet' : sy.busy ? 'Synchronisiere …' : sy.err || 'Online gespeichert';
    return `<button class="hbtn cloud-btn ${st}" id="cloudBtn" data-cloud="tap" aria-label="${esc(label)}" title="${esc(label)}">${CLOUD}</button>`;
  }
  function ui() {
    const b = document.getElementById('cloudBtn'), h = badge();
    if (b) { if (h) b.outerHTML = h; else b.remove(); }
    else if (h && C && C.badgeHost) { const host = document.querySelector(C.badgeHost); if (host) host.insertAdjacentHTML('afterbegin', h); }
    const box = document.getElementById('cloudBox');
    if (box && !box.contains(document.activeElement)) box.outerHTML = section();
  }
  function section() {
    const a = auth(), p = C ? state() : {};
    let h = `<div id="cloudBox"><div class="section-t">Online-Datenbank</div>`;
    if (isOn()) {
      const when = !p.last ? 'noch nie' : Date.now() - p.last < 60000 ? 'gerade eben' : 'vor ' + Math.round((Date.now() - p.last) / 60000) + ' min';
      h += `<div class="card">
        <div class="setting"><span><span class="lbl">☁️ Verbunden</span><br><span class="sub">${esc(a.email || '')}</span></span><span class="cloud-st ${sy.err ? 'err' : 'ok'}">${sy.busy ? '…' : sy.err ? '⚠︎' : '✓'}</span></div>
        <div class="setting"><span class="sub">${sy.err ? esc(sy.err) : 'Zuletzt abgeglichen: ' + when}</span></div>
      </div>
      <div class="card menu" style="margin-top:10px">
        <button data-cloud="tap"><span class="ico">🔄</span>Jetzt synchronisieren</button>
        <button data-cloud="logout"><span class="ico">🚪</span>Abmelden</button>
      </div>
      <p class="small muted" style="margin:0 4px">Deine Daten liegen online und zusätzlich auf diesem Gerät. Der Login gilt für alle Apps im Cockpit. Auf weiteren Handys einfach mit demselben Konto anmelden – Änderungen erscheinen dort beim Öffnen und alle 20 Sekunden.</p>`;
    } else {
      h += `<form class="card cloud-form" data-cloud-form>
        ${a.email ? `<p class="small" style="color:var(--red-t);margin:0 2px 10px">Bitte (neu) anmelden.</p>` : ''}
        <p class="small muted" style="margin:0 2px 12px">Daten online speichern – sicher vor Handy-Verlust und auf mehreren Geräten nutzbar. Ein Konto für alle Apps.</p>
        <div class="field"><label>E-Mail</label><input type="email" name="email" autocomplete="username" value="${esc(a.email || '')}" required></div>
        <div class="field"><label>Passwort</label><input type="password" name="pw" autocomplete="current-password" minlength="6" required></div>
        <details class="cloud-adv" ${a.key ? '' : 'open'}><summary>Server-Einstellungen</summary>
          <div class="field"><label>Supabase-Projekt-URL</label><input type="url" name="url" value="${esc(a.url)}" required></div>
          <div class="field"><label>Anon Public Key</label><input type="text" name="key" value="${esc(a.key)}" placeholder="eyJhbGci…" autocomplete="off" required></div>
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
          <li>Unter <b>Project Settings → API</b> die <b>Project URL</b> und den <b>anon public</b> Key kopieren und oben eintragen.</li>
          <li>Konto anlegen: hier „Konto erstellen“ – oder im Dashboard unter <b>Authentication → Users → Add user</b> (mit „Auto Confirm“).</li>
          <li>Auf weiteren Handys mit derselben E-Mail und demselben Passwort anmelden.</li>
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
      if (!j.access_token) { a.email = email; saveAuth(a); C.toast('Bestätigungs-Mail verschickt – Link antippen, dann anmelden'); return; }
      setSession(a, j); state(a.session.uid); saveState();
      C.refresh();
      await syncNow();
      C.toast(sy.err || 'Verbunden ✓ Daten sind online');
    } catch (e) {
      saveAuth(a);
      C.toast(netErr(e) ? 'Server nicht erreichbar – URL prüfen' : e.message);
    } finally { btns.forEach(b => { b.disabled = false; }); }
  }

  const ACTIONS = {
    tap() { if (isOn()) syncNow(true); else if (C.openSettings) C.openSettings(); },
    signup(el) { const f = el.closest('form'); if (f.reportValidity()) login(f, true); },
    logout() {
      C.confirm('Abmelden? Die Daten bleiben auf diesem Gerät, werden aber nicht mehr online abgeglichen. Gilt für alle Apps.', 'Abmelden', () => {
        const a = auth(); a.session = null; a.email = ''; saveAuth(a); sy.err = ''; C.refresh(); C.toast('Abgemeldet');
      });
    },
    async copy() {
      try { await navigator.clipboard.writeText(SQL); C.toast('SQL kopiert'); }
      catch (e) { const t = document.getElementById('cloudSql'); t.focus(); t.select(); C.toast('Text markiert – jetzt kopieren'); }
    },
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-cloud]'); if (!el || !C) return;
    e.preventDefault(); ACTIONS[el.dataset.cloud](el);
  });
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-cloud-form]') || !C) return;
    e.preventDefault(); login(e.target, false);
  }, true);
  // Login/Logout in einer anderen App (anderer Tab) übernehmen
  window.addEventListener('storage', e => { if (e.key === AUTH_KEY && C) { ui(); if (isOn()) syncNow(); } });

  const css = document.createElement('style');
  css.textContent = `
.cloud-btn{background:var(--card2)!important;color:var(--t3)!important}
.cloud-btn.ok{color:var(--ok)!important}
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
.cloud-help textarea{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical;min-height:0}`;
  document.head.appendChild(css);

  window.Cloud = {
    init(cfg) { C = cfg; P = null; ui(); syncNow(); },
    soon, now: syncNow, isOn, badge, section,
  };
})();
