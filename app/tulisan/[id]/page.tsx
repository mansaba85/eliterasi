'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import { 
  Heart, MessageSquare, Clock, ArrowLeft, Star, Award, 
  Share2, CheckCircle, Sparkles, Send, BookOpen
} from 'lucide-react';

export default function DetailTulisanPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const {
    currentUser,
    posts,
    categories,
    likePost,
    commentPost,
    reactPost,
    gradePost,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [useSerif, setUseSerif] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [shared, setShared] = useState(false);

  // Form Kurasi Guru
  const post = posts.find(p => p.id === postId);
  const [score, setScore] = useState<number>(post?.grade?.skor || 85);
  const [feedback, setFeedback] = useState<string>(post?.grade?.catatan || '');
  const [gradingSuccess, setGradingSuccess] = useState(false);

  if (!post) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Tulisan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Karya yang Anda cari mungkin telah dihapus atau ID tautan tidak sesuai.
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

  const category = categories.find(c => c.id === post.kategoriId);
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isTeacher = currentUser?.role === 'guru' || currentUser?.role === 'admin';
  const readingTime = Math.max(1, Math.ceil(post.jumlahKata / 150));

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk memberikan komentar!');
      return;
    }
    commentPost(post.id, commentText.trim());
    setCommentText('');
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    gradePost(post.id, Number(score), feedback.trim());
    setGradingSuccess(true);
    setTimeout(() => setGradingSuccess(false), 3000);
  };

  const reactionCounts = {
    kagum: post.reactions.filter(r => r.tipeReaksi === 'kagum').length,
    menginspirasi: post.reactions.filter(r => r.tipeReaksi === 'menginspirasi').length,
    kreatif: post.reactions.filter(r => r.tipeReaksi === 'kreatif').length,
    informatif: post.reactions.filter(r => r.tipeReaksi === 'informatif').length,
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#132257] bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Font Style Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
              <button
                onClick={() => setUseSerif(false)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${!useSerif ? 'bg-[#132257] text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sans
              </button>
              <button
                onClick={() => setUseSerif(true)}
                className={`px-2.5 py-1 rounded-lg font-serif font-bold transition-all ${useSerif ? 'bg-[#132257] text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Serif
              </button>
            </div>

            {/* Font Size Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
              {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 rounded-lg transition-all ${fontSize === size ? 'bg-[#132257] text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
              title="Salin Tautan Naskah"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>{shared ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Cover Image if available */}
          {post.coverImage && (
            <div className="w-full h-72 md:h-96 relative bg-slate-900">
              <Image
                src={post.coverImage}
                alt={post.judul}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 md:p-10 space-y-6">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-extrabold border border-slate-200/60">
                  <span>{category?.ikon || '📝'}</span>
                  <span>{category?.nama || 'Umum'}</span>
                </span>

                {post.isMingguLiterasi && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Minggu Literasi Wajib</span>
                  </span>
                )}
              </div>

              {post.grade && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-full text-xs font-black">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>Nilai Kurasi: {post.grade.skor}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
              {post.judul}
            </h1>

            {/* Author Profile Bar */}
            <div className="flex items-center justify-between py-3 border-y border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#132257] to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                  {post.authorNama.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">{post.authorNama}</p>
                  <p className="text-slate-400 font-medium">Kelas {post.authorKelas || 'Umum'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400 font-semibold">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} mnt baca ({post.jumlahKata} kata)</span>
                </div>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Body Content */}
            <div 
              className={`text-slate-800 leading-relaxed whitespace-pre-line py-4 ${
                useSerif ? 'font-serif' : 'font-sans'
              } ${
                fontSize === 'sm' ? 'text-sm' :
                fontSize === 'base' ? 'text-base' :
                fontSize === 'lg' ? 'text-lg' : 'text-xl'
              }`}
            >
              {post.isi}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {post.tags.map((tag, i) => (
                  <Link
                    key={i}
                    href={`/cari?q=${encodeURIComponent(tag)}`}
                    className="text-xs bg-slate-100 hover:bg-[#132257]/10 text-slate-600 hover:text-[#132257] border border-slate-200/80 px-3 py-1 rounded-lg font-medium transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Interactions: Like & Reaction Buttons */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      alert('Silakan login terlebih dahulu untuk menyukai tulisan!');
                      return;
                    }
                    likePost(post.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                  <span>{post.likes.length} Suka</span>
                </button>

                {/* Quick Emoji Reactions */}
                <div className="flex items-center gap-1.5">
                  {(['kagum', 'menginspirasi', 'kreatif', 'informatif'] as const).map(reaction => {
                    const icons = { kagum: '😍', menginspirasi: '🌟', kreatif: '🎨', informatif: '💡' };
                    return (
                      <button
                        key={reaction}
                        onClick={() => {
                          if (!currentUser) return;
                          reactPost(post.id, reaction);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title={reaction}
                      >
                        <span>{icons[reaction]}</span>
                        <span className="text-[11px] text-slate-600">{reactionCounts[reaction]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments.length} Komentar</span>
              </div>
            </div>

            {/* Teacher Curation Display */}
            {post.grade && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 flex gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center shrink-0 font-bold shadow-xs">
                  <span className="text-[9px] uppercase tracking-wider text-indigo-200 font-extrabold">Skor</span>
                  <span className="text-base font-black leading-none">{post.grade.skor}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-indigo-700" />
                    <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">Karya Pilihan Terkurasi Guru</h4>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed italic font-serif">
                    &ldquo;{post.grade.catatan}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    Diapresiasi oleh <span className="font-bold text-indigo-950">{post.grade.guruNama}</span> pada {new Date(post.grade.gradedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {/* Teacher Curation Form (if current user is teacher/admin) */}
            {isTeacher && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-800" />
                    <div>
                      <h4 className="font-extrabold text-emerald-950 text-sm">Kurasi & Apresiasi Guru Pembimbing</h4>
                      <p className="text-[11px] text-emerald-700 font-medium">Beri apresiasi dan skor agar tulisan ini masuk Arsip Karya Pilihan Madrasah.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    ⭐ Bonus Siswa: +{Math.round(score / 2)} Poin
                  </span>
                </div>

                <form onSubmit={handleGradeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-emerald-950 mb-1">Skor Kurasi (0–100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={score}
                        onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-black text-slate-800 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-emerald-950 mb-1">Catatan Apresiasi & Ulasan Kurasi</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tuliskan ulasan apresiasi dan poin keunggulan karya ini..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium text-slate-800 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{post.grade ? 'Perbarui Kurasi' : 'Simpan Kurasi & Masukkan Arsip'}</span>
                    </button>
                  </div>
                </form>

                {gradingSuccess && (
                  <div className="text-xs font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 p-2.5 rounded-xl flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Kurasi berhasil disimpan! Tulisan masuk ke dalam Arsip Karya Pilihan Guru.</span>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="space-y-5 pt-6 border-t border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#132257]" />
                <span>Diskusi & Apresiasi ({post.comments.length})</span>
              </h3>

              {/* Form Input Komentar */}
              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.nama.charAt(0)}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Tuliskan komentar atau apresiasi positif..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#132257]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#132257] hover:bg-[#1d3580] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  <Link href="/login" className="font-bold text-[#132257] underline">
                    Masuk akun
                  </Link>{' '}
                  untuk ikut berdiskusi dan memberikan apresiasi tulisan ini.
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {post.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Belum ada komentar. Jadilah pembaca pertama yang memberikan ulasan santun!
                  </p>
                ) : (
                  post.comments.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{c.authorNama}</span>
                          {c.authorRole === 'guru' && (
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.2 rounded-full">
                              Guru
                            </span>
                          )}
                          {c.authorKelas && (
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              Kelas {c.authorKelas}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(c.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.isi}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
