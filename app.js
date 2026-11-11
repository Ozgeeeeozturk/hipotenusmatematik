/* ================= Hipotenüs ortak betik ================= */

// ---- Ünite / tema listeleri (tek kaynak: menü, sınıf kartları ve editör buradan oluşur) ----
// 5, 6 ve 7. sınıflar: Türkiye Yüzyılı Maarif Modeli temaları, MEB'in resmi sırasıyla (tymm.meb.gov.tr, 2026-2027)
// 8. sınıf: 2018 öğretim programı üniteleri
const UNITS = {
  5: ['Sayılar ve Nicelikler (1)','Sayılar ve Nicelikler (2)','İşlemlerle Cebirsel Düşünme','Geometrik Şekiller',
      'Geometrik Nicelikler','İstatistiksel Araştırma Süreci','Veriden Olasılığa'],
  6: ['Sayılar ve Nicelikler (1)','Sayılar ve Nicelikler (2)','İşlemlerle Cebirsel Düşünme ve Değişimler','Geometrik Şekiller',
      'Geometrik Nicelikler','İstatistiksel Araştırma Süreci','Veriden Olasılığa'],
  7: ['Sayılar ve Nicelikler (1)','Sayılar ve Nicelikler (2)','İşlemlerle Cebirsel Düşünme ve Değişimler','Dönüşüm',
      'Geometrik Nicelikler (1)','Geometrik Nicelikler (2)','Geometrik Şekiller','İstatistiksel Araştırma Süreci',
      'Veriden Olasılığa'],
  8: ['Çarpanlar ve Katlar','Üslü İfadeler','Kareköklü İfadeler','Veri Analizi','Basit Olayların Olasılığı',
      'Cebirsel İfadeler ve Özdeşlikler','Doğrusal Denklemler','Eşitsizlikler','Üçgenler','Eşlik ve Benzerlik',
      'Dönüşüm Geometrisi','Geometrik Cisimler'],
};
// Resmi tema numaraları: Maarif Modeli'nde bazı temalar iki bölüm hâlinde aynı numarayı taşır
const UNIT_NO = {
  5: ['1', '1', '2', '3', '4', '5', '6'],
  6: ['1', '1', '2', '3', '4', '5', '6'],
  7: ['1', '1', '2', '3', '4', '4', '5', '6', '7'],
};
const UNIT_WORD = g => (UNIT_NO[g] ? 'tema' : 'ünite');
const UNIT_TITLE = g => (UNIT_NO[g] ? 'Temaları' : 'Üniteleri');
const unitCount = g => (UNIT_NO[g] ? new Set(UNIT_NO[g]).size : UNITS[g].length);
const GRADE_TEXT = {
  5: 'Sayılar ve nicelikler, cebirsel düşünme, veriden olasılığa',
  6: 'Sayılar, cebirsel düşünme ve değişimler, geometri',
  7: 'Sayılar, cebir, dönüşüm ve geometrik nicelikler',
  8: 'Üslü, kareköklü ifadeler ve LGS hazırlığı',
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unitListHTML = g => `<ol class="unit-list">${UNITS[g].map((u, i) =>
  `<li><a href="#"${UNIT_NO[g] ? ` data-no="${UNIT_NO[g][i]}"` : ''}>${esc(u)}</a></li>`).join('')}</ol>`;

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
    li.querySelector('.dropdown').innerHTML = `<h4>${g}. Sınıf ${UNIT_TITLE(g)}</h4>${unitListHTML(g)}`;
  });

  // Sınıflar: bir dörtgenin içinde 2×2 eş kare. Dokunulan karenin temaları,
  // o karenin bulunduğu satırın hemen altında açılır (ok, dokunulan kareyi gösterir).
  const grid = document.getElementById('gradeGrid');
  if (grid) {
    grid.className = 'grade-board';
    const GRADES = [5, 6, 7, 8];
    const ORDER = { 5: 1, 6: 2, 7: 4, 8: 5 };           // 1. satır: 5-6, 2. satır: 7-8
    const COLORS = { 5: 'm', 6: 'l', 7: 'l', 8: 'm' };  // dama tahtası gibi
    grid.innerHTML = GRADES.map(g => `
      <button class="grade-card ${COLORS[g]}" data-grade="${g}" style="order:${ORDER[g]}" aria-expanded="false" aria-controls="gradeUnits">
        <span class="num">${g}</span><h3>${g}. Sınıf</h3>
        <span class="tag">${unitCount(g)} ${UNIT_WORD(g)}</span>
        <span class="more">${UNIT_TITLE(g)} ▾</span>
      </button>`).join('') + '<div class="grade-units" id="gradeUnits" hidden></div>';
    const panel = document.getElementById('gradeUnits');
    grid.addEventListener('click', e => {
      const card = e.target.closest('.grade-card'); if (!card) return;
      const open = card.getAttribute('aria-expanded') === 'true';
      grid.querySelectorAll('.grade-card').forEach(c => {
        c.setAttribute('aria-expanded', 'false');
        c.querySelector('.more').textContent = UNIT_TITLE(c.dataset.grade) + ' ▾';
      });
      if (open) { panel.hidden = true; return; }
      const g = Number(card.dataset.grade);
      card.setAttribute('aria-expanded', 'true');
      card.querySelector('.more').textContent = 'Gizle ▴';
      panel.style.order = ORDER[g] <= 2 ? 3 : 6;
      panel.style.setProperty('--arrow', ORDER[g] % 3 === 1 ? '25%' : '75%');
      panel.innerHTML = `<h4>${g}. Sınıf ${UNIT_TITLE(g)}</h4>${unitListHTML(g)}`;
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
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
