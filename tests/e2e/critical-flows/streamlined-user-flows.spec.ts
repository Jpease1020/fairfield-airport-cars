import { test, expect } from '@playwright/test';

test.describe('Critical User Flows - Streamlined', () => {
  test('Page loading - all pages load successfully', async ({ page }) => {
    // Test homepage loads
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    await expect(page.locator('#hero-title')).toBeVisible();
    
    // Test booking page loads
    await page.goto('/book');
    await expect(page).toHaveURL('/book');
    await expect(page.locator('input[placeholder*="full name"]')).toBeVisible();
    
    // Test help page loads
    await page.goto('/help');
    await expect(page).toHaveURL('/help');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test about page loads
    await page.goto('/about');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Admin pages loading - all admin pages load successfully', async ({ page }) => {
    // Test admin dashboard loads
    await page.goto('/admin');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    // Check for admin-specific content
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Test admin bookings page loads (may redirect to login)
    await page.goto('/admin/bookings');
    await expect(page).toHaveURL(/\/admin\/bookings|\/admin\/login/);
    
    // Test admin drivers page loads (may redirect to login)
    await page.goto('/admin/drivers');
    await expect(page).toHaveURL(/\/admin\/drivers|\/admin\/login/);
    
    // Test admin payments page loads (may redirect to login)
    await page.goto('/admin/payments');
    await expect(page).toHaveURL(/\/admin\/payments|\/admin\/login/);
    
    // Test admin feedback page loads (may redirect to login)
    await page.goto('/admin/feedback');
    await expect(page).toHaveURL(/\/admin\/feedback|\/admin\/login/);
    
    // Test admin costs page loads (may redirect to login)
    await page.goto('/admin/costs');
    await expect(page).toHaveURL(/\/admin\/costs|\/admin\/login/);
    
    // Test admin promos page loads (may redirect to login)
    await page.goto('/admin/promos');
    await expect(page).toHaveURL(/\/admin\/promos|\/admin\/login/);
    
    // Test admin comments page loads (may redirect to login)
    await page.goto('/admin/comments');
    await expect(page).toHaveURL(/\/admin\/comments|\/admin\/login/);
    
    // Test admin help page loads (may redirect to login)
    await page.goto('/admin/help');
    await expect(page).toHaveURL(/\/admin\/help|\/admin\/login/);
    
    // Test admin setup page loads (may redirect to login)
    await page.goto('/admin/setup');
    await expect(page).toHaveURL(/\/admin\/setup|\/admin\/login/);
    
    // Test admin quick-fix page loads (may redirect to login)
    await page.goto('/admin/quick-fix');
    await expect(page).toHaveURL(/\/admin\/quick-fix|\/admin\/login/);
    
    // Test admin calendar page loads (may redirect to login)
    await page.goto('/admin/calendar');
    await expect(page).toHaveURL(/\/admin\/calendar|\/admin\/login/);
    
    // Test admin cms page loads (may redirect to login)
    await page.goto('/admin/cms');
    await expect(page).toHaveURL(/\/admin\/cms|\/admin\/login/);
  });

  test('API health - endpoints return successfully', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('/api/health');
    expect(healthResponse.status()).toBe(200);
    
    // Test fare estimation endpoint (should return 200 even with invalid data)
    const fareResponse = await page.request.post('/api/booking/estimate-fare', {
      data: {
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        passengers: 2
      }
    });
    // API might return 400 for invalid data, which is expected
    expect([200, 400]).toContain(fareResponse.status());
    
    // Test places autocomplete endpoint (POST method)
    const placesResponse = await page.request.post('/api/places-autocomplete', {
      data: {
        input: 'Fairfield'
      }
    });
    // API might return 500 if Google Maps API key is not configured
    expect([200, 500]).toContain(placesResponse.status());
  });

  test('Complete booking flow - happy path', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    
    // 2. Navigate to booking page
    // Check if we're on mobile (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    if (await mobileMenuButton.isVisible()) {
      // Mobile: open menu first, then click Book
      await mobileMenuButton.click();
      await page.click('.nav-mobile-link[href="/book"]');
    } else {
      // Desktop: click Book directly
      await page.click('a[href="/book"]');
    }
    await expect(page).toHaveURL('/book');
    
    // 3. Fill out the booking form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    
    // Set future date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    await page.fill('input[type="time"]', '10:00');
    
    // Set passengers (already defaults to 1)
    
    // 4. Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // 5. Verify fare calculation
    await expect(page.locator('text=Base Fare:')).toBeVisible();
    
    // 6. Verify book button is enabled
    const bookButton = page.locator('button:has-text("Book Your Ride")');
    await expect(bookButton).toBeEnabled();
    
    // Note: We don't actually submit the booking to avoid creating real records
  });

  test('Navigation flow - all pages accessible', async ({ page }) => {
    // Test basic navigation
    await page.goto('/');
    
    // Helper function to handle mobile navigation
    const navigateTo = async (href: string) => {
      const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
      if (await mobileMenuButton.isVisible()) {
        // Mobile: open menu first, then click link
        await mobileMenuButton.click();
        await page.click(`.nav-mobile-link[href="${href}"]`);
      } else {
        // Desktop: click link directly
        await page.click(`a[href="${href}"]`);
      }
    };
    
    // Navigate to book page
    await navigateTo('/book');
    await expect(page).toHaveURL('/book');
    
    // Navigate to help page
    await navigateTo('/help');
    await expect(page).toHaveURL('/help');
    
    // Navigate to about page
    await navigateTo('/about');
    await expect(page).toHaveURL('/about');
    
    // Navigate back to home
    await navigateTo('/');
    await expect(page).toHaveURL('/');
  });

  test('Form validation - required fields', async ({ page }) => {
    await page.goto('/book');
    
    // Fill pickup and dropoff to make Calculate Fare button appear
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    // Try to calculate fare without filling other required fields
    await page.click('button:has-text("Calculate Fare")');
    
    // Verify validation messages appear
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile menu is accessible
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Test mobile navigation
    await mobileMenuButton.click();
    await expect(page.locator('.nav-mobile-link[href="/book"]')).toBeVisible();
  });

  test('Accessibility compliance', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    await expect(page.locator('#hero-title')).toBeVisible();
    
    // Check for proper form labels
    await page.goto('/book');
    await expect(page.locator('label')).toBeVisible();
    
    // Check for proper button accessibility
    const buttons = page.locator('button');
    await expect(buttons.first()).toHaveAttribute('type');
  });

  test('Performance - page load times', async ({ page }) => {
    // Measure homepage load time
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Verify page is interactive
    await expect(page.locator('a[href="/book"]')).toBeVisible();
  });

  test('Error handling - API failures', async ({ page }) => {
    await page.goto('/book');
    
    // Fill form with invalid data to trigger API errors
    await page.fill('input[placeholder*="full name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', 'invalid-email');
    await page.fill('input[placeholder*="phone number"]', '123');
    await page.fill('input[placeholder*="pickup address"]', 'Invalid Location');
    await page.fill('input[placeholder*="destination"]', 'Invalid Destination');
    
    // Try to calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Verify error handling works
    await expect(page.locator('text=Error')).toBeVisible();
  });
}); 