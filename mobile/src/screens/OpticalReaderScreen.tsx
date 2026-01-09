// OpticalReaderScreen - SOLID: Single Responsibility for optical form scanning logic
// Clean Architecture: Presentation layer screen (delegates UI to components)

import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
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
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [debugImage, setDebugImage] = useState<string | null>(null);
    const [detectedScore, setDetectedScore] = useState<number | null>(null);
    const [detectedAnswers, setDetectedAnswers] = useState<Record<string, string> | null>(null);
    const [manualScore, setManualScore] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        loadCourses();
    }, []);

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
            console.log('OpticalReader: Loading data for course:', course.id);

            // Fetch exams for this course
            const courseExams = await apiService.getCourseExams(course.id);
            console.log('OpticalReader: Exams loaded:', courseExams);
            setExams(courseExams || []);

            // Fetch students for this course - API returns array directly
            try {
                const courseStudents = await apiService.getCourseStudents(course.id);
                console.log('OpticalReader: Students loaded:', courseStudents);
                setStudents(courseStudents || []);
            } catch (studentError) {
                console.log('OpticalReader: Error loading students (might not have students yet):', studentError);
                setStudents([]);
            }
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
                // Disable shutter sound with shutterSound: false
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: true,
                    shutterSound: false
                });
                if (photo && photo.base64) {
                    setCapturedImage(photo.uri);
                    // Send base64 image to backend for real OMR analysis
                    analyzeOpticalForm(photo.base64);
                } else {
                    Alert.alert(t('error'), t('capture_error'));
                }
            } catch (error) {
                Alert.alert(t('error'), t('capture_error'));
            }
        }
    };

    const analyzeOpticalForm = async (base64Image: string, isRetry: boolean = false) => {
        setStep('analyze');
        setAnalyzing(true);

        try {
            console.log(`OMR: Sending image to backend (attempt ${retryCount + 1}/${MAX_RETRIES})...`);

            // Send the image to backend for real OMR analysis
            const response = await apiService.submitOpticalForm(
                selectedExam!.id,
                selectedStudent!.id,
                base64Image
            );

            console.log('OMR: Backend response:', response);

            if (response.success) {
                // Reset retry count on success
                setRetryCount(0);
                // Backend successfully analyzed and scored the form
                setDetectedScore(response.score);
                setDetectedAnswers(response.answers || null);
                setDebugImage(response.debugImage || null);
                setManualScore(response.score?.toString() || '');
                Alert.alert(
                    t('success'),
                    `${t('form_detected_title')}\n${t('score')}: ${response.score}`,
                    [{ text: t('understood') }]
                );
                setAnalyzing(false);
                setStep('result');
            } else {
                // Backend rejected the image (not a valid form)
                handleAnalysisError(response.message || t('invalid_image_text'), base64Image);
            }
        } catch (error: any) {
            console.error('OMR: Analysis failed:', error);

            // Extract error message from backend response
            const errorMessage = error?.response?.data?.message ||
                error?.response?.data?.reason ||
                'Optik form algılanamadı. Lütfen formu düzgün çekerek tekrar deneyin.';

            console.log('OMR: Backend message:', errorMessage);
            handleAnalysisError(errorMessage, base64Image);
        }
    };

    // Error Tolerance: Handle analysis errors
    const handleAnalysisError = (errorMessage: string, base64Image: string) => {
        setAnalyzing(false);
        // Show error and ask user what to do (No auto-retry infinite loop)
        Alert.alert(
            t('error'),
            errorMessage,
            [
                {
                    text: t('retry'),
                    onPress: () => {
                        setAnalyzing(true);
                        analyzeOpticalForm(base64Image, true);
                    }
                },
                {
                    text: t('cancel'),
                    onPress: () => {
                        setStep('camera');
                        setCapturedImage(null);
                    },
                    style: 'cancel'
                }
            ]
        );
    };

    const handleSubmitGrade = async () => {
        const score = manualScore ? parseInt(manualScore) : detectedScore;
        if (!score || score < 0 || score > 100) {
            Alert.alert(t('error'), t('enter_valid_score'));
            return;
        }

        setLoading(true);
        try {
            await apiService.saveExamResult(selectedExam!.id, selectedStudent!.id, score, true);
            Alert.alert(t('success'), t('grade_saved_success'), [
                {
                    text: t('understood'),
                    onPress: () => {
                        setStep('select');
                        setSelectedStudent(null);
                        setCapturedImage(null);
                        setDebugImage(null);
                        setDetectedScore(null);
                        setDetectedAnswers(null);
                    },
                },
            ]);
        } catch (error) {
            Alert.alert(t('error'), t('save_error'));
        }
        setLoading(false);
    };

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
                    <Header title="📊 Result" onBack={() => setStep('select')} />
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
