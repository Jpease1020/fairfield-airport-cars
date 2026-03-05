'use client';

import { requestNotificationPermission } from './pwa';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Send notification to user
export const sendNotification = async (notification: NotificationData): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.warn('📱 Notifications: Permission denied');
    return;
  }

  if ('serviceWorker' in navigator && 'Notification' in window) {
    const registration = await navigator.serviceWorker.ready;
    type NotificationActionOption = {
      action: string;
      title: string;
      icon?: string;
    };

    const options: NotificationOptions & { actions?: NotificationActionOption[] } = {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/icon-72x72.png',
      data: notification.data,
      requireInteraction: true,
      tag: 'driver-update'
    };

    if (notification.actions && notification.actions.length > 0) {
      options.actions = notification.actions;
    }
    
    await registration.showNotification(notification.title, options);
  }
};

// Driver-specific notifications
export const sendDriverUpdateNotification = async (update: {
  type: 'assigned' | 'on_way' | 'arrived' | 'completed';
  driverName: string;
  bookingId: string;
  estimatedTime?: string;
}): Promise<void> => {
  const notifications = {
    assigned: {
      title: '🚗 Driver Assigned',
      body: `${update.driverName} has been assigned to your ride`,
      actions: [
        { action: 'view', title: 'View Booking' },
        { action: 'text', title: 'Text Driver' }
      ]
    },
    on_way: {
      title: '🚗 Driver On The Way',
      body: `${update.driverName} is on the way${update.estimatedTime ? ` (ETA: ${update.estimatedTime})` : ''}`,
      actions: [
        { action: 'track', title: 'Track Driver' },
        { action: 'text', title: 'Text Driver' }
      ]
    },
    arrived: {
      title: '🚗 Driver Has Arrived',
      body: `${update.driverName} has arrived at your location`,
      actions: [
        { action: 'view', title: 'View Booking' },
        { action: 'text', title: 'Text Driver' }
      ]
    },
    completed: {
      title: '✅ Ride Completed',
      body: `Your ride with ${update.driverName} has been completed`,
      actions: [
        { action: 'rate', title: 'Rate Driver' },
        { action: 'book_again', title: 'Book Again' }
      ]
    }
  };

  const notification = notifications[update.type];
  if (notification) {
    await sendNotification({
      ...notification,
      data: {
        type: update.type,
        driverName: update.driverName,
        bookingId: update.bookingId,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Booking-specific notifications
export const sendBookingNotification = async (type: 'confirmed' | 'cancelled' | 'updated', bookingData: any): Promise<void> => {
  const notifications = {
    confirmed: {
      title: '✅ Booking Confirmed',
      body: `Your airport ride is confirmed. Pickup time: ${bookingData.pickupDateTime}`,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'modify', title: 'Modify Booking' }
      ]
    },
    cancelled: {
      title: '❌ Booking Cancelled',
      body: 'Your booking has been cancelled',
      actions: [
        { action: 'book_again', title: 'Book Again' }
      ]
    },
    updated: {
      title: '📝 Booking Updated',
      body: 'Your booking details have been updated',
      actions: [
        { action: 'view', title: 'View Changes' }
      ]
    }
  };

  const notification = notifications[type];
  if (notification) {
    await sendNotification({
      ...notification,
      data: {
        type,
        bookingId: bookingData.id,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Test notification (for development)
export const sendTestNotification = async (): Promise<void> => {
  await sendNotification({
    title: '📱 PWA Test',
    body: 'This is a test notification from your PWA!',
    actions: [
      { action: 'test', title: 'Test Action' }
    ]
  });
};


