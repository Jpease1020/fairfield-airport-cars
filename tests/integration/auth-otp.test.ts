import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendSms = vi.fn().mockResolvedValue({ sid: 'sms-123' });
const getAdminDb = vi.fn();
const createSession = vi.fn().mockResolvedValue('session-token');
const setSessionCookie = vi.fn();

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms,
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/lib/utils/auth-session', () => ({
  hmacToken: vi.fn((value: string) => `hash-${value}`),
  normalizePhone: vi.fn((value?: string) => {
    if (!value) return null;
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return null;
  }),
  OTP_MIN_INTERVAL_SECONDS: 60,
  OTP_TTL_MINUTES: 10,
  createSession,
  setSessionCookie,
}));

describe('OTP auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/request-otp returns 200 and sends SMS', async () => {
    const otpDocSet = vi.fn().mockResolvedValue(undefined);
    const rateDocGet = vi.fn().mockResolvedValue({ exists: false, data: () => ({}) });
    const rateDocSet = vi.fn().mockResolvedValue(undefined);

    getAdminDb.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'authOtps') {
          return {
            doc: vi.fn(() => ({ set: otpDocSet })),
          };
        }

        if (name === 'authOtpRequests') {
          return {
            doc: vi.fn(() => ({
              get: rateDocGet,
              set: rateDocSet,
            })),
          };
        }

        return { doc: vi.fn() };
      }),
    });

    const { POST } = await import('@/app/api/auth/request-otp/route');
    const response = await POST(
      new Request('http://localhost/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '(203) 555-0123' }),
      }) as any
    );

    expect(response.status).toBe(200);
    expect(otpDocSet).toHaveBeenCalledTimes(1);
    expect(sendSms).toHaveBeenCalledTimes(1);
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+12035550123',
      })
    );
  });

  it('POST /api/auth/verify-otp with wrong code returns 400 and increments attempts', async () => {
    const otpDocSet = vi.fn().mockResolvedValue(undefined);

    getAdminDb.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'authOtps') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({
                  attempts: 1,
                  codeHash: 'hash-+12035550123:123456',
                  expiresAt: { toDate: () => new Date(Date.now() + 10 * 60 * 1000) },
                }),
              }),
              set: otpDocSet,
              delete: vi.fn().mockResolvedValue(undefined),
            })),
          };
        }

        return { doc: vi.fn() };
      }),
    });

    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const response = await POST(
      new Request('http://localhost/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '2035550123', code: '000000' }),
      }) as any
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('invalid');
    expect(otpDocSet).toHaveBeenCalledWith({ attempts: 2 }, { merge: true });
  });

  it('POST /api/auth/verify-otp with valid code returns 200 and sets session cookie', async () => {
    const otpDocDelete = vi.fn().mockResolvedValue(undefined);

    getAdminDb.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'authOtps') {
          return {
            doc: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({
                  attempts: 0,
                  codeHash: 'hash-+12035550123:123456',
                  expiresAt: { toDate: () => new Date(Date.now() + 10 * 60 * 1000) },
                }),
              }),
              set: vi.fn().mockResolvedValue(undefined),
              delete: otpDocDelete,
            })),
          };
        }

        return { doc: vi.fn() };
      }),
    });

    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const response = await POST(
      new Request('http://localhost/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '2035550123', code: '123456' }),
      }) as any
    );

    expect(response.status).toBe(200);
    expect(createSession).toHaveBeenCalledWith({
      phone: '+12035550123',
      method: 'sms_otp',
    });
    expect(setSessionCookie).toHaveBeenCalledTimes(1);
    expect(otpDocDelete).toHaveBeenCalledTimes(1);
  });
});
