import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

interface PeriodeState {
  selectedPeriodeId: number | null;
  selectedPeriode: any | null;
  periodes: any[];
  setSelectedPeriode: (periode: any) => void;
  fetchPeriodes: () => Promise<any[]>;
}

export const usePeriodeStore = create<PeriodeState>()(
  persist(
    (set, get) => ({
      selectedPeriodeId: null,
      selectedPeriode: null,
      periodes: [],
      setSelectedPeriode: (periode) =>
        set({
          selectedPeriodeId: periode?.id || null,
          selectedPeriode: periode || null,
        }),
      fetchPeriodes: async () => {
        try {
          const res = await api.get('/jadwal/periode');
          const data = res.data || [];
          set({ periodes: data });

          // If no selected periode, auto-set active or first
          const currentId = get().selectedPeriodeId;
          if (data.length > 0) {
            let active = data.find((p: any) => p.id === currentId);
            if (!active) {
              active = data.find((p: any) => p.is_active) || data[0];
            }
            set({ selectedPeriodeId: active.id, selectedPeriode: active });
          }
          return data;
        } catch (err) {
          console.error('Error fetching periodes in store:', err);
          return [];
        }
      },
    }),
    {
      name: 'selected-periode-id',
    }
  )
);
