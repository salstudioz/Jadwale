'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle, AlertCircle, Loader2, Clock, School, CalendarDays, Sparkles, Coffee } from 'lucide-react';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import api from '../../../lib/axios';

export default function SekolahPage() {
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    nama_sekolah: '',
    npsn: '',
    alamat: '',
    is_parallel: false,
    class_naming: 'alphabet',
    school_days: 5,
    start_time: '07:00',
    duration_per_jp: 35,
    has_routine: true,
    routine_duration: 15,
    has_monday_ceremony: true,
    break1_duration: 15,
    break1_after_jp: 3,
    break2_duration: 15,
    break2_after_jp: 5,
  });

  useEffect(() => { fetchProfile(); }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/sekolah');
      if (res.data) {
        const s = res.data;
        const cfg = s.config || {};
        let startTime = '07:00'; // default
        if (cfg.start_time) {
          const d = new Date(cfg.start_time);
          if (!isNaN(d.getTime())) {
            // Always read as UTC since we store as 1970-01-01T{HH:MM}:00Z
            startTime = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
          }
        }
        setForm({
          nama_sekolah: s.nama_sekolah || '',
          npsn: s.npsn || '',
          alamat: s.alamat || '',
          is_parallel: cfg.is_parallel ?? false,
          class_naming: cfg.class_naming || 'alphabet',
          school_days: cfg.school_days || 5,
          start_time: startTime,
          duration_per_jp: cfg.duration_per_jp || 35,
          has_routine: cfg.has_routine ?? true,
          routine_duration: cfg.routine_duration || 15,
          has_monday_ceremony: cfg.has_monday_ceremony ?? true,
          break1_duration: cfg.break1_duration || 15,
          break1_after_jp: cfg.break1_after_jp || 3,
          break2_duration: cfg.break2_duration || 15,
          break2_after_jp: cfg.break2_after_jp || 5,
        });
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/sekolah', {
        nama_sekolah: form.nama_sekolah,
        npsn: form.npsn,
        alamat: form.alamat,
        config: {
          is_parallel: form.is_parallel,
          class_naming: form.class_naming,
          school_days: Number(form.school_days),
          start_time: new Date(`1970-01-01T${form.start_time}:00Z`).toISOString(),
          duration_per_jp: Number(form.duration_per_jp),
          has_routine: form.has_routine,
          routine_duration: Number(form.routine_duration),
          has_monday_ceremony: form.has_monday_ceremony,
          break1_duration: Number(form.break1_duration),
          break1_after_jp: Number(form.break1_after_jp),
          break2_duration: Number(form.break2_duration),
          break2_after_jp: Number(form.break2_after_jp),
        },
      });
      showToast('success', 'Konfigurasi sekolah berhasil disimpan!');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan konfigurasi.');
    } finally { setSaving(false); }
  };

  // Live preview timeline
  const buildTimeline = () => {
    const slots: { type: string; label: string; start: string; end: string }[] = [];
    const [h, m] = form.start_time.split(':').map(Number);
    let curr = new Date(1970, 0, 1, h ?? 7, m ?? 0);
    const fmt = (d: Date) => d.toTimeString().substring(0, 5);
    const addMin = (d: Date, min: number) => new Date(d.getTime() + min * 60000);

    if (form.has_monday_ceremony) {
      // Hari Senin dengan Upacara di JP 1
      const uEnd = addMin(curr, Number(form.duration_per_jp));
      slots.push({ type: 'ceremony', label: 'Upacara Bendera (JP 1)', start: fmt(curr), end: fmt(uEnd) });
      curr = uEnd;

      // Pembiasaan dilakukan setelah upacara
      if (form.has_routine) {
        const rEnd = addMin(curr, Number(form.routine_duration));
        slots.push({ type: 'routine', label: 'Pembiasaan Pagi (Setelah Upacara)', start: fmt(curr), end: fmt(rEnd) });
        curr = rEnd;
      }

      for (let jp = 2; jp <= 8; jp++) {
        const end = addMin(curr, Number(form.duration_per_jp));
        slots.push({ type: 'jp', label: `JP ${jp}`, start: fmt(curr), end: fmt(end) });
        curr = end;
        if (jp === Number(form.break1_after_jp)) {
          const bEnd = addMin(curr, Number(form.break1_duration));
          slots.push({ type: 'break', label: 'Istirahat I', start: fmt(curr), end: fmt(bEnd) });
          curr = bEnd;
        } else if (jp === Number(form.break2_after_jp)) {
          const bEnd = addMin(curr, Number(form.break2_duration));
          slots.push({ type: 'break', label: 'Istirahat II', start: fmt(curr), end: fmt(bEnd) });
          curr = bEnd;
        }
      }
    } else {
      // Tanpa upacara: pembiasaan sebelum JP 1
      if (form.has_routine) {
        const rEnd = addMin(curr, Number(form.routine_duration));
        slots.push({ type: 'routine', label: 'Pembiasaan Pagi', start: fmt(curr), end: fmt(rEnd) });
        curr = rEnd;
      }
      for (let jp = 1; jp <= 8; jp++) {
        const end = addMin(curr, Number(form.duration_per_jp));
        slots.push({ type: 'jp', label: `JP ${jp}`, start: fmt(curr), end: fmt(end) });
        curr = end;
        if (jp === Number(form.break1_after_jp)) {
          const bEnd = addMin(curr, Number(form.break1_duration));
          slots.push({ type: 'break', label: 'Istirahat I', start: fmt(curr), end: fmt(bEnd) });
          curr = bEnd;
        } else if (jp === Number(form.break2_after_jp)) {
          const bEnd = addMin(curr, Number(form.break2_duration));
          slots.push({ type: 'break', label: 'Istirahat II', start: fmt(curr), end: fmt(bEnd) });
          curr = bEnd;
        }
      }
    }
    return slots;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const timeline = buildTimeline();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title text-xl sm:text-2xl">{t.sekolahConfigTitle}</h1>
          <p className="page-subtitle">{t.sekolahConfigSubtitle}</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? t.saving : t.saveChanges}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Form Cards */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">

            {/* Identitas */}
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-700 flex items-center gap-2 text-[var(--foreground)] border-b border-[var(--border)] pb-3">
                <School size={16} className="text-[var(--primary)]" />
                {t.schoolIdentity}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="field-label">{t.schoolName}</label>
                  <input required value={form.nama_sekolah} onChange={(e) => setForm({ ...form, nama_sekolah: e.target.value })} placeholder="Nama Sekolah" className="field-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">NPSN</label>
                    <input required value={form.npsn} onChange={(e) => setForm({ ...form, npsn: e.target.value })} placeholder="NPSN Sekolah" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">{t.schoolType}</label>
                    <select value={form.is_parallel ? 'parallel' : 'single'} onChange={(e) => setForm({ ...form, is_parallel: e.target.value === 'parallel' })} className="field-input">
                      <option value="single">{t.nonParallelOption}</option>
                      <option value="parallel">{t.parallelOption}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="field-label">{t.address}</label>
                  <textarea rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat Lengkap Sekolah" className="field-input" />
                </div>
              </div>
            </div>

            {/* Jam Pelajaran */}
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-700 flex items-center gap-2 text-[var(--foreground)] border-b border-[var(--border)] pb-3">
                <Clock size={16} className="text-[var(--primary)]" />
                {t.periodsSchoolDays}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="field-label">{t.startTime}</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="field-input" />
                </div>
                <div>
                  <label className="field-label">{t.jpDuration}</label>
                  <input type="number" min={20} max={60} value={form.duration_per_jp} onChange={(e) => setForm({ ...form, duration_per_jp: Number(e.target.value) })} className="field-input" />
                </div>
                <div>
                  <label className="field-label">{t.schoolDays}</label>
                  <select value={form.school_days} onChange={(e) => setForm({ ...form, school_days: Number(e.target.value) })} className="field-input">
                    <option value={5}>{t.days5}</option>
                    <option value={6}>{t.days6}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Routines & Breaks */}
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-700 flex items-center gap-2 text-[var(--foreground)] border-b border-[var(--border)] pb-3">
                <CalendarDays size={16} className="text-[var(--primary)]" />
                {t.routineBreak}
              </h2>

              {/* Pembiasaan */}
              <div className="flex items-center justify-between p-3.5 bg-[var(--muted)] rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{t.morningRoutine}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{t.morningRoutineDesc}</p>
                  </div>
                </div>
                <input type="checkbox" checked={form.has_routine} onChange={(e) => setForm({ ...form, has_routine: e.target.checked })} className="toggle-checkbox" />
              </div>
              {form.has_routine && (
                <div className="pl-1 flex items-center gap-3 text-sm">
                  <label className="text-[var(--muted-foreground)] font-medium whitespace-nowrap">{t.routineDuration}</label>
                  <input type="number" min={5} max={30} value={form.routine_duration} onChange={(e) => setForm({ ...form, routine_duration: Number(e.target.value) })} className="field-input w-24" />
                  <span className="text-[var(--muted-foreground)]">menit</span>
                </div>
              )}

              {/* Upacara */}
              <div className="flex items-center justify-between p-3.5 bg-[var(--muted)] rounded-lg">
                <div>
                  <p className="text-sm font-semibold">{t.mondayCeremony}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{t.mondayCeremonyDesc}</p>
                </div>
                <input type="checkbox" checked={form.has_monday_ceremony} onChange={(e) => setForm({ ...form, has_monday_ceremony: e.target.checked })} className="toggle-checkbox" />
              </div>

              {/* Istirahat 1 & 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Istirahat 1 */}
                <div className="border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Coffee size={14} className="text-blue-500" /> {t.break1}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">{t.durationMin}</label>
                      <input type="number" min={5} max={45} value={form.break1_duration} onChange={(e) => setForm({ ...form, break1_duration: Number(e.target.value) })} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">{t.afterJp}</label>
                      <input type="number" min={1} max={8} value={form.break1_after_jp} onChange={(e) => setForm({ ...form, break1_after_jp: Number(e.target.value) })} className="field-input" />
                    </div>
                  </div>
                </div>

                {/* Istirahat 2 */}
                <div className="border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Coffee size={14} className="text-purple-500" /> {t.break2}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">{t.durationMin}</label>
                      <input type="number" min={5} max={45} value={form.break2_duration} onChange={(e) => setForm({ ...form, break2_duration: Number(e.target.value) })} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">{t.afterJp}</label>
                      <input type="number" min={1} max={10} value={form.break2_after_jp} onChange={(e) => setForm({ ...form, break2_after_jp: Number(e.target.value) })} className="field-input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Timeline Preview */}
          <div className="space-y-4 sm:space-y-5">
            <div className="card p-5 sticky top-6">
              <h3 className="text-sm font-700 flex items-center gap-2 text-[var(--foreground)] border-b border-[var(--border)] pb-3 mb-4">
                <CalendarDays size={16} className="text-[var(--primary)]" />
                {t.simulatedSchedule}
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)] mb-4">
                Otomatis diperbarui sesuai konfigurasi waktu di samping.
              </p>
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {timeline.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold border ${
                      slot.type === 'routine'
                        ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-bold dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200'
                        : slot.type === 'break'
                        ? 'bg-blue-100/90 border-blue-300 text-blue-950 font-bold dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-200'
                        : 'bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {slot.type === 'routine' && <Sparkles size={11} />}
                      {slot.type === 'break' && <Coffee size={11} />}
                      {slot.label}
                    </span>
                    <span className="font-mono opacity-70">{slot.start} – {slot.end}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>Total JP ditampilkan</span>
                <span className="font-bold text-[var(--foreground)]">8 JP</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
