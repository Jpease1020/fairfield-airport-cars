import React from 'react';
import { render, screen } from '@testing-library/react';
import { Page, expect as playwrightExpect } from '@playwright/test';

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
  placesAutocomplete: {
    predictions: [
      { description: 'Fairfield Station, Fairfield, CT' },
      { description: 'JFK Airport, Queens, NY' }
    ]
  },
  cmsContent: {
    pages: {
      book: {
        title: 'Book Your Airport Transfer',
        subtitle: 'Reliable, comfortable transportation to and from Fairfield Airport',
        content: '<div class="mb-8"><h2 class="text-2xl font-semibold mb-4">Why Choose Our Service?</h2></div>'
      }
    }
  }
};

// React Testing Library Helpers
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'test-wrapper' }, children);
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// This function is only used in RTL tests, not Playwright tests
export const expectBookingFormToBeValid = () => {
  // This will be called from RTL tests where jest-dom is available
  const { expect } = require('@jest/globals');
  expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/\(123\) 456-7890/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/pickup/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/dropoff/i)).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: /passengers/i })).toBeInTheDocument();
};

// Playwright Helpers
export const setupPlaywrightMocks = async (page: Page) => {
  await page.route('**/api/places-autocomplete', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.placesAutocomplete)
    });
  });

  await page.route('**/api/booking/estimate-fare', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.fareEstimate)
    });
  });

  await page.route('**/api/payment/create-checkout-session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.paymentSession)
    });
  });

  await page.route('**/api/notifications/send-confirmation', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.confirmation)
    });
  });

  await page.route('**/api/admin/cms/pages', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.cmsContent)
    });
  });
};

export const fillPlaywrightBookingForm = async (page: Page) => {
  await page.fill('input[placeholder*="full name"]', TEST_CUSTOMER.name);
  await page.fill('input[placeholder*="email"]', TEST_CUSTOMER.email);
  await page.fill('input[placeholder*="\\(123\\) 456-7890"]', TEST_CUSTOMER.phone);
  
  await page.fill('input[placeholder*="pickup"]', TEST_CUSTOMER.pickupLocation);
  await page.waitForTimeout(300);
  
  await page.fill('input[placeholder*="dropoff"]', TEST_CUSTOMER.dropoffLocation);
  await page.waitForTimeout(300);
  
  await page.fill('input[type="datetime-local"]', TEST_CUSTOMER.pickupDateTime);
  await page.fill('input[type="number"]', TEST_CUSTOMER.passengers.toString());
  
  await page.fill('input[placeholder*="AA1234"]', TEST_CUSTOMER.flightNumber);
  await page.fill('textarea[placeholder*="special instructions"]', TEST_CUSTOMER.notes);
};

export const expectPlaywrightBookingForm = async (page: Page) => {
  await playwrightExpect(page.locator('input[placeholder*="full name"]')).toBeVisible();
  await playwrightExpect(page.locator('input[placeholder*="email"]')).toBeVisible();
  await playwrightExpect(page.locator('input[placeholder*="\\(123\\) 456-7890"]')).toBeVisible();
  await playwrightExpect(page.locator('input[placeholder*="pickup"]')).toBeVisible();
  await playwrightExpect(page.locator('input[placeholder*="dropoff"]')).toBeVisible();
  await playwrightExpect(page.locator('input[type="number"]')).toBeVisible();
};

export const expectAccessibilityCompliance = async (page: Page) => {
  // Test for heading structure
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();
  playwrightExpect(headingCount).toBeGreaterThan(0);
  
  // Test for alt text on images
  const images = page.locator('img');
  const imageCount = await images.count();
  for (let i = 0; i < imageCount; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    playwrightExpect(alt).toBeTruthy();
  }
  
  // Test for form labels
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const id = await input.getAttribute('id');
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      const hasLabel = await label.count() > 0;
      const hasAriaLabel = await input.getAttribute('aria-label');
      playwrightExpect(hasLabel || hasAriaLabel).toBeTruthy();
    }
  }
};

export const measurePageLoadTime = async (page: Page, url: string) => {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  playwrightExpect(loadTime).toBeLessThan(3000);
  return loadTime;
};

export const takeVisualSnapshot = async (page: Page, name: string) => {
  await page.screenshot({ 
    path: `test-results/${name}.png`,
    fullPage: true 
  });
};

export const simulateApiError = async (page: Page, endpoint: string) => {
  await page.route(endpoint, async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    });
  });
};

export const simulateNetworkTimeout = async (page: Page, endpoint: string) => {
  await page.route(endpoint, async route => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    await route.abort();
  });
}; 