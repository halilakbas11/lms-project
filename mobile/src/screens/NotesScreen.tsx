// NotesScreen - SOLID: Single Responsibility for notes management
// Clean Architecture: Presentation layer screen

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { styles } from '../styles/styles';
import apiService from '../services/ApiService';

interface NotesScreenProps {
    userId: number;
    onBack: () => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({ userId, onBack }) => {
    const { t } = useLanguage();
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteColor, setNoteColor] = useState('#FFE066');

    const NOTE_COLORS = ['#FFE066', '#A3E635', '#67E8F9', '#C4B5FD', '#FDA4AF', '#FED7AA'];

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const data = await apiService.getNotes(userId);
            setNotes(data || []);
        } catch (err) {
            console.log('Error fetching notes:', err);
        }
        setLoading(false);
    };

    const handleCreateNote = async () => {
        if (!noteTitle.trim()) return;
        try {
            await apiService.createNote(userId, noteTitle, noteContent, noteColor);
            setShowModal(false);
            setNoteTitle('');
            setNoteContent('');
            setNoteColor('#FFE066');
            fetchNotes();
        } catch (err) {
            console.log('Error creating note:', err);
        }
    };

    const handleTogglePin = async (noteId: number) => {
        try {
            await apiService.toggleNotePin(noteId);
            fetchNotes();
        } catch (err) {
            console.log('Error pinning note:', err);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        Alert.alert(t('delete_note'), t('confirm_delete_note'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('delete_note'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiService.deleteNote(noteId);
                        fetchNotes();
                    } catch (err) {
                        console.log('Error deleting note:', err);
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
                        <Text style={{ color: '#3b82f6', fontSize: 16 }}>← {t('back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('my_notes')}</Text>
                    <TouchableOpacity onPress={() => setShowModal(true)} style={{ padding: 8, backgroundColor: '#3b82f6', borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ {t('new_note')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
                    ) : notes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyTitle}>{t('no_notes_yet')}</Text>
                            <TouchableOpacity
                                style={[styles.primaryButton, { marginTop: 16 }]}
                                onPress={() => setShowModal(true)}
                            >
                                <Text style={styles.buttonText}>+ {t('new_note')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {notes.map(note => (
                                <TouchableOpacity
                                    key={note.id}
                                    style={{
                                        width: '48%',
                                        backgroundColor: note.color + '60',
                                        borderRadius: 12,
                                        padding: 12,
                                        marginBottom: 12,
                                        borderLeftWidth: 4,
                                        borderLeftColor: note.color
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontWeight: 'bold', color: '#1e293b', flex: 1 }} numberOfLines={1}>
                                            {note.isPinned && '📌 '}{note.title}
                                        </Text>
                                    </View>
                                    <Text style={{ color: '#475569', fontSize: 12 }} numberOfLines={3}>
                                        {note.content}
                                    </Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                                        <TouchableOpacity onPress={() => handleTogglePin(note.id)}>
                                            <Text style={{ fontSize: 16 }}>{note.isPinned ? '📌' : '📍'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                                            <Text style={{ fontSize: 16 }}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Create Note Modal */}
                <Modal visible={showModal} transparent animationType="slide">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                                {t('new_note')}
                            </Text>

                            <Text style={{ color: '#94a3b8', marginBottom: 4 }}>{t('note_title')}</Text>
                            <TextInput
                                style={{ backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }}
                                placeholder={t('note_title')}
                                placeholderTextColor="#64748b"
                                value={noteTitle}
                                onChangeText={setNoteTitle}
                            />

                            <Text style={{ color: '#94a3b8', marginBottom: 4 }}>{t('note_content')}</Text>
                            <TextInput
                                style={{ backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, height: 100, textAlignVertical: 'top' }}
                                placeholder={t('note_content')}
                                placeholderTextColor="#64748b"
                                value={noteContent}
                                onChangeText={setNoteContent}
                                multiline
                            />

                            <Text style={{ color: '#94a3b8', marginBottom: 8 }}>{'Color'}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                                {NOTE_COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setNoteColor(color)}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            backgroundColor: color,
                                            borderWidth: noteColor === color ? 3 : 0,
                                            borderColor: '#fff'
                                        }}
                                    />
                                ))}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={{ flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' }}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center' }}
                                    onPress={handleCreateNote}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'Save'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

export default NotesScreen;
