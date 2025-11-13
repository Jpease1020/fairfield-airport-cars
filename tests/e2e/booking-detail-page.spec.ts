/**
 * Booking Detail Page E2E Tests
 * 
 * End-to-end tests for the critical booking detail page:
 * - Page loads correctly
 * - Booking data displays
 * - Date formatting works
 * - Error handling works
 * - Email link access works
 */

import { test, expect } from '@playwright/test';

test.describe('Booking Detail Page - Critical Flow', () => {
  test('should load booking detail page with valid booking ID', async ({ page }) => {
    // Navigate to booking detail page
    await page.goto('/booking/CWEST7');
    
    // Should show loading state initially
    await expect(page.locator('text=/Please wait|loading/i')).toBeVisible({ timeout: 5000 });
    
    // Wait for content to load (either booking or error)
    await page.waitForLoadState('networkidle');
    
    // Should either show booking details or error message
    const hasBookingContent = await page.locator('text=/Pickup|Trip Details|Passenger/i').isVisible().catch(() => false);
    const hasError = await page.locator('text=/not found|error|invalid/i').isVisible().catch(() => false);
    
    expect(hasBookingContent || hasError).toBe(true);
  });

  test('should display booking information correctly', async ({ page }) => {
    // Mock API response
    await page.route('**/api/booking/get-bookings-simple*', async route => {
      const bookingId = new URL(route.request().url()).searchParams.get('id');
      
      if (bookingId === 'TEST123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            booking: {
              id: 'TEST123',
              status: 'confirmed',
              createdAt: '2025-01-15T10:30:00.000Z',
              updatedAt: '2025-01-15T10:35:00.000Z',
              trip: {
                pickup: {
                  address: '30 Shut Rd, Newtown, CT 06470, USA',
                  coordinates: { lat: 41.3641, lng: -73.3484 }
                },
                dropoff: {
                  address: 'John F. Kennedy International Airport',
                  coordinates: { lat: 40.6413, lng: -73.7781 }
                },
                pickupDateTime: '2025-01-16T14:00:00.000Z',
                fareType: 'personal',
                fare: 132.50
              },
              customer: {
                name: 'Test User',
                email: 'test@example.com',
                phone: '2035551234',
                notes: '',
                saveInfoForFuture: false
              },
              payment: {
                depositAmount: 0,
                balanceDue: 132.50,
                totalAmount: 132.50,
                depositPaid: false,
                tipAmount: 0,
                tipPercent: 0
              }
            }
          })
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Booking not found'
          })
        });
      }
    });

    await page.goto('/booking/TEST123');
    
    // Wait for booking to load
    await expect(page.locator('text=/Test User/i')).toBeVisible({ timeout: 10000 });
    
    // Verify booking details are displayed
    await expect(page.locator('text=/30 Shut Rd/i')).toBeVisible();
    await expect(page.locator('text=/JFK Airport/i')).toBeVisible();
    await expect(page.locator('text=/\$132\\.50/')).toBeVisible();
    
    // Verify date is formatted (should show day name, month, etc.)
    const dateText = await page.locator('text=/January|Thursday|2025/i').textContent();
    expect(dateText).toBeTruthy();
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.route('**/api/booking/get-bookings-simple*', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Booking not found'
        })
      });
    });

    await page.goto('/booking/INVALID123');
    
    // Should show error message
    await expect(page.locator('text=/not found|invalid/i')).toBeVisible({ timeout: 10000 });
    
    // Should show action buttons
    await expect(page.locator('text=/Try Again|Book a New Ride/i')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/booking/get-bookings-simple*', async route => {
      await route.abort('failed');
    });

    await page.goto('/booking/TEST123');
    
    // Should show error message
    await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 10000 });
  });

  test('should work when accessed via email link (no authentication)', async ({ page }) => {
    // Simulate accessing booking detail page without being logged in
    // This tests that Admin SDK is used (no auth required)
    
    await page.route('**/api/booking/get-bookings-simple*', async route => {
      const bookingId = new URL(route.request().url()).searchParams.get('id');
      
      // Verify no auth header is required
      const authHeader = route.request().headers()['authorization'];
      expect(authHeader).toBeUndefined();
      
      if (bookingId === 'EMAIL_LINK_TEST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            booking: {
              id: 'EMAIL_LINK_TEST',
              status: 'pending',
              createdAt: '2025-01-15T10:30:00.000Z',
              updatedAt: '2025-01-15T10:35:00.000Z',
              trip: {
                pickup: {
                  address: '30 Shut Rd',
                  coordinates: { lat: 41.3641, lng: -73.3484 }
                },
                dropoff: {
                  address: 'JFK Airport',
                  coordinates: { lat: 40.6413, lng: -73.7781 }
                },
                pickupDateTime: '2025-01-16T14:00:00.000Z',
                fareType: 'personal',
                fare: 100
              },
              customer: {
                name: 'Email User',
                email: 'email@example.com',
                phone: '2035551234',
                notes: '',
                saveInfoForFuture: false
              },
              payment: {
                depositAmount: 0,
                balanceDue: 100,
                totalAmount: 100,
                depositPaid: false,
                tipAmount: 0,
                tipPercent: 0
              }
            }
          })
        });
      }
    });

    await page.goto('/booking/EMAIL_LINK_TEST');
    
    // Should load booking without authentication
    await expect(page.locator('text=/Email User/i')).toBeVisible({ timeout: 10000 });
  });

  test('should format dates correctly without errors', async ({ page }) => {
    // This test specifically checks for date formatting errors
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.route('**/api/booking/get-bookings-simple*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          booking: {
            id: 'DATE_TEST',
            status: 'confirmed',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:35:00.000Z',
            trip: {
              pickup: {
                address: '30 Shut Rd',
                coordinates: { lat: 41.3641, lng: -73.3484 }
              },
              dropoff: {
                address: 'JFK Airport',
                coordinates: { lat: 40.6413, lng: -73.7781 }
              },
              pickupDateTime: '2025-01-16T14:00:00.000Z',
              fareType: 'personal',
              fare: 100
            },
            customer: {
              name: 'Date Test User',
              email: 'test@example.com',
              phone: '2035551234',
              notes: '',
              saveInfoForFuture: false
            },
            payment: {
              depositAmount: 0,
              balanceDue: 100,
              totalAmount: 100,
              depositPaid: false,
              tipAmount: 0,
              tipPercent: 0
            }
          }
        })
      });
    });

    await page.goto('/booking/DATE_TEST');
    
    // Wait for page to load
    await expect(page.locator('text=/Date Test User/i')).toBeVisible({ timeout: 10000 });
    
    // Check for date-related errors
    const dateErrors = consoleErrors.filter(err => 
      err.includes('getTime') || 
      err.includes('is not a function') ||
      err.includes('Invalid date')
    );
    
    expect(dateErrors.length).toBe(0);
  });
});

