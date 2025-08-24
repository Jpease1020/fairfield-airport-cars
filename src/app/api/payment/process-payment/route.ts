import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/services/square-service';
import { updateBooking } from '@/lib/services/booking-service';

export async function POST(request: Request) {
  try {
    const { paymentToken, amount, currency, bookingId, tipAmount = 0 } = await request.json();

    if (!paymentToken || !amount || !currency || !bookingId) {
      return NextResponse.json({ 
        error: 'Missing required payment information' 
      }, { status: 400 });
    }

    // Process the payment using the payment token
    const paymentResult = await processPayment(
      paymentToken, 
      amount + tipAmount, // Include tip in total amount
      currency, 
      bookingId
    );

    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: 'Payment processing failed' 
      }, { status: 400 });
    }

    // Update booking with payment information
    await updateBooking(bookingId, {
      squareOrderId: paymentResult.orderId,
      depositPaid: true,
      depositAmount: amount / 100,
      tipAmount: tipAmount > 0 ? tipAmount / 100 : 0,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      status: paymentResult.status,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
    });

  } catch (error) {
    console.error('Failed to process payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
