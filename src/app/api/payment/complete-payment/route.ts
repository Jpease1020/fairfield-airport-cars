import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/services/booking-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function POST(req: Request) {
  const { bookingId } = await req.json();
  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 });

  const booking = await getBooking(bookingId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const accessResult = await requireOwnerOrAdmin(req, booking);
  if (!accessResult.ok) return accessResult.response;

  if (!booking.balanceDue || booking.balanceDue <= 0) return NextResponse.json({ message: 'No balance due' });

  // Redirect to the payment form page instead of creating deprecated payment links
  const paymentFormUrl = `/payments/pay-balance/${bookingId}`;
  
  return NextResponse.json({ 
    redirectUrl: paymentFormUrl,
    message: 'Please complete payment using the payment form'
  });
} 
