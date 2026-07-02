import { store } from '../store.js';

export function renderDashboard(container) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const actualToday = daysOfWeek[new Date().getDay()];
  
  // Active view date state
  let selectedDay = actualToday;

  function updateView() {
    const activeLevel = store.state.activeLevel;
    const schedule = store.state.customSchedules[activeLevel];
    const todaySchedule = schedule[selectedDay];
    
    // Check local storage date formats
    const todayDateString = getTodayDateString(selectedDay);
    const isCompleted = store.state.completedWorkouts[todayDateString] || false;

    // Check if it's a rest day
    const isRestDay = todaySchedule.muscleGroup === "Rest Day" || todaySchedule.exercises.length === 0;

    container.innerHTML = `
      <div style="max-width: 600px; margin: 20px auto; padding: var(--spacing-sm);">
        <!-- Top bar with user name and Streak Counter -->
        <div class="flex-between mb-md">
          <div>
            <h4 style="color: var(--color-text-muted); font-size: var(--font-caption);">WELCOME BACK</h4>
            <h2 style="font-size: var(--font-h2); font-weight: 700;">${store.state.profile.name}</h2>
          </div>
          
          <!-- Consistency Streak Widget -->
          <div class="streak-widget" id="streak-counter-widget">
            <span class="streak-icon">🔥</span>
            <div>
              <div class="streak-count" id="streak-count-val">${store.state.streakCount}</div>
              <div class="streak-label" id="streak-label-txt">${store.state.streakCount === 0 ? 'Start Streak' : 'Day Streak'}</div>
            </div>
          </div>
        </div>

        <!-- Answering: What should I do next? -->
        <div class="card mb-md" style="padding: var(--spacing-md); border-color: var(--color-brand-primary); background-color: var(--color-surface);">
          <div class="flex-between mb-sm" style="border-bottom: var(--border-subtle); padding-bottom: var(--spacing-xs);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="prev-day-btn" class="exercise-btn" style="font-size: 20px;">◀</button>
              <h1 style="font-size: var(--font-h2); font-weight: 700; margin: 0; min-width: 120px; text-align: center;">
                ${selectedDay}
              </h1>
              <button id="next-day-btn" class="exercise-btn" style="font-size: 20px;">▶</button>
            </div>
            <span class="muscle-tag" style="text-transform: uppercase;">${activeLevel}</span>
          </div>

          <!-- Muscle group -->
          <div class="mb-sm">
            <span style="font-size: var(--font-caption); color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">
              TARGETED MUSCLE GROUP
            </span>
            <h2 style="font-size: var(--font-h2); font-weight: 700; color: ${isRestDay ? 'var(--color-text-muted)' : 'var(--color-brand-primary)'};">
              ${todaySchedule.muscleGroup}
            </h2>
          </div>

          <!-- Exercises / Rest Day empty states -->
          ${isRestDay ? `
            <div class="text-center" style="padding: var(--spacing-lg) 0;">
              <div style="font-size: 48px; margin-bottom: var(--spacing-xs);">🧘‍♂️</div>
              <p style="font-size: var(--font-body); color: var(--color-text-muted); max-width: 280px; margin: 0 auto;">
                Today is scheduled as a Rest Day. Recovery is where muscle growth and habit consolidation happen!
              </p>
            </div>
          ` : `
            <div class="flex-column gap-xs mb-md" style="padding-top: var(--spacing-xs);">
              <span style="font-size: var(--font-caption); color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: var(--spacing-xxs); display: block;">
                PLANNED EXERCISES
              </span>
              ${todaySchedule.exercises.map((ex, index) => `
                <div class="flex-row gap-sm card" style="padding: var(--spacing-sm); align-items: center; background-color: ${isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-surface)'}; border-color: ${isCompleted ? 'var(--color-success)' : 'var(--border-subtle)'};">
                  <div class="checkbox-container" style="flex-shrink: 0; width: 24px; height: 24px; border-radius: var(--radius-sm); border: 2px solid ${isCompleted ? 'var(--color-success)' : 'var(--color-text-muted)'}; background-color: ${isCompleted ? 'var(--color-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                    ${isCompleted ? '✓' : ''}
                  </div>
                  <span style="font-size: var(--font-body); font-weight: 500; text-decoration: ${isCompleted ? 'line-through' : 'none'}; color: ${isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-primary)'};">
                    ${ex}
                  </span>
                </div>
              `).join('')}
            </div>

            <!-- Complete Action Button -->
            <button id="complete-day-btn" class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" style="width: 100%;">
              ${isCompleted ? '✓ Complete Today\'s Plan' : 'Complete Today\'s Plan'}
            </button>
          `}
        </div>
      </div>
    </div>
    `;

    // Hook events
    document.getElementById('prev-day-btn')?.addEventListener('click', () => {
      const idx = daysOfWeek.indexOf(selectedDay);
      selectedDay = daysOfWeek[(idx + 6) % 7];
      updateView();
    });

    document.getElementById('next-day-btn')?.addEventListener('click', () => {
      const idx = daysOfWeek.indexOf(selectedDay);
      selectedDay = daysOfWeek[(idx + 1) % 7];
      updateView();
    });

    document.getElementById('complete-day-btn')?.addEventListener('click', () => {
      store.completeTodayPlan(todayDateString);
      updateView();
    });

    // Style the streak widget color based on count
    const widget = document.getElementById('streak-counter-widget');
    const val = document.getElementById('streak-count-val');
    const label = document.getElementById('streak-label-txt');
    if (store.state.streakCount === 0) {
      widget.style.backgroundColor = 'var(--color-surface-elevated)';
      widget.style.borderColor = 'var(--border-subtle)';
      val.style.color = 'var(--color-text-muted)';
      label.textContent = 'Start Streak';
    } else {
      widget.style.backgroundColor = 'rgba(217, 83, 0, 0.08)';
      widget.style.borderColor = 'var(--color-accent-action)';
      val.style.color = 'var(--color-accent-action)';
      label.textContent = 'Day Streak';
    }
  }

  // Returns formatted YYYY-MM-DD that aligns to selected weekday for local storage indexing
  function getTodayDateString(targetDay) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayIdx = now.getDay();
    const targetDayIdx = daysOfWeek.indexOf(targetDay);
    
    // Adjust now date to align to the target day
    const offset = targetDayIdx - currentDayIdx;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + offset);

    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  updateView();
}
