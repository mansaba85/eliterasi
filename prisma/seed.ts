import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai inisialisasi basis data bersih e-Literasi MA NU 01 Banyuputih...');

  // 1. Inisialisasi Kategori Tulisan Default Sesuai Kurikulum Literasi Madrasah
  const categories = [
    { id: 'cat-1', nama: 'Buku Harian', kode: 'buku-harian', ikon: '📔', deskripsi: 'Catatan harian, refleksi diri, dan pengalaman keseharian santri' },
    { id: 'cat-2', nama: 'Sinopsis & Resensi Buku', kode: 'sinopsis-resensi', ikon: '📚', deskripsi: 'Ulasan, sinopsis, dan bedah buku fiksi maupun non-fiksi' },
    { id: 'cat-3', nama: 'Cerpen', kode: 'cerpen', ikon: '✍️', deskripsi: 'Cerita pendek karya fiksi kreatif siswa' },
    { id: 'cat-4', nama: 'Puisi', kode: 'puisi', ikon: '🌸', deskripsi: 'Karya sastra bait puisi, syair santri, dan pantun' },
    { id: 'cat-5', nama: 'Laporan Pengamatan', kode: 'laporan-pengamatan', ikon: '🔬', deskripsi: 'Catatan observasi lapangan, praktikum sains, dan fenomena alam' },
    { id: 'cat-6', nama: 'Esai & Opini', kode: 'esai', ikon: '💡', deskripsi: 'Gagasan kritis, opini santri, dan pemikiran ilmiah' },
    { id: 'cat-7', nama: 'Berita & Jurnalistik', kode: 'berita', ikon: '📰', deskripsi: 'Warta kegiatan madrasah, liputan ekstrakurikuler, dan artikel santri' },
    { id: 'cat-8', nama: 'Dongeng & Fabel', kode: 'dongeng', ikon: '✨', deskripsi: 'Kisah fabel, cerita rakyat, dan dongeng moral berkarakter' },
    { id: 'cat-9', nama: 'Karya Bebas', kode: 'lainnya', ikon: '🎨', deskripsi: 'Karya sastra dan literasi bentuk bebas lainnya' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { kode: cat.kode },
      update: { nama: cat.nama, ikon: cat.ikon, deskripsi: cat.deskripsi },
      create: cat,
    });
  }
  console.log('✅ Kategori literasi berhasil disiapkan.');

  // 2. Akun Administrator IT & Koordinator Literasi Madrasah Utama (Fresh & Bersih)
  // Password default awal: admin123 (Dapat diganti kapan saja via panel admin)
  const adminUsername = 'admin';
  const adminEmail = 'manubanyuputih@gmail.com';
  
  const adminUser = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      email: adminEmail,
      nama: 'Administrator E-Literasi',
      passwordHash: 'admin123', // Siap diganti saat live deployment
      role: Role.ADMIN,
      bio: 'Koordinator Literasi & Pengelola Sistem IT MA NU 01 Banyuputih',
      poin: 0,
    },
  });

  console.log(`✅ Akun Admin berhasil dibuat: Username "${adminUser.username}", Role: ${adminUser.role}`);
  console.log('✨ Database siap dalam kondisi FRESH & BERSIH tanpa data mock siswa/karya.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
