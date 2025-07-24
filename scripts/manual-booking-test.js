const puppeteer = require('puppeteer');

async function testBookingFlow() {
  console.log('🚀 Starting manual booking flow test...');
  
  let browser;
  try {
    // Launch browser with visible window
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable timeout
    page.setDefaultTimeout(15000);
    
    console.log('🔧 Navigating to booking page...');
    await page.goto('http://localhost:3000/book');
    
    // Wait for page to load
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Form found');
    
    // Take a screenshot
    await page.screenshot({ path: 'manual-test-screenshot.png' });
    console.log('✅ Screenshot taken');
    
    // Check what elements are available
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input fields`);
    
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    // Log all button texts
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(btn => btn.textContent);
      console.log(`Button ${i}: "${text?.trim()}"`);
    }
    
    // Try to fill the form step by step
    console.log('🔧 Attempting to fill form...');
    
    // Look for name field
    const nameInput = await page.$('input[id*="name"], input[name*="name"]');
    if (nameInput) {
      await nameInput.type('Test Customer');
      console.log('✅ Filled name field');
    } else {
      console.log('❌ Could not find name field');
    }
    
    // Look for email field
    const emailInput = await page.$('input[type="email"], input[id*="email"], input[name*="email"]');
    if (emailInput) {
      await emailInput.type('test@example.com');
      console.log('✅ Filled email field');
    } else {
      console.log('❌ Could not find email field');
    }
    
    // Look for phone field
    const phoneInput = await page.$('input[type="tel"], input[id*="phone"], input[name*="phone"]');
    if (phoneInput) {
      await phoneInput.type('203-555-0123');
      console.log('✅ Filled phone field');
    } else {
      console.log('❌ Could not find phone field');
    }
    
    // Look for pickup location
    const pickupInput = await page.$('input[id*="pickup"], input[name*="pickup"]');
    if (pickupInput) {
      await pickupInput.type('Fairfield Station');
      console.log('✅ Filled pickup location');
    } else {
      console.log('❌ Could not find pickup location field');
    }
    
    // Look for dropoff location
    const dropoffInput = await page.$('input[id*="dropoff"], input[name*="dropoff"]');
    if (dropoffInput) {
      await dropoffInput.type('JFK Airport');
      console.log('✅ Filled dropoff location');
    } else {
      console.log('❌ Could not find dropoff location field');
    }
    
    // Look for date/time field
    const dateInput = await page.$('input[type="datetime-local"], input[id*="date"], input[name*="date"]');
    if (dateInput) {
      await dateInput.type('2024-12-25T10:00');
      console.log('✅ Filled date/time field');
    } else {
      console.log('❌ Could not find date/time field');
    }
    
    // Look for passengers field
    const passengersInput = await page.$('input[type="number"], input[id*="passenger"], input[name*="passenger"]');
    if (passengersInput) {
      await passengersInput.type('2');
      console.log('✅ Filled passengers field');
    } else {
      console.log('❌ Could not find passengers field');
    }
    
    // Look for Calculate Fare button - find by text content
    const calculateButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Calculate'));
    });
    
    if (calculateButton) {
      console.log('🔧 Clicking Calculate Fare button...');
      await calculateButton.click();
      
      // Wait a moment for fare calculation
      await page.waitForTimeout(2000);
      console.log('✅ Clicked Calculate Fare button');
    } else {
      console.log('❌ Could not find Calculate Fare button');
    }
    
    // Look for Book Now button - find by text content
    const bookButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Book'));
    });
    
    if (bookButton) {
      const isEnabled = await bookButton.evaluate(btn => !btn.disabled);
      console.log(`Book button enabled: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('🔧 Clicking Book Now button...');
        await bookButton.click();
        
        // Wait for navigation
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`✅ Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/booking/')) {
          console.log('🎉 SUCCESS: Booking flow completed!');
        } else {
          console.log('⚠️  Book button clicked but no navigation to booking page');
        }
      } else {
        console.log('❌ Book button is disabled');
      }
    } else {
      console.log('❌ Could not find Book Now button');
    }
    
    // Keep browser open for 10 seconds to see results
    console.log('⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Run the test
console.log('🚀 Starting manual booking test...');
testBookingFlow().catch(console.error); 