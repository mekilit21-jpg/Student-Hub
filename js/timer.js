import { renderNavbar } from "./shared/navbar.js";
import { add, getAll, update } from "./shared/storage.js";
import { STORAGE_KEYS } from "./shared/constants.js";

const DEFAULT_DURATIONS = Object.freeze({
  focus: 25,
  shortBreak: 5,
  longBreak: 15
});

const MODE_LABELS = Object.freeze({
  focus: "Focus session",
  shortBreak: "Short break",
  longBreak: "Long break"
});

const MODE_INPUTS = Object.freeze({
  focus: document.getElementById("focus-minutes"),
  shortBreak: document.getElementById("short-break-minutes"),
  longBreak: document.getElementById("long-break-minutes")
});

const elements = {
  display: document.getElementById("timer-display"),
  modeLabel: document.getElementById("timer-mode-label"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  start: document.getElementById("timer-start"),
  pause: document.getElementById("timer-pause"),
  reset: document.getElementById("timer-reset"),
  status: document.getElementById("timer-status"),
  settingsForm: document.getElementById("timer-settings-form"),
  sessionCount: document.getElementById("session-count"),
  sessionEmpty: document.getElementById("session-empty"),
  sessionList: document.getElementById("session-list")
};

const savedRecords = getAll(STORAGE_KEYS.FOCUS);
const settingsRecord = savedRecords.find(record => record.type === "settings");
const storedDurations = settingsRecord?.durations ?? {};

const durations = Object.fromEntries(
  Object.keys(DEFAULT_DURATIONS).map(mode => [
    mode,
    isValidDuration(storedDurations[mode])
      ? storedDurations[mode]
      : DEFAULT_DURATIONS[mode]
  ])
);

let currentMode = Object.hasOwn(MODE_LABELS, settingsRecord?.currentMode)
  ? settingsRecord.currentMode
  : "focus";
let remainingMs = durations[currentMode] * 60_000;
let deadlineAt = null;
let tickerId = null;
let isRunning = false;

function isValidDuration(value) {
  return Number.isInteger(value) && value >= 1 && value <= 180;
}

function getSettingsRecord() {
  return getAll(STORAGE_KEYS.FOCUS).find(record => record.type === "settings");
}

function persistSettings() {
  const record = getSettingsRecord();
  const changes = { durations: { ...durations }, currentMode };
  const saved = record
    ? update(STORAGE_KEYS.FOCUS, record.id, changes)
    : add(STORAGE_KEYS.FOCUS, { type: "settings", ...changes });

  return Boolean(saved);
}

function setStatus(message) {
  elements.status.textContent = message;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderTimer() {
  const formattedTime = formatTime(remainingMs);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDescription = seconds === 0
    ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
    : `${minutes} ${minutes === 1 ? "minute" : "minutes"} and ${seconds} ${seconds === 1 ? "second" : "seconds"}`;

  elements.display.textContent = formattedTime;
  elements.display.setAttribute("aria-label", `${timeDescription} remaining`);
  elements.modeLabel.textContent = MODE_LABELS[currentMode];
  elements.modeButtons.forEach(button => {
    const isActive = button.dataset.mode === currentMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  elements.start.hidden = isRunning;
  elements.pause.hidden = !isRunning;
}

function stopTicker() {
  if (tickerId !== null) {
    window.clearInterval(tickerId);
    tickerId = null;
  }
}

function resetCountdown() {
  stopTicker();
  isRunning = false;
  deadlineAt = null;
  remainingMs = durations[currentMode] * 60_000;
  renderTimer();
}

function completeTimer() {
  stopTicker();
  isRunning = false;
  deadlineAt = null;
  remainingMs = 0;
  renderTimer();

  if (currentMode === "focus") {
    const completedAt = new Date();
    const localDate = [
      completedAt.getFullYear(),
      String(completedAt.getMonth() + 1).padStart(2, "0"),
      String(completedAt.getDate()).padStart(2, "0")
    ].join("-");
    const saved = add(STORAGE_KEYS.FOCUS, {
      type: "completed-focus",
      duration: durations.focus,
      date: localDate,
      completedAt: completedAt.toISOString(),
      mode: "focus"
    });

    if (saved) {
      renderSessions();
      setStatus("Focus session complete. Your session has been saved.");
    } else {
      setStatus("Focus session complete, but it could not be saved on this device.");
    }
    return;
  }

  setStatus(`${MODE_LABELS[currentMode]} complete.`);
}

function updateCountdown() {
  if (!isRunning || deadlineAt === null) {
    return;
  }

  remainingMs = Math.max(0, deadlineAt - Date.now());
  if (remainingMs === 0) {
    completeTimer();
    return;
  }

  renderTimer();
}

function startTimer() {
  if (isRunning) {
    return;
  }

  if (remainingMs <= 0) {
    remainingMs = durations[currentMode] * 60_000;
  }

  isRunning = true;
  deadlineAt = Date.now() + remainingMs;
  stopTicker();
  tickerId = window.setInterval(updateCountdown, 250);
  renderTimer();
  setStatus(`${MODE_LABELS[currentMode]} started.`);
}

function pauseTimer() {
  if (!isRunning || deadlineAt === null) {
    return;
  }

  remainingMs = Math.max(0, deadlineAt - Date.now());
  if (remainingMs === 0) {
    completeTimer();
    return;
  }

  stopTicker();
  isRunning = false;
  deadlineAt = null;
  renderTimer();
  setStatus("Timer paused.");
}

function selectMode(mode) {
  if (!Object.hasOwn(MODE_LABELS, mode) || mode === currentMode) {
    return;
  }

  resetCountdown();
  currentMode = mode;
  remainingMs = durations[currentMode] * 60_000;
  renderTimer();

  const saved = persistSettings();
  setStatus(saved
    ? `${MODE_LABELS[currentMode]} selected. Timer reset.`
    : `${MODE_LABELS[currentMode]} selected, but the setting could not be saved.`);
}

function saveDurations(event) {
  event.preventDefault();

  if (!elements.settingsForm.reportValidity()) {
    return;
  }

  const nextDurations = Object.fromEntries(
    Object.entries(MODE_INPUTS).map(([mode, input]) => [mode, Number(input.value)])
  );
  const allValid = Object.values(nextDurations).every(isValidDuration);

  if (!allValid) {
    setStatus("Enter a whole number from 1 to 180 minutes for each duration.");
    return;
  }

  Object.assign(durations, nextDurations);
  if (isRunning) {
    stopTicker();
    isRunning = false;
    deadlineAt = null;
  }
  remainingMs = durations[currentMode] * 60_000;
  renderTimer();

  if (persistSettings()) {
    setStatus("Durations saved. The timer has been reset.");
  } else {
    setStatus("Durations updated for this visit, but they could not be saved on this device.");
  }
}

function renderSessions() {
  const sessions = getAll(STORAGE_KEYS.FOCUS)
    .filter(record =>
      record.type === "completed-focus" &&
      Number.isFinite(record.duration) &&
      typeof record.completedAt === "string"
    )
    .sort((first, second) =>
      new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime()
    );

  elements.sessionCount.textContent = String(sessions.length);
  elements.sessionCount.setAttribute(
    "aria-label",
    `${sessions.length} completed ${sessions.length === 1 ? "session" : "sessions"}`
  );
  elements.sessionEmpty.hidden = sessions.length > 0;
  elements.sessionList.hidden = sessions.length === 0;
  elements.sessionList.replaceChildren();

  sessions.forEach(session => {
    const item = document.createElement("li");
    const duration = document.createElement("span");
    const completedDate = document.createElement("time");
    const date = new Date(session.completedAt);

    item.className = "timer-session-item";
    duration.className = "timer-session-duration";
    duration.textContent = `${session.duration} minute${session.duration === 1 ? "" : "s"} of focus`;
    completedDate.className = "timer-session-date";
    completedDate.dateTime = session.completedAt;
    completedDate.textContent = Number.isNaN(date.getTime())
      ? "Date unavailable"
      : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date);
    item.append(duration, completedDate);
    elements.sessionList.append(item);
  });
}

function initialize() {
  renderNavbar();

  Object.entries(MODE_INPUTS).forEach(([mode, input]) => {
    input.value = String(durations[mode]);
  });

  elements.modeButtons.forEach(button => {
    button.addEventListener("click", () => selectMode(button.dataset.mode));
  });
  elements.start.addEventListener("click", startTimer);
  elements.pause.addEventListener("click", pauseTimer);
  elements.reset.addEventListener("click", () => {
    resetCountdown();
    setStatus("Timer reset.");
  });
  elements.settingsForm.addEventListener("submit", saveDurations);
  document.addEventListener("visibilitychange", updateCountdown);

  renderTimer();
  renderSessions();
  setStatus("Ready when you are.");
}

initialize();