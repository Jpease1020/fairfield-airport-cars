# Test Plan: Quote Validation & Booking Flow

## Purpose
Prevent the issues we encountered today related to quote validation, Firebase Admin SDK usage, and email configuration.

## Issues to Prevent

### 1. Quote Validation Issues
- **Issue**: Quotes created without `pickupDateTime` causing `ROUTE_CHANGED` errors
- **Root Cause**: Quote generation didn't require pickup time
- **Prevention**: Require `pickupDateTime` in quote creation

### 2. Firebase Permission Errors
- **Issue**: `PERMISSION_DENIED` errors when fetching quotes/booking attempts from API routes
- **Root Cause**: Using client SDK in server-side API routes
- **Prevention**: Ensure all server-side operations use Admin SDK

### 3. Email Configuration Issues
- **Issue**: Gmail authentication errors, confusion between SendGrid and Gmail
- **Root Cause**: Environment variables not properly configured
- **Prevention**: Add validation and diagnostics

## Test Cases to Implement

### Quote API Tests

#### Test: Quote Creation Requires Pickup Time
```typescript
test('POST /api/booking/quote requires pickupTime', async () => {
  const response = await request.post('/api/booking/quote', {
    origin: '30 Shut Rd, Newtown, CT',
    destination: 'JFK Airport',
    fareType: 'personal',
    // Missing pickupTime
  });
  
  expect(response.status).toBe(400);
  expect(response.body.code).toBe('MISSING_PICKUP_TIME');
});
```

#### Test: Quote Creation Validates Pickup Time is Future
```typescript
test('POST /api/booking/quote rejects past pickup times', async () => {
  const pastTime = new Date(Date.now() - 1000).toISOString();
  const response = await request.post('/api/booking/quote', {
    origin: '30 Shut Rd, Newtown, CT',
    destination: 'JFK Airport',
    fareType: 'personal',
    pickupTime: pastTime,
  });
  
  expect(response.status).toBe(400);
  expect(response.body.code).toBe('INVALID_PICKUP_TIME');
});
```

#### Test: Quote Includes pickupDateTime
```typescript
test('POST /api/booking/quote stores pickupDateTime', async () => {
  const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const response = await request.post('/api/booking/quote', {
    origin: '30 Shut Rd, Newtown, CT',
    destination: 'JFK Airport',
    fareType: 'personal',
    pickupTime,
  });
  
  expect(response.status).toBe(200);
  const quote = await getQuote(response.body.quoteId);
  expect(quote).toBeTruthy();
  expect(quote.pickupDateTime).toBeInstanceOf(Date);
  expect(quote.pickupDateTime.toISOString()).toBe(pickupTime);
});
```

### Booking Submit Tests

#### Test: Booking Submit Validates Quote with pickupDateTime
```typescript
test('POST /api/booking/submit validates quote with pickupDateTime', async () => {
  // Create quote with pickupDateTime
  const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const quoteResponse = await request.post('/api/booking/quote', {
    origin: '30 Shut Rd, Newtown, CT',
    destination: 'JFK Airport',
    fareType: 'personal',
    pickupTime,
  });
  
  const quote = quoteResponse.body;
  
  // Submit booking with matching details
  const submitResponse = await request.post('/api/booking/submit', {
    quoteId: quote.quoteId,
    fare: quote.fare,
    customer: { name: 'Test', email: 'test@example.com', phone: '1234567890' },
    trip: {
      pickup: { address: '30 Shut Rd, Newtown, CT', coordinates: { lat: 41.364, lng: -73.348 } },
      dropoff: { address: 'JFK Airport', coordinates: { lat: 40.644, lng: -73.779 } },
      pickupDateTime: pickupTime,
      fareType: 'personal',
    },
  });
  
  expect(submitResponse.status).toBe(200);
});
```

#### Test: Booking Submit Rejects Mismatched pickupDateTime
```typescript
test('POST /api/booking/submit rejects changed pickupDateTime', async () => {
  const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const quoteResponse = await request.post('/api/booking/quote', {
    origin: '30 Shut Rd, Newtown, CT',
    destination: 'JFK Airport',
    fareType: 'personal',
    pickupTime,
  });
  
  const quote = quoteResponse.body;
  const differentTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  
  const submitResponse = await request.post('/api/booking/submit', {
    quoteId: quote.quoteId,
    fare: quote.fare,
    customer: { name: 'Test', email: 'test@example.com', phone: '1234567890' },
    trip: {
      pickup: { address: '30 Shut Rd, Newtown, CT', coordinates: { lat: 41.364, lng: -73.348 } },
      dropoff: { address: 'JFK Airport', coordinates: { lat: 40.644, lng: -73.779 } },
      pickupDateTime: differentTime, // Different time!
      fareType: 'personal',
    },
  });
  
  expect(submitResponse.status).toBe(409);
  expect(submitResponse.body.code).toBe('ROUTE_CHANGED');
});
```

### Firebase Admin SDK Tests

#### Test: getQuote Uses Admin SDK in API Routes
```typescript
test('getQuote uses Admin SDK when called from API route', async () => {
  // Mock Admin SDK
  const mockAdminDb = {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          exists: true,
          id: 'test-quote-id',
          data: () => ({
            pickupAddress: 'Origin',
            dropoffAddress: 'Destination',
            pickupDateTime: new Date(),
            fareType: 'personal',
            price: 100,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          }),
        })),
      })),
    })),
  };
  
  vi.mock('@/lib/utils/firebase-admin', () => ({
    getAdminDb: () => mockAdminDb,
  }));
  
  const quote = await getQuote('test-quote-id');
  expect(quote).toBeTruthy();
  expect(mockAdminDb.collection).toHaveBeenCalledWith('quotes');
});
```

#### Test: recordBookingAttempt Uses Admin SDK
```typescript
test('recordBookingAttempt uses Admin SDK', async () => {
  const mockAdminDb = {
    collection: vi.fn(() => ({
      add: vi.fn(() => Promise.resolve({ id: 'attempt-id' })),
    })),
  };
  
  vi.mock('@/lib/utils/firebase-admin', () => ({
    getAdminDb: () => mockAdminDb,
  }));
  
  await recordBookingAttempt({
    stage: 'submit',
    status: 'success',
    bookingId: 'test-booking',
  });
  
  expect(mockAdminDb.collection).toHaveBeenCalledWith('booking_attempts');
});
```

### Email Configuration Tests

#### Test: Email Verify Config Endpoint
```typescript
test('GET /api/email/verify-config shows current configuration', async () => {
  process.env.EMAIL_HOST = 'smtp.sendgrid.net';
  process.env.EMAIL_PORT = '587';
  process.env.EMAIL_USER = 'apikey';
  process.env.EMAIL_PASS = 'SG.test-key';
  
  const response = await request.get('/api/email/verify-config');
  
  expect(response.status).toBe(200);
  expect(response.body.config.EMAIL_HOST).toContain('smtp.sendgrid.net');
  expect(response.body.config.EMAIL_PORT).toContain('587');
});
```

#### Test: Email Test Endpoint Validates Configuration
```typescript
test('POST /api/email/test-booking-verification validates email config', async () => {
  // Missing email config
  delete process.env.EMAIL_HOST;
  
  const response = await request.post('/api/email/test-booking-verification', {
    to: 'test@example.com',
  });
  
  expect(response.status).toBe(500);
  expect(response.body.error).toContain('Email service not configured');
});
```

## Integration Test: Full Booking Flow

```typescript
test('Full booking flow: quote → submit → confirmation', async () => {
  // 1. Create quote with pickup time
  const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const quoteResponse = await request.post('/api/booking/quote', {
    origin: '30 Shut Rd, Newtown, CT',
    destination: 'JFK Airport',
    fareType: 'personal',
    pickupTime,
  });
  
  expect(quoteResponse.status).toBe(200);
  const quote = quoteResponse.body;
  expect(quote.quoteId).toBeTruthy();
  expect(quote.fare).toBeGreaterThan(0);
  
  // 2. Submit booking
  const submitResponse = await request.post('/api/booking/submit', {
    quoteId: quote.quoteId,
    fare: quote.fare,
    customer: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '2039945439',
    },
    trip: {
      pickup: {
        address: '30 Shut Rd, Newtown, CT',
        coordinates: { lat: 41.364, lng: -73.348 },
      },
      dropoff: {
        address: 'JFK Airport',
        coordinates: { lat: 40.644, lng: -73.779 },
      },
      pickupDateTime: pickupTime,
      fareType: 'personal',
      flightInfo: {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
    },
  });
  
  expect(submitResponse.status).toBe(200);
  expect(submitResponse.body.bookingId).toBeTruthy();
  
  // 3. Verify quote was stored with pickupDateTime
  const storedQuote = await getQuote(quote.quoteId);
  expect(storedQuote.pickupDateTime).toBeInstanceOf(Date);
  expect(storedQuote.pickupDateTime.toISOString()).toBe(pickupTime);
});
```

## Implementation Priority

1. **High Priority** (Prevent production issues):
   - Quote creation requires pickup time
   - Quote validation includes pickupDateTime
   - Firebase Admin SDK usage in API routes

2. **Medium Priority** (Improve reliability):
   - Email configuration validation
   - Full booking flow integration test
   - Backward compatibility tests

3. **Low Priority** (Nice to have):
   - Performance tests
   - Load tests
   - Edge case handling

## Files to Create

- `tests/integration/quote-api.test.ts` - Quote API tests
- `tests/integration/booking-submit-api.test.ts` - Booking submit tests
- `tests/integration/email-config.test.ts` - Email configuration tests
- `tests/e2e/full-booking-flow.test.ts` - End-to-end booking flow

## Notes

- Use Playwright for E2E tests
- Use Vitest for integration/unit tests
- Mock external services (SendGrid, Gmail) in tests
- Use Firebase emulators for database tests
- Test both success and failure paths

