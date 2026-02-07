import { NextRequest, NextResponse } from 'next/server';
import { getBooking, cancelBooking } from '@/lib/services/booking-service';
import { sendSms } from '@/lib/services/twilio-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { bookingNotificationService } from '@/lib/services/booking-notification-service';
import { refundPayment } from '@/lib/services/square-service';

export async function POST(req: NextRequest) {
  try {
    const { bookingId, reason } = await req.json();

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
    const pickupTime = new Date(booking.trip?.pickupDateTime || booking.pickupDateTime || new Date());
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursUntilPickup > 24) {
      refundPercent = 100;
    } else if (hoursUntilPickup > 3) {
      refundPercent = 50;
    }

    const depositAmount = booking.payment?.depositAmount || booking.depositAmount || (booking.trip?.fare || booking.fare || 0) / 2;
    const refundAmount = (depositAmount * refundPercent) / 100;
    const cancellationFee = depositAmount - refundAmount;

    // Cancel booking (this handles calendar event deletion and schedule cleanup)
    await cancelBooking(bookingId, reason);
    
    // Update booking with refund details
    const { updateBooking } = await import('@/lib/services/booking-service');
    await updateBooking(bookingId, {
      cancellationFee,
      balanceDue: 0
    });

    // Process refund if applicable - need paymentId, not orderId
    const squarePaymentId = booking.payment?.squarePaymentId || booking.squarePaymentId;
    if (refundAmount > 0 && squarePaymentId) {
      try {
        await refundPayment(squarePaymentId, refundAmount * 100, 'USD', reason);
        console.log(`✅ Refund processed: $${refundAmount.toFixed(2)} for booking ${bookingId}`);
      } catch (refundError) {
        console.error(`❌ Refund failed for booking ${bookingId}:`, refundError);
        // Don't fail the cancellation if refund fails - admin can process manually
      }
    } else if (refundAmount > 0 && !squarePaymentId) {
      console.warn(`⚠️ Cannot process refund - no payment ID stored for booking ${bookingId}`);
    }

    const pickupDateTime = booking.trip?.pickupDateTime || booking.pickupDateTime;
    const phone = booking.customer?.phone || booking.phone;
    const email = booking.customer?.email || booking.email;
    
    const messageBody = `Your ride scheduled for ${pickupDateTime ? new Date(pickupDateTime).toLocaleString() : 'your scheduled time'} has been cancelled. ${
      refundAmount === 0 ? 'Your deposit is non-refundable at this time.' : `We have refunded $${refundAmount.toFixed(2)} of your deposit.`}`;

    // Send all cancellation notifications in parallel
    await Promise.all([
      // Existing SMS notification
      phone ? sendSms({ to: phone, body: messageBody }) : Promise.resolve(),
      // Existing email notification
      email ? sendConfirmationEmail(adaptOldBookingToNew({ ...booking, status: 'cancelled', updatedAt: new Date(), cancellationFee })) : Promise.resolve(),
      // New push notification (using email as userId for now)
      email ? bookingNotificationService.sendBookingCancelled(bookingId, email, refundAmount) : Promise.resolve()
    ]);

    // Send SMS notification to admin (Gregg)
    try {
      const { sendAdminSms } = await import('@/lib/services/admin-notification-service');
      const customerName = booking.customer?.name || booking.name || 'Customer';
      const pickupDateTimeStr = pickupDateTime ? new Date(pickupDateTime).toLocaleString() : 'scheduled time';
      const message = `Booking cancelled: ${bookingId} - ${customerName} - ${pickupDateTimeStr} - Refund: $${refundAmount.toFixed(2)}`;
      await sendAdminSms(message);
      console.log('✅ [CANCEL BOOKING] Admin SMS sent successfully');
    } catch (smsError) {
      // Don't fail cancellation if SMS fails
      console.error('❌ [CANCEL BOOKING] Failed to send admin SMS:', smsError);
      console.warn('⚠️ [CANCEL BOOKING] Booking cancelled but admin SMS not sent');
    }

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