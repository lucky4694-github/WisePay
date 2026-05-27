// 수정: 2026-05-27 16:44 — 알림 개별 삭제 · 전체 삭제 버튼 추가
'use strict';
const NOTIF_KEY = 'kyuyo_notifications';

function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch(e) { return []; }
}
function saveNotificationsData(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
}

// id가 같은 알림이 이미 있으면 추가하지 않음
function addNotification(id, level, msgKR, msgJP) {
  const list = loadNotifications();
  if(list.find(n => n.id === id)) { updateNotifBadge(); return; }
  list.unshift({ id, level, msgKR, msgJP, createdAt: new Date().toISOString(), read: false });
  saveNotificationsData(list);
  updateNotifBadge();
}

function markAllNotifsRead() {
  const list = loadNotifications().map(n => ({...n, read: true}));
  saveNotificationsData(list);
  updateNotifBadge();
}

function deleteNotification(id) {
  saveNotificationsData(loadNotifications().filter(n => n.id !== id));
  updateNotifBadge();
  renderNotificationsPage();
}

function deleteAllNotifications() {
  const jp = LANG === 'JP';
  if(!confirm(jp ? '通知をすべて削除しますか？' : '알림을 모두 삭제하시겠습니까?')) return;
  saveNotificationsData([]);
  updateNotifBadge();
  renderNotificationsPage();
}

function getUnreadCount() {
  return loadNotifications().filter(n => !n.read).length;
}

function updateNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if(!badge) return;
  const count = getUnreadCount();
  badge.textContent = count > 9 ? '9+' : String(count);
  badge.style.display = count > 0 ? '' : 'none';
}

function renderNotificationsPage() {
  const jp = LANG === 'JP';
  const container = document.getElementById('notif-list');
  if(!container) return;
  markAllNotifsRead();
  const list = loadNotifications();
  if(!list.length) {
    container.innerHTML = `
      <div style="padding:70px 20px;text-align:center;color:var(--text3);">
        <div style="font-size:40px;margin-bottom:14px;">🔔</div>
        <div style="font-size:14px;">${jp ? '通知はありません' : '알림이 없습니다'}</div>
      </div>`;
    return;
  }
  const levelIcon = { warn:'⚠️', info:'ℹ️', error:'🚨' };
  const levelColor = { warn:'#fef3c7', info:'#eff6ff', error:'#fee2e2' };
  container.innerHTML = `
    <div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);">
      <button class="btn btn-sm" onclick="markAllNotifsRead();renderNotificationsPage();" style="font-size:12px;">
        ${jp ? '全て既読' : '모두 읽음'}
      </button>
      <button class="btn btn-sm" onclick="deleteAllNotifications();" style="font-size:12px;background:#fff7ed;color:#9a3412;border-color:#fed7aa;">
        ${jp ? '全て削除' : '전체 삭제'}
      </button>
    </div>` +
    list.map(n => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border2);background:${n.read ? 'transparent' : 'var(--accent2)'};">
        <div style="font-size:20px;line-height:1.4;">${levelIcon[n.level] || 'ℹ️'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;color:var(--text);line-height:1.6;">${jp ? n.msgJP : n.msgKR}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:5px;">${new Date(n.createdAt).toLocaleString(jp ? 'ja-JP' : 'ko-KR')}</div>
        </div>
        ${n.read ? '' : '<div style="width:8px;height:8px;border-radius:50%;background:#ef4444;margin-top:6px;flex-shrink:0;"></div>'}
        <button onclick="deleteNotification('${n.id}')" style="flex-shrink:0;background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0 2px;line-height:1;" title="${jp ? '削除' : '삭제'}">✕</button>
      </div>`).join('');
}
