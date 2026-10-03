'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Search, GraduationCap, UserCheck,
  Loader2, CheckCircle, AlertCircle, X, FileSpreadsheet,
} from 'lucide-react';
import api from '../../../lib/axios';
import ImportModal from '../../../components/ImportModal';

import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';

function BottomSheet({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0', paddingBottom: 'env(safe-area-inset-bottom, 16px)', maxHeight: '92vh', overflowY: 'auto' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--foreground)' }}>{title}</h2>
              <button onClick={onClose} style={{ padding: '0.375rem', borderRadius: 8, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', color: 'var(--muted-foreground)' }}><X size={17} /></button>
            </div>
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
          <div className="fixed inset-0 z-40 hidden md:flex items-center justify-center p-4">
            <div className="modal-content max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">{title}</h2>
                <button onClick={onClose} className="btn btn-ghost p-1.5"><X size={18} /></button>
              </div>
              {children}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function KelasPage() {
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [kelass, setKelass] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({ nama_kelas: '', kode_lengkap: '', id_tingkatan: 1, id_guru_wali: '' });

  useEffect(() => { fetchData(); }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [kRes, gRes] = await Promise.all([api.get('/kelas'), api.get('/guru')]);
      setKelass(kRes.data || []); setGurus(gRes.data || []);
    } catch { } finally { setLoading(false); }
  };

  const openAdd = () => { setEditingKelas(null); setForm({ nama_kelas: '', kode_lengkap: '', id_tingkatan: 1, id_guru_wali: '' }); setSheetOpen(true); };
  const openEdit = (k: any) => {
    setEditingKelas(k);
    setForm({ nama_kelas: k.nama_kelas, kode_lengkap: k.kode_lengkap || k.nama_kelas, id_tingkatan: k.id_tingkatan || 1, id_guru_wali: String(k.waliKelasList?.[0]?.guru?.id || '') });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { nama_kelas: form.nama_kelas, kode_lengkap: form.kode_lengkap || form.nama_kelas, id_tingkatan: Number(form.id_tingkatan), id_guru_wali: form.id_guru_wali ? Number(form.id_guru_wali) : null };
      if (editingKelas) { await api.put(`/kelas/${editingKelas.id}`, payload); showToast('success', 'Kelas diperbarui.'); }
      else { await api.post('/kelas', payload); showToast('success', `Kelas ${form.nama_kelas} ditambahkan.`); }
      setSheetOpen(false); fetchData();
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/kelas/${id}`); showToast('success', 'Kelas dihapus.'); setDeletingId(null); fetchData(); }
    catch { showToast('error', 'Gagal menghapus.'); }
  };

  const filtered = kelass.filter((k) => {
    const q = searchTerm.toLowerCase();
    return (k.nama_kelas || '').toLowerCase().includes(q) || (k.waliKelasList?.[0]?.guru?.nama || '').toLowerCase().includes(q);
  });

  const withWali = kelass.filter((k) => k.waliKelasList?.length > 0).length;
  const uniqueTingkatan = new Set(kelass.map((k) => k.id_tingkatan || k.tingkatan?.id)).size;

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Nama</label>
          <input required type="text" placeholder="1A" value={form.nama_kelas}
            onChange={(e) => setForm({ ...form, nama_kelas: e.target.value, kode_lengkap: form.kode_lengkap || e.target.value })}
            className="field-input" />
        </div>
        <div>
          <label className="field-label">Kode</label>
          <input required type="text" placeholder="1A" value={form.kode_lengkap}
            onChange={(e) => setForm({ ...form, kode_lengkap: e.target.value })} className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label">Tingkatan</label>
        <select value={form.id_tingkatan} onChange={(e) => setForm({ ...form, id_tingkatan: Number(e.target.value) })} className="field-input">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Kelas {n}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">Wali Kelas</label>
        <select value={form.id_guru_wali} onChange={(e) => setForm({ ...form, id_guru_wali: e.target.value })} className="field-input">
          <option value="">— Tanpa Wali Kelas —</option>
          {gurus.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setSheetOpen(false)} className="btn btn-secondary flex-1">Batal</button>
        <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {editingKelas ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </form>
  );

  // Group filtered kelas by tingkatan for mobile display
  const grouped = filtered.reduce((acc: Record<number, any[]>, k) => {
    const t = k.id_tingkatan || k.tingkatan?.id || 0;
    if (!acc[t]) acc[t] = [];
    acc[t].push(k);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
            style={{ position: 'sticky', top: 0, zIndex: 10, marginBottom: '0.75rem' }}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="page-title">{t.actionKelasTitle}</h1>
          <p className="page-subtitle">{t.actionKelasDesc}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setImportModalOpen(true)} className="btn btn-secondary text-xs flex items-center gap-1.5">
            <FileSpreadsheet size={15} /> Import Excel
          </button>
          <button onClick={openAdd} className="btn btn-primary text-xs">
            <Plus size={16} /> {lang === 'en' ? 'Add Class' : 'Tambah Kelas'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Total Kelas', value: kelass.length, icon: GraduationCap, bg: '#EFF6FF', color: '#2563EB' },
          { label: 'Berwali', value: withWali, icon: UserCheck, bg: '#ECFDF5', color: '#059669' },
          { label: 'Tingkatan', value: uniqueTingkatan, icon: GraduationCap, bg: '#F5F3FF', color: '#7C3AED' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Icon size={16} />
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <Search size={15} className="search-icon" />
        <input type="text" placeholder="Cari kelas atau wali..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '0.75rem' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Memuat data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <GraduationCap size={32} className="empty-state-icon" />
            <p className="text-sm font-semibold">{searchTerm ? 'Tidak ditemukan' : 'Belum ada kelas'}</p>
            {!searchTerm && <button onClick={openAdd} className="btn btn-primary mt-3" style={{ fontSize: '0.8125rem' }}><Plus size={14} /> Tambah Kelas</button>}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: Grouped Cards */}
          <div className="md:hidden space-y-4">
            {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([tingkatan, kelas]) => (
              <div key={tingkatan}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', paddingLeft: 2 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={12} color="#2563EB" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Kelas {tingkatan}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>({(kelas as any[]).length} kelas)</span>
                </div>
                <div className="space-y-2">
                  {(kelas as any[]).map((kls) => {
                    const wali = kls.waliKelasList?.[0]?.guru;
                    return (
                      <div key={kls.id} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          {/* Kelas Badge */}
                          <div style={{
                            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                            background: 'var(--accent)', color: 'var(--accent-foreground)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.02em',
                          }}>
                            {kls.kode_lengkap || kls.nama_kelas}
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--foreground)' }}>
                              {kls.nama_kelas}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>
                              {wali
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><UserCheck size={11} color="#059669" />{wali.nama}</span>
                                : <span style={{ fontStyle: 'italic' }}>Belum ada wali kelas</span>}
                            </div>
                          </div>
                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(kls)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}><Edit2 size={15} /></button>
                            <button onClick={() => setDeletingId(kls.id)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="card overflow-hidden hidden md:block">
            <p className="text-xs text-[var(--muted-foreground)] px-5 py-3 border-b border-[var(--border)]">{filtered.length} kelas</p>
            <table className="data-table">
              <thead><tr><th style={{ width: 40 }}>#</th><th>Nama</th><th>Kode</th><th>Tingkatan</th><th>Wali Kelas</th><th className="text-right">Aksi</th></tr></thead>
              <tbody>
                {filtered.map((kls, i) => {
                  const wali = kls.waliKelasList?.[0]?.guru;
                  return (
                    <tr key={kls.id}>
                      <td className="font-mono text-xs text-[var(--muted-foreground)]">{i + 1}</td>
                      <td className="font-semibold">{kls.nama_kelas}</td>
                      <td><span className="badge badge-blue font-mono">{kls.kode_lengkap}</span></td>
                      <td className="text-[var(--muted-foreground)] text-sm">{kls.tingkatan?.nama || `Kelas ${kls.id_tingkatan}`}</td>
                      <td>{wali ? <span className="flex items-center gap-2"><span className="avatar w-7 h-7 bg-emerald-100 text-emerald-700 text-xs">{wali.nama.charAt(0)}</span>{wali.nama}</span> : <span className="badge badge-gray">—</span>}</td>
                      <td><div className="flex justify-end gap-1"><button onClick={() => openEdit(kls)} className="btn btn-ghost p-2 text-blue-600"><Edit2 size={15} /></button><button onClick={() => setDeletingId(kls.id)} className="btn btn-ghost p-2 text-red-500"><Trash2 size={15} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title={editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}>
        <FormContent />
      </BottomSheet>

      {/* Delete confirm */}
      <AnimatePresence>
        {deletingId !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50" onClick={() => setDeletingId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 bottom-4 z-50 md:hidden rounded-2xl p-5 text-center space-y-3"
              style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><AlertCircle size={22} color="#DC2626" /></div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Hapus Kelas?</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Data ini akan dihapus permanen.</div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button>
                <button onClick={() => handleDelete(deletingId)} className="btn btn-danger">Hapus</button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
              <div className="modal-content max-w-sm w-full p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><AlertCircle size={22} className="text-red-600" /></div>
                <h3 className="text-base font-bold">Hapus Kelas?</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Data ini akan dihapus permanen.</p>
                <div className="flex justify-center gap-2"><button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button><button onClick={() => handleDelete(deletingId)} className="btn btn-danger">Hapus</button></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        entitas="kelas"
        title="Kelas"
        onSuccess={fetchData}
      />
    </div>
  );
}
