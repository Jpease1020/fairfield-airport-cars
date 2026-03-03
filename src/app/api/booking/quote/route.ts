import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';
import { createQuote } from '@/lib/services/quote-service';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';
import { classifyTrip, isAirportLocation } from '@/lib/services/service-area-validation';
import { quoteRequestSchema, quoteResponseSchema } from '@/lib/contracts/booking-api';

const mapsClient = new Client({});

function metersToMiles(m: number): number { return m / 1609.34; }
function secondsToMinutes(s: number): number { return s / 60; }

export async function POST(request: Request) {
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
    airportReturnMultiplier,
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
    const response = await mapsClient.distancematrix({
      params: {
        origins: [pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : origin],
        destinations: [dropoffCoords ? `${dropoffCoords.lat},${dropoffCoords.lng}` : destination],
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
  const durationMinutes = secondsToMinutes(durationSeconds);
  const durationTrafficMinutes = secondsToMinutes(durationTrafficSeconds);

  let fare = Math.ceil(BASE_FARE + distanceMiles * PER_MILE_RATE + durationTrafficMinutes * PER_MINUTE_RATE);

  // Apply 10% discount for personal rides
  if (fareType === 'personal') {
    fare = Math.ceil(fare * 0.9);
  }

  // Check if pickup is airport for return trip multiplier
  const isAirportPickup = isAirportLocation(origin, pickupCoords ?? null);
  const isAirportDropoff = isAirportLocation(destination, dropoffCoords ?? null);

  if (isAirportPickup && !isAirportDropoff) {
    const multiplier = Number.isFinite(airportReturnMultiplier) ? airportReturnMultiplier : 1.8;
    fare = Math.ceil(fare * multiplier);
  }

  // Check availability for the requested time slot
  let availabilityWarning: string | null = null;
  let suggestedTimes: string[] = [];
  try {
    const dateStr = pickupDateTime.toISOString().split('T')[0];
    const startTime = pickupDateTime.toTimeString().slice(0, 5);
    // Estimate end time: pickup time + 2 hours for the ride
    const endTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
    
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
      estimatedMinutes: Math.round(durationMinutes),
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
      durationMinutes: Math.round(durationMinutes),
      fareType,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
      availabilityWarning,
      suggestedTimes
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    // Return fare without quote ID if storage fails
    const responseBody = quoteResponseSchema.parse({
      fare,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes: Math.round(durationMinutes),
      fareType,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
      availabilityWarning,
      suggestedTimes
    });
    return NextResponse.json(responseBody);
  }
}
