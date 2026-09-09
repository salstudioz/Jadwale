import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface IstirahatConfig {
  id: string;
  after_jp: number;
  duration: number;
}

export interface Mapel {
  id: string;
  nama: string;
  prioritas: boolean;
  color: string;
  jp_per_tingkatan: Record<string, number>;
}

export interface Availability {
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
}

export interface Guru {
  id: string;
  nama: string;
  nip: string;
  availability: Availability[];
}

export interface Pengampu {
  id: string;
  id_guru: string;
  id_mapel: string;
  class_ids: string[];
}

export interface WaliKelas {
  id_kelas: string;
  id_guru: string;
  default_mapels: string[];
}

export interface WizardState {
  // Step 1: Config
  is_parallel: boolean;
  class_naming: 'alphabet' | 'number';
  tingkatan_count: number;
  kelas_per_tingkatan: number;
  
  // Step 2: Waktu
  school_days: number;
  start_time: string;
  duration_per_jp: number;
  has_routine: boolean;
  routine_duration: number;
  has_monday_ceremony: boolean;
  istirahat: IstirahatConfig[];
  jp_per_hari: Record<string, number>; // key: `${classId}_${hari}`

  // Step 3: Master
  mapels: Mapel[];
  gurus: Guru[];

  // Step 4: Relasi
  wali_kelas: WaliKelas[];
  pengampus: Pengampu[];

  // Actions
  setConfig: (config: Partial<Pick<WizardState, 'is_parallel' | 'class_naming' | 'tingkatan_count' | 'kelas_per_tingkatan'>>) => void;
  setWaktu: (waktu: Partial<Pick<WizardState, 'school_days' | 'start_time' | 'duration_per_jp' | 'has_routine' | 'routine_duration' | 'has_monday_ceremony' | 'istirahat'>>) => void;
  setJpPerHari: (classId: string, hari: number, jp: number) => void;
  
  addMapel: (mapel: Omit<Mapel, 'id'>) => void;
  removeMapel: (id: string) => void;
  updateMapel: (id: string, mapel: Partial<Omit<Mapel, 'id'>>) => void;

  addGuru: (guru: Omit<Guru, 'id'>) => void;
  removeGuru: (id: string) => void;
  updateGuru: (id: string, guru: Partial<Omit<Guru, 'id'>>) => void;

  setWaliKelas: (wali_kelas: WaliKelas[]) => void;
  setPengampus: (pengampus: Pengampu[]) => void;

  resetWizard: () => void;
}

const initialState = {
  is_parallel: false,
  class_naming: 'alphabet' as const,
  tingkatan_count: 6,
  kelas_per_tingkatan: 1,

  school_days: 5,
  start_time: '07:00',
  duration_per_jp: 35,
  has_routine: false,
  routine_duration: 15,
  has_monday_ceremony: true,
  istirahat: [
    { id: '1', after_jp: 3, duration: 15 },
    { id: '2', after_jp: 5, duration: 15 },
  ],
  jp_per_hari: {},

  mapels: [],
  gurus: [],
  wali_kelas: [],
  pengampus: [],
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setConfig: (config) => set((state) => ({ ...state, ...config })),
      setWaktu: (waktu) => set((state) => ({ ...state, ...waktu })),
      setJpPerHari: (classId, hari, jp) => set((state) => ({
        jp_per_hari: { ...state.jp_per_hari, [`${classId}_${hari}`]: jp }
      })),
      
      addMapel: (mapel) => set((state) => ({
        mapels: [...state.mapels, { ...mapel, id: crypto.randomUUID() }]
      })),
      removeMapel: (id) => set((state) => ({
        mapels: state.mapels.filter(m => m.id !== id)
      })),
      updateMapel: (id, updated) => set((state) => ({
        mapels: state.mapels.map(m => m.id === id ? { ...m, ...updated } : m)
      })),

      addGuru: (guru) => set((state) => ({
        gurus: [...state.gurus, { ...guru, id: crypto.randomUUID() }]
      })),
      removeGuru: (id) => set((state) => ({
        gurus: state.gurus.filter(g => g.id !== id)
      })),
      updateGuru: (id, updated) => set((state) => ({
        gurus: state.gurus.map(g => g.id === id ? { ...g, ...updated } : g)
      })),

      setWaliKelas: (wali_kelas) => set({ wali_kelas }),
      setPengampus: (pengampus) => set({ pengampus }),

      resetWizard: () => set(initialState),
    }),
    {
      name: 'jadwale-wizard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
