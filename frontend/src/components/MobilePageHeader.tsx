'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  School,
  Users,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  LogOut,
  User,
  Moon,
  Sun,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../store/useLanguageStore';
import { useTheme } from 'next-themes';
import LanguageToggle from './LanguageToggle';

export default function MobilePageHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;
  const { theme, setTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  if (!pathname.startsWith('/dashboard')) return null;

  const pageMeta: Record<string, { titleKey: keyof typeof t; icon: any; back?: string }> = {
    '/dashboard': { titleKey: 'home', icon: LayoutDashboard },
    '/dashboard/jadwal': { titleKey: 'jadwal', icon: CalendarDays },
    '/dashboard/sekolah': { titleKey: 'sekolah', icon: School },
    '/dashboard/guru': { titleKey: 'guru', icon: Users },
    '/dashboard/kelas': { titleKey: 'kelas', icon: GraduationCap, back: '/dashboard' },
    '/dashboard/mapel': { titleKey: 'mapel', icon: BookOpen },
    '/dashboard/my-schedule': { titleKey: 'myTeachingSchedule', icon: CalendarDays, back: '/dashboard' },
    '/dashboard/designer': { titleKey: 'templateManagement', icon: LayoutDashboard, back: '/dashboard' },
  };

  const meta = pageMeta[pathname];
  const Icon = meta?.icon || LayoutDashboard;
  const title = meta ? (t[meta.titleKey] || String(meta.titleKey)) : 'Dashboard';

  const roleLabel = (user?.email === 'superadmin@jadwale.id' || user?.role === 'SUPER_ADMIN')
    ? 'Superadmin'
    : user?.role === 'ADMIN_SEKOLAH' || user?.is_admin
    ? 'Admin Sekolah'
    : user?.role === 'TENAGA_PENDIDIK'
    ? 'Tenaga Pendidik'
    : user?.role === 'DESIGNER'
    ? 'Designer'
    : 'User Biasa';

  return (
    <>
      <header
        className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 shadow-sm"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {meta?.back && (
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1 rounded-lg hover:bg-[var(--muted)]"
              style={{ color: 'var(--primary)' }}
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            <Icon size={15} />
          </div>
          <h1
            className="text-base font-bold leading-none truncate"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle compact />
          
          <button
            onClick={() => setMenuOpen(true)}
            className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xs flex items-center justify-center border border-[var(--border)]"
          >
            {(user?.nama || '?').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Mobile User Profile & Logout Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-[var(--card)] border-t border-[var(--border)] rounded-t-2xl p-5 space-y-4 shadow-2xl animate-slide-in max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 16px))' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-extrabold text-base text-[var(--foreground)] flex items-center gap-2">
                <User size={18} className="text-[var(--primary)]" /> {t.mobileMenuTitle}
              </h3>
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
