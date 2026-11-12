/* Eşit Aralık Ustası: eşit aralıklı yerleştirme problemleri (ortak bölen, EBOB, uçlarda var/yok, kapalı şekil) */
(function () {
  initPage();
  const stage = document.getElementById('stage');
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  // ends: 'var' (başta ve sonda var) | 'yok' (başta ve sonda yok) | 'kapali' (kapalı şeklin çevresi, köşelerde var)
  const ROUNDS = [
    { ends: 'yok', unit: 'cm', icon: '🔴', name: 'boncuk', lens: [150, 120], labels: ['1. perde', '2. perde'],
      story: 'Bir tiyatro salonundaki <b>150 cm</b> ve <b>120 cm</b> uzunluğundaki iki fon perdesinin alt kenarına eşit aralıklarla boncuk dikilecek. Boncuklar perdelerin <b>başına ve sonuna gelmeyecek</b>.', ask: 'İki perdeye dikilecek boncuk sayısı <b>en az</b> kaçtır?' },
    { ends: 'var', unit: 'm', icon: '💡', name: 'aydınlatma direği', lens: [200, 140], labels: ['1. yol', '2. yol'],
      story: 'Okul bahçesindeki <b>200 m</b> ve <b>140 m</b> uzunluğundaki iki yürüyüş yolunun bir kenarına eşit aralıklarla aydınlatma direği dikilecek. Yolların <b>başında ve sonunda da</b> birer direk olacak.', ask: 'Toplam direk sayısı <b>en az</b> kaçtır?' },
    { ends: 'var', unit: 'm', icon: '🥣', name: 'mama kabı', lens: [90, 75], labels: ['1. sokak', '2. sokak'],
      story: 'Gönüllüler, <b>90 m</b> ve <b>75 m</b> uzunluğundaki iki sokağın kenarına sokak hayvanları için eşit aralıklarla mama kabı bırakacak. Sokakların <b>başında ve sonunda da</b> kap olacak.', ask: 'Gereken mama kabı sayısı <b>en az</b> kaçtır?' },
    { ends: 'yok', unit: 'm', icon: '🌳', name: 'fidan', lens: [108, 84], labels: ['1. yol', '2. yol'],
      story: 'Belediye <b>108 m</b> ve <b>84 m</b> uzunluğundaki iki yolun kenarına eşit aralıklarla fidan dikecek. Yolların <b>başında ve sonunda</b> kavşak olduğu için fidan <b>dikilmeyecek</b>.', ask: 'Dikilecek fidan sayısı <b>en az</b> kaçtır?' },
    { ends: 'kapali', unit: 'm', icon: '💡', name: 'lamba', lens: [72, 48], labels: ['uzun kenar', 'kısa kenar'], shape: 'rect',
      story: 'Kenar uzunlukları <b>72 m</b> ve <b>48 m</b> olan dikdörtgen biçimli bir parkın çevresine eşit aralıklarla lamba konulacak. <b>Her köşede</b> birer lamba olacak.', ask: 'Gereken lamba sayısı <b>en az</b> kaçtır?' },
    { ends: 'kapali', unit: 'm', icon: '🌳', name: 'fidan', lens: [60, 48, 36], labels: ['1. kenar', '2. kenar', '3. kenar'], shape: 'tri',
      story: 'Kenar uzunlukları <b>36 m</b>, <b>48 m</b> ve <b>60 m</b> olan üçgen biçimli bir bahçenin çevresine eşit aralıklarla fidan dikilecek. <b>Her köşede</b> birer fidan olacak.', ask: 'Dikilecek fidan sayısı <b>en az</b> kaçtır?' },
  ];

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">💡</span>
    <p><b class="k1">Püf noktası:</b> Aralık uzunluğu tüm uzunlukları <mark>tam bölmeli</mark>, yani bir <b class="k2">ortak bölen</b> olmalı. Nesne sayısının <b class="k3">en az</b> olması için aralık <b class="k3">en büyük</b> olmalı: <mark>EBOB</mark>!</p>
  </div>`;
  const RULE = { var: 'Başta ve sonda var → nesne = aralık + 1', yok: 'Başta ve sonda yok → nesne = aralık − 1', kapali: 'Kapalı şekil (köşelerde var) → nesne = aralık sayısı' };

  const sides = R => (R.shape === 'rect' ? [R.lens[0], R.lens[1], R.lens[0], R.lens[1]] : R.lens);
  function count(R, x) {
    if (R.ends === 'kapali') return sides(R).reduce((a, l) => a + l / x, 0);
    return R.lens.reduce((a, l) => a + l / x + (R.ends === 'var' ? 1 : -1), 0);
  }
  const best = R => R.lens.reduce(gcd);
  const divisors = n => Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);

  // ---- Çizim ----
  const VW = 660;
  function lineSVG(R, x) {
    const max = Math.max(...R.lens), k = 540 / max, rowH = 92;
    let g = '';
    R.lens.forEach((L, i) => {
      const y = 40 + i * rowH, x0 = 96, x1 = x0 + L * k, ok = L % x === 0;
      g += `<text x="10" y="${y + 5}" class="ea-lab">${R.labels[i]}</text>
        <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" class="ea-road"/>
        <line x1="${x0}" y1="${y - 10}" x2="${x0}" y2="${y + 10}" class="ea-end"/><line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${y + 10}" class="ea-end"/>
        <text x="${(x0 + x1) / 2}" y="${y + 34}" text-anchor="middle" class="ea-len">${L} ${R.unit}</text>`;
      if (!x) return;
      const marks = []; for (let p = 0; p <= L + 1e-9; p += x) marks.push(p);
      if (marks.length > 70) { g += `<text x="${(x0 + x1) / 2}" y="${y - 18}" text-anchor="middle" class="ea-many">Çok fazla ${R.name}! (${marks.length}+)</text>`; return; }
      // kalan (eşit olmayan son aralık)
      if (!ok) { const last = marks[marks.length - 1]; g += `<line x1="${x0 + last * k}" y1="${y}" x2="${x1}" y2="${y}" class="ea-bad"/><text x="${x0 + (last + L) / 2 * k}" y="${y + 18}" text-anchor="middle" class="ea-badt">${L - last} ${R.unit}</text>`; }
      marks.forEach((p, j) => {
        const isEnd = p === 0 || (ok && p === L);
        if (isEnd && R.ends === 'yok') { g += `<text x="${x0 + p * k}" y="${y - 12}" text-anchor="middle" class="ea-no">✕</text>`; return; }
        g += `<text x="${x0 + p * k}" y="${y - 10}" text-anchor="middle" class="ea-ic">${R.icon}</text>`;
      });
      if (!ok && R.ends === 'var') g += `<text x="${x1}" y="${y - 10}" text-anchor="middle" class="ea-ic ea-dim">${R.icon}</text>`;
    });
    return `<svg viewBox="0 0 ${VW} ${40 + R.lens.length * rowH}" class="ea-board" role="img" aria-label="Yollar ve yerleştirilen nesneler">${g}</svg>`;
  }

  function shapeSVG(R, x) {
    const S = sides(R);
    let pts;
    if (R.shape === 'rect') { const k = Math.min(440 / R.lens[0], 230 / R.lens[1]); const w = R.lens[0] * k, h = R.lens[1] * k, ox = (VW - w) / 2, oy = 40; pts = [[ox, oy], [ox + w, oy], [ox + w, oy + h], [ox, oy + h]]; }
    else { // 36-48-60 dik üçgen: dik kenarlar 48 (yatay) ve 36 (dikey)
      const k = 300 / 60; const ox = (VW - 48 * k) / 2, oy = 30; pts = [[ox, oy + 36 * k], [ox + 48 * k, oy + 36 * k], [ox, oy]]; }
    // kenarlar sırasıyla: rect → üst, sağ, alt, sol ; tri → alt(48), hipotenüs(60), sol(36)
    const order = R.shape === 'rect' ? [0, 1, 2, 3] : [0, 1, 2];
    const len = R.shape === 'rect' ? S : [48, 60, 36];
    let g = `<polygon points="${pts.map(p => p.join(',')).join(' ')}" class="ea-park"/>`;
    order.forEach(i => {
      const A = pts[i], B = pts[(i + 1) % pts.length], L = len[i];
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const dx = mx - cx, dy = my - cy, dl = Math.hypot(dx, dy) || 1;
      g += `<text x="${mx + dx / dl * 30}" y="${my + dy / dl * 30 + 5}" text-anchor="middle" class="ea-len">${L} ${R.unit}</text>`;
      if (!x) return;
      const ok = L % x === 0;
      for (let p = 0; p < L - 1e-9; p += x) {
        const t = p / L, X = A[0] + (B[0] - A[0]) * t, Y = A[1] + (B[1] - A[1]) * t;
        g += `<text x="${X}" y="${Y + 8}" text-anchor="middle" class="ea-ic">${R.icon}</text>`;
      }
      if (!ok) { const last = Math.floor(L / x) * x, t = last / L; g += `<line x1="${A[0] + (B[0] - A[0]) * t}" y1="${A[1] + (B[1] - A[1]) * t}" x2="${B[0]}" y2="${B[1]}" class="ea-bad"/>`; }
    });
    return `<svg viewBox="0 0 ${VW} 330" class="ea-board" role="img" aria-label="Kapalı şeklin çevresi ve yerleştirilen nesneler">${g}</svg>`;
  }

  function checkHTML(R, x) {
    const S = R.ends === 'kapali' ? [...new Set(R.lens)] : R.lens;
    const rows = S.map((L, i) => {
      const ok = L % x === 0, lab = R.ends === 'kapali' ? `${L} ${R.unit}` : `${R.labels[i]} (${L} ${R.unit})`;
      return `<li class="${ok ? 'ok' : 'no'}">${lab}: ${L} ÷ ${x} = ${ok ? `<b>${L / x}</b> aralık ✓` : `${(L / x).toFixed(2).replace('.', ',')} → <b>tam bölünmüyor</b>, son aralık eşit olmaz ✗`}</li>`;
    }).join('');
    const all = S.every(L => L % x === 0);
    let sum = '';
    if (all) {
      const parts = R.ends === 'kapali'
        ? `Çevre ${sides(R).reduce((a, b) => a + b, 0)} ÷ ${x} = <b>${count(R, x)}</b> ${R.name}`
        : R.lens.map(L => `${L / x} ${R.ends === 'var' ? '+' : '−'} 1 = ${L / x + (R.ends === 'var' ? 1 : -1)}`).join(' ve ') + ` → toplam <b>${count(R, x)}</b> ${R.name}`;
      sum = `<p class="ea-sum">${parts}</p>`;
    }
    return `<ul class="ea-check">${rows}</ul>${sum}`;
  }

  let idx = 0, score = 0;
  function round() {
    const R = ROUNDS[idx], ans = count(R, best(R));
    let x = 0, tried = [], quizDone = false;
    // Sık yapılan hatalar: aralık sayısını nesne sayısı sanmak, +1/−1'i ters yapmak, EBOB yerine daha küçük bir ortak bölen almak
    const g = best(R), p = [2, 3, 5, 7].find(q => g % q === 0) || g, iv = R.lens.reduce((a, l) => a + l / g, 0);
    const wrong = R.ends === 'kapali'
      ? [ans + 1, iv, count(R, g / p)]
      : [iv, R.ends === 'var' ? iv - R.lens.length : iv + R.lens.length, count(R, g / p)];
    const opts = [ans, ...[...new Set(wrong)].filter(v => v > 0 && v !== ans)].slice(0, 4);
    for (let k = 2; opts.length < 4; k += 2) if (!opts.includes(ans + k)) opts.push(ans + k);
    opts.splice(0, 4, ...shuffle(opts));
    stage.innerHTML = `${NOTE}
      ${progressBar(idx, ROUNDS.length)}
      <p class="pg-step"><b>${idx + 1}. soru:</b> ${R.story}</p>
      <div class="ea-rule">📏 ${RULE[R.ends]}</div>
      <div id="eaBoard"></div>
      <div class="ea-try">
        <span>Aralığı dene:</span>
        <button class="ea-b" data-d="-1" aria-label="Aralığı azalt">−</button>
        <input type="number" id="eaX" min="1" max="${Math.min(...R.lens)}" inputmode="numeric" placeholder="?" aria-label="Aralık uzunluğu">
        <span>${R.unit}</span>
        <button class="ea-b" data-d="1" aria-label="Aralığı artır">+</button>
        <button class="btn btn-yellow" id="eaGo">Yerleştir</button>
      </div>
      <div id="eaCheck" aria-live="polite"></div>
      <div id="eaTable"></div>
      <div class="ua-tools"><button class="btn btn-ghost-dark" id="eaDiv">🔢 Bölenleri göster</button></div>
      <div id="eaDivs"></div>
      <div class="pg-quiz">
        <p class="pg-q">❓ ${R.ask}</p>
        <div class="g-options pg-opts">${opts.map((v, i) => `<button class="g-opt c${i}" data-v="${v}"><b>${'ABCD'[i]}</b>${v}</button>`).join('')}</div>
        <p class="pg-fb" id="eaFb" aria-live="polite"></p>
      </div>
      <div class="aci-actions" id="eaActions"></div>`;
    const board = stage.querySelector('#eaBoard'), inp = stage.querySelector('#eaX');
    const draw = () => { board.innerHTML = R.ends === 'kapali' ? shapeSVG(R, x) : lineSVG(R, x); };
    function place(v) {
      v = Math.max(1, Math.min(Math.min(...R.lens), Math.round(+v || 0))); if (!v) return;
      x = v; inp.value = v; draw();
      stage.querySelector('#eaCheck').innerHTML = checkHTML(R, x);
      const all = (R.ends === 'kapali' ? R.lens : R.lens).every(L => L % x === 0);
      if (!tried.some(t => t.x === x)) tried.push({ x, ok: all, n: all ? count(R, x) : null });
      tried.sort((a, b) => a.x - b.x);
      stage.querySelector('#eaTable').innerHTML = `<table class="pg-table ea-table"><thead><tr><th>Aralık</th><th>Uyuyor mu?</th><th>${R.name[0].toLocaleUpperCase('tr') + R.name.slice(1)} sayısı</th></tr></thead>
        <tbody>${tried.map(t => `<tr class="${t.ok ? 'ok' : 'no'}"><td>${t.x} ${R.unit}</td><td>${t.ok ? '✓ Ortak bölen' : '✗'}</td><td>${t.ok ? t.n : '—'}</td></tr>`).join('')}</tbody></table>
        ${tried.filter(t => t.ok).length >= 2 ? '<p class="ea-hint">👀 Aralık büyüdükçe nesne sayısı ne oluyor?</p>' : ''}`;
    }
    stage.querySelector('#eaGo').addEventListener('click', () => place(inp.value));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') place(inp.value); });
    stage.querySelectorAll('.ea-b').forEach(b => b.addEventListener('click', () => place((x || 0) + Number(b.dataset.d))));
    stage.querySelector('#eaDiv').addEventListener('click', e => {
      const box = stage.querySelector('#eaDivs');
      if (box.innerHTML) { box.innerHTML = ''; e.currentTarget.textContent = '🔢 Bölenleri göster'; return; }
      e.currentTarget.textContent = '🔢 Bölenleri gizle';
      const uniq = [...new Set(R.lens)], common = divisors(best(R));
      box.innerHTML = `<div class="ea-divs">${uniq.map(L => `<p><b>${L}’in bölenleri:</b> ${divisors(L).map(d => `<span class="${common.includes(d) ? 'c' : ''}">${d}</span>`).join(' ')}</p>`).join('')}
        <p class="ea-com"><b>Ortak bölenler:</b> ${common.map(d => `<span class="c">${d}</span>`).join(' ')} → en büyüğü <b>EBOB = ${best(R)}</b></p></div>`;
    });
    stage.querySelectorAll('.pg-opts .g-opt').forEach(b => b.addEventListener('click', () => {
      if (quizDone) return; quizDone = true;
      const ok = +b.dataset.v === ans; if (ok) score++;
      stage.querySelectorAll('.pg-opts .g-opt').forEach(o => { o.disabled = true; if (+o.dataset.v === ans) o.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      place(best(R));
      const fb = stage.querySelector('#eaFb');
      fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = `${ok ? '✓ Doğru!' : `✗ Doğru cevap ${ans}.`} En az ${R.name} için aralık en büyük ortak bölen olmalı: <b>EBOB(${[...new Set(R.lens)].join(', ')}) = ${best(R)} ${R.unit}</b>. ${RULE[R.ends]}.`;
      const last = idx + 1 >= ROUNDS.length;
      stage.querySelector('#eaActions').innerHTML = `<button class="btn btn-yellow" id="eaNext">${last ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
      const n = stage.querySelector('#eaNext'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => { idx++; last ? summary() : round(); });
    }));
    draw();
  }

  function summary() {
    const pct = score / ROUNDS.length, stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Eşit aralık ustası!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${ROUNDS.length}</span></div>
        <p class="g-time">Doğru cevap</p>
        <p class="pg-rule">1) Aralık = <b>ortak bölen</b> · 2) “En az” → <b>EBOB</b> · 3) Say: uçlarda var <b>+1</b>, uçlarda yok <b>−1</b>, kapalı şekil <b>aralık sayısı kadar</b></p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="eaAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#eaAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    if (stars >= 2) confetti();
  }

  round();
})();
