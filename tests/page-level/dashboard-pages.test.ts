import { test, expect } from '@playwright/test';

test.describe('Dashboard Pages - Page Level Tests', () => {
  test.describe('Bookings Page', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication by setting a token in localStorage
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
      
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');
    });

    test('renders correctly for authenticated user', async ({ page }) => {
      // Check that bookings page elements are visible
      await expect(page.locator('[data-testid="bookings-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="bookings-subtitle"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-new-ride-button"]')).toBeVisible();

      // Check that labels are not showing fallback strings
      await expect(page.locator('text=[LABEL]')).toHaveCount(0);
      await expect(page.locator('text=form name label')).toHaveCount(0);
    });

    test('shows empty state when no bookings', async ({ page }) => {
      // Check that empty state is displayed
      await expect(page.locator('[data-testid="no-bookings-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-first-ride-button"]')).toBeVisible();
    });

    test('book new ride button works', async ({ page }) => {
      await page.click('[data-testid="book-new-ride-button"]');
      await expect(page).toHaveURL('/book');
    });

    test('book first ride button works', async ({ page }) => {
      await page.click('[data-testid="book-first-ride-button"]');
      await expect(page).toHaveURL('/book');
    });

    test('navigation works correctly', async ({ page }) => {
      // Test navigation to other pages
      await page.click('[data-testid="nav-profile"]');
      await expect(page).toHaveURL('/profile');
      
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-testid="nav-payments"]');
      await expect(page).toHaveURL('/payments');
    });
  });

  test.describe('Profile Page', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          phone: '203-555-0123'
        }));
      });
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
    });

    test('renders correctly with user information', async ({ page }) => {
      // Check that profile page elements are visible
      await expect(page.locator('[data-testid="profile-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-subtitle"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-phone"]')).toBeVisible();

      // Check that labels are not showing fallback strings
      await expect(page.locator('text=[LABEL]')).toHaveCount(0);
      await expect(page.locator('text=form name label')).toHaveCount(0);
    });

    test('displays user information correctly', async ({ page }) => {
      // Check that user data is displayed
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
      await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
      await expect(page.locator('[data-testid="user-phone"]')).toContainText('203-555-0123');
    });

    test('edit profile functionality works', async ({ page }) => {
      // Click edit button
      await page.click('[data-testid="edit-profile-button"]');
      
      // Check that edit form is visible
      await expect(page.locator('[data-testid="edit-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-phone-input"]')).toBeVisible();
    });

    test('save profile changes works', async ({ page }) => {
      await page.click('[data-testid="edit-profile-button"]');
      
      // Update information
      await page.fill('[data-testid="edit-name-input"]', 'Updated Name');
      await page.fill('[data-testid="edit-phone-input"]', '203-555-9999');
      
      // Save changes
      await page.click('[data-testid="save-profile-button"]');
      
      // Check that changes are reflected
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Updated Name');
      await expect(page.locator('[data-testid="user-phone"]')).toContainText('203-555-9999');
    });

    test('cancel edit works', async ({ page }) => {
      await page.click('[data-testid="edit-profile-button"]');
      
      // Make changes
      await page.fill('[data-testid="edit-name-input"]', 'Temporary Name');
      
      // Cancel changes
      await page.click('[data-testid="cancel-edit-button"]');
      
      // Check that original information is still displayed
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
    });
  });

  test.describe('Payments Page', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
      
      await page.goto('/payments');
      await page.waitForLoadState('networkidle');
    });

    test('renders correctly', async ({ page }) => {
      // Check that payments page elements are visible
      await expect(page.locator('[data-testid="payments-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="payments-subtitle"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-payment-method-button"]')).toBeVisible();

      // Check that labels are not showing fallback strings
      await expect(page.locator('text=[LABEL]')).toHaveCount(0);
      await expect(page.locator('text=form name label')).toHaveCount(0);
    });

    test('shows empty state when no payment methods', async ({ page }) => {
      // Check that empty state is displayed
      await expect(page.locator('[data-testid="no-payment-methods-message"]')).toBeVisible();
    });

    test('add payment method button works', async ({ page }) => {
      await page.click('[data-testid="add-payment-method-button"]');
      await expect(page).toHaveURL('/payments/add-method');
    });
  });

  test.describe('Authentication Required', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      // Clear authentication
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
      });
      
      // Try to access protected pages
      const protectedPages = ['/bookings', '/profile', '/payments'];
      
      for (const pagePath of protectedPages) {
        await page.goto(pagePath);
        await expect(page).toHaveURL('/auth/login');
      }
    });
  });

  test.describe('CMS Integration', () => {
    test('all dashboard pages use CMS data correctly', async ({ page }) => {
      // Mock authentication
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User'
        }));
      });
      
      const pages = ['/bookings', '/profile', '/payments'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');

        // Check that no malformed CMS strings are visible
        await expect(page.locator('text=[LABEL]')).toHaveCount(0);
        await expect(page.locator('text=form name label')).toHaveCount(0);
        await expect(page.locator('text=^[A-Z\\s]+\\*$')).toHaveCount(0);
      }
    });
  });
});
