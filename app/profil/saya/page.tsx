'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import AppShell from '@/components/AppShell';
import CardPost from '@/components/CardPost';
import ModalDetailPost from '@/components/ModalDetailPost';
import ModalLogoutConfirm from '@/components/ModalLogoutConfirm';
import { LiteStore, ACHIEVEMENTS } from '@/lib/store';
import { Post, Comment } from '@/lib/types';
import { 
  User as UserIcon, BookOpen, Star, Calendar, Bookmark, 
  Award, ShieldAlert, LogIn, Heart, MessageSquare, Plus, PenTool, Camera, Trash2, LogOut
} from 'lucide-react';

export default function ProfilSayaPage() {
  const router = useRouter();
  const { 
    currentUser, 
    posts, 
    categories, 
    likePost, 
    bookmarkPost,
    commentPost, 
    reactPost, 
    gradePost,
    refreshData,
    logout
  } = useApp();

  const [profileSubTab, setProfileSubTab] = useState<'semua' | 'minggu' | 'bebas' | 'bookmark' | 'draft'>('semua');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirmLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!currentUser) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Masuk Untuk Melihat Profil</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Silakan masuk ke akun Anda untuk melihat statistik, portofolio karya, dan koleksi bookmark.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1d3580] transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Portal</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Filter user posts
  const myPosts = posts.filter(p => p.authorId === currentUser.id);
  const myLikesReceived = myPosts.reduce((acc, p) => acc + p.likes.length, 0);
  const myCompletedAgendas = myPosts.filter(p => p.isMingguLiterasi && p.status === 'published').length;

  const filteredMyPosts = myPosts.filter(p => {
    if (profileSubTab === 'semua') return p.status === 'published';
    if (profileSubTab === 'minggu') return p.status === 'published' && p.isMingguLiterasi;
    if (profileSubTab === 'bebas') return p.status === 'published' && !p.isMingguLiterasi;
    if (profileSubTab === 'draft') return p.status === 'draft';
    return true;
  });

  const bookmarkedPosts = posts.filter(p => (p.bookmarks?.includes(currentUser.id) || p.likes.includes(currentUser.id)) && p.authorId !== currentUser.id);

  const displayedPosts = profileSubTab === 'bookmark' ? bookmarkedPosts : filteredMyPosts;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('File yang diunggah harus berupa gambar!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        LiteStore.updateUserPhoto(currentUser.id, result);
        refreshData();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    if (confirm('Hapus foto profil dan gunakan avatar inisial?')) {
      LiteStore.updateUserPhoto(currentUser.id, '');
      refreshData();
    }
  };

  const handleOpenEditBio = () => {
    setBioInput(currentUser.bio || '');
    setIsEditingBio(true);
  };

  const handleSaveBio = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    LiteStore.updateUserBio(currentUser.id, bioInput.trim());
    refreshData();
    setIsEditingBio(false);
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-left max-w-5xl mx-auto">
        {/* Header Cover & Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-150/80 overflow-hidden shadow-xs relative">
          <div className="h-24 sm:h-28 bg-gradient-to-r from-[#132257] via-[#1a337e] to-[#2563eb] relative p-4 flex items-start justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[10px] font-semibold tracking-wide">
              <span>✨</span>
              <span>Portofolio Literasi Madrasah</span>
            </span>
          </div>

          <div className="px-4 sm:px-6 pb-5 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-10 sm:-mt-12 mb-3.5">
              {/* Profile Avatar with Photo Upload Trigger */}
              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm shrink-0 select-none bg-slate-100">
                  {currentUser.fotoProfil ? (
                    <Image 
                      src={currentUser.fotoProfil} 
                      alt={currentUser.nama} 
                      fill 
                      className="object-cover" 
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center">
                      {currentUser.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Floating Upload / Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti Foto Profil"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#132257] hover:bg-[#1c327e] text-white flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer hover:scale-110"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                {/* Quick Remove Photo if exists */}
                {currentUser.fotoProfil && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title="Hapus Foto Profil"
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer hover:scale-110"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Action Buttons: Compact, Modern & Proportional */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <Link
                  href="/tulis"
                  className="px-3 py-1.5 bg-[#132257] hover:bg-[#1c327e] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Tulis Karya</span>
                </Link>

                <button
                  onClick={handleOpenEditBio}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✏️</span>
                  <span>Edit Bio</span>
                </button>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl border border-rose-200/70 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.nama}
                </h2>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{currentUser.poin || 0} Poin</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="text-[#132257] font-semibold">
                  {currentUser.role === 'siswa' ? `Kelas ${currentUser.kelasNama || 'Siswa'}` : currentUser.role.replace('_', ' ')}
                </span>
                {currentUser.nis && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>NIS: {currentUser.nis}</span>
                  </>
                )}
              </p>

              <p className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-150/60 max-w-2xl leading-relaxed mt-2 font-normal">
                &ldquo;{currentUser.bio || 'Semangat berliterasi dan berkarya di MA NU 01 Banyuputih.'}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 4 Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Karya Terbit</p>
            <p className="text-3xl font-extrabold text-slate-900">{myPosts.filter(p => p.status === 'published').length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">📚 Tulisan orisinal</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Like Diterima</p>
            <p className="text-3xl font-extrabold text-slate-900">{myLikesReceived}</p>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">❤️ Apresiasi pembaca</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Agenda Selesai</p>
            <p className="text-3xl font-extrabold text-slate-900">{myCompletedAgendas}</p>
            <p className="text-[10px] text-indigo-600 font-semibold mt-1">🎯 Minggu Literasi wajib</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Koleksi Tersimpan</p>
            <p className="text-3xl font-extrabold text-slate-900">{bookmarkedPosts.length}</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">🔖 Bookmark favorit</p>
          </div>
        </div>

        {/* Sub-Tabs: Karya, Minggu Literasi, Bebas, Bookmark, Draft */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-5">
          <div className="flex border-b border-slate-100 overflow-x-auto gap-2 pb-2">
            {[
              { id: 'semua', label: 'Semua Karya', count: myPosts.filter(p => p.status === 'published').length },
              { id: 'minggu', label: 'Minggu Literasi', count: myPosts.filter(p => p.isMingguLiterasi && p.status === 'published').length },
              { id: 'bebas', label: 'Tulisan Bebas', count: myPosts.filter(p => !p.isMingguLiterasi && p.status === 'published').length },
              { id: 'bookmark', label: 'Bookmark', count: bookmarkedPosts.length },
              { id: 'draft', label: 'Draft Tersimpan', count: myPosts.filter(p => p.status === 'draft').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProfileSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  profileSubTab === tab.id
                    ? 'bg-[#132257] text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] ${
                  profileSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* List of Posts */}
          {displayedPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
              <p className="text-xs font-bold text-slate-700">Belum ada karya di bagian ini.</p>
              <p className="text-[11px] text-slate-400">Mulailah menulis karya literasimu hari ini!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedPosts.map(post => (
                <CardPost
                  key={post.id}
                  post={post}
                  categories={categories}
                  currentUserId={currentUser.id}
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
          onLike={(id) => likePost(id)}
          onBookmark={(id) => bookmarkPost(id)}
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

      {/* Custom In-App Modal Edit Bio */}
      {isEditingBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-150 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-base">✏️</span>
                <h3 className="font-bold text-sm text-slate-900">Perbarui Biodata Profil</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBio(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBio} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bio / Motto Literasi Anda
                </label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Tuliskan minat baca, kutipan favorit, atau impian literasi Anda..."
                  maxLength={200}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#132257] focus:ring-2 focus:ring-[#132257]/10 outline-none transition-all resize-none leading-relaxed"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-medium">
                  <span>Maksimal 200 karakter</span>
                  <span>{bioInput.length}/200</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#132257] hover:bg-[#1c327e] text-white shadow-xs transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Logout Kustom */}
      <ModalLogoutConfirm
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={currentUser.nama}
      />
    </AppShell>
  );
}
