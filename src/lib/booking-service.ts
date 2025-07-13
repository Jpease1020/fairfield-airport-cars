import { db } from './firebase';
import { collection, addDoc, getDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { Booking } from '@/types/booking';

const bookingsCollection = collection(db, 'bookings');

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newBooking = {
    ...booking,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(bookingsCollection, newBooking);
  return docRef.id;
};

export const getBooking = async (id: string): Promise<Booking | null> => {
  const docRef = doc(db, 'bookings', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Booking;
  } else {
    return null;
  }
};

export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<void> => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date() });
};

export const deleteBooking = async (id: string): Promise<void> => {
  const docRef = doc(db, 'bookings', id);
  await deleteDoc(docRef);
};

export const listBookings = async (): Promise<Booking[]> => {
  const snapshot = await getDocs(bookingsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
};

export const isTimeSlotAvailable = async (pickupDate: Date, bufferMinutes = 60): Promise<boolean> => {
  const start = new Date(pickupDate.getTime() - bufferMinutes * 60 * 1000);
  const end = new Date(pickupDate.getTime() + bufferMinutes * 60 * 1000);

  const q = query(bookingsCollection,
    where('pickupDateTime', '>=', start),
    where('pickupDateTime', '<=', end),
    where('status', 'in', ['pending', 'confirmed']));

  const snap = await getDocs(q);
  return snap.empty;
};
