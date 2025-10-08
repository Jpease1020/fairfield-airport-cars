/**
 * BookingProvider Unit Tests
 * 
 * These tests verify the BookingProvider context and state management
 * functionality in isolation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { BookingProvider, useBooking } from '@/providers/BookingProvider';
import { ReactNode } from 'react';

// Mock the useFareCalculation hook
vi.mock('@/hooks/useFareCalculation', () => ({
  useFareCalculation: () => ({
    fare: 85,
    isCalculating: false,
    error: null,
    quoteData: null,
    expiresAt: null,
    expiresInMinutes: null
  })
}));

// Mock the useBookingAvailability hook
vi.mock('@/hooks/useBookingAvailability', () => ({
  useBookingAvailability: () => ({
    error: null,
    checkAvailability: vi.fn()
  })
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <BookingProvider>{children}</BookingProvider>
);

describe('BookingProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial form data', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    expect(result.current.formData).toBeDefined();
    expect(result.current.formData.trip).toBeDefined();
    expect(result.current.formData.customer).toBeDefined();
    expect(result.current.formData.payment).toBeDefined();
  });

  it('should provide initial state values', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    expect(result.current.currentPhase).toBe('trip-details');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
    expect(result.current.currentQuote).toBeNull();
  });

  it('should update trip details', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.updateTripDetails({
        pickup: { address: '123 Main St', coordinates: { lat: 41.1408, lng: -73.2613 } }
      });
    });

    expect(result.current.formData.trip.pickup.address).toBe('123 Main St');
    expect(result.current.formData.trip.pickup.coordinates).toEqual({ lat: 41.1408, lng: -73.2613 });
  });

  it('should update customer info', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.updateCustomerInfo({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      });
    });

    expect(result.current.formData.customer.name).toBe('John Doe');
    expect(result.current.formData.customer.email).toBe('john@example.com');
    expect(result.current.formData.customer.phone).toBe('555-123-4567');
  });

  it('should update payment info', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.updatePaymentInfo({
        tipAmount: 10,
        depositAmount: 0
      });
    });

    expect(result.current.formData.payment.tipAmount).toBe(10);
    expect(result.current.formData.payment.depositAmount).toBe(0);
  });

  it('should navigate between phases', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    expect(result.current.currentPhase).toBe('trip-details');

    act(() => {
      result.current.goToNextPhase();
    });

    expect(result.current.currentPhase).toBe('contact-info');

    act(() => {
      result.current.goToPreviousPhase();
    });

    expect(result.current.currentPhase).toBe('trip-details');
  });

  it('should set quote when provided', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    const mockQuote = {
      quoteId: 'quote_456',
      fare: 85,
      distanceMiles: 20.0,
      durationMinutes: 30,
      fareType: 'personal' as const,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      expiresInMinutes: 15
    };

    act(() => {
      result.current.setQuote(mockQuote);
    });

    expect(result.current.currentQuote?.fare).toBe(85);
  });

  it('should clear error when requested', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    // First trigger an error by submitting without fare
    act(() => {
      result.current.submitBooking();
    });

    expect(result.current.error).toBeTruthy();

    // Then clear it
    act(() => {
      result.current.clearAllErrors();
    });

    expect(result.current.error).toBeNull();
  });

  it('should validate quick booking form', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    // Fill required fields
    act(() => {
      result.current.updateTripDetails({
        pickup: { address: '123 Main St', coordinates: { lat: 41.1408, lng: -73.2613 } },
        dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6413, lng: -73.7781 } },
        pickupDateTime: '2024-12-25T10:00:00'
      });
    });

    act(() => {
      result.current.validateQuickBookingForm();
    });

    expect(result.current.isQuickBookingFormValid()).toBe(true);
  });

  it('should reset form when requested', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: TestWrapper
    });

    // Fill some data
    act(() => {
      result.current.updateTripDetails({
        pickup: { address: '123 Main St', coordinates: { lat: 41.1408, lng: -73.2613 } }
      });
      result.current.setQuote({
        quoteId: 'quote_789',
        fare: 85,
        distanceMiles: 20.0,
        durationMinutes: 30,
        fareType: 'personal',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15
      });
    });

    expect(result.current.formData.trip.pickup.address).toBe('123 Main St');
    expect(result.current.currentQuote?.fare).toBe(85);

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.trip.pickup.address).toBe('');
    expect(result.current.currentPhase).toBe('trip-details');
    expect(result.current.currentQuote).toBeNull(); // Quote should be cleared on reset
  });
});
