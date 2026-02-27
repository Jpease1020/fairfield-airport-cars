/**
 * Cost entries for admin cost tracking (manual-first).
 * Firestore: costEntries/* (one doc per row).
 */

import { costEntrySchema, type CostEntry } from '@/lib/business/cost-entries-schema';

export { costEntrySchema, type CostEntry } from '@/lib/business/cost-entries-schema';
export { COST_PROVIDERS, COST_CATEGORIES } from '@/lib/business/cost-entries-schema';

const COLLECTION = 'costEntries';

function serializeEntry(doc: { id: string; data: () => Record<string, unknown> }): CostEntry {
  const d = doc.data();
  if (!d) throw new Error('Missing doc data');
  const createdAt = d.createdAt as { toDate?: () => Date } | undefined;
  return {
    id: doc.id,
    month: d.month as string,
    provider: d.provider as CostEntry['provider'],
    category: d.category as CostEntry['category'],
    amount: Number(d.amount),
    notes: (d.notes as string) ?? undefined,
    invoiceUrl: (d.invoiceUrl as string) ?? undefined,
    createdAt: createdAt?.toDate?.() ?? (d.createdAt as Date | undefined),
    createdBy: d.createdBy as string | undefined,
  };
}

export async function getCostEntries(month?: string): Promise<CostEntry[]> {
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const db = getAdminDb();
  const coll = db.collection(COLLECTION);
  const snap = month
    ? await coll.where('month', '==', month).orderBy('createdAt', 'desc').limit(500).get()
    : await coll.orderBy('month', 'desc').orderBy('createdAt', 'desc').limit(500).get();
  return snap.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => serializeEntry(doc));
}

export async function addCostEntry(entry: Omit<CostEntry, 'id' | 'createdAt'>, createdBy?: string): Promise<CostEntry> {
  const parsed = costEntrySchema.omit({ id: true, createdAt: true }).parse({
    ...entry,
    invoiceUrl: entry.invoiceUrl || undefined,
  });
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const { FieldValue } = await import('firebase-admin/firestore');
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();
  const data = {
    month: parsed.month,
    provider: parsed.provider,
    category: parsed.category,
    amount: parsed.amount,
    notes: parsed.notes ?? null,
    invoiceUrl: parsed.invoiceUrl ?? null,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: createdBy ?? 'admin',
  };
  await ref.set(data);
  const snap = await ref.get();
  return serializeEntry(snap);
}

export async function deleteCostEntry(id: string): Promise<void> {
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).delete();
}
