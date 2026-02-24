import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/services/square-service';
import { getBooking, updateBooking } from '@/lib/services/booking-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, sourceId } = await request.json();

    if (!bookingId || !amount || !sourceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const accessResult = await requireOwnerOrAdmin(request, booking);
    if (!accessResult.ok) return accessResult.response;

    // Process payment with Square
    const paymentResult = await createPayment({
      sourceId,
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
