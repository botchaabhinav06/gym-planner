import { store } from './store.js';
import { renderLanding } from './views/landing.js';
import { renderOnboarding } from './views/onboarding.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPlanner } from './views/planner.js';
import { renderSettings } from './views/settings.js';

const routes = {
  landing: renderLanding,
  onboarding: renderOnboarding,
  dashboard: renderDashboard,
  planner: renderPlanner,
  settings: renderSettings
};

export function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  // Listen for state changes to trigger re-renders or redirects
  store.addEventListener('statechange', handleRouting);
  
  // Initial route
  handleRouting();
}

function handleRouting() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  const container = document.getElementById('app');
  
  if (!container) return;

  // Apply theme class to html element
  document.documentElement.setAttribute('data-theme', store.state.theme);

  // Access Control Gates
  const profile = store.state.profile;
  const activeLevel = store.state.activeLevel;

  if (!profile) {
    // If not registered, force landing screen
    if (hash !== 'landing') {
      window.location.hash = '#landing';
      return;
    }
  } else if (!activeLevel) {
    // If registered but no level selected, force onboarding level chooser
    if (hash !== 'onboarding') {
      window.location.hash = '#onboarding';
      return;
    }
  } else {
    // If fully configured, protect onboarding/landing from double-access
    if (hash === 'landing' || hash === 'onboarding') {
      window.location.hash = '#dashboard';
      return;
    }
  }

  // Find routing view
  const renderView = routes[hash] || renderDashboard;
  
  // Render views
  container.innerHTML = '';
  
  // Render dynamic page content
  renderView(container);
  
  // Render header / navigation dynamically
  renderHeaderNav();
}

function renderHeaderNav() {
  const header = document.getElementById('app-header');
  if (!header) return;

  const profile = store.state.profile;
  const activeLevel = store.state.activeLevel;
  const hash = window.location.hash.slice(1) || 'dashboard';

  // If not logged in, hide navbar
  if (!profile || !activeLevel) {
    header.innerHTML = '';
    header.style.display = 'none';
    return;
  }

  header.style.display = '';

  const isDark = store.state.theme === 'dark';

  header.innerHTML = `
    <div class="app-container flex-between" style="padding: 0 var(--spacing-sm); height: 100%;">
      <div class="header-logo">
        🏋️‍♂️ <span>GymSplit</span>
      </div>
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="#dashboard" class="${hash === 'dashboard' ? 'active' : ''}">
            <span class="nav-icon">📅</span>
            <span class="nav-text">Today</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#planner" class="${hash === 'planner' ? 'active' : ''}">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Weekly</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#settings" class="${hash === 'settings' ? 'active' : ''}">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Settings</span>
          </a>
        </li>
        <li class="nav-item" style="margin-left: 8px;">
          <button id="theme-toggle-btn" class="exercise-btn" style="font-size: 20px; padding: 4px;">
            ${isDark ? '☀️' : '🌙'}
          </button>
        </li>
      </ul>
    </div>
  `;

  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    store.toggleTheme();
  });
}
