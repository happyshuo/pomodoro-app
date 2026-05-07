# Pomodoro Timer / 番茄钟

A minimalist Pomodoro timer desktop app for macOS built with Electron.
一款简约的 macOS 番茄钟桌面应用，基于 Electron 构建。

---

## Features / 功能

- **Pomodoro Timer / 番茄钟计时** — 25 min focus / 5 min short break / 15 min long break cycles (25 分钟专注 / 5 分钟短休息 / 15 分钟长休息)
- **Task Management / 任务管理** — add, complete, and delete tasks with per-task pomodoro counts (添加、完成、删除任务，每个任务累计番茄数)
- **Daily Statistics / 每日统计** — pomodoros completed, tasks done, and total focus minutes (今日番茄数、完成任务数、专注分钟数)
- **Session History / 历史记录** — review recent work and break sessions (查看最近专注和休息记录)
- **Notification Support / 通知提醒** — macOS native notifications when sessions complete (专注和休息结束时系统通知)
- **Dark Mode / 深色模式** — automatically adapts to macOS appearance settings (自动适配 macOS 深色/浅色模式)
- **Self-correcting Timer / 自校正计时** — accurate timing even when the window is in the background (窗口后台运行时仍保持精准)
- **Trend Chart / 趋势图表** — view pomodoro completion trends by day (hourly), week (daily), or month (daily) with SVG line chart (按日/周/月查看番茄完成趋势，SVG 折线图展示)

## Getting Started / 快速开始

```bash
git clone git@github.com:happyshuo/pomodoro-app.git
cd pomodoro-app
npm install
npm start
```

Or launch directly from **Desktop** (no terminal needed after setup):

```bash
# Run once from the project directory after npm install
osacompile -o ~/Desktop/Pomodoro.app \
  -e 'do shell script "cd /PATH/TO/pomodoro-app && exec ./node_modules/.bin/electron . > /dev/null 2>&1 &"'
```

Replace `/PATH/TO/pomodoro-app` with your actual project path, then double-click `Pomodoro.app` to start. (First time: right-click → Open to bypass Gatekeeper.)

## Usage / 使用说明

1. Add tasks in the **待办** tab / 在「待办」标签页中添加任务
2. Select a task from the dropdown / 从下拉列表中选择当前任务
3. Click **开始** to start the focus timer / 点击「开始」启动专注计时
4. When the timer ends, a break session starts automatically / 计时结束后自动进入休息
5. Check the **统计** tab for daily progress / 在「统计」标签页查看每日进度
6. Check the **图表** tab for trend charts by day, week, or month / 在「图表」标签页按日/周/月查看趋势

## Project Structure / 项目结构

```
pomodoro-app/
├── main.js              # Electron main process / 主进程
├── preload.js           # IPC bridge / 安全桥接
├── src/
│   ├── index.html       # UI structure / 界面结构
│   ├── styles.css       # Styling / 样式 (dark mode support)
│   └── renderer.js      # Frontend logic / 前端逻辑
└── package.json
```

## Tech Stack / 技术栈

- [Electron](https://www.electronjs.org/) — desktop application framework / 桌面应用框架
- Vanilla JavaScript, HTML, CSS — no frontend framework overhead / 无前端框架依赖
- SVG — circular progress ring animation / 环形进度动画

## License / 许可

MIT
