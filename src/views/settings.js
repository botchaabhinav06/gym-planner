import { store } from '../store.js';

export function renderSettings(container) {
  const profile = store.state.profile;
  const activeLevel = store.state.activeLevel;

  container.innerHTML = `
    <div style="max-width: 600px; margin: 20px auto; padding: var(--spacing-sm); display: flex; flex-direction: column; gap: var(--spacing-md);">
      
      <!-- Profile Information Card -->
      <div class="card">
        <h2 class="modal-title" style="margin-bottom: var(--spacing-sm);">Profile Information</h2>
        
        <form id="settings-profile-form">
          <div class="form-group">
            <label class="form-label" for="set-name">Your Name</label>
            <input type="text" id="set-name" class="form-input" value="${profile.name}" required>
            <div id="set-name-error" class="form-error hidden">Name is required.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="set-email">Email Address</label>
            <input type="email" id="set-email" class="form-input" value="${profile.email}" required>
            <div id="set-email-error" class="form-error hidden">Please enter a valid email address.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="set-age">Age <span class="optional">(Optional)</span></label>
            <input type="number" id="set-age" class="form-input" value="${profile.age || ''}" min="13">
            <div id="set-age-error" class="form-error hidden">You must be at least 13 years old.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="set-gender">Gender <span class="optional">(Optional)</span></label>
            <select id="set-gender" class="form-input" style="height: 48px;">
              <option value="" ${profile.gender === '' ? 'selected' : ''}>Select...</option>
              <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
              <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="nonbinary" ${profile.gender === 'nonbinary' ? 'selected' : ''}>Non-Binary</option>
              <option value="prefer-not-to-say" ${profile.gender === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Profile Settings</button>
        </form>
      </div>

      <!-- Plan Manager Card -->
      <div class="card">
        <h2 class="modal-title" style="margin-bottom: var(--spacing-xs);">Select Active Workout Split</h2>
        <p style="color: var(--color-text-muted); font-size: var(--font-caption); margin-bottom: var(--spacing-sm);">
          Choose your workout track. Switching active plans preserves your custom splits in background memory.
        </p>

        <div class="form-group">
          <label class="form-label" for="set-active-plan">Active Split Plan</label>
          <select id="set-active-plan" class="form-input" style="height: 48px;">
            <option value="beginner" ${activeLevel === 'beginner' ? 'selected' : ''}>Beginner Track (Guided)</option>
            <option value="intermediate" ${activeLevel === 'intermediate' ? 'selected' : ''}>Intermediate Track (Semi-Custom)</option>
            <option value="pro" ${activeLevel === 'pro' ? 'selected' : ''}>Pro Split Planner (Full Control)</option>
          </select>
        </div>
      </div>

      <!-- Factory Reset Card -->
      <div class="card" style="border-color: var(--color-error); background-color: rgba(239, 68, 68, 0.02);">
        <h2 class="modal-title" style="color: var(--color-error); margin-bottom: var(--spacing-xs);">Danger Zone</h2>
        <p style="color: var(--color-text-muted); font-size: var(--font-caption); margin-bottom: var(--spacing-sm);">
          Permanently clear all user information, workout schedules, consistency logs, and streaks. This cannot be undone.
        </p>
        <button id="reset-account-btn" class="btn btn-warning" style="width: 100%;">Reset All Account Data</button>
      </div>

    </div>

    <!-- Modals Mount Container -->
    <div id="settings-modal-container"></div>
  `;

  // Profile Save
  const profileForm = document.getElementById('settings-profile-form');
  const nameInput = document.getElementById('set-name');
  const emailInput = document.getElementById('set-email');
  const ageInput = document.getElementById('set-age');
  const genderInput = document.getElementById('set-gender');

  const nameError = document.getElementById('set-name-error');
  const emailError = document.getElementById('set-email-error');
  const ageError = document.getElementById('set-age-error');

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    nameError.classList.add('hidden');
    nameInput.classList.remove('input-error');
    emailError.classList.add('hidden');
    emailInput.classList.remove('input-error');
    ageError.classList.add('hidden');
    ageInput.classList.remove('input-error');

    if (!nameInput.value.trim()) {
      nameError.classList.remove('hidden');
      nameInput.classList.add('input-error');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailError.classList.remove('hidden');
      emailInput.classList.add('input-error');
      isValid = false;
    }

    const ageVal = ageInput.value.trim();
    if (ageVal !== '') {
      const ageNum = parseInt(ageVal, 10);
      if (isNaN(ageNum) || ageNum < 13) {
        ageError.classList.remove('hidden');
        ageInput.classList.add('input-error');
        isValid = false;
      }
    }

    if (isValid) {
      store.registerUser(
        nameInput.value.trim(),
        emailInput.value.trim(),
        ageInput.value.trim(),
        genderInput.value
      );
      
      // Visual notification toast
      const toast = document.createElement('div');
      toast.className = 'card text-center';
      toast.style.position = 'fixed';
      toast.style.bottom = '80px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.zIndex = '1000';
      toast.style.padding = 'var(--spacing-xs) var(--spacing-sm)';
      toast.style.backgroundColor = 'var(--color-text-primary)';
      toast.style.color = 'var(--color-surface)';
      toast.textContent = 'Settings Saved Successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 2000);
    }
  });

  // Active Plan Change Dropdown Warning Modal Interceptor
  const planSelector = document.getElementById('set-active-plan');
  planSelector.addEventListener('change', (e) => {
    const selectedVal = planSelector.value;
    if (selectedVal === activeLevel) return;

    const modalContainer = document.getElementById('settings-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h2 class="modal-title">Switch Active Split?</h2>
          <p class="modal-text">
            Switching your active plan will update today's plan view. Your existing custom split setups remain saved in memory. Continue?
          </p>
          <div class="modal-actions">
            <button id="plan-switch-cancel" class="btn btn-secondary">Go Back</button>
            <button id="plan-switch-confirm" class="btn btn-primary">Switch Split</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('plan-switch-cancel').addEventListener('click', () => {
      // Revert selection
      planSelector.value = activeLevel;
      modalContainer.innerHTML = '';
    });

    document.getElementById('plan-switch-confirm').addEventListener('click', () => {
      store.selectLevel(selectedVal, true); // true bypasses lock
      modalContainer.innerHTML = '';
      // Re-route to dashboard to display new active split plan
      window.location.hash = '#dashboard';
    });
  });

  // Reset Account trigger dialog
  document.getElementById('reset-account-btn').addEventListener('click', () => {
    const modalContainer = document.getElementById('settings-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="border-color: var(--color-error);">
          <h2 class="modal-title" style="color: var(--color-error);">Confirm Account Reset</h2>
          <p class="modal-text">
            Are you sure you want to reset your account? This permanently deletes all your custom splits, consistency history, and streaks. This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button id="reset-cancel" class="btn btn-secondary">Cancel</button>
            <button id="reset-confirm" class="btn btn-warning" style="height: 48px;">Reset Data</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('reset-cancel').addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    document.getElementById('reset-confirm').addEventListener('click', () => {
      store.resetProgress();
      modalContainer.innerHTML = '';
      window.location.hash = '#landing';
    });
  });
}
