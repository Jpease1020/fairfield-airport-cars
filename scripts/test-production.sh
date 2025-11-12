#!/bin/bash

# Simple production booking test using curl
# This tests the production API without needing Playwright

BASE_URL="${BASE_URL:-https://fairfield-airport-cars.vercel.app}"

echo "🧪 Testing Production Booking API: $BASE_URL"
echo ""

# Test 1: Basic Health Check
echo "1️⃣ Testing basic health check..."
HEALTH=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  echo "   ✅ Basic health check passed"
else
  echo "   ❌ Basic health check failed"
  echo "   Response: $HEALTH"
fi
echo ""

# Test 2: Booking Flow Health Check
echo "2️⃣ Testing booking flow health check..."
BOOKING_HEALTH=$(curl -s "$BASE_URL/api/health/booking-flow")
if echo "$BOOKING_HEALTH" | grep -q '"status":"healthy"'; then
  echo "   ✅ Booking flow health check passed"
  # Check Firebase status
  if echo "$BOOKING_HEALTH" | grep -q '"firebase":{"status":"pass"'; then
    echo "   ✅ Firebase Admin initialized"
  else
    echo "   ❌ Firebase Admin NOT initialized!"
    echo "   Check Vercel environment variables:"
    echo "   - FIREBASE_PROJECT_ID"
    echo "   - FIREBASE_PRIVATE_KEY"
    echo "   - FIREBASE_CLIENT_EMAIL"
  fi
else
  echo "   ❌ Booking flow health check failed"
  echo "   Response: $BOOKING_HEALTH"
fi
echo ""

# Test 3: Quote API
echo "3️⃣ Testing quote API..."
QUOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/booking/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Fairfield Station, Fairfield, CT",
    "destination": "JFK Airport, Queens, NY",
    "pickupCoords": {"lat": 41.1408, "lng": -73.2613},
    "dropoffCoords": {"lat": 40.6413, "lng": -73.7781},
    "fareType": "personal",
    "pickupDateTime": "'$(date -u -v+1d +%Y-%m-%dT%H:%M:%SZ)'"
  }')

if echo "$QUOTE_RESPONSE" | grep -q '"fare"'; then
  FARE=$(echo "$QUOTE_RESPONSE" | grep -o '"fare":[0-9.]*' | cut -d: -f2)
  echo "   ✅ Quote API working - Fare: \$$FARE"
else
  echo "   ❌ Quote API failed"
  echo "   Response: $QUOTE_RESPONSE"
fi
echo ""

# Test 4: Booking Endpoint (should return 400 for empty data, not 500)
echo "4️⃣ Testing booking submit endpoint..."
SUBMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/booking/submit" \
  -H "Content-Type: application/json" \
  -d '{}')

STATUS=$(echo "$SUBMIT_RESPONSE" | grep -o '"error":"[^"]*"' | head -1)
if echo "$SUBMIT_RESPONSE" | grep -q "Firebase Admin"; then
  echo "   ❌ CRITICAL: Firebase Admin not initialized!"
  echo "   Response: $SUBMIT_RESPONSE"
elif echo "$SUBMIT_RESPONSE" | grep -q '"error"'; then
  echo "   ✅ Booking endpoint accessible (validation error expected)"
else
  echo "   ⚠️  Unexpected response: $SUBMIT_RESPONSE"
fi
echo ""

echo "📊 Summary: Check output above for any ❌ errors"
echo ""
echo "If Firebase Admin is not initialized, set these in Vercel:"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_PRIVATE_KEY (full key with \\n for newlines)"
echo "  - FIREBASE_CLIENT_EMAIL"

