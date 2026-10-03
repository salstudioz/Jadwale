'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../../lib/axios';
import { Calendar, AlertTriangle, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

interface GenerateStep1Props {
  selectedPeriode: any;
  onSelectPeriode: (periode: any) => void;
  onNext: () => void;
}

export default function GenerateStep1Periode({
  selectedPeriode,
  onSelectPeriode,
  onNext,
}: GenerateStep1Props) {
  const [periodes, setPeriodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Periode form
  const [namaPeriode, setNamaPeriode] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState('Gasal');

  const fetchPeriodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jadwal/periode');
      const data = res.data || [];
      setPeriodes(data);

      // Auto select active period if none selected
      if (!selectedPeriode && data.length > 0) {
        const active = data.find((p: any) => p.is_active) || data[0];
        onSelectPeriode(active);
      }
    } catch (err) {
      console.error('Error fetching periodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodes();
  }, []);

  const handleCreatePeriode = async (e: React.FormEvent) => {
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
      await fetchPeriodes();
      onSelectPeriode(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langkah 1: Pilih Periode Jadwal</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pilih tahun pelajaran & semester yang akan disusun jadwalnya.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 border border-blue-700 text-blue-700 hover:bg-blue-50 text-xs font-semibold rounded-md flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Periode Baru
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Memuat periode jadwal...</div>
      ) : (
        <div className="space-y-3 mb-6">
          {periodes.map((p) => {
            const isSelected = selectedPeriode?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPeriode(p)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-700 bg-blue-700 text-white' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        {p.nama}
                        {p.is_active && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Tahun Ajaran: {p.tahun_ajaran || '2026/2027'} | Semester {p.semester || 'Gasal'}
                      </div>
                    </div>
                  </div>

                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning Alert if selected period has existing schedule */}
      {selectedPeriode && (
        <div className="mb-6 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Perhatian:</span> Periode <strong>{selectedPeriode.nama}</strong> sudah dikonfigurasi. Generate ulang akan memperbarui susunan jadwal untuk periode ini.
          </div>
        </div>
      )}

      {/* New Periode Modal */}
      {showAddModal && (
        <form onSubmit={handleCreatePeriode} className="mb-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-blue-900">Buat Periode Baru</h4>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-xs text-gray-500">Batal</button>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Nama Periode *</label>
            <input
              type="text" required
              value={namaPeriode}
              onChange={(e) => setNamaPeriode(e.target.value)}
              placeholder="Contoh: Semester Gasal 2026/2027"
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
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
                className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
              >
                <option value="Gasal">Gasal (Ganjil)</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white text-xs font-medium rounded">Simpan Periode</button>
          </div>
        </form>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedPeriode}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Lanjut Ke Preferensi
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
