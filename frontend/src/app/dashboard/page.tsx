'use client';

import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import AdminDashboard from './AdminDashboard';
import GuruDashboard from './GuruDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const role = (user?.email === 'superadmin@jadwale.id' || user?.role === 'SUPER_ADMIN')
    ? 'SUPER_ADMIN'
    : user?.role || (user?.is_admin ? 'ADMIN_SEKOLAH' : 'USER_BIASA');

  if (role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  if (role === 'TENAGA_PENDIDIK') {
    return <GuruDashboard user={user} />;
  }

  // Default to Admin Sekolah Dashboard
  return <AdminDashboard user={user} />;
}
