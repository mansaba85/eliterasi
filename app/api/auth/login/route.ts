import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createSessionToken } from '@/lib/serverAuth';

const DATA_DIR = path.join(process.cwd(), 'public', 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'eliterasi_store.json');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, nis, tanggalLahir, username, password } = body;

    let users: any[] = [];
    let customAdminPass = '';

    if (existsSync(STORE_FILE)) {
      try {
        const raw = await readFile(STORE_FILE, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          users = Array.isArray(parsed.users) ? parsed.users : [];
          customAdminPass = typeof parsed.admin_password === 'string' ? parsed.admin_password.trim() : '';
        }
      } catch (err) {
        console.error('[API Login] Gagal membaca berkas store:', err);
      }
    }

    // Fallback akun admin bawaan jika users kosong
    if (users.length === 0) {
      users = [
        {
          id: 'usr-admin',
          username: 'admin',
          nama: 'Admin Koordinator Literasi',
          role: 'admin',
          bio: 'Tim Admin IT E-Literasi MA NU 01 Banyuputih.',
          poin: 0,
          createdAt: new Date().toISOString()
        }
      ];
    }

    let authenticatedUser: any = null;

    if (type === 'siswa') {
      if (!nis || !tanggalLahir) {
        return NextResponse.json({ success: false, message: 'NIS dan Tanggal Lahir wajib diisi.' }, { status: 400 });
      }

      const inputNis = String(nis).trim();
      const normalizedInputDate = String(tanggalLahir).replace(/[-/]/g, '').trim();

      authenticatedUser = users.find(u => {
        if (u.role !== 'siswa' || !u.nis || !u.tanggalLahir) return false;
        const normalizedSiswaDate = String(u.tanggalLahir).replace(/[-/]/g, '').trim();
        return String(u.nis).trim() === inputNis && normalizedSiswaDate === normalizedInputDate;
      });

      if (!authenticatedUser) {
        return NextResponse.json({ success: false, message: 'NIS atau Tanggal Lahir tidak cocok.' }, { status: 401 });
      }
    } else {
      // Staff (Admin, Guru, Kepala Madrasah)
      if (!username || !password) {
        return NextResponse.json({ success: false, message: 'Username dan kata sandi wajib diisi.' }, { status: 400 });
      }

      const inputUsername = String(username).toLowerCase().trim();
      const inputPass = String(password).trim();

      authenticatedUser = users.find(u => {
        if (u.role === 'siswa' || !u.username) return false;
        const isMatchUser = String(u.username).toLowerCase().trim() === inputUsername;
        if (!isMatchUser) return false;

        // 1. Cek custom password admin
        if (u.role === 'admin' && customAdminPass) {
          return inputPass === customAdminPass;
        }

        // 2. Cek password akun individu yang tersimpan di store
        if (u.password && typeof u.password === 'string') {
          return inputPass === u.password.trim();
        }

        // 3. Fallback password default
        if (u.role === 'admin' && inputPass === 'admin123') return true;
        if (u.role === 'kepala_madrasah' && inputPass === 'kepala123') return true;
        if (u.role === 'guru' && inputPass === 'password123') return true;

        return false;
      });

      if (!authenticatedUser) {
        return NextResponse.json({ success: false, message: 'Username atau kata sandi tidak sesuai.' }, { status: 401 });
      }
    }

    // Buat session token HMAC yang aman
    const token = createSessionToken({
      userId: authenticatedUser.id,
      role: authenticatedUser.role,
      username: authenticatedUser.username,
      nis: authenticatedUser.nis,
      nama: authenticatedUser.nama
    });

    // Sanitasi data user: HAPUS password dan PIN dari payload response
    const { password: _p, tanggalLahir: _tl, ...safeUser } = authenticatedUser;

    const res = NextResponse.json({
      success: true,
      user: safeUser,
      token
    });

    // Pasang HttpOnly cookie agar aman dan otomatis terkirim pada setiap request
    res.cookies.set('eliterasi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 hari
    });

    return res;
  } catch (err: any) {
    console.error('[API Login] Terjadi kesalahan server:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem saat proses masuk.' }, { status: 500 });
  }
}
