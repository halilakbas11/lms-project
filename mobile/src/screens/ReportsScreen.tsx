// ReportsScreen - SOLID: Single Responsibility for system reports
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface ReportsScreenProps {
    onBack: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [stats, setStats] = useState({ users: 0, courses: 0, exams: 0, results: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [usersData, coursesData, examsData] = await Promise.all([
                apiService.getUsers(),
                apiService.getCourses(),
                apiService.getExams()
            ]);
            setStats({
                users: usersData?.length || 0,
                courses: coursesData?.length || 0,
                exams: examsData?.length || 0,
                results: 0
            });
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Header title={`📊 ${t('reports')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>📈 {t('general_stats')}</Text>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: '#7c3aed' }]}>
                                <Text style={styles.statNumber}>{stats.users}</Text>
                                <Text style={styles.statLabel}>{t('users')}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#2563eb' }]}>
                                <Text style={styles.statNumber}>{stats.courses}</Text>
                                <Text style={styles.statLabel}>{t('courses')}</Text>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: '#16a34a' }]}>
                                <Text style={styles.statNumber}>{stats.exams}</Text>
                                <Text style={styles.statLabel}>{t('exams')}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#dc2626' }]}>
                                <Text style={styles.statNumber}>{stats.results}</Text>
                                <Text style={styles.statLabel}>{t('results')}</Text>
                            </View>
                        </View>

                        <View style={[styles.webNotice, { marginTop: 24 }]}>
                            <Text style={styles.webNoticeIcon}>📊</Text>
                            <Text style={styles.webNoticeTitle}>{t('detailed_reports_title')}</Text>
                            <Text style={styles.webNoticeText}>
                                {t('detailed_reports_text')}
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default ReportsScreen;
