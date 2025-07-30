import React from 'react';
import { render, screen } from '@testing-library/react';
import { Page } from '@playwright/test';

// Test data constants
export const TEST_CUSTOMER = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '203-555-0123',
  pickupLocation: 'Fairfield Station, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY',
  pickupDateTime: '2024-12-25T10:00',
  passengers: 2,
  flightNumber: 'AA123',
  notes: 'Please pick up at the main entrance'
};

export const MOCK_API_RESPONSES = {
  fareEstimate: { fare: 150, distance: '45 miles', duration: '1 hour 15 minutes' },
  paymentSession: { checkoutUrl: 'https://squareup.com/checkout/test-session' },
  confirmation: { success: true, messageId: 'test-123' },
  placesAutocomplete: [
    { description: 'Fairfield Station, Fairfield, CT' },
    { description: 'JFK Airport, Queens, NY' }
  ]
};

// Helper functions for testing
export const createMockBooking = (overrides = {}) => ({
  id: 'test-booking-123',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '203-555-0123',
  pickupLocation: 'Fairfield Station',
  dropoffLocation: 'JFK Airport',
  pickupDateTime: '2024-12-25T10:00:00Z',
  passengers: 2,
  fare: 150,
  status: 'confirmed',
  ...overrides
});

// Playwright-specific helpers (for E2E tests)
export const expectPlaywrightBookingForm = async (page: Page) => {
  // These will be used in Playwright tests where 'expect' is available globally
  await page.locator('input[placeholder*="full name"]').waitFor();
  await page.locator('input[placeholder*="email"]').waitFor();
  await page.locator('input[placeholder*="phone"]').waitFor();
  await page.locator('input[placeholder*="pickup"]').waitFor();
  await page.locator('input[placeholder*="dropoff"]').waitFor();
  await page.locator('select[name="passengers"]').waitFor();
};

// RTL-specific helpers (for unit tests)
export const expectRTLBookingForm = () => {
  // These will be used in RTL tests where 'expect' is available globally
  screen.getByTestId('name-input');
  screen.getByTestId('email-input');
  screen.getByTestId('phone-input');
  screen.getByTestId('pickup-input');
  screen.getByTestId('dropoff-input');
  screen.getByTestId('passengers-input');
}; 