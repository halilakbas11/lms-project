// GradesListScreen - SOLID: Single Responsibility for listing grades
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface GradesListScreenProps {
    userId: number;
    onBack: () => void;
}

export const GradesListScreen: React.FC<GradesListScreenProps> = ({ userId, onBack }) => {
    const { t } = useLanguage();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const data = await apiService.getStudentGrades(userId);
            setResults(data || []);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Header title={`📊 ${t('my_grades')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                ) : results.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>{t('no_results_title')}</Text>
                        <Text style={styles.emptyText}>{t('no_results_text')}</Text>
                    </View>
                ) : (
                    results.map((res: any) => (
                        <View key={res.id} style={styles.gradeCard}>
                            <View style={styles.gradeHeader}>
                                <Text style={styles.gradeTitle}>{res.exam?.title || t('exam')}</Text>
                                <View style={[styles.gradeBadge, res.score >= 50 ? styles.gradePass : styles.gradeFail]}>
                                    <Text style={styles.gradeScore}>{res.score}</Text>
                                </View>
                            </View>
                            <Text style={styles.gradeDate}>{new Date(res.createdAt).toLocaleDateString('tr-TR')}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default GradesListScreen;
