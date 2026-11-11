/* Hipotenüs service worker: çevrimdışı çalışma ve hızlı açılış */
const VERSION = 'hipotenus-v35';
const SHELL = [
  './', 'index.html', 'giris.html', 'sifre-yenile.html', 'gizlilik.html', 'oyunlar.html', 'oyun.html', 'olustur.html', 'aci-ustasi.html', 'aci-ustasi.js', 'pergel.html', 'pergel.js', 'yaricap-tasi.html', 'yaricap-tasi.js', 'es-dogru.html', 'es-dogru.js', 'saat-aci.html', 'saat-aci.js', 'acinim.html', 'acinim.js', 'cekirge.html', 'cekirge.js', 'termometre.html', 'termometre.js', 'style.css', 'games.css', 'app.js', 'games.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  const sameOrigin = url.origin === location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  // Sitenin kendi dosyaları: önce ağ (güncellemeler hemen görünsün), bağlantı yoksa önbellek
  if (sameOrigin) {
    e.respondWith(
      fetch(req)
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
    );
    return;
  }

  // Google Fonts: önbellekten hemen ver, arkada güncelle
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(req);
      const network = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
