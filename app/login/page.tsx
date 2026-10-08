'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import Logo from '@/components/Logo';
import { BookOpen, User as UserIcon, Calendar, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginSiswa, loginStaff, activePeriod } = useApp();

  const [loginRole, setLoginRole] = useState<'siswa' | 'staff'>('siswa');
  const [studentNis, setStudentNis] = useState('');
  const [studentBirthDate, setStudentBirthDate] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'guru') {
        router.push('/guru');
      } else if (currentUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [currentUser, router]);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginSiswa(studentNis.trim(), studentBirthDate.trim());
    if (success) {
      router.push('/');
    } else {
      setLoginError('NIS atau Tanggal Lahir tidak terdaftar/salah.');
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginStaff(staffUsername.trim(), staffPassword.trim());
    if (success) {
      router.push('/');
    } else {
      setLoginError('Username atau kata sandi staff salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-950">
      {/* Sisi Kiri: Banner Biru Elegan */}
      <div className="hidden md:flex md:w-1/2 bg-[#1e3bb3] text-white p-8 md:p-16 flex-col justify-between relative overflow-hidden">
        {/* Dekorasi lingkaran halus */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>

        {/* Top Logo branding */}
        <Link href="/" className="inline-block relative z-10 hover:opacity-95 transition-opacity">
          <Logo size="lg" light={true} />
        </Link>

        {/* Slogan & Platform details */}
        <div className="my-12 md:my-0 relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
            Tulis. Baca.<br />
            <span className="text-blue-300">Berkembang.</span>
          </h2>
          <p className="text-xs md:text-sm text-blue-100 leading-relaxed max-w-md font-medium">
            Platform literasi digital terpadu MA NU 01 Banyuputih. Bagikan tulisanmu, kumpulkan lencana prestasi, dan inspirasi sahabat madrasah.
          </p>

          {/* Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-left shadow-xs backdrop-blur-xs flex flex-col justify-center">
              <p className="text-lg md:text-xl font-extrabold text-white">1.2K+</p>
              <p className="text-[9px] text-blue-200 font-bold mt-0.5 leading-none">Tulisan</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-left shadow-xs backdrop-blur-xs flex flex-col justify-center">
              <p className="text-lg md:text-xl font-extrabold text-white">380+</p>
              <p className="text-[9px] text-blue-200 font-bold mt-0.5 leading-none">Siswa Aktif</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-left shadow-xs backdrop-blur-xs flex flex-col justify-center">
              <p className="text-lg md:text-xl font-extrabold text-white">10</p>
              <p className="text-[9px] text-blue-200 font-bold mt-0.5 leading-none">Agenda Selesai</p>
            </div>
          </div>
        </div>

        {/* Bottom Slogan Quote */}
        <div className="relative z-10 bg-white/5 border border-white/10 p-5 rounded-2xl text-xs leading-relaxed max-w-md">
          <p className="italic text-blue-100 font-medium">
            &ldquo;Menulis bukan sekadar tugas — ini adalah cara kita merekam pemikiran kita untuk masa depan.&rdquo;
          </p>
          <p className="mt-2 font-bold text-white text-[10px]">
            — Pembina Literasi MA NU 01 Banyuputih
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="w-full md:w-1/2 min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 md:p-16 relative">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Mobile Header Branding */}
          <div className="md:hidden flex items-center justify-center py-2">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 relative z-10 space-y-5 sm:space-y-6">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">Selamat Datang! 👋</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-normal">
                Masuk untuk mengakses portal karya literasi madrasah.
              </p>
            </div>

            {/* Toggle Tab Login */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button 
                type="button"
                onClick={() => { setLoginRole('siswa'); setLoginError(''); }}
                className={`flex-1 py-2.5 text-center rounded-xl transition-all cursor-pointer ${
                  loginRole === 'siswa' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Siswa
              </button>
              <button 
                type="button"
                onClick={() => { setLoginRole('staff'); setLoginError(''); }}
                className={`flex-1 py-2.5 text-center rounded-xl transition-all cursor-pointer ${
                  loginRole === 'staff' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Guru & Staff
              </button>
            </div>

            {/* Form Login Siswa */}
            {loginRole === 'siswa' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Nomor Induk Siswa (NIS)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Contoh: 2024001" 
                      value={studentNis} 
                      onChange={(e) => setStudentNis(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-[#1e3bb3] focus:ring-1 focus:ring-[#1e3bb3] rounded-xl text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Tanggal Lahir (DD/MM/YYYY)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="DD/MM/YYYY (contoh: 14/09/2008)" 
                      value={studentBirthDate} 
                      onChange={(e) => setStudentBirthDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-[#1e3bb3] focus:ring-1 focus:ring-[#1e3bb3] rounded-xl text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Gunakan format tanggal: Hari/Bulan/Tahun lahir Anda.</p>
                </div>

                {loginError && <p className="text-xs font-bold text-rose-600 leading-none">{loginError}</p>}

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-[#1e3bb3] hover:bg-[#152e96] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk Sebagai Siswa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Form Login Guru / Staff */}
            {loginRole === 'staff' && (
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Username Guru / Admin</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Username (contoh: guru1 / admin)" 
                      value={staffUsername} 
                      onChange={(e) => setStaffUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-[#1e3bb3] focus:ring-1 focus:ring-[#1e3bb3] rounded-xl text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Kata Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={staffPassword} 
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-[#1e3bb3] focus:ring-1 focus:ring-[#1e3bb3] rounded-xl text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                {loginError && <p className="text-xs font-bold text-rose-600 leading-none">{loginError}</p>}

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk Portal Staff</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Quick Demo Autofill */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-center text-[10px] font-semibold">
              <p className="text-slate-400">
                Pilih akun demo untuk uji coba instan:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('siswa');
                    setStudentNis('2024001');
                    setStudentBirthDate('14/09/2008');
                    const success = loginSiswa('2024001', '14/09/2008');
                    if (success) router.push('/');
                  }}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Siswa (Naila)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('staff');
                    setStaffUsername('guru1');
                    setStaffPassword('password123');
                    const success = loginStaff('guru1', 'password123');
                    if (success) router.push('/guru');
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Guru (Pak Slamet)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('staff');
                    setStaffUsername('admin');
                    setStaffPassword('admin123');
                    const success = loginStaff('admin', 'admin123');
                    if (success) router.push('/admin');
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Admin Koordinator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('staff');
                    setStaffUsername('kepala');
                    setStaffPassword('kepala123');
                    const success = loginStaff('kepala', 'kepala123');
                    if (success) router.push('/guru');
                  }}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Kepala Madrasah
                </button>
              </div>
            </div>
          </div>

          {/* Bottom active period banner */}
          {activePeriod && (
            <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <span className="text-xl select-none">🔥</span>
              <div className="leading-tight">
                <p className="text-[10px] font-extrabold text-amber-900">{activePeriod.nama}</p>
                <p className="text-[8px] text-amber-700/85 font-bold mt-0.5">
                  Berakhir {activePeriod.tanggalSelesai}. Segera tulis literasimu!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
