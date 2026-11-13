// Offline-Cache für den Essensplaner. Bei Änderungen VERSION erhöhen.
const VERSION = 'essen-v10';
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'tinder.js', '../shared/cloud.js', 'foods.js', 'recipes.js', 'recipes2.js', 'recipes3.js', 'recipes4.js', 'recipes5.js', 'recipes6.js', 'recipes7.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const TIMEOUT = 3500; // so lange aufs Netz warten, dann den gespeicherten Stand zeigen

self.addEventListener('install', e => {
  // Einzeln laden: fehlt eine Datei, soll die Installation nicht komplett scheitern
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('essen-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Erst Netz (damit Updates sofort ankommen). Ist das Netz weg oder zäh, kommt nach kurzer
// Wartezeit der gespeicherte Stand – die App startet also auch im Funkloch zügig.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('index.html') : undefined);
    const net = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    });
    if (!cached) return net.catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }));
    net.catch(() => {}); // läuft im Hintergrund weiter und frischt den Cache auf
    const late = new Promise(resolve => setTimeout(() => resolve(cached), TIMEOUT));
    return Promise.race([net.then(res => (res.ok ? res : cached)).catch(() => cached), late]);
  })());
});
