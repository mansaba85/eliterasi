'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import PanelGuru from '@/components/PanelGuru';
import ModalDetailPost from '@/components/ModalDetailPost';
import { Post, Comment } from '@/lib/types';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function GuruPage() {
  const { 
    currentUser, 
    posts, 
    users, 
    periods, 
    classes, 
    categories,
    likePost,
    commentPost,
    reactPost,
    gradePost 
  } = useApp();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const isTeacherOrAdmin = currentUser?.role === 'guru' || currentUser?.role === 'admin' || currentUser?.role === 'kepala_madrasah';

  return (
    <AppShell>
      {!currentUser ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Akses Terbatas Guru & Pembimbing</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman ini khusus untuk Dewan Guru & Tim Pembina Literasi MA NU 01 Banyuputih. Silakan masuk terlebih dahulu dengan akun staff.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1d3580] transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Portal Guru</span>
          </Link>
        </div>
      ) : !isTeacherOrAdmin ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Akses Ditolak</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Akun Anda terdaftar sebagai <span className="font-bold text-slate-800">Siswa</span>. Halaman ini hanya dapat diakses oleh dewan guru dan pembina literasi madrasah.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold"
          >
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      ) : (
        <>
          <PanelGuru
            currentUser={currentUser}
            posts={posts}
            users={users}
            periods={periods}
            classes={classes}
            categories={categories}
            onOpenDetail={(post) => setSelectedPost(post)}
          />

          {selectedPost && (
            <ModalDetailPost
              post={selectedPost}
              categories={categories}
              currentUser={currentUser}
              onClose={() => setSelectedPost(null)}
              onLike={(id) => likePost(id)}
              onComment={(id, text) => {
                const newComment = commentPost(id, text);
                if (newComment) {
                  setSelectedPost(prev => {
                    if (!prev || prev.id !== id) return prev;
                    const currentComments = Array.isArray(prev.comments) ? prev.comments : [];
                    if (currentComments.some(c => c.id === newComment.id)) {
                      return prev;
                    }
                    return {
                      ...prev,
                      comments: [...currentComments, newComment]
                    };
                  });
                }
              }}
              onReact={(id, type) => reactPost(id, type)}
              onGrade={(id, score, feedback) => {
                gradePost(id, score, feedback);
                // Sync local modal state
                setSelectedPost(prev => prev ? {
                  ...prev,
                  grade: {
                    skor: score,
                    catatan: feedback,
                    guruId: currentUser.id,
                    guruNama: currentUser.nama,
                    gradedAt: new Date().toISOString()
                  }
                } : null);
              }}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
