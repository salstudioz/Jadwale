'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function BrandLogo({
  size = 'md',
  showText = true,
  href = '/dashboard',
  className = '',
}: BrandLogoProps) {
  const heightClass =
    size === 'sm' ? 'h-7' : size === 'lg' ? 'h-10' : 'h-8';

  const logoContent = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center shrink-0">
        <img
          src="/logo-light.png"
          alt="Jadwale Logo"
          className={`${heightClass} w-auto object-contain dark:hidden transition-opacity`}
        />
        <img
          src="/logo-dark.png"
          alt="Jadwale Logo"
          className={`${heightClass} w-auto object-contain hidden dark:block transition-opacity`}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
