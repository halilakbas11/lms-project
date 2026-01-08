// InstructorDashboard - SOLID: Single Responsibility for instructor actions
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MainLayout } from '../components/MainLayout';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface InstructorDashboardProps {
    user: any;
    onLogout: () => void;
    onNavigate: (screen: string) => void;
    onOpenOptical: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ user, onLogout, onNavigate, onOpenOptical }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const coursesData = await apiService.getInstructorCourses(user.id);
            setCourses(coursesData || []);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        <MainLayout
            title={`${t('hello')}, ${user.name}`}
            subtitle={t('instructor_panel')}
            onLogout={onLogout}
        >
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.statNumber}>{courses.length}</Text>
                    <Text style={styles.statLabel}>{t('courses')}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
            <View style={styles.grid}>
                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('instructor_courses')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#3b82f620' }]}>
                        <Text style={styles.actionIcon}>📚</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_courses')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('instructor_exams')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#f59e0b20' }]}>
                        <Text style={styles.actionIcon}>📝</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_exams')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, styles.opticalCard]} onPress={onOpenOptical}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#f59e0b20' }]}>
                        <Text style={styles.actionIcon}>📸</Text>
                    </View>
                    <Text style={styles.actionText}>{t('optical_reader_title')}</Text>
                    <Text style={styles.actionSubtext}>{t('scan_form')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('students_list')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#10b98120' }]}>
                        <Text style={styles.actionIcon}>👥</Text>
                    </View>
                    <Text style={styles.actionText}>{t('my_students')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('gradebook')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#8b5cf620' }]}>
                        <Text style={styles.actionIcon}>📊</Text>
                    </View>
                    <Text style={styles.actionText}>{t('gradebook')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.webNotice}>
                <Text style={styles.webNoticeIcon}>💻</Text>
                <Text style={styles.webNoticeTitle}>{t('detailed_management')}</Text>
                <Text style={styles.webNoticeText}>{t('use_web_panel')}</Text>
            </View>
        </MainLayout>
    );
};

export default InstructorDashboard;
