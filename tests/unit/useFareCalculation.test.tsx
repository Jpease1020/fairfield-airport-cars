/**
 * useFareCalculation Hook Tests - RTL Approach
 * 
 * Tests the hook with real React Testing Library patterns,
 * focusing on user behavior and real state management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFareCalculation } from '@/hooks/useFareCalculation';

// Mock the provider
const mockSetQuote = vi.fn();

vi.mock('@/providers/BookingProvider', () => ({
  useBooking: () => ({
    setQuote: mockSetQuote
  })
}));

vi.mock('@/lib/utils/anonymous-session', () => ({
  getOrCreateAnonymousSession: () => 'test_session_123'
}));

describe('useFareCalculation Hook - RTL Style', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should calculate fare for real trip data', async () => {
    // Mock realistic API response
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        fare: 95.50,
        distanceMiles: 42.3,
        durationMinutes: 58,
        fareType: 'personal',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      })
    } as Response;

    (global.fetch as any).mockResolvedValue(mockResponse);

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    
    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      pickupDateTime: futureDate
    }));

    // Wait for calculation to complete
    await waitFor(() => {
      expect(result.current.fare).toBe(95.50);
    }, { timeout: 3000 });

    expect(result.current.isCalculating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockSetQuote).toHaveBeenCalledWith(expect.objectContaining({
      fare: 95.50
    }));
  });

  it('should not calculate fare when required data is missing', () => {
    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: '', // Missing dropoff
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: null, // Missing coords
      fareType: 'personal'
    }));

    expect(result.current.fare).toBeNull();
    expect(result.current.isCalculating).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({
        error: 'Google Maps API unavailable'
      })
    } as Response;

    (global.fetch as any).mockResolvedValue(mockResponse);

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    
    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      pickupDateTime: futureDate
    }));

    await waitFor(() => {
      expect(result.current.error).toBe('Google Maps API unavailable');
    });

    expect(result.current.fare).toBeNull();
    expect(result.current.isCalculating).toBe(false);
  });

  it('should recalculate when fare type changes', async () => {
    const personalResponse = {
      ok: true,
      json: () => Promise.resolve({
        fare: 85.50,
        distanceMiles: 42.3,
        durationMinutes: 58,
        fareType: 'personal' as const,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      })
    } as Response;

    const businessResponse = {
      ok: true,
      json: () => Promise.resolve({
        fare: 105.50,
        distanceMiles: 42.3,
        durationMinutes: 58,
        fareType: 'business' as const,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      })
    } as Response;

    (global.fetch as any).mockImplementation((url: string, opts?: { body?: string }) => {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      return Promise.resolve(body.fareType === 'business' ? businessResponse : personalResponse);
    });

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    
    type FareTypeProps = { fareType: 'personal' | 'business' };
    
    const { result, rerender } = renderHook(
      ({ fareType }: FareTypeProps) => useFareCalculation({
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType,
        pickupDateTime: futureDate
      }),
      { initialProps: { fareType: 'personal' as FareTypeProps['fareType'] } }
    );

    // Wait for personal fare
    await waitFor(() => {
      expect(result.current.fare).toBe(85.50);
    });

    // Change to business fare type
    rerender({ fareType: 'business' });

    // Wait for business fare
    await waitFor(() => {
      expect(result.current.fare).toBe(105.50);
    });

    // API should have been called for both fare types
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should resolve to correct fare and not hammer the API excessively', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        fare: 95.50,
        distanceMiles: 42.3,
        durationMinutes: 58,
        fareType: 'personal',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      })
    } as Response;

    (global.fetch as any).mockResolvedValue(mockResponse);

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    
    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      pickupDateTime: futureDate
    }));

    await waitFor(() => {
      expect(result.current.fare).toBe(95.50);
    }, { timeout: 3000 });

    // Value: we get the right fare and we don't spam the quote API (allow for Strict Mode / effect re-runs)
    expect(result.current.fare).toBe(95.50);
    expect(global.fetch).toHaveBeenCalled();
    expect((global.fetch as any).mock.calls.length).toBeLessThanOrEqual(5);
  });
});
