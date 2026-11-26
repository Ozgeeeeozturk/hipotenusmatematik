/* Tema oyunları ortak motoru: sınıf seçimi, soru akışı, puan ve bitiş ekranı.
   Soru türleri:
   { tip:'secim', soru, gorsel?, secenekler:[html], dogru:i, aciklama }
   { tip:'sayi',  soru, gorsel?, cevap:Number, birim?, aciklama }
   { tip:'ozel',  soru, gorsel?, kur:(kutu, bitir) => {}, aciklama }   bitir(ok, ekHtml?) */
const R_ = {
  rnd: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  sec: arr => arr[Math.floor(Math.random() * arr.length)],
  kes: (p, q, c = '') => `<span class="f${c ? ' ' + c : ''}"><i>${p}</i><i>${q}</i></span>`,
  sayi: n => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100).replace('.', ',')).replace(/^-/, '−'),
  ebob: (a, b) => (b ? R_.ebob(b, a % b) : Math.abs(a)),
};

function temaOyunu(cfg) {
  initPage();
  const stage = document.getElementById('stage');
  const rozet = document.getElementById('toRozet');
  const q = new URLSearchParams(location.search);
  let g = +q.get('s');
  if (!cfg.siniflar.includes(g)) {
    let u = null; try { u = Auth.current(); } catch (e) {}
    g = u && cfg.siniflar.includes(+u.grade) ? +u.grade : cfg.siniflar[0];
  }
  let sorular = [], idx = 0, puan = 0;

  function basla() {
    sorular = cfg.uret(g); idx = 0; puan = 0;
    if (rozet) rozet.textContent = `${g}. Sınıf`;
    soru();
  }
  const sinifSec = () => cfg.siniflar.length < 2 ? '' :
    `<div class="to-sinif" role="group" aria-label="Sınıf seç">${cfg.siniflar.map(s => `<button class="chip" data-s="${s}" aria-pressed="${s === g}">${s}. Sınıf</button>`).join('')}</div>`;
  function bagla() {
    stage.querySelectorAll('.to-sinif [data-s]').forEach(b => b.addEventListener('click', () => {
      if (+b.dataset.s === g) return;
      g = +b.dataset.s;
      try { history.replaceState(null, '', `?s=${g}`); } catch (e) {}
      basla();
    }));
  }

  function soru() {
    const S = sorular[idx];
    stage.innerHTML = `${sinifSec()}${cfg.not ? cfg.not(g) : ''}${progressBar(idx, sorular.length)}
      <div class="pg-step qbox"><span class="fy-qno">${idx + 1}. Soru</span>${S.soru}</div>
      ${S.gorsel ? `<div class="to-gorsel">${S.gorsel}</div>` : ''}
      <div id="toCevap" class="to-cevap"></div>
      <p class="pg-fb" id="toFb" aria-live="polite"></p>
      <div class="aci-actions" id="toAct"></div>`;
    bagla();
    const kutu = stage.querySelector('#toCevap');
    let bitti = false;
    const bitir = (ok, ek) => {
      if (bitti) return; bitti = true;
      if (ok) puan++;
      const fb = stage.querySelector('#toFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = `${ok ? '✓ Doğru!' : '✗ Olmadı.'} ${ek || ''} ${S.aciklama ? `<span class="to-aciklama">${S.aciklama}</span>` : ''}`;
      sonraki();
    };
    if (S.tip === 'secim') {
      kutu.innerHTML = `<div class="g-options to-opts">${S.secenekler.map((s, i) => `<button class="g-opt c${i % 4}" data-i="${i}"><b>${'ABCDE'[i]}</b><span>${s}</span></button>`).join('')}</div>`;
      kutu.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
        if (bitti) return;
        const i = +b.dataset.i, ok = i === S.dogru;
        kutu.querySelectorAll('[data-i]').forEach(x => { x.disabled = true; if (+x.dataset.i === S.dogru) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        bitir(ok, ok ? '' : `Doğru cevap <b>${'ABCDE'[S.dogru]}</b>.`);
      }));
    } else if (S.tip === 'sayi') {
      kutu.innerHTML = `<form class="to-giris" autocomplete="off"><input inputmode="decimal" aria-label="Cevabın" placeholder="?">${S.birim ? `<span>${S.birim}</span>` : ''}<button class="btn btn-yellow">✓ Kontrol Et</button></form>`;
      const inp = kutu.querySelector('input');
      setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 50);
      kutu.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        if (bitti) return;
        const v = Number(inp.value.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'));
        if (inp.value.trim() === '' || Number.isNaN(v)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); return; }
        const ok = Math.abs(v - S.cevap) < 1e-6;
        inp.disabled = true; kutu.querySelector('button').disabled = true;
        inp.classList.add(ok ? 'ok' : 'bad');
        bitir(ok, ok ? '' : `Doğru cevap <b>${R_.sayi(S.cevap)}${S.birim ? ' ' + S.birim : ''}</b>.`);
      });
    } else {
      S.kur(kutu, bitir);
    }
  }

  function sonraki() {
    const son = idx + 1 >= sorular.length;
    const a = stage.querySelector('#toAct');
    a.innerHTML = `<button class="btn btn-yellow" id="toNext">${son ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
    const b = a.querySelector('#toNext');
    try { b.focus({ preventScroll: true }); } catch (e) {}
    b.addEventListener('click', () => { idx++; son ? ozet() : soru(); });
  }

  function ozet() {
    const n = sorular.length, oran = puan / n;
    const yildiz = oran >= 0.9 ? 3 : oran >= 0.6 ? 2 : oran > 0 ? 1 : 0;
    stage.innerHTML = `${sinifSec()}
      <div class="g-result">
        <div class="g-stars" aria-label="${yildiz} yıldız">${[1, 2, 3].map(k => `<span class="${k <= yildiz ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${cfg.unvan || 'Tebrikler!'}</h2>
        <div class="g-score"><b>${puan}</b><span>/ ${n}</span></div>
        <p class="g-time">Doğru cevap</p>
        ${cfg.kural ? `<p class="pg-rule">${cfg.kural(g)}</p>` : ''}
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="toAgain">↻ Yeni Sorular</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    bagla();
    stage.querySelector('#toAgain').addEventListener('click', basla);
    if (yildiz >= 2) confetti();
  }

  basla();
}

// Bir soruyu, aynı türden rastgele üreticilerden karışık sırayla oluştur
function temaKaristir(ureticiler, adet) {
  const out = [];
  let havuz = [];
  while (out.length < adet) {
    if (!havuz.length) havuz = shuffle(ureticiler.slice());
    out.push(havuz.pop()());
  }
  return out;
}
// Yanlış seçenekleri doğrunun etrafından üret (tekrarsız)
function temaSecenek(dogru, yanlislar, fmt = x => x) {
  const set = []; for (const y of yanlislar) if (y !== dogru && !set.includes(y)) set.push(y);
  const ops = shuffle([dogru, ...shuffle(set).slice(0, 3)]);
  return { secenekler: ops.map(fmt), dogru: ops.indexOf(dogru) };
}
