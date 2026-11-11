/* Yarıçapları Taşı: çemberlerin yarıçaplarını dikdörtgenin kenarlarına taşıyarak kenarları ve çevreyi bul */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // n: yan yana eş çember sayısı, r: yarıçap (cm). İlk örnek kitaptaki soru.
  const ROUNDS = [{ n: 2, r: 5 }, { n: 2, r: 3 }, { n: 3, r: 2 }, { n: 1, r: 4 }, { n: 2, r: 4 }, { n: 3, r: 3 }];
  const INK = ['#2E9E78', '#7B4FA8', '#E07A1F', '#D6456B', '#2F8FC9', '#B8920F', '#1F9D96', '#8F3FB0'];
  const NAMES = ['K', 'L', 'M'];
  const COUNT = ['', 'bir', 'iki', 'üç'];
  const r2 = n => Math.round(n * 100) / 100;

  const DEF = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">📏</span>
    <p><b class="k1">Yarıçap</b> bir <mark>doğru parçasıdır</mark>: onu <b class="k2">taşıyarak</b> dikdörtgenin <b class="k3">kenarlarını ölçebilirsin!</b></p>
  </div>`;

  let idx = 0, score = 0;

  function info(R) {
    const L = 2 * R.r * R.n, S = 2 * R.r, P = 2 * (L + S);
    const sq = R.n === 1;
    return { L, S, P, sq, shape: sq ? 'kare' : 'dikdörtgen', gen: sq ? 'karenin' : 'dikdörtgenin', names: sq ? ['Alt kenar', 'Yan kenar'] : ['Uzun kenar', 'Kısa kenar'] };
  }

  function choices(R, I) {
    if (idx === 0 && R.n === 2 && R.r === 5) return [20, 40, 50, 60]; // kitaptaki şıklar
    const pool = [I.L + I.S, 2 * I.L, I.P + I.S, I.P - I.S, I.L, 4 * R.r * R.n].filter(v => v > 0 && v !== I.P);
    const wrong = [...new Set(pool)].slice(0, 3);
    return shuffle([I.P, ...wrong]);
  }

  function round() {
    const R = ROUNDS[idx], I = info(R), { n, r } = R;
    const U = Math.min(430 / (2 * r * n), 200 / (2 * r));       // 1 cm kaç birim
    const ru = r * U, W = 2 * ru * n, H = 2 * ru;
    const x0 = 36, y0 = 30, yB = y0 + H + 36, xR = x0 + W + 36;
    const VW = r2(xR + 66), VH = r2(yB + 52);

    // Parçalar: her çemberde sol ve sağ yarıçap + ilk çemberde yukarı ve aşağı yarıçap
    const pieces = [];
    for (let c = 0; c < n; c++) for (const d of ['L', 'R']) pieces.push({ c, d });
    pieces.push({ c: 0, d: 'U' }, { c: 0, d: 'D' });
    pieces.forEach((p, i) => { p.id = i; p.color = INK[i % INK.length]; p.at = null; });
    const lanes = { b: new Array(2 * n).fill(null), r: new Array(2).fill(null) };
    let drag = null, answered = false, focusId = null;

    const names = NAMES.slice(0, n);
    const who = n === 1 ? `${names[0]} merkezli çember` : `${names.slice(0, -1).join(', ')} ve ${names[n - 1]} merkezli ${COUNT[n]} eş çember`;

    stage.innerHTML = `${DEF}
      ${progressBar(idx, ROUNDS.length)}
      <p class="pg-step"><b>${idx + 1}. örnek:</b> ${who}, içinde ${n === 1 ? "bulunduğu" : "bulundukları"} ${I.gen} kenarlarına temas ediyor. Yarıçap <b>${r} cm</b>.</p>
      <div class="pg-paper-box">
        <svg viewBox="0 0 ${VW} ${VH}" class="yt-board" id="ytBoard" role="img" aria-label="${I.shape} içinde ${n} eş çember ve taşınabilir yarıçaplar"></svg>
        <div class="pg-hint" id="ytHint" aria-live="polite">✋ Renkli yarıçapları sürükle: <b>alttaki</b> ve <b>sağdaki</b> kesikli çizgilere yerleştir. (Dokunarak da yerleştirebilirsin.)</div>
      </div>
      <div class="pg-info yt-info" id="ytInfo"></div>
      <div class="pg-quiz" id="ytQuiz"></div>
      <div class="aci-actions pg-actions" id="ytActions"></div>`;

    const svg = stage.querySelector('#ytBoard');
    const hint = stage.querySelector('#ytHint');
    const center = c => [x0 + (2 * c + 1) * ru, y0 + ru];

    // Bir parçanın uç noktaları
    function seg(p) {
      if (drag && drag.p === p) {
        const [x, y] = drag.pt, o = drag.o;
        return o === 'h' ? [x - ru / 2, y, x + ru / 2, y] : [x, y - ru / 2, x, y + ru / 2];
      }
      if (p.at) {
        const s = p.at.slot;
        return p.at.lane === 'b' ? [x0 + s * ru, yB, x0 + (s + 1) * ru, yB] : [xR, y0 + s * ru, xR, y0 + (s + 1) * ru];
      }
      return home(p);
    }
    function home(p) {
      const [cx, cy] = center(p.c);
      return { L: [cx - ru, cy, cx, cy], R: [cx, cy, cx + ru, cy], U: [cx, cy - ru, cx, cy], D: [cx, cy, cx, cy + ru] }[p.d];
    }
    const isH = s => s[1] === s[3];

    function pieceSVG(p, ghost) {
      const s = ghost ? home(p) : seg(p).map(r2);
      const [x1, y1, x2, y2] = s, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (ghost) return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${p.color}" stroke-width="3" stroke-dasharray="4 5" opacity=".45"/>`;
      const lab = isH(s)
        ? `<text x="${mx}" y="${my - 9}" text-anchor="middle" class="yt-lab" fill="${p.color}">${r}</text>`
        : `<text x="${mx + 11}" y="${my + 6}" class="yt-lab" fill="${p.color}">${r}</text>`;
      const dragging = drag && drag.p === p;
      return `<g class="yt-piece${dragging ? ' drag' : ''}${p.at ? ' placed' : ''}" data-p="${p.id}" tabindex="0" role="button" aria-label="${r} santimetrelik yarıçap${p.at ? ', yerleştirildi; geri almak için seç' : ''}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="40"/>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p.color}" stroke-width="7"/>
        <circle cx="${x1}" cy="${y1}" r="4.5" fill="${p.color}" stroke="#fff" stroke-width="1.5"/><circle cx="${x2}" cy="${y2}" r="4.5" fill="${p.color}" stroke="#fff" stroke-width="1.5"/>
        ${lab}
      </g>`;
    }

    const full = k => lanes[k].every(v => v !== null);

    function draw() {
      const circles = names.map((nm, c) => {
        const [cx, cy] = center(c);
        return `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(ru)}" fill="none" stroke="#E5484D" stroke-width="2.5"/>
          <circle cx="${r2(cx)}" cy="${r2(cy)}" r="4.5" fill="#E5484D"/>
          <text x="${r2(cx - 10)}" y="${r2(cy + 24)}" text-anchor="end" class="pg-pt">${nm}</text>`;
      }).join('');

      // Taşıma şeritleri (kesikli) ve yuva çizgileri
      const bFull = full('b'), rFull = full('r');
      let slots = '';
      for (let s = 0; s <= 2 * n; s++) slots += `<line x1="${r2(x0 + s * ru)}" y1="${yB - 7}" x2="${r2(x0 + s * ru)}" y2="${yB + 7}" class="yt-tick"/>`;
      for (let s = 0; s <= 2; s++) slots += `<line x1="${xR - 7}" y1="${r2(y0 + s * ru)}" x2="${xR + 7}" y2="${r2(y0 + s * ru)}" class="yt-tick"/>`;
      const guides = `<line x1="${x0}" y1="${r2(y0 + H)}" x2="${x0}" y2="${yB}" class="yt-guide"/><line x1="${r2(x0 + W)}" y1="${r2(y0 + H)}" x2="${r2(x0 + W)}" y2="${yB}" class="yt-guide"/>
        <line x1="${r2(x0 + W)}" y1="${y0}" x2="${xR}" y2="${y0}" class="yt-guide"/><line x1="${r2(x0 + W)}" y1="${r2(y0 + H)}" x2="${xR}" y2="${r2(y0 + H)}" class="yt-guide"/>`;
      const lanesSVG = `<line x1="${x0}" y1="${yB}" x2="${r2(x0 + W)}" y2="${yB}" class="yt-lane${bFull ? ' ok' : ''}"/>
        <line x1="${xR}" y1="${y0}" x2="${xR}" y2="${r2(y0 + H)}" class="yt-lane${rFull ? ' ok' : ''}"/>`;
      const totals = (bFull ? `<text x="${r2(x0 + W / 2)}" y="${yB + 36}" text-anchor="middle" class="yt-total">${I.names[0]} = ${I.L} cm</text>` : `<text x="${r2(x0 + W / 2)}" y="${yB + 34}" text-anchor="middle" class="yt-q">${I.names[0]} = ?</text>`)
        + `<text transform="translate(${xR + 42} ${r2(y0 + H / 2)}) rotate(90)" text-anchor="middle" class="${rFull ? 'yt-total' : 'yt-q'}">${rFull ? `${I.S} cm` : `?`}</text>`;

      // Alt kenar dolunca çapları göster
      const diam = bFull ? `<line x1="${x0}" y1="${r2(y0 + ru)}" x2="${r2(x0 + W)}" y2="${r2(y0 + ru)}" stroke="#2D2440" stroke-width="2" stroke-dasharray="7 6" opacity=".55"/>` : '';

      const ghosts = pieces.filter(p => p.at || (drag && drag.p === p)).map(p => pieceSVG(p, true)).join('');
      const still = pieces.filter(p => !(drag && drag.p === p)).map(p => pieceSVG(p)).join('');
      svg.innerHTML = `<rect x="${x0}" y="${y0}" width="${r2(W)}" height="${r2(H)}" fill="#FFFDF7" stroke="#2D2440" stroke-width="3"/>
        ${guides}${diam}${circles}${lanesSVG}${slots}${ghosts}${totals}${still}${drag ? pieceSVG(drag.p) : ''}`;
      if (focusId !== null) { const el = svg.querySelector(`[data-p="${focusId}"]`); if (el) el.focus({ preventScroll: true }); }
      updateInfo();
    }

    function updateInfo() {
      const bFull = full('b'), rFull = full('r');
      const plus = k => new Array(k).fill(r).join(' + ');
      const box = (on, color, title, val, small) => `<div class="${on ? 'on' : ''}" style="--c:${color}"><span>${title}</span><b>${on ? val : '?'}</b>${on ? `<small>${small}</small>` : ''}</div>`;
      const html = box(bFull, '#2E9E78', I.names[0], `${I.L} cm`, `${plus(2 * n)} = ${I.L} cm${n > 1 ? `<br>(${n} çap = ${2 * n} yarıçap)` : '<br>(1 çap = 2 yarıçap)'}`)
        + box(rFull, '#7B4FA8', I.names[1], `${I.S} cm`, `${plus(2)} = ${I.S} cm<br>(1 çap = 2 yarıçap)`)
        + box(answered, '#E07A1F', 'Çevre', `${I.P} cm`, `2 × (${I.L} + ${I.S}) = ${I.P} cm`);
      const el = stage.querySelector('#ytInfo');
      if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } // yalnızca değişince (animasyon tekrar etmesin)
    }

    // Yerleştirme
    function place(p, lane) {
      const s = lanes[lane].indexOf(null);
      if (s < 0) return false;
      lanes[lane][s] = p.id; p.at = { lane, slot: s };
      return true;
    }
    function lift(p) {
      if (!p.at) return;
      lanes[p.at.lane][p.at.slot] = null; p.at = null;
    }
    function after() {
      const bFull = full('b'), rFull = full('r');
      if (bFull && rFull) { hint.innerHTML = `🎉 Harika! İki kenarı da yarıçaplarla ölçtün.`; hint.classList.add('ok'); showQuiz(); }
      else if (bFull) { hint.innerHTML = `✓ ${I.names[0]} ${2 * n} yarıçap boyunda! Şimdi kalan yarıçapları <b>sağdaki</b> kenara taşı.`; hint.classList.remove('ok'); }
      else if (rFull) { hint.innerHTML = `✓ ${I.names[1]} 2 yarıçap boyunda! Şimdi kalanları <b>alttaki</b> kenara taşı.`; hint.classList.remove('ok'); }
      else { hint.innerHTML = '✋ Renkli yarıçapları sürükle: <b>alttaki</b> ve <b>sağdaki</b> kesikli çizgilere yerleştir.'; hint.classList.remove('ok'); }
      if (!(bFull && rFull)) stage.querySelector('#ytQuiz').innerHTML = '';
    }
    function tap(p) {
      if (answered) return;
      if (p.at) lift(p);
      else if (!place(p, 'b')) place(p, 'r');
      draw(); after();
    }

    // Sürükle-bırak
    const toPt = e => {
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      return [pt.x, pt.y];
    };
    function zone([x, y]) {
      const inB = y > y0 + H + 8 && x < xR - 14, inR = x > x0 + W + 8 && y < yB - 14;
      if (inB && inR) return (y - (y0 + H)) > (x - (x0 + W)) ? 'b' : 'r';
      return inB ? 'b' : inR ? 'r' : null;
    }
    svg.addEventListener('pointerdown', e => {
      const g = e.target.closest('[data-p]');
      if (!g || answered) return;
      e.preventDefault();
      const p = pieces[+g.dataset.p], s = seg(p);
      drag = { p, start: [e.clientX, e.clientY], moved: false, pt: [(s[0] + s[2]) / 2, (s[1] + s[3]) / 2], o: isH(s) ? 'h' : 'v', wasAt: p.at };
      focusId = null;
      try { svg.setPointerCapture(e.pointerId); } catch {}
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.start[0], e.clientY - drag.start[1]) < 6) return;
      if (!drag.moved) { drag.moved = true; lift(drag.p); }
      drag.pt = toPt(e);
      const z = zone(drag.pt);
      drag.o = z === 'b' ? 'h' : z === 'r' ? 'v' : (isH(home(drag.p)) ? 'h' : 'v');
      draw();
    });
    function end(e) {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) { tap(d.p); return; }
      const z = zone(toPt(e));
      if (z && !place(d.p, z)) hint.innerHTML = `⚠️ Bu kenar doldu! Diğer kenara taşı.`;
      draw();
      if (!(z && d.p.at)) { if (!z) after(); return; }
      after();
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', () => { drag = null; draw(); after(); });
    svg.addEventListener('keydown', e => {
      const g = e.target.closest && e.target.closest('[data-p]');
      if (!g || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault(); focusId = +g.dataset.p; tap(pieces[focusId]);
    });

    // Çevre sorusu
    function showQuiz() {
      const box = stage.querySelector('#ytQuiz');
      if (box.innerHTML) return;
      const list = choices(R, I);
      box.innerHTML = `<p class="pg-q">❓ ${I.gen[0].toUpperCase() + I.gen.slice(1)} <b>çevresi</b> kaç santimetredir?</p>
        <div class="g-options pg-opts">${list.map((v, i) => `<button class="g-opt c${i}" data-v="${v}"><b>${'ABCD'[i]}</b>${v}</button>`).join('')}</div>
        <p class="pg-fb" id="ytFb" aria-live="polite"></p>`;
      box.querySelectorAll('.g-opt').forEach(btn => btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const v = +btn.dataset.v, ok = v === I.P;
        if (ok) score++;
        box.querySelectorAll('.g-opt').forEach(x => { x.disabled = true; if (+x.dataset.v === I.P) x.classList.add('right'); });
        if (!ok) btn.classList.add('wrong');
        const fb = box.querySelector('#ytFb');
        fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        const formula = `Çevre = 2 × (${I.L} + ${I.S}) = ${I.P} cm${I.sq ? ` (ya da 4 × ${I.L})` : ''}`;
        fb.innerHTML = ok ? `✓ Doğru! ${formula}`
          : v === I.L + I.S ? `✗ ${v} cm çevrenin yarısı! Her kenardan ikişer tane var. ${formula}`
          : v === I.L ? `✗ ${v} cm sadece bir kenar. ${formula}`
          : `✗ Doğru cevap ${I.P} cm. ${formula}`;
        draw();
        const last = idx + 1 >= ROUNDS.length;
        stage.querySelector('#ytActions').innerHTML = `<button class="btn btn-yellow" id="ytNext">${last ? 'Bitir 🏁' : 'Sonraki Örnek →'}</button>`;
        const next = stage.querySelector('#ytNext');
        next.focus({ preventScroll: true });
        next.addEventListener('click', () => { idx++; last ? summary() : round(); });
      }));
    }

    draw();
  }

  function summary() {
    const pct = score / ROUNDS.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${DEF}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Tüm yarıçapları taşıdın!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${ROUNDS.length}</span></div>
        <p class="g-time">Doğru bulduğun çevre</p>
        <table class="pg-table">
          <thead><tr><th>Örnek</th><th>r</th><th>Uzun</th><th>Kısa</th><th>Çevre</th></tr></thead>
          <tbody>${ROUNDS.map((R, i) => { const I = info(R); return `<tr><td><i style="background:${INK[i % INK.length]}"></i>${i + 1}</td><td>${R.r}</td><td>${I.L}</td><td>${I.S}</td><td>${I.P}</td></tr>`; }).join('')}</tbody>
        </table>
        <p class="pg-rule">Uzun kenar = <b>çapların toplamı</b> · Kısa kenar = <b>1 çap</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="ytAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#ytAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    if (stars >= 2) confetti();
  }

  round();
})();
