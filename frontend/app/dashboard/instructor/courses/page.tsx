'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader, StatsCard, EmptyState } from '../../../components/layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../i18n/LanguageContext';

interface Course {
    id: number;
    title: string;
    code: string;
    description: string;
    instructor?: { id: number; name: string };
    examCount?: number;
    studentCount?: number;
}

export default function InstructorCoursesPage() {
    const { t } = useLanguage();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchInstructorCourses(userData.id);
        }
    }, []);

    const fetchInstructorCourses = async (instructorId: number) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/instructor/${instructorId}/courses`);
            setCourses(res.data);
        } catch (err) {
            // Fallback: get all courses and filter
            try {
                const res = await axios.get('http://localhost:3001/api/courses');
                const filtered = res.data.filter((c: any) => c.instructorId === instructorId || c.instructor?.id === instructorId);
                setCourses(filtered);
            } catch (e) {
                console.error(e);
            }
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <DashboardLayout requiredRoles={['instructor', 'assistant']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['instructor', 'assistant']}>
            <PageHeader
                title={t('my_courses')}
                description={t('course_list_desc')}
                actions={
                    <Button variant="primary" onClick={() => router.push('/dashboard/instructor')}>
                        <DashboardIcon />
                        {t('dashboard')}
                    </Button>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title={t('total_courses')}
                    value={courses.length}
                    icon={<BookIcon />}
                    trend="neutral"
                    trendLabel={t('active')}
                />
                <StatsCard
                    title={t('total_exams_stat')}
                    value={courses.reduce((acc, c) => acc + (c.examCount || 0), 0)}
                    icon={<ClipboardIcon />}
                />
                <StatsCard
                    title={t('total_students_stat')}
                    value={courses.reduce((acc, c) => acc + (c.studentCount || 0), 0)}
                    icon={<UsersIcon />}
                />
            </div>

            {courses.length === 0 ? (
                <EmptyState
                    title={t('no_courses_title')}
                    description={t('no_courses_desc')}
                    icon={<BookIcon />}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <Card
                            key={course.id}
                            className="animate-slide-up group hover:shadow-lg transition-all duration-300"
                            padding="none"
                            style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                        >
                            {/* Gradient Top Bar */}
                            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                            <div className="p-6">
                                {/* Course Code Badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50">
                                        {course.code}
                                    </span>
                                </div>

                                {/* Course Title */}
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-[var(--text-tertiary)] mb-4 line-clamp-2">
                                    {course.description || t('no_description')}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">{course.examCount || 0}</p>
                                        <p className="text-xs text-[var(--text-tertiary)]">{t('exam')}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">{course.studentCount || 0}</p>
                                        <p className="text-xs text-[var(--text-tertiary)]">{t('student')}</p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
                                >
                                    <SettingsIcon />
                                    {t('manage')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

// Icons
const DashboardIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
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

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
