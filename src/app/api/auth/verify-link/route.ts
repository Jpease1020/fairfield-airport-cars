import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import {
  createSession,
  hmacToken,
  normalizeEmail,
  setSessionCookie,
} from '@/lib/utils/auth-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token;
    const emailInput = body?.email;
    const email = normalizeEmail(emailInput);

    if (!token || !email) {
      return NextResponse.json({ error: 'Invalid token or email' }, { status: 400 });
    }

    const tokenHash = hmacToken(token);
    const db = getAdminDb();
    const docRef = db.collection('authMagicLinks').doc(tokenHash);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Magic link is invalid or expired' }, { status: 400 });
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json({ error: 'Magic link is invalid or expired' }, { status: 400 });
    }

    if (data.used) {
      return NextResponse.json({ error: 'Magic link has already been used' }, { status: 400 });
    }

    if (data.email && normalizeEmail(data.email) !== email) {
      return NextResponse.json({ error: 'Magic link is invalid' }, { status: 400 });
    }

    const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Magic link has expired' }, { status: 400 });
    }

    await docRef.set({ used: true, usedAt: new Date() }, { merge: true });

    const sessionToken = await createSession({ email, method: 'magic_link' });
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error('Magic link verification failed:', error);
    return NextResponse.json({ error: 'Failed to verify magic link' }, { status: 500 });
  }
}
