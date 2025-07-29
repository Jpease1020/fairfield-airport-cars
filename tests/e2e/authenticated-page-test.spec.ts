import { test, expect } from '@playwright/test';

// Test user credentials
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@fairfieldairportcar.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

// Admin pages that require authentication
const adminPages = [
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/admin/bookings', name: 'Admin Bookings' },
  { path: '/admin/drivers', name: 'Admin Drivers' },
  { path: '/admin/payments', name: 'Admin Payments' },
  { path: '/admin/costs', name: 'Admin Costs' },
  { path: '/admin/feedback', name: 'Admin Feedback' },
  { path: '/admin/help', name: 'Admin Help' },
  { path: '/admin/cms', name: 'Admin CMS' },
  { path: '/admin/comments', name: 'Admin Comments' },
  { path: '/admin/quick-fix', name: 'Admin Quick Fix' },
  { path: '/admin/add-content', name: 'Admin Add Content' },
  { path: '/admin/analytics-disabled', name: 'Admin Analytics Disabled' },
  { path: '/admin/ai-assistant-disabled', name: 'Admin AI Assistant Disabled' },
  { path: '/admin/promos', name: 'Admin Promos' },
  { path: '/admin/calendar', name: 'Admin Calendar' },
];

// Driver pages that require authentication
const driverPages = [
  { path: '/driver/dashboard', name: 'Driver Dashboard' },
  { path: '/driver/location', name: 'Driver Location' },
];

test.describe('Authenticated Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await signInUser(page);
  });

  // Test admin pages with authentication
  for (const adminPage of adminPages) {
    test(`${adminPage.name} loads with authentication`, async ({ page }) => {
      await page.goto(adminPage.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('body').textContent() || '';
      const pageTitle = await page.title();

      console.log(`\n=== Testing ${adminPage.name} (${adminPage.path}) ===`);
      console.log(`Page title: "${pageTitle}"`);
      console.log(`Body text length: ${bodyText.length} characters`);

      // Should not be on login page
      expect(page.url()).not.toContain('/admin/login');
      
      // Should not show login form
      const hasLoginForm = bodyText.toLowerCase().includes('sign in') || 
                          bodyText.toLowerCase().includes('login');
      expect(hasLoginForm).toBe(false);

      // Should show admin content
      expect(bodyText.length).toBeGreaterThan(100);

      // Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(1000);

      if (consoleErrors.length > 0) {
        console.log(`Console errors on ${adminPage.path}:`, consoleErrors);
      }
    });
  }

  // Test driver pages with authentication
  for (const driverPage of driverPages) {
    test(`${driverPage.name} loads with authentication`, async ({ page }) => {
      await page.goto(driverPage.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('body').textContent() || '';
      const pageTitle = await page.title();

      console.log(`\n=== Testing ${driverPage.name} (${driverPage.path}) ===`);
      console.log(`Page title: "${pageTitle}"`);
      console.log(`Body text length: ${bodyText.length} characters`);

      // Should not be on login page
      expect(page.url()).not.toContain('/admin/login');
      
      // Should show driver content
      expect(bodyText.length).toBeGreaterThan(100);

      // Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(1000);

      if (consoleErrors.length > 0) {
        console.log(`Console errors on ${driverPage.path}:`, consoleErrors);
      }
    });
  }

  // Test Firebase data loading with authentication
  test('Admin dashboard loads with Firebase data when authenticated', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').textContent() || '';

    console.log('Admin dashboard test with auth:');
    console.log(`- Body text length: ${bodyText.length}`);
    console.log(`- Contains "Dashboard": ${bodyText.toLowerCase().includes('dashboard')}`);
    console.log(`- Contains "Bookings": ${bodyText.toLowerCase().includes('bookings')}`);
    console.log(`- Contains "Drivers": ${bodyText.toLowerCase().includes('drivers')}`);
    console.log(`- Contains "Payments": ${bodyText.toLowerCase().includes('payments')}`);

    // Should show dashboard content
    expect(bodyText.toLowerCase()).toContain('dashboard');
    
    // Should not show loading state
    const hasLoadingState = bodyText.toLowerCase().includes('loading dashboard data');
    expect(hasLoadingState).toBe(false);
  });

  test('Admin bookings page loads with Firebase data when authenticated', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').textContent() || '';

    console.log('Admin bookings test with auth:');
    console.log(`- Body text length: ${bodyText.length}`);
    console.log(`- Contains "Bookings": ${bodyText.toLowerCase().includes('bookings')}`);
    console.log(`- Contains "Customer": ${bodyText.toLowerCase().includes('customer')}`);
    console.log(`- Contains "Route": ${bodyText.toLowerCase().includes('route')}`);

    // Should show bookings content
    expect(bodyText.toLowerCase()).toContain('bookings');
    
    // Should not show loading state
    const hasLoadingState = bodyText.toLowerCase().includes('loading bookings') || 
                           bodyText.toLowerCase().includes('fetching bookings');
    expect(hasLoadingState).toBe(false);
  });
});

// Helper function to sign in user
async function signInUser(page: any) {
  try {
    // Navigate to login page
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');

    // Wait for login form to load
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for redirect or success
    await page.waitForTimeout(3000);

    // Check if we're on admin dashboard or still on login page
    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      console.log('⚠️ Still on login page - checking for errors');
      const errorText = await page.locator('body').textContent();
      console.log('Login page content:', errorText?.substring(0, 200));
      
      // If still on login page, try to create the user first
      await createTestUserIfNeeded(page);
    } else {
      console.log('✅ Successfully signed in and redirected');
    }
  } catch (error) {
    console.error('❌ Error signing in:', error);
    throw error;
  }
}

// Helper function to create test user if needed
async function createTestUserIfNeeded(page: any) {
  try {
    console.log('🔧 Attempting to create test user...');
    
    // Navigate to the setup page
    await page.goto('/admin/setup');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if setup button exists
    const setupButton = await page.locator('button:has-text("Setup Admin User")').count();
    
    if (setupButton > 0) {
      console.log('📝 Found setup button, clicking to create test user...');
      await page.click('button:has-text("Setup Admin User")');
      await page.waitForTimeout(2000);
      
      // Check for success message
      const successMessage = await page.locator('text=Admin user created successfully').count();
      if (successMessage > 0) {
        console.log('✅ Test user created successfully');
        
        // Now try to sign in again
        await signInUser(page);
      } else {
        console.log('⚠️ Setup may have failed, continuing with tests...');
      }
    } else {
      console.log('⚠️ No setup button found, continuing with tests...');
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    // Continue with tests even if user creation fails
  }
} 