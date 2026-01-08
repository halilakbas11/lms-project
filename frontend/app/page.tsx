'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from './firebase';
import { useLanguage } from './i18n/LanguageContext';

export default function LoginPage() {
  const { t, language, setLanguage, languageNames } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    await performLogin(email, password, 'local');
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email) {
        await performLogin(result.user.email, null, 'google');
      }
    } catch (error) {
      setError("Google ile giriş yapılamadı.");
    }
    setIsLoading(false);
  };

  const performLogin = async (email: string, password: string | null, provider: string) => {
    try {
      const res = await axios.post('http://localhost:3001/api/login', { email, password, provider });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const role = res.data.user.role;
        if (role === 'super_admin' || role === 'manager') router.push('/dashboard/admin');
        else if (role === 'instructor' || role === 'assistant') router.push('/dashboard/instructor');
        else router.push('/dashboard/student');
      }
    } catch (err) {
      setError(t('login_error'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4 relative">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 flex gap-2">
        {(Object.keys(languageNames) as Array<keyof typeof languageNames>).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${language === lang
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
          >
            {languageNames[lang]}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('app_name')}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">LMS</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">{t('login')}</h2>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">{t('email')}</label>
              <input
                type="email"
                className="input"
                placeholder="ornek@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">{t('password')}</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
              {isLoading ? t('loading') : t('login')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[var(--bg-card)] text-[var(--text-muted)]">OR</span>
            </div>
          </div>

          <button onClick={handleGoogleLogin} disabled={isLoading} className="btn btn-secondary w-full">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
            Google Login
          </button>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 rounded border border-[var(--border)] bg-[var(--bg)]">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-[var(--text-muted)]">
            <button
              onClick={() => { setEmail('admin@uni.edu.tr'); setPassword('123'); }}
              className="block hover:text-[var(--primary)]"
            >
              Admin: admin@uni.edu.tr
            </button>
            <button
              onClick={() => { setEmail('hoca@uni.edu.tr'); setPassword('123'); }}
              className="block hover:text-[var(--primary)]"
            >
              Instructor: hoca@uni.edu.tr
            </button>
            <button
              onClick={() => { setEmail('ali@uni.edu.tr'); setPassword('123'); }}
              className="block hover:text-[var(--primary)]"
            >
              Student: ali@uni.edu.tr
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}