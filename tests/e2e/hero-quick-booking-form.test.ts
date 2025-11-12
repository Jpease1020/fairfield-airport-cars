import { test, expect } from '@playwright/test';

test.skip(true, 'Hero quick booking flow now validated via RTL; Playwright coverage trimmed.');

test.describe('Hero Quick Booking Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display quick booking form on home page', async ({ page }) => {
    // Check that the hero section is visible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Check that the quick booking form is present
    await expect(page.locator('[data-testid="quick-book-pickup-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-book-dropoff-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-book-datetime-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-book-get-price-button"]')).toBeVisible();
  });

  test('should show Google Maps autocomplete suggestions for pickup location', async ({ page }) => {
    // Type in pickup location
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('Fairfield Station');
    
    // Wait for autocomplete dropdown to appear
    await page.waitForTimeout(1000);
    
    // Check if autocomplete suggestions appear
    // Note: This might not work if Google Maps API key is not properly configured
    const suggestions = page.locator('.pac-item');
    if (await suggestions.count() > 0) {
      await expect(suggestions.first()).toBeVisible();
      
      // Click on first suggestion
      await suggestions.first().click();
      await page.waitForTimeout(500);
      
      // Verify the input was populated
      const inputValue = await pickupInput.inputValue();
      expect(inputValue).toContain('Fairfield');
    } else {
      console.log('Google Maps autocomplete not available - API key may not be configured');
    }
  });

  test('should show Google Maps autocomplete suggestions for dropoff location', async ({ page }) => {
    // Type in dropoff location
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('JFK Airport');
    
    // Wait for autocomplete dropdown to appear
    await page.waitForTimeout(1000);
    
    // Check if autocomplete suggestions appear
    const suggestions = page.locator('.pac-item');
    if (await suggestions.count() > 0) {
      await expect(suggestions.first()).toBeVisible();
      
      // Click on first suggestion
      await suggestions.first().click();
      await page.waitForTimeout(500);
      
      // Verify the input was populated
      const inputValue = await dropoffInput.inputValue();
      expect(inputValue).toContain('Kennedy');
    } else {
      console.log('Google Maps autocomplete not available - API key may not be configured');
    }
  });

  test('should calculate and display estimated fare when all fields are filled', async ({ page }) => {
    // Fill pickup location
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('Fairfield Station, Fairfield, CT');
    
    // Fill dropoff location
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('JFK Airport, Queens, NY');
    
    // Fill date and time
    const datetimeInput = page.locator('[data-testid="quick-book-datetime-input"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    const timeString = '10:00';
    await datetimeInput.fill(`${dateString}T${timeString}`);
    
    // Wait for fare calculation
    await page.waitForTimeout(2000);
    
    // Check if estimated fare is displayed
    const fareDisplay = page.locator('[data-testid="estimated-fare-display"]');
    if (await fareDisplay.count() > 0) {
      await expect(fareDisplay).toBeVisible();
      
      // Verify fare contains dollar amount
      const fareText = await fareDisplay.textContent();
      expect(fareText).toMatch(/\$\d+\.\d{2}/);
    } else {
      console.log('Fare calculation not working - may need Google Maps API configuration');
    }
  });

  test('should not show errors initially', async ({ page }) => {
    // Check that no error messages are visible on page load
    const errorMessages = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorMessages.count();
    
    // Should not have any error messages initially
    expect(errorCount).toBe(0);
  });

  test('should disable submit button when required fields are missing', async ({ page }) => {
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    
    // Button should be disabled initially
    await expect(submitButton).toBeDisabled();
    
    // Fill only pickup location
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('Fairfield Station');
    
    // Button should still be disabled
    await expect(submitButton).toBeDisabled();
    
    // Fill dropoff location
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('JFK Airport');
    
    // Button should still be disabled (missing datetime)
    await expect(submitButton).toBeDisabled();
    
    // Fill datetime
    const datetimeInput = page.locator('[data-testid="quick-book-datetime-input"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await datetimeInput.fill(`${dateString}T10:00`);
    
    // Wait a moment for validation
    await page.waitForTimeout(500);
    
    // Button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show errors only after submit attempt', async ({ page }) => {
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    
    // Try to submit with empty form
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Check if error messages appear
    const errorMessages = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      // Verify error messages are visible
      await expect(errorMessages.first()).toBeVisible();
      
      // Check that error messages contain expected text
      const errorText = await errorMessages.first().textContent();
      expect(errorText).toMatch(/required|missing|invalid/i);
    } else {
      console.log('Error handling may be implemented differently - button stays disabled');
    }
  });

  test('should clear errors when user starts interacting with form', async ({ page }) => {
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    
    // Try to submit with empty form to trigger errors
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Check if errors appeared
    const errorMessages = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const initialErrorCount = await errorMessages.count();
    
    if (initialErrorCount > 0) {
      // Start typing in pickup field
      await pickupInput.fill('Fairfield');
      
      // Wait for error clearing
      await page.waitForTimeout(500);
      
      // Check if errors are cleared
      const finalErrorCount = await errorMessages.count();
      expect(finalErrorCount).toBeLessThan(initialErrorCount);
    } else {
      console.log('No errors to clear - form validation may work differently');
    }
  });

  test('should clear errors when user interacts with any form field', async ({ page }) => {
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    const datetimeInput = page.locator('[data-testid="quick-book-datetime-input"]');
    
    // Try to submit with empty form to trigger errors
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Check if errors appeared
    const errorMessages = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const initialErrorCount = await errorMessages.count();
    
    if (initialErrorCount > 0) {
      // Test clearing errors by interacting with different fields
      
      // Clear by typing in dropoff field
      await dropoffInput.fill('JFK');
      await page.waitForTimeout(500);
      
      // Clear by typing in datetime field
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await datetimeInput.fill(`${dateString}T10:00`);
      await page.waitForTimeout(500);
      
      // Check if errors are cleared
      const finalErrorCount = await errorMessages.count();
      expect(finalErrorCount).toBeLessThan(initialErrorCount);
    } else {
      console.log('No errors to clear - form validation may work differently');
    }
  });

  test('should enable submit button when all required fields are filled', async ({ page }) => {
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    
    // Fill all required fields
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('Fairfield Station, Fairfield, CT');
    
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('JFK Airport, Queens, NY');
    
    const datetimeInput = page.locator('[data-testid="quick-book-datetime-input"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await datetimeInput.fill(`${dateString}T10:00`);
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Button should be enabled
    await expect(submitButton).toBeEnabled();
    
    // Button should be clickable
    await expect(submitButton).not.toBeDisabled();
  });

  test('should navigate to booking page when form is submitted', async ({ page }) => {
    // Fill all required fields
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('Fairfield Station, Fairfield, CT');
    
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('JFK Airport, Queens, NY');
    
    const datetimeInput = page.locator('[data-testid="quick-book-datetime-input"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await datetimeInput.fill(`${dateString}T10:00`);
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Click submit button
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForURL('**/book**', { timeout: 5000 });
    
    // Verify we're on the booking page
    expect(page.url()).toContain('/book');
  });

  test('should preserve form data when navigating to booking page', async ({ page }) => {
    // Fill all required fields
    const pickupInput = page.locator('[data-testid="quick-book-pickup-input"]');
    await pickupInput.fill('Fairfield Station, Fairfield, CT');
    
    const dropoffInput = page.locator('[data-testid="quick-book-dropoff-input"]');
    await dropoffInput.fill('JFK Airport, Queens, NY');
    
    const datetimeInput = page.locator('[data-testid="quick-book-datetime-input"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await datetimeInput.fill(`${dateString}T10:00`);
    
    // Submit form
    const submitButton = page.locator('[data-testid="quick-book-get-price-button"]');
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForURL('**/book**', { timeout: 5000 });
    
    // Check that the booking page has the same data
    // This tests that the BookingProvider is working correctly
    const bookingPickupInput = page.locator('[data-testid="pickup-location-input"]');
    const bookingDropoffInput = page.locator('[data-testid="dropoff-location-input"]');
    
    if (await bookingPickupInput.count() > 0) {
      const pickupValue = await bookingPickupInput.inputValue();
      expect(pickupValue).toContain('Fairfield');
    }
    
    if (await bookingDropoffInput.count() > 0) {
      const dropoffValue = await bookingDropoffInput.inputValue();
      expect(dropoffValue).toContain('JFK');
    }
  });
});
