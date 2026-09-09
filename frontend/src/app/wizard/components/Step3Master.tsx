'use client';

import { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import { BookOpen, Users, Plus, Trash2, Star } from 'lucide-react';
import { clsx } from 'clsx';

export default function Step3Master() {
  const { tingkatan_count, mapels, gurus, addMapel, removeMapel, updateMapel, addGuru, removeGuru, updateGuru } = useWizardStore();
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [activeTab, setActiveTab] = useState<'mapel' | 'guru'>('mapel');

  const handleAddMapel = () => {
    addMapel({ nama: t.newSubjectDefault, prioritas: false, color: '#E2E8F0', jp_per_tingkatan: {} });
  };

  const handleAddGuru = () => {
    addGuru({ nama: t.newTeacherDefault, nip: '', availability: [] });
  };

  const daysLabels = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t.step3Title}</h2>
        <p className="text-foreground/70 text-base">{t.step3Desc}</p>
      </div>

      <div className="flex p-1 bg-card border border-border w-fit mb-4 rounded-lg">
        <button
          onClick={() => setActiveTab('mapel')}
          className={clsx(
            "px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors",
            activeTab === 'mapel' ? "bg-primary text-white" : "text-foreground/70 hover:bg-foreground/5"
          )}
        >
          <BookOpen className="w-4 h-4" />
          {t.subjectsTab} ({mapels.length})
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={clsx(
            "px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition-colors",
            activeTab === 'guru' ? "bg-primary text-white" : "text-foreground/70 hover:bg-foreground/5"
          )}
        >
          <Users className="w-4 h-4" />
          {t.teachersTab} ({gurus.length})
        </button>
      </div>

      <div className="flex-1 overflow-auto pr-2 -mr-2">
        {activeTab === 'mapel' ? (
          <div className="space-y-4">
            <button
              onClick={handleAddMapel}
              className="w-full p-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors font-bold bg-card"
            >
              <Plus className="w-5 h-5" /> {t.addSubjectBtn}
            </button>

            <div className="grid grid-cols-1 gap-4">
              {mapels.map((mapel) => (
                <div key={mapel.id} className="flex flex-col p-4 bg-card border border-border rounded-xl group relative">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full border border-border flex-shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: mapel.color }}
                    >
                      <input 
                        type="color" 
                        value={mapel.color} 
                        onChange={(e) => updateMapel(mapel.id, { color: e.target.value })}
                        className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-0"
                      />
                    </div>
                    <input
                      type="text"
                      value={mapel.nama}
                      onChange={(e) => updateMapel(mapel.id, { nama: e.target.value })}
                      placeholder="Nama Mapel"
                      className="flex-1 bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 py-1 outline-none transition-colors font-bold text-lg text-foreground max-w-sm"
                    />
                    
                    <label className="flex items-center gap-2 text-sm cursor-pointer ml-4">
                      <div className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none bg-foreground/20">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={mapel.prioritas}
                          onChange={(e) => updateMapel(mapel.id, { prioritas: e.target.checked })}
                        />
                        <span className={clsx("inline-block h-5 w-9 rounded-full transition-colors", mapel.prioritas ? "bg-orange-600" : "bg-foreground/20")}>
                          <span className={clsx("inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-1 ml-1", mapel.prioritas ? "translate-x-4" : "translate-x-0")} />
                        </span>
                      </div>
                      <span className="text-foreground/70 font-bold flex items-center gap-1">
                        {t.priorityMorningMapel} <Star className={clsx("w-3 h-3", mapel.prioritas ? "text-orange-500 fill-orange-500" : "text-transparent")} />
                      </span>
                    </label>

                    <button
                      onClick={() => removeMapel(mapel.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-red-50/50 border border-red-100 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Beban JP Per Tingkatan */}
                  <div className="mt-4 p-3 bg-background rounded-lg border border-border flex items-center gap-4">
                    <p className="text-sm font-bold text-foreground/70">{t.weeklyJpLoad}</p>
                    <div className="flex flex-wrap gap-3">
                      {Array.from({ length: tingkatan_count }).map((_, i) => {
                        const tk = i + 1;
                        const jp = mapel.jp_per_tingkatan?.[tk] ?? 0;
                        return (
                          <div key={tk} className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
                            <span className="text-xs font-bold text-foreground/60">{t.gradeShort}.{tk}</span>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={jp}
                              onChange={(e) => {
                                const newJp = { ...(mapel.jp_per_tingkatan || {}), [tk]: parseInt(e.target.value) || 0 };
                                updateMapel(mapel.id, { jp_per_tingkatan: newJp });
                              }}
                              className="w-12 text-center bg-background border border-border rounded text-sm outline-none focus:ring-1 focus:ring-primary font-bold px-1 py-1"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleAddGuru}
              className="w-full p-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors font-bold bg-card"
            >
              <Plus className="w-5 h-5" /> {t.addTeacherBtn}
            </button>

            <div className="grid grid-cols-1 gap-4">
              {gurus.map((guru) => (
                <div key={guru.id} className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border rounded-xl">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-3 w-full md:w-1/3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 uppercase shrink-0 mt-1">
                      {guru.nama.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="text"
                        value={guru.nama}
                        onChange={(e) => updateGuru(guru.id, { nama: e.target.value })}
                        placeholder={t.teacherFullName}
                        className="bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 py-0.5 outline-none transition-colors font-bold text-foreground w-full"
                      />
                      <input
                        type="text"
                        value={guru.nip}
                        onChange={(e) => updateGuru(guru.id, { nip: e.target.value })}
                        placeholder={t.nipOptional}
                        className="bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 py-0.5 outline-none transition-colors text-xs text-foreground/60 font-bold w-full"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex-1 bg-background p-3 rounded-lg border border-border flex flex-col">
                    <p className="text-xs font-bold text-foreground/70 mb-2">{t.availabilityLabel}</p>
                    <div className="space-y-2 flex-1">
                      {(guru.availability || []).map((av, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
                          <select 
                            value={av.hari} 
                            onChange={(e) => {
                              const newAvail = [...(guru.availability || [])];
                              newAvail[idx].hari = parseInt(e.target.value);
                              updateGuru(guru.id, { availability: newAvail });
                            }}
                            className="text-xs bg-background border border-border outline-none font-bold p-1.5 rounded"
                          >
                            {daysLabels.map((hari, i) => (
                              <option key={i+1} value={i+1}>{hari}</option>
                            ))}
                          </select>
                          <input 
                            type="time" 
                            value={av.jam_mulai}
                            onChange={(e) => {
                              const newAvail = [...(guru.availability || [])];
                              newAvail[idx].jam_mulai = e.target.value;
                              updateGuru(guru.id, { availability: newAvail });
                            }}
                            className="text-xs bg-background border border-border outline-none font-bold p-1.5 rounded"
                          />
                          <span className="text-xs text-foreground/50 font-bold">-</span>
                          <input 
                            type="time" 
                            value={av.jam_selesai}
                            onChange={(e) => {
                              const newAvail = [...(guru.availability || [])];
                              newAvail[idx].jam_selesai = e.target.value;
                              updateGuru(guru.id, { availability: newAvail });
                            }}
                            className="text-xs bg-background border border-border outline-none font-bold p-1.5 rounded"
                          />
                          <button 
                            onClick={() => {
                              const newAvail = guru.availability.filter((_, i) => i !== idx);
                              updateGuru(guru.id, { availability: newAvail });
                            }}
                            className="ml-auto text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const newAvail = [...(guru.availability || []), { hari: 1, jam_mulai: '07:00', jam_selesai: '12:00' }];
                        updateGuru(guru.id, { availability: newAvail });
                      }}
                      className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:bg-primary/10 w-fit px-2 py-1.5 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" /> {t.addTimeBtn}
                    </button>
                  </div>

                  {/* Delete Guru Button */}
                  <div className="flex flex-col justify-start">
                    <button
                      onClick={() => removeGuru(guru.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-red-50/50 border border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
