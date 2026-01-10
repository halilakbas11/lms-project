/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║                    LMS WEB FRONTEND - ABSTRACT                               ║
 * ║                    Comprehensive Project Documentation                       ║
 * ║                                                                              ║
 * ║  Project: Learning Management System (LMS)                                   ║
 * ║  Module: Web Frontend Application                                            ║
 * ║  Framework: Next.js 16 + React 19                                            ║
 * ║  Version: 1.0.0                                                              ║
 * ║  Last Updated: 2026-01-10                                                    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * This file serves as a comprehensive documentation and abstract for the
 * LMS Web Frontend Application. It contains detailed descriptions of all
 * pages, components, hooks, contexts, and architectural decisions.
 * 
 * TABLE OF CONTENTS:
 * ==================
 * 1. PROJECT OVERVIEW (Lines 30-250)
 * 2. TECHNOLOGY STACK (Lines 251-500)
 * 3. ARCHITECTURE & DESIGN PATTERNS (Lines 501-750)
 * 4. DASHBOARD PAGES (Lines 751-1200)
 * 5. AUTHENTICATION SYSTEM (Lines 1201-1400)
 * 6. COMPONENT LIBRARY (Lines 1401-1700)
 * 7. INTERNATIONALIZATION (Lines 1701-1850)
 * 8. STYLING SYSTEM (Lines 1851-2000)
 * 9. API INTEGRATION (Lines 2001-2150)
 * 10. SECURITY FEATURES (Lines 2151-2300)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: PROJECT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Project Overview
 * @description
 * 
 * The LMS Web Frontend is a modern, responsive web application built using
 * Next.js 16 and React 19. It provides a comprehensive interface for
 * students, instructors, administrators, and other roles to interact
 * with the Learning Management System.
 * 
 * Key Features:
 * - Role-based dashboard system (6 different roles)
 * - Course management and enrollment
 * - Exam creation, management, and taking
 * - Safe Exam Browser (SEB) integration
 * - Real-time proctoring with webcam capture
 * - Grade management and reporting
 * - Multi-language support (TR, EN, JP)
 * - Dark/Light theme support
 * - Responsive design for all devices
 * - Google OAuth authentication
 * - Firebase integration
 * 
 * Deployment:
 * - Frontend: Vercel (https://lms-project-zeta-one.vercel.app)
 * - Backend: Railway (https://lms-project-production-0d23.up.railway.app)
 * 
 * Browser Support:
 * - Chrome 90+
 * - Firefox 88+
 * - Safari 14+
 * - Edge 90+
 */

export const PROJECT_INFO = {
    name: "LMS Web Frontend",
    version: "1.0.0",
    description: "Modern web application for Learning Management System",
    framework: "Next.js 16 + React 19 + TypeScript",
    deployment: {
        frontend: "https://lms-project-zeta-one.vercel.app",
        backend: "https://lms-project-production-0d23.up.railway.app"
    },
    developmentDate: "2025-2026",
    author: "LMS Development Team",
    license: "MIT"
};

/**
 * @subsection Directory Structure
 * @description
 * 
 * The frontend follows Next.js App Router conventions:
 * 
 * frontend/
 * ├── app/                           # App Router pages
 * │   ├── components/                # Shared components
 * │   │   ├── course/               # Course-related components
 * │   │   ├── layout/               # Layout components (Sidebar, Header)
 * │   │   ├── questions/            # Question type components
 * │   │   └── ui/                   # UI components (Card, Button, etc.)
 * │   ├── dashboard/                # Dashboard pages by role
 * │   │   ├── admin/                # Admin dashboard pages
 * │   │   ├── assistant/            # Assistant dashboard pages
 * │   │   ├── guest/                # Guest dashboard pages
 * │   │   ├── instructor/           # Instructor dashboard pages
 * │   │   ├── manager/              # Manager dashboard pages
 * │   │   └── student/              # Student dashboard pages
 * │   ├── exam/                     # Exam-related pages
 * │   │   └── [id]/                # Dynamic exam page
 * │   ├── hooks/                    # Custom React hooks
 * │   ├── i18n/                     # Internationalization
 * │   ├── settings/                 # Settings pages
 * │   ├── firebase.ts              # Firebase configuration
 * │   ├── globals.css              # Global styles
 * │   ├── layout.tsx               # Root layout
 * │   └── page.tsx                 # Login page (root)
 * ├── public/                       # Static assets
 * ├── next.config.ts               # Next.js configuration
 * ├── package.json                 # Dependencies
 * └── tsconfig.json                # TypeScript configuration
 */

export const DIRECTORY_STRUCTURE = {
    root: "frontend/",
    appDirectory: {
        path: "app/",
        contents: {
            components: {
                course: "Course-related reusable components",
                layout: "Layout components - Sidebar, DashboardLayout",
                questions: "Question type renderers",
                ui: "Base UI components - Card, Button, Modal, etc."
            },
            dashboard: {
                admin: "Super Admin dashboard - Users, Courses, Reports, Settings",
                assistant: "Assistant dashboard - Limited access",
                guest: "Guest dashboard - View only access",
                instructor: "Instructor dashboard - Courses, Exams, Students",
                manager: "Manager dashboard - Reports and analytics",
                student: "Student dashboard - Courses, Exams, Grades"
            },
            exam: "Exam taking interface with SEB support",
            hooks: "Custom hooks - useTheme, useSidebar",
            i18n: "Translation files and LanguageContext",
            settings: "User settings pages"
        }
    },
    configuration: [
        "next.config.ts - Next.js and API rewrites",
        "package.json - Dependencies and scripts",
        "tsconfig.json - TypeScript configuration",
        "postcss.config.mjs - PostCSS for Tailwind"
    ]
};

/**
 * @subsection Role-Based Access Control
 * @description
 * 
 * The application implements a comprehensive role-based access system:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Role          │ Access Level    │ Capabilities                         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ super_admin   │ Full Access     │ All features, system settings        │
 * │ manager       │ Management      │ Reports, user management, courses    │
 * │ instructor    │ Teaching        │ Course content, exams, grades        │
 * │ assistant     │ Limited Edit    │ Course assistance, limited grading   │
 * │ student       │ Learning        │ Enrolled courses, exams, grades      │
 * │ guest         │ View Only       │ Public course preview                │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export const ROLE_SYSTEM = {
    roles: {
        super_admin: {
            level: 6,
            dashboard: "/dashboard/admin",
            capabilities: [
                "Full system access",
                "User management (CRUD)",
                "Course management (CRUD)",
                "System settings",
                "Reports and analytics",
                "All instructor capabilities"
            ]
        },
        manager: {
            level: 5,
            dashboard: "/dashboard/manager",
            capabilities: [
                "User management (limited)",
                "Course management",
                "Reports and analytics",
                "View all grades"
            ]
        },
        instructor: {
            level: 4,
            dashboard: "/dashboard/instructor",
            capabilities: [
                "Course content management",
                "Exam creation and management",
                "Question bank management",
                "Student grade management",
                "Optical form processing",
                "SEB configuration"
            ]
        },
        assistant: {
            level: 3,
            dashboard: "/dashboard/assistant",
            capabilities: [
                "Course content viewing",
                "Limited exam assistance",
                "Student question handling"
            ]
        },
        student: {
            level: 2,
            dashboard: "/dashboard/student",
            capabilities: [
                "View enrolled courses",
                "Take exams",
                "View grades",
                "Request course enrollment",
                "Personal notes"
            ]
        },
        guest: {
            level: 1,
            dashboard: "/dashboard/guest",
            capabilities: [
                "View public courses",
                "Browse catalog"
            ]
        }
    }
};

/**
 * @subsection Feature Matrix
 * @description
 * 
 * Complete feature implementation status:
 */

export const FEATURE_MATRIX = {
    authentication: {
        emailPassword: { status: "✅", description: "Email/password login" },
        googleOAuth: { status: "✅", description: "Google sign-in with Firebase" },
        sessionPersistence: { status: "✅", description: "LocalStorage session" },
        roleBasedRedirect: { status: "✅", description: "Redirect by user role" }
    },
    courseManagement: {
        courseListing: { status: "✅", description: "View all courses" },
        courseCreation: { status: "✅", description: "Create new courses" },
        courseEditing: { status: "✅", description: "Edit course details" },
        courseDeletion: { status: "✅", description: "Delete courses" },
        moduleManagement: { status: "✅", description: "Add/edit/delete modules" },
        studentEnrollment: { status: "✅", description: "Manage enrollments" }
    },
    examSystem: {
        examCreation: { status: "✅", description: "Create exams with questions" },
        questionBank: { status: "✅", description: "Reusable question pool" },
        multipleQuestionTypes: { status: "✅", description: "12 question types" },
        timedExams: { status: "✅", description: "Countdown timer" },
        autoGrading: { status: "✅", description: "Automatic scoring" },
        sebIntegration: { status: "✅", description: "Safe Exam Browser" },
        proctoring: { status: "✅", description: "Webcam monitoring" }
    },
    gradeManagement: {
        gradeViewing: { status: "✅", description: "View student grades" },
        gradeEditing: { status: "✅", description: "Edit grades" },
        gradeExport: { status: "🔄", description: "Export to CSV/PDF" }
    },
    userInterface: {
        darkTheme: { status: "✅", description: "Dark mode support" },
        lightTheme: { status: "✅", description: "Light mode support" },
        responsive: { status: "✅", description: "Mobile-friendly" },
        multiLanguage: { status: "✅", description: "TR/EN/JP" }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: TECHNOLOGY STACK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Technology Stack
 * @description
 * 
 * Modern, production-ready technology choices:
 * 
 * Core Framework: Next.js 16
 * - App Router for modern routing
 * - Server and Client Components
 * - API Routes for backend proxy
 * - Built-in optimizations
 * 
 * UI Framework: React 19
 * - Latest React features
 * - Concurrent rendering
 * - Automatic batching
 * - Transitions API
 * 
 * Styling: Tailwind CSS 4
 * - Utility-first CSS
 * - Custom design system
 * - Dark mode support
 * - Responsive utilities
 * 
 * Type Safety: TypeScript 5
 * - Static type checking
 * - Enhanced IDE support
 * - Better refactoring
 */

export const TECHNOLOGY_STACK = {
    core: {
        nextjs: {
            version: "16.1.1",
            description: "React framework with App Router",
            features: [
                "App Router (file-based routing)",
                "Server Components",
                "Client Components",
                "API Routes",
                "Image optimization",
                "Font optimization"
            ]
        },
        react: {
            version: "19.2.3",
            description: "UI component library",
            features: [
                "Hooks API",
                "Context API",
                "Concurrent features",
                "Automatic batching"
            ]
        },
        typescript: {
            version: "5.x",
            description: "Type-safe JavaScript",
            features: [
                "Static typing",
                "Interface definitions",
                "Generic types",
                "Type inference"
            ]
        }
    },
    styling: {
        tailwindcss: {
            version: "4.x",
            description: "Utility-first CSS framework",
            features: [
                "Utility classes",
                "Custom theming",
                "Dark mode",
                "Responsive design"
            ]
        },
        postcss: {
            version: "latest",
            description: "CSS transformation tool",
            plugins: ["@tailwindcss/postcss"]
        }
    },
    authentication: {
        firebase: {
            version: "12.7.0",
            description: "Google OAuth provider",
            features: [
                "Google Sign-In",
                "Auth state management",
                "Secure tokens"
            ]
        }
    },
    networking: {
        axios: {
            version: "1.13.2",
            description: "HTTP client",
            features: [
                "Promise-based",
                "Request/response interceptors",
                "Automatic transforms"
            ]
        }
    },
    media: {
        reactWebcam: {
            version: "7.2.0",
            description: "Webcam access for proctoring",
            features: [
                "Camera capture",
                "Screenshot functionality",
                "Multiple camera support"
            ]
        }
    },
    devDependencies: {
        eslint: "9.x - Code linting",
        eslintConfigNext: "16.1.1 - Next.js ESLint rules",
        typesReact: "19.x - React type definitions",
        typesNode: "20.x - Node.js type definitions"
    }
};

/**
 * @subsection Next.js Configuration
 * @description
 * 
 * Custom Next.js configuration for API proxying and optimization:
 */

export const NEXTJS_CONFIG = {
    file: "next.config.ts",
    purpose: "Next.js configuration with API rewrites",
    configuration: {
        rewrites: {
            purpose: "Proxy API calls to backend",
            rules: [
                {
                    source: "/api/:path*",
                    destination: "https://lms-project-production-0d23.up.railway.app/api/:path*"
                }
            ]
        },
        images: {
            domains: ["lh3.googleusercontent.com"],
            purpose: "Allow Google profile images"
        }
    }
};

/**
 * @subsection Firebase Configuration
 * @description
 * 
 * Firebase setup for Google OAuth authentication:
 */

export const FIREBASE_CONFIG = {
    file: "app/firebase.ts",
    purpose: "Firebase initialization for Google OAuth",
    configuration: {
        apiKey: "Firebase API key",
        authDomain: "lms-project-xxxxx.firebaseapp.com",
        projectId: "lms-project-xxxxx",
        storageBucket: "lms-project-xxxxx.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:xxxxx"
    },
    exports: {
        auth: "Firebase Auth instance",
        googleProvider: "GoogleAuthProvider instance"
    },
    usage: `
        import { auth, googleProvider } from './firebase';
        import { signInWithPopup } from 'firebase/auth';
        
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user.email;
    `
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: ARCHITECTURE & DESIGN PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Architecture & Design Patterns
 * @description
 * 
 * The frontend follows modern React architecture patterns:
 * 
 * Component Architecture:
 * - Atomic Design principles (atoms, molecules, organisms)
 * - Container/Presentational pattern
 * - Composition over inheritance
 * 
 * State Management:
 * - React Context for global state
 * - Local state with useState
 * - URL state for navigation
 * 
 * Data Flow:
 * - Unidirectional data flow
 * - Props drilling minimized with Context
 * - API calls centralized
 */

export const ARCHITECTURE = {
    patterns: {
        componentArchitecture: {
            type: "Atomic Design",
            levels: {
                atoms: "Basic UI elements (Button, Input, Badge)",
                molecules: "Composite components (Card, Modal)",
                organisms: "Complex components (Sidebar, DataTable)",
                templates: "Page layouts (DashboardLayout)",
                pages: "Full pages (Dashboard, Settings)"
            }
        },
        stateManagement: {
            global: {
                tool: "React Context",
                contexts: ["LanguageContext", "ThemeContext"]
            },
            local: {
                tool: "useState/useReducer",
                usage: "Component-specific state"
            },
            server: {
                tool: "URL parameters",
                usage: "Navigation state"
            }
        },
        dataFlow: {
            pattern: "Unidirectional",
            description: "Data flows down, events flow up"
        }
    },
    folderOrganization: {
        byFeature: true,
        byRole: true,
        shared: "app/components/"
    }
};

/**
 * @subsection Component Composition
 * @description
 * 
 * Components are composed following best practices:
 * 
 * 1. Small, focused components
 * 2. Props for customization
 * 3. Children for flexibility
 * 4. Hooks for logic extraction
 */

export const COMPONENT_PATTERNS = {
    composition: {
        example: `
            // Composable Card component
            <Card>
                <Card.Header>
                    <Card.Title>Title</Card.Title>
                </Card.Header>
                <Card.Body>
                    Content here
                </Card.Body>
                <Card.Footer>
                    <Button>Action</Button>
                </Card.Footer>
            </Card>
        `
    },
    customHooks: {
        useTheme: "Theme switching logic",
        useLanguage: "Translation and language switching",
        useSidebar: "Sidebar collapse state"
    },
    contextProviders: {
        ThemeProvider: "Dark/light theme management",
        LanguageProvider: "i18n translation provider"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: DASHBOARD PAGES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Dashboard Pages
 * @description
 * 
 * Each role has a dedicated dashboard with role-specific pages:
 */

/**
 * @dashboard Admin Dashboard
 * @path /dashboard/admin
 * @description
 * 
 * Super Admin dashboard with full system access.
 * 
 * Pages:
 * - /dashboard/admin (Main dashboard with stats)
 * - /dashboard/admin/users (User management)
 * - /dashboard/admin/courses (Course management)
 * - /dashboard/admin/reports (System reports)
 * - /dashboard/admin/settings (System settings)
 */

export const ADMIN_DASHBOARD = {
    basePath: "/dashboard/admin",
    pages: {
        main: {
            path: "/dashboard/admin",
            file: "app/dashboard/admin/page.tsx",
            description: "Admin overview with statistics",
            features: [
                "Total users count",
                "Total courses count",
                "Active exams count",
                "Quick action cards",
                "Recent activity feed"
            ]
        },
        users: {
            path: "/dashboard/admin/users",
            file: "app/dashboard/admin/users/page.tsx",
            description: "User management interface",
            features: [
                "User listing with pagination",
                "Create new user",
                "Edit user details",
                "Delete user (with safety check)",
                "Role assignment",
                "Search and filter"
            ]
        },
        courses: {
            path: "/dashboard/admin/courses",
            file: "app/dashboard/admin/courses/page.tsx",
            description: "Course administration",
            features: [
                "All courses listing",
                "Create/edit courses",
                "Assign instructors",
                "View enrollments"
            ]
        },
        reports: {
            path: "/dashboard/admin/reports",
            file: "app/dashboard/admin/reports/page.tsx",
            description: "System-wide reports",
            features: [
                "User statistics",
                "Course statistics",
                "Exam analytics",
                "Export capabilities"
            ]
        },
        settings: {
            path: "/dashboard/admin/settings",
            file: "app/dashboard/admin/settings/page.tsx",
            description: "System configuration",
            features: [
                "System settings",
                "Email configuration",
                "Security settings",
                "Backup options"
            ]
        }
    }
};

/**
 * @dashboard Instructor Dashboard
 * @path /dashboard/instructor
 * @description
 * 
 * Instructor dashboard for teaching and grading.
 */

export const INSTRUCTOR_DASHBOARD = {
    basePath: "/dashboard/instructor",
    pages: {
        main: {
            path: "/dashboard/instructor",
            file: "app/dashboard/instructor/page.tsx",
            description: "Instructor overview",
            features: [
                "My courses summary",
                "Upcoming exams",
                "Recent submissions",
                "Quick actions"
            ]
        },
        courses: {
            path: "/dashboard/instructor/courses",
            file: "app/dashboard/instructor/courses/page.tsx",
            description: "Course management",
            features: [
                "My courses listing",
                "Create new course",
                "Course statistics",
                "Student count per course"
            ]
        },
        courseDetail: {
            path: "/dashboard/instructor/courses/[id]",
            file: "app/dashboard/instructor/courses/[id]/page.tsx",
            description: "Single course management",
            features: [
                "Course details editing",
                "Module management (CRUD)",
                "Student list",
                "Remove student from course"
            ]
        },
        exams: {
            path: "/dashboard/instructor/exams",
            file: "app/dashboard/instructor/exams/page.tsx",
            description: "Exam management",
            features: [
                "All exams listing",
                "Create new exam",
                "Edit exam settings",
                "View exam results"
            ]
        },
        examEdit: {
            path: "/dashboard/instructor/exams/[id]/edit",
            file: "app/dashboard/instructor/exams/[id]/edit/page.tsx",
            description: "Exam editing with questions",
            features: [
                "Exam details editing",
                "SEB configuration",
                "Question management",
                "Add questions from bank",
                "Add demo questions"
            ]
        },
        questionBank: {
            path: "/dashboard/instructor/question-bank",
            file: "app/dashboard/instructor/question-bank/page.tsx",
            description: "Question bank management",
            features: [
                "All questions listing",
                "Create new question",
                "Edit questions",
                "Filter by category/difficulty",
                "12 question types support"
            ]
        },
        accessRequests: {
            path: "/dashboard/instructor/access-requests",
            file: "app/dashboard/instructor/access-requests/page.tsx",
            description: "Course enrollment requests",
            features: [
                "Pending requests list",
                "Approve/reject requests",
                "Request history"
            ]
        }
    }
};

/**
 * @dashboard Student Dashboard
 * @path /dashboard/student
 * @description
 * 
 * Student dashboard for learning activities.
 */

export const STUDENT_DASHBOARD = {
    basePath: "/dashboard/student",
    pages: {
        main: {
            path: "/dashboard/student",
            file: "app/dashboard/student/page.tsx",
            description: "Student overview",
            features: [
                "Enrolled courses",
                "Upcoming exams",
                "Recent grades",
                "Progress overview"
            ]
        },
        courses: {
            path: "/dashboard/student/courses",
            file: "app/dashboard/student/courses/page.tsx",
            description: "My enrolled courses",
            features: [
                "Course listing",
                "Course content access",
                "Progress tracking"
            ]
        },
        courseDetail: {
            path: "/dashboard/student/[id]",
            file: "app/dashboard/student/[id]/page.tsx",
            description: "Course content viewing",
            features: [
                "Module listing",
                "Content viewing (video, PDF, text)",
                "Progress tracking"
            ]
        },
        exams: {
            path: "/dashboard/student/exams",
            file: "app/dashboard/student/exams/page.tsx",
            description: "Available exams",
            features: [
                "Exam listing",
                "Start exam",
                "View past results"
            ]
        },
        grades: {
            path: "/dashboard/student/grades",
            file: "app/dashboard/student/grades/page.tsx",
            description: "Grade overview",
            features: [
                "Grade listing by exam",
                "Score display",
                "Date information"
            ]
        },
        availableCourses: {
            path: "/dashboard/student/available-courses",
            file: "app/dashboard/student/available-courses/page.tsx",
            description: "Course enrollment",
            features: [
                "Browse available courses",
                "Request enrollment",
                "View request status"
            ]
        }
    }
};

/**
 * @page Exam Taking Page
 * @path /exam/[id]
 * @description
 * 
 * Secure exam taking interface with proctoring support.
 */

export const EXAM_PAGE = {
    path: "/exam/[id]",
    file: "app/exam/[id]/page.tsx",
    description: "Exam taking interface",
    features: {
        timer: {
            description: "Countdown timer",
            autoSubmit: "Submits when timer expires"
        },
        questions: {
            types: [
                "multiple_choice",
                "multiple_selection",
                "true_false",
                "matching",
                "ordering",
                "fill_blank",
                "short_answer",
                "long_answer",
                "file_upload",
                "calculation",
                "hotspot",
                "code_execution"
            ]
        },
        navigation: {
            description: "Question navigation",
            features: ["Previous/Next", "Jump to question", "Flag question"]
        },
        proctoring: {
            webcam: "Periodic webcam capture",
            eventLogging: "Tab switch detection",
            sebSupport: "Safe Exam Browser integration"
        },
        submission: {
            manual: "Submit button",
            automatic: "Timer expiry",
            confirmation: "Submit confirmation dialog"
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: AUTHENTICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Authentication System
 * @description
 * 
 * The application supports two authentication methods:
 * 
 * 1. Email/Password Authentication
 *    - Traditional form-based login
 *    - Password validation on backend
 *    - Session stored in localStorage
 * 
 * 2. Google OAuth (Firebase)
 *    - Google Sign-In popup
 *    - User auto-created if not exists
 *    - Same session management
 */

export const AUTHENTICATION_SYSTEM = {
    loginPage: {
        path: "/",
        file: "app/page.tsx",
        description: "Main login page",
        methods: {
            emailPassword: {
                endpoint: "POST /api/login",
                payload: "{ email, password }",
                response: "{ success: boolean, user: User }"
            },
            googleOAuth: {
                provider: "Firebase GoogleAuthProvider",
                endpoint: "POST /api/login",
                payload: "{ email, provider: 'google' }"
            }
        }
    },
    sessionManagement: {
        storage: "localStorage",
        key: "user",
        data: "Serialized user object with role",
        expiry: "None (persistent until logout)"
    },
    roleBasedRedirect: {
        super_admin: "/dashboard/admin",
        manager: "/dashboard/admin",
        instructor: "/dashboard/instructor",
        assistant: "/dashboard/assistant",
        student: "/dashboard/student",
        guest: "/dashboard/guest"
    },
    logout: {
        action: "Remove user from localStorage",
        redirect: "/ (login page)"
    }
};

/**
 * @subsection Login Flow
 * @description
 * 
 * Step-by-step login process:
 * 
 * 1. User enters email and password
 * 2. Form validation (required fields)
 * 3. API call to /api/login
 * 4. On success: Store user in localStorage
 * 5. Redirect based on user role
 * 6. On failure: Show error message
 */

export const LOGIN_FLOW = {
    steps: [
        "1. User visits / (login page)",
        "2. User enters credentials or clicks Google login",
        "3. Form submission triggers handleLogin/handleGoogleLogin",
        "4. API call to POST /api/login with credentials",
        "5. Backend validates credentials",
        "6. On success: User object returned",
        "7. User stored in localStorage",
        "8. Router.push() to appropriate dashboard",
        "9. Dashboard loads user from localStorage"
    ],
    errorHandling: {
        invalidCredentials: "Display error message under form",
        networkError: "Display connection error",
        googleAuthError: "Display Google sign-in error"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: COMPONENT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Component Library
 * @description
 * 
 * Reusable UI components following consistent design patterns.
 */

/**
 * @component Card
 * @file app/components/ui/Card.tsx
 */

export const CARD_COMPONENT = {
    file: "app/components/ui/Card.tsx",
    description: "Container component for content sections",
    props: {
        children: "React.ReactNode",
        className: "string (optional)",
        hover: "boolean (optional) - Enable hover effect"
    },
    usage: `
        <Card hover>
            <h3>Card Title</h3>
            <p>Card content goes here</p>
        </Card>
    `,
    styles: {
        base: "bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6",
        hover: "hover:border-[var(--border-dark)]"
    }
};

/**
 * @component Sidebar
 * @file app/components/layout/Sidebar.tsx
 */

export const SIDEBAR_COMPONENT = {
    file: "app/components/layout/Sidebar.tsx",
    description: "Navigation sidebar with role-based menu items",
    props: {
        user: "User object with role",
        onNavigate: "Navigation handler",
        onLogout: "Logout handler"
    },
    features: [
        "Role-based menu generation",
        "Active item highlighting",
        "Collapsible state",
        "Theme toggle",
        "Language switcher",
        "User info display",
        "Logout button"
    ],
    menuItems: {
        student: ["Dashboard", "My Courses", "Exams", "Grades", "Available Courses", "Notes"],
        instructor: ["Dashboard", "My Courses", "Exams", "Question Bank", "Access Requests"],
        admin: ["Dashboard", "Users", "Courses", "Reports", "Settings"]
    }
};

/**
 * @component DashboardLayout
 * @file app/components/layout/DashboardLayout.tsx
 */

export const DASHBOARD_LAYOUT = {
    file: "app/components/layout/DashboardLayout.tsx",
    description: "Wrapper layout for all dashboard pages",
    structure: {
        sidebar: "Fixed left sidebar",
        mainContent: "Scrollable main content area with margin"
    },
    responsibility: [
        "Authentication check",
        "Sidebar rendering",
        "Main content wrapper",
        "Responsive behavior"
    ]
};

/**
 * @component ThemeProvider
 * @file app/components/ui/ThemeProvider.tsx
 */

export const THEME_PROVIDER = {
    file: "app/components/ui/ThemeProvider.tsx",
    description: "Theme context provider for dark/light mode",
    features: [
        "Theme state management",
        "LocalStorage persistence",
        "System preference detection",
        "Toggle function"
    ],
    contextValue: {
        theme: "'light' | 'dark'",
        toggleTheme: "() => void"
    }
};

/**
 * @component Question Type Renderers
 * @directory app/components/questions/
 */

export const QUESTION_COMPONENTS = {
    directory: "app/components/questions/",
    types: {
        MultipleChoice: {
            description: "Single selection from options",
            autoGradable: true
        },
        MultipleSelection: {
            description: "Multiple selections allowed",
            autoGradable: true
        },
        TrueFalse: {
            description: "True or false selection",
            autoGradable: true
        },
        Matching: {
            description: "Match items from two columns",
            autoGradable: true
        },
        Ordering: {
            description: "Arrange items in correct order",
            autoGradable: true
        },
        FillBlank: {
            description: "Fill in the blank text",
            autoGradable: true
        },
        ShortAnswer: {
            description: "Short text response",
            autoGradable: "partial"
        },
        LongAnswer: {
            description: "Essay-style response",
            autoGradable: false
        },
        FileUpload: {
            description: "Upload file as answer",
            autoGradable: false
        },
        Calculation: {
            description: "Numeric calculation",
            autoGradable: true
        },
        Hotspot: {
            description: "Click on image area",
            autoGradable: true
        },
        CodeExecution: {
            description: "Write and run code",
            autoGradable: true
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: INTERNATIONALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Internationalization (i18n)
 * @description
 * 
 * Three-language support with context-based translation system.
 */

export const I18N_SYSTEM = {
    directory: "app/i18n/",
    files: {
        index: "Export point for LanguageProvider and hook",
        LanguageContext: "Context provider and useLanguage hook",
        translations: "Translation dictionaries for all languages"
    },
    supportedLanguages: {
        tr: { name: "Türkçe", flag: "🇹🇷" },
        en: { name: "English", flag: "🇬🇧" },
        jp: { name: "日本語", flag: "🇯🇵" }
    },
    usage: `
        const { t, language, setLanguage, languageNames } = useLanguage();
        
        // Get translation
        <h1>{t('welcome')}</h1>
        
        // Change language
        <button onClick={() => setLanguage('en')}>English</button>
    `,
    translationCategories: [
        "common - Common UI strings",
        "auth - Authentication related",
        "nav - Navigation labels",
        "courses - Course related",
        "exams - Exam related",
        "errors - Error messages",
        "success - Success messages"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: STYLING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Styling System
 * @description
 * 
 * CSS variables and Tailwind utilities for consistent styling.
 */

export const STYLING_SYSTEM = {
    file: "app/globals.css",
    approach: "CSS Variables + Tailwind CSS",
    themes: {
        light: {
            "--bg": "#ffffff",
            "--bg-secondary": "#f9fafb",
            "--bg-card": "#ffffff",
            "--text": "#111827",
            "--text-secondary": "#6b7280",
            "--border": "#e5e7eb",
            "--primary": "#2563eb"
        },
        dark: {
            "--bg": "#111827",
            "--bg-secondary": "#1f2937",
            "--bg-card": "#1f2937",
            "--text": "#f9fafb",
            "--text-secondary": "#d1d5db",
            "--border": "#374151",
            "--primary": "#2563eb"
        }
    },
    utilityClasses: {
        card: "Background, border, padding, rounded corners",
        btn: "Button base with variants (primary, secondary, ghost, danger)",
        input: "Form input styling with focus states",
        badge: "Small label styling with color variants",
        sidebar: "Fixed sidebar with responsive behavior",
        table: "Table styling with hover effects"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section API Integration
 * @description
 * 
 * All API calls proxied through Next.js rewrites to backend.
 */

export const API_INTEGRATION = {
    proxy: {
        source: "/api/:path*",
        destination: "https://lms-project-production-0d23.up.railway.app/api/:path*"
    },
    endpoints: {
        authentication: {
            login: "POST /api/login"
        },
        users: {
            list: "GET /api/users",
            create: "POST /api/users",
            delete: "DELETE /api/users/:id"
        },
        courses: {
            list: "GET /api/courses",
            create: "POST /api/courses",
            update: "PUT /api/courses/:id",
            delete: "DELETE /api/courses/:id",
            instructorCourses: "GET /api/instructor/:id/courses",
            students: "GET /api/courses/:id/students",
            modules: "GET /api/courses/:id/modules"
        },
        exams: {
            list: "GET /api/exams",
            courseExams: "GET /api/courses/:id/exams",
            create: "POST /api/exams",
            update: "PUT /api/exams/:id",
            delete: "DELETE /api/exams/:id",
            questions: "GET /api/exams/:id/questions",
            submit: "POST /api/exams/:id/submit",
            sebConfig: "GET /api/exams/:id/seb-config"
        },
        questions: {
            list: "GET /api/questions",
            create: "POST /api/questions"
        },
        accessRequests: {
            list: "GET /api/access-requests",
            create: "POST /api/courses/:id/request-access",
            respond: "PUT /api/access-requests/:id/respond"
        },
        proctoring: {
            log: "POST /api/exams/log"
        },
        grades: {
            studentResults: "GET /api/results?studentId=:id"
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: SECURITY FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @section Security Features
 * @description
 * 
 * Security measures implemented in the frontend.
 */

export const SECURITY_FEATURES = {
    authentication: {
        oauth: "Google OAuth via Firebase for secure sign-in",
        sessionStorage: "User data in localStorage (not sensitive data)",
        roleValidation: "Role checked before accessing protected routes"
    },
    examSecurity: {
        sebIntegration: {
            description: "Safe Exam Browser configuration",
            features: [
                "Kiosk mode enforcement",
                "URL filtering",
                "Keyboard restriction",
                "Clipboard blocking",
                "Screenshot prevention"
            ]
        },
        proctoring: {
            description: "Real-time monitoring",
            features: [
                "Webcam capture every 30 seconds",
                "Tab visibility detection",
                "Window focus detection",
                "Event logging to backend"
            ]
        }
    },
    dataValidation: {
        formValidation: "Required field checking",
        sanitization: "Input sanitization before API calls"
    },
    networkSecurity: {
        httpsOnly: "All API calls over HTTPS",
        corsConfig: "Proper CORS headers on backend"
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ALL DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export default {
    PROJECT_INFO,
    DIRECTORY_STRUCTURE,
    ROLE_SYSTEM,
    FEATURE_MATRIX,
    TECHNOLOGY_STACK,
    NEXTJS_CONFIG,
    FIREBASE_CONFIG,
    ARCHITECTURE,
    COMPONENT_PATTERNS,
    ADMIN_DASHBOARD,
    INSTRUCTOR_DASHBOARD,
    STUDENT_DASHBOARD,
    EXAM_PAGE,
    AUTHENTICATION_SYSTEM,
    LOGIN_FLOW,
    CARD_COMPONENT,
    SIDEBAR_COMPONENT,
    DASHBOARD_LAYOUT,
    THEME_PROVIDER,
    QUESTION_COMPONENTS,
    I18N_SYSTEM,
    STYLING_SYSTEM,
    API_INTEGRATION,
    SECURITY_FEATURES
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * END OF WEB FRONTEND ABSTRACT
 * ═══════════════════════════════════════════════════════════════════════════════
 */
