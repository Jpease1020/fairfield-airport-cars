// src/hooks/useGoogleCalendar.ts
import { useState, useCallback, useEffect } from 'react';

const CALENDAR_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR === 'true';
const CALENDAR_DISABLED_MESSAGE =
  'Google Calendar integration is currently disabled for this environment.';

interface CalendarTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
  reason?: string;
}

interface BookingData {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  customerEmail: string;
  customerName: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [tokens, setTokens] = useState<CalendarTokens | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CALENDAR_ENABLED) {
      setError(CALENDAR_DISABLED_MESSAGE);
    }
  }, []);

  const ensureEnabled = () => {
    if (!CALENDAR_ENABLED) {
      setError(CALENDAR_DISABLED_MESSAGE);
      throw new Error(CALENDAR_DISABLED_MESSAGE);
    }
  };

  // Get authorization URL
  const getAuthUrl = useCallback(async () => {
    ensureEnabled();

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/auth');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL');
      }
      
      return data.authUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete authorization with code
  const completeAuth = useCallback(async (code: string) => {
    ensureEnabled();

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/calendar/callback?code=${code}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete authorization');
      }
      
      setTokens(data.tokens);
      setIsConnected(true);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check availability for specific time slot
  const checkAvailability = useCallback(async (
    startTime: Date,
    endTime: Date,
    bufferMinutes: number = 60
  ): Promise<AvailabilitySlot[]> => {
    ensureEnabled();

    if (!tokens) {
      throw new Error('Calendar not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          bufferMinutes,
          tokens,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check availability');
      }
      
      return data.availability;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  // Get available slots for a date
  const getAvailableSlots = useCallback(async (
    date: Date,
    durationMinutes: number = 60,
    bufferMinutes: number = 60
  ): Promise<AvailabilitySlot[]> => {
    ensureEnabled();

    if (!tokens) {
      throw new Error('Calendar not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          durationMinutes,
          bufferMinutes,
          tokens,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get available slots');
      }
      
      return data.availability;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  // Create booking event
  const createBookingEvent = useCallback(async (bookingData: BookingData) => {
    ensureEnabled();

    if (!tokens) {
      throw new Error('Calendar not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          bookingData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create calendar event');
      }
      
      return data.event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  // Update booking event
  const updateBookingEvent = useCallback(async (
    eventId: string,
    updates: Partial<BookingData>
  ) => {
    ensureEnabled();

    if (!tokens) {
      throw new Error('Calendar not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          eventId,
          updates,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update calendar event');
      }
      
      return data.event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  // Delete booking event
  const deleteBookingEvent = useCallback(async (eventId: string) => {
    ensureEnabled();

    if (!tokens) {
      throw new Error('Calendar not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          eventId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete calendar event');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  // Disconnect calendar
  const disconnect = useCallback(() => {
    setTokens(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    isAvailable: CALENDAR_ENABLED,
    isConnected,
    tokens,
    loading,
    error,
    getAuthUrl,
    completeAuth,
    checkAvailability,
    getAvailableSlots,
    createBookingEvent,
    updateBookingEvent,
    deleteBookingEvent,
    disconnect,
  };
};
