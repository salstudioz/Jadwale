'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { CalendarDays, Clock, MapPin, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface ScheduleItem {
  id: number;
  hari: number;
  jam_ke: number;
  waktu_mulai?: string;
  waktu_selesai?: string;
  mapel: { nama: string };
  kelas: { nama_kelas: string };
  guru?: { nama: string };
}

interface JadwalHariIniProps {
  isTeacherView?: boolean;
}

export default function JadwalHariIni({ isTeacherView = false }: JadwalHariIniProps) {
  const [jadwals, setJadwals] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Map current day index to 1-6 (1: Senin, 2: Selasa, ... 6: Sabtu)
  const todayDayIndex = (() => {
    const d = new Date().getDay(); // 0 is Sun, 1 is Mon...
    return d === 0 ? 1 : d; // Default to Senin if Sunday
  })();

  const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        setLoading(true);
        const endpoint = isTeacherView ? '/jadwal/my-schedule' : '/jadwal';
        const res = await api.get(endpoint);
        const data: ScheduleItem[] = res.data || [];
        
        // Filter for today's day
        const todayData = data.filter((j) => j.hari === todayDayIndex);
        setJadwals(todayData.sort((a, b) => a.jam_ke - b.jam_ke));
      } catch (err) {
        console.error('Error fetching today schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySchedule();
  }, [isTeacherView, todayDayIndex]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          {isTeacherView ? 'Jadwal Mengajar Hari Ini' : 'Jadwal Hari Ini'} ({dayNames[todayDayIndex]})
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          {jadwals.length} Sesi
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-500">Memuat jadwal hari ini...</div>
      ) : jadwals.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {isTeacherView
              ? 'Tidak ada jadwal mengajar hari ini. Selamat istirahat.'
              : 'Belum ada jadwal pelajaran untuk hari ini.'}
          </p>
        </div>
      ) : isTeacherView ? (
        /* Teacher View Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {jadwals.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-blue-100 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/30 rounded-lg space-y-2 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  {item.waktu_mulai && item.waktu_selesai
                    ? `${item.waktu_mulai} – ${item.waktu_selesai}`
                    : `Jam ke ${item.jam_ke}`}
                </span>
                <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-[11px]">
                  Jam ke {item.jam_ke}
                </span>
              </div>

              <div className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                {item.mapel?.nama || 'Mata Pelajaran'}
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 font-medium">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                Kelas {item.kelas?.nama_kelas || '-'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Admin School Summary List */
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {jadwals.map((item) => (
            <div
              key={item.id}
              className="p-3 border border-gray-100 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 font-bold flex items-center justify-center text-xs">
                  J{item.jam_ke}
                </span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{item.mapel?.nama}</div>
                  <div className="text-gray-500 text-[11px]">
                    Guru: {item.guru?.nama || '-'}
                  </div>
                </div>
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded border border-blue-200 dark:border-blue-900">
                {item.kelas?.nama_kelas}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
