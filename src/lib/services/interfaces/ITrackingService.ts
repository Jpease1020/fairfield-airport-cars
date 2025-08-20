export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  heading?: number; // Direction in degrees
  speed?: number; // Speed in mph
  accuracy?: number; // GPS accuracy in meters
}

export interface TrackingUpdate {
  bookingId: string;
  driverId: string;
  location: Location;
  status: 'en-route' | 'arrived' | 'picked-up' | 'in-transit' | 'completed';
  estimatedArrival?: Date;
  actualArrival?: Date;
  timestamp?: Date;
}

export interface RouteInfo {
  distance: number; // in miles
  duration: number; // in minutes
  trafficConditions: 'low' | 'medium' | 'high';
  waypoints: Location[];
}

export interface ITrackingService {
  updateDriverLocation(bookingId: string, location: Location): Promise<void>;
  getDriverLocation(bookingId: string): Promise<Location | null>;
  getTrackingUpdates(bookingId: string): Promise<TrackingUpdate[]>;
  calculateRoute(from: Location, to: Location): Promise<RouteInfo>;
  simulateDriverMovement(bookingId: string, targetLocation: Location): Promise<void>;
  getETA(bookingId: string): Promise<Date | null>;
}
