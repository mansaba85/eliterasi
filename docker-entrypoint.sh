#!/bin/sh
set -e

echo "⏳ Menunggu database PostgreSQL siap..."
until node -e '
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  prisma.$connect()
    .then(() => { process.exit(0); })
    .catch(() => { process.exit(1); });
' 2>/dev/null; do
  echo "Database belum siap, mencoba lagi dalam 2 detik..."
  sleep 2
done

echo "🚀 Menjalankan migrasi database PostgreSQL e-Literasi..."
npx prisma db push --skip-generate

echo "🌱 Mengisi data awal (Kategori literasi & Akun Admin)..."
node -e '
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function init() {
  const categories = [
    { id: "cat-1", nama: "Buku Harian", kode: "buku-harian", ikon: "📔", deskripsi: "Catatan harian, refleksi diri, dan pengalaman keseharian santri" },
    { id: "cat-2", nama: "Sinopsis & Resensi Buku", kode: "sinopsis-resensi", ikon: "📚", deskripsi: "Ulasan, sinopsis, dan bedah buku fiksi maupun non-fiksi" },
    { id: "cat-3", nama: "Cerpen", kode: "cerpen", ikon: "✍️", deskripsi: "Cerita pendek karya fiksi kreatif siswa" },
    { id: "cat-4", nama: "Puisi", kode: "puisi", ikon: "🌸", deskripsi: "Karya sastra bait puisi, syair santri, dan pantun" },
    { id: "cat-5", nama: "Laporan Pengamatan", kode: "laporan-pengamatan", ikon: "🔬", deskripsi: "Catatan observasi lapangan, praktikum sains, dan fenomena alam" },
    { id: "cat-6", nama: "Esai & Opini", kode: "esai", ikon: "💡", deskripsi: "Gagasan kritis, opini santri, dan pemikiran ilmiah" },
    { id: "cat-7", nama: "Berita & Jurnalistik", kode: "berita", ikon: "📰", deskripsi: "Warta kegiatan madrasah, liputan ekstrakurikuler, dan artikel santri" },
    { id: "cat-8", nama: "Dongeng & Fabel", kode: "dongeng", ikon: "✨", deskripsi: "Kisah fabel, cerita rakyat, dan dongeng moral berkarakter" },
    { id: "cat-9", nama: "Karya Bebas", kode: "lainnya", ikon: "🎨", deskripsi: "Karya sastra dan literasi bentuk bebas lainnya" }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { kode: cat.kode },
      update: {},
      create: cat,
    });
  }

  // Akun Admin Utama Bersih
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "manubanyuputih@gmail.com",
      nama: "Administrator E-Literasi",
      passwordHash: "admin123",
      role: "ADMIN",
      bio: "Koordinator Literasi & Pengelola Sistem IT MA NU 01 Banyuputih",
      poin: 0
    }
  });

  console.log("✅ Database terinisialisasi bersih: Kategori & Akun Admin siap.");
}

init().catch(console.error).finally(() => prisma.$disconnect());
'

# Pastikan direktori uploads persisten ada dan siap digunakan
mkdir -p /app/public/uploads

echo "🎉 Memulai Server Next.js..."
exec node server.js
