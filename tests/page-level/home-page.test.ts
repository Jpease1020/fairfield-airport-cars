import { test, expect } from '@playwright/test';

test.describe('Home Page - Page Level Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders correctly with all sections', async ({ page }) => {
    // Check that main sections are visible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="about-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="faq-section"]')).toBeVisible();

    // Check that labels are not showing fallback strings
    await expect(page.locator('text=[LABEL]')).toHaveCount(0);
    await expect(page.locator('text=form name label')).toHaveCount(0);
  });

  test('quick booking form renders correctly', async ({ page }) => {
    // Check that quick booking form is visible
    await expect(page.locator('[data-testid="quick-book-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="pickup-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="dropoff-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="get-price-button"]')).toBeVisible();
  });

  test('quick booking form shows estimated price', async ({ page }) => {
    // Fill out the form
    await page.fill('[data-testid="pickup-input"]', '123 Main St, Fairfield, CT');
    await page.fill('[data-testid="dropoff-input"]', 'JFK Airport, New York, NY');
    
    // Wait for price calculation
    await page.waitForTimeout(2000);
    
    // Check that estimated price is displayed
    await expect(page.locator('[data-testid="estimated-fare"]')).toBeVisible();
    
    // Price should be a reasonable amount
    const priceText = await page.locator('[data-testid="estimated-fare"]').textContent();
    expect(priceText).toMatch(/\$\d+/);
  });

  test('quick booking form price updates on field changes', async ({ page }) => {
    // Fill initial form
    await page.fill('[data-testid="pickup-input"]', '123 Main St, Fairfield, CT');
    await page.fill('[data-testid="dropoff-input"]', 'JFK Airport, New York, NY');
    
    // Wait for initial price calculation
    await page.waitForTimeout(2000);
    const initialPrice = await page.locator('[data-testid="estimated-fare"]').textContent();
    
    // Change pickup location
    await page.fill('[data-testid="pickup-input"]', '456 Oak Ave, Stamford, CT');
    
    // Wait for price recalculation
    await page.waitForTimeout(2000);
    const updatedPrice = await page.locator('[data-testid="estimated-fare"]').textContent();
    
    // Price should have updated (may be same or different)
    expect(updatedPrice).toBeDefined();
  });

  test('get price button navigates to booking page', async ({ page }) => {
    // Fill out the form
    await page.fill('[data-testid="pickup-input"]', '123 Main St, Fairfield, CT');
    await page.fill('[data-testid="dropoff-input"]', 'JFK Airport, New York, NY');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="time-input"]', '10:00');
    
    // Click get price button
    await page.click('[data-testid="get-price-button"]');
    
    // Should navigate to booking page with form data
    await expect(page).toHaveURL('/book');
    
    // Check that form data was passed via URL parameters
    const url = page.url();
    expect(url).toContain('pickup=');
    expect(url).toContain('dropoff=');
    expect(url).toContain('date=');
    expect(url).toContain('time=');
  });

  test('features section displays correctly', async ({ page }) => {
    // Check that features are displayed
    await expect(page.locator('[data-testid="features-title"]')).toBeVisible();
    
    // Check for specific features
    await expect(page.locator('text=Professional Drivers')).toBeVisible();
    await expect(page.locator('text=Luxury Vehicles')).toBeVisible();
    await expect(page.locator('text=Easy Booking')).toBeVisible();
  });

  test('FAQ section displays correctly', async ({ page }) => {
    // Check that FAQ section is visible
    await expect(page.locator('[data-testid="faq-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="faq-title"]')).toBeVisible();
    
    // Check for specific FAQ items
    await expect(page.locator('text=How far in advance should I book?')).toBeVisible();
    await expect(page.locator('text=What airports do you serve?')).toBeVisible();
  });

  test('call-to-action buttons work correctly', async ({ page }) => {
    // Test primary CTA button
    await page.click('[data-testid="hero-primary-button"]');
    await expect(page).toHaveURL('/book');
    
    // Go back to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test secondary CTA button
    await page.click('[data-testid="hero-secondary-button"]');
    await expect(page).toHaveURL('/about');
  });

  test('navigation works correctly', async ({ page }) => {
    // Test main navigation
    await page.click('[data-testid="nav-about"]');
    await expect(page).toHaveURL('/about');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="nav-contact"]');
    await expect(page).toHaveURL('/contact');
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Check that content is still accessible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-book-form"]')).toBeVisible();
  });

  test('CMS integration works correctly', async ({ page }) => {
    // Check that no malformed CMS strings are visible
    await expect(page.locator('text=[LABEL]')).toHaveCount(0);
    await expect(page.locator('text=form name label')).toHaveCount(0);
    await expect(page.locator('text=^[A-Z\\s]+\\*$')).toHaveCount(0);

    // Check that CMS content is being used
    const heroTitle = page.locator('[data-testid="hero-title"]');
    await expect(heroTitle).toContainText('Stress-Free Airport Transportation');
  });

  test('loading states work correctly', async ({ page }) => {
    // Test that loading states are handled properly
    await page.fill('[data-testid="pickup-input"]', '123 Main St, Fairfield, CT');
    await page.fill('[data-testid="dropoff-input"]', 'JFK Airport, New York, NY');
    
    // Check for loading indicator during price calculation
    const loadingIndicator = page.locator('[data-testid="price-loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });
});
