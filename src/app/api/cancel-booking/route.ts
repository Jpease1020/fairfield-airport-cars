import { NextResponse } from 'next/server';
import { getBooking, updateBooking } from '@/lib/booking-service';
import { sendSms } from '@/lib/twilio-service';
import { sendConfirmationEmail } from '@/lib/email-service';
import { refundPayment } from '@/lib/square-service';

export async function POST(req: Request) {
  const { bookingId } = await req.json();

  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ message: 'Booking already cancelled' });
  }

  // TODO: Determine refund amount based on policy. Placeholder full refund.
  try {
    const settings = await (await import('@/lib/settings-service')).getSettings();

    const now = new Date();
    const pickup = new Date(booking.pickupDateTime);
    const hoursDiff = (pickup.getTime() - now.getTime()) / 1000 / 3600;

    const deposit = booking.depositAmount ?? booking.fare / 2;
    let refundPercent = 0;

    if (hoursDiff > 24) refundPercent = settings.cancellation.over24hRefundPercent;
    else if (hoursDiff >= 3) refundPercent = settings.cancellation.between3And24hRefundPercent;
    else refundPercent = settings.cancellation.under3hRefundPercent;

    const refundAmount = Math.round((deposit * refundPercent) / 100);
    const cancellationFee = deposit - refundAmount;

    await updateBooking(bookingId, {
      status: 'cancelled',
      updatedAt: new Date(),
      balanceDue: 0,
      cancellationFee,
      depositPaid: refundAmount < deposit, // if full refund, depositPaid false
    });

    if (refundAmount > 0 && booking.squareOrderId) {
      await refundPayment(booking.squareOrderId, refundAmount * 100, 'USD');
    }

    const messageBody = `Your ride scheduled for ${new Date(booking.pickupDateTime).toLocaleString()} has been cancelled. ${
      refundAmount === 0 ? 'Your deposit is non-refundable at this time.' : `We have refunded $${refundAmount.toFixed(2)} of your deposit.`}`;

    await Promise.all([
      sendSms({ to: booking.phone, body: messageBody }),
      sendConfirmationEmail({ ...booking, status: 'cancelled', updatedAt: new Date(), cancellationFee }),
    ]);

    return NextResponse.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Cancel booking error', err);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
} 