import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  scheduledDeparture: Date;
  scheduledArrival: Date;
  actualDeparture?: Date;
  actualArrival?: Date;
  status: 'scheduled' | 'delayed' | 'departed' | 'arrived' | 'cancelled';
  delayMinutes?: number;
  gate?: string;
  terminal?: string;
}

export interface FlightTrackingConfig {
  aviationStackApiKey: string;
  autoAdjustPickup: boolean;
  notificationThreshold: number; // minutes before pickup to send notification
  maxDelayAdjustment: number; // maximum minutes to adjust pickup time
}

class FlightTrackingService {
  private config: FlightTrackingConfig;

  constructor(config: Partial<FlightTrackingConfig> = {}) {
    this.config = {
      aviationStackApiKey: process.env.AVIATION_STACK_API_KEY || '',
      autoAdjustPickup: true,
      notificationThreshold: 30, // 30 minutes before pickup
      maxDelayAdjustment: 120, // 2 hours max adjustment
      ...config
    };
  }

  // Track a specific flight
  async trackFlight(flightNumber: string): Promise<FlightInfo | null> {
    try {
      const response = await fetch(
        `http://api.aviationstack.com/v1/flights?access_key=${this.config.aviationStackApiKey}&flight_iata=${flightNumber}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Aviation Stack API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseFlightData(data);
    } catch (error) {
      console.error('Error tracking flight:', error);
      return null;
    }
  }

  // Track multiple flights for a booking
  async trackBookingFlights(bookingId: string, flightNumbers: string[]): Promise<FlightInfo[]> {
    const flights: FlightInfo[] = [];
    
    for (const flightNumber of flightNumbers) {
      const flight = await this.trackFlight(flightNumber);
      if (flight) {
        flights.push(flight);
      }
    }

    return flights;
  }

  // Check if pickup time needs adjustment based on flight delays
  async checkPickupAdjustment(
    bookingId: string,
    scheduledPickup: Date,
    flightNumbers: string[]
  ): Promise<{
    needsAdjustment: boolean;
    newPickupTime?: Date;
    reason?: string;
    flights?: FlightInfo[];
  }> {
    try {
      const flights = await this.trackBookingFlights(bookingId, flightNumbers);
      
      if (flights.length === 0) {
        return { needsAdjustment: false };
      }

      // Find the most relevant flight (usually the arrival flight)
      const arrivalFlight = flights.find(f => 
        f.destination.toLowerCase().includes('jfk') || 
        f.destination.toLowerCase().includes('lga') ||
        f.destination.toLowerCase().includes('ewr')
      ) || flights[0];

      if (!arrivalFlight) {
        return { needsAdjustment: false };
      }

      // Calculate delay impact
      const delayImpact = this.calculateDelayImpact(arrivalFlight, scheduledPickup);
      
      if (delayImpact.needsAdjustment) {
        // Update booking with new pickup time
        await this.updateBookingPickupTime(bookingId, delayImpact.newPickupTime!);
        
        // Send notification about the adjustment
        await this.sendPickupAdjustmentNotification(bookingId, {
          newPickupTime: delayImpact.newPickupTime!,
          reason: delayImpact.reason!
        });
        
        return {
          needsAdjustment: true,
          newPickupTime: delayImpact.newPickupTime,
          reason: delayImpact.reason,
          flights
        };
      }

      return { needsAdjustment: false, flights };
    } catch (error) {
      console.error('Error checking pickup adjustment:', error);
      return { needsAdjustment: false };
    }
  }

  // Calculate how flight delays impact pickup time
  private calculateDelayImpact(
    flight: FlightInfo,
    scheduledPickup: Date
  ): {
    needsAdjustment: boolean;
    newPickupTime?: Date;
    reason?: string;
  } {
    const now = new Date();
    const pickupTime = new Date(scheduledPickup);
    const timeUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60); // minutes

    // If pickup is more than 2 hours away, don't adjust yet
    if (timeUntilPickup > this.config.maxDelayAdjustment) {
      return { needsAdjustment: false };
    }

    let delayMinutes = 0;
    let reason = '';

    if (flight.status === 'delayed' && flight.delayMinutes) {
      delayMinutes = flight.delayMinutes;
      reason = `Flight ${flight.flightNumber} delayed by ${delayMinutes} minutes`;
    } else if (flight.status === 'cancelled') {
      delayMinutes = 120; // Assume 2 hour delay for cancelled flights
      reason = `Flight ${flight.flightNumber} cancelled`;
    } else if (flight.actualArrival && flight.scheduledArrival) {
      const actualDelay = (flight.actualArrival.getTime() - flight.scheduledArrival.getTime()) / (1000 * 60);
      if (actualDelay > 15) { // Only adjust if delay is more than 15 minutes
        delayMinutes = actualDelay;
        reason = `Flight ${flight.flightNumber} arrived ${Math.round(delayMinutes)} minutes late`;
      }
    }

    if (delayMinutes > 0 && delayMinutes <= this.config.maxDelayAdjustment) {
      const newPickupTime = new Date(pickupTime.getTime() + (delayMinutes * 60 * 1000));
      
      return {
        needsAdjustment: true,
        newPickupTime,
        reason
      };
    }

    return { needsAdjustment: false };
  }

  // Update booking with new pickup time
  private async updateBookingPickupTime(bookingId: string, newPickupTime: Date): Promise<void> {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        pickupDateTime: newPickupTime,
        updatedAt: serverTimestamp(),
        pickupAdjustment: {
          originalTime: new Date(),
          newTime: newPickupTime,
          reason: 'Flight delay adjustment'
        }
      });
    } catch (error) {
      console.error('Error updating booking pickup time:', error);
      throw error;
    }
  }

  // Send notification about pickup time adjustment
  private async sendPickupAdjustmentNotification(
    bookingId: string,
    adjustment: { newPickupTime: Date; reason: string }
  ): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send-status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: 'pickup-adjusted',
          message: `Pickup time adjusted due to ${adjustment.reason}. New pickup time: ${adjustment.newPickupTime.toLocaleString()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send pickup adjustment notification');
      }
    } catch (error) {
      console.error('Error sending pickup adjustment notification:', error);
    }
  }

  // Parse Aviation Stack API response
  private parseFlightData(data: any): FlightInfo | null {
    try {
      const flight = data.data?.[0];
      if (!flight) return null;

      return {
        flightNumber: flight.flight?.iata || flight.flight?.number,
        airline: flight.airline?.iata || flight.airline?.name,
        origin: flight.departure?.iata || flight.departure?.airport,
        destination: flight.arrival?.iata || flight.arrival?.airport,
        scheduledDeparture: new Date(flight.departure?.scheduled || flight.departure?.estimated),
        scheduledArrival: new Date(flight.arrival?.scheduled || flight.arrival?.estimated),
        actualDeparture: flight.departure?.actual ? new Date(flight.departure.actual) : undefined,
        actualArrival: flight.arrival?.actual ? new Date(flight.arrival.actual) : undefined,
        status: this.mapFlightStatus(flight.flight_status),
        delayMinutes: flight.departure?.delay ? Math.round(flight.departure.delay / 60) : undefined,
        gate: flight.departure?.gate,
        terminal: flight.departure?.terminal
      };
    } catch (error) {
      console.error('Error parsing flight data:', error);
      return null;
    }
  }

  // Map Aviation Stack status to our status enum
  private mapFlightStatus(status: string): FlightInfo['status'] {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'active':
        return 'scheduled';
      case 'delayed':
        return 'delayed';
      case 'landed':
      case 'arrived':
        return 'arrived';
      case 'cancelled':
        return 'cancelled';
      case 'diverted':
        return 'cancelled';
      default:
        return 'scheduled';
    }
  }

  // Get flight status for display
  getFlightStatusDisplay(flight: FlightInfo): string {
    switch (flight.status) {
      case 'scheduled':
        return `🛫 Scheduled to arrive at ${flight.scheduledArrival.toLocaleTimeString()}`;
      case 'delayed':
        return `⏰ Delayed by ${flight.delayMinutes} minutes`;
      case 'departed':
        return `✈️ Departed from ${flight.origin}`;
      case 'arrived':
        return `✅ Arrived at ${flight.actualArrival?.toLocaleTimeString() || flight.scheduledArrival.toLocaleTimeString()}`;
      case 'cancelled':
        return `❌ Flight cancelled`;
      default:
        return `⏳ Status unknown`;
    }
  }

  // Check if flight tracking is enabled
  isEnabled(): boolean {
    return !!this.config.aviationStackApiKey;
  }
}

export const flightTrackingService = new FlightTrackingService(); 