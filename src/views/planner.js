import { store } from '../store.js';

export function renderPlanner(container) {
  const activeLevel = store.state.activeLevel;
  const isBeginner = activeLevel === 'beginner';
  const schedule = store.state.customSchedules[activeLevel];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function updateView() {
    container.innerHTML = `
      <div style="width: 100%;">
        <div class="flex-between mb-md">
          <div>
            <h1 style="font-size: var(--font-h1); font-weight: 700;">Weekly Schedule Planner</h1>
            <p style="color: var(--color-text-muted);">
              ${isBeginner 
                ? 'Your structured workout schedule. Upgrade to customize.' 
                : 'Drag and drop cards or click the edit icon to organize your split.'
              }
            </p>
          </div>
        </div>

        <!-- Progression Lock Banner for Beginners -->
        ${isBeginner ? `
          <div class="lock-banner">
            <span class="lock-banner-icon">🔒</span>
            <div style="flex-grow: 1;">
              <div class="lock-banner-title">
                Unlock Custom split planners in: ${store.getDaysRemaining()} Days
              </div>
              <div class="lock-banner-desc">
                Follow your structured weekly routine to build consistency. Once completed, customizable tables unlock automatically.
              </div>
            </div>
            <button id="bypass-lock-btn" class="btn btn-secondary" style="height: 36px; padding: 0 var(--spacing-sm); font-size: var(--font-caption);">
              Unlock Early
            </button>
          </div>
        ` : ''}

        <!-- Planner Grid Canvas -->
        <div class="planner-grid">
          ${daysOfWeek.map(day => {
            const data = schedule[day];
            const isRest = data.muscleGroup === "Rest Day";
            
            return `
              <div class="planner-day-col" data-day="${day}" id="col-${day}">
                <div class="planner-day-header">${day}</div>
                
                <!-- Muscle group area -->
                <div style="margin: var(--spacing-xxs) 0; text-align: center;">
                  ${!isBeginner && activeLevel === 'pro' ? `
                    <input type="text" value="${data.muscleGroup}" 
                           class="form-input text-center" 
                           style="height: 28px; font-size: 11px; padding: 0 4px; font-weight: 700; border-radius: var(--radius-sm);" 
                           data-day-muscle="${day}">
                  ` : `
                    <span class="muscle-tag" style="font-size: 10px; padding: 2px 6px;">
                      ${data.muscleGroup}
                    </span>
                  `}
                </div>

                <!-- Exercise List -->
                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs); flex-grow: 1;" id="list-${day}">
                  ${data.exercises.map((ex, idx) => `
                    <div class="exercise-card" 
                         ${!isBeginner ? 'draggable="true"' : ''} 
                         data-day="${day}" 
                         data-index="${idx}">
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px;" title="${ex}">
                        ${ex}
                      </span>
                      
                      ${!isBeginner ? `
                        <div class="exercise-actions">
                          <button class="exercise-btn edit-ex-btn" data-day="${day}" data-index="${idx}">✏️</button>
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                  
                  ${isRest && data.exercises.length === 0 ? `
                    <div style="text-align: center; color: var(--color-text-muted); font-size: 11px; font-style: italic; padding: 20px 0;">
                      Rest Day
                    </div>
                  ` : ''}
                </div>

                <!-- Add exercise button -->
                ${!isBeginner ? `
                  <button class="btn btn-secondary add-ex-btn" 
                          data-day="${day}"
                          style="height: 28px; font-size: var(--font-caption); padding: 0; width: 100%; border-style: dashed; border-width: 1px;">
                    + Add Exercise
                  </button>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Dialogue/Modal overlays mounting point -->
      <div id="planner-modal-container"></div>
    `;

    // Hook standard operations
    setupBypassLock();
    if (!isBeginner) {
      setupDragAndDrop();
      setupEditButtons();
      setupAddButtons();
      setupMuscleGroupEdits();
    }
  }

  function setupBypassLock() {
    document.getElementById('bypass-lock-btn')?.addEventListener('click', () => {
      const modalContainer = document.getElementById('planner-modal-container');
      if (!modalContainer) return;

      modalContainer.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">Unlock Advanced Levels?</h2>
            <p class="modal-text">
              You are about to skip the remaining beginner habit progression. We recommend completing the full guided track. Would you like to continue?
            </p>
            <div class="modal-actions">
              <button id="bypass-cancel" class="btn btn-secondary">Go Back</button>
              <button id="bypass-confirm" class="btn btn-primary">Unlock Plan</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('bypass-cancel').addEventListener('click', () => {
        modalContainer.innerHTML = '';
      });

      document.getElementById('bypass-confirm').addEventListener('click', () => {
        // Upgrade to Intermediate and bypass lock
        store.selectLevel('intermediate', true);
        modalContainer.innerHTML = '';
        // Re-render hash to trigger router statechange
        window.location.hash = '#planner';
      });
    });
  }

  function setupDragAndDrop() {
    const cols = document.querySelectorAll('.planner-day-col');
    const cards = document.querySelectorAll('.exercise-card');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const payload = {
          day: card.getAttribute('data-day'),
          index: parseInt(card.getAttribute('data-index'), 10)
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      });
    });

    cols.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        
        try {
          const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
          const sourceDay = payload.day;
          const sourceIdx = payload.index;
          const targetDay = col.getAttribute('data-day');

          if (sourceDay === targetDay) return;

          // Move the exercise
          const sourceExercises = [...schedule[sourceDay].exercises];
          const targetExercises = [...schedule[targetDay].exercises];
          
          const [movedEx] = sourceExercises.splice(sourceIdx, 1);
          targetExercises.push(movedEx);

          // Update Muscle group states if moving in/out of Rest Day
          let sourceMuscle = schedule[sourceDay].muscleGroup;
          let targetMuscle = schedule[targetDay].muscleGroup;

          if (sourceExercises.length === 0) sourceMuscle = 'Rest Day';
          if (targetMuscle === 'Rest Day' && targetExercises.length > 0) targetMuscle = 'Active Workout';

          store.updateSchedule(activeLevel, sourceDay, sourceMuscle, sourceExercises);
          store.updateSchedule(activeLevel, targetDay, targetMuscle, targetExercises);
          
          updateView();
        } catch (err) {
          console.error("Drop failed", err);
        }
      });
    });
  }

  function setupEditButtons() {
    const editBtns = document.querySelectorAll('.edit-ex-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.getAttribute('data-day');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        const exerciseName = schedule[day].exercises[index];

        const modalContainer = document.getElementById('planner-modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
          <div class="modal-overlay">
            <div class="modal-content">
              <h2 class="modal-title">Edit Workout Card</h2>
              
              <div class="form-group">
                <label class="form-label" for="edit-ex-name">Exercise Name</label>
                <input type="text" id="edit-ex-name" class="form-input" value="${exerciseName}">
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-ex-day">Move to Day</label>
                <select id="edit-ex-day" class="form-input" style="height: 48px;">
                  ${daysOfWeek.map(d => `<option value="${d}" ${d === day ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>

              <div class="modal-actions" style="margin-top: var(--spacing-md); display: flex; justify-content: space-between;">
                <button id="edit-ex-delete" class="btn btn-warning" style="height: 48px; padding: 0 var(--spacing-sm);">Delete</button>
                <div style="display: flex; gap: var(--spacing-xs);">
                  <button id="edit-ex-cancel" class="btn btn-secondary">Cancel</button>
                  <button id="edit-ex-save" class="btn btn-primary">Save</button>
                </div>
              </div>
            </div>
          </div>
        `;

        document.getElementById('edit-ex-cancel').addEventListener('click', () => {
          modalContainer.innerHTML = '';
        });

        document.getElementById('edit-ex-delete').addEventListener('click', () => {
          const exercises = [...schedule[day].exercises];
          exercises.splice(index, 1);
          
          let muscleGroup = schedule[day].muscleGroup;
          if (exercises.length === 0) muscleGroup = 'Rest Day';

          store.updateSchedule(activeLevel, day, muscleGroup, exercises);
          modalContainer.innerHTML = '';
          updateView();
        });

        document.getElementById('edit-ex-save').addEventListener('click', () => {
          const newName = document.getElementById('edit-ex-name').value.trim();
          const targetDay = document.getElementById('edit-ex-day').value;

          if (!newName) return;

          const sourceExercises = [...schedule[day].exercises];
          
          if (day === targetDay) {
            // Edit in place
            sourceExercises[index] = newName;
            store.updateSchedule(activeLevel, day, schedule[day].muscleGroup, sourceExercises);
          } else {
            // Move to other day
            const targetExercises = [...schedule[targetDay].exercises];
            const [moved] = sourceExercises.splice(index, 1);
            targetExercises.push(newName);

            let sourceMuscle = schedule[day].muscleGroup;
            let targetMuscle = schedule[targetDay].muscleGroup;

            if (sourceExercises.length === 0) sourceMuscle = 'Rest Day';
            if (targetMuscle === 'Rest Day') targetMuscle = 'Active Workout';

            store.updateSchedule(activeLevel, day, sourceMuscle, sourceExercises);
            store.updateSchedule(activeLevel, targetDay, targetMuscle, targetExercises);
          }

          modalContainer.innerHTML = '';
          updateView();
        });
      });
    });
  }

  function setupAddButtons() {
    const addBtns = document.querySelectorAll('.add-ex-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.getAttribute('data-day');
        
        const modalContainer = document.getElementById('planner-modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
          <div class="modal-overlay">
            <div class="modal-content">
              <h2 class="modal-title">Add Exercise to ${day}</h2>
              
              <div class="form-group">
                <label class="form-label" for="add-ex-name">Exercise Name</label>
                <input type="text" id="add-ex-name" class="form-input" placeholder="e.g., Pull-Up" required>
              </div>

              <div class="modal-actions">
                <button id="add-ex-cancel" class="btn btn-secondary">Cancel</button>
                <button id="add-ex-save" class="btn btn-primary">Add Card</button>
              </div>
            </div>
          </div>
        `;

        document.getElementById('add-ex-cancel').addEventListener('click', () => {
          modalContainer.innerHTML = '';
        });

        document.getElementById('add-ex-save').addEventListener('click', () => {
          const name = document.getElementById('add-ex-name').value.trim();
          if (!name) return;

          const exercises = [...schedule[day].exercises, name];
          let muscleGroup = schedule[day].muscleGroup;
          
          if (muscleGroup === 'Rest Day') muscleGroup = 'Active Workout';

          store.updateSchedule(activeLevel, day, muscleGroup, exercises);
          modalContainer.innerHTML = '';
          updateView();
        });
      });
    });
  }

  function setupMuscleGroupEdits() {
    const inputs = document.querySelectorAll('[data-day-muscle]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const day = input.getAttribute('data-day-muscle');
        const val = input.value.trim() || 'Rest Day';
        store.updateSchedule(activeLevel, day, val, schedule[day].exercises);
      });
    });
  }

  updateView();
}
