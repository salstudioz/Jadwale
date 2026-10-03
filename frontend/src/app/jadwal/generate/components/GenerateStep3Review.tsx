'use client';

import React from 'react';
import { Sparkles, Calendar, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface GenerateStep3Props {
  periode: any;
  preferences: any;
  onStartGenerate: () => void;
  onBack: () => void;
}

export default function GenerateStep3Review({
  periode,
  preferences,
  onStartGenerate,
  onBack,
}: GenerateStep3Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langkah 3: Review Ringkasan & Mulai Generate</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Periksa kembali konfigurasi sebelum sistem menyusun jadwal secara otomatis.</p>
      </div>

      {/* Summary Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
              <td className="p-3 font-bold text-gray-700 dark:text-gray-300 w-1/3">Periode Jadwal</td>
              <td className="p-3 font-semibold text-blue-700 dark:text-blue-400">
                {periode?.nama || 'Jadwal Utama'} ({periode?.tahun_ajaran || '2026/2027'} - {periode?.semester || 'Gasal'})
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3 font-bold text-gray-700 dark:text-gray-300">Jam Operasional</td>
              <td className="p-3 text-gray-800 dark:text-gray-200">
                {preferences.start_time || '07:00'} – {preferences.end_time || '12:30'} ({preferences.duration_per_jp || 35} Menit / JP)
              </td>
            </tr>

            <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
              <td className="p-3 font-bold text-gray-700 dark:text-gray-300">Hari Aktif Sekolah</td>
              <td className="p-3 text-gray-800 dark:text-gray-200">
                {preferences.school_days || 5} Hari (Senin – {preferences.school_days === 6 ? 'Sabtu' : 'Jumat'})
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3 font-bold text-gray-700 dark:text-gray-300">Upacara Senin</td>
              <td className="p-3 text-gray-800 dark:text-gray-200">
                {preferences.has_monday_ceremony ? 'Aktif (Jam Ke-1 Diisi Upacara)' : 'Tidak Ada'}
              </td>
            </tr>

            <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
              <td className="p-3 font-bold text-gray-700 dark:text-gray-300">Kultum Keagamaan</td>
              <td className="p-3 text-gray-800 dark:text-gray-200">
                {preferences.kultum_day || 'Jumat'}
              </td>
            </tr>

            <tr>
              <td className="p-3 font-bold text-gray-700 dark:text-gray-300">Max Jam Mengajar / Guru</td>
              <td className="p-3 text-gray-800 dark:text-gray-200">
                {preferences.max_jp_guru || 24} JP / Minggu
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Confirmation Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-blue-700 shrink-0" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <span className="font-bold">Siap Menyusun Jadwal:</span> Algoritma otomatis CSP akan menyusun slot jadwal tanpa bentrok jam mengajar guru maupun ruang kelas.
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          type="button"
          onClick={onStartGenerate}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-md transition-colors flex items-center gap-2 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Mulai Generate Jadwal
        </button>
      </div>
    </div>
  );
}
