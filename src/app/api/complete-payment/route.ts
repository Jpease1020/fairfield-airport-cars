import { NextResponse } from 'next/server';
import { getBooking, updateBooking } from '@/lib/booking-service';
import { createPaymentLink } from '@/lib/square-service';

export async function POST(req: Request) {
  const { bookingId } = await req.json();
  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 });

  const booking = await getBooking(bookingId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  if (booking.balanceDue <= 0) return NextResponse.json({ message: 'No balance due' });

  try {
    const link = await createPaymentLink({
      bookingId,
      amount: Math.ceil(booking.balanceDue * 100),
      currency: 'USD',
      description: `Remaining balance for ride from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
      buyerEmail: booking.email,
    });

    await updateBooking(bookingId, { squareOrderId: link.orderId });
    return NextResponse.json({ paymentLinkUrl: link.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create balance payment link' }, { status: 500 });
  }
} 