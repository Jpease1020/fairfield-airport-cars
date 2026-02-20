import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCancellationFeePercent,
  getBusinessRules,
  invalidateBusinessRulesCache,
  DEFAULT_BUSINESS_RULES,
  businessRulesSchema,
  type BusinessRules,
} from '@/lib/business/business-rules';

describe('getBusinessRules', () => {
  beforeEach(() => {
    invalidateBusinessRulesCache();
  });

  it('returns default rules when cache is empty (falls back when Firestore unavailable or doc missing)', async () => {
    const rules = await getBusinessRules();
    expect(rules).toBeDefined();
    expect(rules.serviceArea.normalRadiusMiles).toBe(DEFAULT_BUSINESS_RULES.serviceArea.normalRadiusMiles);
    expect(rules.cancellationFeeTiers).toEqual(DEFAULT_BUSINESS_RULES.cancellationFeeTiers);
    expect(rules.bookingBufferMinutes).toBe(60);
  });

  it('invalidates cache so next getBusinessRules can refetch', () => {
    invalidateBusinessRulesCache();
    expect(() => invalidateBusinessRulesCache()).not.toThrow();
  });
});

describe('getCancellationFeePercent', () => {
  const tiers = DEFAULT_BUSINESS_RULES.cancellationFeeTiers;

  it('returns 0% fee when 24+ hours until pickup', () => {
    expect(getCancellationFeePercent(24, tiers)).toBe(0);
    expect(getCancellationFeePercent(48, tiers)).toBe(0);
  });

  it('returns 25% fee when 12-24 hours until pickup', () => {
    expect(getCancellationFeePercent(12, tiers)).toBe(25);
    expect(getCancellationFeePercent(18, tiers)).toBe(25);
  });

  it('returns 50% fee when 6-12 hours until pickup', () => {
    expect(getCancellationFeePercent(6, tiers)).toBe(50);
    expect(getCancellationFeePercent(8, tiers)).toBe(50);
  });

  it('returns 75% fee when under 6 hours until pickup', () => {
    expect(getCancellationFeePercent(5, tiers)).toBe(75);
    expect(getCancellationFeePercent(0, tiers)).toBe(75);
  });
});

describe('businessRulesSchema', () => {
  it('accepts valid default business rules', () => {
    const result = businessRulesSchema.safeParse(DEFAULT_BUSINESS_RULES);
    expect(result.success).toBe(true);
  });

  it('rejects invalid service area radius', () => {
    const invalid: Partial<BusinessRules> = {
      ...DEFAULT_BUSINESS_RULES,
      serviceArea: { normalRadiusMiles: 0, extendedRadiusMiles: 40 },
    };
    const result = businessRulesSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
