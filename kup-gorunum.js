/* Küp Yapıları: Farklı Yönlerden Görünüm (7. sınıf, MAT.7.4.1)
   Yapılar yükseklik haritasıdır: H[satır][sütun], satır 0 = arka, son satır = ön; sütun 0 = sol.
   1) Görünümleri Çiz: 3B yapıya bakıp önden/üstten/soldan/sağdan görünümleri kareli ızgaraya boya.
   2) Hangi Yapı?: Üç görünümü verilen yapıyı dört seçenek arasından bul. */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  const CIZ = [
    [[2, 1, 1], [1, 0, 0]],
    [[1, 1, 2], [0, 1, 1]],
    [[2, 1, 2], [1, 0, 1]],
    [[3, 2, 1], [2, 1, 0]],
    [[2, 1, 2], [2, 1, 1], [1, 1, 0]],
    [[1, 2, 1], [2, 3, 2], [1, 2, 1]],
  ];
  const HANGI = [
    [[2, 1, 1], [1, 0, 0]],
    [[1, 2, 1], [1, 0, 0]],
    [[2, 2], [1, 0], [1, 1]],
    [[1, 1, 1], [0, 2, 0], [0, 1, 0]],
    [[3, 1], [2, 1], [1, 0]],
  ];

  // Yön bilgileri: renk, kamera açısı (rx: eğim, ry: dönüş)
  const YON = {
    onden: { ad: 'Önden', renk: '#4BC5CF', rx: 0, ry: 0 },
    usten: { ad: 'Üstten', renk: '#E8334A', rx: -90, ry: 0 },
    soldan: { ad: 'Soldan', renk: '#8CC63F', rx: 0, ry: 90 },
    sagdan: { ad: 'Sağdan', renk: '#7B6FC6', rx: 0, ry: -90 },
  };
  const CAPRAZ = { rx: -28, ry: -36 };
  const KISA = { onden: 'Ön', usten: 'Üst', soldan: 'Sol', sagdan: 'Sağ' }; // küçük düğmeler için
  const YUZ_RENK = { on: '#4BC5CF', ust: '#E8334A', sag: '#7B6FC6', sol: '#8CC63F', arka: '#B9BFCB', alt: '#9AA1AE' };


  // ---- Görünüm hesapları (kare kümesi: "sütun,yükseklik-satırı") ----
  const boyut = H => ({ R: H.length, C: H[0].length, Y: Math.max(...H.flat()) });
  function gorunum(H, yon) {
    const { R, C } = boyut(H), k = new Set();
    // Üstten: arka sıra resmin üstünde, ön sıra altında (y yukarı doğru artar)
    if (yon === 'usten') { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (H[r][c]) k.add(`${c},${R - 1 - r}`); return k; }
    const sutunlar = yon === 'onden' ? [...Array(C).keys()].map(c => Math.max(...H.map(s => s[c])))
      : yon === 'soldan' ? H.map(s => Math.max(...s))                    // arka solda, ön sağda
        : H.map(s => Math.max(...s)).reverse();                          // sağdan: ön solda, arka sağda
    sutunlar.forEach((h, x) => { for (let y = 0; y < h; y++) k.add(`${x},${y}`); });
    return k;
  }
  // Konumdan bağımsız karşılaştırma için şekli sol-alt köşeye kaydır
  function normal(k) {
    const p = [...k].map(s => s.split(',').map(Number));
    if (!p.length) return '';
    const mx = Math.min(...p.map(a => a[0])), my = Math.min(...p.map(a => a[1]));
    return p.map(([x, y]) => `${x - mx},${y - my}`).sort().join(' ');
  }
  const ayni = (a, b) => normal(a) === normal(b);
  const kupSayisi = H => H.flat().reduce((a, b) => a + b, 0);

  // ---- 3B çizim (CSS 3B: x sağa, y aşağı, z izleyiciye) ----
  function yapiCiz(dunya, H, U) {
    const { R, C, Y } = boyut(H), dolu = (r, c, y) => r >= 0 && r < R && c >= 0 && c < C && y >= 0 && y < H[r][c];
    const ox = (C - 1) / 2, oy = (Y - 1) / 2, oz = (R - 1) / 2;
    const YUZLER = [
      ['on', 0, 0, 1, ''], ['arka', 0, 0, -1, 'rotateY(180deg)'], ['sag', 1, 0, 0, 'rotateY(90deg)'],
      ['sol', -1, 0, 0, 'rotateY(-90deg)'], ['ust', 0, 1, 0, 'rotateX(90deg)'], ['alt', 0, -1, 0, 'rotateX(-90deg)'],
    ];
    let html = '';
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (let y = 0; y < H[r][c]; y++) {
      const cx = (c - ox) * U, cy = -(y - oy) * U, cz = (r - oz) * U;
      for (const [ad, dx, dy, dz, don] of YUZLER) {
        if (dolu(r + dz, c + dx, y + dy)) continue; // komşu küple paylaşılan iç yüzü çizme
        html += `<div class="kg-yuz" style="width:${U}px;height:${U}px;margin:${-U / 2}px 0 0 ${-U / 2}px;background:${YUZ_RENK[ad]};transform:translate3d(${cx}px,${cy}px,${cz}px) ${don} translateZ(${U / 2}px)"></div>`;
      }
    }
    dunya.innerHTML = html;
  }

  // Sürükleyerek döndürülebilen sahne; yön düğmeleriyle tam o yöne döner
  function sahne(kutu, H, { U = 52, surukle = true } = {}) {
    const dunya = kutu.querySelector('.kg-dunya');
    yapiCiz(dunya, H, U);
    const S = { rx: CAPRAZ.rx, ry: CAPRAZ.ry };
    let anim = null;
    const uygula = () => {
      // Tam yön görünümlerinde perspektifi azalt: kitaptaki gibi düz görünüm
      const duz = [0, -90].includes(Math.round(S.rx)) && Math.round(S.ry) % 90 === 0;
      kutu.style.perspective = duz ? '6000px' : '1200px';
      dunya.style.transform = `rotateX(${S.rx}deg) rotateY(${S.ry}deg)`;
    };
    const git = (rx, ry) => {
      cancelAnimationFrame(anim);
      const a = { ...S }, t0 = performance.now(), sure = 650;
      const adim = t => {
        const p = Math.min(1, (t - t0) / sure), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        S.rx = a.rx + (rx - a.rx) * e; S.ry = a.ry + (ry - a.ry) * e; uygula();
        if (p < 1) anim = requestAnimationFrame(adim);
      };
      anim = requestAnimationFrame(adim);
    };
    if (surukle) {
      let d = null;
      kutu.addEventListener('pointerdown', e => { d = { x: e.clientX, y: e.clientY, rx: S.rx, ry: S.ry }; kutu.setPointerCapture(e.pointerId); cancelAnimationFrame(anim); kutu.classList.add('tut'); });
      kutu.addEventListener('pointermove', e => {
        if (!d) return;
        S.ry = d.ry + (e.clientX - d.x) * 0.5;
        S.rx = Math.max(-90, Math.min(25, d.rx - (e.clientY - d.y) * 0.5));
        uygula();
      });
      const bitir = () => { d = null; kutu.classList.remove('tut'); };
      kutu.addEventListener('pointerup', bitir); kutu.addEventListener('pointercancel', bitir);
    }
    uygula();
    return { git };
  }

  const sahneHTML = (sinif = '') => `<div class="kg-sahne ${sinif}"><div class="kg-dunya"></div></div>`;
  const yonDugmeleri = () => `<div class="kg-yonler">
    ${Object.entries(YON).map(([k, v]) => `<button class="kg-yon" data-yon="${k}" style="--c:${v.renk}">👁 ${v.ad}</button>`).join('')}
    <button class="kg-yon" data-yon="capraz" style="--c:#2D2440">🧊 Çapraz</button>
  </div>`;
  function yonBagla(kok, s) {
    kok.querySelectorAll('.kg-yon').forEach(b => b.addEventListener('click', () => {
      const y = b.dataset.yon === 'capraz' ? CAPRAZ : YON[b.dataset.yon];
      s.git(y.rx, y.ry);
      kok.querySelectorAll('.kg-yon').forEach(x => x.classList.toggle('on', x === b));
    }));
  }

  // Küçük, salt-okunur görünüm resmi (Hangi Yapı? sorusunda)
  function gorunumResmi(k, renk, n) {
    const p = [...k].map(s => s.split(',').map(Number));
    const w = Math.max(...p.map(a => a[0])) + 1, h = Math.max(...p.map(a => a[1])) + 1, g = Math.max(w, h, 3);
    let kare = '';
    for (let y = g - 1; y >= 0; y--) for (let x = 0; x < g; x++) kare += `<i class="${k.has(`${x},${y}`) ? 'on' : ''}"></i>`;
    return `<div class="kg-mini" style="--g:${g};--c:${renk}">${kare}</div>`;
  }

  // ================= Giriş =================
  function giris() {
    stage.innerHTML = `
      <div class="g-intro">
        <div class="big-ic" aria-hidden="true">🧊</div>
        <p>Küplerden oluşan yapıları <b>döndür</b>, <b>👁 düğmeleriyle</b> tam önden, üstten, soldan ve sağdan bak. Sonra görünümleri sen çiz ya da görünümlerden yapıyı bul!</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" data-m="ciz">✏️ Görünümleri Çiz</button>
          <button class="btn btn-lilac" data-m="hangi">🔍 Hangi Yapı?</button>
        </div>
      </div>`;
    stage.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => (b.dataset.m === 'ciz' ? ciz(0, 0) : hangi(0, 0))));
  }

  // ================= 1) Görünümleri Çiz =================
  function ciz(i, puan) {
    const H = CIZ[i], { R, C, Y } = boyut(H);
    const g = Math.min(5, Math.max(R, C, Y) + 1);
    const cevap = Object.fromEntries(Object.keys(YON).map(y => [y, gorunum(H, y)]));
    const boya = Object.fromEntries(Object.keys(YON).map(y => [y, new Set()]));
    let ilkKontrol = true, bitti = false;

    stage.innerHTML = `
      ${progressBar(i, CIZ.length)}
      <p class="pg-step qbox"><span class="fy-qno">${i + 1}. Yapı</span>Eş küplerle oluşturulmuş yapının <b>önden, üstten, soldan ve sağdan</b> görünümlerini karelere dokunarak çiz. Emin olamazsan <b>👁</b> düğmesiyle o yönden bak!</p>
      <div class="kg-duzen">
        <div>${sahneHTML()}${yonDugmeleri()}<p class="kg-ipucu">👆 Yapıyı parmağınla da döndürebilirsin.</p></div>
        <div class="kg-paneller">${Object.entries(YON).map(([k, v]) => `
          <div class="kg-panel" data-yon="${k}" style="--c:${v.renk}">
            <div class="kg-panel-bas"><b>${v.ad}</b><button class="kg-bak" data-yon="${k}" title="${v.ad} bak">👁</button></div>
            <div class="kg-izgara" style="--g:${g}">${Array.from({ length: g * g }, (_, n) => { const x = n % g, y = g - 1 - Math.floor(n / g); return `<button class="kg-kare" data-k="${x},${y}" aria-label="kare"></button>`; }).join('')}</div>
            <p class="kg-sayi"></p>
          </div>`).join('')}</div>
      </div>
      <p class="pg-fb" id="kgFb" aria-live="polite"></p>
      <div class="aci-actions btns" id="kgEylem" style="justify-content:center;gap:10px">
        <button class="btn btn-yellow" id="kgKontrol">✔ Kontrol Et</button>
        <button class="btn btn-ghost-dark" id="kgGoster">💡 Cevabı Göster</button>
      </div>`;

    const s = sahne(stage.querySelector('.kg-sahne'), H);
    yonBagla(stage, s);
    stage.querySelectorAll('.kg-bak').forEach(b => b.addEventListener('click', () => stage.querySelector(`.kg-yon[data-yon="${b.dataset.yon}"]`).click()));
    stage.querySelectorAll('.kg-panel').forEach(p => {
      const y = p.dataset.yon;
      p.querySelectorAll('.kg-kare').forEach(k => k.addEventListener('click', () => {
        if (bitti) return;
        const a = k.dataset.k;
        boya[y].has(a) ? boya[y].delete(a) : boya[y].add(a);
        k.classList.toggle('on', boya[y].has(a));
        p.classList.remove('ok', 'no'); p.querySelector('.kg-sayi').textContent = '';
      }));
    });
    const fb = stage.querySelector('#kgFb');

    function sonraki(goster) {
      bitti = true;
      if (goster) Object.keys(YON).forEach(y => {
        const p = stage.querySelector(`.kg-panel[data-yon="${y}"]`);
        // Cevabı ızgaraya sol-alttan çiz
        p.querySelectorAll('.kg-kare').forEach(k => k.classList.toggle('on', cevap[y].has(k.dataset.k)));
        p.classList.remove('no'); p.classList.add('ok');
        p.querySelector('.kg-sayi').textContent = `Görülen kare: ${cevap[y].size}`;
      });
      const son = i + 1 >= CIZ.length;
      stage.querySelector('#kgEylem').innerHTML = `<button class="btn btn-yellow" id="kgSonra">${son ? 'Bitir 🏁' : 'Sonraki Yapı →'}</button>`;
      const n = stage.querySelector('#kgSonra'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => (son ? ozet('ciz', puan, CIZ.length * 4) : ciz(i + 1, puan)));
    }

    stage.querySelector('#kgKontrol').addEventListener('click', () => {
      let dogru = 0;
      Object.keys(YON).forEach(y => {
        const p = stage.querySelector(`.kg-panel[data-yon="${y}"]`), ok = ayni(boya[y], cevap[y]);
        p.classList.toggle('ok', ok); p.classList.toggle('no', !ok);
        p.querySelector('.kg-sayi').textContent = ok ? `Görülen kare: ${cevap[y].size}` : '';
        if (ok) dogru++;
      });
      if (ilkKontrol) { puan += dogru; ilkKontrol = false; }
      if (dogru === 4) {
        fb.className = 'pg-fb ok';
        fb.innerHTML = `✓ Dört görünüm de doğru! Bu yapıda <b>${kupSayisi(H)}</b> küp var ama hiçbir görünümde hepsini aynı anda göremeyiz.`;
        sonraki(false);
      } else {
        const yanlis = Object.keys(YON).filter(y => !ayni(boya[y], cevap[y])).map(y => YON[y].ad);
        fb.className = 'pg-fb no';
        fb.innerHTML = `✗ <b>${yanlis.join(', ')}</b> görünüm${yanlis.length > 1 ? 'leri' : 'ü'} tutmuyor. 👁 düğmesiyle o yönden bak ve tekrar dene.`;
      }
    });
    stage.querySelector('#kgGoster').addEventListener('click', () => {
      if (ilkKontrol) ilkKontrol = false; // cevabı gören bu yapıdan puan almaz
      fb.className = 'pg-fb'; fb.innerHTML = '💡 Doğru görünümler ızgaralara çizildi. 👁 düğmeleriyle her yönden bakıp karşılaştır.';
      sonraki(true);
    });
  }

  // ================= 2) Hangi Yapı? =================
  const VERILEN = ['onden', 'sagdan', 'usten'];
  function ayna(H) { return H.map(s => [...s].reverse()); }
  function secenekler(H) {
    const imza = X => VERILEN.map(y => normal(gorunum(X, y))).join('|');
    const hedef = imza(H), adaylar = [], gorulen = new Set([JSON.stringify(H)]);
    const ekle = X => {
      const j = JSON.stringify(X);
      if (gorulen.has(j) || imza(X) === hedef || !X.flat().some(Boolean) || X.some(s => !s.some(Boolean)) || !X[0].map((_, c) => X.some(s => s[c])).every(Boolean)) return;
      gorulen.add(j); adaylar.push(X);
    };
    ekle(ayna(H)); // en sık hata: sağ-sol karışıklığı
    const { R, C } = boyut(H);
    for (let r = 0; r < R && adaylar.length < 12; r++) for (let c = 0; c < C; c++) {
      const X = H.map(s => [...s]); X[r][c] += 1; ekle(X);
      const Y = H.map(s => [...s]); if (Y[r][c] > 0) { Y[r][c] -= 1; ekle(Y); }
    }
    // Bir küpü başka bir yere taşı
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (H[r][c] > 1) for (let r2 = 0; r2 < R; r2++) for (let c2 = 0; c2 < C; c2++) {
      const X = H.map(s => [...s]); X[r][c]--; X[r2][c2]++; ekle(X);
    }
    const sec = [adaylar[0], ...shuffle(adaylar.slice(1)).slice(0, 2)].filter(Boolean);
    return shuffle([{ H, dogru: true }, ...sec.map(X => ({ H: X, dogru: false }))]);
  }
  function neden(X, H) {
    const tutmayan = VERILEN.filter(y => !ayni(gorunum(X, y), gorunum(H, y))).map(y => YON[y].ad.toLocaleLowerCase('tr'));
    return tutmayan.length ? `Bu yapının ${tutmayan.join(' ve ')} görünümü verilenle aynı değil.` : '';
  }

  function hangi(i, puan) {
    const H = HANGI[i], sec = secenekler(H);
    stage.innerHTML = `
      ${progressBar(i, HANGI.length)}
      <p class="pg-step qbox"><span class="fy-qno">${i + 1}. Soru</span>Üç farklı yönden görünümü verilen yapı aşağıdakilerden hangisidir? Her seçeneği <b>👁</b> düğmeleriyle çevirip görünümleri karşılaştırabilirsin.</p>
      <div class="kg-verilen">${VERILEN.map(y => `<figure>${gorunumResmi(gorunum(H, y), YON[y].renk)}<figcaption>${YON[y].ad}</figcaption></figure>`).join('')}</div>
      <div class="kg-secenekler">${sec.map((o, k) => `
        <div class="kg-secenek" data-k="${k}">
          ${sahneHTML('kucuk')}
          <div class="kg-yonler kucuk">${Object.entries(YON).map(([y, v]) => `<button class="kg-yon" data-yon="${y}" style="--c:${v.renk}" title="${v.ad}">${KISA[y]}</button>`).join('')}<button class="kg-yon" data-yon="capraz" style="--c:#2D2440" title="Çapraz">🧊</button></div>
          <button class="g-opt c${k}" data-k="${k}"><b>${'ABCD'[k]}</b>Bu yapı</button>
        </div>`).join('')}</div>
      <p class="pg-fb" id="kgFb" aria-live="polite"></p>
      <div class="aci-actions" id="kgEylem"></div>`;

    stage.querySelectorAll('.kg-secenek').forEach(el => {
      const s = sahne(el.querySelector('.kg-sahne'), sec[+el.dataset.k].H, { U: 30 });
      yonBagla(el, s);
    });
    let cevaplandi = false;
    const fb = stage.querySelector('#kgFb');
    stage.querySelectorAll('.kg-secenekler .g-opt').forEach(b => b.addEventListener('click', () => {
      if (cevaplandi) return; cevaplandi = true;
      const o = sec[+b.dataset.k];
      if (o.dogru) puan++;
      stage.querySelectorAll('.kg-secenekler .g-opt').forEach(x => { x.disabled = true; if (sec[+x.dataset.k].dogru) x.classList.add('right'); });
      if (!o.dogru) b.classList.add('wrong');
      fb.className = 'pg-fb ' + (o.dogru ? 'ok' : 'no');
      fb.innerHTML = o.dogru ? '✓ Doğru! Üç görünüm de bu yapıyla birebir aynı.' : `✗ ${neden(o.H, H)} Doğru yapı yeşil işaretli olan.`;
      const son = i + 1 >= HANGI.length;
      stage.querySelector('#kgEylem').innerHTML = `<button class="btn btn-yellow" id="kgSonra">${son ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
      const n = stage.querySelector('#kgSonra'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => (son ? ozet('hangi', puan, HANGI.length) : hangi(i + 1, puan)));
    }));
  }

  // ================= Özet =================
  function ozet(mod, puan, en) {
    const pct = puan / en, yildiz = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `
      <div class="g-result">
        <div class="g-stars" aria-label="${yildiz} yıldız">${[1, 2, 3].map(k => `<span class="${k <= yildiz ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${mod === 'ciz' ? 'Görünüm ustası!' : 'Yapı dedektifi!'}</h2>
        <div class="g-score"><b>${puan}</b><span>/ ${en}</span></div>
        <p class="g-time">${mod === 'ciz' ? 'İlk denemede doğru çizilen görünüm' : 'Doğru bulunan yapı'}</p>
        <p class="pg-rule">Önden: her sütunun <b>en yüksek</b> küpü · Üstten: küp olan her yer <b>bir kare</b> · Soldan/Sağdan: her sıranın <b>en yüksek</b> küpü · Soldan bakınca ön <b>sağda</b>, sağdan bakınca ön <b>solda</b> kalır</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="kgTekrar">↻ Baştan Başla</button>
          <button class="btn btn-mint" id="kgDiger">${mod === 'ciz' ? '🔍 Hangi Yapı?' : '✏️ Görünümleri Çiz'}</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#kgTekrar').addEventListener('click', giris);
    stage.querySelector('#kgDiger').addEventListener('click', () => (mod === 'ciz' ? hangi(0, 0) : ciz(0, 0)));
    if (yildiz >= 2) confetti();
  }

  giris();
})();
