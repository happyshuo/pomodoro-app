const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(app.getPath('userData'), 'pomodoro-data.json');

let dataCache = null;

function loadData() {
  if (dataCache) return dataCache;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    dataCache = JSON.parse(raw);
    return dataCache;
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return getDefaultData();
}

function getDefaultData() {
  return {
    settings: {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      longBreakInterval: 4,
      dailyGoal: 8,
    },
    tasks: [],
    sessions: [],
  };
}

function saveData(data) {
  dataCache = data;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 480,
    height: 680,
    minWidth: 380,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    title: 'Pomodoro',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- IPC Handlers ---

ipcMain.handle('data:load', () => loadData());

ipcMain.handle('data:save', (_e, data) => {
  saveData(data);
  return true;
});

ipcMain.handle('notification:show', (_e, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
