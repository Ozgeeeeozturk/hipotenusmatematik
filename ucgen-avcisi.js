/* Üçgen Avcısı: kareli kâğıtta dik çizgiyi referans alarak dar / dik / geniş açılı üçgen oluştur */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  const COLS = 12, ROWS = 9, U = 40, PAD = 26;
  const X = v => PAD + v * U;
  const TYPE = {
    dar: { name: 'Dar açılı üçgen', c: '#2F8FC9', bg: '#D9EEFA' },
    dik: { name: 'Dik açılı üçgen', c: '#2E9E78', bg: '#D7F3E7' },
    genis: { name: 'Geniş açılı üçgen', c: '#E8701E', bg: '#FDE6D2' },
  };
  // Turlar: taban [ad1,x,y], [ad2,x,y]; adaylar [harf,x,y]; hedef. İlk üçü kitaptaki soru tipleri.
  const ROUNDS = [
    { base: [['K', 2, 7], ['L', 8, 7]], pts: [['A', 3, 2], ['B', 5, 2], ['C', 7, 2], ['D', 9, 3]], goal: 'genis' },
    { base: [['M', 1, 8], ['N', 9, 8]], pts: [['A', 5, 3], ['B', 5, 4], ['C', 5, 5], ['D', 7, 4]], goal: 'dik' },
    { base: [['P', 3, 1], ['R', 3, 8]], pts: [['A', 4, 5], ['B', 5, 5], ['C', 6, 5], ['D', 7, 5]], goal: 'dar' },
    { base: [['K', 3, 7], ['L', 9, 7]], pts: [['A', 1, 3], ['B', 4, 5], ['C', 6, 2], ['D', 9, 2]], goal: 'dar' },
    { base: [['S', 2, 7], ['T', 10, 7]], pts: [['A', 6, 5], ['B', 4, 3], ['C', 6, 1], ['D', 10, 3]], goal: 'genis' },
    { base: [['E', 2, 6], ['F', 6, 2]], pts: [['A', 1, 5], ['B', 3, 1], ['C', 7, 4], ['D', 4, 3]], goal: 'dik' },
    { base: [['P', 2, 1], ['R', 2, 7]], pts: [['A', 6, 4], ['B', 4, 4], ['C', 5, 4], ['D', 7, 2]], goal: 'genis' },
    { base: [['K', 1, 7], ['L', 7, 7]], pts: [['A', 3, 2], ['B', 7, 2], ['C', 4, 6], ['D', 0, 3]], goal: 'dar' },
  ];

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">📐</span>
    <p>Gönyeye gerek yok! Önce <b class="k2">dik çizgiyi</b> bul: kareli kâğıdın çizgileri ve <mark>köşegenler</mark> dik açıyı hazır verir. Nokta dik çizginin <b class="k1">içinde kalırsa dar</b>, <b class="k2">üstündeyse dik</b>, <b class="k3">dışına taşarsa geniş</b> açı oluşur.</p>
  </div>`;

  // ---- Geometri ----
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const deg = (v, a, b) => { const p = sub(a, v), q = sub(b, v); return Math.acos(dot(p, q) / Math.hypot(...p) / Math.hypot(...q)) * 180 / Math.PI; };
  // Üçgenin türü ve hangi köşede: tam sayı iç çarpımlarla (yuvarlama hatası yok)
  function classify(A, B, P) {
    if (cross(sub(B, A), sub(P, A)) === 0) return null; // aynı doğru üzerinde
    const d = [dot(sub(B, A), sub(P, A)), dot(sub(A, B), sub(P, B)), dot(sub(A, P), sub(B, P))];
    const neg = d.findIndex(v => v < 0), zero = d.findIndex(v => v === 0);
    if (neg >= 0) return { t: 'genis', at: neg };
    if (zero >= 0) return { t: 'dik', at: zero };
    return { t: 'dar', at: -1 };
  }

  function gridSVG() {
    let g = '';
    for (let c = 0; c <= COLS; c++) g += `<line x1="${X(c)}" y1="${X(0)}" x2="${X(c)}" y2="${X(ROWS)}"/>`;
    for (let r = 0; r <= ROWS; r++) g += `<line x1="${X(0)}" y1="${X(r)}" x2="${X(COLS)}" y2="${X(r)}"/>`;
    return `<defs><clipPath id="uaClip"><rect x="${X(0)}" y="${X(0)}" width="${COLS * U}" height="${ROWS * U}"/></clipPath></defs><g class="ua-grid">${g}</g>`;
  }

  // Dik referans çizgileri: tabanın iki ucundan dik doğrular + üst köşe için "dik kubbe" (tabanı çap alan çember)
  function guidesSVG(A, B) {
    const d = sub(B, A), p = [-d[1], d[0]], k = 40 / Math.hypot(...p);
    const ln = E => `<line x1="${X(E[0] - p[0] * k)}" y1="${X(E[1] - p[1] * k)}" x2="${X(E[0] + p[0] * k)}" y2="${X(E[1] + p[1] * k)}" class="ua-perp"/>`;
    const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], r = Math.hypot(...d) / 2 * U;
    return `<g clip-path="url(#uaClip)">${ln(A)}${ln(B)}<circle cx="${X(m[0])}" cy="${X(m[1])}" r="${r}" class="ua-dome"/></g>`;
  }

  function angleMark(V, A, B, color) {
    const p = sub(A, V), q = sub(B, V), lp = Math.hypot(...p), lq = Math.hypot(...q);
    const u = [p[0] / lp, p[1] / lp], w = [q[0] / lq, q[1] / lq];
    const vx = X(V[0]), vy = X(V[1]);
    const a = Math.round(deg(V, A, B));
    const bis = [u[0] + w[0], u[1] + w[1]], lb = Math.hypot(...bis) || 1;
    const tx = vx + bis[0] / lb * 40, ty = vy + bis[1] / lb * 40 + 5;
    let mark;
    if (dot(p, q) === 0) {
      const s = 13;
      mark = `<path d="M${vx + u[0] * s} ${vy + u[1] * s} L${vx + (u[0] + w[0]) * s} ${vy + (u[1] + w[1]) * s} L${vx + w[0] * s} ${vy + w[1] * s}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    } else {
      const r = 20, sweep = cross(u, w) > 0 ? 1 : 0;
      mark = `<path d="M${vx + u[0] * r} ${vy + u[1] * r} A${r} ${r} 0 0 ${sweep} ${vx + w[0] * r} ${vy + w[1] * r}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    }
    return `${mark}<text x="${tx}" y="${ty}" text-anchor="middle" class="ua-deg" fill="${color}">${a}°</text>`;
  }

  function triSVG(A, B, P) {
    const k = classify(A, B, P); if (!k) return '';
    const T = TYPE[k.t];
    return `<polygon points="${[A, B, P].map(v => `${X(v[0])},${X(v[1])}`).join(' ')}" fill="${T.c}" fill-opacity=".18" stroke="${T.c}" stroke-width="3" stroke-linejoin="round"/>
      ${angleMark(A, B, P, k.at === 0 ? T.c : '#6B6380')}${angleMark(B, A, P, k.at === 1 ? T.c : '#6B6380')}${angleMark(P, A, B, k.at === 2 ? T.c : '#6B6380')}`;
  }

  const ptSVG = (v, name, cls, color = '#E5484D') => `<g class="${cls || ''}" data-p="${name}"><circle cx="${X(v[0])}" cy="${X(v[1])}" r="18" fill="transparent"/><circle cx="${X(v[0])}" cy="${X(v[1])}" r="6.5" fill="${color}" stroke="#fff" stroke-width="2"/>
    <text x="${X(v[0]) + 10}" y="${X(v[1]) - 10}" class="ua-lab">${name}</text></g>`;
  const baseSVG = (A, B, nA, nB) => `<line x1="${X(A[0])}" y1="${X(A[1])}" x2="${X(B[0])}" y2="${X(B[1])}" stroke="#2F6FB0" stroke-width="4" stroke-linecap="round"/>${ptSVG(A, nA, '', '#2F6FB0')}${ptSVG(B, nB, '', '#2F6FB0')}`;

  const legend = `<div class="ua-legend">${Object.values(TYPE).map(t => `<span><i style="background:${t.c}"></i>${t.name}</span>`).join('')}</div>`;

  // Açıklama: türü hangi köşe belirledi ve dik çizgiye göre neden
  function explain(A, B, P, nA, nB, nP) {
    const k = classify(A, B, P), names = [nA, nB, nP], V = [A, B, P];
    const ang = i => Math.round(deg(V[i], V[(i + 1) % 3], V[(i + 2) % 3]));
    if (k.t === 'dar') return `Bütün açılar 90°’den küçük (${ang(0)}°, ${ang(1)}°, ${ang(2)}°). ${nP} noktası iki dik çizginin <b>arasında</b> ve kubbenin <b>dışında</b> kaldı → <b>dar açılı üçgen</b>.`;
    const at = names[k.at], a = ang(k.at);
    if (k.t === 'dik') return k.at < 2
      ? `${at} köşesinde ${a}° oluştu: ${nP} noktası ${at}’den çıkan <b>dik çizginin tam üstünde</b> → <b>dik açılı üçgen</b>.`
      : `${nP} köşesinde ${a}° oluştu: ${nP} noktası <b>kubbenin tam üstünde</b> (kenarların L’leri yer değiştirmiş) → <b>dik açılı üçgen</b>.`;
    return k.at < 2
      ? `${at} köşesinde ${a}° oluştu: ${nP} noktası ${at}’den çıkan dik çizginin <b>dışına taştı</b> → <b>geniş açılı üçgen</b>.`
      : `${nP} köşesinde ${a}° oluştu: ${nP} noktası tabana çok yakın, <b>kubbenin içinde</b> kaldı → <b>geniş açılı üçgen</b>.`;
  }

  // ---- Keşif ----
  function explore() {
    const A = [3, 7], B = [9, 7];
    let P = [5, 2], guides = false, map = false, drag = false;
    stage.innerHTML = `${NOTE}
      <p class="pg-step"><b>Keşfet:</b> Kırmızı <b>P</b> noktasını kareli kâğıtta gezdir. Üçgenin rengi ve açıları nasıl değişiyor?</p>
      <svg viewBox="0 0 ${COLS * U + 2 * PAD} ${ROWS * U + 2 * PAD}" class="ua-board drag" id="uaBoard" role="img" aria-label="Kareli kâğıtta KL tabanı ve sürüklenebilir P noktası"></svg>
      ${legend}
      <p class="pg-fb" id="uaFb" aria-live="polite"></p>
      <div class="ua-tools">
        <button class="btn btn-ghost-dark" id="uaGuides">📏 Dik çizgileri göster</button>
        <button class="btn btn-ghost-dark" id="uaMap">🎨 Haritayı boya</button>
        <button class="btn btn-yellow" id="uaStart">Oyuna Başla →</button>
      </div>`;
    const svg = stage.querySelector('#uaBoard');
    function draw() {
      let dots = '';
      if (map) for (let x = 0; x <= COLS; x++) for (let y = 0; y <= ROWS; y++) {
        const k = classify(A, B, [x, y]); if (k) dots += `<circle cx="${X(x)}" cy="${X(y)}" r="6" fill="${TYPE[k.t].c}" opacity=".55"/>`;
      }
      svg.innerHTML = gridSVG() + dots + (guides ? guidesSVG(A, B) : '') + triSVG(A, B, P) + baseSVG(A, B, 'K', 'L') + ptSVG(P, 'P', 'ua-drag');
      const k = classify(A, B, P), fb = stage.querySelector('#uaFb');
      fb.className = 'pg-fb'; fb.style.color = k ? TYPE[k.t].c : '';
      fb.innerHTML = k ? explain(A, B, P, 'K', 'L', 'P') : 'K, L ve P aynı doğru üzerinde: üçgen oluşmaz!';
    }
    const toPt = e => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      return [Math.max(0, Math.min(COLS, Math.round((p.x - PAD) / U))), Math.max(0, Math.min(ROWS, Math.round((p.y - PAD) / U)))];
    };
    const move = e => { const q = toPt(e); if ((q[0] !== P[0] || q[1] !== P[1]) && !(q[0] === A[0] && q[1] === A[1]) && !(q[0] === B[0] && q[1] === B[1])) { P = q; draw(); } };
    svg.addEventListener('pointerdown', e => { e.preventDefault(); drag = true; try { svg.setPointerCapture(e.pointerId); } catch {} move(e); });
    svg.addEventListener('pointermove', e => { if (drag) move(e); });
    svg.addEventListener('pointerup', () => { drag = false; });
    svg.addEventListener('pointercancel', () => { drag = false; });
    stage.querySelector('#uaGuides').addEventListener('click', e => { guides = !guides; e.currentTarget.classList.toggle('on', guides); draw(); });
    stage.querySelector('#uaMap').addEventListener('click', e => { map = !map; e.currentTarget.classList.toggle('on', map); draw(); });
    stage.querySelector('#uaStart').addEventListener('click', () => { idx = 0; score = 0; round(); });
    draw();
  }

  // ---- Oyun turları ----
  let idx = 0, score = 0;
  function round() {
    const R = ROUNDS[idx], [[nA, ...A], [nB, ...B]] = R.base, T = TYPE[R.goal];
    let guides = false, tries = 0, done = false, pick = null;
    stage.innerHTML = `${NOTE}
      ${progressBar(idx, ROUNDS.length)}
      <p class="pg-step"><b>${idx + 1}. soru:</b> [${nA}${nB}] doğru parçasının uçlarını A, B, C, D noktalarından biriyle birleştirerek <b class="ua-goal" style="background:${T.bg};color:${T.c}">${T.name}</b> oluştur.</p>
      <svg viewBox="0 0 ${COLS * U + 2 * PAD} ${ROWS * U + 2 * PAD}" class="ua-board" id="uaBoard" role="img" aria-label="Kareli kâğıtta taban ve aday noktalar"></svg>
      ${legend}
      <p class="pg-fb" id="uaFb" aria-live="polite">👆 Bir noktaya dokun.</p>
      <div class="ua-tools"><button class="btn btn-ghost-dark" id="uaGuides">📏 Dik çizgileri göster</button></div>
      <div class="aci-actions" id="uaActions"></div>`;
    const svg = stage.querySelector('#uaBoard'), fb = stage.querySelector('#uaFb');
    function draw() {
      const P = pick && R.pts.find(p => p[0] === pick);
      svg.innerHTML = gridSVG() + (guides ? guidesSVG(A, B) : '') + (P ? triSVG(A, B, P.slice(1)) : '') + baseSVG(A, B, nA, nB)
        + R.pts.map(([n, x, y]) => ptSVG([x, y], n, 'ua-cand' + (n === pick ? ' on' : ''))).join('');
    }
    svg.addEventListener('click', e => {
      const g = e.target.closest('.ua-cand'); if (!g || done) return;
      pick = g.dataset.p; draw();
      const P = R.pts.find(p => p[0] === pick).slice(1), k = classify(A, B, P);
      tries++;
      const ok = k.t === R.goal;
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no'); fb.style.color = '';
      fb.innerHTML = `${ok ? '✓ Harika!' : `✗ Bu ${TYPE[k.t].name.toLocaleLowerCase('tr')}.`} ${explain(A, B, P, nA, nB, pick)}${ok ? '' : ' Başka bir nokta dene.'}`;
      if (ok) {
        done = true; if (tries === 1) score++;
        const last = idx + 1 >= ROUNDS.length;
        stage.querySelector('#uaActions').innerHTML = `<button class="btn btn-yellow" id="uaNext">${last ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
        const n = stage.querySelector('#uaNext'); n.focus({ preventScroll: true });
        n.addEventListener('click', () => { idx++; last ? summary() : round(); });
      }
    });
    stage.querySelector('#uaGuides').addEventListener('click', e => { guides = !guides; e.currentTarget.classList.toggle('on', guides); e.currentTarget.textContent = guides ? '📏 Dik çizgileri gizle' : '📏 Dik çizgileri göster'; draw(); });
    draw();
  }

  function summary() {
    const pct = score / ROUNDS.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Üçgen avı tamam!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${ROUNDS.length}</span></div>
        <p class="g-time">İlk denemede doğru</p>
        <p class="pg-rule">Dik çizginin <b style="color:${TYPE.dar.c}">içinde dar</b>, <b style="color:${TYPE.dik.c}">üstünde dik</b>, <b style="color:${TYPE.genis.c}">dışında geniş</b>!</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="uaAgain">↻ Baştan Başla</button>
          <button class="btn btn-ghost-dark" id="uaExplore">🔍 Keşfe Dön</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#uaAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    stage.querySelector('#uaExplore').addEventListener('click', explore);
    if (stars >= 2) confetti();
  }

  explore();
})();
