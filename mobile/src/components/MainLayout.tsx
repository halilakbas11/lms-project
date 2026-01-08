// MainLayout Component - SOLID: Single Responsibility for dashboard layout
// Clean Architecture: Presentation layer component

import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface MainLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle, onLogout }) => {
    const { t, language, setLanguage, languageNames } = useLanguage();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <Text style={styles.headerSubtitle}>{subtitle}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.langBtn}
                            onPress={() => {
                                const langs: ('tr' | 'en' | 'jp')[] = ['tr', 'en', 'jp'];
                                const currentIndex = langs.indexOf(language);
                                const nextLang = langs[(currentIndex + 1) % 3];
                                setLanguage(nextLang);
                            }}
                        >
                            <Text style={styles.langBtnText}>
                                {language === 'tr' ? '🇹🇷' : language === 'en' ? '🇬🇧' : '🇯🇵'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                            <Text style={styles.logoutText}>🚪</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <ScrollView contentContainerStyle={styles.content}>
                    {children}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1e293b',
        paddingTop: Platform.OS === 'ios' ? 10 : 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    langBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    langBtnText: {
        fontSize: 20,
    },
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 18,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
});

export default MainLayout;
