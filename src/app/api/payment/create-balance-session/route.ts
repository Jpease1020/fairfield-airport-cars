import { NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/services/square-service';
import { updateBooking, getBooking } from '@/lib/services/booking-service';

export async function POST(request: Request) {
  const { bookingId, currency, description } = await request.json();

  if (!bookingId || !currency || !description) {
    return NextResponse.json({ error: 'Missing required payment information' }, { status: 400 });
  }

  try {
    // Get the booking to check balance due
    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.balanceDue <= 0) {
      return NextResponse.json({ error: 'No balance due for this booking' }, { status: 400 });
    }

    // Convert balance to cents
    const balanceAmount = Math.round(booking.balanceDue * 100);

    // Create payment link for balance only
    const paymentLink = await createPaymentLink({
      bookingId,
      amount: balanceAmount,
      currency,
      description: `${description} - Balance Payment`,
    });

    // Update booking with new Square order id for balance payment
    await updateBooking(bookingId, {
      squareOrderId: paymentLink.orderId,
      balanceDue: booking.balanceDue, // Keep the same balance until payment is completed
    });

    return NextResponse.json({ 
      paymentLinkUrl: paymentLink.url,
      balanceAmount: booking.balanceDue,
    });
  } catch (error) {
    console.error('Failed to create balance payment session:', error);
    return NextResponse.json({ error: 'Failed to create balance payment session' }, { status: 500 });
  }
} 