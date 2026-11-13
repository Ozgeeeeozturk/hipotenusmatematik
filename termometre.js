/* Termometre Okuma: negatif ve pozitif sıcaklıkları oku, ayarla, karşılaştır */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // oku: iki termometreyi oku (kitaptaki gibi çift şıklar) · ayarla: sıvıyı sürükle · fark: sıcaklık farkı
  const ROUNDS = [
    { t: 'oku', a: ['Kars', -8], b: ['Şanlıurfa', 13] },
    { t: 'ayarla', a: ['Ardahan', -14] },
    { t: 'oku', a: ['Erzurum', -17], b: ['Antalya', 21] },
    { t: 'fark', a: ['Van', -6], b: ['İzmir', 9] },
    { t: 'ayarla', a: ['Sivas', -3] },
    { t: 'oku', a: ['Ağrı', -22], b: ['Muğla', 7] },
    { t: 'ayarla', a: ['Rize', 16] },
    { t: 'fark', a: ['Kars', -19], b: ['Erzurum', -11] },
    { t: 'oku', a: ['Bolu', -1], b: ['Bursa', 4] },
    { t: 'ayarla', a: ['Hakkâri', -21] },
  ];
  const MIN = -25, MAX = 25, TOP = 40, PX = 5.6;
  const Y = v => TOP + (MAX - v) * PX;
  const nm = v => (v < 0 ? `−${-v}` : `${v}`);
  const COLD = '#3BA7E0', HOT = '#E5333B';
  const col = v => (v < 0 ? COLD : HOT);

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">🌡️</span>
    <p>Termometrede <mark>0’ın üstündeki</mark> sıcaklıklar <b class="k3">pozitif</b>, <mark>0’ın altındaki</mark> sıcaklıklar <b class="k1">negatif</b> tam sayılarla gösterilir. Her küçük çizgi <b class="k2">1 °C</b>’dir.</p>
  </div>`;

  function thermo(name, v, opts = {}) {
    let ticks = '';
    for (let t = MIN; t <= MAX; t++) {
      const big = t % 5 === 0, y = Y(t);
      ticks += `<line x1="${big ? 46 : 52}" y1="${y}" x2="60" y2="${y}" stroke="#2D2440" stroke-width="${big ? 1.8 : 1}"/>`;
      if (big) ticks += `<text x="42" y="${y + 5}" text-anchor="end" class="tm-num${t === 0 ? ' zero' : ''}">${nm(t)}</text>`;
    }
    const show = v != null, c = show ? col(v) : '#ccc';
    const yv = show ? Y(v) : Y(MIN);
    return `<svg viewBox="0 0 150 420" class="tm-svg${opts.drag ? ' drag' : ''}" ${opts.id ? `id="${opts.id}"` : ''} role="img" aria-label="${name} termometresi">
      <text x="84" y="22" text-anchor="middle" class="tm-unit">°C</text>
      <rect x="70" y="${TOP - 12}" width="28" height="${Y(MIN) - TOP + 40}" rx="14" fill="#3A3F4B"/>
      <rect x="74" y="${TOP - 8}" width="20" height="${Y(MIN) - TOP + 34}" rx="10" fill="#5B6270"/>
      <line x1="60" y1="${Y(0)}" x2="100" y2="${Y(0)}" stroke="#FFD84D" stroke-width="2" stroke-dasharray="3 3"/>
      ${ticks}
      <rect x="77" y="${yv}" width="14" height="${Y(MIN) + 30 - yv}" fill="${c}" class="tm-liq"/>
      <circle cx="84" cy="${Y(MIN) + 42}" r="27" fill="#3A3F4B"/><circle cx="84" cy="${Y(MIN) + 42}" r="22" fill="${c}"/>
      ${opts.reveal && show ? `<g class="tm-tag"><rect x="98" y="${yv - 13}" width="50" height="26" rx="8" fill="${c}"/><text x="123" y="${yv + 6}" text-anchor="middle" fill="#fff">${nm(v)}</text></g>` : ''}
      ${opts.drag && show ? `<g class="tm-pointer"><line x1="106" y1="${yv}" x2="70" y2="${yv}" stroke="#2D2440" stroke-width="3"/><path d="M60 ${yv} L72 ${yv - 7} L72 ${yv + 7} Z" fill="#2D2440"/></g><circle cx="120" cy="${yv}" r="13" fill="#FFD84D" stroke="#E0B820" stroke-width="3" class="tm-handle"/>` : ''}
      <text x="84" y="${Y(MIN) + 92}" text-anchor="middle" class="tm-city">${name}</text>
    </svg>`;
  }

  // Okuma açıklaması: en yakın etiketli çizgiden say. "−10’un", "−5’in", "0’ın", "5’in", "10’un", "15’in", "20’nin", "25’in"
  const GEN = { 0: 'ın', 5: 'in', 10: 'un', 15: 'in', 20: 'nin', 25: 'in' };
  function how2(v) {
    if (v % 5 === 0) return `tam ${nm(v)} çizgisinde`;
    const base = Math.floor(v / 5) * 5, k = v - base;
    return `${nm(base)}’${GEN[Math.abs(base)]} ${k} çizgi üstünde`;
  }
  const sign = v => (v < 0 ? '0’ın altında → <b>negatif</b>' : v > 0 ? '0’ın üstünde → <b>pozitif</b>' : 'tam 0’da');

  let idx = 0, score = 0;

  function round() {
    const R = ROUNDS[idx];
    const head = `${NOTE}${progressBar(idx, ROUNDS.length)}`;
    if (R.t === 'ayarla') return setRound(R, head);
    const [na, va] = R.a, [nb, vb] = R.b;
    let opts, right, ask;
    if (R.t === 'oku') {
      const A = Math.abs(va), B = Math.abs(vb);
      opts = [[A, B], [-A, B], [-A, -B], [A, -B]];
      right = opts.findIndex(([x, y]) => x === va && y === vb);
      ask = `Termometrelerde ${na} ve ${nb} illerinin hava sıcaklıkları °C cinsinden verilmiştir. <b>Bu illerin sıcaklıkları hangisidir?</b>`;
    } else {
      const d = Math.abs(vb - va);
      const pool = [Math.abs(Math.abs(vb) - Math.abs(va)), Math.abs(va) + Math.abs(vb), d + 1, d - 1, Math.max(Math.abs(va), Math.abs(vb))].filter(x => x !== d && x > 0);
      opts = shuffle([d, ...[...new Set(pool)].slice(0, 3)]);
      right = opts.indexOf(d);
      ask = `${na} ile ${nb} arasındaki <b>sıcaklık farkı</b> kaç °C’dir?`;
    }
    stage.innerHTML = `${head}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Soru</span>${ask}</p>
      <div class="tm-pair" id="tmPair">${thermo(na, va)}${thermo(nb, vb)}</div>
      ${R.t === 'oku'
        ? `<div class="tm-table"><div class="tm-th"><span></span><b style="background:${COLD}">${na} (°C)</b><b style="background:${HOT}">${nb} (°C)</b></div>
            ${opts.map(([x, y], i) => `<button class="tm-row" data-i="${i}"><span>${'ABCD'[i]})</span><em>${nm(x)}</em><em>${nm(y)}</em></button>`).join('')}</div>`
        : `<div class="g-options pg-opts">${opts.map((v, i) => `<button class="g-opt c${i}" data-i="${i}"><b>${'ABCD'[i]}</b>${v} °C</button>`).join('')}</div>`}
      <p class="pg-fb" id="tmFb" aria-live="polite"></p>
      <div class="aci-actions" id="tmActions"></div>`;
    let done = false;
    stage.querySelectorAll('[data-i]').forEach(btn => btn.addEventListener('click', () => {
      if (done) return; done = true;
      const i = +btn.dataset.i, ok = i === right;
      if (ok) score++;
      stage.querySelectorAll('[data-i]').forEach(x => { x.disabled = true; if (+x.dataset.i === right) x.classList.add('right'); });
      if (!ok) btn.classList.add('wrong');
      stage.querySelector('#tmPair').innerHTML = thermo(na, va, { reveal: true }) + thermo(nb, vb, { reveal: true });
      const fb = stage.querySelector('#tmFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      if (R.t === 'oku') {
        fb.innerHTML = `${ok ? '✓ Doğru!' : '✗ Doğru cevap ' + 'ABCD'[right] + '.'}<br>${na}: sıvı ${sign(va)}, ${how2(va)} → <b>${nm(va)} °C</b><br>${nb}: sıvı ${sign(vb)}, ${how2(vb)} → <b>${nm(vb)} °C</b>`;
      } else {
        const d = Math.abs(vb - va), cross = (va < 0) !== (vb < 0);
        fb.innerHTML = `${ok ? '✓ Doğru!' : `✗ Doğru cevap ${d} °C.`} ${na}: ${nm(va)} °C, ${nb}: ${nm(vb)} °C.<br>${cross
          ? `0’ın iki yanı: ${Math.abs(va)} + ${Math.abs(vb)} = <b>${d} °C</b> (sıfırı geçince toplarız)`
          : `İkisi de 0’ın aynı tarafında: ${Math.max(Math.abs(va), Math.abs(vb))} − ${Math.min(Math.abs(va), Math.abs(vb))} = <b>${d} °C</b>`}`;
      }
      nextBtn();
    }));
  }

  function setRound(R, head) {
    const [name, target] = R.a;
    let v = 0, done = false;
    stage.innerHTML = `${head}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Soru</span>${name} ilinde bugün hava sıcaklığı <b class="tm-target">${nm(target)} °C</b>. Termometrenin sıvısını sürükleyerek bu sıcaklığı göster.</p>
      <div class="tm-pair" id="tmPair">${thermo(name, v, { drag: true, id: 'tmSet' })}</div>
      <div class="tm-nudge"><button class="btn-ghost-dark tm-step" data-d="-1" aria-label="1 derece azalt">▼ 1°</button><button class="btn-ghost-dark tm-step" data-d="1" aria-label="1 derece artır">▲ 1°</button></div>
      <div class="aci-actions"><button class="btn btn-yellow" id="tmCheck">✓ Kontrol Et</button></div>
      <p class="pg-fb" id="tmFb" aria-live="polite"></p>
      <div class="aci-actions" id="tmActions"></div>`;
    const box = stage.querySelector('#tmPair');
    // Sürüklerken svg yeniden çizildiği için pointer'ı kutu üzerinden izle
    let dragging = false;
    const toV = e => {
      const svg = box.querySelector('svg');
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      return Math.max(MIN, Math.min(MAX, Math.round(MAX - (p.y - TOP) / PX)));
    };
    box.addEventListener('pointerdown', e => { if (done) return; e.preventDefault(); dragging = true; try { box.setPointerCapture(e.pointerId); } catch {} set(toV(e)); });
    box.addEventListener('pointermove', e => { if (dragging) set(toV(e)); });
    box.addEventListener('pointerup', () => { dragging = false; });
    box.addEventListener('pointercancel', () => { dragging = false; });
    const set = n => { if (n !== v && !done) { v = n; box.innerHTML = thermo(name, v, { drag: true, id: 'tmSet' }); } };
    stage.querySelectorAll('.tm-step').forEach(b => b.addEventListener('click', () => set(Math.max(MIN, Math.min(MAX, v + Number(b.dataset.d))))));

    stage.querySelector('#tmCheck').addEventListener('click', () => {
      if (done) return; done = true;
      const ok = v === target;
      if (ok) score++;
      const fb = stage.querySelector('#tmFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = ok
        ? `✓ Doğru! Sıvı ${sign(target)}, ${how2(target)} → <b>${nm(target)} °C</b>`
        : `✗ Senin gösterdiğin: <b>${nm(v)} °C</b>. Doğrusu ${nm(target)} °C: sıvı ${sign(target)}, ${how2(target)}.`;
      stage.querySelectorAll('.tm-step, #tmCheck').forEach(x => { x.disabled = true; });
      box.innerHTML = (ok ? '' : thermo('Seninki', v, { reveal: true })) + thermo(ok ? name : 'Doğrusu', target, { reveal: true });
      nextBtn();
    });
  }

  function nextBtn() {
    const last = idx + 1 >= ROUNDS.length;
    const a = stage.querySelector('#tmActions');
    a.innerHTML = `<button class="btn btn-yellow" id="tmNext">${last ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
    const b = a.querySelector('#tmNext');
    b.focus({ preventScroll: true });
    b.addEventListener('click', () => { idx++; last ? summary() : round(); });
  }

  function summary() {
    const pct = score / ROUNDS.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Termometre ustası!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${ROUNDS.length}</span></div>
        <p class="g-time">Doğru cevap</p>
        <p class="pg-rule">0’ın altı <b style="color:${COLD}">negatif</b>, 0’ın üstü <b style="color:${HOT}">pozitif</b>. Her küçük çizgi 1 °C.</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="tmAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#tmAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    if (stars >= 2) confetti();
  }

  round();
})();
