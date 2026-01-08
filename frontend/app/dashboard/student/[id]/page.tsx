'use client';
import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Exam {
  id: number;
  title: string;
  durationMinutes: number;
  isOpticalExam: boolean;
}

export default function StudentCourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3001/api/courses/${id}/exams`)
        .then(res => setExams(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <DashboardLayout requiredRoles={['student', 'guest']}>
      <PageHeader
        title="Ders Detayı"
        description="Ders içerikleri ve sınavlar"
        actions={
          <Button variant="secondary" onClick={() => router.back()}>
            ← Derslere Dön
          </Button>
        }
      />

      {/* Course Modules */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          Ders İçerikleri
        </h2>

        <div className="space-y-3">
          {[
            { title: 'Giriş ve Temel Kavramlar', type: 'video', duration: '45 dk', completed: true },
            { title: 'SQL Temelleri', type: 'pdf', pages: '32 sayfa', completed: true },
            { title: 'İlişkisel Model', type: 'video', duration: '60 dk', completed: false },
            { title: 'Uygulama: Sorgu Yazma', type: 'quiz', questions: '10 soru', completed: false },
          ].map((module, i) => (
            <Card key={i} className="flex items-center justify-between" padding="sm">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${module.type === 'video' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                    module.type === 'pdf' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                  }`}>
                  {module.type === 'video' ? '▶' : module.type === 'pdf' ? '📄' : '❓'}
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{module.title}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {module.duration || module.pages || module.questions}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {module.completed && (
                  <span className="text-emerald-500 text-sm">✓ Tamamlandı</span>
                )}
                <Button variant="ghost" size="sm">Aç</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Exams */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
          Sınavlar
        </h2>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <div key={i} className="card p-6">
                <div className="skeleton h-6 w-1/3 mb-2" />
                <div className="skeleton h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-[var(--text-tertiary)]">Bu derse ait aktif sınav bulunmuyor.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam, index) => (
              <Card
                key={exam.id}
                className="flex items-center justify-between animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exam.isOpticalExam
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
                    }`}>
                    📝
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{exam.title}</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">⏱️ {exam.durationMinutes} Dakika</p>
                    {exam.isOpticalExam && (
                      <span className="badge badge-danger text-xs mt-1">🔒 SEB + Kamera Zorunlu</span>
                    )}
                  </div>
                </div>

                <div>
                  {exam.isOpticalExam ? (
                    <div className="text-right">
                      <a
                        href={`http://localhost:3001/api/exams/${exam.id}/seb-config`}
                        className="btn-primary text-sm"
                      >
                        ⬇️ SEB Dosyasını İndir
                      </a>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                        Dosyaya çift tıklayarak girin
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/exam/${exam.id}`)}
                    >
                      Sınava Başla →
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}