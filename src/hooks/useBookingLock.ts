import { useState, useCallback } from 'react';

interface BookingLockHook {
  isChecking: boolean;
  isLocked: boolean;
  lockTimeSlot: (timeSlot: string) => Promise<boolean>;
  releaseTimeSlot: (timeSlot: string) => Promise<void>;
  checkTimeSlot: (timeSlot: string) => Promise<boolean>;
}

export const useBookingLock = (): BookingLockHook => {
  const [isChecking, setIsChecking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const lockTimeSlot = useCallback(async (timeSlot: string): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      const response = await fetch('/api/booking/lock-time-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlot })
      });

      if (response.ok) {
        const result = await response.json();
        setIsLocked(result.success);
        return result.success;
      }
      
      return false;
    } catch (error) {
      console.error('Error locking time slot:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const releaseTimeSlot = useCallback(async (timeSlot: string): Promise<void> => {
    try {
      await fetch('/api/booking/release-time-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlot })
      });
      
      setIsLocked(false);
    } catch (error) {
      console.error('Error releasing time slot:', error);
    }
  }, []);

  const checkTimeSlot = useCallback(async (timeSlot: string): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      const response = await fetch(`/api/booking/check-time-slot?timeSlot=${encodeURIComponent(timeSlot)}`);
      
      if (response.ok) {
        const result = await response.json();
        return !result.isLocked;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking time slot:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isChecking,
    isLocked,
    lockTimeSlot,
    releaseTimeSlot,
    checkTimeSlot
  };
};
