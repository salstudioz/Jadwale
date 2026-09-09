'use client';

import { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../../../store/useLanguageStore';
import { Play, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';

export default function Step5Generate() {
  const router = useRouter();
  const { token } = useAuthStore();
  const isAuth = !!token;
  const wizardState = useWizardStore();
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/sekolah/hydrate', wizardState);
      router.push('/dashboard/jadwal');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto py-12">
      <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6">
        <Play className="w-10 h-10 text-white translate-x-1" />
      </div>
      
      <div>
        <h2 className="text-3xl font-extrabold mb-3 text-foreground">{t.step5Title}</h2>
        <p className="text-foreground/70 text-lg">
          {t.step5Desc}
        </p>
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mt-6 font-bold">
          {error}
        </div>
      )}

      {!isAuth ? (
        <div className="w-full bg-orange-50 border border-orange-200 p-6 rounded-xl mt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="font-bold text-orange-800 mb-2">{t.restrictedAccessTitle}</h3>
          <p className="text-orange-800/80 text-sm mb-6 font-medium">
            {t.restrictedAccessDesc}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                {t.loginNowBtn}
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-8 py-4 bg-primary hover:bg-primary/90 disabled:opacity-70 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3 text-lg mt-8"
        >
          {loading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> {t.savingData}</>
          ) : (
            <>{t.startGenerateBtn} <Play className="w-5 h-5" /></>
          )}
        </button>
      )}
    </div>
  );
}
