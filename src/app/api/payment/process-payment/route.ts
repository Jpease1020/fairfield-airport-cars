import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/services/square-service';
import { getBooking } from '@/lib/services/booking-service';
import { recordBookingAttempt } from '@/lib/services/booking-attempts-service';
import { sendBookingProblem } from '@/lib/services/notification-service';
import { getAuthContext, requireOwnerOrAdmin } from '@/lib/utils/auth-server';
import { getQuote, isQuoteValid } from '@/lib/services/quote-service';
import { paymentProcessRequestSchema } from '@/lib/contracts/booking-api';
import { createPaidBookingAndNotify } from '@/lib/services/booking-orchestrator';

// Expects `amount` and `tipAmount` in CENTS (non-negative integers). Client must send cents to avoid over/undercharging.
export async function POST(request: Request) {
  let existingBookingId: string | undefined;
  let bookingData: any;
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsed = paymentProcessRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payment request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      paymentToken,
      amount,
      currency,
      bookingData: bd,
      existingBookingId: eid,
      tipAmount = 0,
    } = parsed.data;
    existingBookingId = eid;
    bookingData = bd;
    const authContext = await getAuthContext(request);

    // Check for smoke test mode
    const smokeTestHeader = request.headers.get('x-smoke-test');
    const isSmokeTest = smokeTestHeader === 'true' || process.env.SMOKE_TEST_MODE === 'true';

    if (!paymentToken || !amount || !currency) {
      return NextResponse.json({ 
        error: 'Missing required payment information' 
      }, { status: 400 });
    }

    // Ensure amount and tip are in cents (integers) to prevent double conversion or decimal confusion
    const amountCents = Number(amount);
    const tipCents = Number(tipAmount);
    if (!Number.isInteger(amountCents) || amountCents < 0) {
      return NextResponse.json({ error: 'Invalid amount: must be a non-negative integer (cents).' }, { status: 400 });
    }
    if (!Number.isInteger(tipCents) || tipCents < 0) {
      return NextResponse.json({ error: 'Invalid tipAmount: must be a non-negative integer (cents).' }, { status: 400 });
    }

    if (existingBookingId) {
      const existingBooking = await getBooking(existingBookingId);
      if (!existingBooking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      const accessResult = await requireOwnerOrAdmin(request, existingBooking);
      if (!accessResult.ok) return accessResult.response;
    }

    if (bookingData?.quoteId) {
      const quote = await getQuote(bookingData.quoteId);
      if (!quote) {
        return NextResponse.json({ error: 'Quote not found', code: 'QUOTE_NOT_FOUND' }, { status: 404 });
      }
      if (!isQuoteValid(quote)) {
        return NextResponse.json({ error: 'Quote expired', code: 'QUOTE_EXPIRED' }, { status: 410 });
      }

      const expectedCents = Math.round(quote.price * 100);
      if (amountCents !== expectedCents) {
        return NextResponse.json({
          error: 'Payment amount does not match quote',
          code: 'AMOUNT_MISMATCH',
          expectedAmountCents: expectedCents,
          providedAmountCents: amountCents,
        }, { status: 409 });
      }
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
      // Real payment processing (amountCents and tipCents are both in cents)
      paymentResult = await processPayment(
        paymentToken, 
        amountCents + tipCents,
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
      const paymentEnrichedBookingData = {
        ...bookingData,
        squareOrderId: paymentResult.orderId,
        squarePaymentId: paymentResult.paymentId,
      };

      const bookingResult = await createPaidBookingAndNotify({
        bookingData: paymentEnrichedBookingData,
        amountCents,
        tipCents,
        authUserId: authContext?.uid ?? null,
        smokeTest: isSmokeTest,
      });

      bookingId = bookingResult.bookingId;
      emailWarning = bookingResult.emailWarning;
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
    try {
      await sendBookingProblem('payment', error, {
        bookingId: existingBookingId,
        userPhone: bookingData?.customer?.phone,
        userEmail: bookingData?.customer?.email,
      });
    } catch (notifyErr) {
      console.error('Failed to send booking-problem notification:', notifyErr);
    }
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
