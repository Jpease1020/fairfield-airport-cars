import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export async function POST(request: Request) {
  const { input } = await request.json();

  if (!input) {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  // Debug: Check if API key is available
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY environment variable is not set');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  console.log('API Key available:', apiKey.substring(0, 10) + '...');

  try {
    const response = await mapsClient.placeAutocomplete({
      params: {
        input,
        key: apiKey,
        // Keep it flexible for users anywhere
        components: ['country:us'], // US addresses only
        language: 'en',
        // No types filter for now to get all relevant results
      },
    });

    // Log the actual response to see what we're getting
    console.log('Raw API response:', JSON.stringify(response.data.predictions.slice(0, 2), null, 2));

    const predictions = response.data.predictions.map((prediction) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: prediction.structured_formatting,
      types: prediction.types, // Add types for debugging
    }));

    console.log('Formatted predictions:', predictions.map(p => ({
      description: p.description,
      main_text: p.structured_formatting?.main_text,
      secondary_text: p.structured_formatting?.secondary_text,
      types: p.types
    })));

    return NextResponse.json({ predictions });
  } catch (err) {
    console.error('Places API error:', err);
    const error = err as Error & { response?: { status: number; statusText: string; data: unknown } };
    
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    return NextResponse.json({ 
      error: error.message,
      details: error.response?.data || 'Unknown error'
    }, { status: 500 });
  }
} 