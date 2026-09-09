'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  School,
  Users,
  BookOpen,
  User,
  LogOut,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../store/useLanguageStore';
import { useTheme } from 'next-themes';

import BrandLogo from './BrandLogo';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;
  const { theme, setTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  // Hide on non-dashboard routes
  if (!pathname.startsWith('/dashboard')) return null;

  const role = (user?.email === 'superadmin@jadwale.id' || user?.role === 'SUPER_ADMIN')
    ? 'SUPER_ADMIN'
    : user?.role || (user?.is_admin ? 'ADMIN_SEKOLAH' : 'USER_BIASA');

  let tabs: { name: string; path: string; icon: any; exact?: boolean; isAction?: boolean }[] = [
    { name: t.home, path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: t.jadwal, path: '/dashboard/jadwal', icon: CalendarDays },
    { name: t.sekolah, path: '/dashboard/sekolah', icon: School },
    { name: t.guru, path: '/dashboard/guru', icon: Users },
    { name: t.mapel, path: '/dashboard/mapel', icon: BookOpen },
  ];

  if (role === 'SUPER_ADMIN') {
    tabs = [
      { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, exact: true },
      { name: t.myAccountMobile, path: '#account', icon: User, isAction: true },
    ];
  } else if (role === 'TENAGA_PENDIDIK') {
    tabs = [
      { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, exact: true },
      { name: t.myTeachingSchedule, path: '/dashboard/my-schedule', icon: CalendarDays },
      { name: t.viewSchoolSchedule, path: '/dashboard/jadwal', icon: School },
      { name: t.myAccountMobile, path: '#account', icon: User, isAction: true },
    ];
  } else if (role === 'USER_BIASA') {
    tabs = [
      { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, exact: true },
      { name: t.myAccountMobile, path: '#account', icon: User, isAction: true },
    ];
  } else if (role === 'DESIGNER') {
    tabs = [
      { name: t.templateManagement, path: '/dashboard/designer', icon: LayoutDashboard, exact: true },
      { name: t.myAccountMobile, path: '#account', icon: User, isAction: true },
    ];
  }

  const roleLabel = (user?.email === 'superadmin@jadwale.id' || user?.role === 'SUPER_ADMIN')
    ? 'Superadmin'
    : user?.role === 'ADMIN_SEKOLAH' || user?.is_admin
    ? 'Admin Sekolah'
    : user?.role === 'TENAGA_PENDIDIK'
    ? 'Tenaga Pendidik'
    : user?.role === 'DESIGNER'
    ? 'Designer'
    : 'User Biasa';

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
        style={{
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const active = !tab.isAction && isActive(tab.path, tab.exact);
            const Icon = tab.icon;
            if (tab.isAction) {
              return (
                <button
                  key={tab.name}
                  onClick={() => setMenuOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative border-none bg-transparent"
                  style={{
                    color: 'var(--muted-foreground)',
                    minHeight: 56,
                  }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                  <span className="text-[10px] leading-none font-semibold">{tab.name}</span>
                </button>
              );
            }
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
                style={{
                  color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                  minHeight: 56,
                  transition: 'color 0.15s',
                }}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: 'var(--primary)' }}
                  />
                )}
                <Icon
                  size={active ? 22 : 20}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ transition: 'all 0.15s' }}
                />
                <span
                  className="text-[10px] leading-none truncate max-w-[64px]"
                  style={{ fontWeight: active ? 700 : 500 }}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile User Profile & Logout Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-[var(--card)] border-t border-[var(--border)] rounded-t-2xl p-5 space-y-4 shadow-2xl animate-slide-in max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 16px))' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <BrandLogo href="/dashboard" size="sm" />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--muted)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-3.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[var(--foreground)]">{user?.nama || 'User'}</span>
                <span className="badge badge-blue text-[10px] font-bold">{roleLabel}</span>
              </div>
              <p className="text-xs font-mono text-[var(--muted-foreground)] truncate">{user?.email}</p>
              {user?.sekolah?.nama_sekolah && (
                <p className="text-xs text-[var(--primary)] font-semibold flex items-center gap-1 pt-1">
                  <School size={12} /> {user.sekolah.nama_sekolah}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)]"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
                  {theme === 'dark' ? t.themeLight : t.themeDark}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full btn btn-danger text-xs py-3 font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
