'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, X, Loader2, FileText } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entitas: 'guru' | 'kelas' | 'mapel' | 'jadwal' | 'siswa';
  title: string;
  onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, entitas, title, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'upsert' | 'insert' | 'replace'>('upsert');
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((s) => s.token);

  if (!isOpen) return null;

  const handleFileSelect = (selected: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExts.includes(ext)) {
      setErrorMessage('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Maksimum 5 MB.');
      return;
    }
    setFile(selected);
    setPreviewData(null);
    setErrorMessage('');
    setSuccessMessage(`✅ File "${selected.name}" siap diproses (${(selected.size / 1024).toFixed(1)} KB)`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDownloadTemplate = async () => {
    try {
      // Gunakan fetch langsung agar bisa set Authorization header + handle blob
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').trim();
      const response = await fetch(`${apiUrl}/import/template/${entitas}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template-import-${entitas}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMessage(`Gagal mengunduh template: ${err.message || 'Pastikan Anda sudah login'}`);
    }
  };

  const handlePreviewUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/import/${entitas}?mode=${mode}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setPreviewData(res.data);
      const validCount = res.data.validRows ?? 0;
      const totalCount = res.data.totalRows ?? 0;
      setSuccessMessage(`✅ Preview selesai! ${validCount} dari ${totalCount} baris valid dan siap diimport.`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Gagal memproses file.';
      setErrorMessage(`❌ ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate preview stats
  let tokensToCommit: string[] = [];
  let totalValidRows = 0;
  let totalInvalidRows = 0;
  let totalDuplicateRows = 0;
  let totalRowsCount = 0;
  let previewRows: any[] = [];

  if (previewData) {
    if (previewData.previewToken) {
      tokensToCommit = [previewData.previewToken];
      totalValidRows = previewData.validRows || 0;
      totalInvalidRows = previewData.invalidRows || 0;
      totalDuplicateRows = previewData.duplicateRows || 0;
      totalRowsCount = previewData.totalRows || 0;
      previewRows = previewData.rows || [];
    } else if (typeof previewData === 'object') {
      for (const key of Object.keys(previewData)) {
        const item = previewData[key];
        if (item?.previewToken) {
          tokensToCommit.push(item.previewToken);
          totalValidRows += item.validRows || 0;
          totalInvalidRows += item.invalidRows || 0;
          totalDuplicateRows += item.duplicateRows || 0;
          totalRowsCount += item.totalRows || 0;
          if (Array.isArray(item.rows)) previewRows = [...previewRows, ...item.rows];
        }
      }
    }
  }

  const handleCommit = async () => {
    if (tokensToCommit.length === 0) return;
    setCommitting(true);
    setErrorMessage('');
    try {
      const res = await api.post('/import/commit', { previewTokens: tokensToCommit });
      const inserted = res.data?.inserted ?? res.data?.total ?? totalValidRows;
      const duration = res.data?.duration ?? '';
      setSuccessMessage(`🎉 Berhasil! ${inserted} data disimpan ke database.${duration ? ' (' + duration + ')' : ''}`);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data ke database.';
      setErrorMessage(`❌ ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setCommitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setErrorMessage('');
    setSuccessMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'VALID') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Valid</span>;
    if (status === 'DUPLICATE') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Duplikat</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">Invalid</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="text-primary" size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Import Bulk {title}</h2>
              <p className="text-xs text-muted-foreground">Upload file Excel/CSV untuk import data massal</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Download Template Banner */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={16} className="text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-foreground">
                Belum punya format file? Download template resmi Excel terlebih dahulu.
              </span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
            >
              <Download size={13} /> Download Template
            </button>
          </div>

          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!previewData ? (
            /* ── Step 1: Upload ── */
            <form onSubmit={handlePreviewUpload} className="space-y-4">
              {/* Mode Selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Mode Import
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upsert', label: 'Upsert', desc: 'Update data lama + tambah baru' },
                    { id: 'insert', label: 'Insert Baru', desc: 'Abaikan data duplikat' },
                    { id: 'replace', label: 'Replace', desc: 'Timpa semua data lama' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        mode === item.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <div className="font-bold">{item.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  File Excel (.xlsx, .xls) atau CSV (.csv)
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : file
                      ? 'border-emerald-400 bg-emerald-500/5'
                      : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-1">
                      <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
                      <div className="text-sm font-bold text-foreground">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB — Klik untuk ganti file</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-muted-foreground" size={32} />
                      <div className="text-sm font-semibold text-foreground">
                        {isDragging ? 'Lepaskan file di sini...' : 'Klik atau tarik file ke sini'}
                      </div>
                      <div className="text-xs text-muted-foreground">Format: .xlsx, .xls, .csv — Maks 5 MB</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={handleClose} className="btn btn-outline text-xs">
                  Batal
                </button>
                <button type="submit" disabled={!file || loading} className="btn btn-primary text-xs min-w-[140px]">
                  {loading ? (
                    <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Memproses...</span>
                  ) : (
                    'Cek & Preview File'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ── Step 2: Preview & Confirm ── */
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total Baris', value: totalRowsCount, color: 'bg-muted text-foreground' },
                  { label: 'Valid', value: totalValidRows, color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' },
                  { label: 'Duplikat', value: totalDuplicateRows, color: 'bg-amber-500/10 text-amber-600 border border-amber-500/30' },
                  { label: 'Invalid', value: totalInvalidRows, color: 'bg-red-500/10 text-red-600 border border-red-500/30' },
                ].map((s) => (
                  <div key={s.label} className={`p-3 rounded-xl text-center ${s.color}`}>
                    <div className="text-[11px] font-semibold opacity-80">{s.label}</div>
                    <div className="text-xl font-bold">{s.value}</div>
                  </div>
                ))}
              </div>

              {totalValidRows > 0 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-primary" />
                  <span>
                    {totalValidRows} baris valid siap disimpan. Data akan otomatis dikaitkan dengan entitas terkait di sekolah Anda.
                  </span>
                </div>
              )}

              {totalInvalidRows > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{totalInvalidRows} baris invalid tidak akan disimpan. Periksa kolom yang bertanda merah di bawah.</span>
                </div>
              )}

              {/* Preview Table */}
              <div className="max-h-56 overflow-y-auto border border-border rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-bold sticky top-0 z-10">
                    <tr>
                      <th className="p-2 w-10 text-center">#</th>
                      <th className="p-2 w-20 text-center">Status</th>
                      <th className="p-2">Data</th>
                      <th className="p-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.slice(0, 50).map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        className={
                          row.status === 'INVALID'
                            ? 'bg-red-500/5'
                            : row.status === 'DUPLICATE'
                            ? 'bg-amber-500/5'
                            : ''
                        }
                      >
                        <td className="p-2 text-center font-mono text-muted-foreground">{row.rowNumber}</td>
                        <td className="p-2 text-center">{getStatusBadge(row.status)}</td>
                        <td className="p-2 font-mono text-[10px] text-foreground max-w-[200px] truncate">
                          {Object.entries(row.data || {})
                            .slice(0, 4)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' | ')}
                        </td>
                        <td className="p-2 text-[10px] text-red-500 dark:text-red-400">
                          {Array.isArray(row.errors) ? row.errors.join(', ') : row.errors || ''}
                        </td>
                      </tr>
                    ))}
                    {previewRows.length > 50 && (
                      <tr>
                        <td colSpan={4} className="p-2 text-center text-xs text-muted-foreground italic">
                          ... dan {previewRows.length - 50} baris lainnya
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <button
                  onClick={() => { setPreviewData(null); setSuccessMessage(''); setErrorMessage(''); }}
                  className="btn btn-outline text-xs inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Ganti File
                </button>
                <div className="flex gap-2">
                  <button onClick={handleClose} className="btn btn-outline text-xs">Batal</button>
                  <button
                    onClick={handleCommit}
                    disabled={totalValidRows === 0 || committing}
                    className="btn btn-primary text-xs min-w-[160px]"
                  >
                    {committing ? (
                      <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Menyimpan...</span>
                    ) : (
                      `Simpan ${totalValidRows} Data Valid`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
