// UsersListScreen - SOLID: Single Responsibility for listing users
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface UsersListScreenProps {
    onBack: () => void;
}

export const UsersListScreen: React.FC<UsersListScreenProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await apiService.getUsers();
            setUsers(data || []);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            'super_admin': '#dc2626',
            'manager': '#7c3aed',
            'instructor': '#2563eb',
            'assistant': '#0891b2',
            'student': '#16a34a'
        };
        const labels: Record<string, string> = {
            'super_admin': t('role_admin'),
            'manager': t('role_manager'),
            'instructor': t('role_instructor'),
            'assistant': t('role_assistant'),
            'student': t('role_student')
        };
        return { color: colors[role] || '#64748b', label: labels[role] || role };
    };

    return (
        <View style={styles.container}>
            <Header title={`👥 ${t('users')}`} onBack={onBack} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                ) : (
                    users.map((user: any) => {
                        const badge = getRoleBadge(user.role);
                        return (
                            <View key={user.id} style={styles.userCard}>
                                <View style={styles.userAvatar}>
                                    <Text style={styles.userAvatarText}>{user.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{user.name}</Text>
                                    <Text style={styles.userEmail}>{user.email}</Text>
                                </View>
                                <View style={[styles.roleBadge, { backgroundColor: badge.color }]}>
                                    <Text style={styles.roleBadgeText}>{badge.label}</Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

export default UsersListScreen;
