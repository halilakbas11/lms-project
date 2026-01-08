// Header Component - SOLID: Single Responsibility for navigation header
// Clean Architecture: Presentation layer component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface HeaderProps {
    title: string;
    onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={styles.placeholder} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#1e293b',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#334155',
        borderRadius: 10,
    },
    backText: {
        color: '#fff',
        fontSize: 20,
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    placeholder: {
        width: 40,
    },
});

export default Header;
