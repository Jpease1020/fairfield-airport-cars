/**
 * Critical User Flow Tests
 *
 * This directory contains integration tests for the core business flows.
 * These tests should run on every push to catch breaking changes.
 *
 * Test Files:
 * -----------
 * 1. complete-booking-flow.test.ts
 *    - Quote generation
 *    - Booking submission with payment
 *    - Confirmation notifications (email, SMS)
 *    - Admin notifications
 *
 * 2. cancellation-refund-flow.test.ts
 *    - Refund calculation (100%/>24h, 50%/3-24h, 0%/<3h)
 *    - Booking status updates
 *    - Customer notifications
 *    - Calendar event deletion
 *
 * 3. time-slot-locking.test.ts
 *    - Lock acquisition during checkout
 *    - Double-booking prevention
 *    - Lock expiration
 *    - Buffer time enforcement
 *
 * 4. ride-experience.test.ts
 *    - Customer: view booking, track driver, see status
 *    - Driver: start tracking, update location, complete ride
 *    - Post-ride: feedback submission
 *
 * Running Tests:
 * --------------
 * All flow tests: npx vitest run tests/integration/flows/
 * Specific test:  npx vitest run tests/integration/flows/complete-booking-flow.test.ts
 *
 * These tests mock external services (Square, Twilio, etc.) but test
 * the actual route handlers and business logic.
 */

export {};
