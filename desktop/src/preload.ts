/**
 * LMS Desktop Application - Preload Script
 * Secure bridge between renderer and main process
 * 
 * Uses contextBridge to safely expose IPC APIs to the renderer
 */

import { contextBridge, ipcRenderer } from 'electron';

// Types for better TypeScript support
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

// Expose protected methods to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
    // ===== App Info =====
    getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke('get-app-info'),

    // ===== Settings =====
    getSettings: (): Promise<Record<string, unknown>> => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings: Record<string, unknown>): Promise<{ success: boolean }> =>
        ipcRenderer.invoke('update-settings', settings),

    // ===== File System =====
    downloadFile: (url: string, filename: string): Promise<DownloadResult> =>
        ipcRenderer.invoke('download-file', { url, filename }),
    openDownloadFolder: (): Promise<{ success: boolean }> =>
        ipcRenderer.invoke('open-download-folder'),
    selectDownloadFolder: (): Promise<{ success: boolean; path?: string; canceled?: boolean }> =>
        ipcRenderer.invoke('select-download-folder'),

    // ===== Updates =====
    checkForUpdates: (): Promise<{ success: boolean }> =>
        ipcRenderer.invoke('check-for-updates'),
    onUpdateStatus: (callback: (status: UpdateStatus) => void): void => {
        ipcRenderer.on('update-status', (_, status: UpdateStatus) => callback(status));
    },

    // ===== Navigation =====
    onNavigate: (callback: (path: string) => void): void => {
        ipcRenderer.on('navigate', (_, path: string) => callback(path));
    },

    // ===== External Links =====
    openExternal: (url: string): Promise<{ success: boolean }> =>
        ipcRenderer.invoke('open-external', url),

    // ===== Notifications =====
    showNotification: (title: string, body: string): Promise<{ success: boolean }> =>
        ipcRenderer.invoke('show-notification', { title, body }),

    // ===== SEB / Exam Mode =====
    exitSebMode: (reason: string): Promise<{ success: boolean }> =>
        ipcRenderer.invoke('exit-seb-mode', { reason }),

    // ===== Platform Info =====
    platform: process.platform,
    isElectron: true
});

// Log that preload script loaded successfully
console.log('✅ LMS Desktop preload script loaded');
