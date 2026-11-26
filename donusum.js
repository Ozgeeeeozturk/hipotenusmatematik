/* Yansıt-Ötele: yansıma dönüşümü (7), öteleme, yansıma ve koordinat düzleminde dönüşümler (8) */
(function () {
  const { rnd, sec } = R_;
  const C = 26;
  const ksay = n => (n < 0 ? `−${-n}` : `${n}`);
  const nk = ([x, y]) => `(${ksay(x)}, ${ksay(y)})`;

  // Izgara: g = {x0, x1, y0, y1, eksen} — matematik koordinatları (y yukarı)
  function izgara(g, icerik, o = {}) {
    const W = (g.x1 - g.x0) * C, H = (g.y1 - g.y0) * C;
    const X = x => (x - g.x0) * C, Y = y => (g.y1 - y) * C;
    let s = `<svg viewBox="-14 -14 ${W + 28} ${H + 28}" class="dn-svg${o.mini ? ' mini' : ''}" ${o.id ? `id="${o.id}"` : ''} role="img" aria-label="Kareli zemin">`;
    for (let x = g.x0; x <= g.x1; x++) s += `<line x1="${X(x)}" y1="0" x2="${X(x)}" y2="${H}" class="dn-iz"/>`;
    for (let y = g.y0; y <= g.y1; y++) s += `<line x1="0" y1="${Y(y)}" x2="${W}" y2="${Y(y)}" class="dn-iz"/>`;
    if (g.eksen) {
      s += `<line x1="0" y1="${Y(0)}" x2="${W}" y2="${Y(0)}" class="dn-eksen"/><line x1="${X(0)}" y1="0" x2="${X(0)}" y2="${H}" class="dn-eksen"/>`;
      if (!o.mini) {
        for (let x = g.x0; x <= g.x1; x++) if (x) s += `<text x="${X(x)}" y="${Y(0) + 14}" text-anchor="middle" class="dn-no">${ksay(x)}</text>`;
        for (let y = g.y0; y <= g.y1; y++) if (y) s += `<text x="${X(0) - 5}" y="${Y(y) + 4}" text-anchor="end" class="dn-no">${ksay(y)}</text>`;
        s += `<text x="${W + 6}" y="${Y(0) + 4}" class="dn-ad">x</text><text x="${X(0) + 5}" y="-4" class="dn-ad">y</text>`;
      }
    }
    return s + icerik(X, Y) + '</svg>';
  }
  const sekil = (pts, sinif) => (X, Y) => `<polygon points="${pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" class="${sinif}"/>`;
  const nokta = ([x, y], ad, sinif = 'dn-n') => (X, Y) => `<circle cx="${X(x)}" cy="${Y(y)}" r="6" class="${sinif}"/>${ad ? `<text x="${X(x) + 8}" y="${Y(y) - 7}" class="dn-et">${ad}</text>` : ''}`;
  const ayna = (d, g) => (X, Y) => (d.t === 'x'
    ? `<line x1="${X(d.v)}" y1="-8" x2="${X(d.v)}" y2="${(g.y1 - g.y0) * C + 8}" class="dn-ayna"/><text x="${X(d.v) + 4}" y="-2" class="dn-et ayna">d</text>`
    : `<line x1="-8" y1="${Y(d.v)}" x2="${(g.x1 - g.x0) * C + 8}" y2="${Y(d.v)}" class="dn-ayna"/><text x="${(g.x1 - g.x0) * C + 2}" y="${Y(d.v) - 5}" class="dn-et ayna">d</text>`);
  const yans = (p, d) => (d.t === 'x' ? [2 * d.v - p[0], p[1]] : [p[0], 2 * d.v - p[1]]);
  const birlestir = (...f) => (X, Y) => f.map(fn => fn(X, Y)).join('');

  // Rastgele küçük çokgen (3-4 köşe)
  function rastSekil(x0, y0) {
    const tip = sec([[[0, 0], [2, 0], [0, 2]], [[0, 0], [3, 0], [3, 1], [0, 2]], [[0, 0], [1, 0], [1, 2], [0, 3]], [[0, 0], [2, 1], [0, 3]], [[0, 0], [2, 0], [2, 1], [1, 2]]]);
    return tip.map(([x, y]) => [x + x0, y + y0]);
  }

  // Dokunarak nokta işaretleme etkinliği
  const noktaKoy = (g, ciz, hedef, aciklama) => (kutu, bitir) => {
    let sec_ = null, bitti = false;
    const yeni = () => izgara(g, birlestir(ciz, ...(sec_ ? [nokta(sec_, '', 'dn-sec')] : [])), { id: 'dnTik' });
    kutu.innerHTML = `<div class="dn-tik">${yeni()}</div><p class="dn-ipucu">👆 Görüntü noktasını işaretlemek için ızgarada bir kesişim noktasına dokun.</p><div class="aci-actions"><button class="btn btn-yellow" id="dnKontrol" disabled>✓ Kontrol Et</button></div>`;
    const kap = kutu.querySelector('.dn-tik');
    kap.addEventListener('click', e => {
      if (bitti) return;
      const svg = kap.querySelector('svg'), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      const x = Math.round(p.x / C) + g.x0, y = g.y1 - Math.round(p.y / C);
      if (x < g.x0 || x > g.x1 || y < g.y0 || y > g.y1) return;
      sec_ = [x, y]; kap.innerHTML = yeni(); kutu.querySelector('#dnKontrol').disabled = false;
    });
    kutu.querySelector('#dnKontrol').addEventListener('click', () => {
      if (!sec_ || bitti) return; bitti = true;
      const ok = sec_[0] === hedef[0] && sec_[1] === hedef[1];
      kap.innerHTML = izgara(g, birlestir(ciz, nokta(sec_, '', ok ? 'dn-sec ok' : 'dn-sec yanlis'), ...(ok ? [] : [nokta(hedef, '', 'dn-dogru')])));
      kutu.querySelector('#dnKontrol').disabled = true;
      bitir(ok, ok ? aciklama : `Doğru yer yeşil nokta${g.eksen ? ' ' + nk(hedef) : ''}. ${aciklama}`);
    });
  };

  // Seçenekli görüntü sorusu (4 küçük ızgara)
  function goruntuSec(g, temel, dogru, yanlislar, soru, aciklama) {
    const ops = shuffle([[dogru, 1], ...yanlislar.map(y => [y, 0])]);
    return { tip: 'secim', soru, gorsel: izgara(g, temel),
      secenekler: ops.map(([pts]) => izgara(g, birlestir(temel, sekil(pts, 'dn-g')), { mini: true })), dogru: ops.findIndex(o => o[1]), aciklama };
  }

  // ---- 7. sınıf: yansıma ----
  const G7 = { x0: 0, x1: 12, y0: 0, y1: 8 };
  const S7 = [
    () => { const d = { t: 'x', v: 6 }, pts = rastSekil(rnd(1, 2), rnd(2, 4)); const im = pts.map(p => yans(p, d));
      const kay = pts.map(([x, y]) => [x + 6, y]), uzak = pts.map(p => [2 * d.v + 1 - p[0], p[1]]), ters = pts.map(([x, y]) => [x + 6, 8 - y]);
      return goruntuSec(G7, birlestir(sekil(pts, 'dn-s'), ayna(d, G7)), im, [kay, uzak, ters].filter(z => z.every(([x, y]) => x >= 0 && x <= 12 && y >= 0 && y <= 8)), 'Şeklin <b>d doğrusuna göre yansıması</b> hangisidir?', 'Yansımada her nokta, aynaya olan uzaklığı kadar aynanın öbür tarafına geçer; şekil <b>ters döner</b> (aynadaki görüntü gibi).'); },
    () => { const d = { t: 'x', v: rnd(5, 7) }, A = [rnd(1, d.v - 1), rnd(1, 7)];
      return { tip: 'ozel', soru: `<b>A</b> noktasının <b>d doğrusuna göre yansımasını</b> işaretle.`, kur: noktaKoy(G7, birlestir(ayna(d, G7), nokta(A, 'A')), yans(A, d), `A, d’ye ${d.v - A[0]} birim uzakta; görüntüsü de d’nin öbür yanında ${d.v - A[0]} birim uzakta olur.`) }; },
    () => { const d = { t: 'y', v: 4 }, A = [rnd(1, 11), rnd(5, 7)];
      return { tip: 'ozel', soru: `<b>A</b> noktasının <b>yatay d doğrusuna göre yansımasını</b> işaretle.`, kur: noktaKoy(G7, birlestir(ayna(d, G7), nokta(A, 'A')), yans(A, d), `A, d’nin ${A[1] - 4} birim üstünde; görüntüsü ${A[1] - 4} birim altında.`) }; },
    () => ({ tip: 'secim', soru: 'Bir nokta ile yansıması arasındaki doğru parçası, <b>yansıma doğrusunu</b> nasıl keser?', ...temaSecenek('Dik keser ve tam ortasından geçer.', ['Paralel geçer, hiç kesmez.', '45° açıyla keser.', 'Ucundan keser.']), aciklama: 'Yansıma doğrusu, nokta ile görüntüsünü birleştiren doğru parçasının <b>orta dikmesidir</b>.' }),
    () => { const d = { t: 'y', v: 4 }, pts = rastSekil(rnd(2, 7), 5);
      const im = pts.map(p => yans(p, d)), kay = pts.map(([x, y]) => [x, y - 4]), yan = pts.map(([x, y]) => [12 - x, y]);
      return goruntuSec(G7, birlestir(sekil(pts, 'dn-s'), ayna(d, G7)), im, [kay, yan].filter(z => z.every(([x, y]) => x >= 0 && x <= 12 && y >= 0 && y <= 8)), 'Şeklin <b>yatay d doğrusuna göre yansıması</b> hangisidir?', 'Yatay aynada şekil <b>baş aşağı</b> döner; her nokta aynaya olan uzaklığı kadar aşağı geçer.'); },
    () => ({ tip: 'secim', soru: 'Yansıma dönüşümünde aşağıdakilerden hangisi <b>değişir</b>?', ...temaSecenek('Şeklin yönü (sağ-sol ters döner)', ['Kenar uzunlukları', 'Açıların ölçüleri', 'Şeklin alanı']), aciklama: 'Yansımada şeklin boyutu, açıları ve alanı korunur; yalnızca yönü ters döner.' }),
  ];

  // ---- 8. sınıf: öteleme ve yansıma, koordinat düzlemi ----
  const G8 = { x0: -6, x1: 6, y0: -5, y1: 5, eksen: true };
  const yon = (a, b) => `${a ? `${Math.abs(a)} birim ${a > 0 ? 'sağa' : 'sola'}` : ''}${a && b ? ', ' : ''}${b ? `${Math.abs(b)} birim ${b > 0 ? 'yukarı' : 'aşağı'}` : ''}`;
  const S8 = [
    () => { const A = [rnd(-4, 2), rnd(-3, 2)], a = rnd(-2, 4), b = rnd(1, 3); const B = [A[0] + a, A[1] + b]; if (B[0] > 6 || B[0] < -6 || B[1] > 5) return S8[0]();
      return { tip: 'ozel', soru: `<b>A${nk(A)}</b> noktasını <b>${yon(a, b)}</b> ötele. Görüntüsünü işaretle.`, kur: noktaKoy(G8, nokta(A, 'A'), B, `Öteleme: x’e ${ksay(a)}, y’ye ${ksay(b)} eklenir → ${nk(B)}`) }; },
    () => { const A = [rnd(-5, 5), rnd(-4, 4)]; if (!A[0] || !A[1]) return S8[1](); const ek = sec(['x', 'y']); const B = ek === 'x' ? [A[0], -A[1]] : [-A[0], A[1]];
      return { tip: 'secim', soru: `<b>A${nk(A)}</b> noktasının <b>${ek} eksenine göre yansıması</b> hangisidir?`, gorsel: izgara(G8, nokta(A, 'A')), ...temaSecenek(nk(B), [nk([-A[0], -A[1]]), nk([A[1], A[0]]), nk(ek === 'x' ? [-A[0], A[1]] : [A[0], -A[1]])]),
        aciklama: ek === 'x' ? 'x eksenine göre yansımada x aynı kalır, <b>y’nin işareti değişir</b>.' : 'y eksenine göre yansımada y aynı kalır, <b>x’in işareti değişir</b>.' }; },
    () => { const A = [rnd(-4, 3), rnd(1, 4)];
      return { tip: 'ozel', soru: `<b>A${nk(A)}</b> noktasının <b>x eksenine göre yansımasını</b> işaretle.`, kur: noktaKoy(G8, nokta(A, 'A'), [A[0], -A[1]], `x eksenine göre yansıma: (x, y) → (x, −y) = ${nk([A[0], -A[1]])}`) }; },
    () => { const pts = rastSekil(rnd(-5, -3), rnd(-4, 0)), a = rnd(3, 5), b = rnd(-1, 2); const im = pts.map(([x, y]) => [x + a, y + b]); if (im.some(([x, y]) => x > 6 || y > 5 || y < -5)) return S8[3]();
      const ayn = pts.map(([x, y]) => [-x, y]), yanlis = pts.map(([x, y]) => [x + b, y + a]), eksik = pts.map(([x, y]) => [x + a - 1, y + b]), fazla = pts.map(([x, y]) => [x + a, y + b + 1]);
      return goruntuSec(G8, sekil(pts, 'dn-s'), im, shuffle([ayn, yanlis, eksik, fazla]).filter(z => z.every(([x, y]) => x >= -6 && x <= 6 && y >= -5 && y <= 5) && JSON.stringify(z) !== JSON.stringify(im)).slice(0, 3), `Şekil <b>${yon(a, b)}</b> ötelenirse görüntüsü hangisi olur?`, 'Ötelemede şeklin her noktası aynı yönde, aynı miktarda kayar; şeklin yönü <b>değişmez</b>.'); },
    () => { const A = [rnd(-3, 3), rnd(-3, 3)], a = rnd(1, 3); const B = [-(A[0] + a), A[1]];
      return { tip: 'secim', soru: `<b>A${nk(A)}</b> noktası önce <b>${a} birim sağa</b> ötelenip sonra <b>y eksenine göre</b> yansıtılıyor. Son görüntü hangisidir?`, ...temaSecenek(nk(B), [nk([A[0] + a, -A[1]]), nk([-A[0] + a, A[1]]), nk([A[0] + a, A[1]])]), aciklama: `Öteleme: ${nk([A[0] + a, A[1]])}. y eksenine göre yansıma x’in işaretini değiştirir: ${nk(B)}` }; },
    () => ({ tip: 'secim', soru: 'Öteleme dönüşümü için aşağıdakilerden hangisi <b>doğrudur</b>?', ...temaSecenek('Şeklin boyutu, açıları ve yönü değişmez.', ['Şekil ters döner.', 'Şeklin alanı büyür.', 'Şeklin açıları değişir.']), aciklama: 'Öteleme yalnızca şeklin <b>yerini</b> değiştirir.' }),
  ];

  temaOyunu({
    siniflar: [7, 8],
    unvan: 'Dönüşüm ustası!',
    not: g => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🪞</span><p>${g === 7
      ? '<b>Yansıma</b>: her nokta aynaya olan uzaklığı kadar öbür tarafa geçer. Şeklin boyutu korunur, yönü ters döner.'
      : '<b>Öteleme</b>: şekil kayar, yönü değişmez. <b>x eksenine göre yansıma</b>: (x, y) → (x, −y); <b>y eksenine göre</b>: (x, y) → (−x, y)'}</p></div>`,
    uret: g => temaKaristir(g === 7 ? S7 : S8, 7),
    kural: g => (g === 7 ? 'Aynaya uzaklık = görüntünün aynaya uzaklığı.' : 'Öteleme kaydırır, yansıma ters çevirir.'),
  });
})();
