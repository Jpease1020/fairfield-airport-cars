import { chromium } from 'playwright';
import dotenv from 'dotenv';

const config = dotenv.config({ path: '.env.local' });

async function testLoginPage() {
  console.log('🔍 Testing login page...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Login page loaded');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/login-page-test.png' });
    
    // Check if login form is visible
    const loginForm = page.locator('#login-form');
    if (await loginForm.isVisible()) {
      console.log('✅ Login form is visible');
    } else {
      console.log('❌ Login form not visible');
    }
    
    // Check for any error messages
    const errorMessages = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      console.log(`⚠️ Found ${errorCount} error elements`);
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorMessages.nth(i).textContent();
        console.log(`  Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Check if email input is visible
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      console.log('✅ Email input is visible');
    } else {
      console.log('❌ Email input not visible');
    }
    
    // Check if password input is visible
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      console.log('✅ Password input is visible');
    } else {
      console.log('❌ Password input not visible');
    }
    
    // Check if sign in button is visible
    const signInButton = page.locator('button[type="submit"]');
    if (await signInButton.isVisible()) {
      console.log('✅ Sign in button is visible');
    } else {
      console.log('❌ Sign in button not visible');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginPage().catch(console.error);
