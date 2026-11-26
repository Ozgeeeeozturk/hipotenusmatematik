/* Üçgenin Elemanları: kenarortay, açıortay, yükseklik (7); üçgen eşitsizliği, kenar-açı ilişkisi, Pisagor (8) */
(function () {
  const { rnd, sec } = R_;
  const B = [40, 190], C = [320, 190];
  const ucgenA = () => { const ax = sec([rnd(85, 125), rnd(235, 275)]); return [ax, rnd(40, 70)]; };
  const uz = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const Dnokta = (A, tur) => {
    if (tur === 'kenarortay') return [(B[0] + C[0]) / 2, B[1]];
    if (tur === 'yükseklik') return [A[0], B[1]];
    const ab = uz(A, B), ac = uz(A, C); return [B[0] + (C[0] - B[0]) * ab / (ab + ac), B[1]];
  };
  function cizim(A, tur, o = {}) {
    const D = Dnokta(A, tur);
    let s = `<svg viewBox="0 0 360 225" class="ue-svg" role="img" aria-label="ABC üçgeni"><polygon points="${A} ${B} ${C}" class="ue-ucgen"/>`;
    if (!o.secenek) {
      s += `<line x1="${A[0]}" y1="${A[1]}" x2="${D[0]}" y2="${D[1]}" class="ue-el"/>`;
      if (tur === 'kenarortay') { const m1 = (B[0] + D[0]) / 2, m2 = (D[0] + C[0]) / 2; s += `<line x1="${m1}" y1="${B[1] - 7}" x2="${m1}" y2="${B[1] + 7}" class="ue-cent"/><line x1="${m2}" y1="${B[1] - 7}" x2="${m2}" y2="${B[1] + 7}" class="ue-cent"/>`; }
      if (tur === 'yükseklik') s += `<polyline points="${D[0]},${D[1] - 11} ${D[0] + 11},${D[1] - 11} ${D[0] + 11},${D[1]}" class="ue-dik"/>`;
      if (tur === 'açıortay') {
        const a1 = Math.atan2(B[1] - A[1], B[0] - A[0]), a2 = Math.atan2(D[1] - A[1], D[0] - A[0]), a3 = Math.atan2(C[1] - A[1], C[0] - A[0]);
        const yay = (u, v, r) => `<path d="M${A[0] + r * Math.cos(u)},${A[1] + r * Math.sin(u)} A${r},${r} 0 0 ${v > u ? 1 : 0} ${A[0] + r * Math.cos(v)},${A[1] + r * Math.sin(v)}" class="ue-yay"/>`;
        s += yay(Math.min(a1, a2), Math.max(a1, a2), 30) + yay(Math.min(a2, a3), Math.max(a2, a3), 30);
      }
      s += `<circle cx="${D[0]}" cy="${D[1]}" r="4" fill="#2D2440"/><text x="${D[0]}" y="${D[1] + 22}" text-anchor="middle" class="ue-ad">D</text>`;
    } else {
      o.secenek.forEach(([x], i) => { s += `<circle cx="${x}" cy="${B[1]}" r="6" class="ue-aday"/><text x="${x}" y="${B[1] + 24}" text-anchor="middle" class="ue-ad">${i + 1}</text>`; });
    }
    s += `<text x="${A[0]}" y="${A[1] - 10}" text-anchor="middle" class="ue-ad">A</text><text x="${B[0] - 14}" y="${B[1] + 6}" class="ue-ad">B</text><text x="${C[0] + 6}" y="${C[1] + 6}" class="ue-ad">C</text>`;
    return s + '</svg>';
  }
  const TUR = ['kenarortay', 'açıortay', 'yükseklik'];
  const TANIM = { kenarortay: 'Kenarortay, köşeyi karşı kenarın <b>orta noktasına</b> birleştirir (BD = DC).', açıortay: 'Açıortay, köşedeki açıyı <b>iki eş açıya</b> böler.', yükseklik: 'Yükseklik, köşeden karşı kenara çizilen <b>dik</b> doğru parçasıdır.' };
  const BUYUK = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

  // ---- 7. sınıf ----
  const S7 = [
    () => { const A = ucgenA(), t = sec(TUR); return { tip: 'secim', soru: 'Şekilde A köşesinden çizilen <b>[AD]</b> hangisidir?', gorsel: cizim(A, t), secenekler: ['Kenarortay', 'Açıortay', 'Yükseklik'], dogru: TUR.indexOf(t), aciklama: TANIM[t] }; },
    () => { const A = ucgenA(), t = sec(TUR); return { tip: 'secim', soru: 'Şekilde A köşesinden çizilen <b>[AD]</b> hangisidir?', gorsel: cizim(A, t), secenekler: ['Kenarortay', 'Açıortay', 'Yükseklik'], dogru: TUR.indexOf(t), aciklama: TANIM[t] }; },
    () => { const A = ucgenA(), t = sec(['kenarortay', 'yükseklik']); const adaylar = shuffle(TUR.map(x => Dnokta(A, x)).concat([[A[0] < 180 ? 290 : 70, B[1]]]));
      const d = Dnokta(A, t); const i = adaylar.findIndex(p => Math.abs(p[0] - d[0]) < 0.5);
      return { tip: 'secim', soru: `A köşesinden çizilen <b>${t}</b>, BC kenarını hangi numaralı noktada keser?`, gorsel: cizim(A, t, { secenek: adaylar }), secenekler: ['1', '2', '3', '4'], dogru: i, aciklama: TANIM[t] }; },
    () => ({ tip: 'secim', soru: 'Bir üçgenin kenarortayı karşı kenarı nasıl böler?', ...temaSecenek('İki eş parçaya', ['Biri diğerinin 2 katı olan iki parçaya', 'Dik açıyla, ama eşit olmayan parçalara', 'Hiç bölmez']), aciklama: TANIM.kenarortay }),
    () => ({ tip: 'secim', soru: '<b>Geniş açılı</b> bir üçgende hangi eleman üçgenin <b>dışında</b> kalabilir?', gorsel: `<svg viewBox="0 0 360 200" class="ue-svg"><line x1="40" y1="170" x2="80" y2="170" class="ue-uzanti"/><polygon points="40,50 80,170 320,170" class="ue-ucgen"/><line x1="40" y1="50" x2="40" y2="170" class="ue-el"/><polyline points="40,159 51,159 51,170" class="ue-dik"/><text x="30" y="45" class="ue-ad">A</text><text x="80" y="192" class="ue-ad">B</text><text x="322" y="192" class="ue-ad">C</text></svg>`,
      ...temaSecenek('Yükseklik', ['Kenarortay', 'Açıortay', 'Kenar']), aciklama: 'Geniş açılı üçgende bazı yükseklikler, kenarın <b>uzantısına</b> dik inildiği için üçgenin dışında kalır.' }),
    () => { const t = sec(TUR); return { tip: 'secim', soru: `“${{ kenarortay: 'Köşeyi karşı kenarın orta noktasına birleştiren doğru parçası', açıortay: 'Bir açıyı iki eş açıya ayıran ışın', yükseklik: 'Köşeden karşı kenara (ya da uzantısına) çizilen dikme' }[t]}” hangisinin tanımıdır?`, secenekler: ['Kenarortay', 'Açıortay', 'Yükseklik'], dogru: TUR.indexOf(t), aciklama: TANIM[t] }; },
  ];

  // ---- 8. sınıf ----
  const PIS = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]];
  const dikUcgen = (a, b, c, bilinmeyen) => `<svg viewBox="0 0 300 200" class="ue-svg"><polygon points="40,170 260,170 40,40" class="ue-ucgen"/><polyline points="40,156 54,156 54,170" class="ue-dik"/>
    <text x="150" y="192" text-anchor="middle" class="ue-ad">${bilinmeyen === 'b' ? 'x' : b}</text><text x="22" y="110" text-anchor="middle" class="ue-ad">${bilinmeyen === 'a' ? 'x' : a}</text><text x="162" y="96" text-anchor="middle" class="ue-ad">${bilinmeyen === 'c' ? 'x' : c}</text></svg>`;
  const S8 = [
    () => { const a = rnd(3, 9), b = rnd(3, 9); const lo = Math.abs(a - b), hi = a + b; const dogru = rnd(lo + 1, hi - 1);
      return { tip: 'secim', soru: `Kenar uzunlukları <b>${a} cm</b>, <b>${b} cm</b> ve <b>x cm</b> olan bir üçgende x aşağıdakilerden hangisi <b>olabilir</b>?`, ...temaSecenek(String(dogru), [String(hi), String(hi + 1), String(lo), String(hi + 3)].filter(v => +v > 0)),
        aciklama: `Üçgen eşitsizliği: ${a} − ${b} farkının mutlak değeri < x < ${a} + ${b} → <b>${lo} < x < ${hi}</b>` }; },
    () => { const D = [[3, 4, 8, false], [5, 6, 10, true], [2, 3, 5, false], [7, 8, 9, true], [4, 4, 9, false], [6, 9, 12, true]]; const [a, b, c, ok] = sec(D);
      return { tip: 'secim', soru: `Kenar uzunlukları <b>${a}, ${b} ve ${c}</b> birim olan doğru parçalarıyla bir üçgen oluşturulabilir mi?`, secenekler: ['Evet, oluşturulabilir', 'Hayır, oluşturulamaz'], dogru: ok ? 0 : 1,
        aciklama: `En uzun kenar diğer iki kenarın toplamından küçük olmalı: ${a} + ${b} = ${a + b} ${a + b > c ? '>' : '≤'} ${c}` }; },
    () => { const [a, b] = [rnd(3, 8), rnd(3, 8)]; const n = Math.min(a, b) * 2 - 1;
      return { tip: 'sayi', soru: `Kenar uzunlukları <b>${a}</b>, <b>${b}</b> ve <b>x</b> birim olan üçgende x’in alabileceği kaç farklı <b>tam sayı</b> değeri vardır?`, cevap: n, aciklama: `${Math.abs(a - b)} < x < ${a + b} → x: ${Math.abs(a - b) + 1}, ..., ${a + b - 1} → ${n} değer` }; },
    () => { const ac = shuffle([rnd(30, 50), rnd(55, 70)]); ac.push(180 - ac[0] - ac[1]); if (new Set(ac).size < 3) return S8[3](); const k = ['BC', 'AC', 'AB']; const enb = ac.indexOf(Math.max(...ac));
      return { tip: 'secim', soru: `ABC üçgeninde <b>m(A) = ${ac[0]}°</b>, <b>m(B) = ${ac[1]}°</b>, <b>m(C) = ${ac[2]}°</b>’dir. En uzun kenar hangisidir?`, secenekler: k, dogru: enb, aciklama: `En büyük açının karşısında en uzun kenar bulunur. En büyük açı ${'ABC'[enb]} (${ac[enb]}°) → karşısındaki kenar <b>${k[enb]}</b>` }; },
    () => { const [a, b, c] = sec(PIS); return { tip: 'sayi', soru: 'Dik üçgende dik kenarlar verilmiştir. Hipotenüs (x) kaç birimdir?', gorsel: dikUcgen(a, b, c, 'c'), cevap: c, aciklama: `Pisagor bağıntısı: x² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} → x = ${c}` }; },
    () => { const [a, b, c] = sec(PIS); return { tip: 'sayi', soru: 'Dik üçgende hipotenüs ve bir dik kenar verilmiştir. x kaç birimdir?', gorsel: dikUcgen(a, b, c, 'b'), cevap: b, aciklama: `${c}² = ${a}² + x² → x² = ${c * c} − ${a * a} = ${b * b} → x = ${b}` }; },
  ];

  temaOyunu({
    siniflar: [7, 8],
    unvan: 'Üçgen ustası!',
    not: g => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🔺</span><p>${g === 7
      ? '<b>Kenarortay</b> orta noktaya, <b>açıortay</b> açıyı ikiye bölerek, <b>yükseklik</b> dik açıyla karşı kenara iner.'
      : '<b>Üçgen eşitsizliği</b>: iki kenarın farkı < üçüncü kenar < toplamı. <b>Pisagor</b>: a² + b² = c² (c: hipotenüs)'}</p></div>`,
    uret: g => temaKaristir(g === 7 ? S7 : S8, 7),
    kural: g => (g === 7 ? 'Eş çentik → kenarortay, eş yaylar → açıortay, dik işareti → yükseklik.' : 'En büyük açının karşısında en uzun kenar vardır. Hipotenüs² = dik kenarların karelerinin toplamı.'),
  });
})();
