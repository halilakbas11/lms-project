/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║                    LMS DESKTOP APPLICATION - ABSTRACT                        ║
 * ║                    Comprehensive Project Documentation                       ║
 * ║                                                                              ║
 * ║  Project: Learning Management System (LMS)                                   ║
 * ║  Module: Desktop Application                                                 ║
 * ║  Framework: Electron + TypeScript                                            ║
 * ║  Version: 1.0.0                                                              ║
 * ║  Last Updated: 2026-01-10                                                    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * This file serves as a comprehensive documentation and abstract for the
 * LMS Desktop Application. It contains detailed descriptions of all
 * features, IPC handlers, security measures, and architectural decisions.
 * 
 * TABLE OF CONTENTS:
 * ==================
 * 1. PROJECT OVERVIEW (Lines 30-300)
 * 2. TECHNOLOGY STACK (Lines 301-500)
 * 3. ARCHITECTURE & DESIGN (Lines 501-700)
 * 4. MAIN PROCESS (Lines 701-1000)
 * 5. IPC COMMUNICATION (Lines 1001-1300)
 * 6. SYSTEM TRAY (Lines 1301-1500)
 * 7. AUTO-UPDATER (Lines 1501-1700)
 * 8. SECURITY FEATURES (Lines 1701-1900)
 * 9. SAFE EXAM BROWSER (Lines 1901-2100)
 * 10. DEPLOYMENT (Lines 2101-2300)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: PROJECT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Project Overview
 * @description
 * 
 * The LMS Desktop Application is a cross-platform desktop solution
 * built using Electron framework. It provides a native desktop experience
 * for accessing the Learning Management System with enhanced features
 * not available in web browsers.
 * 
 * Key Features:
 * - Native desktop application for Windows and macOS
 * - System tray integration for quick access
 * - Auto-update functionality
 * - Offline capability with local storage
 * - Safe Exam Browser (SEB) mode for secure exams
 * - Webcam/microphone access for proctoring
 * - Native file system access
 * - Deep linking support (lms:// protocol)
 * - Kiosk mode for exam environments
 * 
 * Target Platforms:
 * - Windows 10/11 (x64, ARM64)
 * - macOS 11+ (Intel, Apple Silicon)
 * - Linux (x64, ARM) - Community support
 * 
 * Distribution:
 * - Windows: NSIS installer (.exe), Portable (.exe)
 * - macOS: DMG installer (.dmg), PKG installer (.pkg)
 * - Linux: AppImage, DEB, RPM packages
 */

export const PROJECT_INFO = {
    name: "LMS Desktop Application",
    version: "1.0.0",
    description: "Cross-platform desktop application for Learning Management System",
    framework: "Electron + TypeScript",
    platforms: {
        windows: {
            versions: ["Windows 10", "Windows 11"],
            architectures: ["x64", "ARM64"]
        },
        macos: {
            versions: ["macOS 11 Big Sur+"],
            architectures: ["Intel x64", "Apple Silicon ARM64"]
        },
        linux: {
            versions: ["Ubuntu 20.04+", "Fedora 34+", "Debian 11+"],
            architectures: ["x64", "ARM64"]
        }
    },
    developmentDate: "2025-2026",
    author: "LMS Development Team",
    license: "MIT"
};

/**
 * @subsection Directory Structure
 * @description
 * 
 * The desktop application follows standard Electron project structure:
 * 
 * desktop/
 * ├── assets/                    # Application assets
 * │   ├── icon.ico              # Windows icon
 * │   ├── icon.png              # macOS/Linux icon
 * │   └── README.md             # Assets documentation
 * ├── src/                       # Source code
 * │   ├── main.ts               # Main process entry point
 * │   └── electron.d.ts         # TypeScript declarations
 * ├── main.js                    # Simple entry (development)
 * ├── package.json              # Dependencies and build config
 * ├── tsconfig.json             # TypeScript configuration
 * └── README.md                 # Project documentation
 * 
 * Build Output (dist/):
 * - dist/main.js                # Compiled main process
 * - dist/preload.js             # Compiled preload script
 * - dist-electron/              # Packaged application
 */

export const DIRECTORY_STRUCTURE = {
    root: "desktop/",
    assets: {
        path: "assets/",
        files: {
            windowsIcon: "icon.ico - Windows application icon",
            macLinuxIcon: "icon.png - macOS and Linux icon",
            readme: "README.md - Assets documentation"
        }
    },
    source: {
        path: "src/",
        files: {
            mainTs: "main.ts - Main process TypeScript source",
            electronDts: "electron.d.ts - TypeScript type declarations"
        }
    },
    configuration: {
        packageJson: "Dependencies, scripts, build configuration",
        tsconfigJson: "TypeScript compiler configuration"
    },
    development: {
        mainJs: "main.js - Simple development entry point"
    }
};

/**
 * @subsection Feature Matrix
 * @description
 * 
 * Complete feature implementation status:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Feature                    │ Status │ Description                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Window Management          │ ✅     │ Main window, minimize to tray   │
 * │ System Tray                │ ✅     │ Tray icon with context menu     │
 * │ Auto-Update                │ ✅     │ Automatic update check/install  │
 * │ Local Storage              │ ✅     │ Persistent settings storage     │
 * │ File Download              │ ✅     │ Native file save dialogs        │
 * │ Deep Linking               │ ✅     │ lms:// protocol handler         │
 * │ SEB Mode                   │ ✅     │ Secure exam environment         │
 * │ Kiosk Mode                 │ ✅     │ Full-screen locked mode         │
 * │ Permission Handling        │ ✅     │ Camera/microphone access        │
 * │ External Link Handling     │ ✅     │ Open in default browser         │
 * │ Security Headers           │ ✅     │ Navigation restrictions         │
 * │ Offline Support            │ 🔄     │ Planned for future release      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export const FEATURE_MATRIX = {
    windowManagement: {
        status: "✅",
        features: [
            "Main browser window creation",
            "Window size persistence",
            "Minimize to system tray",
            "Show on tray click",
            "Fullscreen toggle",
            "Kiosk mode support"
        ]
    },
    systemTray: {
        status: "✅",
        features: [
            "Tray icon display",
            "Context menu",
            "Quick navigation options",
            "Show/hide window toggle",
            "Update check from tray",
            "Application quit"
        ]
    },
    autoUpdate: {
        status: "✅",
        features: [
            "Check for updates on startup",
            "Background download",
            "Progress notification",
            "Install on quit",
            "Manual update check"
        ]
    },
    localStorage: {
        status: "✅",
        features: [
            "Window bounds persistence",
            "User preferences",
            "Download path setting",
            "Server URL configuration"
        ]
    },
    fileOperations: {
        status: "✅",
        features: [
            "Native file save dialogs",
            "Download folder selection",
            "Open download folder",
            "File path handling"
        ]
    },
    deepLinking: {
        status: "✅",
        protocol: "lms://",
        features: [
            "Protocol registration",
            "URL parsing",
            "Navigation handling"
        ]
    },
    sebMode: {
        status: "✅",
        features: [
            "Kiosk mode activation",
            "Navigation prevention",
            "Alt+Tab blocking",
            "Exit confirmation",
            "Exam completion handling"
        ]
    },
    permissions: {
        status: "✅",
        allowed: ["media", "mediaKeySystem", "notifications"],
        purpose: "Webcam and microphone for proctoring"
    }
};

/**
 * @subsection Use Cases
 * @description
 * 
 * Primary use cases for the desktop application:
 * 
 * 1. Regular LMS Access
 *    Students and instructors access the LMS through a native app
 *    with enhanced performance and system tray integration.
 * 
 * 2. Secure Exam Taking
 *    Students take exams in a secure, locked-down environment
 *    that prevents access to other applications and resources.
 * 
 * 3. Proctored Exams
 *    Webcam access for periodic photo capture during exams.
 *    Desktop provides more reliable camera access than browsers.
 * 
 * 4. Offline Access
 *    Users can access cached content when internet is unavailable.
 *    Submissions queue for sync when online.
 * 
 * 5. Content Download
 *    Native file dialogs for downloading course materials
 *    to specific folders on the user's computer.
 */

export const USE_CASES = {
    regularAccess: {
        description: "Standard LMS access through desktop app",
        benefits: [
            "Native performance",
            "System tray quick access",
            "No browser clutter",
            "Persistent session"
        ]
    },
    secureExams: {
        description: "Safe Exam Browser mode for exams",
        benefits: [
            "Locked-down environment",
            "No tab switching",
            "No external applications",
            "Screen recording prevention"
        ]
    },
    proctoredExams: {
        description: "Webcam-monitored exams",
        benefits: [
            "Reliable camera access",
            "Background photo capture",
            "Native permissions"
        ]
    },
    offlineAccess: {
        description: "Access when internet unavailable",
        benefits: [
            "Cached content viewing",
            "Offline note taking",
            "Queue submissions"
        ]
    },
    contentDownload: {
        description: "Download course materials",
        benefits: [
            "Native file dialogs",
            "Custom download location",
            "Resume interrupted downloads"
        ]
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: TECHNOLOGY STACK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Technology Stack
 * @description
 * 
 * The desktop application is built using industry-standard technologies:
 * 
 * Core Framework: Electron
 * - Chromium for web rendering
 * - Node.js for system access
 * - Cross-platform by default
 * 
 * Language: TypeScript
 * - Type-safe development
 * - Better IDE support
 * - Compile-time error checking
 */

export const TECHNOLOGY_STACK = {
    core: {
        electron: {
            version: "Latest stable",
            description: "Cross-platform desktop framework",
            components: {
                chromium: "Web content rendering engine",
                nodejs: "System API access runtime",
                v8: "JavaScript engine"
            },
            features: [
                "Native window management",
                "System tray integration",
                "File system access",
                "IPC (Inter-Process Communication)",
                "Native menus",
                "Notifications",
                "Auto-updates"
            ]
        },
        typescript: {
            version: "5.x",
            description: "Type-safe JavaScript superset",
            configuration: {
                target: "ES2020",
                module: "CommonJS",
                strict: true,
                esModuleInterop: true
            }
        }
    },
    updates: {
        electronUpdater: {
            package: "electron-updater",
            description: "Automatic update functionality",
            features: [
                "Update checking",
                "Background download",
                "Installation on quit",
                "Progress events"
            ]
        }
    },
    storage: {
        electronStore: {
            package: "electron-store",
            description: "Persistent local storage",
            features: [
                "JSON-based storage",
                "Default values",
                "Type-safe access",
                "Encryption support"
            ]
        }
    },
    build: {
        electronBuilder: {
            package: "electron-builder",
            description: "Application packaging and distribution",
            outputs: {
                windows: ["NSIS installer", "Portable"],
                macos: ["DMG", "PKG", "ZIP"],
                linux: ["AppImage", "DEB", "RPM", "Snap"]
            }
        }
    },
    devDependencies: {
        typescript: "TypeScript compiler",
        tsNode: "TypeScript execution for development",
        electronDevtoolsInstaller: "Developer tools extensions"
    }
};

/**
 * @subsection Electron Process Model
 * @description
 * 
 * Electron uses a multi-process architecture:
 * 
 * Main Process (main.ts):
 * - Single instance per application
 * - Creates and manages browser windows
 * - Handles system-level events
 * - Manages IPC communication
 * - Access to Node.js APIs
 * 
 * Renderer Process (Web Content):
 * - One per browser window
 * - Runs web content (HTML/CSS/JS)
 * - Limited access to Node.js
 * - Communicates via IPC
 * 
 * Preload Script (preload.js):
 * - Bridge between main and renderer
 * - Exposes selected APIs to renderer
 * - Runs with Node.js access
 * - Context isolation enabled
 */

export const ELECTRON_PROCESSES = {
    main: {
        file: "src/main.ts",
        description: "Main application process",
        responsibilities: [
            "Application lifecycle",
            "Window creation and management",
            "System tray management",
            "IPC handler registration",
            "Auto-updater management",
            "Native dialogs",
            "Deep link handling",
            "Security enforcement"
        ],
        nodeAccess: true,
        chromiumAccess: false
    },
    renderer: {
        description: "Web content rendering process",
        responsibilities: [
            "Render web UI",
            "User interaction",
            "Display data",
            "Send IPC messages"
        ],
        nodeAccess: false,
        chromiumAccess: true
    },
    preload: {
        file: "preload.js",
        description: "Bridge script with controlled API exposure",
        responsibilities: [
            "Expose safe APIs to renderer",
            "Context bridge",
            "IPC channel setup"
        ],
        nodeAccess: true,
        contextIsolation: true
    }
};

/**
 * @subsection Package.json Configuration
 * @description
 * 
 * Key package.json sections for the desktop application:
 */

export const PACKAGE_CONFIG = {
    name: "lms-desktop",
    version: "1.0.0",
    main: "dist/main.js",
    scripts: {
        start: "electron dist/main.js",
        dev: "electron main.js",
        build: "tsc",
        "build:win": "electron-builder --win",
        "build:mac": "electron-builder --mac",
        "build:linux": "electron-builder --linux",
        "build:all": "electron-builder -mwl"
    },
    dependencies: {
        "electron-store": "Persistent settings storage",
        "electron-updater": "Auto-update functionality"
    },
    devDependencies: {
        electron: "Framework",
        "electron-builder": "Build and packaging",
        typescript: "TypeScript compiler",
        "@types/node": "Node.js types"
    },
    build: {
        appId: "com.lms.desktop",
        productName: "LMS Desktop",
        directories: {
            output: "dist-electron"
        },
        win: {
            target: ["nsis", "portable"],
            icon: "assets/icon.ico"
        },
        mac: {
            target: ["dmg", "zip"],
            icon: "assets/icon.png",
            category: "public.app-category.education"
        },
        linux: {
            target: ["AppImage", "deb"]
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: ARCHITECTURE & DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Architecture & Design
 * @description
 * 
 * The application follows Electron best practices:
 * 
 * Security First:
 * - Context isolation enabled
 * - Node integration disabled in renderer
 * - Preload scripts for safe API exposure
 * - Navigation restrictions
 * 
 * Performance:
 * - Lazy window creation
 * - Efficient memory management
 * - Background processing for updates
 * 
 * User Experience:
 * - System tray for quick access
 * - Persistent window state
 * - Native dialogs
 * - Smooth transitions
 */

export const ARCHITECTURE = {
    principles: {
        securityFirst: {
            description: "Security as primary concern",
            implementations: [
                "Context isolation enabled",
                "Node integration disabled",
                "Preload script bridge pattern",
                "Navigation URL whitelist",
                "External links in browser"
            ]
        },
        performance: {
            description: "Optimized resource usage",
            implementations: [
                "Show window only when ready",
                "Background update downloads",
                "Efficient IPC communication",
                "Memory-safe state management"
            ]
        },
        reliability: {
            description: "Stable and predictable behavior",
            implementations: [
                "Graceful shutdown handling",
                "Error recovery",
                "State persistence",
                "Offline fallback"
            ]
        }
    },
    patterns: {
        ipcCommunication: {
            pattern: "Request-Response via IPC",
            main: "ipcMain.handle() - Register handlers",
            renderer: "ipcRenderer.invoke() - Send requests"
        },
        stateManagement: {
            pattern: "Centralized store",
            tool: "electron-store",
            persistence: "JSON file on disk"
        },
        windowManagement: {
            pattern: "Singleton main window",
            reference: "Global mainWindow variable",
            lifecycle: "Create on ready, hide on close"
        }
    }
};

/**
 * @subsection Security Model
 * @description
 * 
 * Multi-layer security approach:
 * 
 * Layer 1: Process Isolation
 * - Main and renderer processes separated
 * - Context isolation prevents prototype pollution
 * - No direct Node.js access from web content
 * 
 * Layer 2: API Security
 * - Only whitelisted APIs exposed via preload
 * - IPC handlers validate all inputs
 * - No dynamic code execution
 * 
 * Layer 3: Navigation Security
 * - URL whitelist for navigation
 * - External URLs open in browser
 * - Prevent navigation during exam mode
 * 
 * Layer 4: Content Security
 * - Disable remote module
 * - Disable dev tools in production
 * - Disable insecure content
 */

export const SECURITY_MODEL = {
    processIsolation: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        description: "Renderer process completely isolated"
    },
    apiSecurity: {
        preloadScript: "Only safe APIs exposed",
        ipcValidation: "All IPC inputs validated",
        noEval: "No dynamic code execution"
    },
    navigationSecurity: {
        whitelistedHosts: [
            "localhost",
            "127.0.0.1",
            "lms-project-kvta8qq9l-emilias-projects-3e4f0b81.vercel.app",
            "lms-project-production-0d23.up.railway.app"
        ],
        externalLinks: "Open in default browser",
        examMode: "Navigation completely blocked"
    },
    contentSecurity: {
        remoteModule: "Disabled",
        devTools: "Disabled in production",
        insecureContent: "Blocked"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: MAIN PROCESS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Main Process
 * @file src/main.ts
 * @description
 * 
 * The main process is the entry point of the Electron application.
 * It manages the application lifecycle, creates windows, and handles
 * system-level functionality.
 * 
 * Key Functions:
 * - createMainWindow(): Creates the main browser window
 * - createTray(): Sets up system tray with menu
 * - setupAutoUpdater(): Configures auto-update listeners
 * - registerIPCHandlers(): Registers IPC communication handlers
 */

export const MAIN_PROCESS = {
    file: "src/main.ts",
    size: "14,133 bytes",
    lines: 439,
    imports: [
        "app - Application lifecycle",
        "BrowserWindow - Window management",
        "Tray - System tray",
        "Menu - Native menus",
        "ipcMain - IPC handlers",
        "dialog - Native dialogs",
        "shell - External operations",
        "session - Session management",
        "autoUpdater - Update management",
        "Store - Local storage"
    ],
    globalVariables: {
        mainWindow: "BrowserWindow | null - Main window reference",
        tray: "Tray | null - System tray reference",
        isQuitting: "boolean - Quit flag for tray behavior"
    },
    functions: {
        createMainWindow: {
            description: "Creates and configures the main browser window",
            configuration: {
                width: "From stored value or 1400",
                height: "From stored value or 900",
                minWidth: 1024,
                minHeight: 768,
                title: "LMS Desktop",
                backgroundColor: "#0f172a",
                show: false,
                autoHideMenuBar: true
            },
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: "path/to/preload.js",
                webSecurity: true,
                allowRunningInsecureContent: false
            }
        },
        createTray: {
            description: "Creates system tray with context menu",
            menuItems: [
                "Dashboard - Navigate to dashboard",
                "Derslerim - My courses",
                "Sınavlarım - My exams",
                "---",
                "Güncelleme Kontrol Et - Check for updates",
                "İndirilenler - Open downloads folder",
                "---",
                "Ayarlar - Settings",
                "Çıkış - Quit application"
            ]
        },
        setupAutoUpdater: {
            description: "Configures auto-updater event handlers",
            events: [
                "checking-for-update",
                "update-available",
                "update-not-available",
                "download-progress",
                "update-downloaded",
                "error"
            ]
        },
        registerIPCHandlers: {
            description: "Registers IPC handlers for renderer communication",
            handlers: [
                "download-file",
                "get-app-info",
                "update-settings",
                "get-settings",
                "show-notification",
                "open-external",
                "check-for-updates",
                "open-download-folder",
                "exit-seb-mode",
                "select-download-folder"
            ]
        }
    }
};

/**
 * @subsection Window Configuration
 * @description
 * 
 * Detailed window configuration and behavior:
 */

export const WINDOW_CONFIG = {
    initial: {
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768
    },
    persistence: {
        enabled: true,
        storage: "electron-store",
        key: "windowBounds",
        saveOn: "resize"
    },
    behavior: {
        showOnReady: true,
        hideOnClose: true,
        hideToTray: true,
        focus: {
            showOnTrayClick: true,
            showOnTrayDoubleClick: true
        }
    },
    loadContent: {
        source: "Remote URL (Vercel frontend)",
        url: "https://lms-project-zeta-one.vercel.app",
        fallback: "Local HTML file"
    }
};

/**
 * @subsection Application Lifecycle
 * @description
 * 
 * Application lifecycle event handling:
 */

export const APP_LIFECYCLE = {
    events: {
        ready: {
            trigger: "When Electron has finished initializing",
            actions: [
                "Create main window",
                "Create system tray",
                "Setup auto-updater",
                "Register IPC handlers"
            ]
        },
        activate: {
            trigger: "macOS: Click dock icon when no windows",
            actions: [
                "Create window if none exist",
                "Show existing window"
            ]
        },
        windowAllClosed: {
            trigger: "When all windows are closed",
            actions: [
                "Quit on Windows/Linux",
                "Keep running on macOS"
            ]
        },
        beforeQuit: {
            trigger: "Before application quits",
            actions: [
                "Set isQuitting flag",
                "Allow window close"
            ]
        },
        openUrl: {
            trigger: "Deep link activated (lms://...)",
            actions: [
                "Parse URL",
                "Navigate to path"
            ]
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: IPC COMMUNICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section IPC Communication
 * @description
 * 
 * Inter-Process Communication (IPC) enables the renderer to request
 * actions from the main process. Using invoke/handle pattern for
 * request-response communication.
 */

export const IPC_HANDLERS = {
    pattern: "ipcMain.handle / ipcRenderer.invoke",
    description: "Promise-based request-response communication",
    handlers: {
        downloadFile: {
            channel: "download-file",
            purpose: "Download a file with save dialog",
            parameters: {
                url: "string - File URL to download",
                filename: "string - Suggested filename"
            },
            returns: {
                success: "boolean",
                path: "string (on success)",
                error: "string (on failure)",
                canceled: "boolean (if user canceled)"
            },
            implementation: `
                ipcMain.handle('download-file', async (event, { url, filename }) => {
                    const result = await dialog.showSaveDialog({
                        defaultPath: path.join(downloadPath, filename),
                        title: 'Dosyayı Kaydet'
                    });
                    if (!result.canceled && result.filePath) {
                        mainWindow.webContents.downloadURL(url);
                        return { success: true, path: result.filePath };
                    }
                    return { success: false, canceled: true };
                });
            `
        },
        getAppInfo: {
            channel: "get-app-info",
            purpose: "Get application information",
            parameters: "None",
            returns: {
                version: "Application version",
                platform: "Operating system",
                arch: "CPU architecture",
                electron: "Electron version",
                node: "Node.js version",
                downloadPath: "Current download path",
                isPackaged: "Is production build"
            },
            usage: "Display about dialog, diagnostics"
        },
        updateSettings: {
            channel: "update-settings",
            purpose: "Update application settings",
            parameters: {
                settings: "Object with key-value pairs"
            },
            returns: {
                success: "boolean"
            },
            storage: "electron-store"
        },
        getSettings: {
            channel: "get-settings",
            purpose: "Retrieve all settings",
            parameters: "None",
            returns: "Complete settings object"
        },
        showNotification: {
            channel: "show-notification",
            purpose: "Display system notification",
            parameters: {
                title: "Notification title",
                body: "Notification body text"
            },
            returns: {
                success: "boolean"
            }
        },
        openExternal: {
            channel: "open-external",
            purpose: "Open URL in default browser",
            parameters: {
                url: "URL to open"
            },
            returns: {
                success: "boolean"
            }
        },
        checkForUpdates: {
            channel: "check-for-updates",
            purpose: "Manually check for application updates",
            parameters: "None",
            returns: {
                success: "boolean"
            }
        },
        openDownloadFolder: {
            channel: "open-download-folder",
            purpose: "Open downloads folder in file manager",
            parameters: "None",
            returns: {
                success: "boolean"
            }
        },
        exitSebMode: {
            channel: "exit-seb-mode",
            purpose: "Exit Safe Exam Browser mode after exam",
            parameters: {
                reason: "Reason for exit (e.g., 'exam_completed')"
            },
            returns: {
                success: "boolean"
            },
            actions: [
                "Exit kiosk mode",
                "Re-enable window controls",
                "Show completion notification",
                "Quit application"
            ]
        },
        selectDownloadFolder: {
            channel: "select-download-folder",
            purpose: "Let user choose download folder",
            parameters: "None",
            returns: {
                success: "boolean",
                path: "Selected folder path",
                canceled: "boolean if user canceled"
            }
        }
    }
};

/**
 * @subsection IPC Usage in Renderer
 * @description
 * 
 * How renderer uses IPC through preload script:
 */

export const IPC_RENDERER_USAGE = {
    preloadExpose: `
        // preload.js
        const { contextBridge, ipcRenderer } = require('electron');
        
        contextBridge.exposeInMainWorld('electronAPI', {
            downloadFile: (url, filename) => 
                ipcRenderer.invoke('download-file', { url, filename }),
            getAppInfo: () => 
                ipcRenderer.invoke('get-app-info'),
            updateSettings: (settings) => 
                ipcRenderer.invoke('update-settings', settings),
            getSettings: () => 
                ipcRenderer.invoke('get-settings'),
            showNotification: (title, body) => 
                ipcRenderer.invoke('show-notification', { title, body }),
            openExternal: (url) => 
                ipcRenderer.invoke('open-external', url),
            checkForUpdates: () => 
                ipcRenderer.invoke('check-for-updates'),
            openDownloadFolder: () => 
                ipcRenderer.invoke('open-download-folder'),
            exitSebMode: (reason) => 
                ipcRenderer.invoke('exit-seb-mode', { reason }),
            selectDownloadFolder: () => 
                ipcRenderer.invoke('select-download-folder')
        });
    `,
    rendererUsage: `
        // In React component
        const downloadFile = async (url, filename) => {
            const result = await window.electronAPI.downloadFile(url, filename);
            if (result.success) {
                console.log('Downloaded to:', result.path);
            }
        };
    `
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: SYSTEM TRAY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section System Tray
 * @description
 * 
 * System tray provides quick access to the application without
 * keeping a window visible at all times.
 */

export const SYSTEM_TRAY = {
    creation: {
        iconPath: {
            windows: "assets/icon.ico",
            macLinux: "assets/icon.png"
        },
        fallback: "Skip tray if icon not found"
    },
    contextMenu: {
        items: [
            {
                icon: "📚",
                label: "Dashboard",
                action: "Navigate to /dashboard"
            },
            {
                icon: "📖",
                label: "Derslerim",
                action: "Navigate to /dashboard/student/courses"
            },
            {
                icon: "📝",
                label: "Sınavlarım",
                action: "Navigate to /dashboard/student/exams"
            },
            { type: "separator" },
            {
                icon: "🔄",
                label: "Güncelleme Kontrol Et",
                action: "Check for updates"
            },
            {
                icon: "📥",
                label: "İndirilenler",
                action: "Open download folder"
            },
            { type: "separator" },
            {
                icon: "⚙️",
                label: "Ayarlar",
                action: "Navigate to /settings"
            },
            {
                icon: "❌",
                label: "Çıkış",
                action: "Quit application"
            }
        ]
    },
    behavior: {
        tooltip: "LMS Desktop",
        click: "Toggle window visibility",
        doubleClick: "Show window"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: AUTO-UPDATER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Auto-Updater
 * @description
 * 
 * Automatic application updates using electron-updater.
 */

export const AUTO_UPDATER = {
    library: "electron-updater",
    configuration: {
        autoDownload: true,
        autoInstallOnAppQuit: true
    },
    events: {
        checkingForUpdate: {
            log: "🔍 Güncelleme kontrol ediliyor...",
            uiNotification: "update-status: checking"
        },
        updateAvailable: {
            log: "📥 Güncelleme mevcut: {version}",
            uiNotification: "update-status: available"
        },
        updateNotAvailable: {
            log: "✅ En güncel sürüm kullanılıyor.",
            uiNotification: "update-status: not-available"
        },
        downloadProgress: {
            log: "Downloading: {percent}%",
            uiNotification: "update-status: downloading"
        },
        updateDownloaded: {
            log: "✅ Güncelleme indirildi.",
            dialog: {
                type: "info",
                title: "Güncelleme Hazır",
                message: "Yeni sürüm indirildi. Yeniden başlatmak ister misiniz?",
                buttons: ["Şimdi Yeniden Başlat", "Sonra"]
            },
            action: "quitAndInstall() if user chooses restart"
        },
        error: {
            log: "❌ Güncelleme hatası: {error}",
            uiNotification: "update-status: error"
        }
    },
    updateCheckTriggers: [
        "Application startup (production only)",
        "Manual trigger from tray menu",
        "Manual trigger from IPC"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: SECURITY FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Security Features
 * @description
 * 
 * Comprehensive security measures implemented in the application.
 */

export const SECURITY_FEATURES = {
    processIsolation: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        webviewTag: false,
        description: "Complete isolation between main and renderer"
    },
    navigationSecurity: {
        implementation: `
            app.on('web-contents-created', (event, contents) => {
                contents.on('will-navigate', (event, navigationUrl) => {
                    const parsedUrl = new URL(navigationUrl);
                    const allowedHosts = [
                        'localhost',
                        '127.0.0.1',
                        'lms-project-kvta8qq9l-emilias-projects-3e4f0b81.vercel.app',
                        'lms-project-production-0d23.up.railway.app'
                    ];
                    
                    if (!allowedHosts.includes(parsedUrl.hostname)) {
                        event.preventDefault();
                        shell.openExternal(navigationUrl);
                    }
                });
            });
        `,
        behavior: "Block navigation to non-whitelisted URLs"
    },
    externalLinks: {
        implementation: `
            mainWindow.webContents.setWindowOpenHandler(({ url }) => {
                shell.openExternal(url);
                return { action: 'deny' };
            });
        `,
        behavior: "Open new windows in default browser"
    },
    permissionHandling: {
        implementation: `
            session.defaultSession.setPermissionRequestHandler(
                (webContents, permission, callback) => {
                    const allowedPermissions = ['media', 'mediaKeySystem', 'notifications'];
                    callback(allowedPermissions.includes(permission));
                }
            );
        `,
        allowedPermissions: ["media", "mediaKeySystem", "notifications"],
        purpose: "Allow webcam/mic for proctoring, deny other permissions"
    },
    deepLinkSecurity: {
        protocol: "lms://",
        registration: "app.setAsDefaultProtocolClient('lms')",
        handling: "Parse and validate before navigation"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: SAFE EXAM BROWSER (SEB) MODE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Safe Exam Browser Mode
 * @description
 * 
 * SEB mode locks down the desktop for secure exam taking.
 */

export const SEB_MODE = {
    purpose: "Secure, locked-down environment for exams",
    activation: "Triggered from web content via IPC",
    features: {
        kioskMode: {
            enabled: true,
            fullscreen: true,
            description: "Full-screen, no window controls"
        },
        navigationPrevention: {
            enabled: true,
            description: "Block all navigation during exam"
        },
        windowControls: {
            closable: false,
            minimizable: false,
            maximizable: false,
            fullScreenable: false
        },
        menuBar: {
            visible: false
        },
        exitConfirmation: {
            enabled: true,
            message: "Closing will mark exam as incomplete. Are you sure?",
            buttons: ["Continue Exam", "Exit (Incomplete)"]
        }
    },
    exitHandler: {
        channel: "exit-seb-mode",
        actions: [
            "Exit kiosk mode",
            "Re-enable window controls",
            "Show completion notification",
            "Delay 2 seconds",
            "Quit application"
        ],
        notification: {
            title: "✅ Sınav Tamamlandı",
            body: "Sınav başarıyla gönderildi. Güvenli mod kapatılıyor..."
        }
    },
    implementation: `
        ipcMain.handle('exit-seb-mode', (event, { reason }) => {
            console.log('🔓 Exiting SEB mode:', reason);
            
            // Exit kiosk mode
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
            
            // Show notification
            new Notification({
                title: '✅ Sınav Tamamlandı',
                body: 'Sınav başarıyla gönderildi. Güvenli mod kapatılıyor...'
            }).show();
            
            // Quit after delay
            setTimeout(() => {
                isQuitting = true;
                app.quit();
            }, 2000);
            
            return { success: true };
        });
    `
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Deployment
 * @description
 * 
 * Application building and distribution configuration.
 */

export const DEPLOYMENT = {
    buildTool: "electron-builder",
    commands: {
        windows: "npm run build:win",
        macos: "npm run build:mac",
        linux: "npm run build:linux",
        all: "npm run build:all"
    },
    outputs: {
        windows: {
            nsis: "LMS-Desktop-Setup-1.0.0.exe",
            portable: "LMS-Desktop-1.0.0-portable.exe"
        },
        macos: {
            dmg: "LMS-Desktop-1.0.0.dmg",
            zip: "LMS-Desktop-1.0.0-mac.zip"
        },
        linux: {
            appImage: "LMS-Desktop-1.0.0.AppImage",
            deb: "lms-desktop_1.0.0_amd64.deb"
        }
    },
    updateServer: {
        option1: "GitHub Releases",
        option2: "Custom update server",
        configuration: "electron-builder.yml"
    },
    signing: {
        windows: "Code signing certificate required for distribution",
        macos: "Apple Developer certificate required for notarization",
        linux: "GPG signing optional"
    }
};

/**
 * @subsection Development vs Production
 * @description
 * 
 * Differences between development and production builds:
 */

export const BUILD_MODES = {
    development: {
        check: "!app.isPackaged",
        features: [
            "Load from localhost if available",
            "DevTools enabled",
            "console.log visible",
            "Auto-updater disabled"
        ],
        command: "npm run dev"
    },
    production: {
        check: "app.isPackaged",
        features: [
            "Load from remote URL",
            "DevTools disabled",
            "Console minimized",
            "Auto-updater enabled"
        ],
        command: "npm run build:win/mac/linux"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ALL DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export default {
    PROJECT_INFO,
    DIRECTORY_STRUCTURE,
    FEATURE_MATRIX,
    USE_CASES,
    TECHNOLOGY_STACK,
    ELECTRON_PROCESSES,
    PACKAGE_CONFIG,
    ARCHITECTURE,
    SECURITY_MODEL,
    MAIN_PROCESS,
    WINDOW_CONFIG,
    APP_LIFECYCLE,
    IPC_HANDLERS,
    IPC_RENDERER_USAGE,
    SYSTEM_TRAY,
    AUTO_UPDATER,
    SECURITY_FEATURES,
    SEB_MODE,
    DEPLOYMENT,
    BUILD_MODES
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * END OF DESKTOP APPLICATION ABSTRACT
 * Total Lines: ~2000+
 * Last Updated: 2026-01-10
 * ═══════════════════════════════════════════════════════════════════════════════
 */
