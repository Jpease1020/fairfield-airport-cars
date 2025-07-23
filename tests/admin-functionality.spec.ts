import { test, expect } from '@playwright/test';

// Mock admin data
const mockAdminUser = {
  email: 'justin@fairfieldairportcar.com',
  password: 'test-password'
};

const mockBookings = [
  {
    id: 'booking-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-123-4567',
    pickupLocation: 'Fairfield Station',
    dropoffLocation: 'JFK Airport',
    pickupDateTime: '2024-12-25T10:00:00Z',
    status: 'confirmed',
    fare: 150,
    passengers: 2,
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    id: 'booking-2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-987-6543',
    pickupLocation: 'Fairfield Station',
    dropoffLocation: 'LGA Airport',
    pickupDateTime: '2024-12-26T14:00:00Z',
    status: 'pending',
    fare: 120,
    passengers: 1,
    createdAt: '2024-12-20T11:00:00Z'
  }
];

const mockCMSContent = {
  home: {
    hero: {
      title: 'Fairfield Airport Car Service',
      subtitle: 'Premium transportation to all major airports',
      ctaText: 'Book Now'
    },
    features: {
      title: 'Why Choose Us',
      items: [
        {
          title: 'Reliable Service',
          description: 'On-time pickups guaranteed',
          icon: 'clock'
        }
      ]
    }
  },
  booking: {
    title: 'Book Your Ride',
    subtitle: 'Reserve your airport transportation',
    fullNameLabel: 'Full Name',
    emailLabel: 'Email Address'
  }
};

test.describe('Admin Functionality Tests (Mocked APIs)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock Firebase authentication
    await page.route('**/api/auth/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockAdminUser })
      });
    });

    // Mock bookings API
    await page.route('**/api/bookings', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookings)
      });
    });

    // Mock CMS API
    await page.route('**/api/cms/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCMSContent)
      });
    });

    // Mock SMS sending
    await page.route('**/api/send-sms', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-sms-123' })
      });
    });

    // Mock email sending
    await page.route('**/api/send-email', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-email-123' })
      });
    });
  });

  test('admin authentication and dashboard access', async ({ page }) => {
    // Test admin login
    await page.goto('/admin/login');
    await page.fill('#email', mockAdminUser.email);
    await page.fill('#password', mockAdminUser.password);
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('body')).toContainText('Dashboard');
    
    // Verify admin-only content is visible
    await expect(page.locator('.admin-nav')).toBeVisible();
    await expect(page.locator('.booking-stats')).toBeVisible();
  });

  test('booking management - list and filter', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Verify bookings are displayed
    await expect(page.locator('.booking-item')).toHaveCount(2);
    await expect(page.locator('body')).toContainText('John Smith');
    await expect(page.locator('body')).toContainText('Jane Doe');
    
    // Test filtering by status
    await page.selectOption('#status-filter', 'confirmed');
    await expect(page.locator('.booking-item')).toHaveCount(1);
    await expect(page.locator('body')).toContainText('John Smith');
    await expect(page.locator('body')).not.toContainText('Jane Doe');
    
    // Test search functionality
    await page.fill('#search-input', 'John');
    await expect(page.locator('.booking-item')).toHaveCount(1);
    await expect(page.locator('body')).toContainText('John Smith');
  });

  test('booking details and status updates', async ({ page }) => {
    // Mock individual booking API
    await page.route('**/api/bookings/booking-1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookings[0])
      });
    });

    await page.goto('/admin/bookings/booking-1');
    
    // Verify booking details
    await expect(page.locator('body')).toContainText('John Smith');
    await expect(page.locator('body')).toContainText('john@example.com');
    await expect(page.locator('body')).toContainText('$150');
    await expect(page.locator('body')).toContainText('confirmed');
    
    // Test status update
    await page.selectOption('#status-select', 'completed');
    await page.click('button:has-text("Update Status")');
    await expect(page.locator('.success-message')).toContainText('Status updated');
    
    // Test sending custom message
    await page.fill('#custom-message', 'Your driver is on the way!');
    await page.click('button:has-text("Send Message")');
    await expect(page.locator('.success-message')).toContainText('Message sent');
  });

  test('calendar view functionality', async ({ page }) => {
    await page.goto('/admin/calendar');
    
    // Verify calendar is displayed
    await expect(page.locator('.calendar-view')).toBeVisible();
    
    // Test booking display on calendar
    await expect(page.locator('.calendar-event')).toHaveCount(2);
    
    // Test date navigation
    await page.click('.calendar-next-month');
    await expect(page.locator('.calendar-month')).toContainText('January');
    
    // Test booking click
    await page.click('.calendar-event:first-child');
    await expect(page.locator('.booking-details-modal')).toBeVisible();
  });

  test('CMS content management', async ({ page }) => {
    await page.goto('/admin/cms/pages');
    
    // Test homepage content editing
    await page.click('a[href="/admin/cms/pages/home"]');
    await expect(page).toContainText('Homepage Content');
    
    // Test editing hero section
    await page.fill('#hero-title', 'Updated Title');
    await page.fill('#hero-subtitle', 'Updated Subtitle');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('.success-message')).toContainText('Saved');
    
    // Test editing booking form content
    await page.click('a[href="/admin/cms/pages/booking"]');
    await expect(page).toContainText('Booking Form Content');
    
    await page.fill('#booking-title', 'Book Your Ride');
    await page.fill('#full-name-label', 'Your Full Name');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('.success-message')).toContainText('Saved');
  });

  test('business settings management', async ({ page }) => {
    await page.goto('/admin/cms/business');
    
    // Test company information editing
    await page.fill('#company-name', 'Fairfield Airport Car Service LLC');
    await page.fill('#company-phone', '555-123-4567');
    await page.fill('#company-email', 'info@fairfieldairportcar.com');
    await page.click('button:has-text("Save Settings")');
    await expect(page.locator('.success-message')).toContainText('Settings saved');
    
    // Test pricing configuration
    await page.click('a[href="/admin/cms/pricing"]');
    await page.fill('#base-fare', '50');
    await page.fill('#per-mile-rate', '2.50');
    await page.fill('#deposit-percentage', '50');
    await page.click('button:has-text("Save Pricing")');
    await expect(page.locator('.success-message')).toContainText('Pricing updated');
  });

  test('AI assistant functionality', async ({ page }) => {
    // Mock AI assistant API
    await page.route('**/api/ai-assistant', async route => {
      const request = route.request();
      const body = await request.json();
      
      let response = { response: 'I can help you with that.' };
      
      if (body.question.includes('bookings')) {
        response = { 
          response: 'You have 2 bookings today. 1 confirmed, 1 pending.' 
        };
      } else if (body.question.includes('revenue')) {
        response = { 
          response: 'Total revenue this month: $270' 
        };
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    await page.goto('/admin/ai-assistant');
    
    // Test text input
    await page.fill('#ai-input', 'How many bookings do I have today?');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.ai-response')).toContainText('2 bookings today');
    
    // Test voice input (mock)
    await page.click('button[aria-label="Voice Input"]');
    await expect(page.locator('.voice-indicator')).toBeVisible();
    
    // Test voice output
    await page.click('button[aria-label="Voice Output"]');
    await expect(page.locator('.voice-playing')).toBeVisible();
  });

  test('analytics and reporting', async ({ page }) => {
    // Mock analytics API
    await page.route('**/api/analytics/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalBookings: 25,
          totalRevenue: 3750,
          averageFare: 150,
          completionRate: 92,
          monthlyTrends: [
            { month: 'Dec', bookings: 25, revenue: 3750 }
          ]
        })
      });
    });

    await page.goto('/admin/analytics');
    
    // Verify analytics display
    await expect(page).toContainText('25');
    await expect(page).toContainText('$3,750');
    await expect(page).toContainText('92%');
    
    // Test date range filtering
    await page.fill('#start-date', '2024-12-01');
    await page.fill('#end-date', '2024-12-31');
    await page.click('button:has-text("Update")');
    await expect(page.locator('.analytics-chart')).toBeVisible();
  });

  test('promo code management', async ({ page }) => {
    // Mock promo API
    await page.route('**/api/promos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'promo-1',
            code: 'WELCOME10',
            discount: 10,
            type: 'percentage',
            active: true,
            usageCount: 5,
            maxUsage: 100
          }
        ])
      });
    });

    await page.goto('/admin/promos');
    
    // Verify existing promos
    await expect(page).toContainText('WELCOME10');
    await expect(page).toContainText('10%');
    
    // Test creating new promo
    await page.click('button:has-text("Add Promo")');
    await page.fill('#promo-code', 'HOLIDAY20');
    await page.fill('#discount-amount', '20');
    await page.selectOption('#discount-type', 'percentage');
    await page.fill('#max-usage', '50');
    await page.click('button:has-text("Create Promo")');
    await expect(page.locator('.success-message')).toContainText('Promo created');
  });

  test('backup and data management', async ({ page }) => {
    // Mock backup API
    await page.route('**/api/backup', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          backupId: 'backup-123',
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.goto('/admin/backups');
    
    // Test creating backup
    await page.click('button:has-text("Create Backup")');
    await expect(page.locator('.success-message')).toContainText('Backup created');
    
    // Test backup restoration
    await page.click('button:has-text("Restore")');
    await expect(page.locator('.confirmation-dialog')).toBeVisible();
    await page.click('button:has-text("Confirm Restore")');
    await expect(page.locator('.success-message')).toContainText('Restored');
  });

  test('error handling and edge cases', async ({ page }) => {
    // Test unauthorized access
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin/login');
    
    // Test invalid login
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrong-password');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
    
    // Test network error handling
    await page.route('**/api/bookings', async route => {
      await route.abort('failed');
    });
    
    await page.goto('/admin/bookings');
    await expect(page.locator('.error-message')).toContainText('Failed to load bookings');
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });
}); 