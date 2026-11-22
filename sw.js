// Service worker de Bullet POS: permite abrir la app sin conexión.
// Cambia el número de CACHE cuando publiques una versión nueva de este archivo.
const CACHE = 'bullet-pos-v2.5.2';
// 1.6.0: copia "shell" escrita solo al instalar. Si una escritura en tiempo de
// ejecución se interrumpe (app cerrada en ese instante), esta copia permanece.
const SHELL = 'bullet-pos-shell-v2.5.2';
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
    const s = await caches.open(SHELL);
    await Promise.allSettled([...CORE, ...CDN].map(u => s.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('bullet-pos-') && k !== CACHE && k !== SHELL).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function cached(req) {
  const c = await caches.open(CACHE);
  let hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const s = await caches.open(SHELL);
  hit = await s.match(req, { ignoreSearch: true });
  if (hit) return hit;
  if (req.mode === 'navigate') {
    hit = (await c.match('index.html')) || (await c.match('./')) || (await s.match('index.html')) || (await s.match('./'));
  }
  return hit || null;
}

// Archivos propios: primero la red (siempre la versión más nueva) y, sin conexión o con red lenta, la copia guardada.
async function networkFirst(e) {
  const req = e.request;
  const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
    if (res && res.ok) {
      const copy = res.clone();
      const p = caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      try { e.waitUntil(p); } catch (x) { /* el evento ya terminó: la copia se guarda igual */ }
    }
    return res;
  });
  try {
    return await Promise.race([
      net,
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    ]);
  } catch (err) {
    const hit = await cached(req);
    if (hit) return hit;
    // Sin copia guardada: se espera a la red (conexión lenta, primera visita).
    try { return await net; } catch (err2) { err = err2; }
    if (req.mode === 'navigate') {
      return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bullet POS</title><body style="font-family:system-ui;padding:24px;background:#f5f3ed;color:#20312d"><h2>Bullet POS sin conexión</h2><p>Esta copia de la app aún no está guardada en este dispositivo. Ábrela una vez con internet. Tus ventas guardadas en el dispositivo no se han perdido.</p><button onclick="location.reload()">Reintentar</button></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    throw err;
  }
}
// Librerías de CDN (versión fija): primero la copia guardada.
async function cacheFirst(e) {
  const req = e.request;
  const hit = await cached(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    const p = caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    try { e.waitUntil(p); } catch (x) {}
  }
  return res;
}

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin) e.respondWith(networkFirst(e));
  else if (CDN.includes(r.url)) e.respondWith(cacheFirst(e));
  // Firestore, autenticación y Google no se interceptan.
});
