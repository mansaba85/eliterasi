'use client';

import React, { useState } from 'react';
import { User, CertificateRecord } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  Award, Plus, Printer, Trash2, Search, CheckCircle, Eye, 
  Sparkles, Calendar, UserCheck, ShieldCheck, X, Download
} from 'lucide-react';

interface TabSertifikatProps {
  users: User[];
  onCertificateCreated?: () => void;
}

export default function TabSertifikat({ users, onCertificateCreated }: TabSertifikatProps) {
  const schoolSettings = LiteStore.getSchoolSettings();
  const certificates = LiteStore.getCertificates();
  const students = users.filter(u => u.role === 'siswa');

  // Form State
  const [selectedUserId, setSelectedUserId] = useState(students[0]?.id || '');
  const [nomorSertifikat, setNomorSertifikat] = useState('049/MA.NU.01/LIT/2026');
  const [judulPenghargaan, setJudulPenghargaan] = useState('Duta Literasi Madrasah');
  const [predikat, setPredikat] = useState('Predikat Sangat Memuaskan (Cum Laude Literasi)');
  const [kategori, setKategori] = useState<CertificateRecord['kategori']>('duta_literasi');
  const [deskripsi, setDeskripsi] = useState('Atas dedikasi, konsistensi membaca buku perpustakaan, dan karya tulis inspiratif sepanjang semester aktif.');
  const [tanggalTerbit, setTanggalTerbit] = useState(new Date().toISOString().split('T')[0]);

  // Modal Preview Certificate
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.id === selectedUserId);
    if (!targetStudent) return;

    const newCert = LiteStore.createCertificate({
      nomorSertifikat: nomorSertifikat.trim(),
      userId: targetStudent.id,
      namaPenerima: targetStudent.nama,
      nisPenerima: targetStudent.nis || '-',
      kelasPenerima: targetStudent.kelasNama || '-',
      judulPenghargaan: judulPenghargaan.trim(),
      predikat: predikat.trim(),
      kategori,
      catatanApresiasi: deskripsi.trim(),
      tanggalTerbit,
      kepalaMadrasahNama: schoolSettings.kepalaMadrasahNama,
      kepalaMadrasahNip: schoolSettings.kepalaMadrasahNip
    });

    alert(`Piagam Penghargaan untuk ${targetStudent.nama} berhasil diterbitkan dan +100 bonus poin bintang ditambahkan!`);
    const nextSeq = String(certificates.length + 50).padStart(3, '0');
    setNomorSertifikat(`${nextSeq}/MA.NU.01/LIT/2026`);
    setPreviewCert(newCert);
    if (onCertificateCreated) onCertificateCreated();
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus data sertifikat untuk ${nama}?`)) {
      LiteStore.deleteCertificate(id);
      if (onCertificateCreated) onCertificateCreated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Manajemen Sertifikat & Penghargaan Literasi
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Terbitkan piagam penghargaan digital resmi berstandar madrasah untuk Duta Literasi, Juara Menulis, dan Siswa Berprestasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Total Diterbitkan: {certificates.length} Piagam
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sisi Kiri: Form Terbitkan Sertifikat */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-amber-600" /> Terbitkan Piagam Baru
          </h4>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Siswa Penerima</label>
              <select 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800 outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelasNama || '-'} • ⭐ {s.poin} Poin)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Piagam Resmi</label>
              <input 
                type="text" 
                required
                value={nomorSertifikat}
                onChange={(e) => setNomorSertifikat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Penghargaan</label>
              <select 
                value={kategori}
                onChange={(e) => setKategori(e.target.value as CertificateRecord['kategori'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800 outline-none"
              >
                <option value="duta_literasi">👑 Duta Literasi Madrasah</option>
                <option value="penulis_terbaik">✍️ Penulis Terbaik / Terfavorit</option>
                <option value="pembaca_teraktif">📚 Pembaca Buku Teraktif</option>
                <option value="karya_kreatif">🎨 Karya Kreatif & Inspiratif</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Judul Piagam Penghargaan</label>
              <input 
                type="text" 
                required
                value={judulPenghargaan}
                onChange={(e) => setJudulPenghargaan(e.target.value)}
                placeholder="Misal: Siswa Teraktif Minggu Literasi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Predikat Keberhasilan</label>
              <input 
                type="text" 
                required
                value={predikat}
                onChange={(e) => setPredikat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Teks Apresiasi</label>
              <textarea 
                rows={2}
                required
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Ditetapkan</label>
              <input 
                type="date" 
                required
                value={tanggalTerbit}
                onChange={(e) => setTanggalTerbit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none font-sans"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" /> Terbitkan & Beri +100 Poin
            </button>
          </form>
        </div>

        {/* Sisi Kanan: Daftar Riwayat Sertifikat */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              Daftar Piagam Sertifikat Diterbitkan ({certificates.length})
            </h4>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {certificates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">
                Belum ada piagam sertifikat yang diterbitkan.
              </div>
            ) : (
              certificates.map(cert => (
                <div key={cert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded">
                        No: {cert.nomorSertifikat}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(cert.tanggalTerbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm">{cert.namaPenerima} ({cert.kelasPenerima})</h5>
                    <p className="text-xs text-amber-800 font-bold">{cert.judulPenghargaan} — <span className="text-slate-600 font-normal">{cert.predikat}</span></p>
                    <p className="text-[11px] text-slate-500 italic">{cert.catatanApresiasi}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => setPreviewCert(cert)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Pratinjau & Cetak
                    </button>

                    <button 
                      onClick={() => handleDelete(cert.id, cert.namaPenerima)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Sertifikat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL PRATINJAU PIAGAM DIGITAL MEWAH (READY TO PRINT) --- */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Top Toolbar */}
            <div className="bg-[#132257] text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">Piagam Penghargaan Literasi Madrasah</h4>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Cetak Piagam (Print / PDF)
                </button>
                <button 
                  onClick={() => setPreviewCert(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Template Canvas */}
            <div className="p-8 sm:p-14 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/30 text-slate-900 border-8 border-double border-amber-700/80 m-4 rounded-2xl relative overflow-hidden font-serif">
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <div className="w-96 h-96 rounded-full border-12 border-amber-900 flex items-center justify-center text-8xl font-bold font-sans">
                  MA NU
                </div>
              </div>

              <div className="text-center space-y-6 relative z-10">
                {/* Header Kop */}
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">
                    LEMBAGA PENDIDIKAN MA&apos;ARIF NU KABUPATEN BATANG
                  </p>
                  <h3 className="text-xl sm:text-2xl font-extrabold uppercase text-slate-950 tracking-wider">
                    {schoolSettings.namaMadrasah}
                  </h3>
                  <div className="w-32 h-0.5 bg-amber-600 mx-auto my-2"></div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide text-amber-900 uppercase pt-2">
                    PIAGAM PENGHARGAAN
                  </h2>
                  <p className="text-xs font-mono text-slate-600">
                    Nomor: {previewCert.nomorSertifikat}
                  </p>
                </div>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm font-sans text-slate-700 max-w-xl mx-auto">
                  Diberikan kepada peserta didik berprestasi:
                </p>

                {/* Recipient Name */}
                <div className="py-2">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#132257] tracking-tight underline decoration-amber-500 decoration-2 underline-offset-8">
                    {previewCert.namaPenerima}
                  </h1>
                  <p className="text-xs font-sans text-slate-600 mt-3 font-semibold">
                    NIS: {previewCert.nisPenerima} • Kelas: {previewCert.kelasPenerima}
                  </p>
                </div>

                {/* Award Title & Description */}
                <div className="max-w-xl mx-auto space-y-2 font-sans">
                  <div className="inline-block bg-amber-100/80 border border-amber-300 px-5 py-1.5 rounded-full text-amber-950 font-bold text-sm sm:text-base">
                    🏆 {previewCert.judulPenghargaan}
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed pt-1">
                    {previewCert.catatanApresiasi}
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {previewCert.predikat}
                  </p>
                </div>

                {/* Signatures & Seal */}
                <div className="grid grid-cols-2 pt-10 font-sans text-xs items-end">
                  <div className="text-center space-y-1">
                    <div className="w-20 h-20 border-2 border-dashed border-amber-600/50 rounded-xl mx-auto flex items-center justify-center text-[10px] text-amber-800 font-mono">
                      [QR VERIFIKASI]
                    </div>
                    <p className="text-[10px] text-slate-400">Verifikasi Keaslian Dokumen</p>
                  </div>

                  <div className="text-center space-y-12">
                    <p>
                      Banyuputih, {new Date(previewCert.tanggalTerbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                      <strong>Kepala Madrasah</strong>
                    </p>
                    <div>
                      <p className="font-extrabold underline text-slate-950 text-sm">{previewCert.kepalaMadrasahNama}</p>
                      <p className="text-[11px] text-slate-500 font-mono">NIP: {previewCert.kepalaMadrasahNip || '-'}</p>
                    </div>
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
