'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import LanguageToggle from '../../components/LanguageToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import api from '../../lib/axios';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (!token) {
      setError('Token reset password tidak ditemukan pada tautan ini.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mereset kata sandi. Tautan mungkin telah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold text-red-800 dark:text-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center py-4 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Kata Sandi Berhasil Diperbarui!
          </h3>
          <p className="text-xs text-muted-foreground">
            Mengalihkan Anda ke halaman login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Simpan Kata Sandi Baru <ArrowRight size={16} /></>}
          </button>
        </form>
      )}

      <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
        Kembali ke{' '}
        <Link href="/login" className="text-blue-700 font-bold hover:underline">
          Halaman Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      
      {/* Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <BrandLogo href="/" size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle compact />
          <ThemeToggle iconOnly />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">
              <KeyRound size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Buat Kata Sandi Baru
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
              Silakan masukkan kata sandi baru untuk akun Anda.
            </p>
          </div>

          <Suspense fallback={
            <div className="p-8 text-center bg-card border border-border rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-blue-700 mx-auto" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        Platform Penjadwalan Sekolah — <span className="font-bold text-blue-700">Jadwale</span>
      </footer>

    </div>
  );
}
