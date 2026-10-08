'use client';

import React, { useState, useMemo } from 'react';
import { User, Post, Class, MingguLiterasiPeriod, Category } from '../lib/types';
import { 
  Award, Calendar, CheckCircle, Download, FileSpreadsheet, 
  BookOpen, Star, Filter, Search, ChevronRight, Clock,
  Sparkles, BookmarkCheck, Library, Printer, FileText, ArrowUpDown, X
} from 'lucide-react';
import RechartsWrapper from './RechartsWrapper';

interface PanelGuruProps {
  currentUser: User;
  posts: Post[];
  users: User[];
  periods: MingguLiterasiPeriod[];
  classes: Class[];
  categories?: Category[];
  onOpenDetail: (post: Post) => void;
}

export default function PanelGuru({
  currentUser,
  posts,
  users,
  periods,
  classes,
  categories = [],
  onOpenDetail
}: PanelGuruProps) {
  // Main Sub-Tab: 'eksplorasi' (Jelajahi & Kurasi) atau 'arsip' (Arsip Karya Pilihan Guru)
  const [activeSubTab, setActiveSubTab] = useState<'eksplorasi' | 'arsip'>('eksplorasi');

  // Filter Dropdown States (Tab Eksplorasi)
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods.find(p => p.isActive)?.id || periods[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'sudah' | 'dinilai' | 'belum'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States (Tab Arsip Karya Pilihan)
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState<string>('all');
  const [archivePredicateFilter, setArchivePredicateFilter] = useState<'all' | 'istimewa' | 'baik_sekali' | 'baik'>('all');
  const [archiveClassFilter, setArchiveClassFilter] = useState<string>('all');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveSortBy, setArchiveSortBy] = useState<'skor' | 'terbaru'>('skor');
  const [showPrintAntologiModal, setShowPrintAntologiModal] = useState(false);

  // Extract all available classes across registered classes and user profiles
  const availableClasses = useMemo(() => {
    const map = new Map<string, { id: string; nama: string; tahunAjaran?: string }>();
    classes.forEach(c => {
      map.set(c.id, { id: c.id, nama: c.namaKelas, tahunAjaran: c.tahunAjaran });
    });
    users.forEach(u => {
      if (u.kelasId && u.kelasNama && !map.has(u.kelasId)) {
        map.set(u.kelasId, { id: u.kelasId, nama: u.kelasNama, tahunAjaran: '2026/2027' });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [classes, users]);

  // Selected period object
  const selectedPeriod = useMemo(() => {
    return periods.find(p => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  // Get filtered students based on Class filter
  const filteredStudents = useMemo(() => {
    const allStudents = users.filter(u => u.role === 'siswa');
    if (selectedClassId === 'all') {
      return allStudents;
    }
    const targetClass = availableClasses.find(c => c.id === selectedClassId);
    return allStudents.filter(u => 
      u.kelasId === selectedClassId || 
      (targetClass && u.kelasNama === targetClass.nama)
    );
  }, [users, selectedClassId, availableClasses]);

  // Rekap Data Siswa untuk tabel eksplorasi kurasi
  const rekapSiswa = useMemo(() => {
    return filteredStudents.map(student => {
      // Cari tulisan minggu literasi siswa pada periode ini
      const postSubmitted = posts.find(p => 
        p.authorId === student.id && 
        p.isMingguLiterasi && 
        p.periodeId === selectedPeriodId && 
        p.status === 'published'
      );

      let status: 'belum' | 'sudah' | 'dinilai' = 'belum';
      if (postSubmitted) {
        status = postSubmitted.grade ? 'dinilai' : 'sudah';
      }

      return {
        id: student.id,
        nis: student.nis || '-',
        nama: student.nama,
        kelasNama: student.kelasNama || availableClasses.find(c => c.id === student.kelasId)?.nama || 'Umum',
        status,
        post: postSubmitted,
        poin: student.poin || 0
      };
    });
  }, [filteredStudents, posts, selectedPeriodId, availableClasses]);

  // Filter rekap berdasarkan pencarian dan filter status
  const visibleRekap = useMemo(() => {
    return rekapSiswa.filter(item => {
      // Filter status kurasi
      if (statusFilter === 'sudah' && item.status !== 'sudah') return false;
      if (statusFilter === 'dinilai' && item.status !== 'dinilai') return false;
      if (statusFilter === 'belum' && item.status !== 'belum') return false;

      // Filter query pencarian
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNama = item.nama.toLowerCase().includes(query);
        const matchNis = item.nis.toLowerCase().includes(query);
        const matchKelas = item.kelasNama.toLowerCase().includes(query);
        const matchJudul = item.post?.judul.toLowerCase().includes(query) || false;
        return matchNama || matchNis || matchKelas || matchJudul;
      }
      return true;
    });
  }, [rekapSiswa, statusFilter, searchQuery]);

  // Statistik Kurasi Tab Eksplorasi
  const totalStudents = rekapSiswa.length;
  const countDinilai = rekapSiswa.filter(r => r.status === 'dinilai').length;
  const countPerluNilai = rekapSiswa.filter(r => r.status === 'sudah').length;
  const countSudah = countDinilai + countPerluNilai;
  const countBelum = rekapSiswa.filter(r => r.status === 'belum').length;
  const persentaseKepatuhan = totalStudents > 0 ? Math.round((countSudah / totalStudents) * 100) : 0;

  // Hitung rata-rata skor kurasi untuk karya yang dinilai
  const gradedPostsInPeriod = rekapSiswa.filter(r => r.post?.grade).map(r => r.post!.grade!.skor);
  const avgGradedScore = gradedPostsInPeriod.length > 0 
    ? Math.round(gradedPostsInPeriod.reduce((acc, cur) => acc + cur, 0) / gradedPostsInPeriod.length)
    : 0;

  // Statistik ringkasan seluruh kelas untuk visualisasi berjenjang (Skalabilitas 1.000 Siswa)
  const classSummaryList = useMemo(() => {
    return availableClasses.map(c => {
      const students = users.filter(u => u.role === 'siswa' && (u.kelasId === c.id || u.kelasNama === c.nama));
      let submitted = 0;
      let graded = 0;
      students.forEach(std => {
        const p = posts.find(post => 
          post.authorId === std.id && 
          post.isMingguLiterasi && 
          post.periodeId === selectedPeriodId && 
          post.status === 'published'
        );
        if (p) {
          submitted++;
          if (p.grade) graded++;
        }
      });
      const total = Math.max(students.length, 1);
      const percentage = Math.round((submitted / total) * 100);
      return {
        id: c.id,
        nama: c.nama,
        totalSiswa: students.length,
        submitted,
        unsubmitted: Math.max(0, students.length - submitted),
        graded,
        percentage
      };
    });
  }, [availableClasses, users, posts, selectedPeriodId]);

  // Active class label display
  const activeClassLabel = selectedClassId === 'all' 
    ? 'Semua Kelas Madrasah' 
    : `Kelas ${availableClasses.find(c => c.id === selectedClassId)?.nama || selectedClassId}`;

  // Data untuk Diagram Recharts Tab Eksplorasi
  const pieData = [
    { name: 'Terkurasi (Pilihan Guru)', value: countDinilai },
    { name: 'Siap Diapresiasi', value: countPerluNilai },
    { name: 'Belum Ada Karya', value: countBelum }
  ];

  const barData = [
    { name: 'Total Siswa', jumlah: totalStudents, fill: '#132257' },
    { name: 'Karya Terbit', jumlah: countSudah, fill: '#059669' },
    { name: 'Terkurasi Guru', jumlah: countDinilai, fill: '#4F46E5' },
    { name: 'Belum Terbit', jumlah: countBelum, fill: '#94A3B8' }
  ];

  // --- SEMUA KARYA TERKURASI (UNTUK TAB ARSIP KARYA PILIHAN GURU) ---
  const allCuratedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'published' && Boolean(p.grade));
  }, [posts]);

  // Filtered Curated Posts for Archive Tab
  const visibleCuratedPosts = useMemo(() => {
    return allCuratedPosts.filter(post => {
      // Filter Kategori
      if (archiveCategoryFilter !== 'all' && post.kategoriId !== archiveCategoryFilter) {
        return false;
      }

      // Filter Predikat Skor
      if (archivePredicateFilter !== 'all') {
        const skor = post.grade?.skor || 0;
        if (archivePredicateFilter === 'istimewa' && skor < 90) return false;
        if (archivePredicateFilter === 'baik_sekali' && (skor < 80 || skor >= 90)) return false;
        if (archivePredicateFilter === 'baik' && skor >= 80) return false;
      }

      // Filter Kelas
      if (archiveClassFilter !== 'all' && post.authorKelas !== archiveClassFilter) {
        return false;
      }

      // Search Query
      if (archiveSearchQuery.trim()) {
        const q = archiveSearchQuery.toLowerCase().trim();
        const matchJudul = post.judul.toLowerCase().includes(q);
        const matchAuthor = post.authorNama.toLowerCase().includes(q);
        const matchCatatan = post.grade?.catatan.toLowerCase().includes(q) || false;
        const matchGuru = post.grade?.guruNama.toLowerCase().includes(q) || false;
        return matchJudul || matchAuthor || matchCatatan || matchGuru;
      }

      return true;
    }).sort((a, b) => {
      if (archiveSortBy === 'skor') {
        return (b.grade?.skor || 0) - (a.grade?.skor || 0);
      }
      return new Date(b.grade?.gradedAt || b.createdAt).getTime() - new Date(a.grade?.gradedAt || a.createdAt).getTime();
    });
  }, [allCuratedPosts, archiveCategoryFilter, archivePredicateFilter, archiveClassFilter, archiveSearchQuery, archiveSortBy]);

  // --- EKSPOR CSV REKAP EKSPLORASI ---
  const handleExportCSV = () => {
    if (rekapSiswa.length === 0) {
      alert('Tidak ada data siswa untuk diekspor!');
      return;
    }

    const headers = [
      'No', 
      'NIS', 
      'Nama Siswa', 
      'Kelas', 
      'Agenda Literasi', 
      'Judul Tulisan', 
      'Status Kurasi', 
      'Skor Nilai Kurasi (0-100)', 
      'Bonus Poin Bintang (Nilai/2)', 
      'Catatan Apresiasi & Kurasi Guru', 
      'Guru Penilai/Kurator',
      'Total Akumulasi Poin Siswa'
    ];

    const rows = rekapSiswa.map((r, index) => {
      const skor = r.post?.grade ? r.post.grade.skor : '-';
      const bonusBintang = r.post?.grade ? Math.round(r.post.grade.skor / 2) : '-';
      const catatan = r.post?.grade ? `"${r.post.grade.catatan.replace(/"/g, '""')}"` : '"-"';
      const guruNama = r.post?.grade ? `"${r.post.grade.guruNama.replace(/"/g, '""')}"` : '"-"';
      const statusLabel = r.status === 'dinilai' 
        ? 'Terkurasi (Karya Pilihan)' 
        : r.status === 'sudah' 
          ? 'Karya Terbit (Belum Dikurasi)' 
          : 'Belum Ada Karya';

      return [
        index + 1,
        `"${r.nis}"`,
        `"${r.nama}"`,
        `"${r.kelasNama}"`,
        `"${selectedPeriod?.nama || 'Agenda Literasi'}"`,
        r.post ? `"${r.post.judul.replace(/"/g, '""')}"` : '"-"',
        `"${statusLabel}"`,
        skor,
        bonusBintang,
        catatan,
        guruNama,
        r.poin
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const cleanClassName = selectedClassId === 'all' ? 'semua_kelas' : `kelas_${availableClasses.find(c => c.id === selectedClassId)?.nama || selectedClassId}`;
    const cleanPeriodName = (selectedPeriod?.nama || 'agenda').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.setAttribute('download', `rekap_kurasi_literasi_${cleanClassName}_${cleanPeriodName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- EKSPOR CSV ARSIP ANTOLOGI KARYA PILIHAN GURU ---
  const handleExportArchiveCSV = () => {
    if (visibleCuratedPosts.length === 0) {
      alert('Tidak ada karya terkurasi untuk diekspor!');
      return;
    }

    const headers = [
      'No', 
      'Judul Karya', 
      'Kategori', 
      'Penulis (Siswa)', 
      'Kelas', 
      'Jumlah Kata', 
      'Skor Kurasi (0-100)', 
      'Predikat', 
      'Catatan Apresiasi Guru', 
      'Guru Kurator', 
      'Tanggal Kurasi'
    ];

    const rows = visibleCuratedPosts.map((post, index) => {
      const cat = categories.find(c => c.id === post.kategoriId);
      const skor = post.grade?.skor || 0;
      const predikat = skor >= 90 ? 'Istimewa' : skor >= 80 ? 'Baik Sekali' : 'Baik';
      const catatan = post.grade?.catatan ? `"${post.grade.catatan.replace(/"/g, '""')}"` : '"-"';
      const guru = post.grade?.guruNama ? `"${post.grade.guruNama.replace(/"/g, '""')}"` : '"-"';
      const tgl = post.grade?.gradedAt ? new Date(post.grade.gradedAt).toLocaleDateString('id-ID') : '-';

      return [
        index + 1,
        `"${post.judul.replace(/"/g, '""')}"`,
        `"${cat?.nama || 'Umum'}"`,
        `"${post.authorNama.replace(/"/g, '""')}"`,
        `"${post.authorKelas || '-'}"`,
        post.jumlahKata,
        skor,
        `"${predikat}"`,
        catatan,
        guru,
        `"${tgl}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arsip_antologi_karya_pilihan_guru_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Pengampu Guru & Navigasi Dua Sub-Tab */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xl">👨‍🏫</span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Selamat Bekerja, {currentUser.nama}!
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
            <span className="inline-block font-extrabold text-[#132257] bg-blue-50/70 border border-blue-100/60 px-2 py-0.5 rounded-md mr-1.5">
              Guru / Kurator Literasi
            </span>
            Program literasi ini bukan sistem ujian. Guru bertindak sebagai pembina dan kurator untuk 
            <strong className="text-slate-700"> mengapresiasi karya-karya bermutu</strong> dan menyimpannya ke dalam arsip unggulan madrasah.
          </p>
        </div>

        {/* Sub-Tab Navigation Toggle */}
        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-full sm:w-auto shadow-2xs">
          <button
            onClick={() => setActiveSubTab('eksplorasi')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSubTab === 'eksplorasi'
                ? 'bg-white text-[#132257] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Eksplorasi & Kurasi</span>
          </button>

          <button
            onClick={() => setActiveSubTab('arsip')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer relative ${
              activeSubTab === 'arsip'
                ? 'bg-white text-[#132257] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-amber-600" />
            <span>Arsip Karya Pilihan</span>
            <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full">
              {allCuratedPosts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAMPILAN TAB 1: EKSPLORASI & KURASI KARYA SISWA               */}
      {/* ============================================================== */}
      {activeSubTab === 'eksplorasi' && (
        <div className="space-y-6">
          {/* Controls: Filter Kelas & Dropdown Agenda */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="font-extrabold text-slate-800">
                Pilih Kelas & Agenda untuk menelaah karya tulisan siswa:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:w-auto">
              {/* Dropdown Filter Kelas */}
              <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/80 px-3 py-2 rounded-xl text-xs shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-bold text-slate-600 shrink-0 text-xs">Kelas:</span>
                <select 
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-white font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#132257]/20 rounded-lg px-2 py-1 text-slate-800 text-xs flex-1 truncate cursor-pointer"
                >
                  <option value="all">Semua Kelas ({users.filter(u => u.role === 'siswa').length} Siswa)</option>
                  {availableClasses.map(c => {
                    const count = users.filter(u => u.role === 'siswa' && (u.kelasId === c.id || u.kelasNama === c.nama)).length;
                    return (
                      <option key={c.id} value={c.id}>
                        Kelas {c.nama} ({count} Siswa)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dropdown Periode Agenda */}
              <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/80 px-3 py-2 rounded-xl text-xs shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-bold text-slate-600 shrink-0 text-xs">Agenda:</span>
                <select 
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="bg-white font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#132257]/20 rounded-lg px-2 py-1 text-slate-800 text-xs flex-1 truncate cursor-pointer"
                >
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} {p.isActive ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid Kartu Ikhtisar Per-Kelas (Solusi Skalabilitas 1.000 Siswa) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  🏢 Ringkasan Partisipasi Seluruh Rombel / Kelas
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik pada salah satu kelas di bawah untuk memfilter dan memeriksa detail karya siswa per kelas:
                </p>
              </div>

              {selectedClassId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedClassId('all')}
                  className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Tampilkan Semua Kelas ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {classSummaryList.map(item => {
                const isSelected = selectedClassId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedClassId(isSelected ? 'all' : item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#132257] bg-slate-900 text-white shadow-md ring-2 ring-[#132257]/30' 
                        : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          Kelas {item.nama}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : item.percentage >= 75 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.percentage}%
                        </span>
                      </div>
                      <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.totalSiswa} total siswa
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[10px] font-medium">
                      <span className={isSelected ? 'text-emerald-300' : 'text-emerald-700'}>
                        ✓ {item.submitted} Setor
                      </span>
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                        {item.unsubmitted} Belum
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kartu Statistik Utama Kelas / Madrasah */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Siswa ({activeClassLabel})</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudents}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Siswa terdaftar aktif</p>
            </div>
            
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 sm:p-5">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Karya Masuk</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{countSudah}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">{persentaseKepatuhan}% partisipasi literasi</p>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 sm:p-5">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Terkurasi (Karya Pilihan)</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-900">{countDinilai}</p>
              <p className="text-[10px] text-indigo-700 font-semibold mt-1">
                ⭐ Masuk Arsip Unggulan Madrasah
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 sm:p-5">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Rata-rata Skor Pilihan</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-900">
                {avgGradedScore > 0 ? `${avgGradedScore}/100` : '-'}
              </p>
              <p className="text-[10px] text-amber-700 font-semibold mt-1">
                {countPerluNilai > 0 ? `📖 ${countPerluNilai} karya siap diapresiasi` : '✨ Kurasi berjalan optimal'}
              </p>
            </div>
          </div>

          {/* Analitik Grafik Visual (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Distribusi Kurasi Karya ({activeClassLabel})</h3>
                <p className="text-[11px] text-slate-400 font-medium mb-3">Proporsi karya terkurasi, karya masuk, dan siswa belum terbit</p>
              </div>
              <RechartsWrapper 
                type="pie" 
                data={pieData} 
                colors={['#4F46E5', '#F59E0B', '#CBD5E1']}
              />
            </div>
            
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">Ikhtisar Partisipasi & Kurasi</h3>
                <p className="text-[11px] text-slate-400 font-medium mb-3">Gambaran perbandingan total siswa, karya yang terbit, dan yang telah dikurasi guru</p>
              </div>
              <RechartsWrapper 
                type="bar" 
                data={barData} 
                xKey="name" 
                yKeys={[{ key: 'jumlah', color: '#132257', name: 'Jumlah Siswa' }]} 
              />
            </div>
          </div>

          {/* Rekap Mingguan Detail Table & Export */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            {/* Header Tabel & Filter Sub-Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Eksplorasi & Kurasi Karya Siswa</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                    {visibleRekap.length} data
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik &ldquo;Baca & Kurasi&rdquo; pada tulisan yang bagus untuk memberi ulasan resmi dan mengarsipkannya sebagai karya pilihan.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="Cari siswa, NIS, kelas, judul..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#132257]/20 w-48 sm:w-60 font-medium"
                  />
                </div>

                {/* Export CSV Button */}
                <button 
                  onClick={handleExportCSV}
                  className="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download Rekap format Excel/CSV"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Tabs for Status Kurasi */}
            <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 flex flex-wrap gap-2 text-xs">
              <span className="font-bold text-slate-500 self-center mr-1 text-[11px]">Filter Status:</span>
              {[
                { key: 'all', label: `Semua Siswa (${rekapSiswa.length})` },
                { key: 'dinilai', label: `⭐ Terkurasi (${countDinilai})` },
                { key: 'sudah', label: `📝 Siap Diapresiasi (${countPerluNilai})` },
                { key: 'belum', label: `⏳ Belum Ada Karya (${countBelum})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    statusFilter === tab.key 
                      ? 'bg-[#132257] text-white shadow-2xs' 
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table Content for Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[840px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
                    <th className="p-4 w-12 text-center whitespace-nowrap">No</th>
                    <th className="p-4 whitespace-nowrap">Siswa (NIS)</th>
                    <th className="p-4 whitespace-nowrap">Kelas</th>
                    <th className="p-4 whitespace-nowrap">Karya Literasi Siswa</th>
                    <th className="p-4 whitespace-nowrap">Tanggal Terbit</th>
                    <th className="p-4 text-center whitespace-nowrap">Status Kurasi</th>
                    <th className="p-4 whitespace-nowrap">Skor Kurasi</th>
                    <th className="p-4 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-slate-100/70">
                  {visibleRekap.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-3xl">🔍</span>
                          <p className="font-bold text-slate-700">Tidak ada data siswa yang cocok dengan filter saat ini.</p>
                          <p className="text-xs text-slate-400">Coba ubah pilihan kelas atau kata kunci pencarian.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleRekap.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        
                        {/* Siswa & NIS */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{r.nama}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">NIS: {r.nis}</div>
                        </td>

                        {/* Kolom Kelas */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60 inline-block">
                            {r.kelasNama}
                          </span>
                        </td>

                        {/* Judul Karya */}
                        <td className="p-4 max-w-xs">
                          {r.post ? (
                            <div 
                              onClick={() => onOpenDetail(r.post!)}
                              className="cursor-pointer group"
                            >
                              <span className="font-bold text-slate-900 group-hover:text-[#132257] group-hover:underline line-clamp-1">
                                &ldquo;{r.post.judul}&rdquo;
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {r.post.jumlahKata} kata • {Math.max(1, Math.ceil(r.post.jumlahKata / 150))} mnt baca
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic font-medium">Belum ada karya terbit</span>
                          )}
                        </td>

                        {/* Tanggal Setor */}
                        <td className="p-4 font-medium text-slate-500 whitespace-nowrap">
                          {r.post ? new Date(r.post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>

                        {/* Status Kurasi */}
                        <td className="p-4 text-center whitespace-nowrap">
                          {r.status === 'dinilai' ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Terkurasi
                            </span>
                          ) : r.status === 'sudah' ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                              <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Siap Diapresiasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-500 bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> Belum Terbit
                            </span>
                          )}
                        </td>

                        {/* Skor Nilai Kurasi */}
                        <td className="p-4 whitespace-nowrap">
                          {r.post?.grade ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                                ⭐ {r.post.grade.skor}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded" title="Bonus Poin Bintang (+Nilai / 2)">
                                +{Math.round(r.post.grade.skor / 2)} Poin
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Tombol Aksi */}
                        <td className="p-4 text-right whitespace-nowrap">
                          {r.post ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => onOpenDetail(r.post!)}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                                  r.status === 'dinilai' 
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100' 
                                    : 'bg-[#132257] hover:bg-[#1e3380] text-white shadow-xs'
                                }`}
                                title="Buka tulisan siswa dan beri ulasan kurasi"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-300" />
                                <span>{r.status === 'dinilai' ? 'Lihat / Ubah Kurasi' : 'Baca & Kurasi'}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-medium">Belum ada karya</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {visibleRekap.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">
                  <span className="text-3xl block mb-2">🔍</span>
                  <p className="font-bold text-slate-700 text-xs">Tidak ada data siswa yang cocok.</p>
                </div>
              ) : (
                visibleRekap.map((r, idx) => (
                  <div key={r.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-xs truncate leading-tight">{r.nama}</h4>
                          <p className="text-[10px] text-slate-400 font-medium">NIS: {r.nis}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-[10px] px-2.5 py-0.5 bg-blue-50 text-[#132257] border border-blue-100 rounded-md shrink-0">
                        {r.kelasNama}
                      </span>
                    </div>

                    {/* Status & Skor */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div>
                        {r.status === 'dinilai' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-indigo-600" /> Terkurasi
                          </span>
                        ) : r.status === 'sudah' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <BookOpen className="w-3 h-3 text-amber-600" /> Siap Diapresiasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            Belum Ada Karya
                          </span>
                        )}
                      </div>

                      {r.post?.grade && (
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-xs text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            ⭐ {r.post.grade.skor}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info Karya Tulisan */}
                    {r.post ? (
                      <div 
                        onClick={() => onOpenDetail(r.post!)}
                        className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 cursor-pointer hover:border-slate-300 transition-colors"
                      >
                        <p className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                          &ldquo;{r.post.judul}&rdquo;
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5 font-medium">
                          <span>📝 {r.post.jumlahKata} kata</span>
                          <span>📅 {new Date(r.post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-xl p-2.5 text-center">
                        <p className="text-[11px] text-slate-400 italic">Siswa belum mempublikasikan karya pada agenda ini</p>
                      </div>
                    )}

                    {/* Tombol Aksi Mobile */}
                    {r.post && (
                      <button 
                        onClick={() => onOpenDetail(r.post!)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          r.status === 'dinilai' 
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                            : 'bg-[#132257] text-white shadow-xs'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>{r.status === 'dinilai' ? 'Lihat / Ubah Kurasi' : 'Baca & Kurasi Karya'}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAMPILAN TAB 2: ARSIP KARYA PILIHAN GURU (ANTOLOGI MADRASAH)   */}
      {/* ============================================================== */}
      {activeSubTab === 'arsip' && (
        <div className="space-y-6">
          {/* Header Banner Arsip Antologi */}
          <div className="bg-gradient-to-r from-[#132257] via-[#1c3580] to-[#132257] text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-300/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2.5">
                  <Library className="w-3.5 h-3.5" /> Antologi Terkurasi MA NU 01 Banyuputih
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Arsip Karya Literasi Pilihan Guru
                </h3>
                <p className="text-xs text-blue-100 max-w-2xl mt-1 leading-relaxed">
                  Menyimpan <strong className="text-amber-300 font-extrabold">{allCuratedPosts.length} naskah bermutu</strong> yang telah lolos apresiasi resmi dewan guru. 
                  Siap diunduh sebagai arsip digital madrasah, bahan antologi cetak, atau laporan rekapitulasi literasi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setShowPrintAntologiModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Format Cetak</span>
                </button>

                <button
                  onClick={handleExportArchiveCSV}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Arsip CSV</span>
                </button>
              </div>
            </div>

            {/* Background Decorative Rings */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Filter & Kontrol Pencarian Arsip */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Cari judul tulisan, penulis, catatan ulasan, atau nama guru kurator..."
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#132257]/20 font-medium text-slate-800"
                />
              </div>

              {/* Quick Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter Kategori */}
                <select
                  value={archiveCategoryFilter}
                  onChange={(e) => setArchiveCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.ikon} {c.nama}
                    </option>
                  ))}
                </select>

                {/* Filter Predikat */}
                <select
                  value={archivePredicateFilter}
                  onChange={(e) => setArchivePredicateFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Semua Skor Predikat</option>
                  <option value="istimewa">⭐ Istimewa (Skor 90–100)</option>
                  <option value="baik_sekali">🌟 Baik Sekali (Skor 80–89)</option>
                  <option value="baik">✨ Baik (Skor &lt; 80)</option>
                </select>

                {/* Filter Kelas */}
                <select
                  value={archiveClassFilter}
                  onChange={(e) => setArchiveClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Semua Kelas</option>
                  {availableClasses.map(c => (
                    <option key={c.id} value={c.nama}>Kelas {c.nama}</option>
                  ))}
                </select>

                {/* Urutkan */}
                <select
                  value={archiveSortBy}
                  onChange={(e) => setArchiveSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="skor">Urutkan: Skor Tertinggi</option>
                  <option value="terbaru">Urutkan: Tanggal Kurasi Terbaru</option>
                </select>
              </div>
            </div>

            {/* Info Hasil Filter */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <p>
                Menampilkan <strong className="text-slate-900 font-extrabold">{visibleCuratedPosts.length}</strong> karya dari total {allCuratedPosts.length} karya terkurasi
              </p>
              {(archiveCategoryFilter !== 'all' || archivePredicateFilter !== 'all' || archiveClassFilter !== 'all' || archiveSearchQuery.trim()) && (
                <button
                  onClick={() => {
                    setArchiveCategoryFilter('all');
                    setArchivePredicateFilter('all');
                    setArchiveClassFilter('all');
                    setArchiveSearchQuery('');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          </div>

          {/* Grid Kartu Karya Terkurasi */}
          {visibleCuratedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
              <Library className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-1" />
              <h4 className="text-sm font-extrabold text-slate-800 mb-1">Belum Ada Karya dalam Arsip Terkurasi</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Buka tab &ldquo;Eksplorasi & Kurasi&rdquo;, baca tulisan siswa yang berbobot, dan simpan penilaian ulasan untuk memasukkannya ke dalam arsip ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleCuratedPosts.map((post) => {
                const cat = categories.find(c => c.id === post.kategoriId);
                const skor = post.grade?.skor || 0;
                const predikatLabel = skor >= 90 ? 'Karya Istimewa' : skor >= 80 ? 'Karya Baik Sekali' : 'Karya Pilihan';
                const badgeColor = skor >= 90 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : skor >= 80 
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300' 
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300';

                return (
                  <div 
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#132257]/30 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Kategori & Skor Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                          <span>{cat?.ikon || '📝'}</span>
                          <span>{cat?.nama || 'Umum'}</span>
                        </span>

                        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-black ${badgeColor}`}>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{skor}</span>
                          <span className="text-[9px] font-bold opacity-75">/100</span>
                        </div>
                      </div>

                      {/* Judul & Penulis */}
                      <h4 
                        onClick={() => onOpenDetail(post)}
                        className="text-sm font-extrabold text-slate-900 group-hover:text-[#132257] group-hover:underline line-clamp-2 cursor-pointer leading-snug mb-1"
                      >
                        &ldquo;{post.judul}&rdquo;
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3">
                        <span className="font-bold text-slate-800">{post.authorNama}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 bg-blue-50 text-[#132257] font-extrabold rounded">Kelas {post.authorKelas || 'Umum'}</span>
                        <span>•</span>
                        <span>{post.jumlahKata} kata</span>
                      </div>

                      {/* Cuplikan Isi Karya */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-serif italic mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {post.isi}
                      </p>

                      {/* Kotak Catatan Apresiasi Guru Kurator */}
                      {post.grade && (
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 mb-4 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-extrabold text-indigo-950 flex items-center gap-1">
                              <Award className="w-3 h-3 text-indigo-700" /> Catatan Apresiasi Guru
                            </span>
                            <span className="font-bold text-indigo-800 bg-white/80 px-1.5 py-0.2 rounded border border-indigo-100">
                              {predikatLabel}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-900 leading-snug italic font-medium">
                            &ldquo;{post.grade.catatan}&rdquo;
                          </p>
                          <p className="text-[9.5px] text-indigo-600 font-semibold pt-1">
                            Kurator: <strong className="text-indigo-950">{post.grade.guruNama}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Tombol Baca Penuh */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>

                      <button
                        onClick={() => onOpenDetail(post)}
                        className="px-3 py-1.5 bg-[#132257] hover:bg-[#1f378a] text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Baca Naskah Lengkap</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Cetak Format Antologi Madrasah */}
          {showPrintAntologiModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-indigo-700" />
                    <h3 className="font-extrabold text-slate-900 text-base">Cetak Berita Acara & Rekap Antologi</h3>
                  </div>
                  <button 
                    onClick={() => setShowPrintAntologiModal(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
                  <p className="font-bold text-slate-900">Petunjuk Cetak Dokumen:</p>
                  <p>
                    Halaman cetak ini merangkum seluruh naskah siswa yang lolos kurasi resmi guru sebagai bukti pelaksanaan Program Literasi MA NU 01 Banyuputih untuk dilaporkan ke Kepala Madrasah atau instansi terkait.
                  </p>
                  <div className="flex items-center gap-4 pt-2 font-bold text-slate-900">
                    <span>Total Karya Terpilih: {visibleCuratedPosts.length} naskah</span>
                    <span>Tahun Ajaran: 2026/2027</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowPrintAntologiModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-5 py-2 bg-[#132257] hover:bg-[#1c3580] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Buka Dialog Cetak Browser</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
