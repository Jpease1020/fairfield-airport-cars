/**
 * Business rules stored in Firestore config/businessRules.
 * Server-only: use getBusinessRules() in API routes and server code.
 */

import { z } from 'zod';

const serviceAreaSchema = z.object({
  normalRadiusMiles: z.number().min(1).max(100),
  extendedRadiusMiles: z.number().min(1).max(150),
});

const cancellationFeeTiersSchema = z.object({
  over24hFeePercent: z.number().min(0).max(100),
  under24hFeePercent: z.number().min(0).max(100),
  under12hFeePercent: z.number().min(0).max(100),
  under6hFeePercent: z.number().min(0).max(100),
});

const depositSchema = z.object({
  required: z.boolean(),
  mode: z.enum(['percent', 'fixed']),
  value: z.number().min(0),
});

const featuresSchema = z.object({
  trackingEnabled: z.boolean(),
  reviewsEnabled: z.boolean(),
});

export const businessRulesSchema = z.object({
  serviceArea: serviceAreaSchema,
  bookingBufferMinutes: z.number().min(0).max(240),
  cancellationFeeTiers: cancellationFeeTiersSchema,
  deposit: depositSchema,
  features: featuresSchema,
  updatedAt: z.union([z.date(), z.string()]).optional(),
  updatedBy: z.string().optional(),
  version: z.number().int().min(1).optional(),
});

export type BusinessRules = z.infer<typeof businessRulesSchema>;

export const DEFAULT_BUSINESS_RULES: BusinessRules = {
  serviceArea: { normalRadiusMiles: 25, extendedRadiusMiles: 40 },
  bookingBufferMinutes: 60,
  cancellationFeeTiers: {
    over24hFeePercent: 0,
    under24hFeePercent: 25,
    under12hFeePercent: 50,
    under6hFeePercent: 75,
  },
  deposit: { required: false, mode: 'percent', value: 0 },
  features: { trackingEnabled: true, reviewsEnabled: true },
  version: 1,
};

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
let cached: { rules: BusinessRules; at: number } | null = null;

/**
 * Get business rules from Firestore config/businessRules with in-memory cache.
 * Falls back to DEFAULT_BUSINESS_RULES if doc missing or invalid.
 */
export async function getBusinessRules(): Promise<BusinessRules> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.rules;
  }
  try {
    const { getAdminDb } = await import('@/lib/utils/firebase-admin');
    const db = getAdminDb();
    const docRef = db.collection('config').doc('businessRules');
    const snap = await docRef.get();
    if (!snap.exists) {
      cached = { rules: DEFAULT_BUSINESS_RULES, at: Date.now() };
      return DEFAULT_BUSINESS_RULES;
    }
    const data = snap.data();
    const parsed = businessRulesSchema.safeParse({
      ...data,
      updatedAt: data?.updatedAt?.toDate?.() ?? data?.updatedAt,
    });
    if (parsed.success) {
      cached = { rules: parsed.data, at: Date.now() };
      return parsed.data;
    }
  } catch (err) {
    console.warn('getBusinessRules failed, using defaults:', err);
  }
  cached = { rules: DEFAULT_BUSINESS_RULES, at: Date.now() };
  return DEFAULT_BUSINESS_RULES;
}

/**
 * Invalidate cache (e.g. after admin updates rules).
 */
export function invalidateBusinessRulesCache(): void {
  cached = null;
}

/**
 * Save business rules to Firestore. Admin only; call from authenticated API.
 */
export async function saveBusinessRules(rules: Partial<BusinessRules> & { updatedBy?: string }): Promise<void> {
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const { FieldValue } = await import('firebase-admin/firestore');
  const db = getAdminDb();
  const merged: BusinessRules = {
    ...DEFAULT_BUSINESS_RULES,
    ...rules,
    serviceArea: { ...DEFAULT_BUSINESS_RULES.serviceArea, ...rules.serviceArea },
    cancellationFeeTiers: { ...DEFAULT_BUSINESS_RULES.cancellationFeeTiers, ...rules.cancellationFeeTiers },
    deposit: { ...DEFAULT_BUSINESS_RULES.deposit, ...rules.deposit },
    features: { ...DEFAULT_BUSINESS_RULES.features, ...rules.features },
  };
  const validated = businessRulesSchema.parse(merged);
  const docRef = db.collection('config').doc('businessRules');
  const snap = await docRef.get();
  const currentVersion = (snap.data()?.version as number) ?? 0;
  await docRef.set({
    ...validated,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: rules.updatedBy ?? 'admin',
    version: currentVersion + 1,
  }, { merge: true });
  invalidateBusinessRulesCache();
}

/**
 * Compute cancellation fee percent from hours until pickup (aligns with Part 4.1).
 */
export function getCancellationFeePercent(hoursUntilPickup: number, tiers: BusinessRules['cancellationFeeTiers']): number {
  if (hoursUntilPickup >= 24) return tiers.over24hFeePercent;
  if (hoursUntilPickup >= 12) return tiers.under24hFeePercent;
  if (hoursUntilPickup >= 6) return tiers.under12hFeePercent;
  return tiers.under6hFeePercent;
}
