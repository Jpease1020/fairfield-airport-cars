import { test, expect } from '@playwright/test';

test.describe('Component Integration Tests', () => {
  test('EditableContent renders HTML properly', async ({ page }) => {
    await page.goto('/book');
    
    // Test that HTML content is rendered as actual elements, not raw text
    const htmlContent = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(htmlContent).toBeVisible();
    
    // Test that emojis are rendered as text, not escaped HTML
    const emojis = page.locator('span:has-text("🚗"), span:has-text("⏰"), span:has-text("💰")');
    await expect(emojis).toHaveCount(3);
    
    // Test that CSS classes are applied
    const coloredCircles = page.locator('.bg-blue-100, .bg-green-100, .bg-purple-100');
    await expect(coloredCircles).toHaveCount(3);
  });

  test('Navigation component integration', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links work
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL('/book');
    
    await page.click('a[href="/help"]');
    await expect(page).toHaveURL('/help');
    
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
  });

  test('BookingForm component integration', async ({ page }) => {
    await page.goto('/book');
    
    // Test form fields are present
    await expect(page.locator('input[placeholder="Enter your full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="(123) 456-7890"]')).toBeVisible();
    
    // Test form validation
    await page.click('button:has-text("Calculate Fare")');
    // Should show validation errors for required fields
    await expect(page.locator('.text-red-500')).toBeVisible();
  });

  test('CMS content loading and display', async ({ page }) => {
    await page.goto('/book');
    
    // Wait for CMS content to load
    await page.waitForResponse(response => 
      response.url().includes('/api/admin/cms/pages') && response.status() === 200
    );
    
    // Test that CMS content is displayed
    await expect(page.locator('h1:has-text("Book Your Airport Transfer")')).toBeVisible();
    await expect(page.locator('h2:has-text("Why Choose Our Service?")')).toBeVisible();
  });
}); 