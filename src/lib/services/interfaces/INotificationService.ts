export interface SMSNotification {
  to: string;
  message: string;
  bookingId?: string;
  timestamp?: Date;
}

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  bookingId?: string;
  template?: string;
  timestamp?: Date;
}

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp?: Date;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationService {
  sendSMS(notification: SMSNotification): Promise<NotificationResult>;
  sendEmail(notification: EmailNotification): Promise<NotificationResult>;
  sendPushNotification(notification: PushNotification): Promise<NotificationResult>;
  sendBookingConfirmation(bookingId: string, userEmail: string, userPhone?: string): Promise<NotificationResult>;
  sendDriverAssignment(bookingId: string, driverPhone: string): Promise<NotificationResult>;
  sendETAUpdate(bookingId: string, userPhone: string, eta: string): Promise<NotificationResult>;
}
