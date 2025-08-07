import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { adminServices } from '@/lib/utils/firebase-admin';

interface BroadcastNotificationRequest {
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: {
      action?: 'announcement' | 'maintenance' | 'update';
      url?: string;
      [key: string]: any;
    };
  };
  topic?: string; // Optional topic for targeted broadcasts
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase is properly initialized
    try {
      getMessaging();
    } catch (error) {
      console.error('Firebase not initialized:', error);
      return NextResponse.json(
        { error: 'Firebase service not available' },
        { status: 503 }
      );
    }

    const { notification, topic }: BroadcastNotificationRequest = await request.json();

    if (!notification?.title || !notification?.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Prepare the message for Firebase Cloud Messaging
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico',
        tag: notification.tag || 'broadcast-notification',
      },
      data: notification.data || {},
      webPush: {
        headers: {
          'Urgency': 'normal',
        },
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge || '/favicon.ico',
          tag: notification.tag || 'broadcast-notification',
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

    let response;

    if (topic) {
      // Send to topic subscribers
      response = await getMessaging().send({
        ...message,
        topic
      });
      console.log(`✅ Broadcast notification sent to topic: ${topic}`);
    } else {
      // Send to all users (get all tokens from Firestore)
      const tokensSnapshot = await adminServices.firestore
        .collection('user_tokens')
        .get();

      const tokens = tokensSnapshot.docs.map((doc: any) => doc.data().token).filter(Boolean);

      if (tokens.length === 0) {
        return NextResponse.json(
          { error: 'No registered devices found' },
          { status: 404 }
        );
      }

      // Send to multiple tokens (Firebase allows up to 500 tokens per request)
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        batches.push(batch);
      }

      const responses = await Promise.all(
        batches.map(batch => 
          getMessaging().sendEachForMulticast({
            ...message,
            tokens: batch
          })
        )
      );

      const successCount = responses.reduce((total: number, response: any) => total + response.successCount, 0);
      const failureCount = responses.reduce((total: number, response: any) => total + response.failureCount, 0);

      console.log(`✅ Broadcast notification sent to ${successCount} devices, ${failureCount} failed`);

      response = {
        successCount,
        failureCount,
        totalCount: tokens.length
      };
    }

    return NextResponse.json({ 
      success: true, 
      response 
    });

  } catch (error) {
    console.error('Failed to send broadcast notification:', error);
    
    return NextResponse.json(
      { error: 'Failed to send broadcast notification' },
      { status: 500 }
    );
  }
} 