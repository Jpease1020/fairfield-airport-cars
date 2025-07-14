# Visual Testing with Playwright

## Overview
Visual testing ensures that your UI components and pages look correct across different browsers, devices, and screen sizes. This guide covers how to use Playwright for visual testing in the Fairfield Airport Cars application.

## Setup

### Installation
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Configuration
The `playwright.config.ts` file is configured to:
- Test across multiple browsers (Chrome, Firefox, Safari)
- Test mobile viewports (iPhone, Pixel)
- Take screenshots on test failures
- Run tests in parallel
- Start the development server automatically

## Running Visual Tests

### Basic Commands
```bash
# Run all tests
npm run test

# Run only visual tests
npm run test:visual

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Update snapshots after UI changes
npm run test:update
```

### Test Structure
```typescript
test('page should match snapshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## What We Test

### Page-Level Snapshots
- **Homepage** - Main landing page
- **Booking Form** - Customer booking interface
- **Admin Dashboard** - Administrative interface
- **AI Assistant** - AI chat interface
- **Color Scheme Editor** - Theme customization

### Component-Level Snapshots
- **Booking Cards** - Individual booking displays
- **Status Badges** - Booking status indicators
- **Navigation** - Admin navigation menu
- **Forms** - Input forms and validation

### Responsive Design
- **Mobile Viewports** - iPhone and Pixel layouts
- **Desktop Viewports** - Chrome, Firefox, Safari
- **Tablet Viewports** - Medium screen sizes

### Interactive States
- **Loading States** - Spinners and progress indicators
- **Error States** - Validation errors and error messages
- **Hover States** - Button and link interactions
- **Autocomplete** - Address suggestion dropdowns

## Best Practices

### 1. Stable Selectors
Use data attributes for reliable element selection:
```typescript
await page.waitForSelector('[data-testid="booking-card"]');
await expect(page.locator('[data-testid="booking-card"]')).toHaveScreenshot();
```

### 2. Wait for Stability
Ensure the page is fully loaded before taking screenshots:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('form');
```

### 3. Handle Dynamic Content
For content that changes (dates, times, user data):
```typescript
// Mock or set specific data before taking screenshots
await page.evaluate(() => {
  // Set fixed date/time for consistent screenshots
  document.querySelector('.date').textContent = '2024-12-25';
});
```

### 4. Test Different States
```typescript
test('form validation errors', async ({ page }) => {
  await page.goto('/book');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.text-red-500');
  await expect(page).toHaveScreenshot('validation-errors.png');
});
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Visual Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:visual
```

### Screenshot Comparison
- **Baseline images** stored in `tests/screenshots/`
- **Automatic comparison** on each test run
- **Visual diffs** generated for failed tests
- **Approval workflow** for new/changed screenshots

## Troubleshooting

### Common Issues

#### Screenshots Don't Match
1. **Check for dynamic content** - Dates, times, user data
2. **Verify viewport size** - Ensure consistent screen sizes
3. **Wait for animations** - Let transitions complete
4. **Check for flaky elements** - Loading states, spinners

#### Tests Fail Intermittently
1. **Increase wait times** - Network delays, slow rendering
2. **Add retry logic** - For flaky external dependencies
3. **Mock external services** - Google Maps, payment APIs
4. **Use stable selectors** - Avoid text-based selectors

#### Mobile Tests Fail
1. **Check viewport size** - Ensure correct mobile dimensions
2. **Test touch interactions** - Tap vs click differences
3. **Verify responsive design** - CSS media queries
4. **Check device pixel ratio** - High DPI displays

### Debugging Tips

#### View Screenshots
```bash
# Open test results
npx playwright show-report
```

#### Debug Test Failures
```bash
# Run with headed mode to see what's happening
npm run test:headed

# Run specific test with debugging
npx playwright test visual.spec.ts --headed --debug
```

#### Update Snapshots
```bash
# After intentional UI changes
npm run test:update
```

## Advanced Features

### Custom Screenshot Options
```typescript
await expect(page).toHaveScreenshot('custom.png', {
  fullPage: true,           // Capture entire page
  clip: { x: 0, y: 0, width: 800, height: 600 }, // Crop
  omitBackground: true,      // Transparent background
  scale: 'css',             // CSS scaling
});
```

### Multiple Viewports
```typescript
test('responsive design', async ({ page }) => {
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' },
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`);
  }
});
```

### Component Testing
```typescript
test('booking card component', async ({ page }) => {
  await page.goto('/booking/test-id');
  const card = page.locator('[data-testid="booking-card"]');
  await expect(card).toHaveScreenshot('booking-card.png');
});
```

## Integration with Design System

### Color Scheme Testing
```typescript
test('theme changes', async ({ page }) => {
  await page.goto('/admin/cms/colors');
  
  // Test different color schemes
  const themes = ['default', 'dark', 'custom'];
  for (const theme of themes) {
    await page.selectOption('select[name="theme"]', theme);
    await expect(page).toHaveScreenshot(`theme-${theme}.png`);
  }
});
```

### Accessibility Testing
```typescript
test('accessibility compliance', async ({ page }) => {
  await page.goto('/');
  
  // Test with screen reader mode
  await page.evaluate(() => {
    // Simulate screen reader navigation
  });
  
  await expect(page).toHaveScreenshot('accessibility-mode.png');
});
```

## Performance Considerations

### Optimizing Test Speed
1. **Parallel execution** - Run tests in parallel
2. **Selective testing** - Test only changed components
3. **Caching** - Cache browser downloads
4. **Minimal screenshots** - Only test critical paths

### Resource Management
1. **Browser reuse** - Share browser instances
2. **Memory cleanup** - Close pages after tests
3. **Network mocking** - Reduce external API calls
4. **Image optimization** - Compress screenshot files

## Future Enhancements

### Planned Features
- **Visual regression testing** - Automated comparison
- **Design token testing** - Verify design system compliance
- **Animation testing** - Capture motion and transitions
- **Cross-browser consistency** - Ensure identical rendering

### Integration Ideas
- **Design tool integration** - Figma, Sketch exports
- **Storybook integration** - Component-level testing
- **Performance testing** - Visual performance metrics
- **Accessibility testing** - WCAG compliance verification 