// Firebase-based Real-Time Tracking Service
// Provides real-time location tracking, ETA calculations, and traffic-aware routing

import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  heading: number;
  speed: number;
  accuracy?: number;
}

export interface TrackingData {
  bookingId: string;
  driverLocation?: DriverLocation;
  estimatedArrival?: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  trafficConditions: 'low' | 'medium' | 'high';
  distance: number; // in miles
  duration: number; // in minutes
  routePolyline?: string;
  lastUpdated: Date;
}

export interface ETACalculation {
  estimatedArrival: Date;
  duration: number; // in minutes
  distance: number; // in miles
  trafficConditions: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
}

class FirebaseTrackingService {
  private activeSubscriptions: Map<string, () => void> = new Map();
  private locationUpdateCallbacks: Map<string, (location: DriverLocation) => void> = new Map();
  private etaUpdateCallbacks: Map<string, (eta: ETACalculation) => void> = new Map();
  private googleMapsLoaded = false;

  // Initialize real-time tracking for a booking
  async initializeTracking(bookingId: string): Promise<void> {
    try {
      console.log('🚀 Initializing Firebase tracking for booking:', bookingId);
      
      // Load Google Maps API if not already loaded
      await this.loadGoogleMapsAPI();
      
      // Set up real-time subscription to booking document
      const bookingRef = doc(db, 'bookings', bookingId);
      
      const unsubscribe = onSnapshot(bookingRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.handleTrackingUpdate(bookingId, data);
        }
      }, (error) => {
        console.error('Firebase tracking subscription error:', error);
      });

      this.activeSubscriptions.set(bookingId, unsubscribe);
      
      console.log('✅ Firebase tracking initialized for booking:', bookingId);
    } catch (error) {
      console.error('❌ Error initializing Firebase tracking:', error);
      throw error;
    }
  }

  // Load Google Maps API
  private async loadGoogleMapsAPI(): Promise<void> {
    if (this.googleMapsLoaded || (window.google && window.google.maps)) {
      this.googleMapsLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.googleMapsLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  }

  // Handle real-time tracking updates
  private handleTrackingUpdate(bookingId: string, data: any): void {
    try {
      const trackingData: TrackingData = {
        bookingId,
        driverLocation: data.driverLocation ? {
          lat: data.driverLocation.lat,
          lng: data.driverLocation.lng,
          timestamp: data.driverLocation.timestamp?.toDate() || new Date(),
          heading: data.driverLocation.heading || 0,
          speed: data.driverLocation.speed || 0,
          accuracy: data.driverLocation.accuracy
        } : undefined,
        estimatedArrival: data.estimatedArrival?.toDate(),
        status: data.status,
        trafficConditions: data.trafficConditions || 'low',
        distance: data.distance || 0,
        duration: data.duration || 0,
        routePolyline: data.routePolyline,
        lastUpdated: data.updatedAt?.toDate() || new Date()
      };

      // Notify location update callbacks
      if (trackingData.driverLocation) {
        const locationCallback = this.locationUpdateCallbacks.get(bookingId);
        if (locationCallback) {
          locationCallback(trackingData.driverLocation);
        }
      }

      // Notify ETA update callbacks
      if (trackingData.estimatedArrival) {
        const etaCallback = this.etaUpdateCallbacks.get(bookingId);
        if (etaCallback) {
          const etaCalculation: ETACalculation = {
            estimatedArrival: trackingData.estimatedArrival,
            duration: trackingData.duration,
            distance: trackingData.distance,
            trafficConditions: trackingData.trafficConditions,
            confidence: this.calculateConfidence(trackingData)
          };
          etaCallback(etaCalculation);
        }
      }

      console.log('📍 Tracking update received:', trackingData);
    } catch (error) {
      console.error('Error handling tracking update:', error);
    }
  }

  // Update driver location in real-time
  async updateDriverLocation(bookingId: string, location: DriverLocation): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingRef, {
        driverLocation: {
          lat: location.lat,
          lng: location.lng,
          timestamp: serverTimestamp(),
          heading: location.heading,
          speed: location.speed,
          accuracy: location.accuracy
        },
        updatedAt: serverTimestamp()
      });

      console.log('📍 Driver location updated:', location);
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Calculate advanced ETA with traffic awareness
  async calculateAdvancedETA(
    bookingId: string,
    pickupLocation: string,
    dropoffLocation: string,
    currentLocation?: DriverLocation
  ): Promise<ETACalculation> {
    try {
      console.log('🕐 Calculating advanced ETA for booking:', bookingId);

      // Load Google Maps API if needed
      await this.loadGoogleMapsAPI();

      // Get current traffic conditions
      const trafficConditions = await this.getTrafficConditions(pickupLocation, dropoffLocation);
      
      // Calculate route with traffic
      const routeData = await this.calculateRouteWithTraffic(
        currentLocation || { lat: 0, lng: 0, timestamp: new Date(), heading: 0, speed: 0 },
        pickupLocation,
        dropoffLocation,
        trafficConditions
      );

      // Calculate ETA
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + routeData.duration);

      const etaCalculation: ETACalculation = {
        estimatedArrival,
        duration: routeData.duration,
        distance: routeData.distance,
        trafficConditions,
        confidence: this.calculateConfidence({
          trafficConditions,
          distance: routeData.distance,
          duration: routeData.duration
        } as TrackingData)
      };

      // Update booking with new ETA
      await this.updateETA(bookingId, etaCalculation);

      console.log('✅ Advanced ETA calculated:', etaCalculation);
      return etaCalculation;
    } catch (error) {
      console.error('Error calculating advanced ETA:', error);
      throw error;
    }
  }

  // Get traffic conditions for a route using Google Maps API
  private async getTrafficConditions(pickup: string, dropoff: string): Promise<'low' | 'medium' | 'high'> {
    try {
      if (!this.googleMapsLoaded || !window.google?.maps) {
        // Fallback to time-based approximation
        return this.getTimeBasedTrafficConditions();
      }

      // Use Google Maps Distance Matrix API for traffic conditions
      const service = new google.maps.DistanceMatrixService();
      
      const response = await service.getDistanceMatrix({
        origins: [pickup],
        destinations: [dropoff],
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      });

      if (response.rows[0]?.elements[0]?.duration_in_traffic) {
        const durationInTraffic = response.rows[0].elements[0].duration_in_traffic.value;
        const durationNoTraffic = response.rows[0].elements[0].duration.value;
        
        // Calculate traffic multiplier
        const trafficMultiplier = durationInTraffic / durationNoTraffic;
        
        if (trafficMultiplier > 1.5) return 'high';
        if (trafficMultiplier > 1.2) return 'medium';
        return 'low';
      }

      return this.getTimeBasedTrafficConditions();
    } catch (error) {
      console.error('Error getting traffic conditions:', error);
      return this.getTimeBasedTrafficConditions();
    }
  }

  // Fallback time-based traffic conditions
  private getTimeBasedTrafficConditions(): 'low' | 'medium' | 'high' {
    const now = new Date();
    const hour = now.getHours();
    
    // Peak hours: 7-9 AM and 4-7 PM
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
      return 'high';
    } else if ((hour >= 6 && hour <= 10) || (hour >= 15 && hour <= 20)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Calculate route with traffic awareness using Google Maps API
  private async calculateRouteWithTraffic(
    currentLocation: DriverLocation,
    pickup: string,
    dropoff: string,
    trafficConditions: 'low' | 'medium' | 'high'
  ): Promise<{ distance: number; duration: number; polyline: string }> {
    try {
      if (!this.googleMapsLoaded || !window.google?.maps) {
        // Fallback calculation
        return this.calculateFallbackRoute(pickup, dropoff, trafficConditions);
      }

      const directionsService = new google.maps.DirectionsService();
      
      const response = await directionsService.route({
        origin: pickup,
        destination: dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      });

      if (response.routes.length > 0) {
        const route = response.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: (leg.distance?.value || 0) / 1609.34, // Convert meters to miles
          duration: Math.round((leg.duration_in_traffic?.value || leg.duration?.value || 0) / 60), // Convert seconds to minutes
          polyline: (route.overview_polyline as any)?.encoded_polyline || ''
        };
      }

      return this.calculateFallbackRoute(pickup, dropoff, trafficConditions);
    } catch (error) {
      console.error('Error calculating route with traffic:', error);
      return this.calculateFallbackRoute(pickup, dropoff, trafficConditions);
    }
  }

  // Fallback route calculation
  private calculateFallbackRoute(
    pickup: string, 
    dropoff: string, 
    trafficConditions: 'low' | 'medium' | 'high'
  ): { distance: number; duration: number; polyline: string } {
    // Simulate API call delay
    const baseDistance = 15; // Default distance for fallback
    const baseDuration = baseDistance * 2; // 2 minutes per mile
    
    // Apply traffic multiplier
    let trafficMultiplier = 1;
    switch (trafficConditions) {
      case 'low':
        trafficMultiplier = 1;
        break;
      case 'medium':
        trafficMultiplier = 1.3;
        break;
      case 'high':
        trafficMultiplier = 1.7;
        break;
    }
    
    const adjustedDuration = Math.round(baseDuration * trafficMultiplier);
    
    return {
      distance: baseDistance,
      duration: adjustedDuration,
      polyline: '' // No polyline in fallback
    };
  }

  // Calculate distance between two locations using Google Maps Geocoding
  private async calculateDistance(from: string, to: string): Promise<number> {
    try {
      if (!this.googleMapsLoaded || !window.google?.maps) {
        return 15; // Default fallback distance
      }

      const geocoder = new google.maps.Geocoder();
      
      const [fromResult, toResult] = await Promise.all([
        geocoder.geocode({ address: from }),
        geocoder.geocode({ address: to })
      ]);

      if (fromResult.results.length > 0 && toResult.results.length > 0) {
        const fromLocation = fromResult.results[0].geometry.location;
        const toLocation = toResult.results[0].geometry.location;
        
        // Calculate distance using Haversine formula
        const distance = google.maps.geometry.spherical.computeDistanceBetween(fromLocation, toLocation);
        return distance / 1609.34; // Convert meters to miles
      }

      return 15; // Default fallback distance
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 15; // Default fallback distance
    }
  }

  // Calculate confidence level for ETA
  private calculateConfidence(trackingData: TrackingData): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on traffic conditions
    switch (trackingData.trafficConditions) {
      case 'low':
        confidence += 0.1;
        break;
      case 'medium':
        confidence -= 0.05;
        break;
      case 'high':
        confidence -= 0.15;
        break;
    }
    
    // Adjust based on distance
    if (trackingData.distance < 10) {
      confidence += 0.05;
    } else if (trackingData.distance > 50) {
      confidence -= 0.1;
    }
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  // Update ETA in Firebase
  private async updateETA(bookingId: string, etaCalculation: ETACalculation): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingRef, {
        estimatedArrival: etaCalculation.estimatedArrival,
        distance: etaCalculation.distance,
        duration: etaCalculation.duration,
        trafficConditions: etaCalculation.trafficConditions,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating ETA:', error);
      throw error;
    }
  }

  // Register callback for location updates
  onLocationUpdate(bookingId: string, callback: (location: DriverLocation) => void): void {
    this.locationUpdateCallbacks.set(bookingId, callback);
  }

  // Register callback for ETA updates
  onETAUpdate(bookingId: string, callback: (eta: ETACalculation) => void): void {
    this.etaUpdateCallbacks.set(bookingId, callback);
  }

  // Stop tracking for a booking
  stopTracking(bookingId: string): void {
    const unsubscribe = this.activeSubscriptions.get(bookingId);
    if (unsubscribe) {
      unsubscribe();
      this.activeSubscriptions.delete(bookingId);
    }
    
    this.locationUpdateCallbacks.delete(bookingId);
    this.etaUpdateCallbacks.delete(bookingId);
    
    console.log('🛑 Tracking stopped for booking:', bookingId);
  }

  // Get all active tracking subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.activeSubscriptions.keys());
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.activeSubscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeSubscriptions.clear();
    this.locationUpdateCallbacks.clear();
    this.etaUpdateCallbacks.clear();
    
    console.log('🧹 All tracking subscriptions cleaned up');
  }
}

export const firebaseTrackingService = new FirebaseTrackingService(); 