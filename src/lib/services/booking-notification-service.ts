/**
 * Booking notification service. Push notifications have been removed.
 * SMS and email are sent directly by callers (e.g. cancel-booking, process-payment).
 * These methods remain as no-ops for API compatibility.
 */
class BookingNotificationService {
  private static instance: BookingNotificationService;

  static getInstance(): BookingNotificationService {
    if (!BookingNotificationService.instance) {
      BookingNotificationService.instance = new BookingNotificationService();
    }
    return BookingNotificationService.instance;
  }

  async sendBookingConfirmation(_bookingId: string, _userId: string): Promise<void> {
    // Push removed; SMS/email sent by callers
  }

  async sendBookingReminder(_bookingId: string, _userId: string): Promise<void> {
    // Push removed
  }

  async sendDriverAssigned(_bookingId: string, _userId: string, _driverName: string): Promise<void> {
    // Push removed
  }

  async sendDriverEnRoute(_bookingId: string, _userId: string, _driverName: string, _eta: number): Promise<void> {
    // Push removed
  }

  async sendDriverArrived(_bookingId: string, _userId: string, _driverName: string): Promise<void> {
    // Push removed
  }

  async sendRideCompleted(_bookingId: string, _userId: string): Promise<void> {
    // Push removed
  }

  async sendBookingCancelled(_bookingId: string, _userId: string, _refundAmount?: number): Promise<void> {
    // Push removed; SMS/email sent by cancel-booking route
  }

  async sendFlightDelay(_bookingId: string, _userId: string, _flightNumber: string, _delayMinutes: number): Promise<void> {
    // Push removed
  }

  async sendFlightCancelled(_bookingId: string, _userId: string, _flightNumber: string): Promise<void> {
    // Push removed
  }

  async sendFlightEarly(_bookingId: string, _userId: string, _flightNumber: string, _earlyMinutes: number): Promise<void> {
    // Push removed
  }

  async sendBoardingStarted(_bookingId: string, _userId: string, _flightNumber: string): Promise<void> {
    // Push removed
  }
}

export const bookingNotificationService = BookingNotificationService.getInstance(); 