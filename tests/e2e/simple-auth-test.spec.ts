import { test, expect } from '@playwright/test';

// Test user credentials
const TEST_USER_EMAIL = 'test@fairfieldairportcar.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('Simple Authentication Test', () => {
  test('Create test user and verify admin pages load', async ({ page }) => {
    // Step 1: Create test user via setup page
    console.log('🔧 Step 1: Creating test user...');
    await page.goto('/admin/setup');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if we need to sign in first
    const bodyText = await page.locator('body').textContent() || '';
    if (bodyText.toLowerCase().includes('login')) {
      console.log('📝 Need to sign in first...');
      await page.goto('/admin/login');
      await page.waitForLoadState('domcontentloaded');
      
      // Fill in credentials (using a real admin account)
      await page.fill('input[type="email"]', 'justin@fairfieldairportcar.com');
      await page.fill('input[type="password"]', 'your-admin-password');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Go back to setup page
      await page.goto('/admin/setup');
      await page.waitForLoadState('domcontentloaded');
    }
    
    // Look for setup button
    const setupButton = await page.locator('button:has-text("Setup Admin User")').count();
    if (setupButton > 0) {
      console.log('📝 Found setup button, creating test user...');
      await page.click('button:has-text("Setup Admin User")');
      await page.waitForTimeout(2000);
      
      const successMessage = await page.locator('text=Admin user created successfully').count();
      if (successMessage > 0) {
        console.log('✅ Test user created successfully');
      } else {
        console.log('⚠️ Setup may have failed, but continuing...');
      }
    } else {
      console.log('⚠️ No setup button found, continuing...');
    }
    
    // Step 2: Sign in with test user
    console.log('🔐 Step 2: Signing in with test user...');
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
    
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Step 3: Test admin dashboard
    console.log('📊 Step 3: Testing admin dashboard...');
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const dashboardText = await page.locator('body').textContent() || '';
    console.log(`Dashboard content length: ${dashboardText.length}`);
    console.log(`Contains "Dashboard": ${dashboardText.toLowerCase().includes('dashboard')}`);
    console.log(`Contains "Bookings": ${dashboardText.toLowerCase().includes('bookings')}`);
    
    // Should show dashboard content
    expect(dashboardText.toLowerCase()).toContain('dashboard');
    
    // Step 4: Test admin bookings page
    console.log('📋 Step 4: Testing admin bookings page...');
    await page.goto('/admin/bookings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const bookingsText = await page.locator('body').textContent() || '';
    console.log(`Bookings content length: ${bookingsText.length}`);
    console.log(`Contains "Bookings": ${bookingsText.toLowerCase().includes('bookings')}`);
    console.log(`Contains "Customer": ${bookingsText.toLowerCase().includes('customer')}`);
    
    // Should show bookings content
    expect(bookingsText.toLowerCase()).toContain('bookings');
    
    // Step 5: Test admin drivers page
    console.log('👨‍💼 Step 5: Testing admin drivers page...');
    await page.goto('/admin/drivers');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const driversText = await page.locator('body').textContent() || '';
    console.log(`Drivers content length: ${driversText.length}`);
    console.log(`Contains "Drivers": ${driversText.toLowerCase().includes('drivers')}`);
    
    // Should show drivers content
    expect(driversText.toLowerCase()).toContain('drivers');
    
    console.log('✅ All admin pages loaded successfully with authentication!');
  });
}); 