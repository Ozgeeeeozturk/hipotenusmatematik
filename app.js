/* ================= Hipotenüs ortak betik ================= */

// ---- Ünite / tema listeleri (tek kaynak: menü, sınıf kartları ve editör buradan oluşur) ----
// 5, 6 ve 7. sınıflar: Türkiye Yüzyılı Maarif Modeli temaları, MEB'in resmi sırasıyla (tymm.meb.gov.tr, 2026-2027)
// 8. sınıf: 2018 öğretim programı üniteleri
const UNITS = {
  // 5, 6 ve 7. sınıf: MEB 2026-2027 ders kitaplarındaki tema sırası (tymm.meb.gov.tr ders kitapları)
  5: ['Geometrik Şekiller','Sayılar ve Nicelikler (1)','Geometrik Nicelikler','Sayılar ve Nicelikler (2)',
      'İstatistiksel Araştırma Süreci','İşlemlerle Cebirsel Düşünme','Veriden Olasılığa'],
  6: ['Sayılar ve Nicelikler (1)','Veriden Olasılığa','Sayılar ve Nicelikler (2)','İstatistiksel Araştırma Süreci',
      'Geometrik Şekiller','İşlemlerle Cebirsel Düşünme ve Değişimler','Geometrik Nicelikler'],
  7: ['Sayılar ve Nicelikler (1)','Geometrik Nicelikler (1)','İstatistiksel Araştırma Süreci','Dönüşüm',
      'Geometrik Şekiller','Sayılar ve Nicelikler (2)','Veriden Olasılığa','İşlemlerle Cebirsel Düşünme ve Değişimler',
      'Geometrik Nicelikler (2)'],
  8: ['Çarpanlar ve Katlar','Üslü İfadeler','Kareköklü İfadeler','Veri Analizi','Basit Olayların Olasılığı',
      'Cebirsel İfadeler ve Özdeşlikler','Doğrusal Denklemler','Eşitsizlikler','Üçgenler','Eşlik ve Benzerlik',
      'Dönüşüm Geometrisi','Geometrik Cisimler'],
};
// Resmi tema numaraları: Maarif Modeli'nde bazı temalar iki bölüm hâlinde aynı numarayı taşır
const UNIT_NO = {
  5: ['1', '2', '3', '4', '5', '6', '7'],
  6: ['1', '2', '3', '4', '5', '6', '7'],
  7: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
};
const UNIT_WORD = g => (UNIT_NO[g] ? 'tema' : 'ünite');
const UNIT_TITLE = g => (UNIT_NO[g] ? 'Temaları' : 'Üniteleri');
const unitCount = g => (UNIT_NO[g] ? new Set(UNIT_NO[g]).size : UNITS[g].length);
const GRADE_TEXT = {
  5: 'Geometrik şekiller, doğal sayılar, kesirler, istatistik ve olasılık',
  6: 'Sayılar, cebirsel düşünme ve değişimler, geometri',
  7: 'Sayılar, cebir, dönüşüm ve geometrik nicelikler',
  8: 'Üslü, kareköklü ifadeler ve LGS hazırlığı',
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Ders kitabındaki alt başlıklar (yalnızca gösterim; kayıtlı etkinlikler kısa adı kullanır)
const UNIT_SUB = { 5: { 'Sayılar ve Nicelikler (1)': 'Doğal Sayılar ve İşlemler', 'Sayılar ve Nicelikler (2)': 'Kesirler' } };
const unitLabel = (g, u) => (UNIT_SUB[g] && UNIT_SUB[g][u] ? `${u}: ${UNIT_SUB[g][u]}` : u);
const unitListHTML = g => `<ol class="unit-list">${UNITS[g].map((u, i) =>
  `<li><a href="sinif.html?s=${g}&amp;tema=${encodeURIComponent(u)}"${UNIT_NO[g] ? ` data-no="${UNIT_NO[g][i]}"` : ''} title="${esc(u)}: oyunlar ve kâğıtlar">${esc(unitLabel(g, u))}</a></li>`).join('')}</ol>`;

// ---- Güvenli depolama (gizli pencerede hata vermesin) ----
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

// ---- Üyelik: Supabase (her cihazda çalışan gerçek hesaplar) ----
const CFG = window.HIP_CONFIG || {};
const sb = (window.supabase && CFG.supabaseUrl && CFG.supabaseKey)
  ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

// Supabase'in İngilizce hata mesajlarını Türkçeye çevir
function trError(err) {
  const m = (err && (err.message || err.error_description || String(err))) || '';
  if (/invalid login credentials/i.test(m)) return 'E-posta ya da şifre hatalı.';
  if (/email not confirmed/i.test(m)) return 'Önce e-postana gelen onay bağlantısına tıklaman gerekiyor.';
  if (/already registered|already been registered|user already exists/i.test(m)) return 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.';
  if (/password should be at least|weak password/i.test(m)) return 'Şifren en az 6 karakter olmalı.';
  if (/rate limit|too many|security purposes/i.test(m)) return 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.';
  if (/invalid.*email|unable to validate email/i.test(m)) return 'Geçerli bir e-posta adresi yaz.';
  if (/failed to fetch|network/i.test(m)) return 'İnternet bağlantısı yok gibi görünüyor. Bağlantını kontrol edip tekrar dene.';
  if (/same.*password|different from the old/i.test(m)) return 'Yeni şifren eskisinden farklı olmalı.';
  return 'Bir sorun oluştu, lütfen tekrar dene.';
}

// Uygulama (iOS/Android) içinde adres "capacitor://localhost" olur; e-posta bağlantıları her zaman gerçek siteye gitmeli
const SITE_URL = /^https?:$/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.hostname)
  ? location.origin : (CFG.siteUrl || location.origin);
const IS_APP = !/^https?:$/.test(location.protocol) || !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

const toProfile = user => user ? {
  id: user.id,
  email: user.email,
  name: (user.user_metadata && user.user_metadata.name) || user.email.split('@')[0],
  role: (user.user_metadata && user.user_metadata.role) || 'ogrenci',
  grade: (user.user_metadata && user.user_metadata.grade) || null,
} : null;

const Auth = {
  ready: !!sb,
  // Sayfa hızlı açılsın diye son bilinen profil cihazda tutulur; Supabase oturumu arkada doğrular
  current() { return store.get('hip_profile', null); },
  _save(user) { const p = toProfile(user); p ? store.set('hip_profile', p) : store.del('hip_profile'); return p; },
  _need() { if (!sb) throw new Error('Üyelik sistemi henüz ayarlanmadı.'); },
  async refresh() {
    if (!sb) { store.del('hip_profile'); return null; }
    const { data } = await sb.auth.getSession();
    return this._save(data.session ? data.session.user : null);
  },
  async register({ name, email, password, role, grade }) {
    this._need();
    const { data, error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: {
        data: { name: name.trim(), role, grade: role === 'ogrenci' ? Number(grade) : null },
        emailRedirectTo: SITE_URL + '/index.html',
      },
    });
    if (error) throw new Error(trError(error));
    // Supabase, kayıtlı bir e-postayı güvenlik için hata vermeden "kimliksiz" döndürür
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
      throw new Error('Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.');
    if (!data.session) return { needsConfirm: true };
    return { profile: this._save(data.user) };
  },
  async login(email, password) {
    this._need();
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw new Error(trError(error));
    return this._save(data.user);
  },
  async resetPassword(email) {
    this._need();
    const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: SITE_URL + '/sifre-yenile.html' });
    if (error) throw new Error(trError(error));
  },
  // Hesabı ve tüm bilgileri kalıcı olarak siler (Supabase'deki delete_my_account fonksiyonu)
  async deleteAccount() {
    this._need();
    const { error } = await sb.rpc('delete_my_account');
    if (error) throw new Error(/failed to fetch|network/i.test(error.message || '') ? trError(error) : 'Hesap silinemedi. Lütfen biraz sonra tekrar dene.');
    store.del('hip_profile');
    await sb.auth.signOut({ scope: 'local' }).catch(() => {});
  },
  async updatePassword(password) {
    this._need();
    const { data, error } = await sb.auth.updateUser({ password });
    if (error) throw new Error(trError(error));
    return this._save(data.user);
  },
  async logout() {
    store.del('hip_profile');
    if (sb) await sb.auth.signOut().catch(() => {});
  },
  onChange(fn) {
    if (!sb) return;
    sb.auth.onAuthStateChange((event, session) => { this._save(session ? session.user : null); fn(event); });
  },
};

// ---- Sınıflar ve oyun kayıtları (öğretmenin öğrenci takibi; kurallar: supabase/siniflar.sql) ----
const Classes = {
  async _q(p) { Auth._need(); const { data, error } = await p; if (error) throw error; return data; },
  // Öğretmen
  mine() { return this._q(sb.from('classes').select('id,name,grade,code,created_at').eq('teacher_id', Auth.current().id).order('created_at')); },
  create(name, grade) { return this._q(sb.rpc('create_class', { p_name: name, p_grade: grade || null })); },
  remove(id) { return this._q(sb.from('classes').delete().eq('id', id)); },
  members(classId) { return this._q(sb.from('class_members').select('student_id,student_name,joined_at').eq('class_id', classId).order('student_name')); },
  kick(classId, studentId) { return this._q(sb.from('class_members').delete().eq('class_id', classId).eq('student_id', studentId)); },
  // Kurallar gereği yalnızca öğrencinin sınıfa katıldıktan sonraki kayıtları döner
  plays(userIds) {
    if (!userIds.length) return Promise.resolve([]);
    return this._q(sb.from('plays').select('user_id,game,title,event,score,total,created_at').in('user_id', userIds).order('created_at', { ascending: false }).limit(5000));
  },
  // Öğrenci
  async join(code) {
    Auth._need();
    const { data, error } = await sb.rpc('join_class', { p_code: code });
    if (!error) return data;
    const m = error.message || '';
    if (/KOD_YOK/.test(m)) throw new Error('Bu kodla bir sınıf bulunamadı. Kodu öğretmenine sorup tekrar dene.');
    if (/KENDI_SINIFI/.test(m)) throw new Error('Bu senin kendi sınıfın.');
    throw new Error(trError(error));
  },
  joined() { return this._q(sb.from('class_members').select('class_id,joined_at,classes(name,grade)').eq('student_id', Auth.current().id)); },
  leave(classId) { return this._q(sb.from('class_members').delete().eq('class_id', classId).eq('student_id', Auth.current().id)); },
  // Oyun kaydı: hata olursa oyunu bölmeden sessizce geçer
  track(game, title, event, score, total) {
    if (!sb || !Auth.current()) return;
    const row = { game: String(game).slice(0, 80), title: String(title || '').trim().slice(0, 120), event };
    if (event === 'bitirdi' && Number.isFinite(score) && Number.isFinite(total) && total > 0) Object.assign(row, { score: Math.max(0, Math.round(score)), total: Math.round(total) });
    sb.from('plays').insert(row).then(() => {}, () => {});
  },
};

// ---- Öğrenci: sınıfa katılma penceresi ----
function openJoinClass() {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `
    <div class="modal modal-mint" role="dialog" aria-modal="true" aria-labelledby="joinTitle">
      <div class="modal-body">
        <h3 id="joinTitle">🏫 Sınıfa Katıl</h3>
        <p>Öğretmeninin verdiği <b>6 karakterlik kodu</b> yaz. Katıldıktan sonra öğretmenin, bu sınıfta hangi oyunları oynadığını ve puanlarını görebilir.</p>
        <div class="field">
          <label for="joinCode">Sınıf kodu</label>
          <input class="input join-code" id="joinCode" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ÖR: K7M2QX">
        </div>
        <div class="form-error" id="joinErr" role="alert" hidden></div>
        <div class="modal-actions">
          <button class="btn btn-plain" id="joinCancel">Kapat</button>
          <button class="btn btn-yellow" id="joinOk" style="justify-content:center">Katıl</button>
        </div>
        <div id="joinedList"></div>
      </div>
    </div>`;
  document.body.appendChild(back);
  const $ = s => back.querySelector(s), inp = $('#joinCode'), err = $('#joinErr');
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  $('#joinCancel').addEventListener('click', close);
  back.addEventListener('click', e => { if (e.target === back) close(); });
  inp.addEventListener('input', () => { inp.value = inp.value.toLocaleUpperCase('en').replace(/[^A-Z0-9]/g, ''); err.hidden = true; });

  async function list() {
    try {
      const rows = await Classes.joined();
      $('#joinedList').innerHTML = rows.length ? `<p class="joined-h">Katıldığın sınıflar</p>${rows.map(r => `
        <div class="joined-row"><span>🏫 <b>${esc(r.classes ? r.classes.name : 'Sınıf')}</b>${r.classes && r.classes.grade ? ` · ${r.classes.grade}. sınıf` : ''}</span>
        <button class="link-btn" data-leave="${r.class_id}">Ayrıl</button></div>`).join('')}` : '';
      back.querySelectorAll('[data-leave]').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('Bu sınıftan ayrılmak istiyor musun? Öğretmenin artık oyunlarını göremez.')) return;
        try { await Classes.leave(b.dataset.leave); toast('Sınıftan ayrıldın.'); list(); } catch { toast('Ayrılamadın, internet bağlantını kontrol et.'); }
      }));
    } catch { $('#joinedList').innerHTML = ''; }
  }
  async function join() {
    const code = inp.value.trim();
    if (code.length !== 6) { err.textContent = 'Kod 6 karakter olmalı.'; err.hidden = false; inp.focus(); return; }
    const ok = $('#joinOk'); ok.disabled = true; ok.textContent = 'Katılınıyor…';
    try {
      const c = await Classes.join(code);
      inp.value = ''; toast(`<b>${esc(c.name)}</b> sınıfına katıldın! 🎉`); list();
    } catch (e) { err.textContent = e.message; err.hidden = false; }
    ok.disabled = false; ok.textContent = 'Katıl';
  }
  $('#joinOk').addEventListener('click', join);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') join(); });
  inp.focus();
  list();
}

// ---- Bildirim ----
function toast(html, ms = 3200) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = html;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
}

// ---- Üst çubuk: kullanıcı alanı ----
function renderUserArea() {
  const box = document.getElementById('userArea');
  if (!box) return;
  const u = Auth.current();
  if (!u) {
    box.innerHTML = `<a class="btn-login" href="giris.html"><span aria-hidden="true">👤</span><span class="lbl">Giriş Yap</span></a>`;
    return;
  }
  const first = u.name.split(' ')[0];
  const roleTxt = u.role === 'ogretmen' ? 'Öğretmen' : `${u.grade}. Sınıf Öğrencisi`;
  box.innerHTML = `
    <div class="user-menu">
      <button class="user-chip" id="userChip" aria-haspopup="true" aria-expanded="false">
        <span class="avatar">${esc(first[0].toLocaleUpperCase('tr'))}</span><span class="lbl">${esc(first)}</span>
      </button>
      <div class="user-pop" id="userPop" hidden>
        <p>${esc(u.name)}</p><small>${roleTxt}</small>
        ${u.role === 'ogretmen'
          ? '<a class="pop-link" href="takip.html">📊 Öğrenci Takibi</a>'
          : '<button class="pop-join" id="joinBtn">🏫 Sınıfa Katıl</button>'}
        <button id="logoutBtn">↩ Çıkış Yap</button>
        <a class="pop-link" href="gizlilik.html">🔒 Gizlilik Politikası</a>
        <button class="danger" id="deleteBtn">🗑 Hesabımı Sil</button>
      </div>
    </div>`;
  const chip = document.getElementById('userChip'), pop = document.getElementById('userPop');
  chip.addEventListener('click', e => {
    e.stopPropagation();
    pop.hidden = !pop.hidden; chip.setAttribute('aria-expanded', String(!pop.hidden));
  });
  document.addEventListener('click', e => { if (!pop.contains(e.target)) { pop.hidden = true; chip.setAttribute('aria-expanded','false'); } });
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await Auth.logout(); renderUserArea(); renderPersonal(); toast('Çıkış yapıldı. Görüşmek üzere!');
  });
  document.getElementById('deleteBtn').addEventListener('click', () => { pop.hidden = true; confirmDelete(u); });
  const joinBtn = document.getElementById('joinBtn');
  if (joinBtn) joinBtn.addEventListener('click', () => { pop.hidden = true; openJoinClass(); });
}

// ---- Hesap silme onayı (uygulama mağazalarının zorunlu tuttuğu özellik) ----
function confirmDelete(u) {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `
    <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="delTitle" aria-describedby="delDesc">
      <div class="modal-body">
        <h3 id="delTitle">Hesabın silinsin mi?</h3>
        <p id="delDesc"><b>${esc(u.email)}</b> hesabın, adın ve sınıf bilgin kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
        <label class="check" for="delSure"><input type="checkbox" id="delSure"> Evet, hesabımı kalıcı olarak silmek istiyorum.</label>
        <div class="form-error" id="delErr" role="alert" hidden></div>
        <div class="modal-actions">
          <button class="btn btn-plain" id="delCancel">Vazgeç</button>
          <button class="btn btn-danger" id="delOk" disabled>Hesabı Sil</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(back);
  const ok = back.querySelector('#delOk'), sure = back.querySelector('#delSure');
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  sure.addEventListener('change', () => { ok.disabled = !sure.checked; });
  back.querySelector('#delCancel').addEventListener('click', close);
  back.addEventListener('click', e => { if (e.target === back) close(); });
  ok.addEventListener('click', async () => {
    ok.disabled = true; ok.textContent = 'Siliniyor…';
    try {
      await Auth.deleteAccount();
      close(); renderUserArea(); renderPersonal();
      toast('Hesabın ve bilgilerin silindi.');
    } catch (err) {
      const box = back.querySelector('#delErr'); box.textContent = err.message; box.hidden = false;
      ok.disabled = false; ok.textContent = 'Hesabı Sil';
    }
  });
  back.querySelector('#delCancel').focus();
}

// ---- Kişiye özel karşılama ----
function renderPersonal() {
  const w = document.getElementById('welcome');
  const u = Auth.current();
  document.querySelectorAll('.grade-card').forEach(c => c.classList.toggle('mine', !!u && String(u.grade) === c.dataset.grade));
  if (!w) return;
  if (!u) { w.hidden = true; return; }
  w.hidden = false;
  w.innerHTML = `<span class="avatar">${esc(u.name[0].toLocaleUpperCase('tr'))}</span> Hoş geldin, ${esc(u.name.split(' ')[0])}!`;
}

// ---- 10 Kasım anma görseli ----
// Her yıl 10 Kasım'da ana sayfaya gelen herkese (üye olsun olmasın) oturum başına bir kez gösterilir; sağ üstteki çarpıyla kapanır.
function turkFlagSVG() {
  // Türk bayrağı (oranlar yaklaşık: yükseklik G=200, genişlik 1,5G)
  const cx = 177, cy = 100, R = 25, r = R * 0.382;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI + i * Math.PI / 5;           // bir köşe hilale (sola) bakar
    const rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="flag" viewBox="0 0 300 200" aria-hidden="true">
    <rect width="300" height="200" fill="#E30A17"/>
    <circle cx="100" cy="100" r="50" fill="#fff"/>
    <circle cx="112.5" cy="100" r="40" fill="#E30A17"/>
    <polygon points="${pts.join(' ')}" fill="#fff"/>
  </svg>`;
}

function showMemorial(force) {
  const now = new Date();
  const isDay = now.getMonth() === 10 && now.getDate() === 10;
  const u = Auth.current();
  if (!force && !isDay) return;
  const key = `hip_10kasim_${now.getFullYear()}_${u ? u.id : 'misafir'}`;
  if (!force) { try { if (sessionStorage.getItem(key)) return; } catch {} }
  if (document.querySelector('.memorial-back')) return;
  const years = now.getFullYear() - 1938;

  const back = document.createElement('div');
  back.className = 'memorial-back';
  back.innerHTML = `
    <div class="memorial" role="dialog" aria-modal="true" aria-labelledby="memTitle">
      <button class="memorial-close" id="memClose" aria-label="Kapat">✕</button>
      ${turkFlagSVG()}
      <p class="mem-date">10 KASIM 1938 · 09.05</p>
      <h2 id="memTitle">Ulu Önder<br><span>Mustafa Kemal Atatürk</span></h2>
      <p class="mem-text">Aramızdan ayrılışının ${years}. yılında<br>saygı, minnet ve özlemle anıyoruz.</p>
      <blockquote>“Benim naçiz vücudum elbet bir gün toprak olacaktır, fakat Türkiye Cumhuriyeti ilelebet payidar kalacaktır.”</blockquote>
      <p class="mem-sign">Hipotenüs ailesi</p>
    </div>`;
  document.body.appendChild(back);
  document.body.style.overflow = 'hidden';
  const close = () => {
    try { sessionStorage.setItem(key, '1'); } catch {}
    back.remove(); document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  back.querySelector('#memClose').addEventListener('click', close);
  back.querySelector('#memClose').focus();
}

// ---- Ana sayfa kurulumu ----
function initHome() {
  // Menüdeki ünite listeleri
  document.querySelectorAll('.has-dd').forEach(li => {
    const g = li.dataset.grade;
    li.querySelector('.dropdown').innerHTML = `<div class="dd-links">
        <a href="sinif.html?s=${g}" class="dd-main">📚 ${g}. Sınıf sayfasını aç</a>
        <a href="kazanimlar.html?sinif=${g}">📋 Kazanımlar (öğretmen)</a>
      </div><h4>${g}. Sınıf ${UNIT_TITLE(g)}</h4>${unitListHTML(g)}`;
    li.querySelector(':scope > a').setAttribute('href', `sinif.html?s=${g}`);
  });

  // Sınıflar: 2×2 kartlar; her kart o sınıfın sayfasını açar
  const grid = document.getElementById('gradeGrid');
  if (grid) {
    grid.className = 'grade-board';
    const GRADES = [5, 6, 7, 8];
    const COLORS = { 5: 'm', 6: 'l', 7: 'l', 8: 'm' };  // dama tahtası gibi
    const nGames = g => (typeof BUILTIN_GAMES !== 'undefined' ? BUILTIN_GAMES.filter(x => x.grades.includes(g)).length : 0);
    grid.innerHTML = GRADES.map(g => `
      <a class="grade-card ${COLORS[g]}" href="sinif.html?s=${g}">
        <span class="num">${g}</span><h3>${g}. Sınıf</h3>
        <span class="tag">${unitCount(g)} ${UNIT_WORD(g)}${nGames(g) ? ` · ${nGames(g)} oyun` : ''}</span>
        <span class="more">Sınıfa git →</span>
      </a>`).join('');
  }

  // Hamburger menü
  const menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  const setMenu = open => { nav.classList.toggle('show', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? '✕' : '☰'; };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('show')));

  // Dar ekran / dokunmatik: sınıfa ilk dokunuş ünite listesini açar
  const narrow = () => matchMedia('(max-width:1240px)').matches || matchMedia('(hover:none)').matches;
  document.querySelectorAll('.has-dd > a').forEach(a => a.addEventListener('click', e => {
    if (!narrow()) return;
    e.preventDefault();
    const li = a.parentElement, open = li.classList.contains('open');
    document.querySelectorAll('.has-dd.open').forEach(o => o.classList.remove('open'));
    li.classList.toggle('open', !open);
    a.setAttribute('aria-expanded', String(!open));
  }));
  nav.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a && !a.parentElement.classList.contains('has-dd')) setMenu(false);
  });

  // Alt gezinme çubuğunda bulunulan bölümü işaretle
  const links = [...document.querySelectorAll('.bottom-nav a')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const mark = () => {
    let cur = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = s;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur.id));
  };
  addEventListener('scroll', mark, { passive: true }); mark();

  // Girişten yeni gelindiyse karşıla
  const flash = sessionStorage.getItem('hip_flash');
  if (flash) { sessionStorage.removeItem('hip_flash'); setTimeout(() => toast(flash), 300); }

  renderUserArea();
  renderPersonal();

  // Oturumu Supabase ile doğrula (başka cihazdan çıkış, süresi dolan oturum vb.)
  const rerender = () => { renderUserArea(); renderPersonal(); };
  Auth.refresh().then(() => { rerender(); showMemorial(); }).catch(() => {});
  Auth.onChange(event => {
    rerender();
    if (event === 'SIGNED_IN' && /type=signup|access_token/.test(location.hash)) {
      const u = Auth.current();
      if (u) toast(`E-postan onaylandı. Aramıza hoş geldin, <b>${esc(u.name.split(' ')[0])}</b>! 🎉`);
      try { history.replaceState(null, '', location.pathname); } catch {}
    }
  });
}

// ---- Uygulama olarak yükleme (PWA) ----
let deferredPrompt = null;
addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  document.querySelectorAll('.install-btn').forEach(b => b.hidden = false);
});
addEventListener('appinstalled', () => {
  deferredPrompt = null;
  document.querySelectorAll('.install-btn').forEach(b => b.hidden = true);
  toast('<b>Hipotenüs</b> ana ekranına eklendi!');
});
document.addEventListener('click', async e => {
  const b = e.target.closest('.install-btn'); if (!b || !deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice; deferredPrompt = null;
  document.querySelectorAll('.install-btn').forEach(x => x.hidden = true);
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
