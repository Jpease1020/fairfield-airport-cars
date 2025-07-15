import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export async function POST(request: Request) {
  const { input } = await request.json();

  if (!input) {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await mapsClient.placeAutocomplete({
      params: {
        input,
        key: apiKey,
        components: ['country:us'],
        language: 'en',
      },
    });

    const predictions = response.data.predictions.map((prediction) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: prediction.structured_formatting,
      types: prediction.types,
    }));

    return NextResponse.json({ predictions });
  } catch {
    return NextResponse.json({ error: 'Failed to get predictions' }, { status: 500 });
  }
} 