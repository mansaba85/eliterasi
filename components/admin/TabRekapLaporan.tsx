'use client';

import React, { useState } from 'react';
import { User, Class, Post, Category, ReadingBook } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  FileText, Download, Printer, BarChart3, TrendingUp, CheckCircle, 
  Award, BookOpen, Users, Calendar, Filter, X
} from 'lucide-react';

interface TabRekapLaporanProps {
  users: User[];
  classes: Class[];
  posts: Post[];
  categories: Category[];
}

export default function TabRekapLaporan({
  users,
  classes,
  posts,
  categories
}: TabRekapLaporanProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [selectedTahun, setSelectedTahun] = useState('2026/2027');

  const schoolSettings = LiteStore.getSchoolSettings();
  const readingBooks = LiteStore.getReadingBooks();

  const students = users.filter(u => u.role === 'siswa');
  const publishedPosts = posts.filter(p => p.status === 'published');

  // Stats calculation
  const totalPoints = students.reduce((sum, s) => sum + (s.poin || 0), 0);
  const avgPoints = students.length > 0 ? Math.round(totalPoints / students.length) : 0;
  const activeStudents = students.filter(s => posts.some(p => p.authorId === s.id && p.status === 'published'));
  const complianceRate = students.length > 0 ? Math.round((activeStudents.length / students.length) * 100) : 0;

  // Top 10 Writers
  const topStudents = [...students].sort((a, b) => (b.poin || 0) - (a.poin || 0)).slice(0, 10);

  // Class Summary
  const classSummaries = classes.map(c => {
    const classStudents = students.filter(s => s.kelasId === c.id);
    const classPosts = posts.filter(p => p.authorKelas === c.namaKelas && p.status === 'published');
    const classPoints = classStudents.reduce((sum, s) => sum + (s.poin || 0), 0);
    const classActive = classStudents.filter(s => posts.some(p => p.authorId === s.id && p.status === 'published'));
    const classRate = classStudents.length > 0 ? Math.round((classActive.length / classStudents.length) * 100) : 0;

    return {
      classId: c.id,
      className: c.namaKelas,
      waliKelas: c.waliKelasNama,
      studentCount: classStudents.length,
      postCount: classPosts.length,
      totalPoints: classPoints,
      activeCount: classActive.length,
      complianceRate: classRate
    };
  });

  // 1. Ekspor CSV Database Siswa Lengkap
  const handleExportStudentsCSV = () => {
    const headers = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Total Poin', 'Jumlah Karya Terbit', 'Jumlah Suka Diterima', 'Jumlah Buku Dibaca', 'Status Keaktifan'];
    
    const rows = students.map((std, idx) => {
      const studentPosts = posts.filter(p => p.authorId === std.id && p.status === 'published');
      const studentLikes = posts.filter(p => p.authorId === std.id).reduce((sum, p) => sum + p.likes.length, 0);
      const studentBooks = readingBooks.filter(b => b.userId === std.id && b.statusBaca === 'sudah').length;
      const status = studentPosts.length > 0 ? 'Aktif' : 'Belum Ada Karya';

      return [
        idx + 1,
        `"${std.nis || '-'}"`,
        `"${std.nama.replace(/"/g, '""')}"`,
        `"${std.kelasNama || '-'}"`,
        std.poin || 0,
        studentPosts.length,
        studentLikes,
        studentBooks,
        `"${status}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Database_Literasi_Siswa_${schoolSettings.namaMadrasah.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Ekspor CSV Rekapitulasi Keaktifan Per Kelas
  const handleExportClassRecapCSV = () => {
    const headers = ['No', 'Nama Kelas', 'Wali Kelas / Pembimbing', 'Jumlah Siswa', 'Karya Terkumpul', 'Total Poin Kelas', 'Siswa Aktif', 'Tingkat Kepatuhan (%)'];
    
    const rows = classSummaries.map((cs, idx) => [
      idx + 1,
      `"${cs.className}"`,
      `"${cs.waliKelas}"`,
      cs.studentCount,
      cs.postCount,
      cs.totalPoints,
      cs.activeCount,
      `${cs.complianceRate}%`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Keaktifan_Kelas_${selectedTahun.replace('/', '_')}_Semester_${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#132257]" />
            Rekap Laporan & Ekspor Data Terpadu
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor rekapitulasi data literasi siswa, statistik per kelas, dan cetak lembar laporan resmi madrasah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleExportStudentsCSV}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Unduh Database Siswa (.CSV)
          </button>
          
          <button 
            onClick={handleExportClassRecapCSV}
            className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Rekap Kelas (.CSV)
          </button>

          <button 
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 bg-[#132257] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Dokumen Laporan Resmi
          </button>
        </div>
      </div>

      {/* 4 Primary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{students.length} Siswa</div>
          <p className="text-[11px] text-emerald-600 font-bold">{activeStudents.length} siswa aktif menulis</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Tulisan & Resensi</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{publishedPosts.length} Karya</div>
          <p className="text-[11px] text-slate-500 font-medium">Dari {categories.length} kategori literasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Rata-Rata Poin Literasi</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{avgPoints} Poin</div>
          <p className="text-[11px] text-amber-700 font-bold">Total akumulasi: {totalPoints.toLocaleString()} poin</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Kepatuhan Literasi</span>
            <CheckCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{complianceRate}%</div>
          <p className="text-[11px] text-purple-700 font-bold">{classSummaries.length} Rombel Terpantau</p>
        </div>
      </div>

      {/* Grid: 2 Tables (Rekap Kelas & Top 10 Siswa Teraktif) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sisi Kiri: Rekapitulasi Per Kelas */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-700" /> Rekapitulasi Keaktifan Rombongan Belajar
            </h4>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              TA {schoolSettings.tahunAjaran} ({schoolSettings.semester})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500">
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Wali Kelas</th>
                  <th className="p-3 text-center">Siswa</th>
                  <th className="p-3 text-center">Karya</th>
                  <th className="p-3 text-center">Total Poin</th>
                  <th className="p-3 text-right">Kepatuhan</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-50">
                {classSummaries.map(cs => (
                  <tr key={cs.classId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">{cs.className}</td>
                    <td className="p-3 text-slate-600">{cs.waliKelas}</td>
                    <td className="p-3 text-center">{cs.studentCount}</td>
                    <td className="p-3 text-center font-bold text-indigo-900">{cs.postCount}</td>
                    <td className="p-3 text-center font-bold text-amber-700">{cs.totalPoints}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        cs.complianceRate >= 75 ? 'bg-emerald-50 text-emerald-800' :
                        cs.complianceRate >= 50 ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {cs.complianceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sisi Kanan: Top 10 Siswa Terbaik */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" /> 10 Siswa Berprestasi Literasi
            </h4>
          </div>

          <div className="p-4 divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
            {topStudents.map((std, idx) => (
              <div key={std.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-900' :
                    idx === 1 ? 'bg-slate-200 text-slate-800' :
                    idx === 2 ? 'bg-orange-100 text-orange-900' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{std.nama}</h5>
                    <p className="text-[10px] text-slate-400">Kelas {std.kelasNama || '-'} • NIS {std.nis || '-'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-amber-700 text-xs flex items-center gap-1 justify-end">
                    <span>⭐</span> {std.poin || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {posts.filter(p => p.authorId === std.id && p.status === 'published').length} Karya
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL PRINTABLE OFFICIAL REPORT --- */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Action Bar (Top) */}
            <div className="bg-[#132257] text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-300" />
                <h4 className="font-extrabold text-sm">Pratinjau Dokumen Laporan Resmi Madrasah</h4>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Cetak / Unduh PDF
                </button>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Sheet Container */}
            <div className="p-8 sm:p-12 text-slate-900 bg-white font-serif text-left space-y-6">
              {/* Kop Surat Madrasah */}
              <div className="text-center border-b-4 border-double border-slate-900 pb-4 space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-600">LEMBAGA PENDIDIKAN MA&apos;ARIF NU KABUPATEN BATANG</h4>
                <h2 className="font-extrabold text-xl sm:text-2xl text-slate-950 uppercase tracking-wide">
                  {schoolSettings.namaMadrasah}
                </h2>
                <p className="text-[11px] text-slate-600 italic">
                  {schoolSettings.alamat} • Telp: {schoolSettings.telepon || '(0285) 666123'} • Email: {schoolSettings.email || 'manubanyuputih@gmail.com'}
                </p>
              </div>

              {/* Title & Periode */}
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base uppercase underline">
                  LAPORAN REKAPITULASI PELAKSANAAN GERAKAN LITERASI MADRASAH
                </h3>
                <p className="text-xs font-sans text-slate-600">
                  Tahun Ajaran {schoolSettings.tahunAjaran} — Semester {schoolSettings.semester}
                </p>
              </div>

              {/* Ringkasan Eksekutif */}
              <div className="font-sans text-xs leading-relaxed space-y-2 text-slate-800">
                <p>
                  Berdasarkan pemantauan aktivitas pada platform digital E-Literasi {schoolSettings.namaMadrasah}, berikut kami sampaikan rekapitulasi data capaian literasi peserta didik:
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Total Siswa</p>
                    <p className="text-base font-extrabold text-slate-900">{students.length}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Total Karya</p>
                    <p className="text-base font-extrabold text-slate-900">{publishedPosts.length}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Kepatuhan Rata-Rata</p>
                    <p className="text-base font-extrabold text-slate-900">{complianceRate}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Rata-Rata Poin</p>
                    <p className="text-base font-extrabold text-slate-900">{avgPoints}</p>
                  </div>
                </div>
              </div>

              {/* Tabel Rombongan Belajar */}
              <div className="space-y-2">
                <h5 className="font-sans font-bold text-xs text-slate-900 uppercase">A. Capaian Per Rombongan Belajar</h5>
                <table className="w-full text-left border-collapse border border-slate-300 font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                      <th className="p-2 border-r border-slate-300">Kelas</th>
                      <th className="p-2 border-r border-slate-300">Wali Kelas</th>
                      <th className="p-2 border-r border-slate-300 text-center">Jumlah Siswa</th>
                      <th className="p-2 border-r border-slate-300 text-center">Karya</th>
                      <th className="p-2 text-right">Kepatuhan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSummaries.map((cs, idx) => (
                      <tr key={cs.classId} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-bold">{cs.className}</td>
                        <td className="p-2 border-r border-slate-300">{cs.waliKelas}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{cs.studentCount}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-semibold">{cs.postCount}</td>
                        <td className="p-2 text-right font-bold">{cs.complianceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Resmi */}
              <div className="grid grid-cols-2 pt-8 font-sans text-xs text-center">
                <div className="space-y-16">
                  <p>Mengetahui,<br /><strong>Koordinator Literasi</strong></p>
                  <div>
                    <p className="font-extrabold underline">{schoolSettings.koordinatorLiterasiNama}</p>
                    <p className="text-[11px] text-slate-500">NIP. {schoolSettings.koordinatorLiterasiNip || '198203152009021004'}</p>
                  </div>
                </div>

                <div className="space-y-16">
                  <p>Banyuputih, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br /><strong>Kepala Madrasah</strong></p>
                  <div>
                    <p className="font-extrabold underline">{schoolSettings.kepalaMadrasahNama}</p>
                    <p className="text-[11px] text-slate-500">NIP. {schoolSettings.kepalaMadrasahNip || '197508122005011003'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
