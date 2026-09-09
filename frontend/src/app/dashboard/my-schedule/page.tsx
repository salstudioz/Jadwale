'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, School, BookOpen, Loader2, Share2, CheckCircle2, User } from 'lucide-react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/useAuthStore';

export default function MySchedulePage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jadwal/my-schedule');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch teacher schedule', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScheduleLink = async () => {
    try {
      const res = await api.post('/share', { permission: 'read' });
      const url = `${window.location.origin}/share/${res.data.uuid}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert('Gagal menyalin link');
    }
  };

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="card p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <User size={14} /> Tenaga Pendidik: {user?.nama}
            </div>
            <h1 className="text-2xl font-extrabold">Jadwal Mengajar Saya</h1>
            <p className="text-blue-100 text-xs mt-1">
              {data?.periode ? `Periode: ${data.periode.nama}` : 'Jadwal Mingguan Mengajar Sekolah'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <span className="text-2xl font-extrabold block leading-none">{data?.total_jp || 0}</span>
              <span className="text-[10px] text-blue-100 font-bold uppercase">Total Jam Pelajaran (JP)</span>
            </div>
            
            <button
              onClick={handleCopyScheduleLink}
              className="btn bg-white text-blue-700 hover:bg-blue-50 border-none font-bold text-xs px-3.5 py-2.5 inline-flex items-center gap-2 shrink-0"
            >
              {copied ? <><CheckCircle2 size={16} /> Link Tersalin</> : <><Share2 size={16} /> Share Jadwal</>}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin mx-auto mb-2 text-primary" />
          Memuat jadwal mengajar...
        </div>
      ) : !data?.jadwals || data.jadwals.length === 0 ? (
        <div className="card p-12 text-center text-muted-foreground space-y-2">
          <CalendarDays size={40} className="mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-bold text-base text-foreground">Belum Ada Jadwal Mengajar</h3>
          <p className="text-xs max-w-sm mx-auto">
            Jadwal mengajar untuk akun Anda belum di-generate oleh Admin Sekolah atau belum ada alokasi mengajar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((dayName, dayIdx) => {
            const dayNum = dayIdx + 1;
            const dayJadwals = data.jadwals.filter((j: any) => j.hari === dayNum);

            return (
              <div key={dayName} className="card p-4 space-y-3 bg-card border border-border rounded-xl">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CalendarDays size={16} className="text-primary" /> {dayName}
                  </h3>
                  <span className="badge badge-gray text-[11px]">{dayJadwals.length} Jam</span>
                </div>

                {dayJadwals.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">Tidak ada jam mengajar</p>
                ) : (
                  <div className="space-y-2">
                    {dayJadwals.map((j: any) => (
                      <div
                        key={j.id}
                        className="p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          JP {j.jam_ke}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">{j.mapel?.nama || 'Mata Pelajaran'}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <span className="inline-flex items-center gap-1 font-semibold text-primary">
                              <School size={12} /> Kelas {j.kelas?.nama_kelas}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
