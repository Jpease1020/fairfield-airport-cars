import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin/login');
  });

  test('should display admin login page', async ({ page }) => {
    // Check that login form is visible
    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should navigate to admin dashboard after successful login', async ({ page }) => {
    // Mock successful authentication
    await page.addInitScript(() => {
      // Mock Firebase auth state
      window.localStorage.setItem('admin-token', 'mock-token');
    });

    // Fill in valid credentials (mock)
    await page.getByLabel(/email/i).fill('admin@fairfieldairportcar.com');
    await page.getByLabel(/password/i).fill('adminpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/admin');
    
    // Should show dashboard elements
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should display admin navigation menu', async ({ page }) => {
    // Navigate to admin dashboard (mock authenticated)
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Check navigation menu items
    await expect(page.getByRole('link', { name: /bookings/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /drivers/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /cms/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
  });

  test('should navigate to bookings page', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Click on bookings link
    await page.getByRole('link', { name: /bookings/i }).click();
    
    // Should navigate to bookings page
    await expect(page).toHaveURL('/admin/bookings');
    await expect(page.getByRole('heading', { name: /bookings/i })).toBeVisible();
  });

  test('should navigate to drivers page', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Click on drivers link
    await page.getByRole('link', { name: /drivers/i }).click();
    
    // Should navigate to drivers page
    await expect(page).toHaveURL('/admin/drivers');
    await expect(page.getByRole('heading', { name: /drivers/i })).toBeVisible();
  });

  test('should navigate to CMS page', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Click on CMS link
    await page.getByRole('link', { name: /cms/i }).click();
    
    // Should navigate to CMS page
    await expect(page).toHaveURL('/admin/cms');
    await expect(page.getByRole('heading', { name: /content management/i })).toBeVisible();
  });

  test('should handle logout functionality', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access admin dashboard without authentication
    await page.goto('/admin');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
  });

  test('should display admin dashboard statistics', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Check for dashboard statistics
    await expect(page.getByText(/total bookings/i)).toBeVisible();
    await expect(page.getByText(/active drivers/i)).toBeVisible();
    await expect(page.getByText(/revenue/i)).toBeVisible();
  });

  test('should handle session timeout', async ({ page }) => {
    // Mock authenticated state with expired token
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'expired-token');
    });
    await page.goto('/admin');

    // Should redirect to login after session timeout
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByText(/session expired/i)).toBeVisible();
  });

  test('should display responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Check for mobile menu button
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Click mobile menu button
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Should show mobile navigation menu
    await expect(page.getByRole('link', { name: /bookings/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /drivers/i })).toBeVisible();
  });

  test('should handle admin dashboard accessibility', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-token', 'mock-token');
    });
    await page.goto('/admin');

    // Check for proper ARIA labels and roles
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();
  });
}); 