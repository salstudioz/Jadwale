'use client';

import { useState } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  MessageSquare, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Clock, 
  Globe, 
  Filter
} from 'lucide-react';
import api from '../lib/axios';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  namaSekolah?: string;
  selectedPeriodeId?: number | null;
  kelasList?: string[];
  currentClass?: string | null;
}

export default function ShareExportModal({
  isOpen,
  onClose,
  namaSekolah = 'Sekolah',
  selectedPeriodeId,
  kelasList = [],
  currentClass = null,
}: ShareExportModalProps) {
  const [activeTab, setActiveTab] = useState<'share' | 'export'>('share');

  // Share States
  const [shareAccess, setShareAccess] = useState('read');
  const [shareDays, setShareDays] = useState(30);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(currentClass || 'all');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Export States
  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const res = await api.post('/jadwal/share', { 
        permission: shareAccess, 
        days: shareDays 
      });
      
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${origin}/share/${res.data.uuid}${selectedClassFilter !== 'all' ? `?kelas=${encodeURIComponent(selectedClassFilter)}` : ''}`;
      setGeneratedLink(link);
    } catch (err) {
      alert('Gagal membuat tautan berbagi. Silakan coba lagi.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const linkToShare = generatedLink || `${window.location.origin}/share/latest`;
    const classInfo = selectedClassFilter !== 'all' ? ` (Kelas ${selectedClassFilter})` : '';
    const message = `*Jadwal Pelajaran ${namaSekolah}*${classInfo}\n\nSilakan akses jadwal pelajaran melalui tautan berikut:\n${linkToShare}\n\nDibuat otomatis via Jadwale.`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleExportFile = async (type: 'excel' | 'pdf') => {
    setIsExporting(type);
    try {
      const query = selectedPeriodeId ? `?periodeId=${selectedPeriodeId}` : '';
      const response = await api.get(`/export/${type}${query}`, { 
        responseType: 'blob' 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const ext = type === 'excel' ? 'xlsx' : 'pdf';
      const timeStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Jadwal_Pelajaran_${namaSekolah.replace(/\s+/g, '_')}_${timeStr}.${ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Gagal mengunduh berkas ${type.toUpperCase()}. Silakan coba lagi.`);
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/10 text-blue-700 flex items-center justify-center font-bold">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Bagikan & Ekspor Jadwal</h2>
              <p className="text-xs text-muted-foreground">{namaSekolah}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-muted/20 px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'share'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe size={16} />
            Bagikan Link & WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download size={16} />
            Download File & Cetak
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: SHARE LINK & WHATSAPP */}
          {activeTab === 'share' && (
            <div className="space-y-5">
              
              {/* Filter Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Filter size={13} />
                    Cakupan Kelas
                  </label>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => {
                      setSelectedClassFilter(e.target.value);
                      setGeneratedLink('');
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="all">Seluruh Kelas (Lengkap)</option>
                    {kelasList.map((cls) => (
                      <option key={cls} value={cls}>
                        Hanya Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Clock size={13} />
                    Masa Berlaku Link
                  </label>
                  <select
                    value={shareDays}
                    onChange={(e) => {
                      setShareDays(Number(e.target.value));
                      setGeneratedLink('');
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value={7}>7 Hari</option>
                    <option value={30}>30 Hari (Direkomendasikan)</option>
                    <option value={90}>90 Hari (1 Semester)</option>
                    <option value={365}>1 Tahun Pelajaran</option>
                  </select>
                </div>
              </div>

              {/* Generate Link Trigger */}
              {!generatedLink ? (
                <button
                  onClick={handleGenerateLink}
                  disabled={isGeneratingLink}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Globe size={18} />
                  {isGeneratingLink ? 'Membuat Tautan Share...' : 'Buat Tautan Publik'}
                </button>
              ) : (
                <div className="space-y-3 bg-muted/30 border border-border rounded-xl p-4 animate-in fade-in">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Tautan Publik Siap Dibagikan:
                  </span>

                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="bg-transparent text-sm font-medium text-foreground w-full outline-none select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleWhatsAppShare}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
                    >
                      <MessageSquare size={18} />
                      Kirim ke WhatsApp Guru/Siswa
                    </button>
                  </div>
                </div>
              )}

              {/* Information Note */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Globe size={16} className="shrink-0 text-blue-700 mt-0.5" />
                <p>
                  Siapa saja yang menerima link ini dapat melihat jadwal secara langsung melalui browser (HP / Laptop) tanpa perlu login ke aplikasi.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: EXPORT & PRINT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pilih format dokumen jadwal yang ingin Anda unduh atau cetak untuk arsip sekolah:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Excel Option */}
                <button
                  onClick={() => handleExportFile('excel')}
                  disabled={isExporting !== null}
                  className="p-5 border border-border hover:border-emerald-600 rounded-2xl bg-card hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={24} />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                      .XLSX
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-emerald-700 transition-colors">
                      Format Excel (.xlsx)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cocok untuk diedit kembali di Microsoft Excel & rekap total JP guru.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    {isExporting === 'excel' ? 'Mengunduh...' : 'Download Excel →'}
                  </span>
                </button>

                {/* PDF Option */}
                <button
                  onClick={() => handleExportFile('pdf')}
                  disabled={isExporting !== null}
                  className="p-5 border border-border hover:border-rose-600 rounded-2xl bg-card hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-left transition-all group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <FileText size={24} />
                    </div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 px-2.5 py-1 rounded-full">
                      .PDF
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-rose-700 transition-colors">
                      Dokumen PDF (.pdf)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Format rapi dan siap dicetak langsung tanpa takut susunan berubah.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    {isExporting === 'pdf' ? 'Mengunduh...' : 'Download PDF →'}
                  </span>
                </button>
              </div>

              {/* Direct Print Option */}
              <div className="pt-3 border-t border-border">
                <button
                  onClick={handlePrint}
                  className="w-full border border-border hover:bg-muted text-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Printer size={18} className="text-blue-700" />
                  Cetak Langsung via Printer Browser
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
