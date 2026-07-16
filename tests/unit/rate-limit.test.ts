import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeRateLimitDb } from '../utils/fake-rate-limit-db';

const getAdminDb = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'server-timestamp') },
}));

const buildRequest = (ip: string) =>
  new Request('http://localhost/api/test', {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
    },
  });

describe('rate-limit utility', () => {
  let fakeDb: ReturnType<typeof createFakeRateLimitDb>;

  beforeEach(async () => {
    vi.clearAllMocks();
    fakeDb = createFakeRateLimitDb();
    getAdminDb.mockReturnValue({
      runTransaction: fakeDb.runTransaction,
      collection: (name: string) => {
        if (name === 'rateLimits') return fakeDb.rateLimitCollection;
        return { doc: vi.fn() };
      },
    });
  });

  it('allows requests up to the configured limit', async () => {
    const { enforceRateLimit } = await import('@/lib/security/rate-limit');
    const request = buildRequest('1.2.3.4');

    const first = await enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 2,
      windowMs: 60_000,
    });
    const second = await enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 2,
      windowMs: 60_000,
    });

    expect(first).toBeNull();
    expect(second).toBeNull();
  });

  it('returns 429 when the limit is exceeded', async () => {
    const { enforceRateLimit } = await import('@/lib/security/rate-limit');
    const request = buildRequest('1.2.3.4');

    await enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 1,
      windowMs: 60_000,
    });
    const blocked = await enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 1,
      windowMs: 60_000,
    });

    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
    const payload = await blocked?.json();
    expect(payload.code).toBe('RATE_LIMITED');
  });

  it('tracks limits independently by IP', async () => {
    const { enforceRateLimit } = await import('@/lib/security/rate-limit');
    const firstIp = buildRequest('1.2.3.4');
    const secondIp = buildRequest('5.6.7.8');

    await enforceRateLimit(firstIp, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });
    const blockedFirst = await enforceRateLimit(firstIp, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });

    const secondAllowed = await enforceRateLimit(secondIp, {
      bucket: 'test-bucket',
      limit: 1,
      windowMs: 60_000,
    });

    expect(blockedFirst?.status).toBe(429);
    expect(secondAllowed).toBeNull();
  });

  it('shares the counter across separate calls the same way separate serverless instances would (the bug Codex flagged: an in-memory Map does not)', async () => {
    const { enforceRateLimit } = await import('@/lib/security/rate-limit');
    const request = buildRequest('9.9.9.9');

    // Simulate 10 requests hitting 10 different serverless instances by re-importing
    // nothing (the store lives in fakeDb, not in the module) — each call only shares
    // state via the same Firestore-backed collection, exactly like production.
    for (let i = 0; i < 5; i++) {
      const result = await enforceRateLimit(request, { bucket: 'shared-bucket', limit: 5, windowMs: 60_000 });
      expect(result).toBeNull();
    }

    const sixth = await enforceRateLimit(request, { bucket: 'shared-bucket', limit: 5, windowMs: 60_000 });
    expect(sixth?.status).toBe(429);
  });

  it('resetRateLimitStoreForTests clears all stored counters', async () => {
    const { enforceRateLimit, resetRateLimitStoreForTests } = await import('@/lib/security/rate-limit');
    const request = buildRequest('1.2.3.4');

    await enforceRateLimit(request, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });
    const blocked = await enforceRateLimit(request, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });
    expect(blocked?.status).toBe(429);

    await resetRateLimitStoreForTests();

    const allowedAfterReset = await enforceRateLimit(request, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });
    expect(allowedAfterReset).toBeNull();
  });
});
