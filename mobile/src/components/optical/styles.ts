import { StyleSheet, Platform } from 'react-native';

export const opticalStyles = StyleSheet.create({
    centerContent: { justifyContent: 'center', alignItems: 'center', padding: 24 },
    content: { padding: 16, paddingBottom: 40 },

    // Typography
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
    bigEmoji: { fontSize: 80 },
    bigTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 20, marginBottom: 10 },
    instructionText: { color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },
    emptyText: { color: '#64748b', textAlign: 'center', padding: 12 },
    analyzingText: { color: '#fff', fontSize: 16, marginTop: 16 },

    // Chips
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { backgroundColor: '#334155', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
    chipActive: { backgroundColor: '#3b82f620', borderColor: '#3b82f6' },
    chipText: { color: '#94a3b8', fontWeight: '500' },
    chipTextActive: { color: '#3b82f6' },

    // Student Row
    studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
    studentRowActive: { borderColor: '#3b82f6' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    studentName: { color: '#fff', fontWeight: '600', fontSize: 15 },
    studentEmail: { color: '#64748b', fontSize: 12, marginTop: 2 },

    // Buttons
    primaryButton: { backgroundColor: '#3b82f6', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    opticalButton: { backgroundColor: '#f59e0b', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    buttonTextDark: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Camera
    cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 30 },
    cameraBackBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    cameraBackText: { color: '#fff', fontSize: 24 },
    scanGuide: { alignItems: 'center' },
    scanGuideTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    scanGuideText: { color: '#94a3b8', marginTop: 4 },
    scanFrame: { width: 280, height: 200, marginTop: 20 },
    scanCorner: { position: 'absolute', width: 30, height: 30, borderColor: '#3b82f6', borderWidth: 4 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
    captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },

    // Result
    previewImage: { width: 200, height: 200, borderRadius: 12 },
    resultImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 20 },
    resultCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12 },
    resultLabel: { color: '#64748b', fontSize: 12, marginBottom: 4 },
    resultValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    manualLabel: { color: '#94a3b8', marginTop: 16, marginBottom: 8 },
    scoreInput: { backgroundColor: '#0f172a', color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#334155' },
});
