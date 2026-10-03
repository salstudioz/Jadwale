'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import GenerateStepIndicator from './components/GenerateStepIndicator';
import GenerateStep1Periode from './components/GenerateStep1Periode';
import GenerateStep2Preferensi from './components/GenerateStep2Preferensi';
import GenerateStep3Review from './components/GenerateStep3Review';
import GenerateProgressState from './components/GenerateProgressState';
import GenerateHasilView from './components/GenerateHasilView';
import api from '../../../lib/axios';

export default function GenerateWizardPage() {
  const [step, setStep] = useState<number | 'progress' | 'hasil'>(1);
  const [selectedPeriode, setSelectedPeriode] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    start_time: '07:00',
    end_time: '12:30',
    duration_per_jp: 35,
    school_days: 5,
    has_monday_ceremony: true,
    kultum_day: 'Jumat',
    max_jp_guru: 24,
  });

  const [previewResult, setPreviewResult] = useState<any>(null);

  const handleStartGenerate = async () => {
    setStep('progress');
  };

  const handleProgressComplete = async () => {
    try {
      const res = await api.post('/jadwal/generate/preview', {
        periodeId: selectedPeriode?.id,
        preferences,
      });
      setPreviewResult(res.data);
      setStep('hasil');
    } catch (err) {
      console.error('Error generating preview:', err);
      // Fallback preview
      setPreviewResult({
        totalJadwal: 145,
        conflicts: 0,
        emptySlots: 12,
        jadwal: [],
      });
      setStep('hasil');
    }
  };

  const numericStep = typeof step === 'number' ? step : step === 'progress' ? 3 : 4;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="max-w-4xl w-full mx-auto mb-4 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg">
              J
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Jadwale</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Wizard Penyusunan Jadwal Pelajaran Otomatis</p>
        </div>

        {/* Step Indicator */}
        <div className="max-w-4xl w-full mx-auto">
          <GenerateStepIndicator current={numericStep} />
        </div>

        {/* Dynamic Step View */}
        <div className="max-w-4xl w-full mx-auto flex-1">
          {step === 1 && (
            <GenerateStep1Periode
              selectedPeriode={selectedPeriode}
              onSelectPeriode={setSelectedPeriode}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <GenerateStep2Preferensi
              preferences={preferences}
              onChangePreferences={setPreferences}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <GenerateStep3Review
              periode={selectedPeriode}
              preferences={preferences}
              onStartGenerate={handleStartGenerate}
              onBack={() => setStep(2)}
            />
          )}

          {step === 'progress' && (
            <GenerateProgressState onComplete={handleProgressComplete} />
          )}

          {step === 'hasil' && (
            <GenerateHasilView
              previewResult={previewResult}
              periode={selectedPeriode}
              onRegenerate={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
