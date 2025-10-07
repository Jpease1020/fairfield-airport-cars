# 🧪 Clean Test Suite Guide

## **Overview**

This test suite provides comprehensive coverage for the Fairfield Airport Cars application using **React Testing Library** for unit/integration tests and **Playwright** for E2E tests.

## **Test Structure**

```
tests/
├── setup.ts                    # Global test setup
├── mocks/
│   └── server.ts              # MSW API mocking
├── unit/                      # Unit tests (RTL + Vitest)
│   ├── useFareCalculation.test.tsx
│   ├── booking-provider.test.ts
│   ├── business-logic.test.ts
│   └── fare-display-section.test.ts
├── integration/               # Integration tests (RTL-heavy)
│   ├── booking-form-flow.test.tsx
│   └── health/
│       └── endpoint-health.test.ts
├── e2e/                      # E2E tests (Playwright)
│   ├── booking-flows.test.ts
│   ├── core-business-validation.test.ts
│   ├── core-user-flows-validation.test.ts
│   └── hero-quick-booking-form.test.ts
├── api/                      # API contract tests
│   └── booking-api-contracts.test.ts
└── archive/                  # Archived old tests
    ├── page-level/
    ├── utils/
    └── *.test.ts
```

## **Test Philosophy**

### **🎯 RTL-Heavy Approach**
- **Real Components**: Test with real React components and providers
- **Real User Behavior**: Test what users actually do
- **Real State**: Test real state management and data flow
- **Realistic Mocks**: MSW provides realistic API responses

### **📱 Test ID Based**
- **No text matching** - All tests use `data-testid` attributes
- **Stable selectors** - Tests won't break when copy changes
- **Clear intent** - Test IDs describe what elements do

## **Running Tests**

### **All Tests**
```bash
npm test
```

### **Unit Tests (RTL)**
```bash
npm run test:unit
npm run test:unit -- --coverage
```

### **Integration Tests (RTL)**
```bash
npm run test:integration
npm run test:integration -- --coverage
```

### **E2E Tests (Playwright)**
```bash
npm run test:e2e
```

### **API Tests**
```bash
npm run test:api
```

## **Test Coverage**

### **✅ Unit Tests (RTL)**
- **Hooks**: `useFareCalculation`, `useBooking` with RTL
- **Components**: Individual components with RTL
- **Business Logic**: Pure functions with Vitest
- **Provider State**: Real state management testing

### **✅ Integration Tests (RTL)**
- **Form Flows**: Full forms with providers
- **Provider Integration**: Context + components
- **User Journeys**: Multi-step flows
- **State Management**: Real state transitions

### **✅ E2E Tests (Playwright)**
- **Complete Flows**: Homepage → Booking → Confirmation
- **Cross-browser**: Real browser testing
- **Performance**: Real network conditions

### **✅ API Tests**
- **Contract Testing**: API endpoints with real data
- **Business Logic**: Pricing, validation, calculations
- **Error Handling**: API failures and edge cases

## **Adding New Tests**

### **Unit Test Example**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

describe('New Component', () => {
  test('should work correctly', () => {
    render(<NewComponent />);
    expect(screen.getByTestId('new-element')).toBeInTheDocument();
  });
});
```

### **Integration Test Example**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingProvider } from '@/providers/BookingProvider';

test('user can complete booking flow', async () => {
  render(
    <BookingProvider>
      <BookingForm />
    </BookingProvider>
  );
  
  fireEvent.change(screen.getByLabelText('Pickup Location'), {
    target: { value: 'Fairfield Station' }
  });
  
  await waitFor(() => {
    expect(screen.getByText(/\$\d+/)).toBeInTheDocument();
  });
});
```

### **E2E Test Example**
```typescript
import { test, expect } from '@playwright/test';

test('booking flow works end-to-end', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="pickup-location"]', 'Fairfield Station');
  await expect(page.getByTestId('fare-display')).toBeVisible();
});
```

## **Best Practices**

### **✅ Do**
- Use `data-testid` for element selection
- Test user behavior, not implementation
- Use RTL for component and integration tests
- Test real user scenarios
- Mock external dependencies appropriately

### **❌ Don't**
- Use text matching for element selection
- Test implementation details
- Make tests dependent on external services
- Only test happy paths
- Write slow, complex tests

## **Debugging Tests**

### **Unit/Integration Tests**
```bash
# Run with verbose output
npm run test:unit -- --reporter=verbose

# Run single test file
npm run test:unit -- tests/unit/useFareCalculation.test.tsx
```

### **E2E Tests**
```bash
# Run with headed browser
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

---

**Last Updated**: January 2025  
**Test Framework**: Vitest + React Testing Library + Playwright  
**Coverage Target**: 80% critical path coverage