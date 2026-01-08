'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useLanguage } from '../../i18n/LanguageContext';

interface DashboardLayoutProps {
    children: ReactNode;
    requiredRoles?: string[];
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'manager' | 'instructor' | 'assistant' | 'student' | 'guest';
}

export default function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
    const { t } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }

        const userData = JSON.parse(storedUser) as User;

        // Check role permission
        if (requiredRoles && !requiredRoles.includes(userData.role)) {
            router.push('/');
            return;
        }

        setUser(userData);
        setLoading(false);
    }, [router, requiredRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--text-secondary)]">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <Sidebar
                role={user.role}
                userName={user.name}
                userEmail={user.email}
            />

            <main className="main-content">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Page Header Component
export function PageHeader({
    title,
    description,
    actions
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
                {description && (
                    <p className="mt-1 text-[var(--text-secondary)]">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}

// Stats Card Component
export function StatsCard({
    title,
    value,
    icon,
    trend,
    trendLabel,
    className = ''
}: {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendLabel?: string;
    className?: string;
}) {
    const trendColors = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-[var(--text-tertiary)]',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <div className={`card p-6 ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">{title}</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
                    {trend && trendLabel && (
                        <p className={`text-sm mt-2 ${trendColors[trend]}`}>
                            {trendIcons[trend]} {trendLabel}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-500">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

// Empty State Component
export function EmptyState({
    title,
    description,
    icon,
    action
}: {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>
            {action}
        </div>
    );
}
