import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export async function POST(request: Request) {
  const { input } = await request.json();

  if (!input) {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_SERVER_API_KEY not configured');
    return NextResponse.json({ 
      error: 'Google Maps API key not configured. Please set GOOGLE_MAPS_SERVER_API_KEY in your environment variables.',
      debug: {
        hasApiKey: !!apiKey,
        envVars: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
      }
    }, { status: 500 });
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
  } catch (error) {
    console.error('Places Autocomplete API error:', error);
    return NextResponse.json({ 
      error: 'Failed to get predictions from Google Places API',
      debug: {
        input,
        hasApiKey: !!apiKey,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
} 