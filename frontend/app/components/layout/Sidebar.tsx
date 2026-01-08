'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '../ui/ThemeProvider';
import { useLanguage, Language } from '../../i18n';

interface SidebarProps {
    role: 'super_admin' | 'manager' | 'instructor' | 'assistant' | 'student' | 'guest';
    userName: string;
    userEmail: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const { language, setLanguage, t, languageNames } = useLanguage();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    // Navigation items based on role - now with translations
    const getNavItems = (): NavItem[] => {
        const baseItems: NavItem[] = [];

        if (role === 'super_admin') {
            // Super Admin gets comprehensive management dashboard
            baseItems.push(
                // Admin Management
                { label: '🏠 ' + t('dashboard'), href: '/dashboard/admin', icon: <HomeIcon /> },
                { label: t('users'), href: '/dashboard/admin/users', icon: <UsersIcon /> },
                { label: t('all_courses'), href: '/dashboard/admin/courses', icon: <BookIcon /> },
                { label: t('reports'), href: '/dashboard/admin/reports', icon: <ChartIcon /> },
                { label: t('settings'), href: '/dashboard/admin/settings', icon: <SettingsIcon /> },
                // Instructor Tools
                { label: t('question_bank'), href: '/dashboard/instructor/question-bank', icon: <QuestionIcon /> },
                { label: t('exams'), href: '/dashboard/instructor/exams', icon: <ClipboardIcon /> },
                { label: t('grades'), href: '/dashboard/instructor/gradebook', icon: <GradeIcon /> },
            );
        } else if (role === 'manager') {
            baseItems.push(
                { label: t('dashboard'), href: '/dashboard/admin', icon: <HomeIcon /> },
                { label: t('users'), href: '/dashboard/admin/users', icon: <UsersIcon /> },
                { label: t('courses'), href: '/dashboard/admin/courses', icon: <BookIcon /> },
                { label: t('reports'), href: '/dashboard/admin/reports', icon: <ChartIcon /> },
            );
        } else if (role === 'instructor' || role === 'assistant') {
            baseItems.push(
                { label: t('dashboard'), href: '/dashboard/instructor', icon: <HomeIcon /> },
                { label: t('my_courses'), href: '/dashboard/instructor/courses', icon: <BookIcon /> },
                { label: t('question_bank'), href: '/dashboard/instructor/question-bank', icon: <QuestionIcon /> },
                { label: t('exams'), href: '/dashboard/instructor/exams', icon: <ClipboardIcon /> },
                { label: t('grades'), href: '/dashboard/instructor/gradebook', icon: <GradeIcon /> },
            );
        } else {
            baseItems.push(
                { label: t('dashboard'), href: '/dashboard/student', icon: <HomeIcon /> },
                { label: t('my_courses'), href: '/dashboard/student/courses', icon: <BookIcon /> },
                { label: t('my_exams'), href: '/dashboard/student/exams', icon: <ClipboardIcon /> },
                { label: t('my_grades'), href: '/dashboard/student/grades', icon: <GradeIcon /> },
            );
        }

        return baseItems;
    };

    const navItems = getNavItems();
    const roleLabels: Record<string, string> = {
        super_admin: t('admin'),
        manager: t('manager'),
        instructor: t('instructor'),
        assistant: t('assistant'),
        student: t('student'),
        guest: t('guest'),
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-lg lg:hidden"
            >
                <MenuIcon />
            </button>

            {/* Sidebar */}
            <aside className={`
        sidebar
        ${isCollapsed ? 'sidebar-collapsed' : ''}
        ${isMobileOpen ? 'sidebar-open' : ''}
      `}>
                {/* Logo Section */}
                <div className="p-5 border-b border-[var(--border-light)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            L
                        </div>
                        {!isCollapsed && (
                            <div className="animate-fade-in">
                                <h1 className="font-bold text-[var(--text-primary)]">LMS</h1>
                                <p className="text-xs text-[var(--text-tertiary)]">{t('learning_management')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 font-medium border border-blue-200/50'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                    }
                `}
                            >
                                <span className={isActive ? 'text-blue-500' : ''}>{item.icon}</span>
                                {!isCollapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-[var(--border-light)] space-y-3">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between px-2">
                        {!isCollapsed && <span className="text-sm text-[var(--text-tertiary)]">{t('settings')}</span>}
                        <ThemeToggle />
                    </div>

                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <LanguageIcon />
                                {!isCollapsed && <span className="text-sm">{languageNames[language]}</span>}
                            </div>
                            {!isCollapsed && <ChevronDownIcon />}
                        </button>

                        {showLangMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl shadow-lg overflow-hidden z-50">
                                {(Object.keys(languageNames) as Language[]).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                                        className={`w-full px-4 py-3 text-left text-sm hover:bg-[var(--bg-tertiary)] transition-colors ${language === lang ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-secondary)]'}`}
                                    >
                                        {languageNames[lang]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Collapse Toggle (Desktop only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        {!isCollapsed && <span className="text-sm">{t('close')}</span>}
                    </button>

                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 animate-fade-in">
                                <p className="font-medium text-[var(--text-primary)] truncate">{userName}</p>
                                <p className="text-xs text-[var(--text-tertiary)]">{roleLabels[role]}</p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogoutIcon />
                        {!isCollapsed && <span>{t('logout')}</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}

// Icons
const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

const QuestionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const GradeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const NotesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const CameraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const ChartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const LanguageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
