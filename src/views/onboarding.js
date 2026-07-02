import { store } from '../store.js';

export function renderOnboarding(container) {
  container.innerHTML = `
    <div style="max-width: 600px; margin: 40px auto; padding: var(--spacing-sm);">
      <div class="text-center mb-md">
        <h1 style="font-size: var(--font-h1); font-weight: 700;">Select Your Experience Level</h1>
        <p style="color: var(--color-text-muted); margin-top: var(--spacing-xs);">
          Pick the track that best fits your training structure.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
        <!-- Beginner Option Card -->
        <div class="card card-hoverable" id="card-beginner" style="cursor: pointer; padding: var(--spacing-md);">
          <div class="flex-between">
            <h2 style="font-size: var(--font-h2); font-weight: 700; color: var(--color-brand-primary);">Beginner Track</h2>
            <span class="muscle-tag" style="background-color: rgba(16, 185, 129, 0.08); color: var(--color-success);">Guided</span>
          </div>
          <p style="color: var(--color-text-muted); margin-top: var(--spacing-xs); font-size: var(--font-body);">
            Get a structured default weekly workout split. Intermediate and Pro custom planners remain locked so you can focus entirely on building consistency and habits.
          </p>
        </div>

        <!-- Intermediate Option Card -->
        <div class="card card-hoverable" id="card-intermediate" style="cursor: pointer; padding: var(--spacing-md);">
          <div class="flex-between">
            <h2 style="font-size: var(--font-h2); font-weight: 700; color: var(--color-brand-primary);">Intermediate Track</h2>
            <span class="muscle-tag">Semi-Custom</span>
          </div>
          <p style="color: var(--color-text-muted); margin-top: var(--spacing-xs); font-size: var(--font-body);">
            Access a structured default split with the freedom to customize and rearrange exercises on your weekly grid canvas.
          </p>
        </div>

        <!-- Pro Option Card -->
        <div class="card card-hoverable" id="card-pro" style="cursor: pointer; padding: var(--spacing-md);">
          <div class="flex-between">
            <h2 style="font-size: var(--font-h2); font-weight: 700; color: var(--color-brand-primary);">Pro Split Planner</h2>
            <span class="muscle-tag" style="background-color: rgba(217, 83, 0, 0.08); color: var(--color-accent-action);">Full Control</span>
          </div>
          <p style="color: var(--color-text-muted); margin-top: var(--spacing-xs); font-size: var(--font-body);">
            Build your custom weekly gym splits completely from scratch. No hand-holding, total scheduling flexibility.
          </p>
        </div>
      </div>
    </div>

    <!-- Bypass Modal Container -->
    <div id="modal-container"></div>
  `;

  document.getElementById('card-beginner').addEventListener('click', () => {
    store.selectLevel('beginner');
    window.location.hash = '#dashboard';
  });

  document.getElementById('card-intermediate').addEventListener('click', () => {
    showBypassModal('intermediate');
  });

  document.getElementById('card-pro').addEventListener('click', () => {
    showBypassModal('pro');
  });
}

function showBypassModal(level) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">Bypass Beginner Track?</h2>
        <p class="modal-text">
          You are about to skip the guided beginner journey. We recommend this only if you already have gym experience and understand workout split planning.
        </p>
        <div class="modal-actions">
          <button id="modal-cancel-btn" class="btn btn-secondary">Go Back</button>
          <button id="modal-confirm-btn" class="btn btn-primary">Continue</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-cancel-btn').addEventListener('click', () => {
    modalContainer.innerHTML = '';
  });

  document.getElementById('modal-confirm-btn').addEventListener('click', () => {
    store.selectLevel(level, true); // true bypasses lock
    modalContainer.innerHTML = '';
    window.location.hash = '#dashboard';
  });
}
