'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Electron API Hook
 * Provides access to Electron-specific features when running in desktop app
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

interface ElectronAPI {
    getAppInfo: () => Promise<AppInfo>;
    getSettings: () => Promise<Record<string, unknown>>;
    updateSettings: (settings: Record<string, unknown>) => Promise<{ success: boolean }>;
    downloadFile: (url: string, filename: string) => Promise<{ success: boolean; path?: string }>;
    openDownloadFolder: () => Promise<{ success: boolean }>;
    selectDownloadFolder: () => Promise<{ success: boolean; path?: string }>;
    checkForUpdates: () => Promise<{ success: boolean }>;
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => void;
    onNavigate: (callback: (path: string) => void) => void;
    openExternal: (url: string) => Promise<{ success: boolean }>;
    showNotification: (title: string, body: string) => Promise<{ success: boolean }>;
    platform: string;
    isElectron: boolean;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

export function useElectron() {
    const [isElectron, setIsElectron] = useState(false);
    const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if running in Electron
        const electronApi = window.electronAPI;
        if (electronApi?.isElectron) {
            setIsElectron(true);

            // Get app info
            electronApi.getAppInfo().then(setAppInfo);

            // Listen for update status
            electronApi.onUpdateStatus(setUpdateStatus);

            // Listen for navigation from tray menu
            electronApi.onNavigate((path: string) => {
                router.push(path);
            });
        }
    }, [router]);

    const downloadFile = useCallback(async (url: string, filename: string) => {
        if (window.electronAPI) {
            return window.electronAPI.downloadFile(url, filename);
        }
        // Fallback: browser download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        return { success: true };
    }, []);

    const openExternal = useCallback(async (url: string) => {
        if (window.electronAPI) {
            return window.electronAPI.openExternal(url);
        }
        window.open(url, '_blank');
        return { success: true };
    }, []);

    const showNotification = useCallback(async (title: string, body: string) => {
        if (window.electronAPI) {
            return window.electronAPI.showNotification(title, body);
        }
        // Fallback: browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
        return { success: true };
    }, []);

    const checkForUpdates = useCallback(async () => {
        if (window.electronAPI) {
            return window.electronAPI.checkForUpdates();
        }
        return { success: false };
    }, []);

    const openDownloadFolder = useCallback(async () => {
        if (window.electronAPI) {
            return window.electronAPI.openDownloadFolder();
        }
        return { success: false };
    }, []);

    const getSettings = useCallback(async () => {
        if (window.electronAPI) {
            return window.electronAPI.getSettings();
        }
        return null;
    }, []);

    const updateSettings = useCallback(async (settings: Record<string, unknown>) => {
        if (window.electronAPI) {
            return window.electronAPI.updateSettings(settings);
        }
        return { success: false };
    }, []);

    return {
        isElectron,
        appInfo,
        updateStatus,
        downloadFile,
        openExternal,
        showNotification,
        checkForUpdates,
        openDownloadFolder,
        getSettings,
        updateSettings,
        platform: appInfo?.platform || 'web'
    };
}

export default useElectron;
