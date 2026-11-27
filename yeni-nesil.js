/* Yeni Nesil Problemler ortak motoru: soru kartı, adım adım çözüm, 💬 yol gösterici baloncuklar, ilerleme ve sonuç.
   cfg: { key, kaynak, sorular:[{baslik, metin, sonra?, kok, siklar:[metin] | siklarHtml:[html], cevap, adimlar:[{b,s,tip:'secim'|'sayi',o?,d?,c?,i,a}], sonAdim?, sonIpucu?, cozum}],
          ciz: {1: () => html, ...}, unvan, kural } */
function yeniNesil(cfg) {
  initPage();
  const stage = document.getElementById('stage');
  const SORULAR = cfg.sorular;
  let D = { bitti: {}, hatasiz: {} };
  try { D = Object.assign(D, JSON.parse(localStorage.getItem(cfg.key) || '{}')); } catch (e) {}
  const kaydet = () => { try { localStorage.setItem(cfg.key, JSON.stringify(D)); } catch (e) {} };
  let aktif = 0;
  const harf = j => 'ABCD'[j];

  function secici() {
    return `<div class="yn-secici" role="group" aria-label="Soru seç">${SORULAR.map((S, i) => `<button class="yn-no${i === aktif ? ' aktif' : ''}${D.bitti[i] ? ' bitti' : ''}" data-q="${i}" aria-label="${i + 1}. soru${D.bitti[i] ? ', tamamlandı' : ''}">${D.bitti[i] ? '✓' : i + 1}</button>`).join('')}<button class="kz-mini yn-ozet-btn" id="ynOzet">🏁 Sonuçlar</button></div>`;
  }
  const balon = (i, metin) => `<button class="yn-balon-btn" aria-expanded="false" aria-controls="ynB${i}" title="Yol gösterici">💬</button><div class="yn-balon" id="ynB${i}" hidden><b>💡 Yol gösterici</b><p>${metin}</p></div>`;
  const sayiOku = s => Number(s.trim().replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));

  function soruCiz() {
    const S = SORULAR[aktif];
    const sikHtml = S.siklarHtml || S.siklar;
    const adimlar = S.adimlar.concat([{ b: 'Cevabı seç', s: S.sonAdim || S.kok, tip: 'secim', o: sikHtml.map((x, j) => S.siklarHtml ? `<span class="yn-sik-g"><b>${harf(j)})</b>${x}</span>` : `${harf(j)}) ${x}`), d: S.cevap, i: S.sonIpucu || 'Önceki adımlarda bulduklarını kullan. Soruda istenen tam olarak ne? Bir daha oku.', a: S.cozum, son: true, grafik: !!S.siklarHtml }]);
    let hata = 0;
    stage.innerHTML = `${secici()}
      <article class="yn-soru">
        <div class="yn-soru-bas"><span class="fy-qno">${aktif + 1}. Soru · ${S.baslik}</span></div>
        <p>${S.metin}</p>
        ${cfg.ciz[aktif + 1] ? `<div class="to-gorsel">${cfg.ciz[aktif + 1]()}</div>` : ''}
        ${S.sonra ? `<p>${S.sonra}</p>` : ''}
        <p class="yn-kok"><b>${S.kok}</b></p>
        ${S.siklarHtml ? `<div class="yn-siklar-g">${S.siklarHtml.map((x, j) => `<div><b>${harf(j)})</b>${x}</div>`).join('')}</div>` : `<div class="yn-siklar">${S.siklar.map((x, j) => `<span>${harf(j)}) ${x}</span>`).join('')}</div>`}
        <p class="yn-kaynak">${cfg.kaynak}</p>
      </article>
      <h2 class="yn-cozbas">🧭 Adım adım çöz</h2>
      <ol class="yn-adimlar">${adimlar.map((A, i) => `<li class="yn-adim${i ? ' kilitli' : ''}" data-i="${i}">
          <div class="yn-adim-ic">
            <div class="yn-adim-bas"><span class="yn-adim-no">${i + 1}</span><b>${A.b}</b></div>
            <p class="yn-adim-s">${A.s}</p>
            <div class="yn-cevap">${A.tip === 'secim' ? `<div class="yn-opts${A.grafik ? ' grafik' : ''}">${A.o.map((o, j) => `<button class="yn-opt" data-j="${j}">${o}</button>`).join('')}</div>`
              : `<form class="to-giris yn-giris" autocomplete="off"><input inputmode="decimal" aria-label="Cevap">${A.birim ? `<span>${A.birim}</span>` : ''}<button class="btn btn-yellow">✓</button></form>`}</div>
            <p class="pg-fb yn-fb" aria-live="polite"></p>
          </div>
          <div class="yn-yan">${balon(i, A.i)}</div>
        </li>`).join('')}</ol>
      <div class="aci-actions" id="ynSon"></div>`;
    stage.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { aktif = +b.dataset.q; soruCiz(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    stage.querySelector('#ynOzet').addEventListener('click', ozet);
    stage.querySelectorAll('.yn-balon-btn').forEach(b => b.addEventListener('click', () => { const p = b.nextElementSibling; p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); b.classList.toggle('acik', !p.hidden); }));

    const ac = i => {
      const li = stage.querySelector(`.yn-adim[data-i="${i}"]`); if (!li) return;
      li.classList.remove('kilitli');
      const inp = li.querySelector('input'); if (inp) setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 60);
      if (i) li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    const dogru = (li, A) => {
      li.classList.add('tamam');
      const fb = li.querySelector('.yn-fb'); fb.className = 'pg-fb yn-fb ok'; fb.innerHTML = `✓ Doğru! ${A.a}`;
      li.querySelectorAll('button.yn-opt, input, form button').forEach(x => { x.disabled = true; });
      if (A.son) bitir(); else ac(+li.dataset.i + 1);
    };
    const yanlis = (li, ek) => {
      hata++;
      const fb = li.querySelector('.yn-fb'); fb.className = 'pg-fb yn-fb no';
      fb.innerHTML = `✗ Henüz değil. ${ek || ''} Takıldıysan sağdaki <b>💬</b> baloncuğa dokun.`;
      const b = li.querySelector('.yn-balon-btn'); b.classList.add('dikkat'); setTimeout(() => b.classList.remove('dikkat'), 1200);
    };
    adimlar.forEach((A, i) => {
      const li = stage.querySelector(`.yn-adim[data-i="${i}"]`);
      if (A.tip === 'secim') li.querySelectorAll('.yn-opt').forEach(b => b.addEventListener('click', () => {
        if (li.classList.contains('kilitli') || li.classList.contains('tamam')) return;
        if (+b.dataset.j === A.d) { b.classList.add('right'); dogru(li, A); } else { b.classList.add('wrong'); b.disabled = true; yanlis(li); }
      }));
      else li.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        if (li.classList.contains('kilitli') || li.classList.contains('tamam')) return;
        const inp = li.querySelector('input'), v = sayiOku(inp.value);
        if (!inp.value.trim() || Number.isNaN(v)) return;
        if (Math.abs(v - A.c) < 1e-9) dogru(li, A); else { inp.classList.add('bad'); setTimeout(() => inp.classList.remove('bad'), 600); yanlis(li, `${inp.value} değil.`); }
      });
    });
    function bitir() {
      D.bitti[aktif] = true; if (!hata) D.hatasiz[aktif] = true; kaydet();
      const son = SORULAR.findIndex((_, k) => !D.bitti[k]);
      stage.querySelector('#ynSon').innerHTML = `<p class="yn-tebrik">${hata ? '🎉 Soruyu çözdün!' : '🌟 Hiç yanlış yapmadan çözdün!'}</p>${son >= 0 ? `<button class="btn btn-yellow" id="ynIleri">Sonraki soru →</button>` : `<button class="btn btn-yellow" id="ynBitir">🏁 Sonuçları gör</button>`}`;
      stage.querySelectorAll('.yn-no').forEach(b => { const k = +b.dataset.q; if (D.bitti[k]) { b.classList.add('bitti'); b.textContent = '✓'; } });
      const ile = stage.querySelector('#ynIleri'); if (ile) ile.addEventListener('click', () => { aktif = son; soruCiz(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      const bt = stage.querySelector('#ynBitir'); if (bt) bt.addEventListener('click', ozet);
    }
  }

  function ozet() {
    const n = SORULAR.length, cozulen = Object.keys(D.bitti).length, hatasiz = Object.keys(D.hatasiz).length;
    const yildiz = hatasiz >= n - 1 ? 3 : cozulen >= n ? 2 : cozulen ? 1 : 0;
    stage.innerHTML = `${secici()}
      <div class="g-result">
        <div class="g-stars" aria-label="${yildiz} yıldız">${[1, 2, 3].map(k => `<span class="${k <= yildiz ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${cozulen >= n ? (cfg.unvan || 'Yeni nesil problem avcısı!') : 'Harika gidiyorsun!'}</h2>
        <div class="g-score"><b>${hatasiz}</b><span>/ ${n}</span></div>
        <p class="g-time">Hiç yanlış yapmadan çözülen soru · Çözülen: ${cozulen} / ${n}</p>
        ${cfg.kural ? `<p class="pg-rule">${cfg.kural}</p>` : ''}
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="ynYeniden">↻ Baştan çöz</button>
          <a class="btn btn-lilac" href="oyun-adasi.html?ada=yeninesil">🏝️ Yeni Nesil Adası</a>
        </div>
      </div>`;
    stage.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { aktif = +b.dataset.q; soruCiz(); }));
    stage.querySelector('#ynOzet').addEventListener('click', ozet);
    stage.querySelector('#ynYeniden').addEventListener('click', () => { D = { bitti: {}, hatasiz: {} }; kaydet(); aktif = 0; soruCiz(); });
    if (yildiz >= 2) confetti();
  }

  aktif = Math.max(0, SORULAR.findIndex((_, k) => !D.bitti[k]));
  soruCiz();
}
