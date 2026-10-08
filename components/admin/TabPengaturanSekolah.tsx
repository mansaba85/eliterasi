'use client';

import React, { useState } from 'react';
import { SchoolSettings } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  Building2, Sparkles, Sliders, CheckCircle, Save, RotateCcw, 
  UserCheck, Shield, HelpCircle
} from 'lucide-react';

interface TabPengaturanSekolahProps {
  onSettingsSaved?: () => void;
}

export default function TabPengaturanSekolah({ onSettingsSaved }: TabPengaturanSekolahProps) {
  const currentSettings = LiteStore.getSchoolSettings();

  const [namaMadrasah, setNamaMadrasah] = useState(currentSettings.namaMadrasah);
  const [motto, setMotto] = useState(currentSettings.motto);
  const [alamat, setAlamat] = useState(currentSettings.alamat);
  const [telepon, setTelepon] = useState(currentSettings.telepon || '');
  const [email, setEmail] = useState(currentSettings.email || '');
  const [tahunAjaran, setTahunAjaran] = useState(currentSettings.tahunAjaran);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(currentSettings.semester);
  
  // Penandatangan
  const [kepalaMadrasahNama, setKepalaMadrasahNama] = useState(currentSettings.kepalaMadrasahNama);
  const [kepalaMadrasahNip, setKepalaMadrasahNip] = useState(currentSettings.kepalaMadrasahNip || '');
  const [koordinatorLiterasiNama, setKoordinatorLiterasiNama] = useState(currentSettings.koordinatorLiterasiNama);
  const [koordinatorLiterasiNip, setKoordinatorLiterasiNip] = useState(currentSettings.koordinatorLiterasiNip || '');

  // Bobot Poin
  const [poinKarya, setPoinKarya] = useState(currentSettings.poinSettings?.poinSetorKarya ?? 50);
  const [poinLike, setPoinLike] = useState(currentSettings.poinSettings?.poinSuka ?? 5);
  const [poinKomentar, setPoinKomentar] = useState(currentSettings.poinSettings?.poinKomentar ?? 10);
  const [poinBacaBuku, setPoinBacaBuku] = useState(currentSettings.poinSettings?.poinBukuMandiri ?? 30);
  const [multiplierNilaiGuru, setMultiplierNilaiGuru] = useState(currentSettings.poinSettings?.poinNilaiGuruMultiplier ?? 0.5);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Partial<SchoolSettings> = {
      namaMadrasah: namaMadrasah.trim(),
      motto: motto.trim(),
      alamat: alamat.trim(),
      telepon: telepon.trim(),
      email: email.trim(),
      tahunAjaran: tahunAjaran.trim(),
      semester,
      kepalaMadrasahNama: kepalaMadrasahNama.trim(),
      kepalaMadrasahNip: kepalaMadrasahNip.trim(),
      koordinatorLiterasiNama: koordinatorLiterasiNama.trim(),
      koordinatorLiterasiNip: koordinatorLiterasiNip.trim(),
      poinSettings: {
        poinSetorKarya: Number(poinKarya),
        poinSuka: Number(poinLike),
        poinKomentar: Number(poinKomentar),
        poinBukuMandiri: Number(poinBacaBuku),
        poinNilaiGuruMultiplier: Number(multiplierNilaiGuru)
      }
    };

    LiteStore.updateSchoolSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (onSettingsSaved) onSettingsSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#132257]" />
            Pengaturan Identitas & Branding Madrasah
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi profil resmi madrasah, tahun ajaran aktif, dan formula kalkulasi bobot poin literasi.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Pengaturan Berhasil Disimpan!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Profil & Branding Lembaga */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-indigo-700" />
              1. Identitas & Kontak Madrasah
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Resmi Madrasah</label>
              <input 
                type="text" 
                required
                value={namaMadrasah}
                onChange={(e) => setNamaMadrasah(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Motto Literasi Madrasah</label>
              <input 
                type="text" 
                required
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Misal: Membaca Membuka Cakrawala, Menulis Merawat Peradaban"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 italic"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea 
                rows={2}
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Telp / WA</label>
                <input 
                  type="text" 
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kalender & Pejabat Penandatangan */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              2. Tahun Ajaran & Pejabat Pengesah
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran Aktif</label>
                <input 
                  type="text" 
                  required
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  placeholder="2026/2027"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Aktif</label>
                <select 
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Madrasah</label>
                  <input 
                    type="text" 
                    required
                    value={kepalaMadrasahNama}
                    onChange={(e) => setKepalaMadrasahNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP Kepala Madrasah</label>
                  <input 
                    type="text" 
                    value={kepalaMadrasahNip}
                    onChange={(e) => setKepalaMadrasahNip(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Koordinator Literasi</label>
                  <input 
                    type="text" 
                    required
                    value={koordinatorLiterasiNama}
                    onChange={(e) => setKoordinatorLiterasiNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP Koordinator Literasi</label>
                  <input 
                    type="text" 
                    value={koordinatorLiterasiNip}
                    onChange={(e) => setKoordinatorLiterasiNip(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Konfigurasi Bobot Poin Otomatis */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-amber-600" />
            3. Konfigurasi Sistem Bobot Poin Gamifikasi Literasi
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Poin Setor Karya</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min={5}
                  max={200}
                  value={poinKarya}
                  onChange={(e) => setPoinKarya(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-center text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400">Diberikan saat siswa mempublikasikan tulisan.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Poin Baca Buku</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min={5}
                  max={100}
                  value={poinBacaBuku}
                  onChange={(e) => setPoinBacaBuku(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-center text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400">Diberikan saat menuntaskan 1 judul buku.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Poin Like Apresiasi</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min={1}
                  max={20}
                  value={poinLike}
                  onChange={(e) => setPoinLike(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-center text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400">Bonus setiap karya disukai pembaca.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Poin Komentar Diskusi</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min={1}
                  max={30}
                  value={poinKomentar}
                  onChange={(e) => setPoinKomentar(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-center text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400">Bonus memberikan tanggapan karya teman.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Multiplier Nilai Guru</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={multiplierNilaiGuru}
                  onChange={(e) => setMultiplierNilaiGuru(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-center text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">x Skor</span>
              </div>
              <p className="text-[10px] text-slate-400">Nilai 90 x 0.5 = +45 bonus poin bintang.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <button 
            type="submit"
            className="px-6 py-3 bg-[#132257] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Simpan Seluruh Konfigurasi Madrasah
          </button>
        </div>
      </form>
    </div>
  );
}
