import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/services/square-service';
import { updateBooking } from '@/lib/services/booking-service';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, paymentMethod, paymentDetails } = await request.json();

    if (!bookingId || !amount || !paymentMethod || !paymentDetails) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Process payment with Square
    const paymentResult = await createPayment({
      sourceId: paymentDetails.token || paymentDetails.paymentData,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
      },
      idempotencyKey: `${bookingId}-${Date.now()}`,
      note: `Digital wallet payment for booking ${bookingId}`,
      referenceId: bookingId,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment processing failed' },
        { status: 400 }
      );
    }

    // Update booking with payment information
    await updateBooking(bookingId, {
      squareOrderId: paymentResult.paymentId,
      depositPaid: true,
      depositAmount: amount,
      balanceDue: 0, // Full payment
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      amount,
      bookingId,
    });
  } catch (error) {
    console.error('Digital wallet payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
} 