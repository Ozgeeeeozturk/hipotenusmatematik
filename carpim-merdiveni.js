/* Çarpım Merdiveni: 10 seviye zihinden çarpma. Her seviye 5 soru × 2 puan = 10 puan, toplam 100 puan. */
(function () {
  initPage();
  const stage = document.getElementById('stage');

  // Seviye 1–7: çarpım tablosu, kolaydan zora. Seviye 8–10: iki basamaklı × bir basamaklı (öğretmenin listesi).
  const LEVELS = [
    [[2, 5], [4, 3], [7, 2], [6, 3], [8, 2]],
    [[3, 8], [4, 6], [5, 4], [7, 3], [9, 2]],
    [[8, 2], [6, 4], [7, 5], [8, 4], [3, 9]],
    [[6, 6], [7, 4], [9, 4], [8, 5], [6, 7]],
    [[7, 6], [8, 6], [9, 5], [6, 8], [9, 6]],
    [[7, 7], [8, 7], [6, 9], [9, 7], [8, 8]],
    [[7, 8], [8, 9], [9, 9], [9, 8], [7, 9]],
    [[12, 3], [15, 4], [16, 5], [18, 5], [14, 2]],
    [[16, 3], [14, 5], [15, 6], [15, 8], [24, 3]],
    [[14, 5], [13, 7], [13, 5], [16, 4], [18, 4]],
  ];
  const PER = 2; // her doğru 2 puan → 50 soru = 100 puan
  const COLORS = ['#9EE6C9', '#B9E89E', '#FFE08A', '#FFC98A', '#FFAA8A', '#F7A8C4', '#D9B6F2', '#C9B6F2', '#A9B8F2', '#8FD3F4'];
  const BEST = 'hip_carpim_best';

  const NOTE = `<div class="pg-def">
    <span class="pg-def-ic" aria-hidden="true">🪜</span>
    <p>Merdiveni basamak basamak çık! Her seviyede <b class="k2">5 çarpma</b> var, her doğru cevap <mark>2 puan</mark>. 10 seviyenin hepsini doğru yaparsan <b class="k3">100 puan</b>!</p>
  </div>`;

  let level = 0, q = 0, score = 0, levelScores = [], input = '', locked = false;

  // İki basamaklı sayılarda çözüm yolu: 15 × 6 = 10 × 6 + 5 × 6 = 60 + 30 = 90
  function how(a, b) {
    if (a < 10) return `${a} × ${b} = ${a * b}`;
    const t = a - (a % 10), o = a % 10;
    return o ? `${a} × ${b} = ${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b} = ${a * b}` : `${a} × ${b} = ${a * b}`;
  }

  function ladder() {
    return `<div class="cm-ladder" aria-label="Seviyeler">${LEVELS.map((_, i) => {
      const st = i < level ? 'done' : i === level ? 'on' : '';
      const sc = levelScores[i];
      return `<div class="cm-step ${st}" style="--c:${COLORS[i]}"><b>${i + 1}</b>${sc != null ? `<small>${sc}</small>` : ''}</div>`;
    }).join('')}</div>`;
  }

  function screen() {
    const [a, b] = LEVELS[level][q];
    input = ''; locked = false;
    stage.innerHTML = `${NOTE}
      <div class="cm-top"><span class="cm-lv" style="--c:${COLORS[level]}">Seviye ${level + 1}</span><span class="cm-sc">⭐ ${score} / 100</span></div>
      ${ladder()}
      <div class="cm-dots">${LEVELS[level].map((_, i) => `<i class="${i < q ? 'past' : i === q ? 'now' : ''}" id="cmDot${i}"></i>`).join('')}</div>
      <div class="cm-card" style="--c:${COLORS[level]}">
        <div class="cm-q"><span>${a}</span><span class="x">×</span><span>${b}</span><span class="x">=</span><span class="cm-ans" id="cmAns">?</span></div>
        <p class="cm-fb" id="cmFb" aria-live="polite"></p>
      </div>
      <div class="cm-pad" id="cmPad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="del" class="del" aria-label="Sil">⌫</button><button data-k="0">0</button><button data-k="ok" class="ok">✓</button>
      </div>`;
    stage.querySelector('#cmPad').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) key(b.dataset.k); });
  }

  function show() { const el = stage.querySelector('#cmAns'); el.textContent = input || '?'; el.classList.toggle('empty', !input); }

  function key(k) {
    if (locked) return;
    if (k === 'del') input = input.slice(0, -1);
    else if (k === 'ok') return check();
    else if (input.length < 3) input += k;
    show();
  }

  function check() {
    if (!input) return;
    locked = true;
    const [a, b] = LEVELS[level][q], ok = Number(input) === a * b;
    if (ok) { score += PER; levelScores[level] = (levelScores[level] || 0) + PER; } else levelScores[level] = levelScores[level] || 0;
    const fb = stage.querySelector('#cmFb'), ans = stage.querySelector('#cmAns');
    ans.classList.add(ok ? 'ok' : 'no');
    stage.querySelector(`#cmDot${q}`).className = ok ? 'right' : 'wrong';
    fb.className = 'cm-fb ' + (ok ? 'ok' : 'no');
    fb.innerHTML = ok ? `✓ Doğru! +${PER} puan` : `✗ Doğrusu: <b>${how(a, b)}</b>`;
    stage.querySelector('.cm-sc').textContent = `⭐ ${score} / 100`;
    setTimeout(next, ok ? 750 : 2400);
  }

  function next() {
    q++;
    if (q < LEVELS[level].length) return screen();
    levelEnd();
  }

  function levelEnd() {
    const got = levelScores[level] || 0, full = got === LEVELS[level].length * PER, last = level + 1 >= LEVELS.length;
    stage.innerHTML = `${NOTE}
      ${ladder()}
      <div class="g-result cm-lvend">
        <h2>${full ? '🎉 Kusursuz!' : '👏 Seviye tamam!'} Seviye ${level + 1}</h2>
        <div class="g-score"><b>${got}</b><span>/ ${LEVELS[level].length * PER} puan</span></div>
        <p class="g-time">Toplam: <b>${score} / 100</b></p>
        ${level + 1 === 7 ? '<p class="cm-tip">💡 Sıradaki seviyelerde iki basamaklı sayılar var. İpucu: <b>15 × 6 = 10 × 6 + 5 × 6</b></p>' : ''}
        <div class="btns g-result-btns"><button class="btn btn-yellow" id="cmGo">${last ? 'Sonucu Gör 🏁' : `Seviye ${level + 2} →`}</button></div>
      </div>`;
    const go = stage.querySelector('#cmGo'); go.focus({ preventScroll: true });
    go.addEventListener('click', () => { if (last) return finish(); level++; q = 0; screen(); });
    if (full) confetti();
  }

  function finish() {
    const best = Math.max(score, store.get(BEST, 0)); store.set(BEST, best);
    const stars = score === 100 ? 3 : score >= 70 ? 2 : score > 0 ? 1 : 0;
    stage.innerHTML = `${NOTE}
      <div class="g-result">
        <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <h2>${score === 100 ? '🏆 Merdivenin zirvesindesin!' : 'Merdiveni tamamladın!'}</h2>
        <div class="g-score"><b>${score}</b><span>/ 100</span></div>
        <p class="g-time">En yüksek puanın: <b>${best}</b></p>
        <table class="pg-table cm-table"><thead><tr><th>Seviye</th><th>Puan</th></tr></thead>
          <tbody>${LEVELS.map((_, i) => `<tr><td><i style="background:${COLORS[i]}"></i>${i + 1}</td><td>${levelScores[i] || 0} / 10</td></tr>`).join('')}</tbody></table>
        <div class="btns g-result-btns">
          <button class="btn btn-yellow" id="cmAgain">↻ Baştan Başla</button>
          <a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>
        </div>
      </div>`;
    stage.querySelector('#cmAgain').addEventListener('click', start);
    if (stars >= 2) confetti();
  }

  function start() { level = 0; q = 0; score = 0; levelScores = []; screen(); }

  // Klavye desteği
  document.addEventListener('keydown', e => {
    if (!stage.querySelector('#cmPad')) return;
    if (/^[0-9]$/.test(e.key)) key(e.key);
    else if (e.key === 'Backspace') key('del');
    else if (e.key === 'Enter') { e.preventDefault(); key('ok'); }
  });

  start();
})();
