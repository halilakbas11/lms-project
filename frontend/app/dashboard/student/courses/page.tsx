'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader, StatsCard, EmptyState } from '../../../components/layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Course {
    id: number;
    title: string;
    code: string;
    description: string;
    instructor?: { name: string };
}

import { useLanguage } from '../../../i18n/LanguageContext';

export default function StudentCoursesPage() {
    const { t } = useLanguage();
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchCourses(userData.id);
        }
    }, []);

    const fetchCourses = async (studentId: number) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/my-courses?userId=${studentId}`);
            setEnrolledCourses(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <DashboardLayout requiredRoles={['student', 'guest']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['student', 'guest']}>
            <PageHeader
                title={t('my_courses')}
                description={t('my_courses_desc') || 'View your enrolled courses.'}
                actions={
                    <Button variant="secondary" onClick={() => router.push('/dashboard/student')}>
                        {t('request_course')}
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title={t('registered_course')}
                    value={enrolledCourses.length}
                    icon={<BookIcon />}
                />
            </div>

            {enrolledCourses.length === 0 ? (
                <EmptyState
                    title={t('no_courses_title')}
                    description={t('no_courses_desc')}
                    icon={<BookIcon />}
                    action={
                        <Button variant="primary" onClick={() => router.push('/dashboard/student')}>
                            {t('request_course')}
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course, index) => (
                        <Card
                            key={course.id}
                            className="animate-slide-up"
                            padding="none"
                            style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                        >
                            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

                            <div className="p-6">
                                <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 mb-3">
                                    {course.code}
                                </span>

                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                                    {course.title}
                                </h3>

                                <p className="text-sm text-[var(--text-tertiary)] mb-4 line-clamp-2">
                                    {course.description || t('no_description')}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
                                    <span className="text-xs text-[var(--text-tertiary)]">
                                        {course.instructor?.name || t('instructor')}
                                    </span>
                                    <Button variant="primary" size="sm">
                                        {t('view')}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);
