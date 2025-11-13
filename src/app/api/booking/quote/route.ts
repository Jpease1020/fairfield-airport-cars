import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';
import { createQuote } from '@/lib/services/quote-service';
import { z } from 'zod';
import { KNOWN_AIRPORTS } from '@/utils/constants';

const mapsClient = new Client({});

function metersToMiles(m: number): number { return m / 1609.34; }
function secondsToMinutes(s: number): number { return s / 60; }

const AIRPORT_KEYWORDS = ['airport', 'terminal', 'intl', 'international'];

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

function distanceMilesBetweenCoordinates(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const EARTH_RADIUS_MILES = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isAirportLocation(address?: string | null, coords?: { lat: number; lng: number } | null): boolean {
  const normalizedAddress = address?.toLowerCase() ?? '';

  if (normalizedAddress.length > 0) {
    if (AIRPORT_KEYWORDS.some(keyword => normalizedAddress.includes(keyword))) {
      return true;
    }

    for (const airport of KNOWN_AIRPORTS) {
      if (
        normalizedAddress.includes(airport.code.toLowerCase()) ||
        normalizedAddress.includes(airport.name.toLowerCase())
      ) {
        return true;
      }
    }
  }

  if (coords && isFiniteNumber(coords.lat) && isFiniteNumber(coords.lng)) {
    return KNOWN_AIRPORTS.some(airport => {
      const distance = distanceMilesBetweenCoordinates(
        coords.lat,
        coords.lng,
        airport.coordinates.lat,
        airport.coordinates.lng
      );
      return distance <= airport.radiusMiles;
    });
  }

  return false;
}

export async function POST(request: Request) {
  const schema = z.object({
    origin: z.string().min(3).max(256),
    destination: z.string().min(3).max(256),
    pickupCoords: z
      .object({ lat: z.number().gte(-90).lte(90), lng: z.number().gte(-180).lte(180) })
      .nullable()
      .optional(),
    dropoffCoords: z
      .object({ lat: z.number().gte(-90).lte(90), lng: z.number().gte(-180).lte(180) })
      .nullable()
      .optional(),
    fareType: z.enum(['personal', 'business']).default('business'),
    pickupTime: z.string().datetime().nullable().optional(),
    sessionId: z.string().optional(), // For anonymous users
    userId: z.string().optional(), // For authenticated users
  });
  const raw = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const { origin, destination, pickupCoords, dropoffCoords, fareType, pickupTime, sessionId, userId } = parsed.data;

  const settings = await getSettings();
  const {
    baseFare: BASE_FARE,
    perMile: PER_MILE_RATE,
    perMinute: PER_MINUTE_RATE,
    airportReturnMultiplier,
  } = settings;

  // Clamp pickup time to avoid past dates
  const departureClamped = pickupTime && new Date(pickupTime) > new Date() ? new Date(pickupTime) : new Date();

  let element: any;


  try {
    const response = await mapsClient.distancematrix({
      params: {
        origins: [pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : origin],
        destinations: [dropoffCoords ? `${dropoffCoords.lat},${dropoffCoords.lng}` : destination],
        key: process.env.GOOGLE_MAPS_SERVER_API_KEY!,
        departure_time: new Date(departureClamped),
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

  const isAirportPickup = isAirportLocation(origin, pickupCoords ?? null);
  const isAirportDropoff = isAirportLocation(destination, dropoffCoords ?? null);

  if (isAirportPickup && !isAirportDropoff) {
    const multiplier = Number.isFinite(airportReturnMultiplier) ? airportReturnMultiplier : 1.8;
    fare = Math.ceil(fare * multiplier);
  }

  // Create a quote with 15-minute expiration
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  const pickupDateTime = pickupTime ? new Date(pickupTime) : departureClamped;
  
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
      pickupDateTime,
      expiresAt,
    });

    // Return simple quote data
    return NextResponse.json({ 
      quoteId: quoteResult.quoteId,
      fare,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes: Math.round(durationMinutes),
      fareType,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15
    });
  } catch (error) {
    // Return fare without quote ID if storage fails
    return NextResponse.json({ 
      fare,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes: Math.round(durationMinutes),
      fareType,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15
    });
  }
}