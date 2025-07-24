import { test, expect } from '@playwright/test';

test.describe('CSS Class Validation Tests', () => {
  test('Tailwind classes are properly applied', async ({ page }) => {
    await page.goto('/book');
    
    // Test grid classes
    const gridElement = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(gridElement).toBeVisible();
    
    // Test responsive classes
    const computedStyles = await gridElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
      };
    });
    
    // Verify grid is working
    expect(computedStyles.display).toBe('grid');
    
    // Test color classes
    const blueCircle = page.locator('.bg-blue-100');
    const greenCircle = page.locator('.bg-green-100');
    const purpleCircle = page.locator('.bg-purple-100');
    
    await expect(blueCircle).toBeVisible();
    await expect(greenCircle).toBeVisible();
    await expect(purpleCircle).toBeVisible();
    
    // Test flexbox classes
    const flexContainer = page.locator('.flex.items-center.justify-center');
    await expect(flexContainer).toBeVisible();
    
    // Test spacing classes
    const spacedElement = page.locator('.mb-8');
    await expect(spacedElement).toBeVisible();
  });

  test('Responsive design classes work', async ({ page }) => {
    await page.goto('/book');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    const gridDesktop = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(gridDesktop).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    const gridMobile = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await expect(gridMobile).toBeVisible();
    
    // Verify mobile menu button is visible on mobile
    const mobileMenuButton = page.locator('button[aria-label="Open menu"]');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('Typography classes are applied', async ({ page }) => {
    await page.goto('/book');
    
    // Test heading classes
    const mainHeading = page.locator('h1.text-3xl.font-bold');
    await expect(mainHeading).toBeVisible();
    
    const subHeading = page.locator('h2.text-2xl.font-semibold');
    await expect(subHeading).toBeVisible();
    
    // Test text color classes
    const grayText = page.locator('.text-gray-600');
    await expect(grayText).toBeVisible();
  });
}); 