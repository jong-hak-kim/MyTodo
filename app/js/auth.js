// ================================================
// auth.js — 로그인 / 회원가입 / 로그아웃 처리
// ================================================

let authMode = 'login';

// ── 탭 전환 (로그인 ↔ 회원가입) ──
function switchTab(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active', i === (mode === 'login' ? 0 : 1))
  );
  document.getElementById('pw-confirm').style.display = mode === 'signup' ? '' : 'none';
  document.getElementById('email-btn').textContent = mode === 'login' ? I18N[currentLang].login : I18N[currentLang].signup;
  document.getElementById('forgot-pw-btn').style.display = mode === 'login' ? 'inline-block' : 'none';
  clearAuthError();
}

// ── 이메일 로그인 / 회원가입 ──
function emailAuth() {
  const email = document.getElementById('email-input').value.trim();
  const pw = document.getElementById('pw-input').value;
  const pw2 = document.getElementById('pw-confirm').value;

  clearAuthError();

  // 기본 유효성 검사
  if (!email || !pw) {
    showAuthError('이메일과 비밀번호를 입력하세요.');
    return;
  }
  if (!isValidEmail(email)) {
    showAuthError('올바른 이메일 형식이 아닙니다.');
    return;
  }

  if (authMode === 'signup') {
    if (pw !== pw2) { showAuthError('비밀번호가 일치하지 않습니다.'); return; }
    if (pw.length < 8) { showAuthError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (!/\d/.test(pw)) { showAuthError('비밀번호에 숫자를 포함해주세요.'); return; }
    auth.createUserWithEmailAndPassword(email, pw)
      .then(result => {
        result.user.sendEmailVerification();
        auth.signOut();
        showAuthError('인증 메일을 발송했습니다. 메일함을 확인해주세요! 📧');
      })
      .catch(e => showAuthError(firebaseErrMsg(e.code)));
  } else {
    auth.signInWithEmailAndPassword(email, pw)
      .catch(e => showAuthError(firebaseErrMsg(e.code)));
  }
}

// ── Google 소셜 로그인 ──
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  auth.signInWithPopup(provider)
    .then(result => {
      if (result.user) showApp(result.user);
    })
    .catch(e => showAuthError(firebaseErrMsg(e.code)));
}

let lastSentTime = 0;
const COOLDOWN = 60000; // 60초 쿨다운

function resetPassword() {
  const email = document.getElementById('email-input').value.trim();
  if (!email) { showAuthError('이메일을 입력하세요.'); return; }

  const now = Date.now();
  if (now - lastSentTime < COOLDOWN) {
    const left = Math.ceil((COOLDOWN - (now - lastSentTime)) / 1000);
    const btn = document.getElementById('forgot-pw-btn');
    btn.textContent = `${left}초 후 재시도`;
    btn.disabled = true;
    const timer = setInterval(() => {
      const remaining = Math.ceil((COOLDOWN - (Date.now() - lastSentTime)) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        btn.textContent = '비밀번호 찾기';
        btn.disabled = false;
      } else {
        btn.textContent = `${remaining}초 후 재시도`;
      }
    }, 1000);
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      lastSentTime = Date.now();
      showAuthError('비밀번호 재설정 메일을 발송했습니다 📧');
    })
    .catch(e => showAuthError(firebaseErrMsg(e.code)));
}

let lastVerifySentTime = 0;

function resendVerification() {
  const user = pendingVerificationUser || auth.currentUser;
  if (!user) { showAuthError('다시 로그인 후 시도해주세요.'); return; }

  const now = Date.now();
  if (now - lastVerifySentTime < COOLDOWN) {
    const left = Math.ceil((COOLDOWN - (now - lastVerifySentTime)) / 1000);
    showAuthError(`${left}초 후에 다시 시도해주세요.`);
    const btn = document.getElementById('resend-verify-btn');
    btn.disabled = true;
    const timer = setInterval(() => {
      const remaining = Math.ceil((COOLDOWN - (Date.now() - lastVerifySentTime)) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        btn.textContent = '인증 메일 재발송';
        btn.disabled = false;
      } else {
        btn.textContent = `${remaining}초 후 재시도`;
      }
    }, 1000);
    return;
  }

  user.sendEmailVerification()
    .then(() => {
      lastVerifySentTime = Date.now();
      showAuthError('인증 메일을 재발송했습니다 📧');
    })
    .catch(e => showAuthError(firebaseErrMsg(e.code)));
}

// ── 로그아웃 ──
function logout() {
  if (typeof unsubscribeTodos === 'function') unsubscribeTodos();
  auth.signOut();
}

// ── 헬퍼 ──
function showAuthError(msg) {
  document.getElementById('auth-error').textContent = msg;
}
function clearAuthError() {
  document.getElementById('auth-error').textContent = '';
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function firebaseErrMsg(code) {
  const map = {
    'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 틀렸습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 시도하세요.',
    'auth/network-request-failed': '네트워크 오류가 발생했습니다.',
  };
  return map[code] || '오류가 발생했습니다. 다시 시도해주세요.';
}

// 엔터키 지원
document.getElementById('pw-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') emailAuth();
});
document.getElementById('email-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') emailAuth();
});
