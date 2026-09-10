/**
 * DishaSetu — Quick Eligibility Finder & Visual Result Engine
 */

async function handleEligibilityCheck(event) {
  if (event) event.preventDefault();

  const age = document.getElementById('finder-age')?.value;
  const education = document.getElementById('finder-education')?.value;
  const state = document.getElementById('finder-state')?.value;
  const category = document.getElementById('finder-category')?.value;

  try {
    const res = await fetch('/api/opportunities/check-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, education, state, category })
    });

    const data = await res.json();
    if (!data.success) {
      alert('Error evaluating eligibility: ' + data.message);
      return;
    }

    renderEligibilityModal(data.results, { age, education, state, category });
  } catch (err) {
    console.error('Check Eligibility Fetch Error:', err);
  }
}

function renderEligibilityModal(results, queryParams) {
  let modal = document.getElementById('eligibility-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eligibility-modal';
    modal.className = 'glass-panel';
    modal.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90%; max-width: 750px; max-height: 85vh; overflow-y: auto;
      z-index: 2000; padding: 2rem; border-radius: var(--radius-lg);
      box-shadow: 0 0 50px rgba(6, 182, 212, 0.4);
    `;
    document.body.appendChild(modal);
  }

  let backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
      z-index: 1999;
    `;
    backdrop.onclick = closeEligibilityModal;
    document.body.appendChild(backdrop);
  }

  const lang = getCurrentLanguage();
  const eligibleItems = results.filter(r => r.status === 'ELIGIBLE' || r.status === 'LIKELY_ELIGIBLE');

  modal.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 0.2rem;">
          🎯 ${t('finderTitle', lang)}
        </h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0;">
          Profile: Age ${queryParams.age || 'Any'}, ${queryParams.education}, ${queryParams.state}, ${queryParams.category}
        </p>
      </div>
      <button onclick="closeEligibilityModal()" style="background:none; border:none; color:#fff; font-size: 1.8rem; cursor:pointer;">×</button>
    </div>

    ${eligibleItems.length === 0 ? `
      <div style="text-align: center; padding: 2rem 0;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3 style="color: #fff;">No matching opportunities found</h3>
        <p style="color: var(--text-muted);">Try adjusting your qualification or age filter to see more results.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${eligibleItems.slice(0, 5).map(item => {
          const title = getLocalized(item.opportunity.title, lang);
          const isEligible = item.status === 'ELIGIBLE';
          
          return `
            <div class="glass-card" style="padding: 1.2rem; border-left: 4px solid ${isEligible ? '#22c55e' : '#f59e0b'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem;">
                <div>
                  <span class="card-badge ${isEligible ? 'badge-open' : 'badge-closing'}">
                    ${isEligible ? '✓ ' + t('eligibleStatus', lang) : '⚠ ' + t('likelyStatus', lang)}
                  </span>
                  <h4 style="color: #fff; margin-top: 0.4rem; font-size: 1.1rem;">${title}</h4>
                </div>
                <span style="font-weight: 800; color: var(--primary-cyan); font-size: 0.9rem;">
                  ${item.matchCount}/4 ${t('matchedCount', lang)}
                </span>
              </div>

              <!-- Criteria Breakdown -->
              <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin: 0.8rem 0; font-size: 0.82rem;">
                <span style="color: ${item.criteria.age ? '#4ade80' : '#f87171'}">Age ${item.criteria.age ? '✓' : '✕'}</span>
                <span style="color: ${item.criteria.education ? '#4ade80' : '#f87171'}">Education ${item.criteria.education ? '✓' : '✕'}</span>
                <span style="color: ${item.criteria.state ? '#4ade80' : '#f87171'}">State ${item.criteria.state ? '✓' : '✕'}</span>
                <span style="color: ${item.criteria.category ? '#4ade80' : '#f87171'}">Category ${item.criteria.category ? '✓' : '✕'}</span>
              </div>

              ${item.reasons.length > 0 ? `
                <p style="font-size: 0.8rem; color: #f87171; margin-bottom: 0.8rem;">
                  Note: ${item.reasons.join(' | ')}
                </p>
              ` : ''}

              <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
                <a href="opportunity-details.html?id=${item.opportunity._id}" class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;">
                  ${t('btnViewDetails', lang)} →
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  modal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeEligibilityModal() {
  const modal = document.getElementById('eligibility-modal');
  const backdrop = document.getElementById('modal-backdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}
