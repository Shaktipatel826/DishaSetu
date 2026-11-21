# DishaSetu — Part 6: Frontend Administrator Portal HTML Templates

## File: admin-dashboard.html
- **Path:** /public/admin-dashboard.html
- **Purpose:** Admin control center with live database statistics and opportunity CRUD table

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-closing" style="margin-bottom: 0.4rem;">Admin Control Console</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">DishaSetu Administration</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Manage student opportunities, government schemes, student submissions, and student directory.</p>
      </div>

      <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
        <a href="admin-submissions.html" class="btn btn-outline" style="border-color: #4ade80; color: #4ade80;">
          📥 Review Submissions (<span id="btn-pending-count">0</span>)
        </a>
        <a href="admin-students.html" class="btn btn-outline">
          👥 Registered Students
        </a>
        <button class="btn btn-primary" onclick="openCreateOpportunityModal()">+ Add Opportunity</button>
        <button class="btn btn-scheme" onclick="openCreateSchemeModal()">+ Add Govt Scheme</button>
      </div>
    </div>

    <!-- Live Database Stats Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 3rem;">
      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Registered Students</div>
        <div id="stat-students" style="font-size: 2.2rem; font-weight: 800; color: var(--primary-cyan); margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Total Opportunities</div>
        <div id="stat-opps" style="font-size: 2.2rem; font-weight: 800; color: #38bdf8; margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Government Schemes</div>
        <div id="stat-schemes" style="font-size: 2.2rem; font-weight: 800; color: var(--scheme-amber); margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Pending Submissions</div>
        <div id="stat-pending" style="font-size: 2.2rem; font-weight: 800; color: #facc15; margin-top: 0.3rem;">0</div>
      </div>

      <div class="glass-panel" style="padding: 1.4rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Approved & Live</div>
        <div id="stat-approved" style="font-size: 2.2rem; font-weight: 800; color: #4ade80; margin-top: 0.3rem;">0</div>
      </div>
    </div>

    <!-- Admin Manage Opportunities Table -->
    <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
        <h3 style="color: #fff; font-size: 1.3rem; margin: 0;">🎓 Student Opportunities Management</h3>
        <span style="font-size: 0.85rem; color: var(--text-muted);">Toggle checkbox to show item on front-page ticker</span>
      </div>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; color: var(--text-main); font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-muted);">
              <th style="padding: 0.8rem;">Title</th>
              <th style="padding: 0.8rem;">Type</th>
              <th style="padding: 0.8rem;">Last Date</th>
              <th style="padding: 0.8rem;">Latest Ticker</th>
              <th style="padding: 0.8rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="admin-opps-list">
            <!-- Dynamically Populated -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    let loadedOpportunities = [];

    async function loadAdminStats() {
      try {
        // Fetch dashboard statistics from real backend endpoint
        const resStats = await fetch('/api/admin/dashboard-stats', { credentials: 'include' });
        const dataStats = await resStats.json();
        if (dataStats.success) {
          const s = dataStats.stats;
          document.getElementById('stat-students').innerText = s.totalStudents || 0;
          document.getElementById('stat-opps').innerText = s.totalOpportunities || 0;
          document.getElementById('stat-schemes').innerText = s.totalSchemes || 0;
          document.getElementById('stat-pending').innerText = s.pendingSubmissions || 0;
          document.getElementById('stat-approved').innerText = s.approvedSubmissions || 0;
          document.getElementById('btn-pending-count').innerText = s.pendingSubmissions || 0;
        }

        const resOpp = await fetch('/api/opportunities');
        const dataOpp = await resOpp.json();
        if (dataOpp.success) {
          loadedOpportunities = dataOpp.opportunities || [];
          renderAdminOppsList(loadedOpportunities);
        }
      } catch (err) {
        console.error('Admin Load Error:', err);
      }
    }

    function renderAdminOppsList(items) {
      const tbody = document.getElementById('admin-opps-list');
      if (!tbody || !items) return;

      tbody.innerHTML = items.map(op => {
        const titleEn = op.title ? (op.title.en || op.title) : '';
        const titleHi = op.title ? (op.title.hi || '') : '';
        const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString('en-IN') : 'N/A';

        return `
          <tr style="border-bottom: 1px solid var(--border-light);">
            <td style="padding: 0.8rem;">
              <strong style="color:#fff;">${titleEn}</strong>
              ${titleHi && titleHi !== titleEn ? `<br><span style="font-size:0.8rem; color:var(--text-muted);">${titleHi}</span>` : ''}
            </td>
            <td style="padding: 0.8rem;"><span class="card-badge badge-open">${op.type}</span></td>
            <td style="padding: 0.8rem; color:#f87171;">${lastDateStr}</td>
            <td style="padding: 0.8rem;">
              <input type="checkbox" ${op.showInLatestUpdates ? 'checked' : ''} onchange="toggleTickerFlag('${op._id}', this.checked)">
              <span style="font-size:0.8rem; margin-left:4px; color:${op.showInLatestUpdates ? 'var(--primary-teal)' : 'var(--text-muted)'};">${op.showInLatestUpdates ? 'Active' : 'Hidden'}</span>
            </td>
            <td style="padding: 0.8rem; text-align: right;">
              <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: var(--primary-teal); margin-right: 4px;" onclick="openEditOpportunityModal('${op._id}')">Edit</button>
              <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: #f87171;" onclick="deleteOpportunity('${op._id}')">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    async function toggleTickerFlag(id, show) {
      try {
        await fetch(`/api/opportunities/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showInLatestUpdates: show }),
          credentials: 'include'
        });
        loadAdminStats();
      } catch (err) {
        console.error('Toggle Error:', err);
      }
    }

    async function deleteOpportunity(id) {
      if (!confirm('Are you sure you want to delete this opportunity?')) return;
      try {
        await fetch(`/api/opportunities/${id}`, { method: 'DELETE', credentials: 'include' });
        loadAdminStats();
      } catch (err) {
        console.error('Delete Error:', err);
      }
    }

    function openCreateOpportunityModal() {
      const title = prompt('Opportunity Title *\n[ Type ANY custom title, e.g., University of Allahabad Debate Competition 2026 ]:', 'University of Allahabad Debate Competition 2026');
      if (!title || !title.trim()) return;

      const type = prompt('Type (Scholarship, Quiz Competition, Hackathon, Essay Competition, Competitive Exam, Skill Development Program, Prize Opportunity, Internship):', 'Quiz Competition');
      const applyUrl = prompt('Official Application Link (applyUrl):', 'https://mygov.in');
      const prizeAmount = prompt('Prize / Financial Aid Amount (Optional, e.g. ₹50,000):', '₹10,000');
      const lastDateInput = prompt('Last Application Date (YYYY-MM-DD):', '2026-10-30');

      if (title && applyUrl) {
        fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            type: type || 'Opportunity',
            applyUrl: applyUrl.trim(),
            prizeAmount: prizeAmount ? prizeAmount.trim() : '',
            lastDate: lastDateInput ? new Date(lastDateInput) : new Date('2026-10-30'),
            showInLatestUpdates: true
          }),
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Opportunity created successfully!');
            loadAdminStats();
          } else {
            alert(data.message);
          }
        });
      }
    }

    function openEditOpportunityModal(id) {
      const op = loadedOpportunities.find(o => o._id === id);
      if (!op) return;

      const currentTitle = typeof op.title === 'object' ? (op.title.en || op.title.hi || '') : op.title;
      const newTitle = prompt('Edit Opportunity Title *\n[ Type ANY custom title ]:', currentTitle);
      if (!newTitle || !newTitle.trim()) return;

      const newType = prompt('Edit Opportunity Type:', op.type || 'Opportunity');
      const newApplyUrl = prompt('Edit Official Application Link:', op.applyUrl || '');
      const newPrize = prompt('Edit Prize / Financial Aid Amount:', op.prizeAmount || '');
      const defaultDateStr = op.lastDate ? new Date(op.lastDate).toISOString().split('T')[0] : '2026-10-30';
      const newLastDate = prompt('Edit Last Date (YYYY-MM-DD):', defaultDateStr);

      fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          type: newType ? newType.trim() : op.type,
          applyUrl: newApplyUrl ? newApplyUrl.trim() : op.applyUrl,
          prizeAmount: newPrize !== null ? newPrize.trim() : op.prizeAmount,
          lastDate: newLastDate ? new Date(newLastDate) : op.lastDate
        }),
        credentials: 'include'
      }).then(res => res.json()).then(data => {
        if (data.success) {
          alert('Opportunity updated successfully!');
          loadAdminStats();
        } else {
          alert(data.message);
        }
      });
    }

    function openCreateSchemeModal() {
      const titleEn = prompt('Government Scheme Title (English):', 'PM Vocational Skill Scheme 2026');
      const titleHi = prompt('Government Scheme Title (Hindi):', 'पीएम व्यावसायिक कौशल योजना 2026');
      const sector = prompt('Sector (Education, Employment, Women, Farmers, Health, Skill Development):', 'Skill Development');
      const applyUrl = prompt('Official Government Portal Link:', 'https://pmkvyofficial.org');

      if (titleEn && applyUrl) {
        fetch('/api/schemes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: { en: titleEn, hi: titleHi },
            sector,
            governmentType: 'Central',
            applyUrl,
            lastDate: new Date('2026-12-31'),
            showInLatestUpdates: true
          }),
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Government Scheme created successfully!');
            loadAdminStats();
          } else {
            alert(data.message);
          }
        });
      }
    }

    document.addEventListener('DOMContentLoaded', loadAdminStats);
  </script>
</body>
</html>

`

---

## File: admin-submissions.html
- **Path:** /public/admin-submissions.html
- **Purpose:** Admin review console for verifying student submissions, proof files, and approving live

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Review Submissions | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-pending { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
    .status-under-review { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .status-changes-requested { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }
    .status-approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .status-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      background: #0f172a;
      border: 1px solid var(--border-light);
      border-radius: 14px;
      max-width: 650px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      max-height: 90vh;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Console Title -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-closing" style="margin-bottom: 0.4rem;">Admin Control Center</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">Student Submissions Review Console</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Verify uploaded documents, test source links, and approve student-submitted opportunities to publish them live.</p>
      </div>

      <a href="admin-dashboard.html" class="btn btn-outline">Back to Admin Dashboard</a>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel" style="padding: 1.2rem; margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1;">
        <select id="statusFilter" class="form-select" style="max-width: 220px; padding: 0.6rem 1rem;" onchange="loadAdminSubmissions()">
          <option value="All">All Submissions</option>
          <option value="Pending Review" selected>Pending Review</option>
          <option value="Under Review">Under Review</option>
          <option value="Changes Requested">Changes Requested</option>
          <option value="Approved">Approved & Live</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input type="text" id="searchInput" class="form-input" style="max-width: 300px; padding: 0.6rem 1rem;" placeholder="Search title or organization..." onkeyup="loadAdminSubmissions()">
      </div>

      <div style="color: var(--text-muted); font-size: 0.88rem;" id="totalCountBadge">
        Showing 0 submissions
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="glass-panel" style="padding: 1.5rem;">
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; color: var(--text-main); font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-muted);">
              <th style="padding: 0.8rem;">Submission Details</th>
              <th style="padding: 0.8rem;">Submitted By</th>
              <th style="padding: 0.8rem;">Proof & Link</th>
              <th style="padding: 0.8rem;">Deadline</th>
              <th style="padding: 0.8rem;">Status</th>
              <th style="padding: 0.8rem; text-align: right;">Review Action</th>
            </tr>
          </thead>
          <tbody id="admin-submissions-tbody">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Review Modal -->
  <div id="reviewModal" class="modal-backdrop">
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <h3 style="color: #fff; font-size: 1.3rem; margin: 0;" id="modalTitle">Review Opportunity</h3>
        <button onclick="closeReviewModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">✕</button>
      </div>

      <div id="modalDetails" style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); padding: 1rem; border-radius: 8px; margin-bottom: 1.2rem; font-size: 0.88rem; color: #cbd5e1;">
        <!-- Details injected via JS -->
      </div>

      <div class="form-group" style="margin-bottom: 1.2rem;">
        <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;">Update Status</label>
        <select id="modalStatusSelect" class="form-select">
          <option value="Approved">✅ Approve & Auto-Publish Live</option>
          <option value="Under Review">🔍 Mark Under Review</option>
          <option value="Changes Requested">⚠️ Request Changes from Student</option>
          <option value="Rejected">❌ Reject Submission</option>
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;">Admin Feedback / Note for Student</label>
        <textarea id="modalFeedbackText" class="form-textarea" rows="3" placeholder="Provide reason or feedback note visible to the student..."></textarea>
      </div>

      <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
        <button onclick="closeReviewModal()" class="btn btn-outline">Cancel</button>
        <button onclick="submitReviewAction()" class="btn btn-primary" id="saveReviewBtn">Save & Apply Status</button>
      </div>
    </div>
  </div>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>

  <script>
    let currentSubmissions = [];
    let selectedSubmissionId = null;

    async function loadAdminSubmissions() {
      const tbody = document.getElementById('admin-submissions-tbody');
      const statusFilter = document.getElementById('statusFilter').value;
      const searchInput = document.getElementById('searchInput').value;

      try {
        const url = `/api/submissions/admin?status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(searchInput)}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();

        if (!data.success) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171; padding:2rem;">${data.message}</td></tr>`;
          return;
        }

        currentSubmissions = data.data || [];
        document.getElementById('totalCountBadge').innerText = `Showing ${currentSubmissions.length} submissions`;

        if (currentSubmissions.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:3rem;">No submissions found for selected criteria.</td></tr>`;
          return;
        }

        tbody.innerHTML = currentSubmissions.map(sub => {
          let badgeClass = 'status-pending';
          if (sub.status === 'Under Review') badgeClass = 'status-under-review';
          if (sub.status === 'Changes Requested') badgeClass = 'status-changes-requested';
          if (sub.status === 'Approved') badgeClass = 'status-approved';
          if (sub.status === 'Rejected') badgeClass = 'status-rejected';

          const studentName = sub.submittedBy ? sub.submittedBy.name : 'Unknown';
          const studentEmail = sub.submittedBy ? sub.submittedBy.email : '';
          const lastDateStr = new Date(sub.lastDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

          return `
            <tr style="border-bottom: 1px solid var(--border-light);">
              <td style="padding: 0.8rem;">
                <strong style="color:#fff;">${sub.title}</strong>
                <div style="font-size:0.78rem; color:var(--primary-cyan); font-weight:600; margin-top:2px;">${sub.type} (${sub.categoryType})</div>
                ${sub.organization ? `<div style="font-size:0.75rem; color:var(--text-muted);">Org: ${sub.organization}</div>` : ''}
              </td>

              <td style="padding: 0.8rem;">
                <div style="color:#e2e8f0; font-weight:600;">${studentName}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${studentEmail}</div>
              </td>

              <td style="padding: 0.8rem;">
                <a href="${sub.sourceUrl}" target="_blank" style="color:var(--primary-cyan); text-decoration:underline; font-size:0.8rem; display:block;">🔗 Source URL</a>
                <a href="${sub.proofUrl || sub.verificationImage}" target="_blank" style="color:#4ade80; text-decoration:underline; font-size:0.8rem; display:block; margin-top:2px;">📄 View Proof (Private)</a>
                ${sub.publicBannerImage ? `<a href="${sub.publicBannerImage}" target="_blank" style="color:#38bdf8; text-decoration:underline; font-size:0.8rem; display:block; margin-top:2px;">🖼️ View Public Banner</a>` : ''}
              </td>

              <td style="padding: 0.8rem; color:#f87171; font-weight:600;">
                ${lastDateStr}
              </td>

              <td style="padding: 0.8rem;">
                <span class="status-badge ${badgeClass}">${sub.status}</span>
              </td>

              <td style="padding: 0.8rem; text-align: right;">
                <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="openReviewModal('${sub._id}')">
                  Review & Action
                </button>
              </td>
            </tr>
          `;
        }).join('');

      } catch (err) {
        console.error('Admin Submissions Load Error:', err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171; padding:2rem;">Failed to load submissions. Check server connection.</td></tr>`;
      }
    }

    function openReviewModal(id) {
      const sub = currentSubmissions.find(s => s._id === id);
      if (!sub) return;

      selectedSubmissionId = id;
      document.getElementById('modalTitle').innerText = `Review: ${sub.title}`;
      
      const modalDetails = document.getElementById('modalDetails');
      modalDetails.innerHTML = `
        <div style="margin-bottom:0.4rem;"><strong>Category:</strong> ${sub.categoryType} • <strong>Type:</strong> ${sub.type}</div>
        <div style="margin-bottom:0.4rem;"><strong>Submitted By:</strong> ${sub.submittedBy ? sub.submittedBy.name : 'Student'} (${sub.submittedBy ? sub.submittedBy.email : ''})</div>
        <div style="margin-bottom:0.4rem;"><strong>Source Verification URL:</strong> <a href="${sub.sourceUrl}" target="_blank" style="color:var(--primary-cyan);">${sub.sourceUrl}</a></div>
        <div style="margin-bottom:0.4rem;"><strong>Verification Proof (Private):</strong> <a href="${sub.proofUrl || sub.verificationImage}" target="_blank" style="color:#4ade80;">${sub.proofOriginalName || 'Uploaded Verification File'}</a></div>
        ${sub.publicBannerImage ? `<div style="margin-bottom:0.4rem;"><strong>Public Banner Image:</strong> <a href="${sub.publicBannerImage}" target="_blank" style="color:#38bdf8;">${sub.publicBannerOriginalName || 'Public Banner File'}</a></div>` : '<div style="margin-bottom:0.4rem; color: var(--text-muted);"><strong>Public Banner:</strong> None provided</div>'}
        ${sub.description ? `<div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px solid rgba(255,255,255,0.1);"><strong>Description:</strong> ${sub.description}</div>` : ''}
      `;

      document.getElementById('modalStatusSelect').value = sub.status === 'Pending Review' ? 'Approved' : sub.status;
      document.getElementById('modalFeedbackText').value = sub.adminFeedback || '';
      document.getElementById('reviewModal').style.display = 'flex';
    }

    function closeReviewModal() {
      document.getElementById('reviewModal').style.display = 'none';
      selectedSubmissionId = null;
    }

    async function submitReviewAction() {
      if (!selectedSubmissionId) return;

      const status = document.getElementById('modalStatusSelect').value;
      const adminFeedback = document.getElementById('modalFeedbackText').value;
      const saveBtn = document.getElementById('saveReviewBtn');

      saveBtn.disabled = true;
      saveBtn.innerText = 'Updating status...';

      try {
        const res = await fetch(`/api/submissions/admin/${selectedSubmissionId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, adminFeedback }),
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success) {
          alert(`Status updated to "${status}" successfully! ${status === 'Approved' ? 'Published live to public listings!' : ''}`);
          closeReviewModal();
          loadAdminSubmissions();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (err) {
        console.error('Update Status Error:', err);
        alert('Server error updating status.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save & Apply Status';
      }
    }

    document.addEventListener('DOMContentLoaded', loadAdminSubmissions);
  </script>
</body>
</html>

`

---

## File: admin-students.html
- **Path:** /public/admin-students.html
- **Purpose:** Admin registered student directory, search, and profile inspector

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registered Students Directory | DishaSetu Admin</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      background: #0f172a;
      border: 1px solid var(--border-light);
      border-radius: 14px;
      max-width: 550px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Directory Title -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-open" style="margin-bottom: 0.4rem;">Student Management</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">Registered Students Directory</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">View student profiles, education qualifications, state locations, and community contributions.</p>
      </div>

      <a href="admin-dashboard.html" class="btn btn-outline">Back to Admin Dashboard</a>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel" style="padding: 1.2rem; margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1;">
        <select id="educationFilter" class="form-select" style="max-width: 180px; padding: 0.6rem 1rem;" onchange="loadStudents()">
          <option value="All">All Education</option>
          <option value="10th">10th Pass</option>
          <option value="12th">12th Pass</option>
          <option value="Graduate">Graduate</option>
          <option value="Post Graduate">Post Graduate</option>
          <option value="Diploma">Diploma</option>
          <option value="PhD">PhD</option>
        </select>

        <select id="stateFilter" class="form-select" style="max-width: 180px; padding: 0.6rem 1rem;" onchange="loadStudents()">
          <option value="All">All States</option>
          <option value="All India">All India</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Bihar">Bihar</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
        </select>

        <input type="text" id="searchInput" class="form-input" style="max-width: 280px; padding: 0.6rem 1rem;" placeholder="Search name, email, or phone..." onkeyup="loadStudents()">
      </div>

      <div style="color: var(--text-muted); font-size: 0.88rem;" id="totalStudentsCount">
        Showing 0 students
      </div>
    </div>

    <!-- Students Directory Table -->
    <div class="glass-panel" style="padding: 1.5rem;">
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; color: var(--text-main); font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-muted);">
              <th style="padding: 0.8rem;">Student Name</th>
              <th style="padding: 0.8rem;">Contact Email</th>
              <th style="padding: 0.8rem;">Education / State</th>
              <th style="padding: 0.8rem;">Category</th>
              <th style="padding: 0.8rem;">Submissions</th>
              <th style="padding: 0.8rem;">Registered On</th>
              <th style="padding: 0.8rem; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="students-tbody">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Student Profile Modal -->
  <div id="studentModal" class="modal-backdrop">
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
        <h3 style="color: #fff; font-size: 1.3rem; margin: 0;" id="modalStudentName">Student Profile</h3>
        <button onclick="closeStudentModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">✕</button>
      </div>

      <div id="modalProfileContent" style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
        <!-- Details injected via JS -->
      </div>

      <div style="margin-top: 1.5rem; text-align: right;">
        <button onclick="closeStudentModal()" class="btn btn-outline">Close Profile</button>
      </div>
    </div>
  </div>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>

  <script>
    let currentStudents = [];

    async function loadStudents() {
      const tbody = document.getElementById('students-tbody');
      const education = document.getElementById('educationFilter').value;
      const state = document.getElementById('stateFilter').value;
      const search = document.getElementById('searchInput').value;

      try {
        const url = `/api/admin/students?education=${encodeURIComponent(education)}&state=${encodeURIComponent(state)}&search=${encodeURIComponent(search)}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();

        if (!data.success) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f87171; padding:2rem;">${data.message}</td></tr>`;
          return;
        }

        currentStudents = data.students || [];
        document.getElementById('totalStudentsCount').innerText = `Showing ${currentStudents.length} registered students`;

        if (currentStudents.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:3rem;">No registered students matching current filters.</td></tr>`;
          return;
        }

        tbody.innerHTML = currentStudents.map(st => {
          const regDate = new Date(st.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

          return `
            <tr style="border-bottom: 1px solid var(--border-light);">
              <td style="padding: 0.8rem;">
                <strong style="color:#fff;">${st.name}</strong>
                <div style="font-size:0.75rem; color:var(--primary-cyan);">${st.role.toUpperCase()}</div>
              </td>

              <td style="padding: 0.8rem;">
                <div style="color:#cbd5e1;">${st.email}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${st.phone || 'No phone'}</div>
              </td>

              <td style="padding: 0.8rem;">
                <span class="card-badge badge-open" style="font-size:0.7rem; padding:2px 6px;">${st.education || 'Graduate'}</span>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">📍 ${st.state || 'All India'}</div>
              </td>

              <td style="padding: 0.8rem;">
                ${st.category || 'General'}
              </td>

              <td style="padding: 0.8rem;">
                <strong style="color:#4ade80;">${st.totalSubmissions || 0}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">(${st.approvedSubmissions || 0} Live)</span>
              </td>

              <td style="padding: 0.8rem; color:var(--text-muted);">
                ${regDate}
              </td>

              <td style="padding: 0.8rem; text-align: right;">
                <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; margin-right: 4px;" onclick="openStudentModal('${st._id}')">
                  View Profile
                </button>
                <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: #f87171;" onclick="deleteStudent('${st._id}', '${st.name}')">
                  Delete
                </button>
              </td>
            </tr>
          `;
        }).join('');

      } catch (err) {
        console.error('Load Students Error:', err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f87171; padding:2rem;">Failed to load students directory.</td></tr>`;
      }
    }

    function openStudentModal(id) {
      const st = currentStudents.find(s => s._id === id);
      if (!st) return;

      document.getElementById('modalStudentName').innerText = `Student Profile: ${st.name}`;
      const content = document.getElementById('modalProfileContent');
      content.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: 10px;">
          <div style="margin-bottom:0.6rem;"><strong>Full Name:</strong> ${st.name}</div>
          <div style="margin-bottom:0.6rem;"><strong>Email Address:</strong> ${st.email}</div>
          <div style="margin-bottom:0.6rem;"><strong>Mobile Phone:</strong> ${st.phone || 'Not provided'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Education Qualification:</strong> ${st.education || 'Graduate'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Home State:</strong> ${st.state || 'All India'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Social Category:</strong> ${st.category || 'General'}</div>
          <div style="margin-bottom:0.6rem;"><strong>Account Type / Role:</strong> ${st.role}</div>
          <div style="margin-bottom:0.6rem;"><strong>Registered Date:</strong> ${new Date(st.createdAt).toLocaleString('en-IN')}</div>
          <div style="margin-top:0.8rem; padding-top:0.8rem; border-top:1px solid rgba(255,255,255,0.1); color: #4ade80;">
            <strong>Community Impact:</strong> ${st.totalSubmissions || 0} Submitted Opportunities (${st.approvedSubmissions || 0} Approved)
          </div>
        </div>
      `;

      document.getElementById('studentModal').style.display = 'flex';
    }

    function closeStudentModal() {
      document.getElementById('studentModal').style.display = 'none';
    }

    async function deleteStudent(id, name) {
      if (!confirm(`Are you sure you want to delete student account "${name}"?`)) return;

      try {
        const res = await fetch(`/api/admin/students/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          alert(`Student account "${name}" was deleted successfully.`);
          loadStudents();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (err) {
        console.error('Delete Student Error:', err);
        alert('Failed to delete student account.');
      }
    }

    document.addEventListener('DOMContentLoaded', loadStudents);
  </script>
</body>
</html>

`

---

