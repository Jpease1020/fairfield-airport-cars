# Pre-Production Checklist - Service Area & VIP Exception System

## 🔴 CRITICAL - Environment Variables

### Required New Variable
- [ ] **`BOOKING_EXCEPTION_SECRET`** - Set in Vercel environment variables
  - Generate a strong secret: `openssl rand -hex 32` or use a password generator
  - **IMPORTANT**: This is server-side only - never use `NEXT_PUBLIC_` prefix
  - Store securely in Vercel → Settings → Environment Variables
  - Apply to: Production, Preview, Development

### Existing Variables (Verify They're Set)
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `GOOGLE_MAPS_SERVER_API_KEY` (required for quote API)

## 🟡 Service Area Configuration

### Current Settings (in `src/lib/services/service-area-validation.ts`)
- **Service Centers**: Newtown, Stamford, Fairfield, Westport (CT)
- **Normal Radius**: 25 miles (standard self-service bookings)
- **Extended Radius**: 40 miles (soft-block area)

### Action Items
- [ ] **Verify service area centers are correct** for your actual coverage
- [ ] **Verify normal/extended radii** match your business needs
- [ ] **Test with real addresses** to ensure boundaries are correct
- [ ] Consider if you need to add/remove service centers

### Supported Airports (in `src/utils/constants.ts`)
- [ ] Verify all airports are correct:
  - JFK, LGA, EWR (NYC)
  - BDL (Hartford), HVN (New Haven) - **NEW**
  - HPN (Westchester County)
  - BDR, ISP (existing)

## 🟢 Database Schema

### No Migration Required
- Firestore is schema-less, so new fields are automatically supported:
  - `status: 'requires_approval'` (new booking status)
  - `requiresApproval: boolean`
  - `exceptionReason: string`
  - `approvedAt: timestamp`
  - `rejectedAt: timestamp`
  - `rejectionReason: string`
  - `isVip: boolean` (on user documents)

### Action Items
- [ ] **No database migration needed** - fields will be added automatically when used
- [ ] Existing bookings will continue to work (backward compatible)

## 🧪 Testing Checklist

### Service Area Validation
- [ ] Test valid trip: Fairfield, CT → JFK (should succeed)
- [ ] Test missing airport: Fairfield → Fairfield (should show MISSING_AIRPORT_ENDPOINT)
- [ ] Test out-of-area: FL → TX (should show OUT_OF_SERVICE_HARD)
- [ ] Test extended area: Slightly outside normal radius (should show OUT_OF_SERVICE_SOFT)

### VIP Exception System
- [ ] Test exception booking creation with valid exception code
- [ ] Test exception booking creation with invalid exception code (should fail)
- [ ] Test admin approval workflow (approve exception booking)
- [ ] Test admin rejection workflow (reject with reason)
- [ ] Verify exception bookings appear in "Requires Approval" filter

### Admin UI
- [ ] Verify "Requires Approval" appears in status filter
- [ ] Verify Approve/Reject buttons show for `requires_approval` bookings
- [ ] Verify rejection modal works correctly
- [ ] Verify exception metadata displays in booking table
- [ ] Verify dashboard widget shows pending approvals count

## 📋 Code Review Items

### Security
- [x] Exception code is server-side only (not exposed in client)
- [x] Admin pages are protected by authentication
- [x] Exception code validation happens server-side

### Error Handling
- [x] Service area errors return proper error codes
- [x] Client-side error messages are user-friendly
- [x] Logging is in place for blocked trips and exceptions

### Backward Compatibility
- [x] Existing bookings continue to work
- [x] New status type doesn't break existing code
- [x] API responses are backward compatible

## 🚀 Deployment Steps

1. **Set Environment Variable**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   BOOKING_EXCEPTION_SECRET=<your-secret-code>
   ```

2. **Verify Service Area Settings**
   - Review `src/lib/services/service-area-validation.ts`
   - Adjust centers/radii if needed before deploying

3. **Deploy to Production**
   ```bash
   git add .
   git commit -m "Add service area validation and VIP exception system"
   git push origin main
   ```

4. **Post-Deployment Verification**
   - [ ] Test quote API with valid trip
   - [ ] Test quote API with invalid trip (should block)
   - [ ] Test exception booking creation (admin only)
   - [ ] Verify admin dashboard shows pending approvals
   - [ ] Test approval/rejection workflow

## ⚠️ Important Notes

### Service Area Enforcement
- **Active immediately** after deployment
- All new bookings will be validated against service area rules
- Existing bookings are not affected
- Exception bookings bypass validation but require approval

### Exception Code Security
- **Never commit** the exception code to git
- **Never use** `NEXT_PUBLIC_` prefix for the secret
- Store only in Vercel environment variables
- Share the code securely with Gregg (not in email/chat)

### Monitoring
- Check logs for `[SERVICE_AREA]` entries to monitor blocked trips
- Check logs for `[EXCEPTION_BOOKING]` entries to track exception usage
- Review `requires_approval` bookings regularly in admin dashboard

## 📝 Documentation Updates

- [x] Service area rules documented in `docs/business_rules/QUOTING_SYSTEM.md`
- [x] Environment variable documented in `VERCEL_ENV_VARS.md`
- [ ] Consider adding user-facing help text about service area (optional)

## ✅ Final Checks

- [ ] All tests pass (run `npm test`)
- [ ] No linter errors
- [ ] Environment variable set in Vercel
- [ ] Service area centers verified
- [ ] Exception code shared securely with Gregg
- [ ] Admin knows how to use approval workflow
- [ ] Ready to deploy!

