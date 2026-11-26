/* Alan Atölyesi: paralelkenar, üçgen, yamuk, eşkenar dörtgen, daire ve daire dilimi alanı; birim dönüşümleri */
(function () {
  const { rnd, sec, kes, sayi } = R_;
  const U = 22; // bir birim karenin piksel boyu

  // Kareli zemin üzerinde çokgen: noktalar birim cinsinden
  function zemin(gen, yuk, icerik) {
    let s = `<svg viewBox="0 0 ${gen * U + 20} ${yuk * U + 20}" class="al-svg" role="img" aria-label="Kareli zeminde şekil"><g transform="translate(10,10)">`;
    for (let i = 0; i <= gen; i++) s += `<line x1="${i * U}" y1="0" x2="${i * U}" y2="${yuk * U}" class="al-izgara"/>`;
    for (let j = 0; j <= yuk; j++) s += `<line x1="0" y1="${j * U}" x2="${gen * U}" y2="${j * U}" class="al-izgara"/>`;
    return s + icerik + '</g></svg>';
  }
  const P = pts => pts.map(([x, y]) => `${x * U},${y * U}`).join(' ');
  const cokgen = (pts, sinif = 'al-sekil') => `<polygon points="${P(pts)}" class="${sinif}"/>`;
  const yukseklik = (x, y1, y2) => `<line x1="${x * U}" y1="${y1 * U}" x2="${x * U}" y2="${y2 * U}" class="al-h"/><rect x="${x * U}" y="${y2 * U - 8}" width="8" height="8" class="al-dik"/>`;
  const etiket = (x, y, t) => `<text x="${x * U}" y="${y * U}" text-anchor="middle" class="al-et">${t}</text>`;

  function paralelkenar(b, h, k) { // taban b, yükseklik h, kayma k
    const g = b + k + 2, Y = h + 2, x0 = 1, y0 = 1;
    const pts = [[x0 + k, y0], [x0 + k + b, y0], [x0 + b, y0 + h], [x0, y0 + h]];
    return zemin(g, Y, cokgen(pts) + yukseklik(x0 + k, y0, y0 + h) + etiket(x0 + b / 2, y0 + h + 0.8, `taban = ${b}`) + `<text x="${(x0 + k) * U + 6}" y="${(y0 + h / 2) * U}" class="al-et sol">h = ${h}</text>`);
  }
  function ucgen(b, h, t) { // taban b, yükseklik h, tepe konumu t
    const x0 = 1, y0 = 1, g = Math.max(b, t) + 2, Y = h + 2;
    const pts = [[x0 + t, y0], [x0 + b, y0 + h], [x0, y0 + h]];
    const ek = t > b || t < 0 ? `<line x1="${(x0 + b) * U}" y1="${(y0 + h) * U}" x2="${(x0 + t) * U}" y2="${(y0 + h) * U}" class="al-uzanti"/>` : '';
    return zemin(g, Y, cokgen(pts) + ek + yukseklik(x0 + t, y0, y0 + h) + etiket(x0 + b / 2, y0 + h + 0.8, `taban = ${b}`) + `<text x="${(x0 + t) * U + 6}" y="${(y0 + h / 2) * U}" class="al-et sol">h = ${h}</text>`);
  }
  function yamuk(a, c, h, k) { // üst taban a, alt taban c, yükseklik h
    const x0 = 1, y0 = 1, g = c + 2, Y = h + 2;
    const pts = [[x0 + k, y0], [x0 + k + a, y0], [x0 + c, y0 + h], [x0, y0 + h]];
    return zemin(g, Y + 0.3, cokgen(pts) + yukseklik(x0 + k, y0, y0 + h) + etiket(x0 + k + a / 2, y0 - 0.25, `${a}`) + etiket(x0 + c / 2, y0 + h + 0.8, `${c}`) + `<text x="${(x0 + k) * U + 6}" y="${(y0 + h / 2) * U}" class="al-et sol">h = ${h}</text>`);
  }
  function eskenar(e, f) { // köşegenler e (yatay), f (dikey)
    const x0 = 1, y0 = 1, g = e + 2, Y = f + 2, cx = x0 + e / 2, cy = y0 + f / 2;
    const pts = [[cx, y0], [x0 + e, cy], [cx, y0 + f], [x0, cy]];
    return zemin(g, Y, cokgen(pts) + `<line x1="${x0 * U}" y1="${cy * U}" x2="${(x0 + e) * U}" y2="${cy * U}" class="al-h"/><line x1="${cx * U}" y1="${y0 * U}" x2="${cx * U}" y2="${(y0 + f) * U}" class="al-h"/>` + `<text x="${(x0 + e * 0.75) * U}" y="${cy * U - 6}" text-anchor="middle" class="al-et">e = ${e}</text><text x="${cx * U + 6}" y="${(y0 + f * 0.8) * U}" class="al-et sol">f = ${f}</text>`);
  }
  function daire(r, aci, cap) {
    const R = 80, c = 100;
    let s = `<svg viewBox="0 0 200 200" class="al-svg daire" role="img" aria-label="Daire"><circle cx="${c}" cy="${c}" r="${R}" class="${aci ? 'al-bos' : 'al-sekil'}"/>`;
    if (aci) {
      const a1 = -Math.PI / 2, a2 = a1 + aci * Math.PI / 180, big = aci > 180 ? 1 : 0;
      s += `<path d="M${c},${c} L${c + R * Math.cos(a1)},${c + R * Math.sin(a1)} A${R},${R} 0 ${big} 1 ${c + R * Math.cos(a2)},${c + R * Math.sin(a2)} Z" class="al-sekil"/>`;
      s += `<text x="${c + 26 * Math.cos((a1 + a2) / 2)}" y="${c + 26 * Math.sin((a1 + a2) / 2) + 4}" text-anchor="middle" class="al-et">${aci}°</text>`;
    }
    s += cap ? `<line x1="${c - R}" y1="${c}" x2="${c + R}" y2="${c}" class="al-h"/><circle cx="${c}" cy="${c}" r="3" fill="#2D2440"/><text x="${c}" y="${c + 18}" text-anchor="middle" class="al-et">çap = ${cap}</text>` : `<line x1="${c}" y1="${c}" x2="${c + R}" y2="${c}" class="al-h"/><circle cx="${c}" cy="${c}" r="3" fill="#2D2440"/><text x="${c + R / 2}" y="${c + 16}" text-anchor="middle" class="al-et">r = ${r}</text>`;
    return s + '</svg>';
  }

  // Paralelkenarı kesip dikdörtgene dönüştürme etkinliği
  const kesTasi = (b, h, k) => (kutu, bitir) => {
    kutu.innerHTML = `<div class="al-kes">${zemin(b + k + 2, h + 2, `<g class="al-govde"><polygon points="${P([[1 + k, 1], [1 + k + b, 1], [1 + b, 1 + h], [1 + k, 1 + h]])}" class="al-sekil"/></g><g class="al-parca" id="alParca"><polygon points="${P([[1 + k, 1], [1 + k, 1 + h], [1, 1 + h]])}" class="al-sekil parca"/></g><polygon points="${P([[1 + k + b, 1], [1 + k + b, 1 + h], [1 + b, 1 + h]])}" class="al-hayal"/>`)}</div>
      <div class="aci-actions"><button class="btn btn-lilac" id="alTasi">✂️ Üçgeni kes ve sağa taşı</button></div>
      <form class="to-giris" id="alF" hidden><span>Alan =</span><input inputmode="numeric" aria-label="Alan"><span>birim kare</span><button class="btn btn-yellow">✓ Kontrol Et</button></form>`;
    kutu.querySelector('#alTasi').addEventListener('click', e => {
      e.target.disabled = true;
      kutu.querySelector('#alParca').style.transform = `translate(${b * U}px, 0)`;
      setTimeout(() => { kutu.querySelector('#alF').hidden = false; kutu.querySelector('#alF input').focus(); }, 700);
    });
    kutu.querySelector('#alF').addEventListener('submit', e => {
      e.preventDefault(); const v = +kutu.querySelector('#alF input').value; if (!kutu.querySelector('#alF input').value) return;
      kutu.querySelectorAll('#alF input, #alF button').forEach(x => { x.disabled = true; });
      bitir(v === b * h, v === b * h ? `Kesip taşıyınca ${b} × ${h} boyutunda bir dikdörtgen oldu.` : `Oluşan dikdörtgen ${b} × ${h} = <b>${b * h}</b> birim kare.`);
    });
  };

  // ---- 6. sınıf ----
  const S6 = [
    () => { const b = rnd(3, 7), h = rnd(2, 5), k = rnd(1, 3); return { tip: 'ozel', soru: 'Paralelkenarın sol ucundaki üçgeni kesip sağa taşı. Oluşan şeklin alanı kaç birim karedir?', kur: kesTasi(b, h, k), aciklama: '<b>Paralelkenarın alanı = taban × yükseklik</b>' }; },
    () => { const b = rnd(3, 8), h = rnd(2, 6), k = rnd(1, 3); return { tip: 'sayi', soru: 'Kareli zemindeki paralelkenarın alanı kaç birim karedir?', gorsel: paralelkenar(b, h, k), cevap: b * h, birim: 'birim kare', aciklama: `Alan = taban × yükseklik = ${b} × ${h} = ${b * h}` }; },
    () => { let b = rnd(2, 4) * 2, h = rnd(2, 6), t = rnd(-1, b + 1); return { tip: 'sayi', soru: 'Kareli zemindeki üçgenin alanı kaç birim karedir?', gorsel: ucgen(b, h, Math.max(0, Math.min(b + 1, t))), cevap: b * h / 2, birim: 'birim kare', aciklama: `Üçgenin alanı = taban × yükseklik ÷ 2 = ${b} × ${h} ÷ 2 = ${b * h / 2}. (Üçgen, aynı taban ve yükseklikteki paralelkenarın yarısıdır.)` }; },
    () => { const D = [[`${rnd(2, 9)} m`, 'cm', x => x * 100], [`${rnd(2, 9)} m²`, 'cm²', x => x * 10000], [`${rnd(1, 9) * 100} cm`, 'm', x => x / 100], [`${rnd(2, 9)} km`, 'm', x => x * 1000], [`${rnd(2, 9) * 10000} cm²`, 'm²', x => x / 10000]]; const [v, h, f] = sec(D); const n = parseFloat(v);
      return { tip: 'sayi', soru: `<span class="tz-buyuk">${v}</span> kaç <b>${h}</b> eder?`, cevap: f(n), birim: h, aciklama: '1 m = 100 cm, 1 km = 1000 m. <b>1 m² = 100 cm × 100 cm = 10 000 cm²</b> (alan birimleri 100’er katlanır).' }; },
    () => { const c = sec([4, 6, 8, 10, 12, 20]); return { tip: 'sayi', soru: `Çapı <b>${c} cm</b> olan bir çemberin uzunluğu yaklaşık kaç cm’dir? (π ≈ 3 al)`, gorsel: daire(c / 2, 0, c), cevap: 3 * c, birim: 'cm', aciklama: `Çemberin uzunluğu ≈ π × çap = 3 × ${c} = ${3 * c} cm. Her çemberde uzunluk ÷ çap aynı sayıdır: π ≈ 3,14` }; },
    () => { const b = rnd(4, 9), h = rnd(2, 6), A = b * h; return { tip: 'sayi', soru: `Alanı <b>${A} cm²</b> olan bir paralelkenarın tabanı <b>${b} cm</b> ise bu tabana ait yüksekliği kaç cm’dir?`, cevap: h, birim: 'cm', aciklama: `${b} × h = ${A} → h = ${A} ÷ ${b} = ${h}` }; },
  ];

  // ---- 7. sınıf ----
  const S7 = [
    () => { const r = rnd(2, 9); return { tip: 'sayi', soru: `Yarıçapı <b>${r} cm</b> olan dairenin alanı kaç cm²’dir? (π = 3 al)`, gorsel: daire(r), cevap: 3 * r * r, birim: 'cm²', aciklama: `Daire alanı = π × r² = 3 × ${r} × ${r} = ${3 * r * r}` }; },
    () => { const r = sec([2, 4, 6]), aci = sec([90, 60, 120, 180, 30]); const A = 3 * r * r * aci / 360; if (!Number.isInteger(A)) return S7[1]();
      return { tip: 'sayi', soru: `Yarıçapı <b>${r} cm</b>, merkez açısı <b>${aci}°</b> olan daire diliminin alanı kaç cm²’dir? (π = 3 al)`, gorsel: daire(r, aci), cevap: A, birim: 'cm²', aciklama: `Dilim, dairenin ${kes(aci, 360)}’ı: 3 × ${r}² × ${aci} ÷ 360 = ${3 * r * r} × ${kes(aci, 360)} = ${A}` }; },
    () => { const e = rnd(2, 5) * 2, f = rnd(2, 4) * 2; return { tip: 'sayi', soru: 'Köşegen uzunlukları verilen eşkenar dörtgenin alanı kaç birim karedir?', gorsel: eskenar(e, f), cevap: e * f / 2, birim: 'birim kare', aciklama: `Eşkenar dörtgenin alanı = köşegenlerin çarpımı ÷ 2 = ${e} × ${f} ÷ 2 = ${e * f / 2}` }; },
    () => { const a = rnd(2, 5), c = a + rnd(2, 4), h = rnd(2, 5), k = rnd(1, c - a - 1); if ((a + c) * h % 2) return S7[3]();
      return { tip: 'sayi', soru: 'Kareli zemindeki yamuğun alanı kaç birim karedir?', gorsel: yamuk(a, c, h, k), cevap: (a + c) * h / 2, birim: 'birim kare', aciklama: `Yamuğun alanı = (üst taban + alt taban) × yükseklik ÷ 2 = (${a} + ${c}) × ${h} ÷ 2 = ${(a + c) * h / 2}` }; },
    () => { const r = rnd(2, 6); return { tip: 'secim', soru: `Yarıçapı <b>${r}</b> olan dairenin alanı için hangisi doğrudur? (π = 3)`, gorsel: daire(r), ...temaSecenek(`${3 * r * r}`, [`${6 * r}`, `${3 * r}`, `${9 * r}`, `${r * r}`]), aciklama: `Alan π·r² = ${3 * r * r}. Dikkat: 2πr = ${6 * r} çemberin <b>uzunluğudur</b>, alanı değil!` }; },
    () => { const e = rnd(2, 6) * 2, A = e * rnd(2, 6); return { tip: 'sayi', soru: `Alanı <b>${A / 2} cm²</b> olan eşkenar dörtgenin bir köşegeni <b>${e} cm</b> ise diğer köşegeni kaç cm’dir?`, cevap: A / e, birim: 'cm', aciklama: `${e} × f ÷ 2 = ${A / 2} → ${e} × f = ${A} → f = ${A / e}` }; },
  ];

  temaOyunu({
    siniflar: [6, 7],
    unvan: 'Alan ustası!',
    not: g => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">📐</span><p>${g === 6
      ? '<b>Paralelkenar</b> = taban × yükseklik, <b>üçgen</b> = taban × yükseklik ÷ 2. Çemberin uzunluğu ≈ <b>3 × çap</b>.'
      : '<b>Daire</b> = π·r², <b>daire dilimi</b> = π·r² × açı/360, <b>eşkenar dörtgen</b> = e·f ÷ 2, <b>yamuk</b> = (a + c)·h ÷ 2'}</p></div>`,
    uret: g => temaKaristir(g === 6 ? S6 : S7, 7),
    kural: g => (g === 6 ? 'Paralelkenarı kesip taşı: dikdörtgen olur! Üçgen onun yarısıdır.' : 'Yarıçap mı, çap mı? Önce ona bak; alan için r’nin karesini al.'),
  });
})();
