'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, CalendarDays, School,
  ChevronLeft, ChevronRight, LogOut, LogIn, GraduationCap, Sun, Moon,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../store/useLanguageStore';
import { useTheme } from 'next-themes';
import LanguageToggle from './LanguageToggle';
import BrandLogo from './BrandLogo';

function ThemeBtn({ collapsed }: { collapsed: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9" />;

  const label = theme === 'dark' ? t.themeLight : t.themeDark;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
        padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none',
        background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground)',
        fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-item-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; }}
      title={label}
    >
      {theme === 'dark'
        ? <Sun size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
        : <Moon size={18} style={{ flexShrink: 0 }} />}
      {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </button>
  );
}

/** Desktop-only sidebar. Hidden on mobile via CSS. */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

  const role = (user?.email === 'superadmin@jadwale.id' || user?.role === 'SUPER_ADMIN')
    ? 'SUPER_ADMIN'
    : user?.role || (user?.is_admin ? 'ADMIN_SEKOLAH' : 'USER_BIASA');

  let menuGroups = [
    {
      group: t.menuUtama,
      items: [
        { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, exact: true },
        { name: t.jadwal, path: '/dashboard/jadwal', icon: CalendarDays },
      ],
    },
    {
      group: t.masterData,
      items: [
        { name: t.sekolah, path: '/dashboard/sekolah', icon: School },
        { name: t.guru, path: '/dashboard/guru', icon: Users },
        { name: t.kelas, path: '/dashboard/kelas', icon: GraduationCap },
        { name: t.mapel, path: '/dashboard/mapel', icon: BookOpen },
      ],
    },
  ];

  if (role === 'SUPER_ADMIN') {
    menuGroups = [
      {
        group: t.superadminGroup,
        items: [
          { name: t.summaryVerification, path: '/dashboard', icon: LayoutDashboard, exact: true },
        ],
      },
    ];
  } else if (role === 'TENAGA_PENDIDIK') {
    menuGroups = [
      {
        group: t.teacherAreaGroup,
        items: [
          { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, exact: true },
          { name: t.myTeachingSchedule, path: '/dashboard/my-schedule', icon: CalendarDays },
          { name: t.viewSchoolSchedule, path: '/dashboard/jadwal', icon: School },
        ],
      },
    ];
  } else if (role === 'USER_BIASA') {
    menuGroups = [
      {
        group: t.publicAreaGroup,
        items: [
          { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, exact: true },
        ],
      },
    ];
  } else if (role === 'DESIGNER') {
    menuGroups = [
      {
        group: t.designerGroup,
        items: [
          { name: t.templateManagement, path: '/dashboard/designer', icon: LayoutDashboard, exact: true },
        ],
      },
    ];
  }


  return (
    <aside
      className="hidden md:flex flex-col shrink-0 relative z-20 h-screen transition-all duration-200"
      style={{
        width: collapsed ? 68 : 240,
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: '1px 0 0 0 var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          padding: '1rem 0.875rem', borderBottom: '1px solid var(--sidebar-border)', minHeight: 64,
        }}
      >
        <BrandLogo href="/dashboard" size={collapsed ? 'sm' : 'md'} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', right: -12, top: '4.5rem',
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--card)', border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--muted-foreground)', zIndex: 30,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.75rem 0.5rem' }}>
        {menuGroups.map((group) => (
          <div key={group.group} style={{ marginBottom: '1.25rem' }}>
            {!collapsed && (
              <div style={{
                padding: '0 0.75rem', marginBottom: '0.375rem',
                fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--muted-foreground)',
              }}>
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.path, item.exact);
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} title={collapsed ? item.name : undefined} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    marginBottom: '0.125rem', cursor: 'pointer',
                    background: active ? 'var(--sidebar-item-active)' : 'transparent',
                    color: active ? 'var(--sidebar-item-active-text)' : 'var(--muted-foreground)',
                    fontWeight: active ? 600 : 500, fontSize: '0.875rem',
                    transition: 'background 0.12s, color 0.12s',
                  }}>
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <>
                        <span style={{ whiteSpace: 'nowrap', lineHeight: 1 }}>{item.name}</span>
                        {active && (
                          <span style={{
                            marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--primary)', flexShrink: 0,
                          }} />
                        )}
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {!collapsed && user && (
          <div style={{ padding: '0.375rem 0.75rem 0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.nama || user.email}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        )}
        
        {/* Language Switcher in Sidebar */}
        <div style={{ padding: '0.25rem 0.5rem', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <LanguageToggle compact={collapsed} />
        </div>

        <ThemeBtn collapsed={collapsed} />
        
        {user ? (
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
              padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none',
              background: 'transparent', cursor: 'pointer', color: '#EF4444',
              fontSize: '0.875rem', fontWeight: 500,
            }}
            title={collapsed ? t.logout : undefined}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{t.logout}</span>}
          </button>
        ) : (
          <Link
            href="/login"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
              padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none',
              background: 'transparent', cursor: 'pointer', color: 'var(--primary)',
              fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
            }}
            title={collapsed ? t.login : undefined}
          >
            <LogIn size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{t.login}</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
