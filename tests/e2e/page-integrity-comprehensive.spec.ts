import { test, expect } from '@playwright/test';

// Define types for page specifications
interface PageSpec {
  title: string;
  expectedContent: string[];
  shouldNotHave: string[];
  navigation?: string[];
  layout?: {
    hero?: boolean;
    features?: boolean;
    cta?: boolean;
  };
  form?: {
    required: string[];
    optional?: string[];
  };
}

// Define comprehensive page specifications
const PAGE_SPECIFICATIONS: Record<string, PageSpec> = {
  '/': {
    title: 'Fairfield Airport Cars',
    expectedContent: [
      'Premium Airport Transportation',
      'Why Choose Us?',
      'Professional Service',
      'Reliable & On Time',
      'Easy Booking',
      'Ready for a Stress-Free Ride?'
    ],
    shouldNotHave: [
      'Our Story',
      'Our Commitment',
      'Service Areas'
    ],
    navigation: ['Home', 'Book', 'Help', 'About'],
    layout: {
      hero: true,
      features: true,
      cta: true
    }
  },
  '/book': {
    title: 'Book Your Airport Transfer',
    expectedContent: [
      'Book Your Ride',
      'Fill out the form below to',
      'Full Name',
      'Email',
      'Phone',
      'Pickup Location',
      'Dropoff Location',
      'Number of Passengers',
      'Calculate Fare'
    ],
    shouldNotHave: [
      'Admin Panel',
      'Dashboard'
    ],
    form: {
      required: ['name', 'email', 'phone', 'pickup', 'dropoff'],
      optional: ['notes', 'passengers']
    }
  },
  '/about': {
    title: 'About Us',
    expectedContent: [
      'About Fairfield Airport Cars',
      'Professional Service',
      'Reliable Transportation'
    ],
    shouldNotHave: [
      'Admin Panel',
      'Dashboard'
    ]
  },
  '/help': {
    title: 'Help & Support',
    expectedContent: [
      'Help & Support',
      'Frequently Asked Questions',
      'Contact Information'
    ],
    shouldNotHave: [
      'Admin Panel',
      'Dashboard'
    ]
  },
  '/admin/login': {
    title: 'Admin Login',
    expectedContent: [
      'Admin Login',
      'Enter your email below to login',
      'Email',
      'Password',
      'Log In',
      'Sign In with Google'
    ],
    shouldNotHave: [
      'Premium Airport Transportation',
      'Book Your Ride'
    ],
    form: {
      required: ['email', 'password']
    }
  }
};

test.describe('Comprehensive Page Integrity Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  for (const [path, spec] of Object.entries(PAGE_SPECIFICATIONS)) {
    test(`Page: ${path} - Basic Structure and Content`, async ({ page }) => {
      // Navigate to page
      await page.goto(`http://localhost:3000${path}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page).toHaveTitle(spec.title);
      
      // Check for expected content
      for (const content of spec.expectedContent) {
        await expect(page.getByText(content, { exact: false })).toBeVisible();
      }
      
      // Check that unwanted content is not present
      for (const unwanted of spec.shouldNotHave) {
        await expect(page.getByText(unwanted, { exact: false })).not.toBeVisible();
      }
    });

    test(`Page: ${path} - Navigation Consistency`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      
      // Check navigation elements exist
      if (spec.navigation) {
        for (const navItem of spec.navigation) {
          await expect(page.getByRole('link', { name: navItem })).toBeVisible();
        }
      }
      
      // Check for logo/branding
      await expect(page.locator('img[alt*="logo"], img[alt*="Logo"], .logo')).toBeVisible();
    });

    test(`Page: ${path} - Layout Structure`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      
      // Check basic layout elements
      await expect(page.locator('header, nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      
      // Check for proper spacing and layout
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Check that page has reasonable content height
      const mainHeight = await mainContent.evaluate(el => {
        if (el instanceof HTMLElement) {
          return el.offsetHeight;
        }
        return 0;
      });
      expect(mainHeight).toBeGreaterThan(200);
    });

    test(`Page: ${path} - Form Elements (if applicable)`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      
      if (spec.form) {
        // Check required form fields
        for (const field of spec.form.required) {
          const fieldElement = page.locator(`[name="${field}"], [id="${field}"], [placeholder*="${field}"]`);
          await expect(fieldElement).toBeVisible();
        }
        
        // Check optional form fields
        if (spec.form.optional) {
          for (const field of spec.form.optional) {
            const fieldElement = page.locator(`[name="${field}"], [id="${field}"], [placeholder*="${field}"]`);
            await expect(fieldElement).toBeVisible();
          }
        }
        
        // Check for submit button
        await expect(page.getByRole('button', { name: /submit|calculate|book|login/i })).toBeVisible();
      }
    });

    test(`Page: ${path} - Responsive Design`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Check that page is still functional on mobile
      await expect(page.locator('main')).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Check that page is still functional on tablet
      await expect(page.locator('main')).toBeVisible();
      
      // Reset to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test(`Page: ${path} - Accessibility Basics`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      await expect(headings.first()).toBeVisible();
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const alt = await images.nth(i).getAttribute('alt');
          expect(alt).toBeTruthy();
        }
      }
      
      // Check for proper button and link labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      if (buttonCount > 0) {
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const ariaLabel = await button.getAttribute('aria-label');
          const text = await button.textContent();
          expect(ariaLabel || text?.trim()).toBeTruthy();
        }
      }
    });

    test(`Page: ${path} - Visual Consistency`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot for visual regression testing
      await page.screenshot({ 
        path: `test-results/page-screenshots${path.replace(/\//g, '-')}.png`,
        fullPage: true 
      });
      
      // Check for consistent styling
      const body = page.locator('body');
      const backgroundColor = await body.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(backgroundColor).toBeTruthy();
      
      // Check for readable text
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
      const firstTextElement = textElements.first();
      if (await firstTextElement.isVisible()) {
        const color = await firstTextElement.evaluate(el => 
          window.getComputedStyle(el).color
        );
        expect(color).toBeTruthy();
      }
    });
  }

  test('Cross-page Navigation Consistency', async ({ page }) => {
    // Test navigation between pages
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to booking page
    await page.getByRole('link', { name: /book/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/book/);
    
    // Navigate to about page
    await page.getByRole('link', { name: /about/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/about/);
    
    // Navigate to help page
    await page.getByRole('link', { name: /help/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/help/);
    
    // Navigate back to home
    await page.getByRole('link', { name: /home/i }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('Admin Pages - Authentication Flow', async ({ page }) => {
    // Test admin login page
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Check login form
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    
    // Test form validation
    await page.getByRole('button', { name: /log in/i }).click();
    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('Error Pages - 404 Handling', async ({ page }) => {
    // Test non-existent page
    await page.goto('http://localhost:3000/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or error page
    const status = page.locator('h1, .error-page, [data-testid="error"]');
    await expect(status).toBeVisible();
  });

  test('Performance - Page Load Times', async ({ page }) => {
    const pages = ['/', '/book', '/about', '/help', '/admin/login'];
    
    for (const path of pages) {
      const startTime = Date.now();
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`${path} loaded in ${loadTime}ms`);
    }
  });

  test('SEO - Meta Tags and Structure', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Check for meta tags
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeVisible();
    
    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toBeVisible();
    
    // Check for proper HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  });
}); 