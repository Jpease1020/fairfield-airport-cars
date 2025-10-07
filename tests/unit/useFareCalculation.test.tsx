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
const mockSetFare = vi.fn();

vi.mock('@/providers/BookingProvider', () => ({
  useBooking: () => ({
    setFare: mockSetFare
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
    };

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal'
    }));

    // Wait for calculation to complete
    await waitFor(() => {
      expect(result.current.fare).toBe(95.50);
    });

    expect(result.current.isCalculating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockSetFare).toHaveBeenCalledWith(95.50);
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
    };

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal'
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
        fareType: 'personal',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      })
    };

    const businessResponse = {
      ok: true,
      json: () => Promise.resolve({
        fare: 105.50,
        distanceMiles: 42.3,
        durationMinutes: 58,
        fareType: 'business',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      })
    };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(personalResponse)
      .mockResolvedValueOnce(businessResponse);

    const { result, rerender } = renderHook(
      ({ fareType }) => useFareCalculation({
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType
      }),
      { initialProps: { fareType: 'personal' } }
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

    // Should have called API twice
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should prevent multiple simultaneous calculations', async () => {
    const mockResponse = {
      ok: true,
      json: () => new Promise(resolve => 
        setTimeout(() => resolve({
          fare: 95.50,
          distanceMiles: 42.3,
          durationMinutes: 58,
          fareType: 'personal',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          expiresInMinutes: 15
        }), 100)
      )
    };

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFareCalculation({
      pickupLocation: 'Fairfield Station, Fairfield, CT',
      dropoffLocation: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal'
    }));

    // Trigger multiple calculations rapidly
    act(() => {
      // This should only trigger one API call due to debouncing
      result.current.calculateFare?.();
      result.current.calculateFare?.();
      result.current.calculateFare?.();
    });

    await waitFor(() => {
      expect(result.current.fare).toBe(95.50);
    });

    // Should only call API once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
