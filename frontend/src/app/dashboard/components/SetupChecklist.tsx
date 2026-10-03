'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';

interface SetupChecklistProps {
  sekolah: any;
  stats: { guru: number; kelas: number; mapel: number };
}

export default function SetupChecklist({ sekolah, stats }: SetupChecklistProps) {
  const step = sekolah?.setupStep || 1;

  const steps = [
    { num: 1, label: 'Profil Sekolah', done: step > 1 || !!sekolah?.nama_sekolah },
    { num: 2, label: 'Import Data Guru', done: step > 2 || stats.guru >= 1 },
    { num: 3, label: 'Import Kelas & Mapel', done: step > 3 || (stats.kelas >= 1 && stats.mapel >= 3) },
    { num: 4, label: 'Siap Generate Jadwal', done: sekolah?.setupCompleted || false },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 sm:p-8 shadow-md border border-blue-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-800/80 border border-blue-700 rounded-full text-xs font-semibold text-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Panduan Awal Sekolah
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Setup Sekolah Belum Selesai ({completedCount}/4)</h2>
          <p className="text-sm text-blue-200 mt-1 max-w-xl">
            Selesaikan 4 langkah mudah untuk mengonfigurasi data sekolah Anda sebelum membuat jadwal pelajaran.
          </p>
        </div>

        <Link
          href="/setup"
          className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          Lanjutkan Setup
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`p-3.5 rounded-lg border flex items-center gap-3 transition-colors ${
              s.done
                ? 'bg-blue-800/60 border-blue-700 text-white'
                : 'bg-blue-950/40 border-blue-800/60 text-blue-300'
            }`}
          >
            {s.done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-blue-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
