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
  testDriver: {
    name: 'Gregg',
    phone: '203-555-0123',
    location: {
      lat: 41.1403,
      lng: -73.2638
    }
  },
  testBooking: {
    pickupLocation: 'Fairfield Station, Fairfield, CT',
    dropoffLocation: 'JFK Airport, Queens, NY',
    pickupDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    notes: 'E2E Ride Test - Please call when you arrive'
  },
  timeout: 30000
};

class RideTrackingTest {
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

  async setup() {
    console.log('🚀 Starting Ride Tracking Test...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slow down for better visibility
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.setup();
      
      await this.step1_CreateTestBooking();
      await this.step2_TestTrackingPage();
      await this.step3_TestDriverLocation();
      await this.step4_TestRealTimeUpdates();
      await this.step5_TestDriverCommunication();
      await this.step6_TestRideStatusUpdates();
      
      this.printResults();
      
    } catch (error) {
      console.error('💥 Test failed:', error.message);
      await this.page.screenshot({ path: 'test-results/ride-test-error.png' });
    } finally {
      await this.cleanup();
    }
  }

  async step1_CreateTestBooking() {
    console.log('📍 Step 1: Creating test booking for ride tracking...');
    
    // Create a booking via API
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
        notes: TEST_CONFIG.testBooking.notes,
        status: 'confirmed' // Set as confirmed so it can be tracked
      }
    });
    
    if (bookingResponse.ok()) {
      const bookingData = await bookingResponse.json();
      this.bookingId = bookingData.bookingId;
      console.log(`📋 Test booking created with ID: ${this.bookingId}`);
      this.logStep('✅ Test booking created successfully');
    } else {
      throw new Error('Failed to create test booking');
    }
  }

  async step2_TestTrackingPage() {
    console.log('📍 Step 2: Testing tracking page access...');
    
    // Navigate to tracking page
    await this.page.goto(`${TEST_CONFIG.baseUrl}/tracking/${this.bookingId}`);
    await this.page.waitForLoadState('networkidle');
    await this.page.screenshot({ path: 'test-results/ride-2-tracking-page.png' });
    
    // Check if tracking page loads
    const trackingContainer = this.page.locator('[data-testid*="tracking"], .tracking, [class*="tracking"]');
    const mapElement = this.page.locator('[data-testid*="map"], .map, #map, [class*="map"]');
    
    if (await trackingContainer.isVisible() || await mapElement.isVisible()) {
      this.logStep('✅ Tracking page loaded successfully');
    } else {
      throw new Error('Tracking page did not load properly');
    }
  }

  async step3_TestDriverLocation() {
    console.log('📍 Step 3: Testing driver location display...');
    
    // Check for driver location on map
    const driverMarker = this.page.locator('[data-testid*="driver"], .driver-marker, [class*="driver"]');
    const driverInfo = this.page.locator('[data-testid*="driver-info"], .driver-info, [class*="driver"]');
    
    if (await driverMarker.isVisible()) {
      this.logStep('✅ Driver marker visible on map');
    } else {
      console.log('⚠️ Driver marker not visible - driver may not be assigned yet');
    }
    
    if (await driverInfo.isVisible()) {
      const driverText = await driverInfo.textContent();
      console.log(`👨‍💼 Driver info: ${driverText}`);
      this.logStep('✅ Driver information displayed');
    } else {
      console.log('⚠️ Driver information not displayed');
    }
  }

  async step4_TestRealTimeUpdates() {
    console.log('📍 Step 4: Testing real-time location updates...');
    
    // Wait for any real-time updates
    await this.page.waitForTimeout(5000);
    
    // Check for live updates indicator
    const liveIndicator = this.page.locator('[data-testid*="live"], .live, [class*="live"]');
    const lastUpdated = this.page.locator('[data-testid*="last-updated"], .last-updated, [class*="updated"]');
    
    if (await liveIndicator.isVisible()) {
      this.logStep('✅ Live updates indicator visible');
    }
    
    if (await lastUpdated.isVisible()) {
      const updateText = await lastUpdated.textContent();
      console.log(`🕐 Last updated: ${updateText}`);
      this.logStep('✅ Last updated timestamp shown');
    }
    
    // Take screenshot to show current state
    await this.page.screenshot({ path: 'test-results/ride-4-realtime-updates.png' });
  }

  async step5_TestDriverCommunication() {
    console.log('📍 Step 5: Testing driver communication features...');
    
    // Look for communication buttons
    const callButton = this.page.locator('[data-testid*="call"], button:has-text("Call"), a:has-text("Call")');
    const messageButton = this.page.locator('[data-testid*="message"], button:has-text("Message"), a:has-text("Message")');
    
    if (await callButton.isVisible()) {
      this.logStep('✅ Call driver button available');
      
      // Test click (but don't actually call)
      await callButton.click();
      await this.page.waitForTimeout(1000);
      console.log('📞 Call button clicked (test only)');
    }
    
    if (await messageButton.isVisible()) {
      this.logStep('✅ Message driver button available');
    }
  }

  async step6_TestRideStatusUpdates() {
    console.log('📍 Step 6: Testing ride status updates...');
    
    // Look for status indicators
    const statusIndicator = this.page.locator('[data-testid*="status"], .status, [class*="status"]');
    const etaDisplay = this.page.locator('[data-testid*="eta"], .eta, [class*="eta"]');
    const progressBar = this.page.locator('[data-testid*="progress"], .progress, [class*="progress"]');
    
    if (await statusIndicator.isVisible()) {
      const statusText = await statusIndicator.textContent();
      console.log(`📊 Current status: ${statusText}`);
      this.logStep('✅ Ride status displayed');
    }
    
    if (await etaDisplay.isVisible()) {
      const etaText = await etaDisplay.textContent();
      console.log(`⏰ ETA: ${etaText}`);
      this.logStep('✅ ETA information shown');
    }
    
    if (await progressBar.isVisible()) {
      this.logStep('✅ Progress indicator visible');
    }
    
    // Take final screenshot
    await this.page.screenshot({ path: 'test-results/ride-6-final-status.png' });
  }

  printResults() {
    console.log('\n📊 Ride Tracking Test Results:');
    console.log('==============================');
    
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result}`);
    });
    
    console.log(`\n📋 Test Booking ID: ${this.bookingId}`);
    console.log(`🔗 Tracking URL: ${TEST_CONFIG.baseUrl}/tracking/${this.bookingId}`);
    console.log('\n📸 Screenshots saved in test-results/ directory');
    
    console.log('\n📝 Next Steps for Complete Ride Test:');
    console.log('1. Assign driver Gregg to the booking in admin panel');
    console.log('2. Have Gregg start the ride from driver app');
    console.log('3. Test real-time location updates as Gregg moves');
    console.log('4. Test ride completion and payment processing');
  }
}

// Run the test
const test = new RideTrackingTest();
test.run().catch(console.error);
