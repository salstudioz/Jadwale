'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Loader2, Home, Printer, Share2, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/axios';

export default function SharedJadwalPage() {
  const { uuid } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClass = searchParams.get('kelas');

  const [jadwalData, setJadwalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        let res;
        try {
          res = await api.get(`/share/${uuid}`);
        } catch {
          res = await api.get(`/jadwal/share/${uuid}`);
        }
        
        setJadwalData(res.data);

        // Auto-select class
        if (res.data.jadwal && res.data.jadwal.length > 0) {
          const classes = Array.from(new Set(res.data.jadwal.map((j: any) => j.kelas?.nama_kelas || 'Umum')));
          if (queryClass && classes.includes(queryClass)) {
            setSelectedClass(queryClass);
          } else if (classes.length > 0) {
            setSelectedClass(classes[0] as string);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat jadwal. Tautan mungkin salah atau telah kedaluwarsa.');
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchSharedData();
    }
  }, [uuid, queryClass]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-blue-700">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-bold text-sm">Memuat Jadwal Pelajaran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-foreground">Akses Ditolak / Tautan Kadaluarsa</h2>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors w-full"
          >
            <Home size={16} />
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    );
  }

  if (!jadwalData) return null;

  const { sekolah, config = {}, routines = [], jadwal = [] } = jadwalData;
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const schoolDaysCount = config.school_days || 5;
  const days = Array.from({ length: schoolDaysCount }).map((_, i) => dayNames[i] || `Hari ${i+1}`);

  const groupedJadwal = (jadwal || []).reduce((acc: any, curr: any) => {
    const kls = curr.kelas?.kode_lengkap || curr.kelas?.nama_kelas || 'Umum';
    if (!acc[kls]) acc[kls] = [];
    acc[kls].push(curr);
    return acc;
  }, {});

  const classesList = Object.keys(groupedJadwal).sort();

  // Matrix construction
  let matrixRows: any[] = [];
  const addMinutes = (dateStr: string, minutes: number) => {
    const d = new Date(dateStr);
    d.setUTCMinutes(d.getUTCMinutes() + minutes);
    return d;
  };
  const formatTime = (d: Date) => {
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const rawStartTime = config.start_time || '1970-01-01T07:00:00.000Z';
  let currentTime = new Date(rawStartTime);
  const durationPerJp = config.duration_per_jp || 45;
  const maxJamInSchedule = jadwal && jadwal.length > 0 ? Math.max(...jadwal.map((j: any) => j.jam_ke || 0)) : 0;
  const maxJp = Math.max(6, Math.min(10, maxJamInSchedule || 8));
  let jpCounter = 1;

  const prepRoutine = (routines || []).find((r: any) => r.time_before_jp === 1);
  if (prepRoutine) {
    const end = addMinutes(currentTime.toISOString(), prepRoutine.duration);
    matrixRows.push({ type: 'routine', name: prepRoutine.name, waktu: `${formatTime(currentTime)} - ${formatTime(end)}` });
    currentTime = end;
  }

  for (let i = 1; i <= maxJp; i++) {
    const end = addMinutes(currentTime.toISOString(), durationPerJp);
    matrixRows.push({ type: 'jp', jam_ke: jpCounter, waktu: `${formatTime(currentTime)} - ${formatTime(end)}` });
    currentTime = end;
    jpCounter++;

    const afterRoutine = (routines || []).find((r: any) => r.time_before_jp === (i + 1));
    if (afterRoutine) {
      const breakEnd = addMinutes(currentTime.toISOString(), afterRoutine.duration);
      matrixRows.push({ type: 'break', name: afterRoutine.name, waktu: `${formatTime(currentTime)} - ${formatTime(breakEnd)}` });
      currentTime = breakEnd;
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleWAShare = () => {
    const url = window.location.href;
    const msg = `*Jadwal Pelajaran ${sekolah?.nama || 'Sekolah'}*\nLihat jadwal terbaru melalui tautan ini:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      
      {/* Top Header */}
      <header className="bg-card border-b border-border shadow-sm p-4 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                Jadwal Pelajaran — {sekolah?.nama || 'Sekolah'}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Mode Baca Publik (Aktif)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWAShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare size={14} />
              Bagikan WA
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              Cetak
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Home size={14} />
              Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Printable Header (Visible only when printing) */}
        <div className="hidden print:block text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">{sekolah?.nama || 'Jadwal Pelajaran'}</h1>
          <p className="text-sm">Jadwal Pelajaran Per Kelas</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Class Sidebar Selector */}
          <div className="w-full md:w-60 shrink-0 print:hidden">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-20">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Pilih Kelas:
              </h2>
              <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 max-h-[60vh] overflow-y-auto">
                {classesList.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`text-left px-3.5 py-2 rounded-lg font-bold text-xs shrink-0 transition-all border ${
                      selectedClass === cls 
                        ? 'bg-blue-700 text-white border-blue-700 shadow-sm' 
                        : 'bg-background hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    Kelas {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Table Container */}
          <div className="flex-1">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
              
              {!selectedClass ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium">Silakan pilih kelas untuk melihat jadwal.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-foreground">
                      Jadwal Kelas: <span className="text-blue-700">{selectedClass}</span>
                    </h2>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                      {groupedJadwal[selectedClass]?.length || 0} Jam Pelajaran
                    </span>
                  </div>

                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr>
                        <th className="bg-muted border border-border p-2.5 text-xs font-bold text-center w-16">JP</th>
                        <th className="bg-muted border border-border p-2.5 text-xs font-bold text-center w-28">Waktu</th>
                        {days.map(day => (
                          <th key={day} className="bg-muted border border-border p-2.5 text-xs font-bold text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixRows.map((row, idx) => {
                        if (row.type === 'routine' || row.type === 'break') {
                          return (
                            <tr key={`break-${idx}`} className="bg-muted/40">
                              <td className="border border-border p-2 text-center font-bold text-xs text-muted-foreground">-</td>
                              <td className="border border-border p-2 text-center font-bold text-[11px] text-muted-foreground">{row.waktu}</td>
                              <td colSpan={days.length} className="border border-border p-2 text-center font-bold text-xs text-muted-foreground italic">
                                {row.name}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={`jp-${row.jam_ke}`}>
                            <td className="border border-border p-2 text-center font-bold text-xs text-foreground bg-muted/20">
                              {row.jam_ke}
                            </td>
                            <td className="border border-border p-2 text-center font-bold text-[11px] text-muted-foreground bg-muted/10">
                              {row.waktu}
                            </td>
                            {days.map((day, dayIndex) => {
                              const dayNumber = dayIndex + 1;
                              if (row.jam_ke === 1 && dayNumber === 1 && config.has_monday_ceremony) {
                                return (
                                  <td key={day} className="border border-border p-2 text-center text-xs font-bold text-muted-foreground bg-muted/30">
                                    Upacara Bendera
                                  </td>
                                );
                              }

                              const item = (groupedJadwal[selectedClass] || []).find(
                                (j: any) => j.hari === dayNumber && j.jam_ke === row.jam_ke
                              );

                              return (
                                <td key={day} className="border border-border p-1.5 align-top">
                                  {item ? (
                                    <div 
                                      className="p-2 border rounded-lg text-left shadow-2xs"
                                      style={{ 
                                        backgroundColor: `${item.mapel?.color || '#3b82f6'}18`, 
                                        borderColor: `${item.mapel?.color || '#3b82f6'}50`
                                      }}
                                    >
                                      <div className="font-bold text-xs text-foreground leading-tight mb-1">
                                        {item.mapel?.nama}
                                      </div>
                                      <div className="text-[11px] font-bold text-muted-foreground">
                                        {item.guru?.nama}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2 text-center text-[10px] font-medium text-muted-foreground/30">
                                      -
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                </div>
              )}

            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground mt-8 print:hidden">
        Dibuat dengan <span className="font-bold text-blue-700">Jadwale</span> — Platform Penjadwalan Sekolah Indonesia
      </footer>

    </div>
  );
}
