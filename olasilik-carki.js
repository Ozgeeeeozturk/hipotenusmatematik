/* Olasılık Çarkı: öznel (5), deneysel (6), teorik (7) ve basit olayların olasılığı (8) */
(function () {
  const { rnd, sec, kes } = R_;
  const RENK = { kırmızı: '#E5333B', mavi: '#3BA7E0', yeşil: '#2E9E78', sarı: '#F2C230', mor: '#7B4FA8' };
  const EK = { kırmızı: 'kırmızı', mavi: 'mavi', yeşil: 'yeşil', sarı: 'sarı', mor: 'mor' };

  // ---- Çizimler ----
  function torba(icerik) { // [[renk, adet]]
    const toplar = icerik.flatMap(([r, n]) => Array(n).fill(r));
    const kolon = toplar.length > 12 ? 6 : 5, satir = Math.ceil(toplar.length / kolon);
    const W = 240, H = 90 + satir * 30;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="ol-svg torba" role="img" aria-label="Torba: ${icerik.map(([r, n]) => n + ' ' + r).join(', ')}">`;
    s += `<path d="M40 40 Q20 ${H - 10} ${W / 2} ${H - 8} Q${W - 20} ${H - 10} ${W - 40} 40 Z" fill="#E9D9B8" stroke="#B8925A" stroke-width="3"/>`;
    s += `<path d="M34 40 Q${W / 2} 26 ${W - 34} 40" fill="none" stroke="#8C6A3A" stroke-width="5" stroke-linecap="round"/>`;
    toplar.forEach((r, i) => {
      const sx = i % kolon, sy = Math.floor(i / kolon), n = Math.min(kolon, toplar.length - sy * kolon);
      const x = W / 2 - (n - 1) * 15 + sx * 30, y = 64 + sy * 30;
      s += `<circle cx="${x}" cy="${y}" r="12" fill="${RENK[r]}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/><circle cx="${x - 4}" cy="${y - 4}" r="3.5" fill="rgba(255,255,255,.55)"/>`;
    });
    return s + '</svg>';
  }
  function cark(dilimler, o = {}) { // dilimler: [renk, ağırlık?]
    const top = dilimler.reduce((a, d) => a + (d[1] || 1), 0), r = 90, c = 100;
    let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 200 215" class="ol-svg cark" role="img" aria-label="Çark">`;
    s += `<g ${o.id ? `id="${o.id}"` : ''} style="transform-origin:100px 100px">`;
    dilimler.forEach(([rk, w = 1]) => {
      const a1 = a0 + (w / top) * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0;
      s += `<path d="M${c},${c} L${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${c + r * Math.cos(a1)},${c + r * Math.sin(a1)} Z" fill="${RENK[rk]}" stroke="#fff" stroke-width="3"/>`;
      a0 = a1;
    });
    s += `</g><circle cx="${c}" cy="${c}" r="10" fill="#2D2440"/><path d="M${c - 10} 2 L${c + 10} 2 L${c} 22 Z" fill="#2D2440"/>`;
    return s + '</svg>';
  }
  const zar = n => {
    const P = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] }[n];
    return `<svg viewBox="0 0 60 60" class="ol-zar"><rect x="3" y="3" width="54" height="54" rx="10" fill="#fff" stroke="#2D2440" stroke-width="3"/>${P.map(([x, y]) => `<circle cx="${15 + x * 15}" cy="${15 + y * 15}" r="5" fill="#2D2440"/>`).join('')}</svg>`;
  };
  const zarlar = () => `<div class="ol-zarlar">${[1, 2, 3, 4, 5, 6].map(zar).join('')}</div>`;
  const kartlar = n => `<div class="ol-kartlar">${Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join('')}</div>`;
  const renkAd = r => `<b style="color:${RENK[r]}">${EK[r]}</b>`;
  const kesSec = (dp, dq, yan) => { // kesir seçenekleri
    const key = (p, q) => `${p}/${q}`;
    const set = yan.filter(([p, q]) => key(p, q) !== key(dp, dq) && q > 0 && p >= 0);
    const u = []; set.forEach(x => { if (!u.some(y => key(...y) === key(...x))) u.push(x); });
    const ops = shuffle([[dp, dq], ...shuffle(u).slice(0, 3)]);
    return { secenekler: ops.map(([p, q]) => kes(p, q)), dogru: ops.findIndex(([p, q]) => key(p, q) === key(dp, dq)) };
  };
  const renkler = n => shuffle(Object.keys(RENK)).slice(0, n);

  // ---- 5. sınıf: öznel olasılık ----
  const OLCEK = ['İmkânsız', 'Az olası', 'Eşit olası', 'Çok olası', 'Kesin'];
  const OLAY = [
    ['Bir zar atıldığında 7’den küçük bir sayı gelmesi', 4], ['Bir haftanın 7 günden oluşması', 4], ['Yalnızca mavi topların olduğu torbadan mavi top çekilmesi', 4, [['mavi', 6]]],
    ['Bir zar atıldığında 8 gelmesi', 0], ['Şubat ayının 31 gün çekmesi', 0], ['Yalnızca kırmızı topların olduğu torbadan yeşil top çekilmesi', 0, [['kırmızı', 6]]],
    ['Yazı-tura atıldığında yazı gelmesi', 2], ['Zar atıldığında çift sayı gelmesi', 2], ['Bu torbadan kırmızı top çekilmesi', 2, [['kırmızı', 4], ['mavi', 4]]],
    ['Bu torbadan kırmızı top çekilmesi', 3, [['kırmızı', 9], ['mavi', 1]]], ['Zar atıldığında 1’den büyük bir sayı gelmesi', 3],
    ['Bu torbadan mavi top çekilmesi', 1, [['kırmızı', 9], ['mavi', 1]]], ['Zar atıldığında 6 gelmesi', 1],
  ];
  const olayKarti = () => { const [o, d, t] = sec(OLAY);
    return { tip: 'secim', soru: `“<b>${o}</b>” olayı nasıl bir olaydır?`, gorsel: t ? torba(t) : '', secenekler: OLCEK, dogru: d,
      aciklama: { 0: 'Hiç gerçekleşemez → <b>imkânsız</b> (olasılığı 0).', 1: 'Gerçekleşebilir ama şansı düşük → <b>az olası</b>.', 2: 'Olma ve olmama şansı aynı → <b>eşit olası</b>.', 3: 'Gerçekleşme şansı yüksek → <b>çok olası</b>.', 4: 'Mutlaka gerçekleşir → <b>kesin</b> (olasılığı 1).' }[d] }; };
  const S5 = [
    olayKarti, olayKarti, olayKarti,
    () => { const [a, b, c] = renkler(3); const d = shuffle([[a, 3], [b, 2], [c, 1]]); const dil = shuffle(d.flatMap(([r, n]) => Array(n).fill([r])));
      return { tip: 'secim', soru: 'Bu çark çevrildiğinde ok <b>en çok</b> hangi renkte durabilir?', gorsel: cark(dil), ...temaSecenek(a, [a, b, c], r => renkAd(r)), aciklama: `${EK[a]} renk 6 eş dilimin 3’ünü kaplıyor; en fazla dilim onda.` }; },
    () => { const [a, b, c, yok] = renkler(4); const t = [[a, rnd(2, 4)], [b, rnd(1, 3)], [c, rnd(1, 2)]];
      return { tip: 'secim', soru: 'Bu torbadan çekilecek bir topun hangi renkte olması <b>imkânsızdır</b>?', gorsel: torba(t), ...temaSecenek(yok, [a, b, c], r => renkAd(r)), aciklama: `Torbada hiç ${EK[yok]} top yok; ${EK[yok]} çekmek imkânsızdır.` }; },
    () => { const [a, b] = renkler(2); const n = 8, k1 = rnd(5, 7), k2 = rnd(1, 3);
      return { tip: 'secim', soru: `Hangi torbadan ${renkAd(a)} top çekmek <b>daha olasıdır</b>?`, gorsel: `<div class="ol-iki"><div><b>1. torba</b>${torba([[a, k1], [b, n - k1]])}</div><div><b>2. torba</b>${torba([[a, k2], [b, n - k2]])}</div></div>`,
        secenekler: ['1. torba', '2. torba', 'İkisi eşit'], dogru: 0, aciklama: `İki torbada da ${n} top var. 1. torbada ${k1}, 2. torbada ${k2} ${EK[a]} top var.` }; },
    () => { const D = [['Kesin olayın olasılığı', '1'], ['İmkânsız olayın olasılığı', '0'], ['Eşit olası bir olayın olasılığı', '1/2']]; const [s, c] = sec(D);
      return { tip: 'secim', soru: `Olasılık 0 ile 1 arasında bir sayıyla gösterilir. <b>${s}</b> kaçtır?`, gorsel: `<div class="ol-olcek"><span>0<small>İmkânsız</small></span><span>${kes(1, 2)}<small>Eşit olası</small></span><span>1<small>Kesin</small></span></div>`,
        secenekler: ['0', kes(1, 2), '1'], dogru: { '0': 0, '1/2': 1, '1': 2 }[c], aciklama: 'İmkânsız → 0, eşit olası → 1/2, kesin → 1.' }; },
  ];

  // ---- 6. sınıf: deneysel olasılık ----
  const S6 = [
    () => { const [a, b, c] = renkler(3); const dil = [[a], [b], [a], [c]], N = 20;
      return { tip: 'ozel', soru: `Çarkı <b>${N} kez</b> çevir ve sonuçları say. Sonra ${renkAd(a)} gelmenin <b>deneysel olasılığını</b> seç.`,
        kur: (kutu, bitir) => {
          const say = { [a]: 0, [b]: 0, [c]: 0 }; let n = 0, ac = 0;
          kutu.innerHTML = `<div class="ol-deney"><div>${cark(dil, { id: 'olCark' })}</div><div class="ol-sayac">${[a, b, c].map(r => `<div><i style="background:${RENK[r]}"></i>${EK[r]}: <b data-r="${r}">0</b></div>`).join('')}<div class="ol-n">Çevirme: <b id="olN">0</b> / ${N}</div><button class="btn btn-yellow" id="olCevir">🎡 ${N} kez çevir</button></div></div><div id="olSor"></div>`;
          kutu.querySelector('#olCevir').addEventListener('click', e => {
            e.target.disabled = true;
            const g = kutu.querySelector('#olCark');
            const t = setInterval(() => {
              const i = rnd(0, 3), r = dil[i][0];
              ac += 360 * 2 + (360 - (i * 90 + 45)) - (ac % 360);
              g.style.transform = `rotate(${ac}deg)`;
              say[r]++; n++;
              kutu.querySelector(`[data-r="${r}"]`).textContent = say[r];
              kutu.querySelector('#olN').textContent = n;
              if (n >= N) {
                clearInterval(t);
                const k = say[a];
                const ops = kesSec(k, N, [[N - k, N], [k, N - k || 1], [2, 4], [k + 2, N], [Math.max(0, k - 2), N]]);
                kutu.querySelector('#olSor').innerHTML = `<p class="ol-sor">${renkAd(a)} kaç kez geldi? Deneysel olasılık = gelme sayısı ÷ deneme sayısı</p><div class="g-options to-opts">${ops.secenekler.map((s, i) => `<button class="g-opt c${i}" data-i="${i}"><b>${'ABCD'[i]}</b><span>${s}</span></button>`).join('')}</div>`;
                kutu.querySelectorAll('#olSor [data-i]').forEach(btn => btn.addEventListener('click', () => {
                  const ok = +btn.dataset.i === ops.dogru;
                  kutu.querySelectorAll('#olSor [data-i]').forEach(x => { x.disabled = true; if (+x.dataset.i === ops.dogru) x.classList.add('right'); });
                  if (!ok) btn.classList.add('wrong');
                  bitir(ok, `${EK[a]} ${k} kez geldi → deneysel olasılık ${kes(k, N)}. Çarkın yarısı ${EK[a]} olduğundan teorik olasılık ${kes(1, 2)}; deneme sayısı arttıkça deneysel olasılık buna yaklaşır.`);
                }));
              }
            }, 110);
          });
        } }; },
    () => { const N = sec([30, 40, 50, 60]), k = rnd(4, Math.floor(N / 3)), y = rnd(1, 6);
      return { tip: 'secim', soru: `Bir zar <b>${N} kez</b> atılmış ve <b>${y}</b> sayısı <b>${k} kez</b> gelmiştir. ${y} gelmenin <b>deneysel olasılığı</b> kaçtır?`, gorsel: zar(y).replace('class="ol-zar"', 'class="ol-zar buyuk"'),
        ...kesSec(k, N, [[1, 6], [k, N - k], [N - k, N], [y, 6]]), aciklama: `Deneysel olasılık = ${y} gelme sayısı ÷ toplam atış = ${kes(k, N)}` }; },
    () => ({ tip: 'secim', soru: 'Bir yazı-tura deneyinde atış sayısı <b>arttıkça</b> deneysel olasılık için ne söylenebilir?',
      ...temaSecenek('Teorik olasılığa (1/2’ye) yaklaşır.', ['Her zaman 1 olur.', 'Her zaman 0 olur.', 'Teorik olasılıktan uzaklaşır.']), aciklama: 'Deneme sayısı arttıkça deneysel olasılık, teorik olasılığa yaklaşır.' }),
    () => { const top = 10, kir = rnd(2, 8), N = 50, k = kir * 5;
      return { tip: 'sayi', soru: `Bir torbada <b>${top}</b> top var. Ayşe torbadan top çekip rengine bakıyor ve topu geri atıyor. <b>${N}</b> çekilişte <b>${k} kez kırmızı</b> top geldi. Torbada yaklaşık kaç kırmızı top vardır?`, gorsel: torba([['mor', top]]).replace(/fill="#7B4FA8"/g, 'fill="#B9B1C9"'),
        cevap: kir, birim: 'top', aciklama: `Deneysel olasılık ${kes(k, N)} = ${kes(kir, top)}. ${top} topun ${kir} tanesi kırmızı olmalı.` }; },
    () => { const N = sec([20, 40, 50]), k = rnd(Math.floor(N / 3), Math.floor(N * 2 / 3));
      return { tip: 'secim', soru: `Can bir madeni parayı <b>${N} kez</b> attı ve <b>${k} kez tura</b> geldi. Tura gelmenin deneysel olasılığı kaçtır?`, ...kesSec(k, N, [[1, 2], [N - k, N], [k, N - k], [k, 100]]), aciklama: `Deneysel olasılık = ${k} ÷ ${N} = ${kes(k, N)}` }; },
    () => { const [a, b] = renkler(2), N = 40, k = rnd(22, 34);
      return { tip: 'secim', soru: `Bir çark 40 kez çevrilmiş; ${renkAd(a)} ${k} kez, ${renkAd(b)} ${N - k} kez gelmiş. Çarkın görünüşü bilinmiyor. Buna göre en olası tahmin hangisi?`,
        ...temaSecenek(`${EK[a]} dilimler daha geniş`, [`${EK[b]} dilimler daha geniş`, 'İki renk eşit genişlikte', 'Çarkta yalnızca bir renk var']), aciklama: `${EK[a]} çok daha sık geldi (${k}/${N}); çarkta ${EK[a]} renk daha fazla yer kaplıyor olabilir.` }; },
  ];

  // ---- 7. sınıf: teorik olasılık ----
  const torbaKur = (n = 3) => { const r = renkler(n); return r.map(x => [x, rnd(1, 6)]); };
  const S7 = [
    () => { const t = torbaKur(3), top = t.reduce((a, b) => a + b[1], 0), [r, k] = sec(t);
      return { tip: 'secim', soru: `Torbadan rastgele bir top çekiliyor. Topun ${renkAd(r)} olma olasılığı kaçtır?`, gorsel: torba(t),
        ...kesSec(k, top, [[k, top - k], [top - k, top], [1, t.length], [k, top + 1]]), aciklama: `Olasılık = istenen durum ÷ tüm durumlar = ${k} ÷ ${top} = ${kes(k, top)}` }; },
    () => { const t = torbaKur(3), top = t.reduce((a, b) => a + b[1], 0), [r, k] = sec(t);
      return { tip: 'secim', soru: `Torbadan çekilen topun ${renkAd(r)} <b>olmama</b> olasılığı kaçtır?`, gorsel: torba(t),
        ...kesSec(top - k, top, [[k, top], [top - k, k], [1, 2], [top, top - k]]), aciklama: `Tümleyen olay: P(${EK[r]} değil) = 1 − ${kes(k, top)} = ${kes(top - k, top)}` }; },
    () => { const esit = Math.random() < 0.5; const [a, b] = renkler(2); const dil = esit ? [[a], [b], [a], [b]] : [[a, 3], [b, 1]];
      return { tip: 'secim', soru: `Bu çark çevrildiğinde ${renkAd(a)} ve ${renkAd(b)} gelme olayları <b>eşit olasılıklı</b> mıdır?`, gorsel: cark(dil), secenekler: ['Evet, eşit olasılıklı', 'Hayır, eşit olasılıklı değil'], dogru: esit ? 0 : 1,
        aciklama: esit ? 'İki renk de çarkın yarısını kaplıyor: ikisinin olasılığı 1/2.' : `${EK[a]} çarkın 3/4’ünü, ${EK[b]} 1/4’ünü kaplıyor; olasılıklar eşit değil.` }; },
    () => { const D = [['asal sayı', 3], ['4’ten büyük sayı', 2], ['çift sayı', 3], ['3’ün katı', 2], ['6’dan küçük sayı', 5], ['1', 1]]; const [o, k] = sec(D);
      return { tip: 'secim', soru: `Bir zar atıldığında üst yüze <b>${o}</b> gelme olasılığı kaçtır?`, gorsel: zarlar(), ...kesSec(k, 6, [[k, 6 - k || 1], [6 - k, 6], [1, 6], [k + 1, 6]]),
        aciklama: { 'asal sayı': 'Asal olanlar 2, 3, 5 → 3/6', '4’ten büyük sayı': '5 ve 6 → 2/6', 'çift sayı': '2, 4, 6 → 3/6', '3’ün katı': '3 ve 6 → 2/6', '6’dan küçük sayı': '1, 2, 3, 4, 5 → 5/6', '1': 'Yalnız 1 → 1/6' }[o] }; },
    () => { const D = [['“çift sayı gelmesi” ile “3 gelmesi”', true], ['“çift sayı gelmesi” ile “4’ten büyük gelmesi”', false], ['“1 gelmesi” ile “6 gelmesi”', true], ['“asal sayı gelmesi” ile “tek sayı gelmesi”', false]]; const [o, ay] = sec(D);
      return { tip: 'secim', soru: `Bir zar atılıyor. ${o} olayları <b>ayrık</b> mıdır?`, gorsel: zarlar(), secenekler: ['Evet, ayrık', 'Hayır, ayrık değil'], dogru: ay ? 0 : 1,
        aciklama: ay ? 'İki olayın ortak sonucu yok; aynı anda gerçekleşemezler → ayrık.' : 'İki olayın ortak bir sonucu var (aynı anda gerçekleşebilirler) → ayrık değil.' }; },
    () => { const top = sec([12, 16, 20, 24]), p = sec([[1, 4], [1, 2], [3, 4]]), k = top * p[0] / p[1];
      return { tip: 'sayi', soru: `Bir torbada <b>${top}</b> top var. Rastgele çekilen topun kırmızı olma olasılığı ${kes(...p)} ise torbada kaç kırmızı top vardır?`, cevap: k, birim: 'top', aciklama: `${top} × ${kes(...p)} = ${k}` }; },
  ];

  // ---- 8. sınıf: basit olayların olasılığı ----
  const S8 = [
    () => { const n = sec([12, 15, 20]), D = [['3’ün katı', x => x % 3 === 0], ['asal sayı', x => x > 1 && [...Array(x).keys()].slice(2).every(d => x % d)], ['çift sayı', x => x % 2 === 0], ['5’ten büyük', x => x > 5]]; const [o, f] = sec(D); const k = Array.from({ length: n }, (_, i) => i + 1).filter(f).length;
      return { tip: 'sayi', soru: `1’den ${R_.ek(n, 'e')} kadar numaralanmış kartlardan biri çekiliyor. “<b>${o}</b> çekme” olayının <b>kaç olası durumu</b> vardır?`, gorsel: kartlar(n), cevap: k, birim: 'durum', aciklama: `${o}: ${Array.from({ length: n }, (_, i) => i + 1).filter(f).join(', ')} → ${k} durum` }; },
    () => { const n = sec([10, 12, 20]), D = [['tek sayı', x => x % 2], ['4’ün katı', x => x % 4 === 0], ['7’den küçük', x => x < 7]]; const [o, f] = sec(D); const k = Array.from({ length: n }, (_, i) => i + 1).filter(f).length;
      return { tip: 'secim', soru: `1’den ${R_.ek(n, 'e')} kadar numaralı kartlardan rastgele çekilen kartın <b>${o}</b> olma olasılığı kaçtır?`, gorsel: kartlar(n), ...kesSec(k, n, [[n - k, n], [k, n - k], [1, n], [k, n + 1]]), aciklama: `İstenen ${k} durum, tüm durumlar ${n} → ${kes(k, n)}` }; },
    () => { const k = rnd(3, 7), m = rnd(1, k - 1);
      return { tip: 'sayi', soru: `Bir torbada ${k} ${renkAd('kırmızı')} ve ${m} ${renkAd('mavi')} top var. Torbaya kaç mavi top eklenirse mavi top çekme olasılığı ${kes(1, 2)} olur?`, gorsel: torba([['kırmızı', k], ['mavi', m]]), cevap: k - m, birim: 'top', aciklama: `Olasılığın 1/2 olması için mavi ve kırmızı sayısı eşit olmalı: ${k} − ${m} = ${k - m}` }; },
    () => ({ tip: 'secim', soru: 'Aşağıdakilerden hangisi bir olayın olasılık değeri <b>olamaz</b>?', ...temaSecenek('x', ['a', 'b', 'c'], v => ({ x: kes(5, 3), a: '0', b: '1', c: kes(3, 5) }[v])), aciklama: 'Olasılık 0 ile 1 arasındadır (0 ve 1 dahil). 5/3 birden büyüktür, olasılık olamaz.' }),
    () => { const t1 = [['kırmızı', rnd(2, 5)], ['mavi', rnd(2, 5)]], t2 = [['kırmızı', rnd(2, 5)], ['mavi', rnd(4, 8)]]; const p1 = t1[0][1] / (t1[0][1] + t1[1][1]), p2 = t2[0][1] / (t2[0][1] + t2[1][1]); if (p1 === p2) return S8[4]();
      return { tip: 'secim', soru: `Hangi torbadan ${renkAd('kırmızı')} top çekme olasılığı <b>daha büyüktür</b>?`, gorsel: `<div class="ol-iki"><div><b>1. torba</b>${torba(t1)}</div><div><b>2. torba</b>${torba(t2)}</div></div>`, secenekler: ['1. torba', '2. torba'], dogru: p1 > p2 ? 0 : 1,
        aciklama: `1. torba: ${kes(t1[0][1], t1[0][1] + t1[1][1])}, 2. torba: ${kes(t2[0][1], t2[0][1] + t2[1][1])}. Kesirleri karşılaştır.` }; },
    () => { const n = sec([3, 4, 5]);
      return { tip: 'secim', soru: `${n} eş dilimli bir çarkın her dilimi farklı renkte. Çark çevrildiğinde <b>her bir rengin</b> gelme olasılığı kaçtır?`, gorsel: cark(renkler(n).map(r => [r])), ...kesSec(1, n, [[n, 1], [1, n - 1], [n - 1, n], [1, 2]]), aciklama: `Eşit olasılıklı ${n} çıktı → her birinin olasılığı ${kes(1, n)}` }; },
  ];

  const URET = { 5: S5, 6: S6, 7: S7, 8: S8 };
  temaOyunu({
    siniflar: [5, 6, 7, 8],
    unvan: 'Olasılık ustası!',
    not: g => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🎲</span><p>${{
      5: 'Olaylar <b>imkânsız</b>, <b>az olası</b>, <b>eşit olası</b>, <b>çok olası</b> ya da <b>kesin</b> olabilir. Olasılık <mark>0 ile 1 arasındadır</mark>.',
      6: '<b>Deneysel olasılık</b> = olayın gerçekleşme sayısı ÷ deneme sayısı. Deneme arttıkça teorik olasılığa yaklaşır.',
      7: '<b>Teorik olasılık</b> = istenen durum sayısı ÷ tüm durumların sayısı. Bir olayın olmama olasılığı = 1 − olma olasılığı.',
      8: 'Olasılık = istenen durumlar ÷ tüm olası durumlar. Değeri her zaman <mark>0 ile 1 arasındadır</mark>.',
    }[g]}</p></div>`,
    uret: g => temaKaristir(URET[g], 8),
    kural: g => ({ 5: 'İmkânsız → 0, eşit olası → 1/2, kesin → 1.', 6: 'Deneysel olasılık = gerçekleşme ÷ deneme.', 7: 'P(olay) + P(olmaması) = 1.', 8: 'Olasılık her zaman 0 ile 1 arasındadır.' }[g]),
  });
})();
