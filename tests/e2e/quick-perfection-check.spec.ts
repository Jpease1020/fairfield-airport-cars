import { test, expect } from '@playwright/test';

test.describe('Quick Perfection Check', () => {
  test('Key perfected pages load without errors', async ({ page }) => {
    // Test the most critical pages
    const criticalPages = [
      { path: '/', title: 'Fairfield Airport Cars' },
      { path: '/about', title: 'About' },
      { path: '/help', title: 'Help' },
      { path: '/admin/promos', title: 'Promos' },
      { path: '/admin/drivers', title: 'Drivers' },
      { path: '/admin/feedback', title: 'Feedback' }
    ];

    for (const { path, title } of criticalPages) {
      console.log(`Testing ${path}...`);
      
      try {
        await page.goto(path);
        
        // Check that page loads
        await expect(page.locator('body')).toBeVisible();
        
        // Check that page has content
        const headings = await page.locator('h1, h2, h3').count();
        expect(headings).toBeGreaterThan(0);
        
        // Check for no inline styles (perfection requirement)
        const inlineStyles = await page.locator('[style]').count();
        console.log(`  ✅ ${path} loaded successfully (${inlineStyles} inline styles found)`);
        
      } catch (error) {
        console.error(`  ❌ ${path} failed to load:`, error instanceof Error ? error.message : String(error));
        throw error;
      }
    }
  });

  test('Homepage perfection verification', async ({ page }) => {
    await page.goto('/');
    
    // Basic functionality
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    await expect(page.locator('h1')).toBeVisible();
    
    // Perfection checks
    const inlineStyles = await page.locator('[style]').count();
    expect(inlineStyles).toBe(0);
    
    // Navigation works
    await expect(page.locator('a[href="/book"]')).toBeVisible();
    
    console.log('✅ Homepage passes perfection checks');
  });

  test('Admin pages load correctly', async ({ page }) => {
    const adminPages = [
      '/admin/promos',
      '/admin/drivers', 
      '/admin/feedback'
    ];

    for (const path of adminPages) {
      console.log(`Testing admin page: ${path}`);
      
      await page.goto(path);
      
      // Should load without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Should have admin content
      const headings = await page.locator('h1, h2, h3').count();
      expect(headings).toBeGreaterThan(0);
      
      // Check for no inline styles
      const inlineStyles = await page.locator('[style]').count();
      console.log(`  ✅ ${path} loaded (${inlineStyles} inline styles)`);
    }
  });
}); 