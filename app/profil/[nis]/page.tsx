'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import CardPost from '@/components/CardPost';
import ModalDetailPost from '@/components/ModalDetailPost';
import { Post, Comment } from '@/lib/types';
import { ArrowLeft, User as UserIcon, Star, BookOpen, Heart, Award } from 'lucide-react';

export default function ProfilNisPage() {
  const params = useParams();
  const router = useRouter();
  const nisParam = params?.nis as string;

  const {
    currentUser,
    users,
    posts,
    categories,
    likePost,
    bookmarkPost,
    commentPost,
    reactPost,
    gradePost,
  } = useApp();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Find user by NIS or ID
  const student = users.find(u => u.nis === nisParam || u.id === nisParam);

  if (!student) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Siswa Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data siswa dengan NIS atau ID &ldquo;{nisParam}&rdquo; tidak terdaftar dalam basis data madrasah.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const studentPosts = posts.filter(p => p.authorId === student.id && p.status === 'published');
  const likesReceived = studentPosts.reduce((acc, p) => acc + p.likes.length, 0);

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-left max-w-5xl mx-auto">
        {/* Navigation Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#132257] bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-150/80 overflow-hidden shadow-xs relative">
          <div className="h-24 sm:h-28 bg-gradient-to-r from-[#132257] via-[#1a337e] to-[#2563eb] relative p-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[10px] font-semibold">
              <span>Profil Siswa Madrasah</span>
            </span>
          </div>

          <div className="px-4 sm:px-6 pb-5 pt-0 relative">
            <div className="flex items-end justify-between gap-3 -mt-10 sm:-mt-12 mb-3.5">
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm shrink-0 select-none bg-slate-100">
                {student.fotoProfil ? (
                  <Image 
                    src={student.fotoProfil} 
                    alt={student.nama} 
                    fill 
                    className="object-cover" 
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center">
                    {student.nama.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {student.nama}
                </h2>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{student.poin || 0} Poin</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="text-[#132257] font-semibold">Kelas {student.kelasNama || 'Siswa'}</span>
                {student.nis && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>NIS: {student.nis}</span>
                  </>
                )}
              </p>

              <p className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-150/60 max-w-2xl leading-relaxed mt-2 font-normal">
                &ldquo;{student.bio || 'Pelajar MA NU 01 Banyuputih yang giat berliterasi.'}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Karya Terbit</p>
            <p className="text-3xl font-extrabold text-slate-900">{studentPosts.length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">📚 Tulisan orisinal</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Like Diterima</p>
            <p className="text-3xl font-extrabold text-slate-900">{likesReceived}</p>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">❤️ Apresiasi pembaca</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs col-span-2 md:col-span-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Minggu Literasi</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {studentPosts.filter(p => p.isMingguLiterasi).length}
            </p>
            <p className="text-[10px] text-indigo-600 font-semibold mt-1">🎯 Tugas wajib selesai</p>
          </div>
        </div>

        {/* Public Works List */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">
            Karya Tulisan oleh {student.nama} ({studentPosts.length})
          </h3>

          {studentPosts.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Siswa ini belum mempublikasikan karya literasi ke publik.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentPosts.map(post => (
                <CardPost
                  key={post.id}
                  post={post}
                  categories={categories}
                  currentUserId={currentUser?.id || ''}
                  onOpenDetail={(p) => setSelectedPost(p)}
                  onLike={(id) => likePost(id)}
                  onBookmark={(id) => bookmarkPost(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <ModalDetailPost
          post={selectedPost}
          categories={categories}
          currentUser={currentUser}
          onClose={() => setSelectedPost(null)}
          onLike={(id) => {
            likePost(id);
            setSelectedPost(prev => {
              if (!prev || prev.id !== id || !currentUser) return prev;
              const hasLiked = prev.likes.includes(currentUser.id);
              return {
                ...prev,
                likes: hasLiked
                  ? prev.likes.filter(uid => uid !== currentUser.id)
                  : [...prev.likes, currentUser.id]
              };
            });
          }}
          onBookmark={(id) => {
            bookmarkPost(id);
            setSelectedPost(prev => {
              if (!prev || prev.id !== id || !currentUser) return prev;
              const currentBm = prev.bookmarks || [];
              const hasBm = currentBm.includes(currentUser.id);
              return {
                ...prev,
                bookmarks: hasBm
                  ? currentBm.filter(uid => uid !== currentUser.id)
                  : [...currentBm, currentUser.id]
              };
            });
          }}
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
          onReact={(id, type) => {
            reactPost(id, type);
            setSelectedPost(prev => {
              if (!prev || prev.id !== id || !currentUser) return prev;
              const existingIdx = prev.reactions.findIndex(r => r.userId === currentUser.id);
              let nextReactions = [...prev.reactions];
              if (existingIdx !== -1) {
                if (nextReactions[existingIdx].tipeReaksi === type) {
                  nextReactions.splice(existingIdx, 1);
                } else {
                  nextReactions[existingIdx] = { ...nextReactions[existingIdx], tipeReaksi: type };
                }
              } else {
                nextReactions.push({
                  id: `react-${Date.now()}`,
                  postId: id,
                  userId: currentUser.id,
                  tipeReaksi: type,
                  createdAt: new Date().toISOString()
                });
              }
              return {
                ...prev,
                reactions: nextReactions
              };
            });
          }}
          onGrade={(id, score, feedback) => {
            gradePost(id, score, feedback);
            setSelectedPost(prev => prev ? {
              ...prev,
              grade: {
                skor: score,
                catatan: feedback,
                guruId: currentUser?.id || '',
                guruNama: currentUser?.nama || '',
                gradedAt: new Date().toISOString()
              }
            } : null);
          }}
        />
      )}
    </AppShell>
  );
}
