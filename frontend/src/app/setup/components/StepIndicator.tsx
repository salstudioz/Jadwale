'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  current: number;
  total?: number;
  labels?: string[];
}

export default function StepIndicator({
  current,
  total = 4,
  labels = ['Profil Sekolah', 'Data Guru', 'Kelas & Mapel', 'Selesai'],
}: StepIndicatorProps) {
  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0" />
        
        {/* Active connector line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-700 transition-all duration-300 -translate-y-1/2 z-0"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
        />

        {Array.from({ length: total }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < current;
          const isCurrent = stepNum === current;

          return (
            <div key={stepNum} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  isCompleted
                    ? 'bg-blue-700 text-white'
                    : isCurrent
                    ? 'bg-blue-700 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                    : 'bg-white dark:bg-gray-800 text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : stepNum}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[90px] sm:max-w-none ${
                  isCurrent ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {labels[idx] || `Step ${stepNum}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
