import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import {
  createSession,
  hmacToken,
  normalizePhone,
  setSessionCookie,
} from '@/lib/utils/auth-session';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneInput = body?.phone;
    const codeInput = body?.code;
    const phone = normalizePhone(phoneInput);
    const code = typeof codeInput === 'string' ? codeInput.trim() : '';

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('authOtps').doc(phone);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Code is invalid or expired' }, { status: 400 });
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json({ error: 'Code is invalid or expired' }, { status: 400 });
    }

    const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      await docRef.delete();
      return NextResponse.json({ error: 'Code is invalid or expired' }, { status: 400 });
    }

    const attempts = data.attempts || 0;
    if (attempts >= MAX_ATTEMPTS) {
      await docRef.delete();
      return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
    }

    const expectedHash = hmacToken(`${phone}:${code}`);
    if (expectedHash !== data.codeHash) {
      await docRef.set({ attempts: attempts + 1 }, { merge: true });
      return NextResponse.json({ error: 'Code is invalid' }, { status: 400 });
    }

    await docRef.delete();

    const sessionToken = await createSession({ phone, method: 'sms_otp' });
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error('OTP verification failed:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
