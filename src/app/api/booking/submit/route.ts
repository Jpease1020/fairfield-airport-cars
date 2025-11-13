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
    const currentRouteHash = createHash('sha256')
      .update(`${trip.pickup.address}|${trip.dropoff.address}|${trip.pickupDateTime}|${trip.fareType}`)
      .digest('hex');
    
    const storedRouteHash = createHash('sha256')
      .update(`${quote.pickupAddress}|${quote.dropoffAddress}|${quote.fareType}`)
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

    // Import booking service - use admin version which has conflict checks OUTSIDE transaction
    const { createBookingAtomic } = await import('@/lib/services/booking-service-admin');
    
    // Add timeout wrapper for booking creation
    const bookingPromise = createBookingAtomic(bookingData);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Booking creation timed out after 50 seconds')), 50000)
    );
    
    const bookingResult = await Promise.race([bookingPromise, timeoutPromise]) as { bookingId: string };

    const confirmationToken = randomBytes(32).toString('hex');

    const db = getAdminDb();
    await db.collection('bookings').doc(bookingResult.bookingId).update({
      confirmation: {
        status: 'pending',
        token: confirmationToken,
        sentAt: new Date().toISOString()
      }
    });

    let emailWarning: string | null = null;
    const bookingRecord = await getBooking(bookingResult.bookingId);
    if (bookingRecord) {
      const confirmationUrlBase =
        process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
      const confirmationUrl = `${confirmationUrlBase}/booking/confirm?bookingId=${bookingResult.bookingId}&token=${confirmationToken}`;
      try {
        console.log('📧 [BOOKING SUBMIT] Attempting to send verification email...');
        console.log(`   Booking ID: ${bookingResult.bookingId}`);
        console.log(`   Customer Email: ${bookingRecord.customer?.email || bookingRecord.email}`);
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