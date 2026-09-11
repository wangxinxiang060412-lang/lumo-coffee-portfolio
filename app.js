/**
 * LUMO Coffee & Dessert — Portfolio Showcase Script
 * Bridges the portfolio UI with the 1:1 Mini Program Engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSimulatorBridge();
  initHeaderScroll();
});

function initSimulatorBridge() {
  if (window.LUMO_ENGINE) {
    window.LUMO_ENGINE.init();
  }

  // Left sidebar scene selector tabs
  document.querySelectorAll('.sim-tab').forEach((tab) => {
    tab.type = 'button';
    tab.addEventListener('click', () => {
      const screen = tab.dataset.screen;
      if (window.LUMO_ENGINE) {
        window.LUMO_ENGINE.navigate(screen, {
          resetHistory: true,
          ensureCart: screen === 'checkout'
        });
      }
    });
  });

  // Reset prototype button
  document.getElementById('resetPrototypeBtn')?.addEventListener('click', () => {
    if (window.LUMO_ENGINE) {
      window.LUMO_ENGINE.reset();
    }
  });
}

function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) header.style.boxShadow = scrollY > 20 ? '0 4px 20px rgba(61, 51, 45, 0.06)' : 'none';
    let currentId = scrollY < 80 ? 'overview' : '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (scrollY >= top && scrollY < top + section.offsetHeight) currentId = section.dataset.nav || section.id;
    });
    navLinks.forEach((link) => link.classList.toggle('active-pill', link.getAttribute('href') === `#${currentId}`));
  }, { passive: true });
}
