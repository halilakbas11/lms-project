/**
 * TypeScript declarations for Electron API
 * These types are exposed via preload.ts contextBridge
 */

interface AppInfo {
    version: string;
    platform: string;
    arch: string;
    electron: string;
    node: string;
    downloadPath: string;
    isPackaged: boolean;
}

interface UpdateStatus {
    status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
    version?: string;
    percent?: string;
    message?: string;
}

interface DownloadResult {
    success: boolean;
    path?: string;
    canceled?: boolean;
    error?: string;
}

interface ElectronAPI {
    // App Info
    getAppInfo: () => Promise<AppInfo>;

    // Settings
    getSettings: () => Promise<Record<string, unknown>>;
    updateSettings: (settings: Record<string, unknown>) => Promise<{ success: boolean }>;

    // File System
    downloadFile: (url: string, filename: string) => Promise<DownloadResult>;
    openDownloadFolder: () => Promise<{ success: boolean }>;
    selectDownloadFolder: () => Promise<{ success: boolean; path?: string; canceled?: boolean }>;

    // Updates
    checkForUpdates: () => Promise<{ success: boolean }>;
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => void;

    // Navigation
    onNavigate: (callback: (path: string) => void) => void;

    // External Links
    openExternal: (url: string) => Promise<{ success: boolean }>;

    // Notifications
    showNotification: (title: string, body: string) => Promise<{ success: boolean }>;

    // Platform Info
    platform: string;
    isElectron: boolean;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

export { };
