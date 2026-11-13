/* Şerit Modeli Ustası: bir çokluğun kesir kadarını şerit modeliyle bulma (tek adımlı ve "kalanın kesri" problemleri) */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // Her adım bir şerit: bütün → payda kadar eş parça → bir parça → pay kadar boya → istenen kısım.
  // istenen: 'boyali' (boyanan kısım) | 'kalan' (boyanmayan kısım). İkinci şeridin bütünü ilk şeridin kalanıdır.
  const KALAN_IPUCU = 'İkinci kesir, <b>kalanın</b> kesridir. İlk şeritte boyanmayan kısım kaç ediyordu?';
  const PROBLEMS = [
    { text: '48 sayfalık bir kitabın {3/4}’ünü okuyan Elif kaç sayfa okumuştur?',
      steps: [{ title: 'Kitabın tamamı', whole: 48, num: 3, den: 4, want: 'boyali', ask: 'Elif kaç sayfa okumuş?' }] },
    { text: 'Bir okuldaki 120 öğrencinin {2/5}’i gözlüklüdür. Gözlüklü kaç öğrenci vardır?',
      steps: [{ title: 'Öğrencilerin tamamı', whole: 120, num: 2, den: 5, want: 'boyali', ask: 'Kaç öğrenci gözlüklü?' }] },
    { text: 'Ayşe 150 TL harçlığının {2/5}’ini harcadı. Geriye kaç TL kaldı?',
      steps: [{ title: 'Harçlığın tamamı', whole: 150, num: 2, den: 5, want: 'kalan', ask: 'Geriye kaç TL kaldı?' }] },
    { text: 'Her katında 3 daire bulunan 12 katlı bir binadaki dairelerin {3/4}’ünde ışık yanıyor. Kaç dairede ışık yanıyor?',
      steps: [{ title: 'Binadaki dairelerin tamamı', whole: 36, wholeHint: 'Önce binadaki daire sayısını bulun: <b>12 kat × 3 daire</b>.', num: 3, den: 4, want: 'boyali', ask: 'Kaç dairede ışık yanıyor?' }] },
    { text: '72 soruluk bir testte soruların {1/8}’i boş bırakılmış, kalan soruların {5/7}’si doğru cevaplanmıştır. Kaç soru doğru cevaplanmıştır?',
      steps: [
        { title: 'Testin tamamı', whole: 72, num: 1, den: 8, want: 'kalan', ask: 'Kaç soru cevaplanmış (boş olmayan)?' },
        { title: 'Cevaplanan sorular', whole: 63, wholeHint: KALAN_IPUCU, num: 5, den: 7, want: 'boyali', ask: 'Kaç soru doğru cevaplanmış?' },
      ] },
    { text: 'Bir çiftlikteki 96 hayvanın {3/8}’i koyundur. Kalan hayvanların {2/3}’ü inektir. Çiftlikte kaç inek vardır?',
      steps: [
        { title: 'Hayvanların tamamı', whole: 96, num: 3, den: 8, want: 'kalan', ask: 'Koyun olmayan kaç hayvan var?' },
        { title: 'Koyun olmayan hayvanlar', whole: 60, wholeHint: KALAN_IPUCU, num: 2, den: 3, want: 'boyali', ask: 'Kaç inek var?' },
      ] },
    { text: '84 cevizin {3/7}’si Ali’ye verildi. Kalan cevizlerin {1/4}’ü Can’a verildi. Can’a kaç ceviz verildi?',
      steps: [
        { title: 'Cevizlerin tamamı', whole: 84, num: 3, den: 7, want: 'kalan', ask: 'Ali’den sonra kaç ceviz kaldı?' },
        { title: 'Kalan cevizler', whole: 48, wholeHint: KALAN_IPUCU, num: 1, den: 4, want: 'boyali', ask: 'Can’a kaç ceviz verildi?' },
      ] },
    { text: '360 sayısının {4/9}’u A, 280 sayısının {3/7}’si B olsun. A + B kaçtır?',
      steps: [
        { title: '360 sayısı', whole: 360, num: 4, den: 9, want: 'boyali', ask: 'A kaçtır?' },
        { title: '280 sayısı', whole: 280, num: 3, den: 7, want: 'boyali', ask: 'B kaçtır?' },
      ],
      final: { ask: 'A + B kaçtır?', answer: 280, hint: 'İki şeritte bulduğunuz <b>A</b> ve <b>B</b> değerlerini toplayın.' } },
  ];

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">💡</span>
    <p><b class="k1">Şerit modeli:</b> <mark>Payda</mark> şeridi kaç <b class="k2">eş parçaya</b> böleceğini, <mark>pay</mark> kaç parçayı <b class="k3">boyayacağını</b> söyler. Önce böl, sonra çarp!</p>
  </div>`;
  const PIECES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
  const calc = s => { const part = s.whole / s.den, painted = part * s.num; return { part, painted, result: s.want === 'boyali' ? painted : s.whole - painted }; };

  function stripHTML(s, { whole = true, cut = true, label = true, paint = [], live = false } = {}) {
    const n = cut ? s.den : 1, c = calc(s);
    const parts = Array.from({ length: n }, (_, i) =>
      `<button class="sm-part${paint[i] ? ' on' : ''}" data-i="${i}" ${live ? `aria-pressed="${!!paint[i]}"` : 'disabled'} aria-label="${i + 1}. parça">${label && cut ? c.part : ''}</button>`).join('');
    return `<div class="sm-strip">
      <div class="sm-whole"><span>${whole ? s.whole : '?'}</span></div>
      <div class="sm-bar${live ? ' live' : ''}">${parts}</div>
    </div>`;
  }

  let list = [], idx = 0, stars = 0;

  function intro() {
    stage.innerHTML = `${NOTE}
      <div class="g-intro">
        <div class="big-ic" aria-hidden="true">🍫</div>
        <p>Her problemde şeridi adım adım kur: <b>bütünü</b> yaz, <b>eş parçalara</b> böl, <b>bir parçayı</b> bul ve <b>pay kadar</b> boya. Hatasız çözüme 3 yıldız!</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" data-m="all">Tüm Problemler</button>
          <button class="btn btn-mint" data-m="one">Tek Adımlı</button>
          <button class="btn btn-lilac" data-m="two">İki Adımlı</button>
        </div>
      </div>`;
    stage.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
      const m = b.dataset.m;
      list = PROBLEMS.filter(p => m === 'all' || (m === 'one' ? p.steps.length === 1 : p.steps.length > 1));
      idx = 0; stars = 0; problem();
    }));
  }

  function problem() {
    const P = list[idx];
    let si = 0, phase = 'whole', paint = [], mistakes = 0;
    const done = [];
    stage.innerHTML = `${NOTE}
      ${progressBar(idx, list.length)}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Problem</span>${mathFmt(P.text)}</p>
      <div id="smDone"></div>
      <div id="smCur"></div>
      <div id="smAsk"></div>
      <p class="pg-fb" id="smFb" aria-live="polite"></p>
      <div class="aci-actions" id="smActions"></div>`;
    const $ = id => stage.querySelector(id);
    const fb = (html, ok) => { const f = $('#smFb'); f.className = 'pg-fb ' + (ok ? 'ok' : 'no'); f.innerHTML = html; };
    const miss = html => { mistakes++; fb('✗ ' + html, false); };

    function render() {
      const S = P.steps[si];
      $('#smDone').innerHTML = done.map((d, k) => `<div class="sm-card done">
        <div class="sm-title">${k + 1}. şerit: ${d.s.title}</div>
        ${stripHTML(d.s, { paint: d.paint })}
        <p class="sm-res">${d.s.ask} <b>${calc(d.s).result}</b></p></div>`).join('');
      if (phase === 'final') { $('#smCur').innerHTML = ''; }
      else {
        $('#smCur').innerHTML = `<div class="sm-card">
          <div class="sm-title">${si + 1}. şerit: ${S.title}</div>
          ${stripHTML(S, { whole: phase !== 'whole', cut: !['whole', 'cut'].includes(phase), label: ['paint', 'answer'].includes(phase), paint, live: phase === 'paint' })}
        </div>`;
      }
      const Q = { whole: 'Şerit neyi gösteriyor? <b>Bütün</b> kaç?', cut: 'Şeridi kaç <b>eş parçaya</b> bölelim?', part: '<b>Bir parça</b> kaç eder?',
        paint: 'Kesrin <b>payı</b> kadar parçayı boya. Parçalara dokun!', answer: S ? S.ask : '', final: P.final ? P.final.ask : '' }[phase];
      let ctl;
      if (phase === 'cut') ctl = `<div class="sm-nums">${PIECES.map(n => `<button class="sm-n" data-n="${n}">${n}</button>`).join('')}</div>`;
      else if (phase === 'paint') ctl = '<div class="aci-actions"><button class="btn btn-yellow" id="smPaint">Kontrol Et</button></div>';
      else ctl = `<div class="ea-try"><input type="number" id="smIn" inputmode="numeric" placeholder="?" aria-label="Cevap"><button class="btn btn-yellow" id="smGo">Kontrol Et</button></div>`;
      $('#smAsk').innerHTML = `<p class="pg-q">❓ ${Q}</p>${ctl}`;

      if (phase === 'cut') stage.querySelectorAll('.sm-n').forEach(b => b.addEventListener('click', () => {
        if (+b.dataset.n === S.den) { paint = Array(S.den).fill(false); go('part'); }
        else { b.classList.add('wrong'); miss('Kesrin <b>paydası</b>, şeridin kaç eş parçaya bölüneceğini gösterir.'); }
      }));
      if (phase === 'paint') {
        stage.querySelectorAll('.sm-bar.live .sm-part').forEach(b => b.addEventListener('click', () => {
          const i = +b.dataset.i; paint[i] = !paint[i];
          b.classList.toggle('on', paint[i]); b.setAttribute('aria-pressed', paint[i]); $('#smFb').textContent = '';
        }));
        $('#smPaint').addEventListener('click', () => {
          const k = paint.filter(Boolean).length;
          k === S.num ? go('answer') : miss(`Kesrin payı <b>${S.num}</b>. Şeritte ${S.num} parça boya (şu an ${k} parça boyalı).`);
        });
      }
      const inp = $('#smIn');
      if (inp) {
        inp.focus({ preventScroll: true });
        const check = () => checkNumber(inp.value);
        $('#smGo').addEventListener('click', check);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      }
    }

    function go(next) { phase = next; $('#smFb').textContent = ''; render(); }

    function checkNumber(raw) {
      const v = Number(String(raw).replace(',', '.'));
      if (String(raw).trim() === '' || Number.isNaN(v)) return fb('Bir sayı yaz.', false);
      if (phase === 'final') return v === P.final.answer ? finish() : miss(P.final.hint);
      const S = P.steps[si], c = calc(S);
      if (phase === 'whole') v === S.whole ? go('cut') : miss(S.wholeHint || 'Kesir hangi çokluğun kesri? <b>Bütünü</b> problemde bul.');
      else if (phase === 'part') v === c.part ? go('paint') : miss(`<b>${S.whole} ÷ ${S.den}</b> işlemini yap.`);
      else if (phase === 'answer') {
        if (v === c.result) return stepDone();
        miss(S.want === 'boyali'
          ? `Boyalı <b>${S.num}</b> parça var ve her biri <b>${c.part}</b>.`
          : `Soruda <b>boyanmayan</b> kısım isteniyor: ${S.den - S.num} parça, her biri <b>${c.part}</b>.`);
      }
    }

    function stepDone() {
      done.push({ s: P.steps[si], paint });
      paint = [];
      if (si + 1 < P.steps.length) { si++; go('whole'); }
      else if (P.final) go('final');
      else finish();
    }

    function finish() {
      const got = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      stars += got;
      phase = 'end';
      $('#smCur').innerHTML = ''; $('#smAsk').innerHTML = '';
      $('#smDone').innerHTML = done.map((d, k) => `<div class="sm-card done">
        <div class="sm-title">${k + 1}. şerit: ${d.s.title}</div>
        ${stripHTML(d.s, { paint: d.paint })}
        <p class="sm-res">${d.s.ask} <b>${calc(d.s).result}</b></p></div>`).join('');
      fb(`✓ Doğru! <span class="sm-stars">${'★'.repeat(got)}${'☆'.repeat(3 - got)}</span>`, true);
      const last = idx + 1 >= list.length;
      $('#smActions').innerHTML = `<button class="btn btn-yellow" id="smNext">${last ? 'Bitir 🏁' : 'Sonraki Problem →'}</button>`;
      const n = $('#smNext'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => { idx++; last ? summary() : problem(); });
    }

    render();
  }

  function summary() {
    const max = list.length * 3, pct = stars / max, s = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${s} yıldız">${[1, 2, 3].map(k => `<span class="${k <= s ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Şerit modeli ustası!</h2>
        <div class="g-score"><b>${stars}</b><span>/ ${max}</span></div>
        <p class="g-time">Toplanan yıldız</p>
        <p class="pg-rule">1) Bütünü yaz · 2) <b>Paydaya</b> göre eş parçalara böl · 3) Bir parça = bütün ÷ payda · 4) <b>Pay</b> kadar boya · 5) “Kalanın” kesri için yeni şerit kur</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="smAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#smAgain').addEventListener('click', intro);
    if (s >= 2) confetti();
  }

  intro();
})();
