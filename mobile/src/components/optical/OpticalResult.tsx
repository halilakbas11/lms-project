import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { opticalStyles as styles } from './styles';

interface OpticalResultProps {
    capturedImage: string | null;
    selectedStudent: any;
    selectedExam: any;
    detectedScore: number | null;
    detectedAnswers: Record<string, string> | null;
    manualScore: string;
    loading: boolean;
    onManualScoreChange: (score: string) => void;
    onSubmit: () => void;
    onRetake: () => void;
    onExportJson?: () => void;
}

export const OpticalResult: React.FC<OpticalResultProps> = ({
    capturedImage,
    selectedStudent,
    selectedExam,
    detectedScore,
    detectedAnswers,
    manualScore,
    loading,
    onManualScoreChange,
    onSubmit,
    onRetake,
    onExportJson
}) => {
    const { t } = useLanguage();

    const handleExportJson = () => {
        // Create export data object
        const exportData = {
            exportDate: new Date().toISOString(),
            student: {
                id: selectedStudent?.id,
                name: selectedStudent?.name,
                email: selectedStudent?.email
            },
            exam: {
                id: selectedExam?.id,
                title: selectedExam?.title
            },
            result: {
                detectedScore: detectedScore,
                detectedAnswers: detectedAnswers,
                manualScore: manualScore ? parseInt(manualScore) : null,
                finalScore: manualScore ? parseInt(manualScore) : detectedScore
            }
        };

        // Show the JSON data in an alert (in production, this would use expo-sharing)
        Alert.alert(
            '📤 JSON Export',
            `${t('export_success') || 'Veri dışa aktarıldı'}\n\n${JSON.stringify(exportData, null, 2).substring(0, 300)}...`,
            [
                {
                    text: t('copy') || 'Kopyala', onPress: () => {
                        // In production, use Clipboard API
                        console.log('Export Data:', JSON.stringify(exportData));
                    }
                },
                { text: t('understood') || 'Tamam' }
            ]
        );

        if (onExportJson) {
            onExportJson();
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.content}>
            {capturedImage && (
                <Image source={{ uri: capturedImage }} style={styles.resultImage} resizeMode="cover" />
            )}

            <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t('student')}</Text>
                <Text style={styles.resultValue}>{selectedStudent?.name}</Text>
            </View>

            <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t('exam')}</Text>
                <Text style={styles.resultValue}>{selectedExam?.title}</Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: '#1e4d3d' }]}>
                <Text style={styles.resultLabel}>{t('detected_score')}</Text>
                <Text style={[styles.resultValue, { fontSize: 36 }]}>{detectedScore}/100</Text>
            </View>

            {detectedAnswers && (
                <View style={styles.resultCard}>
                    <Text style={[styles.resultLabel, { marginBottom: 12 }]}>{t('detected_answers') || 'Tespit Edilen Cevaplar'}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {Object.entries(detectedAnswers).map(([key, value]) => (
                            <View key={key} style={{
                                width: '18%',
                                aspectRatio: 1,
                                backgroundColor: '#f1f5f9',
                                borderRadius: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#e2e8f0'
                            }}>
                                <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>S{key}</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>{value || '-'}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <Text style={styles.manualLabel}>{t('manual_score_entry')}</Text>
            <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                value={manualScore}
                onChangeText={onManualScoreChange}
                placeholder="0-100"
                placeholderTextColor="#64748b"
            />

            <TouchableOpacity
                onPress={onSubmit}
                disabled={loading}
                style={styles.primaryButton}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>✅ {t('save_grade')}</Text>
                )}
            </TouchableOpacity>

            {/* JSON Export Button */}
            <TouchableOpacity
                onPress={handleExportJson}
                style={[styles.primaryButton, { backgroundColor: '#6366f1', marginTop: 12 }]}
            >
                <Text style={styles.buttonText}>📤 {t('export_json') || 'JSON Olarak Kaydet'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onRetake}
                style={{ marginTop: 16 }}
            >
                <Text style={{ color: '#f59e0b', textAlign: 'center' }}>🔄 {t('retake_photo')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

