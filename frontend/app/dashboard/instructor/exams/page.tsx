'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../i18n/LanguageContext';

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
    Questions?: any[];
}

type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed';

export default function ExamsPage() {
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

    const fetchExams = async (instructorId: number) => {
        try {
            // First get instructor's courses
            const coursesRes = await axios.get(`/api/instructor/${instructorId}/courses`);
            const courseIds = coursesRes.data.map((c: any) => c.id);

            // Get all exams and filter by instructor's courses
            const examsRes = await axios.get('/api/exams');
            const instructorExams = examsRes.data.filter((e: any) => courseIds.includes(e.CourseId));

            // Get course info for each exam
            const examsWithCourse = instructorExams.map((exam: any) => {
                const course = coursesRes.data.find((c: any) => c.id === exam.CourseId);
                return { ...exam, Course: course };
            });

            setExams(examsWithCourse);
        } catch (err) {
            console.error(err);
            // Fallback: get all exams
            try {
                const res = await axios.get('/api/exams');
                setExams(res.data);
            } catch (e) {
                console.error(e);
            }
        }
        setLoading(false);
    };

    const getExamStatus = (exam: Exam): ExamStatus => {
        const now = new Date();
        if (!exam.startTime) return 'draft';
        const start = new Date(exam.startTime);
        const end = exam.endTime ? new Date(exam.endTime) : null;

        if (now < start) return 'scheduled';
        if (end && now > end) return 'completed';
        return 'active';
    };

    const filteredExams = exams.filter(e => filter === 'all' || getExamStatus(e) === filter);

    const getStatusBadge = (status: ExamStatus) => {
        const config = {
            draft: { label: t('draft'), class: 'bg-gray-100 text-gray-600 dark:bg-gray-800' },
            scheduled: { label: t('scheduled'), class: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
            active: { label: t('active'), class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' },
            completed: { label: t('completed'), class: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
        };
        const c = config[status];
        return <span className={`badge ${c.class}`}>{c.label}</span>;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        // Use dynamically selected language for locale
        const localeMap: Record<string, string> = {
            'tr': 'tr-TR',
            'en': 'en-US',
            'jp': 'ja-JP'
        };
        return new Date(dateString).toLocaleDateString(localeMap[language] || 'tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <DashboardLayout requiredRoles={['instructor', 'assistant', 'super_admin']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['instructor', 'assistant', 'super_admin']}>
            <PageHeader
                title={t('exams')}
                description={t('exam_list_desc')}
                actions={
                    <Button variant="primary" onClick={() => router.push('/dashboard/instructor/exams/create')}>
                        <PlusIcon />
                        {t('create_new_exam')}
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'draft', 'scheduled', 'active', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-light)]'
                            }`}
                    >
                        {f === 'all' ? t('all') : t(f as any)}
                    </button>
                ))}
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam, index) => {
                    const status = getExamStatus(exam);
                    return (
                        <Card
                            key={exam.id}
                            className="animate-slide-up"
                            padding="none"
                            style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                        >
                            <div className={`h-2 ${status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                status === 'scheduled' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                    status === 'completed' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                        'bg-gray-300 dark:bg-gray-700'
                                }`} />

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    {getStatusBadge(status)}
                                    <div className="flex gap-1">
                                        {exam.requiresSEB && (
                                            <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded font-medium">
                                                🔒 SEB
                                            </span>
                                        )}
                                        {exam.isOpticalExam && (
                                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded font-medium">
                                                📄 {t('optical')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{exam.title}</h3>
                                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                                    {exam.Course?.code || t('course_not_assigned')}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-[var(--text-tertiary)]">{t('question_count_label')}</p>
                                        <p className="font-medium text-[var(--text-primary)]">{exam.Questions?.length || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-tertiary)]">{t('duration_label')}</p>
                                        <p className="font-medium text-[var(--text-primary)]">{exam.durationMinutes ? `${exam.durationMinutes} ${t('minutes')}` : t('unlimited')}</p>
                                    </div>
                                    {exam.startTime && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-[var(--text-tertiary)]">{t('start_label')}</p>
                                            <p className="font-medium text-[var(--text-primary)]">{formatDate(exam.startTime)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/dashboard/instructor/exams/${exam.id}/edit`)}
                                    >
                                        {t('edit')}
                                    </Button>
                                    {status === 'completed' && (
                                        <Button variant="ghost" size="sm">{t('results')}</Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {/* Create New Card */}
                <button
                    onClick={() => router.push('/dashboard/instructor/exams/create')}
                    className="card border-2 border-dashed border-[var(--border-light)] hover:border-blue-400 transition-colors flex flex-col items-center justify-center min-h-[250px] group"
                >
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-3 transition-colors">
                        <PlusIcon />
                    </div>
                    <p className="font-medium text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors">
                        {t('create_new_exam')}
                    </p>
                </button>
            </div>

            {filteredExams.length === 0 && filter !== 'all' && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                    {t('no_exams_filtered')}
                </div>
            )}
        </DashboardLayout>
    );
}

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
