import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { PromoCode } from '@/types/promo';

const promoCol = collection(db, 'promoCodes');

export async function listPromoCodes(): Promise<PromoCode[]> {
  const snap = await getDocs(promoCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode));
}

export async function addPromoCode(code: PromoCode): Promise<string> {
  const docRef = await addDoc(promoCol, { ...code, createdAt: serverTimestamp(), usageCount: 0 });
  return docRef.id;
}

export async function deletePromo(id: string) {
  await deleteDoc(doc(db, 'promoCodes', id));
}

// Validate and increment usage atomically
export async function validateAndUsePromo(codeStr: string): Promise<PromoCode | null> {
  const qSnap = await getDocs(promoCol);
  const match = qSnap.docs.find(d => d.data().code === codeStr.toUpperCase());
  if(!match) return null;

  const ref = match.ref;
  return await runTransaction(db, async (t)=>{
    const snap = await t.get(ref);
    const data = snap.data() as PromoCode;
    const now = new Date();
    if(data.expiresAt && new Date(data.expiresAt) < now) return null;
    if(data.usageLimit && data.usageCount >= data.usageLimit) return null;
    t.update(ref, { usageCount: increment(1) });
    return { id: snap.id, ...data };
  });
} 