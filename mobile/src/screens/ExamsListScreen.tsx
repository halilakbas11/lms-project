// ExamsListScreen - SOLID: Single Responsibility for listing exams
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface ExamsListScreenProps {
    userId: number;
    enrolledCourses: any[];
    onBack: () => void;
    onSelectExam: (exam: any) => void;
}

export const ExamsListScreen: React.FC<ExamsListScreenProps> = ({ userId, enrolledCourses, onBack, onSelectExam }) => {
    const { t } = useLanguage();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            // Fetch exams for enrolled courses only
            const courseIds = enrolledCourses.map((c: any) => c.id);

            if (courseIds.length === 0) {
                setExams([]);
                setLoading(false);
                return;
            }

            // Fetch all exams and filter by enrolled courses (or improved backend query)
            const allExams = await apiService.getExams();
            const enrolledExams = allExams.filter((e: any) =>
                courseIds.includes(e.Course?.id) || courseIds.includes((e as any).CourseId)
            );

            setExams(enrolledExams);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const getExamStatus = (exam: any) => {
        const now = new Date();
        if (!exam.startTime) return { label: t('draft'), color: '#64748b' };
        const start = new Date(exam.startTime);
        const end = exam.endTime ? new Date(exam.endTime) : null;

        if (now < start) return { label: t('scheduled'), color: '#3b82f6' };
        if (end && now > end) return { label: t('completed'), color: '#8b5cf6' };
        return { label: t('active'), color: '#10b981' };
    };

    return (
        <View style={styles.container}>
            <Header title={`📝 ${t('my_exams')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading && (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>{t('exams_loading')}</Text>
                    </View>
                )}

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchExams} style={styles.retryButton}>
                            <Text style={styles.retryText}>{t('retry')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!loading && !error && exams.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>{t('no_exams_title')}</Text>
                        <Text style={styles.emptyText}>{t('no_active_exams_text')}</Text>
                    </View>
                )}

                {!loading && !error && exams.map(exam => {
                    const status = getExamStatus(exam);
                    return (
                        <View key={exam.id} style={styles.examCard}>
                            <View style={styles.examHeader}>
                                <Text style={styles.examTitle}>{exam.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                    <Text style={styles.statusText}>{status.label}</Text>
                                </View>
                            </View>

                            <View style={styles.examDetails}>
                                <View style={styles.examDetail}>
                                    <Text style={styles.detailIcon}>⏱️</Text>
                                    <Text style={styles.detailText}>{exam.durationMinutes} {t('minutes')}</Text>
                                </View>
                                <View style={styles.examDetail}>
                                    <Text style={styles.detailIcon}>{exam.isOpticalExam ? '📄' : '💻'}</Text>
                                    <Text style={styles.detailText}>{exam.isOpticalExam ? t('optical') : t('online')}</Text>
                                </View>
                                {exam.requiresSEB && (
                                    <View style={styles.examDetail}>
                                        <Text style={styles.detailIcon}>🔒</Text>
                                        <Text style={styles.detailText}>SEB</Text>
                                    </View>
                                )}
                            </View>

                            {exam.isOpticalExam ? (
                                <TouchableOpacity
                                    style={[styles.button, styles.opticalButton]}
                                    onPress={() => onSelectExam(exam)}
                                >
                                    <Text style={styles.buttonTextDark}>📄 {t('optical_instructions')}</Text>
                                </TouchableOpacity>
                            ) : exam.requiresSEB ? (
                                <View style={styles.sebWarning}>
                                    <Text style={styles.sebWarningIcon}>🔒</Text>
                                    <Text style={styles.sebWarningText}>
                                        {t('seb_required')}
                                    </Text>
                                </View>
                            ) : status.label === t('active') ? (
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryButton]}
                                    onPress={() => onSelectExam(exam)}
                                >
                                    <Text style={styles.buttonText}>🚀 {t('start_exam')}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default ExamsListScreen;
