/* Dudak Payı: bütüne bir dilim kalan kesirleri (5/6, 10/11, 100/101 …) çay bardağı modeliyle karşılaştırma ve sıralama.
   Bütün = dikdörtgen çay bardağı, payda kadar eş dilime bölünür; çay pay kadar dilimi doldurur, en üstteki tek dilim
   (dudak payı) hep boştur. Dudak payı ne kadar küçükse bardak o kadar dolu, kesir o kadar büyüktür. */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // kars: iki kesri karşılaştır (önce dudak payları, sonra kesirler) · sira: bardakları küçükten büyüğe sırala
  const ORNEKLER = [
    { tip: 'kars', a: 6, b: 11 },
    { tip: 'kars', a: 8, b: 4 },
    { tip: 'kars', a: 3, b: 10 },
    { tip: 'kars', a: 13, b: 9 },
    { tip: 'kars', a: 16, b: 20 },
    { tip: 'kars', a: 101, b: 100 },
    { tip: 'sira', l: [5, 3, 7] },
    { tip: 'sira', l: [101, 10, 1001, 25] },
  ];
  // Kesirler hep (d-1)/d biçiminde: yalnızca paydayı (dilim sayısını) tutmak yeterli
  const fr = d => `{${d - 1}/${d}}`;
  const bir = d => `{1/${d}}`;
  const M = mathFmt;
  const AD = ['A', 'B', 'C', 'D'];

  const NOT = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">🍵</span>
    <p>Çay bardağı <b class="k1">bütün</b>. Çay hep doldurulur ama en üstte <mark>bir dilim</mark> boş kalır: <b class="k3">dudak payı</b>. <b class="k2">Dudak payı küçüldükçe</b> bardak daha dolu, kesir daha büyük olur!</p>
  </div>`;

  // Bardak çizimi: payda kadar dilim (çok dilimde çizgiler gösterilmez), çay alttan yükselir.
  function bardak(d, { harf, secilebilir = false, sira = null } = {}) {
    const cok = d > 24;
    const bosY = Math.max(100 / d, cok ? 1.6 : 0);
    const dilimler = cok ? '' : Array.from({ length: d - 1 }, () => '<i></i>').join('');
    return `<button class="cb-kup${secilebilir ? ' sec' : ''}${sira ? ' sirali' : ''}" data-d="${d}" ${secilebilir && !sira ? '' : 'disabled'} aria-label="${harf} bardağı: ${d - 1} bölü ${d}">
      ${sira ? `<span class="cb-sira">${sira}</span>` : ''}
      <span class="cb-bardak${cok ? ' cok' : ''}" style="--d:${d}">
        <span class="cb-bos" style="height:${bosY}%"></span>
        <span class="cb-cay">${dilimler}</span>
        <span class="cb-buhar" aria-hidden="true"><i></i><i></i><i></i></span>
        ${cok ? `<span class="cb-lupe" aria-hidden="true"><span style="height:${Math.max(1, 600 / d)}px"></span></span>` : ""}
      </span>
      <span class="cb-tabak" aria-hidden="true"></span>
      <span class="cb-kesir"><em>${harf}</em>${M(fr(d))}</span>
      <span class="cb-dp">Dudak payı ${M(bir(d))}${cok ? '<small>çok ince!</small>' : ''}</span>
    </button>`;
  }

  let idx = 0, puan = 0;

  function giris() {
    stage.innerHTML = `${NOT}
      <div class="g-intro">
        <div class="cb-giris">${bardak(6, { harf: 'A' })}${bardak(11, { harf: 'B' })}</div>
        <p>Hangi bardakta daha çok çay var? <b>Boş kalan dilime</b> bak! 6 karşılaştırma ve 2 sıralama: toplam <b>8 örnek</b>. İlk denemede doğru çözdüğün her örnek 1 puan.</p>
        <div class="btns g-result-btns"><button class="btn btn-yellow" id="cbBasla">Başla</button></div>
      </div>`;
    stage.querySelector('#cbBasla').addEventListener('click', () => { idx = 0; puan = 0; ornek(); });
  }

  function iskelet(baslik, bardaklar) {
    stage.innerHTML = `${progressBar(idx, ORNEKLER.length)}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Örnek</span>${baslik}</p>
      <div class="cb-masa" id="cbMasa">${bardaklar}</div>
      <div id="cbSoru"></div>
      <p class="pg-fb" id="cbFb" aria-live="polite"></p>
      <div class="aci-actions" id="cbIleri"></div>`;
  }
  const $ = s => stage.querySelector(s);
  const fb = (html, ok) => { const f = $('#cbFb'); f.className = 'pg-fb ' + (ok ? 'ok' : 'no'); f.innerHTML = html; };

  function ileri(hatasiz) {
    if (hatasiz) puan++;
    $('#cbIleri').innerHTML = `<button class="btn btn-yellow" id="cbSonraki">${idx + 1 < ORNEKLER.length ? 'Sonraki örnek →' : 'Sonucu gör'}</button>`;
    $('#cbSonraki').addEventListener('click', () => { idx++; idx < ORNEKLER.length ? ornek() : sonuc(); });
    $('#cbSonraki').focus({ preventScroll: true });
  }

  // Seçenek düğmeleri: yanlışta yalnızca o seçenek kapanır, doğruda hepsi kapanır
  function secenekler(soru, liste, dogru, { yanlis, dogruOlunca }) {
    $('#cbSoru').innerHTML = `<p class="cb-soru">${soru}</p>
      <div class="g-options pg-opts cb-opts">${liste.map((s, i) => `<button class="g-opt c${i % 4}" data-i="${i}">${s}</button>`).join('')}</div>`;
    $('#cbSoru').querySelectorAll('.g-opt').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      if (i === dogru) {
        b.classList.add('right');
        $('#cbSoru').querySelectorAll('.g-opt').forEach(x => (x.disabled = true));
        dogruOlunca();
      } else {
        b.classList.add('wrong'); b.disabled = true;
        yanlis(i);
      }
    }));
  }

  function ornek() {
    const O = ORNEKLER[idx];
    O.tip === 'kars' ? karsilastir(O) : sirala(O);
  }

  function karsilastir({ a, b }) {
    iskelet(`${M(fr(a))} ile ${M(fr(b))} kesirlerini karşılaştıralım. İki bardak da aynı büyüklükte (bütünler eş).`,
      bardak(a, { harf: 'A' }) + bardak(b, { harf: 'B' }));
    let hatasiz = true;
    const kucukDP = a > b ? 0 : 1; // payda büyük olanın dudak payı küçük
    secenekler('<b>1. adım:</b> Hangi bardağın dudak payı (boş kalan dilimi) daha küçük?',
      [`A: ${M(bir(a))}`, `B: ${M(bir(b))}`], kucukDP, {
        yanlis: () => { hatasiz = false; fb(`✗ Bütün ${Math.max(a, b)} dilime bölününce dilimler, ${Math.min(a, b)} dilime bölünmeye göre daha <b>ince</b> olur. Hangi bardakta daha çok dilim var?`, false); },
        dogruOlunca: () => {
          fb(`✓ Evet! ${M(bir(Math.max(a, b)))} &lt; ${M(bir(Math.min(a, b)))}. Daha çok dilime bölünen bardağın boş dilimi daha ince.`, true);
          setTimeout(() => adim2(), 900);
        },
      });
    function adim2() {
      const dogru = a < b ? 0 : 1;
      secenekler('<b>2. adım:</b> Öyleyse hangi bardak daha dolu? Doğru sembolü seç.',
        [`${M(fr(a))} &lt; ${M(fr(b))}`, `${M(fr(a))} &gt; ${M(fr(b))}`, `${M(fr(a))} = ${M(fr(b))}`], dogru, {
          yanlis: i => {
            hatasiz = false;
            fb(i === 2
              ? '✗ Bardaklar eş ama boş dilimler eş değil. Boşu az olan bardakta çay daha çok!'
              : '✗ Dudak payı <b>küçük</b> olan bardakta çay <b>daha çok</b>. 1. adımda hangisini bulmuştun?', false);
          },
          dogruOlunca: () => {
            const [k, bu] = a < b ? [a, b] : [b, a];
            fb(`✓ ${M(fr(k))} &lt; ${M(fr(bu))} · Çünkü boş kısım ${M(bir(bu))}, ${M(bir(k))}’den küçük. <b>Bütüne bir dilim kalan kesirlerde payda büyüdükçe kesir büyür.</b>`, true);
            const kups = stage.querySelectorAll('.cb-kup');
            kups[a > b ? 0 : 1].classList.add('kazanan');
            ileri(hatasiz);
          },
        });
    }
  }

  function sirala({ l }) {
    const hedef = l.slice().sort((x, y) => x - y); // payda küçükten büyüğe = kesir küçükten büyüğe
    const secilen = [];
    let hatasiz = true;
    const ciz = () => {
      $('#cbMasa').innerHTML = l.map((d, i) => bardak(d, { harf: AD[i], secilebilir: true, sira: secilen.includes(d) ? secilen.indexOf(d) + 1 : null })).join('');
      $('#cbMasa').querySelectorAll('.cb-kup.sec:not(:disabled)').forEach(k => k.addEventListener('click', () => sec(+k.dataset.d)));
    };
    iskelet(`Bardakları <b>en az dolu olandan en dolu olana</b> doğru sırala: kesirleri <b>küçükten büyüğe</b> sıralamış olacaksın. Bardaklara sırayla dokun.`, '');
    $('#cbMasa').classList.add('n' + l.length);
    $('#cbSoru').innerHTML = `<p class="cb-soru cb-dizi" id="cbDizi">${hedef.map(() => '<span class="cb-yer">?</span>').join('<b>&lt;</b>')}</p>`;
    ciz();
    function sec(d) {
      const beklenen = hedef[secilen.length];
      if (d !== beklenen) {
        hatasiz = false;
        fb(`✗ Bu bardağın dudak payı ${M(bir(d))}. Kalan bardaklar içinde dudak payı <b>daha büyük</b> (daha boş) olan var. En boş bardak önce gelir!`, false);
        const k = $(`.cb-kup[data-d="${d}"]`); k.classList.add('titre'); setTimeout(() => k.classList.remove('titre'), 450);
        return;
      }
      secilen.push(d);
      $("#cbMasa").classList.add("durgun");
      ciz();
      $('#cbDizi').innerHTML = hedef.map((x, i) => i < secilen.length ? `<span class="cb-yer dolu">${M(fr(x))}</span>` : '<span class="cb-yer">?</span>').join('<b>&lt;</b>');
      if (secilen.length < hedef.length) { fb(`✓ Doğru! Sıradaki: kalanlar içinde en çok boşluğu olan.`, true); return; }
      fb(`✓ Harika! Payda büyüdükçe dudak payı küçülüyor, bardak doluyor: ${hedef.map(x => M(fr(x))).join(' &lt; ')}`, true);
      ileri(hatasiz);
    }
  }

  function sonuc() {
    const n = ORNEKLER.length, s = puan >= 7 ? 3 : puan >= 5 ? 2 : puan > 0 ? 1 : 0;
    stage.innerHTML = `${NOT}
      <div class="g-result">
        <div class="g-stars" aria-label="${s} yıldız">${[1, 2, 3].map(k => `<span class="${k <= s ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Çay ustası!</h2>
        <div class="g-score"><b>${puan}</b><span>/ ${n}</span></div>
        <p class="g-time">İlk denemede doğru çözülen örnek</p>
        <p class="pg-rule">Bütüne bir dilim kalan kesirlerde (${M('{5/6}')}, ${M('{10/11}')}, ${M('{100/101}')} …) <b>boş kalan dilimi</b> karşılaştır: dudak payı küçük olan kesir daha büyüktür. Yani <b>paydası büyük olan daha büyüktür.</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="cbTekrar">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#cbTekrar').addEventListener('click', () => { idx = 0; puan = 0; ornek(); });
    if (s >= 2) confetti();
  }

  giris();
})();
