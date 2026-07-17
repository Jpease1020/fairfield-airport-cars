import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';
import { createQuote } from '@/lib/services/quote-service';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';
import { classifyTrip, isAirportLocation } from '@/lib/services/service-area-validation';
import { quoteRequestSchema, quoteResponseSchema } from '@/lib/contracts/booking-api';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { getBusinessDateString, getBusinessTimeString } from '@/lib/utils/booking-date-time';
import { resolveRideDurationMinutes } from '@/lib/utils/ride-duration';

const mapsClient = new Client({});

function metersToMiles(m: number): number { return m / 1609.34; }
function secondsToMinutes(s: number): number { return s / 60; }

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, {
    bucket: 'api:booking:quote',
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const raw = await request.json().catch(() => ({}));
  const parsed = quoteRequestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const { origin, destination, pickupCoords, dropoffCoords, fareType, pickupTime, sessionId, userId } = parsed.data;

  // Require pickup time for quote generation
  if (!pickupTime) {
    return NextResponse.json({ 
      error: 'Pickup time is required to generate a quote',
      code: 'MISSING_PICKUP_TIME'
    }, { status: 400 });
  }

  const settings = await getSettings();
  const {
    baseFare: BASE_FARE,
    perMile: PER_MILE_RATE,
    perMinute: PER_MINUTE_RATE,
    personalDiscountPercent,
    airportReturnMultiplier,
    minimumFare: MINIMUM_FARE,
  } = settings;

  // Validate pickup time is in the future
  const pickupDateTime = new Date(pickupTime);
  if (pickupDateTime <= new Date()) {
    return NextResponse.json({ 
      error: 'Pickup time must be in the future',
      code: 'INVALID_PICKUP_TIME'
    }, { status: 400 });
  }

  // Validate service area and airport requirements BEFORE calling Google Maps
  const tripClassification = classifyTrip(
    origin,
    destination,
    pickupCoords ?? null,
    dropoffCoords ?? null
  );

  if (tripClassification.classification !== 'normal') {
    // Log blocked trips for monitoring
    if (tripClassification.classification === 'soft_block' || tripClassification.classification === 'hard_block') {
      console.log('[SERVICE_AREA] Blocked trip:', {
        classification: tripClassification.classification,
        code: tripClassification.code,
        origin,
        destination,
        pickupCoords,
        dropoffCoords,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      error: tripClassification.message,
      code: tripClassification.code,
    }, { status: 400 });
  }

  let element: any;


  try {
    // Always geocode the address text server-side via Google's own resolution, rather than
    // trusting client-supplied coordinates for the call that determines the fare. Distance
    // Matrix accepts a plain address string directly, so this loses no accuracy for a real
    // address — but a raw lat/lng pair has no relationship checked against the address text at
    // all, so a client could keep the (displayed, driver-facing) address the same while
    // substituting coordinates for a much shorter route, collapsing the fare for a real trip.
    const response = await mapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_SERVER_API_KEY!,
        departure_time: pickupDateTime,
        traffic_model: 'best_guess' as any
      }
    });

    if (response.data.rows[0].elements[0].status !== 'OK') {
      return NextResponse.json({ error: 'Unable to calculate route' }, { status: 400 });
    }
    element = response.data.rows[0].elements[0];
  } catch (mapsError: any) {
    return NextResponse.json({ 
      error: 'Unable to calculate route - Google Maps API unavailable',
      code: 'MAPS_API_ERROR',
      details: mapsError.response?.data?.error_message || mapsError.message
    }, { status: 503 });
  }

  const el = element;
  const distanceMeters = el.distance.value;
  const durationSeconds = el.duration.value;
  const durationTrafficSeconds = el.duration_in_traffic?.value ?? durationSeconds;

  const distanceMiles = metersToMiles(distanceMeters);
  const durationTrafficMinutes = secondsToMinutes(durationTrafficSeconds);

  // Compute the whole pipeline in raw (unrounded) form and round up exactly once at the end —
  // ceiling at each of the three stages independently compounds to overcharge by up to ~$2-3
  // versus a single combined-rate rounding, always in the business's favor.
  let rawFare = BASE_FARE + distanceMiles * PER_MILE_RATE + durationTrafficMinutes * PER_MINUTE_RATE;

  // Apply personal ride discount
  if (fareType === 'personal' && personalDiscountPercent > 0) {
    rawFare = rawFare * (1 - personalDiscountPercent / 100);
  }

  // Check if pickup is airport for return trip multiplier
  const isAirportPickup = isAirportLocation(origin, pickupCoords ?? null);
  const isAirportDropoff = isAirportLocation(destination, dropoffCoords ?? null);

  if (isAirportPickup && !isAirportDropoff) {
    // Fallback matches DEFAULT_PRICING_CONFIG.airportReturnMultiplier (pricing-config.ts) — this
    // branch is effectively unreachable today (zod validates the config upstream), but the
    // fallback value should still agree with the documented default, not silently diverge from it.
    const multiplier = Number.isFinite(airportReturnMultiplier) ? airportReturnMultiplier : 1.15;
    rawFare = rawFare * multiplier;
  }

  // Floor applies last, after every discount/multiplier — it's the absolute minimum a customer
  // is ever charged, not another input to the formula above it.
  const fare = Math.max(Math.ceil(rawFare), MINIMUM_FARE);

  // Check availability for the requested time slot
  let availabilityWarning: string | null = null;
  let suggestedTimes: string[] = [];
  try {
    // Business-local date/time, not server-local — the server runs in UTC in production, so a
    // late-evening Eastern pickup would otherwise bucket into the wrong day's schedule.
    const dateStr = getBusinessDateString(pickupDateTime);
    const startTime = getBusinessTimeString(pickupDateTime);
    const rideDurationMinutes = resolveRideDurationMinutes(Math.round(durationTrafficMinutes));
    const endTime = getBusinessTimeString(new Date(pickupDateTime.getTime() + rideDurationMinutes * 60 * 1000));

    const conflictCheck = await driverSchedulingService.checkBookingConflicts(
      dateStr,
      startTime,
      endTime
    );
    
    if (conflictCheck.hasConflict) {
      suggestedTimes = conflictCheck.suggestedTimeSlots;
      availabilityWarning = suggestedTimes.length > 0
        ? `This time slot may be unavailable. Suggested times: ${suggestedTimes.join(', ')}`
        : 'This time slot may be unavailable. Please select a different time.';
    }
  } catch (availabilityError) {
    // Don't fail the quote if availability check fails - just log it
    console.warn('Availability check failed during quote generation:', availabilityError);
  }

  // Create a quote with 15-minute expiration
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  
  try {
    const quoteResult = await createQuote({
      sessionId: sessionId || undefined, // For anonymous users
      userId: userId || undefined, // For authenticated users
      pickupAddress: origin,
      dropoffAddress: destination,
      pickupCoords: pickupCoords || { lat: 0, lng: 0 }, // Fallback if no coords
      dropoffCoords: dropoffCoords || { lat: 0, lng: 0 }, // Fallback if no coords
      estimatedMiles: Math.round(distanceMiles * 100) / 100,
      // Reflect the duration the fare is actually billed on (with traffic), not the free-flow
      // duration — otherwise the displayed trip time never reconciles with the charged fare
      // during rush hour (customer sees "20 min" but is billed for a 35-minute traffic duration).
      // This is also the value scheduling uses to size the driver's slot for this ride (see
      // booking-orchestrator.ts), so it must stay the traffic-adjusted number.
      estimatedMinutes: Math.round(durationTrafficMinutes),
      price: fare,
      fareType,
      pickupDateTime, // Required - validated above
      expiresAt,
    });

    // Return simple quote data with availability warning if applicable
    const responseBody = quoteResponseSchema.parse({
      quoteId: quoteResult.quoteId,
      fare,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes: Math.round(durationTrafficMinutes),
      fareType,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
      availabilityWarning,
      suggestedTimes,
      minimumFare: MINIMUM_FARE,
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    // Return fare without quote ID if storage fails
    const responseBody = quoteResponseSchema.parse({
      fare,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes: Math.round(durationTrafficMinutes),
      fareType,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
      availabilityWarning,
      suggestedTimes,
      minimumFare: MINIMUM_FARE,
    });
    return NextResponse.json(responseBody);
  }
}
