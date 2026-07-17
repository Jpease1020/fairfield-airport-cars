import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeFirestoreDb } from '../utils/fake-firestore-db';

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
  OTP_PHONE_LOCKOUT_THRESHOLD: 15,
  OTP_PHONE_LOCKOUT_WINDOW_MS: 60 * 60_000,
  createSession,
  setSessionCookie,
}));

let fakeDb: ReturnType<typeof createFakeFirestoreDb>;

describe('OTP auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeDb = createFakeFirestoreDb();
    getAdminDb.mockReturnValue(fakeDb.db);
  });

  it('POST /api/auth/request-otp returns 200 and sends SMS', async () => {
    const { POST } = await import('@/app/api/auth/request-otp/route');
    const response = await POST(
      new Request('http://localhost/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '(203) 555-0123' }),
      }) as any
    );

    expect(response.status).toBe(200);
    expect(fakeDb.store.get('authOtps/+12035550123')).toBeTruthy();
    expect(sendSms).toHaveBeenCalledTimes(1);
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+12035550123',
      })
    );
  });

  it('refuses a new code when the phone-level failed-attempts lockout is active (regression: previously requesting a new code always reset attempts to 0, so the lockout only ever bounded one disposable code)', async () => {
    fakeDb.seed('authOtpRequests', '+12035550123', {
      failedAttempts: 15,
      failedAttemptsWindowStart: new Date(),
    });

    const { POST } = await import('@/app/api/auth/request-otp/route');
    const response = await POST(
      new Request('http://localhost/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '(203) 555-0123' }),
      }) as any
    );
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toContain('Too many failed attempts');
    expect(sendSms).not.toHaveBeenCalled();
  });

  it('rate-limits request-otp by IP even across different phone numbers (regression: was only throttled per-phone, so a script could SMS-bomb arbitrary numbers)', async () => {
    const { POST } = await import('@/app/api/auth/request-otp/route');
    const makeRequest = (phoneSuffix: number) =>
      POST(
        new Request('http://localhost/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.5' },
          body: JSON.stringify({ phone: `20355501${String(phoneSuffix).padStart(2, '0')}` }),
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

  it('POST /api/auth/verify-otp with wrong code returns 400, increments per-code attempts, and increments the phone-level failure count', async () => {
    fakeDb.seed('authOtps', '+12035550123', {
      attempts: 1,
      codeHash: 'hash-+12035550123:123456',
      expiresAt: { toDate: () => new Date(Date.now() + 10 * 60 * 1000) },
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
    expect(fakeDb.store.get('authOtps/+12035550123')).toEqual(
      expect.objectContaining({ attempts: 2 })
    );
    expect(fakeDb.store.get('authOtpRequests/+12035550123')).toEqual(
      expect.objectContaining({ failedAttempts: 1 })
    );
  });

  it('locks out further guesses once the per-code attempts counter is already at MAX_ATTEMPTS, even under concurrent requests (regression: read-then-write attempts was not atomic, letting concurrent guesses all pass the check)', async () => {
    fakeDb.seed('authOtps', '+12035550123', {
      attempts: 5,
      codeHash: 'hash-+12035550123:123456',
      expiresAt: { toDate: () => new Date(Date.now() + 10 * 60 * 1000) },
    });

    const { POST } = await import('@/app/api/auth/verify-otp/route');
    const response = await POST(
      new Request('http://localhost/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '2035550123', code: '123456' }),
      }) as any
    );
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toContain('Too many attempts');
  });

  it('POST /api/auth/verify-otp with valid code returns 200, sets session cookie, and resets the phone-level failure count', async () => {
    fakeDb.seed('authOtps', '+12035550123', {
      attempts: 0,
      codeHash: 'hash-+12035550123:123456',
      expiresAt: { toDate: () => new Date(Date.now() + 10 * 60 * 1000) },
    });
    fakeDb.seed('authOtpRequests', '+12035550123', { failedAttempts: 3 });

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
    expect(fakeDb.store.get('authOtps/+12035550123')).toBeUndefined();
    expect(fakeDb.store.get('authOtpRequests/+12035550123')).toEqual(
      expect.objectContaining({ failedAttempts: 0 })
    );
  });
});
