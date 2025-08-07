'use client';

import { messaging } from '@/lib/utils/firebase';
import { 
  getToken, 
  onMessage, 
  isSupported,
  MessagePayload 
} from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    bookingId?: string;
    action?: 'view_booking' | 'update_pickup' | 'driver_status' | 'flight_update';
    url?: string;
    [key: string]: any;
  };
}

interface UserNotificationSettings {
  pushEnabled: boolean;
  bookingConfirmations: boolean;
  driverUpdates: boolean;
  flightUpdates: boolean;
  reminders: boolean;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private currentToken: string | null = null;
  private messageHandlers: ((payload: MessagePayload) => void)[] = [];

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if messaging is supported
      const isMessagingSupported = await isSupported();
      if (!isMessagingSupported) {
        console.warn('Firebase Messaging is not supported in this environment');
        return false;
      }

      if (!messaging) {
        console.warn('Firebase Messaging not initialized');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Get token
      this.currentToken = await this.getDeviceToken();
      
      // Set up message listener
      this.setupMessageListener();

      this.isInitialized = true;
      console.log('✅ Push notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  private async getDeviceToken(): Promise<string | null> {
    try {
      if (!messaging) return null;

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });

      console.log('Device token obtained:', token ? 'Success' : 'Failed');
      return token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  private setupMessageListener(): void {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('📱 Push notification received:', payload);
      
      // Show notification
      this.showNotification(payload);
      
      // Call registered handlers
      this.messageHandlers.forEach(handler => handler(payload));
    });
  }

  private showNotification(payload: MessagePayload): void {
    const { title, body, icon } = payload.notification || {};
    
    if (!title || !body) return;

    // Show browser notification
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.data?.tag || 'booking-notification',
          data: payload.data
        });
      });
    }
  }

  async saveUserToken(userId: string): Promise<void> {
    if (!this.currentToken) return;

    try {
      await setDoc(doc(db, 'user_tokens', userId), {
        token: this.currentToken,
        userId,
        createdAt: new Date(),
        lastUpdated: new Date()
      }, { merge: true });

      console.log('✅ User token saved for:', userId);
    } catch (error) {
      console.error('Failed to save user token:', error);
    }
  }

  async getUserToken(userId: string): Promise<string | null> {
    try {
      const tokenDoc = await getDoc(doc(db, 'user_tokens', userId));
      if (tokenDoc.exists()) {
        return tokenDoc.data()?.token || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user token:', error);
      return null;
    }
  }

  async sendToUser(userId: string, notification: NotificationPayload): Promise<void> {
    try {
      const token = await this.getUserToken(userId);
      if (!token) {
        console.warn('No token found for user:', userId);
        return;
      }

      // Send via API endpoint
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          notification
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send push notification: ${response.statusText}`);
      }

      console.log('✅ Push notification sent to user:', userId);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  async sendToAll(notification: NotificationPayload): Promise<void> {
    try {
      const response = await fetch('/api/notifications/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification })
      });

      if (!response.ok) {
        throw new Error(`Failed to send broadcast notification: ${response.statusText}`);
      }

      console.log('✅ Broadcast notification sent');
    } catch (error) {
      console.error('Failed to send broadcast notification:', error);
    }
  }

  onMessageReceived(handler: (payload: MessagePayload) => void): void {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (payload: MessagePayload) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  async updateUserSettings(userId: string, settings: Partial<UserNotificationSettings>): Promise<void> {
    try {
      await setDoc(doc(db, 'user_notification_settings', userId), {
        userId,
        ...settings,
        lastUpdated: new Date()
      }, { merge: true });

      console.log('✅ User notification settings updated for:', userId);
    } catch (error) {
      console.error('Failed to update user notification settings:', error);
    }
  }

  async getUserSettings(userId: string): Promise<UserNotificationSettings | null> {
    try {
      const settingsDoc = await getDoc(doc(db, 'user_notification_settings', userId));
      if (settingsDoc.exists()) {
        return settingsDoc.data() as UserNotificationSettings;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user notification settings:', error);
      return null;
    }
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
export type { NotificationPayload, UserNotificationSettings }; 