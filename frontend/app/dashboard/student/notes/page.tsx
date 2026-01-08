'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Note {
    id: number;
    title: string;
    content: string;
    color: string;
    isPinned: boolean;
    category: 'personal' | 'course' | 'exam';
    createdAt: string;
    updatedAt: string;
    course?: { id: number; title: string; code: string };
    exam?: { id: number; title: string };
}

interface Course {
    id: number;
    title: string;
    code: string;
}

const NOTE_COLORS = [
    '#FFE066', // Yellow
    '#A3E635', // Green  
    '#67E8F9', // Cyan
    '#C4B5FD', // Purple
    '#FDA4AF', // Pink
    '#FED7AA', // Orange
];

export default function StudentNotesPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [user, setUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(false);

    // Form state
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteColor, setNoteColor] = useState('#FFE066');
    const [noteCategory, setNoteCategory] = useState<'personal' | 'course' | 'exam'>('personal');
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchNotes(userData.id);
        fetchCourses(userData.id);
    }, []);

    const fetchNotes = async (userId: number, category?: string) => {
        try {
            const params = category && category !== 'all' ? `&category=${category}` : '';
            const res = await axios.get(`/api/notes?userId=${userId}${params}`);
            setNotes(res.data);
        } catch (err) {
            console.error('Error fetching notes:', err);
        }
    };

    const fetchCourses = async (userId: number) => {
        try {
            const res = await axios.get(`/api/my-courses?userId=${userId}`);
            setCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        if (user) {
            fetchNotes(user.id, newFilter === 'all' ? undefined : newFilter);
        }
    };

    const openCreateModal = () => {
        setEditingNote(null);
        setNoteTitle('');
        setNoteContent('');
        setNoteColor('#FFE066');
        setNoteCategory('personal');
        setSelectedCourseId(null);
        setShowModal(true);
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setNoteColor(note.color);
        setNoteCategory(note.category);
        setSelectedCourseId(note.course?.id || null);
        setShowModal(true);
    };

    const handleSaveNote = async () => {
        if (!noteTitle.trim()) return;
        setLoading(true);

        try {
            if (editingNote) {
                await axios.put(`/api/notes/${editingNote.id}`, {
                    userId: user.id,
                    title: noteTitle,
                    content: noteContent,
                    color: noteColor,
                    category: noteCategory,
                    courseId: selectedCourseId
                });
            } else {
                await axios.post('/api/notes', {
                    userId: user.id,
                    title: noteTitle,
                    content: noteContent,
                    color: noteColor,
                    category: noteCategory,
                    courseId: selectedCourseId
                });
            }
            setShowModal(false);
            fetchNotes(user.id, filter === 'all' ? undefined : filter);
        } catch (err) {
            console.error('Error saving note:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePin = async (note: Note) => {
        try {
            await axios.put(`/api/notes/${note.id}/pin`, {
                userId: user.id
            });
            fetchNotes(user.id, filter === 'all' ? undefined : filter);
        } catch (err) {
            console.error('Error pinning note:', err);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!confirm(t('confirm_delete_note'))) return;

        try {
            await axios.delete(`/api/notes/${noteId}?userId=${user.id}`);
            fetchNotes(user.id, filter === 'all' ? undefined : filter);
        } catch (err) {
            console.error('Error deleting note:', err);
        }
    };

    if (!user) {
        return (
            <DashboardLayout requiredRoles={['student', 'guest']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['student', 'guest']}>
            <PageHeader
                title={t('my_notes')}
                description={t('personal_notes')}
                actions={
                    <Button variant="primary" onClick={openCreateModal}>
                        + {t('new_note')}
                    </Button>
                }
            />

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'personal', 'course'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleFilterChange(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === cat
                                ? 'bg-blue-500 text-white'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                            }`}
                    >
                        {cat === 'all' ? t('all') : cat === 'personal' ? t('personal_notes') : t('course_notes')}
                    </button>
                ))}
            </div>

            {/* Notes Grid */}
            {notes.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-[var(--text-secondary)]">{t('no_notes_yet')}</p>
                    <Button variant="primary" className="mt-4" onClick={openCreateModal}>
                        + {t('new_note')}
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className="rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                            style={{ backgroundColor: note.color + '40', borderLeft: `4px solid ${note.color}` }}
                            onClick={() => openEditModal(note)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                    {note.isPinned && <span title={t('pinned')}>📌</span>}
                                    {note.title}
                                </h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleTogglePin(note); }}
                                        className="p-1.5 rounded hover:bg-black/10"
                                        title={note.isPinned ? t('unpin_note') : t('pin_note')}
                                    >
                                        {note.isPinned ? '📌' : '📍'}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                        className="p-1.5 rounded hover:bg-red-100 text-red-500"
                                        title={t('delete_note')}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{note.content}</p>
                            {note.course && (
                                <span className="inline-block mt-2 text-xs px-2 py-1 bg-white/50 rounded">
                                    📚 {note.course.code}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content p-6 max-w-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                            {editingNote ? t('edit') : t('new_note')}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                    {t('note_title')}
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={t('enter_note_title')}
                                    value={noteTitle}
                                    onChange={e => setNoteTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                    {t('note_content')}
                                </label>
                                <textarea
                                    className="input"
                                    rows={5}
                                    placeholder={t('write_note_content')}
                                    value={noteContent}
                                    onChange={e => setNoteContent(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    {t('note_color')}
                                </label>
                                <div className="flex gap-2">
                                    {NOTE_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNoteColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${noteColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                    {t('category')}
                                </label>
                                <select
                                    className="input"
                                    value={noteCategory}
                                    onChange={e => setNoteCategory(e.target.value as any)}
                                >
                                    <option value="personal">{t('personal_notes')}</option>
                                    <option value="course">{t('course_notes')}</option>
                                </select>
                            </div>

                            {noteCategory === 'course' && courses.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                        {t('course')}
                                    </label>
                                    <select
                                        className="input"
                                        value={selectedCourseId || ''}
                                        onChange={e => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">{t('select_course')}</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end mt-6">
                            <Button variant="ghost" onClick={() => setShowModal(false)}>
                                {t('cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleSaveNote} disabled={loading || !noteTitle.trim()}>
                                {loading ? t('saving') : t('save')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
