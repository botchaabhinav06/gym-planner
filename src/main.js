import { store } from './store.js';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

document.addEventListener('DOMContentLoaded', () => {
  // Mount target element
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Clean up header if it exists
  const header = document.getElementById('app-header');
  if (header) {
    header.innerHTML = '';
    header.style.display = 'none';
  }

  // Adjust padding of body (remove mobile bottom nav spacer)
  document.body.style.paddingBottom = '20px';
  document.body.style.paddingTop = '20px';

  function render() {
    const state = store.state;
    
    appContainer.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Header Section -->
        <div class="card mb-md" style="padding: var(--spacing-md); background-color: var(--color-surface);">
          <h1 id="live-title" style="font-size: var(--font-h1); font-weight: 700; color: var(--color-brand-primary); margin-bottom: var(--spacing-sm);">
            ${state.name} Planner
          </h1>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="name-input">Edit Planner Owner Name</label>
            <input type="text" id="name-input" class="form-input" value="${state.name}" placeholder="e.g., your name">
          </div>
        </div>

        <!-- Weekly Planner Grid -->
        <div class="planner-grid">
          ${DAYS_OF_WEEK.map(day => {
            const data = state.schedule[day];
            const isRest = data.muscleGroup === "Rest Day";

            return `
              <div class="planner-day-col" data-day="${day}" id="col-${day}">
                <div class="planner-day-header">${day}</div>
                
                <!-- Muscle Group input area (Live updates) -->
                <div style="margin: var(--spacing-xxs) 0; padding: 0 var(--spacing-xxs);">
                  <input type="text" value="${data.muscleGroup}" 
                         class="form-input text-center" 
                         style="height: 32px; font-size: var(--font-caption); font-weight: 700; border-radius: var(--radius-sm);" 
                         data-day-muscle="${day}"
                         placeholder="Muscle Group">
                </div>

                <!-- Exercises list -->
                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs); flex-grow: 1;" id="list-${day}">
                  ${data.exercises.map((ex, idx) => `
                    <div class="exercise-card" 
                         draggable="true" 
                         data-day="${day}" 
                         data-index="${idx}">
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px;" title="${ex}">
                        ${ex}
                      </span>
                      <div class="exercise-actions">
                        <button class="exercise-btn edit-ex-btn" data-day="${day}" data-index="${idx}">✏️</button>
                      </div>
                    </div>
                  `).join('')}

                  ${isRest && data.exercises.length === 0 ? `
                    <div style="text-align: center; color: var(--color-text-muted); font-size: 12px; font-style: italic; padding: 30px 0;">
                      Rest Day
                    </div>
                  ` : ''}
                </div>

                <!-- Add Button -->
                <button class="btn btn-secondary add-ex-btn" 
                        data-day="${day}"
                        style="height: 36px; font-size: var(--font-caption); padding: 0; width: 100%; border-style: dashed; border-width: 1px; margin-top: var(--spacing-xs);">
                  + Add Exercise
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Dialogue/Modal overlays container -->
      <div id="modal-container"></div>
    `;

    // Hook layout interactions
    setupNameInput();
    setupMuscleEdits();
    setupDragAndDrop();
    setupAddButtons();
    setupEditButtons();
  }

  function setupNameInput() {
    const nameInput = document.getElementById('name-input');
    const liveTitle = document.getElementById('live-title');
    if (!nameInput || !liveTitle) return;

    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim() || "your name";
      liveTitle.textContent = `${val} Planner`;
      store.updateName(val);
    });
  }

  function setupMuscleEdits() {
    const inputs = document.querySelectorAll('[data-day-muscle]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const day = input.getAttribute('data-day-muscle');
        const val = input.value.trim() || 'Rest Day';
        store.updateDaySchedule(day, val, store.state.schedule[day].exercises);
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

          const sourceExercises = [...store.state.schedule[sourceDay].exercises];
          const targetExercises = [...store.state.schedule[targetDay].exercises];

          const [movedEx] = sourceExercises.splice(sourceIdx, 1);
          targetExercises.push(movedEx);

          let sourceMuscle = store.state.schedule[sourceDay].muscleGroup;
          let targetMuscle = store.state.schedule[targetDay].muscleGroup;

          if (sourceExercises.length === 0) sourceMuscle = 'Rest Day';
          if (targetMuscle === 'Rest Day' && targetExercises.length > 0) targetMuscle = 'Active Workout';

          store.updateDaySchedule(sourceDay, sourceMuscle, sourceExercises);
          store.updateDaySchedule(targetDay, targetMuscle, targetExercises);

          render();
        } catch (err) {
          console.error("Drop failed", err);
        }
      });
    });
  }

  function setupAddButtons() {
    const addBtns = document.querySelectorAll('.add-ex-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.getAttribute('data-day');
        const modalContainer = document.getElementById('modal-container');
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

          const exercises = [...store.state.schedule[day].exercises, name];
          let muscleGroup = store.state.schedule[day].muscleGroup;

          if (muscleGroup === 'Rest Day') muscleGroup = 'Active Workout';

          store.updateDaySchedule(day, muscleGroup, exercises);
          modalContainer.innerHTML = '';
          render();
        });
      });
    });
  }

  function setupEditButtons() {
    const editBtns = document.querySelectorAll('.edit-ex-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.getAttribute('data-day');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        const exerciseName = store.state.schedule[day].exercises[index];

        const modalContainer = document.getElementById('modal-container');
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
                  ${DAYS_OF_WEEK.map(d => `<option value="${d}" ${d === day ? 'selected' : ''}>${d}</option>`).join('')}
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
          const exercises = [...store.state.schedule[day].exercises];
          exercises.splice(index, 1);

          let muscleGroup = store.state.schedule[day].muscleGroup;
          if (exercises.length === 0) muscleGroup = 'Rest Day';

          store.updateDaySchedule(day, muscleGroup, exercises);
          modalContainer.innerHTML = '';
          render();
        });

        document.getElementById('edit-ex-save').addEventListener('click', () => {
          const newName = document.getElementById('edit-ex-name').value.trim();
          const targetDay = document.getElementById('edit-ex-day').value;

          if (!newName) return;

          const sourceExercises = [...store.state.schedule[day].exercises];

          if (day === targetDay) {
            sourceExercises[index] = newName;
            store.updateDaySchedule(day, store.state.schedule[day].muscleGroup, sourceExercises);
          } else {
            const targetExercises = [...store.state.schedule[targetDay].exercises];
            const [moved] = sourceExercises.splice(index, 1);
            targetExercises.push(newName);

            let sourceMuscle = store.state.schedule[day].muscleGroup;
            let targetMuscle = store.state.schedule[targetDay].muscleGroup;

            if (sourceExercises.length === 0) sourceMuscle = 'Rest Day';
            if (targetMuscle === 'Rest Day') targetMuscle = 'Active Workout';

            store.updateDaySchedule(day, sourceMuscle, sourceExercises);
            store.updateDaySchedule(targetDay, targetMuscle, targetExercises);
          }

          modalContainer.innerHTML = '';
          render();
        });
      });
    });
  }

  // Initial render
  render();
});
