# DishaSetu — Part 4: Frontend Client Scripts and Master Stylesheet

## File: theme-nav.js
- **Path:** /public/js/theme-nav.js
- **Purpose:** Global dynamic navigation bar, authentication state, and theme management

`javascript
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
 * Render Navbar with Official Brand Logo Image, Navigation Links, Notification Bell & Lang Switcher
 */
function renderNavbar() {
  const container = document.getElementById('navbar-placeholder');
  if (!container) return;

  const lang = getCurrentLanguage();
  const storedUserStr = localStorage.getItem('dishasetu_user');
  const user = storedUserStr ? JSON.parse(storedUserStr) : null;

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
          ${user && user.role !== 'admin' ? `
            <li><a href="submit-opportunity.html" style="color: var(--primary-cyan); font-weight: 600;">+ Submit Opportunity</a></li>
            <li><a href="my-submissions.html">My Submissions</a></li>
            <li><a href="saved-opportunities.html" data-i18n="navSaved">Saved Items</a></li>
          ` : ''}
          ${user && user.role === 'admin' ? `
            <li><a href="admin-submissions.html" style="color: #4ade80; font-weight: 600;">Review Submissions</a></li>
            <li><a href="admin-students.html">Students Directory</a></li>
          ` : ''}
          ${user ? `<li><a href="${user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html'}" data-i18n="navDashboard">Dashboard</a></li>` : ''}
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
            <span style="font-size: 0.88rem; color: var(--text-muted);">Hi, <strong>${user.name.split(' ')[0]}</strong></span>
            <button class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" onclick="handleLogout()">Logout</button>
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

`

---

## File: translations.js
- **Path:** /public/js/translations.js
- **Purpose:** Bilingual translation dictionary (English & Hindi) and i18n switcher

`javascript
/**
 * DishaSetu — Bilingual English + Hindi Translation Dictionary
 */

const TRANSLATIONS = {
  en: {
    // Brand & Taglines
    brandName: "DishaSetu",
    brandTagline: "Right Opportunity → Right Person → Right Time",
    brandSecondary: "Your Digital Guide to Opportunities & Government Schemes",
    
    // Nav Links
    navHome: "Home",
    navOpportunities: "Opportunities",
    navSchemes: "Government Schemes",
    navFindForMe: "Find for Me",
    navHowItWorks: "How It Works",
    navAbout: "About",
    navSaved: "Saved Items",
    navDashboard: "Dashboard",
    navLogin: "Login",
    navRegister: "Register",
    navLogout: "Logout",

    // Hero Section
    heroLabel: "Your Digital Guide to Opportunities",
    heroHeading: "Find What's Meant for You.",
    heroSubtext: "Discover scholarships, government schemes, competitions, exams, hackathons and skill programs — all in one place.",
    btnFindOpportunities: "Find Opportunities",
    btnGovernmentSchemes: "Government Schemes",

    // Ticker
    latestBadge: "LATEST",

    // Quick Finder
    finderTitle: "Find Opportunities For You",
    labelAge: "Age",
    labelEducation: "Education",
    labelState: "State",
    labelCategory: "Category",
    btnSearchNow: "Find Opportunities",

    // Sections
    exploreCategories: "Explore Opportunities",
    exploreSchemesTitle: "Schemes for a Stronger Tomorrow",
    exploreSchemesSubtext: "Discover Central and State Government schemes designed to support education, employment, health, housing, skills and more.",
    dontMissDeadline: "Don't Miss the Deadline",
    howItWorksTitle: "Your Journey to a Better Future",

    // How It Works Steps
    step1Title: "Tell Us About You",
    step1Desc: "Provide your age, education, state, and category.",
    step2Title: "We Find Matches",
    step2Desc: "DishaSetu scans opportunities relevant to your profile.",
    step3Title: "Check Eligibility",
    step3Desc: "Instantly see itemized pass/fail criteria.",
    step4Title: "Apply & Grow",
    step4Desc: "Direct links to official application portals.",

    // Badges & Buttons
    badgeOpen: "OPEN",
    badgeClosingSoon: "CLOSING SOON",
    badgeUpcoming: "UPCOMING",
    badgeClosed: "CLOSED",
    badgeSchemeCentral: "Central Scheme",
    badgeSchemeState: "State Scheme",
    btnViewDetails: "View Details",
    btnSave: "Save",
    btnSaved: "Saved",
    btnApplyNow: "Apply Now",
    btnManageReminder: "Manage Reminder",

    // Disclaimer
    govtDisclaimer: "This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.",

    // Eligibility Result
    eligibleStatus: "You're Eligible!",
    likelyStatus: "You May Be Eligible",
    notEligibleStatus: "Not Eligible",
    matchedCount: "Criteria Matched",

    // Toast Messages
    savedSuccess: "Saved successfully with deadline reminder!",
    alreadySaved: "Already in your saved list.",
    removedSuccess: "Item removed from saved list."
  },
  hi: {
    // Brand & Taglines
    brandName: "दिशासेतु",
    brandTagline: "सही अवसर → सही व्यक्ति → सही समय",
    brandSecondary: "अवसरों और सरकारी योजनाओं के लिए आपका डिजिटल मार्गदर्शक",

    // Nav Links
    navHome: "होम",
    navOpportunities: "अवसर खोजें",
    navSchemes: "सरकारी योजनाएँ",
    navFindForMe: "मेरे लिए खोजें",
    navHowItWorks: "यह कैसे काम करता है",
    navAbout: "हमारे बारे में",
    navSaved: "सहेजे गए अवसर",
    navDashboard: "डैशबोर्ड",
    navLogin: "लॉगिन",
    navRegister: "पंजीकरण",
    navLogout: "लॉगआउट",

    // Hero Section
    heroLabel: "अवसरों के लिए आपका डिजिटल मार्गदर्शक",
    heroHeading: "खोजें जो आपके लिए बना है।",
    heroSubtext: "छात्रवृत्ति, सरकारी योजनाएं, प्रतियोगिताएं, परीक्षाएं, हैकाथॉन और कौशल कार्यक्रम — सब एक ही स्थान पर।",
    btnFindOpportunities: "अवसर खोजें",
    btnGovernmentSchemes: "सरकारी योजनाएँ",

    // Ticker
    latestBadge: "नवीनतम",

    // Quick Finder
    finderTitle: "अपने लिए अवसर खोजें",
    labelAge: "आयु",
    labelEducation: "योग्यता",
    labelState: "राज्य",
    labelCategory: "वर्ग",
    btnSearchNow: "अवसर खोजें",

    // Sections
    exploreCategories: "विभिन्न अवसर देखें",
    exploreSchemesTitle: "सशक्त भविष्य के लिए योजनाएं",
    exploreSchemesSubtext: "शिक्षा, रोजगार, स्वास्थ्य, आवास और कौशल विकास के लिए केंद्र एवं राज्य सरकार की योजनाएं खोजें।",
    dontMissDeadline: "अंतिम तिथि न चूकें",
    howItWorksTitle: "बेहतर भविष्य की ओर आपकी यात्रा",

    // How It Works Steps
    step1Title: "अपने बारे में बताएं",
    step1Desc: "अपनी आयु, योग्यता, राज्य और श्रेणी चुनें।",
    step2Title: "हम अवसर खोजते हैं",
    step2Desc: "दिशासेतु आपकी प्रोफ़ाइल से मेल खाते अवसर दिखाता है।",
    step3Title: "पात्रता जांचें",
    step3Desc: "तुरंत जानें कि आप किन मानदंडों को पूरा करते हैं।",
    step4Title: "आवेदन करें और बढ़ें",
    step4Desc: "आधिकारिक सरकारी एवं अवसर पोर्टलों पर सीधा आवेदन करें।",

    // Badges & Buttons
    badgeOpen: "खुला है",
    badgeClosingSoon: "जल्द समाप्त होने वाला",
    badgeUpcoming: "आगामी",
    badgeClosed: "समाप्त",
    badgeSchemeCentral: "केंद्रीय योजना",
    badgeSchemeState: "राज्य योजना",
    btnViewDetails: "विवरण देखें",
    btnSave: "सहेजें",
    btnSaved: "सहेजा गया",
    btnApplyNow: "अभी आवेदन करें",
    btnManageReminder: "रिमाइंडर प्रबंधित करें",

    // Disclaimer
    govtDisclaimer: "यह प्लेटफॉर्म एक सूचना और अवसर खोज पोर्टल है। यह एक आधिकारिक सरकारी वेबसाइट नहीं है। आवेदन करने से पहले हमेशा आधिकारिक वेबसाइट पर पात्रता, तिथियों और विवरणों की पुष्टि करें।",

    // Eligibility Result
    eligibleStatus: "आप पात्र हैं!",
    likelyStatus: "आप पात्र हो सकते हैं",
    notEligibleStatus: "अपात्र",
    matchedCount: "मापदंड मिले",

    // Toast Messages
    savedSuccess: "सफलतापूर्वक सहेजा गया और रिमाइंडर सेट किया गया!",
    alreadySaved: "आपकी सहेजी गई सूची में पहले से मौजूद है।",
    removedSuccess: "सूची से हटा दिया गया।"
  }
};

/**
 * Dynamic Content Localizer with Graceful English Fallback
 */
function getLocalized(obj, lang = 'en') {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj['en'] || '';
}

/**
 * Translate static UI key
 */
function t(key, lang = 'en') {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS, getLocalized, t };
}

`

---

## File: main.js
- **Path:** /public/js/main.js
- **Purpose:** Continuous 3D orbit carousel animation, timeline scroll, and interactive glue

`javascript
/**
 * DishaSetu — Main Client Glue & Core Interactivity
 */

// Logout handler
async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('dishasetu_user');
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// Scroll animation for How It Works timeline path
function initTimelineScrollAnimation() {
  const line = document.getElementById('timeline-active-line');
  const steps = document.querySelectorAll('.step-card');
  if (!line || steps.length === 0) return;

  window.addEventListener('scroll', () => {
    const rect = document.getElementById('how-it-works')?.getBoundingClientRect();
    if (!rect) return;

    const windowHeight = window.innerHeight;
    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = Math.min(100, Math.max(0, ((windowHeight - rect.top) / rect.height) * 100));
      line.style.width = `${progress}%`;

      steps.forEach((step, index) => {
        if (progress >= (index + 1) * 20) {
          step.classList.add('active');
        }
      });
    }
  });
}

// Continuous 3D Elliptical Orbit Carousel Animation
function initOrbitCarousel() {
  const cards = document.querySelectorAll('.orbit-card');
  const stage = document.querySelector('.hero-visual-stage');
  if (!cards || cards.length === 0) return;

  let currentAngle = 0;
  const speed = 0.35; // smooth rotation speed (deg per frame)
  let isHovered = false;

  if (stage) {
    stage.addEventListener('mouseenter', () => { isHovered = true; });
    stage.addEventListener('mouseleave', () => { isHovered = false; });
    stage.addEventListener('touchstart', () => { isHovered = true; }, { passive: true });
    stage.addEventListener('touchend', () => { isHovered = false; }, { passive: true });
  }

  function step() {
    if (!isHovered) {
      currentAngle = (currentAngle + speed) % 360;
    }

    const total = cards.length;
    const w = window.innerWidth;
    const isSmallMobile = w <= 390;
    const isMobile = w <= 640;
    const isTablet = w <= 992;
    
    // Scaled Elliptical Radius for 3D Orbit Carousel
    const radiusX = isSmallMobile ? 95 : (isMobile ? 115 : (isTablet ? 155 : 210));
    const radiusZ = isSmallMobile ? 50 : (isMobile ? 65 : (isTablet ? 90 : 130));
    const radiusY = isSmallMobile ? 12 : (isMobile ? 16 : (isTablet ? 22 : 32)); // 3D tilt angle

    cards.forEach((card, index) => {
      const angleDeg = currentAngle + (index * (360 / total));
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = Math.sin(angleRad) * radiusX;
      const z = Math.cos(angleRad) * radiusZ;
      const y = -Math.cos(angleRad) * radiusY;

      // Normalize Z (0 = farthest back, 1 = closest front)
      const normZ = (z + radiusZ) / (2 * radiusZ);

      // 3D Scale: 0.70 (back) -> 1.12 (front)
      const scale = 0.70 + (normZ * 0.42);

      // Opacity: 0.45 (back) -> 1.0 (front)
      const opacity = 0.45 + (normZ * 0.55);

      // Z-Index based on Z depth
      const zIndex = Math.round((normZ * 100) + 10);

      // Front card highlight
      if (normZ > 0.88) {
        card.classList.add('is-front');
      } else {
        card.classList.remove('is-front');
      }

      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
  initTimelineScrollAnimation();
  initOrbitCarousel();
});

`

---

## File: eligibility.js
- **Path:** /public/js/eligibility.js
- **Purpose:** Client-side student profile evaluation and opportunity matching engine

`javascript
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

`

---

## File: notifications.js
- **Path:** /public/js/notifications.js
- **Purpose:** Real-time in-app notification dropdown and polling client

`javascript
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

`

---

## File: reminders.js
- **Path:** /public/js/reminders.js
- **Purpose:** Save & reminder modal handler for student bookmarking

`javascript
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

`

---

## File: style.css
- **Path:** /public/style.css
- **Purpose:** Complete master CSS stylesheet with warm cream/blue design system, 3D carousel, and responsive grid

`css
/* ==========================================================================
   DISHASETU — REALISTIC WARM CREAM & PROFESSIONAL BLUE DESIGN SYSTEM
   Warm Cream + Ivory + Deep Navy + Professional Blue + Subtle Teal Aesthetic
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

:root {
  /* Core Color Palette: Warm Cream, Ivory, Deep Navy, Professional Blue & Subtle Teal */
  --bg-main: #fbf9f4;            /* Soft Warm Cream Canvas */
  --bg-surface: #f7f4ed;         /* Light Ivory Surface */
  --bg-surface-elevated: #ffffff; /* Crisp White Card Container */
  
  --bg-glass: rgba(255, 255, 255, 0.94);
  --bg-glass-card: rgba(255, 255, 255, 0.96);
  
  /* Brand Accent Colors */
  --primary-blue: #1d4ed8;       /* Professional Royal Blue */
  --primary-blue-hover: #1e40af;
  --primary-teal: #0d9488;       /* Subtle Teal Accent */
  --primary-teal-dark: #0f766e;
  
  --accent-amber: #d97706;       /* Warm Gold / Scheme Accent */
  --accent-amber-dark: #b45309;

  /* Header & Structural Dark Accent */
  --navy-dark: #0f172a;          /* Deep Navy Header / Text Anchor */
  --navy-surface: #1e293b;
  
  /* Typography Colors */
  --text-main: #0f172a;          /* Deep Charcoal Navy */
  --text-muted: #475569;         /* Muted Slate Body Text */
  --text-subtle: #64748b;        /* Light Slate Secondary */
  --text-inverse: #ffffff;
  
  /* Borders & Divider */
  --border-light: #e2e8f0;       /* Soft Light Border */
  --border-medium: #cbd5e1;      /* Medium Border */
  --border-glow: #3b82f6;        /* Focus Blue Ring */
  --border-scheme-glow: #f59e0b;

  /* Elevation Shadows */
  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 6px 20px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 12px 36px rgba(15, 23, 42, 0.1);
  --shadow-glow: 0 0 25px rgba(29, 78, 216, 0.2);
  --shadow-scheme-glow: 0 0 25px rgba(217, 119, 6, 0.2);
  
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  --font-en: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-hi: 'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif;

  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reset & Global Canvas */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-en);
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;
}

[lang="hi"] body, .lang-hi {
  font-family: var(--font-hi);
}

a {
  color: var(--primary-blue);
  text-decoration: none;
  transition: var(--transition);
}

a:hover {
  color: var(--primary-blue-hover);
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.main-content {
  flex: 1 0 auto;
}

/* Realistic Panel & Card Utilities */
.glass-panel {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.glass-card {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.glass-card:hover {
  border-color: var(--primary-blue);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.glass-card.scheme-card:hover {
  border-color: var(--accent-amber);
  box-shadow: var(--shadow-scheme-glow);
}

/* Top Header Navbar: Professional Deep Navy Header */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--navy-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
}

.nav-links a {
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.4rem 0.68rem;
  border-radius: var(--radius-sm);
  position: relative;
}

.nav-links a:hover, .nav-links a.active {
  color: #ffffff;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--primary-teal);
  border-radius: 2px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-switcher {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  padding: 3px;
  cursor: pointer;
  user-select: none;
}

.lang-btn {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  color: #cbd5e1;
  border: none;
  background: none;
  cursor: pointer;
  transition: var(--transition);
}

.lang-btn.active {
  background: #ffffff;
  color: var(--navy-dark);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Dynamic Sarkari Result Style Continuous Right -> Left Ticker */
.ticker-container {
  display: flex;
  align-items: center;
  background: var(--navy-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 46px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

.ticker-fixed-label {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-blue);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0 1rem;
  height: 100%;
  z-index: 10;
  letter-spacing: 0.5px;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #4ade80;
  animation: pulseGlow 1.5s infinite alternate;
}

@keyframes pulseGlow {
  0% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

.ticker-track-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.ticker-track {
  display: flex;
  align-items: center;
  white-space: nowrap;
  width: max-content;
  animation: marqueeRightToLeft 39s linear infinite;
}

.ticker-track-wrapper:hover .ticker-track {
  animation-play-state: paused;
}

.ticker-track-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-right: 0.8rem;
}

@keyframes marqueeRightToLeft {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.ticker-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.ticker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.ticker-tag-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}

.ticker-tag-title {
  color: #ffffff;
  font-weight: 600;
}

.ticker-tag-arrow {
  font-size: 0.8rem;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

.ticker-card:hover .ticker-tag-arrow {
  transform: translateX(3px);
}

/* Sarkari Result Inspired Color Tag Variations */
.tag-blue   { background: #1e3a8a; border: 1px solid #3b82f6; color: #ffffff; }
.tag-teal   { background: #0f766e; border: 1px solid #14b8a6; color: #ffffff; }
.tag-green  { background: #14532d; border: 1px solid #22c55e; color: #ffffff; }
.tag-purple { background: #581c87; border: 1px solid #a855f7; color: #ffffff; }
.tag-orange { background: #7c2d12; border: 1px solid #f97316; color: #ffffff; }
.tag-red    { background: #881337; border: 1px solid #f43f5e; color: #ffffff; }
.tag-gold   { background: #78350f; border: 1px solid #eab308; color: #ffffff; }

/* ==========================================================================
   HERO SECTION WITH REALISTIC WARM GOLDEN VISUAL & 3D ORBIT CAROUSEL
   ========================================================================== */

.hero-section {
  position: relative;
  padding: 3.5rem 0 4.5rem 0;
  overflow: hidden;
  min-height: 640px;
  background: linear-gradient(180deg, #f7f4ed 0%, #fbf9f4 100%);
  border-bottom: 1px solid var(--border-light);
}

.hero-bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 75% 25%, rgba(217, 119, 6, 0.08) 0%, transparent 65%),
    radial-gradient(circle at 25% 75%, rgba(29, 78, 216, 0.06) 0%, transparent 65%);
  pointer-events: none;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 2rem;
  align-items: center;
  position: relative;
  z-index: 10;
}

.hero-tagline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(13, 148, 136, 0.25);
  padding: 6px 16px;
  border-radius: var(--radius-full);
  color: var(--primary-teal-dark);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 1.2rem;
}

.hero-heading {
  font-size: 3.4rem;
  font-weight: 800;
  line-height: 1.14;
  margin-bottom: 1.2rem;
  color: var(--navy-dark);
}

.hero-heading span.gradient-text {
  color: var(--primary-blue);
  background: none;
  -webkit-text-fill-color: initial;
}

.hero-description {
  font-size: 1.12rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Button Component Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem 1.7rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--primary-blue);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.3);
}

.btn-primary:hover {
  background: var(--primary-blue-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 78, 216, 0.4);
}

.btn-outline {
  background: #ffffff;
  color: var(--navy-dark);
  border: 1.5px solid var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.btn-scheme {
  background: var(--accent-amber);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
}

.btn-scheme:hover {
  background: var(--accent-amber-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
}

/* 3D Circular Orbit Carousel Container */
.hero-visual-stage {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.hero-center-realistic-visual {
  position: absolute;
  width: 440px;
  height: 440px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 90%);
  -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 90%);
  box-shadow: 0 0 50px rgba(217, 119, 6, 0.25);
}

.hero-student-road-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 3D Orbit Carousel Cards */
.orbit-card {
  position: absolute;
  top: 40%;
  left: 38%;
  padding: 0.95rem 1.25rem;
  min-width: 185px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--navy-dark);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  will-change: transform, opacity;
  user-select: none;
}

.orbit-card .orbit-icon {
  font-size: 1.6rem;
}

.orbit-card .orbit-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--navy-dark);
  white-space: nowrap;
}

/* Front Active Orbit Card */
.orbit-card.is-front {
  border-color: var(--primary-blue);
  background: #ffffff;
  box-shadow: 0 0 35px rgba(29, 78, 216, 0.3), 0 12px 30px rgba(15, 23, 42, 0.15);
}

.orbit-card.is-front .orbit-title {
  color: var(--primary-blue);
}

.orbit-card:hover {
  border-color: var(--primary-blue) !important;
  box-shadow: 0 0 35px rgba(29, 78, 216, 0.35) !important;
}

/* Prominent Multi-line Opportunity Card Title */
.opportunity-card-title {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
  line-height: 1.38;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* QUICK ELIGIBILITY FINDER PANEL */
.eligibility-panel {
  margin-top: -1.5rem;
  position: relative;
  z-index: 40;
  padding: 2rem;
  background: #ffffff;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.finder-form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-control, .form-select, .form-input, .form-textarea {
  background: #ffffff;
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: 0.7rem 1rem;
  color: var(--navy-dark);
  font-size: 0.95rem;
  font-family: inherit;
  transition: var(--transition);
}

.form-control option {
  background-color: #ffffff;
  color: var(--navy-dark);
}

.form-control:focus, .form-select:focus, .form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 10px rgba(29, 78, 216, 0.25);
}

/* Section Title Styling */
.section-title-box {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title-box h2 {
  font-size: 2.3rem;
  color: var(--navy-dark);
  margin-bottom: 0.5rem;
}

.section-title-box p {
  color: var(--text-muted);
  font-size: 1.05rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.6rem;
}

/* Badges */
.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-open { background: rgba(13, 148, 136, 0.12); color: var(--primary-teal-dark); border: 1px solid rgba(13, 148, 136, 0.3); }
.badge-closing { background: rgba(225, 29, 72, 0.12); color: #be123c; border: 1px solid rgba(225, 29, 72, 0.3); }
.badge-upcoming { background: rgba(29, 78, 216, 0.12); color: var(--primary-blue); border: 1px solid rgba(29, 78, 216, 0.3); }
.badge-scheme { background: rgba(217, 119, 6, 0.12); color: var(--accent-amber-dark); border: 1px solid rgba(217, 119, 6, 0.3); }

/* Mandatory Government Information Disclaimer Banner */
.govt-disclaimer-banner {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.govt-disclaimer-banner .icon {
  font-size: 1.8rem;
  color: var(--accent-amber-dark);
}

.govt-disclaimer-banner p {
  margin: 0;
  font-size: 0.88rem;
  color: #78350f;
  line-height: 1.45;
}

/* HOW IT WORKS TIMELINE */
.how-it-works-timeline {
  position: relative;
  padding: 2rem 0;
}

.timeline-path-line {
  position: absolute;
  top: 50%;
  left: 5%;
  right: 5%;
  height: 4px;
  background: var(--border-light);
  z-index: 1;
}

.timeline-path-line-active {
  position: absolute;
  top: 50%;
  left: 5%;
  width: 0%;
  height: 4px;
  background: var(--primary-blue);
  z-index: 2;
  transition: width 0.6s ease;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  position: relative;
  z-index: 5;
}

.step-card {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.6rem 1.2rem;
  text-align: center;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.step-icon-circle {
  width: 52px;
  height: 52px;
  margin: 0 auto 1rem auto;
  border-radius: 50%;
  background: #f8fafc;
  border: 2px solid var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--text-muted);
  transition: var(--transition);
}

.step-card.active .step-icon-circle {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  background: #eff6ff;
  transform: scale(1.08);
}

/* GOVERNMENT SCHEMES VISUAL STAGE */
.schemes-section-stage {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  align-items: center;
  margin-top: 2rem;
}

.parliament-landmark-box {
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
  border-radius: var(--radius-lg);
  border: 1.5px solid #fde68a;
  box-shadow: var(--shadow-sm);
}

.parliament-building-icon {
  font-size: 6.5rem;
}

.orbit-bubble {
  position: absolute;
  padding: 0.6rem 1.1rem;
  background: #ffffff;
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--navy-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-md);
  animation: orbitFloat 4s ease-in-out infinite alternate;
}

.bubble-1 { top: 10%; left: 8%; animation-delay: 0s; }
.bubble-2 { top: 15%; right: 8%; animation-delay: 1s; }
.bubble-3 { top: 50%; left: 2%; animation-delay: 1.8s; }
.bubble-4 { top: 52%; right: 2%; animation-delay: 0.5s; }
.bubble-5 { bottom: 10%; left: 15%; animation-delay: 2.4s; }
.bubble-6 { bottom: 12%; right: 15%; animation-delay: 1.4s; }

@keyframes orbitFloat {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-8px); }
}

/* FINAL CTA SECTION */
.final-cta-wrapper {
  position: relative;
  width: 100%;
  padding: 5.5rem 0;
  margin-top: 4rem;
  background-image: 
    linear-gradient(to bottom, var(--bg-main) 0%, transparent 18%, transparent 82%, var(--bg-main) 100%),
    linear-gradient(90deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.85) 45%, rgba(15, 23, 42, 0.3) 100%),
    url('assets/final-cta-bg.jpg');
  background-size: cover;
  background-position: center right;
  background-repeat: no-repeat;
  min-height: 540px;
  display: flex;
  align-items: center;
}

.final-cta-container {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 10;
}

.final-cta-left {
  max-width: 580px;
}

/* Notification Bell & Drawer */
.notification-bell-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Footer: Professional Deep Navy Footer */
.footer {
  background: var(--navy-dark);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 0 2rem 0;
  margin-top: 5rem;
  color: #f8fafc;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand p {
  color: #cbd5e1;
  margin-top: 0.8rem;
  font-size: 0.95rem;
}

.footer-col h4 {
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 1.2rem;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.footer-col a {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.footer-col a:hover {
  color: #ffffff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Global Viewport Safety */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Mobile Navigation Hamburger Toggle Button */
.mobile-nav-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  cursor: pointer;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.mobile-nav-toggle .hamburger-bar {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #ffffff;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mobile-nav-toggle.is-active .hamburger-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.mobile-nav-toggle.is-active .hamburger-bar:nth-child(2) {
  opacity: 0;
}

.mobile-nav-toggle.is-active .hamburger-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Responsive Breakpoints */

/* Tablet Breakpoint (<= 992px) */
@media (max-width: 992px) {
  .navbar-inner {
    position: relative;
  }

  .mobile-nav-toggle {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-direction: column;
    padding: 1.2rem;
    gap: 0.8rem;
    z-index: 100;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
  }

  .nav-links.mobile-open {
    display: flex;
  }

  .hero-grid { 
    grid-template-columns: 1fr; 
    text-align: center;
    gap: 2.5rem;
  }

  .hero-description { 
    margin: 0 auto 2rem auto; 
  }

  .hero-actions { 
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-visual-stage {
    min-height: 420px;
    perspective: 900px;
  }

  .hero-center-realistic-visual {
    width: 340px;
    height: 340px;
  }

  .orbit-card {
    left: 32%;
    min-width: 155px;
    padding: 0.75rem 1rem;
  }

  .orbit-card .orbit-icon {
    font-size: 1.4rem;
  }

  .orbit-card .orbit-title {
    font-size: 0.85rem;
  }

  .finder-form-grid { grid-template-columns: 1fr 1fr; }
  .steps-grid { grid-template-columns: 1fr 1fr; }
  .schemes-section-stage { grid-template-columns: 1fr; }
  .final-cta-container { grid-template-columns: 1fr; text-align: center; }
  .final-cta-left { max-width: 100%; margin: 0 auto; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}

/* Mobile Breakpoint (<= 640px) */
@media (max-width: 640px) {
  .hero-heading { 
    font-size: 2.05rem; 
    line-height: 1.25;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-actions {
    gap: 0.75rem;
  }

  .hero-actions .btn {
    padding: 0.75rem 1.4rem;
    font-size: 0.92rem;
  }

  .hero-visual-stage {
    min-height: 330px;
    perspective: 700px;
  }

  .hero-center-realistic-visual {
    width: 250px;
    height: 250px;
  }

  .orbit-card {
    left: 28%;
    min-width: 130px;
    padding: 0.55rem 0.8rem;
    gap: 0.55rem;
  }

  .orbit-card .orbit-icon {
    font-size: 1.25rem;
  }

  .orbit-card .orbit-title {
    font-size: 0.78rem;
  }

  .ticker-container {
    height: 42px;
  }

  .ticker-fixed-label {
    font-size: 0.68rem;
    padding: 0 0.65rem;
    gap: 4px;
  }

  .ticker-card {
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
  }

  .finder-form-grid { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; }
  
  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Small Mobile Breakpoint (<= 390px) */
@media (max-width: 390px) {
  .hero-heading { 
    font-size: 1.75rem; 
  }

  .hero-tagline {
    font-size: 0.78rem;
  }

  .hero-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .hero-visual-stage {
    min-height: 290px;
    perspective: 600px;
  }

  .hero-center-realistic-visual {
    width: 210px;
    height: 210px;
  }

  .orbit-card {
    left: 24%;
    min-width: 112px;
    padding: 0.45rem 0.65rem;
    gap: 0.45rem;
  }

  .orbit-card .orbit-icon {
    font-size: 1.1rem;
  }

  .orbit-card .orbit-title {
    font-size: 0.72rem;
  }

  .nav-actions {
    gap: 0.5rem;
  }

  .nav-actions .btn {
    padding: 0.35rem 0.65rem !important;
    font-size: 0.78rem !important;
  }

  .lang-btn {
    padding: 2px 7px;
    font-size: 0.75rem;
  }

  .eligibility-panel {
    padding: 1.25rem;
  }

  .section-title-box h2 {
    font-size: 1.7rem;
  }
}

/* Public Banner Image Styles for Cards and Details */
.card-banner-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 0.8rem;
  display: block;
}

.detail-banner-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
  display: block;
}


`

---

