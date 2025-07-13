
import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/settings-service';

const mapsClient = new Client({});

export async function POST(request: Request) {
  const { origin, destination } = await request.json();

  const settings = await getSettings();
  const BASE_FARE = settings.baseFare;
  const PER_MILE_RATE = settings.perMile;
  const PER_MINUTE_RATE = settings.perMinute;

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
  }

  try {
    const response = await mapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.rows[0].elements[0].status === 'OK') {
      const distanceInMeters = response.data.rows[0].elements[0].distance.value;
      const durationInSeconds = response.data.rows[0].elements[0].duration.value;

      const distanceInMiles = distanceInMeters / 1609.34;
      const durationInMinutes = durationInSeconds / 60;

      const fare = BASE_FARE + distanceInMiles * PER_MILE_RATE + durationInMinutes * PER_MINUTE_RATE;
      const finalFare = Math.ceil(fare); // Round up to the nearest dollar

      return NextResponse.json({ fare: finalFare });
    } else {
      return NextResponse.json({ error: 'Could not calculate fare' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
