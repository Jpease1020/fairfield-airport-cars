import { NextResponse } from 'next/server';
import { processPayment, refundPayment } from '@/lib/services/square-service';
import { getBooking, updateBooking, claimPaymentForBookingCreation, getBookingIdBySquarePaymentId } from '@/lib/services/booking-service';
import { recordBookingAttempt } from '@/lib/services/booking-attempts-service';
import { sendBookingProblem } from '@/lib/services/notification-service';
import { getAuthContext, requireOwnerOrAdmin } from '@/lib/utils/auth-server';
import { getQuote, isQuoteValid } from '@/lib/services/quote-service';
import { paymentProcessRequestSchema } from '@/lib/contracts/booking-api';
import { createPaidBookingAndNotify, isAtLeastMinimumAdvanceNotice } from '@/lib/services/booking-orchestrator';
import { enforceRateLimit } from '@/lib/security/rate-limit';

// Brief retry window for a request that lost the claim race (see claimPaymentForBookingCreation)
// to find the booking the winning request is creating for the same payment, instead of giving up
// immediately and creating a duplicate. Firestore booking-creation is typically well under this.
async function pollForBookingBySquarePaymentId(
  squarePaymentId: string,
  attempts = 5,
  delayMs = 300
): Promise<string | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const bookingId = await getBookingIdBySquarePaymentId(squarePaymentId);
    if (bookingId) return bookingId;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

// Expects `amount` and `tipAmount` in CENTS (non-negative integers). Client must send cents to avoid over/undercharging.
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, {
    bucket: 'api:payment:process-payment',
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

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

    // Smoke test mode is a server-only env flag — never derived from a client-supplied header,
    // since that would let anyone skip real payment processing on a live deployment.
    const isSmokeTest = process.env.SMOKE_TEST_MODE === 'true';

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

    let existingBooking: Awaited<ReturnType<typeof getBooking>> = null;
    if (existingBookingId) {
      existingBooking = await getBooking(existingBookingId);
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

      // Carry the quote's real trip duration onto the booking so the driver-schedule conflict
      // check sizes the occupied slot to the actual trip instead of a flat assumption — this
      // quote lookup already happens for the amount check above, so this is free.
      if (bookingData.trip) {
        bookingData = {
          ...bookingData,
          trip: { ...bookingData.trip, estimatedMinutes: quote.estimatedMinutes },
        };
      }
    }

    // createPaidBookingAndNotify (called below, after the charge) skips its own copy of this
    // check for this route (see skipMinimumNoticeCheck) precisely because this is the
    // authoritative, pre-charge check — checking it again after the charge would compare the
    // same pickup time against a LATER moving Date.now() threshold for no reason, and could
    // reject a booking that was genuinely compliant when the customer submitted it purely
    // because Square's own processing took long enough for the clock to cross the boundary.
    if (!existingBookingId && bookingData) {
      const pickupDateTimeValue = bookingData.pickupDateTime || bookingData.trip?.pickupDateTime;
      const parsedPickupDateTime = new Date(pickupDateTimeValue);
      if (Number.isNaN(parsedPickupDateTime.getTime())) {
        return NextResponse.json({
          error: 'Invalid or missing pickup date/time.',
          code: 'INVALID_PICKUP_DATETIME',
        }, { status: 400 });
      }
      if (!isAtLeastMinimumAdvanceNotice(parsedPickupDateTime)) {
        return NextResponse.json({
          error: 'Please book at least 24 hours in advance',
          code: 'MINIMUM_ADVANCE_NOTICE',
        }, { status: 400 });
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
      // Square's idempotency key on processPayment() dedupes an identical retry down to one
      // CHARGE (same paymentId returned both times), but doesn't stop this route from creating
      // two separate BOOKINGS for that one payment — e.g. a double-clicked submit firing two
      // requests with the same token before either resolves. Only the first request to claim
      // this paymentId proceeds to create a booking; a losing request looks up (and returns) the
      // winner's booking instead of creating a duplicate that reserves a second ride for one charge.
      if (paymentResult.paymentId) {
        const claimedPayment = await claimPaymentForBookingCreation(paymentResult.paymentId);
        if (!claimedPayment) {
          const winningBookingId = await pollForBookingBySquarePaymentId(paymentResult.paymentId);
          if (winningBookingId) {
            return NextResponse.json({
              success: true,
              bookingId: winningBookingId,
              paymentId: paymentResult.paymentId,
              status: paymentResult.status,
              amount: paymentResult.amount,
              currency: paymentResult.currency,
              emailWarning: null,
            });
          }
          // Couldn't find the winning booking within the poll window — extremely unlikely, but
          // don't silently drop a paid customer's booking; fall through and create one anyway.
        }
      }

      const paymentEnrichedBookingData = {
        ...bookingData,
        squareOrderId: paymentResult.orderId,
        squarePaymentId: paymentResult.paymentId,
      };

      try {
        const bookingResult = await createPaidBookingAndNotify({
          bookingData: paymentEnrichedBookingData,
          amountCents,
          tipCents,
          authUserId: authContext?.uid ?? null,
          smokeTest: isSmokeTest,
          // Already validated (and rejected if not) above, before the card was charged.
          skipMinimumNoticeCheck: true,
        });

        bookingId = bookingResult.bookingId;
        emailWarning = bookingResult.emailWarning;
      } catch (bookingCreationError) {
        // Payment already succeeded (e.g. a time-slot conflict threw here) — the customer must
        // not be left charged with no booking and no refund. Best-effort auto-refund before
        // letting the error propagate to the outer catch, which alerts the admin either way.
        if (!isSmokeTest && paymentResult.paymentId) {
          try {
            await refundPayment(paymentResult.paymentId, amountCents + tipCents, currency, 'Automatic refund: booking creation failed after payment');
            console.log(`✅ Auto-refunded payment ${paymentResult.paymentId} after booking creation failure`);
          } catch (refundError) {
            console.error(`❌ CRITICAL: payment ${paymentResult.paymentId} succeeded, booking creation failed, AND auto-refund failed — customer is charged with no booking:`, refundError);
          }
        }
        throw bookingCreationError;
      }
    } else if (bookingId && existingBooking) {
      // Paying a remaining balance/tip on an already-created booking — sync the booking's
      // payment state so the admin dashboard reflects the amount actually just charged, instead
      // of silently leaving depositPaid/balanceDue exactly as they were before this payment.
      const currentBalanceDue = existingBooking.payment?.balanceDue ?? existingBooking.balanceDue ?? 0;
      const currentTipAmount = existingBooking.payment?.tipAmount ?? existingBooking.tipAmount ?? 0;
      const newBalanceDue = Math.max(0, currentBalanceDue - amountCents / 100);
      const newTipAmount = currentTipAmount + tipCents / 100;
      await updateBooking(bookingId, {
        // Legacy top-level fields (still read directly in a few places).
        depositPaid: true,
        balanceDue: newBalanceDue,
        tipAmount: newTipAmount,
        // Admin/helper code reads booking.payment.* preferentially (booking-helpers.ts,
        // bookings-utils.ts) — Firestore's .update() replaces a nested object wholesale rather
        // than merging it, so without this the legacy write above is silently shadowed and the
        // admin dashboard keeps showing the stale pre-payment balance/deposit/tip state.
        payment: {
          depositAmount: existingBooking.payment?.depositAmount ?? null,
          squareOrderId: existingBooking.payment?.squareOrderId,
          squarePaymentId: existingBooking.payment?.squarePaymentId,
          tipPercent: existingBooking.payment?.tipPercent ?? 0,
          totalAmount: existingBooking.payment?.totalAmount ?? 0,
          depositPaid: true,
          balanceDue: newBalanceDue,
          tipAmount: newTipAmount,
        },
      });
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
