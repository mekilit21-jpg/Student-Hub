import { PRIORITIES, TASK_STATUSES } from "./constants.js";

// Check whether a required text field is empty.
function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

// Check whether a date is a real date in YYYY-MM-DD format.
function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
// Check whether a time is valid in 24-hour HH:MM format.
function isValidTime(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

// Validate task information.
export function validateTask(task = {}) {
  task = task ?? {};

  const errors = {};

  if (isBlank(task.title)) {
    errors.title = "Title is required.";
  }

  if (!isValidDate(task.dueDate)) {
    errors.dueDate = "Enter a valid due date.";
  }

  if (!PRIORITIES.includes(task.priority)) {
    errors.priority = "Choose a priority.";
  }

  if (!TASK_STATUSES.includes(task.status)) {
    errors.status = "Choose a status.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}


// Validate course information.
export function validateCourse(
  course = {},
  existingCourses = [],
  excludeId = null
) {
  course = course ?? {};

  const errors = {};

  if (isBlank(course.name)) {
    errors.name = "Course name is required.";
  }

  if (isBlank(course.code)) {
    errors.code = "Course code is required.";
  } else if (
    existingCourses.some(
      existing =>
        existing.id !== excludeId &&
        existing.code?.trim().toLowerCase() ===
          course.code.trim().toLowerCase()
    )
  ) {
    errors.code = "Course code already exists.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}



// Validate planned study session information.
export function validateSession(session = {}) {
  session = session ?? {};

  const errors = {};

  if (isBlank(session.courseId)) {
    errors.courseId = "Choose a course.";
  }

  if (!isValidDate(session.date)) {
    errors.date = "Enter a valid date.";
  }

  if (!isValidTime(session.startTime)) {
    errors.startTime = "Enter a valid start time.";
  }

  if (!isValidTime(session.endTime)) {
    errors.endTime = "Enter a valid end time.";
  }

  if (
    isValidTime(session.startTime) &&
    isValidTime(session.endTime) &&
    session.endTime <= session.startTime
  ) {
    errors.endTime = "End time must be later than start time.";
  }

  if (isBlank(session.topic)) {
    errors.topic = "Enter a study topic.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}