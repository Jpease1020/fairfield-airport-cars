# 🧪 Test Suite Guide

## **Overview**

This test suite provides comprehensive coverage for the Fairfield Airport Cars application using **Vitest** for unit/integration tests and **Playwright** for E2E tests.

## **Test Structure**

```
tests/
├── unit/                          # RTL Unit Tests
│   ├── page-loading-rtl.test.tsx  # Page loading & user flows
│   ├── business-flows.test.tsx     # Business logic & API testing
│   └── msw-test.spec.ts           # API mocking tests
├── e2e/                           # Playwright E2E Tests
│   ├── comprehensive-page-loading.test.ts  # All pages + API testing
│   ├── complete-booking-flow.test.ts       # Booking flow E2E
│   ├── admin-dashboard.test.ts             # Admin flow E2E
│   └── payment-flow-critical.spec.ts       # Payment flow E2E
├── setup.ts                       # Global test setup
├── msw-setup.ts                   # API mocking setup
└── README.md                      # This guide
```

## **Test Philosophy**

### **🎯 Test ID Based**
- **No text matching** - All tests use `data-testid` attributes
- **Stable selectors** - Tests won't break when copy changes
- **Clear intent** - Test IDs describe what elements do

### **🔧 Vitest Only**
- **No Jest dependencies** - Pure Vitest framework
- **Native matchers** - `toBeDefined()`, `toBe(true)`, etc.
- **Fast execution** - Optimized for speed

### **📱 Real User Flows**
- **Page loading** - Every page loads correctly
- **API handling** - Graceful error handling
- **User journeys** - Complete booking/admin flows

## **Running Tests**

### **Unit Tests (RTL)**
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:rtl

# Run with coverage
npm run test:unit -- --coverage
```

### **E2E Tests (Playwright)**
```bash
# Run all E2E tests
npm run test:e2e

# Run page loading tests
npm run test:e2e:pages

# Run specific test file
npx playwright test tests/e2e/comprehensive-page-loading.test.ts
```

### **API Mocking Tests**
```bash
# Run MSW tests
npm run test:msw
```

## **Test Coverage**

### **✅ Unit Tests (RTL)**
- **Page Loading**: All pages render correctly
- **User Flows**: Booking, admin, help pages
- **API Handling**: Error states, loading states
- **Accessibility**: Alt text, heading structure
- **Form Validation**: Input validation, disabled states

### **✅ E2E Tests (Playwright)**
- **Page Coverage**: Every route loads
- **API Integration**: Real API calls work
- **User Journeys**: Complete booking flow
- **Error Handling**: Network failures, API errors
- **Mobile Testing**: Responsive design

### **✅ API Tests**
- **MSW Mocking**: API response simulation
- **Error Scenarios**: 500 errors, timeouts
- **Success Cases**: Normal API responses

## **Adding New Tests**

### **Unit Test Example**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

describe('New Feature', () => {
  test('should work correctly', () => {
    render(<NewComponent />);
    expect(screen.getByTestId('new-element')).toBeDefined();
  });
});
```

### **E2E Test Example**
```typescript
import { test, expect } from '@playwright/test';

test('new feature works end-to-end', async ({ page }) => {
  await page.goto('/new-feature');
  await expect(page.getByTestId('new-element')).toBeVisible();
});
```

## **Test Data**

### **Test IDs Required**
All interactive elements must have `data-testid` attributes:

```tsx
<button data-testid="submit-button">Submit</button>
<form data-testid="booking-form">...</form>
<div data-testid="main-content">...</div>
```

### **API Mocking**
Use MSW for API mocking:

```typescript
server.use(
  http.get('/api/endpoint', () => {
    return HttpResponse.json({ data: 'test' });
  })
);
```

## **Best Practices**

### **✅ Do**
- Use `data-testid` for element selection
- Test user behavior, not implementation
- Mock external dependencies
- Test error scenarios
- Keep tests focused and fast

### **❌ Don't**
- Use text matching for element selection
- Test implementation details
- Make tests dependent on external services
- Only test happy paths
- Write slow, complex tests

## **Debugging Tests**

### **Unit Tests**
```bash
# Run with verbose output
npm run test:unit -- --reporter=verbose

# Run single test
npm run test:unit -- --run tests/unit/page-loading-rtl.test.tsx
```

### **E2E Tests**
```bash
# Run with headed browser
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## **Performance**

### **Unit Tests**
- **Memory**: 8GB heap limit
- **Speed**: ~30 seconds for full suite
- **Parallel**: Fork-based execution

### **E2E Tests**
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Mobile Chrome, Mobile Safari
- **Speed**: ~2 minutes for full suite

## **Maintenance**

### **Regular Tasks**
- Update test IDs when UI changes
- Refresh API mocks for new endpoints
- Review test coverage quarterly
- Update dependencies monthly

### **Monitoring**
- Test execution time
- Coverage percentages
- Flaky test detection
- Performance regression

---

**Last Updated**: January 2025
**Test Framework**: Vitest + Playwright
**Coverage Target**: 100% page + flow coverage 