/**
 * Driver Push Token Registration
 * 
 * Allows drivers (specifically Gregg) to register their push notification token
 * so they can receive notifications when bookings are created.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

const DRIVER_ID = 'gregg-driver-001';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Save token to user_tokens collection with driver ID as document ID
    const db = getAdminDb();
    await db.collection('user_tokens').doc(DRIVER_ID).set({
      token: token,
      userId: DRIVER_ID,
      driverId: DRIVER_ID,
      createdAt: new Date(),
      lastUpdated: new Date(),
      deviceType: 'web', // Could be enhanced to detect mobile
      registeredAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Driver push token registered: ${DRIVER_ID}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    return NextResponse.json({
      success: true,
      message: 'Push notification token registered successfully',
      driverId: DRIVER_ID
    });

  } catch (error) {
    console.error('Failed to register driver push token:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}

/**
 * Get driver's push token status
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const tokenDoc = await db.collection('user_tokens').doc(DRIVER_ID).get();

    if (tokenDoc.exists) {
      const data = tokenDoc.data();
      return NextResponse.json({
        success: true,
        registered: true,
        lastUpdated: data?.lastUpdated,
        hasToken: !!data?.token
      });
    }

    return NextResponse.json({
      success: true,
      registered: false,
      message: 'No push token registered yet'
    });

  } catch (error) {
    console.error('Failed to get driver push token status:', error);
    return NextResponse.json(
      { error: 'Failed to get token status' },
      { status: 500 }
    );
  }
}


