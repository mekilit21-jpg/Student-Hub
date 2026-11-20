/*
 * NAVBAR (FR-NAV-01, 02, 03, 04)
 *
 * HOW TO USE (every page):
 *   HTML: <aside class="sidebar" id="navbar"></aside>
 *         (inside .app-shell, before .app-main; the id is optional because
 *          the script also finds an element with class "sidebar")
 *   JS:   import { renderNavbar } from "./shared/navbar.js";
 *         renderNavbar();   (call once, when the page script starts)
 *
 * HOW LINKS GET THEIR PREFIX:
 *   If the address contains /pages/ we are inside /pages, so the prefix is "../".
 *   Otherwise we are at the root, so the prefix is "./".
 *
 * HOW TO ADD A NEW PAGE:
 *   Add one line to NAV_LINKS below.
 */

// The pages in the navbar. "folder" is where the file lives.
const NAV_LINKS = [
  { label: "Dashboard", file: "index.html", folder: "" },
  { label: "Tasks", file: "tasks.html", folder: "pages/" },
  { label: "Courses", file: "courses.html", folder: "pages/" },
  { label: "Planner", file: "planner.html", folder: "pages/" },
  { label: "Timer", file: "timer.html", folder: "pages/" },
  { label: "Progress", file: "progress.html", folder: "pages/" },
];

export function renderNavbar(containerId = "navbar") {
  // 1. Find the place for the navbar. Create it if the page forgot it.
  let container =
    document.getElementById(containerId) || document.querySelector(".sidebar");
  if (!container) {
    container = document.createElement("aside");
    container.className = "sidebar";
    container.id = containerId;
    (document.querySelector(".app-shell") || document.body).prepend(container);
  }

  // 2. Work out the prefix and the current file name.
  const inPages = window.location.pathname.includes("/pages/");
  const prefix = inPages ? "../" : "./";
  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  // 3. Build one list item per link. Mark the current page.
  const linksHtml = NAV_LINKS.map((link) => {
    const isActive = link.file === currentFile;
    const activeClass = isActive ? " active" : "";
    const ariaCurrent = isActive ? ' aria-current="page"' : "";
    return `<li><a class="navbar-link${activeClass}" href="${prefix}${link.folder}${link.file}"${ariaCurrent}>${link.label}</a></li>`;
  }).join("");

  // 4. Put it on the page.
  container.innerHTML = `
    <nav class="navbar" aria-label="Main">
      <a class="navbar-brand" href="${prefix}index.html">StudentHub</a>
      <button class="navbar-toggle" type="button"
        aria-expanded="false" aria-controls="navbar-links">Menu</button>
      <ul class="navbar-links" id="navbar-links">${linksHtml}</ul>
    </nav>`;

  setupMenu(container);
}

// Open and close the menu with the button (used on phones).
function setupMenu(container) {
  const button = container.querySelector(".navbar-toggle");
  const links = container.querySelector(".navbar-links");

  button.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  // Pressing Escape closes the menu.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && links.classList.contains("is-open")) {
      links.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });
}