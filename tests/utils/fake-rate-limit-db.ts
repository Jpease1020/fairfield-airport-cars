import { vi } from 'vitest';

/**
 * Minimal fake of the Firestore surface `src/lib/security/rate-limit.ts` uses
 * (collection().doc(), runTransaction, listDocuments), backed by an in-memory
 * Map so integration tests can exercise the real IP-throttling logic without
 * an emulator. Merge the returned `collection`/`runTransaction` into whatever
 * `getAdminDb()` mock a test already has for its own route-specific collections.
 */
export function createFakeRateLimitDb() {
  const store = new Map<string, { count: number; resetAt: number }>();

  const docRef = (id: string) => ({
    id,
    delete: async () => {
      store.delete(id);
    },
  });

  const rateLimitCollection = {
    doc: (id: string) => docRef(id),
    listDocuments: async () => Array.from(store.keys()).map((id) => docRef(id)),
  };

  const runTransaction = async (callback: (tx: {
    get: (ref: { id: string }) => Promise<{ exists: boolean; data: () => { count: number; resetAt: number } | undefined }>;
    set: (ref: { id: string }, data: { count: number; resetAt: number }) => void;
    update: (ref: { id: string }, data: Partial<{ count: number; resetAt: number }>) => void;
  }) => unknown) => {
    const tx = {
      get: async (ref: { id: string }) => {
        const data = store.get(ref.id);
        return { exists: !!data, data: () => data };
      },
      set: (ref: { id: string }, data: { count: number; resetAt: number }) => {
        store.set(ref.id, data);
      },
      update: (ref: { id: string }, data: Partial<{ count: number; resetAt: number }>) => {
        const existing = store.get(ref.id);
        if (existing) store.set(ref.id, { ...existing, ...data });
      },
    };
    return callback(tx);
  };

  return { store, rateLimitCollection, runTransaction };
}
