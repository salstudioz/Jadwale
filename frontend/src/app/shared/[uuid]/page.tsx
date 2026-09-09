'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../lib/axios';
import BrandLogo from '../../../components/BrandLogo';

export default function SharedSchedulePage() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const res = await api.get(`/share/${uuid}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat jadwal. Tautan mungkin salah atau telah kedaluwarsa.');
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchSharedData();
    }
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium animate-pulse">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass p-8 rounded-3xl max-w-md w-full text-center border border-red-500/20 bg-red-500/5">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-foreground/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Format the schedule data for Bento Grid view or simple table
  const { sekolah, jadwal } = data;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-border/50 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo href="/" size="md" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Jadwal Pelajaran</h1>
              <p className="text-foreground/60 text-sm">{sekolah.nama}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium text-sm flex items-center gap-2">
            <Calendar size={18} />
            Read Only
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-border/50">
          {jadwal.length === 0 ? (
            <div className="text-center py-12 text-foreground/50">
              <Calendar size={48} className="mx-auto mb-4 opacity-20" />
              <p>Belum ada jadwal yang tersedia untuk ditampilkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="p-4 font-semibold text-foreground/70">Hari</th>
                    <th className="p-4 font-semibold text-foreground/70">Jam Ke</th>
                    <th className="p-4 font-semibold text-foreground/70">Kelas</th>
                    <th className="p-4 font-semibold text-foreground/70">Mata Pelajaran</th>
                    <th className="p-4 font-semibold text-foreground/70">Guru</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwal.map((item: any) => {
                    const namaHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][item.hari - 1] || item.hari;
                    return (
                      <tr key={item.id} className="border-b border-border/10 hover:bg-foreground/5 transition-colors">
                        <td className="p-4 font-medium">{namaHari}</td>
                        <td className="p-4">{item.jam_ke}</td>
                        <td className="p-4">{item.kelas?.nama_kelas}</td>
                        <td className="p-4 font-medium text-primary">{item.mapel?.nama}</td>
                        <td className="p-4">{item.guru?.nama}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="text-center text-xs text-foreground/40 mt-8 pb-8">
          Powered by Jadwale &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
