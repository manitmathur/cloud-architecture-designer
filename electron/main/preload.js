const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getArchitectures: () => ipcRenderer.invoke('get-architectures'),
    createArchitecture: (name) => ipcRenderer.invoke('create-architecture', name),
    // Add more methods as needed for your application
  }
);