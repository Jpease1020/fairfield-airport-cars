/**
 * BookingProvider Unit Tests
 * 
 * These tests verify the BookingProvider context and state management
 * functionality in isolation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { BookingProvider, useBooking } from '@/providers/BookingProvider';
import { CMSDataProvider } from '@/design/providers/CMSDataProvider';
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
  describe('24-hour minimum booking validation', () => {
    it('should show error when pickup date/time is less than 24 hours in advance', () => {
      const { result } = renderHook(() => useBooking(), {
        wrapper: ({ children }) => (
          <CMSDataProvider initialCmsData={{}}>
            <BookingProvider>{children}</BookingProvider>
          </CMSDataProvider>
        ),
      });

      act(() => {
        // Set a date/time that's only 12 hours from now (should fail validation)
        const now = new Date();
        const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        const dateTimeString = twelveHoursLater.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format

        result.current.updateTripDetails({
          pickup: { address: '123 Main St', coordinates: { lat: 40.7128, lng: -74.0060 } },
          dropoff: { address: '456 Oak Ave', coordinates: { lat: 40.7580, lng: -73.9855 } },
          pickupDateTime: dateTimeString,
        });
      });

      act(() => {
        result.current.setHasAttemptedValidation(true);
      });

      const validation = result.current.validation;

      // Should have validation error for 24-hour minimum
      expect(validation.isValid).toBe(false);
      expect(validation.fieldErrors?.['pickup-datetime-input']).toBe('Please book at least 24 hours in advance');
      expect(validation.errors).toContain('Please book at least 24 hours in advance');
    });

    it('should allow booking when date/time is more than 24 hours in advance', () => {
      const { result } = renderHook(() => useBooking(), {
        wrapper: ({ children }) => (
          <CMSDataProvider initialCmsData={{}}>
            <BookingProvider>{children}</BookingProvider>
          </CMSDataProvider>
        ),
      });

      act(() => {
        // Set a date/time that's 25 hours from now (should pass validation)
        const now = new Date();
        const twentyFiveHoursLater = new Date(now.getTime() + 25 * 60 * 60 * 1000);
        const dateTimeString = twentyFiveHoursLater.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format

        result.current.updateTripDetails({
          pickup: { address: '123 Main St', coordinates: { lat: 40.7128, lng: -74.0060 } },
          dropoff: { address: '456 Oak Ave', coordinates: { lat: 40.7580, lng: -73.9855 } },
          pickupDateTime: dateTimeString,
        });

        // Set a quote to satisfy validation
        result.current.setQuote({
          quoteId: 'test-quote-123',
          fare: 100,
          fareType: 'personal',
          distanceMiles: 25.5,
          durationMinutes: 35,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          expiresInMinutes: 15,
        });
      });

      act(() => {
        result.current.setHasAttemptedValidation(true);
      });

      const validation = result.current.validation;

      // Should pass validation for trip-details phase
      expect(validation.isValid).toBe(true);
      expect(validation.fieldErrors?.['pickup-datetime-input']).toBeUndefined();
    });
  });

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

    // Set valid form data before navigating
    act(() => {
      // Ensure date/time is at least 25 hours from now to pass 24-hour validation
      const now = new Date();
      const futureDateTime = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now
      
      result.current.updateTripDetails({
        pickup: { address: '123 Main St', coordinates: { lat: 40.7128, lng: -74.0060 } },
        dropoff: { address: '456 Oak Ave', coordinates: { lat: 40.7580, lng: -73.9855 } },
        pickupDateTime: futureDateTime.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
      });
      
      // Set a quote to satisfy validation
      result.current.setQuote({
        quoteId: 'test-quote-123',
        fare: 100,
        fareType: 'personal',
        distanceMiles: 25.5,
        durationMinutes: 35,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInMinutes: 15,
      });
    });

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
