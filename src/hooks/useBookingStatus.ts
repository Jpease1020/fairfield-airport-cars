import { useState, useEffect, useCallback } from 'react';
import { getBooking, updateBookingStatus } from '@/lib/services/booking-service';

export interface BookingStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  driverId?: string;
  driverName?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  lastUpdated: Date;
}

export const useBookingStatus = (bookingId: string) => {
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection for real-time updates
  const initializeWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/bookings/${bookingId}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected for booking status updates');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'status_update') {
          setStatus(prev => ({
            ...prev,
            ...data.status,
            lastUpdated: new Date(),
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        initializeWebSocket();
      }, 5000);
    };
    
    setWsConnection(ws);
    
    return ws;
  }, [bookingId]);

  // Load initial booking status
  const loadBookingStatus = useCallback(async () => {
    try {
      setLoading(true);
      const booking = await getBooking(bookingId);
      
      if (booking) {
        setStatus({
          id: booking.id!,
          status: booking.status,
          driverId: booking.driverId,
          driverName: booking.driverName,
          estimatedArrival: booking.estimatedArrival,
          actualArrival: booking.actualArrival,
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

  // Update booking status
  const updateStatus = useCallback(async (newStatus: BookingStatus['status'], driverId?: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus, driverId);
      
      // Update local state
      setStatus(prev => prev ? {
        ...prev,
        status: newStatus,
        driverId: driverId || prev.driverId,
        lastUpdated: new Date(),
      } : null);
      
      // Send update via WebSocket if available
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'status_update',
          bookingId,
          status: newStatus,
          driverId,
        }));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  }, [bookingId, wsConnection]);

  // Initialize on mount
  useEffect(() => {
    loadBookingStatus();
    const ws = initializeWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [bookingId, loadBookingStatus, initializeWebSocket]);

  // Polling fallback for when WebSocket is not available
  useEffect(() => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      const interval = setInterval(() => {
        loadBookingStatus();
      }, 30000); // Poll every 30 seconds as fallback
      
      return () => clearInterval(interval);
    }
  }, [wsConnection, loadBookingStatus]);

  return {
    status,
    loading,
    error,
    updateStatus,
    refresh: loadBookingStatus,
  };
};

// Hook for driver availability
export const useDriverAvailability = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drivers/availability');
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
    
    // Poll for driver updates every 30 seconds
    const interval = setInterval(loadDrivers, 30000);
    
    return () => clearInterval(interval);
  }, [loadDrivers]);

  return { drivers, loading, refresh: loadDrivers };
};

// Hook for estimated arrival time
export const useEstimatedArrival = (bookingId: string) => {
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEstimatedArrival = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}/eta`);
      const data = await response.json();
      
      if (data.estimatedArrival) {
        setEstimatedArrival(new Date(data.estimatedArrival));
      }
    } catch (error) {
      console.error('Error loading estimated arrival:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadEstimatedArrival();
    
    // Update ETA every minute
    const interval = setInterval(loadEstimatedArrival, 60000);
    
    return () => clearInterval(interval);
  }, [loadEstimatedArrival]);

  return { estimatedArrival, loading, refresh: loadEstimatedArrival };
}; 