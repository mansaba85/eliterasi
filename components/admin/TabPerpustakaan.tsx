'use client';

import React, { useState } from 'react';
import { LibraryBook } from '../../lib/types';
import { LiteStore } from '../../lib/store';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, CheckCircle, ExternalLink, 
  FileText, Bookmark, Star, Filter, Eye, X
} from 'lucide-react';

interface TabPerpustakaanProps {
  onLibraryUpdated?: () => void;
}

export default function TabPerpustakaan({ onLibraryUpdated }: TabPerpustakaanProps) {
  const libraryBooks = LiteStore.getLibraryBooks();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');

  // Form State Tambah/Edit
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [judul, setJudul] = useState('');
  const [penulis, setPenulis] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('2024');
  const [kategori, setKategori] = useState('Sastra & Fiksi');
  const [sinopsis, setSinopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isWajib, setIsWajib] = useState(false);
  const [halaman, setHalaman] = useState(150);

  // Modal Baca Buku
  const [activeReaderBook, setActiveReaderBook] = useState<LibraryBook | null>(null);

  const resetForm = () => {
    setEditingBook(null);
    setJudul('');
    setPenulis('');
    setPenerbit('');
    setTahunTerbit('2024');
    setKategori('Sastra & Fiksi');
    setSinopsis('');
    setCoverUrl('');
    setPdfUrl('');
    setIsWajib(false);
    setHalaman(150);
  };

  const handleEditClick = (book: LibraryBook) => {
    setEditingBook(book);
    setJudul(book.judul);
    setPenulis(book.penulis);
    setPenerbit(book.penerbit || '');
    setTahunTerbit(book.tahunTerbit || '2024');
    setKategori(book.kategori);
    setSinopsis(book.sinopsis);
    setCoverUrl(book.coverUrl || '');
    setPdfUrl(book.pdfUrl || '');
    setIsWajib(book.isWajib || false);
    setHalaman(book.jumlahHalaman || 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !penulis.trim()) return;

    if (editingBook) {
      LiteStore.updateLibraryBook(editingBook.id, {
        judul: judul.trim(),
        penulis: penulis.trim(),
        penerbit: penerbit.trim(),
        tahunTerbit: String(tahunTerbit),
        kategori,
        sinopsis: sinopsis.trim(),
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400',
        pdfUrl: pdfUrl.trim(),
        isWajib,
        jumlahHalaman: Number(halaman)
      });
      alert(`Buku "${judul}" berhasil diperbarui!`);
    } else {
      LiteStore.addLibraryBook({
        judul: judul.trim(),
        penulis: penulis.trim(),
        penerbit: penerbit.trim(),
        tahunTerbit: String(tahunTerbit),
        kategori,
        sinopsis: sinopsis.trim(),
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400',
        pdfUrl: pdfUrl.trim() || 'https://perpustakaan.kemenag.go.id',
        isWajib,
        jumlahHalaman: Number(halaman)
      });
      alert(`Buku baru "${judul}" berhasil ditambahkan ke katalog perpustakaan!`);
    }

    resetForm();
    if (onLibraryUpdated) onLibraryUpdated();
  };

  const handleDelete = (id: string, judulBuku: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${judulBuku}" dari katalog?`)) {
      LiteStore.deleteLibraryBook(id);
      if (onLibraryUpdated) onLibraryUpdated();
    }
  };

  const filteredBooks = libraryBooks.filter(book => {
    const matchSearch = 
      book.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.penulis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchKat = kategoriFilter === 'all' || book.kategori === kategoriFilter;
    return matchSearch && matchKat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            Manajemen Katalog Buku & E-Book Perpustakaan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar buku bacaan rekomendasi, novel inspiratif, kitab agama, dan bahan bacaan digital bagi seluruh siswa madrasah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
            📚 {libraryBooks.length} Judul Buku Terdaftar
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sisi Kiri: Form Tambah / Edit Buku */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              {editingBook ? <Edit3 className="w-4 h-4 text-blue-700" /> : <Plus className="w-4 h-4 text-emerald-700" />}
              {editingBook ? 'Edit Data Buku' : 'Tambah Judul Buku Baru'}
            </h4>
            {editingBook && (
              <button 
                type="button" 
                onClick={resetForm}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Judul Buku</label>
              <input 
                type="text" 
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misal: Laskar Pelangi, Filosofi Teras..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Penulis / Pengarang</label>
                <input 
                  type="text" 
                  required
                  value={penulis}
                  onChange={(e) => setPenulis(e.target.value)}
                  placeholder="Nama pengarang..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Genre</label>
                <select 
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium text-slate-800 outline-none"
                >
                  <option value="Sastra & Fiksi">Sastra & Fiksi</option>
                  <option value="Agama & Akhlak">Agama & Akhlak</option>
                  <option value="Pengembangan Diri">Pengembangan Diri</option>
                  <option value="Sains & Sejarah">Sains & Sejarah</option>
                  <option value="Cerpen & Puisi">Cerpen & Puisi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Penerbit</label>
                <input 
                  type="text" 
                  value={penerbit}
                  onChange={(e) => setPenerbit(e.target.value)}
                  placeholder="Misal: Bentang Pustaka"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahun & Tebal Hal.</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={tahunTerbit}
                    onChange={(e) => setTahunTerbit(e.target.value)}
                    className="w-1/2 px-2.5 py-2 border border-slate-200 rounded-xl text-xs outline-none"
                    placeholder="Tahun"
                  />
                  <input 
                    type="number" 
                    value={halaman}
                    onChange={(e) => setHalaman(Number(e.target.value))}
                    className="w-1/2 px-2.5 py-2 border border-slate-200 rounded-xl text-xs outline-none"
                    placeholder="Hal"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Sinopsis Ringkas</label>
              <textarea 
                rows={3}
                required
                value={sinopsis}
                onChange={(e) => setSinopsis(e.target.value)}
                placeholder="Ringkasan cerita atau gambaran isi buku yang menarik minat siswa..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">URL Gambar Sampul (Opsional)</label>
              <input 
                type="text" 
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none font-mono"
              />
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-emerald-950">Rekomendasi Wajib Literasi</span>
                <span className="text-[10px] text-emerald-700">Tandai buku ini sebagai bacaan prioritas</span>
              </div>
              <input 
                type="checkbox"
                checked={isWajib}
                onChange={(e) => setIsWajib(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {editingBook ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingBook ? 'Simpan Perubahan Buku' : 'Daftarkan Buku ke Katalog'}
            </button>
          </form>
        </div>

        {/* Sisi Kanan: Grid & List Buku */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Cari judul buku, penulis, atau genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
              />
            </div>

            <select 
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium text-slate-700 outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="Sastra & Fiksi">Sastra & Fiksi</option>
              <option value="Agama & Akhlak">Agama & Akhlak</option>
              <option value="Pengembangan Diri">Pengembangan Diri</option>
              <option value="Sains & Sejarah">Sains & Sejarah</option>
              <option value="Cerpen & Puisi">Cerpen & Puisi</option>
            </select>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-1">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex gap-3.5 items-start">
                <div className="w-16 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-xs relative">
                  <img 
                    src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400'} 
                    alt={book.judul}
                    className="w-full h-full object-cover"
                  />
                  {book.isWajib && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-extrabold px-1 rounded shadow-xs">
                      WAJIB
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {book.kategori}
                  </span>
                  <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{book.judul}</h5>
                  <p className="text-[11px] text-slate-500">Karya: {book.penulis}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{book.sinopsis}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {book.jumlahHalaman || 150} hlm • {book.dibacaCount || 0}x dibaca
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setActiveReaderBook(book)}
                        className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Baca Cuplikan E-Book"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleEditClick(book)}
                        className="p-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Buku"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleDelete(book.id, book.judul)}
                        className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Hapus Buku"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL BACA E-BOOK INTERAKTIF --- */}
      {activeReaderBook && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h4 className="font-extrabold text-sm">Pratinjau Bahan Bacaan E-Book Perpustakaan</h4>
              </div>
              <button 
                onClick={() => setActiveReaderBook(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-start">
                <img 
                  src={activeReaderBook.coverUrl} 
                  alt={activeReaderBook.judul}
                  className="w-24 h-36 object-cover rounded-xl border border-slate-200 shadow-md shrink-0"
                />
                <div className="space-y-1.5">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {activeReaderBook.kategori}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg">{activeReaderBook.judul}</h3>
                  <p className="text-xs text-slate-600 font-medium">Penulis: <strong>{activeReaderBook.penulis}</strong></p>
                  <p className="text-xs text-slate-500">Penerbit: {activeReaderBook.penerbit || '-'} ({activeReaderBook.tahunTerbit || 2024})</p>
                  <p className="text-xs text-slate-500">Jumlah Halaman: {activeReaderBook.jumlahHalaman || 150} halaman</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Sinopsis & Ringkasan Bacaan</h5>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{activeReaderBook.sinopsis}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Tersedia di Perpustakaan Madrasah & Layanan E-Perpus Kemenag RI
                </span>

                <button 
                  onClick={() => setActiveReaderBook(null)}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Selesai Membaca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
