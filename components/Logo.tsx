'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  light?: boolean;
  variant?: 'branding' | 'icon' | 'auto'; // 'branding' = logo lengkap teks, 'icon' = ikon 'E' buku saja, 'auto' = branding image + subtitle madrasah
  showSubtitle?: boolean;
}

export default function Logo({ 
  size = 'md', 
  light = false, 
  variant = 'branding',
  showSubtitle = true 
}: LogoProps) {
  // Dimensi banner branding (eliterasi_branding.png / eliterasi_branding_white.png)
  const brandingDimensions = 
    size === 'sm' ? { width: 140, height: 38, className: 'h-7 sm:h-7.5 w-auto' } :
    size === 'lg' ? { width: 220, height: 60, className: 'h-11 sm:h-12 w-auto' } :
    size === 'xl' ? { width: 280, height: 76, className: 'h-14 sm:h-16 w-auto' } :
    { width: 180, height: 49, className: 'h-8.5 sm:h-9.5 w-auto' };

  // Dimensi ikon 'E' (eliterasi.png)
  const iconDimensions = 
    size === 'sm' ? { width: 32, height: 42, className: 'h-8 w-auto' } :
    size === 'lg' ? { width: 48, height: 64, className: 'h-12 w-auto' } :
    size === 'xl' ? { width: 64, height: 85, className: 'h-16 w-auto' } :
    { width: 38, height: 50, className: 'h-9.5 w-auto' };

  if (variant === 'icon') {
    return (
      <div className="flex items-center select-none">
        <Image
          src="/eliterasi.png"
          alt="E-Literasi Logo"
          width={iconDimensions.width}
          height={iconDimensions.height}
          className={`${iconDimensions.className} object-contain drop-shadow-2xs transition-transform duration-200 hover:scale-105`}
          priority
        />
      </div>
    );
  }

  const subSize = 
    size === 'sm' ? 'text-[8px]' : 
    size === 'lg' ? 'text-[11px]' : 
    size === 'xl' ? 'text-xs' : 
    'text-[9px] sm:text-[9.5px]';

  const logoSrc = light ? '/eliterasi_branding_white.png' : '/eliterasi_branding.png';

  return (
    <div className="flex flex-col select-none group">
      {/* Gambar Logo Branding Resmi (Putih Bersih jika di background gelap) */}
      <div className="relative flex items-center">
        <Image
          src={logoSrc}
          alt="E-LITERASi"
          width={brandingDimensions.width}
          height={brandingDimensions.height}
          className={`${brandingDimensions.className} object-contain transition-transform duration-200 group-hover:scale-[1.02] drop-shadow-2xs`}
          priority
        />
      </div>

      {/* Subjudul Madrasah */}
      {showSubtitle && (
        <span className={`${subSize} font-sans font-extrabold tracking-widest uppercase mt-0.5 pl-0.5 ${light ? 'text-white/85' : 'text-slate-500'}`}>
          MA NU 01 BANYUPUTIH
        </span>
      )}
    </div>
  );
}
