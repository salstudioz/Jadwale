'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays, Users, GraduationCap, BookOpen, ArrowRight,
  Download, Share2, CheckCircle2, Loader2, TrendingUp, Link as LinkIcon,
  ShieldCheck, UserPlus, Check, X, Sparkles, School, AlertCircle, Search
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../../store/useLanguageStore';
import api from '../../lib/axios';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const role = (user?.email === 'superadmin@jadwale.id' || user?.role === 'SUPER_ADMIN')
    ? 'SUPER_ADMIN'
    : user?.role || (user?.is_admin ? 'ADMIN_SEKOLAH' : 'USER_BIASA');

  const [stats, setStats] = useState({ guru: 0, kelas: 0, mapel: 0, jadwal: 0 });
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Superadmin States
  const [pendingSchools, setPendingSchools] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'admin_sekolah' | 'tenaga_pendidik' | 'user_biasa' | 'designer' | 'sekolah'>('admin_sekolah');
  const [searchAccount, setSearchAccount] = useState('');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [designerForm, setDesignerForm] = useState({ nama: '', email: '', password: '' });
  const [designerLoading, setDesignerLoading] = useState(false);
  const [designerSuccess, setDesignerSuccess] = useState('');
  const [designerError, setDesignerError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);

  // Admin Sekolah States for pending teachers
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [verifyingTeacherId, setVerifyingTeacherId] = useState<number | null>(null);

  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      fetchSuperadminData();
    } else if (role === 'ADMIN_SEKOLAH') {
      fetchSchoolStats();
      fetchPendingTeachers();
    } else {
      setLoading(false);
    }
  }, [role]);

  const fetchSchoolStats = async () => {
    try {
      const res = await api.get('/sekolah/stats');
      setStats({
        guru: res.data.guru || 0,
        kelas: res.data.kelas || 0,
        mapel: res.data.mapel || 0,
        jadwal: res.data.jadwal || 0,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchSuperadminData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, schoolsRes] = await Promise.all([
        api.get('/admin/pending-schools'),
        api.get('/admin/users'),
        api.get('/admin/schools'),
      ]);
      setPendingSchools(pendingRes.data || []);
      setUsersList(usersRes.data || []);
      setSchoolsList(schoolsRes.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchPendingTeachers = async () => {
    try {
      const res = await api.get('/guru/pending/list');
      setPendingTeachers(res.data);
    } catch { /* silent */ }
  };

  const handleVerifySchool = async (id: number) => {
    setVerifyingId(id);
    try {
      await api.post(`/admin/verify-school/${id}`);
      setPendingSchools(prev => prev.filter(s => s.id !== id));
      fetchSuperadminData();
    } catch {
      alert(lang === 'en' ? 'Failed to verify school' : 'Gagal memverifikasi sekolah');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleToggleUserStatus = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      await api.put(`/admin/users/${id}/status`, { is_active: !currentStatus });
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
    } catch {
      alert(lang === 'en' ? 'Failed to update account status.' : 'Gagal mengubah status akun.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleVerifyTeacher = async (id: number) => {
    setVerifyingTeacherId(id);
    try {
      await api.post(`/guru/${id}/verify`);
      setPendingTeachers(prev => prev.filter(t => t.id !== id));
      alert(lang === 'en' ? 'Teacher account approved!' : 'Akun Tenaga Pendidik berhasil disetujui!');
    } catch {
      alert(lang === 'en' ? 'Failed to approve teacher account.' : 'Gagal menyetujui akun guru.');
    } finally {
      setVerifyingTeacherId(null);
    }
  };

  const handleCreateDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    setDesignerLoading(true);
    setDesignerSuccess('');
    setDesignerError('');

    try {
      await api.post('/admin/designers', designerForm);
      setDesignerSuccess(lang === 'en' ? `Designer account for ${designerForm.nama} created!` : `Akun Designer untuk ${designerForm.nama} berhasil dibuat!`);
      setDesignerForm({ nama: '', email: '', password: '' });
      fetchSuperadminData();
      setTimeout(() => setShowDesignerModal(false), 2000);
    } catch (err: any) {
      setDesignerError(err.response?.data?.message || (lang === 'en' ? 'Failed to create Designer account.' : 'Gagal membuat akun Designer.'));
    } finally {
      setDesignerLoading(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const res = await api.post('/share', { permission: 'read' });
      const url = `${window.location.origin}/share/${res.data.uuid}`;
      setShareLink(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { /* silent */ }
    finally { setShareLoading(false); }
  };

  const handleDownload = async (type: 'pdf' | 'excel') => {
    const ext = type === 'excel' ? 'xlsx' : 'pdf';
    const mime = type === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';
    try {
      const res = await api.get(`/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jadwal_Pelajaran.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch { alert(`Gagal mengunduh ${type.toUpperCase()}. Pastikan jadwal sudah di-generate.`); }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return t.goodMorning;
    if (hour < 15) return t.goodAfternoon;
    if (hour < 18) return t.goodEvening;
    return t.goodNight;
  };

  // Filter accounts based on tab and search
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.nama || '').toLowerCase().includes(searchAccount.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchAccount.toLowerCase()) ||
                          (u.sekolah?.nama_sekolah || '').toLowerCase().includes(searchAccount.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'admin_sekolah') return u.role === 'ADMIN_SEKOLAH';
    if (activeTab === 'tenaga_pendidik') return u.role === 'TENAGA_PENDIDIK';
    if (activeTab === 'user_biasa') return u.role === 'USER_BIASA';
    if (activeTab === 'designer') return u.role === 'DESIGNER';
    return true;
  });

  const filteredSchools = schoolsList.filter(s =>
    (s.nama_sekolah || '').toLowerCase().includes(searchAccount.toLowerCase()) ||
    (s.npsn || '').toLowerCase().includes(searchAccount.toLowerCase())
  );

  // ----------------------------------------------------
  // VIEW UNTUK SUPER ADMIN (PENGELOLAAN PLATFORM)
  // ----------------------------------------------------
  if (role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title text-xl sm:text-2xl flex items-center gap-2">
              <ShieldCheck className="text-primary" /> {t.superadminPanel}
            </h1>
            <p className="page-subtitle mt-1">
              {t.superadminDesc}
            </p>
          </div>
          
          <button
            onClick={() => setShowDesignerModal(true)}
            className="btn btn-primary inline-flex items-center gap-2 shrink-0"
          >
            <UserPlus size={16} /> {t.createDesigner}
          </button>
        </div>

        {/* Superadmin Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{t.tabAllUsers}</span>
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{usersList.length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{lang === 'en' ? 'Total system accounts' : 'Total seluruh akun terdaftar'}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{t.registeredSchools}</span>
              <School size={18} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{schoolsList.length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{lang === 'en' ? 'Active registered schools' : 'Sekolah terdaftar'}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{t.pendingVerification}</span>
              <AlertCircle size={18} className="text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-300">{pendingSchools.length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{lang === 'en' ? 'Awaiting superadmin action' : 'Menunggu tindakan Superadmin'}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{t.tabDesigner}</span>
              <Sparkles size={18} className="text-purple-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{usersList.filter(u => u.role === 'DESIGNER').length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{lang === 'en' ? 'Active template designers' : 'Akun Designer aktif'}</p>
          </div>
        </div>

        {/* Modal Buat Akun Designer */}
        {showDesignerModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" /> {t.createDesignerTitle}
                </h3>
                <button onClick={() => setShowDesignerModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              {designerSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> {designerSuccess}
                </div>
              )}

              {designerError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={16} /> {designerError}
                </div>
              )}

              <form onSubmit={handleCreateDesigner} className="space-y-3">
                <div>
                  <label className="field-label">{t.designerName}</label>
                  <input
                    type="text" required
                    value={designerForm.nama} onChange={(e) => setDesignerForm({ ...designerForm, nama: e.target.value })}
                    placeholder={t.designerName}
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="field-label">{t.designerEmail}</label>
                  <input
                    type="email" required
                    value={designerForm.email} onChange={(e) => setDesignerForm({ ...designerForm, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="field-label">{t.initialPassword}</label>
                  <input
                    type="password" required minLength={6}
                    value={designerForm.password} onChange={(e) => setDesignerForm({ ...designerForm, password: e.target.value })}
                    placeholder={lang === 'en' ? 'Minimum 6 characters' : 'Minimal 6 karakter'}
                    className="field-input"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setShowDesignerModal(false)} className="btn btn-outline">
                    {t.cancel}
                  </button>
                  <button type="submit" disabled={designerLoading} className="btn btn-primary">
                    {designerLoading ? <Loader2 size={16} className="animate-spin" /> : t.createDesigner}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detail Profil Sekolah (Superadmin View) */}
        {selectedSchool && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                  <School size={20} className="text-primary" /> {selectedSchool.nama_sekolah}
                </h3>
                <button onClick={() => setSelectedSchool(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-muted border border-border">
                    <span className="text-muted-foreground font-semibold">NPSN</span>
                    <p className="font-extrabold text-sm font-mono text-foreground mt-0.5">{selectedSchool.npsn || '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border border-border">
                    <span className="text-muted-foreground font-semibold">{t.schoolIdentity}</span>
                    <p className="font-extrabold text-sm text-foreground mt-0.5">{selectedSchool.nama_sekolah}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted border border-border">
                  <span className="text-muted-foreground font-semibold">{t.address}</span>
                  <p className="font-semibold text-foreground mt-0.5">{selectedSchool.alamat || (lang === 'en' ? 'No address registered' : 'Alamat belum diisi')}</p>
                </div>

                <div className="p-3 rounded-lg bg-muted border border-border">
                  <span className="text-muted-foreground font-semibold">{t.tabAdminSekolah}</span>
                  <div className="mt-1 space-y-1">
                    {selectedSchool.users?.filter((u: any) => u.role === 'ADMIN_SEKOLAH').map((adm: any) => (
                      <div key={adm.id} className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{adm.nama}</span>
                        <span className="font-mono text-muted-foreground">{adm.email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">{t.totalTeachersCount}</span>
                    <p className="text-base font-extrabold text-foreground mt-0.5">{selectedSchool._count?.gurus || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{t.totalClassesCount}</span>
                    <p className="text-base font-extrabold text-foreground mt-0.5">{selectedSchool._count?.kelas || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">{t.totalSubjectsCount}</span>
                    <p className="text-base font-extrabold text-foreground mt-0.5">{selectedSchool._count?.mapels || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setSelectedSchool(null)} className="btn btn-secondary text-xs">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verifikasi Admin Sekolah Pending Alert */}
        {pendingSchools.length > 0 && (
          <div className="card p-5 space-y-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                <AlertCircle size={18} className="text-amber-500" /> {t.pendingVerification} ({pendingSchools.length})
              </h2>
              <button onClick={fetchSuperadminData} className="text-xs text-primary font-semibold hover:underline">
                Refresh
              </button>
            </div>

            <div className="divide-y divide-border">
              {pendingSchools.map((s) => (
                <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{s.sekolah?.nama_sekolah || (lang === 'en' ? 'New School' : 'Sekolah Baru')}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Admin: {s.nama} ({s.email}) | NPSN: {s.sekolah?.npsn || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleVerifySchool(s.id)}
                    disabled={verifyingId === s.id}
                    className="btn btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 border-none shrink-0 inline-flex items-center gap-1.5"
                  >
                    {verifyingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> {t.approveVerify}</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PENGELOLAAN SELURUH AKUN & PROFIL SEKOLAH */}
        <div className="card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users size={18} className="text-primary" /> {t.manageAccounts}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'en' ? 'View non-credential info, active status toggles, and school details across platform.' : 'Lihat informasi non-kredensial, toggle status aktif, dan detail profil sekolah.'}
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl overflow-x-auto text-xs shrink-0">
              {[
                { id: 'admin_sekolah', label: t.tabAdminSekolah, count: usersList.filter(u => u.role === 'ADMIN_SEKOLAH').length },
                { id: 'tenaga_pendidik', label: t.tabTenagaPendidik, count: usersList.filter(u => u.role === 'TENAGA_PENDIDIK').length },
                { id: 'user_biasa', label: t.tabUserBiasa, count: usersList.filter(u => u.role === 'USER_BIASA').length },
                { id: 'designer', label: t.tabDesigner, count: usersList.filter(u => u.role === 'DESIGNER').length },
                { id: 'sekolah', label: t.tabSekolahProfile, count: schoolsList.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'sekolah' ? 'Cari nama sekolah atau NPSN...' : 'Cari nama, email/username, atau nama sekolah...'}
              value={searchAccount}
              onChange={(e) => setSearchAccount(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Render Table Content */}
          {loading ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 size={24} className="animate-spin mx-auto mb-2" /> Memuat data akun...</div>
          ) : activeTab === 'sekolah' ? (
            /* Table Profil Sekolah & Akun Terikat */
            filteredSchools.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Tidak ada data sekolah ditemukan.</div>
            ) : (
              <div className="space-y-4">
                {filteredSchools.map((sch) => {
                  const adminUser = sch.users?.find((u: any) => u.role === 'ADMIN_SEKOLAH');
                  const teacherUsers = usersList.filter((u: any) => u.id_sekolah === sch.id && u.role === 'TENAGA_PENDIDIK');

                  return (
                    <div key={sch.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-[var(--foreground)] flex items-center gap-2">
                            <School size={18} className="text-[var(--primary)]" /> {sch.nama_sekolah}
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-mono">
                            NPSN: {sch.npsn || '—'} | {sch.alamat || 'Alamat tidak diisi'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="badge badge-blue text-xs">
                            {sch._count?.gurus || 0} {t.totalGuru} | {sch._count?.kelas || 0} {t.totalKelas}
                          </span>
                          <button
                            onClick={() => setSelectedSchool(sch)}
                            className="btn btn-outline text-xs py-1 px-3"
                          >
                            Detail Profil
                          </button>
                        </div>
                      </div>

                      {/* Linked Accounts in this School */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Admin Sekolah Card */}
                        <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] space-y-1.5">
                          <span className="font-bold text-[var(--muted-foreground)] text-[11px] uppercase tracking-wider block">
                            {t.tabAdminSekolah}
                          </span>
                          {adminUser ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-[var(--foreground)]">{adminUser.nama}</p>
                                <p className="font-mono text-[11px] text-[var(--muted-foreground)]">{adminUser.email}</p>
                              </div>
                              <span className={`badge ${adminUser.is_active ? 'badge-green' : 'badge-red'} text-[10px]`}>
                                {adminUser.is_active ? t.accountActive : t.accountInactive}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[var(--muted-foreground)] italic">—</span>
                          )}
                        </div>

                        {/* Tenaga Pendidik (Teachers) List */}
                        <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--muted-foreground)] text-[11px] uppercase tracking-wider">
                              {t.tabTenagaPendidik} ({teacherUsers.length})
                            </span>
                          </div>
                          {teacherUsers.length === 0 ? (
                            <p className="text-[11px] text-[var(--muted-foreground)] italic">Belum ada akun guru terikat di sekolah ini.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 divide-y divide-[var(--border)]">
                              {teacherUsers.map((tu: any) => (
                                <div key={tu.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-bold text-[var(--foreground)] truncate">{tu.nama}</p>
                                    <p className="font-mono text-[11px] text-[var(--muted-foreground)] truncate">{tu.email}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className={`badge ${tu.is_verified ? 'badge-green' : 'badge-amber'} text-[10px]`}>
                                      {tu.is_verified ? 'Verifikas' : 'Pending'}
                                    </span>
                                    <button
                                      onClick={() => handleToggleUserStatus(tu.id, tu.is_active)}
                                      disabled={togglingId === tu.id}
                                      className={`btn text-[10px] py-0.5 px-2 font-bold ${
                                        tu.is_active ? 'btn-danger' : 'btn-secondary text-emerald-600 border-emerald-500'
                                      }`}
                                    >
                                      {togglingId === tu.id ? <Loader2 size={10} className="animate-spin" /> : tu.is_active ? 'Off' : 'On'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Table Account List (Admin Sekolah / Tenaga Pendidik / User Biasa / Designer) */
            filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Tidak ada akun ditemukan di kategori ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Nama Pengguna</th>
                      <th>{t.usernameEmail}</th>
                      {activeTab !== 'user_biasa' && activeTab !== 'designer' && <th>Sekolah</th>}
                      <th>Status Verifikasi</th>
                      <th>{t.accountStatus}</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={u.id}>
                        <td className="font-mono text-xs text-muted-foreground">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="avatar w-8 h-8 bg-accent text-accent-foreground text-xs font-bold shrink-0">
                              {(u.nama || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground text-xs">{u.nama}</span>
                          </div>
                        </td>
                        <td><span className="font-mono text-xs font-semibold text-muted-foreground">{u.email}</span></td>
                        {activeTab !== 'user_biasa' && activeTab !== 'designer' && (
                          <td>
                            <span className="text-xs font-semibold text-foreground">
                              {u.sekolah?.nama_sekolah || '—'}
                            </span>
                          </td>
                        )}
                        <td>
                          {u.is_verified ? (
                            <span className="badge badge-green text-[11px]"><CheckCircle2 size={11} /> Terverifikasi</span>
                          ) : (
                            <span className="badge badge-amber text-[11px]"><AlertCircle size={11} /> Menunggu Verifikasi</span>
                          )}
                        </td>
                        <td>
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span> Nonaktif
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-end gap-1">
                            {/* Option to verify pending school directly */}
                            {u.role === 'ADMIN_SEKOLAH' && !u.is_verified && (
                              <button
                                onClick={() => handleVerifySchool(u.id)}
                                disabled={verifyingId === u.id}
                                className="btn btn-primary text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-none shrink-0"
                              >
                                {verifyingId === u.id ? <Loader2 size={12} className="animate-spin" /> : 'Verifikasi'}
                              </button>
                            )}

                            {/* Option to toggle account Active/Inactive status */}
                            {u.email !== 'superadmin@jadwale.id' && (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                disabled={togglingId === u.id}
                                className={`btn text-xs py-1 px-2.5 font-semibold ${
                                  u.is_active
                                    ? 'btn-danger'
                                    : 'btn-secondary text-emerald-600 border-emerald-500'
                                }`}
                              >
                                {togglingId === u.id ? <Loader2 size={12} className="animate-spin" /> : u.is_active ? t.deactivateBtn : t.activateBtn}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW UNTUK TENAGA PENDIDIK
  // ----------------------------------------------------
  if (role === 'TENAGA_PENDIDIK') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg">
          <h1 className="text-2xl font-extrabold mb-2">{lang === 'en' ? `Welcome, ${user?.nama}` : `Selamat Datang, ${user?.nama}`}</h1>
          <p className="text-blue-100 text-sm max-w-xl">
            {lang === 'en'
              ? 'You are registered as a Teacher. Access your weekly teaching timetable or view full school schedule below.'
              : 'Anda terdaftar sebagai Tenaga Pendidik. Gunakan menu di bawah untuk melihat jadwal khusus mengajar Anda selama seminggu atau jadwal lengkap sekolah.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/my-schedule" className="btn bg-white text-blue-700 hover:bg-blue-50 font-bold border-none text-xs px-4 py-2.5 inline-flex items-center gap-2">
              <CalendarDays size={16} /> {lang === 'en' ? 'My Teaching Schedule' : 'Lihat Jadwal Mengajar Saya'}
            </Link>
            <Link href="/dashboard/jadwal" className="btn bg-blue-700/60 hover:bg-blue-700 text-white font-bold border-none text-xs px-4 py-2.5 inline-flex items-center gap-2">
              <School size={16} /> {lang === 'en' ? 'School Schedule' : 'Lihat Jadwal Sekolah'}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-base mb-2 flex items-center gap-2"><CalendarDays className="text-primary" size={18} /> {lang === 'en' ? 'Weekly Teaching Schedule' : 'Jadwal Mengajar Minggu Ini'}</h3>
            <p className="text-xs text-muted-foreground mb-4">{lang === 'en' ? 'Access neat weekly grid for your assigned subjects and classes.' : 'Akses grid mingguan yang rapi khusus mata pelajaran dan kelas yang Anda ampu.'}</p>
            <Link href="/dashboard/my-schedule" className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
              {lang === 'en' ? 'Open My Schedule' : 'Buka Jadwal Saya'} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-base mb-2 flex items-center gap-2"><Share2 className="text-emerald-500" size={18} /> {lang === 'en' ? 'Share Timetable' : 'Bagikan Jadwal'}</h3>
            <p className="text-xs text-muted-foreground mb-4">{lang === 'en' ? 'Share school schedule view with students or parents.' : 'Anda dapat membagikan tampilan jadwal sekolah kepada siswa atau wali murid.'}</p>
            <button onClick={handleShare} disabled={shareLoading} className="btn btn-outline text-xs inline-flex items-center gap-2">
              {shareLoading ? <Loader2 size={14} className="animate-spin" /> : copied ? <><CheckCircle2 size={14} /> {t.copiedLink}</> : <><Share2 size={14} /> {t.createShareLink}</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW UNTUK USER BIASA (WALI MURID / UMUM)
  // ----------------------------------------------------
  if (role === 'USER_BIASA') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card p-6 bg-card border border-border rounded-2xl shadow-sm">
          <h1 className="text-xl font-bold mb-2">{lang === 'en' ? `Hello, ${user?.nama}` : `Halo, ${user?.nama}`}</h1>
          <p className="text-muted-foreground text-sm">
            {lang === 'en'
              ? 'Welcome to Jadwale platform. You can view schedules shared by schools or teachers.'
              : 'Selamat datang di platform Jadwale. Anda dapat melihat jadwal pelajaran yang di-share oleh pihak sekolah atau guru melalui link penerimaan.'}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW UNTUK DESIGNER
  // ----------------------------------------------------
  if (role === 'DESIGNER') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl">
          <h1 className="text-2xl font-extrabold mb-2">{lang === 'en' ? 'Template Designer Studio' : 'Studio Template Designer'}</h1>
          <p className="text-purple-100 text-sm">
            {lang === 'en'
              ? 'Create and manage schedule template designs for schools across the platform.'
              : 'Buat dan kelola desain template jadwal yang dapat digunakan oleh sekolah-sekolah di seluruh platform.'}
          </p>
          <div className="mt-4">
            <Link href="/dashboard/designer" className="btn bg-white text-purple-700 hover:bg-purple-50 font-bold border-none text-xs px-4 py-2.5 inline-flex items-center gap-2">
              <Sparkles size={16} /> {lang === 'en' ? 'Manage Template Designs' : 'Kelola Template Desain'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW UNTUK ADMIN SEKOLAH (DEFAULT)
  // ----------------------------------------------------
  const masterData = [
    {
      label: t.totalGuru,
      value: stats.guru,
      icon: Users,
      href: '/dashboard/guru',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      desc: t.descGuru,
    },
    {
      label: t.totalKelas,
      value: stats.kelas,
      icon: GraduationCap,
      href: '/dashboard/kelas',
      color: '#059669',
      bgColor: '#ECFDF5',
      desc: t.descKelas,
    },
    {
      label: t.totalMapel,
      value: stats.mapel,
      icon: BookOpen,
      href: '/dashboard/mapel',
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      desc: t.descMapel,
    },
    {
      label: t.totalJadwal,
      value: stats.jadwal,
      icon: CalendarDays,
      href: '/dashboard/jadwal',
      color: '#D97706',
      bgColor: '#FFFBEB',
      desc: t.descJadwal,
    },
  ];

  const quickActions = [
    {
      title: t.actionGenerateTitle,
      desc: t.actionGenerateDesc,
      href: '/dashboard/jadwal',
      icon: CalendarDays,
      primary: true,
    },
    {
      title: t.actionGuruTitle,
      desc: t.actionGuruDesc,
      href: '/dashboard/guru',
      icon: Users,
    },
    {
      title: t.actionKelasTitle,
      desc: t.actionKelasDesc,
      href: '/dashboard/kelas',
      icon: GraduationCap,
    },
    {
      title: t.actionMapelTitle,
      desc: t.actionMapelDesc,
      href: '/dashboard/mapel',
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-xl sm:text-2xl">
            {greeting()}, {user?.nama?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="page-subtitle mt-1">
            {t.welcomeDashboard}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`badge ${stats.jadwal > 0 ? 'badge-green' : 'badge-gray'}`}
          >
            {stats.jadwal > 0 ? (
              <><CheckCircle2 size={12} /> {t.scheduleActive}</>
            ) : (
              t.noSchedule
            )}
          </span>
        </div>
      </div>

      {/* Pending Teacher Approval Alert for School Admin */}
      {pendingTeachers.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-foreground space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-amber-950 dark:text-amber-300">
              <Users size={18} /> {lang === 'en' ? `Pending Teacher Verification Requests (${pendingTeachers.length})` : `Permohonan Verifikasi Tenaga Pendidik (${pendingTeachers.length})`}
            </h3>
          </div>

          <div className="divide-y divide-amber-500/20">
            {pendingTeachers.map((pt) => (
              <div key={pt.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">{pt.nama}</span> ({pt.email})
                  {pt.guru?.nip && <span className="text-muted-foreground ml-2">NIP: {pt.guru.nip}</span>}
                </div>
                <button
                  onClick={() => handleVerifyTeacher(pt.id)}
                  disabled={verifyingTeacherId === pt.id}
                  className="btn btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700 border-none shrink-0 inline-flex items-center gap-1"
                >
                  {verifyingTeacherId === pt.id ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12} /> {lang === 'en' ? 'Approve Teacher' : 'Setujui Guru'}</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {masterData.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="block">
              <div className="card p-3.5 sm:p-5 cursor-pointer hover:shadow-md transition-all group h-full">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3"
                  style={{ backgroundColor: item.bgColor, color: item.color }}
                >
                  <Icon size={20} />
                </div>
                {loading ? (
                  <div className="skeleton h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] leading-none">
                    {item.value}
                  </p>
                )}
                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] mt-1">{item.label}</p>
                <p className="hidden sm:block text-xs text-[var(--muted-foreground)] mt-0.5">{item.desc}</p>
                <div
                  className="flex items-center gap-1 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: item.color }}
                >
                  {t.manage} <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions + Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Quick Actions */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-700 text-[var(--foreground)] flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--primary)]" />
              {t.quickActions}
            </h2>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              const accentStyles = [
                { bg: 'bg-primary/10', text: 'text-primary', border: 'hover:border-primary/50' },
                { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-500/50' },
                { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'hover:border-purple-500/50' },
                { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'hover:border-amber-500/50' },
              ];
              const style = accentStyles[i % accentStyles.length];

              return (
                <Link key={action.title} href={action.href}>
                  <div className={`flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]/40 ${style.border} shadow-sm hover:shadow-md transition-all cursor-pointer group h-full`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                        {action.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-snug">
                        {action.desc}
                      </p>
                    </div>
                    <ArrowRight size={15} className="ml-auto text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Export & Share Tools */}
        <div className="card p-5">
          <h2 className="text-sm font-700 text-[var(--foreground)] flex items-center gap-2 mb-4">
            <Download size={16} className="text-[var(--primary)]" />
            {t.exportShare}
          </h2>

          <div className="space-y-2.5">
            <button
              onClick={() => handleDownload('pdf')}
              className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:border-red-800 dark:hover:text-red-400 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Download size={15} />
              </div>
              <div>
                <p className="text-sm font-600 text-[var(--foreground)]">{t.downloadPdf}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.pdfReady}</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => handleDownload('excel')}
              className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-800 dark:hover:text-emerald-400 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Download size={15} />
              </div>
              <div>
                <p className="text-sm font-600 text-[var(--foreground)]">{t.downloadExcel}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.excelFormat}</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <hr className="divider my-1" />

            {/* Share Link */}
            <div>
              {shareLink && (
                <div className="flex items-center gap-2 mb-2 p-2.5 bg-[var(--accent)] border border-[var(--border)] rounded-lg">
                  <LinkIcon size={13} className="text-[var(--primary)] shrink-0" />
                  <span className="text-xs font-mono text-[var(--foreground)] truncate flex-1">{shareLink}</span>
                </div>
              )}
              <button
                onClick={handleShare}
                disabled={shareLoading}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-white'
                }`}
              >
                {shareLoading
                  ? <Loader2 size={15} className="animate-spin" />
                  : copied
                  ? <><CheckCircle2 size={15} /> {t.copiedLink}</>
                  : <><Share2 size={15} /> {t.createShareLink}</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
