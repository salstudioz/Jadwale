'use client';

import { useState } from 'react';
import { useWizardStore, Pengampu } from '../../../store/useWizardStore';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import { Users, BookOpen, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Step4Relasi() {
  const { gurus, mapels, is_parallel, tingkatan_count, kelas_per_tingkatan, class_naming, 
          wali_kelas, setWaliKelas, pengampus, setPengampus } = useWizardStore();
  
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [activeTab, setActiveTab] = useState<'wali' | 'pengampu'>('wali');

  const classes: { id: string, name: string, tingkatan: number }[] = [];
  for (let tk = 1; tk <= tingkatan_count; tk++) {
    if (!is_parallel) {
      classes.push({ id: `${tk}`, name: `${t.kelas} ${tk}`, tingkatan: tk });
    } else {
      for (let k = 0; k < kelas_per_tingkatan; k++) {
        const suffix = class_naming === 'alphabet' ? String.fromCharCode(65 + k) : `-${k + 1}`;
        classes.push({ id: `${tk}${suffix}`, name: `${tk}${suffix}`, tingkatan: tk });
      }
    }
  }

  const handleWaliKelasChange = (classId: string, guruId: string) => {
    if (!guruId) {
      setWaliKelas(wali_kelas.filter(w => w.id_kelas !== classId));
      return;
    }
    const exists = wali_kelas.find(w => w.id_kelas === classId);
    if (exists) {
      setWaliKelas(wali_kelas.map(w => w.id_kelas === classId ? { ...w, id_guru: guruId } : w));
    } else {
      setWaliKelas([...wali_kelas, { id_kelas: classId, id_guru: guruId, default_mapels: [] }]);
    }
  };

  const toggleWaliKelasMapel = (classId: string, mapelId: string) => {
    setWaliKelas(wali_kelas.map(w => {
      if (w.id_kelas === classId) {
        const currentMapels = w.default_mapels || [];
        const newMapels = currentMapels.includes(mapelId) 
          ? currentMapels.filter(id => id !== mapelId)
          : [...currentMapels, mapelId];
        return { ...w, default_mapels: newMapels };
      }
      return w;
    }));
  };

  const handleAddPengampu = (mapelId: string) => {
    const newPengampu: Pengampu = {
      id: crypto.randomUUID(),
      id_mapel: mapelId,
      id_guru: '',
      class_ids: [],
    };
    setPengampus([...pengampus, newPengampu]);
  };

  const handleUpdatePengampu = (pengampuId: string, updates: Partial<Pengampu>) => {
    setPengampus(pengampus.map(p => p.id === pengampuId ? { ...p, ...updates } : p));
  };

  const handleRemovePengampu = (pengampuId: string) => {
    setPengampus(pengampus.filter(p => p.id !== pengampuId));
  };

  const toggleClassForPengampu = (pengampuId: string, classId: string, currentClasses: string[]) => {
    const newClasses = currentClasses.includes(classId)
      ? currentClasses.filter(c => c !== classId)
      : [...currentClasses, classId];
    handleUpdatePengampu(pengampuId, { class_ids: newClasses });
  };

  const toggleTingkatanForPengampu = (pengampuId: string, tingkatan: number, currentClasses: string[], mapelPengampus: Pengampu[]) => {
    const tingkatanClasses = classes.filter(c => c.tingkatan === tingkatan).map(c => c.id);
    
    const availableClasses = tingkatanClasses.filter(cId => {
      const isSelectedByOther = mapelPengampus.some(other => other.id !== pengampuId && other.class_ids.includes(cId));
      return !isSelectedByOther;
    });

    const allSelected = availableClasses.every(cId => currentClasses.includes(cId));

    let newClasses = [...currentClasses];
    if (allSelected) {
      newClasses = newClasses.filter(cId => !availableClasses.includes(cId));
    } else {
      availableClasses.forEach(cId => {
        if (!newClasses.includes(cId)) newClasses.push(cId);
      });
    }

    handleUpdatePengampu(pengampuId, { class_ids: newClasses });
  };

  if (gurus.length === 0 || mapels.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">{t.step4Title}</h2>
          <p className="text-foreground/70 text-base">{t.step4Desc}</p>
        </div>
        <div className="p-8 text-center bg-orange-100 border border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 rounded-xl flex flex-col items-center gap-3 font-bold">
          <AlertCircle size={32} />
          <p>{t.needStep3Notice}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t.step4Title}</h2>
        <p className="text-foreground/70 text-base">{t.step4Desc}</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-card border border-border rounded-lg max-w-sm">
        <button
          onClick={() => setActiveTab('wali')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded transition-colors ${
            activeTab === 'wali' ? 'bg-primary text-white' : 'text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <Users size={16} /> {t.homeroomTab}
        </button>
        <button
          onClick={() => setActiveTab('pengampu')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded transition-colors ${
            activeTab === 'pengampu' ? 'bg-primary text-white' : 'text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <BookOpen size={16} /> {t.subjectTeacherTab}
        </button>
      </div>

      <div>
        {/* TAB WALI KELAS */}
        {activeTab === 'wali' && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-primary flex gap-3 font-bold">
              <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
              <p>{t.homeroomNotice}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map(cls => {
                const wali = wali_kelas.find(w => w.id_kelas === cls.id);
                const selectedGuru = wali?.id_guru || '';
                const defaultMapels = wali?.default_mapels || [];

                return (
                  <div key={cls.id} className="p-4 rounded-xl border border-border flex flex-col gap-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{cls.name}</span>
                    </div>
                    
                    <select
                      value={selectedGuru}
                      onChange={(e) => handleWaliKelasChange(cls.id, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground font-bold"
                    >
                      <option value="">{t.selectHomeroomPlaceholder}</option>
                      {gurus.map(g => (
                        <option key={g.id} value={g.id}>{g.nama}</option>
                      ))}
                    </select>

                    {selectedGuru && (
                      <div className="mt-2 p-3 bg-background border border-border rounded-lg">
                        <p className="text-xs font-bold text-foreground/70 mb-2">{t.defaultSubjectsTitle}</p>
                        <div className="flex flex-wrap gap-2">
                          {mapels.map(mapel => {
                            const isChecked = defaultMapels.includes(mapel.id);
                            return (
                              <button
                                key={mapel.id}
                                onClick={() => toggleWaliKelasMapel(cls.id, mapel.id)}
                                className={clsx(
                                  "px-2 py-1 rounded text-xs font-bold transition-colors border",
                                  isChecked 
                                    ? "bg-primary text-white border-primary" 
                                    : "bg-card text-foreground/70 border-border hover:border-primary/50"
                                )}
                              >
                                {mapel.nama}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB PENGAMPU */}
        {activeTab === 'pengampu' && (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-primary flex gap-3 font-bold">
              <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
              <p>{t.subjectTeacherNotice}</p>
            </div>

            <div className="space-y-6">
              {mapels.map(mapel => {
                const mapelPengampus = pengampus.filter(p => p.id_mapel === mapel.id);
                
                return (
                  <div key={mapel.id} className="border border-border rounded-xl overflow-hidden bg-card">
                    {/* Header Mapel */}
                    <div className="bg-background px-5 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: mapel.color }}></div>
                        <span className="font-bold text-lg text-foreground">{mapel.nama}</span>
                        {mapel.prioritas && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-bold rounded border border-orange-200 dark:border-orange-800">PRIORITAS</span>}
                      </div>
                      <button
                        onClick={() => handleAddPengampu(mapel.id)}
                        className="flex items-center gap-1 text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-colors font-bold"
                      >
                        <Plus size={16} /> {t.addTeacherForSubject}
                      </button>
                    </div>

                    {/* Pengampu List */}
                    <div className="p-5 space-y-4">
                      {mapelPengampus.length === 0 ? (
                        <div className="text-center text-sm text-foreground/60 py-4 font-bold">
                          {t.noTeacherForSubject}
                        </div>
                      ) : (
                        mapelPengampus.map((p, idx) => (
                          <div key={p.id} className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-xl bg-background relative group">
                            
                            {/* Pemilihan Guru */}
                            <div className="md:w-1/3">
                              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-1 block">{t.guru} {idx + 1}</label>
                              <select
                                value={p.id_guru}
                                onChange={(e) => handleUpdatePengampu(p.id, { id_guru: e.target.value })}
                                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold text-foreground"
                              >
                                <option value="">{t.selectTeacherPlaceholder}</option>
                                {gurus.map(g => (
                                  <option key={g.id} value={g.id}>{g.nama}</option>
                                ))}
                              </select>
                            </div>

                            {/* Pemilihan Kelas (Multi-Select Checkboxes) */}
                            <div className="md:w-2/3">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block">{t.taughtClassesLabel}</label>
                                
                                {is_parallel && (
                                  <div className="flex gap-1">
                                    {Array.from({ length: tingkatan_count }).map((_, i) => {
                                      const tk = i + 1;
                                      return (
                                        <button
                                          key={tk}
                                          onClick={() => toggleTingkatanForPengampu(p.id, tk, p.class_ids, mapelPengampus)}
                                          className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded hover:bg-primary hover:text-white transition-colors"
                                        >
                                          {t.gradeShort}.{tk}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {classes.map(cls => {
                                  const isChecked = p.class_ids.includes(cls.id);
                                  const isConflict = mapelPengampus.some(other => other.id !== p.id && other.class_ids.includes(cls.id));
                                  
                                  return (
                                    <button
                                      key={cls.id}
                                      onClick={() => toggleClassForPengampu(p.id, cls.id, p.class_ids)}
                                      disabled={isConflict && !isChecked}
                                      className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                                        isChecked 
                                          ? 'bg-primary text-white border-primary shadow-sm' 
                                          : isConflict
                                            ? 'bg-foreground/5 text-foreground/40 border-transparent cursor-not-allowed'
                                            : 'bg-card text-foreground/70 border-border hover:border-primary/50'
                                      }`}
                                    >
                                      {cls.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleRemovePengampu(p.id)}
                              className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-red-50/50 border border-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
