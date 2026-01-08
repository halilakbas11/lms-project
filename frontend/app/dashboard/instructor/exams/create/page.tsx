'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout, PageHeader } from '../../../../components/layout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { useLanguage } from '../../../../i18n';

interface Course {
    id: number;
    title: string;
    code: string;
}

interface Question {
    id: number;
    text: string;
    type: string;
    category?: string;
    difficulty?: string;
    points: number;
}

interface ExamForm {
    title: string;
    durationMinutes: number;
    startTime: string;
    endTime: string;
    CourseId: number | null;
    requiresSEB: boolean;
    sebConfigKey: string;
    isOpticalExam: boolean;
    // SEB Security Settings (PDF Madde 11.1)
    sebQuitPassword: string;
    sebEnableClipboard: boolean;
    sebEnableScreenshot: boolean;
    sebEnableDevTools: boolean;
    sebEnableRightClick: boolean;
    sebEnableSpellCheck: boolean;
    sebShowTaskBar: boolean;
}

// Demo question bank (in real app, fetch from backend)
const demoQuestionBank: Question[] = [
    { id: 1, text: "SQL'de veri silmek için hangi komut kullanılır?", type: 'multiple_choice', category: 'Veritabanı', difficulty: 'easy', points: 5 },
    { id: 2, text: "Aşağıdaki veri tiplerinden hangileri sayısaldır?", type: 'multiple_selection', category: 'Programlama', difficulty: 'easy', points: 5 },
    { id: 3, text: "Primary Key null değer alabilir.", type: 'true_false', category: 'Veritabanı', difficulty: 'easy', points: 3 },
    { id: 4, text: "Kavramları tanımlarıyla eşleştirin.", type: 'matching', category: 'Genel', difficulty: 'medium', points: 10 },
    { id: 5, text: "Bubble Sort algoritmasını yazın.", type: 'long_answer', category: 'Algoritmalar', difficulty: 'hard', points: 20 },
    { id: 6, text: "Fibonacci fonksiyonunu yazın.", type: 'code_execution', category: 'Programlama', difficulty: 'medium', points: 15 },
    { id: 7, text: "SELECT komutu ne işe yarar?", type: 'short_answer', category: 'Veritabanı', difficulty: 'easy', points: 5 },
    { id: 8, text: "JOIN türlerini sıralayın.", type: 'ordering', category: 'Veritabanı', difficulty: 'medium', points: 8 },
    { id: 9, text: "x = 5 + 3 * 2 sonucu nedir?", type: 'calculation', category: 'Programlama', difficulty: 'easy', points: 5 },
    { id: 10, text: "WHERE komutu hangi amaçla kullanılır?", type: 'fill_blank', category: 'Veritabanı', difficulty: 'easy', points: 5 },
];

function CreateExamContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedCourseId = searchParams.get('courseId');
    const { t } = useLanguage();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [activeStep, setActiveStep] = useState(1);

    // Question selection state
    const [questionBank] = useState<Question[]>(demoQuestionBank);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [questionSelectionMode, setQuestionSelectionMode] = useState<'manual' | 'random' | 'byType'>('manual');
    const [randomCount, setRandomCount] = useState(10);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [questionsPerType, setQuestionsPerType] = useState(2);

    const [form, setForm] = useState<ExamForm>({
        title: '',
        durationMinutes: 60,
        startTime: '',
        endTime: '',
        CourseId: preselectedCourseId ? parseInt(preselectedCourseId) : null,
        requiresSEB: false,
        sebConfigKey: '',
        isOpticalExam: false,
        // SEB Security Settings - All disabled by default (max security)
        sebQuitPassword: '',
        sebEnableClipboard: false,
        sebEnableScreenshot: false,
        sebEnableDevTools: false,
        sebEnableRightClick: false,
        sebEnableSpellCheck: false,
        sebShowTaskBar: false,
    });

    // Question types matching the question bank - dynamic based on t
    const questionTypes = [
        { value: 'multiple_choice', label: t('multiple_choice'), icon: '◉' },
        { value: 'multiple_selection', label: t('multiple_selection'), icon: '☑' },
        { value: 'true_false', label: t('true_false'), icon: '✓✗' },
        { value: 'matching', label: t('matching'), icon: '⇄' },
        { value: 'ordering', label: t('ordering'), icon: '↕' },
        { value: 'fill_blank', label: t('fill_blank'), icon: '___' },
        { value: 'short_answer', label: t('short_answer'), icon: '✎' },
        { value: 'long_answer', label: t('long_answer'), icon: '📝' },
        { value: 'calculation', label: t('calculation'), icon: '🔢' },
        { value: 'code_execution', label: t('code_execution'), icon: '💻' },
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchCourses(userData.id);
        }
    }, []);

    useEffect(() => {
        if (preselectedCourseId) {
            setForm(prev => ({ ...prev, CourseId: parseInt(preselectedCourseId) }));
        }
    }, [preselectedCourseId]);

    const fetchCourses = async (instructorId: number) => {
        try {
            const res = await axios.get('http://localhost:3001/api/courses');
            const filtered = res.data.filter((c: any) =>
                c.instructorId === instructorId || c.instructor?.id === instructorId
            );
            setCourses(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.CourseId) {
            alert(t('validation_title_course'));
            return;
        }

        setLoading(true);
        try {
            // Create exam
            const examRes = await axios.post('http://localhost:3001/api/exams', {
                ...form,
                startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
                endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
            });

            // Add selected questions to exam (optional - skip if none selected)
            const examId = examRes.data.id;
            const questionsToAdd = getQuestionsToAdd();

            if (questionsToAdd.length > 0) {
                for (const q of questionsToAdd) {
                    try {
                        await axios.post('http://localhost:3001/api/questions', {
                            ExamId: examId,
                            text: q.text,
                            type: q.type,
                            points: q.points,
                            correctAnswer: '', // Optional
                        });
                    } catch (qErr) {
                        console.warn('Soru eklenemedi:', q.text, qErr);
                        // Continue with other questions
                    }
                }
            }

            if (preselectedCourseId) {
                router.push(`/dashboard/instructor/courses/${preselectedCourseId}`);
            } else {
                router.push('/dashboard/instructor/exams');
            }
        } catch (err) {
            console.error(err);
            alert(t('error_create_exam'));
        }
        setLoading(false);
    };

    const handleChange = (field: keyof ExamForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleQuestionSelection = (id: number) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const getQuestionsToAdd = (): Question[] => {
        if (questionSelectionMode === 'manual') {
            return questionBank.filter(q => selectedQuestions.includes(q.id));
        } else if (questionSelectionMode === 'random') {
            const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, randomCount);
        } else {
            // By type
            const result: Question[] = [];
            selectedTypes.forEach(type => {
                const typeQuestions = questionBank.filter(q => q.type === type);
                const shuffled = [...typeQuestions].sort(() => 0.5 - Math.random());
                result.push(...shuffled.slice(0, questionsPerType));
            });
            return result;
        }
    };

    const getTotalPoints = () => {
        return getQuestionsToAdd().reduce((sum, q) => sum + q.points, 0);
    };

    return (
        <DashboardLayout requiredRoles={['instructor', 'assistant']}>
            <PageHeader
                title={t('create_new_exam')}
                description={t('create_exam_desc')}
            />

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map(step => (
                    <button
                        key={step}
                        onClick={() => setActiveStep(step)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeStep === step
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : activeStep > step
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                            }`}
                    >
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                            {activeStep > step ? '✓' : step}
                        </span>
                        <span className="hidden sm:inline">
                            {step === 1 ? t('basic_info') : step === 2 ? t('question_selection') : t('settings')}
                        </span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {activeStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <InfoIcon /> {t('basic_info')}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                            {t('exam_title')} *
                                        </label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            placeholder={t('exam_title_placeholder')}
                                            value={form.title}
                                            onChange={e => handleChange('title', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                            {t('course')} *
                                        </label>
                                        <select
                                            className="input w-full"
                                            value={form.CourseId || ''}
                                            onChange={e => handleChange('CourseId', e.target.value ? parseInt(e.target.value) : null)}
                                            required
                                        >
                                            <option value="">{t('select_course')}</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.code} - {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                                {t('duration_min')}
                                            </label>
                                            <input
                                                type="number"
                                                className="input w-full"
                                                min="1"
                                                max="480"
                                                value={form.durationMinutes}
                                                onChange={e => handleChange('durationMinutes', parseInt(e.target.value) || 60)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                                {t('exam_type')}
                                            </label>
                                            <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.isOpticalExam}
                                                    onChange={e => handleChange('isOpticalExam', e.target.checked)}
                                                />
                                                <span>📄 {t('optical_form')}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                                {t('start_date_time')}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="input w-full"
                                                value={form.startTime}
                                                onChange={e => handleChange('startTime', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                                {t('end_date_time')}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="input w-full"
                                                value={form.endTime}
                                                onChange={e => handleChange('endTime', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div>
                            <Card className="sticky top-4">
                                <h3 className="font-bold text-[var(--text-primary)] mb-4">{t('progress')}</h3>
                                <div className="space-y-2 text-sm">
                                    <p className={form.title ? 'text-emerald-600' : 'text-[var(--text-tertiary)]'}>
                                        {form.title ? '✓' : '○'} {t('title_entered')}
                                    </p>
                                    <p className={form.CourseId ? 'text-emerald-600' : 'text-[var(--text-tertiary)]'}>
                                        {form.CourseId ? '✓' : '○'} {t('course_selected')}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="w-full mt-4"
                                    onClick={() => setActiveStep(2)}
                                    disabled={!form.title || !form.CourseId}
                                >
                                    {t('continue')} →
                                </Button>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Step 2: Question Selection */}
                {activeStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Selection Mode */}
                        <Card>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📝 {t('question_selection_mode')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { mode: 'manual', label: t('manual_selection'), desc: t('manual_desc'), icon: '✋' },
                                    { mode: 'random', label: t('random_selection'), desc: t('random_desc'), icon: '🎲' },
                                    { mode: 'byType', label: t('by_type_selection'), desc: t('by_type_desc'), icon: '📊' },
                                ].map(option => (
                                    <button
                                        key={option.mode}
                                        type="button"
                                        onClick={() => setQuestionSelectionMode(option.mode as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${questionSelectionMode === option.mode
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-[var(--border-light)] hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{option.icon}</div>
                                        <div className="font-semibold text-[var(--text-primary)]">{option.label}</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">{option.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Random Selection Options */}
                        {questionSelectionMode === 'random' && (
                            <Card className="animate-fade-in">
                                <h3 className="font-bold text-[var(--text-primary)] mb-4">🎲 {t('random_question_count')}</h3>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        className="input w-32"
                                        min="1"
                                        max={questionBank.length}
                                        value={randomCount}
                                        onChange={e => setRandomCount(parseInt(e.target.value) || 5)}
                                    />
                                    <span className="text-[var(--text-secondary)]">
                                        {t('questions_to_select')} ({t('total_questions_available').replace('{count}', questionBank.length.toString())})
                                    </span>
                                </div>
                            </Card>
                        )}

                        {/* Type-based Selection */}
                        {questionSelectionMode === 'byType' && (
                            <Card className="animate-fade-in">
                                <h3 className="font-bold text-[var(--text-primary)] mb-4">📊 {t('question_type_selection')}</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        {t('questions_per_type')}
                                    </label>
                                    <input
                                        type="number"
                                        className="input w-32"
                                        min="1"
                                        max="10"
                                        value={questionsPerType}
                                        onChange={e => setQuestionsPerType(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {questionTypes.map(type => {
                                        const count = questionBank.filter(q => q.type === type.value).length;
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTypes(prev =>
                                                        prev.includes(type.value)
                                                            ? prev.filter(t => t !== type.value)
                                                            : [...prev, type.value]
                                                    );
                                                }}
                                                className={`p-3 rounded-xl border text-center transition-all ${selectedTypes.includes(type.value)
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-[var(--border-light)]'
                                                    }`}
                                            >
                                                <div className="text-xl mb-1">{type.icon}</div>
                                                <div className="text-xs font-medium truncate">{type.label}</div>
                                                <div className="text-[10px] text-[var(--text-tertiary)]">{t('question_count_type').replace('{count}', count.toString())}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        {/* Manual Selection - Question List */}
                        {questionSelectionMode === 'manual' && (
                            <Card className="animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[var(--text-primary)]">✋ {t('question_selection')}</h3>
                                    <span className="text-sm text-[var(--text-secondary)]">
                                        {t('selected_summary').replace('{count}', selectedQuestions.length.toString())}
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {questionBank.map(q => (
                                        <label
                                            key={q.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedQuestions.includes(q.id)
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-[var(--border-light)] hover:bg-[var(--bg-tertiary)]'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.includes(q.id)}
                                                onChange={() => toggleQuestionSelection(q.id)}
                                                className="w-5 h-5 rounded"
                                            />
                                            <span className="text-xl">
                                                {questionTypes.find(t => t.value === q.type)?.icon || '?'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium text-[var(--text-primary)] line-clamp-1">{q.text}</p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    {questionTypes.find(t => t.value === q.type)?.label} · {q.points} {t('points')}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Summary & Navigation */}
                        <div className="flex items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setActiveStep(1)}>
                                ← {t('back')}
                            </Button>
                            <div className="text-center">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {t('selected_summary').replace('{count}', getQuestionsToAdd().length.toString())} ·
                                    {t('total_points_summary').replace('{points}', getTotalPoints().toString())}
                                </p>
                            </div>
                            <Button type="button" variant="primary" onClick={() => setActiveStep(3)}>
                                {t('continue')} →
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Security & Submit */}
                {activeStep === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        <div className="lg:col-span-2 space-y-6">
                            {/* SEB Settings */}
                            <Card className="border-2 border-red-200 dark:border-red-900/50">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <LockIcon /> {t('security_seb')}
                                </h2>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-light)] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded"
                                            checked={form.requiresSEB}
                                            onChange={e => handleChange('requiresSEB', e.target.checked)}
                                        />
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">🔒 {t('seb_required')}</p>
                                            <p className="text-sm text-[var(--text-tertiary)]">
                                                {t('seb_hint')}
                                            </p>
                                        </div>
                                    </label>

                                    {form.requiresSEB && (
                                        <div className="space-y-4 animate-fade-in border-l-4 border-red-500 pl-4">
                                            {/* Browser Key */}
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                                    {t('seb_config_key')}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input w-full"
                                                    placeholder="SHA256 hash..."
                                                    value={form.sebConfigKey}
                                                    onChange={e => handleChange('sebConfigKey', e.target.value)}
                                                />
                                            </div>

                                            {/* Quit Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                                    🔑 SEB Çıkış Şifresi (Opsiyonel)
                                                </label>
                                                <input
                                                    type="password"
                                                    className="input w-full"
                                                    placeholder="Öğrencinin SEB'den çıkması için şifre..."
                                                    value={form.sebQuitPassword}
                                                    onChange={e => handleChange('sebQuitPassword', e.target.value)}
                                                />
                                            </div>

                                            {/* Security Toggles Grid */}
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">⚙️ Güvenlik Ayarları</p>
                                                <p className="text-xs text-[var(--text-tertiary)] mb-3">İşaretli özellikler öğrenciye <strong>izin verilecek</strong> anlamındadır. Güvenlik için tümünü kapalı bırakın.</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { key: 'sebEnableClipboard', label: '📋 Kopyala/Yapıştır', icon: '📋' },
                                                        { key: 'sebEnableScreenshot', label: '📸 Ekran Görüntüsü', icon: '📸' },
                                                        { key: 'sebEnableDevTools', label: '🛠️ Geliştirici Araçları', icon: '🛠️' },
                                                        { key: 'sebEnableRightClick', label: '🖱️ Sağ Tık Menü', icon: '🖱️' },
                                                        { key: 'sebEnableSpellCheck', label: '✏️ Yazım Denetimi', icon: '✏️' },
                                                        { key: 'sebShowTaskBar', label: '📊 Görev Çubuğu', icon: '📊' },
                                                    ].map(item => (
                                                        <label
                                                            key={item.key}
                                                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${form[item.key as keyof ExamForm]
                                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                                                : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={form[item.key as keyof ExamForm] as boolean}
                                                                onChange={e => handleChange(item.key as keyof ExamForm, e.target.checked)}
                                                                className="w-4 h-4 rounded"
                                                            />
                                                            <span className="text-sm">{item.label}</span>
                                                            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${form[item.key as keyof ExamForm] ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
                                                                {form[item.key as keyof ExamForm] ? 'İZİN VERİLDİ' : 'ENGELLİ'}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            ⚠️ {t('seb_warning')}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Final Summary */}
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📋 {t('exam_summary')}</h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{t('exam_title')}:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{form.title || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{t('duration')}:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{form.durationMinutes} {t('minutes')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{t('question_count')}:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{getQuestionsToAdd().length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{t('total')} {t('points')}:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{getTotalPoints()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{t('optical')}:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{form.isOpticalExam ? t('yes') : t('no')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{t('seb_active')}:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{form.requiresSEB ? t('yes') : t('no')}</span>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {t('creating')}
                                        </>
                                    ) : (
                                        <>
                                            <SaveIcon /> {t('create_exam_btn')}
                                        </>
                                    )}
                                </Button>
                                <Button type="button" variant="ghost" className="w-full" onClick={() => setActiveStep(2)}>
                                    ← {t('back')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </DashboardLayout>
    );
}

export default function CreateExamPage() {
    return (
        <Suspense fallback={
            <DashboardLayout requiredRoles={['instructor', 'assistant']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        }>
            <CreateExamContent />
        </Suspense>
    );
}

// Icons
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
