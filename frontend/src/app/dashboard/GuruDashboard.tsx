'use client';

import React from 'react';
import Link from 'next/link';
import api from '../../lib/axios';
import JadwalHariIni from './components/JadwalHariIni';
import { CalendarDays, Clock, Download, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GuruDashboardProps {
  user: any;
}

export default function GuruDashboard({ user }: GuruDashboardProps) {
  const isVerified = user?.is_verified ?? true;

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get('/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jadwal_Mengajar_${user?.nama || 'Guru'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert('Gagal mengunduh PDF. Pastikan jadwal sekolah sudah di-generate oleh admin.');
    }
  };

  const handleContactAdmin = () => {
    const phone = user?.sekolah?.no_hp || '';
    const text = encodeURIComponent(`Halo Admin ${user?.sekolah?.nama_sekolah || ''}, saya ${user?.nama} ingin mengonfirmasi verifikasi akun guru saya di Jadwale.`);
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    } else {
      alert(`Silakan hubungi Admin Sekolah Anda (${user?.sekolah?.nama_sekolah || 'Sekolah'}) untuk verifikasi akun.`);
    }
  };

  // If teacher is NOT verified by school admin yet
  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-950 dark:text-amber-200">
              Akun Menunggu Verifikasi Admin Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1 max-w-md mx-auto">
              Akun Anda sedang ditinjau oleh Admin Sekolah ({user?.sekolah?.nama_sekolah || 'Sekolah'}). Anda akan mendapat akses ke jadwal mengajar setelah diverifikasi.
            </p>
          </div>
          <div>
            <button
              onClick={handleContactAdmin}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Hubungi Admin Sekolah (WhatsApp)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Selamat Datang, {user?.nama}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {user?.sekolah?.nama_sekolah || 'Sekolah'} — Jadwal Mengajar Anda
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/my-schedule"
            className="px-4 py-2 bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs rounded-md transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <CalendarDays className="w-4 h-4" />
            Lihat Minggu Ini
          </Link>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 border border-blue-400 hover:bg-blue-600 text-white font-bold text-xs rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Main Focus: Jadwal Mengajar Hari Ini */}
      <JadwalHariIni isTeacherView={true} />

      {/* Quick Link Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-md">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">Grid Jadwal Mengajar Mingguan</div>
            <div className="text-xs text-gray-500">Lihat seluruh jadwal mengajar Senin – Sabtu dalam satu tampilan</div>
          </div>
        </div>

        <Link
          href="/dashboard/my-schedule"
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-md transition-colors inline-flex items-center gap-1.5"
        >
          Buka Jadwal Saya
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
