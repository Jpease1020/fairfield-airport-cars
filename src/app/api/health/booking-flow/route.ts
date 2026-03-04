import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

/**
 * Comprehensive booking flow health check
 * Tests the complete booking pipeline without creating real bookings
 */
export async function GET() {
  const checks: Record<string, { status: 'pass' | 'fail' | 'warning'; message: string; duration?: number }> = {};
  const startTime = Date.now();

  try {
    // 1. Firebase Admin SDK Connection
    const firebaseStart = Date.now();
    try {
      const db = getAdminDb();
      // Test read access
      const testQuery = await db.collection('bookings').limit(1).get();
      checks.firebase = {
        status: 'pass',
        message: 'Firebase Admin SDK connected and accessible',
        duration: Date.now() - firebaseStart
      };
    } catch (error) {
      checks.firebase = {
        status: 'fail',
        message: `Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - firebaseStart
      };
    }

    // 2. Environment Variables Check
    const envVars = {
      // Payment (Square)
      SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
      SQUARE_LOCATION_ID: !!process.env.SQUARE_LOCATION_ID,
      SQUARE_WEBHOOK_SIGNATURE_KEY: !!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      // SMS (Twilio)
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_MESSAGING_SERVICE_SID: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
      // Email
      EMAIL_HOST: !!process.env.EMAIL_HOST,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      // Google
      NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY,
      GOOGLE_CALENDAR_TOKENS: !!process.env.GOOGLE_CALENDAR_TOKENS,
      // Firebase
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      // Base URL
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      // Chat assistant
      CHAT_BOOKING_ENABLED: !!process.env.CHAT_BOOKING_ENABLED,
      CHAT_BOOKING_PREVIEW_ENABLED: !!process.env.CHAT_BOOKING_PREVIEW_ENABLED,
      NEXT_PUBLIC_CHAT_BOOKING_ENABLED: !!process.env.NEXT_PUBLIC_CHAT_BOOKING_ENABLED,
      NEXT_PUBLIC_CHAT_BOOKING_PREVIEW_ENABLED: !!process.env.NEXT_PUBLIC_CHAT_BOOKING_PREVIEW_ENABLED,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    };

    const missingVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key);

    checks.environment = {
      status: missingVars.length === 0 ? 'pass' : missingVars.length <= 2 ? 'warning' : 'fail',
      message: missingVars.length === 0 
        ? 'All required environment variables are set'
        : `Missing variables: ${missingVars.join(', ')}`
    };

    // 3. Booking Service Functions (test imports)
    const bookingServiceStart = Date.now();
    try {
      const { createBookingAtomic, getBooking } = await import('@/lib/services/booking-service');
      checks.bookingService = {
        status: 'pass',
        message: 'Booking service functions accessible',
        duration: Date.now() - bookingServiceStart
      };
    } catch (error) {
      checks.bookingService = {
        status: 'fail',
        message: `Booking service import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - bookingServiceStart
      };
    }

    // 4. Payment Service Check (check if Square is configured)
    const paymentStart = Date.now();
    try {
      // Check if payment processing is available
      const hasSquareToken = !!process.env.SQUARE_ACCESS_TOKEN;
      checks.paymentService = {
        status: hasSquareToken ? 'pass' : 'warning',
        message: hasSquareToken ? 'Payment service configured' : 'Payment service not configured',
        duration: Date.now() - paymentStart
      };
    } catch (error) {
      checks.paymentService = {
        status: 'warning',
        message: `Payment service check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - paymentStart
      };
    }

    // 5. Email Service Check
    const emailStart = Date.now();
    try {
      const { sendConfirmationEmail } = await import('@/lib/services/email-service');
      checks.emailService = {
        status: 'pass',
        message: 'Email service accessible',
        duration: Date.now() - emailStart
      };
    } catch (error) {
      checks.emailService = {
        status: 'warning',
        message: `Email service check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - emailStart
      };
    }

    // 6. SMS Service Check (check if Twilio is configured)
    const smsStart = Date.now();
    try {
      const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
      checks.smsService = {
        status: hasTwilio ? 'pass' : 'warning',
        message: hasTwilio ? 'SMS service configured' : 'SMS service not configured',
        duration: Date.now() - smsStart
      };
    } catch (error) {
      checks.smsService = {
        status: 'warning',
        message: `SMS service check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - smsStart
      };
    }

    // 7. Google Calendar Service Check
    const calendarStart = Date.now();
    try {
      const { getStoredCalendarTokens } = await import('@/lib/services/google-calendar');
      const tokens = await getStoredCalendarTokens();
      checks.calendarService = {
        status: tokens ? 'pass' : 'warning',
        message: tokens ? 'Google Calendar tokens available' : 'Google Calendar tokens not configured',
        duration: Date.now() - calendarStart
      };
    } catch (error) {
      checks.calendarService = {
        status: 'warning',
        message: `Calendar service check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - calendarStart
      };
    }

    // 8. Database Collections Check
    const collectionsStart = Date.now();
    try {
      const db = getAdminDb();
      const collections = ['bookings', 'drivers', 'settings'];
      const collectionChecks = await Promise.allSettled(
        collections.map(async (collection) => {
          await db.collection(collection).limit(1).get();
          return collection;
        })
      );

      const failedCollections = collectionChecks
        .map((result, index) => result.status === 'rejected' ? collections[index] : null)
        .filter(Boolean);

      checks.databaseCollections = {
        status: failedCollections.length === 0 ? 'pass' : 'fail',
        message: failedCollections.length === 0
          ? 'All required collections accessible'
          : `Collections inaccessible: ${failedCollections.join(', ')}`,
        duration: Date.now() - collectionsStart
      };
    } catch (error) {
      checks.databaseCollections = {
        status: 'fail',
        message: `Database collections check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - collectionsStart
      };
    }

    // Calculate overall status
    const failedChecks = Object.values(checks).filter(c => c.status === 'fail').length;
    const warningChecks = Object.values(checks).filter(c => c.status === 'warning').length;
    
    const overallStatus = failedChecks > 0 ? 'unhealthy' : warningChecks > 2 ? 'degraded' : 'healthy';
    const httpStatus = failedChecks > 0 ? 503 : warningChecks > 2 ? 200 : 200;

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks,
      summary: {
        total: Object.keys(checks).length,
        passed: Object.values(checks).filter(c => c.status === 'pass').length,
        warnings: warningChecks,
        failed: failedChecks
      },
      totalDuration: Date.now() - startTime
    }, {
      status: httpStatus,
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
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: checks || {}
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
