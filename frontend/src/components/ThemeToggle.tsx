'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ collapsed, iconOnly }: { collapsed?: boolean; iconOnly?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={iconOnly ? "w-9 h-9" : "w-full h-10"} />;

  const isDark = theme === 'dark';
  const label = isDark ? 'Light Mode' : 'Dark Mode';

  if (iconOnly) {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="p-2 rounded-lg text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center justify-center"
        title={label}
        aria-label={label}
      >
        {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-600 dark:text-slate-300" />}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-foreground/70 hover:bg-white/5 hover:text-foreground transition-colors text-sm font-medium"
    >
      {isDark ? <Sun size={18} className="text-yellow-500 shrink-0" /> : <Moon size={18} className="text-slate-600 dark:text-slate-300 shrink-0" />}
      {!collapsed && (
        <span className="whitespace-nowrap font-medium">
          {label}
        </span>
      )}
    </button>
  );
}
