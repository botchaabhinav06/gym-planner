import { store } from '../store.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div style="max-width: 480px; margin: 40px auto; padding: var(--spacing-md);" class="card">
      <div class="text-center mb-md">
        <h1 style="font-size: var(--font-h1); font-weight: 700; color: var(--color-brand-primary);">🏋️‍♂️ GymSplit</h1>
        <p style="color: var(--color-text-muted); margin-top: var(--spacing-xs);">
          Plan, follow, and complete your weekly workout schedule with zero distraction.
        </p>
      </div>

      <form id="register-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="reg-name">Your Name</label>
          <input type="text" id="reg-name" class="form-input" placeholder="e.g., Jane Doe" required>
          <div id="name-error" class="form-error hidden">Name is required.</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-email">Email Address</label>
          <input type="email" id="reg-email" class="form-input" placeholder="e.g., jane@example.com" required>
          <div id="email-error" class="form-error hidden">Please enter a valid email address.</div>
        </div>

        <details class="form-group" style="cursor: pointer; margin-bottom: var(--spacing-md);">
          <summary class="form-label" style="color: var(--color-brand-primary); outline: none;">
            Additional Info (Optional)
          </summary>
          <div style="padding-top: var(--spacing-xs); display: flex; flex-direction: column; gap: var(--spacing-sm);">
            <div>
              <label class="form-label" for="reg-age">Age <span class="optional">(Optional)</span></label>
              <input type="number" id="reg-age" class="form-input" placeholder="e.g., 25" min="13">
              <div id="age-error" class="form-error hidden">You must be at least 13 years old to register.</div>
            </div>
            <div>
              <label class="form-label" for="reg-gender">Gender <span class="optional">(Optional)</span></label>
              <select id="reg-gender" class="form-input" style="height: 48px; padding-right: 24px;">
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-Binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </details>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Create Account</button>
      </form>
    </div>
  `;

  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const ageInput = document.getElementById('reg-age');
  const genderInput = document.getElementById('reg-gender');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const ageError = document.getElementById('age-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Reset error messages
    nameError.classList.add('hidden');
    nameInput.classList.remove('input-error');
    emailError.classList.add('hidden');
    emailInput.classList.remove('input-error');
    ageError.classList.add('hidden');
    ageInput.classList.remove('input-error');

    // Name Validation
    if (!nameInput.value.trim()) {
      nameError.textContent = "Name is required.";
      nameError.classList.remove('hidden');
      nameInput.classList.add('input-error');
      isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailError.textContent = "Email address is required.";
      emailError.classList.remove('hidden');
      emailInput.classList.add('input-error');
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = "Please enter a valid email address.";
      emailError.classList.remove('hidden');
      emailInput.classList.add('input-error');
      isValid = false;
    }

    // Age validation
    const ageVal = ageInput.value.trim();
    if (ageVal !== '') {
      const ageNum = parseInt(ageVal, 10);
      if (isNaN(ageNum) || ageNum < 13) {
        ageError.textContent = "You must be at least 13 years old to register.";
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
      window.location.hash = '#onboarding';
    }
  });
}
