'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  RefreshCw, 
  LogOut, 
  ShieldAlert, 
  School, 
  UserCheck 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import BrandLogo from '../../components/BrandLogo';
import LanguageToggle from '../../components/LanguageToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import api from '../../lib/axios';

export default function StatusVerifikasiPage() {
  const router = useRouter();
  const { user, token, logout, setAuth } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await api.get('/auth/me');
      if (res.data.is_verified) {
        setAuth(token || '', res.data);
        setMessage('Selamat! Akun Anda telah diverifikasi oleh Admin Sekolah.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage('Akun Anda masih dalam antrean verifikasi Admin Sekolah.');
      }
    } catch (err: any) {
      setMessage('Gagal memperbarui status. Pastikan koneksi internet Anda stabil.');
    } finally {
      setChecking(false);
    }
  };

  const handleContactAdminWA = () => {
    const sekolahNama = user?.sekolah?.nama_sekolah || 'Sekolah';
    const text = `Halo Admin ${sekolahNama}, saya ${user?.nama || 'Guru'} (Email: ${user?.email || ''}) baru saja mendaftar akun Guru di Jadwale. Mohon bantuan untuk memverifikasi akun saya. Terima kasih!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6">
      
      {/* Top Navigation */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border">
        <BrandLogo href="/" size="md" />
        <div className="flex items-center gap-3">
          <LanguageToggle compact />
          <ThemeToggle iconOnly />
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
          
          {/* Animated Icon Badge */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock size={40} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md">
              <ShieldAlert size={16} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="inline-block bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
              Menunggu Persetujuan Admin Sekolah
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Verifikasi Akun Guru
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Halo, <span className="font-bold text-foreground">{user?.nama || 'Bapak/Ibu Guru'}</span>. Akun Anda telah terdaftar sebagai Tenaga Pendidik. Demi keamanan data sekolah, Admin perlu menyetujui akun Anda.
            </p>
          </div>

          {/* School Card Summary */}
          <div className="bg-muted/40 border border-border rounded-2xl p-4 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-700/10 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <School size={20} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Sekolah Terdaftar:
              </span>
              <p className="font-bold text-sm text-foreground truncate">
                {user?.sekolah?.nama_sekolah || 'Sekolah Terdaftar'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Email: {user?.email}
              </p>
            </div>
          </div>

          {/* Step Progress Checklist */}
          <div className="space-y-3 text-left bg-background border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 text-xs">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span className="font-bold text-foreground">Pendaftaran Akun Guru Berhasil</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Clock size={18} className="text-amber-600 animate-spin shrink-0" />
              <span className="font-bold text-amber-800 dark:text-amber-300">
                Persetujuan Akses oleh Admin Sekolah (Sedang Proses)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs opacity-50">
              <UserCheck size={18} className="text-muted-foreground shrink-0" />
              <span className="font-medium text-muted-foreground">Mulai Akses & Jadwal Mengajar</span>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-800 dark:text-blue-200">
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
            >
              <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
              {checking ? 'Memeriksa Status...' : 'Cek Status Verifikasi Terbaru'}
            </button>

            <button
              onClick={handleContactAdminWA}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
            >
              <MessageSquare size={16} />
              Hubungi Admin Sekolah via WhatsApp
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground max-w-xl mx-auto w-full pt-4">
        Platform Penjadwalan Sekolah — <span className="font-bold text-blue-700">Jadwale</span>
      </footer>

    </div>
  );
}
