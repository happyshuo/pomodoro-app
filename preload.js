const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pomodoroAPI', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (data) => ipcRenderer.invoke('data:save', data),
  showNotification: (opts) => ipcRenderer.invoke('notification:show', opts),
});
