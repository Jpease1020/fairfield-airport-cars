import { NextResponse } from 'next/server';
import { createPayment } from '@/lib/services/square-service';
import { updateBooking } from '@/lib/services/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { sourceId, amount, bookingId, buyerEmail } = body;

    if (!sourceId || !amount || !bookingId) {
      console.error('❌ Missing required parameters:', { sourceId: !!sourceId, amount: !!amount, bookingId: !!bookingId });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Process payment with Square using the tokenized source
    const paymentResult = await createPayment({
      sourceId,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      idempotencyKey: `${bookingId}-${Date.now()}`,
      note: `Advance booking payment for ${bookingId}`,
      referenceId: bookingId
    });


    if (!paymentResult.success) {
      console.error('❌ Square payment failed:', paymentResult.error);
      return NextResponse.json(
        { error: paymentResult.error || 'Payment processing failed' },
        { status: 400 }
      );
    }


    try {
      // Update booking status
      await updateBooking(bookingId, {
        depositPaid: true,
        depositAmount: amount / 100, // Convert back to dollars
        balanceDue: 0, // Full payment upfront
        squarePaymentId: paymentResult.paymentId,
        updatedAt: new Date()
      });

    } catch (bookingError) {
      console.error('❌ Failed to update booking:', bookingError);
      // Payment succeeded but booking update failed - this is a partial success
      return NextResponse.json(
        { 
          error: 'Payment processed but failed to update booking',
          paymentId: paymentResult.paymentId,
          details: bookingError instanceof Error ? bookingError.message : 'Unknown booking error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      amount: amount / 100,
      bookingId
    });
  } catch (error) {
    console.error('💥 In-app payment error:', error);
    
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
