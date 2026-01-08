// Shared Styles - SOLID: Single Responsibility for styling
// Clean Architecture: Presentation layer styling

import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    loadingText: { color: '#94a3b8', marginTop: 12 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

    // Login
    loginCard: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0f172a' },

    // Big Messages
    bigEmoji: { fontSize: 80, marginBottom: 16, textAlign: 'center' },
    bigTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
    instructionText: { color: '#94a3b8', textAlign: 'center', marginBottom: 24 },

    // Users
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 12, marginBottom: 8 },
    userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    userAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    userInfo: { flex: 1 },
    userName: { color: '#fff', fontWeight: '600', fontSize: 16 },
    userEmail: { color: '#64748b', fontSize: 12 },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    roleBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logoIcon: { fontSize: 60 },
    logoText: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 10 },
    loginTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    loginSubtitle: { color: '#64748b', textAlign: 'center', marginBottom: 30, marginTop: 8 },
    inputContainer: { marginBottom: 16 },
    inputLabel: { color: '#94a3b8', marginBottom: 8, fontSize: 14 },
    input: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, color: '#fff', fontSize: 16 },

    // Buttons
    button: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    primaryButton: { backgroundColor: '#3b82f6' },
    successButton: { backgroundColor: '#10b981' },
    opticalButton: { backgroundColor: '#f59e0b' },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    buttonTextDark: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Headers
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b', paddingTop: Platform.OS === 'ios' ? 50 : 40 },
    headerTitle: { fontSize: 18, color: '#fff', fontWeight: 'bold', flex: 1, textAlign: 'center' },
    headerBackBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerBackText: { color: '#fff', fontSize: 24 },
    mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, backgroundColor: '#1e293b' },
    mainHeaderContent: { flex: 1 },
    mainHeaderTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    mainHeaderSubtitle: { color: '#64748b', marginTop: 4 },
    logoutButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

    // Content
    content: { padding: 20, paddingBottom: 40 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16, marginTop: 24 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center' },
    statNumber: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    statLabel: { color: '#94a3b8', marginTop: 4, fontSize: 12 },

    // Actions Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: '48%', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 4 },
    opticalCard: { borderColor: '#f59e0b', borderWidth: 1 },
    actionIconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionIcon: { fontSize: 24 },
    actionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    actionSubtext: { color: '#64748b', fontSize: 12, marginTop: 2 },

    // Course Cards
    coursePreviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 12, marginBottom: 8 },
    courseCodeBadge: { backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    courseCodeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    courseInfo: { marginLeft: 12, flex: 1 },
    courseTitleSmall: { color: '#fff', fontWeight: '500' },
    courseInstructor: { color: '#64748b', fontSize: 12, marginTop: 2 },

    courseCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 12 },
    courseHeader: { marginBottom: 12 },
    courseCodeBadgeLarge: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
    courseCodeTextLarge: { color: '#fff', fontWeight: 'bold' },
    courseTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    courseDescription: { color: '#94a3b8', marginTop: 8 },
    instructorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    instructorIcon: { fontSize: 16, marginRight: 8 },
    instructorName: { color: '#64748b' },

    // Exam Cards
    examCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 12 },
    examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    examTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    examDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    examDetail: { flexDirection: 'row', alignItems: 'center' },
    detailIcon: { marginRight: 4 },
    detailText: { color: '#94a3b8', fontSize: 13 },
    sebWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.15)', padding: 12, borderRadius: 8 },
    sebWarningIcon: { fontSize: 20, marginRight: 10 },
    sebWarningText: { color: '#fca5a5', fontSize: 12, flex: 1 },

    // Take Exam
    examTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#1e293b', paddingTop: Platform.OS === 'ios' ? 50 : 35 },
    examBackBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    examBackText: { color: '#fff', fontSize: 22 },
    examTopTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginHorizontal: 10 },
    timerBadge: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    timerWarning: { backgroundColor: '#ef4444' },
    timerText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    progressContainer: { backgroundColor: '#1e293b', padding: 12 },
    progressText: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
    progressBar: { height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#3b82f6' },
    questionsContainer: { padding: 16, paddingBottom: 100 },
    questionCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 2, borderColor: 'transparent' },
    questionAnswered: { borderColor: '#10b981' },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    questionNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
    questionNumberAnswered: { backgroundColor: '#10b981' },
    questionNumberText: { color: '#fff', fontWeight: 'bold' },
    questionPoints: { color: '#64748b', fontSize: 12 },
    questionText: { color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 16 },
    hintBox: { backgroundColor: 'rgba(59,130,246,0.15)', padding: 12, borderRadius: 8, marginBottom: 16 },
    hintText: { color: '#93c5fd', fontSize: 13 },
    optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 2, borderColor: '#334155' },
    optionSelected: { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' },
    optionCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    optionCircleSelected: { backgroundColor: '#3b82f6' },
    optionLetter: { color: '#94a3b8', fontWeight: 'bold' },
    optionLetterSelected: { color: '#fff' },
    optionValue: { color: '#e2e8f0', flex: 1 },
    submitContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#1e293b' },

    // Results
    resultEmoji: { fontSize: 80 },
    resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 20 },
    scoreCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginTop: 30, borderWidth: 4, borderColor: '#3b82f6' },
    scoreNumber: { fontSize: 48, fontWeight: 'bold', color: '#3b82f6' },
    scoreLabel: { color: '#64748b', fontSize: 14 },
    resultMessage: { color: '#94a3b8', marginTop: 20, textAlign: 'center' },

    // Grades
    gradeCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12 },
    gradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    gradeTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },
    gradeBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    gradePass: { backgroundColor: '#10b981' },
    gradeFail: { backgroundColor: '#ef4444' },
    gradeScore: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    gradeDate: { color: '#64748b', fontSize: 12, marginTop: 8 },

    // Empty States
    emptyState: { alignItems: 'center', padding: 40 },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    emptyText: { color: '#64748b', textAlign: 'center' },

    // Web Notice
    webNotice: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, alignItems: 'center' },
    webNoticeIcon: { fontSize: 48, marginBottom: 16 },
    webNoticeTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    webNoticeText: { color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
    webNoticeUrl: { color: '#3b82f6', fontWeight: '600' },

    // Errors
    errorBox: { backgroundColor: 'rgba(239,68,68,0.15)', padding: 16, borderRadius: 12, marginBottom: 16 },
    errorText: { color: '#fca5a5', textAlign: 'center' },
    retryButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'center', marginTop: 12 },
    retryText: { color: '#fff', fontWeight: 'bold' },
});

export default styles;
