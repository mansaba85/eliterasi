'use client';

import React from 'react';
import { User, Post, Class, Category } from '../lib/types';
import { Award, BookOpen, Users, TrendingUp, CheckCircle, Percent } from 'lucide-react';
import RechartsWrapper from './RechartsWrapper';

interface DashboardKepalaProps {
  currentUser: User;
  posts: Post[];
  users: User[];
  classes: Class[];
  categories: Category[];
}

export default function DashboardKepala({
  currentUser,
  posts,
  users,
  classes,
  categories,
}: DashboardKepalaProps) {
  const publishedPosts = posts.filter(p => p.status === 'published');
  const allStudents = users.filter(u => u.role === 'siswa');
  const totalComments = posts.reduce((acc, p) => acc + p.comments.length, 0);
  const totalLikes = posts.reduce((acc, p) => acc + p.likes.length, 0);

  // Hitung jumlah karya per kategori untuk chart
  const categoryStats = categories.map(cat => {
    const count = publishedPosts.filter(p => p.kategoriId === cat.id).length;
    return {
      name: cat.nama,
      value: count
    };
  }).filter(c => c.value > 0);

  // Urutkan siswa dengan poin tertinggi (Siswa Paling Aktif)
  const topActiveStudents = [...allStudents]
    .sort((a, b) => b.poin - a.poin)
    .slice(0, 5);

  // Kepatuhan per kelas: persentase siswa kelas tersebut yang memiliki minimal 1 tulisan bertag Minggu Literasi
  const classStats = classes.map(cls => {
    const studentsInClass = allStudents.filter(s => s.kelasId === cls.id);
    const countStudents = studentsInClass.length || 1;
    
    // Jumlah siswa kelas tersebut yang punya tulisan Minggu Literasi
    const studentsWhoWrote = studentsInClass.filter(student => 
      publishedPosts.some(p => p.authorId === student.id && p.isMingguLiterasi)
    ).length;

    const percent = Math.round((studentsWhoWrote / countStudents) * 100);

    return {
      name: cls.namaKelas,
      'Partisipasi (%)': percent
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Sambutan & Peran Kepala */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-2xl">👑</span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Laporan Eksekutif Kepala Madrasah</h2>
          <p className="text-xs text-slate-400">
            Selamat datang, <span className="font-bold text-slate-800">{currentUser.nama}</span> • Memantau rekap analitik kemajuan program E-Literasi MA NU 01 Banyuputih.
          </p>
        </div>
      </div>

      {/* 2. Ringkasan Sekolah */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Karya Publik</p>
          <p className="text-3xl font-bold text-slate-900">{publishedPosts.length}</p>
          <p className="text-[10px] text-emerald-600 mt-1">📚 Karya terarsip digital</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interaksi Pembaca</p>
          <p className="text-3xl font-bold text-slate-900">{totalLikes + totalComments}</p>
          <p className="text-[10px] text-indigo-600 mt-1">❤️ {totalLikes} Likes • 💬 {totalComments} Komen</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Partisipasi Siswa</p>
          <p className="text-3xl font-bold text-slate-900">{allStudents.length} siswa</p>
          <p className="text-[10px] text-slate-400 mt-1">Terdaftar aktif berliterasi</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-xs">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Rata-rata Partisipasi Wajib</p>
          <p className="text-3xl font-bold text-emerald-950">84%</p>
          <p className="text-[10px] text-emerald-600 mt-1">Sangat dekat dengan target (85%)</p>
        </div>
      </div>

      {/* 3. Visualisasi Analitik (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Peringkat Keikutsertaan Minggu Literasi per Kelas (%)</h3>
          <RechartsWrapper 
            type="bar" 
            data={classStats} 
            xKey="name" 
            yKeys={[{ key: 'Partisipasi (%)', color: '#10B981', name: 'Partisipasi Kelas (%)' }]} 
          />
        </div>
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Minat Kategori Tulisan</h3>
          {categoryStats.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic">Belum ada minat kategori tercatat.</div>
          ) : (
            <RechartsWrapper 
              type="pie" 
              data={categoryStats} 
              colors={['#1E40AF', '#059669', '#D97706', '#7C3AED', '#EC4899', '#3B82F6', '#14B8A6']}
            />
          )}
        </div>
      </div>

      {/* 4. Tabel Siswa Berprestasi (Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">🏆 5 Siswa Teraktif (Leaderboard)</h3>
            <p className="text-[11px] text-slate-400 mb-4">Siswa-siswa dengan perolehan poin literasi tertinggi dari penulisan karya, aktivitas komentar, dan apresiasi positif.</p>
            
            <div className="space-y-3">
              {topActiveStudents.map((std, idx) => (
                <div key={std.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6.5 h-6.5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs font-bold text-amber-800">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{std.nama}</p>
                      <p className="text-[10px] text-slate-400">Kelas: {std.kelasNama || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">{std.poin} Poin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kebijakan Madrasah ringkasan */}
        <div className="lg:col-span-6 bg-gradient-to-tr from-indigo-900 to-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <h3 className="font-bold text-lg font-serif">Catatan Evaluasi Program</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Sebagai pimpinan MA NU 01 Banyuputih, platform ini memberikan transparansi instan terhadap kebiasaan membaca dan menulis siswa. 
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Rekomendasi: Lakukan apresiasi Mading Digital secara berkala.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Rekomendasi: Wali kelas terus mengingatkan siswa yang alpa di periode aktif.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Target Bulanan: Mencapai 90% kepatuhan di semua tingkatan kelas.</span>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">{currentUser.nama}</p>
              <p className="text-[10px] text-indigo-300">Kepala Madrasah MA NU 01 Banyuputih</p>
            </div>
            <span className="text-2xl">🇮🇩</span>
          </div>
        </div>
      </div>
    </div>
  );
}
