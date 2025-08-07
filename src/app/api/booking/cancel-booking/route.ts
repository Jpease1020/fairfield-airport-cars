import { NextRequest, NextResponse } from 'next/server';
import { getBooking, updateBooking } from '@/lib/services/booking-service';
import { sendSms } from '@/lib/services/twilio-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { bookingNotificationService } from '@/lib/services/booking-notification-service';
import { refundPayment } from '@/lib/services/square-service';

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

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

    // Calculate refund amount based on cancellation policy
    const now = new Date();
    const pickupTime = new Date(booking.pickupDateTime);
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursUntilPickup > 24) {
      refundPercent = 100;
    } else if (hoursUntilPickup > 3) {
      refundPercent = 50;
    }

    const depositAmount = booking.depositAmount || booking.fare / 2;
    const refundAmount = (depositAmount * refundPercent) / 100;
    const cancellationFee = depositAmount - refundAmount;

    // Update booking status
    await updateBooking(bookingId, {
      status: 'cancelled',
      updatedAt: new Date(),
      cancellationFee,
      balanceDue: 0
    });

    // Process refund if applicable
    if (refundAmount > 0 && booking.squareOrderId) {
      await refundPayment(booking.squareOrderId, refundAmount * 100, 'USD');
    }

    const messageBody = `Your ride scheduled for ${new Date(booking.pickupDateTime).toLocaleString()} has been cancelled. ${
      refundAmount === 0 ? 'Your deposit is non-refundable at this time.' : `We have refunded $${refundAmount.toFixed(2)} of your deposit.`}`;

    // Send all cancellation notifications in parallel
    await Promise.all([
      // Existing SMS notification
      sendSms({ to: booking.phone, body: messageBody }),
      // Existing email notification
      sendConfirmationEmail({ ...booking, status: 'cancelled', updatedAt: new Date(), cancellationFee }),
      // New push notification (using email as userId for now)
      bookingNotificationService.sendBookingCancelled(bookingId, booking.email, refundAmount)
    ]);

    return NextResponse.json({ 
      message: 'Booking cancelled',
      refundAmount,
      cancellationFee,
      channels: ['sms', 'email', 'push']
    });
  } catch (err) {
    console.error('Cancel booking error', err);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
} 