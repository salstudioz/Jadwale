'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, CalendarX2 } from 'lucide-react';
import api from '../../../../lib/axios';

interface Guru {
  id: number;
  nama: string;
  guruAvailabilities?: { hari: number }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  guru: Guru | null;
  onSuccess: () => void;
}

const HARI_LIST = [
  { id: 1, label: 'Senin' },
  { id: 2, label: 'Selasa' },
  { id: 3, label: 'Rabu' },
  { id: 4, label: 'Kamis' },
  { id: 5, label: 'Jumat' },
  { id: 6, label: 'Sabtu' },
];

export default function AvailabilityModal({ isOpen, onClose, guru, onSuccess }: Props) {
  const [unavailableDays, setUnavailableDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guru?.guruAvailabilities) {
      setUnavailableDays(guru.guruAvailabilities.map((a: any) => a.hari));
    } else {
      setUnavailableDays([]);
    }
  }, [guru]);

  if (!isOpen || !guru) return null;

  const toggleDay = (hariId: number) => {
    setUnavailableDays((prev) =>
      prev.includes(hariId) ? prev.filter((id) => id !== hariId) : [...prev, hariId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post(`/guru/${guru.id}/availability`, {
        availabilities: unavailableDays.map((hari) => ({ hari })),
      });
      onSuccess();
      onClose();
    } catch {
      alert('Gagal menyimpan ketersediaan guru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ zIndex: 60 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content max-w-sm w-full p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <CalendarX2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">Hari Tidak Tersedia</h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{guru.nama}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-ghost p-1.5 -mr-1 -mt-1">
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Centang hari di mana guru ini <strong className="text-red-600">tidak bisa</strong> mengajar.
          </p>

          {/* Day Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {HARI_LIST.map((hari) => {
              const isSelected = unavailableDays.includes(hari.id);
              return (
                <button
                  key={hari.id}
                  onClick={() => toggleDay(hari.id)}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-700 dark:text-red-400'
                      : 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {hari.label}
                </button>
              );
            })}
          </div>

          {/* Info badge */}
          {unavailableDays.length > 0 && (
            <div className="badge badge-red mb-4 w-full justify-center">
              {unavailableDays.length} hari tidak tersedia
            </div>
          )}
          {unavailableDays.length === 0 && (
            <div className="badge badge-green mb-4 w-full justify-center">
              Tersedia semua hari
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-[var(--border)]">
            <button onClick={onClose} className="btn btn-secondary flex-1">Batal</button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary flex-1">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Simpan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
