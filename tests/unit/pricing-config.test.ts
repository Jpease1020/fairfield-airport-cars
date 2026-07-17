import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyMinimumFare } from '@/lib/business/pricing-config';

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

describe('applyMinimumFare — shared floor logic (used by both the real quote endpoint and the admin test-quote preview so they can\'t silently drift on how the floor is applied)', () => {
  it('raises a fare below the floor, and reports it as applied', () => {
    expect(applyMinimumFare(45, 100)).toEqual({ fare: 100, minimumFareApplied: true });
  });

  it('leaves a fare at or above the floor unchanged, and reports it as not applied', () => {
    expect(applyMinimumFare(150, 100)).toEqual({ fare: 150, minimumFareApplied: false });
    expect(applyMinimumFare(100, 100)).toEqual({ fare: 100, minimumFareApplied: false });
  });

  it('treats a configured floor of 0 as "no floor" rather than clamping everything to 0', () => {
    expect(applyMinimumFare(45, 0)).toEqual({ fare: 45, minimumFareApplied: false });
  });

  it('ceils a fractional minimumFare so the result is always a whole dollar (regression: a fractional floor could win Math.max and produce a fractional final fare)', () => {
    expect(applyMinimumFare(45, 99.5)).toEqual({ fare: 100, minimumFareApplied: true });
  });
});
