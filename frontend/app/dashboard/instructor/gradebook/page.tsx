'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface ExamResult {
    id: number;
    score: number;
    isOptical: boolean;
    submittedAt: string;
    student: { id: number; name: string; email: string };
    exam: { id: number; title: string };
    course: { id: number; title: string; code: string };
}

interface Course {
    id: number;
    title: string;
    code: string;
}

export default function GradebookPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchCourses(userData.id);
    }, []);

    const fetchCourses = async (userId: number) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/instructor/${userId}/courses`);
            setCourses(res.data);
            if (res.data.length > 0) {
                setSelectedCourseId(res.data[0].id);
                fetchResults(userId);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (userId: number) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/instructor/${userId}/results`);
            setResults(res.data);
        } catch (err) {
            console.error('Error fetching results:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const locales: Record<string, string> = { tr: 'tr-TR', en: 'en-US', jp: 'ja-JP' };
        return new Date(dateString).toLocaleDateString(locales[language] || 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-emerald-500';
        if (score >= 70) return 'text-blue-500';
        if (score >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    const getLetterGrade = (score: number) => {
        if (score >= 90) return { letter: 'AA', color: 'text-emerald-500' };
        if (score >= 85) return { letter: 'BA', color: 'text-emerald-400' };
        if (score >= 80) return { letter: 'BB', color: 'text-blue-500' };
        if (score >= 75) return { letter: 'CB', color: 'text-blue-400' };
        if (score >= 70) return { letter: 'CC', color: 'text-cyan-500' };
        if (score >= 65) return { letter: 'DC', color: 'text-yellow-500' };
        if (score >= 60) return { letter: 'DD', color: 'text-orange-500' };
        return { letter: 'FF', color: 'text-red-500' };
    };

    // Filter results by selected course
    const filteredResults = selectedCourseId
        ? results.filter(r => r.course.id === selectedCourseId)
        : results;

    // Calculate stats
    const avgScore = filteredResults.length > 0
        ? Math.round(filteredResults.reduce((acc, r) => acc + r.score, 0) / filteredResults.length)
        : 0;
    const opticalCount = filteredResults.filter(r => r.isOptical).length;

    if (!user) {
        return (
            <DashboardLayout requiredRoles={['instructor', 'manager', 'super_admin']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['instructor', 'manager', 'super_admin']}>
            <PageHeader
                title={t('gradebook')}
                description={t('gradebook_desc') || 'View and manage student grades'}
                actions={
                    <select
                        className="input w-48"
                        value={selectedCourseId || ''}
                        onChange={e => setSelectedCourseId(Number(e.target.value))}
                    >
                        <option value="">{t('all_courses')}</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.code} - {course.title}
                            </option>
                        ))}
                    </select>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center" padding="sm">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{filteredResults.length}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{t('total_results')}</p>
                </Card>
                <Card className="text-center" padding="sm">
                    <p className="text-2xl font-bold text-emerald-500">{avgScore}%</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{t('class_avg') || 'Class Average'}</p>
                </Card>
                <Card className="text-center" padding="sm">
                    <p className="text-2xl font-bold text-purple-500">{opticalCount}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{t('optical_results') || 'Optical'}</p>
                </Card>
                <Card className="text-center" padding="sm">
                    <p className="text-2xl font-bold text-blue-500">{courses.length}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{t('courses')}</p>
                </Card>
            </div>

            {/* Results Table */}
            {loading ? (
                <Card className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </Card>
            ) : filteredResults.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-[var(--text-secondary)]">{t('no_results_yet') || 'No exam results yet'}</p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-2">
                        {t('use_mobile_optical') || 'Use the mobile app optical reader to add grades'}
                    </p>
                </Card>
            ) : (
                <Card padding="none" hover={false}>
                    <div className="overflow-x-auto">
                        <table className="table min-w-full">
                            <thead>
                                <tr>
                                    <th>{t('student')}</th>
                                    <th>{t('exam')}</th>
                                    <th>{t('course')}</th>
                                    <th className="text-center">{t('score')}</th>
                                    <th className="text-center">{t('letter_grade')}</th>
                                    <th className="text-center">{t('type')}</th>
                                    <th>{t('date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map((result, index) => {
                                    const grade = getLetterGrade(result.score);
                                    return (
                                        <tr
                                            key={result.id}
                                            className="animate-fade-in"
                                            style={{ animationDelay: `${index * 20}ms` } as React.CSSProperties}
                                        >
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                        {result.student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--text-primary)]">{result.student.name}</p>
                                                        <p className="text-xs text-[var(--text-tertiary)]">{result.student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-medium text-[var(--text-primary)]">{result.exam.title}</td>
                                            <td>
                                                <span className="badge badge-primary text-xs">{result.course.code}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                                                    {result.score}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`font-bold text-lg ${grade.color}`}>{grade.letter}</span>
                                            </td>
                                            <td className="text-center">
                                                {result.isOptical ? (
                                                    <span className="badge bg-purple-100 text-purple-700 text-xs">📷 Optical</span>
                                                ) : (
                                                    <span className="badge bg-blue-100 text-blue-700 text-xs">💻 Online</span>
                                                )}
                                            </td>
                                            <td className="text-sm text-[var(--text-secondary)]">
                                                {formatDate(result.submittedAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> 85%+ {t('excellent') || 'Excellent'}
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" /> 70-84% {t('good') || 'Good'}
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500" /> 50-69% {t('pass') || 'Pass'}
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" /> &lt;50% {t('fail') || 'Fail'}
                </span>
            </div>
        </DashboardLayout>
    );
}
