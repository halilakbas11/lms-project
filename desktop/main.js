/**
 * LMS Desktop Application
 * Loads the Vercel frontend in an Electron window
 */

const { app, BrowserWindow, shell } = require('electron');

const FRONTEND_URL = 'https://lms-project-zeta-one.vercel.app';

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: 'LMS Desktop',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#0f172a',
        autoHideMenuBar: true
    });

    mainWindow.loadURL(FRONTEND_URL);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log('LMS Desktop - Loading Vercel frontend...');
