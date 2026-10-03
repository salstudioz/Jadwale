'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import StepIndicator from './components/StepIndicator';
import SetupStep1Profil from './components/SetupStep1Profil';
import SetupStep2Guru from './components/SetupStep2Guru';
import SetupStep3KelasMapel from './components/SetupStep3KelasMapel';
import SetupStep4Selesai from './components/SetupStep4Selesai';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2, Calendar } from 'lucide-react';

export default function SetupPage() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<number>(1);
  const [sekolahData, setSekolahData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        setLoading(true);
        const res = await api.get('/sekolah');
        setSekolahData(res.data);
        if (res.data?.setupStep) {
          setStep(res.data.setupStep);
        }
      } catch (err) {
        console.error('Error fetching sekolah data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSekolah();
  }, []);

  const handleStep1Next = (updatedSekolah: any) => {
    setSekolahData(updatedSekolah);
    setStep(2);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Branding */}
        <div className="max-w-4xl w-full mx-auto mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg">
              J
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Jadwale</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Panduan Setup Awal Sekolah Baru</p>
        </div>

        {/* Step Indicator */}
        <div className="max-w-4xl w-full mx-auto">
          <StepIndicator current={step} total={4} labels={['Profil Sekolah', 'Data Guru', 'Kelas & Mapel', 'Selesai']} />
        </div>

        {/* Main Step Content */}
        <div className="max-w-4xl w-full mx-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <SetupStep1Profil
                  initialData={sekolahData}
                  onNext={handleStep1Next}
                />
              )}
              {step === 2 && (
                <SetupStep2Guru
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <SetupStep3KelasMapel
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <SetupStep4Selesai
                  onBack={() => setStep(3)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
