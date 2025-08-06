// Real-Time Tracking Service
// Handles driver location tracking, customer updates, and WebSocket management

import { getBooking, updateBooking } from './booking-service';
import { Booking } from '@/types/booking';

export interface TrackingData {
  bookingId: string;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
  estimatedArrival?: Date;
  status: Booking['status'];
  lastUpdated: Date;
}

export interface ETAInfo {
  estimatedArrival: Date;
  distanceMiles: number;
  timeMinutes: number;
  trafficConditions: 'clear' | 'moderate' | 'heavy';
}

class RealTimeTrackingService {
  private connections: Map<string, WebSocket> = new Map();
  private trackingData: Map<string, TrackingData> = new Map();

  // Initialize tracking for a booking
  async initializeTracking(bookingId: string): Promise<TrackingData | null> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) {
        console.error(`Booking ${bookingId} not found`);
        return null;
      }

      const trackingData: TrackingData = {
        bookingId,
        driverLocation: booking.driverLocation,
        estimatedArrival: booking.estimatedArrival,
        status: booking.status,
        lastUpdated: booking.updatedAt || new Date(),
      };

      this.trackingData.set(bookingId, trackingData);
      return trackingData;
    } catch (error) {
      console.error('Error initializing tracking:', error);
      return null;
    }
  }

  // Update driver location
  async updateDriverLocation(
    bookingId: string,
    location: {
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    }
  ): Promise<void> {
    try {
      const trackingData = this.trackingData.get(bookingId);
      if (!trackingData) {
        console.error(`No tracking data for booking ${bookingId}`);
        return;
      }

      const updatedLocation = {
        ...location,
        timestamp: new Date(),
      };

      // Update tracking data
      trackingData.driverLocation = updatedLocation;
      trackingData.lastUpdated = new Date();

      // Calculate new ETA
      const etaInfo = await this.calculateETA(bookingId, updatedLocation);
      if (etaInfo) {
        trackingData.estimatedArrival = etaInfo.estimatedArrival;
      }

      // Update database
      await updateBooking(bookingId, {
        driverLocation: updatedLocation,
        estimatedArrival: trackingData.estimatedArrival,
        updatedAt: new Date(),
      });

      // Notify connected clients
      this.broadcastUpdate(bookingId, {
        type: 'location_update',
        data: {
          location: updatedLocation,
          estimatedArrival: trackingData.estimatedArrival,
          lastUpdated: trackingData.lastUpdated,
        },
      });

      this.trackingData.set(bookingId, trackingData);
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  }

  // Update booking status
  async updateBookingStatus(
    bookingId: string,
    status: Booking['status']
  ): Promise<void> {
    try {
      const trackingData = this.trackingData.get(bookingId);
      if (!trackingData) {
        console.error(`No tracking data for booking ${bookingId}`);
        return;
      }

      trackingData.status = status;
      trackingData.lastUpdated = new Date();

      // Update database
      await updateBooking(bookingId, {
        status,
        updatedAt: new Date(),
      });

      // Notify connected clients
      this.broadcastUpdate(bookingId, {
        type: 'status_update',
        data: {
          status,
          lastUpdated: trackingData.lastUpdated,
        },
      });

      this.trackingData.set(bookingId, trackingData);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  }

  // Calculate ETA based on driver location and destination
  async calculateETA(
    bookingId: string,
    driverLocation: { lat: number; lng: number }
  ): Promise<ETAInfo | null> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return null;

      // Get destination coordinates (pickup location)
      const destinationCoords = await this.getCoordinates(booking.pickupLocation);
      if (!destinationCoords) return null;

      // Calculate distance and time using Google Maps API
      const routeInfo = await this.getRouteInfo(
        driverLocation,
        destinationCoords
      );

      if (!routeInfo) return null;

      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + routeInfo.duration);

      return {
        estimatedArrival,
        distanceMiles: routeInfo.distance,
        timeMinutes: routeInfo.duration,
        trafficConditions: routeInfo.trafficConditions,
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      return null;
    }
  }

  // Get coordinates for an address
  private async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  // Get route information from Google Maps API
  private async getRouteInfo(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{
    distance: number;
    duration: number;
    trafficConditions: 'clear' | 'moderate' | 'heavy';
  } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        // Determine traffic conditions based on duration vs distance
        const distanceMiles = leg.distance.value * 0.000621371; // Convert meters to miles
        const durationMinutes = leg.duration.value / 60; // Convert seconds to minutes
        const speedMph = distanceMiles / (durationMinutes / 60);

        let trafficConditions: 'clear' | 'moderate' | 'heavy';
        if (speedMph > 35) trafficConditions = 'clear';
        else if (speedMph > 20) trafficConditions = 'moderate';
        else trafficConditions = 'heavy';

        return {
          distance: distanceMiles,
          duration: durationMinutes,
          trafficConditions,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting route info:', error);
      return null;
    }
  }

  // Broadcast update to connected clients
  private broadcastUpdate(bookingId: string, message: any): void {
    const connection = this.connections.get(bookingId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }

  // Add WebSocket connection
  addConnection(bookingId: string, connection: WebSocket): void {
    this.connections.set(bookingId, connection);
  }

  // Remove WebSocket connection
  removeConnection(bookingId: string): void {
    this.connections.delete(bookingId);
  }

  // Get current tracking data
  getTrackingData(bookingId: string): TrackingData | null {
    return this.trackingData.get(bookingId) || null;
  }

  // Get all active tracking data
  getAllTrackingData(): TrackingData[] {
    return Array.from(this.trackingData.values());
  }
}

export const realTimeTrackingService = new RealTimeTrackingService(); 