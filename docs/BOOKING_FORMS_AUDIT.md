# Booking Forms Audit - Consistency Check

## Forms Identified

### 1. HeroCompactBookingForm (Homepage Quick Form)
**Location:** `src/design/components/content-sections/HeroCompactBookingForm.tsx`

**Components Used:**
- ✅ `LocationInput` - Uses bounds restriction (via LocationInput component)
- ✅ `useFareCalculation` - Uses shared hook
- ✅ `BookingProvider` - Uses shared provider
- ✅ `useBookingAvailability` - Uses shared hook
- ✅ `DateTimePicker` - Uses shared component

**Autocomplete:**
- ✅ Uses `LocationInput` which applies bounds for non-airport inputs
- ❌ Does NOT use `restrictToAirports` prop (should it?)

**Service Area Validation:**
- ✅ Validation happens via `useFareCalculation` → quote API → service area validation

---

### 2. LocationInputSection (Main Booking Form)
**Location:** `src/components/booking/trip-details/LocationInputSection.tsx`
**Used in:** `TripDetailsPhase` → `BookingFormPhases` → `/book` page

**Components Used:**
- ✅ `LocationInput` - Uses bounds restriction (via LocationInput component)
- ✅ `BookingProvider` - Uses shared provider
- ✅ `useFareCalculation` - Used in parent `TripDetailsPhase`
- ✅ `DateTimePicker` - Used in parent `TripDetailsPhase`

**Autocomplete:**
- ✅ Uses `LocationInput` with `restrictToAirports` prop based on swap state
- ✅ Pickup: `restrictToAirports={pickupIsAirport}` (when swapped, pickup is airport)
- ✅ Dropoff: `restrictToAirports={dropoffIsAirport}` (when not swapped, dropoff is airport)

**Service Area Validation:**
- ✅ Validation happens via `useFareCalculation` → quote API → service area validation

---

### 3. CreateExceptionBookingPage (Admin Exception Form)
**Location:** `src/app/(admin)/admin/bookings/create-exception/page.tsx`

**Components Used:**
- ✅ `LocationInput` - Uses bounds restriction (via LocationInput component)
- ❌ `BookingProvider` - NOT used (uses local state)
- ❌ `useFareCalculation` - NOT used (manual fare input)
- ✅ `DateTimePicker` - Uses shared component

**Autocomplete:**
- ❌ Does NOT use `restrictToAirports` prop on either LocationInput
- ❌ No indication which field should be airport vs non-airport

**Service Area Validation:**
- ⚠️ Bypasses validation (uses exception code)
- ✅ But should still have proper autocomplete bounds

---

## Issues Found

### Issue 1: Exception Form Missing `restrictToAirports`
**Problem:** Exception form doesn't specify which LocationInput should restrict to airports.

**Impact:** 
- Users can select non-airport locations in airport field
- Autocomplete doesn't filter properly

**Fix Needed:**
- Add `restrictToAirports={true}` to dropoff LocationInput (assuming dropoff is airport)
- Or add logic to determine which field is airport

### Issue 2: Exception Form Doesn't Use Shared Hooks
**Problem:** Exception form uses local state instead of BookingProvider.

**Impact:**
- Code duplication
- Inconsistent behavior
- Harder to maintain

**Fix Needed:**
- Consider using BookingProvider (but may be intentional for admin form)
- At minimum, ensure LocationInput usage is consistent

### Issue 3: Hero Form Doesn't Use `restrictToAirports`
**Problem:** Hero form doesn't specify which field should be airport.

**Impact:**
- Autocomplete doesn't filter airports properly
- Users might select non-airport in airport field

**Fix Needed:**
- Add `restrictToAirports={true}` to dropoff LocationInput (assuming dropoff is airport)

---

## Consistency Checklist

| Feature | Hero Form | Main Form | Exception Form | Status |
|---------|-----------|-----------|---------------|--------|
| LocationInput component | ✅ | ✅ | ✅ | ✅ Consistent |
| Autocomplete bounds | ✅ | ✅ | ✅ | ✅ Consistent (via LocationInput) |
| restrictToAirports prop | ❌ | ✅ | ❌ | ❌ **INCONSISTENT** |
| BookingProvider | ✅ | ✅ | ❌ | ⚠️ Intentional (admin form) |
| useFareCalculation | ✅ | ✅ | ❌ | ⚠️ Intentional (manual fare) |
| Service area validation | ✅ | ✅ | ⚠️ Bypassed | ⚠️ Intentional (exception) |
| DateTimePicker | ✅ | ✅ | ✅ | ✅ Consistent |

---

## Recommendations

### High Priority
1. **Add `restrictToAirports` to Hero Form** - Dropoff should be airport
2. **Add `restrictToAirports` to Exception Form** - Dropoff should be airport

### Medium Priority
3. Consider standardizing exception form to use BookingProvider (if it makes sense)
4. Add comments/documentation about which field is airport in each form

### Low Priority
5. Consider creating a shared form component for location inputs
6. Add validation hints about airport requirement in UI

---

## Current Autocomplete Bounds Implementation

All forms use `LocationInput` which now has:
- ✅ Bounds restriction for non-airport inputs (40.5°N to 42.0°N, -74.5°W to -72.5°W)
- ✅ No bounds for airport inputs (shows all airports, filtered by type)
- ✅ Applied automatically based on `restrictToAirports` prop

**This is consistent across all forms!** ✅

