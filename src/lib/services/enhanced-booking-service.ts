// Enhanced Booking Service
// Advanced booking management with dynamic pricing, surge pricing, and business logic

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface EnhancedBooking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  passengers: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  baseFare: number;
  dynamicFare: number;
  surgeMultiplier: number;
  depositPaid: boolean;
  balanceDue: number;
  flightNumber?: string;
  notes?: string;
  driverId?: string;
  driverName?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  tipAmount?: number;
  cancellationFee?: number;
  squareOrderId?: string;
  depositAmount?: number;
  reminderSent?: boolean;
  onMyWaySent?: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Enhanced fields
  distance: number; // in miles
  duration: number; // in minutes
  trafficConditions: 'low' | 'medium' | 'high';
  weatherConditions: 'clear' | 'rain' | 'snow' | 'storm';
  airportRushHour: boolean;
  specialRequests: string[];
  customerRating?: number;
  driverRating?: number;
  feedback?: string;
}

export interface PricingConfig {
  baseRate: number; // per mile
  airportFee: number;
  lateNightFee: number;
  earlyMorningFee: number;
  passengerFee: number; // per additional passenger
  surgePricing: {
    enabled: boolean;
    maxMultiplier: number;
    factors: {
      airportRushHour: number;
      weather: number;
      traffic: number;
      specialEvents: number;
    };
  };
  cancellation: {
    over24hRefundPercent: number;
    between3And24hRefundPercent: number;
    under3hRefundPercent: number;
  };
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalRides: number;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  availability: {
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    daysOfWeek: number[]; // 0-6, Sunday = 0
  };
  lastUpdated: Date;
}

class EnhancedBookingService {
  private pricingConfig: PricingConfig = {
    baseRate: 2.50, // $2.50 per mile
    airportFee: 15.00,
    lateNightFee: 10.00,
    earlyMorningFee: 8.00,
    passengerFee: 5.00,
    surgePricing: {
      enabled: true,
      maxMultiplier: 2.5,
      factors: {
        airportRushHour: 1.3,
        weather: 1.2,
        traffic: 1.15,
        specialEvents: 1.4,
      },
    },
    cancellation: {
      over24hRefundPercent: 100,
      between3And24hRefundPercent: 50,
      under3hRefundPercent: 0,
    },
  };

  // Calculate dynamic fare with surge pricing
  async calculateDynamicFare(
    pickupLocation: string,
    dropoffLocation: string,
    pickupDateTime: Date,
    passengers: number = 1
  ): Promise<{
    baseFare: number;
    dynamicFare: number;
    surgeMultiplier: number;
    breakdown: {
      distance: number;
      baseRate: number;
      airportFee: number;
      timeFee: number;
      passengerFee: number;
      surgeFee: number;
    };
  }> {
    // Get distance and duration from Google Maps API
    const routeInfo = await this.getRouteInfo(pickupLocation, dropoffLocation);
    
    // Calculate base fare
    const baseFare = routeInfo.distance * this.pricingConfig.baseRate;
    
    // Calculate additional fees
    const airportFee = this.isAirportLocation(dropoffLocation) ? this.pricingConfig.airportFee : 0;
    const timeFee = this.calculateTimeFee(pickupDateTime);
    const passengerFee = Math.max(0, passengers - 1) * this.pricingConfig.passengerFee;
    
    // Calculate surge pricing
    const surgeMultiplier = await this.calculateSurgeMultiplier(pickupDateTime, routeInfo);
    const surgeFee = (baseFare + airportFee + timeFee + passengerFee) * (surgeMultiplier - 1);
    
    const dynamicFare = baseFare + airportFee + timeFee + passengerFee + surgeFee;
    
    return {
      baseFare,
      dynamicFare,
      surgeMultiplier,
      breakdown: {
        distance: routeInfo.distance,
        baseRate: baseFare,
        airportFee,
        timeFee,
        passengerFee,
        surgeFee,
      },
    };
  }

  // Get route information from Google Maps API
  private async getRouteInfo(pickup: string, dropoff: string): Promise<{ distance: number; duration: number }> {
    try {
      const response = await fetch('/api/route-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, dropoff }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get route information');
      }
      
      const data = await response.json();
      return {
        distance: data.distance, // in miles
        duration: data.duration, // in minutes
      };
    } catch (error) {
      console.error('Error getting route info:', error);
      // Fallback to estimated distance
      return {
        distance: 25, // Default estimate
        duration: 30, // Default estimate
      };
    }
  }

  // Check if location is an airport
  private isAirportLocation(location: string): boolean {
    const airports = [
      'JFK', 'LGA', 'EWR', 'BDL', 'HPN', 'ISP', 'SWF',
      'John F. Kennedy', 'LaGuardia', 'Newark', 'Bradley',
      'Westchester', 'Islip', 'Stewart'
    ];
    
    return airports.some(airport => 
      location.toUpperCase().includes(airport.toUpperCase())
    );
  }

  // Calculate time-based fees
  private calculateTimeFee(pickupDateTime: Date): number {
    const hour = pickupDateTime.getHours();
    
    // Late night fee (10 PM - 6 AM)
    if (hour >= 22 || hour < 6) {
      return this.pricingConfig.lateNightFee;
    }
    
    // Early morning fee (6 AM - 9 AM)
    if (hour >= 6 && hour < 9) {
      return this.pricingConfig.earlyMorningFee;
    }
    
    return 0;
  }

  // Calculate surge pricing multiplier
  private async calculateSurgeMultiplier(
    pickupDateTime: Date,
    routeInfo: { distance: number; duration: number }
  ): Promise<number> {
    if (!this.pricingConfig.surgePricing.enabled) {
      return 1.0;
    }

    let multiplier = 1.0;
    const factors = this.pricingConfig.surgePricing.factors;

    // Check for airport rush hour
    if (this.isAirportRushHour(pickupDateTime)) {
      multiplier *= factors.airportRushHour;
    }

    // Check weather conditions (would need weather API integration)
    const weatherMultiplier = await this.getWeatherMultiplier();
    multiplier *= weatherMultiplier;

    // Check traffic conditions
    const trafficMultiplier = this.getTrafficMultiplier(routeInfo.duration, routeInfo.distance);
    multiplier *= trafficMultiplier;

    // Check for special events
    const eventMultiplier = await this.getSpecialEventMultiplier();
    multiplier *= eventMultiplier;

    // Cap at maximum multiplier
    return Math.min(multiplier, this.pricingConfig.surgePricing.maxMultiplier);
  }

  // Check if it's airport rush hour
  private isAirportRushHour(dateTime: Date): boolean {
    const hour = dateTime.getHours();
    const dayOfWeek = dateTime.getDay();
    
    // Weekday rush hours
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Morning rush (6 AM - 10 AM)
      if (hour >= 6 && hour <= 10) return true;
      // Evening rush (4 PM - 8 PM)
      if (hour >= 16 && hour <= 20) return true;
    }
    
    // Weekend airport traffic (Friday evening, Sunday evening)
    if (dayOfWeek === 5 && hour >= 16) return true; // Friday evening
    if (dayOfWeek === 0 && hour >= 16) return true; // Sunday evening
    
    return false;
  }

  // Get weather multiplier (placeholder for weather API integration)
  private async getWeatherMultiplier(): Promise<number> {
    // This would integrate with a weather API
    // For now, return base multiplier
    return 1.0;
  }

  // Get traffic multiplier based on travel time vs distance
  private getTrafficMultiplier(duration: number, distance: number): number {
    const expectedSpeed = 30; // mph
    const actualSpeed = distance / (duration / 60);
    
    if (actualSpeed < expectedSpeed * 0.7) {
      return this.pricingConfig.surgePricing.factors.traffic;
    }
    
    return 1.0;
  }

  // Get special event multiplier (placeholder for event API integration)
  private async getSpecialEventMultiplier(): Promise<number> {
    // This would integrate with an events API
    // For now, return base multiplier
    return 1.0;
  }

  // Create enhanced booking
  async createEnhancedBooking(bookingData: Omit<EnhancedBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Calculate dynamic fare
    const fareInfo = await this.calculateDynamicFare(
      bookingData.pickupLocation,
      bookingData.dropoffLocation,
      bookingData.pickupDateTime,
      bookingData.passengers
    );

    // Get route info for enhanced data
    const routeInfo = await this.getRouteInfo(
      bookingData.pickupLocation,
      bookingData.dropoffLocation
    );

    const enhancedBooking: Omit<EnhancedBooking, 'id'> = {
      ...bookingData,
      baseFare: fareInfo.baseFare,
      dynamicFare: fareInfo.dynamicFare,
      surgeMultiplier: fareInfo.surgeMultiplier,
      balanceDue: fareInfo.dynamicFare - (bookingData.depositPaid ? bookingData.depositAmount || 0 : 0),
      distance: routeInfo.distance,
      duration: routeInfo.duration,
      trafficConditions: this.getTrafficConditions(routeInfo.duration, routeInfo.distance),
      weatherConditions: 'clear', // Would be set by weather API
      airportRushHour: this.isAirportRushHour(bookingData.pickupDateTime),
      specialRequests: bookingData.specialRequests || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), enhancedBooking);
    return docRef.id;
  }

  // Get traffic conditions
  private getTrafficConditions(duration: number, distance: number): 'low' | 'medium' | 'high' {
    const expectedSpeed = 30; // mph
    const actualSpeed = distance / (duration / 60);
    
    if (actualSpeed < expectedSpeed * 0.7) return 'high';
    if (actualSpeed < expectedSpeed * 0.9) return 'medium';
    return 'low';
  }

  // Find available drivers
  async findAvailableDrivers(pickupDateTime: Date): Promise<Driver[]> {
    const driversRef = collection(db, 'drivers');
    const q = query(
      driversRef,
      where('status', '==', 'available'),
      orderBy('rating', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
    const drivers: Driver[] = [];

    snapshot.forEach((doc) => {
      const driverData = doc.data() as Driver;
      driverData.id = doc.id;
      
      // Check if driver is available at the requested time
      if (this.isDriverAvailable(driverData, pickupDateTime)) {
        drivers.push(driverData);
      }
    });

    return drivers;
  }

  // Check if driver is available at specific time
  private isDriverAvailable(driver: Driver, pickupDateTime: Date): boolean {
    const hour = pickupDateTime.getHours();
    const dayOfWeek = pickupDateTime.getDay();
    
    // Check if driver works on this day
    if (!driver.availability.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }
    
    // Check if pickup time is within driver's hours
    const [startHour] = driver.availability.startTime.split(':').map(Number);
    const [endHour] = driver.availability.endTime.split(':').map(Number);
    
    return hour >= startHour && hour <= endHour;
  }

  // Update booking status with enhanced tracking
  async updateBookingStatus(
    bookingId: string, 
    status: EnhancedBooking['status'], 
    driverId?: string
  ): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);
    
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (driverId) {
      updateData.driverId = driverId;
      // Get driver info
      const driverDoc = await getDoc(doc(db, 'drivers', driverId));
      if (driverDoc.exists()) {
        const driverData = driverDoc.data() as Driver;
        updateData.driverName = driverData.name;
      }
    }
    
    await updateDoc(bookingRef, updateData);
  }

  // Get booking analytics
  async getBookingAnalytics(): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageFare: number;
    surgePricingRevenue: number;
    popularRoutes: Array<{ route: string; count: number }>;
    peakHours: Array<{ hour: number; bookings: number }>;
  }> {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    
    const bookings: EnhancedBooking[] = [];
    snapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as EnhancedBooking);
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.dynamicFare, 0);
    const averageFare = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const surgePricingRevenue = bookings.reduce((sum, booking) => 
      sum + (booking.dynamicFare - booking.baseFare), 0
    );

    // Calculate popular routes
    const routeCounts: Record<string, number> = {};
    bookings.forEach(booking => {
      const route = `${booking.pickupLocation} → ${booking.dropoffLocation}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const popularRoutes = Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate peak hours
    const hourCounts: Record<number, number> = {};
    bookings.forEach(booking => {
      const hour = new Date(booking.pickupDateTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, bookings]) => ({ hour: parseInt(hour), bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return {
      totalBookings,
      totalRevenue,
      averageFare,
      surgePricingRevenue,
      popularRoutes,
      peakHours,
    };
  }
}

// Export singleton instance
export const enhancedBookingService = new EnhancedBookingService(); 