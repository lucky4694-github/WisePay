// 수정: 2026-05-28 17:23 — 로그인 기능 전면 개편: GAS users 시트 연동, SHA-256 해시, 세션 관리, 권한 제어
'use strict';

const AUTH_SESS_KEY = 'wisepay_session';
const AUTH_ID_KEY   = 'wisepay_saved_id';

let currentUser = null; // { id, name, role, sessionType }

const VIEWER_PAGES = new Set(['payroll', 'annual']);

async function _sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function _getStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.sessionType === 'persistent' && s.expires && Date.now() < s.expires) return s;
      localStorage.removeItem(AUTH_SESS_KEY);
    }
  } catch(e) { localStorage.removeItem(AUTH_SESS_KEY); }
  try {
    const raw = sessionStorage.getItem(AUTH_SESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) { sessionStorage.removeItem(AUTH_SESS_KEY); }
  return null;
}

function _storeSession(user) {
  if (user.sessionType === 'persistent') {
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    localStorage.setItem(AUTH_SESS_KEY, JSON.stringify({ ...user, expires: midnight.getTime() }));
  } else {
    sessionStorage.setItem(AUTH_SESS_KEY, JSON.stringify(user));
  }
}

function _clearSession() {
  localStorage.removeItem(AUTH_SESS_KEY);
  sessionStorage.removeItem(AUTH_SESS_KEY);
  currentUser = null;
}

function checkAuth() {
  const sess = _getStoredSession();
  if (sess) {
    currentUser = sess;
    LANG = sess.role === 'admin' ? 'KR' : 'JP';
    applyLang();
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('layout').style.display = '';
    renderNavForRole();
    return true;
  }
  _showLogin();
  return false;
}

function _showLogin() {
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('layout').style.display = 'none';
  const savedId = localStorage.getItem(AUTH_ID_KEY);
  if (savedId) {
    document.getElementById('login-id').value = savedId;
    document.getElementById('login-save-id').checked = true;
    setTimeout(() => document.getElementById('login-pw').focus(), 50);
  } else {
    setTimeout(() => document.getElementById('login-id').focus(), 50);
  }
}

async function doLogin() {
  const id     = (document.getElementById('login-id').value || '').trim();
  const pw     = document.getElementById('login-pw').value || '';
  const saveId = document.getElementById('login-save-id').checked;
  const err    = document.getElementById('login-err');
  const btn    = document.getElementById('login-btn');

  if (!id || !pw) {
    err.textContent = 'IDとパスワードを入力してください / ID와 비밀번호를 입력해 주세요';
    return;
  }

  err.textContent = '';
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = '...';

  try {
    const hash   = await _sha256(pw);
    const url    = (typeof gasUrl !== 'undefined' && gasUrl) ? gasUrl : GAS_URL;
    const resp   = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ type: 'verifyLogin', id, hash }),
    });
    const result = await resp.json();

    if (result.ok && result.user) {
      if (saveId) localStorage.setItem(AUTH_ID_KEY, id);
      else        localStorage.removeItem(AUTH_ID_KEY);

      _storeSession(result.user);
      currentUser = result.user;
      LANG = result.user.role === 'admin' ? 'KR' : 'JP';
      applyLang();

      document.getElementById('login-overlay').style.display = 'none';
      document.getElementById('layout').style.display = '';
      renderNavForRole();
      initApp();
    } else {
      err.textContent = 'IDまたはパスワードが違います / ID 또는 비밀번호가 틀렸습니다';
      document.getElementById('login-pw').value = '';
      document.getElementById('login-pw').focus();
    }
  } catch(e) {
    err.textContent = 'ログインエラー / 로그인 오류가 발생했습니다';
    console.error('Login error:', e);
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
}

function loginOnEnter(e) {
  if (e.key === 'Enter') doLogin();
}

function doLogout() {
  _clearSession();
  location.reload();
}

function canAccessPage(pageId) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return VIEWER_PAGES.has(pageId);
}

function showAccessDenied() {
  document.getElementById('modal-access-denied').style.display = 'flex';
}

function closeAccessDenied() {
  document.getElementById('modal-access-denied').style.display = 'none';
}

function renderNavForRole() {
  if (!currentUser || currentUser.role === 'admin') return;
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    const page = item.dataset.page;
    if (!page || VIEWER_PAGES.has(page)) return;
    if (item.querySelector('.nav-lock')) return;
    const lock = document.createElement('span');
    lock.className = 'nav-lock';
    lock.textContent = '🔒';
    item.appendChild(lock);
  });
}
