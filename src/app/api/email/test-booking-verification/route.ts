import { NextRequest, NextResponse } from 'next/server';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json({ 
      error: 'Failed to send booking verification email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

