import { NextRequest, NextResponse } from 'next/server';
import { getBooking, cancelBooking } from '@/lib/services/booking-service';
import { sendSms } from '@/lib/services/twilio-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { getBusinessRules, getCancellationFeePercent } from '@/lib/business/business-rules';
import { sendBookingProblem } from '@/lib/services/notification-service';

export async function POST(req: NextRequest) {
  let bookingId: string | undefined;
  try {
    const body = await req.json();
    bookingId = body.bookingId;
    const reason = body.reason;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await getBooking(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    const now = new Date();
    const pickupTime = new Date(booking.trip?.pickupDateTime || booking.pickupDateTime || new Date());
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const rules = await getBusinessRules();
    const feePercent = getCancellationFeePercent(hoursUntilPickup, rules.cancellationFeeTiers);

    const amountPaid = booking.payment?.depositAmount ?? booking.depositAmount ?? (booking.trip?.fare ?? booking.fare ?? 0);
    const cancellationFee = (amountPaid * feePercent) / 100;
    const refundAmount = amountPaid - cancellationFee;
    const squarePaymentId = booking.payment?.squarePaymentId || booking.squarePaymentId;

    // Cancel booking (handles calendar, schedule cleanup, refund, and booking update)
    await cancelBooking(bookingId, reason, {
      refundAmount,
      squarePaymentId,
      cancellationFee,
    });

    const pickupDateTime = booking.trip?.pickupDateTime || booking.pickupDateTime;
    const phone = booking.customer?.phone || booking.phone;
    const email = booking.customer?.email || booking.email;
    
    const messageBody = `Your ride scheduled for ${pickupDateTime ? new Date(pickupDateTime).toLocaleString() : 'your scheduled time'} has been cancelled. ${
      refundAmount === 0 ? (cancellationFee > 0 ? `A cancellation fee of $${cancellationFee.toFixed(2)} applies.` : 'No refund applies.') : `We have refunded $${refundAmount.toFixed(2)}.`}`;

    // Send SMS and email (push removed)
    await Promise.all([
      phone ? sendSms({ to: phone, body: messageBody }) : Promise.resolve(),
      email ? sendConfirmationEmail(adaptOldBookingToNew({ ...booking, status: 'cancelled', updatedAt: new Date(), cancellationFee })) : Promise.resolve(),
    ]);

    try {
      const { sendAdminSms } = await import('@/lib/services/admin-notification-service');
      const customerName = booking.customer?.name || booking.name || 'Customer';
      const pickupDateTimeStr = pickupDateTime ? new Date(pickupDateTime).toLocaleString() : 'scheduled time';
      const message = `Booking cancelled: ${bookingId} - ${customerName} - ${pickupDateTimeStr} - Refund: $${refundAmount.toFixed(2)}`;
      await sendAdminSms(message);
      console.log('✅ [CANCEL BOOKING] Admin SMS sent successfully');
    } catch (smsError) {
      console.error('❌ [CANCEL BOOKING] Failed to send admin SMS:', smsError);
    }

    return NextResponse.json({
      message: 'Booking cancelled',
      refundAmount,
      cancellationFee,
      channels: ['sms', 'email'],
    });
  } catch (err) {
    console.error('Cancel booking error', err);
    try {
      await sendBookingProblem('cancel', err, { bookingId });
    } catch (notifyErr) {
      console.error('Failed to send booking-problem notification:', notifyErr);
    }
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
} 