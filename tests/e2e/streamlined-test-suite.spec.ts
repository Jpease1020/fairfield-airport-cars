import { test, expect } from '@playwright/test';
import { 
  setupPlaywrightMocks, 
  fillPlaywrightBookingForm, 
  expectPlaywrightBookingForm,
  expectAccessibilityCompliance,
  measurePageLoadTime,
  simulateApiError,
  simulateNetworkTimeout
} from '../utils/test-helpers';

test.describe('Streamlined E2E Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupPlaywrightMocks(page);
  });

  test.describe('Core User Journeys', () => {
    test('Complete booking flow - happy path', async ({ page }) => {
      // 1. Homepage
      await page.goto('/');
      await expect(page).toHaveTitle(/Fairfield Airport Cars/);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/);
      
      // 2. Navigate to booking
      await page.click('a[href="/book"], button:has-text("Book Now")');
      await expect(page).toHaveURL('/book');
      
      // 3. Verify booking page layout
      await expect(page.locator('h1:has-text("Book Your Airport Transfer")')).toBeVisible();
      await expect(page.locator('h2:has-text("Why Choose Our Service?")')).toBeVisible();
      
      // 4. Verify service cards are properly displayed
      const serviceCards = page.locator('.text-center');
      await expect(serviceCards).toHaveCount(3);
      
      // 5. Verify colored circles with emojis
      const emojiContainers = page.locator('.bg-blue-100, .bg-green-100, .bg-purple-100');
      await expect(emojiContainers).toHaveCount(3);
      
      // 6. Fill and submit booking form
      await fillPlaywrightBookingForm(page);
      
      // 7. Calculate fare
      await page.click('button:has-text("Calculate Fare")');
      await expect(page.locator('text=$150')).toBeVisible();
      
      // 8. Submit booking
      await page.click('button:has-text("Book Now")');
      await expect(page).toHaveURL(/\/success/);
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
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('Mobile responsive design', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Test mobile navigation
      await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
      await page.click('button[aria-label="Open menu"]');
      
      // Verify mobile menu items
      await expect(page.locator('a[href="/book"]')).toBeVisible();
      await expect(page.locator('a[href="/help"]')).toBeVisible();
      await expect(page.locator('a[href="/about"]')).toBeVisible();
      
      // Test mobile booking page
      await page.goto('/book');
      const gridContainer = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
      await expect(gridContainer).toBeVisible();
    });
  });

  test.describe('Visual Regression & Layout', () => {
    test('Homepage layout and styling', async ({ page }) => {
      await page.goto('/');
      
      // Test navigation
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('a[href="/book"]')).toBeVisible();
      
      // Test hero section
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/);
      
      // Test features section
      const featuresGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
      await expect(featuresGrid).toBeVisible();
    });

    test('Booking page layout and styling', async ({ page }) => {
      await page.goto('/book');
      
      // Wait for content to load
      await page.waitForSelector('h1:has-text("Book Your Airport Transfer")');
      
      // Test grid layout
      const gridContainer = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
      await expect(gridContainer).toBeVisible();
      
      // Test service cards
      const serviceCards = page.locator('.text-center');
      await expect(serviceCards).toHaveCount(3);
      
      // Test colored circles
      const emojiContainers = page.locator('.bg-blue-100, .bg-green-100, .bg-purple-100');
      await expect(emojiContainers).toHaveCount(3);
      
      // Test responsive behavior
      await page.setViewportSize({ width: 768, height: 720 });
      await expect(gridContainer).toHaveClass(/grid-cols-1/);
    });

    test('Admin dashboard layout', async ({ page }) => {
      await page.goto('/admin');
      
      // Test admin navigation
      await expect(page.locator('nav')).toBeVisible();
      
      // Test dashboard cards
      const dashboardCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      await expect(dashboardCards).toBeVisible();
    });
  });

  test.describe('Component Integration', () => {
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

    test('CMS content loading and display', async ({ page }) => {
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
    });
  });

  test.describe('CSS Validation', () => {
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

  test.describe('Error Handling & Edge Cases', () => {
    test('Form validation errors', async ({ page }) => {
      await page.goto('/book');
      
      // Try to submit without filling required fields
      await page.click('button:has-text("Calculate Fare")');
      
      // Should show validation errors
      await expect(page.locator('.text-red-500')).toBeVisible();
    });

    test('API error handling', async ({ page }) => {
      await simulateApiError(page, '/api/booking/estimate-fare');
      
      await page.goto('/book');
      
      // Fill form and try to calculate fare
      await fillPlaywrightBookingForm(page);
      
      await page.click('button:has-text("Calculate Fare")');
      
      // Should show error message
      await expect(page.locator('text=error')).toBeVisible();
    });

    test('Network timeout handling', async ({ page }) => {
      await simulateNetworkTimeout(page, '/api/booking/estimate-fare');
      
      await page.goto('/book');
      
      // Fill form and try to calculate fare
      await fillPlaywrightBookingForm(page);
      
      await page.click('button:has-text("Calculate Fare")');
      
      // Should show loading state
      await expect(page.locator('text=Calculating')).toBeVisible();
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('Page load performance', async ({ page }) => {
      const loadTime = await measurePageLoadTime(page, '/');
      expect(loadTime).toBeLessThan(3000);
    });

    test('Accessibility compliance', async ({ page }) => {
      await page.goto('/');
      await expectAccessibilityCompliance(page);
    });

    test('Booking form accessibility', async ({ page }) => {
      await page.goto('/book');
      await expectPlaywrightBookingForm(page);
      await expectAccessibilityCompliance(page);
    });
  });
}); 