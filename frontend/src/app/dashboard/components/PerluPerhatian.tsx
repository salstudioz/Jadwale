'use client';

import React from 'react';
import { AlertTriangle, Users, Calendar, Check, AlertCircle } from 'lucide-react';

interface PerluPerhatianProps {
  pendingTeachers: any[];
  hasJadwal: boolean;
  onVerifyTeacher: (id: number) => void;
  verifyingTeacherId: number | null;
}

export default function PerluPerhatian({
  pendingTeachers = [],
  hasJadwal = true,
  onVerifyTeacher,
  verifyingTeacherId,
}: PerluPerhatianProps) {
  const items: { id: string; type: 'warning' | 'info' | 'danger'; text: string; component?: React.ReactNode }[] = [];

  if (pendingTeachers.length > 0) {
    items.push({
      id: 'pending-teachers',
      type: 'warning',
      text: `${pendingTeachers.length} Guru Menunggu Verifikasi Akun`,
      component: (
        <div className="mt-2 space-y-2 border-t border-amber-200 dark:border-amber-900 pt-2">
          {pendingTeachers.map((pt) => (
            <div key={pt.id} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{pt.nama} ({pt.email})</span>
              <button
                onClick={() => onVerifyTeacher(pt.id)}
                disabled={verifyingTeacherId === pt.id}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3 h-3" />
                {verifyingTeacherId === pt.id ? '...' : 'Setujui'}
              </button>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (!hasJadwal) {
    items.push({
      id: 'no-jadwal',
      type: 'danger',
      text: 'Jadwal pelajaran belum dibuat untuk periode aktif ini.',
    });
  }

  // General reminder item
  items.push({
    id: 'semester-expiry',
    type: 'info',
    text: 'Periode Semester Gasal 2026/2027 berjalan aktif.',
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Perlu Perhatian
        </h3>
        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold">
          {items.length} Notifikasi
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border text-xs ${
              item.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                : item.type === 'danger'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{item.text}</span>
            </div>
            {item.component}
          </div>
        ))}
      </div>
    </div>
  );
}
