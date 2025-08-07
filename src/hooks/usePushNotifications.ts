'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pushNotificationService, type NotificationPayload, type UserNotificationSettings } from '@/lib/services/push-notification-service';
import { MessagePayload } from 'firebase/messaging';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isInitialized: boolean;
  isEnabled: boolean;
  currentToken: string | null;
  userSettings: UserNotificationSettings | null;
  initialize: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  updateSettings: (settings: Partial<UserNotificationSettings>) => Promise<void>;
  onNotificationReceived: (handler: (payload: MessagePayload) => void) => void;
  removeNotificationHandler: (handler: (payload: MessagePayload) => void) => void;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserNotificationSettings | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = pushNotificationService.isSupported();
    setIsSupported(supported);
  }, []);

  // Initialize push notifications
  const initialize = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const success = await pushNotificationService.initialize();
      setIsInitialized(success);
      
      if (success) {
        const token = pushNotificationService.getCurrentToken();
        setCurrentToken(token);
        setIsEnabled(!!token);
        
        // Save token for authenticated user
        if (user?.uid) {
          await pushNotificationService.saveUserToken(user.uid);
          await loadUserSettings();
        }
      }
      
      return success;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }, [isSupported, user?.uid]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsEnabled(granted);
      
      if (granted) {
        await initialize();
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported, initialize]);

  // Load user notification settings
  const loadUserSettings = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const settings = await pushNotificationService.getUserSettings(user.uid);
      setUserSettings(settings);
    } catch (error) {
      console.error('Failed to load user notification settings:', error);
    }
  }, [user?.uid]);

  // Update user notification settings
  const updateSettings = useCallback(async (settings: Partial<UserNotificationSettings>) => {
    if (!user?.uid) return;

    try {
      await pushNotificationService.updateUserSettings(user.uid, settings);
      await loadUserSettings(); // Reload settings
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }, [user?.uid, loadUserSettings]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!user?.uid) return;

    const testNotification: NotificationPayload = {
      title: 'Test Notification 🚗',
      body: 'This is a test push notification from Fairfield Airport Cars',
      icon: '/favicon.ico',
      data: {
        action: 'view_booking',
        bookingId: 'test'
      }
    };

    try {
      await pushNotificationService.sendToUser(user.uid, testNotification);
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }, [user?.uid]);

  // Handle notification received
  const onNotificationReceived = useCallback((handler: (payload: MessagePayload) => void) => {
    pushNotificationService.onMessageReceived(handler);
  }, []);

  // Remove notification handler
  const removeNotificationHandler = useCallback((handler: (payload: MessagePayload) => void) => {
    pushNotificationService.removeMessageHandler(handler);
  }, []);

  // Auto-initialize when user is authenticated
  useEffect(() => {
    if (user?.uid && isSupported && !isInitialized) {
      initialize();
    }
  }, [user?.uid, isSupported, isInitialized, initialize]);

  // Load user settings when user changes
  useEffect(() => {
    if (user?.uid) {
      loadUserSettings();
    }
  }, [user?.uid, loadUserSettings]);

  return {
    isSupported,
    isInitialized,
    isEnabled,
    currentToken,
    userSettings,
    initialize,
    requestPermission,
    sendTestNotification,
    updateSettings,
    onNotificationReceived,
    removeNotificationHandler
  };
} 