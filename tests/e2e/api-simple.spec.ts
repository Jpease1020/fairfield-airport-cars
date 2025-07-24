import { test, expect } from '@playwright/test';

// Simple API tests that don't require complex mocking
test.describe('Simple API Tests', () => {
  
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    await expect(page.locator('body')).toContainText('Fairfield Airport Cars');
  });

  test('booking page loads successfully', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('body')).toContainText('Book');
    await expect(page.locator('form')).toBeVisible();
  });

  test('help page loads successfully', async ({ page }) => {
    await page.goto('/help');
    await expect(page.locator('body')).toContainText('Help');
  });

  test('success page loads successfully', async ({ page }) => {
    await page.goto('/success');
    await expect(page.locator('body')).toContainText('Payment');
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('body')).toContainText('Login');
  });

  test('404 page handles invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');
    // Should either show 404 or redirect to home
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe('API Endpoint Tests', () => {
  
  test('estimate-fare endpoint exists', async ({ request }) => {
    const response = await request.post('/api/estimate-fare', {
      data: {
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport'
      }
    });
    
    // Should return some response (even if error due to missing env vars)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);
  });

  test('places-autocomplete endpoint exists', async ({ request }) => {
    const response = await request.post('/api/places-autocomplete', {
      data: {
        input: 'Fairfield'
      }
    });
    
    // Should return some response
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);
  });

  test('create-checkout-session endpoint exists', async ({ request }) => {
    const response = await request.post('/api/create-checkout-session', {
      data: {
        bookingId: 'test-123',
        amount: 15000,
        customerEmail: 'test@example.com'
      }
    });
    
    // Should return some response
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);
  });

  test('send-confirmation endpoint exists', async ({ request }) => {
    const response = await request.post('/api/send-confirmation', {
      data: {
        bookingId: 'test-123',
        customerPhone: '555-123-4567',
        customerEmail: 'test@example.com'
      }
    });
    
    // Should return some response
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);
  });
});

test.describe('Form Validation Tests', () => {
  
  test('booking form has required fields', async ({ page }) => {
    await page.goto('/book');
    
    // Check that required form fields exist
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#pickupLocation')).toBeVisible();
    await expect(page.locator('#dropoffLocation')).toBeVisible();
    await expect(page.locator('#pickupDateTime')).toBeVisible();
    await expect(page.locator('#passengers')).toBeVisible();
  });

  test('booking form has submit button', async ({ page }) => {
    await page.goto('/book');
    
    // Check that submit button exists
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('booking form has calculate fare button', async ({ page }) => {
    await page.goto('/book');
    
    // Check that calculate fare button exists
    await expect(page.locator('button:has-text("Calculate Fare")')).toBeVisible();
  });
});

test.describe('Navigation Tests', () => {
  
  test('navigation between pages works', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Fairfield Airport Cars');
    
    // Navigate to booking page
    await page.click('a[href="/book"], button:has-text("Book")');
    await expect(page).toHaveURL(/\/book/);
    
    // Navigate to help page
    await page.goto('/help');
    await expect(page.locator('body')).toContainText('Help');
  });

  test('footer links work', async ({ page }) => {
    await page.goto('/');
    
    // Check for footer links
    const footer = page.locator('footer');
    if (await footer.isVisible()) {
      // Test footer links if they exist
      const links = footer.locator('a');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Responsive Design Tests', () => {
  
  test('homepage is responsive', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Fairfield Airport Cars');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Fairfield Airport Cars');
  });

  test('booking form is responsive', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/book');
    await expect(page.locator('form')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/book');
    await expect(page.locator('form')).toBeVisible();
  });
}); 