import { db } from '@/lib/utils/firebase-server';
import { collection, addDoc, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

// Quote schema for validation
export const QuoteSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string().optional(), // For anonymous users
  userId: z.string().optional(), // For authenticated users
  pickupAddress: z.string().min(1),
  dropoffAddress: z.string().min(1),
  pickupCoords: z.object({ lat: z.number(), lng: z.number() }),
  dropoffCoords: z.object({ lat: z.number(), lng: z.number() }),
  estimatedMiles: z.number().min(0),
  estimatedMinutes: z.number().min(0),
  price: z.number().min(0),
  fareType: z.enum(['personal', 'business']),
  expiresAt: z.date(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Quote = z.infer<typeof QuoteSchema>;

// Create a new quote
export const createQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ quoteId: string }> => {
  try {
    const docRef = await addDoc(collection(db, 'quotes'), {
      ...quoteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { quoteId: docRef.id };
  } catch (error) {
    console.error('Error creating quote:', error);
    throw new Error('Failed to create quote');
  }
};

// Get a quote by ID
export const getQuote = async (quoteId: string): Promise<Quote | null> => {
  try {
    const docRef = doc(db, 'quotes', quoteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Quote;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting quote:', error);
    return null;
  }
};

// Check if quote is valid (not expired)
export const isQuoteValid = (quote: Quote): boolean => {
  return new Date() < quote.expiresAt;
};

// Update quote
export const updateQuote = async (quoteId: string, updates: Partial<Quote>): Promise<void> => {
  try {
    const docRef = doc(db, 'quotes', quoteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    throw new Error('Failed to update quote');
  }
};

// Delete quote
export const deleteQuote = async (quoteId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'quotes', quoteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw new Error('Failed to delete quote');
  }
};

// Get quotes by session ID (for anonymous users)
export const getQuotesBySession = async (sessionId: string): Promise<Quote[]> => {
  try {
    const q = query(
      collection(db, 'quotes'),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiresAt: doc.data().expiresAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Quote[];
  } catch (error) {
    console.error('Error getting quotes by session:', error);
    return [];
  }
};

// Get quotes by user ID (for authenticated users)
export const getQuotesByUser = async (userId: string): Promise<Quote[]> => {
  try {
    const q = query(
      collection(db, 'quotes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiresAt: doc.data().expiresAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Quote[];
  } catch (error) {
    console.error('Error getting quotes by user:', error);
    return [];
  }
};

// Clean up expired quotes (run periodically)
export const cleanupExpiredQuotes = async (): Promise<number> => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'quotes'),
      where('expiresAt', '<', now)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error cleaning up expired quotes:', error);
    return 0;
  }
};
