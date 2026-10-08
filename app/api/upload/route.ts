import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Maksimal ukuran upload mentah: 10MB
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folderType = (formData.get('type') as string) || 'covers'; // 'covers' | 'avatars' | 'general'

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah' }, { status: 400 });
    }

    // Validasi tipe berkas hanya gambar
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Hanya berkas gambar (JPG, PNG, WEBP) yang diizinkan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan folder tujuan di public/uploads ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folderType);
    await mkdir(uploadDir, { recursive: true });

    // Generate nama file unik dengan ekstensi .webp
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fileName = `${folderType}-${timestamp}-${randomSuffix}.webp`;
    const filePath = path.join(uploadDir, fileName);

    // =========================================================================
    // OPTIMALISASI GAMBAR DENGAN SHARP:
    // 1. Resize maksimal lebar 1200px (tinggi proporsional)
    // 2. Konversi ke format modern WebP dengan kompresi 80%
    // 3. Hapus metadata kamera (EXIF) untuk privasi dan hemat ukuran
    // =========================================================================
    await sharp(buffer)
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(filePath);

    // Kembalikan URL publik yang disimpan ke database
    const publicUrl = `/uploads/${folderType}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Gagal memproses dan menyimpan gambar', details: error.message },
      { status: 500 }
    );
  }
}
