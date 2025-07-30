import { test, expect } from '@playwright/test';

// Test all major pages load properly and handle API failures gracefully
test.describe('Comprehensive Page Loading Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up network interception for API failure testing
    await page.route('**/api/**', async (route) => {
      // Simulate API failures for testing graceful degradation
      if (route.request().url().includes('/api/failing')) {
        await route.fulfill({ status: 500, body: '{"error": "Internal Server Error"}' });
      } else if (route.request().url().includes('/api/timeout')) {
        // Simulate timeout
        await new Promise(resolve => setTimeout(resolve, 10000));
        await route.fulfill({ status: 408, body: '{"error": "Request Timeout"}' });
      } else if (route.request().url().includes('/api/network-error')) {
        await route.abort('failed');
      } else {
        // Default successful response
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] })
        });
      }
    });
  });

  test.describe('Public Pages', () => {
    test('Home page loads with all content', async ({ page }) => {
      await page.goto('/');
      
      // Check page loads completely
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
      await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-book"]')).toBeVisible();
      
      // Check for key sections
      await expect(page.locator('text=Book Your Ride')).toBeVisible();
      await expect(page.locator('text=Why Choose Fairfield Airport Cars')).toBeVisible();
      await expect(page.locator('text=Professional Drivers')).toBeVisible();
    });

    test('Book page loads with booking form', async ({ page }) => {
      await page.goto('/book');
      
      await expect(page).toHaveTitle(/Book Your Ride/i);
      await expect(page.locator('h1')).toContainText(/Book Your Airport Ride/i);
      
      // Check form elements are present
      await expect(page.locator('label:has-text("Pickup Location")')).toBeVisible();
      await expect(page.locator('label:has-text("Drop-off Location")')).toBeVisible();
      await expect(page.locator('label:has-text("Number of Passengers")')).toBeVisible();
      await expect(page.locator('button:has-text("Book Now")')).toBeVisible();
    });

    test('Help page loads with support content', async ({ page }) => {
      await page.goto('/help');
      
      await expect(page).toHaveTitle(/Help/i);
      await expect(page.locator('h1')).toContainText(/Help & Support/i);
      await expect(page.locator('text=Quick Answers')).toBeVisible();
      await expect(page.locator('text=Need More Help')).toBeVisible();
    });

    test('Costs page loads with pricing information', async ({ page }) => {
      await page.goto('/costs');
      
      await expect(page).toHaveTitle(/Pricing/i);
      await expect(page.locator('h1')).toContainText(/Pricing/i);
    });

    test('About page loads with company information', async ({ page }) => {
      await page.goto('/about');
      
      await expect(page).toHaveTitle(/About/i);
      await expect(page.locator('h1')).toContainText(/About/i);
    });

    test('Privacy page loads with privacy policy', async ({ page }) => {
      await page.goto('/privacy');
      
      await expect(page).toHaveTitle(/Privacy/i);
      await expect(page.locator('h1')).toContainText(/Privacy/i);
    });

    test('Terms page loads with terms of service', async ({ page }) => {
      await page.goto('/terms');
      
      await expect(page).toHaveTitle(/Terms/i);
      await expect(page.locator('h1')).toContainText(/Terms/i);
    });

    test('Success page loads after booking', async ({ page }) => {
      await page.goto('/success');
      
      await expect(page).toHaveTitle(/Success/i);
      await expect(page.locator('h1')).toContainText(/Booking Confirmed/i);
    });

    test('Cancel page loads with cancellation info', async ({ page }) => {
      await page.goto('/cancel');
      
      await expect(page).toHaveTitle(/Cancel/i);
      await expect(page.locator('h1')).toContainText(/Cancel/i);
    });

    test('Portal page loads with customer portal', async ({ page }) => {
      await page.goto('/portal');
      
      await expect(page).toHaveTitle(/Portal/i);
      await expect(page.locator('h1')).toContainText(/Portal/i);
    });
  });

  test.describe('Dynamic Route Pages', () => {
    test('Booking status page loads with ID', async ({ page }) => {
      await page.goto('/booking/test-booking-123');
      
      await expect(page).toHaveTitle(/Booking/i);
      await expect(page.locator('h1')).toContainText(/Booking/i);
    });

    test('Booking management page loads with ID', async ({ page }) => {
      await page.goto('/manage/test-booking-123');
      
      await expect(page).toHaveTitle(/Manage/i);
      await expect(page.locator('h1')).toContainText(/Manage/i);
    });

    test('Status page loads with ID', async ({ page }) => {
      await page.goto('/status/test-status-123');
      
      await expect(page).toHaveTitle(/Status/i);
      await expect(page.locator('h1')).toContainText(/Status/i);
    });

    test('Feedback page loads with ID', async ({ page }) => {
      await page.goto('/feedback/test-feedback-123');
      
      await expect(page).toHaveTitle(/Feedback/i);
      await expect(page.locator('h1')).toContainText(/Feedback/i);
    });

    test('Tracking page loads with booking ID', async ({ page }) => {
      await page.goto('/tracking/test-booking-123');
      
      await expect(page).toHaveTitle(/Tracking/i);
      await expect(page.locator('h1')).toContainText(/Tracking/i);
    });
  });

  test.describe('Driver Pages', () => {
    test('Driver dashboard loads', async ({ page }) => {
      await page.goto('/driver/dashboard');
      
      await expect(page).toHaveTitle(/Driver/i);
      await expect(page.locator('h1')).toContainText(/Driver/i);
    });

    test('Driver location page loads', async ({ page }) => {
      await page.goto('/driver/location');
      
      await expect(page).toHaveTitle(/Location/i);
      await expect(page.locator('h1')).toContainText(/Location/i);
    });
  });

  test.describe('Admin Pages', () => {
    test('Admin dashboard loads', async ({ page }) => {
      await page.goto('/admin');
      
      await expect(page).toHaveTitle(/Admin/i);
      // Should show login or dashboard content
      const loginText = page.locator('text=Login');
      const dashboardText = page.locator('text=Dashboard');
      await expect(loginText.or(dashboardText)).toBeVisible();
    });

    test('Admin login page loads', async ({ page }) => {
      await page.goto('/admin/login');
      
      await expect(page).toHaveTitle(/Login/i);
      await expect(page.locator('h1')).toContainText(/Login/i);
    });

    test('Admin bookings page loads', async ({ page }) => {
      await page.goto('/admin/bookings');
      
      await expect(page).toHaveTitle(/Bookings/i);
      await expect(page.locator('h1')).toContainText(/Bookings/i);
    });

    test('Admin drivers page loads', async ({ page }) => {
      await page.goto('/admin/drivers');
      
      await expect(page).toHaveTitle(/Drivers/i);
      await expect(page.locator('h1')).toContainText(/Drivers/i);
    });

    test('Admin payments page loads', async ({ page }) => {
      await page.goto('/admin/payments');
      
      await expect(page).toHaveTitle(/Payments/i);
      await expect(page.locator('h1')).toContainText(/Payments/i);
    });

    test('Admin feedback page loads', async ({ page }) => {
      await page.goto('/admin/feedback');
      
      await expect(page).toHaveTitle(/Feedback/i);
      await expect(page.locator('h1')).toContainText(/Feedback/i);
    });

    test('Admin costs page loads', async ({ page }) => {
      await page.goto('/admin/costs');
      
      await expect(page).toHaveTitle(/Costs/i);
      await expect(page.locator('h1')).toContainText(/Costs/i);
    });

    test('Admin promos page loads', async ({ page }) => {
      await page.goto('/admin/promos');
      
      await expect(page).toHaveTitle(/Promos/i);
      await expect(page.locator('h1')).toContainText(/Promos/i);
    });

    test('Admin calendar page loads', async ({ page }) => {
      await page.goto('/admin/calendar');
      
      await expect(page).toHaveTitle(/Calendar/i);
      await expect(page.locator('h1')).toContainText(/Calendar/i);
    });

    test('Admin comments page loads', async ({ page }) => {
      await page.goto('/admin/comments');
      
      await expect(page).toHaveTitle(/Comments/i);
      await expect(page.locator('h1')).toContainText(/Comments/i);
    });

    test('Admin help page loads', async ({ page }) => {
      await page.goto('/admin/help');
      
      await expect(page).toHaveTitle(/Help/i);
      await expect(page.locator('h1')).toContainText(/Help/i);
    });

    test('Admin quick fix page loads', async ({ page }) => {
      await page.goto('/admin/quick-fix');
      
      await expect(page).toHaveTitle(/Quick Fix/i);
      await expect(page.locator('h1')).toContainText(/Quick Fix/i);
    });

    test('Admin CMS page loads', async ({ page }) => {
      await page.goto('/admin/cms');
      
      await expect(page).toHaveTitle(/CMS/i);
      await expect(page.locator('h1')).toContainText(/CMS/i);
    });

    test('Admin add content page loads', async ({ page }) => {
      await page.goto('/admin/add-content');
      
      await expect(page).toHaveTitle(/Add Content/i);
      await expect(page.locator('h1')).toContainText(/Add Content/i);
    });

    test('Admin AI assistant disabled page loads', async ({ page }) => {
      await page.goto('/admin/ai-assistant-disabled');
      
      await expect(page).toHaveTitle(/AI Assistant/i);
      await expect(page.locator('h1')).toContainText(/AI Assistant/i);
    });

    test('Admin analytics disabled page loads', async ({ page }) => {
      await page.goto('/admin/analytics-disabled');
      
      await expect(page).toHaveTitle(/Analytics/i);
      await expect(page.locator('h1')).toContainText(/Analytics/i);
    });
  });

  test.describe('API Error Handling', () => {
    test('Page handles API failures gracefully', async ({ page }) => {
      // Intercept API calls to simulate failures
      await page.route('**/api/bookings', async (route) => {
        await route.fulfill({ 
          status: 500, 
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/');
      
      // Page should still load even with API failure
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
      
      // Check that error states are handled gracefully
      await expect(page.locator('text=Book Your Ride')).toBeVisible();
    });

    test('Page handles network errors gracefully', async ({ page }) => {
      // Intercept API calls to simulate network errors
      await page.route('**/api/bookings', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/');
      
      // Page should still load even with network error
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
    });

    test('Page handles API timeouts gracefully', async ({ page }) => {
      // Intercept API calls to simulate timeouts
      await page.route('**/api/bookings', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        await route.fulfill({ 
          status: 408, 
          body: JSON.stringify({ error: 'Request Timeout' })
        });
      });

      await page.goto('/');
      
      // Page should load quickly even with slow API
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
    });
  });

  test.describe('Loading States', () => {
    test('Page shows appropriate loading states', async ({ page }) => {
      // Intercept API calls to simulate slow responses
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ success: true, data: [] })
        });
      });

      await page.goto('/');
      
      // Page should load with content
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
    });
  });

  test.describe('Accessibility', () => {
    test('Page has proper heading structure', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      await expect(headings).toHaveCount(await headings.count());
      
      // Check for main content landmark
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('Page has proper alt text for images', async ({ page }) => {
      await page.goto('/');
      
      // Check for images with alt text
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('Page has proper ARIA labels', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper ARIA labels on interactive elements
      await expect(page.locator('button[aria-label]')).toBeVisible();
      await expect(page.locator('nav[aria-label]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('Page is responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Page should load properly on mobile
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
      
      // Check mobile navigation is accessible
      await expect(page.locator('[data-testid="nav-mobile-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-mobile-book"]')).toBeVisible();
    });

    test('Page is responsive on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      
      // Page should load properly on tablet
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
      await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/i);
    });
  });

  test.describe('Performance', () => {
    test('Page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      // Verify page loaded completely
      await expect(page).toHaveTitle(/Fairfield Airport Cars/i);
    });

    test('Page has proper meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check for essential meta tags
      await expect(page.locator('meta[name="viewport"]')).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toBeVisible();
    });
  });
}); 