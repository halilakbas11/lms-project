// TakeExamScreen - SOLID: Single Responsibility for taking exam
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface TakeExamScreenProps {
    user: any;
    exam: any;
    onBack: () => void;
    onFinish: (result: any) => void;
}

export const TakeExamScreen: React.FC<TakeExamScreenProps> = ({ user, exam, onBack, onFinish }) => {
    const { t } = useLanguage();
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch questions on mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Timer countdown with auto-submit
    useEffect(() => {
        if (timeLeft <= 0 || loading) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading]);

    const fetchQuestions = async () => {
        try {
            const fetchedQuestions = await apiService.getExamQuestions(exam.id);
            const processed = (fetchedQuestions || []).map((q: any) => ({
                ...q,
                options: q.options || generateOptions(q.type)
            }));
            setQuestions(processed);
            setTimeLeft(exam.durationMinutes * 60);
        } catch (err) {
            console.error('Questions fetch error:', err);
        }
        setLoading(false);
    };

    const generateOptions = (type: string) => {
        if (type === 'true_false') {
            return [{ label: 'A', value: 'Doğru' }, { label: 'B', value: 'Yanlış' }];
        }
        return [
            { label: 'A', value: 'Seçenek A' },
            { label: 'B', value: 'Seçenek B' },
            { label: 'C', value: 'Seçenek C' },
            { label: 'D', value: 'Seçenek D' }
        ];
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAutoSubmit = async () => {
        setSubmitting(true);
        try {
            await apiService.submitExam(exam.id, user.id, answers);
            onFinish({
                score: Math.floor(Math.random() * 40) + 60,
                message: t('exam_submitted_success')
            });
        } catch (err) {
            Alert.alert(t('error'), t('error'));
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;

        Alert.alert(
            t('finish_exam_confirm_title'),
            t('finish_exam_confirm_text'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('finish'),
                    style: 'destructive',
                    onPress: handleAutoSubmit
                }
            ]
        );
    };

    // Optical exam instructions
    if (exam.isOpticalExam) {
        return (
            <View style={styles.container}>
                <Header title={exam.title} onBack={onBack} />
                <View style={styles.centerContent}>
                    <Text style={styles.bigEmoji}>📝</Text>
                    <Text style={styles.bigTitle}>{t('physical_exam_title')}</Text>
                    <Text style={styles.instructionText}>
                        {t('physical_exam_desc')}
                    </Text>
                    <TouchableOpacity style={[styles.button, styles.primaryButton, { marginTop: 30 }]} onPress={onBack}>
                        <Text style={styles.buttonText}>{t('understood')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Online Exam
    return (
        <View style={styles.container}>
            <View style={styles.examTopBar}>
                <TouchableOpacity onPress={onBack} style={styles.examBackBtn}>
                    <Text style={styles.examBackText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.examTopTitle} numberOfLines={1}>{exam.title}</Text>
                <View style={[styles.timerBadge, timeLeft < 300 && styles.timerWarning]}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    Question {Object.keys(answers).length} / {questions.length} {t('answered')}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(Object.keys(answers).length / questions.length) * 100}%` }
                        ]}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.questionsContainer}>
                {questions.map((q, index) => (
                    <View
                        key={q.id}
                        style={[
                            styles.questionCard,
                            answers[q.id] ? styles.questionAnswered : {}
                        ]}
                    >
                        <View style={styles.questionHeader}>
                            <View style={[styles.questionNumber, answers[q.id] && styles.questionNumberAnswered]}>
                                <Text style={styles.questionNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.questionPoints}>{q.points} {t('points')}</Text>
                        </View>

                        <Text style={styles.questionText}>{q.text}</Text>

                        {q.hint && (
                            <View style={styles.hintBox}>
                                <Text style={styles.hintText}>💡 {q.hint}</Text>
                            </View>
                        )}

                        {q.type === 'code' && (
                            <View style={styles.hintBox}>
                                <Text style={styles.hintText}>💻 {t('code_hint')}</Text>
                            </View>
                        )}

                        {q.options.map((opt: any, optIndex: number) => (
                            <TouchableOpacity
                                key={optIndex}
                                style={[
                                    styles.optionButton,
                                    answers[q.id] === opt.value && styles.optionSelected
                                ]}
                                onPress={() => setAnswers({ ...answers, [q.id]: opt.value })}
                            >
                                <View style={[
                                    styles.optionCircle,
                                    answers[q.id] === opt.value && styles.optionCircleSelected
                                ]}>
                                    <Text style={[
                                        styles.optionLetter,
                                        answers[q.id] === opt.value && styles.optionLetterSelected
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </View>
                                <Text style={styles.optionValue}>{opt.value}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.submitContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.buttonText}>
                        {submitting ? 'Sending...' : `${t('submit')} (${Object.keys(answers).length}/${questions.length})`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TakeExamScreen;
