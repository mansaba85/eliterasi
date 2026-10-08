'use client';

import React, { useState } from 'react';
import { AuditLog } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  ShieldAlert, Search, Trash2, Download, Filter, Clock, 
  User, CheckCircle, AlertTriangle, FileCode
} from 'lucide-react';

interface TabAuditLogProps {
  onLogCleared?: () => void;
}

export default function TabAuditLog({ onLogCleared }: TabAuditLogProps) {
  const [logs, setLogs] = useState<AuditLog[]>(LiteStore.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const refreshLogs = () => {
    setLogs(LiteStore.getAuditLogs());
  };

  const handleClearLogs = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log aktivitas sistem?')) {
      LiteStore.clearAuditLogs();
      refreshLogs();
      if (onLogCleared) onLogCleared();
    }
  };

  const handleExportLogsCSV = () => {
    const headers = ['No', 'ID Log', 'Waktu (WIB)', 'Pelaku (Nama)', 'Peran', 'Jenis Aksi', 'Detail Aktivitas', 'Target'];
    
    const rows = logs.map((log, idx) => [
      idx + 1,
      `"${log.id}"`,
      `"${new Date(log.timestamp).toLocaleString('id-ID')}"`,
      `"${log.userNama}"`,
      `"${log.userRole}"`,
      `"${log.action}"`,
      `"${log.detail.replace(/"/g, '""')}"`,
      `"${log.targetName || '-'}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_Literasi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      log.userNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetName && log.targetName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'TAMBAH_USER':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">TAMBAH USER</span>;
      case 'EDIT_USER':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded">EDIT USER</span>;
      case 'RESET_PASSWORD':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">RESET PASS</span>;
      case 'TERBITKAN_SERTIFIKAT':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded">SERTIFIKAT</span>;
      case 'UPDATE_PENGATURAN':
        return <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded">PENGATURAN</span>;
      case 'TAMBAH_BUKU':
      case 'EDIT_BUKU':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">KATALOG BUKU</span>;
      case 'HAPUS_BUKU':
      case 'HAPUS_SERTIFIKAT':
      case 'HAPUS_USER':
      case 'HAPUS_POST':
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded">HAPUS DATA</span>;
      case 'MODERASI_POST':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded">MODERASI</span>;
      case 'BUAT_AGENDA':
      case 'TOGGLE_AGENDA':
        return <span className="bg-cyan-50 text-cyan-800 border border-cyan-100 text-[10px] font-bold px-2 py-0.5 rounded">AGENDA</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            Log Aktivitas Sistem (Audit Trail)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap perubahan data penting, modifikasi akun siswa, penerbitan sertifikat, dan perubahan pengaturan madrasah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleExportLogsCSV}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Ekspor Log (.CSV)
          </button>

          <button 
            onClick={handleClearLogs}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Kosongkan Log
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Cari dalam log aktivitas (nama pelaku, rincian tindakan, atau sasaran)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
          />
        </div>

        <select 
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium text-slate-700 outline-none w-full sm:w-auto"
        >
          <option value="all">Semua Jenis Aksi</option>
          <option value="EDIT_USER">Edit Akun Pengguna</option>
          <option value="RESET_PASSWORD">Reset Password/PIN</option>
          <option value="TERBITKAN_SERTIFIKAT">Penerbitan Sertifikat</option>
          <option value="UPDATE_PENGATURAN">Pengaturan Madrasah</option>
          <option value="TAMBAH_BUKU">Katalog Buku</option>
          <option value="MODERASI_POST">Moderasi Karya</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Daftar Rekam Jejak Sistem ({filteredLogs.length} Peristiwa)
          </h4>
        </div>

        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <th className="p-3.5">Waktu Kejadian</th>
                <th className="p-3.5">Pelaku Tindakan</th>
                <th className="p-3.5">Jenis Aksi</th>
                <th className="p-3.5">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                    Tidak ada catatan aktivitas yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.userNama}</div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{log.userRole}</span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
