import { NextResponse } from 'next/server';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

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

const buckets = new Map<string, RateLimitBucket>();
let lastPruneAt = 0;
const PRUNE_INTERVAL_MS = 60_000;

function pruneExpired(now: number): void {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) buckets.delete(key);
  }
  lastPruneAt = now;
}

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

function evaluateRateLimit({ bucket, limit, windowMs, key }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const subject = key?.trim() || 'anon';
  const lookupKey = `${bucket}:${subject}`;
  const existing = buckets.get(lookupKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(lookupKey, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  buckets.set(lookupKey, existing);

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

export function enforceRateLimit(request: Request, options: Omit<RateLimitOptions, 'key'>): NextResponse | null {
  const result = evaluateRateLimit({
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

export function resetRateLimitStoreForTests(): void {
  buckets.clear();
  lastPruneAt = 0;
}
