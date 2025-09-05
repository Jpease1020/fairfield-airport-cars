import { test, expect } from '@playwright/test';

test.describe('Authentication Pages - Page Level Tests', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');
    });

    test('renders correctly with proper form elements', async ({ page }) => {
      // Check that login form is visible
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

      // Check that labels are not showing fallback strings
      await expect(page.locator('text=[LABEL]')).toHaveCount(0);
      await expect(page.locator('text=form name label')).toHaveCount(0);
    });

    test('form validation works correctly', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"]');
      
      // Button should be disabled initially
      await expect(loginButton).toBeDisabled();

      // Fill email only
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await expect(loginButton).toBeDisabled();

      // Fill password
      await page.fill('[data-testid="password-input"]', 'password123');
      await expect(loginButton).toBeEnabled();
    });

    test('form inputs work correctly', async ({ page }) => {
      // Test email input
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await expect(page.locator('[data-testid="email-input"]')).toHaveValue('user@example.com');

      // Test password input
      await page.fill('[data-testid="password-input"]', 'mypassword');
      await expect(page.locator('[data-testid="password-input"]')).toHaveValue('mypassword');
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'invalid@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('redirects to register page', async ({ page }) => {
      await page.click('[data-testid="register-link"]');
      await expect(page).toHaveURL('/auth/register');
    });

    test('redirects to forgot password page', async ({ page }) => {
      await page.click('[data-testid="forgot-password-link"]');
      await expect(page).toHaveURL('/auth/forgot-password');
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');
    });

    test('renders correctly with all form elements', async ({ page }) => {
      // Check that all form fields are visible
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-button"]')).toBeVisible();

      // Check that labels are not showing fallback strings
      await expect(page.locator('text=[LABEL]')).toHaveCount(0);
      await expect(page.locator('text=form name label')).toHaveCount(0);
    });

    test('form validation works correctly', async ({ page }) => {
      const registerButton = page.locator('[data-testid="register-button"]');
      
      // Button should be disabled initially
      await expect(registerButton).toBeDisabled();

      // Fill all required fields
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.fill('[data-testid="phone-input"]', '203-555-0123');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'password123');

      // Button should now be enabled
      await expect(registerButton).toBeEnabled();
    });

    test('password confirmation validation works', async ({ page }) => {
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.fill('[data-testid="phone-input"]', '203-555-0123');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');

      // Should show password mismatch error
      await expect(page.locator('[data-testid="password-mismatch-error"]')).toBeVisible();
    });

    test('form inputs work correctly', async ({ page }) => {
      // Test name input
      await page.fill('[data-testid="name-input"]', 'Jane Smith');
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Jane Smith');

      // Test email input
      await page.fill('[data-testid="email-input"]', 'jane@example.com');
      await expect(page.locator('[data-testid="email-input"]')).toHaveValue('jane@example.com');

      // Test phone input
      await page.fill('[data-testid="phone-input"]', '203-555-0456');
      await expect(page.locator('[data-testid="phone-input"]')).toHaveValue('203-555-0456');

      // Test password inputs
      await page.fill('[data-testid="password-input"]', 'mypassword');
      await expect(page.locator('[data-testid="password-input"]')).toHaveValue('mypassword');

      await page.fill('[data-testid="confirm-password-input"]', 'mypassword');
      await expect(page.locator('[data-testid="confirm-password-input"]')).toHaveValue('mypassword');
    });

    test('redirects to login page', async ({ page }) => {
      await page.click('[data-testid="login-link"]');
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Forgot Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/forgot-password');
      await page.waitForLoadState('networkidle');
    });

    test('renders correctly with form elements', async ({ page }) => {
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-button"]')).toBeVisible();

      // Check that labels are not showing fallback strings
      await expect(page.locator('text=[LABEL]')).toHaveCount(0);
      await expect(page.locator('text=form name label')).toHaveCount(0);
    });

    test('form validation works correctly', async ({ page }) => {
      const resetButton = page.locator('[data-testid="reset-button"]');
      
      // Button should be disabled initially
      await expect(resetButton).toBeDisabled();

      // Fill email
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await expect(resetButton).toBeEnabled();
    });

    test('shows success message after submission', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.click('[data-testid="reset-button"]');

      // Should show success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('redirects back to login page', async ({ page }) => {
      await page.click('[data-testid="back-to-login-link"]');
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Authentication Flow Integration', () => {
    test('complete registration and login flow', async ({ page }) => {
      // Register new user
      await page.goto('/auth/register');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'testuser@example.com');
      await page.fill('[data-testid="phone-input"]', '203-555-0123');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'password123');
      await page.click('[data-testid="register-button"]');

      // Should redirect to login or dashboard
      await page.waitForLoadState('networkidle');

      // Login with new credentials
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'testuser@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Should be logged in and redirected
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/(dashboard|bookings)/);
    });

    test('protected routes redirect to login', async ({ page }) => {
      // Try to access protected route without being logged in
      await page.goto('/bookings');
      
      // Should redirect to login page
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('CMS Integration', () => {
    test('all auth pages use CMS data correctly', async ({ page }) => {
      const pages = ['/auth/login', '/auth/register', '/auth/forgot-password'];
      
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
