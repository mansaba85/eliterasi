'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { User, Class, UserRole } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  BookOpen, Plus, Upload, Trash2, Edit3, Key, Search, 
  X, Download, FileSpreadsheet, CheckCircle2, AlertCircle,
  GraduationCap, ShieldCheck, UserCheck, CheckCircle
} from 'lucide-react';

interface TabDataGuruProps {
  users: User[];
  classes: Class[];
  onUserUpdated?: () => void;
}

export default function TabDataGuru({
  users,
  classes,
  onUserUpdated
}: TabDataGuruProps) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form Tambah Guru
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [initialPassword, setInitialPassword] = useState('password123');
  const [role, setRole] = useState<'guru' | 'kepala_madrasah' | 'admin'>('guru');
  const [bio, setBio] = useState('');

  // Form Edit Guru
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('guru');

  // Form Reset Password Modal
  const [resetModalTeacher, setResetModalTeacher] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Excel Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedExcelData, setParsedExcelData] = useState<Array<{
    username: string;
    nama: string;
    role: 'guru' | 'kepala_madrasah';
    bio: string;
  }>>([]);
  const [excelError, setExcelError] = useState('');

  // Guru & Staff list (Bukan siswa)
  const teacherList = users.filter(u => u.role === 'guru' || u.role === 'kepala_madrasah');

  // Filtered teachers
  const filteredTeachers = teacherList.filter(t => {
    const matchSearch = 
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.username && t.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.bio && t.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  // Cari kelas yang dibimbing oleh guru ini
  const getSupervisedClasses = (teacherId: string) => {
    return classes.filter(c => c.waliKelasId === teacherId);
  };

  // Submit Tambah Guru
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !nama.trim()) return;

    const existingUser = users.find(u => u.username?.toLowerCase() === username.trim().toLowerCase());
    if (existingUser) {
      alert(`Username "${username}" sudah digunakan oleh ${existingUser.nama}! Silakan gunakan username lain.`);
      return;
    }

    LiteStore.addTeacher({
      username: username.trim().toLowerCase(),
      nama: nama.trim(),
      role,
      bio: bio.trim() || `Guru Pembimbing Literasi MA NU 01 Banyuputih.`
    });

    setUsername('');
    setNama('');
    setBio('');
    setShowAddModal(false);
    alert(`Guru / Pembimbing ${nama} berhasil didaftarkan ke sistem!`);
    if (onUserUpdated) onUserUpdated();
  };

  // Open Edit Modal
  const handleOpenEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setEditNama(teacher.nama);
    setEditUsername(teacher.username || '');
    setEditBio(teacher.bio || '');
    setEditRole(teacher.role);
  };

  // Submit Edit Guru
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editNama.trim()) return;

    LiteStore.updateUserAccount(editingTeacher.id, {
      nama: editNama.trim(),
      username: editUsername.trim().toLowerCase(),
      bio: editBio.trim(),
      role: editRole
    });

    setEditingTeacher(null);
    alert(`Data guru ${editNama} berhasil diperbarui!`);
    if (onUserUpdated) onUserUpdated();
  };

  // Open Reset Password
  const handleOpenResetPassword = (teacher: User) => {
    setResetModalTeacher(teacher);
    setNewPassword('password123');
    setResetFeedback('');
  };

  // Submit Reset Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalTeacher || !newPassword.trim()) return;

    const res = LiteStore.resetUserPassword(resetModalTeacher.id, newPassword.trim());
    if (res.success) {
      setResetFeedback(`Password login untuk ${resetModalTeacher.nama} berhasil direset menjadi: ${newPassword.trim()}`);
      if (onUserUpdated) onUserUpdated();
      setTimeout(() => {
        setResetModalTeacher(null);
        setResetFeedback('');
      }, 1500);
    }
  };

  // Hapus Guru
  const handleDelete = (teacher: User) => {
    const supervised = getSupervisedClasses(teacher.id);
    const confirmMsg = supervised.length > 0
      ? `Guru "${teacher.nama}" adalah wali kelas dari ${supervised.map(c => c.namaKelas).join(', ')}. Yakin ingin menghapus akun guru ini?`
      : `Yakin ingin menghapus data akun guru "${teacher.nama}"?`;

    if (confirm(confirmMsg)) {
      LiteStore.deleteUser(teacher.id);
      if (onUserUpdated) onUserUpdated();
    }
  };

  // Download Template Excel (.xlsx)
  const handleDownloadTemplate = () => {
    const headers = ['Username Login', 'Nama Lengkap & Gelar', 'Peran (Guru/Kepala)', 'Catatan Pembimbing / Bio'];
    const sampleRows = [
      ['guru_budi', 'Budi Santoso, S.Pd.', 'Guru', 'Guru Bahasa Indonesia & Pembina Klub Literasi.'],
      ['guru_maryam', 'Dra. Hj. Maryam, M.Pd.I.', 'Guru', 'Guru PAI & Pembimbing Literasi Keislaman.'],
      ['kepala_madrasah', 'H. Ahmad Muzaki, S.Ag.', 'Kepala', 'Kepala Madrasah MA NU 01 Banyuputih.']
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
    XLSX.writeFile(wb, 'template_import_guru.xlsx');
  };

  // Handle File Excel Upload (XLSX / XLS / CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawJson.length < 2) {
          setExcelError('File Excel kosong atau tidak memiliki baris data.');
          return;
        }

        const rows = rawJson.slice(1);
        const parsed: Array<{
          username: string;
          nama: string;
          role: 'guru' | 'kepala_madrasah';
          bio: string;
        }> = [];

        for (const row of rows) {
          if (!row || row.length === 0) continue;
          const rUser = String(row[0] || '').trim();
          const rNama = String(row[1] || '').trim();
          const rRole = String(row[2] || '').trim().toLowerCase();
          const rBio = String(row[3] || '').trim();

          if (!rUser || !rNama) continue;

          parsed.push({
            username: rUser.toLowerCase(),
            nama: rNama,
            role: rRole.includes('kepala') ? 'kepala_madrasah' : 'guru',
            bio: rBio || 'Guru Pembimbing Literasi MA NU 01 Banyuputih.'
          });
        }

        if (parsed.length === 0) {
          setExcelError('Tidak ada baris data guru yang valid ditemukan dalam file Excel.');
        } else {
          setParsedExcelData(parsed);
        }
      } catch (err: any) {
        setExcelError(`Gagal membaca berkas Excel: ${err?.message || 'Format tidak didukung'}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Simpan Hasil Import Excel
  const handleSaveImport = () => {
    if (parsedExcelData.length === 0) return;

    let addedCount = 0;
    const existingUsers = LiteStore.getUsers();

    parsedExcelData.forEach(item => {
      const exists = existingUsers.some(u => u.username?.toLowerCase() === item.username.toLowerCase());
      if (!exists) {
        LiteStore.addTeacher({
          username: item.username,
          nama: item.nama,
          role: item.role,
          bio: item.bio
        });
        addedCount++;
      }
    });

    setShowImportModal(false);
    setParsedExcelData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`Import Berhasil! ${addedCount} data guru & pembimbing berhasil ditambahkan.`);
    if (onUserUpdated) onUserUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                Manajemen Data Guru
              </h1>
              <p className="text-xs text-slate-500">
                Kelola dewan guru, pembimbing literasi kelas binaan, dan akun akses sistem
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Modal Input & Excel Import */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel Guru</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#132257] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Metric Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau username guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#132257]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="px-3 py-1.5 bg-slate-100 rounded-lg">
            Total {filteredTeachers.length} Guru Pembimbing
          </span>
        </div>
      </div>

      {/* Table Data Guru */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Nama Lengkap & NIP/Gelar</th>
                <th className="p-4">Username Login</th>
                <th className="p-4">Peran / Jabatan</th>
                <th className="p-4">Kelas Binaan (Wali)</th>
                <th className="p-4">Catatan Pembimbing</th>
                <th className="p-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    Tidak ada data guru yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(teacher => {
                  const supervised = getSupervisedClasses(teacher.id);
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0">
                            {teacher.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{teacher.nama}</div>
                            <div className="text-[10px] text-slate-400">ID: {teacher.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">
                        @{teacher.username || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          teacher.role === 'kepala_madrasah'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {teacher.role === 'kepala_madrasah' ? 'Kepala Madrasah' : 'Guru Pembimbing'}
                        </span>
                      </td>
                      <td className="p-4">
                        {supervised.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {supervised.map(c => (
                              <span key={c.id} className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold text-[10px] border border-blue-200">
                                {c.namaKelas}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-500">
                        {teacher.bio || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleOpenResetPassword(teacher)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Kata Sandi"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(teacher)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Guru"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: INPUT TAMBAH GURU                                    */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Tambah Guru / Pembimbing</h3>
                  <p className="text-[11px] text-slate-400">Daftarkan akun dewan guru madrasah</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Drs. Slamet Wibowo, M.Pd."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: pak_slamet"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#132257]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password Awal
                  </label>
                  <input
                    type="text"
                    required
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran / Wewenang
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                >
                  <option value="guru">Guru Pembimbing Literasi</option>
                  <option value="kepala_madrasah">Kepala Madrasah</option>
                  <option value="admin">Administrator IT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan Pembimbing
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Guru Bahasa Indonesia & Pembina Klub Jurnalistik..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Guru Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT DATA GURU                                       */}
      {/* ============================================================== */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Data Guru</h3>
                  <p className="text-[11px] text-slate-400">@{editingTeacher.username}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Jabatan</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                >
                  <option value="guru">Guru Pembimbing</option>
                  <option value="kepala_madrasah">Kepala Madrasah</option>
                  <option value="admin">Administrator IT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Keterangan Pembimbing</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#132257] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RESET PASSWORD GURU                                   */}
      {/* ============================================================== */}
      {resetModalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-700">
                <Key className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 text-sm">Reset Password Guru</h3>
              </div>
              <button 
                onClick={() => setResetModalTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>Guru: <strong>{resetModalTeacher.nama}</strong></p>
              <p>Username: <strong className="font-mono">@{resetModalTeacher.username}</strong></p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan kata sandi baru..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-amber-600"
                />
              </div>

              {resetFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{resetFeedback}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetModalTeacher(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Reset Password Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: IMPORT EXCEL DATA GURU                                */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-scale-up border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Import Data Guru dari Excel</h3>
                  <p className="text-xs text-slate-400">Daftarkan akun dewan guru & pembimbing sekaligus (.xlsx, .xls, .csv)</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setParsedExcelData([]);
                  setExcelError('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Download Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">Download Template Resmi Excel Guru</h4>
                <p className="text-[11px] text-slate-500">
                  Format kolom: Username Login, Nama Lengkap & Gelar, Peran, Catatan Pembimbing
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template .xlsx</span>
              </button>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Pilih Berkas Excel dari Komputer Anda</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Format file: .xlsx, .xls, .csv (Maksimal 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-teacher-file"
              />
              <label
                htmlFor="excel-teacher-file"
                className="inline-block mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Pilih Berkas Excel
              </label>
            </div>

            {excelError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{excelError}</span>
              </div>
            )}

            {/* Preview Data yang Dibaca dari Excel */}
            {parsedExcelData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Preview Data Terbaca ({parsedExcelData.length} Guru):
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Siap diimport
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Username</th>
                        <th className="p-2.5">Nama Lengkap</th>
                        <th className="p-2.5">Peran</th>
                        <th className="p-2.5">Catatan / Bio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedExcelData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">@{row.username}</td>
                          <td className="p-2.5 font-bold text-slate-900">{row.nama}</td>
                          <td className="p-2.5 capitalize">{row.role.replace('_', ' ')}</td>
                          <td className="p-2.5 text-slate-600 truncate max-w-xs">{row.bio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setParsedExcelData([]);
                  setExcelError('');
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedExcelData.length === 0}
                onClick={handleSaveImport}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan {parsedExcelData.length} Data Guru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
