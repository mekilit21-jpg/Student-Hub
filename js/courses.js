import { renderNavbar } from "./shared/navbar.js";

import {
  getAll,
  add,
  update,
  remove
} from "./shared/storage.js";

import { STORAGE_KEYS } from "./shared/constants.js";

import { validateCourse } from "./shared/validators.js";


// Render the shared navigation.
renderNavbar();


// Get HTML elements.
const form = document.querySelector("#course-form");
const nameInput = document.querySelector("#course-name");
const codeInput = document.querySelector("#course-code");
const instructorInput = document.querySelector("#course-instructor");
const scheduleInput = document.querySelector("#course-schedule");

const courseList = document.querySelector("#course-list");
const emptyState = document.querySelector("#empty-state");
const courseCount = document.querySelector("#course-count");

const formHeading = document.querySelector("#form-heading");
const saveButton = document.querySelector("#save-course");
const cancelButton = document.querySelector("#cancel-edit");
const formMessage = document.querySelector("#form-message");

const nameError = document.querySelector("#name-error");
const codeError = document.querySelector("#code-error");


// The ID of the course currently being edited.
let editingId = null;


// Load all courses from the shared storage.
function getCourses() {
  return getAll(STORAGE_KEYS.COURSES);
}


// Display a message to the user.
function showMessage(message) {
  formMessage.textContent = message;
}


// Clear validation messages.
function clearErrors() {
  nameError.textContent = "";
  codeError.textContent = "";

  nameInput.classList.remove("input-error");
  codeInput.classList.remove("input-error");

  nameInput.removeAttribute("aria-invalid");
  codeInput.removeAttribute("aria-invalid");
}


// Display validation errors.
function showErrors(errors) {
  clearErrors();

  if (errors.name) {
    nameError.textContent = errors.name;
    nameInput.classList.add("input-error");
    nameInput.setAttribute("aria-invalid", "true");
  }

  if (errors.code) {
    codeError.textContent = errors.code;
    codeInput.classList.add("input-error");
    codeInput.setAttribute("aria-invalid", "true");
  }
}


// Create an HTML element with text.
function createTextElement(tag, className, text) {
  const element = document.createElement(tag);

  element.className = className;
  element.textContent = text;

  return element;
}


// Create a course detail row.
function createDetail(label, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "course-detail";

  const labelElement = createTextElement(
    "span",
    "course-detail-label",
    label
  );

  const valueElement = createTextElement(
    "span",
    "course-detail-value",
    value || "Not provided"
  );

  wrapper.append(labelElement, valueElement);

  return wrapper;
}


// Create a button.
function createButton(text, className, onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = className;
  button.textContent = text;

  button.addEventListener("click", onClick);

  return button;
}


// Build one course card.
function createCourseCard(course) {
  const card = document.createElement("article");
  card.className = "course-card";

  const header = document.createElement("div");
  header.className = "course-card-header";

  const code = createTextElement(
    "span",
    "course-code",
    course.code
  );

  const title = createTextElement(
    "h3",
    "",
    course.name
  );

  header.append(code);

  const details = document.createElement("div");
  details.className = "course-details";

  details.append(
    createDetail("Instructor", course.instructor),
    createDetail("Schedule", course.schedule)
  );

  const actions = document.createElement("div");
  actions.className = "course-actions";

  const editButton = createButton(
    "Edit",
    "btn btn-secondary",
    () => startEditing(course)
  );

  const deleteButton = createButton(
    "Delete",
    "btn btn-danger",
    () => deleteCourse(course)
  );

  actions.append(editButton, deleteButton);

  card.append(header, title, details, actions);

  return card;
}


// Display all saved courses.
function renderCourses() {
  const courses = getCourses();

  courseList.replaceChildren();

  courseCount.textContent =
    `${courses.length} ${courses.length === 1 ? "course" : "courses"}`;

  emptyState.hidden = courses.length > 0;

  courses.forEach(course => {
    courseList.append(createCourseCard(course));
  });
}


// Collect the form values.
function getFormData() {
  return {
    name: nameInput.value.trim(),
    code: codeInput.value.trim(),
    instructor: instructorInput.value.trim(),
    schedule: scheduleInput.value.trim()
  };
}


// Reset the form and exit edit mode.
function resetForm() {
  form.reset();

  editingId = null;

  formHeading.textContent = "Add a Course";
  saveButton.textContent = "Add Course";

  cancelButton.hidden = true;

  clearErrors();
  showMessage("");
}


// Start editing an existing course.
function startEditing(course) {
  editingId = course.id;

  nameInput.value = course.name;
  codeInput.value = course.code;
  instructorInput.value = course.instructor || "";
  scheduleInput.value = course.schedule || "";

  formHeading.textContent = "Edit Course";
  saveButton.textContent = "Save Changes";

  cancelButton.hidden = false;

  clearErrors();
  showMessage("");

  // Bring the form into view.
  form.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  nameInput.focus();
}


// Handle form submission.
form.addEventListener("submit", event => {
  event.preventDefault();

  clearErrors();
  showMessage("");

  const course = getFormData();
  const existingCourses = getCourses();

  // Exclude the current course during editing.
  const validation = validateCourse(
    course,
    existingCourses,
    editingId
  );

  if (!validation.isValid) {
    showErrors(validation.errors);
    return;
  }

  let result;

  if (editingId) {
    result = update(
      STORAGE_KEYS.COURSES,
      editingId,
      course
    );

    if (!result) {
      showMessage("Could not update the course. Please try again.");
      return;
    }

    showMessage("Course updated successfully.");

  } else {
    result = add(
      STORAGE_KEYS.COURSES,
      course
    );

    if (!result) {
      showMessage("Could not save the course. Please try again.");
      return;
    }

    showMessage("Course added successfully.");
  }

  resetForm();
  renderCourses();
});


// Cancel editing.
cancelButton.addEventListener("click", () => {
  resetForm();
});


// Delete a course.
function deleteCourse(course) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${course.name}"?`
  );

  if (!confirmed) {
    return;
  }

  const deleted = remove(
    STORAGE_KEYS.COURSES,
    course.id
  );

  if (!deleted) {
    showMessage("Could not delete the course. Please try again.");
    return;
  }

  // If the deleted course was being edited, reset the form.
  if (editingId === course.id) {
    resetForm();
  }

  showMessage("Course deleted successfully.");

  renderCourses();
}


// Remove errors when the user starts correcting a field.
nameInput.addEventListener("input", () => {
  nameError.textContent = "";
  nameInput.classList.remove("input-error");
  nameInput.removeAttribute("aria-invalid");
});

codeInput.addEventListener("input", () => {
  codeError.textContent = "";
  codeInput.classList.remove("input-error");
  codeInput.removeAttribute("aria-invalid");
});


// Initial page load.
renderCourses();