// Real-Time Tracking Hook
// Provides real-time tracking functionality for React components

import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeTrackingService, TrackingData, DriverLocation } from '@/lib/services/real-time-tracking-service';

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
  updateDriverLocation: (location: DriverLocation) => Promise<void>;
  updateBookingStatus: (status: TrackingData['status'], driverId?: string) => Promise<void>;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  cleanup: () => void;
}

export const useRealTimeTracking = ({
  bookingId,
  autoInitialize = true,
  enableLocationTracking = false,
  enableWebSocket = true,
}: UseRealTimeTrackingOptions): UseRealTimeTrackingReturn => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize tracking
  const initializeTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize the tracking service
      await realTimeTrackingService.initializeTracking(bookingId);

      // Subscribe to tracking updates
      const unsubscribe = realTimeTrackingService.subscribeToTracking(bookingId, (data) => {
        setTrackingData(data);
        setIsConnected(true);
        setLoading(false);
      });

      unsubscribeRef.current = unsubscribe;

      // Initialize WebSocket if enabled
      if (enableWebSocket) {
        wsRef.current = realTimeTrackingService.initializeWebSocket(bookingId);
      }

      console.log(`Real-time tracking initialized for booking: ${bookingId}`);
    } catch (err) {
      console.error('Error initializing tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize tracking');
      setLoading(false);
    }
  }, [bookingId, enableWebSocket]);

  // Update driver location
  const updateDriverLocation = useCallback(async (location: DriverLocation) => {
    try {
      await realTimeTrackingService.updateDriverLocation(bookingId, location);
    } catch (err) {
      console.error('Error updating driver location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update driver location');
    }
  }, [bookingId]);

  // Update booking status
  const updateBookingStatus = useCallback(async (status: TrackingData['status'], driverId?: string) => {
    try {
      await realTimeTrackingService.updateBookingStatus(bookingId, status, driverId);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  }, [bookingId]);

  // Start location tracking (for driver app)
  const startLocationTracking = useCallback(() => {
    if (enableLocationTracking) {
      realTimeTrackingService.startDriverLocationTracking(bookingId);
    }
  }, [bookingId, enableLocationTracking]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    realTimeTrackingService.stopDriverLocationTracking(bookingId);
  }, [bookingId]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Unsubscribe from tracking updates
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Cleanup tracking service
    realTimeTrackingService.cleanup(bookingId);

    setIsConnected(false);
    setTrackingData(null);
  }, [bookingId]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize) {
      initializeTracking();
    }

    // Cleanup on unmount
    return cleanup;
  }, [autoInitialize, initializeTracking, cleanup]);

  return {
    trackingData,
    loading,
    error,
    isConnected,
    initializeTracking,
    updateDriverLocation,
    updateBookingStatus,
    startLocationTracking,
    stopLocationTracking,
    cleanup,
  };
}; 