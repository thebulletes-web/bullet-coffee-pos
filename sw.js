// Service worker de Bullet POS: permite abrir la app sin conexión.
// Cambia el número de CACHE cuando publiques una versión nueva de este archivo.
const CACHE = 'bullet-pos-v1.4.0';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'firebase-config.js'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled([...CORE, ...CDN].map(u => c.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('bullet-pos-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Archivos propios: primero la red (siempre la versión más nueva) y, sin conexión o con red lenta, la copia guardada.
async function networkFirst(req) {
  const c = await caches.open(CACHE);
  try {
    const res = await Promise.race([
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    ]);
    if (res && res.ok) c.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const idx = (await c.match('index.html')) || (await c.match('./'));
      if (idx) return idx;
    }
    throw err;
  }
}
// Librerías de CDN (versión fija): primero la copia guardada.
async function cacheFirst(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin) e.respondWith(networkFirst(r));
  else if (CDN.includes(r.url)) e.respondWith(cacheFirst(r));
  // Firestore, autenticación y Google no se interceptan.
});
