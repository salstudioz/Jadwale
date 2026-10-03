'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface GenerateProgressProps {
  onComplete: () => void;
}

export default function GenerateProgressState({ onComplete }: GenerateProgressProps) {
  const [progress, setProgress] = useState(5);
  const [message, setMessage] = useState('Mengumpulkan data master & relasi...');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const messagesList = [
    { pct: 15, msg: 'Menyiapkan variabel CSP...' },
    { pct: 30, text: 'Menghitung slot jam pelajaran...' },
    { pct: 55, text: 'Mencocokkan ketersediaan guru...' },
    { pct: 75, text: 'Memeriksa konflik dan bentrok jam...' },
    { pct: 90, text: 'Merapikan susunan jadwal per kelas...' },
    { pct: 100, text: 'Menyelesaikan penjadwalan!' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete(), 600);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 15) + 5;
        const currentMsg = messagesList.find((m) => next <= (m.pct || 0))?.text || 'Memproses jadwal...';
        setMessage(currentMsg);
        return Math.min(next, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-700" />
          Menyusun Jadwal Pelajaran Otomatis...
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Waktu berjalan: {elapsedSeconds} detik
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>{message}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-700 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* > 30s Alert Warning */}
      {elapsedSeconds >= 10 && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Proses memakan waktu lebih lama dari biasanya. Mohon jangan tutup halaman ini.</span>
        </div>
      )}
    </div>
  );
}
