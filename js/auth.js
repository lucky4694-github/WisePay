'use strict';
const AUTH_KEY = 'wisepay_auth';
const AUTH_PW = '1111';

function checkAuth() {
  if (localStorage.getItem(AUTH_KEY) === '1') {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('layout').style.display = '';
    return true;
  }
  _showLogin();
  return false;
}

function _showLogin() {
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('layout').style.display = 'none';
  setTimeout(() => document.getElementById('login-pw').focus(), 50);
}

function doLogin() {
  const pw = document.getElementById('login-pw').value;
  const err = document.getElementById('login-err');
  if (pw === AUTH_PW) {
    localStorage.setItem(AUTH_KEY, '1');
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('layout').style.display = '';
    initApp();
  } else {
    err.textContent = '비밀번호가 틀렸습니다';
    document.getElementById('login-pw').value = '';
    document.getElementById('login-pw').focus();
  }
}

function loginOnEnter(e) {
  if (e.key === 'Enter') doLogin();
}
