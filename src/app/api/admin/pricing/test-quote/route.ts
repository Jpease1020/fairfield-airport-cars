import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getPricingConfig } from '@/lib/business/pricing-config';
import { requireAdmin } from '@/lib/utils/auth-server';
import { isAirportLocation } from '@/lib/services/service-area-validation';

const mapsClient = new Client({});

function metersToMiles(m: number): number { return m / 1609.34; }
function secondsToMinutes(s: number): number { return s / 60; }

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const body = await request.json();
    const { origin, destination, pickupCoords, dropoffCoords, fareType, pricingOverrides } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    // Use overrides if provided, otherwise fetch current config
    const savedConfig = await getPricingConfig();
    const pricing = {
      baseFare: pricingOverrides?.baseFare ?? savedConfig.baseFare,
      perMile: pricingOverrides?.perMile ?? savedConfig.perMile,
      perMinute: pricingOverrides?.perMinute ?? savedConfig.perMinute,
      airportReturnMultiplier: pricingOverrides?.airportReturnMultiplier ?? savedConfig.airportReturnMultiplier,
      personalDiscountPercent: pricingOverrides?.personalDiscountPercent ?? savedConfig.personalDiscountPercent,
    };

    // Always geocode the address text, same as the real quote endpoint (quote/route.ts) — using
    // client-supplied coordinates here would let this preview diverge from what a customer is
    // actually charged, since nothing cross-checks that the coordinates correspond to the address.
    const response = await mapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_SERVER_API_KEY!,
        departure_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now for traffic estimate
        traffic_model: 'best_guess' as any,
      },
    });

    const el = response.data.rows[0].elements[0];
    if (el.status !== 'OK') {
      return NextResponse.json({ error: 'Unable to calculate route' }, { status: 400 });
    }

    const distanceMiles = metersToMiles(el.distance.value);
    const durationMinutes = secondsToMinutes(el.duration.value);
    const durationTrafficMinutes = secondsToMinutes(el.duration_in_traffic?.value ?? el.duration.value);

    // Calculate fare with breakdown. Mirrors the real quote endpoint's rounding
    // (src/app/api/booking/quote/route.ts): every stage stays unrounded and Math.ceil is applied
    // exactly once at the end, so this preview matches what a customer is actually charged —
    // this route previously ceil'd at each stage independently (a separate, re-rounded discount
    // amount, then a re-rounded subtotal, then a re-rounded multiplier result), which could
    // show the admin a slightly different fare than the real endpoint would produce.
    const basePortion = pricing.baseFare;
    const mileagePortion = distanceMiles * pricing.perMile;
    const timePortion = durationTrafficMinutes * pricing.perMinute;
    let rawFare = basePortion + mileagePortion + timePortion;
    const preDiscountFare = rawFare;

    let personalDiscount = 0;
    if (fareType === 'personal' && pricing.personalDiscountPercent > 0) {
      rawFare = rawFare * (1 - pricing.personalDiscountPercent / 100);
      personalDiscount = preDiscountFare - rawFare;
    }

    // Check airport return
    const isAirportPickup = isAirportLocation(origin, pickupCoords ?? null);
    const isAirportDropoff = isAirportLocation(destination, dropoffCoords ?? null);
    let returnMultiplierApplied = false;
    const preMultiplierFare = rawFare;

    if (isAirportPickup && !isAirportDropoff) {
      returnMultiplierApplied = true;
      rawFare = rawFare * pricing.airportReturnMultiplier;
    }

    const subtotal = Math.ceil(rawFare);

    return NextResponse.json({
      fare: subtotal,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes: Math.round(durationMinutes),
      durationTrafficMinutes: Math.round(durationTrafficMinutes),
      breakdown: {
        baseFare: Math.round(basePortion * 100) / 100,
        mileageCharge: Math.round(mileagePortion * 100) / 100,
        timeCharge: Math.round(timePortion * 100) / 100,
        subtotalBeforeModifiers: Math.ceil(preDiscountFare),
        personalDiscount: personalDiscount > 0 ? Math.round(personalDiscount * 100) / 100 : null,
        returnMultiplier: returnMultiplierApplied ? pricing.airportReturnMultiplier : null,
        preMultiplierFare: returnMultiplierApplied ? Math.ceil(preMultiplierFare) : null,
      },
      isAirportPickup,
      isAirportDropoff,
      fareType: fareType || 'business',
      pricingUsed: pricing,
    });
  } catch (err: any) {
    console.error('Test quote failed:', err);
    return NextResponse.json({
      error: 'Failed to calculate test quote',
      details: err.message,
    }, { status: 500 });
  }
}
