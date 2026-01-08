// InstructorExamsScreen - SOLID: Single Responsibility for listing instructor exams
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface InstructorExamsScreenProps {
    userId: number;
    onBack: () => void;
}

export const InstructorExamsScreen: React.FC<InstructorExamsScreenProps> = ({ userId, onBack }) => {
    const { t } = useLanguage();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const courses = await apiService.getInstructorCourses(userId);

            let allExams: any[] = [];
            for (const course of (courses || [])) {
                try {
                    const courseExams = await apiService.getCourseExams(course.id);
                    const formattedExams = (courseExams || []).map((e: any) => ({ ...e, courseName: course.title }));
                    allExams = [...allExams, ...formattedExams];
                } catch (err) {
                    console.log('Error fetching exams for course', course.id);
                }
            }
            setExams(allExams);
        } catch (err) {
            console.log('Error fetching exams:', err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Header title={`📝 ${t('my_exams')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                ) : exams.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyTitle}>{t('no_exams_title')}</Text>
                        <Text style={styles.emptyText}>{t('no_exams_instructor_text')}</Text>
                    </View>
                ) : (
                    exams.map((exam: any) => (
                        <View key={exam.id} style={styles.examCard}>
                            <View style={styles.examHeader}>
                                <Text style={styles.examTitle}>{exam.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: '#3b82f6' }]}>
                                    <Text style={styles.statusText}>{exam.durationMinutes} {t('minute_short')}</Text>
                                </View>
                            </View>
                            <Text style={styles.courseInstructor}>{exam.courseName}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default InstructorExamsScreen;
