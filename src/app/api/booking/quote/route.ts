import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';
import crypto from 'crypto';
import { z } from 'zod';

const mapsClient = new Client({});

function hmacSign(payload: unknown, secret: string): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function metersToMiles(m: number): number { return m / 1609.34; }
function secondsToMinutes(s: number): number { return s / 60; }

export async function POST(request: Request) {
  const secret = process.env.BOOKING_QUOTE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

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
    pickupTime: z.string().datetime().optional().nullable(),
  });

  const raw = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const { origin, destination, pickupCoords, dropoffCoords, fareType, pickupTime } = parsed.data;

  // Clamp pickupTime window: now - 30m to now + 180 days
  const now = Date.now();
  const minTime = now - 30 * 60 * 1000;
  const maxTime = now + 180 * 24 * 60 * 60 * 1000;
  const departure = pickupTime ? new Date(pickupTime).getTime() : now;
  const departureClamped = Math.min(Math.max(departure, minTime), maxTime);

  try {
    const settings = await getSettings();
    const { baseFare: BASE_FARE, perMile: PER_MILE_RATE, perMinute: PER_MINUTE_RATE } = settings;

    // Simple in-memory rate limit & cache (per Vercel runtime instance)
    // Rate limit: max 20 req per IP per 60s
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
    // @ts-ignore
    globalThis.__quoteRl = globalThis.__quoteRl || new Map<string, { count: number; ts: number }>();
    // @ts-ignore
    const rl = globalThis.__quoteRl as Map<string, { count: number; ts: number }>;
    const bucket = rl.get(ip);
    const nowSec = Math.floor(Date.now() / 1000);
    if (!bucket || nowSec - bucket.ts > 60) rl.set(ip, { count: 1, ts: nowSec });
    else {
      if (bucket.count > 20) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
      bucket.count += 1;
    }

    // Cache by origin|dest|timeBucket (rounded to 5 minutes)
    // @ts-ignore
    globalThis.__dmCache = globalThis.__dmCache || new Map<string, { data: any; exp: number }>();
    // @ts-ignore
    const dmCache = globalThis.__dmCache as Map<string, { data: any; exp: number }>;
    const bucketTime = Math.floor(departureClamped / (5 * 60 * 1000)) * (5 * 60 * 1000);
    const cacheKey = `${pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : origin}|${dropoffCoords ? `${dropoffCoords.lat},${dropoffCoords.lng}` : destination}|${bucketTime}`;
    const cached = dmCache.get(cacheKey);
    let element: any;
    if (cached && cached.exp > Date.now()) {
      element = cached.data;
    } else {
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
        dmCache.set(cacheKey, { data: element, exp: Date.now() + 90 * 1000 });
      } catch (mapsError) {
        console.warn('Google Maps API failed, using fallback estimates:', mapsError);
        // Fallback: use estimated distance and duration for Fairfield area
        const estimatedDistanceMeters = 15000; // ~9.3 miles (typical airport to downtown)
        const estimatedDurationSeconds = 1800; // ~30 minutes
        element = {
          distance: { value: estimatedDistanceMeters },
          duration: { value: estimatedDurationSeconds },
          duration_in_traffic: { value: estimatedDurationSeconds * 1.2 } // 20% traffic buffer
        };
        dmCache.set(cacheKey, { data: element, exp: Date.now() + 90 * 1000 });
      }
    }

    const el = element;
    const distanceMeters = el.distance.value;
    const durationSeconds = el.duration.value;
    const durationTrafficSeconds = el.duration_in_traffic?.value ?? durationSeconds;

    const distanceMiles = metersToMiles(distanceMeters);
    const durationMinutes = secondsToMinutes(durationSeconds);
    const durationTrafficMinutes = secondsToMinutes(durationTrafficSeconds);

    // Core pricing
    const timeComponent = durationTrafficMinutes * PER_MINUTE_RATE;
    const distanceComponent = distanceMiles * PER_MILE_RATE;
    const rawSubtotal = BASE_FARE + distanceComponent + timeComponent;

    // Example modifiers (kept conservative; adjust as business rules evolve)
    const trafficMultiplier = Math.max(1, durationTrafficMinutes / Math.max(1, durationMinutes));
    let adjusted = Math.ceil(rawSubtotal * (trafficMultiplier > 1.5 ? 1.2 : trafficMultiplier > 1.2 ? 1.1 : 1));
    if (fareType === 'personal') {
      adjusted = Math.ceil(adjusted * 0.9);
    }

    // Enforce minimum fare
    const minimumFare = Math.ceil(BASE_FARE);
    const total = Math.max(adjusted, minimumFare);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const quote = {
      origin,
      destination,
      pickupCoords: pickupCoords ?? null,
      dropoffCoords: dropoffCoords ?? null,
      fareType,
      pickupTime: pickupTime ?? null,
      distanceMeters,
      durationSeconds,
      durationTrafficSeconds,
      pricing: {
        baseFare: BASE_FARE,
        perMile: PER_MILE_RATE,
        perMinute: PER_MINUTE_RATE
      },
      breakdown: {
        baseFare: Math.ceil(BASE_FARE),
        distanceComponent: Math.ceil(distanceComponent),
        timeComponent: Math.ceil(timeComponent),
        trafficMultiplier: Math.round(trafficMultiplier * 100) / 100
      },
      total,
      expiresAt
    };

    const signature = hmacSign(quote, secret);
    const quoteId = hmacSign(signature + expiresAt, secret).slice(0, 24);

    return NextResponse.json({ quoteId, signature, ...quote });
  } catch (err) {
    console.error('quote error', err);
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 });
  }
}


