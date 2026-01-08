'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Course {
    id: number;
    title: string;
    code: string;
    description: string;
    instructorId: number;
    instructor?: { name: string; email: string };
    createdAt: string;
}

interface Instructor {
    id: number;
    name: string;
    email: string;
}

export default function AdminCoursesPage() {
    const { t } = useLanguage();
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({ code: '', title: '', description: '', instructorId: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, usersRes] = await Promise.all([
                axios.get('http://localhost:3001/api/courses'),
                axios.get('http://localhost:3001/api/users')
            ]);
            setCourses(coursesRes.data);
            setInstructors(usersRes.data.filter((u: any) => u.role === 'instructor'));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const openAddModal = () => {
        setEditingCourse(null);
        setFormData({ code: '', title: '', description: '', instructorId: '' });
        setShowModal(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            code: course.code,
            title: course.title,
            description: course.description || '',
            instructorId: course.instructorId?.toString() || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await axios.put(`http://localhost:3001/api/courses/${editingCourse.id}`, formData);
            } else {
                await axios.post('http://localhost:3001/api/courses', formData);
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || t('error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm(t('confirm_delete'))) {
            try {
                await axios.delete(`http://localhost:3001/api/courses/${id}`);
                fetchData();
            } catch (err: any) {
                alert(err.response?.data?.message || t('error_delete'));
            }
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                title={t('all_courses')}
                description={`${t('total_courses')}: ${courses.length}`}
                actions={
                    <Button onClick={openAddModal}>
                        + {t('new_course')}
                    </Button>
                }
            />

            {/* Search */}
            <Card className="mb-6" padding="sm">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={`${t('search')}...`}
                            className="input w-full pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>
            </Card>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-[var(--text-secondary)]">{t('no_courses')}</p>
                    <Button className="mt-4" onClick={openAddModal}>+ {t('new_course')}</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <Card key={course.id} className="border-l-4 border-l-blue-500">
                            <div className="flex items-start justify-between">
                                <span className="badge badge-primary text-xs">{course.code}</span>
                                <span className="text-xs text-[var(--text-tertiary)]">ID: {course.id}</span>
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2">{course.title}</h3>
                            <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2">
                                {course.description || t('no_description')}
                            </p>
                            <div className="flex items-center gap-2 mt-3 pb-3 border-b border-[var(--border-light)]">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    {course.instructor?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {course.instructor?.name || t('instructor')}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
                                >
                                    {t('manage')}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEditModal(course)}>
                                    ✏️
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)}>
                                    🗑️
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                            {editingCourse ? `✏️ ${t('edit')} - ${editingCourse.code}` : `➕ ${t('new_course')}`}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('course_code')}</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    placeholder="CS101"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('course_title')}</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    placeholder={t('course_title')}
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('description')}</label>
                                <textarea
                                    className="input w-full"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('instructor')}</label>
                                <select
                                    className="input w-full"
                                    value={formData.instructorId}
                                    onChange={e => setFormData({ ...formData, instructorId: e.target.value })}
                                >
                                    <option value="">{t('select_course')}</option>
                                    {instructors.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name} ({inst.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                                <Button type="submit">{editingCourse ? t('save_changes') : t('create')}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
