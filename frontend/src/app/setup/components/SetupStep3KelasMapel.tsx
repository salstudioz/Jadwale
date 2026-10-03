'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '../../../lib/axios';
import { Layers, BookOpen, Upload, Plus, Download, Trash2, CheckCircle2, ArrowRight, ArrowLeft, FileSpreadsheet } from 'lucide-react';

interface SetupStep3Props {
  onNext: () => void;
  onBack: () => void;
}

export default function SetupStep3KelasMapel({ onNext, onBack }: SetupStep3Props) {
  const [activeTab, setActiveTab] = useState<'kelas' | 'mapel'>('kelas');
  
  // Data states
  const [kelases, setKelases] = useState<any[]>([]);
  const [mapels, setMapels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manual Add states
  const [addingKelas, setAddingKelas] = useState(false);
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkatNum, setTingkatNum] = useState(1);

  const [addingMapel, setAddingMapel] = useState(false);
  const [namaMapel, setNamaMapel] = useState('');

  // Preview Upload State
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resK, resM] = await Promise.all([
        api.get('/kelas'),
        api.get('/mapel'),
      ]);
      setKelases(resK.data || []);
      setMapels(resM.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/import/${activeTab}?mode=UPSERT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreviewToken(res.data.token);
      setPreviewStats(res.data.stats);
      setPreviewData(res.data.validData || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || `Gagal membaca file Excel ${activeTab}.`);
    } finally {
      setUploading(false);
    }
  };

  const handleCommitUpload = async () => {
    if (!previewToken) return;
    setUploading(true);
    try {
      await api.post('/import/commit', { previewToken });
      setPreviewToken(null);
      setPreviewStats(null);
      setPreviewData([]);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data import.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    try {
      await api.post('/kelas', {
        nama_kelas: namaKelas.trim(),
        tingkat: tingkatNum,
        kode_lengkap: namaKelas.trim(),
      });
      setNamaKelas('');
      setAddingKelas(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menambah kelas.');
    }
  };

  const handleAddMapel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMapel.trim()) return;

    try {
      await api.post('/mapel', {
        nama: namaMapel.trim(),
        prioritas: false,
      });
      setNamaMapel('');
      setAddingMapel(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menambah mata pelajaran.');
    }
  };

  const handleDeleteKelas = async (id: number) => {
    try {
      await api.delete(`/kelas/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMapel = async (id: number) => {
    try {
      await api.delete(`/mapel/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = async () => {
    if (kelases.length < 1 || mapels.length < 3) return;
    try {
      await api.patch('/sekolah', { setupStep: 4 });
      onNext();
    } catch (err) {
      console.error(err);
    }
  };

  const isNextValid = kelases.length >= 1 && mapels.length >= 3;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-md">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langkah 3: Kelola Kelas & Mata Pelajaran</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pastikan minimal ada 1 kelas dan minimal 3 mata pelajaran terdaftar.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-xs underline font-medium">Tutup</button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => { setActiveTab('kelas'); setPreviewToken(null); }}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'kelas'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Master Kelas ({kelases.length})
          {kelases.length < 1 && <span className="text-xs text-red-500 font-normal">*Wajib min 1</span>}
        </button>

        <button
          onClick={() => { setActiveTab('mapel'); setPreviewToken(null); }}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'mapel'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mata Pelajaran ({mapels.length})
          {mapels.length < 3 && <span className="text-xs text-red-500 font-normal">*Wajib min 3</span>}
        </button>
      </div>

      {/* Excel Upload / Add Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center text-center">
          <FileSpreadsheet className="w-8 h-8 text-green-600 mb-1" />
          <p className="font-semibold text-xs text-gray-900 dark:text-white mb-2">Import {activeTab === 'kelas' ? 'Kelas' : 'Mapel'} via Excel</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-md flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Excel
            </button>
            <a
              href={`http://localhost:3000/api/import/template/${activeTab}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 text-gray-700 text-xs rounded-md flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Template
            </a>
          </div>
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center text-center">
          <Plus className="w-8 h-8 text-blue-600 mb-1" />
          <p className="font-semibold text-xs text-gray-900 dark:text-white mb-2">Tambah Manual {activeTab === 'kelas' ? 'Kelas' : 'Mapel'}</p>
          <button
            type="button"
            onClick={() => activeTab === 'kelas' ? setAddingKelas(true) : setAddingMapel(true)}
            className="px-4 py-1.5 border border-blue-700 text-blue-700 hover:bg-blue-50 text-xs font-semibold rounded-md flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah {activeTab === 'kelas' ? 'Kelas' : 'Mapel'}
          </button>
        </div>
      </div>

      {/* Manual Kelas Form */}
      {activeTab === 'kelas' && addingKelas && (
        <form onSubmit={handleAddKelas} className="mb-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-blue-900">Tambah Kelas Baru</h4>
            <button type="button" onClick={() => setAddingKelas(false)} className="text-xs text-gray-500">Batal</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Nama Kelas *</label>
              <input
                type="text"
                required
                value={namaKelas}
                onChange={(e) => setNamaKelas(e.target.value)}
                placeholder="Contoh: 1A atau Kelas I"
                className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tingkat *</label>
              <select
                value={tingkatNum}
                onChange={(e) => setTingkatNum(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(t => (
                  <option key={t} value={t}>Tingkat {t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white text-xs font-medium rounded">Simpan Kelas</button>
          </div>
        </form>
      )}

      {/* Manual Mapel Form */}
      {activeTab === 'mapel' && addingMapel && (
        <form onSubmit={handleAddMapel} className="mb-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-blue-900">Tambah Mata Pelajaran Baru</h4>
            <button type="button" onClick={() => setAddingMapel(false)} className="text-xs text-gray-500">Batal</button>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Nama Mata Pelajaran *</label>
            <input
              type="text"
              required
              value={namaMapel}
              onChange={(e) => setNamaMapel(e.target.value)}
              placeholder="Contoh: Matematika, Bahasa Indonesia"
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white text-xs font-medium rounded">Simpan Mapel</button>
          </div>
        </form>
      )}

      {/* Preview Commit Box */}
      {previewToken && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-900">Preview Excel ({previewStats?.valid} data terdeteksi)</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPreviewToken(null)} className="px-3 py-1 text-xs border rounded bg-white">Batal</button>
              <button type="button" onClick={handleCommitUpload} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded">Konfirmasi & Impor</button>
            </div>
          </div>
        </div>
      )}

      {/* Content List Table */}
      {activeTab === 'kelas' ? (
        <div className="mb-6">
          {loading ? (
            <div className="py-6 text-center text-xs text-gray-500">Memuat data kelas...</div>
          ) : kelases.length === 0 ? (
            <div className="py-6 border-2 border-dashed rounded-lg text-center text-xs text-gray-500">
              Belum ada kelas. Tambahkan kelas menggunakan tombol di atas.
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto border rounded-md text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2 border-b w-12 text-center">No</th>
                    <th className="p-2 border-b">Nama Kelas</th>
                    <th className="p-2 border-b">Tingkatan</th>
                    <th className="p-2 border-b">Fase</th>
                    <th className="p-2 border-b w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelases.map((k, idx) => (
                    <tr key={k.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-2 font-medium">{k.nama_kelas}</td>
                      <td className="p-2 text-gray-600">{k.tingkatan?.nama || '-'}</td>
                      <td className="p-2 text-gray-600">FASE {k.fase || 'A'}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleDeleteKelas(k.id)} className="text-red-600 p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          {loading ? (
            <div className="py-6 text-center text-xs text-gray-500">Memuat data mapel...</div>
          ) : mapels.length === 0 ? (
            <div className="py-6 border-2 border-dashed rounded-lg text-center text-xs text-gray-500">
              Belum ada mata pelajaran. Tambahkan mapel menggunakan tombol di atas.
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto border rounded-md text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2 border-b w-12 text-center">No</th>
                    <th className="p-2 border-b">Nama Mata Pelajaran</th>
                    <th className="p-2 border-b w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mapels.map((m, idx) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-2 font-medium">{m.nama}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleDeleteMapel(m.id)} className="text-red-600 p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-md flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isNextValid}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Lanjut Ke Langkah Akhir
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
