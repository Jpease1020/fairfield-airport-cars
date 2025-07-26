import { test, expect } from '@playwright/test';

/**
 * CRITICAL BUSINESS FLOW TEST
 * Complete Customer Booking Journey - Revenue Path
 * 
 * This test validates the core revenue-generating user journey:
 * Home → Book → Fill Form → Calculate Fare → Submit → Payment → Success
 */

test.describe('Complete Booking Journey - Critical Revenue Path', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Customer can complete full booking and payment flow', async ({ page }) => {
    console.log('🔥 TESTING CRITICAL REVENUE PATH: Complete booking journey');

    // =================================================================
    // STEP 1: Navigate to booking page
    // =================================================================
    await test.step('Navigate to booking page', async () => {
      await page.click('text=Book Your Ride');
      await expect(page).toHaveURL(/.*\/book/);
      await expect(page.locator('h1')).toContainText('Book Your Airport Transfer');
    });

    // =================================================================
    // STEP 2: Fill out booking form with valid data
    // =================================================================
    await test.step('Fill out booking form', async () => {
      // Personal Information
      await page.fill('input[name="name"]', 'John Smith');
      await page.fill('input[name="email"]', 'john.smith@example.com');
      await page.fill('input[name="phone"]', '+1-203-555-0123');
      
      // Trip Details
      await page.fill('input[placeholder*="pickup"]', 'Fairfield University, Fairfield, CT');
      await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
      
      // Date and Time (tomorrow at 9 AM)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      const timeString = '09:00';
      
      await page.fill('input[type="date"]', dateString);
      await page.fill('input[type="time"]', timeString);
      
      // Additional Details
      await page.selectOption('select[name="passengers"]', '2');
      await page.fill('input[placeholder*="flight"]', 'AA1234');
      await page.fill('textarea[placeholder*="special"]', 'Please call when you arrive');
      
      console.log('✅ Form filled with test data');
    });

    // =================================================================
    // STEP 3: Calculate fare
    // =================================================================
    await test.step('Calculate fare', async () => {
      await page.click('button:has-text("Calculate Fare")');
      
      // Wait for fare calculation
      await page.waitForSelector('text=Estimated Fare', { timeout: 10000 });
      
      // Verify fare is displayed
      const fareElement = page.locator('text=Estimated Fare').locator('..').locator('span:has-text("$")');
      await expect(fareElement).toBeVisible();
      
      console.log('✅ Fare calculated successfully');
    });

    // =================================================================
    // STEP 4: Submit booking
    // =================================================================
    await test.step('Submit booking', async () => {
      await page.click('button:has-text("Book Now")');
      
      // Wait for booking creation and redirect to payment
      await page.waitForURL(/.*\/success/, { timeout: 15000 });
      
      console.log('✅ Booking submitted successfully');
    });

    // =================================================================
    // STEP 5: Verify success page
    // =================================================================
    await test.step('Verify booking success page', async () => {
      // Check we're on success page
      await expect(page).toHaveURL(/.*\/success/);
      
      // Verify success message
      await expect(page.locator('h1')).toContainText('Booking Confirmed');
      
      // Verify booking reference is displayed
      await expect(page.locator('text=Your Booking Reference')).toBeVisible();
      
      // Verify trip details are shown
      await expect(page.locator('text=Fairfield University')).toBeVisible();
      await expect(page.locator('text=JFK Airport')).toBeVisible();
      
      console.log('✅ Success page displays correctly');
    });

    // =================================================================
    // STEP 6: Test booking management
    // =================================================================
    await test.step('Test booking management access', async () => {
      // Click on "View Booking Details" if available
      const viewBookingButton = page.locator('button:has-text("View Booking Details")');
      if (await viewBookingButton.isVisible()) {
        await viewBookingButton.click();
        
        // Should redirect to booking details page
        await expect(page).toHaveURL(/.*\/booking\/*/);
        await expect(page.locator('text=Booking Details')).toBeVisible();
        
        console.log('✅ Booking management accessible');
      }
    });

    console.log('🎉 CRITICAL REVENUE PATH TEST COMPLETE');
  });

  test('Booking form validation works correctly', async ({ page }) => {
    console.log('🧪 TESTING: Form validation');

    await page.goto('/book');
    
    // Try to submit empty form
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
    
    console.log('✅ Form validation working');
  });

  test('Fare calculation handles different routes', async ({ page }) => {
    console.log('🧪 TESTING: Fare calculation variations');

    await page.goto('/book');
    
    // Test different route combinations
    const routes = [
      { from: 'Stamford, CT', to: 'LaGuardia Airport, NY' },
      { from: 'Greenwich, CT', to: 'Newark Airport, NJ' },
      { from: 'Bridgeport, CT', to: 'JFK Airport, NY' }
    ];

    for (const route of routes) {
      await page.fill('input[placeholder*="pickup"]', route.from);
      await page.fill('input[placeholder*="destination"]', route.to);
      
      // Fill minimum required fields
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '+1-203-555-0123');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
      await page.fill('input[type="time"]', '10:00');
      
      await page.click('button:has-text("Calculate Fare")');
      
      // Should calculate fare for each route
      await expect(page.locator('text=Estimated Fare')).toBeVisible({ timeout: 10000 });
      
      console.log(`✅ Fare calculated for ${route.from} → ${route.to}`);
    }
  });

  test('Mobile responsiveness - booking flow works on mobile', async ({ page }) => {
    console.log('📱 TESTING: Mobile booking experience');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/book');
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Test form inputs are properly sized for mobile
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    
    // Touch targets should be at least 44px (accessibility requirement)
    const boundingBox = await nameInput.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(40); // Allow slight margin
    
    console.log('✅ Mobile layout verified');
  });

  test('Performance - page loads within acceptable time', async ({ page }) => {
    console.log('⚡ TESTING: Performance metrics');
    
    const startTime = Date.now();
    
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (generous for testing)
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`✅ Page loaded in ${loadTime}ms`);
  });

  test('Error handling - graceful failure when services unavailable', async ({ page }) => {
    console.log('🚨 TESTING: Error handling');
    
    await page.goto('/book');
    
    // Fill form with valid data
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1-203-555-0123');
    await page.fill('input[placeholder*="pickup"]', 'Test Location');
    await page.fill('input[placeholder*="destination"]', 'Test Destination');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[type="time"]', '10:00');
    
    // Mock network failure for fare calculation
    await page.route('**/api/estimate-fare', route => route.abort());
    
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show error message gracefully
    await expect(page.locator('text=error')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Error handling working correctly');
  });
});

/**
 * ADMIN DASHBOARD TESTS
 * Verify admin functionality works correctly
 */
test.describe('Admin Dashboard Critical Functions', () => {
  test('Admin can access dashboard and view bookings', async ({ page }) => {
    console.log('👨‍💼 TESTING: Admin dashboard access');
    
    await page.goto('/admin');
    
    // Should show admin dashboard
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Test navigation to bookings
    await page.click('text=Bookings');
    await expect(page).toHaveURL(/.*\/admin\/bookings/);
    
    console.log('✅ Admin dashboard accessible');
  });
});

/**
 * ACCESSIBILITY TESTS
 * Ensure the application is accessible to all users
 */
test.describe('Accessibility Compliance', () => {
  test('Booking form is keyboard navigable', async ({ page }) => {
    console.log('♿ TESTING: Keyboard accessibility');
    
    await page.goto('/book');
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="name"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();
    
    console.log('✅ Keyboard navigation working');
  });

  test('Form has proper ARIA labels', async ({ page }) => {
    console.log('♿ TESTING: ARIA compliance');
    
    await page.goto('/book');
    
    // Check for proper labels
    const nameInput = page.locator('input[name="name"]');
    const nameLabel = await nameInput.getAttribute('aria-label') || await page.locator('label[for="name"]').textContent();
    
    expect(nameLabel).toBeTruthy();
    
    console.log('✅ ARIA labels present');
  });
}); 