import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getQuote, isQuoteValid } from '@/lib/services/quote-service';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { getBooking } from '@/lib/services/booking-service';
import { sendBookingVerificationEmail, sendDriverNotificationEmail } from '@/lib/services/email-service';
import { recordBookingAttempt } from '@/lib/services/booking-attempts-service';
import { notifyDriverOfNewBooking } from '@/lib/services/driver-notification-service';
import { classifyTrip } from '@/lib/services/service-area-validation';
import { getAuthContext } from '@/lib/utils/auth-server';
import { sendBookingProblem } from '@/lib/services/notification-service';
import { Booking } from '@/types/booking';
import { formatBusinessDateTime } from '@/lib/utils/booking-date-time';

export async function POST(request: Request) {
  const schema = z.object({
    quoteId: z.string().optional(), // Quote ID for validation
    fare: z.number().min(1),
    exceptionCode: z.string().optional(), // Secret code for VIP exception bookings
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      notes: z.string().optional().nullable(),
      smsOptIn: z.boolean().optional().default(false),
    }),
    trip: z.object({
      pickup: z.object({
        address: z.string().min(1),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable(),
      }),
      dropoff: z.object({
        address: z.string().min(1),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable(),
      }),
      pickupDateTime: z.string().transform((val) => new Date(val)), // Accept ISO string, convert to Date
      fareType: z.enum(['personal', 'business']),
      flightInfo: z.object({
        hasFlight: z.boolean(),
        airline: z.string(),
        flightNumber: z.string(),
        arrivalTime: z.string(),
        terminal: z.string(),
      }).optional(),
    }),
  });

  const raw = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  const { quoteId, fare, exceptionCode, customer, trip } = parsed.data;
  const authContext = await getAuthContext(request);

  // Check if exception code is provided and valid
  const isValidExceptionCode = exceptionCode && exceptionCode === process.env.BOOKING_EXCEPTION_SECRET;
  const isExceptionBooking = isValidExceptionCode === true;

  if (!isExceptionBooking && !quoteId) {
    return NextResponse.json(
      {
        error: 'Quote is required for booking submission. Please request a new quote.',
        code: 'QUOTE_REQUIRED',
      },
      { status: 400 }
    );
  }

  // Validate service area UNLESS this is an exception booking
  if (!isExceptionBooking) {
    const tripClassification = classifyTrip(
      trip.pickup.address,
      trip.dropoff.address,
      trip.pickup.coordinates ?? null,
      trip.dropoff.coordinates ?? null
    );

    if (tripClassification.classification !== 'normal') {
      // Log blocked trips for monitoring
      console.log('[SERVICE_AREA] Blocked booking submission:', {
        classification: tripClassification.classification,
        code: tripClassification.code,
        pickup: trip.pickup.address,
        dropoff: trip.dropoff.address,
        customerEmail: customer.email,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        error: tripClassification.message,
        code: tripClassification.code,
      }, { status: 400 });
    }
  } else {
    // Log exception booking creation
    console.log('[EXCEPTION_BOOKING] Exception booking created:', {
      pickup: trip.pickup.address,
      dropoff: trip.dropoff.address,
      customerEmail: customer.email,
      customerName: customer.name,
      timestamp: new Date().toISOString(),
    });
  }

  // Validate quote if provided
  if (quoteId) {
    const quote = await getQuote(quoteId);
    if (!quote) {
      return NextResponse.json({ 
        error: 'Quote not found. Please request a new quote.',
        code: 'QUOTE_NOT_FOUND'
      }, { status: 404 });
    }
    
    if (!isQuoteValid(quote)) {
      return NextResponse.json({ 
        error: 'Quote has expired. Please request a new quote.',
        code: 'QUOTE_EXPIRED'
      }, { status: 410 });
    }
    
    // Require pickupDateTime on quote so we can validate time wasn't changed (prevent quote reuse with different time)
    const storedPickupDateTime = quote.pickupDateTime
      ? (quote.pickupDateTime instanceof Date
          ? quote.pickupDateTime.toISOString()
          : new Date(quote.pickupDateTime).toISOString())
      : '';
    if (!storedPickupDateTime) {
      return NextResponse.json({
        error: 'Quote is missing trip time. Please request a new quote.',
        code: 'QUOTE_MISSING_TIME',
      }, { status: 409 });
    }

    const currentPickupDateTime = trip.pickupDateTime instanceof Date
      ? trip.pickupDateTime.toISOString()
      : new Date(trip.pickupDateTime).toISOString();

    // Always include pickupDateTime in hash so submitted time must match quote time
    const currentRouteHash = createHash('sha256')
      .update(`${trip.pickup.address}|${trip.dropoff.address}|${currentPickupDateTime}|${trip.fareType}`)
      .digest('hex');
    const storedRouteHash = createHash('sha256')
      .update(`${quote.pickupAddress}|${quote.dropoffAddress}|${storedPickupDateTime}|${quote.fareType}`)
      .digest('hex');

    if (currentRouteHash !== storedRouteHash) {
      return NextResponse.json({
        error: 'Trip details have changed. Please request a new quote.',
        code: 'ROUTE_CHANGED',
      }, { status: 409 });
    }
    
    // Validate fare matches quote (within 5% tolerance)
    const fareDifference = Math.abs(fare - quote.price);
    const fareTolerance = quote.price * 0.05; // 5% tolerance
    
    if (fareDifference > fareTolerance) {
      return NextResponse.json({ 
        error: 'Fare has changed. Please request a new quote.',
        code: 'FARE_MISMATCH',
        expectedFare: quote.price,
        providedFare: fare
      }, { status: 409 });
    }
  }

  try {
    // Verify Firebase Admin is initialized before proceeding
    try {
      getAdminDb();
    } catch (adminError) {
      console.error('Firebase Admin not initialized:', adminError);
      return NextResponse.json({ 
        error: 'Server configuration error. Please contact support.',
        details: 'Firebase Admin not initialized. Check environment variables.'
      }, { status: 500 });
    }

    // Create booking with clean nested structure
    const bookingData = {
      trip: {
        pickup: trip.pickup,
        dropoff: trip.dropoff,
        pickupDateTime: trip.pickupDateTime,
        fareType: trip.fareType,
        flightInfo: trip.flightInfo || {
          hasFlight: false,
          airline: '',
          flightNumber: '',
          arrivalTime: '',
          terminal: ''
        },
        fare: fare,
        baseFare: fare,
        tipAmount: 0,
        tipPercent: 0,
        totalFare: fare
      },
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes || '',
        saveInfoForFuture: false,
        smsOptIn: customer.smsOptIn || false
      },
      payment: {
        depositAmount: 0,
        balanceDue: fare,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 0,
        totalAmount: fare
      },
      customerUserId: authContext?.uid ?? null,
      trackingToken: randomBytes(16).toString('hex'),
      status: isExceptionBooking ? ('requires_approval' as const) : ('pending' as const),
      ...(isExceptionBooking && {
        requiresApproval: true,
        exceptionReason: 'VIP exception',
      }),
    };

    // Generate confirmation token BEFORE booking creation (atomic)
    let confirmationToken = randomBytes(32).toString('hex');
    const confirmationSentAt = new Date().toISOString();
    
    // Include confirmation token in booking data for atomic creation
    const bookingDataWithConfirmation = {
      ...bookingData,
      confirmation: {
        status: 'pending' as const,
        token: confirmationToken,
        sentAt: confirmationSentAt
      }
    };

    const { createBookingAtomic } = await import('@/lib/services/booking-service');
    
    // Add timeout wrapper for booking creation
    const bookingPromise = createBookingAtomic(bookingDataWithConfirmation);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Booking creation timed out after 50 seconds')), 50000)
    );
    
    const bookingResult = await Promise.race([bookingPromise, timeoutPromise]) as { bookingId: string };
    
    console.log(`✅ [BOOKING SUBMIT] Booking ${bookingResult.bookingId} created atomically with confirmation token`);

    // Verify confirmation token was saved (safety check)
    const bookingRecord = await getBooking(bookingResult.bookingId);
    if (!bookingRecord) {
      throw new Error('Booking was created but could not be retrieved');
    }

    // Validate confirmation token exists before sending email
    const savedConfirmation = bookingRecord.confirmation;
    if (!savedConfirmation?.token) {
      console.error(`❌ [BOOKING SUBMIT] CRITICAL: Booking ${bookingResult.bookingId} created but confirmation token is missing!`);
      console.error(`   Expected token: ${confirmationToken}`);
      console.error(`   Saved confirmation:`, savedConfirmation);
      
      // Fallback: Try to save token again (retry mechanism)
      const db = getAdminDb();
      try {
        await db.collection('bookings').doc(bookingResult.bookingId).update({
          confirmation: {
            status: 'pending',
            token: confirmationToken,
            sentAt: confirmationSentAt
          }
        });
        console.log(`✅ [BOOKING SUBMIT] Confirmation token saved via fallback retry for booking ${bookingResult.bookingId}`);
      } catch (retryError) {
        console.error(`❌ [BOOKING SUBMIT] Fallback token save also failed:`, retryError);
        throw new Error('Failed to save confirmation token. Booking created but cannot be confirmed.');
      }
    } else if (savedConfirmation.token !== confirmationToken) {
      console.warn(`⚠️ [BOOKING SUBMIT] Token mismatch for booking ${bookingResult.bookingId}`);
      console.warn(`   Expected: ${confirmationToken}`);
      console.warn(`   Saved: ${savedConfirmation.token}`);
      // Use the saved token instead
      confirmationToken = savedConfirmation.token;
    }

    let emailWarning: string | null = null;
    const confirmationUrlBase =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const confirmationUrl = `${confirmationUrlBase}/booking/confirm?bookingId=${bookingResult.bookingId}&token=${confirmationToken}`;
    
    try {
      console.log('📧 [BOOKING SUBMIT] Attempting to send verification email...');
      console.log(`   Booking ID: ${bookingResult.bookingId}`);
      console.log(`   Customer Email: ${bookingRecord.customer?.email || bookingRecord.email}`);
      console.log(`   Confirmation Token: ${confirmationToken.substring(0, 8)}...`);
      // Use booking directly - we always save with nested structure, so no adapter needed
      await sendBookingVerificationEmail(bookingRecord as unknown as Booking, confirmationUrl);
      console.log('✅ [BOOKING SUBMIT] Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ [BOOKING SUBMIT] Failed to send verification email:', emailError);
      console.error(`   Error details: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
      console.error(`   Booking ID: ${bookingResult.bookingId}`);
      console.error(`   Customer Email: ${bookingRecord.customer?.email || bookingRecord.email}`);
      emailWarning =
        'Your ride request is saved, but we could not send the confirmation email. Please text us at (646) 221-6370 so we can finalize it.';
      await recordBookingAttempt({
        stage: 'submit',
        status: 'warning',
        bookingId: bookingResult.bookingId,
        reason: emailWarning,
        // Include customer info for debugging
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        // Include trip info
        pickupAddress: trip.pickup.address,
        dropoffAddress: trip.dropoff.address,
        pickupDateTime: trip.pickupDateTime.toISOString(),
      });
    }

    // Send driver notification email (separate from customer email, formatted for driver use)
    try {
      console.log('📧 [BOOKING SUBMIT] Sending driver notification email...');
      await sendDriverNotificationEmail(bookingRecord as unknown as Booking);
      console.log('✅ [BOOKING SUBMIT] Driver notification email sent successfully');
    } catch (driverEmailError) {
      // Don't fail booking creation if driver email fails
      console.error('❌ [BOOKING SUBMIT] Failed to send driver notification email:', driverEmailError);
      console.warn('⚠️ [BOOKING SUBMIT] Booking created but driver email not sent');
    }

    // Send push notification to driver (Gregg) about new booking
    try {
      console.log('🔔 [BOOKING SUBMIT] Sending push notification to driver...');
      await notifyDriverOfNewBooking({
        bookingId: bookingResult.bookingId,
        customerName: customer.name,
        pickupAddress: trip.pickup.address,
        dropoffAddress: trip.dropoff.address,
        pickupDateTime: trip.pickupDateTime.toISOString(),
        fare: fare
      });
      console.log('✅ [BOOKING SUBMIT] Driver notification sent successfully');
    } catch (notificationError) {
      // Don't fail booking creation if notification fails
      console.error('❌ [BOOKING SUBMIT] Failed to send driver notification:', notificationError);
      console.error(`   Error details: ${notificationError instanceof Error ? notificationError.message : String(notificationError)}`);
      console.warn('⚠️ [BOOKING SUBMIT] Booking created but driver was not notified');
    }

    // Send SMS notification to admin (Gregg)
    try {
      const { sendAdminSms } = await import('@/lib/services/admin-notification-service');
      const pickupDateTimeStr = formatBusinessDateTime(trip.pickupDateTime);
      const message = `New booking: ${customer.name} - ${trip.pickup.address} to ${trip.dropoff.address} on ${pickupDateTimeStr} - $${fare.toFixed(2)}`;
      await sendAdminSms(message);
      console.log('✅ [BOOKING SUBMIT] Admin SMS sent successfully');
    } catch (smsError) {
      // Don't fail booking creation if SMS fails
      console.error('❌ [BOOKING SUBMIT] Failed to send admin SMS:', smsError);
      console.warn('⚠️ [BOOKING SUBMIT] Booking created but admin SMS not sent');
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: bookingResult.bookingId,
      totalFare: fare,
      message: 'Booking created successfully — pending email confirmation',
      emailWarning
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    try {
      await sendBookingProblem('submit', err, {
        userPhone: customer?.phone,
        userEmail: customer?.email,
      });
    } catch (notifyErr) {
      console.error('Failed to send booking-problem notification:', notifyErr);
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
    const conflictMatch = errorMessage.match(/suggested times?:\s*(.+)$/i);
    const suggestedTimes = conflictMatch?.[1]
      ? conflictMatch[1]
          .split(',')
          .map((slot) => slot.trim())
          .filter(Boolean)
      : [];
    const isTimeSlotConflict =
      /time slot conflicts|not available|conflicts with existing|already booked|no driver is available/i.test(errorMessage);

    if (isTimeSlotConflict) {
      await recordBookingAttempt({
        stage: 'submit',
        status: 'failed',
        reason: errorMessage,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        pickupAddress: trip?.pickup?.address,
        dropoffAddress: trip?.dropoff?.address,
        pickupDateTime: trip?.pickupDateTime?.toISOString?.() || String(trip?.pickupDateTime),
      });

      return NextResponse.json(
        {
          error: 'This time slot is no longer available. Please choose a different time.',
          code: 'TIME_SLOT_CONFLICT',
          details: errorMessage,
          suggestedTimes,
        },
        { status: 409 }
      );
    }

    await recordBookingAttempt({
      stage: 'submit',
      status: 'failed',
      reason: errorMessage,
      // Include customer info for debugging
      customerName: customer?.name,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      // Include trip info
      pickupAddress: trip?.pickup?.address,
      dropoffAddress: trip?.dropoff?.address,
      pickupDateTime: trip?.pickupDateTime?.toISOString?.() || String(trip?.pickupDateTime),
    });
    return NextResponse.json({
      error: 'Failed to create booking',
      details: errorMessage
    }, { status: 500 });
  }
}
