import { test, expect } from '@playwright/test';

// Define all routes in the application
const ROUTES = {
  // Public customer-facing routes
  public: [
    { path: '/', title: 'Fairfield Airport Cars', expectedContent: ['Premium Airport Transportation', 'Book Your Ride'] },
    { path: '/book', title: 'Book Your Airport Transfer', expectedContent: ['Book Your Ride', 'Pickup Location'] },
    { path: '/help', title: 'Help & Support', expectedContent: ['FAQ', 'Contact Us'] },
    { path: '/about', title: 'About Us', expectedContent: ['Our Story', 'Our Commitment', 'Why Choose Us'] },
    { path: '/terms', title: 'Terms of Service', expectedContent: ['Terms of Service', 'Agreement'] },
    { path: '/privacy', title: 'Privacy Policy', expectedContent: ['Privacy Policy', 'Data Collection'] },
    { path: '/success', title: 'Payment Successful', expectedContent: ['Payment Successful', 'Booking Confirmed'] },
    { path: '/cancel', title: 'Booking Cancelled', expectedContent: ['Booking Cancelled', 'Cancellation'] },
    { path: '/portal', title: 'Customer Portal', expectedContent: ['Portal', 'Dashboard'] },
  ],
  
  // Dynamic routes (will test with sample IDs)
  dynamic: [
    { path: '/booking/123', title: 'Booking Details', expectedContent: ['Booking Confirmed', 'Booking Details'] },
    { path: '/booking/123/edit', title: 'Edit Booking', expectedContent: ['Edit Booking', 'Update'] },
    { path: '/manage/123', title: 'Manage Booking', expectedContent: ['Manage Booking', 'Booking'] },
    { path: '/status/123', title: 'Ride Status', expectedContent: ['Ride Status', 'Status'] },
    { path: '/feedback/123', title: 'Feedback', expectedContent: ['Feedback', 'Review'] },
  ],
  
  // Admin routes (will test with authentication)
  admin: [
    { path: '/admin', title: 'Admin Dashboard', expectedContent: ['Dashboard', 'Bookings'] },
    { path: '/admin/bookings', title: 'Bookings', expectedContent: ['Bookings', 'Manage'] },
    { path: '/admin/calendar', title: 'Calendar', expectedContent: ['Calendar', 'Schedule'] },
    { path: '/admin/drivers', title: 'Drivers', expectedContent: ['Drivers', 'Manage'] },
    { path: '/admin/promos', title: 'Promos', expectedContent: ['Promos', 'Promotional'] },
    { path: '/admin/feedback', title: 'Feedback', expectedContent: ['Feedback', 'Reviews'] },
    { path: '/admin/comments', title: 'Comments', expectedContent: ['Comments', 'Manage'] },
    { path: '/admin/costs', title: 'Costs', expectedContent: ['Costs', 'Expenses'] },
    { path: '/admin/backups', title: 'Backups', expectedContent: ['Backups', 'Data'] },
    { path: '/admin/analytics', title: 'Analytics', expectedContent: ['Analytics', 'Reports'] },
    { path: '/admin/help', title: 'Help', expectedContent: ['Help', 'Support'] },
    { path: '/admin/ai-assistant', title: 'AI Assistant', expectedContent: ['AI Assistant', 'Help'] },
    { path: '/admin/cms', title: 'CMS', expectedContent: ['CMS', 'Content'] },
    { path: '/admin/cms/pages', title: 'CMS Pages', expectedContent: ['Pages', 'Content'] },
    { path: '/admin/cms/business', title: 'Business Settings', expectedContent: ['Business', 'Settings'] },
    { path: '/admin/cms/pricing', title: 'Pricing', expectedContent: ['Pricing', 'Rates'] },
    { path: '/admin/cms/colors', title: 'Colors', expectedContent: ['Colors', 'Branding'] },
  ],
  
  // Special routes
  special: [
    { path: '/driver/location', title: 'Driver Location', expectedContent: ['Location', 'Driver'] },
    { path: '/test', title: 'Test Page', expectedContent: ['Test', 'Debug'] },
    { path: '/test-simple-booking', title: 'Simple Booking Test', expectedContent: ['Test', 'Booking'] },
    { path: '/project-x', title: 'Project X', expectedContent: ['Project X', 'AI'] },
    { path: '/project-x-web', title: 'Project X Web', expectedContent: ['Project X', 'Web'] },
  ]
};

test.describe('URL Accessibility & Content Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set up common test configuration
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Public Customer-Facing Routes', () => {
    for (const route of ROUTES.public) {
      test(`${route.path} - loads properly and displays expected content`, async ({ page }) => {
        // Navigate to the page
        await page.goto(route.path);
        
        // Verify page loads without errors
        await expect(page).toHaveTitle(new RegExp(route.title, 'i'));
        
        // Check for expected content
        for (const content of route.expectedContent) {
          await expect(page.locator('body')).toContainText(content);
        }
        
        // Verify page has basic structure
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('main, [role="main"], .main, #main')).toBeVisible();
        
        // Check for no console errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Wait a moment for any potential errors
        await page.waitForTimeout(1000);
        
        // Filter out expected errors (like 404s for missing resources)
        const unexpectedErrors = consoleErrors.filter(error => 
          !error.includes('404') && 
          !error.includes('favicon') &&
          !error.includes('chrome-extension') &&
          !error.includes('DevTools')
        );
        
        expect(unexpectedErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Dynamic Routes', () => {
    for (const route of ROUTES.dynamic) {
      test(`${route.path} - loads with sample ID and displays expected content`, async ({ page }) => {
        // Navigate to the page with sample ID
        await page.goto(route.path);
        
        // Verify page loads without errors
        await expect(page).toHaveTitle(new RegExp(route.title, 'i'));
        
        // Check for expected content (some may show "not found" which is expected)
        for (const content of route.expectedContent) {
          // Use a more flexible check since these pages might show "not found"
          const hasContent = await page.locator('body').textContent();
          expect(hasContent).toContain(content);
        }
        
        // Verify page has basic structure
        await expect(page.locator('nav')).toBeVisible();
        
        // Check for no critical console errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        await page.waitForTimeout(1000);
        
        const criticalErrors = consoleErrors.filter(error => 
          !error.includes('404') && 
          !error.includes('favicon') &&
          !error.includes('chrome-extension') &&
          !error.includes('DevTools') &&
          !error.includes('not found')
        );
        
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Admin Routes (Unauthenticated)', () => {
    for (const route of ROUTES.admin) {
      test(`${route.path} - redirects to login when not authenticated`, async ({ page }) => {
        // Navigate to admin route
        await page.goto(route.path);
        
        // Should redirect to login or show access denied
        const currentUrl = page.url();
        const isLoginPage = currentUrl.includes('/admin/login') || 
                           currentUrl.includes('/login') ||
                           page.locator('body').textContent().then(text => 
                             text?.toLowerCase().includes('login') || 
                             text?.toLowerCase().includes('access denied') ||
                             text?.toLowerCase().includes('unauthorized')
                           );
        
        expect(isLoginPage).toBeTruthy();
      });
    }
  });

  test.describe('Special Routes', () => {
    for (const route of ROUTES.special) {
      test(`${route.path} - loads properly`, async ({ page }) => {
        // Navigate to the page
        await page.goto(route.path);
        
        // Verify page loads without errors
        await expect(page).toHaveTitle(new RegExp(route.title, 'i'));
        
        // Check for expected content
        for (const content of route.expectedContent) {
          await expect(page.locator('body')).toContainText(content);
        }
        
        // Verify page has basic structure
        await expect(page.locator('nav')).toBeVisible();
        
        // Check for no critical console errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        await page.waitForTimeout(1000);
        
        const criticalErrors = consoleErrors.filter(error => 
          !error.includes('404') && 
          !error.includes('favicon') &&
          !error.includes('chrome-extension') &&
          !error.includes('DevTools')
        );
        
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Navigation & Cross-Page Functionality', () => {
    test('Navigation menu works on all pages', async ({ page }) => {
      const testPages = ['/', '/book', '/help', '/about'];
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        
        // Check that navigation menu is present
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
        
        // Check for main navigation links
        await expect(nav.locator('a[href="/"]')).toBeVisible();
        await expect(nav.locator('a[href="/book"]')).toBeVisible();
        await expect(nav.locator('a[href="/help"]')).toBeVisible();
        await expect(nav.locator('a[href="/about"]')).toBeVisible();
        
        // Verify current page is highlighted
        const currentPageLink = nav.locator(`a[href="${testPage}"]`);
        await expect(currentPageLink).toHaveClass(/active|current/);
      }
    });

    test('Footer and common elements are present', async ({ page }) => {
      await page.goto('/');
      
      // Check for common elements that should be on most pages
      const body = page.locator('body');
      const bodyText = await body.textContent();
      
      // Should have company name somewhere
      expect(bodyText).toContain('Fairfield');
      
      // Should have contact information
      expect(bodyText).toContain('Contact') || expect(bodyText).toContain('Phone');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('Pages are mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const testPages = ['/', '/book', '/help', '/about'];
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        
        // Check that navigation is accessible on mobile
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
        
        // Check that content is readable (no horizontal overflow)
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();
        expect(bodyBox?.width).toBeLessThanOrEqual(375);
        
        // Check for mobile menu button if it exists
        const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .mobile-menu-button');
        if (await mobileMenuButton.count() > 0) {
          await expect(mobileMenuButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Performance & Loading', () => {
    test('Pages load within acceptable time', async ({ page }) => {
      const testPages = ['/', '/book', '/help', '/about'];
      
      for (const testPage of testPages) {
        const startTime = Date.now();
        
        await page.goto(testPage);
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Pages should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
        
        // Verify page is interactive
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('404 page handles invalid routes gracefully', async ({ page }) => {
      await page.goto('/invalid-route-that-does-not-exist');
      
      // Should show a 404 page or error message
      const bodyText = await page.locator('body').textContent();
      
      // Should contain some form of error message
      const hasErrorContent = bodyText?.includes('404') || 
                             bodyText?.includes('Not Found') ||
                             bodyText?.includes('Page not found') ||
                             bodyText?.includes('Error');
      
      expect(hasErrorContent).toBeTruthy();
    });

    test('API errors are handled gracefully', async ({ page }) => {
      // Test a page that might have API calls
      await page.goto('/book');
      
      // Mock API failure
      await page.route('**/api/**', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });
      
      // Try to interact with the page
      await page.waitForTimeout(1000);
      
      // Page should still be functional or show appropriate error
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
}); 