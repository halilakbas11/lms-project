'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';

interface Grade {
    id: number;
    examId: number;
    examTitle: string;
    courseCode: string;
    courseName: string;
    score: number;
    maxScore: number;
    submittedAt: string;
    status: 'graded' | 'pending';
}

export default function StudentGradesPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchGrades(userData.id);
    }, []);

    const fetchGrades = async (userId: number) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/student/${userId}/grades`);
            setGrades(res.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number, max: number) => {
        const percent = (score / max) * 100;
        if (percent >= 85) return 'text-emerald-500';
        if (percent >= 70) return 'text-blue-500';
        if (percent >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    const getLetterGrade = (percent: number) => {
        if (percent >= 90) return 'AA';
        if (percent >= 85) return 'BA';
        if (percent >= 80) return 'BB';
        if (percent >= 75) return 'CB';
        if (percent >= 70) return 'CC';
        if (percent >= 65) return 'DC';
        if (percent >= 60) return 'DD';
        return 'FF';
    };

    const formatDate = (dateString: string) => {
        const locales: Record<string, string> = { tr: 'tr-TR', en: 'en-US', jp: 'ja-JP' };
        return new Date(dateString).toLocaleDateString(locales[language] || 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Group by course
    const courseGroups = grades.reduce((acc, grade) => {
        if (!acc[grade.courseCode]) {
            acc[grade.courseCode] = { name: grade.courseName, grades: [] };
        }
        acc[grade.courseCode].grades.push(grade);
        return acc;
    }, {} as Record<string, { name: string; grades: Grade[] }>);

    // Calculate overall stats
    const gradedResults = grades.filter(g => g.status === 'graded');
    const totalScore = gradedResults.reduce((acc, g) => acc + g.score, 0);
    const totalMax = gradedResults.reduce((acc, g) => acc + g.maxScore, 0);
    const overall = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

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
                title={t('my_grades')}
                description={t('my_grades_desc')}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white" padding="md">
                    <p className="text-3xl font-bold">{overall}%</p>
                    <p className="text-sm opacity-80">{t('overall_gpa')}</p>
                </Card>
                <Card className="text-center" padding="md">
                    <p className="text-3xl font-bold text-emerald-500">{getLetterGrade(overall)}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{t('letter_grade')}</p>
                </Card>
                <Card className="text-center" padding="md">
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{gradedResults.length}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{t('completed_count')}</p>
                </Card>
                <Card className="text-center" padding="md">
                    <p className="text-3xl font-bold text-orange-500">{grades.filter(g => g.status === 'pending').length}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{t('pending_count')}</p>
                </Card>
            </div>

            {/* No Grades Message */}
            {grades.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-[var(--text-secondary)]">{t('no_grades_yet') || 'No grades yet'}</p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-2">{t('take_exams_to_see_grades') || 'Take exams to see your grades here'}</p>
                </Card>
            ) : (
                /* Grades by Course */
                Object.entries(courseGroups).map(([code, { name, grades: courseGrades }]) => {
                    const courseTotal = courseGrades.filter(g => g.status === 'graded').reduce((acc, g) => acc + g.score, 0);
                    const courseMax = courseGrades.filter(g => g.status === 'graded').reduce((acc, g) => acc + g.maxScore, 0);
                    const courseAvg = courseMax > 0 ? Math.round((courseTotal / courseMax) * 100) : 0;

                    return (
                        <div key={code} className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="badge badge-primary">{code}</span>
                                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{name}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--text-secondary)]">{t('course_avg')}</span>
                                    <span className={`font-bold ${getScoreColor(courseAvg, 100)}`}>{courseAvg}%</span>
                                </div>
                            </div>

                            <Card padding="none" hover={false}>
                                <div className="divide-y divide-[var(--border-light)]">
                                    {courseGrades.map((grade, index) => (
                                        <div
                                            key={grade.id}
                                            className="flex items-center justify-between p-4 hover:bg-[var(--bg-tertiary)] transition-colors animate-fade-in"
                                            style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${grade.status === 'pending'
                                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
                                                    }`}>
                                                    {grade.status === 'pending' ? '⏳' : '✓'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">{grade.examTitle}</p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">{formatDate(grade.submittedAt)}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {grade.status === 'graded' ? (
                                                    <>
                                                        <p className={`text-xl font-bold ${getScoreColor(grade.score, grade.maxScore)}`}>
                                                            {grade.score}/{grade.maxScore}
                                                        </p>
                                                        <p className="text-xs text-[var(--text-tertiary)]">
                                                            {Math.round((grade.score / grade.maxScore) * 100)}%
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="badge badge-warning">{t('grading')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    );
                })
            )}
        </DashboardLayout>
    );
}
