'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AccessRequest {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    message: string | null;
    createdAt: string;
    student: { id: number; name: string; email: string };
    Course: { id: number; title: string; code: string };
}

export default function AccessRequestsPage() {
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [user, setUser] = useState<any>(null);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');
    const [loading, setLoading] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (!['instructor', 'manager', 'super_admin'].includes(parsed.role)) {
            router.push('/');
            return;
        }
        setUser(parsed);
    }, []);

    useEffect(() => {
        if (user) fetchRequests();
    }, [user, filter]);

    const fetchRequests = async () => {
        try {
            const params = new URLSearchParams();
            if (user.role === 'instructor') params.set('instructorId', user.id);
            if (filter === 'pending') params.set('status', 'pending');

            const res = await axios.get(`http://localhost:3001/api/access-requests?${params}`);
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRespond = async (id: number, status: 'approved' | 'rejected') => {
        setLoading(id);
        try {
            await axios.put(`http://localhost:3001/api/access-requests/${id}/respond`, { status });
            fetchRequests();
        } catch (err) {
            alert('İşlem başarısız');
        } finally {
            setLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="badge" style={{ background: '#fbbf24', color: '#000' }}>Beklemede</span>;
            case 'approved':
                return <span className="badge" style={{ background: '#22c55e', color: '#fff' }}>Onaylandı</span>;
            case 'rejected':
                return <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>Reddedildi</span>;
            default:
                return null;
        }
    };

    if (!user) return <div className="p-8 text-[var(--text-muted)]">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            {/* Header */}
            <header className="bg-[var(--bg)] border-b border-[var(--border)] px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-semibold text-[var(--text)]">Erişim Talepleri</h1>
                        <p className="text-sm text-[var(--text-muted)]">Öğrenci ders kayıt talepleri</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => router.push('/dashboard/instructor')} className="btn btn-secondary text-sm">
                            ← Geri
                        </button>
                        <button onClick={handleLogout} className="btn btn-ghost text-sm text-red-500">
                            Çıkış
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                {/* Filter */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`btn text-sm ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Bekleyenler
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn text-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Tümü
                    </button>
                </div>

                {/* Requests Table */}
                {requests.length === 0 ? (
                    <div className="card text-center text-[var(--text-muted)]">
                        {filter === 'pending' ? 'Bekleyen talep bulunmuyor.' : 'Hiç talep bulunmuyor.'}
                    </div>
                ) : (
                    <div className="card p-0 overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Öğrenci</th>
                                    <th>Ders</th>
                                    <th>Mesaj</th>
                                    <th>Tarih</th>
                                    <th>Durum</th>
                                    <th className="text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td>
                                            <div className="font-medium text-[var(--text)]">{req.student.name}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{req.student.email}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary text-xs">{req.Course.code}</span>
                                            <div className="text-sm mt-1">{req.Course.title}</div>
                                        </td>
                                        <td className="text-sm text-[var(--text-muted)] max-w-xs truncate">
                                            {req.message || '-'}
                                        </td>
                                        <td className="text-sm text-[var(--text-muted)]">
                                            {formatDate(req.createdAt)}
                                        </td>
                                        <td>{getStatusBadge(req.status)}</td>
                                        <td className="text-right">
                                            {req.status === 'pending' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleRespond(req.id, 'approved')}
                                                        disabled={loading === req.id}
                                                        className="btn btn-primary text-sm py-1 px-3"
                                                    >
                                                        {loading === req.id ? '...' : 'Onayla'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespond(req.id, 'rejected')}
                                                        disabled={loading === req.id}
                                                        className="btn btn-ghost text-sm py-1 px-3 text-red-500"
                                                    >
                                                        Reddet
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[var(--text-muted)]">İşlem tamamlandı</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
