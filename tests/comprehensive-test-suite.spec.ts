import { test, expect } from '@playwright/test';

// Test data
const testCustomer = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '203-555-0123',
  pickupLocation: 'Fairfield Station, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY',
  pickupDateTime: '2024-12-25T10:00',
  passengers: 2,
  flightNumber: 'AA123',
  notes: 'Please pick up at the main entrance'
};

const mockResponses = {
  fareEstimate: { fare: 150, distance: '45 miles', duration: '1 hour 15 minutes' },
  paymentSession: { checkoutUrl: 'https://squareup.com/checkout/test-session' },
  confirmation: { success: true, messageId: 'test-123' },
  placesAutocomplete: {
    predictions: [
      { description: 'Fairfield Station, Fairfield, CT' },
      { description: 'JFK Airport, Queens, NY' }
    ]
  }
};

test.describe('Comprehensive Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock all external APIs for consistent testing
    await page.route('**/api/places-autocomplete', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses.placesAutocomplete)
      });
    });

    await page.route('**/api/booking/estimate-fare', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses.fareEstimate)
      });
    });

    await page.route('**/api/payment/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses.paymentSession)
      });
    });

    await page.route('**/api/notifications/send-confirmation', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses.confirmation)
      });
    });
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
      
      // 6. Fill booking form
      await page.fill('input[placeholder*="full name"]', testCustomer.name);
      await page.fill('input[placeholder*="email"]', testCustomer.email);
      await page.fill('input[placeholder*="phone"]', testCustomer.phone);
      
      // 7. Test location autocomplete
      await page.fill('input[placeholder*="pickup"]', testCustomer.pickupLocation);
      await page.waitForTimeout(300);
      await page.click('text=Fairfield Station, Fairfield, CT');
      
      await page.fill('input[placeholder*="dropoff"]', testCustomer.dropoffLocation);
      await page.waitForTimeout(300);
      await page.click('text=JFK Airport, Queens, NY');
      
      // 8. Complete form
      await page.fill('input[type="datetime-local"]', testCustomer.pickupDateTime);
      await page.selectOption('select[name="passengers"]', testCustomer.passengers.toString());
      await page.fill('input[name="flightNumber"]', testCustomer.flightNumber);
      await page.fill('textarea[name="notes"]', testCustomer.notes);
      
      // 9. Calculate fare
      await page.click('button:has-text("Calculate Fare")');
      await expect(page.locator('text=$150')).toBeVisible();
      
      // 10. Submit booking
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
      
      // Visual snapshot
      await expect(page).toHaveScreenshot('homepage-desktop.png');
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
      
      // Visual snapshot
      await expect(page).toHaveScreenshot('booking-page-desktop.png');
    });

    test('Admin dashboard layout', async ({ page }) => {
      await page.goto('/admin');
      
      // Test admin navigation
      await expect(page.locator('nav')).toBeVisible();
      
      // Test dashboard cards
      const dashboardCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      await expect(dashboardCards).toBeVisible();
      
      // Visual snapshot
      await expect(page).toHaveScreenshot('admin-dashboard.png');
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
      // Override the mock to return an error
      await page.route('**/api/booking/estimate-fare', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      await page.goto('/book');
      
      // Fill form and try to calculate fare
      await page.fill('input[placeholder*="full name"]', testCustomer.name);
      await page.fill('input[placeholder*="email"]', testCustomer.email);
      await page.fill('input[placeholder*="pickup"]', testCustomer.pickupLocation);
      await page.fill('input[placeholder*="dropoff"]', testCustomer.dropoffLocation);
      
      await page.click('button:has-text("Calculate Fare")');
      
      // Should show error message
      await expect(page.locator('text=error')).toBeVisible();
    });

    test('Network timeout handling', async ({ page }) => {
      // Override to simulate slow response
      await page.route('**/api/booking/estimate-fare', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponses.fareEstimate)
        });
      });
      
      await page.goto('/book');
      
      // Fill form and try to calculate fare
      await page.fill('input[placeholder*="full name"]', testCustomer.name);
      await page.fill('input[placeholder*="email"]', testCustomer.email);
      await page.fill('input[placeholder*="pickup"]', testCustomer.pickupLocation);
      await page.fill('input[placeholder*="dropoff"]', testCustomer.dropoffLocation);
      
      await page.click('button:has-text("Calculate Fare")');
      
      // Should show loading state
      await expect(page.locator('text=Calculating')).toBeVisible();
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('Page load performance', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('Accessibility basics', async ({ page }) => {
      await page.goto('/');
      
      // Test for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
      
      // Test for alt text on images
      const images = page.locator('img');
      for (let i = 0; i < await images.count(); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
      
      // Test for proper form labels
      await page.goto('/book');
      const formInputs = page.locator('input, select, textarea');
      for (let i = 0; i < await formInputs.count(); i++) {
        const input = formInputs.nth(i);
        const id = await input.getAttribute('id');
        const name = await input.getAttribute('name');
        const ariaLabel = await input.getAttribute('aria-label');
        
        // Should have either id/name or aria-label
        expect(id || name || ariaLabel).toBeTruthy();
      }
    });
  });
}); 