'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePeriodeStore } from '../store/usePeriodeStore';
import { CalendarDays, ChevronDown, Check, Plus, AlertCircle, Archive } from 'lucide-react';
import api from '../lib/axios';

export default function PeriodeSwitcher() {
  const { selectedPeriode, periodes, setSelectedPeriode, fetchPeriodes } = usePeriodeStore();
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form for new periode
  const [namaPeriode, setNamaPeriode] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState('Gasal');

  useEffect(() => {
    fetchPeriodes();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (p: any) => {
    setSelectedPeriode(p);
    setOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPeriode.trim()) return;

    try {
      const res = await api.post('/jadwal/periode', {
        nama: namaPeriode.trim(),
        tahun_ajaran: tahunAjaran,
        semester,
      });
      setShowAddModal(false);
      setNamaPeriode('');
      const updatedList = await fetchPeriodes();
      const created = updatedList.find((p: any) => p.id === res.data?.id) || res.data;
      setSelectedPeriode(created);
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const activePeriode = periodes.find((p) => p.is_active);
  const archivedPeriodes = periodes.filter((p) => !p.is_active);

  return (
    <div className="relative inline-block text-left z-30" ref={dropdownRef}>
      {/* Collapsed Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-md shadow-sm text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 transition-all"
      >
        <CalendarDays className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {selectedPeriode?.nama || 'Pilih Periode'}
        </span>

        {selectedPeriode?.is_active ? (
          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded">
            AKTIF
          </span>
        ) : (
          <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded">
            ARSIP
          </span>
        )}

        <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
      </button>

      {/* Expanded Dropdown Menu */}
      {open && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden text-xs z-50">
          <div className="p-3 space-y-3">
            {/* Periode Aktif Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Periode Aktif
              </div>
              {activePeriode ? (
                <div
                  onClick={() => handleSelect(activePeriode)}
                  className={`p-2.5 rounded-md border cursor-pointer flex items-center justify-between transition-colors ${
                    selectedPeriode?.id === activePeriode.id
                      ? 'border-blue-700 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{activePeriode.nama}</div>
                    <div className="text-[11px] text-gray-500 font-normal">
                      Tahun: {activePeriode.tahun_ajaran || '2026/2027'} | {activePeriode.semester || 'Gasal'}
                    </div>
                  </div>
                  {selectedPeriode?.id === activePeriode.id && (
                    <Check className="w-4 h-4 text-blue-700 shrink-0" />
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 italic">Belum ada periode aktif set</div>
              )}
            </div>

            {/* Periode Lain / Arsip Section */}
            {archivedPeriodes.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Periode Arsip
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {archivedPeriodes.map((p) => {
                    const isSelected = selectedPeriode?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        className={`p-2 rounded-md border cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">{p.nama}</div>
                          <div className="text-[10px] text-gray-500 font-normal">(Arsip)</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Add New Periode CTA Button */}
          <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { setShowAddModal(true); setOpen(false); }}
              className="w-full py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Periode Baru
            </button>
          </div>
        </div>
      )}

      {/* Add New Periode Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Buat Periode Pelajaran Baru</h4>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Nama Periode *</label>
              <input
                type="text" required
                value={namaPeriode}
                onChange={(e) => setNamaPeriode(e.target.value)}
                placeholder="Contoh: Semester Genap 2025/2026"
                className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  placeholder="2026/2027"
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                >
                  <option value="Gasal">Gasal (Ganjil)</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border rounded text-xs">
                Batal
              </button>
              <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white font-bold text-xs rounded">
                Simpan Periode
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
