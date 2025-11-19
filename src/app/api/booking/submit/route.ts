import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getQuote, isQuoteValid } from '@/lib/services/quote-service';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { getBooking } from '@/lib/services/booking-service';
import { sendBookingVerificationEmail } from '@/lib/services/email-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { recordBookingAttempt } from '@/lib/services/booking-attempts-service';
import { notifyDriverOfNewBooking } from '@/lib/services/driver-notification-service';

export async function POST(request: Request) {
  const schema = z.object({
    quoteId: z.string().optional(), // Quote ID for validation
    fare: z.number().min(1),
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      notes: z.string().optional().nullable(),
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

  const { quoteId, fare, customer, trip } = parsed.data;

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
    
    // Validate route hasn't changed (prevent tampering)
    // Normalize pickupDateTime to ISO string for comparison
    const currentPickupDateTime = trip.pickupDateTime instanceof Date 
      ? trip.pickupDateTime.toISOString() 
      : new Date(trip.pickupDateTime).toISOString();
    
    // Handle backward compatibility: old quotes may not have pickupDateTime stored
    let storedPickupDateTime = '';
    if (quote.pickupDateTime) {
      storedPickupDateTime = quote.pickupDateTime instanceof Date
        ? quote.pickupDateTime.toISOString()
        : new Date(quote.pickupDateTime).toISOString();
    }
    
    // For old quotes without pickupDateTime, only validate address and fareType
    // For new quotes with pickupDateTime, validate everything including pickup time
    const currentRouteHash = createHash('sha256')
      .update(`${trip.pickup.address}|${trip.dropoff.address}|${storedPickupDateTime ? currentPickupDateTime : ''}|${trip.fareType}`)
      .digest('hex');
    
    const storedRouteHash = createHash('sha256')
      .update(`${quote.pickupAddress}|${quote.dropoffAddress}|${storedPickupDateTime}|${quote.fareType}`)
      .digest('hex');
    
    if (currentRouteHash !== storedRouteHash) {
      return NextResponse.json({ 
        error: 'Trip details have changed. Please request a new quote.',
        code: 'ROUTE_CHANGED'
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
        saveInfoForFuture: false
      },
      payment: {
        depositAmount: 0,
        balanceDue: fare,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 0,
        totalAmount: fare
      },
      status: 'pending' as const
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

    // Import booking service - use admin version which has conflict checks OUTSIDE transaction
    const { createBookingAtomic } = await import('@/lib/services/booking-service-admin');
    
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
      await sendBookingVerificationEmail(adaptOldBookingToNew(bookingRecord), confirmationUrl);
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
      });
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

    return NextResponse.json({ 
      success: true, 
      bookingId: bookingResult.bookingId,
      totalFare: fare,
      message: 'Booking created successfully — pending email confirmation',
      emailWarning
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
    await recordBookingAttempt({
      stage: 'submit',
      status: 'failed',
      reason: errorMessage,
    });
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: errorMessage 
    }, { status: 500 });
  }
}