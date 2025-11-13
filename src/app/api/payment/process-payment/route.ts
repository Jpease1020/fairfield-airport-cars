import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/services/square-service';
import { createBookingAtomic, getBooking } from '@/lib/services/booking-service';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';
import { sendSms } from '@/lib/services/twilio-service';
import { randomBytes } from 'crypto';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { recordBookingAttempt } from '@/lib/services/booking-attempts-service';

export async function POST(request: Request) {
  try {
    const { paymentToken, amount, currency, bookingData, existingBookingId, tipAmount = 0 } = await request.json();

    // Check for smoke test mode
    const smokeTestHeader = request.headers.get('x-smoke-test');
    const isSmokeTest = smokeTestHeader === 'true' || process.env.SMOKE_TEST_MODE === 'true';

    if (!paymentToken || !amount || !currency) {
      return NextResponse.json({ 
        error: 'Missing required payment information' 
      }, { status: 400 });
    }

    // SECURITY: Process payment FIRST, then create booking
    let paymentResult;
    
    if (isSmokeTest) {
      // Mock payment for smoke tests - no real charge
      console.log('🧪 Smoke test mode - mocking payment processing');
      paymentResult = {
        success: true,
        paymentId: `smoke-test-payment-${Date.now()}`,
        status: 'COMPLETED',
        amount: 0, // No charge in smoke test
        currency: currency,
        orderId: `smoke-test-order-${Date.now()}`,
      };
    } else {
      // Real payment processing
      // Amount is in cents, so we pass it directly to Square
      paymentResult = await processPayment(
        paymentToken, 
        amount + tipAmount, // Include tip in total amount (both in cents)
        currency, 
        existingBookingId || 'temp-booking-id' // Use existing ID or temp for new bookings
      );
    }

    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: 'Payment processing failed' 
      }, { status: 400 });
    }

    // Only create booking AFTER successful payment
    let bookingId = existingBookingId;
    let emailWarning: string | null = null;
    
    if (!bookingId && bookingData) {
      // Create new booking with payment information
      const bookingResult = await createBookingAtomic({
        ...bookingData,
        squareOrderId: paymentResult.orderId,
        depositPaid: true,
        depositAmount: amount / 100, // Convert cents to dollars
        tipAmount: tipAmount > 0 ? tipAmount / 100 : 0, // Convert cents to dollars
        status: 'pending',
        balanceDue: 0, // No balance due since deposit is paid
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      bookingId = bookingResult.bookingId;
      
      // Mark as smoke test booking if in smoke test mode
      if (isSmokeTest && bookingId) {
        const db = getAdminDb();
        await db.collection('bookings').doc(bookingId).update({
          _smokeTest: true,
          _smokeTestTimestamp: new Date().toISOString(),
        });
      }
      
      // Send verification email after successful booking creation
      if (bookingId) {
        try {
          const confirmationToken = randomBytes(32).toString('hex');
          const db = getAdminDb();
          await db.collection('bookings').doc(bookingId).update({
            confirmation: {
              status: 'pending',
              token: confirmationToken,
              sentAt: new Date().toISOString()
            }
          });

          const bookingRecord = await getBooking(bookingId);
          if (bookingRecord) {
            const confirmationUrlBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
            const confirmationUrl = `${confirmationUrlBase}/booking/confirm?bookingId=${bookingId}&token=${confirmationToken}`;
            await sendBookingVerificationEmail(
              adaptOldBookingToNew(bookingRecord),
              confirmationUrl
            );

            const smsMessage = `We received your booking request for ${new Date(bookingData.pickupDateTime).toLocaleString()}. Please check your email to confirm the ride. Booking ID: ${bookingId}`;
            await sendSms({
              to: bookingData.customer.phone,
              body: smsMessage
            });
          }
        } catch (notificationError) {
          console.error('Failed to send verification notifications:', notificationError);
          emailWarning =
            'Your booking is saved, but we could not send the confirmation email. Please text us at (646) 221-6370 to finish confirming.';
          await recordBookingAttempt({
            stage: 'payment',
            status: 'warning',
            bookingId,
            reason: emailWarning,
          });
          // Don't fail the payment if notifications fail
        }
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      paymentId: paymentResult.paymentId,
      status: paymentResult.status,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
      emailWarning
    });

  } catch (error) {
    console.error('Failed to process payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
    await recordBookingAttempt({
      stage: 'payment',
      status: 'failed',
      reason: errorMessage,
    });
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
