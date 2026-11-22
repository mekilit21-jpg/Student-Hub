// Central location for all StudentHub storage keys.
export const STORAGE_KEYS = Object.freeze({
  TASKS: "studenthub_tasks",
  COURSES: "studenthub_courses",
  SESSIONS: "studenthub_sessions",
  FOCUS: "studenthub_focus",
  SIDEBAR: "studenthub_sidebar"
});

// Allowed task priorities.
export const PRIORITIES = Object.freeze([
  "low",
  "medium",
  "high"
]);

// Allowed task statuses.
export const TASK_STATUSES = Object.freeze([
  "pending",
  "completed"
]);