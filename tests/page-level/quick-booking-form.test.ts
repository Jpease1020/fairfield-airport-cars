import { test, expect } from '@playwright/test';

test.describe('Quick Booking Form - Autocomplete Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('autocomplete selection persists when other fields change', async ({ page }) => {
    // Type in pickup location to trigger autocomplete
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('JFK');
    
    // Wait for autocomplete to appear
    await page.waitForTimeout(1000);
    
    // Click on an autocomplete option (simulate selection)
    // Note: This test assumes Google Maps autocomplete is working
    // In a real test environment, you might need to mock this
    await pickupInput.press('ArrowDown');
    await pickupInput.press('Enter');
    
    // Wait for selection to be processed
    await page.waitForTimeout(500);
    
    // Get the selected value
    const selectedPickupValue = await pickupInput.inputValue();
    
    // Now type in dropoff location
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('LGA');
    
    // Wait for autocomplete and select
    await page.waitForTimeout(1000);
    await dropoffInput.press('ArrowDown');
    await dropoffInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Check that pickup value hasn't reverted to typed text
    const finalPickupValue = await pickupInput.inputValue();
    expect(finalPickupValue).toBe(selectedPickupValue);
    expect(finalPickupValue).not.toBe('JFK'); // Should be the full selected address
  });

  test('manual typing works when not using autocomplete', async ({ page }) => {
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    
    // Type manually without selecting from autocomplete
    await pickupInput.fill('123 Main Street, Fairfield, CT');
    
    // Check that the value is set correctly
    await expect(pickupInput).toHaveValue('123 Main Street, Fairfield, CT');
  });

  test('form validation works with autocomplete selections', async ({ page }) => {
    // Fill pickup with autocomplete selection
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('JFK');
    await page.waitForTimeout(1000);
    await pickupInput.press('ArrowDown');
    await pickupInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Fill dropoff with autocomplete selection
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('LGA');
    await page.waitForTimeout(1000);
    await dropoffInput.press('ArrowDown');
    await dropoffInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Fill date and time
    await page.fill('[data-testid="quick-book-datetime-input"]', '2024-12-25T10:00');
    
    // Check that get price button is enabled
    const getPriceButton = page.locator('[data-testid="quick-book-get-price-button"]');
    await expect(getPriceButton).toBeEnabled();
  });

  test('estimated fare updates correctly with autocomplete selections', async ({ page }) => {
    // Fill pickup with autocomplete selection
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('JFK');
    await page.waitForTimeout(1000);
    await pickupInput.press('ArrowDown');
    await pickupInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Fill dropoff with autocomplete selection
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('LGA');
    await page.waitForTimeout(1000);
    await dropoffInput.press('ArrowDown');
    await dropoffInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Check that estimated fare is displayed
    const estimatedFare = page.locator('[data-testid="quick-book-price-display"]');
    await expect(estimatedFare).toBeVisible();
    
    // Check that fare amount is reasonable
    const fareText = await estimatedFare.textContent();
    expect(fareText).toMatch(/\$\d+/);
  });

  test('form data persists when navigating to booking page', async ({ page }) => {
    // Fill form with autocomplete selections
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('JFK');
    await page.waitForTimeout(1000);
    await pickupInput.press('ArrowDown');
    await pickupInput.press('Enter');
    await page.waitForTimeout(500);
    
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('LGA');
    await page.waitForTimeout(1000);
    await dropoffInput.press('ArrowDown');
    await dropoffInput.press('Enter');
    await page.waitForTimeout(500);
    
    await page.fill('[data-testid="quick-book-datetime-input"]', '2024-12-25T10:00');
    
    // Click get price button
    await page.click('[data-testid="quick-book-get-price-button"]');
    
    // Should navigate to booking page
    await expect(page).toHaveURL('/book');
    
    // Check that form data was passed via URL parameters
    const url = page.url();
    expect(url).toContain('pickup=');
    expect(url).toContain('dropoff=');
    expect(url).toContain('date=');
    expect(url).toContain('time=');
  });
});
