import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Direktori uploads berada di persistent volume Docker: /app/public/uploads
const DATA_DIR = path.join(process.cwd(), 'public', 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'eliterasi_store.json');

export async function GET() {
  try {
    if (!existsSync(STORE_FILE)) {
      return NextResponse.json({ success: true, data: null });
    }
    const raw = await readFile(STORE_FILE, 'utf-8');
    if (!raw.trim()) {
      return NextResponse.json({ success: true, data: null });
    }
    const data = JSON.parse(raw);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API Store GET] Error reading store file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await mkdir(DATA_DIR, { recursive: true });

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

    if (body.fullStore && typeof body.fullStore === 'object') {
      currentStore = { ...currentStore, ...body.fullStore };
    } else if (body.batch && typeof body.batch === 'object') {
      currentStore = { ...currentStore, ...body.batch };
    } else if (body.key) {
      currentStore[body.key] = body.value;
    }

    currentStore.updatedAt = new Date().toISOString();

    // Tulis ke temporary file terlebih dahulu agar atomik dan anti-korup
    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    await writeFile(tempFile, JSON.stringify(currentStore, null, 2), 'utf-8');
    await rename(tempFile, STORE_FILE);

    return NextResponse.json({ success: true, updatedAt: currentStore.updatedAt });
  } catch (error: any) {
    console.error('[API Store POST] Error saving store file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
