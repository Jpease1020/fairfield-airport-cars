import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Booking page layout and styling', async ({ page }) => {
    await page.goto('/book');
    
    // Wait for content to load
    await page.waitForSelector('h1:has-text("Book Your Airport Transfer")');
    
    // Test that the grid layout is working
    const gridContainer = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(gridContainer).toBeVisible();
    
    // Test that we have 3 service cards
    const serviceCards = page.locator('.text-center');
    await expect(serviceCards).toHaveCount(3);
    
    // Test that emojis are in colored circles
    const emojiContainers = page.locator('.bg-blue-100, .bg-green-100, .bg-purple-100');
    await expect(emojiContainers).toHaveCount(3);
    
    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 720 });
    await expect(gridContainer).toHaveClass(/grid-cols-1/);
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('booking-page-desktop.png');
  });

  test('Homepage layout and styling', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation is present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/book"]')).toBeVisible();
    
    // Test hero section
    await expect(page.locator('h1')).toContainText('Premium Airport Transportation');
    
    // Test features section
    const featuresGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(featuresGrid).toBeVisible();
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('homepage-desktop.png');
  });

  test('Admin dashboard layout', async ({ page }) => {
    await page.goto('/admin');
    
    // Test admin navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Test dashboard cards
    const dashboardCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(dashboardCards).toBeVisible();
    
    // Take visual snapshot
    await expect(page).toHaveScreenshot('admin-dashboard.png');
  });

  test('Mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/book');
    
    // Test mobile navigation
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
    
    // Test mobile grid layout
    const gridContainer = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(gridContainer).toHaveClass(/grid-cols-1/);
    
    // Take mobile snapshot
    await expect(page).toHaveScreenshot('booking-page-mobile.png');
  });
}); 