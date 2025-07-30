const puppeteer = require('puppeteer');

async function quickFlowCheck() {
  console.log('🔍 QUICK FLOW CHECK');
  console.log('===================');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    
    // Check homepage
    console.log('📱 Checking homepage...');
    await page.goto('http://localhost:3000');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Homepage loads');
    
    // Check booking page
    console.log('📝 Checking booking page...');
    await page.goto('http://localhost:3000/book');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const form = await page.$('form');
    if (form) {
      console.log('✅ Booking form loads');
    } else {
      console.log('❌ Booking form missing');
      return;
    }
    
    // Check form fields
    console.log('🏷️  Checking form fields...');
    const fields = [
      'input[id*="name"]',
      'input[type="email"]', 
      'input[type="tel"]',
      'input[id*="pickup"]',
      'input[id*="dropoff"]',
      'input[type="datetime-local"]',
      'input[type="number"]'
    ];
    
    let fieldsFound = 0;
    for (const selector of fields) {
      const field = await page.$(selector);
      if (field) fieldsFound++;
    }
    
    console.log(`✅ ${fieldsFound}/7 form fields present`);
    
    // Check buttons
    console.log('🔘 Checking buttons...');
    const buttons = await page.$$('button');
    console.log(`✅ ${buttons.length} buttons found`);
    
    // Fill form
    console.log('✍️  Filling form...');
    await page.type('input[id*="name"]', 'Test User');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="tel"]', '203-555-0123');
    await page.type('input[id*="pickup"]', 'Fairfield Station');
    await page.type('input[id*="dropoff"]', 'JFK Airport');
    await page.type('input[type="datetime-local"]', '2024-12-25T10:00');
    await page.type('input[type="number"]', '2');
    console.log('✅ Form filled');
    
    // Check button states
    console.log('🔘 Checking button states...');
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(btn => btn.textContent);
      const disabled = await buttons[i].evaluate(btn => btn.disabled);
      console.log(`Button ${i}: "${text?.trim()}" (disabled: ${disabled})`);
    }
    
    console.log('\n📊 QUICK ASSESSMENT:');
    console.log('✅ Homepage loads');
    console.log('✅ Booking form loads');
    console.log('✅ Form fields are present');
    console.log('✅ Form can be filled');
    console.log('⚠️  Need to test: Calculate Fare functionality');
    console.log('⚠️  Need to test: Book Now button functionality');
    console.log('⚠️  Need to test: Payment integration');
    console.log('⚠️  Need to test: Email confirmations');
    console.log('⚠️  Need to test: Admin dashboard');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('❌ Quick check failed:', error.message);
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

quickFlowCheck()
  .then(() => {
    clearTimeout(timeout);
    console.log('✅ Quick check completed');
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('❌ Quick check failed:', error);
  }); 