(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))v(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const x of l.addedNodes)x.tagName==="LINK"&&x.rel==="modulepreload"&&v(x)}).observe(document,{childList:!0,subtree:!0});function p(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function v(n){if(n.ep)return;n.ep=!0;const l=p(n);fetch(n.href,l)}})();const E="single_planner_state",L={Monday:{muscleGroup:"Chest & Triceps",exercises:["Flat Bench Press","Incline Dumbbell Press","Tricep Pushdown"]},Tuesday:{muscleGroup:"Back & Biceps",exercises:["Lat Pulldown","Bent-Over Row","Barbell Bicep Curl"]},Wednesday:{muscleGroup:"Rest Day",exercises:[]},Thursday:{muscleGroup:"Shoulders & Abs",exercises:["Overhead Press","Lateral Raise","Plank"]},Friday:{muscleGroup:"Legs",exercises:["Squat","Leg Curl","Calf Raise"]},Saturday:{muscleGroup:"Rest Day",exercises:[]},Sunday:{muscleGroup:"Rest Day",exercises:[]}};class B extends EventTarget{constructor(){super(),this.state=this.loadState()}loadState(){const r=localStorage.getItem(E);if(r)try{return JSON.parse(r)}catch(p){console.error("Error loading planner state",p)}return{name:"your name",schedule:JSON.parse(JSON.stringify(L))}}saveState(){localStorage.setItem(E,JSON.stringify(this.state)),this.dispatchEvent(new CustomEvent("statechange",{detail:this.state}))}updateName(r){this.state.name=r||"your name",this.saveState()}updateDaySchedule(r,p,v){this.state.schedule[r]&&(this.state.schedule[r].muscleGroup=p||"Rest Day",this.state.schedule[r].exercises=v,this.saveState())}}const t=new B,D=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];document.addEventListener("DOMContentLoaded",()=>{const f=document.getElementById("app");if(!f)return;const r=document.getElementById("app-header");r&&(r.innerHTML="",r.style.display="none"),document.body.style.paddingBottom="20px",document.body.style.paddingTop="20px";function p(){const o=t.state;f.innerHTML=`
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Header Section -->
        <div class="card mb-md" style="padding: var(--spacing-md); background-color: var(--color-surface);">
          <h1 id="live-title" style="font-size: var(--font-h1); font-weight: 700; color: var(--color-brand-primary); margin-bottom: var(--spacing-sm);">
            ${o.name} Planner
          </h1>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="name-input">Edit Planner Owner Name</label>
            <input type="text" id="name-input" class="form-input" value="${o.name}" placeholder="e.g., your name">
          </div>
        </div>

        <!-- Weekly Planner Grid -->
        <div class="planner-grid">
          ${D.map(s=>{const e=o.schedule[s],a=e.muscleGroup==="Rest Day";return`
              <div class="planner-day-col" data-day="${s}" id="col-${s}">
                <div class="planner-day-header">${s}</div>
                
                <!-- Muscle Group input area (Live updates) -->
                <div style="margin: var(--spacing-xxs) 0; padding: 0 var(--spacing-xxs);">
                  <input type="text" value="${e.muscleGroup}" 
                         class="form-input text-center" 
                         style="height: 32px; font-size: var(--font-caption); font-weight: 700; border-radius: var(--radius-sm);" 
                         data-day-muscle="${s}"
                         placeholder="Muscle Group">
                </div>

                <!-- Exercises list -->
                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs); flex-grow: 1;" id="list-${s}">
                  ${e.exercises.map((c,i)=>`
                    <div class="exercise-card" 
                         draggable="true" 
                         data-day="${s}" 
                         data-index="${i}">
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px;" title="${c}">
                        ${c}
                      </span>
                      <div class="exercise-actions">
                        <button class="exercise-btn edit-ex-btn" data-day="${s}" data-index="${i}">✏️</button>
                      </div>
                    </div>
                  `).join("")}

                  ${a&&e.exercises.length===0?`
                    <div style="text-align: center; color: var(--color-text-muted); font-size: 12px; font-style: italic; padding: 30px 0;">
                      Rest Day
                    </div>
                  `:""}
                </div>

                <!-- Add Button -->
                <button class="btn btn-secondary add-ex-btn" 
                        data-day="${s}"
                        style="height: 36px; font-size: var(--font-caption); padding: 0; width: 100%; border-style: dashed; border-width: 1px; margin-top: var(--spacing-xs);">
                  + Add Exercise
                </button>
              </div>
            `}).join("")}
        </div>
      </div>

      <!-- Dialogue/Modal overlays container -->
      <div id="modal-container"></div>
    `,v(),n(),l(),x(),S()}function v(){const o=document.getElementById("name-input"),s=document.getElementById("live-title");!o||!s||o.addEventListener("input",()=>{const e=o.value.trim()||"your name";s.textContent=`${e} Planner`,t.updateName(e)})}function n(){document.querySelectorAll("[data-day-muscle]").forEach(s=>{s.addEventListener("change",()=>{const e=s.getAttribute("data-day-muscle"),a=s.value.trim()||"Rest Day";t.updateDaySchedule(e,a,t.state.schedule[e].exercises)})})}function l(){const o=document.querySelectorAll(".planner-day-col");document.querySelectorAll(".exercise-card").forEach(e=>{e.addEventListener("dragstart",a=>{const c={day:e.getAttribute("data-day"),index:parseInt(e.getAttribute("data-index"),10)};a.dataTransfer.setData("text/plain",JSON.stringify(c))})}),o.forEach(e=>{e.addEventListener("dragover",a=>{a.preventDefault(),e.classList.add("drag-over")}),e.addEventListener("dragleave",()=>{e.classList.remove("drag-over")}),e.addEventListener("drop",a=>{a.preventDefault(),e.classList.remove("drag-over");try{const c=JSON.parse(a.dataTransfer.getData("text/plain")),i=c.day,d=c.index,u=e.getAttribute("data-day");if(i===u)return;const m=[...t.state.schedule[i].exercises],g=[...t.state.schedule[u].exercises],[b]=m.splice(d,1);g.push(b);let h=t.state.schedule[i].muscleGroup,y=t.state.schedule[u].muscleGroup;m.length===0&&(h="Rest Day"),y==="Rest Day"&&g.length>0&&(y="Active Workout"),t.updateDaySchedule(i,h,m),t.updateDaySchedule(u,y,g),p()}catch(c){console.error("Drop failed",c)}})})}function x(){document.querySelectorAll(".add-ex-btn").forEach(s=>{s.addEventListener("click",()=>{const e=s.getAttribute("data-day"),a=document.getElementById("modal-container");a&&(a.innerHTML=`
          <div class="modal-overlay">
            <div class="modal-content">
              <h2 class="modal-title">Add Exercise to ${e}</h2>
              
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
        `,document.getElementById("add-ex-cancel").addEventListener("click",()=>{a.innerHTML=""}),document.getElementById("add-ex-save").addEventListener("click",()=>{const c=document.getElementById("add-ex-name").value.trim();if(!c)return;const i=[...t.state.schedule[e].exercises,c];let d=t.state.schedule[e].muscleGroup;d==="Rest Day"&&(d="Active Workout"),t.updateDaySchedule(e,d,i),a.innerHTML="",p()}))})})}function S(){document.querySelectorAll(".edit-ex-btn").forEach(s=>{s.addEventListener("click",()=>{const e=s.getAttribute("data-day"),a=parseInt(s.getAttribute("data-index"),10),c=t.state.schedule[e].exercises[a],i=document.getElementById("modal-container");i&&(i.innerHTML=`
          <div class="modal-overlay">
            <div class="modal-content">
              <h2 class="modal-title">Edit Workout Card</h2>
              
              <div class="form-group">
                <label class="form-label" for="edit-ex-name">Exercise Name</label>
                <input type="text" id="edit-ex-name" class="form-input" value="${c}">
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-ex-day">Move to Day</label>
                <select id="edit-ex-day" class="form-input" style="height: 48px;">
                  ${D.map(d=>`<option value="${d}" ${d===e?"selected":""}>${d}</option>`).join("")}
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
        `,document.getElementById("edit-ex-cancel").addEventListener("click",()=>{i.innerHTML=""}),document.getElementById("edit-ex-delete").addEventListener("click",()=>{const d=[...t.state.schedule[e].exercises];d.splice(a,1);let u=t.state.schedule[e].muscleGroup;d.length===0&&(u="Rest Day"),t.updateDaySchedule(e,u,d),i.innerHTML="",p()}),document.getElementById("edit-ex-save").addEventListener("click",()=>{const d=document.getElementById("edit-ex-name").value.trim(),u=document.getElementById("edit-ex-day").value;if(!d)return;const m=[...t.state.schedule[e].exercises];if(e===u)m[a]=d,t.updateDaySchedule(e,t.state.schedule[e].muscleGroup,m);else{const g=[...t.state.schedule[u].exercises],[b]=m.splice(a,1);g.push(d);let h=t.state.schedule[e].muscleGroup,y=t.state.schedule[u].muscleGroup;m.length===0&&(h="Rest Day"),y==="Rest Day"&&(y="Active Workout"),t.updateDaySchedule(e,h,m),t.updateDaySchedule(u,y,g)}i.innerHTML="",p()}))})})}p()});
