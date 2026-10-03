'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/axios';
import { CheckCircle2, AlertTriangle, RefreshCw, X, Save, CalendarDays, ArrowLeft } from 'lucide-react';

interface GenerateHasilProps {
  previewResult: any;
  periode: any;
  onRegenerate: () => void;
}

export default function GenerateHasilView({
  previewResult,
  periode,
  onRegenerate,
}: GenerateHasilProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmRegen, setShowConfirmRegen] = useState(false);

  const jadwals: any[] = previewResult?.jadwal || [];
  const totalJadwal = previewResult?.totalJadwal || jadwals.length;
  const conflicts = previewResult?.conflicts || 0;
  const emptySlots = previewResult?.emptySlots || 0;

  const handleCommit = async () => {
    setSubmitting(true);
    try {
      await api.post('/jadwal/generate/commit', { periodeId: periode?.id });
      router.push('/dashboard/jadwal');
    } catch (err) {
      console.error('Error committing schedule:', err);
      router.push('/dashboard/jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  // Group schedule by class
  const classNames = Array.from(new Set(jadwals.map((j) => j.kelas?.nama_kelas))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Generate Jadwal Selesai
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Review Hasil Penjadwalan</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Periode: {periode?.nama || 'Jadwal Utama'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/jadwal')}
            className="px-3.5 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-md flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Batal
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmRegen(true)}
            className="px-3.5 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-md flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Ulang
          </button>

          <button
            type="button"
            disabled={submitting || conflicts > 0}
            onClick={handleCommit}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Schedule Grid View */}
        <div className="lg:col-span-3 space-y-4">
          {classNames.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-xs text-gray-500">
              Belum ada hasil susunan jadwal.
            </div>
          ) : (
            classNames.slice(0, 4).map((cName) => {
              const classJadwals = jadwals.filter((j) => j.kelas?.nama_kelas === cName);
              return (
                <div key={cName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-700" />
                    Kelas {cName}
                  </h4>

                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((dayName, dIdx) => {
                      const dayNum = dIdx + 1;
                      const dayItems = classJadwals.filter((j) => j.hari === dayNum);

                      return (
                        <div key={dayName} className="p-2 border border-gray-100 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900/50">
                          <div className="font-bold text-[11px] text-gray-700 dark:text-gray-300 border-b pb-1 mb-1.5 text-center">
                            {dayName}
                          </div>
                          <div className="space-y-1">
                            {dayItems.length === 0 ? (
                              <div className="text-[10px] text-gray-400 text-center py-2">-</div>
                            ) : (
                              dayItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[11px] font-medium"
                                >
                                  <div className="font-bold text-blue-900 dark:text-blue-300 line-clamp-1">{item.mapel?.nama}</div>
                                  <div className="text-[10px] text-gray-500 line-clamp-1">{item.guru?.nama}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Summary Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b pb-2">
              Ringkasan Generasi
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-md">
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">Berhasil Disusun</div>
                <div className="text-xl font-extrabold text-green-900 dark:text-green-200">{totalJadwal} Sesi</div>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md">
                <div className="text-xs text-red-700 dark:text-red-300 font-medium">Konflik Jam</div>
                <div className="text-xl font-extrabold text-red-900 dark:text-red-200">{conflicts} Bentrok</div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-md">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Slot Kosong</div>
                <div className="text-xl font-extrabold text-blue-900 dark:text-blue-200">{emptySlots} Jam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Regenerate */}
      {showConfirmRegen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl border">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-bold text-base text-gray-900 dark:text-white">Konfirmasi Generate Ulang</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Hasil susunan draft jadwal saat ini akan diganti dengan proses generate ulang yang baru. Apakah Anda yakin?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmRegen(false)}
                className="px-3 py-1.5 border rounded text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => { setShowConfirmRegen(false); onRegenerate(); }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded"
              >
                Ya, Generate Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
