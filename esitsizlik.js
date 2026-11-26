/* Eşitsizlik Doğrusu: eşitsizlikleri sayı doğrusunda gösterme, okuma ve çözme (8. sınıf) */
(function () {
  const { rnd, sec } = R_;
  const ks = n => (n < 0 ? `−${-n}` : `${n}`);
  const ISARET = { '>': '>', '<': '<', '≥': '≥', '≤': '≤' };
  const MIN = -8, MAX = 8;
  const X = v => 20 + (v - MIN) * 25;

  // Sayı doğrusu: e = { a, op } (x op a)
  function dogru(e, o = {}) {
    let s = `<svg viewBox="0 0 450 70" class="es-svg" ${o.id ? `id="${o.id}"` : ''} role="img" aria-label="Sayı doğrusu">`;
    if (e) {
      const sag = e.op === '>' || e.op === '≥', x0 = X(e.a), x1 = sag ? 445 : 5;
      s += `<line x1="${x0}" y1="32" x2="${x1}" y2="32" class="es-isin"/><path d="${sag ? `M445 32 l-12 -8 v16 Z` : `M5 32 l12 -8 v16 Z`}" class="es-uc"/>`;
    }
    s += `<line x1="5" y1="32" x2="445" y2="32" class="es-cizgi"/>`;
    for (let v = MIN; v <= MAX; v++) s += `<line x1="${X(v)}" y1="26" x2="${X(v)}" y2="38" class="es-cent"/><text x="${X(v)}" y="56" text-anchor="middle" class="es-no${v === 0 ? ' sifir' : ''}">${ks(v)}</text>`;
    if (e) s += `<circle cx="${X(e.a)}" cy="32" r="7" class="${e.op === '≥' || e.op === '≤' ? 'es-dolu' : 'es-bos'}"/>`;
    return s + '</svg>';
  }
  const yaz = e => `x ${ISARET[e.op]} ${ks(e.a)}`;
  const rastE = () => ({ a: rnd(-5, 6), op: sec(['>', '<', '≥', '≤']) });

  // Sayı doğrusunda göster: başlangıç noktası, dolu/boş daire, yön
  const goster = e => (kutu, bitir) => {
    const d = { a: 0, dolu: false, sag: true }; let bitti = false;
    const op = () => (d.sag ? (d.dolu ? '≥' : '>') : (d.dolu ? '≤' : '<'));
    const ciz = () => { kutu.querySelector('.es-sahne').innerHTML = dogru({ a: d.a, op: op() }, { id: 'esD' }); kutu.querySelector('#esY').textContent = `x ${op()} ${ks(d.a)}`; };
    kutu.innerHTML = `<div class="es-sahne"></div><p class="es-ipucu">👆 Sayı doğrusunda bir sayıya dokun, sonra daireyi ve yönü seç.</p>
      <div class="es-ayar"><button data-s="dolu">● Dolu daire</button><button data-s="bos">○ Boş daire</button><button data-s="sol">⬅ Sola</button><button data-s="sag">Sağa ➡</button></div>
      <p class="tz-denk" id="esY"></p><div class="aci-actions"><button class="btn btn-yellow" id="esOk">✓ Kontrol Et</button></div>`;
    ciz();
    kutu.querySelector('.es-sahne').addEventListener('click', ev => {
      if (bitti) return; const svg = kutu.querySelector('#esD'), p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
      d.a = Math.max(MIN, Math.min(MAX, Math.round((p.x - 20) / 25 + MIN))); ciz();
    });
    kutu.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { if (bitti) return; const s = b.dataset.s; if (s === 'dolu' || s === 'bos') d.dolu = s === 'dolu'; else d.sag = s === 'sag'; ciz(); }));
    kutu.querySelector('#esOk').addEventListener('click', () => {
      if (bitti) return; bitti = true; kutu.querySelectorAll('button').forEach(b => { b.disabled = true; });
      const ok = d.a === e.a && op() === e.op;
      bitir(ok, ok ? '' : `Doğrusu: ${ks(e.a)} noktasında ${e.op === '≥' || e.op === '≤' ? 'dolu' : 'boş'} daire, ${e.op === '>' || e.op === '≥' ? 'sağa' : 'sola'} doğru ok.`);
      if (!ok) kutu.querySelector('.es-sahne').insertAdjacentHTML('beforeend', `<div class="es-dogrusu">${dogru(e)}</div>`);
    });
  };

  const S = [
    () => { const e = rastE(); return { tip: 'ozel', soru: `<span class="tz-buyuk">${yaz(e)}</span> eşitsizliğini sayı doğrusunda göster.`, kur: goster(e), aciklama: '“≥, ≤” sayı da dahil → <b>dolu</b> daire; “>, <” dahil değil → <b>boş</b> daire. “>” sağa, “<” sola.' }; },
    () => { const e = rastE(); return { tip: 'ozel', soru: `<span class="tz-buyuk">${yaz(e)}</span> eşitsizliğini sayı doğrusunda göster.`, kur: goster(e), aciklama: '“≥, ≤” sayı da dahil → <b>dolu</b> daire; “>, <” dahil değil → <b>boş</b> daire.' }; },
    () => { const e = rastE(); const yan = ['>', '<', '≥', '≤'].filter(o => o !== e.op).map(o => yaz({ a: e.a, op: o })).concat([yaz({ a: e.a + 1, op: e.op })]);
      return { tip: 'secim', soru: 'Sayı doğrusunda gösterilen eşitsizlik hangisidir?', gorsel: dogru(e), ...temaSecenek(yaz(e), yan), aciklama: `${e.op === '≥' || e.op === '≤' ? 'Dolu daire: ' + ks(e.a) + ' dahil' : 'Boş daire: ' + ks(e.a) + ' dahil değil'}; ok ${e.op === '>' || e.op === '≥' ? 'sağa → büyük' : 'sola → küçük'}.` }; },
    () => { const x = rnd(1, 7), a = rnd(2, 4), b = rnd(1, 9), op = sec(['>', '<', '≥', '≤']);
      return { tip: 'secim', soru: `<span class="tz-buyuk">${a}x − ${b} ${op} ${a * x - b}</span> eşitsizliğinin çözümü hangisidir?`, ...temaSecenek(`x ${op} ${x}`, ['>', '<', '≥', '≤'].filter(o => o !== op).map(o => `x ${o} ${x}`).concat([`x ${op} ${a * x}`])), aciklama: `İki tarafa ${b} ekle: ${a}x ${op} ${a * x}. İki tarafı ${R_.ek(a, 'e')} böl (pozitif → yön değişmez): x ${op} ${x}` }; },
    () => { const x = rnd(1, 5), k = rnd(2, 4), op = sec(['>', '<']); const ters = op === '>' ? '<' : '>';
      return { tip: 'secim', soru: `<span class="tz-buyuk">−${k}x ${op} ${-k * x < 0 ? '−' + k * x : k * x}</span> eşitsizliğinin çözümü hangisidir?`, ...temaSecenek(`x ${ters} ${x}`, [`x ${op} ${x}`, `x ${op} −${x}`, `x ${ters} −${x}`]), aciklama: `İki tarafı <b>negatif</b> bir sayıya (−${k}) böldüğümüzde eşitsizliğin <b>yönü değişir</b>: x ${ters} ${x}` }; },
    () => { const D = [['Ehliyet almak için en az 18 yaşında olmak gerekir.', 'x ≥ 18'], ['Asansör en fazla 8 kişi taşıyabilir.', 'x ≤ 8'], ['Bu yarışmaya 12 yaşından küçükler katılabilir.', 'x < 12'], ['Otoyolda hız 40 km/sa’ten fazla olmalıdır.', 'x > 40']]; const [s, d] = sec(D); const a = d.split(' ')[2];
      return { tip: 'secim', soru: `“${s}” durumunu gösteren eşitsizlik hangisidir?`, ...temaSecenek(d, ['≥', '≤', '<', '>'].map(o => `x ${o} ${a}`)), aciklama: '“En az” → ≥, “en fazla” → ≤, “-den küçük” → <, “-den fazla/büyük” → >' }; },
    () => { const a = rnd(-4, 2), b = a + rnd(3, 6); const n = b - a - 1;
      return { tip: 'sayi', soru: `<span class="tz-buyuk">${ks(a)} < x < ${ks(b)}</span> eşitsizliğini sağlayan kaç farklı <b>tam sayı</b> vardır?`, gorsel: dogru(null).replace('</svg>', `<line x1="${X(a)}" y1="32" x2="${X(b)}" y2="32" class="es-isin"/><circle cx="${X(a)}" cy="32" r="7" class="es-bos"/><circle cx="${X(b)}" cy="32" r="7" class="es-bos"/></svg>`), cevap: n, aciklama: `${ks(a)} ve ${ks(b)} dahil değil. Aradaki tam sayılar: ${Array.from({ length: n }, (_, i) => ks(a + 1 + i)).join(', ')} → ${n} tane` }; },
  ];

  temaOyunu({
    siniflar: [8], unvan: 'Eşitsizlik ustası!',
    not: () => '<div class="pg-def"><span class="pg-def-ic" aria-hidden="true">↔️</span><p><b>></b> büyük, <b><</b> küçük, <b>≥</b> büyük veya eşit, <b>≤</b> küçük veya eşit. Negatif sayıyla çarpar ya da bölersen <mark>eşitsizliğin yönü değişir</mark>.</p></div>',
    uret: () => temaKaristir(S, 7),
    kural: () => 'Dolu daire: sayı dahil. Boş daire: dahil değil. Negatife bölünce yön döner!',
  });
})();
