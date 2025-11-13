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
  pickupDateTime: z.date().optional(), // When the ride is scheduled
  expiresAt: z.date(), // When the quote expires
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Quote = z.infer<typeof QuoteSchema>;

// Create a new quote
export const createQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ quoteId: string }> => {
  try {
    // Use Admin SDK for server-side operations (when called from API routes)
    // Fall back to client SDK for client-side operations
    let adminDb: any = null;
    try {
      const { getAdminDb } = await import('@/lib/utils/firebase-admin');
      adminDb = getAdminDb();
    } catch {
      // Admin SDK not available (client-side), use client SDK
      adminDb = null;
    }

    // Remove undefined values - Firestore doesn't allow undefined fields
    const cleanData: Record<string, any> = {
      pickupAddress: quoteData.pickupAddress,
      dropoffAddress: quoteData.dropoffAddress,
      pickupCoords: quoteData.pickupCoords,
      dropoffCoords: quoteData.dropoffCoords,
      estimatedMiles: quoteData.estimatedMiles,
      estimatedMinutes: quoteData.estimatedMinutes,
      price: quoteData.price,
      fareType: quoteData.fareType,
      expiresAt: quoteData.expiresAt,
    };
    
    // Only include sessionId if it's defined
    if (quoteData.sessionId) {
      cleanData.sessionId = quoteData.sessionId;
    }
    
    // Only include userId if it's defined
    if (quoteData.userId) {
      cleanData.userId = quoteData.userId;
    }
    
    // Only include pickupDateTime if it's defined
    if (quoteData.pickupDateTime) {
      cleanData.pickupDateTime = quoteData.pickupDateTime;
    }

    let quoteId: string;
    
    if (adminDb) {
      // Use Admin SDK (server-side)
      const { FieldValue } = await import('firebase-admin/firestore');
      cleanData.createdAt = FieldValue.serverTimestamp();
      cleanData.updatedAt = FieldValue.serverTimestamp();
      const docRef = await adminDb.collection('quotes').add(cleanData);
      quoteId = docRef.id;
    } else {
      // Use client SDK (client-side)
      cleanData.createdAt = serverTimestamp();
      cleanData.updatedAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'quotes'), cleanData);
      quoteId = docRef.id;
    }
    
    return { quoteId };
  } catch (error) {
    console.error('Error creating quote:', error);
    throw new Error('Failed to create quote');
  }
};

// Get a quote by ID
export const getQuote = async (quoteId: string): Promise<Quote | null> => {
  try {
    // Use Admin SDK for server-side operations (when called from API routes)
    // Fall back to client SDK for client-side operations
    let adminDb: any = null;
    try {
      const { getAdminDb } = await import('@/lib/utils/firebase-admin');
      adminDb = getAdminDb();
    } catch {
      // Admin SDK not available (client-side), use client SDK
      adminDb = null;
    }

    let quoteData: any = null;
    let quoteId_final: string = quoteId;

    if (adminDb) {
      // Use Admin SDK (server-side)
      const docRef = adminDb.collection('quotes').doc(quoteId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        quoteData = docSnap.data();
        quoteId_final = docSnap.id;
      }
    } else {
      // Use client SDK (client-side)
      const docRef = doc(db, 'quotes', quoteId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        quoteData = docSnap.data();
        quoteId_final = docSnap.id;
      }
    }
    
    if (quoteData) {
      return {
        id: quoteId_final,
        ...quoteData,
        pickupDateTime: quoteData.pickupDateTime?.toDate ? quoteData.pickupDateTime.toDate() : (quoteData.pickupDateTime instanceof Date ? quoteData.pickupDateTime : (quoteData.pickupDateTime ? new Date(quoteData.pickupDateTime) : undefined)),
        expiresAt: quoteData.expiresAt?.toDate ? quoteData.expiresAt.toDate() : (quoteData.expiresAt instanceof Date ? quoteData.expiresAt : new Date(quoteData.expiresAt)),
        createdAt: quoteData.createdAt?.toDate ? quoteData.createdAt.toDate() : (quoteData.createdAt instanceof Date ? quoteData.createdAt : new Date(quoteData.createdAt)),
        updatedAt: quoteData.updatedAt?.toDate ? quoteData.updatedAt.toDate() : (quoteData.updatedAt instanceof Date ? quoteData.updatedAt : new Date(quoteData.updatedAt)),
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
