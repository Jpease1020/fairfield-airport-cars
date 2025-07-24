import { db } from '@/lib/utils/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Booking } from '@/types/booking';



// Helper function to get the base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Helper function to create a fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/create-booking-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create booking');
    }

    if (!result.success) {
      throw new Error(result.error || 'Failed to create booking');
    }

    return result.bookingId;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBooking = async (id: string): Promise<Booking | null> => {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/get-bookings-simple?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(result.error || 'Failed to get booking');
    }

    if (!result.success) {
      throw new Error(result.error || 'Failed to get booking');
    }

    return result.booking as Booking;
  } catch (error) {
    console.error('Error getting booking:', error);
    throw error;
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
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/get-bookings-simple`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get bookings');
    }

    if (!result.success) {
      throw new Error(result.error || 'Failed to get bookings');
    }

    return result.bookings as Booking[];
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

export const isTimeSlotAvailable = async (pickupDate: Date, bufferMinutes = 60): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/check-time-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickupDateTime: pickupDate.toISOString(),
        bufferMinutes,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to check time slot');
    }

    if (!result.success) {
      throw new Error(result.error || 'Failed to check time slot');
    }

    return result.isAvailable;
  } catch (error) {
    console.error('Error checking time slot:', error);
    // If the API fails, assume the slot is available to avoid blocking bookings
    return true;
  }
};
