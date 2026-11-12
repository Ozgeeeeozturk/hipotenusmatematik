/* Öğretmen Masası: 4–8. sınıf matematik kazanımları, hafta hafta (MEB 2026-2027 taslak çerçeve yıllık planı) */
(function () {
  initPage();
  const root = document.getElementById('kz');
  const GRADES = [4, 5, 6, 7, 8];
  const AYLAR = { ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5, temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11 };

  // "28 Eylül-02 Ekim", "14-18 Eylül" → başlangıç ve bitiş tarihi (Eylül–Aralık 2026, Ocak–Haziran 2027)
  function range(t) {
    const m = String(t || '').toLocaleLowerCase('tr').match(/(\d+)\s*([a-zçğıöşü]+)?\s*-\s*(\d+)\s*([a-zçğıöşü]+)/);
    if (!m) return null;
    const m2 = AYLAR[m[4]], m1 = m[2] && AYLAR[m[2]] != null ? AYLAR[m[2]] : m2;
    if (m2 == null) return null;
    const y = mo => (mo >= 8 ? 2026 : 2027);
    return [new Date(y(m1), m1, +m[1]), new Date(y(m2), m2, +m[3], 23, 59)];
  }
  const plan = g => KAZANIM_PLAN.find(p => p.sinif === g);
  const weeks = g => plan(g).items.filter(i => i.no);
  function currentWeek(g) {
    const now = new Date(), ws = weeks(g);
    let best = ws[0];
    for (const w of ws) { const r = range(w.tarih); if (!r) continue; if (now >= r[0] && now <= r[1]) return w.no; if (now > r[1]) best = w; }
    return best.no;
  }

  // Durum (bu cihazda saklanır)
  const K = { grade: 'hip_kz_grade', done: g => `hip_kz_done_${g}`, note: (g, n) => `hip_kz_note_${g}_${n}` };
  let grade = store.get(K.grade, 5);
  const params = new URLSearchParams(location.search);
  if (GRADES.includes(+params.get('sinif'))) grade = +params.get('sinif');
  let week = +params.get('hafta') || currentWeek(grade);
  let query = '';

  const done = () => new Set(store.get(K.done(grade), []));
  const title = s => s.toLocaleLowerCase('tr').replace(/(^|[\s(])(\S)/g, (a, b, c) => b + c.toLocaleUpperCase('tr'));
  const nl = s => esc(s).replace(/\n/g, '<br>');
  const list = s => `<ul class="kz-ul">${s.split('\n').filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  // Süreç bileşenleri: "a) …" ile başlamayan satırlar bir önceki maddenin devamıdır
  const steps = s => {
    const out = [];
    for (const line of s.split('\n').map(x => x.trim()).filter(Boolean)) {
      if (!out.length || /^[a-zçğıöşü]\s?\)/i.test(line) || /^(MAT|M)\.\d/.test(line)) out.push(line); else out[out.length - 1] += ' ' + line;
    }
    return `<ul class="kz-ul kz-steps">${out.map(x => { const m = x.match(/^([a-zçğıöşü])\s?\)\s*(.*)$/i); return m ? `<li><b>${m[1]})</b> ${esc(m[2])}</li>` : `<li>${esc(x)}</li>`; }).join('')}</ul>`;
  };
  const temaName = (g, t) => siteUnit(g, t) || title(t).replace(/ Ve /g, ' ve ');

  // Hipotenüs içerikleriyle eşleştirme: tema adı → site temaları (5–7. sınıf, Maarif)
  function siteUnit(g, tema) {
    const u = (UNITS[g] || []).find(x => x.toLocaleUpperCase('tr') === tema);
    return u || null;
  }

  function render() {
    const P = plan(grade), ws = weeks(grade), d = done();
    if (!ws.some(w => w.no === week)) week = ws[0].no;
    const w = ws.find(x => x.no === week);
    const now = currentWeek(grade);
    const pct = Math.round(d.size / ws.length * 100);

    const strip = P.items.map(it => it.no
      ? `<button class="kz-wk${it.no === week ? ' on' : ''}${d.has(it.no) ? ' ok' : ''}${it.no === now ? ' now' : ''}" data-w="${it.no}" aria-label="${it.no}. hafta, ${esc(it.tarih || '')}${d.has(it.no) ? ', işlendi' : ''}">
          <b>${it.no}. Hafta</b><small>${esc(it.tarih || '')}</small>${it.no === now ? '<i class="kz-now">Bu hafta</i>' : ''}</button>`
      : `<span class="kz-sp ${it.ozel}" title="${esc(it.metin)}">${it.ozel === 'tatil' ? '🏖️' : '🏫'}<small>${it.ozel === 'tatil' ? 'Tatil' : 'OTP'}</small></span>`).join('');

    // Bu haftadan önceki özel satırlar (tatil / okul temelli planlama) bilgi olarak
    const idx = P.items.indexOf(w), before = P.items[idx - 1];
    const special = before && before.ozel ? `<div class="kz-banner ${before.ozel}">${before.ozel === 'tatil' ? '🏖️' : '🏫'} ${esc(before.ozel === 'tatil' ? before.metin : 'Bu haftadan önce: Okul Temelli Planlama haftası')}</div>` : '';

    const temas = (w.tema || []).map(t => {
      const u = siteUnit(grade, t);
      return `<span class="kz-tema">${esc(P.program === 'maarif' ? temaName(grade, t) : t)}</span>${u ? `<a class="kz-link" href="oyunlar.html?sinif=${grade}&amp;tema=${encodeURIComponent(u)}">🎲 Bu temanın oyunları</a>` : ''}`;
    }).join('');
    const sheets = (typeof WORKSHEETS !== 'undefined' ? WORKSHEETS : []).filter(s => s.grade === grade && (w.tema || []).some(t => siteUnit(grade, t) === s.unit));

    const sec = (icon, label, body, open = true, cls = '') => body ? `<details class="kz-sec ${cls}"${open ? ' open' : ''}><summary><span class="kz-ic">${icon}</span>${label}</summary><div class="kz-body">${body}</div></details>` : '';
    const outs = (w.ciktilar || []).map(c => `<div class="kz-out">${c.kod ? `<code>${esc(c.kod)}</code>` : ''}<p>${esc(c.metin)}</p></div>`).join('');

    root.innerHTML = `
      <div class="kz-top">
        <div class="kz-grades" role="tablist" aria-label="Sınıf">${GRADES.map(g => `<button class="chip" role="tab" data-g="${g}" aria-pressed="${g === grade}">${g}. Sınıf</button>`).join('')}</div>
        <div class="kz-search"><input type="search" id="kzQ" placeholder="🔍 Kazanım ara (ör. kesir, MAT.6.1)" value="${esc(query)}" aria-label="Kazanım ara"></div>
      </div>
      <p class="kz-prog-txt"><b>${grade}. Sınıf Matematik</b> · ${P.program === 'maarif' ? 'Türkiye Yüzyılı Maarif Modeli' : '2018 Öğretim Programı'} · <span>${d.size}/${ws.length} hafta işlendi</span></p>
      <div class="kz-prog"><i style="width:${pct}%"></i></div>
      <div id="kzResults"></div>
      <div class="kz-strip-wrap">
        <button class="kz-nav" id="kzPrev" aria-label="Önceki hafta">‹</button>
        <div class="kz-strip" id="kzStrip">${strip}</div>
        <button class="kz-nav" id="kzNext" aria-label="Sonraki hafta">›</button>
      </div>
      ${week !== now ? `<div class="kz-jump"><button class="btn btn-ghost-dark" id="kzNow">📍 Bu haftaya git (${now}. hafta)</button></div>` : ''}
      ${special}
      <article class="kz-card" id="kzCard">
        <header class="kz-head">
          <div><span class="kz-wno">${w.no}. Hafta</span><h2>${esc(w.tarih || '')}</h2><p>${esc(title(w.ay || ''))}${w.saat ? ` · ${esc(w.saat)} ders saati` : ''}</p></div>
          <button class="kz-done${d.has(w.no) ? ' on' : ''}" id="kzDone">${d.has(w.no) ? '✓ İşlendi' : '☐ İşlendi olarak işaretle'}</button>
        </header>
        ${sec('📘', P.program === 'maarif' ? 'Tema' : 'Ünite', `<div class="kz-temas">${temas}</div>`)}
        ${sec('🎯', 'Konu / İçerik Çerçevesi', w.konu ? `<p class="kz-konu">${nl(w.konu)}</p>` : '')}
        ${sec('✅', P.program === 'maarif' ? 'Öğrenme Çıktıları' : 'Kazanımlar', outs)}
        ${sec('⏳', P.program === 'maarif' ? 'Süreç Bileşenleri' : 'Kazanım Açıklaması', w.surec ? steps(w.surec) : '')}
        ${sec('📝', 'Ölçme ve Değerlendirme', w.olcme ? list(w.olcme) : '', false)}
        ${sec('🤝', 'Sosyal-Duygusal Öğrenme Becerileri', w.sdb ? list(w.sdb) : '', false)}
        ${sec('💎', 'Değerler', w.degerler ? list(w.degerler) : '', false)}
        ${sec('📖', 'Okuryazarlık Becerileri', w.okuryazarlik ? list(w.okuryazarlik) : '', false)}
        ${sec('📅', 'Belirli Gün ve Haftalar', w.gunler ? list(w.gunler) : '', true, 'kz-days')}
        ${sheets.length ? sec('📄', 'Hipotenüs Çalışma Kâğıtları', sheets.map(s => `<a class="kz-link" href="${s.pdf}" target="_blank" rel="noopener">📄 ${esc(s.title)}</a>`).join(' ')) : ''}
        <div class="kz-note">
          <label for="kzNote">✏️ Bu hafta için notlarım <small>(yalnızca bu cihazda saklanır)</small></label>
          <textarea id="kzNote" rows="3" placeholder="Örn. 5-B sınıfında çember etkinliğini yaptık, ödev: sayfa 42…">${esc(store.get(K.note(grade, w.no), ''))}</textarea>
        </div>
        <div class="kz-actions">
          <button class="btn btn-ghost-dark" id="kzCopy">📋 Kopyala</button>
          <button class="btn btn-ghost-dark" id="kzPrint">🖨️ Yazdır</button>
        </div>
      </article>
      <p class="kz-src">Kaynak: MEB, 2026-2027 Eğitim Öğretim Yılı ${grade}. Sınıf Matematik Dersi Taslak Çerçeve Yıllık Planı (<a href="https://tymm.meb.gov.tr/taslak-cerceve-planlari/temel-egitim" target="_blank" rel="noopener">tymm.meb.gov.tr</a>). Zümre kararıyla haftalar değişebilir.</p>`;

    bind();
    const on = root.querySelector('.kz-wk.on');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
    if (query) search(query);
    try { history.replaceState(null, '', `?sinif=${grade}&hafta=${week}`); } catch {}
  }

  function search(q) {
    const box = root.querySelector('#kzResults');
    q = q.trim().toLocaleLowerCase('tr');
    if (q.length < 2) { box.innerHTML = ''; return; }
    const hits = [];
    for (const w of weeks(grade)) for (const c of w.ciktilar || []) {
      const hay = `${c.kod} ${c.metin} ${w.konu || ''}`.toLocaleLowerCase('tr');
      if (hay.includes(q) && !hits.some(h => h.c.kod === c.kod && h.c.kod)) hits.push({ w, c });
    }
    box.innerHTML = `<div class="kz-results"><b>${hits.length ? `${hits.length} sonuç` : 'Sonuç bulunamadı'}</b>${hits.slice(0, 12).map(h =>
      `<button data-w="${h.w.no}"><span>${h.w.no}. hafta</span>${h.c.kod ? `<code>${esc(h.c.kod)}</code>` : ''} ${esc(h.c.metin)}</button>`).join('')}</div>`;
  }

  function weekText() {
    const P = plan(grade), w = weeks(grade).find(x => x.no === week);
    const L = [`${grade}. Sınıf Matematik · ${w.no}. Hafta (${w.tarih})`];
    if (w.tema) L.push(`${P.program === 'maarif' ? 'Tema' : 'Ünite'}: ${w.tema.join(', ')}`);
    if (w.konu) L.push(`Konu: ${w.konu.replace(/\n/g, ', ')}`);
    (w.ciktilar || []).forEach(c => L.push(`${c.kod} ${c.metin}`.trim()));
    if (w.surec) L.push(w.surec);
    return L.join('\n');
  }

  function bind() {
    root.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => {
      grade = +b.dataset.g; store.set(K.grade, grade); week = currentWeek(grade); render();
    }));
    root.querySelector('#kzStrip').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) { week = +b.dataset.w; render(); } });
    const ws = weeks(grade).map(w => w.no), i = ws.indexOf(week);
    root.querySelector('#kzPrev').disabled = i <= 0;
    root.querySelector('#kzNext').disabled = i >= ws.length - 1;
    root.querySelector('#kzPrev').addEventListener('click', () => { if (i > 0) { week = ws[i - 1]; render(); } });
    root.querySelector('#kzNext').addEventListener('click', () => { if (i < ws.length - 1) { week = ws[i + 1]; render(); } });
    const nowBtn = root.querySelector('#kzNow');
    if (nowBtn) nowBtn.addEventListener('click', () => { week = currentWeek(grade); render(); });
    root.querySelector('#kzDone').addEventListener('click', () => {
      const d = done(); d.has(week) ? d.delete(week) : d.add(week);
      store.set(K.done(grade), [...d]); render();
    });
    const note = root.querySelector('#kzNote');
    let tm; note.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { note.value.trim() ? store.set(K.note(grade, week), note.value) : store.del(K.note(grade, week)); }, 300); });
    const q = root.querySelector('#kzQ');
    q.addEventListener('input', () => { query = q.value; search(query); });
    root.querySelector('#kzResults').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) { week = +b.dataset.w; query = ''; render(); root.querySelector('#kzCard').scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    root.querySelector('#kzCopy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(weekText()); toast('Haftanın planı kopyalandı 📋'); }
      catch { toast('Kopyalanamadı; metni seçip kopyalayabilirsin.'); }
    });
    root.querySelector('#kzPrint').addEventListener('click', () => {
      root.querySelectorAll('.kz-sec').forEach(s => s.setAttribute('open', ''));
      window.print();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowLeft') root.querySelector('#kzPrev')?.click();
    if (e.key === 'ArrowRight') root.querySelector('#kzNext')?.click();
  });

  render();
})();
