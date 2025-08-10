import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';

interface PushNotificationRequest {
  token: string;
  notification: {
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
  };
}

export async function POST(request: NextRequest) {
  try {
    const { token, notification }: PushNotificationRequest = await request.json();

    if (!token || !notification?.title || !notification?.body) {
      return NextResponse.json(
        { error: 'Token, title, and body are required' },
        { status: 400 }
      );
    }

    // Prepare the message for Firebase Cloud Messaging
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico',
        tag: notification.tag || 'booking-notification',
      },
      data: notification.data || {},
      webPush: {
        headers: {
          'Urgency': 'high',
        },
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge || '/favicon.ico',
          tag: notification.tag || 'booking-notification',
          actions: [
            {
              action: 'view',
              title: 'View Details'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ],
          data: notification.data || {}
        }
      }
    };

    // Send the message
    const response = await getMessaging().send(message);
    
    console.log('✅ Push notification sent successfully:', response);
    
    return NextResponse.json({ 
      success: true, 
      messageId: response 
    });

  } catch (error) {
    console.error('Failed to send push notification:', error);
    
    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes('NotRegistered')) {
        return NextResponse.json(
          { error: 'Device token is not registered' },
          { status: 400 }
        );
      }
      if (error.message.includes('InvalidArgument')) {
        return NextResponse.json(
          { error: 'Invalid notification payload' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
} 