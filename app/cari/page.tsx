'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import CardPost from '@/components/CardPost';
import ModalDetailPost from '@/components/ModalDetailPost';
import { Post, Comment } from '@/lib/types';
import { Search, Filter, BookOpen, Clock, Star, Sparkles, X } from 'lucide-react';

function CariContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const {
    currentUser,
    posts,
    classes,
    categories,
    activePeriod,
    likePost,
    bookmarkPost,
    commentPost,
    reactPost,
    gradePost,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState<'populer' | 'terbaru' | 'minggu' | 'bebas'>('terbaru');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  const filteredPosts = posts.filter(post => {
    if (post.status !== 'published') return false;
    if (filterCategory !== 'all' && post.kategoriId !== filterCategory) return false;
    if (filterClass !== 'all' && post.authorKelas !== filterClass) return false;

    if (filterPeriod !== 'all') {
      if (filterPeriod === 'minggu-aktif') {
        if (!post.isMingguLiterasi || post.periodeId !== activePeriod?.id) return false;
      } else {
        if (!post.isMingguLiterasi || post.periodeId !== filterPeriod) return false;
      }
    }

    if (sortBy === 'bebas' && post.isMingguLiterasi) return false;
    if (sortBy === 'minggu' && !post.isMingguLiterasi) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchJudul = post.judul.toLowerCase().includes(q);
      const matchIsi = post.isi.toLowerCase().includes(q);
      const matchAuthor = post.authorNama.toLowerCase().includes(q);
      const matchTag = post.tags.some(t => t.toLowerCase().includes(q));
      return matchJudul || matchIsi || matchAuthor || matchTag;
    }

    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'populer') {
      const scoreA = (a.likes.length * 3) + (a.comments.length * 2) + a.reactions.length;
      const scoreB = (b.likes.length * 3) + (b.comments.length * 2) + b.reactions.length;
      return scoreB - scoreA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Search Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#132257] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Pencarian Global
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              Eksplorasi Naskah & Karya Literasi
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Temukan cerpen, puisi, resensi buku, atau esai favorit berdasarkan judul, penulis, isi, dan tagar.
            </p>
          </div>

          {/* Search Box Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Ketik kata kunci judul, topik, nama siswa, atau tagar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#132257] focus:ring-2 focus:ring-[#132257]/10 transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
            {/* Kategori */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.ikon} {c.nama}
                </option>
              ))}
            </select>

            {/* Kelas */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.namaKelas}>Kelas {c.namaKelas}</option>
              ))}
            </select>

            {/* Urutan */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="terbaru">Terbaru Diposting</option>
              <option value="populer">Terpopuler (Suka & Komen)</option>
              <option value="minggu">Minggu Literasi Saja</option>
              <option value="bebas">Tulisan Bebas Saja</option>
            </select>

            {/* Periode */}
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Periode</option>
              <option value="minggu-aktif">Agenda Literasi Aktif</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <p>
            Ditemukan <strong className="text-slate-900 font-extrabold">{sortedPosts.length}</strong> tulisan yang cocok
          </p>
          {(searchQuery || filterCategory !== 'all' || filterClass !== 'all' || filterPeriod !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterClass('all');
                setFilterPeriod('all');
                setSortBy('terbaru');
              }}
              className="text-indigo-600 font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Results Grid */}
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada karya yang sesuai kriteria</h3>
            <p className="text-xs text-slate-400">Coba ubah kata kunci atau hapus beberapa penyaringan di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPosts.map(post => (
              <CardPost
                key={post.id}
                post={post}
                categories={categories}
                currentUserId={currentUser?.id || ''}
                onOpenDetail={(p) => setSelectedPost(p)}
                onLike={(id) => likePost(id)}
                onBookmark={(id) => bookmarkPost(id)}
                onTagClick={(tag) => {
                  setSearchQuery(tag);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}
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
              setSelectedPost(prev => prev && prev.id === id ? {
                ...prev,
                comments: [...prev.comments, newComment]
              } : prev);
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
          onTagClick={(tag) => {
            setSelectedPost(null);
            setSearchQuery(tag);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </AppShell>
  );
}

export default function CariPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-[#132257] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    }>
      <CariContent />
    </Suspense>
  );
}
