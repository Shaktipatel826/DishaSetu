/**
 * DishaSetu — Save Bookmarking & Smart Deadline Reminder Dialog Module
 */

function openSaveReminderModal(itemType, itemId) {
  const userStr = localStorage.getItem('dishasetu_user');
  if (!userStr) {
    alert('Please login to save opportunities and set deadline reminders.');
    window.location.href = 'login.html';
    return;
  }

  let modal = document.getElementById('reminder-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reminder-modal';
    modal.className = 'glass-panel';
    modal.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90%; max-width: 420px; z-index: 2200; padding: 1.8rem;
      border-radius: var(--radius-md); box-shadow: 0 0 40px rgba(6, 182, 212, 0.3);
    `;
    document.body.appendChild(modal);
  }

  let backdrop = document.getElementById('reminder-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'reminder-backdrop';
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 2199;
    `;
    backdrop.onclick = closeSaveReminderModal;
    document.body.appendChild(backdrop);
  }

  const lang = getCurrentLanguage();

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
      <h3 style="color: #fff; font-size: 1.2rem; margin: 0;">🔖 Save & Set Deadline Reminder</h3>
      <button onclick="closeSaveReminderModal()" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">×</button>
    </div>
    
    <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.2rem;">
      Choose when you would like to be notified before the application deadline:
    </p>

    <div style="display: flex; flex-direction: column; gap: 0.7rem; margin-bottom: 1.5rem;">
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="3_days" checked> 🔔 3 days before deadline (Recommended)
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="7_days"> 🔔 7 days before deadline
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="1_day"> 🔔 1 day before deadline
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="deadline_day"> ⏰ On deadline day
      </label>
      <label style="display:flex; align-items:center; gap:0.6rem; color:var(--text-muted); font-size:0.9rem; cursor:pointer;">
        <input type="radio" name="reminder-pref" value="none"> 🔕 Save without reminder
      </label>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 0.8rem;">
      <button class="btn btn-outline" style="padding:0.5rem 1rem;" onclick="closeSaveReminderModal()">Cancel</button>
      <button class="btn btn-primary" style="padding:0.5rem 1.2rem;" onclick="executeSave('${itemType}', '${itemId}')">Save Bookmark</button>
    </div>
  `;

  modal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeSaveReminderModal() {
  const modal = document.getElementById('reminder-modal');
  const backdrop = document.getElementById('reminder-backdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}

async function executeSave(itemType, itemId) {
  const selectedPref = document.querySelector('input[name="reminder-pref"]:checked')?.value || '3_days';

  try {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType, itemId, reminderPreference: selectedPref }),
      credentials: 'include'
    });

    const data = await res.json();
    closeSaveReminderModal();

    if (data.success) {
      const lang = getCurrentLanguage();
      alert(t('savedSuccess', lang));
      // Optionally update bookmark button icon
      const saveBtn = document.getElementById(`save-btn-${itemId}`);
      if (saveBtn) {
        saveBtn.innerText = '🔖 ' + t('btnSaved', lang);
        saveBtn.classList.remove('btn-outline');
        saveBtn.classList.add('btn-primary');
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error('Save Item Error:', err);
  }
}
