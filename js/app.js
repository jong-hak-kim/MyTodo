// ================================================
// app.js — 투두 CRUD, 렌더링, 필터
// ================================================

const KR_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

let todos = [];
let filter = 'all';
let _unsubscribe = null;

// 날짜 헤더 설정
const now = new Date();
updateTodayLabel();
  `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${KR_DAYS[now.getDay()]}요일`;

// ── Firestore 실시간 구독 ──
function startTodoListener(uid) {
  // 이전 구독 해제
  if (_unsubscribe) _unsubscribe();

  _unsubscribe = db
    .collection('users').doc(uid)
    .collection('todos')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snap => {
        todos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        render();
      },
      err => {
        // 권한 오류 등 구독 실패 시 안내
        console.error('Firestore 구독 오류:', err);
        document.getElementById('todo-list').innerHTML =
          `<div class="empty"><span>⚠️</span>데이터를 불러올 수 없습니다.<br>Firestore 보안 규칙을 확인하세요.</div>`;
      }
    );
}

// auth.js의 logout()에서 호출
function unsubscribeTodos() {
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
}

// ── Firestore 컬렉션 참조 ──
function todosRef() {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  return db.collection('users').doc(user.uid).collection('todos');
}

// ── CRUD ──
function addTodo() {
  const inp = document.getElementById('todo-input');
  const text = inp.value.trim();
  if (!text) { inp.focus(); return; }

  const date = document.getElementById('new-date').value;

  todosRef().add({
    text,
    done: false,
    date: date || '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('추가 오류:', err));

  inp.value = '';
}

function toggleTodo(id, current) {
  todosRef().doc(id)
    .update({ done: !current })
    .catch(err => console.error('업데이트 오류:', err));
}

function removeTodo(id) {
  if (!confirm('이 항목을 삭제할까요?')) return;
  todosRef().doc(id)
    .delete()
    .catch(err => console.error('삭제 오류:', err));
}

function updateDate(id, val) {
  todosRef().doc(id)
    .update({ date: val })
    .catch(err => console.error('날짜 업데이트 오류:', err));
}

// ── 날짜 표시 ──
function getDateInfo(dateStr, done) {
  if (!dateStr) return { cls: '', label: '날짜 없음', icon: '📅' };
  const d = new Date(dateStr + 'T00:00:00');
  const label = `${d.getMonth() + 1}/${d.getDate()} (${KR_DAYS[d.getDay()]})`;
  if (done) return { cls: '', label, icon: '📅' };
  if (dateStr < todayStr) return { cls: 'overdue', label: `기한 초과 · ${label}`, icon: '⚠️' };
  if (dateStr === todayStr) return { cls: 'today', label: `오늘 · ${label}`, icon: '🟢' };
  return { cls: 'upcoming', label, icon: '📅' };
}

// ── 날짜 인라인 편집 ──
function openDatePicker(id) {
  document.getElementById('tag-' + id).style.display = 'none';
  const dp = document.getElementById('dp-' + id);
  dp.style.display = 'inline-block';
  dp.focus();
}
function closeDatePicker(id) {
  setTimeout(() => {
    const tag = document.getElementById('tag-' + id);
    const dp = document.getElementById('dp-' + id);
    if (tag) tag.style.display = '';
    if (dp) dp.style.display = 'none';
  }, 180);
}

// ── 필터 ──
function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ── 렌더링 ──
function render() {
  const list = document.getElementById('todo-list');

  const filtered = todos.filter(t => {
    if (filter === 'done') return t.done;
    if (filter === 'active') return !t.done;
    if (filter === 'today') return t.date === todayStr;
    if (filter === 'overdue') return !t.done && t.date && t.date < todayStr;
    return true;
  });

  const sectionLabels = {
    all: '모든 할 일',
    active: '진행 중인 할 일',
    done: '완료된 할 일',
    today: '오늘의 할 일',
    overdue: '기한 초과 항목',
  };
  document.getElementById('section-lbl').textContent = sectionLabels[filter] || '';

  if (!filtered.length) {
    list.innerHTML = `<div class="empty"><span>✓</span>표시할 항목이 없습니다</div>`;
  } else {
    list.innerHTML = filtered.map(t => renderItem(t)).join('');
  }

  updateStats();
}

function renderItem(t) {
  const di = getDateInfo(t.date, t.done);
  const dateTag = t.date
    ? `<span class="date-tag ${di.cls}" onclick="openDatePicker('${t.id}')" title="날짜 변경">${di.icon} ${di.label}</span>`
    : `<span class="date-tag" onclick="openDatePicker('${t.id}')">+ 날짜 추가</span>`;

  return `
    <div class="todo-item ${t.done ? 'done' : ''}" id="item-${t.id}">
      <div class="cb-wrap">
        <input type="checkbox" class="cb" ${t.done ? 'checked' : ''}
          onchange="toggleTodo('${t.id}', ${t.done})" />
      </div>
      <div class="todo-body">
        <div class="todo-text">${escHtml(t.text)}</div>
        <div class="todo-footer">
          <span id="tag-${t.id}">${dateTag}</span>
          <input type="date" class="inline-dp" id="dp-${t.id}"
            value="${t.date || ''}"
            onchange="updateDate('${t.id}', this.value)"
            onblur="closeDatePicker('${t.id}')" />
        </div>
      </div>
      <button class="del-btn" onclick="removeTodo('${t.id}')" title="삭제">×</button>
    </div>`;
}

function updateStats() {
  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const overdue = todos.filter(t => !t.done && t.date && t.date < todayStr).length;
  const pct = total ? Math.round(done / total * 100) : 0;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-overdue').textContent = overdue;
  document.getElementById('prog-bar').style.width = pct + '%';
  document.getElementById('prog-pct').textContent = pct + '%';
}

// ── 유틸 ──
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 엔터키로 추가
document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});


// ── 설정에서 호출되는 핸들러 ──
function handleThemeToggle(el) {
  const theme = el.checked ? 'light' : 'dark';
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-mode-text');
  if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
  if (text) text.textContent = theme === 'light' ? (currentLang === 'ko' ? '라이트 모드' : 'Light Mode') : (currentLang === 'ko' ? '다크 모드' : 'Dark Mode');
  applyTheme(theme);
}

function handleLangChange(lang) {
  ['ko','en','ja','zh','es','fr','de'].forEach(l => {
    const btn = document.getElementById('lang-' + l);
    if (btn) btn.classList.toggle('active', lang === l);
  });
  applyLang(lang);
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('settings-modal')) closeSettings();
}

function updateTodayLabel() {
  const L = I18N[currentLang];
  const n = new Date();
  const label = L.todayLabel(n.getFullYear(), n.getMonth()+1, n.getDate(), L.days[n.getDay()]);
  const el = document.getElementById('today-str');
  if (el) el.textContent = label;
}

function showApp(user) {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  const av = document.getElementById('user-avatar');
  av.innerHTML = user.photoURL
    ? `<img src="${user.photoURL}" referrerpolicy="no-referrer" />`
    : escHtml((user.email || '?')[0].toUpperCase());
  startTodoListener(user.uid);
}

function showAuth() {
  document.getElementById('auth-screen').style.display = '';
  document.getElementById('app-screen').style.display = 'none';
}

auth.onAuthStateChanged(user => {
  if (user) {
    showApp(user);
  } else {
    showAuth();
  }
});
