'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TantanganPage() {
  const router = useRouter();

  useEffect(() => {
    // Fitur tantangan dinonaktifkan sesuai arahan madrasah, redirect ke agenda literasi utama
    router.replace('/minggu-literasi');
  }, [router]);

  return null;
}
