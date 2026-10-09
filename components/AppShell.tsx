'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../lib/AppContext';
import Logo from './Logo';
import ModalLogoutConfirm from './ModalLogoutConfirm';
import { 
  BookOpen, PenTool, Bookmark, Calendar, User as UserIcon, 
  Settings, LogOut, Search, Trophy, Bell, Menu, X, Shield, 
  Sparkles, Award, ArrowRight, LogIn
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, activePeriod, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isSiswa = currentUser?.role === 'siswa';
  const isGuru = currentUser?.role === 'guru';
  const isAdmin = currentUser?.role === 'admin';
  const isKepala = currentUser?.role === 'kepala_madrasah';

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleConfirmLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex lg:flex-row flex-col font-sans selection:bg-[#132257] selection:text-white">
      {/* ============================================================== */}
      {/* 1. DESKTOP SIDEBAR                                             */}
      {/* ============================================================== */}
      <aside className="hidden lg:flex lg:w-64 lg:h-screen bg-[#111c44] p-5 shrink-0 flex-col justify-between text-white lg:fixed lg:top-0 lg:left-0 z-40 overflow-y-auto border-r border-slate-800/40">
        <div className="space-y-4">
          {/* Logo Row */}
          <Link href="/" className="block pb-4 border-b border-white/8 hover:opacity-90 transition-opacity">
            <Logo size="md" light={true} />
          </Link>

          {/* Active Period Banner - Slim & Modernized */}
          {activePeriod && (
            <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-400/30 text-white rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 font-bold text-[10px] text-amber-300 uppercase tracking-wider mb-0.5 leading-none">
                <span>🔥</span>
                <span>Minggu Literasi</span>
              </div>
              <p className="text-xs font-semibold text-white truncate">{activePeriod.nama}</p>
              <p className="text-[10px] text-amber-200/70 font-normal mt-0.5">
                Sampai {activePeriod.tanggalSelesai}
              </p>
            </div>
          )}

          {/* Navigasi Utama */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2 select-none">
              Menu
            </h4>

            {/* Beranda */}
            <Link
              href="/"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/') && pathname === '/'
                  ? 'bg-white/12 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <BookOpen className="w-4 h-4 opacity-80" />
              <span>Beranda</span>
            </Link>

            {/* Tulis Karya (Hanya untuk Siswa/Non-Admin) */}
            {!isAdmin && (
              <Link
                href="/tulis"
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive('/tulis')
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-amber-300 hover:bg-amber-400/10'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Tulis Karya</span>
              </Link>
            )}

            {/* Agenda Minggu Literasi */}
            <Link
              href="/minggu-literasi"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/minggu-literasi')
                  ? 'bg-white/12 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 opacity-80" />
                <span>Agenda Literasi</span>
              </div>
              {activePeriod && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />}
            </Link>

            {/* Bookmark */}
            <Link
              href="/bookmark"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/bookmark')
                  ? 'bg-white/12 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <Bookmark className="w-4 h-4 opacity-80" />
              <span>Bookmark & Buku</span>
            </Link>

            {/* Pencarian Global */}
            <Link
              href="/cari"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/cari')
                  ? 'bg-white/12 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <Search className="w-4 h-4 opacity-80" />
              <span>Cari Naskah</span>
            </Link>

            {/* Profil Saya */}
            {currentUser && (
              <Link
                href="/profil/saya"
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive('/profil')
                    ? 'bg-white/12 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/6'
                }`}
              >
                <UserIcon className="w-4 h-4 opacity-80" />
                <span>Profil Saya</span>
              </Link>
            )}

            {/* Role-Specific Navigasi */}
            {isGuru && (
              <div className="pt-2.5 mt-2 border-t border-white/8">
                <Link
                  href="/guru"
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/guru')
                      ? 'bg-white/12 text-white font-semibold shadow-xs'
                      : 'text-emerald-300 hover:bg-white/6'
                  }`}
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Panel Guru</span>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="pt-2.5 mt-2 border-t border-white/8">
                <Link
                  href="/admin"
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/admin')
                      ? 'bg-white/12 text-white font-semibold shadow-xs'
                      : 'text-amber-200 hover:bg-white/6'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Panel Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-3 border-t border-white/8">
          {currentUser ? (
            <div className="bg-white/4 rounded-xl p-2.5 border border-white/8 flex items-center justify-between">
              <Link href="/profil/saya" className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-white leading-tight">{currentUser.nama}</p>
                  <p className="text-[10px] text-slate-400 font-normal truncate capitalize">
                    {currentUser.role === 'siswa' ? `Kelas ${currentUser.kelasNama || 'Siswa'}` : currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-slate-400 hover:text-rose-300 p-1.5 transition-colors cursor-pointer"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full py-2 px-3 bg-white/8 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>Masuk Portal</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. TOPBAR FOR MOBILE & TABLET                                 */}
      {/* ============================================================== */}
      <header className="lg:hidden bg-[#132257] text-white px-4 py-3.5 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" light={true} />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/cari"
            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-[#132257] text-white h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-right"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <Logo size="sm" light={true} />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { href: '/', label: 'Beranda', icon: BookOpen },
                  ...(!isAdmin ? [{ href: '/tulis', label: 'Tulis Karya', icon: PenTool, highlight: true }] : []),
                  { href: '/minggu-literasi', label: 'Agenda Literasi', icon: Calendar },
                  { href: '/bookmark', label: 'Bookmark & Buku', icon: Bookmark },
                  { href: '/cari', label: 'Cari Naskah', icon: Search },
                  ...(currentUser ? [{ href: '/profil/saya', label: 'Profil Saya', icon: UserIcon }] : []),
                  ...(isGuru ? [{ href: '/guru', label: 'Panel Guru', icon: Settings }] : []),
                  ...(isAdmin ? [{ href: '/admin', label: 'Panel Admin', icon: Shield, highlight: true }] : []),
                ].map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-white text-[#132257] shadow-sm'
                          : item.highlight
                            ? 'text-amber-300 hover:bg-white/10'
                            : 'text-blue-100 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              {currentUser ? (
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentUser.nama}</p>
                    <p className="text-[10px] text-blue-200 capitalize">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="p-1.5 text-rose-300 hover:text-rose-100 cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-white text-[#132257] font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Portal</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT CONTAINER (Desktop offset by sidebar lg:ml-64) */}
      {/* ============================================================== */}
      <main key={pathname} className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen pb-24 lg:pb-8 animate-page-fade">
        {children}
      </main>

      {/* ============================================================== */}
      {/* 4. MOBILE BOTTOM NAVIGATION (Visible on screens below lg)     */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-3 py-1.5 z-40 flex items-center justify-around shadow-sm">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            pathname === '/' ? 'text-[#111c44]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
          <span className="text-[10px] font-medium mt-0.5">Beranda</span>
        </Link>

        <Link
          href="/minggu-literasi"
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all relative ${
            isActive('/minggu-literasi') ? 'text-[#111c44]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className={`w-5 h-5 ${isActive('/minggu-literasi') ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
          <span className="text-[10px] font-medium mt-0.5">Agenda</span>
          {activePeriod && <span className="absolute top-1 right-5 w-1.5 h-1.5 bg-amber-500 rounded-full" />}
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center -top-3.5 relative"
          >
            <div className="w-11 h-11 rounded-full bg-[#111c44] text-amber-300 flex items-center justify-center shadow-md border-2 border-white">
              <Shield className="w-5 h-5 stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-semibold text-[#111c44] mt-0.5">Admin</span>
          </Link>
        ) : (
          <Link
            href="/tulis"
            className="flex flex-col items-center justify-center -top-3.5 relative"
          >
            <div className="w-11 h-11 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 border-white">
              <PenTool className="w-5 h-5 stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-semibold text-amber-800 mt-0.5">Tulis</span>
          </Link>
        )}

        <Link
          href="/bookmark"
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            isActive('/bookmark') ? 'text-[#111c44]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isActive('/bookmark') ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
          <span className="text-[10px] font-medium mt-0.5">Koleksi</span>
        </Link>

        <Link
          href={currentUser ? '/profil/saya' : '/login'}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            isActive('/profil') || isActive('/login') ? 'text-[#111c44]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className={`w-5 h-5 ${isActive('/profil') || isActive('/login') ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
          <span className="text-[10px] font-medium mt-0.5">{currentUser ? 'Profil' : 'Masuk'}</span>
        </Link>
      </nav>

      {/* Modal Konfirmasi Logout Kustom */}
      <ModalLogoutConfirm
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={currentUser?.nama || 'Pengguna'}
      />
    </div>
  );
}
