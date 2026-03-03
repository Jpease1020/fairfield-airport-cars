import { afterEach, describe, expect, it, vi } from 'vitest';

describe('cms-source', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to static source', async () => {
    vi.resetModules();
    vi.stubEnv('CMS_SOURCE', '');
    const { getConfiguredCmsSource } = await import('@/lib/services/cms-source');
    expect(getConfiguredCmsSource()).toBe('static');
  });

  it('reads static source when configured', async () => {
    vi.resetModules();
    vi.stubEnv('CMS_SOURCE', 'static');
    const { getConfiguredCmsSource, isStaticCmsSource } = await import('@/lib/services/cms-source');
    expect(getConfiguredCmsSource()).toBe('static');
    expect(isStaticCmsSource()).toBe(true);
  });

  it('forces static source in production when firestore is not explicitly allowed', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CMS_SOURCE', 'firestore');
    vi.stubEnv('CMS_ALLOW_FIRESTORE_IN_PROD', 'false');

    const { getConfiguredCmsSource } = await import('@/lib/services/cms-source');
    expect(getConfiguredCmsSource()).toBe('static');
  });

  it('allows firestore in production when explicitly enabled', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CMS_SOURCE', 'firestore');
    vi.stubEnv('CMS_ALLOW_FIRESTORE_IN_PROD', 'true');

    const { getConfiguredCmsSource } = await import('@/lib/services/cms-source');
    expect(getConfiguredCmsSource()).toBe('firestore');
  });
});
