import { beforeEach, describe, expect, it } from 'vitest';
import { enforceRateLimit, resetRateLimitStoreForTests } from '@/lib/security/rate-limit';

const buildRequest = (ip: string) =>
  new Request('http://localhost/api/test', {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
    },
  });

describe('rate-limit utility', () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it('allows requests up to the configured limit', () => {
    const request = buildRequest('1.2.3.4');

    const first = enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 2,
      windowMs: 60_000,
    });
    const second = enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 2,
      windowMs: 60_000,
    });

    expect(first).toBeNull();
    expect(second).toBeNull();
  });

  it('returns 429 when the limit is exceeded', async () => {
    const request = buildRequest('1.2.3.4');

    enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 1,
      windowMs: 60_000,
    });
    const blocked = enforceRateLimit(request, {
      bucket: 'test-bucket',
      limit: 1,
      windowMs: 60_000,
    });

    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
    const payload = await blocked?.json();
    expect(payload.code).toBe('RATE_LIMITED');
  });

  it('tracks limits independently by IP', () => {
    const firstIp = buildRequest('1.2.3.4');
    const secondIp = buildRequest('5.6.7.8');

    const blockedFirst = (() => {
      enforceRateLimit(firstIp, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });
      return enforceRateLimit(firstIp, { bucket: 'test-bucket', limit: 1, windowMs: 60_000 });
    })();

    const secondAllowed = enforceRateLimit(secondIp, {
      bucket: 'test-bucket',
      limit: 1,
      windowMs: 60_000,
    });

    expect(blockedFirst?.status).toBe(429);
    expect(secondAllowed).toBeNull();
  });
});
