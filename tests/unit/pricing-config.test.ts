import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAdminDb = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: () => getAdminDb(),
}));

let getPricingConfig: typeof import('@/lib/business/pricing-config').getPricingConfig;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ getPricingConfig } = await import('@/lib/business/pricing-config'));
});

function mockDoc(data: Record<string, unknown> | undefined) {
  getAdminDb.mockReturnValue({
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: data !== undefined,
          data: () => data,
        }),
      }),
    }),
  });
}

describe('getPricingConfig — minimumFare default', () => {
  it('defaults minimumFare to 100 for a config/pricing doc that predates the field (regression: the zod schema defaulted the missing field to 0, silently disabling the floor for every existing production config until an admin happened to re-save the pricing page)', async () => {
    mockDoc({
      baseFare: 15,
      perMile: 1.8,
      perMinute: 0.2,
      airportReturnMultiplier: 1.15,
      personalDiscountPercent: 10,
      // no minimumFare field — simulates a doc written before this field existed
    });

    const config = await getPricingConfig();

    expect(config.minimumFare).toBe(100);
  });

  it('respects an explicit minimumFare of 0 saved by an admin (deliberately disabling the floor)', async () => {
    mockDoc({
      baseFare: 15,
      perMile: 1.8,
      perMinute: 0.2,
      airportReturnMultiplier: 1.15,
      personalDiscountPercent: 10,
      minimumFare: 0,
    });

    const config = await getPricingConfig();

    expect(config.minimumFare).toBe(0);
  });

  it('respects an explicit non-default minimumFare saved by an admin', async () => {
    mockDoc({
      baseFare: 15,
      perMile: 1.8,
      perMinute: 0.2,
      airportReturnMultiplier: 1.15,
      personalDiscountPercent: 10,
      minimumFare: 75,
    });

    const config = await getPricingConfig();

    expect(config.minimumFare).toBe(75);
  });
});
