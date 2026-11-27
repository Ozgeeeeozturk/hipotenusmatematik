/* Ondalık Market: ondalık gösterimlerle toplama ve çıkarma (6. sınıf), negatif ondalıklarla işlemler (7. sınıf) */
(function () {
  const { rnd, sec } = R_;
  // Tüm hesaplar kuruş (yüzde bir) cinsinden tam sayıyla yapılır; kayan nokta hatası olmaz
  const yaz = k => (k < 0 ? '−' : '') + (Math.abs(k) / 100).toFixed(2).replace('.', ',');
  const kisa = k => yaz(k).replace(/(,\d*?)0+$/, '$1').replace(/,$/, ''); // 3,50 → 3,5 ; 4,00 → 4
  const URUN = [['🍎', 'Elma'], ['🧃', 'Meyve suyu'], ['🍞', 'Ekmek'], ['🥛', 'Süt'], ['🧀', 'Peynir'], ['🍫', 'Çikolata'], ['✏️', 'Kalem'], ['📒', 'Defter'], ['🍌', 'Muz'], ['🧁', 'Kek'], ['🍪', 'Bisküvi'], ['🥚', 'Yumurta']];
  const fiyat = () => rnd(2, 40) * 100 + sec([0, 25, 50, 75, 5, 15, 45, 90, 35, 60]);
  const etiket = ([e, ad], k) => `<div class="om-urun"><span class="om-e">${e}</span><b>${ad}</b><span class="om-fiyat">${yaz(k)} TL</span></div>`;

  // ---- Virgül hizalama etkinliği: alttaki sayıyı kaydır, virgülleri hizala, sonucu yaz ----
  const hizala = (a, b, isl) => (kutu, bitir) => {
    const parca = k => { const [t, o = ''] = kisa(Math.abs(k)).split(','); return { t, o }; };
    const A = parca(a), Bp = parca(b);
    const SOL = 5, N = 11; // virgül sütunu = 5
    const satir = (p, kay) => {
      const h = Array(N).fill(''), bas = SOL - p.t.length + kay;
      [...p.t].forEach((d, i) => { if (bas + i >= 0 && bas + i < N) h[bas + i] = d; });
      if (p.o) h[SOL + kay] = ',';
      [...p.o].forEach((d, i) => { const j = SOL + kay + 1 + i; if (j >= 0 && j < N) h[j] = d; });
      return h;
    };
    let kay = Bp.o ? sec([-2, -1, 1, 2]) : 2, bitti = false;
    const hucre = (h, isl) => `<div class="om-satir"><span class="om-isl">${isl}</span>${h.map((c, i) => `<span class="${i === SOL ? 'vs' : ''}${c === ',' ? ' vir' : ''}">${c}</span>`).join('')}</div>`;
    const ciz = () => {
      const hizali = kay === 0;
      kutu.querySelector('.om-tablo').innerHTML = hucre(satir(A, 0), '') + hucre(satir(Bp, kay), isl) + '<div class="om-cizgi"></div>';
      kutu.querySelector('.om-durum').innerHTML = hizali ? '✅ Virgüller alt alta! Şimdi işlemi yap.' : '🧲 Alttaki sayıyı kaydırıp <b>virgülleri</b> alt alta getir.';
      kutu.querySelector('.om-sonuc').hidden = !hizali;
      kutu.querySelector('.om-tablo').classList.toggle('hizali', hizali);
      if (hizali) setTimeout(() => { const i = kutu.querySelector('.om-sonuc input'); if (i && !bitti) try { i.focus({ preventScroll: true }); } catch (e) {} }, 50);
    };
    kutu.innerHTML = `<div class="om-hizala"><div class="om-tablo"></div><div class="om-kaydir"><button class="btn-ghost-dark" data-k="-1" aria-label="Sola kaydır">◀</button><span class="om-durum"></span><button class="btn-ghost-dark" data-k="1" aria-label="Sağa kaydır">▶</button></div>
      <form class="to-giris om-sonuc" hidden autocomplete="off"><span>Sonuç =</span><input inputmode="decimal" aria-label="Sonuç"><button class="btn btn-yellow">✓ Kontrol Et</button></form></div>`;
    ciz();
    kutu.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { if (bitti) return; kay = Math.max(-2, Math.min(2, kay + +b.dataset.k)); ciz(); }));
    kutu.querySelector('.om-sonuc').addEventListener('submit', e => {
      e.preventDefault(); if (bitti) return;
      const inp = kutu.querySelector('.om-sonuc input'); if (!inp.value.trim()) return;
      const v = Math.round(Number(inp.value.trim().replace(',', '.').replace('−', '-')) * 100); if (Number.isNaN(v)) return;
      bitti = true; kutu.querySelectorAll('button,input').forEach(x => { x.disabled = true; });
      const dogru = isl === '+' ? a + b : a - b;
      bitir(v === dogru, `${kisa(a)} ${isl} ${kisa(b)} = <b>${kisa(dogru)}</b>. Eksik basamakları 0 ile doldurmak işini kolaylaştırır: ${yaz(a)} ${isl} ${yaz(b)}`);
    });
  };

  // ---- Hedef sepet: raftan seçerek hedef tutarı tuttur ----
  const hedefSepet = () => (kutu, bitir) => {
    const ur = shuffle(URUN).slice(0, 6), fy = ur.map(() => fiyat());
    const [i, j] = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2), hedef = fy[i] + fy[j];
    const secili = new Set(); let bitti = false;
    const top = () => [...secili].reduce((s, k) => s + fy[k], 0);
    const ciz = () => {
      kutu.querySelector('.om-raf').innerHTML = ur.map((u, k) => `<button class="om-raf-urun${secili.has(k) ? ' secili' : ''}" data-k="${k}">${etiket(u, fy[k])}</button>`).join('');
      kutu.querySelector('.om-sepet').innerHTML = `🛒 Sepet: <b>${yaz(top())} TL</b> &nbsp;/&nbsp; 🎯 Hedef: <b>${yaz(hedef)} TL</b>`;
      kutu.querySelectorAll('.om-raf-urun').forEach(b => b.addEventListener('click', () => { if (bitti) return; const k = +b.dataset.k; secili.has(k) ? secili.delete(k) : secili.add(k); ciz(); }));
    };
    kutu.innerHTML = `<div class="om-raf"></div><p class="om-sepet"></p><div class="aci-actions"><button class="btn btn-yellow" id="omOk">🧾 Kasaya git</button></div>`;
    ciz();
    kutu.querySelector('#omOk').addEventListener('click', () => {
      if (bitti || !secili.size) return; bitti = true; kutu.querySelectorAll('button').forEach(x => { x.disabled = true; });
      const ok = top() === hedef;
      bitir(ok, ok ? `${[...secili].map(k => yaz(fy[k])).join(' + ')} = ${yaz(hedef)} TL 🎯` : `Sepetin ${yaz(top())} TL tuttu. Örneğin ${ur[i][1]} (${yaz(fy[i])}) + ${ur[j][1]} (${yaz(fy[j])}) = ${yaz(hedef)} TL`);
    });
  };

  // ---- Hata avcısı: alt alta yapılmış üç işlemden doğrusu ----
  const hataAvcisi = () => {
    const A = rnd(2, 9) * 100 + rnd(1, 9) * 10, B = rnd(1, 9) * 100 + rnd(11, 99); // ör. 4,5 ve 2,35
    const dogru = A + B, kaymis = Math.round(A / 10) + B;
    const as = kisa(A), bs = kisa(B);
    const sut = (ust, alt, sonuc, kay) => `<span class="om-dik"><span${kay ? ' class="kay"' : ''}>${ust}</span><span>+ ${alt}</span><span class="cz">${sonuc}</span></span>`;
    const ops = shuffle([[sut(as + '0', bs, kisa(dogru)), 1], [sut(as, bs, kisa(kaymis), 1), 0], [sut(as + '0', bs, kisa(dogru + 100)), 0]]);
    return { tip: 'secim', soru: `🕵️ <b>Hata avcısı!</b> Üç öğrenci <b>${as} + ${bs}</b> işlemini alt alta yaptı. Hangisinin sonucu doğru?`, secenekler: ops.map(o => o[0]), dogru: ops.findIndex(o => o[1]),
      aciklama: `Virgüller alt alta gelmeli: ${as}0 + ${bs} = ${kisa(dogru)}. Sayıları sağa yaslayan öğrenci ${kisa(kaymis)} buldu (virgüller kaydı); bir diğeri eldeyi yanlış ekledi.` };
  };
  const paraUstu = () => {
    const t = fiyat() + rnd(0, 2) * 1000, ver = t <= 5000 ? 5000 : t <= 10000 ? 10000 : 20000, u = sec(URUN);
    return { tip: 'sayi', soru: `💵 <b>Kasiyer sensin!</b> Müşteri ${u[0]} <b>${u[1]}</b> aldı ve kasaya <b>${ver / 100} TL</b> verdi. Para üstü kaç TL?`, gorsel: `<div class="om-para"><span class="om-banknot">💵 ${ver / 100} TL</span><span class="om-eksi">−</span>${etiket(u, t)}</div>`,
      cevap: (ver - t) / 100, birim: 'TL', aciklama: `${ver / 100},00 − ${yaz(t)} = ${yaz(ver - t)} TL. İpucu: ${ver / 100} tam sayısını ${ver / 100},00 diye yaz, sonra alt alta çıkar.` };
  };

  // ---- 6. sınıf ----
  const S6 = [
    () => { const a = rnd(2, 40) * 100 + sec([25, 5, 75, 45, 60]), b = rnd(1, 9) * 100 + sec([5, 50, 25, 75]); return { tip: 'ozel', soru: `<b>${kisa(a)} + ${kisa(b)}</b> işlemini alt alta yapalım.`, kur: hizala(a, b, '+') }; },
    () => { const a = rnd(22, 60) * 100 + sec([25, 5, 75, 4, 6]), b = rnd(1, 9) * 100 + sec([5, 50, 25]); return { tip: 'ozel', soru: `<b>${kisa(a)} − ${kisa(b)}</b> işlemini alt alta yapalım.`, kur: hizala(a, b, '−') }; },
    () => { const ur = shuffle(URUN).slice(0, 3), fy = ur.map(() => fiyat()), t = fy.reduce((x, y) => x + y, 0);
      return { tip: 'sayi', soru: '🧾 <b>Kasa sensin!</b> Sepetteki ürünlerin toplam tutarı kaç TL?', gorsel: `<div class="om-raf sabit">${ur.map((u, k) => etiket(u, fy[k])).join('')}</div>`, cevap: t / 100, birim: 'TL', aciklama: `${fy.map(yaz).join(' + ')} = ${yaz(t)} TL` }; },
    paraUstu,
    () => ({ tip: 'ozel', soru: '🎯 <b>Hedef sepet!</b> Raftan ürün seçerek sepeti tam hedef tutara getir.', kur: hedefSepet() }),
    hataAvcisi,
    () => { const a = fiyat(), b = fiyat(), t = a + b, alt = Math.floor(t / 100), ta = Math.floor(a / 100) + Math.floor(b / 100);
      return { tip: 'secim', soru: `🔮 <b>Tahmin et:</b> ${kisa(a)} + ${kisa(b)} sonucu hangi iki ardışık doğal sayı arasındadır?`, ...temaSecenek(`${alt} ile ${alt + 1}`, [`${alt - 1} ile ${alt}`, `${alt + 1} ile ${alt + 2}`, `${alt - 2} ile ${alt - 1}`]),
        aciklama: `Tam kısımlar: ${Math.floor(a / 100)} + ${Math.floor(b / 100)} = ${ta}. Ondalık kısımlar ${kisa(a % 100)} ve ${kisa(b % 100)}${t % 100 < (a % 100) + (b % 100) ? ' toplamı 1’i geçiyor, 1 eklenir' : ''} → sonuç ${kisa(t)}` }; },
  ];

  // ---- 7. sınıf: negatif ondalıklar ----
  const S7 = [
    () => { const a = -(rnd(1, 9) * 100 + sec([25, 50, 75, 5])), b = rnd(2, 12) * 100 + sec([0, 25, 75, 40]);
      return { tip: 'sayi', soru: `🌡️ Sabah hava sıcaklığı <b>${kisa(a)} °C</b> idi. Öğlene kadar <b>${kisa(b)} °C</b> arttı. Öğlen hava sıcaklığı kaç °C oldu?`, gorsel: '<div class="om-ikon">❄️ 🌡️ ➡️ ☀️</div>', cevap: (a + b) / 100, birim: '°C', aciklama: `${kisa(a)} + ${kisa(b)} = ${kisa(a + b)} °C. Farklı işaretli sayılarda büyük mutlak değerden küçüğü çıkarılır, büyüğün işareti alınır.` }; },
    () => { const a = -(rnd(5, 30) * 100 + sec([40, 25, 60])), b = rnd(1, 4) * 100 + sec([85, 15, 50]);
      return { tip: 'sayi', soru: `🤿 Bir dalgıç deniz seviyesinin <b>${kisa(-a)} m</b> altındadır (${kisa(a)} m). <b>${kisa(b)} m</b> daha aşağı inerse kaç metrede olur?`, gorsel: '<div class="om-ikon">🌊 🤿 ⬇️</div>', cevap: (a - b) / 100, birim: 'm', aciklama: `${kisa(a)} − ${kisa(b)} = ${kisa(a - b)} m` }; },
    () => { const a = -(rnd(1, 9) * 100 + rnd(1, 9) * 10), b = rnd(1, 9) * 100 + rnd(11, 99); const bu = Math.max(b, -a), ku = Math.min(b, -a);
      return { tip: 'ozel', soru: `<b>${kisa(b)} + (${kisa(a)})</b> işleminde büyük mutlak değerden küçüğünü çıkarırız. Virgülleri hizalayıp <b>${kisa(bu)} − ${kisa(ku)}</b> işlemini yap, sonra işareti düşün!`, kur: hizala(bu, ku, '−'), aciklama: `İşaret, mutlak değeri büyük olanınkidir: ${kisa(b)} + (${kisa(a)}) = <b>${kisa(b + a)}</b>` }; },
    () => { const a = rnd(1, 9) * 100 + sec([5, 25, 75]), b = rnd(1, 9) * 100 + sec([50, 45, 35]), c = -(rnd(1, 5) * 100 + sec([0, 25, 5]));
      return { tip: 'sayi', soru: `<span class="tz-buyuk">${kisa(a)} − ${kisa(b)} + (${kisa(c)}) = ?</span>`, cevap: (a - b + c) / 100, aciklama: `Soldan sağa: ${kisa(a)} − ${kisa(b)} = ${kisa(a - b)}; ${kisa(a - b)} + (${kisa(c)}) = ${kisa(a - b + c)}` }; },
    () => ({ tip: 'ozel', soru: '🎯 <b>Hedef sepet!</b> Raftan ürün seçerek sepeti tam hedef tutara getir.', kur: hedefSepet() }),
    () => { const a = -(rnd(1, 9) * 100 + sec([5, 25, 50])), b = -(rnd(1, 9) * 100 + sec([75, 15, 40])); const t = a + b;
      return { tip: 'secim', soru: `<span class="tz-buyuk">(${kisa(a)}) + (${kisa(b)})</span> işleminin sonucu hangisidir?`, ...temaSecenek(kisa(t), [kisa(-t), kisa(a - b), kisa(b - a), kisa(t - 100)]), aciklama: `İki negatif sayı toplanınca mutlak değerler toplanır, sonuç negatif olur: −(${kisa(-a)} + ${kisa(-b)}) = ${kisa(t)}` }; },
    paraUstu,
  ];

  temaOyunu({
    siniflar: [6, 7],
    unvan: 'Market ustası! 🛒',
    not: g => `<div class="pg-def om-not"><span class="pg-def-ic" aria-hidden="true">🛒</span><p>${g === 6
      ? 'Ondalık sayıları toplarken ya da çıkarırken <mark>virgülleri alt alta</mark> getir. Eksik basamaklara 0 yazabilirsin: 4,5 = 4,50'
      : 'Negatif ondalık sayılarda tam sayıların kuralları geçerli: <b>aynı işaretliler</b> toplanır; <b>farklı işaretlilerde</b> büyükten küçük çıkarılır, büyüğün işareti alınır.'}</p></div>`,
    uret: g => temaKaristir(g === 6 ? S6 : S7, 8),
    kural: () => 'Virgül virgülün altına, onda birler onda birlerin altına!',
  });
})();
