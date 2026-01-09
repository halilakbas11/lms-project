
import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components';
import apiService from '../services/ApiService';
import {
    OpticalSelection,
    OpticalCamera,
    OpticalResult,
    OpticalAnalyzing
} from '../components/optical';

interface OpticalReaderScreenProps {
    userId: number;
    onBack: () => void;
}

type Step = 'select' | 'camera' | 'analyze' | 'result';

export const OpticalReaderScreen: React.FC<OpticalReaderScreenProps> = ({ userId, onBack }) => {
    const { t } = useLanguage();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    // State management
    const [step, setStep] = useState<Step>('select');
    const [courses, setCourses] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    // Result States
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [debugImage, setDebugImage] = useState<string | null>(null);
    const [detectedScore, setDetectedScore] = useState<number | null>(null);
    const [detectedAnswers, setDetectedAnswers] = useState<Record<string, string> | null>(null);
    const [metadata, setMetadata] = useState<any>(null);

    const [manualScore, setManualScore] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (!permission) requestPermission();
        loadCourses();
    }, [permission]);

    const loadCourses = async () => {
        try {
            const data = await apiService.getInstructorCourses(userId);
            setCourses(data || []);
        } catch (error) {
            console.log('Error loading courses:', error);
        }
    };

    const handleCourseSelect = async (course: any) => {
        setSelectedCourse(course);
        setSelectedExam(null);
        setSelectedStudent(null);
        setExams([]);
        setStudents([]);

        try {
            const courseExams = await apiService.getCourseExams(course.id);
            setExams(courseExams || []);
            const courseStudents = await apiService.getCourseStudents(course.id);
            setStudents(courseStudents || []);
        } catch (error) {
            console.log('Error loading course data:', error);
        }
    };

    const handleStartCamera = () => {
        if (!selectedExam || !selectedStudent) {
            Alert.alert(t('error'), `${t('select_exam')} & ${t('select_student')}`);
            return;
        }
        setStep('camera');
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // High quality for backend OpenCV
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: true,
                    shutterSound: false
                });

                if (photo && photo.base64) {
                    setCapturedImage(photo.uri);
                    analyzeOpticalForm(photo.base64);
                } else {
                    Alert.alert(t('error'), t('capture_error'));
                }
            } catch (error) {
                Alert.alert(t('error'), t('capture_error'));
            }
        }
    };

    const analyzeOpticalForm = async (base64Image: string) => {
        setStep('analyze');
        setAnalyzing(true);

        try {
            console.log('Sending to Backend Python Service...');
            const response = await apiService.submitOpticalForm(
                selectedExam!.id,
                selectedStudent!.id,
                base64Image
            );

            if (response.success) {
                setDetectedScore(response.score);
                setDetectedAnswers(response.answers || null);
                // Backend sends debug image with green circles
                setDebugImage(response.debugImage ? `data:image/jpeg;base64,${response.debugImage}` : null);
                setMetadata(response.metadata);

                setManualScore(response.score?.toString() || '');
                setAnalyzing(false);
                setStep('result');
            } else {
                handleAnalysisError(response.message || "Okunamadı");
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Sunucu hatası. Python servisini kontrol edin.';
            handleAnalysisError(msg);
        }
    };

    const handleAnalysisError = (msg: string) => {
        setAnalyzing(false);
        Alert.alert("Hata", msg, [
            { text: "Tekrar Dene", onPress: () => { setStep('camera'); setCapturedImage(null); } },
            { text: "İptal", onPress: () => { setStep('select'); setCapturedImage(null); } }
        ]);
    };

    const handleSubmitGrade = async () => {
        const score = manualScore ? parseInt(manualScore) : detectedScore;

        setLoading(true);
        try {
            await apiService.saveExamResult(selectedExam!.id, selectedStudent!.id, score || 0, true);
            Alert.alert(t('success'), t('grade_saved_success'), [
                {
                    text: t('understood'),
                    onPress: () => {
                        setStep('select');
                        setSelectedStudent(null);
                        setCapturedImage(null);
                        setDebugImage(null);
                    },
                },
            ]);
        } catch (error) {
            Alert.alert(t('error'), t('save_error'));
        }
        setLoading(false);
    };

    // --- RENDER ---
    return (
        <View style={styles.container}>
            {step === 'select' && (
                <>
                    <Header title={`📸 ${t('optical_reader_title')}`} onBack={onBack} />
                    <OpticalSelection
                        courses={courses}
                        exams={exams}
                        students={students}
                        selectedCourse={selectedCourse}
                        selectedExam={selectedExam}
                        selectedStudent={selectedStudent}
                        onSelectCourse={handleCourseSelect}
                        onSelectExam={setSelectedExam}
                        onSelectStudent={setSelectedStudent}
                        onStartCamera={handleStartCamera}
                    />
                </>
            )}

            {step === 'camera' && (
                <OpticalCamera
                    cameraRef={cameraRef}
                    selectedStudent={selectedStudent}
                    selectedExam={selectedExam}
                    onBack={() => setStep('select')}
                    onCapture={takePicture}
                    permission={permission}
                    requestPermission={requestPermission}
                />
            )}

            {step === 'analyze' && (
                <OpticalAnalyzing capturedImage={capturedImage} />
            )}

            {step === 'result' && (
                <>
                    <Header title="📊 Sonuçlar" onBack={() => setStep('select')} />
                    <OpticalResult
                        capturedImage={capturedImage}
                        debugImage={debugImage}
                        selectedStudent={selectedStudent}
                        selectedExam={selectedExam}
                        detectedScore={detectedScore}
                        detectedAnswers={detectedAnswers}
                        manualScore={manualScore}
                        loading={loading}
                        onManualScoreChange={setManualScore}
                        onSubmit={handleSubmitGrade}
                        onRetake={() => { setStep('camera'); setCapturedImage(null); setDebugImage(null); }}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
});

export default OpticalReaderScreen;
