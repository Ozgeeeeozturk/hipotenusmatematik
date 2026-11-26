/* Prizmaları Tanıyalım: küp, kare prizma, dikdörtgenler prizması, üçgen prizma
   Keşfet (yüz-ayrıt-köşe), Görünümler (önden-sağdan-üstten), Açınım (katla-aç), Sınav.
   Tek model: her cisim bir açınımdır; katlanınca cisim oluşur, görünümler ve sayılar bu modelden hesaplanır. */
(function () {
  initPage();
  const stage = document.getElementById('stage');
  const RENK = ['#9EE6C9', '#C8A2E8', '#FFD84D', '#8FD3F4', '#FDBA74', '#F7A8C4'];

  // ---------- Açınımlar (düz koordinatlar), katlama ağacı ----------
  const kutu = (a, b, c) => ([
    { ad: 'Alt', pts: [[0, 0], [a, 0], [a, b], [0, b]], ust: -1 },
    { ad: 'Ön', pts: [[0, -c], [a, -c], [a, 0], [0, 0]], ust: 0, mn: [[0, 0], [a, 0]], aci: 90 },
    { ad: 'Arka', pts: [[0, b], [a, b], [a, b + c], [0, b + c]], ust: 0, mn: [[0, b], [a, b]], aci: 90 },
    { ad: 'Sol', pts: [[-c, 0], [0, 0], [0, b], [-c, b]], ust: 0, mn: [[0, 0], [0, b]], aci: 90 },
    { ad: 'Sağ', pts: [[a, 0], [a + c, 0], [a + c, b], [a, b]], ust: 0, mn: [[a, 0], [a, b]], aci: 90 },
    { ad: 'Üst', pts: [[0, b + c], [a, b + c], [a, 2 * b + c], [0, 2 * b + c]], ust: 2, mn: [[0, b + c], [a, b + c]], aci: 90 },
  ]);
  const ucgen = (s, L) => {
    const h = s * Math.sqrt(3) / 2;
    return [
      { ad: 'Alt yan yüz', pts: [[0, 0], [L, 0], [L, s], [0, s]], ust: -1 },
      { ad: 'Yan yüz', pts: [[0, s], [L, s], [L, 2 * s], [0, 2 * s]], ust: 0, mn: [[0, s], [L, s]], aci: 120 },
      { ad: 'Yan yüz', pts: [[0, -s], [L, -s], [L, 0], [0, 0]], ust: 0, mn: [[0, 0], [L, 0]], aci: 120 },
      { ad: 'Üçgen taban', pts: [[0, 0], [0, s], [-h, s / 2]], ust: 0, mn: [[0, 0], [0, s]], aci: 90 },
      { ad: 'Üçgen taban', pts: [[L, 0], [L + h, s / 2], [L, s]], ust: 0, mn: [[L, 0], [L, s]], aci: 90 },
    ];
  };
  const CISIM = {
    kup: { ad: 'Küp', ik: '🧊', net: kutu(2.2, 2.2, 2.2),
      tur: '6 eş kare', not: 'Küpün bütün yüzleri <b>eş karedir</b>, bütün ayrıtları eşittir. Küp, ayrıtları eşit olan özel bir kare prizmadır.' },
    kare: { ad: 'Kare Prizma', ik: '🟪', net: kutu(2, 2, 3.4),
      tur: '2 kare (tabanlar) + 4 eş dikdörtgen', not: 'Kare prizmanın <b>alt ve üst tabanı karedir</b>; yan yüzleri dört eş dikdörtgendir.' },
    dikd: { ad: 'Dikdörtgenler Prizması', ik: '📦', net: kutu(3.4, 2, 1.8),
      tur: '6 dikdörtgen (karşılıklı yüzler eş)', not: 'Dikdörtgenler prizmasının <b>karşılıklı yüzleri eştir</b>; 3 çift eş dikdörtgenden oluşur.' },
    ucgen: { ad: 'Üçgen Prizma', ik: '🔺', net: ucgen(2.4, 3.4),
      tur: '2 üçgen (tabanlar) + 3 dikdörtgen', not: 'Üçgen prizmanın <b>iki tabanı eş üçgendir</b>; yan yüzleri üç dikdörtgendir.' },
  };

  // ---------- 3B hesap ----------
  const kesir = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  function dondur(u, th) { // eksen u (birim) etrafında 3x3
    const [x, y, z] = u, c = Math.cos(th), s = Math.sin(th), t = 1 - c;
    return [[t * x * x + c, t * x * y - s * z, t * x * z + s * y], [t * x * y + s * z, t * y * y + c, t * y * z - s * x], [t * x * z - s * y, t * y * z + s * x, t * z * z + c]];
  }
  const uygula = (M, p) => [M.R[0][0] * p[0] + M.R[0][1] * p[1] + M.R[0][2] * p[2] + M.t[0], M.R[1][0] * p[0] + M.R[1][1] * p[1] + M.R[1][2] * p[2] + M.t[1], M.R[2][0] * p[0] + M.R[2][1] * p[1] + M.R[2][2] * p[2] + M.t[2]];
  const birles = (A, B) => ({ R: A.R.map((r, i) => [0, 1, 2].map(j => r[0] * B.R[0][j] + r[1] * B.R[1][j] + r[2] * B.R[2][j])), t: uygula(A, B.t) });
  const BIRIM = { R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0] };
  // t: 0 açık, 1 kapalı → her yüzün 3B köşeleri
  function katla(net, t) {
    const M = [];
    net.forEach((f, i) => {
      if (f.ust < 0) { M[i] = BIRIM; return; }
      const [p, q] = f.mn, ux = q[0] - p[0], uy = q[1] - p[1], L = Math.hypot(ux, uy);
      let u = [ux / L, uy / L, 0];
      const cx = f.pts.reduce((s, a) => s + a[0], 0) / f.pts.length - p[0], cy = f.pts.reduce((s, a) => s + a[1], 0) / f.pts.length - p[1];
      if (u[0] * cy - u[1] * cx < 0) u = u.map(v => -v); // yukarı katlansın
      const R = dondur(u, f.aci * Math.PI / 180 * t), P = [p[0], p[1], 0];
      const Mr = { R, t: [P[0] - (R[0][0] * P[0] + R[0][1] * P[1]), P[1] - (R[1][0] * P[0] + R[1][1] * P[1]), P[2] - (R[2][0] * P[0] + R[2][1] * P[1])] };
      M[i] = birles(M[f.ust], Mr);
    });
    return net.map((f, i) => f.pts.map(p => uygula(M[i], [p[0], p[1], 0])));
  }
  // Kapalı cisimden köşe ve ayrıt listesi
  function elemanlar(cisim) {
    const yuz = katla(cisim.net, 1), anah = p => p.map(v => Math.round(v * 1000)).join(',');
    const kose = new Map(), ayrit = new Map();
    yuz.forEach(f => f.forEach((p, i) => {
      kose.set(anah(p), p);
      const q = f[(i + 1) % f.length], k = [anah(p), anah(q)].sort().join('|');
      if (!ayrit.has(k)) ayrit.set(k, [p, q]);
    }));
    return { yuz, kose: [...kose.values()], ayrit: [...ayrit.values()] };
  }
  Object.values(CISIM).forEach(c => { c.el = elemanlar(c); });

  // ---------- Çizim ----------
  function kamera(nok, yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = nok[0] * cy - nok[1] * sy, y1 = nok[0] * sy + nok[1] * cy, z = nok[2];
    return { x: x1, y: -(y1 * sp + z * cp), d: y1 * cp - z * sp };
  }
  function tuval(cv) {
    const r = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, w, h);
    return { g, w, h };
  }
  const ac = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.round(Math.min(255, Math.max(0, c * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

  // 3B sahne: yüzleri ressam algoritmasıyla çizer; vurgu: { tur, n }
  function ciz3B(cv, cisim, t, yaw, pitch, vurgu, olcekSabit) {
    const { g, w, h } = tuval(cv);
    const yuz = katla(cisim.net, t);
    // merkez ve ölçek: kapalı ve açık hâlin birleşik sınırları (açılırken zıplamasın)
    if (!cisim._kutu) {
      const hepsi = [...katla(cisim.net, 1).flat(), ...katla(cisim.net, 0).flat()];
      const mn = [0, 1, 2].map(i => Math.min(...hepsi.map(p => p[i]))), mx = [0, 1, 2].map(i => Math.max(...hepsi.map(p => p[i])));
      const kapali = katla(cisim.net, 1).flat();
      cisim._mer = [0, 1, 2].map(i => (Math.min(...kapali.map(p => p[i])) + Math.max(...kapali.map(p => p[i]))) / 2);
      cisim._kutu = Math.max(...[0, 1, 2].map(i => mx[i] - mn[i]));
      cisim._kapaliKutu = Math.max(...[0, 1, 2].map(i => Math.max(...kapali.map(p => p[i])) - Math.min(...kapali.map(p => p[i]))));
    }
    const olc = Math.min(w, h) / ((olcekSabit ? cisim._kutu : cisim._kapaliKutu * 1.75)) * .95;
    const mer = cisim._mer.map((v, i) => i === 2 ? v * t : v);
    const P = p => { const c = kamera([p[0] - mer[0], p[1] - mer[1], p[2] - mer[2]], yaw, pitch); return { x: w / 2 + c.x * olc, y: h / 2 + c.y * olc, d: c.d }; };
    const isik = [-.35, -.55, .76];
    const liste = yuz.map((f, i) => {
      const a = f[0], b = f[1], c = f[2];
      let n = kesir([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]); const L = Math.hypot(...n) || 1; n = n.map(v => v / L);
      const parlak = .78 + .28 * Math.abs(n[0] * isik[0] + n[1] * isik[1] + n[2] * isik[2]);
      const pp = f.map(P);
      return { i, pp, d: pp.reduce((s, q) => s + q.d, 0) / pp.length, parlak };
    }).sort((A, B) => B.d - A.d);
    const yuzVurgu = vurgu && vurgu.tur === 'yuz';
    liste.forEach(F => {
      g.beginPath(); F.pp.forEach((q, k) => k ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.closePath();
      const sec = yuzVurgu && F.i < vurgu.n;
      g.fillStyle = ac(RENK[F.i % RENK.length], F.parlak) ; g.globalAlpha = yuzVurgu && !sec ? .35 : .93; g.fill(); g.globalAlpha = 1;
      g.lineWidth = 2; g.strokeStyle = '#2D2440'; g.lineJoin = 'round'; g.stroke();
      if (sec) {
        const cx = F.pp.reduce((s, q) => s + q.x, 0) / F.pp.length, cyy = F.pp.reduce((s, q) => s + q.y, 0) / F.pp.length;
        g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cyy, 13, 0, 7); g.fill(); g.strokeStyle = '#7B4FA8'; g.lineWidth = 2.5; g.stroke();
        g.fillStyle = '#2D2440'; g.font = "800 14px Nunito"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(F.i + 1, cx, cyy + 1);
      }
    });
    if (vurgu && vurgu.tur === 'ayrit') cisim.el.ayrit.slice(0, vurgu.n).forEach(([p, q], k) => {
      const A = P(p), B = P(q);
      g.strokeStyle = '#E8434F'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      g.fillStyle = '#E8434F'; g.beginPath(); g.arc(mx, my, 10, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = "800 11px Nunito"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k + 1, mx, my + 1);
    });
    if (vurgu && vurgu.tur === 'kose') cisim.el.kose.slice(0, vurgu.n).forEach((p, k) => {
      const A = P(p);
      g.fillStyle = '#2E9E78'; g.beginPath(); g.arc(A.x, A.y, 11, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#fff'; g.font = "800 11px Nunito"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k + 1, A.x, A.y + 1);
    });
  }

  // 2B görünüm: kapalı cismin ayrıtlarını bir düzleme izdüşür
  const GORUS = {
    on: { ad: 'Önden', yaw: 0, pitch: 0, eks: p => [p[0], p[2]] },
    sag: { ad: 'Sağdan', yaw: -Math.PI / 2, pitch: 0, eks: p => [p[1], p[2]] },
    ust: { ad: 'Üstten', yaw: 0, pitch: Math.PI / 2, eks: p => [p[0], p[1]] },
  };
  function gorunumCizgileri(cisim, yon) {
    const f = GORUS[yon].eks, kume = new Map();
    cisim.el.ayrit.forEach(([p, q]) => {
      const A = f(p).map(v => Math.round(v * 1000) / 1000), B = f(q).map(v => Math.round(v * 1000) / 1000);
      if (Math.hypot(A[0] - B[0], A[1] - B[1]) < 1e-3) return;
      const k = [A.join(','), B.join(',')].sort().join('|'); kume.set(k, [A, B]);
    });
    return [...kume.values()];
  }
  function ciz2B(cv, cisim, yon, olcBirim, renk) {
    const { g, w, h } = tuval(cv), ciz = gorunumCizgileri(cisim, yon);
    const xs = ciz.flat().map(p => p[0]), ys = ciz.flat().map(p => p[1]);
    const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const olc = olcBirim || Math.min((w - 30) / (mxx - mnx), (h - 30) / (mxy - mny));
    const ox = w / 2 - (mnx + mxx) / 2 * olc, oy = h / 2 + (mny + mxy) / 2 * olc;
    // kareli zemin
    g.strokeStyle = 'rgba(123,79,168,.12)'; g.lineWidth = 1;
    for (let x = ox % (olc / 2); x < w; x += olc / 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = oy % (olc / 2); y < h; y += olc / 2) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // dolgu: çizgilerin dış sınırı (dışbükey zarf)
    const nk = [...new Map(ciz.flat().map(p => [p.join(','), p])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const alt = [], ust = [];
    nk.forEach(p => { while (alt.length > 1 && cr(alt[alt.length - 2], alt[alt.length - 1], p) <= 0) alt.pop(); alt.push(p); });
    [...nk].reverse().forEach(p => { while (ust.length > 1 && cr(ust[ust.length - 2], ust[ust.length - 1], p) <= 0) ust.pop(); ust.push(p); });
    const zarf = alt.slice(0, -1).concat(ust.slice(0, -1));
    g.beginPath(); zarf.forEach((p, i) => { const X = ox + p[0] * olc, Y = oy - p[1] * olc; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath();
    g.fillStyle = renk || '#E3F8EF'; g.fill();
    g.strokeStyle = '#2D2440'; g.lineWidth = 2.5; g.lineCap = 'round';
    ciz.forEach(([A, B]) => { g.beginPath(); g.moveTo(ox + A[0] * olc, oy - A[1] * olc); g.lineTo(ox + B[0] * olc, oy - B[1] * olc); g.stroke(); });
  }
  // Açınım çizimi (düz, üstten)
  function cizNet(cv, cisim) {
    const { g, w, h } = tuval(cv), net = cisim.net;
    const xs = net.flatMap(f => f.pts.map(p => p[0])), ys = net.flatMap(f => f.pts.map(p => p[1]));
    const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const olc = Math.min((w - 20) / (mxx - mnx), (h - 20) / (mxy - mny));
    const ox = w / 2 - (mnx + mxx) / 2 * olc, oy = h / 2 + (mny + mxy) / 2 * olc;
    net.forEach((f, i) => {
      g.beginPath(); f.pts.forEach((p, k) => { const X = ox + p[0] * olc, Y = oy - p[1] * olc; k ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath();
      g.fillStyle = RENK[i % RENK.length]; g.fill(); g.strokeStyle = '#2D2440'; g.lineWidth = 2; g.stroke();
    });
  }

  // ---------- Arayüz ----------
  const S = { sekme: 'kesfet', cisim: 'kup', yaw: -0.62, pitch: 0.42, t: 1, vurgu: null };
  stage.innerHTML = `
    <div class="pg-def">
      <span class="pg-def-ic" aria-hidden="true">🧊</span>
      <p><b class="k1">Prizma</b>, iki <mark>eş ve paralel tabanı</mark> olan, yan yüzleri <b class="k2">dikdörtgen</b> olan cisimdir. Adını <b class="k3">tabanının şeklinden</b> alır.</p>
    </div>
    <div class="pz-sekmeler" role="tablist">
      <button class="pz-sekme on" data-s="kesfet">🔍 Keşfet</button>
      <button class="pz-sekme" data-s="gorunum">👀 Görünümler</button>
      <button class="pz-sekme" data-s="acinim">📄 Açınım</button>
      <button class="pz-sekme" data-s="sinav">✏️ Sınav</button>
    </div>
    <div class="pz-cisimler" id="pzCisimler">${Object.entries(CISIM).map(([id, c]) => `<button class="pz-cisim${id === S.cisim ? ' on' : ''}" data-c="${id}"><span>${c.ik}</span>${c.ad}</button>`).join('')}</div>
    <div id="pzIcerik"></div>`;
  const icerik = stage.querySelector('#pzIcerik');
  let zaman = null, anim = null;
  const durdur = () => { clearInterval(zaman); cancelAnimationFrame(anim); };

  function surukle(cv, ciz) {
    let s = null;
    cv.addEventListener('pointerdown', e => { s = { x: e.clientX, y: e.clientY, yaw: S.yaw, pitch: S.pitch }; try { cv.setPointerCapture(e.pointerId); } catch {} cv.classList.add('tut'); });
    cv.addEventListener('pointermove', e => { if (!s) return; S.yaw = s.yaw - (e.clientX - s.x) * .01; S.pitch = Math.max(-.2, Math.min(1.55, s.pitch + (e.clientY - s.y) * .01)); ciz(); });
    const bitir = () => { s = null; cv.classList.remove('tut'); };
    cv.addEventListener('pointerup', bitir); cv.addEventListener('pointercancel', bitir);
  }
  function yumusakBak(yaw, pitch, ciz) {
    cancelAnimationFrame(anim);
    const y0 = S.yaw, p0 = S.pitch, t0 = performance.now();
    let dy = ((yaw - y0) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    const adim = now => { const k = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - k, 3); S.yaw = y0 + dy * e; S.pitch = p0 + (pitch - p0) * e; ciz(); if (k < 1) anim = requestAnimationFrame(adim); };
    anim = requestAnimationFrame(adim);
  }

  // --- Keşfet ---
  function kesfet() {
    const c = CISIM[S.cisim], el = c.el;
    icerik.innerHTML = `
      <div class="pz-sahne"><canvas id="pz3" aria-label="${c.ad}: sürükleyerek döndür"></canvas><span class="pz-ipucu">👆 Sürükle ve döndür</span></div>
      <div class="pz-sayilar">
        <button class="pz-say" data-v="yuz"><b>${el.yuz.length}</b><span>yüz</span><small>Göster</small></button>
        <button class="pz-say" data-v="ayrit"><b>${el.ayrit.length}</b><span>ayrıt</span><small>Göster</small></button>
        <button class="pz-say" data-v="kose"><b>${el.kose.length}</b><span>köşe</span><small>Göster</small></button>
      </div>
      <p class="pz-not"><b>${c.ad}:</b> ${c.not}<br><span class="pz-tur">Yüzler: ${c.tur}</span></p>
      <p class="pz-sayac" id="pzSayac" aria-live="polite">Bir düğmeye bas, yüzleri, ayrıtları ya da köşeleri birlikte sayalım.</p>`;
    const cv = icerik.querySelector('#pz3');
    const ciz = () => ciz3B(cv, c, 1, S.yaw, S.pitch, S.vurgu);
    surukle(cv, ciz);
    const AD = { yuz: 'yüz', ayrit: 'ayrıt', kose: 'köşe' };
    icerik.querySelectorAll('.pz-say').forEach(b => b.addEventListener('click', () => {
      durdur();
      icerik.querySelectorAll('.pz-say').forEach(x => x.classList.toggle('on', x === b));
      const tur = b.dataset.v, top = el[tur].length; S.vurgu = { tur, n: 0 };
      const sayac = icerik.querySelector('#pzSayac');
      zaman = setInterval(() => {
        S.vurgu.n++; ciz();
        sayac.innerHTML = S.vurgu.n < top ? `${S.vurgu.n}. ${AD[tur]}…` : `<b>${c.ad}</b> cisminin <b>${top} ${AD[tur]}</b>${tur === 'kose' ? 'si' : tur === 'yuz' ? 'ü' : 'ı'} var! 🎉`;
        if (S.vurgu.n >= top) clearInterval(zaman);
      }, tur === 'yuz' ? 520 : 330);
    }));
    S.vurgu = null; ciz();
    window.onresize = ciz;
  }

  // --- Görünümler ---
  function gorunum() {
    const c = CISIM[S.cisim];
    icerik.innerHTML = `
      <div class="pz-sahne kucuk"><canvas id="pz3" aria-label="${c.ad}"></canvas><span class="pz-ipucu">👆 Sürükle ya da aşağıdan bir yön seç</span></div>
      <div class="pz-yonler">${Object.entries(GORUS).map(([k, v]) => `<button class="pz-yon" data-y="${k}"><canvas data-g="${k}"></canvas><span>${v.ad}</span></button>`).join('')}
        <button class="pz-yon pz-capraz" data-y="capraz"><span class="pz-ikon">🔄</span><span>Çapraz bakış</span></button></div>
      <p class="pz-not">Bir cisme <b>önden, sağdan ve üstten</b> baktığımızda düzlemsel şekiller görürüz. Görünüme dokun, cisim o yöne dönsün.</p>`;
    const cv = icerik.querySelector('#pz3'), ciz = () => ciz3B(cv, c, 1, S.yaw, S.pitch, null);
    surukle(cv, ciz);
    // üç görünüm aynı ölçekle (boyutlar karşılaştırılabilsin)
    const birim = (() => { const kap = c.el.kose; const m = Math.max(...[0, 1, 2].map(i => Math.max(...kap.map(p => p[i])) - Math.min(...kap.map(p => p[i])))); return 104 / m; })();
    icerik.querySelectorAll('canvas[data-g]').forEach(k => ciz2B(k, c, k.dataset.g, birim));
    icerik.querySelectorAll('.pz-yon').forEach(b => b.addEventListener('click', () => {
      icerik.querySelectorAll('.pz-yon').forEach(x => x.classList.toggle('on', x === b));
      const y = b.dataset.y;
      if (y === 'capraz') yumusakBak(-0.62, 0.42, ciz); else yumusakBak(GORUS[y].yaw, GORUS[y].pitch, ciz);
    }));
    ciz(); window.onresize = ciz;
  }

  // --- Açınım ---
  function acinim() {
    const c = CISIM[S.cisim];
    icerik.innerHTML = `
      <div class="pz-sahne"><canvas id="pz3" aria-label="${c.ad} açınımı"></canvas><span class="pz-ipucu">👆 Sürükle ve döndür</span></div>
      <div class="pz-katla">
        <button class="btn btn-yellow" id="pzKatla">📂 Aç</button>
        <label class="pz-kaydir"><span>Kapalı</span><input type="range" id="pzT" min="0" max="100" value="0" aria-label="Açılma miktarı"><span>Açık</span></label>
      </div>
      <div class="pz-net-alt"><canvas id="pzNet" aria-label="Açınımın düz çizimi"></canvas>
        <p class="pz-not"><b>${c.ad} açınımı:</b> ${c.tur}. Aynı renkteki yüzler 3B cisimde de aynı renktedir; katlayınca hangi yüzün nereye geldiğini izle.</p></div>`;
    const cv = icerik.querySelector('#pz3'), rng = icerik.querySelector('#pzT'), btn = icerik.querySelector('#pzKatla');
    const ciz = () => { ciz3B(cv, c, S.t, S.yaw, S.pitch, null, true); rng.value = Math.round((1 - S.t) * 100); btn.textContent = S.t > .5 ? '📂 Aç' : '📦 Katla'; };
    surukle(cv, ciz);
    const git = hedef => {
      cancelAnimationFrame(anim);
      const t0 = performance.now(), from = S.t, sure = 1500 * Math.abs(hedef - from) + 1;
      const adim = now => { const k = Math.min(1, (now - t0) / sure), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; S.t = from + (hedef - from) * e; ciz(); if (k < 1) anim = requestAnimationFrame(adim); };
      anim = requestAnimationFrame(adim);
    };
    btn.addEventListener('click', () => git(S.t > .5 ? 0 : 1));
    rng.addEventListener('input', () => { cancelAnimationFrame(anim); S.t = 1 - rng.value / 100; ciz(); });
    cizNet(icerik.querySelector('#pzNet'), c);
    S.t = 1; ciz(); window.onresize = ciz;
    setTimeout(() => { if (S.sekme === 'acinim') git(0); }, 600);
  }

  // --- Sınav ---
  const karistir = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const IDLER = Object.keys(CISIM);
  function sorular() {
    const q = [], AD = { yuz: 'yüzü', ayrit: 'ayrıtı', kose: 'köşesi' };
    karistir(IDLER).slice(0, 3).forEach((id, k) => {
      const tur = ['yuz', 'ayrit', 'kose'][k], dog = CISIM[id].el[tur].length;
      const sec = karistir([...new Set([dog, dog + 1, dog - 1, dog + 2, dog + 3, 5, 6, 8, 9, 12].filter(v => v > 3))].filter(v => v !== dog)).slice(0, 3).concat(dog);
      q.push({ tur: 'sayi', id, metin: `${CISIM[id].ad} cisminin kaç ${AD[tur]} vardır?`, secenek: karistir(sec).map(String), dogru: String(dog) });
    });
    karistir(['on', 'sag', 'ust', 'on', 'sag', 'ust']).slice(0, 3).forEach((yon, k) => {
      const id = karistir(IDLER)[0];
      // Ölçekten bağımsız şekil imzası: aynı görünen şekiller (ör. iki farklı boyutta kare) aynı sayılır
      const imza = (cid, y) => {
        const c = gorunumCizgileri(CISIM[cid], y), xs = c.flat().map(p => p[0]), ys = c.flat().map(p => p[1]);
        const mx = Math.min(...xs), my = Math.min(...ys), sp = Math.max(Math.max(...xs) - mx, Math.max(...ys) - my);
        return JSON.stringify(c.map(([a, b]) => [a, b].map(p => [Math.round((p[0] - mx) / sp * 20), Math.round((p[1] - my) / sp * 20)].join(':')).sort().join()).sort());
      };
      const dogruImza = imza(id, yon), havuz = [];
      IDLER.forEach(cid => Object.keys(GORUS).forEach(y => { const im = imza(cid, y); if (im !== dogruImza && !havuz.some(h => h.im === im)) havuz.push({ cid, y, im }); }));
      const sec = karistir(havuz).slice(0, 3).map(h => ({ cid: h.cid, y: h.y })).concat({ cid: id, y: yon, d: 1 });
      q.push({ tur: 'gorunum', id, metin: `Bu ${CISIM[id].ad.toLocaleLowerCase('tr')} cisminin <b>${GORUS[yon].ad.toLocaleLowerCase('tr')}</b> görünümü hangisidir?`, secenek: karistir(sec) });
    });
    karistir(IDLER).slice(0, 2).forEach(id => q.push({ tur: 'net', id, metin: 'Bu açınım katlanınca hangi cisim oluşur?', secenek: karistir(IDLER.map(i => CISIM[i].ad)), dogru: CISIM[id].ad }));
    return karistir(q);
  }
  function sinav() {
    const Q = sorular(); let i = 0, puan = 0;
    const goster = () => {
      if (i >= Q.length) {
        icerik.innerHTML = `<div class="g-result"><h2>${puan >= 7 ? '🏆 Harika!' : puan >= 5 ? '👏 Güzel iş!' : '💪 Biraz daha çalışalım'}</h2>
          <div class="g-score"><b>${puan}</b><span> / ${Q.length}</span></div>
          <p>${puan === Q.length ? 'Bütün prizma sorularını doğru yanıtladın!' : 'Keşfet, Görünümler ve Açınım bölümlerine dönüp tekrar deneyebilirsin.'}</p>
          <div class="g-result-btns"><button class="btn btn-yellow" id="pzTekrar">🔁 Yeni sorular</button></div></div>`;
        icerik.querySelector('#pzTekrar').onclick = sinav;
        if (puan >= 6 && window.confetti) try { confetti(); } catch {}
        return;
      }
      const s = Q[i], c = CISIM[s.id];
      icerik.innerHTML = `<div class="pz-soru-ust"><span>Soru ${i + 1} / ${Q.length}</span><span>⭐ ${puan}</span></div>
        <div class="pz-soru">${s.tur === 'net' ? '<canvas id="pzSoruCv" class="net"></canvas>' : s.tur === 'gorunum' ? '<canvas id="pzSoruCv"></canvas>' : `<canvas id="pzSoruCv"></canvas>`}
          <p class="pz-soru-metin">${s.metin}</p></div>
        <div class="g-options pz-secenek${s.tur === 'gorunum' ? ' resimli' : ''}">${s.secenek.map((o, k) => s.tur === 'gorunum'
          ? `<button class="g-opt c${k}" data-k="${k}"><b>${'ABCD'[k]}</b><canvas data-cid="${o.cid}" data-y="${o.y}"></canvas></button>`
          : `<button class="g-opt c${k}" data-k="${k}"><b>${'ABCD'[k]}</b>${o}</button>`).join('')}</div>
        <p class="pg-fb" id="pzFb"></p>`;
      const cv = icerik.querySelector('#pzSoruCv');
      if (s.tur === 'net') cizNet(cv, c); else ciz3B(cv, c, 1, -0.62, 0.42, null);
      if (s.tur === 'gorunum') icerik.querySelectorAll('canvas[data-cid]').forEach(k => ciz2B(k, CISIM[k.dataset.cid], k.dataset.y, null, '#fff'));
      icerik.querySelectorAll('.g-opt').forEach(b => b.addEventListener('click', () => {
        const k = +b.dataset.k, o = s.secenek[k];
        const dogruMu = s.tur === 'gorunum' ? !!o.d : o === s.dogru;
        const dk = s.tur === 'gorunum' ? s.secenek.findIndex(x => x.d) : s.secenek.indexOf(s.dogru);
        icerik.querySelectorAll('.g-opt').forEach(x => x.disabled = true);
        b.classList.add(dogruMu ? 'right' : 'wrong'); icerik.querySelectorAll('.g-opt')[dk].classList.add('right');
        if (dogruMu) puan++;
        const fb = icerik.querySelector('#pzFb');
        fb.className = 'pg-fb ' + (dogruMu ? 'ok' : 'no');
        fb.textContent = dogruMu ? 'Doğru! 🎉' : (s.tur === 'gorunum' ? `Doğru cevap ${'ABCD'[dk]} seçeneği.` : `Doğru cevap: ${s.dogru}`);
        setTimeout(() => { i++; goster(); }, dogruMu ? 1100 : 2000);
      }));
    };
    goster();
  }

  function goster() {
    durdur(); window.onresize = null;
    stage.querySelectorAll('.pz-sekme').forEach(b => b.classList.toggle('on', b.dataset.s === S.sekme));
    stage.querySelector('#pzCisimler').hidden = S.sekme === 'sinav';
    ({ kesfet, gorunum: gorunum, acinim, sinav })[S.sekme]();
  }
  stage.querySelectorAll('.pz-sekme').forEach(b => b.addEventListener('click', () => { S.sekme = b.dataset.s; if (S.sekme !== 'acinim') S.t = 1; S.yaw = -0.62; S.pitch = S.sekme === 'acinim' ? 0.85 : 0.42; goster(); }));
  stage.querySelectorAll('.pz-cisim').forEach(b => b.addEventListener('click', () => {
    stage.querySelectorAll('.pz-cisim').forEach(x => x.classList.toggle('on', x === b));
    S.cisim = b.dataset.c; goster();
  }));
  goster();
})();
