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
  const K = { grade: 'hip_kz_grade', done: g => `hip_kz_done_${g}` };
  let grade = store.get(K.grade, 5);
  const params = new URLSearchParams(location.search);
  if (GRADES.includes(+params.get('sinif'))) grade = +params.get('sinif');
  let week = +params.get('hafta') || currentWeek(grade);

  const done = () => new Set(store.get(K.done(grade), []));
  const title = s => s.toLocaleLowerCase('tr').replace(/(^|[\s(])(\S)/g, (a, b, c) => b + c.toLocaleUpperCase('tr'));
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
    const maarif = P.program === 'maarif';
    const i = ws.indexOf(w);

    // Bu haftadan önceki özel satır (tatil / okul temelli planlama)
    const idx = P.items.indexOf(w), before = P.items[idx - 1];
    const special = before && before.ozel ? `<div class="kz-banner ${before.ozel}">${before.ozel === 'tatil' ? '🏖️' : '🏫'} ${esc(before.ozel === 'tatil' ? before.metin : 'Bu haftadan önce: Okul Temelli Planlama haftası')}</div>` : '';

    const temas = (w.tema || []).map(t => `<span class="kz-tema">${esc(maarif ? temaName(grade, t) : t)}</span>`).join('');
    const units = [...new Set((w.tema || []).map(t => siteUnit(grade, t)).filter(Boolean))];
    const sheets = (typeof WORKSHEETS !== 'undefined' ? WORKSHEETS : []).filter(s => s.grade === grade && units.includes(s.unit));
    const tools = [
      ...units.map(u => `<a class="kz-tool" href="oyunlar.html?sinif=${grade}&amp;tema=${encodeURIComponent(u)}">🎲 <span>Bu temanın oyunları</span></a>`),
      ...sheets.map(s => `<a class="kz-tool" href="${s.pdf}" target="_blank" rel="noopener">📄 <span>${esc(s.title)}</span></a>`)
    ].join('');

    const outs = (w.ciktilar || []).map(c => `<li>${c.kod ? `<code>${esc(c.kod)}</code>` : ''}<span>${esc(c.metin)}</span></li>`).join('');

    // Süreç bileşenleri: "a) …" ile başlamayan satırlar öncekinin devamı; ilk 3 adım görünür
    const stepList = [];
    for (const line of String(w.surec || '').split('\n').map(x => x.trim()).filter(Boolean)) {
      if (!stepList.length || /^[a-zçğıöşü]\s?\)/i.test(line) || /^(MAT|M)\.\d/.test(line)) stepList.push(line); else stepList[stepList.length - 1] += ' ' + line;
    }
    const stepsHtml = stepList.map((x, k) => {
      const m = x.match(/^([a-zçğıöşü])\s?\)\s*(.*)$/i);
      return `<li${k >= 3 ? ' class="kz-more"' : ''}>${m ? `<span>${esc(m[2])}</span>` : `<span>${esc(x)}</span>`}</li>`;
    }).join('');


    const opts = ws.map(x => `<option value="${x.no}"${x.no === week ? ' selected' : ''}>${x.no}. Hafta · ${esc(x.tarih || '')}${d.has(x.no) ? ' ✓' : ''}${x.no === now ? ' (bu hafta)' : ''}</option>`).join('');

    root.innerHTML = `
      <section class="kz-panel">
        <div class="kz-grades" role="tablist" aria-label="Sınıf">${GRADES.map(g => `<button class="chip" role="tab" data-g="${g}" aria-pressed="${g === grade}">${g}. Sınıf</button>`).join('')}</div>
        <div class="kz-weeknav">
          <button class="kz-nav" id="kzPrev" aria-label="Önceki hafta"${i <= 0 ? ' disabled' : ''}>‹</button>
          <div class="kz-wk-now">
            <span class="kz-wno">${w.no}. Hafta${w.no === now ? ' · Bu hafta' : ''}${d.has(w.no) ? ' · ✓ İşlendi' : ''}</span>
            <h2>${esc(w.tarih || '')}</h2>
            <label class="kz-pick"><span>Başka haftaya git</span><select id="kzSel" aria-label="Hafta seç">${opts}</select></label>
          </div>
          <button class="kz-nav" id="kzNext" aria-label="Sonraki hafta"${i >= ws.length - 1 ? ' disabled' : ''}>›</button>
        </div>
        ${week !== now ? `<div class="kz-jump"><button class="kz-mini" id="kzNow">📍 Bu haftaya dön (${now}. hafta)</button></div>` : ''}
        <div class="kz-progrow"><div class="kz-prog"><i style="width:${pct}%"></i></div><small>${d.size}/${ws.length} hafta işlendi</small></div>
      </section>
      ${special}
      <article class="kz-card" id="kzCard">
        <p class="kz-print-title">${grade}. Sınıf Matematik · ${w.no}. Hafta (${esc(w.tarih || '')})</p>
        <div class="kz-block y">
          <div class="kz-bh"><span class="kz-ic">📘</span><h3>${maarif ? 'Tema' : 'Ünite'}</h3>${w.saat ? `<small class="kz-saat">⏱ ${esc(w.saat)} ders saati</small>` : ''}</div>
          <div class="kz-temas">${temas}</div>
          ${w.konu ? `<p class="kz-konu"><b>Konu:</b> ${esc(w.konu).replace(/\n/g, ', ')}</p>` : ''}
          ${w.gunler ? `<p class="kz-day">📅 ${esc(w.gunler).replace(/\n/g, ' · ')}</p>` : ''}
        </div>
        ${outs ? `<div class="kz-block m">
          <div class="kz-bh"><span class="kz-ic">🎯</span><h3>Bu haftanın kazanımı</h3></div>
          <ul class="kz-outs">${outs}</ul>
        </div>` : ''}
        ${stepsHtml ? `<div class="kz-block l${stepList.length > 3 ? ' kz-fold' : ''}" id="kzSteps">
          <div class="kz-bh"><span class="kz-ic">🪜</span><h3>${maarif ? 'Derste adım adım' : 'Kazanım açıklaması'}</h3></div>
          <ol class="kz-steps">${stepsHtml}</ol>
          ${stepList.length > 3 ? `<button class="kz-mini" id="kzAll">Tüm adımları göster (${stepList.length})</button>` : ''}
        </div>` : ''}
        ${tools ? `<div class="kz-block w">
          <div class="kz-bh"><span class="kz-ic">🧰</span><h3>Hipotenüs’te bu hafta</h3></div>
          <div class="kz-tools">${tools}</div>
        </div>` : ''}
        <div class="kz-actions">
          <button class="kz-done${d.has(w.no) ? ' on' : ''}" id="kzDone">${d.has(w.no) ? '✓ İşlendi' : '☐ İşlendi olarak işaretle'}</button>
          <button class="kz-mini" id="kzCopy">📋 Kopyala</button>
          <button class="kz-mini" id="kzPrint">🖨️ Yazdır</button>
        </div>
      </article>
      <p class="kz-src">Kaynak: MEB, 2026-2027 ${grade}. Sınıf Matematik Taslak Çerçeve Yıllık Planı (<a href="https://tymm.meb.gov.tr/taslak-cerceve-planlari/temel-egitim" target="_blank" rel="noopener">tymm.meb.gov.tr</a>) · ${maarif ? 'Türkiye Yüzyılı Maarif Modeli' : '2018 Öğretim Programı'}. Zümre kararıyla haftalar değişebilir.</p>`;

    bind();
    try { history.replaceState(null, '', `?sinif=${grade}&hafta=${week}`); } catch {}
  }

  function weekText() {
    const P = plan(grade), w = weeks(grade).find(x => x.no === week);
    const L = [`${grade}. Sınıf Matematik · ${w.no}. Hafta (${w.tarih})`];
    if (w.tema) L.push(`${P.program === 'maarif' ? 'Tema' : 'Ünite'}: ${w.tema.join(', ')}`);
    if (w.konu) L.push(`Konu: ${w.konu.replace(/\n/g, ', ')}`);
    (w.ciktilar || []).forEach(c => L.push(`${c.kod} ${c.metin}`.trim()));
    if (w.surec) L.push(w.surec.replace(/^\s*[a-zçğıöşü]\s?\)\s*/gim, '• '));
    return L.join('\n');
  }

  function bind() {
    const go = n => { week = n; render(); };
    root.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => {
      grade = +b.dataset.g; store.set(K.grade, grade); week = currentWeek(grade); render();
    }));
    const ws = weeks(grade).map(w => w.no), i = ws.indexOf(week);
    root.querySelector('#kzPrev').addEventListener('click', () => { if (i > 0) go(ws[i - 1]); });
    root.querySelector('#kzNext').addEventListener('click', () => { if (i < ws.length - 1) go(ws[i + 1]); });
    root.querySelector('#kzSel').addEventListener('change', e => go(+e.target.value));
    const nowBtn = root.querySelector('#kzNow');
    if (nowBtn) nowBtn.addEventListener('click', () => go(currentWeek(grade)));
    const all = root.querySelector('#kzAll');
    if (all) all.addEventListener('click', () => {
      const s = root.querySelector('#kzSteps'), f = s.classList.toggle('kz-fold');
      all.textContent = f ? `Tüm adımları göster (${s.querySelectorAll('li').length})` : 'Daha az göster';
    });
    root.querySelector('#kzDone').addEventListener('click', () => {
      const d = done(); d.has(week) ? d.delete(week) : d.add(week);
      store.set(K.done(grade), [...d]); render();
    });
    root.querySelector('#kzCopy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(weekText()); toast('Haftanın planı kopyalandı 📋'); }
      catch { toast('Kopyalanamadı; metni seçip kopyalayabilirsin.'); }
    });
    root.querySelector('#kzPrint').addEventListener('click', () => {
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
