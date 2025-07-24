import { test, expect } from '@playwright/test';

test.describe('User Journey Tests', () => {
  test('Complete booking flow', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Navigate to booking page
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL('/book');
    
    // Verify booking page loads correctly
    await expect(page.locator('h1:has-text("Book Your Airport Transfer")')).toBeVisible();
    await expect(page.locator('h2:has-text("Why Choose Our Service?")')).toBeVisible();
    
    // Verify service cards are displayed properly
    const serviceCards = page.locator('.text-center');
    await expect(serviceCards).toHaveCount(3);
    
    // Verify booking form is present
    await expect(page.locator('input[placeholder="Enter your full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="(123) 456-7890"]')).toBeVisible();
  });

  test('Navigation flow', async ({ page }) => {
    await page.goto('/');
    
    // Test all navigation links
    const navLinks = [
      { href: '/', text: 'Home' },
      { href: '/book', text: 'Book' },
      { href: '/help', text: 'Help' },
      { href: '/about', text: 'About' }
    ];
    
    for (const link of navLinks) {
      await page.click(`a[href="${link.href}"]`);
      await expect(page).toHaveURL(link.href);
      
      // Verify page loads without errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Mobile navigation flow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    
    // Verify mobile menu items are present
    await expect(page.locator('a[href="/book"]')).toBeVisible();
    await expect(page.locator('a[href="/help"]')).toBeVisible();
    await expect(page.locator('a[href="/about"]')).toBeVisible();
  });

  test('Content loading and display', async ({ page }) => {
    await page.goto('/book');
    
    // Wait for CMS content to load
    await page.waitForResponse(response => 
      response.url().includes('/api/admin/cms/pages') && response.status() === 200
    );
    
    // Verify all content sections are displayed
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2:has-text("Why Choose Our Service?")')).toBeVisible();
    
    // Verify service features are displayed
    await expect(page.locator('span:has-text("🚗")')).toBeVisible();
    await expect(page.locator('span:has-text("⏰")')).toBeVisible();
    await expect(page.locator('span:has-text("💰")')).toBeVisible();
    
    // Verify form is functional
    await expect(page.locator('form')).toBeVisible();
  });
}); 