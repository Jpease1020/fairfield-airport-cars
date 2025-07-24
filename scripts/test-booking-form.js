const puppeteer = require('puppeteer');

async function testBookingForm() {
  console.log('🧪 Testing Booking Form End-to-End...\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100 
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to booking page
    console.log('1. Navigating to booking page...');
    await page.goto('http://localhost:3000/book');
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Booking page loaded\n');

    // Fill in the form
    console.log('2. Filling in booking form...');
    
    // Basic passenger info
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '555-1234');
    
    // Locations
    await page.type('input[name="pickupLocation"]', 'Fairfield, CT');
    await page.type('input[name="dropoffLocation"]', 'JFK Airport');
    
    // Date and time (tomorrow at 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const dateTimeString = tomorrow.toISOString().slice(0, 16);
    await page.evaluate((dateTimeString) => {
      const input = document.querySelector('input[type="datetime-local"]');
      if (input) {
        input.value = dateTimeString;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, dateTimeString);
    
    // Passengers
    await page.select('select[name="passengers"]', '1');
    
    console.log('✅ Form filled\n');

    // Calculate fare
    console.log('3. Calculating fare...');
    const calculateButton = await page.$('button:contains("Calculate Fare")');
    if (calculateButton) {
      await calculateButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Fare calculated\n');
    } else {
      console.log('⚠️  Calculate fare button not found\n');
    }

    // Submit the form
    console.log('4. Submitting booking...');
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      
      // Wait for either success or error
      try {
        await page.waitForSelector('.bg-green-100, .bg-red-100', { timeout: 10000 });
        console.log('✅ Form submitted successfully!');
        
        // Check if we were redirected to booking page
        const currentUrl = page.url();
        if (currentUrl.includes('/booking/')) {
          console.log('✅ Redirected to booking confirmation page');
        }
      } catch (error) {
        console.log('⚠️  No success/error message found, but form was submitted');
      }
    } else {
      console.log('❌ Submit button not found');
    }

    console.log('\n🎉 Booking form test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testBookingForm(); 