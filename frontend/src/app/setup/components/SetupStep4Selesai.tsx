'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/useAuthStore';
import { CheckCircle2, Sparkles, Users, Layers, BookOpen, ArrowRight, LayoutDashboard } from 'lucide-react';

interface SetupStep4Props {
  onBack: () => void;
}

export default function SetupStep4Selesai({ onBack }: SetupStep4Props) {
  const router = useRouter();
  const { user, setAuth, token } = useAuthStore();
  const [stats, setStats] = useState({ guru: 0, kelas: 0, mapel: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/sekolah/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const completeSetup = async (targetRoute: string) => {
    setSubmitting(true);
    try {
      await api.patch('/sekolah', {
        setupStep: 4,
        setupCompleted: true,
        status: 'ACTIVE',
      });

      // Refresh me profile to update local Zustand user state
      const meRes = await api.get('/auth/me');
      if (token && meRes.data) {
        setAuth(token, meRes.data);
      }

      router.push(targetRoute);
    } catch (err) {
      console.error('Error completing setup:', err);
      // Fallback redirect anyway
      router.push(targetRoute);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-10 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
        Selamat! Setup Sekolah SiapDigunakan
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
        Semua data awal sekolah telah tersimpan. Anda sekarang bisa langsung menyusun jadwal pelajaran secara otomatis atau masuk ke dashboard utama.
      </p>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.guru}</div>
          <div className="text-xs text-gray-500">Guru</div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Layers className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.kelas}</div>
          <div className="text-xs text-gray-500">Kelas</div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.mapel}</div>
          <div className="text-xs text-gray-500">Mata Pelajaran</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={() => completeSetup('/jadwal/generate')}
          className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          {submitting ? 'Memproses...' : 'Buat Jadwal Otomatis'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => completeSetup('/dashboard')}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Lihat Dashboard Dulu
        </button>
      </div>
    </div>
  );
}
