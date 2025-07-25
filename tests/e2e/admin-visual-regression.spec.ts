import { test, expect } from '@playwright/test';

test.describe('Admin Visual Regression Tests', () => {
  test('Admin pages should have same CSS structure as main pages', async ({ page }) => {
    // Test 1: Compare CSS classes and structure
    await page.goto('/admin/login');
    
    // Check for proper CSS classes that main pages have
    const body = await page.locator('body');
    await expect(body).toHaveClass(/.*/); // Should have CSS classes
    
    // Check for proper layout structure
    const mainContent = await page.locator('main, .main, [role="main"]');
    await expect(mainContent).toBeVisible();
    
    // Check for proper CSS variables and design system
    const computedStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily,
        hasCustomProperties: styles.getPropertyValue('--bg-primary') !== ''
      };
    });
    
    expect(computedStyles.hasCustomProperties).toBe(true);
    expect(computedStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(computedStyles.color).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('Admin dashboard should have proper layout structure', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for navigation structure
    const nav = await page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for sidebar
    const sidebar = await page.locator('[class*="sidebar"], [class*="side"], .lg\\:w-64');
    await expect(sidebar).toBeVisible();
    
    // Check for main content area
    const mainContent = await page.locator('main, [role="main"], .flex-1');
    await expect(mainContent).toBeVisible();
    
    // Check for proper grid layout
    const grid = await page.locator('[class*="grid"]');
    await expect(grid).toBeVisible();
  });

  test('Admin pages should load CSS files correctly', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check that CSS files are loaded
    const cssLinks = await page.locator('link[rel="stylesheet"]');
    const cssCount = await cssLinks.count();
    expect(cssCount).toBeGreaterThan(0);
    
    // Check for specific CSS files
    const cssHrefs = await cssLinks.evaluateAll(links => 
      links.map(link => link.getAttribute('href'))
    );
    
    expect(cssHrefs.some(href => href?.includes('layout.css'))).toBe(true);
    expect(cssHrefs.some(href => href?.includes('globals.css'))).toBe(true);
  });

  test('Admin pages should have responsive design', async ({ page }) => {
    await page.goto('/admin');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopSidebar = await page.locator('.lg\\:flex');
    await expect(desktopSidebar).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenu = await page.locator('button[aria-label*="menu"], .md\\:hidden');
    await expect(mobileMenu).toBeVisible();
  });

  test('Admin pages should have proper component structure', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check for form structure
    const form = await page.locator('form');
    await expect(form).toBeVisible();
    
    // Check for input fields with proper styling
    const inputs = await page.locator('input');
    await expect(inputs).toHaveCount(2); // email and password
    
    // Check for buttons with proper styling
    const buttons = await page.locator('button');
    await expect(buttons).toHaveCount(2); // login and google sign-in
    
    // Check that buttons have proper CSS classes
    const buttonClasses = await buttons.evaluateAll(buttons => 
      buttons.map(btn => btn.className)
    );
    
    buttonClasses.forEach(className => {
      expect(className).toContain('inline-flex');
      expect(className).toContain('items-center');
      expect(className).toContain('justify-center');
    });
  });
}); 