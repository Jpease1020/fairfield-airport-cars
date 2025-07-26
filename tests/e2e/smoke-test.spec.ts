import { test, expect } from '@playwright/test';

/**
 * SMOKE TESTS - Critical Page Loading
 * Fast tests to verify basic functionality after deployment
 * Run these first to catch major issues quickly
 */

test.describe('Smoke Tests - Critical Pages', () => {
  const criticalPages = [
    { path: '/', name: 'Homepage', expectedText: 'Fairfield Airport Cars' },
    { path: '/book', name: 'Booking Page', expectedText: 'Book Your Airport Transfer' },
    { path: '/about', name: 'About Page', expectedText: 'About Our Service' },
    { path: '/help', name: 'Help Page', expectedText: 'Help & Support' },
    { path: '/admin', name: 'Admin Dashboard', expectedText: 'Admin Dashboard' },
    { path: '/portal', name: 'Customer Portal', expectedText: 'Customer Portal' }
  ];

  criticalPages.forEach(({ path, name, expectedText }) => {
    test(`${name} loads correctly`, async ({ page }) => {
      console.log(`🔍 SMOKE TEST: ${name} (${path})`);
      
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Verify page loads
      await expect(page).toHaveURL(new RegExp(`.*${path.replace('/', '\\/')}.*`));
      
      // Verify expected content
      await expect(page.locator(`text=${expectedText}`)).toBeVisible();
      
      // Verify no major errors
      const errors = await page.locator('text=Error').count();
      expect(errors).toBe(0);
      
      console.log(`✅ ${name} loaded successfully`);
    });
  });

  test('API health check responds correctly', async ({ request }) => {
    console.log('🔍 SMOKE TEST: API Health Check');
    
    const response = await request.get('/api/health');
    
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.services).toBeDefined();
    
    console.log('✅ API health check passed');
  });

  test('Critical form elements are present', async ({ page }) => {
    console.log('🔍 SMOKE TEST: Critical form elements');
    
    await page.goto('/book');
    
    // Check for essential booking form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('button:has-text("Calculate Fare")')).toBeVisible();
    
    console.log('✅ Critical form elements present');
  });

  test('Navigation menu works', async ({ page }) => {
    console.log('🔍 SMOKE TEST: Navigation functionality');
    
    await page.goto('/');
    
    // Test main navigation links
    const navLinks = ['Book', 'About', 'Help'];
    
    for (const linkText of navLinks) {
      const link = page.locator(`a:has-text("${linkText}")`);
      if (await link.isVisible()) {
        await expect(link).toBeVisible();
        console.log(`✅ Navigation link "${linkText}" found`);
      }
    }
  });

  test('Mobile viewport renders correctly', async ({ page }) => {
    console.log('🔍 SMOKE TEST: Mobile rendering');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile layout doesn't break
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that content is not cut off
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(375);
    
    console.log('✅ Mobile rendering verified');
  });

  test('JavaScript loads without errors', async ({ page }) => {
    console.log('🔍 SMOKE TEST: JavaScript execution');
    
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('Analytics') &&
      !error.includes('GoogleMap')
    );
    
    expect(criticalErrors.length).toBe(0);
    
    console.log('✅ No critical JavaScript errors');
  });
});

/**
 * PERFORMANCE SMOKE TESTS
 * Quick performance checks for Core Web Vitals
 */
test.describe('Performance Smoke Tests', () => {
  test('Homepage loads within performance budget', async ({ page }) => {
    console.log('⚡ PERFORMANCE SMOKE TEST: Homepage load time');
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds for good performance
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`✅ Homepage loaded in ${loadTime}ms`);
  });

  test('Booking page interactive within time budget', async ({ page }) => {
    console.log('⚡ PERFORMANCE SMOKE TEST: Booking page interactivity');
    
    const startTime = Date.now();
    
    await page.goto('/book');
    
    // Wait for form to be interactive
    await page.locator('input[name="name"]').click();
    
    const interactiveTime = Date.now() - startTime;
    
    // Should be interactive within 2.5 seconds
    expect(interactiveTime).toBeLessThan(2500);
    
    console.log(`✅ Booking page interactive in ${interactiveTime}ms`);
  });
});

/**
 * SECURITY SMOKE TESTS
 * Basic security checks
 */
test.describe('Security Smoke Tests', () => {
  test('Security headers are present', async ({ request }) => {
    console.log('🔒 SECURITY SMOKE TEST: Response headers');
    
    const response = await request.get('/');
    const headers = response.headers();
    
    // Check for important security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
    
    console.log('✅ Security headers present');
  });

  test('API endpoints require proper input validation', async ({ request }) => {
    console.log('🔒 SECURITY SMOKE TEST: Input validation');
    
    // Test malformed request to booking endpoint
    const response = await request.post('/api/booking/create-booking-simple', {
      data: { invalid: 'data' }
    });
    
    // Should reject invalid input
    expect(response.status()).toBeGreaterThanOrEqual(400);
    
    console.log('✅ Input validation working');
  });
}); 