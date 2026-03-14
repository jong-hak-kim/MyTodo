// ================================================
// settings.js — 개인설정 (닉네임, 사진, 테마, 알림, 언어)
// ================================================

// ── 번역 데이터 ──
const I18N = {
  ko: {
    appTitle: '할 일 목록',
    appSub: '로그인하면 어떤 기기에서든 동기화됩니다',
    login: '로그인', signup: '회원가입',
    email: '이메일', password: '비밀번호', passwordConfirm: '비밀번호 확인',
    googleLogin: 'Google로 계속하기',
    logout: '로그아웃',
    addPlaceholder: '새로운 할 일을 입력하세요...',
    addBtn: '추가', deadline: '마감일',
    total: '전체', done: '완료', overdue: '기한 초과',
    progress: '진행률',
    filterAll: '전체', filterActive: '진행 중', filterDone: '완료',
    filterToday: '오늘', filterOverdue: '기한 초과',
    sectionAll: '모든 할 일', sectionActive: '진행 중인 할 일',
    sectionDone: '완료된 할 일', sectionToday: '오늘의 할 일',
    sectionOverdue: '기한 초과 항목',
    addDate: '+ 날짜 추가', dateChange: '날짜 변경',
    deleteConfirm: '이 항목을 삭제할까요?',
    empty: '표시할 항목이 없습니다',
    loading: '불러오는 중...',
    settingsTitle: '개인설정',
    settingsClose: '닫기',
    nickname: '닉네임',
    nicknamePlaceholder: '표시될 이름을 입력하세요',
    profilePhoto: '프로필 사진',
    photoUrlPlaceholder: '이미지 URL을 입력하세요',
    photoPreview: '미리보기',
    theme: '테마',
    themeDark: '다크 모드',
    themeLight: '라이트 모드',
    notifications: '알림',
    notifEnable: '마감일 알림 받기',
    notifGranted: '알림 허용됨',
    notifDenied: '알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.',
    language: '언어',
    save: '저장',
    saved: '저장되었습니다 ✓',
    todayLabel: (y, m, d, day) => `${y}년 ${m}월 ${d}일 ${day}요일`,
    days: ['일','월','화','수','목','금','토'],
    todayTag: (label) => `오늘 · ${label}`,
    overdueTag: (label) => `기한 초과 · ${label}`,
  },
  en: {
    appTitle: 'To-Do List',
    appSub: 'Sign in to sync across all your devices',
    login: 'Login', signup: 'Sign Up',
    email: 'Email', password: 'Password', passwordConfirm: 'Confirm Password',
    googleLogin: 'Continue with Google',
    logout: 'Logout',
    addPlaceholder: 'Add a new task...',
    addBtn: 'Add', deadline: 'Deadline',
    total: 'Total', done: 'Done', overdue: 'Overdue',
    progress: 'Progress',
    filterAll: 'All', filterActive: 'Active', filterDone: 'Done',
    filterToday: 'Today', filterOverdue: 'Overdue',
    sectionAll: 'All Tasks', sectionActive: 'Active Tasks',
    sectionDone: 'Completed Tasks', sectionToday: "Today's Tasks",
    sectionOverdue: 'Overdue Tasks',
    addDate: '+ Add date', dateChange: 'Change date',
    deleteConfirm: 'Delete this task?',
    empty: 'No tasks to show',
    loading: 'Loading...',
    settingsTitle: 'Settings',
    settingsClose: 'Close',
    nickname: 'Nickname',
    nicknamePlaceholder: 'Enter your display name',
    profilePhoto: 'Profile Photo',
    photoUrlPlaceholder: 'Enter image URL',
    photoPreview: 'Preview',
    theme: 'Theme',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    notifications: 'Notifications',
    notifEnable: 'Receive deadline reminders',
    notifGranted: 'Notifications enabled',
    notifDenied: 'Notifications blocked. Please allow in browser settings.',
    language: 'Language',
    save: 'Save',
    saved: 'Saved ✓',
    todayLabel: (y, m, d, day) => `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]}, ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${d}, ${y}`,
    days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    todayTag: (label) => `Today · ${label}`,
    overdueTag: (label) => `Overdue · ${label}`,
  }
};

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

// Google 계정이면 사진 섹션 숨기기
  const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
  const photoSection = document.getElementById('settings-photo-section');
  if (photoSection) photoSection.style.display = isGoogle ? 'none' : 'none';

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

// ── 프로필 사진 미리보기 ──
function updatePhotoPreview(url) {
  const prev = document.getElementById('photo-preview');
  if (!prev) return;
  if (url) {
    prev.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<span>?</span>'" referrerpolicy="no-referrer" />`;
  } else {
    const user = auth.currentUser;
    prev.innerHTML = `<span>${(user?.email || '?')[0].toUpperCase()}</span>`;
  }
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

  const nickname = document.getElementById('settings-nickname-input').value.trim();
  const photoURL = document.getElementById('settings-photo-input').value.trim();
  const btn = document.getElementById('settings-save-btn');

  try {
    await user.updateProfile({
      displayName: nickname || user.displayName,
      photoURL: photoURL || user.photoURL,
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
