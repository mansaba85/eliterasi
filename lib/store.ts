'use client';

import { 
  User, 
  Class, 
  Category, 
  Post, 
  MingguLiterasiPeriod, 
  Challenge, 
  Announcement, 
  ReadingBook, 
  LibraryBook,
  SchoolSettings,
  CertificateRecord,
  AuditLog,
  Comment,
  Reaction,
  Grade,
  Achievement,
  UserRole
} from './types';

// Initial Categories
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', nama: 'Buku Harian', kode: 'buku-harian', ikon: '📔', isActive: true },
  { id: 'cat-2', nama: 'Sinopsis & Resensi Buku', kode: 'sinopsis-resensi', ikon: '📚', isActive: true },
  { id: 'cat-3', nama: 'Cerpen', kode: 'cerpen', ikon: '✍️', isActive: true },
  { id: 'cat-4', nama: 'Puisi', kode: 'puisi', ikon: '🌸', isActive: true },
  { id: 'cat-5', nama: 'Laporan Hasil Pengamatan', kode: 'laporan-pengamatan', ikon: '🔬', isActive: true },
  { id: 'cat-6', nama: 'Esai & Opini', kode: 'esai', ikon: '💬', isActive: true },
  { id: 'cat-7', nama: 'Berita & Artikel', kode: 'berita', ikon: '📰', isActive: true },
  { id: 'cat-8', nama: 'Dongeng & Cerita Rakyat', kode: 'dongeng', ikon: '🧚', isActive: true },
  { id: 'cat-9', nama: 'Lainnya', kode: 'lainnya', ikon: '📝', isActive: true },
];

// Initial Classes
const INITIAL_CLASSES: Class[] = [
  { id: 'cls-1', namaKelas: 'XII IPA 1', tingkat: 'XII', tahunAjaran: '2026/2027', waliKelasId: 'usr-guru-1', waliKelasNama: 'Pak Slamet Wibowo, S.Pd.' },
  { id: 'cls-2', namaKelas: 'XI IPA 1', tingkat: 'XI', tahunAjaran: '2026/2027', waliKelasId: 'usr-guru-3', waliKelasNama: 'Ibu Kartini, S.Pd.' },
  { id: 'cls-3', namaKelas: 'XI IPS 1', tingkat: 'XI', tahunAjaran: '2026/2027', waliKelasId: 'usr-guru-2', waliKelasNama: 'Bu Endang Rahayu, M.Pd.' },
  { id: 'cls-4', namaKelas: 'XII IPA 2', tingkat: 'XII', tahunAjaran: '2026/2027', waliKelasId: 'usr-guru-2', waliKelasNama: 'Bu Endang Rahayu, M.Pd.' },
  { id: 'cls-5', namaKelas: 'X IPA 3', tingkat: 'X', tahunAjaran: '2026/2027', waliKelasId: 'usr-admin', waliKelasNama: 'Koordinator Literasi' },
];

// Initial Users
const INITIAL_USERS: User[] = [
  // Students
  { id: 'usr-sis-1', nis: '2024001', nama: 'Naila Azzahra', tanggalLahir: '14/09/2008', kelasId: 'cls-1', kelasNama: 'XII IPA 1', role: 'siswa', bio: 'Suka membaca dan menulis puisi. Bermimpi jadi penulis profesional suatu hari nanti.', poin: 1240, createdAt: '2026-08-01T08:00:00Z' },
  { id: 'usr-sis-2', nis: '12345', nama: 'Siti Maryam', tanggalLahir: '17/08/2010', kelasId: 'cls-2', kelasNama: 'XI IPA 1', role: 'siswa', bio: 'Suka menulis cerpen tentang kehidupan sehari-hari.', poin: 2100, createdAt: '2026-08-01T08:15:00Z' },
  { id: 'usr-sis-3', nis: '12346', nama: 'Dewi Rahmawati', tanggalLahir: '12/12/2009', kelasId: 'cls-3', kelasNama: 'XI IPS 1', role: 'siswa', bio: 'Senang membaca dan menulis puisi indah.', poin: 1560, createdAt: '2026-08-02T09:00:00Z' },
  { id: 'usr-sis-4', nis: '12347', nama: 'Ahmad Fauzi', tanggalLahir: '01/01/2010', kelasId: 'cls-4', kelasNama: 'XII IPA 2', role: 'siswa', bio: 'Menulis artikel opini ilmiah adalah kegemaran saya.', poin: 980, createdAt: '2026-08-01T08:30:00Z' },
  { id: 'usr-sis-5', nis: '12348', nama: 'Rizky Maulana', tanggalLahir: '20/10/2010', kelasId: 'cls-5', kelasNama: 'X IPA 3', role: 'siswa', bio: 'Masih belajar menulis di madrasah.', poin: 340, createdAt: '2026-08-05T14:20:00Z' },
  
  // Teachers
  { id: 'usr-guru-1', username: 'guru1', nama: 'Pak Slamet Wibowo, S.Pd.', role: 'guru', bio: 'Guru / Pembimbing Literasi & Guru Bahasa Indonesia. Pembina Klub Literasi Madrasah.', poin: 0, createdAt: '2026-08-01T07:00:00Z' },
  { id: 'usr-guru-2', username: 'guru2', nama: 'Bu Endang Rahayu, M.Pd.', role: 'guru', bio: 'Guru / Pembimbing Literasi & Guru Bahasa Inggris. Pecinta karya sastra klasik.', poin: 0, createdAt: '2026-08-01T07:10:00Z' },
  { id: 'usr-guru-3', username: 'guru3', nama: 'Ibu Kartini, S.Pd.', role: 'guru', bio: 'Guru / Pembimbing Literasi & Guru Sejarah. Mengajarkan siswa menulis jurnal sejarah lokal.', poin: 0, createdAt: '2026-08-01T07:15:00Z' },
  
  // Admin & Principal
  { id: 'usr-admin', username: 'admin', nama: 'Admin Koordinator Literasi', role: 'admin', bio: 'Tim Admin IT E-Literasi MA NU 01 Banyuputih.', poin: 0, createdAt: '2026-08-01T06:00:00Z' },
  { id: 'usr-kepala', username: 'kepala', nama: 'H. Ahmad Muzaki, S.Ag.', role: 'kepala_madrasah', bio: 'Kepala Madrasah MA NU 01 Banyuputih. Berkomitmen mewujudkan generasi cerdas berliterasi.', poin: 0, createdAt: '2026-08-01T05:00:00Z' }
];

// Initial Scheduled Literacy Agendas (Diagendakan secara manual, pelaksanaan 1 hari — umumnya hari Senin)
const INITIAL_PERIODS: MingguLiterasiPeriod[] = [
  { 
    id: 'per-1', 
    nama: 'Agenda Literasi (Senin, 1 September 2026)', 
    tanggalPelaksanaan: '2026-09-01', 
    tanggalMulai: '2026-09-01', 
    tanggalSelesai: '2026-09-01', 
    isActive: false, 
    kategoriIdWajib: 'cat-4', 
    kategoriNamaWajib: 'Puisi', 
    temaInstruksi: 'Mengekspresikan keindahan madrasah dan semangat belajar dalam bait-bait puisi.',
    izinkanBebas: true,
    createdAt: '2026-08-30T10:00:00Z' 
  },
  { 
    id: 'per-2', 
    nama: 'Agenda Literasi (Senin, 8 September 2026)', 
    tanggalPelaksanaan: '2026-09-08', 
    tanggalMulai: '2026-09-08', 
    tanggalSelesai: '2026-09-08', 
    isActive: true, 
    kategoriIdWajib: 'cat-2', 
    kategoriNamaWajib: 'Sinopsis & Resensi', 
    temaInstruksi: 'Membaca 1 buku di perpustakaan/sudut baca dan menuliskan intisari resensinya.',
    izinkanBebas: true,
    createdAt: '2026-09-07T10:00:00Z' 
  },
  { 
    id: 'per-3', 
    nama: 'Agenda Literasi (Senin, 15 September 2026)', 
    tanggalPelaksanaan: '2026-09-15', 
    tanggalMulai: '2026-09-15', 
    tanggalSelesai: '2026-09-15', 
    isActive: false, 
    kategoriIdWajib: 'bebas', 
    kategoriNamaWajib: 'Bebas (Pilihan Siswa)', 
    temaInstruksi: 'Bebas menulis cerpen, artikel opini, puisi, atau esai ilmiah sesuai minat.',
    izinkanBebas: true,
    createdAt: '2026-09-07T10:05:00Z' 
  },
];

// Initial Posts (Literacy works written by students)
const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    judul: 'Goresan Senja di Pelataran Madrasah',
    isi: `Sinar matahari sore itu perlahan meredup, menyisakan bias jingga di langit Banyuputih. Di pelataran MA NU 01 Banyuputih, angin berembus sejuk membawa aroma dedaunan basah sehabis hujan. Gemuruh suara siswa yang bersiap pulang berbaur dengan damai yang perlahan turun.

Bagi saya, sudut madrasah ini bukan sekadar tempat menuntut ilmu formal, melainkan saksi bisu dari jutaan impian anak-anak pesisir yang digantungkan setinggi langit. Setiap sudutnya menyimpan cerita perjuangan: dari tawa riang di kantin hingga tatapan serius di ruang kelas.

Di bawah naungan pohon rindang dekat masjid, saya merenung. Kita semua adalah musafir ilmu, yang berjalan mencari lentera di tengah kegelapan dunia. Menulis di sore hari seperti ini membuat saya sadar bahwa setiap detik yang terlewati di madrasah ini adalah bait-bait puisi indah yang patut diabadikan.`,
    kategoriId: 'cat-4', // Puisi
    authorId: 'usr-sis-4',
    authorNama: 'Ahmad Fauzi',
    authorKelas: 'XII IPA 2',
    isMingguLiterasi: true,
    periodeId: 'per-1',
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/senjamadrasah/800/450',
    jumlahKata: 154,
    createdAt: '2026-09-03T16:30:00Z',
    updatedAt: '2026-09-03T16:30:00Z',
    likes: ['usr-sis-2', 'usr-sis-1', 'usr-guru-1'],
    tags: ['senja', 'madrasah', 'refleksi', 'keindahan'],
    comments: [
      { id: 'c-1', postId: 'post-1', authorId: 'usr-guru-1', authorNama: 'Pak Slamet Wibowo, S.Pd.', authorRole: 'guru', isi: 'Gaya bahasa yang sangat puitis dan penuh penghayatan, Fauzi. Pemilihan diksinya sangat indah. Pertahankan!', createdAt: '2026-09-04T08:15:00Z' },
      { id: 'c-2', postId: 'post-1', authorId: 'usr-sis-2', authorNama: 'Siti Maryam', authorRole: 'siswa', authorKelas: 'XI IPA 1', isi: 'Wah indah sekali puisinya Fauzi! Jadi rindu sekolah kalau pas libur.', createdAt: '2026-09-04T10:20:00Z' }
    ],
    reactions: [
      { id: 'r-1', postId: 'post-1', userId: 'usr-sis-2', tipeReaksi: 'kagum', createdAt: '2026-09-04T10:21:00Z' },
      { id: 'r-2', postId: 'post-1', userId: 'usr-sis-1', tipeReaksi: 'menginspirasi', createdAt: '2026-09-04T12:00:00Z' }
    ],
    grade: {
      skor: 92,
      catatan: 'Pilihan diksi puitis, struktur kalimat rapi, dan mampu menyentuh emosi pembaca dengan baik.',
      guruId: 'usr-guru-1',
      guruNama: 'Pak Slamet Wibowo, S.Pd.',
      gradedAt: '2026-09-05T08:30:00Z'
    }
  },
  {
    id: 'post-2',
    judul: 'Resensi Novel "Bumi" Karya Tere Liye',
    isi: `Judul Buku: Bumi
Penulis: Tere Liye
Penerbit: Gramedia Pustaka Utama
Tahun Terbit: 2014
Tebal Halaman: 440 Halaman

Novel "Bumi" merupakan buku pertama dari seri petualangan dunia paralel karya Tere Liye. Kisah ini berpusat pada Raib, seorang remaja perempuan berusia 15 tahun yang memiliki kemampuan unik: ia bisa menghilang. Petualangan sesungguhnya dimulai ketika sosok misterius bernama Kurus muncul dari dalam cermin kamarnya, dan Raib menyadari ia bukan sekadar manusia biasa. Bersama dua sahabatnya, Seli (yang bisa mengeluarkan petir) dan Ali (seorang genius berotak cemerlang yang bisa berubah menjadi beruang), Raib menjelajahi Dunia Bulan yang penuh keajaiban dan teknologi tingkat tinggi.

**Kelebihan:**
Tere Liye sangat ahli dalam membangun dunia fantasi (world-building) yang terasa masuk akal dan detail. Persahabatan antara Raib, Seli, dan Ali digambarkan dengan sangat hangat, penuh humor, dan saling melengkapi. Plot twist di bagian akhir cerita juga sangat memuaskan dan membuat pembaca tidak sabar membuka buku berikutnya, "Bulan".

**Kelemahan:**
Di beberapa bagian awal, tempo cerita terasa agak lambat karena penulis harus menjelaskan latar belakang kehidupan sekolah Raib secara panjang lebar. Selain itu, ada beberapa deskripsi teknologi Dunia Bulan yang terkadang terlalu rumit untuk dipahami dalam sekali baca.

**Kesimpulan:**
Novel ini sangat direkomendasikan untuk remaja penyuka fiksi ilmiah dan fantasi. Tere Liye berhasil membuktikan bahwa penulis Indonesia mampu memproduksi karya fantasi berkualitas tinggi yang tidak kalah dengan karya penulis mancanegara.`,
    kategoriId: 'cat-2', // Sinopsis & Resensi
    authorId: 'usr-sis-2',
    authorNama: 'Siti Maryam',
    authorKelas: 'XI IPA 1',
    isMingguLiterasi: true,
    periodeId: 'per-1',
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/bumitereliye/800/450',
    jumlahKata: 263,
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    likes: ['usr-sis-1', 'usr-sis-4', 'usr-sis-3', 'usr-guru-2'],
    tags: ['resensi', 'novel', 'tereliye', 'fantasi'],
    comments: [
      { id: 'c-3', postId: 'post-2', authorId: 'usr-sis-4', authorNama: 'Ahmad Fauzi', authorRole: 'siswa', authorKelas: 'XII IPA 2', isi: 'Resensi yang keren Maryam! Saya jadi tertarik baca novel Bumi ini setelah baca ulasan kamu.', createdAt: '2026-09-04T14:30:00Z' },
      { id: 'c-4', postId: 'post-2', authorId: 'usr-guru-2', authorNama: 'Bu Endang Rahayu, M.Pd.', authorRole: 'guru', isi: 'Analisis kelebihan dan kelemahan novel ditulis secara objektif dan sistematis. Penggunaan bahasa Indonesia yang baik dan benar sangat terlihat di sini. Bagus sekali!', createdAt: '2026-09-05T09:10:00Z' }
    ],
    reactions: [
      { id: 'r-3', postId: 'post-2', userId: 'usr-sis-4', tipeReaksi: 'informatif', createdAt: '2026-09-04T11:00:00Z' },
      { id: 'r-4', postId: 'post-2', userId: 'usr-guru-2', tipeReaksi: 'kagum', createdAt: '2026-09-05T09:11:00Z' }
    ],
    grade: {
      skor: 95,
      catatan: 'Resensi yang komprehensif, kritis, dan sangat informatif. Penyusunan bagian kelebihan dan kelemahan sangat tajam.',
      guruId: 'usr-guru-2',
      guruNama: 'Bu Endang Rahayu, M.Pd.',
      gradedAt: '2026-09-05T09:15:00Z'
    }
  },
  {
    id: 'post-3',
    judul: 'Pengamatan Ekosistem Pantai Banyuputih Batang',
    isi: `Pantai Banyuputih yang terletak di Kabupaten Batang merupakan salah satu ekosistem pesisir penting yang kaya akan keanekaragaman hayati. Pada hari Minggu kemarin, saya melakukan pengamatan langsung mengenai komponen abiotik dan biotik yang menyusun ekosistem pantai ini untuk melengkapi tugas biologi sekaligus memenuhi hobi pengamatan saya.

Berdasarkan pengamatan, komponen abiotik yang dominan di kawasan pantai ini meliputi pasir putih yang berbutir halus, batu-batu karang kecil di tepian air, suhu udara rata-rata 31 derajat Celcius, hembusan angin laut yang cukup kencang, serta tingkat keasinan (salinitas) air laut yang tinggi.

Sementara itu, komponen biotik atau makhluk hidup yang mendiami wilayah pantai ini mencakup beberapa jenis vegetasi seperti pohon kelapa (Cocos nucifera), tumbuhan pandan laut, dan beberapa sisa tanaman bakau (mangrove) di dekat muara sungai kecil. Untuk kelompok fauna, saya mengamati kawanan kepiting pasir kecil (Uca pugnax) yang berlarian membuat lubang di pasir, kerang-kerang kecil yang menempel pada batu karang, serta beberapa ekor burung kuntul perak yang mencari ikan kecil di permukaan air dangkal.

Pengamatan ini menunjukkan adanya interaksi yang sangat harmonis antara komponen biotik dan abiotik. Misalnya, kepiting pasir memanfaatkan abiotik pasir basah sebagai habitat pelindung dari terik matahari, sementara vegetasi pantai berperan menahan laju abrasi air laut terhadap daratan. Keberadaan sampah plastik yang ditinggalkan pengunjung di sekitar garis pantai menjadi ancaman nyata bagi kelestarian biotik di Pantai Banyuputih. Diperlukan kepedulian bersama untuk merawat pantai tercinta ini.`,
    kategoriId: 'cat-5', // Laporan Pengamatan
    authorId: 'usr-sis-3',
    authorNama: 'Dewi Rahmawati',
    authorKelas: 'XI IPS 1',
    isMingguLiterasi: false,
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/pantaibanyuputih/800/450',
    jumlahKata: 282,
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-09-10T09:00:00Z',
    likes: ['usr-sis-4', 'usr-sis-1'],
    tags: ['pantai', 'pengamatan', 'biologi', 'lingkungan', 'banyuputih'],
    comments: [],
    reactions: [
      { id: 'r-5', postId: 'post-3', userId: 'usr-sis-4', tipeReaksi: 'informatif', createdAt: '2026-09-10T09:30:00Z' }
    ]
  },
  {
    id: 'post-4',
    judul: 'Menatap Masa Depan Melalui Jendela Kata',
    isi: `Di tengah gempuran dunia digital yang serba instan, membaca buku sering kali dianggap sebagai aktivitas yang membosankan dan melelahkan oleh sebagian kalangan remaja. Padahal, buku adalah jendela dunia terpenting yang tidak pernah kehilangan kekuatannya untuk mengubah hidup seseorang. 

Melalui untaian kata dalam buku, kita diajak berkelana melintasi ruang dan waktu tanpa perlu melangkah sejauh satu jengkal pun. Kita bisa menyelami pikiran para filsuf abad Yunani Kuno, memahami rumus fisika rumit Albert Einstein, hingga merasakan kegetiran hidup pejuang kemerdekaan bangsa Indonesia. Membaca bukan sekadar mengeja huruf demi huruf, melainkan sebuah proses rekonstruksi pemikiran, merangsang daya imajinasi kreatif, dan memperhalus rasa empati sosial.

Program literasi yang diadakan di MA NU 01 Banyuputih setiap pekannya adalah langkah emas yang sangat strategis. Melalui program ini, kita dipaksa sekaligus dibiasakan untuk meluangkan waktu bersahabat dengan buku. Kebiasaan membaca yang konsisten akan melahirkan generasi muda yang kritis, tidak mudah termakan berita bohong (hoaks), dan memiliki wawasan global namun tetap memegang teguh nilai akhlakul karimah. Mari kita jadikan buku sebagai sahabat setia di kala senggang, demi masa depan yang lebih cerah!`,
    kategoriId: 'cat-6', // Esai
    authorId: 'usr-sis-1',
    authorNama: 'Naila Azzahra',
    authorKelas: 'XII IPA 1',
    isMingguLiterasi: true,
    periodeId: 'per-2', // Minggu Literasi aktif saat ini!
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/jendelakata/800/450',
    jumlahKata: 205,
    createdAt: '2026-09-12T08:00:00Z',
    updatedAt: '2026-09-12T08:00:00Z',
    likes: ['usr-sis-1', 'usr-sis-2', 'usr-guru-2', 'usr-kepala'],
    tags: ['literasi', 'buku', 'esai', 'pendidikan', 'remaja'],
    comments: [
      { id: 'c-5', postId: 'post-4', authorId: 'usr-kepala', authorNama: 'H. Ahmad Muzaki, S.Ag.', authorRole: 'kepala_madrasah', isi: 'Esai yang luar biasa cerdas, nak Dewi! Pikiranmu sangat kritis dan visioner. Inilah salah satu buah manis dari gemar berliterasi di madrasah kita. Sukses selalu.', createdAt: '2026-09-12T09:15:00Z' }
    ],
    reactions: [
      { id: 'r-6', postId: 'post-4', userId: 'usr-kepala', tipeReaksi: 'menginspirasi', createdAt: '2026-09-12T09:16:00Z' },
      { id: 'r-7', postId: 'post-4', userId: 'usr-sis-1', tipeReaksi: 'kreatif', createdAt: '2026-09-12T10:00:00Z' }
    ],
    // Belum dinilai oleh guru, guru bisa menilai ini di panel guru karena ini periode aktif (per-2)
  },
  {
    id: 'post-5',
    judul: 'Jejak Langkah di Pagi Santri',
    isi: `Suara alarm azan Subuh berkumandang dari pelantun suara masjid madrasah, memecah keheningan fajar di Banyuputih. Langit masih tampak gelap kebiruan ketika Rian membuka mata, merapikan selimut, dan bergegas mengambil air wudu.\n\nKehidupan sebagai santri sekaligus pelajar di MA NU 01 Banyuputih menuntut kedisiplinan tinggi. Pagi hari dimulai dengan salat berjemaah, dilanjutkan tadarus Al-Qur'an bersama teman sekamar di asrama. Aroma teh hangat dan nasi uduk dari kantin madrasah menyambut langkah mereka menuju ruang kelas.\n\nBagi Rian, lelah fisik membayar ilmu adalah kenikmatan tersendiri. Di balik peluh dan buku-buku tebal yang menumpuk di meja belajar, tersimpan cita-cita luhur untuk membanggakan kedua orang tua dan berbakti kepada agama serta bangsa.`,
    kategoriId: 'cat-3', // Cerpen
    authorId: 'usr-sis-5',
    authorNama: 'Rizky Maulana',
    authorKelas: 'X IPA 3',
    isMingguLiterasi: true,
    periodeId: 'per-2',
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/santripagi/800/450',
    jumlahKata: 165,
    createdAt: '2026-09-13T05:00:00Z',
    updatedAt: '2026-09-13T05:00:00Z',
    likes: ['usr-sis-1', 'usr-sis-2'],
    tags: ['cerpen', 'santri', 'pagi', 'madrasah', 'inspirasi'],
    comments: [
      { id: 'c-6', postId: 'post-5', authorId: 'usr-guru-1', authorNama: 'Pak Slamet Wibowo, S.Pd.', authorRole: 'guru', isi: 'Cerpen yang sangat dekat dengan realitas kehidupan sehari-hari santri. Terus kembangkan bakat menulismu ya Nak!', createdAt: '2026-09-13T07:30:00Z' }
    ],
    reactions: [
      { id: 'r-8', postId: 'post-5', userId: 'usr-sis-1', tipeReaksi: 'menginspirasi', createdAt: '2026-09-13T06:00:00Z' }
    ]
  },
  {
    id: 'post-6',
    judul: 'Guru, Pelita di Ufuk Timur',
    isi: `Di kala gulita kebodohan membentang,\nKau hadir membawa obor penerang.\nTanpa lelah kau eja sabda kebaikan,\nMembimbing langkah dalam keikhlasan.\n\nWahai guru pencetak generasi bangsa,\nJasamu terukir abadi sepanjang masa.\nDari tanganmu lahir tunas-tunas berdikari,\nMengabdi pada agama, nusa, dan pertiwi.\n\nTerima kasih, pahlawan tanpa tanda jasa,\nDoa kami selalu menyertaimu senantiasa.`,
    kategoriId: 'cat-4', // Puisi
    authorId: 'usr-sis-2',
    authorNama: 'Siti Maryam',
    authorKelas: 'XI IPA 1',
    isMingguLiterasi: true,
    periodeId: 'per-2',
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/gurupelita/800/450',
    jumlahKata: 84,
    createdAt: '2026-09-11T14:20:00Z',
    updatedAt: '2026-09-11T14:20:00Z',
    likes: ['usr-sis-1', 'usr-sis-3', 'usr-guru-1', 'usr-guru-2'],
    tags: ['puisi', 'guru', 'dedikasi', 'sastra'],
    comments: [],
    reactions: [
      { id: 'r-9', postId: 'post-6', userId: 'usr-guru-1', tipeReaksi: 'kagum', createdAt: '2026-09-11T15:00:00Z' }
    ]
  },
  {
    id: 'post-7',
    judul: 'Catatan Hari Pertama Ujian Madrasah',
    isi: `Pukul 06.30 WIB, bel madrasah berbunyi nyaring. Jantungku berdegup sedikit lebih kencang dari biasanya. Hari ini adalah hari pertama pelaksanaan Ujian Semester di MA NU 01 Banyuputih.\n\nMalam sebelumnya, aku sudah belajar hingga larut malam ditemani segelas susu hangat dan lampu meja belajar. Segala ikhtiar doa telah dipanjatkan seusai salat malam. Ketika lembar soal dibagikan oleh pengawas ruang, bismillah kubaca perlahan.\n\nUjian bukan sekadar mencari angka sepuluh atau predikat tertinggi, melainkan ujian kejujuran dan ketulusan niat dalam mencari ilmu yang barokah. Semoga hasil hari ini membawa keberkahan bagi masa depanku.`,
    kategoriId: 'cat-1', // Buku Harian
    authorId: 'usr-sis-1',
    authorNama: 'Naila Azzahra',
    authorKelas: 'XII IPA 1',
    isMingguLiterasi: false,
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/catatanujian/800/450',
    jumlahKata: 147,
    createdAt: '2026-09-08T07:15:00Z',
    updatedAt: '2026-09-08T07:15:00Z',
    likes: ['usr-sis-2', 'usr-sis-4'],
    tags: ['bukuharian', 'ujian', 'jurnal', 'sekolah'],
    comments: [],
    reactions: [
      { id: 'r-10', postId: 'post-7', userId: 'usr-sis-2', tipeReaksi: 'menginspirasi', createdAt: '2026-09-08T09:00:00Z' }
    ]
  },
  {
    id: 'post-8',
    judul: 'Legenda Asal Usul Pantai Jodo Batang',
    isi: `Kabupaten Batang menyimpan banyak cerita legenda rakyat yang turun-temurun diwariskan oleh para leluhur, salah satunya adalah kisah di balik keindahan Pantai Jodo di kawasan Banyuputih.\n\nKonon, dinamakan Pantai Jodo karena dahulu kala tempat tersebut menjadi titik pertemuan (jodoh) para pedagang pesisir Nusantara yang singgah dengan perahu layar mereka. Selain itu, ada kisah romantis sepasang kekasih pejuang lokal yang berjanji sehidup semati di tebing karang pantai tersebut.\n\nKini, Pantai Jodo tidak hanya menyimpan kisah legenda masa lalu, tetapi juga menjadi destinasi wisata alam yang menenangkan jiwa, tempat para pelajar merehatkan pikiran seusai penat belajar di madrasah.`,
    kategoriId: 'cat-8', // Dongeng & Cerita Rakyat
    authorId: 'usr-sis-3',
    authorNama: 'Dewi Rahmawati',
    authorKelas: 'XI IPS 1',
    isMingguLiterasi: false,
    visibilitas: 'publik',
    status: 'published',
    coverImage: 'https://picsum.photos/seed/pantaijodo/800/450',
    jumlahKata: 152,
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
    likes: ['usr-sis-1', 'usr-sis-2', 'usr-sis-4'],
    tags: ['legenda', 'ceritarakyat', 'pantaijodo', 'batang'],
    comments: [],
    reactions: [
      { id: 'r-11', postId: 'post-8', userId: 'usr-sis-1', tipeReaksi: 'informatif', createdAt: '2026-09-02T12:30:00Z' }
    ]
  }
];

// Initial Challenges
const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    judul: 'Kisah Inspiratif di Balik Hari Kemerdekaan',
    deskripsi: 'Tulis sebuah cerita pendek, esai, atau puisi yang menceritakan tentang perjuangan tokoh pahlawan lokal di daerah sekitarmu dalam mempertahankan kemerdekaan Indonesia. Karya terbaik akan ditampilkan di Mading Utama Madrasah!',
    tema: 'Perjuangan & Kemerdekaan',
    tanggalMulai: '2026-08-15',
    tanggalSelesai: '2026-09-20',
    createdBy: 'Tim Koordinator',
    peserta: ['usr-sis-1', 'usr-sis-4'],
    poinBonus: 50,
    coverImage: 'https://picsum.photos/seed/kemerdekaan/800/450'
  },
  {
    id: 'ch-2',
    judul: 'Merawat Bumi Sejak dari Pikiran',
    deskripsi: 'Buatlah laporan hasil pengamatan lingkungan atau esai kritis mengenai masalah sampah plastik di lingkungan sekitar MA NU 01 Banyuputih beserta alternatif solusi kreatif yang bisa kamu tawarkan sebagai siswa madrasah.',
    tema: 'Kelestarian Lingkungan Hidup',
    tanggalMulai: '2026-09-10',
    tanggalSelesai: '2026-10-10',
    createdBy: 'Ibu Kartini, S.Pd.',
    peserta: ['usr-sis-2'],
    poinBonus: 60,
    coverImage: 'https://picsum.photos/seed/kelestarianlingkungan/800/450'
  }
];

// Initial Announcements
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    judul: 'Sosialisasi Website E-Literasi MA NU 01 Banyuputih',
    isi: 'Selamat datang para siswa dan guru di platform E-Literasi baru kita! Mulai pekan ini, pengisian jurnal literasi, pengumpulan resensi buku, dan rekap partisipasi Minggu Literasi wajib dilakukan melalui sistem digital ini. Silakan hubungi Pak Slamet atau Admin Madrasah jika mengalami kendala login.',
    createdBy: 'Kepala Madrasah',
    isActive: true,
    createdAt: '2026-09-01T07:00:00Z'
  },
  {
    id: 'ann-2',
    judul: 'Periode Minggu Literasi Ke-2 September Sedang Berjalan',
    isi: 'Diberitahukan kepada seluruh siswa kelas X, XI, dan XII bahwa periode Minggu Literasi Ke-2 September 2026 resmi dimulai dari Senin, 8 September 2026 hingga Senin depan, 14 September 2026. Mohon segera mempublikasikan minimal 1 tulisan bertag "Minggu Literasi" agar terekap hadir oleh wali kelas masing-masing.',
    createdBy: 'Koordinator Literasi',
    isActive: true,
    createdAt: '2026-09-08T07:30:00Z'
  }
];

// Initial Reading Books
const INITIAL_READING_BOOKS: ReadingBook[] = [
  { id: 'b-1', userId: 'usr-sis-1', judulBuku: 'Bumi', pengarang: 'Tere Liye', genre: 'Fantasi', statusBaca: 'sudah', sinopsis: 'Petualangan Raib di dunia paralel.', createdAt: '2026-08-10T08:00:00Z' },
  { id: 'b-2', userId: 'usr-sis-1', judulBuku: 'Bulan', pengarang: 'Tere Liye', genre: 'Fantasi', statusBaca: 'sedang', sinopsis: 'Petualangan Raib ke Dunia Matahari.', createdAt: '2026-09-01T08:00:00Z' },
  { id: 'b-3', userId: 'usr-sis-2', judulBuku: 'Bumi Manusia', pengarang: 'Pramoedya Ananta Toer', genre: 'Sastra Sejarah', statusBaca: 'sudah', sinopsis: 'Kisah perjuangan Minke di era kolonial.', createdAt: '2026-08-15T08:00:00Z' },
  { id: 'b-4', userId: 'usr-sis-4', judulBuku: 'Laskar Pelangi', pengarang: 'Andrea Hirata', genre: 'Inspirasi', statusBaca: 'sudah', sinopsis: 'Kisah perjuangan anak-anak Belitong bersekolah.', createdAt: '2026-08-05T08:00:00Z' },
  { id: 'b-5', userId: 'usr-sis-4', judulBuku: 'Madilog', pengarang: 'Tan Malaka', genre: 'Filsafat', statusBaca: 'sedang', sinopsis: 'Panduan berpikir materialisme, dialektika, logika.', createdAt: '2026-09-01T08:00:00Z' }
];

// Initial School Profile & Settings
const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaMadrasah: 'MA NU 01 Banyuputih',
  motto: 'Generasi Literat, Berakhlak Mulia & Berprestasi Unggul',
  logoUrl: '',
  alamat: 'Jl. Lapangan Banyuputih No. 01, Kec. Banyuputih, Kab. Batang, Jawa Tengah',
  telepon: '(0285) 666123',
  email: 'manubanyuputih@gmail.com',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  kepalaMadrasahNama: 'H. Ahmad Muzaki, S.Ag.',
  kepalaMadrasahNip: '197508122005011003',
  koordinatorLiterasiNama: 'Pak Slamet Wibowo, S.Pd.',
  koordinatorLiterasiNip: '198203152009021004',
  poinSettings: {
    poinSetorKarya: 50,
    poinSuka: 5,
    poinKomentar: 10,
    poinBukuMandiri: 30,
    poinNilaiGuruMultiplier: 0.5,
  },
  updatedAt: '2026-09-15T08:30:00Z'
};

// Initial Library Books
const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'lib-1',
    judul: 'Negeri 5 Menara',
    penulis: 'A. Fuadi',
    penerbit: 'Gramedia Pustaka Utama',
    tahunTerbit: '2009',
    kategori: 'Fiksi & Inspirasi',
    sinopsis: 'Kisah enam santri di Pondok Madani yang mempercayai mantra ajaib "Man Jadda Wajada" (Siapa yang bersungguh-sungguh, akan berhasil). Mereka bermimpi menaklukkan dunia dari bawah menara masjid.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    pdfUrl: 'https://example.com/ebook/negeri-5-menara.pdf',
    isWajib: true,
    jumlahHalaman: 423,
    dibacaCount: 42,
    createdAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'lib-2',
    judul: 'Tenggelamnya Kapal Van der Wijck',
    penulis: 'Buya Hamka',
    penerbit: 'Bulan Bintang',
    tahunTerbit: '1938',
    kategori: 'Sastra Klasik & Adat',
    sinopsis: 'Kisah cinta tragis antara Zainuddin dan Hayati yang terhalang oleh adat Minangkabau yang kaku. Menghadirkan nilai-nilai moral, keteguhan hati, dan keindahan bahasa sastra Buya Hamka.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    pdfUrl: 'https://example.com/ebook/vanderwijck.pdf',
    isWajib: true,
    jumlahHalaman: 260,
    dibacaCount: 31,
    createdAt: '2026-08-05T09:00:00Z'
  },
  {
    id: 'lib-3',
    judul: 'Madilog (Materialisme, Dialektika, Logika)',
    penulis: 'Tan Malaka',
    penerbit: 'Narasi',
    tahunTerbit: '1943',
    kategori: 'Filsafat & Sains',
    sinopsis: 'Karya magnum opus Tan Malaka yang mengajak bangsa Indonesia keluar dari cara berpikir mistis menuju cara berpikir ilmiah, logis, dan rasional demi kemajuan peradaban.',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    pdfUrl: '',
    isWajib: false,
    jumlahHalaman: 568,
    dibacaCount: 18,
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'lib-4',
    judul: 'Sepotong Senja untuk Pacarku',
    penulis: 'Seno Gumira Ajidarma',
    penerbit: 'Gramedia Pustaka Utama',
    tahunTerbit: '2002',
    kategori: 'Cerpen Sastra',
    sinopsis: 'Kumpulan cerpen eksperimental yang puitis dan penuh imajinasi surealis karya sastrawan terkemuka Indonesia.',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    pdfUrl: '',
    isWajib: false,
    jumlahHalaman: 220,
    dibacaCount: 25,
    createdAt: '2026-08-12T11:00:00Z'
  }
];

// Initial Certificates
const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-1',
    nomorSertifikat: '045/MA.NU.01/LIT/IX/2026',
    userId: 'usr-sis-2',
    namaPenerima: 'Siti Maryam',
    nisPenerima: '12345',
    kelasPenerima: 'XI IPA 1',
    judulPenghargaan: 'Duta Literasi Madrasah Bulan September 2026',
    predikat: 'Sangat Memuaskan (Peringkat 1 Poin Madrasah)',
    kategori: 'Duta Literasi',
    tanggalTerbit: '2026-09-15',
    kepalaMadrasahNama: 'H. Ahmad Muzaki, S.Ag.',
    kepalaMadrasahNip: '197508122005011003',
    catatanApresiasi: 'Atas dedikasi dan konsistensi luar biasa dalam membaca buku dan menghasilkan 12 karya sastra bermutu di platform E-Literasi.',
    createdAt: '2026-09-15T08:00:00Z'
  },
  {
    id: 'cert-2',
    nomorSertifikat: '046/MA.NU.01/LIT/IX/2026',
    userId: 'usr-sis-3',
    namaPenerima: 'Dewi Rahmawati',
    nisPenerima: '12346',
    kelasPenerima: 'XI IPS 1',
    judulPenghargaan: 'Penulis Resensi & Puisi Terbaik',
    predikat: 'Karya Terbaik Pilihan Guru Pembimbing',
    kategori: 'Penulis Terbaik',
    tanggalTerbit: '2026-09-14',
    kepalaMadrasahNama: 'H. Ahmad Muzaki, S.Ag.',
    kepalaMadrasahNip: '197508122005011003',
    catatanApresiasi: 'Diberikan atas keunggulan diksi, orisinalitas ide, dan estetika penulisan resensi buku sastra.',
    createdAt: '2026-09-14T09:00:00Z'
  }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'usr-admin',
    userNama: 'Admin Koordinator Literasi',
    userRole: 'admin',
    action: 'UPDATE_PENGATURAN',
    detail: 'Memperbarui pengaturan tahun ajaran aktif ke 2026/2027 Semester Ganjil.',
    timestamp: '2026-09-15T08:30:00Z'
  },
  {
    id: 'log-2',
    userId: 'usr-admin',
    userNama: 'Admin Koordinator Literasi',
    userRole: 'admin',
    action: 'TERBITKAN_SERTIFIKAT',
    detail: 'Menerbitkan e-Sertifikat Duta Literasi No. 045/MA.NU.01/LIT/IX/2026 untuk Siti Maryam.',
    targetId: 'usr-sis-2',
    targetName: 'Siti Maryam',
    timestamp: '2026-09-15T08:00:00Z'
  },
  {
    id: 'log-3',
    userId: 'usr-admin',
    userNama: 'Admin Koordinator Literasi',
    userRole: 'admin',
    action: 'TOGGLE_AGENDA',
    detail: 'Mengaktifkan status Agenda Literasi (Senin, 8 September 2026).',
    targetId: 'per-2',
    targetName: 'Agenda Literasi (Senin, 8 September 2026)',
    timestamp: '2026-09-08T07:00:00Z'
  },
  {
    id: 'log-4',
    userId: 'usr-admin',
    userNama: 'Admin Koordinator Literasi',
    userRole: 'admin',
    action: 'TAMBAH_USER',
    detail: 'Menambahkan akun siswa baru: Rizky Maulana (NIS: 12348, Kelas: X IPA 3).',
    targetId: 'usr-sis-5',
    targetName: 'Rizky Maulana',
    timestamp: '2026-08-05T14:20:00Z'
  }
];

// Standard Achievements List
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', nama: 'Penulis Pemula', deskripsi: 'Publikasikan 1 tulisan pertamamu', ikon: '🌱', kriteria: 'Menulis 1 karya', poinDibutuhkan: 10 },
  { id: 'ach-2', nama: 'Rajin Berliterasi', deskripsi: 'Publikasikan minimal 5 tulisan di web', ikon: '📚', kriteria: 'Menulis 5 karya', poinDibutuhkan: 50 },
  { id: 'ach-3', nama: 'Pujangga Sastra', deskripsi: 'Mendapat 10 like dari karya-karyamu', ikon: '💖', kriteria: 'Mendapat 10 like', poinDibutuhkan: 100 },
  { id: 'ach-4', nama: 'Pejuang Minggu Literasi', deskripsi: 'Menyelesaikan 2 Minggu Literasi berturut-turut', ikon: '🏆', kriteria: 'Menyelesaikan 2 Minggu Literasi', poinDibutuhkan: 150 },
  { id: 'ach-5', nama: 'Master Literasi', deskripsi: 'Mencapai total 500 poin di web', ikon: '👑', kriteria: 'Mendapat total 500 poin', poinDibutuhkan: 500 },
];

export class LiteStore {
  private static getStored<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(`eliterasi_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(e);
      return defaultValue;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`eliterasi_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }

  // State Getters with Auto-Healing & Seeding
  static getUsers(): User[] {
    const stored = this.getStored<User[]>('users', INITIAL_USERS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const existingIds = new Set(stored.map(u => u.id));
    const missing = INITIAL_USERS.filter(u => !existingIds.has(u.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveUsers(merged);
      return merged;
    }
    return stored;
  }

  static getPosts(): Post[] {
    const stored = this.getStored<Post[]>('posts', INITIAL_POSTS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.savePosts(INITIAL_POSTS);
      return INITIAL_POSTS;
    }
    const existingIds = new Set(stored.map(p => p.id));
    const missing = INITIAL_POSTS.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.savePosts(merged);
      return merged;
    }
    return stored;
  }

  static getPeriods(): MingguLiterasiPeriod[] {
    const stored = this.getStored<MingguLiterasiPeriod[]>('periods', INITIAL_PERIODS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.savePeriods(INITIAL_PERIODS);
      return INITIAL_PERIODS;
    }
    const existingIds = new Set(stored.map(p => p.id));
    const missing = INITIAL_PERIODS.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.savePeriods(merged);
      return merged;
    }
    return stored;
  }

  static getClasses(): Class[] {
    const stored = this.getStored<Class[]>('classes', INITIAL_CLASSES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveClasses(INITIAL_CLASSES);
      return INITIAL_CLASSES;
    }
    const existingIds = new Set(stored.map(c => c.id));
    const missing = INITIAL_CLASSES.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveClasses(merged);
      return merged;
    }
    return stored;
  }

  static getCategories(): Category[] {
    const stored = this.getStored<Category[]>('categories', INITIAL_CATEGORIES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    const existingIds = new Set(stored.map(c => c.id));
    const missing = INITIAL_CATEGORIES.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveCategories(merged);
      return merged;
    }
    return stored;
  }

  static getChallenges(): Challenge[] {
    const stored = this.getStored<Challenge[]>('challenges', INITIAL_CHALLENGES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveChallenges(INITIAL_CHALLENGES);
      return INITIAL_CHALLENGES;
    }
    const existingIds = new Set(stored.map(c => c.id));
    const missing = INITIAL_CHALLENGES.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveChallenges(merged);
      return merged;
    }
    return stored;
  }

  static getAnnouncements(): Announcement[] {
    const stored = this.getStored<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
      return INITIAL_ANNOUNCEMENTS;
    }
    const existingIds = new Set(stored.map(a => a.id));
    const missing = INITIAL_ANNOUNCEMENTS.filter(a => !existingIds.has(a.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveAnnouncements(merged);
      return merged;
    }
    return stored;
  }

  static getReadingBooks(): ReadingBook[] {
    const stored = this.getStored<ReadingBook[]>('reading_books', INITIAL_READING_BOOKS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveReadingBooks(INITIAL_READING_BOOKS);
      return INITIAL_READING_BOOKS;
    }
    const existingIds = new Set(stored.map(b => b.id));
    const missing = INITIAL_READING_BOOKS.filter(b => !existingIds.has(b.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveReadingBooks(merged);
      return merged;
    }
    return stored;
  }

  static getSchoolSettings(): SchoolSettings {
    const stored = this.getStored<SchoolSettings>('school_settings', INITIAL_SCHOOL_SETTINGS);
    if (!stored || !stored.namaMadrasah) {
      this.saveSchoolSettings(INITIAL_SCHOOL_SETTINGS);
      return INITIAL_SCHOOL_SETTINGS;
    }
    return stored;
  }

  static getLibraryBooks(): LibraryBook[] {
    const stored = this.getStored<LibraryBook[]>('library_books', INITIAL_LIBRARY_BOOKS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveLibraryBooks(INITIAL_LIBRARY_BOOKS);
      return INITIAL_LIBRARY_BOOKS;
    }
    const existingIds = new Set(stored.map(b => b.id));
    const missing = INITIAL_LIBRARY_BOOKS.filter(b => !existingIds.has(b.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveLibraryBooks(merged);
      return merged;
    }
    return stored;
  }

  static getCertificates(): CertificateRecord[] {
    const stored = this.getStored<CertificateRecord[]>('certificates', INITIAL_CERTIFICATES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveCertificates(INITIAL_CERTIFICATES);
      return INITIAL_CERTIFICATES;
    }
    const existingIds = new Set(stored.map(c => c.id));
    const missing = INITIAL_CERTIFICATES.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveCertificates(merged);
      return merged;
    }
    return stored;
  }

  static getAuditLogs(): AuditLog[] {
    const stored = this.getStored<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return stored;
  }

  static getCurrentUser(): User | null {
    return this.getStored<User | null>('current_user', null);
  }

  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    this.saveUsers(INITIAL_USERS);
    this.savePosts(INITIAL_POSTS);
    this.savePeriods(INITIAL_PERIODS);
    this.saveClasses(INITIAL_CLASSES);
    this.saveCategories(INITIAL_CATEGORIES);
    this.saveChallenges(INITIAL_CHALLENGES);
    this.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
    this.saveReadingBooks(INITIAL_READING_BOOKS);
    this.saveSchoolSettings(INITIAL_SCHOOL_SETTINGS);
    this.saveLibraryBooks(INITIAL_LIBRARY_BOOKS);
    this.saveCertificates(INITIAL_CERTIFICATES);
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
  }

  // Mutators
  static saveUsers(users: User[]) { this.setStored('users', users); }
  static savePosts(posts: Post[]) { this.setStored('posts', posts); }
  static savePeriods(periods: MingguLiterasiPeriod[]) { this.setStored('periods', periods); }
  static saveClasses(classes: Class[]) { this.setStored('classes', classes); }
  static saveCategories(categories: Category[]) { this.setStored('categories', categories); }
  static saveChallenges(challenges: Challenge[]) { this.setStored('challenges', challenges); }
  static saveReadingBooks(books: ReadingBook[]) { this.setStored('reading_books', books); }
  static saveAnnouncements(anns: Announcement[]) { this.setStored('announcements', anns); }
  static saveSchoolSettings(settings: SchoolSettings) { this.setStored('school_settings', settings); }
  static saveLibraryBooks(books: LibraryBook[]) { this.setStored('library_books', books); }
  static saveCertificates(certs: CertificateRecord[]) { this.setStored('certificates', certs); }
  static saveAuditLogs(logs: AuditLog[]) { this.setStored('audit_logs', logs); }
  static saveCurrentUser(user: User | null) { this.setStored('current_user', user); }

  static updateUserBio(userId: string, bio: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index].bio = bio;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.bio = bio;
      this.saveCurrentUser(currentUser);
    }
    return true;
  }

  static updateUserPhoto(userId: string, fotoProfil: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index].fotoProfil = fotoProfil;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.fotoProfil = fotoProfil;
      this.saveCurrentUser(currentUser);
    }
    return true;
  }

  // Authentication
  static loginSiswa(nis: string, tanggalLahir: string): User | null {
    const users = this.getUsers();
    // Normalisasi format tanggal lahir siswa (misal user input dd-mm-yyyy atau ddmmyyyy)
    const normalizedInputDate = tanggalLahir.replace(/[-/]/g, '').trim(); // e.g. "17082010"
    
    const siswa = users.find(u => {
      if (u.role !== 'siswa' || !u.nis || !u.tanggalLahir) return false;
      const normalizedSiswaDate = u.tanggalLahir.replace(/[-/]/g, '').trim();
      return u.nis === nis && normalizedSiswaDate === normalizedInputDate;
    });

    if (siswa) {
      this.saveCurrentUser(siswa);
      return siswa;
    }
    return null;
  }

  static loginStaff(username: string, password: string): User | null {
    const users = this.getUsers();
    // Di sini kita izinkan login guru1, guru2, guru3, admin, kepala dengan password default 'password123' atau 'admin123'/'kepala123'
    const staff = users.find(u => {
      if (u.role === 'siswa' || !u.username) return false;
      
      const isCorrectUser = u.username.toLowerCase() === username.toLowerCase().trim();
      let isCorrectPass = false;
      
      if (u.role === 'admin' && password === 'admin123') isCorrectPass = true;
      else if (u.role === 'kepala_madrasah' && password === 'kepala123') isCorrectPass = true;
      else if (u.role === 'guru' && password === 'password123') isCorrectPass = true;

      return isCorrectUser && isCorrectPass;
    });

    if (staff) {
      this.saveCurrentUser(staff);
      return staff;
    }
    return null;
  }

  static logout() {
    this.saveCurrentUser(null);
  }

  // Post Actions
  static createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'reactions' | 'jumlahKata'>): Post {
    const posts = this.getPosts();
    const wordsCount = data.isi.trim().split(/\s+/).filter(Boolean).length;
    
    const newPost: Post = {
      ...data,
      id: `post-${Date.now()}`,
      jumlahKata: wordsCount,
      likes: [],
      comments: [],
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    this.savePosts(posts);

    // Tambah poin siswa jika status dipublikasikan
    if (data.status === 'published') {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === data.authorId);
      if (userIndex !== -1) {
        // Tulisan Minggu Literasi bernilai 30 poin, tulisan bebas bernilai 15 poin
        const poinReward = data.isMingguLiterasi ? 30 : 15;
        users[userIndex].poin += poinReward;
        this.saveUsers(users);
        
        // Update current user if matching
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === data.authorId) {
          currentUser.poin += poinReward;
          this.saveCurrentUser(currentUser);
        }
      }
    }

    return newPost;
  }

  static updatePost(id: string, updates: Partial<Post>): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const oldPost = posts[index];
    const isNowPublished = oldPost.status === 'draft' && updates.status === 'published';
    
    if (updates.isi !== undefined) {
      updates.jumlahKata = updates.isi.trim().split(/\s+/).filter(Boolean).length;
    }

    const updatedPost: Post = {
      ...oldPost,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    posts[index] = updatedPost;
    this.savePosts(posts);

    // Tambahkan poin jika baru dipublikasikan dari draft
    if (isNowPublished) {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === oldPost.authorId);
      if (userIndex !== -1) {
        const poinReward = updatedPost.isMingguLiterasi ? 30 : 15;
        users[userIndex].poin += poinReward;
        this.saveUsers(users);
        
        // Update current user if matching
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === oldPost.authorId) {
          currentUser.poin += poinReward;
          this.saveCurrentUser(currentUser);
        }
      }
    }

    return updatedPost;
  }

  static deletePost(id: string): boolean {
    const posts = this.getPosts();
    const originalLength = posts.length;
    const filtered = posts.filter(p => p.id !== id);
    if (filtered.length === originalLength) return false;
    this.savePosts(filtered);
    return true;
  }

  static likePost(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      post.likes.push(userId);
      // Tambah poin pembuat tulisan ketika dapat like (+2 poin)
      const users = this.getUsers();
      const authorIndex = users.findIndex(u => u.id === post.authorId);
      if (authorIndex !== -1) {
        users[authorIndex].poin += 2;
        this.saveUsers(users);
      }
    } else {
      post.likes.splice(likeIndex, 1);
      // Kurangi poin jika unlike (-2 poin)
      const users = this.getUsers();
      const authorIndex = users.findIndex(u => u.id === post.authorId);
      if (authorIndex !== -1 && users[authorIndex].poin >= 2) {
        users[authorIndex].poin -= 2;
        this.saveUsers(users);
      }
    }

    posts[index] = post;
    this.savePosts(posts);
    return post;
  }

  static bookmarkPost(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    if (!post.bookmarks) {
      post.bookmarks = [];
    }

    const bmIndex = post.bookmarks.indexOf(userId);
    if (bmIndex === -1) {
      post.bookmarks.push(userId);
    } else {
      post.bookmarks.splice(bmIndex, 1);
    }

    posts[index] = post;
    this.savePosts(posts);
    return post;
  }

  static addComment(postId: string, data: { authorId: string; authorNama: string; authorRole: UserRole; authorKelas?: string; isi: string }): Comment | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId,
      ...data,
      createdAt: new Date().toISOString()
    };

    const currentComments = Array.isArray(posts[index].comments) ? posts[index].comments : [];
    posts[index].comments = [...currentComments, newComment];
    this.savePosts(posts);

    // Tambahkan poin ke pembuat komentar (+1 poin) dan pembuat tulisan (+1 poin)
    const users = this.getUsers();
    const commenterIndex = users.findIndex(u => u.id === data.authorId);
    if (commenterIndex !== -1) {
      users[commenterIndex].poin += 1;
    }
    const authorIndex = users.findIndex(u => u.id === posts[index].authorId);
    if (authorIndex !== -1) {
      users[authorIndex].poin += 1;
    }
    this.saveUsers(users);

    return newComment;
  }

  static addReaction(postId: string, userId: string, tipeReaksi: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif'): Reaction[] | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    const existingIndex = post.reactions.findIndex(r => r.userId === userId);

    if (existingIndex !== -1) {
      if (post.reactions[existingIndex].tipeReaksi === tipeReaksi) {
        // Jika klik reaksi yang sama, hapus reaksi
        post.reactions.splice(existingIndex, 1);
      } else {
        // Jika klik reaksi berbeda, ganti reaksi
        post.reactions[existingIndex].tipeReaksi = tipeReaksi;
      }
    } else {
      // Tambah reaksi baru
      post.reactions.push({
        id: `react-${Date.now()}`,
        postId,
        userId,
        tipeReaksi,
        createdAt: new Date().toISOString()
      });
      
      // Tambah poin (+1 poin ke pembuat tulisan)
      const users = this.getUsers();
      const authorIndex = users.findIndex(u => u.id === post.authorId);
      if (authorIndex !== -1) {
        users[authorIndex].poin += 1;
        this.saveUsers(users);
      }
    }

    posts[index] = post;
    this.savePosts(posts);
    return post.reactions;
  }

  static gradePost(postId: string, data: Omit<Grade, 'gradedAt'>): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const oldGrade = posts[index].grade;
    const isFirstTimeGraded = !oldGrade;

    const newGrade: Grade = {
      ...data,
      gradedAt: new Date().toISOString()
    };

    posts[index].grade = newGrade;
    this.savePosts(posts);

    // Setiap nilai (0–100) yang disimpan langsung menambahkan bonus poin bintang (Nilai ÷ 2) ke akun siswa
    const users = this.getUsers();
    const authorIndex = users.findIndex(u => u.id === posts[index].authorId);
    if (authorIndex !== -1) {
      if (isFirstTimeGraded) {
        const bonusPoin = Math.round(data.skor / 2);
        users[authorIndex].poin = (users[authorIndex].poin || 0) + bonusPoin;
      } else {
        const oldBonus = Math.round((oldGrade.skor || 0) / 2);
        const newBonus = Math.round(data.skor / 2);
        users[authorIndex].poin = Math.max(0, (users[authorIndex].poin || 0) + (newBonus - oldBonus));
      }
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === posts[index].authorId) {
        currentUser.poin = users[authorIndex].poin;
        this.saveCurrentUser(currentUser);
      }
    }

    return posts[index];
  }

  // Admin Actions
  static createPeriod(
    nama: string, 
    tanggalMulai: string, 
    tanggalSelesai: string,
    kategoriIdWajib: string = 'bebas',
    kategoriNamaWajib: string = 'Bebas (Pilihan Siswa)',
    temaInstruksi: string = '',
    izinkanBebas: boolean = true
  ): MingguLiterasiPeriod {
    const periods = this.getPeriods();
    
    const newPeriod: MingguLiterasiPeriod = {
      id: `per-${Date.now()}`,
      nama,
      tanggalPelaksanaan: tanggalMulai,
      tanggalMulai,
      tanggalSelesai,
      isActive: false,
      kategoriIdWajib,
      kategoriNamaWajib,
      temaInstruksi,
      izinkanBebas,
      createdAt: new Date().toISOString()
    };

    periods.push(newPeriod);
    this.savePeriods(periods);
    return newPeriod;
  }

  static setPeriodActive(periodId: string, isActive: boolean): MingguLiterasiPeriod[] {
    let periods = this.getPeriods();
    if (isActive) {
      // Nonaktifkan semua periode lain terlebih dahulu
      periods = periods.map(p => ({ ...p, isActive: false }));
    }
    
    periods = periods.map(p => {
      if (p.id === periodId) {
        return { ...p, isActive };
      }
      return p;
    });

    this.savePeriods(periods);
    return periods;
  }

  static createCategory(nama: string, kode: string, ikon: string): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      nama,
      kode,
      ikon,
      isActive: true
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  static updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(categories);
    return categories[index];
  }

  // Student CRUD (Admin)
  static addStudent(data: { nis: string; nama: string; tanggalLahir: string; kelasId: string }): User {
    const users = this.getUsers();
    const classes = this.getClasses();
    const targetClass = classes.find(c => c.id === data.kelasId);

    const newUser: User = {
      id: `usr-sis-${Date.now()}`,
      nis: data.nis,
      nama: data.nama,
      tanggalLahir: data.tanggalLahir,
      kelasId: data.kelasId,
      kelasNama: targetClass ? targetClass.namaKelas : undefined,
      role: 'siswa',
      bio: 'Siswa MA NU 01 Banyuputih yang rajin menulis.',
      poin: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static updateStudent(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const classes = this.getClasses();
    if (updates.kelasId) {
      const targetClass = classes.find(c => c.id === updates.kelasId);
      if (targetClass) {
        updates.kelasNama = targetClass.namaKelas;
      }
    }

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const originalLength = users.length;
    const target = users.find(u => u.id === id);
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === originalLength) return false;
    this.saveUsers(filtered);
    if (target) {
      this.addAuditLog('HAPUS_USER', `Menghapus akun ${target.nama} (${target.role.toUpperCase()})`);
    }
    return true;
  }

  // Class Management Operations (Admin)
  static addClass(data: { namaKelas: string; tingkat: 'X' | 'XI' | 'XII'; tahunAjaran: string; waliKelasId?: string; waliKelasNama?: string }): Class {
    const classes = this.getClasses();
    const newClass: Class = {
      id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      namaKelas: data.namaKelas.trim(),
      tingkat: data.tingkat,
      tahunAjaran: data.tahunAjaran.trim() || '2026/2027',
      waliKelasId: data.waliKelasId || '',
      waliKelasNama: data.waliKelasNama || '-'
    };
    classes.push(newClass);
    this.saveClasses(classes);
    this.addAuditLog('LAINNYA', `Menambahkan rombel kelas baru: ${newClass.namaKelas} (${newClass.tingkat})`);
    return newClass;
  }

  static updateClass(id: string, updates: Partial<Class>): Class | null {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    classes[idx] = { ...classes[idx], ...updates };
    this.saveClasses(classes);

    // Sync kelasNama ke data siswa jika nama kelas berubah
    if (updates.namaKelas) {
      const users = this.getUsers();
      let hasChange = false;
      users.forEach(u => {
        if (u.kelasId === id) {
          u.kelasNama = updates.namaKelas;
          hasChange = true;
        }
      });
      if (hasChange) this.saveUsers(users);
    }

    this.addAuditLog('LAINNYA', `Memperbarui data kelas: ${classes[idx].namaKelas}`);
    return classes[idx];
  }

  static deleteClass(id: string): boolean {
    const classes = this.getClasses();
    const target = classes.find(c => c.id === id);
    if (!target) return false;
    const filtered = classes.filter(c => c.id !== id);
    this.saveClasses(filtered);
    this.addAuditLog('LAINNYA', `Menghapus data kelas: ${target.namaKelas}`);
    return true;
  }

  // Teacher / Staff Operations
  static addTeacher(data: { username: string; nama: string; bio?: string; role?: 'guru' | 'kepala_madrasah' | 'admin' }): User {
    const users = this.getUsers();
    const newTeacher: User = {
      id: `usr-stf-${Date.now()}`,
      username: data.username.trim().toLowerCase(),
      nama: data.nama.trim(),
      role: data.role || 'guru',
      bio: data.bio?.trim() || 'Guru Pembimbing Literasi MA NU 01 Banyuputih.',
      poin: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newTeacher);
    this.saveUsers(users);
    this.addAuditLog('TAMBAH_USER', `Mendaftarkan guru/staff baru: ${newTeacher.nama} (${newTeacher.role.toUpperCase()})`);
    return newTeacher;
  }

  // Reading List Actions (Siswa)
  static addReadingBook(data: Omit<ReadingBook, 'id' | 'createdAt'>): ReadingBook {
    const books = this.getReadingBooks();
    const newBook: ReadingBook = {
      ...data,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    books.unshift(newBook);
    this.saveReadingBooks(books);

    // Berikan poin kecil (+5 poin) karena menambahkan buku bacaan
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === data.userId);
    if (userIndex !== -1) {
      users[userIndex].poin += 5;
      this.saveUsers(users);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === data.userId) {
        currentUser.poin += 5;
        this.saveCurrentUser(currentUser);
      }
    }

    return newBook;
  }

  static updateReadingBookStatus(id: string, status: 'sedang' | 'sudah' | 'rencana'): ReadingBook | null {
    const books = this.getReadingBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return null;

    const oldBook = books[index];
    books[index] = { ...oldBook, statusBaca: status };
    this.saveReadingBooks(books);

    // Berikan tambahan poin (+15 poin) jika selesai membaca buku (status 'sudah')
    if (oldBook.statusBaca !== 'sudah' && status === 'sudah') {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === oldBook.userId);
      if (userIndex !== -1) {
        users[userIndex].poin += 15;
        this.saveUsers(users);
        
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === oldBook.userId) {
          currentUser.poin += 15;
          this.saveCurrentUser(currentUser);
        }
      }
    }

    return books[index];
  }

  static deleteReadingBook(id: string): boolean {
    const books = this.getReadingBooks();
    const originalLength = books.length;
    const filtered = books.filter(b => b.id !== id);
    if (filtered.length === originalLength) return false;
    this.saveReadingBooks(filtered);
    return true;
  }

  // Challenges (Admin / Guru)
  static addChallenge(data: Omit<Challenge, 'id' | 'peserta'>): Challenge {
    const challenges = this.getChallenges();
    const newChallenge: Challenge = {
      ...data,
      id: `ch-${Date.now()}`,
      peserta: []
    };
    challenges.push(newChallenge);
    this.saveChallenges(challenges);
    return newChallenge;
  }

  static joinChallenge(challengeId: string, userId: string): boolean {
    const challenges = this.getChallenges();
    const index = challenges.findIndex(c => c.id === challengeId);
    if (index === -1) return false;

    const challenge = challenges[index];
    if (challenge.peserta.includes(userId)) return false; // Sudah gabung

    challenge.peserta.push(userId);
    challenges[index] = challenge;
    this.saveChallenges(challenges);

    // Tambah poin (+10 poin) karena ikut tantangan
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].poin += 10;
      this.saveUsers(users);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.poin += 10;
        this.saveCurrentUser(currentUser);
      }
    }

    return true;
  }

  // Announcements (Admin)
  static addAnnouncement(judul: string, isi: string, createdBy: string): Announcement {
    const announcements = this.getAnnouncements();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      judul,
      isi,
      createdBy,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    this.saveAnnouncements(announcements);
    return newAnn;
  }

  static toggleAnnouncementActive(id: string): boolean {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    if (index === -1) return false;

    announcements[index].isActive = !announcements[index].isActive;
    this.saveAnnouncements(announcements);
    return true;
  }

  static deleteAnnouncement(id: string): boolean {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    if (filtered.length === announcements.length) return false;
    this.saveAnnouncements(filtered);
    return true;
  }

  // Audit Logs
  static addAuditLog(
    action: AuditLog['action'], 
    detail: string, 
    options?: { userId?: string; userNama?: string; userRole?: string; targetId?: string; targetName?: string }
  ): AuditLog {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: options?.userId || currentUser?.id || 'usr-admin',
      userNama: options?.userNama || currentUser?.nama || 'Admin Koordinator',
      userRole: options?.userRole || currentUser?.role || 'admin',
      action,
      detail,
      targetId: options?.targetId,
      targetName: options?.targetName,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 200 logs
    const trimmed = logs.slice(0, 200);
    this.saveAuditLogs(trimmed);
    return newLog;
  }

  static clearAuditLogs(): void {
    this.saveAuditLogs([]);
  }

  // User Management Updates (Admin)
  static updateUserAccount(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const classes = this.getClasses();
    if (updates.kelasId) {
      const targetClass = classes.find(c => c.id === updates.kelasId);
      if (targetClass) {
        updates.kelasNama = targetClass.namaKelas;
      }
    }

    const previousUser = users[index];
    const updatedUser = { ...previousUser, ...updates };
    users[index] = updatedUser;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      this.saveCurrentUser(updatedUser);
    }

    this.addAuditLog('EDIT_USER', `Memperbarui data akun pengguna: ${updatedUser.nama} (${updatedUser.role.toUpperCase()})`, {
      targetId: id,
      targetName: updatedUser.nama
    });

    return updatedUser;
  }

  static resetUserPassword(id: string, newPinOrPass: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'Pengguna tidak ditemukan' };

    const targetUser = users[index];
    if (targetUser.role === 'siswa') {
      targetUser.tanggalLahir = newPinOrPass; // tanggal lahir digunakan sebagai PIN siswa
    }
    // Update user bio / memo note if necessary
    users[index] = targetUser;
    this.saveUsers(users);

    this.addAuditLog('RESET_PASSWORD', `Mereset password/PIN login untuk ${targetUser.nama} (${targetUser.role === 'siswa' ? 'NIS: ' + (targetUser.nis || '-') : 'Username: ' + (targetUser.username || '-')})`, {
      targetId: id,
      targetName: targetUser.nama
    });

    return { 
      success: true, 
      message: `Password/PIN akun ${targetUser.nama} berhasil direset menjadi: ${newPinOrPass}`,
      user: targetUser
    };
  }

  // School Profile Settings
  static updateSchoolSettings(updates: Partial<SchoolSettings>): SchoolSettings {
    const current = this.getSchoolSettings();
    const updated: SchoolSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveSchoolSettings(updated);

    this.addAuditLog('UPDATE_PENGATURAN', `Memperbarui konfigurasi profil dan branding madrasah (${updated.namaMadrasah}, TA ${updated.tahunAjaran} ${updated.semester})`);
    return updated;
  }

  // Certificate Management
  static createCertificate(data: Omit<CertificateRecord, 'id' | 'createdAt'>): CertificateRecord {
    const certs = this.getCertificates();
    const newCert: CertificateRecord = {
      ...data,
      id: `cert-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    certs.unshift(newCert);
    this.saveCertificates(certs);

    // Tambah bonus poin istimewa (+100 poin) untuk penerima sertifikat
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === data.userId);
    if (userIndex !== -1) {
      users[userIndex].poin += 100;
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === data.userId) {
        currentUser.poin += 100;
        this.saveCurrentUser(currentUser);
      }
    }

    this.addAuditLog('TERBITKAN_SERTIFIKAT', `Menerbitkan Piagam Sertifikat Literasi No. ${newCert.nomorSertifikat} untuk ${newCert.namaPenerima} (${newCert.judulPenghargaan})`, {
      targetId: newCert.userId,
      targetName: newCert.namaPenerima
    });

    return newCert;
  }

  static deleteCertificate(id: string): boolean {
    const certs = this.getCertificates();
    const cert = certs.find(c => c.id === id);
    const filtered = certs.filter(c => c.id !== id);
    if (filtered.length === certs.length) return false;
    this.saveCertificates(filtered);

    if (cert) {
      this.addAuditLog('HAPUS_SERTIFIKAT', `Menghapus data e-sertifikat No. ${cert.nomorSertifikat} (${cert.namaPenerima})`, {
        targetId: cert.id,
        targetName: cert.namaPenerima
      });
    }

    return true;
  }

  // Library Books Management (Perpustakaan Madrasah)
  static addLibraryBook(data: Omit<LibraryBook, 'id' | 'createdAt' | 'dibacaCount'>): LibraryBook {
    const books = this.getLibraryBooks();
    const newBook: LibraryBook = {
      ...data,
      id: `lib-${Date.now()}`,
      dibacaCount: 0,
      createdAt: new Date().toISOString()
    };
    books.unshift(newBook);
    this.saveLibraryBooks(books);

    this.addAuditLog('TAMBAH_BUKU', `Menambahkan buku baru ke katalog perpustakaan: "${newBook.judul}" oleh ${newBook.penulis}`, {
      targetId: newBook.id,
      targetName: newBook.judul
    });

    return newBook;
  }

  static updateLibraryBook(id: string, updates: Partial<LibraryBook>): LibraryBook | null {
    const books = this.getLibraryBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return null;

    books[index] = { ...books[index], ...updates };
    this.saveLibraryBooks(books);

    this.addAuditLog('EDIT_BUKU', `Memperbarui katalog buku: "${books[index].judul}"`, {
      targetId: id,
      targetName: books[index].judul
    });

    return books[index];
  }

  static deleteLibraryBook(id: string): boolean {
    const books = this.getLibraryBooks();
    const targetBook = books.find(b => b.id === id);
    const filtered = books.filter(b => b.id !== id);
    if (filtered.length === books.length) return false;
    this.saveLibraryBooks(filtered);

    if (targetBook) {
      this.addAuditLog('HAPUS_BUKU', `Menghapus buku "${targetBook.judul}" dari katalog perpustakaan`, {
        targetId: id,
        targetName: targetBook.judul
      });
    }

    return true;
  }
}
