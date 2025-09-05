
import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { getSettings } from '@/lib/business/settings-service';

const mapsClient = new Client({});

// Dynamic fare calculation when Google Maps API is unavailable
const calculateFallbackFare = (origin: string, destination: string, settings: any, fareType?: string) => {
  // Use a more generic approach instead of hardcoded routes
  // Estimate distance based on location keywords
  let estimatedDistance = 50; // Default 50 miles
  
  // Simple keyword-based distance estimation
  if (destination.toLowerCase().includes('airport')) {
    if (origin.toLowerCase().includes('local') || origin.toLowerCase().includes('airport')) {
      estimatedDistance = 60; // Local area to NYC airports
    } else if (origin.toLowerCase().includes('stamford')) {
      estimatedDistance = 45; // Stamford to NYC airports
    } else if (origin.toLowerCase().includes('new haven')) {
      estimatedDistance = 80; // New Haven to NYC airports
    }
  }
  
  return calculateFareFromDistance(estimatedDistance, settings, fareType);
};

const calculateFareFromDistance = (distanceInMiles: number, settings: any, fareType?: string) => {
  const { baseFare, perMile, perMinute } = settings;
  
  // Estimate time based on distance (assuming 60 mph average)
  const estimatedMinutes = distanceInMiles;
  
  const originalFare = baseFare + (distanceInMiles * perMile) + (estimatedMinutes * perMinute);
  let finalFare = Math.ceil(originalFare);
  
  // Apply 10% discount for personal rides
  if (fareType === 'personal') {
    finalFare = Math.ceil(originalFare * 0.9); // 10% discount
    console.log(`Fallback: Personal ride discount applied: Base fare $${Math.ceil(originalFare)} -> Final fare $${finalFare}`);
  } else {
    console.log(`Fallback: Business ride: No discount applied. Fare: $${finalFare}`);
  }
  
  return { finalFare, baseFare: Math.ceil(originalFare) };
};

export async function POST(request: Request) {
  const { origin, destination, fareType = 'business' } = await request.json();

  const settings = await getSettings();
  console.log('Settings loaded:', settings);
  const BASE_FARE = settings.baseFare;
  const PER_MILE_RATE = settings.perMile;
  const PER_MINUTE_RATE = settings.perMinute;

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
  }

  try {
    // Try Google Maps API with traffic data
    const response = await mapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        departure_time: new Date(),
        traffic_model: 'best_guess' as any
      },
    });

    if (response.data.rows[0].elements[0].status === 'OK') {
      const element = response.data.rows[0].elements[0];
      const distanceInMeters = element.distance.value;
      const durationInSeconds = element.duration.value;
      const durationInTrafficSeconds = element.duration_in_traffic?.value || durationInSeconds;

      const distanceInMiles = distanceInMeters / 1609.34;
      const durationInMinutes = durationInSeconds / 60;
      const durationInTrafficMinutes = durationInTrafficSeconds / 60;

      // Calculate traffic multiplier
      const trafficMultiplier = durationInTrafficMinutes / durationInMinutes;
      let trafficLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (trafficMultiplier > 1.5) {
        trafficLevel = 'high';
      } else if (trafficMultiplier > 1.2) {
        trafficLevel = 'medium';
      }

      // Calculate base fare using traffic-adjusted time
      const baseFare = BASE_FARE + distanceInMiles * PER_MILE_RATE + durationInTrafficMinutes * PER_MINUTE_RATE;
      let finalFare = Math.ceil(baseFare);
      
      // Apply traffic-based pricing adjustments
      if (trafficLevel === 'high') {
        finalFare = Math.ceil(finalFare * 1.2); // 20% increase for heavy traffic
        console.log(`Heavy traffic detected (${trafficMultiplier.toFixed(2)}x), applying 20% increase`);
      } else if (trafficLevel === 'medium') {
        finalFare = Math.ceil(finalFare * 1.1); // 10% increase for moderate traffic
        console.log(`Moderate traffic detected (${trafficMultiplier.toFixed(2)}x), applying 10% increase`);
      }
      
      // Apply 10% discount for personal rides
      if (fareType === 'personal') {
        finalFare = Math.ceil(finalFare * 0.9); // 10% discount
        console.log(`Personal ride discount applied: Final fare $${finalFare}`);
      } else {
        console.log(`Business ride: No discount applied. Fare: $${finalFare}`);
      }

      return NextResponse.json({ 
        fare: finalFare,
        baseFare: Math.ceil(baseFare), // Original fare before traffic adjustments
        distance: Math.round(distanceInMiles * 10) / 10,
        duration: Math.round(durationInTrafficMinutes), // Use traffic-adjusted duration
        trafficLevel,
        trafficMultiplier: Math.round(trafficMultiplier * 100) / 100,
        method: 'google-maps-traffic'
      });
    } else {
      throw new Error('Google Maps API returned error');
    }
  } catch (err) {
    console.log('Google Maps API failed, using fallback calculation');
    
    // Use fallback calculation
    const fareData = calculateFallbackFare(origin, destination, settings, fareType);
    
    return NextResponse.json({ 
      fare: fareData.finalFare,
      baseFare: fareData.baseFare,
      method: 'fallback',
      note: 'Fare calculated using estimated distance. Contact us for exact pricing.'
    });
  }
}
