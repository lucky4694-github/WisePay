'use strict';

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function showToast(msg, type = '') {
  let el = document.getElementById('showToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'showToast';
    el.className = 'showToast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'showToast show ' + type;
  setTimeout(() => {
    el.className = 'showToast ' + type;
  }, 2600);
}

function fmt(n) {
  return Math.round(n).toLocaleString('ja-JP');
}
