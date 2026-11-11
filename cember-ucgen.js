/* Çember Atölyesi: iki çemberin merkezleri ve kesişim noktasıyla üçgen oluşturma */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  const CA = '#E8701E', CB = '#7B4FA8', CAB = '#2F6FB0';
  const VW = 640, VH = 400;
  const TYPES = { eskenar: 'Eşkenar üçgen', ikizkenar: 'İkizkenar üçgen', cesitkenar: 'Çeşitkenar üçgen' };

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">💡</span>
    <p>Bu soruların püf noktası: <mark>Çemberin üzerindeki her nokta merkeze yarıçap kadar uzaktır.</mark> Yani <b class="k1">[AC]</b> A’nın yarıçapı, <b class="k3">[BC]</b> B’nin yarıçapıdır!</p>
  </div>`;

  // Görevler: başlangıç değerleri, kilitli olanlar ve hedef
  const TASKS = [
    { ab: 6, ra: 3, rb: 3, lock: ['ab'], text: '[AB] = 6 cm. Yarıçapları ayarlayarak <b>eşkenar üçgen</b> oluştur.', ok: s => s.type === 'eskenar', hint: 'Eşkenar üçgende üç kenar da eşit: iki yarıçap da [AB] kadar olmalı.' },
    { ab: 6, ra: 2, rb: 2, lock: ['ab'], text: '[AB] = 6 cm. <b>Yarıçapları eşit</b> olan ama <b>eşkenar olmayan</b> bir ikizkenar üçgen oluştur.', ok: s => s.type === 'ikizkenar' && s.ra === s.rb, hint: 'İki yarıçap eşit olsun ama 6 cm olmasın. Çemberlerin kesişmesine de dikkat!' },
    { ab: 5, ra: 3, rb: 3, lock: ['ab'], text: '[AB] = 5 cm. <b>Yarıçapları farklı</b> olan bir <b>ikizkenar</b> üçgen oluştur.', ok: s => s.type === 'ikizkenar' && s.ra !== s.rb, hint: 'Yarıçaplardan biri [AB] kadar olursa, o kenar [AB]’ye eşit olur.' },
    { ab: 6, ra: 4, rb: 4, lock: ['ab'], text: '[AB] = 6 cm. <b>Çeşitkenar</b> üçgen oluştur.', ok: s => s.type === 'cesitkenar', hint: 'Üç kenar da farklı olmalı: yarıçaplar birbirinden ve 6’dan farklı olsun.' },
    { ab: 7, ra: 7, rb: 7, lock: ['ab', 'ra'], text: '[AB] = 7 cm, A’nın yarıçapı 7 cm. B’nin yarıçapını ayarlayarak <b>eşkenar olmayan ikizkenar</b> üçgen oluştur.', ok: s => s.type === 'ikizkenar', hint: '[AC] = [AB] = 7 cm zaten eşit. B’nin yarıçapı 7 olmasın.' },
    { ab: 8, ra: 5, rb: 5, lock: ['ab'], text: '[AB] = 8 cm. Öyle yarıçaplar seç ki <b>çemberler kesişmesin</b> ve <b>üçgen oluşmasın</b>.', ok: s => !s.tri, hint: 'Yarıçaplar toplamı 8’den küçük ya da eşit olursa çemberler birbirine ulaşamaz.' },
    { ab: 3, ra: 5, rb: 5, lock: [], text: 'Her şey senin elinde! <b>Kenar uzunluğu 4 cm</b> olan bir <b>eşkenar üçgen</b> oluştur.', ok: s => s.type === 'eskenar' && s.ab === 4, hint: '[AB] de, iki yarıçap da 4 cm olmalı.' },
    { ab: 4, ra: 5, rb: 3, lock: ['ab', 'ra', 'rb'], quiz: true, text: 'A’nın yarıçapı 5 cm, B’nin yarıçapı 3 cm, [AB] = 4 cm. Oluşan <b>ABC üçgeni hangi tür</b>?', answer: 'cesitkenar' },
  ];

  function state(ab, ra, rb) {
    const tri = ra + rb > ab && Math.abs(ra - rb) < ab;
    let type = null;
    if (tri) { const eq = (ra === rb) + (ra === ab) + (rb === ab); type = eq === 3 ? 'eskenar' : eq >= 1 ? 'ikizkenar' : 'cesitkenar'; }
    const touch = ra + rb === ab || Math.abs(ra - rb) === ab;
    return { ab, ra, rb, tri, type, touch };
  }

  // Çizim: A orijinde, B sağda; ölçek tüm çemberleri sığdıracak şekilde
  function boardSVG(s) {
    const { ab, ra, rb, tri } = s;
    const minX = Math.min(-ra, ab - rb), maxX = Math.max(ra, ab + rb), R = Math.max(ra, rb);
    const k = Math.min(42, (VW - 40) / (maxX - minX), (VH - 40) / (2 * R));
    const ox = VW / 2 - (minX + maxX) / 2 * k, oy = VH / 2;
    const P = (x, y) => [ox + x * k, oy - y * k];
    // kareli zemin (1 cm)
    let grid = '';
    for (let x = Math.ceil((0 - ox) / k); x * k + ox <= VW; x++) grid += `<line x1="${ox + x * k}" y1="0" x2="${ox + x * k}" y2="${VH}"/>`;
    for (let y = Math.ceil((0 - oy) / k); y * k + oy <= VH; y++) grid += `<line x1="0" y1="${oy + y * k}" x2="${VW}" y2="${oy + y * k}"/>`;
    const [axp, ayp] = P(0, 0), [bxp, byp] = P(ab, 0);
    let g = `<g class="cu-grid">${grid}</g>
      <circle cx="${axp}" cy="${ayp}" r="${ra * k}" fill="${CA}" fill-opacity=".05" stroke="${CA}" stroke-width="3"/>
      <circle cx="${bxp}" cy="${byp}" r="${rb * k}" fill="${CB}" fill-opacity=".05" stroke="${CB}" stroke-width="3"/>`;
    if (tri) {
      const cx = (ab * ab + ra * ra - rb * rb) / (2 * ab), cy = Math.sqrt(Math.max(0, ra * ra - cx * cx));
      const [cxp, cyp] = P(cx, cy);
      // eşit kenarlara aynı sayıda çentik
      const groups = {}; [['AC', ra], ['BC', rb], ['AB', ab]].forEach(([n, v]) => (groups[v] = groups[v] || []).push(n));
      const ticks = {}; let t = 1;
      Object.values(groups).forEach(ns => { if (ns.length > 1) { ns.forEach(n => (ticks[n] = t)); t++; } });
      const side = (x1, y1, x2, y2, color, label, n) => {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        let tk = '';
        for (let i = 0; i < (ticks[n] || 0); i++) {
          const off = (i - ((ticks[n] - 1) / 2)) * 7, px = mx + ux * off, py = my + uy * off;
          tk += `<line x1="${px - uy * 8}" y1="${py + ux * 8}" x2="${px + uy * 8}" y2="${py - ux * 8}" stroke="#2D2440" stroke-width="2.5"/>`;
        }
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>${tk}`;
      };
      const lab = (x1, y1, x2, y2, txt, color, out) => {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
        let nx = -dy / L, ny = dx / L; if ((nx * (mx - (axp + bxp + cxp) / 3) + ny * (my - (ayp + byp + cyp) / 3)) < 0) { nx = -nx; ny = -ny; }
        return `<text x="${mx + nx * out}" y="${my + ny * out + 5}" text-anchor="middle" class="cu-len" fill="${color}">${txt}</text>`;
      };
      g += `<polygon points="${axp},${ayp} ${bxp},${byp} ${cxp},${cyp}" fill="#9EC9F0" fill-opacity=".55"/>
        ${side(axp, ayp, cxp, cyp, CA, 'AC', 'AC')}${side(bxp, byp, cxp, cyp, CB, 'BC', 'BC')}${side(axp, ayp, bxp, byp, CAB, 'AB', 'AB')}
        ${lab(axp, ayp, cxp, cyp, `${ra} cm`, CA, 22)}${lab(bxp, byp, cxp, cyp, `${rb} cm`, CB, 22)}${lab(axp, ayp, bxp, byp, `${ab} cm`, CAB, 20)}
        <circle cx="${cxp}" cy="${cyp}" r="7" fill="#E5484D" stroke="#fff" stroke-width="2"/>
        <text x="${cxp}" y="${cyp - 14}" text-anchor="middle" class="cu-pt">C</text>`;
    } else {
      g += `<line x1="${axp}" y1="${ayp}" x2="${bxp}" y2="${byp}" stroke="${CAB}" stroke-width="3" stroke-dasharray="7 6"/>
        <text x="${(axp + bxp) / 2}" y="${ayp + 24}" text-anchor="middle" class="cu-len" fill="${CAB}">${ab} cm</text>`;
    }
    g += `<circle cx="${axp}" cy="${ayp}" r="6" fill="${CA}"/><text x="${axp - 10}" y="${ayp + 22}" text-anchor="end" class="cu-pt">A</text>
      <circle cx="${bxp}" cy="${byp}" r="6" fill="${CB}"/><text x="${bxp + 10}" y="${byp + 22}" class="cu-pt">B</text>`;
    return g;
  }

  function infoHTML(s) {
    if (!s.tri) return `<div class="cu-none">🚫 <b>C noktası yok!</b> ${s.touch ? 'Çemberler tek noktada değiyor; bu nokta [AB] doğrusu üzerinde olduğu için üçgen oluşmaz.' : 'Çemberler kesişmiyor, bu yüzden <b>üçgen oluşmaz</b>.'}</div>`;
    const eq = (s.ra === s.rb) + (s.ra === s.ab) + (s.rb === s.ab);
    const eqTxt = eq === 3 ? 'Üç kenar da eşit' : eq === 1 ? 'İki kenar eşit' : 'Hiçbir kenar eşit değil';
    return `<div class="cu-info">
      <div style="--c:${CA}"><span>[AC] = A’nın yarıçapı</span><b>${s.ra} cm</b></div>
      <div style="--c:${CB}"><span>[BC] = B’nin yarıçapı</span><b>${s.rb} cm</b></div>
      <div style="--c:${CAB}"><span>[AB] = merkezler arası</span><b>${s.ab} cm</b></div>
    </div>
    <p class="cu-type">${eqTxt} → <b>${TYPES[s.type]}</b></p>`;
  }

  const stepper = (k, label, v, color, locked) => `<div class="cu-step${locked ? ' locked' : ''}" style="--c:${color}">
      <span>${label}</span>
      <button data-k="${k}" data-d="-1" ${locked ? 'disabled' : ''} aria-label="${label} azalt">−</button>
      <b>${v} cm</b>
      <button data-k="${k}" data-d="1" ${locked ? 'disabled' : ''} aria-label="${label} artır">+</button>${locked ? '<i>🔒</i>' : ''}
    </div>`;

  // Ortak tezgâh: çizim + ayarlar
  function bench(root, s0, lock, onChange) {
    const s = { ...s0 };
    function render() {
      const st = state(s.ab, s.ra, s.rb);
      root.querySelector('.cu-board').innerHTML = boardSVG(st);
      root.querySelector('.cu-controls').innerHTML = stepper('ra', 'A’nın yarıçapı', s.ra, CA, lock.includes('ra'))
        + stepper('rb', 'B’nin yarıçapı', s.rb, CB, lock.includes('rb')) + stepper('ab', '[AB] uzunluğu', s.ab, CAB, lock.includes('ab'));
      onChange && onChange(st);
    }
    root.querySelector('.cu-controls').addEventListener('click', e => {
      const b = e.target.closest('button[data-k]'); if (!b) return;
      const k = b.dataset.k; s[k] = Math.max(1, Math.min(9, s[k] + Number(b.dataset.d))); render();
    });
    render();
    return () => state(s.ab, s.ra, s.rb);
  }

  // ---- Keşif ----
  function explore() {
    const rows = [];
    stage.innerHTML = `${NOTE}
      <p class="pg-step"><b>Keşfet:</b> Yarıçapları ve [AB]’yi değiştir. Çemberlerin kesiştiği <b style="color:#E5484D">C</b> noktası üçgenin üçüncü köşesi!</p>
      <div class="cu-wrap"><svg viewBox="0 0 ${VW} ${VH}" class="cu-board" role="img" aria-label="İki çember ve oluşan üçgen"></svg></div>
      <div class="cu-controls"></div>
      <div id="cuInfo" aria-live="polite"></div>
      <div class="ua-tools">
        <button class="btn btn-ghost-dark" id="cuAdd">📋 Tabloya ekle</button>
        <button class="btn btn-yellow" id="cuStart">Görevlere Başla →</button>
      </div>
      <div id="cuTable"></div>`;
    let cur;
    bench(stage, { ab: 6, ra: 6, rb: 6 }, [], st => { cur = st; stage.querySelector('#cuInfo').innerHTML = infoHTML(st); });
    stage.querySelector('#cuAdd').addEventListener('click', () => {
      rows.push(cur);
      stage.querySelector('#cuTable').innerHTML = `<table class="pg-table cu-table"><thead><tr><th>A’nın yarıçapı</th><th>B’nin yarıçapı</th><th>[AB]</th><th>Üçgen</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td>${r.ra}</td><td>${r.rb}</td><td>${r.ab}</td><td>${r.tri ? TYPES[r.type] : 'Oluşmaz'}</td></tr>`).join('')}</tbody></table>`;
    });
    stage.querySelector('#cuStart').addEventListener('click', () => { idx = 0; score = 0; task(); });
  }

  // ---- Görevler ----
  let idx = 0, score = 0;
  function task() {
    const T = TASKS[idx];
    let tries = 0, done = false;
    stage.innerHTML = `${NOTE}
      ${progressBar(idx, TASKS.length)}
      <p class="pg-step"><b>${idx + 1}. görev:</b> ${T.text}</p>
      <div class="cu-wrap"><svg viewBox="0 0 ${VW} ${VH}" class="cu-board" role="img" aria-label="İki çember ve oluşan üçgen"></svg></div>
      <div class="cu-controls"></div>
      <div id="cuInfo" aria-live="polite"></div>
      ${T.quiz ? `<div class="g-options pg-opts cu-opts">${Object.entries(TYPES).map(([k, n], i) => `<button class="g-opt c${i}" data-t="${k}"><b>${'ABC'[i]}</b>${n}</button>`).join('')}</div>`
        : '<div class="aci-actions"><button class="btn btn-yellow" id="cuCheck">✓ Kontrol Et</button></div>'}
      <p class="pg-fb" id="cuFb" aria-live="polite"></p>
      <div class="aci-actions" id="cuActions"></div>`;
    const fb = stage.querySelector('#cuFb'), info = stage.querySelector('#cuInfo');
    const get = bench(stage, T, T.lock, st => { if (!T.quiz || done) info.innerHTML = infoHTML(st); else info.innerHTML = ''; });
    const finish = () => {
      done = true;
      info.innerHTML = infoHTML(get());
      stage.querySelectorAll('.cu-step button').forEach(b => { b.disabled = true; });
      const last = idx + 1 >= TASKS.length;
      stage.querySelector('#cuActions').innerHTML = `<button class="btn btn-yellow" id="cuNext">${last ? 'Bitir 🏁' : 'Sonraki Görev →'}</button>`;
      const n = stage.querySelector('#cuNext'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => { idx++; last ? summary() : task(); });
    };
    if (T.quiz) {
      stage.querySelectorAll('.cu-opts .g-opt').forEach(b => b.addEventListener('click', () => {
        if (done) return;
        const ok = b.dataset.t === T.answer; if (ok) score++;
        stage.querySelectorAll('.cu-opts .g-opt').forEach(x => { x.disabled = true; if (x.dataset.t === T.answer) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        fb.innerHTML = `${ok ? '✓ Doğru!' : '✗ Doğru cevap: çeşitkenar üçgen.'} [AC] = 5 cm (A’nın yarıçapı), [BC] = 3 cm (B’nin yarıçapı), [AB] = 4 cm. Üç kenar da farklı → <b>çeşitkenar</b>.`;
        finish();
      }));
    } else {
      stage.querySelector('#cuCheck').addEventListener('click', () => {
        if (done) return;
        tries++;
        const st = get(), ok = T.ok(st);
        fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
        if (ok) {
          if (tries === 1) score++;
          fb.innerHTML = st.tri ? `✓ Harika! ${TYPES[st.type]} oluşturdun.` : '✓ Harika! Çemberler kesişmediği için C noktası yok, üçgen oluşmadı.';
          stage.querySelector('#cuCheck').disabled = true;
          finish();
        } else fb.innerHTML = `✗ Henüz değil. ${T.hint}`;
      });
    }
  }

  function summary() {
    const pct = score / TASKS.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Çember ustası!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${TASKS.length}</span></div>
        <p class="g-time">İlk denemede doğru</p>
        <p class="pg-rule">Kenarlar: <b style="color:${CA}">A’nın yarıçapı</b>, <b style="color:${CB}">B’nin yarıçapı</b> ve <b style="color:${CAB}">merkezler arası uzaklık</b>.<br>3’ü eşit → eşkenar · 2’si eşit → ikizkenar · hiçbiri eşit değil → çeşitkenar</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="cuAgain">↻ Baştan Başla</button>
          <button class="btn btn-ghost-dark" id="cuExplore">🔍 Keşfe Dön</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#cuAgain').addEventListener('click', () => { idx = 0; score = 0; task(); });
    stage.querySelector('#cuExplore').addEventListener('click', explore);
    if (stars >= 2) confetti();
  }

  explore();
})();
