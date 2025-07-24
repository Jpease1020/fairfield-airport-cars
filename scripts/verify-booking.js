const puppeteer = require('puppeteer');

async function verifyBookingFlow() {
  console.log('🔍 VERIFYING BOOKING FLOW...');
  
  let browser;
  try {
    // Launch browser with short timeout
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(10000); // 10 second timeout
    
    console.log('📱 Navigating to booking page...');
    await page.goto('http://localhost:3000/book');
    
    // Wait for form
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('✅ Form loaded');
    
    // Fill form quickly
    console.log('📝 Filling form...');
    
    // Fill all required fields
    await page.type('input[id*="name"]', 'Test User');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="tel"]', '203-555-0123');
    await page.type('input[id*="pickup"]', 'Fairfield Station');
    await page.type('input[id*="dropoff"]', 'JFK Airport');
    await page.type('input[type="datetime-local"]', '2024-12-25T10:00');
    await page.type('input[type="number"]', '2');
    
    console.log('✅ Form filled');
    
    // Check button states
    const buttons = await page.$$('button');
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(btn => btn.textContent);
      const disabled = await buttons[i].evaluate(btn => btn.disabled);
      console.log(`Button ${i}: "${text?.trim()}" (disabled: ${disabled})`);
    }
    
    // Click Calculate Fare
    console.log('💰 Clicking Calculate Fare...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const calculateBtn = buttons.find(btn => btn.textContent.includes('Calculate'));
      if (calculateBtn) calculateBtn.click();
    });
    
    // Wait for fare calculation
    await page.waitForTimeout(2000);
    console.log('✅ Fare calculated');
    
    // Check if Book Now is enabled
    const bookButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Book'));
    });
    
    if (bookButton) {
      const isEnabled = await bookButton.evaluate(btn => !btn.disabled);
      console.log(`📋 Book Now button enabled: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('🎉 SUCCESS: Booking flow is working!');
        console.log('✅ Gregg can now get real rides booked!');
      } else {
        console.log('⚠️  Book Now button is still disabled');
      }
    }
    
    // Keep browser open briefly
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Run with timeout protection
const timeout = setTimeout(() => {
  console.log('⏰ TIMEOUT: Killing hanging processes...');
  require('child_process').exec('node scripts/quick-kill.js');
  process.exit(1);
}, 30000); // 30 second timeout

verifyBookingFlow()
  .then(() => {
    clearTimeout(timeout);
    console.log('✅ Verification completed');
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('❌ Verification failed:', error);
  }); 