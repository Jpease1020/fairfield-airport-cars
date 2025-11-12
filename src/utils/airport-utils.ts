import { KNOWN_AIRPORTS } from './constants';

/**
 * Check if an address is an airport
 */
export function isAirportAddress(address: string | undefined | null): boolean {
  if (!address) return false;
  const normalized = address.toLowerCase();
  return KNOWN_AIRPORTS.some(airport => 
    normalized.includes(airport.code.toLowerCase()) ||
    normalized.includes(airport.name.toLowerCase()) ||
    normalized.includes('airport')
  );
}

/**
 * Get airport code from address
 */
export function getAirportCode(address: string | undefined | null): string | null {
  if (!address) return null;
  const normalized = address.toLowerCase();
  
  for (const airport of KNOWN_AIRPORTS) {
    if (normalized.includes(airport.code.toLowerCase()) || 
        normalized.includes(airport.name.toLowerCase())) {
      return airport.code;
    }
  }
  
  return null;
}

/**
 * Format dropoff location with terminal if it's an airport
 */
export function formatDropoffWithTerminal(
  dropoffAddress: string | undefined | null,
  terminal: string | undefined | null
): string {
  if (!dropoffAddress) return '';
  
  if (isAirportAddress(dropoffAddress) && terminal && terminal.trim()) {
    return `${dropoffAddress} (${terminal.trim()})`;
  }
  
  return dropoffAddress;
}

