'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface GenerateStepIndicatorProps {
  current: number;
}

export default function GenerateStepIndicator({ current }: GenerateStepIndicatorProps) {
  const steps = [
    { num: 1, label: 'Pilih Periode' },
    { num: 2, label: 'Atur Preferensi' },
    { num: 3, label: 'Review & Jalankan' },
    { num: 4, label: 'Hasil Generate' },
  ];

  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-700 transition-all duration-300 -translate-y-1/2 z-0"
          style={{ width: `${((current - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s) => {
          const isCompleted = s.num < current;
          const isCurrent = s.num === current;

          return (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted
                    ? 'bg-blue-700 text-white'
                    : isCurrent
                    ? 'bg-blue-700 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                    : 'bg-white dark:bg-gray-800 text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.num}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center ${
                  isCurrent ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
