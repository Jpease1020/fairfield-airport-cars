import { test, expect } from '@playwright/test';

test('Simple booking form test', async ({ page }) => {
  console.log('🔧 Starting simple booking test...');
  
  // Navigate to booking page
  await page.goto('/book');
  console.log('✅ Navigated to /book');
  
  // Wait for page to be visible (not network idle)
  await page.waitForSelector('form', { timeout: 10000 });
  console.log('✅ Form found');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'simple-test-screenshot.png' });
  console.log('✅ Screenshot taken');
  
  // Check if we can find any input fields
  const inputs = await page.locator('input').count();
  console.log(`Found ${inputs} input fields`);
  
  // Check if we can find any buttons
  const buttons = await page.locator('button').count();
  console.log(`Found ${buttons} buttons`);
  
  // Try to find specific elements by text content
  const calculateButton = page.locator('button:has-text("Calculate")');
  const calculateCount = await calculateButton.count();
  console.log(`Found ${calculateCount} Calculate buttons`);
  
  // Check for form labels
  const labels = await page.locator('label').allTextContents();
  console.log('Labels found:', labels);
  
  // Try to fill a field if we can find it
  try {
    // Look for any input with a name attribute
    const nameInput = page.locator('input[name]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
      console.log('✅ Filled first input field');
    } else {
      console.log('❌ No input fields with name attribute found');
    }
  } catch (error) {
    console.log('❌ Error filling input:', error instanceof Error ? error.message : String(error));
  }
  
  console.log('✅ Simple test completed');
}); 