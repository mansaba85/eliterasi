# Product Requirements Document (PRD)
## Aplikasi E-Literasi MA NU 01 Banyuputih

**Versi:** 1.0  
**Tanggal:** 13 September 2026  
**Status:** Draft  
**Dibuat oleh:** Tim Pengembang  

---

## 1. Ringkasan Eksekutif

### 1.1 Latar Belakang
MA NU 01 Banyuputih memiliki program literasi yang selama ini dilaksanakan secara konvensional menggunakan buku literasi fisik. Program ini mencakup aktivitas seperti menulis buku harian, menulis sinopsis/resensi buku, membuat cerpen/puisi, dan laporan hasil pengamatan. Aplikasi E-Literasi hadir sebagai transformasi digital dari program tersebut, menghadirkan pengalaman literasi yang lebih interaktif, terukur, dan menyenangkan.

### 1.2 Tujuan Produk
- Mendigitalisasi program literasi MA NU 01 Banyuputih
- Meningkatkan motivasi siswa dalam menulis melalui fitur sosial (like, komentar, bookmark)
- Memberikan kemudahan bagi guru/admin dalam memantau dan merekap aktivitas literasi siswa
- Membedakan tulisan Minggu Literasi (wajib) dan tulisan bebas
- Menjadi arsip digital tulisan siswa yang terstruktur dan mudah dicari

### 1.3 Target Pengguna
| Pengguna | Deskripsi |
|---|---|
| Siswa | Pengguna utama yang membuat dan membaca tulisan literasi |
| Guru/Wali Kelas | Memantau aktivitas literasi siswa di kelasnya |
| Admin/Koordinator Literasi | Mengelola program, jadwal Minggu Literasi, dan rekap data |
| Kepala Madrasah | Melihat dashboard dan laporan keseluruhan program |

---

## 2. Spesifikasi Teknis

### 2.1 Tech Stack
| Layer | Teknologi |
|---|---|
| Frontend Framework | Next.js 14+ (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 + CSS Modules untuk komponen spesifik |
| Database | PostgreSQL (via Supabase atau Neon) |
| ORM | Prisma |
| Autentikasi | Custom (NIS + Tanggal Lahir) dengan JWT / NextAuth.js |
| State Management | Zustand atau React Context + useReducer |
| Rich Text Editor | TipTap atau Quill.js |
| File Storage | Supabase Storage atau Cloudinary (untuk gambar cover) |
| Deployment | Vercel |
| Search | PostgreSQL Full-Text Search atau Meilisearch |

### 2.2 Persyaratan Non-Fungsional
- **Performa:** Halaman beranda harus dimuat dalam < 2 detik
- **Skalabilitas:** Mendukung hingga 1.000 siswa aktif
- **Keamanan:** Data siswa terenkripsi, autentikasi aman
- **Aksesibilitas:** Bisa diakses dari perangkat mobile dan desktop
- **Responsif:** Mendukung layar mulai dari 375px (mobile) hingga 1440px (desktop)

---

## 3. Sistem Autentikasi

### 3.1 Login Siswa
- **Metode:** NIS (Nomor Induk Siswa) + Tanggal Lahir (DD/MM/YYYY)
- Tidak menggunakan password untuk kemudahan akses siswa
- Sesi login tersimpan selama 7 hari (configurable)
- Logout manual tersedia di semua halaman

### 3.2 Login Guru / Admin
- **Metode:** Username + Password (akun dibuat oleh Admin)
- Role: `siswa`, `guru`, `admin`, `kepala_madrasah`
- Admin dapat mereset akses siswa jika NIS atau tanggal lahir berubah

### 3.3 Keamanan
- Rate limiting pada endpoint login (maks. 5 percobaan/menit)
- JWT token dengan expiry time
- Data tanggal lahir di-hash di database (bcrypt)
- HTTPS wajib di production

---

## 4. Fitur Utama

### 4.1 Beranda (Feed)

#### Deskripsi
Halaman utama berbentuk feed sosial seperti Threads/Twitter yang menampilkan tulisan-tulisan literasi siswa.

#### Konten yang Ditampilkan
- Kartu tulisan dengan: judul, kategori, nama penulis, kelas, foto profil, tanggal, cuplikan isi (150 karakter), jumlah like/komentar/bookmark
- Badge khusus untuk tulisan **Minggu Literasi** (wajib)
- Badge verifikasi guru (jika tulisan sudah dinilai)

#### Algoritma Feed
Tulisan diurutkan berdasarkan skor:

```
Skor = (like × 3) + (komentar × 2) + (bookmark × 1) + faktor_waktu
faktor_waktu = nilai yang menurun seiring waktu (decay function, mirip Hacker News)
```

Selain itu, tersedia opsi pengurutan manual:
- **Terpopuler** — berdasarkan skor di atas
- **Terbaru** — berdasarkan waktu posting
- **Minggu Literasi** — hanya tulisan wajib
- **Direkomendasikan** — tulisan dari siswa sekelas atau dari kategori yang sering dibaca

#### Filter Beranda
- Filter berdasarkan **Kategori Literasi** (dropdown/chip)
- Filter berdasarkan **Kelas** (dropdown)
- Filter berdasarkan **Periode** (minggu ini, bulan ini, semua)
- Kombinasi filter dimungkinkan

#### Interaksi Sosial
| Fitur | Deskripsi |
|---|---|
| Like/Love | Siswa bisa menekan tombol hati; satu siswa satu like per tulisan |
| Komentar | Komentar teks pendek (maks. 500 karakter); bisa dibalas |
| Bookmark | Simpan tulisan ke koleksi pribadi; dibagi per kategori bookmark |
| Bagikan | Salin tautan internal tulisan |

---

### 4.2 Kategori Literasi

#### Kategori Default (dapat ditambah admin)
| Kode | Nama Kategori | Ikon |
|---|---|---|
| `buku-harian` | Buku Harian | 📔 |
| `sinopsis-resensi` | Sinopsis & Resensi Buku | 📚 |
| `cerpen` | Cerpen | ✍️ |
| `puisi` | Puisi | 🌸 |
| `laporan-pengamatan` | Laporan Hasil Pengamatan | 🔬 |
| `esai` | Esai & Opini | 💬 |
| `berita` | Berita & Artikel | 📰 |
| `dongeng` | Dongeng & Cerita Rakyat | 🧚 |
| `lainnya` | Lainnya | 📝 |

Setiap tulisan **wajib** memilih satu kategori. Admin dapat menambah/menonaktifkan kategori.

---

### 4.3 Halaman Tulis (Editor)

#### Deskripsi
Halaman untuk membuat atau mengedit tulisan literasi.

#### Form Tulisan
- **Judul** — wajib, maks. 100 karakter
- **Kategori** — dropdown wajib
- **Jenis Tulisan** — otomatis terisi: `Bebas` atau `Minggu Literasi` (jika dibuat saat periode aktif)
- **Gambar Cover** — opsional, upload gambar
- **Isi Tulisan** — rich text editor (bold, italic, heading, list, blockquote, gambar sisipan)
- **Tag** — opsional, maks. 5 tag, untuk memudahkan pencarian
- **Visibilitas** — Publik (semua bisa lihat) atau Privat (hanya penulis & guru)

#### Fitur Editor
- Auto-save draft setiap 30 detik
- Tampilan preview sebelum publish
- Hitung kata dan estimasi waktu baca
- Tombol "Simpan Draft" dan "Publikasikan"

---

### 4.4 Minggu Literasi

#### Konsep
Setiap **Senin** tertentu (ditentukan admin), seluruh siswa **diwajibkan** menulis literasi. Tulisan yang dibuat pada periode Minggu Literasi akan ditandai secara otomatis dan masuk ke rekap terpisah.

#### Alur Minggu Literasi
1. Admin mengaktifkan periode Minggu Literasi dari panel admin (misal: Senin, 16 September 2026 — Minggu, 22 September 2026)
2. Saat siswa login pada periode tersebut, muncul **banner notifikasi** di beranda: "Minggu Literasi sedang berjalan! Kamu belum menulis. Tulis sekarang →"
3. Siswa membuat tulisan seperti biasa; sistem otomatis menandai sebagai `minggu_literasi: true`
4. Setelah periode berakhir, tulisan Minggu Literasi tetap tampil di beranda dengan badge khusus
5. Rekap Minggu Literasi tersedia di profil siswa dan panel guru/admin

#### Aturan Minggu Literasi
- Satu siswa minimal **satu tulisan** per periode Minggu Literasi
- Boleh lebih dari satu tulisan
- Tulisan bebas yang dibuat pada periode aktif **tidak** dihitung sebagai Minggu Literasi kecuali siswa secara eksplisit memilih "Ini adalah tulisan Minggu Literasi"
- Guru dapat memberi catatan/nilai pada tulisan Minggu Literasi

#### Status Keikutsertaan
| Status | Keterangan |
|---|---|
| Belum Menulis | Periode aktif, belum ada tulisan |
| Sudah Menulis | Minimal 1 tulisan periode ini |
| Dinilai | Guru sudah memberikan penilaian |
| Tidak Aktif | Periode belum atau sudah berakhir |

---

### 4.5 Profil Siswa

#### Informasi Profil
- Foto profil (upload atau avatar default berbasis inisial nama)
- Nama lengkap, kelas, angkatan
- Bio singkat (maks. 150 karakter)
- Statistik: total tulisan, total like diterima, total komentar, jumlah Minggu Literasi selesai

#### Tab di Profil
| Tab | Konten |
|---|---|
| Semua Tulisan | Semua tulisan publik & privat milik sendiri |
| Minggu Literasi | Hanya tulisan dengan tag Minggu Literasi |
| Tulisan Bebas | Hanya tulisan bebas |
| Bookmark | Tulisan yang disimpan dari penulis lain |
| Draft | Tulisan yang belum dipublikasikan |

---

### 4.6 Panel Guru (Pembina & Kurator Literasi)

#### Filosofi & Konsep Penilaian
Penilaian literasi oleh guru **bukanlah sistem koreksi tugas/ulangan massal** yang mewajibkan pemberian nilai ke seluruh siswa. Program ini berfokus pada pembiasaan menulis merdeka. Peran guru adalah sebagai **Pembina & Kurator Literasi**: guru menelaah karya-karya siswa madrasah, lalu memberikan predikat nilai (0–100) dan catatan apresiasi pada **tulisan-tulisan yang dinilai bagus/berbobot**. Tulisan yang telah diapresiasi ini otomatis masuk ke dalam **Arsip Karya Pilihan Madrasah (Antologi Terkurasi)** untuk kebutuhan dokumentasi madrasah, portofolio siswa, dan pelaporan eksekutif.

#### Akses & Ruang Lingkup
- Guru login menggunakan username + password.
- Guru dapat menelaah dan mengkurasi karya secara **fleksibel** (bisa lintas kelas di seluruh madrasah atau memfilter kelas binaan tertentu).

#### Fitur Panel Guru
1. **Tab Eksplorasi & Kurasi:**
   - Menjelajahi tulisan literasi siswa per kelas atau seluruh madrasah.
   - Filter agenda Minggu Literasi dan status kurasi (*Terkurasi*, *Siap Diapresiasi*, *Belum Terbit*).
   - Analitik visual Recharts: perbandingan karya masuk vs karya terkurasi.
   - Tombol **"Baca & Kurasi"** untuk membaca karya dan menyimpan ulasan resmi.
   - Ekspor rekapitulasi ke format CSV/Excel.
2. **Tab Arsip Karya Pilihan (Antologi Terkurasi):**
   - Koleksi terstruktur seluruh tulisan siswa yang telah lolos telaah dan mendapatkan nilai guru.
   - Filter berdasarkan kategori karya (Puisi, Cerpen, Esai, Resensi, dll.), predikat nilai (*Istimewa*, *Baik Sekali*, *Baik*), dan kelas.
   - Unduh **Arsip Antologi CSV** & Dialog Cetak Dokumen/Berita Acara untuk Kepala Madrasah dan dinas/pengawas.

---

### 4.7 Panel Admin

#### Fitur Admin
- **Manajemen Siswa** — tambah/edit/nonaktifkan akun siswa, import NIS massal via CSV
- **Manajemen Guru** — tambah/edit akun guru, atur kelas yang diampu
- **Kelola Kategori Literasi** — tambah/edit/hapus kategori
- **Jadwal Minggu Literasi** — buat, edit, aktifkan/nonaktifkan periode Minggu Literasi
- **Moderasi Konten** — sembunyikan tulisan yang tidak pantas
- **Dashboard Keseluruhan** — statistik sekolah: total tulisan, partisipasi Minggu Literasi, kategori terpopuler, siswa paling aktif
- **Pengumuman** — buat pengumuman yang muncul di beranda semua siswa

---

## 5. Fitur Tambahan yang Direkomendasikan

### 5.1 Sistem Poin & Pencapaian (Gamifikasi)
- Siswa mendapatkan poin untuk setiap tulisan yang dipublikasikan, like yang diterima, dan Minggu Literasi yang diselesaikan
- Badge/pencapaian: "Penulis Pemula", "Rajin Literasi", "Pujangga", "Juara Minggu Literasi", dll.
- Leaderboard mingguan/bulanan per kelas dan per sekolah
- **Tujuan:** Meningkatkan motivasi intrinsik siswa untuk menulis lebih banyak

### 5.2 Koleksi Buku Referensi (Reading List)
- Siswa dapat menambahkan buku yang sedang/sudah dibaca
- Data buku: judul, pengarang, tahun terbit, genre
- Integrasi dengan tulisan resensi/sinopsis: saat menulis resensi, bisa memilih dari daftar buku yang sudah ditambahkan
- **Tujuan:** Mendorong siswa untuk membaca sebelum menulis

### 5.3 Komentar dengan Apresiasi Spesifik
- Selain komentar teks biasa, sediakan tombol apresiasi cepat: "Kagum", "Menginspirasi", "Kreatif", "Informatif"
- Tampil sebagai emoji reaction di bawah tulisan
- **Tujuan:** Memperkaya interaksi antar siswa tanpa harus menulis komentar panjang

### 5.4 Tantangan Literasi (Challenge)
- Admin/guru dapat membuat tantangan menulis dengan tema spesifik dan batas waktu
- Contoh: "Ceritakan pengalamanmu saat Ramadhan" (tenggat: 7 hari)
- Siswa yang berpartisipasi mendapat badge tantangan
- Karya terbaik dipilih guru dan ditampilkan di banner beranda
- **Tujuan:** Memberi stimulus tema bagi siswa yang kebingungan memulai

### 5.5 Mode Baca yang Nyaman
- Halaman baca tulisan lengkap dengan typografi yang nyaman: pilihan ukuran font, mode gelap/terang, mode fokus (menyembunyikan sidebar)
- Estimasi waktu baca ditampilkan di atas tulisan
- **Tujuan:** Mendorong siswa membaca tulisan teman lebih sering

### 5.6 Notifikasi In-App & Email/WhatsApp
- Notifikasi in-app: ada yang like/komentar tulisanmu, Minggu Literasi dimulai, tantangan baru
- Opsional: notifikasi via WhatsApp (integrasi Fonnte/WhatsApp API) untuk pengingat Minggu Literasi kepada siswa yang belum menulis
- **Tujuan:** Meningkatkan keterlibatan dan mengurangi siswa yang lupa menulis

### 5.7 Majalah Dinding Digital (Mading)
- Admin/guru dapat memilih tulisan terbaik untuk ditampilkan di "Mading Digital" di halaman beranda
- Tampil sebagai carousel atau banner khusus di bagian atas feed
- **Tujuan:** Memberi penghargaan kepada penulis terbaik dan mendorong kualitas tulisan

### 5.8 Riwayat Perkembangan Menulis
- Grafik perkembangan jumlah kata per tulisan dari waktu ke waktu
- Analitik pribadi: rata-rata panjang tulisan, kategori favorit, waktu paling produktif
- **Tujuan:** Membantu siswa refleksi dan melihat kemajuan kemampuan menulisnya

### 5.9 Fitur Kolaborasi (Opsional / Fase 2)
- Dua atau lebih siswa dapat menulis cerpen/laporan bersama dalam satu dokumen
- Riwayat perubahan (history revision)
- **Tujuan:** Melatih kerja sama dan penulisan kolaboratif

### 5.10 Fitur Pencarian Global
- Pencarian tulisan berdasarkan judul, isi, nama penulis, kategori, atau tag
- Filter hasil pencarian dengan kombinasi parameter
- **Tujuan:** Memudahkan siswa menemukan tulisan spesifik untuk referensi

---

## 6. Alur Pengguna (User Flow)

### 6.1 Alur Login Siswa
```
Buka aplikasi → Halaman Login → Masukkan NIS + Tanggal Lahir → Validasi → Beranda
```

### 6.2 Alur Menulis Literasi Bebas
```
Beranda → Tombol "Tulis" → Pilih Kategori → Tulis Konten → Preview → Publikasikan → Feed diperbarui
```

### 6.3 Alur Minggu Literasi
```
Admin aktifkan periode → Siswa login → Banner notifikasi muncul → Klik "Tulis Sekarang" 
→ Editor (otomatis bertanda Minggu Literasi) → Publikasikan → Status: "Sudah Menulis"
```

### 6.4 Alur Guru Menilai
```
Login Guru → Panel Guru → Pilih Kelas → Rekap Minggu Literasi → Klik tulisan siswa 
→ Beri skor & catatan → Simpan Penilaian → Siswa mendapat notifikasi
```

---

## 7. Struktur Data (Schema Database)

### Tabel Utama
```
users (id, nis, nama, tanggal_lahir_hash, kelas_id, role, bio, foto_profil, poin, created_at)
classes (id, nama_kelas, tingkat, tahun_ajaran, wali_kelas_id)
posts (id, judul, isi, kategori_id, author_id, is_minggu_literasi, periode_id, visibilitas, status, cover_image, jumlah_kata, created_at, updated_at)
minggu_literasi_periods (id, nama, tanggal_mulai, tanggal_selesai, is_active, created_by)
categories (id, nama, kode, ikon, is_active)
likes (id, post_id, user_id, created_at)
comments (id, post_id, author_id, parent_comment_id, isi, created_at)
bookmarks (id, post_id, user_id, koleksi, created_at)
reactions (id, post_id, user_id, tipe_reaksi, created_at)
grades (id, post_id, guru_id, skor, catatan, created_at)
challenges (id, judul, deskripsi, tema, tanggal_mulai, tanggal_selesai, created_by)
notifications (id, user_id, tipe, pesan, is_read, link, created_at)
announcements (id, judul, isi, created_by, is_active, created_at)
achievements (id, nama, deskripsi, ikon, kriteria)
user_achievements (id, user_id, achievement_id, earned_at)
reading_list (id, user_id, judul_buku, pengarang, genre, status_baca)
```

---

## 8. Halaman & Navigasi

### 8.1 Navigasi Utama (Sidebar / Bottom Nav Mobile)
| Ikon | Halaman | Akses |
|---|---|---|
| 🏠 | Beranda | Semua |
| ✍️ | Tulis | Siswa |
| 🔖 | Bookmark | Siswa |
| 📅 | Minggu Literasi | Semua |
| 👤 | Profil | Semua |
| 🎯 | Tantangan | Semua |
| 🔔 | Notifikasi | Semua |
| ⚙️ | Panel Guru | Guru |
| 🛡️ | Panel Admin | Admin |

### 8.2 Daftar Halaman (Routes Next.js)
```
/                          → Beranda (feed)
/login                     → Halaman Login
/tulis                     → Editor tulisan baru
/tulis/[id]/edit           → Edit tulisan
/tulisan/[id]              → Detail tulisan
/profil/[nis]              → Profil siswa
/profil/saya               → Profil sendiri
/bookmark                  → Koleksi bookmark
/minggu-literasi           → Halaman rekap Minggu Literasi
/tantangan                 → Daftar tantangan
/tantangan/[id]            → Detail tantangan
/cari                      → Halaman pencarian
/guru                      → Panel guru (protected)
/guru/kelas/[id]           → Detail kelas
/guru/minggu-literasi/[id] → Rekap periode
/admin                     → Panel admin (protected)
/admin/siswa               → Manajemen siswa
/admin/periode             → Manajemen Minggu Literasi
/admin/kategori            → Manajemen kategori
/admin/moderasi            → Moderasi konten
```

---

## 9. Desain & UX

### 9.1 Prinsip Desain
- **Ramah Siswa:** Antarmuka sederhana, tidak membingungkan, dapat digunakan tanpa pelatihan khusus
- **Mobile First:** Mayoritas siswa mengakses via smartphone
- **Inklusif:** Font yang mudah dibaca, kontras warna memadai
- **Cepat:** Optimasi gambar, lazy loading, infinite scroll pada feed

### 9.2 Palet Warna (Rekomendasi)
- **Primer:** Biru tua (kepercayaan, akademik) — `#1E40AF`
- **Aksen:** Hijau toska (pertumbuhan, kreativitas) — `#059669`
- **Latar:** Putih bersih `#FFFFFF` dengan kartu `#F8FAFC`
- **Teks:** Abu gelap `#1E293B`
- **Badge Minggu Literasi:** Oranye hangat `#EA580C`

### 9.3 Tipografi
- **Heading:** Poppins (modern, mudah dibaca)
- **Body:** Inter (bersih, nyaman dibaca panjang)
- **Konten Literasi:** Lora (serif, nuansa buku/karya sastra)

---

### 10. Milestone Pengembangan

### Fase 1 — MVP (8 Minggu)
- [x] Setup project Next.js + TypeScript + Tailwind CSS
- [x] Pemisahan URL Route (Next.js App Router: `/`, `/login`, `/tulis`, `/tulisan/[id]`, `/profil/saya`, `/profil/[nis]`, `/guru`, `/admin`, `/minggu-literasi`, `/bookmark`, `/tantangan`, `/cari`)
- [x] Sistem autentikasi (NIS + Tanggal Lahir untuk Siswa, Username + Password untuk Staff)
- [x] Halaman beranda feed interaktif
- [x] Editor tulisan (kategori, judul, isi, draft auto-save, AI evaluator)
- [x] Halaman detail tulisan dengan URL shareable
- [x] Fitur like & komentar interaktif
- [x] Profil siswa & portofolio karya
- [x] Sistem Minggu Literasi (periode aktif, badge, rekap keikutsertaan)
- [x] Panel guru kurator literasi & arsip karya pilihan

### Fase 2 — Pengembangan (6 Minggu)
- [x] Algoritma feed (skor popularitas & filter)
- [x] Bookmark & koleksi buku bacaan (*reading list*)
- [x] Panel admin lengkap (periode, pengguna, kategori, audit log, sertifikat)
- [x] Fitur notifikasi in-app
- [x] Filter & pencarian naskah global
- [x] Export rekapitulasi data (CSV / Excel format)
- [x] Kurasi & apresiasi tulisan oleh guru
- [x] Gamifikasi dasar (sistem poin & bonus bintang)

### Fase 3 — Peningkatan (4 Minggu)
- [x] Tantangan Literasi (Challenge bertema)
- [x] Mading Digital (karya pilihan terbaik nilai $\ge 90$)
- [x] Reading List (pencatatan buku bacaan mandiri)
- [x] Badge & lencana pencapaian
- [ ] Notifikasi WhatsApp gateway (opsional / pihak ketiga)
- [x] Mode baca nyaman (pilihan font Serif/Sans, ukuran font, durasi baca)
- [x] Fitur evaluasi tulisan berbasis AI (Google Gemini AI)

---

## 11. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| Siswa lupa NIS | Tinggi | Sedang | Panduan di halaman login; guru/admin bisa lookup NIS |
| Konten tidak pantas | Sedang | Tinggi | Fitur laporan, moderasi admin, filter kata kasar |
| Adopsi rendah | Sedang | Tinggi | Gamifikasi, tantangan, keterlibatan guru sebagai motivator |
| Data siswa bocor | Rendah | Sangat Tinggi | Enkripsi data, HTTPS, audit keamanan berkala |
| Performa lambat di HP lama | Sedang | Sedang | Optimasi bundle, lazy load, gambar dikompresi otomatis |

---

## 12. Kriteria Keberhasilan (KPI)

| KPI | Target (3 Bulan) |
|---|---|
| Persentase siswa aktif | > 70% dari total siswa |
| Partisipasi Minggu Literasi | > 85% per periode |
| Rata-rata tulisan per siswa/bulan | > 3 tulisan |
| Rata-rata panjang tulisan | > 200 kata |
| Rating kepuasan guru | > 4/5 |
| Waktu muat beranda | < 2 detik |

---

## 13. Glosarium

| Istilah | Definisi |
|---|---|
| NIS | Nomor Induk Siswa, identitas unik setiap siswa |
| Minggu Literasi | Periode tertentu (dimulai Senin) saat siswa wajib menulis |
| Feed | Aliran tulisan di halaman beranda seperti timeline media sosial |
| Decay Function | Fungsi penurunan skor popularitas seiring waktu agar konten lama tidak mendominasi |
| Draft | Tulisan yang belum dipublikasikan, hanya bisa dilihat penulis |
| Badge | Penanda/ikon pencapaian yang diperoleh siswa |

---

*Dokumen ini bersifat living document dan akan diperbarui seiring perkembangan proyek.*
