'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader, StatsCard } from '../../components/layout';
import { useLanguage } from '../../i18n/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ManagerDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (password: string) => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const isPasswordValid = (password: string) => Object.values(validatePassword(password)).every(Boolean);
  const [passwordChecks, setPasswordChecks] = useState(validatePassword(''));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    setNewUser({ ...newUser, password });
    setPasswordChecks(validatePassword(password));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isPasswordValid(newUser.password)) {
      setError(t('password_requirements'));
      return;
    }
    try {
      const res = await axios.post('http://localhost:3001/api/users', newUser);
      if (res.data.success === false) {
        setError(res.data.errors?.join(', ') || res.data.message);
        return;
      }
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      setPasswordChecks(validatePassword(''));
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.message || t('error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUser?.id === id) {
      alert(t('cannot_delete_self') || 'Cannot delete yourself');
      return;
    }
    if (confirm(t('confirm_delete'))) {
      try {
        await axios.delete(`http://localhost:3001/api/users/${id}?currentUserId=${currentUser?.id}`);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || t('error'));
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-700',
      manager: 'bg-purple-100 text-purple-700',
      instructor: 'bg-blue-100 text-blue-700',
      assistant: 'bg-cyan-100 text-cyan-700',
      student: 'bg-green-100 text-green-700',
      guest: 'bg-gray-100 text-gray-600',
    };
    return colors[role] || 'bg-gray-100 text-gray-600';
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    manager: t('manager') || 'Manager',
    instructor: t('instructor') || 'Instructor',
    assistant: t('assistant') || 'Assistant',
    student: t('student') || 'Student',
    guest: t('guest') || 'Guest',
  };

  const CheckIcon = ({ ok }: { ok: boolean }) => (
    <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
  );

  if (!currentUser) {
    return (
      <DashboardLayout requiredRoles={['manager', 'super_admin']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRoles={['manager', 'super_admin']}>
      <PageHeader
        title={t('user_management')}
        description={t('manage_users_desc') || 'Manage system users'}
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + {t('add_user')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title={t('total_users')} value={users.length} icon={<>👥</>} />
        <StatsCard title={t('instructors')} value={users.filter(u => u.role === 'instructor').length} icon={<>👨‍🏫</>} />
        <StatsCard title={t('students')} value={users.filter(u => u.role === 'student').length} icon={<>🎓</>} />
        <StatsCard title={t('admins')} value={users.filter(u => u.role === 'super_admin' || u.role === 'manager').length} icon={<>🛡️</>} />
      </div>

      {/* Users Table */}
      <Card padding="none" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-tertiary)]">
              <tr>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">{t('user')}</th>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">{t('email')}</th>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">{t('role')}</th>
                <th className="text-right p-4 font-semibold text-[var(--text-secondary)]">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--bg-tertiary)]">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{user.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {currentUser.id === user.id ? (
                      <span className="text-gray-400 text-sm">({t('you') || 'You'})</span>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                        {t('delete')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('add_user')}</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" required className="input" placeholder={t('name')} value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
              <input type="email" required className="input" placeholder={t('email')} value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              <div>
                <input type="password" required className="input" placeholder={t('password')} value={newUser.password}
                  onChange={e => handlePasswordChange(e.target.value)} />
                {newUser.password && (
                  <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded text-sm space-y-1">
                    <p className="font-medium text-[var(--text-primary)] mb-2">{t('password_requirements')}:</p>
                    <p><CheckIcon ok={passwordChecks.minLength} /> {t('min_8_chars')}</p>
                    <p><CheckIcon ok={passwordChecks.hasUppercase} /> {t('has_uppercase')}</p>
                    <p><CheckIcon ok={passwordChecks.hasLowercase} /> {t('has_lowercase')}</p>
                    <p><CheckIcon ok={passwordChecks.hasNumber} /> {t('has_number')}</p>
                    <p><CheckIcon ok={passwordChecks.hasSpecial} /> {t('has_special')}</p>
                  </div>
                )}
              </div>
              <select className="input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                {Object.entries(roleLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                <Button variant="primary" type="submit" disabled={!isPasswordValid(newUser.password)}>{t('save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}