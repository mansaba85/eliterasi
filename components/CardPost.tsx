'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Post, Category } from '../lib/types';
import { Heart, MessageSquare, Clock, ArrowRight, Star, Award, Bookmark, Share2, Send } from 'lucide-react';

interface CardPostProps {
  post: Post;
  categories: Category[];
  currentUserId: string;
  onOpenDetail: (post: Post) => void;
  onLike: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string, text: string) => void;
  onTagClick?: (tag: string) => void;
}

// Generate consistent beautiful gradients for user initials
const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-[#FF8008] to-[#FFC837]', // Warm sunset
    'from-[#8E2DE2] to-[#4A00E0]', // Deep purple
    'from-[#00c6ff] to-[#0072ff]', // Cool blue
    'from-[#11998e] to-[#38ef7d]', // Fresh emerald
    'from-[#fc4a1a] to-[#f7b733]', // Bright orange
    'from-[#EE0979] to-[#FF6A00]', // Sweet pink
    'from-[#00F260] to-[#0575E6]', // Aqua aura
    'from-[#7F00FF] to-[#E100FF]'  // Electric neon
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

// Map each literary category to its custom lively, beautiful color palette
const getCategoryStyles = (kode: string) => {
  const styles: Record<string, { bg: string, text: string, border: string, iconBg: string }> = {
    'buku-harian': { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', text: 'text-amber-700', border: 'border-amber-200/60', iconBg: 'bg-amber-100' },
    'sinopsis-resensi': { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', text: 'text-blue-700', border: 'border-blue-200/60', iconBg: 'bg-blue-100' },
    'cerpen': { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', text: 'text-rose-700', border: 'border-rose-200/60', iconBg: 'bg-rose-100' },
    'puisi': { bg: 'bg-purple-50 text-purple-700 border-purple-200/60', text: 'text-purple-700', border: 'border-purple-200/60', iconBg: 'bg-purple-100' },
    'laporan-pengamatan': { bg: 'bg-teal-50 text-teal-700 border-teal-200/60', text: 'text-teal-700', border: 'border-teal-200/60', iconBg: 'bg-teal-100' },
    'esai': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60', text: 'text-indigo-700', border: 'border-indigo-200/60', iconBg: 'bg-indigo-100' },
    'berita': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', text: 'text-emerald-700', border: 'border-emerald-200/60', iconBg: 'bg-emerald-100' },
    'dongeng': { bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60', text: 'text-fuchsia-700', border: 'border-fuchsia-200/60', iconBg: 'bg-fuchsia-100' },
    'lainnya': { bg: 'bg-slate-50 text-slate-700 border-slate-200/60', text: 'text-slate-700', border: 'border-slate-200/60', iconBg: 'bg-slate-100' }
  };
  return styles[kode] || { bg: 'bg-slate-50 text-slate-700 border-slate-200/60', text: 'text-slate-700', border: 'border-slate-200/60', iconBg: 'bg-slate-100' };
};

export default function CardPost({ post, categories, currentUserId, onOpenDetail, onLike, onBookmark, onComment, onTagClick }: CardPostProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = React.useState(false);
  const [showQuickComment, setShowQuickComment] = React.useState(false);
  const [quickCommentText, setQuickCommentText] = React.useState('');
  const category = categories.find(c => c.id === post.kategoriId);
  const readingTime = Math.max(1, Math.ceil(post.jumlahKata / 150));
  const isLiked = post.likes.includes(currentUserId);
  const isBookmarked = Boolean(post.bookmarks?.includes(currentUserId));
  const avatarGradient = getAvatarGradient(post.authorNama);
  const catStyle = getCategoryStyles(category?.kode || 'lainnya');

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    onLike(post.id);
    setTimeout(() => setIsLiking(false), 500);
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCommentText.trim() || !onComment) return;
    onComment(post.id, quickCommentText.trim());
    setQuickCommentText('');
    setShowQuickComment(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/tulisan/${post.id}`;
      navigator.clipboard.writeText(url);
      alert('Tautan karya berhasil disalin!');
    }
  };

  return (
    <article className="bg-white rounded-3xl border border-slate-200/60 hover:border-slate-300 card-hover-lift animate-smooth-in p-4 sm:p-5 shadow-xs hover:shadow-md flex flex-col justify-between group transition-all">
      <div>
        {/* Social Header: Author, Meta, and Status Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatarGradient} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs select-none ring-2 ring-white`}>
              {post.authorNama.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#111c44] transition-colors truncate">
                  {post.authorNama}
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  {post.authorKelas ? `Kelas ${post.authorKelas}` : 'Siswa'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-normal">
                <span>{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {readingTime} mnt baca
                </span>
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {post.isMingguLiterasi && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span>🔥</span>
                <span>Literasi</span>
              </span>
            )}
            {post.grade && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Star className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                <span>{post.grade.skor}</span>
              </span>
            )}
          </div>
        </div>

        {/* Post Title */}
        <h3 
          onClick={() => onOpenDetail(post)}
          className="text-base sm:text-lg font-bold text-slate-900 hover:text-[#111c44] cursor-pointer leading-snug line-clamp-2 mb-2 tracking-tight transition-colors"
        >
          {post.judul}
        </h3>

        {/* Post Snippet */}
        <p 
          onClick={() => onOpenDetail(post)}
          className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed line-clamp-3 mb-3 cursor-pointer hover:text-slate-800 transition-colors"
        >
          {post.isi}
        </p>

        {/* Cover Image (Clean full-bleed rounded thumbnail) */}
        {post.coverImage && (
          <div 
            onClick={() => onOpenDetail(post)}
            className="w-full h-48 sm:h-64 bg-slate-100 rounded-2xl overflow-hidden mb-3.5 cursor-pointer relative shadow-2xs"
          >
            <Image 
              src={post.coverImage} 
              alt={post.judul} 
              fill
              className="object-cover group-hover:scale-101 transition-transform duration-300"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Category & Hashtags Pill Row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catStyle.bg}`}>
            {category?.ikon} {category?.nama || 'Umum'}
          </span>
          {post.tags && post.tags.slice(0, 3).map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) {
                  onTagClick(tag);
                } else {
                  router.push(`/cari?q=${encodeURIComponent(tag)}`);
                }
              }}
              title={`Cari karya #${tag}`}
              className="text-[11px] text-slate-500 font-medium hover:text-[#111c44] hover:bg-slate-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Social Engagement Actions Footer (Twitter / Threads style) */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button with Bouncy Micro-animation */}
          <button 
            type="button"
            onClick={handleLikeClick}
            aria-label="Sukai tulisan"
            className={`flex items-center gap-1.5 transition-colors cursor-pointer group/like ${
              isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
            }`}
          >
            <div className={`p-1.5 rounded-full group-hover/like:bg-rose-50 transition-colors ${isLiked ? 'bg-rose-50' : ''}`}>
              <Heart className={`w-4.5 h-4.5 transition-transform ${isLiking ? 'animate-heart-bounce' : ''} ${isLiked ? 'fill-rose-600 text-rose-600 scale-105' : 'text-slate-400 group-hover/like:text-rose-600'}`} />
            </div>
            <span className="text-xs font-semibold">{post.likes.length}</span>
          </button>
          
          {/* Comment Button (Toggles Quick Comment) */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickComment(!showQuickComment);
            }}
            aria-label="Tulis komentar cepat"
            className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer group/cmt ${showQuickComment ? 'text-blue-600 font-semibold' : ''}`}
          >
            <div className={`p-1.5 rounded-full group-hover/cmt:bg-blue-50 transition-colors ${showQuickComment ? 'bg-blue-50' : ''}`}>
              <MessageSquare className="w-4 h-4 text-slate-400 group-hover/cmt:text-blue-600" />
            </div>
            <span className="text-xs font-semibold">{post.comments.length}</span>
          </button>

          {/* Share Button */}
          <button 
            type="button"
            onClick={handleShare}
            aria-label="Bagikan tulisan"
            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors cursor-pointer group/share"
          >
            <div className="p-1.5 rounded-full group-hover/share:bg-emerald-50 transition-colors">
              <Share2 className="w-4 h-4 text-slate-400 group-hover/share:text-emerald-600" />
            </div>
          </button>
        </div>

        {/* Bookmark & Read link */}
        <div className="flex items-center gap-2">
          {onBookmark && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(post.id);
              }}
              title={isBookmarked ? 'Hapus bookmark' : 'Simpan karya'}
              aria-label="Simpan karya"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isBookmarked 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
            </button>
          )}

          <button 
            type="button"
            onClick={() => onOpenDetail(post)}
            className="text-xs font-semibold text-[#111c44] hover:underline px-2 py-1 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Baca</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Comment Drawer (Social Style) */}
      {showQuickComment && (
        <form 
          onSubmit={handleQuickCommentSubmit}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 animate-fade-in"
        >
          <input 
            type="text"
            required
            placeholder="Tulis tanggapan atau apresiasi cepat..."
            value={quickCommentText}
            onChange={(e) => setQuickCommentText(e.target.value)}
            className="flex-1 px-3.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#111c44] focus:ring-1 focus:ring-[#111c44]/20 rounded-full text-xs outline-none transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            className="p-1.5 px-3 bg-[#111c44] hover:bg-[#1a2b68] text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      )}
    </article>
  );
}
