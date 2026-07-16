import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeRateLimitDb } from '../utils/fake-rate-limit-db';

const sendMagicLinkEmail = vi.fn().mockResolvedValue(undefined);
const getAdminDb = vi.fn();

vi.mock('@/lib/services/email-service', () => ({
  sendMagicLinkEmail,
}));

vi.mock('@/lib/utils/auth-session', () => ({
  hmacToken: vi.fn((value: string) => `hash-${value}`),
  normalizeEmail: vi.fn((value?: string) => (value ? value.trim().toLowerCase() : null)),
  OTP_MIN_INTERVAL_SECONDS: 60,
  createSession: vi.fn().mockResolvedValue('session-token'),
  setSessionCookie: vi.fn(),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

describe('magic link auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

    const linksCollection = {
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ exists: false, data: () => null }),
        set: vi.fn().mockResolvedValue(undefined),
      })),
    };

    const requestsCollection = {
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
        set: vi.fn().mockResolvedValue(undefined),
      })),
    };

    const { rateLimitCollection, runTransaction } = createFakeRateLimitDb();

    getAdminDb.mockReturnValue({
      runTransaction,
      collection: vi.fn((name: string) => {
        if (name === 'authMagicLinks') return linksCollection;
        if (name === 'authMagicLinkRequests') return requestsCollection;
        if (name === 'rateLimits') return rateLimitCollection;
        return { doc: vi.fn() };
      }),
    });
  });

  it('POST /api/auth/request-link returns 200 and calls sendMagicLinkEmail', async () => {
    const { POST } = await import('@/app/api/auth/request-link/route');
    const res = await POST(
      new Request('http://localhost/api/auth/request-link', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      }) as any
    );

    expect(res.status).toBe(200);
    expect(sendMagicLinkEmail).toHaveBeenCalledTimes(1);
  });

  it('rate-limits request-link by IP even across different email addresses (regression: was only throttled per-email, so a script could email-bomb arbitrary addresses)', async () => {
    const { POST } = await import('@/app/api/auth/request-link/route');
    const makeRequest = (i: number) =>
      POST(
        new Request('http://localhost/api/auth/request-link', {
          method: 'POST',
          body: JSON.stringify({ email: `victim${i}@example.com` }),
          headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.9' },
        }) as any
      );

    const responses = [];
    for (let i = 0; i < 11; i++) {
      responses.push(await makeRequest(i));
    }

    const statuses = responses.map((r) => r.status);
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });

  it('POST /api/auth/verify-link with invalid token returns 400', async () => {
    const { POST } = await import('@/app/api/auth/verify-link/route');
    const res = await POST(
      new Request('http://localhost/api/auth/verify-link', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token', email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      }) as any
    );

    expect(res.status).toBe(400);
  });
});
