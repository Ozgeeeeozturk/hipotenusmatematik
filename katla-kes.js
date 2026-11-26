/* Katla, Kes, Aç: dikdörtgen kâğıt iki kez katlanır, bir köşeden kesilir; açılınca oluşan şekil sorulur.
   Kâğıt 8×6 birim. 1. katlama: x = 4 doğrusundan sol yarı sağa. 2. katlama: y = 3 doğrusundan üst yarı aşağı.
   Katlı kâğıt: x ∈ [4, 8], y ∈ [0, 3]. (4, 3) iki katın buluştuğu köşe, (8, 0) kâğıdın asıl köşesidir. */
(function () {
  initPage();
  const stage = document.getElementById('stage');
  const W = 8, H = 6, FX = 4, FY = 3;
  const SORULAR = [
    { kes: [[8, 0], [6.7, 0], [8, 1.3]], soru: 'Kâğıt açılınca oluşan çokgen kaç kenarlıdır?', sec: ['4', '6', '8', '12'], dogru: '8',
      neden: 'Kesik, kâğıdın dört asıl köşesinin üst üste geldiği köşede. Açılınca dört köşenin her biri üçgen biçiminde kesilir; her köşe 2 köşeye dönüşür: 4 × 2 = 8 kenar.' },
    { kes: [[4, 3], [5.4, 3], [5.4, 2.2], [4, 2.2]], soru: 'Kâğıt açılınca ortada oluşan deliğin şekli nedir?', sec: ['Kare', 'Dikdörtgen', 'Üçgen', 'Eşkenar dörtgen'], dogru: 'Dikdörtgen',
      neden: 'Kesik, iki katın buluştuğu köşede; bu nokta kâğıdın tam ortası. 1,4 × 0,8’lik parça her iki yöne katlanınca 2,8 × 1,6’lık bir dikdörtgen delik açılır.' },
    { kes: [[4, 3], [5.6, 3], [4, 1.8]], soru: 'Kâğıt açılınca ortada oluşan deliğin şekli nedir?', sec: ['Kare', 'Dikdörtgen', 'Altıgen', 'Eşkenar dörtgen'], dogru: 'Eşkenar dörtgen',
      neden: 'Ortadaki köşeden kesilen dik üçgen dört kez yansır. Dört eş üçgen bir araya gelince kenarları eşit, köşegenleri dik kesişen bir eşkenar dörtgen oluşur.' },
    { kes: [[4, 0], [4.9, 0], [4.9, 0.9], [4, 0.9]], soru: 'Kâğıt açılınca oluşan çokgen kaç kenarlıdır?', sec: ['8', '10', '12', '16'], dogru: '12',
      neden: 'Kesik, dikey katın kâğıdın kenarına değdiği yerde. Açılınca alt ve üst kenarın ortasında birer dikdörtgen girinti olur. Her girinti 4 kenar ekler: 4 + 4 + 4 = 12.' },
    { kes: [[8, 3], [6.9, 3], [8, 1.9]], soru: 'Kâğıt açılınca oluşan çokgen kaç kenarlıdır?', sec: ['6', '8', '10', '12'], dogru: '10',
      neden: 'Kesik, yatay katın kâğıdın kenarına değdiği yerde. Açılınca sağ ve sol kenarın ortasında birer V girintisi olur. Her V girintisi 3 kenar ekler: 4 + 3 + 3 = 10.' },
  ];
  // katlı kâğıttaki bir nokta açılınca bu dört noktaya karşılık gelir
  const yansit = ([x, y]) => [[x, y], [2 * FX - x, y], [x, 2 * FY - y], [2 * FX - x, 2 * FY - y]];

  stage.innerHTML = `
    <div class="pg-def"><span class="pg-def-ic" aria-hidden="true">✂️</span>
      <p><b class="k1">Katla, kes, aç!</b> Kâğıt katlanınca katlar <mark>ayna gibi</mark> davranır: kestiğin parça, katların her birinde <b class="k3">simetriğiyle</b> birlikte düşer.</p></div>
    <div class="kk-ust"><span id="kkNo"></span><span id="kkPuan"></span></div>
    <div class="kk-sahne"><canvas id="kkCv" aria-label="Kâğıt"></canvas><span class="kk-adim" id="kkAdim"></span></div>
    <div class="kk-renk"><span><i style="background:#D9C2F2"></i>Kâğıdın ön yüzü</span><span><i style="background:#A8E8CF"></i>Kâğıdın arka yüzü</span></div>
    <div class="kk-butonlar" id="kkBtn"></div>
    <div id="kkSoru"></div>`;
  const cv = stage.querySelector('#kkCv'), btnKutu = stage.querySelector('#kkBtn'), soruKutu = stage.querySelector('#kkSoru');
  let i = 0, puan = 0, durum, anim = null;

  // ---- çizim ----
  // İki yüzlü origami kâğıdı: ön yüz lila, arka yüz nane (katlanınca katmanlar renkten izlenir)
  const YUZ = { on: { zemin: '#D9C2F2', cizgi: 'rgba(123,79,168,.22)' }, arka: { zemin: '#A8E8CF', cizgi: 'rgba(46,158,120,.25)' } };
  function kagitResmi(kesik, taraf = 'on') { // tam kâğıdın (birim başına 60 px) delikli resmi
    const u = 60, c = document.createElement('canvas'); c.width = W * u; c.height = H * u;
    const g = c.getContext('2d');
    g.fillStyle = YUZ[taraf].zemin; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = YUZ[taraf].cizgi; g.lineWidth = 1;
    for (let x = 0; x <= W; x += .5) { g.beginPath(); g.moveTo(x * u, 0); g.lineTo(x * u, c.height); g.stroke(); }
    for (let y = 0; y <= H; y += .5) { g.beginPath(); g.moveTo(0, y * u); g.lineTo(c.width, y * u); g.stroke(); }
    if (kesik) {
      g.globalCompositeOperation = 'destination-out';
      for (let k = 0; k < 4; k++) { g.beginPath(); kesik.forEach((p, j) => { const q = yansit(p)[k]; const X = q[0] * u, Y = (H - q[1]) * u; j ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill(); }
      g.globalCompositeOperation = 'source-over';
    }
    return { c, u };
  }
  function ciz() {
    const r = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, w, h);
    const u = Math.min((w - 40) / W, (h - 84) / H), ox = (w - W * u) / 2, oy = (h - H * u) / 2 + 22;
    const X = x => ox + x * u, Y = y => oy + (H - y) * u;
    const { c: img, u: iu } = kagitResmi(durum.kesildi ? SORULAR[i].kes : null, 'on');
    const { c: imgArka } = kagitResmi(durum.kesildi ? SORULAR[i].kes : null, 'arka');
    // görüntünün bir dikdörtgen bölgesini (birim) çizer; sx, sy: katlanma ölçeği (−1 ayna)
    const parca = (x0, y0, x1, y1, ekseniX, ekseniY, sx, sy, golge, ters) => {
      g.save();
      g.translate(X(ekseniX), Y(ekseniY)); g.scale(sx, sy); g.translate(-X(ekseniX), -Y(ekseniY));
      g.shadowColor = 'rgba(45,36,64,.35)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
      g.drawImage((sx * sy < 0) !== !!ters ? imgArka : img, x0 * iu, (H - y1) * iu, (x1 - x0) * iu, (y1 - y0) * iu, X(x0), Y(y1), (x1 - x0) * u, (y1 - y0) * u);
      g.shadowColor = 'transparent';
      if (golge) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(45,36,64,${golge})`; g.fillRect(X(x0), Y(y1), (x1 - x0) * u, (y1 - y0) * u); g.globalCompositeOperation = 'source-over'; }
      g.restore();
    };
    const { f1, f2 } = durum; // 0 açık … 1 katlı
    const s1 = 1 - 2 * f1, s2 = 1 - 2 * f2;
    if (f2 === 0) {
      parca(FX, 0, W, H, FX, 0, 1, 1);
      if (s1 > 0) parca(0, 0, FX, H, FX, 0, s1, 1); else parca(0, 0, FX, H, FX, 0, s1, 1, .08 * f1);
    } else {
      // 1. katlamadan sonra üstte ters dönmüş sol yarı (arka yüz) vardır
      parca(FX, 0, W, FY, FX, FY, 1, 1, 0, true);
      parca(FX, FY, W, H, FX, FY, 1, s2, s2 < 0 ? .12 : 0, true);
    }
    // katlama çizgileri ve oklar
    g.setLineDash([7, 6]); g.strokeStyle = '#E8434F'; g.lineWidth = 2;
    if (durum.adim === 0) { g.beginPath(); g.moveTo(X(FX), Y(0) + 6); g.lineTo(X(FX), Y(H) - 6); g.stroke(); }
    if (durum.adim === 1) { g.beginPath(); g.moveTo(X(FX) - 4, Y(FY)); g.lineTo(X(W) + 4, Y(FY)); g.stroke(); }
    g.setLineDash([]);
    const ok = (x1, y1, x2, y2, kv) => { g.strokeStyle = '#2C7FD8'; g.lineWidth = 3; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2 + kv[0], (y1 + y2) / 2 + kv[1], x2, y2); g.stroke();
      const a = Math.atan2(y2 - ((y1 + y2) / 2 + kv[1]), x2 - ((x1 + x2) / 2 + kv[0])); g.fillStyle = '#2C7FD8'; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 12 * Math.cos(a - .4), y2 - 12 * Math.sin(a - .4)); g.lineTo(x2 - 12 * Math.cos(a + .4), y2 - 12 * Math.sin(a + .4)); g.fill(); };
    if (durum.adim === 0 && f1 === 0) ok(X(2), Y(3), X(6), Y(3), [0, -40]);
    if (durum.adim === 1 && f2 === 0) ok(X(6), Y(5), X(6), Y(1), [40, 0]);
    // kesim çizgisi
    if (durum.adim === 2 && !durum.kesildi) {
      g.setLineDash([6, 5]); g.strokeStyle = '#E8434F'; g.lineWidth = 2.5; g.fillStyle = 'rgba(232,67,79,.12)';
      g.beginPath(); SORULAR[i].kes.forEach((p, j) => j ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.closePath(); g.fill(); g.stroke(); g.setLineDash([]);
      const m = SORULAR[i].kes.reduce((a, p) => [a[0] + p[0] / SORULAR[i].kes.length, a[1] + p[1] / SORULAR[i].kes.length], [0, 0]);
      g.font = '26px "Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.fillText('✂️', X(m[0]) + (m[0] > 6 ? 34 : -34), Y(m[1]) + 8);
    }
    // uçan parça
    if (durum.ucus != null) {
      const k = durum.ucus; g.save(); g.globalAlpha = 1 - k; g.translate(30 * k * 3, -40 * k * 2);
      g.fillStyle = '#D9C2F2'; g.strokeStyle = '#7B4FA8'; g.lineWidth = 1.5;
      g.beginPath(); SORULAR[i].kes.forEach((p, j) => j ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
    // katlama köşelerini adlandır (katlı hâlde)
    if (durum.adim === 2) {
      g.font = '800 11px Nunito'; g.fillStyle = '#6B6280'; g.textAlign = 'center';
      g.fillText('kâğıdın ortası', X(FX), Y(FY) - 8);
    }
  }
  function canlandir(alan, hedef, sure, bitince) {
    cancelAnimationFrame(anim);
    const bas = durum[alan], t0 = performance.now();
    const adim = now => { const k = Math.min(1, (now - t0) / sure), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; durum[alan] = bas + (hedef - bas) * e; ciz(); if (k < 1) anim = requestAnimationFrame(adim); else bitince && bitince(); };
    anim = requestAnimationFrame(adim);
  }

  // ---- akış ----
  const ADIM_YAZI = ['Şekil 1: Kâğıdı kırmızı çizgiden, ok yönünde ikiye katla.', 'Şekil 2: Katlanmış kâğıdı yine tam ortadan, ok yönünde katla.', 'Şekil 3: Kesikli çizgi boyunca kes ve parçayı at.', 'Şimdi düşün: kâğıt açılınca ne olacak?', 'Kâğıdı açtık!'];
  function butonlar() {
    const a = durum.adim;
    stage.querySelector('#kkAdim').textContent = ADIM_YAZI[a];
    btnKutu.innerHTML = a === 0 ? '<button class="btn btn-yellow" id="kkGo">📄 1. Katla</button>'
      : a === 1 ? '<button class="btn btn-yellow" id="kkGo">📄 2. Katla</button>'
      : a === 2 ? '<button class="btn btn-yellow" id="kkGo">✂️ Kes</button>' : '';
    const go = btnKutu.querySelector('#kkGo'); if (!go) return;
    go.onclick = () => {
      go.disabled = true;
      if (a === 0) canlandir('f1', 1, 1100, () => { durum.adim = 1; butonlar(); ciz(); });
      if (a === 1) canlandir('f2', 1, 1100, () => { durum.adim = 2; butonlar(); ciz(); });
      if (a === 2) { durum.ucus = 0; durum.kesildi = true; canlandir('ucus', 1, 700, () => { durum.ucus = null; durum.adim = 3; butonlar(); ciz(); soruGoster(); }); }
    };
  }
  function soruGoster() {
    const s = SORULAR[i];
    soruKutu.innerHTML = `<p class="kk-soru-metin">${s.soru}</p>
      <div class="g-options">${s.sec.map((o, k) => `<button class="g-opt c${k}" data-o="${o}"><b>${'ABCD'[k]}</b>${o}</button>`).join('')}</div>
      <p class="pg-fb" id="kkFb"></p>`;
    soruKutu.querySelectorAll('.g-opt').forEach(b => b.onclick = () => {
      const dogru = b.dataset.o === s.dogru;
      soruKutu.querySelectorAll('.g-opt').forEach(x => { x.disabled = true; if (x.dataset.o === s.dogru) x.classList.add('right'); });
      if (!dogru) b.classList.add('wrong'); else puan++;
      const fb = soruKutu.querySelector('#kkFb'); fb.className = 'pg-fb ' + (dogru ? 'ok' : 'no');
      fb.textContent = dogru ? 'Doğru! Şimdi kâğıdı açıp görelim…' : `Doğru cevap: ${s.dogru}. Kâğıdı açıp görelim…`;
      ust();
      setTimeout(() => {
        canlandir('f2', 0, 1000, () => canlandir('f1', 0, 1000, () => {
          durum.adim = 4; butonlar(); ciz();
          soruKutu.insertAdjacentHTML('beforeend', `<div class="kk-neden"><b>Neden?</b> ${s.neden}</div>
            <div class="kk-ileri"><button class="btn btn-yellow" id="kkSonraki">${i < SORULAR.length - 1 ? 'Sonraki soru →' : 'Sonucu gör 🏁'}</button></div>`);
          soruKutu.querySelector('#kkSonraki').onclick = () => { i++; i < SORULAR.length ? baslat() : bitir(); };
        }));
      }, 900);
    });
  }
  function ust() { stage.querySelector('#kkNo').textContent = `Soru ${Math.min(i + 1, SORULAR.length)} / ${SORULAR.length}`; stage.querySelector('#kkPuan').textContent = `⭐ ${puan}`; }
  function baslat() { durum = { adim: 0, f1: 0, f2: 0, kesildi: false, ucus: null }; soruKutu.innerHTML = ''; ust(); butonlar(); ciz(); }
  function bitir() {
    btnKutu.innerHTML = ''; stage.querySelector('.kk-sahne').hidden = true; stage.querySelector('.kk-ust').hidden = true;
    soruKutu.innerHTML = `<div class="g-result"><h2>${puan === 5 ? '🏆 Katlama ustası!' : puan >= 3 ? '👏 Güzel iş!' : '💪 Tekrar deneyelim'}</h2>
      <div class="g-score"><b>${puan}</b><span> / ${SORULAR.length}</span></div>
      <p>İpucu: Kesiğin katlanmış kâğıdın <b>hangi köşesinde</b> olduğuna bak. Ortadaki köşe delik açar, dış köşe kâğıdın köşelerini keser, kat çizgisinin ucu kenarda girinti açar.</p>
      <div class="g-result-btns"><button class="btn btn-yellow" id="kkTekrar">🔁 Baştan oyna</button></div></div>`;
    if (puan >= 4 && window.confetti) try { confetti(); } catch {}
    soruKutu.querySelector('#kkTekrar').onclick = () => { i = 0; puan = 0; stage.querySelector('.kk-sahne').hidden = false; stage.querySelector('.kk-ust').hidden = false; baslat(); };
  }
  window.addEventListener('resize', () => durum && ciz());
  baslat();
})();
