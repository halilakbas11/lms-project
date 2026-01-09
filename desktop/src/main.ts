/**
 * LMS Desktop Application - Main Process
 * PDF Madde 6: Masaüstü Uygulama (Electron)
 * 
 * Features:
 * - Windows 10/11 support (x64, ARM64)
 * - macOS 11+ support (Intel, Apple Silicon)
 * - Auto-updater
 * - System tray
 * - Native file system access
 * - Offline sync
 * - Webcam/Microphone for proctoring
 */

import { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell, session, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

// Initialize electron-store for local data persistence
const store = new Store({
    name: 'lms-desktop-config',
    defaults: {
        windowBounds: { width: 1400, height: 900 },
        serverUrl: 'https://lms-project-kvta8qq9l-emilias-projects-3e4f0b81.vercel.app',
        apiUrl: 'https://lms-project-production-0d23.up.railway.app',
        downloadPath: app.getPath('downloads'),
        offlineMode: false,
        lastSync: null
    }
});

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Development mode check
const isDev = !app.isPackaged;

/**
 * Create the main application window
 */
function createMainWindow(): void {
    const windowBounds = store.get('windowBounds') as { width: number; height: number };

    mainWindow = new BrowserWindow({
        width: windowBounds.width,
        height: windowBounds.height,
        minWidth: 1024,
        minHeight: 768,
        title: 'LMS Desktop',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            webviewTag: false
        },
        backgroundColor: '#0f172a',
        show: false,
        autoHideMenuBar: true
    });

    // Load the web frontend - always use remote URL (Vercel)
    const serverUrl = store.get('serverUrl') as string;
    mainWindow.loadURL(serverUrl);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        if (!isDev) {
            autoUpdater.checkForUpdatesAndNotify();
        }
    });

    // Save window bounds on resize
    mainWindow.on('resize', () => {
        if (mainWindow && !mainWindow.isMaximized()) {
            const bounds = mainWindow.getBounds();
            store.set('windowBounds', { width: bounds.width, height: bounds.height });
        }
    });

    // Handle close to tray
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Handle permissions (webcam, microphone)
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['media', 'mediaKeySystem', 'notifications'];
        callback(allowedPermissions.includes(permission));
    });
}

/**
 * Create system tray with menu (only if icon exists)
 */
function createTray(): void {
    const iconPath = path.join(__dirname, '../assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png');

    // Skip tray if icon doesn't exist (development mode without icons)
    if (!fs.existsSync(iconPath)) {
        console.log('⚠️ Tray icon not found at:', iconPath);
        console.log('   Skipping tray creation. Add icon.ico to assets/ folder for tray support.');
        return;
    }

    try {
        tray = new Tray(iconPath);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: '📚 Dashboard',
                click: () => {
                    mainWindow?.show();
                    mainWindow?.webContents.send('navigate', '/dashboard');
                }
            },
            {
                label: '📖 Derslerim',
                click: () => {
                    mainWindow?.show();
                    mainWindow?.webContents.send('navigate', '/dashboard/student/courses');
                }
            },
            {
                label: '📝 Sınavlarım',
                click: () => {
                    mainWindow?.show();
                    mainWindow?.webContents.send('navigate', '/dashboard/student/exams');
                }
            },
            { type: 'separator' },
            {
                label: '🔄 Güncelleme Kontrol Et',
                click: () => {
                    autoUpdater.checkForUpdatesAndNotify();
                }
            },
            {
                label: '📥 İndirilenler',
                click: () => {
                    const downloadPath = store.get('downloadPath') as string;
                    shell.openPath(downloadPath);
                }
            },
            { type: 'separator' },
            {
                label: '⚙️ Ayarlar',
                click: () => {
                    mainWindow?.show();
                    mainWindow?.webContents.send('navigate', '/settings');
                }
            },
            {
                label: '❌ Çıkış',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('LMS Desktop');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            if (mainWindow) {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            }
        });

        tray.on('double-click', () => {
            mainWindow?.show();
        });
    } catch (error) {
        console.error('❌ Failed to create tray:', error);
    }
}

/**
 * Setup auto-updater
 */
function setupAutoUpdater(): void {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        console.log('🔍 Güncelleme kontrol ediliyor...');
        mainWindow?.webContents.send('update-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
        console.log('📥 Güncelleme mevcut:', info.version);
        mainWindow?.webContents.send('update-status', { status: 'available', version: info.version });
    });

    autoUpdater.on('update-not-available', () => {
        console.log('✅ En güncel sürüm kullanılıyor.');
        mainWindow?.webContents.send('update-status', { status: 'not-available' });
    });

    autoUpdater.on('download-progress', (progress) => {
        mainWindow?.webContents.send('update-status', {
            status: 'downloading',
            percent: progress.percent.toFixed(1)
        });
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('✅ Güncelleme indirildi. Yeniden başlatma gerekiyor.');
        mainWindow?.webContents.send('update-status', { status: 'downloaded' });

        dialog.showMessageBox({
            type: 'info',
            title: 'Güncelleme Hazır',
            message: 'Yeni sürüm indirildi. Uygulamayı yeniden başlatmak ister misiniz?',
            buttons: ['Şimdi Yeniden Başlat', 'Sonra']
        }).then(({ response }) => {
            if (response === 0) {
                isQuitting = true;
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (error) => {
        console.error('❌ Güncelleme hatası:', error);
        mainWindow?.webContents.send('update-status', { status: 'error', message: error.message });
    });
}

/**
 * Register IPC handlers for renderer communication
 */
function registerIPCHandlers(): void {
    // Download file
    ipcMain.handle('download-file', async (event, { url, filename }) => {
        try {
            const downloadPath = store.get('downloadPath') as string;
            const filePath = path.join(downloadPath, filename);

            const result = await dialog.showSaveDialog({
                defaultPath: filePath,
                title: 'Dosyayı Kaydet'
            });

            if (!result.canceled && result.filePath) {
                mainWindow?.webContents.downloadURL(url);
                return { success: true, path: result.filePath };
            }
            return { success: false, canceled: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    // Get app info
    ipcMain.handle('get-app-info', () => {
        return {
            version: app.getVersion(),
            platform: process.platform,
            arch: process.arch,
            electron: process.versions.electron,
            node: process.versions.node,
            downloadPath: store.get('downloadPath'),
            isPackaged: app.isPackaged
        };
    });

    // Update settings
    ipcMain.handle('update-settings', (event, settings) => {
        Object.entries(settings).forEach(([key, value]) => {
            store.set(key, value);
        });
        return { success: true };
    });

    // Get settings
    ipcMain.handle('get-settings', () => {
        return store.store;
    });

    // Show notification
    ipcMain.handle('show-notification', (event, { title, body }) => {
        const { Notification } = require('electron');
        new Notification({ title, body }).show();
        return { success: true };
    });

    // Open external link
    ipcMain.handle('open-external', (event, url) => {
        shell.openExternal(url);
        return { success: true };
    });

    // Check for updates
    ipcMain.handle('check-for-updates', () => {
        if (!isDev) {
            autoUpdater.checkForUpdatesAndNotify();
        }
        return { success: true };
    });

    // Open download folder
    ipcMain.handle('open-download-folder', () => {
        const downloadPath = store.get('downloadPath') as string;
        shell.openPath(downloadPath);
        return { success: true };
    });

    // Exit SEB mode - called when exam ends to close the secure browser
    ipcMain.handle('exit-seb-mode', (event, { reason }) => {
        console.log(`🔓 Exiting SEB mode: ${reason}`);

        // Exit kiosk mode if active
        if (mainWindow?.isKiosk()) {
            mainWindow.setKiosk(false);
        }

        // Re-enable window controls
        if (mainWindow) {
            mainWindow.setClosable(true);
            mainWindow.setMinimizable(true);
            mainWindow.setMaximizable(true);
            mainWindow.setFullScreenable(true);
        }

        // Show notification to user
        const { Notification } = require('electron');
        new Notification({
            title: '✅ Sınav Tamamlandı',
            body: 'Sınav başarıyla gönderildi. Güvenli mod kapatılıyor...'
        }).show();

        // Close the app after a short delay to let user see the notification
        setTimeout(() => {
            isQuitting = true;
            app.quit();
        }, 2000);

        return { success: true };
    });

    // Select download folder
    ipcMain.handle('select-download-folder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'İndirme Klasörünü Seç'
        });

        if (!result.canceled && result.filePaths.length > 0) {
            store.set('downloadPath', result.filePaths[0]);
            return { success: true, path: result.filePaths[0] };
        }
        return { success: false, canceled: true };
    });
}

/**
 * App lifecycle events
 */
app.whenReady().then(() => {
    createMainWindow();
    createTray();
    setupAutoUpdater();
    registerIPCHandlers();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        } else {
            mainWindow?.show();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

// Handle deep links (for SEB integration)
app.setAsDefaultProtocolClient('lms');

app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
        mainWindow.show();
        const navPath = url.replace('lms://', '/');
        mainWindow.webContents.send('navigate', navPath);
    }
});

// Security: Disable navigation to external URLs
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        const allowedHosts = ['localhost', '127.0.0.1', 'lms-project-kvta8qq9l-emilias-projects-3e4f0b81.vercel.app', 'lms-project-production-0d23.up.railway.app'];

        if (!allowedHosts.includes(parsedUrl.hostname)) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
});

// Log app startup
console.log(`
╔════════════════════════════════════════╗
║       LMS Desktop Application          ║
║       Version: ${app.getVersion().padEnd(23)}║
║       Platform: ${process.platform.padEnd(22)}║
║       Arch: ${process.arch.padEnd(26)}║
╚════════════════════════════════════════╝
`);
