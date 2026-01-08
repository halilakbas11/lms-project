// VideoPlayerScreen - SOLID: Single Responsibility for video playback
// Clean Architecture: Presentation layer screen with progress tracking

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useLanguage } from '../context/LanguageContext';
import apiService from '../services/ApiService';

interface VideoPlayerScreenProps {
    userId: number;
    videoId: string;
    videoUrl: string;
    title: string;
    onBack: () => void;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
    userId,
    videoId,
    videoUrl,
    title,
    onBack
}) => {
    const { t } = useLanguage();
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [savedPosition, setSavedPosition] = useState(0);

    // Load saved progress on mount
    useEffect(() => {
        loadProgress();
    }, []);

    // Auto-save progress every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (status?.isLoaded && status.positionMillis > 0) {
                saveProgress(status.positionMillis, status.durationMillis || 0);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [status]);

    const loadProgress = async () => {
        try {
            const progress = await apiService.getProgress(userId, 'video', videoId);
            if (progress.position > 0) {
                setSavedPosition(progress.position);
                Alert.alert(
                    '📺 Kaldığınız Yerden Devam',
                    `%${progress.percentage} tamamlandı. Kaldığınız yerden devam edilsin mi?`,
                    [
                        { text: 'Baştan Başla', style: 'cancel' },
                        {
                            text: 'Devam Et',
                            onPress: () => {
                                videoRef.current?.setPositionAsync(progress.position);
                            }
                        }
                    ]
                );
            }
        } catch (err) {
            console.log('Could not load progress:', err);
        }
    };

    const saveProgress = async (positionMs: number, durationMs: number) => {
        try {
            const completed = durationMs > 0 && positionMs >= durationMs * 0.9;
            await apiService.saveProgress(userId, 'video', videoId, positionMs, durationMs, completed);
        } catch (err) {
            console.log('Could not save progress:', err);
        }
    };

    const handlePlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
        setStatus(newStatus);
        if (newStatus.isLoaded) {
            setLoading(false);
        }
    };

    const togglePlayPause = async () => {
        if (!videoRef.current) return;

        if (status?.isLoaded) {
            if (status.isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
        }
    };

    const changeSpeed = async () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        const currentIndex = speeds.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % speeds.length;
        const newRate = speeds[nextIndex];

        setPlaybackRate(newRate);
        await videoRef.current?.setRateAsync(newRate, true);
    };

    const seekRelative = async (seconds: number) => {
        if (status?.isLoaded && videoRef.current) {
            const newPosition = Math.max(0, status.positionMillis + (seconds * 1000));
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        if (status?.isLoaded && status.durationMillis) {
            return (status.positionMillis / status.durationMillis) * 100;
        }
        return 0;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <TouchableOpacity onPress={changeSpeed} style={styles.speedButton}>
                    <Text style={styles.speedText}>{playbackRate}x</Text>
                </TouchableOpacity>
            </View>

            {/* Video Player */}
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                    isLooping={false}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Yükleniyor...</Text>
                    </View>
                )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
                </View>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                        {status?.isLoaded ? formatTime(status.positionMillis) : '00:00'}
                    </Text>
                    <Text style={styles.timeText}>
                        {status?.isLoaded && status.durationMillis ? formatTime(status.durationMillis) : '00:00'}
                    </Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity onPress={() => seekRelative(-10)} style={styles.controlButton}>
                    <Text style={styles.controlText}>⏪ 10s</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                    <Text style={styles.playText}>
                        {status?.isLoaded && status.isPlaying ? '⏸️' : '▶️'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => seekRelative(10)} style={styles.controlButton}>
                    <Text style={styles.controlText}>10s ⏩</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    📊 İlerleme: %{Math.round(getProgress())}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#111'
    },
    backButton: { padding: 8 },
    backText: { color: '#fff', fontSize: 24 },
    title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', marginHorizontal: 12 },
    speedButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    speedText: { color: '#fff', fontWeight: 'bold' },
    videoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    video: { width: '100%', height: '100%' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    loadingText: { color: '#fff', marginTop: 12 },
    progressContainer: { padding: 16, backgroundColor: '#111' },
    progressBar: {
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        overflow: 'hidden'
    },
    progressFill: { height: '100%', backgroundColor: '#3b82f6' },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
    },
    timeText: { color: '#888', fontSize: 12 },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#111'
    },
    controlButton: { padding: 16 },
    controlText: { color: '#fff', fontSize: 16 },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 30
    },
    playText: { fontSize: 30 },
    infoContainer: {
        padding: 16,
        backgroundColor: '#111',
        alignItems: 'center'
    },
    infoText: { color: '#888', fontSize: 14 }
});

export default VideoPlayerScreen;
