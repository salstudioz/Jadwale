'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Loader2, Home } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/axios';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import LanguageToggle from '../../../components/LanguageToggle';
import { ThemeToggle } from '../../../components/ThemeToggle';

export default function SharedJadwalPage() {
  const { uuid } = useParams();
  const router = useRouter();
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [jadwalData, setJadwalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const res = await api.get(`/jadwal/share/${uuid}`);
        setJadwalData(res.data);

        // Auto-select first class
        if (res.data.jadwal && res.data.jadwal.length > 0) {
          const classes = Array.from(new Set(res.data.jadwal.map((j: any) => j.kelas?.nama_kelas || 'Umum')));
          if (classes.length > 0) setSelectedClass(classes[0] as string);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Akses ditolak: ' + (err.response?.data?.message || 'Membutuhkan login'));
          if (err.response?.data?.message?.includes('login')) {
            setTimeout(() => router.push('/login'), 3000);
          }
        } else {
          setError('Gagal memuat jadwal. Link mungkin salah atau kadaluarsa.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [uuid, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border p-8 rounded-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-foreground/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!jadwalData) return null;

  const { config, routines, jadwal } = jadwalData;
  const dayNames = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday];
  const days = Array.from({ length: config.school_days }).map((_, i) => dayNames[i] || `Hari ${i+1}`);

  const groupedJadwal = jadwal.reduce((acc: any, curr: any) => {
    const kls = curr.kelas?.nama_kelas || 'Umum';
    if (!acc[kls]) acc[kls] = [];
    acc[kls].push(curr);
    return acc;
  }, {});
  const classesList = Object.keys(groupedJadwal).sort();

  let matrixRows: any[] = [];
  const addMinutes = (dateStr: string, minutes: number) => {
    const d = new Date(dateStr);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  };
  const formatTime = (d: Date) => d.toISOString().substr(11, 5);

  let currentTime = new Date(config.start_time);
  const maxJp = 10;
  let jpCounter = 1;

  const prepRoutine = routines.find((r: any) => r.time_before_jp === 1);
  if (prepRoutine) {
    const end = addMinutes(currentTime.toISOString(), prepRoutine.duration);
    matrixRows.push({ type: 'routine', name: prepRoutine.name, waktu: `${formatTime(currentTime)} - ${formatTime(end)}` });
    currentTime = end;
  }

  for (let i = 1; i <= maxJp; i++) {
    const end = addMinutes(currentTime.toISOString(), config.duration_per_jp);
    matrixRows.push({ type: 'jp', jam_ke: jpCounter, waktu: `${formatTime(currentTime)} - ${formatTime(end)}` });
    currentTime = end;
    jpCounter++;

    const afterRoutine = routines.find((r: any) => r.time_before_jp === (i + 1));
    if (afterRoutine) {
      const breakEnd = addMinutes(currentTime.toISOString(), afterRoutine.duration);
      matrixRows.push({ type: 'break', name: afterRoutine.name, waktu: `${formatTime(currentTime)} - ${formatTime(breakEnd)}` });
      currentTime = breakEnd;
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Top Bar */}
      <div className="bg-card border-b border-border shadow-sm p-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.publicScheduleTitle}</h1>
            <p className="text-xs text-foreground/70">{t.publicLinkBadge}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-foreground/5 font-bold text-xs transition-colors"
            >
              <Home size={14} className="text-primary" />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-bold border-b border-border pb-2 mb-3">{t.selectClass}</h3>
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {classesList.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`text-left px-3 py-2 rounded-lg font-bold text-sm transition-colors border ${
                      selectedClass === cls 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-background text-foreground/70 border-border'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 overflow-hidden">
              {!selectedClass ? (
                <div className="text-center p-12"><CalendarIcon className="w-12 h-12 mx-auto text-foreground/20 mb-4"/>{t.selectClassPrompt}</div>
              ) : (
                <div className="overflow-x-auto">
                  <h3 className="text-xl font-bold mb-4">{t.kelas}: {selectedClass}</h3>
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr>
                        <th className="bg-background border border-border p-2 text-xs font-bold text-center">{t.periodHeader}</th>
                        <th className="bg-background border border-border p-2 text-xs font-bold text-center">{t.timeHeader}</th>
                        {days.map(day => <th key={day} className="bg-background border border-border p-2 text-xs font-bold">{day}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixRows.map((row, idx) => {
                        if (row.type === 'routine' || row.type === 'break') {
                          return (
                            <tr key={`break-${idx}`} className="bg-background/80">
                              <td className="border border-border p-1.5 text-center font-bold text-xs text-foreground/50">-</td>
                              <td className="border border-border p-1.5 text-center font-bold text-[10px] text-foreground/50">{row.waktu}</td>
                              <td colSpan={days.length} className="border border-border p-1.5 text-center font-bold text-xs text-foreground/50 italic bg-foreground/5">
                                {row.name}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={`jp-${row.jam_ke}`}>
                            <td className="border border-border p-2 text-center font-bold text-xs">{row.jam_ke}</td>
                            <td className="border border-border p-2 text-center font-bold text-[10px]">{row.waktu}</td>
                            {days.map((day, dayIndex) => {
                              const dayNumber = dayIndex + 1;
                              if (row.jam_ke === 1 && dayNumber === 1 && config.has_monday_ceremony) {
                                return <td key={day} className="border border-border p-2 text-center text-xs font-bold italic text-foreground/70 bg-background/50">{t.ceremony}</td>;
                              }

                              const item = groupedJadwal[selectedClass].find((j: any) => j.hari === dayNumber && j.jam_ke === row.jam_ke);
                              return (
                                <td key={day} className="border border-border p-1.5 align-top">
                                  {item ? (
                                    <div className="p-2 border rounded" style={{ backgroundColor: `${item.mapel?.color}20`, borderColor: `${item.mapel?.color}50`}}>
                                      <div className="font-bold text-xs mb-1">{item.mapel?.nama}</div>
                                      <div className="text-[10px] text-foreground/70">{item.guru?.nama}</div>
                                    </div>
                                  ) : (
                                    <div className="p-2 text-center text-[10px] text-foreground/20">{t.emptySlot}</div>
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
      </div>
    </div>
  );
}
