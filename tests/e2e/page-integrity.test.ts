import { test, expect } from '@playwright/test';

// Define types for our page specifications
interface PageSpecification {
  title: string;
  expectedContent: string[];
  shouldNotHave?: string[];
  formFields?: string[];
}

// Define our page specifications with expected content and structure
const PAGE_SPECIFICATIONS: Record<string, PageSpecification> = {
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
    ]
  },
  '/about': {
    title: 'About Us',
    expectedContent: [
      'Our Story',
      'Our Commitment',
      'Our Fleet',
      'Service Areas',
      'Get in Touch',
      'Fairfield Airport Car Service has been providing',
      'John F. Kennedy International Airport (JFK)',
      'LaGuardia Airport (LGA)',
      'Newark Liberty International Airport (EWR)'
    ],
    shouldNotHave: [
      'Why Choose Us?',
      'Ready for a Stress-Free Ride?'
    ]
  },
  '/book': {
    title: 'Book Your Airport Transfer',
    expectedContent: [
      'Book Your Ride',
      'Fill out the form below to book your airport transportation',
      'Full Name',
      'Email',
      'Phone Number',
      'Pickup Location',
      'Dropoff Location',
      'Pickup Date',
      'Pickup Time',
      'Number of Passengers',
      'Special Instructions',
      'Calculate Fare',
      'Book Your Ride'
    ],
    formFields: [
      'input[name="name"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[placeholder*="pickup"]',
      'input[placeholder*="destination"]',
      'input[type="date"]',
      'input[type="time"]',
      'select',
      'textarea'
    ]
  },
  '/help': {
    title: 'Help & Support',
    expectedContent: [
      'Frequently Asked Questions',
      'How far in advance should I book?',
      'What if my flight is delayed?',
      'Do you provide child seats?',
      'What payment methods do you accept?',
      'What if I need to cancel my booking?',
      'Do you provide service to all airports?'
    ],
    shouldNotHave: [
      'Contact Information',
      'Phone',
      'Email',
      'Service Hours'
    ]
  },
  '/terms': {
    title: 'Terms of Service',
    expectedContent: [
      'Terms and Conditions',
      'Booking and Cancellation',
      'Service Standards',
      'Payment',
      'Liability'
    ]
  },
  '/privacy': {
    title: 'Privacy Policy',
    expectedContent: [
      'Privacy Policy',
      'Information We Collect',
      'How We Use Your Information',
      'Information Sharing',
      'Data Security',
      'Your Rights'
    ],
    shouldNotHave: [
      'Terms and Conditions',
      'Booking and Cancellation'
    ]
  },
  '/success': {
    title: 'Payment Successful',
    expectedContent: [
      'Booking Confirmed!',
      'Your airport transportation has been successfully booked',
      'What happens next?',
      'confirmation email',
      'SMS reminder',
      'driver will contact you',
      'Payment will be processed securely'
    ]
  },
  '/cancel': {
    title: 'Booking Cancelled',
    expectedContent: [
      'Booking Cancelled',
      'Your booking has been successfully cancelled',
      'Cancellation Details',
      'payment has been refunded',
      'confirmation email',
      'No further charges'
    ]
  },
  '/portal': {
    title: 'Customer Portal',
    expectedContent: [
      'Welcome to Your Portal',
      'Manage your bookings and account information',
      'Current Bookings',
      'Past Trips',
      'Account Settings',
      'Support'
    ]
  }
};

test.describe('Page Integrity & Content Verification', () => {
  for (const [path, spec] of Object.entries(PAGE_SPECIFICATIONS)) {
    test(`${path} - loads correctly with proper content`, async ({ page }) => {
      // Navigate to the page
      await page.goto(path);
      
      // Check page title
      await expect(page).toHaveTitle(spec.title);
      
      // Check that all expected content is present
      for (const content of spec.expectedContent) {
        await expect(page.locator('body')).toContainText(content);
      }
      
      // Check that content that should NOT be there is absent
      if (spec.shouldNotHave) {
        for (const content of spec.shouldNotHave) {
          await expect(page.locator('body')).not.toContainText(content);
        }
      }
      
      // Check form fields if this is a form page
      if (spec.formFields) {
        for (const field of spec.formFields) {
          await expect(page.locator(field)).toBeVisible();
        }
      }
      
      // Check that the page loads without errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Wait a moment for any errors to appear
      await page.waitForTimeout(1000);
      
      // Fail if there are console errors
      if (consoleErrors.length > 0) {
        throw new Error(`Page has console errors: ${consoleErrors.join(', ')}`);
      }
    });
  }
});

test.describe('Navigation & Layout Consistency', () => {
  test('Navigation works correctly across all pages', async ({ page }) => {
    const pages = Object.keys(PAGE_SPECIFICATIONS);
    
    for (const path of pages) {
      await page.goto(path);
      
      // Check that navigation is present
      await expect(page.locator('.standard-navigation')).toBeVisible();
      
      // Check that current page is highlighted
      const currentLink = page.locator(`.nav-link-active`);
      await expect(currentLink).toBeVisible();
      
      // Verify navigation links work
      const navLinks = ['Home', 'Book', 'Help', 'About'];
      for (const linkText of navLinks) {
        const link = page.locator(`.nav-link:has-text("${linkText}")`);
        await expect(link).toBeVisible();
      }
    }
  });
  
  test('Layout structure is consistent across pages', async ({ page }) => {
    const pages = Object.keys(PAGE_SPECIFICATIONS);
    
    for (const path of pages) {
      await page.goto(path);
      
      // Check that standard layout elements are present
      await expect(page.locator('.standard-layout')).toBeVisible();
      await expect(page.locator('.standard-navigation')).toBeVisible();
      await expect(page.locator('.standard-main')).toBeVisible();
      await expect(page.locator('.standard-content')).toBeVisible();
      await expect(page.locator('.standard-footer')).toBeVisible();
      
      // Check that page has proper header if it has title/subtitle
      const spec = PAGE_SPECIFICATIONS[path];
      if (spec.title && spec.title !== 'Fairfield Airport Cars') {
        await expect(page.locator('.standard-header')).toBeVisible();
        await expect(page.locator('.standard-title')).toBeVisible();
      }
    }
  });
});

test.describe('Responsive Design & Accessibility', () => {
  test('Pages are responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pages = Object.keys(PAGE_SPECIFICATIONS);
    for (const path of pages) {
      await page.goto(path);
      
      // Check that mobile menu button is visible
      await expect(page.locator('.mobile-menu-button')).toBeVisible();
      
      // Check that content is readable
      await expect(page.locator('.standard-content')).toBeVisible();
      
      // Check that text is not too small
      const fontSize = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThan(12); // Minimum readable font size
    }
  });
  
  test('Pages have proper accessibility features', async ({ page }) => {
    const pages = Object.keys(PAGE_SPECIFICATIONS);
    for (const path of pages) {
      await page.goto(path);
      
      // Check that page has proper heading structure
      const headings = await page.locator('h1, h2, h3').count();
      expect(headings).toBeGreaterThan(0);
      
      // Check that images have alt text (if any)
      const images = await page.locator('img').count();
      if (images > 0) {
        for (let i = 0; i < images; i++) {
          const alt = await page.locator('img').nth(i).getAttribute('alt');
          expect(alt).toBeTruthy();
        }
      }
      
      // Check that form inputs have labels
      const inputs = await page.locator('input, select, textarea').count();
      if (inputs > 0) {
        for (let i = 0; i < inputs; i++) {
          const input = page.locator('input, select, textarea').nth(i);
          const id = await input.getAttribute('id');
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            await expect(label).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('Performance & Loading', () => {
  test('Pages load within acceptable time', async ({ page }) => {
    const pages = Object.keys(PAGE_SPECIFICATIONS);
    
    for (const path of pages) {
      const startTime = Date.now();
      await page.goto(path);
      const loadTime = Date.now() - startTime;
      
      // Pages should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check that page is interactive
      await expect(page.locator('body')).toBeVisible();
    }
  });
}); 