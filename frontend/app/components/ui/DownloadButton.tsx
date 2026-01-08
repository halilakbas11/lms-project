'use client';
import React, { useState } from 'react';
import useElectron from '../../hooks/useElectron';

interface DownloadButtonProps {
    url: string;
    filename: string;
    children?: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
}

/**
 * Download Button Component
 * Uses native Electron file dialog when in desktop app,
 * falls back to browser download otherwise
 */
export default function DownloadButton({
    url,
    filename,
    children = 'İndir',
    className = '',
    variant = 'primary'
}: DownloadButtonProps) {
    const { isElectron, downloadFile, showNotification } = useElectron();
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownload = async () => {
        setDownloading(true);
        setProgress(0);

        try {
            if (isElectron) {
                // Use Electron's native file dialog
                const result = await downloadFile(url, filename);

                if (result.success) {
                    await showNotification('İndirme Tamamlandı', `${filename} başarıyla indirildi.`);
                    setProgress(100);
                }
            } else {
                // Browser fallback - create download link
                const response = await fetch(url);
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                setProgress(100);
            }
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloading(false);
            setTimeout(() => setProgress(0), 2000);
        }
    };

    const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50';
    const variantClasses = {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg',
        secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
        ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
    };

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {downloading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{progress > 0 ? `${progress}%` : 'İndiriliyor...'}</span>
                </>
            ) : (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {children}
                </>
            )}
        </button>
    );
}
