'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout, PageHeader, StatsCard } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Stats {
    totalUsers: number;
    totalCourses: number;
    totalExams: number;
    usersByRole: Record<string, number>;
    recentActivity: { date: string; action: string; user: string }[];
}

export default function AdminReportsPage() {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalCourses: 0,
        totalExams: 0,
        usersByRole: {},
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('week');

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        try {
            const [usersRes, coursesRes, examsRes] = await Promise.all([
                axios.get('/api/users'),
                axios.get('/api/courses'),
                axios.get('/api/exams')
            ]);

            const users = usersRes.data;
            const usersByRole: Record<string, number> = {};
            users.forEach((u: any) => {
                usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
            });

            setStats({
                totalUsers: users.length,
                totalCourses: coursesRes.data.length,
                totalExams: examsRes.data.length,
                usersByRole,
                recentActivity: [
                    { date: new Date().toISOString(), action: 'Sistem başlatıldı', user: 'System' },
                ]
            });
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const exportReport = (format: 'csv' | 'pdf') => {
        // Generate CSV data
        const csvData = [
            ['Metrik', 'Değer'],
            ['Toplam Kullanıcı', stats.totalUsers.toString()],
            ['Toplam Ders', stats.totalCourses.toString()],
            ['Toplam Sınav', stats.totalExams.toString()],
            ...Object.entries(stats.usersByRole).map(([role, count]) => [role, count.toString()])
        ];

        if (format === 'csv') {
            const csv = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rapor_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } else {
            alert(t('pdf_export_coming_soon') || 'PDF export yakında gelecek!');
        }
    };

    const roles: Record<string, string> = {
        super_admin: t('admin'),
        manager: t('manager'),
        instructor: t('instructor'),
        assistant: t('assistant'),
        student: t('student'),
        guest: t('guest'),
    };

    if (loading) {
        return (
            <DashboardLayout requiredRoles={['super_admin', 'manager']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['super_admin', 'manager']}>
            <PageHeader
                title={t('reports')}
                description={t('reports_desc')}
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => exportReport('csv')}>
                            📊 CSV
                        </Button>
                        <Button variant="secondary" onClick={() => exportReport('pdf')}>
                            📄 PDF
                        </Button>
                    </div>
                }
            />

            {/* Date Range Filter */}
            <Card className="mb-6" padding="sm">
                <div className="flex gap-2">
                    {['day', 'week', 'month', 'year'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${dateRange === range
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]'
                                }`}
                        >
                            {range === 'day' && (t('today') || 'Bugün')}
                            {range === 'week' && (t('this_week') || 'Bu Hafta')}
                            {range === 'month' && (t('this_month') || 'Bu Ay')}
                            {range === 'year' && (t('this_year') || 'Bu Yıl')}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title={t('total_users')}
                    value={stats.totalUsers}
                    icon={<UsersIcon />}
                    trend="up"
                    trendLabel="+12%"
                />
                <StatsCard
                    title={t('total_courses')}
                    value={stats.totalCourses}
                    icon={<BookIcon />}
                    trend="up"
                    trendLabel="+5%"
                />
                <StatsCard
                    title={t('total_exams')}
                    value={stats.totalExams}
                    icon={<ClipboardIcon />}
                    trend="neutral"
                    trendLabel="0%"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Users by Role */}
                <Card>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">👥 {t('users_by_role')}</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.usersByRole).map(([role, count]) => {
                            const percentage = Math.round((count / stats.totalUsers) * 100) || 0;
                            const colors: Record<string, string> = {
                                super_admin: 'bg-purple-500',
                                manager: 'bg-indigo-500',
                                instructor: 'bg-blue-500',
                                assistant: 'bg-cyan-500',
                                student: 'bg-emerald-500',
                                guest: 'bg-gray-500',
                            };
                            return (
                                <div key={role}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[var(--text-primary)]">{roles[role] || role}</span>
                                        <span className="text-[var(--text-secondary)]">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[role] || 'bg-gray-500'} transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Quick Metrics */}
                <Card>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">📈 {t('statistics') || 'İstatistikler'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                            <p className="text-3xl font-bold text-blue-600">{stats.usersByRole.student || 0}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{t('active_students')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                            <p className="text-3xl font-bold text-emerald-600">{stats.usersByRole.instructor || 0}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{t('active_instructors')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                            <p className="text-3xl font-bold text-amber-600">{stats.totalCourses}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{t('courses')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                            <p className="text-3xl font-bold text-pink-600">{stats.totalExams}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{t('exams')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* System Info */}
            <Card>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">🖥️ {t('system_info') || 'Sistem Bilgisi'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-[var(--text-tertiary)]">{t('database')}</p>
                        <p className="font-medium text-[var(--text-primary)]">SQLite</p>
                    </div>
                    <div>
                        <p className="text-[var(--text-tertiary)]">{t('backend')}</p>
                        <p className="font-medium text-[var(--text-primary)]">Express.js</p>
                    </div>
                    <div>
                        <p className="text-[var(--text-tertiary)]">{t('frontend')}</p>
                        <p className="font-medium text-[var(--text-primary)]">Next.js 14</p>
                    </div>
                    <div>
                        <p className="text-[var(--text-tertiary)]">{t('language')}</p>
                        <p className="font-medium text-[var(--text-primary)]">{language.toUpperCase()}</p>
                    </div>
                </div>
            </Card>
        </DashboardLayout>
    );
}

// Icons
const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
);

const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);
