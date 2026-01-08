/**
 * Download Manager
 * PDF Madde 6: İndirme Yöneticisi (0.8 puan)
 * 
 * Manages file downloads with progress tracking and queue
 */

import { BrowserWindow, ipcMain, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import https from 'https';
import http from 'http';

interface Download {
    id: string;
    url: string;
    filename: string;
    localPath: string;
    status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    totalSize: number;
    downloadedSize: number;
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

class DownloadManager {
    private downloads: Map<string, Download> = new Map();
    private downloadQueue: string[] = [];
    private maxConcurrent = 3;
    private activeDownloads = 0;
    private mainWindow: BrowserWindow | null = null;

    constructor() {
        this.setupIPCHandlers();
    }

    setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window;
    }

    private setupIPCHandlers(): void {
        ipcMain.handle('download-manager:add', (_, { url, filename }) => {
            return this.addDownload(url, filename);
        });

        ipcMain.handle('download-manager:pause', (_, id) => {
            return this.pauseDownload(id);
        });

        ipcMain.handle('download-manager:resume', (_, id) => {
            return this.resumeDownload(id);
        });

        ipcMain.handle('download-manager:cancel', (_, id) => {
            return this.cancelDownload(id);
        });

        ipcMain.handle('download-manager:list', () => {
            return this.getDownloads();
        });

        ipcMain.handle('download-manager:clear-completed', () => {
            return this.clearCompleted();
        });
    }

    private generateId(): string {
        return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    addDownload(url: string, filename: string): Download {
        const id = this.generateId();
        const downloadPath = app.getPath('downloads');
        const localPath = path.join(downloadPath, filename);

        const download: Download = {
            id,
            url,
            filename,
            localPath,
            status: 'pending',
            progress: 0,
            totalSize: 0,
            downloadedSize: 0
        };

        this.downloads.set(id, download);
        this.downloadQueue.push(id);
        this.processQueue();
        this.notifyRenderer();

        return download;
    }

    private async processQueue(): Promise<void> {
        while (this.downloadQueue.length > 0 && this.activeDownloads < this.maxConcurrent) {
            const id = this.downloadQueue.shift();
            if (id) {
                this.activeDownloads++;
                this.startDownload(id);
            }
        }
    }

    private async startDownload(id: string): Promise<void> {
        const download = this.downloads.get(id);
        if (!download) return;

        download.status = 'downloading';
        download.startedAt = new Date().toISOString();
        this.notifyRenderer();

        const protocol = download.url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(download.localPath);

        const request = protocol.get(download.url, (response) => {
            download.totalSize = parseInt(response.headers['content-length'] || '0', 10);

            response.on('data', (chunk: Buffer) => {
                download.downloadedSize += chunk.length;
                download.progress = download.totalSize > 0
                    ? (download.downloadedSize / download.totalSize) * 100
                    : 0;

                // Throttle updates to every 1%
                if (Math.floor(download.progress) % 1 === 0) {
                    this.notifyRenderer();
                }
            });

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                download.status = 'completed';
                download.progress = 100;
                download.completedAt = new Date().toISOString();
                this.activeDownloads--;
                this.notifyRenderer();
                this.processQueue();
            });
        });

        request.on('error', (error) => {
            fs.unlink(download.localPath, () => { }); // Delete partial file
            download.status = 'failed';
            download.error = error.message;
            this.activeDownloads--;
            this.notifyRenderer();
            this.processQueue();
        });
    }

    pauseDownload(id: string): boolean {
        // Note: HTTP doesn't support pause/resume without range headers
        // This is a simplified implementation
        const download = this.downloads.get(id);
        if (download && download.status === 'downloading') {
            download.status = 'pending';
            this.notifyRenderer();
            return true;
        }
        return false;
    }

    resumeDownload(id: string): boolean {
        const download = this.downloads.get(id);
        if (download && download.status === 'pending') {
            this.downloadQueue.push(id);
            this.processQueue();
            return true;
        }
        return false;
    }

    cancelDownload(id: string): boolean {
        const download = this.downloads.get(id);
        if (download) {
            download.status = 'cancelled';
            // Remove from queue if pending
            const queueIndex = this.downloadQueue.indexOf(id);
            if (queueIndex >= 0) {
                this.downloadQueue.splice(queueIndex, 1);
            }
            // Delete partial file
            if (fs.existsSync(download.localPath)) {
                fs.unlinkSync(download.localPath);
            }
            this.notifyRenderer();
            return true;
        }
        return false;
    }

    getDownloads(): Download[] {
        return Array.from(this.downloads.values());
    }

    clearCompleted(): void {
        for (const [id, download] of this.downloads) {
            if (download.status === 'completed' || download.status === 'cancelled' || download.status === 'failed') {
                this.downloads.delete(id);
            }
        }
        this.notifyRenderer();
    }

    private notifyRenderer(): void {
        if (this.mainWindow) {
            this.mainWindow.webContents.send('download-manager:update', this.getDownloads());
        }
    }
}

// Singleton instance
export const downloadManager = new DownloadManager();
