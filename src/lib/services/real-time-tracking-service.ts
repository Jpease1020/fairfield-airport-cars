// Real-Time Tracking Service
// Handles driver location tracking, customer updates, and WebSocket management

import { db } from '@/lib/utils/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: Date;
  accuracy?: number;
}

export interface TrackingData {
  bookingId: string;
  status: 'confirmed' | 'driver-assigned' | 'en-route' | 'arrived' | 'completed';
  driverId?: string;
  driverName?: string;
  driverLocation?: DriverLocation;
  estimatedArrival?: Date;
  actualArrival?: Date;
  lastUpdated: Date;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface TrackingUpdate {
  type: 'location_update' | 'status_update' | 'eta_update';
  bookingId: string;
  data: Partial<TrackingData>;
  timestamp: Date;
}

class RealTimeTrackingService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private locationWatchers: Map<string, number> = new Map();
  private trackingSubscribers: Map<string, Set<(data: TrackingData) => void>> = new Map();

  // Initialize real-time tracking for a booking
  async initializeTracking(bookingId: string): Promise<void> {
    try {
      // Set up Firestore listener for real-time updates
      const bookingRef = doc(db, 'bookings', bookingId);
      
      const unsubscribe = onSnapshot(bookingRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const trackingData: TrackingData = {
            bookingId,
            status: data.status,
            driverId: data.driverId,
            driverName: data.driverName,
            driverLocation: data.driverLocation,
            estimatedArrival: data.estimatedArrival?.toDate(),
            actualArrival: data.actualArrival?.toDate(),
            lastUpdated: data.updatedAt?.toDate() || new Date(),
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
          };

          // Notify all subscribers
          this.notifySubscribers(bookingId, trackingData);
        }
      });

      // Store the unsubscribe function
      this.trackingSubscribers.set(bookingId, new Set());
      
      console.log(`Real-time tracking initialized for booking: ${bookingId}`);
    } catch (error) {
      console.error('Error initializing tracking:', error);
      throw error;
    }
  }

  // Subscribe to tracking updates
  subscribeToTracking(bookingId: string, callback: (data: TrackingData) => void): () => void {
    if (!this.trackingSubscribers.has(bookingId)) {
      this.trackingSubscribers.set(bookingId, new Set());
    }

    const subscribers = this.trackingSubscribers.get(bookingId)!;
    subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.trackingSubscribers.delete(bookingId);
      }
    };
  }

  // Notify all subscribers of tracking updates
  private notifySubscribers(bookingId: string, data: TrackingData): void {
    const subscribers = this.trackingSubscribers.get(bookingId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in tracking subscriber callback:', error);
        }
      });
    }
  }

  // Update driver location (called by driver app)
  async updateDriverLocation(bookingId: string, location: DriverLocation): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingRef, {
        driverLocation: {
          lat: location.lat,
          lng: location.lng,
          heading: location.heading,
          speed: location.speed,
          timestamp: serverTimestamp(),
          accuracy: location.accuracy,
        },
        updatedAt: serverTimestamp(),
      });

      console.log(`Driver location updated for booking: ${bookingId}`);
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: TrackingData['status'], driverId?: string): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (driverId) {
        updateData.driverId = driverId;
      }

      if (status === 'en-route') {
        updateData.estimatedArrival = this.calculateEstimatedArrival();
      } else if (status === 'arrived') {
        updateData.actualArrival = serverTimestamp();
      }

      await updateDoc(bookingRef, updateData);

      console.log(`Booking status updated: ${bookingId} -> ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Calculate estimated arrival time
  private calculateEstimatedArrival(): Date {
    // TODO: Implement real ETA calculation based on distance, traffic, etc.
    const now = new Date();
    return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
  }

  // Start driver location tracking (for driver app)
  startDriverLocationTracking(bookingId: string): void {
    if (this.locationWatchers.has(bookingId)) {
      console.log(`Location tracking already active for booking: ${bookingId}`);
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.error('Geolocation not available');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: DriverLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0,
          timestamp: new Date(),
          accuracy: position.coords.accuracy,
        };

        this.updateDriverLocation(bookingId, location);
      },
      (error) => {
        console.error('Error getting driver location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    this.locationWatchers.set(bookingId, watchId);
    console.log(`Driver location tracking started for booking: ${bookingId}`);
  }

  // Stop driver location tracking
  stopDriverLocationTracking(bookingId: string): void {
    const watchId = this.locationWatchers.get(bookingId);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      this.locationWatchers.delete(bookingId);
      console.log(`Driver location tracking stopped for booking: ${bookingId}`);
    }
  }

  // Initialize WebSocket connection for real-time updates
  initializeWebSocket(bookingId: string): WebSocket | null {
    if (typeof window === 'undefined') return null;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/bookings/${bookingId}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for booking: ${bookingId}`);
    };
    
    ws.onmessage = (event) => {
      try {
        const update: TrackingUpdate = JSON.parse(event.data);
        console.log('Received tracking update:', update);
        
        // Handle different update types
        switch (update.type) {
          case 'location_update':
            this.handleLocationUpdate(bookingId, update.data);
            break;
          case 'status_update':
            this.handleStatusUpdate(bookingId, update.data);
            break;
          case 'eta_update':
            this.handleETAUpdate(bookingId, update.data);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket disconnected for booking: ${bookingId}`);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.initializeWebSocket(bookingId);
      }, 5000);
    };
    
    this.wsConnections.set(bookingId, ws);
    return ws;
  }

  // Handle location updates from WebSocket
  private handleLocationUpdate(bookingId: string, data: Partial<TrackingData>): void {
    const subscribers = this.trackingSubscribers.get(bookingId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          // Update with new location data
          callback({
            bookingId,
            status: data.status || 'en-route',
            driverLocation: data.driverLocation,
            estimatedArrival: data.estimatedArrival,
            lastUpdated: new Date(),
            pickupLocation: data.pickupLocation || '',
            dropoffLocation: data.dropoffLocation || '',
          });
        } catch (error) {
          console.error('Error in location update callback:', error);
        }
      });
    }
  }

  // Handle status updates from WebSocket
  private handleStatusUpdate(bookingId: string, data: Partial<TrackingData>): void {
    const subscribers = this.trackingSubscribers.get(bookingId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback({
            bookingId,
            status: data.status || 'confirmed',
            driverId: data.driverId,
            driverName: data.driverName,
            estimatedArrival: data.estimatedArrival,
            actualArrival: data.actualArrival,
            lastUpdated: new Date(),
            pickupLocation: data.pickupLocation || '',
            dropoffLocation: data.dropoffLocation || '',
          });
        } catch (error) {
          console.error('Error in status update callback:', error);
        }
      });
    }
  }

  // Handle ETA updates from WebSocket
  private handleETAUpdate(bookingId: string, data: Partial<TrackingData>): void {
    const subscribers = this.trackingSubscribers.get(bookingId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback({
            bookingId,
            status: data.status || 'en-route',
            estimatedArrival: data.estimatedArrival,
            lastUpdated: new Date(),
            pickupLocation: data.pickupLocation || '',
            dropoffLocation: data.dropoffLocation || '',
          });
        } catch (error) {
          console.error('Error in ETA update callback:', error);
        }
      });
    }
  }

  // Clean up tracking resources
  cleanup(bookingId: string): void {
    // Stop location tracking
    this.stopDriverLocationTracking(bookingId);
    
    // Close WebSocket connection
    const ws = this.wsConnections.get(bookingId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(bookingId);
    }
    
    // Clear subscribers
    this.trackingSubscribers.delete(bookingId);
    
    console.log(`Tracking cleanup completed for booking: ${bookingId}`);
  }
}

// Export singleton instance
export const realTimeTrackingService = new RealTimeTrackingService(); 