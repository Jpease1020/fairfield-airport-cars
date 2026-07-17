/**
 * Unit tests for service-area-validation classifyTrip.
 * Ensures two-airport trips are rejected and valid trips pass.
 */
import { describe, it, expect } from 'vitest';
import { classifyTrip, isAirportLocation } from '@/lib/services/service-area-validation';

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

describe('isAirportLocation', () => {
  const jfkCoords = { lat: 40.6413, lng: -73.7781 };
  const fairfieldCoords = { lat: 41.1408, lng: -73.2613 };

  it('returns true for a real airport address with matching coordinates', () => {
    expect(isAirportLocation('JFK Airport, Queens, NY', jfkCoords)).toBe(true);
  });

  it('does not misclassify a real non-airport business whose name happens to contain "airport" or "terminal" (regression: naive substring matching on the address text alone false-positived on names like this)', () => {
    // Real address, nowhere near any known airport — coordinates are the deciding signal now.
    expect(isAirportLocation('Airport Plaza Suites, Fairfield, CT', fairfieldCoords)).toBe(false);
    expect(isAirportLocation('123 Terminal Ave, Fairfield, CT', fairfieldCoords)).toBe(false);
  });

  it('falls back to name/code matching only when coordinates are unavailable', () => {
    expect(isAirportLocation('JFK Airport, Queens, NY', null)).toBe(true);
    expect(isAirportLocation('Airport Plaza Suites, Fairfield, CT', null)).toBe(false);
  });

  it('still recognizes a real airport address even when the supplied coordinates point somewhere else entirely (regression: text match used to only run when coordinates were absent, so spoofed coordinates on a real airport address silently skipped the return-trip multiplier)', () => {
    // Real JFK address text, but coordinates for a spot nowhere near any known airport.
    expect(isAirportLocation('JFK Airport, Queens, NY', fairfieldCoords)).toBe(true);
  });

  it('recognizes common colloquial airport names typed without an autocomplete selection (regression: only the full official name/code matched, so "Newark Airport" and "Bradley Airport" — real phrases customers type — were misclassified as non-airport)', () => {
    expect(isAirportLocation('Newark Airport, NJ', null)).toBe(true);
    expect(isAirportLocation('Bradley Airport, Windsor Locks, CT', null)).toBe(true);
  });
});
