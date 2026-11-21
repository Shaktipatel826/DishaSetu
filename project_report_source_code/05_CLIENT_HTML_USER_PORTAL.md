# DishaSetu — Part 5: Frontend User Portal HTML Templates

## File: index.html
- **Path:** /public/index.html
- **Purpose:** Homepage with 3D elliptical orbit carousel, ticker, fresh opportunities, and CTA

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DishaSetu | Right Opportunity → Right Person → Right Time</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Dynamic Navbar Placeholder -->
  <div id="navbar-placeholder"></div>

  <!-- FRAME 2: Dynamic Latest Updates Marquee Ticker (Left -> Right) -->
  <div id="ticker-placeholder"></div>

  <main class="main-content">
    
    <!-- FRAME 1: HERO SECTION WITH STUDENT BACKPACK SILHOUETTE & CURVED GLOWING LIGHT ROAD -->
    <section class="hero-section">
      <div class="hero-bg-particles"></div>
      <div class="container hero-grid">
        <!-- Left Hero Text & CTA -->
        <div>
          <div class="hero-tagline">
            <span>✨</span> <span data-i18n="heroLabel">Your Digital Guide to Opportunities</span>
          </div>
          <h1 class="hero-heading">
            <span data-i18n="heroHeading">Find What's Meant for You.</span><br>
            <span class="gradient-text">Right Time. Right Person.</span>
          </h1>
          <p class="hero-description" data-i18n="heroSubtext">
            Discover scholarships, government schemes, competitions, exams, hackathons and skill programs — all in one place.
          </p>
          <div class="hero-actions">
            <a href="opportunities.html" class="btn btn-primary" data-i18n="btnFindOpportunities">
              🎓 Find Opportunities →
            </a>
            <a href="schemes.html" class="btn btn-scheme" data-i18n="btnGovernmentSchemes">
              🏛️ Government Schemes
            </a>
          </div>
        </div>

        <!-- Right Hero Visual Stage: Realistic Student with Backpack & Future Cyan Light Road (Behind 3D Orbit Carousel) -->
        <div class="hero-visual-stage">
          <!-- Realistic Student & Future Light Road Central Visual -->
          <div class="hero-center-realistic-visual">
            <img src="assets/hero-golden-hour.jpg" alt="Realistic Student Walking Along Golden Hour Light Road" class="hero-student-road-img">
          </div>

          <!-- 3D Circular / Elliptical Orbit Carousel Cards -->
          <a href="opportunities.html?type=Scholarship" class="orbit-card" data-index="0">
            <span class="orbit-icon">🎓</span>
            <span class="orbit-title">Scholarships</span>
          </a>

          <a href="opportunities.html?type=Quiz Competition" class="orbit-card" data-index="1">
            <span class="orbit-icon">🏆</span>
            <span class="orbit-title">Competitions</span>
          </a>

          <a href="schemes.html" class="orbit-card" data-index="2">
            <span class="orbit-icon">🏛️</span>
            <span class="orbit-title">Government Schemes</span>
          </a>

          <a href="opportunities.html?type=Hackathon" class="orbit-card" data-index="3">
            <span class="orbit-icon">💻</span>
            <span class="orbit-title">Hackathons</span>
          </a>

          <a href="opportunities.html?type=Skill Development Program" class="orbit-card" data-index="4">
            <span class="orbit-icon">⚙️</span>
            <span class="orbit-title">Skill Programs</span>
          </a>
        </div>
      </div>
    </section>

    <!-- QUICK ELIGIBILITY FINDER PANEL -->
    <section class="container mb-5">
      <div class="glass-panel eligibility-panel">
        <h3 style="color: var(--navy-dark); font-size: 1.3rem; margin-bottom: 1.2rem;" data-i18n="finderTitle">
          Find Opportunities For You
        </h3>
        <form onsubmit="handleEligibilityCheck(event)" class="finder-form-grid">
          <div class="form-group">
            <label data-i18n="labelAge">Age</label>
            <input type="number" id="finder-age" class="form-control" placeholder="e.g. 21" min="10" max="80" value="21">
          </div>

          <div class="form-group">
            <label data-i18n="labelEducation">Education</label>
            <select id="finder-education" class="form-control">
              <option value="Graduate">Graduate</option>
              <option value="12th">12th Pass</option>
              <option value="10th">10th Pass</option>
              <option value="Post Graduate">Post Graduate</option>
              <option value="Diploma">Diploma</option>
              <option value="ITI">ITI</option>
            </select>
          </div>

          <div class="form-group">
            <label data-i18n="labelState">State</label>
            <select id="finder-state" class="form-control">
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Punjab">Punjab</option>
              <option value="All India">All India</option>
            </select>
          </div>

          <div class="form-group">
            <label data-i18n="labelCategory">Category</label>
            <select id="finder-category" class="form-control">
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="Women">Women</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="height: 44px;" data-i18n="btnSearchNow">
            Find Opportunities →
          </button>
        </form>
      </div>
    </section>

    <!-- FRAME 3: HOW IT WORKS SECTION - ANIMATED STEPS -->
    <section id="how-it-works" class="container mb-5" style="padding-top: 2rem;">
      <div class="section-title-box">
        <h2 data-i18n="howItWorksTitle">Your Journey to a Better Future</h2>
        <p>Follow the path to discover, verify eligibility, and apply</p>
      </div>

      <div class="how-it-works-timeline">
        <div class="timeline-path-line"></div>
        <div id="timeline-active-line" class="timeline-path-line-active"></div>

        <div class="steps-grid">
          <div class="step-card active">
            <div class="step-icon-circle">👤</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">01</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step1Title">Tell Us About You</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step1Desc">Provide your age, education, state, and category.</p>
          </div>

          <div class="step-card">
            <div class="step-icon-circle">🔍</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">02</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step2Title">We Find Matches</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step2Desc">DishaSetu scans opportunities relevant to your profile.</p>
          </div>

          <div class="step-card">
            <div class="step-icon-circle">✓</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">03</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step3Title">Check Eligibility</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step3Desc">Instantly see itemized pass/fail criteria.</p>
          </div>

          <div class="step-card">
            <div class="step-icon-circle">🚀</div>
            <div style="font-size:0.75rem; color:var(--primary-teal); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">04</div>
            <h4 style="color:var(--navy-dark); margin-bottom:0.4rem;" data-i18n="step4Title">Apply & Grow</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;" data-i18n="step4Desc">Direct links to official application portals.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FRAME 4: FRESH OPPORTUNITIES FOR YOU SECTION -->
    <section class="container mb-5">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <div>
          <span class="card-badge badge-open" style="margin-bottom: 0.4rem;">Latest Opportunities</span>
          <h2 style="color: var(--navy-dark); font-size: 2.2rem; margin: 0;">Fresh Opportunities <span style="color: var(--primary-blue)">For You</span></h2>
        </div>
        <a href="opportunities.html" class="btn btn-outline" style="padding: 0.5rem 1.2rem; font-size: 0.88rem;">View All →</a>
      </div>

      <div id="fresh-opportunities-grid" class="cards-grid">
        <!-- Dynamically Populated via JS -->
      </div>
    </section>

    <!-- FRAME 5: GOVERNMENT SCHEMES SECTION - ANIMATED VISUAL WITH PARLIAMENT & BUBBLES -->
    <section class="container mb-5">
      <!-- Mandatory Government Disclaimer Banner -->
      <div class="govt-disclaimer-banner">
        <div class="icon">🏛️</div>
        <p data-i18n="govtDisclaimer">
          This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.
        </p>
      </div>

      <div class="schemes-section-stage">
        <!-- Left Text & CTA -->
        <div>
          <span class="card-badge badge-scheme" style="margin-bottom: 0.6rem;">Government Schemes</span>
          <h2 style="color: var(--navy-dark); font-size: 2.4rem; line-height: 1.2; margin-bottom: 1rem;">
            Schemes for a <span style="color: var(--accent-amber)">Stronger Tomorrow</span>
          </h2>
          <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 1.8rem;" data-i18n="exploreSchemesSubtext">
            Discover Central and State Government schemes designed to support education, employment, health, housing, skills and more.
          </p>
          <a href="schemes.html" class="btn btn-scheme" data-i18n="btnGovernmentSchemes">
            Explore Schemes →
          </a>
        </div>

        <!-- Right Visual: Parliament Building Silhouette with Orbiting Category Bubbles -->
        <div class="parliament-landmark-box">
          <div class="parliament-building-icon">🏛️</div>
          
          <div class="orbit-bubble bubble-1">🎓 Education</div>
          <div class="orbit-bubble bubble-2">💼 Employment</div>
          <div class="orbit-bubble bubble-3">👩 Women</div>
          <div class="orbit-bubble bubble-4">🌾 Farmers</div>
          <div class="orbit-bubble bubble-5">🏥 Health</div>
          <div class="orbit-bubble bubble-6">🏠 Housing</div>
        </div>
      </div>
    </section>

    <!-- FRAME 6: CINEMATIC FINAL MOTIVATIONAL CTA SECTION -->
    <section class="final-cta-wrapper">
      <div class="container final-cta-container">
        <!-- Left Area: Branding, Tagline & Button -->
        <div class="final-cta-left">
          <a href="index.html" class="brand-logo" style="margin-bottom: 1rem; display: inline-block;">
            <img src="assets/logo.png" alt="DishaSetu Logo" style="height: 44px; width: auto; object-fit: contain; filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));">
          </a>
          
          <p style="color: #cbd5e1; font-weight: 700; font-size: 1.05rem; margin-bottom: 1.8rem;" data-i18n="brandTagline">
            Right Opportunity → Right Person → Right Time
          </p>

          <a href="opportunities.html" class="btn btn-primary" style="padding: 0.95rem 2.4rem; font-size: 1.08rem;">
            Get Started Now →
          </a>
        </div>

        <!-- Right Side: Visually open to showcase the realistic student standing on mountain cliff looking at cyan horizon -->
        <div></div>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="brand-logo">
          <img src="assets/logo.png" alt="DishaSetu Logo" style="height: 40px; width: auto; object-fit: contain;">
        </a>
        <p data-i18n="brandTagline">Right Opportunity → Right Person → Right Time</p>
        <p style="font-size: 0.82rem; color: var(--text-subtle); margin-top: 0.5rem;">
          Your Digital Guide to Opportunities & Government Schemes
        </p>
      </div>

      <div class="footer-col">
        <h4 data-i18n="navOpportunities">Opportunities</h4>
        <ul>
          <li><a href="opportunities.html?type=Scholarship">Scholarships</a></li>
          <li><a href="opportunities.html?type=Hackathon">Hackathons</a></li>
          <li><a href="opportunities.html?type=Quiz Competition">Quiz Competitions</a></li>
          <li><a href="opportunities.html?type=Skill Development Program">Skill Programs</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 data-i18n="navSchemes">Government Schemes</h4>
        <ul>
          <li><a href="schemes.html?governmentType=Central">Central Schemes</a></li>
          <li><a href="schemes.html?governmentType=State">State Schemes</a></li>
          <li><a href="schemes.html?sector=Education">Education Schemes</a></li>
          <li><a href="schemes.html?sector=Skill Development">Skill Schemes</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Legal & Portal Info</h4>
        <ul>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="index.html">Disclaimer</a></li>
          <li><a href="login.html">Student Portal</a></li>
          <li><a href="admin-dashboard.html">Admin Console</a></li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© 2026 DishaSetu. All rights reserved.</span>
      <span>Designed for Student Empowerment & Guidance</span>
    </div>
  </footer>

  <!-- Modular Scripts -->
  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/eligibility.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    // Load Frame 4 Fresh Opportunities For You
    async function loadFreshOpportunities() {
      const grid = document.getElementById('fresh-opportunities-grid');
      if (!grid) return;

      try {
        const res = await fetch('/api/opportunities?limit=3');
        const data = await res.json();
        if (!data.success || !data.opportunities) return;

        const lang = getCurrentLanguage();
        grid.innerHTML = data.opportunities.map(op => {
          const title = getLocalized(op.title, lang);
          const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          const isClosing = op.status === 'CLOSING SOON';

          return `
            <div class="glass-card" style="padding: 1.6rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                ${op.publicBannerImage ? `<img src="${op.publicBannerImage}" alt="${title} Banner" class="card-banner-img" onerror="this.style.display='none'">` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${isClosing ? 'badge-closing' : 'badge-open'}">${op.type}</span>
                  <span class="card-badge ${isClosing ? 'badge-closing' : 'badge-open'}">${op.status}</span>
                </div>

                <h3 class="opportunity-card-title">${title}</h3>
                
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.8rem;">
                  🎯 For: Students | State: ${(op.eligibility.state || ['All India']).join(', ')}
                </div>

                <div style="font-size: 0.82rem; color: var(--text-subtle); margin-bottom: 0.8rem;">
                  🎓 Min. ${(op.eligibility.education || ['12th Pass'])[0]} | 🎂 Max. ${op.eligibility.maxAge || 25} Years
                </div>

                ${op.prizeAmount ? `<div style="font-size: 0.92rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 0.6rem;">💰 Prize: ${op.prizeAmount}</div>` : ''}
                
                <div style="font-size: 0.82rem; color: var(--text-subtle); margin-bottom: 1rem;">
                  📅 Last Date: <strong>${lastDateStr}</strong>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; pt-3; border-top: 1px solid var(--border-light);">
                <span class="card-badge badge-open" style="font-size: 0.72rem;">Eligible for You ✓</span>
                <a href="opportunity-details.html?id=${op._id}" class="btn btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;">
                  View →
                </a>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load Fresh Opportunities Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadFreshOpportunities);
  </script>
</body>
</html>

`

---

## File: login.html
- **Path:** /public/login.html
- **Purpose:** Unified student and administrator authentication login portal

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .role-tabs {
      display: flex;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-light);
      padding: 0.35rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }
    .role-tab {
      flex: 1;
      text-align: center;
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .role-tab.active {
      background: var(--primary-cyan);
      color: #090d16;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
    }
    .role-tab-admin.active {
      background: #4ade80;
      color: #090d16;
      box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
    }
  </style>
</head>
<body style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding-top: 5rem; padding-bottom: 3rem;">
  <div id="navbar-placeholder" style="width: 100%; position: fixed; top: 0; z-index: 100;"></div>

  <main class="container" style="max-width: 460px; width: 100%; padding: 1rem;">
    <div class="glass-panel" style="padding: 2.2rem; border-radius: 16px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <a href="index.html" class="brand-logo" style="justify-content: center; margin-bottom: 0.4rem;">
          <img src="assets/logo.png" alt="DishaSetu Logo" style="height: 42px; width: auto; filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));">
        </a>
        <h2 style="color: #fff; font-size: 1.5rem; margin-top: 0.5rem;" id="login-heading">Login to DishaSetu</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.2rem;" id="login-subtext">Access saved opportunities & student portal</p>
      </div>

      <!-- Role Selector Tabs: Student vs Admin -->
      <div class="role-tabs">
        <div id="tab-student" class="role-tab active" onclick="switchLoginRole('student')">
          🎓 Student Portal
        </div>
        <div id="tab-admin" class="role-tab role-tab-admin" onclick="switchLoginRole('admin')">
          🛡️ Admin Console
        </div>
      </div>

      <div id="login-alert" style="display: none; padding: 0.8rem; border-radius: 8px; margin-bottom: 1.2rem; font-size: 0.85rem;"></div>

      <form onsubmit="handleLogin(event)">
        <input type="hidden" id="login-role" value="student">

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;" id="email-label">Student Email Address</label>
          <input type="email" id="login-email" class="form-control" placeholder="student.demo@dishasetu.in" required value="student.demo@dishasetu.in">
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label style="display: block; color: #e2e8f0; font-size: 0.88rem; margin-bottom: 0.4rem;">Password</label>
          <input type="password" id="login-password" class="form-control" placeholder="••••••••" required value="Student@123">
        </div>

        <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.8rem; font-size: 1rem;">
          Login to Student Portal →
        </button>
      </form>

      <!-- Quick Demo Credentials Box -->
      <div style="margin-top: 1.5rem; background: rgba(15, 23, 42, 0.7); border: 1px dashed var(--border-light); padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.82rem; color: var(--text-muted);" id="demo-credentials-box">
        <strong style="color: var(--primary-cyan); display: block; margin-bottom: 0.2rem;">🔑 Demo Student Credentials:</strong>
        Email: <code style="color:#fff;">student.demo@dishasetu.in</code> | Password: <code style="color:#fff;">Student@123</code>
      </div>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
        Don't have a student account? <a href="register.html" style="color: var(--primary-cyan); font-weight: 700;">Register Here</a>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>

  <script>
    let currentRole = 'student';

    function switchLoginRole(role) {
      currentRole = role;
      document.getElementById('login-role').value = role;

      const tabStudent = document.getElementById('tab-student');
      const tabAdmin = document.getElementById('tab-admin');
      const heading = document.getElementById('login-heading');
      const subtext = document.getElementById('login-subtext');
      const emailLabel = document.getElementById('email-label');
      const submitBtn = document.getElementById('login-submit-btn');
      const demoBox = document.getElementById('demo-credentials-box');

      if (role === 'admin') {
        tabAdmin.classList.add('active');
        tabStudent.classList.remove('active');
        heading.innerText = 'Admin Control Console';
        subtext.innerText = 'Manage opportunities, schemes & review student submissions';
        emailLabel.innerText = 'Administrator Email';
        document.getElementById('login-email').value = 'admin@dishasetu.in';
        document.getElementById('login-password').value = 'Admin@123';
        submitBtn.className = 'btn btn-scheme';
        submitBtn.style.background = '#4ade80';
        submitBtn.style.color = '#090d16';
        submitBtn.innerText = 'Login to Admin Control Console →';
        
        demoBox.innerHTML = `
          <strong style="color: #4ade80; display: block; margin-bottom: 0.2rem;">🛡️ Admin Credentials options:</strong>
          Option 1: <code style="color:#fff;">admin@dishasetu.in</code> / <code style="color:#fff;">Admin@123</code><br>
          Option 2: <code style="color:#fff;">shivamkumarmzp2@gmail.com</code> / <code style="color:#fff;">Shakti@826</code>
        `;
      } else {
        tabStudent.classList.add('active');
        tabAdmin.classList.remove('active');
        heading.innerText = 'Login to Student Portal';
        subtext.innerText = 'Access saved opportunities & personalized recommendations';
        emailLabel.innerText = 'Student Email Address';
        document.getElementById('login-email').value = 'student.demo@dishasetu.in';
        document.getElementById('login-password').value = 'Student@123';
        submitBtn.className = 'btn btn-primary';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.innerText = 'Login to Student Portal →';

        demoBox.innerHTML = `
          <strong style="color: var(--primary-cyan); display: block; margin-bottom: 0.2rem;">🔑 Demo Student Credentials:</strong>
          Email: <code style="color:#fff;">student.demo@dishasetu.in</code> | Password: <code style="color:#fff;">Student@123</code>
        `;
      }
    }

    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const role = document.getElementById('login-role').value;
      const alertBox = document.getElementById('login-alert');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('dishasetu_user', JSON.stringify(data.user));
          
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(34, 197, 94, 0.2)';
          alertBox.style.border = '1px solid #22c55e';
          alertBox.style.color = '#86efac';
          alertBox.innerText = `🎉 Login successful! Welcome ${data.user.name}. Redirecting...`;

          setTimeout(() => {
            if (data.user.role === 'admin') {
              window.location.href = 'admin-dashboard.html';
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 1000);
        } else {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
          alertBox.style.border = '1px solid #ef4444';
          alertBox.style.color = '#fca5a5';
          alertBox.innerText = '❌ ' + (data.message || 'Invalid credentials');
        }
      } catch (err) {
        console.error('Login error:', err);
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerText = '❌ Connection error during login. Please try again.';
      }
    }
  </script>
</body>
</html>

`

---

## File: register.html
- **Path:** /public/register.html
- **Purpose:** Student account registration portal with educational profile inputs

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Registration | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh;">
  <div id="navbar-placeholder" style="width: 100%; position: absolute; top: 0;"></div>

  <main class="container" style="max-width: 520px; width: 100%; padding: 4rem 1rem 2rem 1rem;">
    <div class="glass-panel" style="padding: 2.5rem;">
      <div style="text-align: center; margin-bottom: 1.8rem;">
        <a href="index.html" class="brand-logo" style="justify-content: center; margin-bottom: 0.5rem;">
          <div class="logo-icon">✨</div>
          <span>Disha<span style="color: var(--primary-cyan)">Setu</span></span>
        </a>
        <h2 style="color: #fff; font-size: 1.5rem; margin-top: 0.5rem;">Create Student Profile</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem;">Start discovering personalized opportunities & government schemes</p>
      </div>

      <form onsubmit="handleRegister(event)">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Full Name</label>
          <input type="text" id="reg-name" class="form-control" placeholder="Rahul Verma" required>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Email Address</label>
          <input type="email" id="reg-email" class="form-control" placeholder="rahul@example.com" required>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Password</label>
          <input type="password" id="reg-password" class="form-control" placeholder="••••••••" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label>Age</label>
            <input type="number" id="reg-age" class="form-control" placeholder="21" required value="21">
          </div>

          <div class="form-group">
            <label>Education</label>
            <select id="reg-edu" class="form-control">
              <option value="Graduate">Graduate</option>
              <option value="12th">12th Pass</option>
              <option value="10th">10th Pass</option>
              <option value="Post Graduate">Post Graduate</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="form-group">
            <label>State</label>
            <select id="reg-state" class="form-control">
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="All India">All India</option>
            </select>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select id="reg-cat" class="form-control">
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="Women">Women</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
          Register Profile →
        </button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
        Already registered? <a href="login.html" style="color: var(--primary-cyan); font-weight: 700;">Login Here</a>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>

  <script>
    async function handleRegister(e) {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const age = document.getElementById('reg-age').value;
      const education = document.getElementById('reg-edu').value;
      const state = document.getElementById('reg-state').value;
      const category = document.getElementById('reg-cat').value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, age, education, state, category }),
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('dishasetu_user', JSON.stringify(data.user));
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
      }
    }
  </script>
</body>
</html>

`

---

## File: dashboard.html
- **Path:** /public/dashboard.html
- **Purpose:** Student personal dashboard with personalized recommendations

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Dashboard | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Welcome Header -->
    <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="card-badge badge-open" style="margin-bottom: 0.5rem;">Student Profile</span>
          <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.4rem;">
            Welcome back, <span id="dash-user-name" style="color: var(--primary-cyan);">Student</span>!
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">
            Here are personalized opportunity recommendations matched to your profile.
          </p>
        </div>

        <button class="btn btn-outline" onclick="openEditProfileModal()">
          ⚙️ Edit Student Profile
        </button>
      </div>

      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid var(--border-light); font-size: 0.9rem;">
        <span>🎓 Qualification: <strong id="dash-edu" style="color:#fff;">Graduate</strong></span>
        <span>📍 State: <strong id="dash-state" style="color:#fff;">Uttar Pradesh</strong></span>
        <span>🎂 Age: <strong id="dash-age" style="color:#fff;">21 Years</strong></span>
        <span>🏷️ Category: <strong id="dash-cat" style="color:#fff;">General</strong></span>
      </div>
    </div>

    <!-- Recommended For You Section -->
    <div style="margin-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="color: #fff; font-size: 1.6rem; margin-bottom: 0.2rem;">✨ Recommended For You</h2>
          <p style="color: var(--text-muted); font-size: 0.92rem; margin: 0;">Based on your qualification, age, and state profile</p>
        </div>
      </div>

      <div id="dash-recommend-grid" class="cards-grid">
        <!-- Dynamically Populated -->
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/eligibility.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadStudentDashboard() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!data.success || !data.user) {
          window.location.href = 'login.html';
          return;
        }

        const user = data.user;
        localStorage.setItem('dishasetu_user', JSON.stringify(user));

        document.getElementById('dash-user-name').innerText = user.name;
        document.getElementById('dash-edu').innerText = user.education || 'Graduate';
        document.getElementById('dash-state').innerText = user.state || 'All India';
        document.getElementById('dash-age').innerText = (user.age || '21') + ' Years';
        document.getElementById('dash-cat').innerText = user.category || 'General';

        // Fetch Recommendations based on user profile
        fetchRecommendations(user);
      } catch (err) {
        console.error('Dashboard Error:', err);
      }
    }

    async function fetchRecommendations(user) {
      const grid = document.getElementById('dash-recommend-grid');
      try {
        const res = await fetch('/api/opportunities/check-eligibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: user.age || 21,
            education: user.education || 'Graduate',
            state: user.state || 'Uttar Pradesh',
            category: user.category || 'General'
          })
        });

        const data = await res.json();
        if (!data.success || !data.results) return;

        const lang = getCurrentLanguage();
        const topMatches = data.results.slice(0, 6);

        grid.innerHTML = topMatches.map(item => {
          const op = item.opportunity;
          const title = getLocalized(op.title, lang);
          const desc = getLocalized(op.description, lang);
          const isEligible = item.status === 'ELIGIBLE';

          return `
            <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${isEligible ? 'badge-open' : 'badge-closing'}">
                    ${isEligible ? '✓ Eligible' : '⚠ Likely Eligible'}
                  </span>
                  <span style="font-weight: 800; color: var(--primary-cyan); font-size: 0.82rem;">
                    ${item.matchCount}/4 Matched
                  </span>
                </div>

                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">${desc.substring(0, 100)}...</p>
                
                ${op.prizeAmount ? `<div style="font-size: 0.88rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 0.8rem;">💰 ${op.prizeAmount}</div>` : ''}
              </div>

              <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
                <a href="opportunity-details.html?id=${op._id}" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.82rem; justify-content: center;">
                  View Details
                </a>
                <button class="btn btn-primary" style="padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="openSaveReminderModal('Opportunity', '${op._id}')">
                  🔖 Save
                </button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Fetch Recommendations Error:', err);
      }
    }

    function openEditProfileModal() {
      const age = prompt('Enter your age:', '21');
      const education = prompt('Enter your highest qualification (10th, 12th, Graduate, Post Graduate, Diploma, ITI):', 'Graduate');
      const state = prompt('Enter your state (e.g. Uttar Pradesh, Madhya Pradesh, Maharashtra, All India):', 'Uttar Pradesh');
      const category = prompt('Enter category (General, OBC, SC, ST, EWS, Women):', 'General');

      if (age && education) {
        fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age, education, state, category }),
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Profile updated successfully!');
            loadStudentDashboard();
          }
        });
      }
    }

    document.addEventListener('DOMContentLoaded', loadStudentDashboard);
  </script>
</body>
</html>

`

---

## File: opportunities.html
- **Path:** /public/opportunities.html
- **Purpose:** Comprehensive opportunity search, type filtering, and category browsing view

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Opportunities Discovery | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2rem; padding-bottom: 4rem;">
    <!-- Page Header -->
    <div style="margin-bottom: 2rem;">
      <h1 style="color: var(--navy-dark); font-size: 2.4rem; margin-bottom: 0.5rem;" data-i18n="navOpportunities">
        Student Opportunities
      </h1>
      <p style="color: var(--text-muted); font-size: 1.05rem;">
        Discover scholarships, competitive exams, coding hackathons, essay competitions & prize opportunities.
      </p>
    </div>

    <!-- Search & Filter Controls Grid -->
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start;">
      
      <!-- Filters Sidebar -->
      <div class="glass-panel" style="padding: 1.5rem; position: sticky; top: 90px;">
        <h3 style="color: var(--navy-dark); font-size: 1.1rem; margin-bottom: 1.2rem;">🔍 Filter Opportunities</h3>
        
        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Search Keyword</label>
          <input type="text" id="filter-search" class="form-control" placeholder="Search title or keyword..." oninput="loadOpportunities()">
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Opportunity Type</label>
          <select id="filter-type" class="form-control" onchange="loadOpportunities()">
            <option value="All">All Opportunity Types</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Hackathon">Coding & Hackathon</option>
            <option value="Quiz Competition">Quiz Competition</option>
            <option value="Essay Competition">Essay Competition</option>
            <option value="Competitive Exam">Competitive Exam</option>
            <option value="Skill Development Program">Skill Program</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Education</label>
          <select id="filter-education" class="form-control" onchange="loadOpportunities()">
            <option value="Any">Any Qualification</option>
            <option value="10th">10th Pass</option>
            <option value="12th">12th Pass</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
            <option value="Diploma">Diploma</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>State</label>
          <select id="filter-state" class="form-control" onchange="loadOpportunities()">
            <option value="All India">All India</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label>Status</label>
          <select id="filter-status" class="form-control" onchange="loadOpportunities()">
            <option value="All">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSING SOON">Closing Soon</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
        </div>

        <button class="btn btn-outline" style="width: 100%; justify-content: center;" onclick="resetFilters()">Reset Filters</button>
      </div>

      <!-- Opportunities Cards Grid -->
      <div>
        <div id="opportunities-loading" style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">✨</div>
          <p data-i18n="loading">Finding the right opportunities for you...</p>
        </div>

        <div id="opportunities-grid" class="cards-grid" style="display: none;">
          <!-- Dynamically Populated -->
        </div>

        <div id="opportunities-empty" style="display: none; text-align: center; padding: 4rem 0;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎓</div>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">No matching opportunities found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try adjusting your filters or search keywords.</p>
          <button class="btn btn-primary" onclick="resetFilters()">Explore All Opportunities</button>
        </div>
      </div>

    </div>
  </main>

  <!-- Modular Scripts -->
  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/eligibility.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadOpportunities() {
      const loading = document.getElementById('opportunities-loading');
      const grid = document.getElementById('opportunities-grid');
      const empty = document.getElementById('opportunities-empty');

      loading.style.display = 'block';
      grid.style.display = 'none';
      empty.style.display = 'none';

      const search = document.getElementById('filter-search')?.value || '';
      const type = document.getElementById('filter-type')?.value || 'All';
      const education = document.getElementById('filter-education')?.value || 'Any';
      const state = document.getElementById('filter-state')?.value || 'All India';
      const status = document.getElementById('filter-status')?.value || 'All';

      // Parse query string parameters on initial load
      const urlParams = new URLSearchParams(window.location.search);
      const initialType = urlParams.get('type');
      if (initialType && !search && type === 'All') {
        document.getElementById('filter-type').value = initialType;
      }

      try {
        const query = new URLSearchParams({ search, type: document.getElementById('filter-type').value, education, state, status });
        const res = await fetch(`/api/opportunities?${query.toString()}`);
        const data = await res.json();

        loading.style.display = 'none';

        if (!data.success || !data.opportunities || data.opportunities.length === 0) {
          empty.style.display = 'block';
          return;
        }

        const lang = getCurrentLanguage();
        grid.innerHTML = data.opportunities.map(op => {
          const title = getLocalized(op.title, lang);
          const desc = getLocalized(op.description, lang);
          const benefits = getLocalized(op.benefits, lang);
          const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

          let badgeClass = 'badge-open';
          if (op.status === 'CLOSING SOON') badgeClass = 'badge-closing';
          if (op.status === 'UPCOMING') badgeClass = 'badge-upcoming';

          return `
            <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                ${op.publicBannerImage ? `<img src="${op.publicBannerImage}" alt="${title} Banner" class="card-banner-img" onerror="this.style.display='none'">` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${badgeClass}">${op.type}</span>
                  <span class="card-badge ${badgeClass}">${op.status}</span>
                </div>
                <h3 class="opportunity-card-title">${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">${desc.substring(0, 110)}...</p>
                
                ${op.prizeAmount ? `<div style="font-size: 0.9rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 0.5rem;">💰 ${op.prizeAmount}</div>` : ''}
                
                <div style="font-size: 0.8rem; color: var(--text-subtle); margin-bottom: 1rem;">
                  📅 Last Date: <strong>${lastDateStr}</strong>
                </div>
              </div>

              <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
                <a href="opportunity-details.html?id=${op._id}" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.82rem; justify-content: center;">
                  ${t('btnViewDetails', lang)}
                </a>
                <button id="save-btn-${op._id}" class="btn btn-primary" style="padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="openSaveReminderModal('Opportunity', '${op._id}')">
                  🔖 ${t('btnSave', lang)}
                </button>
              </div>
            </div>
          `;
        }).join('');

        grid.style.display = 'grid';
      } catch (err) {
        console.error('Load Opportunities Error:', err);
        loading.style.display = 'none';
        empty.style.display = 'block';
      }
    }

    function resetFilters() {
      document.getElementById('filter-search').value = '';
      document.getElementById('filter-type').value = 'All';
      document.getElementById('filter-education').value = 'Any';
      document.getElementById('filter-state').value = 'All India';
      document.getElementById('filter-status').value = 'All';
      loadOpportunities();
    }

    document.addEventListener('DOMContentLoaded', loadOpportunities);
  </script>
</body>
</html>

`

---

## File: opportunity-details.html
- **Path:** /public/opportunity-details.html
- **Purpose:** Detailed opportunity view with banner, eligibility criteria, and apply link

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opportunity Details | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <div id="details-loading" style="text-align: center; padding: 4rem 0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
      <p>Loading opportunity details...</p>
    </div>

    <div id="details-container" style="display: none; grid-template-columns: 1fr 340px; gap: 2.5rem; align-items: start;">
      <!-- Main Content Left -->
      <div>
        <div id="detail-banner-box"></div>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem;">
          <span id="detail-type-badge" class="card-badge badge-open">Scholarship</span>
          <span id="detail-status-badge" class="card-badge badge-open">OPEN</span>
        </div>

        <h1 id="detail-title" style="color: var(--navy-dark); font-size: 2.2rem; margin-bottom: 1rem; line-height: 1.3; word-break: break-word; overflow-wrap: break-word;">Opportunity Title</h1>

        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: var(--navy-dark); font-size: 1.2rem; margin-bottom: 0.8rem;">📋 Overview</h3>
          <p id="detail-description" style="color: var(--text-muted); font-size: 1rem; line-height: 1.7; margin: 0;"></p>
        </div>

        <!-- Eligibility Section -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: var(--navy-dark); font-size: 1.2rem; margin-bottom: 1rem;">🎯 Eligibility Criteria</h3>
          <div id="detail-eligibility-box" style="color: var(--text-muted); font-size: 0.95rem;"></div>
        </div>

        <!-- Benefits & Prize -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">💡 Benefits & Financial Aid</h3>
          <p id="detail-benefits" style="color: var(--primary-cyan); font-weight: 700; font-size: 1.05rem; margin: 0;"></p>
        </div>

        <!-- Documents Required -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">📁 Required Documents</h3>
          <p id="detail-documents" style="color: var(--text-muted); font-size: 0.95rem; margin: 0;"></p>
        </div>

        <!-- Application Process Steps -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">🚀 How to Apply (Step-by-Step)</h3>
          <div id="detail-process-box" style="color: var(--text-muted); font-size: 0.95rem; white-space: pre-line;"></div>
        </div>
      </div>

      <!-- Sticky Right Summary Sidebar -->
      <div class="glass-panel" style="padding: 1.8rem; position: sticky; top: 90px;">
        <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1.2rem;">Quick Summary</h3>

        <div style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.8rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Last Date to Apply</span>
          <div id="detail-last-date" style="font-size: 1.1rem; font-weight: 800; color: #f87171; margin-top: 0.2rem;">-</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Official Portal</span>
          <div style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 600; margin-top: 0.2rem; word-break: break-all;" id="detail-url-text">-</div>
        </div>

        <a id="detail-apply-btn" href="#" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 0.8rem;">
          🚀 Apply Now (Official Portal)
        </a>

        <button id="detail-save-btn" class="btn btn-outline" style="width: 100%; justify-content: center;">
          🔖 Save & Remind Me
        </button>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadOpportunityDetails() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (!id) {
        window.location.href = 'opportunities.html';
        return;
      }

      try {
        const res = await fetch(`/api/opportunities/${id}`);
        const data = await res.json();
        if (!data.success || !data.opportunity) {
          alert('Opportunity not found.');
          window.location.href = 'opportunities.html';
          return;
        }

        const op = data.opportunity;
        const lang = getCurrentLanguage();

        document.getElementById('details-loading').style.display = 'none';
        const container = document.getElementById('details-container');
        container.style.display = 'grid';

        const bannerBox = document.getElementById('detail-banner-box');
        if (op.publicBannerImage) {
          bannerBox.innerHTML = `<img src="${op.publicBannerImage}" alt="${getLocalized(op.title, lang)} Banner" class="detail-banner-img" onerror="this.style.display='none'">`;
        } else {
          bannerBox.innerHTML = '';
        }

        document.getElementById('detail-type-badge').innerText = op.type;
        document.getElementById('detail-status-badge').innerText = op.status;
        document.getElementById('detail-title').innerText = getLocalized(op.title, lang);
        document.getElementById('detail-description').innerText = getLocalized(op.description, lang);
        document.getElementById('detail-benefits').innerText = getLocalized(op.benefits, lang) || op.prizeAmount || 'Financial aid as per program rules.';
        document.getElementById('detail-documents').innerText = getLocalized(op.documents, lang) || 'Identity proof, marksheets, income certificate if applicable.';
        document.getElementById('detail-process-box').innerText = getLocalized(op.applicationProcess, lang) || 'Visit official website and fill application form.';

        // Eligibility breakdown
        const el = op.eligibility || {};
        document.getElementById('detail-eligibility-box').innerHTML = `
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
            <li>• Age: <strong>${el.minAge || 0} – ${el.maxAge || 100} Years</strong></li>
            <li>• Qualification: <strong>${(el.education || ['Any']).join(', ')}</strong></li>
            <li>• Eligible States: <strong>${(el.state || ['All India']).join(', ')}</strong></li>
            <li>• Categories: <strong>${(el.category || ['All']).join(', ')}</strong></li>
            ${el.details ? `<li style="margin-top: 0.5rem; color: #fff;">• Note: ${getLocalized(el.details, lang)}</li>` : ''}
          </ul>
        `;

        const lastDateStr = op.lastDate ? new Date(op.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Open';
        document.getElementById('detail-last-date').innerText = lastDateStr;
        document.getElementById('detail-url-text').innerText = op.applyUrl;
        document.getElementById('detail-apply-btn').href = op.applyUrl;

        document.getElementById('detail-save-btn').onclick = () => openSaveReminderModal('Opportunity', op._id);
      } catch (err) {
        console.error('Load Details Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadOpportunityDetails);
  </script>
</body>
</html>

`

---

## File: schemes.html
- **Path:** /public/schemes.html
- **Purpose:** Government scheme directory with central/state filters and sector categorization

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Schemes Portal | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2rem; padding-bottom: 4rem;">
    
    <!-- Mandatory Government Disclaimer Banner -->
    <div class="govt-disclaimer-banner">
      <div class="icon">🏛️</div>
      <p data-i18n="govtDisclaimer">
        This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.
      </p>
    </div>

    <!-- Page Header -->
    <div style="margin-bottom: 2rem;">
      <h1 style="color: var(--navy-dark); font-size: 2.4rem; margin-bottom: 0.5rem;" data-i18n="exploreSchemesTitle">
        Schemes for a Stronger Tomorrow
      </h1>
      <p style="color: var(--text-muted); font-size: 1.05rem;" data-i18n="exploreSchemesSubtext">
        Discover Central and State Government schemes designed to support education, employment, health, housing, skills and more.
      </p>
    </div>

    <!-- Tabs: All / Central / State -->
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
      <button class="btn btn-outline scheme-tab active" data-gov="All" onclick="selectGovTab(this, 'All')">All Schemes</button>
      <button class="btn btn-outline scheme-tab" data-gov="Central" onclick="selectGovTab(this, 'Central')">Central Schemes</button>
      <button class="btn btn-outline scheme-tab" data-gov="State" onclick="selectGovTab(this, 'State')">State Schemes</button>
    </div>

    <!-- Filter Grid -->
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start;">
      
      <div class="glass-panel" style="padding: 1.5rem; position: sticky; top: 90px;">
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1.2rem;">🏛️ Sector Filters</h3>
        
        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Search Scheme</label>
          <input type="text" id="scheme-search" class="form-control" placeholder="Scheme name..." oninput="loadSchemes()">
        </div>

        <div class="form-group" style="margin-bottom: 1.2rem;">
          <label>Sector / Category</label>
          <select id="scheme-sector" class="form-control" onchange="loadSchemes()">
            <option value="All">All Sectors</option>
            <option value="Education">Education</option>
            <option value="Employment">Employment</option>
            <option value="Women">Women</option>
            <option value="Farmers">Farmers</option>
            <option value="Health">Health</option>
            <option value="Housing">Housing</option>
            <option value="Skill Development">Skill Development</option>
            <option value="Financial Assistance">Financial Assistance</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label>State Filter</label>
          <select id="scheme-state" class="form-control" onchange="loadSchemes()">
            <option value="All India">All India / All States</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <button class="btn btn-outline" style="width: 100%; justify-content: center;" onclick="resetSchemeFilters()">Reset Filters</button>
      </div>

      <!-- Schemes Grid -->
      <div>
        <div id="schemes-loading" style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏛️</div>
          <p>Fetching government schemes...</p>
        </div>

        <div id="schemes-grid" class="cards-grid" style="display: none;">
          <!-- Dynamically Populated -->
        </div>

        <div id="schemes-empty" style="display: none; text-align: center; padding: 4rem 0;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🏛️</div>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">No matching government schemes found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try adjusting your sector or state filters.</p>
          <button class="btn btn-scheme" onclick="resetSchemeFilters()">View All Schemes</button>
        </div>
      </div>

    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    let currentGovType = 'All';

    function selectGovTab(btn, govType) {
      document.querySelectorAll('.scheme-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGovType = govType;
      loadSchemes();
    }

    async function loadSchemes() {
      const loading = document.getElementById('schemes-loading');
      const grid = document.getElementById('schemes-grid');
      const empty = document.getElementById('schemes-empty');

      loading.style.display = 'block';
      grid.style.display = 'none';
      empty.style.display = 'none';

      const search = document.getElementById('scheme-search')?.value || '';
      const sector = document.getElementById('scheme-sector')?.value || 'All';
      const stateName = document.getElementById('scheme-state')?.value || 'All India';

      try {
        const query = new URLSearchParams({ search, sector, governmentType: currentGovType, stateName });
        const res = await fetch(`/api/schemes?${query.toString()}`);
        const data = await res.json();

        loading.style.display = 'none';

        if (!data.success || !data.schemes || data.schemes.length === 0) {
          empty.style.display = 'block';
          return;
        }

        const lang = getCurrentLanguage();
        grid.innerHTML = data.schemes.map(sch => {
          const title = getLocalized(sch.title, lang);
          const desc = getLocalized(sch.description, lang);
          const benefits = getLocalized(sch.benefits, lang);

          return `
            <div class="glass-card scheme-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge badge-scheme">🏛️ ${sch.governmentType} Scheme</span>
                  <span style="font-size: 0.8rem; color: var(--scheme-amber); font-weight: 700;">📍 ${sch.stateName}</span>
                </div>
                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">${desc.substring(0, 110)}...</p>

                ${benefits ? `<div style="font-size: 0.85rem; font-weight: 700; color: var(--scheme-amber); margin-bottom: 1rem;">💡 ${benefits}</div>` : ''}
              </div>

              <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
                <a href="scheme-details.html?id=${sch._id}" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.82rem; justify-content: center;">
                  ${t('btnViewDetails', lang)}
                </a>
                <button id="save-btn-${sch._id}" class="btn btn-scheme" style="padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="openSaveReminderModal('Scheme', '${sch._id}')">
                  🔖 ${t('btnSave', lang)}
                </button>
              </div>
            </div>
          `;
        }).join('');

        grid.style.display = 'grid';
      } catch (err) {
        console.error('Load Schemes Error:', err);
        loading.style.display = 'none';
        empty.style.display = 'block';
      }
    }

    function resetSchemeFilters() {
      document.getElementById('scheme-search').value = '';
      document.getElementById('scheme-sector').value = 'All';
      document.getElementById('scheme-state').value = 'All India';
      currentGovType = 'All';
      document.querySelectorAll('.scheme-tab').forEach(b => b.classList.remove('active'));
      document.querySelector('.scheme-tab[data-gov="All"]').classList.add('active');
      loadSchemes();
    }

    document.addEventListener('DOMContentLoaded', loadSchemes);
  </script>
</body>
</html>

`

---

## File: scheme-details.html
- **Path:** /public/scheme-details.html
- **Purpose:** Government scheme detailed view with benefits and portal application steps

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Scheme Details | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2rem; padding-bottom: 5rem;">
    
    <!-- Mandatory Government Disclaimer Banner -->
    <div class="govt-disclaimer-banner">
      <div class="icon">🏛️</div>
      <p data-i18n="govtDisclaimer">
        This platform is an information and discovery portal. It is not an official government website. Always verify eligibility, dates and application details on the official website before applying.
      </p>
    </div>

    <div id="scheme-details-loading" style="text-align: center; padding: 4rem 0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🏛️</div>
      <p>Loading scheme details...</p>
    </div>

    <div id="scheme-details-container" style="display: none; grid-template-columns: 1fr 340px; gap: 2.5rem; align-items: start;">
      <!-- Main Content Left -->
      <div>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem;">
          <span id="scheme-gov-badge" class="card-badge badge-scheme">Central Scheme</span>
          <span id="scheme-state-badge" style="font-size: 0.82rem; color: var(--scheme-amber); font-weight: 700;">📍 All India</span>
        </div>

        <h1 id="scheme-title" style="color: var(--navy-dark); font-size: 2.2rem; margin-bottom: 1rem;">Government Scheme Title</h1>

        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: var(--navy-dark); font-size: 1.2rem; margin-bottom: 0.8rem;">📋 Overview</h3>
          <p id="scheme-description" style="color: var(--text-muted); font-size: 1rem; line-height: 1.7; margin: 0;"></p>
        </div>

        <!-- Eligibility Section -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">🎯 Target Audience & Eligibility</h3>
          <div id="scheme-eligibility-box" style="color: var(--text-muted); font-size: 0.95rem;"></div>
        </div>

        <!-- Benefits -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">💡 Key Scheme Benefits</h3>
          <p id="scheme-benefits" style="color: var(--scheme-amber); font-weight: 700; font-size: 1.05rem; margin: 0;"></p>
        </div>

        <!-- Required Documents -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.8rem;">📁 Required Documents</h3>
          <p id="scheme-documents" style="color: var(--text-muted); font-size: 0.95rem; margin: 0;"></p>
        </div>

        <!-- Application Process -->
        <div class="glass-panel" style="padding: 1.8rem; margin-bottom: 2rem;">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">🚀 Official Application Process</h3>
          <div id="scheme-process-box" style="color: var(--text-muted); font-size: 0.95rem; white-space: pre-line;"></div>
        </div>
      </div>

      <!-- Sticky Right Summary Sidebar -->
      <div class="glass-panel" style="padding: 1.8rem; position: sticky; top: 90px; border-color: var(--border-scheme-glow);">
        <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 1.2rem;">Scheme Summary</h3>

        <div style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.8rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Sector</span>
          <div id="scheme-sector-text" style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">-</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Official Portal Link</span>
          <div style="font-size: 0.85rem; color: var(--scheme-amber); font-weight: 600; margin-top: 0.2rem; word-break: break-all;" id="scheme-url-text">-</div>
        </div>

        <a id="scheme-apply-btn" href="#" target="_blank" class="btn btn-scheme" style="width: 100%; justify-content: center; margin-bottom: 0.8rem;">
          🏛️ Visit Official Govt Portal →
        </a>

        <button id="scheme-save-btn" class="btn btn-outline" style="width: 100%; justify-content: center;">
          🔖 Save Scheme & Remind Me
        </button>
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadSchemeDetails() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (!id) {
        window.location.href = 'schemes.html';
        return;
      }

      try {
        const res = await fetch(`/api/schemes/${id}`);
        const data = await res.json();
        if (!data.success || !data.scheme) {
          alert('Government scheme not found.');
          window.location.href = 'schemes.html';
          return;
        }

        const sch = data.scheme;
        const lang = getCurrentLanguage();

        document.getElementById('scheme-details-loading').style.display = 'none';
        const container = document.getElementById('scheme-details-container');
        container.style.display = 'grid';

        document.getElementById('scheme-gov-badge').innerText = `${sch.governmentType} Scheme`;
        document.getElementById('scheme-state-badge').innerText = `📍 ${sch.stateName}`;
        document.getElementById('scheme-title').innerText = getLocalized(sch.title, lang);
        document.getElementById('scheme-description').innerText = getLocalized(sch.description, lang);
        document.getElementById('scheme-benefits').innerText = getLocalized(sch.benefits, lang) || 'Government subsidies and assistance.';
        document.getElementById('scheme-documents').innerText = getLocalized(sch.documents, lang) || 'Aadhar card, Domicile certificate, Income certificate.';
        document.getElementById('scheme-process-box').innerText = getLocalized(sch.applicationProcess, lang) || 'Apply online on the official portal.';
        document.getElementById('scheme-sector-text').innerText = sch.sector;

        document.getElementById('scheme-url-text').innerText = sch.applyUrl;
        document.getElementById('scheme-apply-btn').href = sch.applyUrl;

        document.getElementById('scheme-save-btn').onclick = () => openSaveReminderModal('Scheme', sch._id);
      } catch (err) {
        console.error('Load Scheme Details Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadSchemeDetails);
  </script>
</body>
</html>

`

---

## File: saved-opportunities.html
- **Path:** /public/saved-opportunities.html
- **Purpose:** Student bookmarked opportunities and upcoming deadline tracker

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saved Opportunities & Reminders | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="navbar-placeholder"></div>
  <div id="ticker-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <div style="margin-bottom: 2rem;">
      <h1 style="color: #fff; font-size: 2.2rem; margin-bottom: 0.5rem;" data-i18n="navSaved">Saved Items</h1>
      <p style="color: var(--text-muted); font-size: 1rem;">
        Track your bookmarked student opportunities and government schemes with active deadline reminders.
      </p>
    </div>

    <div id="saved-loading" style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
      <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔖</div>
      <p>Loading your saved items...</p>
    </div>

    <div id="saved-grid" class="cards-grid" style="display: none;">
      <!-- Dynamically Populated -->
    </div>

    <div id="saved-empty" style="display: none; text-align: center; padding: 4rem 0;">
      <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔖</div>
      <h3 style="color: #fff; margin-bottom: 0.5rem;">No saved items yet</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Explore scholarships and government schemes and click Save to set deadline reminders.</p>
      <a href="opportunities.html" class="btn btn-primary">Browse Opportunities →</a>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/main.js"></script>

  <script>
    async function loadSavedItems() {
      const userStr = localStorage.getItem('dishasetu_user');
      if (!userStr) {
        window.location.href = 'login.html';
        return;
      }

      const loading = document.getElementById('saved-loading');
      const grid = document.getElementById('saved-grid');
      const empty = document.getElementById('saved-empty');

      try {
        const res = await fetch('/api/saved', { credentials: 'include' });
        const data = await res.json();

        loading.style.display = 'none';

        if (!data.success || !data.savedItems || data.savedItems.length === 0) {
          empty.style.display = 'block';
          return;
        }

        const lang = getCurrentLanguage();
        grid.innerHTML = data.savedItems.map(saved => {
          const item = saved.opportunityId || saved.schemeId;
          if (!item) return '';

          const isOpp = saved.itemType === 'Opportunity';
          const title = getLocalized(item.title, lang);
          const lastDateStr = item.lastDate ? new Date(item.lastDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
          const detailsUrl = isOpp ? `opportunity-details.html?id=${item._id}` : `scheme-details.html?id=${item._id}`;

          let prefLabel = '🔕 No reminder set';
          if (saved.reminderPreference === '7_days') prefLabel = '🔔 Reminder set: 7 days before';
          if (saved.reminderPreference === '3_days') prefLabel = '🔔 Reminder set: 3 days before';
          if (saved.reminderPreference === '1_day') prefLabel = '🔔 Reminder set: 1 day before';
          if (saved.reminderPreference === 'deadline_day') prefLabel = '🔔 Reminder set: On deadline day';

          return `
            <div class="glass-card ${!isOpp ? 'scheme-card' : ''}" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                  <span class="card-badge ${isOpp ? 'badge-open' : 'badge-scheme'}">${saved.itemType}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Saved ${new Date(saved.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem;">${title}</h3>
                
                <div style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 700; margin-bottom: 0.8rem;">
                  📅 Deadline: ${lastDateStr}
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: #fef3c7; margin-bottom: 1.2rem;">
                  ${prefLabel}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <a href="${item.applyUrl}" target="_blank" class="btn ${isOpp ? 'btn-primary' : 'btn-scheme'}" style="justify-content: center; padding: 0.5rem;">
                  🚀 Apply Now (Official Portal)
                </a>
                <div style="display: flex; gap: 0.5rem;">
                  <a href="${detailsUrl}" class="btn btn-outline" style="flex:1; justify-content: center; padding: 0.4rem; font-size: 0.8rem;">
                    View Details
                  </a>
                  <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; color: #f87171;" onclick="removeSavedRecord('${saved._id}')">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        grid.style.display = 'grid';
      } catch (err) {
        console.error('Load Saved Items Error:', err);
        loading.style.display = 'none';
        empty.style.display = 'block';
      }
    }

    async function removeSavedRecord(id) {
      if (!confirm('Are you sure you want to remove this item from your saved list?')) return;
      try {
        const res = await fetch(`/api/saved/${id}`, { method: 'DELETE', credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          loadSavedItems();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error('Remove Error:', err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadSavedItems);
  </script>
</body>
</html>

`

---

## File: submit-opportunity.html
- **Path:** /public/submit-opportunity.html
- **Purpose:** Student community contribution form with dual-image upload (proof & banner)

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submit an Opportunity | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .form-group {
      margin-bottom: 1.2rem;
    }
    .form-label {
      display: block;
      color: #e2e8f0;
      font-size: 0.88rem;
      margin-bottom: 0.4rem;
      font-weight: 500;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      color: #fff;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary-cyan);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
    }
    .file-dropzone {
      border: 2px dashed rgba(6, 182, 212, 0.4);
      background: rgba(6, 182, 212, 0.05);
      border-radius: 12px;
      padding: 1.8rem;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .file-dropzone:hover {
      background: rgba(6, 182, 212, 0.1);
      border-color: var(--primary-cyan);
    }
    .req-star {
      color: #f87171;
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem; max-width: 850px;">
    <!-- Page Title -->
    <div style="margin-bottom: 2rem; text-align: center;">
      <span class="card-badge badge-open" style="margin-bottom: 0.5rem; display: inline-block;">Community Contribution</span>
      <h1 style="color: #fff; font-size: 2.2rem; font-weight: 800; margin-bottom: 0.4rem;">Submit an Opportunity or Scheme</h1>
      <p style="color: var(--text-muted); font-size: 0.98rem; max-width: 650px; margin: 0 auto;">
        Discovered a new scholarship, hackathon, government scheme, or exam? Submit it here with proof or official document so our verification team can approve and share it with thousands of students!
      </p>
    </div>

    <!-- Submission Form Container -->
    <div class="glass-panel" style="padding: 2.2rem;">
      <div id="alert-box" style="display: none; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem;"></div>

      <form id="submission-form" enctype="multipart/form-data">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem;">
          
          <!-- Category Type -->
          <div class="form-group">
            <label class="form-label">Category Type <span class="req-star">*</span></label>
            <select name="categoryType" class="form-select" required id="categoryTypeSelect">
              <option value="Opportunity">Student Opportunity (Scholarship / Hackathon / Exam / Quiz / Internship)</option>
              <option value="Government Scheme">Government Scheme (Central / State Welfare Scheme)</option>
            </select>
          </div>

          <!-- Specific Type -->
          <div class="form-group">
            <label class="form-label">Sub-Category / Program Type <span class="req-star">*</span></label>
            <select name="type" class="form-select" required id="typeSelect">
              <option value="Scholarship">🎓 Scholarship</option>
              <option value="Government Scheme">🏛️ Government Scheme</option>
              <option value="Hackathon">💻 Hackathon</option>
              <option value="Coding Competition">💻 Coding Competition</option>
              <option value="Quiz Competition">🏆 Quiz Competition</option>
              <option value="GK / GS Competition">📚 GK / GS Competition</option>
              <option value="Essay Competition">✍️ Essay Competition</option>
              <option value="Competitive Exam">📝 Competitive Exam</option>
              <option value="Skill Development Program">⚙️ Skill Development Program</option>
              <option value="Prize Opportunity">🎁 Prize-Based Opportunity</option>
              <option value="Internship">💼 Internship / Student Role</option>
              <option value="Other">✨ Other Student Program</option>
            </select>
          </div>

        </div>

        <!-- Opportunity Title -->
        <div class="form-group">
          <label class="form-label">Opportunity / Scheme Title <span class="req-star">*</span></label>
          <input type="text" name="title" class="form-input" placeholder="e.g. National Merit Scholarship Scheme 2026 or Smart India Hackathon" required>
        </div>

        <!-- Organization / Authority -->
        <div class="form-group">
          <label class="form-label">Organization / Conducting Authority</label>
          <input type="text" name="organization" class="form-input" placeholder="e.g. Ministry of Education, AICTE, ISRO, Tata Trusts, Google">
        </div>

        <!-- Verification Source Link (MANDATORY) -->
        <div class="form-group">
          <label class="form-label">Official Source URL / Portal Link <span class="req-star">*</span></label>
          <input type="url" name="sourceUrl" class="form-input" placeholder="https://scholarships.gov.in or https://official-notice-url.org" required>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-top: 0.3rem;">Must be a valid official website or news link where our team can verify the authenticity.</span>
        </div>

        <!-- Section Header for Image Uploads -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary-cyan); margin-bottom: 0.4rem; font-size: 1rem;">📷 Opportunity Image Uploads</h4>
          <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 1rem;">Upload two separate files: a private verification document for Admin inspection, and a public poster banner for student display.</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.2rem;">
            
            <!-- 1. Private Verification / Proof Image (MANDATORY) -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 700;">1. Verification / Proof Image <span class="req-star">*</span></label>
              <span style="font-size: 0.76rem; color: #facc15; display: block; margin-bottom: 0.5rem;">🔒 Private — visible ONLY to Admin for verification.</span>
              
              <div class="file-dropzone" onclick="document.getElementById('proofFileInput').click()">
                <div style="font-size: 2rem; margin-bottom: 0.2rem;">📄</div>
                <div style="color: var(--primary-cyan); font-weight: 600; font-size: 0.88rem;" id="proofFileLabel">Click to select Official Notice / Circular / Proof</div>
                <div style="color: var(--text-muted); font-size: 0.76rem; margin-top: 0.2rem;">PDF, JPG, PNG, WEBP (Max 15MB)</div>
              </div>
              <input type="file" id="proofFileInput" name="verificationImage" accept=".pdf,.jpg,.jpeg,.png,.webp" style="display: none;" required onchange="updateProofPreview(this)">
              <div id="proofPreviewBox" style="display: none; margin-top: 0.5rem; text-align: center;"></div>
            </div>

            <!-- 2. Public Opportunity Banner / Poster (PUBLIC) -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 700;">2. Opportunity Banner / Poster</label>
              <span style="font-size: 0.76rem; color: #4ade80; display: block; margin-bottom: 0.5rem;">🌐 Public — displayed on DishaSetu website after approval.</span>
              
              <div class="file-dropzone" onclick="document.getElementById('bannerFileInput').click()" style="border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.05);">
                <div style="font-size: 2rem; margin-bottom: 0.2rem;">🖼️</div>
                <div style="color: #4ade80; font-weight: 600; font-size: 0.88rem;" id="bannerFileLabel">Click to select Event Poster / Banner Image</div>
                <div style="color: var(--text-muted); font-size: 0.76rem; margin-top: 0.2rem;">JPG, PNG, WEBP (Max 15MB)</div>
              </div>
              <input type="file" id="bannerFileInput" name="publicBannerImage" accept=".jpg,.jpeg,.png,.webp" style="display: none;" onchange="updateBannerPreview(this)">
              <div id="bannerPreviewBox" style="display: none; margin-top: 0.5rem; text-align: center;"></div>
            </div>

          </div>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description & Overview</label>
          <textarea name="description" class="form-textarea" rows="3" placeholder="Brief details about what this opportunity is, target audience, and key highlights..."></textarea>
        </div>

        <!-- Eligibility Grid -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary-cyan); margin-bottom: 0.8rem; font-size: 0.95rem;">🎯 Eligibility Criteria</h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label class="form-label">Min Age (Years)</label>
              <input type="number" name="minAge" class="form-input" value="0" min="0" max="100">
            </div>

            <div>
              <label class="form-label">Max Age (Years)</label>
              <input type="number" name="maxAge" class="form-input" value="100" min="0" max="100">
            </div>

            <div>
              <label class="form-label">Applicable State</label>
              <select name="stateSelect" class="form-select" id="stateSelect">
                <option value="All India">All India</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Other State">Other State</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <label class="form-label">Education Qualification</label>
            <select name="educationSelect" class="form-select" id="educationSelect">
              <option value="Graduate">Graduate / Pursuing Degree</option>
              <option value="10th">10th Pass</option>
              <option value="12th">12th Pass</option>
              <option value="Post Graduate">Post Graduate / Master</option>
              <option value="Diploma">Diploma / ITI</option>
              <option value="PhD">PhD / Researcher</option>
              <option value="Any">Any Qualification</option>
            </select>
          </div>
        </div>

        <!-- Last Date & Application Link -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.2rem;">
          <div class="form-group">
            <label class="form-label">Last Application Deadline <span class="req-star">*</span></label>
            <input type="date" name="lastDate" class="form-input" required id="lastDateInput">
          </div>

          <div class="form-group">
            <label class="form-label">Direct Application Form Link</label>
            <input type="url" name="applyUrl" class="form-input" placeholder="https://apply-link.com (Optional)">
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem; font-size: 1.05rem; margin-top: 1rem;" id="submitBtn">
          🚀 Submit Opportunity for Verification
        </button>
      </form>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>
  
  <script>
    // Pre-set min date to today
    document.getElementById('lastDateInput').min = new Date().toISOString().split('T')[0];

    function updateProofPreview(input) {
      const label = document.getElementById('proofFileLabel');
      const previewBox = document.getElementById('proofPreviewBox');
      if (input.files && input.files[0]) {
        const file = input.files[0];
        label.innerHTML = `✅ Verification Proof Selected: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewBox.style.display = 'block';
            previewBox.innerHTML = `<img src="${e.target.result}" alt="Proof Preview" style="max-height: 110px; border-radius: 8px; border: 1px solid var(--border-light); margin-top: 0.4rem;">`;
          };
          reader.readAsDataURL(file);
        } else {
          previewBox.style.display = 'none';
        }
      } else {
        label.innerText = 'Click to select Official Notice / Circular / Proof';
        previewBox.style.display = 'none';
      }
    }

    function updateBannerPreview(input) {
      const label = document.getElementById('bannerFileLabel');
      const previewBox = document.getElementById('bannerPreviewBox');
      if (input.files && input.files[0]) {
        const file = input.files[0];
        label.innerHTML = `✅ Public Banner Selected: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewBox.style.display = 'block';
            previewBox.innerHTML = `<img src="${e.target.result}" alt="Banner Preview" style="max-height: 120px; width: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #4ade80; margin-top: 0.4rem;">`;
          };
          reader.readAsDataURL(file);
        } else {
          previewBox.style.display = 'none';
        }
      } else {
        label.innerText = 'Click to select Event Poster / Banner Image';
        previewBox.style.display = 'none';
      }
    }

    document.getElementById('submission-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('alert-box');
      const submitBtn = document.getElementById('submitBtn');

      // Check user login state
      const storedUser = localStorage.getItem('dishasetu_user');
      if (!storedUser) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerText = '⚠️ Please log in first to submit opportunities.';
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
      }

      const form = e.target;
      const formData = new FormData(form);

      // Append education & state array
      const eduVal = document.getElementById('educationSelect').value;
      const stateVal = document.getElementById('stateSelect').value;
      formData.set('education', JSON.stringify([eduVal]));
      formData.set('state', JSON.stringify([stateVal]));

      submitBtn.disabled = true;
      submitBtn.innerText = '⏳ Uploading proof and submitting...';

      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const data = await res.json();
        if (data.success) {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(34, 197, 94, 0.2)';
          alertBox.style.border = '1px solid #22c55e';
          alertBox.style.color = '#86efac';
          alertBox.innerText = '🎉 ' + data.message;
          form.reset();
          document.getElementById('proofFileLabel').innerText = 'Click to select Official Notice / Circular / Proof';
          document.getElementById('bannerFileLabel').innerText = 'Click to select Event Poster / Banner Image';
          document.getElementById('proofPreviewBox').style.display = 'none';
          document.getElementById('bannerPreviewBox').style.display = 'none';
          
          setTimeout(() => {
            window.location.href = 'my-submissions.html';
          }, 2000);
        } else {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
          alertBox.style.border = '1px solid #ef4444';
          alertBox.style.color = '#fca5a5';
          alertBox.innerText = '❌ ' + (data.message || 'Submission failed. Please check form inputs.');
        }
      } catch (err) {
        console.error('Submission Error:', err);
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239, 68, 68, 0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerText = '❌ ' + (err.message || 'Error processing upload. Please check network connection and try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Submit Opportunity for Verification';
      }
    });
  </script>
</body>
</html>

`

---

## File: my-submissions.html
- **Path:** /public/my-submissions.html
- **Purpose:** Student portal for tracking submitted opportunities and admin verification status

`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Submissions | DishaSetu</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .status-badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pending { background: rgba(234, 179, 8, 0.18); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
    .status-under-review { background: rgba(59, 130, 246, 0.18); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .status-changes-requested { background: rgba(249, 115, 22, 0.18); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }
    .status-approved { background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .status-rejected { background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .submission-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.2rem;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .submission-card:hover {
      border-color: var(--primary-cyan);
      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15);
    }
  </style>
</head>
<body>
  <div id="navbar-placeholder"></div>

  <main class="main-content container py-4" style="padding-top: 2.5rem; padding-bottom: 5rem;">
    <!-- Page Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="card-badge badge-open" style="margin-bottom: 0.4rem;">Student Submissions Portal</span>
        <h1 style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem;">My Opportunity Submissions</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Track verification status and admin feedback for your submitted opportunities and schemes.</p>
      </div>

      <a href="submit-opportunity.html" class="btn btn-primary" style="padding: 0.65rem 1.3rem;">
        + Submit New Opportunity
      </a>
    </div>

    <!-- Submissions Summary Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 2rem;">
      <div class="glass-panel" style="padding: 1.2rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Total Submitted</div>
        <div id="stat-total" style="font-size: 2rem; font-weight: 800; color: var(--primary-cyan); margin-top: 0.2rem;">0</div>
      </div>
      <div class="glass-panel" style="padding: 1.2rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Pending Review</div>
        <div id="stat-pending" style="font-size: 2rem; font-weight: 800; color: #facc15; margin-top: 0.2rem;">0</div>
      </div>
      <div class="glass-panel" style="padding: 1.2rem; text-align: center;">
        <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Approved & Live</div>
        <div id="stat-approved" style="font-size: 2rem; font-weight: 800; color: #4ade80; margin-top: 0.2rem;">0</div>
      </div>
    </div>

    <!-- Submissions List -->
    <div id="submissions-container">
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
        ⏳ Loading your submitted opportunities...
      </div>
    </div>
  </main>

  <script src="js/translations.js"></script>
  <script src="js/theme-nav.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reminders.js"></script>

  <script>
    async function loadMySubmissions() {
      const container = document.getElementById('submissions-container');
      const userStr = localStorage.getItem('dishasetu_user');

      if (!userStr) {
        container.innerHTML = `
          <div class="glass-panel" style="padding: 3rem; text-align: center;">
            <h3 style="color:#fff; margin-bottom:0.8rem;">🔒 Login Required</h3>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">Please log in to view your submitted opportunities and status.</p>
            <a href="login.html" class="btn btn-primary">Go to Login Page</a>
          </div>
        `;
        return;
      }

      try {
        const res = await fetch('/api/submissions/my', { credentials: 'include' });
        const data = await res.json();

        if (!data.success) {
          container.innerHTML = `<div style="color:#f87171; text-align:center;">Error: ${data.message}</div>`;
          return;
        }

        const items = data.data || [];

        // Update counts
        document.getElementById('stat-total').innerText = items.length;
        document.getElementById('stat-pending').innerText = items.filter(i => i.status === 'Pending Review' || i.status === 'Under Review').length;
        document.getElementById('stat-approved').innerText = items.filter(i => i.status === 'Approved').length;

        if (items.length === 0) {
          container.innerHTML = `
            <div class="glass-panel" style="padding: 3rem; text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 0.8rem;">📤</div>
              <h3 style="color: #fff; margin-bottom: 0.5rem;">No Submissions Yet</h3>
              <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Have you found a scholarship or government scheme? Share it to help fellow students.</p>
              <a href="submit-opportunity.html" class="btn btn-primary">+ Submit First Opportunity</a>
            </div>
          `;
          return;
        }

        container.innerHTML = items.map(sub => {
          let badgeClass = 'status-pending';
          if (sub.status === 'Under Review') badgeClass = 'status-under-review';
          if (sub.status === 'Changes Requested') badgeClass = 'status-changes-requested';
          if (sub.status === 'Approved') badgeClass = 'status-approved';
          if (sub.status === 'Rejected') badgeClass = 'status-rejected';

          const formattedDate = new Date(sub.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          const lastDateStr = new Date(sub.lastDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
          });

          return `
            <div class="submission-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
                <div>
                  <span class="status-badge ${badgeClass}">${sub.status}</span>
                  <span style="font-size: 0.8rem; color: var(--primary-cyan); font-weight: 600; margin-left: 0.5rem;">[${sub.type}]</span>
                  <h3 style="color: #fff; font-size: 1.25rem; margin-top: 0.4rem; margin-bottom: 0.2rem;">${sub.title}</h3>
                  <div style="color: var(--text-muted); font-size: 0.85rem;">
                    ${sub.organization ? `🏢 ${sub.organization} • ` : ''}Submitted on ${formattedDate}
                  </div>
                </div>

                <div style="text-align: right;">
                  <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Deadline</span>
                  <strong style="color: #f87171; font-size: 0.95rem;">${lastDateStr}</strong>
                </div>
              </div>

              ${sub.description ? `<p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.5;">${sub.description}</p>` : ''}

              <!-- Source Link & Proof Badge -->
              <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: 0.82rem;">
                <a href="${sub.sourceUrl}" target="_blank" rel="noopener" style="color: var(--primary-cyan); text-decoration: underline;">
                  🔗 Source Link
                </a>
                <a href="${sub.proofUrl}" target="_blank" rel="noopener" style="color: #4ade80; text-decoration: underline;">
                  📄 View Uploaded Proof (${sub.proofOriginalName || 'Document'})
                </a>
              </div>

              <!-- Admin Feedback Section -->
              ${sub.adminFeedback ? `
                <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid var(--primary-cyan); padding: 0.8rem 1rem; border-radius: 6px; margin-top: 0.8rem;">
                  <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">💬 Admin Feedback Note</div>
                  <div style="color: #e2e8f0; font-size: 0.88rem; margin-top: 0.2rem;">"${sub.adminFeedback}"</div>
                </div>
              ` : ''}

              ${sub.status === 'Approved' ? `
                <div style="margin-top: 0.8rem; color: #4ade80; font-size: 0.85rem; font-weight: 600;">
                  ✨ Approved & published live on the public DishaSetu opportunity feed!
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error('Fetch My Submissions Error:', err);
        container.innerHTML = `<div style="color:#f87171; text-align:center;">Failed to connect to backend server.</div>`;
      }
    }

    document.addEventListener('DOMContentLoaded', loadMySubmissions);
  </script>
</body>
</html>

`

---

