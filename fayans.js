/* Fayans Döşeme: zemine fayansları kendin yerleştir. EBOB (en büyük kare fayans) ve EKOK (en küçük kare zemin). */
(function () {
  initPage();
  const stage = document.getElementById('stage');
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => a / gcd(a, b) * b;

  // t: 'ebob' → dikdörtgen zemin, kare fayans seç · 'ekok' → dikdörtgen fayans, kare zemin oluştur
  // ask: 'kenar' | 'alan' | 'adet'
  const ROUNDS = [
    { t: 'ebob', W: 180, H: 150, ask: 'kenar', story: 'Bir mutfağın dikdörtgen biçimli zemini <b>180 cm × 150 cm</b>. Zemin, boşluk kalmayacak ve fayans kesilmeyecek şekilde <b>kare biçimli eş fayanslarla</b> kaplanacak.', q: 'Fayansların bir kenarı <b>en fazla</b> kaç cm olabilir?' },
    { t: 'ebob', W: 160, H: 120, ask: 'alan', story: 'Bir banyonun dikdörtgen zemini <b>160 cm × 120 cm</b>. Zemin, boşluk kalmayacak şekilde <b>kare biçimli eş fayanslarla</b> kaplanacak.', q: 'Bir fayansın üst yüzey <b>alanı en fazla</b> kaç cm² olabilir?' },
    { t: 'ebob', W: 120, H: 90, ask: 'adet', story: 'Bir sınıfın okuma köşesindeki <b>120 cm × 90 cm</b> boyutundaki halı alanı, <b>kare biçimli eş minderlerle</b> boşluk kalmadan döşenecek.', q: 'En az <b>kaç minder</b> gerekir?' },
    { t: 'ekok', a: 20, b: 30, ask: 'kenar', story: 'Eni <b>20 cm</b>, boyu <b>30 cm</b> olan dikdörtgen fayanslar <b>aynı yönde</b> yan yana ve alt alta dizilerek <b>kare biçimli</b> bir zemin oluşturulacak.', q: 'Kare zeminin bir kenarı <b>en az</b> kaç cm olur?' },
    { t: 'ekok', a: 12, b: 16, ask: 'adet', story: 'Eni <b>12 cm</b>, boyu <b>16 cm</b> olan dikdörtgen karolar <b>aynı yönde</b> dizilerek <b>kare biçimli</b> bir pano yapılacak.', q: 'Bunun için <b>en az kaç karo</b> gerekir?' },
    { t: 'ekok', a: 15, b: 20, ask: 'alan', story: 'Eni <b>15 cm</b>, boyu <b>20 cm</b> olan dikdörtgen fayanslar <b>aynı yönde</b> dizilerek <b>kare biçimli</b> bir zemin oluşturulacak.', q: 'Kare zeminin <b>alanı en az</b> kaç cm² olur?' },
  ];

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">🧱</span>
    <p><b class="k1">Zemin büyük, fayans küçük</b> → fayans kenarı zemini <mark>tam bölmeli</mark>: <b class="k2">EBOB</b>. <b class="k1">Fayans verili, kare zemin</b> yapılacak → zemin kenarı fayans kenarlarının <mark>ortak katı</mark>: <b class="k3">EKOK</b>.</p>
  </div>`;

  const answer = R => {
    if (R.t === 'ebob') { const s = gcd(R.W, R.H); return R.ask === 'kenar' ? s : R.ask === 'alan' ? s * s : (R.W / s) * (R.H / s); }
    const L = lcm(R.a, R.b); return R.ask === 'kenar' ? L : R.ask === 'alan' ? L * L : (L / R.a) * (L / R.b);
  };
  function options(R) {
    const ans = answer(R), w = [];
    if (R.t === 'ebob') {
      const s = gcd(R.W, R.H), p = [2, 3, 5].find(q => s % q === 0) || 1, s2 = s / p;
      if (R.ask === 'kenar') w.push(s2, s * 2, R.W - R.H);
      if (R.ask === 'alan') w.push(s, s2 * s2, s * 4);              // alan yerine kenar yazmak: en sık hata
      if (R.ask === 'adet') w.push((R.W / s2) * (R.H / s2), R.W / s + R.H / s, (R.W / s) * (R.H / s) * 2);
    } else {
      const L = lcm(R.a, R.b);
      if (R.ask === 'kenar') w.push(R.a * R.b, gcd(R.a, R.b), L * 2);
      if (R.ask === 'adet') w.push(L / R.a + L / R.b, (2 * L / R.a) * (2 * L / R.b), L);
      if (R.ask === 'alan') w.push(L, (R.a * R.b) ** 2 / 100, (2 * L) ** 2);
    }
    const o = [ans, ...[...new Set(w)].filter(v => v > 0 && v !== ans && Number.isInteger(v))].slice(0, 4);
    for (let k = 2; o.length < 4; k++) if (!o.includes(ans * k)) o.push(ans * k);
    return shuffle(o);
  }

  let idx = 0, score = 0;

  function round() {
    const R = ROUNDS[idx];
    stage.innerHTML = `${NOTE}
      ${progressBar(idx, ROUNDS.length)}
      <p class="pg-step"><b>${idx + 1}. soru:</b> ${R.story}</p>
      <div class="fy-type ${R.t}">${R.t === 'ebob' ? '🔍 Fayans kenarı zemini tam bölmeli → <b>EBOB</b> sorusu' : '🔍 Zemin kenarı fayans kenarlarının ortak katı → <b>EKOK</b> sorusu'}</div>
      <div id="fyLab"></div>
      <div class="pg-quiz"><p class="pg-q">❓ ${R.q}</p>
        <div class="g-options pg-opts">${options(R).map((v, i) => `<button class="g-opt c${i}" data-v="${v}"><b>${'ABCD'[i]}</b>${v}${R.ask === 'alan' ? ' cm²' : R.ask === 'kenar' ? ' cm' : ''}</button>`).join('')}</div>
        <p class="pg-fb" id="fyFb" aria-live="polite"></p></div>
      <div class="aci-actions" id="fyActions"></div>`;
    (R.t === 'ebob' ? ebobLab : ekokLab)(R, stage.querySelector('#fyLab'));
    let done = false;
    stage.querySelectorAll('.pg-opts .g-opt').forEach(b => b.addEventListener('click', () => {
      if (done) return; done = true;
      const ans = answer(R), ok = +b.dataset.v === ans; if (ok) score++;
      stage.querySelectorAll('.pg-opts .g-opt').forEach(o => { o.disabled = true; if (+o.dataset.v === ans) o.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      const fb = stage.querySelector('#fyFb'); fb.className = 'pg-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = `${ok ? '✓ Doğru!' : `✗ Doğru cevap ${ans}.`} ${explain(R, +b.dataset.v)}`;
      const last = idx + 1 >= ROUNDS.length;
      stage.querySelector('#fyActions').innerHTML = `<button class="btn btn-yellow" id="fyNext">${last ? 'Bitir 🏁' : 'Sonraki Soru →'}</button>`;
      const n = stage.querySelector('#fyNext'); n.focus({ preventScroll: true });
      n.addEventListener('click', () => { idx++; last ? summary() : round(); });
    }));
  }

  function explain(R, picked) {
    if (R.t === 'ebob') {
      const s = gcd(R.W, R.H);
      const base = `EBOB(${R.W}, ${R.H}) = <b>${s} cm</b> → en büyük kare fayansın kenarı.`;
      if (R.ask === 'kenar') return base;
      if (R.ask === 'alan') return `${base} Alan = ${s} × ${s} = <b>${s * s} cm²</b>.${picked === s ? ' <br>⚠️ Dikkat: ' + s + ' fayansın <b>kenarı</b>, soru <b>alanı</b> soruyor!' : ''}`;
      return `${base} ${R.W} ÷ ${s} = ${R.W / s} sütun, ${R.H} ÷ ${s} = ${R.H / s} sıra → ${R.W / s} × ${R.H / s} = <b>${(R.W / s) * (R.H / s)}</b>.`;
    }
    const L = lcm(R.a, R.b);
    const base = `EKOK(${R.a}, ${R.b}) = <b>${L} cm</b> → en küçük kare zeminin kenarı.`;
    if (R.ask === 'kenar') return base;
    if (R.ask === 'alan') return `${base} Alan = ${L} × ${L} = <b>${L * L} cm²</b>.`;
    return `${base} ${L} ÷ ${R.a} = ${L / R.a} fayans yan yana, ${L} ÷ ${R.b} = ${L / R.b} sıra → ${L / R.a} × ${L / R.b} = <b>${(L / R.a) * (L / R.b)}</b>.`;
  }

  // ---- EBOB laboratuvarı: kare fayansı seç, zemine kendin döşe ----
  function ebobLab(R, box) {
    const G = gcd(R.W, R.H), maxS = Math.min(R.W, R.H);
    const k = Math.min(520 / R.W, 300 / R.H), VW = R.W * k + 70, VH = R.H * k + 60, ox = 40, oy = 16;
    let s = 0, placed = new Set(), tried = [];
    box.innerHTML = `<div class="fy-ctrl">
        <span>Kare fayansın kenarı:</span>
        <button class="ea-b" data-d="-1" aria-label="Küçült">−</button>
        <input type="number" id="fyS" min="1" max="${maxS}" placeholder="?" inputmode="numeric" aria-label="Fayans kenarı">
        <span>cm</span>
        <button class="ea-b" data-d="1" aria-label="Büyüt">+</button>
        <button class="btn btn-yellow" id="fyTake">🧱 Fayansı al</button>
      </div>
      <svg viewBox="0 0 ${VW} ${VH}" class="fy-board" id="fyBoard" role="img" aria-label="Zemin"></svg>
      <div class="fy-acts" id="fyActs" hidden>
        <span class="fy-hint">👆 Zemine dokunarak fayansları tek tek yerleştir</span>
        <button class="btn btn-ghost-dark" id="fyRow">➡️ Bir sıra döşe</button>
        <button class="btn btn-ghost-dark" id="fyAll">⚡ Hepsini döşe</button>
      </div>
      <div id="fyInfo" aria-live="polite"></div>
      <div id="fyTried"></div>`;
    const svg = box.querySelector('#fyBoard'), inp = box.querySelector('#fyS');
    const cols = () => Math.floor(R.W / s), rows = () => Math.floor(R.H / s);
    function draw() {
      let g = `<rect x="${ox}" y="${oy}" width="${R.W * k}" height="${R.H * k}" class="fy-floor"/>`;
      if (s) {
        for (const key of placed) { const [c, r] = key.split(',').map(Number); g += `<rect x="${ox + c * s * k + 1}" y="${oy + r * s * k + 1}" width="${s * k - 2}" height="${s * k - 2}" rx="3" class="fy-tile${(c + r) % 2 ? ' alt' : ''}"/>`; }
        const remW = R.W - cols() * s, remH = R.H - rows() * s;
        if (remW) g += `<rect x="${ox + cols() * s * k}" y="${oy}" width="${remW * k}" height="${R.H * k}" class="fy-gap"/><text x="${ox + (cols() * s + remW / 2) * k}" y="${oy + R.H * k / 2}" class="fy-gapt" text-anchor="middle">${remW} cm</text>`;
        if (remH) g += `<rect x="${ox}" y="${oy + rows() * s * k}" width="${R.W * k}" height="${remH * k}" class="fy-gap"/><text x="${ox + R.W * k / 2}" y="${oy + (rows() * s + remH / 2) * k + 5}" class="fy-gapt" text-anchor="middle">${remH} cm boşluk</text>`;
      }
      g += `<text x="${ox + R.W * k / 2}" y="${oy + R.H * k + 26}" text-anchor="middle" class="fy-dim">${R.W} cm</text>
        <text x="${ox - 10}" y="${oy + R.H * k / 2}" text-anchor="middle" class="fy-dim" transform="rotate(-90 ${ox - 10} ${oy + R.H * k / 2})">${R.H} cm</text>`;
      svg.innerHTML = g;
      info();
    }
    function info() {
      const el = box.querySelector('#fyInfo');
      if (!s) { el.innerHTML = '<p class="fy-msg">Önce bir fayans boyu seç ve “Fayansı al”a bas.</p>'; return; }
      const okW = R.W % s === 0, okH = R.H % s === 0, total = cols() * rows();
      el.innerHTML = `<ul class="ea-check">
          <li class="${okW ? 'ok' : 'no'}">Uzun kenar: ${R.W} ÷ ${s} = ${okW ? `<b>${R.W / s}</b> fayans ✓` : `${(R.W / s).toFixed(2).replace('.', ',')} → <b>boşluk kalıyor</b> ✗`}</li>
          <li class="${okH ? 'ok' : 'no'}">Kısa kenar: ${R.H} ÷ ${s} = ${okH ? `<b>${R.H / s}</b> fayans ✓` : `${(R.H / s).toFixed(2).replace('.', ',')} → <b>boşluk kalıyor</b> ✗`}</li></ul>
        <p class="fy-count">Yerleştirdiğin: <b>${placed.size}</b> / ${total} fayans${placed.size === total && okW && okH ? ' · 🎉 Zemin tamamen kaplandı!' : ''}</p>`;
    }
    function take(v) {
      v = Math.max(1, Math.min(maxS, Math.round(+v || 0))); if (!v) return;
      s = v; inp.value = v; placed = new Set();
      box.querySelector('.ea-b[data-d="1"]').disabled = s >= G;
      box.querySelector('#fyActs').hidden = false;
      const ok = R.W % s === 0 && R.H % s === 0;
      if (!tried.some(t => t.s === s)) tried.push({ s, ok, n: ok ? (R.W / s) * (R.H / s) : null });
      tried.sort((a, b) => a.s - b.s);
      box.querySelector('#fyTried').innerHTML = `<table class="pg-table ea-table"><thead><tr><th>Fayans kenarı</th><th>Uyuyor mu?</th><th>Fayans sayısı</th><th>Bir fayansın alanı</th></tr></thead><tbody>${tried.map(t => `<tr class="${t.ok ? 'ok' : 'no'}"><td>${t.s} cm</td><td>${t.ok ? '✓ Ortak bölen' : '✗'}</td><td>${t.ok ? t.n : '—'}</td><td>${t.ok ? t.s * t.s + ' cm²' : '—'}</td></tr>`).join('')}</tbody></table>
        ${tried.filter(t => t.ok).length >= 2 ? '<p class="ea-hint">👀 Fayans büyüdükçe sayısı ne oluyor?</p>' : ''}`;
      draw();
    }
    const add = (c, r) => { if (c < cols() && r < rows()) placed.add(`${c},${r}`); };
    svg.addEventListener('click', e => {
      if (!s) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      const c = Math.floor((p.x - ox) / (s * k)), r = Math.floor((p.y - oy) / (s * k));
      add(c, r); draw();
    });
    box.querySelector('#fyRow').addEventListener('click', () => { if (!s) return; const r = [...Array(rows()).keys()].find(r => [...Array(cols()).keys()].some(c => !placed.has(`${c},${r}`))); if (r == null) return; for (let c = 0; c < cols(); c++) add(c, r); draw(); });
    box.querySelector('#fyAll').addEventListener('click', () => {
      if (!s) return;
      let r = 0; const step = () => { if (r >= rows()) return; for (let c = 0; c < cols(); c++) add(c, r); r++; draw(); setTimeout(step, 90); }; step();
    });
    box.querySelector('#fyTake').addEventListener('click', () => take(inp.value));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') take(inp.value); });
    box.querySelectorAll('.ea-b').forEach(b => b.addEventListener('click', () => { const d = +b.dataset.d; if (d > 0 && s >= G) return; take((s || 0) + d); }));
    draw();
  }

  // ---- EKOK laboratuvarı: dikdörtgen fayansları dizerek kare zemin oluştur ----
  function ekokLab(R, box) {
    const L = lcm(R.a, R.b), MAXC = Math.ceil(2 * L / R.a), MAXR = Math.ceil(2 * L / R.b);
    let c = 1, r = 1, found = [];
    box.innerHTML = `<div class="fy-ctrl">
        <span>Yan yana:</span><button class="ea-b" data-k="c" data-d="-1" aria-label="Sütun azalt">−</button><b id="fyC">1</b><button class="ea-b" data-k="c" data-d="1" aria-label="Sütun ekle">+</button>
        <span class="fy-sep"></span>
        <span>Alt alta:</span><button class="ea-b" data-k="r" data-d="-1" aria-label="Sıra azalt">−</button><b id="fyR">1</b><button class="ea-b" data-k="r" data-d="1" aria-label="Sıra ekle">+</button>
      </div>
      <div class="fy-wrap"><svg class="fy-board" id="fyBoard" role="img" aria-label="Fayanslardan oluşan zemin"></svg></div>
      <div id="fyInfo" aria-live="polite"></div>
      <div id="fyTried"></div>`;
    const svg = box.querySelector('#fyBoard');
    const maxW = MAXC * R.a, maxH = MAXR * R.b, k = Math.min(440 / maxW, 300 / maxH), ox = 46, oy = 14;
    svg.setAttribute('viewBox', `0 0 ${maxW * k + 70} ${maxH * k + 50}`);
    function draw() {
      const w = c * R.a, h = r * R.b, sq = w === h;
      let g = `<rect x="${ox}" y="${oy}" width="${maxW * k}" height="${maxH * k}" class="fy-floor ghost"/>`;
      for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) g += `<rect x="${ox + i * R.a * k + 1}" y="${oy + j * R.b * k + 1}" width="${R.a * k - 2}" height="${R.b * k - 2}" rx="2" class="fy-tile${(i + j) % 2 ? ' alt' : ''}"/>`;
      g += `<rect x="${ox}" y="${oy}" width="${w * k}" height="${h * k}" class="fy-outline${sq ? ' sq' : ''}"/>
        <text x="${ox + w * k / 2}" y="${oy + h * k + 22}" text-anchor="middle" class="fy-dim">${w} cm</text>
        <text x="${ox - 10}" y="${oy + h * k / 2}" text-anchor="middle" class="fy-dim" transform="rotate(-90 ${ox - 10} ${oy + h * k / 2})">${h} cm</text>`;
      svg.innerHTML = g;
      box.querySelector('#fyC').textContent = c; box.querySelector('#fyR').textContent = r;
      box.querySelector('#fyInfo').innerHTML = sq
        ? `<p class="fy-msg ok">✓ <b>Kare oldu!</b> ${c} × ${R.a} = ${r} × ${R.b} = <b>${w} cm</b> · ${c * r} fayans</p>`
        : `<p class="fy-msg">Genişlik ${c} × ${R.a} = <b>${w} cm</b>, yükseklik ${r} × ${R.b} = <b>${h} cm</b> → ${w > h ? 'alt alta ekle' : 'yan yana ekle'} 🔄</p>`;
      if (sq && !found.some(f => f.w === w)) { found.push({ w, n: c * r }); found.sort((x, y) => x.w - y.w); }
      box.querySelector('#fyTried').innerHTML = found.length ? `<table class="pg-table ea-table"><thead><tr><th>Bulduğun kare</th><th>Fayans sayısı</th><th>Alan</th></tr></thead><tbody>${found.map(f => `<tr class="ok"><td>${f.w} cm × ${f.w} cm</td><td>${f.n}</td><td>${f.w * f.w} cm²</td></tr>`).join('')}</tbody></table>
        <p class="ea-hint">Kenar uzunlukları: ${found.map(f => f.w).join(', ')} → hepsi ${R.a} ve ${R.b}’nin ortak katı!</p>` : '';
    }
    box.querySelectorAll('.ea-b').forEach(b => b.addEventListener('click', () => {
      const d = +b.dataset.d;
      if (b.dataset.k === 'c') c = Math.max(1, Math.min(MAXC, c + d)); else r = Math.max(1, Math.min(MAXR, r + d));
      draw();
    }));
    draw();
  }

  function summary() {
    const pct = score / ROUNDS.length, stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>Zemin tamam!</h2>
        <div class="g-score"><b>${score}</b><span>/ ${ROUNDS.length}</span></div>
        <p class="g-time">Doğru cevap</p>
        <p class="pg-rule"><b>Büyük zemini</b> en büyük kare fayansla kapla → <b>EBOB</b> · <b>Küçük fayanslarla</b> en küçük kare zemin yap → <b>EKOK</b><br>Soru <b>alan</b> istiyorsa kenarın karesini almayı unutma!</p>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="fyAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#fyAgain').addEventListener('click', () => { idx = 0; score = 0; round(); });
    if (stars >= 2) confetti();
  }

  round();
})();
