import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getQuote, isQuoteValid } from '@/lib/services/quote-service';
import { createHash } from 'crypto';

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
      pickupDateTime: z.date(),
      fareType: z.enum(['personal', 'business']),
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
    // Create booking without payment (no deposit required)
    const bookingData = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      pickupLocation: trip.pickup.address,
      pickupCoords: trip.pickup.coordinates,
      dropoffLocation: trip.dropoff.address,
      dropoffCoords: trip.dropoff.coordinates,
      pickupDateTime: trip.pickupDateTime,
      fare: fare,
      fareType: trip.fareType,
      depositPaid: false,
      depositAmount: 0,
      balanceDue: fare,
      tipAmount: 0,
      status: 'confirmed' as const,
      notes: customer.notes || ''
    };

    // Import booking service
    const { createBookingAtomic } = await import('@/lib/services/booking-service');
    const bookingResult = await createBookingAtomic(bookingData);

    return NextResponse.json({ 
      success: true, 
      bookingId: bookingResult.bookingId,
      totalFare: fare,
      message: 'Booking created successfully - no deposit required'
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}