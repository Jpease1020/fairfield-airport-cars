// Real-Time Tracking Hook
// Provides real-time tracking functionality for React components

import { useState, useEffect, useCallback, useRef } from 'react';
import { getBooking } from '@/lib/services/booking-service';

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  heading?: number;
  speed?: number;
}

interface BookingStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  driverId?: string;
  driverName?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  driverLocation?: DriverLocation;
  lastUpdated: Date;
}

interface RealTimeUpdate {
  type: 'status_update' | 'location_update' | 'eta_update' | 'driver_assigned';
  data: any;
  timestamp: Date;
}

interface RealTimeTrackingData {
  booking: BookingStatus;
  updates: RealTimeUpdate[];
  lastUpdate: string;
}

export const useRealTimeTracking = (bookingId: string) => {
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial booking status
  const loadBookingStatus = useCallback(async () => {
    try {
      setLoading(true);
      const booking = await getBooking(bookingId);
      
      if (booking) {
        setBookingStatus({
          id: booking.id!,
          status: booking.status,
          driverId: booking.driverId,
          driverName: booking.driverName,
          estimatedArrival: booking.estimatedArrival,
          actualArrival: booking.actualArrival,
          driverLocation: booking.driverLocation,
          lastUpdated: booking.updatedAt,
        });
      } else {
        setError('Booking not found');
      }
    } catch (error) {
      console.error('Error loading booking status:', error);
      setError('Failed to load booking status');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  // Poll for real-time updates
  const pollForUpdates = useCallback(async () => {
    if (!bookingId) return;

    try {
      const url = new URL(`/api/ws/bookings/${bookingId}`, window.location.origin);
      if (lastUpdate) {
        url.searchParams.set('lastUpdate', lastUpdate);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RealTimeTrackingData = await response.json();
      
      // Update booking status
      if (data.booking) {
        setBookingStatus(data.booking);
      }

      // Process updates
      if (data.updates && data.updates.length > 0) {
        console.log('Real-time updates received:', data.updates);
        
        // Handle each update
        data.updates.forEach(update => {
          switch (update.type) {
            case 'status_update':
              setBookingStatus(prev => prev ? {
                ...prev,
                status: update.data.status,
                lastUpdated: update.data.lastUpdated,
              } : null);
              break;
              
            case 'location_update':
              setBookingStatus(prev => prev ? {
                ...prev,
                driverLocation: update.data.location,
                estimatedArrival: update.data.estimatedArrival,
                lastUpdated: update.data.lastUpdated,
              } : null);
              break;
              
            case 'eta_update':
              setBookingStatus(prev => prev ? {
                ...prev,
                estimatedArrival: update.data.estimatedArrival,
                lastUpdated: update.data.lastUpdated,
              } : null);
              break;
              
            case 'driver_assigned':
              setBookingStatus(prev => prev ? {
                ...prev,
                driverId: update.data.driverId,
                driverName: update.data.driverName,
                status: update.data.status,
                lastUpdated: update.data.lastUpdated,
              } : null);
              break;
          }
        });
      }

      // Update last update timestamp
      if (data.lastUpdate) {
        setLastUpdate(data.lastUpdate);
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
      // Don't set error for polling failures, just log them
    }
  }, [bookingId, lastUpdate]);

  // Send real-time update
  const sendUpdate = useCallback(async (type: string, data: any) => {
    if (!bookingId) return;

    try {
      const response = await fetch(`/api/ws/bookings/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Trigger immediate poll for updates
      await pollForUpdates();
    } catch (error) {
      console.error('Error sending update:', error);
      setError('Failed to send update');
    }
  }, [bookingId, pollForUpdates]);

  // Update booking status
  const updateStatus = useCallback(async (newStatus: BookingStatus['status']) => {
    await sendUpdate('status_update', { status: newStatus });
  }, [sendUpdate]);

  // Update driver location
  const updateDriverLocation = useCallback(async (location: DriverLocation, estimatedArrival?: Date) => {
    await sendUpdate('location_update', { location, estimatedArrival });
  }, [sendUpdate]);

  // Update ETA
  const updateETA = useCallback(async (estimatedArrival: Date) => {
    await sendUpdate('eta_update', { estimatedArrival });
  }, [sendUpdate]);

  // Assign driver
  const assignDriver = useCallback(async (driverId: string, driverName: string) => {
    await sendUpdate('driver_assigned', { driverId, driverName });
  }, [sendUpdate]);

  // Initialize on mount
  useEffect(() => {
    loadBookingStatus();
  }, [loadBookingStatus]);

  // Start polling for updates
  useEffect(() => {
    // Initial poll after 2 seconds
    const initialPoll = setTimeout(() => {
      pollForUpdates();
    }, 2000);

    // Set up polling interval (every 5 seconds)
    pollingIntervalRef.current = setInterval(() => {
      pollForUpdates();
    }, 5000);

    return () => {
      clearTimeout(initialPoll);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [pollForUpdates]);

  // Stop polling when booking is completed or cancelled
  useEffect(() => {
    if (bookingStatus?.status === 'completed' || bookingStatus?.status === 'cancelled') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [bookingStatus?.status]);

  return {
    bookingStatus,
    loading,
    error,
    updateStatus,
    updateDriverLocation,
    updateETA,
    assignDriver,
    lastUpdate,
  };
}; 