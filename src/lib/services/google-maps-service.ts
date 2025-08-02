interface GoogleMapsConfig {
  apiKey: string;
  baseUrl: string;
}

interface TrafficData {
  severity: 'low' | 'medium' | 'high';
  description: string;
  speed: number; // mph
  delay: number; // minutes
}

interface RouteData {
  distance: number; // miles
  duration: number; // minutes
  trafficDuration: number; // minutes with traffic
  polyline: string; // encoded route
  steps: RouteStep[];
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
}

class GoogleMapsService {
  private config: GoogleMapsConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      baseUrl: 'https://maps.googleapis.com/maps/api'
    };
  }

  // Get real-time traffic conditions
  async getTrafficConditions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<TrafficData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/directions/json?` +
        `origin=${origin.lat},${origin.lng}&` +
        `destination=${destination.lat},${destination.lng}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch traffic data');
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];
      
      // Calculate traffic severity
      const trafficDuration = leg.duration_in_traffic?.value || leg.duration.value;
      const baseDuration = leg.duration.value;
      const delay = Math.round((trafficDuration - baseDuration) / 60);
      
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (delay > 10) severity = 'high';
      else if (delay > 5) severity = 'medium';

      return {
        severity,
        description: this.getTrafficDescription(severity, delay),
        speed: this.calculateAverageSpeed(leg.distance.value, trafficDuration),
        delay
      };
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      // Fallback to time-based traffic estimation
      return this.getFallbackTrafficData();
    }
  }

  // Get optimized route with traffic
  async getOptimizedRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: { lat: number; lng: number }[]
  ): Promise<RouteData> {
    try {
      let url = `${this.config.baseUrl}/directions/json?` +
        `origin=${origin.lat},${origin.lng}&` +
        `destination=${destination.lat},${destination.lng}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `optimize=true&` +
        `key=${this.config.apiKey}`;

      if (waypoints && waypoints.length > 0) {
        const waypointsStr = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
        url += `&waypoints=optimize:true|${waypointsStr}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch route data');
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value / 1609.34, // Convert meters to miles
        duration: Math.round(leg.duration.value / 60), // Convert seconds to minutes
        trafficDuration: Math.round((leg.duration_in_traffic?.value || leg.duration.value) / 60),
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions,
          distance: step.distance.value / 1609.34,
          duration: Math.round(step.duration.value / 60),
          maneuver: step.maneuver || 'straight'
        }))
      };
    } catch (error) {
      console.error('Error fetching route data:', error);
      throw error;
    }
  }

  // Get ETA with real-time traffic
  async getETA(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{
    eta: Date;
    duration: number; // minutes
    distance: number; // miles
    trafficConditions: TrafficData;
  }> {
    const route = await this.getOptimizedRoute(origin, destination);
    const traffic = await this.getTrafficConditions(origin, destination);
    
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + route.trafficDuration);

    return {
      eta,
      duration: route.trafficDuration,
      distance: route.distance,
      trafficConditions: traffic
    };
  }

  // Get nearby places (useful for airport pickup)
  async getNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000, // meters
    type: string = 'airport'
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/place/nearbysearch/json?` +
        `location=${location.lat},${location.lng}&` +
        `radius=${radius}&` +
        `type=${type}&` +
        `key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      return data.results;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }

  // Geocoding for address validation
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/geocode/json?` +
        `address=${encodeURIComponent(address)}&` +
        `key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results.length) {
        return null;
      }

      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // Reverse geocoding for location names
  async reverseGeocode(location: { lat: number; lng: number }): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/geocode/json?` +
        `latlng=${location.lat},${location.lng}&` +
        `key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results.length) {
        return null;
      }

      return data.results[0].formatted_address;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  private getTrafficDescription(severity: string, delay: number): string {
    switch (severity) {
      case 'high':
        return `Heavy traffic - ${delay} minute delay`;
      case 'medium':
        return `Moderate traffic - ${delay} minute delay`;
      case 'low':
        return delay > 0 ? `Light traffic - ${delay} minute delay` : 'Clear roads';
      default:
        return 'Traffic conditions unknown';
    }
  }

  private calculateAverageSpeed(distanceMeters: number, durationSeconds: number): number {
    const distanceMiles = distanceMeters / 1609.34;
    const durationHours = durationSeconds / 3600;
    return Math.round(distanceMiles / durationHours);
  }

  private getFallbackTrafficData(): TrafficData {
    const now = new Date();
    const hour = now.getHours();
    
    let severity: 'low' | 'medium' | 'high' = 'low';
    let delay = 0;
    
    if (hour >= 7 && hour <= 9) {
      severity = 'high';
      delay = 15;
    } else if (hour >= 16 && hour <= 18) {
      severity = 'high';
      delay = 12;
    } else if (hour >= 10 && hour <= 15) {
      severity = 'medium';
      delay = 5;
    }

    return {
      severity,
      description: this.getTrafficDescription(severity, delay),
      speed: this.getAverageSpeed(severity),
      delay
    };
  }

  private getAverageSpeed(severity: string): number {
    switch (severity) {
      case 'high': return 15;
      case 'medium': return 30;
      case 'low': return 45;
      default: return 30;
    }
  }
}

export const googleMapsService = new GoogleMapsService(); 