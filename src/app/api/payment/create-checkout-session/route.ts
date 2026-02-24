
import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/services/booking-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function POST(request: Request) {
  const { bookingId, amount, currency, description } = await request.json();

  if (!bookingId || !amount || !currency || !description) {
    return NextResponse.json({ error: 'Missing required payment information' }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const accessResult = await requireOwnerOrAdmin(request, booking);
  if (!accessResult.ok) return accessResult.response;

  // Redirect to the new payment form instead of creating deprecated payment links
  const paymentFormUrl = `/payments/pay-balance/${bookingId}`;
  
  return NextResponse.json({ 
    redirectUrl: paymentFormUrl,
    message: 'Please complete payment using the new payment form'
  });
}
