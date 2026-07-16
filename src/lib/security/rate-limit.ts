import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue, type DocumentReference, type Transaction } from 'firebase-admin/firestore';

export type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
  key?: string | null;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

// Shared Firestore-backed store so the limit holds across cold starts and
// concurrently-scaled serverless instances (an in-memory Map is per-instance
// and can be trivially bypassed). Configure a Firestore TTL policy on
// rateLimits.resetAt so expired counters are garbage-collected automatically.
const RATE_LIMIT_COLLECTION = 'rateLimits';

function getClientIp(request: Request): string {
  const headers = (request as { headers?: { get?: (key: string) => string | null } }).headers;
  const getHeader =
    headers && typeof (headers as { get?: unknown }).get === 'function'
      ? (name: string) => headers.get?.(name) ?? null
      : () => null;

  const forwardedFor = getHeader('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  return (
    getHeader('x-real-ip') ||
    getHeader('cf-connecting-ip') ||
    getHeader('true-client-ip') ||
    'unknown'
  );
}

async function evaluateRateLimit({ bucket, limit, windowMs, key }: RateLimitOptions): Promise<RateLimitResult> {
  const subject = key?.trim() || 'anon';
  const lookupKey = `${bucket}:${subject}`;
  const db = getAdminDb();
  const docRef: DocumentReference = db.collection(RATE_LIMIT_COLLECTION).doc(lookupKey);

  return db.runTransaction(async (transaction: Transaction) => {
    const now = Date.now();
    const snap = await transaction.get(docRef);
    const data = snap.exists ? (snap.data() as { count: number; resetAt: number }) : null;

    if (!data || data.resetAt <= now) {
      const resetAt = now + windowMs;
      transaction.set(docRef, { count: 1, resetAt, updatedAt: FieldValue.serverTimestamp() });
      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetAt,
        retryAfterSeconds: 0,
      };
    }

    if (data.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((data.resetAt - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetAt: data.resetAt,
        retryAfterSeconds,
      };
    }

    transaction.update(docRef, { count: data.count + 1, updatedAt: FieldValue.serverTimestamp() });
    return {
      allowed: true,
      remaining: Math.max(0, limit - (data.count + 1)),
      resetAt: data.resetAt,
      retryAfterSeconds: 0,
    };
  });
}

export async function enforceRateLimit(
  request: Request,
  options: Omit<RateLimitOptions, 'key'>
): Promise<NextResponse | null> {
  const result = await evaluateRateLimit({
    ...options,
    key: getClientIp(request),
  });

  if (result.allowed) return null;

  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(options.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    }
  );
}

export async function resetRateLimitStoreForTests(): Promise<void> {
  const db = getAdminDb();
  const refs = await db.collection(RATE_LIMIT_COLLECTION).listDocuments();
  await Promise.all(refs.map((ref: { delete: () => Promise<unknown> }) => ref.delete()));
}
