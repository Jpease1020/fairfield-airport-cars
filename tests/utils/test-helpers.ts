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

export const expectBookingFormToBeValid = () => {
  expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/pickup/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/dropoff/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /passengers/i })).toBeInTheDocument();
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
  await page.fill('input[placeholder*="phone"]', TEST_CUSTOMER.phone);
  
  await page.fill('input[placeholder*="pickup"]', TEST_CUSTOMER.pickupLocation);
  await page.waitForTimeout(300);
  await page.click('text=Fairfield Station, Fairfield, CT');
  
  await page.fill('input[placeholder*="dropoff"]', TEST_CUSTOMER.dropoffLocation);
  await page.waitForTimeout(300);
  await page.click('text=JFK Airport, Queens, NY');
  
  await page.fill('input[type="datetime-local"]', TEST_CUSTOMER.pickupDateTime);
  await page.selectOption('select[name="passengers"]', TEST_CUSTOMER.passengers.toString());
  await page.fill('input[name="flightNumber"]', TEST_CUSTOMER.flightNumber);
  await page.fill('textarea[name="notes"]', TEST_CUSTOMER.notes);
};

export const expectPlaywrightBookingForm = async (page: Page) => {
  await expect(page.locator('input[placeholder*="full name"]')).toBeVisible();
  await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
  await expect(page.locator('input[placeholder*="phone"]')).toBeVisible();
  await expect(page.locator('input[placeholder*="pickup"]')).toBeVisible();
  await expect(page.locator('input[placeholder*="dropoff"]')).toBeVisible();
  await expect(page.locator('select[name="passengers"]')).toBeVisible();
};

// Accessibility Helpers
export const expectAccessibilityCompliance = async (page: Page) => {
  // Test for proper heading structure
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();
  expect(headingCount).toBeGreaterThan(0);
  
  // Test for alt text on images
  const images = page.locator('img');
  for (let i = 0; i < await images.count(); i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt).toBeTruthy();
  }
  
  // Test for proper form labels
  const formInputs = page.locator('input, select, textarea');
  for (let i = 0; i < await formInputs.count(); i++) {
    const input = formInputs.nth(i);
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const ariaLabel = await input.getAttribute('aria-label');
    
    expect(id || name || ariaLabel).toBeTruthy();
  }
};

// Performance Helpers
export const measurePageLoadTime = async (page: Page, url: string) => {
  const startTime = Date.now();
  await page.goto(url);
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
  return loadTime;
};

// Visual Regression Helpers
export const takeVisualSnapshot = async (page: Page, name: string) => {
  await page.waitForLoadState('networkidle');
  // Screenshot functionality would be implemented here
  console.log(`Taking screenshot: ${name}.png`);
};

// Error Handling Helpers
export const simulateApiError = async (page: Page, endpoint: string) => {
  await page.route(`**${endpoint}`, async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' })
    });
  });
};

export const simulateNetworkTimeout = async (page: Page, endpoint: string) => {
  await page.route(`**${endpoint}`, async route => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.fareEstimate)
    });
  });
}; 