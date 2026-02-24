import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { sendSms } from '@/lib/services/twilio-service';
import {
  hmacToken,
  normalizePhone,
  OTP_MIN_INTERVAL_SECONDS,
  OTP_TTL_MINUTES,
} from '@/lib/utils/auth-session';

const generateOtp = (): string => {
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  return code;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneInput = body?.phone;
    const phone = normalizePhone(phoneInput);

    if (!phone) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date();

    const rateDocRef = db.collection('authOtpRequests').doc(phone);
    const rateDoc = await rateDocRef.get();
    const lastSentAt = rateDoc.exists ? rateDoc.data()?.lastSentAt?.toDate?.() || rateDoc.data()?.lastSentAt : null;
    if (lastSentAt && now.getTime() - new Date(lastSentAt).getTime() < OTP_MIN_INTERVAL_SECONDS * 1000) {
      return NextResponse.json({ error: 'Please wait before requesting another code.' }, { status: 429 });
    }

    const code = generateOtp();
    const codeHash = hmacToken(`${phone}:${code}`);
    const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    await db.collection('authOtps').doc(phone).set({
      phone,
      codeHash,
      createdAt: now,
      expiresAt,
      attempts: 0,
    });

    await rateDocRef.set({ lastSentAt: now }, { merge: true });

    await sendSms({
      to: phone,
      body: `Your Fairfield Airport Cars code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP request failed:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
