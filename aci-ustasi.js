/* Açı Ustası: renkli açı parçalarını sürükleyerek doğru açı / tam açıda verilmeyen açıyı bulma */
(function () {
  initPage();
  const stage = document.getElementById('stage');
  const ROUNDS = 8;
  const PIECES = [15, 30, 45, 60, 90, 120, 180];
  const COLORS = {
    15: ['#FFE07A', '#C9A414'], 30: ['#FFA552', '#D06F1F'], 45: ['#C8A2E8', '#8F62BD'],
    60: ['#9EE6C9', '#3FA67F'], 90: ['#FFB3C7', '#D9718F'], 120: ['#7FD6D0', '#2F9D96'], 180: ['#9CCBF2', '#4E8FCB'],
  };
  const GIVEN = ['#ECEBEF', '#8E8A99'];
  const MODES = {
    dogru: { name: 'Doğru Açı', total: 180, icon: '📏', text: 'Doğru açı 180°’dir.' },
    tam: { name: 'Tam Açı', total: 360, icon: '⭕', text: 'Tam açı 360°’dir.' },
  };

  const r2 = n => Math.round(n * 100) / 100;
  const pt = (r, a) => `${r2(r * Math.cos(a * Math.PI / 180))} ${r2(-r * Math.sin(a * Math.PI / 180))}`;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const step = (min, max) => min + 15 * Math.floor(Math.random() * ((max - min) / 15 + 1));

  // Bir açı parçası: renkli yay + iki kol + derece etiketi
  function wedge(a0, span, [fill, dark], label, { R = 150, rd = 46, font = 15, cls = '' } = {}) {
    const a1 = a0 + span, mid = a0 + span / 2;
    const disc = span >= 360
      ? `<circle r="${rd}" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>`
      : `<path d="M0 0 L${pt(rd, a0)} A${rd} ${rd} 0 ${span > 180 ? 1 : 0} 0 ${pt(rd, a1)} Z" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>`;
    const w = Math.max(6, R / 12);
    const arm = a => `<line x1="0" y1="0" x2="${pt(R, a).replace(' ', '" y2="')}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="${pt(R, a).replace(' ', '" y2="')}" stroke="${dark}" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>`;
    // Dar açılarda (15°, 30°) etiket iki kolun arasına, açıortay boyunca yazılır
    const narrow = span < 40;
    const lr = narrow ? R * 0.66 : rd * 0.62;
    const [lx, ly] = pt(lr, mid).split(' ');
    const m = ((mid % 360) + 360) % 360;
    const rot = narrow ? ` transform="rotate(${r2(m > 90 && m < 270 ? 180 - m : -m)} ${lx} ${ly})"` : '';
    return `<g class="${cls}">${arm(a0)}${span < 360 ? arm(a1) : ''}${disc}
      <text x="${lx}" y="${ly}" font-size="${font}" text-anchor="middle" dominant-baseline="central"${rot}>${label}</text></g>`;
  }

  function miniPiece(v, size = 84) {
    const a0 = 90 - v / 2;
    return `<svg viewBox="-48 -50 96 56" width="${size}" aria-hidden="true">${wedge(a0, v, COLORS[v], '', { R: 44, rd: 20, font: 10 })}<circle r="3.5" fill="#2D2440"/></svg><span>${v}°</span>`;
  }

  function makeQuestion(kind) {
    for (;;) {
      if (kind === 'dogru') {
        const n = Math.random() < 0.5 ? 1 : 2;
        const g = Array.from({ length: n }, () => step(15, 150));
        const x = 180 - g.reduce((s, v) => s + v, 0);
        if (x < 15 || x > 165) continue;
        const order = g.map(v => ({ v })); order.splice(Math.floor(Math.random() * (n + 1)), 0, { gap: true, v: x });
        return { kind, x, order, start: 0 };
      }
      const n = Math.random() < 0.5 ? 2 : 3;
      const g = Array.from({ length: n }, () => step(30, 180));
      const x = 360 - g.reduce((s, v) => s + v, 0);
      if (x < 30 || x > 270) continue;
      const order = g.map(v => ({ v })); order.splice(Math.floor(Math.random() * (n + 1)), 0, { gap: true, v: x });
      return { kind, x, order, start: step(0, 345) };
    }
  }

  // ---- Giriş ----
  function intro() {
    stage.innerHTML = `
      <div class="g-intro">
        <div class="big-ic" aria-hidden="true">📐</div>
        <h2>Verilmeyen açıyı bul!</h2>
        <p>Renkli açı parçalarını sürükleyip boşluğa bırak. Boşluğu tam dolduran parçaların toplamı, verilmeyen açıdır. Parçaya dokunarak da yerleştirebilirsin.</p>
        <div class="aci-modes">
          <button class="btn btn-mint" data-mode="dogru">📏 Doğru Açı (180°)</button>
          <button class="btn btn-lilac" data-mode="tam">⭕ Tam Açı (360°)</button>
          <button class="btn btn-yellow" data-mode="karisik">🔀 Karışık</button>
        </div>
      </div>`;
    stage.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => start(b.dataset.mode)));
  }

  // ---- Oyun ----
  let game;
  function start(mode) {
    const kinds = Array.from({ length: ROUNDS }, (_, i) => mode === 'karisik' ? (i % 2 ? 'tam' : 'dogru') : mode);
    game = { mode, kinds, i: 0, clean: 0, t0: Date.now() };
    round();
  }

  function round() {
    const q = makeQuestion(game.kinds[game.i]);
    const st = { q, placed: [], missed: false, solved: false };
    const M = MODES[q.kind];
    const vb = q.kind === 'dogru' ? '-195 -172 390 200' : '-195 -195 390 390';
    stage.innerHTML = `${progressBar(game.i, ROUNDS)}
      <div class="aci-task"><b>${M.icon} ${M.name}</b> ${M.text} Verilmeyen <i>x</i> açısını renkli parçalarla tamamla.</div>
      <div class="aci-board" id="aciBoard"><svg viewBox="${vb}" role="img" aria-label="${M.name} sorusu"></svg></div>
      <div class="aci-status" id="aciStatus" aria-live="polite"></div>
      <div class="aci-tray" id="aciTray">${PIECES.map(v => `<button class="aci-piece" data-v="${v}" aria-label="${v} derecelik parça">${miniPiece(v)}</button>`).join('')}</div>
      <div class="aci-actions"><button class="btn btn-ghost-dark" id="aciUndo" disabled>↶ Geri Al</button></div>`;
    const svg = stage.querySelector('svg');
    const board = stage.querySelector('#aciBoard');
    const status = stage.querySelector('#aciStatus');
    const undo = stage.querySelector('#aciUndo');
    const filled = () => st.placed.reduce((s, v) => s + v, 0);

    function draw(bad) {
      const R = 150, rd = 46;
      let out = q.kind === 'dogru'
        ? `<line x1="-182" y1="0" x2="182" y2="0" stroke="#CFC4DD" stroke-width="4" stroke-linecap="round"/>`
        : `<circle r="178" fill="none" stroke="#E4DCEE" stroke-width="3" stroke-dasharray="6 8"/>`;
      let cur = q.start, gapAt = 0, givens = '';
      q.order.forEach(s => { if (s.gap) gapAt = cur; else givens += wedge(cur, s.v, GIVEN, s.v + '°', { R, rd }); cur += s.v; });
      const f = filled(), rest = q.x - f, g0 = gapAt + f;
      if (rest > 0) {
        const a1 = g0 + rest;
        out += `<path class="aci-gap${bad ? ' bad' : ''}" d="M0 0 L${pt(R, g0)} A${R} ${R} 0 ${rest > 180 ? 1 : 0} 0 ${pt(R, a1)} Z"/>`;
      }
      out += givens;
      let a = gapAt;
      st.placed.forEach((v, k) => { out += wedge(a, v, COLORS[v], v + '°', { R, rd, cls: 'aci-placed' + (k === st.placed.length - 1 && !bad ? ' pop' : '') }); a += v; });
      if (rest > 0) {
        const [lx, ly] = pt(rest < 40 ? R + 22 : R * 0.72, g0 + rest / 2).split(' ');
        out += `<text class="aci-x" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central">x</text>`;
      } else {
        const [lx, ly] = pt(R + 24, gapAt + q.x / 2).split(' ');
        out += `<text class="aci-x done" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central">x = ${q.x}°</text>`;
      }
      out += `<circle r="5" fill="#2D2440"/>`;
      svg.innerHTML = out;
      undo.disabled = !st.placed.length || st.solved;
      status.innerHTML = st.placed.length
        ? `Yerleştirdiğin: <b>${st.placed.map(v => v + '°').join(' + ')}${st.placed.length > 1 ? ` = ${f}°` : ''}</b>`
        : 'Bir parçayı sürükle ya da dokun.';
    }

    function place(v, btn) {
      if (st.solved) return;
      if (filled() + v > q.x) {
        st.missed = true;
        draw(true);
        if (btn) { btn.classList.remove('bad'); void btn.offsetWidth; btn.classList.add('bad'); setTimeout(() => btn.classList.remove('bad'), 700); }
        setTimeout(() => { if (!st.solved) draw(false); }, 700);
        return;
      }
      st.placed.push(v);
      draw(false);
      if (filled() === q.x) solve();
    }

    function solve() {
      st.solved = true;
      if (!st.missed) game.clean++;
      const seq = q.kind === 'dogru' ? [...q.order].reverse() : q.order; // ekranda soldan sağa okunsun
      const givens = seq.map(s => s.gap ? 'x' : s.v + '°').join(' + ');
      status.innerHTML = `<div class="aci-ok">✓ ${givens} = ${MODES[q.kind].total}° &nbsp;→&nbsp; <b>x = ${st.placed.length > 1 ? st.placed.map(v => v + '°').join(' + ') + ' = ' : ''}${q.x}°</b></div>`;
      stage.querySelector('#aciTray').classList.add('locked');
      stage.querySelector('.aci-actions').innerHTML = `<button class="btn btn-yellow" id="aciNext">${game.i + 1 < ROUNDS ? 'Sonraki Soru →' : 'Sonucu Gör 🏁'}</button>`;
      const next = stage.querySelector('#aciNext');
      next.focus({ preventScroll: true });
      next.addEventListener('click', () => { game.i++; game.i < ROUNDS ? round() : finish(); });
    }

    undo.addEventListener('click', () => { if (!st.solved) { st.placed.pop(); draw(false); } });

    // Sürükle-bırak (fare, dokunmatik ve kalem için pointer olayları)
    stage.querySelectorAll('.aci-piece').forEach(btn => {
      const v = Number(btn.dataset.v);
      let s = null, ghost = null;
      const over = e => { const r = board.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
      const clean = () => { if (ghost) ghost.remove(); ghost = null; s = null; board.classList.remove('hover'); btn.classList.remove('lift'); };
      btn.addEventListener('pointerdown', e => {
        if (st.solved || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        s = { x: e.clientX, y: e.clientY };
        try { btn.setPointerCapture(e.pointerId); } catch {}
      });
      btn.addEventListener('pointermove', e => {
        if (!s) return;
        if (!ghost && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) {
          ghost = document.createElement('div'); ghost.className = 'aci-ghost'; ghost.innerHTML = miniPiece(v, 110);
          document.body.appendChild(ghost); btn.classList.add('lift');
        }
        if (ghost) {
          ghost.style.transform = `translate(${e.clientX - 55}px, ${e.clientY - 60}px)`;
          board.classList.toggle('hover', over(e));
        }
      });
      btn.addEventListener('pointerup', e => {
        if (!s) return;
        const dragged = !!ghost, inBoard = over(e);
        clean();
        if (!dragged || inBoard) place(v, btn);
      });
      btn.addEventListener('pointercancel', clean);
      btn.addEventListener('click', e => { if (e.detail === 0) place(v, btn); }); // klavye
    });

    draw(false);
  }

  function finish() {
    const pct = game.clean / ROUNDS;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    const msg = stars === 3 ? 'Gerçek bir açı ustasısın!' : stars === 2 ? 'Çok iyi gidiyorsun!' : 'Güzel başlangıç, bir daha dene!';
    stage.innerHTML = `
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(n => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${msg}</h2>
        <div class="g-score"><b>${game.clean}</b><span>/ ${ROUNDS}</span></div>
        <p class="g-time">Hatasız çözdüğün soru · ⏱ ${fmtTime(Date.now() - game.t0)}</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="again">↻ Tekrar Oyna</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#again').addEventListener('click', intro);
    if (stars >= 2) confetti();
  }

  intro();
})();
