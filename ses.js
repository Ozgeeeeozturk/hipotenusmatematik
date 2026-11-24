/* ================= Hipotenüs oyun sesleri =================
   Bütün sesler Web Audio ile burada sentezlenir: ses dosyası yok, telif hakkı yok.
   - Doğru cevap: iki notalı neşeli "ding-ding"
   - Yanlış cevap: yumuşak, korkutmayan "bup-bup"
   - Oyun bitti: tebrik arpeji ve parıltı
   - Arka plan: neşeli, kendiliğinden üretilen müzik (hafif davul, zıplayan bas, marimba motifleri)
   Oyunlara dokunmadan çalışır: #stage içindeki ortak işaretleri izler
   (pg-fb/cm-fb ok|no, g-opt right|wrong, g-tile wrong, aci-ok, bad, g-timeout, g-result).
   Üst çubuktaki düğme üç durum arasında geçer: müzik + efekt → yalnız efekt → sessiz. Seçim cihazda saklanır. */
const Ses = (() => {
  const DURUMLAR = ['hepsi', 'efekt', 'sessiz'];
  const ETIKET = { hepsi: ['🔊', 'Ses: müzik ve efektler açık'], efekt: ['🔉', 'Ses: yalnızca efektler (müzik kapalı)'], sessiz: ['🔇', 'Ses kapalı'] };
  let durum = (typeof store !== 'undefined' && store.get('hip_ses', 'hepsi')) || 'hepsi';
  if (!DURUMLAR.includes(durum)) durum = 'hepsi';
  let ctx = null, ana = null, efektK = null, muzikK = null, muzikAcik = false, zamanlayici = null, sonrakiVurus = 0, vurus = 0;

  function baglam() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    ana = ctx.createGain(); ana.gain.value = 0.9; ana.connect(ctx.destination);
    efektK = ctx.createGain(); efektK.gain.value = 1; efektK.connect(ana);
    muzikK = ctx.createGain(); muzikK.gain.value = 0; muzikK.connect(ana);
    return ctx;
  }
  const frekans = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI nota → Hz

  // Tek nota: zarf (attack/decay) ile yumuşak başlayıp söner
  function nota({ hz, bas, sure = 0.3, tur = 'sine', ses = 0.2, atak = 0.008, hedef = efektK, suzgec = 0, kayma = 0 }) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tur; o.frequency.setValueAtTime(hz, bas);
    if (kayma) o.frequency.exponentialRampToValueAtTime(hz * kayma, bas + sure);
    g.gain.setValueAtTime(0.0001, bas);
    g.gain.exponentialRampToValueAtTime(ses, bas + atak);
    g.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
    let son = g;
    if (suzgec) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = suzgec; g.connect(f); son = f; }
    o.connect(g); son.connect(hedef);
    o.start(bas); o.stop(bas + sure + 0.05);
  }

  // Efekt çalarken müziği kısa süre kıs
  function muzigiKis(saniye) {
    if (!muzikAcik) return;
    const t = ctx.currentTime;
    muzikK.gain.cancelScheduledValues(t);
    muzikK.gain.setTargetAtTime(0.25, t, 0.03);
    muzikK.gain.setTargetAtTime(1, t + saniye, 0.4);
  }

  const EFEKT = {
    dogru(t) {
      nota({ hz: frekans(84), bas: t, sure: 0.22, ses: 0.22 });            // C6
      nota({ hz: frekans(96), bas: t, sure: 0.18, ses: 0.05 });            // parlaklık
      nota({ hz: frekans(91), bas: t + 0.11, sure: 0.38, ses: 0.24 });     // G6
      nota({ hz: frekans(103), bas: t + 0.11, sure: 0.3, ses: 0.05 });
      return 0.5;
    },
    yanlis(t) {
      nota({ hz: frekans(57), bas: t, sure: 0.2, tur: 'triangle', ses: 0.26, suzgec: 1200, kayma: 0.94 });        // A3
      nota({ hz: frekans(53), bas: t + 0.17, sure: 0.32, tur: 'triangle', ses: 0.26, suzgec: 1000, kayma: 0.9 }); // F3
      return 0.55;
    },
    tebrik(t) {
      [72, 76, 79, 84].forEach((n, i) => {                                   // C5 E5 G5 C6 arpej
        nota({ hz: frekans(n), bas: t + i * 0.12, sure: 0.5, tur: 'triangle', ses: 0.2 });
        nota({ hz: frekans(n + 12), bas: t + i * 0.12, sure: 0.35, ses: 0.05 });
      });
      [72, 76, 79, 84].forEach(n => nota({ hz: frekans(n), bas: t + 0.5, sure: 1.4, tur: 'sine', ses: 0.09, atak: 0.02 })); // akor
      [100, 103, 108, 103, 105, 110, 107].forEach((n, i) =>                  // parıltı
        nota({ hz: frekans(n), bas: t + 0.55 + i * 0.07, sure: 0.25, ses: 0.035 }));
      return 1.8;
    },
  };

  function cal(ad) {
    if (window.__sesKayit) window.__sesKayit.push(ad); // test için: hangi ses çalındı
    if (durum === 'sessiz' || !baglam()) return;
    if (ctx.state !== 'running') return; // ilk dokunuştan önce ses çalınamaz (tarayıcı kuralı)
    muzigiKis(EFEKT[ad](ctx.currentTime + 0.01));
  }

  // ---- Arka plan müziği: 112 BPM, neşeli ve zıplayan (C–G–Am–F) ----
  // vurus = sekizlik adım sayacı (ölçü başına 8 adım). Davul, zıplayan bas, marimba motifleri ve çok hafif akor.
  const AKORLAR = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];                 // C G Am F
  const UST = [[72, 76, 79, 84], [71, 74, 79, 83], [69, 72, 76, 81], [69, 72, 77, 81]];      // melodi için akor sesleri
  const KOK_BAS = [48, 43, 45, 41];
  // Motifler: 8 adım, akorun üst seslerinden sıra numarası (null = sus). Akılda kalsın diye tekrar ederler.
  const MOTIF = [
    [0, null, 1, 2, null, 3, 2, null],
    [2, null, 1, null, 0, 1, 2, null],
    [3, 2, null, 1, 2, null, 0, null],
    [0, 0, null, 2, 1, null, 3, null],
  ];
  const DIZI = [0, 1, 0, 2, 3, 1, 2, 0]; // 8 ölçülük melodi sırası
  const BAS = [0, null, 12, null, 7, null, 12, 0]; // köke göre aralık
  let tohum = 7;
  const rastgele = () => (tohum = (tohum * 16807) % 2147483647) / 2147483647;
  const VURUS = 60 / 112 / 2; // bir sekizlik
  let gurultu = null;
  function gurultuTamponu() {
    if (gurultu) return gurultu;
    gurultu = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = gurultu.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return gurultu;
  }
  function vurma(t, { tip, frekans: fr, Q = 1, ses, sure }) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = gurultuTamponu(); f.type = tip; f.frequency.value = fr; f.Q.value = Q;
    g.gain.setValueAtTime(ses, t); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    s.connect(f); f.connect(g); g.connect(muzikK);
    s.start(t, Math.random() * 0.5); s.stop(t + sure + 0.02);
  }
  function davul(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(muzikK); o.start(t); o.stop(t + 0.22);
  }
  function marimba(n, t, ses = 0.055) {
    const hz = frekans(n);
    nota({ hz, bas: t, sure: 0.34, ses, atak: 0.004, hedef: muzikK });
    nota({ hz: hz * 4, bas: t, sure: 0.06, ses: ses * 0.25, atak: 0.002, hedef: muzikK });
    nota({ hz, bas: t, sure: 0.22, tur: 'triangle', ses: ses * 0.3, atak: 0.004, hedef: muzikK });
  }

  function muzikPlanla() {
    const ileri = ctx.currentTime + 0.4;
    while (sonrakiVurus < ileri) {
      const t = sonrakiVurus, adim = vurus % 8, olcu = Math.floor(vurus / 8), a = olcu % 4;
      // Davul: bas davul 1 ve 3'te, el çırpma 2 ve 4'te, tıkırtı ara sekizliklerde
      if (adim === 0 || adim === 4) davul(t);
      if (adim === 2 || adim === 6) vurma(t, { tip: 'bandpass', frekans: 1800, Q: 0.8, ses: 0.05, sure: 0.09 });
      if (adim % 2 === 1) vurma(t, { tip: 'highpass', frekans: 6500, ses: 0.022, sure: 0.035 });
      // Zıplayan bas
      if (BAS[adim] !== null) nota({ hz: frekans(KOK_BAS[a] + BAS[adim]), bas: t, sure: 0.17, tur: 'triangle', ses: 0.11, atak: 0.005, hedef: muzikK, suzgec: 700 });
      // Ölçü başında çok hafif akor
      if (adim === 0) AKORLAR[a].forEach(n => nota({ hz: frekans(n), bas: t, sure: VURUS * 8, ses: 0.012, atak: 0.25, hedef: muzikK }));
      // Marimba melodisi (her 8 ölçüde bir küçük değişiklik)
      const m = MOTIF[DIZI[olcu % 8]][adim];
      if (m !== null && !(olcu % 8 === 7 && adim > 4) && rastgele() > 0.08) marimba(UST[a][m], t);
      vurus++; sonrakiVurus += VURUS;
    }
  }

  function muzikBaslat() {
    if (muzikAcik || durum !== 'hepsi' || !baglam() || ctx.state !== 'running') return;
    muzikAcik = true; vurus = 0; sonrakiVurus = ctx.currentTime + 0.1;
    muzikK.gain.cancelScheduledValues(ctx.currentTime);
    muzikK.gain.setValueAtTime(0, ctx.currentTime);
    muzikK.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5); // yavaşça girsin
    muzikPlanla(); zamanlayici = setInterval(muzikPlanla, 100);
  }
  function muzikDurdur() {
    if (!muzikAcik) return;
    muzikAcik = false; clearInterval(zamanlayici);
    muzikK.gain.cancelScheduledValues(ctx.currentTime);
    muzikK.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  }

  // ---- Oyundaki olayları yakala ----
  let bekleyen = null, zaman = null;
  function olay(tur) {
    if (!bekleyen) bekleyen = new Set();
    bekleyen.add(tur);
    clearTimeout(zaman);
    zaman = setTimeout(() => {
      const s = bekleyen; bekleyen = null;
      if (s.has('bitti')) cal('tebrik');      // bitiş ekranı en önemlisi
      else if (s.has('yanlis')) cal('yanlis'); // yanlışta doğru şık da işaretlenir; yanlış öncelikli
      else if (s.has('dogru')) cal('dogru');
    }, 70);
  }
  const GERI_BILDIRIM = '.pg-fb, .cm-fb';
  function incele(el) {
    if (!(el instanceof Element)) return;
    if (el.matches('.g-result') || el.querySelector('.g-result')) return olay('bitti');
    if (el.matches('.g-timeout')) return olay('yanlis');
    if (el.matches('.aci-ok') || el.querySelector('.aci-ok')) olay('dogru');
  }
  function izle(stage) {
    new MutationObserver(kayitlar => {
      for (const k of kayitlar) {
        const hedef = k.type === 'characterData' ? k.target.parentElement : k.target;
        if (k.type === 'childList') k.addedNodes.forEach(incele);
        if (k.type === 'attributes') {
          const el = k.target, eski = ' ' + (k.oldValue || '') + ' ';
          const yeni = c => el.classList.contains(c) && !eski.includes(' ' + c + ' ');
          if (el.matches('.g-opt, .g-tile, button') && (yeni('wrong') || yeni('bad'))) olay('yanlis');
          else if (el.matches('.g-opt') && yeni('right')) olay('dogru');
          else if (el.matches('.g-tile') && yeni('done')) olay('dogru');
        }
        // Geri bildirim satırı yazıldığında (sınıfı ya da metni değişince)
        const fb = hedef && hedef.closest && hedef.closest(GERI_BILDIRIM);
        if (fb && fb.textContent.trim() && (k.type !== 'attributes' || k.attributeName === 'class')) {
          if (fb.classList.contains('ok')) olay('dogru');
          else if (fb.classList.contains('no')) olay('yanlis');
        }
      }
    }).observe(stage, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }

  // ---- Düğme ----
  function dugmeGuncelle(b) { const [ic, ad] = ETIKET[durum]; b.textContent = ic; b.title = ad; b.setAttribute('aria-label', ad); }
  function dugmeEkle() {
    const yer = document.querySelector('.bar-actions');
    if (!yer || document.getElementById('sesBtn')) return;
    const b = document.createElement('button');
    b.id = 'sesBtn'; b.type = 'button'; b.className = 'btn-login btn-ghost ses-btn';
    dugmeGuncelle(b);
    b.addEventListener('click', e => {
      e.stopPropagation();
      durum = DURUMLAR[(DURUMLAR.indexOf(durum) + 1) % DURUMLAR.length];
      if (typeof store !== 'undefined') store.set('hip_ses', durum);
      dugmeGuncelle(b);
      uyan();
      if (durum === 'hepsi') muzikBaslat(); else muzikDurdur();
      if (durum !== 'sessiz') cal('dogru'); // seçimin duyulsun
    });
    yer.insertBefore(b, yer.firstChild);
  }

  // Tarayıcılar sesi ancak ilk dokunuştan sonra açar
  function uyan() {
    if (!baglam()) return;
    if (ctx.state === 'suspended') ctx.resume().then(muzikBaslat, () => {});
    else muzikBaslat();
  }

  function baslat() {
    const stage = document.getElementById('stage');
    if (!stage || !document.querySelector('.play-head')) return;
    dugmeEkle();
    izle(stage);
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, uyan, { once: false, passive: true, capture: true }));
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) { muzikDurdur(); ctx.suspend().catch(() => {}); }
      else ctx.resume().then(muzikBaslat, () => {});
    });
  }

  return { baslat, cal };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', Ses.baslat);
else Ses.baslat();
