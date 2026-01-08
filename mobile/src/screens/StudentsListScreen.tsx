// StudentsListScreen - SOLID: Single Responsibility for listing students
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface StudentsListScreenProps {
    userId: number;
    onBack: () => void;
}

export const StudentsListScreen: React.FC<StudentsListScreenProps> = ({ userId, onBack }) => {
    const { t } = useLanguage();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            // Fetch instructor courses and their students
            const courses = await apiService.getInstructorCourses(userId);

            // Collect all unique students
            const allStudents: any[] = [];
            for (const course of (courses || [])) {
                try {
                    // API now returns students array directly
                    const courseStudents = await apiService.getCourseStudents(course.id);
                    (courseStudents || []).forEach((s: any) => {
                        if (!allStudents.find(x => x.id === s.id)) {
                            allStudents.push({ ...s, courseName: course.title });
                        }
                    });
                } catch (err) {
                    console.log('Error fetching students for course', course.id);
                }
            }
            setStudents(allStudents);
        } catch (err) {
            console.log('Error fetching students:', err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Header title={`👥 ${t('my_students')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                ) : students.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyTitle}>{t('no_students_title')}</Text>
                        <Text style={styles.emptyText}>{t('no_students_text')}</Text>
                    </View>
                ) : (
                    students.map((student: any) => (
                        <View key={student.id} style={styles.userCard}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.userAvatarText}>{student.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{student.name}</Text>
                                <Text style={styles.userEmail}>{student.email}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default StudentsListScreen;
