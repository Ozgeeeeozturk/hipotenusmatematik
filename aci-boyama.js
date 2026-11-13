/* Açı Boyama: paralel iki doğru ve bir kesende oluşan 8 açıyı yerleştir. Ters açılar aynı renkte. */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // a: kesenin yatayla yaptığı dar açı; dir: 'down' kesen sağa doğru iner, 'up' sağa doğru çıkar
  // n: harfler (A–B üst doğru, C–D alt doğru, K–L kesenin uçları, R ve T kesişim noktaları)
  // g: verilen açılar [üst nokta sektörü, alt nokta sektörü] (0: sağ-üst, 1: üst-sol, 2: sol-alt, 3: alt-sağ)
  const ROUNDS = [
    { a: 55, dir: 'down', n: { A: 'E', B: 'F', C: 'G', D: 'H', K: 'M', L: 'N', R: 'P', T: 'S' }, g: [0, 3] },
    { a: 70, dir: 'up', n: { A: 'A', B: 'B', C: 'C', D: 'D', K: 'K', L: 'L', R: 'M', T: 'N' }, g: [1, 2] },
    { a: 50, dir: 'down', n: { A: 'P', B: 'R', C: 'S', D: 'T', K: 'E', L: 'F', R: 'K', T: 'L' }, g: [2, 0] },
    { a: 80, dir: 'up', n: { A: 'D', B: 'E', C: 'F', D: 'G', K: 'A', L: 'B', R: 'H', T: 'K' }, g: [3, 1] },
    { a: 40, dir: 'down', n: { A: 'S', B: 'T', C: 'U', D: 'V', K: 'P', L: 'R', R: 'M', T: 'N' }, g: [0, 1] },
    { a: 65, dir: 'up', n: { A: 'A', B: 'C', C: 'E', D: 'F', K: 'B', L: 'D', R: 'K', T: 'L' }, g: [1, 3] },
  ];
  // Ters açı çiftleri aynı renk: üst noktada 2 renk, alt noktada 2 renk
  const COL = [['#FF9F43', '#4DABF7'], ['#B983FF', '#40C057']];
  const W = 640, H = 420, Y1 = 150, Y2 = 290;

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">🎨</span>
    <p><b class="k1">Ters açılar</b> aynı renkte ve ölçüleri <mark>eşittir</mark>. <b class="k2">Komşu bütünler</b> açıların toplamı <mark>180°</mark>’dir. Paralel doğruları kesen bir doğruda <b class="k3">dar açılar birbirine, geniş açılar birbirine eşittir</b>.</p>
  </div>`;

  function geo(R) {
    const up = R.dir === 'down' ? 180 - R.a : R.a;                 // kesenin yukarı yönü (matematik açısı)
    const dx = (Y2 - Y1) / Math.tan(R.a * Math.PI / 180) * (R.dir === 'down' ? 1 : -1);
    const P = [[W / 2 - dx / 2, Y1], [W / 2 + dx / 2, Y2]];
    const bounds = [0, up, 180, up + 180, 360];
    const rays = [['B', 'K', 'A', 'T'], ['D', 'R', 'C', 'L']];       // her noktada: sağ, yukarı, sol, aşağı
    const sec = [];
    for (let v = 0; v < 2; v++) for (let k = 0; k < 4; k++) {
      const s = bounds[k], e = bounds[k + 1], r = rays[v];
      const name = R.n[r[(k + 1) % 4]] + R.n[v ? 'T' : 'R'] + R.n[r[k]];
      sec.push({ id: v * 4 + k, v, k, s, e, val: Math.round(e - s), name, color: COL[v][k % 2] });
    }
    return { P, up, sec };
  }

  const rad = d => d * Math.PI / 180;
  const pt = (c, ang, r) => [c[0] + r * Math.cos(rad(ang)), c[1] - r * Math.sin(rad(ang))];

  let idx = 0, score = 0;
  const MAXP = ROUNDS.length * 4;

  function round() {
    const R = ROUNDS[idx], G = geo(R);
    const given = [G.sec[R.g[0]], G.sec[4 + R.g[1]]];
    const filled = new Set(given.map(s => s.id));
    let sel = null, mistakes = 0;
    const chips = [...new Set([R.a, 180 - R.a, 90 - R.a, Math.min(170, 180 - R.a + 10)])].sort((x, y) => x - y);

    stage.innerHTML = `${NOTE}
      ${progressBar(idx, ROUNDS.length)}
      <p class="pg-step qbox"><span class="fy-qno">${idx + 1}. Soru</span>[${R.n.A}${R.n.B}] ile [${R.n.C}${R.n.D}] doğruları <b>paraleldir</b>, ${R.n.K}${R.n.L} doğrusu onları ${R.n.R} ve ${R.n.T} noktalarında kesiyor.
        m(${given[0].name}) = <b>${given[0].val}°</b>, m(${given[1].name}) = <b>${given[1].val}°</b>.</p>
      <p class="ab-ask">👉 Boş açılara dokun, sonra doğru ölçüyü seç (ya da ölçüyü sürükleyip açının üstüne bırak).</p>
      <svg viewBox="90 40 460 360" class="ab-board" id="abBoard" role="img" aria-label="Paralel iki doğru ve bir kesen"></svg>
      <div class="ab-chips" id="abChips">${chips.map(v => `<button class="ab-chip" data-v="${v}">${v}°</button>`).join('')}</div>
      <p class="pg-fb" id="abFb" aria-live="polite"></p>
      <div id="abQuiz"></div>
      <div class="aci-actions" id="abActions"></div>`;
    const svg = stage.querySelector('#abBoard'), fb = stage.querySelector('#abFb');

    function draw() {
      const [Rp, Tp] = G.P;
      const far = 600, u = G.up;
      const K = pt(Rp, u, 110), L = pt(Tp, u + 180, 110);
      const kx1 = pt(Rp, u, far), kx2 = pt(Tp, u + 180, far);
      let g = `<defs><marker id="abAr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2D2440"/></marker>
        <clipPath id="abClip"><rect x="90" y="40" width="460" height="360"/></clipPath></defs>`;
      // açı dilimleri
      for (const s of G.sec) {
        const c = G.P[s.v], r = 52, a = pt(c, s.s, r), b = pt(c, s.e, r), large = s.e - s.s > 180 ? 1 : 0;
        const done = filled.has(s.id), isSel = sel === s.id;
        g += `<path d="M${c[0]} ${c[1]} L${a[0]} ${a[1]} A${r} ${r} 0 ${large} 0 ${b[0]} ${b[1]} Z" data-s="${s.id}"
          class="ab-sec${done ? ' done' : ''}${isSel ? ' sel' : ''}" style="--c:${s.color}"/>`;
        const m = pt(c, (s.s + s.e) / 2, 76);
        g += `<text x="${m[0]}" y="${m[1] + 6}" text-anchor="middle" class="ab-val${done ? '' : ' q'}" ${done ? `fill="${s.color}"` : ''}>${done ? s.val + '°' : '?'}</text>`;
      }
      // doğrular
      g += `<line x1="100" y1="${Y1}" x2="${W - 100}" y2="${Y1}" class="ab-ln" marker-start="url(#abAr)" marker-end="url(#abAr)"/>
        <line x1="100" y1="${Y2}" x2="${W - 100}" y2="${Y2}" class="ab-ln" marker-start="url(#abAr)" marker-end="url(#abAr)"/>
        <g clip-path="url(#abClip)"><line x1="${kx1[0]}" y1="${kx1[1]}" x2="${kx2[0]}" y2="${kx2[1]}" class="ab-ln"/></g>`;
      const dot = (p, t, dx, dy) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#2D2440"/><text x="${p[0] + dx}" y="${p[1] + dy}" class="ab-pt" text-anchor="middle">${t}</text>`;
      g += dot([130, Y1], R.n.A, 0, -12) + dot([W - 130, Y1], R.n.B, 0, -12) + dot([130, Y2], R.n.C, 0, -12) + dot([W - 130, Y2], R.n.D, 0, -12)
        + dot(K, R.n.K, R.dir === 'down' ? -14 : 14, 0) + dot(L, R.n.L, R.dir === 'down' ? 14 : -14, 14);
      g += `<text x="${Rp[0] + (R.dir === 'down' ? -12 : 12)}" y="${Rp[1] + 22}" class="ab-pt" text-anchor="middle">${R.n.R}</text>
        <text x="${Tp[0] + (R.dir === 'down' ? -12 : 12)}" y="${Tp[1] - 10}" class="ab-pt" text-anchor="middle">${R.n.T}</text>`;
      svg.innerHTML = g;
    }

    function tryPlace(sid, v) {
      const s = G.sec[sid];
      if (filled.has(sid)) return;
      if (v === s.val) {
        filled.add(sid); sel = null;
        const t = G.sec[s.v * 4 + (s.k + 2) % 4];
        fb.className = 'pg-fb ok';
        fb.innerHTML = filled.has(t.id) ? `✓ m(${s.name}) = ${s.val}°. Ters açısı ${t.name} ile <b>aynı renkte</b>!` : `✓ m(${s.name}) = ${s.val}°`;
        draw();
        if (filled.size === 8) allDone();
      } else {
        mistakes++;
        fb.className = 'pg-fb no';
        fb.innerHTML = `✗ ${v}° olmaz. İpucu: ${hint(s)}`;
        const el = svg.querySelector(`[data-s="${sid}"]`); if (el) { el.classList.add('bad'); setTimeout(() => el.classList.remove('bad'), 500); }
      }
    }
    function hint(s) {
      const t = G.sec[s.v * 4 + (s.k + 2) % 4], n1 = G.sec[s.v * 4 + (s.k + 1) % 4], n3 = G.sec[s.v * 4 + (s.k + 3) % 4];
      if (filled.has(t.id)) return `${s.name}, ${t.name} ile ters açıdır.`;
      const nb = filled.has(n1.id) ? n1 : filled.has(n3.id) ? n3 : null;
      if (nb) return `${s.name} ile ${nb.name} komşu bütünlerdir: toplamları 180°.`;
      return 'Paralel doğrularda dar açılar birbirine, geniş açılar birbirine eşittir.';
    }

    svg.addEventListener('click', e => {
      const p = e.target.closest('[data-s]'); if (!p) return;
      const id = +p.dataset.s; if (filled.has(id)) return;
      sel = id; draw();
      fb.className = 'pg-fb'; fb.innerHTML = `Seçili açı: <b>${G.sec[id].name}</b>. Şimdi ölçüsünü seç.`;
    });
    // Ölçü kartları: dokun ya da sürükle
    const chipsBox = stage.querySelector('#abChips');
    let drag = null;
    chipsBox.addEventListener('pointerdown', e => {
      const c = e.target.closest('.ab-chip'); if (!c) return;
      drag = { v: +c.dataset.v, x: e.clientX, y: e.clientY, moved: false, ghost: null };
      try { c.setPointerCapture(e.pointerId); } catch {}
    });
    chipsBox.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
        drag.moved = true;
        drag.ghost = document.createElement('div'); drag.ghost.className = 'ab-ghost'; drag.ghost.textContent = drag.v + '°';
        document.body.appendChild(drag.ghost);
      }
      if (drag.ghost) { drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px'; }
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.ghost) {
        d.ghost.remove();
        const el = document.elementFromPoint(e.clientX, e.clientY), p = el && el.closest && el.closest('[data-s]');
        if (p) tryPlace(+p.dataset.s, d.v);
      } else if (sel != null) tryPlace(sel, d.v);
      else { fb.className = 'pg-fb'; fb.textContent = 'Önce boş bir açıya dokun.'; }
    };
    chipsBox.addEventListener('pointerup', end);
    chipsBox.addEventListener('pointercancel', () => { if (drag && drag.ghost) drag.ghost.remove(); drag = null; });

    function allDone() {
      chipsBox.hidden = true;
      stage.querySelector('.ab-ask').hidden = true;
      if (!mistakes) score++;
      fb.className = 'pg-fb ok';
      fb.innerHTML = `🎉 Bütün açılar yerinde${mistakes ? '' : ', hiç hata yapmadan! (+1)'}. Şimdi soruları cevapla.`;
      quiz();
    }

    // Sorular (yazılı sınav tipinde)
    function quiz() {
      const g = given[0], h = given[1], S = G.sec;
      const at = (v, k) => S[v * 4 + ((k % 4) + 4) % 4];
      const Q = [
        { q: `${g.name} açısının <b>ters açısı</b> hangisidir?`, right: at(0, g.k + 2), wrong: [at(0, g.k + 1), at(0, g.k + 3), at(1, g.k + 1)],
          why: `${g.name} ile ${at(0, g.k + 2).name} ters açılardır (aynı renk), ölçüleri eşittir: ${g.val}°.` },
        { q: `${h.name} açısına <b>komşu bütünler</b> olan açı hangisidir?`, right: at(1, h.k + 1), wrong: [at(1, h.k + 2), at(0, h.k), at(0, h.k + 1)],
          why: `${h.name} ile ${at(1, h.k + 1).name} aynı köşede yan yana ve toplamları ${h.val}° + ${at(1, h.k + 1).val}° = 180°.` },
        { q: `${g.name} açısına <b>eş</b> olan açılardan biri hangisidir? <small>(ters açısı dışında)</small>`, right: at(1, g.k), wrong: [at(1, g.k + 1), at(0, g.k + 1), at(1, g.k + 3)],
          why: `Paralel doğrularda ${g.name} ile ${at(1, g.k).name} eştir: ikisi de ${g.val}°.` },
      ];
      let answered = 0;
      const box = stage.querySelector('#abQuiz');
      box.innerHTML = Q.map((x, i) => {
        const opts = shuffle([x.right, ...x.wrong.filter(w => w.id !== x.right.id)].slice(0, 4));
        return `<div class="ab-q" data-i="${i}"><p class="pg-q">${'abc'[i]}) ${x.q}</p>
          <div class="g-options pg-opts">${opts.map((o, j) => `<button class="g-opt c${j}" data-s="${o.id}"><b>${'ABCD'[j]}</b>∠${o.name}</button>`).join('')}</div>
          <p class="pg-fb"></p></div>`;
      }).join('');
      box.querySelectorAll('.ab-q').forEach(qe => qe.addEventListener('click', e => {
        const b = e.target.closest('.g-opt'); if (!b || qe.dataset.done) return;
        qe.dataset.done = 1;
        const x = Q[+qe.dataset.i], ok = +b.dataset.s === x.right.id;
        if (ok) score++;
        qe.querySelectorAll('.g-opt').forEach(o => { o.disabled = true; if (+o.dataset.s === x.right.id) o.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        const f = qe.querySelector('.pg-fb'); f.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        f.innerHTML = `${ok ? '✓ Doğru!' : `✗ Doğru cevap ∠${x.right.name}.`} ${x.why}`;
        if (++answered === Q.length) nextBtn();
      }));
    }

    function nextBtn() {
      const last = idx + 1 >= ROUNDS.length;
      stage.querySelector('#abActions').innerHTML = `<button class="btn btn-yellow" id="abNext">${last ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
      const n = stage.querySelector('#abNext'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => { idx++; last ? summary() : round(); });
    }

    draw();
  }

  function summary() {
    const pct = score / MAXP, stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Açılar renklendi!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${MAXP}</span></div>
        <p class="g-time">Hatasız yerleştirme + doğru cevaplar</p>
        <p class="pg-rule">Ters açılar <b>eşit</b> · Komşu bütünler toplamı <b>180°</b> · Paralel doğrularda dar açılar ve geniş açılar kendi aralarında <b>eşit</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="abAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#abAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    if (stars >= 2) confetti();
  }

  round();
})();
