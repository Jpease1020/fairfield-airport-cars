# 🎯 Layout Tests Documentation

## Overview

The layout tests verify that our perfected pages are working correctly with the new design system. These tests ensure:

- ✅ **Design System Compliance**: All pages use `UnifiedLayout` and design system components
- ✅ **No Inline Styles**: Zero inline styles present on any page
- ✅ **Responsive Design**: Pages work correctly on mobile and tablet
- ✅ **Component Usage**: Proper use of `GridSection`, `InfoCard`, and other design system components

## Test Categories

### 1. Public Pages
Tests all public-facing pages:
- Homepage (`/`)
- About (`/about`)
- Help (`/help`)
- Terms (`/terms`)
- Privacy (`/privacy`)
- Portal (`/portal`)
- Cancel (`/cancel`)
- Success (`/success`)

### 2. Booking Pages
Tests booking-related pages:
- Book page (`/book`)
- Booking form components

### 3. Status and Feedback Pages
Tests dynamic pages:
- Status page (`/status/[id]`)
- Feedback page (`/feedback/[id]`)

### 4. Admin Pages
Tests all admin pages:
- Admin login (`/admin/login`)
- Admin dashboard (`/admin`)
- Bookings management (`/admin/bookings`)
- Drivers management (`/admin/drivers`)
- Feedback management (`/admin/feedback`)
- Comments management (`/admin/comments`)
- Promos management (`/admin/promos`)
- Costs management (`/admin/costs`)
- Help management (`/admin/help`)

### 5. CMS Pages
Tests CMS management pages:
- CMS main (`/admin/cms`)
- Business settings (`/admin/cms/business`)
- Colors management (`/admin/cms/colors`)
- Pages management (`/admin/cms/pages`)
- Pricing management (`/admin/cms/pricing`)

### 6. Design System Compliance
Comprehensive tests that verify:
- All pages use `UnifiedLayout` (no old layout components)
- Zero inline styles present
- All pages use design system components

### 7. Responsive Design
Tests responsive behavior:
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- No horizontal scrolling issues

## Running Tests

### Quick Run
```bash
npm run test:layout
```

### With Auto-Server Start
```bash
npm run test:layout:run
```

### Individual Test Categories
```bash
# Public pages only
npx playwright test tests/e2e/simple-page-layout-tests.spec.ts --grep "Public Pages"

# Admin pages only
npx playwright test tests/e2e/simple-page-layout-tests.spec.ts --grep "Admin Pages"

# Design system compliance only
npx playwright test tests/e2e/simple-page-layout-tests.spec.ts --grep "Design System Compliance"
```

## What Each Test Verifies

### Page Load Tests
- ✅ Page loads without errors
- ✅ Correct page title
- ✅ Main content is visible
- ✅ Design system components present
- ✅ No inline styles

### Design System Compliance Tests
- ✅ No old layout components (`UniversalLayout`, `LayoutEnforcer`)
- ✅ Uses `UnifiedLayout`
- ✅ Uses design system components (`GridSection`, `InfoCard`)
- ✅ Zero inline styles

### Responsive Design Tests
- ✅ Content visible on mobile/tablet
- ✅ No horizontal scrolling issues
- ✅ Proper viewport handling

## Test Coverage

### Pages Tested (24 total)
1. `/` - Homepage
2. `/about` - About page
3. `/help` - Help page
4. `/terms` - Terms page
5. `/privacy` - Privacy page
6. `/portal` - Portal page
7. `/cancel` - Cancel page
8. `/success` - Success page
9. `/book` - Book page
10. `/admin/login` - Admin login
11. `/admin` - Admin dashboard
12. `/admin/bookings` - Bookings management
13. `/admin/drivers` - Drivers management
14. `/admin/feedback` - Feedback management
15. `/admin/comments` - Comments management
16. `/admin/promos` - Promos management
17. `/admin/costs` - Costs management
18. `/admin/help` - Help management
19. `/admin/cms` - CMS main
20. `/admin/cms/business` - Business settings
21. `/admin/cms/colors` - Colors management
22. `/admin/cms/pages` - Pages management
23. `/admin/cms/pricing` - Pricing management

### Test Categories (7 total)
1. Public Pages (8 tests)
2. Booking Pages (2 tests)
3. Status and Feedback Pages (2 tests)
4. Admin Pages (8 tests)
5. CMS Pages (5 tests)
6. Design System Compliance (3 tests)
7. Responsive Design (2 tests)

## Expected Results

When all tests pass, you should see:
- ✅ **30+ individual page tests** passing
- ✅ **Zero inline styles** found
- ✅ **All pages using UnifiedLayout**
- ✅ **Responsive design working** on mobile/tablet
- ✅ **Design system components** properly used

## Troubleshooting

### Common Issues

1. **Dev server not running**
   ```bash
   npm run dev:clean
   ```

2. **Tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Check dev server is responsive

3. **Missing design system components**
   - Verify CSS classes are applied
   - Check component imports

4. **Inline styles found**
   - Remove any `style={{...}}` attributes
   - Use CSS classes instead

### Debug Mode
```bash
# Run with UI for debugging
npx playwright test tests/e2e/simple-page-layout-tests.spec.ts --ui

# Run with headed browser
npx playwright test tests/e2e/simple-page-layout-tests.spec.ts --headed
```

## Integration with CI/CD

These tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Run Layout Tests
  run: |
    npm run dev:clean &
    sleep 10
    npm run test:layout
```

## Maintenance

### Adding New Pages
When adding new pages, update the test file:
1. Add page URL to the appropriate test category
2. Add specific page test if needed
3. Update the comprehensive compliance tests

### Updating Design System
When updating the design system:
1. Update test expectations
2. Verify new components are tested
3. Update responsive design tests if needed

## Performance Notes

- Tests run in parallel for efficiency
- Each page test is independent
- Comprehensive tests run all pages for compliance
- Responsive tests use multiple viewports

## Success Metrics

- **100% page coverage** of perfected pages
- **Zero inline styles** across all pages
- **100% UnifiedLayout usage**
- **Responsive design** working on all devices
- **Design system compliance** maintained 