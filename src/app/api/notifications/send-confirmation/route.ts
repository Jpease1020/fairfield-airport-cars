import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/services/twilio-service';
import { getBooking } from '@/lib/services/booking-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { cmsService } from '@/lib/services/cms-service';

export async function POST(request: Request) {
  const { bookingId } = await request.json();

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const booking = await getBooking(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const businessSettings = await cmsService.getBusinessSettings();
    const messageBody = `Thank you for booking with ${businessSettings?.company?.name || 'Fairfield Airport Car Service'}! Your ride from ${booking.pickupLocation} to ${booking.dropoffLocation} on ${new Date(booking.pickupDateTime).toLocaleString()} is confirmed.`;

    await Promise.all([
      sendSms({
        to: booking.phone,
        body: messageBody,
      }),
      sendConfirmationEmail(booking),
    ]);

    return NextResponse.json({ message: 'Confirmation SMS sent successfully' });
  } catch (error) {
    console.error('Failed to send confirmation SMS:', error);
    return NextResponse.json({ error: 'Failed to send confirmation SMS' }, { status: 500 });
  }
}
