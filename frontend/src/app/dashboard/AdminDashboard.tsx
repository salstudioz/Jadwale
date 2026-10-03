'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../lib/axios';
import SetupChecklist from './components/SetupChecklist';
import StatCard from './components/StatCard';
import JadwalHariIni from './components/JadwalHariIni';
import PerluPerhatian from './components/PerluPerhatian';
import {
  Users, GraduationCap, BookOpen, CalendarDays,
  Sparkles, FileSpreadsheet, UserPlus, Share2, ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState({ guru: 0, kelas: 0, mapel: 0, jadwal: 0 });
  const [sekolah, setSekolah] = useState<any>(user?.sekolah || null);
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [verifyingTeacherId, setVerifyingTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, sekolahRes, pendingRes] = await Promise.all([
          api.get('/sekolah/stats'),
          api.get('/sekolah'),
          api.get('/guru/pending/list').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setSekolah(sekolahRes.data);
        setPendingTeachers(pendingRes.data || []);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerifyTeacher = async (id: number) => {
    setVerifyingTeacherId(id);
    try {
      await api.post(`/guru/${id}/verify`);
      setPendingTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error verifying teacher:', err);
    } finally {
      setVerifyingTeacherId(null);
    }
  };

  const isSetupCompleted = sekolah?.setupCompleted || sekolah?.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Selamat Datang, {user?.nama?.split(' ')[0] || 'Admin Sekolah'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {sekolah?.nama_sekolah || 'Sekolah'} — Panel Pengelolaan Jadwal Pelajaran
          </p>
        </div>
      </div>

      {/* Setup Checklist if incomplete */}
      {!isSetupCompleted ? (
        <SetupChecklist sekolah={sekolah} stats={stats} />
      ) : (
        <>
          {/* Baris 1: 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Total Guru"
              value={stats.guru}
              icon={Users}
              href="/dashboard/guru"
              color="#1E40AF"
              bgColor="#EFF6FF"
              desc="Guru terdaftar"
              loading={loading}
            />
            <StatCard
              label="Total Kelas"
              value={stats.kelas}
              icon={GraduationCap}
              href="/dashboard/kelas"
              color="#059669"
              bgColor="#ECFDF5"
              desc="Kelas aktif"
              loading={loading}
            />
            <StatCard
              label="Total Mapel"
              value={stats.mapel}
              icon={BookOpen}
              href="/dashboard/mapel"
              color="#7C3AED"
              bgColor="#F5F3FF"
              desc="Mata pelajaran"
              loading={loading}
            />
            <StatCard
              label="Jadwal Aktif"
              value={stats.jadwal}
              icon={CalendarDays}
              href="/dashboard/jadwal"
              color="#D97706"
              bgColor="#FFFBEB"
              desc="Sesi ter-generate"
              loading={loading}
            />
          </div>

          {/* Baris 2: Jadwal Hari Ini (Kiri) + Perlu Perhatian (Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <JadwalHariIni isTeacherView={false} />
            </div>
            <div>
              <PerluPerhatian
                pendingTeachers={pendingTeachers}
                hasJadwal={stats.jadwal > 0}
                onVerifyTeacher={handleVerifyTeacher}
                verifyingTeacherId={verifyingTeacherId}
              />
            </div>
          </div>

          {/* Baris 3: 4 Quick Action Buttons Besar */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/jadwal/generate">
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-700 text-white rounded-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-blue-950 dark:text-blue-200">Buat Jadwal Otomatis</div>
                      <div className="text-xs text-blue-700 dark:text-blue-400">Generate via Wizard</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              <Link href="/setup">
                <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-md">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-950 dark:text-emerald-200">Import Data</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">Upload Excel</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              <Link href="/dashboard/guru">
                <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-600 text-white rounded-md">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-purple-950 dark:text-purple-200">Tambah Guru</div>
                      <div className="text-xs text-purple-700 dark:text-purple-400">Kelola Pengajar</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              <Link href="/dashboard/jadwal">
                <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-600 text-white rounded-md">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-amber-950 dark:text-amber-200">Bagikan Jadwal</div>
                      <div className="text-xs text-amber-700 dark:text-amber-400">Share Link / Cetak</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
