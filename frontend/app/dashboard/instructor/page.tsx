'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader, StatsCard } from '../../components/layout';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface Course {
  id: number;
  title: string;
  code: string;
  description: string;
  instructor?: { name: string };
}

export default function InstructorDashboard() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', code: '', description: '' });
  const [stats, setStats] = useState({ courses: 0, students: 0, exams: 0, pendingRequests: 0 });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const coursesRes = await axios.get('http://localhost:3001/api/courses');
      setCourses(coursesRes.data);

      // Try to get pending requests count
      let pendingCount = 0;
      try {
        const requestsRes = await axios.get('http://localhost:3001/api/access-requests');
        pendingCount = requestsRes.data.filter((r: any) => r.status === 'pending').length;
      } catch {
        // API might not exist yet
      }

      setStats({
        courses: coursesRes.data.length,
        students: 0,
        exams: 0,
        pendingRequests: pendingCount
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/courses', { ...newCourse, instructorId: user?.id });
      setShowModal(false);
      setNewCourse({ title: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      alert(t('create_course_error'));
    }
  };

  if (!user) {
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
        title={`${t('hello')}, ${user.name}!`}
        description={t('instructor_panel')}
        actions={
          <Button onClick={() => setShowModal(true)}>
            + {t('new_course')}
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title={t('my_courses')} value={courses.length} icon={<BookIcon />} />
        <StatsCard title={t('total_students')} value={stats.students} icon={<UsersIcon />} />
        <StatsCard title={t('exams')} value={stats.exams} icon={<ClipboardIcon />} />
        <StatsCard title={t('pending_requests')} value={stats.pendingRequests} icon={<ClockIcon />} />
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <h3 className="font-bold text-[var(--text-primary)] mb-4">{t('quick_actions')}</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/instructor/question-bank')}>
            📚 {t('question_bank')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/instructor/exams')}>
            📝 {t('exams')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/instructor/gradebook')}>
            📊 {t('gradebook')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/instructor/notes')}>
            📒 {t('notes')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/instructor/access-requests')}>
            🔔 {t('access_requests')} {stats.pendingRequests > 0 && `(${stats.pendingRequests})`}
          </Button>
        </div>
      </Card>

      {/* Courses Grid */}
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📚 {t('my_courses')}</h2>

      {courses.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-[var(--text-secondary)]">{t('no_courses_title')}</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowModal(true)}>
            + {t('new_course')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <Card key={course.id} className="border-l-4 border-l-blue-500">
              <span className="badge badge-primary text-xs">{course.code}</span>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mt-2">{course.title}</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2">{course.description || t('no_description')}</p>
              <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
                >
                  {t('manage')} →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">➕ {t('new_course')}</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('course_code')}</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  placeholder="CS101"
                  value={newCourse.code}
                  onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('course_title')}</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  placeholder={t('course_title')}
                  value={newCourse.title}
                  onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('description')}</label>
                <textarea
                  className="input w-full"
                  rows={3}
                  value={newCourse.description}
                  onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                <Button type="submit">{t('create')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Icons
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);