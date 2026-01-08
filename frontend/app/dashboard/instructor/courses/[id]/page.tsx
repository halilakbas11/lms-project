'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader, StatsCard, EmptyState } from '../../../../components/layout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Modal, { ModalFooter } from '../../../../components/ui/Modal';
import { useLanguage } from '../../../../i18n/LanguageContext';

interface Course {
    id: number;
    title: string;
    code: string;
    description: string;
    accessCode?: string;
    startDate?: string;
    endDate?: string;
    instructor?: { id: number; name: string };
}

interface Exam {
    id: number;
    title: string;
    durationMinutes: number;
    startTime?: string;
    endTime?: string;
    requiresSEB: boolean;
    isOpticalExam: boolean;
    Questions?: any[];
}

interface Student {
    id: number;
    name: string;
    email: string;
}

export default function CourseDetailPage() {
    const { t, language } = useLanguage();
    const params = useParams();
    const courseId = params.id as string;
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [activeTab, setActiveTab] = useState<'exams' | 'students' | 'settings'>('exams');
    const [loading, setLoading] = useState(true);

    // Modals
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);
    const [showEditExamModal, setShowEditExamModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    // Edit course form
    const [editCourseForm, setEditCourseForm] = useState({
        title: '',
        code: '',
        description: '',
        accessCode: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            // Fetch course details
            const coursesRes = await axios.get('http://localhost:3001/api/courses');
            const foundCourse = coursesRes.data.find((c: any) => c.id === parseInt(courseId));
            setCourse(foundCourse);

            if (foundCourse) {
                setEditCourseForm({
                    title: foundCourse.title || '',
                    code: foundCourse.code || '',
                    description: foundCourse.description || '',
                    accessCode: foundCourse.accessCode || '',
                    startDate: foundCourse.startDate ? foundCourse.startDate.split('T')[0] : '',
                    endDate: foundCourse.endDate ? foundCourse.endDate.split('T')[0] : '',
                });
            }

            // Fetch course exams
            const examsRes = await axios.get(`http://localhost:3001/api/courses/${courseId}/exams`);
            setExams(examsRes.data);

            // Fetch enrolled students
            try {
                const studentsRes = await axios.get(`http://localhost:3001/api/courses/${courseId}/students`);
                setStudents(studentsRes.data);
            } catch {
                setStudents([]);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const getExamStatus = (exam: Exam) => {
        const now = new Date();
        if (!exam.startTime) return { label: t('draft'), class: 'bg-gray-100 text-gray-600 dark:bg-gray-800' };
        const start = new Date(exam.startTime);
        const end = exam.endTime ? new Date(exam.endTime) : null;

        if (now < start) return { label: t('scheduled'), class: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' };
        if (end && now > end) return { label: t('completed'), class: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' };
        return { label: t('active'), class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' };
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const locale = language === 'tr' ? 'tr-TR' : language === 'jp' ? 'ja-JP' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleEditExam = (exam: Exam) => {
        setSelectedExam(exam);
        setShowEditExamModal(true);
    };

    const handleSaveCourseSettings = async () => {
        try {
            await axios.put(`http://localhost:3001/api/courses/${courseId}`, editCourseForm);
            setShowEditCourseModal(false);
            fetchCourseData();
        } catch (err) {
            alert(t('update_error'));
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!confirm(t('remove_student_confirm'))) return;
        try {
            await axios.delete(`http://localhost:3001/api/courses/${courseId}/students/${studentId}`);
            fetchCourseData();
        } catch (err) {
            alert(t('remove_error'));
        }
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

    if (!course) {
        return (
            <DashboardLayout requiredRoles={['instructor', 'assistant']}>
                <EmptyState
                    title={t('error')}
                    description={t('error')}
                    action={
                        <Button variant="secondary" onClick={() => router.push('/dashboard/instructor/courses')}>
                            {t('back_to_courses')}
                        </Button>
                    }
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['instructor', 'assistant']}>
            {/* Header with Course Info */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/dashboard/instructor/courses')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors mb-4"
                >
                    <BackIcon /> {t('back_to_courses')}
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200/50 mb-2">
                            {course.code}
                        </span>
                        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{course.title}</h1>
                        <p className="text-[var(--text-secondary)] mt-1">{course.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowEditCourseModal(true)}
                        >
                            <EditIcon /> {t('edit')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => router.push(`/dashboard/instructor/exams/create?courseId=${courseId}`)}
                        >
                            <PlusIcon /> {t('add_exam')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title={t('total_exams')} value={exams.length} icon={<ClipboardIcon />} />
                <StatsCard title={t('active_exams_count')} value={exams.filter(e => getExamStatus(e).label === t('active')).length} icon={<PlayIcon />} />
                <StatsCard title={t('registered_students')} value={students.length} icon={<UsersIcon />} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-[var(--border-light)]">
                {([
                    { key: 'exams', label: t('exams'), icon: '📝' },
                    { key: 'students', label: t('students'), icon: '👥' },
                    { key: 'settings', label: t('settings'), icon: '⚙️' },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.key
                            ? 'bg-[var(--bg-card)] text-blue-600 border-b-2 border-blue-500 -mb-[1px]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                            }`}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content - Exams */}
            {activeTab === 'exams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.length === 0 ? (
                        <Card className="col-span-full text-center py-12">
                            <p className="text-[var(--text-secondary)] mb-4">{t('no_exams_in_course')}</p>
                            <Button variant="primary" onClick={() => router.push(`/dashboard/instructor/exams/create?courseId=${courseId}`)}>
                                <PlusIcon /> {t('add_first_exam')}
                            </Button>
                        </Card>
                    ) : (
                        exams.map((exam, index) => {
                            const status = getExamStatus(exam);
                            return (
                                <Card
                                    key={exam.id}
                                    className="animate-slide-up"
                                    padding="none"
                                    style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                                >
                                    <div className={`h-2 ${status.label === t('active') ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                        status.label === t('scheduled') ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                            status.label === t('completed') ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                'bg-gray-300 dark:bg-gray-700'
                                        }`} />

                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`badge ${status.class}`}>{status.label}</span>
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

                                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{exam.title}</h3>

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-[var(--text-tertiary)]">{t('duration')}</p>
                                                <p className="font-medium text-[var(--text-primary)]">{exam.durationMinutes} {t('minute_short')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[var(--text-tertiary)]">{t('question_count')}</p>
                                                <p className="font-medium text-[var(--text-primary)]">{exam.Questions?.length || 0}</p>
                                            </div>
                                            {exam.startTime && (
                                                <div className="col-span-2">
                                                    <p className="text-[var(--text-tertiary)]">{t('start_date')}</p>
                                                    <p className="font-medium text-[var(--text-primary)] text-xs">{formatDate(exam.startTime)}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEditExam(exam)}
                                            >
                                                <EditIcon /> {t('edit')}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/instructor/gradebook?examId=${exam.id}`)}
                                            >
                                                {t('results')}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}

                    {/* Add New Card */}
                    <button
                        onClick={() => router.push(`/dashboard/instructor/exams/create?courseId=${courseId}`)}
                        className="card border-2 border-dashed border-[var(--border-light)] hover:border-blue-400 transition-colors flex flex-col items-center justify-center min-h-[250px] group"
                    >
                        <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-3 transition-colors">
                            <PlusIcon />
                        </div>
                        <p className="font-medium text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors">
                            {t('add_exam')}
                        </p>
                    </button>
                </div>
            )}

            {/* Tab Content - Students */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    {students.length === 0 ? (
                        <EmptyState
                            title={t('no_students_title')}
                            description={t('no_students_in_course')}
                            icon={<UsersIcon />}
                        />
                    ) : (
                        <Card padding="none">
                            <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between">
                                <h3 className="font-bold text-[var(--text-primary)]">
                                    {t('student_list_title')} ({students.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-[var(--border-light)]">
                                {students.map((student, index) => (
                                    <div
                                        key={student.id}
                                        className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--text-primary)]">{student.name}</p>
                                                <p className="text-sm text-[var(--text-tertiary)]">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/instructor/gradebook?studentId=${student.id}&courseId=${courseId}`)}
                                            >
                                                {t('view_grades')}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleRemoveStudent(student.id)}
                                            >
                                                {t('remove_student')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Tab Content - Settings */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Details */}
                    <Card>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <InfoIcon /> {t('course_info')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('course_code')}</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={editCourseForm.code}
                                    onChange={e => setEditCourseForm({ ...editCourseForm, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('course_title')}</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={editCourseForm.title}
                                    onChange={e => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('description')}</label>
                                <textarea
                                    className="input w-full"
                                    rows={3}
                                    value={editCourseForm.description}
                                    onChange={e => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Access Settings */}
                    <Card>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <LockIcon /> {t('access_settings')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    {t('access_code')}
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder={t('access_code_placeholder')}
                                    value={editCourseForm.accessCode}
                                    onChange={e => setEditCourseForm({ ...editCourseForm, accessCode: e.target.value })}
                                />
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                    {t('access_code_hint')}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        {t('start_date')}
                                    </label>
                                    <input
                                        type="date"
                                        className="input w-full"
                                        value={editCourseForm.startDate}
                                        onChange={e => setEditCourseForm({ ...editCourseForm, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        {t('end_date')}
                                    </label>
                                    <input
                                        type="date"
                                        className="input w-full"
                                        value={editCourseForm.endDate}
                                        onChange={e => setEditCourseForm({ ...editCourseForm, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <Card className="lg:col-span-2">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="primary" onClick={handleSaveCourseSettings}>
                                <SaveIcon /> {t('save_changes')}
                            </Button>
                            <Button variant="ghost" className="text-red-500">
                                <TrashIcon /> {t('delete_course')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Edit Exam Modal */}
            <Modal
                isOpen={showEditExamModal}
                onClose={() => setShowEditExamModal(false)}
                title={t('edit_exam')}
                size="lg"
            >
                {selectedExam && (
                    <div className="space-y-4">
                        <p className="text-[var(--text-secondary)]">
                            {t('exam')}: <strong>{selectedExam.title}</strong>
                        </p>
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => {
                                router.push(`/dashboard/instructor/exams/${selectedExam.id}/edit`);
                            }}
                        >
                            {t('go_to_full_edit')}
                        </Button>
                    </div>
                )}
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setShowEditExamModal(false)}>{t('close')}</Button>
                </ModalFooter>
            </Modal>

            {/* Edit Course Modal */}
            <Modal
                isOpen={showEditCourseModal}
                onClose={() => setShowEditCourseModal(false)}
                title={t('edit_course')}
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('course_code')}</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={editCourseForm.code}
                            onChange={e => setEditCourseForm({ ...editCourseForm, code: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('course_title')}</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={editCourseForm.title}
                            onChange={e => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('description')}</label>
                        <textarea
                            className="input w-full"
                            rows={3}
                            value={editCourseForm.description}
                            onChange={e => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                        />
                    </div>
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setShowEditCourseModal(false)}>{t('cancel')}</Button>
                    <Button variant="primary" onClick={handleSaveCourseSettings}>{t('save')}</Button>
                </ModalFooter>
            </Modal>
        </DashboardLayout>
    );
}

// Icons
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
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

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const SaveIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
