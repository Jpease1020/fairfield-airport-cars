/**
 * Shared health check logic for admin and booking-flow.
 * Returns checks and summary; does not perform HTTP response.
 */

import { getAdminDb } from '@/lib/utils/firebase-admin';

export type CheckStatus = 'pass' | 'fail' | 'warning';
export type HealthCheck = { status: CheckStatus; message: string; duration?: number };

export type HealthResult = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  checks: Record<string, HealthCheck>;
  summary: { total: number; passed: number; warnings: number; failed: number };
  totalDuration: number;
};

export async function runHealthChecks(): Promise<HealthResult> {
  const checks: Record<string, HealthCheck> = {};
  const startTime = Date.now();

  // 1. Firebase
  const firebaseStart = Date.now();
  try {
    const db = getAdminDb();
    await db.collection('bookings').limit(1).get();
    checks.firebase = { status: 'pass', message: 'Firebase Admin SDK connected', duration: Date.now() - firebaseStart };
  } catch (error) {
    checks.firebase = { status: 'fail', message: `Firebase failed: ${error instanceof Error ? error.message : 'Unknown'}`, duration: Date.now() - firebaseStart };
  }

  // 2. Environment
  const envVars: Record<string, boolean> = {
    SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
    SQUARE_LOCATION_ID: !!process.env.SQUARE_LOCATION_ID,
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_MESSAGING_SERVICE_SID: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
    EMAIL_HOST: !!process.env.EMAIL_HOST,
    EMAIL_USER: !!process.env.EMAIL_USER,
    NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY,
    GOOGLE_CALENDAR_TOKENS: !!process.env.GOOGLE_CALENDAR_TOKENS,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
  };
  const missing = Object.entries(envVars).filter(([, v]) => !v).map(([k]) => k);
  checks.environment = {
    status: missing.length === 0 ? 'pass' : missing.length <= 2 ? 'warning' : 'fail',
    message: missing.length === 0 ? 'All required env vars set' : `Missing: ${missing.join(', ')}`,
  };

  // 3. Booking service
  const bookingStart = Date.now();
  try {
    await import('@/lib/services/booking-service');
    checks.bookingService = { status: 'pass', message: 'Booking service OK', duration: Date.now() - bookingStart };
  } catch (error) {
    checks.bookingService = { status: 'fail', message: `Booking service: ${error instanceof Error ? error.message : 'Unknown'}`, duration: Date.now() - bookingStart };
  }

  // 4. Payment (Square)
  checks.paymentService = {
    status: process.env.SQUARE_ACCESS_TOKEN ? 'pass' : 'warning',
    message: process.env.SQUARE_ACCESS_TOKEN ? 'Square configured' : 'Square not configured',
  };

  // 5. Email
  const emailStart = Date.now();
  try {
    await import('@/lib/services/email-service');
    checks.emailService = { status: 'pass', message: 'Email service OK', duration: Date.now() - emailStart };
  } catch (error) {
    checks.emailService = { status: 'warning', message: `Email: ${error instanceof Error ? error.message : 'Unknown'}`, duration: Date.now() - emailStart };
  }

  // 6. SMS (Twilio)
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  checks.smsService = { status: hasTwilio ? 'pass' : 'warning', message: hasTwilio ? 'Twilio configured' : 'Twilio not configured' };

  // 7. Calendar
  const calStart = Date.now();
  try {
    const { getStoredCalendarTokens } = await import('@/lib/services/google-calendar');
    const tokens = await getStoredCalendarTokens();
    checks.calendarService = { status: tokens ? 'pass' : 'warning', message: tokens ? 'Calendar tokens OK' : 'Calendar not configured', duration: Date.now() - calStart };
  } catch (error) {
    checks.calendarService = { status: 'warning', message: `Calendar: ${error instanceof Error ? error.message : 'Unknown'}`, duration: Date.now() - calStart };
  }

  // 8. Collections
  const collStart = Date.now();
  try {
    const db = getAdminDb();
    const collections = ['bookings', 'config'];
    const results = await Promise.allSettled(collections.map((c) => db.collection(c).limit(1).get()));
    const failed = results.map((r, i) => (r.status === 'rejected' ? collections[i] : null)).filter(Boolean) as string[];
    checks.databaseCollections = {
      status: failed.length === 0 ? 'pass' : 'fail',
      message: failed.length === 0 ? 'Collections OK' : `Inaccessible: ${failed.join(', ')}`,
      duration: Date.now() - collStart,
    };
  } catch (error) {
    checks.databaseCollections = { status: 'fail', message: `Collections: ${error instanceof Error ? error.message : 'Unknown'}`, duration: Date.now() - collStart };
  }

  const failed = Object.values(checks).filter((c) => c.status === 'fail').length;
  const warnings = Object.values(checks).filter((c) => c.status === 'warning').length;
  const status: HealthResult['status'] = failed > 0 ? 'unhealthy' : warnings > 2 ? 'degraded' : 'healthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks,
    summary: {
      total: Object.keys(checks).length,
      passed: Object.values(checks).filter((c) => c.status === 'pass').length,
      warnings,
      failed,
    },
    totalDuration: Date.now() - startTime,
  };
}
