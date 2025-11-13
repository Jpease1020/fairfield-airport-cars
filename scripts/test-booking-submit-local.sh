#!/bin/bash

# Local Booking Submit API Test Script
# Tests the booking submit endpoint locally to validate it will work in production

set -e

echo "🧪 Testing Booking Submit API Locally"
echo "======================================"
echo ""

# Check if emulators are running
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
  echo "⚠️  Firebase Emulator UI not accessible at http://localhost:4000"
  echo "   Make sure emulators are running: npm run firebase:emulators"
  echo ""
fi

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "⚠️  Dev server not accessible at http://localhost:3000"
  echo "   Make sure dev server is running: npm run dev"
  echo ""
fi

# Set BASE_URL for local testing
export BASE_URL=${BASE_URL:-http://localhost:3000}

echo "📍 Testing against: $BASE_URL"
echo ""

# Run the Playwright test
echo "🚀 Running booking submit API tests..."
echo ""

npx playwright test --config config/playwright.config.ts \
  --project=chromium \
  --workers=1 \
  tests/e2e/booking-submit-api.spec.ts

echo ""
echo "✅ Local booking submit API tests complete!"
echo ""
echo "📊 Summary:"
echo "   - Firebase Admin initialization check"
echo "   - Transaction timeout prevention"
echo "   - Full booking flow validation"
echo "   - Error handling verification"
echo ""
echo "If all tests passed, the submit endpoint should work in production! 🎉"

