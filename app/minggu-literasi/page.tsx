'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import DashboardSiswa from '@/components/DashboardSiswa';
import { Calendar, LogIn } from 'lucide-react';

export default function MingguLiterasiPage() {
  const router = useRouter();
  const {
    currentUser,
    posts,
    users,
    classes,
    categories,
    challenges,
    readingBooks,
    activePeriod,
    createPost,
    updatePost,
    deletePost,
    likePost,
    bookmarkPost,
    commentPost,
    reactPost,
    gradePost,
    joinChallenge,
    addReadingBook,
    updateReadingBookStatus,
    deleteReadingBook,
  } = useApp();

  return (
    <AppShell>
      {!currentUser ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#132257] flex items-center justify-center mx-auto shadow-2xs">
            <Calendar className="w-7 h-7 text-[#132257]" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Agenda Minggu Literasi</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman pemantauan tugas pekanan, rekap partisipasi per kelas, dan pengumpulan karya Minggu Literasi dikhususkan bagi siswa dan guru MA NU 01 Banyuputih.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1d3580] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Portal Siswa / Guru</span>
            </Link>
          </div>
        </div>
      ) : (
        <DashboardSiswa
          currentUser={currentUser}
          posts={posts}
          users={users}
          classes={classes}
          categories={categories}
          challenges={challenges}
          readingBooks={readingBooks}
          activePeriod={activePeriod}
          activeTab="mingguresumen"
          onNavigateTab={(tab) => {
            if (tab === 'beranda') router.push('/');
            if (tab === 'tulis') router.push('/tulis');
            if (tab === 'bookmark') router.push('/bookmark');
            if (tab === 'tantangan') router.push('/tantangan');
          }}
          onPostCreated={createPost}
          onPostUpdated={updatePost}
          onPostDeleted={deletePost}
          onLike={likePost}
          onBookmark={bookmarkPost}
          onComment={commentPost}
          onReact={reactPost}
          onGrade={gradePost}
          onJoinChallenge={joinChallenge}
          onAddReadingBook={addReadingBook}
          onUpdateBookStatus={updateReadingBookStatus}
          onDeleteBook={deleteReadingBook}
        />
      )}
    </AppShell>
  );
}
