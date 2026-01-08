'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout, PageHeader } from '@/app/components/layout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import useElectron from '@/app/hooks/useElectron';
import { useLanguage } from '@/app/i18n';

export default function SettingsPage() {
    const { t } = useLanguage();
    const {
        isElectron,
        appInfo,
        updateStatus,
        checkForUpdates,
        openDownloadFolder,
        getSettings,
        updateSettings
    } = useElectron();

    const [settings, setSettings] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isElectron) {
            getSettings().then(s => {
                if (s) setSettings(s);
            });
        }
    }, [isElectron, getSettings]);

    const handleCheckUpdates = async () => {
        setLoading(true);
        await checkForUpdates();
        setTimeout(() => setLoading(false), 3000);
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Ayarlar"
                description="Uygulama ayarlarını yönetin"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        ⚙️ Genel Ayarlar
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Dil / Language
                            </label>
                            <select className="input w-full">
                                <option value="tr">🇹🇷 Türkçe</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="jp">🇯🇵 日本語</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Tema / Theme
                            </label>
                            <select className="input w-full">
                                <option value="system">🖥️ Sistem</option>
                                <option value="light">☀️ Açık</option>
                                <option value="dark">🌙 Koyu</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Desktop App Settings (only shown when in Electron) */}
                {isElectron && (
                    <Card className="border-2 border-blue-200 dark:border-blue-900/50">
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            💻 Masaüstü Uygulama
                        </h2>

                        {/* App Info */}
                        {appInfo && (
                            <div className="mb-6 p-4 bg-[var(--bg-tertiary)] rounded-xl">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-[var(--text-tertiary)]">Versiyon:</div>
                                    <div className="font-mono text-[var(--text-primary)]">{appInfo.version}</div>
                                    <div className="text-[var(--text-tertiary)]">Platform:</div>
                                    <div className="font-mono text-[var(--text-primary)]">{appInfo.platform}</div>
                                    <div className="text-[var(--text-tertiary)]">Mimari:</div>
                                    <div className="font-mono text-[var(--text-primary)]">{appInfo.arch}</div>
                                    <div className="text-[var(--text-tertiary)]">Electron:</div>
                                    <div className="font-mono text-[var(--text-primary)]">{appInfo.electron}</div>
                                </div>
                            </div>
                        )}

                        {/* Update Status */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-primary)]">Güncelleme Durumu:</span>
                                <span className={`text-sm px-2 py-1 rounded ${updateStatus?.status === 'available' ? 'bg-blue-100 text-blue-700' :
                                    updateStatus?.status === 'downloading' ? 'bg-yellow-100 text-yellow-700' :
                                        updateStatus?.status === 'downloaded' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {updateStatus?.status === 'checking' && '🔍 Kontrol ediliyor...'}
                                    {updateStatus?.status === 'available' && `📥 Yeni sürüm: ${updateStatus.version}`}
                                    {updateStatus?.status === 'downloading' && `⏳ İndiriliyor: ${updateStatus.percent}%`}
                                    {updateStatus?.status === 'downloaded' && '✅ İndirildi, yeniden başlat'}
                                    {updateStatus?.status === 'not-available' && '✅ Güncel'}
                                    {updateStatus?.status === 'error' && '❌ Hata'}
                                    {!updateStatus && '—'}
                                </span>
                            </div>

                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleCheckUpdates}
                                disabled={loading}
                            >
                                {loading ? '🔄 Kontrol ediliyor...' : '🔄 Güncelleme Kontrol Et'}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={openDownloadFolder}
                            >
                                📂 İndirilenler Klasörünü Aç
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Notification Settings */}
                <Card>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        🔔 Bildirimler
                    </h2>
                    <div className="space-y-3">
                        {[
                            { key: 'newExam', label: 'Yeni Sınav Bildirimleri' },
                            { key: 'gradeUpdate', label: 'Not Güncellemeleri' },
                            { key: 'courseAnnouncement', label: 'Ders Duyuruları' },
                            { key: 'deadline', label: 'Yaklaşan Teslim Tarihleri' },
                        ].map(item => (
                            <label key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-light)] cursor-pointer hover:bg-[var(--bg-tertiary)]">
                                <span className="text-sm text-[var(--text-primary)]">{item.label}</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                            </label>
                        ))}
                    </div>
                </Card>

                {/* Platform Badge */}
                <Card className="md:col-span-2">
                    <div className="flex items-center justify-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${isElectron ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {isElectron ? '💻 Masaüstü Uygulaması' : '🌐 Web Tarayıcı'}
                        </span>
                        <span className="text-sm text-[var(--text-tertiary)]">
                            {isElectron
                                ? 'Electron tabanlı yerel uygulama olarak çalışıyorsunuz'
                                : 'Web tarayıcısında çalışıyorsunuz'
                            }
                        </span>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
