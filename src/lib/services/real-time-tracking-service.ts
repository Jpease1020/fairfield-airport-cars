import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { driverProfileService } from './driver-profile-service';

export interface TrackingData {
  bookingId: string;
  driverId: string;
  driverName: string;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading: number;
    speed: number;
  };
  estimatedArrival?: Date;
  status: 'confirmed' | 'driver-assigned' | 'en-route' | 'arrived' | 'completed';
  statusMessage: string;
  lastUpdated: Date;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoffLocation: {
    address: string;
    lat: number;
    lng: number;
  };
}

export interface ETACalculation {
  estimatedMinutes: number;
  estimatedArrival: Date;
  trafficConditions: 'clear' | 'moderate' | 'heavy';
  distance: number; // in miles
  currentSpeed: number; // in mph
}

class RealTimeTrackingService {
  private trackingSubscriptions = new Map<string, () => void>();
  private locationWatchers = new Map<string, number>();

  // Subscribe to real-time tracking updates
  subscribeToTracking(bookingId: string, callback: (data: TrackingData) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'bookings', bookingId),
      (doc) => {
        if (doc.exists()) {
          const bookingData = doc.data();
          const trackingData: TrackingData = {
            bookingId,
            driverId: bookingData.driverId || '',
            driverName: bookingData.driverName || '',
            driverLocation: bookingData.driverLocation,
            estimatedArrival: bookingData.estimatedArrival?.toDate(),
            status: bookingData.status,
            statusMessage: this.getStatusMessage(bookingData.status),
            lastUpdated: bookingData.updatedAt?.toDate() || new Date(),
            pickupLocation: bookingData.pickupLocation,
            dropoffLocation: bookingData.dropoffLocation,
          };
          callback(trackingData);
        }
      },
      (error) => {
        console.error('Error subscribing to tracking updates:', error);
      }
    );

    this.trackingSubscriptions.set(bookingId, unsubscribe);
    return unsubscribe;
  }

  // Start location tracking for driver
  async startDriverLocationTracking(driverId: string): Promise<void> {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      throw new Error('Geolocation not supported');
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const heading = position.coords.heading || 0;
        const speed = position.coords.speed || 0;

        try {
          await updateDoc(doc(db, 'drivers', driverId), {
            currentLocation: {
              lat,
              lng,
              timestamp: new Date(),
              heading,
              speed: speed * 2.237, // Convert m/s to mph
            },
            lastUpdated: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error updating driver location:', error);
        }
      },
      (error) => {
        console.error('Error getting driver location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    this.locationWatchers.set(driverId, watchId);
  }

  // Stop location tracking for driver
  stopDriverLocationTracking(driverId: string): void {
    const watchId = this.locationWatchers.get(driverId);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      this.locationWatchers.delete(driverId);
    }
  }

  // Calculate ETA based on current location and destination
  async calculateETA(
    currentLocation: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<ETACalculation> {
    try {
      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(currentLocation, destination);
      
      // Get current traffic conditions (simplified - in production, use Google Maps API)
      const trafficConditions = await this.getTrafficConditions(currentLocation, destination);
      
      // Calculate average speed based on traffic
      const averageSpeed = this.getAverageSpeed(trafficConditions);
      
      // Calculate estimated time in minutes
      const estimatedMinutes = Math.round((distance / averageSpeed) * 60);
      
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + estimatedMinutes);

      return {
        estimatedMinutes,
        estimatedArrival,
        trafficConditions,
        distance,
        currentSpeed: averageSpeed,
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      // Fallback calculation
      const distance = this.calculateDistance(currentLocation, destination);
      const estimatedMinutes = Math.round(distance * 2); // Rough estimate: 2 min per mile
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + estimatedMinutes);

      return {
        estimatedMinutes,
        estimatedArrival,
        trafficConditions: 'moderate',
        distance,
        currentSpeed: 30,
      };
    }
  }

  // Update booking status with ETA
  async updateBookingStatus(
    bookingId: string,
    status: TrackingData['status'],
    driverLocation?: { lat: number; lng: number }
  ): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const bookingData = bookingDoc.data();
      let estimatedArrival: Date | undefined;

      // Calculate ETA if driver is en route and we have location data
      if (status === 'en-route' && driverLocation && bookingData.pickupLocation) {
        const eta = await this.calculateETA(driverLocation, bookingData.pickupLocation);
        estimatedArrival = eta.estimatedArrival;
      }

      await updateDoc(bookingRef, {
        status,
        estimatedArrival: estimatedArrival ? serverTimestamp() : undefined,
        updatedAt: serverTimestamp(),
        ...(driverLocation && {
          driverLocation: {
            ...driverLocation,
            timestamp: new Date(),
          },
        }),
      });

      // Send push notification for status change
      await this.sendStatusNotification(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Send push notification for status changes
  private async sendStatusNotification(bookingId: string, status: TrackingData['status']): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send-status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  }

  // Get traffic conditions (simplified - in production, use Google Maps API)
  private async getTrafficConditions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<'clear' | 'moderate' | 'heavy'> {
    // Simplified traffic detection based on time of day
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 7 && hour <= 9) return 'heavy'; // Morning rush
    if (hour >= 16 && hour <= 18) return 'heavy'; // Evening rush
    if (hour >= 10 && hour <= 15) return 'moderate'; // Midday
    return 'clear'; // Night/early morning
  }

  // Get average speed based on traffic conditions
  private getAverageSpeed(trafficConditions: string): number {
    switch (trafficConditions) {
      case 'clear': return 45; // mph
      case 'moderate': return 30; // mph
      case 'heavy': return 15; // mph
      default: return 30; // mph
    }
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get status message for display
  private getStatusMessage(status: TrackingData['status']): string {
    switch (status) {
      case 'confirmed':
        return 'Your booking has been confirmed. Driver will be assigned shortly.';
      case 'driver-assigned':
        return 'Your driver has been assigned and is preparing for pickup.';
      case 'en-route':
        return 'Your driver is on the way to your location.';
      case 'arrived':
        return 'Your driver has arrived at your pickup location.';
      case 'completed':
        return 'Your ride has been completed. Thank you for choosing our service!';
      default:
        return 'Processing your booking...';
    }
  }

  // Cleanup subscriptions
  cleanup(): void {
    this.trackingSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.trackingSubscriptions.clear();
    
    this.locationWatchers.forEach((watchId) => {
      navigator.geolocation.clearWatch(watchId);
    });
    this.locationWatchers.clear();
  }
}

export const realTimeTrackingService = new RealTimeTrackingService(); 