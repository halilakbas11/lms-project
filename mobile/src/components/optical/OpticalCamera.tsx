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
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
            {/* Camera View Container - Forced to 3:4 ratio to match photo aspect ratio */}
            <View style={{ width: '100%', aspectRatio: 3 / 4, overflow: 'hidden', borderRadius: 12 }}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

                {/* Overlay inside camera area for correct alignment */}
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'space-between', padding: 20 }]}>
                    <TouchableOpacity onPress={onBack} style={styles.cameraBackBtn}>
                        <Text style={styles.cameraBackText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.scanGuide}>
                        <Text style={styles.scanGuideTitle}>📄 {t('optical_reader_title')}</Text>
                        <Text style={styles.scanGuideText}>{selectedStudent?.name}</Text>
                    </View>

                    {/* LIVE ALIGNMENT GRID: Moved outside of padded container to match CameraView perfectly */}
                    <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="none">
                        <View style={{
                            position: 'absolute',
                            left: '15%',
                            top: '25%',
                            width: '70%',
                            height: '65%',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            {/* Draw 10 Rows (Single Column) */}
                            {[...Array(10)].map((_, rowIdx) => (
                                <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                    {/* Draw 5 Options (A-E) */}
                                    {[...Array(5)].map((_, optIdx) => (
                                        <View key={optIdx} style={{
                                            width: 24, height: 24, borderRadius: 12,
                                            backgroundColor: 'rgba(0,255,0,0.2)', // Light green
                                            borderWidth: 2, borderColor: 'rgba(0,255,0,0.6)',
                                            justifyContent: 'center', alignItems: 'center'
                                        }}>
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'lime' }} />
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity onPress={onCapture} style={styles.captureButton}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Instructional Text outside camera view */}
            <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>🔴 Kırmızı yuvarlakları kağıttaki şıklara denk getirin</Text>
            </View>
        </View>
    );
};
