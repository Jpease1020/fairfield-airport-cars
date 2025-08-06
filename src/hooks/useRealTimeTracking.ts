// Real-Time Tracking Hook
// Provides real-time tracking functionality for React components

import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeTrackingService, TrackingData } from '@/lib/services/real-time-tracking-service';

export interface UseRealTimeTrackingOptions {
  bookingId: string;
  autoInitialize?: boolean;
  enableLocationTracking?: boolean;
  enableWebSocket?: boolean;
}

export interface UseRealTimeTrackingReturn {
  trackingData: TrackingData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  initializeTracking: () => Promise<void>;
  updateDriverLocation: (location: { lat: number; lng: number; heading?: number; speed?: number }) => Promise<void>;
  updateBookingStatus: (status: TrackingData['status']) => Promise<void>;
}

export function useRealTimeTracking(options: UseRealTimeTrackingOptions): UseRealTimeTrackingReturn {
  const { bookingId, autoInitialize = true } = options;
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize tracking
  const initializeTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await realTimeTrackingService.initializeTracking(bookingId);
      if (data) {
        setTrackingData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize tracking');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  // Update driver location
  const updateDriverLocation = useCallback(async (location: { lat: number; lng: number; heading?: number; speed?: number }) => {
    try {
      await realTimeTrackingService.updateDriverLocation(bookingId, location);
    } catch (err) {
      console.error('Error updating driver location:', err);
      throw err;
    }
  }, [bookingId]);

  // Update booking status
  const updateBookingStatus = useCallback(async (status: TrackingData['status']) => {
    try {
      await realTimeTrackingService.updateBookingStatus(bookingId, status);
    } catch (err) {
      console.error('Error updating booking status:', err);
      throw err;
    }
  }, [bookingId]);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && bookingId) {
      initializeTracking();
    }
  }, [autoInitialize, bookingId, initializeTracking]);

  // Poll for tracking data updates
  useEffect(() => {
    if (!bookingId) return;

    const pollInterval = setInterval(() => {
      const data = realTimeTrackingService.getTrackingData(bookingId);
      if (data) {
        setTrackingData(data);
        setIsConnected(true);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [bookingId]);

  return {
    trackingData,
    loading,
    error,
    isConnected,
    initializeTracking,
    updateDriverLocation,
    updateBookingStatus,
  };
} 