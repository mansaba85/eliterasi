'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { User, Class } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  Users, Plus, Upload, Trash2, Edit3, Key, Search, 
  X, Download, FileSpreadsheet, CheckCircle2, AlertCircle,
  Filter, GraduationCap, CheckCircle
} from 'lucide-react';

interface TabDataSiswaProps {
  users: User[];
  classes: Class[];
  onAddStudent: (student: { nis: string; nama: string; tanggalLahir: string; kelasId: string }) => void;
  onDeleteUser: (id: string) => void;
  onUserUpdated?: () => void;
}

export default function TabDataSiswa({
  users,
  classes,
  onAddStudent,
  onDeleteUser,
  onUserUpdated
}: TabDataSiswaProps) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form Tambah Siswa
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kelasId, setKelasId] = useState(classes[0]?.id || '');

  // Form Edit Siswa
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState('');
  const [editKelasId, setEditKelasId] = useState('');

  // Form Reset PIN Modal
  const [resetModalStudent, setResetModalStudent] = useState<User | null>(null);
  const [newPin, setNewPin] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Excel Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedExcelData, setParsedExcelData] = useState<Array<{
    nis: string;
    nama: string;
    tanggalLahir: string;
    kelasNama: string;
    kelasId: string;
  }>>([]);
  const [excelError, setExcelError] = useState('');

  // Hanya data siswa
  const studentList = users.filter(u => u.role === 'siswa');

  // Filtered Students
  const filteredStudents = studentList.filter(s => {
    const matchSearch = 
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.kelasNama && s.kelasNama.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchClass = classFilter === 'all' || s.kelasId === classFilter;
    return matchSearch && matchClass;
  });

  // Submit Tambah Siswa
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !nama.trim() || !tanggalLahir.trim()) return;

    // Cek apakah NIS sudah terdaftar
    const existingNis = users.find(u => u.nis === nis.trim());
    if (existingNis) {
      alert(`NIS "${nis}" sudah digunakan oleh siswa ${existingNis.nama}! Silakan gunakan NIS lain.`);
      return;
    }

    onAddStudent({
      nis: nis.trim(),
      nama: nama.trim(),
      tanggalLahir: tanggalLahir.trim(),
      kelasId: kelasId || classes[0]?.id || ''
    });

    setNis('');
    setNama('');
    setTanggalLahir('');
    setShowAddModal(false);
    alert(`Siswa ${nama} berhasil didaftarkan ke sistem!`);
    if (onUserUpdated) onUserUpdated();
  };

  // Open Edit Modal
  const handleOpenEdit = (student: User) => {
    setEditingStudent(student);
    setEditNama(student.nama);
    setEditNis(student.nis || '');
    setEditTanggalLahir(student.tanggalLahir || '');
    setEditKelasId(student.kelasId || classes[0]?.id || '');
  };

  // Submit Edit Siswa
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editNama.trim()) return;

    LiteStore.updateUserAccount(editingStudent.id, {
      nama: editNama.trim(),
      nis: editNis.trim(),
      tanggalLahir: editTanggalLahir.trim(),
      kelasId: editKelasId
    });

    setEditingStudent(null);
    alert(`Data siswa ${editNama} berhasil diperbarui!`);
    if (onUserUpdated) onUserUpdated();
  };

  // Open Reset PIN
  const handleOpenResetPin = (student: User) => {
    setResetModalStudent(student);
    setNewPin(student.tanggalLahir || '17/08/2010');
    setResetFeedback('');
  };

  // Submit Reset PIN
  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent || !newPin.trim()) return;

    const res = LiteStore.resetUserPassword(resetModalStudent.id, newPin.trim());
    if (res.success) {
      setResetFeedback(`PIN/Tanggal Lahir siswa ${resetModalStudent.nama} berhasil direset menjadi: ${newPin.trim()}`);
      if (onUserUpdated) onUserUpdated();
      setTimeout(() => {
        setResetModalStudent(null);
        setResetFeedback('');
      }, 1500);
    }
  };

  // Download Template Excel (.xlsx)
  const handleDownloadTemplate = () => {
    const headers = ['Nomor Induk Siswa (NIS)', 'Nama Lengkap Siswa', 'Tanggal Lahir (DD/MM/YYYY)', 'Nama Kelas (Contoh: XII IPA 1)'];
    const sampleRows = [
      ['2024010', 'Ahmad Dani Pratama', '12/05/2009', 'XII IPA 1'],
      ['2024011', 'Siti Fatimah Azzahra', '20/11/2009', 'XI IPS 1'],
      ['2024012', 'Budi Santoso', '08/02/2010', 'X IPA 3']
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 28 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, 'template_import_siswa.xlsx');
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
          nis: string;
          nama: string;
          tanggalLahir: string;
          kelasNama: string;
          kelasId: string;
        }> = [];

        for (const row of rows) {
          if (!row || row.length === 0) continue;
          const rNis = String(row[0] || '').trim();
          const rNama = String(row[1] || '').trim();
          const rTgl = String(row[2] || '').trim();
          const rKelas = String(row[3] || '').trim();

          if (!rNis || !rNama) continue;

          // Cari kelasId berdasarkan nama kelas
          const matchedClass = classes.find(c => 
            c.namaKelas.toLowerCase() === rKelas.toLowerCase()
          ) || classes[0];

          parsed.push({
            nis: rNis,
            nama: rNama,
            tanggalLahir: rTgl || '01/01/2010',
            kelasNama: matchedClass ? matchedClass.namaKelas : rKelas,
            kelasId: matchedClass ? matchedClass.id : (classes[0]?.id || '')
          });
        }

        if (parsed.length === 0) {
          setExcelError('Tidak ada baris data siswa yang valid ditemukan dalam file Excel.');
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
      const exists = existingUsers.some(u => u.nis === item.nis);
      if (!exists) {
        LiteStore.addStudent({
          nis: item.nis,
          nama: item.nama,
          tanggalLahir: item.tanggalLahir,
          kelasId: item.kelasId
        });
        addedCount++;
      }
    });

    setShowImportModal(false);
    setParsedExcelData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`Import Berhasil! ${addedCount} data siswa baru berhasil ditambahkan.`);
    if (onUserUpdated) onUserUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#132257] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                Manajemen Data Siswa
              </h1>
              <p className="text-xs text-slate-500">
                Kelola data akun siswa, penempatan rombongan belajar, dan reset PIN login
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
            <span>Import Excel Siswa</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#132257] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
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
            placeholder="Cari berdasarkan nama, NIS, atau kelas siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#132257]"
          />
        </div>

        {/* Filter Kelas Rombel */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Semua Rombel ({studentList.length} Siswa)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.namaKelas}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data Siswa */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Nama Siswa & NIS</th>
                <th className="p-4">Rombel Kelas</th>
                <th className="p-4">PIN Login (Tgl Lahir)</th>
                <th className="p-4 text-center">Poin Literasi</th>
                <th className="p-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    Tidak ada data siswa yang cocok dengan pencarian / filter kelas.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#132257] font-black text-xs flex items-center justify-center shrink-0">
                          {student.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{student.nama}</div>
                          <div className="text-[11px] text-slate-500 font-mono">NIS: {student.nis || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 font-extrabold text-[11px] border border-blue-200">
                        {student.kelasNama || 'Belum Ada Kelas'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-700">
                      {student.tanggalLahir || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-xs">
                        ★ {student.poin}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenResetPin(student)}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Reset PIN Login"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus akun siswa ${student.nama} (NIS: ${student.nis})?`)) {
                              onDeleteUser(student.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ============================================================== */}
      {/* MODAL 1: INPUT TAMBAH SISWA                                   */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#132257] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Daftarkan Siswa Baru</h3>
                  <p className="text-[11px] text-slate-400">Tambahkan akun peserta didik madrasah</p>
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
                  Nomor Induk Siswa (NIS) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 2024010"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai data raport..."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Lahir (PIN Login: DD/MM/YYYY) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 14/09/2008"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Format tanggal lahir digunakan sebagai PIN siswa untuk masuk portal.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rombongan Belajar (Kelas) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.namaKelas} (Wali: {c.waliKelasNama || '-'})
                    </option>
                  ))}
                </select>
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
                  className="px-5 py-2.5 bg-[#132257] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Siswa Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT DATA SISWA                                      */}
      {/* ============================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Data Siswa</h3>
                  <p className="text-[11px] text-slate-400">NIS: {editingStudent.nis}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  required
                  value={editNis}
                  onChange={(e) => setEditNis(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir (PIN)</label>
                <input
                  type="text"
                  required
                  value={editTanggalLahir}
                  onChange={(e) => setEditTanggalLahir(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Rombel</label>
                <select
                  value={editKelasId}
                  onChange={(e) => setEditKelasId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.namaKelas}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
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
      {/* MODAL 3: RESET PIN LOGIN SISWA                                 */}
      {/* ============================================================== */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-700">
                <Key className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 text-sm">Reset PIN Login Siswa</h3>
              </div>
              <button 
                onClick={() => setResetModalStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>Siswa: <strong>{resetModalStudent.nama}</strong></p>
              <p>NIS: <strong className="font-mono">{resetModalStudent.nis}</strong></p>
            </div>

            <form onSubmit={handleResetPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Baru (Format Tanggal Lahir DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 17/08/2010"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
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
                  onClick={() => setResetModalStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Reset PIN Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: IMPORT EXCEL DATA SISWA                               */}
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
                  <h3 className="font-extrabold text-slate-900 text-base">Import Data Siswa dari Excel</h3>
                  <p className="text-xs text-slate-400">Daftarkan rombongan siswa dalam hitungan detik (.xlsx, .xls, .csv)</p>
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
                <h4 className="text-xs font-bold text-slate-900">Download Template Resmi Excel Siswa</h4>
                <p className="text-[11px] text-slate-500">
                  Format kolom: NIS, Nama Lengkap, Tanggal Lahir (DD/MM/YYYY), dan Kelas
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
                id="excel-student-file"
              />
              <label
                htmlFor="excel-student-file"
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
                    Preview Data Terbaca ({parsedExcelData.length} Siswa):
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
                        <th className="p-2.5">NIS</th>
                        <th className="p-2.5">Nama Siswa</th>
                        <th className="p-2.5">Tgl Lahir (PIN)</th>
                        <th className="p-2.5">Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedExcelData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">{row.nis}</td>
                          <td className="p-2.5 font-bold text-slate-900">{row.nama}</td>
                          <td className="p-2.5 font-mono text-slate-600">{row.tanggalLahir}</td>
                          <td className="p-2.5 font-semibold text-blue-900">{row.kelasNama}</td>
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
                <span>Simpan {parsedExcelData.length} Data Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
