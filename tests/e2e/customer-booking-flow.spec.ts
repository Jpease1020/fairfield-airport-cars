import { test, expect, Page } from '@playwright/test';

const TEST_PICKUP_COORDS = { lat: 41.1408, lng: -73.2613 };
const TEST_DROPOFF_COORDS = { lat: 40.6413, lng: -73.7781 };
const FIFTEEN_MINUTES = 15 * 60 * 1000;

type SeedOverrides = {
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupDateTime?: string;
  fareType?: 'personal' | 'business';
};

const buildSeedFormData = ({
  pickupAddress = 'Fairfield CT',
  dropoffAddress = 'JFK Airport',
  pickupDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  fareType = 'business',
}: SeedOverrides = {}) => ({
  trip: {
    pickup: {
      address: pickupAddress,
      coordinates: TEST_PICKUP_COORDS,
    },
    dropoff: {
      address: dropoffAddress,
      coordinates: TEST_DROPOFF_COORDS,
    },
    pickupDateTime,
    fareType,
    flightInfo: {
      hasFlight: false,
      airline: '',
      flightNumber: '',
      arrivalTime: '',
      terminal: '',
    },
  },
  customer: {
    name: '',
    email: '',
    phone: '',
    notes: '',
    saveInfoForFuture: false,
  },
  payment: {
    depositAmount: null,
    balanceDue: 0,
    depositPaid: false,
    tipAmount: 0,
    tipPercent: 15,
    totalAmount: 0,
  },
});

const seedBookingForm = async (page: Page, overrides?: SeedOverrides) => {
  const formData = buildSeedFormData(overrides);
  await page.addInitScript((data) => {
    window.sessionStorage.setItem('booking-form-data', JSON.stringify(data));
  }, formData);
};

const stubQuoteEndpoint = async (page: Page, fare = 125.5) => {
  await page.route('**/api/booking/quote', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        quoteId: 'test-quote',
        fare,
        distanceMiles: 42.3,
        durationMinutes: 58,
        fareType: 'business',
        expiresAt: new Date(Date.now() + FIFTEEN_MINUTES).toISOString(),
        expiresInMinutes: 15,
      }),
    });
  });
};

const stubSubmitEndpoint = async (
  page: Page,
  response: { status: number; body: Record<string, unknown> },
) => {
  await page.route('**/api/booking/submit', async (route) => {
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
};

const formatDateTimeForInput = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Customer booking smoke coverage – keeps a single happy path journey in Playwright.
 * Detailed validation is handled by RTL suites.
 */

test.describe('Customer Booking Smoke Flow', () => {
  test('guest can complete a full booking', async ({ page }) => {
    const pickupDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await stubQuoteEndpoint(page);
    await stubSubmitEndpoint(page, {
      status: 200,
      body: { success: true, bookingId: 'test-booking-123', emailWarning: null },
    });
    await seedBookingForm(page, { pickupDateTime: pickupDate.toISOString() });

    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="fare-display"]')).toBeVisible({ timeout: 10000 });

    // Trip details already seeded; verify and continue
    const dateInput = page.locator('[data-testid="pickup-datetime-input"] input:not([aria-hidden="true"])').first();
    await dateInput.fill(formatDateTimeForInput(pickupDate));
    await dateInput.press('Enter');

    await page.locator('[data-testid="trip-details-next-button"]').click();

    // Contact details
    await page.locator('[data-testid="name-input"]').fill('John Doe');
    await page.locator('[data-testid="email-input"]').fill('john.doe@example.com');
    await page.locator('[data-testid="phone-input"]').fill('(555) 123-4567');
    await page.locator('[data-testid="contact-info-continue-button"]').click();

    // Payment summary + submit
    await expect(page.locator('[data-testid="payment-phase-container"]')).toBeVisible();
    await page.locator('[data-testid="payment-process-button"]').click();

    // Optional flight info – keep minimal to ensure success screen
    const flightInfoContinue = page.locator('[data-testid="flight-info-complete-button"]');
    try {
      await flightInfoContinue.waitFor({ state: 'visible', timeout: 5000 });
      await flightInfoContinue.click();
    } catch {
      // Flight info phase may be skipped; nothing to do.
    }

    await expect(page.locator('[data-testid="booking-success-message"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('displays expired quote message when server rejects submission', async ({ page }) => {
    const pickupDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await stubQuoteEndpoint(page);
    await stubSubmitEndpoint(page, {
      status: 409,
      body: {
        error: 'Your quote has expired. Please request a new quote.',
        code: 'QUOTE_EXPIRED',
      },
    });
    await seedBookingForm(page, { pickupDateTime: pickupDate.toISOString() });

    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    const dateInput = page.locator('[data-testid="pickup-datetime-input"] input:not([aria-hidden="true"])').first();
    await dateInput.fill(formatDateTimeForInput(pickupDate));
    await dateInput.press('Enter');

    await page.locator('[data-testid="trip-details-next-button"]').click();

    await page.locator('[data-testid="name-input"]').fill('Quote Expired');
    await page.locator('[data-testid="email-input"]').fill('quote.expired@example.com');
    await page.locator('[data-testid="phone-input"]').fill('(555) 000-0000');
    await page.locator('[data-testid="contact-info-continue-button"]').click();

    await expect(page.locator('[data-testid="payment-phase-container"]')).toBeVisible();
    await page.locator('[data-testid="payment-process-button"]').click();

    const errorMessage = page.locator('[data-testid="payment-error-message"]').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    await expect(errorMessage).toContainText('Your fare has expired');
  });
});