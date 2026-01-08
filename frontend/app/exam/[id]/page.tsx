'use client';
import { useEffect, useState, useRef, use } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';
import ExamSecurityProvider from './ExamSecurityProvider';

interface Question {
    id: number;
    text: string;
    type: string;
    options?: { label: string; value: string }[];
    points: number;
}

interface ExamData {
    id: number;
    title: string;
    durationMinutes: number;
    startTime?: string;
    endTime?: string;
    requiresSEB: boolean;
    isOpticalExam: boolean;
    Questions?: Question[];
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // General States
    const [exam, setExam] = useState<ExamData | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSebBrowser, setIsSebBrowser] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Answers State
    const [answers, setAnswers] = useState<Record<number, string>>({});

    // Timer State
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Camera States (for proctoring)
    const webcamRef = useRef<Webcam>(null);
    const [logCount, setLogCount] = useState(0);

    // Optical Reader States
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [detectedAnswers, setDetectedAnswers] = useState<string[] | null>(null);

    useEffect(() => {
        // 1. Browser Check (User-Agent)
        setIsSebBrowser(navigator.userAgent.includes("SEB"));

        // 2. Fetch Exam Data with Questions
        if (id) {
            fetchExamWithQuestions();
        }
    }, [id]);

    const fetchExamWithQuestions = async () => {
        try {
            // Fetch exam details
            const examRes = await axios.get(`/api/exams/${id}`);
            setExam(examRes.data);

            // Fetch questions for this exam
            const questionsRes = await axios.get(`/api/exams/${id}/questions`);
            const fetchedQuestions = questionsRes.data || [];

            // If no questions in DB, use the exam's Questions array
            if (fetchedQuestions.length === 0 && examRes.data.Questions) {
                setQuestions(examRes.data.Questions.map((q: any) => ({
                    ...q,
                    options: generateOptions(q.type)
                })));
            } else {
                setQuestions(fetchedQuestions.map((q: any) => ({
                    ...q,
                    options: q.options || generateOptions(q.type)
                })));
            }

            // Set timer
            if (examRes.data.durationMinutes) {
                setTimeLeft(examRes.data.durationMinutes * 60);
            }
        } catch (err) {
            console.error('Error fetching exam:', err);
        }
        setLoading(false);
    };

    // Generate default options based on question type
    const generateOptions = (type: string) => {
        if (type === 'true_false') {
            return [
                { label: 'A', value: 'Doğru' },
                { label: 'B', value: 'Yanlış' }
            ];
        }
        if (type === 'multiple_choice' || type === 'code_execution') {
            return [
                { label: 'A', value: 'Seçenek A' },
                { label: 'B', value: 'Seçenek B' },
                { label: 'C', value: 'Seçenek C' },
                { label: 'D', value: 'Seçenek D' }
            ];
        }
        return [];
    };

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0 || loading) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading]);

    // Proctoring: Send snapshot every 5 seconds
    useEffect(() => {
        if (!loading && exam && isSebBrowser) {
            const interval = setInterval(() => {
                captureAndSendLog();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [loading, exam, isSebBrowser]);

    const captureAndSendLog = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const storedUser = localStorage.getItem('user');
                const userId = storedUser ? JSON.parse(storedUser).id : 1;

                axios.post('/api/exams/log', {
                    studentId: userId,
                    examId: id,
                    imageSnapshot: imageSrc
                }).then(() => {
                    setLogCount(prev => prev + 1);
                }).catch(e => console.error("Log error"));
            }
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmitExam = async () => {
        if (!confirm('Sınavı bitirmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        setSubmitting(true);
        try {
            const storedUser = localStorage.getItem('user');
            const userId = storedUser ? JSON.parse(storedUser).id : 1;

            await axios.post(`/api/exams/${id}/submit`, {
                studentId: userId,
                answers: answers,
                opticalImage: imgSrc
            });

            alert("✅ Sınav Başarıyla Gönderildi!");

            // If in SEB browser (Electron app with SEB mode), exit the secure browser
            if (isSebBrowser && typeof window !== 'undefined' && (window as any).electronAPI?.exitSebMode) {
                try {
                    await (window as any).electronAPI.exitSebMode('exam_completed');
                } catch (e) {
                    console.error('Failed to exit SEB mode:', e);
                }
            }

            router.push('/dashboard/student');
        } catch (error) {
            console.error('Submit error:', error);
            alert("❌ Gönderim Hatası! Lütfen tekrar deneyin.");
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'multiple_choice': 'Çoktan Seçmeli',
            'multiple_selection': 'Çoklu Seçim',
            'true_false': 'Doğru/Yanlış',
            'short_answer': 'Kısa Cevap',
            'long_answer': 'Uzun Cevap',
            'code_execution': 'Kod Çalıştırma',
            'calculation': 'Hesaplama',
            'fill_blank': 'Boşluk Doldurma',
            'matching': 'Eşleştirme',
            'ordering': 'Sıralama'
        };
        return types[type] || type;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Sınav yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <p className="text-red-500 text-xl font-bold">❌ Sınav bulunamadı!</p>
                    <button
                        onClick={() => router.push('/dashboard/student')}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Dashboard'a Dön
                    </button>
                </div>
            </div>
        );
    }

    // SEB Warning
    if (exam.requiresSEB && !isSebBrowser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border-t-4 border-red-600">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">🔒 Güvenli Tarayıcı Gerekiyor</h1>
                    <p className="text-gray-600 mb-6">Bu sınava ({exam.title}) sadece SEB ile girebilirsiniz.</p>
                    <a
                        href={`/api/exams/${id}/seb-config`}
                        className="block w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition shadow-lg"
                    >
                        ⬇️ Sınav Giriş Dosyasını İndir (.seb)
                    </a>
                </div>
            </div>
        );
    }

    // Get stored user for security provider
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const userId = storedUser ? JSON.parse(storedUser).id : 1;

    // Main Exam Screen - Wrapped with ExamSecurityProvider for SEB exams
    return (
        <ExamSecurityProvider
            examId={id}
            studentId={userId}
            isSebBrowser={isSebBrowser}
            onViolation={(type) => console.log('Security violation:', type)}
        >
            <div className="min-h-screen bg-gray-50 pb-32">
                {/* Header */}
                <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
                    <h2 className="font-mono text-lg font-bold truncate max-w-[200px]">{exam.title}</h2>

                    <div className="flex items-center gap-4">
                        {/* Timer */}
                        <div className={`font-mono text-lg font-bold px-4 py-1 rounded ${timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                            }`}>
                            ⏱️ {formatTime(timeLeft)}
                        </div>

                        {/* Proctoring indicator */}
                        {isSebBrowser && (
                            <div className="flex items-center gap-2 bg-red-900 px-3 py-1 rounded">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold">CANLI İZLEME ({logCount})</span>
                            </div>
                        )}
                    </div>

                    {/* Hidden Webcam */}
                    <div style={{ position: 'absolute', top: -1000, left: -1000, visibility: 'hidden' }}>
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            width={320}
                            height={240}
                            videoConstraints={{ facingMode: "user" }}
                        />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white border-b px-4 py-2 sticky top-[56px] z-40">
                    <div className="max-w-3xl mx-auto flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Cevaplanan: <strong>{Object.keys(answers).length}</strong> / {questions.length}
                        </span>
                        <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                style={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-gray-600 font-medium">{questions.length} Soru</span>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto p-6 space-y-6">
                    {/* Questions */}
                    {questions.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow text-center">
                            <p className="text-gray-500 text-lg">Bu sınava henüz soru eklenmemiş.</p>
                        </div>
                    ) : (
                        questions.map((q, index) => (
                            <div
                                key={q.id}
                                className={`bg-white p-6 rounded-xl shadow-sm border-2 transition-all ${answers[q.id] ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${answers[q.id] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                            {getQuestionTypeLabel(q.type)}
                                        </span>
                                        <span className="text-xs text-gray-500">{q.points} puan</span>
                                    </div>
                                </div>

                                <p className="font-medium text-lg text-gray-900 mb-4">{q.text}</p>

                                {/* Code execution hint */}
                                {q.type === 'code_execution' && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                        💡 <strong>İpucu:</strong> Kodu çalıştırın ve çıktıya en yakın seçeneği işaretleyin.
                                    </div>
                                )}

                                {/* Options */}
                                {(q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'code_execution') && (
                                    <div className="space-y-2">
                                        {(q.options || generateOptions(q.type)).map((opt) => (
                                            <label
                                                key={opt.label}
                                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[q.id] === opt.label
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    value={opt.label}
                                                    checked={answers[q.id] === opt.label}
                                                    onChange={() => handleAnswerChange(q.id, opt.label)}
                                                    className="w-5 h-5 text-blue-600"
                                                />
                                                <span className="font-bold text-gray-700">{opt.label})</span>
                                                <span className="text-gray-700">{opt.value}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Short answer */}
                                {(q.type === 'short_answer' || q.type === 'fill_blank') && (
                                    <input
                                        type="text"
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="Cevabınızı yazın..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                )}

                                {/* Long answer */}
                                {q.type === 'long_answer' && (
                                    <textarea
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none min-h-[150px]"
                                        placeholder="Cevabınızı detaylı yazın..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                )}

                                {/* Calculation */}
                                {q.type === 'calculation' && (
                                    <input
                                        type="number"
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="Sayısal cevabınızı girin..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))
                    )}

                    {/* Optical Form Section */}
                    {exam.isOpticalExam && (
                        <div className="bg-gray-900 text-white p-8 rounded-xl shadow-2xl text-center">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-2">📸 Optik Form</h3>
                            <p className="text-gray-300">Optik form için mobil uygulamayı kullanın.</p>
                        </div>
                    )}
                </div>

                {/* Fixed Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-bold text-lg text-gray-900">{Object.keys(answers).length}</span>
                            <span> / {questions.length} soru cevaplandı</span>
                        </div>
                        <button
                            onClick={handleSubmitExam}
                            disabled={submitting}
                            className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${submitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    Gönderiliyor...
                                </>
                            ) : (
                                '✅ Sınavı Bitir ve Gönder'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </ExamSecurityProvider>
    );
}