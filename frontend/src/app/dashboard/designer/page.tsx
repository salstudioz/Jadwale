'use client';

import { useState } from 'react';
import { Sparkles, Plus, Palette, CheckCircle2, Lock, Gift, Layout, X } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';

interface TemplateItem {
  id: number;
  name: string;
  is_premium: boolean;
  price: string;
  category: string;
}

export default function DesignerPage() {
  const user = useAuthStore((s) => s.user);

  const [templates, setTemplates] = useState<TemplateItem[]>([
    { id: 1, name: 'Template Modern Minimalis', is_premium: false, price: 'Gratis', category: 'Umum' },
    { id: 2, name: 'Template Elegant Dark Gradient', is_premium: true, price: 'Rp 25.000', category: 'Premium' },
    { id: 3, name: 'Template Warna-Warni Sekolah Dasar', is_premium: false, price: 'Gratis', category: 'SD' },
    { id: 4, name: 'Template Professional Pastel', is_premium: true, price: 'Rp 35.000', category: 'SMP/SMA' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', is_premium: false, price: '' });

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const item: TemplateItem = {
      id: Date.now(),
      name: newTemplate.name,
      is_premium: newTemplate.is_premium,
      price: newTemplate.is_premium ? (newTemplate.price || 'Rp 20.000') : 'Gratis',
      category: 'Kustom',
    };
    setTemplates([item, ...templates]);
    setShowModal(false);
    setNewTemplate({ name: '', is_premium: false, price: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Studio */}
      <div className="card p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <Palette size={14} /> Akun Designer: {user?.nama}
            </div>
            <h1 className="text-2xl font-extrabold">Studio Template Desain Jadwal</h1>
            <p className="text-purple-100 text-xs mt-1">
              Buat dan publikasikan desain tampilan jadwal sekolah (Gratis / Premium / Berbayar)
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn bg-white text-purple-700 hover:bg-purple-50 border-none font-bold text-xs px-4 py-2.5 inline-flex items-center gap-2 shrink-0 shadow"
          >
            <Plus size={16} /> Buat Template Baru
          </button>
        </div>
      </div>

      {/* Modal Add Template */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" /> Buat Template Desain
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTemplate} className="space-y-3">
              <div>
                <label className="field-label">Nama Template</label>
                <input
                  type="text" required
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Nama Template"
                  className="field-input"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox" id="is_premium"
                  checked={newTemplate.is_premium}
                  onChange={(e) => setNewTemplate({ ...newTemplate, is_premium: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="is_premium" className="text-xs font-bold cursor-pointer">
                  Tandai sebagai Template Premium / Berbayar
                </label>
              </div>

              {newTemplate.is_premium && (
                <div>
                  <label className="field-label">Harga Template</label>
                  <input
                    type="text"
                    value={newTemplate.price}
                    onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })}
                    placeholder="Harga Template"
                    className="field-input"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="card p-4 space-y-3 bg-card border border-border rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-gradient-to-br from-muted to-muted/40 border border-border flex items-center justify-center relative overflow-hidden">
                <Layout size={36} className="text-muted-foreground/50" />
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tmpl.is_premium ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {tmpl.is_premium ? <span className="flex items-center gap-1"><Lock size={10} /> Premium</span> : <span className="flex items-center gap-1"><Gift size={10} /> Gratis</span>}
                </span>
              </div>

              <h3 className="font-bold text-sm text-foreground line-clamp-1">{tmpl.name}</h3>
              <p className="text-xs text-muted-foreground">Kategori: {tmpl.category}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="font-extrabold text-xs text-primary">{tmpl.price}</span>
              <button className="btn btn-outline text-[11px] py-1 px-2.5">Edit Style</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
