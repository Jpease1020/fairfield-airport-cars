/**
 * Pricing configuration stored in Firestore config/pricing.
 * Server-only: use getPricingConfig() in API routes and server code.
 */

import { z } from 'zod';

export const pricingConfigSchema = z.object({
  baseFare: z.number().min(0).max(200),
  perMile: z.number().min(0).max(50),
  perMinute: z.number().min(0).max(10),
  airportReturnMultiplier: z.number().min(1).max(5),
  personalDiscountPercent: z.number().min(0).max(100),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  updatedBy: z.string().optional(),
  version: z.number().int().min(1).optional(),
});

export type PricingConfig = z.infer<typeof pricingConfigSchema>;

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseFare: 15,
  perMile: 1.80,
  perMinute: 0.20,
  airportReturnMultiplier: 1.15,
  personalDiscountPercent: 10,
  version: 1,
};

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
let cached: { config: PricingConfig; at: number } | null = null;

/**
 * Get pricing config from Firestore config/pricing with in-memory cache.
 * Falls back to DEFAULT_PRICING_CONFIG if doc missing or invalid.
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.config;
  }
  try {
    const { getAdminDb } = await import('@/lib/utils/firebase-admin');
    const db = getAdminDb();
    const docRef = db.collection('config').doc('pricing');
    const snap = await docRef.get();
    if (!snap.exists) {
      cached = { config: DEFAULT_PRICING_CONFIG, at: Date.now() };
      return DEFAULT_PRICING_CONFIG;
    }
    const data = snap.data();
    const parsed = pricingConfigSchema.safeParse({
      ...data,
      updatedAt: data?.updatedAt?.toDate?.() ?? data?.updatedAt,
    });
    if (parsed.success) {
      cached = { config: parsed.data, at: Date.now() };
      return parsed.data;
    }
  } catch (err) {
    console.warn('getPricingConfig failed, using defaults:', err);
  }
  cached = { config: DEFAULT_PRICING_CONFIG, at: Date.now() };
  return DEFAULT_PRICING_CONFIG;
}

/**
 * Invalidate cache (e.g. after admin updates pricing).
 */
export function invalidatePricingCache(): void {
  cached = null;
}

/**
 * Save pricing config to Firestore. Admin only; call from authenticated API.
 */
export async function savePricingConfig(config: Partial<PricingConfig> & { updatedBy?: string }): Promise<void> {
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const { FieldValue } = await import('firebase-admin/firestore');
  const db = getAdminDb();
  const merged: PricingConfig = {
    ...DEFAULT_PRICING_CONFIG,
    ...config,
  };
  const validated = pricingConfigSchema.parse(merged);
  const docRef = db.collection('config').doc('pricing');
  const snap = await docRef.get();
  const currentVersion = (snap.data()?.version as number) ?? 0;
  await docRef.set({
    ...validated,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: config.updatedBy ?? 'admin',
    version: currentVersion + 1,
  }, { merge: true });
  invalidatePricingCache();
}
