/* ================= Hipotenüs oyun şablonları ================= */

const TEMPLATES = {
  quiz: {
    name: 'Çoktan Seçmeli Test', short: 'Test', icon: '📝', color: 'm',
    desc: 'Her soruda şıklardan doğru olanı seç.',
    min: 1, max: 30, unitWord: 'soru',
  },
  match: {
    name: 'Eşleştirme', short: 'Eşleştirme', icon: '🔗', color: 'l',
    desc: 'Soldaki her kartı sağdaki eşiyle buluştur.',
    min: 3, max: 12, unitWord: 'çift',
  },
  truefalse: {
    name: 'Doğru mu Yanlış mı?', short: 'Doğru/Yanlış', icon: '⚡', color: 'y',
    desc: 'Süre bitmeden ifadenin doğru mu yanlış mı olduğuna karar ver.',
    min: 3, max: 30, unitWord: 'ifade', seconds: 10,
  },
};

// ---- Matematik gösterimi: {3/4} → kesir, 2^5 → üs, kok(9) → √9 ----
function mathFmt(text) {
  let s = esc(text == null ? '' : String(text));
  s = s.replace(/\{\s*([^{}\/]+?)\s*\/\s*([^{}\/]+?)\s*\}/g,
    '<span class="frac"><span class="fn">$1</span><span class="fd">$2</span></span>');
  s = s.replace(/\^\(([^()]+)\)/g, '<sup>$1</sup>');
  s = s.replace(/\^(-?[0-9a-zA-Z]+)/g, '<sup>$1</sup>');
  s = s.replace(/\bkok\(([^()]+)\)/gi, '<span class="sqrt">√<span class="rad">$1</span></span>');
  s = s.replace(/\n/g, '<br>');
  return s;
}

const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtTime = ms => { const s = Math.round(ms / 1000); return s < 60 ? `${s} sn` : `${Math.floor(s / 60)} dk ${s % 60} sn`; };
const shortName = name => { const p = String(name || '').trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toLocaleUpperCase('tr')}.` : (p[0] || 'Oyuncu'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- İçerik doğrulama (editör ve oynatıcı ortak kullanır) ----
function validateContent(template, content) {
  const t = TEMPLATES[template];
  if (!t) return 'Geçersiz şablon.';
  const items = (content && content.items) || [];
  if (items.length < t.min) return `En az ${t.min} ${t.unitWord} eklemelisin.`;
  if (items.length > t.max) return `En fazla ${t.max} ${t.unitWord} ekleyebilirsin.`;
  for (let i = 0; i < items.length; i++) {
    const it = items[i], n = i + 1;
    if (template === 'quiz') {
      if (!String(it.q || '').trim()) return `${n}. sorunun metni boş.`;
      const opts = (it.options || []).map(o => String(o || '').trim());
      if (opts.filter(Boolean).length < 2) return `${n}. soruda en az 2 şık olmalı.`;
      if (opts.some(o => !o)) return `${n}. sorudaki boş şıkları doldur ya da sil.`;
      if (!(it.correct >= 0 && it.correct < opts.length)) return `${n}. soruda doğru şıkkı işaretle.`;
    } else if (template === 'match') {
      if (!String(it.left || '').trim() || !String(it.right || '').trim()) return `${n}. çiftin iki tarafını da doldur.`;
    } else if (template === 'truefalse') {
      if (!String(it.text || '').trim()) return `${n}. ifade boş.`;
      if (typeof it.answer !== 'boolean') return `${n}. ifadenin doğru mu yanlış mı olduğunu seç.`;
    }
  }
  return null;
}

// ---- Veri işlemleri (Supabase) ----
const DB = {
  ok() { return !!sb; },
  async list({ grade, template, mine, limit = 60 } = {}) {
    let q = sb.from('activities').select('id,title,template,grade,unit,owner_name,owner_id,play_count,is_public,created_at').order('created_at', { ascending: false }).limit(limit);
    if (grade) q = q.eq('grade', grade);
    if (template) q = q.eq('template', template);
    if (mine) q = q.eq('owner_id', mine); else q = q.eq('is_public', true);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  async get(id) {
    const { data, error } = await sb.from('activities').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async save(act) {
    const row = { title: act.title, template: act.template, grade: act.grade, unit: act.unit || null, content: act.content, is_public: act.is_public };
    if (act.id) {
      row.updated_at = new Date().toISOString();
      const { data, error } = await sb.from('activities').update(row).eq('id', act.id).select('id').single();
      if (error) throw error;
      return data.id;
    }
    row.owner_name = act.owner_name || '';
    const { data, error } = await sb.from('activities').insert(row).select('id').single();
    if (error) throw error;
    return data.id;
  },
  async remove(id) { const { error } = await sb.from('activities').delete().eq('id', id); if (error) throw error; },
  async played(id) { try { await sb.rpc('increment_play', { aid: id }); } catch {} },
  async board(id) {
    const { data, error } = await sb.from('scores').select('player_name,score,total,time_ms,user_id').eq('activity_id', id).order('score', { ascending: false }).order('time_ms', { ascending: true }).limit(10);
    if (error) throw error;
    return data;
  },
  async addScore(id, name, score, total, time_ms) {
    const { error } = await sb.from('scores').insert({ activity_id: id, player_name: name, score, total, time_ms });
    if (error) throw error;
  },
};

// ============ OYUNCU (tüm şablonlar) ============
// root: oyunun çizileceği eleman, act: {template, title, content}, opts: {onFinish(result), preview}
function playActivity(root, act, opts = {}) {
  const engine = { quiz: playQuiz, match: playMatch, truefalse: playTrueFalse }[act.template];
  root.innerHTML = '';
  root.className = 'game-stage';
  const started = performance.now();
  const done = (score, total) => {
    const result = { score, total, time_ms: Math.round(performance.now() - started) };
    showResult(root, act, result, opts);
    if (opts.onFinish) opts.onFinish(result);
  };
  engine(root, act.content, done);
}

function progressBar(i, n) {
  return `<div class="g-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${i}">
    <div class="g-progress-fill" style="width:${(i / n) * 100}%"></div><span>${i} / ${n}</span></div>`;
}

// ---- Çoktan seçmeli test ----
function playQuiz(root, content, done) {
  const items = shuffle(content.items);
  let i = 0, score = 0;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const show = () => {
    const it = items[i];
    const order = shuffle(it.options.map((o, k) => k));
    root.innerHTML = `${progressBar(i, items.length)}
      <div class="g-card g-question">${mathFmt(it.q)}</div>
      <div class="g-options">${order.map((k, n) => `<button class="g-opt c${n % 4}" data-k="${k}"><b>${letters[n]}</b><span>${mathFmt(it.options[k])}</span></button>`).join('')}</div>`;
    const btns = [...root.querySelectorAll('.g-opt')];
    btns[0].focus({ preventScroll: true });
    btns.forEach(b => b.addEventListener('click', async () => {
      btns.forEach(x => x.disabled = true);
      const ok = Number(b.dataset.k) === it.correct;
      if (ok) score++;
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) btns.find(x => Number(x.dataset.k) === it.correct).classList.add('right');
      await sleep(ok ? 700 : 1400);
      i++; i < items.length ? show() : done(score, items.length);
    }));
  };
  show();
}

// ---- Eşleştirme ----
function playMatch(root, content, done) {
  const pairs = content.items.map((p, k) => ({ ...p, k }));
  const left = shuffle(pairs), right = shuffle(pairs);
  let sel = null, matched = 0, firstTry = 0;
  const missed = new Set();
  root.innerHTML = `${progressBar(0, pairs.length)}
    <p class="g-hint">Soldan bir kart seç, sonra sağdan eşini seç.</p>    <div class="g-match">
      <div class="g-col">${left.map(p => `<button class="g-tile L" data-k="${p.k}">${mathFmt(p.left)}</button>`).join('')}</div>
      <div class="g-col">${right.map(p => `<button class="g-tile R" data-k="${p.k}">${mathFmt(p.right)}</button>`).join('')}</div>
    </div>`;
  const bar = () => { root.querySelector('.g-progress').outerHTML = progressBar(matched, pairs.length); };
  root.querySelectorAll('.g-tile').forEach(t => t.addEventListener('click', async () => {
    if (t.classList.contains('done')) return;
    if (!sel || sel.classList.contains(t.classList.contains('L') ? 'L' : 'R')) {
      root.querySelectorAll('.g-tile.sel').forEach(x => x.classList.remove('sel'));
      sel = t; t.classList.add('sel'); return;
    }
    const a = sel, b = t; sel = null;
    a.classList.remove('sel');
    if (a.dataset.k === b.dataset.k) {
      a.classList.add('done'); b.classList.add('done'); a.disabled = b.disabled = true;
      matched++; if (!missed.has(a.dataset.k)) firstTry++;
      bar();
      if (matched === pairs.length) { await sleep(500); done(firstTry, pairs.length); }
    } else {
      const lk = (a.classList.contains('L') ? a : b).dataset.k;
      missed.add(lk);
      a.classList.add('shake', 'wrong'); b.classList.add('shake', 'wrong');
      await sleep(900); a.classList.remove('shake', 'wrong'); b.classList.remove('shake', 'wrong');
    }
  }));
}

// ---- Doğru mu yanlış mı (süreli) ----
function playTrueFalse(root, content, done) {
  const items = shuffle(content.items);
  const secs = TEMPLATES.truefalse.seconds;
  let i = 0, score = 0, timer = null, locked = false;
  const show = () => {
    locked = false;
    const it = items[i];
    root.innerHTML = `${progressBar(i, items.length)}
      <div class="g-timer"><div class="g-timer-fill" style="animation-duration:${secs}s"></div></div>
      <div class="g-card g-question tf">${mathFmt(it.text)}</div>
      <div class="g-tf">
        <button class="g-opt tf-yes" data-v="1"><b>✓</b><span>Doğru</span></button>
        <button class="g-opt tf-no" data-v="0"><b>✗</b><span>Yanlış</span></button>
      </div>`;
    const btns = [...root.querySelectorAll('.g-opt')];
    const answer = async (v, btn) => {
      if (locked) return; locked = true; clearTimeout(timer);
      root.querySelector('.g-timer-fill').style.animationPlayState = 'paused';
      btns.forEach(x => x.disabled = true);
      const ok = v === it.answer;
      if (ok) score++;
      if (btn) btn.classList.add(ok ? 'right' : 'wrong');
      btns.find(x => (x.dataset.v === '1') === it.answer).classList.add('right');
      if (!btn) root.querySelector('.g-question').insertAdjacentHTML('beforeend', '<div class="g-timeout">⏰ Süre doldu!</div>');
      await sleep(ok ? 700 : 1400);
      i++; i < items.length ? show() : (document.removeEventListener('keydown', onKey), done(score, items.length));
    };
    btns.forEach(b => b.addEventListener('click', () => answer(b.dataset.v === '1', b)));
    timer = setTimeout(() => answer(null, null), secs * 1000);
  };
  const onKey = e => {
    if (!root.isConnected) return document.removeEventListener('keydown', onKey);
    const k = e.key.toLocaleLowerCase('tr');
    if (k === 'd' || k === 'arrowleft') root.querySelector('.tf-yes:not(:disabled)')?.click();
    if (k === 'y' || k === 'arrowright') root.querySelector('.tf-no:not(:disabled)')?.click();
  };
  document.addEventListener('keydown', onKey);
  show();
}

// ---- Bitiş ekranı ----
function showResult(root, act, r, opts) {
  const pct = r.score / r.total;
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
  const msg = stars === 3 ? 'Harika iş çıkardın!' : stars === 2 ? 'Çok iyi gidiyorsun!' : stars === 1 ? 'Güzel başlangıç, bir daha dene!' : 'Pes etmek yok, tekrar dene!';
  root.innerHTML = `
    <div class="g-result">
      <div class="g-stars" aria-label="${stars} yıldız">${[1, 2, 3].map(n => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</div>
      <h2>${msg}</h2>
      <div class="g-score"><b>${r.score}</b><span>/ ${r.total}</span></div>
      <p class="g-time">⏱ ${fmtTime(r.time_ms)}</p>
      <div class="g-save" id="gSave"></div>
      <div class="btns g-result-btns">
        <button class="btn btn-yellow" id="gAgain">↻ Tekrar Oyna</button>
        ${opts.preview ? '' : '<a class="btn btn-lilac" href="oyunlar.html">🎲 Diğer Oyunlar</a>'}
      </div>
    </div>`;
  root.querySelector('#gAgain').addEventListener('click', () => playActivity(root, act, opts));
  if (stars >= 2) confetti();
}

function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const colors = ['#9EE6C9', '#C8A2E8', '#FFD84D', '#2E9E78', '#7B4FA8'];
  for (let n = 0; n < 70; n++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[n % colors.length];
    p.style.animationDelay = (Math.random() * 0.6) + 's';
    p.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3800);
}

// ---- Hazır etkileşimli oyunlar ----
const BUILTIN_GAMES = [
  { href: 'aci-ustasi.html', icon: '📐', type: 'Sürükle-Bırak', title: 'Açı Ustası: Verilmeyen Açıyı Bul', text: 'Doğru açı ve tam açıda renkli parçalarla', grades: [5, 6, 7], color: 'y' },
  { href: 'pergel.html', icon: '⭕', type: 'Sürükle-Bırak', title: 'Pergel ile Çember Çiz', text: 'Pergeli döndür, yarıçap ve çapı keşfet', grades: [5, 6, 7], color: 'm' },
];
function builtinCard(g) {
  return `<a class="card act-card ${g.color}" href="${g.href}">
    <div class="act-top"><span class="act-ic" aria-hidden="true">${g.icon}</span><span class="act-type">${g.type}</span></div>
    <h3>${g.title}</h3>
    <p>${g.text}</p>
    <div class="act-meta"><span class="tag">${g.grades[0]}–${g.grades[g.grades.length - 1]}. Sınıf</span><span class="plays">✨ Yeni</span></div>
  </a>`;
}

// ---- Etkinlik kartı (listeler için) ----
function activityCard(a) {
  const t = TEMPLATES[a.template] || TEMPLATES.quiz;
  return `<a class="card act-card ${t.color}" href="oyun.html?id=${encodeURIComponent(a.id)}">
    <div class="act-top"><span class="act-ic" aria-hidden="true">${t.icon}</span><span class="act-type">${t.short}</span></div>
    <h3>${esc(a.title)}</h3>
    <p>${a.unit ? esc(a.unit) : 'Genel'}${a.owner_name ? ` · ${esc(shortName(a.owner_name))}` : ''}</p>
    <div class="act-meta">${a.grade ? `<span class="tag">${a.grade}. Sınıf</span>` : ''}<span class="plays">▶ ${a.play_count || 0}</span>${a.is_public === false ? '<span class="tag priv">Gizli</span>' : ''}</div>
  </a>`;
}

// ---- Alt sayfalar için ortak başlatma ----
function initPage() {
  let flash = null;
  try { flash = sessionStorage.getItem('hip_flash'); sessionStorage.removeItem('hip_flash'); } catch {}
  if (flash) setTimeout(() => toast(flash), 300);
  renderUserArea();
  Auth.refresh().then(renderUserArea).catch(() => {});
  Auth.onChange(() => renderUserArea());
}
