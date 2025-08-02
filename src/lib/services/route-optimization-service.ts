import { googleMapsService } from './google-maps-service';

interface RouteOptimizationRequest {
  origin: { lat: number; lng: number };
  destinations: Array<{
    id: string;
    location: { lat: number; lng: number };
    priority: 'high' | 'medium' | 'low';
    timeWindow?: {
      start: Date;
      end: Date;
    };
  }>;
  constraints: {
    maxStops: number;
    maxDistance: number; // miles
    maxDuration: number; // minutes
    vehicleCapacity: number;
  };
}

interface OptimizedRoute {
  route: Array<{
    id: string;
    location: { lat: number; lng: number };
    order: number;
    estimatedArrival: Date;
    estimatedDeparture: Date;
    distance: number; // miles from previous stop
    duration: number; // minutes from previous stop
  }>;
  totalDistance: number; // miles
  totalDuration: number; // minutes
  efficiency: number; // percentage
}

interface MultiStopBooking {
  bookingId: string;
  stops: Array<{
    type: 'pickup' | 'dropoff';
    location: { lat: number; lng: number };
    address: string;
    passengerCount: number;
    specialRequests?: string[];
  }>;
  vehicleType: 'sedan' | 'suv' | 'van';
  totalPassengers: number;
  totalLuggage: number;
}

class RouteOptimizationService {
  // Optimize route for multiple stops
  async optimizeRoute(request: RouteOptimizationRequest): Promise<OptimizedRoute> {
    try {
      // Get optimized route from Google Maps
      const waypoints = request.destinations.map(dest => dest.location);
      const route = await googleMapsService.getOptimizedRoute(
        request.origin,
        request.destinations[request.destinations.length - 1].location,
        waypoints.slice(0, -1) // Exclude final destination from waypoints
      );

      // Build optimized route with timing
      const optimizedStops = this.buildOptimizedStops(
        request.origin,
        request.destinations,
        route
      );

      return {
        route: optimizedStops,
        totalDistance: route.distance,
        totalDuration: route.trafficDuration,
        efficiency: this.calculateEfficiency(optimizedStops, request.constraints)
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  // Optimize multi-stop booking
  async optimizeMultiStopBooking(booking: MultiStopBooking): Promise<OptimizedRoute> {
    const origin = booking.stops[0].location;
    const destinations = booking.stops.slice(1).map((stop, index) => ({
      id: `stop_${index + 1}`,
      location: stop.location,
      priority: this.getStopPriority(stop),
      timeWindow: this.calculateTimeWindow(stop, booking)
    }));

    return this.optimizeRoute({
      origin,
      destinations,
      constraints: {
        maxStops: booking.stops.length,
        maxDistance: this.getMaxDistance(booking.vehicleType),
        maxDuration: this.getMaxDuration(booking.vehicleType),
        vehicleCapacity: this.getVehicleCapacity(booking.vehicleType)
      }
    });
  }

  // Calculate optimal pickup times for multiple passengers
  async calculateOptimalPickupTimes(
    bookings: Array<{
      bookingId: string;
      pickupLocation: { lat: number; lng: number };
      dropoffLocation: { lat: number; lng: number };
      passengerCount: number;
      specialRequests?: string[];
    }>
  ): Promise<Array<{
    bookingId: string;
    optimalPickupTime: Date;
    estimatedArrival: Date;
    routeEfficiency: number;
  }>> {
    try {
      // Group bookings by proximity
      const bookingGroups = this.groupBookingsByProximity(bookings);
      
      const results = [];
      
      for (const group of bookingGroups) {
        // Optimize route for this group
        const optimizedRoute = await this.optimizeRoute({
          origin: group[0].pickupLocation,
          destinations: group.slice(1).map(booking => ({
            id: booking.bookingId,
            location: booking.pickupLocation,
            priority: 'medium'
          })),
          constraints: {
            maxStops: group.length,
            maxDistance: 50, // 50 miles max
            maxDuration: 120, // 2 hours max
            vehicleCapacity: 6
          }
        });

        // Calculate pickup times for each booking
        for (let i = 0; i < group.length; i++) {
          const booking = group[i];
          const routeStop = optimizedRoute.route[i];
          
          results.push({
            bookingId: booking.bookingId,
            optimalPickupTime: routeStop.estimatedArrival,
            estimatedArrival: routeStop.estimatedDeparture,
            routeEfficiency: optimizedRoute.efficiency
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error calculating optimal pickup times:', error);
      throw error;
    }
  }

  // Calculate route efficiency score
  private calculateEfficiency(
    stops: OptimizedRoute['route'],
    constraints: RouteOptimizationRequest['constraints']
  ): number {
    const totalDistance = stops.reduce((sum, stop) => sum + stop.distance, 0);
    const totalDuration = stops.reduce((sum, stop) => sum + stop.duration, 0);
    
    const distanceEfficiency = Math.max(0, 100 - (totalDistance / constraints.maxDistance) * 100);
    const durationEfficiency = Math.max(0, 100 - (totalDuration / constraints.maxDuration) * 100);
    
    return Math.round((distanceEfficiency + durationEfficiency) / 2);
  }

  // Build optimized stops with timing
  private buildOptimizedStops(
    origin: { lat: number; lng: number },
    destinations: RouteOptimizationRequest['destinations'],
    route: any
  ): OptimizedRoute['route'] {
    const stops = [];
    let currentTime = new Date();
    let currentLocation = origin;

    // Add origin as first stop
    stops.push({
      id: 'origin',
      location: origin,
      order: 0,
      estimatedArrival: currentTime,
      estimatedDeparture: new Date(currentTime.getTime() + 5 * 60000), // 5 min stop
      distance: 0,
      duration: 0
    });

    // Add destinations in optimized order
    for (let i = 0; i < destinations.length; i++) {
      const destination = destinations[i];
      const stopTime = new Date(currentTime.getTime() + (route.steps[i]?.duration || 0) * 60000);
      
      stops.push({
        id: destination.id,
        location: destination.location,
        order: i + 1,
        estimatedArrival: stopTime,
        estimatedDeparture: new Date(stopTime.getTime() + 3 * 60000), // 3 min stop
        distance: route.steps[i]?.distance || 0,
        duration: route.steps[i]?.duration || 0
      });

      currentTime = new Date(stopTime.getTime() + 3 * 60000);
      currentLocation = destination.location;
    }

    return stops;
  }

  // Group bookings by proximity
  private groupBookingsByProximity(bookings: any[]): any[][] {
    const groups = [];
    const processed = new Set();

    for (const booking of bookings) {
      if (processed.has(booking.bookingId)) continue;

      const group = [booking];
      processed.add(booking.bookingId);

      // Find nearby bookings
      for (const otherBooking of bookings) {
        if (processed.has(otherBooking.bookingId)) continue;

        const distance = this.calculateDistance(
          booking.pickupLocation,
          otherBooking.pickupLocation
        );

        if (distance < 5) { // Within 5 miles
          group.push(otherBooking);
          processed.add(otherBooking.bookingId);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  // Calculate distance between two points
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

  private getStopPriority(stop: any): 'high' | 'medium' | 'low' {
    if (stop.specialRequests?.includes('wheelchair')) return 'high';
    if (stop.specialRequests?.includes('child-seat')) return 'medium';
    return 'low';
  }

  private calculateTimeWindow(stop: any, booking: MultiStopBooking): { start: Date; end: Date } {
    // Calculate time window based on booking type and constraints
    const now = new Date();
    const start = new Date(now.getTime() + 30 * 60000); // 30 min from now
    const end = new Date(start.getTime() + 60 * 60000); // 1 hour window
    return { start, end };
  }

  private getMaxDistance(vehicleType: string): number {
    switch (vehicleType) {
      case 'sedan': return 100;
      case 'suv': return 150;
      case 'van': return 200;
      default: return 100;
    }
  }

  private getMaxDuration(vehicleType: string): number {
    switch (vehicleType) {
      case 'sedan': return 120; // 2 hours
      case 'suv': return 180; // 3 hours
      case 'van': return 240; // 4 hours
      default: return 120;
    }
  }

  private getVehicleCapacity(vehicleType: string): number {
    switch (vehicleType) {
      case 'sedan': return 4;
      case 'suv': return 6;
      case 'van': return 8;
      default: return 4;
    }
  }
}

export const routeOptimizationService = new RouteOptimizationService(); 