import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface DriverCredentials {
  licenseNumber: string;
  licenseExpiry: Date;
  backgroundCheckStatus: 'verified' | 'pending' | 'expired';
  backgroundCheckDate: Date;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: Date;
  vehicleInspectionDate: Date;
  cdlRequired: boolean;
  cdlNumber?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  capacity: number; // Number of passengers
  features: string[]; // ['wheelchair', 'child-seat', 'luxury', etc.]
  maintenanceHistory: {
    lastService: Date;
    nextService: Date;
    mileage: number;
  };
}

export interface DriverProfile {
  id: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  credentials: DriverCredentials;
  vehicle: VehicleInfo;
  rating: number;
  totalRides: number;
  yearsOfService: number;
  specialties: string[]; // ['airport', 'wheelchair', 'luxury', etc.]
  languages: string[];
  availability: {
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    daysOfWeek: number[]; // 0-6, Sunday = 0
    timezone: string;
  };
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  lastUpdated: Date;
}

class DriverProfileService {
  private readonly DRIVER_ID = 'gregg';

  async getDriverProfile(): Promise<DriverProfile | null> {
    try {
      const driverDoc = await getDoc(doc(db, 'drivers', this.DRIVER_ID));
      
      if (!driverDoc.exists()) {
        // Initialize default profile for Gregg
        const defaultProfile = this.getDefaultProfile();
        await this.createDriverProfile(defaultProfile);
        return defaultProfile;
      }

      return driverDoc.data() as DriverProfile;
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      return null;
    }
  }

  async updateDriverProfile(updates: Partial<DriverProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'drivers', this.DRIVER_ID), {
        ...updates,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating driver profile:', error);
      throw error;
    }
  }

  async updateLocation(lat: number, lng: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'drivers', this.DRIVER_ID), {
        currentLocation: {
          lat,
          lng,
          timestamp: new Date(),
        },
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  async updateStatus(status: DriverProfile['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'drivers', this.DRIVER_ID), {
        status,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  private getDefaultProfile(): DriverProfile {
    return {
      id: this.DRIVER_ID,
      name: 'Gregg',
      photo: '/public/logos/fairfield_logo.png', // Default to company logo
      phone: '(203) 555-0123',
      email: 'gregg@fairfieldairportcars.com',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '(203) 555-0124',
        relationship: 'Manager',
      },
      credentials: {
        licenseNumber: 'CT123456789',
        licenseExpiry: new Date('2025-12-31'),
        backgroundCheckStatus: 'verified',
        backgroundCheckDate: new Date('2024-01-15'),
        insuranceProvider: 'State Farm',
        insurancePolicyNumber: 'SF-123456789',
        insuranceExpiry: new Date('2025-06-30'),
        vehicleInspectionDate: new Date('2024-03-15'),
        cdlRequired: false,
      },
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'CT-ABC123',
        vin: '1HGBH41JXMN109186',
        capacity: 4,
        features: ['child-seat', 'wheelchair-accessible'],
        maintenanceHistory: {
          lastService: new Date('2024-02-15'),
          nextService: new Date('2024-05-15'),
          mileage: 25000,
        },
      },
      rating: 4.9,
      totalRides: 1250,
      yearsOfService: 3,
      specialties: ['airport', 'wheelchair', 'reliable'],
      languages: ['English'],
      availability: {
        startTime: '06:00',
        endTime: '22:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
        timezone: 'America/New_York',
      },
      status: 'available',
      lastUpdated: new Date(),
    };
  }

  private async createDriverProfile(profile: DriverProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'drivers', this.DRIVER_ID), {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating driver profile:', error);
      throw error;
    }
  }

  // Trust-building methods
  async getTrustIndicators(): Promise<{
    verifiedDriver: boolean;
    backgroundChecked: boolean;
    insured: boolean;
    vehicleInspected: boolean;
    rating: number;
    totalRides: number;
    yearsOfService: number;
  } | null> {
    const profile = await this.getDriverProfile();
    if (!profile) return null;

    return {
      verifiedDriver: profile.credentials.backgroundCheckStatus === 'verified',
      backgroundChecked: profile.credentials.backgroundCheckStatus === 'verified',
      insured: new Date() < profile.credentials.insuranceExpiry,
      vehicleInspected: new Date() < profile.vehicle.maintenanceHistory.nextService,
      rating: profile.rating,
      totalRides: profile.totalRides,
      yearsOfService: profile.yearsOfService,
    };
  }

  async isAvailable(): Promise<boolean> {
    const profile = await this.getDriverProfile();
    if (!profile) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const currentDay = now.getDay();

    return (
      profile.status === 'available' &&
      profile.availability.daysOfWeek.includes(currentDay) &&
      currentTime >= profile.availability.startTime &&
      currentTime <= profile.availability.endTime
    );
  }
}

export const driverProfileService = new DriverProfileService(); 