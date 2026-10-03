'use client';

import React, { useState } from 'react';
import { Clock, Calendar, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

interface GenerateStep2Props {
  preferences: any;
  onChangePreferences: (prefs: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GenerateStep2Preferensi({
  preferences,
  onChangePreferences,
  onNext,
  onBack,
}: GenerateStep2Props) {
  const [startTime, setStartTime] = useState(preferences.start_time || '07:00');
  const [endTime, setEndTime] = useState(preferences.end_time || '12:30');
  const [durationJp, setDurationJp] = useState(preferences.duration_per_jp || 35);
  const [schoolDays, setSchoolDays] = useState(preferences.school_days || 5);
  const [hasMondayCeremony, setHasMondayCeremony] = useState(preferences.has_monday_ceremony ?? true);
  const [kultumDay, setKultumDay] = useState(preferences.kultum_day || 'Jumat');
  const [maxJpGuru, setMaxJpGuru] = useState(preferences.max_jp_guru || 24);

  const handleNext = () => {
    const updated = {
      start_time: startTime,
      end_time: endTime,
      duration_per_jp: Number(durationJp),
      school_days: Number(schoolDays),
      has_monday_ceremony: hasMondayCeremony,
      kultum_day: kultumDay,
      max_jp_guru: Number(maxJpGuru),
    };
    onChangePreferences(updated);
    onNext();
  };

  const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langkah 2: Atur Preferensi Penjadwalan</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Sesuaikan jam operasional sekolah, hari khusus, dan batasan pengajar.</p>
      </div>

      {/* Section 1: Jam Operasional */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40 space-y-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-700" />
          Jam Operasional Sekolah
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Jam Mulai</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Jam Selesai</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Durasi per JP (menit)</label>
            <input
              type="number"
              min={25}
              max={60}
              value={durationJp}
              onChange={(e) => setDurationJp(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2">Hari Aktif Sekolah</label>
          <div className="flex gap-2">
            {[5, 6].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setSchoolDays(days)}
                className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
                  schoolDays === days
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                }`}
              >
                {days} Hari ({days === 5 ? 'Senin – Jumat' : 'Senin – Sabtu'})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Hari Khusus & Rutinitas */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40 space-y-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-700" />
          Hari Khusus & Kegiatan Rutin
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={hasMondayCeremony}
              onChange={(e) => setHasMondayCeremony(e.target.checked)}
              className="rounded text-blue-700 focus:ring-blue-600 w-4 h-4"
            />
            Upacara Bendera Hari Senin (Jam Ke-1 Kosong)
          </label>

          <div>
            <label className="block text-xs font-medium mb-1">Hari Kultum / Keagamaan</label>
            <select
              value={kultumDay}
              onChange={(e) => setKultumDay(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            >
              <option value="Tidak Ada">Tidak Ada</option>
              {daysList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Batasan Guru */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40 space-y-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-700" />
          Batasan Mengajar Guru
        </h3>

        <div>
          <label className="block text-xs font-medium mb-1">Maksimal Jam Mengajar per Minggu per Guru</label>
          <input
            type="number"
            min={12}
            max={40}
            value={maxJpGuru}
            onChange={(e) => setMaxJpGuru(Number(e.target.value))}
            className="w-full sm:w-1/2 px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          />
          <p className="text-[11px] text-gray-500 mt-1">Sistem akan memperingatkan jika ada guru dengan beban melebihi batas ini.</p>
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
          onClick={handleNext}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 shadow-sm"
        >
          Lanjut Ke Review & Jalankan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
