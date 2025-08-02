import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { flightTrackingService, FlightInfo } from './flight-tracking-service';

export interface NotificationSchedule {
  bookingId: string;
  customerPhone: string;
  customerEmail: string;
  pickupTime: Date;
  flightNumbers?: string[];
  notifications: {
    type: 'reminder' | 'flight-delay' | 'driver-en-route' | 'driver-arrived' | 'weather-alert';
    scheduledTime: Date;
    sent: boolean;
    message: string;
  }[];
}

export interface WeatherAlert {
  condition: 'clear' | 'rain' | 'snow' | 'storm';
  severity: 'low' | 'medium' | 'high';
  message: string;
  impactOnService: string;
}

class SmartNotificationService {
  private readonly REMINDER_TIMES = [
    { hours: 24, type: 'reminder', message: 'Your airport pickup is tomorrow' },
    { hours: 2, type: 'reminder', message: 'Your pickup is in 2 hours' },
    { hours: 0.5, type: 'reminder', message: 'Your pickup is in 30 minutes' }
  ];

  // Schedule all notifications for a booking
  async scheduleBookingNotifications(bookingId: string): Promise<void> {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) return;

      const notifications = this.createNotificationSchedule(booking);
      
      // Store notification schedule
      await this.saveNotificationSchedule(bookingId, notifications);
      
      // Schedule immediate notifications
      await this.scheduleImmediateNotifications(bookingId, notifications);
      
      console.log(`📅 Scheduled ${notifications.notifications.length} notifications for booking ${bookingId}`);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  // Create notification schedule for a booking
  private createNotificationSchedule(booking: any): NotificationSchedule {
    const pickupTime = new Date(booking.pickupDateTime);
    const notifications = [];

    // Add reminder notifications
    for (const reminder of this.REMINDER_TIMES) {
      const scheduledTime = new Date(pickupTime.getTime() - (reminder.hours * 60 * 60 * 1000));
      
      if (scheduledTime > new Date()) {
        notifications.push({
          type: reminder.type as any,
          scheduledTime,
          sent: false,
          message: reminder.message
        });
      }
    }

    // Add flight tracking notifications if flight numbers provided
    if (booking.flightNumbers && booking.flightNumbers.length > 0) {
      // Schedule flight check every 30 minutes starting 4 hours before pickup
      const flightCheckStart = new Date(pickupTime.getTime() - (4 * 60 * 60 * 1000));
      const now = new Date();
      
      if (flightCheckStart > now) {
        for (let i = 0; i < 8; i++) { // 8 checks over 4 hours
          const checkTime = new Date(flightCheckStart.getTime() + (i * 30 * 60 * 1000));
          if (checkTime > now) {
            notifications.push({
              type: 'flight-delay',
              scheduledTime: checkTime,
              sent: false,
              message: 'Checking flight status for delays'
            });
          }
        }
      }
    }

    return {
      bookingId: booking.id,
      customerPhone: booking.phone,
      customerEmail: booking.email,
      pickupTime,
      flightNumbers: booking.flightNumbers,
      notifications
    };
  }

  // Schedule immediate notifications
  private async scheduleImmediateNotifications(
    bookingId: string, 
    schedule: NotificationSchedule
  ): Promise<void> {
    const now = new Date();
    const immediateNotifications = schedule.notifications.filter(
      n => n.scheduledTime <= new Date(now.getTime() + (5 * 60 * 1000)) // Within 5 minutes
    );

    for (const notification of immediateNotifications) {
      await this.sendNotification(bookingId, notification);
    }
  }

  // Send a specific notification
  async sendNotification(bookingId: string, notification: any): Promise<void> {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) return;

      let message = notification.message;
      let shouldSend = true;

      // Handle different notification types
      switch (notification.type) {
        case 'flight-delay': {
          const flightUpdate = await this.checkFlightDelays(booking);
          if (flightUpdate.hasDelay) {
            message = `Flight delay detected: ${flightUpdate.message}`;
          } else {
            shouldSend = false; // Don't send if no delay
          }
          break;
        }

        case 'weather-alert': {
          const weatherAlert = await this.checkWeatherConditions(booking);
          if (weatherAlert.hasAlert) {
            message = weatherAlert.message;
          } else {
            shouldSend = false;
          }
          break;
        }

        case 'driver-en-route':
          message = `Your driver ${booking.driverName} is on the way to your pickup location. ETA: ${this.formatETA(booking.estimatedArrival)}`;
          break;

        case 'driver-arrived':
          message = `Your driver ${booking.driverName} has arrived at your pickup location. Please proceed to the designated pickup area.`;
          break;
      }

      if (shouldSend) {
        await this.sendCustomerNotification(booking, message);
        await this.markNotificationSent(bookingId, notification);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Check for flight delays
  private async checkFlightDelays(booking: any): Promise<{
    hasDelay: boolean;
    message: string;
    flights?: FlightInfo[];
  }> {
    if (!booking.flightNumbers || !flightTrackingService.isEnabled()) {
      return { hasDelay: false, message: '' };
    }

    try {
      const flights = await flightTrackingService.trackBookingFlights(
        booking.id,
        booking.flightNumbers
      );

      const delayedFlights = flights.filter(f => 
        f.status === 'delayed' && f.delayMinutes && f.delayMinutes > 15
      );

      if (delayedFlights.length > 0) {
        const flight = delayedFlights[0];
        return {
          hasDelay: true,
          message: `Flight ${flight.flightNumber} is delayed by ${flight.delayMinutes} minutes. We'll adjust your pickup time accordingly.`,
          flights
        };
      }

      return { hasDelay: false, message: '' };
    } catch (error) {
      console.error('Error checking flight delays:', error);
      return { hasDelay: false, message: '' };
    }
  }

  // Check weather conditions
  private async checkWeatherConditions(booking: any): Promise<{
    hasAlert: boolean;
    message: string;
  }> {
    try {
      // Simplified weather check - in production, integrate with weather API
      const weatherAlert = await this.getWeatherAlert(booking.pickupLocation);
      
      if (weatherAlert) {
        return {
          hasAlert: true,
          message: `Weather alert: ${weatherAlert.message}. ${weatherAlert.impactOnService}`
        };
      }

      return { hasAlert: false, message: '' };
    } catch (error) {
      console.error('Error checking weather conditions:', error);
      return { hasAlert: false, message: '' };
    }
  }

  // Get weather alert for location
  private async getWeatherAlert(location: string): Promise<WeatherAlert | null> {
    // Simplified weather detection - in production, use OpenWeatherMap API
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('snow') || locationLower.includes('storm')) {
      return {
        condition: 'snow',
        severity: 'high',
        message: 'Severe weather conditions expected',
        impactOnService: 'Your pickup may be delayed due to weather conditions.'
      };
    }

    if (locationLower.includes('rain')) {
      return {
        condition: 'rain',
        severity: 'medium',
        message: 'Rain expected during your pickup time',
        impactOnService: 'Please allow extra time for your pickup due to weather conditions.'
      };
    }

    return null;
  }

  // Send notification to customer
  private async sendCustomerNotification(booking: any, message: string): Promise<void> {
    try {
      // Send SMS
      if (booking.phone) {
        await fetch('/api/notifications/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: booking.phone,
            message: `Fairfield Airport Cars: ${message}`,
            bookingId: booking.id
          })
        });
      }

      // Send email
      if (booking.email) {
        await fetch('/api/notifications/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            subject: 'Booking Update',
            message
          })
        });
      }

      console.log(`📱 Sent notification to customer: ${message}`);
    } catch (error) {
      console.error('Error sending customer notification:', error);
    }
  }

  // Mark notification as sent
  private async markNotificationSent(bookingId: string, notification: any): Promise<void> {
    try {
      const scheduleRef = doc(db, 'notificationSchedules', bookingId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (scheduleDoc.exists()) {
        const schedule = scheduleDoc.data() as NotificationSchedule;
        const updatedNotifications = schedule.notifications.map(n => 
          n.scheduledTime.getTime() === notification.scheduledTime.getTime() 
            ? { ...n, sent: true }
            : n
        );

        await updateDoc(scheduleRef, {
          notifications: updatedNotifications,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error marking notification sent:', error);
    }
  }

  // Save notification schedule to database
  private async saveNotificationSchedule(
    bookingId: string, 
    schedule: NotificationSchedule
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'notificationSchedules', bookingId), {
        ...schedule,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving notification schedule:', error);
    }
  }

  // Get booking data
  private async getBooking(bookingId: string): Promise<any> {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      return bookingDoc.exists() ? { id: bookingId, ...bookingDoc.data() } : null;
    } catch (error) {
      console.error('Error getting booking:', error);
      return null;
    }
  }

  // Format ETA for display
  private formatETA(eta?: Date): string {
    if (!eta) return 'TBD';
    
    const now = new Date();
    const minutes = Math.round((eta.getTime() - now.getTime()) / (1000 * 60));
    
    if (minutes <= 0) return 'Arriving now';
    if (minutes < 60) return `${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  // Process scheduled notifications (called by cron job)
  async processScheduledNotifications(): Promise<void> {
    try {
      // Get all notification schedules
      const schedules = await this.getActiveNotificationSchedules();
      
      for (const schedule of schedules) {
        const now = new Date();
        const dueNotifications = schedule.notifications.filter(
          n => !n.sent && n.scheduledTime <= now
        );

        for (const notification of dueNotifications) {
          await this.sendNotification(schedule.bookingId, notification);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  // Get active notification schedules
  private async getActiveNotificationSchedules(): Promise<NotificationSchedule[]> {
    // This would query all active notification schedules
    // For now, return empty array - implement based on your database structure
    return [];
  }
}

export const smartNotificationService = new SmartNotificationService(); 