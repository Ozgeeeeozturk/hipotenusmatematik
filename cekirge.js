/* Zıpzıp Çekirge: sayı doğrusunda uzaklık, eşit sıçrayış ve ara noktalar */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // [başlangıç, bitiş, sıçrayış sayısı]. İlki kitaptaki soru.
  const ROUNDS = [[-8, 7, 5], [-6, 6, 4], [-10, 2, 3], [-12, 8, 4], [6, -9, 5], [-15, -3, 4], [-5, 11, 4], [8, -10, 3]];
  const LETTERS = 'ABCDEFG';
  const NEG = '#E5484D', POS = '#2F8FC9', ARC = '#E8501E';
  const VW = 720, PAD = 34, LY = 112;
  const sg = n => (n < 0 ? `−${-n}` : n > 0 ? `+${n}` : '0');   // −8, +7, 0
  const nm = n => (n < 0 ? `−${-n}` : `${n}`);                  // −8, 7
  const par = n => `(${sg(n)})`;
  // Türkçe ekler (son okunan sözcüğe göre): ayrılma, yönelme, belirtme
  const SUF = { 0: ['dan', 'a', 'ı'], 1: ['den', 'e', 'i'], 2: ['den', 'ye', 'yi'], 3: ['ten', 'e', 'ü'], 4: ['ten', 'e', 'ü'], 5: ['ten', 'e', 'i'], 6: ['dan', 'ya', 'yı'], 7: ['den', 'ye', 'yi'], 8: ['den', 'e', 'i'], 9: ['dan', 'a', 'u'], 10: ['dan', 'a', 'u'], 20: ['den', 'ye', 'yi'] };
  const ek = (n, k) => { const a = Math.abs(n), d = a % 10; return `${par(n)}’${(d || a === 0 ? SUF[d] : SUF[a])[k]}`; };

  let idx = 0, score = 0;
  const MAX = ROUNDS.length * 3;

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">🦗</span>
    <p>Sayı doğrusunda iki nokta arasındaki <b class="k1">uzaklığı</b> bulurken <mark>sıfırı geçiyorsak</mark> iki parçayı <b class="k2">toplarız</b>. Eşit sıçrayışlarda <b class="k3">toplam yol ÷ sıçrayış sayısı</b> bir sıçrayışı verir.</p>
  </div>`;

  function round() {
    const [s, e, n] = ROUNDS[idx];
    const dist = Math.abs(e - s), step = (e - s) / n, dir = Math.sign(e - s);
    const pts = Array.from({ length: n - 1 }, (_, i) => s + step * (i + 1));
    let lo = Math.min(s, e, 0) - 1, hi = Math.max(s, e, 0) + 1;
    const X = v => PAD + (v - lo) * (VW - 2 * PAD) / (hi - lo);
    const st = { phase: 1, tape: s, jumps: [], frog: s, flying: null, revealed: false, tries: [0, 0, 0] };

    stage.innerHTML = `${NOTE}
      ${progressBar(idx, ROUNDS.length)}
      <p class="pg-step"><b>${idx + 1}. soru:</b> Çekirge ${par(s)} noktasından başlayarak eşit uzunlukta <b>${n} sıçrayış</b> yapıyor ve ${par(e)} noktasına ulaşıyor.</p>
      <ol class="ck-steps" id="ckSteps"><li class="on">1 · Yolu ölç</li><li>2 · Sıçrayışı bul</li><li>3 · Noktaları bul</li></ol>
      <svg viewBox="0 0 ${VW} 210" class="ck-board" id="ckBoard" role="img" aria-label="Sayı doğrusu"></svg>
      <div class="ck-panel" id="ckPanel"></div>
      <p class="pg-fb" id="ckFb" aria-live="polite"></p>
      <div class="aci-actions" id="ckActions"></div>`;
    const svg = stage.querySelector('#ckBoard'), panel = stage.querySelector('#ckPanel'), fb = stage.querySelector('#ckFb');
    const setFb = (ok, html) => { fb.className = 'pg-fb ' + (ok == null ? '' : ok ? 'ok' : 'no'); fb.innerHTML = html; };
    const steps = k => stage.querySelectorAll('#ckSteps li').forEach((li, i) => { li.className = i + 1 < k ? 'done' : i + 1 === k ? 'on' : ''; });

    function draw() {
      let g = `<line x1="${PAD - 22}" y1="${LY}" x2="${VW - PAD + 22}" y2="${LY}" class="ck-axis"/>
        <path d="M${PAD - 26} ${LY} l10 -6 v12 z" fill="#2D2440"/><path d="M${VW - PAD + 26} ${LY} l-10 -6 v12 z" fill="#2D2440"/>`;
      for (let v = lo; v <= hi; v++) {
        const key = v === s || v === e || v === 0;
        g += `<line x1="${X(v)}" y1="${LY - (key ? 9 : 5)}" x2="${X(v)}" y2="${LY + (key ? 9 : 5)}" class="ck-tick${key ? ' key' : ''}"/>`;
      }
      // Etiketler: uçlar, sıfır, harfli noktalar
      const lab = (v, t, cls) => `<text x="${X(v)}" y="${LY + 30}" text-anchor="middle" class="ck-num ${cls || ''}">${t}</text>`;
      g += lab(s, sg(s), 'end') + lab(e, sg(e), 'end');
      if (s !== 0 && e !== 0 && !pts.includes(0)) g += lab(0, '0');
      pts.forEach((p, i) => {
        g += `<circle cx="${X(p)}" cy="${LY}" r="5" fill="${ARC}"/>`;
        g += lab(p, st.revealed ? `${LETTERS[i]} = ${nm(p)}` : LETTERS[i], st.revealed ? 'rev' : 'let');
      });
      // Şerit (1. adım)
      if (st.tape !== s || st.phase === 1) {
        const y = LY + 62, a = s, b = st.tape;
        const cross = (a < 0 && b > 0) || (a > 0 && b < 0);
        const part = (u, v, c) => (u === v ? '' : `<line x1="${X(u)}" y1="${y}" x2="${X(v)}" y2="${y}" stroke="${c}" stroke-width="10" stroke-linecap="butt" opacity=".85"/>
            <text x="${(X(u) + X(v)) / 2}" y="${y + 26}" text-anchor="middle" class="ck-part" fill="${c}">${Math.abs(v - u)} birim</text>`);
        g += cross ? part(a, 0, a < 0 ? NEG : POS) + part(0, b, b < 0 ? NEG : POS) : part(a, b, (a + b) / 2 < 0 || b < 0 ? NEG : POS);
        if (st.phase === 1) g += `<g class="ck-handle"><circle cx="${X(b)}" cy="${y}" r="14" fill="#FFD84D" stroke="#E0B820" stroke-width="3"/><text x="${X(b)}" y="${y + 5}" text-anchor="middle" class="ck-hand">↔</text></g>`;
      }
      // Sıçrayış yayları
      st.jumps.forEach(([u, v], i) => {
        const x1 = X(u), x2 = X(v), mx = (x1 + x2) / 2, h = Math.min(60, Math.abs(x2 - x1) * 0.55 + 18);
        const d = v - u;
        g += `<path d="M${x1} ${LY - 16} Q${mx} ${LY - 16 - h * 1.6} ${x2} ${LY - 16}" fill="none" stroke="${ARC}" stroke-width="4" marker-end="url(#ckArrow)"/>
          <text x="${mx}" y="${LY - 22 - h * 0.8}" text-anchor="middle" class="ck-jl">${sg(d)}</text>`;
      });
      // Çekirge
      let fx = X(st.frog), fy = LY - 12;
      if (st.flying) { fx = st.flying[0]; fy = st.flying[1]; }
      fx = Math.max(10, Math.min(VW - 10, fx));
      g += `<text x="${fx}" y="${fy}" text-anchor="middle" class="ck-frog" ${dir < 0 ? `transform="scale(-1 1) translate(${-2 * fx} 0)"` : ''}>🦗</text>`;
      svg.innerHTML = `<defs><marker id="ckArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${ARC}"/></marker></defs>${g}`;
    }

    // ---- 1. adım: yolu ölç ----
    function phase1() {
      steps(1);
      panel.innerHTML = `<p class="ck-ask">👉 Sarı tutamacı sürükleyerek şeridi <b>${ek(s, 0)}</b> <b>${ek(e, 1)}</b> kadar uzat.</p>`;
      const toVal = ev => {
        const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
        let v = Math.round(lo + (p.x - PAD) * (hi - lo) / (VW - 2 * PAD));
        return dir > 0 ? Math.max(s, Math.min(e, v)) : Math.min(s, Math.max(e, v));
      };
      let dragging = false;
      const move = ev => { const v = toVal(ev); if (v !== st.tape) { st.tape = v; draw(); if (v === e) measured(); } };
      svg.onpointerdown = ev => { if (st.phase !== 1) return; ev.preventDefault(); dragging = true; try { svg.setPointerCapture(ev.pointerId); } catch {} move(ev); };
      svg.onpointermove = ev => { if (dragging && st.phase === 1) move(ev); };
      svg.onpointerup = svg.onpointercancel = () => { dragging = false; };
    }
    function measured() {
      st.phase = 1.5;
      const cross = (s < 0 && e > 0) || (s > 0 && e < 0);
      const a = Math.abs(s), b = Math.abs(e);
      const pool = [Math.abs(a - b), s + e, dist - 1, dist + 1, dist + 2].filter(v => v !== dist);
      const list = shuffle([dist, ...[...new Set(pool)].slice(0, 3)]);
      panel.innerHTML = `<p class="ck-ask">${cross ? `Şerit sıfırda ikiye ayrıldı: <b style="color:${s < 0 ? NEG : POS}">${a} birim</b> ve <b style="color:${e < 0 ? NEG : POS}">${b} birim</b>.` : `Şerit sıfırı geçmedi.`} Çekirge <b>toplam kaç birim</b> yol alacak?</p>
        <div class="g-options pg-opts">${list.map((v, i) => `<button class="g-opt c${i}" data-v="${v}"><b>${'ABCD'[i]}</b>${nm(v)}</button>`).join('')}</div>`;
      draw();
      quiz(v => v === dist, 0, () => {
        setFb(true, cross ? `✓ ${a} + ${b} = ${dist} birim. Sıfırın iki yanındaki uzaklıkları topladık.` : `✓ ${Math.max(a, b)} − ${Math.min(a, b)} = ${dist} birim.`);
      }, v => setFb(false, v === Math.abs(a - b) && cross ? `✗ ${Math.max(a, b)} − ${Math.min(a, b)} değil! Sıfırı geçince iki parça <b>toplanır</b>. Şeride bak.` : `✗ Şeritteki parçalara tekrar bak.`), phase2);
    }

    // Seçenekli soru yardımcısı: yanlışta tekrar denenebilir
    function quiz(check, k, onOk, onNo, next) {
      panel.querySelectorAll('.g-opt').forEach(btn => btn.addEventListener('click', () => {
        const v = Number(btn.dataset.v);
        st.tries[k]++;
        if (check(v)) {
          btn.classList.add('right');
          panel.querySelectorAll('.g-opt').forEach(x => { x.disabled = true; });
          if (st.tries[k] === 1) score++;
          onOk(); nextBtn('Devam →', next);
        } else { btn.classList.add('wrong'); btn.disabled = true; onNo(v); }
      }));
    }

    // ---- 2. adım: sıçrayış uzunluğu ----
    function phase2() {
      st.phase = 2; steps(2); setFb(null, '');
      const maxL = Math.max(8, Math.abs(step) + 3);
      panel.innerHTML = `<p class="ck-ask">👉 Bir sıçrayış kaç birim olmalı? Seç ve <b>Zıpla!</b> de. Çekirge ${n} kez zıplayacak.</p>
        <div class="ck-lens">${Array.from({ length: maxL }, (_, i) => `<button class="ck-len" data-l="${i + 1}">${i + 1}</button>`).join('')}</div>
        <div class="aci-actions"><button class="btn btn-yellow" id="ckJump" disabled>🦗 Zıpla!</button></div>`;
      let L = 0;
      panel.querySelectorAll('.ck-len').forEach(b => b.addEventListener('click', () => {
        if (st.anim) return;
        panel.querySelectorAll('.ck-len').forEach(x => x.classList.toggle('on', x === b));
        L = +b.dataset.l; panel.querySelector('#ckJump').disabled = false;
      }));
      panel.querySelector('#ckJump').addEventListener('click', () => {
        if (!L || st.anim) return;
        st.tries[1]++;
        hop(L * dir, () => {
          const land = s + L * dir * n;
          if (land === e) {
            if (st.tries[1] === 1) score++;
            panel.querySelectorAll('.ck-len, #ckJump').forEach(x => { x.disabled = true; });
            setFb(true, `✓ Her sıçrayış ${L} birim! ${dist} ÷ ${n} = ${L}. ${dir < 0 ? `Çekirge sola gittiği için her sıçrayış <b>${sg(-L)}</b>.` : ''}`);
            nextBtn('Devam →', phase3);
          } else {
            const far = dir > 0 ? land > e : land < e;
            setFb(false, `✗ Çekirge ${par(land)} noktasına kondu; ${far ? ek(e, 2) + " geçti" : ek(e, 1) + " ulaşamadı"}. ${far ? 'Daha kısa' : 'Daha uzun'} bir sıçrayış dene.`);
          }
        });
      });
    }

    // n sıçrayışın animasyonu
    function hop(d, done) {
      st.anim = true; st.jumps = []; st.frog = s; st.tape = s; draw();
      let i = 0;
      const one = () => {
        if (i >= n) { st.anim = false; done(); return; }
        const u = s + d * i, v = s + d * (i + 1), x1 = X(u), x2 = X(v), t0 = performance.now();
        const h = Math.min(60, Math.abs(x2 - x1) * 0.55 + 18);
        const tick = now => {
          const k = Math.min(1, (now - t0) / 420);
          st.flying = [x1 + (x2 - x1) * k, LY - 12 - 4 * h * 1.2 * k * (1 - k)];
          draw();
          if (k < 1) requestAnimationFrame(tick);
          else { st.flying = null; st.frog = v; st.jumps.push([u, v]); draw(); i++; setTimeout(one, 90); }
        };
        requestAnimationFrame(tick);
      };
      one();
    }

    // ---- 3. adım: noktalar ----
    function phase3() {
      st.phase = 3; steps(3); setFb(null, '');
      panel.innerHTML = `<p class="ck-ask">👉 ${pts.map((_, i) => LETTERS[i]).join(', ')} noktalarına karşılık gelen tam sayıları yaz. İpucu: ${ek(s, 0)} başla, her sıçrayışta <b>${sg(step)}</b> ekle.</p>
        <div class="ck-inputs">${pts.map((_, i) => `<label class="ck-in"><b>${LETTERS[i]}</b><input inputmode="numeric" autocomplete="off" data-i="${i}" aria-label="${LETTERS[i]} noktası"><small></small></label>`).join('')}</div>
        <div class="ck-signs"><span>Eksi işareti:</span><button type="button" class="ck-minus">−</button></div>
        <div class="aci-actions"><button class="btn btn-yellow" id="ckCheck">✓ Kontrol Et</button></div>`;
      let last = panel.querySelector('.ck-in input');
      panel.querySelectorAll('.ck-in input').forEach(inp => inp.addEventListener('focus', () => { last = inp; }));
      panel.querySelector('.ck-minus').addEventListener('click', () => {
        const v = last.value.trim(); last.value = v.startsWith('-') || v.startsWith('−') ? v.slice(1) : '−' + v; last.focus();
      });
      panel.querySelector('#ckCheck').addEventListener('click', () => {
        st.tries[2]++;
        let all = true;
        panel.querySelectorAll('.ck-in').forEach((lbl, i) => {
          const inp = lbl.querySelector('input'), raw = inp.value.replace(/\s/g, '').replace('−', '-').replace('+', '');
          const ok = raw !== '' && Number(raw) === pts[i];
          const prev = i === 0 ? s : pts[i - 1];
          lbl.classList.toggle('ok', ok); lbl.classList.toggle('no', !ok);
          lbl.querySelector('small').textContent = ok ? `${nm(prev)} ${step < 0 ? '−' : '+'} ${Math.abs(step)} = ${nm(pts[i])}` : '';
          if (ok) inp.disabled = true;
          all = all && ok;
        });
        if (all) {
          if (st.tries[2] === 1) score++;
          st.revealed = true; draw();
          panel.querySelector('#ckCheck').disabled = true;
          setFb(true, `✓ Harika! ${[s, ...pts, e].map(nm).join(' → ')}`);
          const lastR = idx + 1 >= ROUNDS.length;
          nextBtn(lastR ? 'Bitir 🏁' : 'Sonraki Soru →', () => { idx++; lastR ? summary() : round(); });
        } else setFb(false, '✗ Kırmızı kutuları tekrar dene. Bir önceki noktaya sıçrayış uzunluğunu ekle.');
      });
    }

    function nextBtn(label, fn) {
      const a = stage.querySelector('#ckActions');
      a.innerHTML = `<button class="btn btn-yellow" id="ckNext">${label}</button>`;
      const b = a.querySelector('#ckNext');
      b.focus({ preventScroll: true });
      b.addEventListener('click', () => { a.innerHTML = ''; fn(); });
    }

    draw(); phase1();
  }

  function summary() {
    const pct = score / MAX;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Çekirge yuvasına ulaştı!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${MAX}</span></div>
        <p class="g-time">İlk denemede doğru adım</p>
        <table class="pg-table">
          <thead><tr><th>Başlangıç</th><th>Bitiş</th><th>Yol</th><th>Sıçrayış</th></tr></thead>
          <tbody>${ROUNDS.map(([s, e, n]) => `<tr><td>${sg(s)}</td><td>${sg(e)}</td><td>${Math.abs(e - s)}</td><td>${n} × ${sg((e - s) / n)}</td></tr>`).join('')}</tbody>
        </table>
        <p class="pg-rule">Toplam yol ÷ sıçrayış sayısı = <b>bir sıçrayış</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="ckAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#ckAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    if (stars >= 2) confetti();
  }

  round();
})();
