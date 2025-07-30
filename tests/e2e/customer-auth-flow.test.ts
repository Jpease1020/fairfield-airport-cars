import { test, expect } from '@playwright/test';

test.describe('Customer Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test.describe('🔐 Customer Registration', () => {
    test('should display registration page', async ({ page }) => {
      await page.goto('/register');
      
      // Check that registration form is visible
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
      await expect(page.getByLabel(/full name/i)).toBeVisible();
      await expect(page.getByLabel(/email address/i)).toBeVisible();
      await expect(page.getByLabel(/phone number/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('should validate registration form fields', async ({ page }) => {
      await page.goto('/register');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should show validation errors
      await expect(page.getByText(/name is required/i)).toBeVisible();
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/phone number is required/i)).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/register');
      
      // Fill in form with short password
      await page.getByLabel(/full name/i).fill('John Doe');
      await page.getByLabel(/email address/i).fill('john@example.com');
      await page.getByLabel(/phone number/i).fill('(555) 123-4567');
      await page.getByLabel(/password/i).fill('123');
      await page.getByLabel(/confirm password/i).fill('123');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should show password length error
      await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register');
      
      // Fill in form with mismatched passwords
      await page.getByLabel(/full name/i).fill('John Doe');
      await page.getByLabel(/email address/i).fill('john@example.com');
      await page.getByLabel(/phone number/i).fill('(555) 123-4567');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('password456');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should show password mismatch error
      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('should navigate to login from registration', async ({ page }) => {
      await page.goto('/register');
      
      // Click on "Sign in" link
      await page.getByRole('link', { name: /sign in/i }).click();
      
      // Should navigate to login page
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });
  });

  test.describe('🔑 Customer Login', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');
      
      // Check that login form is visible
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/email address/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    });

    test('should handle invalid login credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.getByLabel(/email address/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should show error message
      await expect(page.getByText(/failed to log in/i)).toBeVisible();
    });

    test('should navigate to registration from login', async ({ page }) => {
      await page.goto('/login');
      
      // Click on "Sign up" link
      await page.getByRole('link', { name: /sign up/i }).click();
      
      // Should navigate to registration page
      await expect(page).toHaveURL('/register');
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    });
  });

  test.describe('🔒 Password Reset', () => {
    test('should display forgot password page', async ({ page }) => {
      await page.goto('/forgot-password');
      
      // Check that forgot password form is visible
      await expect(page.getByRole('heading', { name: /forgot your password/i })).toBeVisible();
      await expect(page.getByLabel(/email address/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    });

    test('should handle password reset request', async ({ page }) => {
      await page.goto('/forgot-password');
      
      // Fill in email
      await page.getByLabel(/email address/i).fill('test@example.com');
      await page.getByRole('button', { name: /send reset link/i }).click();

      // Should show success message
      await expect(page.getByText(/check your email/i)).toBeVisible();
      await expect(page.getByText(/we've sent a password reset link/i)).toBeVisible();
    });

    test('should navigate back to login from forgot password', async ({ page }) => {
      await page.goto('/forgot-password');
      
      // Click on "Back to Login" link
      await page.getByRole('link', { name: /back to login/i }).click();
      
      // Should navigate to login page
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('📊 Customer Dashboard', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to login page
      await expect(page).toHaveURL('/login');
    });

    test('should display dashboard after successful login', async ({ page }) => {
      // Mock successful authentication
      await page.addInitScript(() => {
        // Mock Firebase auth state
        window.localStorage.setItem('auth-token', 'mock-token');
      });

      await page.goto('/login');
      
      // Fill in valid credentials (mock)
      await page.getByLabel(/email address/i).fill('customer@example.com');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      
      // Should show dashboard elements
      await expect(page.getByText(/welcome back/i)).toBeVisible();
      await expect(page.getByText(/your stats/i)).toBeVisible();
      await expect(page.getByText(/quick actions/i)).toBeVisible();
    });

    test('should display customer stats', async ({ page }) => {
      // Mock authenticated user with profile data
      await page.addInitScript(() => {
        window.localStorage.setItem('auth-token', 'mock-token');
        window.localStorage.setItem('customer-profile', JSON.stringify({
          name: 'John Doe',
          totalBookings: 5,
          totalSpent: 250.00,
          createdAt: new Date().toISOString()
        }));
      });

      await page.goto('/dashboard');
      
      // Should show customer stats
      await expect(page.getByTestId('total-bookings')).toBeVisible();
      await expect(page.getByTestId('total-spent')).toBeVisible();
      await expect(page.getByTestId('member-since')).toBeVisible();
    });

    test('should provide quick actions', async ({ page }) => {
      // Mock authenticated user
      await page.addInitScript(() => {
        window.localStorage.setItem('auth-token', 'mock-token');
      });

      await page.goto('/dashboard');
      
      // Should show quick action buttons
      await expect(page.getByTestId('book-ride-action')).toBeVisible();
      await expect(page.getByTestId('view-bookings-action')).toBeVisible();
      await expect(page.getByTestId('edit-profile-action')).toBeVisible();
    });

    test('should handle logout', async ({ page }) => {
      // Mock authenticated user
      await page.addInitScript(() => {
        window.localStorage.setItem('auth-token', 'mock-token');
      });

      await page.goto('/dashboard');
      
      // Click logout button
      await page.getByTestId('logout-button').click();
      
      // Should redirect to homepage
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('🎯 Complete Authentication Flow', () => {
    test('should complete full registration to dashboard flow', async ({ page }) => {
      // Start at registration page
      await page.goto('/register');
      
      // Fill in registration form
      await page.getByLabel(/full name/i).fill('Jane Smith');
      await page.getByLabel(/email address/i).fill('jane@example.com');
      await page.getByLabel(/phone number/i).fill('(555) 987-6543');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('password123');
      
      // Mock successful registration
      await page.addInitScript(() => {
        // Mock Firebase auth success
        window.localStorage.setItem('auth-token', 'mock-token');
        window.localStorage.setItem('customer-profile', JSON.stringify({
          name: 'Jane Smith',
          email: 'jane@example.com',
          totalBookings: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString()
        }));
      });
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(/welcome back, jane smith/i)).toBeVisible();
    });

    test('should handle Google sign-in flow', async ({ page }) => {
      await page.goto('/login');
      
      // Mock Google sign-in success
      await page.addInitScript(() => {
        window.localStorage.setItem('auth-token', 'mock-google-token');
        window.localStorage.setItem('customer-profile', JSON.stringify({
          name: 'Google User',
          email: 'google@example.com',
          totalBookings: 2,
          totalSpent: 150.00,
          createdAt: new Date().toISOString()
        }));
      });
      
      await page.getByRole('button', { name: /sign in with google/i }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(/welcome back, google user/i)).toBeVisible();
    });
  });
}); 