// Offline-Cache für den Essensplaner. Bei Änderungen VERSION erhöhen.
const VERSION = 'essen-v13';
const IMG_CACHE = 'essenimg-v1'; // Rezeptfotos: eigener Cache, bleibt bei App-Updates erhalten
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'tinder.js', 'extras.js', 'photos.js', 'haushalt-data.js', 'haushalt.js', '../shared/cloud.js', 'foods.js', 'nutri.js', 'depts.js', 'curation.js', 'recipes.js', 'recipes2.js', 'recipes3.js', 'recipes4.js', 'recipes5.js', 'recipes6.js', 'recipes7.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const TIMEOUT = 3000; // so lange aufs Netz warten, dann den gespeicherten Stand zeigen
let slowUntil = 0;    // war das Netz gerade zäh, kommen die nächsten Dateien sofort aus dem Cache

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
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // Fotos ändern sich nie: erst Cache, sonst laden und merken (so sind gesehene Fotos auch offline da)
  if (/\/essen\/img\//.test(url.pathname)) {
    e.respondWith(caches.open(IMG_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) c.put(req, res.clone()).catch(() => {});
      return res;
    }))).catch(() => new Response('', { status: 404 })));
    return;
  }
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('index.html') : undefined);
    const net = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    });
    if (!cached) return net.catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }));
    net.catch(() => {}); // läuft im Hintergrund weiter und frischt den Cache auf
    if (Date.now() < slowUntil) return cached;
    let done = false;
    const late = new Promise(resolve => setTimeout(() => { if (!done) { slowUntil = Date.now() + 20000; resolve(cached); } }, TIMEOUT));
    const fast = net.then(res => { done = true; return res.ok ? res : cached; }, () => { done = true; slowUntil = Date.now() + 20000; return cached; });
    return Promise.race([fast, late]);
  })());
});
