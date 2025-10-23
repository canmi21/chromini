# Chromini

![Chromini Home Page](https://raw.githubusercontent.com/canmi21/chromini/main/img/chromini-home-page.png)

### Code. Preview. Immerse.

Chromini is a minimalist, developer-focused browser built with Electron and React. It's designed from the ground up for an immersive, keyboard-driven workflow, eliminating the distractions of a traditional browser to keep you focused on what matters: your local development.

<p align="center">
  <a href="https://github.com/canmi21/chromini/actions/workflows/build.yml"><img alt="Build & Release" src="https://github.com/canmi21/chromini/actions/workflows/build.yml/badge.svg"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
  <a href="https://github.com/canmi21/chromini"><img alt="GitHub stars" src="https://img.shields.io/github/stars/canmi21/chromini.svg?style=social"></a>
  <a href="https://github.com/canmi21/chromini"><img alt="GitHub forks" src="https://img.shields.io/github/forks/canmi21/chromini.svg?style=social"></a>
  <a href="https://github.com/canmi21/chromini/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/canmi21/chromini.svg"></a>
  <a href="https://github.com/canmi21/chromini/commits/main"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/canmi21/chromini.svg"></a>
  <a href="https://github.com/canmi21/chromini"><img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/canmi21/chromini.svg"></a>
</p>

---

## Core Features

Chromini is built around a unique set of features tailored for developers who need to iterate quickly and stay in the zone.

### Keyboard-First Navigation
Navigate through all your open tabs and windows using simple function keys. No mouse required.

### Minimalist, Distraction-Free UI
The interface is designed to disappear, providing an immersive, content-first experience perfect for previewing front-end applications.

![Demo Site Figma](https://raw.githubusercontent.com/canmi21/chromini/main/img/demo-site-figma.png)

![NextJS Demo Innei](https://raw.githubusercontent.com/canmi21/chromini/main/img/nextjs-demo-innei.png)

### Multi-Window Support with a Shared Tab Timeline
Open multiple windows, but manage your tabs from a single, global timeline. F2/F3 will cycle through all open tabs, automatically focusing the correct window.

![Multi-Window Support](https://raw.githubusercontent.com/canmi21/chromini/main/img/muti-window.png)

### Persistent History & Session
Chromini remembers your last-used window size and your 50 most recent tabs, making it easy to pick up right where you left off. All configuration is stored locally in `~/.chromini/`.

![Recent History Section](https://raw.githubusercontent.com/canmi21/chromini/main/img/recent-history-section.png)

### Powerful Developer Context Menus
The native right-click menu is packed with developer essentials, allowing you to move a tab to a new window, open links, and access developer tools instantly.

![Native Context Menu](https://raw.githubusercontent.com/canmi21/chromini/main/img/chromini-native-web-right-click-menu.png)

![Web Own Right-Click Menu](https://raw.githubusercontent.com/canmi21/chromini/main/img/web-own-right-click-menu.png)

![Home Page Right-Click](https://raw.githubusercontent.com/canmi21/chromini/main/img/home-page-right-click.png)

### Unrestricted Local Development
With `webSecurity` disabled, Chromini allows unrestricted `fetch` requests between different local ports (e.g., from your React app at `localhost:3000` to your API at `localhost:8000`), eliminating CORS headaches during development.

---

## Keyboard Shortcuts

Chromini is designed to be controlled primarily by the keyboard.

| Key                 | Action                       |
| ------------------- | ---------------------------- |
| `F1`                | Open a New Empty Window      |
| `F2`                | Switch to Previous Tab (Global) |
| `F3`                | Switch to Next Tab (Global)     |
| `F4`                | Close Current Tab            |
| `F5` / `Cmd+R`      | Reload Current Page          |
| `F11`               | Toggle Fullscreen            |
| `F12` / `Cmd+Shift+I` | Toggle Developer Tools       |
| `Cmd+[` / `Alt+Left`  | Navigate Back                |
| `Cmd+]` / `Alt+Right` | Navigate Forward             |
| `Cmd+N`             | Open a New Empty Window (Menu) |

---

## Getting Started

### Development

To run Chromini locally for development:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/canmi21/chromini.git
   cd chromini
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm electron:dev
   ```

### Building the Application

To build a distributable package for your current platform:

```bash
pnpm electron:build
```

The recommended way to build for all platforms (macOS, Windows, Linux) is to use the included GitHub Actions workflow by creating a new release on GitHub.

### Tech Stack
Chromini is built with modern, efficient technologies:

- Electron: For creating the cross-platform desktop application shell.
- React: For building the user interface.
- TypeScript: For robust, type-safe code.
- Vite: For lightning-fast front-end tooling and development.
- Tailwind CSS: For a utility-first CSS framework.

### License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/canmi21/chromini/blob/main/LICENSE) file for details.
