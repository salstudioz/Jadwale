'use client';

import React, { useState } from 'react';
import api from '../../../lib/axios';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';

interface SetupStep1Props {
  initialData?: any;
  onNext: (updatedData: any) => void;
}

export default function SetupStep1Profil({ initialData, onNext }: SetupStep1Props) {
  const [namaSekolah, setNamaSekolah] = useState(initialData?.nama_sekolah || '');
  const jenjang = 'SD'; // Fokus SD untuk saat ini
  const [npsn, setNpsn] = useState(initialData?.npsn || '');
  const [alamat, setAlamat] = useState(initialData?.alamat || '');
  const [kepalaSekolah, setKepalaSekolah] = useState(initialData?.kepala_sekolah || '');
  const [semesterAktif, setSemesterAktif] = useState(initialData?.semester_aktif || 'GASAL');
  const [tahunPelajaran, setTahunPelajaran] = useState(initialData?.tahun_pelajaran || '2026/2027');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!namaSekolah.trim()) {
      errs.namaSekolah = 'Nama Sekolah wajib diisi';
    }

    if (npsn.trim()) {
      if (!/^\d{8}$/.test(npsn.trim())) {
        errs.npsn = 'NPSN harus 8 digit angka (contoh: 20101234)';
      }
    }

    if (!tahunPelajaran.trim()) {
      errs.tahunPelajaran = 'Tahun Pelajaran wajib diisi';
    } else if (!/^\d{4}\/\d{4}$/.test(tahunPelajaran.trim())) {
      errs.tahunPelajaran = 'Format Tahun Pelajaran harus YYYY/YYYY (contoh: 2026/2027)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        nama_sekolah: namaSekolah.trim(),
        jenjang,
        npsn: npsn.trim() || undefined,
        alamat: alamat.trim() || undefined,
        kepala_sekolah: kepalaSekolah.trim() || undefined,
        semester_aktif: semesterAktif,
        tahun_pelajaran: tahunPelajaran.trim(),
        setupStep: 2,
      };

      const res = await api.patch('/sekolah', payload);
      onNext(res.data);
    } catch (err: any) {
      console.error(err);
      setErrors({ server: err.response?.data?.message || 'Gagal menyimpan profil sekolah' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-md">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langkah 1: Profil Sekolah</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Isi data dasar sekolah Anda untuk penyesuaian cetak dan format jadwal.</p>
        </div>
      </div>

      {errors.server && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
          {errors.server}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Sekolah */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Nama Sekolah <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={namaSekolah}
            onChange={(e) => setNamaSekolah(e.target.value)}
            placeholder="Contoh: SD Negeri 2 Kertosari"
            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
          {errors.namaSekolah && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.namaSekolah}</p>}
        </div>

        {/* Jenjang SD — hardcoded, tidak ditampilkan ke user */}

        {/* NPSN */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            NPSN <span className="text-xs text-gray-500 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            maxLength={8}
            value={npsn}
            onChange={(e) => setNpsn(e.target.value)}
            placeholder="8 digit angka (contoh: 20101234)"
            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
          {errors.npsn && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.npsn}</p>}
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Alamat Sekolah <span className="text-xs text-gray-500 font-normal">(Opsional)</span>
          </label>
          <textarea
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Jl. Pendidikan No. 123, Kabupaten..."
            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm resize-none"
          />
        </div>

        {/* Nama Kepala Sekolah */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Nama Kepala Sekolah <span className="text-xs text-gray-500 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={kepalaSekolah}
            onChange={(e) => setKepalaSekolah(e.target.value)}
            placeholder="Dr. H. Ahmad Dahlan, M.Pd."
            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Semester Aktif */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Semester Aktif <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['GASAL', 'GENAP'].map((sem) => (
                <label
                  key={sem}
                  className={`flex items-center justify-center p-2.5 rounded-md border cursor-pointer font-medium text-xs sm:text-sm transition-all ${
                    semesterAktif === sem
                      ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="semester"
                    value={sem}
                    checked={semesterAktif === sem}
                    onChange={(e) => setSemesterAktif(e.target.value)}
                    className="sr-only"
                  />
                  {sem === 'GASAL' ? 'Gasal (Ganjil)' : 'Genap'}
                </label>
              ))}
            </div>
          </div>

          {/* Tahun Pelajaran */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Tahun Pelajaran <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tahunPelajaran}
              onChange={(e) => setTahunPelajaran(e.target.value)}
              placeholder="2026/2027"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
            {errors.tahunPelajaran && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.tahunPelajaran}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Lanjut Ke Data Guru'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
