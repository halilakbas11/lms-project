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

export default function AssistantDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout requiredRoles={['assistant', 'manager', 'super_admin']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRoles={['assistant', 'manager', 'super_admin']}>
      <PageHeader
        title={`${t('hello')}, ${user.name}!`}
        description={t('assistant_panel') || 'Assistant Panel'}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title={t('total_courses')} value={courses.length} icon={<>📚</>} />
        <StatsCard title={t('instructors')} value={[...new Set(courses.map(c => c.instructor?.name))].filter(Boolean).length} icon={<>👨‍🏫</>} />
        <StatsCard title={t('active')} value={courses.length} icon={<>✅</>} />
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">⚡ {t('quick_actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => router.push('/dashboard/assistant/notes')}>
            <div className="text-center">
              <div className="text-3xl mb-2">📓</div>
              <p className="font-semibold text-[var(--text-primary)]">{t('my_notes')}</p>
              <p className="text-sm text-[var(--text-tertiary)]">{t('personal_notes')}</p>
            </div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold text-[var(--text-primary)]">{t('view')} {t('courses')}</p>
            <p className="text-sm text-[var(--text-tertiary)]">{t('view_only_access') || 'View-only'}</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="font-semibold text-[var(--text-primary)]">{t('reports')}</p>
            <p className="text-sm text-[var(--text-tertiary)]">{t('view_only_access') || 'View-only'}</p>
          </Card>
        </div>
      </section>

      {/* Courses List */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📚 {t('all_courses')}</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-[var(--text-secondary)]">{t('no_courses')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <Card key={course.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className="badge badge-primary text-xs">{course.code}</span>
                  <span className="badge bg-cyan-100 text-cyan-700 text-xs">{t('view_only_access') || 'View'}</span>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mt-2">{course.title}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2">{course.description}</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-light)]">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {t('instructor')}: {course.instructor?.name || 'N/A'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
