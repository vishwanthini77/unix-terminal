# Unix for the Rest of Us

A browser-based interactive Unix terminal learning platform designed for non-technical professionals — product managers, delivery managers, and anyone who works alongside engineers and wants to understand Unix fundamentals.

**No setup required.** Everything runs in the browser. No installations, no accounts, no complexity.

## Features

- **Simulated Unix Terminal** — A fully interactive terminal powered by [xterm.js](https://xtermjs.org/) with 25+ commands
- **5 Structured Lessons** — Progressive curriculum from basic navigation to system administration
- **Persistent Progress** — File system changes, command history, current lesson, theme, and working directory are saved to localStorage and survive page refreshes
- **Dark / Light Theme** — Toggle between themes; preference is persisted
- **Mobile Responsive** — Tabbed layout on screens ≤ 768px to switch between Lesson and Terminal views
- **Feedback System** — Built-in feedback modal powered by [Formspree](https://formspree.io/)
- **Reset** — Reset all progress via the UI button or the `reset` terminal command

## Supported Commands

| Category | Commands |
|----------|----------|
| **Navigation** | `pwd`, `ls`, `cd`, `tree` |
| **File Operations** | `cat`, `head`, `tail`, `less`, `touch`, `mkdir`, `rm`, `cp`, `mv` |
| **Search & Text** | `grep`, `find`, `wc`, `echo` |
| **System Info** | `whoami`, `ps`, `kill`, `df`, `du`, `uname`, `uptime` |
| **Permissions** | `chmod`, `chown` |
| **Utilities** | `date`, `history`, `clear`, `reset`, `help`, `lesson` |

## Lessons

| # | Topic |
|---|-------|
| 0 | Overview — What this course is and who it's for |
| 1 | Navigation & File System Basics (`pwd`, `ls`, `cd`, `tree`) |
| 2 | File Operations (`cat`, `head`, `tail`, `touch`, `mkdir`, `rm`, `cp`, `mv`) |
| 3 | Search & Text Processing (`grep`, `find`, `wc`, `echo`) |
| 4 | Permissions & System Info (`chmod`, `chown`, `ps`, `df`, `du`) |
| 5 | Putting It All Together — Real-world scenarios and combined workflows |

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **xterm.js 5** — Terminal emulator with FitAddon for responsive sizing
- **react-markdown** + **remark-gfm** — Markdown rendering for lesson content
- **@formspree/react** — Feedback form submission
- **localStorage** — Client-side persistence (no backend required)

## Project Structure

```
src/
  App.jsx                  # Root component
  main.jsx                 # Entry point
  index.css                # Global styles
  fileSystem.js            # Simulated Unix file system with persistence
  commands.js              # Command registry and implementations (25+ commands)
  storage.js               # localStorage persistence utility
  components/
    SplitLayout.jsx        # Main layout: lesson panel + terminal panel
    SplitLayout.css        # Layout styles, themes, mobile responsive
    Terminal.jsx            # xterm.js terminal wrapper
  lessons/
    lesson0.md            # Overview
    lesson1.md            # Lesson 1: Navigation
    lesson2.md            # Lesson 2: File Operations
    lesson3.md            # Lesson 3: Search & Text
    lesson4.md            # Lesson 4: Permissions & System
    lesson5.md            # Lesson 5: Putting It All Together
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Versioning

The app version is defined in `package.json` (`"version"`) and displayed in the top navigation bar. Vite injects it at build time via the `__APP_VERSION__` global defined in `vite.config.js`.

To update the version:

1. Change `"version"` in `package.json`
2. Rebuild — the UI will reflect the new version automatically

## Persistence

All user progress is stored in localStorage under the `unix-terminal:` namespace:

| Key | What it stores |
|-----|---------------|
| `unix-terminal:fileSystem` | Full file system tree (files/folders created by the user) |
| `unix-terminal:currentPath` | Current working directory |
| `unix-terminal:currentSession` | Active lesson number (0-5) |
| `unix-terminal:theme` | Dark or light theme preference |
| `unix-terminal:commandHistory` | Command history (capped at 500) |

Use the **Reset Session** button or run `reset` in the terminal to clear all saved data.

## License

MIT
