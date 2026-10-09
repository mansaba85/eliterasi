'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Post, Category, User, Comment } from '../lib/types';
import { 
  X, Heart, MessageSquare, Award, Clock, Share2, 
  BookOpen, Sparkles, Send, CheckCircle, Info, Bookmark,
  ChevronDown, ChevronUp, Edit3
} from 'lucide-react';

interface ModalDetailPostProps {
  post: Post | null;
  categories: Category[];
  currentUser: User | null;
  onClose: () => void;
  onLike: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment: (postId: string, commentText: string) => void;
  onReact: (postId: string, reactionType: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif') => void;
  onGrade: (postId: string, score: number, feedback: string) => void;
  onTagClick?: (tag: string) => void;
}

// Parse comment text to highlight @mention targets elegantly
const renderCommentContent = (text: string) => {
  if (text.trim().startsWith('@')) {
    const spaceIndex = text.indexOf(' ');
    if (spaceIndex !== -1) {
      const mention = text.substring(0, spaceIndex);
      const rest = text.substring(spaceIndex);
      return (
        <p className="text-xs text-slate-700 leading-snug mt-0.5">
          <span className="font-bold text-[#132257] hover:underline mr-1 select-none">{mention}</span>
          <span>{rest}</span>
        </p>
      );
    }
  }
  return (
    <p className="text-xs text-slate-700 leading-snug mt-0.5 whitespace-pre-line">
      {text}
    </p>
  );
};

export default function ModalDetailPost({
  post,
  categories,
  currentUser,
  onClose,
  onLike,
  onBookmark,
  onComment,
  onReact,
  onGrade,
  onTagClick,
}: ModalDetailPostProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const commentInputRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kunci scroll halaman luar dan dengarkan escape key
  useEffect(() => {
    if (!post) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, onClose]);

  const handleReplyToComment = (comment: Comment) => {
    setReplyTo(comment);
    setCommentText(`@${comment.authorNama} `);
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 50);
  };

  const [useSerif, setUseSerif] = useState(true); // Default to elegant Lora-style serif for literature (PRD 9.3)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [focusMode, setFocusMode] = useState(false);
  const [shared, setShared] = useState(false);

  // Local synced state for immediate reactive feedback
  const [localReactions, setLocalReactions] = useState(post?.reactions || []);
  const [localLikes, setLocalLikes] = useState(post?.likes || []);
  const [localBookmarks, setLocalBookmarks] = useState(post?.bookmarks || []);

  useEffect(() => {
    if (post) {
      setLocalReactions(post.reactions || []);
      setLocalLikes(post.likes || []);
      setLocalBookmarks(post.bookmarks || []);
    }
  }, [post]);

  // Form Penilaian Guru
  const [prevPostId, setPrevPostId] = useState(post?.id);
  const [score, setScore] = useState<number>(post?.grade?.skor || 85);
  const [feedback, setFeedback] = useState<string>(post?.grade?.catatan || '');
  const [gradingSuccess, setGradingSuccess] = useState(false);
  const [isCuratingOpen, setIsCuratingOpen] = useState(false);

  if (post && post.id !== prevPostId) {
    setPrevPostId(post.id);
    setScore(post.grade?.skor || 85);
    setFeedback(post.grade?.catatan || '');
    setGradingSuccess(false);
    setIsCuratingOpen(false);
  }

  if (!mounted || !post) return null;

  const category = categories.find(c => c.id === post.kategoriId);
  const isLiked = currentUser ? localLikes.includes(currentUser.id) : false;
  const isBookmarked = Boolean(currentUser && localBookmarks.includes(currentUser.id));
  const isAuthor = currentUser?.id === post.authorId;
  const isTeacher = currentUser?.role === 'guru' || currentUser?.role === 'admin';

  // Hitung jumlah reaksi per jenis
  const reactionCounts = {
    kagum: localReactions.filter(r => r.tipeReaksi === 'kagum').length,
    menginspirasi: localReactions.filter(r => r.tipeReaksi === 'menginspirasi').length,
    kreatif: localReactions.filter(r => r.tipeReaksi === 'kreatif').length,
    informatif: localReactions.filter(r => r.tipeReaksi === 'informatif').length,
  };

  const handleReactClick = (reactionType: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif') => {
    if (!currentUser) return;
    // Optimistic local update
    setLocalReactions(prev => {
      const existingIdx = prev.findIndex(r => r.userId === currentUser.id);
      if (existingIdx !== -1) {
        if (prev[existingIdx].tipeReaksi === reactionType) {
          return prev.filter((_, idx) => idx !== existingIdx);
        } else {
          return prev.map((r, idx) => idx === existingIdx ? { ...r, tipeReaksi: reactionType } : r);
        }
      } else {
        return [
          ...prev,
          {
            id: `react-${Date.now()}`,
            postId: post.id,
            userId: currentUser.id,
            tipeReaksi: reactionType,
            createdAt: new Date().toISOString()
          }
        ];
      }
    });

    onReact(post.id, reactionType);
  };

  const handleLikeClick = () => {
    if (!currentUser) return;
    setLocalLikes(prev => {
      if (prev.includes(currentUser.id)) {
        return prev.filter(uid => uid !== currentUser.id);
      } else {
        return [...prev, currentUser.id];
      }
    });
    onLike(post.id);
  };

  const handleBookmarkClick = () => {
    if (!currentUser || !onBookmark) return;
    setLocalBookmarks(prev => {
      if (prev.includes(currentUser.id)) {
        return prev.filter(uid => uid !== currentUser.id);
      } else {
        return [...prev, currentUser.id];
      }
    });
    onBookmark(post.id);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/tulisan/${post.id}`;
      navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingComment) return;
    if (!commentText.trim() || !currentUser) return;

    setIsSubmittingComment(true);
    const textToSend = commentText.trim();
    setCommentText('');
    setReplyTo(null);
    onComment(post.id, textToSend);

    // Debounce guard to prevent rapid double-clicks or dual Enter + submit triggers
    setTimeout(() => {
      setIsSubmittingComment(false);
    }, 600);
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    onGrade(post.id, Number(score), feedback.trim());
    setGradingSuccess(true);
    setTimeout(() => setGradingSuccess(false), 3000);
  };

  const fontClass = useSerif ? 'font-serif' : 'font-sans-literasi';
  const sizeClass = 
    fontSize === 'sm' ? 'text-sm' : 
    fontSize === 'lg' ? 'text-lg md:text-xl' : 
    fontSize === 'xl' ? 'text-xl md:text-2xl' : 
    'text-base md:text-lg';

  const modalContent = (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
      style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl sm:rounded-3xl w-full ${focusMode ? 'max-w-3xl' : 'max-w-5xl'} h-[90vh] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 animate-scale-in`}
      >
        {/* Header Modal */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg sm:text-xl shrink-0">{category?.ikon}</span>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-bold truncate">Membaca Karya Sastra • {category?.nama}</p>
              <p className="text-[10px] text-slate-400 truncate">Dipublikasikan pada {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Opsi Pembaca Nyaman */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white p-0.5 sm:p-1 rounded-lg border border-slate-200 text-xs text-slate-500">
              <button 
                onClick={() => setUseSerif(true)} 
                className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs transition-all ${useSerif ? 'bg-[#132257] text-white font-bold' : 'hover:bg-slate-50'}`}
                title="Gunakan Font Serif (Lora) untuk nuansa buku"
              >
                Serif
              </button>
              <button 
                onClick={() => setUseSerif(false)} 
                className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs transition-all ${!useSerif ? 'bg-[#132257] text-white font-bold' : 'hover:bg-slate-50'}`}
                title="Gunakan Font Sans (Poppins) untuk tampilan modern"
              >
                Sans
              </button>
              <span className="h-3 sm:h-4 w-px bg-slate-200 mx-0.5 sm:mx-1"></span>
              <button onClick={() => setFontSize('sm')} className={`p-1 px-1.5 sm:px-2 text-[10px] sm:text-xs rounded-md ${fontSize === 'sm' ? 'bg-[#132257] text-white font-bold' : 'hover:bg-slate-50'}`}>A-</button>
              <button onClick={() => setFontSize('base')} className={`p-1 px-1.5 sm:px-2 text-[10px] sm:text-xs rounded-md ${fontSize === 'base' ? 'bg-[#132257] text-white font-bold' : 'hover:bg-slate-50'}`}>A</button>
              <button onClick={() => setFontSize('lg')} className={`p-1 px-1.5 sm:px-2 text-[10px] sm:text-xs rounded-md ${fontSize === 'lg' ? 'bg-[#132257] text-white font-bold' : 'hover:bg-slate-50'}`}>A+</button>
              <span className="hidden sm:inline h-4 w-px bg-slate-200 mx-1"></span>
              <button 
                onClick={() => setFocusMode(!focusMode)} 
                className={`hidden sm:inline-block px-3 py-1 rounded-md transition-all ${focusMode ? 'bg-indigo-600 text-white font-medium' : 'hover:bg-slate-50'}`}
                title="Mode Fokus (Matikan Sidebar Komentar)"
              >
                {focusMode ? 'Biasa' : 'Fokus'}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Konten Modal Utama (Grid Layout: Kiri Konten, Kanan Sidebar Interaksi jika tidak mode fokus) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
          {/* Sisi Kiri: Tulisan Karya */}
          <div className={`p-6 md:p-8 ${focusMode ? 'lg:col-span-12' : 'lg:col-span-7 lg:border-r lg:border-slate-100'} lg:overflow-y-auto lg:h-full`}>
            {/* Notifikasi Minggu Literasi / Status Penilaian */}
            <div className="flex flex-wrap gap-2 mb-5">
              {post.isMingguLiterasi && (
                <span className="text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1 rounded-md flex items-center gap-1 select-none animate-pulse">
                  🔥 Minggu Literasi Wajib
                </span>
              )}
              {post.grade ? (
                <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md flex items-center gap-1">
                  <Award className="w-4 h-4 text-indigo-600" /> Dinilai oleh {post.grade.guruNama} (Skor: {post.grade.skor})
                </span>
              ) : post.isMingguLiterasi && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md flex items-center gap-1">
                  ⏳ Menunggu Penilaian Guru
                </span>
              )}
            </div>

            {/* Judul & Detail */}
            <h2 className="text-2xl md:text-3.5xl font-sans font-bold text-slate-900 leading-tight mb-4">
              {post.judul}
            </h2>

            {/* Bar Penulis */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-sm font-bold text-white">
                  {post.authorNama.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{post.authorNama}</p>
                  <p className="text-xs text-slate-400">Kelas {post.authorKelas || 'Bebas'} • Siswa MA NU 01 Banyuputih</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p className="font-medium flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.max(1, Math.ceil(post.jumlahKata / 150))} mnt baca
                </p>
                <p>{post.jumlahKata} kata</p>
              </div>
            </div>

            {/* Gambar Cover */}
            {post.coverImage && (
              <div className="relative w-full h-48 md:h-80 rounded-xl overflow-hidden mb-6 bg-slate-100 border border-slate-200">
                <Image 
                  src={post.coverImage} 
                  alt={post.judul} 
                  fill
                  className="object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Isi Karya dengan Pengaturan Font & Size */}
            <div className={`prose max-w-none text-slate-800 leading-relaxed ${fontClass} ${sizeClass} whitespace-pre-line border-b border-slate-100 pb-8`}>
              {post.isi}
            </div>

            {/* Tag List */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-4 border-b border-slate-100">
                {post.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onTagClick) {
                        onTagClick(tag);
                      } else {
                        onClose();
                        router.push(`/cari?q=${encodeURIComponent(tag)}`);
                      }
                    }}
                    title={`Lihat karya lain dengan tag #${tag}`}
                    className="text-xs text-slate-600 bg-slate-100 hover:bg-[#132257]/10 hover:text-[#132257] hover:border-[#132257]/20 border border-slate-200/80 px-3 py-1 rounded-lg cursor-pointer transition-all font-medium"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Apresiasi Cepat / Emoji Reaksi (Ringkas & Responsive Anti Out-frame) */}
            {currentUser && (
              <div className="py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  Beri Apresiasi:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button 
                    type="button"
                    onClick={() => handleReactClick('kagum')}
                    title="Apresiasi: Kagum"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      localReactions.some(r => r.userId === currentUser.id && r.tipeReaksi === 'kagum') 
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold' 
                        : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>😮</span>
                    <span>Kagum</span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal ml-0.5">
                      {reactionCounts.kagum}
                    </span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleReactClick('menginspirasi')}
                    title="Apresiasi: Inspiratif"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      localReactions.some(r => r.userId === currentUser.id && r.tipeReaksi === 'menginspirasi') 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs font-bold' 
                        : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>💡</span>
                    <span>Inspiratif</span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal ml-0.5">
                      {reactionCounts.menginspirasi}
                    </span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleReactClick('kreatif')}
                    title="Apresiasi: Kreatif"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      localReactions.some(r => r.userId === currentUser.id && r.tipeReaksi === 'kreatif') 
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs font-bold' 
                        : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>✨</span>
                    <span>Kreatif</span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal ml-0.5">
                      {reactionCounts.kreatif}
                    </span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleReactClick('informatif')}
                    title="Apresiasi: Informatif"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      localReactions.some(r => r.userId === currentUser.id && r.tipeReaksi === 'informatif') 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-bold' 
                        : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>🔬</span>
                    <span>Informatif</span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal ml-0.5">
                      {reactionCounts.informatif}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Penjelasan Penilaian Eksklusif oleh Guru di bagian bawah saat membaca karya */}
            {isTeacher && (
              <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-5 mt-5 shadow-xs transition-all">
                {/* Accordion / Header Bar */}
                <div 
                  onClick={() => setIsCuratingOpen(!isCuratingOpen)}
                  className="flex items-center justify-between gap-2 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Award className="w-4.5 h-4.5 text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm tracking-tight truncate">
                          Kurasi Guru Pembimbing
                        </h4>
                        {post.grade ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 shrink-0">
                            Skor: {post.grade.skor}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/80 shrink-0">
                            Belum Dikurasi
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium truncate mt-0.5">
                        {isCuratingOpen ? 'Beri skor & apresiasi karya' : (post.grade ? 'Ketuk untuk ubah kurasi karya ini' : 'Ketuk untuk kurasi & beri skor')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
                      ⭐ +{Math.round(score / 2)} Poin
                    </span>
                    <button
                      type="button"
                      className="p-1 sm:p-1.5 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 transition-colors"
                      aria-label="Toggle Form Kurasi"
                    >
                      {isCuratingOpen ? (
                        <ChevronUp className="w-4 h-4 text-emerald-850" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-emerald-850" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Collapsible Form Body */}
                {isCuratingOpen && (
                  <form onSubmit={handleSubmitGrade} className="space-y-3 pt-3.5 mt-3 border-t border-emerald-200/70 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3.5">
                      {/* Skor & Presets */}
                      <div className="sm:col-span-5 bg-white/70 p-2.5 rounded-xl border border-emerald-200/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-emerald-950">Skor (0–100)</label>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            +{Math.round(score / 2)} Poin Siswa
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            required
                            value={score} 
                            onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-center font-extrabold text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600"
                          />
                          <div className="flex flex-wrap gap-1 flex-1">
                            {[75, 80, 85, 90, 95, 100].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setScore(val)}
                                className={`text-[10px] font-bold px-1.5 py-1 rounded transition-colors ${score === val ? 'bg-emerald-800 text-white' : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'}`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Catatan Apresiasi */}
                      <div className="sm:col-span-7">
                        <label className="block text-[11px] font-bold text-emerald-950 mb-1">Catatan Apresiasi / Ulasan</label>
                        <textarea 
                          rows={2}
                          required
                          placeholder="Diksi indah, alur rapi, layak masuk arsip unggulan..."
                          value={feedback} 
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl focus:ring-1 focus:ring-emerald-600 text-xs font-medium text-slate-800 leading-snug resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-200/50">
                      <span className="text-[10px] text-emerald-800 font-medium truncate hidden sm:inline">
                        Otomatis masuk ke Arsip Karya Pilihan Guru
                      </span>
                      <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setIsCuratingOpen(false)}
                          className="w-1/3 sm:w-auto px-3 py-2 text-xs font-bold text-emerald-850 hover:bg-emerald-100/60 rounded-xl transition-colors"
                        >
                          Tutup
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 sm:flex-initial bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> 
                          <span>{post.grade ? 'Simpan Perubahan' : 'Kirim Kurasi'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {gradingSuccess && (
                  <div className="mt-2.5 text-xs font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-300 p-2 rounded-xl flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-[11px]">Kurasi tersimpan! Siswa mendapat bonus +{Math.round(score / 2)} poin.</span>
                  </div>
                )}
              </div>
            )}

            {/* Catatan Penilaian untuk Dibaca Siswa */}
            {post.grade && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/90 rounded-2xl p-5 mt-6 flex gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center flex-shrink-0 font-bold shadow-xs">
                  <span className="text-[9px] uppercase tracking-wider text-indigo-200 font-extrabold">Skor</span>
                  <span className="text-base font-black leading-none">{post.grade.skor}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-3.5 h-3.5 text-indigo-700" />
                    <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">Karya Pilihan Terkurasi Guru</h4>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed italic font-serif">
                    &ldquo;{post.grade.catatan}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    Diapresiasi oleh <span className="font-bold text-indigo-950">{post.grade.guruNama}</span> pada {new Date(post.grade.gradedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Panel Interaksi (Like, Komentar, Bagikan) - Tidak tampil jika mode fokus */}
          {!focusMode && (
            <div className="lg:col-span-5 bg-white flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-100">
              {/* Box Aksi Utama (Suka, Jumlah Komentar, Simpan, Bagikan) - Anti Out-frame */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button 
                    type="button"
                    onClick={handleLikeClick}
                    className={`flex items-center gap-1.5 transition-all py-1.5 px-2.5 sm:px-3 rounded-full hover:bg-rose-50/50 cursor-pointer ${
                      isLiked ? 'text-rose-600 font-bold bg-rose-50/80 shadow-2xs' : 'text-slate-600 hover:text-rose-600 bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold">{localLikes.length} <span className="hidden xs:inline">Suka</span></span>
                  </button>

                  <span className="text-slate-600 flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 bg-slate-100/60 rounded-full">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold">{post.comments.length} <span className="hidden xs:inline">Komentar</span></span>
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {onBookmark && (
                    <button 
                      type="button"
                      onClick={handleBookmarkClick}
                      title={isBookmarked ? 'Hapus dari koleksi tersimpan' : 'Simpan ke koleksi bookmark'}
                      className={`p-1.5 px-2 sm:px-3 border rounded-xl flex items-center gap-1 transition-all text-xs font-bold shadow-2xs cursor-pointer ${
                        isBookmarked 
                          ? 'bg-amber-50 border-amber-300 text-amber-800' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                      <span className="hidden xs:inline">{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 px-2 sm:px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1 transition-all text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden xs:inline">{shared ? 'Tersalin' : 'Bagikan'}</span>
                  </button>
                </div>
              </div>

              {/* Daftar Komentar: Threads-Style Clean unboxed conversational timeline */}
              <div className="flex-1 overflow-visible lg:overflow-y-auto px-4 sm:px-6 py-3.5 space-y-3">
                {post.comments.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200/60 rounded-2xl p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
                    <p className="text-xs font-bold text-slate-700">Belum ada tanggapan</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mulai diskusi hangat pertama dengan santun!</p>
                  </div>
                ) : (
                  // Deduplicate comments by ID in case data has redundant entries
                  post.comments
                    .filter((comment, idx, self) => self.findIndex(c => c.id === comment.id) === idx)
                    .map((comment, index) => {
                    // Generate premium pastel gradients for commentary initials
                    const gradients = [
                      'from-amber-400 to-orange-400',
                      'from-rose-400 to-pink-400',
                      'from-purple-400 to-indigo-400',
                      'from-blue-400 to-cyan-400',
                      'from-teal-400 to-emerald-400',
                      'from-fuchsia-400 to-pink-500'
                    ];
                    let hash = 0;
                    for (let i = 0; i < comment.authorNama.length; i++) {
                      hash = comment.authorNama.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const avatarGrad = gradients[Math.abs(hash) % gradients.length];
                    const isCommentTeacher = comment.authorRole === 'guru';
                    const isReply = comment.isi.trim().startsWith('@');

                    return (
                      <div 
                        key={`${comment.id}-${index}`} 
                        className={`flex gap-2.5 transition-all duration-150 ${isReply ? 'ml-6 sm:ml-8 pl-2.5 border-l-2 border-slate-200' : ''}`}
                      >
                        {/* Left Column: Compact Avatar */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`${isReply ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-[11px]'} rounded-full bg-gradient-to-br ${avatarGrad} text-white font-bold flex items-center justify-center select-none shadow-2xs`}>
                            {comment.authorNama.charAt(0)}
                          </div>
                        </div>

                        {/* Right Column: Clean compact commentary content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span className="text-xs font-bold text-slate-900 truncate">{comment.authorNama}</span>
                              {isCommentTeacher ? (
                                <span className="text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">Guru</span>
                              ) : comment.authorKelas && (
                                <span className="text-[9px] text-slate-400 font-medium shrink-0">Kelas {comment.authorKelas}</span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-normal shrink-0">
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          
                          {renderCommentContent(comment.isi)}

                          {/* Minimal reply action footer */}
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                            <button 
                              type="button"
                              onClick={() => handleReplyToComment(comment)}
                              className="hover:text-[#132257] font-semibold transition-colors cursor-pointer"
                            >
                              Balas
                            </button>
                            {isCommentTeacher && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-medium flex items-center gap-0.5">⭐ Evaluasi Terverifikasi</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Form Input Komentar: Clean, unboxed reply box inspired by Threads */}
              <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
                {currentUser ? (
                  <form onSubmit={handleSubmitComment}>
                    <div className="flex gap-3">
                      {/* Current user mini avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 select-none shadow-2xs">
                        {currentUser.nama.charAt(0)}
                      </div>

                      {/* Reply input & Send Link */}
                      <div className="flex-1">
                        {replyTo && (
                          <div className="flex items-center justify-between bg-[#f1f5f9] px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 mb-2 animate-fade-in">
                            <span>Membalas @{replyTo.authorNama}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                setReplyTo(null);
                                setCommentText('');
                              }}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              ✕ Batal
                            </button>
                          </div>
                        )}
                        <div className="relative flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100 focus-within:border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                          <textarea
                            ref={commentInputRef}
                            rows={1}
                            maxLength={500}
                            required
                            placeholder={replyTo ? `Balas ke ${replyTo.authorNama}...` : `Balas ke ${post.authorNama}...`}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-transparent outline-none text-xs text-slate-700 resize-none max-h-20 placeholder:text-slate-400 py-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment(e);
                              }
                            }}
                          />
                          <button
                            type="submit"
                            className="ml-2 text-xs font-bold text-[#132257] hover:text-[#21357c] px-2 py-1 transition-colors self-end"
                          >
                            Kirim
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 px-0.5 text-[9px] text-slate-400 font-medium select-none">
                          <span>Enter untuk kirim</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">✨ Tulis apresiasi positif</span>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 text-center text-xs py-3 rounded-xl text-slate-500 font-medium">
                    Silakan login terlebih dahulu untuk bergabung dalam diskusi.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
