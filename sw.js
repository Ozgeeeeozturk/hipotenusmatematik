/* Hipotenüs service worker: çevrimdışı çalışma ve hızlı açılış */
const VERSION = 'hipotenus-v124';
const SHELL = [
  './', 'index.html', 'yeni-nesil.js', 'yeni-nesil-veri.html', 'yeni-nesil-veri.js', 'yeni-nesil-carpanlar.html', 'yeni-nesil-carpanlar.js', 'oyun-adasi.html', 'benzerlik.html', 'benzerlik.js', 'esitsizlik.html', 'esitsizlik.js', 'cebir-karolari.html', 'cebir-karolari.js', 'kare-bahce.html', 'kare-bahce.js', 'us-kulesi.html', 'us-kulesi.js', 'limonata-orani.html', 'limonata-orani.js', 'ucgen-elemanlari.html', 'ucgen-elemanlari.js', 'donusum.html', 'donusum.js', 'alan-atolyesi.html', 'alan-atolyesi.js', 'terazi.html', 'terazi.js', 'olasilik-carki.html', 'olasilik-carki.js', 'tema-oyun.js', 'veri-dedektifi.html', 'veri-dedektifi.js', 'zumre-tutanaklari.html', 'sok-raporu.html', 'veli-toplantisi.html', 'giris.html', 'sifre-yenile.html', 'gizlilik.html', 'oyunlar.html', 'oyun.html', 'olustur.html', 'aci-ustasi.html', 'aci-ustasi.js', 'pergel.html', 'pergel.js', 'yaricap-tasi.html', 'yaricap-tasi.js', 'es-dogru.html', 'es-dogru.js', 'saat-aci.html', 'saat-aci.js', 'acinim.html', 'acinim.js', 'kup-gorunum.html', 'prizmalar.html', 'prizmalar.js', 'katla-kes.html', 'katla-kes.js', 'kup-gorunum.js', 'basamak-degeri.html', 'basamak-degeri.js', 'cekirge.html', 'cekirge.js', 'termometre.html', 'termometre.js', 'ucgen-avcisi.html', 'ucgen-avcisi.js', 'cember-ucgen.html', 'cember-ucgen.js', 'esit-aralik.html', 'esit-aralik.js', 'fayans.html', 'fayans.js', 'sinif.html', 'sinif.js', 'carpim-merdiveni.html', 'carpim-merdiveni.js', 'aci-boyama.html', 'aci-boyama.js', 'serit-modeli.html', 'serit-modeli.js', 'cay-bardagi.html', 'cay-bardagi.js', 'takip.html', 'takip.js', 'kazanimlar.html', 'kazanimlar.js', 'kazanimlar-veri.js', 'calisma-kagitlari.html', 'etkinlik-setleri.html', 'degerlendirme-testleri.html', 'zaman-cizelgesi.html', 'kavram-yanilgilari.html', 'yanilgi-negatif-kesir.html', 'katlama-sorulari.html', 'formul-ispatlari.html', 'ispat-kesir-bolme.html', 'ispat-negatif-carpim.html', 'ispat-sifirinci-kuvvet.html', 'matematigin-gizemleri.html', 'sembollerin-tarihi.html', 'matematik-gunluk-yasam.html', 'tarih.js', 'style.css', 'games.css', 'app.js', 'games.js', 'ses.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
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
  if (sameOrigin && url.pathname.includes('/videolar/')) return; // videolar doğrudan ağdan (aralıklı istekler)

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
