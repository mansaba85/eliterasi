'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import CardPost from '@/components/CardPost';
import ModalDetailPost from '@/components/ModalDetailPost';
import { Post, Comment } from '@/lib/types';
import { Search, Sparkles, Calendar, Trophy, ArrowRight, Award, Star, X, PenTool, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const {
    currentUser,
    posts,
    users,
    categories,
    activePeriod,
    likePost,
    bookmarkPost,
    commentPost,
    reactPost,
    gradePost,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState<'populer' | 'terbaru' | 'minggu' | 'bebas'>('terbaru');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Scroll Hint Indicator State & Ref for Category Pills
  const filterScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = React.useCallback(() => {
    if (filterScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filterScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (filterScrollRef.current) {
      const distance = 220;
      filterScrollRef.current.scrollBy({
        left: direction === 'right' ? distance : -distance,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Mading Posts (Tulisan terpopuler / nilai tertinggi)
  const madingPosts = React.useMemo(() => {
    return posts.filter(p => p.status === 'published' && p.grade && p.grade.skor >= 90).slice(0, 3);
  }, [posts]);

  // Top Students Leaderboard
  const topStudents = React.useMemo(() => {
    return users
      .filter(u => u.role === 'siswa')
      .sort((a, b) => (b.poin || 0) - (a.poin || 0))
      .slice(0, 5);
  }, [users]);

  // Filter & Sort posts memoized
  const sortedPosts = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = posts.filter(post => {
      if (post.status !== 'published') return false;
      if (filterCategory !== 'all' && post.kategoriId !== filterCategory) return false;

      if (filterPeriod !== 'all') {
        if (filterPeriod === 'minggu-aktif') {
          if (!post.isMingguLiterasi || post.periodeId !== activePeriod?.id) return false;
        }
      }

      if (sortBy === 'bebas' && post.isMingguLiterasi) return false;
      if (sortBy === 'minggu' && !post.isMingguLiterasi) return false;

      if (q) {
        const matchJudul = post.judul.toLowerCase().includes(q);
        const matchIsi = post.isi.toLowerCase().includes(q);
        const matchAuthor = post.authorNama.toLowerCase().includes(q);
        const matchTag = post.tags?.some(t => t.toLowerCase().includes(q));
        return matchJudul || matchIsi || matchAuthor || matchTag;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'populer') {
        const scoreA = (a.likes.length * 3) + (a.comments.length * 2) + a.reactions.length;
        const scoreB = (b.likes.length * 3) + (b.comments.length * 2) + b.reactions.length;
        return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, searchQuery, filterCategory, filterPeriod, sortBy, activePeriod?.id]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* ============================================================== */}
        {/* SISI KIRI: FEED UTAMA & FILTERS (8 COLUMNS)                   */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-4 text-left">
          {/* Active Period: Minimal, Non-Intrusive Notification Bar */}
          {activePeriod && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">🔥</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-950 truncate">
                    {activePeriod.nama}
                  </p>
                  <p className="text-[11px] text-amber-800/80 truncate">
                    {activePeriod.temaInstruksi || 'Pekan literasi sedang berjalan'}
                  </p>
                </div>
              </div>
              <Link
                href="/tulis"
                className="shrink-0 px-3.5 py-1.5 bg-[#132257] hover:bg-[#1c327e] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
              >
                <span>Tulis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Social Quick Compose Prompt (Twitter/FB style) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {currentUser ? currentUser.nama.charAt(0).toUpperCase() : 'L'}
              </div>
              <Link 
                href="/tulis"
                className="flex-1 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-full px-4 py-2.5 text-xs text-slate-400 font-normal transition-colors cursor-pointer truncate text-left"
              >
                {currentUser ? `Tulis karya atau cerita barumu hari ini, ${currentUser.nama.split(' ')[0]}...` : 'Mulai tulis cerita, puisi, atau karya literasimu...'}
              </Link>
              <Link
                href="/tulis"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#111c44] hover:bg-[#1a2b68] text-white text-xs font-semibold rounded-full transition-all shadow-xs shrink-0"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Tulis</span>
              </Link>
            </div>
          </div>

          {/* Integrated Search & Filter Controls (Clean Social Media Style) */}
          <div className="space-y-2.5 bg-white p-3 sm:p-3.5 rounded-3xl border border-slate-200/60 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Cari naskah, cerita, puisi, hashtag (#pantun)..."
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-slate-200/60 focus:bg-white focus:border-[#111c44] focus:ring-2 focus:ring-[#111c44]/10 rounded-full text-xs font-normal placeholder-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Combined Filter & Categories Tabs dengan Petunjuk Indikator Scroll */}
            <div className="relative group">
              {/* Tombol Panah Scroll Kiri (Hanya muncul jika sudah discroll ke kanan) */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleScrollCategories('left')}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-20 w-6 h-6 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
                  title="Geser ke kiri"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Scrollable Container */}
              <div 
                ref={filterScrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar py-0.5 scroll-smooth pr-6"
              >
                <button 
                  onClick={() => { setSortBy('terbaru'); setFilterCategory('all'); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    sortBy === 'terbaru' && filterCategory === 'all'
                      ? 'bg-[#111c44] text-white shadow-2xs font-semibold' 
                      : 'bg-slate-100/70 hover:bg-slate-150 text-slate-600'
                  }`}
                >
                  Semua Feed
                </button>

                <button 
                  onClick={() => { setSortBy('minggu'); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    sortBy === 'minggu'
                      ? 'bg-[#111c44] text-white shadow-2xs font-semibold' 
                      : 'bg-slate-100/70 hover:bg-slate-150 text-slate-600'
                  }`}
                >
                  <span>📅</span>
                  <span>Minggu Literasi</span>
                </button>

                <button 
                  onClick={() => { setSortBy('populer'); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    sortBy === 'populer'
                      ? 'bg-[#111c44] text-white shadow-2xs font-semibold' 
                      : 'bg-slate-100/70 hover:bg-slate-150 text-slate-600'
                  }`}
                >
                  <span>🔥</span>
                  <span>Populer</span>
                </button>

                <div className="w-px h-4 bg-slate-200 shrink-0 mx-0.5" />

                {categories.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setFilterCategory(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                      filterCategory === c.id 
                        ? 'bg-slate-800 text-white shadow-2xs font-semibold' 
                        : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 text-slate-600'
                    }`}
                  >
                    <span>{c.ikon}</span>
                    <span>{c.nama}</span>
                  </button>
                ))}
              </div>

              {/* Petunjuk Visual Sisi Kanan: Efek Gradient Fade & Tombol Panah Hint */}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
                  <div className="w-12 h-full bg-gradient-to-l from-white via-white/80 to-transparent" />
                  <button
                    type="button"
                    onClick={() => handleScrollCategories('right')}
                    className="pointer-events-auto -ml-3 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200/90 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all animate-pulse hover:animate-none cursor-pointer"
                    title="Ada tombol kategori lainnya di kanan"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feed Post List */}
          {sortedPosts.length === 0 ? (
            <div className="h-60 bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center p-6 shadow-xs">
              <Search className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada karya tulisan ditemukan.</p>
              <p className="text-xs text-slate-400 mt-0.5">Coba gunakan saringan lainnya atau ubah kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedPosts.slice(0, visibleCount).map(post => (
                <CardPost 
                  key={post.id} 
                  post={post} 
                  categories={categories} 
                  currentUserId={currentUser?.id || ''} 
                  onOpenDetail={(p) => setSelectedPost(p)}
                  onLike={(id) => likePost(id)}
                  onBookmark={(id) => bookmarkPost(id)}
                  onComment={(id, text) => {
                    const newComment = commentPost(id, text);
                    if (newComment) {
                      setSelectedPost(prev => prev && prev.id === id ? {
                        ...prev,
                        comments: [...prev.comments, newComment]
                      } : prev);
                    }
                  }}
                  onTagClick={(tag) => {
                    setSearchQuery(tag);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}

              {/* Show More Trigger */}
              {visibleCount < sortedPosts.length && (
                <div className="flex justify-center pt-2 pb-6">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-[#132257] bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 text-xs font-bold shadow-xs animate-pulse">
                      <div className="w-4 h-4 border-2 border-[#132257] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat karya lainnya...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsLoadingMore(true);
                        setTimeout(() => {
                          setVisibleCount(prev => prev + 6);
                          setIsLoadingMore(false);
                        }, 350);
                      }}
                      className="px-6 py-2.5 bg-white hover:bg-slate-50 text-[#132257] border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      📂 Tampilkan Lebih Banyak Karya
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SISI KANAN: WIDGETS (DESKTOP ONLY, 4 COLUMNS)                 */}
        {/* ============================================================== */}
        <aside className="hidden lg:block lg:col-span-4 space-y-4 text-left lg:sticky lg:top-6 self-start">
          {/* Widget: Penulis Berprestasi (Leaderboard Poin) */}
          <div className="bg-white rounded-2xl border border-slate-150/80 p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Top Penulis</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Poin Tertinggi</span>
            </div>

            <div className="space-y-2.5">
              {topStudents.map((student, idx) => {
                const medals = ['🥇', '🥈', '🥉', '#4', '#5'];
                return (
                  <Link
                    key={student.id}
                    href={`/profil/${student.nis || student.id}`}
                    className="flex items-center justify-between gap-2.5 group hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold w-4 text-center shrink-0">{medals[idx]}</span>
                      <div className="w-6 h-6 rounded-full bg-[#132257]/10 text-[#132257] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {student.nama.charAt(0)}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#132257] truncate">{student.nama}</p>
                        <p className="text-[10px] text-slate-400">Kelas {student.kelasNama || 'Siswa'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 shrink-0">⭐ {student.poin}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Widget: Topik Populer */}
          <div className="bg-white rounded-2xl border border-slate-150/80 p-5 space-y-2.5 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Topik Populer</h3>
            <div className="flex flex-wrap gap-1.5">
              {['cerpen', 'puisi', 'resensi', 'madrasah', 'santri', 'alam', 'esai'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Detail Post (Jika dibuka langsung di beranda) */}
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
