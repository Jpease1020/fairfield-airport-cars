import { 
  IPaymentService, 
  IDriverService, 
  INotificationService, 
  ITrackingService,
  IBookingService 
} from './interfaces';

// Import real services
import { createPaymentLink, createPayment, refundPayment } from './square-service';
import { 
  getDriver, 
  updateDriverLocation, 
  updateDriverStatus, 
  checkDriverAvailability, 
  assignDriverToBooking 
} from './driver-service';

import { 
  createBooking, 
  getBooking, 
  updateBooking, 
  cancelBooking, 
  getBookings, 
  assignDriverToBooking as assignDriverToBookingReal
} from './booking-service';

// Simplified Service Factory - No more demo mode complexity
export class ServiceFactory {
  // Payment Service Factory
  static getPaymentService(): IPaymentService {
    return {
      createPaymentLink,
      createPayment,
      refundPayment,
      verifyWebhook: async () => true // Placeholder - implement when needed
    };
  }

  // Driver Service Factory
  static getDriverService(): IDriverService {
    return {
      getDriver,
      updateDriverLocation,
      updateDriverStatus,
      checkDriverAvailability,
      getAvailableDrivers: async () => [], // Placeholder - implement when needed
      assignDriverToBooking
    };
  }

  // Notification Service Factory
  static getNotificationService(): INotificationService {
    return {
      sendSMS: async () => ({ success: false, error: 'SMS service not implemented' }),
      sendEmail: async () => ({ success: false, error: 'Email service not implemented' }),
      sendPushNotification: async () => ({ success: false, error: 'Push notification service not implemented' }),
      sendBookingConfirmation: async () => ({ success: false, error: 'Booking confirmation service not implemented' }),
      sendDriverAssignment: async () => ({ success: false, error: 'Driver assignment service not implemented' }),
      sendETAUpdate: async () => ({ success: false, error: 'ETA update service not implemented' })
    };
  }

  // Tracking Service Factory
  static getTrackingService(): ITrackingService {
    return {
      updateDriverLocation: async () => { throw new Error('Real tracking service not implemented'); },
      getDriverLocation: async () => null,
      getTrackingUpdates: async () => [],
      calculateRoute: async () => { throw new Error('Real tracking service not implemented'); },
      simulateDriverMovement: async () => { throw new Error('Real tracking service not implemented'); },
      getETA: async () => null
    };
  }

  // Booking Service Factory
  static getBookingService(): IBookingService {
    return {
      createBooking,
      getBooking,
      updateBooking,
      cancelBooking,
      getBookingsByUser: async () => [], // Placeholder - implement when needed
      getBookingsByDriver: async () => [], // Placeholder - implement when needed
      getAllBookings: getBookings,
      assignDriver: assignDriverToBookingReal,
      calculateFare: async () => 0 // Placeholder - implement when needed
    };
  }
}

// Convenience functions
export const getPaymentService = () => ServiceFactory.getPaymentService();
export const getDriverService = () => ServiceFactory.getDriverService();
export const getNotificationService = () => ServiceFactory.getNotificationService();
export const getTrackingService = () => ServiceFactory.getTrackingService();
export const getBookingService = () => ServiceFactory.getBookingService();
