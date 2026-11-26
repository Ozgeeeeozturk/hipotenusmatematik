/* Terazi Dengesi: eşitliğin korunumu (5), bilinmeyen nicelik ve cebirsel ifadeler (6), denklem (7), doğrusal denklemler (8) */
(function () {
  const { rnd, sec, kes, sayi } = R_;
  const isa = n => (n < 0 ? `− ${-n}` : `+ ${n}`);
  const ifade = (a, b) => `${a === 1 ? '' : a}x ${b ? isa(b) : ''}`.trim();

  // ---- Terazi çizimi: öğe = 'x' | 1 | {n: sayı} | {k: 'kutu'} ----
  function kefe(ogeler, cx, y) {
    const w = o => (o === 'x' ? 30 : o === 1 ? 20 : o === 5 ? 30 : 40);
    let s = '', satir = [], satirlar = [], gen = 0;
    ogeler.forEach(o => { if (gen + w(o) + 4 > 132 && satir.length) { satirlar.push(satir); satir = []; gen = 0; } satir.push(o); gen += w(o) + 4; });
    if (satir.length) satirlar.push(satir);
    satirlar.forEach((sr, j) => {
      const top = sr.reduce((a, o) => a + w(o) + 4, -4); let x = cx - top / 2; const yy = y - 4 - j * 32;
      sr.forEach(o => {
        if (o === 'x') s += `<rect x="${x}" y="${yy - 28}" width="30" height="28" rx="6" class="tz-x"/><text x="${x + 15}" y="${yy - 9}" text-anchor="middle" class="tz-xt">x</text>`;
        else if (o === 5) s += `<rect x="${x}" y="${yy - 26}" width="30" height="26" rx="9" class="tz-1"/><text x="${x + 15}" y="${yy - 8}" text-anchor="middle" class="tz-5t">5</text>`;
        else if (o === 1) s += `<circle cx="${x + 10}" cy="${yy - 10}" r="10" class="tz-1"/><text x="${x + 10}" y="${yy - 6}" text-anchor="middle" class="tz-1t">1</text>`;
        else s += `<rect x="${x}" y="${yy - 28}" width="40" height="28" rx="6" class="${o.k ? 'tz-kutu' : 'tz-n'}"/><text x="${x + 20}" y="${yy - 9}" text-anchor="middle" class="tz-nt">${o.k ? '?' : o.n}</text>`;
        x += w(o) + 4;
      });
    });
    return s;
  }
  function terazi(sol, sag, egim = 0) {
    const a = Math.max(-8, Math.min(8, egim)), r = a * Math.PI / 180, L = 120;
    const ly = 70 - Math.sin(r) * L, ry = 70 + Math.sin(r) * L;
    return `<svg viewBox="0 0 360 215" class="tz-svg" role="img" aria-label="Terazi">
      <path d="M180 70 L162 200 L198 200 Z" fill="#B8A6D9"/><rect x="130" y="198" width="100" height="10" rx="5" fill="#7B4FA8"/>
      <line x1="${180 - L}" y1="${ly}" x2="${180 + L}" y2="${ry}" stroke="#7B4FA8" stroke-width="7" stroke-linecap="round"/><circle cx="180" cy="70" r="8" fill="#FFD84D" stroke="#7B4FA8" stroke-width="3"/>
      <line x1="${180 - L}" y1="${ly}" x2="${180 - L}" y2="${ly + 70}" stroke="#9A8BB5" stroke-width="2"/><line x1="${180 + L}" y1="${ry}" x2="${180 + L}" y2="${ry + 70}" stroke="#9A8BB5" stroke-width="2"/>
      <path d="M${180 - L - 66} ${ly + 70} h132 l-12 14 h-108 Z" fill="#E3F8EF" stroke="#2E9E78" stroke-width="3"/>
      <path d="M${180 + L - 66} ${ry + 70} h132 l-12 14 h-108 Z" fill="#E3F8EF" stroke="#2E9E78" stroke-width="3"/>
      ${kefe(sol, 180 - L, ly + 70)}${kefe(sag, 180 + L, ry + 70)}
    </svg>`;
  }
  const ogeler = (x, b) => [...Array(x).fill('x'), ...Array(Math.floor(b / 5)).fill(5), ...Array(b % 5).fill(1)];

  // Etkileşimli denklem çözücü: ax + b = cx + d
  function cozucu(a, b, c, d) {
    return (kutu, bitir) => {
      let L = { x: a, n: b }, R = { x: c, n: d }, adim = 0, bitti = false;
      const yaz = (s) => `${s.x ? (s.x === 1 ? 'x' : s.x + 'x') : ''}${s.x && s.n ? ' + ' : ''}${s.n || (!s.x ? '0' : '')}`;
      const ciz = msg => {
        kutu.querySelector('.tz-sahne').innerHTML = terazi(ogeler(L.x, L.n), ogeler(R.x, R.n));
        kutu.querySelector('.tz-denk').innerHTML = `${yaz(L)} = ${yaz(R)}`;
        kutu.querySelector('.tz-mesaj').innerHTML = msg || '';
      };
      kutu.innerHTML = `<div class="tz-sahne"></div><p class="tz-denk"></p>
        <div class="tz-dugmeler">
          <button data-o="x">➖ İki kefeden 1 <b>x</b> çıkar</button>
          <button data-o="1">➖ İki kefeden <b>1</b> çıkar</button>
          <button data-o="5">➖ İki kefeden <b>5</b> çıkar</button>
          <button data-o="bol">➗ Kefeleri <b>x sayısına</b> böl</button>
        </div><p class="tz-mesaj" aria-live="polite"></p>`;
      ciz('Dengeyi bozmadan <b>x</b>’i tek başına bırak.');
      const tamam = () => (L.x === 1 && L.n === 0 && R.x === 0) || (R.x === 1 && R.n === 0 && L.x === 0);
      kutu.querySelectorAll('[data-o]').forEach(bt => bt.addEventListener('click', () => {
        if (bitti) return;
        const o = bt.dataset.o;
        if (o === 'x') { if (!L.x || !R.x) return ciz('⚠️ İki kefede de <b>x</b> olmalı ki ikisinden de çıkarabilesin.'); L.x--; R.x--; }
        else if (o === '1' || o === '5') { const k = +o; if (L.n < k || R.n < k) return ciz(`⚠️ İki kefede de en az <b>${k}</b> birim olmalı.`); L.n -= k; R.n -= k; }
        else {
          const [X, N] = L.x && !R.x ? [L, R] : R.x && !L.x ? [R, L] : [null];
          if (!X) return ciz('⚠️ Bölmeden önce x’leri tek bir kefede topla.');
          if (X.n) return ciz('⚠️ x’in yanındaki birimleri önce çıkar.');
          if (X.x === 1) return ciz('x zaten tek başına!');
          if (N.n % X.x) return ciz('⚠️ Birimler eşit paylaşılamıyor.');
          N.n /= X.x; X.x = 1;
        }
        adim++;
        ciz('✓ İki kefeye de aynı işlemi yaptın, denge korundu.');
        if (tamam()) { bitti = true; kutu.querySelectorAll('[data-o]').forEach(x => { x.disabled = true; }); const v = L.x ? R.n : L.n; bitir(true, `<b>x = ${v}</b> (${adim} adımda). Kontrol: ${ifade(a, b)} = ${a * v + b} ve ${c ? ifade(c, d) : d} = ${c * v + d} ✓`); }
      }));
    };
  }
  const denklemUret = (buyuk) => {
    let x, a, b, c;
    do { x = rnd(2, buyuk ? 9 : 6); c = rnd(0, 2); a = c + rnd(1, buyuk ? 3 : 2); b = rnd(0, buyuk ? 9 : 6); } while (c === 0 && (a === 1 || b === 0) && !(a > 1 && b > 0));
    return [a, b, c, (a - c) * x + b, x];
  };

  // ---- 5. sınıf ----
  const S5 = [
    () => { const a = rnd(5, 15), b = rnd(3, 12), c = rnd(2, a + b - 2), k = a + b - c;
      return { tip: 'sayi', soru: 'Terazi dengede. Soru işaretli kutunun değeri kaçtır?', gorsel: terazi([{ n: a }, { n: b }], [{ k: 1 }, { n: c }]), cevap: k, aciklama: `Sol kefe: ${a} + ${b} = ${a + b}. Sağ kefe de ${a + b} olmalı: ${a + b} − ${c} = ${k}` }; },
    () => { const a = rnd(4, 12), b = rnd(4, 12), k = rnd(2, 6);
      return { tip: 'secim', soru: `Dengedeki terazinin <b>iki kefesine de ${k}</b> eklenirse ne olur?`, gorsel: terazi([{ n: a }, { n: b }], [{ n: a + b }]), ...temaSecenek('Denge korunur.', ['Sol kefe ağır basar.', 'Sağ kefe ağır basar.', 'Terazi devrilir.']), aciklama: `Eşitliğin iki tarafına aynı sayı eklenirse eşitlik bozulmaz: ${a} + ${b} + ${k} = ${a + b} + ${k}` }; },
    () => { const a = rnd(3, 9), b = rnd(2, 9), c = rnd(2, 9);
      return { tip: 'sayi', soru: `Dağılma özelliğine göre boş kutuya hangi sayı gelmelidir?<br><span class="tz-buyuk">${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ☐</span>`, cevap: c, aciklama: `Çarpma, toplama üzerine dağılır: ${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c} = ${a * (b + c)}` }; },
    () => { const a = sec([25, 15, 35, 45]), c = 100 - a, b = rnd(12, 89);
      return { tip: 'sayi', soru: `Değişme ve birleşme özelliğine göre boş kutuya hangi sayı gelmelidir?<br><span class="tz-buyuk">${a} + ${b} + ${c} = ${b} + (${a} + ☐)</span>`, cevap: c, aciklama: `Sayıların yeri değişince toplam değişmez. ${a} + ${c} = 100 olduğundan bu sıralama işlemi kolaylaştırır: ${b} + 100 = ${b + 100}` }; },
    () => { const a = rnd(15, 30), b = rnd(2, 5), c = rnd(2, 4), d = rnd(1, 9); if (a - b * c < 0) return S5[4](); const v = a - b * c + d;
      return { tip: 'sayi', soru: `İşlem önceliğine dikkat ederek sonucu bul:<br><span class="tz-buyuk">${a} − ${b} × ${c} + ${d} = ?</span>`, cevap: v, aciklama: `Önce çarpma: ${b} × ${c} = ${b * c}. Sonra soldan sağa: ${a} − ${b * c} + ${d} = ${v}` }; },
    () => { const bas = rnd(1, 6), art = rnd(2, 6), t = [0, 1, 2, 3].map(i => bas + i * art);
      return { tip: 'sayi', soru: `Sayı örüntüsünün <b>bir sonraki</b> terimi kaçtır?<br><span class="tz-buyuk">${t.join(', ')}, ?</span>`, gorsel: `<div class="tz-oruntu">${t.map(v => `<span>${'●'.repeat(Math.min(v, 30))}</span>`).join('')}</div>`, cevap: bas + 4 * art, aciklama: `Kural: her adımda ${art} artıyor. ${t[3]} + ${art} = ${bas + 4 * art}` }; },
    () => { const a = rnd(6, 20), b = rnd(4, 15), c = rnd(a + b + 1, a + b + 20), k = c - a - b;
      return { tip: 'sayi', soru: `Eşitliği sağlayan sayı kaçtır?<br><span class="tz-buyuk">${a} + ${b} = ${c} − ☐</span>`, cevap: k, aciklama: `${a} + ${b} = ${a + b}. ${c} − ☐ = ${a + b} → ☐ = ${c} − ${a + b} = ${k}` }; },
  ];

  // ---- 6. sınıf ----
  const S6 = [
    () => { const x = rnd(2, 6), a = rnd(2, 3), b = rnd(1, 5), t = a * x + b;
      return { tip: 'sayi', soru: `Terazi dengede. Her <b>x</b> kutusunun ağırlığı eşit. Bir <b>x</b> kutusu kaç birimdir?`, gorsel: terazi(ogeler(a, b), ogeler(0, t)), cevap: x, aciklama: `${a} kutu + ${b} = ${t} → ${a} kutu = ${t - b} → 1 kutu = ${x}` }; },
    () => { const D = [['Bir sayının 3 katının 5 fazlası', '3x + 5', ['3(x + 5)', '5x + 3', 'x + 3 + 5']], ['Bir sayının 2 katının 7 eksiği', '2x − 7', ['2(x − 7)', '7 − 2x', '2 + x − 7']], ['Bir sayının 4 fazlasının 2 katı', '2(x + 4)', ['2x + 4', '4x + 2', 'x + 8']], ['Bir sayının yarısının 6 fazlası', 'x/2 + 6', ['(x + 6)/2', '2x + 6', '6x/2']]]; const [s, d, y] = sec(D);
      return { tip: 'secim', soru: `“<b>${s}</b>” ifadesinin cebirsel gösterimi hangisidir?`, ...temaSecenek(d, y), aciklama: `Bilinmeyen sayıya x dersek: ${s.toLocaleLowerCase('tr')} → <b>${d}</b>` }; },
    () => { const a = rnd(2, 5), b = rnd(1, 9), x = rnd(2, 8);
      return { tip: 'sayi', soru: `<b>x = ${x}</b> iken <span class="tz-buyuk">${a}x + ${b}</span> ifadesinin değeri kaçtır?`, cevap: a * x + b, aciklama: `${a} × ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}` }; },
    () => { const a = rnd(2, 5), b = rnd(-1, 4), t = [1, 2, 3, 4].map(n => a * n + b);
      const k = n => `${a}n ${b ? isa(b) : ''}`.trim();
      return { tip: 'secim', soru: `Örüntünün kuralı hangisidir? (n: terimin sırası)<br><span class="tz-buyuk">${t.join(', ')}, ...</span>`, ...temaSecenek(k(), [`${a}n ${isa(b + 1)}`, `n ${isa(a)}`, `${a + 1}n ${b ? isa(b - 1) : ''}`.trim(), `${b || 1}n ${isa(a)}`]), aciklama: `Terimler her adımda ${a} artıyor → ${a}n. 1. terim ${t[0]} = ${a} × 1 ${b ? isa(b) : ''} → kural <b>${k()}</b>` }; },
    () => { const a = rnd(2, 5), b = rnd(1, 6), n = sec([10, 15, 20]);
      return { tip: 'sayi', soru: `Kuralı <b>${a}n + ${b}</b> olan örüntünün <b>${n}. terimi</b> kaçtır?`, cevap: a * n + b, aciklama: `n = ${n}: ${a} × ${n} + ${b} = ${a * n + b}` }; },
    () => { const a = rnd(2, 4), b = rnd(1, 9); const ifs = `${Array(a).fill('x').join(' + ')} + ${b}`;
      return { tip: 'secim', soru: `<span class="tz-buyuk">${ifs}</span> ifadesinin en sade hâli hangisidir?`, gorsel: terazi(ogeler(a, Math.min(b, 9)), []), ...temaSecenek(`${a}x + ${b}`, [`${a + b}x`, `x${a} + ${b}`, `${a}x${b}`, `${a + 1}x + ${b}`]), aciklama: `${a} tane x toplanınca ${a}x olur: <b>${a}x + ${b}</b>` }; },
  ];

  // ---- 7. sınıf ----
  const S7 = [
    () => { const [a, b, c, d] = denklemUret(false); return { tip: 'ozel', soru: `Denklemi teraziyle çöz: <b>${ifade(a, b)} = ${c ? ifade(c, d) : d}</b>`, kur: cozucu(a, b, c, d) }; },
    () => { const [a, b, c, d] = denklemUret(false); return { tip: 'ozel', soru: `Denklemi teraziyle çöz: <b>${ifade(a, b)} = ${c ? ifade(c, d) : d}</b>`, kur: cozucu(a, b, c, d) }; },
    () => { const x = rnd(2, 9), a = rnd(2, 5), b = rnd(1, 9);
      return { tip: 'sayi', soru: `Denklemi çöz: <span class="tz-buyuk">${a}x − ${b} = ${a * x - b}</span> &nbsp; x = ?`, cevap: x, aciklama: `İki tarafa ${b} ekle: ${a}x = ${a * x}. İki tarafı ${R_.ek(a, 'e')} böl: x = ${x}` }; },
    () => { const x = rnd(8, 14), a = sec([2, 3]), b = rnd(2, 9);
      return { tip: 'secim', soru: `“Ali’nin yaşının <b>${a} katının ${b} fazlası ${a * x + b}</b>’dir.” Ali’nin yaşına x dersek hangi denklem kurulur?`, ...temaSecenek(`${a}x + ${b} = ${a * x + b}`, [`${a}(x + ${b}) = ${a * x + b}`, `x + ${a} + ${b} = ${a * x + b}`, `${b}x + ${a} = ${a * x + b}`]), aciklama: `Yaşın ${a} katı: ${a}x; ${b} fazlası: ${a}x + ${b}. Bu ${R_.ek(a * x + b, 'e')} eşit. (Ali ${x} yaşında.)` }; },
    () => { const a = rnd(2, 6), b = rnd(1, 9), c = rnd(1, 5), d = rnd(1, 9);
      return { tip: 'secim', soru: `<span class="tz-buyuk">(${a}x + ${b}) + (${c}x − ${d})</span> işleminin sonucu hangisidir?`, ...temaSecenek(ifade(a + c, b - d) || '0', [ifade(a + c, b + d), ifade(a - c, b - d), ifade(a * c, b - d), `${a + c + b - d}x`]), aciklama: `Benzer terimler toplanır: ${a}x + ${c}x = ${a + c}x, ${b} − ${d} = ${b - d}` }; },
    () => { const a = rnd(2, 5), b = rnd(2, 9);
      return { tip: 'secim', soru: `<span class="tz-buyuk">${a}(x + ${b})</span> ifadesi aşağıdakilerden hangisine eşittir?`, ...temaSecenek(`${a}x + ${a * b}`, [`${a}x + ${b}`, `x + ${a * b}`, `${a + b}x`, `${a}x + ${a + b}`]), aciklama: `Dağılma özelliği: ${a} · x + ${a} · ${b} = ${a}x + ${a * b}` }; },
    () => { const k = rnd(3, 9), b = rnd(2, 6), ops = shuffle([k + 1, k, k - 1, k - 2]), dogru = k + 1;
      return { tip: 'secim', soru: `<span class="tz-buyuk">x + ${b} > ${k + b}</span> eşitsizliğini sağlayan sayı hangisidir?`, secenekler: ops.map(String), dogru: ops.indexOf(dogru), aciklama: `İki taraftan ${b} çıkar: x > ${k}. Seçeneklerde ${R_.ek(k, 'den')} büyük olan: ${dogru}` }; },
  ];

  // ---- 8. sınıf ----
  const S8 = [
    () => { const [a, b, c, d] = denklemUret(true); return { tip: 'ozel', soru: `Denklemi teraziyle çöz: <b>${ifade(a, b)} = ${c ? ifade(c, d) : d}</b>`, kur: cozucu(a, b, c, d) }; },
    () => { const x = rnd(4, 12), a = rnd(2, 4), b = rnd(1, 3), c = a - 1, k = a * (x - b) - c * x;
      return { tip: 'sayi', soru: `Denklemi çöz: <span class="tz-buyuk">${a}(x − ${b}) = ${c === 1 ? '' : c}x ${isa(k)}</span> &nbsp; x = ?`, cevap: x, aciklama: `Parantezi aç: ${a}x − ${a * b} = ${c === 1 ? '' : c}x ${isa(k)}. ${c === 1 ? 'x' : c + 'x'}’i sola, sayıları sağa topla: x = ${k} + ${a * b} = ${x}` }; },
    () => { const k = sec([2, 3, 4, 5]), x = k * rnd(2, 6), b = rnd(1, 9);
      return { tip: 'sayi', soru: `Denklemi çöz: <span class="tz-buyuk">${kes('x', k)} + ${b} = ${x / k + b}</span> &nbsp; x = ?`, cevap: x, aciklama: `İki taraftan ${b} çıkar: x/${k} = ${x / k}. İki tarafı ${k} ile çarp: x = ${x}` }; },
    () => { const x = rnd(5, 15), a = rnd(3, 5), b = rnd(1, 9), c = rnd(1, a - 1), d = a * x - b - c * x;
      if (d <= 0) return S8[3]();
      return { tip: 'sayi', soru: `“Bir sayının <b>${a} katının ${b} eksiği</b>, aynı sayının <b>${c === 1 ? '' : c + ' katının '}${d} fazlasına</b> eşittir.” Bu sayı kaçtır?`, cevap: x, aciklama: `${a}x − ${b} = ${c === 1 ? '' : c}x + ${d} → ${a - c}x = ${d + b} → x = ${x}` }; },
    () => { const m = rnd(2, 4), n = rnd(-3, 5), x = rnd(1, 5);
      return { tip: 'sayi', soru: `<span class="tz-buyuk">y = ${m}x ${n ? isa(n) : ''}</span> doğrusal denkleminde <b>x = ${x}</b> iken y kaçtır?`, cevap: m * x + n, aciklama: `y = ${m} × ${x} ${n ? isa(n) : ''} = ${m * x + n}` }; },
    () => { const n = rnd(1, 4), x = rnd(1, 5), dogru = `(${x}, ${x + n})`;
      return { tip: 'secim', soru: `Aşağıdaki noktalardan hangisi <span class="tz-buyuk">y = x + ${n}</span> doğrusunun üzerindedir?`, ...temaSecenek(dogru, [`(${x + n}, ${x})`, `(${x}, ${x + n + 1})`, `(${x}, ${x * n})`, `(0, ${n + 1})`]), aciklama: `Noktanın apsisini (x) yerine koy: y = ${x} + ${n} = ${x + n}. Doğru nokta <b>${dogru}</b>` }; },
  ];

  const URET = { 5: S5, 6: S6, 7: S7, 8: S8 };
  temaOyunu({
    siniflar: [5, 6, 7, 8],
    unvan: 'Denge ustası!',
    not: g => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">⚖️</span><p>${{
      5: 'Eşitlik bir terazi gibidir: <mark>iki tarafa aynı işlemi</mark> yaparsan denge bozulmaz.',
      6: 'Bilinmeyen niceliğe <b>x</b> deriz. “Bir sayının 3 katının 5 fazlası” → <b>3x + 5</b>',
      7: 'Denklem çözerken terazinin <mark>iki kefesinden de aynı şeyi</mark> çıkar, x’i yalnız bırak.',
      8: 'Doğrusal denklemde parantezi aç, x’leri bir tarafa, sayıları diğer tarafa topla, sonra katsayıya böl.',
    }[g]}</p></div>`,
    uret: g => temaKaristir(URET[g], g >= 7 ? 7 : 7),
    kural: g => ({ 5: 'Eşitliğin iki tarafına aynı işlemi yap: denge korunur.', 6: 'Bilinmeyene x de, sözel ifadeyi adım adım cebire çevir.', 7: 'İki kefeden aynı şeyi çıkar, x’i yalnız bırak.', 8: 'Parantezi aç → topla → böl → kontrol et!' }[g]),
  });
})();
