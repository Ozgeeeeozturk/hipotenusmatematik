/* Küp ve Dikdörtgenler Prizması Açınımı: 3B katla / aç, her yönden döndür */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // Yüzler: rol → renk, ad ve boyutları ({a: en, b: boy, c: yükseklik})
  const FACES = {
    B: { name: 'Alt', color: '#F7A8C4', dims: ['a', 'b'] },
    T: { name: 'Üst', color: '#FFD84D', dims: ['a', 'b'] },
    F: { name: 'Ön', color: '#9EE6C9', dims: ['a', 'c'] },
    K: { name: 'Arka', color: '#C9B6F2', dims: ['a', 'c'] },
    L: { name: 'Sol', color: '#8FD3F4', dims: ['b', 'c'] },
    R: { name: 'Sağ', color: '#FDBA74', dims: ['b', 'c'] },
  };
  // Açınımlar: kök Alt yüz; [yüz, ebeveyn, kenar] (N kuzey, S güney, W batı, E doğu)
  const NETS = [
    [['F', 'B', 'S'], ['K', 'B', 'N'], ['L', 'B', 'W'], ['R', 'B', 'E'], ['T', 'K', 'N']],
    [['F', 'B', 'S'], ['K', 'B', 'N'], ['L', 'B', 'W'], ['R', 'B', 'E'], ['T', 'R', 'E']],
    [['L', 'B', 'W'], ['K', 'L', 'N'], ['R', 'B', 'E'], ['F', 'R', 'S'], ['T', 'R', 'E']],
  ];
  const VIEWS = [
    { name: 'Çapraz', rx: 58, rz: -28 },
    { name: 'Üstten', rx: 0, rz: 0 },
    { name: 'Önden', rx: 90, rz: 0 },
    { name: 'Sağdan', rx: 90, rz: 90 },
    { name: 'Arkadan', rx: 90, rz: 180 },
    { name: 'Alttan', rx: 180, rz: 0 },
  ];

  const S = { shape: 'kup', net: 0, dims: { a: 4, b: 2, c: 3 }, f: 1, rx: 58, rz: -28, spin: false };
  let anim = null, spinRaf = null;

  stage.innerHTML = `
    <div class="pg-def">
      <span class="pg-def-ic" aria-hidden="true">🧊</span>
      <p><b class="k1">Açınım</b>, bir cismin yüzeyini <mark>düzleme açtığımızda</mark> elde ettiğimiz şekildir. Katladığımızda yeniden <b class="k3">cismi oluşturur!</b></p>
    </div>
    <div class="an-tabs" role="tablist">
      <button class="an-tab on" data-shape="kup" role="tab">🧊 Küp</button>
      <button class="an-tab" data-shape="prizma" role="tab">📦 Dikdörtgenler Prizması</button>
    </div>
    <div class="an-dims" id="anDims" hidden></div>
    <div class="an-scene" id="anScene" aria-label="3 boyutlu cisim: sürükleyerek döndür">
      <div class="an-world" id="anWorld"></div>
      <span class="an-drag">👆 Sürükle ve döndür</span>
    </div>
    <div class="an-fold">
      <button class="btn btn-yellow" id="anToggle">📂 Aç</button>
      <label class="an-slider"><span>Kapalı</span><input type="range" id="anRange" min="0" max="100" value="0" aria-label="Açılma miktarı"><span>Açık</span></label>
    </div>
    <div class="an-views">
      ${VIEWS.map((v, i) => `<button class="an-view" data-v="${i}">${v.name}</button>`).join('')}
      <button class="an-view an-spin" id="anSpin">🔄 Kendi dönsün</button>
    </div>
    <div class="an-nets"><span>Açınım:</span>${NETS.map((_, i) => `<button class="an-net${i ? '' : ' on'}" data-n="${i}">${i + 1}</button>`).join('')}</div>
    <div class="an-info" id="anInfo"></div>`;

  const scene = stage.querySelector('#anScene'), world = stage.querySelector('#anWorld');
  const range = stage.querySelector('#anRange'), toggle = stage.querySelector('#anToggle');

  // CSS dönme matrisleri (katlı hâldeki yüz yönlerini hesaplamak için)
  function rot(ax, deg) {
    const r = deg * Math.PI / 180, c = Math.round(Math.cos(r)), s = Math.round(Math.sin(r));
    return ax === 'x' ? [[1, 0, 0], [0, c, -s], [0, s, c]] : ax === 'y' ? [[c, 0, s], [0, 1, 0], [-s, 0, c]] : [[c, -s, 0], [s, c, 0], [0, 0, 1]];
  }
  const mul = (A, B) => A.map((row, i) => B[0].map((_, j) => row.reduce((t, _, k) => t + A[i][k] * B[k][j], 0)));

  const dims = () => (S.shape === 'kup' ? { a: 3, b: 3, c: 3 } : S.dims);
  const other = (role, len, d) => { const v = FACES[role].dims.map(k => d[k]); const i = v.indexOf(len); v.splice(i, 1); return v[0]; };

  // Açınımın düz hâlinin genişliği (birim) → ekrana sığdır
  function layout(d) {
    const net = NETS[S.net], box = { B: { x: 0, y: 0, w: d.a, h: d.b } };
    for (const [role, par, edge] of net) {
      const p = box[par];
      if (edge === 'N' || edge === 'S') { const w = p.w, h = other(role, w, d); box[role] = { x: p.x, y: edge === 'S' ? p.y + p.h : p.y - h, w, h }; }
      else { const h = p.h, w = other(role, h, d); box[role] = { x: edge === 'E' ? p.x + p.w : p.x - w, y: p.y, w, h }; }
    }
    return box;
  }

  function build() {
    const d = dims(), box = layout(d);
    const cx = d.a / 2, cy = d.b / 2;
    let ext = 0;
    for (const k in box) { const b = box[k]; ext = Math.max(ext, Math.abs(b.x - cx), Math.abs(b.x + b.w - cx), Math.abs(b.y - cy), Math.abs(b.y + b.h - cy)); }
    const W = scene.clientWidth || 600;
    const U = Math.max(14, Math.min(46, (Math.min(W, 640) / 2 - 16) / ext));
    S.U = U;
    const el = {};
    const face = (role, w, h) => {
      const f = document.createElement('div');
      f.className = 'an-face';
      f.style.cssText = `width:${w * U}px;height:${h * U}px;--fc:${FACES[role].color}E6;background-size:${U}px ${U}px`;
      f.innerHTML = `<span class="an-lb">${FACES[role].name}</span><span class="an-lb back">${FACES[role].name}</span>`;
      el[role] = f; return f;
    };
    world.innerHTML = '';
    const mat = { B: rot('x', 0) };
    const root = face('B', d.a, d.b);
    root.style.left = `${-d.a * U / 2}px`; root.style.top = `${-d.b * U / 2}px`;
    world.appendChild(root);
    for (const [role, par, edge] of NETS[S.net]) {
      const b = box[role], p = box[par], f = face(role, b.w, b.h);
      const pos = {
        S: [0, p.h * U, '50% 0', 'rotateX(calc(var(--f) * 90deg))'],
        N: [0, -b.h * U, '50% 100%', 'rotateX(calc(var(--f) * -90deg))'],
        W: [-b.w * U, 0, '100% 50%', 'rotateY(calc(var(--f) * 90deg))'],
        E: [p.w * U, 0, '0 50%', 'rotateY(calc(var(--f) * -90deg))'],
      }[edge];
      f.style.left = `${pos[0]}px`; f.style.top = `${pos[1]}px`;
      f.style.transformOrigin = pos[2]; f.style.transform = pos[3];
      el[par].appendChild(f);
      mat[role] = mul(mat[par], { S: rot('x', 90), N: rot('x', -90), W: rot('y', 90), E: rot('y', -90) }[edge]);
    }
    // Dışarıdan okunan etiket: katlı hâlde yazının "yukarısı" duvarlarda yukarıyı, alt/üstte arkayı göstersin
    for (const role in el) {
      const want = role === 'B' || role === 'T' ? [0, -1, 0] : [0, 0, 1];
      let best = 0, bestDot = -9;
      for (const phi of [0, 90, 180, 270]) {
        const M = mul(mul(mat[role], rot('y', 180)), rot('z', phi));
        const up = [-M[0][1], -M[1][1], -M[2][1]]; // M · (0,-1,0)
        const dot = up[0] * want[0] + up[1] * want[1] + up[2] * want[2];
        if (dot > bestDot + 1e-6) { bestDot = dot; best = phi; }
      }
      el[role].querySelector('.an-lb.back').style.transform = `rotateY(180deg) rotateZ(${best}deg)`;
    }
    info(d);
    apply();
  }

  function apply() {
    const d = dims(), fold = S.f; // S.f: 1 kapalı (katlı), 0 açık
    world.style.setProperty('--f', fold);
    world.style.transform = `rotateX(${S.rx}deg) rotateZ(${S.rz}deg) translateZ(${-d.c * S.U * fold / 2}px)`;
    range.value = Math.round((1 - fold) * 100);
    toggle.textContent = fold > 0.5 ? '📂 Aç' : '📦 Kapat';
  }

  function info(d) {
    const cube = S.shape === 'kup';
    const pair = (r1, r2) => { const [x, y] = FACES[r1].dims.map(k => d[k]); return `<li><i style="background:${FACES[r1].color}"></i><i style="background:${FACES[r2].color}"></i>${FACES[r1].name} – ${FACES[r2].name}: <b>${x} × ${y}</b> ${cube ? 'kare' : x === y ? 'kare' : 'dikdörtgen'}</li>`; };
    stage.querySelector('#anInfo').innerHTML = `
      <div class="an-facts">
        <div><b>6</b><span>yüz</span></div><div><b>12</b><span>ayrıt</span></div><div><b>8</b><span>köşe</span></div>
      </div>
      <p class="an-rule">${cube
        ? 'Küpün <b>6 yüzü de eş karedir</b>; bütün ayrıtları eşittir.'
        : 'Dikdörtgenler prizmasında <b>karşılıklı yüzler eştir</b>. Aynı renk çiftleri birbirinin karşısındadır:'}</p>
      ${cube ? '' : `<ul class="an-pairs">${pair('B', 'T')}${pair('F', 'K')}${pair('L', 'R')}</ul>`}`;
  }

  function dimsUI() {
    const box = stage.querySelector('#anDims');
    box.hidden = S.shape !== 'prizma';
    const row = (k, label) => `<div class="an-dim"><span>${label}</span><button data-k="${k}" data-d="-1" aria-label="${label} azalt">−</button><b>${S.dims[k]}</b><button data-k="${k}" data-d="1" aria-label="${label} artır">+</button></div>`;
    box.innerHTML = row('a', 'En') + row('b', 'Boy') + row('c', 'Yükseklik');
  }
  stage.querySelector('#anDims').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    const k = b.dataset.k; S.dims[k] = Math.max(1, Math.min(5, S.dims[k] + Number(b.dataset.d)));
    dimsUI(); build();
  });

  // Aç / kapat animasyonu
  function animateTo(target) {
    cancelAnimationFrame(anim);
    const from = S.f, t0 = performance.now(), dur = 1400 * Math.abs(target - from) + 1;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      S.f = from + (target - from) * e; apply();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  toggle.addEventListener('click', () => animateTo(S.f > 0.5 ? 0 : 1));
  range.addEventListener('input', () => { cancelAnimationFrame(anim); S.f = 1 - range.value / 100; apply(); });

  // Görünüm düğmeleri (yumuşak geçiş)
  function viewTo(v) {
    stopSpin();
    world.classList.add('smooth');
    S.rx = v.rx; S.rz = v.rz; apply();
    setTimeout(() => world.classList.remove('smooth'), 650);
  }
  stage.querySelectorAll('.an-view[data-v]').forEach(b => b.addEventListener('click', () => viewTo(VIEWS[+b.dataset.v])));

  function stopSpin() { S.spin = false; cancelAnimationFrame(spinRaf); stage.querySelector('#anSpin').classList.remove('on'); }
  stage.querySelector('#anSpin').addEventListener('click', e => {
    if (S.spin) return stopSpin();
    S.spin = true; e.currentTarget.classList.add('on');
    let last = performance.now();
    const tick = now => { if (!S.spin) return; S.rz += (now - last) * 0.03; last = now; apply(); spinRaf = requestAnimationFrame(tick); };
    spinRaf = requestAnimationFrame(tick);
  });

  // Sürükleyerek döndür
  let drag = null;
  scene.addEventListener('pointerdown', e => {
    stopSpin(); drag = { x: e.clientX, y: e.clientY, rx: S.rx, rz: S.rz };
    scene.classList.add('grab');
    try { scene.setPointerCapture(e.pointerId); } catch {}
  });
  scene.addEventListener('pointermove', e => {
    if (!drag) return;
    S.rz = drag.rz - (e.clientX - drag.x) * 0.5;
    S.rx = drag.rx - (e.clientY - drag.y) * 0.5;
    apply();
  });
  const end = () => { drag = null; scene.classList.remove('grab'); };
  scene.addEventListener('pointerup', end); scene.addEventListener('pointercancel', end);

  stage.querySelectorAll('.an-tab').forEach(b => b.addEventListener('click', () => {
    stage.querySelectorAll('.an-tab').forEach(x => x.classList.toggle('on', x === b));
    S.shape = b.dataset.shape; dimsUI(); build();
  }));
  stage.querySelectorAll('.an-net').forEach(b => b.addEventListener('click', () => {
    stage.querySelectorAll('.an-net').forEach(x => x.classList.toggle('on', x === b));
    S.net = +b.dataset.n; build();
  }));
  window.addEventListener('resize', () => build());

  dimsUI(); build();
  // Açılışta cismi kapalı göster, sonra yavaşça aç
  setTimeout(() => animateTo(0), 700);
})();
