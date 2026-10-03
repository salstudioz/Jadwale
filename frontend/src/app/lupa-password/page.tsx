'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import LanguageToggle from '../../components/LanguageToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import api from '../../lib/axios';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResultData(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResultData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      
      {/* Navigation Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <BrandLogo href="/" size="md" />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle compact />
          <ThemeToggle iconOnly />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted font-bold text-xs transition-colors"
          >
            <ArrowLeft size={14} className="text-blue-700" />
            <span>Kembali ke Login</span>
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-700/10 text-blue-700 flex items-center justify-center mx-auto mb-3 font-bold">
              <KeyRound size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Lupa Kata Sandi?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
              Masukkan alamat email terdaftar Anda untuk mengatur ulang kata sandi akun Jadwale.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {!resultData ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Kirim Petunjuk Reset <ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                
                <h3 className="font-bold text-base text-foreground">
                  Petunjuk Terkirim!
                </h3>
                
                <p className="text-xs text-muted-foreground">
                  {resultData.message}
                </p>

                {/* Direct action link in demo mode */}
                {resultData.resetUrl && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                      Demo Mode (Klik untuk Reset Langsung):
                    </span>
                    <Link
                      href={resultData.resetUrl}
                      className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      Buka Halaman Reset Password Baru →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
              Ingat kata sandi Anda?{' '}
              <Link href="/login" className="text-blue-700 font-bold hover:underline">
                Masuk Sekarang
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        Platform Penjadwalan Sekolah — <span className="font-bold text-blue-700">Jadwale</span>
      </footer>

    </div>
  );
}
