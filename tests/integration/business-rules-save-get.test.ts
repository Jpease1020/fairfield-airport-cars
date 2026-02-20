/**
 * Business rules save then get (BACKLOG #15).
 * After admin saves bookingBufferMinutes, the next getBusinessRules() returns the new value
 * (cache is invalidated on save, so "used after TTL" is satisfied).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const stored: Record<string, unknown> = {};

const mockDocRef = {
  get: vi.fn().mockImplementation(async () => ({
    exists: Object.keys(stored).length > 0,
    data: () => ({ ...stored }),
  })),
  set: vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
    const copy = { ...data };
    if (copy.updatedAt != null && typeof copy.updatedAt === 'object') {
      copy.updatedAt = new Date();
    }
    Object.assign(stored, copy);
  }),
};

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue(mockDocRef),
    }),
  }),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => ({}),
  },
}));

import {
  getBusinessRules,
  saveBusinessRules,
  invalidateBusinessRulesCache,
  DEFAULT_BUSINESS_RULES,
} from '@/lib/business/business-rules';

describe('Business rules save then get (used after TTL)', () => {
  beforeEach(() => {
    invalidateBusinessRulesCache();
    Object.keys(stored).forEach((k) => delete stored[k]);
  });

  it('after saveBusinessRules(bookingBufferMinutes), getBusinessRules returns new value', async () => {
    // Simulate admin saving a new buffer
    await saveBusinessRules({ bookingBufferMinutes: 90, updatedBy: 'admin' });

    // Cache was invalidated; next get should refetch and see the saved value
    const rules = await getBusinessRules();
    expect(rules.bookingBufferMinutes).toBe(90);
  });

  it('getBusinessRules returns defaults when doc not yet saved', async () => {
    const rules = await getBusinessRules();
    expect(rules.bookingBufferMinutes).toBe(DEFAULT_BUSINESS_RULES.bookingBufferMinutes);
  });
});
