'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Search, Users, ShieldCheck, Clock,
  Loader2, CheckCircle, AlertCircle, X, CalendarX2, Check, UserCheck, Mail, FileSpreadsheet
} from 'lucide-react';
import api from '../../../lib/axios';
import AvailabilityModal from './components/AvailabilityModal';
import ImportModal from '../../../components/ImportModal';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';

/* ─── Types ─── */
interface GuruUser { id: number; nama: string; email: string; is_verified: boolean; is_active: boolean }
interface Guru {
  id: number;
  nama: string;
  nip?: string;
  guruAvailabilities?: { hari: number }[];
  users?: GuruUser[];
}

/* ─── Bottom Sheet Modal ─── */
function BottomSheet({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{
              background: 'var(--card)',
              borderRadius: '20px 20px 0 0',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--foreground)' }}>{title}</h2>
              <button onClick={onClose} style={{ padding: '0.375rem', borderRadius: 8, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', color: 'var(--muted-foreground)' }}>
                <X size={17} />
              </button>
            </div>
            <div className="px-5 pb-5">{children}</div>
          </motion.div>

          {/* Desktop: center modal */}
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

/* ─── Toast ─── */
function Toast({ toast }: { toast: { type: 'success' | 'error'; message: string } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
          style={{ position: 'sticky', top: 0, zIndex: 10, marginBottom: '0.75rem' }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Page ─── */
export default function GuruPage() {
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [gurus, setGurus] = useState<Guru[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingTeacherId, setVerifyingTeacherId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [availabilityGuru, setAvailabilityGuru] = useState<Guru | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({ nama: '', nip: '' });

  useEffect(() => {
    fetchGurus();
    fetchPendingTeachers();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGurus = async () => {
    try { const res = await api.get('/guru'); setGurus(res.data || []); }
    catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchPendingTeachers = async () => {
    try {
      const res = await api.get('/guru/pending/list');
      setPendingTeachers(res.data || []);
    } catch { /* silent */ }
  };

  const handleVerifyTeacher = async (id: number) => {
    setVerifyingTeacherId(id);
    try {
      await api.post(`/guru/${id}/verify`);
      showToast('success', lang === 'en' ? 'Teacher account verified & linked.' : 'Akun guru berhasil diverifikasi & dihubungkan.');
      fetchPendingTeachers();
      fetchGurus();
    } catch {
      showToast('error', lang === 'en' ? 'Failed to verify teacher account.' : 'Gagal memverifikasi akun guru.');
    } finally {
      setVerifyingTeacherId(null);
    }
  };

  const openAdd = () => { setEditingGuru(null); setForm({ nama: '', nip: '' }); setSheetOpen(true); };
  const openEdit = (g: Guru) => { setEditingGuru(g); setForm({ nama: g.nama, nip: g.nip || '' }); setSheetOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingGuru) { await api.put(`/guru/${editingGuru.id}`, { nama: form.nama, nip: form.nip || null }); showToast('success', 'Data guru diperbarui.'); }
      else { await api.post('/guru', { nama: form.nama, nip: form.nip || null }); showToast('success', `${form.nama} ditambahkan.`); }
      setSheetOpen(false); fetchGurus();
    } catch (err: any) { showToast('error', err.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/guru/${id}`); showToast('success', 'Guru dihapus.'); setDeletingId(null); fetchGurus(); }
    catch { showToast('error', 'Gagal menghapus.'); }
  };

  const filtered = gurus.filter((g) => {
    const q = searchTerm.toLowerCase();
    const emailStr = (g.users?.[0]?.email || '').toLowerCase();
    return (g.nama || '').toLowerCase().includes(q) || (g.nip || '').toLowerCase().includes(q) || emailStr.includes(q);
  });

  const GuruForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Nama Lengkap</label>
        <input required autoFocus type="text" placeholder="Nama Lengkap Guru"
          value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="field-input" />
      </div>
      <div>
        <label className="field-label">NIP <span className="normal-case font-normal text-[var(--muted-foreground)]">(Opsional)</span></label>
        <input type="text" placeholder="NIP Guru" value={form.nip}
          onChange={(e) => setForm({ ...form, nip: e.target.value })} className="field-input" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setSheetOpen(false)} className="btn btn-secondary flex-1">Batal</button>
        <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {editingGuru ? 'Simpan' : 'Tambah Guru'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <Toast toast={toast} />

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="page-title">Manajemen Guru</h1>
          <p className="page-subtitle">Kelola master data tenaga pengajar dan verifikasi akun guru.</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => setShowImportModal(true)} className="btn btn-secondary text-xs">
            <FileSpreadsheet size={16} /> Bulk Import Guru
          </button>
          <button onClick={openAdd} className="btn btn-primary text-xs">
            <Plus size={16} /> Tambah Guru
          </button>
        </div>
      </div>

      {/* Pending Teacher Verification Requests Alert */}
      {pendingTeachers.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <UserCheck size={18} /> {t.pendingTeacherNotice} ({pendingTeachers.length})
            </h3>
          </div>
          <div className="divide-y divide-amber-500/20">
            {pendingTeachers.map((pt) => (
              <div key={pt.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-foreground">{pt.nama}</span> ({pt.email})
                  {pt.guru?.nip && <span className="text-muted-foreground ml-2 font-mono">NIP: {pt.guru.nip}</span>}
                </div>
                <button
                  onClick={() => handleVerifyTeacher(pt.id)}
                  disabled={verifyingTeacherId === pt.id}
                  className="btn btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 border-none inline-flex items-center gap-1 shrink-0"
                >
                  {verifyingTeacherId === pt.id ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12} /> {t.verifyTeacherBtn}</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats — 3 columns */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Total Guru', value: gurus.length, icon: Users, bg: '#EFF6FF', color: '#2563EB' },
          { label: 'Ber-NIP', value: gurus.filter((g) => !!g.nip).length, icon: ShieldCheck, bg: '#ECFDF5', color: '#059669' },
          { label: 'Akun Terverifikasi', value: gurus.filter((g) => (g.users?.length || 0) > 0).length, icon: UserCheck, bg: '#F5F3FF', color: '#7C3AED' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Icon size={16} />
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', fontWeight: 500, marginTop: 2, lineHeight: 1.2 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <Search size={15} className="search-icon" />
        <input type="text" placeholder="Cari nama, NIP, atau email..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input" />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '0.75rem', color: 'var(--muted-foreground)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.875rem' }}>Memuat data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users size={32} className="empty-state-icon" />
            <p className="text-sm font-semibold">{searchTerm ? 'Tidak ditemukan' : 'Belum ada guru'}</p>
            {!searchTerm && <button onClick={openAdd} className="btn btn-primary mt-3" style={{ fontSize: '0.8125rem' }}><Plus size={14} /> Tambah Guru Pertama</button>}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: Card list */}
          <div className="md:hidden space-y-2">
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', paddingLeft: 2 }}>{filtered.length} guru</p>
            {filtered.map((guru) => {
              const availCount = guru.guruAvailabilities?.length || 0;
              const linkedUser = guru.users?.[0];
              return (
                <div key={guru.id} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'var(--accent)', color: 'var(--accent-foreground)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1.125rem',
                    }}>
                      {(guru.nama || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {guru.nama}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>
                        NIP: {guru.nip || <span style={{ fontStyle: 'italic' }}>Tanpa NIP</span>}
                      </div>
                      {linkedUser ? (
                        <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Mail size={12} /> {linkedUser.email}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginTop: 2, fontStyle: 'italic' }}>
                          Belum terhubung akun
                        </div>
                      )}
                      {availCount > 0 ? (
                        <span className="badge badge-amber" style={{ marginTop: 6, fontSize: '0.6875rem' }}>{availCount} hari dibatasi</span>
                      ) : (
                        <span className="badge badge-green" style={{ marginTop: 6, fontSize: '0.6875rem' }}>Tersedia Penuh</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={() => openEdit(guru)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setAvailabilityGuru(guru)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                        <CalendarX2 size={15} />
                      </button>
                      <button onClick={() => setDeletingId(guru.id)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="card overflow-hidden hidden md:block">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)]">{filtered.length} guru</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Nama Lengkap</th>
                  <th>NIP</th>
                  <th>Akun User Guru (Email)</th>
                  <th>Ketersediaan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((guru, i) => {
                  const availCount = guru.guruAvailabilities?.length || 0;
                  const linkedUser = guru.users?.[0];
                  return (
                    <tr key={guru.id}>
                      <td className="font-mono text-xs text-[var(--muted-foreground)]">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar w-8 h-8 bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold">{(guru.nama || '?').charAt(0)}</div>
                          <span className="font-semibold">{guru.nama}</span>
                        </div>
                      </td>
                      <td><span className="font-mono text-sm text-[var(--muted-foreground)]">{guru.nip || '—'}</span></td>
                      <td>
                        {linkedUser ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                            <UserCheck size={13} /> {linkedUser.email}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)] italic">—</span>
                        )}
                      </td>
                      <td>{availCount > 0 ? <span className="badge badge-amber">{availCount} hari dibatasi</span> : <span className="badge badge-green">Tersedia Penuh</span>}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setAvailabilityGuru(guru)} className="btn btn-ghost p-2 text-amber-600"><CalendarX2 size={15} /></button>
                          <button onClick={() => openEdit(guru)} className="btn btn-ghost p-2 text-blue-600"><Edit2 size={15} /></button>
                          <button onClick={() => setDeletingId(guru.id)} className="btn btn-ghost p-2 text-red-500"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bottom Sheet / Modal: Add/Edit */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title={editingGuru ? 'Edit Guru' : 'Tambah Guru'}>
        <GuruForm />
      </BottomSheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deletingId !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50" onClick={() => setDeletingId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 bottom-4 z-50 md:hidden rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}
            >
              <div className="p-5 text-center space-y-3">
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <AlertCircle size={22} color="#DC2626" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>Hapus Guru?</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Data ini akan dihapus permanen dan tidak bisa dikembalikan.</div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button>
                  <button onClick={() => handleDelete(deletingId)} className="btn btn-danger">Hapus</button>
                </div>
              </div>
            </motion.div>

            {/* Desktop: center modal */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
              <div className="modal-content max-w-sm w-full p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><AlertCircle size={22} className="text-red-600" /></div>
                <h3 className="text-base font-bold">Hapus Guru?</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Data ini akan dihapus permanen.</p>
                <div className="flex justify-center gap-2"><button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button><button onClick={() => handleDelete(deletingId)} className="btn btn-danger">Hapus</button></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AvailabilityModal isOpen={!!availabilityGuru} onClose={() => setAvailabilityGuru(null)} guru={availabilityGuru} onSuccess={fetchGurus} />
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        entitas="guru"
        title="Data Guru"
        onSuccess={fetchGurus}
      />
    </div>
  );
}
