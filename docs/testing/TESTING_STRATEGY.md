# 🧪 Testing Strategy - Fairfield Airport Cars

## **🎯 Overall Testing Philosophy**

**Safety-First Approach**: All external APIs are mocked to prevent:
- ❌ Real payments being processed
- ❌ Real SMS being sent
- ❌ Real emails being sent
- ❌ Real Google Maps API calls
- ❌ Real Firebase writes to production

**Comprehensive Coverage**: Test all user flows and edge cases while maintaining safety.

---

## **🏗️ Testing Architecture**

### **Three-Layer Testing Approach**

#### **1. UI Tests (Playwright) - Mocked APIs**
- **Purpose**: Test complete user journeys
- **Scope**: Customer booking flow, admin management, CMS editing
- **Safety**: All external APIs mocked
- **Tools**: Playwright with route interception

#### **2. API Tests (Jest/Supertest) - Mocked Services**
- **Purpose**: Test backend API endpoints
- **Scope**: All `/api/*` routes
- **Safety**: External services mocked
- **Tools**: Jest + Supertest + node-mocks-http

#### **3. Unit Tests (Jest) - Mocked Dependencies**
- **Purpose**: Test individual functions and components
- **Scope**: Service functions, utility functions, React components
- **Safety**: All external dependencies mocked
- **Tools**: Jest + React Testing Library

---

## **🛡️ Safety Protocols**

### **Critical Safety Rules**

```typescript
// ❌ NEVER do this in tests
const realPayment = await squareService.createPayment(realMoney);
const realSMS = await twilioService.sendSMS(realPhone, realMessage);

// ✅ ALWAYS do this in tests
const mockPayment = jest.fn().mockResolvedValue({ success: true });
const mockSMS = jest.fn().mockResolvedValue({ messageId: 'test-123' });
```

### **Mocked External Services**

| Service | Mock Strategy | Safety Benefit |
|---------|---------------|----------------|
| **Square Payments** | Mock checkout URLs and responses | No real payments processed |
| **Twilio SMS** | Mock SMS sending with test message IDs | No real SMS sent |
| **Nodemailer** | Mock email sending with test message IDs | No real emails sent |
| **Google Maps** | Mock distance calculations and autocomplete | No API quota usage |
| **Firebase** | Mock database operations | No production data writes |
| **OpenAI** | Mock AI responses with fallback logic | No API quota usage |

---

## **📋 Test Implementation Plan**

### **Phase 1: Critical Path Tests (Week 1)**

#### **Customer Journey Tests**
```typescript
// tests/customer-journey.spec.ts
test('complete booking flow - happy path', async ({ page }) => {
  // Mock all external APIs
  await page.route('**/api/estimate-fare', async route => {
    await route.fulfill({ status: 200, body: JSON.stringify({ fare: 150 }) });
  });
  
  // Test complete booking flow
  await page.goto('/book');
  await page.fill('#name', 'Test Customer');
  // ... complete form and verify payment redirect
});
```

**Test Cases:**
- ✅ Complete booking flow (happy path)
- ✅ Form validation (all field types)
- ✅ Fare calculation with different scenarios
- ✅ Autocomplete functionality
- ✅ Payment flow (mocked)
- ✅ Booking management
- ✅ Help and support flow
- ✅ Feedback submission
- ✅ Error handling (network failures, payment failures)

#### **Admin Functionality Tests**
```typescript
// tests/admin-functionality.spec.ts
test('admin authentication and dashboard access', async ({ page }) => {
  // Mock Firebase auth
  await page.route('**/api/auth/**', async route => {
    await route.fulfill({ status: 200, body: JSON.stringify({ user: mockAdmin }) });
  });
  
  // Test admin login and dashboard access
  await page.goto('/admin/login');
  // ... complete login flow
});
```

**Test Cases:**
- ✅ Admin authentication and authorization
- ✅ Booking management (list, filter, search)
- ✅ Booking details and status updates
- ✅ Calendar view functionality
- ✅ CMS content management
- ✅ Business settings management
- ✅ AI assistant functionality
- ✅ Analytics and reporting
- ✅ Promo code management
- ✅ Backup and data management
- ✅ Error handling and edge cases

### **Phase 2: API Tests (Week 2)**

#### **Backend API Tests**
```typescript
// tests/api-tests.spec.ts
describe('POST /api/estimate-fare', () => {
  it('should calculate fare for valid locations', async () => {
    // Mock Google Maps API
    jest.doMock('@googlemaps/google-maps-services-js', () => ({
      Client: jest.fn().mockImplementation(() => ({
        distancematrix: jest.fn().mockResolvedValue({ data: mockDistanceMatrix })
      }))
    }));
    
    // Test API endpoint
    const { req, res } = createMocks({ method: 'POST', body: mockData });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

**API Endpoints to Test:**
- ✅ `POST /api/estimate-fare` - Fare calculation
- ✅ `POST /api/create-checkout-session` - Payment creation
- ✅ `POST /api/send-confirmation` - SMS/email sending
- ✅ `POST /api/ai-assistant` - AI responses
- ✅ `GET/PUT /api/cms/pages` - CMS management
- ✅ `POST /api/square-webhook` - Payment webhooks
- ✅ Error handling for all endpoints

### **Phase 3: Unit Tests (Week 3)**

#### **Service Function Tests**
```typescript
// tests/unit/booking-service.test.ts
describe('BookingService', () => {
  it('should create booking with valid data', async () => {
    const mockFirebase = { collection: jest.fn() };
    const booking = await createBooking(mockBookingData, mockFirebase);
    expect(booking.id).toBeDefined();
    expect(booking.status).toBe('pending');
  });
});
```

**Unit Tests to Implement:**
- ✅ Booking service functions
- ✅ Payment service functions
- ✅ Communication service functions
- ✅ CMS service functions
- ✅ AI assistant functions
- ✅ Utility functions
- ✅ React component tests

---

## **🔧 Test Setup & Configuration**

### **Playwright Configuration**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    // Mock all external APIs by default
    extraHTTPHeaders: {
      'X-Test-Mode': 'true'
    }
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

### **Test Environment Setup**
```typescript
// tests/setup.ts
// Mock all external services globally
jest.mock('@/lib/square-service');
jest.mock('@/lib/twilio-service');
jest.mock('@/lib/email-service');
jest.mock('@/lib/firebase');
jest.mock('@/lib/ai-assistant');

// Setup test database
beforeAll(async () => {
  // Initialize test Firebase instance
});

afterEach(async () => {
  // Clean up test data
});
```

---

## **📊 Test Coverage Goals**

### **Coverage Targets**
- **UI Tests**: 90% of user flows covered
- **API Tests**: 95% of endpoints covered
- **Unit Tests**: 80% of functions covered
- **Integration Tests**: 85% of service interactions covered

### **Critical Paths (100% Coverage Required)**
1. **Customer Booking Flow**
   - Form submission → Fare calculation → Payment → Confirmation
2. **Admin Authentication**
   - Login → Dashboard access → Protected routes
3. **Payment Processing**
   - Payment creation → Webhook processing → Status updates
4. **Communication System**
   - SMS sending → Email sending → Confirmation delivery

---

## **🚨 Error Handling Tests**

### **Network Error Scenarios**
```typescript
test('network error handling', async ({ page }) => {
  // Mock network failure
  await page.route('**/api/estimate-fare', async route => {
    await route.abort('failed');
  });
  
  // Test user experience during network failure
  await page.goto('/book');
  await page.click('button:has-text("Calculate Fare")');
  await expect(page.locator('.error-message')).toContainText('Network error');
  await expect(page.locator('button:has-text("Retry")')).toBeVisible();
});
```

### **API Error Scenarios**
- ✅ Payment failures
- ✅ SMS sending failures
- ✅ Email sending failures
- ✅ Google Maps API failures
- ✅ Firebase connection failures
- ✅ OpenAI API failures

---

## **📱 Mobile & Accessibility Tests**

### **Mobile Testing**
```typescript
test('mobile booking experience', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/book');
  
  // Test mobile form interactions
  await page.fill('#name', 'Test Customer');
  await page.fill('#email', 'test@example.com');
  
  // Test mobile autocomplete
  await page.fill('#pickupLocation', 'Fairfield');
  await expect(page.locator('.autocomplete-suggestions')).toBeVisible();
});
```

### **Accessibility Testing**
```typescript
test('accessibility compliance', async ({ page }) => {
  await page.goto('/book');
  
  // Test keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator('#name')).toBeFocused();
  
  // Test screen reader compatibility
  const nameLabel = await page.locator('label[for="name"]');
  expect(await nameLabel.getAttribute('aria-label')).toBeDefined();
});
```

---

## **🔍 Performance Testing**

### **Load Testing**
```typescript
test('booking form performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/book');
  await page.waitForSelector('form');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds max
});
```

### **Bundle Size Testing**
```typescript
test('bundle size limits', async () => {
  const bundleStats = await analyzeBundle();
  expect(bundleStats.totalSize).toBeLessThan(500 * 1024); // 500KB max
});
```

---

## **🔄 Continuous Integration**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:api
      - run: npm run test:e2e
      - run: npm run test:accessibility
```

### **Test Scripts**
```json
// package.json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:api && npm run test:e2e",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:api": "jest --testPathPattern=tests/api",
    "test:e2e": "playwright test",
    "test:accessibility": "playwright test tests/accessibility.spec.ts",
    "test:visual": "playwright test tests/visual.spec.ts",
    "test:coverage": "jest --coverage"
  }
}
```

---

## **📈 Monitoring & Reporting**

### **Test Metrics**
- **Test Execution Time**: < 10 minutes for full suite
- **Test Reliability**: > 95% pass rate
- **Coverage Threshold**: > 80% overall coverage
- **Critical Path Coverage**: 100%

### **Test Reports**
- **HTML Reports**: Playwright and Jest HTML reports
- **Coverage Reports**: Jest coverage with thresholds
- **Performance Reports**: Lighthouse CI integration
- **Accessibility Reports**: axe-core integration

---

## **🎯 Success Criteria**

### **Before Production Deployment**
- ✅ All critical path tests passing
- ✅ No real API calls in test environment
- ✅ 100% test coverage for payment flows
- ✅ 100% test coverage for authentication
- ✅ All error scenarios tested
- ✅ Mobile responsiveness verified
- ✅ Accessibility compliance verified
- ✅ Performance benchmarks met

### **Ongoing Maintenance**
- ✅ Tests run on every PR
- ✅ Coverage reports generated
- ✅ Performance regression detection
- ✅ Accessibility regression detection
- ✅ Security vulnerability scanning

---

## **🚀 Implementation Timeline**

### **Week 1: Critical Path Tests**
- [ ] Customer booking flow tests
- [ ] Admin authentication tests
- [ ] Payment flow tests (mocked)
- [ ] Basic error handling tests

### **Week 2: API Tests**
- [ ] All API endpoint tests
- [ ] Service integration tests
- [ ] Webhook processing tests
- [ ] Error scenario tests

### **Week 3: Unit Tests**
- [ ] Service function tests
- [ ] Utility function tests
- [ ] Component tests
- [ ] Coverage optimization

### **Week 4: Advanced Tests**
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] Mobile-specific tests
- [ ] Visual regression tests

---

This testing strategy ensures comprehensive coverage while maintaining complete safety by mocking all external APIs. The approach balances thorough testing with practical implementation timelines. 