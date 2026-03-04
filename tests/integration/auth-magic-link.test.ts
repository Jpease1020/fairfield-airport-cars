import { beforeEach, describe, expect, it, vi } from 'vitest';

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

    getAdminDb.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'authMagicLinks') return linksCollection;
        if (name === 'authMagicLinkRequests') return requestsCollection;
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
