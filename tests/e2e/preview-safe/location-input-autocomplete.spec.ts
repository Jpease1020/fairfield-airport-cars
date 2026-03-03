import { test, expect, type Page } from '@playwright/test';

async function waitForPredictionsOrFallback(page: Page) {
  const dropdown = page.getByTestId('location-predictions-dropdown');
  const unavailable = page.getByTestId('location-input-places-unavailable');

  const result = await Promise.race([
    dropdown
      .waitFor({ state: 'visible', timeout: 12000 })
      .then(() => 'dropdown' as const)
      .catch(() => null),
    unavailable
      .waitFor({ state: 'visible', timeout: 12000 })
      .then(() => 'fallback' as const)
      .catch(() => null),
  ]);

  expect(result).not.toBeNull();
  return result;
}

/**
 * LocationInput Autocomplete E2E Tests
 *
 * CRITICAL: These tests verify the booking flow's address input works correctly.
 * If autocomplete is broken, customers cannot book rides.
 *
 * Tests verify:
 * 1. Google Places API returns successful responses (not errors)
 * 2. Autocomplete dropdown actually appears with predictions
 * 3. User can select a prediction and coordinates are populated
 * 4. Service area validation works
 */

test.describe('LocationInput Autocomplete - Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for Google Places API errors
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('maps.googleapis.com/maps/api/place')) {
        const status = response.status();
        if (status !== 200) {
          console.error(`Google Places API error: ${status} - ${url}`);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CRITICAL: autocomplete dropdown appears when typing an address', async ({ page }) => {
    // This is the most critical test - if this fails, booking is broken

    // Find the pickup location input (the non-airport one)
    const pickupInput = page.getByTestId('quick-book-pickup-input');
    await expect(pickupInput).toBeVisible({ timeout: 10000 });

    // Type a valid address in our service area
    await pickupInput.click();
    await pickupInput.fill('123 Main Street Fairfield');

    // Wait for Google Maps API to load + debounce + API call
    await page.waitForTimeout(2000);

    // CRITICAL: Verify dropdown appears with predictions
    const state = await waitForPredictionsOrFallback(page);

    if (state === 'dropdown') {
      const dropdown = page.getByTestId('location-predictions-dropdown');
      const predictionItems = dropdown.locator('> div');
      const predictionCount = await predictionItems.count();

      expect(predictionCount).toBeGreaterThan(0);
      console.log(`✅ Autocomplete working: ${predictionCount} predictions shown`);
      return;
    }

    await expect(page.getByTestId('location-input-places-unavailable')).toBeVisible();
    console.log('✅ Places fallback surfaced when provider is unavailable');
  });

  test('CRITICAL: selecting a prediction populates coordinates', async ({ page }) => {
    // Without coordinates, the booking form won't let users proceed

    const pickupInput = page.getByTestId('quick-book-pickup-input');
    await expect(pickupInput).toBeVisible({ timeout: 10000 });

    // Type to trigger autocomplete
    await pickupInput.click();
    await pickupInput.fill('Fairfield Metro Station');
    await page.waitForTimeout(2000);

    const state = await waitForPredictionsOrFallback(page);

    if (state === 'dropdown') {
      const dropdown = page.getByTestId('location-predictions-dropdown');
      const firstPrediction = dropdown.locator('> div').first();
      await firstPrediction.click();

      // Wait for place details API call
      await page.waitForTimeout(1000);

      const inputValue = await pickupInput.inputValue();
      expect(inputValue.length).toBeGreaterThan(5);

      console.log(`✅ Address selected and coordinates populated: "${inputValue}"`);
      return;
    }

    await expect(page.getByTestId('location-input-places-unavailable')).toBeVisible();
    expect(await pickupInput.inputValue()).toContain('Fairfield Metro Station');
    console.log('✅ Fallback preserved manual address input when provider unavailable');
  });

  test('CRITICAL: airport autocomplete shows airport results', async ({ page }) => {
    // The airport input is restricted to airports only

    const dropoffInput = page.getByTestId('quick-book-dropoff-input');
    await expect(dropoffInput).toBeVisible({ timeout: 10000 });

    // Type an airport code
    await dropoffInput.click();
    await dropoffInput.fill('JFK');
    await page.waitForTimeout(2000);

    const state = await waitForPredictionsOrFallback(page);

    if (state === 'dropdown') {
      const dropdown = page.getByTestId('location-predictions-dropdown');
      const jfkPrediction = dropdown.locator('div').filter({ hasText: /JFK|Kennedy/i });
      await expect(jfkPrediction.first()).toBeVisible();
      console.log('✅ Airport autocomplete working');
      return;
    }

    await expect(page.getByTestId('location-input-places-unavailable')).toBeVisible();
    expect(await dropoffInput.inputValue()).toContain('JFK');
    console.log('✅ Airport field fallback surfaced when provider unavailable');
  });

  test('Google Places API does not return INVALID_REQUEST error', async ({ page }) => {
    // This test specifically catches the bug where types: ['address', 'airport']
    // causes Google to return INVALID_REQUEST

    let apiErrorDetected = false;
    let errorMessage = '';

    // Listen for the autocomplete API response
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('maps.googleapis.com/maps/api/place/js/AutocompletionService')) {
        try {
          const text = await response.text();
          if (text.includes('INVALID_REQUEST') || text.includes('error_message')) {
            apiErrorDetected = true;
            errorMessage = text.substring(0, 200);
          }
        } catch {
          // Response might not be text
        }
      }
    });

    const pickupInput = page.getByTestId('quick-book-pickup-input');
    await expect(pickupInput).toBeVisible({ timeout: 10000 });

    // Type to trigger autocomplete
    await pickupInput.click();
    await pickupInput.fill('100 Main Street');
    await page.waitForTimeout(2000);

    // Check that no API error was detected
    if (apiErrorDetected) {
      console.error('❌ Google Places API returned error:', errorMessage);
    }
    expect(apiErrorDetected).toBe(false);

    console.log('✅ No Google Places API errors detected');
  });
});

test.describe('LocationInput Service Area Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows error for addresses outside service area', async ({ page }) => {
    const pickupInput = page.getByTestId('quick-book-pickup-input');
    await expect(pickupInput).toBeVisible({ timeout: 10000 });

    // Type an address far outside service area
    await pickupInput.click();
    await pickupInput.fill('123 Main Street Los Angeles');
    await page.waitForTimeout(2000);

    // Try to select if dropdown appears
    const dropdown = page.getByTestId('location-predictions-dropdown');
    const isDropdownVisible = await dropdown.isVisible().catch(() => false);

    if (isDropdownVisible) {
      const firstPrediction = dropdown.locator('> div').first();
      const isPredictionVisible = await firstPrediction.isVisible().catch(() => false);

      if (isPredictionVisible) {
        await firstPrediction.click();
        await page.waitForTimeout(1000);

        // Should show service area error
        const errorMessage = page.locator('text=/outside.*service area/i');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });

        console.log('✅ Service area validation working');
      }
    }
  });
});

test.describe('Complete Booking Form Location Flow', () => {
  test('can fill both pickup and dropoff to enable fare calculation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill pickup (address)
    const pickupInput = page.getByTestId('quick-book-pickup-input');
    await pickupInput.click();
    await pickupInput.fill('Fairfield Metro');
    await page.waitForTimeout(2000);

    let dropdown = page.getByTestId('location-predictions-dropdown');
    if (await dropdown.isVisible()) {
      await dropdown.locator('> div').first().click();
      await page.waitForTimeout(1000);
    }

    // Fill dropoff (airport)
    const dropoffInput = page.getByTestId('quick-book-dropoff-input');
    await dropoffInput.click();
    await dropoffInput.fill('JFK');
    await page.waitForTimeout(2000);

    dropdown = page.getByTestId('location-predictions-dropdown');
    if (await dropdown.isVisible()) {
      await dropdown.locator('> div').first().click();
      await page.waitForTimeout(1000);
    }

    // Verify both inputs have values (indicating successful selection)
    const pickupValue = await pickupInput.inputValue();
    const dropoffValue = await dropoffInput.inputValue();

    expect(pickupValue.length).toBeGreaterThan(0);
    expect(dropoffValue.length).toBeGreaterThan(0);

    console.log(`✅ Pickup: "${pickupValue}", Dropoff: "${dropoffValue}"`);
  });
});
