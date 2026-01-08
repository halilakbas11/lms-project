'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader, EmptyState } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Exam {
    id: number;
    title: string;
    durationMinutes: number;
    startTime?: string;
    endTime?: string;
    requiresSEB: boolean;
    isOpticalExam: boolean;
    CourseId: number;
    Course?: {
        id: number;
        code: string;
        title: string;
    };
}

type ExamStatus = 'upcoming' | 'active' | 'completed' | 'missed';

export default function StudentExamsPage() {
    const { t, language } = useLanguage();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchExams(userData.id);
        }
    }, []);

    const fetchExams = async (studentId: number) => {
        try {
            // Get student's enrolled courses
            const coursesRes = await axios.get(`/api/my-courses?userId=${studentId}`);
            const courseIds = coursesRes.data.map((c: any) => c.id);

            if (courseIds.length === 0) {
                setExams([]);
                setLoading(false);
                return;
            }

            // Get all exams and filter by enrolled courses
            const examsRes = await axios.get('/api/exams');
            const studentExams = examsRes.data.filter((e: any) => courseIds.includes(e.CourseId));

            // Add course info
            const examsWithCourse = studentExams.map((exam: any) => {
                const course = coursesRes.data.find((c: any) => c.id === exam.CourseId);
                return { ...exam, Course: course };
            });

            setExams(examsWithCourse);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const getExamStatus = (exam: Exam): ExamStatus => {
        const now = new Date();
        if (!exam.startTime) return 'upcoming'; // Draft exams show as upcoming
        const start = new Date(exam.startTime);
        const end = exam.endTime ? new Date(exam.endTime) : null;

        if (now < start) return 'upcoming';
        if (end && now > end) return 'completed';
        return 'active';
    };

    const filteredExams = exams.filter(e => {
        if (filter === 'all') return true;
        return getExamStatus(e) === filter;
    });

    const getStatusConfig = (status: ExamStatus) => {
        const configs = {
            upcoming: { label: t('upcoming'), class: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30', gradient: 'from-blue-500 to-cyan-500' },
            active: { label: t('active'), class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30', gradient: 'from-emerald-500 to-teal-500' },
            completed: { label: t('completed'), class: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30', gradient: 'from-purple-500 to-pink-500' },
            missed: { label: t('missed'), class: 'bg-red-100 text-red-600 dark:bg-red-900/30', gradient: 'from-red-500 to-orange-500' },
        };
        return configs[status];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return t('date_not_set');
        return new Date(dateString).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'jp' ? 'ja-JP' : 'en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (startTime?: string) => {
        if (!startTime) return null;
        const now = new Date();
        const start = new Date(startTime);
        const diff = start.getTime() - now.getTime();

        if (diff < 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} ${t('days')} ${hours} ${t('hours')}`;
        if (hours > 0) return `${hours} ${t('hours')}`;
        return t('time_remaining_low');
    };

    if (loading) {
        return (
            <DashboardLayout requiredRoles={['student', 'guest', 'super_admin']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['student', 'guest', 'super_admin']}>
            <PageHeader
                title={t('my_exams')}
                description={t('my_exams_desc')}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: t('upcoming'), count: exams.filter(e => getExamStatus(e) === 'upcoming').length, color: 'blue' },
                    { label: t('active'), count: exams.filter(e => getExamStatus(e) === 'active').length, color: 'emerald' },
                    { label: t('completed'), count: exams.filter(e => getExamStatus(e) === 'completed').length, color: 'purple' },
                    { label: t('total'), count: exams.length, color: 'gray' },
                ].map(stat => (
                    <Card key={stat.label} className="text-center">
                        <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.count}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: t('all') },
                    { key: 'active', label: t('active') },
                    { key: 'upcoming', label: t('upcoming') },
                    { key: 'completed', label: t('completed') },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f.key
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-light)]'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Exams List */}
            {filteredExams.length === 0 ? (
                <EmptyState
                    title={t('no_exams_found_title')}
                    description={filter === 'all'
                        ? t('no_exams_enrolled_desc')
                        : t('no_exams_filter_desc')}
                    icon={<ClipboardIcon />}
                    action={
                        <Button variant="secondary" onClick={() => router.push('/dashboard/student')}>
                            {t('back_to_courses')}
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.map((exam, index) => {
                        const status = getExamStatus(exam);
                        const statusConfig = getStatusConfig(status);
                        const timeRemaining = getTimeRemaining(exam.startTime);

                        return (
                            <Card
                                key={exam.id}
                                className="animate-slide-up overflow-hidden"
                                padding="none"
                                style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                            >
                                <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`} />

                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`badge ${statusConfig.class}`}>{statusConfig.label}</span>
                                        <div className="flex gap-1">
                                            {exam.requiresSEB && (
                                                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded font-medium">
                                                    🔒 {t('seb_active')}
                                                </span>
                                            )}
                                            {exam.isOpticalExam && (
                                                <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded font-medium">
                                                    📄 {t('optical_active')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title & Course */}
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{exam.title}</h3>
                                    <p className="text-sm text-[var(--text-tertiary)] mb-4">
                                        {exam.Course?.code} - {exam.Course?.title}
                                    </p>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-[var(--text-tertiary)]">{t('duration')}</p>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                {exam.durationMinutes} {t('minutes')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[var(--text-tertiary)]">{t('date') || 'Date'}</p>
                                            <p className="font-medium text-[var(--text-primary)] text-sm">
                                                {formatDate(exam.startTime)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time Remaining */}
                                    {status === 'upcoming' && timeRemaining && (
                                        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm text-center">
                                            ⏰ {t('time_remaining')}: <strong>{timeRemaining}</strong>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {status === 'active' && (
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            onClick={() => router.push(`/exam/${exam.id}`)}
                                        >
                                            {t('start_exam')}
                                        </Button>
                                    )}
                                    {status === 'completed' && (
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={() => router.push('/dashboard/student/grades')}
                                        >
                                            {t('see_results')}
                                        </Button>
                                    )}
                                    {status === 'upcoming' && (
                                        <Button variant="ghost" className="w-full" disabled>
                                            {t('not_started_yet')}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}

const ClipboardIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);
