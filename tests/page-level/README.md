# Page-Level Component Tests

This directory contains focused tests for individual pages and components to help with debugging and ensure each piece works correctly in isolation.

## Test Structure

### `booking-form-components.test.ts`
Tests the booking form components individually:
- **ContactInfoPhase**: Form validation, input handling, CMS integration
- **TripDetailsPhase**: Address editing, price recalculation
- **PaymentPhase**: Payment form rendering, amount calculation

### `auth-pages.test.ts`
Tests authentication pages:
- **Login Page**: Form validation, error handling, navigation
- **Register Page**: Form validation, password confirmation, navigation
- **Forgot Password Page**: Form validation, success messages

### `success-page.test.ts`
Tests the booking success page:
- **Success Display**: Booking confirmation, details display
- **Error Handling**: Missing/invalid booking IDs
- **Navigation**: Action buttons, tracking links

### `home-page.test.ts`
Tests the home page and quick booking form:
- **Quick Booking Form**: Price calculation, form submission
- **Page Sections**: Hero, features, FAQ, about
- **Navigation**: CTA buttons, responsive design

### `dashboard-pages.test.ts`
Tests dashboard and user pages:
- **Bookings Page**: Empty state, navigation
- **Profile Page**: User info display, editing
- **Payments Page**: Payment methods, empty state
- **Authentication**: Protected route handling

## Running the Tests

### Run All Page-Level Tests
```bash
npm run test:page-level
```

### Run with UI (Interactive Mode)
```bash
npm run test:page-level:ui
```

### Run Specific Test File
```bash
npx playwright test tests/page-level/booking-form-components.test.ts --config tests/page-level/playwright.config.ts
```

### Run Specific Test
```bash
npx playwright test tests/page-level/booking-form-components.test.ts --config tests/page-level/playwright.config.ts -g "ContactInfoPhase"
```

## Test Features

### CMS Integration Testing
All tests check for malformed CMS strings that shouldn't appear in the UI:
- `[LABEL]` patterns
- `form name label` patterns
- Uppercase fallback patterns

### Form Validation Testing
Tests verify that:
- Required fields are properly validated
- Form inputs work correctly
- Error states are handled properly
- Success states are displayed correctly

### Navigation Testing
Tests verify that:
- Links navigate to correct pages
- Form submissions redirect properly
- Protected routes redirect to login
- Back buttons work correctly

### Responsive Design Testing
Tests verify that:
- Components work on mobile devices
- Navigation adapts to different screen sizes
- Content remains accessible

## Debugging Benefits

These page-level tests help with debugging by:

1. **Isolating Issues**: Each component is tested in isolation, making it easier to identify specific problems
2. **Faster Feedback**: Tests run quickly and provide immediate feedback on component functionality
3. **CMS Validation**: Automatically detect malformed CMS strings that shouldn't be saved to the database
4. **Form Validation**: Ensure all form inputs and validation work correctly
5. **Navigation Testing**: Verify that all links and redirects work as expected

## Test Data

Tests use mock data and authentication to simulate real user interactions without requiring actual backend services. This makes tests:
- Fast and reliable
- Independent of external services
- Easy to debug and maintain

## Adding New Tests

When adding new page-level tests:

1. **Follow the naming convention**: `[component-name].test.ts`
2. **Include CMS validation**: Check for malformed strings
3. **Test form validation**: Ensure inputs work correctly
4. **Test navigation**: Verify links and redirects
5. **Use data-testid attributes**: For reliable element selection
6. **Mock authentication**: For protected pages
7. **Test error states**: Ensure graceful error handling
