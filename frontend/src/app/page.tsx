'use client';

import Link from 'next/link';
import { Book, Clock, Users, ArrowRight, Zap } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import BrandLogo from '../components/BrandLogo';
import { useLanguageStore, TRANSLATIONS } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Home() {
  const lang = useLanguageStore((s) => s.lang);
  const user = useAuthStore((s) => s.user);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const features = [
    { icon: <Clock className="w-6 h-6 text-orange-600" />, title: t.feature1Title, desc: t.feature1Desc },
    { icon: <Book className="w-6 h-6 text-green-700" />, title: t.feature2Title, desc: t.feature2Desc },
    { icon: <Users className="w-6 h-6 text-blue-700" />, title: t.feature3Title, desc: t.feature3Desc },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between pb-16 md:pb-0">
      {/* Navbar - Solid with Bottom Border */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-card sticky top-0 z-30">
        <BrandLogo href="/" size="md" />
        
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle compact />
          <ThemeToggle iconOnly />
          {user ? (
            <Link href="/dashboard" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              {t.dashboard}
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors">
                {t.login}
              </Link>
              <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                {t.registerNow}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-start justify-center px-6 md:px-12 lg:px-24 py-16 max-w-7xl mx-auto w-full min-h-[50vh]">
        <div className="max-w-2xl">
          
          {/* Clean Public Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Zap size={14} />
            <span className="text-xs font-bold">{t.versionUpdate}</span>
          </div>

          {/* Superadmin Status Info */}
          {user?.role === 'SUPER_ADMIN' && (
            <div className="mb-6 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300 text-xs font-mono font-bold flex items-center justify-between">
              <span>{t.superadminOnlyInfo}: Backend Online</span>
              <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded text-[10px]">Superadmin</span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-lg text-foreground/80 mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/wizard">
              <button className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-primary text-white rounded-lg font-bold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                {t.makeScheduleNow}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-card border border-border text-foreground rounded-lg font-bold text-base hover:bg-foreground/5 transition-colors flex items-center justify-center">
                {t.enterDashboard}
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Cards */}
      <section className="px-6 md:px-12 lg:px-24 py-16 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl border border-border bg-background flex flex-col justify-start"
              >
                <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{feat.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
