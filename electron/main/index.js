const { app, BrowserWindow } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const MongoDBService = require('../api/mongodb-service');

const mongoService = new MongoDBService(process.env.MONGODB_URI || 'mongodb+srv://balirammath2006:mnismm06@cloudarchitectdb.b2gkf.mongodb.net/?retryWrites=true&w=majority&appName=CloudArchitectDB');

// Setup IPC handlers
ipcMain.handle('get-architectures', async () => {
  try {
    return await mongoService.getArchitectures();
  } catch (error) {
    console.error('Error fetching architectures:', error);
    throw new Error('Failed to fetch architectures');
  }
});

ipcMain.handle('create-architecture', async (_, name) => {
  try {
    return await mongoService.createArchitecture(name);
  } catch (error) {
    console.error('Error creating architecture:', error);
    throw new Error('Failed to create architecture');
  }
});


const loadURL = serve({ directory: 'out' });

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  if (process.env.NODE_ENV === 'development') {
    // In development, load the app from the Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the exported 'out' directory
    loadURL(mainWindow);
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();
  
  // On macOS, re-create a window when dock icon is clicked
  app.on('activate', function () {
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});