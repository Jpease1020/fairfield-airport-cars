/**
 * Unit tests for service-area-validation classifyTrip.
 * Ensures two-airport trips are rejected and valid trips pass.
 */
import { describe, it, expect } from 'vitest';
import { classifyTrip } from '@/lib/services/service-area-validation';

describe('classifyTrip', () => {
  const fairfieldCoords = { lat: 41.1408, lng: -73.2613 };
  const jfkCoords = { lat: 40.6413, lng: -73.7781 };
  const lgaCoords = { lat: 40.7769, lng: -73.874 };

  it('returns TWO_AIRPORTS_NOT_ALLOWED when both pickup and dropoff are airports', () => {
    const result = classifyTrip(
      'JFK Airport, Queens, NY',
      'LaGuardia Airport, Queens, NY',
      jfkCoords,
      lgaCoords
    );
    expect(result.code).toBe('TWO_AIRPORTS_NOT_ALLOWED');
    expect(result.classification).toBe('invalid');
    expect(result.message).toContain('Fairfield County');
    expect(result.message).toContain('home or business address');
  });

  it('allows valid trip from Fairfield to JFK', () => {
    const result = classifyTrip(
      'Fairfield Station, Fairfield, CT',
      'JFK Airport, Queens, NY',
      fairfieldCoords,
      jfkCoords
    );
    expect(result.classification).toBe('normal');
    expect(result.code).toBe('VALID_TRIP');
  });

  it('allows valid trip from JFK to Fairfield', () => {
    const result = classifyTrip(
      'JFK Airport, Queens, NY',
      'Fairfield Station, Fairfield, CT',
      jfkCoords,
      fairfieldCoords
    );
    expect(result.classification).toBe('normal');
    expect(result.code).toBe('VALID_TRIP');
  });
});
