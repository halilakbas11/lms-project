'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader } from '../../../../../components/layout';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';

interface Exam {
    id: number;
    title: string;
    durationMinutes: number;
    startTime?: string;
    endTime?: string;
    requiresSEB: boolean;
    sebConfigKey?: string;
    isOpticalExam: boolean;
    CourseId: number;
}

export default function EditExamPage() {
    const params = useParams();
    const examId = params.id as string;
    const router = useRouter();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        durationMinutes: 60,
        startTime: '',
        endTime: '',
        requiresSEB: false,
        sebConfigKey: '',
        isOpticalExam: false,
    });

    useEffect(() => {
        fetchExam();
    }, [examId]);

    const fetchExam = async () => {
        try {
            const res = await axios.get('/api/exams');
            const found = res.data.find((e: any) => e.id === parseInt(examId));
            if (found) {
                setExam(found);
                setForm({
                    title: found.title || '',
                    durationMinutes: found.durationMinutes || 60,
                    startTime: found.startTime ? found.startTime.slice(0, 16) : '',
                    endTime: found.endTime ? found.endTime.slice(0, 16) : '',
                    requiresSEB: found.requiresSEB || false,
                    sebConfigKey: found.sebConfigKey || '',
                    isOpticalExam: found.isOpticalExam || false,
                });
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`/api/exams/${examId}`, {
                ...form,
                startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
                endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
            });
            router.push('/dashboard/instructor/exams');
        } catch (err) {
            alert('Sınav güncellenirken bir hata oluştu.');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!confirm('Bu sınavı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        try {
            await axios.delete(`/api/exams/${examId}`);
            router.push('/dashboard/instructor/exams');
        } catch (err) {
            alert('Sınav silinirken bir hata oluştu.');
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

    if (!exam) {
        return (
            <DashboardLayout requiredRoles={['instructor', 'assistant']}>
                <div className="text-center py-16">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Sınav Bulunamadı</h2>
                    <Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard/instructor/exams')}>
                        Geri Dön
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['instructor', 'assistant']}>
            <PageHeader
                title="Sınav Düzenle"
                description={`"${exam.title}" sınavını düzenliyorsunuz.`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📝 Temel Bilgiler</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Sınav Başlığı *
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Süre (Dakika)
                                </label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    min="1"
                                    max="480"
                                    value={form.durationMinutes}
                                    onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📅 Zamanlama</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Başlangıç Tarihi ve Saati
                                </label>
                                <input
                                    type="datetime-local"
                                    className="input w-full"
                                    value={form.startTime}
                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Bitiş Tarihi ve Saati
                                </label>
                                <input
                                    type="datetime-local"
                                    className="input w-full"
                                    value={form.endTime}
                                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-3">
                            Boş bırakırsanız sınav taslak olarak kalır.
                        </p>
                    </Card>

                    {/* Exam Type */}
                    <Card>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📄 Sınav Türü</h2>
                        <label className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-light)] cursor-pointer hover:bg-[var(--bg-tertiary)]">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded"
                                checked={form.isOpticalExam}
                                onChange={e => setForm({ ...form, isOpticalExam: e.target.checked })}
                            />
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">📄 Optik Form Sınavı</p>
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    Öğrenciler kağıt üzerinde optik form dolduracak
                                </p>
                            </div>
                        </label>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* SEB Settings */}
                    <Card className="border-2 border-red-200 dark:border-red-900/50">
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">🔒 Güvenlik (SEB)</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded"
                                    checked={form.requiresSEB}
                                    onChange={e => setForm({ ...form, requiresSEB: e.target.checked })}
                                />
                                <div>
                                    <p className="font-medium text-[var(--text-primary)]">SEB Zorunlu</p>
                                    <p className="text-xs text-[var(--text-tertiary)]">
                                        Safe Exam Browser gerektirir
                                    </p>
                                </div>
                            </label>

                            {form.requiresSEB && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        SEB Config Key
                                    </label>
                                    <input
                                        type="text"
                                        className="input w-full text-sm"
                                        placeholder="SHA256 hash..."
                                        value={form.sebConfigKey}
                                        onChange={e => setForm({ ...form, sebConfigKey: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={handleSave}
                            disabled={saving || !form.title}
                        >
                            {saving ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={handleAddDemoQuestions}
                            disabled={saving}
                        >
                            ⚡ 4 Test Sorusu Ekle (D Şıkkı)
                        </Button>

                        <Button variant="secondary" className="w-full" onClick={() => router.back()}>
                            İptal
                        </Button>
                        <hr className="border-[var(--border-light)]" />
                        <Button
                            variant="ghost"
                            className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleDelete}
                        >
                            🗑️ Sınavı Sil
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
