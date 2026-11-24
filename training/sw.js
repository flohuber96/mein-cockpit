// Die Training-App ist im Körper-Coach aufgegangen.
// Dieser Service Worker ersetzt den alten, löscht dessen Offline-Cache und meldet sich ab,
// damit alte Home-Bildschirm-Icons die Weiterleitung (index.html) aus dem Netz laden.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('training-')).map(k => caches.delete(k))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(cs => cs.forEach(c => c.navigate('../koerper/').catch(() => {}))));
});
