'use client';

import { useWizardStore } from '../../../store/useWizardStore';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import { Building2, Hash, Type } from 'lucide-react';
import { clsx } from 'clsx';

export default function Step1Config() {
  const { is_parallel, class_naming, tingkatan_count, kelas_per_tingkatan, setConfig } = useWizardStore();
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t.step1Title}</h2>
        <p className="text-foreground/70 text-base">{t.step1Desc}</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Parallel Config */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-foreground">{t.parallelSystem}</span>
                <span className="text-sm text-foreground/70">{t.parallelDesc}</span>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-foreground/20">
              <input
                type="checkbox"
                className="sr-only"
                checked={is_parallel}
                onChange={(e) => setConfig({ is_parallel: e.target.checked })}
              />
              <span className={clsx("inline-block h-6 w-11 rounded-full transition-colors", is_parallel ? "bg-primary" : "bg-foreground/20")}>
                <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ml-1", is_parallel ? "translate-x-5" : "translate-x-0")} />
              </span>
            </div>
          </label>
        </div>

        {/* Naming Config */}
        <div className="space-y-3">
          <label className="font-bold text-sm block">{t.classNaming}</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setConfig({ class_naming: 'alphabet' })}
              disabled={!is_parallel}
              className={clsx(
                "flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                class_naming === 'alphabet' ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-foreground/5",
                !is_parallel && "opacity-50 cursor-not-allowed"
              )}
            >
              <Type className="w-5 h-5 text-foreground/60" />
              <div>
                <span className="font-bold block">{t.alphabet}</span>
                <span className="text-xs text-foreground/70">{t.alphabetExample}</span>
              </div>
            </button>
            <button
              onClick={() => setConfig({ class_naming: 'number' })}
              disabled={!is_parallel}
              className={clsx(
                "flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                class_naming === 'number' ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-foreground/5",
                !is_parallel && "opacity-50 cursor-not-allowed"
              )}
            >
              <Hash className="w-5 h-5 text-foreground/60" />
              <div>
                <span className="font-bold block">{t.numberLabel}</span>
                <span className="text-xs text-foreground/70">{t.numberExample}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Count Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="font-bold text-sm block">{t.tingkatanCount}</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="6"
                value={tingkatan_count}
                onChange={(e) => setConfig({ tingkatan_count: parseInt(e.target.value) || 1 })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground/60 pointer-events-none">{t.gradeSuffix}</span>
            </div>
          </div>
          
          {is_parallel && (
            <div className="space-y-2">
              <label className="font-bold text-sm block">{t.avgClassesPerGrade}</label>
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={kelas_per_tingkatan}
                  onChange={(e) => setConfig({ kelas_per_tingkatan: parseInt(e.target.value) || 2 })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Preview */}
        <div className="mt-8 p-6 bg-card border border-border rounded-xl">
          <h3 className="font-bold text-primary mb-3 text-sm tracking-wide uppercase">{t.previewFormat}</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: tingkatan_count }).map((_, i) => {
              const tgkt = i + 1;
              if (!is_parallel) {
                return <span key={tgkt} className="px-3 py-1.5 bg-background border border-border rounded text-sm font-bold shadow-sm">{t.kelas} {tgkt}</span>;
              }
              return Array.from({ length: kelas_per_tingkatan }).map((_, j) => {
                const suffix = class_naming === 'alphabet' ? String.fromCharCode(65 + j) : `-${j + 1}`;
                return <span key={`${tgkt}${suffix}`} className="px-3 py-1.5 bg-background border border-border rounded text-sm font-bold shadow-sm">{tgkt}{suffix}</span>;
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
