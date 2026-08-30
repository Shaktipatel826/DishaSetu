/**
 * Kisan Direct - Shared Frontend Library
 * Handles API calls, authentication sync, navbar state, cart badges, and toast alerts.
 */

// Centralized API Wrapper
async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    'Accept': 'application/json'
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    credentials: 'include' // Important for httpOnly JWT cookie
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      return { success: false, status: response.status, message: errorMsg, data };
    }

    return data;
  } catch (err) {
    console.error(`API Fetch Error (${endpoint}):`, err);
    return {
      success: false,
      message: 'Network error or unable to reach the Kisan Direct server. Please try again.'
    };
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'info') icon = 'ℹ';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <span style="font-weight: 800; font-size: 1.1rem;">${icon}</span>
      <span>${message}</span>
    </div>
    <button style="background:none; border:none; color:#fff; cursor:pointer; font-size:1.1rem;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Check Current Authentication State
async function checkAuth() {
  const res = await apiFetch('/api/auth/me');
  if (res.success && res.user) {
    localStorage.setItem('kisan_user', JSON.stringify(res.user));
    return res.user;
  } else {
    localStorage.removeItem('kisan_user');
    return null;
  }
}

function getStoredUser() {
  try {
    const userStr = localStorage.getItem('kisan_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

// Logout Action
async function handleLogout() {
  const res = await apiFetch('/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('kisan_user');
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Dynamic Navigation Bar Controller
async function renderNavbar(activePage = '') {
  const navContainer = document.getElementById('navbar-placeholder');
  if (!navContainer) return;

  const user = await checkAuth();

  let dashboardUrl = '#';
  let dashboardLabel = 'Dashboard';

  if (user) {
    if (user.role === 'farmer') {
      dashboardUrl = 'farmer-dashboard.html';
      dashboardLabel = 'Farmer Portal';
    } else if (user.role === 'customer') {
      dashboardUrl = 'customer-dashboard.html';
      dashboardLabel = 'My Orders';
    } else if (user.role === 'admin') {
      dashboardUrl = 'admin-dashboard.html';
      dashboardLabel = 'Admin Panel';
    }
  }

  navContainer.innerHTML = `
    <header class="navbar">
      <div class="container navbar-inner">
        <a href="index.html" class="brand-logo">
          <span class="logo-icon">🌾</span>
          <span>Kisan<span class="highlight">Direct</span></span>
        </a>

        <ul class="nav-links">
          <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a></li>
          <li><a href="products.html" class="${activePage === 'products' ? 'active' : ''}">All Grains</a></li>
          <li><a href="index.html#how-it-works">How It Works</a></li>
          <li><a href="index.html#benefits">Why Direct</a></li>
        </ul>

        <div class="nav-actions">
          ${(!user || user.role === 'customer') ? `
            <a href="cart.html" class="cart-btn" title="View Cart">
              🛒 <span class="cart-badge" id="nav-cart-count">0</span>
            </a>
          ` : ''}

          ${user ? `
            <div class="user-menu">
              <span class="user-role-tag">${user.role}</span>
              <a href="${dashboardUrl}" style="font-weight: 600; font-size: 0.9rem; color: var(--primary-dark);">
                ${user.name.split(' ')[0]}
              </a>
              <button onclick="handleLogout()" class="btn btn-sm btn-secondary" style="margin-left: 0.25rem;">Logout</button>
            </div>
          ` : `
            <a href="login.html" class="btn btn-sm btn-outline">Login</a>
            <a href="register.html" class="btn btn-sm btn-primary">Join Kisan</a>
          `}
        </div>
      </div>
    </header>
  `;

  // Update Cart Count if user is customer or browsing
  if (!user || user.role === 'customer') {
    updateCartCount();
  }
}

// Update Cart Count Badge
async function updateCartCount() {
  const badge = document.getElementById('nav-cart-count');
  if (!badge) return;

  const res = await apiFetch('/api/customers/cart');
  if (res.success && res.cart) {
    badge.textContent = res.cart.totalItems || 0;
  } else {
    badge.textContent = '0';
  }
}

// Format Currency in INR
function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Get Badge Class For Order Status
function getStatusBadge(status) {
  const s = (status || 'pending').toLowerCase();
  return `<span class="badge badge-${s}">${s}</span>`;
}

// Protect Dashboard Pages on Frontend
async function requireRoleAuth(allowedRole) {
  const user = await checkAuth();
  if (!user) {
    showToast('Please log in to access this portal.', 'error');
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    }, 1000);
    return null;
  }

  if (allowedRole && user.role !== allowedRole) {
    showToast(`Unauthorized access. This page is for ${allowedRole}s only.`, 'error');
    setTimeout(() => {
      if (user.role === 'farmer') window.location.href = 'farmer-dashboard.html';
      else if (user.role === 'customer') window.location.href = 'customer-dashboard.html';
      else if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
      else window.location.href = 'index.html';
    }, 1000);
    return null;
  }

  return user;
}
