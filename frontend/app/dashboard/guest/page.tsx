'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../components/layout';
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

export default function GuestDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
      const res = await axios.get('http://localhost:3001/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout requiredRoles={['guest', 'student']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRoles={['guest', 'student']}>
      <PageHeader
        title={t('guest_panel') || 'Guest Panel'}
        description={t('view_only_desc') || 'You can view courses but cannot edit or take exams'}
      />

      {/* Upgrade Notice */}
      <Card className="mb-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">⚠️ {t('limited_access') || 'Limited Access'}</h3>
            <p className="text-sm opacity-90">{t('guest_upgrade_prompt') || 'Register as a student to take exams and access all features'}</p>
          </div>
          <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
            {t('register') || 'Register'}
          </Button>
        </div>
      </Card>

      {/* Available Courses */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📚 {t('available_courses')}</h2>

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
              <Card key={course.id} className="opacity-80">
                <div className="flex justify-between items-start mb-2">
                  <span className="badge bg-gray-200 text-gray-700 text-xs">{course.code}</span>
                  <span className="badge bg-orange-100 text-orange-600 text-xs">🔒 {t('view_only_access') || 'View Only'}</span>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mt-2">{course.title}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2">{course.description}</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-light)]">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('instructor')}: {course.instructor?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-orange-500 mt-2 font-medium">
                    ⚠️ {t('register_for_exams') || 'Register to take exams'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}