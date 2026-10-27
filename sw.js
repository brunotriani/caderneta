// Caderneta: guarda o app para abrir sem internet. Seus dados não passam por aqui (ficam no navegador do aparelho).
const V = 'caderneta-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin || url.pathname.endsWith('firebase-config.txt')) return;
  if (r.mode === 'navigate' || (url.origin === location.origin && /\/$|index\.html$/.test(url.pathname))){
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); return res; }).catch(() => caches.match('index.html').then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && url.origin === location.origin){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});
