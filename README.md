# Pomodoro Timer

A minimalist Pomodoro timer desktop app for macOS built with Electron.

## Features

- **Pomodoro Timer** — 25 min focus / 5 min short break / 15 min long break cycles
- **Task Management** — add, complete, and delete tasks with per-task pomodoro counts
- **Daily Statistics** — pomodoros completed, tasks done, and total focus minutes
- **Session History** — review recent work and break sessions
- **Notification Support** — macOS native notifications when sessions complete
- **Dark Mode** — automatically adapts to macOS appearance settings
- **Self-correcting Timer** — accurate timing even when the window is in the background

## Getting Started

```bash
git clone git@github.com:happyshuo/pomodoro-app.git
cd pomodoro-app
npm install
npm start
```

## Usage

1. Add tasks in the **待办** tab
2. Select a task from the dropdown
3. Click **开始** to start the focus timer
4. When the timer ends, a break session starts automatically
5. Check your **统计** tab for daily progress

## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop application framework
- Vanilla JavaScript, HTML, CSS — no frontend framework overhead
- SVG — circular progress ring animation

## License

MIT
