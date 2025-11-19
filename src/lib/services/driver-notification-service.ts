/**
 * Driver Notification Service
 * 
 * Sends push notifications to drivers when bookings are created or updated.
 */

import { getAdminDb } from '@/lib/utils/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

const DRIVER_ID = 'gregg-driver-001'; // Gregg's driver ID

interface BookingNotificationData {
  bookingId: string;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: string;
  fare: number;
}

/**
 * Get driver's push notification token
 * Tokens are stored in user_tokens collection with driver ID as the document ID
 */
async function getDriverToken(): Promise<string | null> {
  try {
    const db = getAdminDb();
    const tokenDoc = await db.collection('user_tokens').doc(DRIVER_ID).get();
    
    if (tokenDoc.exists) {
      const data = tokenDoc.data();
      return data?.token || null;
    }
    
    console.warn(`⚠️ No push notification token found for driver ${DRIVER_ID}`);
    return null;
  } catch (error) {
    console.error('Failed to get driver token:', error);
    return null;
  }
}

/**
 * Send push notification to driver about new booking
 */
export async function notifyDriverOfNewBooking(data: BookingNotificationData): Promise<void> {
  try {
    const token = await getDriverToken();
    
    if (!token) {
      console.warn(`⚠️ Cannot send notification to driver ${DRIVER_ID} - no token registered`);
      console.warn('💡 Driver needs to register for push notifications on their device');
      return;
    }

    const pickupDate = new Date(data.pickupDateTime);
    const formattedDate = pickupDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const message = {
      token,
      notification: {
        title: '🚗 New Booking Received',
        body: `${data.customerName} - ${formattedDate} - $${data.fare.toFixed(2)}`
      },
      data: {
        type: 'new_booking',
        bookingId: data.bookingId,
        customerName: data.customerName,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        pickupDateTime: data.pickupDateTime,
        fare: data.fare.toString(),
        url: `/admin/bookings?bookingId=${data.bookingId}`
      },
      webPush: {
        headers: {
          'Urgency': 'high'
        },
        notification: {
          title: '🚗 New Booking Received',
          body: `${data.customerName} - ${formattedDate} - $${data.fare.toFixed(2)}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'new-booking',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Booking'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1
          }
        }
      }
    };

    const messaging = getMessaging();
    const messageId = await messaging.send(message);
    
    console.log(`✅ Push notification sent to driver ${DRIVER_ID}:`, messageId);
    console.log(`   Booking: ${data.bookingId}`);
    console.log(`   Customer: ${data.customerName}`);
    console.log(`   Pickup: ${data.pickupAddress}`);
    
  } catch (error: any) {
    // Don't fail booking creation if notification fails
    console.error('❌ Failed to send push notification to driver:', error);
    
    // Check if it's a token error (token invalid/expired)
    if (error?.code === 'messaging/invalid-registration-token' || 
        error?.code === 'messaging/registration-token-not-registered') {
      console.warn(`⚠️ Driver token is invalid or expired. Driver needs to re-register for notifications.`);
    }
  }
}

/**
 * Send push notification to driver about booking update
 */
export async function notifyDriverOfBookingUpdate(
  bookingId: string,
  updateType: 'confirmed' | 'cancelled' | 'modified',
  details?: string
): Promise<void> {
  try {
    const token = await getDriverToken();
    
    if (!token) {
      return; // Silently fail if no token
    }

    const titles = {
      confirmed: '✅ Booking Confirmed',
      cancelled: '❌ Booking Cancelled',
      modified: '📝 Booking Modified'
    };

    const message = {
      token,
      notification: {
        title: titles[updateType],
        body: details || `Booking ${bookingId} has been ${updateType}`
      },
      data: {
        type: `booking_${updateType}`,
        bookingId,
        url: `/admin/bookings?bookingId=${bookingId}`
      }
    };

    const messaging = getMessaging();
    await messaging.send(message);
    
    console.log(`✅ Booking update notification sent to driver: ${updateType}`);
  } catch (error) {
    console.error('Failed to send booking update notification:', error);
  }
}


