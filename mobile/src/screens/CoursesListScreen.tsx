// CoursesListScreen - SOLID: Single Responsibility for listing courses
// Clean Architecture: Presentation layer screen

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';

interface CoursesListScreenProps {
    userId: number;
    courses: any[];
    onBack: () => void;
}

export const CoursesListScreen: React.FC<CoursesListScreenProps> = ({ userId, courses, onBack }) => {
    const { t } = useLanguage();
    return (
        <View style={styles.container}>
            <Header title={`📚 ${t('my_courses')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {courses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>{t('no_courses_title')}</Text>
                        <Text style={styles.emptyText}>{t('no_courses_text')}</Text>
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
                            {course.description && (
                                <Text style={styles.courseDescription}>{course.description}</Text>
                            )}
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

export default CoursesListScreen;
