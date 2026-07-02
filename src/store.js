const STORE_KEY = 'single_planner_state';

const DEFAULT_SCHEDULE = {
  Monday: {
    muscleGroup: "Chest & Triceps",
    exercises: ["Flat Bench Press", "Incline Dumbbell Press", "Tricep Pushdown"]
  },
  Tuesday: {
    muscleGroup: "Back & Biceps",
    exercises: ["Lat Pulldown", "Bent-Over Row", "Barbell Bicep Curl"]
  },
  Wednesday: {
    muscleGroup: "Rest Day",
    exercises: []
  },
  Thursday: {
    muscleGroup: "Shoulders & Abs",
    exercises: ["Overhead Press", "Lateral Raise", "Plank"]
  },
  Friday: {
    muscleGroup: "Legs",
    exercises: ["Squat", "Leg Curl", "Calf Raise"]
  },
  Saturday: {
    muscleGroup: "Rest Day",
    exercises: []
  },
  Sunday: {
    muscleGroup: "Rest Day",
    exercises: []
  }
};

class PlannerStore extends EventTarget {
  constructor() {
    super();
    this.state = this.loadState();
  }

  loadState() {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Error loading planner state", e);
      }
    }
    return {
      name: "your name",
      schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE))
    };
  }

  saveState() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    this.dispatchEvent(new CustomEvent('statechange', { detail: this.state }));
  }

  updateName(newName) {
    this.state.name = newName || "your name";
    this.saveState();
  }

  updateDaySchedule(day, muscleGroup, exercises) {
    if (this.state.schedule[day]) {
      this.state.schedule[day].muscleGroup = muscleGroup || "Rest Day";
      this.state.schedule[day].exercises = exercises;
      this.saveState();
    }
  }
}

export const store = new PlannerStore();
export { DEFAULT_SCHEDULE };
