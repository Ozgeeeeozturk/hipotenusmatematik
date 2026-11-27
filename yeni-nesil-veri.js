/* Yeni Nesil Problemler · Veri Analizi (8. sınıf)
   Sorular: MEB 8. Sınıf Matematik Örnek Soruları (2. Ünite, Veri Analizi soruları 13, 14, 15, 16, 23, 24, 34).
   Çözüm adımları, ipuçları ve grafik çizimleri Hipotenüs’e aittir. */
(function () {
  const KAYNAK = 'Kaynak: MEB, 8. Sınıf Matematik Örnek Soruları, 2. Ünite: Kareköklü İfadeler – Veri Analizi';
  const kes = (p, q) => `<span class="f"><i>${p}</i><i>${q}</i></span>`;
  const R = { lila: '#B9B4E6', sari: '#FFF09A', mavi: '#A8DEF5', turuncu: '#FFB38A', pembe: '#FFC9DE', yesil: '#9EDDB8', gri: '#C8C8CE', mor: '#B79BE0', kirmizi: '#FF5A4E', kahve: '#A0522D' };

  // ---------- Grafik çizimleri (özgün) ----------
  // Daire grafiği: d = [{ad, aci, renk, yaz?(açı etiketi), dik?}]
  function daire(d, o = {}) {
    const r = o.r || 82, cx = o.cx || r + 10, cy = r + 10 + (o.ust || 0), W = o.w || cx * 2;
    let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 ${W} ${cy + r + 10}" class="yn-svg${o.kucuk ? ' kucuk' : ''}" role="img" aria-label="${o.baslik || 'Daire grafiği'}">`;
    if (o.baslik) s += `<text x="${W / 2}" y="14" text-anchor="middle" class="yn-et b">${o.baslik}</text>`;
    const isaret = [];
    d.forEach(p => {
      const a1 = a0 + p.aci * Math.PI / 180, big = p.aci > 180 ? 1 : 0, m = (a0 + a1) / 2;
      s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${p.renk}" stroke="#2D2440" stroke-width="1.5"/>`;
      const lr = p.aci < 40 ? r * 0.78 : (p.yaz || p.dik) ? r * 0.7 : r * 0.62, ar = o.kucuk ? 24 : 30;
      s += `<text x="${cx + lr * Math.cos(m)}" y="${cy + lr * Math.sin(m) + 4}" text-anchor="middle" class="yn-et${o.kucuk ? ' k' : ''}">${p.ad}</text>`;
      if (p.yaz) isaret.push(`<path d="M${cx + 13 * Math.cos(a0)},${cy + 13 * Math.sin(a0)} A13,13 0 ${p.aci > 180 ? 1 : 0} 1 ${cx + 13 * Math.cos(a1)},${cy + 13 * Math.sin(a1)}" fill="none" stroke="#2D2440" stroke-width="1.2"/><text x="${cx + ar * Math.cos(m)}" y="${cy + ar * Math.sin(m) + 4}" text-anchor="middle" class="yn-et k">${p.aci}°</text>`);
      if (p.dik) { const u = [Math.cos(a0), Math.sin(a0)], v = [Math.cos(a1), Math.sin(a1)], k = 9; isaret.push(`<path d="M${cx + k * u[0]},${cy + k * u[1]} L${cx + k * (u[0] + v[0])},${cy + k * (u[1] + v[1])} L${cx + k * v[0]},${cy + k * v[1]}" fill="none" stroke="#2D2440" stroke-width="1.3"/><circle cx="${cx + k * 0.5 * (u[0] + v[0])}" cy="${cy + k * 0.5 * (u[1] + v[1])}" r="1.3" fill="#2D2440"/>`); }
      a0 = a1;
    });
    return s + isaret.join('') + '</svg>';
  }
  // Sütun grafiği: v = [[ad, değer, renk]]
  function sutun(v, o) {
    const W = o.w || 360, H = 230, L = 46, B = 40, T = 34, n = v.length, mx = o.max, y = x => H - B - (x / mx) * (H - B - T), bw = (W - L - 20) / n;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="yn-svg" role="img" aria-label="${o.baslik}"><text x="${W / 2}" y="14" text-anchor="middle" class="yn-et b">${o.baslik}</text>`;
    s += `<text x="${L - 4}" y="${T - 8}" class="yn-et k">${o.dikey}</text>`;
    for (let t = 0; t <= mx; t += o.adim) s += `<text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" class="yn-et k">${t}</text><line x1="${L - 3}" x2="${L}" y1="${y(t)}" y2="${y(t)}" stroke="#2D2440"/>`;
    v.forEach(([ad, d, renk], i) => {
      const x = L + i * bw + bw * 0.22, w = bw * 0.56;
      s += `<line x1="${L}" x2="${x}" y1="${y(d)}" y2="${y(d)}" stroke="#9A8BB5" stroke-dasharray="2 3"/><rect x="${x}" y="${y(d)}" width="${w}" height="${H - B - y(d)}" fill="${renk}" stroke="#2D2440" stroke-width="1.2"/>`;
      s += `<text x="${x + w / 2}" y="${H - B + 15}" text-anchor="middle" class="yn-et k">${ad}</text>`;
    });
    return s + `<line x1="${L}" y1="${H - B}" x2="${W - 8}" y2="${H - B}" stroke="#2D2440" stroke-width="1.5"/><line x1="${L}" y1="${T - 4}" x2="${L}" y2="${H - B}" stroke="#2D2440" stroke-width="1.5"/>${o.yatay ? `<text x="${W - 8}" y="${H - 6}" text-anchor="end" class="yn-et k">${o.yatay}</text>` : ''}</svg>`;
  }
  // İkili sütun grafiği: kat = etiketler, s1, s2 = değerler
  function ikili(kat, s1, s2, o) {
    const W = o.w || 360, H = o.h || 230, L = 40, B = 40, T = 40, mx = o.max, y = x => H - B - (x / mx) * (H - B - T), bw = (W - L - 16) / kat.length;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="yn-svg${o.kucuk ? ' kucuk' : ''}" role="img" aria-label="${o.baslik || 'İkili sütun grafiği'}">`;
    if (o.baslik) s += `<text x="${W / 2}" y="14" text-anchor="middle" class="yn-et b">${o.baslik}</text>`;
    s += `<rect x="${W - 112}" y="${o.baslik ? 22 : 6}" width="11" height="11" fill="${o.r1}" stroke="#2D2440"/><text x="${W - 97}" y="${o.baslik ? 32 : 16}" class="yn-et k">${o.a1}</text><rect x="${W - 112}" y="${o.baslik ? 37 : 21}" width="11" height="11" fill="${o.r2}" stroke="#2D2440"/><text x="${W - 97}" y="${o.baslik ? 47 : 31}" class="yn-et k">${o.a2}</text>`;
    for (let t = 0; t <= mx; t += o.adim) s += `<text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" class="yn-et k">${t}</text>`;
    (o.cizgi || []).forEach(t => { s += `<line x1="${L}" x2="${W - 8}" y1="${y(t)}" y2="${y(t)}" stroke="#9A8BB5" stroke-dasharray="2 3"/>`; });
    kat.forEach((k, i) => {
      const x = L + i * bw + bw * 0.16, w = bw * 0.32;
      s += `<rect x="${x}" y="${y(s1[i])}" width="${w}" height="${H - B - y(s1[i])}" fill="${o.r1}" stroke="#2D2440" stroke-width="1.2"/><rect x="${x + w + 4}" y="${y(s2[i])}" width="${w}" height="${H - B - y(s2[i])}" fill="${o.r2}" stroke="#2D2440" stroke-width="1.2"/>`;
      s += `<text x="${x + w + 2}" y="${H - B + 15}" text-anchor="middle" class="yn-et k">${k}</text>`;
    });
    return s + `<line x1="${L}" y1="${H - B}" x2="${W - 8}" y2="${H - B}" stroke="#2D2440" stroke-width="1.5"/><line x1="${L}" y1="${T - 8}" x2="${L}" y2="${H - B}" stroke="#2D2440" stroke-width="1.5"/><text x="${L - 2}" y="${T - 14}" class="yn-et k">${o.dikey}</text></svg>`;
  }
  const yanyana = (...g) => `<div class="yn-ikili">${g.join('')}</div>`;

  const aracSik = (b17, t17, b18, t18) => ikili(['2017', '2018'], [b17, b18], [t17, t18], { max: 9, adim: 1, r1: R.pembe, r2: R.lila, a1: 'Binek', a2: 'Ticari', dikey: 'Araç Sayısı (Bin)', w: 260, h: 220, kucuk: true, cizgi: [...new Set([b17, t17, b18, t18])] });
  const sinemaSik = (a, isaretler) => daire([['11.30', R.pembe], ['15.00', R.yesil], ['18.30', R.sari], ['21.00', R.gri]].map(([ad, renk]) => ({ ad, renk, aci: a[ad], yaz: isaretler.yaz.includes(ad), dik: isaretler.dik.includes(ad) })), { kucuk: true, r: 70 });

  const CIZ = {
    1: () => yanyana(
      daire([{ ad: 'Ankara', aci: 120, renk: R.lila, yaz: 1 }, { ad: 'Rize', aci: 70, renk: R.turuncu }, { ad: 'Denizli', aci: 80, renk: R.mavi, yaz: 1 }, { ad: 'Bursa', aci: 90, renk: R.sari, dik: 1 }], { baslik: 'İşçi Sayıları', w: 240, cx: 120, ust: 14 }),
      sutun([['Ankara', 6, R.lila], ['Bursa', 3, R.sari], ['Denizli', 4, R.mavi], ['Rize', 5, R.turuncu]], { max: 6, adim: 1, baslik: 'Üretilen Ayakkabı', dikey: 'Ayakkabı (bin)', yatay: 'İl' })),
    2: () => sutun([['Pzt', 100], ['Salı', 120], ['Çarş', 80], ['Perş', 60], ['Cuma', 140], ['Cmt', 40], ['Pazar', 120]].map(x => [...x, R.mavi]), { max: 140, adim: 20, baslik: 'Grafik: Günlere Göre Biriken Atık Miktarı', dikey: 'Atık Yemek (kg)', yatay: 'Günler', w: 440 }),
    3: () => `${daire([{ ad: 'Ticari', aci: 100, renk: R.lila, yaz: 1 }, { ad: 'Binek', aci: 260, renk: R.pembe }], { baslik: '2016 Yılında Kayıtlı Araçlar', w: 260, cx: 130, ust: 14 })}
      <table class="vd-tablo yn-tab"><tr><th rowspan="2"></th><th colspan="2">Trafiğe Yeni Katılan</th><th colspan="2">Trafikten Kaydı Silinen</th></tr><tr><th>Binek</th><th>Ticari</th><th>Binek</th><th>Ticari</th></tr><tr><th>2017</th><td>800</td><td>1500</td><td>600</td><td>500</td></tr><tr><th>2018</th><td>1400</td><td>400</td><td>400</td><td>400</td></tr></table>`,
    4: () => ikili(['11.30', '15.00', '18.30', '21.00'], [50, 44, 74, 80], [50, 20, 20, 50], { max: 80, adim: 10, r1: R.turuncu, r2: '#3B78C9', a1: 'Tam', a2: 'İndirimli', dikey: 'Bilet Sayısı', baslik: 'Grafik: Satılan Tam ve İndirimli Bilet Sayıları', w: 420, cizgi: [20, 44, 50, 74, 80] }),
    5: () => yanyana(
      sutun([['Kivi', 10, R.kahve], ['Mandalina', 45, '#7CC34A'], ['Ayva', 15, '#E8C33A'], ['Elma', 35, R.kirmizi]], { max: 45, adim: 5, baslik: 'Grafik: Meyveler ve Günlük Satış', dikey: 'Satış (kg)' }),
      daire([{ ad: 'Portakal', aci: 90, renk: '#FF9A3C', dik: 1 }, { ad: 'Muz', aci: 30, renk: '#FFE45C', yaz: 1 }, { ad: 'Erik', aci: 30, renk: R.mor, yaz: 1 }, { ad: 'Diğer Meyveler', aci: 210, renk: R.mavi }].sort((a, b) => ['Muz', 'Erik', 'Diğer Meyveler', 'Portakal'].indexOf(a.ad) - ['Muz', 'Erik', 'Diğer Meyveler', 'Portakal'].indexOf(b.ad)), { baslik: 'Günlük Satış Dağılımı', w: 240, cx: 120, ust: 14 })),
    6: () => yanyana(
      daire([{ ad: 'Kültür', aci: 60, renk: R.mavi, yaz: 1 }, { ad: 'Yaşam', aci: 30, renk: R.mor, yaz: 1 }, { ad: 'Spor', aci: 90, renk: R.yesil, dik: 1 }, { ad: 'Bilim', aci: 60, renk: R.pembe, yaz: 1 }, { ad: 'Sanat', aci: 120, renk: R.sari }], { baslik: 'Tasarım-Beceri Alanları', w: 240, cx: 120, ust: 14 }),
      sutun([['Ahşap-Metal', 40, R.sari], ['Görsel Snt.', 80, R.sari], ['Müzik', 60, R.sari]], { max: 80, adim: 20, baslik: 'Grafik: Sanat Atölyeleri', dikey: 'Öğrenci Sayısı' })),
    7: () => yanyana(
      daire([{ ad: 'Etek', aci: 120, renk: R.pembe }, { ad: 'Kazak', aci: 50, renk: R.yesil, yaz: 1 }, { ad: 'Gömlek', aci: 90, renk: '#FFE45C' }, { ad: 'Pantolon', aci: 100, renk: '#4FB3E8' }], { baslik: 'Ürün Türleri', w: 240, cx: 120, ust: 14 }),
      sutun([['Pantolon', 10, '#4FB3E8'], ['Etek', 5, R.pembe], ['Kazak', 20, R.yesil], ['Gömlek', 15, '#FFE45C']], { max: 20, adim: 5, baslik: 'Grafik: Defolu Ürün Yüzdeleri', dikey: 'Defolu (%)' })),
  };

  const SORULAR = [
    { baslik: 'Ayakkabı Fabrikaları', metin: 'Aşağıda ayakkabı üretimi yapan bir firmaya ait 4 farklı ildeki fabrikalarda çalışan işçi sayıları dairesel grafikte ve bu fabrikalarda aralık ayı boyunca üretilen toplam ayakkabı sayıları ise sütun grafiğinde gösterilmiştir.',
      kok: 'Buna göre hangi ildeki fabrikada işçi başına üretilen ayakkabı sayısı en fazladır?', siklar: ['Ankara', 'Bursa', 'Denizli', 'Rize'],
      adimlar: [
        { b: 'Grafikleri tanı', s: 'Daire grafiği neyi gösteriyor?', tip: 'secim', o: ['Üretilen ayakkabı sayılarını', 'Fabrikalarda çalışan işçi sayılarının dağılımını', 'Fabrikaların büyüklüğünü'], d: 1, i: 'Grafiklerin başlıklarını oku. Her grafik farklı bir bilgi veriyor: biri <b>kişi</b>, biri <b>ürün</b>.', a: 'Daire grafiği işçi sayılarını, sütun grafiği üretilen ayakkabı sayılarını gösteriyor.' },
        { b: 'Dik açıyı gör', s: 'Bursa diliminin merkez açısı kaç derecedir?', tip: 'sayi', c: 90, birim: '°', i: 'Bursa diliminin merkezindeki <b>küçük kare</b> işareti hangi açıyı gösterir?', a: 'Küçük kare işareti dik açı demektir: Bursa = 90°' },
        { b: 'Eksik açı', s: 'Rize diliminin merkez açısı kaç derecedir?', tip: 'sayi', c: 70, birim: '°', i: 'Bütün daire 360°. Bildiğin açılar: Ankara 120°, Denizli 80°, Bursa 90°.', a: '360 − (120 + 80 + 90) = 70° → Rize' },
        { b: 'Ne isteniyor?', s: '“İşçi başına üretilen ayakkabı sayısı” nasıl bulunur?', tip: 'secim', o: ['Üretilen ayakkabı sayısı ÷ işçi sayısı', 'İşçi sayısı ÷ üretilen ayakkabı sayısı', 'Üretilen ayakkabı sayısı + işçi sayısı'], d: 0, i: '“Kişi başına” düşen miktar, toplam miktarı kişilere eşit paylaştırınca bulunur.', a: 'İşçi başına üretim = ayakkabı ÷ işçi. İşçi sayısı dilimin açısıyla orantılı olduğundan açıyı kullanabiliriz.' },
        { b: 'Karşılaştır', s: '1 derecelik dilime düşen ayakkabı sayısı Ankara’da 6000 ÷ 120 = 50’dir. Rize’de (5000 ayakkabı, 70°) bu sayı ne kadardır?', tip: 'secim', o: ['50’den az', 'Tam 50', '50’den fazla (yaklaşık 71)'], d: 2, i: '5000 ÷ 70 işlemini düşün: 70 × 50 = 3500. 5000, 3500’den büyük mü?', a: 'Rize ≈ 71; Ankara 50; Denizli 4000 ÷ 80 = 50; Bursa 3000 ÷ 90 ≈ 33' },
      ], cevap: 3, cozum: 'Açı başına (yani işçi başına) en çok ayakkabı Rize’de üretiliyor.' },
    { baslik: 'Atık Yemek', metin: '<i>Bir veri grubundaki sayıların toplamının, gruptaki terim sayısına bölümü ile elde edilen sayıya o veri grubunun aritmetik ortalaması denir.</i><br>Sıfır atık projesi kapsamında israfın önlenmesi ve sokak hayvanlarına yiyecek sağlanması amacıyla bir üniversite yemekhanesinde yemek masalarının yanına atık yemek kutuları yerleştirilmiştir. Bu yemekhanede bir hafta boyunca günlere göre biriken atık miktarları aşağıdaki grafikte gösterilmiştir.',
      sonra: 'Bu yemekhanede hafta sonları günlük 500 kg, hafta içleri günlük 1000 kg yemek çıkmaktadır.<br>Buna göre<br>I. Pazartesi günü çıkan yemeklerin % 10’u atık yemeğe dönüşmüştür.<br>II. En çok yemek cumartesi günü tüketilmiştir.<br>III. Hafta boyunca günlük ortalama atık miktarı 90 kg olmuştur.',
      kok: 'ifadelerinden hangileri doğrudur?', siklar: ['Yalnız I', 'Yalnız II', 'I ve III', 'II ve III'],
      adimlar: [
        { b: 'I. ifade', s: 'Pazartesi 1000 kg yemek çıktı (hafta içi). Grafiğe göre Pazartesi kaç kg atık oluştu?', tip: 'sayi', c: 100, birim: 'kg', i: 'Pazartesi sütununun tepesinden sola, dikey eksene bak.', a: '100 kg atık. 1000 kg’ın % 10’u = 100 kg → <b>I doğru</b>.' },
        { b: 'Tüketilen yemek', s: 'Tüketilen yemek = çıkan yemek − atık. Cumartesi kaç kg yemek tüketildi?', tip: 'sayi', c: 460, birim: 'kg', i: 'Cumartesi hafta sonu: 500 kg yemek çıkıyor. Grafikte Cumartesi atığı kaç kg?', a: '500 − 40 = 460 kg' },
        { b: 'II. ifade', s: 'Perşembe kaç kg yemek tüketildi?', tip: 'sayi', c: 940, birim: 'kg', i: 'Perşembe hafta içi (1000 kg). Atık: grafikteki Perşembe sütunu.', a: '1000 − 60 = 940 kg. Hafta içi her gün en az 860 kg tüketilmiş; Cumartesi (460 kg) en çok değil → <b>II yanlış</b>.' },
        { b: 'III. ifade', s: 'Hafta boyunca biriken toplam atık kaç kg’dır?', tip: 'sayi', c: 660, birim: 'kg', i: 'Yedi sütunu topla: 100 + 120 + 80 + 60 + 140 + 40 + 120', a: 'Toplam 660 kg' },
        { b: 'Ortalama', s: 'Günlük ortalama atık 90 kg mı?', tip: 'secim', o: ['Evet, 660 ÷ 7 = 90', 'Hayır, 660 ÷ 7 = 90 değildir (yaklaşık 94,3)'], d: 1, i: 'Ortalama = toplam ÷ gün sayısı. Hafta kaç gün? 90 × 7 kaç eder?', a: '90 × 7 = 630 ≠ 660 → <b>III yanlış</b>.' },
      ], cevap: 0, cozum: 'Yalnızca I doğrudur.' },
    { baslik: 'Trafikteki Araçlar', metin: 'Aşağıdaki daire grafiğinde 2016 yılında trafiğe kayıtlı toplam 10 800 ticari ve binek aracın bulunduğu bir ildeki bu araçların sayılarının dağılımı gösterilmiştir.',
      sonra: 'Bu ilde 2017 ve 2018 yıllarında trafiğe yeni katılan ve kayıtları silinen ticari ve binek araç sayıları yukarıdaki tabloda verilmiştir.',
      kok: 'Buna göre 2017 ve 2018 yıllarında bu ilde trafiğe kayıtlı olan ticari ve binek araç sayılarını gösteren sütun grafiği aşağıdakilerden hangisidir?',
      siklarHtml: [aracSik(8, 4, 9, 4), aracSik(8, 3, 9, 3), aracSik(8, 4, 8, 4), aracSik(7, 3, 8, 3)],
      adimlar: [
        { b: '1 derece', s: 'Bütün daire 10 800 araç. 1 derecelik dilim kaç araç gösterir?', tip: 'sayi', c: 30, i: 'Bütün daire 360°. 10 800’ü 360’a böl.', a: '10 800 ÷ 360 = 30 araç' },
        { b: '2016 ticari', s: '2016’da kaç ticari araç vardı?', tip: 'sayi', c: 3000, i: 'Ticari dilim 100°. Her derece 30 araç.', a: '100 × 30 = 3000 ticari, 10 800 − 3000 = 7800 binek araç' },
        { b: '2017 binek', s: '2017 sonunda kaç binek araç kayıtlıdır?', tip: 'sayi', c: 8000, i: 'Yeni katılanlar <b>eklenir</b>, kaydı silinenler <b>çıkarılır</b>: 7800 + 800 − 600', a: '7800 + 800 − 600 = 8000 binek' },
        { b: '2017 ticari', s: '2017 sonunda kaç ticari araç kayıtlıdır?', tip: 'sayi', c: 4000, i: '3000 + 1500 − 500', a: '4000 ticari' },
        { b: '2018', s: '2018 sonunda kaç binek araç kayıtlıdır? (2017’nin üzerine ekle)', tip: 'sayi', c: 9000, i: '2017’deki 8000 binekten devam et: 8000 + 1400 − 400. Ticari: 4000 + 400 − 400', a: '9000 binek, ticari ise 4000 + 400 − 400 = 4000' },
      ], cevap: 0, sonAdim: 'Binek: 8 bin → 9 bin, ticari: 4 bin → 4 bin. Hangi grafik bunu gösteriyor?', sonIpucu: 'Pembe sütunlar binek, mor sütunlar ticari. 2017 ve 2018 için iki sütunun yüksekliğini tek tek karşılaştır.', cozum: 'A grafiği: 2017’de 8 bin binek, 4 bin ticari; 2018’de 9 bin binek, 4 bin ticari.' },
    { baslik: 'Sinema Biletleri', metin: 'Aşağıda bir sinemada bir filmin gün içindeki 4 farklı gösteriminde satılan tam ve indirimli bilet sayıları verilmiştir.',
      sonra: `Bu sinema salonunda indirimli biletin ücreti tam biletin ücretinin ${kes(4, 5)}’ine eşittir.`,
      kok: 'Buna göre bu 4 gösterim için izleyicilerin ödediği toplam ücretin gösterimlere göre dağılımını gösteren dairesel grafik aşağıdakilerden hangisidir?',
      siklarHtml: [
        sinemaSik({ '11.30': 90, '15.00': 60, '18.30': 80, '21.00': 130 }, { yaz: ['18.30', '21.00'], dik: ['11.30'] }),
        sinemaSik({ '11.30': 60, '15.00': 90, '18.30': 100, '21.00': 110 }, { yaz: ['18.30', '21.00'], dik: ['15.00'] }),
        sinemaSik({ '11.30': 80, '15.00': 70, '18.30': 90, '21.00': 120 }, { yaz: ['11.30', '21.00'], dik: ['18.30'] }),
        sinemaSik({ '11.30': 90, '15.00': 60, '18.30': 90, '21.00': 120 }, { yaz: ['21.00'], dik: ['11.30', '18.30'] }),
      ],
      adimlar: [
        { b: 'Bilet fiyatı', s: 'Hesabı kolaylaştırmak için tam bilete 5 TL diyelim. İndirimli bilet kaç TL olur?', tip: 'sayi', c: 4, birim: 'TL', i: `İndirimli bilet, tam biletin ${kes(4, 5)}’i. 5’in ${kes(4, 5)}’i kaçtır?`, a: 'Tam 5 TL ise indirimli 4 TL. (Oranlar aynı kaldığı için daire grafiği değişmez.)' },
        { b: '11.30 geliri', s: '11.30 gösteriminde toplam kaç TL ödendi? (50 tam, 50 indirimli)', tip: 'sayi', c: 450, birim: 'TL', i: '50 × 5 + 50 × 4', a: '250 + 200 = 450 TL' },
        { b: '15.00 geliri', s: '15.00 gösteriminde kaç TL ödendi? (44 tam, 20 indirimli)', tip: 'sayi', c: 300, birim: 'TL', i: '44 × 5 + 20 × 4', a: '220 + 80 = 300 TL' },
        { b: 'Diğerleri', s: '21.00 gösteriminde kaç TL ödendi? (80 tam, 50 indirimli)', tip: 'sayi', c: 600, birim: 'TL', i: '80 × 5 + 50 × 4. 18.30 için de 74 × 5 + 20 × 4 = ?', a: '21.00: 600 TL, 18.30: 370 + 80 = 450 TL. Toplam 450 + 300 + 450 + 600 = 1800 TL' },
        { b: 'Açılar', s: '1800 TL bütün daireyse (360°), 1 derece kaç TL’dir?', tip: 'sayi', c: 5, birim: 'TL', i: '1800 ÷ 360', a: '1° = 5 TL → 11.30: 90°, 15.00: 60°, 18.30: 90°, 21.00: 120°' },
      ], cevap: 3, sonAdim: '11.30 ve 18.30: 90° (dik açı), 15.00: 60°, 21.00: 120°. Hangi grafik?', sonIpucu: 'İki dilimde dik açı (küçük kare) işareti olan grafiği ara; 21.00 dilimi 120° olmalı.', cozum: 'D grafiği: 11.30 ve 18.30 dik açı, 21.00 120°, kalan 15.00 60°.' },
    { baslik: 'Manav', metin: 'Bir matematik öğretmeni, bir manavın günlük sattığı meyve miktarlarını gösteren bir tablo hazırlamış ve öğrencilerinden bu tablodaki verileri daire veya sütun grafiğinde göstermelerini istemiştir. Bu sınıftaki öğrencilerden Hayat bu meyvelerden dördünün satış miktarını gösteren bir sütun grafiği, Zeynep ise tüm meyvelerin satış miktarlarının dağılımını gösteren bir daire grafiği çizmiştir.',
      kok: 'Buna göre bu manavda günlük satılan portakal miktarı en az kaç kilogramdır?', siklar: ['18', '30', '45', '60'],
      adimlar: [
        { b: 'Grafikleri eşleştir', s: 'Sütun grafiğindeki kivi, mandalina, ayva ve elma, daire grafiğinde hangi dilimin içindedir?', tip: 'secim', o: ['Portakal', 'Diğer Meyveler', 'Muz'], d: 1, i: 'Daire grafiğinde adı yazan meyveler: Portakal, Muz, Erik. Sütundaki meyvelerin adı dairede yazıyor mu?', a: 'Bu dört meyve “Diğer Meyveler” diliminde.' },
        { b: 'Diğer dilimin açısı', s: '“Diğer Meyveler” diliminin merkez açısı kaç derecedir?', tip: 'sayi', c: 210, birim: '°', i: 'Portakal diliminde dik açı işareti var (90°). Muz 30°, Erik 30°. Bütün daire 360°.', a: '360 − (90 + 30 + 30) = 210°' },
        { b: 'Dört meyve', s: 'Sütun grafiğindeki dört meyvenin toplamı kaç kg’dır?', tip: 'sayi', c: 105, birim: 'kg', i: '10 + 45 + 15 + 35', a: '105 kg' },
        { b: '“En az” ne demek?', s: '“Diğer Meyveler” dilimi en az kaç kg’dır?', tip: 'secim', o: ['Tam 105 kg', 'En az 105 kg (başka meyveler de olabilir)', 'En fazla 105 kg'], d: 1, i: 'Hayat “bu meyvelerden <b>dördünü</b>” çizmiş. Diğer meyveler diliminde başka meyveler de olabilir mi?', a: 'Diğer meyveler en az 105 kg. Portakalın en az değeri için bu dilimi 105 kg alırız.' },
        { b: 'Orantı', s: '210° → 105 kg ise 1° kaç kg’dır?', tip: 'sayi', c: 0.5, birim: 'kg', i: '105 ÷ 210. Sonuç 1’den küçük çıkabilir; ondalık sayı olarak yaz (0,5 gibi).', a: '1° = 0,5 kg → Portakal 90° × 0,5 = 45 kg' },
      ], cevap: 2, cozum: 'Portakal en az 90 × 0,5 = 45 kg’dır.' },
    { baslik: 'Tasarım-Beceri Atölyeleri', metin: 'Bir ilkokulda; sanat, kültür, yaşam, spor ve bilim alanlarında tasarım-beceri atölyeleri kurulmuş, her öğrenci tercih ettiği alandaki atölye çalışmalarından birine katılmıştır.',
      sonra: 'Yukarıdaki daire grafiğinde bu okuldaki öğrencilerin tercih ettiği tasarım-beceri alanlarına göre dağılımı, sütun grafiğinde ise sanat alanındaki atölye çalışmalarına katılan öğrencilerin dağılımı verilmiştir.',
      kok: 'Bu ilkokuldaki toplam öğrenci sayısı kaçtır?', siklar: ['360', '480', '540', '600'],
      adimlar: [
        { b: 'Sanat dilimi', s: 'Sanat diliminin merkez açısı kaç derecedir?', tip: 'sayi', c: 120, birim: '°', i: 'Spor diliminde dik açı işareti var. Kültür 60°, Yaşam 30°, Bilim 60°. Bütün daire 360°.', a: '360 − (60 + 30 + 90 + 60) = 120°' },
        { b: 'Sanattaki öğrenciler', s: 'Sanat alanındaki atölyelere toplam kaç öğrenci katılmıştır?', tip: 'sayi', c: 180, i: 'Sütun grafiğindeki üç atölyeyi topla: Ahşap ve Metal, Görsel Sanatlar, Müzik.', a: '40 + 80 + 60 = 180 öğrenci' },
        { b: 'Dairenin ne kadarı?', s: '120° bütün dairenin kaçta kaçıdır?', tip: 'secim', o: [kes(1, 2), kes(1, 3), kes(1, 4)], d: 1, i: '360° bütündür. 120 × ? = 360', a: `120 ÷ 360 = ${kes(1, 3)} → sanat öğrencileri tüm öğrencilerin üçte biri.` },
      ], cevap: 2, sonAdim: '180 öğrenci tüm öğrencilerin üçte biri ise okulda kaç öğrenci vardır?', sonIpucu: 'Üçte biri 180 olan sayı: 180 × 3', cozum: '180 × 3 = 540 öğrenci.' },
    { baslik: 'Defolu Ürünler', metin: 'Bir konfeksiyon atölyesinde mart ayı boyunca toplam 3600 tane ürün dikilmiştir. Aşağıdaki daire grafiğinde bu ürünlerin türlerine göre dağılımı, sütun grafiğinde ise türlerine göre bu ürünlerin yüzde kaçının defolu çıktığı gösterilmiştir.',
      sonra: 'Atölyede mart ayında dikilen gömleklerin 135 tanesi defolu olup, defolu kazak sayısı, defolu pantolon sayısına eşittir.',
      kok: 'Buna göre atölyede mart ayında dikilen eteklerin kaç tanesi defoludur?', siklar: ['105', '90', '75', '60'],
      adimlar: [
        { b: '1 derece', s: '3600 ürün bütün daireyse 1 derecelik dilim kaç ürün gösterir?', tip: 'sayi', c: 10, i: '3600 ÷ 360', a: '1° = 10 ürün' },
        { b: 'Kazak', s: 'Kaç kazak dikilmiştir? Bunların kaçı defoludur? (Defolu kazak sayısını yaz)', tip: 'sayi', c: 100, i: 'Kazak dilimi 50° → 50 × 10 = 500 kazak. Sütun grafiğine göre kazakların % 20’si defolu.', a: '500 kazağın % 20’si = 100 defolu kazak' },
        { b: 'Pantolon', s: 'Defolu pantolon sayısı da 100. Pantolonların % 10’u defolu ise kaç pantolon dikilmiştir?', tip: 'sayi', c: 1000, i: '% 10’u 100 olan sayı: 100 × 10', a: '1000 pantolon (100°)' },
        { b: 'Gömlek', s: '135 defolu gömlek var. Gömleklerin % 15’i defolu ise kaç gömlek dikilmiştir?', tip: 'sayi', c: 900, i: '% 15’i 135 olan sayı: 135 ÷ 15 = 9 → % 1’i 9 ise % 100’ü?', a: '900 gömlek (90°)' },
        { b: 'Etek', s: 'Kaç etek dikilmiştir?', tip: 'sayi', c: 1200, i: 'Toplamdan diğerlerini çıkar: 3600 − (500 + 1000 + 900)', a: '1200 etek (120°)' },
      ], cevap: 3, sonAdim: 'Eteklerin % 5’i defolu. Kaç defolu etek vardır?', sonIpucu: '1200’ün % 5’i: 1200 × 5 ÷ 100', cozum: '1200 × 5 ÷ 100 = 60 defolu etek.' },
  ];

  yeniNesil({ key: 'hp-yn-veri-v1', kaynak: KAYNAK, sorular: SORULAR, ciz: CIZ, unvan: 'Grafik dedektifi!', kural: 'Daire grafiğinde önce <b>1 derecenin</b> neye karşılık geldiğini bul; iki grafik varsa ortak bilgiyi (aynı dilim, aynı kişi) yakala.' });
})();
