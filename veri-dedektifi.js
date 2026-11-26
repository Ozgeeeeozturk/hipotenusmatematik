/* Veri Dedektifi: çetele, sıklık tablosu, sütun-çizgi-daire grafikleri, ortalama, açıklık, ortanca, tepe değer */
(function () {
  const { rnd, sec, sayi } = R_;
  const RENK = ['#2E9E78', '#7B4FA8', '#E0B820', '#E5733B', '#3BA7E0', '#C2415B'];
  const KONU = [
    { b: 'En sevilen meyve', k: ['Elma', 'Muz', 'Çilek', 'Karpuz', 'Portakal'] },
    { b: 'Okula geliş şekli', k: ['Yürüyerek', 'Servis', 'Otobüs', 'Bisiklet'] },
    { b: 'En sevilen spor', k: ['Futbol', 'Basketbol', 'Voleybol', 'Yüzme', 'Tenis'] },
    { b: 'Evcil hayvan tercihi', k: ['Kedi', 'Köpek', 'Kuş', 'Balık'] },
    { b: 'En sevilen ders', k: ['Matematik', 'Türkçe', 'Fen', 'Müzik', 'Beden'] },
  ];
  const konuVeri = (n = 4, min = 2, max = 12) => {
    const K = sec(KONU), ad = shuffle(K.k).slice(0, n);
    let d;
    do { d = ad.map(a => [a, rnd(min, max)]); } while (new Set(d.map(x => x[1])).size < n);
    return { baslik: K.b, d };
  };

  // ---- Çizimler ----
  function sutun(d, o = {}) {
    const W = 340, H = 230, L = 38, B = 44, T = 26, n = d.length;
    const mx = o.max || Math.ceil(Math.max(...d.map(x => x[1]), 1) / 2) * 2 + 2;
    const adim = o.adim || (mx <= 16 ? 2 : mx <= 40 ? 5 : 10);
    const y = v => H - B - (v / mx) * (H - B - T), bw = (W - L - 10) / n;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="vd-svg" role="img" aria-label="${o.baslik || 'Sütun grafiği'}">`;
    s += `<text x="${W / 2}" y="16" text-anchor="middle" class="vd-baslik">${o.baslik || ''}</text>`;
    for (let v = 0; v <= mx; v += adim) s += `<line x1="${L}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" class="vd-izgara"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="vd-eks">${v}</text>`;
    d.forEach(([ad, v], i) => {
      const x = L + i * bw + bw * 0.18, w = bw * 0.64;
      if (o.gizli === i) s += `<rect x="${x}" y="${T}" width="${w}" height="${H - B - T}" class="vd-bos"/><text x="${x + w / 2}" y="${(H - B + T) / 2}" text-anchor="middle" class="vd-soru">?</text>`;
      else s += `<rect x="${x}" y="${y(v)}" width="${w}" height="${H - B - y(v)}" rx="4" fill="${o.renk || RENK[i % RENK.length]}" ${o.id === i ? 'id="vdBar"' : ''}/>`;
      s += `<text x="${x + w / 2}" y="${H - B + 16}" text-anchor="middle" class="vd-kat">${ad}</text>`;
    });
    s += `<line x1="${L}" x2="${W - 6}" y1="${H - B}" y2="${H - B}" class="vd-eksen"/><line x1="${L}" x2="${L}" y1="${T - 6}" y2="${H - B}" class="vd-eksen"/>`;
    if (o.eksen) s += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" class="vd-eks">${o.eksen}</text>`;
    return s + '</svg>';
  }
  function ikiliSutun(kat, A, Bv, adlar, baslik) {
    const W = 340, H = 230, L = 38, Bt = 44, T = 40, n = kat.length;
    const mx = Math.ceil(Math.max(...A, ...Bv) / 10) * 10 + 10, adim = mx <= 50 ? 10 : 20;
    const y = v => H - Bt - (v / mx) * (H - Bt - T), bw = (W - L - 10) / n;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="vd-svg" role="img" aria-label="${baslik}"><text x="${W / 2}" y="14" text-anchor="middle" class="vd-baslik">${baslik}</text>`;
    s += `<rect x="${W / 2 - 92}" y="22" width="10" height="10" fill="${RENK[0]}"/><text x="${W / 2 - 78}" y="31" class="vd-eks">${adlar[0]}</text><rect x="${W / 2 + 10}" y="22" width="10" height="10" fill="${RENK[1]}"/><text x="${W / 2 + 24}" y="31" class="vd-eks">${adlar[1]}</text>`;
    for (let v = 0; v <= mx; v += adim) s += `<line x1="${L}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" class="vd-izgara"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="vd-eks">${v}</text>`;
    kat.forEach((k, i) => {
      const x = L + i * bw + bw * 0.12, w = bw * 0.36;
      s += `<rect x="${x}" y="${y(A[i])}" width="${w}" height="${H - Bt - y(A[i])}" fill="${RENK[0]}"/><rect x="${x + w}" y="${y(Bv[i])}" width="${w}" height="${H - Bt - y(Bv[i])}" fill="${RENK[1]}"/>`;
      s += `<text x="${x + w}" y="${H - Bt + 16}" text-anchor="middle" class="vd-kat">${k}</text>`;
    });
    return s + `<line x1="${L}" x2="${W - 6}" y1="${H - Bt}" y2="${H - Bt}" class="vd-eksen"/><line x1="${L}" x2="${L}" y1="${T - 6}" y2="${H - Bt}" class="vd-eksen"/></svg>`;
  }
  function cizgi(kat, seriler, adlar, baslik, o = {}) {
    const W = 340, H = 230, L = 38, B = 40, T = 40, n = kat.length;
    const hepsi = seriler.flat().filter(v => v != null);
    const mx = o.max || Math.ceil(Math.max(...hepsi) / 10) * 10 + 10, adim = o.adim || (mx <= 50 ? 10 : 20);
    const y = v => H - B - (v / mx) * (H - B - T), x = i => L + 20 + i * ((W - L - 40) / (n - 1));
    let s = `<svg viewBox="0 0 ${W} ${H}" class="vd-svg" role="img" aria-label="${baslik}"><text x="${W / 2}" y="14" text-anchor="middle" class="vd-baslik">${baslik}</text>`;
    adlar.forEach((a, j) => { const lx = W / 2 - 60 * adlar.length / 2 + j * 70; s += `<line x1="${lx}" x2="${lx + 14}" y1="27" y2="27" stroke="${RENK[j]}" stroke-width="3"/><text x="${lx + 18}" y="31" class="vd-eks">${a}</text>`; });
    for (let v = 0; v <= mx; v += adim) s += `<line x1="${L}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" class="vd-izgara"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="vd-eks">${v}</text>`;
    kat.forEach((k, i) => { s += `<text x="${x(i)}" y="${H - B + 16}" text-anchor="middle" class="vd-kat">${k}</text>`; });
    seriler.forEach((sr, j) => {
      const pts = sr.map((v, i) => (v == null ? null : `${x(i)},${y(v)}`)).filter(Boolean);
      s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${RENK[j]}" stroke-width="3" stroke-linejoin="round"/>`;
      sr.forEach((v, i) => { if (v != null) s += `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="${RENK[j]}" stroke-width="3"/>`; });
    });
    if (o.ek) s += o.ek(x, y);
    return s + `<line x1="${L}" x2="${W - 6}" y1="${H - B}" y2="${H - B}" class="vd-eksen"/><line x1="${L}" x2="${L}" y1="${T - 6}" y2="${H - B}" class="vd-eksen"/></svg>`;
  }
  function daire(d, baslik, o = {}) {
    const top = d.reduce((a, b) => a + b[1], 0), W = o.kucuk ? 150 : 320, r = o.kucuk ? 56 : 80, cx = o.kucuk ? 75 : 100, cy = o.kucuk ? 70 : 105;
    let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 ${W} ${o.kucuk ? 145 : 215}" class="vd-svg${o.kucuk ? ' kucuk' : ''}" role="img" aria-label="${baslik || 'Daire grafiği'}">`;
    if (baslik) s += `<text x="${W / 2}" y="14" text-anchor="middle" class="vd-baslik">${baslik}</text>`;
    d.forEach(([ad, v], i) => {
      const a1 = a0 + (v / top) * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0;
      s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${RENK[i % RENK.length]}" stroke="#fff" stroke-width="2"/>`;
      if (o.aci) { const m = (a0 + a1) / 2; s += `<text x="${cx + r * 0.62 * Math.cos(m)}" y="${cy + r * 0.62 * Math.sin(m) + 4}" text-anchor="middle" class="vd-dilim">${Math.round(v / top * 360)}°</text>`; }
      if (!o.kucuk) s += `<rect x="${cx + r + 22}" y="${cy - 52 + i * 22}" width="12" height="12" rx="3" fill="${RENK[i % RENK.length]}"/><text x="${cx + r + 40}" y="${cy - 42 + i * 22}" class="vd-eks">${ad}</text>`;
      a0 = a1;
    });
    return s + '</svg>';
  }
  const cetele = n => { let s = ''; for (let i = 0; i < Math.floor(n / 5); i++) s += '<span class="vd-c5">||||</span>'; return s + '|'.repeat(n % 5); };
  const tablo = (d, b1, b2) => `<table class="vd-tablo"><tr><th>${b1}</th>${d.map(x => `<th>${x[0]}</th>`).join('')}</tr><tr><td>${b2}</td>${d.map(x => `<td>${x[1]}</td>`).join('')}</tr></table>`;

  // Sütun yüksekliğini ayarlama etkinliği (eksik sütunu tamamla)
  function sutunKur(d, hedef, baslik, birim) {
    return (kutu, bitir) => {
      let v = 0;
      const mx = Math.ceil(Math.max(...d.map(x => x[1])) / 2) * 2 + 2;
      const ciz = () => { const dd = d.map((x, i) => (i === hedef ? [x[0], v] : x)); kutu.querySelector('.vd-ayar-g').innerHTML = sutun(dd, { baslik, max: mx, id: hedef }); kutu.querySelector('.vd-deger').textContent = v; };
      kutu.innerHTML = `<div class="vd-ayar-g"></div><div class="vd-ayar"><button class="btn-ghost-dark" data-d="-1" aria-label="Azalt">▼</button><span><b>${d[hedef][0]}</b>: <b class="vd-deger">0</b> ${birim}</span><button class="btn-ghost-dark" data-d="1" aria-label="Artır">▲</button><button class="btn btn-yellow vd-kontrol">✓ Kontrol Et</button></div>`;
      ciz();
      kutu.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { v = Math.max(0, Math.min(mx, v + +b.dataset.d)); ciz(); }));
      kutu.querySelector('.vd-kontrol').addEventListener('click', () => {
        kutu.querySelectorAll('button').forEach(b => { b.disabled = true; });
        bitir(v === d[hedef][1], v === d[hedef][1] ? '' : `${d[hedef][0]} sütunu <b>${d[hedef][1]}</b> olmalıydı.`);
      });
    };
  }

  // ---- 5. sınıf: kategorik veri ----
  const S5 = [
    () => { const V = konuVeri(4, 3, 14), i = rnd(0, 3);
      return { tip: 'sayi', soru: `“${V.baslik}” anketinin sonuçları çetele ile tutulmuş. <b>${V.d[i][0]}</b> seçeneğini kaç öğrenci seçmiş?`,
        gorsel: `<table class="vd-tablo vd-cetele"><tr><th>Seçenek</th><th>Çetele</th></tr>${V.d.map(x => `<tr><td>${x[0]}</td><td>${cetele(x[1])}</td></tr>`).join('')}</table>`,
        cevap: V.d[i][1], birim: 'öğrenci', aciklama: 'Çetelede her <b>||||</b> (çizili) grup 5 sayılır, kalan çizgileri tek tek ekleriz.' }; },
    () => { const V = konuVeri(4), mx = V.d.reduce((a, b) => (b[1] > a[1] ? b : a));
      return { tip: 'secim', soru: `Grafiğe göre <b>en çok</b> tercih edilen seçenek hangisidir?`, gorsel: sutun(V.d, { baslik: V.baslik, eksen: 'Öğrenci sayısı' }),
        ...temaSecenek(mx[0], V.d.map(x => x[0])), aciklama: `En uzun sütun <b>${mx[0]}</b> (${mx[1]}). Verideki en çok tekrar eden seçeneğe <b>tepe değer (mod)</b> denir.` }; },
    () => { const V = konuVeri(4); const [a, b] = shuffle(V.d).slice(0, 2);
      return { tip: 'sayi', soru: `<b>${a[0]}</b> seçeneğini seçenler, <b>${b[0]}</b> seçeneğini seçenlerden kaç kişi ${a[1] > b[1] ? 'fazladır' : 'azdır'}?`, gorsel: sutun(V.d, { baslik: V.baslik }),
        cevap: Math.abs(a[1] - b[1]), birim: 'kişi', aciklama: `${Math.max(a[1], b[1])} − ${Math.min(a[1], b[1])} = ${Math.abs(a[1] - b[1])}` }; },
    () => { const V = konuVeri(4, 2, 10), top = V.d.reduce((a, b) => a + b[1], 0);
      return { tip: 'sayi', soru: `Bu ankete <b>toplam</b> kaç öğrenci katılmıştır?`, gorsel: sutun(V.d, { baslik: V.baslik }), cevap: top, birim: 'öğrenci', aciklama: `Tüm sütunları toplarız: ${V.d.map(x => x[1]).join(' + ')} = ${top}` }; },
    () => { const V = konuVeri(4, 2, 12), i = rnd(0, 3);
      return { tip: 'ozel', soru: `Sıklık tablosundaki veriler grafiğe aktarılıyor. <b>${V.d[i][0]}</b> sütununu ▲▼ düğmeleriyle doğru yüksekliğe getir.`,
        gorsel: tablo(V.d, 'Seçenek', 'Öğrenci sayısı'), kur: sutunKur(V.d, i, V.baslik, 'öğrenci'), aciklama: 'Tablodaki sayı, sütunun yüksekliğini verir.' }; },
    () => { const V = konuVeri(4, 2, 10);
      const yan1 = V.d.map((x, i) => [x[0], i === 1 ? x[1] + 2 : x[1]]), yan2 = V.d.map(x => x).reverse().map((x, i) => [V.d[i][0], x[1]]);
      const ops = shuffle([[V.d, 1], [yan1, 0], [yan2, 0]]);
      return { tip: 'secim', soru: 'Aşağıdaki sıklık tablosunu <b>doğru</b> gösteren sütun grafiği hangisidir?', gorsel: tablo(V.d, 'Seçenek', 'Öğrenci sayısı'),
        secenekler: ops.map(o => `<span class="vd-mini">${sutun(o[0], { max: 14 })}</span>`), dogru: ops.findIndex(o => o[1]), aciklama: 'Her sütunu tablodaki sayıyla tek tek karşılaştır.' }; },
    () => { const V = konuVeri(4, 2, 12); const s = V.d.slice().sort((a, b) => b[1] - a[1]);
      const dogru = `${s[0][0]} seçeneğini seçen öğrenci sayısı ${s[3][0]} seçeneğini seçenlerden fazladır.`;
      const yan = [`${s[3][0]} en çok tercih edilen seçenektir.`, `Her seçeneği eşit sayıda öğrenci seçmiştir.`, `${s[1][0]} seçeneğini hiç kimse seçmemiştir.`];
      return { tip: 'secim', soru: 'Grafiğe göre aşağıdakilerden hangisi <b>kesinlikle doğrudur</b>?', gorsel: sutun(V.d, { baslik: V.baslik }), ...temaSecenek(dogru, yan), aciklama: 'Veriye dayalı karar verirken yalnızca grafikte görünen bilgiyi kullanırız.' }; },
    () => { const V = konuVeri(4), mn = V.d.reduce((a, b) => (b[1] < a[1] ? b : a));
      return { tip: 'secim', soru: `Grafiğe göre <b>en az</b> tercih edilen seçenek hangisidir?`, gorsel: sutun(V.d, { baslik: V.baslik }), ...temaSecenek(mn[0], V.d.map(x => x[0])), aciklama: `En kısa sütun <b>${mn[0]}</b> (${mn[1]}).` }; },
  ];

  // ---- 6. sınıf: nicel veri, aritmetik ortalama, açıklık ----
  const ortListe = (n, min, max) => { let a; do { a = Array.from({ length: n }, () => rnd(min, max)); } while (a.reduce((x, y) => x + y, 0) % n); return a; };
  const GUN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
  const S6 = [
    () => { const a = ortListe(5, 2, 15), o = a.reduce((x, y) => x + y, 0) / 5;
      return { tip: 'sayi', soru: `Elif’in bir haftada okuduğu sayfa sayıları grafikte verilmiştir. Elif günde <b>ortalama</b> kaç sayfa okumuştur?`, gorsel: sutun(GUN.map((g, i) => [g, a[i]]), { baslik: 'Okunan sayfa sayısı', renk: RENK[1] }),
        cevap: o, birim: 'sayfa', aciklama: `Aritmetik ortalama = toplam ÷ veri sayısı = (${a.join(' + ')}) ÷ 5 = ${a.reduce((x, y) => x + y, 0)} ÷ 5 = ${o}` }; },
    () => { const a = Array.from({ length: 6 }, () => rnd(3, 25)); const ac = Math.max(...a) - Math.min(...a);
      return { tip: 'sayi', soru: `Bir sınıfta 6 öğrencinin kardeşleriyle birlikte topladığı ceviz sayıları: <b>${a.join(', ')}</b>. Bu verinin <b>açıklığı</b> kaçtır?`, cevap: ac, aciklama: `Açıklık = en büyük − en küçük = ${Math.max(...a)} − ${Math.min(...a)} = ${ac}` }; },
    () => { const a = ortListe(4, 4, 14), o = a.reduce((x, y) => x + y, 0) / 4, e = rnd(4, 14), o5 = o; const top5 = o5 * 5, son = top5 - a.reduce((x, y) => x + y, 0);
      if (son < 0 || son > 30) return S6[0]();
      return { tip: 'sayi', soru: `Bir futbol takımı 5 maçta <b>ortalama ${o5} gol</b> atmıştır. İlk 4 maçta attığı goller: <b>${a.join(', ')}</b>. Takım 5. maçta kaç gol atmıştır?`, cevap: son, birim: 'gol', aciklama: `5 maçın toplamı = ${o5} × 5 = ${top5}. İlk 4 maçın toplamı ${a.reduce((x, y) => x + y, 0)}. ${top5} − ${a.reduce((x, y) => x + y, 0)} = ${son}` }; },
    () => { const ops = [['Öğrencilerin boy uzunlukları', 'nicel'], ['Öğrencilerin göz renkleri', 'kategorik'], ['Bir günde içilen su miktarı', 'nicel'], ['En sevilen renk', 'kategorik'], ['Ailedeki kişi sayısı', 'nicel'], ['Doğulan şehir', 'kategorik']];
      const hedef = sec(['nicel', 'kategorik']), dogru = sec(ops.filter(o => o[1] === hedef))[0], yan = ops.filter(o => o[1] !== hedef).map(o => o[0]);
      return { tip: 'secim', soru: `Aşağıdakilerden hangisi <b>${hedef}</b> bir veridir?`, ...temaSecenek(dogru, yan), aciklama: 'Sayıyla ifade edilen ve ölçülen/sayılan veriler <b>nicel</b>, gruplara ayrılan (renk, şehir gibi) veriler <b>kategorik</b> veridir.' }; },
    () => { const a = ortListe(4, 50, 95), b = ortListe(4, 50, 95); const oa = a.reduce((x, y) => x + y, 0) / 4, ob = b.reduce((x, y) => x + y, 0) / 4;
      if (oa === ob) return S6[1]();
      const d = oa > ob ? 'A takımı' : 'B takımı';
      return { tip: 'secim', soru: `İki bilgi yarışması takımının 4 turdaki puanları:<br>A takımı: <b>${a.join(', ')}</b><br>B takımı: <b>${b.join(', ')}</b><br>Hangi takımın puan <b>ortalaması</b> daha yüksektir?`, ...temaSecenek(d, ['A takımı', 'B takımı', 'Eşittir']),
        aciklama: `A: ${a.reduce((x, y) => x + y, 0)} ÷ 4 = ${oa}, B: ${b.reduce((x, y) => x + y, 0)} ÷ 4 = ${ob}` }; },
    () => { const V = GUN.map(g => [g, rnd(1, 9)]), i = rnd(0, 4);
      return { tip: 'ozel', soru: `Kerem’in bir haftada çözdüğü test sayıları tabloda verilmiştir. <b>${V[i][0]}</b> gününün sütununu doğru yüksekliğe getir.`, gorsel: tablo(V, 'Gün', 'Test sayısı'), kur: sutunKur(V, i, 'Çözülen test sayısı', 'test'), aciklama: '' }; },
    () => { const a = Array.from({ length: 5 }, () => rnd(10, 40)), b = Array.from({ length: 5 }, () => rnd(10, 40)); const aa = Math.max(...a) - Math.min(...a), ab = Math.max(...b) - Math.min(...b);
      if (aa === ab) return S6[1]();
      return { tip: 'secim', soru: `İki şehrin 5 günlük en yüksek sıcaklıkları (°C):<br>Şehir A: <b>${a.join(', ')}</b><br>Şehir B: <b>${b.join(', ')}</b><br>Hangi şehirde sıcaklık <b>daha çok değişmiştir</b> (açıklığı daha büyüktür)?`, ...temaSecenek(aa > ab ? 'Şehir A' : 'Şehir B', ['Şehir A', 'Şehir B', 'İkisi aynı']), aciklama: `A’nın açıklığı ${Math.max(...a)} − ${Math.min(...a)} = ${aa}, B’nin açıklığı ${Math.max(...b)} − ${Math.min(...b)} = ${ab}.` }; },
    () => { const o = rnd(6, 12), a = ortListe(5, o - 4, o + 4); const oo = a.reduce((x, y) => x + y, 0) / 5;
      return { tip: 'secim', soru: `Verilerin ortalaması <b>${oo}</b> ise verilerin <b>toplamı</b> kaçtır? (5 veri)`, ...temaSecenek(oo * 5, [oo + 5, oo * 4, oo * 5 + 5, oo * 5 - 5]), aciklama: `Toplam = ortalama × veri sayısı = ${oo} × 5 = ${oo * 5}` }; },
  ];

  // ---- 7. sınıf: ortanca, tepe değer, daire grafiği, gruplanmış veri ----
  const S7 = [
    () => { const a = Array.from({ length: 7 }, () => rnd(1, 30)); const s = a.slice().sort((x, y) => x - y);
      return { tip: 'sayi', soru: `Verilerin <b>ortancasını</b> (medyan) bul: <b>${a.join(', ')}</b>`, cevap: s[3], aciklama: `Önce sırala: ${s.join(', ')}. 7 veride ortadaki 4. veri: <b>${s[3]}</b>` }; },
    () => { const a = Array.from({ length: 6 }, () => rnd(2, 20)); const s = a.slice().sort((x, y) => x - y), m = (s[2] + s[3]) / 2;
      return { tip: 'sayi', soru: `Verilerin <b>ortancasını</b> bul: <b>${a.join(', ')}</b>`, cevap: m, aciklama: `Sıralı: ${s.join(', ')}. Çift sayıda veride ortadaki iki verinin ortalaması: (${s[2]} + ${s[3]}) ÷ 2 = <b>${sayi(m)}</b>` }; },
    () => { const t = rnd(34, 40), ikinci = sec([33, 34, 35, 36, 37, 38, 39, 40, 41].filter(x => x !== t));
      const diger = shuffle([33, 34, 35, 36, 37, 38, 39, 40, 41].filter(x => x !== t && x !== ikinci)).slice(0, 3);
      const a = shuffle([t, t, t, ikinci, ikinci, ...diger]);
      return { tip: 'sayi', soru: `Bir sınıftaki 8 öğrencinin ayakkabı numaraları: <b>${a.join(', ')}</b>. Bu verinin <b>tepe değeri</b> (mod) kaçtır?`, cevap: t, aciklama: `Tepe değer, veride <b>en çok tekrar eden</b> değerdir: ${t} üç kez tekrar ediyor.` }; },
    () => { const top = sec([24, 36, 40, 60, 72]); const dil = [[90, 'Futbol'], [120, 'Basketbol'], [60, 'Voleybol'], [90, 'Yüzme']]; const i = rnd(0, 3), kisi = top * dil[i][0] / 360;
      return { tip: 'sayi', soru: `<b>${top}</b> öğrencinin en sevdiği spor daire grafiğinde gösterilmiştir. <b>${dil[i][1]}</b> seçen kaç öğrenci vardır?`, gorsel: daire(dil.map(x => [x[1], x[0]]), 'En sevilen spor', { aci: true }),
        cevap: kisi, birim: 'öğrenci', aciklama: `${dil[i][1]} dilimi ${dil[i][0]}°. ${dil[i][0]}° ÷ 360° = ${R_.kes(dil[i][0] / 30, 12)} → ${top} × ${dil[i][0]} ÷ 360 = <b>${kisi}</b>` }; },
    () => { const d = [['Kitap', 180], ['Oyun', 90], ['Spor', 60], ['Müzik', 30]];
      return { tip: 'secim', soru: 'Öğrencilerin boş zaman tercihleri daire grafiğinde verilmiştir. Öğrencilerin <b>yarısı</b> hangi etkinliği seçmiştir?', gorsel: daire(d, 'Boş zaman etkinliği', { aci: true }), ...temaSecenek('Kitap', d.map(x => x[0])), aciklama: 'Yarım daire 180° demektir: Kitap dilimi 180° → öğrencilerin yarısı.' }; },
    () => { const a = [12, 14, 13, 15, 14, 95].map(x => x);
      return { tip: 'secim', soru: `Bir sınıfta 6 öğrencinin haftalık harçlıkları (TL): <b>${a.join(', ')}</b>. Bu veriyi en iyi temsil eden merkezî eğilim ölçüsü hangisidir?`, ...temaSecenek('Ortanca', ['Aritmetik ortalama', 'Açıklık', 'En büyük değer']), aciklama: '95 diğerlerinden çok büyük (uç değer). Uç değer ortalamayı çok yükseltir; <b>ortanca</b> bundan etkilenmez.' }; },
    () => { const g = [['130-134', rnd(2, 6)], ['135-139', rnd(4, 9)], ['140-144', rnd(5, 11)], ['145-149', rnd(2, 7)]]; const i = rnd(0, 3);
      return { tip: 'sayi', soru: `Bir sınıftaki öğrencilerin boy uzunlukları (cm) gruplandırılarak grafiğe aktarılmıştır. Boyu <b>${g[i][0]} cm</b> aralığında olan kaç öğrenci vardır?`, gorsel: sutun(g, { baslik: 'Boy uzunlukları (cm)', renk: RENK[4] }).replace(/rx="4"/g, 'rx="0"'), cevap: g[i][1], birim: 'öğrenci', aciklama: 'Sürekli veriler gruplandırılır; her sütun bir aralıktaki öğrenci sayısını gösterir.' }; },
    () => { const V = konuVeri(4, 3, 12), i = rnd(0, 3);
      return { tip: 'ozel', soru: `Tablodaki veriyi grafiğe aktar: <b>${V.d[i][0]}</b> sütununu doğru yüksekliğe getir.`, gorsel: tablo(V.d, 'Seçenek', 'Kişi'), kur: sutunKur(V.d, i, V.baslik, 'kişi') }; },
  ];

  // ---- 8. sınıf: çizgi ve sütun grafikleri (en fazla üç veri grubu) ----
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May'];
  const seri = () => AY.map(() => rnd(1, 9) * 5);
  const S8 = [
    () => { let a, b, k; do { a = seri(); b = seri(); k = AY.findIndex((_, i) => a[i] === b[i]); } while (k < 0 || a.filter((v, i) => v === b[i]).length > 1);
      return { tip: 'secim', soru: 'İki kırtasiyenin aylık defter satışları çizgi grafiğinde verilmiştir. Hangi ayda iki kırtasiyenin satışları <b>eşittir</b>?', gorsel: cizgi(AY, [a, b], ['A', 'B'], 'Satılan defter sayısı'), ...temaSecenek(AY[k], AY), aciklama: 'İki çizginin <b>kesiştiği</b> nokta, değerlerin eşit olduğu aydır.' }; },
    () => { const a = seri(); const art = a.slice(1).map((v, i) => v - a[i]); const mx = Math.max(...art); if (mx <= 0 || art.filter(x => x === mx).length > 1) return S8[1]();
      const k = art.indexOf(mx); const ops = AY.slice(1).map((m, i) => `${AY[i]} – ${m}`);
      return { tip: 'secim', soru: 'Bir fidanlığın aylık fidan satışlarına göre satışlar <b>en çok hangi iki ay arasında artmıştır</b>?', gorsel: cizgi(AY, [a], ['Fidan'], 'Satılan fidan sayısı'), secenekler: ops, dogru: k, aciklama: `Çizginin en dik yükseldiği yer: ${ops[k]} (${a[k]} → ${a[k + 1]}, ${mx} artış).` }; },
    () => { const kat = ['5A', '5B', '6A', '6B'], A = kat.map(() => rnd(2, 9) * 5), Bv = kat.map(() => rnd(2, 9) * 5); const top = Bv.reduce((x, y) => x + y, 0);
      return { tip: 'sayi', soru: 'Bir okuldaki şubelerin kermeste sattığı kurabiye ve kek sayıları grafikte verilmiştir. Toplam kaç <b>kek</b> satılmıştır?', gorsel: ikiliSutun(kat, A, Bv, ['Kurabiye', 'Kek'], 'Kermes satışları'), cevap: top, birim: 'kek', aciklama: `Mor sütunları topla: ${Bv.join(' + ')} = ${top}` }; },
    () => { const d = [['Kitap', 6], ['Defter', 3], ['Kalem', 2], ['Silgi', 1]];
      const p1 = d, p2 = [['Kitap', 3], ['Defter', 6], ['Kalem', 2], ['Silgi', 1]], p3 = [['Kitap', 3], ['Defter', 3], ['Kalem', 3], ['Silgi', 3]];
      const ops = shuffle([[p1, 1], [p2, 0], [p3, 0]]);
      return { tip: 'secim', soru: 'Bir kırtasiyenin bir günde sattığı ürünler tabloda verilmiştir. Bu veriyi gösteren <b>daire grafiği</b> hangisidir? (Renkler: Kitap yeşil, Defter mor, Kalem sarı, Silgi turuncu)', gorsel: tablo(d, 'Ürün', 'Satış'),
        secenekler: ops.map(o => daire(o[0], '', { kucuk: true })), dogru: ops.findIndex(o => o[1]), aciklama: 'Toplam 12 ürün; Kitap 6/12 = yarım daire, Defter 3/12 = çeyrek daire.' }; },
    () => { const a = seri(), b = seri(), i = rnd(0, 4); if (a[i] === b[i]) return S8[4]();
      const [bu, ob, bn, on] = a[i] > b[i] ? ['A', 'B', a[i], b[i]] : ['B', 'A', b[i], a[i]];
      return { tip: 'sayi', soru: `<b>${AY[i]}</b> ayında ${bu} kırtasiyesi, ${ob} kırtasiyesinden kaç defter fazla satmıştır?`, gorsel: cizgi(AY, [a, b], ['A', 'B'], 'Satılan defter sayısı'), cevap: bn - on, birim: 'defter', aciklama: `${bn} − ${on} = ${bn - on}` }; },
    () => { const a = [20, 35, 30, 45, 40];
      const dogru = 'Satışlar her ay düzenli olarak artmıştır.';
      return { tip: 'secim', soru: 'Grafiğe göre aşağıdaki yorumlardan hangisi <b>yanlıştır</b>?', gorsel: cizgi(AY, [a], ['Fidan'], 'Satılan fidan sayısı'), ...temaSecenek(dogru, ['En çok satış Nisan ayında yapılmıştır.', 'Mart ayında satışlar Şubat’a göre azalmıştır.', 'Ocak ayında 20 fidan satılmıştır.']), aciklama: 'Mart ve Mayıs’ta satışlar azalmıştır; “her ay düzenli arttı” yorumu yanlıştır.' }; },
    () => { const a = seri(), i = rnd(1, 3);
      return { tip: 'ozel', soru: `Bir dükkânın aylık satışları tabloda verilmiştir. Çizgi grafiğinde <b>${AY[i]}</b> noktası eksik. ▲▼ ile noktayı doğru yere taşı.`, gorsel: tablo(AY.map((m, k) => [m, a[k]]), 'Ay', 'Satış'),
        kur: (kutu, bitir) => {
          let v = 0;
          const ciz = () => { const s = a.map((x, k) => (k === i ? v : x)); kutu.querySelector('.vd-ayar-g').innerHTML = cizgi(AY, [s], ['Satış'], 'Aylık satış', { max: 60, adim: 10 }); kutu.querySelector('.vd-deger').textContent = v; };
          kutu.innerHTML = `<div class="vd-ayar-g"></div><div class="vd-ayar"><button class="btn-ghost-dark" data-d="-5">▼ 5</button><span><b>${AY[i]}</b>: <b class="vd-deger">0</b></span><button class="btn-ghost-dark" data-d="5">▲ 5</button><button class="btn btn-yellow vd-kontrol">✓ Kontrol Et</button></div>`;
          ciz();
          kutu.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { v = Math.max(0, Math.min(60, v + +b.dataset.d)); ciz(); }));
          kutu.querySelector('.vd-kontrol').addEventListener('click', () => { kutu.querySelectorAll('button').forEach(b => { b.disabled = true; }); bitir(v === a[i], v === a[i] ? '' : `${AY[i]} noktası <b>${a[i]}</b> olmalıydı.`); });
        } }; },
    () => { const D = [['Bir şehrin 12 aylık ortalama sıcaklığının değişimi', 'Çizgi grafiği'], ['Bir sınıftaki öğrencilerin en sevdiği renkleri karşılaştırmak', 'Sütun grafiği'], ['Aylık bütçenin hangi harcamalara ne oranda ayrıldığı', 'Daire grafiği']]; const [s, c] = sec(D);
      return { tip: 'secim', soru: `“${s}” verisini göstermek için <b>en uygun</b> grafik türü hangisidir?`, ...temaSecenek(c, ['Çizgi grafiği', 'Sütun grafiği', 'Daire grafiği', 'Çetele tablosu']), aciklama: 'Zamana bağlı değişim → <b>çizgi</b>; kategorileri karşılaştırma → <b>sütun</b>; bütünün parçaları → <b>daire</b> grafiği.' }; },
  ];

  const URET = { 5: S5, 6: S6, 7: S7, 8: S8 };
  temaOyunu({
    siniflar: [5, 6, 7, 8],
    unvan: 'Veri dedektifi!',
    not: g => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🔎</span><p>${{
      5: 'Veriler <b>çetele</b>, <b>sıklık tablosu</b> ve <b>sütun grafiği</b> ile gösterilir. En çok tekrar eden değer <mark>tepe değerdir</mark>.',
      6: '<b>Aritmetik ortalama</b> = verilerin toplamı ÷ veri sayısı. <b>Açıklık</b> = en büyük değer − en küçük değer.',
      7: '<b>Ortanca</b>: sıralanan verinin ortasındaki değer. <b>Tepe değer</b>: en çok tekrar eden. <b>Daire grafiğinde</b> bütün 360°’dir.',
      8: '<b>Çizgi grafiği</b> zamana bağlı değişimi, <b>sütun grafiği</b> karşılaştırmayı, <b>daire grafiği</b> bütünün parçalarını gösterir.',
    }[g]}</p></div>`,
    uret: g => temaKaristir(URET[g], 8),
    kural: g => ({ 5: 'Grafiği okurken önce başlığa ve eksenlere bak!', 6: 'Ortalama = toplam ÷ sayı, açıklık = en büyük − en küçük.', 7: 'Ortanca için önce sırala; uç değer varsa ortanca daha iyi temsil eder.', 8: 'Zaman → çizgi, karşılaştırma → sütun, parçalar → daire.' }[g]),
  });
})();
