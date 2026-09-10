/**
 * DishaSetu — Notification Bell & Drawer Panel Manager
 */

async function fetchNotifications() {
  const badge = document.getElementById('nav-unread-count');
  if (!badge) return;

  try {
    const res = await fetch('/api/notifications', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      if (data.unreadCount > 0) {
        badge.innerText = data.unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
  }
}

async function toggleNotificationDrawer() {
  let drawer = document.getElementById('notification-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'notification-drawer';
    drawer.className = 'glass-panel';
    drawer.style.cssText = `
      position: fixed; top: 70px; right: 20px; width: 360px; max-height: 480px;
      overflow-y: auto; z-index: 1500; padding: 1.2rem; border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: none;
    `;
    document.body.appendChild(drawer);
  }

  if (drawer.style.display === 'block') {
    drawer.style.display = 'none';
    return;
  }

  const lang = getCurrentLanguage();

  try {
    const res = await fetch('/api/notifications', { credentials: 'include' });
    const data = await res.json();

    if (!data.success || !data.notifications || data.notifications.length === 0) {
      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h4 style="color:#fff; margin:0;">🔔 Notifications</h4>
          <button onclick="toggleNotificationDrawer()" style="background:none; border:none; color:#fff; cursor:pointer;">×</button>
        </div>
        <p style="color:var(--text-muted); font-size:0.88rem; text-align:center; padding:1rem 0;">No active notifications.</p>
      `;
    } else {
      const listHtml = data.notifications.map(n => {
        const title = getLocalized(n.title, lang);
        const msg = getLocalized(n.message, lang);
        return `
          <div style="padding: 0.8rem 0; border-bottom: 1px solid var(--border-light);">
            <h5 style="color:#fff; font-size:0.92rem; margin-bottom:0.2rem;">${title}</h5>
            <p style="color:var(--text-muted); font-size:0.82rem; margin-bottom:0.4rem;">${msg}</p>
            ${n.targetUrl ? `<a href="${n.targetUrl}" class="btn btn-outline" style="padding:0.2rem 0.6rem; font-size:0.75rem;">Apply Now →</a>` : ''}
          </div>
        `;
      }).join('');

      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h4 style="color:#fff; margin:0;">🔔 Notifications</h4>
          <button onclick="markAllNotificationsRead()" style="background:none; border:none; color:var(--primary-cyan); font-size:0.78rem; cursor:pointer;">Mark all read</button>
        </div>
        <div>${listHtml}</div>
      `;
    }

    drawer.style.display = 'block';
  } catch (err) {
    console.error('Open Notification Drawer Error:', err);
  }
}

async function markAllNotificationsRead() {
  try {
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
    const badge = document.getElementById('nav-unread-count');
    if (badge) badge.style.display = 'none';
    const drawer = document.getElementById('notification-drawer');
    if (drawer) drawer.style.display = 'none';
  } catch (err) {
    console.error('Mark Read Error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();
});
