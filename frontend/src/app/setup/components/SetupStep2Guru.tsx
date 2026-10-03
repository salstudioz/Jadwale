'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '../../../lib/axios';
import { Users, Upload, Plus, Download, Trash2, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface SetupStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function SetupStep2Guru({ onNext, onBack }: SetupStep2Props) {
  const [gurus, setGurus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [addingManual, setAddingManual] = useState(false);
  
  // Manual add form
  const [namaGuru, setNamaGuru] = useState('');
  const [nipGuru, setNipGuru] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Excel Upload preview state
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGurus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/guru');
      setGurus(res.data || []);
    } catch (err) {
      console.error('Error fetching gurus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGurus();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/import/guru?mode=UPSERT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreviewToken(res.data.token);
      setPreviewStats(res.data.stats);
      setPreviewData(res.data.validData || []);
      setPreviewErrors(res.data.errors || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal membaca file Excel/CSV.');
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
      setPreviewErrors([]);
      await fetchGurus();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data import guru.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru.trim()) {
      setErrorMsg('Nama guru wajib diisi.');
      return;
    }

    try {
      await api.post('/guru', {
        nama: namaGuru.trim(),
        nip: nipGuru.trim() || undefined,
      });
      setNamaGuru('');
      setNipGuru('');
      setAddingManual(false);
      setErrorMsg('');
      await fetchGurus();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menambah data guru.');
    }
  };

  const handleDeleteGuru = async (id: number) => {
    try {
      await api.delete(`/guru/${id}`);
      await fetchGurus();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleNextStep = async () => {
    if (gurus.length === 0) return;
    try {
      await api.patch('/sekolah', { setupStep: 3 });
      onNext();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-md">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langkah 2: Data Tenaga Pendidik / Guru</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unggah daftar guru menggunakan file Excel atau tambahkan secara manual satu per satu.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-xs underline font-medium">Tutup</button>
        </div>
      )}

      {/* Upload Dropzone & Manual Action Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Upload Excel Card */}
        <div className="p-5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 transition-colors flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50">
          <FileSpreadsheet className="w-10 h-10 text-green-600 mb-2" />
          <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Import dari Excel / CSV</p>
          <p className="text-xs text-gray-500 mb-4">Format kolom: Nama Guru, NIP (opsional)</p>
          
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
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Mengunggah...' : 'Pilih File Excel'}
            </button>
            <a
              href="http://localhost:3000/api/import/template/guru"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Template
            </a>
          </div>
        </div>

        {/* Manual Add Card */}
        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50">
          <Users className="w-10 h-10 text-blue-600 mb-2" />
          <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Tambah Guru Manual</p>
          <p className="text-xs text-gray-500 mb-4">Input nama guru satu per satu tanpa Excel</p>
          <button
            type="button"
            onClick={() => setAddingManual(true)}
            className="px-4 py-2 border border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Guru
          </button>
        </div>
      </div>

      {/* Manual Add Modal / Form */}
      {addingManual && (
        <form onSubmit={handleManualSubmit} className="mb-6 p-4 border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">Form Tambah Guru Baru</h4>
            <button type="button" onClick={() => setAddingManual(false)} className="text-xs text-gray-500 hover:text-gray-700">Batal</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Guru *</label>
              <input
                type="text"
                required
                value={namaGuru}
                onChange={(e) => setNamaGuru(e.target.value)}
                placeholder="Drs. Bambang Hidayat"
                className="w-full px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">NIP (Opsional)</label>
              <input
                type="text"
                value={nipGuru}
                onChange={(e) => setNipGuru(e.target.value)}
                placeholder="197801012005011002"
                className="w-full px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-md"
            >
              Simpan Guru
            </button>
          </div>
        </form>
      )}

      {/* Import Preview Table if uploading */}
      {previewToken && (
        <div className="mb-6 p-4 border border-green-200 dark:border-green-900 bg-green-50/40 dark:bg-green-950/20 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Preview Data Excel ({previewStats?.valid} data valid, {previewStats?.invalid} error)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewToken(null)}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-md bg-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCommitUpload}
                disabled={uploading}
                className="px-4 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md"
              >
                {uploading ? 'Menyimpan...' : 'Konfirmasi & Impor'}
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white dark:bg-gray-900 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                  <th className="p-2 border-b">No</th>
                  <th className="p-2 border-b">Nama Guru</th>
                  <th className="p-2 border-b">NIP</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-2 text-gray-500">{idx + 1}</td>
                    <td className="p-2 font-medium text-gray-900 dark:text-white">{row.nama}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{row.nip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teachers List Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Daftar Guru Terdaftar ({gurus.length})
            {gurus.length === 0 && (
              <span className="text-xs text-red-600 font-normal">(Minimal 1 guru wajib ada)</span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Memuat data guru...</div>
        ) : gurus.length === 0 ? (
          <div className="py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500 text-xs">
            Belum ada data guru. Silakan upload file Excel atau gunakan tombol "Tambah Guru".
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                <tr>
                  <th className="p-2.5 border-b border-gray-200 dark:border-gray-700 w-12 text-center">No</th>
                  <th className="p-2.5 border-b border-gray-200 dark:border-gray-700">Nama Lengkap</th>
                  <th className="p-2.5 border-b border-gray-200 dark:border-gray-700">NIP</th>
                  <th className="p-2.5 border-b border-gray-200 dark:border-gray-700 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {gurus.map((g, idx) => (
                  <tr key={g.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="p-2.5 text-center text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-medium text-gray-900 dark:text-white">{g.nama}</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-400">{g.nip || '-'}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleDeleteGuru(g.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Hapus Guru"
                      >
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

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          disabled={gurus.length === 0}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Lanjut Ke Kelas & Mapel
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
