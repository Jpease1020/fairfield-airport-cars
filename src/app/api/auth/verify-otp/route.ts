import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import type { DocumentReference, Transaction } from 'firebase-admin/firestore';
import {
  createSession,
  hmacToken,
  normalizePhone,
  setSessionCookie,
  OTP_PHONE_LOCKOUT_WINDOW_MS,
} from '@/lib/utils/auth-session';
import { enforceRateLimit } from '@/lib/security/rate-limit';

const MAX_ATTEMPTS = 5;

type VerifyOutcome = 'invalid' | 'expired' | 'too-many' | 'wrong-code' | 'success';

export async function POST(request: NextRequest) {
  // Guessing codes has no per-subject cooldown of its own (unlike request-otp) — without an
  // IP-level limit, a script can brute-force a 6-digit code across many phone numbers.
  const limited = await enforceRateLimit(request, {
    bucket: 'api:auth:verify-otp',
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (limited) return limited;

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
    const docRef: DocumentReference = db.collection('authOtps').doc(phone);
    const phoneRequestRef: DocumentReference = db.collection('authOtpRequests').doc(phone);

    // The attempts check-then-increment must be atomic: reading `attempts` and later writing
    // `attempts + 1` as two separate operations lets concurrent guess requests all read the same
    // pre-increment count and all pass the `< MAX_ATTEMPTS` check before any write lands,
    // defeating the lockout entirely under concurrency. A transaction serializes this per phone.
    // Also tracks a phone-level failure count (independent of the per-code `attempts` above) so
    // requesting a fresh code doesn't reset an attacker's cumulative guess budget back to zero.
    const outcome: VerifyOutcome = await db.runTransaction(async (transaction: Transaction) => {
      const [doc, phoneRequestDoc] = await Promise.all([
        transaction.get(docRef),
        transaction.get(phoneRequestRef),
      ]);

      if (!doc.exists) return 'invalid';

      const data = doc.data();
      if (!data) return 'invalid';

      const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt;
      if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
        transaction.delete(docRef);
        return 'expired';
      }

      const attempts = data.attempts || 0;
      if (attempts >= MAX_ATTEMPTS) {
        transaction.delete(docRef);
        return 'too-many';
      }

      const expectedHash = hmacToken(`${phone}:${code}`);
      if (expectedHash !== data.codeHash) {
        transaction.update(docRef, { attempts: attempts + 1 });

        const phoneRequestData = phoneRequestDoc.data();
        const windowStart = phoneRequestData?.failedAttemptsWindowStart?.toDate?.()
          ?? phoneRequestData?.failedAttemptsWindowStart;
        const windowExpired = !windowStart || Date.now() - new Date(windowStart).getTime() > OTP_PHONE_LOCKOUT_WINDOW_MS;
        const priorFailedAttempts = windowExpired ? 0 : (phoneRequestData?.failedAttempts || 0);

        transaction.set(phoneRequestRef, {
          failedAttempts: priorFailedAttempts + 1,
          failedAttemptsWindowStart: windowExpired ? new Date() : (windowStart ?? new Date()),
        }, { merge: true });

        return 'wrong-code';
      }

      transaction.delete(docRef);
      transaction.set(phoneRequestRef, { failedAttempts: 0 }, { merge: true });
      return 'success';
    });

    if (outcome === 'invalid' || outcome === 'expired') {
      return NextResponse.json({ error: 'Code is invalid or expired' }, { status: 400 });
    }
    if (outcome === 'too-many') {
      return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
    }
    if (outcome === 'wrong-code') {
      return NextResponse.json({ error: 'Code is invalid' }, { status: 400 });
    }

    const sessionToken = await createSession({ phone, method: 'sms_otp' });
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error('OTP verification failed:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
