'use client';
import { useEffect, useCallback, useState, ReactNode } from 'react';
import axios from 'axios';

interface ExamSecurityProviderProps {
    examId: string | number;
    studentId: number;
    isSebBrowser: boolean;
    children: ReactNode;
    onViolation?: (type: string) => void;
}

// Security violation types matching backend ProctoringLog eventTypes
type ViolationType =
    | 'copy_attempt'
    | 'paste_attempt'
    | 'screenshot_attempt'
    | 'devtools_open'
    | 'right_click'
    | 'keyboard_shortcut'
    | 'tab_hidden'
    | 'tab_visible'
    | 'window_blur'
    | 'window_focus'
    | 'exam_start'
    | 'exam_end';

export default function ExamSecurityProvider({
    examId,
    studentId,
    isSebBrowser,
    children,
    onViolation
}: ExamSecurityProviderProps) {
    const [violationCount, setViolationCount] = useState(0);
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

    // Log security violation to backend
    const logViolation = useCallback(async (eventType: ViolationType, metadata?: object) => {
        try {
            await axios.post(`/api/exams/${examId}/security-violation`, {
                studentId,
                eventType,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    isSebBrowser
                }
            });
            setViolationCount(prev => prev + 1);
            onViolation?.(eventType);
        } catch (error) {
            console.error('Failed to log violation:', error);
        }
    }, [examId, studentId, isSebBrowser, onViolation]);

    useEffect(() => {
        // Log exam start
        logViolation('exam_start');

        // =========================
        // 1. CLIPBOARD BLOCKING
        // =========================
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            logViolation('copy_attempt', { selection: window.getSelection()?.toString()?.substring(0, 50) });
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
            logViolation('copy_attempt', { action: 'cut' });
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            logViolation('paste_attempt');
        };

        // =========================
        // 2. RIGHT-CLICK BLOCKING
        // =========================
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            logViolation('right_click');
            return false;
        };

        // =========================
        // 3. KEYBOARD SHORTCUTS BLOCKING
        // =========================
        const handleKeyDown = (e: KeyboardEvent) => {
            // DevTools shortcuts
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
                e.preventDefault();
                logViolation('devtools_open', { key: e.key });
                return false;
            }

            // Print screen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                logViolation('screenshot_attempt');
                return false;
            }

            // Ctrl+P (Print)
            if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
                e.preventDefault();
                logViolation('screenshot_attempt', { action: 'print' });
                return false;
            }

            // Ctrl+S (Save)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
                logViolation('keyboard_shortcut', { key: 'Ctrl+S' });
                return false;
            }

            // Alt+Tab (Allowed)
            // if (e.altKey && e.key === 'Tab') {
            //     logViolation('keyboard_shortcut', { key: 'Alt+Tab' });
            // }

            // Ctrl+Shift+S (Screenshot on some systems)
            if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
                logViolation('screenshot_attempt', { action: 'ctrl+shift+s' });
                return false;
            }
        };

        // =========================
        // 4. DEVTOOLS DETECTION
        // =========================
        const devToolsChecker = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!isDevToolsOpen) {
                    setIsDevToolsOpen(true);
                    logViolation('devtools_open', { method: 'size_detection' });
                }
            } else {
                setIsDevToolsOpen(false);
            }
        };

        // =========================
        // 5. TAB VISIBILITY DETECTION
        // =========================
        const handleVisibilityChange = () => {
            if (document.hidden) {
                logViolation('tab_hidden');
            } else {
                logViolation('tab_visible');
            }
        };

        // =========================
        // 6. WINDOW FOCUS DETECTION
        // =========================
        const handleWindowBlur = () => {
            logViolation('window_blur');
        };

        const handleWindowFocus = () => {
            logViolation('window_focus');
        };

        // =========================
        // 7. SCREENSHOT PREVENTION (Partial)
        // =========================
        const handleBeforePrint = () => {
            logViolation('screenshot_attempt', { action: 'print_dialog' });
        };

        // Add all event listeners
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('resize', devToolsChecker);

        // Check DevTools periodically
        const devToolsInterval = setInterval(devToolsChecker, 1000);

        // Cleanup
        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('resize', devToolsChecker);
            clearInterval(devToolsInterval);
        };
    }, [logViolation, isDevToolsOpen]);

    // Log exam end on unmount
    useEffect(() => {
        return () => {
            logViolation('exam_end');
        };
    }, []);

    return (
        <div
            className="exam-security-wrapper"
            style={{
                // CSS-based screenshot prevention
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}
            onDragStart={(e) => e.preventDefault()}
        >
            {/* Security Warning Banner (shown when DevTools detected) */}
            {isDevToolsOpen && (
                <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center z-[9999] animate-pulse">
                    ⚠️ GÜVENLİK UYARISI: Geliştirici Araçları açık! Bu durum kaydedilmiştir.
                </div>
            )}

            {/* Violation Counter (for SEB exams) */}
            {violationCount > 0 && isSebBrowser && (
                <div className="fixed top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded z-[9998]">
                    ⚠️ İhlal: {violationCount}
                </div>
            )}

            {children}
        </div>
    );
}
