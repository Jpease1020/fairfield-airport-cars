# 🔄 Component Migration Guide

## Overview
This guide shows how to migrate from the old component structure to the new clean, modular components.

## 1. HomePageUI Migration

### Before (376 lines)
```typescript
// src/components/HomePageUI.tsx - MASSIVE FILE
const HomePageContent = () => {
  // 376 lines of mixed concerns
  return (
    <>
      <HeroSection cmsData={pageCmsData} />
      <FeaturesSection cmsData={pageCmsData} />
      <FAQSection cmsData={pageCmsData} />
      // ... more inline components
    </>
  );
}
```

### After (35 lines)
```typescript
// src/components/HomePageUI.tsx - CLEAN COMPOSITION
const HomePageContent = () => {
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.home || null;
  
  return (
    <>
      <HeroSection cmsData={pageCmsData} />
      <Container padding="xl" variant="section">
        <Stack direction={{ xs: 'vertical', lg: 'horizontal' }} spacing="xl">
          <FeaturesSection cmsData={pageCmsData} />
          <FAQSection cmsData={pageCmsData} />
        </Stack>
      </Container>
      <FinalCTASection cmsData={pageCmsData} />
      <MobileStickyButton cmsData={pageCmsData} />
    </>
  );
}
```

### New Component Structure
```
src/components/home/
├── HeroSection.tsx           # Hero + quick booking
├── FeaturesSection.tsx       # Features grid
├── FAQSection.tsx           # FAQ content
├── MobileStickyButton.tsx   # Mobile CTA
└── FinalCTASection.tsx      # Final CTA
```

## 2. Booking Form Migration

### Before (356 lines)
```typescript
// src/app/(customer)/book/booking-form.tsx - MASSIVE FILE
function BookingFormContent({ booking, cmsData }) {
  // 356 lines of complex state management
  const { /* 20+ state variables */ } = useBookingForm();
  
  return (
    <Container>
      {/* Massive conditional rendering */}
    </Container>
  );
}
```

### After (52 lines)
```typescript
// src/app/(customer)/book/booking-form.tsx - CLEAN COMPOSITION
function BookingFormContent({ booking, cmsData }) {
  const { error, success } = useBookingFormContext();

  return (
    <BookingFormContainer>
      {error && <StatusMessage type="error" message={error} />}
      {success && <StatusMessage type="success" message={success} />}
      <BookingFormPhases cmsData={cmsData} />
    </BookingFormContainer>
  );
}
```

### New Component Structure
```
src/components/booking/
├── BookingFormProvider.tsx      # Context + state management
├── BookingFormContainer.tsx     # Layout wrapper
├── BookingFormPhases.tsx        # Phase switching logic
└── BookingSuccessConfirmation.tsx # Success state
```

## 3. Address Input Migration

### Before (Multiple Components)
```typescript
// OLD: Separate components
<LocationInput />           // Google Maps Autocomplete
<PlacesAutocomplete />      // Places API
```

### After (Unified Component)
```typescript
// NEW: Unified component with variants
<UnifiedAddressInput
  value={address}
  onChange={setAddress}
  onLocationSelect={handleLocationSelect}
  placeholder="Enter address"
  variant="autocomplete"    // or "places-api"
  data-testid="address-input"
/>
```

## 4. Error Handling Migration

### Before (Scattered Patterns)
```typescript
// OLD: Inconsistent error handling
const handleSubmit = async () => {
  try {
    setLoading(true);
    const result = await apiCall();
    setSuccess('Success!');
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### After (Standardized Hooks)
```typescript
// NEW: Standardized error handling
const { error, isLoading, handleAsync } = useErrorHandler({
  onError: (error) => console.error('API Error:', error),
  onSuccess: () => console.log('API Success')
});

const handleSubmit = () => {
  handleAsync(async () => {
    const result = await apiCall();
    setSuccess('Success!');
  });
};
```

## 5. Benefits Achieved

### ✅ Code Reduction
- **HomePageUI**: 376 → 35 lines (90% reduction)
- **BookingForm**: 356 → 52 lines (85% reduction)
- **Address Input**: 2 components → 1 unified component

### ✅ Improved Maintainability
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components can be used across different pages
- **Testability**: Smaller components are easier to test
- **Consistency**: Standardized patterns across the app

### ✅ Better Developer Experience
- **Clear Structure**: Easy to find and modify specific functionality
- **Type Safety**: Better TypeScript support with focused interfaces
- **Error Handling**: Consistent error patterns throughout the app
- **Documentation**: Self-documenting component structure

## 6. Migration Steps

### Step 1: Extract Components
1. Identify large components (>200 lines)
2. Extract logical sections into separate files
3. Create focused interfaces for each component

### Step 2: Standardize Patterns
1. Create reusable hooks for common patterns
2. Implement consistent error handling
3. Unify similar components (like address inputs)

### Step 3: Update Imports
1. Update import statements in parent components
2. Ensure all data-testid attributes are preserved
3. Test that functionality remains unchanged

### Step 4: Clean Up
1. Remove old component files
2. Update documentation
3. Run tests to ensure nothing is broken

## 7. Testing Strategy

### Before Migration
- Run existing tests to establish baseline
- Document current functionality

### During Migration
- Test each extracted component individually
- Ensure data-testid attributes are preserved
- Verify CMS data flow works correctly

### After Migration
- Run full test suite to ensure no regressions
- Test user flows end-to-end
- Verify performance hasn't degraded

## 8. Next Steps

1. **Apply to other large components** (PaymentPhase, etc.)
2. **Create more reusable hooks** (useCMSSection, etc.)
3. **Standardize more patterns** (loading states, validation, etc.)
4. **Add comprehensive documentation** for each component
5. **Create component library documentation**

---

**Result**: Clean, maintainable, testable code that's easier to understand and modify! 🎉
