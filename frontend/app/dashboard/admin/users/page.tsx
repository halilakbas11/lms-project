'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader, StatsCard } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

const validatePassword = (password: string) => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const isPasswordValid = (password: string) => Object.values(validatePassword(password)).every(Boolean);

export default function AdminUsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [passwordChecks, setPasswordChecks] = useState(validatePassword(''));
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'student' });
        setPasswordChecks(validatePassword(''));
        setError(null);
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setPasswordChecks(validatePassword(''));
        setError(null);
        setShowModal(true);
    };

    const handlePasswordChange = (password: string) => {
        setFormData({ ...formData, password });
        setPasswordChecks(validatePassword(password));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!editingUser && !isPasswordValid(formData.password)) {
            setError(t('password_requirements_error'));
            return;
        }
        if (editingUser && formData.password && !isPasswordValid(formData.password)) {
            setError(t('password_requirements_error'));
            return;
        }

        try {
            if (editingUser) {
                const updateData: any = { name: formData.name, email: formData.email, role: formData.role };
                if (formData.password) updateData.password = formData.password;
                await axios.put(`http://localhost:3001/api/users/${editingUser.id}`, updateData);
            } else {
                await axios.post('http://localhost:3001/api/users', formData);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || t('error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (currentUser?.id === id) {
            alert(t('error_delete_self'));
            return;
        }
        if (confirm(t('confirm_delete'))) {
            try {
                await axios.delete(`http://localhost:3001/api/users/${id}?currentUserId=${currentUser?.id}`);
                fetchUsers();
            } catch (err: any) {
                alert(err.response?.data?.message || t('error_delete'));
            }
        }
    };

    const roles: Record<string, string> = {
        super_admin: t('admin'),
        manager: t('manager'),
        instructor: t('instructor'),
        assistant: t('assistant'),
        student: t('student'),
        guest: t('guest'),
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        instructors: users.filter(u => u.role === 'instructor').length,
        students: users.filter(u => u.role === 'student').length,
        admins: users.filter(u => u.role === 'super_admin' || u.role === 'manager').length,
    };

    const CheckIcon = ({ ok }: { ok: boolean }) => (
        <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
    );

    const getRoleBadgeClass = (role: string) => {
        const classes: Record<string, string> = {
            super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30',
            manager: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30',
            instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
            assistant: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30',
            student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30',
            guest: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30',
        };
        return classes[role] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <DashboardLayout requiredRoles={['super_admin', 'manager']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRoles={['super_admin', 'manager']}>
            <PageHeader
                title={t('user_management')}
                description={t('manage_users_desc')}
                actions={
                    <Button onClick={openAddModal}>
                        + {t('add_user')}
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatsCard title={t('total_users')} value={stats.total} icon={<UsersIcon />} />
                <StatsCard title={t('instructors')} value={stats.instructors} icon={<TeacherIcon />} />
                <StatsCard title={t('students')} value={stats.students} icon={<StudentIcon />} />
                <StatsCard title={t('admins')} value={stats.admins} icon={<ShieldIcon />} />
            </div>

            {/* Filters */}
            <Card className="mb-6" padding="sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={`${t('search')}...`}
                            className="input w-full pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <select
                        className="input w-full sm:w-48"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="all">{t('all')}</option>
                        {Object.entries(roles).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Users Table */}
            <Card padding="none" hover={false}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--bg-tertiary)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase">{t('user')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase">{t('email')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase">{t('role')}</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-light)]">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleBadgeClass(user.role)}`}>
                                            {roles[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>✏️</Button>
                                            {currentUser?.id !== user.id ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>🗑️</Button>
                                            ) : (
                                                <span className="text-xs text-[var(--text-tertiary)]">({t('you')})</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                            {editingUser ? `✏️ ${t('edit')} - ${editingUser.name}` : `➕ ${t('new_user')}`}
                        </h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" required className="input w-full" placeholder={t('name_surname')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input type="email" required className="input w-full" placeholder={t('email')} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <div>
                                <input type="password" required={!editingUser} className="input w-full" placeholder={editingUser ? `${t('password')} (opsiyonel)` : t('password')} value={formData.password} onChange={e => handlePasswordChange(e.target.value)} />
                                {formData.password && (
                                    <div className="mt-2 p-3 bg-[var(--bg-tertiary)] rounded-xl text-sm space-y-1">
                                        <p className="font-medium text-[var(--text-primary)] mb-2">{t('password_requirements')}</p>
                                        <p><CheckIcon ok={passwordChecks.minLength} /> {t('min_8_chars')}</p>
                                        <p><CheckIcon ok={passwordChecks.hasUppercase} /> {t('min_1_uppercase')}</p>
                                        <p><CheckIcon ok={passwordChecks.hasLowercase} /> {t('min_1_lowercase')}</p>
                                        <p><CheckIcon ok={passwordChecks.hasNumber} /> {t('min_1_number')}</p>
                                        <p><CheckIcon ok={passwordChecks.hasSpecial} /> {t('min_1_special')}</p>
                                    </div>
                                )}
                            </div>
                            <select className="input w-full" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                {Object.entries(roles).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                                <Button type="submit" disabled={!editingUser && !isPasswordValid(formData.password)}>{editingUser ? t('save_changes') : t('save')}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// Icons
const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const TeacherIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" />
    </svg>
);

const StudentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
