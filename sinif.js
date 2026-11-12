/* Sınıf sayfası: bir sınıfa ait oyunlar, öğretmen etkinlikleri, çalışma kâğıtları ve "Bu Hafta" */
(function () {
  initPage();
  const root = document.getElementById('sp');
  const params = new URLSearchParams(location.search);
  const GRADES = [5, 6, 7, 8];
  const g = GRADES.includes(+params.get('s')) ? +params.get('s') : 5;
  let tema = params.get('tema') || '';
  if (tema && !(UNITS[g] || []).includes(tema)) tema = '';
  const COLOR = { 5: 'm', 6: 'l', 7: 'y', 8: 'm' };
  let acts = null; // öğretmen etkinlikleri (veritabanından)

  document.title = `${g}. Sınıf Matematik: Oyunlar, Etkinlikler, Çalışma Kâğıtları | Hipotenüs`;
  const canon = document.getElementById('canon'); if (canon) canon.href = `https://hipotenusmatematik.com/sinif.html?s=${g}`;

  // ---- Bu hafta (MEB taslak çerçeve planından) ----
  const AYLAR = { ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5, temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11 };
  function range(t) {
    const m = String(t || '').toLocaleLowerCase('tr').match(/(\d+)\s*([a-zçğıöşü]+)?\s*-\s*(\d+)\s*([a-zçğıöşü]+)/);
    if (!m) return null;
    const m2 = AYLAR[m[4]], m1 = m[2] && AYLAR[m[2]] != null ? AYLAR[m[2]] : m2;
    if (m2 == null) return null;
    const y = mo => (mo >= 8 ? 2026 : 2027);
    return [new Date(y(m1), m1, +m[1]), new Date(y(m2), m2, +m[3], 23, 59)];
  }
  function thisWeek() {
    if (typeof KAZANIM_PLAN === 'undefined') return null;
    const p = KAZANIM_PLAN.find(x => x.sinif === g); if (!p) return null;
    const now = new Date(); let last = null, prev = null;
    for (const it of p.items) {
      if (it.ozel) { prev = it; continue; }
      const r = range(it.tarih); if (!r) continue;
      if (now >= r[0] && now <= r[1]) return { w: it };
      if (now < r[0]) return { w: it, next: true, before: prev }; // tatildeyiz → sıradaki hafta
      last = it; prev = null;
    }
    return last ? { w: last } : null;
  }
  // Haftanın konusunu sitedeki temalarla eşleştir
  function weekUnits(w) {
    const up = s => s.toLocaleUpperCase('tr');
    const hay = up(`${(w.tema || []).join(' ')} ${w.konu || ''}`);
    return (UNITS[g] || []).filter(u => hay.includes(up(u)));
  }

  const games = () => BUILTIN_GAMES.filter(x => x.grades.includes(g) && (!tema || x.unit === tema));
  const sheets = () => (typeof WORKSHEETS !== 'undefined' ? WORKSHEETS : []).filter(x => x.grade === g && (!tema || x.unit === tema));
  const countFor = u => BUILTIN_GAMES.filter(x => x.grades.includes(g) && x.unit === u).length
    + (typeof WORKSHEETS !== 'undefined' ? WORKSHEETS : []).filter(x => x.grade === g && x.unit === u).length
    + (acts ? acts.filter(a => a.unit === u).length : 0);

  function weekBox() {
    const T = thisWeek(); if (!T) return '';
    const w = T.w, us = weekUnits(w);
    const recG = BUILTIN_GAMES.filter(x => x.grades.includes(g) && us.includes(x.unit));
    const recS = (typeof WORKSHEETS !== 'undefined' ? WORKSHEETS : []).filter(x => x.grade === g && us.includes(x.unit));
    const out = (w.ciktilar || [])[0];
    const rec = [...recG.map(x => `<a class="sp-rec" href="${x.href}"><span>${x.icon}</span>${esc(x.title.split(':')[0])}</a>`),
      ...recS.map(x => `<a class="sp-rec" href="${x.pdf}" target="_blank" rel="noopener"><span>📄</span>${esc(x.title)}</a>`)].slice(0, 4).join('');
    return `<section class="sp-week">
      <div class="sp-week-h"><span class="sp-badge">⭐ ${T.next ? 'Sıradaki Hafta' : 'Bu Hafta'}</span><small>${w.no}. hafta · ${esc(w.tarih || '')}</small></div>
      ${T.before && T.before.ozel === 'tatil' ? `<p class="sp-holiday">🏖️ ${esc(T.before.metin)}</p>` : ''}
      <h2>${esc(w.konu ? w.konu.split('\n')[0].replace(/^M\.\d+\.\d+\.\d+\.\s*/, '') : (w.tema || []).join(', '))}</h2>
      ${us.length ? `<p class="sp-week-t">${us.map(u => `<button class="sp-wt" data-t="${esc(u)}">${esc(unitLabel(g, u))}</button>`).join(' ')}</p>` : ''}
      ${out ? `<p class="sp-out">${esc(out.metin)}</p>` : ''}
      ${rec ? `<div class="sp-recs"><b>Bu hafta için:</b>${rec}</div>` : ''}
    </section>`;
  }

  function wsCard(w) {
    return `<a class="card sp-ws" href="${w.pdf}" target="_blank" rel="noopener">
      <img src="${w.thumb}" alt="" loading="lazy" width="397" height="562">
      <div><span class="act-type">📝 Çalışma Kâğıdı</span><h3>${esc(w.title)}</h3><p>${esc(w.unit)} · ${w.info}</p><span class="sp-pdf">📄 PDF’i aç</span></div>
    </a>`;
  }

  function render() {
    const gs = games(), ss = sheets();
    const units = UNITS[g] || [];
    const actList = acts ? acts.filter(a => !tema || a.unit === tema) : null;
    root.innerHTML = `
      <div class="sp-hero ${COLOR[g]}">
        <div class="wrap sp-hero-in">
          <span class="sp-num">${g}</span>
          <div><h1>${g}. Sınıf Matematik</h1><p>${GRADE_TEXT[g] || ''}</p></div>
          <nav class="sp-switch" aria-label="Sınıf değiştir">${GRADES.map(x => `<a href="sinif.html?s=${x}" class="${x === g ? 'on' : ''}" aria-current="${x === g ? 'page' : 'false'}">${x}</a>`).join('')}</nav>
        </div>
      </div>
      <div class="wrap sp-main">
        ${weekBox()}
        <div class="sp-filter" role="group" aria-label="Tema seç">
          <button class="chip" data-t="" aria-pressed="${!tema}">Tümü</button>
          ${units.map(u => { const n = countFor(u); return `<button class="chip${n ? '' : ' dim'}" data-t="${esc(u)}" aria-pressed="${tema === u}">${esc(u)}${n ? ` <i>${n}</i>` : ''}</button>`; }).join('')}
        </div>

        <section class="sp-sec">
          <div class="sp-sec-h"><h2>🎲 Oyunlar</h2><a href="oyunlar.html?sinif=${g}${tema ? `&tema=${encodeURIComponent(tema)}` : ''}">Tümü →</a></div>
          ${gs.length ? `<div class="grid">${gs.map(builtinCard).join('')}</div>` : '<div class="empty sp-empty">Bu temada henüz hazır oyun yok. Yakında eklenecek! 🚀</div>'}
        </section>

        <section class="sp-sec">
          <div class="sp-sec-h"><h2>🧩 Öğretmen Etkinlikleri</h2><a href="oyunlar.html?sinif=${g}">Tümü →</a></div>
          ${actList == null ? '<div class="grid"><div class="skeleton"></div><div class="skeleton"></div></div>'
            : actList.length ? `<div class="grid">${actList.map(activityCard).join('')}</div>` : '<div class="empty sp-empty">Bu seçimde henüz öğretmen etkinliği yok.</div>'}
        </section>

        <section class="sp-sec">
          <div class="sp-sec-h"><h2>📝 Çalışma Kâğıtları</h2><a href="calisma-kagitlari.html?sinif=${g}">Tümü →</a></div>
          ${ss.length ? `<div class="grid sp-ws-grid">${ss.map(wsCard).join('')}</div>` : '<div class="empty sp-empty">Bu seçimde henüz çalışma kâğıdı yok.</div>'}
        </section>

        <a class="sp-teacher" href="kazanimlar.html?sinif=${g}">
          <span>📋</span><div><b>Öğretmenler için: ${g}. sınıf haftalık kazanımlar</b><small>MEB 2026-2027 çerçeve planı · öğrenme çıktıları · süreç bileşenleri</small></div><span class="gp-go">›</span>
        </a>
      </div>`;
    root.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
      tema = b.dataset.t; render();
      try { history.replaceState(null, '', `?s=${g}${tema ? `&tema=${encodeURIComponent(tema)}` : ''}`); } catch {}
      if (b.classList.contains('sp-wt')) root.querySelector('.sp-filter').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  render();
  (async () => {
    if (typeof DB === 'undefined' || !DB.ok()) { acts = []; return render(); }
    try { acts = await DB.list({ grade: g, limit: 40 }); } catch { acts = []; }
    render();
  })();
})();
