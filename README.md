# StudentHub

A student productivity web app for managing tasks, courses, study sessions and focus time. Built with **vanilla HTML, CSS and JavaScript**. Data is stored in the browser using **localStorage** (no backend).

## Features

**Primary**
- **Dashboard** – overview of tasks, courses and study activity
- **Task Manager** – add, view, edit, complete and delete tasks
- **Course Manager** – add courses and view course details
- **Study Planner** – create and display planned study sessions
- **Navigation & Responsive Design** – works on desktop and mobile

**Secondary**
- **Focus Timer** – start, pause and reset
- **Progress Summary** – task completion and study progress charts

## Project Structure

```
Student-Hub/
├── index.html            # Dashboard
├── pages/
│   ├── tasks.html
│   ├── courses.html
│   ├── planner.html
│   ├── timer.html
│   └── progress.html
├── css/
│   ├── base/             # reset, variables
│   ├── shared/           # navbar, responsive, buttons, forms, cards
│   └── *.css             # one stylesheet per page
├── js/
│   ├── shared/           # navbar, storage, validators, constants
│   └── *.js              # one script per page
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## Getting Started

```bash
git clone https://github.com/mekilit21-jpg/Student-Hub.git
cd Student-Hub
```

Open the project in VS Code and run it with the **Live Server** extension. JavaScript modules do not work when you open the HTML files directly.

## Team Workflow

1. Never push directly to `main`.
2. Create your own branch for your feature:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit small and often with clear messages.
4. Push your branch and open a **Pull Request**. The Team Leader reviews and merges.
5. Pull the latest `main` before starting new work:
   ```bash
   git pull origin main
   ```

**Rules**
- Work only in your own feature's files (one HTML, one CSS, one JS) to avoid merge conflicts.
- Use the shared files (`storage.js`, `constants.js`) for localStorage. Do not create your own keys.
- Every page must include the viewport meta tag and load the shared navbar.

## Team

| # | Role | Member |
|---|------|--------|
| 1 | Frontend Team Leader & Integration | |
| 2 | UI/UX Designer (Figma) | |
| 3 | Dashboard Developer | |
| 4 | Task Manager Developer | |
| 5 | Course Manager Developer | |
| 6 | Study Planner Developer | |
| 7 | Focus Timer Developer | |
| 8 | Progress Summary Developer | |
| 9 | Navigation & Responsive Design | |
| 10 | Data Management, Validation & QA | |
