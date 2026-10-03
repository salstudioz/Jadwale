'use client';

import Link from 'next/link';
import { Home, ArrowLeft, CalendarDays, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import BrandLogo from '../components/BrandLogo';

export default function NotFound() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6">
      
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border">
        <BrandLogo href="/" size="md" />
        <Link
          href={user ? "/dashboard" : "/"}
          className="px-3.5 py-2 border border-border hover:bg-muted text-foreground font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Home size={14} className="text-blue-700" />
          <span>{user ? "Kembali ke Dashboard" : "Ke Halaman Utama"}</span>
        </Link>
      </header>

      {/* Main 404 Container */}
      <main className="max-w-md mx-auto w-full my-auto py-12 text-center space-y-6">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-blue-700/10 text-blue-700 flex items-center justify-center mx-auto font-black text-3xl">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang Anda klik kurang tepat.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
            >
              <Home size={16} />
              {user ? "Buka Dashboard Saya" : "Masuk ke Akun"}
            </Link>

            <Link
              href="/"
              className="w-full border border-border hover:bg-muted text-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors block"
            >
              <ArrowLeft size={16} />
              Kembali ke Beranda
            </Link>
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
