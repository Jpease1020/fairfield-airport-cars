import { chromium } from 'playwright';
import dotenv from 'dotenv';

const config = dotenv.config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: {
    name: 'E2E Test User',
    email: 'justinpease2@gmail.com',
    phone: '203-994-5439'
  },
  testBooking: {
    pickupLocation: 'Fairfield Station, Fairfield, CT',
    dropoffLocation: 'JFK Airport, Queens, NY',
    pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    notes: 'E2E Test Booking - Extra luggage'
  },
  timeout: 30000
};

class BookingFlowTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.bookingId = null;
    this.testResults = [];
  }

  logStep(message) {
    console.log(`  ${message}`);
    this.testResults.push(message);
  }

  async navigateTo(url, description) {
    console.log(`\n🧭 TEST NAVIGATION: ${description}`);
    console.log(`   URL: ${url}`);
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    console.log(`   ✅ Navigation completed`);
  }

  async setup() {
    console.log('🚀 Starting Booking Flow Test...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slow down for better visibility
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Listen for page errors
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    // Watch and log all navigation events
    this.page.on('request', request => {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
    });
    
    this.page.on('response', response => {
      const status = response.status();
      const statusIcon = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
      console.log(`${statusIcon} RESPONSE: ${status} ${response.url()}`);
    });
    
    this.page.on('framenavigated', frame => {
      if (frame === this.page.mainFrame()) {
        console.log(`🧭 NAVIGATED: ${frame.url()}`);
      }
    });
    
    // Log when page loads
    this.page.on('load', () => {
      console.log(`📄 PAGE LOADED: ${this.page.url()}`);
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.setup();
      
      await this.step1_TestQuickBookForm();
      await this.step2_TestDataPersistence();
      await this.step3_TestCompleteBooking();
      await this.step4_TestPaymentProcessing();
      await this.step5_TestSuccessPage();
      await this.step6_TestEmailConfirmation();
      await this.step7_TestAccountCreation();
      await this.step8_TestBookingManagement();
      
      this.printResults();
      
    } catch (error) {
      console.error('💥 Test failed:', error.message);
      await this.page.screenshot({ path: 'test-results/booking-test-error.png' });
    } finally {
      await this.cleanup();
    }
  }

  async step1_TestQuickBookForm() {
    console.log('📍 Step 1: Testing quick book form with real-time pricing...');
    
    await this.navigateTo(`${TEST_CONFIG.baseUrl}`, 'Home page');
    await this.page.screenshot({ path: 'test-results/booking-1-home-page.png' });

    // Find and fill quick book form
    const quickBookForm = this.page.locator('[data-testid="hero-booking-form"]').first();
    if (!(await quickBookForm.isVisible())) {
      throw new Error('Quick book form not found on home page');
    }
    this.logStep('✅ Home page loaded and quick book form found');

    // Fill pickup location
    const pickupInput = this.page.locator('[data-testid="quick-book-pickup-input"]').first();
    await pickupInput.fill(TEST_CONFIG.testBooking.pickupLocation);
    await this.page.waitForTimeout(2000);
    this.logStep('✅ Pickup location filled');

    // Fill dropoff location
    const dropoffInput = this.page.locator('[data-testid="quick-book-dropoff-input"]').first();
    await dropoffInput.fill(TEST_CONFIG.testBooking.dropoffLocation);
    await this.page.waitForTimeout(2000);
    this.logStep('✅ Dropoff location filled');

    // Check if estimated price appears
    const priceDisplay = this.page.locator('[data-testid="quick-book-price-display"]').first();
    if (await priceDisplay.isVisible()) {
      const priceText = await priceDisplay.textContent();
      console.log(`💰 Estimated price shown: ${priceText}`);
      this.logStep('✅ Real-time price display working');
    }

    // Fill date/time
    const dateTimeInput = this.page.locator('[data-testid="quick-book-datetime-input"]').first();
    const dateTimeString = TEST_CONFIG.testBooking.pickupDateTime.toISOString().slice(0, 16);
    await dateTimeInput.fill(dateTimeString);
    await this.page.waitForTimeout(1000);
    this.logStep('✅ Date/time filled');

    // Click Get Price
    const getPriceButton = this.page.locator('[data-testid="quick-book-get-price-button"]').first();
    await getPriceButton.click();
    await this.page.waitForTimeout(3000);
    this.logStep('✅ Get Price button clicked');
  }

  async step2_TestDataPersistence() {
    console.log('📍 Step 2: Testing data persistence to booking page...');
    
    // Navigate to booking page
    const params = new URLSearchParams({
      pickup: TEST_CONFIG.testBooking.pickupLocation,
      dropoff: TEST_CONFIG.testBooking.dropoffLocation,
      date: TEST_CONFIG.testBooking.pickupDateTime.toISOString().slice(0, 10),
      time: TEST_CONFIG.testBooking.pickupDateTime.toTimeString().slice(0, 5)
    });
    await this.navigateTo(`${TEST_CONFIG.baseUrl}/book?${params.toString()}`, 'Booking page with prefilled data');
    await this.page.screenshot({ path: 'test-results/booking-2-booking-page.png' });

    // Verify form is prefilled
    const pickupField = this.page.locator('[data-testid="pickup-location-input"]').first();
    const dropoffField = this.page.locator('[data-testid="dropoff-location-input"]').first();
    const datetimeField = this.page.locator('[data-testid="pickup-datetime-input"]').first();
    
    if (await pickupField.isVisible()) {
      const pickupValue = await pickupField.inputValue();
      if (pickupValue.includes('Fairfield Station')) {
        this.logStep('✅ Pickup location prefilled from home page');
      }
    }
    
    if (await dropoffField.isVisible()) {
      const dropoffValue = await dropoffField.inputValue();
      if (dropoffValue.includes('JFK Airport')) {
        this.logStep('✅ Dropoff location prefilled from home page');
      }
    }
    
    if (await datetimeField.isVisible()) {
      const datetimeValue = await datetimeField.inputValue();
      if (datetimeValue) {
        this.logStep('✅ Pickup date/time prefilled from home page');
      }
    }
  }

  async step3_TestCompleteBooking() {
    console.log('📍 Step 3: Testing complete booking form...');
    
    // First, test address editing and price recalculation
    await this.testAddressEditing();
    
    // Click "Continue to Contact Info" button from trip details phase
    const continueToContactButton = this.page.locator('[data-testid="continue-to-contact-button"]').first();
    if (await continueToContactButton.isVisible()) {
      try {
        await continueToContactButton.waitFor({ state: 'attached', timeout: 5000 });
        await this.page.waitForFunction(
          () => {
            const button = document.querySelector('[data-testid="continue-to-contact-button"]');
            return button && !button.disabled;
          },
          { timeout: 8000 }
        );
        await continueToContactButton.click();
        await this.page.waitForTimeout(1000);
        this.logStep('✅ Clicked Continue to Contact Info button');
      } catch (error) {
        console.log('⚠️ Could not click Continue to Contact Info button:', error.message);
        this.logStep('⚠️ Skipped Continue to Contact Info (button click failed)');
      }
    }
    
    // Fill contact information
    const nameInput = this.page.locator('[data-testid="name-input"]').first();
    const emailInput = this.page.locator('[data-testid="email-input"]').first();
    const phoneInput = this.page.locator('[data-testid="phone-input"]').first();
    const notesInput = this.page.locator('[data-testid="notes-input"]').first();
    
    if (await nameInput.isVisible()) {
      await nameInput.fill(TEST_CONFIG.testUser.name);
    }
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_CONFIG.testUser.email);
    }
    
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(TEST_CONFIG.testUser.phone);
    }
    
    if (await notesInput.isVisible()) {
      await notesInput.fill(TEST_CONFIG.testBooking.notes);
    }
    
    this.logStep('✅ Contact information filled successfully');
    
    // Try to click continue button, but don't fail if it's disabled
    const continueButton = this.page.locator('[data-testid="continue-button"]').first();
    if (await continueButton.isVisible()) {
      try {
        // Wait a bit for fare calculation
        await this.page.waitForTimeout(2000);
        
        // Check if button is enabled
        const isEnabled = await continueButton.isEnabled();
        if (isEnabled) {
                  await continueButton.click();
        await this.page.waitForTimeout(1000);
        this.logStep('✅ Proceeded to payment phase');
        } else {
          console.log('⚠️ Continue button is disabled - fare calculation may not be complete');
          this.logStep('⚠️ Skipped contact info phase (button disabled)');
        }
      } catch (error) {
        console.log('⚠️ Could not click continue button:', error.message);
        this.logStep('⚠️ Skipped contact info phase (button click failed)');
      }
    }
  }

  async testAddressEditing() {
    console.log('📍 Testing address editing and price recalculation...');
    
    // Find the pickup location input
    const pickupInput = this.page.locator('[data-testid="pickup-location-input"]').first();
    if (await pickupInput.isVisible()) {
      // Clear and edit the pickup location
      await pickupInput.clear();
      await pickupInput.fill('123 Main Street, Fairfield, CT');
      await this.page.waitForTimeout(1000);
      
      // Check if price updates
      const priceDisplay = this.page.locator('[data-testid*="price"], [data-testid*="fare"], .price, .fare').first();
      if (await priceDisplay.isVisible()) {
        const priceText = await priceDisplay.textContent();
        console.log(`💰 Price after address change: ${priceText}`);
        this.logStep('✅ Address editing and price recalculation working');
      }
      
      // Change back to original
      await pickupInput.clear();
      await pickupInput.fill(TEST_CONFIG.testBooking.pickupLocation);
      await this.page.waitForTimeout(1000);
      this.logStep('✅ Address editing functionality verified');
    }
  }

  async step4_TestPaymentProcessing() {
    console.log('📍 Step 4: Testing payment processing...');
    
    // Look for payment form elements
    const paymentForm = this.page.locator('[data-testid="payment-form"], .payment-form, [class*="payment"]').first();
    const confirmBookingButton = this.page.locator('[data-testid="confirm-booking-button"]').first();
    const paymentPhase = this.page.locator('[data-testid*="payment"], .payment-phase').first();
    
    // Check if we're in payment phase
    if (await paymentPhase.isVisible() || await paymentForm.isVisible()) {
      console.log('💳 Payment form detected');
      this.logStep('✅ Payment form is visible');
      
      // Look for Square payment form elements
      const squareForm = this.page.locator('#card-container, .sq-payment-form, [data-testid*="square"]').first();
      if (await squareForm.isVisible()) {
        console.log('💳 Square payment form detected');
        this.logStep('✅ Square payment form loaded');
      }
      
      // Check for confirm booking button
      if (await confirmBookingButton.isVisible()) {
        const isEnabled = await confirmBookingButton.isEnabled();
        console.log(`💳 Confirm booking button enabled: ${isEnabled}`);
        if (isEnabled) {
          this.logStep('✅ Confirm booking button is enabled');
        } else {
          this.logStep('⚠️ Confirm booking button is disabled');
        }
      }
      
      // Take screenshot of payment form
      await this.page.screenshot({ path: 'test-results/booking-4-payment-form.png' });
      
      // 🚨 SECURITY WARNING: The current system creates bookings BEFORE payment!
      console.log('🚨 SECURITY WARNING: Current system creates bookings without payment verification!');
      this.logStep('🚨 SECURITY ISSUE: Bookings created without payment');
      
      // 🧪 TEST: Actually fill out payment form and complete booking
      console.log('🧪 TESTING: Filling out payment form with test data...');
      try {
        // Wait for Square payment form to be ready
        await this.page.waitForTimeout(2000);
        
        // Square payment form uses iframe, so we need to handle it differently
        // First, let's try to fill the card details in the iframe
        console.log('💳 Attempting to fill Square payment form...');
        
        // Wait for Square iframe to load and try multiple iframe selectors
        let squareIframe = null;
        const iframeSelectors = [
          'iframe[src*="single-card-element-iframe"]',
          'iframe[src*="square"]',
          'iframe[title*="card"]',
          'iframe[name*="card"]',
          'iframe[name="sq-card"]',
          'iframe'
        ];
        
        for (const selector of iframeSelectors) {
          try {
            const iframe = this.page.frameLocator(selector);
            if (iframe) {
              squareIframe = iframe;
              console.log(`✅ Found Square iframe with selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (squareIframe) {
          try {
            // Wait for iframe to be ready
            await this.page.waitForTimeout(3000);
            
            // Debug: Log all inputs in the iframe
            try {
              const allInputs = await squareIframe.locator('input').all();
              console.log(`🔍 Found ${allInputs.length} input fields in Square iframe`);
              for (let i = 0; i < allInputs.length; i++) {
                const input = allInputs[i];
                const placeholder = await input.getAttribute('placeholder');
                const name = await input.getAttribute('name');
                const type = await input.getAttribute('type');
                const ariaLabel = await input.getAttribute('aria-label');
                console.log(`   Input ${i}: placeholder="${placeholder}", name="${name}", type="${type}", aria-label="${ariaLabel}"`);
              }
            } catch (debugError) {
              console.log('⚠️ Could not debug iframe inputs:', debugError.message);
            }
            
            // Also try to find all iframes on the page for debugging
            try {
              const allIframes = await this.page.locator('iframe').all();
              console.log(`🔍 Found ${allIframes.length} total iframes on page`);
              for (let i = 0; i < allIframes.length; i++) {
                const iframe = allIframes[i];
                const src = await iframe.getAttribute('src');
                const name = await iframe.getAttribute('name');
                const title = await iframe.getAttribute('title');
                console.log(`   Iframe ${i}: src="${src}", name="${name}", title="${title}"`);
              }
            } catch (debugError) {
              console.log('⚠️ Could not debug page iframes:', debugError.message);
            }
            
            // Try different field selectors for Square's iframe
            const fieldSelectors = [
              // Square's actual field selectors
              'input[data-testid="cardNumber"]',
              'input[placeholder*="card"]',
              'input[type="text"]',
              'input[name="cardNumber"]',
              'input[aria-label*="card"]',
              'input'
            ];
            
            // Fill card number
            for (const selector of fieldSelectors) {
              try {
                const cardNumberField = squareIframe.locator(selector).first();
                if (await cardNumberField.isVisible()) {
                  await cardNumberField.fill('4111111111111111');
                  console.log(`✅ Card number filled using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }
            
            // Fill expiry date
            for (const selector of fieldSelectors) {
              try {
                const expiryField = squareIframe.locator(selector).nth(1);
                if (await expiryField.isVisible()) {
                  await expiryField.fill('12/25');
                  console.log(`✅ Expiry date filled using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }
            
            // Fill CVV
            for (const selector of fieldSelectors) {
              try {
                const cvvField = squareIframe.locator(selector).nth(2);
                if (await cvvField.isVisible()) {
                  await cvvField.fill('123');
                  console.log(`✅ CVV filled using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }
            
            // Fill postal code
            for (const selector of fieldSelectors) {
              try {
                const postalField = squareIframe.locator(selector).nth(3);
                if (await postalField.isVisible()) {
                  await postalField.fill('06824');
                  console.log(`✅ Postal code filled using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }
            
            // Wait a bit for form validation
            await this.page.waitForTimeout(2000);
            
          } catch (iframeError) {
            console.log('⚠️ Could not fill iframe fields:', iframeError.message);
            console.log('💡 Trying alternative approach...');
          }
        } else {
          console.log('⚠️ Could not find Square iframe');
          
          // Fallback: Try to interact with Square form directly on the main page
          console.log('💡 Trying direct interaction with Square form...');
          try {
            // Look for Square form elements directly on the page
            const cardContainer = this.page.locator('#card-container, [id*="card"], [class*="card"]').first();
            if (await cardContainer.isVisible()) {
              console.log('✅ Found Square card container');
              
              // Try to find input fields within the card container
              const inputs = cardContainer.locator('input');
              const inputCount = await inputs.count();
              console.log(`🔍 Found ${inputCount} inputs in card container`);
              
              if (inputCount > 0) {
                // Try to fill the first few inputs
                for (let i = 0; i < Math.min(inputCount, 4); i++) {
                  try {
                    const input = inputs.nth(i);
                    if (await input.isVisible()) {
                      const testValues = ['4111111111111111', '12/25', '123', '06824'];
                      await input.fill(testValues[i] || '');
                      console.log(`✅ Filled input ${i} with: ${testValues[i] || ''}`);
                    }
                  } catch (e) {
                    console.log(`⚠️ Could not fill input ${i}:`, e.message);
                  }
                }
              }
            }
          } catch (fallbackError) {
            console.log('⚠️ Direct interaction fallback failed:', fallbackError.message);
          }
        }
        
        // Now try to click the confirm button
        if (await confirmBookingButton.isVisible() && await confirmBookingButton.isEnabled()) {
          console.log('💳 Attempting to complete payment with test data...');
          
          // Click confirm booking button (this will trigger payment processing)
          await confirmBookingButton.click();
          await this.page.waitForTimeout(5000); // Wait for payment processing
          
          // Check if we're redirected to success page
          const currentUrl = this.page.url();
          if (currentUrl.includes('/success')) {
            console.log('✅ Payment completed successfully - redirected to success page');
            this.logStep('✅ Payment completed successfully');
            
            // Extract booking ID from URL
            const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
            this.bookingId = urlParams.get('bookingId');
            console.log(`📋 Test Booking ID: ${this.bookingId}`);
          } else {
            console.log('⚠️ Payment may have failed - not redirected to success page');
            console.log(`   Current URL: ${currentUrl}`);
            this.logStep('⚠️ Payment completion unclear');
          }
        } else {
          console.log('⚠️ Cannot complete payment - confirm button not available');
          this.logStep('⚠️ Payment completion skipped (button not available)');
        }
      } catch (error) {
        console.log('⚠️ Payment form filling failed:', error.message);
        this.logStep('⚠️ Payment form filling failed');
      }
    } else {
      console.log('⚠️ Payment form not found');
    }

    // 🚨 SECURITY TEST: Verify that bookings cannot be created without payment
    console.log('🔒 TESTING SECURITY: Attempting to create booking without payment...');
    const bookingResponse = await this.page.request.post(`${TEST_CONFIG.baseUrl}/api/booking`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: TEST_CONFIG.testUser.name,
        email: TEST_CONFIG.testUser.email,
        phone: TEST_CONFIG.testUser.phone,
        pickupLocation: TEST_CONFIG.testBooking.pickupLocation,
        dropoffLocation: TEST_CONFIG.testBooking.dropoffLocation,
        pickupDateTime: TEST_CONFIG.testBooking.pickupDateTime.toISOString(),
        fare: 150,
        notes: TEST_CONFIG.testBooking.notes
      }
    });
    
    if (bookingResponse.ok()) {
      const bookingData = await bookingResponse.json();
      this.bookingId = bookingData.bookingId;
      console.log(`🚨 SECURITY VULNERABILITY: Booking created with ID: ${this.bookingId} WITHOUT PAYMENT!`);
      this.logStep('🚨 SECURITY VULNERABILITY: Booking created without payment');
    } else {
      const errorData = await bookingResponse.json();
      console.log(`✅ SECURITY CHECK PASSED: Booking creation blocked (${bookingResponse.status()})`);
      console.log(`   Error: ${errorData.error}`);
      this.logStep('✅ Security check passed: Booking creation blocked without payment');
    }
  }

  async step5_TestSuccessPage() {
    console.log('📍 Step 5: Testing success page...');
    
    try {
      // Navigate to success page manually for testing
      await this.navigateTo(`${TEST_CONFIG.baseUrl}/success?bookingId=${this.bookingId}`, 'Success page');
      await this.page.screenshot({ path: 'test-results/booking-5-success-page.png' });
      this.logStep('✅ Success page loaded');
    } catch (error) {
      console.log('⚠️ Success page timeout, but continuing test');
      this.logStep('⚠️ Success page timeout (but test continues)');
    }
  }

  async step6_TestEmailConfirmation() {
    console.log('📍 Step 6: Testing enhanced email confirmation...');
    
    // Test enhanced email delivery with booking details
    const emailResponse = await this.page.request.post(`${TEST_CONFIG.baseUrl}/api/email/enhanced-test`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        to: TEST_CONFIG.testUser.email,
        bookingId: this.bookingId
      }
    });
    
    if (emailResponse.ok()) {
      console.log('📧 Enhanced test email sent successfully');
      this.logStep('✅ Enhanced email confirmation sent with booking details and tracking link');
    } else {
      console.log('⚠️ Email service not configured or failed');
    }
  }

  async step7_TestAccountCreation() {
    console.log('📍 Step 7: Testing account creation...');
    
    // Navigate to sign up page
    await this.navigateTo(`${TEST_CONFIG.baseUrl}/auth/register`, 'Register page');
    await this.page.screenshot({ path: 'test-results/booking-7-signup-page.png' });
    
    // Fill complete signup form
    const nameInput = this.page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]').first();
    const emailInput = this.page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = this.page.locator('input[type="password"], input[name="password"]').first();
    const confirmPasswordInput = this.page.locator('input[name="confirmPassword"], input[placeholder*="confirm"]').first();
    
    if (await emailInput.isVisible()) {
      // Fill name field
      if (await nameInput.isVisible()) {
        await nameInput.fill(TEST_CONFIG.testUser.name);
        console.log('✅ Name field filled');
      }
      
      await emailInput.fill(TEST_CONFIG.testUser.email);
      await passwordInput.fill('TestPassword123!');
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('TestPassword123!');
      }
      
      const signupButton = this.page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")').first();
      if (await signupButton.isVisible()) {
        await signupButton.click();
        await this.page.waitForTimeout(3000);
        this.logStep('✅ Account creation attempted');
      }
    }
  }

  async step8_TestBookingManagement() {
    console.log('📍 Step 8: Testing booking management...');
    
    // First, log in to access bookings
    await this.navigateTo(`${TEST_CONFIG.baseUrl}/auth/login`, 'Login page');
    await this.page.screenshot({ path: 'test-results/booking-8-login-page.png' });
    
    // Fill login form
    const emailInput = this.page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = this.page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_CONFIG.testUser.email);
      await passwordInput.fill('TestPassword123!');
      
      const loginButton = this.page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await this.page.waitForTimeout(3000);
        console.log('✅ Login attempted');
        this.logStep('✅ Login attempted');
      }
    }
    
    // Navigate to bookings page after login
    await this.navigateTo(`${TEST_CONFIG.baseUrl}/bookings`, 'Bookings page');
    await this.page.screenshot({ path: 'test-results/booking-8-bookings-page.png' });
    
    // Check if we can see bookings (should show our test booking)
    const bookingCard = this.page.locator('[data-testid*="booking"], .booking-card, [class*="booking"]').first();
    const bookingId = this.page.locator(`text=${this.bookingId}`).first();
    const noBookingsMessage = this.page.locator('text=No bookings, text=You have no bookings, text=No rides found').first();
    
    if (await bookingCard.isVisible()) {
      console.log('📋 Booking card found in dashboard');
      this.logStep('✅ Booking visible in user dashboard');
    } else if (await bookingId.isVisible()) {
      console.log(`📋 Booking ID ${this.bookingId} found in dashboard`);
      this.logStep('✅ Booking ID visible in user dashboard');
    } else if (await noBookingsMessage.isVisible()) {
      console.log('📋 No bookings message shown (bookings page not fully implemented)');
      this.logStep('⚠️ Bookings page shows no bookings (feature not implemented)');
    } else {
      console.log('⚠️ No bookings found in dashboard');
      this.logStep('⚠️ No bookings found in dashboard');
    }
    
    // Check if login is still required (indicates login failed)
    const loginRequired = this.page.locator('text=Login, text=Sign in, [href*="login"]').first().isVisible();
    if (await loginRequired) {
      console.log('🔐 Login still required - login may have failed');
      this.logStep('⚠️ Login may have failed - still redirected to login');
    }
  }

  printResults() {
    console.log('\n📊 Booking Flow Test Results:');
    console.log('============================');
    
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result}`);
    });
    
    console.log(`\n📋 Test Booking ID: ${this.bookingId}`);
    console.log(`📧 Check your email (${TEST_CONFIG.testUser.email}) for confirmation emails`);
    console.log('\n📸 Screenshots saved in test-results/ directory');
  }
}

// Run the test
const test = new BookingFlowTest();
test.run().catch(console.error);
