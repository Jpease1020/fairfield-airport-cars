import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalNodeEnv = process.env.NODE_ENV;

const notFoundMock = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

describe('Admin test-email page guard', () => {
  beforeEach(() => {
    vi.resetModules();
    notFoundMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
  });

  it('calls notFound in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const mod = await import('@/app/(admin)/test-email/page');
    mod.default();
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('does not call notFound outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const mod = await import('@/app/(admin)/test-email/page');
    mod.default();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
