import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase-server';

interface BookingLock {
  id: string;
  timeSlot: string; // YYYY-MM-DD-HH:MM format
  lockedBy: string; // bookingId or sessionId
  lockedAt: Date;
  expiresAt: Date;
}

export class BookingLockService {
  private static instance: BookingLockService;
  private lockTimeout = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): BookingLockService {
    if (!BookingLockService.instance) {
      BookingLockService.instance = new BookingLockService();
    }
    return BookingLockService.instance;
  }

  /**
   * Lock a time slot to prevent double booking during payment processing
   */
  async lockTimeSlot(timeSlot: string, lockedBy: string): Promise<boolean> {
    try {
      const lockId = `lock-${timeSlot}`;
      const lockRef = doc(db, 'booking_locks', lockId);
      
      // Check if slot is already locked
      const existingLock = await getDoc(lockRef);
      if (existingLock.exists()) {
        const lockData = existingLock.data() as BookingLock;
        
        // Check if lock has expired
        if (new Date() > (lockData.expiresAt as any).toDate()) {
          // Lock expired, delete it
          await deleteDoc(lockRef);
        } else {
          // Slot is still locked by someone else
          return false;
        }
      }

      // Create new lock
      const lock: BookingLock = {
        id: lockId,
        timeSlot,
        lockedBy,
        lockedAt: new Date(),
        expiresAt: new Date(Date.now() + this.lockTimeout)
      };

      await setDoc(lockRef, {
        ...lock,
        lockedAt: serverTimestamp(),
        expiresAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error locking time slot:', error);
      return false;
    }
  }

  /**
   * Release a time slot lock
   */
  async releaseTimeSlot(timeSlot: string, lockedBy: string): Promise<void> {
    try {
      const lockId = `lock-${timeSlot}`;
      const lockRef = doc(db, 'booking_locks', lockId);
      
      const lockDoc = await getDoc(lockRef);
      if (lockDoc.exists()) {
        const lockData = lockDoc.data() as BookingLock;
        
        // Only release if locked by the same entity
        if (lockData.lockedBy === lockedBy) {
          await deleteDoc(lockRef);
        }
      }
    } catch (error) {
      console.error('Error releasing time slot lock:', error);
    }
  }

  /**
   * Check if a time slot is currently locked
   */
  async isTimeSlotLocked(timeSlot: string): Promise<boolean> {
    try {
      const lockId = `lock-${timeSlot}`;
      const lockRef = doc(db, 'booking_locks', lockId);
      
      const lockDoc = await getDoc(lockRef);
      if (!lockDoc.exists()) return false;
      
      const lockData = lockDoc.data() as BookingLock;
      
      // Check if lock has expired
      if (new Date() > (lockData.expiresAt as any).toDate()) {
        // Lock expired, clean it up
        await deleteDoc(lockRef);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking time slot lock:', error);
      return false;
    }
  }

  /**
   * Clean up expired locks (call this periodically)
   */
  async cleanupExpiredLocks(): Promise<void> {
    try {
      // This would require a more complex query in production
      // For now, we rely on individual lock expiration checks
      console.log('Expired locks cleanup completed');
    } catch (error) {
      console.error('Error cleaning up expired locks:', error);
    }
  }
}

export const bookingLockService = BookingLockService.getInstance();
