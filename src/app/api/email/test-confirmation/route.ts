import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { to, bookingId } = await request.json();
    
    if (!to) {
      return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 });
    }

    console.log('🧪 [TEST EMAIL] Sending test confirmation email...');
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
      status: 'confirmed' as const,
      fare: 150,
    };

    await sendConfirmationEmail(mockBooking as any);
    
    console.log('✅ [TEST EMAIL] Confirmation email sent successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      bookingId: mockBooking.id
    });
  } catch (error) {
    console.error('❌ [TEST EMAIL] Failed to send confirmation email:', error);
    return NextResponse.json({ 
      error: 'Failed to send confirmation email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
