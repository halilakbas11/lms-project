// LoginScreen - SOLID: Single Responsibility for authentication
// Clean Architecture: Presentation layer screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface LoginScreenProps {
    onLogin: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('error'), t('login_error'));
            return;
        }

        setLoading(true);
        try {
            console.log('LoginScreen: Attempting login...');
            const response = await apiService.login(email, password);
            console.log('LoginScreen: API response:', response);

            // Extract user from response (API returns {success, user})
            const user = response.user || response;
            console.log('LoginScreen: User data:', user);
            console.log('LoginScreen: User role:', user?.role);

            if (!user || !user.role) {
                Alert.alert(t('error'), 'Invalid user data received from server. Missing role.');
                console.error('LoginScreen: Invalid user data - missing role');
                return;
            }

            onLogin(user);
        } catch (error) {
            console.error('LoginScreen: Login error:', error);
            Alert.alert(t('error'), t('login_error'));
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { justifyContent: 'center' }]}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View style={styles.loginCard}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoIcon}>🎓</Text>
                        <Text style={styles.logoText}>LMS sistemi</Text>
                    </View>

                    <Text style={styles.loginTitle}>{t('welcome')}</Text>
                    <Text style={styles.loginSubtitle}>{t('login_subtitle')}</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>{t('email')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('email')}
                            placeholderTextColor="#64748b"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={[styles.inputContainer, { marginBottom: 30 }]}>
                        <Text style={styles.inputLabel}>{t('password')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('password')}
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{t('login')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
