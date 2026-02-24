import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

export const AUTH_SESSION_COOKIE = 'booking_session';
export const AUTH_SESSION_TTL_DAYS = 30;
export const OTP_TTL_MINUTES = 10;
export const OTP_MIN_INTERVAL_SECONDS = 60;

const getSecret = (): string | null => {
  return process.env.AUTH_SESSION_SECRET || process.env.AUTH_TOKEN_SECRET || null;
};

const requireSecret = (): string => {
  const secret = getSecret();
  if (!secret) {
    throw new Error('AUTH_SESSION_SECRET is required');
  }
  return secret;
};

export const normalizeEmail = (email?: string | null): string | null => {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length ? trimmed : null;
};

export const normalizePhone = (phone?: string | null): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits;
  const normalizedDigits = digits.replace(/\D/g, '');
  if (normalizedDigits.length === 10) return `+1${normalizedDigits}`;
  if (normalizedDigits.length === 11 && normalizedDigits.startsWith('1')) return `+${normalizedDigits}`;
  return `+${normalizedDigits}`;
};

export const hmacToken = (value: string): string => {
  return crypto.createHmac('sha256', requireSecret()).update(value).digest('hex');
};

export const createSession = async (payload: {
  email?: string | null;
  phone?: string | null;
  method: 'magic_link' | 'sms_otp';
}): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hmacToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const emailRaw = payload.email ? payload.email.trim() : null;
  const emailNormalized = normalizeEmail(emailRaw);
  const phoneNormalized = normalizePhone(payload.phone || null);

  const db = getAdminDb();
  await db.collection('authSessions').doc(tokenHash).set({
    tokenHash,
    email: emailNormalized,
    emailRaw,
    phone: phoneNormalized,
    method: payload.method,
    createdAt: now,
    lastUsedAt: now,
    expiresAt,
  });

  return token;
};

export const getSessionFromToken = async (token: string) => {
  const tokenHash = hmacToken(token);
  const db = getAdminDb();
  const doc = await db.collection('authSessions').doc(tokenHash).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data) return null;

  const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    await db.collection('authSessions').doc(tokenHash).delete();
    return null;
  }

  await db.collection('authSessions').doc(tokenHash).set(
    { lastUsedAt: new Date() },
    { merge: true }
  );

  return {
    tokenHash,
    email: data.email || null,
    emailRaw: data.emailRaw || null,
    phone: data.phone || null,
    method: data.method || null,
  };
};

export const setSessionCookie = (response: NextResponse, token: string) => {
  response.cookies.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_SESSION_TTL_DAYS * 24 * 60 * 60,
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(AUTH_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
};

export const getCookieValue = (cookieHeader: string | null, name: string): string | null => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
};
