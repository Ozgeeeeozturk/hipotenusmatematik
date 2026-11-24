/* Basamak Değeri ve Çözümleme (5. sınıf, MAT.5.1.1)
   Üç bölüm: 📋 Basamak Tablosu · 🧩 Çözümleme · ⚡ Basamak Avı (süreli oyun)
   Sayfa adresine ?mod=tablo | cozumle | av eklenirse doğrudan o bölüm açılır. */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  const ADLAR = ['Birler', 'Onlar', 'Yüzler', 'Binler', 'On binler', 'Yüz binler', 'Milyonlar', 'On milyonlar', 'Yüz milyonlar', 'Milyarlar'];
  const RENK = ['#F5B921', '#8E5BD6', '#3B8BEB', '#2FA36B', '#2D2440', '#2BB3C6', '#E8338A', '#F2862E', '#E8334A', '#5B5FC7'];

  // Ders kitabındaki gibi: 4 basamaklıya kadar boşluksuz (7000), 5 ve daha fazlasında üçlü gruplar (40 000)
  const fmt = s => (String(s).length <= 4 ? String(s) : String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  const norm = v => String(v).replace(/[\s. ]/g, '').replace(/^0+(?=\d)/, '');
  const deger = (d, k) => (d === '0' ? '0' : d + '0'.repeat(k));           // basamak değeri (metin)
  const rakamlar = n => [...String(n)].reverse();                            // [birler, onlar, ...]
  const rasgele = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // Renkli rakam topları; k = basamak sırası (0 = birler)
  function toplar(n, { etiket = false, vurgu = null, tikla = false } = {}) {
    const r = rakamlar(n);
    return `<div class="bd-toplar">${[...r].reverse().map((d, i) => {
      const k = r.length - 1 - i;
      return `<div class="bd-top-kutu${vurgu === k ? ' vurgu' : ''}" data-k="${k}">
        <${tikla ? 'button' : 'span'} class="bd-top" style="--c:${RENK[k]}" data-k="${k}" ${tikla ? `aria-label="${ADLAR[k]} basamağı: ${d}"` : ''}>${d}</${tikla ? 'button' : 'span'}>
        ${etiket ? `<small><b>${fmt('1' + '0'.repeat(k))}</b>${ADLAR[k]}</small>` : ''}
      </div>`;
    }).join('')}</div>`;
  }

  function sonrakiDugme(son, metin, git) {
    const e = stage.querySelector('#bdEylem');
    e.innerHTML = `<button class="btn btn-yellow" id="bdSonra">${son ? 'Bitir 🏁' : metin}</button>`;
    const n = e.querySelector('#bdSonra'); n.focus({ preventScroll: true });
    n.addEventListener('click', git);
  }

  // ================= Giriş =================
  function giris() {
    stage.innerHTML = `
      <div class="g-intro">
        <div class="big-ic" aria-hidden="true">🔢</div>
        <p>Rakamların <b>basamak adını</b>, <b>sayı değerini</b> ve <b>basamak değerini</b> bul; sayıları <b>çözümle</b>. Hazırsan süreli <b>Basamak Avı</b>'na katıl!</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" data-m="tablo">📋 Basamak Tablosu</button>
          <button class="btn btn-mint" data-m="cozumle">🧩 Çözümleme</button>
          <button class="btn btn-lilac" data-m="av">⚡ Basamak Avı</button>
        </div>
      </div>`;
    stage.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => ac(b.dataset.m)));
  }
  const ac = m => (m === 'tablo' ? tablo(0, 0, 0) : m === 'cozumle' ? cozumle(0, 0) : av());

  // ================= 📋 Basamak Tablosu =================
  // verilen: önceden dolu kutular [basamak sırası k, sütun ('ad' | 'sayi' | 'deger')]
  const TABLO = [
    { n: '5307418029', verilen: [[3, 'sayi'], [6, 'deger'], [8, 'ad']] },
    { n: '702003614', verilen: [[0, 'ad'], [4, 'sayi'], [8, 'deger']] },
    { n: '4005080', verilen: [[1, 'deger'], [6, 'ad']] },
    { n: '86190357', verilen: [[2, 'ad'], [5, 'deger'], [7, 'sayi']] },
  ];

  function tablo(i, puan, enCok) {
    const S = TABLO[i], r = rakamlar(S.n), verilen = new Set(S.verilen.map(([k, s]) => `${k}-${s}`));
    let ilk = true;
    const hucre = (k, s) => {
      const d = r[k], dogru = s === 'ad' ? ADLAR[k] : s === 'sayi' ? d : fmt(deger(d, k));
      if (verilen.has(`${k}-${s}`)) return `<td class="bd-verilen">${dogru}</td>`;
      if (s === 'ad') return `<td><select class="bd-giris" data-k="${k}" data-s="ad" aria-label="${k + 1}. satır basamak adı"><option value="">Seç…</option>${ADLAR.map(a => `<option>${a}</option>`).join('')}</select></td>`;
      return `<td><input class="bd-giris" data-k="${k}" data-s="${s}" inputmode="numeric" autocomplete="off" aria-label="${k + 1}. satır ${s === 'sayi' ? 'sayı değeri' : 'basamak değeri'}"></td>`;
    };
    stage.innerHTML = `
      ${progressBar(i, TABLO.length)}
      <p class="pg-step qbox"><span class="fy-qno">${i + 1}. Sayı</span>Aşağıdaki sayının her rakamı için <b>basamak adını</b>, <b>sayı değerini</b> ve <b>basamak değerini</b> yaz. Bir rakama dokununca satırı yanar.</p>
      <div class="bd-sayi-baslik">${toplar(S.n, { tikla: true })}<p class="bd-okunus">${fmt(S.n)}</p></div>
      <div class="bd-tablo-kap"><table class="bd-tablo">
        <thead><tr><th>Rakam</th><th class="ad">Basamak Adı</th><th class="sayi">Sayı Değeri</th><th class="deger">Basamak Değeri</th></tr></thead>
        <tbody>${r.map((d, k) => `<tr data-k="${k}"><td><span class="bd-top kucuk" style="--c:${RENK[k]}">${d}</span></td>${hucre(k, 'ad')}${hucre(k, 'sayi')}${hucre(k, 'deger')}</tr>`).join('')}</tbody>
      </table></div>
      <p class="pg-fb" id="bdFb" aria-live="polite"></p>
      <div class="aci-actions btns" id="bdEylem" style="justify-content:center;gap:10px">
        <button class="btn btn-yellow" id="bdKontrol">✔ Kontrol Et</button>
        <button class="btn btn-ghost-dark" id="bdGoster">💡 Cevabı Göster</button>
      </div>`;

    const satirSec = k => {
      stage.querySelectorAll('.bd-tablo tr[data-k]').forEach(tr => tr.classList.toggle('sec', +tr.dataset.k === k));
      stage.querySelectorAll('.bd-sayi-baslik .bd-top-kutu').forEach(b => b.classList.toggle('vurgu', +b.dataset.k === k));
    };
    stage.querySelectorAll('.bd-sayi-baslik .bd-top').forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k; satirSec(k);
      const tr = stage.querySelector(`.bd-tablo tr[data-k="${k}"]`);
      tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const ilkBos = tr.querySelector('.bd-giris'); if (ilkBos) ilkBos.focus({ preventScroll: true });
    }));
    stage.querySelectorAll('.bd-giris').forEach(g => {
      g.addEventListener('focus', () => satirSec(+g.dataset.k));
      g.addEventListener('input', () => g.classList.remove('ok', 'no'));
    });
    const girisler = [...stage.querySelectorAll('.bd-giris')];
    enCok += girisler.length;
    const dogruMu = g => {
      const k = +g.dataset.k, d = r[k];
      if (g.dataset.s === 'ad') return g.value === ADLAR[k];
      if (g.dataset.s === 'sayi') return norm(g.value) === d;
      return norm(g.value) === deger(d, k);
    };
    const fb = stage.querySelector('#bdFb');
    const son = i + 1 >= TABLO.length;
    const ileri = () => sonrakiDugme(son, 'Sonraki Sayı →', () => (son ? ozet('tablo', puan, enCok) : tablo(i + 1, puan, enCok)));

    stage.querySelector('#bdKontrol').addEventListener('click', () => {
      let dogru = 0;
      girisler.forEach(g => { const ok = dogruMu(g); g.classList.toggle('ok', ok); g.classList.toggle('no', !ok); if (ok) dogru++; });
      if (ilk) { puan += dogru; ilk = false; }
      const yanlis = girisler.length - dogru;
      if (!yanlis) {
        fb.className = 'pg-fb ok';
        fb.innerHTML = `✓ Hepsi doğru! <b>${fmt(S.n)}</b> sayısında ${r.length} basamak var. Sıfırın basamak değeri her zaman <b>0</b>'dır.`;
        girisler.forEach(g => (g.disabled = true));
        ileri();
      } else {
        fb.className = 'pg-fb no';
        fb.innerHTML = `✗ ${yanlis} kutu yanlış. İpucu: Basamak değeri = rakam × basamağın değeri (birler 1, onlar 10, yüzler 100…).`;
      }
    });
    stage.querySelector('#bdGoster').addEventListener('click', () => {
      ilk = false;
      girisler.forEach(g => {
        const k = +g.dataset.k, d = r[k];
        g.value = g.dataset.s === 'ad' ? ADLAR[k] : g.dataset.s === 'sayi' ? d : fmt(deger(d, k));
        g.classList.remove('no'); g.classList.add('ok'); g.disabled = true;
      });
      fb.className = 'pg-fb'; fb.innerHTML = '💡 Doğru cevaplar yazıldı. Rakamlara dokunup satırları karşılaştır.';
      ileri();
    });
  }

  // ================= 🧩 Çözümleme =================
  const COZ = [
    { t: 'sec', n: '4005080' },
    { t: 'yaz', n: '6003090' },
    { t: 'sec', n: '27050300' },
    { t: 'yaz', n: '908040' },
    { t: 'sec', n: '530700012' },
    { t: 'yaz', n: '1020304' },
  ];
  const terimler = n => rakamlar(n).map((d, k) => ({ d, k })).filter(x => x.d !== '0').reverse();
  const carpimYazi = n => terimler(n).map(x => `(${x.d} × ${fmt('1' + '0'.repeat(x.k))})`).join(' + ');
  const toplamYazi = n => terimler(n).map(x => fmt(deger(x.d, x.k))).join(' + ');

  function cozum(n) {
    return `<div class="bd-cozum">${toplar(n, { etiket: true })}
      <p class="bd-satir">${fmt(n)} = ${carpimYazi(n)}</p>
      <p class="bd-satir">${fmt(n)} = ${toplamYazi(n)}</p></div>`;
  }

  function cozumle(i, puan) {
    const S = COZ[i], son = i + 1 >= COZ.length;
    const ileri = () => sonrakiDugme(son, 'Sonraki Soru →', () => (son ? ozet('cozumle', puan, COZ.length) : cozumle(i + 1, puan)));
    let cevaplandi = false;

    if (S.t === 'sec') {
      const dogrular = terimler(S.n).map(x => deger(x.d, x.k));
      // Tuzak kartlar: bir basamak kaymış değerler ve yalnız rakam
      const tuzak = new Set();
      terimler(S.n).forEach(x => { if (x.k + 1 <= 9) tuzak.add(deger(x.d, x.k + 1)); if (x.k >= 1) tuzak.add(deger(x.d, x.k - 1)); });
      dogrular.forEach(v => tuzak.delete(v));
      const kartlar = shuffle([...dogrular, ...shuffle([...tuzak]).slice(0, Math.max(3, 8 - dogrular.length))]);
      const secili = [];
      let ilk = true; // yalnızca ilk denemede doğruysa puan
      stage.innerHTML = `
        ${progressBar(i, COZ.length)}
        <p class="pg-step qbox"><span class="fy-qno">${i + 1}. Soru</span>Aşağıdaki kartlardan doğru olanları seçerek <b>${fmt(S.n)}</b> sayısını <b>basamak değerlerinin toplamı</b> şeklinde yaz.</p>
        <p class="bd-buyuk">${fmt(S.n)} =</p>
        <div class="bd-denklem" id="bdDenklem"></div>
        <p class="bd-toplam" id="bdToplam"></p>
        <div class="bd-kartlar">${kartlar.map(v => `<button class="bd-kart" data-v="${v}">${fmt(v)}</button>`).join('')}</div>
        <p class="pg-fb" id="bdFb" aria-live="polite"></p>
        <div class="aci-actions" id="bdEylem"><button class="btn btn-yellow" id="bdKontrol">✔ Kontrol Et</button></div>`;
      const ciz = () => {
        stage.querySelector('#bdDenklem').innerHTML = secili.length
          ? secili.map(v => `<button class="bd-terim" data-v="${v}">${fmt(v)}</button>`).join('<span class="bd-arti">+</span>')
          : '<span class="bd-bos">Kartlara dokunarak buraya ekle</span>';
        const t = secili.reduce((a, v) => a + Number(v), 0);
        stage.querySelector('#bdToplam').innerHTML = secili.length ? `Toplam: <b>${fmt(t)}</b>` : '';
        stage.querySelectorAll('.bd-kart').forEach(k => k.classList.toggle('kullanildi', secili.includes(k.dataset.v)));
        stage.querySelectorAll('.bd-terim').forEach(b => b.addEventListener('click', () => { if (cevaplandi) return; secili.splice(secili.indexOf(b.dataset.v), 1); ciz(); }));
      };
      stage.querySelectorAll('.bd-kart').forEach(k => k.addEventListener('click', () => {
        if (cevaplandi) return;
        const v = k.dataset.v, j = secili.indexOf(v);
        j >= 0 ? secili.splice(j, 1) : secili.push(v);
        secili.sort((a, b) => Number(b) - Number(a)); ciz();
      }));
      ciz();
      const fb = stage.querySelector('#bdFb');
      stage.querySelector('#bdKontrol').addEventListener('click', () => {
        if (!secili.length) { fb.className = 'pg-fb'; fb.textContent = 'Önce kartlardan seç.'; return; }
        const ok = secili.length === dogrular.length && dogrular.every(v => secili.includes(v));
        const t = secili.reduce((a, v) => a + Number(v), 0);
        if (ilk && ok) puan++;
        ilk = false;
        fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        if (ok) {
          cevaplandi = true;
          fb.innerHTML = '✓ Harika! Sıfır olan basamakları yazmamıza gerek yok, çünkü basamak değerleri 0.';
          stage.querySelector('#bdEylem').insertAdjacentHTML('beforebegin', cozum(S.n));
          ileri();
        } else {
          fb.innerHTML = t !== Number(S.n)
            ? `✗ Seçtiklerinin toplamı <b>${fmt(t)}</b>, ${fmt(S.n)} değil. Hangi basamakta hangi rakam var, tekrar bak.`
            : '✗ Toplam doğru ama her rakamın basamak değerini ayrı bir terim olarak yaz.';
          fb.innerHTML += ' Kartları düzeltip tekrar <b>Kontrol Et</b>.';
        }
      });
    } else {
      stage.innerHTML = `
        ${progressBar(i, COZ.length)}
        <p class="pg-step qbox"><span class="fy-qno">${i + 1}. Soru</span>Çözümlenmiş hâli verilen sayıyı rakamlarla yaz.</p>
        <p class="bd-buyuk bd-cozumlu">${carpimYazi(S.n)} = ?</p>
        <div class="ea-try"><input id="bdIn" class="bd-sayi-giris" inputmode="numeric" autocomplete="off" placeholder="Sayıyı yaz" aria-label="Sayı"><button class="btn btn-yellow" id="bdKontrol">✔ Kontrol Et</button></div>
        <p class="pg-fb" id="bdFb" aria-live="polite"></p>
        <div class="aci-actions" id="bdEylem"></div>`;
      const inp = stage.querySelector('#bdIn'), fb = stage.querySelector('#bdFb');
      let deneme = 0;
      inp.addEventListener('input', () => { const v = inp.value.replace(/\D/g, ''); inp.value = fmt(v); });
      const kontrol = () => {
        if (cevaplandi) return;
        const v = norm(inp.value);
        if (!v) { fb.className = 'pg-fb'; fb.textContent = 'Bir sayı yaz.'; return; }
        deneme++;
        const ok = v === S.n;
        if (ok && deneme === 1) puan++;
        fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        if (ok || deneme >= 2) {
          cevaplandi = true; inp.disabled = true;
          fb.innerHTML = ok ? `✓ Doğru: <b>${fmt(S.n)}</b>. Boş kalan basamaklara 0 yazdın!` : `✗ Doğrusu <b>${fmt(S.n)}</b>. Çözümlemede olmayan basamaklara <b>0</b> yazılır.`;
          stage.querySelector('#bdEylem').insertAdjacentHTML('beforebegin', cozum(S.n));
          ileri();
        } else {
          fb.innerHTML = `✗ Olmadı. İpucu: En büyük basamak <b>${ADLAR[S.n.length - 1]}</b>; sayı ${S.n.length} basamaklı olmalı. Boş basamaklara 0 koymayı unutma.`;
        }
      };
      stage.querySelector('#bdKontrol').addEventListener('click', kontrol);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') kontrol(); });
      inp.focus({ preventScroll: true });
    }
  }

  // ================= ⚡ Basamak Avı (süreli oyun) =================
  const SURE = 20;
  function rasgeleSayi(min, max) {
    const uzunluk = rasgele(min, max);
    let s = String(rasgele(1, 9));
    for (let i = 1; i < uzunluk; i++) s += Math.random() < 0.22 ? '0' : String(rasgele(1, 9));
    return s;
  }
  const renkliSayi = (n, k) => {
    const r = rakamlar(n);
    return `<span class="bd-renkli">${fmt(n).split('').map((c, i, a) => {
      if (c === ' ') return ' ';
      const kk = a.slice(i + 1).filter(x => x !== ' ').length;
      return kk === k ? `<b style="color:${RENK[k]}">${c}</b>` : c;
    }).join('')}</span>`;
  };
  function benzersiz(dogru, adaylar) {
    const s = [dogru];
    for (const a of shuffle(adaylar)) if (!s.includes(a) && s.length < 4) s.push(a);
    return s;
  }
  const URET = [
    () => { // basamak adı
      const n = rasgeleSayi(6, 9), k = rasgele(0, n.length - 1);
      const sec = benzersiz(ADLAR[k], [k - 1, k + 1, k + 2, k - 2, k + 3].filter(x => x >= 0 && x < 10).map(x => ADLAR[x]));
      return { soru: `${renkliSayi(n, k)} sayısında <b>renkli</b> rakamın <b>basamak adı</b> nedir?`, sec, dogru: ADLAR[k] };
    },
    () => { // basamak değeri
      const n = rasgeleSayi(6, 9), r = rakamlar(n);
      let k; do k = rasgele(1, n.length - 1); while (r[k] === '0');
      const d = r[k], dogru = fmt(deger(d, k));
      const sec = benzersiz(dogru, [deger(d, k + 1), deger(d, k - 1), d, deger(d, k + 2)].map(fmt));
      return { soru: `${renkliSayi(n, k)} sayısında <b>renkli</b> rakamın <b>basamak değeri</b> kaçtır?`, sec, dogru };
    },
    () => { // sayı değeri
      const n = rasgeleSayi(6, 9), r = rakamlar(n);
      let k; do k = rasgele(2, n.length - 1); while (r[k] === '0');
      const d = r[k];
      const sec = benzersiz(d, [fmt(deger(d, k)), fmt('1' + '0'.repeat(k)), fmt(deger(d, k - 1))]);
      return { soru: `${renkliSayi(n, k)} sayısında <b>renkli</b> rakamın <b>sayı değeri</b> kaçtır?`, sec, dogru: d };
    },
    () => { // çözümlenmiş hâlden sayı
      const n = rasgeleSayi(6, 8), r = rakamlar(n);
      const kaydir = (yon) => { // bir terimi bir basamak kaydır (sıfır hatası)
        const t = terimler(n), j = rasgele(0, t.length - 1), x = t[j], yeni = x.k + yon;
        if (yeni < 0 || yeni > 9) return null;
        const a = [...r]; a[x.k] = '0'; if (a[yeni] && a[yeni] !== '0') return null; a[yeni] = x.d;
        return [...a].reverse().join('').replace(/^0+/, '');
      };
      const sifirsiz = terimler(n).map(x => x.d).join(''); // sıfırları unutma hatası
      const fazlaSifir = n + '0';                           // bir basamak fazla yazma hatası
      const yerDegistir = (() => { // yan yana iki farklı rakamın yerini değiştir
        const a = n.split(''); for (let j = 1; j < a.length - 1; j++) if (a[j] !== a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; return a.join(''); }
        return null;
      })();
      const sec = benzersiz(fmt(n), [kaydir(1), kaydir(-1), kaydir(1), sifirsiz, fazlaSifir, yerDegistir].filter(Boolean).map(fmt));
      return { soru: `<span class="bd-cozumlu">${carpimYazi(n)}</span><br>şeklinde çözümlenen sayı hangisidir?`, sec, dogru: fmt(n) };
    },
    () => { // hangi sayının … basamağında … var?
      const k = rasgele(1, 6), d = String(rasgele(1, 9));
      const yap = kk => { const n = rasgeleSayi(Math.max(kk + 1, 7), 8).split(''); const L = n.length; n[L - 1 - kk] = d; for (const z of [k - 1, k, k + 1]) if (z !== kk && z >= 0 && z < L && n[L - 1 - z] === d) n[L - 1 - z] = String((+d % 9) + 1); return n.join(''); };
      const dogru = fmt(yap(k));
      const sec = benzersiz(dogru, [yap(k + 1), yap(k - 1 >= 0 ? k - 1 : k + 2), yap(k + 2)].map(fmt));
      return { soru: `Hangi sayının <b>${ADLAR[k].toLocaleLowerCase('tr')}</b> basamağında <b>${d}</b> vardır?`, sec, dogru };
    },
  ];

  function av() {
    const sorular = shuffle(Array.from({ length: 10 }, (_, j) => URET[j % URET.length]())), harf = 'ABCD';
    let i = 0, puan = 0, seri = 0, enIyiSeri = 0, zaman = null;
    const goster = () => {
      const q = sorular[i], sec = shuffle(q.sec);
      stage.innerHTML = `
        ${progressBar(i, sorular.length)}
        <div class="bd-av-ust"><span>Puan: <b>${puan}</b></span><span class="bd-seri${seri >= 2 ? ' sicak' : ''}">🔥 Seri: <b>${seri}</b></span></div>
        <div class="g-timer"><div class="g-timer-fill" style="animation-duration:${SURE}s"></div></div>
        <div class="g-card g-question bd-av-soru">${q.soru}</div>
        <div class="g-options">${sec.map((s, j) => `<button class="g-opt c${j}" data-v="${s}"><b>${harf[j]}</b><span>${s}</span></button>`).join('')}</div>
        <p class="pg-fb" id="bdFb" aria-live="polite"></p>`;
      const btns = [...stage.querySelectorAll('.g-opt')];
      let kilit = false;
      const cevap = b => {
        if (kilit) return; kilit = true; clearTimeout(zaman);
        stage.querySelector('.g-timer-fill').style.animationPlayState = 'paused';
        btns.forEach(x => { x.disabled = true; if (x.dataset.v === q.dogru) x.classList.add('right'); });
        const ok = b && b.dataset.v === q.dogru;
        if (ok) { puan++; seri++; enIyiSeri = Math.max(enIyiSeri, seri); } else { seri = 0; if (b) b.classList.add('wrong'); }
        if (!b) stage.querySelector('.g-question').insertAdjacentHTML('beforeend', '<div class="g-timeout">⏰ Süre doldu!</div>');
        const fb = stage.querySelector('#bdFb'); fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        fb.innerHTML = ok ? (seri >= 3 ? `✓ Doğru! 🔥 ${seri} doğru üst üste!` : '✓ Doğru!') : `✗ Doğru cevap: <b>${q.dogru}</b>`;
        setTimeout(() => { i++; i < sorular.length ? goster() : ozet('av', puan, sorular.length, enIyiSeri); }, ok ? 1100 : 2000);
      };
      btns.forEach(b => b.addEventListener('click', () => cevap(b)));
      zaman = setTimeout(() => cevap(null), SURE * 1000);
    };
    goster();
  }

  // ================= Özet =================
  function ozet(mod, puan, en, seri) {
    const pct = puan / en, yildiz = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    const ad = { tablo: 'Basamak tablosu tamam!', cozumle: 'Çözümleme ustası!', av: 'Basamak avcısı!' }[mod];
    const alt = { tablo: 'İlk denemede doğru doldurulan kutu', cozumle: 'İlk denemede doğru çözülen soru', av: `Doğru cevap${seri ? ` · En uzun seri: ${seri} 🔥` : ''}` }[mod];
    stage.innerHTML = `
      <div class="g-result">
        <div class="g-stars" aria-label="${yildiz} yıldız">${[1, 2, 3].map(k => `<span class="${k <= yildiz ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${ad}</h2>
        <div class="g-score"><b>${puan}</b><span>/ ${en}</span></div>
        <p class="g-time">${alt}</p>
        <p class="pg-rule"><b>Sayı değeri</b> = rakamın kendisi · <b>Basamak değeri</b> = rakam × basamağın değeri · <b>Çözümleme</b> = basamak değerlerinin toplamı · Sıfırın basamak değeri <b>0</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="bdTekrar">↻ Tekrar</button>
          <button class="btn btn-mint" id="bdMenu">🔢 Diğer Bölümler</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#bdTekrar').addEventListener('click', () => ac(mod));
    stage.querySelector('#bdMenu').addEventListener('click', giris);
    if (yildiz >= 2) confetti();
  }

  const m = new URLSearchParams(location.search).get('mod');
  ['tablo', 'cozumle', 'av'].includes(m) ? ac(m) : giris();
})();
