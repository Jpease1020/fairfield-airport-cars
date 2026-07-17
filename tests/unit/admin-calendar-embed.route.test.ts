import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAdmin = vi.fn();

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin,
}));

let GET: typeof import('@/app/api/admin/calendar-embed/route').GET;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ GET } = await import('@/app/api/admin/calendar-embed/route'));
});

describe('GET /api/admin/calendar-embed', () => {
  it('never lets the browser cache the response (regression: `private, max-age=300` is keyed by URL only, not by the Authorization header requireAdmin checks — a browser could replay a previously-authenticated response to a different identity after a logout/account switch within the cache window, without requireAdmin ever re-running)', async () => {
    requireAdmin.mockResolvedValue({ ok: true, auth: { role: 'admin', uid: 'admin-1' } });

    const response = await GET(new Request('http://localhost/api/admin/calendar-embed') as any);

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('does not return calendar config for a non-admin request', async () => {
    requireAdmin.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    });

    const response = await GET(new Request('http://localhost/api/admin/calendar-embed') as any);

    expect(response.status).toBe(403);
  });
});
