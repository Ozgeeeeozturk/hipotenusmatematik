/* Pergel ile Çember Çiz: pergeli döndürerek çember çizme, yarıçap ve çap */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // Sivri uç ve kalem ucunun cetveldeki yerleri (cm). İlk örnek kitaptaki soru: 2 ile 5 arası.
  const EXAMPLES = [[2, 5], [1, 3], [3, 7], [4, 5.5], [0, 5], [2, 4.5], [5, 8.5], [1, 5.5]];
  const INK = ['#2E9E78', '#7B4FA8', '#E07A1F', '#D6456B', '#2F8FC9', '#B8920F', '#1F9D96', '#8F3FB0'];
  const CM = 34;              // kâğıtta 1 cm
  const RULER_CM = 36;        // cetvelde 1 cm
  const BUCKETS = 72;         // 5°'lik dilimler: hepsi dolunca çember tamam

  const fmt = n => String(n).replace('.', ',');
  // Türkçe bulunma eki: 2'de, 3'te, 0'da, 4,5'te (buçukta)
  const loc = n => `${fmt(n)}’${n % 1 ? 'te' : ['da', 'de', 'de', 'te', 'te', 'te', 'da', 'de', 'de', 'da', 'da'][n]}`;
  const r2 = n => Math.round(n * 100) / 100;

  const DEF = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">⭕</span>
    <p><b class="k1">Çember</b>, düzlemde sabit bir noktaya <b class="k2">(merkeze)</b> <mark>eşit uzaklıktaki</mark> noktaların oluşturduğu <b class="k3">kapalı eğridir</b>.</p>
  </div>`;

  // ---- Cetvel ve yandan görünen pergel ----
  function rulerSVG(a, b, color, showLen) {
    const X = c => 20 + c * RULER_CM, top = 128;
    let ticks = '';
    for (let mm = 0; mm <= 100; mm++) {
      const x = r2(X(mm / 10)), h = mm % 10 === 0 ? 18 : mm % 5 === 0 ? 12 : 7;
      ticks += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + h}" stroke="#5A4630" stroke-width="${mm % 10 === 0 ? 1.6 : 1}"/>`;
      if (mm % 10 === 0) ticks += `<text x="${x}" y="${top + 38}" text-anchor="middle" class="pg-num">${mm / 10}</text>`;
    }
    const xa = X(a), xb = X(b), ax = (xa + xb) / 2, ay = 22;
    return `<svg viewBox="0 0 400 186" class="pg-ruler" role="img" aria-label="Pergelin sivri ucu ${fmt(a)} santimetrede, kalem ucu ${fmt(b)} santimetrede">
      <rect x="6" y="${top}" width="388" height="52" rx="6" fill="#F3C677" stroke="#D9A54E" stroke-width="2"/>
      ${ticks}
      <line x1="${ax}" y1="${ay + 14}" x2="${xa}" y2="${top - 2}" stroke="#8F99A6" stroke-width="7" stroke-linecap="round"/>
      <line x1="${ax}" y1="${ay + 14}" x2="${xb}" y2="${top - 10}" stroke="#A9B2BD" stroke-width="7" stroke-linecap="round"/>
      <line x1="${r2(xb + (ax - xb) * 0.1)}" y1="${r2(top - 10 - (top - 10 - ay - 14) * 0.1)}" x2="${xb}" y2="${top - 1}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <rect x="${ax - 9}" y="${ay - 6}" width="18" height="26" rx="5" fill="#E5484D"/>
      <rect x="${ax - 3}" y="${ay - 18}" width="6" height="14" rx="2" fill="#E5484D"/>
      <circle cx="${ax}" cy="${ay + 8}" r="2.5" fill="#fff"/>
      <line x1="${xa}" y1="${top}" x2="${xb}" y2="${top}" stroke="#2D2440" stroke-width="2.5"/>
      <circle cx="${xa}" cy="${top}" r="4" fill="#E5484D"/><circle cx="${xb}" cy="${top}" r="4" fill="#E5484D"/>
      ${showLen ? `<text x="${ax}" y="${top - 8}" text-anchor="middle" class="pg-len" fill="${color}">${fmt(b - a)} cm</text>` : ''}
    </svg>`;
  }

  // ---- Örnek ----
  let idx = 0, score = 0;

  // Çap sorusu seçenekleri: doğru cevap + sık yapılan hatalar (yarıçapı söylemek, kalem ucunun yerini okumak…)
  function choices(a, b) {
    const r = b - a, right = 2 * r;
    const pool = [r, b, right + 1, right - 1, a + b, right + 2, 4 * r].filter(v => v > 0 && v !== right);
    const wrong = [...new Set(pool)].slice(0, 3);
    return { right, list: shuffle([right, ...wrong]) };
  }

  function example() {
    const [a, b] = EXAMPLES[idx];
    const r = b - a, R = r * CM, color = INK[idx % INK.length];
    const buckets = new Array(BUCKETS).fill(false);
    let ang = 0, prev = null, done = false, trace = [], answered = false;
    const q = choices(a, b);

    stage.innerHTML = `${DEF}
      ${progressBar(idx, EXAMPLES.length)}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Örnek</span>Pergelin sivri ucu cetvelde <b>${loc(a)}</b>, kalem ucu <b>${loc(b)}</b>.</p>
      <div class="pg-ruler-box" id="pgRuler">${rulerSVG(a, b, color, false)}</div>
      <div class="pg-quiz" id="pgQuiz">
        <p class="pg-q">❓ Bu pergel sivri ucu etrafında bir tam tur döndürülürse çizilen çemberin <b>çapı</b> kaç cm olur?</p>
        <div class="g-options pg-opts">${q.list.map((v, i) => `<button class="g-opt c${i}" data-v="${v}"><b>${'ABCD'[i]}</b>${fmt(v)} cm</button>`).join('')}</div>
        <p class="pg-fb" id="pgFb" aria-live="polite"></p>
      </div>
      <div class="pg-paper-box locked" id="pgPaperBox">
        <svg viewBox="-200 -200 400 400" class="pg-paper" id="pgPaper" role="img" aria-label="Çizim kâğıdı"></svg>
        <div class="pg-hint" id="pgHint">🔒 Önce yukarıdaki soruyu cevapla, sonra çemberi çiz</div>
      </div>
      <div class="pg-info" id="pgInfo" aria-live="polite">
        <div><span>Yarıçap (r)</span><b>?</b></div>
        <div><span>Çap (Ç)</span><b>?</b></div>
      </div>
      <div class="aci-actions pg-actions" id="pgActions">
        <button class="btn btn-ghost-dark" id="pgAuto" disabled>▶ Pergeli Kendisi Döndürsün</button>
      </div>`;

    const svg = stage.querySelector('#pgPaper');
    const hint = stage.querySelector('#pgHint');

    // Soru: doğru yeşil, yanlış kırmızı; ardından çizim açılır
    stage.querySelectorAll('.pg-opts .g-opt').forEach(btn => btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const ok = Number(btn.dataset.v) === q.right;
      if (ok) score++;
      stage.querySelectorAll('.pg-opts .g-opt').forEach(x => {
        x.disabled = true;
        if (Number(x.dataset.v) === q.right) x.classList.add('right');
      });
      if (!ok) btn.classList.add('wrong');
      const fb = stage.querySelector('#pgFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = ok
        ? `✓ Doğru! Şimdi pergeli döndür ve çapı kâğıtta gör.`
        : (Number(btn.dataset.v) === r
          ? `✗ ${fmt(r)} cm yarıçap! Çap, yarıçapın 2 katıdır. Pergeli döndür ve kontrol et.`
          : `✗ Doğru cevap ${fmt(q.right)} cm. Pergeli döndür ve nedenini gör.`);
      stage.querySelector('#pgPaperBox').classList.remove('locked');
      stage.querySelector('#pgAuto').disabled = false;
      hint.textContent = '✏️ Sarı kalem ucunu sürükleyerek merkezin etrafında döndür';
    }));

    let grid = '';
    for (let k = -5; k <= 5; k++) {
      const v = k * CM;
      grid += `<line x1="${v}" y1="-200" x2="${v}" y2="200"/><line x1="-200" y1="${v}" x2="200" y2="${v}"/>`;
    }

    const P = t => [r2(R * Math.cos(t)), r2(-R * Math.sin(t))];
    function draw() {
      const [px, py] = P(ang);
      const pts = trace.map(p => p.join(',')).join(' ');
      const mx = px / 2, my = py / 2;
      svg.innerHTML = `<g class="pg-grid">${grid}</g>
        ${done
          ? `<circle r="${R}" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-width="5" class="pg-circle"/>
             <line x1="${-R}" y1="0" x2="${R}" y2="0" stroke="#2D2440" stroke-width="2.5" stroke-dasharray="7 6"/>
             <circle cx="${-R}" cy="0" r="5" fill="#2D2440"/><circle cx="${R}" cy="0" r="5" fill="#2D2440"/>
             <text x="${-R - 8}" y="-10" text-anchor="end" class="pg-pt">A</text><text x="${R + 8}" y="-10" class="pg-pt">B</text>
             <text x="0" y="24" text-anchor="middle" class="pg-tag" fill="#2D2440">Ç = |AB| = ${fmt(2 * r)} cm</text>`
          : `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`}
        <line x1="0" y1="0" x2="${px}" y2="${py}" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round" opacity=".85"/>
        <line x1="0" y1="0" x2="${px}" y2="${py}" stroke="${color}" stroke-width="2.5"/>
        ${done ? `<text x="${r2(mx)}" y="${r2(my - 16)}" text-anchor="middle" class="pg-tag" fill="${color}">r = ${fmt(r)} cm</text>` : ''}
        <circle r="6" fill="#2D2440"/><text x="-12" y="-12" text-anchor="end" class="pg-pt">M</text>
        <g class="pg-pen${done ? ' done' : trace.length ? '' : ' pulse'}"><circle cx="${px}" cy="${py}" r="17" fill="#FFD84D" stroke="#E0B820" stroke-width="3"/><circle cx="${px}" cy="${py}" r="4.5" fill="${color}"/></g>`;
    }

    function mark(a0, a1) {
      // a0'dan a1'e en kısa yönde geçilen 5°'lik dilimleri işaretle
      let d = a1 - a0;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      if (Math.abs(d) > Math.PI / 2) return;
      const steps = Math.max(1, Math.ceil(Math.abs(d) / (Math.PI / 180)));
      for (let s = 0; s <= steps; s++) {
        const t = a0 + d * s / steps;
        const deg = ((t * 180 / Math.PI) % 360 + 360) % 360;
        buckets[Math.floor(deg / 5) % BUCKETS] = true;
        if (s % 2 === 0) trace.push(P(t));
      }
    }

    function moveTo(t) {
      if (done) return;
      if (prev !== null) mark(prev, t); else { buckets[Math.floor((((t * 180 / Math.PI) % 360) + 360) % 360 / 5) % BUCKETS] = true; trace.push(P(t)); }
      prev = t; ang = t;
      if (buckets.every(Boolean)) finish(); else draw();
    }

    function finish() {
      done = true; ang = Math.PI / 4; draw(); // pergel çapraz dursun, A–B çapıyla çakışmasın
      hint.textContent = '🎉 Harika! Çemberi çizdin.';
      hint.classList.add('ok');
      stage.querySelector('#pgRuler').innerHTML = rulerSVG(a, b, color, true);
      stage.querySelector('#pgInfo').innerHTML = `
        <div class="on" style="--c:${color}"><span>Yarıçap (r)</span><b>${fmt(r)} cm</b><small>Pergelin açıklığı: ${fmt(b)} − ${fmt(a)} = ${fmt(r)} cm</small></div>
        <div class="on" style="--c:${color}"><span>Çap (Ç)</span><b>${fmt(2 * r)} cm</b><small>Ç = 2 × r = 2 × ${fmt(r)} = ${fmt(2 * r)} cm</small></div>`;
      const last = idx + 1 >= EXAMPLES.length;
      stage.querySelector('#pgActions').innerHTML = `<button class="btn btn-yellow" id="pgNext">${last ? 'Bitir 🏁' : 'Sonraki Örnek →'}</button>`;
      const next = stage.querySelector('#pgNext');
      next.focus({ preventScroll: true });
      next.addEventListener('click', () => { idx++; last ? summary() : example(); });
    }

    // Sürükleme
    const toAngle = e => {
      const m = svg.getScreenCTM().inverse();
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
      return Math.atan2(-p.y, p.x);
    };
    let dragging = false, auto = null;
    svg.addEventListener('pointerdown', e => {
      if (done || auto || !answered) return;
      e.preventDefault(); dragging = true; prev = null;
      try { svg.setPointerCapture(e.pointerId); } catch {}
      moveTo(toAngle(e));
    });
    svg.addEventListener('pointermove', e => { if (dragging) moveTo(toAngle(e)); });
    const stop = () => { dragging = false; };
    svg.addEventListener('pointerup', stop);
    svg.addEventListener('pointercancel', stop);

    stage.querySelector('#pgAuto').addEventListener('click', () => {
      if (done || auto || !answered) return;
      prev = null; const t0 = performance.now(), from = ang;
      const tick = now => {
        const k = Math.min(1, (now - t0) / 2600);
        moveTo(from + k * 2 * Math.PI + (k === 1 ? 0.001 : 0));
        if (!done && k < 1) auto = requestAnimationFrame(tick); else auto = null;
      };
      auto = requestAnimationFrame(tick);
    });

    draw();
  }

  // ---- Özet ----
  function summary() {
    const pct = score / EXAMPLES.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${DEF}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(n => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>8 çemberin hepsini çizdin!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${EXAMPLES.length}</span></div>
        <p class="g-time">Doğru tahmin ettiğin çap</p>
        <table class="pg-table">
          <thead><tr><th>Örnek</th><th>Yarıçap (r)</th><th>Çap (Ç)</th></tr></thead>
          <tbody>${EXAMPLES.map(([a, b], i) => `<tr><td><i style="background:${INK[i % INK.length]}"></i>${i + 1}</td><td>${fmt(b - a)} cm</td><td>${fmt(2 * (b - a))} cm</td></tr>`).join('')}</tbody>
        </table>
        <p class="pg-rule">Her çemberde <b>çap = 2 × yarıçap</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="pgAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#pgAgain').addEventListener('click', () => { idx = 0; score = 0; example(); });
    if (stars >= 2) confetti();
  }

  example();
})();
