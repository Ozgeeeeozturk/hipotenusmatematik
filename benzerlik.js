/* Benzerlik Büyüteci: eşlik ve benzerlik, benzerlik oranı, benzer çokgende eksik kenar (8. sınıf) */
(function () {
  const { rnd, sec, kes } = R_;
  const U = 18;
  const dik = (w, h, x, y, sinif, etk) => `<rect x="${x}" y="${y}" width="${w * U}" height="${h * U}" class="${sinif}"/>${etk ? `<text x="${x + w * U / 2}" y="${y + h * U + 16}" text-anchor="middle" class="bz-et">${etk[0]}</text><text x="${x + w * U + 6}" y="${y + h * U / 2 + 4}" class="bz-et">${etk[1]}</text>` : ''}`;
  const sahne = (W, H, ic) => `<svg viewBox="0 0 ${W} ${H}" class="bz-svg" role="img" aria-label="Şekiller">${ic}</svg>`;
  const ucgenCiz = (k, x, y, sinif, etk) => { const p = [[0, 4], [3, 4], [0, 0]].map(([a, b]) => [x + a * k * U, y + b * k * U]); return `<polygon points="${p.map(q => q.join(',')).join(' ')}" class="${sinif}"/>${etk ? `<text x="${(p[0][0] + p[1][0]) / 2}" y="${p[0][1] + 16}" text-anchor="middle" class="bz-et">${etk[0]}</text><text x="${p[0][0] - 6}" y="${(p[0][1] + p[2][1]) / 2}" text-anchor="end" class="bz-et">${etk[1]}</text>` : ''}`; };

  // Büyüteçle şekli verilen oranda büyüt/küçült
  const buyutec = (w, h, k) => (kutu, bitir) => {
    let a = w, b = h, bitti = false;
    const ciz = () => {
      const W = Math.max(w, a) * U + 40, top = (w + Math.max(a, 1)) * U + 80;
      kutu.querySelector('.bz-alan').innerHTML = sahne(top, Math.max(h, b) * U + 40, dik(w, h, 10, 10, 'bz-a', [w, h]) + dik(a, b, w * U + 50, 10, 'bz-b', [a, b]));
      kutu.querySelector('#bzA').textContent = a; kutu.querySelector('#bzB').textContent = b;
    };
    kutu.innerHTML = `<div class="bz-alan"></div><div class="lo-ayar"><div><b>Taban:</b> <button data-k="a" data-d="-1">−</button><b id="bzA"></b><button data-k="a" data-d="1">+</button></div><div><b>Yükseklik:</b> <button data-k="b" data-d="-1">−</button><b id="bzB"></b><button data-k="b" data-d="1">+</button></div></div><div class="aci-actions"><button class="btn btn-yellow" id="bzOk">✓ Kontrol Et</button></div>`;
    ciz();
    kutu.querySelectorAll('[data-k]').forEach(bt => bt.addEventListener('click', () => { if (bitti) return; if (bt.dataset.k === 'a') a = Math.max(1, Math.min(14, a + +bt.dataset.d)); else b = Math.max(1, Math.min(10, b + +bt.dataset.d)); ciz(); }));
    kutu.querySelector('#bzOk').addEventListener('click', () => {
      if (bitti) return; bitti = true; kutu.querySelectorAll('button').forEach(x => { x.disabled = true; });
      const ok = a === w * k && b === h * k;
      bitir(ok, ok ? '' : `Benzerlik oranı ${k} ise iki kenar da ${k} katına çıkar: ${w * k} × ${h * k}.`);
    });
  };

  const S = [
    () => { const w = rnd(2, 4), h = rnd(1, 3), k = sec([2, 3]); if (w * k > 14 || h * k > 10) return S[0](); return { tip: 'ozel', soru: `Dikdörtgeni <b>benzerlik oranı ${k}</b> olacak şekilde büyüt. Turuncu dikdörtgenin kenarlarını ayarla.`, kur: buyutec(w, h, k), aciklama: 'Benzer çokgenlerde karşılıklı kenarların oranı eşittir, açılar aynı kalır.' }; },
    () => { const w = rnd(2, 5), h = rnd(2, 4), k = sec([2, 3]); return { tip: 'sayi', soru: `İki dikdörtgen benzerdir. Büyük dikdörtgenin <b>yüksekliği</b> (x) kaç birimdir?`, gorsel: sahne((w + w * k) * U + 90, h * k * U + 40, dik(w, h, 10, 10, 'bz-a', [w, h]) + dik(w * k, h * k, w * U + 60, 10, 'bz-b', [w * k, 'x'])), cevap: h * k, aciklama: `Oran = ${w * k} ÷ ${w} = ${k}. x = ${h} × ${k} = ${h * k}` }; },
    () => { const k = sec([2, 3]); return { tip: 'secim', soru: 'Benzer iki dik üçgenin <b>benzerlik oranı</b> (büyük ÷ küçük) kaçtır?', gorsel: sahne((3 + 3 * k) * U + 80, 4 * k * U + 40, ucgenCiz(1, 30, 10 + (k - 1) * 4 * U, 'bz-a', ['3', '4']) + ucgenCiz(k, 3 * U + 80, 10, 'bz-b', [3 * k, 4 * k])), ...temaSecenek(String(k), [String(k + 1), `1/${k}`, String(3 * k), String(k * k)], v => (v.includes('/') ? kes(...v.split('/')) : v)), aciklama: `Karşılık gelen kenarlar: ${3 * k} ÷ 3 = ${4 * k} ÷ 4 = ${k}` }; },
    () => { const D = [['Aynı biçimde ve aynı büyüklükte', 'Eş'], ['Aynı biçimde, farklı büyüklükte', 'Benzer'], ['Farklı biçimde', 'Ne eş ne benzer']]; const t = rnd(0, 2);
      const w = 3, h = 2, ic = t === 0 ? dik(w, h, 10, 10, 'bz-a') + dik(w, h, w * U + 50, 10, 'bz-b') : t === 1 ? dik(w, h, 10, 10, 'bz-a') + dik(w * 2, h * 2, w * U + 50, 10, 'bz-b') : dik(w, h, 10, 10, 'bz-a') + dik(5, 2, w * U + 50, 10, 'bz-b');
      return { tip: 'secim', soru: 'İki dikdörtgen arasındaki ilişki nedir?', gorsel: sahne(w * U + 50 + 6 * U + 20, 4 * U + 30, ic), secenekler: D.map(d => d[1]), dogru: t, aciklama: 'Eş şekiller aynı biçim ve büyüklükte; benzer şekillerde kenarlar aynı oranda büyür/küçülür, açılar eşittir. Eş şekiller aynı zamanda benzerdir (oran 1).' }; },
    () => ({ tip: 'secim', soru: 'Benzer iki çokgen için aşağıdakilerden hangisi <b>her zaman doğrudur</b>?', ...temaSecenek('Karşılıklı açılarının ölçüleri eşittir.', ['Kenar uzunlukları eşittir.', 'Alanları eşittir.', 'Çevreleri eşittir.']), aciklama: 'Benzerlikte açılar korunur; kenarlar aynı oranda değişir.' }),
    () => { const a = rnd(2, 6), k = sec([2, 3, 4]); return { tip: 'sayi', soru: `Benzerlik oranı <b>${k}</b> olan iki kareden küçüğünün kenarı <b>${a} cm</b> ise büyüğünün <b>çevresi</b> kaç cm’dir?`, cevap: 4 * a * k, birim: 'cm', aciklama: `Büyük karenin kenarı ${a} × ${k} = ${a * k}; çevresi 4 × ${a * k} = ${4 * a * k}` }; },
    () => { const w = rnd(3, 6), h = rnd(2, 4), k = sec([2, 3]); const dogru = `${w * k} × ${h * k}`;
      return { tip: 'secim', soru: `<b>${w} × ${h}</b> boyutlarındaki dikdörtgene benzer olan dikdörtgen hangisidir?`, ...temaSecenek(dogru, [`${w * k} × ${h + k}`, `${w + k} × ${h + k}`, `${w * k} × ${h}`]), aciklama: `İki kenar da aynı sayıyla (${k}) çarpılmalı. Kenarlara aynı sayıyı <b>eklemek</b> benzer şekil vermez.` }; },
  ];

  temaOyunu({
    siniflar: [8], unvan: 'Benzerlik ustası!',
    not: () => '<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🔍</span><p><b>Eş</b>: aynı biçim, aynı büyüklük. <b>Benzer</b>: aynı biçim; karşılıklı kenarlar <mark>aynı oranda</mark>, karşılıklı açılar eşit.</p></div>',
    uret: () => temaKaristir(S, 7),
    kural: () => 'Benzerlikte kenarlar çarpılır, eklenmez; açılar hiç değişmez.',
  });
})();
