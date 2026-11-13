/* Öğrenci Takibi: öğretmen sınıf oluşturur, öğrenciler kodla katılır; hangi oyunu kimin oynadığı burada görünür */
(function () {
  initPage();
  const app = document.getElementById('app');
  const fmtDate = d => new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const BUILTIN = Object.fromEntries(BUILTIN_GAMES.map(g => [g.href.replace(/\.html$/, ''), g]));
  const STATUS = {
    bitirdi: { ic: '✓', txt: 'Bitirdi', cls: 'ok' },
    acti: { ic: '◐', txt: 'Açtı, bitirmedi', cls: 'mid' },
    yok: { ic: '✗', txt: 'Oynamadı', cls: 'no' },
  };

  let classes = [], selId = null, members = [], plays = [], view = 'oyun', detail = null, creating = false;

  const empty = (title, text, btn = '') => `<div class="empty"><b>${title}</b><p>${text}</p>${btn}</div>`;

  async function start() {
    const u = Auth.current();
    if (!u) { app.innerHTML = empty('Önce giriş yap', 'Öğrenci takibi için öğretmen hesabınla giriş yapmalısın.', '<a class="btn btn-yellow" href="giris.html">Giriş Yap</a>'); return; }
    if (u.role !== 'ogretmen') { app.innerHTML = empty('Bu sayfa öğretmenler için', 'Öğrenciysen sağ üstteki adına dokunup <b>Sınıfa Katıl</b>’ı seçerek öğretmeninin kodunu yazabilirsin.', '<a class="btn btn-yellow" href="oyunlar.html">Oyunlara Git</a>'); return; }
    try {
      classes = await Classes.mine();
    } catch {
      app.innerHTML = empty('Sınıflar yüklenemedi', 'İnternet bağlantını kontrol edip sayfayı yenile. Sorun sürerse Supabase’de <b>siniflar.sql</b> dosyasının çalıştırıldığından emin ol.');
      return;
    }
    if (!classes.length) creating = true;
    await select(selId && classes.some(c => c.id === selId) ? selId : classes[0] && classes[0].id);
  }

  async function select(id) {
    selId = id || null; detail = null; members = []; plays = [];
    render(true);
    if (!selId) return;
    try {
      members = await Classes.members(selId);
      plays = await Classes.plays(members.map(m => m.student_id));
    } catch { toast('Öğrenci bilgileri yüklenemedi. İnternet bağlantını kontrol et.'); }
    render();
  }

  // Öğrenci × oyun özeti: durum, kaç kez bitirdi, en iyi puan, son tarih
  function summary() {
    const by = {};
    for (const p of plays) {
      const k = `${p.user_id}|${p.game}`;
      const s = by[k] || (by[k] = { status: 'acti', times: 0, best: null, last: p.created_at, title: p.title });
      if (p.created_at > s.last) s.last = p.created_at;
      if (p.event === 'bitirdi') {
        s.status = 'bitirdi'; s.times++;
        if (p.total && (!s.best || p.score / p.total > s.best.score / s.best.total)) s.best = { score: p.score, total: p.total };
      }
    }
    return by;
  }
  const cell = (by, uid, game) => by[`${uid}|${game}`] || { status: 'yok' };
  const scoreTxt = s => (s.best ? `${s.best.score}/${s.best.total}` : '');

  function gameList(cls) {
    const titles = {};
    for (const p of plays) if (!titles[p.game] && p.title) titles[p.game] = p.title;
    const ids = new Set([...BUILTIN_GAMES.filter(g => !cls.grade || g.grades.includes(cls.grade)).map(g => g.href.replace(/\.html$/, '')), ...plays.map(p => p.game)]);
    return [...ids].map(id => ({ id, title: BUILTIN[id] ? BUILTIN[id].title : (titles[id] || id), icon: BUILTIN[id] ? BUILTIN[id].icon : '📝' }));
  }

  function render(loading) {
    const cls = classes.find(c => c.id === selId);
    const chips = classes.map(c => `<button class="chip" data-cls="${c.id}" aria-pressed="${c.id === selId}">🏫 ${esc(c.name)}</button>`).join('');
    const form = creating ? `
      <form class="tk-new card" id="newForm">
        <h3>Yeni sınıf</h3>
        <div class="tk-new-row">
          <div class="field"><label for="newName">Sınıf adı</label><input class="input" id="newName" maxlength="40" placeholder="Örn: 6-A" required></div>
          <div class="field"><label for="newGrade">Sınıf düzeyi</label>
            <select class="input" id="newGrade"><option value="">Seç</option>${[5, 6, 7, 8].map(g => `<option value="${g}">${g}. Sınıf</option>`).join('')}</select></div>
        </div>
        <div class="btns"><button class="btn btn-yellow" type="submit">Oluştur</button>${classes.length ? '<button class="btn btn-plain" type="button" id="newCancel">Vazgeç</button>' : ''}</div>
      </form>` : '';
    let body = '';
    if (cls) body = loading ? '<div class="skeleton" style="height:260px"></div>' : panel(cls);
    else if (!creating) body = empty('Henüz sınıfın yok', 'İlk sınıfını oluştur; site sana öğrencilerinle paylaşacağın bir kod verecek.');
    app.innerHTML = `<div class="filters tk-classes">${chips}<button class="chip" id="newChip">＋ Yeni Sınıf</button></div>${form}${body}`;
    bind(cls);
  }

  function panel(cls) {
    const howTo = `<p class="tk-how">Öğrenciler kendi hesaplarıyla giriş yapar, sağ üstteki adlarına dokunur, <b>🏫 Sınıfa Katıl</b>’ı seçip bu kodu yazar.</p>`;
    const head = `<div class="tk-head">
        <div><h2>${esc(cls.name)}</h2><p>${cls.grade ? `${cls.grade}. Sınıf · ` : ''}${members.length} öğrenci</p></div>
        <div class="tk-code"><small>Sınıf kodu</small><b>${cls.code}</b><button class="btn btn-mint" id="copyCode">📋 Kopyala</button></div>
      </div>${howTo}`;
    if (!members.length) return `<section class="card tk-panel">${head}${empty('Henüz katılan öğrenci yok', 'Kodu tahtaya yaz ya da öğrencilerinle paylaş. Katılan öğrenciler burada görünecek.')}${danger()}</section>`;
    const tabs = `<div class="filters" role="group" aria-label="Görünüm">
        <button class="chip" data-view="oyun" aria-pressed="${view === 'oyun'}">🎲 Oyunlara göre</button>
        <button class="chip" data-view="ogrenci" aria-pressed="${view === 'ogrenci'}">👥 Öğrencilere göre</button>
      </div>`;
    const by = summary();
    let content;
    if (view === 'oyun' && detail) content = gameDetail(cls, by);
    else if (view === 'oyun') content = gameTable(cls, by);
    else if (detail) content = studentDetail(cls, by);
    else content = studentTable(cls, by);
    return `<section class="card tk-panel">${head}${tabs}${content}${danger()}</section>`;
  }

  const danger = () => `<div class="tk-danger"><button class="link-btn danger" id="delClass">Sınıfı sil</button></div>`;

  function gameTable(cls, by) {
    const n = members.length;
    const rows = gameList(cls).map(g => {
      const c = { bitirdi: 0, acti: 0, yok: 0 };
      members.forEach(m => c[cell(by, m.student_id, g.id).status]++);
      return { ...g, c };
    }).sort((a, b) => (b.c.bitirdi + b.c.acti) - (a.c.bitirdi + a.c.acti) || a.title.localeCompare(b.title, 'tr'));
    return `<p class="tk-note">Bir oyuna dokun: kimin oynadığını, kimin oynamadığını gör.</p>
      <div class="tk-list">${rows.map(g => `
        <button class="tk-row" data-game="${esc(g.id)}">
          <span class="tk-ic" aria-hidden="true">${g.icon}</span>
          <span class="tk-main"><b>${esc(g.title)}</b>
            <span class="tk-bar" aria-hidden="true"><i class="ok" style="width:${g.c.bitirdi / n * 100}%"></i><i class="mid" style="width:${g.c.acti / n * 100}%"></i></span>
            <small><span class="tk-s ok">✓ ${g.c.bitirdi} bitirdi</span><span class="tk-s mid">◐ ${g.c.acti} açtı</span><span class="tk-s no">✗ ${g.c.yok} oynamadı</span></small>
          </span>
          <span class="tk-go" aria-hidden="true">›</span>
        </button>`).join('')}</div>`;
  }

  function gameDetail(cls, by) {
    const g = gameList(cls).find(x => x.id === detail) || { title: detail, icon: '📝' };
    const order = { bitirdi: 0, acti: 1, yok: 2 };
    const rows = members.map(m => ({ m, s: cell(by, m.student_id, detail) }))
      .sort((a, b) => order[a.s.status] - order[b.s.status] || a.m.student_name.localeCompare(b.m.student_name, 'tr'));
    return `<button class="link-btn" id="back">‹ Tüm oyunlar</button>
      <h3 class="tk-h3">${g.icon} ${esc(g.title)}</h3>
      <div class="tk-list">${rows.map(({ m, s }) => `
        <div class="tk-row static">
          <span class="tk-badge ${STATUS[s.status].cls}" aria-hidden="true">${STATUS[s.status].ic}</span>
          <span class="tk-main"><b>${esc(m.student_name)}</b>
            <small>${STATUS[s.status].txt}${s.times > 1 ? ` · ${s.times} kez` : ''}${s.last ? ` · ${fmtDate(s.last)}` : ''}</small></span>
          ${s.best ? `<span class="tk-score">${scoreTxt(s)}</span>` : ''}
        </div>`).join('')}</div>`;
  }

  function studentTable(cls, by) {
    const games = gameList(cls);
    const rows = members.map(m => {
      const mine = plays.filter(p => p.user_id === m.student_id);
      const done = games.filter(g => cell(by, m.student_id, g.id).status === 'bitirdi').length;
      return { m, done, last: mine.length ? mine[0].created_at : null };
    }).sort((a, b) => a.m.student_name.localeCompare(b.m.student_name, 'tr'));
    return `<p class="tk-note">Bir öğrenciye dokun: hangi oyunları oynadığını ve puanlarını gör.</p>
      <div class="tk-list">${rows.map(r => `
        <button class="tk-row" data-student="${r.m.student_id}">
          <span class="avatar" aria-hidden="true">${esc(r.m.student_name[0].toLocaleUpperCase('tr'))}</span>
          <span class="tk-main"><b>${esc(r.m.student_name)}</b>
            <small>${r.done ? `✓ ${r.done} oyun bitirdi` : 'Henüz oyun bitirmedi'} · ${r.last ? `son: ${fmtDate(r.last)}` : 'hiç oynamadı'}</small></span>
          <span class="tk-go" aria-hidden="true">›</span>
        </button>`).join('')}</div>`;
  }

  function studentDetail(cls, by) {
    const m = members.find(x => x.student_id === detail);
    if (!m) { detail = null; return studentTable(cls, by); }
    const order = { bitirdi: 0, acti: 1, yok: 2 };
    const rows = gameList(cls).map(g => ({ g, s: cell(by, m.student_id, g.id) }))
      .sort((a, b) => order[a.s.status] - order[b.s.status] || (b.s.last || '').localeCompare(a.s.last || ''));
    return `<button class="link-btn" id="back">‹ Tüm öğrenciler</button>
      <h3 class="tk-h3">${esc(m.student_name)}</h3>
      <p class="tk-note">Sınıfa katılma: ${fmtDate(m.joined_at)}. Bu tarihten önceki oyunları görünmez.</p>
      <div class="tk-list">${rows.map(({ g, s }) => `
        <div class="tk-row static">
          <span class="tk-badge ${STATUS[s.status].cls}" aria-hidden="true">${STATUS[s.status].ic}</span>
          <span class="tk-main"><b>${g.icon} ${esc(g.title)}</b>
            <small>${STATUS[s.status].txt}${s.times > 1 ? ` · ${s.times} kez` : ''}${s.last ? ` · ${fmtDate(s.last)}` : ''}</small></span>
          ${s.best ? `<span class="tk-score">${scoreTxt(s)}</span>` : ''}
        </div>`).join('')}</div>
      <div class="tk-danger"><button class="link-btn danger" id="kick">Öğrenciyi sınıftan çıkar</button></div>`;
  }

  const showDetail = () => { const h = app.querySelector('#back'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  function bind(cls) {
    const $ = s => app.querySelector(s);
    app.querySelectorAll('[data-cls]').forEach(b => b.addEventListener('click', () => { creating = false; select(b.dataset.cls); }));
    $('#newChip').addEventListener('click', () => { creating = true; render(); $('#newName').focus(); });
    const form = $('#newForm');
    if (form) {
      if ($('#newCancel')) $('#newCancel').addEventListener('click', () => { creating = false; render(); });
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = $('#newName').value.trim(), grade = Number($('#newGrade').value) || null;
        if (!name) return;
        const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Oluşturuluyor…';
        try {
          const c = await Classes.create(name, grade);
          classes.push(c); creating = false; view = 'oyun';
          toast(`<b>${esc(c.name)}</b> oluşturuldu. Kodun: <b>${c.code}</b>`, 5000);
          select(c.id);
        } catch { toast('Sınıf oluşturulamadı. İnternet bağlantını kontrol et.'); btn.disabled = false; btn.textContent = 'Oluştur'; }
      });
    }
    if (!cls) return;
    const copy = $('#copyCode');
    if (copy) copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(cls.code); toast(`Kod kopyalandı: <b>${cls.code}</b>`); }
      catch { toast(`Sınıf kodu: <b>${cls.code}</b>`, 6000); }
    });
    app.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; detail = null; render(); }));
    app.querySelectorAll('[data-game]').forEach(b => b.addEventListener('click', () => { detail = b.dataset.game; render(); showDetail(); }));
    app.querySelectorAll('[data-student]').forEach(b => b.addEventListener('click', () => { detail = b.dataset.student; render(); showDetail(); }));
    if ($('#back')) $('#back').addEventListener('click', () => { detail = null; render(); });
    if ($('#kick')) $('#kick').addEventListener('click', async () => {
      const m = members.find(x => x.student_id === detail);
      if (!confirm(`${m.student_name} sınıftan çıkarılsın mı? Oyun kayıtlarını artık göremezsin.`)) return;
      try { await Classes.kick(cls.id, m.student_id); toast('Öğrenci sınıftan çıkarıldı.'); select(cls.id); } catch { toast('İşlem yapılamadı. İnternet bağlantını kontrol et.'); }
    });
    if ($('#delClass')) $('#delClass').addEventListener('click', async () => {
      if (!confirm(`"${cls.name}" sınıfı silinsin mi? Öğrenciler sınıftan çıkar ve kod artık çalışmaz. Bu işlem geri alınamaz.`)) return;
      try { await Classes.remove(cls.id); classes = classes.filter(c => c.id !== cls.id); toast('Sınıf silindi.'); if (!classes.length) creating = true; select(classes[0] && classes[0].id); }
      catch { toast('Sınıf silinemedi. İnternet bağlantını kontrol et.'); }
    });
  }

  Auth.refresh().then(start).catch(start);
})();
