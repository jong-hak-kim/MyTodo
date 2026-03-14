// ================================================
// settings.js — 개인설정 (닉네임, 사진, 테마, 알림, 언어)
// ================================================

let currentLang = localStorage.getItem('lang') || 'ko';
let currentTheme = localStorage.getItem('theme') || 'dark';

function t(key) { return I18N[currentLang][key] || key; }

// ── 테마 적용 ──
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.body.setAttribute('data-theme', theme);
}

// ── 언어 적용 ──
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  updateUIText();
}

function updateUIText() {
  const L = I18N[currentLang];
  // 로그인 화면
  safeText('auth-logo-text', L.appTitle);
  safeText('auth-sub-text', L.appSub);
  safeAttr('email-input', 'placeholder', L.email);
  safeAttr('pw-input', 'placeholder', L.password);
  safeAttr('pw-confirm', 'placeholder', L.passwordConfirm);
  safeText('email-btn', document.getElementById('email-btn')?.textContent === I18N['ko'].login || document.getElementById('email-btn')?.textContent === I18N['en'].login ? L.login : L.signup);
  safeText('google-btn-text', L.googleLogin);
  // 앱
  safeText('logout-btn-text', L.logout);
  safeAttr('todo-input', 'placeholder', L.addPlaceholder);
  safeText('add-btn-text', L.addBtn);
  safeText('deadline-label', L.deadline);
  safeText('stat-lbl-total', L.total);
  safeText('stat-lbl-done', L.done);
  safeText('stat-lbl-overdue', L.overdue);
  safeText('progress-label-text', L.progress);
  safeText('filter-all', L.filterAll);
  safeText('filter-active', L.filterActive);
  safeText('filter-done', L.filterDone);
  safeText('filter-today', L.filterToday);
  safeText('filter-overdue', L.filterOverdue);
  // 설정 모달
  safeText('settings-title', L.settingsTitle);
  safeText('settings-close-text', L.settingsClose);
  safeText('settings-nickname-label', L.nickname);
  safeAttr('settings-nickname-input', 'placeholder', L.nicknamePlaceholder);
  safeText('settings-photo-label', L.profilePhoto);
  safeAttr('settings-photo-input', 'placeholder', L.photoUrlPlaceholder);
  safeText('settings-photo-preview-btn', L.photoPreview);
  safeText('settings-theme-label', L.theme);
  safeText('settings-notif-label', L.notifications);
  safeText('settings-notif-text', L.notifEnable);
  safeText('settings-lang-label', L.language);
  safeText('settings-save-btn', L.save);
  // 날짜 헤더 재설정
  if (typeof updateTodayLabel === 'function') updateTodayLabel();
  // 투두 목록 재렌더링
  if (typeof render === 'function') render();
}

function safeText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function safeAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, val);
}

// ── 설정 모달 열기/닫기 ──
function openSettings() {
  const user = auth.currentUser;
  if (!user) return;

  // 현재 값 채우기
  document.getElementById('settings-nickname-input').value = user.displayName || '';

  // 테마 토글
  document.getElementById('theme-toggle').checked = currentTheme === 'light';

  // 알림 상태
  updateNotifStatus();

  // 언어
  document.getElementById('lang-ko').classList.toggle('active', currentLang === 'ko');
  document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');

  document.getElementById('settings-modal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}

// ── 알림 상태 업데이트 ──
function updateNotifStatus() {
  const statusEl = document.getElementById('notif-status');
  if (!statusEl) return;
  if (!('Notification' in window)) {
    statusEl.textContent = '이 브라우저는 알림을 지원하지 않습니다.';
    return;
  }
  if (Notification.permission === 'granted') {
    statusEl.textContent = t('notifGranted');
    statusEl.style.color = 'var(--green)';
  } else if (Notification.permission === 'denied') {
    statusEl.textContent = t('notifDenied');
    statusEl.style.color = 'var(--red)';
  } else {
    statusEl.textContent = '';
  }
}

async function requestNotifications() {
  if (!('Notification' in window)) return;
  const perm = await Notification.requestPermission();
  updateNotifStatus();
  if (perm === 'granted') {
    new Notification(currentLang === 'ko' ? '알림이 설정되었습니다 ✓' : 'Notifications enabled ✓', {
      body: currentLang === 'ko' ? '마감일 알림을 받을 수 있습니다.' : 'You will receive deadline reminders.',
    });
  }
}

// ── 저장 ──
async function saveSettings() {
  const user = auth.currentUser;
  if (!user) return;

  const nickname = document.getElementById('settings-nickname-input').value.trim();  const btn = document.getElementById('settings-save-btn');

  try {
    await user.updateProfile({
      displayName: nickname || user.displayName,
    });

    // 아바타 업데이트
    const av = document.getElementById('user-avatar');
    if (av) {
      av.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" referrerpolicy="no-referrer" />`
        : (user.email || '?')[0].toUpperCase();
    }

    btn.textContent = t('saved');
    setTimeout(() => { btn.textContent = t('save'); }, 2000);
  } catch (e) {
    console.error('설정 저장 오류:', e);
  }
}

// ── 초기화 ──
function initSettings() {
  applyTheme(currentTheme);
  applyLang(currentLang);
}

initSettings();
