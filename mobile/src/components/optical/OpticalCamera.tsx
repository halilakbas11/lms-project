import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { useLanguage } from '../../context/LanguageContext';
import { opticalStyles as styles } from './styles';

interface OpticalCameraProps {
    cameraRef: any; // Using any to avoid strict RefObject mismatch
    selectedStudent: any;
    selectedExam: any;
    onBack: () => void;
    onCapture: () => void;
    permission: any;
    requestPermission: () => void;
}

export const OpticalCamera: React.FC<OpticalCameraProps> = ({
    cameraRef,
    selectedStudent,
    selectedExam,
    onBack,
    onCapture,
    permission,
    requestPermission
}) => {
    const { t } = useLanguage();

    if (!permission?.granted) {
        return (
            <View style={[styles.centerContent, { flex: 1 }]}>
                <Text style={styles.bigEmoji}>📷</Text>
                <Text style={styles.bigTitle}>{t('camera_permission_title')}</Text>
                <Text style={styles.instructionText}>{t('camera_permission_text')}</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.primaryButton}>
                    <Text style={styles.buttonText}>{t('allow')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 15 }}>
                    <Text style={{ color: '#94a3b8' }}>{t('go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
            <SafeAreaView style={styles.cameraOverlay}>
                <TouchableOpacity onPress={onBack} style={styles.cameraBackBtn}>
                    <Text style={styles.cameraBackText}>←</Text>
                </TouchableOpacity>
                <View style={styles.scanGuide}>
                    <Text style={styles.scanGuideTitle}>📄 {t('optical_reader_title')}</Text>
                    <Text style={styles.scanGuideText}>{selectedStudent?.name} - {selectedExam?.title}</Text>
                    <View style={styles.scanFrame}>
                        <View style={[styles.scanCorner, styles.cornerTL]} />
                        <View style={[styles.scanCorner, styles.cornerTR]} />
                        <View style={[styles.scanCorner, styles.cornerBL]} />
                        <View style={[styles.scanCorner, styles.cornerBR]} />
                    </View>
                </View>
                <TouchableOpacity onPress={onCapture} style={styles.captureButton}>
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};
