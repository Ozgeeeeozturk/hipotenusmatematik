/* Kare Bahçe: tam kareler, karekök tahmini, a√b dönüşümü, kareköklü ifadelerle işlemler (8. sınıf) */
(function () {
  const { rnd, sec } = R_;
  const kk = n => `√${n}`;

  // Kare bahçe kur: verilen karo sayısıyla kare oluştur
  const bahce = (n) => (kutu, bitir) => {
    let k = 1, bitti = false;
    const ciz = () => {
      const C = Math.min(26, 260 / Math.max(k, 1));
      kutu.querySelector('.kb-zemin').innerHTML = `<svg viewBox="0 0 ${k * C + 4} ${k * C + 4}" class="kb-svg" style="max-width:${Math.min(300, k * C + 4)}px">${Array.from({ length: k * k }, (_, i) => `<rect x="${2 + (i % k) * C}" y="${2 + Math.floor(i / k) * C}" width="${C - 2}" height="${C - 2}" rx="3" class="kb-karo${i >= n ? ' fazla' : ''}"/>`).join('')}</svg>`;
      kutu.querySelector('#kbK').textContent = k; kutu.querySelector('#kbS').textContent = k * k;
    };
    kutu.innerHTML = `<div class="lo-ayar"><div><b>Kenar:</b> <button data-d="-1">−</button><b id="kbK">1</b><button data-d="1">+</button></div><div>Kullanılan karo: <b id="kbS">1</b> / ${n}</div></div><div class="kb-zemin"></div><div class="aci-actions"><button class="btn btn-yellow" id="kbOk">✓ Kare tamam</button></div>`;
    ciz();
    kutu.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { if (bitti) return; k = Math.max(1, Math.min(15, k + +b.dataset.d)); ciz(); }));
    kutu.querySelector('#kbOk').addEventListener('click', () => {
      if (bitti) return; bitti = true; kutu.querySelectorAll('button').forEach(b => { b.disabled = true; });
      const r = Math.sqrt(n);
      bitir(k === r, k === r ? `${n} karo ile kenarı ${r} olan kare kurulur: √${n} = ${r}` : `${k} × ${k} = ${k * k} karo eder. ${n} karo için kenar ${r} olmalı: ${r} × ${r} = ${n}`);
    });
  };

  const S = [
    () => { const r = rnd(3, 9); return { tip: 'ozel', soru: `<b>${r * r} karo</b> ile kare şeklinde bir bahçe döşenecek. Karenin kenarına kaç karo gelmeli? Kenar uzunluğunu ayarla.`, kur: bahce(r * r), aciklama: '' }; },
    () => { const r = rnd(4, 15); return { tip: 'sayi', soru: `Alanı <b>${r * r} m²</b> olan kare şeklindeki bahçenin bir kenarı kaç metredir?`, cevap: r, birim: 'm', aciklama: `Karenin alanı = kenar × kenar. ${r} × ${r} = ${r * r} → kenar = √${r * r} = ${r}` }; },
    () => { let n; do { n = rnd(5, 140); } while (Number.isInteger(Math.sqrt(n))); const a = Math.floor(Math.sqrt(n));
      return { tip: 'secim', soru: `<span class="tz-buyuk">${kk(n)}</span> hangi iki ardışık doğal sayı arasındadır?`, ...temaSecenek(`${a} ile ${a + 1}`, [`${a - 1} ile ${a}`, `${a + 1} ile ${a + 2}`, `${Math.floor(n / 2)} ile ${Math.floor(n / 2) + 1}`]), aciklama: `${a}² = ${a * a} < ${n} < ${(a + 1) * (a + 1)} = ${a + 1}² olduğundan ${a} < ${kk(n)} < ${a + 1}` }; },
    () => { const a = rnd(2, 6), b = sec([2, 3, 5, 6, 7]); return { tip: 'secim', soru: `<span class="tz-buyuk">${kk(a * a * b)}</span> ifadesi a√b biçiminde nasıl yazılır?`, ...temaSecenek(`${a}√${b}`, [`${b}√${a}`, `${a * a}√${b}`, `${a}√${a * b}`, `√${a + b}`]), aciklama: `${a * a * b} = ${a * a} × ${b} → √${a * a} × √${b} = ${a}√${b}` }; },
    () => { const b = sec([2, 3, 5]), m = rnd(1, 5), n = rnd(1, 5); return { tip: 'secim', soru: `<span class="tz-buyuk">${m === 1 ? '' : m}√${b} + ${n === 1 ? '' : n}√${b}</span> işleminin sonucu hangisidir?`, ...temaSecenek(`${m + n}√${b}`, [`${m + n}√${2 * b}`, `${m * n}√${b}`, `√${(m + n) * b}`]), aciklama: `Kök içleri aynı olan ifadeler toplanırken katsayılar toplanır: (${m} + ${n})√${b} = ${m + n}√${b}` }; },
    () => { const a = sec([2, 3, 5, 6]), b = sec([2, 8, 3, 12]); const c = a * b, r = Math.sqrt(c);
      return Number.isInteger(r) ? { tip: 'sayi', soru: `<span class="tz-buyuk">√${a} · √${b}</span> işleminin sonucu kaçtır?`, cevap: r, aciklama: `√${a} · √${b} = √${c} = ${r}` }
        : { tip: 'secim', soru: `<span class="tz-buyuk">√${a} · √${b}</span> işleminin sonucu hangisidir?`, ...temaSecenek(`√${c}`, [`√${a + b}`, `${a * b}`, `${a}√${b}`]), aciklama: `Kareköklü ifadeler çarpılırken kök içleri çarpılır: √${a} · √${b} = √${c}` }; },
    () => { const r = rnd(2, 12); return { tip: 'sayi', soru: `<span class="tz-buyuk">${kk(r * r)}</span> ifadesinin değeri kaçtır?`, cevap: r, aciklama: `${r} × ${r} = ${r * r} olduğundan √${r * r} = ${r}. Karesi alınınca ${r * r} veren pozitif sayı.` }; },
    () => { const D = [[16, true], [20, false], [49, true], [50, false], [81, true], [90, false], [100, true], [72, false]]; const [n, t] = sec(D);
      return { tip: 'secim', soru: `<b>${n}</b> bir tam kare sayı mıdır?`, secenekler: ['Evet, tam kare', 'Hayır, tam kare değil'], dogru: t ? 0 : 1, aciklama: t ? `${Math.sqrt(n)} × ${Math.sqrt(n)} = ${n}` : `Hiçbir doğal sayının karesi ${n} etmez: ${Math.floor(Math.sqrt(n))}² = ${Math.floor(Math.sqrt(n)) ** 2}, ${Math.ceil(Math.sqrt(n))}² = ${Math.ceil(Math.sqrt(n)) ** 2}` }; },
  ];

  temaOyunu({
    siniflar: [8], unvan: 'Karekök ustası!',
    not: () => '<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">🌳</span><p>Alanı <b>n</b> olan karenin kenarı <b>√n</b>’dir. Tam kare sayıların karekökü doğal sayıdır: √49 = 7. <b>√(a²·b) = a√b</b></p></div>',
    uret: () => temaKaristir(S, 8),
    kural: () => 'Tam kare olmayan sayının karekökünü, iki komşu tam karenin arasına yerleştirerek tahmin et.',
  });
})();
