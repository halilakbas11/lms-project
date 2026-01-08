import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { opticalStyles as styles } from './styles';

interface OpticalAnalyzingProps {
    capturedImage: string | null;
}

export const OpticalAnalyzing: React.FC<OpticalAnalyzingProps> = ({ capturedImage }) => {
    const { t } = useLanguage();
    return (
        <View style={[styles.centerContent, { flex: 1 }]}>
            {capturedImage && <Image source={{ uri: capturedImage }} style={styles.previewImage} />}
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
            <Text style={styles.analyzingText}>{t('analyzing')}</Text>
        </View>
    );
};
