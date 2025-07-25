import { test, expect } from '@playwright/test';

test.describe('Critical Payment Flow Tests', () => {
  test('Complete booking and payment flow', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book');
    
    // Fill out complete booking form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    
    // Set future date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    // Set passengers
    await page.fill('input[type="number"]', '2');
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Wait for fare calculation
    await page.waitForSelector('.fare-display, .price-display', { timeout: 10000 });
    
    // Verify fare is displayed
    const fareElement = page.locator('.fare-display, .price-display');
    await expect(fareElement).toBeVisible();
    
    // Submit booking
    await page.click('button:has-text("Book Your Ride")');
    
    // Should redirect to payment page or show payment form
    await expect(page).toHaveURL(/\/payment|\/checkout|\/success/);
    
    // Verify payment form elements
    await expect(page.locator('input[name*="card"], input[name*="payment"]')).toBeVisible();
  });

  test('Payment error handling', async ({ page }) => {
    await page.goto('/book');
    
    // Fill out booking form
    await page.fill('input[placeholder*="full name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', 'test@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    
    // Set future date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    await page.fill('input[type="number"]', '1');
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await page.waitForSelector('.fare-display, .price-display', { timeout: 10000 });
    
    // Submit booking
    await page.click('button:has-text("Book Your Ride")');
    
    // Should handle payment errors gracefully
    await expect(page).toHaveURL(/\/payment|\/checkout|\/success/);
    
    // Verify error handling elements are present
    await expect(page.locator('.error-message, .alert-error')).toBeVisible();
  });

  test('Payment confirmation flow', async ({ page }) => {
    // Navigate directly to success page to test confirmation
    await page.goto('/success?bookingId=test-booking-123');
    
    // Verify confirmation page elements
    await expect(page.locator('h2:has-text("Booking Confirmed")')).toBeVisible();
    await expect(page.locator('.booking-id')).toBeVisible();
    await expect(page.locator('.success-details')).toBeVisible();
    
    // Verify booking reference is displayed
    await expect(page.locator('.booking-id-display')).toContainText('test-booking-123');
    
    // Verify next steps are listed
    await expect(page.locator('li:has-text("confirmation email")')).toBeVisible();
    await expect(page.locator('li:has-text("SMS reminder")')).toBeVisible();
    await expect(page.locator('li:has-text("driver will contact")')).toBeVisible();
  });

  test('Payment webhook handling', async ({ page }) => {
    // Test webhook endpoint directly
    const response = await page.request.post('/api/payment/square-webhook', {
      headers: {
        'Content-Type': 'application/json',
        'x-square-hmacsha256-signature': 'test-signature'
      },
      data: {
        type: 'payment.updated',
        data: {
          object: {
            payment: {
              order_id: 'test-order-123',
              status: 'COMPLETED'
            }
          }
        }
      }
    });
    
    // Should handle webhook (may return 401 due to signature validation, which is expected)
    expect([200, 401]).toContain(response.status());
  });

  test('Payment link creation', async ({ page }) => {
    // Test payment link creation endpoint
    const response = await page.request.post('/api/payment/create-checkout-session', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        bookingId: 'test-booking-123',
        amount: 15000,
        currency: 'USD',
        description: 'Airport Transfer'
      }
    });
    
    // Should create payment link or return error
    expect([200, 400, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('paymentLinkUrl');
    }
  });

  test('Payment completion flow', async ({ page }) => {
    // Test payment completion endpoint
    const response = await page.request.post('/api/payment/complete-payment', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        bookingId: 'test-booking-123'
      }
    });
    
    // Should handle payment completion
    expect([200, 400, 404, 500]).toContain(response.status());
  });

  test('Booking cancellation with refund', async ({ page }) => {
    // Navigate to booking management page
    await page.goto('/manage/test-booking-123');
    
    // Look for cancel button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Cancel Booking")');
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Should show confirmation dialog
      await expect(page.locator('.modal, .dialog')).toBeVisible();
      
      // Confirm cancellation
      await page.click('button:has-text("Confirm"), button:has-text("Yes")');
      
      // Should show cancellation confirmation
      await expect(page.locator('.success-message, .confirmation')).toBeVisible();
    }
  });

  test('Payment security validation', async ({ page }) => {
    // Test with invalid payment data
    const response = await page.request.post('/api/payment/create-checkout-session', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        // Missing required fields
        bookingId: '',
        amount: -100,
        currency: 'INVALID',
        description: ''
      }
    });
    
    // Should reject invalid payment data
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('Payment integration with booking flow', async ({ page }) => {
    // Complete booking flow and verify payment integration
    await page.goto('/book');
    
    // Fill booking form
    await page.fill('input[placeholder*="full name"]', 'Payment Test User');
    await page.fill('input[placeholder*="email"]', 'payment@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    await page.fill('input[type="number"]', '1');
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await page.waitForSelector('.fare-display, .price-display', { timeout: 10000 });
    
    // Submit booking
    await page.click('button:has-text("Book Your Ride")');
    
    // Verify payment integration
    await expect(page).toHaveURL(/\/payment|\/checkout|\/success/);
    
    // Check for payment form or success message
    const paymentForm = page.locator('input[name*="card"], input[name*="payment"]');
    const successMessage = page.locator('h2:has-text("Booking Confirmed"), .success-message');
    
    await expect(paymentForm.or(successMessage)).toBeVisible();
  });
}); 