'use client';
import { useState } from 'react';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal, { ModalFooter } from '../../../components/ui/Modal';
import { useLanguage } from '../../../i18n/LanguageContext';

interface Question {
    id: number;
    text: string;
    type: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    tags: string[];
}

export default function QuestionBankPage() {
    const { t } = useLanguage();

    // Demo questions translated where possible or static
    const demoQuestions: Question[] = [
        { id: 1, text: "SQL'de veri silmek için hangi komut kullanılır?", type: 'multiple_choice', category: 'Veritabanı', difficulty: 'easy', points: 5, tags: ['sql', 'temel'] },
        { id: 2, text: "Aşağıdaki veri tiplerinden hangileri sayısaldır?", type: 'multiple_selection', category: 'Programlama', difficulty: 'easy', points: 5, tags: ['veri tipleri'] },
        { id: 3, text: "Primary Key null değer alabilir.", type: 'true_false', category: 'Veritabanı', difficulty: 'easy', points: 3, tags: ['sql', 'anahtar'] },
        { id: 4, text: "Kavramları tanımlarıyla eşleştirin.", type: 'matching', category: 'Genel', difficulty: 'medium', points: 10, tags: ['kavram'] },
        { id: 5, text: "Bubble Sort algoritmasını adım adım yazın.", type: 'long_answer', category: 'Algoritmalar', difficulty: 'hard', points: 20, tags: ['algoritma', 'sıralama'] },
        { id: 6, text: "Fibonacci fonksiyonunu yazın ve çalıştırın.", type: 'code_execution', category: 'Programlama', difficulty: 'medium', points: 15, tags: ['fonksiyon', 'recursion'] },
    ];

    const [questions, setQuestions] = useState<Question[]>(demoQuestions);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    // Constants using t() needs to be inside component or memoized with language dependency
    // But questionTypes are static config. We can wrap labels in render.
    const questionTypes = [
        { value: 'multiple_choice', label: t('multiple_choice'), icon: '◉', auto: true, desc: 'Tek doğru cevaplı çoktan seçmeli' },
        { value: 'multiple_selection', label: t('multiple_selection'), icon: '☑', auto: true, desc: 'Birden fazla doğru cevap' },
        { value: 'true_false', label: t('true_false'), icon: '✓✗', auto: true, desc: 'İkili seçenekli soru' },
        { value: 'matching', label: t('matching'), icon: '⇄', auto: true, desc: 'Öğeleri eşleştirme' },
        { value: 'ordering', label: t('ordering'), icon: '↕', auto: true, desc: 'Doğru sırayı belirleme' },
        { value: 'fill_blank', label: t('fill_blank'), icon: '___', auto: true, desc: 'Boş alanları doldurma' },
        { value: 'short_answer', label: t('short_answer'), icon: '✎', auto: 'partial', desc: 'Kısa metin cevabı' },
        { value: 'long_answer', label: t('long_answer'), icon: '📝', auto: false, desc: 'Detaylı açıklama gerektiren' },
        { value: 'file_upload', label: 'Dosya Yükleme', icon: '📎', auto: false, desc: 'Dosya ile cevaplama' }, // Need key
        { value: 'calculation', label: t('calculation'), icon: '🔢', auto: true, desc: 'Matematiksel hesaplama' },
        { value: 'hotspot', label: 'Hotspot', icon: '🎯', auto: true, desc: 'Görsel üzerinde işaretleme' }, // Need key
        { value: 'code_execution', label: t('code_execution'), icon: '💻', auto: true, desc: 'Öğrenci çıktıya en yakın seçeneği seçer' },
    ];

    const categories = ['Genel', 'Veritabanı', 'Programlama', 'Ağ', 'Güvenlik', 'Algoritmalar'];

    // New question state
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'multiple_choice',
        category: 'Genel',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        points: 5,
        options: ['', '', '', ''],
        correctAnswer: '',
        tags: '',
    });

    // Edit question handlers
    const handleEditClick = (q: Question) => {
        setEditingQuestion(q);
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!editingQuestion) return;
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? editingQuestion : q));
        setShowEditModal(false);
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = (id: number) => {
        if (!confirm(t('delete_question_confirm'))) return;
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || q.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
    });

    const handleSelectAll = () => {
        if (selectedQuestions.length === filteredQuestions.length) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(filteredQuestions.map(q => q.id));
        }
    };

    const handleSelect = (id: number) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCreateQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        const newQ: Question = {
            id: Date.now(),
            text: newQuestion.text,
            type: newQuestion.type,
            category: newQuestion.category,
            difficulty: newQuestion.difficulty,
            points: newQuestion.points,
            tags: newQuestion.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        setQuestions([newQ, ...questions]);
        setShowModal(false);
        setNewQuestion({
            text: '', type: 'multiple_choice', category: 'Genel', difficulty: 'medium',
            points: 5, options: ['', '', '', ''], correctAnswer: '', tags: '',
        });
    };

    const getDifficultyBadge = (diff: string) => {
        const colors = {
            easy: 'badge-success',
            medium: 'badge-warning',
            hard: 'badge-danger',
        };
        // Using t() for labels
        const labels: Record<string, string> = { easy: t('easy'), medium: t('medium'), hard: t('hard') };
        return <span className={`badge ${colors[diff as keyof typeof colors]}`}>{labels[diff] || diff}</span>;
    };

    const getTypeIcon = (type: string) => {
        const t = questionTypes.find(qt => qt.value === type);
        return t?.icon || '?';
    };

    return (
        <DashboardLayout requiredRoles={['instructor', 'assistant', 'super_admin']}>
            <PageHeader
                title={t('question_bank')}
                description={t('question_bank_desc')}
                actions={
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <PlusIcon />
                        {t('add_question')}
                    </Button>
                }
            />

            {/* Question Types Overview */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                {questionTypes.slice(0, 6).map(type => (
                    <button
                        key={type.value}
                        onClick={() => setTypeFilter(type.value === typeFilter ? 'all' : type.value)}
                        className={`card p-4 text-center transition-all ${typeFilter === type.value ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                    >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-xs font-medium text-[var(--text-secondary)] truncate">{type.label}</div>
                        {type.auto === true && <span className="text-[10px] text-emerald-500">{t('automatic')}</span>}
                        {type.auto === false && <span className="text-[10px] text-orange-500">{t('manual')}</span>}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <Card className="mb-6" padding="sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                        <input
                            type="text"
                            placeholder={t('search')}
                            className="input pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="input w-full sm:w-48"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="all">{t('all_types')}</option>
                        {questionTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    <select
                        className="input w-full sm:w-40"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">{t('all_categories')}</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Selection Actions */}
            {selectedQuestions.length > 0 && (
                <div className="mb-4 flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-slide-up">
                    <span className="text-sm font-medium text-blue-600">
                        {t('selected_questions_count').replace('{count}', selectedQuestions.length.toString())}
                    </span>
                    <Button variant="secondary" size="sm">{t('add_to_exam')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedQuestions([])}>{t('clear_selection')}</Button>
                </div>
            )}

            {/* Questions List */}
            <Card padding="none" hover={false}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded"
                                    />
                                </th>
                                <th>{t('question')}</th>
                                <th>{t('exam_type')}</th>
                                <th>{t('category')}</th>
                                {/* category key missing? using raw 'Kategori' in headers usually */}
                                <th>{t('difficulty')}</th>
                                {/* difficulty key missing? */}
                                <th>{t('points')}</th>
                                <th className="text-right">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map((q, index) => (
                                <tr
                                    key={q.id}
                                    className={`animate-fade-in ${selectedQuestions.includes(q.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                                    style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(q.id)}
                                            onChange={() => handleSelect(q.id)}
                                            className="w-4 h-4 rounded"
                                        />
                                    </td>
                                    <td>
                                        <p className="font-medium text-[var(--text-primary)] line-clamp-1">{q.text}</p>
                                        <div className="flex gap-1 mt-1">
                                            {q.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="flex items-center gap-2 text-sm">
                                            <span className="text-lg">{getTypeIcon(q.type)}</span>
                                            {questionTypes.find(t => t.value === q.type)?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-primary">{q.category}</span>
                                    </td>
                                    <td>{getDifficultyBadge(q.difficulty)}</td>
                                    <td>
                                        <span className="font-medium text-[var(--text-primary)]">{q.points}</span>
                                    </td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(q)}><EditIcon /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.id)}><TrashIcon /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Question Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={t('create_new_question') || 'Yeni Soru Oluştur'} // create_new_question needs adding
                size="lg"
            >
                <form onSubmit={handleCreateQuestion}>
                    <div className="space-y-4">
                        {/* Question Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('question_type')} *</label>
                            <div className="grid grid-cols-4 gap-2">
                                {questionTypes.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setNewQuestion({ ...newQuestion, type: type.value })}
                                        className={`p-3 rounded-xl border text-center transition-all ${newQuestion.type === type.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'
                                            }`}
                                    >
                                        <div className="text-xl mb-1">{type.icon}</div>
                                        <div className="text-[10px] font-medium truncate">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Text */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('question_text')} *</label>
                            <textarea
                                required
                                className="input min-h-[100px] resize-none"
                                placeholder={t('question_text_placeholder')}
                                value={newQuestion.text}
                                onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                            />
                        </div>

                        {/* Options for Multiple Choice */}
                        {(newQuestion.type === 'multiple_choice' || newQuestion.type === 'multiple_selection') && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('options')}</label>
                                {/* Need options key */}
                                <div className="space-y-2">
                                    {newQuestion.options.map((opt, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type={newQuestion.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                                                name="correct"
                                                className="mt-3 w-4 h-4"
                                                checked={newQuestion.correctAnswer === String.fromCharCode(65 + i)}
                                                onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: String.fromCharCode(65 + i) })}
                                            />
                                            <input
                                                type="text"
                                                className="input flex-1"
                                                placeholder={`${t('option_placeholder')} ${String.fromCharCode(65 + i)}`}
                                                value={opt}
                                                onChange={e => {
                                                    const opts = [...newQuestion.options];
                                                    opts[i] = e.target.value;
                                                    setNewQuestion({ ...newQuestion, options: opts });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category & Difficulty */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('category')}</label>
                                <select
                                    className="input"
                                    value={newQuestion.category}
                                    onChange={e => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('difficulty')}</label>
                                <select
                                    className="input"
                                    value={newQuestion.difficulty}
                                    onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                >
                                    <option value="easy">{t('easy')}</option>
                                    <option value="medium">{t('medium')}</option>
                                    <option value="hard">{t('hard')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Points & Tags */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('points')}</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    max="100"
                                    value={newQuestion.points}
                                    onChange={e => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('tags') || 'Etiketler'}</label>
                                {/* Need tags key */}
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={t('tags_placeholder')}
                                    value={newQuestion.tags}
                                    onChange={e => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                        <Button type="submit" variant="primary">{t('create')}</Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Edit Question Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingQuestion(null); }}
                title={t('edit_question') || 'Soru Düzenle'} // Need edit_question key
                size="lg"
            >
                {editingQuestion && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('question_text')} *</label>
                            <textarea
                                className="input min-h-[100px] resize-none w-full"
                                value={editingQuestion.text}
                                onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('category')}</label>
                                <select
                                    className="input w-full"
                                    value={editingQuestion.category}
                                    onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('difficulty')}</label>
                                <select
                                    className="input w-full"
                                    value={editingQuestion.difficulty}
                                    onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                >
                                    <option value="easy">{t('easy')}</option>
                                    <option value="medium">{t('medium')}</option>
                                    <option value="hard">{t('hard')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('points')}</label>
                            <input
                                type="number"
                                className="input w-32"
                                min="1"
                                max="100"
                                value={editingQuestion.points}
                                onChange={e => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 5 })}
                            />
                        </div>

                        {editingQuestion.type === 'code_execution' && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    💡 <strong>{t('code_execution')}:</strong> {t('code_execution_hint')}
                                </p>
                            </div>
                        )}

                        <ModalFooter>
                            <Button variant="ghost" onClick={() => { setShowEditModal(false); setEditingQuestion(null); }}>{t('cancel')}</Button>
                            <Button variant="primary" onClick={handleSaveEdit}>{t('save')}</Button>
                        </ModalFooter>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}

// Icons
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
