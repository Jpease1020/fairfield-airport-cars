# API Route SDK Usage Audit

## 🚨 Problem
API routes using Firebase **Client SDK** (`firebase-server`) require authentication, but many are accessed without it (e.g., email links). This causes "Booking not found" errors.

## ✅ Solution
Use **Admin SDK** (`firebase-admin`) in all API routes - it bypasses security rules and works without authentication.

---

## 📊 Current Status

### ✅ Fixed (Using Admin SDK)
- ✅ `src/app/api/booking/get-bookings-simple/route.ts` - **FIXED**
- ✅ `src/app/api/booking/submit/route.ts` - Uses Admin SDK
- ✅ `src/app/api/booking/confirm/route.ts` - Uses Admin SDK
- ✅ `src/app/api/booking/[bookingId]/route.ts` - Uses Admin SDK
- ✅ `src/app/api/health/route.ts` - Uses Admin SDK
- ✅ `src/app/api/health/booking-flow/route.ts` - Uses Admin SDK

### ✅ All Fixed (Using Admin SDK)
- ✅ `src/app/api/payment/process-payment/route.ts` - **FIXED**
- ✅ `src/app/api/booking/attempts/route.ts` - **FIXED**
- ✅ `src/app/api/admin/cleanup-smoke-test/route.ts` - **FIXED**
- ✅ `src/app/api/admin/analytics/summary/route.ts` - **FIXED**
- ✅ `src/app/api/admin/analytics/interaction/route.ts` - **FIXED**
- ✅ `src/app/api/admin/analytics/error/route.ts` - **FIXED**

---

## 🧪 Test Coverage Gaps

### Missing Tests
1. **Unauthenticated Access Tests**
   - Test booking retrieval without authentication
   - Test email link access scenarios
   - Test public booking detail pages

2. **SDK Usage Tests**
   - Verify Admin SDK is used in all API routes
   - Test that client SDK is NOT used in server-side routes
   - Integration tests for unauthenticated flows

3. **Error Handling Tests**
   - Test "Booking not found" scenarios
   - Test authentication failures
   - Test permission denied errors

---

## 🔧 Migration Checklist

For each route using Client SDK:

- [ ] Replace `import { db } from '@/lib/utils/firebase-server'` with `import { getAdminDb } from '@/lib/utils/firebase-admin'`
- [ ] Replace `doc(db, ...)` with `db.collection(...).doc(...)`
- [ ] Replace `getDoc(docRef)` with `docRef.get()`
- [ ] Replace `getDocs(query)` with `query.get()`
- [ ] Replace `addDoc(collection, data)` with `collection.add(data)`
- [ ] Replace `updateDoc(docRef, data)` with `docRef.update(data)`
- [ ] Replace `deleteDoc(docRef)` with `docRef.delete()`
- [ ] Convert Firestore timestamps: `timestamp.toDate().toISOString()`
- [ ] Add error logging
- [ ] Add integration test for unauthenticated access

---

## 📝 Example Migration

### Before (Client SDK)
```typescript
import { db } from '@/lib/utils/firebase-server';
import { doc, getDoc } from 'firebase/firestore';

const docRef = doc(db, 'bookings', bookingId);
const docSnap = await getDoc(docRef);
```

### After (Admin SDK)
```typescript
import { getAdminDb } from '@/lib/utils/firebase-admin';

const db = getAdminDb();
const docRef = db.collection('bookings').doc(bookingId);
const docSnap = await docRef.get();
```

---

## 🎯 Priority Order

1. **HIGH**: `process-payment/route.ts` - Payment flow, user-facing
2. **MEDIUM**: `booking/attempts/route.ts` - May be accessed without auth
3. **LOW**: Admin routes (already protected, but should use Admin SDK for consistency)

---

## ✅ Definition of Done

- [ ] All API routes use Admin SDK
- [ ] All routes tested for unauthenticated access
- [ ] Integration tests cover email link scenarios
- [ ] No "Booking not found" errors from SDK issues
- [ ] Documentation updated

