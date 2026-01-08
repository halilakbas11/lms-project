// AdminCoursesScreen - SOLID: Single Responsibility for listing all courses (admin)
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface AdminCoursesScreenProps {
    onBack: () => void;
}

export const AdminCoursesScreen: React.FC<AdminCoursesScreenProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await apiService.getCourses();
            setCourses(data || []);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Header title={`📚 ${t('all_courses')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                ) : courses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📚</Text>
                        <Text style={styles.emptyTitle}>{t('no_courses_title')}</Text>
                        <Text style={styles.emptyText}>Sistemde ders yok.</Text>
                    </View>
                ) : (
                    courses.map((course: any) => (
                        <View key={course.id} style={styles.courseCard}>
                            <View style={styles.courseHeader}>
                                <View style={styles.courseCodeBadgeLarge}>
                                    <Text style={styles.courseCodeTextLarge}>{course.code}</Text>
                                </View>
                            </View>
                            <Text style={styles.courseTitle}>{course.title}</Text>
                            {course.instructor && (
                                <View style={styles.instructorRow}>
                                    <Text style={styles.instructorIcon}>👨‍🏫</Text>
                                    <Text style={styles.instructorName}>{course.instructor.name}</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default AdminCoursesScreen;
