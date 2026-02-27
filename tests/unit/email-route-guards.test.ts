import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalNodeEnv = process.env.NODE_ENV;

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin' } }),
}));

describe('Email route production guards', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
  });

  it('blocks POST /api/email/test in production', async () => {
    const { POST } = await import('@/app/api/email/test/route');
    const response = await POST(new Request('http://localhost/api/email/test', { method: 'POST' }) as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it('blocks POST /api/email/enhanced-test in production', async () => {
    const { POST } = await import('@/app/api/email/enhanced-test/route');
    const response = await POST(new Request('http://localhost/api/email/enhanced-test', { method: 'POST' }) as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it('blocks POST /api/email/test-confirmation in production', async () => {
    const { POST } = await import('@/app/api/email/test-confirmation/route');
    const response = await POST(new Request('http://localhost/api/email/test-confirmation', { method: 'POST' }) as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it('blocks POST /api/email/test-booking-verification in production', async () => {
    const { POST } = await import('@/app/api/email/test-booking-verification/route');
    const response = await POST(new Request('http://localhost/api/email/test-booking-verification', { method: 'POST' }) as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it('blocks GET /api/email/verify-config in production', async () => {
    const { GET } = await import('@/app/api/email/verify-config/route');
    const response = await GET(new Request('http://localhost/api/email/verify-config', { method: 'GET' }) as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });
});
