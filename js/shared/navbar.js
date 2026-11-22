/* ==========================================================================
   StudentHub - navbar.js
   Owner: Zenamarkos
   Purpose: Builds the navigation on every page:
            - Desktop/tablet: a sidebar that can collapse to icons only.
            - Phone: a bottom tab bar plus a slide-in drawer (the sidebar).
            Covers FR-NAV-01 (same navbar everywhere), FR-NAV-02 (links work
            from the root and from /pages), FR-NAV-03 (current page marked),
            FR-NAV-04 (phone menu opens and closes).

   HOW TO USE (every page)
     HTML: <aside class="sidebar" id="navbar"></aside>
           as the first child of <div class="app-shell">
     JS:   import { renderNavbar } from "./shared/navbar.js";
           renderNavbar();   // call once, when the page script starts
   If the element is missing, renderNavbar creates it by itself.

   HOW TO OPEN THE PHONE DRAWER FROM ANOTHER PLACE
     Put the attribute data-nav-toggle on any button (for example the
     hamburger in the top bar). No extra JavaScript is needed.

   HOW LINKS GET THEIR PREFIX
     Address contains /pages/ -> prefix "../"   Otherwise -> prefix "./"

   HOW TO ADD A NEW PAGE
     Add one line to NAV_LINKS. Use tab: true to show it in the phone bar.

   STORAGE
     The only thing saved is whether the desktop sidebar is collapsed.
     It goes through storage.js (never localStorage directly), under the
     key STORAGE_KEYS.SIDEBAR from constants.js, as ONE record:
     { id, collapsed }.

   Rules: never use localStorage directly, no console.log.
   ========================================================================== */

import { getAll, add, update } from "./storage.js";
import { STORAGE_KEYS } from "./constants.js";

// The pages. "folder" is where the file lives, "short" is the phone label.
const NAV_LINKS = [
  { label: "Dashboard", short: "Dashboard", file: "index.html", folder: "", icon: "dashboard", tab: true },
  { label: "My Tasks", short: "Tasks", file: "tasks.html", folder: "pages/", icon: "tasks", tab: true },
  { label: "My Courses", short: "Courses", file: "courses.html", folder: "pages/", icon: "courses", tab: true },
  { label: "Study Planner", short: "Planner", file: "planner.html", folder: "pages/", icon: "planner", tab: true },
  { label: "Focus Timer", short: "Timer", file: "timer.html", folder: "pages/", icon: "timer" },
  { label: "Progress", short: "Progress", file: "progress.html", folder: "pages/", icon: "progress" },
  // In the design, but no page exists yet. Uncomment when the page is added:
  // { label: "Learning Resources", short: "Resources", file: "resources.html", folder: "pages/", icon: "resources" },
  // { label: "Profile", short: "Profile", file: "profile.html", folder: "pages/", icon: "profile" },
];

// Placeholder for the user card at the bottom of the sidebar (from the design).
const USER_CARD = { initials: "AM", name: "Alex Morgan", role: "Student account" };

// Same number as the tablet breakpoint in responsive.css
const DESKTOP_QUERY = "(min-width: 768px)";

// If the key is missing from constants.js, nothing is saved and the
// sidebar simply starts expanded.
const SIDEBAR_KEY = STORAGE_KEYS.SIDEBAR;

// Simple line icons (24x24). Decorative only, so no library is needed.
const ICONS = {
  dashboard: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  tasks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  courses: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  planner: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  progress: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  resources: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  profile: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  logo: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
};

function icon(name) {
  return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

// ---- Saved sidebar choice (through storage.js) ---------------------------

function loadCollapsed() {
  if (!SIDEBAR_KEY) {
    return false;
  }
  const [record] = getAll(SIDEBAR_KEY);
  return record ? record.collapsed === true : false;
}

function saveCollapsed(isCollapsed) {
  if (!SIDEBAR_KEY) {
    return;
  }
  const [record] = getAll(SIDEBAR_KEY);
  if (record) {
    update(SIDEBAR_KEY, record.id, { collapsed: isCollapsed });
  } else {
    add(SIDEBAR_KEY, { collapsed: isCollapsed });
  }
}

// ---- Build the navigation ------------------------------------------------

export function renderNavbar(containerId = "navbar") {
  // 1. Find the place for the sidebar. Create it if the page forgot it.
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("aside");
    container.id = containerId;
    const shell = document.querySelector(".app-shell");
    (shell || document.body).prepend(container);
  }
  container.classList.add("sidebar");

  // Calling it twice must not build two menus or two sets of listeners.
  if (container.dataset.navbarReady === "true") {
    return;
  }
  container.dataset.navbarReady = "true";

  // 2. Work out the prefix and the current file name.
  const inPages = window.location.pathname.includes("/pages/");
  const prefix = inPages ? "../" : "./";
  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  const isActive = (link) => link.file === currentFile;
  const hrefOf = (link) => `${prefix}${link.folder}${link.file}`;
  const currentAttr = (link) => (isActive(link) ? ' aria-current="page"' : "");

  // 3. Sidebar links (desktop sidebar and phone drawer).
  const sidebarLinks = NAV_LINKS.map((link) => {
    const activeClass = isActive(link) ? " active" : "";
    return `<li><a class="sidebar-link${activeClass}" href="${hrefOf(link)}" title="${link.label}"${currentAttr(link)}>${icon(link.icon)}<span class="sidebar-label">${link.label}</span></a></li>`;
  }).join("");

  // 4. Phone bottom bar: the links marked tab: true, then a More button.
  const tabLinks = NAV_LINKS.filter((link) => link.tab).map((link) => {
    const activeClass = isActive(link) ? " active" : "";
    return `<li><a class="bottom-link${activeClass}" href="${hrefOf(link)}"${currentAttr(link)}>${icon(link.icon)}<span>${link.short}</span></a></li>`;
  }).join("");

  // 5. Put the sidebar on the page. All text comes from the lists above,
  //    never from the user, so innerHTML is safe here.
  container.innerHTML = `
    <div class="sidebar-header">
      <a class="sidebar-brand" href="${prefix}index.html" title="StudentHub">
        <span class="sidebar-logo">${icon("logo")}</span>
        <span class="sidebar-brand-text sidebar-label">StudentHub</span>
      </a>
      <button class="sidebar-collapse" type="button" aria-expanded="true" aria-label="Collapse sidebar">${icon("menu")}</button>
    </div>
    <nav class="sidebar-nav" aria-label="Main">
      <p class="sidebar-section sidebar-label">Workspace</p>
      <ul class="sidebar-links">${sidebarLinks}</ul>
    </nav>
    <div class="sidebar-user">
      <span class="sidebar-avatar">${USER_CARD.initials}</span>
      <span class="sidebar-user-text sidebar-label">
        <span class="sidebar-user-name">${USER_CARD.name}</span>
        <span class="sidebar-user-role">${USER_CARD.role}</span>
      </span>
    </div>`;

  // 6. The phone bottom bar and the dark backdrop sit outside the sidebar,
  //    directly in <body>, so the sidebar's slide animation cannot move them.
  const bottomNav = document.createElement("nav");
  bottomNav.className = "bottom-nav";
  bottomNav.setAttribute("aria-label", "Quick links");
  bottomNav.innerHTML = `<ul class="bottom-nav-list">${tabLinks}<li><button class="bottom-link" type="button" data-nav-toggle aria-expanded="false" aria-controls="${containerId}">${icon("more")}<span>More</span></button></li></ul>`;

  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  backdrop.hidden = true;

  document.body.append(bottomNav, backdrop);

  setupBehaviour(container, backdrop);
}

// ---- Behaviour: collapse (desktop) and drawer (phone) ---------------------

function setupBehaviour(container, backdrop) {
  const shell = container.closest(".app-shell") || container;
  const collapseButton = container.querySelector(".sidebar-collapse");
  let lastToggle = null; // the button that opened the drawer

  // Desktop: collapse to icons / expand again. The class goes on .app-shell
  // so responsive.css can shrink the first grid column.
  function setCollapsed(isCollapsed, shouldSave = true) {
    shell.classList.toggle("is-collapsed", isCollapsed);
    collapseButton.setAttribute("aria-expanded", String(!isCollapsed));
    collapseButton.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
    );
    if (shouldSave) {
      saveCollapsed(isCollapsed);
    }
  }

  // Phone: open/close the drawer and keep everything in sync.
  function setDrawerOpen(isOpen) {
    container.classList.toggle("is-open", isOpen);
    backdrop.hidden = !isOpen;
    document.body.classList.toggle("no-scroll", isOpen); // class from main.css
    document.querySelectorAll("[data-nav-toggle]").forEach((button) => {
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  collapseButton.addEventListener("click", () => {
    setCollapsed(!shell.classList.contains("is-collapsed"));
  });

  // Restore the saved choice when the page opens (nothing to save yet).
  setCollapsed(loadCollapsed(), false);

  // Any element with data-nav-toggle (More button, top-bar hamburger).
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-nav-toggle]");
    if (toggle) {
      lastToggle = toggle;
      setDrawerOpen(!container.classList.contains("is-open"));
    }
  });

  // Tapping the backdrop or a drawer link closes the drawer.
  backdrop.addEventListener("click", () => setDrawerOpen(false));
  container.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setDrawerOpen(false);
    }
  });

  // Escape closes the drawer and returns focus to the button that opened it.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && container.classList.contains("is-open")) {
      setDrawerOpen(false);
      if (lastToggle) {
        lastToggle.focus();
      }
    }
  });

  // Growing to tablet/desktop width closes the drawer, so the page never
  // stays locked from scrolling.
  window.matchMedia(DESKTOP_QUERY).addEventListener("change", (event) => {
    if (event.matches) {
      setDrawerOpen(false);
    }
  });

  // Coming back with the browser Back button must not show an open drawer.
  window.addEventListener("pageshow", () => setDrawerOpen(false));
}