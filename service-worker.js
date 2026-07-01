/* Verbraeken Werf Registratie — service worker
   Maakt de app installeerbaar (PWA) en bruikbaar zonder signaal.
   Bij elke nieuwe versie van de app: verhoog het versienummer hieronder
   (bv. v1 -> v2), zodat de oude cache wordt opgeruimd. */
const CACHE = 'verbraeken-werf-v14';
const SHELL = [
  './',
  './index.html',
  './werf-registratie.html',
  './manifest.json',
  './verbraeken-icon.svg',
  './infra-group-logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  // Alleen GET-verzoeken naar het eigen domein onderscheppen.
  // Verzoeken naar Google (de Sheets-sync) gaan altijd rechtstreeks naar het netwerk,
  // zodat de online/offline-wachtrij in de app correct blijft werken.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // App-pagina's: netwerk eerst (online = altijd nieuwste versie), val terug op cache.
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (r) {
            return r || caches.match('./werf-registratie.html');
          });
        })
    );
    return;
  }

  // Overige bestanden (icoon, manifest): cache eerst, anders netwerk.
  e.respondWith(
    caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      });
    })
  );
});
