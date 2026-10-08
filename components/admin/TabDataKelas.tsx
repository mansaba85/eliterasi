'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Class, User } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  GraduationCap, Plus, Upload, Trash2, Edit3, Search, 
  X, Download, FileSpreadsheet, CheckCircle2, AlertCircle,
  Users, Layers, ArrowUpDown
} from 'lucide-react';

interface TabDataKelasProps {
  classes: Class[];
  users: User[];
  onClassesUpdated?: () => void;
}

export default function TabDataKelas({
  classes,
  users,
  onClassesUpdated
}: TabDataKelasProps) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Form Add State
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [waliKelasId, setWaliKelasId] = useState('');

  // Form Edit State
  const [editNamaKelas, setEditNamaKelas] = useState('');
  const [editTingkat, setEditTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [editTahunAjaran, setEditTahunAjaran] = useState('2026/2027');
  const [editWaliKelasId, setEditWaliKelasId] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [tingkatFilter, setTingkatFilter] = useState<'all' | 'X' | 'XI' | 'XII'>('all');

  // Excel Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedExcelData, setParsedExcelData] = useState<Array<{
    namaKelas: string;
    tingkat: 'X' | 'XI' | 'XII';
    tahunAjaran: string;
    waliKelasNama?: string;
  }>>([]);
  const [excelError, setExcelError] = useState('');

  // Daftar guru untuk wali kelas
  const teachers = users.filter(u => u.role === 'guru' || u.role === 'admin');

  // Filtered classes
  const filteredClasses = classes.filter(cls => {
    const matchSearch = 
      cls.namaKelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.waliKelasNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.tahunAjaran.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTingkat = tingkatFilter === 'all' || cls.tingkat === tingkatFilter;
    return matchSearch && matchTingkat;
  });

  // Hitung jumlah siswa per kelas
  const getStudentCount = (classId: string) => {
    return users.filter(u => u.role === 'siswa' && u.kelasId === classId).length;
  };

  // Submit Tambah Kelas
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    const selectedTeacher = teachers.find(t => t.id === waliKelasId);

    LiteStore.addClass({
      namaKelas: namaKelas.trim(),
      tingkat,
      tahunAjaran: tahunAjaran.trim() || '2026/2027',
      waliKelasId,
      waliKelasNama: selectedTeacher ? selectedTeacher.nama : '-'
    });

    setNamaKelas('');
    setWaliKelasId('');
    setShowAddModal(false);
    alert(`Rombongan belajar ${namaKelas} berhasil ditambahkan!`);
    if (onClassesUpdated) onClassesUpdated();
  };

  // Open Edit Modal
  const handleOpenEdit = (cls: Class) => {
    setEditingClass(cls);
    setEditNamaKelas(cls.namaKelas);
    setEditTingkat(cls.tingkat);
    setEditTahunAjaran(cls.tahunAjaran);
    setEditWaliKelasId(cls.waliKelasId || '');
  };

  // Submit Edit Kelas
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editNamaKelas.trim()) return;

    const selectedTeacher = teachers.find(t => t.id === editWaliKelasId);

    LiteStore.updateClass(editingClass.id, {
      namaKelas: editNamaKelas.trim(),
      tingkat: editTingkat,
      tahunAjaran: editTahunAjaran.trim(),
      waliKelasId: editWaliKelasId,
      waliKelasNama: selectedTeacher ? selectedTeacher.nama : '-'
    });

    setEditingClass(null);
    alert(`Data kelas ${editNamaKelas} berhasil diperbarui!`);
    if (onClassesUpdated) onClassesUpdated();
  };

  // Hapus Kelas
  const handleDelete = (cls: Class) => {
    const count = getStudentCount(cls.id);
    const confirmMsg = count > 0
      ? `Kelas "${cls.namaKelas}" memiliki ${count} siswa terdaftar. Hapus kelas ini?`
      : `Yakin ingin menghapus kelas "${cls.namaKelas}"?`;

    if (confirm(confirmMsg)) {
      LiteStore.deleteClass(cls.id);
      if (onClassesUpdated) onClassesUpdated();
    }
  };

  // Download Template Excel (.xlsx)
  const handleDownloadTemplate = () => {
    const headers = ['Nama Kelas', 'Tingkat (X/XI/XII)', 'Tahun Ajaran', 'Wali Kelas / Catatan'];
    const sampleRows = [
      ['X IPA 1', 'X', '2026/2027', 'Pak Slamet Wibowo, S.Pd.'],
      ['XI IPS 2', 'XI', '2026/2027', 'Bu Endang Rahayu, M.Pd.'],
      ['XII BAHASA', 'XII', '2026/2027', 'Ibu Kartini, S.Pd.']
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    // Set column width
    ws['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Kelas');
    XLSX.writeFile(wb, 'template_import_kelas.xlsx');
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
          setExcelError('File Excel kosong atau tidak memiliki data.');
          return;
        }

        const rows = rawJson.slice(1);
        const parsed: Array<{
          namaKelas: string;
          tingkat: 'X' | 'XI' | 'XII';
          tahunAjaran: string;
          waliKelasNama?: string;
        }> = [];

        for (const row of rows) {
          if (!row || row.length === 0) continue;
          const nama = String(row[0] || '').trim();
          if (!nama) continue;

          let tk = String(row[1] || '').trim().toUpperCase();
          if (tk !== 'X' && tk !== 'XI' && tk !== 'XII') {
            // Deteksi otomatis dari nama kelas
            if (nama.toUpperCase().startsWith('XII')) tk = 'XII';
            else if (nama.toUpperCase().startsWith('XI')) tk = 'XI';
            else tk = 'X';
          }

          const ta = String(row[2] || '2026/2027').trim();
          const wali = String(row[3] || '-').trim();

          parsed.push({
            namaKelas: nama,
            tingkat: tk as 'X' | 'XI' | 'XII',
            tahunAjaran: ta || '2026/2027',
            waliKelasNama: wali
          });
        }

        if (parsed.length === 0) {
          setExcelError('Tidak ada baris data kelas yang valid ditemukan dalam file Excel.');
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
    const existingClasses = LiteStore.getClasses();

    parsedExcelData.forEach(item => {
      // Cek apakah nama kelas sudah ada
      const exists = existingClasses.some(c => c.namaKelas.toLowerCase() === item.namaKelas.toLowerCase());
      if (!exists) {
        // Cari wali kelas jika nama cocok
        const matchedTeacher = teachers.find(t => 
          item.waliKelasNama && t.nama.toLowerCase().includes(item.waliKelasNama.toLowerCase())
        );

        LiteStore.addClass({
          namaKelas: item.namaKelas,
          tingkat: item.tingkat,
          tahunAjaran: item.tahunAjaran,
          waliKelasId: matchedTeacher?.id || '',
          waliKelasNama: matchedTeacher?.nama || item.waliKelasNama || '-'
        });
        addedCount++;
      }
    });

    setShowImportModal(false);
    setParsedExcelData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`Import Berhasil! ${addedCount} rombongan belajar baru berhasil ditambahkan.`);
    if (onClassesUpdated) onClassesUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#132257] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                Manajemen Data Kelas
              </h1>
              <p className="text-xs text-slate-500">
                Kelola rombongan belajar, penjenjangan tingkat X/XI/XII, dan wali kelas pembimbing literasi
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
            <span>Import Excel Kelas</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#132257] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Baru</span>
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
            placeholder="Cari nama kelas atau wali kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#132257]"
          />
        </div>

        {/* Tingkat Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'X', 'XI', 'XII'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTingkatFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tingkatFilter === t
                  ? 'bg-[#132257] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'Semua Tingkat' : `Kelas ${t}`}
            </button>
          ))}
          <span className="text-xs text-slate-400 font-semibold px-2">
            ({filteredClasses.length} Kelas)
          </span>
        </div>
      </div>

      {/* Table Data Kelas */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Nama Kelas</th>
                <th className="p-4">Tingkat</th>
                <th className="p-4">Tahun Ajaran</th>
                <th className="p-4">Wali Kelas / Pembimbing</th>
                <th className="p-4 text-center">Jumlah Siswa</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    Tidak ada rombongan belajar yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => {
                  const studentCount = getStudentCount(cls.id);
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{cls.namaKelas}</div>
                        <div className="text-[10px] text-slate-400">ID: {cls.id}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          cls.tingkat === 'X' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          cls.tingkat === 'XI' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          Tingkat {cls.tingkat}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{cls.tahunAjaran}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{cls.waliKelasNama || '-'}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{studentCount} Siswa</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Kelas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cls)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kelas"
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
      {/* MODAL 1: INPUT TAMBAH KELAS                                   */}
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
                  <h3 className="font-extrabold text-slate-900 text-sm">Tambah Rombel Kelas</h3>
                  <p className="text-[11px] text-slate-400">Input data kelas baru ke madrasah</p>
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
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: X IPA 1, XI IPS 2, XII BAHASA"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wali Kelas / Guru Pembimbing
                </label>
                <select
                  value={waliKelasId}
                  onChange={(e) => setWaliKelasId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
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
                  Simpan Kelas Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT DATA KELAS                                      */}
      {/* ============================================================== */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Data Kelas</h3>
                  <p className="text-[11px] text-slate-400">ID: {editingClass.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingClass(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={editNamaKelas}
                  onChange={(e) => setEditNamaKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#132257]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={editTingkat}
                    onChange={(e) => setEditTingkat(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    value={editTahunAjaran}
                    onChange={(e) => setEditTahunAjaran(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wali Kelas</label>
                <select
                  value={editWaliKelasId}
                  onChange={(e) => setEditWaliKelasId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none bg-white"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
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
      {/* MODAL 3: IMPORT EXCEL DATA KELAS                               */}
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
                  <h3 className="font-extrabold text-slate-900 text-base">Import Data Kelas dari Excel</h3>
                  <p className="text-xs text-slate-400">Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV</p>
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
                <h4 className="text-xs font-bold text-slate-900">Download Template Resmi Excel Kelas</h4>
                <p className="text-[11px] text-slate-500">
                  Gunakan format kolom resmi agar data terbaca secara akurat oleh sistem
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
              <p className="text-[11px] text-slate-400 mt-0.5">Format file: .xlsx, .xls, .csv (Maksimal 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-class-file"
              />
              <label
                htmlFor="excel-class-file"
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
                    Preview Data Terbaca ({parsedExcelData.length} Kelas):
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
                        <th className="p-2.5">Nama Kelas</th>
                        <th className="p-2.5">Tingkat</th>
                        <th className="p-2.5">Tahun Ajaran</th>
                        <th className="p-2.5">Wali Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedExcelData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{row.namaKelas}</td>
                          <td className="p-2.5">{row.tingkat}</td>
                          <td className="p-2.5">{row.tahunAjaran}</td>
                          <td className="p-2.5 text-slate-600">{row.waliKelasNama || '-'}</td>
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
                <span>Simpan {parsedExcelData.length} Data Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
