/* Saatteki Açılar: akrep ile yelkovan arasındaki açının çeşidini bul */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // [saat, dakika]. Akrep gerçek saatteki gibi dakikayla birlikte ilerler.
  const TIMES = [[3, 0], [7, 45], [7, 15], [6, 0], [2, 0], [9, 0], [1, 30], [11, 5], [4, 0], [12, 30]];
  const RIMS = ['#E39B2D', '#E0457B', '#8CC63F', '#2F8FC9', '#7B4FA8'];
  const TYPES = [
    { k: 'dar', name: 'Dar Açı', rule: '0° ile 90° arasında' },
    { k: 'dik', name: 'Dik Açı', rule: 'tam 90°' },
    { k: 'genis', name: 'Geniş Açı', rule: '90° ile 180° arasında' },
    { k: 'dogru', name: 'Doğru Açı', rule: 'tam 180°' },
  ];
  const fmt = n => String(Math.round(n * 10) / 10).replace('.', ',');
  const r2 = n => Math.round(n * 100) / 100;
  const P = (deg, r) => [r2(r * Math.sin(deg * Math.PI / 180)), r2(-r * Math.cos(deg * Math.PI / 180))];
  const pad = n => String(n).padStart(2, '0');

  const NOTE = `<div class="pg-def sa-note">
    <span class="pg-def-ic" aria-hidden="true">⏰</span>
    <div>
      <p>Saat kadranı <mark>12 eş parçaya</mark> bölünmüştür; ardışık iki sayı arası <b class="k2">30°</b>’dir. <b class="k1">Akrep</b> ile <b class="k1">yelkovan</b> arasında <b class="k3">3 aralık (15 dakikalık uzaklık)</b> olduğunda aralarındaki açı 3 × 30° = <b class="k2">90°</b>, yani <mark>dik açıdır</mark>.</p>
      <small>⚠️ Dikkat: Akrep de yavaş yavaş ilerler. Örneğin saat 12.15’te akrep 12’den biraz ayrılmıştır; bu yüzden açı 90°’den biraz küçüktür. Tam dik açıyı saat 3.00 ve 9.00’da görürüz.</small>
    </div>
  </div>`;

  function measure(h, m) {
    const H = (h % 12) * 30 + m * 0.5, M = m * 6;
    let d = Math.abs(H - M); if (d > 180) d = 360 - d;
    const type = d === 180 ? 'dogru' : d === 90 ? 'dik' : d < 90 ? 'dar' : 'genis';
    return { H, M, d, type };
  }

  function clockSVG(h, m, rim, reveal) {
    const { H, M, d } = measure(h, m);
    let face = '';
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0, [x1, y1] = P(i * 6, big ? 92 : 96), [x2, y2] = P(i * 6, 101);
      face += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5B5470" stroke-width="${big ? 2.6 : 1.2}"/>`;
    }
    for (let n = 1; n <= 12; n++) { const [x, y] = P(n * 30, 76); face += `<text x="${x}" y="${y + 9}" text-anchor="middle" class="sa-num">${n}</text>`; }

    // Küçük açıyı gösteren yay (dik açıda kare işareti)
    let a1 = H, a2 = M;
    if (((a2 - a1 + 360) % 360) > 180) [a1, a2] = [a2, a1];
    const span = (a2 - a1 + 360) % 360;
    let mark;
    if (span === 90) {
      const [ax, ay] = P(a1, 24), [bx, by] = P(a2, 24);
      mark = `<path d="M${ax} ${ay} L${r2(ax + bx)} ${r2(ay + by)} L${bx} ${by}" fill="none" stroke="#2D2440" stroke-width="2.5"/>`;
    } else {
      const R = 40, [ax, ay] = P(a1, R), [bx, by] = P(a2, R);
      mark = `<path d="M0 0 L${ax} ${ay} A${R} ${R} 0 0 1 ${bx} ${by} Z" fill="#FFD84D" fill-opacity=".55" stroke="#2D2440" stroke-width="2"/>`;
    }
    const [lx, ly] = P(a1 + span / 2, span < 40 ? 62 : 50);
    const label = '';

    const [hx, hy] = P(H, 42), [mx, my] = P(M, 64);
    return `<svg viewBox="-125 -125 250 250" class="sa-clock" role="img" aria-label="Analog saat">
      <circle r="118" fill="${rim}"/><circle r="104" fill="#FBFAF6"/>
      ${face}${mark}
      <line x1="0" y1="0" x2="${hx}" y2="${hy}" stroke="#2D2440" stroke-width="9" stroke-linecap="round" class="sa-hour"/>
      <line x1="0" y1="0" x2="${mx}" y2="${my}" stroke="#E5484D" stroke-width="5" stroke-linecap="round" class="sa-min"/>
      <circle r="7" fill="#2D2440"/>
      ${label}
    </svg>`;
  }

  let idx = 0, score = 0;
  const results = [];

  function round() {
    const [h, m] = TIMES[idx], rim = RIMS[idx % RIMS.length], info = measure(h, m);
    let answered = false;
    stage.innerHTML = `${NOTE}
      ${progressBar(idx, TIMES.length)}
      <p class="pg-step"><b>${idx + 1}. saat:</b> Akrep ile yelkovan arasındaki <b>işaretli açı</b> hangi çeşit açıdır?</p>
      <div class="sa-box">${clockSVG(h, m, rim, false)}
        <div class="sa-legend"><span><i class="sa-h"></i>Akrep (kısa)</span><span><i class="sa-m"></i>Yelkovan (uzun)</span></div>
      </div>
      <div class="pg-quiz">
        <div class="g-options pg-opts">${TYPES.map((t, i) => `<button class="g-opt c${i}" data-k="${t.k}"><b>${'ABCD'[i]}</b>${t.name}</button>`).join('')}</div>
        <p class="pg-fb" id="saFb" aria-live="polite"></p>
      </div>
      <div class="aci-actions" id="saActions"></div>`;

    stage.querySelectorAll('.pg-opts .g-opt').forEach(btn => btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const ok = btn.dataset.k === info.type;
      if (ok) score++;
      results.push({ h, m, ...info, ok });
      stage.querySelectorAll('.pg-opts .g-opt').forEach(x => { x.disabled = true; if (x.dataset.k === info.type) x.classList.add('right'); });
      if (!ok) btn.classList.add('wrong');
      stage.querySelector('.sa-box svg').outerHTML = clockSVG(h, m, rim, true);
      stage.querySelector('.sa-legend').insertAdjacentHTML('afterend', `<div class="sa-badge">Aradaki açı: <b>${fmt(info.d)}°</b></div>`);
      const T = TYPES.find(t => t.k === info.type);
      const why = m === 0
        ? `Akrep ${h}’${suffix(h)}, yelkovan 12’de: aralarında ${Math.round(info.d / 30)} aralık var → ${Math.round(info.d / 30)} × 30° = ${fmt(info.d)}°.`
        : `Akrep ${h} ile ${h % 12 + 1} arasında, yelkovan ${m / 5 || 12}’${suffix(m / 5 || 12)}. Aradaki açı ${fmt(info.d)}°.`;
      const fb = stage.querySelector('#saFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = `${ok ? '✓ Doğru!' : `✗ Doğru cevap: ${T.name}.`} Saat <b>${h}.${pad(m)}</b>. ${why} Bu ölçü ${T.rule} olduğu için <b>${T.name.toLocaleLowerCase('tr')}</b>dır.`;
      const last = idx + 1 >= TIMES.length;
      stage.querySelector('#saActions').innerHTML = `<button class="btn btn-yellow" id="saNext">${last ? 'Bitir 🏁' : 'Sonraki Saat →'}</button>`;
      const n = stage.querySelector('#saNext');
      n.focus({ preventScroll: true });
      n.addEventListener('click', () => { idx++; last ? summary() : round(); });
    }));
  }

  // Bulunma eki: 3’te, 12’de, 1’de, 6’da, 9’da …
  function suffix(n) { return ['', 'de', 'de', 'te', 'te', 'te', 'da', 'de', 'de', 'da', 'da', 'de', 'de'][n]; }

  function summary() {
    const pct = score / TIMES.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(n => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Saat açıları tamam!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${TIMES.length}</span></div>
        <p class="g-time">Doğru bildiğin açı</p>
        <table class="pg-table">
          <thead><tr><th>Saat</th><th>Açı</th><th>Çeşit</th></tr></thead>
          <tbody>${results.map(r => `<tr><td>${r.ok ? '✅' : '❌'} ${r.h}.${pad(r.m)}</td><td>${fmt(r.d)}°</td><td>${TYPES.find(t => t.k === r.type).name}</td></tr>`).join('')}</tbody>
        </table>
        <p class="pg-rule">Dar &lt; 90° · Dik = 90° · 90° &lt; Geniş &lt; 180° · Doğru = 180°</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="saAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#saAgain').addEventListener('click', () => { idx = 0; score = 0; results.length = 0; shuffleTimes(); round(); });
    if (stars >= 2) confetti();
  }

  function shuffleTimes() { const s = shuffle(TIMES.slice()); TIMES.splice(0, TIMES.length, ...s); }
  shuffleTimes();
  round();
})();
