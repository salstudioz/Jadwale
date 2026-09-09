'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  compact?: boolean;
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { lang, setLang, toggleLang } = useLanguageStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ width: compact ? 36 : 96, height: 32 }} />;
  }

  if (compact) {
    return (
      <button
        onClick={toggleLang}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
          padding: '0.375rem 0.5rem',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--foreground)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.75rem',
          transition: 'all 0.15s ease',
        }}
        title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      >
        <Globe size={13} style={{ color: 'var(--primary)' }} />
        <span>{lang.toUpperCase()}</span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 2,
        gap: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      title={lang === 'id' ? 'Bahasa Indonesia (Aktif)' : 'English (Active)'}
    >
      <button
        type="button"
        onClick={() => setLang('id')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.625rem',
          borderRadius: 16,
          border: 'none',
          background: lang === 'id' ? 'var(--primary)' : 'transparent',
          color: lang === 'id' ? '#FFFFFF' : 'var(--muted-foreground)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.75rem',
          transition: 'all 0.2s ease',
        }}
      >
        <span>ID</span>
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.625rem',
          borderRadius: 16,
          border: 'none',
          background: lang === 'en' ? 'var(--primary)' : 'transparent',
          color: lang === 'en' ? '#FFFFFF' : 'var(--muted-foreground)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.75rem',
          transition: 'all 0.2s ease',
        }}
      >
        <span>EN</span>
      </button>
    </div>
  );
}
