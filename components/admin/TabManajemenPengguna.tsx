'use client';

import React, { useState, useRef } from 'react';
import { User, Class, UserRole } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  Users, Plus, Upload, Trash2, Edit3, Key, Search, CheckCircle, ShieldCheck, 
  GraduationCap, BookOpen, UserCheck, X, Download, FileSpreadsheet, AlertCircle,
  Shield, Crown, Filter
} from 'lucide-react';

interface TabManajemenPenggunaProps {
  users: User[];
  classes: Class[];
  onAddStudent: (student: { nis: string; nama: string; tanggalLahir: string; kelasId: string }) => void;
  onDeleteUser: (id: string) => void;
  onUserUpdated?: () => void;
}

export default function TabManajemenPengguna({
  users,
  classes,
  onAddStudent,
  onDeleteUser,
  onUserUpdated
}: TabManajemenPenggunaProps) {
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addMode, setAddMode] = useState<'siswa' | 'staff'>('siswa');

  // Form Tambah Siswa
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kelasId, setKelasId] = useState(classes[0]?.id || '');

  // Form Tambah Staff
  const [staffUsername, setStaffUsername] = useState('');
  const [staffNama, setStaffNama] = useState('');
  const [staffRole, setStaffRole] = useState<'guru' | 'admin' | 'kepala_madrasah'>('guru');
  const [staffBio, setStaffBio] = useState('');

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState<'all' | 'siswa' | 'guru' | 'admin' | 'kepala_madrasah'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Modal Edit User
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState('');
  const [editKelasId, setEditKelasId] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('siswa');
  const [editBio, setEditBio] = useState('');

  // Modal Reset Password
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [newPasswordPin, setNewPasswordPin] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedCsvData, setParsedCsvData] = useState<Array<{ nis: string; nama: string; tanggalLahir: string; kelasId: string }>>([]);
  const [csvError, setCsvError] = useState('');

  // Counts
  const countSiswa = users.filter(u => u.role === 'siswa').length;
  const countGuru = users.filter(u => u.role === 'guru').length;
  const countAdmin = users.filter(u => u.role === 'admin').length;
  const countKepala = users.filter(u => u.role === 'kepala_madrasah').length;

  // Handlers Tambah Siswa
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !nama.trim() || !tanggalLahir.trim()) return;

    onAddStudent({
      nis: nis.trim(),
      nama: nama.trim(),
      tanggalLahir: tanggalLahir.trim(),
      kelasId
    });

    setNis('');
    setNama('');
    setTanggalLahir('');
    setShowAddModal(false);
    alert(`Siswa ${nama} berhasil didaftarkan ke sistem!`);
    if (onUserUpdated) onUserUpdated();
  };

  // Handlers Tambah Staff
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername.trim() || !staffNama.trim()) return;

    const allUsers = LiteStore.getUsers();
    if (allUsers.some(u => u.username?.toLowerCase() === staffUsername.trim().toLowerCase())) {
      alert(`Username "${staffUsername}" sudah digunakan! Silakan gunakan username lain.`);
      return;
    }

    const newStaff: User = {
      id: `usr-${Date.now()}`,
      username: staffUsername.trim().toLowerCase(),
      nama: staffNama.trim(),
      role: staffRole,
      bio: staffBio.trim() || `Staff ${staffRole === 'guru' ? 'Guru Pembimbing' : staffRole === 'admin' ? 'Administrator' : 'Kepala Madrasah'} MA NU 01 Banyuputih`,
      poin: 0,
      createdAt: new Date().toISOString()
    };

    allUsers.push(newStaff);
    LiteStore.saveUsers(allUsers);
    setStaffUsername('');
    setStaffNama('');
    setStaffBio('');
    setShowAddModal(false);
    alert(`Akun staff ${newStaff.nama} berhasil didaftarkan!`);
    if (onUserUpdated) onUserUpdated();
  };

  // Handlers Edit
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditNama(user.nama);
    setEditNis(user.nis || '');
    setEditUsername(user.username || '');
    setEditTanggalLahir(user.tanggalLahir || '');
    setEditKelasId(user.kelasId || classes[0]?.id || '');
    setEditRole(user.role);
    setEditBio(user.bio || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updates: Partial<User> = {
      nama: editNama.trim(),
      role: editRole,
      bio: editBio.trim()
    };

    if (editRole === 'siswa') {
      updates.nis = editNis.trim();
      updates.tanggalLahir = editTanggalLahir.trim();
      updates.kelasId = editKelasId;
      const targetClass = classes.find(c => c.id === editKelasId);
      if (targetClass) updates.kelasNama = targetClass.namaKelas;
    } else {
      updates.username = editUsername.trim();
    }

    LiteStore.updateUserAccount(editingUser.id, updates);
    setEditingUser(null);
    alert(`Data akun ${editNama} berhasil diperbarui!`);
    if (onUserUpdated) onUserUpdated();
  };

  const handleOpenReset = (user: User) => {
    setResetModalUser(user);
    setNewPasswordPin(user.role === 'siswa' ? '17/08/2010' : 'madrasah123');
    setResetFeedback('');
  };

  const handleExecuteReset = () => {
    if (!resetModalUser || !newPasswordPin.trim()) return;

    const result = LiteStore.resetUserPassword(resetModalUser.id, newPasswordPin.trim());
    setResetFeedback(result.message);
    if (onUserUpdated) onUserUpdated();
  };

  // CSV File Handler (Real File Parser)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          setCsvError('File CSV kosong atau tidak memiliki baris data!');
          return;
        }

        // Parse lines skipping header
        const parsed: Array<{ nis: string; nama: string; tanggalLahir: string; kelasId: string }> = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length >= 3) {
            const rowNis = parts[0];
            const rowNama = parts[1];
            const rowTgl = parts[2];
            let rowKelasId = parts[3] || classes[0]?.id || 'cls-1';
            
            // Match class by name if name was provided
            const matchedClass = classes.find(c => c.namaKelas.toLowerCase() === rowKelasId.toLowerCase() || c.id === rowKelasId);
            if (matchedClass) {
              rowKelasId = matchedClass.id;
            }

            if (rowNis && rowNama) {
              parsed.push({
                nis: rowNis,
                nama: rowNama,
                tanggalLahir: rowTgl || '01/01/2010',
                kelasId: rowKelasId
              });
            }
          }
        }

        if (parsed.length === 0) {
          setCsvError('Tidak ada baris data valid yang terbaca. Pastikan format: NIS,Nama,DD/MM/YYYY,Kelas');
          return;
        }

        setParsedCsvData(parsed);
      } catch (err: any) {
        setCsvError('Gagal memproses file CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitCsvImport = () => {
    if (parsedCsvData.length === 0) return;

    parsedCsvData.forEach(item => {
      onAddStudent(item);
    });

    alert(`Berhasil mengimpor ${parsedCsvData.length} siswa baru ke sistem!`);
    setParsedCsvData([]);
    setShowImportModal(false);
    if (onUserUpdated) onUserUpdated();
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "NIS,Nama,Tanggal_Lahir,Nama_Kelas\n"
      + "12451,Zulfikar Rahman,10/05/2010,XII IPA 1\n"
      + "12452,Anisa Rahmawati,22/07/2010,XI IPA 1\n"
      + "12453,Bagus Prakoso,04/03/2009,XI IPS 1\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Users List
  const filteredUsers = users.filter(user => {
    if (activeRoleTab !== 'all' && user.role !== activeRoleTab) return false;
    if (activeRoleTab === 'siswa' && classFilter !== 'all' && user.kelasId !== classFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNama = user.nama.toLowerCase().includes(q);
      const matchNis = user.nis ? user.nis.toLowerCase().includes(q) : false;
      const matchUsername = user.username ? user.username.toLowerCase().includes(q) : false;
      const matchKelas = user.kelasNama ? user.kelasNama.toLowerCase().includes(q) : false;
      return matchNama || matchNis || matchUsername || matchKelas;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Action & Summary Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#132257]" />
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              Manajemen Pengguna Madrasah
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Kelola akun siswa, dewan guru pembina, dan hak akses admin. Tambah akun secara manual atau unggah massal via berkas CSV.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setAddMode('siswa');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          <button
            onClick={() => {
              setAddMode('staff');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-[#132257] hover:bg-[#1f378a] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru / Staff</span>
          </button>

          <button
            onClick={() => {
              setParsedCsvData([]);
              setCsvError('');
              setShowImportModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-700" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Role Navigation Pills & Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Role Filters Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Semua Pengguna', count: users.length, icon: Users },
              { id: 'siswa', label: 'Siswa', count: countSiswa, icon: GraduationCap },
              { id: 'guru', label: 'Guru Pembimbing', count: countGuru, icon: BookOpen },
              { id: 'admin', label: 'Administrator', count: countAdmin, icon: Shield },
              { id: 'kepala_madrasah', label: 'Kepala Madrasah', count: countKepala, icon: Crown },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    activeRoleTab === tab.id
                      ? 'bg-[#132257] text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeRoleTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Class Filter if in Siswa Tab */}
          {activeRoleTab === 'siswa' && (
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Semua Rombel</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Kelas {c.namaKelas}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap, NIS, username, atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#132257]/15 font-medium text-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Main Users Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-700">
            Daftar Pengguna ({filteredUsers.length} data ditemukan)
          </span>
          <span className="text-slate-400 font-medium text-[11px]">
            Gunakan tombol aksi untuk edit profil atau reset kata sandi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Identitas Pengguna</th>
                <th className="p-4">Peran / Hak Akses</th>
                <th className="p-4">Penempatan / Jabatan</th>
                <th className="p-4 text-center">Poin Literasi</th>
                <th className="p-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-100/70">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
                    <p className="font-bold text-slate-700">Tidak ada pengguna yang cocok dengan kriteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const roleBadge = 
                    user.role === 'siswa' ? { label: 'Siswa', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: GraduationCap } :
                    user.role === 'guru' ? { label: 'Guru Pembimbing', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: BookOpen } :
                    user.role === 'admin' ? { label: 'Administrator', bg: 'bg-amber-50 text-amber-900 border-amber-300', icon: Shield } :
                    { label: 'Kepala Madrasah', bg: 'bg-purple-50 text-purple-900 border-purple-200', icon: Crown };
                  
                  const RoleIcon = roleBadge.icon;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>

                      {/* Avatar & Identitas */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {user.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{user.nama}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {user.role === 'siswa' ? (
                                <span>NIS: <strong className="text-slate-600">{user.nis || '-'}</strong> • Lahir: {user.tanggalLahir || '-'}</span>
                              ) : (
                                <span>Username: <strong className="text-slate-600">@{user.username || '-'}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleBadge.bg}`}>
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>

                      {/* Penempatan */}
                      <td className="p-4 font-semibold text-slate-700">
                        {user.role === 'siswa' ? (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-[11px] font-bold border border-slate-200/60">
                            Kelas {user.kelasNama || '-'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600">
                            {user.bio || 'Staff Pengampu'}
                          </span>
                        )}
                      </td>

                      {/* Poin Literasi */}
                      <td className="p-4 text-center font-black text-amber-600">
                        {user.role === 'siswa' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200/60">
                            ⭐ {user.poin || 0}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Aksi Kelola */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-500 hover:text-[#132257] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Pengguna"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenReset(user)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Kata Sandi / PIN"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus akun "${user.nama}" secara permanen?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun"
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
      {/* MODAL 1: TAMBAH PENGGUNA (SISWA ATAU STAFF)                   */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  +
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {addMode === 'siswa' ? 'Daftarkan Siswa Baru' : 'Daftarkan Akun Guru / Staff'}
                  </h3>
                  <p className="text-[11px] text-slate-400">MA NU 01 Banyuputih</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Mode Tambah */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAddMode('siswa')}
                className={`flex-1 py-2 text-center rounded-lg transition-all ${
                  addMode === 'siswa' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Data Siswa
              </button>
              <button
                type="button"
                onClick={() => setAddMode('staff')}
                className={`flex-1 py-2 text-center rounded-lg transition-all ${
                  addMode === 'staff' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Data Guru / Staff
              </button>
            </div>

            {/* Form Siswa */}
            {addMode === 'siswa' ? (
              <form onSubmit={handleAddStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk Siswa (NIS) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: 2024099"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap..."
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir (DD/MM/YYYY) *</label>
                    <input
                      type="text"
                      required
                      placeholder="17/08/2010"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Berfungsi sebagai PIN login siswa.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Penempatan *</label>
                    <select
                      value={kelasId}
                      onChange={(e) => setKelasId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800 outline-none"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.namaKelas}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm"
                  >
                    Simpan Siswa
                  </button>
                </div>
              </form>
            ) : (
              /* Form Staff */
              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bu Siti Aminah, S.Pd."
                    value={staffNama}
                    onChange={(e) => setStaffNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#132257]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: aminah"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Hak Akses *</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold outline-none"
                    >
                      <option value="guru">Guru Pembimbing</option>
                      <option value="admin">Administrator IT</option>
                      <option value="kepala_madrasah">Kepala Madrasah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Keterangan Bio</label>
                  <input
                    type="text"
                    placeholder="Contoh: Guru Bahasa Indonesia & Pembina Literasi"
                    value={staffBio}
                    onChange={(e) => setStaffBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#132257] hover:bg-[#1e3480] text-white rounded-xl text-xs font-extrabold shadow-sm"
                  >
                    Simpan Akun Staff
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: IMPORT MASSAL CSV                                     */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-700" />
                <h3 className="font-black text-slate-900 text-base">
                  Import Massal Siswa via File CSV
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs space-y-2 text-slate-700">
              <p className="font-bold text-[#132257] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-700" /> Format Berkas CSV:
              </p>
              <p className="leading-relaxed">
                Susunan kolom berkas: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-blue-900 border border-blue-200">NIS, Nama, Tanggal_Lahir (DD/MM/YYYY), Nama_Kelas</code>.
              </p>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-1.5 text-blue-800 font-extrabold underline hover:text-blue-950 mt-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Contoh Berkas CSV Template</span>
              </button>
            </div>

            {/* Drag and Drop File Input Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Pilih atau Tarik Berkas CSV Komputer Anda ke Sini
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Format file yang didukung: .csv (maksimal 5MB)</p>
            </div>

            {csvError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{csvError}</span>
              </div>
            )}

            {/* Preview Parsed Data */}
            {parsedCsvData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Pratinjau Data yang Terbaca:</span>
                  <span className="text-emerald-700">✓ {parsedCsvData.length} baris siswa terdeteksi</span>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                      <tr>
                        <th className="p-2">NIS</th>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Tgl Lahir</th>
                        <th className="p-2">Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {parsedCsvData.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-mono">{d.nis}</td>
                          <td className="p-2 font-bold text-slate-800">{d.nama}</td>
                          <td className="p-2 font-mono">{d.tanggalLahir}</td>
                          <td className="p-2">{classes.find(c => c.id === d.kelasId)?.namaKelas || d.kelasId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={parsedCsvData.length === 0}
                onClick={handleCommitCsvImport}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simpan {parsedCsvData.length} Siswa ke Sistem</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT PENGGUNA                                         */}
      {/* ============================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Edit Data Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              {editRole === 'siswa' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NIS</label>
                      <input
                        type="text"
                        required
                        value={editNis}
                        onChange={(e) => setEditNis(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="text"
                        required
                        value={editTanggalLahir}
                        onChange={(e) => setEditTanggalLahir(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={editKelasId}
                      onChange={(e) => setEditKelasId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold outline-none"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.namaKelas}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biodata Singkat</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#132257] text-white rounded-xl text-xs font-extrabold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: RESET PASSWORD / PIN                                  */}
      {/* ============================================================== */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm">Reset Akses Login</h3>
              </div>
              <button onClick={() => setResetModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Atur ulang PIN atau kata sandi untuk akun <strong className="text-slate-900">{resetModalUser.nama}</strong>:
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {resetModalUser.role === 'siswa' ? 'Tanggal Lahir Baru (DD/MM/YYYY)' : 'Kata Sandi Baru'}
              </label>
              <input
                type="text"
                required
                value={newPasswordPin}
                onChange={(e) => setNewPasswordPin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-amber-600"
              />
            </div>

            {resetFeedback && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {resetFeedback}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-sm"
              >
                Terapkan Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
