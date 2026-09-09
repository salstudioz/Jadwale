'use client';

import { useState, useEffect } from 'react';
import { Users, School, Calendar, Share2, Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSekolah: 0,
    totalJadwal: 0,
    totalShare: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const statCards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'bg-primary text-white' },
    { label: 'Total Sekolah', value: stats.totalSekolah, icon: School, color: 'bg-green-700 text-white' },
    { label: 'Total Jadwal Dibuat', value: stats.totalJadwal, icon: Calendar, color: 'bg-indigo-700 text-white' },
    { label: 'Link Jadwal Dibagikan', value: stats.totalShare, icon: Share2, color: 'bg-orange-600 text-white' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 bg-card border border-border p-4 rounded-xl">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Super Console</h1>
          <p className="text-foreground/70 text-sm">Manajemen global pengguna dan sistem Jadwale.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card p-6 rounded-xl flex items-center gap-4 border border-border shadow-sm"
            >
              <div className={`p-4 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-foreground/70 font-bold">{stat.label}</p>
                <h3 className="text-2xl font-extrabold text-foreground">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-4">Manajemen Pengguna</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-foreground uppercase text-xs font-bold border-y border-border">
                <th className="p-4">Nama</th>
                <th className="p-4">Email</th>
                <th className="p-4">Sekolah</th>
                <th className="p-4">Peran</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-foreground/5 transition-colors">
                  <td className="p-4 font-bold text-foreground">{user.nama}</td>
                  <td className="p-4 text-foreground/70 font-medium">{user.email}</td>
                  <td className="p-4 text-foreground/70 font-medium">{user.sekolah?.nama_sekolah || '-'}</td>
                  <td className="p-4">
                    {user.is_admin ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs font-bold">SUPER</span>
                    ) : (
                      <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-bold">ADMIN SEKOLAH</span>
                    )}
                  </td>
                  <td className="p-4">
                    {user.is_active ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                        <Check size={16} /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-bold">
                        <X size={16} /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      disabled={user.is_admin} // Cannot disable other super admins easily
                      className={`px-4 py-2 rounded text-sm font-bold transition-colors border ${
                        user.is_active 
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      } ${user.is_admin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-foreground/60 font-bold">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
