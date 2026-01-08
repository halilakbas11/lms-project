// StudentDashboard - SOLID: Single Responsibility for student actions
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MainLayout } from '../components/MainLayout';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface StudentDashboardProps {
    user: any;
    onLogout: () => void;
    onNavigate: (screen: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, onNavigate }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [activeExams, setActiveExams] = useState(0);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const coursesData = await apiService.getStudentCourses(user.id);
            setCourses(coursesData || []);

            // Calculate active exams (simplified for now)
            setActiveExams(0); // Placeholder
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        <MainLayout
            title={`${t('hello')}, ${user.name}`}
            subtitle={t('student_panel')}
            onLogout={onLogout}
        >
            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.statNumber}>{courses.length}</Text>
                    <Text style={styles.statLabel}>{t('enrolled_courses')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.statNumber}>{activeExams}</Text>
                    <Text style={styles.statLabel}>{t('active_exams')}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
            <View style={styles.grid}>
                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('my_courses')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#3b82f620' }]}>
                        <Text style={styles.actionIcon}>📚</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_courses')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('my_exams')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#f59e0b20' }]}>
                        <Text style={styles.actionIcon}>📝</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_exams')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('my_grades')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#10b98120' }]}>
                        <Text style={styles.actionIcon}>📊</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_grades')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('my_notes')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#8b5cf620' }]}>
                        <Text style={styles.actionIcon}>📔</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_notes')}</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Courses Preview */}
            <Text style={styles.sectionTitle}>{t('enrolled_courses')}</Text>
            {loading ? (
                <ActivityIndicator color="#3b82f6" />
            ) : courses.length > 0 ? (
                courses.slice(0, 3).map((course) => (
                    <View key={course.id} style={styles.coursePreviewCard}>
                        <View style={styles.courseCodeBadge}>
                            <Text style={styles.courseCodeText}>{course.code}</Text>
                        </View>
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseTitleSmall}>{course.title}</Text>
                            <Text style={styles.courseInstructor}>{course.instructor?.name}</Text>
                        </View>
                        <Text style={{ fontSize: 16 }}>›</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.emptyText}>{t('no_courses_text')}</Text>
            )}
        </MainLayout>
    );
};

export default StudentDashboard;
