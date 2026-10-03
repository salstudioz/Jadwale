'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  desc?: string;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color,
  bgColor,
  desc,
  loading = false,
}: StatCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center font-bold"
              style={{ backgroundColor: bgColor, color: color }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Kelola <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
              {value}
            </div>
          )}

          <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1.5">
            {label}
          </div>
          {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{desc}</p>}
        </div>
      </div>
    </Link>
  );
}
