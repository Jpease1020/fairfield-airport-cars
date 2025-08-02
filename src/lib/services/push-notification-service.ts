interface PushNotificationConfig {
  vapidKey: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    messagingSenderId: string;
    appId: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface SubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private config: PushNotificationConfig;
  private messaging: any;

  constructor() {
    this.config = {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY || '',
      firebaseConfig: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
      }
    };

    this.initializeFirebase();
  }

  private async initializeFirebase() {
    if (typeof window !== 'undefined') {
      try {
        const { initializeApp } = await import('firebase/app');
        const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
        
        const app = initializeApp(this.config.firebaseConfig);
        this.messaging = getMessaging(app);

        // Request permission and get token
        this.requestPermission();
        
        // Handle foreground messages
        onMessage(this.messaging, (payload) => {
          this.handleForegroundMessage(payload);
        });
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.getToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token
  async getToken(): Promise<string | null> {
    if (!this.messaging) return null;

    try {
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(this.messaging, {
        vapidKey: this.config.vapidKey
      });
      
      // Store token in database for this user
      await this.storeToken(token);
      
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(
    userId: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notification: payload
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send notification to multiple users
  async sendNotificationToUsers(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send-bulk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds,
          notification: payload
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return false;
    }
  }

  // Send notification to topic (e.g., all airport customers)
  async sendNotificationToTopic(
    topic: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send-topic-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          notification: payload
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      return false;
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic: string): Promise<boolean> {
    if (!this.messaging) return false;

    try {
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(this.messaging, {
        vapidKey: this.config.vapidKey
      });

      const response = await fetch('/api/notifications/subscribe-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          topic
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    if (!this.messaging) return false;

    try {
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(this.messaging, {
        vapidKey: this.config.vapidKey
      });

      const response = await fetch('/api/notifications/unsubscribe-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          topic
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  // Handle foreground messages
  private handleForegroundMessage(payload: any) {
    const { title, body, icon, data } = payload.notification;
    
    // Show browser notification
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          data,
          requireInteraction: true
        });
      });
    }

    // Handle notification click
    this.handleNotificationClick(data);
  }

  // Handle notification click
  private handleNotificationClick(data: any) {
    if (data?.action) {
      switch (data.action) {
        case 'view_booking':
          window.location.href = `/tracking/${data.bookingId}`;
          break;
        case 'call_driver':
          window.open(`tel:${data.phone}`);
          break;
        case 'open_app':
          window.location.href = '/';
          break;
      }
    }
  }

  // Store token in database
  private async storeToken(token: string): Promise<void> {
    try {
      await fetch('/api/notifications/store-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Predefined notification templates
  static getNotificationTemplates() {
    return {
      bookingConfirmed: (bookingId: string): NotificationPayload => ({
        title: 'Booking Confirmed',
        body: 'Your airport transfer has been confirmed. We\'ll assign your driver shortly.',
        icon: '/favicon.ico',
        data: { action: 'view_booking', bookingId }
      }),

      driverAssigned: (driverName: string, bookingId: string): NotificationPayload => ({
        title: 'Driver Assigned',
        body: `${driverName} has been assigned to your ride.`,
        icon: '/favicon.ico',
        data: { action: 'view_booking', bookingId }
      }),

      driverEnRoute: (eta: string, bookingId: string): NotificationPayload => ({
        title: 'Driver En Route',
        body: `Your driver is on the way. ETA: ${eta}`,
        icon: '/favicon.ico',
        data: { action: 'view_booking', bookingId }
      }),

      driverArrived: (bookingId: string): NotificationPayload => ({
        title: 'Driver Arrived',
        body: 'Your driver has arrived at your pickup location.',
        icon: '/favicon.ico',
        data: { action: 'view_booking', bookingId }
      }),

      flightDelayed: (flightNumber: string, delay: number): NotificationPayload => ({
        title: 'Flight Delay Detected',
        body: `Flight ${flightNumber} is delayed by ${delay} minutes. We'll adjust your pickup time.`,
        icon: '/favicon.ico',
        data: { action: 'open_app' }
      }),

      rideCompleted: (bookingId: string): NotificationPayload => ({
        title: 'Ride Completed',
        body: 'Thank you for choosing Fairfield Airport Cars!',
        icon: '/favicon.ico',
        data: { action: 'view_booking', bookingId }
      })
    };
  }
}

export const pushNotificationService = new PushNotificationService(); 