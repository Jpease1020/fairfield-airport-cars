interface FlightAwareConfig {
  apiKey: string;
  baseUrl: string;
}

interface FlightData {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  scheduledDeparture: Date;
  scheduledArrival: Date;
  actualDeparture?: Date;
  actualArrival?: Date;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'diverted' | 'arrived';
  delay: number; // minutes
  gate?: string;
  terminal?: string;
}

interface AirportData {
  code: string;
  name: string;
  city: string;
  state: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

class FlightAwareService {
  private config: FlightAwareConfig;

  constructor() {
    this.config = {
      apiKey: process.env.FLIGHTAWARE_API_KEY || '',
      baseUrl: 'https://aeroapi.flightaware.com/aeroapi'
    };
  }

  // Get flight status by flight number
  async getFlightStatus(flightNumber: string): Promise<FlightData | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/flights/${flightNumber}`,
        {
          headers: {
            'x-apikey': this.config.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      
      if (!data.flights || data.flights.length === 0) {
        return null;
      }

      const flight = data.flights[0];
      
      return {
        flightNumber: flight.ident,
        airline: flight.operator_iata || flight.operator_icao,
        origin: flight.origin.code,
        destination: flight.destination.code,
        scheduledDeparture: new Date(flight.filed_departure_time.epoch * 1000),
        scheduledArrival: new Date(flight.filed_arrival_time.epoch * 1000),
        actualDeparture: flight.actual_departure_time ? 
          new Date(flight.actual_departure_time.epoch * 1000) : undefined,
        actualArrival: flight.actual_arrival_time ? 
          new Date(flight.actual_arrival_time.epoch * 1000) : undefined,
        status: this.mapFlightStatus(flight.status),
        delay: this.calculateDelay(flight),
        gate: flight.gate_dest,
        terminal: flight.terminal_dest
      };
    } catch (error) {
      console.error('Error fetching flight data:', error);
      return null;
    }
  }

  // Get flights by route (useful for finding alternative flights)
  async getFlightsByRoute(
    origin: string,
    destination: string,
    date: Date
  ): Promise<FlightData[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(
        `${this.config.baseUrl}/schedules/${origin}/${destination}/${dateStr}`,
        {
          headers: {
            'x-apikey': this.config.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route data');
      }

      const data = await response.json();
      
      if (!data.schedules) {
        return [];
      }

      return data.schedules.map((schedule: any) => ({
        flightNumber: schedule.ident,
        airline: schedule.operator_iata || schedule.operator_icao,
        origin: schedule.origin.code,
        destination: schedule.destination.code,
        scheduledDeparture: new Date(schedule.filed_departure_time.epoch * 1000),
        scheduledArrival: new Date(schedule.filed_arrival_time.epoch * 1000),
        status: this.mapFlightStatus(schedule.status),
        delay: this.calculateDelay(schedule)
      }));
    } catch (error) {
      console.error('Error fetching route data:', error);
      return [];
    }
  }

  // Get airport information
  async getAirportInfo(airportCode: string): Promise<AirportData | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/airports/${airportCode}`,
        {
          headers: {
            'x-apikey': this.config.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch airport data');
      }

      const data = await response.json();
      
      if (!data.airports || data.airports.length === 0) {
        return null;
      }

      const airport = data.airports[0];
      
      return {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        state: airport.state,
        timezone: airport.timezone,
        coordinates: {
          lat: airport.latitude,
          lng: airport.longitude
        }
      };
    } catch (error) {
      console.error('Error fetching airport data:', error);
      return null;
    }
  }

  // Calculate optimal pickup time based on flight data
  async calculateOptimalPickupTime(
    flightNumber: string,
    airportCode: string
  ): Promise<{
    pickupTime: Date;
    bufferMinutes: number;
    flightStatus: FlightData;
    airportInfo: AirportData;
  } | null> {
    const flightData = await this.getFlightStatus(flightNumber);
    const airportInfo = await this.getAirportInfo(airportCode);

    if (!flightData || !airportInfo) {
      return null;
    }

    // Calculate pickup time based on flight arrival
    const arrivalTime = flightData.actualArrival || flightData.scheduledArrival;
    const bufferMinutes = this.calculateBufferTime(flightData);
    
    const pickupTime = new Date(arrivalTime);
    pickupTime.setMinutes(pickupTime.getMinutes() + bufferMinutes);

    return {
      pickupTime,
      bufferMinutes,
      flightStatus: flightData,
      airportInfo
    };
  }

  // Monitor flight for changes (useful for real-time updates)
  async monitorFlight(
    flightNumber: string,
    callback: (flightData: FlightData) => void
  ): Promise<() => void> {
    let lastStatus = '';
    
    const interval = setInterval(async () => {
      const flightData = await this.getFlightStatus(flightNumber);
      
      if (flightData && flightData.status !== lastStatus) {
        lastStatus = flightData.status;
        callback(flightData);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }

  // Get weather conditions at airport (affects pickup timing)
  async getAirportWeather(airportCode: string): Promise<{
    temperature: number;
    conditions: string;
    visibility: number;
    windSpeed: number;
  } | null> {
    try {
      const airportInfo = await this.getAirportInfo(airportCode);
      if (!airportInfo) return null;

      // This would integrate with a weather API
      // For now, return mock data
      return {
        temperature: 72,
        conditions: 'Clear',
        visibility: 10,
        windSpeed: 8
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  private mapFlightStatus(status: string): FlightData['status'] {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'active':
        return 'scheduled';
      case 'delayed':
        return 'delayed';
      case 'cancelled':
        return 'cancelled';
      case 'diverted':
        return 'diverted';
      case 'arrived':
      case 'landed':
        return 'arrived';
      default:
        return 'scheduled';
    }
  }

  private calculateDelay(flight: any): number {
    if (!flight.actual_departure_time || !flight.filed_departure_time) {
      return 0;
    }

    const scheduled = flight.filed_departure_time.epoch * 1000;
    const actual = flight.actual_departure_time.epoch * 1000;
    return Math.round((actual - scheduled) / 60000);
  }

  private calculateBufferTime(flightData: FlightData): number {
    let bufferMinutes = 30; // Default buffer

    // Adjust buffer based on flight status
    if (flightData.status === 'delayed') {
      bufferMinutes += flightData.delay;
    } else if (flightData.status === 'cancelled') {
      bufferMinutes = 0; // No pickup needed
    }

    // Adjust for time of day
    const hour = flightData.scheduledArrival.getHours();
    if (hour >= 6 && hour <= 9) {
      bufferMinutes += 15; // Morning rush
    } else if (hour >= 16 && hour <= 19) {
      bufferMinutes += 10; // Evening rush
    }

    return bufferMinutes;
  }
}

export const flightAwareService = new FlightAwareService(); 