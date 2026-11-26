/* Cebir Karoları: cebirsel ifadeleri modelleme, çarpma, özdeşlikler, çarpanlara ayırma (8. sınıf) */
(function () {
  const { rnd, sec } = R_;
  const ter = (k, v) => (k === 0 ? '' : `${k === 1 ? '' : k}${v}`);
  const ifade = (a, b, c) => { // ax² + bx + c
    const p = []; if (a) p.push(ter(a, 'x²')); if (b) p.push((b < 0 ? '− ' : p.length ? '+ ' : '') + ter(Math.abs(b), 'x')); if (c) p.push((c < 0 ? '− ' : p.length ? '+ ' : '') + Math.abs(c));
    return p.join(' ') || '0';
  };
  const S_ = 54, X = 54, B = 16; // x² karo boyu, x uzunluğu, 1 birim

  // Karolar: a adet x², b adet x, c adet 1
  function karolar(a, b, c) {
    let s = '', x = 6;
    for (let i = 0; i < a; i++) { s += `<rect x="${x}" y="6" width="${X}" height="${X}" rx="4" class="ck-x2"/><text x="${x + X / 2}" y="${6 + X / 2 + 5}" text-anchor="middle" class="ck-t">x²</text>`; x += X + 6; }
    for (let i = 0; i < b; i++) { s += `<rect x="${x}" y="6" width="${B}" height="${X}" rx="3" class="ck-x"/><text x="${x + B / 2}" y="${6 + X / 2 + 4}" text-anchor="middle" class="ck-t k">x</text>`; x += B + 5; }
    for (let i = 0; i < c; i++) { const yy = 6 + (i % 3) * (B + 3); s += `<rect x="${x}" y="${yy}" width="${B}" height="${B}" rx="3" class="ck-1"/>`; if (i % 3 === 2 || i === c - 1) x += B + 4; }
    return `<svg viewBox="0 0 ${x + 6} ${X + 12}" class="ck-svg" role="img" aria-label="Cebir karoları">${s}</svg>`;
  }
  // (x + p)(x + q) dikdörtgen alan modeli
  function alan(p, q) {
    const W = X + p * B, H = X + q * B, o = 30;
    let s = `<svg viewBox="0 0 ${W + o + 10} ${H + o + 10}" class="ck-svg alan" role="img" aria-label="Alan modeli">`;
    s += `<text x="${o + X / 2}" y="18" text-anchor="middle" class="ck-k">x</text>${p ? `<text x="${o + X + p * B / 2}" y="18" text-anchor="middle" class="ck-k">${p}</text>` : ''}`;
    s += `<text x="12" y="${o + X / 2 + 5}" text-anchor="middle" class="ck-k">x</text>${q ? `<text x="12" y="${o + X + q * B / 2 + 5}" text-anchor="middle" class="ck-k">${q}</text>` : ''}`;
    s += `<rect x="${o}" y="${o}" width="${X}" height="${X}" class="ck-x2"/>`;
    for (let i = 0; i < p; i++) s += `<rect x="${o + X + i * B}" y="${o}" width="${B}" height="${X}" class="ck-x"/>`;
    for (let j = 0; j < q; j++) s += `<rect x="${o}" y="${o + X + j * B}" width="${X}" height="${B}" class="ck-x"/>`;
    for (let i = 0; i < p; i++) for (let j = 0; j < q; j++) s += `<rect x="${o + X + i * B}" y="${o + X + j * B}" width="${B}" height="${B}" class="ck-1"/>`;
    return s + '</svg>';
  }

  // Karoları seçerek ifadeyi kur
  const kur = (a, b, c) => (kutu, bitir) => {
    const n = { a: 0, b: 0, c: 0 }; let bitti = false;
    const ciz = () => { kutu.querySelector('.ck-tezgah').innerHTML = n.a + n.b + n.c ? karolar(n.a, n.b, n.c) : '<p class="ck-bos">Karo eklemek için düğmelere dokun</p>'; kutu.querySelector('#ckI').textContent = ifade(n.a, n.b, n.c); };
    kutu.innerHTML = `<div class="lo-ayar">${[['a', 'x²'], ['b', 'x'], ['c', '1']].map(([k, t]) => `<div><b>${t}</b> <button data-k="${k}" data-d="-1">−</button><b id="ck${k}">0</b><button data-k="${k}" data-d="1">+</button></div>`).join('')}</div>
      <div class="ck-tezgah"></div><p class="tz-denk" id="ckI">0</p><div class="aci-actions"><button class="btn btn-yellow" id="ckOk">✓ Kontrol Et</button></div>`;
    ciz();
    kutu.querySelectorAll('[data-k]').forEach(bt => bt.addEventListener('click', () => { if (bitti) return; const k = bt.dataset.k; n[k] = Math.max(0, Math.min(9, n[k] + +bt.dataset.d)); kutu.querySelector('#ck' + k).textContent = n[k]; ciz(); }));
    kutu.querySelector('#ckOk').addEventListener('click', () => {
      if (bitti) return; bitti = true; kutu.querySelectorAll('button').forEach(x => { x.disabled = true; });
      const ok = n.a === a && n.b === b && n.c === c;
      bitir(ok, ok ? '' : `Gereken: ${a} tane x², ${b} tane x ve ${c} tane 1 karosu.`);
    });
  };

  const S = [
    () => { const a = rnd(1, 2), b = rnd(1, 4), c = rnd(1, 6); return { tip: 'ozel', soru: `<span class="tz-buyuk">${ifade(a, b, c)}</span> ifadesini cebir karolarıyla modelle.`, gorsel: `<div class="ck-lejant">${karolar(1, 1, 1)}<span>x² karosu · x karosu · 1 karosu</span></div>`, kur: kur(a, b, c), aciklama: 'Büyük kare x², uzun şerit x, küçük kare 1’i gösterir.' }; },
    () => { const a = rnd(1, 2), b = rnd(1, 5), c = rnd(1, 7); return { tip: 'secim', soru: 'Cebir karolarıyla modellenen ifade hangisidir?', gorsel: karolar(a, b, c), ...temaSecenek(ifade(a, b, c), [ifade(b, a, c), ifade(a, c, b), ifade(0, a + b, c), ifade(a, b, c + 1)]), aciklama: `${a} tane x², ${b} tane x, ${c} tane 1 → ${ifade(a, b, c)}` }; },
    () => { const p = rnd(1, 4), q = rnd(1, 4); return { tip: 'secim', soru: `Alan modeline göre <span class="tz-buyuk">(x + ${p})(x + ${q})</span> çarpımı hangisidir?`, gorsel: alan(p, q), ...temaSecenek(ifade(1, p + q, p * q), [ifade(1, p * q, p + q), ifade(1, 0, p * q), ifade(1, p + q, p + q), ifade(2, p + q, p * q)]), aciklama: `Parçaları topla: 1 tane x², ${p + q} tane x (${p} + ${q}), ${p * q} tane 1 (${p} × ${q}) → ${ifade(1, p + q, p * q)}` }; },
    () => { const a = rnd(2, 5), b = rnd(1, 6), k = rnd(2, 4); return { tip: 'secim', soru: `<span class="tz-buyuk">${k}(${a}x + ${b})</span> çarpımının sonucu hangisidir?`, ...temaSecenek(ifade(0, k * a, k * b), [ifade(0, k * a, b), ifade(0, a, k * b), ifade(0, k + a, k + b)]), aciklama: `Dağılma özelliği: ${k} · ${a}x + ${k} · ${b} = ${ifade(0, k * a, k * b)}` }; },
    () => { const a = rnd(1, 6), t = sec(['+', '−']); const r = t === '+' ? ifade(1, 2 * a, a * a) : ifade(1, -2 * a, a * a);
      return { tip: 'secim', soru: `<span class="tz-buyuk">(x ${t} ${a})²</span> ifadesinin eşiti hangisidir?`, gorsel: t === '+' ? alan(a, a) : '', ...temaSecenek(r, [ifade(1, 0, a * a), t === '+' ? ifade(1, a, a * a) : ifade(1, -a, a * a), t === '+' ? ifade(1, -2 * a, a * a) : ifade(1, 2 * a, a * a), ifade(1, 0, -a * a)]),
        aciklama: `Tam kare özdeşliği: (a ${t} b)² = a² ${t} 2ab + b² → ${r}. Dikkat: (x ${t} ${a})² ≠ x² + ${a * a}!` }; },
    () => { const a = rnd(2, 9); return { tip: 'secim', soru: `<span class="tz-buyuk">x² − ${a * a}</span> ifadesinin çarpanlarına ayrılmış hâli hangisidir?`, ...temaSecenek(`(x − ${a})(x + ${a})`, [`(x − ${a})²`, `(x + ${a})²`, `(x − ${a * a})(x + 1)`]), aciklama: `İki kare farkı özdeşliği: a² − b² = (a − b)(a + b) → x² − ${a}² = (x − ${a})(x + ${a})` }; },
    () => { const p = rnd(1, 5), q = rnd(1, 5); if (p === q) return S[6](); return { tip: 'secim', soru: `<span class="tz-buyuk">${ifade(1, p + q, p * q)}</span> ifadesinin çarpanlarına ayrılmış hâli hangisidir?`, gorsel: alan(p, q), ...temaSecenek(`(x + ${Math.min(p, q)})(x + ${Math.max(p, q)})`, [`(x + 1)(x + ${p * q})`, `(x + ${p + q})(x + 1)`, `(x − ${Math.min(p, q)})(x − ${Math.max(p, q)})`, `x(x + ${p + q + p * q})`]), aciklama: `Çarpımı ${p * q}, toplamı ${p + q} olan iki sayı: ${p} ve ${q}. Alan modelindeki dikdörtgenin kenarları (x + ${p}) ve (x + ${q})` }; },
    () => { const k = rnd(2, 6), a = rnd(1, 5), b = rnd(1, 6); return { tip: 'secim', soru: `<span class="tz-buyuk">${ifade(0, k * a, k * b)}</span> ifadesini ortak çarpan parantezine al.`, ...temaSecenek(`${k}(${ifade(0, a, b)})`, [`${k}(${ifade(0, k * a, b)})`, `${a}(${ifade(0, k, k * b)})`.replace('(1x', '(x'), `x(${k * a} + ${k * b})`]), aciklama: `${k * a} ve ${k * b} sayılarının ortak çarpanı ${k}: ${k}(${ifade(0, a, b)})` }; },
  ];

  temaOyunu({
    siniflar: [8], unvan: 'Cebir ustası!',
    not: () => '<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🟪</span><p><b>(a + b)² = a² + 2ab + b²</b> &nbsp;·&nbsp; <b>(a − b)² = a² − 2ab + b²</b> &nbsp;·&nbsp; <b>a² − b² = (a − b)(a + b)</b></p></div>',
    uret: () => temaKaristir(S, 8),
    kural: () => '(x + a)² hiçbir zaman x² + a² değildir; ortadaki 2ax terimini unutma!',
  });
})();
