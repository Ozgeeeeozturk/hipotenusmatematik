/* Limonata Oranı: oran, doğru orantı, birim fiyat (7. sınıf, Sayılar ve Nicelikler 2) */
(function () {
  const { rnd, sec, kes, ebob } = R_;
  const bardak = (n, renk, etiket) => `<div class="lo-grup"><div class="lo-bardaklar">${Array.from({ length: n }, () => `<svg viewBox="0 0 30 40" class="lo-b"><path d="M4 4 L26 4 L23 37 L7 37 Z" fill="${renk}" stroke="#2D2440" stroke-width="2"/></svg>`).join('')}</div><small>${etiket}</small></div>`;
  const tarif = (a, b, ad1, ad2) => `<div class="lo-tarif">${bardak(a, '#BFE6FF', `${a} bardak ${ad1}`)}<span class="lo-arti">+</span>${bardak(b, '#FFE45C', `${b} bardak ${ad2}`)}</div>`;

  // Tarifi büyütme etkinliği: su ve limon miktarını ayarla
  const buyut = (a, b, k) => (kutu, bitir) => {
    let s = 0, l = 0;
    const ciz = () => { kutu.querySelector('.lo-sonuc').innerHTML = tarif(s, l, 'su', 'limon suyu'); kutu.querySelector('#loS').textContent = s; kutu.querySelector('#loL').textContent = l; };
    kutu.innerHTML = `<div class="lo-ayar"><div><b>Su:</b> <button data-a="s" data-d="-1">−</button><b id="loS">0</b><button data-a="s" data-d="1">+</button></div><div><b>Limon suyu:</b> <button data-a="l" data-d="-1">−</button><b id="loL">0</b><button data-a="l" data-d="1">+</button></div></div><div class="lo-sonuc"></div><div class="aci-actions"><button class="btn btn-yellow" id="loK">✓ Kontrol Et</button></div>`;
    ciz();
    kutu.querySelectorAll('[data-a]').forEach(bt => bt.addEventListener('click', () => { if (bt.dataset.a === 's') s = Math.max(0, Math.min(18, s + +bt.dataset.d)); else l = Math.max(0, Math.min(18, l + +bt.dataset.d)); ciz(); }));
    kutu.querySelector('#loK').addEventListener('click', () => {
      kutu.querySelectorAll('button').forEach(x => { x.disabled = true; });
      const ok = s === a * k && l === b * k;
      bitir(ok, ok ? '' : `Doğrusu ${a * k} bardak su ve ${b * k} bardak limon suyu.`);
    });
  };

  const S = [
    () => { const a = rnd(2, 4), b = 1, k = rnd(2, 4); return { tip: 'ozel', soru: `Limonata tarifi: <b>${a} bardak suya</b> <b>${b} bardak limon suyu</b> karıştırılıyor. Aynı tadı koruyarak tarifi <b>${k} katına</b> çıkar.`, gorsel: tarif(a, b, 'su', 'limon suyu'), kur: buyut(a, b, k), aciklama: `Oran korunmalı: ${a} : ${b} = ${a * k} : ${b * k}. İki miktar da ${k} ile çarpılır.` }; },
    () => { const a = rnd(2, 5), b = rnd(1, 3), k = rnd(2, 5); if (ebob(a, b) !== 1) return S[1]();
      return { tip: 'sayi', soru: `Bir limonata tarifinde <b>${a} bardak su</b> için <b>${b} bardak limon suyu</b> kullanılıyor. <b>${a * k} bardak su</b> için kaç bardak limon suyu gerekir?`, gorsel: tarif(a, b, 'su', 'limon suyu'), cevap: b * k, birim: 'bardak', aciklama: `Su ${R_.ek(a, 'den')} ${R_.ek(a * k, 'e')}, yani ${k} katına çıktı. Limon suyu da ${k} katına çıkar: ${b} × ${k} = ${b * k}` }; },
    () => { const n = rnd(3, 6), f = rnd(4, 15), m = rnd(n + 1, 12); return { tip: 'sayi', soru: `<b>${n} kalem ${n * f} TL</b> ise aynı kalemlerden <b>${m} tanesi</b> kaç TL’dir?`, cevap: m * f, birim: 'TL', aciklama: `Birim fiyat: ${n * f} ÷ ${n} = ${f} TL. ${m} × ${f} = ${m * f} TL` }; },
    () => { const k = rnd(2, 4), x = [1, 2, 3, 4], dogru = x.map(v => [v, v * k]); const yan1 = x.map(v => [v, v + k]), yan2 = x.map(v => [v, v * k + 1]);
      const tab = t => `<table class="vd-tablo lo-tab"><tr><th>x</th>${t.map(r => `<td>${r[0]}</td>`).join('')}</tr><tr><th>y</th>${t.map(r => `<td>${r[1]}</td>`).join('')}</tr></table>`;
      const ops = shuffle([[dogru, 1], [yan1, 0], [yan2, 0]]);
      return { tip: 'secim', soru: 'Hangi tabloda x ve y <b>doğru orantılıdır</b>?', secenekler: ops.map(o => tab(o[0])), dogru: ops.findIndex(o => o[1]), aciklama: `Doğru orantıda y ÷ x her zaman aynıdır (sabit oran = ${k}).` }; },
    () => { const k = rnd(2, 6), e = rnd(3, 9) * k, kz = rnd(2, 8) * k; const g = ebob(kz, e);
      return { tip: 'secim', soru: `Bir sınıfta <b>${kz} kız</b> ve <b>${e} erkek</b> öğrenci var. Kızların sayısının erkeklerin sayısına oranı hangisidir?`, ...temaSecenek(`${kz / g}/${e / g}`, [`${e / g}/${kz / g}`, `${kz / g}/${(kz + e) / g}`, `${kz}/${kz + e}`, `${kz / g + 1}/${e / g}`], v => kes(...v.split('/'))), aciklama: `${kz} : ${e} oranını ${g} ile sadeleştir: ${kz / g} : ${e / g}` }; },
    () => { const h = rnd(40, 90), t = rnd(2, 5); return { tip: 'sayi', soru: `Saatteki hızı <b>${h} km</b> olan bir otomobil aynı hızla <b>${t} saatte</b> kaç km yol alır?`, cevap: h * t, birim: 'km', aciklama: `Süre ile yol doğru orantılı: ${h} × ${t} = ${h * t} km` }; },
    () => { const a = rnd(2, 5), b = a + rnd(1, 4), p = rnd(3, 9); return { tip: 'secim', soru: `A marketinde <b>${a} kg</b> elma <b>${a * p} TL</b>, B marketinde <b>${b} kg</b> elma <b>${b * p + b} TL</b>. Hangi markette elmanın kilogramı daha ucuzdur?`, ...temaSecenek('A marketi', ['B marketi', 'İkisi aynı']), aciklama: `Birim fiyatları karşılaştır: A: ${a * p} ÷ ${a} = ${p} TL, B: ${b * p + b} ÷ ${b} = ${p + 1} TL` }; },
  ];

  temaOyunu({
    siniflar: [7],
    unvan: 'Oran ustası!',
    not: () => '<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🍋</span><p><b>Oran</b> iki çokluğun karşılaştırmasıdır. İki çokluktan biri kaç katına çıkınca diğeri de o kadar katına çıkıyorsa bu çokluklar <mark>doğru orantılıdır</mark>.</p></div>',
    uret: () => temaKaristir(S, 7),
    kural: () => 'Doğru orantıda iki çokluğun bölümü hep aynıdır.',
  });
})();
