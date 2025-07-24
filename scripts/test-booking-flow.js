const puppeteer = require('puppeteer');

async function testBookingFlow() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Testing booking flow...');
    
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
    
    await page.evaluate((dateString) => {
      const input = document.querySelector('#pickupDateTime');
      if (input) {
        input.value = dateString;
      }
    }, tomorrow.toISOString().slice(0, 16));
    
    console.log('✅ Form filled out');
    
    // Submit the form
    await page.click('button[type="submit"]');
    console.log('✅ Form submitted');
    
    // Wait for success or error
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if we're redirected to a booking page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/booking/')) {
      console.log('✅ Booking created successfully!');
    } else {
      console.log('❌ Booking creation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testBookingFlow(); 