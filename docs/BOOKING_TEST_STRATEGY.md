# 🧪 Booking System - Comprehensive Test Strategy

## 📊 Test Coverage Overview

### ✅ Unit Tests (53 passing)
- Quote system expiration logic
- Fare calculation hooks
- Booking provider state management
- Fare display components
- Business logic validation

### ⚠️ Integration Tests (11 passing, 3 failing)
**Passing:**
- Health endpoint checks
- Quote system API
- Booking form flow rendering

**Failing:**
- Booking retrieval with nested structure
- Flight info handling
- Data accessibility without fallbacks

**Issue:** API endpoint `/api/booking/get-bookings-simple` appears to be missing or returning 404

---

## 🎯 E2E Test Strategy

### Customer Flow Tests
**Location:** `tests/e2e/customer-booking-flow.spec.ts`

#### Test 1: Complete booking with all optional fields
**Steps:**
1. Enter pickup/dropoff locations
2. Select date & time
3. Calculate fare
4. Enter contact information
5. Review and submit payment
6. Add flight details
7. Verify booking confirmation

**Expected:**
- ✅ Booking created with booking ID
- ✅ All data saved to database
- ✅ Confirmation page displayed

#### Test 2: Booking without flight information
**Steps:**
1. Complete trip details
2. Enter contact info
3. Skip flight details
4. Complete booking

**Expected:**
- ✅ Booking created successfully
- ✅ Flight info is optional/null
- ✅ User can add flight info later

#### Test 3: Quote expiration handling
**Steps:**
1. Calculate fare
2. Wait 15+ minutes
3. Try to continue

**Expected:**
- ✅ Quote expires after 15 minutes
- ✅ User sees expiration message
- ✅ User must recalculate fare

#### Test 4: Fare breakdown display
**Steps:**
1. Enter trip details
2. Calculate fare
3. View fare breakdown

**Expected:**
- ✅ Base fare displayed
- ✅ Total fare calculated
- ✅ Currency formatting correct

#### Test 5: Field validation
**Steps:**
1. Try to submit without required fields
2. Enter invalid email
3. Enter invalid phone

**Expected:**
- ✅ Validation errors displayed
- ✅ Cannot proceed without valid data
- ✅ Clear error messages

---

### Admin Flow Tests
**Location:** `tests/e2e/admin-booking-management.spec.ts`

#### Test 1: View all bookings
**Steps:**
1. Login as admin
2. Navigate to bookings page
3. View bookings table

**Expected:**
- ✅ All bookings displayed
- ✅ Stats cards visible
- ✅ Table is sortable

#### Test 2: Filter bookings by status
**Steps:**
1. Select status filter
2. Verify filtered results

**Expected:**
- ✅ Only matching status displayed
- ✅ Filter persists

#### Test 3: View individual booking details
**Steps:**
1. Click on booking
2. View details page

**Expected:**
- ✅ All booking data displayed
- ✅ Customer info visible
- ✅ Trip details accurate

#### Test 4: Update booking status
**Steps:**
1. Select booking
2. Change status
3. Save

**Expected:**
- ✅ Status updates in database
- ✅ Customer notified (if enabled)
- ✅ Status badge updates

#### Test 5: Assign driver (Gregg)
**Steps:**
1. Select pending booking
2. Assign driver
3. Confirm assignment

**Expected:**
- ✅ Gregg assigned as driver
- ✅ Booking status updates
- ✅ Assignment saved to database

#### Test 6: Handle booking conflicts
**Steps:**
1. View calendar
2. Identify conflicts
3. View conflict details

**Expected:**
- ✅ Conflicts highlighted
- ✅ 1-hour buffer enforced
- ✅ Alternate times suggested

#### Test 7: Driver status management
**Steps:**
1. View driver dashboard
2. Check Gregg's status
3. Update status

**Expected:**
- ✅ Status updates correctly
- ✅ Schedule reflects status
- ✅ Bookings updated

#### Test 8: Revenue tracking
**Steps:**
1. View dashboard
2. Check revenue metrics

**Expected:**
- ✅ Revenue calculated correctly
- ✅ Currency formatting
- ✅ Monthly totals accurate

#### Test 9: Cancel booking with policy
**Steps:**
1. Select booking
2. Initiate cancellation
3. View policy message
4. Confirm cancellation

**Expected:**
- ✅ Policy shown
- ✅ Cancellation fee calculated
- ✅ Status updated

#### Test 10: Status change notifications
**Steps:**
1. Update booking status
2. Enable notifications
3. Save

**Expected:**
- ✅ Customer notified
- ✅ Email/SMS sent
- ✅ Confirmation displayed

#### Test 11: Refresh bookings list
**Steps:**
1. View bookings
2. Click refresh
3. Verify data updates

**Expected:**
- ✅ Data refreshes
- ✅ New bookings appear
- ✅ Loading state shown

---

## 🐛 Known Issues to Fix

### 1. Integration Test Failures

**Problem:** `GET /api/booking/get-bookings-simple` returns 404

**Investigation:**
```bash
# Check if route exists
find src/app/api/booking -name "route.ts" -type f

# Expected location:
src/app/api/booking/get-bookings-simple/route.ts
```

**Fix:** Create missing route or update tests to use existing route

### 2. TypeScript Errors in Calendar Admin
**Files:**
- `src/components/calendar/GoogleCalendarConnect.tsx`
- `src/components/calendar/AvailabilityChecker.tsx`

**Issues:**
- Missing color token `error` in design system
- `style` prop not allowed on Box component
- Input `type="time"` not supported

**Fix:** 
- Use design system color tokens
- Use styled components instead of inline styles
- Use correct input type

### 3. PWA Component Errors
**File:** `src/components/pwa/ConnectionStatus.tsx`

**Issue:** Color token `error` doesn't exist

**Fix:** Use `colors.error[600]` or create missing token

---

## 🚀 Running the Tests

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Customer flow E2E
npm run test:e2e tests/e2e/customer-booking-flow.spec.ts

# Admin flow E2E
npm run test:e2e tests/e2e/admin-booking-management.spec.ts
```

### Run with Coverage
```bash
# Unit tests with coverage
npm run test:unit

# View coverage report
open coverage/index.html
```

---

## 📋 Test Data Requirements

### Customer Booking Flow
- **Pickup:** Fairfield CT, 123 Main St Fairfield CT
- **Dropoff:** JFK Airport, LGA Airport, EWR Airport
- **Fare Types:** personal, business
- **Contacts:** john.doe@example.com, jane.smith@example.com
- **Phones:** (555) 123-4567, (555) 987-6543

### Admin Management Flow
- **Driver:** Gregg (single driver)
- **Statuses:** pending, confirmed, in-progress, completed, cancelled
- **Booking IDs:** booking_timestamp_random

---

## ✅ Definition of "Working"

A booking flow is considered "working" when:

1. **Customer can:**
   - Enter trip details ✅
   - See fare quote ✅
   - Submit booking ✅
   - View confirmation ✅
   - Add flight info ✅
   - View booking in "My Bookings" ✅

2. **Admin can:**
   - View all bookings ✅
   - Filter by status ✅
   - View individual details ✅
   - Update status ✅
   - Assign driver ✅
   - Cancel bookings ✅
   - Track revenue ✅

3. **System:**
   - Creates booking in database ✅
   - Sends confirmations ✅
   - Enforces business rules ✅
   - Handles errors gracefully ✅
   - Updates in real-time ✅

---

## 🔄 Next Steps

1. **Fix integration test failures**
   - Investigate missing API route
   - Update tests to use correct endpoints

2. **Fix TypeScript errors**
   - Update calendar components
   - Fix PWA components
   - Resolve color token issues

3. **Run full E2E test suite**
   - Execute customer flow tests
   - Execute admin flow tests
   - Fix any failures

4. **Validate real booking creation**
   - Test with actual data
   - Verify database persistence
   - Check Firebase integration

5. **Performance testing**
   - Load testing with multiple users
   - Concurrent booking test
   - Quote expiration stress test








