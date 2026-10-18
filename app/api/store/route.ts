import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSessionFromRequest } from '@/lib/serverAuth';

// Direktori uploads berada di persistent volume Docker: /app/public/uploads
const DATA_DIR = path.join(process.cwd(), 'public', 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'eliterasi_store.json');

export async function GET(req: NextRequest) {
  try {
    if (!existsSync(STORE_FILE)) {
      return NextResponse.json({ success: true, data: null });
    }
    const raw = await readFile(STORE_FILE, 'utf-8');
    if (!raw.trim()) {
      return NextResponse.json({ success: true, data: null });
    }
    const data = JSON.parse(raw);

    // Cek apakah pengguna saat ini adalah Admin terotentikasi
    const session = getSessionFromRequest(req);
    const isAdmin = session?.role === 'admin';

    // 1. KEAMANAN MUTLAK: Jangan pernah ekspos admin_password ke siapapun di endpoint publik!
    delete data.admin_password;

    // 2. KEAMANAN MUTLAK: Sanitasi seluruh user agar password tidak pernah bocor ke browser
    if (Array.isArray(data.users)) {
      data.users = data.users.map((u: any) => {
        // Hapus password secara permanen dari payload yang dikirim ke client
        const { password, ...safeUser } = u;

        // Jika bukan admin, tanggal lahir siswa (yang digunakan sebagai PIN login) juga disembunyikan
        if (!isAdmin) {
          const { tanggalLahir, ...publicUser } = safeUser;
          return publicUser;
        }

        return safeUser;
      });
    }

    // 3. KEAMANAN MUTLAK: Riwayat Audit Log hanya dapat dilihat oleh Admin
    if (!isAdmin) {
      data.audit_logs = [];
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API Store GET] Error reading store file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Antrian mutex agar penulisan paralel/simultan tidak saling menimpa
let writeQueue = Promise.resolve();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await mkdir(DATA_DIR, { recursive: true });

    const session = getSessionFromRequest(req);
    const isAdmin = session?.role === 'admin';

    return await new Promise<NextResponse>((resolve) => {
      writeQueue = writeQueue.then(async () => {
        try {
          let currentStore: Record<string, any> = {};
          if (existsSync(STORE_FILE)) {
            try {
              const raw = await readFile(STORE_FILE, 'utf-8');
              if (raw.trim()) {
                currentStore = JSON.parse(raw);
              }
            } catch (readErr) {
              console.warn('[API Store POST] Store file corrupted or unreadable, starting fresh:', readErr);
              currentStore = {};
            }
          }

          // Lindungi kredensial admin jika bukan admin yang mengubah
          const existingAdminPass = currentStore.admin_password || '';

          // Preservasi kredensial rahasia (password & tanggalLahir) yang tersimpan di server
          // agar tidak terhapus ketika client mengirimkan array users yang sudah disanitasi
          if (body.key === 'users' && Array.isArray(body.value)) {
            const existingUsers = Array.isArray(currentStore.users) ? currentStore.users : [];
            const mergedUsers = body.value.map((newU: any) => {
              const existing = existingUsers.find((e: any) => e.id === newU.id || (e.username && e.username === newU.username) || (e.nis && e.nis === newU.nis));
              return {
                ...newU,
                password: newU.password || (existing ? existing.password : undefined),
                tanggalLahir: newU.tanggalLahir || (existing ? existing.tanggalLahir : undefined)
              };
            });
            currentStore.users = mergedUsers;
          } else if (body.fullStore && typeof body.fullStore === 'object') {
            const existingUsers = Array.isArray(currentStore.users) ? currentStore.users : [];
            const incomingUsers = Array.isArray(body.fullStore.users) ? body.fullStore.users : [];
            
            const mergedUsers = incomingUsers.map((newU: any) => {
              const existing = existingUsers.find((e: any) => e.id === newU.id || (e.username && e.username === newU.username) || (e.nis && e.nis === newU.nis));
              return {
                ...newU,
                password: newU.password || (existing ? existing.password : undefined),
                tanggalLahir: newU.tanggalLahir || (existing ? existing.tanggalLahir : undefined)
              };
            });

            currentStore = {
              ...currentStore,
              ...body.fullStore,
              users: mergedUsers.length > 0 ? mergedUsers : (currentStore.users || [])
            };

            // Jangan biarkan fullStore menimpa admin_password kecuali pengirim adalah admin yang sah
            if (!isAdmin && existingAdminPass) {
              currentStore.admin_password = existingAdminPass;
            }
          } else if (body.batch && typeof body.batch === 'object') {
            // Jika ada perubahan password admin di dalam batch, pastikan yang mengubah adalah admin
            if (body.batch.admin_password && !isAdmin && existingAdminPass) {
              delete body.batch.admin_password;
            }
            currentStore = { ...currentStore, ...body.batch };
          } else if (body.key) {
            if (body.key === 'admin_password' && !isAdmin && existingAdminPass) {
              // Abaikan jika bukan admin
            } else {
              currentStore[body.key] = body.value;
            }
          }

          currentStore.updatedAt = new Date().toISOString();

          // Tulis ke temporary file unik terlebih dahulu agar atomik dan anti-korup
          const tempFile = `${STORE_FILE}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
          await writeFile(tempFile, JSON.stringify(currentStore, null, 2), 'utf-8');
          await rename(tempFile, STORE_FILE);

          resolve(NextResponse.json({ success: true, updatedAt: currentStore.updatedAt }));
        } catch (innerError: any) {
          console.error('[API Store POST] Error inside write queue:', innerError);
          resolve(NextResponse.json({ success: false, error: innerError.message }, { status: 500 }));
        }
      });
    });
  } catch (error: any) {
    console.error('[API Store POST] Error saving store file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
