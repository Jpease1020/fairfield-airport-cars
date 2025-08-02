import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      console.warn('Firebase Admin configuration incomplete. Push notifications will not work.');
    } else {
      initializeApp({
        credential: credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'Missing userId or notification' },
        { status: 400 }
      );
    }

    // Check if Firebase is properly configured
    if (getApps().length === 0) {
      return NextResponse.json(
        { error: 'Push notification service not configured' },
        { status: 503 }
      );
    }

    // Get user's FCM token from database
    const userToken = await getUserFCMToken(userId);
    
    if (!userToken) {
      return NextResponse.json(
        { error: 'User not found or no FCM token' },
        { status: 404 }
      );
    }

    // Send push notification
    const message = {
      token: userToken,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico'
      },
      data: notification.data || {},
      android: {
        notification: {
          icon: notification.icon || '/favicon.ico',
          color: 'var(--color-primary-600)',
          priority: 'high' as const
        }
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default'
          }
        }
      },
      webpush: {
        notification: {
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge || '/favicon.ico',
          requireInteraction: true
        },
        fcm_options: {
          link: notification.data?.action === 'view_booking' 
            ? `/tracking/${notification.data.bookingId}`
            : '/'
        }
      }
    };

    const response = await getMessaging().send(message);

    return NextResponse.json({
      success: true,
      messageId: response,
      notification
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}

async function getUserFCMToken(_userId: string): Promise<string | null> {
  // This would fetch the user's FCM token from your database
  // For now, return a mock token
  return 'mock-fcm-token';
} 