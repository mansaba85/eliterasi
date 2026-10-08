'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import DashboardSiswa from '@/components/DashboardSiswa';
import { Bookmark, LogIn } from 'lucide-react';

export default function BookmarkPage() {
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
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Koleksi Bookmark & Buku</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Masuk ke akun Anda untuk menyimpan tulisan inspiratif dan mencatat buku yang sedang dibaca.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1d3580] transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Portal Sekarang</span>
          </Link>
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
          activeTab="bookmark"
          onNavigateTab={(tab) => {
            if (tab === 'beranda') router.push('/');
            if (tab === 'tulis') router.push('/tulis');
            if (tab === 'mingguresumen') router.push('/minggu-literasi');
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
