'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '../../components/layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../i18n/LanguageContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Password validation function
const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const isPasswordValid = (password: string) => {
  const checks = validatePassword(password);
  return Object.values(checks).every(Boolean);
};

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); // For edit mode
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [passwordChecks, setPasswordChecks] = useState(validatePassword(''));
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, instructors: 0, students: 0, admins: 0 });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/users');
      setUsers(res.data);

      const usersData = res.data as User[];
      setStats({
        totalUsers: usersData.length,
        instructors: usersData.filter(u => u.role === 'instructor').length,
        students: usersData.filter(u => u.role === 'student').length,
        admins: usersData.filter(u => u.role === 'super_admin' || u.role === 'manager').length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordChecks(validatePassword(password));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // For new users or password change, validate password
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
        // Update existing user
        const updateData: any = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) updateData.password = formData.password;

        await axios.put(`http://localhost:3001/api/users/${editingUser.id}`, updateData);
      } else {
        // Create new user
        const res = await axios.post('http://localhost:3001/api/users', formData);
        if (res.data.success === false) {
          setError(res.data.errors?.join(', ') || res.data.message);
          return;
        }
      }
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || t('error_add_user'));
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUser && currentUser.id === id) {
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

  const CheckIcon = ({ ok }: { ok: boolean }) => (
    <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title={t('admin_panel')}
        description={t('system_management')}
        actions={
          <Button onClick={openAddModal}>
            + {t('add_user')}
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-blue-500">{stats.totalUsers}</div>
          <div className="text-sm text-[var(--text-tertiary)]">{t('total_users')}</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-purple-500">{stats.instructors}</div>
          <div className="text-sm text-[var(--text-tertiary)]">{t('instructors')}</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-emerald-500">{stats.students}</div>
          <div className="text-sm text-[var(--text-tertiary)]">{t('students')}</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-amber-500">{stats.admins}</div>
          <div className="text-sm text-[var(--text-tertiary)]">{t('admins')}</div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-light)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">👥 {t('user_management')}</h2>
        </div>
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
              {users.map(user => (
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
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'student' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {roles[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-500 text-sm hover:underline"
                      >
                        {t('edit')}
                      </button>
                      {currentUser && currentUser.id === user.id ? (
                        <span className="text-gray-400 text-sm">({t('you')})</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          {t('delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              {editingUser ? `✏️ ${t('edit')} - ${editingUser.name}` : `➕ ${t('new_user')}`}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="input w-full"
                placeholder={t('name_surname')}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                required
                className="input w-full"
                placeholder={t('email')}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <div>
                <input
                  type="password"
                  required={!editingUser}
                  className="input w-full"
                  placeholder={editingUser ? `${t('password')} (opsiyonel)` : t('password')}
                  value={formData.password}
                  onChange={e => handlePasswordChange(e.target.value)}
                />
                {editingUser && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    Şifreyi değiştirmek istemiyorsanız boş bırakın
                  </p>
                )}
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
              <select
                className="input w-full"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                {Object.entries(roles).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                <Button
                  type="submit"
                  disabled={!editingUser && !isPasswordValid(formData.password)}
                >
                  {editingUser ? t('save_changes') : t('save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
