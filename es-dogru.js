/* Eş Doğru Parçaları: birim kareli zeminde L (yatay + dikey adım) ile eşliği bul ve eş doğru parçası çiz */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  const SEG = ['#1F6F6B', '#5A8F2E', '#2F8FC9', '#6B2E5F', '#8A5A2B'];
  const HC = '#FF8A00', VC = '#E83E8C'; // L'nin yatay ve dikey kolu
  const U = 36, PAD = 22;

  // Bulma turları: [x1,y1,x2,y2] (birim), seçenekler ve doğru çift. İlki kitaptaki soru.
  const FIND = [
    { segs: [[1, 4, 5, 0], [11, 1, 16, 3], [10, 7, 13, 3], [5, 4, 9, 7], [15, 4, 16, 8]], opts: [[1, 3], [4, 5], [2, 5], [3, 4]], ans: 3 },
    { segs: [[1, 2, 3, 7], [5, 6, 10, 4], [7, 1, 12, 1], [12, 7, 16, 5], [14, 1, 17, 3]], opts: [[1, 2], [3, 5], [2, 4], [1, 4]], ans: 0 },
    { segs: [[1, 6, 4, 6], [2, 1, 6, 3], [7, 7, 9, 4], [11, 2, 11, 5], [12, 7, 17, 4]], opts: [[2, 5], [1, 4], [1, 3], [3, 4]], ans: 1 },
    { segs: [[1, 1, 3, 5], [4, 7, 7, 6], [6, 1, 11, 2], [9, 7, 13, 4], [13, 1, 17, 3]], opts: [[3, 4], [2, 3], [1, 5], [1, 4]], ans: 2 },
  ];
  // Çizme turları: verilen doğru parçası (sol yarıda), öğrenci sağ yarıya çizer
  const DRAW = [[1, 6, 4, 2], [1, 2, 6, 4], [1, 6, 5, 5], [1, 7, 5, 3]];
  const DRAW_COLS = 14, DRAW_ZONE = 7;
  const TOTAL = FIND.length + DRAW.length;

  const DEF = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">📐</span>
    <p><b class="k1">Eş doğru parçaları</b> uzunlukları <mark>eşit</mark> olan doğru parçalarıdır. Kareli kâğıtta <b class="k2">L’ye bak</b>: <b style="color:${HC}">yatay</b> ve <b style="color:${VC}">dikey</b> adımlar aynıysa <b class="k3">eştir!</b></p>
  </div>`;

  let idx = 0, score = 0;
  const NM = ['a', 'b', 'c', 'd', 'e'];
  const gen = n => `${NM[n - 1]}’${['nın', 'nin', 'nin', 'nin', 'nin'][n - 1]}`;
  const legs = s => [Math.abs(s[2] - s[0]), Math.abs(s[3] - s[1])];
  const X = v => PAD + v * U;

  function gridSVG(cols, rows, zoneFrom) {
    let g = '';
    if (zoneFrom != null) g += `<rect x="${X(zoneFrom)}" y="${X(0)}" width="${(cols - zoneFrom) * U}" height="${rows * U}" class="ed-zone"/>`;
    for (let c = 0; c <= cols; c++) g += `<line x1="${X(c)}" y1="${X(0)}" x2="${X(c)}" y2="${X(rows)}"/>`;
    for (let r = 0; r <= rows; r++) g += `<line x1="${X(0)}" y1="${X(r)}" x2="${X(cols)}" y2="${X(r)}"/>`;
    return `<g class="ed-grid">${g}</g>`;
  }

  // L: köşe, doğru parçasının altında kalan nokta
  function lSVG(s) {
    const [x1, y1, x2, y2] = s, [h, v] = legs(s);
    let cx, cy;
    if (y1 >= y2) { cx = x2; cy = y1; } else { cx = x1; cy = y2; }
    const ox = cx === x1 ? x2 : x1;   // yatay kolun öbür ucu
    const oy = cy === y1 ? y2 : y1;   // dikey kolun öbür ucu
    const right = cx >= ox;           // dikey kol sağda mı
    let out = '';
    if (h) out += `<line x1="${X(ox)}" y1="${X(cy)}" x2="${X(cx)}" y2="${X(cy)}" stroke="${HC}" class="ed-leg"/>
      <text x="${(X(ox) + X(cx)) / 2}" y="${X(cy) + 24}" text-anchor="middle" class="ed-num" fill="${HC}">${h}</text>`;
    if (v) out += `<line x1="${X(cx)}" y1="${X(cy)}" x2="${X(cx)}" y2="${X(oy)}" stroke="${VC}" class="ed-leg"/>
      <text x="${X(cx) + (right ? 10 : -10)}" y="${(X(cy) + X(oy)) / 2 + 7}" text-anchor="${right ? 'start' : 'end'}" class="ed-num" fill="${VC}">${v}</text>`;
    if (h && v) out += `<rect x="${right ? X(cx) - 10 : X(cx)}" y="${X(cy) - 10}" width="10" height="10" fill="none" stroke="#2D2440" stroke-width="1.5"/>`;
    return `<g class="ed-l">${out}</g>`;
  }

  function segSVG(s, color, label, id) {
    const [x1, y1, x2, y2] = s.map(X);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    // etiketi doğru parçasına dik yönde, yukarı-sola kaydır
    let nx = -(y2 - y1), ny = x2 - x1; const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len; if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
    return `<g class="ed-seg"${id != null ? ` data-s="${id}" tabindex="0" role="button" aria-label="${label} doğru parçası"` : ''}>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="30"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="${x1}" cy="${y1}" r="6" fill="#E5484D"/><circle cx="${x2}" cy="${y2}" r="6" fill="#E5484D"/>
      ${label ? `<text x="${mx + nx * 18}" y="${my + ny * 18 + 7}" text-anchor="middle" class="ed-lab">${label}</text>` : ''}
    </g>`;
  }

  const chip = (label, s, color) => { const [h, v] = legs(s); return `<span class="ed-chip" style="--c:${color}"><b>${label}</b><i style="color:${HC}">↔ ${h}</i><i style="color:${VC}">↕ ${v}</i></span>`; };

  // ---- Bulma turu ----
  function findRound() {
    const R = FIND[idx], rows = 8, cols = 18;
    const shown = new Set();
    let answered = false;
    stage.innerHTML = `${DEF}
      ${progressBar(idx, TOTAL)}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Soru</span>Doğru parçalarına dokun, <b>L</b>’lerine bak. Hangileri eş?</p>
      <svg viewBox="0 0 ${cols * U + 2 * PAD} ${rows * U + 2 * PAD + 14}" class="ed-board" id="edBoard" role="img" aria-label="Birim kareli zeminde 5 doğru parçası"></svg>
      <div class="ed-chips" id="edChips" aria-live="polite"><span class="ed-empty">👆 Bir doğru parçasına dokun</span></div>
      <div class="pg-quiz">
        <div class="g-options pg-opts">${R.opts.map((o, i) => `<button class="g-opt c${i}" data-i="${i}"><b>${'ABCD'[i]}</b>${NM[o[0] - 1]} ile ${NM[o[1] - 1]}</button>`).join('')}</div>
        <p class="pg-fb" id="edFb" aria-live="polite"></p>
      </div>
      <div class="aci-actions" id="edActions"></div>`;
    const svg = stage.querySelector('#edBoard');

    function draw() {
      svg.innerHTML = gridSVG(cols, rows)
        + [...shown].map(i => lSVG(R.segs[i])).join('')
        + R.segs.map((s, i) => segSVG(s, SEG[i], NM[i], i)).join('');
      stage.querySelector('#edChips').innerHTML = shown.size
        ? [...shown].sort().map(i => chip(NM[i], R.segs[i], SEG[i])).join('')
        : '<span class="ed-empty">👆 Bir doğru parçasına dokun</span>';
    }
    const toggle = i => { shown.has(i) ? shown.delete(i) : shown.add(i); draw(); };
    svg.addEventListener('click', e => { const g = e.target.closest('[data-s]'); if (g) toggle(+g.dataset.s); });
    svg.addEventListener('keydown', e => { const g = e.target.closest('[data-s]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(+g.dataset.s); svg.querySelector(`[data-s="${g.dataset.s}"]`).focus(); } });

    stage.querySelectorAll('.pg-opts .g-opt').forEach(btn => btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const i = +btn.dataset.i, ok = i === R.ans;
      if (ok) score++;
      stage.querySelectorAll('.pg-opts .g-opt').forEach(x => { x.disabled = true; if (+x.dataset.i === R.ans) x.classList.add('right'); });
      if (!ok) btn.classList.add('wrong');
      R.segs.forEach((_, k) => shown.add(k)); draw();
      const [a, b] = R.opts[R.ans], [h, v] = legs(R.segs[a - 1]), [h2, v2] = legs(R.segs[b - 1]);
      const same = h === h2 ? 'aynı yönde' : 'döndürülmüş';
      const fb = stage.querySelector('#edFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = `${ok ? '✓ Doğru!' : `✗ Doğru cevap: ${NM[a - 1]} ile ${NM[b - 1]}.`} ${gen(a)} L’si ${h} yatay, ${v} dikey; ${gen(b)} L’si ${h2} yatay, ${v2} dikey. L’ler eş (${same}), doğru parçaları da eş.`;
      nextBtn();
    }));
    draw();
  }

  // ---- Çizme turu ----
  function drawRound() {
    const k = idx - FIND.length, G = DRAW[k], cols = DRAW_COLS, rows = 8;
    const [gh, gv] = legs(G);
    let showG = false, start = null, hover = null, end = null, dragging = false, tries = 0, solved = false;
    stage.innerHTML = `${DEF}
      ${progressBar(idx, TOTAL)}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Soru</span>Verilen doğru parçasına <b>eş</b> bir doğru parçasını <b class="ed-zone-t">sarı bölgeye</b> çiz.</p>
      <svg viewBox="0 0 ${cols * U + 2 * PAD} ${rows * U + 2 * PAD + 14}" class="ed-board" id="edBoard" role="img" aria-label="Birim kareli zemin: solda verilen doğru parçası, sağda çizim bölgesi"></svg>
      <div class="pg-hint" id="edHint" aria-live="polite">👆 Verilen doğru parçasına dokunup L’sini gör. Sonra sarı bölgede bir noktadan başlayıp sürükle (ya da iki noktaya sırayla dokun).</div>
      <div class="ed-chips" id="edChips"></div>
      <p class="pg-fb" id="edFb" aria-live="polite"></p>
      <div class="aci-actions" id="edActions"></div>`;
    const svg = stage.querySelector('#edBoard'), hint = stage.querySelector('#edHint');

    function draw() {
      const mine = start && (end || hover) ? [start[0], start[1], (end || hover)[0], (end || hover)[1]] : null;
      svg.innerHTML = gridSVG(cols, rows, DRAW_ZONE)
        + `<line x1="${X(DRAW_ZONE)}" y1="${X(0)}" x2="${X(DRAW_ZONE)}" y2="${X(rows)}" class="ed-split"/>`
        + (showG ? lSVG(G) : '')
        + (end ? lSVG(mine) : '')
        + segSVG(G, SEG[0], 'Verilen', 'g')
        + (mine && (mine[0] !== mine[2] || mine[1] !== mine[3]) ? segSVG(mine, '#7B4FA8', end ? 'Seninki' : '') : '')
        + (start && !end ? `<circle cx="${X(start[0])}" cy="${X(start[1])}" r="9" fill="#E5484D" class="ed-start"/>` : '');
      stage.querySelector('#edChips').innerHTML = (showG ? chip('Verilen', G, SEG[0]) : '') + (end ? chip('Seninki', mine, '#7B4FA8') : '');
    }

    const snap = e => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      const gx = Math.round((p.x - PAD) / U), gy = Math.round((p.y - PAD) / U);
      return [Math.max(DRAW_ZONE, Math.min(cols, gx)), Math.max(0, Math.min(rows, gy)), (p.x - PAD) / U];
    };
    const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];

    function finish() {
      const mine = [start[0], start[1], end[0], end[1]];
      const [h, v] = legs(mine);
      const okL = (h === gh && v === gv) || (h === gv && v === gh);
      const ok = okL || h * h + v * v === gh * gh + gv * gv;
      tries++; showG = true; draw();
      const fb = stage.querySelector('#edFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      if (ok) {
        solved = true; if (tries === 1) score++;
        fb.innerHTML = okL
          ? (h === gh ? `✓ Eş! İki L de ${gh} yatay, ${gv} dikey adım.` : `✓ Eş! L’ler aynı, sadece döndürülmüş: yatay ve dikey adımlar yer değiştirmiş (${gh} ↔ ${gv}).`)
          : `✓ Eş! L’ler farklı ama uzunluklar eşit (${Math.sqrt(h * h + v * v)} birim).`;
        hint.textContent = '🎉 Harika!'; hint.classList.add('ok');
        nextBtn();
      } else {
        fb.innerHTML = `✗ Eş değil. Verilenin L’si ${gh} yatay, ${gv} dikey; seninki ${h} yatay, ${v} dikey.`;
        stage.querySelector('#edActions').innerHTML = `<button class="btn btn-yellow" id="edRetry">↺ Sil ve Tekrar Çiz</button>`;
        stage.querySelector('#edRetry').addEventListener('click', () => {
          start = hover = end = null; fb.textContent = ''; stage.querySelector('#edActions').innerHTML = '';
          hint.textContent = '✏️ Sarı bölgede yeniden çiz.'; draw();
        });
      }
    }

    svg.addEventListener('pointerdown', e => {
      if (solved) return;
      const g = e.target.closest('[data-s="g"]');
      if (g) { showG = !showG; draw(); return; }
      if (end) return;
      const p = snap(e);
      if (p[2] < DRAW_ZONE - 0.5) { hint.textContent = '⚠️ Sarı bölgeye çiz.'; return; }
      e.preventDefault();
      const pt = [p[0], p[1]];
      if (start && !dragging && !same(start, pt)) { end = pt; finish(); return; } // ikinci dokunuş
      start = pt; hover = pt; dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch {}
      draw();
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const p = snap(e), pt = [p[0], p[1]];
      if (!same(pt, hover)) { hover = pt; draw(); }
    });
    svg.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (!same(hover, start)) { end = hover; finish(); }
      else { hint.textContent = '👉 Şimdi bitiş noktasına dokun.'; draw(); }
    });
    svg.addEventListener('pointercancel', () => { dragging = false; });
    svg.addEventListener('keydown', e => { if (e.target.closest('[data-s="g"]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showG = !showG; draw(); } });
    draw();
  }

  function nextBtn() {
    const last = idx + 1 >= TOTAL;
    stage.querySelector('#edActions').innerHTML = `<button class="btn btn-yellow" id="edNext">${last ? 'Bitir 🏁' : 'Sonraki →'}</button>`;
    const n = stage.querySelector('#edNext');
    n.focus({ preventScroll: true });
    n.addEventListener('click', () => { idx++; last ? summary() : run(); });
  }

  const run = () => (idx < FIND.length ? findRound() : drawRound());

  function summary() {
    const pct = score / TOTAL;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${DEF}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(n => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Eş doğru parçası ustası!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${TOTAL}</span></div>
        <p class="g-time">İlk denemede doğru</p>
        <p class="pg-rule">L’lerin <b style="color:${HC}">yatay</b> ve <b style="color:${VC}">dikey</b> adımları aynıysa doğru parçaları <b>eştir</b>. L döndürülse de eşlik bozulmaz!</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="edAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#edAgain').addEventListener('click', () => { idx = 0; score = 0; run(); });
    if (stars >= 2) confetti();
  }

  run();
})();
