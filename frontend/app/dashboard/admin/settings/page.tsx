'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout, PageHeader } from '../../../components/layout';
import { useLanguage } from '../../../i18n/LanguageContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Settings {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultLanguage: string;
    defaultRole: string;
    emailNotifications: boolean;
    sebEnabled: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
}

export default function AdminSettingsPage() {
    const { t, language, setLanguage } = useLanguage();
    const [settings, setSettings] = useState<Settings>({
        siteName: 'LMS Öğrenim Platformu',
        siteDescription: 'Modern Öğrenme Yönetim Sistemi',
        maintenanceMode: false,
        allowRegistration: true,
        defaultLanguage: 'tr',
        defaultRole: 'student',
        emailNotifications: true,
        sebEnabled: true,
        maxLoginAttempts: 5,
        sessionTimeout: 60,
    });
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        // Load settings from localStorage
        const stored = localStorage.getItem('lms_settings');
        if (stored) {
            setSettings(JSON.parse(stored));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('lms_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'general', label: t('general') || 'Genel', icon: '⚙️' },
        { id: 'security', label: t('security') || 'Güvenlik', icon: '🔒' },
        { id: 'appearance', label: t('appearance') || 'Görünüm', icon: '🎨' },
        { id: 'notifications', label: t('notifications') || 'Bildirimler', icon: '🔔' },
    ];

    const roles: Record<string, string> = {
        student: t('student'),
        guest: t('guest'),
        instructor: t('instructor'),
    };

    return (
        <DashboardLayout requiredRoles={['super_admin', 'manager']}>
            <PageHeader
                title={t('settings')}
                description={t('settings_desc') || 'Sistem ayarlarını yönetin'}
                actions={
                    <Button onClick={handleSave}>
                        💾 {t('save_changes')}
                    </Button>
                }
            />

            {saved && (
                <div className="mb-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-700 dark:text-emerald-400 animate-slide-up">
                    ✅ {t('settings_saved') || 'Ayarlar kaydedildi!'}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-light)]'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
                <Card>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">⚙️ {t('general_settings') || 'Genel Ayarlar'}</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('site_name') || 'Site Adı'}</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={settings.siteName}
                                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('site_description') || 'Site Açıklaması'}</label>
                            <textarea
                                className="input w-full"
                                rows={2}
                                value={settings.siteDescription}
                                onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('default_language') || 'Varsayılan Dil'}</label>
                            <select
                                className="input w-full"
                                value={settings.defaultLanguage}
                                onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
                            >
                                <option value="tr">Türkçe</option>
                                <option value="en">English</option>
                                <option value="jp">日本語</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('default_role') || 'Varsayılan Rol'}</label>
                            <select
                                className="input w-full"
                                value={settings.defaultRole}
                                onChange={e => setSettings({ ...settings, defaultRole: e.target.value })}
                            >
                                {Object.entries(roles).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">{t('allow_registration') || 'Kayıt İzni'}</p>
                                <p className="text-sm text-[var(--text-tertiary)]">{t('allow_registration_desc') || 'Yeni kullanıcıların kayıt olmasına izin ver'}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.allowRegistration}
                                    onChange={e => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
                <Card>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">🔒 {t('security_settings') || 'Güvenlik Ayarları'}</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">{t('maintenance_mode') || 'Bakım Modu'}</p>
                                <p className="text-sm text-[var(--text-tertiary)]">{t('maintenance_desc') || 'Siteyi bakım moduna al'}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenanceMode}
                                    onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">{t('seb_required') || 'SEB Zorunluluğu'}</p>
                                <p className="text-sm text-[var(--text-tertiary)]">{t('seb_desc') || 'Sınavlarda Safe Exam Browser zorunlu'}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.sebEnabled}
                                    onChange={e => setSettings({ ...settings, sebEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('max_login_attempts') || 'Maks. Giriş Denemesi'}</label>
                            <input
                                type="number"
                                className="input w-32"
                                min="3"
                                max="10"
                                value={settings.maxLoginAttempts}
                                onChange={e => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('session_timeout') || 'Oturum Süresi (dk)'}</label>
                            <input
                                type="number"
                                className="input w-32"
                                min="15"
                                max="480"
                                value={settings.sessionTimeout}
                                onChange={e => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
                <Card>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">🎨 {t('appearance_settings') || 'Görünüm Ayarları'}</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-4">{t('current_language') || 'Mevcut Dil'}</label>
                            <div className="flex gap-3">
                                {[
                                    { code: 'tr', label: '🇹🇷 Türkçe' },
                                    { code: 'en', label: '🇬🇧 English' },
                                    { code: 'jp', label: '🇯🇵 日本語' },
                                ].map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code as 'tr' | 'en' | 'jp')}
                                        className={`px-4 py-3 rounded-xl border-2 transition-all ${language === lang.code
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-4">{t('theme') || 'Tema'}</label>
                            <div className="flex gap-3">
                                {[
                                    { id: 'light', label: '☀️ Açık', bg: 'bg-white border-gray-200' },
                                    { id: 'dark', label: '🌙 Koyu', bg: 'bg-gray-900 border-gray-700' },
                                    { id: 'system', label: '🖥️ Sistem', bg: 'bg-gradient-to-r from-white to-gray-900 border-gray-400' },
                                ].map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => {
                                            if (theme.id === 'dark') document.documentElement.classList.add('dark');
                                            else if (theme.id === 'light') document.documentElement.classList.remove('dark');
                                        }}
                                        className={`px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${theme.bg}`}
                                    >
                                        <span className={theme.id === 'dark' ? 'text-white' : 'text-gray-900'}>{theme.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
                <Card>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">🔔 {t('notification_settings') || 'Bildirim Ayarları'}</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">{t('email_notifications') || 'E-posta Bildirimleri'}</p>
                                <p className="text-sm text-[var(--text-tertiary)]">{t('email_notifications_desc') || 'Önemli olaylar için e-posta gönder'}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.emailNotifications}
                                    onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <p className="text-amber-700 dark:text-amber-400 text-sm">
                                ⚠️ {t('email_config_needed') || 'E-posta göndermek için SMTP yapılandırması gereklidir.'}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </DashboardLayout>
    );
}
