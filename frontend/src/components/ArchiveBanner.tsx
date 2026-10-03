'use client';

import React from 'react';
import { usePeriodeStore } from '../store/usePeriodeStore';
import { AlertTriangle, Lock } from 'lucide-react';

export default function ArchiveBanner() {
  const { selectedPeriode } = usePeriodeStore();

  if (!selectedPeriode || selectedPeriode.is_active) {
    return null;
  }

  return (
    <div className="w-full bg-amber-500 text-amber-950 px-4 py-2.5 shadow-sm text-xs font-semibold flex items-center justify-between z-20 border-b border-amber-600">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-950" />
        <span>
          Anda sedang melihat <strong>Periode Arsip: {selectedPeriode.nama}</strong>. Data jadwal dan master data pada periode ini bersifat hanya baca (read-only) dan tidak dapat diubah.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 bg-amber-600/30 px-2 py-1 rounded text-[11px] font-bold shrink-0">
        <Lock className="w-3 h-3" />
        Read-Only Mode
      </div>
    </div>
  );
}
