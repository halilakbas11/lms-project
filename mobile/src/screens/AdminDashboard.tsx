// AdminDashboard - SOLID: Single Responsibility for admin actions
// Clean Architecture: Presentation layer screen

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MainLayout } from '../components/MainLayout';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';

interface AdminDashboardProps {
    user: any;
    onLogout: () => void;
    onNavigate: (screen: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onNavigate }) => {
    const { t } = useLanguage();

    return (
        <MainLayout
            title={t('admin_panel_title')}
            subtitle={t('welcome')}
            onLogout={onLogout}
        >
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.statNumber}>100%</Text>
                    <Text style={styles.statLabel}>{t('server')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.statNumber}>Active</Text>
                    <Text style={styles.statLabel}>{t('system_stats')}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
            <View style={styles.grid}>
                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('users_list')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#3b82f620' }]}>
                        <Text style={styles.actionIcon}>👥</Text>
                    </View>
                    <Text style={styles.actionText}>{t('users')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('courses_list')}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#f59e0b20' }]}>
                        <Text style={styles.actionIcon}>📚</Text>
                    </View>
                    <Text style={styles.actionText}>{t('courses')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => { }}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#10b98120' }]}>
                        <Text style={styles.actionIcon}>📈</Text>
                    </View>
                    <Text style={styles.actionText}>{t('reports')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => { }}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#64748b20' }]}>
                        <Text style={styles.actionIcon}>⚙️</Text>
                    </View>
                    <Text style={styles.actionText}>{t('settings')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.webNotice}>
                <Text style={styles.webNoticeIcon}>🖥️</Text>
                <Text style={styles.webNoticeTitle}>{t('full_management_title')}</Text>
                <Text style={styles.webNoticeText}>{t('full_management_text')}</Text>
            </View>
        </MainLayout>
    );
};

export default AdminDashboard;
