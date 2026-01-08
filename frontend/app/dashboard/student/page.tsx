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
  requestStatus?: 'pending' | 'approved' | 'rejected' | null;
}

interface Exam {
  id: number;
  title: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  CourseId: number;
}

export default function StudentDashboard() {
  const { t, language } = useLanguage();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    fetchData(userData.id);
  }, []);

  const fetchData = async (userId: number) => {
    try {
      const [enrolledRes, availableRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/my-courses?userId=${userId}`),
        axios.get(`http://localhost:3001/api/available-courses?userId=${userId}`)
      ]);
      setEnrolledCourses(enrolledRes.data);
      setAvailableCourses(availableRes.data);

      // Fetch upcoming exams for enrolled courses
      if (enrolledRes.data.length > 0) {
        const courseIds = enrolledRes.data.map((c: any) => c.id);
        const examsRes = await axios.get('http://localhost:3001/api/exams');
        const now = new Date();
        const upcoming = examsRes.data.filter((e: any) => {
          if (!courseIds.includes(e.CourseId)) return false;
          if (!e.startTime) return false;
          return new Date(e.startTime) > now;
        }).slice(0, 3); // Only show 3 upcoming
        setUpcomingExams(upcoming);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAccess = async () => {
    if (!selectedCourse) return;
    setLoading(true);

    try {
      await axios.post(`http://localhost:3001/api/courses/${selectedCourse.id}/request-access`, {
        studentId: user.id,
        message: requestMessage
      });
      setShowRequestModal(false);
      setRequestMessage('');
      setSelectedCourse(null);
      fetchData(user.id);
    } catch (err: any) {
      alert(err.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const locales: Record<string, string> = { tr: 'tr-TR', en: 'en-US', jp: 'ja-JP' };
    return new Date(dateString).toLocaleDateString(locales[language] || 'en-US', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <DashboardLayout requiredRoles={['student', 'guest', 'super_admin']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRoles={['student', 'guest', 'super_admin']}>
      <PageHeader
        title={`${t('hello')}, ${user.name}!`}
        description={t('student_panel')}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title={t('enrolled_courses')}
          value={enrolledCourses.length}
          icon={<BookIcon />}
        />
        <StatsCard
          title={t('upcoming_exams')}
          value={upcomingExams.length}
          icon={<ClipboardIcon />}
        />
        <StatsCard
          title={t('pending_requests')}
          value={availableCourses.filter(c => c.requestStatus === 'pending').length}
          icon={<ClockIcon />}
        />
      </div>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">📝 {t('upcoming_exams')}</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/student/exams')}>
              {t('view_all')} →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingExams.map(exam => (
              <Card key={exam.id} className="border-l-4 border-l-blue-500">
                <h3 className="font-semibold text-[var(--text-primary)]">{exam.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {formatDate(exam.startTime)}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  {t('duration')}: {exam.durationMinutes} {t('minutes')}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* My Courses */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">📚 {t('my_courses')}</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/student/courses')}>
            {t('view_all')} →
          </Button>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-[var(--text-secondary)]">{t('no_courses')}</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">{t('request_access_hint')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 6).map(course => (
              <Card key={course.id} className="border-l-4 border-l-emerald-500">
                <span className="badge badge-primary text-xs">{course.code}</span>
                <h3 className="font-semibold text-[var(--text-primary)] mt-2">{course.title}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-1">
                  {course.instructor?.name || t('instructor')}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Available Courses */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">🎓 {t('available_courses')}</h2>

        {availableCourses.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-[var(--text-secondary)]">{t('enrolled_all_courses')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCourses.map(course => (
              <Card key={course.id}>
                <div className="flex justify-between items-start">
                  <span className="badge text-xs">{course.code}</span>
                  {course.requestStatus === 'pending' && (
                    <span className="badge bg-yellow-100 text-yellow-700">{t('pending')}</span>
                  )}
                  {course.requestStatus === 'rejected' && (
                    <span className="badge bg-red-100 text-red-700">{t('rejected')}</span>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mt-2">{course.title}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-light)]">
                  <span className="text-xs text-[var(--text-tertiary)]">{course.instructor?.name}</span>
                  {course.requestStatus === 'pending' ? (
                    <span className="text-sm text-yellow-600">{t('request_sent')}</span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowRequestModal(true);
                      }}
                    >
                      {t('request_access')}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Request Modal */}
      {showRequestModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('request_access_title')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              <strong>{selectedCourse.code}</strong> - {selectedCourse.title}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('message_optional')}
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder={t('msg_instructor')}
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowRequestModal(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleRequestAccess} disabled={loading}>
                {loading ? t('sending') : t('send_request')}
              </Button>
            </div>
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