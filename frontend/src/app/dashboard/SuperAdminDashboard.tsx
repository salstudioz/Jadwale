'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
  ShieldCheck, Users, School, AlertCircle, Sparkles, UserPlus, Check, X, Loader2, Search, CheckCircle2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [pendingSchools, setPendingSchools] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'admin_sekolah' | 'tenaga_pendidik' | 'user_biasa' | 'designer' | 'sekolah'>('admin_sekolah');
  const [searchAccount, setSearchAccount] = useState('');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [designerForm, setDesignerForm] = useState({ nama: '', email: '', password: '' });
  const [designerLoading, setDesignerLoading] = useState(false);
  const [designerSuccess, setDesignerSuccess] = useState('');
  const [designerError, setDesignerError] = useState('');

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperadminData();
  }, []);

  const handleVerifySchool = async (id: number) => {
    setVerifyingId(id);
    try {
      await api.post(`/admin/verify-school/${id}`);
      setPendingSchools((prev) => prev.filter((s) => s.id !== id));
      fetchSuperadminData();
    } catch {
      alert('Gagal memverifikasi sekolah');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleToggleUserStatus = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      await api.put(`/admin/users/${id}/status`, { is_active: !currentStatus });
      setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !currentStatus } : u)));
    } catch {
      alert('Gagal mengubah status akun.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    setDesignerLoading(true);
    setDesignerSuccess('');
    setDesignerError('');

    try {
      await api.post('/admin/designers', designerForm);
      setDesignerSuccess(`Akun Designer untuk ${designerForm.nama} berhasil dibuat!`);
      setDesignerForm({ nama: '', email: '', password: '' });
      fetchSuperadminData();
      setTimeout(() => setShowDesignerModal(false), 2000);
    } catch (err: any) {
      setDesignerError(err.response?.data?.message || 'Gagal membuat akun Designer.');
    } finally {
      setDesignerLoading(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.nama || '').toLowerCase().includes(searchAccount.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchAccount.toLowerCase()) ||
      (u.sekolah?.nama_sekolah || '').toLowerCase().includes(searchAccount.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'admin_sekolah') return u.role === 'ADMIN_SEKOLAH';
    if (activeTab === 'tenaga_pendidik') return u.role === 'TENAGA_PENDIDIK';
    if (activeTab === 'user_biasa') return u.role === 'USER_BIASA';
    if (activeTab === 'designer') return u.role === 'DESIGNER';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-700" /> Superadmin Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Pengelolaan platform global, verifikasi pendaftaran sekolah, dan akun pengguna.
          </p>
        </div>

        <button
          onClick={() => setShowDesignerModal(true)}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-md transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Buat Akun Designer
        </button>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Akun</span>
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{usersList.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Seluruh akun terdaftar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Sekolah Terdaftar</span>
            <School className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{schoolsList.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Sekolah aktif di platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Pending Verifikasi</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingSchools.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Menunggu persetujuan</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Designer</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {usersList.filter((u) => u.role === 'DESIGNER').length}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Akun Designer aktif</p>
        </div>
      </div>

      {/* Pending School Verification Table */}
      {pendingSchools.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
            <h2 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Sekolah Menunggu Verifikasi ({pendingSchools.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            {pendingSchools.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{s.sekolah?.nama_sekolah || 'Sekolah Baru'}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Admin: {s.nama} ({s.email}) | NPSN: {s.sekolah?.npsn || '-'}
                  </p>
                </div>
                <button
                  onClick={() => handleVerifySchool(s.id)}
                  disabled={verifyingId === s.id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs inline-flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  {verifyingId === s.id ? 'Memproses...' : 'Setujui Sekolah'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Accounts Management Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Daftar Akun Pengguna</h3>

          {/* Role Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-md text-xs font-semibold overflow-x-auto">
            {[
              { id: 'admin_sekolah', label: 'Admin Sekolah' },
              { id: 'tenaga_pendidik', label: 'Guru' },
              { id: 'user_biasa', label: 'Umum' },
              { id: 'designer', label: 'Designer' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-700 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchAccount}
          onChange={(e) => setSearchAccount(e.target.value)}
          className="w-full px-3 py-2 text-xs border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
        />

        {/* User Table */}
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Memuat data pengguna...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">Tidak ada akun ditemukan.</div>
        ) : (
          <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold sticky top-0">
                <tr>
                  <th className="p-2.5 border-b w-10 text-center">No</th>
                  <th className="p-2.5 border-b">Nama</th>
                  <th className="p-2.5 border-b">Email</th>
                  <th className="p-2.5 border-b">Sekolah</th>
                  <th className="p-2.5 border-b text-center">Status</th>
                  <th className="p-2.5 border-b text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50">
                    <td className="p-2.5 text-center text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-semibold text-gray-900 dark:text-white">{u.nama}</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-400 font-mono">{u.email}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{u.sekolah?.nama_sekolah || '-'}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                        disabled={togglingId === u.id}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                      >
                        {togglingId === u.id ? '...' : u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Designer Modal */}
      {showDesignerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Buat Akun Designer Baru</h3>
              <button onClick={() => setShowDesignerModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {designerSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-md">{designerSuccess}</div>}
            {designerError && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md">{designerError}</div>}

            <form onSubmit={handleCreateDesigner} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Nama Lengkap *</label>
                <input
                  type="text" required
                  value={designerForm.nama} onChange={(e) => setDesignerForm({ ...designerForm, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email *</label>
                <input
                  type="email" required
                  value={designerForm.email} onChange={(e) => setDesignerForm({ ...designerForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Password *</label>
                <input
                  type="password" required minLength={6}
                  value={designerForm.password} onChange={(e) => setDesignerForm({ ...designerForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowDesignerModal(false)} className="px-3 py-2 border rounded text-xs">
                  Batal
                </button>
                <button type="submit" disabled={designerLoading} className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded">
                  {designerLoading ? 'Membuat...' : 'Buat Akun Designer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
