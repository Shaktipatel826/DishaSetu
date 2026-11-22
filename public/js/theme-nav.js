/**
 * DishaSetu — Shared Theme, Language Switcher & Navbar Module
 */

function getCurrentLanguage() {
  const saved = localStorage.getItem('dishasetu_lang');
  if (saved) return saved;

  // Browser language detection on first visit
  const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (navLang.includes('hi')) {
    return 'hi';
  }
  return 'en';
}

function setLanguage(lang) {
  localStorage.setItem('dishasetu_lang', lang);
  document.documentElement.lang = lang;
  if (lang === 'hi') {
    document.body.classList.add('lang-hi');
  } else {
    document.body.classList.remove('lang-hi');
  }

  // Update Language Switcher UI buttons
  const btnEn = document.getElementById('lang-btn-en');
  const btnHi = document.getElementById('lang-btn-hi');
  if (btnEn && btnHi) {
    if (lang === 'hi') {
      btnHi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnHi.classList.remove('active');
    }
  }

  // Translate static DOM elements with data-i18n attribute
  translateDOM(lang);
}

function translateDOM(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && typeof t === 'function') {
      const translated = t(key, lang);
      if (el.tagName === 'INPUT' && el.type === 'submit') {
        el.value = translated;
      } else {
        el.innerText = translated;
      }
    }
  });
}

/**
 * Global Logout Handler - Clears session on server and client, redirecting to home page
 */
async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('dishasetu_user');
    window.location.replace('index.html');
  }
}

/**
 * Render Navbar with Official Brand Logo Image, Navigation Links, Notification Bell & Lang Switcher
 */
function renderNavbar() {
  const container = document.getElementById('navbar-placeholder');
  if (!container) return;

  const lang = getCurrentLanguage();
  const storedUserStr = localStorage.getItem('dishasetu_user');
  const user = storedUserStr ? JSON.parse(storedUserStr) : null;
  const userRole = (user && user.role) ? user.role.toLowerCase() : '';
  const isAdmin = userRole === 'admin';
  const isStudent = user && !isAdmin;

  container.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <!-- Logo with Official Logo Image -->
        <a href="index.html" class="brand-logo">
          <img src="assets/logo.png" alt="DishaSetu Logo" class="brand-logo-img" style="height: 44px; width: auto; object-fit: contain; filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));">
        </a>

        <!-- Mobile Menu Toggle Button -->
        <button class="mobile-nav-toggle" onclick="toggleMobileMenu()" aria-label="Toggle Navigation Menu">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>

        <!-- Links -->
        <ul class="nav-links" id="main-nav-links">
          <li><a href="index.html" data-i18n="navHome">Home</a></li>
          <li><a href="opportunities.html" data-i18n="navOpportunities">Opportunities</a></li>
          <li><a href="schemes.html" data-i18n="navSchemes">Government Schemes</a></li>
          <li><a href="index.html#how-it-works" data-i18n="navHowItWorks">How It Works</a></li>
          <li><a href="submit-opportunity.html" data-i18n="navSubmitOpportunity">Submit an Opportunity</a></li>
          ${isStudent ? `
            <li><a href="my-submissions.html" data-i18n="navMySubmissions">My Submissions</a></li>
            <li><a href="saved-opportunities.html" data-i18n="navSaved">Saved Items</a></li>
          ` : ''}
          ${isAdmin ? `
            <li><a href="admin-submissions.html" style="color: #4ade80; font-weight: 600;" data-i18n="navReviewSubmissions">Review Submissions</a></li>
            <li><a href="admin-students.html" data-i18n="navStudentsDirectory">Students Directory</a></li>
          ` : ''}
          ${user ? `<li><a href="${isAdmin ? 'admin-dashboard.html' : 'dashboard.html'}" data-i18n="navDashboard">Dashboard</a></li>` : ''}
        </ul>

        <!-- Right Controls -->
        <div class="nav-actions">
          <!-- Language Switcher -->
          <div class="lang-switcher" onclick="toggleLanguage()">
            <button id="lang-btn-en" class="lang-btn ${lang === 'en' ? 'active' : ''}">EN</button>
            <button id="lang-btn-hi" class="lang-btn ${lang === 'hi' ? 'active' : ''}">हिंदी</button>
          </div>

          <!-- Notification Bell -->
          ${user ? `
            <button class="notification-bell-btn" onclick="toggleNotificationDrawer()" aria-label="Notifications">
              🔔
              <span class="notification-badge" id="nav-unread-count" style="display:none;">0</span>
            </button>
          ` : ''}

          <!-- Auth Actions -->
          ${user ? `
            <a href="${isAdmin ? 'admin-dashboard.html' : 'dashboard.html'}" style="font-size: 0.88rem; color: var(--text-muted); text-decoration: none;" title="View Profile">Hi, <strong style="color: var(--primary-cyan);">${user.name.split(' ')[0]}</strong></a>
            <button class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" onclick="handleLogout()" data-i18n="navLogout">Logout</button>
          ` : `
            <a href="login.html" class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" data-i18n="navLogin">Login</a>
            <a href="register.html" class="btn btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" data-i18n="navRegister">Register</a>
          `}
        </div>
      </div>
    </nav>
  `;

  // Initialize lang state
  setLanguage(lang);
}

function toggleMobileMenu() {
  const links = document.getElementById('main-nav-links');
  const toggle = document.querySelector('.mobile-nav-toggle');
  if (links) {
    links.classList.toggle('mobile-open');
  }
  if (toggle) {
    toggle.classList.toggle('is-active');
  }
}

function toggleLanguage() {
  const current = getCurrentLanguage();
  const next = current === 'en' ? 'hi' : 'en';
  setLanguage(next);
}

/**
 * Load Dynamic Sarkari Result Style Continuous Right -> Left Ticker
 */
async function loadTicker() {
  const placeholder = document.getElementById('ticker-placeholder');
  if (!placeholder) return;

  try {
    const res = await fetch('/api/opportunities/ticker');
    const data = await res.json();
    
    let rawItems = (data.success && data.items && data.items.length > 0) ? data.items : [];

    // Fallback sample items if database has fewer entries, guaranteeing full density
    const defaultSampleItems = [
      { _id: '', title: { en: 'PM Higher Education Scholarship 2026', hi: 'प्रधानमंत्री उच्च शिक्षा छात्रवृत्ति 2026' }, type: 'Scholarship' },
      { _id: '', title: { en: 'National Innovation Quiz Competition 2026', hi: 'राष्ट्रीय नवाचार प्रश्नोत्तरी 2026' }, type: 'Quiz' },
      { _id: '', title: { en: 'Smart India Hackathon 2026', hi: 'स्मार्ट इंडिया हैकाथॉन 2026' }, type: 'Hackathon' },
      { _id: '', title: { en: 'UP Free Smartphone & Tablet Scheme 2026', hi: 'यूपी स्मार्टफोन वितरण योजना 2026' }, type: 'Govt Scheme' },
      { _id: '', title: { en: 'PM Skill Development Program (PMKVY 4.0)', hi: 'पीएम कौशल विकास योजना' }, type: 'Skill Program' },
      { _id: '', title: { en: 'National Student Internship Scheme 2026', hi: 'राष्ट्रीय छात्र इंटर्नशिप योजना' }, type: 'Internship' },
      { _id: '', title: { en: 'AICTE Swanath Scholarship for Girls', hi: 'एआईसीटीई स्वनाथ छात्रवृत्ति' }, type: 'Scholarship' },
      { _id: '', title: { en: 'National AI & Coding Challenge 2026', hi: 'राष्ट्रीय एआई एवं कोडिंग चुनौती' }, type: 'Coding' }
    ];

    const displayItems = rawItems.length >= 4 ? rawItems : [...rawItems, ...defaultSampleItems];
    const lang = getCurrentLanguage();

    const tagColorClasses = ['tag-blue', 'tag-teal', 'tag-green', 'tag-purple', 'tag-orange', 'tag-red', 'tag-gold'];

    const renderItemsHtml = (itemsList) => {
      return itemsList.map((item, idx) => {
        const title = typeof item.title === 'object' ? getLocalized(item.title, lang) : item.title;
        const colorClass = tagColorClasses[idx % tagColorClasses.length];
        const linkUrl = item._id ? `opportunity-details.html?id=${item._id}` : `opportunities.html`;

        return `
          <a href="${linkUrl}" class="ticker-card ${colorClass}">
            <span class="ticker-tag-badge">${item.type || 'Opportunity'}</span>
            <span class="ticker-tag-title">${title}</span>
            <span class="ticker-tag-arrow">→</span>
          </a>
        `;
      }).join('');
    };

    const singleTrackHtml = renderItemsHtml(displayItems);

    placeholder.innerHTML = `
      <div class="ticker-container">
        <!-- Fixed Header Badge -->
        <div class="ticker-fixed-label">
          <span class="pulse-dot"></span>
          <span>LATEST OPPORTUNITIES</span>
        </div>

        <!-- Continuous Right -> Left Scroller Track -->
        <div class="ticker-track-wrapper">
          <div class="ticker-track">
            <div class="ticker-track-group">
              ${singleTrackHtml}
            </div>
            <!-- Duplicated Track for Seamless 100% Loop -->
            <div class="ticker-track-group" aria-hidden="true">
              ${singleTrackHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    translateDOM(lang);
  } catch (err) {
    console.error('Ticker Load Error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  loadTicker();
});
