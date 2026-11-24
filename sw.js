// Offline-Cache für die Cockpit-Übersicht. Bei Änderungen VERSION erhöhen.
// Die Apps in den Unterordnern haben eigene Service Worker (genauerer Scope gewinnt).
const VERSION = 'cockpit-v2';
const FILES = ['./', 'index.html', 'shared/ui.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'essen/icon-192.png', 'baby/icon-192.png', 'hund/icon-192.png', 'koerper/icon-192.png', 'kaffee/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// Nur eigene alte Caches löschen (die Apps liegen auf derselben Domain)
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('cockpit-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Erst Netz, sonst Cache – nur für Dateien der Übersicht selbst
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  if (rel && !FILES.includes(rel)) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
