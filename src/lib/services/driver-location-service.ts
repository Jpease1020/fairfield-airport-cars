// Driver Location Service
// Handles real-time GPS tracking for drivers with Firebase integration

import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  heading: number; // Direction in degrees (0-360)
  speed: number; // Speed in mph
  accuracy: number; // GPS accuracy in meters
  altitude?: number; // Altitude in meters
  batteryLevel?: number; // Device battery level (0-100)
  isMoving: boolean;
}

export interface DriverStatus {
  driverId: string;
  status: 'available' | 'busy' | 'offline' | 'en-route' | 'arrived';
  currentLocation?: DriverLocation;
  currentBookingId?: string;
  lastUpdated: Date;
  estimatedArrival?: Date;
}

export interface LocationUpdate {
  driverId: string;
  location: DriverLocation;
  bookingId?: string;
  status?: DriverStatus['status'];
}

class DriverLocationService {
  private activeSubscriptions: Map<string, () => void> = new Map();
  private locationUpdateCallbacks: Map<string, (location: DriverLocation) => void> = new Map();
  private statusUpdateCallbacks: Map<string, (status: DriverStatus) => void> = new Map();

  // Initialize real-time tracking for a driver
  async initializeDriverTracking(driverId: string): Promise<void> {
    try {
      console.log('🚗 Initializing driver tracking for:', driverId);
      
      // Set up real-time subscription to driver document
      const driverRef = doc(db, 'drivers', driverId);
      
      const unsubscribe = onSnapshot(driverRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.handleDriverUpdate(driverId, data);
        }
      }, (error) => {
        console.error('Driver tracking subscription error:', error);
      });

      this.activeSubscriptions.set(driverId, unsubscribe);
      
      console.log('✅ Driver tracking initialized for:', driverId);
    } catch (error) {
      console.error('❌ Error initializing driver tracking:', error);
      throw error;
    }
  }

  // Handle real-time driver updates
  private handleDriverUpdate(driverId: string, data: any): void {
    try {
      const driverStatus: DriverStatus = {
        driverId,
        status: data.status || 'offline',
        currentLocation: data.currentLocation ? {
          lat: data.currentLocation.lat,
          lng: data.currentLocation.lng,
          timestamp: data.currentLocation.timestamp?.toDate() || new Date(),
          heading: data.currentLocation.heading || 0,
          speed: data.currentLocation.speed || 0,
          accuracy: data.currentLocation.accuracy || 0,
          altitude: data.currentLocation.altitude,
          batteryLevel: data.currentLocation.batteryLevel,
          isMoving: data.currentLocation.speed > 0
        } : undefined,
        currentBookingId: data.currentBookingId,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        estimatedArrival: data.estimatedArrival?.toDate()
      };

      // Notify location update callbacks
      if (driverStatus.currentLocation) {
        const locationCallback = this.locationUpdateCallbacks.get(driverId);
        if (locationCallback) {
          locationCallback(driverStatus.currentLocation);
        }
      }

      // Notify status update callbacks
      const statusCallback = this.statusUpdateCallbacks.get(driverId);
      if (statusCallback) {
        statusCallback(driverStatus);
      }

      console.log('📍 Driver update received:', driverStatus);
    } catch (error) {
      console.error('Error handling driver update:', error);
    }
  }

  // Update driver location in real-time
  async updateDriverLocation(driverId: string, location: DriverLocation): Promise<void> {
    try {
      const driverRef = doc(db, 'drivers', driverId);
      
      await updateDoc(driverRef, {
        currentLocation: {
          lat: location.lat,
          lng: location.lng,
          timestamp: serverTimestamp(),
          heading: location.heading,
          speed: location.speed,
          accuracy: location.accuracy,
          altitude: location.altitude,
          batteryLevel: location.batteryLevel,
          isMoving: location.isMoving
        },
        lastUpdated: serverTimestamp()
      });

      console.log('📍 Driver location updated:', location);
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Update driver status
  async updateDriverStatus(driverId: string, status: DriverStatus['status'], bookingId?: string): Promise<void> {
    try {
      const driverRef = doc(db, 'drivers', driverId);
      
      const updateData: any = {
        status,
        lastUpdated: serverTimestamp()
      };

      if (bookingId) {
        updateData.currentBookingId = bookingId;
      }

      await updateDoc(driverRef, updateData);

      console.log('🔄 Driver status updated:', status);
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  // Get driver's current location
  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    try {
      const driverRef = doc(db, 'drivers', driverId);
      const driverDoc = await getDocs(query(collection(db, 'drivers'), where('id', '==', driverId), limit(1)));
      
      if (!driverDoc.empty) {
        const data = driverDoc.docs[0].data();
        if (data.currentLocation) {
          return {
            lat: data.currentLocation.lat,
            lng: data.currentLocation.lng,
            timestamp: data.currentLocation.timestamp?.toDate() || new Date(),
            heading: data.currentLocation.heading || 0,
            speed: data.currentLocation.speed || 0,
            accuracy: data.currentLocation.accuracy || 0,
            altitude: data.currentLocation.altitude,
            batteryLevel: data.currentLocation.batteryLevel,
            isMoving: data.currentLocation.speed > 0
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting driver location:', error);
      return null;
    }
  }

  // Get all available drivers near a location
  async getAvailableDriversNearLocation(
    latitude: number, 
    longitude: number, 
    radiusMiles: number = 10
  ): Promise<DriverStatus[]> {
    try {
      // TODO: Implement geospatial query with Firebase GeoFirestore
      // For now, get all available drivers
      const driversQuery = query(
        collection(db, 'drivers'),
        where('status', '==', 'available'),
        orderBy('lastUpdated', 'desc'),
        limit(20)
      );

      const driversSnapshot = await getDocs(driversQuery);
      const drivers: DriverStatus[] = [];

      driversSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.currentLocation) {
          // Calculate distance (simplified - should use proper geospatial query)
          const distance = this.calculateDistance(
            latitude, longitude,
            data.currentLocation.lat, data.currentLocation.lng
          );

          if (distance <= radiusMiles) {
            drivers.push({
              driverId: doc.id,
              status: data.status,
              currentLocation: {
                lat: data.currentLocation.lat,
                lng: data.currentLocation.lng,
                timestamp: data.currentLocation.timestamp?.toDate() || new Date(),
                heading: data.currentLocation.heading || 0,
                speed: data.currentLocation.speed || 0,
                accuracy: data.currentLocation.accuracy || 0,
                altitude: data.currentLocation.altitude,
                batteryLevel: data.currentLocation.batteryLevel,
                isMoving: data.currentLocation.speed > 0
              },
              currentBookingId: data.currentBookingId,
              lastUpdated: data.lastUpdated?.toDate() || new Date(),
              estimatedArrival: data.estimatedArrival?.toDate()
            });
          }
        }
      });

      return drivers;
    } catch (error) {
      console.error('Error getting available drivers:', error);
      return [];
    }
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Register callback for location updates
  onLocationUpdate(driverId: string, callback: (location: DriverLocation) => void): void {
    this.locationUpdateCallbacks.set(driverId, callback);
  }

  // Register callback for status updates
  onStatusUpdate(driverId: string, callback: (status: DriverStatus) => void): void {
    this.statusUpdateCallbacks.set(driverId, callback);
  }

  // Stop tracking for a driver
  stopDriverTracking(driverId: string): void {
    const unsubscribe = this.activeSubscriptions.get(driverId);
    if (unsubscribe) {
      unsubscribe();
      this.activeSubscriptions.delete(driverId);
    }
    
    this.locationUpdateCallbacks.delete(driverId);
    this.statusUpdateCallbacks.delete(driverId);
    
    console.log('🛑 Driver tracking stopped for:', driverId);
  }

  // Get all active driver tracking subscriptions
  getActiveDriverSubscriptions(): string[] {
    return Array.from(this.activeSubscriptions.keys());
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.activeSubscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeSubscriptions.clear();
    this.locationUpdateCallbacks.clear();
    this.statusUpdateCallbacks.clear();
    
    console.log('🧹 All driver tracking subscriptions cleaned up');
  }
}

export const driverLocationService = new DriverLocationService(); 