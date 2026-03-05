import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/services/twilio-service';
import { getBooking } from '@/lib/services/booking-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { requireAdmin } from '@/lib/utils/auth-server';
import { formatBusinessDateTime } from '@/lib/utils/booking-date-time';
import { APP_CONFIG } from '@/utils/constants';
import { getDropoffAddress, getPickupAddress, getPickupDateTime } from '@/utils/booking-helpers';

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { bookingId } = await request.json();

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const booking = await getBooking(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const pickupDateTimeValue = getPickupDateTime(booking);
    const pickupDateTimeText = pickupDateTimeValue
      ? formatBusinessDateTime(pickupDateTimeValue)
      : 'your scheduled time';
    const pickupAddress = getPickupAddress(booking) || 'your pickup location';
    const dropoffAddress = getDropoffAddress(booking) || 'your dropoff location';
    const messageBody = `Thank you for booking with ${APP_CONFIG.name}! Your ride from ${pickupAddress} to ${dropoffAddress} on ${pickupDateTimeText} is confirmed.`;

    await Promise.all([
      booking.phone ? sendSms({ to: booking.phone, body: messageBody }) : Promise.resolve(),
      sendConfirmationEmail(adaptOldBookingToNew(booking)),
    ]);

    return NextResponse.json({
      message: 'Confirmation notifications sent successfully',
      channels: ['sms', 'email'],
    });
  } catch (error) {
    console.error('Failed to send confirmation notifications:', error);
    return NextResponse.json({ error: 'Failed to send confirmation notifications' }, { status: 500 });
  }
}
