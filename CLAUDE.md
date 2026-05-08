# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Run app**: `npm start` or `npm run dev`
- **Create Desktop launcher**: `osacompile -o ~/Desktop/Pomodoro.app -e 'do shell script "cd /PATH/TO/pomodoro-app && exec ./node_modules/.bin/electron . > /dev/null 2>&1 &"'` (run once from project dir)

## Architecture

Electron app with 3 processes communicating via IPC:

### Main process (`main.js`)
- Creates `BrowserWindow` (480×680, `hiddenInset` title bar, `contextIsolation: true`)
- Persists data as JSON via `fs` to `app.getPath('userData')/pomodoro-data.json`
- IPC handlers: `data:load`, `data:save`, `notification:show`
- Uses an in-memory `dataCache` until the renderer saves (which clears cache)

### Preload bridge (`preload.js`)
- Exposes `window.pomodoroAPI` via `contextBridge` with `loadData()`, `saveData()`, `showNotification()`

### Renderer process (`src/renderer.js`)
- All UI logic in vanilla JS (no framework). HTML/CSS in `src/`.
- **Timer**: Self-correcting pattern — recursive `setTimeout` recalculates elapsed time from `Date.now()` at each tick, so it stays accurate even when the event loop is delayed or the window is backgrounded.
- **Phase cycle**: WORK (25min) → SHORT_BREAK (5min) or LONG_BREAK (15min every 4th pomodoro) → WORK
- **Data**: Sessions array with `{date, type, taskId, endTime, duration}` appended on timer completion
- **Chart** (`renderChart()`): Pure SVG line chart with area fill, grid lines, data point dots, and summary stats (total/avg/peak). Three views: day (hourly), week (daily), month (30-day).

### Data model (`pomodoro-data.json`)
```json
{
  "settings": { "workDuration": 1500, "shortBreakDuration": 300, "longBreakDuration": 900, "longBreakInterval": 4, "dailyGoal": 8 },
  "tasks": [{ "id": "uuid", "text": "...", "completed": false, "pomodoros": 0, "createdAt": 123 }],
  "sessions": [{ "date": "2026-05-08", "type": "work", "taskId": "uuid|null", "endTime": 123, "duration": 1500 }]
}
```

### Styling (`src/styles.css`)
- CSS custom properties for theming (`--bg`, `--surface`, `--text`, `--primary`, `--border`, etc.)
- Dark mode via `@media (prefers-color-scheme: dark)` overriding the custom properties
- No build step — raw CSS loaded directly by Electron

## Key patterns
- No build tooling or framework — edit files directly, refresh to see changes
- SVG viewBox `0 0 200 200` for timer ring (circumference 553, dashoffset animation)
- `tabBtns` + `panels` pattern for tab switching; stats and chart re-render on tab activation
