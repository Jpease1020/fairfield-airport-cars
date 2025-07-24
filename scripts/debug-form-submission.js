const puppeteer = require('puppeteer');

async function debugFormSubmission() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging form submission...');
    
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.log('Browser error:', error.message));
    
    // Navigate to booking page
    await page.goto('http://localhost:3000/book');
    console.log('✅ Loaded booking page');
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Form loaded');
    
    // Fill out the form
    await page.type('#name', 'Test User');
    await page.type('#email', 'test@example.com');
    await page.type('#phone', '555-123-4567');
    await page.type('#pickupLocation', 'Fairfield, CT');
    await page.type('#dropoffLocation', 'JFK Airport');
    
    // Set pickup date/time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    // Format as YYYY-MM-DDTHH:MM
    const dateString = tomorrow.toISOString().slice(0, 16);
    console.log('Setting pickup date/time to:', dateString);
    
    // Try multiple approaches to set the date/time
    await page.evaluate((dateString) => {
      const input = document.querySelector('#pickupDateTime');
      if (input) {
        // Method 1: Direct value assignment
        input.value = dateString;
        
        // Method 2: Focus and type
        input.focus();
        input.click();
        
        // Method 3: Clear and set
        input.value = '';
        input.value = dateString;
        
        // Trigger events
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        
        console.log('Date/time input value after setting:', input.value);
      }
    }, dateString);
    
    console.log('✅ Form filled out');
    
    // Listen for network requests
    page.on('request', request => {
      console.log('Request:', request.method(), request.url());
    });
    
    page.on('response', response => {
      console.log('Response:', response.status(), response.url());
    });
    
    // Calculate fare first
    console.log('🔍 Calculating fare...');
    
    // Find all buttons and check their text
    const buttons = await page.$$('button');
    console.log('Found buttons:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(el => el.textContent);
      console.log(`Button ${i + 1}: "${text}"`);
    }
    
    // Click the Calculate Fare button (button 2)
    if (buttons.length >= 2) {
      await buttons[1].click();
      console.log('✅ Calculate Fare button clicked');
      
      // Wait for fare calculation to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('⚠️ Calculate Fare button not found');
    }
    
    // Check if Book Now button is now enabled
    const bookNowButton = await page.$('button[type="submit"]');
    const isEnabled = await bookNowButton.evaluate(button => !button.disabled);
    console.log('Book Now button enabled:', isEnabled);
    
    if (!isEnabled) {
      console.log('⚠️ Book Now button is still disabled');
      const buttonText = await bookNowButton.evaluate(button => button.textContent);
      console.log('Button text:', buttonText);
    } else {
      // Submit the form
      console.log('🔍 Submitting form...');
      await page.click('button[type="submit"]');
      console.log('✅ Form submitted');
    }
    
    // Wait and check for any errors or redirects
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check for any error messages
    const errorElements = await page.$$('[class*="error"], [class*="Error"]');
    if (errorElements.length > 0) {
      console.log('❌ Found error elements:', errorElements.length);
      for (let i = 0; i < errorElements.length; i++) {
        const text = await errorElements[i].evaluate(el => el.textContent);
        const tagName = await errorElements[i].evaluate(el => el.tagName);
        const className = await errorElements[i].evaluate(el => el.className);
        console.log(`Error ${i + 1}:`, { text, tagName, className });
      }
    }
    
    // Check form field values
    const formFields = await page.$$('input, select, textarea');
    console.log('Form fields found:', formFields.length);
    for (let i = 0; i < formFields.length; i++) {
      const field = formFields[i];
      const tagName = await field.evaluate(el => el.tagName);
      const id = await field.evaluate(el => el.id);
      const value = await field.evaluate(el => el.value);
      const required = await field.evaluate(el => el.required);
      console.log(`Field ${i + 1}:`, { tagName, id, value, required });
    }
    
    // Check for success messages
    const successElements = await page.$$('[class*="success"], [class*="Success"]');
    if (successElements.length > 0) {
      console.log('✅ Found success elements:', successElements.length);
      for (let i = 0; i < successElements.length; i++) {
        const text = await successElements[i].evaluate(el => el.textContent);
        console.log(`Success ${i + 1}:`, text);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    // Keep browser open for 10 seconds to see results
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

debugFormSubmission(); 