import { NextRequest, NextResponse } from 'next/server';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { to, bookingId } = await request.json();
    
    if (!to) {
      return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 });
    }

    console.log('🧪 [TEST EMAIL] Sending test booking verification email...');
    console.log(`   To: ${to}`);
    console.log(`   Booking ID: ${bookingId || 'TEST-' + Date.now()}`);

    // Create a mock booking for testing
    const mockBooking = {
      id: bookingId || 'TEST-' + Date.now(),
      customer: {
        name: 'Test Customer',
        email: to,
      },
      trip: {
        pickup: {
          address: '30 Shut Rd, Newtown, CT 06470, USA',
        },
        dropoff: {
          address: 'John F. Kennedy International Airport',
        },
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      },
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/booking/confirm?bookingId=${mockBooking.id}&token=test-token-12345`;

    await sendBookingVerificationEmail(mockBooking as any, confirmationUrl);
    
    console.log('✅ [TEST EMAIL] Booking verification email sent successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Booking verification email sent successfully',
      bookingId: mockBooking.id,
      confirmationUrl
    });
  } catch (error) {
    console.error('❌ [TEST EMAIL] Failed to send booking verification email:', error);
    
    // Provide more detailed error information
    let errorDetails = error instanceof Error ? error.message : String(error);
    let errorCode = 'UNKNOWN_ERROR';
    
    if (errorDetails.includes('535') || errorDetails.includes('BadCredentials')) {
      errorCode = 'AUTH_FAILED';
      errorDetails = 'Email authentication failed. This could be due to:\n' +
        '1. Google temporarily blocking access (check Google Account security alerts)\n' +
        '2. App password expired or revoked\n' +
        '3. Account security settings changed\n' +
        '4. Rate limiting from too many requests\n\n' +
        'Check Vercel function logs for more details.';
    } else if (errorDetails.includes('ETIMEDOUT') || errorDetails.includes('timeout')) {
      errorCode = 'CONNECTION_TIMEOUT';
      errorDetails = 'Connection to email server timed out. The email service may be temporarily unavailable.';
    } else if (errorDetails.includes('ECONNREFUSED')) {
      errorCode = 'CONNECTION_REFUSED';
      errorDetails = 'Email server refused connection. Check EMAIL_HOST and EMAIL_PORT settings.';
    }
    
    return NextResponse.json({ 
      error: 'Failed to send booking verification email',
      errorCode,
      details: errorDetails,
      troubleshooting: {
        checkVercelLogs: 'Check Vercel function logs for detailed SMTP error messages',
        verifyEnvVars: 'Verify EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS are set correctly in Vercel',
        checkGoogleAccount: 'If using Gmail, check Google Account security for blocked access attempts',
        tryAgainLater: 'Wait a few minutes and try again - Google may have temporarily blocked access'
      }
    }, { status: 500 });
  }
}
