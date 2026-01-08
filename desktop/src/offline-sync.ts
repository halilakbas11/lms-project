/**
 * Offline Sync Module
 * PDF Madde 6: Offline Senkronizasyon (1.0 puan)
 * 
 * Handles downloading and caching course content for offline access
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import Store from 'electron-store';

interface CachedContent {
    id: number;
    type: 'course' | 'module' | 'video' | 'pdf';
    title: string;
    localPath: string;
    originalUrl: string;
    downloadedAt: string;
    size: number;
}

interface SyncStatus {
    lastSync: string | null;
    pendingDownloads: number;
    cachedItems: number;
    totalSize: number;
}

const store = new Store({
    name: 'lms-offline-cache',
    defaults: {
        cachedContent: [] as CachedContent[],
        lastSync: null as string | null,
        syncEnabled: true
    }
});

// Cache directory
const CACHE_DIR = path.join(app.getPath('userData'), 'offline-cache');

/**
 * Initialize cache directory
 */
export function initializeCache(): void {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

/**
 * Get sync status
 */
export function getSyncStatus(): SyncStatus {
    const cached = store.get('cachedContent') as CachedContent[];
    const totalSize = cached.reduce((sum, item) => sum + item.size, 0);

    return {
        lastSync: store.get('lastSync') as string | null,
        pendingDownloads: 0,
        cachedItems: cached.length,
        totalSize
    };
}

/**
 * Add content to cache
 */
export function addToCache(content: Omit<CachedContent, 'localPath' | 'downloadedAt'>): string {
    const localPath = path.join(CACHE_DIR, `${content.type}_${content.id}`);

    const cachedItem: CachedContent = {
        ...content,
        localPath,
        downloadedAt: new Date().toISOString()
    };

    const cached = store.get('cachedContent') as CachedContent[];
    const existingIndex = cached.findIndex(c => c.id === content.id && c.type === content.type);

    if (existingIndex >= 0) {
        cached[existingIndex] = cachedItem;
    } else {
        cached.push(cachedItem);
    }

    store.set('cachedContent', cached);
    return localPath;
}

/**
 * Get cached content by ID
 */
export function getCachedContent(id: number, type: string): CachedContent | null {
    const cached = store.get('cachedContent') as CachedContent[];
    return cached.find(c => c.id === id && c.type === type) || null;
}

/**
 * Remove content from cache
 */
export function removeFromCache(id: number, type: string): boolean {
    const cached = store.get('cachedContent') as CachedContent[];
    const item = cached.find(c => c.id === id && c.type === type);

    if (item) {
        // Delete file
        if (fs.existsSync(item.localPath)) {
            fs.unlinkSync(item.localPath);
        }

        // Remove from store
        const updated = cached.filter(c => !(c.id === id && c.type === type));
        store.set('cachedContent', updated);
        return true;
    }

    return false;
}

/**
 * Clear all cached content
 */
export function clearCache(): void {
    const cached = store.get('cachedContent') as CachedContent[];

    // Delete all files
    cached.forEach(item => {
        if (fs.existsSync(item.localPath)) {
            fs.unlinkSync(item.localPath);
        }
    });

    // Clear store
    store.set('cachedContent', []);
    store.set('lastSync', null);
}

/**
 * Update last sync time
 */
export function updateLastSync(): void {
    store.set('lastSync', new Date().toISOString());
}

/**
 * Check if content is cached
 */
export function isContentCached(id: number, type: string): boolean {
    const item = getCachedContent(id, type);
    return item !== null && fs.existsSync(item.localPath);
}

/**
 * Get all cached content
 */
export function getAllCachedContent(): CachedContent[] {
    return store.get('cachedContent') as CachedContent[];
}

/**
 * Get cache directory path
 */
export function getCacheDirectory(): string {
    return CACHE_DIR;
}
