// Driver location tracking service with GPS simulation
import { getBooking, updateBooking } from './booking-service';

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export interface LocationUpdate {
  bookingId: string;
  location: DriverLocation;
  estimatedArrival?: Date;
}

class DriverLocationService {
  private activeTrackings = new Map<string, NodeJS.Timeout>();
  private driverRoutes = new Map<string, DriverLocation[]>();

  // Start tracking a driver for a specific booking
  async startTracking(bookingId: string, driverId: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Generate route from driver location to pickup to dropoff
      const route = await this.generateRoute(booking);
      this.driverRoutes.set(bookingId, route);

      // Start location updates
      this.startLocationUpdates(bookingId, route);

      console.log(`Started tracking for booking ${bookingId}, driver ${driverId}`);
    } catch (error) {
      console.error('Error starting driver tracking:', error);
      throw error;
    }
  }

  // Stop tracking a driver
  stopTracking(bookingId: string): void {
    const interval = this.activeTrackings.get(bookingId);
    if (interval) {
      clearInterval(interval);
      this.activeTrackings.delete(bookingId);
      this.driverRoutes.delete(bookingId);
      console.log(`Stopped tracking for booking ${bookingId}`);
    }
  }

  // Generate a realistic route for the driver
  private async generateRoute(booking: any): Promise<DriverLocation[]> {
    // For simulation, we'll create a route from a starting point to pickup to dropoff
    const route: DriverLocation[] = [];
    
    // Starting point (simulated driver location)
    const startPoint = {
      lat: 41.2619, // Fairfield area
      lng: -73.2897,
    };

    // Pickup coordinates (simplified)
    const pickupCoords = await this.getCoordinates(booking.pickupLocation);
    const dropoffCoords = await this.getCoordinates(booking.dropoffLocation);

    if (!pickupCoords || !dropoffCoords) {
      throw new Error('Could not get coordinates for pickup or dropoff');
    }

    // Generate route points
    const totalPoints = 20; // Number of points in the route
    
    // Route from start to pickup
    for (let i = 0; i < totalPoints / 2; i++) {
      const progress = i / (totalPoints / 2);
      const lat = startPoint.lat + (pickupCoords.lat - startPoint.lat) * progress;
      const lng = startPoint.lng + (pickupCoords.lng - startPoint.lng) * progress;
      
      route.push({
        lat,
        lng,
        timestamp: new Date(Date.now() + i * 30000), // 30 seconds apart
        heading: this.calculateHeading(
          i === 0 ? startPoint : route[i - 1],
          { lat, lng }
        ),
        speed: 25 + Math.random() * 10, // 25-35 mph
        accuracy: 5 + Math.random() * 5, // 5-10 meters
      });
    }

    // Route from pickup to dropoff
    for (let i = 0; i < totalPoints / 2; i++) {
      const progress = i / (totalPoints / 2);
      const lat = pickupCoords.lat + (dropoffCoords.lat - pickupCoords.lat) * progress;
      const lng = pickupCoords.lng + (dropoffCoords.lng - pickupCoords.lng) * progress;
      
      route.push({
        lat,
        lng,
        timestamp: new Date(Date.now() + (totalPoints / 2 + i) * 30000),
        heading: this.calculateHeading(
          i === 0 ? pickupCoords : route[totalPoints / 2 + i - 1],
          { lat, lng }
        ),
        speed: 30 + Math.random() * 15, // 30-45 mph
        accuracy: 5 + Math.random() * 5,
      });
    }

    return route;
  }

  // Calculate heading between two points
  private calculateHeading(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const dLng = to.lng - from.lng;
    const y = Math.sin(dLng) * Math.cos(to.lat);
    const x = Math.cos(from.lat) * Math.sin(to.lat) - Math.sin(from.lat) * Math.cos(to.lat) * Math.cos(dLng);
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360
    heading = (heading + 360) % 360;
    
    return heading;
  }

  // Get coordinates from address
  private async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // For simulation, return hardcoded coordinates
      // In production, use Google Geocoding API
      const coordinates: Record<string, { lat: number; lng: number }> = {
        'Fairfield University': { lat: 41.1745, lng: -73.2637 },
        'Fairfield Metro Station': { lat: 41.1764, lng: -73.2897 },
        'Fairfield Train Station': { lat: 41.1745, lng: -73.2637 },
        'JFK Airport': { lat: 40.6413, lng: -73.7781 },
        'LaGuardia Airport': { lat: 40.7769, lng: -73.8740 },
        'Newark Airport': { lat: 40.6895, lng: -74.1745 },
        'Bradley International Airport': { lat: 41.9389, lng: -72.6832 },
        'Tweed New Haven Airport': { lat: 41.2637, lng: -72.8868 },
      };

      // Try to match address
      for (const [key, coords] of Object.entries(coordinates)) {
        if (address.toLowerCase().includes(key.toLowerCase())) {
          return coords;
        }
      }

      // Default to Fairfield area if no match
      return { lat: 41.2619, lng: -73.2897 };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  // Start location updates for a booking
  private startLocationUpdates(bookingId: string, route: DriverLocation[]): void {
    let currentIndex = 0;
    
    const interval = setInterval(async () => {
      if (currentIndex >= route.length) {
        // Route completed
        this.stopTracking(bookingId);
        return;
      }

      const location = route[currentIndex];
      
      try {
        // Update booking with new location
        await updateBooking(bookingId, {
          driverLocation: location,
          estimatedArrival: this.calculateETA(route, currentIndex),
          updatedAt: new Date(),
        });

        // Send real-time update
        await this.sendLocationUpdate(bookingId, location);

        currentIndex++;
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    }, 30000); // Update every 30 seconds

    this.activeTrackings.set(bookingId, interval);
  }

  // Calculate ETA based on current position in route
  private calculateETA(route: DriverLocation[], currentIndex: number): Date {
    const remainingPoints = route.length - currentIndex;
    const remainingMinutes = remainingPoints * 0.5; // 30 seconds per point = 0.5 minutes
    return new Date(Date.now() + remainingMinutes * 60000);
  }

  // Send location update via real-time API
  private async sendLocationUpdate(bookingId: string, location: DriverLocation): Promise<void> {
    try {
      const response = await fetch(`/api/ws/bookings/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'location_update',
          data: {
            location,
            estimatedArrival: this.calculateETA(this.driverRoutes.get(bookingId) || [], 0),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending location update:', error);
    }
  }

  // Get current tracking status
  getTrackingStatus(bookingId: string): boolean {
    return this.activeTrackings.has(bookingId);
  }

  // Get all active trackings
  getActiveTrackings(): string[] {
    return Array.from(this.activeTrackings.keys());
  }
}

export const driverLocationService = new DriverLocationService(); 