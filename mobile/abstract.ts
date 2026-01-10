/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║                    LMS MOBILE APPLICATION - ABSTRACT                         ║
 * ║                    Comprehensive Project Documentation                       ║
 * ║                                                                              ║
 * ║  Project: Learning Management System (LMS)                                   ║
 * ║  Module: Mobile Application                                                  ║
 * ║  Framework: React Native + Expo                                              ║
 * ║  Version: 1.0.0                                                              ║
 * ║  Last Updated: 2026-01-10                                                    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * This file serves as a comprehensive documentation and abstract for the
 * LMS Mobile Application. It contains detailed descriptions of all components,
 * screens, services, contexts, and architectural decisions made during
 * the development of this mobile application.
 * 
 * TABLE OF CONTENTS:
 * ==================
 * 1. PROJECT OVERVIEW (Lines 30-200)
 * 2. TECHNOLOGY STACK (Lines 201-400)
 * 3. ARCHITECTURE & DESIGN PATTERNS (Lines 401-600)
 * 4. SCREEN COMPONENTS (Lines 601-1200)
 * 5. CONTEXT PROVIDERS (Lines 1201-1400)
 * 6. SERVICES LAYER (Lines 1401-1600)
 * 7. UI COMPONENTS (Lines 1601-1800)
 * 8. INTERNATIONALIZATION (Lines 1801-1900)
 * 9. SECURITY FEATURES (Lines 1901-2000)
 * 10. API INTEGRATION (Lines 2001-2100)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: PROJECT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Project Overview
 * @description
 * 
 * The LMS Mobile Application is a cross-platform mobile solution built using
 * React Native and Expo framework. This application provides students,
 * instructors, and administrators with a comprehensive mobile interface
 * for accessing the Learning Management System.
 * 
 * Key Features:
 * - Multi-role support (Student, Instructor, Admin, Manager, Assistant, Guest)
 * - Optical Mark Recognition (OMR) for exam grading
 * - Real-time exam taking with timer functionality
 * - Course management and enrollment
 * - Grade tracking and analytics
 * - Note-taking functionality
 * - Multi-language support (Turkish, English, Japanese)
 * - Offline capability with AsyncStorage
 * - Camera integration for optical form scanning
 * - Video and PDF content viewing
 * 
 * Target Platforms:
 * - iOS 13.0 and above
 * - Android 8.0 (API Level 26) and above
 * 
 * Development Approach:
 * The application follows SOLID principles and Clean Architecture patterns
 * to ensure maintainability, testability, and scalability of the codebase.
 */

export const PROJECT_INFO = {
    name: "LMS Mobile Application",
    version: "1.0.0",
    description: "Cross-platform mobile application for Learning Management System",
    framework: "React Native + Expo",
    minimumIOSVersion: "13.0",
    minimumAndroidVersion: "8.0 (API 26)",
    developmentDate: "2025-2026",
    author: "LMS Development Team",
    license: "MIT"
};

/**
 * @subsection Project Structure
 * @description
 * 
 * The mobile application follows a well-organized directory structure:
 * 
 * mobile/
 * ├── App.tsx                 # Main application entry point
 * ├── app.json               # Expo configuration
 * ├── package.json           # Dependencies and scripts
 * ├── tsconfig.json          # TypeScript configuration
 * ├── index.ts               # Expo entry file
 * ├── optik.png              # Optical form template image
 * └── src/
 *     ├── components/        # Reusable UI components
 *     │   ├── Header.tsx     # Navigation header component
 *     │   ├── optical/       # Optical reader components
 *     │   └── ...
 *     ├── context/           # React Context providers
 *     │   ├── AuthContext.tsx
 *     │   └── LanguageContext.tsx
 *     ├── i18n/              # Internationalization
 *     │   └── translations.ts
 *     ├── screens/           # Screen components
 *     │   ├── LoginScreen.tsx
 *     │   ├── StudentDashboard.tsx
 *     │   ├── InstructorDashboard.tsx
 *     │   ├── AdminDashboard.tsx
 *     │   ├── OpticalReaderScreen.tsx
 *     │   ├── TakeExamScreen.tsx
 *     │   └── ...
 *     ├── services/          # API and business logic services
 *     │   └── ApiService.ts
 *     └── styles/            # Global styles
 *         └── styles.ts
 */

export const DIRECTORY_STRUCTURE = {
    root: "mobile/",
    entryPoint: "App.tsx",
    configuration: ["app.json", "package.json", "tsconfig.json"],
    sourceDirectory: "src/",
    subdirectories: {
        components: "Reusable UI components including Header, optical reader components",
        context: "React Context providers for authentication and language",
        i18n: "Internationalization files with translation dictionaries",
        screens: "All screen components organized by functionality",
        services: "API service layer for backend communication",
        styles: "Global stylesheet definitions"
    }
};

/**
 * @subsection Feature Matrix
 * @description
 * 
 * Comprehensive list of features implemented in the mobile application:
 * 
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ Feature                    │ Status  │ Description                    │
 * ├────────────────────────────────────────────────────────────────────────┤
 * │ User Authentication        │ ✅      │ Login with email/password      │
 * │ Role-based Access          │ ✅      │ Student/Instructor/Admin       │
 * │ Course Viewing             │ ✅      │ List and view enrolled courses │
 * │ Exam Taking                │ ✅      │ Timed exams with questions     │
 * │ Grade Viewing              │ ✅      │ View exam results and grades   │
 * │ Optical Form Reading       │ ✅      │ OMR with camera integration    │
 * │ Note Taking                │ ✅      │ Personal notes with colors     │
 * │ Multi-language Support     │ ✅      │ TR, EN, JP languages           │
 * │ Video Player               │ ✅      │ Course video content viewing   │
 * │ PDF Viewer                 │ ✅      │ Course document viewing        │
 * │ Offline Mode               │ ✅      │ AsyncStorage persistence       │
 * │ Push Notifications         │ 🔄      │ Planned for future release     │
 * │ Biometric Authentication   │ 🔄      │ Planned for future release     │
 * └────────────────────────────────────────────────────────────────────────┘
 */

export const FEATURE_MATRIX = {
    authentication: {
        status: "implemented",
        features: ["email_password_login", "session_persistence", "auto_logout"]
    },
    roleBasedAccess: {
        status: "implemented",
        roles: ["student", "instructor", "admin", "manager", "assistant", "guest"]
    },
    courseManagement: {
        status: "implemented",
        features: ["course_listing", "course_enrollment", "course_details"]
    },
    examSystem: {
        status: "implemented",
        features: ["exam_listing", "timed_exams", "question_types", "auto_submit"]
    },
    opticalReader: {
        status: "implemented",
        features: ["camera_capture", "omr_processing", "grade_calculation"]
    },
    notes: {
        status: "implemented",
        features: ["create_notes", "edit_notes", "delete_notes", "color_coding"]
    },
    multilanguage: {
        status: "implemented",
        languages: ["tr", "en", "jp"]
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: TECHNOLOGY STACK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Technology Stack
 * @description
 * 
 * The mobile application is built using modern, industry-standard technologies
 * and frameworks. Each technology choice was made based on performance,
 * developer experience, community support, and long-term maintainability.
 * 
 * Primary Technologies:
 * 
 * 1. React Native (v0.81.5)
 *    - Cross-platform mobile development framework
 *    - Single codebase for iOS and Android
 *    - Native performance with JavaScript/TypeScript
 *    - Large ecosystem of libraries
 * 
 * 2. Expo (v54.0.30)
 *    - Managed workflow for simplified development
 *    - OTA (Over-the-Air) updates capability
 *    - Built-in access to native APIs
 *    - Simplified build and deployment process
 * 
 * 3. TypeScript (v5.9.2)
 *    - Static type checking
 *    - Enhanced IDE support
 *    - Better code documentation
 *    - Reduced runtime errors
 * 
 * 4. React (v19.1.0)
 *    - Component-based architecture
 *    - Virtual DOM for performance
 *    - Hooks for state management
 *    - Context API for global state
 */

export const TECHNOLOGY_STACK = {
    core: {
        reactNative: {
            version: "0.81.5",
            description: "Cross-platform mobile framework",
            purpose: "Core application framework"
        },
        expo: {
            version: "54.0.30",
            description: "React Native toolchain and platform",
            purpose: "Simplified development and deployment"
        },
        typescript: {
            version: "5.9.2",
            description: "Typed superset of JavaScript",
            purpose: "Type safety and better developer experience"
        },
        react: {
            version: "19.1.0",
            description: "UI component library",
            purpose: "Component-based architecture"
        }
    },
    navigation: {
        expoRouter: {
            version: "6.0.21",
            description: "File-based routing for Expo",
            purpose: "Application navigation"
        }
    },
    storage: {
        asyncStorage: {
            version: "2.2.0",
            description: "Async key-value storage",
            purpose: "Local data persistence"
        }
    },
    media: {
        expoCamera: {
            version: "17.0.10",
            description: "Camera access module",
            purpose: "Optical form scanning"
        },
        expoAv: {
            version: "16.0.8",
            description: "Audio/Video playback",
            purpose: "Course video content"
        },
        expoImagePicker: {
            version: "17.0.10",
            description: "Image selection module",
            purpose: "Photo selection from gallery"
        },
        expoImageManipulator: {
            version: "14.0.8",
            description: "Image processing module",
            purpose: "Image optimization and manipulation"
        }
    },
    networking: {
        axios: {
            version: "1.13.2",
            description: "HTTP client",
            purpose: "API communication"
        }
    },
    utilities: {
        buffer: {
            version: "6.0.3",
            description: "Buffer implementation",
            purpose: "Binary data handling"
        },
        jpegJs: {
            version: "0.4.4",
            description: "JPEG encoder/decoder",
            purpose: "Image processing for OMR"
        }
    }
};

/**
 * @subsection Expo Modules Used
 * @description
 * 
 * List of Expo modules utilized in the application:
 * 
 * expo-camera: Provides access to the device camera for capturing photos
 * and videos. Used primarily for the optical form reader feature.
 * 
 * expo-av: Handles audio and video playback. Used for displaying course
 * video content within the application.
 * 
 * expo-image-picker: Allows users to select images from their device
 * gallery. Alternative to camera capture for OMR.
 * 
 * expo-image-manipulator: Provides tools for image manipulation including
 * resize, rotate, flip, and crop. Used for optimizing captured images.
 * 
 * expo-router: File-based routing system. Provides navigation management
 * similar to Next.js routing patterns.
 * 
 * expo-status-bar: Controls the app status bar appearance across
 * different platforms and screens.
 */

export const EXPO_MODULES = {
    camera: {
        module: "expo-camera",
        version: "17.0.10",
        usage: "Optical form scanning, photo capture",
        permissions: ["CAMERA"],
        features: [
            "Photo capture",
            "Camera preview",
            "Flash control",
            "Camera switching (front/back)"
        ]
    },
    av: {
        module: "expo-av",
        version: "16.0.8",
        usage: "Video playback for course content",
        permissions: ["AUDIO_RECORD"],
        features: [
            "Video playback",
            "Audio playback",
            "Playback controls",
            "Progress tracking"
        ]
    },
    imagePicker: {
        module: "expo-image-picker",
        version: "17.0.10",
        usage: "Gallery image selection",
        permissions: ["MEDIA_LIBRARY"],
        features: [
            "Gallery access",
            "Image selection",
            "Multiple selection",
            "Camera roll access"
        ]
    },
    imageManipulator: {
        module: "expo-image-manipulator",
        version: "14.0.8",
        usage: "Image processing for OMR",
        permissions: [],
        features: [
            "Image resize",
            "Image crop",
            "Image rotation",
            "Format conversion"
        ]
    },
    statusBar: {
        module: "expo-status-bar",
        version: "3.0.9",
        usage: "Status bar styling",
        permissions: [],
        features: [
            "Style control",
            "Visibility control",
            "Background color"
        ]
    }
};

/**
 * @subsection Development Tools
 * @description
 * 
 * Tools used during development:
 * 
 * - Expo Go: Mobile app for testing during development
 * - Expo CLI: Command-line interface for project management
 * - TypeScript: Static type checking
 * - ESLint: Code linting and style enforcement
 * - Prettier: Code formatting
 * - VS Code: Primary development IDE
 */

export const DEVELOPMENT_TOOLS = {
    runtime: {
        expoGo: "Mobile testing app",
        expoCli: "Project management CLI"
    },
    quality: {
        typescript: "Type checking",
        eslint: "Code linting"
    },
    formatting: {
        prettier: "Code formatting"
    },
    ide: {
        vsCode: "Primary development environment"
    },
    debugging: {
        reactDevTools: "Component inspection",
        flipper: "Network and performance debugging"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: ARCHITECTURE & DESIGN PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Architecture & Design Patterns
 * @description
 * 
 * The mobile application follows Clean Architecture principles combined
 * with SOLID design patterns. This approach ensures:
 * 
 * - Separation of Concerns: Each layer has a specific responsibility
 * - Testability: Components can be tested in isolation
 * - Maintainability: Changes in one layer don't affect others
 * - Scalability: New features can be added without major refactoring
 * 
 * Architecture Layers:
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    PRESENTATION LAYER                          │
 * │   Screens (LoginScreen, Dashboard, etc.)                       │
 * │   UI Components (Header, Card, Button, etc.)                   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                    APPLICATION LAYER                           │
 * │   Context Providers (AuthContext, LanguageContext)             │
 * │   Custom Hooks (useAuth, useLanguage)                          │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                    DOMAIN LAYER                                │
 * │   Business Logic                                               │
 * │   Entity Definitions                                           │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                    DATA LAYER                                  │
 * │   API Service (ApiService.ts)                                  │
 * │   Local Storage (AsyncStorage)                                 │
 * └─────────────────────────────────────────────────────────────────┘
 */

export const ARCHITECTURE = {
    type: "Clean Architecture with SOLID Principles",
    layers: {
        presentation: {
            description: "User interface components and screens",
            components: ["Screens", "UI Components", "Navigation"],
            responsibilities: [
                "Rendering UI elements",
                "Handling user interactions",
                "Displaying data from application layer"
            ]
        },
        application: {
            description: "Application-specific business rules",
            components: ["Context Providers", "Custom Hooks", "State Management"],
            responsibilities: [
                "Orchestrating data flow",
                "Managing application state",
                "Coordinating between layers"
            ]
        },
        domain: {
            description: "Core business logic and entities",
            components: ["Entity Definitions", "Business Rules", "Interfaces"],
            responsibilities: [
                "Defining business entities",
                "Implementing business rules",
                "Maintaining domain integrity"
            ]
        },
        data: {
            description: "Data access and external services",
            components: ["API Service", "Local Storage", "Data Mappers"],
            responsibilities: [
                "Communicating with backend API",
                "Persisting data locally",
                "Transforming data between layers"
            ]
        }
    }
};

/**
 * @subsection SOLID Principles Implementation
 * @description
 * 
 * S - Single Responsibility Principle:
 * Each screen and component has a single, well-defined responsibility.
 * Example: OpticalReaderScreen only handles optical form scanning logic.
 * 
 * O - Open/Closed Principle:
 * Components are open for extension but closed for modification.
 * Example: New question types can be added without modifying existing ones.
 * 
 * L - Liskov Substitution Principle:
 * Derived components can replace base components without breaking functionality.
 * Example: Different dashboard types share common interface.
 * 
 * I - Interface Segregation Principle:
 * Interfaces are specific to client needs.
 * Example: AuthContextType only exposes necessary auth methods.
 * 
 * D - Dependency Inversion Principle:
 * High-level modules don't depend on low-level modules.
 * Example: Screens depend on ApiService interface, not implementation.
 */

export const SOLID_PRINCIPLES = {
    singleResponsibility: {
        principle: "A class/component should have only one reason to change",
        examples: [
            "OpticalReaderScreen: Only handles optical form scanning",
            "LoginScreen: Only handles user authentication UI",
            "AuthContext: Only manages authentication state",
            "ApiService: Only handles API communication"
        ]
    },
    openClosed: {
        principle: "Open for extension, closed for modification",
        examples: [
            "Question types can be extended without modifying existing code",
            "New dashboard roles added by creating new components",
            "Translation system extensible for new languages"
        ]
    },
    liskovSubstitution: {
        principle: "Subtypes must be substitutable for their base types",
        examples: [
            "Dashboard components share common props interface",
            "Screen components follow consistent navigation patterns"
        ]
    },
    interfaceSegregation: {
        principle: "Clients should not be forced to depend on unused interfaces",
        examples: [
            "AuthContextType exposes only login, logout, user, loading",
            "Screen props are minimal and specific to screen needs"
        ]
    },
    dependencyInversion: {
        principle: "Depend on abstractions, not concretions",
        examples: [
            "Screens use ApiService through consistent interface",
            "Components receive dependencies through props and context"
        ]
    }
};

/**
 * @subsection State Management Strategy
 * @description
 * 
 * The application uses a combination of local state and context-based
 * global state management:
 * 
 * Local State (useState):
 * - Component-specific UI state
 * - Form inputs
 * - Loading indicators
 * - Temporary data
 * 
 * Context State:
 * - User authentication state (AuthContext)
 * - Language preferences (LanguageContext)
 * - Theme settings (future implementation)
 * 
 * Persistent State (AsyncStorage):
 * - User session data
 * - Language preferences
 * - Cached data for offline use
 */

export const STATE_MANAGEMENT = {
    localState: {
        hook: "useState",
        useCases: [
            "Form input values",
            "Loading states",
            "Error messages",
            "UI toggle states",
            "Temporary data"
        ],
        example: "const [email, setEmail] = useState('');"
    },
    contextState: {
        hook: "useContext",
        providers: ["AuthContext", "LanguageContext"],
        useCases: [
            "User authentication data",
            "Current language selection",
            "Global settings"
        ],
        example: "const { user, login, logout } = useAuth();"
    },
    persistentState: {
        storage: "AsyncStorage",
        useCases: [
            "User session persistence",
            "Language preference storage",
            "Offline data caching"
        ],
        example: "await AsyncStorage.setItem('user', JSON.stringify(userData));"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: SCREEN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Screen Components
 * @description
 * 
 * The application contains 18 screen components, each serving a specific
 * purpose within the user journey. Screens are organized by user role
 * and functionality.
 * 
 * Screen Categories:
 * 1. Authentication Screens
 * 2. Student Screens
 * 3. Instructor Screens
 * 4. Admin Screens
 * 5. Shared Utility Screens
 */

/**
 * @screen LoginScreen
 * @file src/screens/LoginScreen.tsx
 * @description
 * 
 * The LoginScreen serves as the entry point for user authentication.
 * It provides a clean, user-friendly interface for entering credentials
 * and accessing the application.
 * 
 * Features:
 * - Email input field with validation
 * - Password input field with secure entry
 * - Login button with loading state
 * - Demo account shortcuts for testing
 * - Language selection
 * - Error message display
 * 
 * API Integration:
 * - POST /api/login with email and password
 * - Stores user data in AuthContext on success
 * 
 * Navigation:
 * - Redirects to appropriate dashboard based on user role
 * - Student → StudentDashboard
 * - Instructor → InstructorDashboard
 * - Admin/Manager → AdminDashboard
 */

export const LOGIN_SCREEN = {
    file: "src/screens/LoginScreen.tsx",
    size: "4465 bytes",
    responsibility: "User authentication UI",
    props: {
        onLogin: "(userData: any) => Promise<void>"
    },
    state: {
        email: "string - User email input",
        password: "string - User password input",
        loading: "boolean - Loading state during API call",
        error: "string - Error message display"
    },
    apiCalls: [
        {
            endpoint: "POST /api/login",
            payload: "{ email, password }",
            response: "{ success, user }"
        }
    ],
    features: [
        "Email/password authentication",
        "Demo account quick access",
        "Loading state handling",
        "Error message display",
        "Language-aware UI"
    ]
};

/**
 * @screen StudentDashboard
 * @file src/screens/StudentDashboard.tsx
 * @description
 * 
 * The StudentDashboard provides students with an overview of their
 * academic progress and quick access to all student-related features.
 * 
 * Features:
 * - Welcome message with user name
 * - Navigation cards for main features
 * - Quick access to courses, exams, grades, notes
 * - Logout functionality
 * - Role indicator
 * 
 * Navigation Options:
 * - My Courses → CoursesListScreen
 * - My Exams → ExamsListScreen
 * - My Grades → GradesListScreen
 * - Notes → NotesScreen
 */

export const STUDENT_DASHBOARD = {
    file: "src/screens/StudentDashboard.tsx",
    size: "5076 bytes",
    responsibility: "Student main dashboard UI",
    props: {
        user: "User object with id, name, role",
        onLogout: "() => void",
        onNavigate: "(screen: string) => void"
    },
    navigationCards: [
        { id: "my_courses", icon: "📚", screen: "my_courses" },
        { id: "my_exams", icon: "📝", screen: "my_exams" },
        { id: "my_grades", icon: "📊", screen: "my_grades" },
        { id: "my_notes", icon: "📒", screen: "my_notes" }
    ],
    features: [
        "Welcome greeting",
        "Role badge display",
        "Navigation grid",
        "Logout button"
    ]
};

/**
 * @screen InstructorDashboard
 * @file src/screens/InstructorDashboard.tsx
 * @description
 * 
 * The InstructorDashboard provides instructors with tools for
 * managing courses, exams, and student grades.
 * 
 * Features:
 * - Course management access
 * - Exam creation and management
 * - Student list viewing
 * - Optical reader access (main differentiator)
 * - Gradebook access
 * 
 * Special Features:
 * - Optical Reader button for OMR functionality
 * - Quick access to exam grading
 */

export const INSTRUCTOR_DASHBOARD = {
    file: "src/screens/InstructorDashboard.tsx",
    size: "4446 bytes",
    responsibility: "Instructor main dashboard UI",
    props: {
        user: "User object with id, name, role",
        onLogout: "() => void",
        onNavigate: "(screen: string) => void",
        onOpenOptical: "() => void"
    },
    navigationCards: [
        { id: "instructor_courses", icon: "📚", screen: "instructor_courses" },
        { id: "instructor_exams", icon: "📝", screen: "instructor_exams" },
        { id: "students_list", icon: "👥", screen: "students_list" },
        { id: "gradebook", icon: "📊", screen: "gradebook" }
    ],
    specialFeatures: [
        "Optical Reader quick access button",
        "Exam management tools",
        "Student grade management"
    ]
};

/**
 * @screen AdminDashboard
 * @file src/screens/AdminDashboard.tsx
 * @description
 * 
 * The AdminDashboard provides system administrators with access
 * to all administrative functions of the LMS.
 * 
 * Features:
 * - User management access
 * - Course administration
 * - System reports
 * - Settings access
 * 
 * Admin Capabilities:
 * - View and manage all users
 * - View and manage all courses
 * - Generate system reports
 * - Configure system settings
 */

export const ADMIN_DASHBOARD = {
    file: "src/screens/AdminDashboard.tsx",
    size: "3459 bytes",
    responsibility: "Admin main dashboard UI",
    props: {
        user: "User object with id, name, role",
        onLogout: "() => void",
        onNavigate: "(screen: string) => void"
    },
    navigationCards: [
        { id: "users_list", icon: "👥", screen: "users_list" },
        { id: "courses_list", icon: "📚", screen: "courses_list" },
        { id: "reports", icon: "📊", screen: "reports" }
    ],
    adminCapabilities: [
        "User management",
        "Course administration",
        "Report generation",
        "System configuration"
    ]
};

/**
 * @screen OpticalReaderScreen
 * @file src/screens/OpticalReaderScreen.tsx
 * @description
 * 
 * The OpticalReaderScreen implements Optical Mark Recognition (OMR)
 * functionality for grading paper-based exams using the device camera.
 * 
 * Workflow:
 * 1. Selection Phase: Choose course, exam, and student
 * 2. Camera Phase: Capture optical form image
 * 3. Result Phase: View and confirm grades
 * 
 * Technical Implementation:
 * - Uses expo-camera for image capture
 * - Processes image through backend OMR service
 * - Displays detected answers with confidence scores
 * - Saves grades to backend
 * 
 * Components Used:
 * - OpticalSelection: Course/Exam/Student selection UI
 * - OpticalCamera: Camera interface with alignment overlay
 * - Result display with grade breakdown
 */

export const OPTICAL_READER_SCREEN = {
    file: "src/screens/OpticalReaderScreen.tsx",
    size: "10208 bytes",
    responsibility: "Optical Mark Recognition for exam grading",
    props: {
        userId: "number - Instructor user ID",
        onBack: "() => void"
    },
    state: {
        step: "'selection' | 'camera' | 'result'",
        courses: "Course[] - Instructor's courses",
        exams: "Exam[] - Selected course's exams",
        students: "User[] - Course enrolled students",
        selectedCourse: "Course | null",
        selectedExam: "Exam | null",
        selectedStudent: "User | null",
        result: "OMRResult | null",
        loading: "boolean"
    },
    workflow: [
        "1. Load instructor's courses",
        "2. User selects a course",
        "3. Load course exams",
        "4. User selects an exam",
        "5. Load enrolled students",
        "6. User selects a student",
        "7. Open camera for scanning",
        "8. Capture and process form",
        "9. Display results",
        "10. Save grade to backend"
    ],
    apiCalls: [
        "GET /api/instructor/:id/courses",
        "GET /api/courses/:id/exams",
        "GET /api/courses/:id/students",
        "POST /api/exams/process-optical"
    ]
};

/**
 * @screen TakeExamScreen
 * @file src/screens/TakeExamScreen.tsx
 * @description
 * 
 * The TakeExamScreen provides students with an interface to
 * take online exams with timer functionality.
 * 
 * Features:
 * - Countdown timer
 * - Question navigation
 * - Answer selection (multiple choice, true/false, etc.)
 * - Progress indicator
 * - Auto-submit on timer expiry
 * - Manual submit option
 * 
 * Question Types Supported:
 * - Multiple choice
 * - Multiple selection
 * - True/False
 * - Short answer
 * 
 * Security Features:
 * - Timer-based auto submission
 * - Answer persistence during exam
 */

export const TAKE_EXAM_SCREEN = {
    file: "src/screens/TakeExamScreen.tsx",
    size: "9186 bytes",
    responsibility: "Online exam taking interface",
    props: {
        user: "User object",
        exam: "Exam object with questions",
        onBack: "() => void",
        onFinish: "(result: ExamResult) => void"
    },
    state: {
        currentQuestionIndex: "number",
        answers: "Record<number, string | string[]>",
        timeRemaining: "number (seconds)",
        isSubmitting: "boolean"
    },
    features: [
        "Countdown timer display",
        "Question-by-question navigation",
        "Multiple question type support",
        "Answer selection and storage",
        "Progress indicator",
        "Auto-submit on timer expiry",
        "Manual submission option"
    ],
    questionTypes: [
        "multiple_choice",
        "multiple_selection",
        "true_false",
        "short_answer"
    ]
};

/**
 * @screen CoursesListScreen
 * @file src/screens/CoursesListScreen.tsx
 * @description
 * 
 * Displays a list of courses for the current user.
 * For students: Shows enrolled courses
 * For instructors: Shows courses they teach
 */

export const COURSES_LIST_SCREEN = {
    file: "src/screens/CoursesListScreen.tsx",
    size: "2467 bytes",
    responsibility: "Course listing UI",
    features: [
        "Course cards with details",
        "Course code and title display",
        "Instructor name display",
        "Course description preview"
    ]
};

/**
 * @screen ExamsListScreen
 * @file src/screens/ExamsListScreen.tsx
 * @description
 * 
 * Displays available exams for the student based on enrolled courses.
 * Shows exam status, duration, and start button for available exams.
 */

export const EXAMS_LIST_SCREEN = {
    file: "src/screens/ExamsListScreen.tsx",
    size: "7078 bytes",
    responsibility: "Exam listing UI for students",
    features: [
        "Exam cards with details",
        "Exam status indicator",
        "Duration display",
        "Start exam button",
        "Filter by course"
    ]
};

/**
 * @screen GradesListScreen
 * @file src/screens/GradesListScreen.tsx
 * @description
 * 
 * Displays student's grades for completed exams.
 * Shows score, date, and exam details.
 */

export const GRADES_LIST_SCREEN = {
    file: "src/screens/GradesListScreen.tsx",
    size: "2655 bytes",
    responsibility: "Grade viewing UI",
    features: [
        "Grade cards by exam",
        "Score display",
        "Completion date",
        "Grade breakdown (if available)"
    ]
};

/**
 * @screen NotesScreen
 * @file src/screens/NotesScreen.tsx
 * @description
 * 
 * Personal note-taking feature for all users.
 * Supports color-coded notes with CRUD operations.
 */

export const NOTES_SCREEN = {
    file: "src/screens/NotesScreen.tsx",
    size: "10870 bytes",
    responsibility: "Note management UI",
    features: [
        "Create new notes",
        "Edit existing notes",
        "Delete notes",
        "Color selection",
        "Pin important notes",
        "Category filtering"
    ]
};

/**
 * @screen VideoPlayerScreen
 * @file src/screens/VideoPlayerScreen.tsx
 * @description
 * 
 * Video playback for course content using expo-av.
 */

export const VIDEO_PLAYER_SCREEN = {
    file: "src/screens/VideoPlayerScreen.tsx",
    size: "9934 bytes",
    responsibility: "Video content playback",
    features: [
        "Video playback controls",
        "Progress tracking",
        "Fullscreen mode",
        "Playback speed control"
    ]
};

/**
 * @screen PDFViewerScreen
 * @file src/screens/PDFViewerScreen.tsx
 * @description
 * 
 * PDF document viewer for course materials.
 */

export const PDF_VIEWER_SCREEN = {
    file: "src/screens/PDFViewerScreen.tsx",
    size: "11666 bytes",
    responsibility: "PDF content viewing",
    features: [
        "PDF rendering",
        "Page navigation",
        "Zoom controls",
        "Page number display"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: CONTEXT PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Context Providers
 * @description
 * 
 * Context providers manage global application state that needs to be
 * accessible across multiple components without prop drilling.
 * 
 * Providers:
 * 1. AuthProvider - User authentication state
 * 2. LanguageProvider - Internationalization state
 */

/**
 * @context AuthContext
 * @file src/context/AuthContext.tsx
 * @description
 * 
 * The AuthContext manages user authentication state throughout the
 * application. It handles login, logout, and session persistence.
 * 
 * Context Value:
 * - user: Current authenticated user object or null
 * - login: Function to authenticate user
 * - logout: Function to sign out user
 * - loading: Boolean indicating auth state loading
 * 
 * Session Persistence:
 * - Uses AsyncStorage for session persistence
 * - Automatically restores session on app launch
 * - 1-second timeout failsafe for loading state
 */

export const AUTH_CONTEXT = {
    file: "src/context/AuthContext.tsx",
    size: "2847 bytes",
    purpose: "User authentication state management",
    contextValue: {
        user: "User | null - Current authenticated user",
        login: "(userData: any) => Promise<void> - Authenticate user",
        logout: "() => Promise<void> - Sign out user",
        loading: "boolean - Auth state loading indicator"
    },
    features: [
        "Session persistence with AsyncStorage",
        "Automatic session restoration on launch",
        "Loading state with timeout failsafe",
        "User validation before setting state"
    ],
    hook: "useAuth() - Access auth context values"
};

/**
 * @context LanguageContext
 * @file src/context/LanguageContext.tsx
 * @description
 * 
 * The LanguageContext manages internationalization (i18n) state.
 * It provides translation functions and language switching capability.
 * 
 * Supported Languages:
 * - Turkish (tr) - Default
 * - English (en)
 * - Japanese (jp)
 * 
 * Context Value:
 * - language: Current language code
 * - setLanguage: Function to change language
 * - t: Translation function
 */

export const LANGUAGE_CONTEXT = {
    file: "src/context/LanguageContext.tsx",
    purpose: "Internationalization state management",
    supportedLanguages: ["tr", "en", "jp"],
    defaultLanguage: "tr",
    contextValue: {
        language: "Language - Current language code",
        setLanguage: "(lang: Language) => void - Change language",
        t: "(key: string) => string - Get translated text"
    },
    features: [
        "Three language support",
        "Translation key lookup",
        "Language preference persistence",
        "Fallback to Turkish for missing keys"
    ],
    hook: "useLanguage() - Access language context values"
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: SERVICES LAYER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Services Layer
 * @description
 * 
 * The services layer handles all external communication, primarily
 * API calls to the backend server. It provides a clean abstraction
 * between the presentation layer and data sources.
 */

/**
 * @service ApiService
 * @file src/services/ApiService.ts
 * @description
 * 
 * The ApiService centralizes all API communication with the backend.
 * It uses axios for HTTP requests and provides methods for each
 * endpoint category.
 * 
 * Configuration:
 * - Base URL configured for production/development
 * - Axios interceptors for error handling
 * - Request/response logging in development
 * 
 * Endpoint Categories:
 * - Authentication (login, logout)
 * - Users (CRUD operations)
 * - Courses (listing, enrollment)
 * - Exams (listing, submission, results)
 * - Questions (CRUD operations)
 * - Notes (CRUD operations)
 * - Optical Processing (OMR)
 */

export const API_SERVICE = {
    file: "src/services/ApiService.ts",
    purpose: "Backend API communication layer",
    baseUrl: {
        production: "https://lms-project-production-0d23.up.railway.app",
        development: "http://localhost:3001"
    },
    methods: {
        authentication: [
            "login(email, password): Promise<LoginResponse>",
            "logout(): Promise<void>"
        ],
        users: [
            "getUsers(): Promise<User[]>",
            "getUserById(id): Promise<User>",
            "createUser(userData): Promise<User>",
            "updateUser(id, userData): Promise<User>",
            "deleteUser(id): Promise<void>"
        ],
        courses: [
            "getCourses(): Promise<Course[]>",
            "getInstructorCourses(instructorId): Promise<Course[]>",
            "getMyCourses(userId): Promise<Course[]>",
            "getCourseStudents(courseId): Promise<User[]>",
            "enrollInCourse(courseId, userId): Promise<void>"
        ],
        exams: [
            "getExams(): Promise<Exam[]>",
            "getCourseExams(courseId): Promise<Exam[]>",
            "getExamQuestions(examId): Promise<Question[]>",
            "submitExam(examId, answers): Promise<ExamResult>",
            "saveExamResult(examId, studentId, score): Promise<void>"
        ],
        notes: [
            "getNotes(userId): Promise<Note[]>",
            "createNote(noteData): Promise<Note>",
            "updateNote(id, noteData): Promise<Note>",
            "deleteNote(id): Promise<void>"
        ],
        grades: [
            "getStudentGrades(studentId): Promise<Grade[]>"
        ]
    },
    errorHandling: [
        "Network error detection",
        "Authentication error handling",
        "Server error mapping",
        "Timeout handling"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section UI Components
 * @description
 * 
 * Reusable UI components that provide consistent styling and behavior
 * across the application.
 */

/**
 * @component Header
 * @file src/components/Header.tsx
 * @description
 * 
 * Navigation header component used across all screens.
 * 
 * Features:
 * - Back button with callback
 * - Screen title display
 * - Consistent styling
 * - Safe area handling
 */

export const HEADER_COMPONENT = {
    file: "src/components/Header.tsx",
    purpose: "Screen navigation header",
    props: {
        title: "string - Screen title",
        onBack: "() => void - Back navigation handler"
    },
    features: [
        "Back button",
        "Title display",
        "Consistent styling",
        "Safe area compliance"
    ]
};

/**
 * @component OpticalSelection
 * @file src/components/optical/OpticalSelection.tsx
 * @description
 * 
 * Selection interface for optical reader workflow.
 * Allows selection of course, exam, and student.
 */

export const OPTICAL_SELECTION_COMPONENT = {
    file: "src/components/optical/OpticalSelection.tsx",
    purpose: "Course/Exam/Student selection for OMR",
    props: {
        courses: "Course[]",
        exams: "Exam[]",
        students: "User[]",
        selectedCourse: "Course | null",
        selectedExam: "Exam | null",
        selectedStudent: "User | null",
        onSelectCourse: "(course: Course) => void",
        onSelectExam: "(exam: Exam) => void",
        onSelectStudent: "(student: User) => void",
        onStartCamera: "() => void"
    }
};

/**
 * @component OpticalCamera
 * @file src/components/optical/OpticalCamera.tsx
 * @description
 * 
 * Camera interface for optical form scanning.
 * Includes alignment overlay and capture button.
 */

export const OPTICAL_CAMERA_COMPONENT = {
    file: "src/components/optical/OpticalCamera.tsx",
    purpose: "Camera interface for OMR scanning",
    props: {
        cameraRef: "RefObject<CameraView>",
        selectedStudent: "User",
        selectedExam: "Exam",
        onBack: "() => void",
        onCapture: "() => void",
        permission: "CameraPermission",
        requestPermission: "() => Promise<void>"
    },
    features: [
        "Camera preview",
        "Alignment overlay",
        "Capture button",
        "Permission handling"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: INTERNATIONALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Internationalization (i18n)
 * @description
 * 
 * The application supports three languages: Turkish, English, and Japanese.
 * Translations are managed through a central translations file and
 * accessed via the LanguageContext.
 * 
 * Translation Structure:
 * - Key-based translation lookup
 * - Fallback to default language (Turkish)
 * - Dynamic language switching
 * - Persistent language preference
 */

export const TRANSLATIONS = {
    file: "src/i18n/translations.ts",
    languages: {
        tr: {
            name: "Türkçe",
            flag: "🇹🇷",
            translations: 150
        },
        en: {
            name: "English",
            flag: "🇬🇧",
            translations: 150
        },
        jp: {
            name: "日本語",
            flag: "🇯🇵",
            translations: 150
        }
    },
    categories: [
        "common - Common UI elements",
        "auth - Authentication related",
        "navigation - Navigation labels",
        "courses - Course related",
        "exams - Exam related",
        "grades - Grade related",
        "settings - Settings related",
        "errors - Error messages",
        "optical - Optical reader related"
    ],
    sampleKeys: [
        "app_name",
        "login",
        "logout",
        "email",
        "password",
        "courses",
        "exams",
        "grades",
        "settings",
        "loading",
        "error",
        "success"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: SECURITY FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Security Features
 * @description
 * 
 * Security measures implemented in the mobile application.
 */

export const SECURITY_FEATURES = {
    authentication: {
        sessionManagement: "AsyncStorage with JSON serialization",
        sessionValidation: "Checks for required user properties",
        automaticLogout: "On session corruption or invalid data"
    },
    dataProtection: {
        secureStorage: "Sensitive data in AsyncStorage",
        noPlaintextPasswords: "Passwords never stored locally",
        sessionTokens: "Token-based authentication"
    },
    networkSecurity: {
        httpsOnly: "All API calls over HTTPS",
        errorHandling: "Secure error messages without sensitive data"
    },
    examSecurity: {
        timerEnforcement: "Server-validated exam duration",
        autoSubmit: "Automatic submission on timer expiry"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section API Integration
 * @description
 * 
 * Complete list of API endpoints used by the mobile application.
 */

export const API_ENDPOINTS = {
    base: {
        production: "https://lms-project-production-0d23.up.railway.app",
        development: "http://localhost:3001"
    },
    endpoints: {
        auth: {
            login: "POST /api/login",
            logout: "POST /api/logout"
        },
        users: {
            list: "GET /api/users",
            create: "POST /api/users",
            delete: "DELETE /api/users/:id"
        },
        courses: {
            list: "GET /api/courses",
            instructorCourses: "GET /api/instructor/:id/courses",
            myCourses: "GET /api/my-courses?userId=:id",
            students: "GET /api/courses/:id/students"
        },
        exams: {
            list: "GET /api/exams",
            courseExams: "GET /api/courses/:courseId/exams",
            questions: "GET /api/exams/:id/questions",
            submit: "POST /api/exams/:id/submit"
        },
        grades: {
            studentGrades: "GET /api/results?studentId=:id"
        },
        notes: {
            list: "GET /api/notes?userId=:id",
            create: "POST /api/notes",
            update: "PUT /api/notes/:id",
            delete: "DELETE /api/notes/:id"
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ALL DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export default {
    PROJECT_INFO,
    DIRECTORY_STRUCTURE,
    FEATURE_MATRIX,
    TECHNOLOGY_STACK,
    EXPO_MODULES,
    DEVELOPMENT_TOOLS,
    ARCHITECTURE,
    SOLID_PRINCIPLES,
    STATE_MANAGEMENT,
    LOGIN_SCREEN,
    STUDENT_DASHBOARD,
    INSTRUCTOR_DASHBOARD,
    ADMIN_DASHBOARD,
    OPTICAL_READER_SCREEN,
    TAKE_EXAM_SCREEN,
    COURSES_LIST_SCREEN,
    EXAMS_LIST_SCREEN,
    GRADES_LIST_SCREEN,
    NOTES_SCREEN,
    VIDEO_PLAYER_SCREEN,
    PDF_VIEWER_SCREEN,
    AUTH_CONTEXT,
    LANGUAGE_CONTEXT,
    API_SERVICE,
    HEADER_COMPONENT,
    OPTICAL_SELECTION_COMPONENT,
    OPTICAL_CAMERA_COMPONENT,
    TRANSLATIONS,
    SECURITY_FEATURES,
    API_ENDPOINTS
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * END OF MOBILE APPLICATION ABSTRACT
 * Total Lines: ~2000+
 * Last Updated: 2026-01-10
 * ═══════════════════════════════════════════════════════════════════════════════
 */
