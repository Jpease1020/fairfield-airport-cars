/**
 * Service area validation helpers
 * Centralized logic for validating booking locations against service area rules
 */

import { KNOWN_AIRPORTS } from '@/utils/constants';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ServiceAreaCenter {
  name: string;
  coordinates: Coordinates;
  normalRadiusMiles: number;
  extendedRadiusMiles: number;
}

// Fairfield County service area centers
// Normal radius: standard self-service bookings
// Extended radius: soft-block area (requires call/text)
const SERVICE_AREA_CENTERS: ServiceAreaCenter[] = [
  {
    name: 'Newtown, CT',
    coordinates: { lat: 41.413, lng: -73.310 },
    normalRadiusMiles: 25,
    extendedRadiusMiles: 40,
  },
  {
    name: 'Stamford, CT',
    coordinates: { lat: 41.0534, lng: -73.5387 },
    normalRadiusMiles: 25,
    extendedRadiusMiles: 40,
  },
  {
    name: 'Fairfield, CT',
    coordinates: { lat: 41.1408, lng: -73.2633 },
    normalRadiusMiles: 25,
    extendedRadiusMiles: 40,
  },
  {
    name: 'Westport, CT',
    coordinates: { lat: 41.1415, lng: -73.3579 },
    normalRadiusMiles: 25,
    extendedRadiusMiles: 40,
  },
];

const AIRPORT_KEYWORDS = ['airport', 'terminal', 'intl', 'international'];

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Calculate distance in miles between two coordinates using Haversine formula
 */
export function distanceMilesBetweenCoordinates(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

/**
 * Check if a location is a recognized airport
 */
export function isAirportLocation(
  address?: string | null,
  coords?: Coordinates | null
): boolean {
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

/**
 * Check if coordinates are within the normal service area (standard bookings)
 */
export function isWithinHomeAreaNormal(coords: Coordinates | null | undefined): boolean {
  if (!coords || !isFiniteNumber(coords.lat) || !isFiniteNumber(coords.lng)) {
    return false;
  }

  return SERVICE_AREA_CENTERS.some(center => {
    const distance = distanceMilesBetweenCoordinates(
      coords.lat,
      coords.lng,
      center.coordinates.lat,
      center.coordinates.lng
    );
    return distance <= center.normalRadiusMiles;
  });
}

/**
 * Check if coordinates are within the extended service area (soft-block area)
 */
export function isWithinHomeAreaExtended(coords: Coordinates | null | undefined): boolean {
  if (!coords || !isFiniteNumber(coords.lat) || !isFiniteNumber(coords.lng)) {
    return false;
  }

  return SERVICE_AREA_CENTERS.some(center => {
    const distance = distanceMilesBetweenCoordinates(
      coords.lat,
      coords.lng,
      center.coordinates.lat,
      center.coordinates.lng
    );
    return distance <= center.extendedRadiusMiles;
  });
}

export type TripClassification =
  | 'normal'
  | 'missing_airport'
  | 'soft_block'
  | 'hard_block';

export interface TripValidationResult {
  classification: TripClassification;
  code: string;
  message: string;
}

/**
 * Classify a trip based on pickup and dropoff locations
 */
export function classifyTrip(
  pickupAddress: string,
  dropoffAddress: string,
  pickupCoords: Coordinates | null | undefined,
  dropoffCoords: Coordinates | null | undefined
): TripValidationResult {
  const pickupInHomeNormal = isWithinHomeAreaNormal(pickupCoords);
  const dropoffInHomeNormal = isWithinHomeAreaNormal(dropoffCoords);
  const pickupInHomeExtended = isWithinHomeAreaExtended(pickupCoords);
  const dropoffInHomeExtended = isWithinHomeAreaExtended(dropoffCoords);
  const pickupIsAirport = isAirportLocation(pickupAddress, pickupCoords);
  const dropoffIsAirport = isAirportLocation(dropoffAddress, dropoffCoords);

  // Check if at least one end is an airport
  const hasAirportEndpoint = pickupIsAirport || dropoffIsAirport;

  // Normal in-range trip: at least one end in home normal area, and the other end is either in home normal or is a known airport. AND at least one end must be an airport.
  if (hasAirportEndpoint && (pickupInHomeNormal || dropoffInHomeNormal)) {
    const otherEndInRange = pickupInHomeNormal
      ? (dropoffInHomeNormal || dropoffIsAirport)
      : (pickupInHomeNormal || pickupIsAirport);
    
    if (otherEndInRange) {
      return {
        classification: 'normal',
        code: 'VALID_TRIP',
        message: 'Trip is within service area',
      };
    }
  }

  // Missing airport endpoint: both ends are in home area (normal or extended) but neither is an airport
  if ((pickupInHomeNormal || pickupInHomeExtended) && 
      (dropoffInHomeNormal || dropoffInHomeExtended) && 
      !hasAirportEndpoint) {
    return {
      classification: 'missing_airport',
      code: 'MISSING_AIRPORT_ENDPOINT',
      message: 'We currently only offer trips between Fairfield County, CT and airports. Please make sure either your pickup or dropoff is an airport (e.g. JFK, LGA, EWR, BDL, HVN, HPN).',
    };
  }

  // Soft-block extended trip: not a normal trip, but at least one end is in home extended area or at a known airport within its radius. AND at least one end must be an airport.
  if (hasAirportEndpoint && (pickupInHomeExtended || dropoffInHomeExtended || pickupIsAirport || dropoffIsAirport)) {
    return {
      classification: 'soft_block',
      code: 'OUT_OF_SERVICE_SOFT',
      message: 'This trip is slightly outside our normal self-service area. Please call or text us to see if we can accommodate it.',
    };
  }

  // Hard-block trip: neither end in extended home area, and neither end at a known airport
  return {
    classification: 'hard_block',
    code: 'OUT_OF_SERVICE_HARD',
    message: "We focus on Fairfield County, CT and nearby airports, and we're not able to serve this route.",
  };
}

