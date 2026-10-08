'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import DashboardSiswa from '@/components/DashboardSiswa';
import { PenTool, LogIn } from 'lucide-react';

export default function TulisPage() {
  const router = useRouter();
  const {
    currentUser,
    posts,
    categories,
    challenges,
    readingBooks,
    activePeriod,
    createPost,
    updatePost,
    deletePost,
    joinChallenge,
    addReadingBook,
    updateReadingBookStatus,
    deleteReadingBook,
  } = useApp();

  return (
    <AppShell>
      {!currentUser ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <PenTool className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Masuk Untuk Menulis Karya</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Untuk menerbitkan tulisan literasi, puisi, cerpen, atau resensi buku, silakan masuk ke akun siswa Anda terlebih dahulu.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1d3580] transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Portal Sekarang</span>
          </Link>
        </div>
      ) : currentUser.role === 'admin' ? (
        <div className="bg-white rounded-3xl border border-blue-100 p-12 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#132257] flex items-center justify-center mx-auto text-2xl font-black">
            🛡️
          </div>
          <h2 className="text-xl font-black text-slate-900">Khusus Peserta Didik & Siswa</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sebagai <strong>Administrator IT & Koordinator Literasi</strong>, peran Anda difokuskan penuh untuk mengelola master data siswa, memoderasi karya, mengagendakan pekan literasi, serta mencetak laporan & piagam sertifikat.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1d3580] transition-colors"
            >
              <span>Buka Panel Admin</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      ) : (
        <DashboardSiswa
          currentUser={currentUser}
          posts={posts}
          categories={categories}
          challenges={challenges}
          readingBooks={readingBooks}
          activePeriod={activePeriod}
          activeTab="tulis"
          onNavigateTab={(tab) => {
            if (tab === 'beranda') router.push('/');
            if (tab === 'bookmark') router.push('/bookmark');
            if (tab === 'tantangan') router.push('/tantangan');
            if (tab === 'mingguresumen') router.push('/minggu-literasi');
          }}
          onPostCreated={(data) => {
            createPost(data);
            alert('Karya tulisan Anda berhasil dipublikasikan ke beranda!');
            router.push('/');
          }}
          onPostUpdated={(id, updates) => {
            updatePost(id, updates);
            alert('Perubahan karya berhasil disimpan!');
            router.push('/');
          }}
          onPostDeleted={deletePost}
          onJoinChallenge={joinChallenge}
          onAddReadingBook={addReadingBook}
          onUpdateBookStatus={updateReadingBookStatus}
          onDeleteBook={deleteReadingBook}
        />
      )}
    </AppShell>
  );
}
