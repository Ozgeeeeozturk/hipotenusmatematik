/* Yeni Nesil Problemler · Çarpanlar ve Katlar (8. sınıf)
   Sorular: MEB 8. Sınıf Matematik Örnek Soruları (1. Ünite). Çözüm adımları, ipuçları ve çizimler Hipotenüs’e aittir. */
(function () {
  initPage();
  const stage = document.getElementById('stage');
  const KAYNAK = 'Kaynak: MEB, 8. Sınıf Matematik Örnek Soruları, 1. Ünite: Çarpanlar ve Katlar';
  const KEY = 'hp-yn-carpan-v1';
  const kes = (p, q) => `<span class="f"><i>${p}</i><i>${q}</i></span>`;

  // ---------- Özgün çizimler ----------
  const SVG = (w, h, ic, et) => `<svg viewBox="0 0 ${w} ${h}" class="yn-svg" role="img" aria-label="${et}">${ic}</svg>`;
  const bisiklet = (x, r, et) => {
    const g = 150, t1 = x, t2 = x + r * 2 + 70;
    const teker = cx => `<circle cx="${cx}" cy="${g - r}" r="${r}" fill="none" stroke="#2D2440" stroke-width="5"/><circle cx="${cx}" cy="${g - r}" r="${r - 6}" fill="none" stroke="#B9B1C9" stroke-width="1.5"/><circle cx="${cx}" cy="${g - r}" r="4" fill="#2D2440"/>`;
    return `${teker(t1)}${teker(t2)}<path d="M${t1} ${g - r} L${(t1 + t2) / 2 - 10} ${g - r - 8} L${t2} ${g - r} M${(t1 + t2) / 2 - 10} ${g - r - 8} L${t1 + 18} ${g - r - r * 0.9} M${t2} ${g - r} L${t2 - 10} ${g - r - r * 0.9}" stroke="${et}" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="${t1 + 8}" y="${g - r - r * 0.9 - 6}" width="22" height="6" rx="3" fill="#2D2440"/><line x1="${t2 + r + 8}" y1="${g - r}" x2="${t2 + r + 8}" y2="${g}" stroke="#C2415B" stroke-width="2"/><text x="${t2 + r + 12}" y="${g - r / 2 + 4}" class="yn-et">${r === 30 ? 30 : 40} cm</text>`;
  };
  const CIZ = {
    1: () => `<table class="vd-tablo yn-tab"><tr><th>Söylenen Sayı</th><th>Söyleyen</th><th>Ahmet’in Aldığı Puan</th><th>Deniz’in Aldığı Puan</th></tr><tr><td>10</td><td>Ahmet</td><td>10</td><td>1 + 2 + 5 = 8</td></tr><tr><td>12</td><td>Deniz</td><td>1 + 2 + 3 + 4 + 6 = 16</td><td>12</td></tr></table>`,
    2: () => SVG(560, 160, `<line x1="0" y1="150" x2="560" y2="150" stroke="#2D2440" stroke-width="3"/>${bisiklet(50, 30, '#2E9E78')}${bisiklet(320, 40, '#7B4FA8')}`, 'Teker yarıçapları 30 cm ve 40 cm olan iki bisiklet'),
    3: () => SVG(460, 190, [['A', 20, 70, '#7CC79A', '#2E9E78', 40], ['B', 44, 160, '#FFD84D', '#C99A12', 250]].map(([m, y, f, r, k, x]) => `<path d="M${x + 20} 40 Q${x} 120 ${x + 20} 175 L${x + 150} 175 Q${x + 170} 120 ${x + 150} 40 Z" fill="${r}" stroke="${k}" stroke-width="3"/><path d="M${x + 20} 40 Q${x + 85} 25 ${x + 150} 40" fill="none" stroke="${k}" stroke-width="4"/><rect x="${x + 40}" y="80" width="90" height="46" rx="6" fill="rgba(255,255,255,.85)"/><text x="${x + 85}" y="99" text-anchor="middle" class="yn-et b">${m} Gübresi</text><text x="${x + 85}" y="117" text-anchor="middle" class="yn-et b">% ${y} Azot</text><text x="${x + 32}" y="162" class="yn-et b">50 kg</text><g transform="translate(${x + 120} 14) rotate(-18)"><rect width="58" height="24" rx="5" fill="#FFF4C2" stroke="#E0B820" stroke-width="2"/><text x="29" y="17" text-anchor="middle" class="yn-et b">${f} TL</text></g>`).join(''), 'A ve B gübre torbaları'),
    4: () => { const sira = (y, k, n) => Array.from({ length: n }, (_, i) => `<rect x="${30 + i * k * 5}" y="${y - k * 5}" width="${k * 5}" height="${k * 5}" fill="#fff" stroke="#2D2440" stroke-width="1.8"/>`).join('') + `<text x="${30 + n * k * 5 + 30}" y="${y - k * 2}" class="yn-et">. . .</text>` + Array.from({ length: 2 }, (_, i) => `<rect x="${420 + i * k * 5}" y="${y - k * 5}" width="${k * 5}" height="${k * 5}" fill="#fff" stroke="#2D2440" stroke-width="1.8"/>`).join('') + `<text x="${30}" y="${y + 16}" class="yn-et">A</text><text x="${420 + 2 * k * 5 - 6}" y="${y + 16}" class="yn-et">B</text><text x="2" y="${y - k * 2}" class="yn-et">${k} cm</text>`;
      return SVG(520, 230, `<line x1="30" y1="30" x2="490" y2="30" stroke="#2D2440" stroke-width="2.5"/><line x1="30" y1="24" x2="30" y2="36" stroke="#2D2440" stroke-width="2.5"/><line x1="490" y1="24" x2="490" y2="36" stroke="#2D2440" stroke-width="2.5"/><text x="26" y="52" class="yn-et">A</text><text x="484" y="52" class="yn-et">B</text>${sira(120, 5, 3)}<line x1="30" y1="120" x2="${420 + 50}" y2="120" stroke="#2D2440" stroke-width="2"/>${sira(205, 7, 3)}<line x1="30" y1="205" x2="${420 + 70}" y2="205" stroke="#2D2440" stroke-width="2"/>`, 'AB doğru parçası ve 5 cm, 7 cm kenarlı kareler'); },
    5: () => SVG(460, 220, `<g transform="translate(40 30)"><path d="M0 40 L50 20 L100 40 L50 60 Z" fill="#E9D9B8" stroke="#8C6A3A" stroke-width="2.5"/><path d="M0 40 L50 60 L50 180 L0 160 Z" fill="#D7BE8E" stroke="#8C6A3A" stroke-width="2.5"/><path d="M100 40 L50 60 L50 180 L100 160 Z" fill="#C4A46E" stroke="#8C6A3A" stroke-width="2.5"/><text x="112" y="110" class="yn-et">80 cm</text><text x="62" y="20" class="yn-et">30 cm</text></g><g transform="translate(250 10)"><rect x="0" y="10" width="170" height="190" fill="#EAF6FF" stroke="#2D2440" stroke-width="2"/><text x="85" y="8" text-anchor="middle" class="yn-et">Tavan</text><text x="85" y="216" text-anchor="middle" class="yn-et">Zemin</text>${[0, 1, 2, 3, 4].map(i => `<rect x="${20 + (i % 2) * 70}" y="${200 - (i < 2 ? 1 : i < 4 ? 2 : 3) * 40 + (i % 2 ? 0 : 0)}" width="60" height="40" fill="#D7BE8E" stroke="#8C6A3A" stroke-width="1.5"/>`).join('')}<text x="85" y="60" text-anchor="middle" class="yn-et">. . .</text></g>`, 'Kare dik prizma koli ve soğuk hava deposu'),
    6: () => { const k = x => `<g transform="translate(${x} 0)"><rect x="0" y="60" width="60" height="44" rx="10" fill="#E5333B"/><rect x="6" y="104" width="48" height="14" rx="4" fill="#B02A31"/><line x1="30" y1="118" x2="30" y2="140" stroke="#2D2440" stroke-width="4"/><line x1="12" y1="142" x2="48" y2="142" stroke="#2D2440" stroke-width="4"/></g>`;
      return SVG(560, 180, `<rect x="10" y="20" width="540" height="140" fill="#FFF4C2" stroke="#C99A12" stroke-width="2"/><rect x="10" y="144" width="540" height="16" fill="#D7BE8E"/>${k(10)}${k(95)}${k(180)}<text x="300" y="100" class="yn-et">. . .</text>${k(440)}<line x1="70" y1="54" x2="95" y2="54" stroke="#2E9E78" stroke-width="2"/><text x="66" y="48" class="yn-et k">25 cm</text><line x1="500" y1="54" x2="550" y2="54" stroke="#2E9E78" stroke-width="2" stroke-dasharray="3 3"/><line x1="10" y1="168" x2="70" y2="168" stroke="#C2415B" stroke-width="2"/><text x="24" y="178" class="yn-et k">60 cm</text>`, 'Toplantı salonunda aralıklı dizilmiş koltuklar'); },
    7: () => { const gri = (x, y) => `<rect x="${x}" y="${y}" width="70" height="40" fill="#B9B9C3" stroke="#6E6E7A" stroke-width="1.5"/>`, sari = x => `<rect x="${x}" y="64" width="40" height="40" fill="#FFE27A" stroke="#C99A12" stroke-width="1.5"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${x + 4}" y="${68 + i * 7.4}" width="32" height="4" rx="2" fill="#F2C230"/>`).join('')}`;
      return SVG(560, 170, `${[0, 1, 2].map(i => gri(20 + i * 70, 20) + gri(20 + i * 70, 108)).join('')}${[0, 1, 2, 3, 4].map(i => sari(20 + i * 40)).join('')}<text x="250" y="90" class="yn-et">. . .</text>${gri(330, 20)}${gri(400, 20)}${gri(330, 108)}${gri(400, 108)}${[0, 1, 2].map(i => sari(350 + i * 40)).join('')}<line x1="20" y1="158" x2="90" y2="158" stroke="#C2415B" stroke-width="2"/><text x="40" y="168" class="yn-et k">70 cm</text><line x1="20" y1="110" x2="60" y2="110" stroke="#C2415B" stroke-width="2"/><text x="64" y="114" class="yn-et k">40 cm</text>`, 'Gri dikdörtgen taşlar ve sarı kabartmalı taşlar'); },
  };

  // ---------- Sorular (MEB metni aynen) ve özgün adımlar ----------
  const SORULAR = [
    { baslik: 'Sayı Oyunu', metin: 'Ahmet ile Deniz aralarında sırasıyla birer tane pozitif tam sayı söyledikleri bir sayı oyunu oynuyorlar. Oyuncunun söylediği sayı kadar puan kendisine, söylediği sayının kendisi hariç pozitif tam sayı bölenlerinin toplamı kadar puan rakibine yazılıyor. Toplam puanı fazla olan oyuncu oyunu kazanıyor. Örneğin Ahmet 10, Deniz 12 sayılarını söylemiş olsunlar.',
      sonra: 'Oyunda Ahmet toplam 26, Deniz toplam 20 puan aldığından oyunu Ahmet kazanır.', kok: 'Buna göre Ahmet’in 14 sayısını söylediği oyunda, Deniz aşağıdaki sayılardan hangisini söylerse oyunu kazanır?', siklar: ['18', '20', '25', '36'],
      adimlar: [
        { b: 'Kuralı anla', s: 'Bir oyuncu bir sayı söylediğinde <b>rakibine</b> kaç puan yazılır?', tip: 'secim', o: ['Söylediği sayı kadar', 'Sayının kendisi hariç pozitif bölenlerinin toplamı kadar', 'Sayının bütün bölenlerinin toplamı kadar'], d: 1, i: 'Tablodaki örneğe bak: Ahmet 10 dedi, Deniz’e <b>1 + 2 + 5</b> yazıldı. 10’un bölenleri 1, 2, 5 ve 10’dur. Hangisi toplamda yok?', a: '10’un bölenleri 1, 2, 5, 10; kendisi (10) hariç toplanınca 8 olur.' },
        { b: 'Ahmet’in hamlesi', s: 'Ahmet 14 dedi. Bu hamleden <b>Deniz’e</b> kaç puan yazılır?', tip: 'sayi', c: 10, i: '14’ü tam bölen pozitif sayıları bul: 14 = 1 × 14 = 2 × 7. Sonra <b>14’ün kendisini çıkarıp</b> kalanları topla.', a: '14’ün bölenleri: 1, 2, 7, 14 → 1 + 2 + 7 = 10. Ahmet 14 puan, Deniz 10 puan aldı.' },
        { b: 'Kazanma şartı', s: 'Deniz bir <b>n</b> sayısı söylesin. Deniz’in toplamı 10 + n, Ahmet’in toplamı 14 + (n’nin kendisi hariç bölenlerinin toplamı) olur. Deniz’in kazanması için hangisi gerekir?', tip: 'secim', o: ['n, kendisi hariç bölenlerinin toplamından en az 1 büyük olmalı', 'n, kendisi hariç bölenlerinin toplamından 4’ten fazla büyük olmalı', 'n bir asal sayı olmalı'], d: 1, i: 'Ahmet şu an 14 − 10 = <b>4 puan önde</b>. Deniz’in bu farkı kapatıp geçmesi lazım: kendi aldığı puan, Ahmet’e verdiği puandan ne kadar fazla olmalı?', a: '10 + n > 14 + (bölenler toplamı) → n − (bölenler toplamı) > 4' },
        { b: 'Seçenekleri dene', s: '25 sayısının kendisi hariç pozitif bölenlerinin toplamı kaçtır?', tip: 'sayi', c: 6, i: '25 = 5 × 5. 25’i tam bölen sayılar 1, 5 ve 25’tir. Kendisini saymıyoruz.', a: '25 → 1 + 5 = 6. 25 − 6 = 19 > 4 ✓<br>Diğerleri: 18 → 1+2+3+6+9 = 21 (18 − 21 < 0), 20 → 1+2+4+5+10 = 22, 36 → 1+2+3+4+6+9+12+18 = 55. Hiçbiri şartı sağlamaz.' },
      ], cevap: 2, cozum: 'Deniz 25 derse Deniz 10 + 25 = 35, Ahmet 14 + 6 = 20 puan alır; Deniz kazanır.' },
    { baslik: 'Bisikletler', metin: 'Yarıçapının uzunluğu r olan bir çemberin çevresi 2πr’dir. Mehmet bisiklet almak için bisikletçiye gidiyor ve tekerlerin merkezlerinin yere olan uzaklıkları 30 cm ile 40 cm olan iki farklı bisikleti beğeniyor.',
      sonra: 'Bu iki bisikleti aynı mesafede sürerek deneyen Mehmet, her iki bisikletin de tekerlerinin tam tur atarak mesafeyi tamamladığını görüyor.', kok: 'Buna göre Mehmet’in bisikletleri denediği mesafe en az kaç santimetredir? (π yerine 3 alınız.)', siklar: ['400', '420', '700', '720'],
      adimlar: [
        { b: 'Şekli oku', s: 'Tekerin merkezinin yere olan uzaklığı, tekerin hangi elemanıdır?', tip: 'secim', o: ['Çapı', 'Yarıçapı', 'Çevresi'], d: 1, i: 'Teker yere bir noktada değer. Merkezden bu noktaya çizilen doğru parçası, merkezi çemberin üzerindeki bir noktaya birleştirir. Buna ne denir?', a: 'Merkezden çembere olan uzaklık <b>yarıçaptır</b>: r = 30 cm ve r = 40 cm.' },
        { b: 'Bir tur', s: 'Teker <b>bir tam tur</b> attığında bisiklet ne kadar yol alır?', tip: 'secim', o: ['Tekerin yarıçapı kadar', 'Tekerin çapı kadar', 'Tekerin çevresi kadar'], d: 2, i: 'Tekerin üzerine bir boya sürdüğünü düşün. Bir tur dönünce yerde bıraktığı iz, tekerin hangi uzunluğuna eşittir?', a: 'Bir turda alınan yol = çevre = 2πr' },
        { b: 'Küçük teker', s: 'Yarıçapı 30 cm olan tekerin çevresi kaç cm’dir? (π = 3)', tip: 'sayi', c: 180, i: '2 × π × r formülünde π yerine 3, r yerine 30 koy.', a: '2 × 3 × 30 = 180 cm' },
        { b: 'Büyük teker', s: 'Yarıçapı 40 cm olan tekerin çevresi kaç cm’dir?', tip: 'sayi', c: 240, i: 'Aynı formül: 2 × 3 × 40', a: '2 × 3 × 40 = 240 cm' },
        { b: 'Kavramı seç', s: 'Mesafe, iki teker de tam tur attığı için hem 180’in hem 240’ın katıdır. Soruda “<b>en az</b>” isteniyor. Hangisini bulmalıyız?', tip: 'secim', o: ['EBOB(180, 240)', 'EKOK(180, 240)', '180 + 240'], d: 1, i: 'İki sayının <b>ortak katlarının en küçüğü</b> mü, <b>ortak bölenlerinin en büyüğü</b> mü isteniyor? “Tam tur” = mesafe çevrenin katı.', a: 'Ortak katların en küçüğü → <b>EKOK</b>' },
        { b: 'Hesapla', s: 'EKOK(180, 240) kaçtır?', tip: 'sayi', c: 720, i: 'Asal çarpanlara ayır: 180 = 2² · 3² · 5 ve 240 = 2⁴ · 3 · 5. Her asal çarpanın <b>en büyük kuvvetini</b> al ve çarp.', a: '2⁴ · 3² · 5 = 16 · 9 · 5 = 720. Küçük teker 4 tur, büyük teker 3 tur atar.' },
      ], cevap: 3, cozum: 'Mesafe en az 720 cm’dir.' },
    { baslik: 'Gübre', metin: 'Bir çiftçi yaptırdığı toprak analizi sonucunda tarlasının ihtiyacı olan azot miktarını belirliyor. Bu ihtiyacı karşılamak için torbalar halinde satılan A ve B marka gübrelerinden birini tercih edecektir.',
      sonra: 'Çiftçi hangi markayı tercih ederse etsin aldığı gübrenin tamamını kullandığında toprağın ihtiyacı olan azot miktarının tam karşılandığını görüyor. Daha az ödeme yapacak şekilde bir tercihte bulunan çiftçi aldığı gübre için 1000 TL’den az ödüyor.', kok: 'Buna göre çiftçi diğer markayı tercih etseydi kaç TL daha fazla ödeme yapardı?', siklar: ['15', '30', '45', '60'],
      adimlar: [
        { b: 'A torbası', s: '50 kg’lık A torbasında kaç kg azot vardır? (% 20 azot)', tip: 'sayi', c: 10, i: '% 20, “100’de 20” demektir. 50’nin yüzde 20’si = 50 × 20 ÷ 100. İstersen şöyle düşün: % 20 = 1/5.', a: '50 × 20 ÷ 100 = 10 kg azot' },
        { b: 'B torbası', s: '50 kg’lık B torbasında kaç kg azot vardır? (% 44 azot)', tip: 'sayi', c: 22, i: '50 × 44 ÷ 100 işlemini yap. 50, 100’ün yarısıdır.', a: '50 × 44 ÷ 100 = 22 kg azot' },
        { b: 'Anahtar cümle', s: '“Hangi markayı tercih ederse etsin … ihtiyacın <b>tam</b> karşılandığını görüyor.” Bu cümleye göre tarlanın azot ihtiyacı için ne söylenebilir?', tip: 'secim', o: ['10 ile 22’nin toplamıdır', 'Hem 10’un hem 22’nin katıdır', '10 ile 22’nin ortak bölenidir'], d: 1, i: 'Çiftçi torbaları bölmeden, tamamını kullanıyor. A torbalarıyla tam karşılanıyorsa ihtiyaç 10’un kaç katı olabilir? B ile de tam karşılanıyorsa?', a: 'İhtiyaç hem 10’un hem 22’nin katıdır → ortak kat. EKOK(10, 22) = 110 kg ve katları.' },
        { b: 'Maliyet', s: 'İhtiyaç 110 kg ise A markasından kaç torba alınır?', tip: 'sayi', c: 11, i: 'Her A torbasında 10 kg azot var. 110 kg için kaç torba gerekir?', a: '110 ÷ 10 = 11 torba → 11 × 70 = 770 TL. B ile: 110 ÷ 22 = 5 torba → 5 × 160 = 800 TL.' },
        { b: '1000 TL şartı', s: 'Daha ucuz seçenek 1000 TL’den az tutuyor. İhtiyaç hangisi olabilir?', tip: 'secim', o: ['110 kg', '220 kg', '330 kg'], d: 0, i: '110 kg için ucuz seçenek 770 TL. İhtiyaç 220 kg olsaydı her şey iki katına çıkardı: 770 × 2 = ?', a: '220 kg olsaydı ucuz seçenek bile 1540 TL olurdu. Bu yüzden ihtiyaç 110 kg.' },
      ], cevap: 1, cozum: 'A: 770 TL, B: 800 TL. Diğer markayı (B) seçseydi 800 − 770 = 30 TL fazla öderdi.' },
    { baslik: 'Kareler', metin: 'Aşağıda uzunluğu 360 cm ile 400 cm arasında olan AB doğru parçası verilmiştir. Bu doğru parçasının üzerine kenar uzunlukları 5 cm ve 7 cm’lik kareler birer kenarları ortak olacak şekilde boşluk kalmadan ve doğru parçasından taşmadan yerleştirilebiliyor.',
      sonra: '', kok: 'Buna göre aşağıdaki karelerden hangisi yeteri kadar kullanılıp yukarıdaki gibi yerleştirildiğinde doğru parçasında boşluk ve taşma olmaz?', siklar: ['25 cm', '55 cm', '70 cm', '105 cm'],
      adimlar: [
        { b: 'Ne anlatıyor?', s: '5 cm’lik kareler AB’yi boşluksuz ve taşmadan kaplıyorsa AB’nin uzunluğu için ne söylenebilir?', tip: 'secim', o: ['5’in katıdır', '5’in bölenidir', '5’ten küçüktür'], d: 0, i: 'Kareler yan yana diziliyor: 5, 10, 15, … Toplam uzunluk hep hangi sayının katı olur?', a: 'AB, 5’in katıdır. Aynı şekilde 7’nin de katıdır.' },
        { b: 'Ortak kat', s: 'AB hem 5’in hem 7’nin katıdır. 5 ile 7’nin en küçük ortak katı kaçtır?', tip: 'sayi', c: 35, i: '5 ile 7 asal sayılar ve ortak bölenleri yalnızca 1. Böyle iki sayının EKOK’u nedir?', a: 'EKOK(5, 7) = 35. AB, 35’in katıdır.' },
        { b: 'Aralığı kullan', s: '360 cm ile 400 cm arasındaki 35’in katı kaçtır?', tip: 'sayi', c: 385, i: '35’in katlarını say: 35 × 10 = 350 (360’tan küçük). Bir sonraki kat?', a: '35 × 11 = 385 cm. (35 × 12 = 420, 400’den büyük.) Demek ki AB = 385 cm.' },
      ], cevap: 1, sonAdim: 'Seçeneklerden hangisi 385’i tam böler?', sonIpucu: '385 = 5 × 7 × 11. Her seçenekteki kenar uzunluğu ile 385’i bölmeyi dene.', cozum: '385 ÷ 55 = 7 kare. 385, 25’e, 70’e ve 105’e tam bölünmez.' },
    { baslik: 'Koliler', metin: 'Yukarıdaki kare dik prizma şeklindeki koliler herhangi bir yüzeyi üzerinde üst üste konularak hiç boşluk kalmadan yüksekliği 3 metreden az olan bir soğuk hava deposunda tavana kadar yerleştirilebilmektedir.',
      sonra: '', kok: 'Bu işlem aşağıdaki kare dik prizma şeklindeki kolilerden hangisi ile de yapılabilir?', siklar: ['90 cm ve 20 cm', '60 cm ve 120 cm', '50 cm ve 180 cm', '45 cm ve 60 cm'],
      adimlar: [
        { b: 'Koliyi tanı', s: 'Koli <b>herhangi bir yüzeyi</b> üzerine konulabiliyor. Bir koli kaç cm yükseklik kaplayabilir?', tip: 'secim', o: ['Yalnızca 80 cm', 'Yalnızca 30 cm', 'Hangi yüzeyi üzerine konduğuna göre 30 cm ya da 80 cm'], d: 2, i: 'Koliyi yatırıp dikince yüksekliği değişir mi? Kare dik prizmanın kaç farklı kenar uzunluğu var?', a: 'Koli yatık konursa 30 cm, dik konursa 80 cm yükseklik kaplar.' },
        { b: 'Ortak kat', s: 'Depo yüksekliği kolilerin hangi yüzeyi üzerine konduğundan bağımsız olarak tam doluyor; yani hem 30’un hem 80’in katı. EKOK(30, 80) kaçtır?', tip: 'sayi', c: 240, i: '30 = 2 · 3 · 5, 80 = 2⁴ · 5. Her asal çarpanın en büyük kuvvetini al.', a: 'EKOK = 2⁴ · 3 · 5 = 240 cm' },
        { b: 'Yükseklik', s: 'Depo yüksekliği 3 metreden az. Depo kaç cm’dir?', tip: 'secim', o: ['120 cm', '240 cm', '480 cm'], d: 1, i: '3 m = 300 cm. 240’ın katlarından hangisi 300’den küçük?', a: '240, 480, … içinde 300’den küçük olan yalnızca 240 cm.' },
      ], cevap: 1, sonAdim: 'Hangi kolinin iki kenar uzunluğu da 240’ı tam böler?', sonIpucu: 'Yeni koli de hangi yüzeyi üzerine konursa konsun 240 cm’yi tam doldurmalı. İki boyuta da bak!', cozum: '240 ÷ 60 = 4 ve 240 ÷ 120 = 2 → B. (90, 50, 180 ve 45, 240’ı tam bölmez.)' },
    { baslik: 'Koltuklar', metin: 'Bir toplantı salonuna genişliği 60 cm olan koltuklar, bir doğru boyunca aralarında 25 cm boşluk bulunacak şekilde yerleştirilmiştir. İlk koltuk ile duvar arasında boşluk olmayıp son koltuk ile duvar arasında ise 25 cm boşluk vardır.',
      sonra: 'Bu salona daha fazla koltuk yerleştirmek için koltuklar, bir doğru boyunca aralarında 15 cm boşluk bulunacak şekilde yeniden düzenlenmiştir. Bu düzenlemede ilk koltuk ile duvar arasında boşluk olmayıp son koltukla duvar arasında da 15 cm boşluk kalmıştır.', kok: 'Bu durumda salondaki bir sıraya aynı koltuklardan en az kaç tane daha yerleştirilmiştir?', siklar: ['1', '2', '3', '4'],
      adimlar: [
        { b: 'Koltuk + boşluk', s: 'İlk düzende her koltuk, <b>kendisinden sonraki boşlukla birlikte</b> kaç cm yer kaplar?', tip: 'sayi', c: 85, i: 'Son koltuktan sonra da 25 cm boşluk var. Yani her koltuğun arkasına bir boşluk düşüyor: koltuk + boşluk.', a: '60 + 25 = 85 cm. Sıranın uzunluğu 85’in katıdır.' },
        { b: 'Yeni düzen', s: 'İkinci düzende koltuk ve boşluk birlikte kaç cm’dir?', tip: 'sayi', c: 75, i: 'Bu kez boşluklar 15 cm.', a: '60 + 15 = 75 cm. Sıranın uzunluğu 75’in de katıdır.' },
        { b: 'Salon genişliği', s: 'Salon genişliği hem 85’in hem 75’in katı. “En az” istendiği için en küçük ortak katı al: EKOK(85, 75) kaçtır?', tip: 'sayi', c: 1275, i: '85 = 5 · 17, 75 = 3 · 5². Ortak çarpan 5; her çarpanın en büyük kuvvetini al: 3 · 5² · 17', a: 'EKOK = 3 · 25 · 17 = 1275 cm' },
        { b: 'İlk düzen', s: '1275 cm’lik sıraya ilk düzende kaç koltuk sığar?', tip: 'sayi', c: 15, i: 'Her koltuk boşluğuyla 85 cm. 1275 ÷ 85 = ?', a: '1275 ÷ 85 = 15 koltuk' },
        { b: 'İkinci düzen', s: 'İkinci düzende kaç koltuk sığar?', tip: 'sayi', c: 17, i: '1275 ÷ 75 = ?', a: '1275 ÷ 75 = 17 koltuk' },
      ], cevap: 1, cozum: '17 − 15 = 2 koltuk daha. Salon 1275’in daha büyük bir katı olsaydı fark daha fazla olurdu; “en az” 2’dir.' },
    { baslik: 'Kaldırım Taşları', metin: 'Belediye görevlileri kaldırımlardaki dikdörtgenler prizması şeklindeki taşların arasına, görme engellilere yön belirlemede kolaylık sağlayacak üst yüzeyi kabartmalı kare prizma şeklindeki sarı renkli taşlar yerleştirmişlerdir.',
      sonra: 'Uzunluğu 30 metreden az olan düz bir kaldırıma bu taşlar görseldeki gibi bölünmeden, üst üste gelmeden ve aralarında boşluk kalmadan yerleştirilmiştir.', kok: 'Bu kaldırıma yerleştirilen üst yüzeyi kabartmalı kare prizma şeklindeki sarı renkli taşların sayısı en çok kaçtır?', siklar: ['40', '44', '70', '74'],
      adimlar: [
        { b: 'Şekli oku', s: 'Gri taşların uzunluğu 70 cm, sarı taşlarınki 40 cm. İki sıra da kaldırımın başından sonuna tam doluyor. Kaldırımın uzunluğu için ne söylenebilir?', tip: 'secim', o: ['70 ile 40’ın toplamıdır', 'Hem 70’in hem 40’ın katıdır', '70 ile 40’ın ortak bölenidir'], d: 1, i: 'Taşlar bölünmüyor ve boşluk kalmıyor. Gri sıra 70, 140, 210 … diye uzar; sarı sıra 40, 80, 120 … Kaldırım iki sıraya da uymalı.', a: 'Kaldırım uzunluğu 70 ile 40’ın ortak katıdır.' },
        { b: 'EKOK', s: 'EKOK(70, 40) kaçtır?', tip: 'sayi', c: 280, i: '70 = 2 · 5 · 7, 40 = 2³ · 5. Her asal çarpanın en büyük kuvvetini al.', a: '2³ · 5 · 7 = 280 cm. Kaldırım 280’in katıdır.' },
        { b: 'Birimi çevir', s: '30 metre kaç santimetredir?', tip: 'sayi', c: 3000, i: '1 m = 100 cm', a: '30 m = 3000 cm' },
        { b: 'En uzun kaldırım', s: '“En çok” sarı taş için kaldırım en uzun olmalı. 3000’den küçük, 280’in en büyük katı kaçtır?', tip: 'sayi', c: 2800, i: '280 × 10 = 2800. Bir sonraki kat 3000’i geçer mi?', a: '280 × 10 = 2800 cm (280 × 11 = 3080 > 3000)' },
      ], cevap: 2, sonAdim: '2800 cm’lik kaldırıma kaç sarı taş sığar?', sonIpucu: 'Her sarı taş 40 cm. 2800 ÷ 40 = ?', cozum: '2800 ÷ 40 = 70 sarı taş.' },
  ];

  // ---------- Durum ----------
  let D = { bitti: {}, hatasiz: {} };
  try { D = Object.assign(D, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const kaydet = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} };
  let aktif = 0;

  function secici() {
    return `<div class="yn-secici" role="group" aria-label="Soru seç">${SORULAR.map((S, i) => `<button class="yn-no${i === aktif ? ' aktif' : ''}${D.bitti[i] ? ' bitti' : ''}" data-q="${i}" aria-label="${i + 1}. soru${D.bitti[i] ? ', tamamlandı' : ''}">${D.bitti[i] ? '✓' : i + 1}</button>`).join('')}<button class="kz-mini yn-ozet-btn" id="ynOzet">🏁 Sonuçlar</button></div>`;
  }
  const balon = (i, metin) => `<button class="yn-balon-btn" aria-expanded="false" aria-controls="ynB${i}" title="Yol gösterici">💬</button><div class="yn-balon" id="ynB${i}" hidden><b>💡 Yol gösterici</b><p>${metin}</p></div>`;

  function soruCiz() {
    const S = SORULAR[aktif];
    const adimlar = S.adimlar.concat([{ b: 'Cevabı seç', s: S.sonAdim || S.kok, tip: 'secim', o: S.siklar.map((x, j) => `${'ABCD'[j]}) ${x}`), d: S.cevap, i: S.sonIpucu || 'Önceki adımlarda bulduklarını kullan. Soruda istenen tam olarak ne? Bir daha oku.', a: S.cozum, son: true }]);
    let hata = 0;
    stage.innerHTML = `${secici()}
      <article class="yn-soru">
        <div class="yn-soru-bas"><span class="fy-qno">${aktif + 1}. Soru · ${S.baslik}</span></div>
        <p>${S.metin}</p>
        <div class="to-gorsel">${CIZ[aktif + 1]()}</div>
        ${S.sonra ? `<p>${S.sonra}</p>` : ''}
        <p class="yn-kok"><b>${S.kok}</b></p>
        <div class="yn-siklar">${S.siklar.map((x, j) => `<span>${'ABCD'[j]}) ${x}</span>`).join('')}</div>
        <p class="yn-kaynak">${KAYNAK}</p>
      </article>
      <h2 class="yn-cozbas">🧭 Adım adım çöz</h2>
      <ol class="yn-adimlar">${adimlar.map((A, i) => `<li class="yn-adim${i ? ' kilitli' : ''}" data-i="${i}">
          <div class="yn-adim-ic">
            <div class="yn-adim-bas"><span class="yn-adim-no">${i + 1}</span><b>${A.b}</b></div>
            <p class="yn-adim-s">${A.s}</p>
            <div class="yn-cevap">${A.tip === 'secim' ? `<div class="yn-opts">${A.o.map((o, j) => `<button class="yn-opt" data-j="${j}">${o}</button>`).join('')}</div>`
              : `<form class="to-giris yn-giris" autocomplete="off"><input inputmode="decimal" aria-label="Cevap"><button class="btn btn-yellow">✓</button></form>`}</div>
            <p class="pg-fb yn-fb" aria-live="polite"></p>
          </div>
          <div class="yn-yan">${balon(i, A.i)}</div>
        </li>`).join('')}</ol>
      <div class="aci-actions" id="ynSon"></div>`;
    stage.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { aktif = +b.dataset.q; soruCiz(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    stage.querySelector('#ynOzet').addEventListener('click', ozet);
    stage.querySelectorAll('.yn-balon-btn').forEach(b => b.addEventListener('click', () => { const p = b.nextElementSibling; p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); b.classList.toggle('acik', !p.hidden); }));

    const ac = i => {
      const li = stage.querySelector(`.yn-adim[data-i="${i}"]`); if (!li) return;
      li.classList.remove('kilitli');
      const inp = li.querySelector('input'); if (inp) setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 60);
      if (i) li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    const dogru = (li, A) => {
      li.classList.add('tamam');
      const fb = li.querySelector('.yn-fb'); fb.className = 'pg-fb yn-fb ok'; fb.innerHTML = `✓ Doğru! ${A.a}`;
      li.querySelectorAll('button.yn-opt, input, form button').forEach(x => { x.disabled = true; });
      const i = +li.dataset.i;
      if (A.son) bitir(); else ac(i + 1);
    };
    const yanlis = (li, ek) => {
      hata++;
      const fb = li.querySelector('.yn-fb'); fb.className = 'pg-fb yn-fb no';
      fb.innerHTML = `✗ Henüz değil. ${ek || ''} Takıldıysan sağdaki <b>💬</b> baloncuğa dokun.`;
      const b = li.querySelector('.yn-balon-btn'); b.classList.add('dikkat'); setTimeout(() => b.classList.remove('dikkat'), 1200);
    };
    adimlar.forEach((A, i) => {
      const li = stage.querySelector(`.yn-adim[data-i="${i}"]`);
      if (A.tip === 'secim') li.querySelectorAll('.yn-opt').forEach(b => b.addEventListener('click', () => {
        if (li.classList.contains('kilitli') || li.classList.contains('tamam')) return;
        if (+b.dataset.j === A.d) { b.classList.add('right'); dogru(li, A); } else { b.classList.add('wrong'); b.disabled = true; yanlis(li); }
      }));
      else li.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        if (li.classList.contains('kilitli') || li.classList.contains('tamam')) return;
        const inp = li.querySelector('input'), v = Number(inp.value.trim().replace(/\s|\./g, '').replace(',', '.'));
        if (!inp.value.trim() || Number.isNaN(v)) return;
        if (v === A.c) dogru(li, A); else { inp.classList.add('bad'); setTimeout(() => inp.classList.remove('bad'), 600); yanlis(li, `${inp.value} değil.`); }
      });
    });
    function bitir() {
      D.bitti[aktif] = true; if (!hata) D.hatasiz[aktif] = true; kaydet();
      const son = SORULAR.findIndex((_, k) => !D.bitti[k]);
      stage.querySelector('#ynSon').innerHTML = `<p class="yn-tebrik">${hata ? '🎉 Soruyu çözdün!' : '🌟 Hiç yanlış yapmadan çözdün!'}</p>${son >= 0 ? `<button class="btn btn-yellow" id="ynIleri">Sonraki soru →</button>` : `<button class="btn btn-yellow" id="ynBitir">🏁 Sonuçları gör</button>`}`;
      stage.querySelectorAll('.yn-no').forEach(b => { const k = +b.dataset.q; if (D.bitti[k]) { b.classList.add('bitti'); b.textContent = '✓'; } });
      const ile = stage.querySelector('#ynIleri'); if (ile) ile.addEventListener('click', () => { aktif = son; soruCiz(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      const bt = stage.querySelector('#ynBitir'); if (bt) bt.addEventListener('click', ozet);
    }
  }

  function ozet() {
    const cozulen = Object.keys(D.bitti).length, hatasiz = Object.keys(D.hatasiz).length;
    const yildiz = hatasiz >= 6 ? 3 : cozulen >= 7 ? 2 : cozulen ? 1 : 0;
    stage.innerHTML = `${secici()}
      <div class="g-result">
        <div class="g-stars" aria-label="${yildiz} yıldız">${[1, 2, 3].map(k => `<span class="${k <= yildiz ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${cozulen >= 7 ? 'Yeni nesil problem avcısı!' : 'Harika gidiyorsun!'}</h2>
        <div class="g-score"><b>${hatasiz}</b><span>/ ${SORULAR.length}</span></div>
        <p class="g-time">Hiç yanlış yapmadan çözülen soru · Çözülen: ${cozulen} / ${SORULAR.length}</p>
        <p class="pg-rule">Problemde “tam”, “boşluk kalmadan”, “tam tur” gibi ifadeler <b>kat</b> ilişkisini; “en az” ise <b>EKOK</b>’u işaret eder.</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="ynYeniden">↻ Baştan çöz</button>
          <a class="btn btn-lilac" href="oyun-adasi.html?ada=yeninesil">🏝️ Yeni Nesil Adası</a>
        </div>
      </div>`;
    stage.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { aktif = +b.dataset.q; soruCiz(); }));
    stage.querySelector('#ynOzet').addEventListener('click', ozet);
    stage.querySelector('#ynYeniden').addEventListener('click', () => { D = { bitti: {}, hatasiz: {} }; kaydet(); aktif = 0; soruCiz(); });
    if (yildiz >= 2) confetti();
  }

  aktif = Math.max(0, SORULAR.findIndex((_, k) => !D.bitti[k]));
  soruCiz();
})();
