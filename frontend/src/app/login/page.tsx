'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useWizardStore } from '../../store/useWizardStore';
import { useLanguageStore, TRANSLATIONS } from '../../store/useLanguageStore';
import LanguageToggle from '../../components/LanguageToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import BrandLogo from '../../components/BrandLogo';
import api from '../../lib/axios';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, CalendarDays, CheckCircle, Eye, EyeOff, Home } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const wizardState = useWizardStore();
  const resetWizard = useWizardStore((state) => state.resetWizard);
  const [showHydrationPrompt, setShowHydrationPrompt] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.access_token;
      // Pass token directly — setAuth hasn't been called yet so the
      // interceptor cannot add it automatically to this request.
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuth(token, userRes.data);
      if (wizardState.gurus.length > 0 || wizardState.mapels.length > 0) {
        setShowHydrationPrompt(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between pb-16 md:pb-0">
      
      {/* Sleek Top Navigation Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <BrandLogo href="/" size="md" />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle compact />
          <ThemeToggle iconOnly />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-foreground/5 font-bold text-xs transition-colors"
          >
            <Home size={14} className="text-primary" />
            <span className="hidden sm:inline">{t.backToHome}</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo / Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div className="flex justify-center mb-4">
              <BrandLogo href="/" size="lg" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--foreground)', marginBottom: 4 }}>
              {t.welcome}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              {t.loginSubtitle}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10,
              padding: '0.75rem 1rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.875rem', color: '#B91C1C',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form Card */}
          <div style={{
            background: 'var(--card)', border: '1.5px solid var(--border)',
            borderRadius: 16, padding: '1.75rem',
          }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label">{t.email}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="field-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">{t.password}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? t.hidePassword : t.showPassword}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', borderRadius: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.375rem' }}>
                  <Link href="/lupa-password" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                    Lupa Kata Sandi?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>{t.login} <ArrowRight size={16} /></>}
              </button>
            </form>

            {/* Link to Register */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              {t.noAccount}{' '}
              <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                {t.registerNow}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        Jadwale — {t.versionUpdate}
      </footer>

      {/* Hydration Prompt */}
      {showHydrationPrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={24} color="#2563EB" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', textAlign: 'center', marginBottom: '0.5rem' }}>{t.draftFound}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center', marginBottom: '1.25rem' }}>
              {t.draftDesc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => router.push('/wizard')} className="btn btn-primary" style={{ width: '100%' }}>{t.continueDraft}</button>
              <button onClick={() => { resetWizard(); router.push('/dashboard'); }} className="btn btn-secondary" style={{ width: '100%' }}>{t.discardDraft}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
