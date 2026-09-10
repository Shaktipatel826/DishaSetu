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
  }

  function step() {
    if (!isHovered) {
      currentAngle = (currentAngle + speed) % 360;
    }

    const total = cards.length;
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth <= 992;
    
    // Elliptical Radius
    const radiusX = isMobile ? 115 : (isTablet ? 155 : 210);
    const radiusZ = isMobile ? 70 : (isTablet ? 95 : 130);
    const radiusY = isMobile ? 18 : 32; // Slight 3D tilt

    cards.forEach((card, index) => {
      const angleDeg = currentAngle + (index * (360 / total));
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = Math.sin(angleRad) * radiusX;
      const z = Math.cos(angleRad) * radiusZ;
      const y = -Math.cos(angleRad) * radiusY;

      // Normalize Z (0 = farthest back, 1 = closest front)
      const normZ = (z + radiusZ) / (2 * radiusZ);

      // 3D Scale: 0.72 (back) -> 1.15 (front)
      const scale = 0.72 + (normZ * 0.43);

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
