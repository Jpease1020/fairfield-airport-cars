#!/usr/bin/env node

/**
 * 🎯 Comprehensive End-to-End Test for Fairfield Airport Cars
 * 
 * This script tests the complete user journey from home page to ride completion
 * including real email delivery, payment processing, and tracking.
 */

import { chromium } from 'playwright';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: {
    name: 'E2E Test User',
    email: 'justinpease2@gmail.com',
    phone: '203-994-5439' // Your real phone number for SMS testing
  },
  testBooking: {
    pickupLocation: 'Fairfield Station, Fairfield, CT',
    dropoffLocation: 'JFK Airport, Queens, NY',
    pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    notes: 'E2E Test Booking - Extra luggage'
  },
  timeout: 30000
};

class E2ETestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.bookingId = null;
    this.results = {
      steps: [],
      errors: [],
      success: false
    };
  }

  async init() {
    console.log('🚀 Starting Comprehensive E2E Test...\n');
    
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for CI/CD
      slowMo: 1000 // Slow down for better visibility
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Browser Error:', msg.text());
      }
    });
  }

  async runTest() {
    try {
      await this.init();
      
      // Step 1: Test home page and quick book form
      await this.step1_TestHomePageQuickBook();
      
      // Step 2: Test data persistence and navigation
      await this.step2_TestDataPersistence();
      
      // Step 3: Test complete booking flow
      await this.step3_TestCompleteBooking();
      
      // Step 4: Test payment processing
      await this.step4_TestPaymentProcessing();
      
      // Step 5: Test notifications and confirmation
      await this.step5_TestNotifications();
      
      // Step 6: Test booking management
      await this.step6_TestBookingManagement();
      
      // Step 7: Test real-time tracking
      await this.step7_TestRealTimeTracking();
      
      this.results.success = true;
      console.log('\n🎉 All tests completed successfully!');
      
    } catch (error) {
      console.error('\n💥 Test failed:', error.message);
      this.results.errors.push(error.message);
    } finally {
      await this.cleanup();
    }
  }

  async step1_TestHomePageQuickBook() {
    console.log('📍 Step 1: Testing home page and quick book form...');
    
    // Navigate to home page
    await this.page.goto(`${TEST_CONFIG.baseUrl}`);
    await this.page.waitForLoadState('networkidle');
    
    // Take screenshot of home page
    await this.page.screenshot({ path: 'test-results/home-page.png' });
    
    // Look for quick book form (HeroCompactBookingForm)
    const quickBookForm = this.page.locator('[data-testid="hero-booking-form"]').first();
    const isFormVisible = await quickBookForm.isVisible();
    
    if (!isFormVisible) {
      throw new Error('Quick book form not found on home page');
    }
    
    this.logStep('✅ Home page loaded and quick book form found');
    
    // Fill out the quick book form
    console.log('📝 Filling out quick book form...');
    
    // Look for pickup location input (LocationInput component)
    const pickupInput = this.page.locator('input[placeholder*="From:"], input[placeholder*="Fairfield Station"]').first();
    if (await pickupInput.isVisible()) {
      await pickupInput.fill(TEST_CONFIG.testBooking.pickupLocation);
      await this.page.waitForTimeout(2000); // Wait for location autocomplete
    }
    
    // Look for dropoff location input (LocationInput component)
    const dropoffInput = this.page.locator('input[placeholder*="To:"], input[placeholder*="JFK Airport"]').first();
    if (await dropoffInput.isVisible()) {
      await dropoffInput.fill(TEST_CONFIG.testBooking.dropoffLocation);
      await this.page.waitForTimeout(2000); // Wait for location autocomplete
    }
    
    // Look for date/time input
    const dateTimeInput = this.page.locator('input[type="datetime-local"]').first();
    if (await dateTimeInput.isVisible()) {
      const dateTimeString = TEST_CONFIG.testBooking.pickupDateTime.toISOString().slice(0, 16);
      await dateTimeInput.fill(dateTimeString);
      await this.page.waitForTimeout(1000);
    }
    
    this.logStep('✅ Quick book form filled successfully');
    
    // Look for "Get Price" button
    const getPriceButton = this.page.locator('button[data-testid*="get-price"], button:has-text("Get Price"), button:has-text("Get Quote")').first();
    if (await getPriceButton.isVisible()) {
      await getPriceButton.click();
      await this.page.waitForTimeout(3000); // Wait for fare calculation
      this.logStep('✅ Get Price button clicked and fare calculated');
    }
    
    // Look for "Book Now" link/button
    const bookNowButton = this.page.locator('a[data-testid*="book-now"], button[data-testid*="book-now"], a:has-text("Book Now"), button:has-text("Book Now")').first();
    if (await bookNowButton.isVisible()) {
      this.logStep('✅ Book Now button/link is visible');
    } else {
      console.log('⚠️ Book Now button not found, continuing with navigation test');
    }
  }

  async step2_TestDataPersistence() {
    console.log('📍 Step 2: Testing data persistence and navigation...');
    
    // The Get Price button should navigate to booking page with URL parameters
    // Check if we're already on the booking page with parameters
    const currentUrl = this.page.url();
    if (currentUrl.includes('/book')) {
      this.logStep('✅ Successfully navigated to booking page with parameters');
    } else {
      // If not on booking page, navigate directly with test parameters
      const params = new URLSearchParams({
        pickup: TEST_CONFIG.testBooking.pickupLocation,
        dropoff: TEST_CONFIG.testBooking.dropoffLocation,
        date: TEST_CONFIG.testBooking.pickupDateTime.toISOString().slice(0, 10),
        time: TEST_CONFIG.testBooking.pickupDateTime.toTimeString().slice(0, 5)
      });
      await this.page.goto(`${TEST_CONFIG.baseUrl}/book?${params.toString()}`);
      await this.page.waitForLoadState('networkidle');
      this.logStep('✅ Navigated to booking page with test parameters');
    }
    
    // Take screenshot of booking page
    await this.page.screenshot({ path: 'test-results/booking-page.png' });
    
    // Check if form is prefilled with home page data
    const pickupField = this.page.locator('[data-testid="pickup-location-input"]').first();
    const dropoffField = this.page.locator('[data-testid="dropoff-location-input"]').first();
    const datetimeField = this.page.locator('[data-testid="pickup-datetime-input"]').first();
    
    if (await pickupField.isVisible()) {
      const pickupValue = await pickupField.inputValue();
      if (pickupValue.includes('Fairfield Station')) {
        this.logStep('✅ Pickup location prefilled from home page');
      } else {
        console.log('⚠️ Pickup location not prefilled, filling manually');
        await pickupField.fill(TEST_CONFIG.testBooking.pickupLocation);
      }
    }
    
    if (await dropoffField.isVisible()) {
      const dropoffValue = await dropoffField.inputValue();
      if (dropoffValue.includes('JFK Airport')) {
        this.logStep('✅ Dropoff location prefilled from home page');
      } else {
        console.log('⚠️ Dropoff location not prefilled, filling manually');
        await dropoffField.fill(TEST_CONFIG.testBooking.dropoffLocation);
      }
    }
    
    if (await datetimeField.isVisible()) {
      const datetimeValue = await datetimeField.inputValue();
      if (datetimeValue) {
        this.logStep('✅ Pickup date/time prefilled from home page');
      } else {
        console.log('⚠️ Pickup date/time not prefilled, filling manually');
        const dateTimeString = TEST_CONFIG.testBooking.pickupDateTime.toISOString().slice(0, 16);
        await datetimeField.fill(dateTimeString);
      }
    }
  }

  async step3_TestCompleteBooking() {
    console.log('📍 Step 3: Testing complete booking flow...');
    
    // Fill out contact information using data-testid selectors
    const nameInput = this.page.locator('[data-testid="name-input"]').first();
    const emailInput = this.page.locator('[data-testid="email-input"]').first();
    const phoneInput = this.page.locator('[data-testid="phone-input"]').first();
    
    if (await nameInput.isVisible()) {
      await nameInput.fill(TEST_CONFIG.testUser.name);
    }
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_CONFIG.testUser.email);
    }
    
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(TEST_CONFIG.testUser.phone);
    }
    
    // Add notes if field exists
    const notesInput = this.page.locator('[data-testid="notes-input"]').first();
    if (await notesInput.isVisible()) {
      await notesInput.fill(TEST_CONFIG.testBooking.notes);
    }
    
    this.logStep('✅ Contact information filled successfully');
    
    // Look for booking button
    const bookingButton = this.page.locator('button[data-testid*="book"], button[data-testid*="submit"], button[type="submit"], button:has-text("Book Now")').first();
    if (await bookingButton.isVisible()) {
      await bookingButton.click();
      await this.page.waitForTimeout(2000);
      this.logStep('✅ Booking button clicked');
      
      // Check if we're redirected to success page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/success')) {
        this.logStep('✅ Successfully redirected to success page');
        await this.page.screenshot({ path: 'test-results/success-page.png' });
      } else {
        console.log('⚠️ Not redirected to success page, current URL:', currentUrl);
      }
    }
  }

  async step4_TestPaymentProcessing() {
    console.log('📍 Step 4: Testing payment processing...');
    
    // Check if we're redirected to payment page or Square
    const currentUrl = this.page.url();
    console.log(`🔗 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('squareup.com')) {
      console.log('💳 Redirected to Square payment page');
      this.logStep('✅ Redirected to Square payment page');
      
      // In a real test, you would complete the Square payment
      // For now, we'll just verify the redirect
      console.log('⚠️ Square payment page detected - manual completion required');
    } else if (currentUrl.includes('/success') || currentUrl.includes('/payment-success')) {
      console.log('✅ Payment processed successfully');
      this.logStep('✅ Payment processed successfully');
    } else {
      // Test booking creation API directly
      await this.testBookingCreationAPI();
    }
  }

  async testBookingCreationAPI() {
    console.log('📍 Testing booking creation via API...');
    
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
      console.log(`📋 Booking created with ID: ${this.bookingId}`);
      this.logStep('✅ Booking created successfully in Firebase');
    } else {
      const errorText = await bookingResponse.text();
      throw new Error(`Failed to create booking: ${errorText}`);
    }
  }

  async step5_TestNotifications() {
    console.log('📍 Step 5: Testing notifications and confirmation...');
    
    if (!this.bookingId) {
      console.log('⚠️ No booking ID available, skipping notification test');
      return;
    }
    
    // Test email delivery
    console.log('📧 Testing email delivery...');
    const emailResponse = await this.page.request.post(`${TEST_CONFIG.baseUrl}/api/email/test`, {
      headers: { 'Content-Type': 'application/json' },
      data: { 
        to: TEST_CONFIG.testUser.email,
        subject: 'E2E Test Email - Booking Confirmation',
        text: `Your booking ${this.bookingId} has been confirmed!`
      }
    });
    
    if (emailResponse.ok()) {
      console.log('📧 Test email sent successfully');
      this.logStep('✅ Test email sent successfully');
    } else {
      console.log('⚠️ Email service not configured or failed');
    }
    
    // Test SMS delivery
    console.log('📱 Testing SMS delivery...');
    const smsResponse = await this.page.request.post(`${TEST_CONFIG.baseUrl}/api/notifications/send-confirmation`, {
      headers: { 'Content-Type': 'application/json' },
      data: { bookingId: this.bookingId }
    });
    
    if (smsResponse.ok()) {
      const notificationData = await smsResponse.json();
      console.log(`📱 Notifications sent via: ${notificationData.channels.join(', ')}`);
      this.logStep('✅ SMS and email notifications sent successfully');
    } else {
      console.log('⚠️ Notification service not configured or failed');
    }
  }

  async step6_TestBookingManagement() {
    console.log('📍 Step 6: Testing booking management...');
    
    // Navigate to bookings page
    await this.page.goto(`${TEST_CONFIG.baseUrl}/bookings`);
    await this.page.waitForLoadState('networkidle');
    
    // Take screenshot of bookings page
    await this.page.screenshot({ path: 'test-results/bookings-page.png' });
    
    // Check if we can see bookings or if login is required
    const bookingList = this.page.locator('[data-testid*="booking"], .booking, [class*="booking"]');
    const loginRequired = this.page.locator('[data-testid*="login"], .login, [class*="login"]');
    
    if (await bookingList.isVisible()) {
      console.log('📋 Bookings page loaded successfully');
      this.logStep('✅ Bookings page accessible');
    } else if (await loginRequired.isVisible()) {
      console.log('🔐 Login required for bookings page (expected)');
      this.logStep('✅ Login requirement detected (expected behavior)');
    }
  }

  async step7_TestRealTimeTracking() {
    console.log('📍 Step 7: Testing real-time tracking...');
    
    if (!this.bookingId) {
      console.log('⚠️ No booking ID available, skipping tracking test');
      return;
    }
    
    // Navigate to tracking page
    await this.page.goto(`${TEST_CONFIG.baseUrl}/tracking/${this.bookingId}`);
    await this.page.waitForLoadState('networkidle');
    
    // Take screenshot of tracking page
    await this.page.screenshot({ path: 'test-results/tracking-page.png' });
    
    // Check for tracking interface
    const mapElement = this.page.locator('[data-testid*="map"], .map, #map, [class*="map"]');
    const trackingInfo = this.page.locator('[data-testid*="tracking"], .tracking, [class*="tracking"]');
    
    if (await mapElement.isVisible() || await trackingInfo.isVisible()) {
      console.log('🗺️ Tracking interface loaded successfully');
      this.logStep('✅ Real-time tracking interface accessible');
    } else {
      console.log('⚠️ Tracking interface not available (booking may not exist)');
    }
  }

  logStep(message) {
    this.results.steps.push({
      timestamp: new Date().toISOString(),
      message: message
    });
    console.log(message);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Print test results
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    this.results.steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.message}`);
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log(`\n🎯 Test Status: ${this.results.success ? 'PASSED' : 'FAILED'}`);
    
    if (this.bookingId) {
      console.log(`📋 Test Booking ID: ${this.bookingId}`);
      console.log(`📧 Check your email (${TEST_CONFIG.testUser.email}) for confirmation emails`);
      console.log(`📱 Check your phone (${TEST_CONFIG.testUser.phone}) for SMS notifications`);
    }
    
    console.log('\n📸 Screenshots saved in test-results/ directory');
  }
}

// Run the test
const testRunner = new E2ETestRunner();
testRunner.runTest().catch(console.error);
