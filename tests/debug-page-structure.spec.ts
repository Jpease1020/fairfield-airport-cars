import { test, expect } from '@playwright/test';

test('Debug page structure', async ({ page }) => {
  await page.goto('/book');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-page.png' });
  
  // Log all form elements
  const inputs = await page.locator('input').all();
  console.log('Found inputs:', inputs.length);
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    
    console.log(`Input ${i}: id="${id}", name="${name}", type="${type}", placeholder="${placeholder}"`);
  }
  
  // Check for buttons
  const buttons = await page.locator('button').all();
  console.log('Found buttons:', buttons.length);
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    
    console.log(`Button ${i}: type="${type}", text="${text?.trim()}"`);
  }
}); 