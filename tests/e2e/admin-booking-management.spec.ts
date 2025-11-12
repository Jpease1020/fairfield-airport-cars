import { test, expect } from '@playwright/test';

test.skip(true, 'Admin management coverage migrated to RTL/Integration tests; Playwright keeps only booking smoke flows.');

/**
 * Comprehensive E2E Test for Gregg's Admin Management Flow
 * Tests booking viewing, status updates, and driver assignment
 */

test.describe('Admin Booking Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login (assuming auth is set up)
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Login as admin (adjust based on your auth setup)
    // This is a placeholder - implement actual login flow
    // await page.fill('[data-testid="email-input"]', 'gregg@fairfieldairportcars.com');
    // await page.fill('[data-testid="password-input"]', 'password');
    // await page.click('[data-testid="login-button"]');
  });

  test('should view all bookings in admin dashboard', async ({ page }) => {
    console.log('📍 Admin: View All Bookings');
    
    // Navigate to bookings page
    await page.goto('http://localhost:3000/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    // Verify bookings table is displayed
    const bookingsTable = page.locator('[data-testid="bookings-table"]');
    await expect(bookingsTable).toBeVisible({ timeout: 10000 });
    
    // Verify stats cards are visible
    await expect(page.locator('[data-testid="stats-total-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="stats-confirmed"]')).toBeVisible();
    await expect(page.locator('[data-testid="stats-revenue"]')).toBeVisible();
    
    console.log('✅ All bookings displayed in admin dashboard');
  });

  // Detailed admin regression scenarios now live in RTL/Integration suites.
});








