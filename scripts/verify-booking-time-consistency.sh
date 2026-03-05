#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAILURES=0

ok() {
  printf "PASS  %s\n" "$1"
}

fail() {
  printf "FAIL  %s\n" "$1"
  FAILURES=$((FAILURES + 1))
}

check_contains() {
  local file="$1"
  local pattern="$2"
  local label="$3"
  if rg -q "$pattern" "$file"; then
    ok "$label"
  else
    fail "$label (missing pattern: $pattern in $file)"
  fi
}

check_absent() {
  local file="$1"
  local pattern="$2"
  local label="$3"
  if rg -q "$pattern" "$file"; then
    fail "$label (unexpected pattern: $pattern in $file)"
  else
    ok "$label"
  fi
}

echo "== Static Time-Label Consistency Checks =="

check_contains "src/lib/email-templates/confirmation.ts" "Pickup Time:" "Confirmation email uses Pickup Time label"
check_contains "src/lib/email-templates/booking-verification.ts" "Pickup Time:" "Verification email uses Pickup Time label"
check_contains "src/lib/email-templates/driver-notification.ts" "Flight Time \\(as provided\\):" "Driver email uses explicit Flight Time label"
check_contains "src/lib/email-templates/confirmation.ts" "Flight Time \\(as provided\\):" "Customer confirmation email includes explicit Flight Time label"

check_absent "src/lib/email-templates/confirmation.ts" "Date & Time:" "Confirmation email has no generic Date & Time label"
check_absent "src/lib/email-templates/booking-verification.ts" "Date & Time:" "Verification email has no generic Date & Time label"
check_absent "src/lib/email-templates/driver-notification.ts" "Arrival:" "Driver email has no ambiguous Arrival label"

check_contains "src/app/api/notifications/send-confirmation/route.ts" "Pickup time:" "Customer confirmation SMS includes Pickup time label"
check_contains "src/app/api/booking/cancel-booking/route.ts" "Pickup time:" "Cancellation SMS includes Pickup time label"
check_contains "src/lib/services/booking-orchestrator.ts" "Pickup time:" "Booking orchestrator SMS/Admin text includes Pickup time label"

check_contains "src/lib/services/email-service.ts" "formatBusinessDateTimeWithZone" "Emails format pickup timestamps with timezone"
check_contains "src/lib/services/driver-notification-service.ts" "formatBusinessDateTimeWithZone" "Driver push formats pickup timestamps with timezone"

echo
echo "== CMS Keys To Review =="
cat <<'EOF'
booking-detail-datetime -> Pickup Time:
paymentPhase-datetime -> Pickup Time:
dateTimeLabel -> Pickup Time:
booking-pickup_datetime-label -> Pickup Time:
tracking-pickupTime -> Pickup Time
tripDetailsPhase-datetimeLabel -> Pickup Date & Time
EOF

echo
if [[ "$FAILURES" -gt 0 ]]; then
  echo "Completed with $FAILURES failure(s)."
  exit 1
fi

echo "All static checks passed."
echo "Next: run docs/qa/booking-time-consistency-checklist.md against staging."
