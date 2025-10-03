import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';
import { z } from 'zod';

const mapsClient = new Client({});

function hmacSign(payload: unknown, secret: string): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function POST(request: Request) {
  const secret = process.env.BOOKING_QUOTE_SECRET;
  if (!secret) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

  const schema = z.object({
    quote: z.object({
      origin: z.string(),
      destination: z.string(),
      pickupCoords: z.any().nullable().optional(),
      dropoffCoords: z.any().nullable().optional(),
      fareType: z.enum(['personal', 'business']),
      pickupTime: z.string().nullable().optional(),
      distanceMeters: z.number(),
      durationSeconds: z.number(),
      durationTrafficSeconds: z.number().optional(),
      pricing: z.object({ baseFare: z.number(), perMile: z.number(), perMinute: z.number() }),
      breakdown: z.any(),
      total: z.number(),
      expiresAt: z.string(),
    }),
    signature: z.string().min(16),
    customer: z.any().optional(),
    payment: z.any().optional(),
  });
  const raw = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const { quote, signature, customer, payment } = parsed.data;

  // Verify signature
  const expected = hmacSign(quote, secret);
  if (expected !== signature) return NextResponse.json({ error: 'Invalid quote signature' }, { status: 400 });

  // Verify expiry
  if (!quote.expiresAt || new Date(quote.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Quote expired' }, { status: 400 });
  }

  // Recompute on server to prevent tampering
  try {
    const settings = await getSettings();
    const { baseFare: BASE_FARE, perMile: PER_MILE_RATE, perMinute: PER_MINUTE_RATE } = settings;

    const dm = await mapsClient.distancematrix({
      params: {
        origins: [quote.pickupCoords ? `${quote.pickupCoords.lat},${quote.pickupCoords.lng}` : quote.origin],
        destinations: [quote.dropoffCoords ? `${quote.dropoffCoords.lat},${quote.dropoffCoords.lng}` : quote.destination],
        key: process.env.GOOGLE_MAPS_SERVER_API_KEY!,
        departure_time: quote.pickupTime ? new Date(quote.pickupTime) : new Date(),
        traffic_model: 'best_guess' as any
      }
    });

    if (dm.data.rows[0].elements[0].status !== 'OK') {
      return NextResponse.json({ error: 'Unable to calculate route' }, { status: 400 });
    }

    const el = dm.data.rows[0].elements[0];
    const distanceMiles = el.distance.value / 1609.34;
    const durationMinutes = (el.duration_in_traffic?.value ?? el.duration.value) / 60;
    let recomputed = Math.ceil(BASE_FARE + distanceMiles * PER_MILE_RATE + durationMinutes * PER_MINUTE_RATE);
    if (quote.fareType === 'personal') recomputed = Math.ceil(recomputed * 0.9);

    // Small tolerance (e.g., ±$3) for route fluctuations
    const tolerance = 3;
    if (Math.abs(recomputed - quote.total) > tolerance) {
      return NextResponse.json({ error: 'Price changed', newTotal: recomputed }, { status: 409 });
    }

    // TODO: process payment here securely
    // ... charge ...

    return NextResponse.json({ success: true, chargedTotal: recomputed });
  } catch (err) {
    console.error('submit error', err);
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 });
  }
}


