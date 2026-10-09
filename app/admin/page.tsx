'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import PanelAdmin, { AdminSubTab } from '@/components/PanelAdmin';
import ModalLogoutConfirm from '@/components/ModalLogoutConfirm';
import { LiteStore } from '@/lib/store';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminPage() {
  const router = useRouter();
  const { 
    currentUser, 
    posts, 
    users, 
    periods, 
    classes, 
    categories, 
    announcements,
    refreshData,
    logout
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    router.replace('/login');
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-md w-full shadow-2xl space-y-5 animate-fade-in">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
            🛡️
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Akses Konsol Admin</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Halaman ini dikhususkan bagi Administrator IT & Koordinator Literasi MA NU 01 Banyuputih.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#132257] hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sebagai Admin</span>
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Madrasah</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-10 text-center max-w-md w-full shadow-xl space-y-5">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Akses Ditolak</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Akun Anda (<strong>{currentUser.nama}</strong> - {currentUser.role}) tidak memiliki wewenang untuk membuka konsol administrator sistem literasi.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#132257] text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-900 transition-colors"
          >
            <span>Kembali ke Halaman Siswa</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PanelAdmin
        currentUser={currentUser}
        activeSubTab={activeSubTab}
        onSubTabChange={(tab) => setActiveSubTab(tab)}
        onLogout={() => setShowLogoutModal(true)}
        users={users}
        classes={classes}
        categories={categories}
        posts={posts}
        periods={periods}
        announcements={announcements}
        onAddStudent={(std) => {
          LiteStore.addStudent(std);
          refreshData();
        }}
        onDeleteUser={(id) => {
          LiteStore.deleteUser(id);
          refreshData();
        }}
        onCreatePeriod={(nama, mulai, selesai, catId, catNama, tema, bebas) => {
          LiteStore.createPeriod(nama, mulai, selesai, catId, catNama, tema, bebas);
          refreshData();
        }}
        onSetPeriodActive={(id, active) => {
          LiteStore.setPeriodActive(id, active);
          refreshData();
        }}
        onCreateCategory={(nama, kode, ikon) => {
          LiteStore.createCategory(nama, kode, ikon);
          refreshData();
        }}
        onUpdateCategory={(id, updates) => {
          LiteStore.updateCategory(id, updates);
          refreshData();
        }}
        onDeleteCategory={(id) => {
          LiteStore.deleteCategory(id);
          refreshData();
        }}
        onDeletePost={(id) => {
          LiteStore.deletePost(id);
          refreshData();
        }}
        onUpdatePost={(id, updates) => {
          LiteStore.updatePost(id, updates);
          refreshData();
        }}
        onAddAnnouncement={(judul, isi) => {
          LiteStore.addAnnouncement(judul, isi, currentUser.nama);
          refreshData();
        }}
        onDeleteAnnouncement={(id) => {
          LiteStore.deleteAnnouncement(id);
          refreshData();
        }}
        onRefreshData={refreshData}
      />

      <ModalLogoutConfirm
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={currentUser.nama}
      />
    </>
  );
}
