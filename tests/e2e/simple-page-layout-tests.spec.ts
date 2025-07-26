import { test, expect } from '@playwright/test';

// Test suite for simple page layout tests
// Verifies that our perfected pages are working correctly with the new design system

test.describe('Simple Page Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage first
    await page.goto('http://localhost:3000');
  });

  test.describe('Public Pages', () => {
    test('Homepage loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Check that the page loads without errors
      await expect(page).toHaveTitle(/Fairfield Airport Cars/);
      
      // Verify UnifiedLayout is being used (no old layout components)
      await expect(page.locator('body')).not.toContainText('UniversalLayout');
      await expect(page.locator('body')).not.toContainText('LayoutEnforcer');
      
      // Check for main content sections
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      
      // Verify no inline styles are present
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
    });

    test('About page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/about');
      
      // Check page title
      await expect(page).toHaveTitle(/About/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('About Fairfield Airport Cars');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Help page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/help');
      
      // Check page title
      await expect(page).toHaveTitle(/Help/);
      
      // Verify content is present
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Terms page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/terms');
      
      // Check page title
      await expect(page).toHaveTitle(/Terms/);
      
      // Verify content is present
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Privacy page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/privacy');
      
      // Check page title
      await expect(page).toHaveTitle(/Privacy/);
      
      // Verify content is present
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Portal page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/portal');
      
      // Check page title
      await expect(page).toHaveTitle(/Portal/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Customer Portal');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Cancel page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/cancel');
      
      // Check page title
      await expect(page).toHaveTitle(/Cancel/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Cancel Booking');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Success page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/success');
      
      // Check page title
      await expect(page).toHaveTitle(/Success/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Booking Confirmed');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });
  });

  test.describe('Booking Pages', () => {
    test('Book page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/book');
      
      // Check page title
      await expect(page).toHaveTitle(/Book/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Book Your Ride');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Booking form loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/book');
      
      // Check for form elements
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="pickupLocation"]')).toBeVisible();
      await expect(page.locator('input[name="dropoffLocation"]')).toBeVisible();
      
      // Check for design system components
      await expect(page.locator('.form-section')).toBeVisible();
      await expect(page.locator('.form-field')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });
  });

  test.describe('Status and Feedback Pages', () => {
    test('Status page loads with correct layout', async ({ page }) => {
      // Use a mock booking ID for testing
      await page.goto('http://localhost:3000/status/test-booking-123');
      
      // Check page title
      await expect(page).toHaveTitle(/Status/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Booking Status');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Feedback page loads with correct layout', async ({ page }) => {
      // Use a mock booking ID for testing
      await page.goto('http://localhost:3000/feedback/test-booking-123');
      
      // Check page title
      await expect(page).toHaveTitle(/Feedback/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Feedback');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });
  });

  test.describe('Admin Pages', () => {
    test('Admin login page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/login');
      
      // Check page title
      await expect(page).toHaveTitle(/Login/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Admin Login');
      
      // Check for form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin dashboard loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin');
      
      // Check page title
      await expect(page).toHaveTitle(/Admin/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin bookings page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/bookings');
      
      // Check page title
      await expect(page).toHaveTitle(/Bookings/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Bookings');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin drivers page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/drivers');
      
      // Check page title
      await expect(page).toHaveTitle(/Drivers/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Drivers');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin feedback page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/feedback');
      
      // Check page title
      await expect(page).toHaveTitle(/Feedback/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Feedback');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin comments page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/comments');
      
      // Check page title
      await expect(page).toHaveTitle(/Comments/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Comments');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin promos page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/promos');
      
      // Check page title
      await expect(page).toHaveTitle(/Promos/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Promo Codes');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin costs page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/costs');
      
      // Check page title
      await expect(page).toHaveTitle(/Costs/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Costs');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('Admin help page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/help');
      
      // Check page title
      await expect(page).toHaveTitle(/Help/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Help');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });
  });

  test.describe('CMS Pages', () => {
    test('CMS main page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/cms');
      
      // Check page title
      await expect(page).toHaveTitle(/CMS/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('CMS');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('CMS business page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/cms/business');
      
      // Check page title
      await expect(page).toHaveTitle(/Business/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Business Settings');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('CMS colors page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/cms/colors');
      
      // Check page title
      await expect(page).toHaveTitle(/Colors/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Colors');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('CMS pages page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/cms/pages');
      
      // Check page title
      await expect(page).toHaveTitle(/Pages/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Pages');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });

    test('CMS pricing page loads with correct layout', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/cms/pricing');
      
      // Check page title
      await expect(page).toHaveTitle(/Pricing/);
      
      // Verify content is present
      await expect(page.locator('h1')).toContainText('Pricing');
      
      // Check for design system components
      await expect(page.locator('.grid-section')).toBeVisible();
      await expect(page.locator('.info-card')).toBeVisible();
      
      // Verify no inline styles
      const inlineStyles = await page.locator('[style]').count();
      expect(inlineStyles).toBe(0);
    });
  });

  test.describe('Design System Compliance', () => {
    test('All pages use UnifiedLayout', async ({ page }) => {
      const pages = [
        '/',
        '/about',
        '/help',
        '/terms',
        '/privacy',
        '/portal',
        '/cancel',
        '/success',
        '/book',
        '/admin/login',
        '/admin',
        '/admin/bookings',
        '/admin/drivers',
        '/admin/feedback',
        '/admin/comments',
        '/admin/promos',
        '/admin/costs',
        '/admin/help',
        '/admin/cms',
        '/admin/cms/business',
        '/admin/cms/colors',
        '/admin/cms/pages',
        '/admin/cms/pricing'
      ];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Verify no old layout components are present
        await expect(page.locator('body')).not.toContainText('UniversalLayout');
        await expect(page.locator('body')).not.toContainText('LayoutEnforcer');
        
        // Verify main content is present
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('h1')).toBeVisible();
      }
    });

    test('No inline styles present on any page', async ({ page }) => {
      const pages = [
        '/',
        '/about',
        '/help',
        '/terms',
        '/privacy',
        '/portal',
        '/cancel',
        '/success',
        '/book',
        '/admin/login',
        '/admin',
        '/admin/bookings',
        '/admin/drivers',
        '/admin/feedback',
        '/admin/comments',
        '/admin/promos',
        '/admin/costs',
        '/admin/help',
        '/admin/cms',
        '/admin/cms/business',
        '/admin/cms/colors',
        '/admin/cms/pages',
        '/admin/cms/pricing'
      ];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Verify no inline styles are present
        const inlineStyles = await page.locator('[style]').count();
        expect(inlineStyles).toBe(0);
      }
    });

    test('All pages use design system components', async ({ page }) => {
      const pages = [
        '/',
        '/about',
        '/help',
        '/terms',
        '/privacy',
        '/portal',
        '/cancel',
        '/success',
        '/book',
        '/admin/login',
        '/admin',
        '/admin/bookings',
        '/admin/drivers',
        '/admin/feedback',
        '/admin/comments',
        '/admin/promos',
        '/admin/costs',
        '/admin/help',
        '/admin/cms',
        '/admin/cms/business',
        '/admin/cms/colors',
        '/admin/cms/pages',
        '/admin/cms/pricing'
      ];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Verify design system components are present
        await expect(page.locator('.grid-section')).toBeVisible();
        await expect(page.locator('.info-card')).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('Pages are responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const pages = [
        '/',
        '/about',
        '/help',
        '/book',
        '/admin/login'
      ];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Verify content is visible on mobile
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('h1')).toBeVisible();
        
        // Verify no horizontal scrolling issues
        const bodyWidth = await page.locator('body').boundingBox();
        const viewportWidth = page.viewportSize()?.width || 375;
        expect(bodyWidth?.width).toBeLessThanOrEqual(viewportWidth);
      }
    });

    test('Pages are responsive on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const pages = [
        '/',
        '/about',
        '/help',
        '/book',
        '/admin/login'
      ];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Verify content is visible on tablet
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('h1')).toBeVisible();
        
        // Verify no horizontal scrolling issues
        const bodyWidth = await page.locator('body').boundingBox();
        const viewportWidth = page.viewportSize()?.width || 768;
        expect(bodyWidth?.width).toBeLessThanOrEqual(viewportWidth);
      }
    });
  });
}); 