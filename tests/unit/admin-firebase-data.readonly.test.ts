import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin' } }),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  adminServices: {
    firestore: {},
  },
}));

describe('Admin firebase-data route readonly behavior', () => {
  it('blocks update actions in non-production environments', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('@/app/api/admin/firebase-data/route');
    const response = await POST(new Request('http://localhost/api/admin/firebase-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: 'bookings',
        documentId: 'booking_123',
        action: 'update',
        data: { status: 'confirmed' },
      }),
    }) as any);

    expect(response).toBeDefined();
    expect(response!.status).toBe(403);
  });

  it('blocks non-allowlisted collections', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('@/app/api/admin/firebase-data/route');
    const response = await POST(new Request('http://localhost/api/admin/firebase-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: 'superSensitiveCollection',
        action: 'fetch',
      }),
    }) as any);

    expect(response).toBeDefined();
    expect(response!.status).toBe(403);
  });
});
