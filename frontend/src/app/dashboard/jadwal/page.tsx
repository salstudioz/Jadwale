'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, XCircle, Loader2, Download, Printer, Calendar as CalendarIcon, Filter, Share2, AlertTriangle, Users, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import ShareExportModal from '../../../components/ShareExportModal';

export default function JadwalPage() {
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [activeTab, setActiveTab] = useState<'generator' | 'viewer'>('generator');
  
  // Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Siap untuk memulai');
  const [result, setResult] = useState<'success' | 'failed' | null>(null);
  const [isRelaxed, setIsRelaxed] = useState(false);
  
  // Viewer State
  const [jadwalData, setJadwalData] = useState<any>(null); // holds { config, routines, jadwal, bebanGuru, periodes, current_periode_id }
  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Multi-Schedule Periode State
  const [periodes, setPeriodes] = useState<any[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [showPeriodeModal, setShowPeriodeModal] = useState(false);
  const [newPeriodeForm, setNewPeriodeForm] = useState({ nama: '', tahun_ajaran: '2026/2027', semester: 'Ganjil', duplicate_from_id: '' });
  const [creatingPeriode, setCreatingPeriode] = useState(false);
  
  // Share & Export State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareAccess, setShareAccess] = useState('read');
  const [shareDays, setShareDays] = useState(30);
  const [shareLink, setShareLink] = useState('');
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'pdf'|'excel'>('pdf');
  const [exportTemplate, setExportTemplate] = useState(1);
  
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    let socket: Socket;
    if (user?.id_sekolah && activeTab === 'generator') {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/api\/?$/, '') : 'http://localhost:3000';
      socket = io(socketUrl);
      
      socket.on('connect', () => {
        socket.emit('joinRoom', { id_sekolah: user.id_sekolah });
      });

      socket.on('progress', (data: { progress: number, message: string }) => {
        setProgress(data.progress);
        setStatusText(data.message);
      });

      socket.on('result', (data: { status: 'success' | 'failed', message: string, isRelaxed?: boolean }) => {
        setResult(data.status);
        setStatusText(data.message);
        setIsRelaxed(!!data.isRelaxed);
        setIsGenerating(false);
        if (data.status === 'success') {
          fetchJadwal();
        }
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, activeTab]);

  useEffect(() => {
    fetchJadwal(selectedPeriodeId || undefined);
  }, [activeTab, selectedPeriodeId]);

  const fetchJadwal = async (periodeId?: number) => {
    setLoadingJadwal(true);
    try {
      const query = periodeId ? `?id_periode=${periodeId}` : '';
      const res = await api.get(`/jadwal${query}`);
      setJadwalData(res.data);
      
      if (res.data.periodes) {
        setPeriodes(res.data.periodes);
      }
      if (res.data.current_periode_id && !selectedPeriodeId) {
        setSelectedPeriodeId(res.data.current_periode_id);
      }
      
      // Auto-select first class if available
      const classes = Array.from(new Set((res.data.jadwal || []).map((j: any) => j.kelas?.nama_kelas || 'Umum')));
      if (classes.length > 0 && !selectedClass) {
        setSelectedClass(classes[0] as string);
      }
    } catch (err) {
      console.error('Failed to fetch jadwal', err);
    } finally {
      setLoadingJadwal(false);
    }
  };

  const handleCreatePeriode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPeriode(true);
    try {
      const res = await api.post('/jadwal/periode', {
        nama: newPeriodeForm.nama,
        tahun_ajaran: newPeriodeForm.tahun_ajaran,
        semester: newPeriodeForm.semester,
        duplicate_from_id: newPeriodeForm.duplicate_from_id ? Number(newPeriodeForm.duplicate_from_id) : undefined,
      });

      setShowPeriodeModal(false);
      setNewPeriodeForm({ nama: '', tahun_ajaran: '2026/2027', semester: 'Ganjil', duplicate_from_id: '' });
      setSelectedPeriodeId(res.data.id);
      alert(`Periode "${res.data.nama}" berhasil dibuat!`);
    } catch (err) {
      alert('Gagal membuat periode jadwal baru');
    } finally {
      setCreatingPeriode(false);
    }
  };

  const handleSetActivePeriode = async () => {
    if (!selectedPeriodeId) return;
    try {
      await api.post(`/jadwal/periode/${selectedPeriodeId}/activate`);
      alert('Periode jadwal ini telah ditetapkan sebagai Jadwal Utama (Aktif) Sekolah!');
      fetchJadwal(selectedPeriodeId);
    } catch (err) {
      alert('Gagal mengaktifkan periode jadwal');
    }
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setIsRelaxed(false);
    setStatusText('Mengirim permintaan...');
    
    try {
      await api.post('/jadwal/generate');
    } catch (error) {
      setIsGenerating(false);
      setResult('failed');
      setStatusText('Gagal menghubungi server.');
    }
  };

  const generateShareLink = async () => {
    try {
      const res = await api.post('/share', { permission: shareAccess, days: shareDays });
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      setShareLink(`${origin}/share/${res.data.uuid}`);
    } catch (err) {
      alert('Gagal membuat link share');
    }
  };

  const handleExport = async () => {
    if (!jadwalData || !jadwalData.jadwal.length) return alert('Tidak ada data jadwal');
    try {
      const response = await api.get(`/export/${exportType}?template=${exportTemplate}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Jadwal_Pelajaran.${exportType === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportModal(false);
    } catch (err) {
      alert(`Gagal mengunduh ${exportType.toUpperCase()}`);
    }
  };

  // Build the time matrix
  let matrixRows: any[] = [];
  let days: string[] = [];
  let groupedJadwal: any = {};
  let classesList: string[] = [];

  if (jadwalData && jadwalData.config) {
    const { config, routines, jadwal } = jadwalData;
    
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    days = Array.from({ length: config.school_days }).map((_, i) => dayNames[i]);
    
    groupedJadwal = jadwal.reduce((acc: any, curr: any) => {
      const kls = curr.kelas?.kode_lengkap || curr.kelas?.nama_kelas || 'Umum';
      if (!acc[kls]) acc[kls] = [];
      acc[kls].push(curr);
      return acc;
    }, {});
    classesList = Object.keys(groupedJadwal).sort();

    // Helper to format time — always work in UTC since start_time is stored as 1970-01-01T{HH:MM}:00Z
    const addMinutes = (dateStr: string, minutes: number) => {
      const d = new Date(dateStr);
      d.setUTCMinutes(d.getUTCMinutes() + minutes); // use UTC to avoid DST/timezone drift
      return d;
    };
    const formatTime = (d: Date) => {
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    // Build timeline — fallback to 07:00 UTC if start_time is missing
    const rawStartTime = config.start_time || '1970-01-01T07:00:00.000Z';
    let currentTime = new Date(rawStartTime);
    const maxJamInSchedule = jadwal && jadwal.length > 0 ? Math.max(...jadwal.map((j: any) => j.jam_ke || 0)) : 0;
    const maxJp = Math.max(6, Math.min(10, maxJamInSchedule || 8));
    let jpCounter = 1;

    // Routine before school
    const prepRoutine = routines.find((r: any) => r.time_before_jp === 1);
    if (prepRoutine) {
      const end = addMinutes(currentTime.toISOString(), prepRoutine.duration);
      matrixRows.push({
        type: 'routine',
        name: prepRoutine.name,
        waktu: `${formatTime(currentTime)} - ${formatTime(end)}`
      });
      currentTime = end;
    }

    for (let i = 1; i <= maxJp; i++) {
      const end = addMinutes(currentTime.toISOString(), config.duration_per_jp);
      matrixRows.push({
        type: 'jp',
        jam_ke: jpCounter,
        waktu: `${formatTime(currentTime)} - ${formatTime(end)}`
      });
      currentTime = end;
      jpCounter++;

      // Check if there is a routine/break AFTER this JP
      const afterRoutine = routines.find((r: any) => r.time_before_jp === (i + 1));
      if (afterRoutine) {
        const breakEnd = addMinutes(currentTime.toISOString(), afterRoutine.duration);
        matrixRows.push({
          type: 'break',
          name: afterRoutine.name,
          waktu: `${formatTime(currentTime)} - ${formatTime(breakEnd)}`
        });
        currentTime = breakEnd;
      }
    }
  }

  // Format Code mapel/guru
  const getKodeMapel = (nama: string) => {
    const common: Record<string, string> = {
      'Matematika': 'MTK', 'Bahasa Indonesia': 'BHS Indo', 'Ilmu Pengetahuan Alam (IPA)': 'IPA',
      'Ilmu Pengetahuan Alam': 'IPA', 'Ilmu Pengetahuan Sosial (IPS)': 'IPS', 'Ilmu Pengetahuan Sosial': 'IPS',
      'Pendidikan Agama Islam (PAI)': 'PAI', 'Pendidikan Pancasila (PKn)': 'PKn', 'PENJASKES (Olahraga)': 'PJOK',
      'SBdP (Seni Budaya)': 'SBdP', 'Bahasa Inggris': 'BHS Ing'
    };
    return common[nama] || nama.substring(0, 5).toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="page-title">{t.jadwal}</h1>
        <p className="page-subtitle">{t.actionGenerateDesc}</p>
      </div>

      {/* Multi-Schedule Periode Selector Bar */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-primary shrink-0" size={20} />
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Versi / Periode Jadwal:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedPeriodeId || ''}
                onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
                className="font-bold text-sm bg-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {periodes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} {p.is_active ? '(Jadwal Utama Aktif)' : ''}
                  </option>
                ))}
              </select>

              {periodes.find(p => p.id === selectedPeriodeId)?.is_active ? (
                <span className="badge badge-green text-xs shrink-0">Aktif</span>
              ) : (
                <button
                  onClick={handleSetActivePeriode}
                  className="btn btn-outline text-xs py-1 px-2.5 hover:bg-primary hover:text-white shrink-0"
                >
                  Set Jadi Jadwal Utama
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Button: Buat Periode Jadwal Baru */}
        {user?.is_admin && (
          <button
            onClick={() => setShowPeriodeModal(true)}
            className="btn btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1.5 shrink-0"
          >
            + Buat Periode Jadwal Baru
          </button>
        )}
      </div>

      {/* Modal Buat Periode Jadwal Baru */}
      {showPeriodeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <CalendarIcon className="text-primary" size={18} /> Buat Periode Jadwal Baru
              </h3>
              <button onClick={() => setShowPeriodeModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePeriode} className="space-y-3">
              <div>
                <label className="field-label">Nama Periode Jadwal</label>
                <input
                  type="text" required
                  value={newPeriodeForm.nama}
                  onChange={(e) => setNewPeriodeForm({ ...newPeriodeForm, nama: e.target.value })}
                  placeholder="Nama Jadwal / Periode"
                  className="field-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Tahun Ajaran</label>
                  <input
                    type="text" required
                    value={newPeriodeForm.tahun_ajaran}
                    onChange={(e) => setNewPeriodeForm({ ...newPeriodeForm, tahun_ajaran: e.target.value })}
                    placeholder="Tahun Ajaran"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="field-label">Semester</label>
                  <select
                    value={newPeriodeForm.semester}
                    onChange={(e) => setNewPeriodeForm({ ...newPeriodeForm, semester: e.target.value })}
                    className="field-input bg-card"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label">Duplikasi Data dari Periode Sebelumnya? (Opsional)</label>
                <select
                  value={newPeriodeForm.duplicate_from_id}
                  onChange={(e) => setNewPeriodeForm({ ...newPeriodeForm, duplicate_from_id: e.target.value })}
                  className="field-input bg-card"
                >
                  <option value="">-- Kosongkan (Buat Jadwal Baru dari Awal) --</option>
                  {periodes.map(p => (
                    <option key={p.id} value={p.id}>Duplikasi dari: {p.nama}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowPeriodeModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" disabled={creatingPeriode} className="btn btn-primary">
                  {creatingPeriode ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Periode Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Switcher — full width on mobile */}
      <div style={{ background: 'var(--muted)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 4, display: 'flex' }}>

        <button
          onClick={() => setActiveTab('generator')}
          style={{
            flex: 1, padding: '0.625rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.15s',
            background: activeTab === 'generator' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'generator' ? 'white' : 'var(--muted-foreground)',
          }}
        >
          {t.autoGeneratorTab}
        </button>
        <button
          onClick={() => setActiveTab('viewer')}
          style={{
            flex: 1, padding: '0.625rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.15s',
            background: activeTab === 'viewer' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'viewer' ? 'white' : 'var(--muted-foreground)',
          }}
        >
          {t.viewScheduleTab}
        </button>
      </div>

      {activeTab === 'generator' ? (
        <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Mesin Penjadwalan CSP</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', maxWidth: 480, margin: '0 auto 1.5rem' }}>
            Sistem mencari kombinasi jadwal terbaik tanpa bentrok berdasarkan data Guru, Kelas, dan Mata Pelajaran.
          </p>

          <div style={{ background: 'var(--muted)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '2rem 1rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isGenerating && (
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: 'var(--primary)', opacity: 0.12, transition: 'width 0.3s', width: `${progress}%` }} />
            )}
            {!isGenerating && !result ? (
              <button onClick={handleGenerate} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem', position: 'relative', zIndex: 1 }}>
                <Play fill="currentColor" size={20} /> Buatkan Jadwal Sekarang
              </button>
            ) : isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>{progress}%</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{statusText}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                {result === 'success'
                  ? <CheckCircle2 size={56} style={{ color: '#16A34A' }} />
                  : <XCircle size={56} style={{ color: '#DC2626' }} />}
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>{result === 'success' ? 'Berhasil!' : 'Gagal'}</div>
                  <div style={{ fontSize: '0.875rem', color: isRelaxed ? '#EA580C' : 'var(--muted-foreground)', maxWidth: 320 }}>{statusText}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={() => setResult(null)} className="btn btn-secondary">Tutup</button>
                  {result === 'success' && (
                    <button onClick={() => setActiveTab('viewer')} className="btn btn-primary">Lihat Jadwal</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action bar: mobile = 2 rows, desktop = 1 row */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '0.875rem 1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {/* Class selector — dropdown on mobile, list on desktop */}
              {classesList.length > 0 && (
                <select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="field-input md:hidden"
                  style={{ flex: 1, minWidth: 120 }}
                >
                  <option value="">Pilih Kelas...</option>
                  {classesList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {/* View toggle */}
              <div style={{ display: 'flex', background: 'var(--muted)', borderRadius: 8, padding: 2, gap: 2 }}>
                <button onClick={() => setShowCode(false)} style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', background: !showCode ? 'var(--card)' : 'transparent', color: !showCode ? 'var(--primary)' : 'var(--muted-foreground)' }}>Nama</button>
                <button onClick={() => setShowCode(true)} style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', background: showCode ? 'var(--card)' : 'transparent', color: showCode ? 'var(--primary)' : 'var(--muted-foreground)' }}>Kode</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button 
                  onClick={() => setShowShareModal(true)} 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
                >
                  <Share2 size={14} /> 
                  <span>Bagikan & Ekspor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alert Relaxation */}
          {isRelaxed && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex gap-3 font-medium text-sm">
              <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              <p>Beberapa aturan prioritas terpaksa dilonggarkan karena keterbatasan jumlah guru dan waktu. Jadwal tetap berhasil dibuat tanpa bentrok.</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Sidebar: Class List — hidden on mobile (use dropdown above instead) */}
            <div className="hidden lg:flex w-48 xl:w-56 flex-col gap-2">
              <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '1rem', height: '100%' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Filter size={14} /> Pilih Kelas
                </div>
                {loadingJadwal ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary)' }} /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                    {classesList.map((cls) => (
                      <button key={cls} onClick={() => setSelectedClass(cls)}
                        style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.12s', background: selectedClass === cls ? 'var(--primary)' : 'transparent', color: selectedClass === cls ? 'white' : 'var(--muted-foreground)' }}>
                        {cls}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Area: Matrix Schedule */}
            <div className="w-full lg:w-4/5 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 min-h-[400px] overflow-hidden" ref={tableRef}>
                {loadingJadwal ? (
                  <div className="h-full flex items-center justify-center min-h-[300px]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  </div>
                ) : !selectedClass || !groupedJadwal[selectedClass] ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
                    <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center mb-4">
                      <CalendarIcon className="w-10 h-10 text-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">Pilih Kelas</h3>
                    <p className="text-foreground/60">Silakan pilih kelas pada daftar di samping.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground border-b border-border pb-3">
                      Jadwal: {selectedClass}
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[900px] table-fixed">
                        <thead>
                          <tr>
                            <th className="bg-background border border-border p-2 text-xs font-bold text-foreground w-12 text-center">Jam</th>
                            <th className="bg-background border border-border p-2 text-xs font-bold text-foreground w-24 text-center">Waktu</th>
                            {days.map(day => (
                              <th key={day} className="bg-background border border-border p-2 text-xs font-bold text-foreground uppercase">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matrixRows.map((row, idx) => {
                            if (row.type === 'routine' || row.type === 'break') {
                              return (
                                <tr key={`break-${idx}`} className={row.type === 'routine' ? 'bg-amber-100/90 dark:bg-amber-950/60' : 'bg-blue-100/90 dark:bg-blue-950/60'}>
                                  <td className="border border-border p-1.5 text-center font-bold text-foreground/70 text-xs">-</td>
                                  <td className="border border-border p-1.5 text-center font-bold text-foreground/80 text-[10px]">{row.waktu}</td>
                                  <td colSpan={days.length} className={`border p-1.5 text-center font-bold text-xs ${
                                    row.type === 'routine'
                                      ? 'text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                                      : 'text-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                                  }`}>
                                    {row.name}
                                  </td>
                                </tr>
                              );
                            }

                            const jamKe = row.jam_ke;
                            return (
                              <tr key={`jp-${jamKe}`}>
                                <td className="bg-background/30 border border-border p-2 text-center font-bold text-foreground/70 text-xs">
                                  {jamKe}
                                </td>
                                <td className="bg-background/30 border border-border p-2 text-center font-bold text-foreground/70 text-[10px] whitespace-nowrap">
                                  {row.waktu}
                                </td>
                                {days.map((day, dayIndex) => {
                                  const dayNumber = dayIndex + 1;
                                  
                                  // Upacara Check
                                  if (jamKe === 1 && dayNumber === 1 && jadwalData.config.has_monday_ceremony) {
                                    return (
                                      <td key={day} className="border border-blue-300 dark:border-blue-800 p-2 align-middle text-center bg-blue-100/90 dark:bg-blue-950/60">
                                        <span className="font-bold text-xs text-blue-950 dark:text-blue-200">{lang === 'en' ? 'Flag Ceremony' : 'Upacara Bendera'}</span>
                                      </td>
                                    );
                                  }

                                  const scheduleItem = groupedJadwal[selectedClass].find((j: any) => j.hari === dayNumber && j.jam_ke === jamKe);
                                  
                                  return (
                                    <td key={day} className="border border-border p-1.5 align-top">
                                      {scheduleItem ? (
                                        <div 
                                          className="h-full w-full p-2 rounded flex flex-col justify-between border"
                                          style={{ 
                                            backgroundColor: `${scheduleItem.mapel?.color}20` || '#f1f5f9',
                                            borderColor: `${scheduleItem.mapel?.color}50` || '#cbd5e1'
                                          }}
                                        >
                                          <span className="font-bold text-xs text-foreground mb-1 block leading-tight">
                                            {showCode ? getKodeMapel(scheduleItem.mapel?.nama) : (scheduleItem.mapel?.nama || '-')}
                                          </span>
                                          <span className="text-[10px] text-foreground/70 font-bold">
                                            {showCode ? `GR-${scheduleItem.guru?.id}` : (scheduleItem.guru?.nama || '-')}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="h-full w-full p-2 flex items-center justify-center text-foreground/20 text-[10px] font-medium">
                                          Kosong
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
                  </div>
                )}
              </div>

              {/* Rekap Beban Mengajar Guru */}
              {jadwalData?.bebanGuru && jadwalData.bebanGuru.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">Rekap Beban Mengajar Guru</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-background text-foreground">
                        <tr>
                          <th className="p-3 border-b border-border font-bold">Nama Guru</th>
                          <th className="p-3 border-b border-border font-bold w-32 text-center">Total JP</th>
                          <th className="p-3 border-b border-border font-bold">Rincian Kelas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jadwalData.bebanGuru.map((guru: any, idx: number) => (
                          <tr key={guru.id} className="border-b border-border/50 hover:bg-foreground/5">
                            <td className="p-3 font-bold text-foreground">
                              {idx + 1}. {showCode ? `GR-${guru.id}` : guru.nama}
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded font-bold text-xs">
                                {guru.total_jp} JP
                              </span>
                            </td>
                            <td className="p-3 text-foreground/70 font-medium text-xs">
                              {guru.rincian_kelas || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Share & Export Modal */}
      <ShareExportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        namaSekolah={jadwalData?.config?.sekolah?.nama || user?.sekolah?.nama_sekolah || 'Sekolah'}
        selectedPeriodeId={selectedPeriodeId}
        kelasList={classesList}
        currentClass={selectedClass}
      />

    </div>
  );
}
