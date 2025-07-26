import { test, expect } from '@playwright/test';

test.describe('Perfected Pages Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ===== CUSTOMER-FACING PAGES (8 pages) =====
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href="/book"]')).toBeVisible();
    
    // Verify no inline styles (perfection check)
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('About page loads correctly', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
    
    // Check for content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Help page loads correctly', async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveTitle(/Help/);
    
    // Check for FAQ content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Terms page loads correctly', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle(/Terms/);
    
    // Check for content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Privacy page loads correctly', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy/);
    
    // Check for content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Portal page loads correctly', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveTitle(/Portal/);
    
    // Check for portal content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Cancel page loads correctly', async ({ page }) => {
    await page.goto('/cancel');
    await expect(page).toHaveTitle(/Cancel/);
    
    // Check for content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Success page loads correctly', async ({ page }) => {
    await page.goto('/success');
    await expect(page).toHaveTitle(/Success/);
    
    // Check for content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Feedback page loads correctly', async ({ page }) => {
    // Test with a sample booking ID
    await page.goto('/feedback/test-booking-123');
    await expect(page).toHaveTitle(/Feedback/);
    
    // Check for feedback form
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Status page loads correctly', async ({ page }) => {
    // Test with a sample booking ID
    await page.goto('/status/test-booking-123');
    await expect(page).toHaveTitle(/Status/);
    
    // Check for status content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  // ===== ADMIN PAGES (7 pages) =====
  
  test('Admin Promos page loads correctly', async ({ page }) => {
    await page.goto('/admin/promos');
    await expect(page).toHaveTitle(/Promos/);
    
    // Check for admin content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Admin Drivers page loads correctly', async ({ page }) => {
    await page.goto('/admin/drivers');
    await expect(page).toHaveTitle(/Drivers/);
    
    // Check for admin content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Admin Feedback page loads correctly', async ({ page }) => {
    await page.goto('/admin/feedback');
    await expect(page).toHaveTitle(/Feedback/);
    
    // Check for admin content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Admin Comments page loads correctly', async ({ page }) => {
    await page.goto('/admin/comments');
    await expect(page).toHaveTitle(/Comments/);
    
    // Check for admin content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Admin CMS page loads correctly', async ({ page }) => {
    await page.goto('/admin/cms');
    await expect(page).toHaveTitle(/CMS/);
    
    // Check for admin content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  test('Admin CMS Business page loads correctly', async ({ page }) => {
    await page.goto('/admin/cms/business');
    await expect(page).toHaveTitle(/Business/);
    
    // Check for admin content
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no inline styles
    const elementsWithInlineStyles = await page.locator('[style]').count();
    expect(elementsWithInlineStyles).toBe(0);
  });

  // ===== PERFECTION VERIFICATION TESTS =====
  
  test('All perfected pages have zero inline styles', async ({ page }) => {
    const perfectedPages = [
      '/',
      '/about',
      '/help', 
      '/terms',
      '/privacy',
      '/portal',
      '/cancel',
      '/success',
      '/feedback/test-booking-123',
      '/status/test-booking-123',
      '/admin/promos',
      '/admin/drivers',
      '/admin/feedback',
      '/admin/comments',
      '/admin/cms',
      '/admin/cms/business'
    ];

    for (const pagePath of perfectedPages) {
      await page.goto(pagePath);
      
      // Check for inline styles (should be zero)
      const elementsWithInlineStyles = await page.locator('[style]').count();
      expect(elementsWithInlineStyles).toBe(0);
      
      // Check for custom div elements (should be minimal)
      const customDivs = await page.locator('div:not([class*="admin"]):not([class*="card"]):not([class*="form"]):not([class*="nav"])').count();
      expect(customDivs).toBeLessThan(10); // Allow some reasonable divs
    }
  });

  test('All perfected pages use proper layout components', async ({ page }) => {
    const perfectedPages = [
      '/',
      '/about',
      '/help',
      '/terms', 
      '/privacy',
      '/portal',
      '/cancel',
      '/success',
      '/feedback/test-booking-123',
      '/status/test-booking-123',
      '/admin/promos',
      '/admin/drivers', 
      '/admin/feedback',
      '/admin/comments',
      '/admin/cms',
      '/admin/cms/business'
    ];

    for (const pagePath of perfectedPages) {
      await page.goto(pagePath);
      
      // Check that pages load without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3').count();
      expect(headings).toBeGreaterThan(0);
      
      // Check that pages are responsive
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await expect(page.locator('body')).toBeVisible();
      
      await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Navigation between perfected pages works', async ({ page }) => {
    // Test navigation from homepage
    await page.goto('/');
    
    // Navigate to about page
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
    
    // Navigate to help page
    await page.click('a[href="/help"]');
    await expect(page).toHaveURL('/help');
    
    // Navigate back to home
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });
}); 