export type UserRole = 'siswa' | 'guru' | 'admin' | 'kepala_madrasah';

export interface User {
  id: string;
  nis?: string; // only for siswa
  username?: string; // for guru, admin, kepala_madrasah
  nama: string;
  tanggalLahir?: string; // format: DD/MM/YYYY, only for siswa
  kelasId?: string; // only for siswa
  kelasNama?: string; // X-A, XI-B, etc.
  role: UserRole;
  bio: string;
  fotoProfil?: string; // URL or letter avatar
  poin: number;
  createdAt: string;
}

export interface Class {
  id: string;
  namaKelas: string; // e.g., X-A, XI-B
  tingkat: 'X' | 'XI' | 'XII';
  tahunAjaran: string;
  waliKelasId: string;
  waliKelasNama: string;
}

export interface Category {
  id: string;
  nama: string;
  kode: string;
  ikon: string;
  isActive: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNama: string;
  authorRole: UserRole;
  authorKelas?: string;
  isi: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  tipeReaksi: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif';
  createdAt: string;
}

export interface Grade {
  skor: number; // 1-100
  catatan: string;
  guruId: string;
  guruNama: string;
  gradedAt: string;
}

export interface Post {
  id: string;
  judul: string;
  isi: string;
  kategoriId: string;
  authorId: string;
  authorNama: string;
  authorKelas?: string;
  isMingguLiterasi: boolean;
  periodeId?: string; // ID periode minggu literasi jika isMingguLiterasi = true
  visibilitas: 'publik' | 'privat';
  status: 'published' | 'draft';
  coverImage?: string;
  jumlahKata: number;
  createdAt: string;
  updatedAt: string;
  likes: string[]; // array of userIds
  bookmarks?: string[]; // array of userIds yang menyimpan karya ini
  comments: Comment[];
  reactions: Reaction[];
  grade?: Grade;
  tags: string[];
}

export interface MingguLiterasiPeriod {
  id: string;
  nama: string; // e.g., "Agenda Literasi (Senin, 8 September 2026)"
  tanggalPelaksanaan?: string; // Format YYYY-MM-DD (Pelaksanaan 1 hari, umumnya hari Senin)
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  isActive: boolean;
  kategoriIdWajib?: string; // 'cat-1', 'cat-2', ..., atau 'bebas'
  kategoriNamaWajib?: string; // e.g., "Sinopsis & Resensi", "Puisi", atau "Bebas (Pilihan Siswa)"
  temaInstruksi?: string; // Tema/arahan penulisan dari admin
  izinkanBebas?: boolean; // Apakah siswa tetap boleh memilih jenis tulisan lain
  createdAt: string;
}

export interface Challenge {
  id: string;
  judul: string;
  deskripsi: string;
  tema: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdBy: string;
  peserta: string[]; // array of userIds
  poinBonus: number;
  coverImage?: string;
}

export interface Announcement {
  id: string;
  judul: string;
  isi: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReadingBook {
  id: string;
  userId: string;
  judulBuku: string;
  pengarang: string;
  genre: string;
  statusBaca: 'sedang' | 'sudah' | 'rencana';
  sinopsis?: string;
  createdAt: string;
}

export interface LibraryBook {
  id: string;
  judul: string;
  penulis: string;
  penerbit?: string;
  tahunTerbit?: string;
  kategori: string;
  sinopsis: string;
  coverUrl?: string;
  pdfUrl?: string;
  isWajib: boolean;
  jumlahHalaman?: number;
  dibacaCount: number;
  createdAt: string;
}

export interface SchoolSettings {
  namaMadrasah: string;
  motto: string;
  logoUrl?: string;
  alamat: string;
  telepon?: string;
  email?: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  kepalaMadrasahNama: string;
  kepalaMadrasahNip: string;
  koordinatorLiterasiNama: string;
  koordinatorLiterasiNip?: string;
  poinSettings: {
    poinSetorKarya: number;
    poinSuka: number;
    poinKomentar: number;
    poinBukuMandiri: number;
    poinNilaiGuruMultiplier: number; // e.g. 0.5 for Nilai / 2
  };
  updatedAt?: string;
}

export interface CertificateRecord {
  id: string;
  nomorSertifikat: string;
  userId: string;
  namaPenerima: string;
  nisPenerima?: string;
  kelasPenerima?: string;
  judulPenghargaan: string;
  predikat: string;
  kategori: string;
  tanggalTerbit: string;
  kepalaMadrasahNama: string;
  kepalaMadrasahNip: string;
  catatanApresiasi: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userNama: string;
  userRole: string;
  action: 'TAMBAH_USER' | 'EDIT_USER' | 'RESET_PASSWORD' | 'HAPUS_USER' | 'UPDATE_PENGATURAN' | 'MODERASI_POST' | 'HAPUS_POST' | 'BUAT_AGENDA' | 'TOGGLE_AGENDA' | 'TERBITKAN_SERTIFIKAT' | 'HAPUS_SERTIFIKAT' | 'TAMBAH_BUKU' | 'EDIT_BUKU' | 'HAPUS_BUKU' | 'BUAT_PENGUMUMAN' | 'HAPUS_PENGUMUMAN' | 'LAINNYA';
  detail: string;
  targetId?: string;
  targetName?: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  nama: string;
  deskripsi: string;
  ikon: string;
  kriteria: string;
  poinDibutuhkan: number;
}
