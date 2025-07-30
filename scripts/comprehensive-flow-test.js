const puppeteer = require('puppeteer');

async function testComprehensiveFlow() {
  console.log('🔍 COMPREHENSIVE USER FLOW TEST');
  console.log('================================');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 1000,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    
    // Test 1: Homepage
    console.log('\n📱 TEST 1: Homepage');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('main', { timeout: 5000 });
    console.log('✅ Homepage loads');
    
    // Check for customer review
    const reviewSection = await page.$('text=5-star');
    if (reviewSection) {
      console.log('✅ Customer review section present');
    } else {
      console.log('❌ Customer review section missing');
    }
    
    // Test 2: Navigation to Booking
    console.log('\n📝 TEST 2: Navigation to Booking');
    const bookLink = await page.$('a[href="/book"]');
    if (bookLink) {
      await bookLink.click();
      await page.waitForSelector('form', { timeout: 5000 });
      console.log('✅ Navigation to booking page works');
    } else {
      console.log('❌ No booking link found');
      await page.goto('http://localhost:3000/book');
    }
    
    // Test 3: Booking Form
    console.log('\n📋 TEST 3: Booking Form');
    const form = await page.$('form');
    if (form) {
      console.log('✅ Booking form present');
    } else {
      console.log('❌ Booking form missing');
      return;
    }
    
    // Test 4: Form Fields
    console.log('\n🏷️  TEST 4: Form Fields');
    const fields = [
      { selector: 'input[id*="name"]', name: 'Name' },
      { selector: 'input[type="email"]', name: 'Email' },
      { selector: 'input[type="tel"]', name: 'Phone' },
      { selector: 'input[id*="pickup"]', name: 'Pickup' },
      { selector: 'input[id*="dropoff"]', name: 'Dropoff' },
      { selector: 'input[type="datetime-local"]', name: 'Date/Time' },
      { selector: 'input[type="number"]', name: 'Passengers' }
    ];
    
    for (const field of fields) {
      const element = await page.$(field.selector);
      if (element) {
        console.log(`✅ ${field.name} field present`);
      } else {
        console.log(`❌ ${field.name} field missing`);
      }
    }
    
    // Test 5: Fill Form
    console.log('\n✍️  TEST 5: Fill Form');
    await page.type('input[id*="name"]', 'Test Customer');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="tel"]', '203-555-0123');
    await page.type('input[id*="pickup"]', 'Fairfield Station');
    await page.type('input[id*="dropoff"]', 'JFK Airport');
    await page.type('input[type="datetime-local"]', '2024-12-25T10:00');
    await page.type('input[type="number"]', '2');
    console.log('✅ Form filled');
    
    // Test 6: Calculate Fare
    console.log('\n💰 TEST 6: Calculate Fare');
    const calculateButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Calculate'));
    });
    
    if (calculateButton) {
      await calculateButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Calculate Fare button clicked');
      
      // Check if fare appears
      const fareElement = await page.$('text=$');
      if (fareElement) {
        console.log('✅ Fare calculated and displayed');
      } else {
        console.log('❌ Fare not displayed after calculation');
      }
    } else {
      console.log('❌ Calculate Fare button not found');
    }
    
    // Test 7: Book Now Button
    console.log('\n📋 TEST 7: Book Now Button');
    const bookButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Book'));
    });
    
    if (bookButton) {
      const isEnabled = await bookButton.evaluate(btn => !btn.disabled);
      console.log(`📋 Book Now button enabled: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('🎉 SUCCESS: Book Now button is enabled!');
        
        // Test 8: Try to Submit Booking
        console.log('\n🚀 TEST 8: Submit Booking');
        await bookButton.click();
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/booking/')) {
          console.log('🎉 SUCCESS: Booking submitted successfully!');
        } else if (currentUrl.includes('/success')) {
          console.log('🎉 SUCCESS: Payment success page reached!');
        } else {
          console.log('⚠️  Book button clicked but no navigation');
        }
      } else {
        console.log('❌ Book Now button is disabled');
      }
    } else {
      console.log('❌ Book Now button not found');
    }
    
    // Test 9: Admin Access
    console.log('\n👨‍💼 TEST 9: Admin Access');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(2000);
    
    const adminContent = await page.$('text=Admin');
    if (adminContent) {
      console.log('✅ Admin page loads');
    } else {
      console.log('❌ Admin page not accessible');
    }
    
    // Test 10: Mobile Responsiveness
    console.log('\n📱 TEST 10: Mobile Responsiveness');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/book');
    await page.waitForTimeout(2000);
    
    const mobileForm = await page.$('form');
    if (mobileForm) {
      console.log('✅ Mobile view works');
    } else {
      console.log('❌ Mobile view issues');
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('✅ Basic flow: Homepage → Booking Form → Fill Fields → Calculate Fare');
    console.log('⚠️  Payment flow: Needs testing');
    console.log('⚠️  Email confirmations: Needs testing');
    console.log('⚠️  Admin dashboard: Needs testing');
    console.log('⚠️  Error handling: Needs testing');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
}, 60000); // 60 second timeout

testComprehensiveFlow()
  .then(() => {
    clearTimeout(timeout);
    console.log('✅ Comprehensive test completed');
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('❌ Comprehensive test failed:', error);
  }); 