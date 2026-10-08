'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { User, Post, Category, Challenge, ReadingBook, MingguLiterasiPeriod, Class } from '../lib/types';
import { 
  PenTool, BookOpen, Bookmark, Trophy, Calendar, Sparkles, Send, 
  Trash, Eye, AlertCircle, CheckCircle, Plus, BookOpenCheck, ChevronRight, ListPlus, X,
  Heart, MessageSquare, ArrowLeft, Search, Filter, Users
} from 'lucide-react';
import ModalDetailPost from './ModalDetailPost';

interface DashboardSiswaProps {
  currentUser: User;
  posts: Post[];
  categories: Category[];
  challenges: Challenge[];
  readingBooks: ReadingBook[];
  activePeriod: MingguLiterasiPeriod | null;
  activeTab: string;
  users?: User[];
  classes?: Class[];
  onNavigateTab?: (tab: string) => void;
  onPostCreated: (data: any) => void;
  onPostUpdated: (id: string, updates: any) => void;
  onPostDeleted: (id: string) => void;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string, commentText: string) => void;
  onReact?: (postId: string, reactionType: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif') => void;
  onGrade?: (postId: string, score: number, feedback: string) => void;
  onJoinChallenge: (challengeId: string) => void;
  onAddReadingBook: (book: any) => void;
  onUpdateBookStatus: (id: string, status: any) => void;
  onDeleteBook: (id: string) => void;
}

export default function DashboardSiswa({
  currentUser,
  posts,
  categories,
  challenges,
  readingBooks,
  activePeriod,
  activeTab,
  users = [],
  classes = [],
  onNavigateTab,
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
  onLike,
  onBookmark,
  onComment,
  onReact,
  onGrade,
  onJoinChallenge,
  onAddReadingBook,
  onUpdateBookStatus,
  onDeleteBook,
}: DashboardSiswaProps) {
  // --- STATE UNTUK EDITOR ---
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [kategoriId, setKategoriId] = useState(categories[0]?.id || '');
  const [visibilitas, setVisibilitas] = useState<'publik' | 'privat'>('publik');
  const [coverImage, setCoverImage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isMingguLiterasi, setIsMingguLiterasi] = useState(false);
  const [isEditMode, setIsEditMode] = useState<string | null>(null); // Menyimpan ID post jika sedang edit
  const [selectedDetailPost, setSelectedDetailPost] = useState<Post | null>(null);

  // Drag and Drop State for File Upload
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        alert('File yang diunggah harus berupa gambar!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('File yang diunggah harus berupa gambar!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Assistant State
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiFeedback, setShowAiFeedback] = useState(false);

  // Kata Counter
  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const wordCount = countWords(isi);
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 150));

  // --- STATE UNTUK READING LIST ---
  const [judulBuku, setJudulBuku] = useState('');
  const [pengarang, setPengarang] = useState('');
  const [genre, setGenre] = useState('');
  const [statusBaca, setStatusBaca] = useState<'sedang' | 'sudah' | 'rencana'>('rencana');
  const [sinopsis, setSinopsis] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);

  // --- SUB-TABS UNTUK KOLEKSI SAYA ---
  const [subTabKoleksi, setSubTabKoleksi] = useState<'karya' | 'bookmark' | 'reading'>('karya');
  const [weeklySubTab, setWeeklySubTab] = useState<'masuk' | 'rekap' | 'riwayat'>('masuk');

  // --- STATE REKAP DRILL-DOWN PER KELAS ---
  const [selectedClassDetail, setSelectedClassDetail] = useState<string | null>(null);
  const [searchClassQuery, setSearchClassQuery] = useState('');
  const [searchStudentInClassQuery, setSearchStudentInClassQuery] = useState('');
  const [rekapStudentFilter, setRekapStudentFilter] = useState<'all' | 'sudah' | 'belum'>('all');

  // Load editor data if in edit mode
  const handleEditPost = (post: Post) => {
    setIsEditMode(post.id);
    setJudul(post.judul);
    setIsi(post.isi);
    setKategoriId(post.kategoriId);
    setVisibilitas(post.visibilitas);
    setCoverImage(post.coverImage || '');
    setTagInput(post.tags.join(', '));
    setIsMingguLiterasi(post.isMingguLiterasi);
  };

  const handleResetEditor = () => {
    setIsEditMode(null);
    setJudul('');
    setIsi('');
    setKategoriId(categories[0]?.id || '');
    setVisibilitas('publik');
    setCoverImage('');
    setTagInput('');
    setIsMingguLiterasi(false);
    setAiResponse('');
    setShowAiFeedback(false);
  };

  // Auto-Save draft simulation (setiap kali menulis, simpan ke localStorage sebagai draft-temp)
  useEffect(() => {
    if (isi.trim() && !isEditMode) {
      const draftTemp = { judul, isi, kategoriId, visibilitas, coverImage, tagInput, isMingguLiterasi };
      localStorage.setItem(`draft_temp_${currentUser.id}`, JSON.stringify(draftTemp));
    }
  }, [judul, isi, kategoriId, visibilitas, coverImage, tagInput, isMingguLiterasi, isEditMode, currentUser.id]);

  // Load draft temp if exists on mount
  useEffect(() => {
    if (activeTab === 'tulis' && !isEditMode) {
      const saved = localStorage.getItem(`draft_temp_${currentUser.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultCatId = categories[0]?.id || '';
          // Beri konfirmasi opsional atau load saja langsung
          const timer = setTimeout(() => {
            setJudul(parsed.judul || '');
            setIsi(parsed.isi || '');
            setKategoriId(parsed.kategoriId || defaultCatId);
            setVisibilitas(parsed.visibilitas || 'publik');
            setCoverImage(parsed.coverImage || '');
            setTagInput(parsed.tagInput || '');
            setIsMingguLiterasi(parsed.isMingguLiterasi || false);
          }, 0);
          return () => clearTimeout(timer);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [activeTab, isEditMode, currentUser.id, categories]);

  const handlePublishPost = (status: 'published' | 'draft') => {
    if (!judul.trim() || !isi.trim()) {
      alert('Judul dan isi tulisan tidak boleh kosong!');
      return;
    }

    const tags = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const postData = {
      judul: judul.trim(),
      isi: isi.trim(),
      kategoriId,
      authorId: currentUser.id,
      authorNama: currentUser.nama,
      authorKelas: currentUser.kelasNama,
      isMingguLiterasi: activePeriod ? isMingguLiterasi : false,
      periodeId: isMingguLiterasi && activePeriod ? activePeriod.id : undefined,
      visibilitas,
      status,
      coverImage: coverImage.trim() || undefined,
      tags
    };

    if (isEditMode) {
      onPostUpdated(isEditMode, postData);
      alert(`Karya berhasil ${status === 'published' ? 'diperbarui dan dipublikasikan!' : 'disimpan sebagai draft!'}`);
    } else {
      onPostCreated(postData);
      alert(`Karya baru berhasil ${status === 'published' ? 'dipublikasikan! Kamu mendapat poin reward.' : 'disimpan sebagai draft!'}`);
    }

    // Hapus draft temp
    localStorage.removeItem(`draft_temp_${currentUser.id}`);
    handleResetEditor();
  };

  const handleAskAI = async () => {
    if (!isi.trim() || isi.trim().length < 10) {
      alert('Tuliskan beberapa kalimat terlebih dahulu sebelum bertanya pada AI.');
      return;
    }

    setIsAiLoading(true);
    setShowAiFeedback(true);
    setAiResponse('Asisten AI sedang menganalisis karya tulisanmu, silakan tunggu sebentar...');

    try {
      const selectedCategory = categories.find(c => c.id === kategoriId)?.nama || 'Literasi';
      const response = await fetch('/app/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          isi,
          kategori: selectedCategory
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAiResponse(data.text);
      } else {
        setAiResponse(`Gagal mendapatkan analisis AI: ${data.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch (err: any) {
      setAiResponse(`Terjadi masalah koneksi ke server AI: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Helper formatting bantuan markdown
  const handleInsertFormat = (tag: string) => {
    if (tag === 'bold') setIsi(prev => prev + ' **Tebal** ');
    else if (tag === 'italic') setIsi(prev => prev + ' *Miring* ');
    else if (tag === 'heading') setIsi(prev => prev + '\n### Subjudul\n');
    else if (tag === 'quote') setIsi(prev => prev + '\n> Kalimat kutipan indah...\n');
    else if (tag === 'list') setIsi(prev => prev + '\n- Item daftar kesatu\n- Item daftar kedua\n');
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulBuku.trim() || !pengarang.trim()) return;

    onAddReadingBook({
      userId: currentUser.id,
      judulBuku: judulBuku.trim(),
      pengarang: pengarang.trim(),
      genre: genre.trim() || 'Umum',
      statusBaca,
      sinopsis: sinopsis.trim() || undefined
    });

    setJudulBuku('');
    setPengarang('');
    setGenre('');
    setStatusBaca('rencana');
    setSinopsis('');
    setShowAddBook(false);
    alert('Buku berhasil ditambahkan ke Reading List! Kamu mendapatkan bonus 5 poin.');
  };

  // Filter-filter data untuk tab-tab siswa
  const myPosts = posts.filter(p => p.authorId === currentUser.id);
  const myDrafts = myPosts.filter(p => p.status === 'draft');
  const myPublished = myPosts.filter(p => p.status === 'published');
  const myReadingBooks = readingBooks.filter(b => b.userId === currentUser.id);
  const bookmarkedPosts = posts.filter(p => p.id && (p.bookmarks?.includes(currentUser.id) || p.likes.includes(currentUser.id)));

  // --- LOGIKA REKAP KEPATUHAN BERJENJANG (UNTUK SKALABILITAS KELAS/MADRASAH) ---
  // Ekstrak daftar seluruh kelas unik dari classes atau users
  const allAvailableClasses = React.useMemo(() => {
    const map = new Map<string, { id: string; nama: string; tingkat?: string }>();
    classes.forEach(c => {
      map.set(c.id, { id: c.id, nama: c.namaKelas, tingkat: c.tingkat });
    });
    users.forEach(u => {
      if (u.kelasId && u.kelasNama && !map.has(u.kelasId)) {
        map.set(u.kelasId, { id: u.kelasId, nama: u.kelasNama });
      }
    });
    // Jika tidak ada data classes dari backend, buat fallback kelas umum MA NU 01 Banyuputih
    if (map.size === 0) {
      ['XII IPA 1', 'XI IPA 1', 'XI IPS 1', 'XII IPA 2', 'X IPA 3'].forEach((k, idx) => {
        map.set(`cls-${idx + 1}`, { id: `cls-${idx + 1}`, nama: k });
      });
    }
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [classes, users]);

  // Statistik per kelas untuk Agenda Literasi yang aktif
  const classSummaryStats = React.useMemo(() => {
    return allAvailableClasses.map(cls => {
      // Dapatkan siswa di kelas ini
      const studentsInClass = users.filter(u => 
        u.role === 'siswa' && (u.kelasId === cls.id || u.kelasNama === cls.nama)
      );

      // Cari karya siswa di periode literasi ini
      let submittedCount = 0;
      let gradedCount = 0;
      studentsInClass.forEach(std => {
        const hasSubmitted = posts.some(p => 
          p.authorId === std.id && 
          p.isMingguLiterasi && 
          (activePeriod ? p.periodeId === activePeriod.id : true) && 
          p.status === 'published'
        );
        if (hasSubmitted) {
          submittedCount++;
          const isGraded = posts.some(p => 
            p.authorId === std.id && 
            p.isMingguLiterasi && 
            p.grade && 
            p.status === 'published'
          );
          if (isGraded) gradedCount++;
        }
      });

      const totalSiswa = Math.max(studentsInClass.length, 1);
      const persentase = Math.round((submittedCount / totalSiswa) * 100);

      return {
        ...cls,
        totalSiswa: studentsInClass.length,
        submittedCount,
        unsubmittedCount: Math.max(0, studentsInClass.length - submittedCount),
        gradedCount,
        persentase,
        isUserClass: currentUser.kelasId === cls.id || currentUser.kelasNama === cls.nama
      };
    });
  }, [allAvailableClasses, users, posts, activePeriod, currentUser]);

  // Siswa di kelas yang sedang dipilih untuk detail drill-down
  const activeClassDetailObj = React.useMemo(() => {
    if (!selectedClassDetail) return null;
    return allAvailableClasses.find(c => c.id === selectedClassDetail) || null;
  }, [selectedClassDetail, allAvailableClasses]);

  const activeClassStudents = React.useMemo(() => {
    if (!selectedClassDetail || !activeClassDetailObj) return [];
    const studentsInClass = users.filter(u => 
      u.role === 'siswa' && (u.kelasId === activeClassDetailObj.id || u.kelasNama === activeClassDetailObj.nama)
    );

    return studentsInClass.map(std => {
      const studentPost = posts.find(p => 
        p.authorId === std.id && 
        p.isMingguLiterasi && 
        (activePeriod ? p.periodeId === activePeriod.id : true) && 
        p.status === 'published'
      );

      return {
        id: std.id,
        nama: std.nama,
        nis: std.nis || '-',
        submitted: Boolean(studentPost),
        post: studentPost,
        isCurrentUser: std.id === currentUser.id
      };
    });
  }, [selectedClassDetail, activeClassDetailObj, users, posts, activePeriod, currentUser]);

  // Filter siswa di kelas terpilih
  const visibleClassStudents = React.useMemo(() => {
    return activeClassStudents.filter(item => {
      if (rekapStudentFilter === 'sudah' && !item.submitted) return false;
      if (rekapStudentFilter === 'belum' && item.submitted) return false;
      if (searchStudentInClassQuery.trim()) {
        const q = searchStudentInClassQuery.toLowerCase().trim();
        const matchNama = item.nama.toLowerCase().includes(q);
        const matchNis = item.nis.toLowerCase().includes(q);
        const matchJudul = item.post?.judul.toLowerCase().includes(q) || false;
        return matchNama || matchNis || matchJudul;
      }
      return true;
    });
  }, [activeClassStudents, rekapStudentFilter, searchStudentInClassQuery]);

  return (
    <div className="space-y-6">
      {/* 1. TAB TULIS KARYA (EDITOR) */}
      {activeTab === 'tulis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Form Editor */}
          <div className={`${showAiFeedback ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs transition-all duration-300`}>
            {/* Judul Tab */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit Karya Literasi' : 'Tulis Karya Baru'}</h2>
                  <p className="text-xs text-slate-400">Salurkan ide dan imajinasimu ke dalam untaian tulisan yang rapi.</p>
                </div>
              </div>

              {isEditMode && (
                <button 
                  onClick={handleResetEditor}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {/* Banner Agenda Literasi jika sedang aktif */}
            {activePeriod && (
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-4 md:p-5 mb-6 flex flex-col gap-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-xs">
                      📅
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-orange-950 text-xs sm:text-sm">
                          {activePeriod.nama}
                        </h4>
                        <span className="bg-orange-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                          SEDANG BERLANGSUNG
                        </span>
                      </div>
                      <p className="text-xs text-orange-800 leading-relaxed mt-0.5">
                        Apakah karya yang sedang kamu tulis ini untuk memenuhi <strong>agenda literasi wajib madrasah hari ini</strong>?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsMingguLiterasi(true);
                        if (activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas') {
                          setKategoriId(activePeriod.kategoriIdWajib);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${isMingguLiterasi ? 'bg-orange-800 text-white border-orange-900 shadow-xs' : 'bg-white hover:bg-orange-100/70 text-orange-900 border-orange-200'}`}
                    >
                      ✓ Ya, Setorkan untuk Agenda Hari Ini
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsMingguLiterasi(false)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${!isMingguLiterasi ? 'bg-slate-800 text-white border-slate-950 shadow-xs' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      Bukan, Tulisan Bebas
                    </button>
                  </div>
                </div>

                {/* Petunjuk & Arahan Jenis Tulisan dari Admin/Madrasah */}
                <div className="bg-white/80 border border-orange-200/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-orange-950">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-orange-900">
                        🎯 Jenis Tulisan Ditugaskan:
                      </span>
                      {activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas' ? (
                        <span className="bg-orange-100 text-orange-900 font-extrabold px-2.5 py-0.5 rounded-lg border border-orange-300">
                          {activePeriod.kategoriNamaWajib || 'Kategori Tertentu'}
                        </span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-900 font-extrabold px-2.5 py-0.5 rounded-lg border border-indigo-200">
                          ✨ Bebas / Pilihan Siswa
                        </span>
                      )}
                      {activePeriod.izinkanBebas && (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                          💡 Murid Boleh Menulis Bebas
                        </span>
                      )}
                    </div>
                    {activePeriod.temaInstruksi && (
                      <p className="text-[11px] text-orange-900 font-medium leading-relaxed">
                        📌 <strong>Arahan:</strong> &ldquo;{activePeriod.temaInstruksi}&rdquo;
                      </p>
                    )}
                  </div>
                  {activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas' && isMingguLiterasi && (
                    <button
                      type="button"
                      onClick={() => setKategoriId(activePeriod.kategoriIdWajib!)}
                      className="text-[11px] font-bold text-orange-800 hover:text-orange-950 underline shrink-0 cursor-pointer"
                    >
                      Terapkan Kategori &ldquo;{activePeriod.kategoriNamaWajib}&rdquo;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form Editor - Studio Penulisan Kreatif */}
            <div className="space-y-4">
              {/* Kategori Selector Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Pilih Jenis Karya</label>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar py-1">
                  {categories.map(cat => {
                    const isSelected = kategoriId === cat.id;
                    const isTasked = isMingguLiterasi && activePeriod?.kategoriIdWajib === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setKategoriId(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#111c44] text-white shadow-2xs font-semibold' 
                            : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/50'
                        }`}
                      >
                        <span>{cat.ikon}</span>
                        <span>{cat.nama}</span>
                        {isTasked && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Judul Karya (Clean Minimalist Input) */}
              <div>
                <input 
                  type="text" 
                  maxLength={100}
                  required
                  placeholder="Tulis judul karya atau ceritamu di sini..."
                  value={judul} 
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200/80 focus:border-[#111c44] focus:ring-2 focus:ring-[#111c44]/10 rounded-2xl text-base sm:text-lg font-bold placeholder:text-slate-300 placeholder:font-normal outline-none transition-all shadow-xs"
                />
              </div>

              {/* Cover Image Upload & Tag */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gambar Cover (Opsional)</label>
                  
                  {!coverImage ? (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[110px] ${dragActive ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'}`}
                    >
                      <input 
                        type="file"
                        id="cover-upload"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-xl mb-1">📸</span>
                      <p className="text-xs font-bold text-slate-700 leading-tight">Seret & lepas gambar atau klik untuk memilih</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Format: JPG, PNG, WEBP (Maks. 2MB)</p>
                    </div>
                  ) : (
                    <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center gap-3.5 min-h-[110px]">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-white">
                        <Image 
                          src={coverImage} 
                          alt="Cover preview" 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 leading-normal">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">Gambar Berhasil Dimuat</p>
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span>✓ Ready to publish</span>
                        </p>
                        <button 
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="mt-1.5 text-[10px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                        >
                          Hapus & Ganti Gambar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tag (Pisahkan dengan koma)</label>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="puisi, sastra, lingkungan, sejarah"
                      value={tagInput} 
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition-all"
                    />
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Tambahkan tag/label relevan agar karya tulisan literasimu mudah ditemukan oleh teman sekelas dan guru pembimbing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toolbar Pembantu Sederhana */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs">
                <span className="text-slate-400 font-semibold px-2 border-r border-slate-200 select-none text-[10px] uppercase tracking-wider">Format</span>
                <button type="button" onClick={() => handleInsertFormat('bold')} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 font-bold">B</button>
                <button type="button" onClick={() => handleInsertFormat('italic')} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 italic">I</button>
                <button type="button" onClick={() => handleInsertFormat('heading')} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 font-semibold">H3</button>
                <button type="button" onClick={() => handleInsertFormat('quote')} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 font-serif">❝ Quote</button>
                <button type="button" onClick={() => handleInsertFormat('list')} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600">• List</button>
                
                <span className="ml-auto flex items-center gap-3 text-slate-400 text-[10px] uppercase font-semibold select-none pr-2">
                  <span>{wordCount} Kata</span>
                  <span>{readTimeEst} mnt baca</span>
                </span>
              </div>

              {/* Teks Area Utama */}
              <div>
                <textarea 
                  required
                  rows={13}
                  placeholder="Tuangkan kisah, puisi, pemikiran, atau pengalaman membacamu di sini..."
                  value={isi} 
                  onChange={(e) => setIsi(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-slate-200/80 focus:border-[#111c44] focus:ring-2 focus:ring-[#111c44]/10 rounded-2xl text-sm sm:text-base leading-relaxed transition-all shadow-xs font-serif placeholder:font-sans placeholder:text-slate-300 outline-none"
                />
              </div>

              {/* Pengaturan Visibilitas & Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">Visibilitas:</span>
                  <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-full text-xs">
                    <button 
                      type="button"
                      onClick={() => setVisibilitas('publik')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${visibilitas === 'publik' ? 'bg-[#111c44] text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Publik
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVisibilitas('privat')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${visibilitas === 'privat' ? 'bg-[#111c44] text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                      title="Hanya kamu dan guru penilai yang bisa melihat"
                    >
                      Privat
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    type="button"
                    onClick={handleAskAI}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-full border border-indigo-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Minta saran evaluasi, tata bahasa, dan pengembangan dari Gemini AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Evaluasi AI</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handlePublishPost('draft')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-full transition-colors cursor-pointer"
                  >
                    Simpan Draft
                  </button>

                  <button 
                    type="button"
                    onClick={() => handlePublishPost('published')}
                    className="px-5 py-2 bg-[#111c44] hover:bg-[#1a2b68] text-white font-semibold text-xs rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publikasikan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Panel AI Assistant Feedback */}
          {showAiFeedback && (
            <div className="lg:col-span-4 bg-gradient-to-b from-indigo-50/50 to-indigo-100/20 border border-indigo-100/60 rounded-2xl p-5 flex flex-col justify-between max-h-[85vh] overflow-hidden sticky top-6">
              <div>
                <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3 mb-4">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-sm">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-700 animate-pulse" />
                    <span>Evaluasi Literasi AI</span>
                  </div>
                  <button 
                    onClick={() => setShowAiFeedback(false)} 
                    className="p-1 rounded-full hover:bg-indigo-100/50 text-indigo-500 hover:text-indigo-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-indigo-800 bg-white/80 border border-indigo-100 rounded-xl p-3 mb-4 leading-normal">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Bagaimana asisten AI membantu?
                  </p>
                  Asisten AI membaca rancangan tulisanmu di kiri, lalu memberikan saran diksi, ejaan, struktur, serta apresiasi hangat untuk merangsang kreativitas belajarmu!
                </div>

                {/* Response Area */}
                <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-3 font-sans text-xs text-slate-700 leading-relaxed bg-white rounded-xl border border-indigo-100/50 p-4 shadow-inner whitespace-pre-line">
                  {aiResponse}
                </div>
              </div>

              {isAiLoading && (
                <div className="mt-4 text-center text-xs font-semibold text-indigo-900 flex items-center justify-center gap-2 bg-indigo-100/50 py-2.5 rounded-xl border border-indigo-200">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Gemini AI sedang berpikir kreatif...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. TAB BOOKMARK & READING LIST */}
      {activeTab === 'bookmark' && (
        <div className="space-y-6">
          {/* Header Sub Tab */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 p-1.5 rounded-xl max-w-md">
            <button 
              onClick={() => setSubTabKoleksi('karya')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${subTabKoleksi === 'karya' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Karya Saya
            </button>
            <button 
              onClick={() => setSubTabKoleksi('bookmark')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${subTabKoleksi === 'bookmark' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Bookmark Koleksi
            </button>
            <button 
              onClick={() => setSubTabKoleksi('reading')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${subTabKoleksi === 'reading' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Reading List
            </button>
          </div>

          {/* Sub-tab 2a: Karya Saya */}
          {subTabKoleksi === 'karya' && (
            <div className="space-y-6">
              {/* Drafts */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  📝 Draft Tersimpan ({myDrafts.length})
                </h3>
                {myDrafts.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-xl p-6 text-center text-xs text-slate-400">
                    Tidak ada draft. Semua tulisanmu sudah dipublikasikan!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myDrafts.map(draft => (
                      <div key={draft.id} className="bg-white rounded-xl border border-dashed border-slate-200 p-4 hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">DRAFT</span>
                          <span className="text-[10px] text-slate-400">Terakhir disimpan: {new Date(draft.updatedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{draft.judul}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-normal">{draft.isi}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={() => onPostDeleted(draft.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1.5 hover:bg-rose-50 rounded"
                          >
                            Hapus
                          </button>
                          <button 
                            onClick={() => handleEditPost(draft)}
                            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Edit & Lanjutkan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Published Posts */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  🚀 Karya Dipublikasikan ({myPublished.length})
                </h3>
                {myPublished.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                    <PenTool className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-500">Belum ada karya publik.</p>
                    <p className="text-[10px] mt-0.5">Mulai goreskan tulisan pertamamu di tab Tulis Karya!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPublished.map(post => (
                      <div key={post.id} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">PUBLIK</span>
                            <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{post.judul}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-normal">{post.isi}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>❤️ {post.likes.length} Likes</span>
                            <span>💬 {post.comments.length} Komentar</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => onPostDeleted(post.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1.5 hover:bg-rose-50 rounded"
                            >
                              Hapus
                            </button>
                            <button 
                              onClick={() => handleEditPost(post)}
                              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-lg"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab 2b: Bookmark Koleksi */}
          {subTabKoleksi === 'bookmark' && (
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">🔖 Koleksi Karya Tersimpan ({bookmarkedPosts.length})</h3>
              {bookmarkedPosts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <Bookmark className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-500">Koleksi bookmark kosong.</p>
                  <p className="text-[10px] mt-0.5">Sukai/Bookmark tulisan teman-teman di beranda agar tersimpan di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">{post.authorNama}</span>
                        <span className="text-[10px] text-slate-400">Kelas {post.authorKelas}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{post.judul}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{post.isi}</p>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <span className="text-[10px] text-slate-400">{post.jumlahKata} kata • {Math.max(1, Math.ceil(post.jumlahKata/150))} mnt baca</span>
                        <span className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer">Baca Kembali →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2c: Reading List */}
          {subTabKoleksi === 'reading' && (
            <div className="space-y-6">
              {/* Header Box & Tombol Tambah */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">📚 Reading List (Koleksi Buku Referensi)</h3>
                  <p className="text-xs text-slate-400">Catat dan pantau buku-buku apa saja yang sudah atau sedang kamu baca untuk inspirasi menulis resensi.</p>
                </div>
                <button 
                  onClick={() => setShowAddBook(!showAddBook)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ListPlus className="w-4 h-4" />
                  Tambah Buku
                </button>
              </div>

              {/* Form Tambah Buku Bacaan */}
              {showAddBook && (
                <form onSubmit={handleAddBookSubmit} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 space-y-4 animate-fade-in">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider mb-2">Tambah Buku Baru ke Koleksi</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 mb-1">Judul Buku</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masukkan judul buku..."
                        value={judulBuku} 
                        onChange={(e) => setJudulBuku(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 mb-1">Pengarang / Penulis</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Nama pengarang..."
                        value={pengarang} 
                        onChange={(e) => setPengarang(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 mb-1">Genre / Tema Buku</label>
                      <input 
                        type="text" 
                        placeholder="Fiksi, Sains, Sejarah, Agama..."
                        value={genre} 
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-emerald-900 mb-1">Status Bacaan</label>
                      <select 
                        value={statusBaca} 
                        onChange={(e) => setStatusBaca(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs"
                      >
                        <option value="rencana">📅 Rencana Membaca</option>
                        <option value="sedang">📖 Sedang Membaca</option>
                        <option value="sudah">✅ Selesai Membaca</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-emerald-900 mb-1">Catatan / Sinopsis Pendek Buku</label>
                      <input 
                        type="text" 
                        placeholder="Misal: Kisah persahabatan anak-anak Laskar Pelangi..."
                        value={sinopsis} 
                        onChange={(e) => setSinopsis(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowAddBook(false)}
                      className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-slate-500 font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm"
                    >
                      Simpan Buku
                    </button>
                  </div>
                </form>
              )}

              {/* Grid Buku */}
              {myReadingBooks.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-xs text-slate-400">
                  Reading list-mu kosong. Catat buku referensi pertamamu untuk melacak progres membacamu!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myReadingBooks.map(book => (
                    <div key={book.id} className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-200 hover:shadow-xs transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${book.statusBaca === 'sudah' ? 'bg-emerald-50 text-emerald-800' : book.statusBaca === 'sedang' ? 'bg-indigo-50 text-indigo-800 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
                            {book.statusBaca === 'sudah' ? '✅ Selesai' : book.statusBaca === 'sedang' ? '📖 Sedang Baca' : '📅 Rencana'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{book.genre}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mb-0.5">{book.judulBuku}</h4>
                        <p className="text-xs text-slate-400 mb-2">Karya {book.pengarang}</p>
                        {book.sinopsis && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal bg-slate-50 rounded-lg p-2 italic">
                            &ldquo;{book.sinopsis}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                        <button 
                          onClick={() => onDeleteBook(book.id)}
                          className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
                        >
                          Hapus
                        </button>
                        
                        {book.statusBaca !== 'sudah' && (
                          <button 
                            onClick={() => {
                              onUpdateBookStatus(book.id, 'sudah');
                              alert('Buku ditandai selesai dibaca! Selamat, kamu mendapat reward 15 poin tambahan.');
                            }}
                            className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5 hover:underline"
                          >
                            <BookOpenCheck className="w-3.5 h-3.5" />
                            Tandai Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB TANTANGAN LITERASI */}
      {activeTab === 'tantangan' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-tr from-emerald-900 to-emerald-800 text-white rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-md">
            <div>
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold mt-2">Tantangan Menulis Bulanan</h3>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed max-w-xl">
                Ikuti tantangan menulis dengan tema-tema seru untuk menguji keahlian menulismu. Dapatkan tambahan **Poin Bonus Spesifik** dan lencana prestasi eksklusif!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map(chal => {
              const isParticipating = chal.peserta.includes(currentUser.id);
              const daysLeft = Math.max(0, Math.ceil((new Date(chal.tanggalSelesai).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <div key={chal.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md card-hover-lift animate-smooth-in flex flex-col justify-between">
                  <div>
                    {chal.coverImage && (
                      <div className="w-full h-40 bg-slate-100 overflow-hidden relative group">
                        <Image 
                          src={chal.coverImage} 
                          alt={chal.judul} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 text-[10px] font-bold text-white bg-slate-900/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                          ⏱️ {daysLeft} Hari Tersisa
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">Tema: {chal.tema}</span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">🏆 +{chal.poinBonus} Poin</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mb-2 font-serif">{chal.judul}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{chal.deskripsi}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-50 mt-auto flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">{chal.peserta.length} Siswa Berpartisipasi</span>
                    
                    {isParticipating ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-700" /> Sudah Bergabung
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          onJoinChallenge(chal.id);
                          alert(`Selamat! Kamu berhasil mendaftar tantangan "${chal.judul}". Kamu mendapat +10 poin awal pendaftaran.`);
                        }}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all pressable cursor-pointer"
                      >
                        Ikuti Tantangan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB AGENDARISASI HARI LITERASI */}
      {activeTab === 'mingguresumen' && (
        <div className="space-y-6 font-sans text-left">
          {/* Banner Status Agenda Hari Literasi Aktif (HANYA DITAMPILKAN JIKA ADA AGENDA AKTIF) */}
          {activePeriod ? (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
              {/* Top Pattern Header */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-extrabold shadow-sm">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {activePeriod.nama}
                      </h3>
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 select-none animate-pulse">
                        ⚡ SEDANG BERLANGSUNG
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Pelaksanaan 1 Hari Terjadwal • Program Wajib Siswa MA NU 01 Banyuputih
                    </p>
                  </div>
                </div>

                {/* Stat Quick View Grid */}
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">SUDAH MENULIS</span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      👥 {posts.filter(p => p.isMingguLiterasi && p.periodeId === activePeriod.id && p.status === 'published').length} Karya
                    </span>
                  </div>
                  <div className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">STATUS AGENDA</span>
                    <span className="text-xs font-extrabold text-emerald-600">Aktif Hari Ini</span>
                  </div>
                  <div className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">PARTISIPASI</span>
                    <span className="text-xs font-extrabold text-indigo-700">📈 Aktif</span>
                  </div>
                </div>
              </div>

              {/* User Submission Warning/Success Status Banner */}
              <div className="p-6 space-y-4">
                {/* Petunjuk Ketentuan & Jenis Tulisan */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-amber-950">
                        🎯 Ketentuan Penulisan Hari Ini:
                      </span>
                      {activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas' ? (
                        <span className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-lg border border-amber-300">
                          {activePeriod.kategoriNamaWajib || 'Kategori Khusus'}
                        </span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-900 font-extrabold px-2.5 py-0.5 rounded-lg border border-indigo-200">
                          ✨ Bebas / Pilihan Siswa
                        </span>
                      )}
                      {activePeriod.izinkanBebas && (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                          💡 Murid Boleh Menulis Bebas
                        </span>
                      )}
                    </div>
                    {activePeriod.temaInstruksi && (
                      <p className="text-amber-900 text-xs font-medium leading-relaxed">
                        📌 <strong>Tema / Arahan:</strong> &ldquo;{activePeriod.temaInstruksi}&rdquo;
                      </p>
                    )}
                    {activePeriod.izinkanBebas && activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas' && (
                      <p className="text-[11px] text-amber-800 leading-normal">
                        Catatan: Kamu tetap boleh memilih jenis karya lain (cerpen, puisi, opini) jika memiliki inspirasi karya tersendiri.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onNavigateTab?.('tulis');
                      setIsMingguLiterasi(true);
                      if (activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas') {
                        setKategoriId(activePeriod.kategoriIdWajib);
                      }
                    }}
                    className="bg-[#132257] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
                  >
                    Tulis Karya Sekarang ✍️
                  </button>
                </div>

                {(() => {
                  const userPostInPeriod = posts.find(p => p.authorId === currentUser.id && p.isMingguLiterasi && p.periodeId === activePeriod.id && p.status === 'published');
                  
                  if (userPostInPeriod) {
                    return (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-2">
                            <span>🎉</span> Keren, {currentUser.nama}!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Kamu sudah menyelesaikan tugas wajib untuk <strong>{activePeriod.nama}</strong> dengan karya berjudul <strong>&ldquo;{userPostInPeriod.judul}&rdquo;</strong>. Karya kamu telah mendapatkan <strong>{userPostInPeriod.likes.length} Suka</strong> dan siap dinilai oleh bapak/ibu guru!
                          </p>
                        </div>
                        <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm shrink-0">
                          ✓ TUGAS SELESAI
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-rose-900 flex items-center gap-2 animate-pulse">
                            <span>⚠️</span> Perhatian, {currentUser.nama}!
                          </p>
                          <p className="text-xs text-rose-700 leading-relaxed">
                            Kamu belum mengirimkan tugas untuk <strong>{activePeriod.nama}</strong>. Segera tulis satu karya dan aktifkan pilihan <strong>&ldquo;Setorkan untuk Agenda Hari Ini&rdquo;</strong> agar partisipasimu tercatat!
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onNavigateTab?.('tulis');
                            setIsMingguLiterasi(true);
                            if (activePeriod.kategoriIdWajib && activePeriod.kategoriIdWajib !== 'bebas') {
                              setKategoriId(activePeriod.kategoriIdWajib);
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-full shadow-sm shrink-0 transition-colors"
                        >
                          ⏳ BELUM DIKUMPULKAN
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ) : null}

          {/* Sub Tab Navigation inside Minggu Literasi (Sleek Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar py-1">
            {[
              { key: 'masuk', label: '📖 Tulisan Masuk', count: posts.filter(p => p.isMingguLiterasi && p.status === 'published').length },
              { key: 'rekap', label: '📊 Rekap per Kelas', count: allAvailableClasses.length },
              { key: 'riwayat', label: '🗓️ Riwayat Saya', count: posts.filter(p => p.authorId === currentUser.id && p.isMingguLiterasi && p.status === 'published').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setWeeklySubTab(tab.key as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  weeklySubTab === tab.key 
                    ? 'bg-[#111c44] text-white shadow-2xs font-semibold' 
                    : 'bg-slate-100/70 hover:bg-slate-150 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${weeklySubTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sub Tab Contents */}
          {weeklySubTab === 'masuk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Feed Tulisan Minggu Literasi #{activePeriod?.nama || '10'}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Daftar tulisan seluruh teman-teman madrasah yang disetor khusus pekan ini.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.filter(p => p.isMingguLiterasi && p.status === 'published').map(post => {
                  const isPostLiked = currentUser ? post.likes.includes(currentUser.id) : false;
                  return (
                    <div 
                      key={post.id}
                      onClick={() => setSelectedDetailPost(post)}
                      className="bg-white border border-slate-200/60 rounded-3xl p-4 sm:p-5 hover:border-slate-300 card-hover-lift transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md cursor-pointer group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                            {categories.find(c => c.id === post.kategoriId)?.ikon} {categories.find(c => c.id === post.kategoriId)?.nama || 'Karya'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#111c44] transition-colors">{post.judul}</h5>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">{post.isi}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {post.authorNama.charAt(0)}
                          </div>
                          <div className="leading-tight min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{post.authorNama}</p>
                            <p className="text-[10px] text-slate-400 truncate">{post.authorKelas ? `Kelas ${post.authorKelas}` : 'Siswa'}</p>
                          </div>
                        </div>

                        {/* Interactive Action Icons (Like Langsung & Komentar) */}
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onLike) {
                                onLike(post.id);
                              }
                            }}
                            title={isPostLiked ? 'Batal Menyukai' : 'Sukai Tulisan'}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                              isPostLiked 
                                ? 'text-rose-600 bg-rose-50 border border-rose-200/80 font-bold' 
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 transition-transform ${isPostLiked ? 'fill-rose-500 text-rose-500 scale-110 animate-smooth-bounce' : ''}`} />
                            <span className="text-[11px] font-semibold">{post.likes.length}</span>
                          </button>

                          <div 
                            title="Buka komentar"
                            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 px-2 py-1 rounded-full transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub Tab: Rekap Berjenjang (Drill-Down per Kelas) - Solusi untuk 1.000 Siswa */}
          {weeklySubTab === 'rekap' && (
            <div className="space-y-4">
              {!selectedClassDetail ? (
                /* LEVEL 1: DAFTAR RINGKASAN SELURUH KELAS */
                <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Ringkasan Kepatuhan Seluruh Kelas</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pilih kartu kelas untuk melihat rincian nama siswa, status setor, dan karya literasinya.
                      </p>
                    </div>

                    {/* Filter Pencarian Kelas */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari kelas (cth: IPA 1)..."
                        value={searchClassQuery}
                        onChange={(e) => setSearchClassQuery(e.target.value)}
                        className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#132257]/20 w-full sm:w-52 font-medium"
                      />
                    </div>
                  </div>

                  {/* Grid Kartu Kelas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {classSummaryStats
                      .filter(cls => !searchClassQuery.trim() || cls.nama.toLowerCase().includes(searchClassQuery.toLowerCase().trim()))
                      .map((cls) => (
                        <div
                          key={cls.id}
                          onClick={() => {
                            setSelectedClassDetail(cls.id);
                            setSearchStudentInClassQuery('');
                            setRekapStudentFilter('all');
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                            cls.isUserClass 
                              ? 'border-indigo-300 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 shadow-xs hover:shadow-md hover:border-indigo-400' 
                              : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-900 transition-colors">
                                  Kelas {cls.nama}
                                </h5>
                                {cls.isUserClass && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md">
                                    Kelas Saya
                                  </span>
                                )}
                              </div>
                              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                                cls.persentase >= 80 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : cls.persentase >= 50 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cls.persentase}% Setor
                              </span>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  cls.persentase >= 80 ? 'bg-emerald-500' : cls.persentase >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${Math.min(100, Math.max(5, cls.persentase))}%` }}
                              />
                            </div>

                            {/* Statistik Jumlah Siswa */}
                            <div className="grid grid-cols-3 gap-1.5 text-center py-2 px-1 bg-slate-50/70 rounded-xl mb-3 border border-slate-100">
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Total</p>
                                <p className="text-xs font-bold text-slate-800">{cls.totalSiswa}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-emerald-600 font-semibold">Sudah</p>
                                <p className="text-xs font-bold text-emerald-700">{cls.submittedCount}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-amber-600 font-semibold">Belum</p>
                                <p className="text-xs font-bold text-amber-700">{cls.unsubmittedCount}</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 group-hover:text-indigo-900 font-bold">
                            <span>Buka Daftar Siswa</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* LEVEL 2: DETAIL SISWA DI KELAS TERPILIH */
                <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 space-y-5 shadow-xs">
                  {/* Top Bar Drill-down Navigasi */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedClassDetail(null)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                        title="Kembali ke semua kelas"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Semua Kelas</span>
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            Detail Kepatuhan: Kelas {activeClassDetailObj?.nama}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
                            {activeClassStudents.length} Siswa
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Status pengumpulan tugas literasi untuk pekan #{activePeriod?.nama || '10'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Search dalam kelas */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama atau NIS siswa..."
                          value={searchStudentInClassQuery}
                          onChange={(e) => setSearchStudentInClassQuery(e.target.value)}
                          className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#132257]/20 w-full sm:w-52 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Status Cepat */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
                    {[
                      { key: 'all', label: `Semua (${activeClassStudents.length})` },
                      { key: 'sudah', label: `Sudah Menulis (${activeClassStudents.filter(s => s.submitted).length})` },
                      { key: 'belum', label: `Belum Menulis (${activeClassStudents.filter(s => !s.submitted).length})` },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setRekapStudentFilter(f.key as any)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          rekapStudentFilter === f.key
                            ? 'bg-[#111c44] text-white shadow-2xs'
                            : 'bg-slate-100/70 hover:bg-slate-150 text-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* List Siswa di Kelas Terpilih */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visibleClassStudents.length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-slate-400 italic">
                        Tidak ada siswa yang sesuai dengan filter atau kata kunci pencarian.
                      </div>
                    ) : (
                      visibleClassStudents.map((mate) => (
                        <div 
                          key={mate.id} 
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            mate.isCurrentUser 
                              ? 'bg-blue-50/50 border-blue-200' 
                              : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-800 leading-tight truncate">{mate.nama}</p>
                              {mate.isCurrentUser && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-blue-600 text-white rounded shrink-0">Kamu</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold">NIS: {mate.nis}</p>
                            {mate.post && (
                              <button
                                type="button"
                                onClick={() => setSelectedDetailPost(mate.post!)}
                                className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold italic line-clamp-1 mt-1 text-left hover:underline cursor-pointer"
                                title="Klik untuk membaca karya siswa ini"
                              >
                                &ldquo;{mate.post.judul}&rdquo;
                              </button>
                            )}
                          </div>

                          {mate.submitted ? (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                              Sudah Menulis
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                              Belum Menulis
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {weeklySubTab === 'riwayat' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Riwayat Pengumpulan & Catatan Nilai Guru</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Rekap nilai, skor kriteria adab, dan feedback langsung dari ustadz/ustadzah.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-extrabold text-slate-500">
                      <th className="p-4">Minggu Ke</th>
                      <th className="p-4">Karya Literasimu</th>
                      <th className="p-4">Tanggal Pengumpulan</th>
                      <th className="p-4">Skor & Feedback Ustadz/Ustadzah</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-600">
                    {posts.filter(p => p.authorId === currentUser.id && p.isMingguLiterasi && p.status === 'published').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic font-medium">Kamu belum memiliki riwayat pengumpulan tugas wajib.</td>
                      </tr>
                    ) : (
                      posts.filter(p => p.authorId === currentUser.id && p.isMingguLiterasi && p.status === 'published').map(post => (
                        <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-[#132257]">
                            {activePeriod && activePeriod.id === post.periodeId ? '#10 (Aktif)' : 'Periode Terlampau'}
                          </td>
                          <td className="p-4 font-semibold text-slate-800 italic">&ldquo;{post.judul}&rdquo;</td>
                          <td className="p-4 font-medium text-slate-400">{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                          <td className="p-4">
                            {post.grade ? (
                              <div className="space-y-1">
                                <span className="font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md text-[10px]">
                                  Skor: {post.grade.skor} / 100
                                </span>
                                <p className="text-[10px] text-slate-500 font-medium italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">&ldquo;{post.grade.catatan}&rdquo;</p>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-bold italic bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                                ⏳ Sedang dalam penilaian
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Post dengan Real Handlers */}
      {selectedDetailPost && (
        <ModalDetailPost
          post={selectedDetailPost}
          categories={categories}
          currentUser={currentUser}
          onClose={() => setSelectedDetailPost(null)}
          onLike={(id) => {
            if (onLike) {
              onLike(id);
              // Sinkronkan state local modal agar like/batal like langsung terlihat di modal
              setSelectedDetailPost(prev => {
                if (!prev || prev.id !== id || !currentUser) return prev;
                const hasLiked = prev.likes.includes(currentUser.id);
                return {
                  ...prev,
                  likes: hasLiked
                    ? prev.likes.filter(uid => uid !== currentUser.id)
                    : [...prev.likes, currentUser.id]
                };
              });
            }
          }}
          onBookmark={(id) => {
            if (onBookmark) {
              onBookmark(id);
              setSelectedDetailPost(prev => {
                if (!prev || prev.id !== id || !currentUser) return prev;
                const currentBookmarks = prev.bookmarks || [];
                const hasBookmarked = currentBookmarks.includes(currentUser.id);
                return {
                  ...prev,
                  bookmarks: hasBookmarked
                    ? currentBookmarks.filter(uid => uid !== currentUser.id)
                    : [...currentBookmarks, currentUser.id]
                };
              });
            }
          }}
          onComment={(id, text) => {
            if (onComment) {
              onComment(id, text);
            }
          }}
          onReact={(id, type) => {
            if (onReact) {
              onReact(id, type);
              setSelectedDetailPost(prev => {
                if (!prev || prev.id !== id || !currentUser) return prev;
                const existingIdx = prev.reactions.findIndex(r => r.userId === currentUser.id);
                let nextReactions = [...prev.reactions];
                if (existingIdx !== -1) {
                  if (nextReactions[existingIdx].tipeReaksi === type) {
                    nextReactions.splice(existingIdx, 1);
                  } else {
                    nextReactions[existingIdx] = { ...nextReactions[existingIdx], tipeReaksi: type };
                  }
                } else {
                  nextReactions.push({
                    id: `react-${Date.now()}`,
                    postId: id,
                    userId: currentUser.id,
                    tipeReaksi: type,
                    createdAt: new Date().toISOString()
                  });
                }
                return {
                  ...prev,
                  reactions: nextReactions
                };
              });
            }
          }}
          onGrade={(id, score, feedback) => {
            if (onGrade) {
              onGrade(id, score, feedback);
            }
          }}
        />
      )}
    </div>
  );
}
