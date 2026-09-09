'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, LogIn, UserPlus, LayoutDashboard, Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../store/useLanguageStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Dashboard layout has its own MobileBottomNav
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  // Items for Guest users
  const guestNavItems = [
    { label: t.home, icon: Home, href: '/' },
    { label: t.makeSchedule, icon: CalendarDays, href: '/wizard' },
    { label: t.login, icon: LogIn, href: '/login' },
    { label: t.registerNow, icon: UserPlus, href: '/register' },
  ];

  // Items for Logged In users on non-dashboard pages (e.g. /wizard, /admin)
  const userNavItems = [
    { label: t.home, icon: Home, href: '/' },
    { label: t.dashboard, icon: LayoutDashboard, href: '/dashboard' },
    { label: t.makeSchedule, icon: CalendarDays, href: '/wizard' },
    ...(user?.is_admin ? [{ label: 'Admin', icon: Users, href: '/admin' }] : []),
  ];

  const items = user ? userNavItems : guestNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md pb-safe">
      <nav className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-decoration-none transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
