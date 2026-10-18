import crypto from 'crypto';
import { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET || 'eliterasi-manu01-banyuputih-secure-salt-2026';

export interface SessionPayload {
  userId: string;
  role: string;
  username?: string;
  nis?: string;
  nama: string;
  exp: number; // Unix timestamp in seconds
}

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 30): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const data: SessionPayload = { ...payload, exp };
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf-8');
    const data: SessionPayload = JSON.parse(jsonStr);
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && data.exp < now) return null; // expired
    return data;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const authHeader = req.headers.get('authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    token = req.headers.get('x-auth-token') || req.cookies.get('eliterasi_token')?.value || '';
  }
  return verifySessionToken(token);
}
