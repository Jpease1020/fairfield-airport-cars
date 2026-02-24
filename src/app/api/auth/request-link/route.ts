import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { sendMagicLinkEmail } from '@/lib/services/email-service';
import {
  hmacToken,
  normalizeEmail,
  OTP_MIN_INTERVAL_SECONDS,
} from '@/lib/utils/auth-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailInput = body?.email;
    const redirect = body?.redirect || null;
    const email = normalizeEmail(emailInput);

    if (!email) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date();

    const rateDocRef = db.collection('authMagicLinkRequests').doc(email);
    const rateDoc = await rateDocRef.get();
    const lastSentAt = rateDoc.exists ? rateDoc.data()?.lastSentAt?.toDate?.() || rateDoc.data()?.lastSentAt : null;
    if (lastSentAt && now.getTime() - new Date(lastSentAt).getTime() < OTP_MIN_INTERVAL_SECONDS * 1000) {
      return NextResponse.json({ error: 'Please wait before requesting another link.' }, { status: 429 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hmacToken(token);
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    await db.collection('authMagicLinks').doc(tokenHash).set({
      tokenHash,
      email,
      createdAt: now,
      expiresAt,
      used: false,
    });

    await rateDocRef.set({ lastSentAt: now }, { merge: true });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const url = new URL('/auth/magic', baseUrl);
    url.searchParams.set('token', token);
    url.searchParams.set('email', email);
    if (redirect) {
      url.searchParams.set('redirect', redirect);
    }

    await sendMagicLinkEmail(email, url.toString());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link request failed:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
