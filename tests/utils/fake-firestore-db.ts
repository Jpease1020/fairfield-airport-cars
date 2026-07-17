import { vi } from 'vitest';

/**
 * A minimal in-memory fake of the Firestore Admin SDK surface used by this app
 * (collection().doc(), direct get/set/delete, and db.runTransaction with
 * transaction.get/set/update/delete), for tests that need real multi-document
 * transactional behavior instead of one-shot mocked returns.
 */
export function createFakeFirestoreDb() {
  const store = new Map<string, Record<string, unknown>>();

  const key = (collectionName: string, id: string) => `${collectionName}/${id}`;

  const makeDocRef = (collectionName: string, id: string) => {
    const k = key(collectionName, id);
    return {
      id,
      collectionName,
      get: async () => {
        const data = store.get(k);
        return { exists: !!data, data: () => data, id };
      },
      set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
        const existing = store.get(k);
        store.set(k, options?.merge && existing ? { ...existing, ...data } : { ...data });
      },
      update: async (data: Record<string, unknown>) => {
        const existing = store.get(k);
        store.set(k, { ...(existing ?? {}), ...data });
      },
      delete: async () => {
        store.delete(k);
      },
    };
  };

  const collection = (collectionName: string) => ({
    doc: (id: string) => makeDocRef(collectionName, id),
  });

  const runTransaction = async (
    callback: (tx: {
      get: (ref: ReturnType<typeof makeDocRef>) => Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined; id: string }>;
      set: (ref: ReturnType<typeof makeDocRef>, data: Record<string, unknown>, options?: { merge?: boolean }) => void;
      update: (ref: ReturnType<typeof makeDocRef>, data: Record<string, unknown>) => void;
      delete: (ref: ReturnType<typeof makeDocRef>) => void;
    }) => unknown
  ) => {
    const tx = {
      get: async (ref: ReturnType<typeof makeDocRef>) => {
        const data = store.get(key(ref.collectionName, ref.id));
        return { exists: !!data, data: () => data, id: ref.id };
      },
      set: (ref: ReturnType<typeof makeDocRef>, data: Record<string, unknown>, options?: { merge?: boolean }) => {
        const k = key(ref.collectionName, ref.id);
        const existing = store.get(k);
        store.set(k, options?.merge && existing ? { ...existing, ...data } : { ...data });
      },
      update: (ref: ReturnType<typeof makeDocRef>, data: Record<string, unknown>) => {
        const k = key(ref.collectionName, ref.id);
        const existing = store.get(k);
        store.set(k, { ...(existing ?? {}), ...data });
      },
      delete: (ref: ReturnType<typeof makeDocRef>) => {
        store.delete(key(ref.collectionName, ref.id));
      },
    };
    return callback(tx);
  };

  return {
    store,
    seed: (collectionName: string, id: string, data: Record<string, unknown>) => {
      store.set(key(collectionName, id), data);
    },
    db: { collection: vi.fn(collection), runTransaction: vi.fn(runTransaction) },
  };
}
