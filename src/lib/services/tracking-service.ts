import { realTimeTrackingService } from '@/lib/services/real-time-tracking-service';
import { firebaseTrackingService } from '@/lib/services/firebase-tracking-service';
import { driverLocationService } from '@/lib/services/driver-location-service';

export type {
  TrackingData,
  ETACalculation,
  DriverLocation,
} from '@/lib/services/firebase-tracking-service';

export const trackingService = {
  calculateEta: (bookingId: string, driverLocation: { lat: number; lng: number }) => {
    return realTimeTrackingService.calculateETA(bookingId, driverLocation);
  },
  firebase: firebaseTrackingService,
  driverLocation: driverLocationService,
};
