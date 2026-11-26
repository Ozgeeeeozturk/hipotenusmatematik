/* Üs Kulesi: tam sayıların kuvvetleri, negatif üs, üslü ifade kuralları, bilimsel gösterim (8. sınıf) */
(function () {
  const { rnd, sec, kes } = R_;
  const us = (t, n) => `${t}<sup>${n < 0 ? '−' + -n : n}</sup>`;
  const tb = t => (t < 0 ? `(−${-t})` : `${t}`);
  const sup = n => `<sup>${n < 0 ? '−' + -n : n}</sup>`;

  // ×taban düğmesiyle kuleyi yükselt: hedef sayıya kaç çarpmada ulaşılır?
  const kule = (t, n) => (kutu, bitir) => {
    let v = 1, k = 0, bitti = false;
    const ciz = () => {
      kutu.querySelector('.uk-kule').innerHTML = Array.from({ length: k + 1 }, (_, i) => `<div class="uk-kat" style="--i:${i}">${Math.pow(t, i)}</div>`).reverse().join('');
      kutu.querySelector('#ukU').innerHTML = `${t}${sup(k)} = <b>${v}</b>`;
    };
    kutu.innerHTML = `<div class="uk-alan"><div class="uk-kule"></div><div class="uk-panel"><p class="uk-hedef">Hedef: <b>${Math.pow(t, n)}</b></p><p class="uk-u" id="ukU"></p><button class="btn btn-lilac" id="ukC">× ${t}</button><button class="btn-ghost-dark" id="ukG">↺ Sıfırla</button><button class="btn btn-yellow" id="ukK">✓ Bu kadar</button></div></div>`;
    ciz();
    kutu.querySelector('#ukC').addEventListener('click', () => { if (bitti || k >= 10) return; k++; v *= t; ciz(); });
    kutu.querySelector('#ukG').addEventListener('click', () => { if (bitti) return; k = 0; v = 1; ciz(); });
    kutu.querySelector('#ukK').addEventListener('click', () => {
      if (bitti) return; bitti = true; kutu.querySelectorAll('button').forEach(b => { b.disabled = true; });
      bitir(k === n, k === n ? `${Math.pow(t, n)} = ${us(t, n)}: ${t} sayısı ${n} kez çarpıldı.` : `${Math.pow(t, n)} = ${us(t, n)}; ${n} kez çarpmak gerekiyordu.`);
    });
  };

  const S = [
    () => { const t = sec([2, 3, 5]), n = t === 2 ? rnd(4, 7) : t === 3 ? rnd(3, 5) : rnd(2, 4); return { tip: 'ozel', soru: `<b>${Math.pow(t, n)}</b> sayısına ulaşmak için 1’i kaç kez <b>${t}</b> ile çarpmalısın? Kuleyi kur!`, kur: kule(t, n), aciklama: '' }; },
    () => { const t = -rnd(2, 5), n = rnd(2, 4); return { tip: 'sayi', soru: `<span class="tz-buyuk">${tb(t)}${sup(n)}</span> ifadesinin değeri kaçtır?`, cevap: Math.pow(t, n), aciklama: `${Array(n).fill(tb(t)).join(' · ')} = ${Math.pow(t, n) < 0 ? '−' + -Math.pow(t, n) : Math.pow(t, n)}. Negatif sayının <b>${n % 2 ? 'tek' : 'çift'}</b> kuvveti ${n % 2 ? 'negatiftir' : 'pozitiftir'}.` }; },
    () => { const t = rnd(2, 5), n = rnd(2, 3); return { tip: 'secim', soru: `<span class="tz-buyuk">${us(t, -n)}</span> ifadesi aşağıdakilerden hangisine eşittir?`, ...temaSecenek(`1/${Math.pow(t, n)}`, [`−${Math.pow(t, n)}`, `−${t * n}`, `1/${t * n}`, `${Math.pow(t, n)}`], v => (v.includes('/') ? kes(...v.split('/')) : v.replace('-', '−'))), aciklama: `Negatif üs “1 bölü” demektir: ${us(t, -n)} = ${kes(1, us(t, n))} = ${kes(1, Math.pow(t, n))}` }; },
    () => { const t = sec(['a', '2', '3', 'x']), m = rnd(2, 6), n = rnd(2, 6); const D = [['·', m + n, 'Tabanlar aynı, çarpmada üsler <b>toplanır</b>'], [':', m - n, 'Tabanlar aynı, bölmede üsler <b>çıkarılır</b>']]; const [op, r, ac] = sec(D);
      return { tip: 'secim', soru: `<span class="tz-buyuk">${us(t, m)} ${op} ${us(t, n)}</span> işleminin sonucu hangisidir?`, ...temaSecenek(String(r), [String(m * n), String(m + n + 1), String(op === '·' ? m - n : m + n), String(r - 1)].filter(x => x !== String(r)), v => us(t, +v)), aciklama: `${ac}: ${us(t, `${m} ${op === '·' ? '+' : '−'} ${n}`)} = ${us(t, r)}` }; },
    () => { const t = sec(['a', '2', 'x']), m = rnd(2, 4), n = rnd(2, 4); return { tip: 'secim', soru: `<span class="tz-buyuk">(${us(t, m)})${sup(n)}</span> ifadesi hangisine eşittir?`, ...temaSecenek(String(m * n), [String(m + n), String(Math.pow(m, n)), String(m * n + 1)], v => us(t, +v)), aciklama: `Üssün üssü alınırken üsler <b>çarpılır</b>: ${m} × ${n} = ${m * n}` }; },
    () => { const a = rnd(11, 99) / 10, n = rnd(4, 8), v = Math.round(a * Math.pow(10, n)); const as = String(a).replace('.', ',');
      return { tip: 'secim', soru: `<b>${v.toLocaleString('tr-TR')}</b> sayısının <b>bilimsel gösterimi</b> hangisidir?`, ...temaSecenek(`${as} × 10${sup(n)}`, [`${as} × 10${sup(n + 1)}`, `${String(Math.round(a * 10)).replace('.', ',')} × 10${sup(n - 1)}`, `${as} × 10${sup(-n)}`]), aciklama: `Bilimsel gösterimde katsayı 1 ile 10 arasındadır (1 ≤ a < 10): ${as} × 10${sup(n)}` }; },
    () => { const a = rnd(2, 9), n = rnd(3, 5); const v = '0,' + '0'.repeat(n - 1) + a;
      return { tip: 'secim', soru: `<b>${v}</b> sayısının bilimsel gösterimi hangisidir?`, ...temaSecenek(`${a} × 10${sup(-n)}`, [`${a} × 10${sup(n)}`, `${a} × 10${sup(-(n - 1))}`, `${a} × 10${sup(-(n + 1))}`]), aciklama: `Virgül ${n} basamak sağa kayınca ${a} olur → ${a} × 10${sup(-n)}` }; },
    () => { const D = [[`${us(5, 0)}`, 1], [`${us(1, 9)}`, 1], [`(−1)${sup(rnd(1, 4) * 2 + 1)}`, -1], [`${us(10, 3)}`, 1000], [`(−3)${sup(2)}`, 9]]; const [e, v] = sec(D);
      return { tip: 'sayi', soru: `<span class="tz-buyuk">${e}</span> ifadesinin değeri kaçtır?`, cevap: v, aciklama: 'Sıfırdan farklı her sayının 0. kuvveti 1’dir; 1’in her kuvveti 1’dir; −1’in tek kuvveti −1, çift kuvveti 1’dir.' }; },
  ];

  temaOyunu({
    siniflar: [8], unvan: 'Üs ustası!',
    not: () => `<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🗼</span><p>${us('a', 'm')} · ${us('a', 'n')} = ${us('a', 'm+n')} &nbsp;·&nbsp; (${us('a', 'm')})${sup('n')} = ${us('a', 'm·n')} &nbsp;·&nbsp; ${us('a', '−n')} = 1/${us('a', 'n')} &nbsp;·&nbsp; ${us('a', 0)} = 1</p></div>`,
    uret: () => temaKaristir(S, 8),
    kural: () => 'Çarpmada üsler toplanır, bölmede çıkarılır, üssün üssünde çarpılır.',
  });
})();
