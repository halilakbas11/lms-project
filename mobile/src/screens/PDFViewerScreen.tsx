// PDFViewerScreen - SOLID: Single Responsibility for PDF viewing
// Clean Architecture: Presentation layer screen with progress tracking

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../context/LanguageContext';
import apiService from '../services/ApiService';

interface PDFViewerScreenProps {
    userId: number;
    pdfId: string;
    pdfUrl: string;
    title: string;
    totalPages?: number;
    onBack: () => void;
}

export const PDFViewerScreen: React.FC<PDFViewerScreenProps> = ({
    userId,
    pdfId,
    pdfUrl,
    title,
    totalPages = 10,
    onBack
}) => {
    const { t } = useLanguage();
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [bookmarks, setBookmarks] = useState<number[]>([]);

    // Load saved progress on mount
    useEffect(() => {
        loadProgress();
    }, []);

    // Auto-save progress when page changes
    useEffect(() => {
        if (currentPage > 0) {
            saveProgress();
        }
    }, [currentPage]);

    const loadProgress = async () => {
        try {
            const progress = await apiService.getProgress(userId, 'pdf', pdfId);
            if (progress.position > 0) {
                const savedPage = Math.floor(progress.position);
                Alert.alert(
                    '📄 Kaldığınız Yerden Devam',
                    `Sayfa ${savedPage}/${totalPages}'de kalmıştınız. Devam edilsin mi?`,
                    [
                        { text: 'Baştan Başla', style: 'cancel' },
                        {
                            text: 'Devam Et',
                            onPress: () => setCurrentPage(savedPage)
                        }
                    ]
                );
            }
        } catch (err) {
            console.log('Could not load progress:', err);
        }
    };

    const saveProgress = async () => {
        try {
            const completed = currentPage >= totalPages;
            await apiService.saveProgress(userId, 'pdf', pdfId, currentPage, totalPages, completed);
        } catch (err) {
            console.log('Could not save progress:', err);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const changeZoom = () => {
        const levels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        const currentIndex = levels.indexOf(zoomLevel);
        const nextIndex = (currentIndex + 1) % levels.length;
        setZoomLevel(levels[nextIndex]);
    };

    const toggleBookmark = () => {
        if (bookmarks.includes(currentPage)) {
            setBookmarks(bookmarks.filter(b => b !== currentPage));
            Alert.alert('🔖', 'Yer imi kaldırıldı');
        } else {
            setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
            Alert.alert('🔖', `Sayfa ${currentPage} yer imlerine eklendi`);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // In a real implementation, this would search within the PDF
            Alert.alert('🔍 Arama', `"${searchQuery}" için arama yapılıyor...`);
        }
    };

    // Google Docs PDF viewer URL (works without native PDF library)
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.iconButton}>
                    <Text style={styles.iconText}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {showSearch && (
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Ara..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <Text style={styles.searchButtonText}>Ara</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* PDF Viewer - Using WebView with Google Docs viewer */}
            <View style={styles.pdfContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: viewerUrl }}
                    style={[styles.pdf, { transform: [{ scale: zoomLevel }] }]}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    scalesPageToFit={true}
                    javaScriptEnabled={true}
                />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>PDF yükleniyor...</Text>
                    </View>
                )}
            </View>

            {/* Page Navigation */}
            <View style={styles.navigationBar}>
                <TouchableOpacity
                    onPress={() => goToPage(currentPage - 1)}
                    style={[styles.navButton, currentPage <= 1 && styles.navButtonDisabled]}
                    disabled={currentPage <= 1}
                >
                    <Text style={styles.navButtonText}>◀ Önceki</Text>
                </TouchableOpacity>

                <View style={styles.pageInfo}>
                    <Text style={styles.pageText}>
                        Sayfa {currentPage} / {totalPages}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => goToPage(currentPage + 1)}
                    style={[styles.navButton, currentPage >= totalPages && styles.navButtonDisabled]}
                    disabled={currentPage >= totalPages}
                >
                    <Text style={styles.navButtonText}>Sonraki ▶</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Toolbar */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={changeZoom} style={styles.toolButton}>
                    <Text style={styles.toolIcon}>🔎</Text>
                    <Text style={styles.toolText}>{(zoomLevel * 100).toFixed(0)}%</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleBookmark} style={styles.toolButton}>
                    <Text style={styles.toolIcon}>
                        {bookmarks.includes(currentPage) ? '🔖' : '📑'}
                    </Text>
                    <Text style={styles.toolText}>Yer İmi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        if (bookmarks.length > 0) {
                            Alert.alert(
                                '📚 Yer İmleri',
                                bookmarks.map(b => `Sayfa ${b}`).join('\n'),
                                bookmarks.map(b => ({
                                    text: `Sayfa ${b}`,
                                    onPress: () => goToPage(b)
                                }))
                            );
                        } else {
                            Alert.alert('📚', 'Henüz yer imi yok');
                        }
                    }}
                    style={styles.toolButton}
                >
                    <Text style={styles.toolIcon}>📚</Text>
                    <Text style={styles.toolText}>{bookmarks.length}</Text>
                </TouchableOpacity>

                <View style={styles.toolButton}>
                    <Text style={styles.toolIcon}>📊</Text>
                    <Text style={styles.toolText}>%{Math.round((currentPage / totalPages) * 100)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#1e293b'
    },
    backButton: { padding: 8 },
    backText: { color: '#fff', fontSize: 24 },
    title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', marginHorizontal: 12 },
    iconButton: { padding: 8 },
    iconText: { fontSize: 20 },
    searchBar: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#334155'
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#334155',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: '#fff',
        marginRight: 8
    },
    searchButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: 'center'
    },
    searchButtonText: { color: '#fff', fontWeight: '600' },
    pdfContainer: { flex: 1, backgroundColor: '#0f172a' },
    pdf: { flex: 1, backgroundColor: '#fff' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.9)'
    },
    loadingText: { color: '#fff', marginTop: 12 },
    navigationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#1e293b'
    },
    navButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8
    },
    navButtonDisabled: {
        backgroundColor: '#475569',
        opacity: 0.5
    },
    navButtonText: { color: '#fff', fontWeight: '600' },
    pageInfo: { alignItems: 'center' },
    pageText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 12,
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#334155'
    },
    toolButton: { alignItems: 'center', padding: 8 },
    toolIcon: { fontSize: 20, marginBottom: 4 },
    toolText: { color: '#94a3b8', fontSize: 12 }
});

export default PDFViewerScreen;
