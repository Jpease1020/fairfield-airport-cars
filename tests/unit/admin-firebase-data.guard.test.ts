import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalNodeEnv = process.env.NODE_ENV;

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin' } }),
}));

describe('Admin firebase-data route production guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
  });

  it('blocks GET in production', async () => {
    const { GET } = await import('@/app/api/admin/firebase-data/route');
    const response = await GET(new Request('http://localhost/api/admin/firebase-data?collection=bookings') as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it('blocks POST in production', async () => {
    const { POST } = await import('@/app/api/admin/firebase-data/route');
    const response = await POST(new Request('http://localhost/api/admin/firebase-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'bookings', action: 'fetch' }),
    }) as any);
    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });
});
