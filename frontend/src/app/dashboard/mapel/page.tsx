'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Search, BookOpen, Star,
  Loader2, CheckCircle, AlertCircle, X,
} from 'lucide-react';
import api from '../../../lib/axios';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';

const COLOR_PRESETS = [
  '#2563EB', '#10B981', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#64748B',
];

export default function MapelPage() {
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [mapels, setMapels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    nama: '',
    prioritas: false,
    color: '#2563EB',
    jp_per_tingkatan: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<number, number>,
  });

  useEffect(() => { fetchMapels(); }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMapels = async () => {
    try {
      const res = await api.get('/mapel');
      setMapels(res.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingMapel(null);
    setForm({ nama: '', prioritas: false, color: '#2563EB', jp_per_tingkatan: { 1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5 } });
    setIsModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditingMapel(m);
    const jpMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    (m.mapelTingkatans || []).forEach((mt: any) => {
      const tNum = parseInt((mt.tingkatan?.nama || '').replace(/\D/g, '')) || mt.id_tingkatan;
      if (tNum >= 1 && tNum <= 6) jpMap[tNum] = mt.jp_per_minggu;
    });
    setForm({ nama: m.nama, prioritas: Boolean(m.prioritas), color: m.color || '#2563EB', jp_per_tingkatan: jpMap });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMapel) {
        await api.put(`/mapel/${editingMapel.id}`, { ...form });
        showToast('success', `${form.nama} berhasil diperbarui.`);
      } else {
        await api.post('/mapel', { ...form });
        showToast('success', `${form.nama} berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      fetchMapels();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan mata pelajaran.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/mapel/${id}`);
      showToast('success', 'Mata pelajaran berhasil dihapus.');
      setDeletingId(null);
      fetchMapels();
    } catch { showToast('error', 'Gagal menghapus mata pelajaran.'); }
  };

  const filtered = mapels.filter((m) =>
    (m.nama || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalJp = (m: any) =>
    (m.mapelTingkatans || []).reduce((s: number, mt: any) => s + (mt.jp_per_minggu || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">{t.actionMapelTitle}</h1>
          <p className="page-subtitle">{t.actionMapelDesc}</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary shrink-0">
          <Plus size={16} /> {lang === 'en' ? 'Add Subject' : 'Tambah Mapel'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: mapels.length, icon: BookOpen, color: 'bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300' },
          { label: lang === 'en' ? 'Priority' : 'Prioritas', value: mapels.filter((m) => m.prioritas).length, icon: Star, color: 'bg-amber-100/80 text-amber-950 font-bold dark:bg-amber-950/50 dark:text-amber-200' },
          { label: lang === 'en' ? 'Regular' : 'Reguler', value: mapels.filter((m) => !m.prioritas).length, icon: BookOpen, color: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-3 sm:p-5 flex items-center gap-2 sm:gap-3">
              <div className={`shrink-0 ${s.color} p-2 rounded-lg`}><Icon size={16} /></div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] truncate">{s.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] leading-none mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Cari mata pelajaran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Memuat data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><BookOpen size={32} className="empty-state-icon" /><p className="text-sm font-semibold">Tidak ada mata pelajaran</p></div></div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden hidden sm:block">
            <p className="text-xs text-[var(--muted-foreground)] px-5 py-3 border-b border-[var(--border)]">{filtered.length} mapel</p>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Nama Mata Pelajaran</th>
                    <th>Tipe</th>
                    <th>Warna</th>
                    <th className="text-center">Total JP</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr key={m.id}>
                      <td className="text-[var(--muted-foreground)] text-xs font-mono">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color || '#2563EB' }} />
                          <span className="font-semibold">{m.nama}</span>
                        </div>
                      </td>
                      <td>
                        {m.prioritas
                          ? <span className="badge badge-amber"><Star size={10} fill="currentColor" /> Prioritas</span>
                          : <span className="badge badge-gray">Reguler</span>}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded border border-black/10" style={{ backgroundColor: m.color || '#2563EB' }} />
                          <span className="font-mono text-xs text-[var(--muted-foreground)]">{m.color || '#2563EB'}</span>
                        </div>
                      </td>
                      <td className="text-center font-mono font-semibold text-sm">
                        {totalJp(m) > 0 ? `${totalJp(m)} JP` : '—'}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(m)} className="btn btn-ghost p-2 text-blue-600 hover:bg-blue-50" title="Edit"><Edit2 size={15} /></button>
                          <button onClick={() => setDeletingId(m.id)} className="btn btn-ghost p-2 text-red-500 hover:bg-red-50" title="Hapus"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2">
            <p className="text-xs text-[var(--muted-foreground)] px-1">{filtered.length} mapel</p>
            {filtered.map((m) => (
              <div key={m.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Color dot */}
                    <div className="w-10 h-10 rounded-lg shrink-0 border border-black/10 shadow-sm" style={{ backgroundColor: m.color || '#2563EB' }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">{m.nama}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {m.prioritas
                          ? <span className="badge badge-amber text-[10px]"><Star size={9} fill="currentColor" /> Prioritas</span>
                          : <span className="badge badge-gray text-[10px]">Reguler</span>}
                        {totalJp(m) > 0 && (
                          <span className="badge badge-blue text-[10px] font-mono">{totalJp(m)} JP/minggu</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(m)} className="btn btn-ghost p-2 text-blue-600" title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => setDeletingId(m.id)} className="btn btn-ghost p-2 text-red-500" title="Hapus"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="modal-content max-w-lg w-full p-5 sm:p-6 mx-3 sm:mx-0 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold">{editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost p-1.5"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="field-label">Nama</label>
                  <input required type="text" placeholder="Nama Mata Pelajaran" value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })} className="field-input" />
                </div>

                {/* Prioritas + Warna */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--muted)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">Prioritas Pagi</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">Sebelum Istirahat I</p>
                      </div>
                      <input type="checkbox" checked={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.checked })} className="toggle-checkbox" />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Warna</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {COLOR_PRESETS.map((hex) => (
                        <button key={hex} type="button" onClick={() => setForm({ ...form, color: hex })} title={hex}
                          className={`w-6 h-6 rounded-md border-2 transition-transform ${form.color === hex ? 'scale-125 border-[var(--foreground)]' : 'border-transparent hover:scale-110'}`}
                          style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* JP per Tingkatan */}
                <div>
                  <label className="field-label">JP per Minggu per Tingkatan</label>
                  <div className="grid grid-cols-6 gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5, 6].map((t) => (
                      <div key={t} className="text-center">
                        <p className="text-[10px] text-[var(--muted-foreground)] font-semibold mb-1">Kls {t}</p>
                        <input
                          type="number" min={0} max={20}
                          value={form.jp_per_tingkatan[t] ?? 0}
                          onChange={(e) => setForm({ ...form, jp_per_tingkatan: { ...form.jp_per_tingkatan, [t]: Number(e.target.value) } })}
                          className="field-input text-center px-1 font-bold font-mono text-xs" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {editingMapel ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deletingId !== null && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setDeletingId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="modal-content max-w-sm w-full p-5 text-center space-y-3 mx-3 sm:mx-0">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold">Hapus Mata Pelajaran?</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Data ini akan dihapus permanen.</p>
              <div className="flex justify-center gap-2 pt-1">
                <button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button>
                <button onClick={() => handleDelete(deletingId)} className="btn btn-danger">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
