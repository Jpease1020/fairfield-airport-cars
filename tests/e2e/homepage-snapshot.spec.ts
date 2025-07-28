import { test, expect } from '@playwright/test';

test.describe('Homepage Snapshot', () => {
  test('should capture full homepage snapshot', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Set viewport to full screen
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-full-snapshot.png',
      fullPage: true 
    });
    
    // Also take a screenshot of just the viewport
    await page.screenshot({ 
      path: 'test-results/homepage-viewport-snapshot.png',
      fullPage: false 
    });
    
    // Verify the page loaded successfully
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
  });
}); 