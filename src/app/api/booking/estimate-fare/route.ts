
import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';

const mapsClient = new Client({});

// Fallback fare calculation when Google Maps API is unavailable
const calculateFallbackFare = (origin: string, destination: string, settings: any) => {
  // Common airport routes with estimated distances
  const airportRoutes: { [key: string]: { [key: string]: number } } = {
    'Fairfield, CT': {
      'JFK Airport': 65,
      'LaGuardia Airport': 55,
      'Newark Airport': 75,
      'Bradley International Airport': 45,
      'Tweed New Haven Airport': 25
    },
    'Bridgeport, CT': {
      'JFK Airport': 60,
      'LaGuardia Airport': 50,
      'Newark Airport': 70,
      'Bradley International Airport': 50,
      'Tweed New Haven Airport': 20
    },
    'Stamford, CT': {
      'JFK Airport': 50,
      'LaGuardia Airport': 40,
      'Newark Airport': 60,
      'Bradley International Airport': 60,
      'Tweed New Haven Airport': 35
    }
  };

  // Try to find a matching route
  for (const [originKey, destinations] of Object.entries(airportRoutes)) {
    if (origin.toLowerCase().includes(originKey.toLowerCase()) || 
        originKey.toLowerCase().includes(origin.toLowerCase())) {
      for (const [destKey, distance] of Object.entries(destinations)) {
        if (destination.toLowerCase().includes(destKey.toLowerCase()) ||
            destKey.toLowerCase().includes(destination.toLowerCase())) {
          return calculateFareFromDistance(distance, settings);
        }
      }
    }
  }

  // Default calculation for unknown routes
  const estimatedDistance = 50; // Default 50 miles
  return calculateFareFromDistance(estimatedDistance, settings);
};

const calculateFareFromDistance = (distanceInMiles: number, settings: any) => {
  const { baseFare, perMile, perMinute } = settings;
  
  // Estimate time based on distance (assuming 60 mph average)
  const estimatedMinutes = distanceInMiles;
  
  const fare = baseFare + (distanceInMiles * perMile) + (estimatedMinutes * perMinute);
  return Math.ceil(fare); // Round up to nearest dollar
};

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
    // Try Google Maps API first
    const response = await mapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.rows[0].elements[0].status === 'OK') {
      const distanceInMeters = response.data.rows[0].elements[0].distance.value;
      const durationInSeconds = response.data.rows[0].elements[0].duration.value;

      const distanceInMiles = distanceInMeters / 1609.34;
      const durationInMinutes = durationInSeconds / 60;

      const fare = BASE_FARE + distanceInMiles * PER_MILE_RATE + durationInMinutes * PER_MINUTE_RATE;
      const finalFare = Math.ceil(fare);

      return NextResponse.json({ 
        fare: finalFare,
        distance: Math.round(distanceInMiles * 10) / 10,
        duration: Math.round(durationInMinutes),
        method: 'google-maps'
      });
    } else {
      throw new Error('Google Maps API returned error');
    }
  } catch (err) {
    console.log('Google Maps API failed, using fallback calculation');
    
    // Use fallback calculation
    const fare = calculateFallbackFare(origin, destination, settings);
    
    return NextResponse.json({ 
      fare: fare,
      method: 'fallback',
      note: 'Fare calculated using estimated distance. Contact us for exact pricing.'
    });
  }
}
