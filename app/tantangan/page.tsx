'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import DashboardSiswa from '@/components/DashboardSiswa';

export default function TantanganPage() {
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
      <DashboardSiswa
        currentUser={currentUser || {
          id: 'guest',
          nama: 'Tamu Madrasah',
          role: 'siswa',
          bio: 'Pengunjung literasi madrasah',
          poin: 0,
          createdAt: new Date().toISOString()
        }}
        posts={posts}
        users={users}
        classes={classes}
        categories={categories}
        challenges={challenges}
        readingBooks={readingBooks}
        activePeriod={activePeriod}
        activeTab="tantangan"
        onNavigateTab={(tab) => {
          if (tab === 'beranda') router.push('/');
          if (tab === 'tulis') router.push('/tulis');
          if (tab === 'bookmark') router.push('/bookmark');
          if (tab === 'mingguresumen') router.push('/minggu-literasi');
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
    </AppShell>
  );
}
