import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

/**
 * Basic health check endpoint
 * Lightweight check for uptime monitoring services
 * For comprehensive checks, use /api/health/booking-flow
 */
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test Firebase connection (critical)
    let databaseStatus = 'operational';
    try {
      const db = getAdminDb();
      await db.collection('bookings').limit(1).get();
    } catch (error) {
      databaseStatus = 'failed';
    }

    const healthData = {
      status: databaseStatus === 'operational' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      services: {
        database: databaseStatus,
        payments: process.env.SQUARE_ACCESS_TOKEN ? 'configured' : 'not_configured',
        maps: process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY ? 'configured' : 'not_configured',
        sms: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
        calendar: process.env.GOOGLE_CALENDAR_TOKENS ? 'configured' : 'not_configured'
      }
    };

    return NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
} 