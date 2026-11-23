// Offline-Cache für den Hunde-Coach. Bei Änderungen VERSION erhöhen.
const VERSION = 'hund-v1';
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'data-basis.js', 'data-uebungen1.js', 'data-uebungen2.js', 'data-wissen.js', '../shared/cloud.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// Nur eigene alte Caches löschen (die anderen Apps liegen auf derselben Domain)
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('hund-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Erst Netz (damit Updates sofort ankommen), sonst Cache (offline).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
