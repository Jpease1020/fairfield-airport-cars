import { pushNotificationService } from './push-notification-service';
import { getBooking } from './booking-service';
import { getPickupAddress, getDropoffAddress, getPickupDateTime, parseBookingDate } from '@/utils/booking-helpers';

class BookingNotificationService {
  private static instance: BookingNotificationService;

  static getInstance(): BookingNotificationService {
    if (!BookingNotificationService.instance) {
      BookingNotificationService.instance = new BookingNotificationService();
    }
    return BookingNotificationService.instance;
  }

  async sendBookingConfirmation(bookingId: string, userId: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      const pickupDate = parseBookingDate(getPickupDateTime(booking));
      const pickupTime = pickupDate ? pickupDate.toLocaleString() : 'TBD';

      await pushNotificationService.sendToUser(userId, {
        title: 'Booking Confirmed! 🚗',
        body: `Your ride from ${getPickupAddress(booking)} to ${getDropoffAddress(booking)} is confirmed for ${pickupTime}`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'view_booking',
          url: `/bookings/${bookingId}`
        }
      });

      console.log('✅ Booking confirmation push notification sent');
    } catch (error) {
      console.error('Failed to send booking confirmation push notification:', error);
    }
  }

  async sendBookingReminder(bookingId: string, userId: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      const pickupDate = parseBookingDate(getPickupDateTime(booking));
      const pickupTime = pickupDate ? pickupDate.toLocaleString() : 'TBD';

      await pushNotificationService.sendToUser(userId, {
        title: 'Reminder: Your Ride Tomorrow 🚗',
        body: `Don't forget your airport ride tomorrow at ${pickupTime}. Safe travels!`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'view_booking',
          url: `/bookings/${bookingId}`
        }
      });

      console.log('✅ Booking reminder push notification sent');
    } catch (error) {
      console.error('Failed to send booking reminder push notification:', error);
    }
  }

  async sendDriverAssigned(bookingId: string, userId: string, driverName: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Driver Assigned! 🚗',
        body: `${driverName} will be your driver for your ride from ${getPickupAddress(booking)}`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'driver_status',
          url: `/tracking/${bookingId}`,
          driverName
        }
      });

      console.log('✅ Driver assigned push notification sent');
    } catch (error) {
      console.error('Failed to send driver assigned push notification:', error);
    }
  }

  async sendDriverEnRoute(bookingId: string, userId: string, driverName: string, eta: number): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Driver is on the way! 🚗',
        body: `${driverName} is en route and will arrive in approximately ${eta} minutes`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'driver_status',
          url: `/tracking/${bookingId}`,
          driverName,
          eta
        }
      });

      console.log('✅ Driver en route push notification sent');
    } catch (error) {
      console.error('Failed to send driver en route push notification:', error);
    }
  }

  async sendDriverArrived(bookingId: string, userId: string, driverName: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Driver has arrived! 🚗',
        body: `${driverName} has arrived at ${getPickupAddress(booking)}. Safe travels!`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'driver_status',
          url: `/tracking/${bookingId}`,
          driverName
        }
      });

      console.log('✅ Driver arrived push notification sent');
    } catch (error) {
      console.error('Failed to send driver arrived push notification:', error);
    }
  }

  async sendRideCompleted(bookingId: string, userId: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Ride Completed! 🚗',
        body: 'Thank you for choosing Fairfield Airport Car Service. We hope you enjoyed your ride!',
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'view_booking',
          url: `/feedback/${bookingId}`
        }
      });

      console.log('✅ Ride completed push notification sent');
    } catch (error) {
      console.error('Failed to send ride completed push notification:', error);
    }
  }

  async sendBookingCancelled(bookingId: string, userId: string, refundAmount?: number): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      const refundMessage = refundAmount && refundAmount > 0 
        ? ` We have refunded $${refundAmount.toFixed(2)} of your deposit.`
        : ' Your deposit is non-refundable at this time.';

      await pushNotificationService.sendToUser(userId, {
        title: 'Booking Cancelled 🚗',
        body: `Your ride scheduled for ${parseBookingDate(getPickupDateTime(booking))?.toLocaleString() ?? 'TBD'} has been cancelled.${refundMessage}`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'view_booking',
          url: `/bookings/${bookingId}`
        }
      });

      console.log('✅ Booking cancelled push notification sent');
    } catch (error) {
      console.error('Failed to send booking cancelled push notification:', error);
    }
  }

  async sendFlightDelay(bookingId: string, userId: string, flightNumber: string, delayMinutes: number): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Flight Delay Detected ✈️',
        body: `Your flight ${flightNumber} is delayed ${delayMinutes} minutes. Would you like to adjust your pickup time?`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'flight_update',
          url: `/manage/${bookingId}`,
          flightNumber,
          delayMinutes
        }
      });

      console.log('✅ Flight delay push notification sent');
    } catch (error) {
      console.error('Failed to send flight delay push notification:', error);
    }
  }

  async sendFlightCancelled(bookingId: string, userId: string, flightNumber: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Flight Cancelled ✈️',
        body: `Your flight ${flightNumber} has been cancelled. Please contact us to reschedule your ride.`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'flight_update',
          url: `/manage/${bookingId}`,
          flightNumber
        }
      });

      console.log('✅ Flight cancelled push notification sent');
    } catch (error) {
      console.error('Failed to send flight cancelled push notification:', error);
    }
  }

  async sendFlightEarly(bookingId: string, userId: string, flightNumber: string, earlyMinutes: number): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Flight Early ✈️',
        body: `Your flight ${flightNumber} is ${earlyMinutes} minutes early. Would you like to adjust your pickup time?`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'flight_update',
          url: `/manage/${bookingId}`,
          flightNumber,
          earlyMinutes
        }
      });

      console.log('✅ Flight early push notification sent');
    } catch (error) {
      console.error('Failed to send flight early push notification:', error);
    }
  }

  async sendBoardingStarted(bookingId: string, userId: string, flightNumber: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return;

      await pushNotificationService.sendToUser(userId, {
        title: 'Boarding Started ✈️',
        body: `Boarding has started for flight ${flightNumber}. Your driver will be ready for pickup.`,
        icon: '/favicon.ico',
        data: {
          bookingId,
          action: 'flight_update',
          url: `/tracking/${bookingId}`,
          flightNumber
        }
      });

      console.log('✅ Boarding started push notification sent');
    } catch (error) {
      console.error('Failed to send boarding started push notification:', error);
    }
  }
}

export const bookingNotificationService = BookingNotificationService.getInstance(); 