'use client';

import { useWizardStore } from '../../../store/useWizardStore';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import { Clock, Plus, Trash2, CalendarDays, Activity } from 'lucide-react';
import { clsx } from 'clsx';

export default function Step2Waktu() {
  const { 
    school_days, start_time, duration_per_jp, has_routine, routine_duration, has_monday_ceremony, istirahat, setWaktu,
    is_parallel, class_naming, tingkatan_count, kelas_per_tingkatan, jp_per_hari, setJpPerHari
  } = useWizardStore();

  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const daysLabels = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday];

  const classes: { id: string, name: string }[] = [];
  for (let tk = 1; tk <= tingkatan_count; tk++) {
    if (!is_parallel) {
      classes.push({ id: `${tk}`, name: `${t.kelas} ${tk}` });
    } else {
      for (let k = 0; k < kelas_per_tingkatan; k++) {
        const suffix = class_naming === 'alphabet' ? String.fromCharCode(65 + k) : `-${k + 1}`;
        classes.push({ id: `${tk}${suffix}`, name: `${tk}${suffix}` });
      }
    }
  }

  const addIstirahat = () => {
    const nextJp = istirahat.length > 0 ? istirahat[istirahat.length - 1].after_jp + 2 : 3;
    setWaktu({ 
      istirahat: [...istirahat, { id: crypto.randomUUID(), after_jp: nextJp, duration: 15 }] 
    });
  };

  const removeIstirahat = (id: string) => {
    setWaktu({ istirahat: istirahat.filter(i => i.id !== id) });
  };

  const updateIstirahat = (id: string, updates: Partial<{after_jp: number, duration: number}>) => {
    setWaktu({
      istirahat: istirahat.map(i => i.id === id ? { ...i, ...updates } : i)
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t.step2Title}</h2>
        <p className="text-foreground/70 text-base">{t.step2Desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        {/* Left Column: Basic Time */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              {t.schoolDaysCount}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWaktu({ school_days: 5 })}
                className={clsx(
                  "p-3 rounded-lg border text-center font-bold transition-colors",
                  school_days === 5 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-foreground/5 text-foreground/70"
                )}
              >
                {t.days5Short}
              </button>
              <button
                onClick={() => setWaktu({ school_days: 6 })}
                className={clsx(
                  "p-3 rounded-lg border text-center font-bold transition-colors",
                  school_days === 6 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-foreground/5 text-foreground/70"
                )}
              >
                {t.days6Short}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t.startTimeLabel}
              </label>
              <input
                type="time"
                value={start_time}
                onChange={(e) => setWaktu({ start_time: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-lg text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t.durationJpLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="60"
                  value={duration_per_jp}
                  onChange={(e) => setWaktu({ duration_per_jp: parseInt(e.target.value) || 35 })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-lg text-foreground"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground/60 font-bold pointer-events-none">{t.minutesSuffix}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 p-5 rounded-xl shadow-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold block text-primary">{t.flagCeremony}</span>
                  <span className="text-xs text-foreground/70 block mt-1">
                    {t.flagCeremonyDesc}
                  </span>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-foreground/20">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={has_monday_ceremony}
                    onChange={(e) => setWaktu({ has_monday_ceremony: e.target.checked })}
                  />
                  <span className={clsx("inline-block h-6 w-11 rounded-full transition-colors", has_monday_ceremony ? "bg-primary" : "bg-foreground/20")}>
                    <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ml-1", has_monday_ceremony ? "translate-x-5" : "translate-x-0")} />
                  </span>
                </div>
              </label>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-5 rounded-xl shadow-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-bold block text-primary">{t.routineActivity}</span>
                    <span className="text-xs text-foreground/70 block mt-1">
                      {t.routineActivityDesc}
                    </span>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-foreground/20">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={has_routine}
                    onChange={(e) => setWaktu({ has_routine: e.target.checked })}
                  />
                  <span className={clsx("inline-block h-6 w-11 rounded-full transition-colors", has_routine ? "bg-primary" : "bg-foreground/20")}>
                    <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ml-1", has_routine ? "translate-x-5" : "translate-x-0")} />
                  </span>
                </div>
              </label>
              
              {has_routine && (
                <div className="mt-4 pt-4 border-t border-primary/20 flex gap-4 items-center">
                  <span className="text-sm font-bold flex-shrink-0 text-primary">{t.routineDurationLabel}</span>
                  <div className="relative w-full max-w-[120px]">
                    <input
                      type="number"
                      min="5"
                      value={routine_duration}
                      onChange={(e) => setWaktu({ routine_duration: parseInt(e.target.value) || 15 })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground/60">{t.minutesSuffix}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Istirahat */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-bold">{t.breakScheduleTitle}</h3>
            <button
              onClick={addIstirahat}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-3 h-3" /> {t.addBtn}
            </button>
          </div>

          {istirahat.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-border rounded-xl text-foreground/60 text-sm font-bold bg-card">
              {t.noBreakSet}
            </div>
          ) : (
            <div className="space-y-3">
              {istirahat.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border group transition-colors">
                  <div className="bg-background w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-primary border border-border">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider mb-1">{t.afterJpNum}</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={item.after_jp}
                        onChange={(e) => updateIstirahat(item.id, { after_jp: parseInt(e.target.value) || 1 })}
                        className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-foreground"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider mb-1">{t.durationMin}</span>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={item.duration}
                        onChange={(e) => updateIstirahat(item.id, { duration: parseInt(e.target.value) || 15 })}
                        className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-foreground"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeIstirahat(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-red-50/50 border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jp Per Hari Section */}
      <div className="mt-12 space-y-4 max-w-5xl">
        <div className="border-b border-border pb-2">
          <h3 className="font-bold text-lg text-foreground">{t.dailyJpLoadTitle}</h3>
          <p className="text-sm text-foreground/70">{t.dailyJpLoadDesc}</p>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="p-3 font-bold text-foreground whitespace-nowrap">{t.kelas}</th>
                {Array.from({ length: school_days }).map((_, i) => (
                  <th key={i} className="p-3 font-bold text-center text-foreground whitespace-nowrap">{daysLabels[i] || `Hari ${i + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, idx) => (
                <tr key={cls.id} className={clsx("border-b border-border/50 hover:bg-foreground/5", idx % 2 === 0 ? "bg-card" : "bg-background/20")}>
                  <td className="p-3 font-bold text-foreground">{cls.name}</td>
                  {Array.from({ length: school_days }).map((_, i) => {
                    const hari = i + 1;
                    const key = `${cls.id}_${hari}`;
                    const val = jp_per_hari[key] ?? 6;
                    return (
                      <td key={hari} className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={val}
                          onChange={(e) => setJpPerHari(cls.id, hari, parseInt(e.target.value) || 0)}
                          className="w-16 text-center bg-background border border-border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary outline-none font-bold text-foreground transition-all"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
