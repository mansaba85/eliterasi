'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { User, Class, Category, Post, MingguLiterasiPeriod, Announcement } from '../lib/types';
import TabDataKelas from './admin/TabDataKelas';
import TabDataSiswa from './admin/TabDataSiswa';
import TabDataGuru from './admin/TabDataGuru';
import TabRekapLaporan from './admin/TabRekapLaporan';
import TabPengaturanSekolah from './admin/TabPengaturanSekolah';
import TabSertifikat from './admin/TabSertifikat';
import TabAuditLog from './admin/TabAuditLog';
import { 
  Users, Calendar, FolderOpen, Bell, Flag, Plus, 
  Eye, EyeOff, Trash2, FileText, Settings, Award, 
  BookOpen, ShieldAlert, Sparkles, CheckCircle, Search,
  Compass, ArrowRight, LayoutDashboard, Clock, AlertTriangle,
  Flame, CheckCircle2, ChevronRight, Menu, X, LogOut,
  ExternalLink, ArrowUpRight, ShieldCheck, Download, GraduationCap,
  Pencil
} from 'lucide-react';

export type AdminSubTab = 
  | 'overview'
  | 'periode'
  | 'kelas'
  | 'siswa' 
  | 'guru'
  | 'laporan'
  | 'pengaturan'
  | 'sertifikat'
  | 'kategori' 
  | 'moderasi' 
  | 'pengumuman'
  | 'log';

interface PanelAdminProps {
  currentUser?: User | null;
  activeSubTab?: AdminSubTab;
  onSubTabChange?: (tab: AdminSubTab) => void;
  onLogout?: () => void;
  users: User[];
  classes: Class[];
  categories: Category[];
  posts: Post[];
  periods: MingguLiterasiPeriod[];
  announcements: Announcement[];
  onAddStudent: (student: any) => void;
  onDeleteUser: (id: string) => void;
  onCreatePeriod: (nama: string, mulai: string, selesai: string, kategoriIdWajib?: string, kategoriNamaWajib?: string, temaInstruksi?: string, izinkanBebas?: boolean) => void;
  onSetPeriodActive: (id: string, active: boolean) => void;
  onCreateCategory: (nama: string, kode: string, ikon: string) => void;
  onUpdateCategory: (id: string, updates: any) => void;
  onDeleteCategory?: (id: string) => void;
  onDeletePost: (id: string) => void;
  onUpdatePost: (id: string, updates: any) => void;
  onAddAnnouncement: (judul: string, isi: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  onRefreshData?: () => void;
}

export default function PanelAdmin({
  currentUser,
  activeSubTab = 'overview',
  onSubTabChange,
  onLogout,
  users,
  classes,
  categories,
  posts,
  periods,
  announcements,
  onAddStudent,
  onDeleteUser,
  onCreatePeriod,
  onSetPeriodActive,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onDeletePost,
  onUpdatePost,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onRefreshData
}: PanelAdminProps) {
  // Normalize subtab
  const normalizedTab: AdminSubTab = (!activeSubTab || (activeSubTab as string) === 'admin') ? 'overview' : activeSubTab;
  const [internalTab, setInternalTab] = useState<AdminSubTab>(normalizedTab);
  const currentTab = onSubTabChange ? normalizedTab : internalTab;

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleTabClick = (tab: AdminSubTab) => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setInternalTab(tab);
    }
    setMobileSidebarOpen(false);
  };

  // Metrik Ringkas
  const totalSiswa = useMemo(() => users.filter(u => u.role === 'siswa').length, [users]);
  const totalGuru = useMemo(() => users.filter(u => u.role === 'guru').length, [users]);
  const totalKaryaPublik = useMemo(() => posts.filter(p => p.status === 'published').length, [posts]);
  const activePeriod = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return periods.find(p => {
      if (!p.isActive) return false;
      const tMulai = p.tanggalPelaksanaan || p.tanggalMulai;
      const tSelesai = p.tanggalSelesai || p.tanggalPelaksanaan || p.tanggalMulai;
      if (tMulai && today < tMulai) return false;
      if (tSelesai && today > tSelesai) return false;
      return true;
    });
  }, [periods]);

  // Form State untuk Periode, Kategori, Pengumuman
  const [periodNama, setPeriodNama] = useState('');
  const [periodMulai, setPeriodMulai] = useState('');
  const [periodSelesai, setPeriodSelesai] = useState('');
  const [periodKategoriId, setPeriodKategoriId] = useState('bebas');
  const [periodTema, setPeriodTema] = useState('');
  const [periodIzinkanBebas, setPeriodIzinkanBebas] = useState(true);

  const [catNama, setCatNama] = useState('');
  const [catKode, setCatKode] = useState('');
  const [catIkon, setCatIkon] = useState('📝');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [annJudul, setAnnJudul] = useState('');
  const [annIsi, setAnnIsi] = useState('');

  const [moderasiSearch, setModerasiSearch] = useState('');
  const [moderasiStatusFilter, setModerasiStatusFilter] = useState<'semua' | 'published' | 'draft'>('semua');

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = 
        p.judul.toLowerCase().includes(moderasiSearch.toLowerCase()) ||
        p.authorNama.toLowerCase().includes(moderasiSearch.toLowerCase()) ||
        (p.authorKelas && p.authorKelas.toLowerCase().includes(moderasiSearch.toLowerCase()));
      const matchStatus = 
        moderasiStatusFilter === 'semua' ? true :
        moderasiStatusFilter === 'published' ? p.status === 'published' :
        p.status !== 'published';
      return matchSearch && matchStatus;
    });
  }, [posts, moderasiSearch, moderasiStatusFilter]);

  // Handlers
  const handleCreatePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodNama.trim() || !periodMulai) return;

    const tglSelesai = periodSelesai || periodMulai;
    const selectedCat = categories.find(c => c.id === periodKategoriId);
    const kategoriNama = periodKategoriId === 'bebas' ? 'Bebas (Pilihan Siswa)' : (selectedCat?.nama || 'Kategori Khusus');

    onCreatePeriod(
      periodNama.trim(), 
      periodMulai, 
      tglSelesai, 
      periodKategoriId, 
      kategoriNama, 
      periodTema.trim(), 
      periodIzinkanBebas
    );

    setPeriodNama('');
    setPeriodMulai('');
    setPeriodSelesai('');
    setPeriodKategoriId('bebas');
    setPeriodTema('');
    setPeriodIzinkanBebas(true);
    alert('Agenda Hari Literasi baru berhasil dijadwalkan!');
    if (onRefreshData) onRefreshData();
  };

  const handleCategoryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNama.trim() || !catKode.trim()) return;

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        nama: catNama.trim(),
        kode: catKode.trim(),
        ikon: catIkon
      });
      setEditingCategory(null);
      setCatNama('');
      setCatKode('');
      setCatIkon('📝');
      alert('Kategori literasi berhasil diperbarui!');
    } else {
      onCreateCategory(catNama.trim(), catKode.trim(), catIkon);
      setCatNama('');
      setCatKode('');
      setCatIkon('📝');
      alert('Kategori literasi baru berhasil didaftarkan!');
    }
    if (onRefreshData) onRefreshData();
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCatNama('');
    setCatKode('');
    setCatIkon('📝');
  };

  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annJudul.trim() || !annIsi.trim()) return;

    onAddAnnouncement(annJudul.trim(), annIsi.trim());
    setAnnJudul('');
    setAnnIsi('');
    alert('Pengumuman baru disebarkan ke beranda siswa!');
    if (onRefreshData) onRefreshData();
  };

  const handleSetSeninMendatang = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() + ((1 + 7 - day) % 7 || 7);
    const nextMonday = new Date(today.setDate(diff));
    const formatted = nextMonday.toISOString().split('T')[0];
    
    setPeriodMulai(formatted);
    setPeriodSelesai(formatted);
    setPeriodNama(`Agenda Literasi Terjadwal (${nextMonday.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})`);
  };

  // Nav Sections untuk Sidebar Admin
  const NAV_SECTIONS = [
    {
      group: 'UTAMA',
      items: [
        { id: 'overview' as AdminSubTab, label: 'Dashboard & Ringkasan', icon: LayoutDashboard, badge: null, desc: 'Metrik sistem & status cepat' },
      ]
    },
    {
      group: 'OPERASIONAL LITERASI',
      items: [
        { id: 'periode' as AdminSubTab, label: 'Agenda Literasi', icon: Calendar, badge: activePeriod ? 'Aktif' : null, desc: 'Jadwal Senin Literasi' },
        { id: 'moderasi' as AdminSubTab, label: 'Moderasi Karya', icon: Flag, badge: `${posts.length}`, desc: 'Kurasi dan tayang naskah' },
        { id: 'pengumuman' as AdminSubTab, label: 'Pengumuman Beranda', icon: Bell, badge: `${announcements.length}`, desc: 'Siaran pengumuman siswa' },
      ]
    },
    {
      group: 'MANAJEMEN DATA',
      items: [
        { id: 'kelas' as AdminSubTab, label: 'Data Kelas', icon: GraduationCap, badge: `${classes.length}`, desc: 'Rombongan belajar & wali kelas' },
        { id: 'siswa' as AdminSubTab, label: 'Data Siswa', icon: Users, badge: `${totalSiswa}`, desc: 'Akun siswa & PIN login' },
        { id: 'guru' as AdminSubTab, label: 'Data Guru', icon: BookOpen, badge: `${totalGuru}`, desc: 'Dewan guru & pembimbing literasi' },
        { id: 'kategori' as AdminSubTab, label: 'Kategori Naskah', icon: FolderOpen, badge: `${categories.length}`, desc: 'Rubrik penulisan karya' },
      ]
    },
    {
      group: 'LAPORAN & DOKUMEN',
      items: [
        { id: 'laporan' as AdminSubTab, label: 'Rekap & Ekspor Nilai', icon: FileText, badge: 'CSV', desc: 'Nilai per rombel & unduhan' },
        { id: 'sertifikat' as AdminSubTab, label: 'Cetak e-Sertifikat', icon: Award, badge: null, desc: 'Piagam penghargaan siswa' },
      ]
    },
    {
      group: 'PENGATURAN SISTEM',
      items: [
        { id: 'pengaturan' as AdminSubTab, label: 'Branding & Bobot Poin', icon: Settings, badge: null, desc: 'Skor gamifikasi madrasah' },
        { id: 'log' as AdminSubTab, label: 'Log Audit Keamanan', icon: ShieldAlert, badge: null, desc: 'Riwayat aktivitas sistem' },
      ]
    }
  ];

  // Helper untuk mendapatkan judul dan grup menu saat ini
  const activeMenuInfo = useMemo(() => {
    for (const sec of NAV_SECTIONS) {
      const found = sec.items.find(i => i.id === currentTab);
      if (found) {
        return { group: sec.group, item: found };
      }
    }
    return { group: 'UTAMA', item: NAV_SECTIONS[0].items[0] };
  }, [currentTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-[#132257] selection:text-white">
      {/* ============================================================== */}
      {/* 1. SIDEBAR MENU ADMIN (DESKTOP FIXED)                         */}
      {/* ============================================================== */}
      <aside className="hidden lg:flex lg:w-72 lg:h-screen bg-[#0f1b40] p-5 shrink-0 flex-col justify-between text-white lg:fixed lg:top-0 lg:left-0 z-40 border-r border-white/5 overflow-hidden">
        <div className="flex flex-col h-full min-h-0">
          {/* Header Brand */}
          <div className="pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <Logo size="sm" light={true} />
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <div className="text-[10px] text-blue-200/70 mt-1 font-semibold">
              MA NU 01 Banyuputih Batang
            </div>
          </div>

          {/* User Mini Card */}
          <div className="py-3 my-2 px-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {currentUser?.nama?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-white leading-tight">
                  {currentUser?.nama || 'Administrator'}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Koordinator Literasi
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-white/50 hover:text-rose-300 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Items (Scrollable) */}
          <nav className="flex-1 overflow-y-auto pr-1 space-y-5 my-1 custom-scrollbar">
            {NAV_SECTIONS.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-blue-300/60 px-3 py-1 select-none">
                  {section.group}
                </h4>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group ${
                        isActive 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-slate-950' : 'text-blue-300 group-hover:scale-110'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                          isActive 
                            ? 'bg-slate-950/20 text-slate-950' 
                            : item.badge === 'Aktif' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-white/10 text-blue-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer Shortcuts: Lihat Portal Publik & Logout */}
          <div className="pt-3 border-t border-white/10 shrink-0 space-y-1.5">
            <Link
              href="/"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Beranda Siswa</span>
              </span>
              <span className="text-[10px] text-blue-300/60 font-semibold">Publik &rarr;</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE DRAWER SIDEBAR                                       */}
      {/* ============================================================== */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex animate-fade-in">
          <div className="w-72 bg-[#0f1b40] text-white h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <Logo size="sm" light={true} />
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-5">
              {NAV_SECTIONS.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-blue-300/60 px-3">
                    {section.group}
                  </h4>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive 
                            ? 'bg-amber-400 text-slate-950 font-black' 
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="pt-3 border-t border-white/10">
              <Link
                href="/"
                className="w-full py-2 px-3 text-xs font-bold text-blue-200 hover:text-white flex items-center justify-between"
              >
                <span>Lihat Beranda Siswa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT CONTAINER (Offset lg:ml-72)                   */}
      {/* ============================================================== */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Info */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <span>Panel Admin</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span>{activeMenuInfo.group}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {activeMenuInfo.item.label}
              </h2>
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-3">
            {/* Live Agenda Status Pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
              activePeriod 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${activePeriod ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{activePeriod ? 'Pekan Literasi Aktif' : 'Agenda Nonaktif'}</span>
            </div>

            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Portal Siswa</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ============================================================ */}
          {/* A. DASHBOARD RINGKASAN (OVERVIEW)                            */}
          {/* ============================================================ */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Welcome Hero */}
              <div className="bg-gradient-to-br from-[#0e1a42] via-[#132257] to-[#1e327a] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Selamat Bertugas, {currentUser?.nama || 'Administrator'}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Pusat Kendali E-Literasi Madrasah
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Pantau operasional Senin Literasi, kelola direktori akun siswa & pembimbing, kurasi publikasi naskah, serta unduh rekapitulasi penilaian berkas.
                    </p>
                  </div>

                  {/* Active Period Quick Banner */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 max-w-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold uppercase tracking-wider">Agenda Literasi</span>
                      <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${activePeriod ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-500/30 text-slate-300'}`}>
                        {activePeriod ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                    <p className="text-xs font-black text-white leading-tight">
                      {activePeriod ? activePeriod.nama : 'Tidak Ada Agenda yang Sedang Berjalan'}
                    </p>
                    <button
                      onClick={() => handleTabClick('periode')}
                      className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Kelola Agenda Pekanan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => handleTabClick('kelas')}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-300">Rombel Kelas</span>
                      <GraduationCap className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{classes.length}</div>
                    <div className="text-[10px] text-purple-300/80 mt-1 flex items-center gap-1">
                      <span>Kelola rombel kelas</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleTabClick('siswa')}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-300">Total Siswa</span>
                      <Users className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{totalSiswa}</div>
                    <div className="text-[10px] text-blue-300/80 mt-1 flex items-center gap-1">
                      <span>Kelola akun siswa</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleTabClick('guru')}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-300">Dewan Guru</span>
                      <BookOpen className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{totalGuru}</div>
                    <div className="text-[10px] text-emerald-300/80 mt-1 flex items-center gap-1">
                      <span>Pembimbing literasi</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleTabClick('moderasi')}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-300">Karya Literasi</span>
                      <Flag className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{totalKaryaPublik}</div>
                    <div className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
                      <span>{posts.length} total naskah</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Actions Grid: Data Kelas, Data Siswa, Data Guru */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div 
                  onClick={() => handleTabClick('kelas')}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:bg-purple-700 group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Data Kelas</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Input kelas dengan modal atau import massal rombongan belajar menggunakan Excel.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Buka Data Kelas & Import</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div 
                  onClick={() => handleTabClick('siswa')}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#132257] flex items-center justify-center font-bold group-hover:bg-[#132257] group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Data Siswa</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Input data siswa baru dengan modal atau import massal data NIS/PIN via Excel.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#132257] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Buka Data Siswa & Import</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div 
                  onClick={() => handleTabClick('guru')}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Data Guru</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Input guru dengan modal atau import massal akun pembimbing literasi via Excel.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Buka Data Guru & Import</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Feed Ringkasan Pengumuman & Karya Terbaru */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pengumuman Madrasah Terkini */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#132257]" />
                      <h3 className="font-extrabold text-slate-900 text-sm">Pengumuman Aktif di Beranda</h3>
                    </div>
                    <button 
                      onClick={() => handleTabClick('pengumuman')}
                      className="text-xs font-bold text-[#132257] hover:underline"
                    >
                      Kelola Semua &rarr;
                    </button>
                  </div>
                  {announcements.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Belum ada pengumuman disiarkan.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {announcements.slice(0, 3).map(a => (
                        <div key={a.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <h4 className="text-xs font-bold text-slate-900">{a.judul}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{a.isi}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Naskah Terakhir Menunggu Peninjauan */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-amber-600" />
                      <h3 className="font-extrabold text-slate-900 text-sm">Naskah Literasi Terbaru</h3>
                    </div>
                    <button 
                      onClick={() => handleTabClick('moderasi')}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      Moderasi Lengkap &rarr;
                    </button>
                  </div>
                  {posts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Belum ada naskah yang diterbitkan oleh siswa.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {posts.slice(0, 3).map(p => (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{p.judul}</h4>
                            <p className="text-[10px] text-slate-500">Oleh: {p.authorNama} ({p.authorKelas})</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold shrink-0 ${
                            p.status === 'published' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* B. SUB TAB DATA KELAS                                        */}
          {/* ============================================================ */}
          {currentTab === 'kelas' && (
            <TabDataKelas 
              classes={classes}
              users={users}
              onClassesUpdated={onRefreshData}
            />
          )}

          {/* ============================================================ */}
          {/* C. SUB TAB DATA SISWA                                        */}
          {/* ============================================================ */}
          {currentTab === 'siswa' && (
            <TabDataSiswa 
              users={users}
              classes={classes}
              onAddStudent={onAddStudent}
              onDeleteUser={onDeleteUser}
              onUserUpdated={onRefreshData}
            />
          )}

          {/* ============================================================ */}
          {/* D. SUB TAB DATA GURU                                         */}
          {/* ============================================================ */}
          {currentTab === 'guru' && (
            <TabDataGuru 
              users={users}
              classes={classes}
              onUserUpdated={onRefreshData}
            />
          )}

          {/* ============================================================ */}
          {/* C. SUB TAB AGENDA LITERASI (PERIODE)                         */}
          {/* ============================================================ */}
          {currentTab === 'periode' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-lg font-bold shadow-sm">
                  📅
                </div>
                <div className="text-xs text-amber-950 leading-relaxed space-y-1 flex-1">
                  <h4 className="font-extrabold text-amber-950 text-sm">
                    Manajemen Agenda Hari Literasi Terjadwal
                  </h4>
                  <p className="text-amber-900/90">
                    Pekan literasi dirancang terstruktur agar seluruh siswa termotivasi menyetorkan karya tepat waktu. 
                    Saat hari literasi tiba, pastikan status agenda diaktifkan dengan mengklik tombol <strong>&ldquo;Aktifkan Sekarang&rdquo;</strong> di bawah.
                  </p>
                </div>
                <button
                  onClick={handleSetSeninMendatang}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                  + Jadwalkan Senin Depan
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#132257]" /> Jadwalkan Agenda Baru
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">Form Agenda</span>
                  </div>

                  <form onSubmit={handleCreatePeriodSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nama Agenda Literasi <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Misal: Agenda Literasi (Senin, 12 Oktober 2026)" 
                        value={periodNama} 
                        onChange={(e) => setPeriodNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Jenis Tulisan yang Ditentukan
                      </label>
                      <select 
                        value={periodKategoriId}
                        onChange={(e) => setPeriodKategoriId(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                      >
                        <option value="bebas">✨ Bebas / Fleksibel (Siswa Bebas Memilih)</option>
                        {categories.filter(c => c.isActive).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.ikon} {c.nama} (Kategori Wajib)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tema / Arahan Penulisan Madrasah
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Contoh: Membaca buku inspiratif di perpustakaan lalu tulis rangkumannya..."
                        value={periodTema}
                        onChange={(e) => setPeriodTema(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs leading-relaxed font-medium text-slate-800 outline-none focus:border-[#132257] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tanggal Mulai <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          required 
                          value={periodMulai} 
                          onChange={(e) => setPeriodMulai(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#132257] text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tanggal Selesai
                        </label>
                        <input 
                          type="date" 
                          value={periodSelesai} 
                          onChange={(e) => setPeriodSelesai(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#132257] text-slate-800"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-[#132257] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Simpan & Jadwalkan Agenda
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Daftar Agenda Hari Literasi ({periods.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Klik tombol untuk mengaktifkan atau menonaktifkan status agenda
                      </p>
                    </div>
                  </div>

                  {periods.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      Belum ada agenda literasi yang dijadwalkan.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {periods.map(period => (
                        <div 
                          key={period.id} 
                          className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            period.isActive ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{period.nama}</span>
                              {period.isActive ? (
                                (() => {
                                  const today = new Date().toISOString().split('T')[0];
                                  const tMulai = period.tanggalPelaksanaan || period.tanggalMulai;
                                  const tSelesai = period.tanggalSelesai || period.tanggalPelaksanaan || period.tanggalMulai;
                                  const isToday = (!tMulai || today >= tMulai) && (!tSelesai || today <= tSelesai);
                                  
                                  if (isToday) {
                                    return (
                                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                        BERLANGSUNG HARI INI
                                      </span>
                                    );
                                  } else if (tMulai && today < tMulai) {
                                    return (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                        ⏳ MENUNGGU TANGGAL (AKTIF)
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                        ⏱️ TANGGAL TERLEWAT
                                      </span>
                                    );
                                  }
                                })()
                              ) : (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  NONAKTIF
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>📅 Mulai: <strong>{period.tanggalMulai}</strong></span>
                              <span>🏁 Selesai: <strong>{period.tanggalSelesai}</strong></span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                Rubrik: {period.kategoriNamaWajib || 'Bebas'}
                              </span>
                            </div>

                            {period.temaInstruksi && (
                              <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                                &ldquo;{period.temaInstruksi}&rdquo;
                              </p>
                            )}
                          </div>

                          <button 
                            onClick={() => onSetPeriodActive(period.id, !period.isActive)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                              period.isActive 
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                                : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm'
                            }`}
                          >
                            {period.isActive ? 'Nonaktifkan' : 'Aktifkan Sekarang'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* D. SUB TAB MODERASI KONTEN                                    */}
          {/* ============================================================ */}
          {currentTab === 'moderasi' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm space-y-0">
              <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Moderasi Jurnal & Tulisan Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Saring naskah yang melanggar norma atau sembunyikan tulisan yang belum layak tayang
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Cari judul/penulis..."
                      value={moderasiSearch}
                      onChange={(e) => setModerasiSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257] w-48 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    {(['semua', 'published', 'draft'] as const).map(statusKey => (
                      <button
                        key={statusKey}
                        onClick={() => setModerasiStatusFilter(statusKey)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          moderasiStatusFilter === statusKey
                            ? 'bg-[#132257] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {statusKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Penulis & Kelas</th>
                      <th className="p-4">Judul Karya</th>
                      <th className="p-4">Cuplikan Isi</th>
                      <th className="p-4">Visibilitas</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                          Tidak ada karya yang cocok dengan pencarian / filter status.
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map(post => (
                        <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{post.authorNama}</div>
                            <div className="text-[10px] text-slate-500">Kelas: {post.authorKelas || '-'}</div>
                          </td>
                          <td className="p-4 font-bold text-slate-800 max-w-[200px] truncate">
                            {post.judul}
                          </td>
                          <td className="p-4 max-w-xs text-slate-500 truncate">
                            {post.isi}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              post.visibilitas === 'publik' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {post.visibilitas}
                            </span>
                          </td>
                          <td className="p-4">
                            {post.status === 'published' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                Disembunyikan
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {post.status === 'published' ? (
                                <button 
                                  onClick={() => {
                                    onUpdatePost(post.id, { status: 'draft' });
                                    alert(`Karya "${post.judul}" berhasil disembunyikan dari beranda.`);
                                  }}
                                  className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                                >
                                  <EyeOff className="w-3.5 h-3.5" /> Sembunyikan
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    onUpdatePost(post.id, { status: 'published', visibilitas: 'publik' });
                                    alert(`Karya "${post.judul}" berhasil ditampilkan ke publik!`);
                                  }}
                                  className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Tampilkan
                                </button>
                              )}

                              <button 
                                onClick={() => {
                                  if (confirm(`Hapus permanen karya "${post.judul}" karya ${post.authorNama}?`)) {
                                    onDeletePost(post.id);
                                  }
                                }}
                                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* E. SUB TAB REKAP & EKSPOR LAPORAN                            */}
          {/* ============================================================ */}
          {currentTab === 'laporan' && (
            <TabRekapLaporan 
              users={users}
              classes={classes}
              posts={posts}
              categories={categories}
            />
          )}

          {/* ============================================================ */}
          {/* F. SUB TAB PENGATURAN & BRANDING SEKOLAH                     */}
          {/* ============================================================ */}
          {currentTab === 'pengaturan' && (
            <TabPengaturanSekolah 
              onSettingsSaved={onRefreshData}
            />
          )}

          {/* ============================================================ */}
          {/* G. SUB TAB E-SERTIFIKAT & PIAGAM                             */}
          {/* ============================================================ */}
          {currentTab === 'sertifikat' && (
            <TabSertifikat 
              users={users}
              onCertificateCreated={onRefreshData}
            />
          )}



          {/* ============================================================ */}
          {/* I. SUB TAB LOG AUDIT SISTEM                                  */}
          {/* ============================================================ */}
          {currentTab === 'log' && (
            <TabAuditLog 
              onLogCleared={onRefreshData}
            />
          )}

          {/* ============================================================ */}
          {/* J. SUB TAB KATEGORI NASKAH                                   */}
          {/* ============================================================ */}
          {currentTab === 'kategori' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    {editingCategory ? (
                      <>
                        <Pencil className="w-4 h-4 text-blue-600" /> Edit Kategori Naskah
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-emerald-800" /> Tambah Kategori Baru
                      </>
                    )}
                  </h3>
                  {editingCategory ? (
                    <button
                      type="button"
                      onClick={handleCancelEditCategory}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Batal
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Master Data</span>
                  )}
                </div>

                <form onSubmit={handleCategoryFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Kategori</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Misal: Opini Islami, Resensi Buku" 
                      value={catNama} 
                      onChange={(e) => setCatNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Unik (Slug)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Misal: opini-islami" 
                      value={catKode} 
                      onChange={(e) => setCatKode(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ikon Emoji</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        required 
                        maxLength={4}
                        value={catIkon} 
                        onChange={(e) => setCatIkon(e.target.value)}
                        className="w-16 px-3 py-2 border border-slate-200 rounded-xl text-xl text-center outline-none focus:border-emerald-700"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {['📝', '📖', '📚', '✍️', '🌸', '🔬', '💡', '📰', '🧚', '🕌', '🌟', '🌱'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setCatIkon(emoji)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm flex items-center justify-center cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      type="submit" 
                      className={`flex-1 py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        editingCategory 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      {editingCategory ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Simpan Perubahan
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Daftarkan Kategori
                        </>
                      )}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={handleCancelEditCategory}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Daftar Kategori Naskah Literasi ({categories.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Kategori yang aktif akan tampil sebagai pilihan jenis tulisan saat siswa membuat naskah
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Ikon</th>
                        <th className="p-4">Nama Kategori</th>
                        <th className="p-4">Kode Unik</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {categories.map(cat => (
                        <tr 
                          key={cat.id} 
                          className={`hover:bg-slate-50/60 transition-colors ${
                            editingCategory?.id === cat.id ? 'bg-blue-50/70 ring-1 ring-blue-300' : ''
                          }`}
                        >
                          <td className="p-4 text-xl select-none">{cat.ikon}</td>
                          <td className="p-4 font-bold text-slate-900">{cat.nama}</td>
                          <td className="p-4 font-mono text-slate-500 text-[11px]">{cat.kode}</td>
                          <td className="p-4 text-center">
                            {cat.isActive ? (
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                AKTIF
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                NONAKTIF
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button 
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCatNama(cat.nama);
                                  setCatKode(cat.kode);
                                  setCatIkon(cat.ikon);
                                }}
                                title="Edit Nama, Kode & Ikon Kategori"
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                  editingCategory?.id === cat.id
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                                }`}
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>

                              {/* Toggle Status */}
                              <button 
                                type="button"
                                onClick={() => {
                                  onUpdateCategory(cat.id, { isActive: !cat.isActive });
                                  if (onRefreshData) onRefreshData();
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                  cat.isActive 
                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200' 
                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {cat.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              {/* Hapus Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.nama}"?`)) {
                                    if (onDeleteCategory) {
                                      onDeleteCategory(cat.id);
                                    }
                                    if (editingCategory?.id === cat.id) {
                                      handleCancelEditCategory();
                                    }
                                    if (onRefreshData) onRefreshData();
                                  }
                                }}
                                title="Hapus Kategori"
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* K. SUB TAB PENGUMUMAN MADRASAH                               */}
          {/* ============================================================ */}
          {currentTab === 'pengumuman' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-800" /> Tulis Pengumuman Baru
                  </h3>
                  <span className="text-[10px] text-slate-400">Siaran Beranda</span>
                </div>

                <form onSubmit={handleAddAnnouncementSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Pengumuman</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Misal: Penutupan Setoran Jurnal Literasi Pekan Ini" 
                      value={annJudul} 
                      onChange={(e) => setAnnJudul(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Isi Pesan Pengumuman</label>
                    <textarea 
                      required 
                      rows={5}
                      placeholder="Tulis pesan lengkap yang dapat dibaca oleh seluruh siswa dan guru..." 
                      value={annIsi} 
                      onChange={(e) => setAnnIsi(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs leading-relaxed font-medium text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> Sebarkan Pengumuman ke Beranda
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Pengumuman Terpasang ({announcements.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Daftar pengumuman aktif yang tampil di beranda utama aplikasi
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                  {announcements.length === 0 ? (
                    <div className="text-center text-slate-400 italic text-xs py-10">
                      Belum ada pengumuman disebarkan ke beranda.
                    </div>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id} className="border border-slate-200/80 bg-slate-50/60 rounded-2xl p-4 flex justify-between items-start gap-4 hover:border-slate-300 transition-colors">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{ann.judul}</h4>
                            {!ann.isActive && (
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                                NONAKTIF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{ann.isi}</p>
                          <p className="text-[10px] text-slate-400">
                            Oleh: <span className="font-semibold text-slate-600">{ann.createdBy}</span>
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => onDeleteAnnouncement(ann.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus pengumuman"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
